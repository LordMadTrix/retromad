import React, { useState } from 'react';
import {
  X,
  BarChart3,
  Clock,
  Flame,
  Calendar,
  Sparkles,
  Gamepad2,
  Tv,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Game, System } from '../../types';
import { GamePlayStats, PlaySession } from '../../types/extendedFeatures';

interface RetroAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  systems: System[];
  playStats: GamePlayStats[];
  sessions: PlaySession[];
  onPlayGame?: (game: Game) => void;
  onPlaySound?: (type: 'coin' | 'powerup' | 'fanfare') => void;
}

export const RetroAnalyticsModal: React.FC<RetroAnalyticsModalProps> = ({
  isOpen,
  onClose,
  games,
  systems,
  playStats,
  sessions,
  onPlayGame,
  onPlaySound,
}) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'games' | 'systems' | 'history'>('overview');

  if (!isOpen) return null;

  // Calculs statistiques globaux
  const totalMinutes = playStats.reduce((acc, s) => acc + s.playTimeMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const totalSessionsCount = playStats.reduce((acc, s) => acc + s.sessionCount, 0);

  // Jeu le plus joué
  const sortedByTime = [...playStats].sort((a, b) => b.playTimeMinutes - a.playTimeMinutes);
  const topGame = sortedByTime[0];

  // Temps de jeu par système
  const systemTimeMap: Record<string, { name: string; minutes: number; gameCount: number }> = {};
  systems.forEach((sys) => {
    systemTimeMap[sys.id] = { name: sys.name, minutes: 0, gameCount: 0 };
  });

  playStats.forEach((st) => {
    if (systemTimeMap[st.systemId]) {
      systemTimeMap[st.systemId].minutes += st.playTimeMinutes;
      systemTimeMap[st.systemId].gameCount += 1;
    }
  });

  const sortedSystems = Object.entries(systemTimeMap)
    .filter(([_, data]) => data.minutes > 0 || data.gameCount > 0)
    .sort((a, b) => b[1].minutes - a[1].minutes);

  const topSystem = sortedSystems[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-950 border border-cyan-500/40 rounded-3xl shadow-2xl shadow-cyan-500/10 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black tracking-wider text-white uppercase">
                  Rétro Analytics & Journal de Bord
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-black uppercase">
                  Statistiques Joueur
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Suivi précis du temps de jeu, historiques des sessions et classement de votre ludothèque.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation sous-onglets */}
        <div className="flex items-center space-x-2 px-6 py-3 border-b border-slate-800/80 bg-slate-900/30 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Vue d\'Ensemble', icon: TrendingUp },
            { id: 'games', label: 'Temps par Jeu', icon: Gamepad2 },
            { id: 'systems', label: 'Temps par Console', icon: Tv },
            { id: 'history', label: 'Historique des Sessions', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = selectedView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedView(tab.id as any);
                  if (onPlaySound) onPlaySound('powerup');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
                  active
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Corps principal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* VUE D'ENSEMBLE */}
          {selectedView === 'overview' && (
            <div className="space-y-6">
              {/* 4 Cartes Métriques Clés */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Temps Total Joué</span>
                    <Clock className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="mt-3 flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-white">{totalHours}</span>
                    <span className="text-xs font-bold text-cyan-400 uppercase">Heures</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Soit {totalMinutes} minutes cumulées
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/30 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sessions d'Arcade</span>
                    <Flame className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="mt-3 flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-white">{totalSessionsCount}</span>
                    <span className="text-xs font-bold text-purple-400 uppercase">Parties</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Moyenne : ~{totalSessionsCount ? Math.round(totalMinutes / totalSessionsCount) : 0} min / partie
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-pink-500/30 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jeu le Plus Dosé</span>
                    <Award className="w-4 h-4 text-pink-400" />
                  </div>
                  <div className="mt-3 truncate">
                    <span className="text-lg font-black text-white truncate block">
                      {topGame ? topGame.gameTitle : 'Aucun jeu'}
                    </span>
                    <span className="text-xs font-bold text-pink-400 uppercase">
                      {topGame ? `${Math.round(topGame.playTimeMinutes / 60)}h ${(topGame.playTimeMinutes % 60)}m` : '--'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">
                    {topGame?.systemName || 'Lancez une partie'}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Console Favorite</span>
                    <Tv className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-3 truncate">
                    <span className="text-lg font-black text-white truncate block">
                      {topSystem ? topSystem[1].name : 'Aucun système'}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 uppercase">
                      {topSystem ? `${Math.round(topSystem[1].minutes / 60)}h de jeu` : '--'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {topSystem ? `${topSystem[1].gameCount} jeux joués` : '--'}
                  </div>
                </div>
              </div>

              {/* Heatmap / Activité hebdomadaire simulée */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span>Intensité de Jeu Récente</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">Derniers 14 jours</span>
                </div>

                <div className="grid grid-cols-7 sm:grid-cols-14 gap-2">
                  {[20, 45, 0, 90, 60, 120, 30, 0, 75, 110, 40, 15, 95, 60].map((mins, idx) => (
                    <div key={idx} className="flex flex-col items-center space-y-1">
                      <div
                        className={`w-full h-16 rounded-xl border flex items-end justify-center p-1 transition ${
                          mins === 0
                            ? 'bg-slate-900 border-slate-800'
                            : mins < 45
                            ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-400'
                            : mins < 90
                            ? 'bg-cyan-900/60 border-cyan-500/60 text-cyan-300 font-bold'
                            : 'bg-cyan-500/80 border-cyan-400 text-slate-950 font-black shadow-md shadow-cyan-500/30'
                        }`}
                      >
                        <span className="text-[10px]">{mins > 0 ? `${mins}m` : '-'}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono">J-{14 - idx}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 3 Jeux & Dernières Sessions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 3 */}
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Podium des Jeux les Plus Joués</span>
                  </h3>

                  <div className="space-y-3">
                    {sortedByTime.slice(0, 4).map((game, rank) => {
                      const pct = totalMinutes ? Math.round((game.playTimeMinutes / totalMinutes) * 100) : 0;
                      return (
                        <div key={game.gameId} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center space-x-3 truncate">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                              rank === 0 ? 'bg-amber-500 text-slate-950' : rank === 1 ? 'bg-slate-300 text-slate-950' : 'bg-amber-800 text-amber-200'
                            }`}>
                              #{rank + 1}
                            </span>
                            <div className="truncate">
                              <span className="text-xs font-bold text-white block truncate">{game.gameTitle}</span>
                              <span className="text-[10px] text-slate-400">{game.systemName}</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-cyan-400 block">{game.playTimeMinutes} min</span>
                            <span className="text-[10px] text-slate-500">{pct}% du total</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dernières Sessions */}
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span>Dernières Parties Jouées</span>
                  </h3>

                  <div className="space-y-3">
                    {sessions.slice(0, 4).map((sess) => (
                      <div key={sess.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                        <div className="truncate">
                          <span className="text-xs font-bold text-white block truncate">{sess.gameTitle}</span>
                          <span className="text-[10px] text-slate-400">{sess.systemName} • {sess.startedAt}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-purple-400">{sess.durationMinutes} min</span>
                          {sess.achievementsUnlockedCount ? (
                            <span className="text-[10px] text-amber-400 block">+{sess.achievementsUnlockedCount} Trophée(s)</span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TEMPS PAR JEU */}
          {selectedView === 'games' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Classement de {playStats.length} jeux avec sessions enregistrées
                </span>
              </div>

              <div className="space-y-2">
                {sortedByTime.map((item, idx) => {
                  const correspondingGame = games.find((g) => g.id === item.gameId);
                  return (
                    <div
                      key={item.gameId}
                      className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between transition group"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-black font-mono shrink-0">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition truncate">
                            {item.gameTitle}
                          </h4>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                            <span>{item.systemName}</span>
                            <span>•</span>
                            <span>{item.sessionCount} sessions</span>
                            <span>•</span>
                            <span>Dernière : {item.lastPlayedAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 shrink-0">
                        <div className="text-right">
                          <span className="text-sm font-black text-cyan-400 block font-mono">
                            {Math.floor(item.playTimeMinutes / 60)}h {(item.playTimeMinutes % 60).toString().padStart(2, '0')}m
                          </span>
                          <span className="text-[10px] text-slate-500">{item.playTimeMinutes} min</span>
                        </div>

                        {correspondingGame && onPlayGame && (
                          <button
                            onClick={() => {
                              onPlayGame(correspondingGame);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 text-xs font-black uppercase tracking-wider transition"
                          >
                            Lancer
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TEMPS PAR CONSOLE */}
          {selectedView === 'systems' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedSystems.map(([sysId, data]) => {
                  const pct = totalMinutes ? Math.round((data.minutes / totalMinutes) * 100) : 0;
                  return (
                    <div key={sysId} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                            <Tv className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-white block">{data.name}</span>
                            <span className="text-[10px] text-slate-400">{data.gameCount} jeux joués</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-cyan-400 block">{Math.round(data.minutes / 60)}h {data.minutes % 60}m</span>
                          <span className="text-[10px] text-slate-500">{pct}% du total</span>
                        </div>
                      </div>

                      {/* Barre de progression visuelle */}
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* HISTORIQUE COMPLET DES SESSIONS */}
          {selectedView === 'history' && (
            <div className="space-y-3">
              {sessions.map((sess) => (
                <div key={sess.id} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{sess.gameTitle}</span>
                      <span className="text-[10px] text-slate-400">{sess.systemName} • {sess.startedAt}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-purple-400 block">{sess.durationMinutes} min de session</span>
                    <span className="text-[10px] text-slate-500">Terminée avec succès</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>Les statistiques se mettent à jour automatiquement à chaque session lancée.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
