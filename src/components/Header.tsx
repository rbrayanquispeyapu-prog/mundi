import { Trophy } from 'lucide-react';

type Tab = 'standings' | 'fixtures' | 'teams';

interface Props {
  tab: Tab;
  onTabChange: (t: Tab) => void;
}

const tabs: { key: Tab; label: string }[] = [
  { key: 'standings', label: 'Tabla' },
  { key: 'fixtures', label: 'Calendario' },
  { key: 'teams', label: 'Equipos' },
];

export function Header({ tab, onTabChange }: Props) {
  return (
    <header className="mb-8 border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="mx-auto max-w-5xl px-4 pt-10 pb-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20">
            <Trophy size={26} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold leading-tight tracking-tight text-white sm:text-2xl">
              Copa Rotativa Interespecialidades
            </h1>
            <p className="text-sm text-slate-400">Mundialito 2026</p>
          </div>
        </div>
      </div>

      <nav className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex gap-1">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`relative px-4 py-3 text-sm font-semibold transition-colors ${
                tab === key ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
              {tab === key && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-emerald-400" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
