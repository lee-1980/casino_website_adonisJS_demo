"user strict";

$(document).ready(function () {

  /**
   * Construct & handle async (mobile)
   **/
  var auth = new XummPkce('47fc6b97-e9e1-4dc5-8ff6-f40202d5276c')
  var sdk = null

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

  function placeBet(payload_uuidv4, multiply){
    return new Promise((resolve, reject) => {
      $.ajax({
        url: 'placebet',
        type: 'POST',
        data: {
          game_id: 'ootopia0001',
          _csrf: $('input[name="_csrf"]').val(),
          payload_uuidv4: payload_uuidv4,
          multiply: multiply,
        },
        success : resolve,
        error:  reject
      });
    })
  }

  function winbet(payload_uuidv4, token){
    $.ajax({
      url: 'winbet',
      type: 'POST',
      data: {
        game_id: 'ootopia0001',
        _csrf: $('input[name="_csrf"]').val(),
        payload_uuidv4: payload_uuidv4,
        token: token,
      },
      success: function (data) {
        console.log(data);
      },
      error: function (error) {
        console.log(error);
      }
    });
  }

  async function placeBetInit(amount, multiply){
    if(!sdk){
      await go();
    }
    let payload_uuidv4 = await go_payload(amount);
    if(payload_uuidv4){
      console.log('payloadId', payload_uuidv4)
      let token = await placeBet(payload_uuidv4, multiply);

    }
  }

  let timer = setTimeout(function(){
    winbet('35eeb85f-65cf-4a58-8cca-c8040d641f0c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkX3V1aWR2NCI6IjM1ZWViODVmLTY1Y2YtNGE1OC04Y2NhLWM4MDQwZDY0MWYwYyIsImlhdCI6MTY4MjAyOTc3MSwiZXhwIjoxNjgyMDMzMzcxfQ.I8NaztNHjPjZEMgdZueOMcVa00nU78S87TuC5fkxv2w')
  }, 5000);
});

function generateRandomNumber(currentNumber, expectation, options) {

  options = parseInt(options)|| 3;

  if(options !== 3 || options !== 4 ||  options !== 5){
    options = 3;
  }

  let ratioConfig = {
    3: 0.15,
    4: 0.1,
    5: 0.06
  }

  let threshold = Math.floor(Math.pow(ratioConfig[options], 1/options) * 1000);
  let randomNumber = generateRandomNumberBetweenNAndM(1, 1000);
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
function generateRandomNumberBetweenNAndM(n, m) {
  if (n == m)
    return n;
  else if (n > m)
    return generateRandomNumberBetweenNAndM(m, n)
  return Math.floor(Math.random() * (m - n + 1)) + n;
}


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
