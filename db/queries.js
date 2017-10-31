const moment = require('moment');
const Promise = require('bluebird');
const knex = require('./knex');

const pairs = () => knex('pairs');
const ticks = () => knex('ticks');
const s5bars = () => knex('s5bars');


// General helper functions
const isValidDateTime = (timestamp) => {
  return moment(timestamp, moment.ISO_8601, true).isValid();
};


/**
 * pairs table helper functions
 */
const getAllPairs = () => {
  return pairs().select();
};

const getPair = ({ id, name }) => {
  if (id !== undefined) {
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
  if (id === undefined) {
    return Promise.reject(new Error('pairID needs to be provided'));
  }

  return pairs()
    .where('id', parseInt(id, 10))
    .update(updates)
    .returning('*');
};

const deletePairById = (id) => {
  if (id === undefined) {
    return Promise.reject(new Error('pairID needs to be provided'));
  }

  return pairs().where('id', parseInt(id, 10)).del();
};


/**
 * ticks table helper functions
 */
const getTicksByTimeRangeAndPairID = ({ pairID, start, end }) => {
  if (pairID === undefined) {
    return Promise.reject(new Error('pairID needs to be provided'));
  }

  if ((start && !isValidDateTime(start)) || (end && !isValidDateTime(end))) {
    return Promise.reject(new TypeError('Not valid start or end timestamp input'));
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

// const getTickById

module.exports = {
  getAllPairs,
  getPair,
  addPair,
  updatePairById,
  deletePairById,
  getTicksByTimeRangeAndPairID
};
