const queries = require('../db/queries');

const errorHandler = (req, res, status, err) => {
  console.error(err);
  res.status(status || 400).json({ message: err.message, error: err });
};

module.exports = {
  get: (req, res) => {
    const { pairID, start, end } = req.query;

    queries.getTicksByTimeRangeAndPairID({ pairID, start, end })
      .then(data => res.status(200).json(data))
      .catch(err => errorHandler(req, res, 404, err));
  },
  post: (req, res) => {
    const { dt, bid, ask, bid_vol, ask_vol, id_pairs } = req.body;

    queries.addTick({ dt, bid, ask, bid_vol, ask_vol, id_pairs })
      .then(newTick => res.status(201).json(newTick))
      .catch(err => errorHandler(req, res, 400, err));
  },
  delete: (req, res) => {
    const tickID = req.params.id;

    queries.deleteTickById(tickID)
      .then(result => res.status(200).json(result))
      .catch(err => errorHandler(req, res, 400, err));
  },
  patch: (req, res) => {
    const tickID = req.params.id;
    const updates = req.body;

    queries.updateTickById(tickID, updates)
      .then(updatedTick => res.status(200).json(updatedTick))
      .catch(err => errorHandler(req, res, 400, err));
  }
};
