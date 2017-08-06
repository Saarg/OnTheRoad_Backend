class FreeMode {
  constructor() {
    this.clients = [];
    this.record = 9999;
  }

  addClient(ws) {
    console.log('[%s] New FreeMode client', ws.ip);

    this.clients.push(ws);

    if(ws.readyState === 1){
      ws.send("acc Connected to FreeMode online");
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
    ws.addEventListener('message', this.message);
  }

  message(message) {
    let ws = this;
    let context = this.context;
    let index = context.clients.indexOf(ws);

    const opcode = message.data.toString("utf8").slice(0, 3);
    const content = message.data.toString("utf8").slice(4);

    if (opcode == "tra") {
      for (let i = 0; i < context.clients.length; i++) {
        if (i === index)
          continue;

        if (context.clients[i].readyState === 1){
          context.clients[i].send('tra (' + index + ')' + content);
        }
      }
    }
    else if (opcode == "qut")
    {
      ws.removeEventListener('message', context.message);
      console.log("[%s] Client disconnected from FreeMode", ws.ip)
    }
  }
}

exports.FreeMode = FreeMode;
