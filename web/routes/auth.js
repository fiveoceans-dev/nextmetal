// routes/auth.js

const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user');
const Referral = require('../models/referral');
const { generateWallet } = require('../utils/wallet');

const router = express.Router();

// ─────────── Helper: Redirect after login ───────────
function finishAuth(req, res) {
  const redirectTo = req.session.returnTo || '/dashboard';
  delete req.session.returnTo;
  res.redirect(redirectTo);
}

// ─────────── REGISTER ───────────
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, referralCode } = req.body;
    const trimmedEmail = email?.trim().toLowerCase();
    const trimmedReferral = referralCode?.trim();

    if (typeof trimmedEmail !== 'string' || typeof password !== 'string') {
      return res.redirect('/members?error=Missing+credentials');
    }

    const existingUser = await User.findByEmail(trimmedEmail);
    if (existingUser) {
      const match = await bcrypt.compare(password, existingUser.password_hash);
      if (!match) {
        return res.redirect('/members?error=Incorrect+password');
      }
      return req.login(existingUser, err => (err ? next(err) : finishAuth(req, res)));
    }

    const userId = uuidv4();
    let referralUsed = null;

    if (trimmedReferral) {
      try {
        referralUsed = trimmedReferral;
        await Referral.useCode({ userId, code: referralUsed });
        await Referral.decrementLimit(referralUsed);
      } catch (e) {
        console.warn('Non-blocking referral code issue:', e.message);
        // Continue without throwing, still register user
      }
    }


    // ── Generate Ethereum wallet ──
    let pubEthAddr, encPrivKey;
    try {
      const wallet = await generateWallet(password); // 🔥 Important: async
      pubEthAddr = wallet.address;
      encPrivKey = wallet.encryptedPrivateKey;
    } catch (err) {
      console.error('Wallet generation error:', err);
      return res.redirect('/members?error=Wallet+generation+failed');
    }

    // ── Create user ──
    const newUser = await User.create({
      id: userId,
      email: trimmedEmail,
      password, // plain password, will be hashed in model
      referralCode: referralUsed,
      pubEthAddr,
      encPrivKey,
    });

    req.login(newUser, err => (err ? next(err) : finishAuth(req, res)));
  } catch (err) {
    console.error('Registration error:', err);
    return res.redirect('/members?error=Registration+failed');
  }
});

// ─────────── LOGIN ───────────
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err || !user) {
      return res.redirect('/members?error=Invalid+credentials');
    }
    req.login(user, err2 => (err2 ? next(err2) : finishAuth(req, res)));
  })(req, res, next);
});

// ─────────── LOGOUT ───────────
router.get('/logout', (req, res, next) => {
  req.logout(err => (err ? next(err) : res.redirect('/')));
});

module.exports = router;
