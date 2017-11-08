const elasticsearch = require('elasticsearch');
const { ESHOST } = require('../config.js');

const client = new elasticsearch.Client({
  host: process.env.ESHOST || ESHOST,
  httpAuth: 'elastic:changeme'
  // log: 'trace'
});

client.ping({
  requestTimeout: 3000
}, (error) => {
  if (error) {
    console.error('elasticsearch cluster is down!');
  } else {
    console.log('All is well');
  }
});

const postElasticIndexData = (index, type, body) => {
  return new Promise((resolve, reject) => {
    client.index({ index, type, body }, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

const sendTicksToES = (data) => {
  return postElasticIndexData('ledger', 'ticks', data);
};

const sendS5BarsToES = (data) => {
  return postElasticIndexData('ledger', 's5bars', data);
};

const sendHistRequestToES = (data) => {
  return postElasticIndexData('ledger', 'histRequest', data);
};

module.exports = {
  sendTicksToES,
  sendS5BarsToES,
  sendHistRequestToES
};
