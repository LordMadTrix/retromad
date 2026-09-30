import { useEffect, useState } from 'react';

/**
 * Vidéos MP4 locales par firme.
 *
 * Les fichiers sont copiés hors ligne dans le dossier de données
 * (media/company-videos/<companyId>.<ext>) et servis par le protocole
 * retromad-media:// — l'app ne dépend donc ni de YouTube ni du fichier
 * d'origine (qui peut être déplacé ou supprimé).
 *
 * En desktop, `useCompanyLocalVideo(companyId)` renvoie l'URL locale dès
 * qu'une vidéo existe ; en navigateur web, toujours null.
 */

export interface CompanyLocalVideoApi {
  selectVideoFile: () => Promise<string | null>;
  importCompanyVideo: (
    companyId: string,
    sourcePath: string
  ) => Promise<{ ok: boolean; url?: string; path?: string; error?: string }>;
  getCompanyVideo: (companyId: string) => Promise<string | null>;
  removeCompanyVideo: (companyId: string) => Promise<boolean>;
}

export const companyLocalVideoApi: CompanyLocalVideoApi | null =
  typeof window !== 'undefined' && window.api?.importCompanyVideo
    ? {
        selectVideoFile: window.api.selectVideoFile.bind(window.api),
        importCompanyVideo: window.api.importCompanyVideo.bind(window.api),
        getCompanyVideo: window.api.getCompanyVideo.bind(window.api),
        removeCompanyVideo: window.api.removeCompanyVideo.bind(window.api),
      }
    : null;

/** URL retromad-media:// de la vidéo locale de la firme, ou null. */
export function useCompanyLocalVideo(companyId: string): {
  url: string | null;
  loading: boolean;
  refresh: () => void;
} {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!companyLocalVideoApi || !companyId) {
      setLoading(false);
      setUrl(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    companyLocalVideoApi
      .getCompanyVideo(companyId)
      .then((found) => {
        if (!cancelled) setUrl(found);
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId, tick]);

  return { url, loading, refresh: () => setTick((t) => t + 1) };
}
