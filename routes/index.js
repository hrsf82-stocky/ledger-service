const router = require('express').Router();

const ticks = require('../controllers/ticksController');
const pairs = require('../controllers/pairsController');
const candles = require('../controllers/candlesController');

/* API V1 routes */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

// Pairs Routes
router.get('/pairs/:id', pairs.get);
router.post('/pairs', pairs.post);
router.delete('/pairs/:id', pairs.delete);
router.patch('/pairs/:id', pairs.patch);

// Ticks Routes
router.get('/ticks/:id', ticks.get);
router.post('/ticks', ticks.post);
router.delete('/ticks/:id', ticks.delete);
router.patch('/ticks/:id', ticks.patch);

// Candle Routes
router.get('/candles/:id', candles.get);
router.post('/candles', candles.post);
router.delete('/candles/:id', candles.delete);
router.patch('/candles/:id', candles.patch);

module.exports = router;
