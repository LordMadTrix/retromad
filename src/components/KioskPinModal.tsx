import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Lock, Delete, X, ShieldAlert } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

interface KioskPinModalProps {
  isOpen: boolean;
  correctPin: string;
  onSuccess: () => void;
  onClose: () => void;
  soundEnabled?: boolean;
}

export const KioskPinModal: React.FC<KioskPinModalProps> = ({
  isOpen,
  correctPin,
  onSuccess,
  onClose,
  soundEnabled = true,
}) => {
  const [pin, setPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [focusedKeyIndex, setFocusedKeyIndex] = useState(0); // For gamepad navigation

  const { playSelect, playBack, playLaunch } = useAudio(soundEnabled);

  // Pavé numérique : 1 à 9, puis Clear ('C'), 0, Backspace ('DEL')
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'];

  const handleKeyPress = useCallback((key: string) => {
    playSelect();
    setErrorMessage('');

    if (key === 'C') {
      setPin('');
      return;
    }

    if (key === 'DEL') {
      setPin((prev) => prev.slice(0, -1));
      return;
    }

    setPin((prev) => {
      if (prev.length >= 6) return prev;
      return prev + key;
    });
  }, [playSelect]);

  // Validation automatique dès que la longueur du PIN attendu est atteinte
  useEffect(() => {
    if (!isOpen) {
      setPin('');
      setErrorMessage('');
      setErrorShake(false);
      return;
    }

    const expectedLength = correctPin.length || 4;
    if (pin.length >= expectedLength) {
      if (pin === correctPin) {
        playLaunch();
        onSuccess();
      } else {
        playBack();
        setErrorShake(true);
        setErrorMessage('Code PIN incorrect. Veuillez réessayer.');
        setTimeout(() => {
          setPin('');
          setErrorShake(false);
        }, 800);
      }
    }
  }, [pin, correctPin, isOpen, onSuccess, playLaunch, playBack]);

  // Saisie au clavier physique
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleKeyPress('DEL');
      } else if (e.key === 'Escape') {
        playBack();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyPress, onClose, playBack]);

  // Support Gamepad dans la modale PIN
  const lastStateRef = useRef<Record<string, boolean>>({});
  useEffect(() => {
    if (!isOpen) return;

    let animId: number;

    const checkGamepad = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads.find((g) => g && g.connected);

      if (gp) {
        const trigger = (name: string, pressed: boolean, action: () => void) => {
          const wasPressed = !!lastStateRef.current[name];
          if (pressed && !wasPressed) {
            action();
          }
          lastStateRef.current[name] = pressed;
        };

        const dpadUp = gp.buttons[12]?.pressed || gp.axes[1] < -0.5;
        const dpadDown = gp.buttons[13]?.pressed || gp.axes[1] > 0.5;
        const dpadLeft = gp.buttons[14]?.pressed || gp.axes[0] < -0.5;
        const dpadRight = gp.buttons[15]?.pressed || gp.axes[0] > 0.5;

        trigger('up', dpadUp, () => {
          setFocusedKeyIndex((prev) => Math.max(0, prev - 3));
        });
        trigger('down', dpadDown, () => {
          setFocusedKeyIndex((prev) => Math.min(keys.length - 1, prev + 3));
        });
        trigger('left', dpadLeft, () => {
          setFocusedKeyIndex((prev) => Math.max(0, prev - 1));
        });
        trigger('right', dpadRight, () => {
          setFocusedKeyIndex((prev) => Math.min(keys.length - 1, prev + 1));
        });

        // A / Bouton 0 : Valider la touche sélectionnée
        trigger('confirm', !!gp.buttons[0]?.pressed, () => {
          handleKeyPress(keys[focusedKeyIndex]);
        });

        // B / Bouton 1 : Annuler ou effacer
        trigger('cancel', !!gp.buttons[1]?.pressed, () => {
          if (pin.length > 0) {
            handleKeyPress('DEL');
          } else {
            playBack();
            onClose();
          }
        });
      }

      animId = requestAnimationFrame(checkGamepad);
    };

    animId = requestAnimationFrame(checkGamepad);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, keys, focusedKeyIndex, handleKeyPress, pin.length, onClose, playBack]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-retro-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 flex flex-col items-center">
        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cadenas et Titre */}
        <div className="w-14 h-14 rounded-2xl bg-retro-accent/20 border border-retro-accent/40 flex items-center justify-center text-retro-accent mb-3 shadow-neon">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="text-base font-bold text-white tracking-wide">
          Déverrouillage Administration
        </h3>
        <p className="text-xs text-slate-400 mt-1 text-center">
          Entrez votre code PIN à 4 chiffres (défaut : 1234)
        </p>

        {/* Indicateurs de code (Dots) */}
        <div
          className={`flex items-center space-x-3 my-5 transition-transform ${
            errorShake ? 'animate-bounce text-rose-500' : ''
          }`}
        >
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                idx < pin.length
                  ? 'bg-retro-accent border-retro-accent shadow-[0_0_10px_#00f2fe]'
                  : 'border-slate-600 bg-slate-800/80'
              }`}
            />
          ))}
        </div>

        {/* Message d'erreur */}
        {errorMessage && (
          <div className="flex items-center space-x-1.5 text-rose-400 text-xs font-semibold mb-3">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Pavé numérique tactile & manette */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-xs mb-3">
          {keys.map((key, index) => {
            const isFocused = focusedKeyIndex === index;
            const isSpecial = key === 'C' || key === 'DEL';

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleKeyPress(key)}
                className={`h-12 rounded-xl text-base font-black flex items-center justify-center transition-all ${
                  isFocused
                    ? 'ring-2 ring-retro-accent bg-slate-700 text-white shadow-neon scale-105'
                    : isSpecial
                    ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60'
                    : 'bg-slate-800 hover:bg-slate-700/90 text-slate-100 hover:text-white border border-slate-700'
                }`}
              >
                {key === 'DEL' ? <Delete className="w-5 h-5" /> : key}
              </button>
            );
          })}
        </div>

        {/* Conseils Manette & Clavier */}
        <div className="text-[10px] text-slate-500 flex items-center space-x-2 mt-1">
          <span>Manette : D-Pad + A pour saisir • B pour retour</span>
        </div>
      </div>
    </div>
  );
};
