import React from 'react';
import { Gamepad2, Landmark, Cpu, Settings, RefreshCw, Sparkles, Volume2, VolumeX, Lock, Unlock, ShieldCheck, DownloadCloud, Tv } from 'lucide-react';

export type NavTab = 'games' | 'companies' | 'bios' | 'settings';

interface NavigationProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onScan: () => void;
  onScrape: () => void;
  onOpenExtensions: () => void;
  isScanning: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  crtEnabled?: boolean;
  onToggleCrt?: () => void;
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
  isScanning,
  soundEnabled,
  onToggleSound,
  crtEnabled = false,
  onToggleCrt,
  totalGames,
  isKioskMode,
  onEnterKiosk,
  onUnlockKiosk,
}) => {
  return (
    <header className="min-h-16 bg-gradient-to-r from-[#172a5c] via-[#273f88] to-[#4a1f70] border-b-2 border-cyan-300/60 shadow-[0_5px_28px_rgba(0,242,254,0.3)] px-4 lg:px-6 py-2 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar z-30 select-none">
      {/* Logo RetroMad */}
      <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => onTabChange('games')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-retro-purple to-retro-accent flex items-center justify-center shadow-neon">
          <Gamepad2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-black tracking-wider bg-gradient-to-r from-retro-accent via-white to-retro-pink bg-clip-text text-transparent">
              RETROMAD
            </span>
            {isKioskMode ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>KIOSK</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>ADMIN</span>
              </span>
            )}
          </div>
          <div className="text-[10px] tracking-widest text-slate-400 uppercase -mt-0.5 font-semibold">
            {isKioskMode ? 'Borne de jeu sécurisée' : 'Frontend Retrogaming'}
          </div>
        </div>
      </div>

      {/* Navigation Tabs (filtrés en mode Kiosk) */}
      <nav className="flex items-center space-x-1 bg-[#0c1636]/70 p-1 rounded-xl border border-cyan-200/25 shadow-inner shrink-0">
        <button
          onClick={() => onTabChange('games')}
          className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            currentTab === 'games'
              ? 'bg-retro-accent/20 text-retro-accent border border-retro-accent/40 shadow-[0_0_10px_rgba(0,242,254,0.3)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span className="whitespace-nowrap">Consoles & Jeux</span>
          {totalGames > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-slate-700/60 rounded-full text-[11px] font-mono text-slate-300">
              {totalGames}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('companies')}
          className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            currentTab === 'companies'
              ? 'bg-retro-accent/20 text-retro-accent border border-retro-accent/40 shadow-[0_0_10px_rgba(0,242,254,0.3)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span className="whitespace-nowrap">Firmes & Histoire</span>
        </button>

        {/* Onglets Administration uniquement */}
        {!isKioskMode && (
          <>
            <button
              onClick={() => onTabChange('bios')}
              className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'bios'
                  ? 'bg-retro-accent/20 text-retro-accent border border-retro-accent/40 shadow-[0_0_10px_rgba(0,242,254,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span className="whitespace-nowrap">BIOS & Firmwares</span>
            </button>

            <button
              onClick={() => onTabChange('settings')}
              className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'settings'
                  ? 'bg-retro-accent/20 text-retro-accent border border-retro-accent/40 shadow-[0_0_10px_rgba(0,242,254,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="whitespace-nowrap">Paramètres</span>
            </button>
          </>
        )}
      </nav>

      {/* Actions rapides */}
      <div className="flex items-center space-x-2 lg:space-x-3 shrink-0">
        {/* Toggle Sound */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Désactiver les sons' : 'Activer les sons'}
          className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700 transition"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Toggle Filtre CRT Scanlines */}
        <button
          onClick={onToggleCrt}
          title={crtEnabled ? "Désactiver le filtre d'écran CRT Rétro" : "Activer le filtre d'écran CRT Rétro (Scanlines & Phosphore)"}
          className={`p-2.5 rounded-xl border transition ${
            crtEnabled
              ? 'bg-retro-accent/20 border-retro-accent/60 text-retro-accent shadow-[0_0_12px_rgba(0,242,254,0.3)]'
              : 'bg-slate-800/70 border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <Tv className="w-4 h-4" />
        </button>

        {/* Boutons réservés au Mode Administration */}
        {!isKioskMode ? (
          <>
            {/* Scan Button */}
            <button
              onClick={onScan}
              disabled={isScanning}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white text-xs font-semibold transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-retro-accent' : ''}`} />
              <span>{isScanning ? 'Scan en cours...' : 'Scanner ROMs'}</span>
            </button>

            {/* Scrape Button */}
            <button
              onClick={onScrape}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-retro-pink to-retro-purple hover:brightness-110 text-white text-xs font-bold transition shadow-neon-pink"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scraper Jaquettes</span>
            </button>

            {/* Extensions & Cores Button */}
            <button
              onClick={onOpenExtensions}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300 hover:text-white text-xs font-bold transition shadow-sm hover:border-cyan-400"
              title="Télécharger et installer toutes les extensions et cœurs d'émulation en 1 clic"
            >
              <DownloadCloud className="w-3.5 h-3.5 text-cyan-400" />
              <span>Extensions</span>
            </button>

            {/* Verrouiller vers Mode Kiosk */}
            <button
              onClick={onEnterKiosk}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition"
              title="Verrouiller en mode Kiosk (Borne d'arcade)"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Mode Kiosk</span>
            </button>
          </>
        ) : (
          /* Bouton Déverrouillage Mode Kiosk */
          <button
            onClick={onUnlockKiosk}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-retro-accent/20 hover:bg-retro-accent/30 text-retro-accent border border-retro-accent/50 text-xs font-bold transition shadow-neon"
            title="Saisir le code PIN pour passer en mode administration"
          >
            <Unlock className="w-4 h-4" />
            <span>Déverrouiller Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};
