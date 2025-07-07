// routes/core.js  ───────────────────────────────────────────────
// Public catalogue  +  Peer-Exchange JSON API
// --------------------------------------------------------------
require('dotenv').config();

const express      = require('express');
const db           = require('../utils/db');
const { requireJwt } = require('./auth');     // exported by routes/auth.js

const router = express.Router();

/*────────────────────────────── helpers ──────────────────────────────*/

// very light sanity-check: "host-or-ip:port"
function normaliseAddr(a) {
  if (typeof a !== 'string') return null;
  const s = a.trim();
  return /^[\w.\-]+:\d+$/.test(s) ? s : null;
}

/*─────────────────  Docker image catalogue  ─────────────────*/

// GET /api/core/images
router.get('/images', async (_req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT name, description, hub_url
         FROM nextmetal.docker_images
     ORDER BY name`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/core/images/:name
router.get('/images/:name', async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT *
         FROM nextmetal.docker_images
        WHERE name = $1`,
      [req.params.name]
    );
    rows.length
      ? res.json(rows[0])
      : res.status(404).json({ error: 'not-found' });
  } catch (err) { next(err); }
});

/*─────────────────  Peer-Exchange (PeX)  ─────────────────*/

// GET /api/core/pex   → up to 50 random peer addresses
router.get('/pex', requireJwt, async (_req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT address
         FROM nextmetal.peers
     ORDER BY random()
        LIMIT 50`
    );
    res.json(rows.map(r => r.address));
  } catch (err) { next(err); }
});

// POST /api/core/pex  body: { "addresses": ["1.2.3.4:30303", …] }
router.post('/pex', requireJwt, async (req, res, next) => {
  try {
    const raw   = Array.isArray(req.body.addresses) ? req.body.addresses : [];
    const clean = raw.map(normaliseAddr).filter(Boolean);

    if (!clean.length)
      return res.status(400).json({ error: 'empty-or-invalid-list' });

    await db.query(
      `INSERT INTO nextmetal.peers (address)
            SELECT unnest($1::text[])
       ON CONFLICT (address)
             DO UPDATE SET last_seen = NOW()`,
      [clean]
    );

    res.json({ stored: clean.length });
  } catch (err) { next(err); }
});

module.exports = router;
