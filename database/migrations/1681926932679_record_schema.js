'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RecordSchema extends Schema {
  up () {
    this.create('records', (table) => {
      table.string('uuid').notNullable().unique()
      table.string('wallet').notNullable()
      table.string('game_id').notNullable()
      table.boolean('is_win').defaultTo('false').notNullable()
      table.float('bet_amount').defaultTo(0).notNullable()
      table.float('multiply').defaultTo(1).notNullable()
      table.float('profit').defaultTo(0).notNullable()
      table.string('jwt_verifier').notNullable()
      table.string('payload_uuidv4').notNullable()
      table.primary(['uuid'])
      table.timestamps()
    })
  }

  down () {
    this.drop('records')
  }
}

module.exports = RecordSchema
