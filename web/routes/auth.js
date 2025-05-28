const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user');

const router = express.Router();

function finishAuth(req, res) {
  const redirectTo = req.session.returnTo || '/dashboard';
  delete req.session.returnTo;
  res.redirect(redirectTo);
}

// Register route
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, referralCode } = req.body;

    let user = await User.findByEmail(email).catch(() => null);

    if (user) {
      // User exists: check password
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.redirect('/members?error=Incorrect+password');
      }
    } else {
      // User doesn't exist: create new
      const newUserId = uuidv4();
      user = await User.create({
        id: newUserId,
        email,
        password,
        referralCode: referralCode?.trim() || null
      });
    }

    // Start session
    req.login(user, err => (err ? next(err) : finishAuth(req, res)));

  } catch (err) {
    console.error('Registration error:', err);
    res.redirect('/members?error=Registration+failed');
  }
});

// Login route
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err || !user) {
      return res.redirect('/members?error=Invalid+credentials');
    }
    req.login(user, err2 => (err2 ? next(err2) : finishAuth(req, res)));
  })(req, res, next);
});

// Logout route
router.get('/logout', (req, res, next) => {
  req.logout(err => (err ? next(err) : res.redirect('/')));
});

module.exports = router;
