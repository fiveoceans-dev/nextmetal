
-- Create the NextMetal MVP Schema
CREATE SCHEMA IF NOT EXISTS nextmetal;
SET search_path TO nextmetal, public;

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- Users table
CREATE TABLE nextmetal.users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         CITEXT UNIQUE NOT NULL,
  password_hash TEXT   NOT NULL,
  nickname      TEXT UNIQUE,
  referred_by   TEXT,
  is_verified   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Update trigger for users
CREATE OR REPLACE FUNCTION nextmetal.touch_users_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END $$;

CREATE TRIGGER trg_users_touch
BEFORE UPDATE ON nextmetal.users
FOR EACH ROW EXECUTE FUNCTION nextmetal.touch_users_updated_at();

-- Referral codes table
CREATE TABLE nextmetal.referral_codes (
  id         UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   UUID  REFERENCES nextmetal.users(id) ON DELETE SET NULL,
  code       TEXT  UNIQUE NOT NULL,
  uses_left  INT   NOT NULL DEFAULT 100 CHECK (uses_left >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ix_referral_owner ON nextmetal.referral_codes(owner_id);

-- Referral usages table
CREATE TABLE nextmetal.referral_usages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referred_id      UUID NOT NULL REFERENCES nextmetal.users(id) ON DELETE CASCADE,
  referral_code_id UUID NOT NULL REFERENCES nextmetal.referral_codes(id) ON DELETE CASCADE,
  used_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ix_usage_referred  ON nextmetal.referral_usages(referred_id);
CREATE INDEX ix_usage_codeid    ON nextmetal.referral_usages(referral_code_id);

-- Decrement referral uses function
CREATE OR REPLACE FUNCTION nextmetal.dec_referral_uses()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE nextmetal.referral_codes
  SET    uses_left = uses_left - 1
  WHERE  id = NEW.referral_code_id;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_referral_use
AFTER INSERT ON nextmetal.referral_usages
FOR EACH ROW EXECUTE FUNCTION nextmetal.dec_referral_uses();

-- Email verifications
CREATE TABLE nextmetal.email_verifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES nextmetal.users(id) ON DELETE CASCADE,
  verification_code TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ix_emailver_user ON nextmetal.email_verifications(user_id);
CREATE INDEX ix_emailver_exp  ON nextmetal.email_verifications(expires_at);

-- Password resets
CREATE TABLE nextmetal.password_resets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES nextmetal.users(id) ON DELETE CASCADE,
  reset_token TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ix_pwdreset_user ON nextmetal.password_resets(user_id);
CREATE INDEX ix_pwdreset_exp  ON nextmetal.password_resets(expires_at);

-- User wallets
CREATE TABLE nextmetal.user_wallets (
  user_id      UUID  PRIMARY KEY REFERENCES nextmetal.users(id) ON DELETE CASCADE,
  pub_eth_addr BYTEA NOT NULL CHECK (octet_length(pub_eth_addr)=20),
  enc_priv_key BYTEA NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Points system
CREATE TYPE nextmetal.point_type AS ENUM ('referral','quest','easter_egg','bonus','mining');

CREATE TABLE nextmetal.points_core (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES nextmetal.users(id) ON DELETE CASCADE,
  type       nextmetal.point_type NOT NULL,
  delta      INT  NOT NULL,
  meta       JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ix_points_user_created
          ON nextmetal.points_core (user_id, created_at DESC)
          INCLUDE (delta, type);

CREATE INDEX ix_points_user_delta
          ON nextmetal.points_core (user_id)
          INCLUDE (delta);

-- User quests
CREATE TABLE nextmetal.user_quests (
  user_id      UUID PRIMARY KEY REFERENCES nextmetal.users(id) ON DELETE CASCADE,
  quest1_done  BOOLEAN DEFAULT FALSE,
  quest2_done  BOOLEAN DEFAULT FALSE,
  quest3_done  BOOLEAN DEFAULT FALSE,
  quest4_done  BOOLEAN DEFAULT FALSE,
  quest5_done  BOOLEAN DEFAULT FALSE,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION nextmetal.touch_quests_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END $$;

CREATE TRIGGER trg_quests_touch
BEFORE UPDATE ON nextmetal.user_quests
FOR EACH ROW EXECUTE FUNCTION nextmetal.touch_quests_updated_at();

-- User registration handler
CREATE OR REPLACE FUNCTION nextmetal.handle_user_registration()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  rc_id UUID;
BEGIN
  IF NEW.referred_by IS NOT NULL AND length(trim(NEW.referred_by)) > 0 THEN
    SELECT id INTO rc_id FROM nextmetal.referral_codes WHERE code = NEW.referred_by;
    IF rc_id IS NOT NULL THEN
      INSERT INTO nextmetal.referral_usages (referred_id, referral_code_id)
      VALUES (NEW.id, rc_id);
    END IF;
  END IF;

  INSERT INTO nextmetal.user_quests(user_id) VALUES (NEW.id);
  RETURN NEW;
END $$;

CREATE TRIGGER trg_user_registration
AFTER INSERT ON nextmetal.users
FOR EACH ROW EXECUTE FUNCTION nextmetal.handle_user_registration();

-- API sessions for external authentication
CREATE TABLE nextmetal.api_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES nextmetal.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ix_api_sessions_token ON nextmetal.api_sessions(session_token);
CREATE INDEX ix_api_sessions_user ON nextmetal.api_sessions(user_id);
CREATE INDEX ix_api_sessions_exp ON nextmetal.api_sessions(expires_at);

-- Magic links for native app authentication
CREATE TABLE nextmetal.magic_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES nextmetal.users(id) ON DELETE CASCADE,
  link_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ix_magic_links_token ON nextmetal.magic_links(link_token);
CREATE INDEX ix_magic_links_user ON nextmetal.magic_links(user_id);
CREATE INDEX ix_magic_links_exp ON nextmetal.magic_links(expires_at);

-- Seed default referral code
INSERT INTO nextmetal.referral_codes(code)
VALUES ('METAL-2025')
ON CONFLICT (code) DO NOTHING;
