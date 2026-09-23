import React, { useState } from 'react';
import {
  X,
  Monitor,
  Projector,
  Sliders,
  RotateCw,
  Eye,
  Play,
} from 'lucide-react';
import { Game, System } from '../../types';

interface ProjectorKioskManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  systems: System[];
  isKioskActive: boolean;
  onToggleKioskOnProjector: (enable: boolean) => void;
  onLaunchGame?: (game: Game) => void;
  onPlaySound?: (type: 'coin' | 'powerup' | 'fanfare') => void;
}

export interface ProjectorSettings {
  targetScreenIndex: number;
  aspectRatio: '16:9' | '4:3' | '16:10' | 'stretch';
  keystoneVertical: number; // -15 to +15 deg
  keystoneHorizontal: number; // -15 to +15 deg
  cinemaDarkBoost: boolean;
  brightness: number; // 80 to 120%
  contrast: number; // 90 to 140%
  marqueeText: string;
  autoAttractOnProjector: boolean;
  dualControlMode: boolean; // PC controls, Projector displays
}

const DEFAULT_SETTINGS: ProjectorSettings = {
  targetScreenIndex: 1,
  aspectRatio: '16:9',
  keystoneVertical: 0,
  keystoneHorizontal: 0,
  cinemaDarkBoost: true,
  brightness: 105,
  contrast: 115,
  marqueeText: 'SALLE D\'ARCADE RÉTROMAD • GRAND ÉCRAN',
  autoAttractOnProjector: true,
  dualControlMode: true,
};

export const ProjectorKioskManagerModal: React.FC<ProjectorKioskManagerModalProps> = ({
  isOpen,
  onClose,
  games,
  systems,
  isKioskActive,
  onToggleKioskOnProjector,
  onLaunchGame,
  onPlaySound,
}) => {
  const [settings, setSettings] = useState<ProjectorSettings>(() => {
    try {
      const stored = localStorage.getItem('retromad_projector_settings');
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [detectedScreens, setDetectedScreens] = useState<
    Array<{ id: string; name: string; width: number; height: number; isPrimary: boolean }>
  >([
    { id: 'screen-1', name: 'Écran 1 (Principal - Moniteur PC)', width: 1920, height: 1080, isPrimary: true },
    { id: 'screen-2', name: 'Écran 2 (Rétroprojecteur / HDMI)', width: 1920, height: 1080, isPrimary: false },
  ]);

  const [isDetecting, setIsDetecting] = useState(false);
  const [isProjectorKioskRunning, setIsProjectorKioskRunning] = useState(false);
  const [previewGameId] = useState<string>(games[0]?.id || '');

  // Sauvegarde des préférences
  const handleUpdateSetting = <K extends keyof ProjectorSettings>(key: K, value: ProjectorSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem('retromad_projector_settings', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Détection des écrans réels avec l'API Window Management si disponible
  const handleDetectScreens = async () => {
    setIsDetecting(true);
    if (onPlaySound) onPlaySound('coin');

    try {
      if ('getScreenDetails' in window) {
        const screenDetails = await (window as any).getScreenDetails();
        if (screenDetails && screenDetails.screens) {
          const screens = screenDetails.screens.map((s: any, idx: number) => ({
            id: `screen-${idx + 1}`,
            name: s.isPrimary ? `Écran ${idx + 1} (Principal PC)` : `Écran ${idx + 1} (Rétroprojecteur / Externe)`,
            width: s.width || 1920,
            height: s.height || 1080,
            isPrimary: !!s.isPrimary,
          }));
          setDetectedScreens(screens);
        }
      }
    } catch {
      // Fallback gracieux vers les écrans configurés
    } finally {
      setTimeout(() => setIsDetecting(false), 500);
    }
  };

  const handleStartProjection = () => {
    setIsProjectorKioskRunning(true);
    onToggleKioskOnProjector(true);
    if (onPlaySound) onPlaySound('fanfare');

    // Diffusion via BroadcastChannel pour synchronisation multi-onglets/écrans
    try {
      const bc = new BroadcastChannel('retromad_projector_sync');
      bc.postMessage({
        type: 'START_PROJECTOR_KIOSK',
        settings,
        gameId: previewGameId,
      });
    } catch {}
  };

  const handleStopProjection = () => {
    setIsProjectorKioskRunning(false);
    onToggleKioskOnProjector(false);
    if (onPlaySound) onPlaySound('coin');

    try {
      const bc = new BroadcastChannel('retromad_projector_sync');
      bc.postMessage({ type: 'STOP_PROJECTOR_KIOSK' });
    } catch {}
  };

  const selectedPreviewGame = games.find((g) => g.id === previewGameId) || games[0];
  const previewCover =
    selectedPreviewGame?.media?.boxart3d ||
    selectedPreviewGame?.media?.boxart2d ||
    selectedPreviewGame?.media?.snap;
  const previewSystemName =
    systems.find((s) => s.id === selectedPreviewGame?.systemId)?.name ||
    selectedPreviewGame?.systemId ||
    'Arcade';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#09101f] border border-cyan-500/40 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[0_10px_50px_rgba(6,182,212,0.3)] overflow-hidden text-slate-200">
        
        {/* En-tête Rétroprojecteur & Double Écran */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/20 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 shadow-inner">
              <Projector className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-white font-sans tracking-wide">
                  Mode Kiosque sur 2ème Écran & Rétroprojecteur
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
                  Dual-Display Cinema
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Projetez le Kiosque Arcade en plein écran sur votre rétroprojecteur ou TV pendant que vous pilotez depuis votre PC
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps du gestionnaire de projection */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* SECTION 1 : BANDEAU D'ÉTAT & SÉLECTION DE L'ÉCRAN CIBLE */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-cyan-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono text-cyan-400 font-bold uppercase">
                  Configuration Écrans Détectée
                </div>
                <div className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Écran Principal (PC)</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-cyan-300">Écran 2 (Rétroprojecteur)</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  {detectedScreens.map((sc, idx) => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => handleUpdateSetting('targetScreenIndex', idx)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                        settings.targetScreenIndex === idx
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {sc.name} ({sc.width}×{sc.height})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDetectScreens}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-1.5 border border-slate-700 transition"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
                <span>Détecter les Écrans</span>
              </button>

              {!isProjectorKioskRunning ? (
                <button
                  type="button"
                  onClick={handleStartProjection}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-lg shadow-cyan-500/30 transition active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>ACTIVER SUR LE PROJECTEUR</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopProjection}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition"
                >
                  <X className="w-4 h-4" />
                  <span>DÉCONNECTER LE PROJECTEUR</span>
                </button>
              )}
            </div>
          </div>

          {/* SECTION 2 : ÉCRANS ET ARCHITECTURE DOUBLE ÉCRAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Écran 1 : Console Régie / PC */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Monitor className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-xs text-white">Écran 1 • Console de Contrôle (Votre PC)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                    RÉGIE / MAÎTRE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  Vous gardez l'accès complet à RetroMAD : recherche de jeux, configuration des boutons, triche,
                  et lancement en 1 clic sans perturber les spectateurs devant le projecteur.
                </p>
                <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div className="flex justify-between font-mono">
                    <span>Résolution PC :</span>
                    <strong className="text-white">1920 × 1080 (60 Hz)</strong>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Rôle :</span>
                    <strong className="text-purple-300">Navigation & Pilote</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Mode Régie Double-Écran :</span>
                <span className="text-green-400 font-bold font-mono">ACTIF</span>
              </div>
            </div>

            {/* Écran 2 : Rétroprojecteur / Affichage Kiosque */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Projector className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-xs text-white">Écran 2 • Rétroprojecteur (Kiosque Plein Écran)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                    SPECTATEURS / PROJECTION
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  Affiche l'interface Arcade Kiosque géante, les jaquettes HD animées, l'Attract Mode et le
                  gameplay en grand format cinéma pour les joueurs et le public.
                </p>
                <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div className="flex justify-between font-mono">
                    <span>Sortie HDMI / DisplayPort :</span>
                    <strong className="text-cyan-300">Rétroprojecteur Salle</strong>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Aspect Ratio Projeté :</span>
                    <strong className="text-white">{settings.aspectRatio}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">État du projecteur :</span>
                <span className={`font-mono font-bold ${isProjectorKioskRunning ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`}>
                  {isProjectorKioskRunning ? 'PROJECTION EN COURS' : 'PRÊT À PROJETER'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3 : RÉGLAGES & CALIBRATION DU RÉTROPROJECTEUR */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">
                  Calibration & Optimisations Cinéma Rétroprojecteur
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Ajustements Spécifiques Vidéoprojecteur</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              
              {/* Réglage 1 : Ratio d'aspect */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Format d'Image Rétroprojecteur :</label>
                <select
                  value={settings.aspectRatio}
                  onChange={(e) => handleUpdateSetting('aspectRatio', e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                >
                  <option value="16:9">16:9 (Plein Écran Vidéoprojecteur Standard)</option>
                  <option value="4:3">4:3 (Format Pur Arcade Rétro / Bezels)</option>
                  <option value="16:10">16:10 (Format Projecteur Bureautique / Salle)</option>
                  <option value="stretch">Étiré Pleine Toile</option>
                </select>
              </div>

              {/* Réglage 2 : Keystone / Trapèze Vertical */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-slate-400 font-bold">Trapèze / Keystone Vertical :</label>
                  <span className="text-cyan-300 font-mono">{settings.keystoneVertical}°</span>
                </div>
                <input
                  type="range"
                  min="-15"
                  max="15"
                  value={settings.keystoneVertical}
                  onChange={(e) => handleUpdateSetting('keystoneVertical', parseInt(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Compense un projecteur placé au plafond ou en bas</span>
              </div>

              {/* Réglage 3 : Contraste Salle Obscure */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-slate-400 font-bold">Contraste Salle Obscure :</label>
                  <span className="text-cyan-300 font-mono">{settings.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="140"
                  value={settings.contrast}
                  onChange={(e) => handleUpdateSetting('contrast', parseInt(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Renforce les noirs sur toile de projection</span>
              </div>
            </div>

            {/* Message de bienvenue / Marquee défilant projeté */}
            <div className="pt-3 border-t border-slate-800">
              <label className="text-slate-400 text-xs font-bold block mb-1.5">
                Bandeau Défilant Projeté au Bas de l'Écran (Marquee) :
              </label>
              <input
                type="text"
                value={settings.marqueeText}
                onChange={(e) => handleUpdateSetting('marqueeText', e.target.value)}
                placeholder="Ex: BIENVENUE DANS LA SALLE D'ARCADE DE SÉBASTIEN"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* SECTION 4 : SIMULATEUR DE PROJECTION EN DIRECT */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-xs text-white">Aperçu en Direct de la Toile de Projection</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Projection simulée avec calibration
              </div>
            </div>

            {/* Toile de projection virtuelle */}
            <div className="w-full aspect-[16/9] max-h-56 bg-black rounded-xl border-2 border-slate-700 relative overflow-hidden flex flex-col items-center justify-between p-4 shadow-2xl">
              {/* Effet toile cinéma et keystone */}
              <div
                className="w-full h-full absolute inset-0 transition-transform duration-200 pointer-events-none flex flex-col justify-between p-4"
                style={{
                  transform: `perspective(600px) rotateX(${settings.keystoneVertical * 0.8}deg)`,
                  filter: `contrast(${settings.contrast}%) brightness(${settings.brightness}%)`,
                }}
              >
                {/* Header projeté */}
                <div className="flex justify-between items-center text-[10px] font-mono text-cyan-400 font-bold border-b border-cyan-500/30 pb-1">
                  <span>RETROMAD • PROJECTION 2ÈME ÉCRAN</span>
                  <span>KIOSQUE ACTIF</span>
                </div>

                {/* Jeu projeté */}
                <div className="flex items-center space-x-4 my-auto">
                  {previewCover ? (
                    <img
                      src={previewCover}
                      alt={selectedPreviewGame.title}
                      className="w-16 h-20 object-cover rounded-lg border border-cyan-500/50 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-20 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-xs">
                      ROM
                    </div>
                  )}
                  <div>
                    <div className="text-base font-black text-white">{selectedPreviewGame.title}</div>
                    <div className="text-xs text-cyan-300 font-mono">
                      {previewSystemName}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      1-2 Joueurs • Démonstration Borne d'Arcade
                    </div>
                  </div>
                </div>

                {/* Marquee défilant en bas de la toile */}
                <div className="w-full bg-cyan-950/80 border-t border-cyan-500/40 py-1 px-2 text-[10px] font-mono text-cyan-300 tracking-wider truncate text-center">
                  ★ {settings.marqueeText} ★
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pied de page avec actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
            <span>Branchez HDMI ou Chromecast avant d'activer.</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="font-mono text-cyan-400">
              Kiosque : {isKioskActive ? 'BORNE ACTIVE' : 'RÉGIE PC'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {onLaunchGame && selectedPreviewGame && (
              <button
                type="button"
                onClick={() => {
                  onLaunchGame(selectedPreviewGame);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-purple-600/80 hover:bg-purple-500 text-white font-bold transition"
              >
                Tester ce jeu
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={handleStartProjection}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase tracking-wider transition shadow-md shadow-cyan-500/30"
            >
              Lancer la Projection Kiosque
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
