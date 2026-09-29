import React from 'react';
import {
  Gamepad2, Settings, Volume2, VolumeX, Lock, Unlock, ShieldCheck,
  Tv, Search, Flame
} from 'lucide-react';

export type NavTab = 'games' | 'companies' | 'computing' | 'bios' | 'settings';

interface NavigationProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenSettings?: () => void;
  onScan?: () => void;
  onScrape?: () => void;
  onOpenExtensions?: () => void;
  onOpenSearch: () => void;
  isScanning?: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  crtEnabled?: boolean;
  onToggleCrt?: () => void;
  totalGames: number;
  isKioskMode: boolean;
  isAdminUnlocked?: boolean;
  onEnterKiosk: () => void;
  onUnlockKiosk: () => void;
  onOpenQuickStart?: () => void;
  selectedGenre?: string;
  onSelectGenre?: (genre: string) => void;
  availableGenres?: { genre: string; count: number }[];
  onOpenBezelStudio?: () => void;
  onOpenThemeStudio?: () => void;
  onOpenCentralizedStorage?: () => void;
  onOpenLanManager?: () => void;
  onOpenProjectorModal?: () => void;
  isProjectorKioskRunning?: boolean;
  onOpenUserManualPdf?: () => void;
  onOpenShaderProfiles?: () => void;
  onOpenSaveStateSync?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  onOpenSearch,
  soundEnabled,
  onToggleSound,
  crtEnabled = false,
  onToggleCrt,
  isKioskMode,
  isAdminUnlocked = false,
  onEnterKiosk,
  onUnlockKiosk,
}) => {

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
              ) : isAdminUnlocked ? (
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" />ADMIN
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-bold flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" />VERROUILLÉ
                </span>
              )}
            </div>
            <span className="text-[8px] tracking-widest text-slate-400 uppercase font-semibold mt-0.5">
              Frontend Arcade
            </span>
          </div>
        </div>

        <div className="w-px h-6 bg-slate-700/60 shrink-0 hidden md:block" />

        {/* ── BOUTONS DIRECTS UNIQUES : KIOSQUE ARCADE & ADMINISTRATION ── */}
        {!isKioskMode ? (
          <button
            type="button"
            onClick={onEnterKiosk}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/25 to-pink-500/20 hover:from-amber-500/35 hover:to-pink-500/35 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-white text-xs font-bold transition shadow-[0_0_12px_rgba(245,158,11,0.25)] shrink-0 active:scale-95 cursor-pointer"
            title="Lancer le Mode Kiosque Arcade Plein Écran (Touche F11)"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
            <span className="font-black">Kiosque Arcade</span>
            <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono border border-amber-500/40 hidden md:inline">F11</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onUnlockKiosk}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/25 hover:bg-amber-500/40 text-amber-300 border border-amber-400 text-xs font-black transition shadow-[0_0_12px_rgba(245,158,11,0.3)] shrink-0 active:scale-95 cursor-pointer"
            title="Déverrouiller et quitter le Mode Kiosque (Code PIN)"
          >
            <Unlock className="w-3.5 h-3.5 text-amber-300" />
            <span>Quitter Kiosk</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onTabChange('settings')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm shrink-0 cursor-pointer ${
            currentTab === 'settings'
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'bg-slate-800/80 border-slate-700/60 text-slate-200 hover:text-white hover:border-slate-500 hover:bg-slate-800'
          }`}
          title="Ouvrir le Centre d'Administration"
        >
          <Settings className="w-3.5 h-3.5 text-cyan-400" />
          <span>Administration</span>
        </button>
      </div>

      {/* ── PARTIE DROITE : Boutons d'Action Rapide Essentiels ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

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


