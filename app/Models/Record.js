'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Record extends Model {
  static get primaryKey() {
    return 'uuid'
  }

  static get incrementing() {
    return false
  }
}

module.exports = Record
