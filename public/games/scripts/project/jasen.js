globalThis.auth = new XummPkce('47fc6b97-e9e1-4dc5-8ff6-f40202d5276c');
globalThis.sdk = null;

export function init() {
	globalThis.on("Backend:placeBetInit",(amount, multiply)=>{
		(async () => await  placeBetInit(amount, multiply))();
	});
	globalThis.on("Backend:winbet",(payload_uuidv4, token)=>{
		 winbet(payload_uuidv4, token);
	});
}

function signedInHandler (authorized) {
    // Assign to global,
    // please don't do this but for the sake of the demo it's easy
    globalThis.sdk = authorized.sdk
    console.log('Authorized', /* authorized.jwt, */ authorized.me)
    let walletAddress = authorized.me.account;
    console.log(walletAddress);
}

globalThis.auth.on('error', error => {
    console.log('error', error)
})

globalThis.auth.on('success', async () => {
    console.log('success')
    globalThis.auth.state().then(state => {
      if (state.me) {
        console.log('success, me', JSON.stringify(state.me))
      }
    })
})

globalThis.auth.on('retrieved', async () => {
    // Redirect, e.g. mobile. Mobile may return to new tab, this
    // must retrieve the state and process it like normally the authorize method
    // would do

    globalThis.auth.state().then(state => {
      console.log(state)
      if (state) {
        console.log('retrieved, me:', JSON.stringify(state.me))
        signedInHandler(state)
      }
    })
})

//OnStartBtnClicked


//OnPaymentResultRecived => success or failed
//OnPaymentResultRecived  is a object or string ?
//local storage not avilable in incogit mode so we cant save value in local  storag 
async function placeBetInit(amount, multiply){
	console.log('amount multiply', amount,multiply );
	
    if(!globalThis.sdk){
      await go();
    }
    let payload_uuidv4 = await go_payload(amount);
    if(payload_uuidv4){
      console.log('payloadId', payload_uuidv4)
      let result = await placeBet(payload_uuidv4, multiply);
	  
	  globalThis.fire("Backend:OnPaymentResultRecived",result,payload_uuidv4);
      // token value will be like this.
      //{
      //  "game": "success",
      //  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkX3V1aWR2NCI6IjM1ZWViODVmLTY1Y2YtNGE1OC04Y2NhLWM4MDQwZDY0MWYwYyIsImlhdCI6MTY4MjAyOTc3MSwiZXhwIjoxNjgyMDMzMzcxfQ.I8NaztNHjPjZEMgdZueOMcVa00nU78S87TuC5fkxv2w"   
      //}
      
      // if result value is not like above, that means payment is failed.
      // So you should not let user play game
      // Just display error message "Payment is failed"
      
      // the next step is you need to save two variables into the game storage in high secure.
      // result.token and payload_uuidv4
      // Because we will use these two variables when user win the game
      
    }
}
  
  /**
   * Fn to deal with a "Sign In" button click or redirect
   **/

function go() {
    return globalThis.auth.authorize().then(signedInHandler).catch(e => {
	  globalThis.fire("Backend:Alert",'Error: ' + e.message);
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

    return globalThis.sdk
      .payload
      .createAndSubscribe(payload, function (payloadEvent) {
        if (typeof payloadEvent.data.signed !== 'undefined') {
          // What we return here will be the resolved value of the `resolved` property
          return payloadEvent.data
        }
      })
      .then(function ({created, resolved}) {
        let msg = created.pushed
          ? 'Now check Xumm, there should be a push notification + sign request in your event list waiting for you ;)'
          : 'Now check Xumm, there should be a sign request in your event list waiting for you ;) (This would have been pushed, but it seems you did not grant Xumm the push permission)';
		  globalThis.fire("Backend:Alert",msg);

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
		  globalThis.fire("Backend:Alert",'Paylaod error: '+ e.message);
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
      	globalThis.fire("Backend:OnWinBet",true);
        // Data will be like this if success
        // {
        //   "game": "success"
        //   }
        console.log(data);
      },
      error: function (error) {
        console.log(error);
		globalThis.fire("Backend:OnWinBet",false);
      }
    });
}