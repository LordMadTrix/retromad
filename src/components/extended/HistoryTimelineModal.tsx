import React, { useState } from 'react';
import {
  X,
  History,
  Calendar,
  Sparkles,
  Gamepad2,
  Tv,
  ArrowRight,
  Flame,
  BookOpen,
} from 'lucide-react';
import { HistoricalMilestone } from '../../types/extendedFeatures';
import { Game } from '../../types';

interface HistoryTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestones: HistoricalMilestone[];
  games: Game[];
  onPlayGame?: (game: Game) => void;
  onPlaySound?: (type: 'coin' | 'powerup' | 'fanfare') => void;
}

export const HistoryTimelineModal: React.FC<HistoryTimelineModalProps> = ({
  isOpen,
  onClose,
  milestones,
  games,
  onPlayGame,
  onPlaySound,
}) => {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>(milestones[0]?.id || '');
  const [selectedDecade, setSelectedDecade] = useState<'all' | '80s' | '90s' | '00s'>('all');

  if (!isOpen) return null;

  const filteredMilestones = milestones.filter((m) => {
    if (selectedDecade === '80s') return m.year >= 1980 && m.year < 1990;
    if (selectedDecade === '90s') return m.year >= 1990 && m.year < 2000;
    if (selectedDecade === '00s') return m.year >= 2000;
    return true;
  });

  const activeMilestone = milestones.find((m) => m.id === selectedMilestoneId) || milestones[0];

  // Jeux de la collection associés à l'ère
  const matchingGames = games.filter((g) => {
    if (activeMilestone?.highlightGameTitles?.some((title) => g.title.toLowerCase().includes(title.toLowerCase()))) {
      return true;
    }
    if (g.year && Math.abs(g.year - activeMilestone.year) <= 1) {
      return true;
    }
    return false;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-950 border border-amber-500/40 rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black tracking-wider text-white uppercase">
                  Musée Rétro & Frise Chronologique
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase">
                  Histoire 1980 ➔ 2005
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Revivez les tournants technologiques majeurs, la guerre des consoles et l'essor des salles d'arcade.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filtre par décennie */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/40 text-xs">
          <div className="flex items-center space-x-2">
            {[
              { id: 'all', label: 'Toute la Frise' },
              { id: '80s', label: 'Années 80 (L\'Éveil & Krach)' },
              { id: '90s', label: 'Années 90 (Guerre 16-Bit & 3D)' },
              { id: '00s', label: 'Années 2000 (Maturité & Écran Plat)' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDecade(d.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  selectedDecade === d.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
            {filteredMilestones.length} Événements Historiques Référencés
          </span>
        </div>

        {/* Corps principal : Timeline horizontale + Fiche détaillée */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
          
          {/* Ruban horizontal des années */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center space-x-4 overflow-x-auto no-scrollbar pb-3">
            {filteredMilestones.map((m) => {
              const isSelected = m.id === selectedMilestoneId;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMilestoneId(m.id);
                    if (onPlaySound) onPlaySound('powerup');
                  }}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center shrink-0 w-36 transition text-center ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-white font-bold scale-105 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className={`text-lg font-black font-mono block ${isSelected ? 'text-amber-400' : 'text-slate-300'}`}>
                    {m.year}
                  </span>
                  <span className="text-[11px] font-bold line-clamp-1 mt-0.5">
                    {m.title.split(':')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Fiche détaillée de l'événement sélectionné */}
          {activeMilestone && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
              
              {/* Récit Historique (8 cols) */}
              <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-sm font-black font-mono">
                    ANNÉE {activeMilestone.year}
                  </span>
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                    Catégorie : {activeMilestone.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-white">
                    {activeMilestone.title}
                  </h3>
                  <p className="text-sm font-bold text-amber-400/90 mt-1 italic">
                    « {activeMilestone.tagline} »
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 leading-relaxed space-y-2">
                  <p>{activeMilestone.description}</p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/30 to-slate-950 border border-amber-500/20 text-xs text-amber-200 space-y-1">
                  <span className="font-black uppercase tracking-wider block text-amber-400">
                    💡 Pourquoi cet événement est légendaire :
                  </span>
                  <p className="text-slate-300">
                    Il a redéfini les standards de l'industrie du jeu vidéo et posé les briques sur lesquelles les consoles modernes fonctionnent encore aujourd'hui.
                  </p>
                </div>
              </div>

              {/* Jeux de la Collection Disponibles (4 cols) */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
                    <Gamepad2 className="w-4 h-4 text-cyan-400" />
                    <span>Dans votre collection ({matchingGames.length})</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Jeux correspondants à cette époque prêts à être lancés.
                  </p>

                  <div className="space-y-2 mt-3 max-h-60 overflow-y-auto pr-1">
                    {matchingGames.length > 0 ? (
                      matchingGames.map((game) => (
                        <div
                          key={game.id}
                          className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2"
                        >
                          <div className="truncate">
                            <span className="text-xs font-bold text-white block truncate">{game.title}</span>
                            <span className="text-[10px] text-slate-400">{game.year || activeMilestone.year}</span>
                          </div>

                          {onPlayGame && (
                            <button
                              onClick={() => {
                                onPlayGame(game);
                                onClose();
                              }}
                              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 text-[10px] font-black uppercase tracking-wider transition shrink-0"
                            >
                              Jouer
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-950/60 text-center text-xs text-slate-500">
                        Aucun jeu de cette année précise dans votre bibliothèque actuelle.
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span>Explorez l'évolution du jeu</span>
                  <span className="text-amber-400 font-bold">1980 - 2005</span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>Une immersion historique dans la création des plus grands chefs-d'œuvre.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Fermer le Musée
          </button>
        </div>

      </div>
    </div>
  );
};
