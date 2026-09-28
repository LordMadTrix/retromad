import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HeartPulse, ImageOff, Cpu, Copy, HardDrive, AlertTriangle, CheckCircle2, RefreshCw, Trash2, Image, Images, Square, FolderOpen } from 'lucide-react';
import { Game, BiosStatus } from '../../types';

interface CollectionHealthReportProps {
  games: Game[];
  biosStatuses: BiosStatus[];
  isCheckingBios?: boolean;
  onCheckBios?: () => Promise<void>;
  /** Scraper la jaquette d'un jeu précis */
  onScrapeGame?: (game: Game) => Promise<void>;
  /** Callback de scraping brut (sans notification par jeu) : utilisé par « Tout scraper » */
  onScrapeGameRaw?: (game: Game) => Promise<void>;
  /** Supprimer un jeu (doublon) */
  onDeleteGame?: (game: Game) => void;
  /** Jeu en cours de scraping (spinner) */
  scrapingGameId?: string | null;
}

const formatBytes = (bytes: number): string => {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} Go`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} Mo`;
  return `${(bytes / 1024).toFixed(0)} Ko`;
};

/**
 * Rapport santé de la collection : d'un coup d'œil, tout ce qui mérite
 * une action — ROMs sans jaquette, BIOS manquants, doublons, poids disque.
 */
export const CollectionHealthReport: React.FC<CollectionHealthReportProps> = ({
  games,
  biosStatuses,
  isCheckingBios = false,
  onCheckBios,
  onScrapeGame,
  onScrapeGameRaw,
  onDeleteGame,
  scrapingGameId = null,
}) => {
  // ── « TOUT SCRAPPER » : chaîne toutes les jaquettes manquantes, avec progression ──
  const [bulkState, setBulkState] = useState<{
    running: boolean;
    done: number;
    total: number;
    ok: number;
    fail: number;
  } | null>(null);
  const cancelBulkRef = useRef(false);
  const gamesRef = useRef(games);
  useEffect(() => {
    gamesRef.current = games;
  }, [games]);

  // Le jeu a-t-il toujours une jaquette manquante dans l'état le plus récent ?
  const stillMissing = (g: Game): boolean => {
    const cur = gamesRef.current.find((x) => x.id === g.id);
    return !cur || (!cur.media?.boxart2d && !cur.media?.boxart3d && !cur.media?.wheel);
  };

  const handleBulkScrape = async () => {
    if (!onScrapeGameRaw || bulkState?.running) return;
    const targets = gamesWithoutBoxart.slice(); // instantané stable pour la boucle
    if (targets.length === 0) return;
    cancelBulkRef.current = false;
    setBulkState({ running: true, done: 0, total: targets.length, ok: 0, fail: 0 });
    let ok = 0;
    let fail = 0;
    let done = 0;
    for (const g of targets) {
      if (cancelBulkRef.current) break;
      try {
        if (stillMissing(g)) {
          await onScrapeGameRaw(g);
          if (!stillMissing(g)) ok++;
          else fail++;
        } else {
          ok++; // déjà résolu entre-temps (scraper manuel pendant la chaîne…)
        }
      } catch {
        fail++;
      }
      done++;
      setBulkState({
        running: !cancelBulkRef.current && done < targets.length,
        done,
        total: targets.length,
        ok,
        fail,
      });
    }
    setBulkState((prev) => (prev ? { ...prev, running: false } : prev));
  };

  const stopBulkScrape = () => {
    cancelBulkRef.current = true;
  };
  // ROMs sans jaquette
  const gamesWithoutBoxart = useMemo(
    () => games.filter((g) => !g.media?.boxart2d && !g.media?.boxart3d && !g.media?.wheel),
    [games]
  );

  // BIOS manquants (obligatoires d'abord)
  const missingBios = useMemo(() => biosStatuses.filter((b) => !b.found), [biosStatuses]);
  const missingRequiredBios = useMemo(() => missingBios.filter((b) => !b.optional), [missingBios]);

  // Doublons : même cleanTitle sur le même système
  const duplicates = useMemo(() => {
    const seen = new Map<string, Game[]>();
    games.forEach((g) => {
      const key = `${g.systemId}::${(g.cleanTitle || '').toLowerCase()}`;
      const list = seen.get(key) || [];
      list.push(g);
      seen.set(key, list);
    });
    return [...seen.values()].filter((list) => list.length > 1);
  }, [games]);

  // Poids disque total + par système (top 5)
  const totalSize = useMemo(() => games.reduce((acc, g) => acc + (g.size || 0), 0), [games]);
  const sizeBySystem = useMemo(() => {
    const map = new Map<string, number>();
    games.forEach((g) => map.set(g.systemId, (map.get(g.systemId) || 0) + (g.size || 0)));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [games]);

  const issuesCount =
    gamesWithoutBoxart.length + missingBios.length + duplicates.reduce((a, d) => a + d.length - 1, 0);

  // ── Dossier BIOS : ouvre public/bios/<système> (créé si absent) dans l'explorateur ──
  const openBiosFolder = typeof window !== 'undefined' && (window as any).api?.openBiosFolder
    ? (window as any).api.openBiosFolder.bind((window as any).api)
    : null;
  const [biosFolderOpening, setBiosFolderOpening] = useState(false);
  // Cible : le système du premier BIOS obligatoire manquant, sinon le premier de la liste
  const biosFolderSystemId = useMemo(() => {
    const firstRequired = missingBios.find((b) => !b.optional);
    return (firstRequired || missingBios[0])?.systemId || '';
  }, [missingBios]);
  const handleOpenBiosFolder = async () => {
    if (!openBiosFolder || !biosFolderSystemId) return;
    setBiosFolderOpening(true);
    try {
      await openBiosFolder(biosFolderSystemId);
    } finally {
      setTimeout(() => setBiosFolderOpening(false), 600);
    }
  };

  const cardCls = 'p-4 rounded-2xl bg-slate-950/60 border border-slate-800';
  const statNumber = 'text-2xl font-black';

  return (
    <div className="space-y-5 max-w-4xl">
      {/* En-tête santé globale */}
      <div className={`${cardCls} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl border ${issuesCount === 0 ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-amber-500/10 border-amber-500/40 text-amber-400'}`}>
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <span className="text-sm font-black text-white block">
              {issuesCount === 0 ? 'Collection en parfaite santé !' : `${issuesCount} point(s) à améliorer`}
            </span>
            <span className="text-[11px] text-slate-400">
              {games.length} jeux · {new Set(games.map((g) => g.systemId)).size} systèmes
            </span>
          </div>
        </div>
        {onCheckBios && (
          <div className="flex items-center gap-2">
            {onScrapeGameRaw && (
              <button
                type="button"
                onClick={handleBulkScrape}
                disabled={!!bulkState?.running || gamesWithoutBoxart.length === 0}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40"
                title={`Scraper automatiquement les ${gamesWithoutBoxart.length} jaquettes manquantes, l'une après l'autre`}
              >
                <Images className="w-3.5 h-3.5" />
                {bulkState?.running
                  ? `Scraper… ${bulkState.done}/${bulkState.total}`
                  : `Tout scraper (${gamesWithoutBoxart.length})`}
              </button>
            )}
            <button
              type="button"
              onClick={() => onCheckBios()}
              disabled={isCheckingBios}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-slate-200 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingBios ? 'animate-spin' : ''}`} />
              Revérifier les BIOS
            </button>
          </div>
        )}
      </div>

      {/* Progression du scraping en série */}
      {bulkState && (
        <div className={`${cardCls} flex items-center gap-3`}>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-300">
                {bulkState.running
                  ? `Scraping en série… ${bulkState.done}/${bulkState.total}`
                  : bulkState.done > 0
                  ? `Terminé : ${bulkState.done}/${bulkState.total}`
                  : 'Scraping annulé'}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {bulkState.ok} OK · {bulkState.fail} échec{bulkState.fail > 1 ? 's' : ''}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-cyan-400 transition-all duration-200"
                style={{ width: `${bulkState.total > 0 ? Math.round((bulkState.done / bulkState.total) * 100) : 0}%` }}
              />
            </div>
          </div>
          {bulkState.running && (
            <button
              type="button"
              onClick={stopBulkScrape}
              className="shrink-0 px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition flex items-center gap-1"
              title="Arrêter le scraping en cours (les jaquettes déjà récupérées sont conservées)"
            >
              <Square className="w-3 h-3 fill-current" />
              Stop
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Jaquettes manquantes */}
        <section className={cardCls}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ImageOff className="w-4 h-4 text-cyan-400" /> Jaquettes manquantes
            </h4>
            <span className={`${statNumber} ${gamesWithoutBoxart.length === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {gamesWithoutBoxart.length}
            </span>
          </div>
          {gamesWithoutBoxart.length === 0 ? (
            <p className="text-[11px] text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Toutes les ROMs ont une jaquette.
            </p>
          ) : (
            <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-0.5 pr-1">
              {gamesWithoutBoxart.slice(0, 20).map((g) => (
                <div key={g.id} className="text-[11px] text-slate-400 truncate flex items-center justify-between gap-2">
                  <span className="truncate">
                    • {g.cleanTitle || g.title} <span className="text-slate-600 font-mono">({g.systemId})</span>
                  </span>
                  {onScrapeGame && (
                    <button
                      type="button"
                      onClick={() => onScrapeGame(g)}
                      disabled={scrapingGameId === g.id}
                      className="shrink-0 px-1.5 py-0.5 rounded-md bg-cyan-500/15 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold transition flex items-center gap-1 disabled:opacity-50"
                      title={`Scraper la jaquette de ${g.cleanTitle}`}
                    >
                      <Image className={`w-3 h-3 ${scrapingGameId === g.id ? 'animate-pulse' : ''}`} />
                      {scrapingGameId === g.id ? '…' : 'Scraper'}
                    </button>
                  )}
                </div>
              ))}
              {gamesWithoutBoxart.length > 20 && (
                <div className="text-[10px] text-slate-500 italic">… et {gamesWithoutBoxart.length - 20} autres (utilise la recherche du catalogue)</div>
              )}
            </div>
          )}
        </section>

        {/* 2. BIOS manquants */}
        <section className={cardCls}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" /> BIOS manquants
            </h4>
            <span className={`${statNumber} ${missingBios.length === 0 ? 'text-emerald-400' : missingRequiredBios.length > 0 ? 'text-rose-400' : 'text-amber-400'}`}>
              {missingBios.length}
            </span>
          </div>
          {missingBios.length === 0 ? (
            <p className="text-[11px] text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Tous les BIOS requis sont présents.
            </p>
          ) : (
            <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-0.5 pr-1">
              {missingBios.slice(0, 12).map((b) => (
                <div key={`${b.systemId}-${b.filename}`} className="text-[11px] text-slate-400 truncate flex items-center gap-1.5">
                  <AlertTriangle className={`w-3 h-3 shrink-0 ${b.optional ? 'text-slate-600' : 'text-rose-400'}`} />
                  <span className="truncate">
                    {b.systemName} — {b.filename} {b.optional ? <span className="text-slate-600">(optionnel)</span> : ''}
                  </span>
                </div>
              ))}
              {openBiosFolder && missingBios.length > 0 && (
                <button
                  type="button"
                  onClick={handleOpenBiosFolder}
                  className="mt-1.5 w-full px-2 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-[11px] font-bold text-slate-200 transition flex items-center justify-center gap-1.5"
                  title={`Ouvre (ou crée) le dossier ${biosFolderSystemId} dans l'explorateur de fichiers`}
                >
                  <FolderOpen className={`w-3.5 h-3.5 text-amber-400 ${biosFolderOpening ? 'animate-pulse' : ''}`} />
                  Ouvrir le dossier {biosFolderSystemId}
                </button>
              )}
            </div>
          )}
          <p className="text-[10px] text-slate-500 mt-2">
            Dépose les fichiers dans {`public/bios/<système>/`} puis « Revérifier ».
          </p>
        </section>

        {/* 3. Doublons */}
        <section className={cardCls}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Copy className="w-4 h-4 text-pink-400" /> Doublons
            </h4>
            <span className={`${statNumber} ${duplicates.length === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {duplicates.reduce((a, d) => a + d.length - 1, 0)}
            </span>
          </div>
          {duplicates.length === 0 ? (
            <p className="text-[11px] text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Aucun doublon détecté.
            </p>
          ) : (
            <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
              {duplicates.slice(0, 8).map((group) => (
                <div key={group[0].id} className="text-[11px]">
                  <span className="text-slate-300 font-bold truncate block">{group[0].cleanTitle}</span>
                  <div className="space-y-0.5">
                    {group.map((g, idx) => (
                      <div key={g.id} className="flex items-center justify-between gap-2">
                        <span className="text-slate-500 font-mono text-[10px] truncate">
                          {idx === 0 ? '★ ' : ''}{g.filename}
                        </span>
                        {idx > 0 && onDeleteGame && (
                          <button
                            type="button"
                            onClick={() => onDeleteGame(g)}
                            className="shrink-0 p-1 rounded-md bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 transition"
                            title={`Supprimer le doublon ${g.filename} (le premier ★ est conservé)`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {duplicates.length > 0 && (
            <p className="text-[10px] text-slate-500 mt-2">Le ★ (premier de chaque groupe) est conservé — supprime les copies.</p>
          )}
        </section>

        {/* 4. Poids disque */}
        <section className={cardCls}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" /> Poids disque
            </h4>
            <span className={`${statNumber} text-slate-100`}>{formatBytes(totalSize)}</span>
          </div>
          <div className="space-y-1.5">
            {sizeBySystem.map(([systemId, size]) => {
              const pct = totalSize > 0 ? Math.round((size / totalSize) * 100) : 0;
              return (
                <div key={systemId} className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400 w-20 shrink-0 truncate">{systemId}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-slate-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500 w-16 text-right font-mono">{formatBytes(size)}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Top 5 des systèmes les plus gourmands.</p>
        </section>
      </div>
    </div>
  );
};
