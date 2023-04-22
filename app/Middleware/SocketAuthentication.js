'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

'use strict'
const Env = use('Env')


class SocketAuthentication {

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async wsHandle ({ request }, next) {
    try {
      const { token } = request.all()
      const appKey = Env.get('APP_KEY')
      const jwtToken = token.split(' ')[1]
      jwt.verify(jwtToken, appKey)
      await next()
    }
    catch (e) {}

    const { token } = request.all()
    const appKey = auth.authenticatorInstance._config.options.secret
    const jwtToken = token.split(' ')[1]
    jwt.verify(jwtToken, appKey)
    await next()
  }
}

module.exports = SocketAuthentication
