// routes/auth.js

/* session + JWT auth (HTML ⇒ /auth , JSON ⇒ /api/auth) */
require('dotenv').config();

const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/user');
const db = require('../utils/db');
const { generateWallet } = require('../utils/wallet');
// const requireJwt     = require('../utils/authGuard');       // ← exported

const sign = u => jwt.sign({ uid: u.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const finish = (req, res) => {
  const dest = req.session.returnTo || '/dashboard';
  delete req.session.returnTo;
  res.redirect(dest);
};

/* ─────────────────────────  HTML  ───────────────────────── */
const html = express.Router();

/* POST /auth/register */
html.post('/register', async (req, res, next) => {
  try {
    const email = (req.body.email ?? '').trim().toLowerCase();
    const pass = req.body.password ?? '';
    const refCd = (req.body.referralCode ?? '').trim();

    if (!email || !pass)
      return res.redirect('/members?error=Missing+credentials');

    /* existing user ⇒ behave like login */
    try {
      const u = await User.findByEmail(email);
      if (!(await bcrypt.compare(pass, u.password_hash)))
        return res.redirect('/members?error=Incorrect+password');
      return req.login(u, err => err ? next(err) : finish(req, res));
    } catch { /* not found */ }

    /* optional referral check */
    let referral = null;
    if (refCd) {
      const ok = await db.query(
        `UPDATE nextmetal.referral_codes
            SET uses_left = uses_left - 1
          WHERE code = $1 AND uses_left > 0
        RETURNING code`,
        [refCd]
      );
      if (ok.rowCount === 0)
        return res.redirect('/members?error=Bad+referral');
      referral = ok.rows[0].code;
    }

    const { address, encryptedPrivateKey } = await generateWallet(pass);

    const user = await User.create({
      id: uuidv4(),
      email,
      password: pass,
      referralCode: referral,
      pubEthAddr: address,
      encPrivKey: encryptedPrivateKey
    });

    req.login(user, err => err ? next(err) : finish(req, res));
  } catch (e) {
    console.error('[register]', e);
    res.redirect('/members?error=Registration+failed');
  }
});

/* POST /auth/login */
html.post('/login',
  passport.authenticate('local', {failureRedirect: '/members?error=Invalid+credentials' }),
  (req, res) => finish(req, res)
);

/* GET /auth/logout */
html.get('/logout', (req, res, next) =>
  req.logout(err => err ? next(err) : res.redirect('/'))
);

/* ─────────────────────────  API  ───────────────────────── */
const signJWT = u => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');   /* safety */
  return jwt.sign({ uid: u.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/* tiny middleware – verify Bearer token once, attach uid */
function requireJwt(req, res, next) {
  const hdr = req.get('authorization') || '';
  const tok = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!tok) return res.status(401).json({ error: 'missing-token' });
  try {
    req.jwt = jwt.verify(tok, process.env.JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'invalid-token' }); }
}

/* … html router stays unchanged … */

/* JWT API ROUTER (/api/auth) */
const api = express.Router();

/* POST /api/auth/login → {token,user} */
api.post('/login',
  passport.authenticate('local', { session: false }),
  (req, res) => res.json({
    token: signJWT(req.user),
    user: { id: req.user.id, email: req.user.email }
  })
);

/* GET /api/auth/profile */
api.get('/profile', requireJwt, async (req, res) => {
  try {
    const user = await User.findById(req.jwt.uid);
    if (!user) return res.status(404).json({ error: 'not-found' });

    const { rows } = await db.query(
      `SELECT COALESCE(SUM(delta), 0)::int AS points
         FROM nextmetal.points_core
        WHERE user_id = $1`,
      [user.id]
    );

    res.json({
      id:     user.id,
      email:  user.email,
      points: rows[0].points
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server-error' });
  }
});

/* export everything needed elsewhere */
module.exports = { html, api, requireJwt, signJWT };