/*─────────────────────────────────────────────────────────────
  NextMetal – “catalogue + PeX” add-on
  (run after the main user / wallet schema is in place)
─────────────────────────────────────────────────────────────*/

-- 0. EXTENSIONS ──────────────────────────────────────────────
-- Neon requires uuid-ossp to be created in *public*
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SCHEMA & search_path ────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS nextmetal;
SET search_path TO nextmetal, public;

BEGIN;

-- 8. DOCKER IMAGES
CREATE TABLE IF NOT EXISTS nextmetal.docker_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES nextmetal.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  hub_url     TEXT NOT NULL,
  status      SMALLINT NOT NULL DEFAULT 0 CHECK (status IN (0, 1)),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, name)
);

CREATE UNIQUE INDEX IF NOT EXISTS ix_dockerimg_user_lowername
  ON nextmetal.docker_images (user_id, lower(name));

CREATE INDEX IF NOT EXISTS ix_dockerimg_owner
  ON nextmetal.docker_images (user_id);

-- 9. PEERS
CREATE TABLE IF NOT EXISTS nextmetal.peers (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES nextmetal.users(id) ON DELETE CASCADE,
  address    TEXT UNIQUE NOT NULL,
  status     SMALLINT NOT NULL DEFAULT 0 CHECK (status IN (0, 1)),
  added_at   TIMESTAMPTZ DEFAULT NOW(),
  last_seen  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_peers_status
  ON nextmetal.peers (status) WHERE status = 1;

-- 10. SEED REFERRAL CODE
DO $$
DECLARE
  adm_id UUID;
BEGIN
  SELECT id INTO adm_id FROM nextmetal.users WHERE email = 'sys@nextmetal.org' LIMIT 1;

  IF adm_id IS NOT NULL THEN
    INSERT INTO nextmetal.referral_codes(code, owner_id)
    VALUES ('METAL-2025', adm_id)
    ON CONFLICT (code) DO NOTHING;
  ELSE
    INSERT INTO nextmetal.referral_codes(code)
    VALUES ('METAL-2025')
    ON CONFLICT (code) DO NOTHING;
  END IF;
END $$;

-- 11. SEED DOCKER IMAGES FOR ADMIN
DO $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id FROM nextmetal.users
  WHERE email = 'sys@nextmetal.org'
  LIMIT 1;

  IF admin_id IS NULL THEN
    RAISE NOTICE 'admin user not found – seed skipped';
  ELSE
    INSERT INTO nextmetal.docker_images (user_id, name, description, hub_url) VALUES
      (admin_id, 'Storage',   'Decentralised file storage',
       'https://hub.docker.com/v2/repositories/nextmetal/storage'),
      (admin_id, 'Database',  'Versatile database',
       'https://hub.docker.com/v2/repositories/nextmetal/database'),
      (admin_id, 'Functions', 'Cloud functions',
       'https://hub.docker.com/v2/repositories/nextmetal/functions'),
      (admin_id, 'Hosting',   'Unstoppable web hosting',
       'https://hub.docker.com/v2/repositories/nextmetal/hosting'),
      (admin_id, 'Agents',    'Autonomous agents',
       'https://hub.docker.com/v2/repositories/nextmetal/agents'),
      (admin_id, 'dApps',     'Immortal dApps',
       'https://hub.docker.com/v2/repositories/nextmetal/dapps')
    ON CONFLICT (user_id, lower(name)) DO NOTHING;
  END IF;
END $$;

COMMIT;
