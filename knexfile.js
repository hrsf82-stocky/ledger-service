// Update with your config settings.
const { PGHOST, PGUSER, PGPW, PGDB, PGDBTEST, PGPORT } = require('./config.js');

module.exports = {
  test: {
    client: 'pg',
    connection: {
      host: PGHOST,
      database: PGDBTEST,
      port: PGPORT,
      user: PGUSER,
      password: PGPW
    },
    pool: {
      min: 2,
      max: 100
    },
    acquireConnectionTimeout: 5000,
    migrations: {
      directory: __dirname + '/db/migrations'
    },
    seeds: {
      directory: __dirname + '/db/seeds/test'
    }
  },

  development: {
    client: 'pg',
    connection: {
      host: PGHOST,
      database: PGDB,
      port: PGPORT,
      user: PGUSER,
      password: PGPW
    },
    pool: {
      min: 2,
      max: 100
    },
    acquireConnectionTimeout: 5000,
    migrations: {
      directory: __dirname + '/db/migrations'
    },
    seeds: {
      directory: __dirname + '/db/seeds/development'
    }
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 100
    },
    acquireConnectionTimeout: 5000,
    migrations: {
      directory: __dirname + '/db/migrations'
    },
    seeds: {
      directory: __dirname + '/db/seeds/production'
    }
  }
};
