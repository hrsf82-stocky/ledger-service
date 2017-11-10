// a boilerplate setup for inserting data into the database
exports.seed = (knex, Promise) => {
  return knex('pairs').del() // Delete All existing entries
    .then(() => knex('ticks').del())
    .then(() => knex('s5bars').del())
    .then(() => (
      knex('pairs').insert([
        { name: 'EURUSD', major: true, base: 'EUR', quote: 'USD' },
        { name: 'GBPUSD', major: true, base: 'GBP', quote: 'USD' },
        { name: 'USDCAD', major: true, base: 'USD', quote: 'CAD' },
        { name: 'USDCHF', major: true, base: 'USD', quote: 'CHF' },
        { name: 'USDJPY', major: true, base: 'USD', quote: 'JPY' },
        { name: 'EURGBP', major: true, base: 'EUR', quote: 'GBP' },
        { name: 'EURCHF', major: true, base: 'EUR', quote: 'CHF' },
        { name: 'AUDUSD', major: true, base: 'AUD', quote: 'USD' },
        { name: 'EURJPY', major: true, base: 'EUR', quote: 'JPY' },
        { name: 'GBPJPY', major: true, base: 'GBP', quote: 'JPY' }
      ])));
};
