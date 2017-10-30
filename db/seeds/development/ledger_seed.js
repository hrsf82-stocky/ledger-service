// a boilerplate setup for inserting data into the database
exports.seed = (knex, Promise) => {
  return knex('pairs').del() // Delete All existing entries
    .then(() => {
      return knex('pairs').insert({
        { name: 'EURUSD', major: true, base: 'EUR', quote: 'USD' },
        { name: 'GBPUSD', major: true, base: 'GBP', quote: 'USD' },
        { name: 'GBPUSD', major: true, base: 'GBP', quote: 'USD' },

      })
    })
  // Deletes ALL existing entries
  // return knex('table_name').del()
  //   .then(() => {
  //     // Inserts seed entries
  //     return knex('table_name').insert([
  //       { id: 1, colName: 'rowValue1' },
  //       { id: 2, colName: 'rowValue2' },
  //       { id: 3, colName: 'rowValue3' }
  //     ]);
  //   });
};
