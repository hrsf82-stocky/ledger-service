const Promise = require('bluebird');
const knex = require('./knex');
const { isValidDateTime,
  generateMViewSchemeName,
  granularityToSQLString,
  generatePairGranularityCombos } = require('../lib/utility');

// References to Postgres tables
const pairs = () => knex('pairs');
const ticks = () => knex('ticks');
const s5bars = () => knex('s5bars');

/**
 * Pairs Table Helper Functions
 */
const getAllPairs = () => {
  return pairs().select();
};

const getPair = ({ id, name }) => {
  if (id) {
    return pairs().where('id', parseInt(id, 10)).first();
  }
  return pairs().where('name', name).first();
};

const addPair = ({ name, major = false }) => {
  return pairs()
    .insert({
      name,
      major,
      base: name.slice(0, 3),
      quote: name.slice(3, 6)
    })
    .returning('*');
};

const updatePairById = (id, updates) => {
  if (!id) {
    return Promise.reject(new Error('Pair ID not provided'));
  }
  return pairs()
    .where('id', parseInt(id, 10))
    .update(updates)
    .returning('*');
};

const deletePairById = (id) => {
  if (!id) {
    return Promise.reject(new Error('Pair ID not provided'));
  }
  return pairs().where('id', parseInt(id, 10)).del();
};


/**
 * Ticks Table Helper Functions
 */
const getTicksByTimeRangeAndPairId = (params) => {
  if (!params) {
    return Promise.reject(new Error('No input params object'));
  }

  const { pairID, start, end } = params;

  if (pairID === undefined) {
    return Promise.reject(new Error('Pair ID not provided'));
  }
  if ((start && !isValidDateTime(start)) || (end && !isValidDateTime(end))) {
    return Promise.reject(new TypeError('Invalid start or end timestamp input'));
  }
  // return all ticks data for a pair if no start timestamp is provided
  if (!start) {
    return ticks().where('id_pairs', pairID);
  }
  // return ticks data from start date to current timestamp if no end date is provided
  if (start && !end) {
    return ticks().where('id_pairs', pairID).andWhere('dt', '>', start);
  }
  // return ticks data between start and end timestamp
  return ticks().where('id_pairs', pairID).whereBetween('dt', [start, end]);
};

const addTick = ({ dt, bid, ask, bid_vol, ask_vol, id_pairs }) => {
  return ticks()
    .insert({ dt, bid, ask, bid_vol, ask_vol, id_pairs })
    .returning('*');
};

const updateTickById = (id, updates) => {
  if (id === undefined) {
    return Promise.reject(new Error('Tick ID not provided'));
  }
  return ticks()
    .where('id', parseInt(id, 10))
    .update(updates)
    .returning('*');
};

const deleteTickById = (id) => {
  if (id === undefined) {
    return Promise.reject(new Error('Tick ID not provided'));
  }
  return ticks().where('id', parseInt(id, 10)).del();
};

const getTicksByIds = (ids) => {
  return ticks().whereIn('id', ids);
};

/**
 * s5bars (5 second OHLC) Table Helper Functions
 */
const getS5BarsByTimeRangeAndPairID = (params) => {
  if (!params) {
    return Promise.reject(new Error('No input params object'));
  }

  const { pairID, start, end } = params;

  if (pairID === undefined) {
    return Promise.reject(new Error('Pair ID not provided'));
  }
  if ((start && !isValidDateTime(start)) || (end && !isValidDateTime(end))) {
    return Promise.reject(new TypeError('Invalid start or end timestamp input'));
  }
  // return all s5bars data for a pair if no start timestamp is provided
  if (!start) {
    return s5bars().where('id_pairs', pairID);
  }
  // return s5bars data from start date to current timestamp if no end date is provided
  if (start && !end) {
    return s5bars().where('id_pairs', pairID).andWhere('dt', '>', start);
  }
  // return s5bars data between start and end timestamp
  return s5bars().where('id_pairs', pairID).whereBetween('dt', [start, end]);
};

const addS5Bar = (rowData) => {
  const {
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
    ask_v } = rowData;

  if (Date.parse(dt) % 5000 !== 0) {
    return Promise.reject(new RangeError('dt is not in 5 second interval'));
  }

  return s5bars()
    .insert({
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
      ask_v })
    .returning('*');
};

const addBulkS5Bars = (bulkRowData) => {
  return s5bars().insert(bulkRowData).returning('*');
};

const updateS5BarsById = (id, updates) => {
  if (id === undefined) {
    return Promise.reject(new Error('s5bars ID not provided'));
  }
  return s5bars()
    .where('id', parseInt(id, 10))
    .update(updates)
    .returning('*');
};

const deleteS5BarsById = (id) => {
  if (id === undefined) {
    return Promise.reject(new Error('s5bars ID not provided'));
  }
  return s5bars().where('id', parseInt(id, 10)).del();
};

/**
 * Materialized Views for s5bars (5 second OHLC) Table Helper Functions
 */
const addMviewByPairName = (pairName, granularity, start = '2 year', withData = false) => {
  if (!pairName || !granularity) {
    return Promise.reject(new Error('pair name or granularity not provided'));
  }

  const withDataSQL = withData ? 'DATA' : 'NO DATA';
  const mviewName = generateMViewSchemeName(pairName, granularity);
  const intervalSQL = granularityToSQLString(granularity);

  return getPair({ name: pairName })
    .then((res) => {
      if (!res) {
        throw new Error('pair name does not exist in database');
      }

      const pairID = res.id;

      return knex.raw(`
        CREATE MATERIALIZED VIEW ${mviewName}
        AS
          WITH intervals AS (
            SELECT start, start + interval '${intervalSQL}' AS end
          FROM generate_series(current_date - interval '${start}', current_date, interval '${intervalSQL}') AS start)
          SELECT DISTINCT
            intervals.start AS dt,
            min(bid_l) OVER w AS bid_l,
            max(bid_h) OVER w AS bid_h,
            first_value(bid_o) OVER w as bid_o,
            last_value(bid_c) OVER w as bid_c,
            sum(bid_v) OVER w AS bid_v,
            min(ask_l) OVER w AS ask_l,
            max(ask_h) OVER w AS ask_h,
            first_value(ask_o) OVER w as ask_o,
            last_value(ask_c) OVER w as ask_c,
            sum(ask_v) OVER w AS ask_v,
            min((bid_l + ask_l) / 2) OVER w AS mid_l,
            max((bid_h + ask_h) / 2) OVER w AS mid_h,
            first_value((bid_o + ask_o) / 2) OVER w as mid_o,
            last_value((bid_c + ask_c) / 2) OVER w as mid_c,
            sum((bid_v + ask_v) / 2) OVER w AS mid_v,
            sum(ticks) OVER w AS ticks
          FROM intervals 
          JOIN s5bars s5 ON 
            s5.id_pairs = ${pairID} AND
            s5.dt >= intervals.start AND
            s5.dt < intervals.end
          WINDOW w AS (PARTITION BY intervals.start ORDER BY
            s5.dt ASC rows BETWEEN UNBOUNDED PRECEDING AND
            UNBOUNDED FOLLOWING)
          ORDER BY intervals.start
        WITH ${withDataSQL}`)
        .then(() => {
          return knex.raw(`CREATE UNIQUE INDEX ${mviewName}_index ON ${mviewName} (dt)`);
        });
    });
};

const createMviewCombos = () => {
  const granularities = ['m1', 'm5', 'm30', 'h1', 'h4', 'd1'];

  return getAllPairs()
    .then((pairs) => {
      const pairNames = pairs.map(pair => pair.name);

      const pairGranularityCombos = generatePairGranularityCombos(pairNames, granularities);

      return pairGranularityCombos.reduce((previous, current, index, array) => {
        return previous.then(() => addMviewByPairName(array[index][0], array[index][1]));
      }, Promise.resolve());
    });
};

const getAllMviews = () => {
  return knex.select(knex.raw('oid::regclass::text')).from('pg_class').where('relkind', 'm');
};

const deleteAllMviews = () => {
  return knex.select(knex.raw('\'DROP MATERIALIZED VIEW \' || string_agg(oid::regclass::text, \', \')'))
    .from('pg_class').where('relkind', 'm')
    .then((query) => {
      return knex.raw(query[0]['?column?']);
    });
};

const deleteMviewByName = (mviewName) => {
  return knex.raw(`DROP MATERIALIZED VIEW ${mviewName}`);
};

const dropAllPGSessions = () => {
  return knex.select(knex.raw('pg_terminate_backend(pg_stat_activity.pid)'))
    .from('pg_stat_activity')
    .where(knex.raw('datname = current_database()'))
    .andWhere(knex.raw('pid <> pg_backend_pid()'));
};

const refreshMviewByName = (mviewName, concurrent = false) => {
  const concurrently = concurrent ? 'CONCURRENTLY' : '';

  return knex.raw(`REFRESH MATERIALIZED VIEW ${concurrently} ${mviewName};`);
};

const refreshAllMviews = (concurrent = false) => {
  return getAllMviews()
    .then((res) => {
      const mviews = res.map(item => item.oid);
      return mviews.reduce((previous, current, index, array) => {
        return previous.then(() => refreshMviewByName(array[index], concurrent));
      }, Promise.resolve());
    });
};

refreshAllMviews();
// refreshMviewByName('mview_eurusd_m1')
//   .then((res) => {
//     console.log(res);
//   });

// getAllMviews()
//   .then(res => {
//     console.log(res);
//   });

// createMviewCombos()
//   .then(res => {
//     console.log(res);
//   });

// deleteMviewByName('mview_usdchf_m1')
//   .then(res => {
//     console.log(res);
//   })

// deleteAllMviews()
//   .then(res => {
//     console.log(res);
//   });

// getAllMviews()
//   .then(res => {
//     console.log(res);
//   });

// dropAllPGSessions()
//   .then((res) => {
//     console.log(res);
//   });

// console.log(dropAllPGSessions());


// addMviewByPairName('EURUSD', 'h4', '1 year', false)
//   .then(res => {
//     console.log(res);
//   });

module.exports = {
  getAllPairs,
  getPair,
  addPair,
  updatePairById,
  getTicksByIds,
  deletePairById,
  getTicksByTimeRangeAndPairId,
  addTick,
  updateTickById,
  deleteTickById,
  getS5BarsByTimeRangeAndPairID,
  addS5Bar,
  updateS5BarsById,
  deleteS5BarsById,
  addBulkS5Bars,
  addMviewByPairName,
  createMviewCombos,
  getAllMviews,
  deleteAllMviews,
  deleteMviewByName,
  dropAllPGSessions,
  refreshMviewByName,
  refreshAllMviews
};
