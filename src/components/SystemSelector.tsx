import React from 'react';
import { System, Game } from '../types';
import { Layers, Landmark } from 'lucide-react';
import { ConsoleLogo } from './ConsoleLogo';

interface SystemSelectorProps {
  systems: System[];
  selectedSystemId: string | null; // null = "Tous les jeux"
  onSelectSystem: (systemId: string | null) => void;
  games: Game[];
  onOpenExhibition?: (system: System) => void;
}

export const SystemSelector: React.FC<SystemSelectorProps> = ({
  systems,
  selectedSystemId,
  onSelectSystem,
  games,
  onOpenExhibition,
}) => {
  // Calcul du nombre de jeux par système
  const gameCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of games) {
      counts[g.systemId] = (counts[g.systemId] || 0) + 1;
    }
    return counts;
  }, [games]);

  return (
    <div className="bg-gradient-to-r from-[#101d44]/95 via-[#1a2860]/95 to-[#1e1748]/95 border-b border-cyan-300/30 px-6 py-3 select-none shadow-[0_4px_20px_rgba(20,47,120,0.35)]">
      <div className="flex items-center space-x-3 overflow-x-auto pb-1 no-scrollbar">
        {/* Bouton "Tous les systèmes" */}
        <button
          onClick={() => onSelectSystem(null)}
          className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
            selectedSystemId === null
              ? 'bg-retro-accent text-retro-900 shadow-neon scale-105'
              : 'bg-[#22376e]/70 text-slate-200 hover:text-white hover:bg-[#36539d] border border-blue-300/25'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>TOUTES LES CONSOLES</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              selectedSystemId === null
                ? 'bg-retro-900/40 text-retro-900'
                : 'bg-slate-700/60 text-slate-300'
            }`}
          >
            {games.length}
          </span>
        </button>

        {/* Liste des systèmes avec VRAIS LOGOS OFFICIELS */}
        {systems.map((system) => {
          const count = gameCounts[system.id] || 0;
          const isSelected = selectedSystemId === system.id;

          return (
            <button
              key={system.id}
              onClick={() => onSelectSystem(system.id)}
              style={{
                borderColor: isSelected ? system.themeColor : undefined,
                boxShadow: isSelected ? `0 0 15px ${system.themeColor}55` : undefined,
              }}
              className={`flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                isSelected
                  ? 'bg-slate-800 text-white border-2 scale-105'
                  : 'bg-[#1a2b5b]/75 text-slate-200 hover:text-white hover:bg-[#304a91] border border-blue-200/20'
              }`}
            >
              <ConsoleLogo system={system} size="sm" showFallbackText={false} />
              <span className={isSelected ? 'text-white' : 'text-slate-300'}>{system.shortName}</span>
              {count > 0 && (
                <span
                  style={{
                    backgroundColor: isSelected ? `${system.themeColor}33` : undefined,
                    color: isSelected ? system.themeColor : undefined,
                  }}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    !isSelected ? 'bg-slate-700/50 text-slate-400' : ''
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {/* Bouton accès direct Musée pour le système sélectionné */}
        {selectedSystemId && onOpenExhibition && (
          (() => {
            const activeSys = systems.find((s) => s.id === selectedSystemId);
            if (!activeSys) return null;
            return (
              <button
                onClick={() => onOpenExhibition(activeSys)}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-black shrink-0 bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 hover:text-white transition shadow-neon ml-auto cursor-pointer"
                title={`Ouvrir l'exposition musée et l'histoire de la ${activeSys.name}`}
              >
                <Landmark className="w-3.5 h-3.5 text-cyan-400" />
                <span>🏛️ Musée {activeSys.shortName}</span>
              </button>
            );
          })()
        )}
      </div>
    </div>
  );
};
