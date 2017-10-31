const queries = require('../db/queries');

module.exports = {
  get: (req, res) => {
    const pairID = req.query.id;

    if (pairID !== undefined) {
      queries.getPair({ id: pairID })
        .then(pair => res.status(200).json(pair))
        .catch((err) => {
          console.error(err);
          res.status(404).json(err);
        });
    } else {
      queries.getAllPairs()
        .then(pairs => res.status(200).json(pairs))
        .catch((err) => {
          console.error(err);
          res.status(404).json(err);
        });
    }
  },

  post: (req, res) => {
    const { name, major } = req.body;

    queries.addPair({ name, major })
      .then(newPair => res.status(201).json(newPair))
      .catch((err) => {
        console.error(err);
        res.status(400).json(err);
      });
  },

  delete: (req, res) => {
    const pairID = req.params.id;

    queries.deletePairById(pairID)
      .then(result => res.status(200).json(result))
      .catch((err) => {
        console.error(err);
        res.status(400).json(err);
      });
  },

  patch: (req, res) => {
    const pairID = req.params.id;
    const updates = req.body;
    console.log(pairID);

    queries.updatePairById(pairID, updates)
      .then(updatedPair => res.status(200).json(updatedPair))
      .catch((err) => {
        console.error(err);
        res.status(400).json(err);
      });
  }
};
