/*─────────────────────────────────────────────────────────────
  NextMetal – “catalogue + PeX” add-on
  (run after the main user / wallet schema is in place)
─────────────────────────────────────────────────────────────*/

/* 0.  EXTENSIONS ───────────────────────────────────────────*/
-- Neon allows uuid-ossp, but it must be created in *public* (outside tx)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

/* 1.  SCHEMA & search_path ────────────────────────────────*/
CREATE SCHEMA IF NOT EXISTS nextmetal;
SET search_path TO nextmetal, public;

BEGIN;

/* 2.  DOCKER IMAGES  ──────────────────────────────────────*/
CREATE TABLE IF NOT EXISTS docker_images (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES nextmetal.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  hub_url     text NOT NULL,
  created_at  timestamptz DEFAULT NOW(),
  UNIQUE (user_id, name) -- plain unique constraint
);

-- Add case-insensitive uniqueness separately
CREATE UNIQUE INDEX IF NOT EXISTS ix_dockerimg_user_lowername
  ON docker_images (user_id, lower(name));

CREATE INDEX IF NOT EXISTS ix_dockerimg_owner
  ON docker_images (user_id);

/* 3.  PeX PEERS  ───────────────────────────────────────────*/
CREATE TABLE IF NOT EXISTS peers (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    uuid NOT NULL REFERENCES nextmetal.users(id) ON DELETE CASCADE,
  address    text UNIQUE NOT NULL,                     -- host:port
  status     smallint NOT NULL DEFAULT 0 CHECK (status IN (0,1)),
  added_at   timestamptz DEFAULT NOW(),
  last_seen  timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_peers_status
  ON peers (status) WHERE status = 1;                  -- quick “approved” list

/* 4.  SEED  (owner = first admin)  ─────────────────────────
   Replace the e-mail below with *your* bootstrap admin.      */
DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM nextmetal.users
  WHERE email = 'info@nextmetal.org'
  LIMIT 1;

  IF admin_id IS NULL THEN
    RAISE NOTICE 'admin user not found – seed skipped';
  ELSE
    INSERT INTO docker_images (user_id, name, description, hub_url) VALUES
      (admin_id, 'Storage',   'Decentralised file storage',
       'https://hub.docker.com/v2/repositories/niip42/nextmetal-storage'),
      (admin_id, 'Database',  'Versatile database',
       'https://hub.docker.com/v2/repositories/niip42/nextmetal-database'),
      (admin_id, 'Functions', 'Cloud functions',
       'https://hub.docker.com/v2/repositories/niip42/nextmetal-functions'),
      (admin_id, 'Hosting',   'Unstoppable web hosting',
       'https://hub.docker.com/v2/repositories/niip42/nextmetal-hosting'),
      (admin_id, 'Agents',    'Autonomous agents',
       'https://hub.docker.com/v2/repositories/niip42/nextmetal-agents'),
      (admin_id, 'dApps',     'Immortal dApps',
       'https://hub.docker.com/v2/repositories/niip42/nextmetal-dapps')
    ON CONFLICT (user_id, lower(name)) DO NOTHING;
  END IF;
END $$;

COMMIT;
