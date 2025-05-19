// routes/pages.js
const express         = require('express');
const router          = express.Router();
const isAuthenticated = require('../middlewares/isAuthenticated');

/**
 * renderPublic: simple full-page render of views/pages/<view>.ejs
 */
function renderPublic(viewName, opts = {}) {
  return (req, res) => {
    res.render(`pages/${viewName}`, {
      title:       opts.title || `Next Metal – ${viewName}`,
      description: opts.desc  || '',
      error:       req.query.error || null,
      user:        req.user,
      ...opts.ctx
    });
  };
}

function renderDashboard(viewName, opts = {}) {
  return (req, res) => {
    const ctx = {
      title:       opts.title || `Next Metal – ${viewName[0].toUpperCase()+viewName.slice(1)}`,
      description: opts.desc  || '',
      error:       req.query.error || null,
      user:        req.user,
      mainwindow:     `dashboard/${viewName}`,
      sidebar:     `dashboard/${viewName}_menu`,
      ...opts.ctx
    };

    const pjax = req.get('X-PJAX');
    if (pjax === 'mainwindow') {
      return res.render(ctx.mainwindow, ctx);
    }
    if (pjax === 'sidebar') {
      return res.render(ctx.sidebar, ctx);
    }

    return res.render('dashboard', ctx);
  };
}


/* ───────────── PUBLIC ───────────── */
router.get('/vision',         renderPublic('vision',        { desc:'Vision & updates' }));
router.get('/members',        renderPublic('members',       { desc:'Register / Login' }));
router.get('/quick-start',    renderPublic('quick-start',   { desc:'Get started in 3 steps' }));
router.get('/careers',        renderPublic('careers',       { desc:'Join our team' }));
router.get('/press',          renderPublic('press',         { desc:'Media kit' }));
router.get('/download-page',  renderPublic('download-page', { desc:'Download client' }));

/* ───────────── DASHBOARD UNDER /account ───────────── */
router.get('/dashboard',               isAuthenticated, renderDashboard('dashboard',   { title:'Next Metal - Dashboard', desc:'Welcome to your dashboard' }));
router.get('/dashboard/storage',       isAuthenticated, renderDashboard('storage',   { desc:'Your Storage' }));
router.get('/dashboard/hosting',       isAuthenticated, renderDashboard('hosting',   { desc:'Your Hosting' }));
router.get('/dashboard/database',      isAuthenticated, renderDashboard('database',  { desc:'Your Database' }));
router.get('/dashboard/models',        isAuthenticated, renderDashboard('models',    { desc:'Your Models' }));
router.get('/dashboard/agents',        isAuthenticated, renderDashboard('agents',    { desc:'Your Agents' }));
router.get('/dashboard/functions',     isAuthenticated, renderDashboard('functions', { desc:'Your Functions' }));

module.exports = router;
