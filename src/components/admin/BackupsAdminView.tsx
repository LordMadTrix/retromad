import React, { useState, useRef } from 'react';
import { Game, System, Company, EmulatorProfile, AppSettings } from '../../types';
import { Download, Upload, RotateCcw, FileSpreadsheet, Check, AlertCircle, ShieldAlert, Archive } from 'lucide-react';

interface BackupsAdminViewProps {
  games: Game[];
  systems: System[];
  companies: Company[];
  emulators: EmulatorProfile[];
  settings: AppSettings;
  onSaveGames: (games: Game[]) => void;
  onSaveSystems: (systems: System[]) => void;
  onSaveCompanies: (companies: Company[]) => void;
  onSaveEmulators: (emulators: EmulatorProfile[]) => void;
  onSaveSettings: (settings: Partial<AppSettings>) => void;
  onResetDefaults?: () => void;
}

export const BackupsAdminView: React.FC<BackupsAdminViewProps> = ({
  games,
  systems,
  companies,
  emulators,
  settings,
  onSaveGames,
  onSaveSystems,
  onSaveCompanies,
  onSaveEmulators,
  onSaveSettings,
  onResetDefaults,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Exporter la base complète au format JSON
  const handleExportFullBackup = () => {
    const backupData = {
      meta: {
        app: 'RetroMad',
        version: '1.0.0',
        exportDate: new Date().toISOString(),
      },
      settings,
      companies,
      systems,
      emulators,
      games,
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `retromad-backup-${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setRestoreMessage({
      type: 'success',
      text: `Sauvegarde complète exportée (${games.length} jeux, ${systems.length} consoles, ${companies.length} firmes).`,
    });
    setTimeout(() => setRestoreMessage(null), 4000);
  };

  // Exporter le catalogue des jeux au format CSV
  const handleExportGamesCsv = () => {
    const headers = ['ID', 'Titre', 'Console', 'Développeur', 'Éditeur', 'Année', 'Note', 'Temps de jeu (min)', 'Favori', 'Chemin'];
    const rows = games.map((g) => {
      const sys = systems.find((s) => s.id === g.systemId)?.shortName || g.systemId;
      return [
        `"${g.id}"`,
        `"${(g.cleanTitle || g.title).replace(/"/g, '""')}"`,
        `"${sys}"`,
        `"${(g.metadata?.developer || '').replace(/"/g, '""')}"`,
        `"${(g.metadata?.publisher || '').replace(/"/g, '""')}"`,
        `"${g.metadata?.releaseDate || ''}"`,
        `"${g.metadata?.rating || ''}"`,
        `"${g.playTimeMinutes || 0}"`,
        `"${g.favorite ? 'Oui' : 'Non'}"`,
        `"${(g.path || '').replace(/"/g, '""')}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `retromad-games-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setRestoreMessage({
      type: 'success',
      text: `Catalogue de ${games.length} jeux exporté en fichier CSV Excel.`,
    });
    setTimeout(() => setRestoreMessage(null), 4000);
  };

  // Importer un fichier JSON de sauvegarde
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        let restoredCount = 0;

        if (parsed.games && Array.isArray(parsed.games)) {
          onSaveGames(parsed.games);
          restoredCount += parsed.games.length;
        }
        if (parsed.systems && Array.isArray(parsed.systems)) {
          onSaveSystems(parsed.systems);
        }
        if (parsed.companies && Array.isArray(parsed.companies)) {
          onSaveCompanies(parsed.companies);
        }
        if (parsed.emulators && Array.isArray(parsed.emulators)) {
          onSaveEmulators(parsed.emulators);
        }
        if (parsed.settings && typeof parsed.settings === 'object') {
          onSaveSettings(parsed.settings);
        }

        setRestoreMessage({
          type: 'success',
          text: `Restauration réussie ! ${restoredCount} jeux et données rechargés avec succès.`,
        });
      } catch (err: any) {
        setRestoreMessage({
          type: 'error',
          text: `Erreur de lecture du fichier de sauvegarde : ${err.message}`,
        });
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Notifications */}
      {restoreMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2 animate-in fade-in duration-150 ${
            restoreMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
          }`}
        >
          {restoreMessage.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{restoreMessage.text}</span>
        </div>
      )}

      {/* Carte Sauvegarde & Restauration */}
      <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Sauvegarde & Restauration Intégrale</h3>
            <p className="text-xs text-slate-400">
              Exportez ou restaurez l'intégralité de vos consoles, firmes, jaquettes, jeux et paramètres en un seul fichier.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Exporter JSON */}
          <button
            type="button"
            onClick={handleExportFullBackup}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/80 transition flex flex-col justify-between text-left group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition">
                Exporter la Base Complète (JSON)
              </span>
              <Download className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Génère une archive JSON horodatée avec tous les jeux, jaquettes, consoles personnalisées et profils.
            </p>
          </button>

          {/* Importer JSON */}
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
              id="admin-restore-file-input"
            />
            <label
              htmlFor="admin-restore-file-input"
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/80 transition flex flex-col justify-between text-left group space-y-2 cursor-pointer h-full"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition">
                  Restaurer depuis un Fichier JSON
                </span>
                <Upload className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Recharge une sauvegarde précédente pour rétablir votre bibliothèque et réglages.
              </p>
            </label>
          </div>
        </div>

        {/* Exporter CSV */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-300 block">Export Tableur / CSV</span>
            <span className="text-[11px] text-slate-500">
              Pour consultation, inventaire ou tri dans Excel / LibreOffice Calc.
            </span>
          </div>
          <button
            type="button"
            onClick={handleExportGamesCsv}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 font-semibold flex items-center space-x-1.5 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* Rétablir configuration d'origine */}
      <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
        <div className="flex items-center space-x-3 text-rose-400">
          <ShieldAlert className="w-6 h-6 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-white">Rétablissement de la Configuration d'Origine</h4>
            <p className="text-xs text-rose-300/80">
              Réinitialise toutes les consoles d'usine, les firmes et les réglages de RetroMad.
            </p>
          </div>
        </div>

        {confirmReset ? (
          <div className="p-3 bg-black/80 rounded-xl border border-rose-500/60 flex items-center justify-between gap-3">
            <span className="text-xs text-rose-300 font-bold">
              Êtes-vous certain de vouloir réinitialiser l'ensemble des réglages ?
            </span>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (onResetDefaults) onResetDefaults();
                  setConfirmReset(false);
                  setRestoreMessage({ type: 'success', text: 'Configurations d\'origine rétablies.' });
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
              >
                Oui, Rétablir
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs transition"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="px-4 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 text-xs font-bold transition flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurer les Données d'Origine</span>
          </button>
        )}
      </div>
    </div>
  );
};
