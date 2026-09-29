import React from 'react';
import { useGamepadStatus } from '../hooks/useGamepad';
import { Gamepad2 } from 'lucide-react';

interface GamepadHintProps {
  onOpenHotkeysGuide?: () => void;
}

export const GamepadHint: React.FC<GamepadHintProps> = ({ onOpenHotkeysGuide }) => {
  const gp = useGamepadStatus();


  // Configuration des symboles et couleurs selon la marque détectée
  const buttons = (() => {
    if (gp.brand === 'playstation') {
      return {
        confirm: { label: '✕', color: 'border-blue-500/40 text-blue-400 bg-blue-500/20' },
        cancel: { label: '○', color: 'border-rose-500/40 text-rose-400 bg-rose-500/20' },
        details: { label: '□', color: 'border-pink-500/40 text-pink-400 bg-pink-500/20' },
        favorite: { label: '△', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/20' },
        triggers: 'L1 / R1',
      };
    }
    if (gp.brand === 'nintendo') {
      return {
        confirm: { label: 'B', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/20' },
        cancel: { label: 'A', color: 'border-red-500/40 text-red-400 bg-red-500/20' },
        details: { label: 'Y', color: 'border-amber-500/40 text-amber-400 bg-amber-500/20' },
        favorite: { label: 'X', color: 'border-blue-500/40 text-blue-400 bg-blue-500/20' },
        triggers: 'L / R',
      };
    }
    // Xbox / PC standard
    return {
      confirm: { label: 'A', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/20' },
      cancel: { label: 'B', color: 'border-red-500/40 text-red-400 bg-red-500/20' },
      details: { label: 'X', color: 'border-blue-500/40 text-blue-400 bg-blue-500/20' },
      favorite: { label: 'Y', color: 'border-amber-500/40 text-amber-400 bg-amber-500/20' },
      triggers: 'LB / RB',
    };
  })();

  return (
    <footer className="h-10 bg-retro-900/90 backdrop-blur border-t border-slate-800/80 px-6 flex items-center justify-between text-xs text-slate-400 select-none z-20">
      <div className="flex items-center space-x-5">
        <div className="flex items-center space-x-1.5">
          <span className={`w-5 h-5 rounded-full font-bold flex items-center justify-center border text-[10px] ${buttons.confirm.color}`}>
            {buttons.confirm.label}
          </span>
          <span>Sélectionner / Lancer</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className={`w-5 h-5 rounded-full font-bold flex items-center justify-center border text-[10px] ${buttons.cancel.color}`}>
            {buttons.cancel.label}
          </span>
          <span>Retour</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className={`w-5 h-5 rounded-full font-bold flex items-center justify-center border text-[10px] ${buttons.details.color}`}>
            {buttons.details.label}
          </span>
          <span>Fiche Détails</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className={`w-5 h-5 rounded-full font-bold flex items-center justify-center border text-[10px] ${buttons.favorite.color}`}>
            {buttons.favorite.label}
          </span>
          <span>Favori</span>
        </div>

        <div className="hidden md:flex items-center space-x-1.5">
          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono">
            {buttons.triggers}
          </span>
          <span>Changer de console</span>
        </div>

        <div className="hidden lg:flex items-center space-x-1.5">
          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 text-[10px] font-mono">
            🎲 Select
          </span>
          <span>Jeu au hasard</span>
        </div>

        {onOpenHotkeysGuide && (
          <button
            onClick={onOpenHotkeysGuide}
            className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 hover:text-white transition active:scale-95"
            title="Afficher les combinaisons de touches de la borne"
          >
            <span className="font-mono font-bold text-[10px] text-cyan-400">SELECT+START</span>
            <span className="text-[10px]">Raccourcis Borne</span>
          </button>
        )}
      </div>


      <div className="flex items-center space-x-2 text-[11px] text-slate-400">
        {gp.connected ? (
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <Gamepad2 className="w-3.5 h-3.5" />
            <span className="font-semibold truncate max-w-[180px]">
              {gp.name || `${gp.brand.toUpperCase()} Connecté`}
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="text-[10px]">Clavier actif (Touches Flèches, Entrée, Esc)</span>
          </div>
        )}
      </div>
    </footer>
  );
};
