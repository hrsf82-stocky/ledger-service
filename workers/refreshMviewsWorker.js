const cron = require('cron');
const moment = require('moment');
const queries = require('../db/queries');
const statsDClient = require('../db/statsDClient');

/**
 * Runs at 00:01AM everyday
 */
const job = new cron.CronJob({
  cronTime: '00 01 00 * * *',
  start: true,
  runOnInit: false,
  timeZone: 'America/Los_Angeles',
  onTick: () => {
    const start = Date.now();
    statsDClient.increment('.ledger.worker.mviews.received');
    console.log('Materialized View Refresh Worker Ticked at', moment().toISOString());

    queries.refreshAllMviews(true)
      .then((res) => {
        statsDClient.increment('.ledger.worker.mviews.success');
        statsDClient.timing('.ledger.worker.mviews.success.latency_ms', Date.now() - start);
        console.log('Materialzied view refresh all done at', moment().toISOString());
      })
      .catch((err) => {
        statsDClient.increment('.ledger.worker.mviews.fail');
        statsDClient.timing('.ledger.worker.mviews.fail.latency_ms', Date.now() - start);
        console.error(err.stack);
      });
  }
});

if (!module.parent) {
  job.start();
}

module.exports = job;
