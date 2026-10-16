import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Team = {
  id: string;
  name: string;
  color: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  points: number;
  created_at: string;
};

export type Match = {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
  matchday: number;
  played: boolean;
  date: string | null;
  created_at: string;
};

export type MatchWithTeams = Match & {
  home_team: Pick<Team, 'id' | 'name' | 'color'>;
  away_team: Pick<Team, 'id' | 'name' | 'color'>;
};
