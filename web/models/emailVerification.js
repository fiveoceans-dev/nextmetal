const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL + "?sslmode=require",
});

const EmailVerification = {
  findByUserIdAndCode: async (userId, verificationCode) => {
    // Query remains unchanged; schema is consistent for this table
    const res = await pool.query(
      'SELECT * FROM nextmetal.email_verifications WHERE user_id = $1 AND verification_code = $2 AND expires_at > NOW()',
      [userId, verificationCode]
    );
    return res.rows[0];
  },

  create: async (userId, verificationCode) => {
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Insert remains unchanged for schema; explicit and clean columns
    const result = await pool.query(
      'INSERT INTO nextmetal.email_verifications (user_id, verification_code, expires_at) VALUES ($1, $2, $3) RETURNING id, verification_code, expires_at',
      [userId, verificationCode, expiresAt]
    );
    return result.rows[0];
  }
};

module.exports = EmailVerification;