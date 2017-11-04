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

  describe('getS5BarsByTimeRangeAndPairID', () => {
    it('should return all s5bars data with no start and end datas provided', (done) => {
      queries.getS5BarsByTimeRangeAndPairID({ pairID: 1 })
        .then(((res) => {
          res.should.be.a('array');
          res.length.should.equal(5);
          res[0].should.be.a('object');
          res[0].should.have.property('id');
          res[0].should.have.property('id_pairs');
          res[0].id_pairs.should.equal(1);
          res[0].should.have.property('dt');
          res[0].should.have.property('bid_h');
          res[0].should.have.property('bid_l');
          res[0].should.have.property('bid_o');
          res[0].should.have.property('bid_c');
          res[0].should.have.property('bid_v');
          res[0].should.have.property('ask_h');
          res[0].should.have.property('ask_l');
          res[0].should.have.property('ask_o');
          res[0].should.have.property('ask_c');
          res[0].should.have.property('ask_v');
          res[0].should.have.property('ticks');
        }))
        .then(done, done);
    });

    it('should return all s5bars data from start date to current timestamp if no end date is provided', (done) => {
      queries.getS5BarsByTimeRangeAndPairID({ pairID: 1, start: '2017-08-04' })
        .then(((res) => {
          res.should.be.a('array');
          res.length.should.equal(2);
          res[0].should.be.a('object');
          res[0].should.have.property('id');
          res[0].should.have.property('id_pairs');
          res[0].id_pairs.should.equal(1);
          res[0].should.have.property('dt');
          res[0].should.have.property('bid_h');
          res[0].should.have.property('bid_l');
          res[0].should.have.property('bid_o');
          res[0].should.have.property('bid_c');
          res[0].should.have.property('bid_v');
          res[0].should.have.property('ask_h');
          res[0].should.have.property('ask_l');
          res[0].should.have.property('ask_o');
          res[0].should.have.property('ask_c');
          res[0].should.have.property('ask_v');
          res[0].should.have.property('ticks');
        }))
        .then(done, done);
    });

    it('should return all s5bars data from start to end dates', (done) => {
      queries.getS5BarsByTimeRangeAndPairID({ pairID: 1, start: '2017-08-01', end: '2017-08-04' })
        .then(((res) => {
          res.should.be.a('array');
          res.length.should.equal(3);
          res[0].should.be.a('object');
          res[0].should.have.property('id');
          res[0].should.have.property('id_pairs');
          res[0].id_pairs.should.equal(1);
          res[0].should.have.property('dt');
          res[0].should.have.property('bid_h');
          res[0].should.have.property('bid_l');
          res[0].should.have.property('bid_o');
          res[0].should.have.property('bid_c');
          res[0].should.have.property('bid_v');
          res[0].should.have.property('ask_h');
          res[0].should.have.property('ask_l');
          res[0].should.have.property('ask_o');
          res[0].should.have.property('ask_c');
          res[0].should.have.property('ask_v');
          res[0].should.have.property('ticks');
        }))
        .then(done, done);
    });

    it('should throw error with no input argument', () => {
      return queries.getS5BarsByTimeRangeAndPairID().should.eventually.be.rejectedWith(Error);
    });

    it('should throw error with incorrect start or end date format', () => {
      return Promise.all([
        queries.getS5BarsByTimeRangeAndPairID({ start: 'abc' }).should.eventually.be.rejectedWith(Error),
        queries.getS5BarsByTimeRangeAndPairID({ end: 'abc' }).should.eventually.be.rejectedWith(Error)
      ]);
    });
  });

  describe('addS5Bar', () => {
    it('should return new row data matching input', (done) => {
      const params = {
        dt: '2000-01-01 00:00:00.000000',
        ticks: 5,
        bid_h: '1.500000',
        bid_l: '1.600000',
        bid_o: '1.700000',
        bid_c: '1.800000',
        bid_v: '100',
        ask_h: '2.500000',
        ask_l: '2.600000',
        ask_o: '2.700000',
        ask_c: '2.800000',
        ask_v: '200',
        id_pairs: 1 };

      queries.addS5Bar(params)
        .then((res) => {
          res.should.be.a('array');
          res.length.should.equal(1);
          res[0].should.have.property('id');
          res[0].id_pairs.should.equal(params.id_pairs);
          Date.parse(res[0].dt).should.equal(Date.parse(params.dt));
          res[0].ticks.should.equal(params.ticks);
          res[0].bid_h.should.equal(params.bid_h);
          res[0].bid_l.should.equal(params.bid_l);
          res[0].bid_o.should.equal(params.bid_o);
          res[0].bid_c.should.equal(params.bid_c);
          res[0].bid_v.should.equal(params.bid_v);
          res[0].ask_h.should.equal(params.ask_h);
          res[0].ask_l.should.equal(params.ask_l);
          res[0].ask_o.should.equal(params.ask_o);
          res[0].ask_c.should.equal(params.ask_c);
          res[0].ask_v.should.equal(params.ask_v);
        })
        .then(done, done);
    });
  });

  describe('addBulkS5Bars', () => {
    it('should return new rows data matching input', (done) => {
      const params = [
        {
          dt: '2000-01-01 00:00:00.000000',
          ticks: 5,
          bid_h: '1.500000',
          bid_l: '1.600000',
          bid_o: '1.700000',
          bid_c: '1.800000',
          bid_v: '100',
          ask_h: '2.500000',
          ask_l: '2.600000',
          ask_o: '2.700000',
          ask_c: '2.800000',
          ask_v: '200',
          id_pairs: 1
        },
        {
          dt: '2001-01-01 00:00:00.000000',
          ticks: 5,
          bid_h: '2.500000',
          bid_l: '2.600000',
          bid_o: '2.700000',
          bid_c: '2.800000',
          bid_v: '500',
          ask_h: '3.500000',
          ask_l: '3.600000',
          ask_o: '3.700000',
          ask_c: '3.800000',
          ask_v: '500',
          id_pairs: 2
        }];

      queries.addBulkS5Bars(params)
        .then((res) => {
          res.should.be.a('array');
          res.length.should.equal(2);
          res[1].should.have.property('id');
          res[1].id_pairs.should.equal(params[1].id_pairs);
          Date.parse(res[1].dt).should.equal(Date.parse(params[1].dt));
          res[1].ticks.should.equal(params[1].ticks);
          res[1].bid_h.should.equal(params[1].bid_h);
          res[1].bid_l.should.equal(params[1].bid_l);
          res[1].bid_o.should.equal(params[1].bid_o);
          res[1].bid_c.should.equal(params[1].bid_c);
          res[1].bid_v.should.equal(params[1].bid_v);
          res[1].ask_h.should.equal(params[1].ask_h);
          res[1].ask_l.should.equal(params[1].ask_l);
          res[1].ask_o.should.equal(params[1].ask_o);
          res[1].ask_c.should.equal(params[1].ask_c);
          res[1].ask_v.should.equal(params[1].ask_v);
        })
        .then(done, done);
    });
  });

  describe('updateS5BarsById', () => {
    it('should return updated row with all its data', (done) => {
      queries.updateS5BarsById(1, { ask_v: '134' })
        .then((res) => {
          res.should.be.a('array');
          res.length.should.equal(1);
          res[0].should.have.property('id');
          res[0].id.should.equal(1);
          res[0].should.have.property('id_pairs');
          res[0].should.have.property('dt');
          res[0].should.have.property('bid_h');
          res[0].should.have.property('bid_l');
          res[0].should.have.property('bid_o');
          res[0].should.have.property('bid_c');
          res[0].should.have.property('bid_v');
          res[0].should.have.property('ask_h');
          res[0].should.have.property('ask_l');
          res[0].should.have.property('ask_o');
          res[0].should.have.property('ask_c');
          res[0].should.have.property('ask_v');
          res[0].should.have.property('ticks');
          res[0].ask_v.should.equal('134');
        })
        .then(done, done);
    });

    it('should throw error with no id argument', () => {
      return queries.updateS5BarsById().should.eventually.be.rejectedWith(Error);
    });
  });

  describe('deleteS5BarsById', () => {
    it('should return successfully delete targeted row', (done) => {
      let s5barsCount;

      knex('s5bars').select()
        .then((res) => {
          s5barsCount = res.length;
          return queries.deleteS5BarsById(1);
        })
        .then((res) => {
          res.should.equal(1);
          return knex('s5bars').select();
        })
        .then((s5bars) => {
          s5bars.length.should.equal(s5barsCount - 1);
        })
        .then(done, done);
    });

    it('should throw error with no id argument', () => {
      return queries.deleteTickById().should.eventually.be.rejectedWith(Error);
    });
  });
});
