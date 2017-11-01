const router = require('express').Router();

const ticks = require('../controllers/ticksController');
const pairs = require('../controllers/pairsController');
const candles = require('../controllers/candlesController');
const mviews = require('../controllers/mviewsController');

/* API V1 routes */
router.get('/', (req, res, next) => {
  res.json({ message: 'Ledger Service - API V1' });
});

// Pairs Routes
router.get('/pairs', pairs.get);
router.post('/pairs', pairs.post);
router.delete('/pairs/:id', pairs.delete);
router.patch('/pairs/:id', pairs.patch);

// Ticks Routes
router.get('/ticks', ticks.get);
router.post('/ticks', ticks.post);
router.delete('/ticks/:id', ticks.delete);
router.patch('/ticks/:id', ticks.patch);

// Candles Routes
router.get('/candles', candles.get);
router.post('/candles', candles.post);
router.delete('/candles/:id', candles.delete);
router.patch('/candles/:id', candles.patch);

// Materialized Views Routes
router.get('/mviews', mviews.get);
router.post('/mviews', mviews.post);
router.delete('/mviews/:name', mviews.delete);
router.patch('/mviews/:name', mviews.patch);

module.exports = router;
