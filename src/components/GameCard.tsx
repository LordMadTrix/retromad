import React, { useEffect, useState } from 'react';
import { Game, System } from '../types';
import { Heart, Play, Eye } from 'lucide-react';
import { resolveMediaUrl } from '../utils/media';

interface GameCardProps {
  game: Game;
  system?: System;
  isSelected?: boolean;
  onSelect: (game: Game) => void;
  onLaunch: (game: Game) => void;
  onToggleFavorite: (gameId: string) => void;
  onViewDetails: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  system,
  isSelected,
  onSelect,
  onLaunch,
  onToggleFavorite,
  onViewDetails,
}) => {
  const [isBoxartUnavailable, setIsBoxartUnavailable] = useState(false);

  useEffect(() => {
    setIsBoxartUnavailable(false);
  }, [game.media?.boxart2d]);

  const getRegionBadge = (region?: string) => {
    switch (region) {
      case 'France':
        return '🇫🇷';
      case 'Europe':
        return '🇪🇺';
      case 'USA':
        return '🇺🇸';
      case 'Japan':
        return '🇯🇵';
      case 'World':
        return '🌐';
      default:
        return null;
    }
  };

  // Convertir l'URL du média (Web ou protocole sécurisé Electron)
  const boxartUrl = resolveMediaUrl(game.media?.boxart2d) || null;

  return (
    <div
      onClick={() => onSelect(game)}
      className={`arcade-card group relative flex flex-col rounded-2xl overflow-hidden bg-retro-800/70 border transition-all duration-200 cursor-pointer select-none ${
        isSelected
          ? 'border-retro-accent shadow-[0_0_20px_rgba(0,242,254,0.45)] scale-[1.03] z-10'
          : 'border-blue-300/20 hover:border-cyan-300/80 hover:shadow-[0_0_18px_rgba(0,242,254,0.24)] hover:scale-[1.02]'
      }`}
    >
      {/* Zone Jaquette / Image */}
      <div className="relative aspect-[3/4] w-full bg-gradient-to-b from-[#324d99] via-[#213873] to-[#101b43] flex items-center justify-center overflow-hidden">
        {boxartUrl && !isBoxartUnavailable ? (
          <img
            src={boxartUrl}
            alt={game.title}
            loading="lazy"
            className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            onError={() => setIsBoxartUnavailable(true)}
          />
        ) : (
          /* Cartouche Rétro Mockup générée si jaquette absente */
          <div className="w-4/5 h-4/5 rounded-xl bg-slate-800 border-2 border-slate-700/80 flex flex-col items-center justify-center p-4 text-center shadow-inner relative overflow-hidden group-hover:border-retro-accent/50 transition">
            <div className="absolute top-2 w-12 h-1 bg-slate-600 rounded-full"></div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow"
              style={{ backgroundColor: `${system?.themeColor || '#00f2fe'}22`, color: system?.themeColor || '#00f2fe' }}
            >
              <span className="font-bold text-xs">{system?.shortName.substring(0, 3) || 'ROM'}</span>
            </div>
            <span className="text-xs font-bold text-slate-200 line-clamp-2 px-1">
              {game.cleanTitle}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 uppercase font-mono">
              {system?.shortName}
            </span>
          </div>
        )}

        {/* Badges en superposition */}
        <div className="absolute top-2 left-2 flex items-center space-x-1.5 z-10">
          {system && (
            <span
              style={{ backgroundColor: `${system.themeColor}dd` }}
              className="px-2 py-0.5 rounded-md text-[10px] font-black text-white uppercase tracking-wider shadow-md backdrop-blur-sm"
            >
              {system.shortName}
            </span>
          )}
          {game.region && (
            <span className="px-1.5 py-0.5 rounded-md bg-slate-900/80 text-xs backdrop-blur-sm border border-slate-700/50">
              {getRegionBadge(game.region)}
            </span>
          )}
        </div>

        {/* Bouton Favori */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(game.id);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-full transition z-10 ${
            game.favorite
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
              : 'bg-slate-900/70 text-slate-400 hover:text-rose-400 backdrop-blur-sm'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${game.favorite ? 'fill-current' : ''}`} />
        </button>

        {/* Overlay d'actions rapides au survol */}
        <div className="absolute inset-0 bg-retro-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3 p-4 backdrop-blur-[2px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLaunch(game);
            }}
            title="Lancer le jeu"
            className="w-12 h-12 rounded-full bg-retro-accent text-retro-900 flex items-center justify-center font-bold shadow-neon hover:scale-110 active:scale-95 transition"
          >
            <Play className="w-6 h-6 fill-current translate-x-0.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(game);
            }}
            title="Voir la fiche détaillée"
            className="w-10 h-10 rounded-full bg-slate-800 text-slate-200 hover:text-white flex items-center justify-center border border-slate-600 hover:scale-110 active:scale-95 transition"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Titre & Métadonnées sous la jaquette */}
      <div className="p-3 flex flex-col justify-between flex-grow bg-[#1a2f67]/95">
        <div>
          <h3 className="text-xs font-bold text-slate-100 line-clamp-1 group-hover:text-retro-accent transition">
            {game.cleanTitle}
          </h3>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span className="truncate">{game.metadata?.developer || game.metadata?.publisher || system?.name || 'Rétro'}</span>
            {game.metadata?.releaseDate && (
              <span className="text-[10px] text-slate-500 font-mono ml-1">
                {game.metadata.releaseDate.substring(0, 4)}
              </span>
            )}
          </div>
        </div>

        {(game.playCount > 0 || game.playTimeMinutes) && (
          <div className="mt-2 pt-1.5 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center space-x-2">
              {game.playCount > 0 && <span>×{game.playCount}</span>}
              {game.playTimeMinutes && game.playTimeMinutes >= 1 && (
                <span className="text-emerald-400 font-mono font-bold">
                  {game.playTimeMinutes >= 60
                    ? `${Math.floor(game.playTimeMinutes / 60)}h${game.playTimeMinutes % 60 > 0 ? `${game.playTimeMinutes % 60}m` : ''}`
                    : `${game.playTimeMinutes}m`}
                </span>
              )}
            </div>
            {game.metadata?.rating && (
              <span className="text-amber-400 font-bold">★ {game.metadata.rating}%</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
