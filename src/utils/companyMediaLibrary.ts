import { useCallback, useEffect, useState } from 'react';

/**
 * Médiathèque d'archives par firme : photos d'époque + vidéos multiples,
 * stockées hors ligne dans media/company-gallery/<companyId>/ et servies via
 * le protocole retromad-media:// — aucune dépendance à YouTube ni au réseau.
 */

export interface CompanyMediaItem {
  url: string;
  name: string;
}

export interface CompanyMediaApi {
  selectMediaFiles: () => Promise<string[]>;
  importCompanyMedia: (
    companyId: string,
    sourcePaths: string[]
  ) => Promise<{ ok: boolean; added: number; skipped?: number; error?: string }>;
  listCompanyMedia: (
    companyId: string
  ) => Promise<{ photos: CompanyMediaItem[]; videos: CompanyMediaItem[] }>;
  removeCompanyMedia: (companyId: string, fileName: string) => Promise<boolean>;
}

export const companyMediaApi: CompanyMediaApi | null =
  typeof window !== 'undefined' && window.api?.importCompanyMedia
    ? {
        selectMediaFiles: window.api.selectMediaFiles.bind(window.api),
        importCompanyMedia: window.api.importCompanyMedia.bind(window.api),
        listCompanyMedia: window.api.listCompanyMedia.bind(window.api),
        removeCompanyMedia: window.api.removeCompanyMedia.bind(window.api),
      }
    : null;

/** Liste la médiathèque d'une firme ; `refresh` relit le dossier après un import/retrait. */
export function useCompanyMediaLibrary(companyId: string): {
  photos: CompanyMediaItem[];
  videos: CompanyMediaItem[];
  loading: boolean;
  refresh: () => void;
} {
  const [photos, setPhotos] = useState<CompanyMediaItem[]>([]);
  const [videos, setVideos] = useState<CompanyMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!companyMediaApi || !companyId) {
      setPhotos([]);
      setVideos([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    companyMediaApi
      .listCompanyMedia(companyId)
      .then((res) => {
        if (cancelled) return;
        setPhotos(res.photos ?? []);
        setVideos(res.videos ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setPhotos([]);
          setVideos([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId, tick]);

  return { photos, videos, loading, refresh };
}
