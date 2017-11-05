process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { expect } = require('chai');
const Promise = require('bluebird');
const utility = require('../lib/utility');

const should = chai.should();

chai.use(chaiAsPromised);

describe('Utility Lib Specs', () => {
  describe('isValidDateTime', () => {
    it('should return boolean', (done) => {
      utility.isValidDateTime('2017-10-24 00:00:00-07').should.be.a('boolean');
      done();
    });

    it('should return true for valid date', (done) => {
      utility.isValidDateTime('2017-10-24 00:00:00-07').should.equal(true);
      done();
    });

    it('should return false for invalid date', (done) => {
      utility.isValidDateTime('Wrong Date').should.equal(false);
      done();
    });
  });

  describe('isInt', () => {
    it('should return boolean', (done) => {
      utility.isInt(10).should.be.a('boolean');
      done();
    });

    it('should return true for valid integer input', (done) => {
      utility.isInt(10).should.equal(true);
      done();
    });

    it('should return false for non integer type', (done) => {
      utility.isInt(1.33).should.equal(false);
      utility.isInt('String').should.equal(false);
      utility.isInt(true).should.equal(false);
      utility.isInt({}).should.equal(false);
      utility.isInt([]).should.equal(false);
      utility.isInt(() => '1').should.equal(false);
      done();
    });
  });

  describe('hasValidTickData', () => {
    it('should return boolean', (done) => {
      utility.hasValidTickData({}).should.be.a('boolean');
      done();
    });

    it('should return true for valid set of input', (done) => {
      const params = {
        instrument: 'EURUSD',
        time: '2017-11-04T22:12:27.085Z',
        bid: '1.500000',
        ask: '2.500000',
        bid_vol: '100',
        ask_vol: '200' };

      utility.hasValidTickData(params).should.equal(true);
      done();
    });

    it('should return false for any invalid type', (done) => {
      const params = {
        instrument: 'EURUSD',
        time: '2017-11-04T00:00:00.000Z',
        bid: '1.500000',
        ask: '2.500000',
        bid_vol: '100',
        ask_vol: '200' };

      utility.hasValidTickData(Object.assign({}, params, { instrument: 'ABCXYZZ' })).should.equal(false);
      utility.hasValidTickData(Object.assign({}, params, { instrument: 'ABC' })).should.equal(false);
      utility.hasValidTickData(Object.assign({}, params, { time: 'string' })).should.equal(false);
      utility.hasValidTickData(Object.assign({}, params, { bid: 'string' })).should.equal(false);
      utility.hasValidTickData(Object.assign({}, params, { ask: 'string' })).should.equal(false);
      utility.hasValidTickData(Object.assign({}, params, { bid_vol: 'string' })).should.equal(false);
      utility.hasValidTickData(Object.assign({}, params, { ask_vol: 'string' })).should.equal(false);
      utility.hasValidTickData(Object.assign({}, params, { ask_vol: 1.5 })).should.equal(false);
      utility.hasValidTickData(Object.assign({}, params, { ask_vol: 1.5 })).should.equal(false);
      done();
    });
  });

  describe('parseDateToUnixTime', () => {
    it('should return integer', (done) => {
      utility.parseDateToUnixTime('2017-11-04T00:00:00.000Z').should.be.a('number');
      done();
    });

    it('should return valid unix time', (done) => {
      const unix = utility.parseDateToUnixTime('2017-11-04T00:00:00.000Z');
      (new Date(unix).toISOString()).should.equal('2017-11-04T00:00:00.000Z');
      done();
    });

    it('should return NaN for invalid date', (done) => {
      utility.parseDateToUnixTime('Wrong Date').should.be.NaN;
      done();
    });
  });

  describe('parseDateToUnixTime5S', () => {
    it('should return integer', (done) => {
      utility.parseDateToUnixTime5S('2017-11-04T00:00:00.000Z').should.be.a('number');
      done();
    });

    it('should return unix time in last 5 second time bucket', (done) => {
      const unix = utility.parseDateToUnixTime5S('2017-11-04T00:00:02.000Z');
      (new Date(unix).toISOString()).should.equal('2017-11-04T00:00:00.000Z');
      done();
    });

    it('should return NaN for invalid date', (done) => {
      utility.parseDateToUnixTime('Wrong Date').should.be.NaN;
      done();
    });
  });

  describe('computeOHLCFromTicks', () => {
    const t1 = {
      id_pairs: 1,
      dt: '2017-11-01T00:00:00.000Z',
      bid: '1.500000',
      ask: '2.500000',
      bid_vol: '100',
      ask_vol: '200' };

    const t2 = {
      id_pairs: 1,
      dt: '2017-11-03T00:00:00.000Z',
      bid: '3.500000',
      ask: '5.500000',
      bid_vol: '100',
      ask_vol: '200' };

    it('should return an object', (done) => {
      utility.computeOHLCFromTicks([{}, {}], Date.parse('2017-11-01T00:00:00.000Z')).should.be.a('object');
      done();
    });

    it('should return an object with all keys', (done) => {
      const ohlc = utility.computeOHLCFromTicks([t1, t2], Date.parse('2017-11-01T00:00:00.000Z'));

      // console.log(ohlc);
      ohlc.should.have.property('dt');
      ohlc.should.have.property('ticks');
      ohlc.should.have.property('id_pairs');
      ohlc.should.have.property('bid_h');
      ohlc.should.have.property('bid_l');
      ohlc.should.have.property('bid_o');
      ohlc.should.have.property('bid_c');
      ohlc.should.have.property('bid_v');
      ohlc.should.have.property('ask_h');
      ohlc.should.have.property('ask_l');
      ohlc.should.have.property('ask_o');
      ohlc.should.have.property('ask_c');
      ohlc.should.have.property('ask_v');
      done();
    });

    it('should return an object with all valid values', (done) => {
      const ohlc = utility.computeOHLCFromTicks([t1, t2], Date.parse('2017-11-01T00:00:00.000Z'));

      ohlc.dt.should.equal('2017-11-01T00:00:00.000Z');
      ohlc.ticks.should.equal(2);
      ohlc.id_pairs.should.equal(1);
      ohlc.bid_h.should.equal(3.5);
      ohlc.bid_l.should.equal(1.5);
      ohlc.bid_o.should.equal(1.5);
      ohlc.bid_c.should.equal(3.5);
      ohlc.bid_v.should.equal(200);
      ohlc.ask_h.should.equal(5.5);
      ohlc.ask_l.should.equal(2.5);
      ohlc.ask_o.should.equal(2.5);
      ohlc.ask_c.should.equal(5.5);
      ohlc.ask_v.should.equal(400);
      done();
    });
  });
});
