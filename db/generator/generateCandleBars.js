const axios = require('axios');
const { OandaAPIkey } = require('../../config.js');
const db = require('../index.js');
const Promise = require('bluebird');

const pairIdMapping = {
  EUR_USD: 1,
  GBP_USD: 2,
  USD_CAD: 3,
  USD_CHF: 4,
  USD_JPY: 5,
  EUR_GBP: 6,
  EUR_CHF: 7,
  AUD_USD: 8,
  EUR_JPY: 9,
  GBP_JPY: 10
};

const generateRandomVols = () => {
  const bidVol = parseInt(((1 + (Math.random() * 5)).toFixed(2)) * 100000, 10);
  const askVol = parseInt(((1 + (Math.random() * 5)).toFixed(2)) * 100000, 10);
  return [bidVol, askVol];
};

const formatCandlesData = (candles, pairId) => {
  const output = [];
  let bidVol;
  let askVol;
  for (let i = 0; i < candles.length; i += 1) {
    [bidVol, askVol] = generateRandomVols();
    output.push([
      candles[i].time,
      candles[i].bid.h,
      candles[i].bid.l,
      candles[i].bid.o,
      candles[i].bid.c,
      bidVol,
      candles[i].ask.h,
      candles[i].ask.l,
      candles[i].ask.o,
      candles[i].ask.c,
      askVol,
      candles[i].volume,
      pairId
    ]);
  }
  return output;
};

const fetchOandaPairCandles = (pair, count, from, price = 'BA', granularity = 'S5') => {
  const url = `https://api-fxpractice.oanda.com/v3/instruments/${pair}/candles`;
  const params = { count, from, price, granularity };
  const headers = { Authorization: OandaAPIkey };
  return axios.get(url, { params, headers })
    .then(res => res.data.candles)
    .catch(console.error);
};

// fetchOandaPairCandles('USD_CAD', 5000, '2017-09-01T00:00:00.000000000Z')
//   .then(res => console.log(res));

const loadBulkMajorPairsCandles = from => (
  Promise.map(Object.keys(pairIdMapping), pair => fetchOandaPairCandles(pair, 5000, from, 'BA', 'S5'))
    .then(pairsCandles => pairsCandles.map((ele, i) => formatCandlesData(ele, i + 1)))
    .then(formattedPairsCandles => Promise.map(formattedPairsCandles, db.insertBulkOHLC))
    .then(results => console.log('Bulk inserted all major pairs 5sec OHLC data.'))
    .catch(console.error)
);

const loadMonthlyData = (year, month, day) => {
  let dayStr;
  if (day > 31) return;
  if (day < 10) {
    dayStr = '0' + day.toString();
  } else {
    dayStr = day.toString();
  }
  loadBulkMajorPairsCandles(`${year}-${month}-${dayStr}`)
    .then((results) => {
      console.log(`2017-${month}-${dayStr} - 50000 data points of 5sec OHLC inserted to db`);
      loadMonthlyData(year, month, day + 1);
    })
    .catch(console.error);
};

loadMonthlyData('2017', '06', 1);

