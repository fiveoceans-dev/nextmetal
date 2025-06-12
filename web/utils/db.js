// utils/db.js

const { Pool } = require('pg');

// Construct connection config
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // for Neon, Supabase, etc.
  },
});

// Optional: set schema on connection
pool.on('connect', (client) => {
  client.query('SET search_path TO nextmetal, public');
});

// Error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
  process.exit(-1);
});

module.exports = pool;
