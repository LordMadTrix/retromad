import React, { useState, useMemo, useEffect } from 'react';
import { Game, System } from '../types';
import { GameCard } from './GameCard';
import { Search, SlidersHorizontal, FolderPlus, Dices, X, Upload, Tag } from 'lucide-react';
import { scanFilesList } from '../services/romScanner';

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
  onAddGames?: (games: Game[]) => void;
  selectedGenre?: string;
  onSelectGenre?: (genre: string) => void;
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
  onAddGames,
  selectedGenre: selectedGenreProp,
  onSelectGenre: onSelectGenreProp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [collection, setCollection] = useState<Collection>('all');
  const [internalGenre, setInternalGenre] = useState<string>('all');
  const selectedGenre = selectedGenreProp !== undefined ? selectedGenreProp : internalGenre;
  const setSelectedGenre = (g: string) => {
    setInternalGenre(g);
    onSelectGenreProp?.(g);
  };
  const [sortBy, setSortBy] = useState<'alpha' | 'recent' | 'played'>('alpha');
  const [isDragOver, setIsDragOver] = useState(false);

  const systemsMap = useMemo(() => {
    return new Map(systems.map((s) => [s.id, s]));
  }, [systems]);

  const selectedSystem = selectedSystemId ? systemsMap.get(selectedSystemId) : undefined;

  // Extraire dynamiquement les genres disponibles pour la console sélectionnée (ou tous les jeux)
  const availableGenres = useMemo(() => {
    const genreCountMap = new Map<string, number>();

    games.forEach((game) => {
      if (selectedSystemId && game.systemId !== selectedSystemId) return;

      const rawGenres = game.metadata?.genres;
      if (rawGenres && Array.isArray(rawGenres) && rawGenres.length > 0) {
        rawGenres.forEach((g) => {
          if (!g) return;
          const parts = g.split(/[/,]/).map((p) => p.trim()).filter(Boolean);
          parts.forEach((part) => {
            const normalized = part.charAt(0).toUpperCase() + part.slice(1);
            genreCountMap.set(normalized, (genreCountMap.get(normalized) || 0) + 1);
          });
        });
      }
    });

    return Array.from(genreCountMap.entries())
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => a.genre.localeCompare(b.genre, 'fr'));
  }, [games, selectedSystemId]);

  // Si le genre sélectionné n'existe plus lors d'un changement de console, réinitialiser à 'all'
  useEffect(() => {
    if (selectedGenre !== 'all') {
      const exists = availableGenres.some((g) => g.genre.toLowerCase() === selectedGenre.toLowerCase());
      if (!exists) {
        setSelectedGenre('all');
      }
    }
  }, [selectedSystemId, availableGenres, selectedGenre]);

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    collection !== 'all' ||
    sortBy !== 'alpha' ||
    selectedGenre !== 'all';

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
        // Filtre par genre
        if (selectedGenre !== 'all') {
          const target = selectedGenre.toLowerCase();
          const matchGenre = game.metadata?.genres?.some((g) =>
            g.toLowerCase().includes(target)
          );
          if (!matchGenre) return false;
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
  }, [games, selectedSystemId, collection, selectedGenre, searchTerm, sortBy]);

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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    const fileEntries: { file: File; fullPath: string }[] = [];
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      const f = e.dataTransfer.files[i];
      fileEntries.push({ file: f, fullPath: f.name });
    }

    const { added } = await scanFilesList(fileEntries, selectedSystemId || undefined);
    if (added.length > 0 && onAddGames) {
      onAddGames(added);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className="relative flex-1 flex flex-col overflow-hidden bg-slate-950/80"
    >
      {/* Overlay Drag & Drop */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-cyan-950/85 backdrop-blur-sm border-4 border-dashed border-cyan-400 flex flex-col items-center justify-center p-8 pointer-events-none animate-in fade-in duration-150">
          <Upload className="w-16 h-16 text-cyan-400 animate-bounce mb-3" />
          <h3 className="text-xl font-black text-white">Déposez vos ROMs ici</h3>
          <p className="text-sm text-cyan-300 mt-1">Ajout instantané à votre ludothèque RetroMAD</p>
        </div>
      )}

      {/* ── Barre d'outils compacte ── */}
      <div className="border-b border-slate-800 px-4 py-2.5 bg-slate-900/95 backdrop-blur shrink-0">

        {/* Ligne 1 : titre + badge + barre de recherche et actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          {/* Bloc Gauche : console + recherche */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-[240px]">
            {/* Indicateur couleur console */}
            <div
              className="w-1 h-7 rounded-full shrink-0"
              style={{ backgroundColor: selectedSystem?.themeColor || '#00f2fe' }}
            />
            {/* Titre & compteur */}
            <div className="min-w-0 shrink-0">
              <h2 className="text-sm font-bold text-slate-100 leading-tight truncate max-w-[160px] sm:max-w-[220px]">
                {selectedSystem ? selectedSystem.shortName : 'Toutes les consoles'}
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                {filteredGames.length} jeu{filteredGames.length > 1 ? 'x' : ''}
              </p>
            </div>

            {/* Recherche locale */}
            <div className="relative flex-1 max-w-xs min-w-[140px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un jeu…"
                aria-label="Rechercher un jeu ou un studio"
                className="w-full bg-slate-950/70 border border-slate-700/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-retro-accent/60 focus:ring-1 focus:ring-retro-accent/20 transition"
              />
            </div>
          </div>

          {/* Bloc Droit : Filtres & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Filtre par Genre */}
            <div
              className={`flex items-center gap-1.5 border rounded-lg px-2 py-1.5 text-xs shrink-0 transition ${
                selectedGenre !== 'all'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_8px_rgba(0,242,254,0.25)]'
                  : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-slate-600'
              }`}
            >
              <Tag className={`w-3 h-3 ${selectedGenre !== 'all' ? 'text-cyan-400' : 'text-slate-400'}`} />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                aria-label="Filtrer les jeux par genre"
                className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-xs max-w-[130px] truncate"
              >
                <option value="all" className="bg-slate-900 text-slate-200">
                  Tous genres {availableGenres.length > 0 ? `(${availableGenres.length})` : ''}
                </option>
                {availableGenres.map(({ genre, count }) => (
                  <option key={genre} value={genre} className="bg-slate-900 text-slate-200">
                    {genre} ({count})
                  </option>
                ))}
              </select>
            </div>

            {/* Tri */}
            <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 rounded-lg px-2 py-1.5 text-slate-400 text-xs shrink-0">
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

            {/* Ajouter des ROMs */}
            <button
              onClick={onScanPrompt}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300 hover:text-white text-xs font-semibold transition shrink-0"
              title="Ajouter ou scanner des ROMs"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ajouter ROMs</span>
            </button>

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
                onClick={() => {
                  setSearchTerm('');
                  setCollection('all');
                  setSortBy('alpha');
                  setSelectedGenre('all');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
                title="Réinitialiser les filtres"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
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
                onFilterByGenre={setSelectedGenre}
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
                  setSelectedGenre('all');
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
