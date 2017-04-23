const express = require('express')
const path = require('path')
const handlebars = require('express-handlebars')
const request = require('request')
const bodyParser = require('body-parser')
const fs = require('fs')

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


//client-facing endpoints

app.get('/', (request, response) => {
    response.render('home', {
        url: request.url
    })
})

app.post('/uploadBlob', (request, response) => {
    
    var audio_base64 = request.body["audio-base64"]
    
    fs.writeFile("out.wav", audio_base64, 'base64', function(error) { console.log(error) })
    response.send({status: 'success'})
})


//server-facing endpoints

app.get('/recordingAvailable', (request, response) => {
    response.send("true")
})

app.get('/nextRecording.wav', (request, response) => {
    var filePath = "out.wav"
    response.writeHead(200, {
          "Content-Type": "application/octet-stream",
          "Content-Disposition" : "attachment; filename=nextRecording.wav"});
    
    fs.createReadStream(filePath).pipe(response);
})


//publicize server

function makeDirectoryPublic(name) {
    app.use(express.static(__dirname + name));
    app.use(name, express.static(__dirname + name));
}

['/assets', '/scripts', '/css'].forEach(makeDirectoryPublic)

app.listen(8081)