class Pool {
  constructor(seed) {
    this.seed = seed;
    this.clients = [];
    this.record = 9999;
  }

  addClient(client) {
    console.log("Client joined %d", this.seed);
    client.seed = this.seed;

    client.socket.context = this;
    client.socket.addEventListener('message', this.message);
    this.clients.push(client);
  }

  removeClient(client) {
    console.log("Client left %d", this.seed);
    client.seed = -1;
    client.socket.removeEventListener('message', this.message);
    this.clients.splice(this.clients.indexOf(client), 1);
  }

  message(message) {
    let ws = this;
    let context = this.context;

    console.log("received: " + message.data.toString("utf8"));

    const opcode = message.data.toString("utf8").slice(0, 3);
    const content = message.data.toString("utf8").slice(4).replace(',', '.');

    if (opcode == "rec") {
      console.log("record " + context.record + " received time " + parseFloat(content));
      if (!context.record || context.record > parseFloat(content)) {
        context.record = parseFloat(content);

        console.log("New record of: %d in randomMode: %d", context.record, context.seed);
      }
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
    console.log('new RandomMode client');

    if (this.clients[ws] === undefined)
      this.clients[ws] = new Client(-1, ws);

    if(ws.readyState === 1){
      ws.send("acc Connected to RandomMode online");
    }

    ws.on('message', (message) => {
      const opcode = message.slice(0, 3);
      const content = message.slice(4);

      if (opcode == "sed") {
        const seed = parseInt(content);

        if (this.maps[seed] === undefined)
          this.maps[seed] = new Pool(parseInt(seed));

        if (this.maps[this.clients[ws].seed])
          this.maps[this.clients[ws].seed].removeClient(this.clients[ws]);
        this.maps[seed].addClient(this.clients[ws]);
      }
    });
  }
}

exports.RandomMode = RandomMode;
