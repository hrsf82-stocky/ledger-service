const cron = require('cron');
const moment = require('moment');
const redisClient = require('../db/redisClient');

const redisSSKey = 's5bars';


/**
 * Runs Every 5 seconds
 */
const job = new cron.CronJob({
  cronTime: '*/5 * * * * *',
  onTick: () => {
    console.log('Indicator Queue Worker Ticked');
    const currentUnix = moment().utc().unix();

    // Retrieve all ticks row ids with score up to the last 5 second interval mark
    redisClient.zrangeAsync(redisSSKey, 0, currentUnix, 'WITHSCORES')
      .then((reply) => {
        console.log(reply);
      })
      .catch(console.error);
  },
  start: false,
  timeZone: 'America/Los_Angeles'
});

job.start();

module.exports = job;
