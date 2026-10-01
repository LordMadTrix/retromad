import { Recording, ShareNetwork } from '../../electron/types';

/** Indique si l'appli tourne dans Electron (desktop) ou dans un navigateur web. */
const isDesktopApp: boolean = typeof window !== 'undefined' && !!window.isElectron;

// ─── Formateurs d'affichage ──────────────────────────────────────────

/** Convertit des octets en une chaîne lisible (1.5 Mo, 234 Ko, …). */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'Ko', 'Mo', 'Go', 'To'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Convertit des millisecondes en hh:mm:ss ou mm:ss. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Formate une date ISO en chaîne lisible « dd/mm/yyyy HH:MM ». */
export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// ─── Partage multi-réseaux (local-first, pages navigateur ouvertes) ─────

/**
 * Construit l'URL de partage pour un réseau social donné.
 *
 * Approche local-first : aucun secret OAuth stocké. Les enregistrements sont
 * des fichiers sur le disque ; on ouvre simplement la page de téléchargement
 * ou de composition pré-remplie dans le navigateur système. L'utilisateur
 * termine l'opération manuellement (sélection du fichier → publier).
 *
 * - YouTube / TikTok : page d'upload officielle (le fichier est déjà sur le disque).
 * - Twitter / X    : intention tweet pré-remplie avec un message contextuel.
 * - Discord         : ouverture d'une discussion privée pour partager le lien.
 */
export function shareNetworkUrl(network: ShareNetwork, recording: Recording): string {
  const fileName = recording.name;
  const sizeStr = formatFileSize(recording.size);
  const durationStr = recording.durationMs ? formatDuration(recording.durationMs) : null;
  const dateStr = formatDate(recording.createdAt);

  const text = durationStr
    ? `🎮 Enregistrement RetroMad : ${fileName} (${durationStr}, ${sizeStr})`
    : `🎮 Enregistrement RetroMad : ${fileName} (${sizeStr})`;

  switch (network) {
    case 'youtube':
      // YouTube Studio — page d'upload officielle. L'utilisateur sélectionne
      // le fichier depuis media/recordings/ dans l'explorateur natif.
      return 'https://studio.youtube.com/video/upload';

    case 'twitter':
      // X (Twitter) — intention de tweet pré-remplie. Le lecteur pourra
      // coller le lien du fichier ou décrire l'enregistrement.
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text + ` — ${dateStr}`)}`;

    case 'tiktok':
      // TikTok Creator Center — upload web (disponible sur desktop).
      return 'https://www.tiktok.com/creator-center/upload';

    case 'discord':
      // Discord web — ouverture sur les messages privés pour partager
      // le lien ou déposer le fichier.
      return 'https://discord.com/channels/@me';

    default:
      return `https://example.com/share?file=${encodeURIComponent(fileName)}`;
  }
}

/** Ouvre l'URL de partage dans le navigateur système (desktop) ou un nouvel onglet. */
export async function openShare(network: ShareNetwork, recording: Recording): Promise<boolean> {
  const url = shareNetworkUrl(network, recording);
  try {
    if (isDesktopApp && window.api?.openExternal) {
      return await window.api.openExternal(url);
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  } catch (e) {
    console.warn(`[RetroMad] Impossible d'ouvrir ${network} :`, e);
    return false;
  }
}

/**
 * Retourne le libellé d'un réseau de partage pour l'UI.
 */
export const SHARE_NETWORK_LABELS: Record<ShareNetwork, string> = {
  youtube: 'YouTube',
  twitter: 'Twitter / X',
  tiktok: 'TikTok',
  discord: 'Discord',
};

/**
 * Retourne la couleur d'accent pour un réseau de partage (classe Tailwind).
 */
export const SHARE_NETWORK_COLORS: Record<ShareNetwork, string> = {
  youtube: 'bg-red-500/20 border-red-400/50 text-red-300 hover:bg-red-500/30',
  twitter: 'bg-sky-500/20 border-sky-400/50 text-sky-300 hover:bg-sky-500/30',
  tiktok: 'bg-neutral-400/20 border-neutral-400/50 text-neutral-300 hover:bg-neutral-400/30',
  discord: 'bg-indigo-500/20 border-indigo-400/50 text-indigo-300 hover:bg-indigo-500/30',
};
