/* routes/auth.js */
const express  = require('express');
const passport = require('passport');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const User   = require('../models/user');
const db     = require('../utils/db');
const { generateWallet } = require('../utils/wallet');

const router = express.Router();

/* redirect helper */
function finishAuth (req, res) {
  const dest = req.session.returnTo || '/dashboard';
  delete req.session.returnTo;
  res.redirect(dest);
}

/* POST /auth/register (HTML form) */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, referralCode } = req.body;
    const mail = (email || '').trim().toLowerCase();
    const ref  = (referralCode || '').trim();

    if (!mail || !password) return res.redirect('/members?error=Missing+credentials');

    /* existing user → login */
    try {
      const u = await User.findByEmail(mail);
      if (!(await bcrypt.compare(password, u.password_hash)))
        return res.redirect('/members?error=Incorrect+password');
      return req.login(u, e => e ? next(e) : finishAuth(req, res));
    } catch {/* not found → continue */ }

    /* validate referral (optional) */
    let refId = null;
    if (ref) {
      const r = await db.query(
        `SELECT id, uses_left FROM nextmetal.referral_codes
         WHERE code=$1 AND uses_left>0`,
        [ref]
      );
      if (r.rowCount === 0)
        return res.redirect('/members?error=Bad+referral+code');
      refId = r.rows[0].id;
    }

    /* wallet */
    const { address, encryptedPrivateKey } = await generateWallet(password);

    /* create user */
    const newUser = await User.create({
      id: uuidv4(),
      email: mail,
      password,
      referralCodeId: refId,
      pubEthAddr: address,
      encPrivKey: encryptedPrivateKey
    });

    req.login(newUser, e => e ? next(e) : finishAuth(req, res));
  } catch (e) {
    console.error('[register]', e);
    res.redirect('/members?error=Registration+failed');
  }
});

/* POST /auth/login (HTML form) */
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (e, user) => {
    if (e || !user) return res.redirect('/members?error=Invalid+credentials');
    req.login(user, e2 => e2 ? next(e2) : finishAuth(req, res));
  })(req, res, next);
});

/* POST /api/login (JSON) */
router.post('/api/login', (req, res, next) => {
  passport.authenticate('local', (e, user) => {
    if (e || !user) return res.status(401).json({ error: 'Bad credentials' });
    req.login(user, e2 => {
      if (e2) return next(e2);
      const token = jwt.sign({ uid: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, email: user.email } });
    });
  })(req, res, next);
});

/* GET /auth/logout */
router.get('/logout', (req, res, next) => {
  req.logout(err => err ? next(err) : res.redirect('/'));
});

module.exports = router;