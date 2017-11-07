const queries = require('../db/queries');
const { pushIndicatorMsgHist } = require('../workers/indicatorQueuePusher');
const { hasValidHistRequestData, generateMViewSchemeName } = require('./utility');

const histProcessor = ({ instrument, type, granularity, start, messageID }) => {
  // Verify input data integrity
  if (!hasValidHistRequestData({ instrument, type, granularity, start, messageID })) {
    return Promise.reject(new Error('Hist Queue Incoming Input types are invalid'));
  }

  const mviewName = generateMViewSchemeName(instrument, granularity);

  return queries.getAllMviews()
    .then((res) => {
      const mviews = res.map(item => item.oid);

      if (!mviews.includes(mviewName)) {
        throw new Error('Materialized View doest not exist for input pair and granularity');
      }

      return queries.getMviewData(mviewName, type, start);
    })
    .then((payload) => {
      return pushIndicatorMsgHist(payload, 'historical', instrument, messageID);
    })
    .then((res) => {
      console.log(`Finished processing ${mviewName}, from request ${messageID}`);
      return res;
    });
};

histProcessor({
  instrument: 'EURUSD',
  type: 'BA',
  granularity: 'd1',
  start: '2017-10-11',
  messageID: '77fc80da-7b87-4a7d-ae72-1a0a32548f3d'
});

module.exports = histProcessor;
