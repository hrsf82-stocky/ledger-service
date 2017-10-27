const fs = require('fs');
const path = require('path');
const csv = require('csv');
const AWS = require('aws-sdk');
const { PriceQueueURL } = require('../config.js');

AWS.config.loadFromPath('../config.json');

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
const csvFilePath = path.join(__dirname, '/EURUSD-Sample-Prices.csv');

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

const transformPriceDataTypes = ({ time, bid, ask, bid_vol, ask_vol }) => ({
  time,
  bid: parseFloat(bid),
  ask: parseFloat(ask),
  bid_vol: parseInt(bid_vol, 10),
  ask_vol: parseInt(ask_vol, 10)
});

const pushNewPrice = ({ instrument, time, bid, ask, bid_vol, ask_vol }, done) => {
  const payload = transformPriceDataTypes({ time, bid, ask, bid_vol, ask_vol });

  const params = {
    DelaySeconds: 0,
    MessageAttributes: {
      time: {
        DataType: 'String',
        StringValue: time
      },
      instrument: {
        DataType: 'String',
        StringValue: instrument || 'EURUSD'
      },
      bid: {
        DataType: 'Number',
        StringValue: bid
      },
      ask: {
        DataType: 'Number',
        StringValue: ask
      },
      bid_vol: {
        DataType: 'Number',
        StringValue: bid_vol
      },
      ask_vol: {
        DataType: 'Number',
        StringValue: ask_vol
      }
    },
    MessageBody: JSON.stringify({ payload }),
    QueueUrl: PriceQueueURL
  };

  sqs.sendMessage(params, (err, data) => {
    if (err) {
      console.log('Error', err);
    } else {
      console.log('Price Queue - Message Sent Success', data.MessageId);
    }
    done(err, data);
  });
};


const runPricePusher = (done) => {
  parseCVSPrices(csvFilePath, (priceData) => {
    let i = 0;

    setInterval(() => {
      console.log(priceData[i]);
      pushNewPrice(priceData[i], () => {
        i += 1;
        if (i === priceData.length) {
          done();
        }
      });
    }, 1000);
  });
};

runPricePusher(() => console.log('Finished pushing all price data'));
