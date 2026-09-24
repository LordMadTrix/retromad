import React, { useState } from 'react';
import {
  X,
  Layers,
  Play,
  RotateCw,
  Search,
} from 'lucide-react';
import { Game, System } from '../../types';

interface VirtualCartridgeShelfModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  systems: System[];
  onLaunchGame: (game: Game) => void;
  onPlaySound?: (type: 'insert' | 'click' | 'powerup') => void;
}

export const VirtualCartridgeShelfModal: React.FC<VirtualCartridgeShelfModalProps> = ({
  isOpen,
  onClose,
  games,
  systems,
  onLaunchGame,
  onPlaySound,
}) => {
  const [selectedSystemId, setSelectedSystemId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectedGame, setInspectedGame] = useState<Game | null>(null);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  if (!isOpen) return null;

  // Filtrage des jeux
  const filteredGames = games.filter((g) => {
    const matchesSys = selectedSystemId === 'all' || g.systemId === selectedSystemId;
    const q = searchQuery.toLowerCase().trim();
    const matchesQ = !q || g.cleanTitle.toLowerCase().includes(q);
    return matchesSys && matchesQ;
  });

  const handleInspectCartridge = (game: Game) => {
    if (onPlaySound) onPlaySound('click');
    setInspectedGame(game);
    setIsFlipped(false);
  };

  const handleLaunchFromShelf = (game: Game) => {
    if (onPlaySound) onPlaySound('insert');
    onLaunchGame(game);
    onClose();
  };

  // Déterminer le style de cartouche selon le système
  const getCartridgeStyle = (systemId: string) => {
    const id = systemId.toLowerCase();
    if (id.includes('snes') || id.includes('super')) {
      return {
        bg: 'bg-slate-300',
        text: 'text-slate-800',
        border: 'border-slate-400',
        labelBorder: 'border-slate-400',
        shape: 'rounded-t-2xl rounded-b-md',
        type: 'SNES Cartridge (16-Bit)',
      };
    }
    if (id.includes('megadrive') || id.includes('genesis')) {
      return {
        bg: 'bg-zinc-900',
        text: 'text-zinc-100',
        border: 'border-zinc-700',
        labelBorder: 'border-red-600',
        shape: 'rounded-t-xl rounded-b-sm',
        type: 'Mega Drive Cartridge (16-Bit)',
      };
    }
    if (id.includes('nes') || id.includes('famicom')) {
      return {
        bg: 'bg-stone-300',
        text: 'text-stone-800',
        border: 'border-stone-400',
        shape: 'rounded-sm',
        type: 'NES Game Pak (8-Bit)',
      };
    }
    if (id.includes('gb') || id.includes('gameboy')) {
      return {
        bg: 'bg-slate-200',
        text: 'text-slate-700',
        border: 'border-slate-300',
        shape: 'rounded-t-lg rounded-b-sm',
        type: 'Game Boy Compact Pak',
      };
    }
    if (id.includes('n64')) {
      return {
        bg: 'bg-neutral-800',
        text: 'text-neutral-100',
        border: 'border-neutral-600',
        shape: 'rounded-t-3xl rounded-b-md',
        type: 'N64 64-Bit Cartridge',
      };
    }

    return {
      bg: 'bg-slate-800',
      text: 'text-slate-200',
      border: 'border-slate-600',
      shape: 'rounded-xl',
      type: 'Arcade Cartridge / PCB',
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-neon">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide uppercase flex items-center space-x-2">
                <span>Étagère 3D de Cartouches Physiques</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-500/30">
                  Collection Virtuelle
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Inspectez vos cartouches d'époque sous tous les angles, lisez les avertissements rétro et insérez-les dans la console.
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

        {/* Barre de filtre et recherche */}
        <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedSystemId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedSystemId === 'all'
                  ? 'bg-purple-600 text-white shadow-neon'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Toutes ({games.length})
            </button>
            {systems.map((sys) => {
              const count = games.filter((g) => g.systemId === sys.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={sys.id}
                  onClick={() => setSelectedSystemId(sys.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    selectedSystemId === sys.id
                      ? 'bg-purple-600 text-white shadow-neon'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {sys.shortName} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une cartouche..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Grille des Cartouches (Étagère bois rétro) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-[#0a0d14]">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredGames.map((game) => {
              const cart = getCartridgeStyle(game.systemId);
              const sys = systems.find((s) => s.id === game.systemId);

              return (
                <div
                  key={game.id}
                  onClick={() => handleInspectCartridge(game)}
                  className="group relative cursor-pointer flex flex-col items-center transition-all duration-300 hover:-translate-y-2"
                >
                  {/* Corps physique de la cartouche */}
                  <div
                    className={`w-40 sm:w-44 h-52 sm:h-56 ${cart.bg} ${cart.border} border-2 ${cart.shape} shadow-2xl p-2.5 flex flex-col justify-between relative overflow-hidden transition-all group-hover:shadow-[0_15px_30px_rgba(0,0,0,0.8)]`}
                  >
                    {/* Rainures supérieures authentiques */}
                    <div className="w-full h-3 border-b border-black/20 flex space-x-1 opacity-40 mb-1">
                      <div className="flex-1 bg-black/30 rounded-sm" />
                      <div className="flex-1 bg-black/30 rounded-sm" />
                      <div className="flex-1 bg-black/30 rounded-sm" />
                    </div>

                    {/* Étiquette autocollante de la cartouche */}
                    <div className="flex-1 bg-slate-900 border border-black/40 rounded-lg p-2 flex flex-col justify-between overflow-hidden shadow-inner relative group-hover:scale-102 transition-transform">
                      {game.media?.boxart2d ? (
                        <img
                          src={game.media.boxart2d}
                          alt={game.title}
                          className="w-full h-24 sm:h-28 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-24 sm:h-28 bg-slate-800 rounded-md flex items-center justify-center p-2 text-center text-[10px] font-bold text-white uppercase">
                          {game.cleanTitle}
                        </div>
                      )}

                      <div className="mt-1 pt-1 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase truncate">
                          {sys?.shortName || 'RETRO'}
                        </span>
                        <span className="text-[8px] font-mono text-amber-400">MADE IN JAPAN</span>
                      </div>
                    </div>

                    {/* Fente inférieure / connecteur */}
                    <div className="mt-1.5 h-2 bg-amber-900/60 rounded-sm border border-amber-950 flex justify-center items-center">
                      <div className="w-3/4 h-0.5 bg-amber-500/80" />
                    </div>
                  </div>

                  {/* Reflet de l'étagère */}
                  <div className="w-36 h-2 bg-purple-500/10 rounded-full blur-sm mt-2 opacity-50" />
                  <span className="text-xs font-bold text-slate-300 text-center mt-1 truncate w-40">
                    {game.cleanTitle}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal d'inspection détaillée de la cartouche sélectionnée */}
        {inspectedGame && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setInspectedGame(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-black text-white uppercase tracking-wider mb-1">
                {inspectedGame.cleanTitle}
              </h3>
              <span className="text-xs text-purple-400 font-mono mb-4">
                {getCartridgeStyle(inspectedGame.systemId).type}
              </span>

              {/* Rendu 3D Recto / Verso */}
              <div
                onClick={() => setIsFlipped((prev) => !prev)}
                className="w-56 h-72 cursor-pointer transition-transform duration-500 relative group flex items-center justify-center"
              >
                {!isFlipped ? (
                  /* RECTO */
                  <div className="w-full h-full bg-slate-300 border-4 border-slate-400 rounded-t-3xl rounded-b-lg shadow-2xl p-3 flex flex-col justify-between text-slate-900">
                    <div className="h-4 border-b border-black/20 flex space-x-1 opacity-50">
                      <div className="flex-1 bg-black/30 rounded" />
                      <div className="flex-1 bg-black/30 rounded" />
                    </div>

                    <div className="flex-1 bg-slate-950 rounded-xl p-2.5 flex flex-col justify-between my-2 shadow-inner border border-black/40">
                      {inspectedGame.media?.boxart2d ? (
                        <img
                          src={inspectedGame.media.boxart2d}
                          alt={inspectedGame.title}
                          className="w-full h-36 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-36 bg-slate-800 rounded-lg flex items-center justify-center text-white font-bold text-xs p-2 text-center">
                          {inspectedGame.cleanTitle}
                        </div>
                      )}
                      <div className="text-[10px] font-mono text-center text-amber-400 font-bold mt-1">
                        OFFICIAL QUALITY SEAL
                      </div>
                    </div>

                    <div className="h-3 bg-amber-950 rounded flex items-center justify-center">
                      <div className="w-2/3 h-1 bg-amber-400" />
                    </div>
                  </div>
                ) : (
                  /* VERSO */
                  <div className="w-full h-full bg-slate-400 border-4 border-slate-500 rounded-t-3xl rounded-b-lg shadow-2xl p-4 flex flex-col justify-between text-slate-900 font-mono text-[9px]">
                    <div className="text-center font-bold border-b border-black/30 pb-1">
                      ATTENTION &bull; PRÉCAUTIONS
                    </div>
                    <div className="space-y-1.5 text-slate-800 leading-tight">
                      <p>&bull; Ne pas toucher les connecteurs dorés avec les doigts.</p>
                      <p>&bull; Ne pas souffler dans la cartouche (utiliser un coton-tige sec).</p>
                      <p>&bull; Éviter les chocs thermiques et l'humidité.</p>
                      <p>&bull; Éteindre toujours la console avant d'insérer ou retirer ce jeu.</p>
                    </div>
                    <div className="p-2 rounded bg-black/10 border border-black/20 text-center font-bold text-[8px]">
                      PAT. PEND. MADE IN JAPAN &bull; MODEL NO. SNS-006
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsFlipped((prev) => !prev)}
                className="mt-3 flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Cliquer pour retourner la cartouche ({isFlipped ? 'Voir le Recto' : 'Voir le Verso'})</span>
              </button>

              {/* Bouton d'insertion et lancement */}
              <div className="w-full mt-6 flex space-x-3">
                <button
                  onClick={() => handleLaunchFromShelf(inspectedGame)}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider transition shadow-neon flex items-center justify-center space-x-2 active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>▶ Insérer la Cartouche & Jouer</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
