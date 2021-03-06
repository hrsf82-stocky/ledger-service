const moment = require('moment');
// const queries = require('../db/queries');

const isValidDateTime = (timestamp) => {
  return moment(timestamp, moment.ISO_8601, true).isValid();
};

const isInt = (val) => {
  return val === +val && val === (val | 0);
};

const isFloat = (val) => {
  return val === +val && val !== (val | 0);
};

const hasValidTickData = ({ instrument, time, bid, ask, bid_vol, ask_vol }) => {
  return !!instrument && !!time && !!bid && !!ask &&
    bid_vol !== undefined &&
    ask_vol !== undefined &&
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

const computeOHLCFromTicks = (ticksData, unix) => {
  const dt = moment(Number.parseInt(unix, 10)).toISOString();
  const ticks = ticksData.length;
  const { id_pairs } = ticksData[0];
  let minDt;
  let maxDt;
  let bid_o;
  let bid_c;
  let bid_h;
  let bid_l;
  let bid_v;
  let ask_o;
  let ask_c;
  let ask_h;
  let ask_l;
  let ask_v;


  ticksData.forEach((tick, idx) => {
    const unixDt = parseDateToUnixTime(tick.dt);
    const bid = Number.parseFloat(tick.bid);
    const ask = Number.parseFloat(tick.ask);
    const bidVol = Number.parseInt(tick.bid_vol, 10);
    const askVol = Number.parseInt(tick.ask_vol, 10);

    if (idx === 0) {
      bid_o = bid;
      bid_c = bid;
      bid_h = bid;
      bid_l = bid;
      ask_o = ask;
      ask_c = ask;
      ask_h = ask;
      ask_l = ask;
      minDt = unixDt;
      maxDt = unixDt;
      bid_v = bidVol;
      ask_v = askVol;
    } else {
      bid_v += bidVol;
      ask_v += askVol;

      if (bid > bid_h) {
        bid_h = bid;
      } else if (bid < bid_l) {
        bid_l = bid;
      }

      if (ask > ask_h) {
        ask_h = ask;
      } else if (ask < ask_l) {
        ask_l = ask;
      }

      if (unixDt < minDt) {
        bid_o = bid;
        ask_o = ask;
      } else if (unixDt > maxDt) {
        bid_c = bid;
        ask_c = ask;
      }
    }
  });

  return {
    dt,
    ticks,
    id_pairs,
    bid_h,
    bid_l,
    bid_o,
    bid_c,
    bid_v,
    ask_h,
    ask_l,
    ask_o,
    ask_c,
    ask_v };
};

const generateMViewSchemeName = (pairName, granularity) => {
  return `mview_${pairName.toLowerCase()}_${granularity}`;
};

const granularityToSQLString = (granularity) => {
  const interval = granularity[0];
  const length = granularity[1];
  const acronymLookup = { s: 'second', m: 'minute', h: 'hour', d: 'day' };

  return `${length} ${acronymLookup[interval]}${+length > 1 ? 's' : ''}`;
};

const generatePairGranularityCombos = (pairs, granularities) => {
  const combos = [];
  for (let i = 0; i < pairs.length; i += 1) {
    for (let j = 0; j < granularities.length; j += 1) {
      combos.push([pairs[i], granularities[j]]);
    }
  }
  return combos;
};

const getRandomDate = (start, end) => {
  return new Date(start.getTime() + (Math.random() * (end.getTime() - start.getTime())));
};

const hasValidHistRequestData = ({ instrument, type, granularity, start, messageID }) => {
  return !!instrument && !!type && !!granularity && !!start && !!messageID &&
    (instrument.length === 6) &&
    (type.length <= 3) &&
    (type.length >= 1) &&
    (isInt(+granularity.slice(1))) &&
    (['m', 'h', 'd', 's'].includes(granularity[0].toLowerCase())) &&
    isValidDateTime(start);
};

module.exports = {
  isInt,
  isFloat,
  isValidDateTime,
  hasValidTickData,
  parseDateToUnixTime,
  parseDateToUnixTime5S,
  computeOHLCFromTicks,
  generateMViewSchemeName,
  granularityToSQLString,
  generatePairGranularityCombos,
  getRandomDate,
  hasValidHistRequestData
};
