const redis = require('redis');
const Promise = require('bluebird');
const { REDISHOST, REDISPORT } = require('../config.js');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

const redisClient = redis.createClient({
  host: REDISHOST,
  port: REDISPORT,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      // End reconnecting on a specific error and flush all commands with
      // a individual error
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after a specific timeout and flush all commands
      // with a individual error
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      // End reconnecting with built in error
      return undefined;
    }
    // reconnect after
    return Math.min(options.attempt * 100, 3000);
  }
});

redisClient.on('ready', () => {
  console.log(`Redis Ready at ${REDISHOST}:${REDISPORT}`);
});

redisClient.on('error', (err) => {
  console.error('Redis Error -', err);
});

module.exports = redisClient;
