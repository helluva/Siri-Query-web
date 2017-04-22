const express = require('express')
const path = require('path')
const handlebars = require('express-handlebars')

const app = express()


//setup endpoints

app.engine('.hbs', handlebars({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views/layouts')
}))

app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))


app.get('/', (request, response) => {
    response.render('home', {
        url: request.url
    })
})


//publicize server

function makeDirectoryPublic(name) {
    app.use(express.static(__dirname + name));
    app.use(name, express.static(__dirname + name));
}

['/assets', '/scripts', '/css'].forEach(makeDirectoryPublic)

app.listen(8081)