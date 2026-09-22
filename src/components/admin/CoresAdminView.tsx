import React, { useState, useEffect } from 'react';
import { ExtensionInfo, ExtensionProgress } from '../../types';
import { Download, FolderPlus, CheckCircle2, RefreshCw, Zap, Search, AlertCircle } from 'lucide-react';

interface CoresAdminViewProps {
  onOpenExtensionsModal?: () => void;
  onCreateRomsFolders?: () => Promise<{ created: number; total: number }>;
}

export const CoresAdminView: React.FC<CoresAdminViewProps> = ({
  onOpenExtensionsModal,
  onCreateRomsFolders,
}) => {
  const [extensions, setExtensions] = useState<ExtensionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [installingAll, setInstallingAll] = useState(false);
  const [installingCore, setInstallingCore] = useState<string | null>(null);
  const [progress, setProgress] = useState<ExtensionProgress | null>(null);
  const [search, setSearch] = useState('');
  const [foldersMessage, setFoldersMessage] = useState<string | null>(null);

  const loadExtensions = async () => {
    setLoading(true);
    try {
      if (window.api?.listExtensions) {
        const list = await window.api.listExtensions();
        setExtensions(list);
      }
    } catch {
      // Mode démo ou hors electron
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExtensions();
  }, []);

  useEffect(() => {
    if (!window.api?.onExtensionProgress) return;
    const unsub = window.api.onExtensionProgress((data) => {
      setProgress(data);
      if (data.status === 'complete') {
        setInstallingAll(false);
        setInstallingCore(null);
        loadExtensions();
      }
    });
    return unsub;
  }, []);

  const handleInstallAll = async () => {
    if (!window.api?.installAllExtensions) return;
    setInstallingAll(true);
    try {
      await window.api.installAllExtensions();
      await loadExtensions();
    } finally {
      setInstallingAll(false);
    }
  };

  const handleInstallSingle = async (coreName: string) => {
    if (!window.api?.installExtension) return;
    setInstallingCore(coreName);
    try {
      await window.api.installExtension(coreName);
      await loadExtensions();
    } finally {
      setInstallingCore(null);
    }
  };

  const handleCreateFolders = async () => {
    if (onCreateRomsFolders) {
      try {
        const res = await onCreateRomsFolders();
        setFoldersMessage(`${res.created} dossier(s) de ROMs créés avec succès !`);
        setTimeout(() => setFoldersMessage(null), 3000);
      } catch (err: any) {
        setFoldersMessage(`Erreur : ${err.message}`);
      }
    }
  };

  const filtered = extensions.filter((ext) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      ext.name.toLowerCase().includes(q) ||
      ext.coreName.toLowerCase().includes(q) ||
      ext.systemName.toLowerCase().includes(q)
    );
  });

  const installedCount = extensions.filter((e) => e.isInstalled).length;

  return (
    <div className="space-y-4 max-w-5xl">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Gestionnaire des Cœurs Libretro & Extensions</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Moteurs d'Exécution
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Téléchargez et mettez à jour les émulateurs officiels compilés (Snes9x, Genesis Plus GX, PCSX, Stella...)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenExtensionsModal && (
            <button
              type="button"
              onClick={onOpenExtensionsModal}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 font-bold flex items-center space-x-1.5 transition"
              title="Ouvrir l'assistant d'installation d'extensions en plein écran"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Assistant Dédié</span>
            </button>
          )}

          {onCreateRomsFolders && (
            <button
              type="button"
              onClick={handleCreateFolders}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 font-bold flex items-center space-x-1.5 transition"
            >
              <FolderPlus className="w-4 h-4 text-cyan-400" />
              <span>Créer les Dossiers ROMs</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleInstallAll}
            disabled={installingAll || loading}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/25 flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${installingAll ? 'animate-bounce' : ''}`} />
            <span>{installingAll ? 'Installation...' : 'Installer Tout en 1 Clic'}</span>
          </button>
        </div>
      </div>

      {foldersMessage && (
        <div className="p-3 bg-cyan-950/80 border border-cyan-500/40 rounded-xl text-xs text-cyan-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{foldersMessage}</span>
        </div>
      )}

      {/* Barre de progression si installation en cours */}
      {progress && (installingAll || installingCore) && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-white flex items-center space-x-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>{progress.currentItem}</span>
            </span>
            <span className="font-mono text-emerald-400 font-bold">{Math.round(progress.percent)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-150"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 block">{progress.message}</span>
        </div>
      )}

      {/* Barre de recherche et statistiques */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer les cœurs (Snes9x, PCSX, Genesis...)"
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div className="text-xs text-slate-400 font-semibold flex items-center space-x-2">
          <span>Installés :</span>
          <span className="font-mono text-emerald-400 font-bold">
            {installedCount} / {extensions.length}
          </span>
        </div>
      </div>

      {/* Grille des cœurs */}
      {extensions.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
          <h4 className="text-sm font-bold text-white">Liste des cœurs indisponible en mode démo web</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Lancez RetroMad via Electron pour télécharger et installer automatiquement les cœurs d'émulation dans votre dossier local.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((ext) => {
            const isBusy = installingCore === ext.coreName || installingAll;
            return (
              <div
                key={ext.id}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{ext.name}</h4>
                    <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                      {ext.coreName}
                    </span>
                    <span className="text-[10px] text-emerald-400/80 font-semibold block mt-1">
                      {ext.systemName}
                    </span>
                  </div>

                  {ext.isInstalled ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Installé</span>
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      Non installé
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                  <span className="truncate max-w-[120px] font-mono">
                    {ext.extensions?.slice(0, 3).join(', ')}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleInstallSingle(ext.coreName)}
                    disabled={isBusy}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold transition flex items-center space-x-1 disabled:opacity-50"
                  >
                    <Download className={`w-3 h-3 ${isBusy ? 'animate-spin' : ''}`} />
                    <span>{ext.isInstalled ? 'Réinstaller' : 'Télécharger'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
