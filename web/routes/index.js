// routes/index.js

const express = require('express');
const router = express.Router();

// Render the main index page

router.get('/main', (req, res) => {
    res.render('index-main');
});

router.get('/beta', (req, res) => {
    res.render('beta');
});


module.exports = router;
