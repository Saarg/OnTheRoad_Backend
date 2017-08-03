const WebSocket = require('ws');

const { DriftMode } = require('./DriftMode');

const wss = new WebSocket.Server({ port: 8000 }, () => {
  console.log('listening on 8000');
});

var clients = [];

var driftmode = new DriftMode();

wss.on('connection', function connection(ws) {
  console.log("New client");

  clients.push(ws);

  ws.on('message', function incoming(message) {
    if (message == 'driftmode') {
      driftmode.addClient(ws);
    }
  });
});
