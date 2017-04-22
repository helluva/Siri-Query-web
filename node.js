const http = require('http')
const port = 3000

const requestHandler = (request, response) => {
    console.log(request.url)
    response.end("Welcome to my site")
}

const server = http.createServer(requestHandler)

server.listen(port, (error) => {
    
    if (error) {
        return console.log('something bad happened', error)
    }
    
    console.log('listening!')
})