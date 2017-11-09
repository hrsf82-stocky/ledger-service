const AWS = require('aws-sdk');
// const Consumer = require('sqs-consumer');
const { HistQueueURL } = require('../config.js');
const histProcessor = require('../lib/histProcessor');
const statsDClient = require('../db/statsDClient');

AWS.config.loadFromPath('../config.json');
AWS.config.setPromisesDependency(require('bluebird'));

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const params = {
  AttributeNames: [
    'All'
  ],
  MaxNumberOfMessages: 1,
  MessageAttributeNames: [
    'All'
  ],
  QueueUrl: process.env.HistQueueURL || HistQueueURL,
  VisibilityTimeout: 120,
  WaitTimeSeconds: 10
};

const deleteSQSMessage = (message) => {
  const deleteParams = {
    QueueUrl: process.env.HistQueueURL || HistQueueURL,
    ReceiptHandle: message.ReceiptHandle
  };

  return sqs.deleteMessage(deleteParams).promise();
};

const pollHistQueueMessage = () => {
  sqs.receiveMessage(params).promise()
    .then((res) => {
      if (!res.Messages) {
        throw new Error('No New SQS Historical OHLC Request Message');
      } else {
        return res.Messages[0];
      }
    })
    .then((message) => {
      const start = Date.now();
      statsDClient.increment('.ledger.hist.received');
      // console.log(message.MessageId);
      // console.log(message.Attributes);
      // console.log(message.MessageAttributes);
      const { payload } = JSON.parse(message.Body);
      const histRequest = Array.isArray(payload) ? payload[0] : payload;
      histRequest.messageID = message.MessageId;

      console.log(histRequest);

      histProcessor(histRequest)
        .then((res) => {
          statsDClient.increment('.ledger.hist.processed.success');
          statsDClient.timing('.ledger.hist.processed.success.latency_ms', Date.now() - start);

          return deleteSQSMessage(message);
        })
        .catch((err) => {
          statsDClient.increment('.ledger.hist.processed.fail');
          statsDClient.timing('.ledger.hist.processed.fail.latency_ms', Date.now() - start);
          console.error(err);

          return deleteSQSMessage(message);
        })
        .then(() => {
          console.log(`Message Deleted: ${message.MessageId}`);
          pollHistQueueMessage();
        })
        .catch(() => {
          console.error(`Message Delete Error: ${message.MessageId}`);
          pollHistQueueMessage();
        });
    })
    .catch((err) => {
      console.error(err.message);
      setTimeout(pollHistQueueMessage, 50);
    });
};

// SQS Consumer Implementation - not fast enough
// const app = Consumer.create({
//   queueUrl: HistQueueURL,
//   attributeNames: ['All'],
//   messageAttributeNames: ['All'],
//   visibilityTimeout: 120,
//   waitTimeSeconds: 15,
//   sqs: new AWS.SQS(),
//   handleMessage: (message, done) => {
//     // console.log(message.MessageId);
//     // console.log(message.Attributes);
//     // console.log(message.MessageAttributes);
//     const { payload } = JSON.parse(message.Body);
//     const histRequest = Array.isArray(payload) ? payload[0] : payload;
//     histRequest.messageID = message.MessageId;

//     console.log(histRequest);

//     histProcessor(histRequest)
//       .then(res => done())
//       .catch((err) => {
//         console.error(err);
//         done();
//       });
//   }
// });

// app.on('error', (err) => {
//   console.error(err.message);
// });
//  app.start();

if (!module.parent) {
  pollHistQueueMessage();
}

module.exports = pollHistQueueMessage;
