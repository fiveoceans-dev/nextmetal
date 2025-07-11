// middleware/jwt.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const cookieName = 'nmjwt';
const JWT_SECRET = process.env.JWT_SECRET;

/*──────────────────────────── Sign JWT ─────────────────────────────*/
const signToken = u =>
  jwt.sign({ uid: u.id }, JWT_SECRET, { expiresIn: '7d' });

/*────────────────────── Set JWT as HTTP-only cookie ─────────────────────*/
const setJwtCookie = (res, token) =>
  res.cookie(cookieName, token, {
    httpOnly : true,
    sameSite : 'lax',
    secure   : process.env.NODE_ENV === 'production',
    maxAge   : 7 * 24 * 60 * 60 * 1000  // 7 days
  });

/*──────────────────── API Middleware (Bearer token) ─────────────────────*/
const requireJwt = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'missing-token' });
  }

  try {
    const { uid } = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(uid);
    if (!user) throw new Error('user-not-found');

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid-token' });
  }
};

/*────────────────── Web Middleware (Cookie-based) ──────────────────*/
const requireJwtPage = async (req, res, next) => {
  const token = req.cookies[cookieName];
  if (!token) return res.redirect('/members?error=login-required');

  try {
    const { uid } = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(uid);
    res.locals.user = req.user;
    next();
  } catch {
    res.clearCookie(cookieName);
    return res.redirect('/members?error=session-expired');
  }
};

/*───────────────────── Exports ─────────────────────*/
module.exports = {
  cookieName,
  signToken,
  setJwtCookie,
  requireJwt,
  requireJwtPage,
};
