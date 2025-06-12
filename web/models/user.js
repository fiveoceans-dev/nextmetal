const db = require('../utils/db');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const isUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL + "?sslmode=require",
});

// ───── User Lookups ─────
async function findOne(id) {
  if (!isUUID(id)) throw new Error(`Invalid UUID: ${id}`);
  const res = await pool.query('SELECT * FROM nextmetal.users WHERE id = $1', [id]);
  if (res.rows.length === 0) throw new Error(`User not found with ID: ${id}`);
  return res.rows[0];
}

async function findByEmail(email) {
  const res = await db.query('SELECT * FROM nextmetal.users WHERE email = $1', [email]);
  return res.rows[0] || null;
}

async function findByIdOrEmail(identifier) {
  return isUUID(identifier) ? await findOne(identifier) : await findByEmail(identifier);
}

// ───── User Creation ─────
async function create({ email, id, password, referredBy = null, pubEthAddr, encPrivKey }) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert user
    const userResult = await client.query(
      'INSERT INTO nextmetal.users (email, id, password_hash, referred_by) VALUES ($1, $2, $3, $4) RETURNING id, email',
      [email, id, hashedPassword, referredBy]
    );
    const userId = userResult.rows[0].id;

    // Optionally record referral usage if a code was entered, and the code exists (by value)
    if (referredBy) {
      // Find referral_codes.id by code string
      const codeRes = await client.query(
        'SELECT id FROM nextmetal.referral_codes WHERE code = $1',
        [referredBy]
      );
      if (codeRes.rows.length > 0) {
        await client.query(
          'INSERT INTO nextmetal.referral_usages (referred_id, referral_code_id) VALUES ($1, $2)',
          [userId, codeRes.rows[0].id]
        );
      }
    }


    // Create user_wallet (if not already exists)
    await client.query(
      `INSERT INTO nextmetal.user_wallets (user_id, pub_eth_addr, enc_priv_key)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId, pubEthAddr, encPrivKey]
    );

    // Generate a unique referral code for this user
    const generatedCode = `REF-${userId.slice(0, 8).toUpperCase()}`;
    await client.query(
      'INSERT INTO nextmetal.referral_codes (code, owner_id) VALUES ($1, $2)',
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

// ───── Email Verification ─────
async function verifyEmail(id, verificationCode) {
  const res = await pool.query(
    'SELECT * FROM nextmetal.email_verifications WHERE user_id = $1 AND verification_code = $2 AND expires_at > NOW()',
    [id, verificationCode]
  );
  if (res.rows.length === 0) throw new Error('Invalid or expired verification code');
  return res.rows[0];
}

async function createEmailVerification(id) {
  const code = crypto.randomBytes(16).toString('hex');
  const expires = new Date(Date.now() + 3600000);
  const result = await pool.query(
    'INSERT INTO nextmetal.email_verifications (user_id, verification_code, expires_at) VALUES ($1, $2, $3) RETURNING id',
    [id, code, expires]
  );
  return { id: result.rows[0].id, verification_code: code, expires_at: expires };
}

// ───── Password Reset ─────
async function createPasswordReset(id) {
  const token = crypto.randomBytes(16).toString('hex');
  const expires = new Date(Date.now() + 3600000);
  const result = await pool.query(
    'INSERT INTO nextmetal.password_resets (user_id, reset_token, expires_at) VALUES ($1, $2, $3) RETURNING id',
    [id, token, expires]
  );
  return { id: result.rows[0].id, reset_token: token, expires_at: expires };
}

async function findPasswordReset(resetToken) {
  const res = await pool.query(
    'SELECT * FROM nextmetal.password_resets WHERE reset_token = $1 AND expires_at > NOW()',
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
  findPasswordReset,
};