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
        title: 'Next Metal - Register/Login', 
        description: 'Create your account for Next Metal services',
        error
    });
});


// Route for the members page (login/signup)
router.get('/members', (req, res) => {
    const error = req.query.error || null;
    res.render('pages/members', { 
        title: 'Next Metal - Register/Login', 
        description: 'Create your account for Next Metal services',
        error
    });
});

// Route for the account page, accessible only if authenticated
router.get('/account', isAuthenticated, (req, res) => {
    const error = req.query.error || null;
    res.render('pages/account', { 
        title: 'Next Metal - Account', 
        description: 'Your Next Metal account page',
        error,
        user: req.user
    });
});

// Route for the download page
router.get('/download-page', (req, res) => {
    res.render('pages/download-page', { 
        title: 'Next Metal - Download', 
        description: 'Download Next Metal client'
    });
});


// Route for the home page
router.get('/home', (req, res) => {
    res.render('pages/home', { 
        title: 'Next Metal - Quick Start', 
        description: 'Check out the latest news and updates from Next Metal.'
    });
});

// Route for the quick-start page
router.get('/quick-start', (req, res) => {
    res.render('pages/quick-start', { 
        title: 'Next Metal - Quick Start', 
        description: 'Spin up your first Next Metal node in 3 simple steps.'
    });
});

// Route for the careers page
router.get('/careers', (req, res) => {
    res.render('pages/careers', { 
        title: 'Next Metal - Quick Start', 
        description: 'Join the Next Metal team. We are hiring!'
    });
});

// Route for the press page
router.get('/press', (req, res) => {
    res.render('pages/press', { 
        title: 'Next Metal - Press', 
        description: 'Press inquiries and media kit.'
    });
});
module.exports = router;