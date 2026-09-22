import React, { useState } from 'react';
import { BiosStatus, System } from '../../types';
import { Cpu, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Folder, Search } from 'lucide-react';

interface BiosAdminViewProps {
  biosStatuses: BiosStatus[];
  systems: System[];
  biosDir: string;
  isChecking: boolean;
  onRefreshBios?: () => Promise<void>;
  onPickBiosDir?: () => void;
}

export const BiosAdminView: React.FC<BiosAdminViewProps> = ({
  biosStatuses,
  systems,
  biosDir,
  isChecking,
  onRefreshBios,
  onPickBiosDir,
}) => {
  const [search, setSearch] = useState('');
  const [filterSystem, setFilterSystem] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'missing' | 'found'>('all');

  // Si biosStatuses n'est pas encore peuplé, générer une vue depuis systems.biosList
  const allRequirements = React.useMemo(() => {
    if (biosStatuses && biosStatuses.length > 0) {
      return biosStatuses;
    }
    // Fallback dynamique
    const generated: BiosStatus[] = [];
    systems.forEach((sys) => {
      (sys.biosList || []).forEach((b) => {
        generated.push({
          systemId: sys.id,
          systemName: sys.name,
          filename: b.filename,
          description: b.description,
          expectedMd5: b.md5,
          found: false,
          optional: !!b.optional,
        });
      });
    });
    return generated;
  }, [biosStatuses, systems]);

  const total = allRequirements.length;
  const found = allRequirements.filter((b) => b.found).length;
  const missing = allRequirements.filter((b) => !b.found).length;
  const md5Match = allRequirements.filter((b) => b.found && b.md5Match).length;

  const filtered = allRequirements.filter((b) => {
    if (filterSystem !== 'all' && b.systemId !== filterSystem) return false;
    if (filterStatus === 'missing' && b.found) return false;
    if (filterStatus === 'found' && !b.found) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        b.filename.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.systemName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 max-w-5xl">
      {/* En-tête avec statistiques */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Gestionnaire & Intégrité des BIOS</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Firmwares Matériels
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Dossier cible : <code className="text-slate-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{biosDir || 'Non configuré'}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onPickBiosDir && (
            <button
              type="button"
              onClick={onPickBiosDir}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center space-x-1.5 transition"
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Changer Dossier</span>
            </button>
          )}

          {onRefreshBios && (
            <button
              type="button"
              onClick={onRefreshBios}
              disabled={isChecking}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Analyse...' : 'Vérifier l\'Intégrité MD5'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Cartes métriques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 block">Total BIOS Requis</span>
          <span className="text-lg font-black text-white mt-0.5 block">{total}</span>
        </div>
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <span className="text-[11px] font-semibold text-emerald-400 block">Présents & Prêts</span>
          <span className="text-lg font-black text-emerald-300 mt-0.5 block">{found}</span>
        </div>
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
          <span className="text-[11px] font-semibold text-rose-400 block">Manquants</span>
          <span className="text-lg font-black text-rose-300 mt-0.5 block">{missing}</span>
        </div>
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
          <span className="text-[11px] font-semibold text-cyan-400 block">MD5 Authentifiés</span>
          <span className="text-lg font-black text-cyan-300 mt-0.5 block">{md5Match}</span>
        </div>
      </div>

      {/* Filtres de recherche */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom (scph1001.bin...)"
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
            />
          </div>

          <select
            value={filterSystem}
            onChange={(e) => setFilterSystem(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-400"
          >
            <option value="all">Toutes les consoles</option>
            {systems.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-400"
          >
            <option value="all">Tous les statuts</option>
            <option value="missing">Manquants uniquement</option>
            <option value="found">Présents uniquement</option>
          </select>
        </div>
      </div>

      {/* Tableau des BIOS */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
        <div className="max-h-[50vh] overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-800">
              <tr>
                <th className="p-3 w-10 text-center">État</th>
                <th className="p-3">Fichier BIOS</th>
                <th className="p-3">Console Associée</th>
                <th className="p-3 hidden md:table-cell">Rôle & Description</th>
                <th className="p-3 hidden lg:table-cell font-mono">MD5 Attendu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Aucun BIOS ne correspond aux critères de filtre.
                  </td>
                </tr>
              ) : (
                filtered.map((b, idx) => (
                  <tr key={b.filename + idx} className="hover:bg-slate-800/30 transition">
                    <td className="p-3 text-center">
                      {b.found ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : b.optional ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 mx-auto" />
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-white">
                      <span>{b.filename}</span>
                      {b.optional && (
                        <span className="ml-2 text-[9px] font-sans px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Optionnel
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-300">
                      <span className="font-semibold">{b.systemName}</span>
                    </td>
                    <td className="p-3 hidden md:table-cell text-slate-400">
                      {b.description}
                    </td>
                    <td className="p-3 hidden lg:table-cell font-mono text-[11px] text-slate-500 truncate max-w-xs">
                      {b.expectedMd5 || 'Non spécifié'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
