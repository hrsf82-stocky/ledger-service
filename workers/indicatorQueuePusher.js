const AWS = require('aws-sdk');
const Promise = require('bluebird');
const { OHLCQueueURL } = require('../config.js');

AWS.config.loadFromPath('../config.json');

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const pushIndicatorMsg = (payload, type) => {
  const params = {
    DelaySeconds: 0,
    MessageAttributes: {
      type: {
        DataType: 'String',
        StringValue: type
      }
    },
    MessageBody: JSON.stringify({ payload }),
    QueueUrl: OHLCQueueURL
  };

  return new Promise((resolve, reject) => {
    sqs.sendMessage(params, (err, data) => {
      if (err) {
        console.log('Error', err);
        reject(err);
      } else {
        console.log('Price Queue - Message Sent Success', data.MessageId);
        resolve(data);
      }
    });
  });
};

module.exports = pushIndicatorMsg;
