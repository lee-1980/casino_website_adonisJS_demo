'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ColUpdateProfitSchema extends Schema {
  up () {
    this.alter('records', (table) => {
      table.bigInteger('profit').defaultTo(0).notNullable().alter();
    })
  }

  down () {
    this.table('col_update_profits', (table) => {
      // reverse alternations
    })
  }
}

module.exports = ColUpdateProfitSchema
