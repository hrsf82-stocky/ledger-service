const AWS = require('aws-sdk');

AWS.config.loadFromPath('../config.json');

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

// List Existing Queue URLS
// sqs.listQueues({}, (err, data) => {
//   if (err) {
//     console.log('Error', err);
//   } else {
//     console.log('Success', data.QueueUrls);
//   }
// });

const params = {
  DelaySeconds: 10,
  MessageAttributes: {
    time: {
      DataType: 'String',
      StringValue: '2017-10-01 21:00:06.101000'
    },
    instrument: {
      DataType: 'String',
      StringValue: 'EURUSD'
    },
    bid: {
      DataType: 'Number',
      StringValue: '1.13015'
    },
    ask: {
      DataType: 'Number',
      StringValue: '1.13028'
    },
    bid_vol: {
      DataType: 'Number',
      StringValue: '750000'
    },
    ask_vol: {
      DataType: 'Number',
      StringValue: '1500000'
    }
  },
  MessageBody: 'Sample Data',
  QueueUrl: 'https://sqs.us-west-1.amazonaws.com/287396276472/SQS_PRICES_QUEUE'
};

sqs.sendMessage(params, (err, data) => {
  if (err) {
    console.log('Error', err);
  } else {
    console.log('Success', data.MessageId);
  }
});
