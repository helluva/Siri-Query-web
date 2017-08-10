const express = require('express')
const path = require('path')
const handlebars = require('express-handlebars')
const request = require('request')
const bodyParser = require('body-parser')
const fs = require('fs')
const uuid = require('uuid/v4')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({limit: "100mb"}))
app.use(bodyParser.raw({limit: "100mb"}))

//setup endpoints

app.engine('.hbs', handlebars({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views/layouts')
}))

app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))


var queued_tasks = []
var completed_tasks = []
var rawtexts = {}
var waiting_for_server = false


//***********************
//client-facing endpoints
//***********************

//main HTML of the site
app.get('/', (request, response) => {
    response.render('home', {
        url: request.url
    })
})

//uploads an audio file though body["audio-base64"]. response["task-id"] is an identifier for the queued task.
//if body["raw-text"] exists, the base64 audio is ignored.
app.post('/uploadBlob', (request, response) => {
    let task_id = uuid()
    
    //use the raw text if it exists -- otherwise check for the recording
    if (request.body["raw-text"] != undefined) {
        rawtexts[task_id] = request.body["raw-text"]
        console.log("received " + request.body["raw-text"])
    } else {
    
        let file_path = "recordings/" + task_id + ".wav"
    
        var audio_base64 = request.body["audio-base64"]
        fs.writeFile(file_path, audio_base64, 'base64', function(error) { console.log(error) })
    }
    
    queued_tasks.push(task_id)
    console.log(queued_tasks)
    response.send({'status': 'success', 'task-id': task_id})
})

//body["task-id"] should be an identifier from /uploadBlob.
//response["code"] is either unknown-task, waiting-for-server, or response-ready.
//if response-ready, then response["response"] will be something when i get to it
app.post('/pollForSiriResponse', (request, response) => {
    var taskId = request.body["task-id"]
    
    if (!completed_tasks.includes(taskId)) {
        if (!queued_tasks.includes(taskId)) {
            response.send({'status': 'failure', 'code': 'unknown-task'})
        } else {
            response.send({'status': 'failure', 'code': 'waiting-for-server'})
        }
        return
    }
    
    response.send({'status': 'success', 'code': 'response-ready'})
})


//server-facing endpoints


app.get('/reset', (request, response) => {
    waiting_for_server = false
    response.send({status: 'success'})
})

app.get('/recordingAvailable', (request, response) => {
    console.log("recordings avaiable? "+ queued_tasks)
    
    if (waiting_for_server) {
        response.send("false")
        return
    }
    
    if (queued_tasks.length == 0) {
        response.send("false")
    } else {
        response.send(queued_tasks[0]) //send the first task id
        waiting_for_server = true //don't send another recording until the server sends back a response
    }
})

//if the next query has a rawtext, return that rawtext. Otherwise, "false".
app.get('/rawtext', (request, response) => {
    if (queued_tasks.length == 0) {
        response.send("false")
    } else {
        task_id = queued_tasks[0]
        rawtext = rawtexts[task_id]
        
        if (rawtext != undefined) {
            response.send(rawtext)
        } else {
            response.send("false")
        }
    }
})

//request.body is {"task-id": ..., "siri-response": {"image": ..., "audio" ...}}
app.post('/deliverSiriResponse', (request, response) => {
    
    body = request.body
    
    task_id = body["task-id"]
    siri_response = body["siri-response"]
    
    if (task_id == undefined 
        || siri_response == undefined 
        || siri_response["image"] == undefined 
        || siri_response["audio"] == undefined) {
            response.send({status: 'failure'})
            return
    }
    
    queued_tasks.shift() //remove the current task
    //array.splice(queued_tasks, queued_tasks.indexOf(task_id)) //remove the task
    waiting_for_server = false //allow the server to receive more recordings
    
    //write files to disk
    fs.writeFile("siri-responses/" + task_id + ".png", siri_response["image"], 'base64', function(err) {})
    fs.writeFile("siri-responses/" + task_id + ".mp4", siri_response["audio"], 'base64', function(err) {})
    
    completed_tasks.push(task_id)
    response.send({status: 'success'})
})


//publicize server

function makeDirectoryPublic(name) {
    app.use(express.static(__dirname + name));
    app.use(name, express.static(__dirname + name));
}

['/assets', '/scripts', '/css', '/siri-responses', '/recordings'].forEach(makeDirectoryPublic)

app.listen(8081)