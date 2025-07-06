/* routes/auth.js --------------------------------------------------------- */
require('dotenv').config();

const express   = require('express');
const passport  = require('passport');
const bcrypt    = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const {
  signToken,          // utils/jwt.js  →  jwt.sign({ uid }, secret)
  setJwtCookie,       // utils/jwt.js  →  res.cookie(cookieName, token , …)
  requireJwt          // utils/jwt.js  →  bearer-or-cookie auth
} = require('../middleware/jwt');

const User            = require('../models/user');
const db              = require('../utils/db');
const { generateWallet } = require('../utils/wallet');

/* ───────────────────────── helpers ───────────────────────── */

function wantsJson(req) {
  return (
    'json' in req.query ||                               //   /login?json
    req.get('x-client') === 'desktop' ||                 //   custom header
    req.accepts(['json', 'html']) === 'json'             //   Accept: application/json
  );
}

function issueLogin(req, res) {
  const token = signToken(req.user);

  /* ---------- JSON response (desktop / API) ---------- */
  if (wantsJson(req)) {
    return res.json({
      token,
      user: { id: req.user.id, email: req.user.email }
    });
  }

  /* ---------- Browser flow ---------- */
  setJwtCookie(res, token);                              // secure; http-only
  const dest = req.session?.returnTo || '/dashboard';    // deep-link
  if (req.session) delete req.session.returnTo;
  res.redirect(dest);
}

/* ───────────────────────── Routers ───────────────────────── */
const html = express.Router();
const api  = express.Router();            // exported (desktop uses /api/auth)

/* ----------  Registration (HTML form)  ---------- */
html.post('/register', async (req, res, next) => {
  try {
    const email = (req.body.email ?? '').trim().toLowerCase();
    const pass  = req.body.password ?? '';

    if (!email || !pass)
      return res.redirect('/members?error=Missing+credentials');

    /* 1️⃣ Existing user → fall back to login */
    try {
      const u = await User.findByEmail(email);
      if (!(await bcrypt.compare(pass, u.password_hash)))
        return res.redirect('/members?error=Incorrect+password');
      req.user = u;
      return issueLogin(req, res);
    } catch { /* not found – continue */ }

    /* 2️⃣ Create brand-new user */
    const { address, encryptedPrivateKey } = await generateWallet(pass);

    req.user = await User.create({
      id:          uuidv4(),
      email,
      password:    pass,
      pubEthAddr:  address,
      encPrivKey:  encryptedPrivateKey
    });

    issueLogin(req, res);
  } catch (e) {
    console.error('[register]', e);
    res.redirect('/members?error=Registration+failed');
  }
});

/* ----------  Login (shared handler)  ---------- */
const localAuth = passport.authenticate('local', {
  session: false,
  failureRedirect: '/members?error=Invalid+credentials'
});

html.post('/login', localAuth, issueLogin);
api .post('/login', localAuth, issueLogin);   // desktop hits  /api/auth/login

/* ----------  Logout (HTML)  ---------- */
html.get('/logout', (_req, res) => {
  res.clearCookie(require('../middleware/jwt').cookieName);
  res.redirect('/');
});

/* ----------  Protected profile API ---------- */
api.get('/profile', requireJwt, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT COALESCE(SUM(delta),0)::int AS points
         FROM nextmetal.points_core
        WHERE user_id = $1`, [req.user.id]);

    res.json({ id: req.user.id, email: req.user.email, points: rows[0].points });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server-error' });
  }
});

/* ───────────────────────── exports ───────────────────────── */
module.exports = { html, api, requireJwt };
