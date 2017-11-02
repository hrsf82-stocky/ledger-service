const knex = require('../knex');

const resetSchemaSeeds = () => {
  return knex.migrate.rollback()
    .then(() => knex.migrate.latest())
    .then(() => knex.seed.run());
};

if (!module.parent) {
  resetSchemaSeeds()
    .then(console.log)
    .catch(console.error);
}

module.exports = resetSchemaSeeds;
