const { Pool } = require('pg');
const { Readable } = require('stream');
const copyFrom = require('pg-copy-streams').from;
const { PGHOST, PGUSER, PGPW, PGDB, PGPORT } = require('../config.js');

const pool = new Pool({
  host: process.env.PGHOST || PGHOST,
  database: process.env.PGDB || PGDB,
  user: process.env.PGUSER || PGUSER,
  password: process.env.PGPW || PGPW,
  port: process.env.PGPORT || PGPORT,
  max: 25,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// the pool with emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// query decorator that with an approximate timer
const queryTimer = (query, params = []) => {
  const start = Date.now();
  return pool.query(query, params)
    .then((res) => {
      pool.end();
      const duration = Date.now() - start;
      console.log('executed query', { query, duration, rowCount: res ? res.rowCount : null });
      // TODO: Send the query data to Elasticsearch
      return res;
    })
    .catch(console.error);
};

const updateRowById = (table, id, colVals) => {
  const cols = Object.keys(colVals);
  const dollars = cols.map((_, idx) => `$${(idx + 1)}`);
  const values = cols.map(key => colVals[key]);
  const query = `UPDATE ${table}
    SET (${cols.join(', ')}) = (${dollars.join(', ')})
    WHERE id = ${id} 
    RETURNING *`;
  return queryTimer(query, values);
};

/**
 * pairs table helpers
 */
const findPair = (name) => {
  const query = 'SELECT * FROM pairs WHERE name = $1';
  return queryTimer(query, [name]);
};

const findAllPairs = () => {
  const query = 'SELECT * FROM pairs';
  return queryTimer(query, []);
};

const insertPair = (name, isMajor) => {
  const query = `INSERT INTO 
    pairs (name, major, base, quote)
    VALUES ($1, $2, $3, $4) 
    RETURNING *`;
  const params = [name, isMajor, name.slice(0, 3), name.slice(3, 6)];
  return queryTimer(query, params);
};

const updatePairById = (id, colVals) => (updateRowById('pairs', id, colVals));

/**
 * s5bars table helpers
 */
const insertOHLC = (rowData) => {
  const subs = rowData.map((_, idx) => `$${(idx + 1)}`);
  const query = `INSERT INTO 
    s5bars (dt, bid_h, bid_l, bid_o, bid_c, bid_v, ask_h, ask_l, ask_o, ask_c, ask_v, ticks, id_pairs)
    VALUES (${subs.join(',')}) 
    RETURNING *`;
  return queryTimer(query, rowData);
};

const insertBulkOHLC = bulkData => (
  new Promise((resolve, reject) => {
    pool.connect()
      .then((client) => {
        const done = (err) => {
          client.release();
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        };
        const onError = (err) => {
          console.error(err);
          done(err);
        };
        const copy = 'COPY s5bars (dt, bid_h, bid_l, bid_o, bid_c, bid_v, ask_h, ask_l, ask_o, ask_c, ask_v, ticks, id_pairs) FROM STDIN';
        const stream = client.query(copyFrom(copy));
        let currentIndex = 0;

        const rs = new Readable({
          read() {
            if (currentIndex === bulkData.length) {
              rs.push(null);
            } else {
              const item = bulkData[currentIndex];
              rs.push(item.join('\t') + '\n');
              currentIndex += 1;
            }
          }
        });

        rs.on('error', onError);
        stream.on('error', onError);
        stream.on('end', done);
        rs.pipe(stream);
      })
      .catch(console.error);
  })
);

// findAllPairs().then(console.log);
// insertOHLC(['2001-09-28 01:00:00', 1.33, 1.44, 1.55, 1.77, 133322, 1.66, 1.22, 1.76, 1.88, 223333, 123322, 12])
//   .then(res => console.log(res.rows[0]));
// findPair('EURUSD').then(res => console.log(res.rows[0]));
// insertPair('CNYMXN', false).then(res => console.log(res.rows[0]));

module.exports = {
  findPair,
  insertPair,
  insertOHLC,
  insertBulkOHLC,
  updatePairById,
  findAllPairs,
  queryTimer,
  query: (text, params, callback) => {
    const start = Date.now();
    return pool.query(text, params, (err, res) => {
      const duration = Date.now() - start;
      console.log('executed query', { text, duration, rows: res ? res.rowCount : null });
      callback(err, res);
    });
  },
  getClient: (callback) => {
    pool.connect((err, client, done) => {
      callback(err, client, done);
    });
  }
};
