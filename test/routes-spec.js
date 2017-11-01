process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const knex = require('../db/knex');

const should = chai.should();

chai.use(chaiHttp);

describe('Routes API Specs', () => {
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

  describe('GET /api/v1/pairs', () => {
    it('should return all pairs', (done) => {
      chai.request(server)
        .get('/api/v1/pairs')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.equal(10);
          done();
        });
    });

    it('should have proper JSON format for each pair', (done) => {
      chai.request(server)
        .get('/api/v1/pairs')
        .end((err, res) => {
          res.should.be.json; // jshint ignore:line
          res.body[0].should.have.property('id');
          res.body[0].should.have.property('name');
          res.body[0].should.have.property('major');
          res.body[0].should.have.property('base');
          res.body[0].should.have.property('quote');
          done();
        });
    });
  });
});

