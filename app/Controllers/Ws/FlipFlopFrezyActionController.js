'use strict'

const Redis = use('Redis')
const Record = use('App/Models/Record')
const xrpl = require("xrpl");
const { v4: uuidV4 } = require('uuid')
const jwt = require('jsonwebtoken')
const {XummSdk} = require('xumm-sdk')
const Env = use('Env')
const jwt_key = Env.get('APP_KEY')
const Sdk = new XummSdk(Env.get('XUMM_APIKEY'), Env.get('XUMM_APISECRET'))

const networkConfig = {
  MAINNET: 'wss://s2.ripple.com',
  TESTNET: 'wss://s.altnet.rippletest.net:51233',
}

const cardConfig = {
  3: 1,
  4: 2,
  5: 3
}

const generateRandomNumber = (currentNumber, expectation, options) => {

  const ratioConfig = {
    3: 0.15,
    4: 0.10,
    5: 0.06
  }

  let threshold = Math.floor(Math.pow(ratioConfig[options], 1/options) * 100);
  let randomNumber = generateRandomNumberBetweenNAndM(1, 100);
  console.log(threshold)
  console.log(randomNumber)
  console.log(currentNumber)
  // The player expects a smaller number than currentNumber
  if (expectation < 0) {
    // edge case
    if (currentNumber == 1)
      return generateRandomNumberBetweenNAndM(1, 50);
    // if randomNumber < threshold, do as the player expects, i.e., return a smaller number
    if (randomNumber < threshold) {
      return generateRandomNumberBetweenNAndM(1, currentNumber - 1);
      // otherwise, do the opposite
    } else {
      return generateRandomNumberBetweenNAndM(currentNumber, 50);
    }
    // The player expects an equal number as currentNumber
  } else if (expectation == 0) {
    // if randomNumber < threshold, do as the player expects, i.e., return an equal number
    if (randomNumber < threshold) {
      return currentNumber;
      // otherwise, do the opposite
    } else {
      let randomNumber = 0;
      do {
        randomNumber = generateRandomNumberBetweenNAndM(1, 50);
      } while (randomNumber == currentNumber);
      return randomNumber;
    }
    // The player expects a larger number than currentNumber
  } else if (expectation > 0) {
    // edge case
    if (currentNumber == 50)
      return generateRandomNumberBetweenNAndM(1, 50);
    // if randomNumber < threshold, do as the player expects, i.e., return a larger number
    if (randomNumber < threshold) {
      return generateRandomNumberBetweenNAndM(currentNumber + 1, 50);
      // otherwise, do the opposite
    } else {
      return generateRandomNumberBetweenNAndM(1, currentNumber);
    }
  }
}
// create a function that generates a random number between n and m
const generateRandomNumberBetweenNAndM = (n, m) =>  {
  if (n == m)
    return n;
  else if (n > m)
    return generateRandomNumberBetweenNAndM(m, n)
  return Math.floor(Math.random() * (m - n + 1)) + n;
}

const compareTwoCards = (difference, expectation) => {
  if (expectation == 0) {
    if (difference == 0)
      return true;
  } else {
    if (expectation * difference > 0)
      return true;
  }
  return false;
}

const gameConfig = {
  start: async (message, socket) => {

    let { payload_uuidv4, option, token } = message

    try{

      const decoded = jwt.verify(token, jwt_key)

      if(!decoded.step){
        throw new Error('Unauthorized');
      }

      if(!payload_uuidv4 || !cardConfig[option]){
        throw new Error('Invalid parameters!')
      }

      let multiply = parseFloat(cardConfig[option])
      const result = await Sdk.payload.get(payload_uuidv4)
      let randNum = generateRandomNumberBetweenNAndM(2, 49)
      let record = null
      let jwt_verifier = null


      if(result.meta.exists){
        if(result.meta.signed && result.meta.destination === Env.get('WALLET')){
          if(result.response.dispatched_nodetype === Env.get('network')){
            const oldRecord = await Record.findBy('payload_uuidv4', payload_uuidv4)
            if(oldRecord){
              throw new Error('You have already placed a bet!')
            }
            let wallet = result.response.account
            let bet_amount = result.payload.request_json.Amount
            let is_win = false
            let profit = 0

            jwt_verifier = jwt.sign({ payload_uuidv4 , step: 1, leftCard: randNum, option: option}, jwt_key, { expiresIn: '1h' })

            let redis_game_data = {
              current_step: 1,
              play_option: option,
              left_card: randNum,
              rightCount: 0,
            }

            await Redis.set(`game:${payload_uuidv4}`, JSON.stringify(redis_game_data))

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
          event: 'ootopia0001:quiz',
          leftCard: randNum,
          step: 1,
          token: jwt_verifier,
          rightCount: 0
        })
      }
      else{
        throw new Error('Invalid payload!')
      }
    }
    catch (e) {
      socket.emit('message', {
        event: 'ootopia0001:error',
        message: e.message,
      })
    }
  },
  check: async (message, socket) => {
    try {
      let { token, answer } = message
      const decoded = jwt.verify(token, jwt_key)

      const expectationConfig = {
        high: 1,
        equal: 0,
        low: -1
      }

      if(!expectationConfig[answer]){
        throw new Error('Invalid answer!')
      }

      let expectation = expectationConfig[answer]
      let payload_uuidv4 = decoded.payload_uuidv4
      let game_data = await Redis.get(`game:${payload_uuidv4}`)

      console.log("check:", game_data);

      if(game_data){
        game_data = JSON.parse(game_data)
        if(decoded.step === game_data.current_step && decoded.option === game_data.play_option && decoded.leftCard === game_data.left_card){
          let rightCard = generateRandomNumber(decoded.leftCard, expectation, decoded.option);
          let difference = rightCard - decoded.leftCard;
          let is_correct = compareTwoCards(difference, expectation);
          if(is_correct){
            console.log(game_data);
            console.log(rightCard);
            console.log(game_data.rightCount + 1);
            console.log(is_correct);

            if(decoded.option === decoded.step && decoded.step ===  (game_data.rightCount + 1)){
              let oldRecord = await Record.findBy('payload_uuidv4', payload_uuidv4)
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
                    await Redis.del(`game:${payload_uuidv4}`)

                    let rewardAmount = Math.floor(oldRecord.bet_amount * (1 + parseFloat(oldRecord.multiply))/ 1000000)
                    socket.emit('message', {
                      event: 'ootopia0001:win',
                      rightCard: rightCard,
                      lefCard: decoded.leftCard,
                      message: 'The last right card is ' + rightCard + '. Congratulation! You won the bet! Reward ' + rewardAmount + ' XRP is sent to your wallet ',
                    })
                  }
                  client.disconnect();
                }
                else{
                  throw new Error('You are using the wrong network!')
                }
              }
              else{
                throw new Error('Invalid Payload ID!')
              }
            }
            else if (decoded.step < decoded.option){
              let randNum = generateRandomNumberBetweenNAndM(2, 49)
              game_data.current_step = decoded.step + 1
              game_data.left_card = randNum
              game_data.rightCount = game_data.rightCount + 1

              let jwt_verifier = jwt.sign({ payload_uuidv4 , step: game_data.current_step, leftCard: randNum, option: decoded.option}, jwt_key, { expiresIn: '1h' })


              await Redis.set(`game:${payload_uuidv4}`, JSON.stringify(game_data))

              socket.emit('message', {
                event: 'ootopia0001:quiz',
                leftCard: randNum,
                rightCard: rightCard,
                step: game_data.current_step,
                token: jwt_verifier,
                rightCount: game_data.rightCount
              })

            }
            else{
              throw new Error('Invalid Game Process!')
            }
          }
          else{
            // await Redis.del(`game:${payload_uuidv4}`)

            socket.emit('message', {
              event: 'ootopia0001:lose',
              rightCard: rightCard,
              lefCard: decoded.leftCard,
              message: 'The generated right card is ' + rightCard + '. You lost the bet!',
            })
          }

        }
        else{
          throw new Error('Invalid token!')
        }
      }
      else{
        throw new Error('Invalid token!')
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

class FlipFlopFrezyActionController {

  constructor ({ socket, request }) {
    this.socket = socket
    this.request = request
    let jwt_token = jwt.sign({ step: 'init' }, jwt_key, { expiresIn: '1h' })
    this.socket.emit('message', {
      event: 'ootopia0001:init',
      token: jwt_token
    })
  }

  onMessage (message) {
    try{
      let router = message.event.split(':')[1]
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

module.exports = FlipFlopFrezyActionController
