const AWS = require('aws-sdk');
const Consumer = require('sqs-consumer');
const { PriceQueueURL } = require('../config.js');
const priceProcessor = require('../lib/priceProcessor');

AWS.config.loadFromPath('../config.json');

const app = Consumer.create({
  queueUrl: PriceQueueURL,
  attributeNames: ['All'],
  messageAttributeNames: ['All'],
  visibilityTimeout: 120,
  waitTimeSeconds: 15,
  sqs: new AWS.SQS(),
  handleMessage: (message, done) => {
    console.log(message.MessageId);
    console.log(JSON.parse(message.Body));
    // console.log(message.Attributes);
    // console.log(message.MessageAttributes);
    const price = JSON.parse(message.Body).payload;

    console.log(price);

    priceProcessor(price)
      .then(res => done())
      .catch((err) => {
        console.error(err);
        done();
      });
  }
});

app.on('error', (err) => {
  console.error(err.message);
});

app.start();

module.exports = app;
