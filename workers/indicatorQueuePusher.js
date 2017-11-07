const AWS = require('aws-sdk');
const { OHLCQueueURL } = require('../config.js');

AWS.config.loadFromPath('../config.json');
AWS.config.setPromisesDependency(require('bluebird'));

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

  return sqs.sendMessage(params).promise()
    .then((data) => {
      console.log('Indicator Queue - Realtime Message Sent Success', data.MessageId);
      return data;
    })
    .catch((err) => {
      console.log('Indicator Queue - Realtime Message Sent Error', err);
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

  return sqs.sendMessage(params).promise()
    .then((data) => {
      console.log('Indicator Queue - Historical OHLC Message Sent Success', data.MessageId);
      return data;
    })
    .catch((err) => {
      console.log('Indicator Queue - Historical OHLC Message Sent Error', err);
    });
};

module.exports = {
  pushIndicatorMsgRT,
  pushIndicatorMsgHist
};
