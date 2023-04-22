'use strict'


const gameConfig = {
  ootopia0001 : "flipflopfrenzy",
}

class GameActionController {
  constructor ({ socket, request }) {
    this.socket = socket
    this.request = request
  }
  onMessage (message) {
    console.log(this.socket.topic)
    console.log('got message', message)
  }

  onClose () {
    console.log('socket closed')
  }
}

module.exports = GameActionController
