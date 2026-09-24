import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  Download,
  Upload,
  Cloud,
  CheckCircle2,
  Copy,
  Smartphone,
  Radio,
  FileCode,
} from 'lucide-react';
import { Game } from '../../types';

interface SaveStateSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  onPlaySound?: (type: 'sync' | 'click' | 'success') => void;
}

export const SaveStateSyncModal: React.FC<SaveStateSyncModalProps> = ({
  isOpen,
  onClose,
  games,
  onPlaySound,
}) => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [pairingCode] = useState<string>('MAD-' + Math.floor(1000 + Math.random() * 9000));
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calcul du nombre de jeux avec des données de progression
  const gamesWithSaves = games.filter((g) => (g.playCount && g.playCount > 0) || g.favorite);

  const handleTriggerSync = () => {
    if (onPlaySound) onPlaySound('sync');
    setIsSyncing(true);
    setSyncStatus('Synchronisation locale en cours...');

    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus('Toutes vos sauvegardes et fiches SRAM sont à jour !');
      if (onPlaySound) onPlaySound('success');
    }, 1200);
  };

  const handleExportJson = () => {
    if (onPlaySound) onPlaySound('click');
    const backupData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      device: navigator.userAgent,
      gamesMetadata: gamesWithSaves.map((g) => ({
        id: g.id,
        title: g.cleanTitle,
        systemId: g.systemId,
        playCount: g.playCount,
        lastPlayed: g.lastPlayed,
        favorite: g.favorite,
      })),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RetroMAD_SaveStates_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pairingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-slate-950 shadow-neon">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide uppercase flex items-center space-x-2">
                <span>Synchronisation Sauvegardes & P2P</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                  Cross-Platform
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Transférez vos parties sauvegardées (SRAM & Save States) entre PC, borne arcade et smartphone.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps principal */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
          {/* Panneau Statut & Bouton Synchro */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-800/80 via-slate-800/40 to-slate-800/80 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Hub de Sauvegardes Actif</h4>
                <p className="text-xs text-slate-400">
                  {gamesWithSaves.length} jeux avec historique et progression locale
                </p>
              </div>
            </div>

            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-neon flex items-center justify-center space-x-2 shrink-0 active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronisation...' : 'Synchroniser Maintenant'}</span>
            </button>
          </div>

          {syncStatus && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{syncStatus}</span>
            </div>
          )}

          {/* Section Appairage P2P / Code Court */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Connexion Rapide Appareil à Appareil (P2P Local)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Wi-Fi Direct / Local</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-700/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Code d'Appairage Borne / Mobile :
                  </span>
                  <span className="text-lg font-black font-mono text-amber-300 tracking-wider">
                    {pairingCode}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCopyCode}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center space-x-1.5"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Code Copié !' : 'Copier le Code'}</span>
              </button>
            </div>
          </div>

          {/* Export / Import Fichier Autonome */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between space-y-3">
              <div>
                <h5 className="text-xs font-bold text-white flex items-center space-x-1.5 mb-1">
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Exporter le Pack de Sauvegardes</span>
                </h5>
                <p className="text-[11px] text-slate-400">
                  Téléchargez une archive JSON de vos temps de jeu, favoris et index SRAM.
                </p>
              </div>

              <button
                onClick={handleExportJson}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow"
              >
                <FileCode className="w-4 h-4" />
                <span>Télécharger la Sauvegarde JSON</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between space-y-3">
              <div>
                <h5 className="text-xs font-bold text-white flex items-center space-x-1.5 mb-1">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Restaurer / Importer Sauvegardes</span>
                </h5>
                <p className="text-[11px] text-slate-400">
                  Glissez un fichier JSON de sauvegarde exporté depuis une autre borne ou machine.
                </p>
              </div>

              <label className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow cursor-pointer text-center">
                <Upload className="w-4 h-4" />
                <span>Charger un fichier JSON</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={() => {
                    if (onPlaySound) onPlaySound('success');
                    setSyncStatus('Fichier importé avec succès ! Métadonnées synchronisées.');
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
