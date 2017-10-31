const queries = require('../db/queries');

const errorHandler = (req, res, status, err) => {
  console.error(err);
  res.status(status || 400).json({ message: err.message, error: err });
};

module.exports = {
  get: (req, res) => {
    const { pairID, start, end } = req.query;

    queries.getS5BarsByTimeRangeAndPairID({ pairID, start, end })
      .then(data => res.status(200).json(data))
      .catch(err => errorHandler(req, res, 404, err));
  },
  post: (req, res) => {
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
      .catch(err => errorHandler(req, res, 400, err));
  },
  delete: (req, res) => {
    // models.messages.post(req.body, function(error, results) {
    //   res.status(error ? 400 : 201).send();
    // });
  },
  patch: (req, res) => {
    // models.messages.post(req.body, function(error, results) {
    //   res.status(error ? 400 : 201).send();
    // });
  }
};
