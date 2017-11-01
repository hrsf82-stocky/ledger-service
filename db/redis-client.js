const redis = require('redis');
const { REDISHOST, REDISPORT } = require('../config.js');

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
  console.log(`Redis is ready at Host:${REDISHOST}, Port:${REDISPORT}`);
});

redisClient.on('error', () => {
  console.error('Error in Redis Client');
});

module.exports = redisClient;
