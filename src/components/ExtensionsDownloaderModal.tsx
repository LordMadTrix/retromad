import React, { useState, useEffect } from 'react';
import { ExtensionInfo, ExtensionProgress } from '../types';
import { ConsoleLogo } from './ConsoleLogo';
import {
  Download,
  FolderPlus,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Search,
  RefreshCw,
  X,
  Zap,
  Check,
  Info,
} from 'lucide-react';

interface ExtensionsDownloaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRomsFoldersCreated?: () => void;
}

export const ExtensionsDownloaderModal: React.FC<ExtensionsDownloaderModalProps> = ({
  isOpen,
  onClose,
  onRomsFoldersCreated,
}) => {
  const [extensions, setExtensions] = useState<ExtensionInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInstallingAll, setIsInstallingAll] = useState<boolean>(false);
  const [installingCore, setInstallingCore] = useState<string | null>(null);
  const [progress, setProgress] = useState<ExtensionProgress | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'installed' | 'missing'>('all');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Charger la liste des extensions
  const loadExtensions = async () => {
    setIsLoading(true);
    try {
      if (window.api?.listExtensions) {
        const list = await window.api.listExtensions();
        setExtensions(list);
      }
    } catch (err) {
      console.error('Erreur chargement extensions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadExtensions();
      setStatusMessage(null);
    }
  }, [isOpen]);

  // Écouter les événements de progression IPC
  useEffect(() => {
    if (!isOpen || !window.api?.onExtensionProgress) return;

    const cleanup = window.api.onExtensionProgress((data: ExtensionProgress) => {
      setProgress(data);
      if (data.status === 'complete') {
        setIsInstallingAll(false);
        setInstallingCore(null);
        setStatusMessage({ type: 'success', text: data.message });
        loadExtensions();
      } else if (data.status === 'error') {
        setStatusMessage({ type: 'error', text: data.message });
      }
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [isOpen]);

  // Tout télécharger et installer en 1 clic
  const handleInstallAll = async () => {
    if (isInstallingAll) return;
    setIsInstallingAll(true);
    setStatusMessage(null);
    setProgress({
      total: extensions.length,
      current: 0,
      currentItem: 'Initialisation...',
      percent: 0,
      status: 'downloading',
      message: 'Démarrage du téléchargement et de l\'installation des cœurs...',
    });

    try {
      const result = await window.api.installAllExtensions();
      setStatusMessage({
        type: result.failed === 0 ? 'success' : 'info',
        text: `Installation terminée ! ${result.success} extensions installées avec succès (${result.failed} échecs / non disponibles).`,
      });
      await loadExtensions();
    } catch (err: any) {
      console.error('Erreur installation globale:', err);
      setStatusMessage({
        type: 'error',
        text: `Erreur lors de l'installation : ${err?.message || 'Erreur inconnue'}`,
      });
    } finally {
      setIsInstallingAll(false);
    }
  };

  // Installer une extension individuelle
  const handleInstallSingle = async (coreName: string) => {
    if (installingCore || isInstallingAll) return;
    setInstallingCore(coreName);
    setStatusMessage(null);

    try {
      const ok = await window.api.installExtension(coreName);
      if (ok) {
        setStatusMessage({
          type: 'success',
          text: `Le cœur "${coreName}" a été installé avec succès !`,
        });
        await loadExtensions();
      } else {
        setStatusMessage({
          type: 'error',
          text: `Échec du téléchargement ou de l'extraction pour "${coreName}".`,
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Erreur : ${err?.message || 'Inconnue'}`,
      });
    } finally {
      setInstallingCore(null);
    }
  };

  // Créer l'arborescence des dossiers de ROMs
  const handleCreateFolders = async () => {
    try {
      const res = await window.api.createRomsFolders();
      setStatusMessage({
        type: 'success',
        text: `${res.created} nouveaux dossiers de ROMs créés (${res.total} consoles configurées au total avec fichiers descriptifs).`,
      });
      if (onRomsFoldersCreated) {
        onRomsFoldersCreated();
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Erreur création dossiers : ${err?.message || 'Inconnue'}`,
      });
    }
  };

  if (!isOpen) return null;

  const installedCount = extensions.filter((e) => e.isInstalled).length;
  const missingCount = extensions.length - installedCount;

  // Filtrer les extensions
  const filteredExtensions = extensions.filter((ext) => {
    const matchesSearch =
      ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.systemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.coreName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.extensions.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filter === 'installed') return ext.isInstalled;
    if (filter === 'missing') return !ext.isInstalled;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-retro-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* EN-TÊTE */}
        <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-retro-800/80 via-retro-900 to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-retro-purple flex items-center justify-center text-white shadow-neon">
              <Download className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white tracking-wide">
                  EXTENSIONS & CŒURS RETROMAD
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold uppercase">
                  Libretro Official
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Téléchargement direct en 1 clic des moteurs d'émulation et initialisation des dossiers de ROMs.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isInstallingAll}
            className={`p-2 rounded-full transition ${
              isInstallingAll
                ? 'opacity-40 cursor-not-allowed text-slate-600'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BANDEAU ACTIONS RAPIDES & STATISTIQUES */}
        <div className="p-6 bg-slate-950/60 border-b border-slate-800/60 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Compteur d'état */}
            <div className="flex items-center space-x-4">
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl px-4 py-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Cœurs Libretro
                </span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-xl font-black text-white">{installedCount}</span>
                  <span className="text-xs text-slate-400">/ {extensions.length} installés</span>
                </div>
              </div>

              {missingCount > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-3.5 py-2.5 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-semibold text-amber-300">
                    {missingCount} extension{missingCount > 1 ? 's' : ''} manquante{missingCount > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Boutons d'action majeurs */}
            <div className="flex items-center space-x-3">
              {/* Bouton 1 : Générer dossiers de ROMs */}
              <button
                onClick={handleCreateFolders}
                disabled={isInstallingAll}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-2 shadow hover:border-slate-600 active:scale-95 disabled:opacity-50"
                title="Crée tous les sous-dossiers de consoles avec des fichiers explicatifs des extensions acceptées"
              >
                <FolderPlus className="w-4 h-4 text-blue-400" />
                <span>Créer les 28 Dossiers ROMs</span>
              </button>

              {/* Bouton 2 : TOUT TÉLÉCHARGER ET INSTALLER (1 CLIC) */}
              <button
                onClick={handleInstallAll}
                disabled={isInstallingAll}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center space-x-2 shadow-neon ${
                  isInstallingAll
                    ? 'bg-slate-800 text-slate-500 cursor-wait'
                    : 'bg-gradient-to-r from-retro-accent via-cyan-400 to-blue-500 text-slate-950 hover:brightness-110 active:scale-95 hover:shadow-neon-pink'
                }`}
              >
                {isInstallingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    <span>Installation en cours...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current text-slate-950" />
                    <span>Tout Télécharger & Installer (1 Clic)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* BARRE DE PROGRESSION EN DIRECT */}
          {progress && (isInstallingAll || progress.percent < 100) && (
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span className="font-bold text-white truncate max-w-md">
                    {progress.currentItem}
                  </span>
                </div>
                <span className="font-mono text-cyan-400 font-bold">
                  {progress.current} / {progress.total} ({progress.percent}%)
                </span>
              </div>

              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                <div
                  className="h-full bg-gradient-to-r from-retro-accent via-cyan-400 to-retro-purple rounded-full transition-all duration-300"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 truncate">{progress.message}</p>
            </div>
          )}

          {/* Message de statut */}
          {statusMessage && (
            <div
              className={`rounded-2xl p-3.5 border flex items-center space-x-3 text-xs font-semibold ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : statusMessage.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              ) : (
                <Info className="w-4 h-4 shrink-0 text-blue-400" />
              )}
              <span className="flex-1">{statusMessage.text}</span>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* BARRE DE RECHERCHE ET FILTRES */}
        <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          {/* Champ de recherche */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une console, un cœur, une extension..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Onglets de filtre */}
          <div className="flex items-center space-x-1.5 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filter === 'all'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Toutes ({extensions.length})
            </button>
            <button
              onClick={() => setFilter('installed')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filter === 'installed'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Installées ({installedCount})
            </button>
            <button
              onClick={() => setFilter('missing')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filter === 'missing'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              À installer ({missingCount})
            </button>
          </div>

          <button
            onClick={loadExtensions}
            disabled={isLoading || isInstallingAll}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Rafraîchir la liste"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {/* LISTE DES EXTENSIONS / CŒURS */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
              <p className="text-xs font-medium">Détection des extensions installées...</p>
            </div>
          ) : filteredExtensions.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              Aucune extension ne correspond à votre filtre.
            </div>
          ) : (
            filteredExtensions.map((ext) => {
              const isCurrent = installingCore === ext.coreName;

              return (
                <div
                  key={ext.id}
                  className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-4 ${
                    ext.isInstalled
                      ? 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Logo et infos console */}
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="w-20 h-10 flex items-center justify-center shrink-0 bg-slate-950/40 rounded-xl p-1 border border-slate-800/80">
                      <ConsoleLogo systemId={ext.id} size="sm" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-white truncate">
                          {ext.systemName}
                        </span>
                        <code className="text-[10px] font-mono bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded border border-slate-700">
                          {ext.coreName}
                        </code>
                      </div>

                      {/* Extensions acceptées */}
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        {ext.extensions.slice(0, 5).map((e) => (
                          <span
                            key={e}
                            className="text-[9px] font-mono text-slate-400 bg-slate-950/60 px-1 rounded border border-slate-800"
                          >
                            {e}
                          </span>
                        ))}
                        {ext.extensions.length > 5 && (
                          <span className="text-[9px] text-slate-500">
                            +{ext.extensions.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Statut & Action */}
                  <div className="flex items-center space-x-3 shrink-0">
                    {ext.isInstalled ? (
                      <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                        <Check className="w-3.5 h-3.5" />
                        <span>Installé</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-xs font-medium">
                        <span>Non installé</span>
                      </div>
                    )}

                    <button
                      onClick={() => handleInstallSingle(ext.coreName)}
                      disabled={isInstallingAll || isCurrent}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                        ext.isInstalled
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          : 'bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 hover:text-white shadow-sm'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                      title={ext.isInstalled ? 'Réinstaller le cœur' : 'Télécharger et installer ce cœur'}
                    >
                      {isCurrent ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                          <span>Installation...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>{ext.isInstalled ? 'Réinstaller' : 'Installer'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PIED DE PAGE INFORMATIF */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-[11px]">
              Cœurs officiels téléchargés depuis le buildbot Libretro (<code className="text-slate-300">buildbot.libretro.com</code>).
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
