const { Pool } = require('pg');
const { USER, PASSWORD } = require('../config.js');

const pool = new Pool({
  host: 'localhost',
  database: 'prices',
  user: USER,
  password: PASSWORD,
  port: 5432
});

pool.query('SELECT * from EURUSD LIMIT 10', (err, res) => {
  console.log(err, res);
  pool.end();
});
