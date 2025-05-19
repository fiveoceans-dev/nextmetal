// routes/auth.js

const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user');

const router = express.Router();

// Register route
function finishAuth (req, res) {
  const redirectTo = req.session.returnTo || '/dashboard';
  delete req.session.returnTo;
  res.redirect(redirectTo);
}

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let user = await User.findByEmail(email).catch(() => null);

    if (user) {
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.redirect('/members?error=Incorrect+password');
    } else {
      const hash = await bcrypt.hash(password, 12);
      user = await User.create({
        id: uuidv4(),
        email,
        password_hash: hash
      });
    }

    /* 2. start a session */
    req.login(user, err => err ? next(err) : finishAuth(req, res));

  } catch (e) {
    console.error(e);
    res.redirect('/members?error=Registration+failed');
  }
});


// Login 
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err || !user) {
      return res.redirect('/members?error=Invalid+credentials');
    }
    req.login(user, err2 => err2 ? next(err2) : finishAuth(req, res));
  })(req, res, next);
});


// Logout
router.get('/logout', (req, res, next) => {
  req.logout(err => (err ? next(err) : res.redirect('/')));
});

module.exports = router;