process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const knex = require('../db/knex');
const queries = require('../db/queries');
const { expect } = require('chai');
const Promise = require('bluebird');

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
      let pairsCount;

      knex('pairs').select()
        .then((res) => {
          pairsCount = res.length;
          return queries.deletePairById(1);
        })
        .then((res) => {
          res.should.equal(1);
          return knex('pairs').select();
        })
        .then((pairs) => {
          pairs.length.should.equal(pairsCount - 1);
        })
        .then(done, done);
    });

    it('should throw error with no id argument', () => {
      return queries.deletePairById().should.eventually.be.rejectedWith(Error);
    });
  });

  describe('getTicksByTimeRangeAndPairId', () => {
    it('should return all ticks data with no start and end datas provided', (done) => {
      queries.getTicksByTimeRangeAndPairId({ pairID: 1 })
        .then(((res) => {
          res.should.be.a('array');
          res.length.should.equal(10);
          res[0].should.be.a('object');
          res[0].should.have.property('id');
          res[0].should.have.property('id_pairs');
          res[0].id_pairs.should.equal(1);
          res[0].should.have.property('dt');
          res[0].should.have.property('bid');
          res[0].should.have.property('ask');
          res[0].should.have.property('bid_vol');
          res[0].should.have.property('ask_vol');
        }))
        .then(done, done);
    });

    it('should return all ticks data from start date to current timestamp if no end date is provided', (done) => {
      queries.getTicksByTimeRangeAndPairId({ pairID: 1, start: '2017-10-24' })
        .then(((res) => {
          res.should.be.a('array');
          res.length.should.equal(4);
          res[0].should.be.a('object');
          res[0].should.have.property('id');
          res[0].should.have.property('id_pairs');
          res[0].id_pairs.should.equal(1);
          res[0].should.have.property('dt');
          res[0].should.have.property('bid');
          res[0].should.have.property('ask');
          res[0].should.have.property('bid_vol');
          res[0].should.have.property('ask_vol');
        }))
        .then(done, done);
    });

    it('should return all ticks data from start to end dates', (done) => {
      queries.getTicksByTimeRangeAndPairId({ pairID: 1, start: '2017-10-21', end: '2017-10-24' })
        .then(((res) => {
          res.should.be.a('array');
          res.length.should.equal(6);
          res[0].should.be.a('object');
          res[0].should.have.property('id');
          res[0].should.have.property('id_pairs');
          res[0].id_pairs.should.equal(1);
          res[0].should.have.property('dt');
          res[0].should.have.property('bid');
          res[0].should.have.property('ask');
          res[0].should.have.property('bid_vol');
          res[0].should.have.property('ask_vol');
        }))
        .then(done, done);
    });

    it('should throw error with no input argument', () => {
      return queries.getTicksByTimeRangeAndPairId().should.eventually.be.rejectedWith(Error);
    });

    it('should throw error with incorrect start or end date format', () => {
      return Promise.all([
        queries.getTicksByTimeRangeAndPairId({ start: 'abc' }).should.eventually.be.rejectedWith(Error),
        queries.getTicksByTimeRangeAndPairId({ end: 'abc' }).should.eventually.be.rejectedWith(Error)
      ]);
    });
  });

  describe('addTick', () => {
    it('should return new row data matching input', (done) => {
      const params = {
        dt: '2000-01-01 00:00:00.000000',
        bid: '1.500000',
        ask: '2.500000',
        bid_vol: '100',
        ask_vol: '200',
        id_pairs: 1 };

      queries.addTick(params)
        .then((res) => {
          res.should.be.a('array');
          res.length.should.equal(1);
          res[0].should.have.property('id');
          res[0].id_pairs.should.equal(params.id_pairs);
          Date.parse(res[0].dt).should.equal(Date.parse(params.dt));
          res[0].bid.should.equal(params.bid);
          res[0].ask.should.equal(params.ask);
          res[0].bid_vol.should.equal(params.bid_vol);
          res[0].ask_vol.should.equal(params.ask_vol);
        })
        .then(done, done);
    });
  });

  describe('updateTickById', () => {
    it('should return updated row with all its data', (done) => {
      queries.updateTickById(1, { bid_vol: '500' })
        .then((res) => {
          res.should.be.a('array');
          res.length.should.equal(1);
          res[0].should.have.property('id');
          res[0].id.should.equal(1);
          res[0].should.have.property('id_pairs');
          res[0].should.have.property('dt');
          res[0].should.have.property('bid');
          res[0].should.have.property('ask');
          res[0].should.have.property('bid_vol');
          res[0].should.have.property('ask_vol');
          res[0].bid_vol.should.equal('500');
        })
        .then(done, done);
    });

    it('should throw error with no id argument', () => {
      return queries.updateTickById().should.eventually.be.rejectedWith(Error);
    });
  });

  describe('deleteTickById', () => {
    it('should return successfully delete targeted row', (done) => {
      let ticksCount;

      knex('ticks').select()
        .then((res) => {
          ticksCount = res.length;
          return queries.deleteTickById(1);
        })
        .then((res) => {
          res.should.equal(1);
          return knex('ticks').select();
        })
        .then((ticks) => {
          ticks.length.should.equal(ticksCount - 1);
        })
        .then(done, done);
    });

    it('should throw error with no id argument', () => {
      return queries.deleteTickById().should.eventually.be.rejectedWith(Error);
    });
  });
});
