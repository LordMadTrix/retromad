import React, { useEffect, useRef } from 'react';
import { Game } from '../types';
import { X } from 'lucide-react';

import { EJS_CORE_BY_SYSTEM } from '../constants/emulatorjs';
export { EJS_CORE_BY_SYSTEM };

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
    if (mountedRef.current && window.EJS_emulator) {
      try {
        window.EJS_emulator.callEvent?.('exit');
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
    if (window.__retromad_ejs_loaded) return;
    window.__retromad_ejs_loaded = true;

    // ROM servie par le serveur web (public/roms/...), ou blob:/http fourni
    // par App.tsx quand la ROM a été lue depuis le disque (mode bureau).
    let romUrl = game.path;
    if (!romUrl.startsWith('/') && !romUrl.startsWith('http') && !romUrl.startsWith('blob:')) {
      romUrl = `/roms/${game.systemId}/${game.filename}`;
    }

    const core = EJS_CORE_BY_SYSTEM[game.systemId] || 'nes';

    // Config globale EmulatorJS
    window.EJS_player = '#ejs-game-container';
    window.EJS_core = core;
    window.EJS_gameUrl = romUrl;
    window.EJS_gameName = game.cleanTitle || game.title;
    window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
    window.EJS_startOnLoaded = true;
    // Langue forcée en anglais : le CDN ne fournit pas les fichiers de langue
    // fr (404 -> "Missing language" -> crash setupKeys qui bloque le canvas).
    window.EJS_language = 'en-US';
    // Fonctions avancées activées
    window.EJS_volume = 0.8; // volume par défaut
    window.EJS_Buttons = {
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
    window.EJS_defaultOptions = { 'save-state-location': 'browser' }; // états sauvés localement
    window.EJS_fullscreen = true; // bouton plein écran disponible

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
