import React from 'react';
import { Sparkles, CheckCircle2, Loader2, X } from 'lucide-react';

interface ScraperModalProps {
  isOpen: boolean;
  total: number;
  current: number;
  currentGameTitle: string;
  isComplete: boolean;
  onClose: () => void;
}

export const ScraperModal: React.FC<ScraperModalProps> = ({
  isOpen,
  total,
  current,
  currentGameTitle,
  isComplete,
  onClose,
}) => {
  if (!isOpen) return null;

  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-retro-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-retro-pink to-retro-purple flex items-center justify-center text-white shadow-neon-pink">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {isComplete ? 'Scraping terminé !' : 'Récupération automatique des jaquettes'}
            </h3>
          </div>

          {isComplete && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Barre de progression */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Progression globale</span>
            <span className="font-mono text-retro-accent font-bold">
              {current} / {total} ({percentage}%)
            </span>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
            <div
              className="h-full bg-gradient-to-r from-retro-accent via-retro-purple to-retro-pink rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Détail du jeu en cours de traitement */}
        {!isComplete ? (
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 flex items-center space-x-3 mb-6">
            <Loader2 className="w-5 h-5 text-retro-accent animate-spin shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                Téléchargement en cours :
              </span>
              <span className="text-xs font-bold text-white truncate block">
                {currentGameTitle || 'Recherche des médias...'}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/30 flex items-center space-x-3 mb-6 text-emerald-300">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs font-bold block">
                Toutes les jaquettes et métadonnées ont été synchronisées.
              </span>
              <span className="text-[11px] text-emerald-400/80 block mt-0.5">
                Vos médias sont stockés localement et disponibles hors-ligne.
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            disabled={!isComplete}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition shadow ${
              isComplete
                ? 'bg-retro-accent text-retro-900 shadow-neon hover:scale-105 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isComplete ? 'Fermer et explorer les jeux' : 'Scraping en cours...'}
          </button>
        </div>
      </div>
    </div>
  );
};
