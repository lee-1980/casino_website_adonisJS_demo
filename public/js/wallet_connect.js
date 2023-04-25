"user strict";

$(document).ready(function () {

  /**
   * Construct & handle async (mobile)
   **/
  var auth = new XummPkce('83ba5546-5737-46be-8733-8ec0fcb20d35')
  var sdk = null

  function signedInHandler (authorized) {
    // Assign to global,
    // please don't do this but for the sake of the demo it's easy
    sdk = authorized.sdk
    console.log('Authorized', /* authorized.jwt, */ authorized.me)
    let walletAddress = authorized.me.account;
    $('.wallet_xumm_connect').hide();
    $('.wallet_xumm_disconnect').show();
    $('.wallet_xumm_disconnect span.walletAddress').text(walletAddress.substr(0,4) + '...' + walletAddress.substr(-4));
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
    console.log('Results are in, mobile flow, process sign in')

    auth.state().then(state => {
      console.log(state)
      if (state) {
        console.log('retrieved, me:', JSON.stringify(state.me))
        signedInHandler(state)
      }
    })
  })

  /**
   * UI stuff
   **/

  function reset() {
    $('.wallet_xumm_disconnect').hide();
    $('.wallet_xumm_connect').show();
    $('.wallet_xumm_connect span.rela').text('Sign in with Xumm Wallet');
    $('.wallet_xumm_connect span.rela').show()
    $('.wallet_xumm_disconnect span.walletAddress').text('');
  }

  $(document).on('click', '.wallet_xumm_connect', function (e) {
    e.preventDefault();
    go();
  })

  $(document).on('click', '.wallet_xumm_disconnect', function (e) {
    e.preventDefault();
    go_logout();
  })

  // Start in default UI state
  reset()

  /**
   * Fn to deal with a "Sign In" button click or redirect
   **/

  function go() {
    reset()
    $('.wallet_xumm_connect span.rela').text('Signing in...');
    return auth.authorize().then(signedInHandler).catch(e => {
      console.log('Auth error', e)

      reset()
      $('.wallet_xumm_connect span.rela').text('Try Signing In Again!');
    })
  }

  function go_logout() {
    auth.logout()
    reset()
  }

  function go_payload() {
    /**
     * xumm-oauth2-pkce package returns `sdk` property,
     * allowing access to the Xumm SDK (`xumm-sdk`) package.
     * Xumm SDK methods, docs:
     *      https://www.npmjs.com/package/xumm-sdk
     **/
    var payload = {
      txjson: {
        TransactionType: 'Payment',
        Destination: 'rfCarbonVNTuXckX6x2qTMFmFSnm6dEWGX',
        Amount: '1337' // Drops, so: 0.001337 XRP
      }
    }

    sdk
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

        resolved.then(function (payloadOutcome) {
          alert('Payload ' + (payloadOutcome.signed ? 'signed (TX Hash: ' + payloadOutcome.txid + ')' : 'rejected') + ', see the browser console for more info')
          console.log(payloadOutcome)
        })
      })
      .catch(function (payloadError) {
        alert('Paylaod error', e.message)
      })
  }
});

