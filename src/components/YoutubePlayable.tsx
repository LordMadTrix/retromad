import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';

/**
 * Lecteur YouTube « auto-réparant ».
 *
 * Stratégie :
 * 1. On tente TOUJOURS le lecteur intégré (iframe embed via l'API IFrame
 *    YouTube) — dès que YouTube lèvera son blocage des environnements
 *    embarqués (erreurs 152/153), la lecture intégrée reviendra toute seule.
 * 2. Si YouTube renvoie une erreur (événement onError, API non chargeable ou
 *    player qui ne s'initialise pas), on bascule automatiquement sur la
 *    vignette cliquable qui ouvre la page watch dans le navigateur système
 *    (desktop) — lecture garantie.
 * 3. Un bouton « Réessayer le lecteur intégré » permet de retenter l'embed
 *    sans recharger l'app.
 *
 * En navigateur web (non-Electron) l'iframe fonctionne normalement : aucun
 * mécanisme de repli n'est nécessaire.
 */

export const isDesktopApp: boolean = typeof window !== 'undefined' && !!window.isElectron;

export const youtubeWatchUrl = (videoId: string): string =>
  `https://www.youtube.com/watch?v=${videoId}`;

/** Ouvre la page watch YouTube hors de l'app (navigateur système en desktop). */
export const openYouTubeWatch = (videoId: string): void => {
  const url = youtubeWatchUrl(videoId);
  if (isDesktopApp) {
    window.api?.openExternal(url);
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

// ── Types minimaux pour l'API IFrame YouTube (aucune dépendance npm) ────────
interface YTPlayer {
  destroy: () => void;
}
interface YTPlayerEvent {
  data: number;
}
interface YTNamespace {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      width?: string | number;
      height?: string | number;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: () => void;
        onError?: (e: YTPlayerEvent) => void;
        onStateChange?: (e: YTPlayerEvent) => void;
      };
    }
  ) => YTPlayer;
  PlayerState: { PLAYING: number; BUFFERING: number };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// L'API est chargée une seule fois pour toute l'app (promesse partagée).
let ytApiPromise: Promise<YTNamespace> | null = null;

function loadYouTubeIframeApi(): Promise<YTNamespace> {
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise<YTNamespace>((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('API YouTube : document indisponible'));
      return;
    }
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error('API YouTube indisponible'));
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => reject(new Error('Chargement API YouTube impossible'));
    document.head.appendChild(script);
    setTimeout(() => reject(new Error('API YouTube : délai dépassé')), 10000);
  });
  return ytApiPromise;
}

interface YoutubePlayableProps {
  videoId: string;
  title: string;
  className?: string;
  /** Masque les bandeaux explicatifs (usages décoratifs en fond de carte/bannière). */
  compact?: boolean;
}

export const YoutubePlayable: React.FC<YoutubePlayableProps> = ({
  videoId,
  title,
  className = 'w-full h-full',
  compact = false,
}) => {
  const [desktop] = useState(isDesktopApp);
  // false = on tente le lecteur intégré ; true = repli vignette navigateur.
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [thumbSrc, setThumbSrc] = useState(
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  );
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Nouvelle vidéo → on retente l'embed et on réinitialise la vignette.
  useEffect(() => {
    setFailed(false);
    setThumbSrc(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
  }, [videoId]);

  // Desktop : tentative du lecteur intégré via l'API IFrame, avec repli auto.
  useEffect(() => {
    if (!desktop || failed) return;
    let cancelled = false;
    let player: YTPlayer | null = null;
    let ready = false;

    // Le host est créé hors de React : l'API remplace l'élément par l'iframe,
    // ce qui casserait la réconciliation si le nœud était géré par React.
    const container = containerRef.current;
    const host = document.createElement('div');
    if (container) container.appendChild(host);

    loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled) return;
        player = new YT.Player(host, {
          videoId,
          width: '100%',
          height: '100%',
          playerVars: { rel: 0, modestbranding: 1 },
          events: {
            onReady: () => {
              ready = true;
            },
            onError: () => {
              console.warn(
                '[RetroMad] Lecteur YouTube intégré refusé — bascule automatique sur le navigateur système.'
              );
              if (!cancelled) setFailed(true);
            },
          },
        });
      })
      .catch(() => {
        // API non chargeable → même repli que pour une erreur du player.
        if (!cancelled) setFailed(true);
      });

    // Filet : si le player ne s'initialise pas du tout (blocage silencieux),
    // on bascule aussi sur la vignette.
    const watchdog = setTimeout(() => {
      if (!cancelled && !ready) setFailed(true);
    }, 15000);

    return () => {
      cancelled = true;
      clearTimeout(watchdog);
      try {
        player?.destroy();
      } catch {
        /* ignore */
      }
      if (container) container.innerHTML = '';
    };
  }, [desktop, failed, attempt, videoId]);

  // ── Navigateur web : iframe embed directe, aucun repli nécessaire ──
  if (!desktop) {
    return (
      <iframe
        title={title}
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
        className={`${className} border-0`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  // ── Desktop, repli actif : vignette cliquable + réessai de l'embed ──
  if (failed) {
    return (
      <div
        onClick={() => openYouTubeWatch(videoId)}
        title={`Lire « ${title} » dans le navigateur`}
        className={`group relative block bg-black overflow-hidden text-left cursor-pointer ${className}`}
      >
        <img
          src={thumbSrc}
          onError={() => setThumbSrc(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`)}
          alt={title}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 transition-colors" />
        <div className="absolute inset-0 scanlines opacity-15 pointer-events-none" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex items-center justify-center w-16 h-12 rounded-2xl bg-red-600 shadow-2xl group-hover:scale-110 group-hover:bg-red-500 transition-all duration-300">
            <Play className="w-7 h-7 text-white fill-white translate-x-[1px]" />
          </span>
        </span>
        {!compact && (
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/80 text-white text-[11px] font-bold whitespace-nowrap backdrop-blur-sm border border-white/10">
            Lire dans le navigateur — lecteur intégré bloqué par YouTube
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setFailed(false);
            setAttempt((a) => a + 1);
          }}
          title="Retenter la lecture intégrée (au cas où YouTube aurait levé le blocage)"
          className="absolute bottom-3 right-3 z-10 flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-black/80 hover:bg-slate-800 text-slate-200 hover:text-white text-[10px] font-bold backdrop-blur-sm border border-white/15 transition cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Réessayer le lecteur intégré</span>
        </button>
      </div>
    );
  }

  // ── Desktop, tentative en cours : host vide, l'API IFrame y crée l'iframe ──
  return <div ref={containerRef} className={`${className} bg-black`} />;
};
