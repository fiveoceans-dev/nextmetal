// routes/index.js

const express = require('express');
const router = express.Router();

// Render the main index page

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/beta', (req, res) => {
    res.render('beta');
});


module.exports = router;
