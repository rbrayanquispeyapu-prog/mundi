import { useMemo } from 'react';
import type { Team, MatchWithTeams } from '../lib/supabase';

interface Props {
  teams: Team[];
  matches: MatchWithTeams[];
}

export function Standings({ teams, matches }: Props) {
  const playedCount = useMemo(
    () => matches.filter((m) => m.played).length,
    [matches]
  );
  const totalMatches = matches.length;

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const aGD = a.goals_for - a.goals_against;
      const bGD = b.goals_for - b.goals_against;
      if (bGD !== aGD) return bGD - aGD;
      return b.goals_for - a.goals_for;
    });
  }, [teams]);

  return (
    <div className="animate-fadeInUp">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Tabla de Posiciones</h2>
        <span className="text-sm text-slate-400">
          {playedCount}/{totalMatches} partidos jugados
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-3 py-3 font-semibold">#</th>
              <th className="px-3 py-3 font-semibold">Equipo</th>
              <th className="px-2 py-3 text-center font-semibold">PJ</th>
              <th className="px-2 py-3 text-center font-semibold">G</th>
              <th className="px-2 py-3 text-center font-semibold">E</th>
              <th className="px-2 py-3 text-center font-semibold">P</th>
              <th className="px-2 py-3 text-center font-semibold">GF</th>
              <th className="px-2 py-3 text-center font-semibold">GC</th>
              <th className="px-2 py-3 text-center font-semibold">DIF</th>
              <th className="px-3 py-3 text-center font-semibold">PTS</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team, i) => {
              const gd = team.goals_for - team.goals_against;
              const isLeader = i === 0 && team.points > 0;
              return (
                <tr
                  key={team.id}
                  className={`border-b border-slate-800/50 transition-colors hover:bg-slate-800/30 ${
                    isLeader ? 'bg-emerald-500/5' : ''
                  }`}
                >
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${
                        isLeader
                          ? 'bg-emerald-400 text-slate-900'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: team.color }}
                      />
                      <span className="font-semibold text-white">{team.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center text-slate-300">{team.played}</td>
                  <td className="px-2 py-3 text-center text-slate-300">{team.won}</td>
                  <td className="px-2 py-3 text-center text-slate-300">{team.drawn}</td>
                  <td className="px-2 py-3 text-center text-slate-300">{team.lost}</td>
                  <td className="px-2 py-3 text-center text-slate-300">{team.goals_for}</td>
                  <td className="px-2 py-3 text-center text-slate-300">{team.goals_against}</td>
                  <td className="px-2 py-3 text-center">
                    <span className={gd > 0 ? 'text-emerald-400' : gd < 0 ? 'text-red-400' : 'text-slate-400'}>
                      {gd > 0 ? '+' : ''}{gd}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="font-bold text-white">{team.points}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
        <span><span className="font-semibold text-slate-400">PJ</span> Partidos Jugados</span>
        <span><span className="font-semibold text-slate-400">G/E/P</span> Ganados / Empatados / Perdidos</span>
        <span><span className="font-semibold text-slate-400">GF/GC</span> Goles a favor / en contra</span>
        <span><span className="font-semibold text-slate-400">DIF</span> Diferencia de goles</span>
      </div>
    </div>
  );
}
