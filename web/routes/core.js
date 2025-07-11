// routes/core.js  ───────────────────────────────────────────────
// Public Docker catalogue + Peer Exchange + Basic Profile API
// --------------------------------------------------------------
require('dotenv').config();

const express = require('express');
const db = require('../utils/db');
const { requireJwt, requireJwtPage } = require('../middleware/jwt');
const router = express.Router();

/*─────────────────────── Utilities ─────────────────────────────*/
// Very light format check for peer addresses (host:port)
function normaliseAddr(a) {
  if (typeof a !== 'string') return null;
  const s = a.trim();
  return /^[\w.\-]+:\d+$/.test(s) ? s : null;
}

/*─────────────────────── Profile API ───────────────────────────*/
// GET /api/core/profile → Basic user info (nickname, email, points)

router.get('/profile', async (req, res, next) => {
  res.type('application/json'); // force JSON content-type
  console.log("Authorization Header:", req.headers.authorization);

  try {
    const { rows } = await db.query(
      `SELECT nickname, total_points
         FROM nextmetal.users
        WHERE id = $1`,
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'not-found' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});


/*──────────────── Docker Image Catalogue API ──────────────────*/
// GET /api/core/images → Public (or all) Docker image catalogue
router.get('/images', async (req, res, next) => {
  try {
    const showAll = req.query.all === '1';

    const { rows } = await db.query(
      `SELECT name, description, hub_url, status
         FROM nextmetal.docker_images
        WHERE ($1::bool IS TRUE)
           OR status = 1
        ORDER BY name`,
      [showAll]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/core/images/:name → Full metadata for one image
router.get('/images/:name', async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT *
         FROM nextmetal.docker_images
        WHERE lower(name) = lower($1)
        LIMIT 1`,
      [req.params.name]
    );

    if (!rows.length)
      return res.status(404).json({ error: 'not-found' });

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/core/images → Submit or update an image (auth required)
router.post('/images', requireJwt, async (req, res, next) => {
  const { name, description, hub_url, status = 0 } = req.body;

  if (!name || !hub_url)
    return res.status(400).json({ error: 'missing-fields' });

  try {
    await db.query(
      `INSERT INTO nextmetal.docker_images (user_id, name, description, hub_url, status)
       VALUES ($1::uuid, $2, $3, $4, $5)
       ON CONFLICT (user_id, lower(name))
       DO UPDATE SET description = EXCLUDED.description,
                     hub_url     = EXCLUDED.hub_url`,
      [req.user.id, name, description ?? '', hub_url, status]
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/*───────────────────── Peer Exchange API ──────────────────────*/
// GET /api/core/peers → Up to 50 approved peers (auth required)
router.get('/peers', requireJwt, async (_req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT address
         FROM nextmetal.peers
        WHERE status = 1
     ORDER BY random()
        LIMIT 50`
    );

    res.json(rows.map(r => r.address));
  } catch (err) {
    next(err);
  }
});

// POST /api/core/peers → Submit new peer addresses (auth required)
router.post('/peers', requireJwt, async (req, res, next) => {
  try {
    const raw = Array.isArray(req.body.addresses) ? req.body.addresses : [];
    const clean = raw.map(normaliseAddr).filter(Boolean);

    if (!clean.length)
      return res.status(400).json({ error: 'empty-or-invalid-list' });

    await db.query(
      `INSERT INTO nextmetal.peers (address, user_id, status)
           SELECT unnest($1::text[]), $2::uuid, 0
      ON CONFLICT (address) DO UPDATE
           SET last_seen = NOW(),
               user_id   = EXCLUDED.user_id`,
      [clean, req.user.id]
    );

    res.json({ stored: clean.length });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
