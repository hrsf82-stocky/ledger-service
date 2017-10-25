const { expect } = require('chai');
const request = require('supertest');
const server = require('../server/index.js');


describe('Server Specs', () => {
  beforeEach(() => {
    // server.listen(8888);
  });

  afterEach(() => {
    // server.close();
  });

  describe('GET /', () => {
    it('should return 200 status code and matching response ', (done) => {
      request(server)
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.body).to.be.equal('Hello World');
        })
        .end(done);
    });
  });
});
