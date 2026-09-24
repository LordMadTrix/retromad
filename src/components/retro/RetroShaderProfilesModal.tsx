import React, { useState } from 'react';
import { X, Tv, Sparkles, Check, Sliders, Monitor, Eye } from 'lucide-react';

export type CrtShaderProfileId = 'arcade-15khz' | 'trinitron-pvm' | 'dmg-matrix' | 'gba-tft' | 'vectrex' | 'pure';

interface ShaderPreset {
  id: CrtShaderProfileId;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  color: string;
  className: string;
}

export const SHADER_PRESETS: ShaderPreset[] = [
  {
    id: 'arcade-15khz',
    name: 'Borne Arcade CRT 15kHz',
    tagline: 'L\'expérience originale des salles d\'arcade 80/90s',
    description: 'Scanlines horizontales profondes, léger vignettage incurvé et saturation chaude du phosphore.',
    badge: 'Standard Arcade',
    color: '#00f2fe',
    className: 'shader-arcade-15khz scanlines crt-vignette',
  },
  {
    id: 'trinitron-pvm',
    name: 'Sony Trinitron PVM Broadcast',
    tagline: 'Le moniteur de référence des studios et puristes',
    description: 'Aperture Grille ultra-fine, lignes de balayage nettes et masque RGB haute fidélité.',
    badge: 'Pro Broadcast',
    color: '#a855f7',
    className: 'shader-trinitron-pvm scanlines crt-phosphor',
  },
  {
    id: 'dmg-matrix',
    name: 'Game Boy DMG-01 Original',
    tagline: 'L\'écran à cristaux liquides monochrome olive',
    description: 'Matrice de pixels 160x144, teinte verdâtre légendaire et rémanence authentique.',
    badge: 'Monochrome 1989',
    color: '#8bac0f',
    className: 'shader-dmg-matrix',
  },
  {
    id: 'gba-tft',
    name: 'Console Portable TFT / GBA',
    tagline: 'L\'affichage rétro-éclairé des portables 16/32-bit',
    description: 'Micro-grille verticale de sous-pixels avec contraste rehaussé et couleurs vibrantes.',
    badge: 'Portable 2001',
    color: '#38bdf8',
    className: 'shader-gba-tft',
  },
  {
    id: 'vectrex',
    name: 'Vectrex Phosphore Vectoriel',
    tagline: 'Tracés de faisceaux lumineux sur noir absolu',
    description: 'Lueur néon éclatante sur fond sombre inspirée des jeux vectoriels Asteroids, Tempest et Star Wars.',
    badge: 'Vector Glow',
    color: '#10b981',
    className: 'shader-vectrex',
  },
  {
    id: 'pure',
    name: 'Pixel Art Brut (Désactivé)',
    tagline: 'Affichage numérique sans filtre ni altération',
    description: 'Chaque pixel est rendu au carré avec une netteté absolue pour les écrans modernes OLED / IPS.',
    badge: 'Pixels Purs',
    color: '#94a3b8',
    className: '',
  },
];

interface RetroShaderProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: CrtShaderProfileId;
  onSelectProfile: (profileId: CrtShaderProfileId) => void;
  crtEnabled: boolean;
  onToggleCrt: () => void;
  onPlaySound?: () => void;
}

export const RetroShaderProfilesModal: React.FC<RetroShaderProfilesModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSelectProfile,
  crtEnabled,
  onToggleCrt,
  onPlaySound,
}) => {
  const [previewProfile, setPreviewProfile] = useState<CrtShaderProfileId>(currentProfile);
  const [scanlineOpacity, setScanlineOpacity] = useState<number>(80);

  if (!isOpen) return null;

  const activePreset = SHADER_PRESETS.find((p) => p.id === previewProfile) || SHADER_PRESETS[0];

  const handleApply = (profileId: CrtShaderProfileId) => {
    if (onPlaySound) onPlaySound();
    setPreviewProfile(profileId);
    onSelectProfile(profileId);
    if (!crtEnabled && profileId !== 'pure') {
      onToggleCrt();
    } else if (profileId === 'pure' && crtEnabled) {
      onToggleCrt();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-neon">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide uppercase flex items-center space-x-2">
                <span>Shaders & Filtres d'Écran Rétro</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                  Immersion 100%
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Sélectionnez le rendu authentique de votre époque préférée (Arcade, Trinitron, Game Boy, etc.)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Interrupteur On/Off général */}
            <button
              onClick={() => {
                if (onPlaySound) onPlaySound();
                onToggleCrt();
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center space-x-2 ${
                crtEnabled
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${crtEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>{crtEnabled ? 'Filtres Activés' : 'Filtres Éteints'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Fermer (Échap)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corps modal : Sélecteur gauche + Aperçu interactif droite */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Liste des profils disponibles (Colonne gauche) */}
          <div className="lg:col-span-6 p-4 sm:p-6 overflow-y-auto space-y-2.5 border-b lg:border-b-0 lg:border-r border-slate-800">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block mb-1">
              Profils Cathodiques & LCD Rétro :
            </span>

            {SHADER_PRESETS.map((preset) => {
              const isSelected = previewProfile === preset.id;
              const isCurrentApplied = currentProfile === preset.id;

              return (
                <div
                  key={preset.id}
                  onClick={() => handleApply(preset.id)}
                  style={{
                    borderColor: isSelected ? preset.color : 'rgba(51, 65, 85, 0.6)',
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 shadow-lg scale-[1.01]'
                      : 'bg-slate-800/40 hover:bg-slate-800/70 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start space-x-3 min-w-0 pr-2">
                    <div
                      style={{
                        backgroundColor: `${preset.color}25`,
                        color: preset.color,
                        borderColor: `${preset.color}60`,
                      }}
                      className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5"
                    >
                      <Monitor className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-white truncate">{preset.name}</h4>
                        <span
                          style={{ color: preset.color }}
                          className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-white/5"
                        >
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{preset.tagline}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {isCurrentApplied && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40 flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Actif</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Curseur de finesse des scanlines */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-300 font-bold flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Opacité des Scanlines & Phosphore</span>
                </span>
                <span className="font-mono text-cyan-400 font-bold">{scanlineOpacity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={scanlineOpacity}
                onChange={(e) => setScanlineOpacity(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          {/* Aperçu interactif en direct (Colonne droite) */}
          <div className="lg:col-span-6 p-4 sm:p-6 bg-slate-950 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono uppercase text-slate-400 font-bold flex items-center space-x-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Aperçu en Direct</span>
                </span>
                <span className="text-xs font-bold text-slate-300">{activePreset.name}</span>
              </div>

              {/* Cadre de l'écran avec le shader appliqué */}
              <div className="relative aspect-[4/3] w-full max-w-md mx-auto rounded-2xl bg-black border-4 border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center group">
                {/* Image démo rétro en arrière-plan */}
                <div
                  className="w-full h-full bg-cover bg-center flex flex-col justify-between p-4"
                  style={{
                    backgroundImage: 'radial-gradient(circle at center, #1e1b4b, #09090b)',
                  }}
                >
                  <div className="flex justify-between items-center text-xs font-mono font-bold text-amber-300 drop-shadow">
                    <span>SCORE: 128400</span>
                    <span>STAGE 03</span>
                  </div>

                  <div className="text-center my-auto">
                    <div className="text-2xl font-black text-white uppercase tracking-widest drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] animate-pulse">
                      RETRO ARCHIVE
                    </div>
                    <div className="text-xs font-bold text-cyan-400 mt-1">100% HARDWARE ACCURATE</div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>CREDITS: 02</span>
                    <span>INSERT COIN</span>
                  </div>
                </div>

                {/* Couche du Shader actif */}
                <div
                  style={{ opacity: scanlineOpacity / 100 }}
                  className={`absolute inset-0 pointer-events-none transition-all duration-300 ${activePreset.className}`}
                />
              </div>

              {/* Explication du profil */}
              <div className="mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <p className="font-semibold text-white mb-1 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Détail technique :</span>
                </p>
                <p>{activePreset.description}</p>
              </div>
            </div>

            {/* Bouton d'application finale */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">Touche raccourci : Alt + C</span>
              <button
                onClick={() => {
                  handleApply(previewProfile);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-neon active:scale-95"
              >
                Valider & Appliquer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
