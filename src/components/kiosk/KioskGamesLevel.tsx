import React from 'react';
import { Game, System } from '../../types';
import { CompanyLogo } from '../CompanyLogo';
import { ConsoleLogo } from '../ConsoleLogo';
import {
  Play,
  Heart,
  Eye,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  Award,
  Calendar,
  Gamepad2,
  Landmark,
  FolderOpen,
  Dices,
  BookOpen,
  Layers,
  Star,
  List,
  Users,
  HardDrive,
  Clock,
  Tag,
  Trophy,
} from 'lucide-react';
import { resolveMediaUrl } from '../../utils/media';
import { GamePreviewPlayer } from '../GamePreviewPlayer';
import { formatGameSize, formatPlayTime } from './kioskShared';
import type { KioskGameViewMode } from '../KioskArcadeView';

/**
 * NIVEAU 3 du Kiosque : la ludothèque de la console sélectionnée, avec ses
 * 4 vues (Vitrine, Mur de jaquettes, Coverflow 3D, Liste détaillée).
 * Extrait de KioskArcadeView pour être chargé à la demande.
 */

interface KioskGamesLevelProps {
  selectedSystem: System;
  selectedCompanyId?: string;
  consoleGames: Game[];
  currentGame: Game | null;
  gameIndex: number;
  gameViewMode: KioskGameViewMode;
  availableLetters: string[];
  isCompactFit: boolean;
  neonGlows: boolean;
  failedImageIds: Set<string>;
  previewGame: Game | null;
  activeItemRef: React.MutableRefObject<HTMLDivElement | null>;
  onStartPreview: (game: Game) => void;
  onCancelPreview: () => void;
  onSelectGameIndex: (idx: number | ((prev: number) => number)) => void;
  onViewDetails: (game: Game) => void;
  onLaunchGame: (game: Game) => void;
  onToggleFavorite: (gameId: string) => void;
  onBack: () => void;
  onOpenSystemMuseum: (sys: System) => void;
  onRandomPick: () => void;
  onOpenCartridgeShelf?: () => void;
  onOpenUserManualPdf?: () => void;
  onOpenAchievements?: () => void;
  onImageError: (gameId: string) => void;
  // Sons
  playMove: () => void;
  playSelect: () => void;
  playLaunch: () => void;
  playFavorite: () => void;
  onWheelCoverflow: (e: React.WheelEvent) => void;
}

export const KioskGamesLevel: React.FC<KioskGamesLevelProps> = ({
  selectedSystem,
  selectedCompanyId,
  consoleGames,
  currentGame,
  gameIndex,
  gameViewMode,
  availableLetters,
  isCompactFit,
  neonGlows,
  failedImageIds,
  previewGame,
  activeItemRef,
  onStartPreview,
  onCancelPreview,
  onSelectGameIndex,
  onViewDetails,
  onLaunchGame,
  onToggleFavorite,
  onBack,
  onOpenSystemMuseum,
  onRandomPick,
  onOpenCartridgeShelf,
  onOpenUserManualPdf,
  onOpenAchievements,
  onImageError,
  playMove,
  playSelect,
  playLaunch,
  playFavorite,
  onWheelCoverflow,
}) => {
  const setGameIndex = onSelectGameIndex;

  return (
    <div className={`flex-1 min-h-0 flex flex-col justify-between ${isCompactFit ? 'p-2 sm:p-3' : 'p-2 sm:p-4 md:p-5'} z-20 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200`}>
      {consoleGames.length === 0 ? (
        /* État quand la console n'a pas encore de ROM */
        <div className="text-center py-16 px-6 max-w-md mx-auto my-auto bg-slate-900/80 border border-slate-800 rounded-3xl p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">
            Aucune ROM détectée pour {selectedSystem.name}
          </h3>
          <p className="text-xs text-slate-400">
            Déposez vos jeux dans le dossier <code className="text-retro-accent font-mono">roms/{selectedSystem.subfolder}</code> pour qu'ils apparaissent ici.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl bg-retro-accent text-retro-900 font-bold text-xs shadow-neon transition cursor-pointer"
            >
              ⬅️ Choisir une autre console
            </button>
            <button
              onClick={() => {
                playSelect();
                onOpenSystemMuseum(selectedSystem);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition flex items-center space-x-1.5 shadow cursor-pointer"
            >
              <Landmark className="w-4 h-4 text-cyan-400" />
              <span>🏛️ Visiter le Musée de la {selectedSystem.name}</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ── VUE 1 : VITRINE / SHOWCASE (HERO 3D PAR DÉFAUT) ── */}
          {gameViewMode === 'showcase' && currentGame && (
            <>
              {/* Espace Central Showcase du Jeu Sélectionné (Centré à l'écran) */}
              <div className="flex-1 min-h-0 flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-6 md:gap-8 max-w-5xl mx-auto w-full my-auto">
                {/* Colonne Gauche : Grande Jaquette 3D & Reflet au sol */}
                <div className="flex flex-col items-center justify-center w-full md:w-1/2 max-w-sm relative group shrink-0">
                  {neonGlows && (
                    <div
                      className="absolute inset-0 rounded-3xl opacity-40 pointer-events-none"
                      style={{
                        background: `radial-gradient(ellipse at 50% 40%, ${selectedSystem.themeColor}80 0%, transparent 70%)`,
                      }}
                    />
                  )}

                  <div
                    onClick={() => {
                      playSelect();
                      onViewDetails(currentGame);
                    }}
                    className={`group/cover relative aspect-[3/4] ${isCompactFit ? 'w-32 sm:w-44 max-h-[20vh] sm:max-h-[24vh] p-1.5' : 'w-36 sm:w-48 md:w-56 lg:w-64 max-h-[24vh] sm:max-h-[30vh] md:max-h-[36vh] p-2 sm:p-3'} rounded-2xl sm:rounded-3xl bg-slate-900/90 border-2 border-slate-700/80 hover:border-retro-accent shadow-2xl flex items-center justify-center overflow-hidden transition-transform duration-200 hover:scale-105 cursor-pointer [transform:translateZ(0)] will-change-transform`}
                    title="Cliquer pour ouvrir la fiche détaillée du jeu"
                    onMouseEnter={() => currentGame && onStartPreview(currentGame)}
                    onMouseLeave={onCancelPreview}
                  >
                    {/* Overlay hover discret pour indiquer l'ouverture de la fiche */}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/cover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1.5 z-30 pointer-events-none backdrop-blur-[1px]">
                      <div className="p-2.5 rounded-full bg-retro-accent/20 border border-retro-accent text-retro-accent shadow-neon">
                        <Eye className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-white drop-shadow">
                        Ouvrir la fiche
                      </span>
                    </div>

                    {/* Aperçu en direct : démo silencieuse après 2 s de survol */}
                    {previewGame?.id === currentGame.id && (
                      <div className="absolute inset-0 z-20 bg-black">
                        <GamePreviewPlayer game={previewGame} className="w-full h-full" />
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/80 border border-amber-500/50 text-amber-300 text-[9px] font-black uppercase tracking-wider">
                          Aperçu en direct
                        </span>
                      </div>
                    )}
                    {currentGame.media?.boxart2d && !failedImageIds.has(currentGame.id) ? (
                      <img
                        src={resolveMediaUrl(currentGame.media.boxart2d)}
                        alt={currentGame.title}
                        decoding="async"
                        className="w-full h-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]"
                        onError={() => onImageError(currentGame.id)}
                      />
                    ) : (
                      <div className="w-full h-full rounded-2xl bg-slate-800/80 border-2 border-slate-700 flex flex-col items-center justify-center p-3 text-center shadow-inner">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-retro-accent/20 border border-retro-accent text-retro-accent flex items-center justify-center mb-2">
                          <Gamepad2 className="w-5 sm:w-6 h-5 sm:h-6" />
                        </div>
                        <span className="text-xs sm:text-sm font-black text-white line-clamp-2">{currentGame.cleanTitle}</span>
                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono mt-1 uppercase">
                          {selectedSystem.name}
                        </span>
                      </div>
                    )}

                    {/* Badge officiel de la console */}
                    <div className="absolute top-2 left-2 z-10 pointer-events-none">
                      <div
                        style={{
                          backgroundColor: 'rgba(11, 13, 20, 0.85)',
                          borderColor: `${selectedSystem.themeColor}77`,
                        }}
                        className="px-2 py-0.5 sm:py-1 rounded-xl border shadow-2xl flex items-center justify-center max-w-[130px]"
                      >
                        <ConsoleLogo system={selectedSystem} size="md" />
                      </div>
                    </div>
                  </div>

                  {/* Ombre de Contact & Halo Néon (Ultra Léger & Fluide 60 FPS) */}
                  <div className="w-full flex flex-col items-center pointer-events-none select-none mt-2">
                    <div className="w-3/4 max-w-[220px] h-2 bg-black/80 blur-sm rounded-full" />
                    <div
                      style={{ backgroundColor: selectedSystem.themeColor ? `${selectedSystem.themeColor}44` : 'rgba(0, 242, 254, 0.25)' }}
                      className="w-1/2 max-w-[160px] h-1.5 blur-md rounded-full -mt-1"
                    />
                  </div>
                </div>

                {/* Colonne Droite : Fiche Graphique Rétro & Bouton JOUER */}
                <div className="flex-1 flex flex-col justify-center space-y-3 sm:space-y-4 max-w-lg min-w-0">
                  <div>
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-1.5 flex-wrap gap-y-1">
                      <CompanyLogo companyId={selectedCompanyId ?? selectedSystem.companyId} size="sm" />
                      <span className="text-slate-600 font-bold">•</span>
                      <ConsoleLogo system={selectedSystem} size="md" />
                      <span className="text-slate-600 font-bold">•</span>
                      <span className="text-[11px] sm:text-xs font-mono text-slate-400">
                        {gameIndex + 1} / {consoleGames.length}
                      </span>
                      <button
                        onClick={() => {
                          playSelect();
                          onOpenSystemMuseum(selectedSystem);
                        }}
                        className="ml-auto px-2 py-0.5 sm:py-1 rounded-xl bg-slate-800/80 hover:bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] sm:text-[11px] font-bold flex items-center space-x-1.5 transition shadow"
                        title="Consulter l'exposition Musée & Histoire de cette console (Touche M)"
                      >
                        <Landmark className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
                        <span>Musée {selectedSystem.shortName}</span>
                      </button>

                      {onOpenCartridgeShelf && (
                        <button
                          onClick={() => {
                            playSelect();
                            onOpenCartridgeShelf();
                          }}
                          className="px-2 py-0.5 sm:py-1 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/40 text-[10px] sm:text-[11px] font-bold flex items-center space-x-1.5 transition shadow"
                          title="Inspecter la boîte 3D et la cartouche physique (Touche C)"
                        >
                          <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400" />
                          <span>Boîte 3D</span>
                        </button>
                      )}
                    </div>

                    <h1
                      onClick={() => {
                        playSelect();
                        onViewDetails(currentGame);
                      }}
                      className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-wide uppercase drop-shadow-md truncate cursor-pointer hover:text-retro-accent transition-colors"
                      title="Cliquer pour afficher la fiche détaillée du jeu"
                    >
                      {currentGame.cleanTitle}
                    </h1>

                    {currentGame.metadata?.developer && (
                      <p className="text-xs sm:text-sm font-semibold text-retro-accent mt-0.5">
                        Par {currentGame.metadata.developer}
                      </p>
                    )}
                  </div>

                  {/* Badges Caractéristiques */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                    {currentGame.metadata?.releaseDate && (
                      <span className="px-2.5 py-0.5 sm:py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 font-mono flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-retro-pink" />
                        <span>{currentGame.metadata.releaseDate.substring(0, 4)}</span>
                      </span>
                    )}
                    {currentGame.region && (
                      <span className="px-2.5 py-0.5 sm:py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 font-bold">
                        {currentGame.region}
                      </span>
                    )}
                    {currentGame.metadata?.rating && (
                      <span className="px-2.5 py-0.5 sm:py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black flex items-center space-x-1">
                        <Award className="w-3 h-3" />
                        <span>{currentGame.metadata.rating}%</span>
                      </span>
                    )}
                    {currentGame.playCount && currentGame.playCount > 0 ? (
                      <span className="px-2.5 py-0.5 sm:py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold flex items-center space-x-1">
                        <Flame className="w-3 h-3 text-emerald-400" />
                        <span>{currentGame.playCount}x</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Résumé synopsis */}
                  <p
                    onClick={() => {
                      playSelect();
                      onViewDetails(currentGame);
                    }}
                    className={`text-xs ${isCompactFit ? 'line-clamp-2 p-2' : 'sm:text-sm line-clamp-2 sm:line-clamp-3 p-2.5 sm:p-3'} text-slate-300 leading-relaxed bg-slate-900/60 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition`}
                    title="Cliquer pour afficher la fiche détaillée du jeu"
                  >
                    {currentGame.metadata?.synopsis ||
                      "Préparez-vous à une aventure rétro inoubliable ! Installez-vous aux commandes et lancez la partie."}
                  </p>

                  {/* GRAND BOUTON ARCADE JOUER & FICHE DU JEU */}
                  <div className="flex items-center space-x-2 sm:space-x-3 pt-1">
                    <button
                      onClick={() => {
                        playLaunch();
                        onLaunchGame(currentGame);
                      }}
                      className={`flex-1 flex items-center justify-center space-x-2 ${isCompactFit ? 'py-2 sm:py-2.5 text-xs sm:text-sm' : 'py-2.5 sm:py-3 text-sm sm:text-base'} rounded-xl sm:rounded-2xl bg-gradient-to-r from-retro-accent via-emerald-400 to-retro-green text-retro-900 font-black tracking-wider shadow-neon hover:scale-105 active:scale-95 transition-all cursor-pointer`}
                    >
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                      <span>▶ APPUYEZ SUR A POUR JOUER</span>
                    </button>

                    <button
                      onClick={() => {
                        playSelect();
                        onViewDetails(currentGame);
                      }}
                      className="px-3 sm:px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-retro-accent/70 transition shadow flex items-center space-x-1.5 cursor-pointer font-bold text-xs"
                      title="Consulter la fiche complète du jeu (Touche X / D)"
                    >
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-retro-accent" />
                      <span className="hidden sm:inline">Fiche</span>
                    </button>

                    <button
                      onClick={onRandomPick}
                      className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25 hover:text-white transition shadow-sm cursor-pointer"
                      title="Choisir un jeu au hasard sur cette console (Touche R / Select manette)"
                    >
                      <Dices className="w-5 h-5 text-amber-400" />
                    </button>

                    <button
                      onClick={() => {
                        playFavorite();
                        onToggleFavorite(currentGame.id);
                      }}
                      className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition cursor-pointer ${
                        currentGame.favorite
                          ? 'bg-rose-500 text-white border-rose-400 shadow-neon-pink'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                      title="Ajouter aux favoris (Touche Y / F)"
                    >
                      <Heart className={`w-5 h-5 ${currentGame.favorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Barre de saut alphabétique si plus de 8 jeux */}
              {consoleGames.length > 8 && availableLetters.length > 1 && (
                <div className="flex items-center justify-center space-x-1.5 py-1 z-30 max-w-2xl mx-auto overflow-x-auto no-scrollbar shrink-0">
                  {availableLetters.map((char) => {
                    const isMatching = currentGame?.cleanTitle.toUpperCase().startsWith(char);
                    return (
                      <button
                        key={char}
                        onClick={() => {
                          playMove();
                          const targetIdx = consoleGames.findIndex((g) => g.cleanTitle.toUpperCase().startsWith(char));
                          if (targetIdx >= 0) setGameIndex(targetIdx);
                        }}
                        className={`w-6 h-6 rounded-lg text-[10px] font-bold font-mono transition cursor-pointer ${
                          isMatching
                            ? 'bg-retro-accent text-retro-900 shadow-neon scale-110 font-black'
                            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {char}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Carrousel Inférieur de Défilement des Jeux de la Console */}
              {consoleGames.length > 1 && (
                <div className={`${isCompactFit ? 'h-13 sm:h-16 mt-1' : 'h-16 sm:h-20 mt-1.5 sm:mt-3'} bg-retro-900/90 border border-slate-800/80 rounded-xl sm:rounded-2xl px-2.5 sm:px-5 flex items-center justify-between z-30 shrink-0 max-w-4xl mx-auto w-full`}>
                  <button
                    onClick={() => {
                      playMove();
                      setGameIndex((prev) => (prev > 0 ? prev - 1 : consoleGames.length - 1));
                    }}
                    className="p-1 sm:p-1.5 rounded-xl bg-slate-800 hover:bg-retro-accent hover:text-retro-900 text-slate-300 transition shadow shrink-0 cursor-pointer"
                    title="Jeu précédent (Flèche Gauche / LB)"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <div className="flex-1 flex items-center justify-center space-x-2 sm:space-x-3 overflow-hidden px-2 sm:px-4">
                    {consoleGames.slice(Math.max(0, gameIndex - 3), gameIndex + 4).map((game) => {
                      const isCurrent = game.id === currentGame?.id;
                      return (
                        <div
                          key={game.id}
                          onClick={() => {
                            const idx = consoleGames.findIndex((g) => g.id === game.id);
                            if (isCurrent) {
                              playSelect();
                              onViewDetails(game);
                            } else {
                              playMove();
                              if (idx >= 0) setGameIndex(idx);
                            }
                          }}
                          className={`relative aspect-[3/4] ${isCompactFit ? 'h-10 sm:h-12' : 'h-12 sm:h-14 md:h-15'} rounded-lg sm:rounded-xl bg-slate-800 border-2 overflow-hidden cursor-pointer transition-[transform,opacity,border-color] duration-150 [transform:translateZ(0)] shrink-0 ${
                            isCurrent
                              ? 'border-retro-accent shadow-neon scale-105 sm:scale-110 z-10'
                              : 'border-slate-700 opacity-60 hover:opacity-100 hover:scale-105'
                          }`}
                          title={isCurrent ? "Cliquer pour ouvrir la fiche du jeu" : game.cleanTitle}
                        >
                          {game.media?.boxart2d && !failedImageIds.has(game.id) ? (
                            <img
                              src={resolveMediaUrl(game.media.boxart2d)}
                              alt={game.title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-contain p-0.5"
                              onError={() => onImageError(game.id)}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center p-1 text-[8px] font-bold text-center text-slate-300">
                              {game.cleanTitle}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      playMove();
                      setGameIndex((prev) => (prev < consoleGames.length - 1 ? prev + 1 : 0));
                    }}
                    className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-retro-accent hover:text-retro-900 text-slate-300 transition shadow shrink-0 cursor-pointer"
                    title="Jeu suivant (Flèche Droite / RB)"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── VUE 2 : GRILLE / MUR DE JAQUETTES (GRID WALL) ── */}
          {gameViewMode === 'grid' && (
            <div className="flex-1 min-h-0 flex flex-col justify-between gap-2 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-2 sm:px-4 py-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 max-w-6xl mx-auto">
                  {consoleGames.map((game, idx) => {
                    const isCurrent = idx === gameIndex;
                    return (
                      <div
                        key={game.id}
                        ref={isCurrent ? activeItemRef : null}
                        onClick={() => {
                          if (isCurrent) {
                            playSelect();
                            onViewDetails(game);
                          } else {
                            playMove();
                            setGameIndex(idx);
                          }
                        }}
                        onDoubleClick={() => {
                          playLaunch();
                          onLaunchGame(game);
                        }}
                        className={`group relative aspect-[3/4] rounded-2xl border-2 transition-[transform,border-color] duration-150 overflow-hidden cursor-pointer flex flex-col justify-end p-2.5 [transform:translateZ(0)] will-change-transform ${
                          isCurrent
                            ? 'border-retro-accent shadow-[0_0_25px_rgba(0,242,254,0.6)] scale-[1.03] z-10 ring-2 ring-retro-accent/40'
                            : 'border-slate-800 bg-slate-900/80 hover:border-slate-600 hover:scale-[1.02]'
                        }`}
                        title={isCurrent ? "Cliquer pour ouvrir la fiche du jeu (Double-clic pour jouer)" : game.cleanTitle}
                      >
                        {game.media?.boxart2d && !failedImageIds.has(game.id) ? (
                          <img
                            src={resolveMediaUrl(game.media.boxart2d)}
                            alt={game.title}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ease-out"
                            onError={() => onImageError(game.id)}
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-slate-800">
                            <Gamepad2 className="w-8 h-8 text-retro-accent/50 mb-1" />
                            <span className="text-[11px] font-bold text-white line-clamp-3">{game.cleanTitle}</span>
                          </div>
                        )}

                        {/* Voile dégradé bas */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

                        {/* Badges haut */}
                        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-none">
                          {game.region ? (
                            <span className="px-1.5 py-0.5 rounded-md bg-black/80 border border-slate-700 text-[9px] font-bold text-slate-300 uppercase">
                              {game.region}
                            </span>
                          ) : <span />}
                          {game.favorite && (
                            <span className="p-1 rounded-full bg-rose-500 text-white shadow-neon-pink">
                              <Heart className="w-2.5 h-2.5 fill-current" />
                            </span>
                          )}
                        </div>

                        {/* Titre & Année bas */}
                        <div className="relative z-10 min-w-0">
                          <div className="text-xs sm:text-sm font-black text-white truncate drop-shadow-md">
                            {game.cleanTitle}
                          </div>
                          <div className="flex items-center space-x-1.5 text-[10px] text-slate-300 font-mono mt-0.5">
                            {game.metadata?.releaseDate && <span>{game.metadata.releaseDate.substring(0, 4)}</span>}
                            {game.metadata?.rating && <span className="text-amber-400 font-bold">★ {game.metadata.rating}%</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* HUD flottant inférieur avec le jeu sélectionné */}
              {currentGame && (
                <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-2.5 sm:p-3 max-w-5xl mx-auto w-full flex items-center justify-between gap-3 shadow-2xl backdrop-blur-md shrink-0">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-12 h-14 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                      {currentGame.media?.boxart2d && !failedImageIds.has(currentGame.id) ? (
                        <img src={resolveMediaUrl(currentGame.media.boxart2d)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Gamepad2 className="w-6 h-6 text-slate-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-retro-accent font-bold">
                          {gameIndex + 1} / {consoleGames.length}
                        </span>
                        <span className="text-slate-600 font-bold">•</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">{selectedSystem.name}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-white truncate">{currentGame.cleanTitle}</h3>
                      <p className="text-[11px] text-slate-300 line-clamp-1 max-w-lg">
                        {currentGame.metadata?.synopsis || "Préparez-vous à une aventure rétro inoubliable !"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => { playLaunch(); onLaunchGame(currentGame); }}
                      className="px-4 sm:px-6 py-2 rounded-xl bg-gradient-to-r from-retro-accent to-emerald-400 text-retro-900 font-black text-xs sm:text-sm shadow-neon hover:scale-105 active:scale-95 transition flex items-center space-x-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>JOUER (A)</span>
                    </button>
                    <button
                      onClick={() => { playFavorite(); onToggleFavorite(currentGame.id); }}
                      className={`p-2 rounded-xl border transition cursor-pointer ${
                        currentGame.favorite ? 'bg-rose-500 text-white border-rose-400' : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                      title="Favori (Y / F)"
                    >
                      <Heart className={`w-4 h-4 ${currentGame.favorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => { playSelect(); onViewDetails(currentGame); }}
                      className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                      title="Fiche (X / D)"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── VUE 3 : COVERFLOW 3D / ROUE ARCADE (5 JEUX FLUIDES) ── */}
          {gameViewMode === 'wheel' && (
            <div
              onWheel={onWheelCoverflow}
              className="flex-1 min-h-0 flex flex-col justify-between items-center px-2 py-3 overflow-hidden select-none"
            >
              {/* Scène 3D */}
              <div
                className="flex-1 min-h-0 w-full flex items-center justify-center relative my-auto"
                style={{ perspective: '1200px' }}
              >
                <div className="relative w-full max-w-4xl h-56 sm:h-72 md:h-80 flex items-center justify-center [transform-style:preserve-3d]">
                  {/* Flèches gauche/droite */}
                  <button
                    onClick={() => {
                      playMove();
                      setGameIndex((prev) => (prev > 0 ? prev - 1 : consoleGames.length - 1));
                    }}
                    className="absolute left-2 sm:left-4 z-40 p-2 sm:p-3 rounded-full bg-slate-900/80 border border-slate-700 text-white hover:bg-retro-accent hover:text-retro-900 transition shadow-neon cursor-pointer"
                    title="Précédent"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>

                  <button
                    onClick={() => {
                      playMove();
                      setGameIndex((prev) => (prev < consoleGames.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-2 sm:right-4 z-40 p-2 sm:p-3 rounded-full bg-slate-900/80 border border-slate-700 text-white hover:bg-retro-accent hover:text-retro-900 transition shadow-neon cursor-pointer"
                    title="Suivant"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>

                  {/* Cartes 3D disposées autour du centre (adaptatif 1 à 5 jeux) */}
                  {(consoleGames.length <= 1 ? [0] : consoleGames.length <= 2 ? [-1, 0, 1] : [-2, -1, 0, 1, 2]).map((offset) => {
                    const len = consoleGames.length;
                    if (len === 0) return null;
                    const targetIdx = ((gameIndex + offset) % len + len) % len;
                    const game = consoleGames[targetIdx];
                    if (!game) return null;
                    const isCenter = offset === 0;
                    const sign = Math.sign(offset);
                    const absOffset = Math.abs(offset);

                    // Calculs spatiaux 3D Coverflow réaliste et échelonné à gauche et à droite
                    const translateX = isCenter ? 0 : sign * (135 + absOffset * 85);
                    const translateZ = isCenter ? 100 : -absOffset * 75;
                    const rotateY = isCenter ? 0 : sign * -50;
                    const scale = isCenter ? 1.15 : Math.max(0.72, 1 - absOffset * 0.14);
                    const opacity = isCenter ? 1 : Math.max(0.35, 1 - absOffset * 0.28);
                    const zIndex = 30 - absOffset * 10;
                    const safeKey = len >= 5 ? game.id : `${game.id}-${offset}`;

                    return (
                      <div
                        key={safeKey}
                        onClick={() => {
                          if (isCenter) {
                            playSelect();
                            onViewDetails(game);
                          } else {
                            playMove();
                            setGameIndex(targetIdx);
                          }
                        }}
                        onDoubleClick={() => {
                          playLaunch();
                          onLaunchGame(game);
                        }}
                        style={{
                          transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                          opacity,
                          zIndex,
                          transition: 'transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.28s ease-out',
                        }}
                        className={`absolute aspect-[3/4] w-36 sm:w-48 md:w-56 rounded-2xl border-2 overflow-hidden cursor-pointer shadow-2xl [transform-style:preserve-3d] will-change-transform ${
                          isCenter
                            ? 'border-retro-accent ring-4 ring-retro-accent/30 shadow-[0_0_35px_rgba(0,242,254,0.5)]'
                            : 'border-slate-700/80 bg-slate-900 hover:border-slate-500'
                        }`}
                        title={isCenter ? "Cliquer pour ouvrir la fiche du jeu (Double-clic pour jouer)" : game.cleanTitle}
                      >
                        {game.media?.boxart2d && !failedImageIds.has(game.id) ? (
                          <img
                            src={resolveMediaUrl(game.media.boxart2d)}
                            alt={game.title}
                            decoding="async"
                            className="w-full h-full object-cover"
                            onError={() => onImageError(game.id)}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-slate-800">
                            <Gamepad2 className="w-8 h-8 text-retro-accent/50 mb-1" />
                            <span className="text-[11px] font-bold text-white line-clamp-3">{game.cleanTitle}</span>
                          </div>
                        )}

                        {isCenter && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-retro-accent text-retro-900 text-[9px] font-black uppercase tracking-wider shadow">
                            Sélectionné
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Panneau d'informations du jeu sélectionné */}
              {currentGame && (
                <div className="max-w-2xl w-full bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 sm:p-4 text-center shrink-0 space-y-2 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center justify-center space-x-2 text-xs text-slate-400 font-mono">
                    <span>{gameIndex + 1} / {consoleGames.length}</span>
                    <span>•</span>
                    <span className="text-retro-accent uppercase font-bold">{selectedSystem.name}</span>
                    {currentGame.region && (
                      <>
                        <span>•</span>
                        <span className="font-bold text-slate-300">{currentGame.region}</span>
                      </>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide truncate">
                    {currentGame.cleanTitle}
                  </h2>
                  <p className="text-xs text-slate-300 line-clamp-2 max-w-lg mx-auto">
                    {currentGame.metadata?.synopsis || "Préparez-vous à une aventure rétro inoubliable !"}
                  </p>

                  <div className="flex items-center justify-center space-x-3 pt-1">
                    <button
                      onClick={() => { playLaunch(); onLaunchGame(currentGame); }}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-retro-accent to-emerald-400 text-retro-900 font-black text-sm shadow-neon hover:scale-105 active:scale-95 transition flex items-center space-x-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>APPUYEZ SUR A POUR JOUER</span>
                    </button>
                    <button
                      onClick={() => { playFavorite(); onToggleFavorite(currentGame.id); }}
                      className={`p-2.5 rounded-xl border transition cursor-pointer ${
                        currentGame.favorite ? 'bg-rose-500 text-white border-rose-400' : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                      title="Favori (Y / F)"
                    >
                      <Heart className={`w-4 h-4 ${currentGame.favorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => { playSelect(); onViewDetails(currentGame); }}
                      className="p-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:text-white transition cursor-pointer"
                      title="Détails (X / D)"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── VUE 4 : LISTE DÉTAILLÉE / SPLIT VIEW ENRICHIE ── */}
          {gameViewMode === 'list' && (
            <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-4 p-2 sm:p-4 overflow-hidden max-w-7xl mx-auto w-full">
              {/* Volet Gauche : Liste des jeux */}
              <div className="w-full md:w-5/12 lg:w-4/12 flex flex-col min-h-0 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shrink-0">
                <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
                  <div className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                    <List className="w-3.5 h-3.5 text-retro-accent" />
                    <span>Jeux {selectedSystem.name}</span>
                  </div>
                  <div className="text-[11px] font-mono text-retro-accent font-bold">
                    {gameIndex + 1} / {consoleGames.length}
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
                  {consoleGames.map((game, idx) => {
                    const isCurrent = idx === gameIndex;
                    return (
                      <div
                        key={game.id}
                        ref={isCurrent ? activeItemRef : null}
                        onClick={() => {
                          if (isCurrent) {
                            playSelect();
                            onViewDetails(game);
                          } else {
                            playMove();
                            setGameIndex(idx);
                          }
                        }}
                        onDoubleClick={() => { playLaunch(); onLaunchGame(game); }}
                        className={`px-3 py-2 rounded-xl flex items-center space-x-3 transition-[transform,background-color,border-color] duration-150 cursor-pointer border [transform:translateZ(0)] ${
                          isCurrent
                            ? 'bg-gradient-to-r from-retro-accent/25 to-blue-500/10 border-retro-accent/70 text-white shadow-neon scale-[1.01]'
                            : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/60 text-slate-300'
                        }`}
                        title={isCurrent ? "Cliquer pour ouvrir la fiche du jeu" : game.cleanTitle}
                      >
                        <span className="font-mono text-[10px] text-slate-500 w-6 shrink-0">
                          {String(idx + 1).padStart(3, '0')}
                        </span>
                        <div className="w-8 h-10 rounded-lg bg-slate-800 border border-slate-700/80 shrink-0 overflow-hidden flex items-center justify-center">
                          {game.media?.boxart2d && !failedImageIds.has(game.id) ? (
                            <img src={resolveMediaUrl(game.media.boxart2d)} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                          ) : (
                            <Gamepad2 className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-xs truncate ${isCurrent ? 'font-black text-white' : 'font-medium'}`}>
                            {game.cleanTitle}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-2 mt-0.5">
                            {game.metadata?.releaseDate && <span>{game.metadata.releaseDate.substring(0, 4)}</span>}
                            {game.region && <span>{game.region}</span>}
                          </div>
                        </div>
                        {game.favorite && <Heart className="w-3.5 h-3.5 text-rose-500 fill-current shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Volet Droit : Détails Complets, Médias & Fiche Technique du Jeu */}
              {currentGame && (
                <div className="w-full md:w-7/12 lg:w-8/12 flex flex-col justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 overflow-y-auto custom-scrollbar shadow-2xl">
                  <div className="space-y-4">
                    {/* 1. En-tête : Logo, Système, Région, Note, Badge Favori */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800/80">
                      <div className="flex items-center space-x-2.5 flex-wrap">
                        <div
                          style={{
                            backgroundColor: `${selectedSystem.themeColor}18`,
                            borderColor: `${selectedSystem.themeColor}55`,
                          }}
                          className="px-2.5 py-1 rounded-xl border flex items-center justify-center max-w-[140px]"
                        >
                          <ConsoleLogo system={selectedSystem} size="sm" />
                        </div>
                        <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700/80 font-semibold">
                          {currentGame.region || 'World'}
                        </span>
                        {currentGame.metadata?.rating ? (
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{currentGame.metadata.rating}%</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-lg bg-slate-800/60 text-slate-400 text-[11px] font-medium border border-slate-700/50">
                            Non noté
                          </span>
                        )}
                        {currentGame.favorite && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/40 flex items-center gap-1">
                            <Heart className="w-3 h-3 fill-current text-rose-400" />
                            <span>Favori</span>
                          </span>
                        )}
                      </div>

                      {/* Raccourci Musée de la console */}
                      <button
                        onClick={() => {
                          playSelect();
                          onOpenSystemMuseum(selectedSystem);
                        }}
                        className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition cursor-pointer"
                        title={`Découvrir l'histoire muséale de la ${selectedSystem.name}`}
                      >
                        <Landmark className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Musée {selectedSystem.shortName}</span>
                      </button>
                    </div>

                    {/* 2. Titre du jeu et crédits */}
                    <div>
                      <h2
                        onClick={() => {
                          playSelect();
                          onViewDetails(currentGame);
                        }}
                        className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide cursor-pointer hover:text-retro-accent transition-colors line-clamp-2 drop-shadow-sm"
                        title="Cliquer pour ouvrir la fiche détaillée"
                      >
                        {currentGame.cleanTitle}
                      </h2>
                      <div className="flex items-center space-x-2 flex-wrap text-xs sm:text-sm font-semibold mt-1">
                        <span className="text-retro-accent">
                          Développé par <span className="text-white font-bold">{currentGame.metadata?.developer || currentGame.metadata?.publisher || selectedSystem.manufacturer}</span>
                        </span>
                        {currentGame.metadata?.publisher && currentGame.metadata.publisher !== currentGame.metadata.developer && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-400">
                              Édité par <span className="text-slate-200">{currentGame.metadata.publisher}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 3. Section Visuelle & Cartouches Techniques */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      {/* Jaquette HD cliquable */}
                      <div
                        onClick={() => {
                          playSelect();
                          onViewDetails(currentGame);
                        }}
                        className="w-36 sm:w-44 aspect-[3/4] rounded-2xl bg-slate-950 border-2 border-slate-700 hover:border-retro-accent overflow-hidden shrink-0 shadow-2xl cursor-pointer hover:scale-103 transition-transform duration-200 [transform:translateZ(0)] relative group"
                        title="Cliquer pour ouvrir la fiche détaillée"
                      >
                        {currentGame.media?.boxart2d && !failedImageIds.has(currentGame.id) ? (
                          <img
                            src={resolveMediaUrl(currentGame.media.boxart2d)}
                            alt={currentGame.title}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-slate-800">
                            <Gamepad2 className="w-10 h-10 text-retro-accent/40 mb-2" />
                            <span className="text-xs font-bold text-white line-clamp-2">{currentGame.cleanTitle}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-retro-accent/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <span className="px-2.5 py-1 rounded-lg bg-black/85 text-[11px] font-bold text-retro-accent border border-retro-accent/40 shadow-lg">
                            Voir la fiche
                          </span>
                        </div>
                      </div>

                      {/* Grille de 4 cartouches d'infos techniques & d'époque */}
                      <div className="flex-1 w-full flex flex-col gap-2.5">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {/* Studio / Constructeur */}
                          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center space-x-2.5">
                            <Award className="w-4 h-4 text-retro-accent shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[10px] text-slate-500 uppercase font-bold block leading-none mb-1">Studio</span>
                              <span className="font-bold text-slate-200 truncate block text-[11px]">
                                {currentGame.metadata?.developer || currentGame.metadata?.publisher || selectedSystem.manufacturer}
                              </span>
                            </div>
                          </div>

                          {/* Année de Sortie */}
                          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center space-x-2.5">
                            <Calendar className="w-4 h-4 text-retro-pink shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[10px] text-slate-500 uppercase font-bold block leading-none mb-1">Sortie</span>
                              <span className="font-bold text-slate-200 truncate block text-[11px]">
                                {currentGame.metadata?.releaseDate || `${selectedSystem.releaseYear}`}
                              </span>
                            </div>
                          </div>

                          {/* Nombre de Joueurs */}
                          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center space-x-2.5">
                            <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[10px] text-slate-500 uppercase font-bold block leading-none mb-1">Joueurs</span>
                              <span className="font-bold text-slate-200 truncate block text-[11px]">
                                {currentGame.metadata?.players || '1-2 Joueurs'}
                              </span>
                            </div>
                          </div>

                          {/* Format & Taille ROM */}
                          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center space-x-2.5">
                            <HardDrive className="w-4 h-4 text-cyan-400 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[10px] text-slate-500 uppercase font-bold block leading-none mb-1">Format ROM</span>
                              <span className="font-bold text-slate-200 truncate block text-[11px] font-mono">
                                {currentGame.extension ? currentGame.extension.toUpperCase().replace('.', '') : 'ROM'} ({formatGameSize(currentGame.size)})
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Badges de Genres (si existants) */}
                        {currentGame.metadata?.genres && currentGame.metadata.genres.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Genres :</span>
                            {currentGame.metadata.genres.map((g, idx) => {
                              const parts = g.split(/[/,]/).map((p) => p.trim()).filter(Boolean);
                              return parts.map((genre) => (
                                <span
                                  key={`${idx}-${genre}`}
                                  className="px-2 py-0.5 rounded-lg bg-slate-800/90 border border-slate-700 text-[10px] font-medium text-slate-300 flex items-center gap-1 shadow-sm"
                                >
                                  <Tag className="w-2.5 h-2.5 text-cyan-400" />
                                  <span>{genre}</span>
                                </span>
                              ));
                            })}
                          </div>
                        )}

                        {/* Statistiques d'Arcade (Parties, Temps de jeu, Dernière session) */}
                        <div className="flex items-center gap-2.5 text-[11px] font-mono text-slate-400 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/70 flex-wrap">
                          <span className="flex items-center gap-1 text-slate-200">
                            <Flame className="w-3.5 h-3.5 text-amber-400" />
                            <span>{currentGame.playCount || 0} partie(s)</span>
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="flex items-center gap-1 text-slate-200">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Temps : {formatPlayTime(currentGame.playTimeMinutes)}</span>
                          </span>
                          {currentGame.lastPlayed && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span className="text-slate-400">
                                Dernier : {new Date(currentGame.lastPlayed).toLocaleDateString('fr-FR')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 4. Capture d'écran Gameplay (si disponible) */}
                    {currentGame.media?.snap && (
                      <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 relative max-h-40 group">
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-slate-300 uppercase tracking-wider border border-slate-700 z-10">
                          Capture en jeu
                        </div>
                        <img
                          src={resolveMediaUrl(currentGame.media.snap)}
                          alt={`Capture de ${currentGame.title}`}
                          className="w-full h-full object-cover max-h-40 opacity-85 group-hover:opacity-100 transition-opacity"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* 5. Histoire & Synopsis Enrichi */}
                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                      <div className="text-[10px] font-black uppercase text-retro-accent tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-retro-accent" />
                        <span>Histoire & Récit Rétro</span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed max-h-28 overflow-y-auto custom-scrollbar">
                        {currentGame.metadata?.synopsis && currentGame.metadata.synopsis.trim().length > 0
                          ? currentGame.metadata.synopsis
                          : `Plongez dans l'expérience authentique de ${currentGame.cleanTitle} sur ${selectedSystem.name} (${selectedSystem.manufacturer}). Titre emblématique de l'ère ${selectedSystem.generation} sorti en ${currentGame.metadata?.releaseDate ? currentGame.metadata.releaseDate.substring(0, 4) : selectedSystem.releaseYear}, ce jeu tire parti de l'architecture matérielle de la console (${selectedSystem.specs.cpu}, ${selectedSystem.specs.gpuOrAudio}) pour offrir des sensations d'arcade inoubliables.`}
                      </p>
                    </div>

                    {/* 6. Raccourcis Modules Rétro Rapides */}
                    <div className="flex items-center gap-2 flex-wrap pt-0.5">
                      {onOpenUserManualPdf && (
                        <button
                          onClick={() => {
                            playSelect();
                            onOpenUserManualPdf();
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                          title="Consulter le guide officiel et les notices d'époque"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                          <span>Guide & Notices</span>
                        </button>
                      )}
                      {onOpenAchievements && (
                        <button
                          onClick={() => {
                            playSelect();
                            onOpenAchievements();
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                          title="Consulter les succès RetroAchievements"
                        >                            <Trophy className="w-3.5 h-3.5 text-retro-pink" />
                          <span>Succès Rétro</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 7. Boutons d'action principaux en bas */}
                  <div className="flex items-center space-x-3 pt-4 mt-4 border-t border-slate-800">
                    <button
                      onClick={() => { playLaunch(); onLaunchGame(currentGame); }}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-retro-accent via-emerald-400 to-retro-green text-retro-900 font-black text-sm shadow-neon hover:scale-102 active:scale-98 transition flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>APPUYEZ SUR A POUR JOUER</span>
                    </button>
                    <button
                      onClick={() => { playFavorite(); onToggleFavorite(currentGame.id); }}
                      className={`p-3 rounded-xl border transition cursor-pointer ${
                        currentGame.favorite ? 'bg-rose-500 text-white border-rose-400 shadow-neon-pink' : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                      title="Ajouter aux favoris (Touche Y / F)"
                    >
                      <Heart className={`w-4 h-4 ${currentGame.favorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => { playSelect(); onViewDetails(currentGame); }}
                      className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-retro-accent/60 transition cursor-pointer flex items-center space-x-2 text-xs font-bold"
                      title="Ouvrir la fiche complète détaillée (Touche X / D)"
                    >
                      <Eye className="w-4 h-4 text-retro-accent" />
                      <span className="hidden sm:inline">Fiche complète</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
