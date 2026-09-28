import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Delete, Gamepad2, ShieldCheck, Cpu } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

interface AdminLockScreenProps {
  correctPin: string;
  onUnlock: () => void;
  onEnterKiosk: () => void;
  soundEnabled?: boolean;
}

/**
 * Écran de verrouillage de la RÉGIE ADMIN RetroMad.
 * L'administration (ludothèque, émulateurs, BIOS, scraping, réglages…) est
 * 100 % réservée : sans code PIN, impossible d'accéder au moindre outil.
 * Le mode Kiosque (jeu) reste libre : un bouton dédié y bascule directement.
 */
export const AdminLockScreen: React.FC<AdminLockScreenProps> = ({
  correctPin,
  onUnlock,
  onEnterKiosk,
  soundEnabled = true,
}) => {
  const [pin, setPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { playSelect, playBack, playLaunch, playCoin } = useAudio(soundEnabled);

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'];
  const expectedLength = correctPin.length || 4;

  const handleKeyPress = useCallback(
    (key: string) => {
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
      setPin((prev) => (prev.length >= 6 ? prev : prev + key));
    },
    [playSelect]
  );

  // Validation automatique dès que la longueur attendue est atteinte
  useEffect(() => {
    if (pin.length < expectedLength) return;
    if (pin === correctPin) {
      playLaunch();
      onUnlock();
    } else {
      playBack();
      setErrorMessage('Code incorrect — accès régie refusé');
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
      setPin('');
    }
  }, [pin, correctPin, expectedLength, onUnlock, playLaunch, playBack]);

  // Clavier physique : chiffres, Retour arrière, Échap (C), Entrée
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleKeyPress('DEL');
      } else if (e.key === 'Escape') {
        handleKeyPress('C');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKeyPress]);

  const handleKiosk = () => {
    playCoin();
    onEnterKiosk();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center overflow-hidden select-none">
      {/* Fond rétro : grille + halos */}
      <div
        className="absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,242,254,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,254,0.22) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-retro-purple/25 blur-[110px]" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-retro-accent/20 blur-[110px]" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Carte principale */}
        <div className="bg-[#0b1024]/95 border border-cyan-500/30 rounded-3xl shadow-[0_0_60px_rgba(0,242,254,0.15)] p-8 flex flex-col items-center">
          {/* Blason */}
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-400/50 flex items-center justify-center text-cyan-300 mb-4 shadow-[0_0_25px_rgba(0,242,254,0.3)]">
            <Lock className="w-8 h-8" />
          </div>

          <h1 className="text-xl font-black text-white tracking-widest text-center">
            RÉGIE ADMIN VERROUILLÉE
          </h1>
          <p className="text-xs text-slate-400 mt-2 text-center leading-relaxed">
            L'administration du système RetroMad est réservée.
            <br />
            Saisissez le code PIN administrateur pour gérer la ludothèque,
            <br />
            les émulateurs, les BIOS et les réglages.
          </p>

          {/* Points du PIN */}
          <div
            className={`flex items-center space-x-3 my-6 transition-transform ${
              errorShake ? 'animate-bounce text-rose-500' : ''
            }`}
          >
            {Array.from({ length: expectedLength }).map((_, idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  idx < pin.length
                    ? 'bg-cyan-400 border-cyan-400 shadow-[0_0_10px_#00f2fe]'
                    : 'border-slate-600 bg-slate-800/80'
                }`}
              />
            ))}
          </div>

          {/* Message d'erreur */}
          {errorMessage && (
            <div className="flex items-center space-x-1.5 text-rose-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Pavé numérique */}
          <div className="grid grid-cols-3 gap-2.5 w-full max-w-[260px]">
            {keys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleKeyPress(key)}
                className="h-12 rounded-xl bg-slate-800/80 border border-slate-600/60 text-lg font-bold text-slate-100 hover:bg-cyan-500/20 hover:border-cyan-400/60 hover:text-white active:scale-95 transition flex items-center justify-center"
                title={key === 'C' ? 'Effacer tout' : key === 'DEL' ? 'Corriger' : key}
              >
                {key === 'DEL' ? <Delete className="w-5 h-5" /> : key}
              </button>
            ))}
          </div>

          {/* Accès direct Kiosque */}
          <button
            type="button"
            onClick={handleKiosk}
            className="mt-6 w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(251,191,36,0.35)] hover:brightness-110 active:scale-[0.98] transition"
            title="Laisser la régie verrouillée et jouer en mode Kiosque"
          >
            <Gamepad2 className="w-5 h-5" />
            <span>Jouer en mode Kiosque (libre)</span>
          </button>

          <p className="text-[10px] text-slate-500 mt-4 flex items-center gap-1.5 text-center">
            <Cpu className="w-3 h-3" />
            Le PIN est modifiable dans Centre Admin → Borne d'arcade (défaut : 1234)
          </p>
        </div>
      </div>
    </div>
  );
};
