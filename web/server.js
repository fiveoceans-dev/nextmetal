// server.js

require('dotenv').config();

const app = require('./app');
const port = process.env.PORT || 8080;

// Database connection
const databaseUrl = process.env.DATABASE_URL;
console.log("Connected to database:");


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
