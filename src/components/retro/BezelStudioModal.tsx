import React, { useState } from 'react';
import {
  Tv,
  Sliders,
  Check,
  X,
  Monitor,
} from 'lucide-react';
import { BezelConfig } from '../../types/retroFeatures';
import { INITIAL_BEZELS } from '../../data/retroFeaturesData';

interface BezelStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBezel?: BezelConfig;
  currentConfig?: BezelConfig;
  onSaveBezelConfig?: (config: BezelConfig) => void;
  onSaveConfig?: (config: BezelConfig) => void;
  activeGameTitle?: string;
  activeGameBoxart?: string;
}

export const BezelStudioModal: React.FC<BezelStudioModalProps> = ({
  isOpen,
  onClose,
  currentBezel,
  currentConfig,
  onSaveBezelConfig,
  onSaveConfig,
  activeGameTitle = 'Super Mario World',
  activeGameBoxart = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=640&q=80',
}) => {
  const initialConfig = currentConfig || currentBezel || INITIAL_BEZELS[0];
  const [selectedBezelIndex, setSelectedBezelIndex] = useState(0);
  const [bezelConfig, setBezelConfig] = useState<BezelConfig>(initialConfig);
  const [hasSaved, setHasSaved] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (idx: number) => {
    setSelectedBezelIndex(idx);
    setBezelConfig(INITIAL_BEZELS[idx]);
    setHasSaved(false);
  };

  const handleSave = () => {
    const saveFn = onSaveConfig || onSaveBezelConfig;
    if (saveFn) saveFn(bezelConfig);
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 2000);
  };

  // Calcul du filtre couleur
  const getTintStyle = () => {
    switch (bezelConfig.tint) {
      case 'gameboy-green':
        return 'sepia(1) hue-rotate(50deg) saturate(2.5) contrast(1.2)';
      case 'amber':
        return 'sepia(1) hue-rotate(350deg) saturate(3) contrast(1.1)';
      case 'pvm-cool':
        return 'saturate(1.2) contrast(1.15) brightness(1.05)';
      case 'trinitron':
        return 'contrast(1.2) saturate(1.1) brightness(0.95)';
      default:
        return 'none';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b1329] border border-cyan-500/30 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-[0_0_50px_rgba(0,242,254,0.15)] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0d1838] flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <Tv className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white tracking-wide">
                  Studio Bezels & Shaders CRT
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono font-bold">
                  {bezelConfig.cabinetName}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Encadrements d'arcade officiels, téléviseurs vintage et filtres cathodiques
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
            >
              {hasSaved ? <Check className="w-4 h-4 text-emerald-950" /> : <Monitor className="w-3.5 h-3.5" />}
              <span>{hasSaved ? 'Enregistré !' : 'Appliquer par Défaut'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Workspace */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[#070c1e]">
          {/* Visual Live Preview Bezel Monitor */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center bg-slate-950/80 p-6 rounded-2xl border border-slate-800 relative shadow-inner overflow-hidden min-h-[380px]">
            {/* The Bezel Outer Shell */}
            <div
              className={`relative rounded-3xl p-5 sm:p-7 shadow-[0_0_40px_rgba(0,0,0,0.9)] border-4 border-slate-700/60 bg-gradient-to-br ${bezelConfig.borderGradient} transition-all duration-300 max-w-lg w-full flex flex-col items-center`}
            >
              {/* Cabinet Marquee / Top Badge */}
              <div className="w-full flex items-center justify-between mb-3 px-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900/80 font-mono bg-white/40 px-2 py-0.5 rounded shadow-sm">
                  {bezelConfig.cabinetName || 'ARCADE'}
                </span>
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[9px] font-mono text-slate-900/70 font-bold">POWER</span>
                </div>
              </div>

              {/* The Inner CRT Screen Frame */}
              <div
                className="relative bg-black rounded-2xl overflow-hidden w-full aspect-[4/3] flex items-center justify-center border-4 border-neutral-900 shadow-inner"
                style={{
                  borderRadius: `${bezelConfig.crtCurvature * 3.5}px`,
                }}
              >
                {/* Simulated Game Picture */}
                <img
                  src={activeGameBoxart}
                  alt={activeGameTitle}
                  className="w-full h-full object-cover transition-all"
                  style={{
                    filter: getTintStyle(),
                    transform: `scale(${1 + bezelConfig.crtCurvature * 0.015})`,
                  }}
                  referrerPolicy="no-referrer"
                />

                {/* Scanlines Overlay Layer */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    opacity: bezelConfig.scanlineIntensity / 100,
                    background:
                      'repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1.5px, transparent 1.5px, transparent 3px)',
                  }}
                />

                {/* Vignette / Corner Shadow Layer */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    opacity: bezelConfig.vignette / 100,
                    boxShadow: 'inset 0 0 50px rgba(0,0,0,0.95)',
                  }}
                />

                {/* Bloom / Phosphor Reflection Glow */}
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-screen"
                  style={{
                    opacity: bezelConfig.bloomGlow / 100,
                    background:
                      'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.18) 0%, transparent 70%)',
                  }}
                />
              </div>

              {/* Bottom Speaker Grille / Controls Bar */}
              <div className="w-full flex items-center justify-between mt-3 px-3">
                <div className="flex space-x-1">
                  <div className="w-6 h-1 bg-slate-700/50 rounded-full" />
                  <div className="w-6 h-1 bg-slate-700/50 rounded-full" />
                  <div className="w-6 h-1 bg-slate-700/50 rounded-full" />
                </div>
                <span className="text-[9px] font-mono text-slate-800 font-black">
                  RETROMAD CRT EMULATOR
                </span>
                <div className="flex space-x-1">
                  <div className="w-6 h-1 bg-slate-700/50 rounded-full" />
                  <div className="w-6 h-1 bg-slate-700/50 rounded-full" />
                  <div className="w-6 h-1 bg-slate-700/50 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Preset Chooser & Slider Controls */}
          <div className="space-y-5">
            {/* Presets Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Modèles de Bornes & Téléviseurs
              </label>
              <div className="grid grid-cols-2 gap-2">
                {INITIAL_BEZELS.map((b, idx) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelectPreset(idx)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      selectedBezelIndex === idx
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{b.name.split(' (')[0]}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{b.category}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders Configuration */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-4 text-xs">
              <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 flex items-center justify-between">
                <span>Réglages Shaders CRT</span>
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              </div>

              {/* Scanlines */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Intensité des Scanlines</span>
                  <span className="font-mono text-cyan-400">{bezelConfig.scanlineIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bezelConfig.scanlineIntensity}
                  onChange={(e) =>
                    setBezelConfig((c) => ({ ...c, scanlineIntensity: Number(e.target.value) }))
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Curvature */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Courbure de l'Écran (Effet Bombé)</span>
                  <span className="font-mono text-cyan-400">{bezelConfig.crtCurvature} / 10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={bezelConfig.crtCurvature}
                  onChange={(e) =>
                    setBezelConfig((c) => ({ ...c, crtCurvature: Number(e.target.value) }))
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Bloom Glow */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Lueur des Phosphores (Bloom)</span>
                  <span className="font-mono text-cyan-400">{bezelConfig.bloomGlow}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bezelConfig.bloomGlow}
                  onChange={(e) =>
                    setBezelConfig((c) => ({ ...c, bloomGlow: Number(e.target.value) }))
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Vignette */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Vignettage des Coins</span>
                  <span className="font-mono text-cyan-400">{bezelConfig.vignette}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bezelConfig.vignette}
                  onChange={(e) =>
                    setBezelConfig((c) => ({ ...c, vignette: Number(e.target.value) }))
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Teinte Chromatique */}
              <div>
                <label className="block text-slate-400 mb-1">Teinte de Phosphore</label>
                <select
                  value={bezelConfig.tint}
                  onChange={(e) =>
                    setBezelConfig((c) => ({ ...c, tint: e.target.value as any }))
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                >
                  <option value="normal">Standard RGB Authentique</option>
                  <option value="trinitron">Trinitron Chaud (Salon 90s)</option>
                  <option value="pvm-cool">PVM Studio Pro (Froid & Piqué)</option>
                  <option value="gameboy-green">Game Boy Matrice Verte (DMG)</option>
                  <option value="amber">Écran Ambre Monochrome (Arcade 80s)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
