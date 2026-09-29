import React, { useState, useEffect } from 'react';
import { Game, System, EmulatorProfile } from '../types';
import {
  X,
  Play,
  Heart,
  RefreshCw,
  Calendar,
  Users,
  Star,
  Award,
  HardDrive,
  Hash,
  Terminal,
  Pencil,
  Trophy,
  Code2,
  BookOpen,
  Trash2,
  Tag,
  Video,
  FileText,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { ConsoleLogo } from './ConsoleLogo';
import { resolveMediaUrl } from '../utils/media';

interface GameDetailModalProps {
  game: Game | null;
  system?: System;
  emulators?: EmulatorProfile[];
  onClose: () => void;
  onLaunch: (game: Game, emulatorId?: string) => void;
  onToggleFavorite: (gameId: string) => void;
  onScrapeGame: (game: Game) => void;
  onOpenCandidateSearch?: (game: Game) => void;
  onEdit?: (game: Game) => void;
  onDeleteGame?: (game: Game) => void;
  isKioskMode?: boolean;
  isScraping?: boolean;
  onOpenAchievements?: (game: Game) => void;
  onOpenCheats?: (game: Game) => void;
  onOpenSaveStates?: (game: Game) => void;
  onOpenManual?: (game: Game) => void;
  onFilterByGenre?: (genre: string) => void;
}

type MediaTab = 'boxart' | 'boxart3d' | 'snap' | 'title' | 'video' | 'manual';

export const GameDetailModal: React.FC<GameDetailModalProps> = ({
  game,
  system,
  emulators = [],
  onClose,
  onLaunch,
  onToggleFavorite,
  onScrapeGame,
  onOpenCandidateSearch,
  onEdit,
  onDeleteGame,
  isKioskMode = false,
  isScraping,

  onOpenAchievements,
  onOpenCheats,
  onOpenSaveStates,
  onOpenManual,
  onFilterByGenre,
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<MediaTab>('boxart');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedEmulatorId, setSelectedEmulatorId] = useState<string>('retroarch');
  // Image cassée détectée (URL morte, 404...) : on propose la recherche
  const [boxartBroken, setBoxartBroken] = useState(false);
  const [snapBroken, setSnapBroken] = useState(false);

  useEffect(() => {
    setBoxartBroken(false);
    setSnapBroken(false);
  }, [game?.id, game?.media?.boxart2d, game?.media?.boxart3d, game?.scrapedAt]);

  if (!game) return null;

  const boxartUrl = resolveMediaUrl(game.media?.boxart2d) || null;
  const boxart3dUrl = resolveMediaUrl(game.media?.boxart3d) || null;
  const snapUrl = resolveMediaUrl(game.media?.snap) || null;
  const titleUrl = resolveMediaUrl(game.media?.titleScreen) || null;
  const videoUrl = resolveMediaUrl(game.media?.video) || null;
  const manualUrl = resolveMediaUrl(game.media?.manual) || null;
  const wheelUrl = resolveMediaUrl(game.media?.wheel) || null;

  // Taille formatée
  const sizeMb = (game.size / (1024 * 1024)).toFixed(2);

  return (
    <div className="retromad-modal-overlay">
      <div className="retromad-modal-card max-w-4xl max-h-[90vh]">
        {/* En-tête avec bouton fermer */}
        <div className="retromad-modal-header">
          <div className="flex items-center space-x-3.5">
            {system && (
              <div
                style={{
                  backgroundColor: `${system.themeColor}15`,
                  borderColor: `${system.themeColor}55`,
                }}
                className="px-3 py-1 rounded-xl border flex items-center justify-center max-w-[130px]"
              >
                <ConsoleLogo system={system} size="sm" />
              </div>
            )}
            <h2 className="text-lg font-bold text-white truncate max-w-lg">
              {game.cleanTitle}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            {!isKioskMode && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(game)}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-bold transition flex items-center space-x-1.5 shadow"
                title="Éditer les informations de ce jeu"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Éditer</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="retromad-modal-close-btn"
              title="Fermer (Échap)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Corps de la modale */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Colonne gauche : Médias Complets (2D, 3D, Snap, Titre, Vidéo MP4, Notice PDF) */}
          <div className="md:col-span-5 flex flex-col space-y-3">
            <div className="relative aspect-[3/4] w-full rounded-2xl bg-black/60 border border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl p-2 relative">
              {/* Logo Wheel / ClearLogo transparent en haut à droite */}
              {wheelUrl && (
                <div className="absolute top-2 right-2 max-w-[95px] max-h-[45px] z-20 pointer-events-none drop-shadow-lg">
                  <img src={wheelUrl} alt="" className="w-full h-full object-contain" />
                </div>
              )}

              {/* 1. Onglet Jaquette 2D */}
              {activeMediaTab === 'boxart' && (
                boxartUrl && !boxartBroken ? (
                  <img
                    src={boxartUrl}
                    alt={game.title}
                    className="w-full h-full object-contain drop-shadow-2xl animate-in zoom-in-95 duration-200"
                    onError={() => setBoxartBroken(true)}
                  />
                ) : (
                  <div className="text-center p-6 text-slate-500">
                    <p className="text-xs">{boxartBroken ? 'Jaquette inaccessible' : 'Jaquette non disponible'}</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-3">
                      <button
                        onClick={() => {
                          setBoxartBroken(false);
                          onScrapeGame(game);
                        }}
                        disabled={isScraping}
                        className="px-3 py-1.5 rounded-lg bg-retro-accent/20 text-retro-accent border border-retro-accent/40 text-xs font-bold hover:bg-retro-accent/30 transition flex items-center space-x-1.5"
                      >
                        <RefreshCw className={`w-3 h-3 ${isScraping ? 'animate-spin' : ''}`} />
                        <span>Scraper auto</span>
                      </button>
                      {onOpenCandidateSearch && (
                        <button
                          onClick={() => onOpenCandidateSearch(game)}
                          disabled={isScraping}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 transition flex items-center space-x-1.5"
                        >
                          <Search className="w-3 h-3" />
                          <span>Titres similaires</span>
                        </button>
                      )}
                    </div>
                  </div>

                )
              )}

              {/* 2. Onglet Boîte 3D */}
              {activeMediaTab === 'boxart3d' && (
                boxart3dUrl ? (
                  <img
                    src={boxart3dUrl}
                    alt={`${game.title} 3D`}
                    className="w-full h-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-200"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-500 text-xs space-y-2">
                    <p>Boîte 3D non disponible</p>
                    <button
                      onClick={() => onScrapeGame(game)}
                      disabled={isScraping}
                      className="px-3 py-1.5 rounded-lg bg-retro-accent/20 text-retro-accent border border-retro-accent/40 text-xs font-bold hover:bg-retro-accent/30 transition flex items-center space-x-1.5 mx-auto"
                    >
                      <RefreshCw className={`w-3 h-3 ${isScraping ? 'animate-spin' : ''}`} />
                      <span>Rechercher boîte 3D</span>
                    </button>
                  </div>
                )
              )}

              {/* 3. Onglet Capture de jeu (Snap) */}
              {activeMediaTab === 'snap' && (
                snapUrl && !snapBroken ? (
                  <img
                    src={snapUrl}
                    alt="Capture de jeu"
                    className="w-full h-full object-contain animate-in zoom-in-95 duration-200"
                    onError={() => setSnapBroken(true)}
                  />
                ) : (
                  <div className="text-center p-6 text-slate-500 text-xs space-y-2">
                    <p>Aucune capture d'écran disponible</p>
                    <button
                      onClick={() => onScrapeGame(game)}
                      disabled={isScraping}
                      className="px-3 py-1.5 rounded-lg bg-retro-accent/20 text-retro-accent border border-retro-accent/40 text-xs font-bold hover:bg-retro-accent/30 transition flex items-center space-x-1.5 mx-auto"
                    >
                      <RefreshCw className={`w-3 h-3 ${isScraping ? 'animate-spin' : ''}`} />
                      <span>Rechercher captures</span>
                    </button>
                  </div>
                )
              )}

              {/* 4. Onglet Écran Titre */}
              {activeMediaTab === 'title' && (
                titleUrl ? (
                  <img
                    src={titleUrl}
                    alt="Écran titre"
                    className="w-full h-full object-contain animate-in zoom-in-95 duration-200"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-500 text-xs space-y-2">
                    <p>Écran-titre non trouvé</p>
                    <button
                      onClick={() => onScrapeGame(game)}
                      disabled={isScraping}
                      className="px-3 py-1.5 rounded-lg bg-retro-accent/20 text-retro-accent border border-retro-accent/40 text-xs font-bold hover:bg-retro-accent/30 transition flex items-center space-x-1.5 mx-auto"
                    >
                      <RefreshCw className={`w-3 h-3 ${isScraping ? 'animate-spin' : ''}`} />
                      <span>Rechercher titre</span>
                    </button>
                  </div>
                )
              )}

              {/* 5. Onglet Vidéo de Gameplay MP4 */}
              {activeMediaTab === 'video' && (
                videoUrl ? (
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain rounded-xl shadow-lg"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-500 text-xs space-y-2">
                    <Video className="w-8 h-8 text-slate-600 mx-auto" />
                    <p>Aucun clip vidéo de gameplay scrapé</p>
                    <button
                      onClick={() => onScrapeGame(game)}
                      disabled={isScraping}
                      className="px-3 py-1.5 rounded-lg bg-retro-accent/20 text-retro-accent border border-retro-accent/40 text-xs font-bold hover:bg-retro-accent/30 transition flex items-center space-x-1.5 mx-auto"
                    >
                      <RefreshCw className={`w-3 h-3 ${isScraping ? 'animate-spin' : ''}`} />
                      <span>Rechercher vidéo MP4</span>
                    </button>
                  </div>
                )
              )}

              {/* 6. Onglet Notice / Manuel PDF Officiel */}
              {activeMediaTab === 'manual' && (
                manualUrl ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center space-y-3 bg-slate-900/90 rounded-xl">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">Notice Officielle du Jeu</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Livret d'époque scanné (format PDF)</div>
                    </div>
                    <a
                      href={manualUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg transition flex items-center space-x-2 cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Ouvrir la notice complète</span>
                    </a>
                  </div>
                ) : (
                  <div className="text-center p-6 text-slate-500 text-xs space-y-2">
                    <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
                    <p>Aucune notice PDF enregistrée pour ce jeu</p>
                    <button
                      onClick={() => onScrapeGame(game)}
                      disabled={isScraping}
                      className="px-3 py-1.5 rounded-lg bg-retro-accent/20 text-retro-accent border border-retro-accent/40 text-xs font-bold hover:bg-retro-accent/30 transition flex items-center space-x-1.5 mx-auto"
                    >
                      <RefreshCw className={`w-3 h-3 ${isScraping ? 'animate-spin' : ''}`} />
                      <span>Rechercher le manuel PDF</span>
                    </button>
                  </div>
                )
              )}
            </div>

            {/* Switch Médias complet (2D, 3D, Gameplay, Titre, Vidéo, Notice) */}
            <div className="grid grid-cols-6 gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-[10px] font-bold">
              <button
                onClick={() => setActiveMediaTab('boxart')}
                className={`py-1.5 rounded-lg transition ${activeMediaTab === 'boxart' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                title="Jaquette standard 2D"
              >
                2D
              </button>
              <button
                onClick={() => setActiveMediaTab('boxart3d')}
                className={`py-1.5 rounded-lg transition relative ${activeMediaTab === 'boxart3d' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                title="Boîtier 3D avec tranche"
              >
                3D
                {boxart3dUrl && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-400" />}
              </button>
              <button
                onClick={() => setActiveMediaTab('snap')}
                className={`py-1.5 rounded-lg transition ${activeMediaTab === 'snap' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                title="Capture d'écran du gameplay"
              >
                Jeu
              </button>
              <button
                onClick={() => setActiveMediaTab('title')}
                className={`py-1.5 rounded-lg transition relative ${activeMediaTab === 'title' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                title="Écran titre du jeu"
              >
                Titre
                {titleUrl && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-400" />}
              </button>
              <button
                onClick={() => setActiveMediaTab('video')}
                className={`py-1.5 rounded-lg transition relative flex items-center justify-center space-x-0.5 ${activeMediaTab === 'video' ? 'bg-retro-accent/30 text-retro-accent shadow' : 'text-slate-400 hover:text-slate-200'}`}
                title="Clip vidéo de démonstration"
              >
                <span>Vidéo</span>
                {videoUrl && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </button>
              <button
                onClick={() => setActiveMediaTab('manual')}
                className={`py-1.5 rounded-lg transition relative flex items-center justify-center space-x-0.5 ${activeMediaTab === 'manual' ? 'bg-amber-500/30 text-amber-300 shadow' : 'text-slate-400 hover:text-slate-200'}`}
                title="Notice et manuel PDF d'époque"
              >
                <span>Notice</span>
                {manualUrl && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
              </button>
            </div>
          </div>

          {/* Colonne droite : Métadonnées et Synopsis */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Infos clés (Studio, Date, Joueurs, Note) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center space-x-3">
                  <Award className="w-5 h-5 text-retro-accent shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Développeur</span>
                    <span className="text-xs font-bold text-slate-200 truncate block">
                      {game.metadata?.developer || 'Non renseigné'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-retro-pink shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Sortie</span>
                    <span className="text-xs font-bold text-slate-200">
                      {game.metadata?.releaseDate || 'Inconnue'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center space-x-3">
                  <Users className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Joueurs</span>
                    <span className="text-xs font-bold text-slate-200">
                      {game.metadata?.players ? `${game.metadata.players} joueur(s)` : '1 joueur'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center space-x-3">
                  <Star className="w-5 h-5 text-amber-400 shrink-0 fill-amber-400" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Note</span>
                    <span className="text-xs font-bold text-amber-400">
                      {game.metadata?.rating ? `${game.metadata.rating} / 100` : 'N/A'}
                    </span>
                  </div>
                </div>
                {game.metadata?.esrbOrPegi && (
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center space-x-3">
                    <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Classification</span>
                      <span className="text-xs font-bold text-indigo-300">
                        {game.metadata.esrbOrPegi}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Genres */}
              {game.metadata?.genres && game.metadata.genres.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase mr-0.5">Genres :</span>
                  {game.metadata.genres.map((g, idx) => {
                    const parts = g.split(/[/,]/).map((p) => p.trim()).filter(Boolean);
                    return parts.map((genre) => (
                      <button
                        key={`${idx}-${genre}`}
                        type="button"
                        onClick={() => {
                          onFilterByGenre?.(genre);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400/60 text-[11px] font-medium text-slate-300 hover:text-cyan-200 transition cursor-pointer flex items-center gap-1.5 shadow-sm group"
                        title={`Filtrer tous les jeux du genre &laquo; ${genre} &raquo;`}
                      >
                        <Tag className="w-3 h-3 text-cyan-400 group-hover:scale-110 transition-transform" />
                        <span>{genre}</span>
                      </button>
                    ));
                  })}
                </div>
              )}

              {/* Synopsis */}
              <div>
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                  Histoire & Synopsis
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed max-h-36 overflow-y-auto pr-2 bg-slate-800/30 p-3 rounded-xl border border-slate-800">
                  {game.metadata?.synopsis ||
                    "Aucun résumé disponible pour ce titre. Cliquez sur 'Rescraper' pour interroger les bases de données retrogaming."}
                </p>
              </div>

              {/* Fichier & Technique */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
                <div className="flex items-center space-x-2 truncate">
                  <HardDrive className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{game.filename} ({sizeMb} MB)</span>
                </div>
                {game.crc32 && (
                  <div className="flex items-center space-x-2">
                    <Hash className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>CRC32: {game.crc32}</span>
                    {game.md5 && <span className="ml-3">MD5: {game.md5.substring(0, 8)}...</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Barre Outils Rétro (Succès, Cheats, Save States, Manuel) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                onClick={() => onOpenAchievements?.(game)}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition"
                title="Consulter les trophées et succès pour ce jeu"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Succès</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenCheats?.(game)}
                className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition"
                title="Codes de triche Game Genie & Action Replay"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Cheats</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenSaveStates?.(game)}
                className="px-2.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition"
                title="Gestionnaire d'instantanés et sauvegardes cartouches"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Save States</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (manualUrl) {
                    setActiveMediaTab('manual');
                  } else {
                    onOpenManual?.(game);
                  }
                }}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                  manualUrl
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50 text-amber-300 shadow'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                }`}
                title="Lire la notice et le manuel officiel d'époque (PDF)"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{manualUrl ? 'Notice PDF' : 'Manuel'}</span>
              </button>
            </div>

            {/* Sélecteur d'émulateur si plusieurs choix possibles */}
            {emulators.length > 0 && (
              <div className="flex items-center space-x-2 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                <Terminal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-400 text-[11px]">Lanceur :</span>
                <select
                  value={selectedEmulatorId}
                  onChange={(e) => setSelectedEmulatorId(e.target.value)}
                  className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer flex-1"
                >
                  {emulators
                    .filter((e) => e.supportedSystems.includes('all') || e.supportedSystems.includes(game.systemId))
                    .map((emu) => (
                      <option key={emu.id} value={emu.id} className="bg-retro-900 text-white">
                        {emu.name} {emu.isDetected ? '(Détecté)' : ''}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Confirmation suppression si active */}
            {showDeleteConfirm && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
                <span className="text-rose-200 font-semibold">
                  Supprimer définitivement ce jeu de la bibliothèque ?
                </span>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (onDeleteGame) onDeleteGame(game);
                      setShowDeleteConfirm(false);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition"
                  >
                    Confirmer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Barre d'action inférieure */}
            <div className="pt-2 border-t border-slate-800 flex items-center space-x-3">
              <button
                onClick={() => onLaunch(game, selectedEmulatorId)}
                className="flex-1 flex items-center justify-center space-x-2.5 py-3 rounded-xl bg-gradient-to-r from-retro-accent to-emerald-400 text-retro-900 font-extrabold text-sm shadow-neon hover:scale-[1.02] active:scale-95 transition"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>LANCER LE JEU</span>
              </button>

              <button
                onClick={() => onToggleFavorite(game.id)}
                className={`p-3 rounded-xl border transition ${
                  game.favorite
                    ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
                }`}
                title="Ajouter aux favoris"
              >
                <Heart className={`w-5 h-5 ${game.favorite ? 'fill-current' : ''}`} />
              </button>

              {!isKioskMode && onEdit && (
                <button
                  onClick={() => onEdit(game)}
                  className="p-3 rounded-xl bg-slate-800/80 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/20 transition font-bold"
                  title="Éditer les données, jaquette et options de ce jeu"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={() => onScrapeGame(game)}
                disabled={isScraping}
                className="p-3 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 transition disabled:opacity-50"
                title="Rescraper les métadonnées et jaquettes automatiquement"
              >
                <RefreshCw className={`w-5 h-5 ${isScraping ? 'animate-spin text-retro-accent' : ''}`} />
              </button>

              {onOpenCandidateSearch && (
                <button
                  onClick={() => onOpenCandidateSearch(game)}
                  disabled={isScraping}
                  className="p-3 rounded-xl bg-slate-800/80 text-amber-300 border border-slate-700 hover:text-amber-200 hover:border-amber-500/50 hover:bg-amber-500/10 transition disabled:opacity-50"
                  title="Choisir parmi les titres similaires / Corriger l'association"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}


              {!isKioskMode && onDeleteGame && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-3 rounded-xl bg-slate-800/80 text-rose-400 border border-slate-700 hover:bg-rose-500/20 hover:border-rose-500/50 transition font-bold"
                  title="Supprimer ce jeu définitivement"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
