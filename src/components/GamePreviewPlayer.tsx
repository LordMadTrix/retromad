import React, { useEffect, useRef } from 'react';
import { Game } from '../types';
import { EJS_CORE_BY_SYSTEM } from '../constants/emulatorjs';
import { resolveMediaUrl } from '../utils/media';

interface GamePreviewPlayerProps {
  game: Game;
  /** Largueur/hauteur du conteneur (le parent gère la taille) */
  className?: string;
}

/**
 * Mini-lecteur aperçu : joue la vidéo MP4 de gameplay si elle est scrapée/disponible,
 * ou démarre la démo EmulatorJS silencieuse en repli.
 */
export const GamePreviewPlayer: React.FC<GamePreviewPlayerProps> = ({ game, className = '' }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoUrl = resolveMediaUrl(game.media?.video);

  useEffect(() => {
    if (videoUrl) return; // Si la vidéo existe, pas besoin d'iframe EmulatorJS

    let romUrl = game.path;
    if (!romUrl.startsWith('/') && !romUrl.startsWith('http') && !romUrl.startsWith('blob:')) {
      romUrl = `/roms/${game.systemId}/${game.filename}`;
    }
    const core = EJS_CORE_BY_SYSTEM[game.systemId] || 'nes';
    const cfg = {
      EJS_player: '#preview-container',
      EJS_core: core,
      EJS_gameUrl: romUrl,
      EJS_gameName: game.cleanTitle || game.title,
      EJS_pathtodata: 'https://cdn.emulatorjs.org/stable/data/',
      EJS_startOnLoaded: true,
      EJS_language: 'en-US',
      EJS_volume: 0, // démo toujours silencieuse
      EJS_Buttons: { playPause: false, restart: false, mute: false, settings: false, fullscreen: false, saveState: false, loadState: false, screenRecord: false, gamepad: false, cheat: false, volume: false, screenshot: false, quickSave: false, quickLoad: false, contextMenu: false },
      EJS_defaultOptions: { 'save-state-location': 'browser' },
    };

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  html,body{margin:0;padding:0;background:#05070d;overflow:hidden;width:100%;height:100%}
  #preview-container{width:100%;height:100%}
</style></head><body>
<div id="preview-container"></div>
<script>window.CONFIG=${JSON.stringify(cfg)};</script>
<script>
  for (const k in window.CONFIG) window[k] = window.CONFIG[k];
  var s=document.createElement('script');
  s.src='https://cdn.emulatorjs.org/stable/data/loader.js';
  document.body.appendChild(s);
</script>
</body></html>`;

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.srcdoc = html;
    }
  }, [game, videoUrl]);

  if (videoUrl) {
    return (
      <video
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        className={`${className} object-cover w-full h-full`}
      />
    );
  }

  return <iframe ref={iframeRef} className={className} title={`Aperçu ${game.cleanTitle}`} sandbox="allow-scripts allow-same-origin" />;
};

