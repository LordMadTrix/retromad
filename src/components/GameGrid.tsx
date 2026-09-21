import React, { useState, useMemo } from 'react';
import { Game, System } from '../types';
import { GameCard } from './GameCard';
import { Search, Heart, SlidersHorizontal, FolderPlus, Dices, X } from 'lucide-react';

interface GameGridProps {
  games: Game[];
  systems: System[];
  selectedGameId: string | null;
  onSelectGame: (game: Game) => void;
  onLaunchGame: (game: Game) => void;
  onToggleFavorite: (gameId: string) => void;
  onViewDetails: (game: Game) => void;
  onScanPrompt: () => void;
  selectedSystemId: string | null;
  onPlayDice?: () => void;
}

export const GameGrid: React.FC<GameGridProps> = ({
  games,
  systems,
  selectedGameId,
  onSelectGame,
  onLaunchGame,
  onToggleFavorite,
  onViewDetails,
  onScanPrompt,
  selectedSystemId,
  onPlayDice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'alpha' | 'recent' | 'played'>('alpha');

  const systemsMap = useMemo(() => {
    return new Map(systems.map((s) => [s.id, s]));
  }, [systems]);

  const selectedSystem = selectedSystemId ? systemsMap.get(selectedSystemId) : undefined;
  const hasActiveFilters = Boolean(searchTerm.trim()) || favoritesOnly || sortBy !== 'alpha';

  // Filtrage et tri des jeux
  const filteredGames = useMemo(() => {
    return games
      .filter((game) => {
        // Filtre par console
        if (selectedSystemId && game.systemId !== selectedSystemId) {
          return false;
        }
        // Filtre favoris
        if (favoritesOnly && !game.favorite) {
          return false;
        }
        // Recherche textuelle
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchTitle = game.cleanTitle.toLowerCase().includes(term);
          const matchDev = game.metadata?.developer?.toLowerCase().includes(term);
          const matchGenre = game.metadata?.genres?.some((g) => g.toLowerCase().includes(term));
          return matchTitle || matchDev || matchGenre;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'played') {
          return (b.playCount || 0) - (a.playCount || 0);
        }
        if (sortBy === 'recent') {
          return (b.lastPlayed || '').localeCompare(a.lastPlayed || '');
        }
        return a.cleanTitle.localeCompare(b.cleanTitle);
      });
  }, [games, selectedSystemId, favoritesOnly, searchTerm, sortBy]);

  const handleRandomPick = () => {
    if (filteredGames.length === 0) return;
    onPlayDice?.();
    const randomIndex = Math.floor(Math.random() * filteredGames.length);
    const chosen = filteredGames[randomIndex];
    onSelectGame(chosen);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#111d43]/55">
      {/* Barre d'outils, recherche et filtres */}
      <div className="border-b border-cyan-300/25 px-4 lg:px-6 py-3 bg-gradient-to-r from-[#132555]/95 via-[#1e3575]/90 to-[#2c1b60]/90 backdrop-blur shrink-0">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-1 h-9 rounded-full shrink-0"
              style={{ backgroundColor: selectedSystem?.themeColor || '#00f2fe' }}
            />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 font-bold">
                Bibliothèque
              </p>
              <h2 className="text-sm font-bold text-slate-100 truncate">
                {selectedSystem ? selectedSystem.name : 'Toutes les consoles'}
                <span className="ml-2 text-xs font-normal text-slate-400">
                  {filteredGames.length} résultat{filteredGames.length > 1 ? 's' : ''}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un jeu, un studio..."
                aria-label="Rechercher un jeu ou un studio"
                className="w-full bg-[#0b1534]/75 border border-cyan-200/30 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-retro-accent focus:ring-1 focus:ring-retro-accent/30 transition"
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFavoritesOnly(false);
                  setSortBy('alpha');
                }}
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Réinitialiser les filtres"
              >
                <X className="w-3.5 h-3.5" />
                <span>Réinitialiser</span>
              </button>
            )}
          </div>
        </div>

        {/* Options de tri et favoris */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
          {/* Bouton Jeu au Hasard */}
          <button
            onClick={handleRandomPick}
            disabled={filteredGames.length === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-white transition disabled:opacity-40 shadow-sm"
            title="Choisir un jeu au hasard parmi cette sélection"
          >
            <Dices className="w-3.5 h-3.5 text-amber-400" />
            <span>Surprenez-moi !</span>
          </button>

          {/* Bouton Favoris Only */}
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition ${
              favoritesOnly
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                : 'bg-slate-800/50 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-current' : ''}`} />
            <span>Favoris ({games.filter((g) => g.favorite).length})</span>
          </button>

          {/* Sélecteur de tri */}
          <div className="flex items-center space-x-1.5 bg-slate-800/50 border border-slate-700/60 rounded-xl px-2.5 py-1.5 text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="alpha" className="bg-retro-800">Ordre alphabétique</option>
              <option value="played" className="bg-retro-800">Plus joués</option>
              <option value="recent" className="bg-retro-800">Récemment joués</option>
            </select>
          </div>

        </div>
      </div>

      {/* Conteneur Grille des jeux avec défilement fluide */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                system={systemsMap.get(game.systemId)}
                isSelected={selectedGameId === game.id}
                onSelect={onSelectGame}
                onLaunch={onLaunchGame}
                onToggleFavorite={onToggleFavorite}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        ) : (
          /* État vide : aucun jeu trouvé ou bibliothèque vide */
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-3xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-500 mb-4 shadow-inner">
              <FolderPlus className="w-10 h-10 text-retro-accent/60" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">
              {games.length === 0
                ? 'Aucune ROM détectée'
                : 'Aucun jeu ne correspond à vos critères'}
            </h3>
            <p className="text-sm text-slate-400 max-w-md mt-1 mb-6">
              {games.length === 0
                ? 'Placez vos ROMs dans votre dossier ou configurez le chemin dans les paramètres pour commencer.'
                : `Aucun titre ne correspond à la sélection${selectedSystem ? ` ${selectedSystem.shortName}` : ''}. Modifiez votre recherche ou réinitialisez les filtres.`}
            </p>

            {games.length === 0 && (
              <button
                onClick={onScanPrompt}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-retro-accent to-blue-600 text-retro-900 font-bold text-sm shadow-neon hover:scale-105 active:scale-95 transition"
              >
                <FolderPlus className="w-4 h-4 text-retro-900" />
                <span>Configurer et scanner mes ROMs</span>
              </button>
            )}
            {games.length > 0 && hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFavoritesOnly(false);
                  setSortBy('alpha');
                }}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-600 text-slate-200 hover:bg-slate-800 transition text-sm font-semibold"
              >
                <X className="w-4 h-4" />
                <span>Réinitialiser les filtres</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
