// server.js
require('dotenv').config();

const app  = require('./app');
const PORT = process.env.PORT || 8080;

app.listen(PORT, () =>
  console.log(`▶︎ NextMetal API → http://127.0.0.1:${PORT}`)
);
