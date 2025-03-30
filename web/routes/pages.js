// /route/pages.js

const express = require('express');
const router = express.Router();

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/pages/members?error=Please login to access this page');
  }
};

// Route for the members page (login/signup)
router.get('/', (req, res) => {
    const error = req.query.error || null;
    res.render('index', { 
        title: 'Acorn SH - Register/Login', 
        description: 'Create your account for Acorn SH services',
        error
    });
});


// Route for the members page (login/signup)
router.get('/members', (req, res) => {
    const error = req.query.error || null;
    res.render('pages/members', { 
        title: 'Acorn SH - Register/Login', 
        description: 'Create your account for Acorn SH services',
        error
    });
});

// Route for the account page, accessible only if authenticated
router.get('/account', isAuthenticated, (req, res) => {
    const error = req.query.error || null;
    res.render('pages/account', { 
        title: 'Acorn SH - Account', 
        description: 'Your account page',
        error,
        user: req.user
    });
});

// Route for the quick start page
router.get('/quick-start', (req, res) => {
    res.render('pages/quick-start', { 
        title: 'Acorn SH - Quick Start', 
        description: 'Install in 3 simple steps'
    });
});

module.exports = router;