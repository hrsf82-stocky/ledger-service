const queries = require('../db/queries');

module.exports = {
  get: (req, res, next) => {
    queries.getAllMviews()
      .then((results) => {
        const mviews = results.map(item => item.oid);
        res.status(200).json(mviews);
      })
      .catch(err => next(err));
  },

  post: (req, res, next) => {
    queries.createMviewCombos()
      .then(result => res.status(201).json(result))
      .catch(err => next(err));
  },

  delete: (req, res, next) => {
    const mviewName = req.params.name;

    if (mviewName === 'all') {
      queries.deleteAllMviews()
        .then(result => res.status(200).json(result))
        .catch(err => next(err));
    } else {
      queries.deleteMviewByName(mviewName)
        .then(result => res.status(200).json(result))
        .catch(err => next(err));
    }
  },

  patch: (req, res, next) => {
    const mviewName = req.params.name;
    const { concurrent } = req.body;

    if (mviewName === 'all') {
      queries.refreshAllMviews(!!concurrent)
        .then(result => res.status(200).json(result))
        .catch(err => next(err));
    } else {
      queries.refreshMviewByName(mviewName, !!concurrent)
        .then(result => res.status(200).json(result))
        .catch(err => next(err));
    }
  }
};
