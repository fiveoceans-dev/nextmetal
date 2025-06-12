const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/isAuthenticated');
const db = require('../utils/db'); // pg pool

// Section Loaders
const loaders = {
  dashboard: async (user) => {
    const { id: userId } = user;

    // Get current balance (from new schema: points_score table, or use user_point_balance view if available)
    const balanceRes = await db.query(
      `SELECT COALESCE(balance, 0) AS balance
       FROM nextmetal.user_point_balance
       WHERE user_id = $1`,
      [userId]
    );

    // Recent point transactions
    const ledgerRes = await db.query(
      `SELECT type, delta, created_at
       FROM nextmetal.points_score
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [userId]
    );

    // Referrals owned by this user + usage count (id PK, uses_left, usage count by referral_usages.referral_code_id)
    const referralRes = await db.query(
      `SELECT r.code, r.uses_left, COUNT(ru.id) AS used_count
       FROM nextmetal.referral_codes r
       LEFT JOIN nextmetal.referral_usages ru
         ON ru.referral_code_id = r.id
       WHERE r.owner_id = $1
       GROUP BY r.id, r.code, r.uses_left`,
      [userId]
    );

    return {
      balance: balanceRes.rows[0]?.balance || 0,
      ledger: ledgerRes.rows,
      referrals: referralRes.rows,
    };
  },

  storage: async () => ({ files: [] }),
  hosting: async () => ({ projects: [] }),
  database: async () => ({ projects: [] }),
  models: async () => ({ projects: [] }),
  agents: async () => ({ projects: [] }),
  functions: async () => ({ projects: [] }),
};

// Dashboard View Handler
async function renderDashboardPage(req, res) {
  const section = req.params.section || 'dashboard';
  const loader = loaders[section];

  if (!loader) return res.status(404).send('Section not found');

  try {
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
  } catch (err) {
    console.error(`Error rendering ${section} dashboard:`, err);
    return res.status(500).send('Server Error');
  }
}

// Routes
router.use(isAuthenticated);

router.get('/', (req, res) => {
  req.params.section = 'dashboard';
  return renderDashboardPage(req, res);
});

router.get('/:section', renderDashboardPage);

module.exports = router;