// middleware/jwt.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const JWT_SECRET = process.env.JWT_SECRET;
const cookieName = 'nmjwt';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

/*──────────────────────────── Sign JWT ─────────────────────────────*/
const signToken = user =>
  jwt.sign({ uid: user.id }, JWT_SECRET, { expiresIn: '7d' });

/*────────────────────── Set JWT as HTTP-only cookie ─────────────────────*/
const setJwtCookie = (res, token) => {
  res.cookie(cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/*──────────────────── API Middleware (Bearer token) ─────────────────────
  For macOS, CLI, or programmatic clients that send:
  Authorization: Bearer <token>
──────────────────────────────────────────────────────────────────────────*/
const requireJwt = async (req, res, next) => {
  console.log("Authorization Header:", req.headers.authorization); // <-- ADD THIS

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    console.warn("JWT MISSING – header was:", header); // <-- ADD THIS
    return res.status(401).json({ error: 'missing-token' });
  }

  try {
    const { uid } = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(uid);
    if (!user) throw new Error('user-not-found');

    req.user = user;
    next();
  } catch (err) {
    console.warn("JWT INVALID –", err.message);
    return res.status(401).json({ error: 'invalid-token' });
  }
};


/*────────────────── Web Middleware (Cookie-based) ──────────────────
  For traditional pages that store JWT in an HTTP-only cookie
─────────────────────────────────────────────────────────────────────*/
const requireJwtPage = async (req, res, next) => {
  const token = req.cookies[cookieName];
  if (!token) {
    return res.redirect('/members?error=login-required');
  }

  try {
    const { uid } = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(uid);
    if (!user) throw new Error('user-not-found');

    req.user = user;
    res.locals.user = user;
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
