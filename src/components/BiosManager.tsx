import React, { useState } from 'react';
import { BiosStatus } from '../types';
import { Cpu, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Folder, ShieldCheck } from 'lucide-react';

interface BiosManagerProps {
  biosStatuses: BiosStatus[];
  biosDir: string;
  onRefreshBios: () => void;
  isChecking: boolean;
  onOpenSettings: () => void;
}

export const BiosManager: React.FC<BiosManagerProps> = ({
  biosStatuses,
  biosDir,
  onRefreshBios,
  isChecking,
  onOpenSettings,
}) => {
  const [filterSystem, setFilterSystem] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'missing' | 'found'>('all');

  // Statistiques
  const total = biosStatuses.length;
  const found = biosStatuses.filter((b) => b.found).length;
  const missing = biosStatuses.filter((b) => !b.found).length;
  const md5Match = biosStatuses.filter((b) => b.found && b.md5Match).length;

  const filtered = biosStatuses.filter((b) => {
    if (filterSystem !== 'all' && b.systemId !== filterSystem) return false;
    if (filterStatus === 'missing' && b.found) return false;
    if (filterStatus === 'found' && !b.found) return false;
    return true;
  });

  const uniqueSystems = Array.from(new Set(biosStatuses.map((b) => b.systemName)));

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-retro-900/40 p-8 space-y-6">
      {/* En-tête et statistiques */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-retro-accent mb-1">
            <Cpu className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Firmwares & Emulateurs</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            Gestionnaire de BIOS & Firmwares
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
            <span>Dossier configuré :</span>
            <span className="font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              {biosDir || 'Non configuré'}
            </span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            <Folder className="w-4 h-4" />
            <span>Changer de dossier</span>
          </button>

          <button
            onClick={onRefreshBios}
            disabled={isChecking}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-retro-accent text-retro-900 font-bold text-xs shadow-neon hover:scale-105 active:scale-95 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Vérifier les BIOS</span>
          </button>
        </div>
      </div>

      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-retro-800/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Total répertorié</span>
          <span className="text-2xl font-black text-white mt-1 block">{total} firmwares</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-semibold block">Présents</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-emerald-300 mt-1 block">{found}</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-400 font-semibold block">Manquants</span>
            <XCircle className="w-5 h-5 text-rose-400" />
          </div>
          <span className="text-2xl font-black text-rose-300 mt-1 block">{missing}</span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-400 font-semibold block">MD5 Authentifié</span>
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-2xl font-black text-blue-300 mt-1 block">{md5Match}</span>
        </div>
      </div>

      {/* Filtres et Tableau */}
      <div className="flex-1 bg-retro-800/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-lg">
        {/* Barre de filtres */}
        <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between bg-retro-900/40 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-semibold">Système :</span>
            <select
              value={filterSystem}
              onChange={(e) => setFilterSystem(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
            >
              <option value="all">Tous les systèmes</option>
              {uniqueSystems.map((sys) => (
                <option key={sys} value={biosStatuses.find((b) => b.systemName === sys)?.systemId}>
                  {sys}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filterStatus === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tous ({total})
            </button>
            <button
              onClick={() => setFilterStatus('missing')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filterStatus === 'missing' ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Manquants ({missing})
            </button>
            <button
              onClick={() => setFilterStatus('found')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filterStatus === 'found' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Présents ({found})
            </button>
          </div>
        </div>

        {/* Tableau déroulant */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 sticky top-0 backdrop-blur z-10">
              <tr>
                <th className="py-3 px-6">Statut</th>
                <th className="py-3 px-4">Système</th>
                <th className="py-3 px-4">Fichier attendu</th>
                <th className="py-3 px-6">Description / Rôle</th>
                <th className="py-3 px-4">MD5 Officiel</th>
                <th className="py-3 px-4">Importance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-6">
                    {item.found ? (
                      item.md5Match ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Valide</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Présent</span>
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Manquant</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-bold text-slate-200">
                    {item.systemName}
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-retro-accent">
                    {item.filename}
                  </td>

                  <td className="py-3 px-6 text-slate-300">
                    {item.description}
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {item.expectedMd5 ? `${item.expectedMd5.substring(0, 12)}...` : 'N/A'}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.optional
                          ? 'bg-slate-700/60 text-slate-300'
                          : 'bg-retro-pink/20 text-retro-pink border border-retro-pink/30'
                      }`}
                    >
                      {item.optional ? 'Optionnel' : 'Requis'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
