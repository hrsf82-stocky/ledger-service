exports.up = (knex, Promise) => {
  return knex.schema
    .createTableIfNotExists('pairs', (table) => {
      table.increments('id').primary();
      table.string('name', 6).notNullable().unique();
      table.boolean('major').notNullable();
      table.string('base', 3).notNullable();
      table.string('quote', 3).notNullable();
    })
    .createTableIfNotExists('ticks', (table) => {
      table.increments('id').primary();
      table.timestamp('dt').notNullable();
      table.decimal('bid', 10, 6).notNullable();
      table.decimal('ask', 10, 6).notNullable();
      table.bigInteger('bid_vol').notNullable();
      table.bigInteger('ask_vol').notNullable();
      table.integer('id_pairs').unsigned().notNullable();
      table.foreign('id_pairs').references('id').inTable('pairs').onDelete('cascade');
      table.unique(['dt', 'id_pairs']);
    })
    .createTableIfNotExists('s5bars', (table) => {
      table.increments('id').primary();
      table.timestamp('dt').notNullable();
      table.decimal('bid_h', 10, 6).notNullable();
      table.decimal('bid_l', 10, 6).notNullable();
      table.decimal('bid_o', 10, 6).notNullable();
      table.decimal('bid_c', 10, 6).notNullable();
      table.bigInteger('bid_v').notNullable();
      table.decimal('ask_h', 10, 6).notNullable();
      table.decimal('ask_l', 10, 6).notNullable();
      table.decimal('ask_o', 10, 6).notNullable();
      table.decimal('ask_c', 10, 6).notNullable();
      table.bigInteger('ask_v').notNullable();
      table.integer('ticks').notNullable();
      table.integer('id_pairs').unsigned().notNullable();
      table.foreign('id_pairs').references('id').inTable('pairs').onDelete('cascade');
      table.unique(['dt', 'id_pairs']);
    });
};

exports.down = (knex, Promise) => {
  return knex.schema
    .dropTable('s5bars')
    .dropTable('ticks')
    .dropTable('pairs');
};
