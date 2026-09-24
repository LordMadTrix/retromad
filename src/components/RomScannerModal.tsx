import React, { useState, useRef } from 'react';
import {
  X,
  FolderSearch,
  FolderOpen,
  Upload,
  HardDrive,
  CheckCircle2,
  FileCheck,
  RefreshCw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Game, System } from '../types';
import {
  getFilesFromDirectoryHandle,
  scanFilesList,
  scanPublicRomsManifest,
} from '../services/romScanner';
import {
  getDeletedRegistry,
  clearDeletedRegistry,
} from '../services/romStorage';

interface RomScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  systems: System[];
  selectedSystemId: string | null;
  onGamesAdded: (newGames: Game[]) => void;
  onPlaySound?: (type: 'coin' | 'select' | 'powerup') => void;
}

export const RomScannerModal: React.FC<RomScannerModalProps> = ({
  isOpen,
  onClose,
  games,
  systems: _systems,
  selectedSystemId,
  onGamesAdded,
  onPlaySound,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>('');
  const [progress, setProgress] = useState<{ current: number; total: number; filename: string }>({
    current: 0,
    total: 0,
    filename: '',
  });
  const [scanResult, setScanResult] = useState<{
    added: Game[];
    skippedDeleted: number;
    skippedExisting: number;
    totalScanned: number;
  } | null>(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const [showTrashConfirm, setShowTrashConfirm] = useState(false);
  const [trashResetFeedback, setTrashResetFeedback] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const deletedRegistry = getDeletedRegistry();
  const deletedCount = deletedRegistry.ids.size + deletedRegistry.filenames.size;

  const handleFinishScan = (
    scannedGames: Game[],
    skippedDeleted: number,
    totalScanned: number
  ) => {
    // Éviter les doublons avec les jeux déjà présents dans la bibliothèque
    const existingIds = new Set(games.map((g) => g.id));
    const existingNames = new Set(games.map((g) => g.filename.toLowerCase()));

    const trulyNew = scannedGames.filter(
      (g) => !existingIds.has(g.id) && !existingNames.has(g.filename.toLowerCase())
    );
    const skippedExisting = scannedGames.length - trulyNew.length;

    if (trulyNew.length > 0) {
      onGamesAdded(trulyNew);
      if (onPlaySound) onPlaySound('powerup');
    } else {
      if (onPlaySound) onPlaySound('select');
    }

    setScanResult({
      added: trulyNew,
      skippedDeleted,
      skippedExisting,
      totalScanned,
    });
    setIsScanning(false);
  };

  // 1. Scan Dossier Local via showDirectoryPicker ou input folder
  const handleScanLocalFolder = async () => {
    setIsScanning(true);
    setScanResult(null);
    setCurrentAction('Scan du dossier local...');
    setProgress({ current: 0, total: 0, filename: 'Ouverture du sélecteur de dossier...' });

    // Option A: API moderne showDirectoryPicker() (Chromium/Chrome/Edge)
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker({
          mode: 'read',
        });

        setCurrentAction(`Exploration du dossier "${dirHandle.name}"...`);
        const fileEntries = await getFilesFromDirectoryHandle(
          dirHandle,
          dirHandle.name,
          (scanned, currentName) => {
            setProgress({ current: scanned, total: scanned, filename: currentName });
          }
        );

        setCurrentAction('Analyse et identification des ROMs...');
        const { added, skippedDeleted, totalScanned } = await scanFilesList(
          fileEntries,
          selectedSystemId || undefined,
          (scanned, total, currentName) => {
            setProgress({ current: scanned, total, filename: currentName });
          }
        );

        handleFinishScan(added, skippedDeleted, totalScanned);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          setIsScanning(false);
          return;
        }
        console.warn('showDirectoryPicker fallback vers input:', err);
      }
    }

    // Option B: Fallback vers <input webkitdirectory />
    if (folderInputRef.current) {
      folderInputRef.current.click();
    } else {
      setIsScanning(false);
    }
  };

  // Gestion du retour du dossier via <input webkitdirectory />
  const handleFolderInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) {
      setIsScanning(false);
      return;
    }

    setIsScanning(true);
    setCurrentAction(`Analyse de ${fileList.length} fichiers...`);

    const fileEntries: { file: File; fullPath: string }[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      fileEntries.push({ file: f, fullPath: (f as any).webkitRelativePath || f.name });
    }

    const { added, skippedDeleted, totalScanned } = await scanFilesList(
      fileEntries,
      selectedSystemId || undefined,
      (scanned, total, currentName) => {
        setProgress({ current: scanned, total, filename: currentName });
      }
    );

    handleFinishScan(added, skippedDeleted, totalScanned);
    e.target.value = '';
  };

  // 2. Sélection de fichiers ROMs individuels
  const handleSelectFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsScanning(true);
    setScanResult(null);
    setCurrentAction(`Importation de ${fileList.length} ROM(s)...`);

    const fileEntries: { file: File; fullPath: string }[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      fileEntries.push({ file: f, fullPath: f.name });
    }

    const { added, skippedDeleted, totalScanned } = await scanFilesList(
      fileEntries,
      selectedSystemId || undefined,
      (scanned, total, currentName) => {
        setProgress({ current: scanned, total, filename: currentName });
      }
    );

    handleFinishScan(added, skippedDeleted, totalScanned);
    e.target.value = '';
  };

  // 3. Glisser-Déposer de ROMs ou Dossiers
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const items = e.dataTransfer.items;
    const files = e.dataTransfer.files;

    if (!files || files.length === 0) return;

    setIsScanning(true);
    setScanResult(null);
    setCurrentAction(`Importation des fichiers déposés...`);

    const fileEntries: { file: File; fullPath: string }[] = [];

    // Support des répertoires déposés via webkitGetAsEntry si possible
    if (items && items.length > 0 && typeof (items[0] as any).webkitGetAsEntry === 'function') {
      const readEntry = async (entry: any, path = ''): Promise<void> => {
        if (entry.isFile) {
          await new Promise<void>((resolve) => {
            entry.file((file: File) => {
              fileEntries.push({ file, fullPath: `${path}/${file.name}` });
              resolve();
            });
          });
        } else if (entry.isDirectory) {
          const dirReader = entry.createReader();
          const readAllEntries = async () => {
            const entries: any[] = await new Promise((resolve) => dirReader.readEntries(resolve));
            if (entries.length > 0) {
              for (const child of entries) {
                await readEntry(child, `${path}/${entry.name}`);
              }
              await readAllEntries();
            }
          };
          await readAllEntries();
        }
      };

      for (let i = 0; i < items.length; i++) {
        const entry = (items[i] as any).webkitGetAsEntry();
        if (entry) {
          await readEntry(entry);
        }
      }
    }

    // Fallback standard si fileEntries est vide
    if (fileEntries.length === 0) {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        fileEntries.push({ file: f, fullPath: f.name });
      }
    }

    const { added, skippedDeleted, totalScanned } = await scanFilesList(
      fileEntries,
      selectedSystemId || undefined,
      (scanned, total, currentName) => {
        setProgress({ current: scanned, total, filename: currentName });
      }
    );

    handleFinishScan(added, skippedDeleted, totalScanned);
  };

  // 4. Scan du Répertoire Centralisé /public/roms
  const handleScanCentralized = async () => {
    setIsScanning(true);
    setScanResult(null);
    setCurrentAction('Scan de /public/roms (Manifest)...');
    setProgress({ current: 0, total: 0, filename: 'Interrogation de /roms/roms_manifest.json...' });

    const { added, skippedDeleted, totalScanned } = await scanPublicRomsManifest();
    handleFinishScan(added, skippedDeleted, totalScanned);
  };

  // Réinitialiser la liste noire des suppressions
  const handleResetDeletedRegistry = () => {
    clearDeletedRegistry();
    setShowTrashConfirm(false);
    setTrashResetFeedback(true);
    if (onPlaySound) onPlaySound('coin');
    setTimeout(() => setTrashResetFeedback(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-retro-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto text-slate-100">
        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".zip,.7z,.rar,.nes,.fds,.sfc,.smc,.fig,.md,.gen,.smd,.bin,.sms,.gg,.gb,.gbc,.gba,.nds,.z64,.n64,.v64,.chd,.cue,.iso,.pbp,.pce,.a26,.a78,.d64,.prg,.adf,.ws,.wsc"
          className="hidden"
          onChange={handleFileInputChange}
        />
        <input
          ref={folderInputRef}
          type="file"
          // @ts-ignore
          webkitdirectory=""
          // @ts-ignore
          directory=""
          multiple
          className="hidden"
          onChange={handleFolderInputChange}
        />

        {/* EN-TÊTE */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-retro-800/80">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <FolderSearch className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
                <span>Scanner de Répertoires & Ajout de ROMs</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                  Haute Détection
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Ajoutez vos ROMs par dossier, par fichiers ou via le répertoire centralisé.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION PROGRESSION SCAN EN COURS */}
          {isScanning && (
            <div className="p-5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-3 animate-pulse">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-300 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>{currentAction}</span>
                </span>
                {progress.total > 0 && (
                  <span className="font-mono text-cyan-400">
                    {progress.current} / {progress.total} (
                    {Math.round((progress.current / progress.total) * 100)}%)
                  </span>
                )}
              </div>

              {progress.total > 0 && (
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-150"
                    style={{
                      width: `${Math.min(100, Math.round((progress.current / progress.total) * 100))}%`,
                    }}
                  />
                </div>
              )}

              <p className="text-[11px] font-mono text-slate-400 truncate">
                Fichier en cours : <span className="text-white">{progress.filename || '...'}</span>
              </p>
            </div>
          )}

          {/* RÉSULTAT DU DERNIER SCAN */}
          {scanResult && !isScanning && (
            <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
              <div className="flex items-center space-x-2.5 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-sm font-bold">
                  {scanResult.added.length > 0
                    ? `Scan terminé : ${scanResult.added.length} nouveau(x) jeu(x) ajouté(s) !`
                    : 'Scan terminé : aucun nouveau jeu à ajouter.'}
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Total Scanné</span>
                  <span className="text-base font-black text-white">{scanResult.totalScanned}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/30">
                  <span className="text-emerald-400 text-[10px] block font-bold">Nouveaux Ajoutés</span>
                  <span className="text-base font-black text-emerald-300">{scanResult.added.length}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Déjà Présents</span>
                  <span className="text-base font-black text-slate-300">{scanResult.skippedExisting}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-rose-500/30">
                  <span className="text-rose-400 text-[10px] block font-bold">Exclus (Supprimés)</span>
                  <span className="text-base font-black text-rose-300">{scanResult.skippedDeleted}</span>
                </div>
              </div>

              {scanResult.added.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {scanResult.added.slice(0, 8).map((g) => (
                    <span
                      key={g.id}
                      className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-mono border border-emerald-500/30"
                    >
                      {g.cleanTitle} ({g.systemId.toUpperCase()})
                    </span>
                  ))}
                  {scanResult.added.length > 8 && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[11px] font-mono">
                      +{scanResult.added.length - 8} autres...
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3 OPTIONS DE SCAN & AJOUT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* OPTION 1: SCAN DOSSIER LOCAL */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 transition flex flex-col justify-between space-y-4 group">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-extrabold text-white group-hover:text-cyan-300 transition">
                  1. Scanner un Dossier Local
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sélectionnez le dossier de votre ordinateur (ex: <code>C:/Roms</code> ou <code>~/Roms</code>). RetroMAD analyse tous les sous-dossiers récursivement.
                </p>
              </div>

              <button
                type="button"
                onClick={handleScanLocalFolder}
                disabled={isScanning}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Sélectionner le Dossier</span>
              </button>
            </div>

            {/* OPTION 2: IMPORT FICHIERS INDIVIDUELS */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/50 transition flex flex-col justify-between space-y-4 group">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-105 transition">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-extrabold text-white group-hover:text-purple-300 transition">
                  2. Fichiers ROMs par Lots
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Importez une ou plusieurs ROMs individuelles (<code>.zip</code>, <code>.sfc</code>, <code>.nes</code>, <code>.md</code>, <code>.gba</code>, <code>.z64</code>, <code>.iso</code>...).
                </p>
              </div>

              <button
                type="button"
                onClick={handleSelectFiles}
                disabled={isScanning}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-purple-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>Choisir les Fichiers</span>
              </button>
            </div>

            {/* OPTION 3: SCAN RÉPERTOIRE CENTRALISÉ */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/50 transition flex flex-col justify-between space-y-4 group">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
                  <HardDrive className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-extrabold text-white group-hover:text-emerald-300 transition">
                  3. Répertoire Centralisé
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Scanne le répertoire centralisé <code>/public/roms</code> et indexe automatiquement toutes les démos et ROMs intégrées non supprimées.
                </p>
              </div>

              <button
                type="button"
                onClick={handleScanCentralized}
                disabled={isScanning}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Scanner /public/roms</span>
              </button>
            </div>
          </div>

          {/* ZONE DE GLISSER-DÉPOSER DIRECT */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 text-center transition flex flex-col items-center justify-center space-y-3 ${
              isDragOver
                ? 'border-cyan-400 bg-cyan-500/15 scale-[1.01]'
                : 'border-slate-700/80 bg-slate-950/40 hover:border-slate-500'
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition ${
                isDragOver ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Glissez-déposez vos fichiers ROMs ou dossiers ici
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Glissez directement depuis l'explorateur Windows, Mac Finder ou Linux. Les titres, jaquettes et consoles sont détectés automatiquement.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[10px] font-mono text-slate-500">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">.nes</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">.sfc</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">.md</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">.gba</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">.z64</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">.iso</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">.chd</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">.zip</span>
            </div>
          </div>

          {/* GESTION DE LA CORBEILLE ET DES SUPPRESSIONS PERSISTANTES */}
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-200 block">
                  Protection contre la réapparition des jeux supprimés
                </span>
                <span className="text-[11px] text-slate-400">
                  {deletedCount > 0
                    ? `${deletedCount} élément(s) exclu(s) définitivement de la bibliothèque.`
                    : 'Aucun jeu dans la liste noire des suppressions.'}
                </span>
              </div>
            </div>

            {deletedCount > 0 && (
              <div>
                {showTrashConfirm ? (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleResetDeletedRegistry}
                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                    >
                      Confirmer réinitialisation
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTrashConfirm(false)}
                      className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowTrashConfirm(true)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-semibold transition"
                  >
                    Réinitialiser la Corbeille
                  </button>
                )}
              </div>
            )}

            {trashResetFeedback && (
              <span className="text-emerald-400 text-xs font-bold animate-pulse">
                ✓ Corbeille réinitialisée avec succès !
              </span>
            )}
          </div>
        </div>

        {/* PIED DE MODALE */}
        <div className="px-6 py-4 border-t border-slate-800 bg-retro-800/60 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>
              {games.length} jeu(x) actuellement répertorié(s) dans votre ludothèque.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
