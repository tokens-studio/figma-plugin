const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const PORT = process.env.WEBSOCKETS_PORT || 9001;

const app = express();

app.use(express.static(__dirname + '/dist'))

app.get("/", (req, res) => {
  // res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  res.status(200).send("working");
});

const server = http.createServer(app);

// initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });
wss.on("connection", (ws) => {
  ws.isAlive = true;
  ws.on("pong", () => {
    ws.isAlive = true;
  });

  // connection is up, let's add a simple simple event
  ws.on("message", (data, isBinary) => {
    const message = isBinary ? data : data.toString();
    // send back the message to the other clients
    wss.clients.forEach((client) => {
      if (client != ws) {
        client.send(JSON.stringify({ message, src: 'server' }));
      }
    });
  });

  // send immediatly a feedback to the incoming connection
  // ws.send('Hi there, I am a WebSocket server');
});

setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 10000);

server.listen(PORT, () => {
  console.log(`Preview server started on port: ${PORT}`);
});