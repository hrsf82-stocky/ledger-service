// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Load credentials and set the region from the JSON file
AWS.config.loadFromPath('../config.json');

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const params = {
  QueueName: 'SQS_PRICES_QUEUE',
  Attributes: {
    DelaySeconds: '60',
    MessageRetentionPeriod: '86400'
  }
};

sqs.createQueue(params, (err, data) => {
  if (err) {
    console.log('Error', err);
  } else {
    console.log('Success', data.QueueUrl);
  }
});
