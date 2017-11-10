// Update with your config settings.
const { PGHOST, PGUSER, PGPW, PGDB, PGDBTEST, RDSPGHOST, PGPORT } = require('./config.js');

module.exports = {
  test: {
    client: 'pg',
    connection: {
      host: process.env.PGHOST || PGHOST,
      database: process.env.PGDBTEST || PGDBTEST,
      port: process.env.PGPORT || PGPORT,
      user: process.env.PGUSER || PGUSER,
      password: process.env.PGPW || PGPW
    },
    pool: {
      min: 2,
      max: 50,
      requestTimeout: 9900
    },
    acquireConnectionTimeout: 10000,
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
      host: process.env.PGHOST || PGHOST,
      database: process.env.PGDB || PGDB,
      port: process.env.PGPORT || PGPORT,
      user: process.env.PGUSER || PGUSER,
      password: process.env.PGPW || PGPW
    },
    pool: {
      min: 2,
      max: 50,
      requestTimeout: 9900
    },
    acquireConnectionTimeout: 10000,
    migrations: {
      directory: __dirname + '/db/migrations'
    },
    seeds: {
      directory: __dirname + '/db/seeds/development'
    }
  },

  production: {
    client: 'pg',
    connection: {
      host: process.env.RDSPGHOST || RDSPGHOST,
      database: process.env.PGDB || PGDB,
      port: process.env.PGPORT || PGPORT,
      user: process.env.PGUSER || PGUSER,
      password: process.env.PGPW || PGPW
    },
    pool: {
      min: 2,
      max: 50,
      requestTimeout: 9900
    },
    acquireConnectionTimeout: 10000,
    migrations: {
      directory: __dirname + '/db/migrations'
    },
    seeds: {
      directory: __dirname + '/db/seeds/production'
    }
  }
};
