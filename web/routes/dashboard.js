// routes/dashboard.js

const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/isAuthenticated');
const db = require('../utils/db'); // assumes pg pool is exported from here

// ─────────────────────────────────────────────
// Loaders per section
// ─────────────────────────────────────────────
const loaders = {
  dashboard: async (user) => {
    const balanceRes = await db.query(
      'SELECT COALESCE(SUM(delta), 0)::INT AS balance FROM point_ledger WHERE user_id = $1',
      [user.id]
    );
    const ledgerRes = await db.query(
      'SELECT type, delta, created_at FROM point_ledger WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [user.id]
    );
    const referralRes = await db.query(
      `SELECT r.code, COUNT(ru.id) AS used_count
   FROM referral_codes r
   LEFT JOIN referral_usages ru ON ru.referral_code = r.code
   WHERE r.owner_id = $1
   GROUP BY r.code`,
      [user.id]
    );


    return {
      balance: balanceRes.rows[0].balance,
      ledger: ledgerRes.rows,
      referrals: referralRes.rows,
    };
  },
  storage: async (user) => ({
    files: [], // Implement file listing
  }),
  hosting: async (user) => ({
    projects: [], // Implement project list
  }),
  database: async (user) => ({
    projects: [], // Implement project list
  }),
  models: async (user) => ({
    projects: [], // Implement project list
  }),
  agents: async (user) => ({
    projects: [], // Implement project list
  }),
  functions: async (user) => ({
    projects: [], // Implement project list
  }),  
};
  

// ─────────────────────────────────────────────
// Dashboard handler
// ─────────────────────────────────────────────
async function renderDashboardPage(req, res) {
  const section = req.params.section || 'dashboard';
  const loader = loaders[section];

  if (!loader) return res.status(404).send('Section not found');

  const data = await loader(req.user);
  const ctx = {
    title: `Next Metal – ${section[0].toUpperCase() + section.slice(1)}`,
    description: `Your ${section} overview`,
    user: req.user,
    mainwindow: `dashboard/${section}`,
    sidebar: `dashboard/${section}_menu`,
    ...data,
  };

  const pjax = req.get('X-PJAX');
  if (pjax === 'mainwindow') return res.render(ctx.mainwindow, ctx);
  if (pjax === 'sidebar') return res.render(ctx.sidebar, ctx);

  return res.render('dashboard', ctx);
}

router.use(isAuthenticated);

router.get('/', async (req, res) => {
  req.params.section = 'dashboard';
  return renderDashboardPage(req, res);
});

router.get('/:section', renderDashboardPage);

module.exports = router;
