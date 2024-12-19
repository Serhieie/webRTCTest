const fs = require('fs')
const https = require('https');
const http = require('https');
const express = require('express');
const socketio = require('socket.io')
const cors = require('cors')
const app = express();

app.use(cors())
app.use(express.static(__dirname + '/public'))
app.use(express.json())

// const key = fs.readFileSync('./certs/cert.key')
// const cert = fs.readFileSync('./certs/cert.crt')

// const expressServer = https.createServer({ key, cert }, app)

const expressServer = http.createServer({ }, app)
const io = socketio(expressServer, {
    cors: ['https://localhost:3000', 'https://localhost:3001', 'https://localhost:3002', 'https://www.webrtc-bohd-test.site']
})

expressServer.listen(9009);

module.exports = {io,expressServer, app}