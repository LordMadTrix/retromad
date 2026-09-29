import React, { useState } from 'react';
import { Activity, Trash2, Filter, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { AdminLogEntry, LogLevel } from '../../hooks/useAdminLogs';

interface AdminLogsViewProps {
  logs: AdminLogEntry[];
  onClear: () => void;
}

const LEVEL_CONFIG: Record<
  LogLevel,
  { label: string; bg: string; text: string; border: string; icon: React.FC<{ className?: string }> }
> = {
  info: {
    label: 'Info',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    icon: Info,
  },
  success: {
    label: 'Succès',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    icon: CheckCircle2,
  },
  warning: {
    label: 'Alerte',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    icon: AlertTriangle,
  },
  error: {
    label: 'Erreur',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    icon: XCircle,
  },
};

const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const formatDate = (date: Date): string => {
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
  if (isToday) return "Aujourd'hui";
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
};

/**
 * Vue des logs admin — filtrables par niveau et catégorie.
 */
export const AdminLogsView: React.FC<AdminLogsViewProps> = ({ logs, onClear }) => {
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = Array.from(new Set(logs.map((l) => l.category))).sort();

  const filtered = logs.filter((l) => {
    if (levelFilter !== 'all' && l.level !== levelFilter) return false;
    if (categoryFilter !== 'all' && l.category !== categoryFilter) return false;
    return true;
  });

  // Grouper par date
  const grouped: { date: string; entries: AdminLogEntry[] }[] = [];
  filtered.forEach((entry) => {
    const dateStr = formatDate(entry.timestamp);
    const last = grouped[grouped.length - 1];
    if (last && last.date === dateStr) {
      last.entries.push(entry);
    } else {
      grouped.push({ date: dateStr, entries: [entry] });
    }
  });

  const counts: Record<LogLevel, number> = { info: 0, success: 0, warning: 0, error: 0 };
  logs.forEach((l) => counts[l.level]++);

  return (
    <div className="space-y-4 max-w-4xl">
      {/* En-tête avec stats */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <span className="text-sm font-black text-white block">Journal des actions</span>
            <span className="text-xs text-slate-400">{logs.length} entrée(s) — 200 max conservées</span>
          </div>
        </div>

        {/* Compteurs par niveau */}
        <div className="flex items-center gap-2 flex-wrap">
          {(Object.keys(LEVEL_CONFIG) as LogLevel[]).map((level) => {
            const cfg = LEVEL_CONFIG[level];
            const Icon = cfg.icon;
            return (
              <button
                key={level}
                onClick={() => setLevelFilter(levelFilter === level ? 'all' : level)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                  levelFilter === level
                    ? `${cfg.bg} ${cfg.border} ${cfg.text}`
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                <Icon className="w-3 h-3" />
                {cfg.label} ({counts[level]})
              </button>
            );
          })}

          {logs.length > 0 && (
            <button
              onClick={onClear}
              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Vider
            </button>
          )}
        </div>
      </div>

      {/* Filtre par catégorie */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
              categoryFilter === 'all'
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
            }`}
          >
            Toutes ({logs.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                categoryFilter === cat
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Liste des logs */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800">
          <Activity className="w-8 h-8 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500">
            {logs.length === 0
              ? 'Aucune action admin enregistrée. Les actions apparaîtront ici en temps réel.'
              : 'Aucune entrée ne correspond aux filtres sélectionnés.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ date, entries }) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {date}
                </span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>
              <div className="space-y-1.5">
                {entries.map((entry) => {
                  const cfg = LEVEL_CONFIG[entry.level];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${cfg.text}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-black uppercase tracking-wider ${cfg.text}`}>
                            {entry.category}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {formatTimestamp(entry.timestamp)}
                          </span>
                        </div>
                        <span className="text-xs text-slate-200">{entry.message}</span>
                        {entry.details && (
                          <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                            {entry.details}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
