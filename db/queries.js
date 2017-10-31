const knex = require('./knex');

const pairs = () => knex('pairs');
const ticks = () => knex('ticks');
const s5bars = () => knex('s5bars');

/**
 * pairs table helper functions
 */
const getAllPairs = () => {
  return pairs().select().catch(console.error);
};

const getSinglePair = ({ id, name }) => {
  if (id !== undefined) {
    return pairs().where('id', parseInt(id, 10)).first().catch(console.error);
  }
  return pairs().where('name', name).first().catch(console.error);
};

const addPair = ({ name, isMajor }) => {
  return pairs()
    .insert({
      name,
      major: isMajor,
      base: name.slice(0, 3),
      quote: name.slice(3, 6)
    })
    .returning('*')
    .catch(console.error);
};

const updatePairById = (id, updates) => {
  return pairs()
    .where('id', parseInt(id, 10))
    .update(updates)
    .returning('*')
    .catch(console.error);
};

const deletePairById = (id) => {
  return pairs().where('id', parseInt(id, 10)).del().catch(console.error);
};


module.exports = {
  getAllPairs,
  getSinglePair,
  addPair,
  updatePairById,
  deletePairById
};
