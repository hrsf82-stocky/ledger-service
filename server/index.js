const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.status(200).json('Hello World');
});

app.listen(process.env.PORT || 8888, (err) => {
  if (err) {
    console.error('cannot connect to the server');
  }
  console.log(`listening on ${process.env.PORT || 8888}`);
});

module.exports = app;
