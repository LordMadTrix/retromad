import React, { useEffect, useState, useRef } from 'react';
import { Game, System } from '../types';
import { Heart, Play, Eye, MoreVertical, Tag, X } from 'lucide-react';
import { resolveMediaUrl } from '../utils/media';

interface GameCardProps {
  game: Game;
  system?: System;
  isSelected?: boolean;
  onSelect: (game: Game) => void;
  onLaunch: (game: Game) => void;
  onToggleFavorite: (gameId: string) => void;
  onViewDetails: (game: Game) => void;
  onFilterByGenre?: (genre: string) => void;
}

export const GameCard: React.FC<GameCardProps> = React.memo(({
  game,
  system,
  isSelected,
  onSelect,
  onLaunch,
  onToggleFavorite,
  onViewDetails,
  onFilterByGenre,
}) => {
  const [isBoxartUnavailable, setIsBoxartUnavailable] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const hoverTimeoutRef = useRef<any>(null);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const videoUrl = resolveMediaUrl(game.media?.video) || null;

  const handleMouseEnter = () => {
    if (!videoUrl) return;
    hoverTimeoutRef.current = setTimeout(() => {
      setIsPlayingVideo(true);
    }, 450);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsPlayingVideo(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setIsBoxartUnavailable(false);
    setIsPlayingVideo(false);
  }, [game.media?.boxart2d, game.media?.video]);


  useEffect(() => {
    if (!isContextMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setIsContextMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsContextMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isContextMenuOpen]);

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
      onDoubleClick={() => onLaunch(game)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsContextMenuOpen(true);
      }}
      className={`arcade-card group relative flex flex-col rounded-2xl overflow-hidden bg-slate-900/90 border transition-[transform,border-color,box-shadow] duration-200 cursor-pointer select-none ${

        isSelected
          ? 'border-retro-accent shadow-[0_0_20px_rgba(0,242,254,0.45)] scale-[1.03] z-10'
          : 'border-slate-800 hover:border-retro-accent/60 hover:shadow-[0_0_18px_rgba(0,242,254,0.22)] hover:scale-[1.02]'
      }`}
    >
      {/* Menu contextuel flottant rétro */}
      {isContextMenuOpen && (
        <div
          ref={contextMenuRef}
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-2 top-2 z-50 bg-[#091228]/98 border border-cyan-500/50 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.9)] backdrop-blur-xl p-3 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150 text-left"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <div className="min-w-0 pr-2">
              <p className="text-[11px] font-bold text-white truncate">{game.cleanTitle}</p>
              <p className="text-[9px] text-cyan-400 uppercase font-mono">{system?.shortName || 'Retro'}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsContextMenuOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Actions principales */}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => {
                setIsContextMenuOpen(false);
                onLaunch(game);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-retro-accent/15 hover:bg-retro-accent/25 text-retro-accent text-xs font-bold transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Lancer le jeu</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsContextMenuOpen(false);
                onViewDetails(game);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800/80 text-slate-200 text-xs font-semibold transition"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>Fiche détaillée</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onToggleFavorite(game.id);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800/80 text-slate-200 text-xs font-semibold transition"
            >
              <Heart className={`w-3.5 h-3.5 ${game.favorite ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
              <span>{game.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}</span>
            </button>
          </div>

          {/* Section Filtrage par Genre */}
          {game.metadata?.genres && game.metadata.genres.length > 0 && onFilterByGenre && (
            <div className="pt-1.5 border-t border-slate-800/80">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                FILTRER PAR CE GENRE
              </span>
              <div className="flex flex-col gap-1">
                {game.metadata.genres.map((g, idx) => {
                  const parts = g.split(/[/,]/).map((p) => p.trim()).filter(Boolean);
                  return parts.map((part) => (
                    <button
                      key={`${idx}-${part}`}
                      type="button"
                      onClick={() => {
                        setIsContextMenuOpen(false);
                        onFilterByGenre(part);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white border border-cyan-500/20 text-xs transition"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <Tag className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate">Genre : {part}</span>
                      </span>
                      <span className="text-[10px] text-cyan-400/80 font-mono shrink-0">&rarr;</span>
                    </button>
                  ));
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Zone Jaquette / Image */}
      <div className="relative aspect-[3/4] w-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 flex items-center justify-center overflow-hidden">
        {/* Aperçu vidéo au survol */}
        {isPlayingVideo && videoUrl && (
          <div className="absolute inset-0 z-20 bg-black flex items-center justify-center animate-in fade-in duration-200">
            <video
              src={videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm border border-cyan-400/40 text-[9px] font-mono text-cyan-300 flex items-center gap-1 shadow-lg pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>CLIP</span>
            </div>
          </div>
        )}

        {boxartUrl && !isBoxartUnavailable ? (

          <img
            src={boxartUrl}
            alt={game.title}
            loading="lazy"
            className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
            onError={() => setIsBoxartUnavailable(true)}
          />
        ) : (
          /* Cartouche Rétro Mockup générée si jaquette absente */
          <div className="w-4/5 h-4/5 rounded-xl bg-slate-800/90 border-2 border-slate-700/80 flex flex-col items-center justify-center p-4 text-center shadow-inner relative overflow-hidden group-hover:border-retro-accent/50 transition">
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
              className="px-2 py-0.5 rounded-md text-[10px] font-black text-white uppercase tracking-wider shadow-md"
            >
              {system.shortName}
            </span>
          )}
          {game.region && (
            <span className="px-1.5 py-0.5 rounded-md bg-slate-900/85 text-xs border border-slate-700/50">
              {getRegionBadge(game.region)}
            </span>
          )}
        </div>

        {/* Boutons rapides : Favori & Menu Contextuel */}
        <div className="absolute top-2 right-2 flex items-center space-x-1 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsContextMenuOpen((p) => !p);
            }}
            className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition"
            title="Menu contextuel et genres"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(game.id);
            }}
            className={`p-1.5 rounded-full transition ${
              game.favorite
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-rose-400'
            }`}
            title={game.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart className={`w-3.5 h-3.5 ${game.favorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Overlay d'actions rapides au survol */}
        <div className="absolute inset-0 bg-retro-900/85 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3 p-4">
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
      <div className="p-3 flex flex-col justify-between flex-grow bg-slate-900/95 border-t border-slate-800/80">
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
});

GameCard.displayName = 'GameCard';
