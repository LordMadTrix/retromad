import React, { useState, useMemo } from 'react';
import { Game, System } from '../types';
import { GameCard } from './GameCard';
import { Search, SlidersHorizontal, FolderPlus, Dices, X } from 'lucide-react';

type Collection = 'all' | 'favorites' | 'recent' | 'topplayed' | 'gems' | 'multiplayer';

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
  onOpenRoulette?: () => void;
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
  onOpenRoulette,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [collection, setCollection] = useState<Collection>('all');
  const [sortBy, setSortBy] = useState<'alpha' | 'recent' | 'played'>('alpha');

  const systemsMap = useMemo(() => {
    return new Map(systems.map((s) => [s.id, s]));
  }, [systems]);

  const selectedSystem = selectedSystemId ? systemsMap.get(selectedSystemId) : undefined;
  const hasActiveFilters = Boolean(searchTerm.trim()) || collection !== 'all' || sortBy !== 'alpha';

  // Filtrage et tri des jeux
  const filteredGames = useMemo(() => {
    return games
      .filter((game) => {
        // Filtre par console
        if (selectedSystemId && game.systemId !== selectedSystemId) {
          return false;
        }
        // Filtre par collection
        if (collection === 'favorites' && !game.favorite) return false;
        if (collection === 'recent' && !game.lastPlayed) return false;
        if (collection === 'topplayed' && game.playCount < 1) return false;
        if (collection === 'gems' && (!game.metadata?.rating || game.metadata.rating < 80)) return false;
        if (collection === 'multiplayer') {
          const isMulti =
            parseInt(String(game.metadata?.players || '1'), 10) > 1 ||
            game.metadata?.genres?.some((g) =>
              /combat|fight|course|race|versus|party|sport/i.test(g)
            );
          if (!isMulti) return false;
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
        if (collection === 'topplayed' || sortBy === 'played') {
          return (b.playCount || 0) - (a.playCount || 0);
        }
        if (collection === 'recent' || sortBy === 'recent') {
          return (b.lastPlayed || '').localeCompare(a.lastPlayed || '');
        }
        if (collection === 'gems') {
          return (b.metadata?.rating || 0) - (a.metadata?.rating || 0);
        }
        return a.cleanTitle.localeCompare(b.cleanTitle);
      });
  }, [games, selectedSystemId, collection, searchTerm, sortBy]);

  const handleRandomPick = () => {
    if (onOpenRoulette) {
      onOpenRoulette();
      return;
    }
    if (filteredGames.length === 0) return;
    onPlayDice?.();
    const randomIndex = Math.floor(Math.random() * filteredGames.length);
    const chosen = filteredGames[randomIndex];
    onSelectGame(chosen);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0a1230]/80">
      {/* ── Barre d'outils compacte ── */}
      <div className="border-b border-cyan-300/20 px-4 py-2.5 bg-gradient-to-r from-[#0f1e47]/98 via-[#172d6d]/95 to-[#1e1450]/95 backdrop-blur shrink-0">

        {/* Ligne 1 : titre + badge + barre de recherche */}
        <div className="flex items-center gap-3">
          {/* Indicateur couleur console */}
          <div
            className="w-0.5 h-7 rounded-full shrink-0"
            style={{ backgroundColor: selectedSystem?.themeColor || '#00f2fe' }}
          />
          {/* Titre & compteur */}
          <div className="min-w-0 shrink-0">
            <h2 className="text-sm font-bold text-slate-100 leading-tight truncate max-w-[200px]">
              {selectedSystem ? selectedSystem.shortName : 'Toutes les consoles'}
            </h2>
            <p className="text-[10px] text-slate-500 font-mono">
              {filteredGames.length} jeu{filteredGames.length > 1 ? 'x' : ''}
            </p>
          </div>

          {/* Recherche locale (flex-1) */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher…"
              aria-label="Rechercher un jeu ou un studio"
              className="w-full bg-[#0b1534]/80 border border-slate-700/50 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-retro-accent/60 focus:ring-1 focus:ring-retro-accent/20 transition"
            />
          </div>

          {/* Tri */}
          <div className="flex items-center gap-1.5 bg-slate-800/50 border border-slate-700/40 rounded-lg px-2 py-1.5 text-slate-400 text-xs shrink-0">
            <SlidersHorizontal className="w-3 h-3" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-xs"
            >
              <option value="alpha" className="bg-slate-900">A → Z</option>
              <option value="played" className="bg-slate-900">Plus joués</option>
              <option value="recent" className="bg-slate-900">Récents</option>
            </select>
          </div>

          {/* Jeu au hasard */}
          <button
            onClick={handleRandomPick}
            disabled={filteredGames.length === 0}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 hover:text-white text-xs font-semibold transition disabled:opacity-40 shrink-0"
            title="Jeu au hasard"
          >
            <Dices className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Surprise</span>
          </button>

          {/* Reset filtres */}
          {hasActiveFilters && (
            <button
              onClick={() => { setSearchTerm(''); setCollection('all'); setSortBy('alpha'); }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition shrink-0"
              title="Réinitialiser les filtres"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Ligne 2 : Collections Pills */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar pb-0.5">
          {([
            { id: 'all', label: 'Tous', emoji: '🎮', count: games.filter(g => !selectedSystemId || g.systemId === selectedSystemId).length },
            { id: 'favorites', label: 'Favoris', emoji: '⭐', count: games.filter(g => g.favorite && (!selectedSystemId || g.systemId === selectedSystemId)).length },
            { id: 'recent', label: 'Récents', emoji: '🕒', count: games.filter(g => g.lastPlayed && (!selectedSystemId || g.systemId === selectedSystemId)).length },
            { id: 'topplayed', label: 'Top Joués', emoji: '🔥', count: games.filter(g => g.playCount > 0 && (!selectedSystemId || g.systemId === selectedSystemId)).length },
            { id: 'gems', label: 'Pépites', emoji: '🏆', count: games.filter(g => (g.metadata?.rating || 0) >= 80 && (!selectedSystemId || g.systemId === selectedSystemId)).length },
            { id: 'multiplayer', label: 'Multijoueur', emoji: '👥', count: games.filter(g => (!selectedSystemId || g.systemId === selectedSystemId) && (parseInt(String(g.metadata?.players || '1'), 10) > 1 || g.metadata?.genres?.some(x => /combat|fight|course|race|versus|party|sport/i.test(x)))).length },
          ] as const).map((col) => (
            <button
              key={col.id}
              onClick={() => setCollection(col.id as Collection)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                collection === col.id
                  ? 'bg-retro-accent/20 text-retro-accent border-retro-accent/50 shadow-[0_0_8px_rgba(0,242,254,0.18)]'
                  : 'bg-slate-800/40 text-slate-400 border-slate-700/40 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              <span>{col.emoji}</span>
              <span>{col.label}</span>
              <span className="text-[10px] font-mono opacity-50">({col.count})</span>
            </button>
          ))}
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
                  setCollection('all');
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
