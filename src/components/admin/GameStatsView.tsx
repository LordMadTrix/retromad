import React, { useMemo } from 'react';
import {
  Clock,
  Trophy,
  Heart,
  Gamepad2,
  Cpu,
  BarChart3,
  TrendingUp,
  CalendarClock,
} from 'lucide-react';
import { Game, System } from '../../types';

/**
 * Statistiques de jeu (Centre Admin) — vue sobre uniforme cyan.
 *
 * 1. Top 10 des jeux par temps de jeu cumulé (playTimeMinutes)
 * 2. Temps de jeu total par console (agrégé, barres horizontales)
 * 3. Lancements : top jeux par nombre de parties (playCount) + KPI globaux
 * 4. Favoris les plus joués (temps et lancements parmi les favoris)
 *
 * NB : les données viennent du suivi intégré (chaque lancement ajoute
 * 15 minutes / 1 session dans handleLaunchGame d'App.tsx).
 */

interface GameStatsViewProps {
  games: Game[];
  systems: System[];
}

function fmtDuration(totalMinutes?: number): string {
  const tm = totalMinutes || 0;
  if (tm <= 0) return '0 min';
  const hours = Math.floor(tm / 60);
  const mins = Math.round(tm % 60);
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} h`;
  return `${hours} h ${mins.toString().padStart(2, '0')}`;
}

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const RANK_BADGES = ['text-amber-300', 'text-slate-300', 'text-orange-400'];

export const GameStatsView: React.FC<GameStatsViewProps> = ({ games, systems }) => {
  // ── Agrégats ──
  const played = useMemo(() => games.filter((g) => (g.playCount || 0) > 0 || (g.playTimeMinutes || 0) > 0), [games]);

  const topByTime = useMemo(
    () =>
      [...games]
        .filter((g) => (g.playTimeMinutes || 0) > 0)
        .sort((a, b) => (b.playTimeMinutes || 0) - (a.playTimeMinutes || 0))
        .slice(0, 10),
    [games]
  );

  const topByLaunches = useMemo(
    () =>
      [...games]
        .filter((g) => (g.playCount || 0) > 0)
        .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
        .slice(0, 10),
    [games]
  );

  const topFavorites = useMemo(
    () =>
      games
        .filter((g) => g.favorite && ((g.playCount || 0) > 0 || (g.playTimeMinutes || 0) > 0))
        .sort(
          (a, b) =>
            (b.playTimeMinutes || 0) + (b.playCount || 0) * 5 -
            ((a.playTimeMinutes || 0) + (a.playCount || 0) * 5)
        )
        .slice(0, 8),
    [games]
  );

  const timeBySystem = useMemo(() => {
    const map = new Map<string, { minutes: number; launches: number; games: number }>();
    systems.forEach((s) => map.set(s.id, { minutes: 0, launches: 0, games: 0 }));
    games.forEach((g) => {
      const entry = map.get(g.systemId);
      if (entry) {
        entry.minutes += g.playTimeMinutes || 0;
        entry.launches += g.playCount || 0;
        if ((g.playCount || 0) > 0) entry.games += 1;
      }
    });
    return [...map.entries()]
      .filter(([, v]) => v.minutes > 0 || v.launches > 0)
      .sort((a, b) => b[1].minutes - a[1].minutes)
      .slice(0, 12)
      .map(([systemId, v]) => {
        const sys = systems.find((s) => s.id === systemId);
        return { system: sys, name: sys?.name || systemId, color: sys?.themeColor || '#00f2fe', ...v };
      });
  }, [games, systems]);

  const maxSystemMinutes = timeBySystem[0]?.minutes || 1;
  const maxGameMinutes = topByTime[0]?.playTimeMinutes || 1;

  // ── KPIs globaux ──
  const totalMinutes = useMemo(() => games.reduce((a, g) => a + (g.playTimeMinutes || 0), 0), [games]);
  const totalLaunches = useMemo(() => games.reduce((a, g) => a + (g.playCount || 0), 0), [games]);
  const favoriteCount = useMemo(() => games.filter((g) => g.favorite).length, [games]);
  const lastSession = useMemo(
    () =>
      played
        .filter((g) => g.lastPlayed)
        .sort((a, b) => (b.lastPlayed || '').localeCompare(a.lastPlayed || ''))[0],
    [played]
  );

  if (played.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
        <BarChart3 className="w-8 h-8 text-slate-600 mx-auto" />
        <h3 className="font-bold text-slate-100">Aucune statistique de jeu pour l'instant</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Les statistiques se remplissent automatiquement : chaque partie lancée depuis RetroMad
          ajoute du temps de jeu et un lancement au jeu concerné. Lancez quelques jeux en mode
          Kiosque, puis revenez ici.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* KPIs globaux */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> Temps de jeu total
          </div>
          <div className="text-xl font-black text-white font-mono">{fmtDuration(totalMinutes)}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Lancements
          </div>
          <div className="text-xl font-black text-white font-mono">{totalLaunches}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
            <Gamepad2 className="w-3.5 h-3.5 text-violet-400" /> Jeux joués
          </div>
          <div className="text-xl font-black text-white font-mono">
            {played.length}
            <span className="text-xs text-slate-500 font-sans font-semibold"> / {games.length}</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
            <CalendarClock className="w-3.5 h-3.5 text-amber-400" /> Dernière session
          </div>
          <div className="text-sm font-black text-white truncate" title={lastSession?.cleanTitle}>
            {lastSession ? fmtDate(lastSession.lastPlayed) : '—'}
          </div>
          <div className="text-[10px] text-slate-500 truncate">{lastSession?.cleanTitle || ''}</div>
        </div>
      </div>

      {/* Top 10 temps de jeu */}
      <section className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100">Top 10 — Temps de jeu</h3>
        </div>
        <div className="space-y-2">
          {topByTime.map((g, idx) => (
            <div key={g.id} className="flex items-center gap-3">
              <span className={`w-6 text-right text-xs font-black font-mono ${RANK_BADGES[idx] || 'text-slate-500'}`}>
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-200 truncate">{g.cleanTitle}</span>
                  <span className="text-[11px] font-mono font-bold text-cyan-300 shrink-0">
                    {fmtDuration(g.playTimeMinutes)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                    style={{ width: `${Math.max(4, Math.round(((g.playTimeMinutes || 0) / maxGameMinutes) * 100))}%` }}
                  />
                </div>
              </div>
              {g.favorite && <Heart className="w-3 h-3 text-rose-400 fill-current shrink-0" />}
            </div>
          ))}
        </div>
      </section>

      {/* Temps par console */}
      <section className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-100">Temps de jeu par console</h3>
        </div>
        <div className="space-y-2.5">
          {timeBySystem.map(({ name, color, minutes, launches, games: playedGames }) => (
            <div key={name}>
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="text-xs font-bold text-slate-200 truncate">{name}</span>
                <span className="text-[11px] font-mono text-slate-400 shrink-0">
                  {fmtDuration(minutes)} · {launches} lancement{launches > 1 ? 's' : ''} · {playedGames} jeu{playedGames > 1 ? 'x' : ''}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.max(3, Math.round((minutes / maxSystemMinutes) * 100))}%`,
                    background: `linear-gradient(90deg, ${color}88, ${color})`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Top lancements */}
        <section className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">Top 10 — Lancements</h3>
          </div>
          <div className="space-y-1.5">
            {topByLaunches.map((g, idx) => {
              const sys = systems.find((s) => s.id === g.systemId);
              return (
                <div
                  key={g.id}
                  className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/60"
                >
                  <span className={`w-5 text-right text-xs font-black font-mono ${RANK_BADGES[idx] || 'text-slate-500'}`}>
                    {idx + 1}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md border shrink-0"
                    style={{ color: sys?.themeColor, borderColor: `${sys?.themeColor}55`, backgroundColor: `${sys?.themeColor}18` }}>
                    {sys?.shortName || sys?.name || '?'}
                  </span>
                  <span className="flex-1 min-w-0 text-xs font-bold text-slate-200 truncate">{g.cleanTitle}</span>
                  <span className="text-[11px] font-mono font-black text-amber-300 shrink-0">{g.playCount}×</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Favoris les plus joués */}
        <section className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-slate-100">Favoris les plus joués</h3>
          </div>
          {topFavorites.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              Aucun favori joué pour l'instant — marquez des jeux avec ♥ puis lancez-les.
            </p>
          ) : (
            <div className="space-y-1.5">
              {topFavorites.map((g) => {
                const sys = systems.find((s) => s.id === g.systemId);
                return (
                  <div
                    key={g.id}
                    className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/60"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-current shrink-0" />
                    <span className="flex-1 min-w-0 text-xs font-bold text-slate-200 truncate">{g.cleanTitle}</span>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">{sys?.shortName}</span>
                    <span className="text-[11px] font-mono font-bold text-cyan-300 shrink-0">{fmtDuration(g.playTimeMinutes)}</span>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">{g.playCount || 0}×</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <p className="text-[10px] text-slate-600 text-center">
        Chaque partie lancée compte 15 minutes de temps de jeu (suivi intégré RetroMad) · {favoriteCount} favori{favoriteCount > 1 ? 's' : ''} au total
      </p>
    </div>
  );
};
