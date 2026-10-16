/*
# Copa Rotativa Interespecialidades - Mundialito: Database Schema

## Purpose
A round-robin tournament between medical/dental specialties ("interespecialidades").
Teams represent different specialties and play against each other in a rotating cup format.
The app tracks standings, fixtures, and match results.

## New Tables
- `teams`
  - id (uuid, primary key)
  - name (text, not null) — specialty name (e.g. "Cardiología", "Traumatología")
  - color (text) — team accent color for UI
  - played (int, default 0) — matches played
  - won (int, default 0)
  - drawn (int, default 0)
  - lost (int, default 0)
  - goals_for (int, default 0) — goals scored
  - goals_against (int, default 0) — goals conceded
  - points (int, default 0) — tournament points (3 per win, 1 per draw)
  - created_at (timestamptz)

- `matches`
  - id (uuid, primary key)
  - home_team_id (uuid, FK to teams)
  - away_team_id (uuid, FK to teams)
  - home_score (int, nullable) — null if match not played yet
  - away_score (int, nullable)
  - matchday (int) — round/jornada number
  - played (boolean, default false)
  - date (timestamptz, nullable) — scheduled date if set
  - created_at (timestamptz)

## Security
- RLS enabled on both tables.
- Single-tenant (no auth): policies allow anon + authenticated full CRUD.
- Data is intentionally shared/public across the tournament.
*/

CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text DEFAULT '#2563eb',
  played int NOT NULL DEFAULT 0,
  won int NOT NULL DEFAULT 0,
  drawn int NOT NULL DEFAULT 0,
  lost int NOT NULL DEFAULT 0,
  goals_for int NOT NULL DEFAULT 0,
  goals_against int NOT NULL DEFAULT 0,
  points int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_teams" ON teams;
CREATE POLICY "anon_select_teams" ON teams FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_teams" ON teams;
CREATE POLICY "anon_insert_teams" ON teams FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_teams" ON teams;
CREATE POLICY "anon_update_teams" ON teams FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_teams" ON teams;
CREATE POLICY "anon_delete_teams" ON teams FOR DELETE
TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  away_team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  home_score int,
  away_score int,
  matchday int NOT NULL DEFAULT 1,
  played boolean NOT NULL DEFAULT false,
  date timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_matches" ON matches;
CREATE POLICY "anon_select_matches" ON matches FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_matches" ON matches;
CREATE POLICY "anon_insert_matches" ON matches FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_matches" ON matches;
CREATE POLICY "anon_update_matches" ON matches FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_matches" ON matches;
CREATE POLICY "anon_delete_matches" ON matches FOR DELETE
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_matches_matchday ON matches(matchday);
CREATE INDEX IF NOT EXISTS idx_matches_home_team ON matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_away_team ON matches(away_team_id);
