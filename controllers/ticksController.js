const queries = require('../db/queries');

module.exports = {
  get: (req, res) => {
    const { pairID, start, end } = req.query;

    queries.getTicksByTimeRangeAndPairID({ pairID, start, end })
      .then(data => res.status(200).json(data))
      .catch((err) => {
        console.error(err);
        res.status(404).json({ message: err.message, error: err });
      });
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
