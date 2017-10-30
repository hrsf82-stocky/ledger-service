const app = require('./app.js');

const port = process.env.PORT || 8888;

app.listen(port, (err) => {
  if (err) {
    console.error('Cannot Connect to Ledger Server');
  }
  console.log(`Ledger Server: Listening on ${port}`);
});
