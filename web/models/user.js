/* models/user.js ----------------------------------------------------------- */
const { Pool }   = require('pg');
const bcrypt     = require('bcryptjs');
const crypto     = require('crypto');
const isUUID     = (id) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const pool = new Pool({
  connectionString: `${process.env.DATABASE_URL}?sslmode=require`,
});

/* ──────────────────────────── Queries & helpers ─────────────────────────── */

/**
 * Strict fetch — throws on anything abnormal.
 */
async function findOne(id) {
  if (!isUUID(id)) throw new Error(`invalid-uuid:${id}`);

  const { rows } = await pool.query(
    'SELECT * FROM nextmetal.users WHERE id = $1',
    [id]
  );
  if (!rows.length) throw new Error(`user-not-found:${id}`);
  return rows[0];
}

/**
 * Lenient fetch — returns null when absent.
 */
async function findById(id) {
  try {
    return await findOne(id);
  } catch (e) {
    if (String(e.message).startsWith('user-not-found')) return null;
    throw e;                        // re-throw invalid UUID, pg errors, etc.
  }
}

async function findByEmail(email) {
  const { rows } = await pool.query(
    'SELECT * FROM nextmetal.users WHERE email = $1',
    [email]
  );
  return rows[0] || null;
}

async function findByIdOrEmail(identifier) {
  return isUUID(identifier)
    ? await findById(identifier)
    : await findByEmail(identifier);
}

/* ─────────────────────────────── Creation ──────────────────────────────── */

async function create({
  id = crypto.randomUUID(),
  email,
  password,
  referredBy = null,
  pubEthAddr,
  encPrivKey,
}) {
  const hashed = await bcrypt.hash(password, 10);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insert user
    const {
      rows: [user],
    } = await client.query(
      `INSERT INTO nextmetal.users (id, email, password_hash, referred_by)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email`,
      [id, email, hashed, referredBy]
    );

    // 2. Optional referral bookkeeping
    if (referredBy) {
      const {
        rows: [refCode],
      } = await client.query(
        'SELECT id FROM nextmetal.referral_codes WHERE code = $1',
        [referredBy]
      );
      if (refCode)
        await client.query(
          `INSERT INTO nextmetal.referral_usages (referred_id, referral_code_id)
           VALUES ($1, $2)`,
          [user.id, refCode.id]
        );
    }

    // 3. Wallet (idempotent)
    await client.query(
      `INSERT INTO nextmetal.user_wallets (user_id, pub_eth_addr, enc_priv_key)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO NOTHING`,
      [user.id, pubEthAddr, encPrivKey]
    );

    // 4. Generate personal referral code
    const code = `REF-${user.id.slice(0, 8).toUpperCase()}`;
    await client.query(
      'INSERT INTO nextmetal.referral_codes (code, owner_id) VALUES ($1, $2)',
      [code, user.id]
    );

    await client.query('COMMIT');
    return user; // { id, email }
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/* ─────────────────────── Email / Password helpers ──────────────────────── */

async function verifyEmail(id, verificationCode) {
  const { rows } = await pool.query(
    `SELECT * FROM nextmetal.email_verifications
      WHERE user_id = $1
        AND verification_code = $2
        AND expires_at > NOW()`,
    [id, verificationCode]
  );
  if (!rows.length) throw new Error('invalid-or-expired-code');
  return rows[0];
}

async function createEmailVerification(id) {
  const code    = crypto.randomBytes(16).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // +1 h
  const {
    rows: [row],
  } = await pool.query(
    `INSERT INTO nextmetal.email_verifications (user_id, verification_code, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [id, code, expires]
  );
  return { id: row.id, verification_code: code, expires_at: expires };
}

async function createPasswordReset(id) {
  const token   = crypto.randomBytes(16).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  const {
    rows: [row],
  } = await pool.query(
    `INSERT INTO nextmetal.password_resets (user_id, reset_token, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [id, token, expires]
  );
  return { id: row.id, reset_token: token, expires_at: expires };
}

async function findPasswordReset(resetToken) {
  const { rows } = await pool.query(
    `SELECT * FROM nextmetal.password_resets
      WHERE reset_token = $1
        AND expires_at > NOW()`,
    [resetToken]
  );
  if (!rows.length) throw new Error('invalid-or-expired-token');
  return rows[0];
}

/* ──────────────────────────── Exports ──────────────────────────────────── */
module.exports = {
  findOne,
  findById,
  findByEmail,
  findByIdOrEmail,

  create,

  verifyEmail,
  createEmailVerification,
  createPasswordReset,
  findPasswordReset,
};