const queries = require('../db/queries');
const { parseDateToUnixTime5S, hasValidTickData } = require('./utility');
const redisClient = require('../db/redisClient');
const { sendTicksToES } = require('../db/esClient');

const redisSSKey = 's5bars';

const priceProcessor = ({ instrument, time, bid, ask, bid_vol, ask_vol }) => {
  // Verify input data integrity
  if (!hasValidTickData({ instrument, time, bid, ask, bid_vol, ask_vol })) {
    return Promise.reject(new Error('Price Queue Incoming Input types are invalid'));
  }

  // parse time string to closest 5 second UNIX integer
  const unixTimeS5 = parseDateToUnixTime5S(time);

  // get instrument/pair id by instrument name
  return queries.getPair({ name: instrument.toUpperCase() })
    .then((pair) => {
      if (!pair) {
        throw new Error('Pair not found in database');
      } else {
        const pairID = pair.id;

        return queries.addTick({
          bid,
          ask,
          bid_vol,
          ask_vol,
          id_pairs: pairID,
          dt: time
        });
      }
    })
    .then((newTick) => {
      const tickID = newTick[0].id;

      // Send tick data to elasticsearch
      sendTicksToES({ instrument, bid, ask, bid_vol, ask_vol, dt: newTick[0].dt })
        .then((res) => {
          console.log('Tick sent to Elasticsearch', res);
        })
        .catch((err) => {
          console.error('Tick failed to sent to Elasticsearch');
        });

      // insert new tick id (member) and closest 5 sec unix value (sec) to sorted set in redis
      return redisClient.zaddAsync(redisSSKey, unixTimeS5, tickID);
    });
};

module.exports = priceProcessor;
