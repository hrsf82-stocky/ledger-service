const cron = require('cron');
const moment = require('moment');
const queries = require('../db/queries');

/**
 * Runs at 00:01AM everyday
 */
const job = new cron.CronJob({
  cronTime: '00 01 00 * * *',
  start: true,
  runOnInit: false,
  timeZone: 'America/Los_Angeles',
  onTick: () => {
    console.log('Materialized View Refresh Worker Ticked at', moment().toISOString());

    queries.refreshAllMviews(true)
      .then((res) => {
        console.log('Materialzied view refresh all done at', moment().toISOString());
      })
      .catch((err) => {
        console.error(err.stack);
      });
  }
});

if (!module.parent) {
  job.start();
}

module.exports = job;
