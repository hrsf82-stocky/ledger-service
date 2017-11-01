const queries = require('../db/queries');

module.exports = {
  get: (req, res, next) => {
    const { pairID, start, end } = req.query;

    queries.getTicksByTimeRangeAndPairId({ pairID, start, end })
      .then(data => res.status(200).json(data))
      .catch(err => next(err));
  },
  post: (req, res, next) => {
    const { dt, bid, ask, bid_vol, ask_vol, id_pairs } = req.body;

    queries.addTick({ dt, bid, ask, bid_vol, ask_vol, id_pairs })
      .then(newTick => res.status(201).json(newTick))
      .catch(err => next(err));
  },
  delete: (req, res, next) => {
    const tickID = req.params.id;

    queries.deleteTickById(tickID)
      .then(result => res.status(200).json(result))
      .catch(err => next(err));
  },
  patch: (req, res, next) => {
    const tickID = req.params.id;
    const updates = req.body;

    queries.updateTickById(tickID, updates)
      .then(updatedTick => res.status(200).json(updatedTick))
      .catch(err => next(err));
  }
};
