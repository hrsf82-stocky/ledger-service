const queries = require('../db/queries');
const { pushIndicatorMsgHist } = require('../workers/indicatorQueuePusher');
const { uploadFileToS3 } = require('../workers/awsS3BucketPusher');
const { hasValidHistRequestData, generateMViewSchemeName } = require('./utility');
const { sendHistRequestToES } = require('../db/esClient');
const statsDClient = require('../db/statsDClient');

const histProcessor = ({ instrument, type, granularity, start, messageID }) => {
  // Verify input data integrity
  if (!hasValidHistRequestData({ instrument, type, granularity, start, messageID })) {
    return Promise.reject(new Error('Hist Queue Incoming Input types are invalid'));
  }

  const mviewName = generateMViewSchemeName(instrument, granularity);
  let startTime;

  // Send historical indicator request data to elasticsearch
  sendHistRequestToES({ instrument, type, granularity, start, dt: new Date().toISOString() })
    .then((res) => {
      console.log('Historical OHLC Request sent to Elasticsearch', res);
    })
    .catch((err) => {
      console.error('Historical OHLC Request failed to sent to Elasticsearch');
    });

  return queries.getAllMviews()
    .then((res) => {
      const mviews = res.map(item => item.oid);

      if (!mviews.includes(mviewName)) {
        throw new Error('Materialized View doest not exist for input pair and granularity');
      }

      startTime = Date.now();

      return queries.getMviewData(mviewName, type, start);
    })
    .then((payload) => {
      statsDClient.timing('.ledger.query.mviews.success.latency_ms', Date.now() - startTime);
      startTime = Date.now();

      return uploadFileToS3(messageID, payload);
    })
    .then((s3Location) => {
      statsDClient.timing('.ledger.s3upload.mviews.success.latency_ms', Date.now() - startTime);
      return pushIndicatorMsgHist({ s3url: s3Location }, 'historical', instrument, messageID);
    })
    .then((res) => {
      console.log(`Finished processing ${mviewName}, from request message ID: ${messageID}`);
      return res;
    });
};

module.exports = histProcessor;
