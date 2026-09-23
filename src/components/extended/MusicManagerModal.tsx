import React, { useState, useRef } from 'react';
import {
  X,
  Music,
  FolderSearch,
  Plus,
  Play,
  Trash2,
  Upload,
  Sparkles,
  Disc,
  CheckCircle2,
  FolderOpen,
  FileAudio,
} from 'lucide-react';
import { ChiptuneTrack } from '../../types/retroFeatures';

interface MusicManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: ChiptuneTrack[];
  onAddTrack: (track: ChiptuneTrack) => void;
  onRemoveTrack: (trackId: string) => void;
  onImportTracks: (tracks: ChiptuneTrack[]) => void;
  onResetPlaylist: () => void;
  onSelectTrack: (index: number) => void;
  currentTrackId?: string;
  onPlaySound?: (type: 'coin' | 'powerup' | 'fanfare') => void;
}

export const MusicManagerModal: React.FC<MusicManagerModalProps> = ({
  isOpen,
  onClose,
  playlist,
  onAddTrack,
  onRemoveTrack,
  onImportTracks,
  onResetPlaylist,
  onSelectTrack,
  currentTrackId,
  onPlaySound,
}) => {
  const [activeTab, setActiveTab] = useState<'playlist' | 'add' | 'scan'>('playlist');

  // Formulaire d'ajout manuel
  const [newTitle, setNewTitle] = useState('');
  const [newGame, setNewGame] = useState('');
  const [newSystem, setNewSystem] = useState('Arcade Neo Geo');
  const [newComposer, setNewComposer] = useState('SNK Sound Team');
  const [audioUrl, setAudioUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // État du scan de dossier
  const [isScanning, setIsScanning] = useState(false);
  const [scannedFiles, setScannedFiles] = useState<ChiptuneTrack[]>([]);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const dirInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Gestion de l'upload d'un fichier audio unique
  const handleSingleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAudioUrl(objectUrl);

    // Extraction du titre à partir du nom de fichier sans extension
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
    if (cleanName.includes('-')) {
      const parts = cleanName.split('-');
      setNewGame(parts[0].trim());
      setNewTitle(parts.slice(1).join('-').trim());
    } else {
      setNewTitle(cleanName);
      setNewGame('Bande Son Personnalisée');
    }

    if (onPlaySound) onPlaySound('powerup');
  };

  // Soumission de l'ajout manuel
  const handleAddManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const track: ChiptuneTrack = {
      id: `custom-track-${Date.now()}`,
      title: newTitle.trim(),
      gameTitle: newGame.trim() || 'Rétro Masterpiece',
      system: newSystem,
      composer: newComposer.trim() || 'Compositeur Inconnu',
      duration: '3:00',
      bpm: 130,
      pattern: [
        { freq: 440, bass: 110, len: 0.25, type: 'square' },
        { freq: 554, bass: 110, len: 0.25, type: 'square' },
        { freq: 659, bass: 165, len: 0.25, type: 'sawtooth' },
        { freq: 880, bass: 220, len: 0.35, type: 'square' },
      ],
      audioUrl: audioUrl || undefined,
      isCustom: true,
      fileFormat: uploadedFile ? (uploadedFile.name.split('.').pop() as any) : 'synth',
    };

    onAddTrack(track);
    setActiveTab('playlist');
    setNewTitle('');
    setNewGame('');
    setAudioUrl('');
    setUploadedFile(null);
    if (onPlaySound) onPlaySound('fanfare');
  };

  // Traitement d'une liste de fichiers audio (dossier ou multi-sélection)
  const processAudioFiles = (files: FileList | File[]) => {
    setIsScanning(true);
    setScanMessage('Analyse des fichiers audio...');

    const validExtensions = ['.mp3', '.ogg', '.wav', '.m4a', '.flac', '.mid'];
    const detected: ChiptuneTrack[] = [];

    Array.from(files).forEach((file, index) => {
      const lower = file.name.toLowerCase();
      const isValid = validExtensions.some((ext) => lower.endsWith(ext));

      if (isValid) {
        const objectUrl = URL.createObjectURL(file);
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');

        let gameName = 'Jeu Inconnu';
        let trackTitle = nameWithoutExt;

        if (nameWithoutExt.includes('-')) {
          const parts = nameWithoutExt.split('-');
          gameName = parts[0].trim();
          trackTitle = parts.slice(1).join('-').trim();
        }

        detected.push({
          id: `scan-${Date.now()}-${index}`,
          title: trackTitle,
          gameTitle: gameName,
          system: 'Musique Importée',
          composer: 'Archive Musicale',
          duration: '3:15',
          bpm: 130,
          pattern: [],
          audioUrl: objectUrl,
          isCustom: true,
          fileName: file.name,
          fileFormat: file.name.split('.').pop() || 'mp3',
        });
      }
    });

    setTimeout(() => {
      setScannedFiles(detected);
      setIsScanning(false);
      setScanMessage(
        detected.length > 0
          ? `✨ ${detected.length} morceau(x) audio trouvé(s) et prêt(s) à être ajoutés au Jukebox !`
          : 'Aucun fichier audio valide (MP3, OGG, WAV, M4A) détecté dans ce répertoire.'
      );
      if (detected.length > 0 && onPlaySound) onPlaySound('fanfare');
    }, 400);
  };

  // Scanner un répertoire avec l'API File System Directory Picker si supportée, sinon via input webkitdirectory
  const handleDirectoryScanClick = async () => {
    if ((window as any).showDirectoryPicker) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        setIsScanning(true);
        setScanMessage('Lecture des métadonnées du répertoire...');
        const detectedFiles: File[] = [];

        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            detectedFiles.push(file);
          }
        }
        processAudioFiles(detectedFiles);
      } catch (err: any) {
        if (err.name !== 'AbortError' && dirInputRef.current) {
          dirInputRef.current.click();
        }
      }
    } else if (dirInputRef.current) {
      dirInputRef.current.click();
    }
  };

  const handleDirInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processAudioFiles(e.target.files);
    }
  };

  // Valider et importer tous les morceaux scannés
  const handleImportAllScanned = () => {
    if (scannedFiles.length === 0) return;
    onImportTracks(scannedFiles);
    setActiveTab('playlist');
    setScannedFiles([]);
    setScanMessage(null);
    if (onPlaySound) onPlaySound('fanfare');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-950 border border-fuchsia-500/40 rounded-3xl shadow-2xl shadow-fuchsia-500/10 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-400 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
              <Disc className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black tracking-wider text-white uppercase">
                  Gestionnaire Musical & Scanner de Dossier
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 text-[10px] font-black uppercase">
                  Jukebox Audio
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Ajoutez vos bandes-son préférées par l'administration ou scannez automatiquement un dossier de MP3 / OGG.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sous-onglets */}
        <div className="flex items-center space-x-2 px-6 py-3 border-b border-slate-800 bg-slate-900/40">
          <button
            onClick={() => setActiveTab('playlist')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'playlist'
                ? 'bg-fuchsia-500 text-white font-black shadow-md shadow-fuchsia-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Playlist Active ({playlist.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('scan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'scan'
                ? 'bg-fuchsia-500 text-white font-black shadow-md shadow-fuchsia-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FolderSearch className="w-3.5 h-3.5" />
            <span>Scanner un Dossier Musical</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'add'
                ? 'bg-fuchsia-500 text-white font-black shadow-md shadow-fuchsia-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajout Manuel / Fichier Audio</span>
          </button>
        </div>

        {/* Corps principal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* LISTE DES PISTES ACTUELLES */}
          {activeTab === 'playlist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  {playlist.length} Morceaux dans la Borne Arcade
                </span>
                <button
                  type="button"
                  onClick={onResetPlaylist}
                  className="text-xs text-slate-400 hover:text-red-400 transition"
                >
                  Restaurer pistes rétro d'origine
                </button>
              </div>

              <div className="space-y-2">
                {playlist.map((track, idx) => {
                  const isCurrent = track.id === currentTrackId;
                  return (
                    <div
                      key={track.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                        isCurrent
                          ? 'bg-fuchsia-950/40 border-fuchsia-500 text-white'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTrack(idx);
                            if (onPlaySound) onPlaySound('coin');
                          }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition shrink-0 ${
                            isCurrent
                              ? 'bg-fuchsia-500 text-slate-950 shadow-md shadow-fuchsia-500/30'
                              : 'bg-slate-800 text-slate-300 hover:bg-fuchsia-500 hover:text-slate-950'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                        </button>

                        <div className="truncate">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white truncate">{track.title}</span>
                            {track.isCustom && (
                              <span className="px-1.5 py-0.2 rounded bg-fuchsia-500/20 text-fuchsia-300 text-[9px] font-black uppercase">
                                {track.fileFormat?.toUpperCase() || 'AUDIO'}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {track.gameTitle} • {track.system} • {track.composer}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-400">{track.duration}</span>
                        <button
                          type="button"
                          onClick={() => onRemoveTrack(track.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 transition"
                          title="Supprimer du Jukebox"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SCANNER UN RÉPERTOIRE AUTOMATIQUEMENT */}
          {activeTab === 'scan' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center mx-auto shadow-lg shadow-fuchsia-500/20">
                  <FolderSearch className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase">
                    Scan Automatique de Répertoire Musical
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Sélectionnez votre dossier de musiques (ex: vos OST de jeux, fichiers MP3 ou OGG). RetroMAD extraira automatiquement le nom des jeux et ajoutera les morceaux au Jukebox.
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={handleDirectoryScanClick}
                    disabled={isScanning}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-400 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-fuchsia-500/25 flex items-center space-x-2 transition disabled:opacity-50"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>{isScanning ? 'Scan en cours...' : 'Choisir un Dossier de Musiques'}</span>
                  </button>

                  {/* Input caché standard pour compatibilité dossier webkit */}
                  <input
                    type="file"
                    ref={dirInputRef}
                    // @ts-ignore
                    webkitdirectory="true"
                    directory="true"
                    multiple
                    onChange={handleDirInputChange}
                    className="hidden"
                  />
                </div>

                {scanMessage && (
                  <p className="text-xs font-bold text-fuchsia-300 p-3 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/30">
                    {scanMessage}
                  </p>
                )}
              </div>

              {/* Résultats du scan détectés */}
              {scannedFiles.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {scannedFiles.length} Morceaux Détectés
                    </span>
                    <button
                      type="button"
                      onClick={handleImportAllScanned}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Ajouter Tout au Jukebox</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {scannedFiles.map((sf, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5 truncate">
                          <FileAudio className="w-4 h-4 text-fuchsia-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-xs font-bold text-white block truncate">{sf.title}</span>
                            <span className="text-[10px] text-slate-400">{sf.gameTitle} ({sf.fileFormat?.toUpperCase()})</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{sf.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AJOUT MANUEL OU UPLOAD UNIQUE */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddManualSubmit} className="max-w-xl mx-auto p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-fuchsia-400" />
                <span>Ajouter un Morceau à la Ludothèque</span>
              </h3>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Fichier Audio (MP3, OGG, WAV)</label>
                <label className="block p-4 border-2 border-dashed border-slate-700 hover:border-fuchsia-500/50 rounded-xl text-center cursor-pointer transition bg-slate-950/50">
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs font-bold text-slate-300 block">
                    {uploadedFile ? uploadedFile.name : 'Sélectionner un fichier audio sur votre ordinateur'}
                  </span>
                  <input
                    type="file"
                    accept="audio/*,.mp3,.ogg,.wav,.m4a,.flac"
                    onChange={handleSingleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Titre de la Piste</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Guile Theme, Aquatic Ambience..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:border-fuchsia-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Nom du Jeu</label>
                  <input
                    type="text"
                    placeholder="Ex: Donkey Kong Country"
                    value={newGame}
                    onChange={(e) => setNewGame(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:border-fuchsia-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Système / Console</label>
                  <input
                    type="text"
                    placeholder="Ex: Super Nintendo"
                    value={newSystem}
                    onChange={(e) => setNewSystem(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:border-fuchsia-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Compositeur</label>
                <input
                  type="text"
                  placeholder="Ex: David Wise, Koji Kondo..."
                  value={newComposer}
                  onChange={(e) => setNewComposer(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:border-fuchsia-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-fuchsia-500/20 transition mt-2"
              >
                Ajouter à la Playlist du Jukebox
              </button>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>La playlist est mémorisée localement et se lance dans le Jukebox chiptune/audio de RetroMAD.</span>
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
