/* ──────────────────────────────────────────────────────────
   routes/auth.js   – shared HTML + JSON auth endpoints
   ────────────────────────────────────────────────────────── */
require('dotenv').config();

const express     = require('express');
const passport    = require('passport');
const bcrypt      = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const {
  signToken,
  setJwtCookie,
  requireJwt,
  cookieName            // exported from middleware/jwt.js
} = require('../middleware/jwt');

const User            = require('../models/user');
const db              = require('../utils/db');
const { generateWallet } = require('../utils/wallet');

/* ───────────────────────── helpers ───────────────────────── */
function wantsJson(req) {
  return (
    'json' in req.query ||
    (req.get('x-client') || '').toLowerCase() === 'desktop' ||
    (req.accepts(['json', 'html']) || '') === 'json'
  );
}

async function fetchUserRow(id) {
  const { rows } = await db.query(
    `SELECT email, nickname, total_points
       FROM nextmetal.users
      WHERE id = $1`,
    [id]
  );
  return rows[0];
}

function toApiUser(u, fallbackEmail) {
  return {
    id:           u?.id,
    email:        u?.email       ?? fallbackEmail,
    nickname:     u?.nickname    ?? null,
    total_points: u?.total_points ?? 0
  };
}

async function issueLogin(req, res) {
  const token = signToken(req.user);

  try {
    const userRow = await fetchUserRow(req.user.id);

    // ── Desktop / API clients ─────────────────────────────────
    if (wantsJson(req)) {
      return res.json({ token, user: toApiUser({ id: req.user.id, ...userRow }) });
    }

    // ── Browser flow (cookie + redirect) ──────────────────────
    setJwtCookie(res, token);
    const dest = req.session?.returnTo || '/dashboard';
    if (req.session) delete req.session.returnTo;
    return res.redirect(dest);
  } catch (err) {
    console.error('[issueLogin]', err);
    return res.status(500).json({ error: 'login-failed' });
  }
}

/* ───────────────────────── Routers ───────────────────────── */
const html = express.Router();
const api  = express.Router();

/* ----------  Registration (HTML)  ---------- */
html.post('/register', async (req, res) => {
  try {
    const email = (req.body.email ?? '').trim().toLowerCase();
    const pass  = req.body.password ?? '';

    if (!email || !pass) {
      return res.redirect('/members?error=Missing+credentials');
    }

    /* 1.  Existing account →  login  */
    try {
      const existing = await User.findByEmail(email);
      if (!(await bcrypt.compare(pass, existing.password_hash))) {
        return res.redirect('/members?error=Incorrect+password');
      }
      req.user = existing;
      return issueLogin(req, res);
    } catch { /* fall through – not found */ }

    /* 2.  Brand-new account  */
    const { address, encryptedPrivateKey } = await generateWallet(pass);

    req.user = await User.create({
      id:          uuidv4(),
      email,
      password:    pass,
      pubEthAddr:  address,
      encPrivKey:  encryptedPrivateKey
    });

    return issueLogin(req, res);
  } catch (err) {
    console.error('[register]', err);
    return res.redirect('/members?error=Registration+failed');
  }
});

/* ----------  Login (shared handler) ---------- */
const localAuth = passport.authenticate('local', {
  session: false,
  failureRedirect: '/members?error=Invalid+credentials'
});

html.post('/login', localAuth, issueLogin);
api .post('/login', localAuth, issueLogin);

/* ----------  Logout (HTML) ---------- */
html.get('/logout', (_req, res) => {
  res.clearCookie(cookieName);
  res.redirect('/');
});

/* ----------  Protected profile API ---------- */
api.get('/profile', requireJwt, async (req, res) => {
  try {
    const userRow = await fetchUserRow(req.user.id);
    if (!userRow) return res.status(404).json({ error: 'not-found' });

    return res.json({ user: toApiUser({ id: req.user.id, ...userRow }) });
  } catch (err) {
    console.error('[profile]', err);
    return res.status(500).json({ error: 'server-error' });
  }
});

/* ───────────────────────── exports ───────────────────────── */
module.exports = { html, api, requireJwt };
