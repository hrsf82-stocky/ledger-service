const axios = require('axios');
const { OandaAPIkey } = require('../../config.js');
const db = require('../index.js');

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

  // console.log(output);
  return output;
};

const oandaApiUrl = 'https://api-fxpractice.oanda.com/v3/instruments/EUR_USD/candles';
const oandaParams = {
  count: null,
  from: '2017-10-17T15:00:00.000000000Z',
  price: 'BA',
  granularity: 'S5'
};

axios({
  method: 'get',
  responseType: 'json',
  url: oandaApiUrl,
  params: oandaParams,
  headers: { Authorization: OandaAPIkey }
})
  .then((res) => {
    // console.log(res.data);
    const arr = formatCandlesData(res.data.candles, 1)[0];
    console.log(arr);
    const params = arr.map((item, idx) => `$${(idx + 1)}`);
    const query = `INSERT INTO 
      s5bars(dt, bid_h, bid_l, bid_o, bid_c, bid_v, ask_h, ask_l, ask_o, ask_c, ask_v, ticks, id_pairs) 
      VALUES (${params.join(',')})`;
    console.log(params);
    console.log(query);
    db.query(query, arr, (err, res) => {
      if (err) {
        console.log(err);
      }
      console.log(res);
    });
  })
  .catch((err) => {
    console.log(err);
  });
