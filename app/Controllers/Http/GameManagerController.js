'use strict'



const gameConfig = {
  ootopia0001 : "flipflopfrenzy",
}

class GameManagerController {

  async gameRender({ params, view, response }) {

    if(gameConfig[params.id]){
      return view.render(`game/${gameConfig[params.id]}`)
    }
    else{
      return view.render('404')
    }

  }

  async placebet({ request, response }) {

    // Check the valid game request
    let { game_id, payload_uuidv4, option } = request.all()
    const game = gameConfig[game_id]
    if (game) {
      try{
        if(!payload_uuidv4 || !option || typeof option  !== 'number'){
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
                game_id,
                is_win,
                bet_amount,
                multiply,
                profit,
                jwt_verifier,
                payload_uuidv4
              })
            }
            else{
              throw new Error('You are using the wrong network!')
            }
          }
          else {
            throw new Error('You rejected the payment in your wallet')
          }
        }
        else{
          throw new Error('Invalid Payload ID!')
        }
        if(record){
          console.log(record)
          return {
            "game": "success",
            "token": jwt_verifier,
          }
        }
        throw new Error('Something went wrong!')
      }
      catch (e) {
        console.log(e.message)
        response.status(400).send({ error: e.message })
      }
    }
    else{
      response.status(404).send({ error: 'Invalid Game ID!' })
    }
  }

  async winbet({ request, response }) {

    // Check the valid game request
    let { game_id, payload_uuidv4 } = request.all()
    const game = gameConfig[game_id]
    if (game) {
      try{
        const oldRecord = await Record.findBy('payload_uuidv4', payload_uuidv4)
        if(oldRecord){

          if(oldRecord.profit > 0 || oldRecord.is_win){
            throw new Error('You have already won the bet!')
          }
          const result = await Sdk.payload.get(payload_uuidv4)

          if(result.response.dispatched_nodetype === Env.get('network')){
            const client = new xrpl.Client(networkConfig[Env.get('network')]);
            await client.connect();
            const wallet = xrpl.Wallet.fromSeed(Env.get('SEED'))

            // Prepare transaction -------------------------------------------------------
            const prepared = await client.autofill({
              "TransactionType": "Payment",
              "Account": wallet.address,
              "Amount": (oldRecord.bet_amount * (1 + parseFloat(oldRecord.multiply))).toString(),
              "Destination": oldRecord.wallet,
            })

            // Sign prepared instructions ------------------------------------------------
            const signed = await wallet.sign(prepared)

            // Submit signed blob --------------------------------------------------------
            const tx = await client.submitAndWait(signed.tx_blob)

            if(tx.result.validated){
              oldRecord.is_win = true
              oldRecord.profit = oldRecord.bet_amount * oldRecord.multiply
              await oldRecord.save()
            }

            client.disconnect();

            return {
              "game": "success"
            }
          }
          else{
            throw new Error('You are using the wrong network!')
          }
        }
        else{
          throw new Error('Invalid Payload ID!')
        }
      }
      catch (e) {
        console.log(e.message)
        response.status(400).send({ error: e.message })
      }
    }
    else{
      response.status(404).send({ error: 'Invalid Game ID!' })
    }
  }
}

module.exports = GameManagerController
