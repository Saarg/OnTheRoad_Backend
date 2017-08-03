class DriftMode {
  constructor() {
    this.clients = []
  }

  addClient(ws) {
    console.log('new driftmode client');

    this.clients.push(ws);

    if(ws.readyState === 1){
      ws.send("acc Connected to driftmode online");
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

    ws.on('message', (message) => {
      let index = this.clients.indexOf(ws);

      for (let i = 0; i < this.clients.length; i++) {
        if (i === index)
          continue;

        if(this.clients[i].readyState === 1){
          this.clients[i].send('tra (' + index + ')' + message);
        }
      }
    });
  }
}

exports.DriftMode = DriftMode;
