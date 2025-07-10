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
// curl -X GET http://localhost:3000/api/core/images
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
// curl -X GET http://localhost:3000/api/core/images/Storage
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

// POST /api/core/images → allow user to submit new image
// body: { name, description, hub_url }
// curl -X POST http://localhost:3000/api/core/images \
//  -H "Content-Type: application/json" \
//  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
//  -d '{
//    "name": "MyApp",
//    "description": "High-performance container",
//    "hub_url": "https://hub.docker.com/r/myuser/myapp"
//  }'
router.post('/images', requireJwt, async (req, res, next) => {
  const { name, description, hub_url } = req.body;

  if (!name || !hub_url)
    return res.status(400).json({ error: 'missing-fields' });

  try {
    await db.query(
      `INSERT INTO nextmetal.docker_images (user_id, name, description, hub_url, status)
       VALUES ($1, $2, $3, $4, $5)
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

// GET /api/core/peers → return up to 50 *approved* peer addresses
// curl -X GET http://localhost:3000/api/core/peers \
//  -H "Authorization: Bearer YOUR_JWT_TOKEN"
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

// POST /api/core/peers → submit new peer addresses for review
// body: { addresses: ["1.2.3.4:30303", …] }
// curl -X POST http://localhost:3000/api/core/peers \
//  -H "Content-Type: application/json" \
//  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
//  -d '{
//    "addresses": ["192.168.0.8:5050", "10.0.0.1:9000"]
//  }'
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
