const { Pool } = require('pg');
const { PGHOST, PGUSER, PGPW, PGDATABASE, PGPORT } = require('../config.js');

const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPW,
  port: PGPORT,
  max: 25
});

// the pool with emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// pool.query('SELECT * from EURUSD ORDER BY dt DESC LIMIT 10', (err, res) => {
//   console.log(err, res);
//   pool.end();
// });


module.exports = {
  query: (text, params, callback) => {
    const start = Date.now();
    return pool.query(text, params, (err, res) => {
      const duration = Date.now() - start;
      console.log('executed query', { text, duration, rows: res ? res.rowCount : null });
      callback(err, res);
    });
  }
};
