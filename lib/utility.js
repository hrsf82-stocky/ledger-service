const moment = require('moment');
// const queries = require('../db/queries');

const isValidDateTime = (timestamp) => {
  return moment(timestamp, moment.ISO_8601, true).isValid();
};

const isInt = (val) => {
  return val === +val && val === (val | 0);
};

// const isFloat = (val) => {
//   return val === +val && val !== (val | 0);
// };

const hasValidTickData = ({ instrument, time, bid, ask, bid_vol, ask_vol }) => {
  return !!instrument && !!time && !!bid && !!ask && !!bid_vol && !!ask_vol &&
    (instrument.length === 6) &&
    !Number.isNaN(parseFloat(bid)) &&
    !Number.isNaN(parseFloat(ask)) &&
    isInt(+bid_vol) &&
    isInt(+ask_vol) &&
    isValidDateTime(time);
};

const parseDateToUnixTime = (dateString) => {
  return Date.parse(dateString);
};

const parseDateToUnixTime5S = (dateString) => {
  const unix = parseDateToUnixTime(dateString);
  return unix - (unix % 5000);
};

// const valid = hasValidTickData({
//   instrument: 'USDEUR',
//   time: '2017-08-01T12:00:10.000Z',
//   bid: 1.33,
//   ask: 1.99,
//   bid_vol: 132312,
//   ask_vol: 13232 });
// console.log(valid);
// exports.getPairIDByName = ()

// console.log(isInt(13322.444));

// console.log(parseDateToUnixTime5S('2017-08-01T12:00:07.100Z'));

module.exports = {
  isValidDateTime,
  hasValidTickData,
  parseDateToUnixTime,
  parseDateToUnixTime5S
};
