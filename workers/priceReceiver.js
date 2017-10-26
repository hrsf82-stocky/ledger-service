// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Load credentials and set the region from the JSON file
AWS.config.loadFromPath('../config.json');

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const queueURL = 'https://sqs.us-west-1.amazonaws.com/287396276472/SQS_PRICES_QUEUE';

const params = {
  AttributeNames: [
    'All'
  ],
  MaxNumberOfMessages: 1,
  MessageAttributeNames: [
    'All'
  ],
  QueueUrl: queueURL,
  VisibilityTimeout: 0,
  WaitTimeSeconds: 0
};

sqs.receiveMessage(params, (err, data) => {
  if (err) {
    console.log('Receive Error', err);
  } else {
    console.log(data);
    console.log(data.Messages[0].Attributes);
    console.log(data.Messages[0].MessageAttributes);


    // if (data.Messages) {
    //   const deleteParams = {
    //     QueueUrl: queueURL,
    //     ReceiptHandle: data.Messages[0].ReceiptHandle
    //   };
    //   sqs.deleteMessage(deleteParams, (err, data) => {
    //     if (err) {
    //       console.log('Delete Error', err);
    //     } else {
    //       console.log('Message Deleted', data);
    //     }
    //   });
    // }
  }
});
