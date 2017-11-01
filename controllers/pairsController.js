const queries = require('../db/queries');

module.exports = {
  get: (req, res, next) => {
    const pairID = req.query.id;

    if (pairID !== undefined) {
      queries.getPair({ id: pairID })
        .then(pair => res.status(200).json(pair))
        .catch(err => next(err));
    } else {
      queries.getAllPairs()
        .then(pairs => res.status(200).json(pairs))
        .catch(err => next(err));
    }
  },

  post: (req, res, next) => {
    const { name, major } = req.body;

    queries.addPair({ name, major })
      .then(newPair => res.status(201).json(newPair))
      .catch(err => next(err));
  },

  delete: (req, res, next) => {
    const pairID = req.params.id;

    queries.deletePairById(pairID)
      .then(result => res.status(200).json(result))
      .catch(err => next(err));
  },

  patch: (req, res, next) => {
    const pairID = req.params.id;
    const updates = req.body;

    queries.updatePairById(pairID, updates)
      .then(updatedPair => res.status(200).json(updatedPair))
      .catch(err => next(err));
  }
};
