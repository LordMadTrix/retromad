import React, { useState } from 'react';
import { Play } from 'lucide-react';

/**
 * Lecteur YouTube insensible aux blocages 152/153.
 *
 * Contexte : le player YouTube embarqué (iframe) est actuellement bloqué par
 * YouTube dans les WebViews/Electron (erreur « Cette vidéo n'est pas
 * disponible », codes 152/153), alors que la page watch classique fonctionne.
 *
 * Stratégie :
 * - Desktop (Electron) : vignette cliquable → ouverture de la page watch dans
 *   le navigateur système (shell.openExternal via IPC 'open-external').
 * - Navigateur web : l'iframe embed fonctionne, elle est conservée à l'identique.
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

interface YoutubePlayableProps {
  videoId: string;
  title: string;
  className?: string;
  /** Masque le bandeau explicatif (usages décoratifs en fond de carte/bannière). */
  compact?: boolean;
}

/**
 * Écran 16:9 « toujours jouable » : iframe embed en navigateur web,
 * vignette ouvrant le navigateur système en desktop.
 */
export const YoutubePlayable: React.FC<YoutubePlayableProps> = ({
  videoId,
  title,
  className = 'w-full h-full',
  compact = false,
}) => {
  const [desktop] = useState(isDesktopApp);
  const [thumbSrc, setThumbSrc] = useState(
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  );

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

  return (
    <button
      type="button"
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
    </button>
  );
};
