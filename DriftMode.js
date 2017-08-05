class DriftMode {
  constructor() {
    this.clients = []
  }

  addClient(ws) {
    console.log('new DriftMode client');

    this.clients.push(ws);

    if(ws.readyState === 1){
      ws.send("acc Connected to DriftMode online");
    }

    let index = this.clients.length-1;

    for (let i = 0; i < this.clients.length; i++) {
      if (i === index)
        continue;

      if(this.clients[i].readyState === 1){
        this.clients[i].send('new ' + index);
      }
      if(ws.readyState === 1){
        ws.send('new ' + i);
      }
    }

    ws.context = this;
    ws.onmessage = this.message;
    //ws.on('message', (message) => this.message(message, ws));
  }

  message(message) {
    let ws = this;
    let context = this.context;
    let index = context.clients.indexOf(ws);

    for (let i = 0; i < context.clients.length; i++) {
      if (i === index)
        continue;

      if (context.clients[i].readyState === 1){
        console.log(message.data.toString("utf8"));
        context.clients[i].send('tra (' + index + ')' + message.data.toString("utf8"));
      }
    }
  }
}

exports.DriftMode = DriftMode;
