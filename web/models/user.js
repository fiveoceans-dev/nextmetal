const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const isUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL + "?sslmode=require",
});

// Find user by ID
async function findOne(id) {
  if (!isUUID(id)) throw new Error(`Invalid UUID: ${id}`);
  const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  if (res.rows.length === 0) throw new Error(`User not found with ID: ${id}`);
  return res.rows[0];
}

// Find user by email
async function findByEmail(email) {
  const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (res.rows.length === 0) throw new Error(`User not found with email: ${email}`);
  return res.rows[0];
}

// Try ID first, then fallback to email
async function findByIdOrEmail(identifier) {
  return isUUID(identifier) ? await findOne(identifier) : await findByEmail(identifier);
}

// Create user and setup associated rows
async function create({ email, id, password, referralCode = null }) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert into users
    const userResult = await client.query(
      'INSERT INTO users (email, id, password_hash) VALUES ($1, $2, $3) RETURNING id, email',
      [email, id, hashedPassword]
    );
    const userId = userResult.rows[0].id;

    // Log referral usage if provided
    if (referralCode) {
      await client.query(
        'INSERT INTO referral_usages (referred_id, referral_code) VALUES ($1, $2)',
        [userId, referralCode]
      );
    }

    // Create quest row
    await client.query(
      'INSERT INTO user_quests (user_id) VALUES ($1)',
      [userId]
    );

    // Generate referral code
    const generatedCode = `REF-${userId.slice(0, 8).toUpperCase()}`;
    await client.query(
      'INSERT INTO referral_codes (code, owner_id) VALUES ($1, $2)',
      [generatedCode, userId]
    );

    await client.query('COMMIT');
    return userResult.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Email verification
async function verifyEmail(id, verificationCode) {
  const res = await pool.query(
    'SELECT * FROM email_verifications WHERE user_id = $1 AND verification_code = $2 AND expires_at > NOW()',
    [id, verificationCode]
  );
  if (res.rows.length === 0) throw new Error('Invalid or expired verification code');
  return res.rows[0];
}

// Create email verification
async function createEmailVerification(id) {
  const code = crypto.randomBytes(16).toString('hex');
  const expires = new Date(Date.now() + 3600000);
  const result = await pool.query(
    'INSERT INTO email_verifications (user_id, verification_code, expires_at) VALUES ($1, $2, $3) RETURNING id',
    [id, code, expires]
  );
  return result.rows[0];
}

// Create password reset record
async function createPasswordReset(id) {
  const token = crypto.randomBytes(16).toString('hex');
  const expires = new Date(Date.now() + 3600000);
  const result = await pool.query(
    'INSERT INTO password_resets (user_id, reset_token, expires_at) VALUES ($1, $2, $3) RETURNING id',
    [id, token, expires]
  );
  return result.rows[0];
}

// Validate password reset
async function findPasswordReset(resetToken) {
  const res = await pool.query(
    'SELECT * FROM password_resets WHERE reset_token = $1 AND expires_at > NOW()',
    [resetToken]
  );
  if (res.rows.length === 0) throw new Error('Invalid or expired token');
  return res.rows[0];
}

module.exports = {
  findOne,
  findByEmail,
  findByIdOrEmail,
  create,
  verifyEmail,
  createEmailVerification,
  createPasswordReset,
  findPasswordReset
};
