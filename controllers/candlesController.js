const queries = require('../db/queries');

module.exports = {
  get: (req, res, next) => {
    const { pairID, start, end } = req.query;

    queries.getS5BarsByTimeRangeAndPairID({ pairID, start, end })
      .then(data => res.status(200).json(data))
      .catch(err => next(err));
  },
  post: (req, res, next) => {
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
      ask_v } = req.body;

    queries.addS5Bar({
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
      .then(newS5Bar => res.status(201).json(newS5Bar))
      .catch(err => next(err));
  },
  delete: (req, res, next) => {
    const s5barID = req.params.id;

    queries.deleteS5BarsById(s5barID)
      .then(result => res.status(200).json(result))
      .catch(err => next(err));
  },
  patch: (req, res, next) => {
    const s5barID = req.params.id;
    const updates = req.body;

    queries.updateS5BarsById(s5barID, updates)
      .then(updatedBar => res.status(200).json(updatedBar))
      .catch(err => next(err));
  }
};
