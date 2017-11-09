const StatsD = require('node-statsd');
const { HostedGraphiteAPI } = require('../config.js');

const statsDClient = new StatsD({
  host: 'statsd.hostedgraphite.com',
  port: 8125,
  prefix: process.env.HostedGraphiteAPI || HostedGraphiteAPI
});

statsDClient.socket.on('error', (error) => {
  return console.error('Error in statsDClient socket: ', error);
});

module.exports = statsDClient;
