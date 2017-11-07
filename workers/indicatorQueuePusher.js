const AWS = require('aws-sdk');
const Promise = require('bluebird');
const { OHLCQueueURL } = require('../config.js');

AWS.config.loadFromPath('../config.json');

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const pushIndicatorMsgRT = (payload, type) => {
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
        console.log('Indicator Queue - Realtime Message Sent Success', data.MessageId);
        resolve(data);
      }
    });
  });
};

const pushIndicatorMsgHist = (payload, type, instrument, requestMsgId) => {
  const params = {
    DelaySeconds: 0,
    MessageAttributes: {
      type: {
        DataType: 'String',
        StringValue: type
      },
      instrument: {
        DataType: 'String',
        StringValue: instrument
      },
      requestMsgId: {
        DataType: 'String',
        StringValue: requestMsgId
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
        console.log('Indicator Queue - Historical Message Sent Success', data.MessageId);
        resolve(data);
      }
    });
  });
};

module.exports = {
  pushIndicatorMsgRT,
  pushIndicatorMsgHist
};
