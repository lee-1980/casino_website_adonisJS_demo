'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ColUpdateGameIdSchema extends Schema {
  up () {
    this.alter('records', (table) => {
      table.string('game_id').notNullable().alter();
    })
  }

  down () {
    this.table('col_update_game_ids', (table) => {
      // reverse alternations
    })
  }
}

module.exports = ColUpdateGameIdSchema
