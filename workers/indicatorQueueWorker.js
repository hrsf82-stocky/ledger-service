const cron = require('cron');
const moment = require('moment');
const _ = require('lodash');
const Promise = require('bluebird');
const redisClient = require('../db/redisClient');
const queries = require('../db/queries');
const { computeOHLCFromTicks } = require('../lib/utility');
const { pushIndicatorMsgRT } = require('./indicatorQueuePusher');
const { sendS5BarsToES } = require('../db/esClient');
const statsDClient = require('../db/statsDClient');

const has = Object.prototype.hasOwnProperty;

/**
 * Runs Every 5 seconds
 */
const job = new cron.CronJob({
  cronTime: '*/5 * * * * *',
  start: false,
  timeZone: 'America/Los_Angeles',
  onTick: () => {
    const start = Date.now();
    statsDClient.increment('.ledger.worker.s5bars.received');
    console.log('Indicator Queue Worker Ticked at', moment().toISOString());

    const redisSSKey = 's5bars';
    // Local cache for pair id and instrument name mapping
    const idPairs = {};
    // Current Unix Time
    const currentUnix = moment().valueOf();
    // Array of unique 5 sec Unix timestamps
    let s5UnixTimes;
    // Array of array of tick ids that corresponds to same position in s5UnixTimes;
    let s5UnixTickIds;

    // Get all pair id and name combos
    queries.getAllPairs()
      .then((pairs) => {
        pairs.forEach((pair) => {
          idPairs[pair.id] = pair.name;
        });

        // Retrieve all ticks row ids with score up to the last 5 second interval mark
        return redisClient.zrangebyscoreAsync(redisSSKey, 0, currentUnix, 'WITHSCORES');
      })
      .then((reply) => {
        if (reply.length === 0) {
          throw new RangeError('No new ticks data found');
        }
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
        // return Promise.map(s5UnixTickIds, queries.getTicksByIds);

        // Break down getTicksByIds operations into chunks of 5 - to solve pg too many clients issue
        const s5UnixTickIdsByFive = _.chunk(s5UnixTickIds, 5);
        let rowData = [];

        return s5UnixTickIdsByFive.reduce((previous, current, index, array) => (
          previous.then((rowChunks) => {
            if (index > 0) {
              rowData = rowData.concat(rowChunks);
            }
            return Promise.map(current, queries.getTicksByIds);
          })
        ), Promise.resolve())
          .then((lastChunk) => {
            rowData = rowData.concat(lastChunk);
            return rowData;
          });
      })
      // res => array of row data that corresponds to same position in s5UnixTimes;
      .then((results) => {
        // Split inner array to individual array per pair id
        const rowsByPairID = results.map((rows) => {
          return _.toPairs(_.groupBy(rows, row => row.id_pairs)).map(tuple => tuple[1]);
        });

        // Calculate OHLC values for each set of ticks
        const ohlcRows = _.flatten(rowsByPairID.map((unixRows, idx) => (
          unixRows.map(pairRows => computeOHLCFromTicks(pairRows, s5UnixTimes[idx]))
        )));

        return queries.addBulkS5Bars(ohlcRows);
      })
      .then((newBars) => {
        const newIndicators = newBars.map((bar) => {
          const output = {
            instrument: idPairs[bar.id_pairs],
            dt: bar.dt,
            ticks: bar.ticks,
            bid_h: bar.bid_h,
            bid_l: bar.bid_l,
            bid_o: bar.bid_o,
            bid_c: bar.bid_c,
            bid_v: bar.bid_v,
            ask_h: bar.ask_h,
            ask_l: bar.ask_l,
            ask_o: bar.ask_o,
            ask_c: bar.ask_c,
            ask_v: bar.ask_v };

          // Send s5bars data to elasticsearch
          sendS5BarsToES(output)
            .then((res) => {
              console.log('s5bars sent to Elasticsearch', res);
            })
            .catch((err) => {
              console.error('s5bars failed to sent to Elasticsearch');
            });

          return output;
        });
        // Push new indicators on to Indicator Queue
        return pushIndicatorMsgRT(newIndicators, 'realtime');
      })
      .then((sqsResult) => {
        // Delete processed redis data by score
        return redisClient.zremrangebyscoreAsync(redisSSKey, 0, currentUnix);
      })
      .then((reply) => {
        // Successiful worker operations
        statsDClient.increment('.ledger.worker.s5bars.success');
        statsDClient.timing('.ledger.worker.s5bars.success.latency_ms', Date.now() - start);
        console.log(reply);
      })
      .catch((err) => {
        if (err.name === 'RangeError') {
          console.error(err.message);
        } else {
          statsDClient.increment('.ledger.worker.s5bars.fail');
          statsDClient.timing('.ledger.worker.s5bars.fail.latency_ms', Date.now() - start);
          console.error(err.stack);
        }
      });
  }
});

if (!module.parent) {
  job.start();
}

module.exports = job;
