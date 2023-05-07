'use strict'

const Env = use('Env')

const gameConfig = {
  ootopia0001 : async (message, socket) => {

    let { payload_uuidv4, option } = message

    try{

      if(!payload_uuidv4 || !cardConfig[option]){
        throw new Error('Invalid parameters!')
      }

      let multiply = parseFloat(cardConfig[option])
      const result = await Sdk.payload.get(payload_uuidv4)

      let record = null
      let jwt_verifier = null
      if(result.meta.exists){
        if(result.meta.signed){
          if(result.response.dispatched_nodetype === Env.get('network')){
            const oldRecord = await Record.findBy('payload_uuidv4', payload_uuidv4)
            if(oldRecord){
              throw new Error('You have already placed a bet!')
            }
            let wallet = result.response.account
            let bet_amount = result.payload.request_json.Amount
            let is_win = false
            let profit = 0
            jwt_verifier = jwt.sign({ payload_uuidv4 }, Env.get('APP_KEY'), { expiresIn: '1h' })
            record = await Record.create({
              uuid: uuidV4(),
              wallet,
              game_id: 'ootopia0001',
              is_win,
              bet_amount,
              multiply,
              profit,
              jwt_verifier,
              payload_uuidv4
            })
          }
          else{
            throw new Error('Invalid network!')
          }
        }
        else{
          throw new Error('Invalid payload!')
        }
      }

      if(record){
        socket.emit('message', {
          event: 'ootopia0001:start',
          jwt_verifier,
        })
      }
    }
    catch (e) {
      socket.emit('message', {
        event: 'ootopia0001:error',
        message: e.message,
      })
    }
  }
}



class GameActionController {

  constructor ({ socket, request }) {
    this.socket = socket
    this.request = request
  }

  onMessage (message) {
    try{
      let router = this.socket.topic.split(':')[1]
      console.log(router)
      if(gameConfig[router]){
        gameConfig[router](message, this.socket);
      }
    }
    catch (e) {
      this.socket.emit('message', {
        event: 'ootopia0001:error',
        message: e.message,
      })
    }
  }

  onClose () {
    console.log('socket closed')
  }
}

module.exports = GameActionController
