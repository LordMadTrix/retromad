import React, { useState, useRef, useEffect } from 'react';
import {
  Gamepad2, Landmark, Cpu, Settings, RefreshCw, Sparkles,
  Volume2, VolumeX, Lock, Unlock, ShieldCheck, DownloadCloud,
  Tv, Music, Music2, Search, ChevronDown, ScanLine
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
}) => {
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu admin si clic ailleurs
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAdminMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-14 bg-gradient-to-r from-[#0d1b3e] via-[#162b6d] to-[#2d1258] border-b-2 border-cyan-400/40 shadow-[0_4px_24px_rgba(0,242,254,0.2)] px-3 flex items-center gap-3 z-30 select-none shrink-0">

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
              label="Réglages"
            />
          </>
        )}
      </nav>

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
        {/* BGM Chiptune */}
        {onToggleBgm && (
          <button
            onClick={onToggleBgm}
            title={bgmActive ? 'Stopper la musique d\'ambiance' : 'Musique chiptune d\'ambiance 🎵'}
            className={`p-2 rounded-lg border transition ${
              bgmActive
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.25)]'
                : 'bg-slate-800/70 border-slate-700/40 text-slate-500 hover:text-white hover:bg-slate-700/70'
            }`}
          >
            {bgmActive ? <Music className="w-3.5 h-3.5" /> : <Music2 className="w-3.5 h-3.5" />}
          </button>
        )}

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

        {/* Filtre CRT */}
        <button
          onClick={onToggleCrt}
          title={crtEnabled ? 'Désactiver le filtre CRT' : 'Activer le filtre CRT Scanlines'}
          className={`p-2 rounded-lg border transition ${
            crtEnabled
              ? 'bg-retro-accent/15 border-retro-accent/50 text-retro-accent shadow-[0_0_10px_rgba(0,242,254,0.2)]'
              : 'bg-slate-800/70 border-slate-700/40 text-slate-500 hover:text-white hover:bg-slate-700/70'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Séparateur ── */}
      <div className="w-px h-8 bg-slate-700/60 shrink-0" />

      {/* ── Actions Admin (Scanner visible + menu pour reste) ── */}
      {!isKioskMode ? (
        <div className="flex items-center gap-1.5 shrink-0">
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
