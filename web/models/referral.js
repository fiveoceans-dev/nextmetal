// model.exports = {
const db = require('../utils/db');

const Referral = {
  // Create a referral code
  async create({ ownerId, code, usesLeft }) {
    const result = await db.query(
      `INSERT INTO nextmetal.referral_codes (owner_id, code, uses_left)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [ownerId, code, usesLeft]
    );
    return result.rows[0];
  },

  // Find referral code by code string
  async findByCode(code) {
    const result = await db.query(
      `SELECT * FROM nextmetal.referral_codes WHERE code = $1`,
      [code]
    );
    return result.rows[0] || null;
  },

  // Use a referral code (record usage)
  async useCode({ userId, code }) {
    const codeRes = await db.query(
      `SELECT id FROM nextmetal.referral_codes WHERE code = $1`,
      [code]
    );
    if (codeRes.rows.length === 0) {
      throw new Error('Referral code not found');
    }
    const referralCodeId = codeRes.rows[0].id;

    return db.query(
      `INSERT INTO nextmetal.referral_usages (referred_id, referral_code_id)
       VALUES ($1, $2)`,
      [userId, referralCodeId]
    );
  },

  // Decrease remaining usage limit of a referral code
  async decrementUsesLeft(code) {
    await db.query(
      `UPDATE nextmetal.referral_codes
       SET uses_left = uses_left - 1
       WHERE code = $1 AND uses_left > 0`,
      [code]
    );
  },

  // Count usages of a given referral code
  async getUsageCount(code) {
    const codeRes = await db.query(
      `SELECT id FROM nextmetal.referral_codes WHERE code = $1`,
      [code]
    );
    if (codeRes.rows.length === 0) return 0;

    const referralCodeId = codeRes.rows[0].id;

    const result = await db.query(
      `SELECT COUNT(*)::INT AS count
       FROM nextmetal.referral_usages
       WHERE referral_code_id = $1`,
      [referralCodeId]
    );
    return result.rows[0].count;
  },

  // Get all referral codes created by a user, with usage counts
  async findAllByOwner(ownerId) {
    const result = await db.query(
      `SELECT r.*,
              COUNT(ru.id)::INT AS used_count
         FROM nextmetal.referral_codes r
         LEFT JOIN nextmetal.referral_usages ru
           ON ru.referral_code_id = r.id
        WHERE r.owner_id = $1
        GROUP BY r.id`,
      [ownerId]
    );
    return result.rows;
  }
};

module.exports = Referral;
