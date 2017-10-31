const knex = require('./knex');

const pairs = () => knex('pairs');
const ticks = () => knex('ticks');
const s5bars = () => knex('s5bars');

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
  return pairs()
    .where('id', parseInt(id, 10))
    .update(updates)
    .returning('*');
};

const deletePairById = (id) => {
  return pairs().where('id', parseInt(id, 10)).del();
};


module.exports = {
  getAllPairs,
  getPair,
  addPair,
  updatePairById,
  deletePairById
};
