class Pool {
  constructor(seed) {
    this.seed = seed;
    this.clients = [];
    this.record = 9999;
  }

  addClient(client) {
    console.log("[%s] Client joined %d", client.socket.ip, this.seed);
    client.seed = this.seed;

    client.socket.poolContext = this;
    client.socket.addEventListener('message', this.message);
    this.clients.push(client);
  }

  removeClient(client) {
    console.log("[%s] Client left %d", client.socket.ip, this.seed);
    client.seed = -1;
    client.socket.removeEventListener('message', this.message);
    this.clients.splice(this.clients.indexOf(client), 1);
  }

  message(message) {
    let ws = this;
    let context = this.poolContext;

    const opcode = message.data.toString("utf8").slice(0, 3);
    const content = message.data.toString("utf8").slice(4).replace(',', '.');

    if (opcode == "rec") {
      console.log("record " + context.record + " received time " + parseFloat(content));
      if (!context.record || context.record > parseFloat(content)) {
        context.record = parseFloat(content);

        console.log("[%s] New record of: %d in randomMode: %d", ws.ip, context.record, context.seed);
      }
    }
    else if (opcode == "qut")
    {
      ws.removeEventListener('message', context.message);
      console.log("[%s] Client disconnected from RandomMode", ws.ip)
    }
  }
}

class Client {
  constructor(seed, socket) {
    this.seed = seed;
    this.socket = socket;
    this.ghost = [];
  }
}

class RandomMode {
  constructor() {
    this.clients = {};
    this.maps = {};
  }

  addClient(ws) {
    console.log('[%s] New RandomMode client', ws.ip);

    if (this.clients[ws] === undefined)
      this.clients[ws] = new Client(-1, ws);

    if(ws.readyState === 1){
      ws.send("acc Connected to RandomMode online");
    }

    ws.context = this;
    ws.addEventListener('message', this.message);
  }

  message(message) {
    let ws = this;
    let context = this.context;

    const opcode = message.data.toString("utf8").slice(0, 3);
    const content = message.data.toString("utf8").slice(4);

    if (opcode == "sed") {
      const seed = parseInt(content);

      if (context.maps[seed] === undefined)
        context.maps[seed] = new Pool(parseInt(seed));

      if (context.maps[context.clients[ws].seed])
        context.maps[context.clients[ws].seed].removeClient(context.clients[ws]);
      context.maps[seed].addClient(context.clients[ws]);
    }
    else if (opcode == "qut")
    {
      this.removeEventListener('message', context.message);
      console.log("[%s] Client disconnected from RandomMode %d", ws.ip, context.clients[ws].seed)
    }
  }
}

exports.RandomMode = RandomMode;
