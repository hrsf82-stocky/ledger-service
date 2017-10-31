const queries = require('../db/queries');

module.exports = {
  get: (req, res) => {
    const pairID = req.query.id;

    if (pairID !== undefined) {
      queries.getPair({ id: pairID })
        .then(pair => res.status(200).json(pair));
    } else {
      queries.getAllPairs()
        .then(pairs => res.status(200).json(pairs));
    }
  },
  post: (req, res) => {
    
    // models.messages.post(req.body, function(error, results) {
    //   res.status(error ? 400 : 201).send();
    // });
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
