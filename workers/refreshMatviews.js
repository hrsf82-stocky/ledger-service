const cron = require('cron');
const moment = require('moment');
const _ = require('lodash');
const Promise = require('bluebird');
const queries = require('../db/queries');
const { computeOHLCFromTicks } = require('../lib/utility');

const has = Object.prototype.hasOwnProperty;

/**
 * Runs Every 5 seconds
 */
const job = new cron.CronJob({

});

if (!module.parent) {
  job.start();
}

module.exports = job;
