import React, { useState, useEffect } from 'react';
import { Gamepad2, CheckCircle2, AlertCircle, RefreshCw, Zap } from 'lucide-react';

export const GamepadDiagnostics: React.FC = () => {
  const [gamepads, setGamepads] = useState<Gamepad[]>([]);
  const [selectedGamepadIndex, setSelectedGamepadIndex] = useState<number>(0);
  const [activeButtons, setActiveButtons] = useState<boolean[]>([]);
  const [axes, setAxes] = useState<number[]>([]);
  const [rumblying, setRumblying] = useState(false);

  // Polling des manettes via requestAnimationFrame
  useEffect(() => {
    let animId: number;

    const poll = () => {
      if (typeof navigator !== 'undefined' && navigator.getGamepads) {
        const rawList = Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[];
        setGamepads(rawList);

        if (rawList.length > 0) {
          const target = rawList[selectedGamepadIndex] || rawList[0];
          if (target) {
            setActiveButtons(target.buttons.map((b) => b.pressed || b.value > 0.15));
            setAxes(target.axes.map((a) => Number(a.toFixed(2))));
          }
        } else {
          setActiveButtons([]);
          setAxes([]);
        }
      }
      animId = requestAnimationFrame(poll);
    };

    animId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(animId);
  }, [selectedGamepadIndex]);

  const activeGp = gamepads[selectedGamepadIndex] || gamepads[0];

  const handleTestVibration = async () => {
    if (!activeGp) return;
    try {
      setRumblying(true);
      const vibrationActuator = (activeGp as any).vibrationActuator;
      if (vibrationActuator && typeof vibrationActuator.playEffect === 'function') {
        await vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: 400,
          weakMagnitude: 0.8,
          strongMagnitude: 1.0,
        });
      }
    } catch {
      // Vibration non supportée par cette manette
    } finally {
      setTimeout(() => setRumblying(false), 450);
    }
  };

  const buttonLabels = [
    'A / Croix (Bouton 0)',
    'B / Rond (Bouton 1)',
    'X / Carré (Bouton 2)',
    'Y / Triangle (Bouton 3)',
    'LB / L1 (Bouton 4)',
    'RB / R1 (Bouton 5)',
    'LT / L2 (Bouton 6)',
    'RT / R2 (Bouton 7)',
    'Select / Back (Bouton 8)',
    'Start / Options (Bouton 9)',
    'L3 / Stick G (Bouton 10)',
    'R3 / Stick D (Bouton 11)',
    'D-Pad Haut (Bouton 12)',
    'D-Pad Bas (Bouton 13)',
    'D-Pad Gauche (Bouton 14)',
    'D-Pad Droite (Bouton 15)',
    'Guide / Home (Bouton 16)',
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      {/* En-tête diagnostic */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Diagnostic & Testeur de Contrôleur</h3>
            <p className="text-xs text-slate-400">
              Vérifiez la détection des touches arcade, sticks analogiques et réactivité en temps réel.
            </p>
          </div>
        </div>

        {gamepads.length > 0 && (
          <div className="flex items-center space-x-2">
            <select
              value={selectedGamepadIndex}
              onChange={(e) => setSelectedGamepadIndex(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              {gamepads.map((gp, idx) => (
                <option key={gp.id + idx} value={idx}>
                  Port #{idx + 1}: {gp.id.slice(0, 30)}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleTestVibration}
              disabled={rumblying}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition flex items-center space-x-1"
              title="Tester les vibrations"
            >
              <Zap className={`w-3.5 h-3.5 ${rumblying ? 'animate-bounce text-amber-400' : ''}`} />
              <span>Vibration</span>
            </button>
          </div>
        )}
      </div>

      {gamepads.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
          <h4 className="text-sm font-bold text-white">Aucune manette détectée pour le moment</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Branchez ou allumez votre manette USB / Bluetooth, puis <strong className="text-white">pressez n'importe quel bouton</strong> pour qu'elle soit détectée par le navigateur et le système.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-[11px] text-slate-400">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>En attente de connexion USB / Bluetooth...</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Fiche Manette active */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300">Contrôleur Connecté & Actif</span>
              </div>
              <h4 className="text-sm font-mono text-white mt-0.5">{activeGp.id}</h4>
              <div className="flex items-center space-x-4 mt-1 text-[11px] text-slate-400 font-mono">
                <span>{activeGp.buttons.length} boutons</span>
                <span>•</span>
                <span>{activeGp.axes.length} axes analogiques</span>
                <span>•</span>
                <span>Mapping: {activeGp.mapping || 'Standard'}</span>
              </div>
            </div>
          </div>

          {/* Visualisation Sticks Analogiques */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Sticks Analogiques & Axes
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Stick Gauche */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-400 mb-2">Stick Gauche (X / Y)</span>
                <div className="relative w-24 h-24 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center">
                  <div className="absolute inset-x-0 top-1/2 h-[1px] bg-slate-800" />
                  <div className="absolute inset-y-0 left-1/2 w-[1px] bg-slate-800" />
                  <div
                    className="w-5 h-5 rounded-full bg-cyan-400 border border-white shadow-lg transition-transform duration-75"
                    style={{
                      transform: `translate(${(axes[0] || 0) * 36}px, ${(axes[1] || 0) * 36}px)`,
                    }}
                  />
                </div>
                <div className="mt-2 text-[10px] font-mono text-cyan-400">
                  X: {axes[0] ?? 0} | Y: {axes[1] ?? 0}
                </div>
              </div>

              {/* Stick Droit */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-400 mb-2">Stick Droit (X / Y)</span>
                <div className="relative w-24 h-24 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center">
                  <div className="absolute inset-x-0 top-1/2 h-[1px] bg-slate-800" />
                  <div className="absolute inset-y-0 left-1/2 w-[1px] bg-slate-800" />
                  <div
                    className="w-5 h-5 rounded-full bg-amber-400 border border-white shadow-lg transition-transform duration-75"
                    style={{
                      transform: `translate(${(axes[2] || 0) * 36}px, ${(axes[3] || 0) * 36}px)`,
                    }}
                  />
                </div>
                <div className="mt-2 text-[10px] font-mono text-amber-400">
                  X: {axes[2] ?? 0} | Y: {axes[3] ?? 0}
                </div>
              </div>

              {/* Gâchettes analogiques */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 sm:col-span-2 flex flex-col justify-center">
                <span className="text-[11px] font-bold text-slate-400">Gâchettes Analogiques L2 / R2</span>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
                      <span>L2 (Gâchette Gauche) :</span>
                      <span>{activeButtons[6] ? '100%' : '0%'}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 transition-all duration-75"
                        style={{ width: activeButtons[6] ? '100%' : '0%' }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
                      <span>R2 (Gâchette Droite) :</span>
                      <span>{activeButtons[7] ? '100%' : '0%'}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all duration-75"
                        style={{ width: activeButtons[7] ? '100%' : '0%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grille des Boutons Pressés en Temps Réel */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              État des Touches & Boutons Arcade
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {buttonLabels.map((label, idx) => {
                const isPressed = !!activeButtons[idx];
                return (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition ${
                      isPressed
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-neon scale-105'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isPressed ? 'bg-cyan-400 animate-ping' : 'bg-slate-700'
                      }`}
                    />
                    <span className="truncate">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
