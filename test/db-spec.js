process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const knex = require('../db/knex');
const queries = require('../db/queries');
const { expect } = require('chai');

const should = chai.should();

chai.use(chaiAsPromised);

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

  describe('getPair', () => {
    it('should return row data by using id query', (done) => {
      queries.getPair({ id: 1 })
        .then((res) => {
          res.should.be.a('object');
          res.should.have.property('id');
          res.id.should.equal(1);
          res.should.have.property('name');
          res.name.should.equal('EURUSD');
          res.should.have.property('major');
          res.major.should.equal(true);
          res.should.have.property('base');
          res.base.should.equal('EUR');
          res.should.have.property('quote');
          res.quote.should.equal('USD');
        })
        .then(done, done);
    });

    it('should return row data by using name query', (done) => {
      queries.getPair({ name: 'EURUSD' })
        .then((res) => {
          res.should.be.a('object');
          res.should.have.property('id');
          res.id.should.equal(1);
          res.should.have.property('name');
          res.name.should.equal('EURUSD');
          res.should.have.property('major');
          res.major.should.equal(true);
          res.should.have.property('base');
          res.base.should.equal('EUR');
          res.should.have.property('quote');
          res.quote.should.equal('USD');
        })
        .then(done, done);
    });
  });

  describe('updatePairById', () => {
    it('should return updated row with all its data', (done) => {
      queries.updatePairById(1, { name: 'ABCXYZ' })
        .then((res) => {
          res.should.be.a('array');
          res.length.should.equal(1);
          res[0].should.have.property('id');
          res[0].should.have.property('name');
          res[0].should.have.property('major');
          res[0].should.have.property('base');
          res[0].should.have.property('quote');
          res[0].name.should.equal('ABCXYZ');
        })
        .then(done, done);
    });

    it('should throw error with no id argument', () => {
      return queries.updatePairById().should.eventually.be.rejectedWith(Error);
    });
  });

  describe('deletePairById', () => {
    it('should return successfully delete targeted row', (done) => {
      queries.deletePairById(1)
        .then((res) => {
          console.log(res);
          res.should.equal(1);
          return queries.getAllPairs();
        })
        .then((pairs) => {
          console.log(pairs);
          pairs.length.should.equal(9);
        })
        .then(done, done);
    });

    it('should throw error with no id argument', () => {
      return queries.deletePairById().should.eventually.be.rejectedWith(Error);
    });
  });
});
