import React, { useEffect, useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Images,
  Film,
  FolderOpen,
  Trash2,
  Camera,
} from 'lucide-react';
import { Company } from '../types';
import {
  companyMediaApi,
  useCompanyMediaLibrary,
} from '../utils/companyMediaLibrary';

interface CompanyMediaGalleryProps {
  company: Company;
  /** Ajout/retrait de médias : réservé à l'Admin hors Kiosque. */
  canManage: boolean;
}

/**
 * Médiathèque d'archives d'une firme :
 * - galerie de photos d'époque (grille, lightbox plein écran, flèches clavier)
 * - vidéos multiples lues nativement dans l'app (retromad-media://, hors ligne)
 * - section de gestion (import/retrait) visible uniquement côté Admin
 */
export const CompanyMediaGallery: React.FC<CompanyMediaGalleryProps> = ({ company, canManage }) => {
  const { photos, videos, loading, refresh } = useCompanyMediaLibrary(company.id);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Navigation lightbox : flèches + Échap, bouclée sur la galerie.
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      else if (e.key === 'ArrowLeft')
        setLightboxIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
      else if (e.key === 'ArrowRight')
        setLightboxIndex((i) => (i === null ? null : (i + 1) % photos.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, photos.length]);

  if (!companyMediaApi) return null; // navigateur web : fonctionnalité desktop

  const handleImport = async () => {
    if (!companyMediaApi || busy) return;
    setBusy(true);
    setError(null);
    try {
      const picked = await companyMediaApi.selectMediaFiles();
      if (!picked || picked.length === 0) return;
      const res = await companyMediaApi.importCompanyMedia(company.id, picked);
      if (res.ok) {
        refresh();
      } else {
        setError(res.error || 'Import impossible.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (fileName: string) => {
    if (!companyMediaApi || busy) return;
    setBusy(true);
    setError(null);
    try {
      const ok = await companyMediaApi.removeCompanyMedia(company.id, fileName);
      if (ok) {
        refresh();
        setLightboxIndex(null);
      } else {
        setError('Suppression impossible.');
      }
    } finally {
      setBusy(false);
    }
  };

  if (photos.length === 0 && videos.length === 0 && !canManage) return null;

  return (
    <div className="space-y-4">
      {/* Barre de gestion (Admin) */}
      {canManage && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 flex items-center space-x-1.5">
              <Images className="w-3.5 h-3.5" />
              <span>Médiathèque d'archives — photos & vidéos hors ligne</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-400">
              {photos.length} photo(s) • {videos.length} vidéo(s)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Photos d'époque et vidéos multiples copiées dans les données de RetroMad, lues
            nativement — sans YouTube, sans connexion.
          </p>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleImport}
              disabled={busy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition shadow cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>{busy ? 'Import en cours…' : 'Ajouter des photos / vidéos…'}</span>
            </button>
          </div>
          {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}
          {loading && <p className="text-[10px] text-slate-500">Lecture de la médiathèque…</p>}
        </div>
      )}

      {/* Galerie photos d'époque */}
      {photos.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <Camera className="w-3.5 h-3.5 text-slate-400" />
            <span>Photos d'époque ({photos.length})</span>
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {photos.map((p, idx) => (
              <button
                key={p.url}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className="relative aspect-square rounded-xl overflow-hidden border border-slate-700 hover:border-retro-accent hover:scale-[1.03] transition cursor-pointer group bg-slate-950"
              >
                <img
                  src={p.url}
                  alt={`Archive ${company.name} ${idx + 1}`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:opacity-90 transition"
                />
                {canManage && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(p.name);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.stopPropagation();
                        handleRemove(p.name);
                      }
                    }}
                    className="absolute top-1 right-1 p-1 rounded-lg bg-black/80 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition"
                    title="Retirer cette photo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Vidéos multiples natives */}
      {videos.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <Film className="w-3.5 h-3.5 text-slate-400" />
            <span>Archives vidéo ({videos.length})</span>
            <span className="text-[10px] font-normal text-slate-500 normal-case tracking-normal">
              (lecture native, hors ligne)
            </span>
          </span>
          <div className="space-y-3">
            {videos.map((v) => (
              <div
                key={v.url}
                className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black"
              >
                <video
                  src={v.url}
                  controls
                  loop
                  playsInline
                  preload="metadata"
                  className="w-full aspect-video"
                />
                {canManage && (
                  <button
                    type="button"
                    onClick={() => handleRemove(v.name)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 text-red-400 hover:text-red-300 transition"
                    title="Retirer cette vidéo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox plein écran */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/90 text-slate-300 hover:text-white transition z-10"
          >
            <X className="w-5 h-5" />
          </button>
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) =>
                    i === null ? null : (i - 1 + photos.length) % photos.length
                  );
                }}
                className="absolute left-4 p-2.5 rounded-full bg-slate-800/90 text-white hover:bg-slate-700 transition z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) => (i === null ? null : (i + 1) % photos.length));
                }}
                className="absolute right-4 p-2.5 rounded-full bg-slate-800/90 text-white hover:bg-slate-700 transition z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <img
            onClick={(e) => e.stopPropagation()}
            src={photos[lightboxIndex].url}
            alt={`Archive ${company.name} ${lightboxIndex + 1}`}
            referrerPolicy="no-referrer"
            className="max-w-[92vw] max-h-[88vh] object-contain rounded-xl shadow-2xl"
          />
          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/80 text-white text-xs font-bold border border-white/10">
            {lightboxIndex + 1} / {photos.length} — flèches pour naviguer, Échap pour fermer
          </span>
        </div>
      )}
    </div>
  );
};
