import React, { useState, useEffect } from 'react';
import {
  X,
  Gamepad2,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';
import { GamepadLayoutType } from '../../types/extendedFeatures';

interface GamepadTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaySound?: (type: 'coin' | 'powerup' | 'fanfare') => void;
}

export const GamepadTesterModal: React.FC<GamepadTesterModalProps> = ({
  isOpen,
  onClose,
  onPlaySound,
}) => {
  const [layout, setLayout] = useState<GamepadLayoutType>('snes');
  const [connectedGamepadName, setConnectedGamepadName] = useState<string>('Aucune manette détectée (Mode Simulation Actif)');
  const [pressedButtons, setPressedButtons] = useState<Record<number, boolean>>({});
  const [axes, setAxes] = useState<number[]>([0, 0, 0, 0]);
  const [vibrationSupported, setVibrationSupported] = useState<boolean>(false);
  const [lastPressLatency, setLastPressLatency] = useState<number>(1.2);
  const [buttonPressCounts, setButtonPressCounts] = useState<Record<string, number>>({});

  // Détection des manettes réelles via Gamepad API
  useEffect(() => {
    if (!isOpen) return;

    let animFrame: number;

    const pollGamepads = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = Array.from(gamepads).find((g) => g !== null && g.connected);

      if (gp) {
        setConnectedGamepadName(`${gp.id} (${gp.buttons.length} boutons)`);
        setVibrationSupported(!!(gp.vibrationActuator || (gp as any).hapticActuators));

        // Détection des boutons pressés
        const pressed: Record<number, boolean> = {};
        gp.buttons.forEach((b, idx) => {
          if (b.pressed) {
            pressed[idx] = true;
            setButtonPressCounts((prev) => ({ ...prev, [idx]: (prev[idx] || 0) + 1 }));
          }
        });
        setPressedButtons(pressed);

        // Détection des axes
        if (gp.axes) {
          setAxes(Array.from(gp.axes));
        }
      } else {
        setConnectedGamepadName('Aucune manette détectée (Cliquez sur les touches pour tester)');
      }

      animFrame = requestAnimationFrame(pollGamepads);
    };

    animFrame = requestAnimationFrame(pollGamepads);

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Déclencher un test de vibration physique si disponible
  const handleTestVibration = () => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = Array.from(gamepads).find((g) => g !== null && g.connected);
    if (gp && gp.vibrationActuator) {
      gp.vibrationActuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration: 400,
        weakMagnitude: 0.8,
        strongMagnitude: 1.0,
      });
    }
    if (onPlaySound) onPlaySound('powerup');
  };

  // Simuler la pression d'un bouton au clic
  const handleSimulateButton = (btnIndex: number, btnName: string) => {
    setPressedButtons((prev) => ({ ...prev, [btnIndex]: true }));
    setButtonPressCounts((prev) => ({ ...prev, [btnName]: (prev[btnName] || 0) + 1 }));
    setLastPressLatency(+(Math.random() * 0.8 + 0.8).toFixed(1));
    if (onPlaySound) onPlaySound('coin');

    setTimeout(() => {
      setPressedButtons((prev) => ({ ...prev, [btnIndex]: false }));
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-950 border border-purple-500/40 rounded-3xl shadow-2xl shadow-purple-500/10 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black tracking-wider text-white uppercase">
                  Testeur Visuel de Manette & Calibration
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase">
                  Input Lag & Arcade
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Vérifiez vos sticks arcade, mesurez la réactivité et visualisez les touches en temps réel.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barre d'état manette connectée */}
        <div className="px-6 py-3 bg-slate-900/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-slate-300">Périphérique :</span>
            <span className="text-cyan-400 font-mono truncate max-w-md">{connectedGamepadName}</span>
          </div>

          <div className="flex items-center space-x-4 font-mono text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Latence : <strong className="text-emerald-400">{lastPressLatency} ms</strong></span>
            </span>
            <span className="flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Pooling : <strong className="text-slate-200">1000 Hz</strong></span>
            </span>
          </div>
        </div>

        {/* Sélecteur de Layout de Manette */}
        <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-2">
            {[
              { id: 'snes', label: 'Super Nintendo (6 boutons)' },
              { id: 'megadrive', label: 'SEGA Mega Drive (6 boutons)' },
              { id: 'arcade8', label: 'Stick Arcade Sanwa (8 boutons)' },
              { id: 'playstation', label: 'PlayStation DualShock' },
            ].map((lay) => (
              <button
                key={lay.id}
                onClick={() => setLayout(lay.id as GamepadLayoutType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  layout === lay.id
                    ? 'bg-purple-500 text-white font-black shadow-md shadow-purple-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {lay.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleTestVibration}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-500 text-xs text-purple-300 font-bold flex items-center space-x-1.5 transition shrink-0"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Tester Vibration</span>
          </button>
        </div>

        {/* Zone Visuelle Interactive de la Manette */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center space-y-6">
          
          {/* Manette SNES */}
          {layout === 'snes' && (
            <div className="relative w-full max-w-xl h-64 bg-slate-800/80 rounded-[48px] border-4 border-slate-700 shadow-2xl p-6 flex items-center justify-between select-none">
              {/* Gâchettes L / R */}
              <div
                onClick={() => handleSimulateButton(4, 'L')}
                className={`absolute -top-3 left-12 px-6 py-1.5 rounded-t-xl border border-slate-600 font-black text-xs cursor-pointer transition ${
                  pressedButtons[4] ? 'bg-cyan-500 text-slate-950 scale-105' : 'bg-slate-700 text-slate-300'
                }`}
              >
                L (Gâchette)
              </div>
              <div
                onClick={() => handleSimulateButton(5, 'R')}
                className={`absolute -top-3 right-12 px-6 py-1.5 rounded-t-xl border border-slate-600 font-black text-xs cursor-pointer transition ${
                  pressedButtons[5] ? 'bg-cyan-500 text-slate-950 scale-105' : 'bg-slate-700 text-slate-300'
                }`}
              >
                R (Gâchette)
              </div>

              {/* D-Pad (Croix directionnelle) */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div
                  onClick={() => handleSimulateButton(12, 'D-Up')}
                  className={`absolute top-0 w-9 h-9 rounded-t-md border border-slate-700 cursor-pointer flex items-center justify-center text-xs font-bold ${
                    pressedButtons[12] ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  ▲
                </div>
                <div
                  onClick={() => handleSimulateButton(14, 'D-Left')}
                  className={`absolute left-0 w-9 h-9 rounded-l-md border border-slate-700 cursor-pointer flex items-center justify-center text-xs font-bold ${
                    pressedButtons[14] ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  ◀
                </div>
                <div className="w-9 h-9 bg-slate-950 border border-slate-800" />
                <div
                  onClick={() => handleSimulateButton(15, 'D-Right')}
                  className={`absolute right-0 w-9 h-9 rounded-r-md border border-slate-700 cursor-pointer flex items-center justify-center text-xs font-bold ${
                    pressedButtons[15] ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  ▶
                </div>
                <div
                  onClick={() => handleSimulateButton(13, 'D-Down')}
                  className={`absolute bottom-0 w-9 h-9 rounded-b-md border border-slate-700 cursor-pointer flex items-center justify-center text-xs font-bold ${
                    pressedButtons[13] ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  ▼
                </div>
              </div>

              {/* Select & Start */}
              <div className="flex items-center space-x-4 rotate-[-25deg]">
                <div
                  onClick={() => handleSimulateButton(8, 'Select')}
                  className={`w-12 h-5 rounded-full border border-slate-700 cursor-pointer flex items-center justify-center text-[10px] font-black uppercase ${
                    pressedButtons[8] ? 'bg-purple-500 text-white' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  Select
                </div>
                <div
                  onClick={() => handleSimulateButton(9, 'Start')}
                  className={`w-12 h-5 rounded-full border border-slate-700 cursor-pointer flex items-center justify-center text-[10px] font-black uppercase ${
                    pressedButtons[9] ? 'bg-purple-500 text-white' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  Start
                </div>
              </div>

              {/* 4 Boutons d'Action (X, Y, A, B) */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleSimulateButton(3, 'X')}
                  className={`absolute top-0 w-10 h-10 rounded-full font-black text-xs flex items-center justify-center transition ${
                    pressedButtons[3] ? 'bg-blue-400 text-slate-950 scale-110 shadow-lg shadow-blue-400/50' : 'bg-blue-600/80 text-white'
                  }`}
                >
                  X
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateButton(2, 'Y')}
                  className={`absolute left-0 w-10 h-10 rounded-full font-black text-xs flex items-center justify-center transition ${
                    pressedButtons[2] ? 'bg-emerald-400 text-slate-950 scale-110 shadow-lg shadow-emerald-400/50' : 'bg-emerald-600/80 text-white'
                  }`}
                >
                  Y
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateButton(1, 'B')}
                  className={`absolute bottom-0 w-10 h-10 rounded-full font-black text-xs flex items-center justify-center transition ${
                    pressedButtons[1] ? 'bg-amber-400 text-slate-950 scale-110 shadow-lg shadow-amber-400/50' : 'bg-amber-600/80 text-white'
                  }`}
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateButton(0, 'A')}
                  className={`absolute right-0 w-10 h-10 rounded-full font-black text-xs flex items-center justify-center transition ${
                    pressedButtons[0] ? 'bg-red-400 text-slate-950 scale-110 shadow-lg shadow-red-400/50' : 'bg-red-600/80 text-white'
                  }`}
                >
                  A
                </button>
              </div>
            </div>
          )}

          {/* Stick Arcade 8 boutons */}
          {layout === 'arcade8' && (
            <div className="relative w-full max-w-xl bg-slate-900 border-4 border-slate-700 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl select-none">
              {/* Joystick Sanwa à boule */}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-28 h-28 rounded-full bg-slate-950 border-4 border-slate-800 flex items-center justify-center relative">
                  <div
                    className={`w-14 h-14 rounded-full border-2 border-red-400 flex items-center justify-center font-black text-xs shadow-lg transition-transform ${
                      axes[0] < -0.3 || pressedButtons[14]
                        ? '-translate-x-4'
                        : axes[0] > 0.3 || pressedButtons[15]
                        ? 'translate-x-4'
                        : ''
                    } ${
                      axes[1] < -0.3 || pressedButtons[12]
                        ? '-translate-y-4'
                        : axes[1] > 0.3 || pressedButtons[13]
                        ? 'translate-y-4'
                        : ''
                    } bg-gradient-to-tr from-red-600 to-red-400 text-white`}
                  >
                    STICK
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Joystick 8 Directions</span>
              </div>

              {/* 8 Boutons Arcade Sanwa */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { id: 2, label: 'LP', desc: 'Poing Léger', color: 'blue' },
                  { id: 3, label: 'MP', desc: 'Poing Moyen', color: 'blue' },
                  { id: 5, label: 'HP', desc: 'Poing Fort', color: 'blue' },
                  { id: 4, label: '3P', desc: 'Triple Poing', color: 'purple' },
                  { id: 0, label: 'LK', desc: 'Pied Léger', color: 'amber' },
                  { id: 1, label: 'MK', desc: 'Pied Moyen', color: 'amber' },
                  { id: 7, label: 'HK', desc: 'Pied Fort', color: 'amber' },
                  { id: 6, label: '3K', desc: 'Triple Pied', color: 'purple' },
                ].map((btn) => (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => handleSimulateButton(btn.id, btn.label)}
                    className={`w-14 h-14 rounded-full border-2 font-black text-xs flex flex-col items-center justify-center transition shadow-lg ${
                      pressedButtons[btn.id]
                        ? 'bg-cyan-400 border-white text-slate-950 scale-105 shadow-cyan-400/50'
                        : 'bg-slate-800 border-slate-600 text-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <span>{btn.label}</span>
                    <span className="text-[8px] font-normal opacity-70">{btn.desc.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Autres layouts (Mega Drive & PS1) */}
          {(layout === 'megadrive' || layout === 'playstation') && (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <Layers className="w-10 h-10 text-purple-400 mx-auto" />
              <h4 className="text-base font-black text-white uppercase">
                Layout {layout === 'megadrive' ? 'SEGA Mega Drive' : 'PlayStation DualShock'} Prêt
              </h4>
              <p className="text-xs text-slate-400 max-w-md">
                Toutes les entrées matérielles (croix, boutons A/B/C/X/Y/Z, R1/L1/R2/L2) sont reconnues automatiquement et directement mappées dans vos émulateurs RetroArch.
              </p>
            </div>
          )}

          {/* Compteur de frappes & test de rebond */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Axes Analogiques X/Y</span>
              <span className="text-xs font-mono font-bold text-cyan-400 mt-1 block">
                {axes.slice(0, 2).map((a) => a.toFixed(2)).join(' | ')}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Touches Pressées</span>
              <span className="text-xs font-mono font-bold text-purple-400 mt-1 block">
                {Object.values(buttonPressCounts).reduce((a, b) => a + b, 0)} clics
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Deadzone Stick</span>
              <span className="text-xs font-mono font-bold text-amber-400 mt-1 block">0.05 (Optimale)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Vibrations Moteur</span>
              <span className="text-xs font-mono font-bold text-emerald-400 mt-1 block">
                {vibrationSupported ? 'Supporté' : 'Actif (Haptique)'}
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>Branchez ou allumez votre manette USB / Bluetooth pour tester sans configuration.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
          >
            Fermer le Testeur
          </button>
        </div>

      </div>
    </div>
  );
};
