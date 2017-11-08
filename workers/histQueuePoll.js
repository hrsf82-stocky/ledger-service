const AWS = require('aws-sdk');
const Consumer = require('sqs-consumer');
const { HistQueueURL } = require('../config.js');
const histProcessor = require('../lib/histProcessor');

AWS.config.loadFromPath('../config.json');

const app = Consumer.create({
  queueUrl: HistQueueURL,
  attributeNames: ['All'],
  messageAttributeNames: ['All'],
  visibilityTimeout: 120,
  waitTimeSeconds: 15,
  sqs: new AWS.SQS(),
  handleMessage: (message, done) => {
    // console.log(message.MessageId);
    // console.log(message.Attributes);
    // console.log(message.MessageAttributes);
    const { payload } = JSON.parse(message.Body);
    const histRequest = Array.isArray(payload) ? payload[0] : payload;
    histRequest.messageID = message.MessageId;

    console.log(histRequest);

    histProcessor(histRequest)
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

if (!module.parent) {
  app.start();
}

module.exports = app;
