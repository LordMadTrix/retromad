import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Gamepad2,
  Tv,
  Volume2,
  FolderOpen,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Play,
} from 'lucide-react';
import { AppSettings } from '../types';

interface QuickStartOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: Partial<AppSettings>) => void;
  onSelectTab: (tab: 'companies' | 'museum' | 'library' | 'kiosk') => void;
  onEnterKiosk: () => void;
  onPlaySound?: (type: 'move' | 'select' | 'coin' | 'launch' | 'unlock') => void;
  sampleGamesCount: number;
}

export const QuickStartOnboardingModal: React.FC<QuickStartOnboardingModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onSelectTab,
  onEnterKiosk,
  onPlaySound,
  sampleGamesCount,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedExperience, setSelectedExperience] = useState<'hub' | 'kiosk'>('hub');
  const [localSound, setLocalSound] = useState(settings.soundEnabled);
  const [localCrt, setLocalCrt] = useState(settings.crtEffect || false);
  const [localShaderProfile, setLocalShaderProfile] = useState(settings.crtShaderProfile || 'arcade-15khz');
  const [localTheme, setLocalTheme] = useState(settings.uiTheme || 'neon-dark');

  if (!isOpen) return null;

  const handleNext = () => {
    onPlaySound?.('select');
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    onPlaySound?.('move');
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    onPlaySound?.('unlock');
    try {
      localStorage.setItem('retromad_onboarding_completed', 'true');
    } catch {}

    onSaveSettings({
      soundEnabled: localSound,
      crtEffect: localCrt,
      crtShaderProfile: localShaderProfile as any,
      uiTheme: localTheme as any,
    });

    onClose();

    if (selectedExperience === 'kiosk') {
      onEnterKiosk();
    } else {
      onSelectTab('companies');
    }
  };

  return (
    <div className="retromad-modal-overlay">
      <div className="retromad-modal-card max-w-2xl max-h-[92vh]">
        {/* En-tête avec barre de progression */}
        <div className="retromad-modal-header">
          <div className="flex items-center space-x-3.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>Assistant Premier Démarrage</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Étape {currentStep}/4
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Configurez votre expérience RetroMad en moins d'une minute
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onPlaySound?.('move');
              onClose();
            }}
            className="retromad-modal-close-btn"
            title="Passer et fermer (Échap)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Indicateur d'étapes (Pills) */}
        <div className="grid grid-cols-4 gap-1 px-6 py-2 bg-slate-950/50 border-b border-slate-800/60">
          {[
            { num: 1, label: 'Mode & Thème' },
            { num: 2, label: 'Audio & CRT' },
            { num: 3, label: 'Jeux & ROMs' },
            { num: 4, label: 'Raccourcis' },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => {
                onPlaySound?.('move');
                setCurrentStep(s.num);
              }}
              className={`py-1.5 px-2 rounded-lg text-center cursor-pointer transition flex items-center justify-center space-x-1.5 ${
                currentStep === s.num
                  ? 'bg-retro-accent/20 text-retro-accent font-bold border border-retro-accent/40'
                  : currentStep > s.num
                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="text-xs font-mono font-black">{s.num}.</span>
              <span className="text-[11px] truncate hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Corps défilable */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ================= ÉTAPE 1 : CHOIX DU MODE & DU THÈME ================= */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                  1. Comment souhaitez-vous explorer vos jeux rétro ?
                </h3>
                <p className="text-xs text-slate-400">
                  Vous pourrez basculer entre ces deux modes à tout moment avec la touche <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-retro-accent font-mono border border-slate-700">K</kbd>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    onPlaySound?.('select');
                    setSelectedExperience('hub');
                  }}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                    selectedExperience === 'hub'
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(0,242,254,0.25)] text-white'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    {selectedExperience === 'hub' && (
                      <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Mode Hub & Muséum</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Idéal pour PC de bureau. Navigation par firmes, fiches historiques, jaquettes 3D, filtres par genre et gestion de collection.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onPlaySound?.('select');
                    setSelectedExperience('kiosk');
                  }}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                    selectedExperience === 'kiosk'
                      ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.25)] text-white'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                      <Tv className="w-5 h-5" />
                    </div>
                    {selectedExperience === 'kiosk' && (
                      <CheckCircle2 className="w-5 h-5 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Mode Borne Arcade (Kiosque)</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Idéal pour borne ou salon. 100% manette/stick arcade, grand écran, carrousel immersif et verrouillage sécurisé par code PIN.
                    </p>
                  </div>
                </button>
              </div>

              {/* Thème visuel */}
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-300 block mb-2">
                  Ambiance visuelle préférée :
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'neon-dark', name: 'Cyan Néon', color: '#00f2fe' },
                    { id: 'arcade', name: 'Arcade 90s', color: '#eab308' },
                    { id: 'cyberpunk', name: 'Cyberpunk Rose', color: '#ff007f' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        onPlaySound?.('move');
                        setLocalTheme(t.id as any);
                      }}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition flex items-center justify-center space-x-2 ${
                        localTheme === t.id
                          ? 'bg-slate-800 border-white text-white shadow'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                      <span>{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= ÉTAPE 2 : AUDIO & IMMERSION CRT ================= */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                  2. Audio Rétro & Shaders Cathodiques CRT
                </h3>
                <p className="text-xs text-slate-400">
                  RetroMAD intègre un synthétiseur audio Web Audio et des filtres de balayage vintage.
                </p>
              </div>

              {/* Bruitages Audio */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Volume2 className="w-5 h-5 text-retro-accent" />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Bruitages Rétro 8-Bit
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Sons de sélection, navigation et monnayeur
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSound}
                    onChange={(e) => {
                      setLocalSound(e.target.checked);
                      if (e.target.checked) onPlaySound?.('coin');
                    }}
                    className="w-5 h-5 accent-retro-accent rounded cursor-pointer"
                  />
                </div>

                {localSound && (
                  <div className="pt-2 border-t border-slate-700/40 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onPlaySound?.('move')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-bold"
                    >
                      ▶ Curseur
                    </button>
                    <button
                      type="button"
                      onClick={() => onPlaySound?.('coin')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px] font-bold"
                    >
                      🪙 Insert Coin
                    </button>
                    <button
                      type="button"
                      onClick={() => onPlaySound?.('launch')}
                      className="px-2.5 py-1 rounded-lg bg-retro-accent/20 text-retro-accent hover:bg-retro-accent/30 text-[11px] font-bold"
                    >
                      🚀 Lancement
                    </button>
                    <button
                      type="button"
                      onClick={() => onPlaySound?.('unlock')}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-[11px] font-bold"
                    >
                      🎺 Fanfare
                    </button>
                  </div>
                )}
              </div>

              {/* Filtre CRT */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Tv className="w-5 h-5 text-purple-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Filtre Écran Cathodique CRT (Scanlines)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Activez ou coupez instantanément avec la touche <kbd className="px-1 py-0.2 rounded bg-slate-800 text-purple-300 font-mono">C</kbd>
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localCrt}
                    onChange={(e) => {
                      onPlaySound?.('move');
                      setLocalCrt(e.target.checked);
                    }}
                    className="w-5 h-5 accent-purple-500 rounded cursor-pointer"
                  />
                </div>

                {localCrt && (
                  <div className="pt-2 border-t border-slate-700/40 space-y-2">
                    <span className="text-[11px] font-bold text-slate-300 block">
                      Profil d'écran :
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'arcade-15khz', label: 'Arcade 15kHz (Lignes vintage)' },
                        { id: 'trinitron-pvm', label: 'Sony Trinitron PVM (Grille fine)' },
                        { id: 'dmg-matrix', label: 'Game Boy DMG (Matrice verte)' },
                        { id: 'pure', label: 'Pixel Art Brut (Sans filtre)' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            onPlaySound?.('move');
                            setLocalShaderProfile(p.id as any);
                          }}
                          className={`p-2 rounded-xl text-[11px] font-bold border text-left transition ${
                            localShaderProfile === p.id
                              ? 'bg-purple-600/30 border-purple-400 text-purple-200'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= ÉTAPE 3 : JEUX & COLLECTION ================= */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                  3. Votre Bibliothèque de Jeux Rétro
                </h3>
                <p className="text-xs text-slate-400">
                  {sampleGamesCount} jeux cultes sont déjà préchargés et prêts pour vos parties.
                </p>
              </div>

              {/* Aperçu des jeux préchargés */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center space-x-2">
                    <FolderOpen className="w-4 h-4 text-emerald-400" />
                    <span>Titres installés & reconnus ({sampleGamesCount}) :</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Prêt pour émulation
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-300 truncate">
                    🍄 Super Mario World (SNES)
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-300 truncate">
                    🛡️ Zelda: A Link to the Past (SNES)
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-300 truncate">
                    🦔 Sonic The Hedgehog 2 (MD)
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-300 truncate">
                    ⏳ Chrono Trigger (SNES)
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-300 truncate">
                    💣 Metal Slug (Arcade)
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-300 truncate">
                    🥊 Streets of Rage 2 (MD)
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-700/40">
                  💡 Pour ajouter vos propres ROMs : glissez-déposez simplement vos fichiers <code className="text-retro-accent font-mono">.sfc</code>, <code className="text-retro-accent font-mono">.md</code>, <code className="text-retro-accent font-mono">.zip</code> directement dans la fenêtre ou utilisez le scanner de ROMs.
                </p>
              </div>
            </div>
          )}

          {/* ================= ÉTAPE 4 : RACCOURCIS INDISPENSABLES ================= */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                  4. Les Raccourcis Clés & Prise en Main
                </h3>
                <p className="text-xs text-slate-400">
                  Mémorisez ces 4 touches pour contrôler RetroMAD comme un pro :
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex items-start space-x-3">
                  <div className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono font-black text-sm">
                    F1
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Manuel & Aide PDF</h5>
                    <p className="text-[11px] text-slate-400">Ouvre le guide illustré exportable en PDF.</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 flex items-start space-x-3">
                  <div className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 font-mono font-black text-sm">
                    F11
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Plein Écran</h5>
                    <p className="text-[11px] text-slate-400">Bascule en affichage immersif sans bordure.</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/40 flex items-start space-x-3">
                  <div className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 font-mono font-black text-sm">
                    C
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Filtre CRT</h5>
                    <p className="text-[11px] text-slate-400">Active ou désactive les scanlines cathodiques.</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-start space-x-3">
                  <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-mono font-black text-sm">
                    K
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Mode Kiosque</h5>
                    <p className="text-[11px] text-slate-400">Bascule entre la vue PC et la borne arcade.</p>
                  </div>
                </div>
              </div>

              {/* Manette Arcade */}
              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center space-x-2">
                  <Gamepad2 className="w-4 h-4 text-retro-accent" />
                  <span>Quitter un jeu sur manette :</span>
                </span>
                <span className="font-bold text-amber-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  Select + Start
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Pied de modal avec boutons Précédent / Suivant / Terminer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              currentStep === 1
                ? 'opacity-40 cursor-not-allowed text-slate-600'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Précédent</span>
          </button>

          <div className="flex items-center space-x-3">
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-retro-accent hover:bg-white text-retro-900 font-black text-xs uppercase tracking-wider transition shadow-neon flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Continuer</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-retro-accent via-emerald-400 to-retro-green text-retro-900 font-black text-xs uppercase tracking-wider transition shadow-neon hover:scale-105 active:scale-95 flex items-center space-x-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Lancer RetroMAD !</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
