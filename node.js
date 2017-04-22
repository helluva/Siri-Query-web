const express = require('express')
const path = require('path')
const handlebars = require('express-handlebars')

const app = express()

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

app.use(express.static(__dirname + '/assets'));
app.use('/assets', express.static(__dirname + '/assets'));

app.listen(3000)  