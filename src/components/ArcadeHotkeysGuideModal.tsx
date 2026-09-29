import React from 'react';
import { Gamepad2, X, LogOut, Save, FolderOpen, Pause, RotateCcw, Sparkles } from 'lucide-react';

interface ArcadeHotkeysGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArcadeHotkeysGuideModal: React.FC<ArcadeHotkeysGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const hotkeys = [
    {
      combination: 'SELECT + START',
      action: 'Quitter le jeu',
      description: 'Ferme immédiatement l’émulateur et revient à RetroMad sans toucher au clavier.',
      icon: <LogOut className="w-5 h-5 text-rose-400" />,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    {
      combination: 'SELECT + R1 (RB)',
      action: 'Sauvegarde Rapide (Save State)',
      description: 'Enregistre instantanément votre position exacte dans la partie.',
      icon: <Save className="w-5 h-5 text-emerald-400" />,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      combination: 'SELECT + L1 (LB)',
      action: 'Chargement Rapide (Load State)',
      description: 'Recharge instantanément votre dernière sauvegarde rapide.',
      icon: <FolderOpen className="w-5 h-5 text-cyan-400" />,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    },
    {
      combination: 'SELECT + X (Triangle)',
      action: 'Menu Rétro & Pause',
      description: 'Ouvre le menu complet de l’émulateur pour régler la vidéo et les shaders.',
      icon: <Pause className="w-5 h-5 text-amber-400" />,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      combination: 'SELECT + Y (Carré)',
      action: 'Rembobiner (Rewind)',
      description: 'Remonte le temps de quelques secondes pour annuler une erreur ou un saut manqué.',
      icon: <RotateCcw className="w-5 h-5 text-purple-400" />,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-slate-900 border-2 border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,242,254,0.3)] overflow-hidden text-slate-100 p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-inner">
              <Gamepad2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
                Raccourcis Arcade Universels (Hotkeys)
              </h3>
              <p className="text-xs text-slate-400">
                Actifs sur manettes USB, sticks arcade et encodeurs XinMo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Liste des Raccourcis */}
        <div className="space-y-3">
          {hotkeys.map((h, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-cyan-500/40 flex items-start gap-3.5 transition"
            >
              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-700/70 shrink-0 mt-0.5">
                {h.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-white">{h.action}</h4>
                  <span className={`px-2 py-0.5 rounded-md border text-[11px] font-mono font-bold ${h.badgeColor}`}>
                    {h.combination}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{h.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Note en bas */}
        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Astuce : maintenez d'abord la touche <strong className="text-white">SELECT</strong> enfoncée, puis appuyez sur la deuxième touche.
          </span>
        </div>

        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition"
        >
          J'ai compris
        </button>
      </div>
    </div>
  );
};
