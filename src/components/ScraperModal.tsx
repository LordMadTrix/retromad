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
    <div className="retromad-modal-overlay">
      <div className="retromad-modal-card max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {isComplete ? 'Scraping terminé !' : 'Récupération automatique des jaquettes'}
            </h3>
          </div>

          {isComplete && (
            <button
              onClick={onClose}
              className="retromad-modal-close-btn"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Barre de progression */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Progression globale</span>
            <span className="font-mono text-cyan-400 font-bold">
              {current} / {total} ({percentage}%)
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Détail du jeu en cours de traitement */}
        {!isComplete ? (
          <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800 flex items-center space-x-3 mb-6">
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                Téléchargement en cours :
              </span>
              <span className="text-xs font-bold text-white truncate block">
                {currentGameTitle || 'Recherche des médias...'}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-500/10 rounded-xl p-3.5 border border-emerald-500/30 flex items-center space-x-3 mb-6 text-emerald-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
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
            className={
              isComplete
                ? 'retromad-btn-primary'
                : 'px-4 py-2 rounded-xl bg-slate-800/60 text-slate-500 text-xs font-semibold cursor-not-allowed border border-slate-700/40'
            }
          >
            {isComplete ? 'Fermer et explorer les jeux' : 'Scraping en cours...'}
          </button>
        </div>
      </div>
    </div>
  );
};
