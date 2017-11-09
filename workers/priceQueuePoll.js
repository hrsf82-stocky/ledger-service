const AWS = require('aws-sdk');
// const Consumer = require('sqs-consumer');
const { PriceQueueURL } = require('../config.js');
const priceProcessor = require('../lib/priceProcessor');
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
  QueueUrl: process.env.PriceQueueURL || PriceQueueURL,
  VisibilityTimeout: 120,
  WaitTimeSeconds: 10
};

const deleteSQSMessage = (message) => {
  const deleteParams = {
    QueueUrl: process.env.PriceQueueURL || PriceQueueURL,
    ReceiptHandle: message.ReceiptHandle
  };

  return sqs.deleteMessage(deleteParams).promise();
};

const pollPriceQueueMessage = () => {
  sqs.receiveMessage(params).promise()
    .then((res) => {
      if (!res.Messages) {
        throw new Error('No New SQS Price Message');
      } else {
        return res.Messages[0];
      }
    })
    .then((message) => {
      const start = Date.now();
      statsDClient.increment('.ledger.price.received');
      // console.log(message.MessageId);
      // console.log(message.Attributes);
      // console.log(message.MessageAttributes);
      const price = JSON.parse(message.Body).payload;
      // console.log(price);

      priceProcessor(price)
        .then((res) => {
          statsDClient.increment('.ledger.price.processed.success');
          statsDClient.timing('.ledger.price.processed.success.latency_ms', Date.now() - start);

          return deleteSQSMessage(message);
        })
        .catch((err) => {
          statsDClient.increment('.ledger.price.processed.fail');
          statsDClient.timing('.ledger.price.processed.fail.latency_ms', Date.now() - start);
          console.error(err);

          return deleteSQSMessage(message);
        })
        .then(() => {
          console.log(`Message Deleted: ${message.MessageId}`);
          pollPriceQueueMessage();
        })
        .catch(() => {
          console.error(`Message Delete Error: ${message.MessageId}`);
          pollPriceQueueMessage();
        });
    })
    .catch((err) => {
      console.error(err.message);
      setTimeout(pollPriceQueueMessage, 50);
    });
};

// SQS Consumer Implementation - not fast enough
// const app = Consumer.create({
//   queueUrl: PriceQueueURL,
//   attributeNames: ['All'],
//   messageAttributeNames: ['All'],
//   visibilityTimeout: 120,
//   waitTimeSeconds: 15,
//   sqs: new AWS.SQS(),
//   handleMessage: (message, done) => {
//     const start = Date.now();
//     statsDClient.increment('.ledger.price.received');

//     // console.log(message.MessageId);
//     // console.log(message.Attributes);
//     // console.log(message.MessageAttributes);
//     const price = JSON.parse(message.Body).payload;
//     console.log(price);

//     priceProcessor(price)
//       .then((res) => {
//         statsDClient.increment('.ledger.price.processed.success');
//         statsDClient.timing('.ledger.price.processed.success.latency_ms', Date.now() - start);
//         done();
//       })
//       .catch((err) => {
//         statsDClient.increment('.ledger.price.processed.fail');
//         statsDClient.timing('.ledger.price.processed.fail.latency_ms', Date.now() - start);
//         console.error(err);
//         done();
//       });
//   }
// });

// app.on('error', (err) => {
//   console.error(err.message);
// });
// app.start();

if (!module.parent) {
  pollPriceQueueMessage();
}

module.exports = pollPriceQueueMessage;
