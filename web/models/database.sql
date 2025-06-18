/* NextMetal MVP Schema (fixed order + trigger tweaks) */
BEGIN;


-- 0.  SCHEMA & search_path

CREATE SCHEMA IF NOT EXISTS nextmetal;
SET search_path TO nextmetal, public;


-- 1.  EXTENSIONS

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;


-- 2.  USERS

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         CITEXT UNIQUE NOT NULL,
  password_hash TEXT   NOT NULL,
  nickname      TEXT UNIQUE,
  referred_by   TEXT,
  is_verified   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION touch_users_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END $$;

CREATE TRIGGER trg_users_touch
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION touch_users_updated_at();


-- 3.  REFERRALS (codes + usages)
CREATE TABLE referral_codes (
  id         UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   UUID  REFERENCES users(id) ON DELETE SET NULL,
  code       TEXT  UNIQUE NOT NULL,
  uses_left  INT   NOT NULL DEFAULT 100 CHECK (uses_left >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ix_referral_owner ON referral_codes(owner_id);

CREATE TABLE referral_usages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referred_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  used_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ix_usage_referred  ON referral_usages(referred_id);
CREATE INDEX ix_usage_codeid    ON referral_usages(referral_code_id);

-- decrement uses_left atomically
CREATE OR REPLACE FUNCTION dec_referral_uses()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE referral_codes
  SET    uses_left = uses_left - 1
  WHERE  id = NEW.referral_code_id;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_referral_use
AFTER INSERT ON referral_usages
FOR EACH ROW EXECUTE FUNCTION dec_referral_uses();


-- 4.  EMAIL / PASSWORD FLOWS
CREATE TABLE email_verifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verification_code TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ix_emailver_user ON email_verifications(user_id);
CREATE INDEX ix_emailver_exp  ON email_verifications(expires_at);

CREATE TABLE password_resets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reset_token TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ix_pwdreset_user ON password_resets(user_id);
CREATE INDEX ix_pwdreset_exp  ON password_resets(expires_at);

-- 5.  WALLETS
CREATE TABLE user_wallets (
  user_id      UUID  PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  pub_eth_addr BYTEA NOT NULL CHECK (octet_length(pub_eth_addr)=20),
  enc_priv_key BYTEA NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 6.  POINTS  (single ledger)
CREATE TYPE point_type AS ENUM ('referral','quest','easter_egg','bonus','mining');

CREATE TABLE points_core (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       point_type NOT NULL,
  delta      INT  NOT NULL,
  meta       JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- covering index: fast balances & recent rows
CREATE INDEX ix_points_user_created
          ON points_core (user_id, created_at DESC)
          INCLUDE (delta, type);

-- index for SUM(delta) look-ups
CREATE INDEX ix_points_user_delta
          ON points_core (user_id)
          INCLUDE (delta);


-- 7.  QUEST FLAGS
CREATE TABLE user_quests (
  user_id      UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  quest1_done  BOOLEAN DEFAULT FALSE,
  quest2_done  BOOLEAN DEFAULT FALSE,
  quest3_done  BOOLEAN DEFAULT FALSE,
  quest4_done  BOOLEAN DEFAULT FALSE,
  quest5_done  BOOLEAN DEFAULT FALSE,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION touch_quests_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END $$;

CREATE TRIGGER trg_quests_touch
BEFORE UPDATE ON user_quests
FOR EACH ROW EXECUTE FUNCTION touch_quests_updated_at();


-- 8.  USER-REGISTRATION HOOK
CREATE OR REPLACE FUNCTION handle_user_registration()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  rc_id UUID;
BEGIN
  IF NEW.referred_by IS NOT NULL AND length(trim(NEW.referred_by)) > 0 THEN
    SELECT id INTO rc_id FROM referral_codes WHERE code = NEW.referred_by;
    IF rc_id IS NOT NULL THEN
      INSERT INTO referral_usages (referred_id, referral_code_id)
      VALUES (NEW.id, rc_id);
    END IF;
  END IF;

  INSERT INTO user_quests(user_id) VALUES (NEW.id);
  RETURN NEW;
END $$;

CREATE TRIGGER trg_user_registration
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION handle_user_registration();


-- 9.  SEED GENERIC REFERRAL CODE
DO $$
DECLARE
  adm_id UUID;
BEGIN
  SELECT id INTO adm_id
  FROM users
  WHERE email = 'info@nextmetal.io'
  LIMIT 1;

  IF adm_id IS NOT NULL THEN
    INSERT INTO referral_codes(code, owner_id)
    VALUES ('METAL-2025', adm_id)
    ON CONFLICT (code) DO NOTHING;
  ELSE
    INSERT INTO referral_codes(code)
    VALUES ('METAL-2025')
    ON CONFLICT (code) DO NOTHING;
  END IF;
END $$;

COMMIT;