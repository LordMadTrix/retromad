import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { HandheldOverlayConfig } from '../../types/extendedFeatures';
import { HANDHELD_PRESETS } from '../../data/extendedFeaturesData';

interface HandheldOverlaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: HandheldOverlayConfig;
  onSaveConfig: (config: HandheldOverlayConfig) => void;
  onPlaySound?: (type: 'coin' | 'powerup' | 'fanfare') => void;
}

export const HandheldOverlaysModal: React.FC<HandheldOverlaysModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSaveConfig,
  onPlaySound,
}) => {
  const [config, setConfig] = useState<HandheldOverlayConfig>(currentConfig);
  const [activePreset, setActivePreset] = useState<string>('gameboy_dmg');

  if (!isOpen) return null;

  const handleApplyPreset = (presetKey: string) => {
    const preset = HANDHELD_PRESETS[presetKey];
    if (preset) {
      setConfig({ ...preset });
      setActivePreset(presetKey);
      if (onPlaySound) onPlaySound('powerup');
    }
  };

  const handleSave = () => {
    onSaveConfig(config);
    if (onPlaySound) onPlaySound('fanfare');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-950 border border-green-500/40 rounded-3xl shadow-2xl shadow-green-500/10 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 border border-green-500/40 text-green-400 flex items-center justify-center shadow-lg shadow-green-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black tracking-wider text-white uppercase">
                  Studio Overlays Consoles Portables
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 text-[10px] font-black uppercase">
                  Rendu LCD & Coques
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Emballez l'écran de vos jeux nomades dans les véritables coques avec grille de pixels LCD et rétroéclairage.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-green-500/20 transition"
            >
              Appliquer l'Overlay
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corps principal : Contrôles (5 cols) + Rendu interactif (7 cols) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Panneau de configuration */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-green-400" />
                <span>Préréglages de Consoles Mythiques</span>
              </h4>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'gameboy_dmg', label: 'Game Boy Originale', desc: 'DMG-01 Gris & Vert' },
                  { id: 'gameboy_pocket', label: 'Game Boy Pocket', desc: 'Écran N&B Haute Clarté' },
                  { id: 'gba_indigo', label: 'Game Boy Advance', desc: 'Coque Indigo Transparente' },
                  { id: 'game_gear', label: 'SEGA Game Gear', desc: 'Écran Rétroéclairé Couleur' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleApplyPreset(p.id)}
                    className={`p-3 rounded-xl border text-left transition ${
                      activePreset === p.id
                        ? 'bg-green-500/20 border-green-500 text-white font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-200">{p.label}</div>
                    <div className="text-[10px] text-slate-500">{p.desc}</div>
                  </button>
                ))}
              </div>

              {/* Ajustements fins */}
              <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 font-bold mb-1">
                    <span>Grille de Pixels LCD (Matrice)</span>
                    <span className="font-mono text-green-400">{Math.round(config.pixelGridStrength * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={config.pixelGridStrength}
                    onChange={(e) => setConfig({ ...config, pixelGridStrength: parseFloat(e.target.value) })}
                    className="w-full accent-green-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-bold mb-1">
                    <span>Luminosité du Rétroéclairage</span>
                    <span className="font-mono text-green-400">{Math.round(config.backlightBrightness * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="1.5"
                    step="0.05"
                    value={config.backlightBrightness}
                    onChange={(e) => setConfig({ ...config, backlightBrightness: parseFloat(e.target.value) })}
                    className="w-full accent-green-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="font-bold text-slate-300">Rétroéclairage Tube Actif</span>
                  <input
                    type="checkbox"
                    checked={config.backlightEnabled}
                    onChange={(e) => setConfig({ ...config, backlightEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-green-500 bg-slate-950 border-slate-700 focus:ring-green-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">Loupe d'Écran Rétro (Magnifier Lens)</span>
                  <input
                    type="checkbox"
                    checked={config.magnifierLens}
                    onChange={(e) => setConfig({ ...config, magnifierLens: e.target.checked })}
                    className="w-4 h-4 rounded text-green-500 bg-slate-950 border-slate-700 focus:ring-green-500"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Rendu visuel de la console */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-xs text-slate-400 mb-4 font-bold uppercase tracking-wider">
              Aperçu en Temps Réel du Rendu Écran
            </span>

            {/* Châssis de la console simulée */}
            <div
              className="relative w-72 h-96 rounded-[36px] p-6 shadow-2xl flex flex-col items-center justify-between border-4 border-slate-600/60 transition-all"
              style={{ backgroundColor: config.shellColor }}
            >
              {/* Écran avec matrice LCD */}
              <div className="relative w-52 h-44 rounded-xl bg-slate-900 border-4 border-slate-800 flex items-center justify-center overflow-hidden shadow-inner">
                {/* Dalle LCD verte ou couleur */}
                <div
                  className={`w-full h-full flex flex-col items-center justify-center relative ${
                    config.model === 'gameboy_dmg' ? 'bg-[#8bac0f] text-[#0f380f]' : 'bg-slate-950 text-white'
                  }`}
                  style={{
                    filter: `brightness(${config.backlightBrightness})`,
                  }}
                >
                  {/* Effet matrice de pixels */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `radial-gradient(circle, rgba(0,0,0,${config.pixelGridStrength}) 1px, transparent 1px)`,
                      backgroundSize: '4px 4px',
                    }}
                  />

                  <div className="relative z-10 text-center font-mono font-black space-y-1">
                    <div className="text-xs uppercase tracking-widest">★ TETRIS ★</div>
                    <div className="text-[10px]">SCORE: 09840</div>
                    <div className="text-[9px] opacity-75">NINTENDO 1989</div>
                  </div>
                </div>

                {/* Témoin lumineux de batterie */}
                <div className="absolute top-2 left-2 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">BATTERY</span>
                </div>
              </div>

              {/* Logo sous l'écran */}
              <div className="text-center">
                <span className="font-black italic text-xs tracking-wider text-slate-800 uppercase">
                  {config.model === 'gba_indigo' ? 'GAME BOY ADVANCE' : 'RETROMAD POCKET'}
                </span>
              </div>

              {/* Boutons et D-Pad de la coque */}
              <div className="w-full flex items-center justify-between px-2">
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-slate-500 text-xs font-black shadow">
                  ✚
                </div>
                <div className="flex space-x-2 rotate-[-25deg]">
                  <div className="w-7 h-7 rounded-full bg-purple-700 border border-slate-700 shadow flex items-center justify-center text-[10px] text-white font-bold">
                    B
                  </div>
                  <div className="w-7 h-7 rounded-full bg-purple-700 border border-slate-700 shadow flex items-center justify-center text-[10px] text-white font-bold">
                    A
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>Activez les shaders LCD sur les émulateurs portables Game Boy, Game Gear et Neo Geo.</span>
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
