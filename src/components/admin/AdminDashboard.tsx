import React, { useMemo } from 'react';
import {
  Gamepad2,
  Cpu,
  Landmark,
  Terminal,
  HardDrive,
  Globe,
  Lock,
  Palette,
  RotateCcw,
  FileJson,
  DownloadCloud,
  Star,
  ImageOff,
  ShieldAlert,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { Game, System, Company, EmulatorProfile, BiosStatus } from '../../types';
import { AdminLogEntry } from '../../hooks/useAdminLogs';

interface AdminDashboardProps {
  games: Game[];
  systems: System[];
  companies: Company[];
  emulators: EmulatorProfile[];
  biosStatuses: BiosStatus[];
  logs: AdminLogEntry[];
  onNavigate: (tab: string) => void;
}

const formatBytes = (bytes: number): string => {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} Go`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(0)} Mo`;
  return `${(bytes / 1024).toFixed(0)} Ko`;
};

const formatTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'il y a quelques secondes';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  return `il y a ${diffH}h`;
};

const LOG_COLORS = {
  info: { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400', icon: Activity },
  success: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', icon: CheckCircle2 },
  warning: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', icon: AlertTriangle },
  error: { bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-400', icon: XCircle },
};

/**
 * Tableau de bord administrateur — vue globale avec KPIs, santé de la collection,
 * graphique de répartition et journal des 10 dernières actions.
 */
export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  games,
  systems,
  companies,
  emulators,
  biosStatuses,
  logs,
  onNavigate,
}) => {
  // ── KPIs ──
  const totalSize = useMemo(() => games.reduce((a, g) => a + (g.size || 0), 0), [games]);
  const favorites = useMemo(() => games.filter((g) => g.favorite).length, [games]);
  const gamesWithBoxart = useMemo(
    () => games.filter((g) => g.media?.boxart2d || g.media?.boxart3d || g.media?.wheel).length,
    [games]
  );
  const scrapingRate = games.length > 0 ? Math.round((gamesWithBoxart / games.length) * 100) : 0;
  const missingBios = biosStatuses.filter((b) => !b.found && !b.optional).length;
  const mostPlayed = useMemo(
    () => [...games].sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 5),
    [games]
  );

  // ── Répartition par firme ──
  const byCompany = useMemo(() => {
    const map = new Map<string, number>();
    games.forEach((g) => {
      const sys = systems.find((s) => s.id === g.systemId);
      const compId = sys?.companyId || 'Autre';
      map.set(compId, (map.get(compId) || 0) + 1);
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([compId, count]) => ({
        compId,
        name: companies.find((c) => c.id === compId)?.name || compId,
        count,
        color: companies.find((c) => c.id === compId)?.accentColor || '#64748b',
        pct: games.length > 0 ? Math.round((count / games.length) * 100) : 0,
      }));
  }, [games, systems, companies]);

  const kpis = [
    {
      label: 'Jeux total',
      value: games.length,
      sub: `${favorites} favoris`,
      color: 'cyan',
      icon: Gamepad2,
      tab: 'games',
    },
    {
      label: 'Consoles',
      value: systems.length,
      sub: `${companies.length} constructeurs`,
      color: 'amber',
      icon: Cpu,
      tab: 'systems',
    },
    {
      label: 'Scraping',
      value: `${scrapingRate}%`,
      sub: `${gamesWithBoxart} / ${games.length} jaquettes`,
      color: 'violet',
      icon: Globe,
      tab: 'scraper',
    },
    {
      label: 'Stockage',
      value: formatBytes(totalSize),
      sub: `${games.length > 0 ? formatBytes(Math.round(totalSize / games.length)) : '—'} / jeu`,
      color: 'emerald',
      icon: HardDrive,
      tab: 'storage',
    },
    {
      label: 'BIOS manquants',
      value: missingBios,
      sub: missingBios === 0 ? 'Tout est OK ✓' : 'BIOS requis absents',
      color: missingBios === 0 ? 'emerald' : 'rose',
      icon: missingBios === 0 ? CheckCircle2 : ShieldAlert,
      tab: 'bios',
    },
    {
      label: 'Émulateurs',
      value: emulators.length,
      sub: `${emulators.filter((e) => e.isDetected).length} auto-détectés`,
      color: 'emerald',
      icon: Terminal,
      tab: 'emulators',
    },
  ];

  const colorMap: Record<string, string> = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  };

  return (
    <div className="space-y-6">
      {/* ── KPIs ── */}
      <div>
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5" /> Indicateurs clés
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            const cls = colorMap[kpi.color] || colorMap['cyan'];
            return (
              <button
                key={kpi.label}
                type="button"
                onClick={() => onNavigate(kpi.tab)}
                className="group p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-600 transition text-left flex flex-col gap-2"
              >
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${cls}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xl font-black text-white block leading-none">{kpi.value}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{kpi.label}</span>
                </div>
                <span className="text-[10px] text-slate-500 truncate">{kpi.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Répartition par firme ── */}
        <div className="lg:col-span-1 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Landmark className="w-3.5 h-3.5 text-violet-400" /> Répartition par firme
          </h3>
          {byCompany.length === 0 ? (
            <p className="text-xs text-slate-500">Aucun jeu scanné.</p>
          ) : (
            <div className="space-y-2.5">
              {byCompany.map((item) => (
                <div key={item.compId} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-300 truncate max-w-[120px]">
                      {item.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {item.count} ({item.pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Top 5 jeux les plus joués ── */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-amber-400" /> Top jeux joués
          </h3>
          {mostPlayed.length === 0 || mostPlayed[0].playCount === 0 ? (
            <p className="text-xs text-slate-500">Aucune session enregistrée pour l'instant.</p>
          ) : (
            <div className="space-y-2">
              {mostPlayed.map((g, idx) => (
                <div key={g.id} className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-slate-500 w-4 text-right">
                    {idx + 1}
                  </span>
                  {g.media?.boxart2d ? (
                    <img
                      src={g.media.boxart2d}
                      alt=""
                      className="w-7 h-9 rounded object-cover bg-black border border-slate-800 shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-9 rounded bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      <ImageOff className="w-3 h-3 text-slate-700" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold text-white block truncate">
                      {g.cleanTitle || g.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{g.systemId}</span>
                  </div>
                  <span className="text-xs font-black text-amber-400 font-mono shrink-0">
                    {g.playCount}×
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Journal des actions ── */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> Journal récent
          </h3>
          {logs.length === 0 ? (
            <p className="text-xs text-slate-500">Aucune action admin enregistrée.</p>
          ) : (
            <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
              {logs.slice(0, 20).map((entry) => {
                const cfg = LOG_COLORS[entry.level];
                const Icon = cfg.icon;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-start gap-2 p-2 rounded-lg border text-[10px] ${cfg.bg}`}
                  >
                    <Icon className={`w-3 h-3 shrink-0 mt-0.5 ${cfg.text}`} />
                    <div className="flex-1 min-w-0">
                      <span className={`font-bold ${cfg.text}`}>{entry.category}</span>
                      <span className="text-slate-300 block truncate">{entry.message}</span>
                      <span className="text-slate-600">{formatTime(entry.timestamp)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Santé de la collection résumé ── */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
        <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-emerald-400" /> Santé de la collection
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Taux de scraping */}
          <button
            onClick={() => onNavigate('games')}
            className="group p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/40 transition text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Jaquettes
              </span>
              <Globe className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden mb-1.5">
              <div
                className="h-full rounded-full bg-violet-500 transition-all"
                style={{ width: `${scrapingRate}%` }}
              />
            </div>
            <span className="text-xs font-black text-violet-300">{scrapingRate}%</span>
          </button>

          {/* BIOS */}
          <button
            onClick={() => onNavigate('bios')}
            className="group p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                BIOS
              </span>
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden mb-1.5">
              <div
                className="h-full rounded-full bg-cyan-500 transition-all"
                style={{
                  width: `${
                    biosStatuses.length > 0
                      ? Math.round(
                          (biosStatuses.filter((b) => b.found).length / biosStatuses.length) * 100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
            <span className="text-xs font-black text-cyan-300">
              {biosStatuses.filter((b) => b.found).length}/{biosStatuses.length} présents
            </span>
          </button>

          {/* Favoris */}
          <button
            onClick={() => onNavigate('games')}
            className="group p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Favoris
              </span>
              <Star className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden mb-1.5">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{
                  width: `${games.length > 0 ? Math.round((favorites / games.length) * 100) : 0}%`,
                }}
              />
            </div>
            <span className="text-xs font-black text-amber-300">{favorites} / {games.length}</span>
          </button>

          {/* Kiosk */}
          <button
            onClick={() => onNavigate('kiosk')}
            className="group p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 transition text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Sécurité
              </span>
              <Lock className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-xs text-slate-300 font-semibold">Système opérationnel</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">PIN configuré</span>
          </button>
        </div>
      </div>

      {/* ── Actions rapides ── */}
      <div>
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
          Navigation rapide
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Catalogue Jeux', tab: 'games', icon: Gamepad2, color: 'cyan' },
            { label: 'Consoles', tab: 'systems', icon: Cpu, color: 'amber' },
            { label: 'Firmes', tab: 'companies', icon: Landmark, color: 'violet' },
            { label: 'Émulateurs', tab: 'emulators', icon: Terminal, color: 'emerald' },
            { label: 'BIOS', tab: 'bios', icon: Cpu, color: 'blue' },
            { label: 'Scraper', tab: 'scraper', icon: Globe, color: 'purple' },
            { label: 'Cœurs', tab: 'extensions', icon: DownloadCloud, color: 'teal' },
            { label: 'Manettes', tab: 'gamepad', icon: Gamepad2, color: 'cyan' },
            { label: 'Dossiers', tab: 'storage', icon: HardDrive, color: 'slate' },
            { label: 'Kiosk', tab: 'kiosk', icon: Lock, color: 'rose' },
            { label: 'Apparence', tab: 'appearance', icon: Palette, color: 'pink' },
            { label: 'Sauvegardes', tab: 'backups', icon: RotateCcw, color: 'indigo' },
            { label: 'JSON Brut', tab: 'json', icon: FileJson, color: 'slate' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.tab}
                onClick={() => onNavigate(item.tab)}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1.5"
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
