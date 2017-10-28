const { Pool } = require('pg');
const { Readable } = require('stream');
const copyFrom = require('pg-copy-streams').from;
const { PGHOST, PGUSER, PGPW, PGDATABASE, PGPORT } = require('../config.js');


const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPW,
  port: PGPORT,
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

// pool.query('SELECT * from EURUSD ORDER BY dt DESC LIMIT 10', (err, res) => {
//   console.log(err, res);
//   pool.end();
// });

const insertOHLC = (data) => {
  const params = data.map((_, idx) => `$${(idx + 1)}`);
  const query = `INSERT INTO 
    s5bars(dt, bid_h, bid_l, bid_o, bid_c, bid_v, ask_h, ask_l, ask_o, ask_c, ask_v, ticks, id_pairs)
    VALUES (${params.join(',')})`;

  return pool.query(query, data)
    .then((res) => {
      pool.end();
      return res;
    })
    .catch(console.error);
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




module.exports = {
  insertOHLC,
  insertBulkOHLC,
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
