// // tiny helper used by every private JSON route
// require('dotenv').config();
// const jwt = require('jsonwebtoken');

// module.exports = function requireJwt(req, res, next) {
//   const hdr  = req.get('authorization') || '';
//   const tok  = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
//   if (!tok) return res.status(401).json({ error: 'missing-token' });

//   try {
//     req.jwt = jwt.verify(tok, process.env.JWT_SECRET);
//     return next();
//   } catch {
//     return res.status(401).json({ error: 'invalid-token' });
//   }
// };