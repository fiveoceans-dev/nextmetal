// routes/pages.js

const express = require('express');
const router = express.Router();

/**
 * Render a public EJS page under views/pages/
 */
function renderPublic(viewName, opts = {}) {
  return (req, res) => {
    res.render(`pages/${viewName}`, {
      title: opts.title || `Next Metal – ${viewName}`,
      description: opts.desc || '',
      error: req.query.error || null,
      user: req.user,
      ...opts.ctx,
    });
  };
}

// ───────────── PUBLIC ROUTES ─────────────
router.get('/vision',         renderPublic('vision',        { desc: 'Vision & updates' }));
router.get('/members',        renderPublic('members',       { desc: 'Register / Login' }));
router.get('/quick-start',    renderPublic('quick-start',   { desc: 'Get started in 3 steps' }));
router.get('/careers',        renderPublic('careers',       { desc: 'Join our team' }));
router.get('/press',          renderPublic('press',         { desc: 'Media kit' }));
router.get('/download-page',  renderPublic('download-page', { desc: 'Download client' }));

module.exports = router;
