const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.WEBSOCKETS_PORT || 9001;

const app = express();

app.use(express.static(__dirname + '/dist'));

app.get('/', (req, res) => {
  res.status(200).send('working');
});

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (data, isBinary) => {
    const message = isBinary ? data : data.toString();
    wss.clients.forEach((client) => {
      if (client != ws) {
        client.send(JSON.stringify({ message, src: 'server' }));
      }
    });
  });
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
