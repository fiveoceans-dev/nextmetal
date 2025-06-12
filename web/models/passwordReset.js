const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL + "?sslmode=require",
});

const PasswordReset = {
  findByToken: async (resetToken) => {
    // No schema change needed; password_resets schema is consistent
    const res = await pool.query(
      'SELECT * FROM nextmetal.password_resets WHERE reset_token = $1 AND expires_at > NOW()',
      [resetToken]
    );
    return res.rows[0];
  },

  create: async (userId, resetToken) => {
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
    const result = await pool.query(
      'INSERT INTO nextmetal.password_resets (user_id, reset_token, expires_at) VALUES ($1, $2, $3) RETURNING id, reset_token, expires_at',
      [userId, resetToken, expiresAt]
    );
    return result.rows[0];
  }
};

module.exports = PasswordReset;