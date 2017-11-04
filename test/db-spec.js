process.env.NODE_ENV = 'test';

const chai = require('chai');
const knex = require('../db/knex');
const queries = require('../db/queries');

const should = chai.should();

describe('Database Helper Specs', () => {
  beforeEach((done) => {
    knex.migrate.rollback()
      .then(() => knex.migrate.latest())
      .then(() => knex.seed.run())
      .then(() => done())
      .catch(done);
  });

  afterEach((done) => {
    knex.migrate.rollback()
      .then(() => done())
      .catch(done);
  });

  describe('getAllPairs', () => {
    it('should return all data in pairs table', (done) => {
      queries.getAllPairs()
        .then((res) => {
          res.should.be.a('array');
          res.length.should.equal(10);
          res[0].should.have.property('id');
          res[0].should.have.property('name');
          res[0].should.have.property('major');
          res[0].should.have.property('base');
          res[0].should.have.property('quote');
        })
        .then(done, done);
    });
  });
});
