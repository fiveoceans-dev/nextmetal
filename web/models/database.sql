-- NextMetal fresh schema – revised for consistency, multi-codes per user, multi-usages per code, empty referred_by allowed

BEGIN;

-- 0.  Schema & search_path
CREATE SCHEMA IF NOT EXISTS nextmetal;
SET search_path TO nextmetal, public;

-- 1.  Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- 2.  Users
-- users: no referral FK; referred_by can be empty string or NULL
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         CITEXT UNIQUE NOT NULL,
  password_hash TEXT   NOT NULL,
  nickname      TEXT   UNIQUE,
  referred_by   TEXT,  -- code the user entered, if any; no FK, can be NULL or ''
  is_verified   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- auto-touch updated_at
CREATE OR REPLACE FUNCTION touch_users_updated_at()
RETURNS trigger AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_touch
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION touch_users_updated_at();

-- 3.  Referral codes (multiple per user, codes have multiple usages)
CREATE TABLE referral_codes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code       TEXT UNIQUE NOT NULL,
  uses_left  INT  NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON referral_codes(owner_id);

-- 4.  Referral usages (multiple usages per code, multiple codes per user)
CREATE TABLE referral_usages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referred_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  used_at       TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON referral_usages(referred_id);
CREATE INDEX ON referral_usages(referral_code_id);

-- 5.  Email verification
CREATE TABLE email_verifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verification_code TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON email_verifications(user_id);
CREATE INDEX ON email_verifications(expires_at);

-- 6.  Password reset
CREATE TABLE password_resets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reset_token TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON password_resets(user_id);
CREATE INDEX ON password_resets(expires_at);

-- 7.  Wallets
CREATE TABLE user_wallets (
  user_id      UUID  PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  pub_eth_addr BYTEA NOT NULL CHECK (octet_length(pub_eth_addr)=20),
  enc_priv_key BYTEA NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- 8.  Points
CREATE TYPE point_type AS ENUM ('referral','quest','easter_egg','bonus','mining');

CREATE TABLE points_score (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       point_type NOT NULL,
  delta      INT NOT NULL,
  meta       JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON points_score(user_id);

CREATE OR REPLACE VIEW user_point_balance AS
SELECT user_id, COALESCE(SUM(delta),0)::INT AS balance
FROM points_score
GROUP BY user_id;

-- 9.  Quests tracker
CREATE TABLE user_quests (
  user_id      UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  quest1_done  BOOLEAN DEFAULT FALSE,
  quest2_done  BOOLEAN DEFAULT FALSE,
  quest3_done  BOOLEAN DEFAULT FALSE,
  quest4_done  BOOLEAN DEFAULT FALSE,
  quest5_done  BOOLEAN DEFAULT FALSE,
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION touch_quests_updated_at()
RETURNS trigger AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_quests_touch
BEFORE UPDATE ON user_quests
FOR EACH ROW EXECUTE FUNCTION touch_quests_updated_at();

-- 10. Mining fan-out
CREATE TABLE mining_batches (
  id           BIGSERIAL PRIMARY KEY,
  source_hash  BYTEA NOT NULL,
  total_points BIGINT NOT NULL CHECK (total_points>0),
  minted_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE mining_allocations (
  batch_id BIGINT NOT NULL REFERENCES mining_batches(id) ON DELETE CASCADE,
  user_id  UUID   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points   BIGINT NOT NULL CHECK (points>0),
  PRIMARY KEY(batch_id,user_id)
);

CREATE OR REPLACE FUNCTION add_to_points_score()
RETURNS trigger AS $$
BEGIN
  INSERT INTO points_score(user_id,type,delta,meta)
  VALUES (NEW.user_id,'mining',NEW.points,jsonb_build_object('batch_id',NEW.batch_id));
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ma_to_score
AFTER INSERT ON mining_allocations
FOR EACH ROW EXECUTE FUNCTION add_to_points_score();

-- 11. After-insert trigger on users for referral usages & quests
CREATE OR REPLACE FUNCTION handle_user_registration()
RETURNS trigger AS $$
DECLARE
  rc_id UUID;
BEGIN
  -- record referral usage if referred_by is present and matches a code
  IF NEW.referred_by IS NOT NULL AND length(trim(NEW.referred_by)) > 0 THEN
    SELECT id INTO rc_id FROM referral_codes WHERE code = NEW.referred_by;
    IF rc_id IS NOT NULL THEN
      INSERT INTO referral_usages (referred_id, referral_code_id)
      VALUES (NEW.id, rc_id);
    END IF;
  END IF;

  -- initialise empty quest row
  INSERT INTO user_quests(user_id) VALUES (NEW.id);

  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_registration
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION handle_user_registration();

-- 12. Seed generic referral code (code is unique)
INSERT INTO referral_codes(code, owner_id)
SELECT 'METAL-2025', id FROM users WHERE email = 'admin@nextmetal.io'
ON CONFLICT (code) DO NOTHING;

COMMIT;