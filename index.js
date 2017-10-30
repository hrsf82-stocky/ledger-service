const app = require('./app.js');

const port = process.env.PORT || 8888;

app.listen(port, (err) => {
  if (err) {
    console.error('Cannot Connect to Ledger Service Server');
  }
  console.log(`Ledger Service Server: Listening on ${port}`);
});
