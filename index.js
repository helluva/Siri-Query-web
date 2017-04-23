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


//setup endpoints

app.engine('.hbs', handlebars({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views/layouts')
}))

app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))


var queued_tasks = []
var completed_tasks = {}

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
app.post('/uploadBlob', (request, response) => {
    let task_id = uuid()
    let file_path = "recordings/" + task_id + ".wav"
    
    var audio_base64 = request.body["audio-base64"]
    fs.writeFile(file_path, audio_base64, 'base64', function(error) { console.log(error) })
    
    queued_tasks.push(task_id)
    response.send({'status': 'success', 'task-id': task_id})
})

//body["task-id"] should be an identifier from /uploadBlob.
//response["code"] is either unknown-task, waiting-for-server, or response-ready.
//if response-ready, then response["response"] will be something when i get to it
app.post('/pollForSiriResponse', (request, response) => {
    console.log(request.body)
    var taskId = request.body["task-id"]
    var completedTask = completed_tasks[taskId]
    
    if (completedTask == undefined) {
        if (!queued_tasks.includes(taskId)) {
            console.log(taskId)
            console.log(queued_tasks)
            response.send({'status': 'failure', 'code': 'unknown-task'})
        } else {
            response.send({'status': 'failure', 'code': 'waiting-for-server'})
        }
        
        return
    }
    
    response.send({'status': 'success', 'code': 'response-ready', 'response': completedTask})
})


//server-facing endpoints


app.get('/recordingAvailable', (request, response) => {
    response.send((available_recordings.length > 0) ? "true" : "false")
})

app.get('/nextRecording.wav', (request, response) => {
    if (available_recordings.length == 0) return
    var recording = available_recordings.shift() //pop the first element and deliver it
    var file_path = recording["path"]
    var response = recording["response"]
    
    var filePath = "recordings/out.wav"
    response.writeHead(200, {
          "Content-Type": "application/octet-stream",
          "Content-Disposition" : "attachment; filename=nextRecording.wav"});
    
    fs.createReadStream(filePath).pipe(response);
    
    response.send({status: 'success'})
})


//publicize server

function makeDirectoryPublic(name) {
    app.use(express.static(__dirname + name));
    app.use(name, express.static(__dirname + name));
}

['/assets', '/scripts', '/css'].forEach(makeDirectoryPublic)

app.listen(8081)