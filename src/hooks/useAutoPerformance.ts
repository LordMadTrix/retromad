import { useState, useEffect, useRef } from 'react';

/**
 * Surveille la fluidité (FPS moyens) et bascule automatiquement en
 * "mode performance" si le rendu reste faible plusieurs secondes.
 * Utilisé par App.tsx pour couper vidéos/halos/animations quand la
 * machine sature (petit PC, VM, borne fanless, navigateur sans GPU).
 */
export function useAutoPerformance(thresholdFps = 30, sampleMs = 4000) {
  const [lowPerformance, setLowPerformance] = useState(false);
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem('retromad_auto_performance') !== 'false';
    } catch {
      return true;
    }
  });
  const framesRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lowStreakRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    let last = performance.now();
    let start = last;

    const tick = (now: number) => {
      framesRef.current++;
      if (now - start >= sampleMs) {
        const fps = (framesRef.current * 1000) / (now - start);
        framesRef.current = 0;
        start = now;

        if (fps < thresholdFps) {
          lowStreakRef.current++;
          // 2 échantillons consécutifs faibles (~8s) -> mode performance
          if (lowStreakRef.current >= 2) {
            setLowPerformance(true);
          }
        } else {
          lowStreakRef.current = 0;
          // Ne réactive pas automatiquement (évite les oscillations) :
          // l'utilisateur peut réactiver les effets dans les réglages.
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled, thresholdFps, sampleMs]);

  const setAutoEnabled = (on: boolean) => {
    setEnabled(on);
    try {
      localStorage.setItem('retromad_auto_performance', on ? 'true' : 'false');
    } catch {
      /* noop */
    }
    if (!on) setLowPerformance(false);
  };

  const resetLowPerformance = () => {
    lowStreakRef.current = 0;
    setLowPerformance(false);
  };

  return { lowPerformance, autoEnabled: enabled, setAutoEnabled, resetLowPerformance };
}
