import { useState, useMemo } from 'react';
import { supabase, type MatchWithTeams } from '../lib/supabase';
import { Check, X, Calendar } from 'lucide-react';

interface Props {
  matches: MatchWithTeams[];
  onUpdate: () => void;
}

export function Fixtures({ matches, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matchdays = useMemo(() => {
    const map = new Map<number, MatchWithTeams[]>();
    for (const m of matches) {
      const arr = map.get(m.matchday) ?? [];
      arr.push(m);
      map.set(m.matchday, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [matches]);

  const startEdit = (m: MatchWithTeams) => {
    setEditingId(m.id);
    setHomeScore(m.home_score?.toString() ?? '');
    setAwayScore(m.away_score?.toString() ?? '');
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setHomeScore('');
    setAwayScore('');
    setError(null);
  };

  const saveResult = async (m: MatchWithTeams) => {
    const hs = parseInt(homeScore, 10);
    const as = parseInt(awayScore, 10);
    if (isNaN(hs) || isNaN(as) || hs < 0 || as < 0) {
      setError('Ingresa goles válidos (números positivos)');
      return;
    }

    setSaving(true);
    setError(null);

    const prevPlayed = m.played;
    const prevHome = m.home_score ?? 0;
    const prevAway = m.away_score ?? 0;

    const { error: matchError } = await supabase
      .from('matches')
      .update({ home_score: hs, away_score: as, played: true })
      .eq('id', m.id);
    if (matchError) {
      setError(matchError.message);
      setSaving(false);
      return;
    }

    // Recalculate team stats from the difference
    const homeDelta = prevPlayed ? -1 : 0;
    const awayDelta = prevPlayed ? -1 : 0;

    const homeTeamUpdate = computeTeamUpdate(hs, as, 1, homeDelta, prevHome, prevAway);
    const awayTeamUpdate = computeTeamUpdate(as, hs, 1, awayDelta, prevAway, prevHome);

    await Promise.all([
      supabase.from('teams').update(homeTeamUpdate).eq('id', m.home_team_id),
      supabase.from('teams').update(awayTeamUpdate).eq('id', m.away_team_id),
    ]);

    setSaving(false);
    cancelEdit();
    onUpdate();
  };

  const computeTeamUpdate = (
    scored: number,
    conceded: number,
    addPlayed: number,
    removePrev: number,
    prevScored: number,
    prevConceded: number
  ) => {
    let won = 0, drawn = 0, lost = 0, points = 0;
    if (scored > conceded) { won = 1; points = 3; }
    else if (scored === conceded) { drawn = 1; points = 1; }
    else { lost = 1; }

    let prevWon = 0, prevDrawn = 0, prevLost = 0, prevPoints = 0;
    if (removePrev) {
      if (prevScored > prevConceded) { prevWon = 1; prevPoints = 3; }
      else if (prevScored === prevConceded) { prevDrawn = 1; prevPoints = 1; }
      else { prevLost = 1; }
    }

    return {
      played: addPlayed - removePrev,
      won: won - prevWon,
      drawn: drawn - prevDrawn,
      lost: lost - prevLost,
      goals_for: scored - (removePrev ? prevScored : 0),
      goals_against: conceded - (removePrev ? prevConceded : 0),
      points: points - prevPoints,
    };
  };

  const clearResult = async (m: MatchWithTeams) => {
    setSaving(true);
    const prevHome = m.home_score ?? 0;
    const prevAway = m.away_score ?? 0;

    let prevWonH = 0, prevDrawnH = 0, prevLostH = 0, prevPointsH = 0;
    if (prevHome > prevAway) { prevWonH = 1; prevPointsH = 3; }
    else if (prevHome === prevAway) { prevDrawnH = 1; prevPointsH = 1; }
    else { prevLostH = 1; }

    let prevWonA = 0, prevDrawnA = 0, prevLostA = 0, prevPointsA = 0;
    if (prevAway > prevHome) { prevWonA = 1; prevPointsA = 3; }
    else if (prevAway === prevHome) { prevDrawnA = 1; prevPointsA = 1; }
    else { prevLostA = 1; }

    await supabase.from('matches').update({
      home_score: null, away_score: null, played: false
    }).eq('id', m.id);

    await Promise.all([
      supabase.from('teams').update({
        played: -1, won: -prevWonH, drawn: -prevDrawnH, lost: -prevLostH,
        goals_for: -prevHome, goals_against: -prevAway, points: -prevPointsH
      }).eq('id', m.home_team_id),
      supabase.from('teams').update({
        played: -1, won: -prevWonA, drawn: -prevDrawnA, lost: -prevLostA,
        goals_for: -prevAway, goals_against: -prevHome, points: -prevPointsA
      }).eq('id', m.away_team_id),
    ]);

    setSaving(false);
    onUpdate();
  };

  return (
    <div className="animate-fadeInUp">
      <h2 className="mb-4 text-lg font-bold text-white">Calendario y Resultados</h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {matchdays.map(([day, dayMatches]) => (
          <div key={day}>
            <div className="mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Jornada {day}
              </h3>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            <div className="space-y-2">
              {dayMatches.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-colors hover:border-slate-700"
                >
                  {editingId === m.id ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center justify-between gap-3 sm:flex-1">
                        <span className="flex items-center gap-2 text-sm font-semibold text-white">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: m.home_team.color }} />
                          {m.home_team.name}
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={homeScore}
                          onChange={(e) => setHomeScore(e.target.value)}
                          className="w-14 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-center text-lg font-bold text-white focus:border-emerald-400 focus:outline-none"
                          autoFocus
                        />
                        <span className="text-slate-500">vs</span>
                        <input
                          type="number"
                          min="0"
                          value={awayScore}
                          onChange={(e) => setAwayScore(e.target.value)}
                          className="w-14 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-center text-lg font-bold text-white focus:border-emerald-400 focus:outline-none"
                        />
                        <span className="flex items-center gap-2 text-sm font-semibold text-white">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: m.away_team.color }} />
                          {m.away_team.name}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveResult(m)}
                          disabled={saving}
                          className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-emerald-400 disabled:opacity-50"
                        >
                          <Check size={16} /> Guardar
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-50"
                        >
                          <X size={16} /> Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-1 items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-sm font-semibold text-white">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: m.home_team.color }} />
                          {m.home_team.name}
                        </span>

                        {m.played ? (
                          <span className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-1.5 text-lg font-bold text-white">
                            {m.home_score} <span className="text-slate-500">:</span> {m.away_score}
                          </span>
                        ) : (
                          <span className="rounded-lg border border-slate-700 px-4 py-1.5 text-sm text-slate-500">
                            vs
                          </span>
                        )}

                        <span className="flex items-center gap-2 text-sm font-semibold text-white">
                          {m.away_team.name}
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: m.away_team.color }} />
                        </span>
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(m)}
                          disabled={saving}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/10 disabled:opacity-50"
                        >
                          {m.played ? 'Editar' : 'Ingresar'}
                        </button>
                        {m.played && (
                          <button
                            onClick={() => clearResult(m)}
                            disabled={saving}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 disabled:opacity-50"
                          >
                            Borrar
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
