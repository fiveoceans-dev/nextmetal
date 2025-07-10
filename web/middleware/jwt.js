// middleware/jwt.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const cookieName = 'nmjwt';
const signToken  = u =>
  jwt.sign({ uid: u.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

/* issue cookie */
exports.setJwtCookie = (res, token) =>
  res.cookie(cookieName, token, {
    httpOnly : true,
    sameSite : 'lax',
    secure   : process.env.NODE_ENV === 'production',
    maxAge   : 7 * 24 * 60 * 60 * 1000          // 7d
  });

/* guard for pages & APIs */
exports.requireJwt = async (req, res, next) => {
  const tok = req.cookies[cookieName];
  if (!tok) return res.redirect('/members?error=login-required');   // html
  try {
    const { uid } = jwt.verify(tok, process.env.JWT_SECRET);
    req.user = await User.findById(uid);
    res.locals.user = req.user;
    next();
  } catch {
    res.clearCookie(cookieName);
    return res.redirect('/members?error=session-expired');
  }
};

exports.cookieName = cookieName;
exports.signToken  = signToken;
