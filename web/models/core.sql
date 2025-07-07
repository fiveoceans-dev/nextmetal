/* one-time: install helper funcs into the public schema */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA nextmetal;

BEGIN;

CREATE SCHEMA IF NOT EXISTS nextmetal;

/* docker catalogue */
CREATE TABLE IF NOT EXISTS nextmetal.docker_images (
  id          uuid PRIMARY KEY DEFAULT nextmetal.uuid_generate_v4(),
  name        text UNIQUE NOT NULL,
  description text,
  hub_url     text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

/* PeX peers */
CREATE TABLE IF NOT EXISTS nextmetal.peers (
  id         uuid PRIMARY KEY DEFAULT nextmetal.uuid_generate_v4(),
  address    text UNIQUE NOT NULL,
  added_at   timestamptz DEFAULT now(),
  last_seen  timestamptz DEFAULT now()
);

INSERT INTO nextmetal.docker_images (name, description, hub_url) VALUES
  ('Storage',   'Decentralized file storage',   'https://hub.docker.com/v2/repositories/niip42/nextmetal-storage'),
  ('Database',  'Versatile database',           'https://hub.docker.com/v2/repositories/niip42/nextmetal-database'),
  ('Functions', 'Cloud functions',              'https://hub.docker.com/v2/repositories/niip42/nextmetal-functions'),
  ('Hosting',   'Unstoppable web hosting',      'https://hub.docker.com/v2/repositories/niip42/nextmetal-hosting'),
  ('Agents',    'Autonomous agents',            'https://hub.docker.com/v2/repositories/niip42/nextmetal-agents'),
  ('dApps',     'Immortal dApps',               'https://hub.docker.com/v2/repositories/niip42/nextmetal-dapps')
ON CONFLICT (name) DO NOTHING;

COMMIT;
