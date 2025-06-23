// server.js

require('dotenv').config();

const app = require('./app');
const port = process.env.NODE_ENV === 'production' ? 80 : 3001;


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
