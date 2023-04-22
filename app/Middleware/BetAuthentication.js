'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const jwt = require('jsonwebtoken')
const Env = use('Env')

class BetAuthentication {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ request }, next) {
    // call next to advance the request
    try {
      const { token, payload_uuidv4 } = request.all()
      const appKey = Env.get('APP_KEY')
      const decoded = jwt.verify(token, appKey)
      if(decoded.payload_uuidv4 && decoded.payload_uuidv4 === payload_uuidv4){
        await next()
      }
      else {
        throw new Error('Unauthorized')
      }
    }
    catch (e) {
      return response.status(401).json({
        message: 'Unauthorized'
      })
    }
  }
}

module.exports = BetAuthentication
