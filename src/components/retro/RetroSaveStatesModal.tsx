import React, { useState, useRef } from 'react';
import {
  Save,
  Clock,
  HardDrive,
  Download,
  Upload,
  Trash2,
  Play,
  Camera,
  X,
} from 'lucide-react';
import { SaveStateItem } from '../../types/retroFeatures';
import { Game } from '../../types';

interface RetroSaveStatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  saveStates: SaveStateItem[];
  onLoadState: (state: SaveStateItem) => void;
  onCreateState: (game: Game, slot: number | 'auto', note?: string) => void;
  onDeleteState: (id: string) => void;
  onImportState: (file: File, game: Game) => void;
  games: Game[];
  filterGameId?: string;
  selectedGameId?: string;
  onPlaySound?: (type: 'coin' | 'powerup') => void;
}

export const RetroSaveStatesModal: React.FC<RetroSaveStatesModalProps> = ({
  isOpen,
  onClose,
  saveStates,
  onLoadState,
  onCreateState,
  onDeleteState,
  onImportState,
  games,
  filterGameId,
  selectedGameId,
  onPlaySound,
}) => {
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>(selectedGameId || filterGameId || 'all');
  const [isNewStateOpen, setIsNewStateOpen] = useState(false);
  const [targetSlot, setTargetSlot] = useState<number | 'auto'>(1);
  const [targetNote, setTargetNote] = useState('');
  const [targetGameId, setTargetGameId] = useState(filterGameId || games[0]?.id || 'smw');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredStates = saveStates.filter((s) => {
    if (selectedGameFilter !== 'all' && s.gameId !== selectedGameFilter) return false;
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const game = games.find((g) => g.id === targetGameId);
    if (!game) return;
    onCreateState(game, targetSlot, targetNote.trim() || `Instant de jeu (${game.cleanTitle})`);
    if (onPlaySound) onPlaySound('powerup');
    setIsNewStateOpen(false);
    setTargetNote('');
  };

  const handleExportState = (s: SaveStateItem) => {
    const dummyContent = JSON.stringify(s, null, 2);
    const blob = new Blob([dummyContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${s.gameTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_slot${s.slot}.state`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const game = games.find((g) => g.id === targetGameId) || games[0];
    if (game) {
      onImportState(file, game);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b1329] border border-cyan-500/30 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(0,242,254,0.15)] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0d1838] flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <HardDrive className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white tracking-wide">
                  Save States & Cartes Mémoires
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono font-bold">
                  {saveStates.length} états stockés
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Instantanés de partie (Save States) et sauvegardes cartouches authentiques (.srm)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".state,.srm,.sav"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition"
              title="Importer un fichier de sauvegarde"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Importer .state</span>
            </button>
            <button
              onClick={() => setIsNewStateOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Créer Instantané</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="p-3 bg-[#080e22] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <label className="text-slate-400">Filtrer par jeu :</label>
            <select
              value={selectedGameFilter}
              onChange={(e) => setSelectedGameFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
            >
              <option value="all">Tous les jeux ({saveStates.length})</option>
              {Array.from(new Set(saveStates.map((s) => s.gameId))).map((gid) => {
                const game = saveStates.find((s) => s.gameId === gid);
                const count = saveStates.filter((s) => s.gameId === gid).length;
                return (
                  <option key={gid} value={gid}>
                    {game?.gameTitle} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* New State Form Modal */}
        {isNewStateOpen && (
          <form
            onSubmit={handleCreateSubmit}
            className="p-4 bg-slate-900/95 border-b border-emerald-500/30 flex flex-wrap items-end gap-3 text-xs animate-in slide-in-from-top-3"
          >
            <div>
              <label className="block text-[11px] text-slate-400 font-bold mb-1">Jeu Cible</label>
              <select
                value={targetGameId}
                onChange={(e) => setTargetGameId(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              >
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.cleanTitle}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 font-bold mb-1">Emplacement (Slot)</label>
              <select
                value={targetSlot}
                onChange={(e) => setTargetSlot(e.target.value === 'auto' ? 'auto' : Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              >
                <option value={1}>Slot 1 (Manuel)</option>
                <option value={2}>Slot 2 (Manuel)</option>
                <option value={3}>Slot 3 (Manuel)</option>
                <option value={4}>Slot 4 (Manuel)</option>
                <option value={5}>Slot 5 (Manuel)</option>
                <option value="auto">Auto-Save (Automatique)</option>
              </select>
            </div>
            <div className="flex-1 min-w-[220px]">
              <label className="block text-[11px] text-slate-400 font-bold mb-1">Note de Sauvegarde</label>
              <input
                type="text"
                placeholder="Ex: Avant le boss du monde 4"
                value={targetNote}
                onChange={(e) => setTargetNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center space-x-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Capturer</span>
              </button>
              <button
                type="button"
                onClick={() => setIsNewStateOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* Gallery */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredStates.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <HardDrive className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Aucun état de sauvegarde pour ce jeu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStates.map((state) => (
                <div
                  key={state.id}
                  className="bg-[#0e1738]/70 border border-slate-800 hover:border-emerald-500/40 rounded-xl overflow-hidden flex flex-col group transition-all shadow-sm"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    {state.thumbnail ? (
                      <img
                        src={state.thumbnail}
                        alt={state.gameTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Camera className="w-8 h-8 opacity-40" />
                      </div>
                    )}

                    {/* Badge Slot */}
                    <div className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded border border-slate-700 text-[10px] font-mono font-bold text-emerald-400">
                      {state.slot === 'auto' ? 'Auto-Save' : `Slot #${state.slot}`}
                    </div>

                    <div className="absolute top-2 right-2 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded border border-slate-700 text-[10px] font-mono text-slate-400">
                      {state.fileSize}
                    </div>

                    {/* Quick Load Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                      <button
                        type="button"
                        onClick={() => onLoadState(state)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Restaurer</span>
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white truncate">{state.gameTitle}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{state.systemName}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        {state.note}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(state.timestamp).toLocaleString()}</span>
                      </span>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleExportState(state)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition"
                          title="Télécharger la sauvegarde"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteState(state.id)}
                          className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                          title="Supprimer l'état"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
