import React, { useState, useRef, useEffect } from 'react';
import {
  Gamepad2, Landmark, Cpu, Settings, Sparkles,
  Volume2, VolumeX, Lock, Unlock, ShieldCheck, DownloadCloud,
  Tv, Search, ChevronDown, Dices, Trophy,
  BookOpen, Swords, HardDrive, Code2, Disc3,
  BarChart3, Users, History, Printer, PackageCheck, Smartphone, Beer, FolderSearch, Palette,
  Key, Wifi, Projector, FolderPlus, Flame, Timer, Layers, RefreshCw,
  Rocket, Tag, X
} from 'lucide-react';

export type NavTab = 'games' | 'companies' | 'computing' | 'bios' | 'settings';

interface NavigationProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onScan: () => void;
  onScrape: () => void;
  onOpenExtensions: () => void;
  onOpenSearch: () => void;
  isScanning: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  crtEnabled?: boolean;
  onToggleCrt?: () => void;
  bgmActive?: boolean;
  onToggleBgm?: () => void;
  totalGames: number;
  isKioskMode: boolean;
  onEnterKiosk: () => void;
  onUnlockKiosk: () => void;
  onOpenQuickStart?: () => void;
  // Filtrage par Genre
  selectedGenre?: string;
  onSelectGenre?: (genre: string) => void;
  availableGenres?: { genre: string; count: number }[];
  // 8 Features Rétro
  onOpenRoulette?: () => void;
  onOpenAchievements?: () => void;
  onOpenJukebox?: () => void;
  onOpenTournament?: () => void;
  onOpenManuals?: () => void;
  onOpenBezelStudio?: () => void;
  onOpenCheats?: () => void;
  onOpenSaveStates?: () => void;
  // Innovations & Gestion
  onOpenAnalytics?: () => void;
  onOpenGamepadTester?: () => void;
  onOpenProfiles?: () => void;
  onOpenTimeline?: () => void;
  onOpenPrintStudio?: () => void;
  onOpenNomadBackup?: () => void;
  onOpenHandheldOverlays?: () => void;
  onOpenArcadeParty?: () => void;
  onOpenMusicManager?: () => void;
  onOpenCentralizedStorage?: () => void;
  onOpenThemeStudio?: () => void;
  onOpenAttractMode?: () => void;
  onOpenPasswordNotebook?: () => void;
  onOpenLanManager?: () => void;
  onOpenProjectorModal?: () => void;
  isProjectorKioskRunning?: boolean;
  isJukeboxFloatingVisible?: boolean;
  isJukeboxMuted?: boolean;
  onOpenUserManualPdf?: () => void;
  // 4 Nouvelles Expériences Majeures
  onOpenShaderProfiles?: () => void;
  onOpenSpeedrun?: () => void;
  onOpenCartridgeShelf?: () => void;
  onOpenSaveStateSync?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  onScan,
  onScrape,
  onOpenExtensions,
  onOpenSearch,
  isScanning,
  soundEnabled,
  onToggleSound,
  crtEnabled = false,
  onToggleCrt,
  bgmActive = false,
  onToggleBgm,
  totalGames,
  isKioskMode,
  onEnterKiosk,
  onUnlockKiosk,
  onOpenQuickStart,
  selectedGenre = 'all',
  onSelectGenre,
  availableGenres = [],
  onOpenRoulette,
  onOpenAchievements,
  onOpenJukebox,
  onOpenTournament,
  onOpenManuals,
  onOpenBezelStudio,
  onOpenCheats,
  onOpenSaveStates,
  onOpenAnalytics,
  onOpenGamepadTester,
  onOpenProfiles,
  onOpenTimeline,
  onOpenPrintStudio,
  onOpenNomadBackup,
  onOpenHandheldOverlays,
  onOpenArcadeParty,
  onOpenMusicManager,
  onOpenCentralizedStorage,
  onOpenThemeStudio,
  onOpenAttractMode,
  onOpenPasswordNotebook,
  onOpenLanManager,
  onOpenProjectorModal,
  isProjectorKioskRunning: _isProjectorKioskRunning,
  isJukeboxFloatingVisible: _isJukeboxFloatingVisible,
  isJukeboxMuted,
  onOpenUserManualPdf,
  onOpenShaderProfiles,
  onOpenSpeedrun,
  onOpenCartridgeShelf,
  onOpenSaveStateSync,
}) => {
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [retroLabOpen, setRetroLabOpen] = useState(false);
  const [genreMenuOpen, setGenreMenuOpen] = useState(false);
  const [genreSearch, setGenreSearch] = useState('');
  const adminRef = useRef<HTMLDivElement>(null);
  const retroLabRef = useRef<HTMLDivElement>(null);
  const genreRef = useRef<HTMLDivElement>(null);

  // Fermer les menus déroulants lors d'un clic en dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (adminRef.current && !adminRef.current.contains(e.target as Node)) {
        setAdminMenuOpen(false);
      }
      if (retroLabRef.current && !retroLabRef.current.contains(e.target as Node)) {
        setRetroLabOpen(false);
      }
      if (genreRef.current && !genreRef.current.contains(e.target as Node)) {
        setGenreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getGenreIcon = (genre: string) => {
    const g = genre.toLowerCase();
    if (g.includes('plateforme')) return <Gamepad2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    if (g.includes('aventure') || g.includes('action')) return <Swords className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    if (g.includes('rpg') || g.includes('rôle')) return <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
    if (g.includes('combat') || g.includes('fight') || g.includes('beat')) return <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
    if (g.includes('course') || g.includes('vitesse') || g.includes('race')) return <Timer className="w-3.5 h-3.5 text-yellow-400 shrink-0" />;
    if (g.includes('puzzle') || g.includes('réflexion')) return <Dices className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    if (g.includes('arcade')) return <Tv className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />;
    if (g.includes('sport')) return <Trophy className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    return <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  const filteredGenreList = (availableGenres || []).filter(({ genre }) =>
    !genreSearch.trim() || genre.toLowerCase().includes(genreSearch.trim().toLowerCase())
  );

  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800 shadow-[0_4px_25px_rgba(0,0,0,0.5)] px-2 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-2 z-30 select-none shrink-0 overflow-visible">

      {/* ── PARTIE GAUCHE : Logo + Onglets Principaux + Menus Déroulants + Kiosque ── */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 py-1 shrink">
        {/* Logo */}
        <div
          className="flex items-center space-x-2 cursor-pointer shrink-0 group mr-0.5 sm:mr-1"
          onClick={() => onTabChange('games')}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-retro-purple to-retro-accent flex items-center justify-center shadow-neon group-hover:scale-105 transition shrink-0">
            <Gamepad2 className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-base font-black tracking-wider bg-gradient-to-r from-retro-accent via-white to-retro-pink bg-clip-text text-transparent">
                RETROMAD
              </span>
              {isKioskMode ? (
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" />KIOSK
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" />ADMIN
                </span>
              )}
            </div>
            <span className="text-[8px] tracking-widest text-slate-400 uppercase font-semibold mt-0.5">
              Frontend Arcade
            </span>
          </div>
        </div>

        <div className="w-px h-6 bg-slate-700/60 shrink-0 hidden md:block" />

        {/* ── Onglets Primaires (Jeux & Firmes) ── */}
        <nav className="flex items-center gap-0.5 sm:gap-1 bg-slate-900/90 p-0.5 rounded-xl border border-slate-800 shrink-0">
          <NavBtn
            active={currentTab === 'games'}
            onClick={() => onTabChange('games')}
            icon={<Gamepad2 className="w-3.5 h-3.5" />}
            label="Jeux"
            badge={totalGames > 0 ? String(totalGames) : undefined}
          />
          <NavBtn
            active={currentTab === 'computing'}
            onClick={() => onTabChange('computing')}
            icon={<HardDrive className="w-3.5 h-3.5" />}
            label="Info"
            badge="OS"
          />
          <NavBtn
            active={currentTab === 'companies'}
            onClick={() => onTabChange('companies')}
            icon={<Landmark className="w-3.5 h-3.5" />}
            label="Firmes"
            badge="Musée"
          />
        </nav>

        {/* ── MENU DÉROULANT / BOUTON : FILTRER PAR GENRE ── */}
        <div className="relative shrink-0" ref={genreRef}>
          <button
            type="button"
            onClick={() => {
              setGenreMenuOpen((p) => !p);
              setAdminMenuOpen(false);
              setRetroLabOpen(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
              selectedGenre && selectedGenre !== 'all'
                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                : genreMenuOpen
                ? 'bg-slate-800 border-slate-600 text-white'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-500'
            }`}
            title="Filtrer la bibliothèque par genre de jeu"
          >
            {selectedGenre && selectedGenre !== 'all' ? (
              getGenreIcon(selectedGenre)
            ) : (
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="max-w-[100px] truncate">
              {selectedGenre && selectedGenre !== 'all' ? selectedGenre : 'Genres'}
            </span>

            {selectedGenre && selectedGenre !== 'all' ? (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectGenre?.('all');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    onSelectGenre?.('all');
                  }
                }}
                className="ml-0.5 p-0.5 rounded-md hover:bg-cyan-400/30 text-cyan-300 transition"
                title="Effacer le filtre par genre"
              >
                <X className="w-3 h-3" />
              </span>
            ) : (
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${genreMenuOpen ? 'rotate-180' : ''}`} />
            )}
          </button>

          {genreMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-72 max-h-[82vh] flex flex-col bg-[#091228]/98 border border-cyan-500/40 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
              {/* Header */}
              <div className="px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] font-black text-slate-200 uppercase tracking-wider">
                    Genres ({availableGenres?.length || 0})
                  </span>
                </div>
                {selectedGenre && selectedGenre !== 'all' && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectGenre?.('all');
                      setGenreMenuOpen(false);
                    }}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-0.5 font-semibold"
                  >
                    <X className="w-3 h-3" />
                    <span>Réinitialiser</span>
                  </button>
                )}
              </div>

              {/* Champ de recherche rapide de genre */}
              {availableGenres && availableGenres.length > 4 && (
                <div className="p-2 border-b border-slate-800/60 bg-slate-950/40">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      value={genreSearch}
                      onChange={(e) => setGenreSearch(e.target.value)}
                      placeholder="Chercher un genre..."
                      className="w-full bg-slate-900/90 border border-slate-700/60 rounded-lg pl-8 pr-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 transition"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {/* Liste des genres */}
              <div className="p-1.5 overflow-y-auto max-h-[55vh] space-y-0.5 custom-scrollbar">
                {/* Option Tous les genres */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectGenre?.('all');
                    if (currentTab !== 'games') onTabChange('games');
                    setGenreMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    !selectedGenre || selectedGenre === 'all'
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Tous les genres</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {totalGames}
                  </span>
                </button>

                {/* Genres filtrés */}
                {filteredGenreList.map(({ genre, count }) => {
                  const isSelected = selectedGenre?.toLowerCase() === genre.toLowerCase();
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => {
                        onSelectGenre?.(genre);
                        if (currentTab !== 'games') onTabChange('games');
                        setGenreMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                        isSelected
                          ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 font-bold shadow-[0_0_8px_rgba(0,242,254,0.2)]'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {getGenreIcon(genre)}
                        <span className="truncate">{genre}</span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-cyan-400/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}

                {filteredGenreList.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-500">
                    Aucun genre trouvé pour &laquo; {genreSearch} &raquo;
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── MENU DÉROULANT : ADMINISTRATION (Tout l'admin regroupé) ── */}
        {!isKioskMode && (
          <div className="relative shrink-0" ref={adminRef}>
            <button
              type="button"
              onClick={() => {
                setAdminMenuOpen((p) => !p);
                setRetroLabOpen(false);
              }}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
                adminMenuOpen || currentTab === 'settings' || currentTab === 'bios'
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,242,254,0.3)]'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-200 hover:text-white hover:border-slate-500'
              }`}
              title="Centre d'administration et configuration complète"
            >
              <Settings className={`w-3.5 h-3.5 text-cyan-400 ${adminMenuOpen ? 'animate-spin-slow' : ''}`} />
              <span className="hidden md:inline">Administration</span>
              <span className="md:hidden">Admin</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {adminMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 max-h-[82vh] overflow-y-auto bg-[#091228]/98 border border-cyan-500/40 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150">
                {/* Section Gestion ROMs & Système */}
                <div className="px-3.5 py-1 text-[10px] font-black text-cyan-400 uppercase tracking-widest border-b border-slate-800/80 mb-1 flex items-center justify-between">
                  <span>GESTION DE LA LUDOTHÈQUE</span>
                  <span className="font-mono text-cyan-400/80">CORE</span>
                </div>

                <MenuAction
                  icon={<Rocket className="w-4 h-4 text-emerald-400" />}
                  label="Assistant de Démarrage Rapide"
                  badge="Guide"
                  badgeColor="bg-emerald-500/20 text-emerald-300"
                  onClick={() => {
                    onOpenQuickStart?.();
                    setAdminMenuOpen(false);
                  }}
                  className="text-emerald-100 hover:bg-emerald-500/15 font-bold"
                />

                <MenuAction
                  icon={<FolderSearch className="w-4 h-4 text-cyan-400" />}
                  label="Scanner & Ajouter des ROMs"
                  badge="Nouveau"
                  badgeColor="bg-cyan-500/20 text-cyan-300"
                  onClick={() => {
                    onScan();
                    setAdminMenuOpen(false);
                  }}
                  className="text-cyan-100 hover:bg-cyan-500/15 font-bold"
                />

                <MenuAction
                  icon={<Settings className="w-4 h-4 text-amber-400" />}
                  label="Centre Admin & Paramètres"
                  onClick={() => {
                    onTabChange('settings');
                    setAdminMenuOpen(false);
                  }}
                  className="text-slate-200 hover:bg-slate-800/60"
                />

                <MenuAction
                  icon={<Cpu className="w-4 h-4 text-emerald-400" />}
                  label="Gestionnaire de BIOS & Check"
                  onClick={() => {
                    onTabChange('bios');
                    setAdminMenuOpen(false);
                  }}
                  className="text-slate-200 hover:bg-slate-800/60"
                />

                <MenuAction
                  icon={<Sparkles className="w-4 h-4 text-pink-400" />}
                  label="Scraper Jaquettes & Médias"
                  onClick={() => {
                    onScrape();
                    setAdminMenuOpen(false);
                  }}
                  className="text-slate-200 hover:bg-slate-800/60"
                />

                <MenuAction
                  icon={<DownloadCloud className="w-4 h-4 text-purple-400" />}
                  label="Télécharger Émulateurs & Cœurs"
                  onClick={() => {
                    onOpenExtensions();
                    setAdminMenuOpen(false);
                  }}
                  className="text-slate-200 hover:bg-slate-800/60"
                />

                <MenuAction
                  icon={<HardDrive className="w-4 h-4 text-sky-400" />}
                  label="Répertoire Centralisé (/public Hub)"
                  onClick={() => {
                    onOpenCentralizedStorage?.();
                    setAdminMenuOpen(false);
                  }}
                  className="text-slate-200 hover:bg-slate-800/60 font-semibold"
                />

                <MenuAction
                  icon={<Wifi className="w-4 h-4 text-teal-400" />}
                  label="Passerelle LAN (Dépose sans fil & FTP)"
                  onClick={() => {
                    onOpenLanManager?.();
                    setAdminMenuOpen(false);
                  }}
                  className="text-slate-200 hover:bg-slate-800/60"
                />

                <MenuAction
                  icon={<RefreshCw className="w-4 h-4 text-emerald-400" />}
                  label="Synchro Sauvegardes P2P & Multi-Postes"
                  badge="Cloud/LAN"
                  badgeColor="bg-emerald-500/20 text-emerald-300"
                  onClick={() => {
                    onOpenSaveStateSync?.();
                    setAdminMenuOpen(false);
                  }}
                  className="text-emerald-100 hover:bg-emerald-500/15 font-semibold"
                />

                {/* Section Affichage & Borne */}
                <div className="px-3.5 py-1 text-[10px] font-black text-pink-400 uppercase tracking-widest border-b border-t border-slate-800/80 my-1 flex items-center justify-between">
                  <span>AFFICHAGE & BORNE ARCADE</span>
                  <span className="font-mono text-pink-400/80">STUDIO</span>
                </div>

                <MenuAction
                  icon={<Tv className="w-4 h-4 text-cyan-400" />}
                  label="Profils Shaders Rétro (Trinitron, 15kHz)"
                  badge="Immersion"
                  badgeColor="bg-cyan-500/20 text-cyan-300"
                  onClick={() => {
                    onOpenShaderProfiles?.();
                    setAdminMenuOpen(false);
                  }}
                  className="text-cyan-100 hover:bg-cyan-500/15 font-bold"
                />

                <MenuAction
                  icon={<Palette className="w-4 h-4 text-pink-400" />}
                  label="Atelier de Thèmes Communautaires"
                  onClick={() => {
                    onOpenThemeStudio?.();
                    setAdminMenuOpen(false);
                  }}
                  className="text-slate-200 hover:bg-slate-800/60"
                />

                <MenuAction
                  icon={<Tv className="w-4 h-4 text-blue-400" />}
                  label="Studio Bezels & Shaders CRT"
                  onClick={() => {
                    onOpenBezelStudio?.();
                    setAdminMenuOpen(false);
                  }}
                  className="text-slate-200 hover:bg-slate-800/60"
                />

                {onOpenProjectorModal && (
                  <MenuAction
                    icon={<Projector className="w-4 h-4 text-sky-400" />}
                    label="Rétroprojecteur & 2ème Écran"
                    onClick={() => {
                      onOpenProjectorModal();
                      setAdminMenuOpen(false);
                    }}
                    className="text-slate-200 hover:bg-slate-800/60"
                  />
                )}

                {/* Section Sécurité & Aide */}
                <div className="px-3.5 py-1 text-[10px] font-black text-amber-400 uppercase tracking-widest border-b border-t border-slate-800/80 my-1 flex items-center justify-between">
                  <span>SÉCURITÉ & AIDE</span>
                </div>

                <MenuAction
                  icon={<Lock className="w-4 h-4 text-amber-400" />}
                  label="Verrouiller en Mode Kiosk (Arcade)"
                  onClick={() => {
                    onEnterKiosk();
                    setAdminMenuOpen(false);
                  }}
                  className="text-amber-200 hover:bg-amber-500/15 font-bold"
                />

                {onOpenUserManualPdf && (
                  <MenuAction
                    icon={<BookOpen className="w-4 h-4 text-emerald-400" />}
                    label="Manuel Utilisateur Illustré (PDF / F1)"
                    onClick={() => {
                      onOpenUserManualPdf();
                      setAdminMenuOpen(false);
                    }}
                    className="text-emerald-300 hover:bg-emerald-500/15"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* ── MENU DÉROULANT : LABO RÉTRO (Toutes les features ludiques) ── */}
        <div className="relative shrink-0" ref={retroLabRef}>
          <button
            type="button"
            onClick={() => {
              setRetroLabOpen((p) => !p);
              setAdminMenuOpen(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
              retroLabOpen
                ? 'bg-purple-600/30 border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border-purple-500/40 text-purple-200 hover:text-white hover:border-purple-400'
            }`}
            title="Fonctionnalités ludiques, musique et bonus"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden md:inline">Labo Rétro</span>
            <span className="md:hidden">Labo</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${retroLabOpen ? 'rotate-180' : ''}`} />
          </button>

          {retroLabOpen && (
            <div className="absolute left-0 top-full mt-2 w-72 max-h-[82vh] overflow-y-auto bg-[#091228]/98 border border-purple-500/40 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-1 text-[10px] font-black text-amber-400 uppercase tracking-widest border-b border-slate-800/80 mb-1 flex items-center justify-between">
                <span>EXPÉRIENCES ARCADE</span>
                <span className="font-mono text-amber-400/80">★ EXCLUSIF</span>
              </div>

              <MenuAction
                icon={<Layers className="w-4 h-4 text-purple-400" />}
                label="Étagère 3D Cartouches Physiques"
                badge="3D"
                badgeColor="bg-purple-500/30 text-purple-300"
                onClick={() => {
                  onOpenCartridgeShelf?.();
                  setRetroLabOpen(false);
                }}
                className="text-purple-200 hover:bg-purple-500/15 font-bold"
              />

              <MenuAction
                icon={<Timer className="w-4 h-4 text-amber-400" />}
                label="Chronomètre Speedrun Arcade Pro"
                badge="Chrono"
                badgeColor="bg-amber-500/30 text-amber-300"
                onClick={() => {
                  onOpenSpeedrun?.();
                  setRetroLabOpen(false);
                }}
                className="text-amber-200 hover:bg-amber-500/15 font-bold"
              />

              <MenuAction
                icon={<Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />}
                label="Borne d'Arcade (Attract Mode 3D)"
                onClick={() => {
                  onOpenAttractMode?.();
                  setRetroLabOpen(false);
                }}
                className="text-pink-200 hover:bg-pink-500/15 font-bold"
              />

              <MenuAction
                icon={<Disc3 className="w-4 h-4 text-pink-400" />}
                label="Jukebox Chiptune 8/16-Bit"
                badge={bgmActive ? 'ON' : undefined}
                badgeColor="bg-pink-500/30 text-pink-300"
                onClick={() => {
                  onOpenJukebox?.();
                  setRetroLabOpen(false);
                }}
                className="text-pink-200 hover:bg-pink-500/15"
              />

              <MenuAction
                icon={<Dices className="w-4 h-4 text-cyan-400" />}
                label="Roulette Rétro & Défi du Jour"
                onClick={() => {
                  onOpenRoulette?.();
                  setRetroLabOpen(false);
                }}
                className="text-cyan-200 hover:bg-cyan-500/15"
              />

              <MenuAction
                icon={<Trophy className="w-4 h-4 text-amber-400" />}
                label="RetroAchievements & Succès"
                onClick={() => {
                  onOpenAchievements?.();
                  setRetroLabOpen(false);
                }}
                className="text-amber-200 hover:bg-amber-500/15"
              />

              <MenuAction
                icon={<Key className="w-4 h-4 text-yellow-400" />}
                label="Carnet de Passwords & Fiches"
                onClick={() => {
                  onOpenPasswordNotebook?.();
                  setRetroLabOpen(false);
                }}
                className="text-yellow-200 hover:bg-yellow-500/15"
              />

              <MenuAction
                icon={<Beer className="w-4 h-4 text-amber-400" />}
                label="Mode Soirée & Bar Arcade"
                onClick={() => {
                  onOpenArcadeParty?.();
                  setRetroLabOpen(false);
                }}
                className="text-amber-200 hover:bg-amber-500/15"
              />

              <div className="px-3.5 py-1 text-[10px] font-black text-cyan-400 uppercase tracking-widest border-b border-t border-slate-800/80 my-1 flex items-center justify-between">
                <span>OUTILS & GAMEPLAY</span>
                <span className="font-mono text-cyan-400/80">INNOVATION</span>
              </div>

              <MenuAction
                icon={<Gamepad2 className="w-4 h-4 text-purple-400" />}
                label="Testeur de Manette & Sticks"
                onClick={() => {
                  onOpenGamepadTester?.();
                  setRetroLabOpen(false);
                }}
                className="text-purple-200 hover:bg-purple-500/15"
              />

              <MenuAction
                icon={<BarChart3 className="w-4 h-4 text-cyan-400" />}
                label="Rétro Analytics & Journal"
                onClick={() => {
                  onOpenAnalytics?.();
                  setRetroLabOpen(false);
                }}
                className="text-cyan-200 hover:bg-cyan-500/15"
              />

              <MenuAction
                icon={<HardDrive className="w-4 h-4 text-teal-400" />}
                label="Save States & Cartes Mémoires"
                onClick={() => {
                  onOpenSaveStates?.();
                  setRetroLabOpen(false);
                }}
                className="text-teal-200 hover:bg-teal-500/15"
              />

              <MenuAction
                icon={<Code2 className="w-4 h-4 text-purple-400" />}
                label="Codes Cheats (Game Genie)"
                onClick={() => {
                  onOpenCheats?.();
                  setRetroLabOpen(false);
                }}
                className="text-purple-200 hover:bg-purple-500/15"
              />

              <MenuAction
                icon={<Swords className="w-4 h-4 text-orange-400" />}
                label="Tournois Arcade Multijoueur"
                onClick={() => {
                  onOpenTournament?.();
                  setRetroLabOpen(false);
                }}
                className="text-orange-200 hover:bg-orange-500/15"
              />

              <MenuAction
                icon={<BookOpen className="w-4 h-4 text-emerald-400" />}
                label="Manuels & Notices d'Époque"
                onClick={() => {
                  onOpenManuals?.();
                  setRetroLabOpen(false);
                }}
                className="text-emerald-200 hover:bg-emerald-500/15"
              />

              <MenuAction
                icon={<History className="w-4 h-4 text-amber-400" />}
                label="Musée & Frise Chronologique"
                onClick={() => {
                  onOpenTimeline?.();
                  setRetroLabOpen(false);
                }}
                className="text-amber-200 hover:bg-amber-500/15"
              />

              <MenuAction
                icon={<Printer className="w-4 h-4 text-emerald-400" />}
                label="Print Studio (Jaquettes 1:1)"
                onClick={() => {
                  onOpenPrintStudio?.();
                  setRetroLabOpen(false);
                }}
                className="text-emerald-200 hover:bg-emerald-500/15"
              />

              <MenuAction
                icon={<PackageCheck className="w-4 h-4 text-blue-400" />}
                label="Pack Nomade & Clé USB"
                onClick={() => {
                  onOpenNomadBackup?.();
                  setRetroLabOpen(false);
                }}
                className="text-blue-200 hover:bg-blue-500/15"
              />

              <MenuAction
                icon={<Smartphone className="w-4 h-4 text-green-400" />}
                label="Overlays Portables LCD"
                onClick={() => {
                  onOpenHandheldOverlays?.();
                  setRetroLabOpen(false);
                }}
                className="text-green-200 hover:bg-green-500/15"
              />

              <MenuAction
                icon={<Users className="w-4 h-4 text-pink-400" />}
                label="Multi-Profils Joueurs"
                onClick={() => {
                  onOpenProfiles?.();
                  setRetroLabOpen(false);
                }}
                className="text-pink-200 hover:bg-pink-500/15"
              />

              <MenuAction
                icon={<FolderSearch className="w-4 h-4 text-fuchsia-400" />}
                label="Musiques & Scan Auto"
                onClick={() => {
                  onOpenMusicManager?.();
                  setRetroLabOpen(false);
                }}
                className="text-fuchsia-200 hover:bg-fuchsia-500/15"
              />
            </div>
          )}
        </div>

        {/* ── BOUTON DIRECT : KIOSQUE ARCADE ── */}
        {!isKioskMode ? (
          <button
            type="button"
            onClick={onEnterKiosk}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/25 to-pink-500/20 hover:from-amber-500/35 hover:to-pink-500/35 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-white text-xs font-bold transition shadow-[0_0_12px_rgba(245,158,11,0.25)] shrink-0 active:scale-95 cursor-pointer"
            title="Lancer le Mode Kiosque Arcade Plein Écran (Touche F11)"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
            <span className="font-black">Kiosque</span>
            <span className="hidden sm:inline font-black">Arcade</span>
            <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono border border-amber-500/40 hidden md:inline">F11</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onUnlockKiosk}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/25 hover:bg-amber-500/40 text-amber-300 border border-amber-400 text-xs font-black transition shadow-[0_0_12px_rgba(245,158,11,0.3)] shrink-0 active:scale-95 cursor-pointer"
            title="Déverrouiller et quitter le Mode Kiosque (Code PIN)"
          >
            <Unlock className="w-3.5 h-3.5 text-amber-300" />
            <span>Quitter Kiosk</span>
          </button>
        )}
      </div>

      {/* ── PARTIE DROITE : Boutons d'Action Rapide Essentiels ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Bouton Scanner Direct (Action Rapide) */}
        {!isKioskMode && (
          <button
            type="button"
            onClick={onScan}
            disabled={isScanning}
            title="Scanner un dossier ou ajouter des ROMs"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition disabled:opacity-50 ${
              isScanning
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/40 text-cyan-300 hover:text-white'
            }`}
          >
            <FolderPlus className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden lg:inline">{isScanning ? 'Scan...' : 'Scanner ROMs'}</span>
          </button>
        )}

        {/* Bouton Recherche Spotlight */}
        <button
          type="button"
          onClick={onOpenSearch}
          title="Recherche globale (Ctrl+K)"
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition text-xs font-mono"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden xl:inline text-slate-500 text-[10px]">⌘K</span>
        </button>

        {/* Contrôles Audio Réduits */}
        <div className="flex items-center gap-0.5 bg-slate-900/60 p-0.5 rounded-lg border border-slate-800">
          {/* BGM Jukebox */}
          <button
            type="button"
            onClick={onOpenJukebox || onToggleBgm}
            title={bgmActive ? 'Jukebox Chiptune Actif' : 'Ouvrir Jukebox Chiptune'}
            className={`p-1.5 rounded-md transition ${
              bgmActive
                ? isJukeboxMuted
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-pink-500/25 text-pink-300 shadow-[0_0_8px_rgba(236,72,153,0.3)]'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Disc3 className={`w-3.5 h-3.5 ${bgmActive && !isJukeboxMuted ? 'animate-spin' : ''}`} />
          </button>

          {/* Effets Sonores FX */}
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Désactiver les sons FX' : 'Activer les sons FX'}
            className="p-1.5 rounded-md text-slate-400 hover:text-white transition"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-600" />}
          </button>

          {/* Filtre CRT Scanlines */}
          {onToggleCrt && (
            <button
              type="button"
              onClick={onToggleCrt}
              title={crtEnabled ? 'Filtre CRT Scanlines activé' : 'Activer le filtre CRT Scanlines'}
              className={`p-1.5 rounded-md transition ${
                crtEnabled
                  ? 'bg-cyan-500/25 text-cyan-300 shadow-[0_0_8px_rgba(0,242,254,0.3)]'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

/* ── Composants internes d'affichage ── */

const NavBtn: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}> = ({ active, onClick, icon, label, badge }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
      active
        ? 'bg-retro-accent/20 text-retro-accent border border-retro-accent/40 shadow-[0_0_8px_rgba(0,242,254,0.25)]'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
    }`}
  >
    {icon}
    <span>{label}</span>
    {badge && (
      <span className="hidden md:inline px-1.5 py-0.2 bg-slate-800/80 border border-slate-700/60 rounded-full text-[9px] font-mono text-cyan-300">
        {badge}
      </span>
    )}
  </button>
);

const MenuAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: string;
  badgeColor?: string;
  className?: string;
}> = ({ icon, label, onClick, badge, badgeColor = 'bg-slate-800 text-slate-300', className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition text-left rounded-lg ${className}`}
  >
    <div className="flex items-center gap-2.5 min-w-0">
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
    {badge && (
      <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold shrink-0 ml-2 ${badgeColor}`}>
        {badge}
      </span>
    )}
  </button>
);
