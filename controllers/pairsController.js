const queries = require('../db/queries');

const errorHandler = (req, res, status, err) => {
  console.error(err);
  res.status(status || 400).json({ message: err.message, error: err });
};

module.exports = {
  get: (req, res) => {
    const pairID = req.query.id;

    if (pairID !== undefined) {
      queries.getPair({ id: pairID })
        .then(pair => res.status(200).json(pair))
        .catch(err => errorHandler(req, res, 404, err));
    } else {
      queries.getAllPairs()
        .then(pairs => res.status(200).json(pairs))
        .catch(err => errorHandler(req, res, 404, err));
    }
  },

  post: (req, res) => {
    const { name, major } = req.body;

    queries.addPair({ name, major })
      .then(newPair => res.status(201).json(newPair))
      .catch(err => errorHandler(req, res, 400, err));
  },

  delete: (req, res) => {
    const pairID = req.params.id;

    queries.deletePairById(pairID)
      .then(result => res.status(200).json(result))
      .catch(err => errorHandler(req, res, 400, err));
  },

  patch: (req, res) => {
    const pairID = req.params.id;
    const updates = req.body;

    queries.updatePairById(pairID, updates)
      .then(updatedPair => res.status(200).json(updatedPair))
      .catch(err => errorHandler(req, res, 400, err));
  }
};
