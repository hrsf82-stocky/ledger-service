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
      ])))
    .then(() => (
      knex('ticks').insert([
        { id_pairs: 1, dt: '2017-10-24 00:00:00.250000', bid: 1.17551, ask: 1.17548, bid_vol: 1000000, ask_vol: 1500000 },
        { id_pairs: 1, dt: '2017-10-24 00:00:00.850000', bid: 1.17549, ask: 1.17548, bid_vol: 1000000, ask_vol: 1000000 },
        { id_pairs: 1, dt: '2017-10-24 00:00:01.150000', bid: 1.17548, ask: 1.17545, bid_vol: 1310000, ask_vol: 1100000 },
        { id_pairs: 1, dt: '2017-10-24 00:00:01.450000', bid: 1.17548, ask: 1.17544, bid_vol: 2440000, ask_vol: 3070000 },
        { id_pairs: 1, dt: '2017-10-24 00:00:02.100000', bid: 1.17550, ask: 1.17547, bid_vol: 1250000, ask_vol: 1500000 },
        { id_pairs: 1, dt: '2017-10-24 00:00:02.470000', bid: 1.17552, ask: 1.17548, bid_vol: 2140000, ask_vol: 2620000 },
        { id_pairs: 1, dt: '2017-10-24 00:00:03.060000', bid: 1.17554, ask: 1.17549, bid_vol: 8810000, ask_vol: 3560000 },
        { id_pairs: 1, dt: '2017-10-24 00:00:03.880000', bid: 1.17553, ask: 1.17549, bid_vol: 3190000, ask_vol: 1870000 },
        { id_pairs: 1, dt: '2017-10-24 00:00:04.120000', bid: 1.17552, ask: 1.17548, bid_vol: 1120000, ask_vol: 3750000 },
        { id_pairs: 1, dt: '2017-10-24 00:00:04.720000', bid: 1.17553, ask: 1.17549, bid_vol: 4500000, ask_vol: 1870000 },
        { id_pairs: 2, dt: '2017-10-24 00:00:00.286000', bid: 1.31520, ask: 1.31510, bid_vol: 1690000, ask_vol: 1690000 },
        { id_pairs: 2, dt: '2017-10-24 00:00:00.992000', bid: 1.31521, ask: 1.31510, bid_vol: 2440000, ask_vol: 1870000 },
        { id_pairs: 2, dt: '2017-10-24 00:00:01.520000', bid: 1.31521, ask: 1.31511, bid_vol: 2540000, ask_vol: 1310000 },
        { id_pairs: 2, dt: '2017-10-24 00:00:02.786000', bid: 1.31521, ask: 1.31511, bid_vol: 2250000, ask_vol: 1250000 },
        { id_pairs: 2, dt: '2017-10-24 00:00:03.314000', bid: 1.31521, ask: 1.31510, bid_vol: 2250000, ask_vol: 3560000 },
        { id_pairs: 2, dt: '2017-10-24 00:00:03.840000', bid: 1.31521, ask: 1.31512, bid_vol: 2250000, ask_vol: 1190000 },
        { id_pairs: 2, dt: '2017-10-24 00:00:04.516000', bid: 1.31521, ask: 1.31512, bid_vol: 1690000, ask_vol: 1000000 },
        { id_pairs: 2, dt: '2017-10-24 00:00:05.521000', bid: 1.31522, ask: 1.31512, bid_vol: 1220000, ask_vol: 2250000 },
        { id_pairs: 2, dt: '2017-10-24 00:00:05.573000', bid: 1.31530, ask: 1.31516, bid_vol: 1030000, ask_vol: 2620000 },
        { id_pairs: 2, dt: '2017-10-24 00:00:06.729000', bid: 1.31529, ask: 1.31519, bid_vol: 1400000, ask_vol: 1870000 }
      ])))
    .then(() => (
      knex('s5bars').insert([
        { id_pairs: 1,
          dt: '2017-08-01 05:00:00-07',
          bid_h: 1.18116,
          bid_l: 1.18100,
          bid_o: 1.18100,
          bid_c: 1.18114,
          bid_v: 475000,
          ask_h: 1.17548,
          ask_l: 1.18114,
          ask_o: 1.18114,
          ask_c: 1.18126,
          ask_v: 287000,
          ticks: 6 },
        { id_pairs: 1,
          dt: '2017-08-01 05:00:05-07',
          bid_h: 1.18120,
          bid_l: 1.18113,
          bid_o: 1.18118,
          bid_c: 1.18113,
          bid_v: 103000,
          ask_h: 1.18132,
          ask_l: 1.18125,
          ask_o: 1.18132,
          ask_c: 1.18125,
          ask_v: 526000,
          ticks: 8 },
        { id_pairs: 1,
          dt: '2017-08-01 05:00:10-07',
          bid_h: 1.18115,
          bid_l: 1.18105,
          bid_o: 1.18115,
          bid_c: 1.18106,
          bid_v: 373000,
          ask_h: 1.18128,
          ask_l: 1.18118,
          ask_o: 1.18128,
          ask_c: 1.18120,
          ask_v: 329000,
          ticks: 6 },
        { id_pairs: 1,
          dt: '2017-08-01 05:00:15-07',
          bid_h: 1.18130,
          bid_l: 1.18107,
          bid_o: 1.18107,
          bid_c: 1.18130,
          bid_v: 153000,
          ask_h: 1.18143,
          ask_l: 1.18120,
          ask_o: 1.18120,
          ask_c: 1.18143,
          ask_v: 236000,
          ticks: 16 },
        { id_pairs: 1,
          dt: '2017-08-01 05:00:20-07',
          bid_h: 1.18136,
          bid_l: 1.18133,
          bid_o: 1.18135,
          bid_c: 1.18133,
          bid_v: 587000,
          ask_h: 1.18148,
          ask_l: 1.18144,
          ask_o: 1.18148,
          ask_c: 1.18144,
          ask_v: 131000,
          ticks: 7 }
      ])));
};
