-- Tracky — Supabase schema
-- Run this in the Supabase SQL editor to set up the database.
-- RLS is intentionally disabled for this personal-use app.
-- Enable it and add policies when opening to the public.

/* ─── Users ─────────────────────────────────────────────────────────────── */
CREATE TABLE IF NOT EXISTS users (
  id          TEXT        PRIMARY KEY,          -- Date.now() string from client
  name        TEXT        NOT NULL UNIQUE,
  pin_hash    TEXT        NOT NULL,             -- SHA-256 of the 4-digit PIN
  lang        TEXT        NOT NULL DEFAULT 'en',
  skin        TEXT        NOT NULL DEFAULT 'green',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

/* ─── Daily logs ─────────────────────────────────────────────────────────── */
CREATE TABLE IF NOT EXISTS daily_logs (
  id          BIGSERIAL   PRIMARY KEY,
  user_id     TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date        TEXT        NOT NULL,             -- YYYY-MM-DD local date
  meals       JSONB       NOT NULL DEFAULT '{}',
  workout     JSONB,
  weight      TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS daily_logs_user_date ON daily_logs (user_id, date);

/* ─── Presets ────────────────────────────────────────────────────────────── */
CREATE TABLE IF NOT EXISTS presets (
  id          BIGSERIAL   PRIMARY KEY,
  user_id     TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  slot_id     TEXT,
  description TEXT        NOT NULL DEFAULT '',
  ingredients JSONB       NOT NULL DEFAULT '[]',
  totals      JSONB       NOT NULL DEFAULT '{}',
  saved_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS presets_user ON presets (user_id);

/* ─── Storage bucket ─────────────────────────────────────────────────────── */
-- Create a public bucket named "meal-photos" in Supabase Storage.
-- Dashboard → Storage → New bucket → Name: meal-photos → Public: ON
--
-- Or via SQL (requires the storage extension):
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('meal-photos', 'meal-photos', true)
-- ON CONFLICT DO NOTHING;
