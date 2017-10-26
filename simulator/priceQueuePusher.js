const fs = require('fs');
const path = require('path');
const csv = require('csv');
const AWS = require('aws-sdk');

AWS.config.loadFromPath('../config.json');

const csvFilePath = path.join(__dirname, '/EURUSD-Sample-Prices.csv');
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

// List Existing Queue URLS
// sqs.listQueues({}, (err, data) => {
//   if (err) {
//     console.log('Error', err);
//   } else {
//     console.log('Success', data.QueueUrls);
//   }
// });

// const params = {
//   DelaySeconds: 10,
//   MessageAttributes: {
//     time: {
//       DataType: 'String',
//       StringValue: '2017-10-01 21:00:06.101000'
//     },
//     instrument: {
//       DataType: 'String',
//       StringValue: 'EURUSD'
//     },
//     bid: {
//       DataType: 'Number',
//       StringValue: '1.13015'
//     },
//     ask: {
//       DataType: 'Number',
//       StringValue: '1.13028'
//     },
//     bid_vol: {
//       DataType: 'Number',
//       StringValue: '750000'
//     },
//     ask_vol: {
//       DataType: 'Number',
//       StringValue: '1500000'
//     }
//   },
//   MessageBody: 'Sample Data',
//   QueueUrl: 'https://sqs.us-west-1.amazonaws.com/287396276472/SQS_PRICES_QUEUE'
// };

// sqs.sendMessage(params, (err, data) => {
//   if (err) {
//     console.log('Error', err);
//   } else {
//     console.log('Success', data.MessageId);
//   }
// });

const parseCVSPrices = (path, callback) => {
  const options = {
    delimiter: ',',
    trim: true,
    columns: ['time', 'bid', 'ask', 'bid_vol', 'ask_vol']
  };
  const priceData = [];

  fs.createReadStream(path)
    .pipe(csv.parse(options))
    .on('data', (csvrow) => {
      priceData.push(csvrow);
    })
    .on('end', () => {
      console.log('Finished parsing all files');
      callback(priceData);
    })
    .on('error', (err) => {
      console.error(err);
    });
};


parseCVSPrices(csvFilePath, (priceData) => {
  console.log(priceData);
});
