"user strict";

$(document).ready(function () {

  /**
   * Construct & handle async (mobile)
   **/
  var auth = new XummPkce('83ba5546-5737-46be-8733-8ec0fcb20d35')
  var sdk = null
  var myWallet = null

  function signedInHandler (authorized) {
    // Assign to global,
    // please don't do this but for the sake of the demo it's easy
    sdk = authorized.sdk
    console.log('Authorized', /* authorized.jwt, */ authorized.me)
    let walletAddress = authorized.me.account;
    console.log(walletAddress);
  }

  auth.on('error', error => {
    console.log('error', error)
  })

  auth.on('success', async () => {
    console.log('success')
    auth.state().then(state => {
      if (state.me) {
        myWallet = state.me.account;
        console.log('success, me', JSON.stringify(state.me))
      }
    })
  })

  auth.on('retrieved', async () => {
    // Redirect, e.g. mobile. Mobile may return to new tab, this
    // must retrieve the state and process it like normally the authorize method
    // would do

    auth.state().then(state => {
      console.log(state)
      if (state) {
        console.log('retrieved, me:', JSON.stringify(state.me))
        signedInHandler(state)
      }
    })
  })

  // Config the Adonis Websocket channel
  const ws = adonis.Ws().connect();
  let isConnected = false;
  let subscription = null;
  let token = null;

  ws.on('open', () => {})

  ws.on('close', () => {
    subscription = null;
  })

  subscription = ws.subscribe('game:ootopia0001')

  subscription.on('ready', () => {
    isConnected = true;
  })

  subscription.on('error', (error) => {
    alert('Error: there isn\'t a connection with the server.')
    isConnected = false;
  })

  subscription.on('close', () => {
    alert('Error: there isn\'t a connection with the server.')
    isConnected = false;
  })

  subscription.on('message', eventhandler)

  // End of Config the Adonis Websocket channel

  /**
   * Fn to deal with a "Sign In" button click or redirect
   **/

  function go() {
    return auth.authorize().then(signedInHandler).catch(e => {
      alert('Error: ' + e.message)
    })
  }

  function go_payload(amount) {
    /**
     * xumm-oauth2-pkce package returns `sdk` property,
     * allowing access to the Xumm SDK (`xumm-sdk`) package.
     * Xumm SDK methods, docs:
     *      https://www.npmjs.com/package/xumm-sdk
     **/
    var payload = {
      txjson: {
        TransactionType: 'Payment',
        Destination: 'rD6tSocv4fjQ3XL5w6s7djMRGxbwng7V5E',
        Amount: (parseInt(amount) * 1000000).toString() // Drops, so: 0.001337 XRP
      }
    }

    return sdk
      .payload
      .createAndSubscribe(payload, function (payloadEvent) {
        if (typeof payloadEvent.data.signed !== 'undefined') {
          // What we return here will be the resolved value of the `resolved` property
          return payloadEvent.data
        }
      })
      .then(function ({created, resolved}) {
        alert(created.pushed
          ? 'Now check Xumm, there should be a push notification + sign request in your event list waiting for you ;)'
          : 'Now check Xumm, there should be a sign request in your event list waiting for you ;) (This would have been pushed, but it seems you did not grant Xumm the push permission)'
        )

        return resolved.then(function (payloadOutcome) {
          if(payloadOutcome.signed){
            return payloadOutcome.payload_uuidv4;
          }
          else{
            throw new Error('You rejected the payment in your wallet')
          }
        })
      })
      .catch(function (e) {
        alert('Paylaod error', e.message)
      })
  }

  async function placeBetInit(amount, option){

    if(!sdk){
      await go();
    }
    let payload_uuidv4 = await go_payload(amount);

    if(payload_uuidv4){
      try{
        if(isConnected){
          subscription.emit('message',
            {
              event: 'ootopia0001:start',
              payload_uuidv4: payload_uuidv4,
              option: option ,
              token: token
            }
          );
        }
        else{
          throw new Error('There isn\'t a connection with the server.')
        }
      }
      catch (e) {
        alert('Error: ' + e.message)
      }
    }
  }



  async function eventhandler(message){
    switch (message.event) {
      case 'ootopia0001:init':
        console.log('ootopia0001:init', message);
        token = message.token;
        break;
      case 'ootopia0001:quiz':
        console.log('ootopia0001:quiz', message);
        token = message.token;
        // message value example:
        // {
        //   "event": "ootopia0001:quiz",
        //   "step": 1,             step is 1, means this is first flipping, step is 2 which means this is the second flipping
        //   "leftCard": 21,      this is the next challenge Left Card
        //   "rightCard": 21,     This is the previous Right Card you answered correctly, this is optional. if it is not present, it means the this is the first card flipping.
        //   "token": "xxxxx",      this is the token to be used in the next step
        //   "rightCount": 0        Count the number of right answer
        // }
        let leftcard = message.leftcard;
        // write your function to use this leftcard
        break;
      case 'ootopia0001:win':
        // message value example:
        // {
        //   "event": "ootopia0001:win",
        //   "message": "The last card is 21. Congratulation! You won the bet! Reward 10 XRP is sent to your wallet ",
        //   "rightCard": 21,          this is the last right card
        //   "leftCard": 21,           this is the last left card you challenged
        // }
        alert('Notification: ' + message.message + myWallet + '!');
        break;
      case 'ootopia0001:lose':
        // message value example:
        // {
        //   "event": "ootopia0001:lose",
        //   "message": "The last right card is 21. You lost the bet!",
        //   "rightCard": 21,          this is the generated right card
        //   "leftCard": 21,           this is the last left card you challenged
        // }
        alert('Notificaiton: ' + message.message)
        break;
      case 'ootopia0001:error':
        alert('Error: ' + message.message)
        // Display Error message and Restart button to restart the game
        break;
    }
  }

  async function sendToServer(answer){
    // Answer is one of "high", "low" or "equal"
    if (!isConnected) alert('Error: there isn\'t a connection with the server.')
    // placeBetInit(2,4)
    subscription.emit('message',
      {
        event: 'ootopia0001:check',
        answer: answer,
        token: token
      }
    );

  }

  setTimeout(()=>{
    // sendToServer("high")
  }, 5000)

});






// test 1
function test1Util() {
  let randomNumber = 0;
  do {
    randomNumber = generateRandomNumberBetweenNAndM(1, 50);
  } while (randomNumber == 1 || randomNumber == 50);
  let expectation = generateRandomNumberBetweenNAndM(1, 3) - 2;
  let options = generateRandomNumberBetweenNAndM(3, 5);
  let generated = generateRandomNumber(randomNumber, expectation, options);
  let difference = generated - randomNumber;
  if (expectation == 0) {
    if (difference == 0)
      return true;
  } else {
    if (expectation * difference > 0)
      return true;
  }
  return false;
}

function test1() {
  let tests = 10000000;
  let correct = 0;
  for (let i = 0; i < tests; i++) {
    if (test1Util() && test1Util() && test1Util())
      correct++;
  }
  console.log(correct / tests);
}


