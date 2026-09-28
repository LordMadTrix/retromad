import React, { useEffect, useRef } from 'react';
import { Game } from '../types';
import { X } from 'lucide-react';

/**
 * Mapping systemId RetroMad -> coeur Libretro/EmulatorJS
 */
const EJS_CORE_BY_SYSTEM: Record<string, string> = {
  nes: 'nes',
  snes: 'snes',
  n64: 'n64',
  gb: 'gb',
  gbc: 'gb',
  gba: 'gba',
  megadrive: 'segaMD',
  mastersystem: 'segaMS',
  gamegear: 'segaGG',
  segacd: 'segaCD',
  saturn: 'segaSaturn',
  dreamcast: 'dreamcast',
  psx: 'psx',
  ps2: 'psx',
  psp: 'psp',
  atari2600: 'atari2600',
  atari7800: 'atari7800',
  lynx: 'lynx',
  jaguar: 'jaguar',
  neogeopocket: 'ngp',
  ngp: 'ngp',
  ngpc: 'ngp',
  wonderswan: 'ws',
  wonderswancolor: 'ws',
  coleco: 'coleco',
  vectrex: 'vectrex',
  atari2600_vcs: 'atari2600',
  mame: 'arcade',
  arcade: 'arcade',
  neogeo: 'arcade',
  fba: 'arcade',
  fba2012: 'arcade',
  snes9x: 'snes',
  pcengine: 'pce',
  pcenginecd: 'pce',
  turboGrafx16: 'pce',
  msx: 'msx',
  msx2: 'msx',
  c64: 'c64',
  amiga: 'amiga',
  atarist: 'atarist',
  zxspectrum: 'zxspectrum',
  scummvm: 'scummvm',
  nds: 'nds',
  '3ds': '3ds',
  virtualboy: 'vb',
  sega32x: 'sega32x',
  sg1000: 'segaSG',
  gameandwatch: 'gw',
  pokemonmini: 'pokemonmini',
  atari5200: 'atari5200',
  intellivision: 'intv',
  odyssey2: 'odyssey2',
  pc8801: 'pc8801',
  pc9801: 'pc9801',
  pcfx: 'pcfx',
  appleii: 'apple2',
  dos: 'dos',
  msdos: 'dos',
  dos1: 'dos',
  dos2: 'dos',
  dos3: 'dos',
  dos4: 'dos',
  dos5: 'dos',
  dos6: 'dos',
  win1: 'dos',
  win2: 'dos',
  win30: 'dos',
  win31: 'dos',
  win95: 'dos',
  win98: 'dos',
  winme: 'dos',
  win2000: 'dos',
  winxp: 'dos',
  winvista: 'dos',
  win7: 'dos',
  win10: 'dos',
  win11: 'dos',
  pet: 'pet',
  c16: 'vice_xplus4',
  sx64: 'c64',
  cdtv: 'puae',
  c64gs: 'c64',
  amiga600: 'puae',
  cd32: 'puae',
  cpc464: 'cap32',
  cpc664: 'cap32',
  cpc6128: 'cap32',
  cpcplus: 'cap32',
  amstradcpc: 'cap32',
  zx81: 'zx81',
  amiga1200: 'amiga',
  cdi: 'cdi',
  fmtowns: 'fmtowns',
  bbcmicro: 'bbcmicro',
  cps1: 'arcade',
  cps2: 'arcade',
  cps3: 'arcade',
  x68000: 'px68k',
  x1: 'x1',
  atari8bit: 'atari800',
  vic20: 'vice_xvic',
  c128: 'vice_x128',
  plus4: 'vice_xplus4',
  thomson: 'theodore',
  neogeocd: 'neocd',
  pc8000: 'pc8000',
  gx4000: 'cap32',
};

interface WebEmulatorModalProps {
  game: Game;
  onClose: () => void;
}

/**
 * Lecteur d'émulation web (EmulatorJS via CDN public).
 * Permet de lancer les ROMs servies par Vite directement dans le navigateur,
 * en complément du lancement desktop via RetroArch (mode Electron).
 */
export const WebEmulatorModal: React.FC<WebEmulatorModalProps> = ({ game, onClose }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef<HTMLDivElement | null>(null);

  // EmulatorJS ne peut pas être démonté proprement : on recharge la page à la fermeture
  const handleClose = () => {
    if (mountedRef.current && (window as any).EJS_emulator) {
      try {
        (window as any).EJS_emulator.callEvent?.('exit');
      } catch {
        /* noop */
      }
    }
    onClose();
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // EmulatorJS déclare des globales (EJS_STORAGE...) : le re-monter deux fois
    // (React StrictMode en dev) fait planter "Identifier already declared".
    // On mémorise l'élément et on ne ré-exécute le script qu'une seule fois.
    if ((window as any).__retromad_ejs_loaded) return;
    (window as any).__retromad_ejs_loaded = true;

    // ROM servie par le serveur web (public/roms/...), ou blob:/http fourni
    // par App.tsx quand la ROM a été lue depuis le disque (mode bureau).
    let romUrl = game.path;
    if (!romUrl.startsWith('/') && !romUrl.startsWith('http') && !romUrl.startsWith('blob:')) {
      romUrl = `/roms/${game.systemId}/${game.filename}`;
    }

    const core = EJS_CORE_BY_SYSTEM[game.systemId] || 'nes';

    // Config globale EmulatorJS
    (window as any).EJS_player = '#ejs-game-container';
    (window as any).EJS_core = core;
    (window as any).EJS_gameUrl = romUrl;
    (window as any).EJS_gameName = game.cleanTitle || game.title;
    (window as any).EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
    (window as any).EJS_startOnLoaded = true;
    // Langue forcée en anglais : le CDN ne fournit pas les fichiers de langue
    // fr (404 -> "Missing language" -> crash setupKeys qui bloque le canvas).
    (window as any).EJS_language = 'en-US';
    // Fonctions avancées activées
    (window as any).EJS_volume = 0.8; // volume par défaut
    (window as any).EJS_Buttons = {
      playPause: true,
      restart: true,
      mute: true,
      settings: true,
      fullscreen: true,
      saveState: true, // sauvegardes d'état
      loadState: true,
      screenRecord: true, // capture vidéo
      gamepad: true, // remapping manette
      cheat: true, // triche/GameShark
      volume: true,
      screenshot: true, // capture d'écran
      quickSave: true,
      quickLoad: true,
      contextMenu: false,
    };
    (window as any).EJS_defaultOptions = { 'save-state-location': 'browser' }; // états sauvés localement
    (window as any).EJS_fullscreen = true; // bouton plein écran disponible

    const script = document.createElement('script');
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    script.async = true;

    containerRef.current.appendChild(script);

    return () => {
      try {
        script.remove();
      } catch {
        /* noop */
      }
    };
  }, [game]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
      {/* Barre de titre du lecteur */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-black text-retro-accent uppercase tracking-widest truncate">
            {game.cleanTitle || game.title}
          </span>
          <span className="text-[10px] text-slate-500 font-mono uppercase hidden sm:inline">
            {game.systemId} • Émulation Web
          </span>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-300 text-xs font-bold transition"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Quitter le jeu</span>
        </button>
      </div>

      {/* Zone de jeu */}
      <div className="flex-1 min-h-0 flex items-center justify-center bg-black">
        <div
          ref={containerRef}
          className="w-full h-full max-w-5xl"
          style={{ height: '100%' }}
        >
          <div id="ejs-game-container" className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};
