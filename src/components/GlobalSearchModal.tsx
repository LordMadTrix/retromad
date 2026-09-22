import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Game, System } from '../types';
import { Search, X, Play, Star, Clock, Gamepad2, ChevronRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  games: Game[];
  systems: System[];
  onClose: () => void;
  onLaunchGame: (game: Game) => void;
  onViewGame: (game: Game) => void;
  onSelectSystem: (systemId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  games,
  systems,
  onClose,
  onLaunchGame,
  onViewGame,
  onSelectSystem,
}) => {
  const [query, setQuery] = useState('');
  const [focusIndex, setFocusIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const systemsMap = useMemo(() => new Map(systems.map((s) => [s.id, s])), [systems]);

  // Réinitialiser l'état à chaque ouverture
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setFocusIndex(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  // Fermeture Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Résultats filtrés
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return games.slice(0, 20);
    return games
      .filter((g) => {
        const sys = systemsMap.get(g.systemId);
        return (
          g.cleanTitle.toLowerCase().includes(q) ||
          g.metadata?.developer?.toLowerCase().includes(q) ||
          g.metadata?.genres?.some((gen) => gen.toLowerCase().includes(q)) ||
          sys?.name.toLowerCase().includes(q) ||
          sys?.shortName.toLowerCase().includes(q)
        );
      })
      .slice(0, 40);
  }, [query, games, systemsMap]);

  // Navigation clavier dans la liste
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[focusIndex]) {
          onLaunchGame(results[focusIndex]);
          onClose();
        }
      }
    },
    [results, focusIndex, onLaunchGame, onClose]
  );

  // Auto-scroll vers l'élément focus
  useEffect(() => {
    const focused = listRef.current?.querySelector(`[data-idx="${focusIndex}"]`) as HTMLElement;
    focused?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [focusIndex]);

  // Réinitialiser le focus quand les résultats changent
  useEffect(() => {
    setFocusIndex(0);
  }, [query]);

  const formatPlayTime = (minutes?: number) => {
    if (!minutes || minutes < 1) return null;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h${m > 0 ? `${m}m` : ''}`;
    return `${m}m`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[8vh] px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Fond sombre scintillant */}
      <div className="absolute inset-0 bg-retro-900/85 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-gradient-to-b from-[#0e1a42] to-[#091230] border-2 border-cyan-300/40 shadow-[0_0_60px_rgba(0,242,254,0.25)] overflow-hidden">
        {/* En-tête Recherche */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-700/70 bg-[#0a1432]/80">
          <Search className="w-5 h-5 text-retro-accent mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher un jeu, une console, un développeur..."
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-base font-medium outline-none"
          />
          <div className="flex items-center space-x-2 shrink-0">
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-mono transition"
            >
              ESC
            </button>
          </div>
        </div>

        {/* Liste des résultats */}
        <div ref={listRef} className="max-h-[65vh] overflow-y-auto arcade-scrollbar">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Gamepad2 className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm font-medium">Aucun résultat pour "{query}"</p>
              <p className="text-xs mt-1 text-slate-600">Vérifiez l'orthographe ou essayez un terme différent</p>
            </div>
          ) : (
            <div className="py-2">
              {/* Titre section */}
              <div className="px-4 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                {query.trim() ? `${results.length} résultat(s)` : 'Jeux récents'}
              </div>

              {results.map((game, idx) => {
                const sys = systemsMap.get(game.systemId);
                const isFocused = idx === focusIndex;
                const playTime = formatPlayTime(game.playTimeMinutes);

                return (
                  <div
                    key={game.id}
                    data-idx={idx}
                    onClick={() => setFocusIndex(idx)}
                    onDoubleClick={() => { onLaunchGame(game); onClose(); }}
                    className={`flex items-center px-4 py-3 cursor-pointer transition-all group ${
                      isFocused
                        ? 'bg-retro-accent/15 border-l-2 border-retro-accent'
                        : 'border-l-2 border-transparent hover:bg-slate-800/60'
                    }`}
                  >
                    {/* Jaquette miniature ou badge console */}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 shrink-0 text-white font-bold text-xs border"
                      style={{
                        backgroundColor: `${sys?.themeColor || '#00f2fe'}22`,
                        borderColor: `${sys?.themeColor || '#00f2fe'}55`,
                        color: sys?.themeColor || '#00f2fe',
                      }}
                    >
                      {sys?.shortName?.substring(0, 3) || '?'}
                    </div>

                    {/* Infos jeu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-bold truncate ${isFocused ? 'text-retro-accent' : 'text-slate-100 group-hover:text-white'}`}>
                          {game.cleanTitle}
                        </span>
                        {game.favorite && (
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-current shrink-0" />
                        )}
                        {playTime && (
                          <span className="flex items-center text-[10px] text-emerald-400 font-mono shrink-0">
                            <Clock className="w-2.5 h-2.5 mr-0.5" />
                            {playTime}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSystem(game.systemId);
                            onClose();
                          }}
                          title={`Filtrer par console : ${sys?.name || game.systemId}`}
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono hover:opacity-80 transition cursor-pointer"
                          style={{ backgroundColor: `${sys?.themeColor || '#00f2fe'}22`, color: sys?.themeColor || '#00f2fe' }}
                        >
                          {sys?.shortName || game.systemId}
                        </button>
                        {game.metadata?.developer && (
                          <span className="text-[11px] text-slate-400 truncate">{game.metadata.developer}</span>
                        )}
                        {game.playCount > 0 && (
                          <span className="text-[10px] text-slate-500 font-mono ml-auto shrink-0">×{game.playCount}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions rapides */}
                    <div className={`flex items-center space-x-1.5 ml-3 shrink-0 transition-opacity ${isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewGame(game);
                          onClose();
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition text-xs"
                        title="Voir les détails"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLaunchGame(game);
                          onClose();
                        }}
                        className="p-1.5 rounded-lg bg-retro-accent/20 border border-retro-accent/60 text-retro-accent hover:bg-retro-accent/30 transition"
                        title="Lancer le jeu (Entrée)"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pied de page - Raccourcis */}
        <div className="px-4 py-2.5 border-t border-slate-700/60 bg-[#060f26]/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-400">↑↓</kbd>
              <span>Naviguer</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-400">Entrée</kbd>
              <span>Lancer</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-400">ESC</kbd>
              <span>Fermer</span>
            </span>
          </div>
          <span className="text-slate-600 font-mono">{games.length} jeux indexés</span>
        </div>
      </div>
    </div>
  );
};
