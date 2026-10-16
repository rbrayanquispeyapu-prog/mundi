import { useState } from 'react';
import { supabase, type Team } from '../lib/supabase';
import { Plus, Trash2, Users } from 'lucide-react';

interface Props {
  teams: Team[];
  onRefresh: () => void;
}

const colorOptions = [
  '#dc2626', '#2563eb', '#059669', '#db2777',
  '#ea580c', '#7c3aed', '#0891b2', '#ca8a04',
  '#be185d', '#4f46e5', '#15803d', '#b91c1c',
];

export function Teams({ teams, onRefresh }: Props) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(colorOptions[0]);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTeam = async () => {
    if (!name.trim()) {
      setError('Ingresa un nombre para el equipo');
      return;
    }
    setAdding(true);
    setError(null);
    const { error: insertError } = await supabase
      .from('teams')
      .insert({ name: name.trim(), color });
    if (insertError) {
      setError(insertError.message);
      setAdding(false);
      return;
    }
    setName('');
    setColor(colorOptions[0]);
    setAdding(false);
    onRefresh();
  };

  const deleteTeam = async (team: Team) => {
    const { error: delError } = await supabase.from('teams').delete().eq('id', team.id);
    if (delError) {
      setError(delError.message);
      return;
    }
    onRefresh();
  };

  return (
    <div className="animate-fadeInUp">
      <h2 className="mb-4 text-lg font-bold text-white">Equipos Participantes</h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
          <Plus size={16} className="text-emerald-400" /> Agregar Equipo
        </h3>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-slate-500">Nombre del equipo / especialidad</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTeam()}
              placeholder="Ej. Neurología"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Color</label>
            <div className="flex flex-wrap gap-1.5">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <button
            onClick={addTeam}
            disabled={adding}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-emerald-400 disabled:opacity-50"
          >
            {adding ? 'Agregando…' : 'Agregar'}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <div
            key={team.id}
            className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-colors hover:border-slate-700"
          >
            <div
              className="absolute left-0 top-0 h-full w-1"
              style={{ backgroundColor: team.color }}
            />
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
                  style={{ backgroundColor: team.color }}
                >
                  {team.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-white">{team.name}</h4>
                  <p className="text-xs text-slate-500">{team.played} partidos jugados</p>
                </div>
              </div>
              <button
                onClick={() => deleteTeam(team)}
                className="rounded-lg p-1.5 text-slate-600 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                title="Eliminar equipo"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="mt-3 flex gap-4 text-xs">
              <div>
                <span className="text-slate-500">PTS</span>
                <p className="font-bold text-white">{team.points}</p>
              </div>
              <div>
                <span className="text-slate-500">G</span>
                <p className="font-bold text-emerald-400">{team.won}</p>
              </div>
              <div>
                <span className="text-slate-500">E</span>
                <p className="font-bold text-slate-300">{team.drawn}</p>
              </div>
              <div>
                <span className="text-slate-500">P</span>
                <p className="font-bold text-red-400">{team.lost}</p>
              </div>
              <div>
                <span className="text-slate-500">GF:GC</span>
                <p className="font-bold text-slate-300">{team.goals_for}:{team.goals_against}</p>
              </div>
            </div>
          </div>
        ))}

        {teams.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <Users size={40} className="mb-3 text-slate-700" />
            <p className="text-sm text-slate-500">No hay equipos registrados todavía.</p>
          </div>
        )}
      </div>
    </div>
  );
}
