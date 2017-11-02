const cron = require('cron');
const redisClient = require('../db/redisClient');

/**
 * Runs Every 5 seconds
 */
const job = new cron.CronJob({
  cronTime: '*/5 * * * * *',
  onTick: () => {
    console.log('Indicator Queue Worker Ticked');


  },
  start: false,
  timeZone: 'America/Los_Angeles'
});

job.start();

module.exports = job;
