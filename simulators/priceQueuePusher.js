const fs = require('fs');
const path = require('path');
const csv = require('csv');
const AWS = require('aws-sdk');
const { PriceQueueURL } = require('../config.js');
// const resetSchemaSeeds = require('../db/generator/resetSchemaSeeds');

AWS.config.loadFromPath('../config.json');

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
const csvFilePath = path.join(__dirname, '../../prices/price-ticks.csv');
const instruments = ['EURUSD', 'GBPUSD', 'USDCAD', 'USDCHF', 'USDJPY', 'EURGBP', 'EURCHF', 'AUDUSD', 'EURJPY', 'GBPJPY'];

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

const transformPriceDataTypes = ({ instrument, time, bid, ask, bid_vol, ask_vol }) => ({
  time,
  instrument,
  bid: parseFloat(bid),
  ask: parseFloat(ask),
  bid_vol: parseInt(bid_vol, 10),
  ask_vol: parseInt(ask_vol, 10)
});

const pushNewPrice = ({ instrument, time, bid, ask, bid_vol, ask_vol }, done) => {
  const payload = transformPriceDataTypes({ instrument, time, bid, ask, bid_vol, ask_vol });

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
      }
    },
    MessageBody: JSON.stringify({ payload }),
    QueueUrl: process.env.PriceQueueURL || PriceQueueURL
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
  // resetSchemaSeeds()
  // .then(() => {
  // })
  // .catch(console.error);

  parseCVSPrices(csvFilePath, (priceData) => {
    let i = 0;

    setInterval(() => {
      const priceTick = priceData[i];
      priceTick.instrument = 'EURUSD';
      // priceTick.instrument = instruments[Math.floor(Math.random() * 10)];
      console.log(priceData[i]);
      i += 1;

      pushNewPrice(priceTick, () => {
        if (i === priceData.length) {
          done();
        }
      });
    }, 500);
  });
};

let bid = 1.555;
let ask;

const runRTPricePusher = (tickCount, done) => {
  let count = 0;

  const pushMsgInterval = setInterval(() => {
    const time = new Date().toISOString();
    const instrument = instruments[Math.floor(Math.random() * 10)];
    bid = parseFloat((bid + (Math.random() * 0.0001 * (Math.random() > 0.5 ? 1 : -1))).toFixed(5));
    ask = parseFloat((bid + (Math.random() * 0.001)).toFixed(5));
    const bid_vol = Number.parseInt(Math.random() * 500000, 10);
    const ask_vol = Number.parseInt(Math.random() * 500000, 10);
    count += 1;

    pushNewPrice({ instrument, time, bid, ask, bid_vol, ask_vol }, () => {
      console.log(count);
      if (count === tickCount) {
        clearInterval(pushMsgInterval);
        done();
      }
    });
  }, 100);
};

const ticksToPush = +process.argv[2] || 500;

runRTPricePusher(ticksToPush, () => console.log(`Finished pull all RT ${ticksToPush} price ticks`));

// runPricePusher(() => console.log('Finished pushing all price data'));
