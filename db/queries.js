const Promise = require('bluebird');
const knex = require('./knex');
const { isValidDateTime } = require('../lib/utility');

// References to Postgres tables
const pairs = () => knex('pairs');
const ticks = () => knex('ticks');
const s5bars = () => knex('s5bars');

/**
 * Pairs Table Helper Functions
 */
const getAllPairs = () => {
  return pairs().select();
};

const getPair = ({ id, name }) => {
  if (id) {
    return pairs().where('id', parseInt(id, 10)).first();
  }
  return pairs().where('name', name).first();
};

const addPair = ({ name, major = false }) => {
  return pairs()
    .insert({
      name,
      major,
      base: name.slice(0, 3),
      quote: name.slice(3, 6)
    })
    .returning('*');
};

const updatePairById = (id, updates) => {
  if (!id) {
    return Promise.reject(new Error('Pair ID not provided'));
  }
  return pairs()
    .where('id', parseInt(id, 10))
    .update(updates)
    .returning('*');
};

const deletePairById = (id) => {
  if (!id) {
    return Promise.reject(new Error('Pair ID not provided'));
  }
  return pairs().where('id', parseInt(id, 10)).del();
};


/**
 * Ticks Table Helper Functions
 */
const getTicksByTimeRangeAndPairId = ({ pairID, start, end }) => {
  if (pairID === undefined) {
    return Promise.reject(new Error('Pair ID not provided'));
  }
  if ((start && !isValidDateTime(start)) || (end && !isValidDateTime(end))) {
    return Promise.reject(new TypeError('Invalid start or end timestamp input'));
  }
  // return all ticks data for a pair if no start timestamp is provided
  if (!start) {
    return ticks().where('id_pairs', pairID);
  }
  // return ticks data from start date to current timestamp if no end date is provided
  if (start && !end) {
    return ticks().where('id_pairs', pairID).andWhere('dt', '>', start);
  }
  // return ticks data between start and end timestamp
  return ticks().where('id_pairs', pairID).whereBetween('dt', [start, end]);
};

const addTick = ({ dt, bid, ask, bid_vol, ask_vol, id_pairs }) => {
  return ticks()
    .insert({ dt, bid, ask, bid_vol, ask_vol, id_pairs })
    .returning('*');
};

const updateTickById = (id, updates) => {
  if (id === undefined) {
    return Promise.reject(new Error('Tick ID not provided'));
  }
  return ticks()
    .where('id', parseInt(id, 10))
    .update(updates)
    .returning('*');
};

const deleteTickById = (id) => {
  if (id === undefined) {
    return Promise.reject(new Error('Tick ID not provided'));
  }
  return ticks().where('id', parseInt(id, 10)).del();
};

const getTicksByIds = (ids) => {
  return ticks().whereIn('id', ids);
};

/**
 * s5bars (5 second OHLC) Table Helper Functions
 */
const getS5BarsByTimeRangeAndPairID = ({ pairID, start, end }) => {
  if (pairID === undefined) {
    return Promise.reject(new Error('Pair ID not provided'));
  }
  if ((start && !isValidDateTime(start)) || (end && !isValidDateTime(end))) {
    return Promise.reject(new TypeError('Invalid start or end timestamp input'));
  }
  // return all s5bars data for a pair if no start timestamp is provided
  if (!start) {
    return s5bars().where('id_pairs', pairID);
  }
  // return s5bars data from start date to current timestamp if no end date is provided
  if (start && !end) {
    return s5bars().where('id_pairs', pairID).andWhere('dt', '>', start);
  }
  // return s5bars data between start and end timestamp
  return s5bars().where('id_pairs', pairID).whereBetween('dt', [start, end]);
};

const addS5Bar = (rowData) => {
  const {
    dt,
    ticks,
    id_pairs,
    bid_h,
    bid_l,
    bid_o,
    bid_c,
    bid_v,
    ask_h,
    ask_l,
    ask_o,
    ask_c,
    ask_v } = rowData;

  if (Date.parse(dt) % 5000 !== 0) {
    return Promise.reject(new RangeError('dt is not in 5 second interval'));
  }

  return s5bars()
    .insert({
      dt,
      ticks,
      id_pairs,
      bid_h,
      bid_l,
      bid_o,
      bid_c,
      bid_v,
      ask_h,
      ask_l,
      ask_o,
      ask_c,
      ask_v })
    .returning('*');
};

const updateS5BarsById = (id, updates) => {
  if (id === undefined) {
    return Promise.reject(new Error('s5bars ID not provided'));
  }
  return s5bars()
    .where('id', parseInt(id, 10))
    .update(updates)
    .returning('*');
};

const deleteS5BarsById = (id) => {
  if (id === undefined) {
    return Promise.reject(new Error('s5bars ID not provided'));
  }
  return s5bars().where('id', parseInt(id, 10)).del();
};

/**
 * Materialized Views for s5bars (5 second OHLC) Table Helper Functions
 */
// const addMviewByPairName = (pair, interval, length = '1 year') => {
//   if (!pair || !interval) {
//     return Promise.reject(new Error('pair name or interval not provided'));
//   }

// };

module.exports = {
  getAllPairs,
  getPair,
  addPair,
  updatePairById,
  getTicksByIds,
  deletePairById,
  getTicksByTimeRangeAndPairId,
  addTick,
  updateTickById,
  deleteTickById,
  getS5BarsByTimeRangeAndPairID,
  addS5Bar,
  updateS5BarsById,
  deleteS5BarsById
};
