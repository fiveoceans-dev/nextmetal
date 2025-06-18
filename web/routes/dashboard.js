// routes/dashboard.js
const express = require('express');
const router  = express.Router();
const db      = require('../utils/db');          // ← your pg-pool wrapper
const guard   = require('../middlewares/isAuthenticated');

/*───────────────────────────────────────────────────────────
  Helpers
───────────────────────────────────────────────────────────*/
const TITLE   = 'Next Metal – ';

/** Sum of a user’s points (simple aggregate, no materialised view needed) */
async function getBalance(userId) {
  const { rows } = await db.query(
    `SELECT COALESCE(SUM(delta),0)::INT AS balance
       FROM nextmetal.points_core
      WHERE user_id = $1`,
    [userId],
  );
  return rows[0].balance;
}

/** Last N ledger rows */
async function getLedger(userId, limit = 20) {
  const { rows } = await db.query(
    `SELECT type, delta, created_at
       FROM nextmetal.points_core
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT  $2`,
    [userId, limit],
  );
  return rows;
}

/** All codes owned by user + usage count + remaining uses */
async function getReferrals(userId) {
  const { rows } = await db.query(
    `SELECT r.code,
            r.uses_left,
            COUNT(ru.id) AS used_count
       FROM nextmetal.referral_codes  r
  LEFT JOIN nextmetal.referral_usages ru
         ON ru.referral_code_id = r.id
      WHERE r.owner_id = $1
   GROUP BY r.id, r.code, r.uses_left
   ORDER BY r.created_at`,
    [userId],
  );
  return rows;
}

/*───────────────────────────────────────────────────────────
  Per-section data loaders
───────────────────────────────────────────────────────────*/
const loaders = {
  async dashboard(user) {
    return {
      balance:   await getBalance(user.id),
      ledger:    await getLedger(user.id),
      referrals: await getReferrals(user.id),
    };
  },
  /* stub loaders for later features */
  storage:   async () => ({ files:    [] }),
  hosting:   async () => ({ projects: [] }),
  database:  async () => ({ projects: [] }),
  models:    async () => ({ projects: [] }),
  agents:    async () => ({ projects: [] }),
  functions: async () => ({ projects: [] }),
};

/*───────────────────────────────────────────────────────────
  Core renderer (PJAX-aware)
───────────────────────────────────────────────────────────*/
async function renderSection(req, res) {
  const section = req.params.section ?? 'dashboard';
  const load    = loaders[section];

  if (!load) return res.status(404).send('Section not found');

  try {
    const data = await load(req.user);

    const ctx = {
      user:        req.user,
      title:       TITLE + section.charAt(0).toUpperCase() + section.slice(1),
      description: `Your ${section} overview`,
      mainwindow:  `dashboard/${section}`,
      sidebar:     `dashboard/${section}_menu`,
      ...data,
    };

    const pjax = req.get('X-PJAX');
    if (pjax === 'mainwindow') return res.render(ctx.mainwindow, ctx);
    if (pjax === 'sidebar')    return res.render(ctx.sidebar,    ctx);

    return res.render('dashboard', ctx);
  } catch (err) {
    console.error(`[dashboard] ${section}:`, err);
    return res.status(500).send('Server error');
  }
}

/*───────────────────────────────────────────────────────────
  Routes
───────────────────────────────────────────────────────────*/
router.use(guard);

/* default → “dashboard” section */
router.get('/', (req, res) => {
  req.params.section = 'dashboard';
  return renderSection(req, res);
});

/* every other section */
router.get('/:section', renderSection);

module.exports = router;