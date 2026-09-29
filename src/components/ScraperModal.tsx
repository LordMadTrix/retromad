import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  X,
  ImageOff,
  SkipForward,
  Activity,
  Clock,
  TrendingUp,
  Gamepad2,
  Zap,
} from 'lucide-react';
import { resolveMediaUrl } from '../utils/media';


interface ScraperModalProps {
  isOpen: boolean;
  total: number;
  current: number;
  currentGameTitle: string;
  isComplete: boolean;
  onClose: () => void;
  // Champs enrichis optionnels (v2)
  found?: number;
  notFound?: number;
  skipped?: number;
  currentBoxartUrl?: string;
}

/**
 * Modal de scraping redesigné — RetroMad v2
 * Affiche en temps réel :
 *  - Barre de progression globale avec ETA
 *  - Aperçu live de la jaquette fraîchement trouvée
 *  - Statistiques : trouvé / introuvable / ignoré
 *  - Liste des 8 dernières jaquettes collectées (mosaïque)
 */
export const ScraperModal: React.FC<ScraperModalProps> = ({
  isOpen,
  total,
  current,
  currentGameTitle,
  isComplete,
  onClose,
  found = 0,
  notFound = 0,
  skipped = 0,
  currentBoxartUrl,
}) => {
  if (!isOpen) return null;

  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const [recentBoxarts, setRecentBoxarts] = useState<{ title: string; url: string }[]>([]);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const prevBoxartRef = useRef<string | undefined>();

  // Horloge écoulée
  useEffect(() => {
    if (isComplete) return;
    const timer = setInterval(() => setElapsed(Date.now() - startTime), 1000);
    return () => clearInterval(timer);
  }, [isComplete, startTime]);

  // Collecte des jaquettes récentes pour la mosaïque
  useEffect(() => {
    if (currentBoxartUrl && currentBoxartUrl !== prevBoxartRef.current) {
      prevBoxartRef.current = currentBoxartUrl;
      setRecentBoxarts((prev) => {
        const next = [{ title: currentGameTitle, url: currentBoxartUrl }, ...prev];
        return next.slice(0, 12); // Garder les 12 dernières
      });
    }
  }, [currentBoxartUrl, currentGameTitle]);

  // ETA
  const eta = (() => {
    if (current === 0 || elapsed === 0) return null;
    const msPerGame = elapsed / current;
    const remaining = (total - current) * msPerGame;
    if (remaining < 5000) return 'Presque terminé…';
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    return mins > 0 ? `~${mins}m ${secs}s` : `~${secs}s`;
  })();

  const formatElapsed = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
  };

  const processed = found + notFound + skipped;
  const successCount = found + skipped;
  const successRate = processed > 0
    ? Math.round((successCount / processed) * 100)
    : 0;

  return (

    <div className="retromad-modal-overlay">
      <div className="retromad-modal-card max-w-2xl w-full p-0 overflow-hidden">
        {/* ── EN-TÊTE ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
              isComplete
                ? 'bg-emerald-500/15 border-emerald-500/40'
                : 'bg-violet-500/15 border-violet-500/40'
            }`}>
              {isComplete
                ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                : <Sparkles className="w-4.5 h-4.5 text-violet-400 animate-pulse" />
              }
            </div>
            <div>
              <h3 className="text-sm font-black text-white">
                {isComplete ? '✨ Scraping terminé !' : 'Récupération automatique des médias'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {isComplete
                  ? `${found} jaquette(s) récupérée(s) sur ${total} jeu(x)`
                  : 'Libretro Thumbnails CDN + OpenVGDB — Détection automatique de région'
                }
              </p>
            </div>
          </div>

          {isComplete && (
            <button onClick={onClose} className="retromad-modal-close-btn">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* ── BARRE DE PROGRESSION ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold">Progression</span>
                {!isComplete && (
                  <span className="text-slate-500 font-mono text-[10px]">
                    {current} / {total}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {eta && !isComplete && (
                  <span className="text-slate-500 text-[10px] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {eta}
                  </span>
                )}
                <span className="font-black text-violet-300 font-mono text-base">
                  {percentage}%
                </span>
              </div>
            </div>

            {/* Barre principale */}
            <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isComplete
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-violet-600 to-cyan-400'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Mini barre de succès */}
            {(found + notFound) > 0 && (
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500/70 transition-all duration-300"
                  style={{ width: `${successRate}%` }}
                />
              </div>
            )}
          </div>

          {/* ── ZONE PRINCIPALE : Live preview + Stats ── */}
          <div className="grid grid-cols-5 gap-4">
            {/* Live preview jaquette */}
            <div className="col-span-2">
              <div className="aspect-[3/4] rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden relative">
                {currentBoxartUrl ? (
                  <img
                    key={currentBoxartUrl}
                    src={resolveMediaUrl(currentBoxartUrl)}
                    alt={currentGameTitle}
                    className="w-full h-full object-cover animate-in fade-in duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    {isComplete ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <Loader2 className="w-7 h-7 text-violet-400 animate-spin" />
                    )}
                    <span className="text-[10px] text-slate-500 text-center px-2">
                      {isComplete ? 'Terminé' : 'Recherche…'}
                    </span>
                  </div>
                )}
                {!isComplete && currentBoxartUrl && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <span className="text-[9px] text-emerald-300 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Trouvée !
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Statistiques + jeu actuel */}
            <div className="col-span-3 space-y-3 flex flex-col justify-between">
              {/* Jeu en cours */}
              <div className={`p-3 rounded-xl border ${
                isComplete
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-slate-900/60 border-slate-800'
              } flex items-start gap-2.5`}>
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Loader2 className="w-4 h-4 text-violet-400 animate-spin shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                    {isComplete ? 'Session terminée' : 'En cours de traitement :'}
                  </span>
                  <span className="text-xs font-bold text-white block truncate mt-0.5">
                    {isComplete
                      ? 'Toutes les jaquettes ont été synchronisées !'
                      : currentGameTitle || 'Initialisation…'
                    }
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mb-1" />
                  <span className="text-xl font-black text-emerald-300 block leading-none">{found + (skipped || 0)}</span>
                  <span className="text-[10px] text-emerald-400/70">Jaquettes trouvées</span>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25">
                  <ImageOff className="w-3.5 h-3.5 text-rose-400 mb-1" />
                  <span className="text-xl font-black text-rose-300 block leading-none">{notFound}</span>
                  <span className="text-[10px] text-rose-400/70">Introuvables</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <SkipForward className="w-3.5 h-3.5 text-slate-400 mb-1" />
                  <span className="text-xl font-black text-slate-300 block leading-none">{skipped || 0}</span>
                  <span className="text-[10px] text-slate-500">En cache local</span>
                </div>
                <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/25">
                  <TrendingUp className="w-3.5 h-3.5 text-violet-400 mb-1" />
                  <span className="text-xl font-black text-violet-300 block leading-none">
                    {successRate}%
                  </span>
                  <span className="text-[10px] text-violet-400/70">Taux de succès</span>
                </div>
              </div>

              {/* Durée écoulée */}
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <Activity className="w-3 h-3" />
                <span>Durée : <span className="font-mono text-slate-400">{formatElapsed(elapsed)}</span></span>
                {!isComplete && (
                  <>
                    <span className="text-slate-700">·</span>
                    <Zap className="w-3 h-3 text-violet-500" />
                    <span className="text-violet-400">Détection région auto · Cache actif</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── MOSAÏQUE des jaquettes récentes ── */}
          {recentBoxarts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Gamepad2 className="w-3 h-3 text-slate-500" />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Dernières jaquettes collectées
                </span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {recentBoxarts.map((item, idx) => (
                  <div
                    key={`${item.url}-${idx}`}
                    className="w-10 h-[52px] rounded-lg overflow-hidden border border-slate-800 bg-slate-900 relative group shrink-0"
                    title={item.title}
                  >
                    <img
                      src={resolveMediaUrl(item.url)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                      }}
                    />
                    {idx === 0 && (
                      <div className="absolute inset-0 border-2 border-emerald-400/60 rounded-lg pointer-events-none" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PIED DE MODAL ── */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800">
            <div className="text-[10px] text-slate-600">
              {isComplete
                ? `✓ Jaquettes stockées localement — disponibles hors-ligne`
                : `Sources : Libretro CDN · OpenVGDB · ScreenScraper`
              }
            </div>
            <button
              onClick={onClose}
              disabled={!isComplete}
              className={
                isComplete
                  ? 'retromad-btn-primary'
                  : 'px-4 py-2 rounded-xl bg-slate-800/40 text-slate-600 text-xs font-semibold cursor-not-allowed border border-slate-700/40'
              }
            >
              {isComplete ? '🎮 Explorer ma bibliothèque' : 'Scraping en cours…'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
