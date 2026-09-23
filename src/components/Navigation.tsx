import React, { useState, useRef, useEffect } from 'react';
import {
  Gamepad2, Landmark, Cpu, Settings, RefreshCw, Sparkles,
  Volume2, VolumeX, Lock, Unlock, ShieldCheck, DownloadCloud,
  Tv, Search, ChevronDown, Dices, Trophy,
  BookOpen, Swords, HardDrive, Code2, Disc3,
  BarChart3, Users, History, Printer, PackageCheck, Smartphone, Beer, FolderSearch, Palette,
  Key, Wifi, Projector
} from 'lucide-react';

export type NavTab = 'games' | 'companies' | 'bios' | 'settings';

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
  // 8 Features Rétro
  onOpenRoulette?: () => void;
  onOpenAchievements?: () => void;
  onOpenJukebox?: () => void;
  onOpenTournament?: () => void;
  onOpenManuals?: () => void;
  onOpenBezelStudio?: () => void;
  onOpenCheats?: () => void;
  onOpenSaveStates?: () => void;
  // 8 Nouvelles Innovations & Musique
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
  // Nouvelles Innovations Demandées
  onOpenAttractMode?: () => void;
  onOpenPasswordNotebook?: () => void;
  onOpenLanManager?: () => void;
  onOpenProjectorModal?: () => void;
  isProjectorKioskRunning?: boolean;
  isJukeboxFloatingVisible?: boolean;
  isJukeboxMuted?: boolean;
  onOpenUserManualPdf?: () => void;
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
  isProjectorKioskRunning,
  isJukeboxFloatingVisible,
  isJukeboxMuted,
  onOpenUserManualPdf,
}) => {
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [retroLabOpen, setRetroLabOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const retroLabRef = useRef<HTMLDivElement>(null);

  // Fermer les menus déroulants si clic ailleurs
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAdminMenuOpen(false);
      }
      if (retroLabRef.current && !retroLabRef.current.contains(e.target as Node)) {
        setRetroLabOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-14 bg-gradient-to-r from-[#0d1b3e] via-[#162b6d] to-[#2d1258] border-b-2 border-cyan-400/40 shadow-[0_4px_24px_rgba(0,242,254,0.2)] px-3 flex items-center gap-2.5 z-30 select-none shrink-0">

      {/* ── Logo ── */}
      <div
        className="flex items-center space-x-2.5 cursor-pointer shrink-0 group"
        onClick={() => onTabChange('games')}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-retro-purple to-retro-accent flex items-center justify-center shadow-neon group-hover:scale-105 transition">
          <Gamepad2 className="w-5 h-5 text-white" />
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black tracking-wider bg-gradient-to-r from-retro-accent via-white to-retro-pink bg-clip-text text-transparent leading-none">
              RETROMAD
            </span>
            {isKioskMode ? (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" />KIOSK
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" />ADMIN
              </span>
            )}
            {isProjectorKioskRunning && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenProjectorModal?.();
                }}
                className="px-1.5 py-0.5 rounded-md bg-sky-500/25 text-sky-300 border border-sky-500/50 text-[9px] font-bold flex items-center gap-1 cursor-pointer animate-pulse hover:bg-sky-500/40"
                title="Rétroprojecteur Kiosque actif sur Écran 2 (Cliquer pour calibrer)"
              >
                <Projector className="w-2.5 h-2.5" />
                <span>PROJECTEUR 2</span>
              </span>
            )}
          </div>
          <div className="text-[9px] tracking-widest text-slate-500 uppercase font-semibold">
            Frontend Retrogaming
          </div>
        </div>
      </div>

      {/* ── Séparateur ── */}
      <div className="w-px h-8 bg-slate-700/60 shrink-0" />

      {/* ── Tabs de navigation (icons + texte court) ── */}
      <nav className="flex items-center gap-0.5 bg-[#0a1228]/80 p-1 rounded-xl border border-cyan-200/15 shadow-inner shrink-0">
        <NavBtn
          active={currentTab === 'games'}
          onClick={() => onTabChange('games')}
          icon={<Gamepad2 className="w-4 h-4" />}
          label="Jeux"
          badge={totalGames > 0 ? String(totalGames) : undefined}
        />
        <NavBtn
          active={currentTab === 'companies'}
          onClick={() => onTabChange('companies')}
          icon={<Landmark className="w-4 h-4" />}
          label="Firmes"
          badge="Vidéos"
        />
        {!isKioskMode && (
          <>
            <NavBtn
              active={currentTab === 'bios'}
              onClick={() => onTabChange('bios')}
              icon={<Cpu className="w-4 h-4" />}
              label="BIOS"
            />
            <NavBtn
              active={currentTab === 'settings'}
              onClick={() => onTabChange('settings')}
              icon={<Settings className="w-4 h-4" />}
              label="Centre Admin"
            />
          </>
        )}
      </nav>

      {/* ── Menu Déroulant Labo Rétro (Les 8 Fonctionnalités Spéciales) ── */}
      <div className="relative shrink-0" ref={retroLabRef}>
        <button
          onClick={() => setRetroLabOpen((p) => !p)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
            retroLabOpen
              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
              : 'bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border-purple-500/40 text-purple-200 hover:text-white hover:border-purple-400'
          }`}
          title="Outils & Expériences Rétrogaming"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span className="hidden md:inline">Labo Rétro</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${retroLabOpen ? 'rotate-180' : ''}`} />
        </button>

        {retroLabOpen && (
          <div className="absolute left-0 top-full mt-1.5 w-72 max-h-[85vh] overflow-y-auto bg-[#0a122a]/98 border border-cyan-500/30 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3.5 py-1 text-[10px] font-black text-amber-400 uppercase tracking-widest border-b border-slate-800/80 mb-1 flex items-center justify-between">
              <span>NOUVEAUTÉS MAJEURES</span>
              <span className="font-mono text-amber-400/80">★ EXCLUSIF</span>
            </div>

            <MenuAction
              icon={<Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />}
              label="Borne d'Arcade (Attract Mode & 3D)"
              onClick={() => { onOpenAttractMode?.(); setRetroLabOpen(false); }}
              className="text-pink-200 hover:bg-pink-500/15 font-bold"
            />
            <MenuAction
              icon={<Key className="w-4 h-4 text-amber-400" />}
              label="Carnet de Passwords & Fiches Rétro"
              onClick={() => { onOpenPasswordNotebook?.(); setRetroLabOpen(false); }}
              className="text-amber-200 hover:bg-amber-500/15 font-bold"
            />
            <MenuAction
              icon={<Wifi className="w-4 h-4 text-cyan-400" />}
              label="Passerelle Réseau LAN (Serveur Web/FTP)"
              onClick={() => { onOpenLanManager?.(); setRetroLabOpen(false); }}
              className="text-cyan-200 hover:bg-cyan-500/15 font-bold"
            />
            <MenuAction
              icon={<Projector className="w-4 h-4 text-sky-400" />}
              label="Kiosque sur 2ème Écran & Rétroprojecteur"
              onClick={() => { onOpenProjectorModal?.(); setRetroLabOpen(false); }}
              className="text-sky-200 hover:bg-sky-500/15 font-bold"
            />

            <div className="px-3.5 py-1 text-[10px] font-black text-cyan-400 uppercase tracking-widest border-b border-t border-slate-800/80 my-1 flex items-center justify-between">
              <span>8 NOUVELLES INNOVATIONS</span>
              <span className="font-mono text-cyan-400/80">★ TOP</span>
            </div>

            <MenuAction
              icon={<BarChart3 className="w-4 h-4 text-cyan-400" />}
              label="Rétro Analytics & Journal de Bord"
              onClick={() => { onOpenAnalytics?.(); setRetroLabOpen(false); }}
              className="text-cyan-200 hover:bg-cyan-500/15"
            />
            <MenuAction
              icon={<Gamepad2 className="w-4 h-4 text-purple-400" />}
              label="Testeur de Manette & Sticks Arcade"
              onClick={() => { onOpenGamepadTester?.(); setRetroLabOpen(false); }}
              className="text-purple-200 hover:bg-purple-500/15"
            />
            <MenuAction
              icon={<Users className="w-4 h-4 text-pink-400" />}
              label="Multi-Profils & Contrôle Parental"
              onClick={() => { onOpenProfiles?.(); setRetroLabOpen(false); }}
              className="text-pink-200 hover:bg-pink-500/15"
            />
            <MenuAction
              icon={<History className="w-4 h-4 text-amber-400" />}
              label="Musée & Frise Chronologique"
              onClick={() => { onOpenTimeline?.(); setRetroLabOpen(false); }}
              className="text-amber-200 hover:bg-amber-500/15"
            />
            <MenuAction
              icon={<Printer className="w-4 h-4 text-emerald-400" />}
              label="Print Studio (Jaquettes 1:1)"
              onClick={() => { onOpenPrintStudio?.(); setRetroLabOpen(false); }}
              className="text-emerald-200 hover:bg-emerald-500/15"
            />
            <MenuAction
              icon={<PackageCheck className="w-4 h-4 text-blue-400" />}
              label="Pack Nomade & Clé USB"
              onClick={() => { onOpenNomadBackup?.(); setRetroLabOpen(false); }}
              className="text-blue-200 hover:bg-blue-500/15"
            />
            <MenuAction
              icon={<Smartphone className="w-4 h-4 text-green-400" />}
              label="Overlays Portables LCD"
              onClick={() => { onOpenHandheldOverlays?.(); setRetroLabOpen(false); }}
              className="text-green-200 hover:bg-green-500/15"
            />
            <MenuAction
              icon={<Beer className="w-4 h-4 text-yellow-400" />}
              label="Mode Soirée & Bar Arcade"
              onClick={() => { onOpenArcadeParty?.(); setRetroLabOpen(false); }}
              className="text-yellow-200 hover:bg-yellow-500/15"
            />
            <MenuAction
              icon={<FolderSearch className="w-4 h-4 text-fuchsia-400" />}
              label="Musiques & Scan Dossier Auto"
              onClick={() => { onOpenMusicManager?.(); setRetroLabOpen(false); }}
              className="text-fuchsia-200 hover:bg-fuchsia-500/15"
            />
            <MenuAction
              icon={<HardDrive className="w-4 h-4 text-cyan-400" />}
              label="Répertoire Public Centralisé (/public)"
              onClick={() => { onOpenCentralizedStorage?.(); setRetroLabOpen(false); }}
              className="text-cyan-200 hover:bg-cyan-500/15 font-bold"
            />
            <MenuAction
              icon={<Palette className="w-4 h-4 text-pink-400" />}
              label="Atelier de Thèmes Communautaires (DSL)"
              onClick={() => { onOpenThemeStudio?.(); setRetroLabOpen(false); }}
              className="text-pink-200 hover:bg-pink-500/15 font-bold"
            />

            <div className="px-3.5 py-1 text-[10px] font-black text-purple-400 uppercase tracking-widest border-b border-t border-slate-800/80 my-1.5 flex items-center justify-between">
              <span>LABO RÉTRO HISTORIQUE</span>
              <span className="font-mono text-purple-400/80">VINTAGE</span>
            </div>

            <MenuAction
              icon={<Dices className="w-4 h-4 text-cyan-400" />}
              label="Roulette Rétro & Défi du Jour"
              onClick={() => { onOpenRoulette?.(); setRetroLabOpen(false); }}
              className="text-cyan-200 hover:bg-cyan-500/15"
            />
            <MenuAction
              icon={<Trophy className="w-4 h-4 text-amber-400" />}
              label="RetroAchievements & Trophées"
              onClick={() => { onOpenAchievements?.(); setRetroLabOpen(false); }}
              className="text-amber-200 hover:bg-amber-500/15"
            />
            <MenuAction
              icon={<Disc3 className="w-4 h-4 text-pink-400" />}
              label={`Jukebox Chiptune 8/16-Bit ${isJukeboxFloatingVisible ? '(Lecteur Actif)' : '(Masqué)'}`}
              onClick={() => { onOpenJukebox?.(); setRetroLabOpen(false); }}
              className="text-pink-200 hover:bg-pink-500/15"
            />
            <MenuAction
              icon={<Swords className="w-4 h-4 text-orange-400" />}
              label="Tournois Arcade Multijoueur"
              onClick={() => { onOpenTournament?.(); setRetroLabOpen(false); }}
              className="text-orange-200 hover:bg-orange-500/15"
            />
            <MenuAction
              icon={<BookOpen className="w-4 h-4 text-emerald-400" />}
              label="Manuels & Notices d'Époque"
              onClick={() => { onOpenManuals?.(); setRetroLabOpen(false); }}
              className="text-emerald-200 hover:bg-emerald-500/15"
            />
            <MenuAction
              icon={<Tv className="w-4 h-4 text-blue-400" />}
              label="Studio Bezels & Shaders CRT"
              onClick={() => { onOpenBezelStudio?.(); setRetroLabOpen(false); }}
              className="text-blue-200 hover:bg-blue-500/15"
            />
            <MenuAction
              icon={<Code2 className="w-4 h-4 text-purple-400" />}
              label="Codes Cheats (Game Genie)"
              onClick={() => { onOpenCheats?.(); setRetroLabOpen(false); }}
              className="text-purple-200 hover:bg-purple-500/15"
            />
            <MenuAction
              icon={<HardDrive className="w-4 h-4 text-teal-400" />}
              label="Save States & Cartes Mémoires"
              onClick={() => { onOpenSaveStates?.(); setRetroLabOpen(false); }}
              className="text-teal-200 hover:bg-teal-500/15"
            />
          </div>
        )}
      </div>

      {/* ── Spacer flex ── */}
      <div className="flex-1" />

      {/* ── Bouton Recherche Spotlight ── */}
      <button
        onClick={onOpenSearch}
        title="Recherche globale (Ctrl+K)"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-600/50 text-slate-400 hover:text-white hover:border-retro-accent/50 hover:bg-slate-700/80 transition text-xs font-mono shrink-0"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden md:inline text-slate-500">⌘K</span>
      </button>

      {/* ── Contrôles Audio ── */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Jukebox BGM Chiptune */}
        <button
          onClick={onOpenJukebox || onToggleBgm}
          title={
            bgmActive
              ? isJukeboxMuted
                ? 'Jukebox : En lecture mais son coupé (Muet 🔇) - Cliquer pour ouvrir'
                : 'Jukebox : En lecture 🎵 (Cliquer pour ouvrir)'
              : 'Ouvrir le Jukebox Chiptune 🎵'
          }
          className={`p-2 rounded-lg border transition ${
            bgmActive
              ? isJukeboxMuted
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-pink-500/20 border-pink-500/50 text-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.3)]'
              : 'bg-slate-800/70 border-slate-700/40 text-slate-500 hover:text-white hover:bg-slate-700/70'
          }`}
        >
          <Disc3 className={`w-3.5 h-3.5 ${bgmActive && !isJukeboxMuted ? 'animate-spin' : ''}`} />
        </button>

        {/* Sons FX */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Désactiver les sons' : 'Activer les sons'}
          className={`p-2 rounded-lg border transition ${
            soundEnabled
              ? 'bg-slate-800/70 border-slate-700/40 text-slate-300 hover:text-white hover:bg-slate-700/70'
              : 'bg-slate-800/70 border-slate-700/40 text-slate-600 hover:text-slate-400'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Studio Bezels & Shaders CRT */}
        <button
          onClick={onOpenBezelStudio || onToggleCrt}
          title="Studio Bezels & Shaders CRT"
          className={`p-2 rounded-lg border transition ${
            crtEnabled
              ? 'bg-retro-accent/15 border-retro-accent/50 text-retro-accent shadow-[0_0_10px_rgba(0,242,254,0.2)]'
              : 'bg-slate-800/70 border-slate-700/40 text-slate-500 hover:text-white hover:bg-slate-700/70'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
        </button>

        {/* Borne d'Arcade (Attract Mode & 3D) */}
        {onOpenAttractMode && (
          <button
            onClick={onOpenAttractMode}
            title="Lancer le Mode Borne d'Arcade (Attract Mode, Démos & 3D)"
            className="p-2 rounded-lg border bg-slate-800/70 border-slate-700/40 text-pink-400 hover:text-white hover:bg-pink-500/20 hover:border-pink-500/50 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Passerelle Réseau LAN / Web / FTP */}
        {onOpenLanManager && (
          <button
            onClick={onOpenLanManager}
            title="Passerelle Réseau Local (LAN) : Dépose sans fil smartphone, Web & FTP"
            className="p-2 rounded-lg border bg-slate-800/70 border-slate-700/40 text-cyan-400 hover:text-white hover:bg-cyan-500/20 hover:border-cyan-500/50 transition"
          >
            <Wifi className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Mode Kiosque sur 2ème Écran & Rétroprojecteur */}
        {onOpenProjectorModal && (
          <button
            onClick={onOpenProjectorModal}
            title="Mode Kiosque sur 2ème Écran & Rétroprojecteur (Dual-Display Cinema)"
            className="p-2 rounded-lg border bg-slate-800/70 border-slate-700/40 text-sky-400 hover:text-white hover:bg-sky-500/20 hover:border-sky-500/50 transition"
          >
            <Projector className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Séparateur ── */}
      <div className="w-px h-8 bg-slate-700/60 shrink-0" />

      {/* ── Actions Admin (Scanner visible + menu pour reste) ── */}
      {!isKioskMode ? (
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Répertoire Public Centralisé */}
          <button
            onClick={onOpenCentralizedStorage}
            title="Répertoire Public Centralisé (/public : ROMs, BIOS, Musiques, Thèmes, Émulateurs, Sauvegardes)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold transition shadow-sm shadow-cyan-500/10"
          >
            <HardDrive className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden md:inline">/public</span>
            <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">Hub</span>
          </button>

          {/* Atelier de Thèmes Communautaires */}
          <button
            onClick={onOpenThemeStudio}
            title="Atelier & Studio de Thèmes Communautaires (Créez facilement vos thèmes en direct)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/40 text-pink-300 hover:text-white text-xs font-bold transition shadow-sm shadow-pink-500/10"
          >
            <Palette className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden lg:inline">Thèmes</span>
            <span className="px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 text-[10px] font-mono">Studio</span>
          </button>

          {/* Scanner ROMs (toujours visible) */}
          <button
            onClick={onScan}
            disabled={isScanning}
            title="Scanner les dossiers de ROMs"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition disabled:opacity-50 ${
              isScanning
                ? 'bg-retro-accent/10 border-retro-accent/40 text-retro-accent'
                : 'bg-slate-800/80 border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-500'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scan...' : 'Scanner'}</span>
          </button>

          {/* Guide & Manuel Utilisateur Illustré (Export PDF / F1) */}
          {onOpenUserManualPdf && (
            <button
              onClick={onOpenUserManualPdf}
              title="Manuel Utilisateur Illustré & Guide Complet (Exportable en PDF / Touche F1)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition shadow-sm shadow-emerald-500/10"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Aide PDF</span>
              <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">F1</span>
            </button>
          )}

          {/* Bouton Mode Kiosk (visible directement) */}
          <button
            onClick={onEnterKiosk}
            title="Verrouiller en mode Kiosk (Borne d'arcade)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-amber-100 text-xs font-bold transition"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kiosk</span>
          </button>

          {/* Menu déroulant pour actions secondaires */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setAdminMenuOpen((p) => !p)}
              title="Plus d'actions admin"
              className={`flex items-center gap-0.5 px-2 py-1.5 rounded-lg border text-xs font-semibold transition ${
                adminMenuOpen
                  ? 'bg-slate-700 border-slate-500 text-white'
                  : 'bg-slate-800/80 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-500'
              }`}
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {adminMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#0d1b3e]/98 border border-slate-700/80 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl z-50 py-1.5 overflow-hidden">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</div>

                <MenuAction
                  icon={<Sparkles className="w-3.5 h-3.5 text-retro-pink" />}
                  label="Scraper les Jaquettes"
                  onClick={() => { onScrape(); setAdminMenuOpen(false); }}
                  className="text-retro-pink hover:bg-retro-pink/10"
                />
                <MenuAction
                  icon={<DownloadCloud className="w-3.5 h-3.5 text-cyan-400" />}
                  label="Extensions & Cœurs"
                  onClick={() => { onOpenExtensions(); setAdminMenuOpen(false); }}
                  className="text-cyan-300 hover:bg-cyan-500/10"
                />
                <MenuAction
                  icon={<HardDrive className="w-3.5 h-3.5 text-cyan-400" />}
                  label="Dossier /public Centralisé"
                  onClick={() => { onOpenCentralizedStorage?.(); setAdminMenuOpen(false); }}
                  className="text-cyan-300 hover:bg-cyan-500/10 font-bold"
                />
                {onOpenUserManualPdf && (
                  <MenuAction
                    icon={<BookOpen className="w-3.5 h-3.5 text-emerald-400" />}
                    label="Manuel Illustré (PDF / F1)"
                    onClick={() => { onOpenUserManualPdf(); setAdminMenuOpen(false); }}
                    className="text-emerald-300 hover:bg-emerald-500/10 font-bold"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Bouton de déverrouillage en mode Kiosk */
        <button
          onClick={onUnlockKiosk}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-retro-accent/15 hover:bg-retro-accent/25 text-retro-accent border border-retro-accent/40 text-xs font-bold transition shadow-neon shrink-0"
          title="Saisir le PIN admin"
        >
          <Unlock className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Admin</span>
        </button>
      )}
    </header>
  );
};

/* ── Composants internes ── */

const NavBtn: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}> = ({ active, onClick, icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
      active
        ? 'bg-retro-accent/20 text-retro-accent border border-retro-accent/40 shadow-[0_0_8px_rgba(0,242,254,0.25)]'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
    {badge && (
      <span className="hidden md:inline px-1.5 py-0.5 bg-slate-700/70 rounded-full text-[10px] font-mono text-slate-300">
        {badge}
      </span>
    )}
  </button>
);

const MenuAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}> = ({ icon, label, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold transition text-left ${className}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);
