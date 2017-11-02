const cron = require('cron');
const moment = require('moment');
const _ = require('lodash');
const Promise = require('bluebird');
const redisClient = require('../db/redisClient');
const queries = require('../db/queries');
const { computeOHLCFromTicks } = require('../lib/utility');


const has = Object.prototype.hasOwnProperty;
const redisSSKey = 's5bars';


/**
 * Runs Every 5 seconds
 */
const job = new cron.CronJob({
  cronTime: '*/5 * * * * *',
  onTick: () => {
    console.log('Indicator Queue Worker Ticked');

    // Current Unix Time
    const currentUnix = moment().utc().unix();
    // Array of unique 5 sec Unix timestamps
    let s5UnixTimes;
    // Array of array of tick ids that corresponds to same position in s5UnixTimes;
    let s5UnixTickIds;

    // Retrieve all ticks row ids with score up to the last 5 second interval mark
    redisClient.zrangeAsync(redisSSKey, 0, currentUnix, 'WITHSCORES')
      .then((reply) => {
        // Convert flat reply array into chucks of [id, unixtime] pairs
        const tuples = _.chunk(reply, 2);

        // Group all ids with same unixtime together as key(unix)-val([...ids]) pairs
        const s5Ticks = {};
        tuples.forEach((tuple) => {
          const id = tuple[0];
          const unix = tuple[1];

          if (!has.call(s5Ticks, unix)) {
            s5Ticks[unix] = [];
          }

          s5Ticks[unix].push(id);
        });

        const s5TicksTuples = _.toPairs(s5Ticks);
        s5UnixTimes = s5TicksTuples.map(tuple => tuple[0]);
        s5UnixTickIds = s5TicksTuples.map(tuple => tuple[1]);

        // request rows data for each unix timestamp ids
        return Promise.map(s5UnixTickIds, queries.getTicksByIds);
      })
      // res => array of row data that corresponds to same position in s5UnixTimes;
      .then((results) => {
        // Split inner array to individual array per pair id
        const rowsByPairID = results.map((rows) => {
          return _.toPairs(_.groupBy(rows, row => row.id_pairs)).map(tuple => tuple[1]);
        });

        // console.log(rowsByPairID);

        const ohlcRows = rowsByPairID.map((unixRows, idx) => (
          unixRows.map(pairRows => computeOHLCFromTicks(pairRows, s5UnixTimes[idx]))
        ));

        console.log(ohlcRows);
      })
      .catch(console.error);
  },
  start: false,
  timeZone: 'America/Los_Angeles'
});

job.start();

module.exports = job;
