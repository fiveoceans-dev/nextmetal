// routes/pages.js
const express          = require('express');
const router           = express.Router();
const isAuthenticated  = require('../middlewares/isAuthenticated');

/* ───────────── helper: render pages/<name>.ejs ────────────── */
function view (name, extra = {}) {
  return (req, res) =>
    res.render(`pages/${name}`, {
      title: `Next Metal - ${name.replace(/(^|\s)\S/g, s => s.toUpperCase())}`,
      description: extra.desc || '',
      error: req.query.error || null,
      user:   req.user,
      ...extra.ctx
    });
}

/* ───────────── PUBLIC ROUTES ───────────── */

/*  Home page (landed on site root)  */
router.get('/', (req, res) =>
  res.render('index', {
    title: 'Next Metal',
    description: 'Create your account for Next Metal services',
    error: req.query.error || null
  })
);

/*  Register / login page  */
router.get('/members', view('members', {
  desc: 'Create your account for Next Metal services'
}));

/*  Marketing & docs  */
router.get('/download-page', view('download-page', { desc: 'Download Next Metal client' }));
router.get('/vision',         view('vision',        { desc: 'Latest vision & updates'  }));
router.get('/quick-start',    view('quick-start',   { desc: 'Spin up a node in 3 steps' }));
router.get('/careers',        view('careers',       { desc: 'Join the Next Metal team'  }));
router.get('/press',          view('press',         { desc: 'Press inquiries & media kit' }));

/* ───────────── PRIVATE (login‑required) ROUTES ───────────── */

router.get('/account',  isAuthenticated, view('account',  { desc: 'Your Next Metal account'  }));
router.get('/hosting',  isAuthenticated, view('hosting',  { desc: 'Your Next Metal hosting'  }));
router.get('/agents',   isAuthenticated, view('agents',   { desc: 'Your Next Metal agents'   }));
router.get('/storage',  isAuthenticated, view('storage',  { desc: 'Your Next Metal storage'  }));

module.exports = router;
