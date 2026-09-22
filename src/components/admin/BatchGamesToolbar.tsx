import React, { useState } from 'react';
import { Game, System } from '../../types';
import {
  Trash2,
  Star,
  Cpu,
  Globe,
  Download,
  Eraser,
  CheckSquare,
} from 'lucide-react';

interface BatchGamesToolbarProps {
  games: Game[];
  selectedIds: Set<string>;
  systems: System[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBatchDelete: (ids: string[]) => void;
  onBatchToggleFavorite: (ids: string[], favorite: boolean) => void;
  onBatchChangeSystem: (ids: string[], targetSystemId: string) => void;
  onBatchScrape: (selectedGames: Game[]) => void;
  onBatchClearMedia: (ids: string[]) => void;
  onBatchExportJson: (selectedGames: Game[]) => void;
}

export const BatchGamesToolbar: React.FC<BatchGamesToolbarProps> = ({
  games,
  selectedIds,
  systems,
  onSelectAll,
  onDeselectAll,
  onBatchDelete,
  onBatchToggleFavorite,
  onBatchChangeSystem,
  onBatchScrape,
  onBatchClearMedia,
  onBatchExportJson,
}) => {
  const [showSystemPicker, setShowSystemPicker] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (selectedIds.size === 0) return null;

  const selectedGamesList = games.filter((g) => selectedIds.has(g.id));

  return (
    <div className="sticky top-0 z-20 p-3 mb-3 rounded-2xl bg-cyan-950/90 border border-cyan-500/50 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center space-x-3">
        <div className="px-2.5 py-1 rounded-xl bg-cyan-500 text-black font-black text-xs uppercase tracking-wider">
          {selectedIds.size} jeu{selectedIds.size > 1 ? 'x' : ''} sélectionné{selectedIds.size > 1 ? 's' : ''}
        </div>

        <button
          type="button"
          onClick={onSelectAll}
          className="text-xs text-cyan-300 hover:text-white font-semibold transition flex items-center space-x-1"
          title="Sélectionner tous les jeux affichés"
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Tout</span>
        </button>

        <button
          type="button"
          onClick={onDeselectAll}
          className="text-xs text-slate-400 hover:text-white underline font-semibold transition"
        >
          Désélectionner
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {/* Favori en lot */}
        <button
          type="button"
          onClick={() => onBatchToggleFavorite(Array.from(selectedIds), true)}
          className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center space-x-1"
          title="Ajouter aux favoris"
        >
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span className="hidden sm:inline">+ Favoris</span>
        </button>

        {/* Changer de console en lot */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSystemPicker(!showSystemPicker)}
            className="px-2.5 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition flex items-center space-x-1"
            title="Réassigner la console"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Changer Console</span>
          </button>

          {showSystemPicker && (
            <div className="absolute left-0 mt-2 w-56 p-2 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-30 max-h-56 overflow-y-auto space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 py-1">
                Assigner à la console :
              </span>
              {systems.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    onBatchChangeSystem(Array.from(selectedIds), s.id);
                    setShowSystemPicker(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs text-white truncate transition"
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scraper la sélection */}
        <button
          type="button"
          onClick={() => onBatchScrape(selectedGamesList)}
          className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition flex items-center space-x-1"
          title="Scraper uniquement la sélection"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Scraper ({selectedIds.size})</span>
        </button>

        {/* Exporter la sélection en JSON */}
        <button
          type="button"
          onClick={() => onBatchExportJson(selectedGamesList)}
          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1"
          title="Exporter la sélection en fichier JSON"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Export JSON</span>
        </button>

        {/* Effacer jaquettes */}
        <button
          type="button"
          onClick={() => onBatchClearMedia(Array.from(selectedIds))}
          className="px-2 py-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white text-xs transition flex items-center space-x-1"
          title="Effacer les jaquettes et captures de la sélection"
        >
          <Eraser className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Vider Médias</span>
        </button>

        {/* Supprimer en lot */}
        {showConfirmDelete ? (
          <div className="flex items-center space-x-1 bg-black/80 p-1 rounded-xl border border-rose-500/60">
            <span className="text-[10px] text-rose-300 font-bold px-1.5">Confirmer ?</span>
            <button
              type="button"
              onClick={() => {
                onBatchDelete(Array.from(selectedIds));
                setShowConfirmDelete(false);
              }}
              className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold"
            >
              Oui
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmDelete(false)}
              className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px]"
            >
              Non
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowConfirmDelete(true)}
            className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex items-center space-x-1"
            title="Supprimer définitivement les jeux sélectionnés"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Supprimer</span>
          </button>
        )}
      </div>
    </div>
  );
};
