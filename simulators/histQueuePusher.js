const AWS = require('aws-sdk');
const { HistQueueURL } = require('../config.js');
const { getRandomDate } = require('../lib/utility');

AWS.config.loadFromPath('../config.json');

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
const instruments = ['EURUSD', 'GBPUSD', 'USDCAD', 'USDCHF', 'USDJPY', 'EURGBP', 'EURCHF', 'AUDUSD', 'EURJPY', 'GBPJPY'];
const granularities = ['m1', 'm5', 'm30', 'h1', 'h4', 'd1'];
const types = ['M', 'B', 'A', 'MB', 'MA', 'BA', 'MBA'];

const pushNewHist = ({ instrument, type, granularity, start }, done) => {
  const payload = { instrument, type, granularity, start };

  const params = {
    DelaySeconds: 0,
    MessageAttributes: {
      instrument: {
        DataType: 'String',
        StringValue: instrument
      }
    },
    MessageBody: JSON.stringify({ payload }),
    QueueUrl: HistQueueURL
  };

  sqs.sendMessage(params, (err, data) => {
    if (err) {
      console.log('Error', err);
    } else {
      console.log('Hist Inidcator Queue - Message Sent Success', data.MessageId);
    }
    done(err, data);
  });
};


const runHistPusher = (cycleCount, done) => {
  let count = 0;

  const pushMsgInterval = setInterval(() => {
    const instrument = instruments[Math.floor(Math.random() * instruments.length)];
    const granularity = granularities[Math.floor(Math.random() * granularities.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const start = getRandomDate(new Date(2017, 0, 1), new Date()).toISOString();
    count += 1;

    pushNewHist({ instrument, type, granularity, start }, () => {
      console.log(count);
      if (count === cycleCount) {
        clearInterval(pushMsgInterval);
        done();
      }
    });
  }, 100);
};

runHistPusher(50, () => console.log('Finished pushing all Histrical Indicator Queue Requests'));
