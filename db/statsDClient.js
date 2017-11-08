const statsD = require('node-statsd');
const { HostedGraphiteAPI } = require('../config.js');

const statsDClient = new statsD({
  host: 'statsd.hostedgraphite.com',
  port: 8125,
  prefix: process.env.HOSTEDGRAPHITE_APIKEY || HostedGraphiteAPI
});

module.exports = statsDClient;
