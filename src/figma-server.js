
const express = require('express')
const http = require('http')
const WebSocket = require('ws')
const path = require('path')

const PORT = 9001

const app = express()

app.get('/', (req, res) => {
  // res.sendFile(path.join(__dirname + './../dist/ui.html'));
  res.status(200).send('working')
})

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  })

  //connection is up, let's add a simple simple event
  ws.on('message', (message) => {
    //send back the message to the other clients
    wss.clients.forEach(client => {
      if (client != ws) {
        client.send(JSON.stringify({message, src: 'server'}));
      }    
    });
  })

  //send immediatly a feedback to the incoming connection    
  // ws.send('Hi there, I am a WebSocket server');
})

setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping(null, false, true);
  })
}, 10000);

server.listen(PORT, () => {
  console.log(`Preview server started on port: ${PORT}`)
})