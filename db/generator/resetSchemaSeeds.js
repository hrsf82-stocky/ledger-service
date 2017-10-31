const knex = require('../knex');

const resetSchemaSeeds = (done) => {
  knex.migrate.rollback()
    .then(() => knex.migrate.latest())
    .then(() => knex.seed.run())
    .then(done)
    .catch(done);
};

resetSchemaSeeds((res) => {
  console.log(res);
  process.exit();
});
