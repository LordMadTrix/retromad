import React, { useState, useEffect } from 'react';
import { Search, Sparkles, X, Check, Globe, HelpCircle, Loader2 } from 'lucide-react';
import { Game, ScrapeCandidate } from '../types';

interface ScrapeCandidateModalProps {
  isOpen: boolean;
  game: Game | null;
  candidates: ScrapeCandidate[];
  isSearching: boolean;
  isApplying: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  onSelectCandidate: (candidate: ScrapeCandidate) => void;
}

export const ScrapeCandidateModal: React.FC<ScrapeCandidateModalProps> = ({
  isOpen,
  game,
  candidates,
  isSearching,
  isApplying,
  onClose,
  onSearch,
  onSelectCandidate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<ScrapeCandidate | null>(null);

  useEffect(() => {
    if (game) {
      setSearchQuery(game.cleanTitle || game.title || '');
      setSelectedCandidate(null);
    }
  }, [game]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape' && !isApplying) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isApplying, onClose]);

  if (!isOpen || !game) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (score >= 50) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  };

  const getRegionEmoji = (region?: string) => {
    switch (region?.toLowerCase()) {
      case 'france':
        return '🇫🇷 France';
      case 'europe':
        return '🇪🇺 Europe';
      case 'usa':
        return '🇺🇸 USA';
      case 'japon':
      case 'japan':
        return '🇯🇵 Japon';
      default:
        return '🌍 ' + (region || 'Monde');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900/95 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/50 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 shadow-inner">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                Correspondances suggérées pour le jeu
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Jeu actuel : <span className="text-cyan-300 font-semibold">{game.cleanTitle || game.title}</span>
                {game.filename && (
                  <span className="text-slate-500 ml-2 text-xs">({game.filename})</span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isApplying}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="p-4 bg-slate-900 border-b border-slate-800/80">
          <form onSubmit={handleFormSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tapez un mot-clé pour chercher d'autres titres..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-700 hover:border-slate-600 focus:border-cyan-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isSearching || isApplying}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition shadow-lg shadow-cyan-600/20 disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recherche...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Rechercher</span>
                </>
              )}
            </button>
          </form>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Si le nom exact de votre ROM ne donne rien, tapez les premiers mots du titre officiel.
            </span>
          </p>
        </div>

        {/* Liste des candidats */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px] max-h-[55vh]">
          {isApplying ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
              <div>
                <h3 className="text-lg font-bold text-white">Téléchargement complet en cours...</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Récupération des jaquettes, capture, vidéo MP4, livret PDF et métadonnées pour « {selectedCandidate?.cleanTitle || selectedCandidate?.title} »
                </p>
              </div>
            </div>
          ) : isSearching ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
              <p className="text-slate-400 text-sm">Recherche des correspondances dans la base...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-3 text-slate-500">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-slate-200">Aucun titre ressemblant trouvé</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Essayez de modifier la recherche avec un nom plus général ou supprimez les mentions spéciales (ex: tapez « Mario » au lieu de « Super Mario World Hack »).
              </p>
            </div>
          ) : (
            candidates.map((cand, idx) => (
              <div
                key={`${cand.title}-${idx}`}
                className="group p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
              >
                {/* Visuel et infos */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Miniature Boxart */}
                  <div className="w-14 h-18 sm:w-16 sm:h-20 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center shadow-inner">
                    {cand.boxartUrl ? (
                      <img
                        src={cand.boxartUrl}
                        alt={cand.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        loading="lazy"
                        onError={(e) => {
                          // Remplacement visuel si image CDN indisponible
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono text-center px-1">
                        SANS VISUEL
                      </span>
                    )}
                  </div>

                  {/* Titre & Badges */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {cand.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {/* Badge Score de ressemblance */}
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getScoreBadgeClass(
                          cand.score
                        )}`}
                      >
                        {cand.score}% de correspondance
                      </span>

                      {/* Badge Région */}
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-300 border border-slate-600/50 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-400" />
                        {getRegionEmoji(cand.region)}
                      </span>

                      {/* Badge Source */}
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {cand.source === 'libretro' ? 'Libretro DB' : cand.source === 'screenscraper' ? 'ScreenScraper' : 'Local'}
                      </span>

                      {cand.extra?.year && (
                        <span className="text-[11px] text-slate-400">
                          {cand.extra.year}
                        </span>
                      )}
                      {cand.extra?.developer && (
                        <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
                          • {cand.extra.developer}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bouton d'action */}
                <button
                  onClick={() => {
                    setSelectedCandidate(cand);
                    onSelectCandidate(cand);
                  }}
                  disabled={isApplying}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-cyan-600/20 hover:shadow-cyan-500/40 transition active:scale-95 flex-shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Choisir ce jeu</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Pied de page */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <div>
            {candidates.length > 0 && !isSearching && !isApplying && (
              <span>
                {candidates.length} suggestion{candidates.length > 1 ? 's' : ''} trouvée{candidates.length > 1 ? 's' : ''} classée{candidates.length > 1 ? 's' : ''} par ressemblance.
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isApplying}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
