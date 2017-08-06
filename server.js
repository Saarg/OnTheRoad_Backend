const WebSocket = require('ws');

const { DriftMode } = require('./DriftMode');
const { RandomMode } = require('./RandomMode');
const { FreeMode } = require('./FreeMode');

const wss = new WebSocket.Server({ port: 8000 }, () => {
  console.log('listening on 8000');
});

var clients = [];

var driftmode = new DriftMode();
var randomMode = new RandomMode();
var freeMode = new FreeMode();

wss.on('connection', function connection(ws, req) {
  const ip = req.connection.remoteAddress;
  // const ip = req.headers['x-forwarded-for']; for proxy like nginx
  console.log("New client with ip: " + ip);
  ws.ip = ip;

  clients.push(ws);

  ws.on('message', function incoming(message) {
    const opcode = message.slice(0, 3);
    const content = message.slice(4);

    if (message == 'driftmode') {
      driftmode.addClient(ws);
    } else if (message == 'randommode') {
      randomMode.addClient(ws);
    } else if (message == 'freemode') {
      freeMode.addClient(ws);
    } else if (opcode == 'qut') {
      console.log("[%s] Disconected saying: %s", ip, content);
    }
  });
});
