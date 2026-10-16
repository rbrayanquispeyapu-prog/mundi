import { useState, useEffect, useCallback } from 'react';
import { supabase, type Team, type MatchWithTeams } from './lib/supabase';
import { Header } from './components/Header';
import { Standings } from './components/Standings';
import { Fixtures } from './components/Fixtures';
import { Teams } from './components/Teams';
import { Trophy } from 'lucide-react';

type Tab = 'standings' | 'fixtures' | 'teams';

export default function App() {
  const [tab, setTab] = useState<Tab>('standings');
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [teamsRes, matchesRes] = await Promise.all([
      supabase.from('teams').select('*').order('points', { ascending: false }).order('goals_for', { ascending: false }),
      supabase
        .from('matches')
        .select(`
          *,
          home_team:home_team_id (id, name, color),
          away_team:away_team_id (id, name, color)
        `)
        .order('matchday', { ascending: true })
        .order('created_at', { ascending: true }),
    ]);
    setTeams(teamsRes.data ?? []);
    setMatches((matchesRes.data ?? []) as unknown as MatchWithTeams[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header tab={tab} onTabChange={setTab} />

      <main className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-400" />
            <p className="mt-4 text-sm text-slate-400">Cargando datos del torneo…</p>
          </div>
        ) : (
          <>
            {tab === 'standings' && <Standings teams={teams} matches={matches} />}
            {tab === 'fixtures' && <Fixtures matches={matches} onUpdate={fetchData} />}
            {tab === 'teams' && <Teams teams={teams} onRefresh={fetchData} />}
          </>
        )}
      </main>

      <footer className="border-t border-slate-800 py-6">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <Trophy size={14} className="text-emerald-400/60" />
            Copa Rotativa Interespecialidades · Mundialito 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
