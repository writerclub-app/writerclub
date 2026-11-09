-- Migration: 0001_initial
-- Cloudflare D1 — public data only

CREATE TABLE IF NOT EXISTS profiles (
  id            TEXT PRIMARY KEY,       -- authId from OAuth (never exposed in URLs)
  username      TEXT NOT NULL UNIQUE,   -- public handle, used in /u/:username
  display_name  TEXT NOT NULL,
  avatar_url    TEXT,
  bio           TEXT,
  oauth_provider TEXT NOT NULL,         -- google | microsoft | github
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

CREATE TABLE IF NOT EXISTS texts (
  id            TEXT PRIMARY KEY,
  author_id     TEXT NOT NULL,          -- references profiles.id
  username      TEXT NOT NULL,          -- denormalized for fast public listing
  slug          TEXT NOT NULL,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  category_name TEXT,
  is_public     INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  UNIQUE(author_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_texts_username   ON texts(username);
CREATE INDEX IF NOT EXISTS idx_texts_author_id  ON texts(author_id);
CREATE INDEX IF NOT EXISTS idx_texts_is_public  ON texts(is_public);
