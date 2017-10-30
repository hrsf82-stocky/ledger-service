process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = require('chai');
const request = require('supertest');
const app = require('../app.js');

chai.use(chaiHttp);

const server = app.listen(8888);

describe('Server Specs', () => {
  beforeEach(() => {
    server.listen(8888);
  });

  afterEach(() => {
    server.close();
  });

  describe('GET /test', () => {
    it('should return 200 status code and matching response ', (done) => {
      request(server)
        .get('/test')
        .expect(200)
        .expect((res) => {
          expect(res.body).to.be.equal('Hello World Test');
        })
        .end(done);
    });
  });

  describe('GET /test', () => {
    it('should return 200 status code and matching response ', (done) => {
      request(server)
        .get('/test')
        .expect(200)
        .expect((res) => {
          expect(res.body).to.be.equal('Hello World Test');
        })
        .end(done);
    });
  });
});
