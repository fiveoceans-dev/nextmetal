// routes/core.js  ───────────────────────────────────────────────
// Public catalogue  +  Peer-Exchange JSON API
// --------------------------------------------------------------
require('dotenv').config();

const express = require('express');
const db = require('../utils/db');
const { requireJwt } = require('./auth'); // exported by routes/auth.js

const router = express.Router();

/*────────────────────────────── helpers ──────────────────────────────*/
// Very light sanity-check: "host-or-ip:port"
function normaliseAddr(a) {
  if (typeof a !== 'string') return null;
  const s = a.trim();
  return /^[\w.\-]+:\d+$/.test(s) ? s : null;
}

/*────────────────────  Docker image catalogue  ────────────────────*/
// GET /api/core/images → public catalogue
router.get('/images', async (_req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT name, description, hub_url, status
         FROM nextmetal.docker_images
        WHERE status = 1
     ORDER BY name`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/core/images/:name → full metadata (single image)
router.get('/images/:name', async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT *
         FROM nextmetal.docker_images
        WHERE lower(name) = lower($1)
        LIMIT 1`,
      [req.params.name]
    );
    rows.length
      ? res.json(rows[0])
      : res.status(404).json({ error: 'not-found' });
  } catch (err) {
    next(err);
  }
});

// POST /api/core/images → submit new image
router.post('/images', requireJwt, async (req, res, next) => {
  const { name, description, hub_url } = req.body;

  if (!name || !hub_url)
    return res.status(400).json({ error: 'missing-fields' });

  try {
    await db.query(
      `INSERT INTO nextmetal.docker_images (user_id, name, description, hub_url, status)
       VALUES ($1::uuid, $2, $3, $4, $5)
       ON CONFLICT (user_id, lower(name))
       DO UPDATE SET description = EXCLUDED.description,
                     hub_url     = EXCLUDED.hub_url`,
      [req.user.id, name, description ?? '', hub_url, 0]
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/*────────────────────  Peer-Exchange (Peers)  ─────────────────────*/
// GET /api/core/peers → up to 50 approved peers
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

// POST /api/core/peers → submit new peer addresses
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
