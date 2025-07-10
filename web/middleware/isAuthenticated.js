// middleware/isAuthenticated.js

module.exports = function isAuthenticated (req, res, next) {
    /* passport adds the fn only after it’s initialised */
    const loggedIn = req.isAuthenticated && req.isAuthenticated();
  
    if (loggedIn) return next();
  
    /* remember the URL so we can return after login */
    if (req.method === 'GET') {
      req.session.returnTo = req.originalUrl;      // e.g. "/agents?id=7"
    }
    res.redirect('/members?error=Please+login+to+continue');
  };
  