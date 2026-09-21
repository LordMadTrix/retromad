import { useCallback, useRef, useEffect, useState } from 'react';

// Notes en Hz pour l'arpégiateur chiptune d'ambiance arcade
const BGM_PATTERNS = [
  // Cmaj7
  { freq: 261.63, bass: 130.81 },
  { freq: 329.63, bass: null },
  { freq: 392.00, bass: null },
  { freq: 523.25, bass: null },
  { freq: 392.00, bass: 130.81 },
  { freq: 329.63, bass: null },
  { freq: 493.88, bass: null },
  { freq: 392.00, bass: null },

  // Am7
  { freq: 220.00, bass: 110.00 },
  { freq: 261.63, bass: null },
  { freq: 329.63, bass: null },
  { freq: 440.00, bass: null },
  { freq: 329.63, bass: 110.00 },
  { freq: 261.63, bass: null },
  { freq: 392.00, bass: null },
  { freq: 329.63, bass: null },

  // Fmaj7
  { freq: 174.61, bass: 87.31 },
  { freq: 261.63, bass: null },
  { freq: 329.63, bass: null },
  { freq: 349.23, bass: null },
  { freq: 329.63, bass: 87.31 },
  { freq: 261.63, bass: null },
  { freq: 349.23, bass: null },
  { freq: 261.63, bass: null },

  // G7
  { freq: 196.00, bass: 98.00 },
  { freq: 246.94, bass: null },
  { freq: 293.66, bass: null },
  { freq: 392.00, bass: null },
  { freq: 349.23, bass: 98.00 },
  { freq: 293.66, bass: null },
  { freq: 246.94, bass: null },
  { freq: 293.66, bass: null },
];

export function useAudio(
  enabled = true,
  volume = 0.8,
  bgmEnabled = false,
  bgmVolume = 0.35
) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isBgmActive, setIsBgmActive] = useState(bgmEnabled);
  const bgmStepRef = useRef(0);
  const bgmIntervalRef = useRef<any>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const getGain = useCallback((baseGain: number) => {
    return Math.max(0, Math.min(1, baseGain * volume));
  }, [volume]);

  // Synchronisation de l'état externe bgmEnabled
  useEffect(() => {
    setIsBgmActive(bgmEnabled);
  }, [bgmEnabled]);

  // Jouer une note d'arpège chiptune rétro
  const playBgmStep = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx || ctx.state === 'suspended') return;

      const step = bgmStepRef.current % BGM_PATTERNS.length;
      bgmStepRef.current = (bgmStepRef.current + 1) % BGM_PATTERNS.length;
      const note = BGM_PATTERNS[step];
      const actualVol = Math.max(0, Math.min(1, bgmVolume * 0.08));

      // Filtre passe-bas pour adoucir le rendu chiptune et éviter toute fatigue auditive
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.setValueAtTime(1.2, ctx.currentTime);
      filter.connect(ctx.destination);

      // Note mélodique (triangle wave pour timbre 8/16-bit doux)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime);

      gain.gain.setValueAtTime(actualVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(filter);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.17);

      // Note de basse (square wave étouffée)
      if (note.bass) {
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(note.bass, ctx.currentTime);

        bassGain.gain.setValueAtTime(actualVol * 0.8, ctx.currentTime);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);

        bassOsc.connect(bassGain);
        bassGain.connect(filter);
        bassOsc.start(ctx.currentTime);
        bassOsc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Ignorer
    }
  }, [getAudioContext, bgmVolume]);

  // Gestion du cycle de vie de la musique d'ambiance (BGM)
  useEffect(() => {
    if (isBgmActive) {
      if (!bgmIntervalRef.current) {
        // Démarre la boucle arpégée à 175ms par pas (~171 BPM de croche rétro)
        bgmIntervalRef.current = setInterval(playBgmStep, 175);
      }
    } else {
      if (bgmIntervalRef.current) {
        clearInterval(bgmIntervalRef.current);
        bgmIntervalRef.current = null;
      }
    }

    return () => {
      if (bgmIntervalRef.current) {
        clearInterval(bgmIntervalRef.current);
        bgmIntervalRef.current = null;
      }
    };
  }, [isBgmActive, playBgmStep]);

  const startBgm = useCallback(() => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    setIsBgmActive(true);
  }, [getAudioContext]);

  const stopBgm = useCallback(() => {
    setIsBgmActive(false);
  }, []);

  const toggleBgm = useCallback(() => {
    setIsBgmActive(prev => {
      if (!prev) {
        const ctx = getAudioContext();
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
      }
      return !prev;
    });
  }, [getAudioContext]);

  // Bruit de déplacement / curseur
  const playMove = useCallback(() => {
    if (!enabled || volume <= 0) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(getGain(0.08), ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Ignorer si audio bloqué
    }
  }, [enabled, volume, getAudioContext, getGain]);

  // Son de sélection / validation
  const playSelect = useCallback(() => {
    if (!enabled || volume <= 0) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.09);
      gain.gain.setValueAtTime(getGain(0.12), ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Ignorer
    }
  }, [enabled, volume, getAudioContext, getGain]);

  // Son de retour / annulation
  const playBack = useCallback(() => {
    if (!enabled || volume <= 0) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(380, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(getGain(0.08), ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {
      // Ignorer
    }
  }, [enabled, volume, getAudioContext, getGain]);

  // Son de lancement de jeu (chime rétro)
  const playLaunch = useCallback(() => {
    if (!enabled || volume <= 0) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.06);
        gain.gain.setValueAtTime(getGain(0.09), ctx.currentTime + index * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.06 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + index * 0.06);
        osc.stop(ctx.currentTime + index * 0.06 + 0.15);
      });
    } catch {
      // Ignorer
    }
  }, [enabled, volume, getAudioContext, getGain]);

  // Son mythique d'insertion de pièce d'arcade ("Insert Coin")
  const playCoin = useCallback(() => {
    if (!enabled || volume <= 0) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const tones = [
        { freq: 987.77, start: 0, duration: 0.07 },
        { freq: 1318.51, start: 0.07, duration: 0.28 },
      ];
      tones.forEach(({ freq, start, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(getGain(0.14), ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      });
    } catch {
      // Ignorer
    }
  }, [enabled, volume, getAudioContext, getGain]);

  // Son d'étoile / power-up favori
  const playFavorite = useCallback(() => {
    if (!enabled || volume <= 0) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [587.33, 739.99, 880.0, 1174.66];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(getGain(0.11), ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.12);
      });
    } catch {
      // Ignorer
    }
  }, [enabled, volume, getAudioContext, getGain]);

  // Son d'erreur / rejet rétro (buzz 8-bit)
  const playError = useCallback(() => {
    if (!enabled || volume <= 0) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.setValueAtTime(100, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(getGain(0.12), ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch {
      // Ignorer
    }
  }, [enabled, volume, getAudioContext, getGain]);

  // Son de victoire / déverrouillage de borne (fanfare)
  const playUnlock = useCallback(() => {
    if (!enabled || volume <= 0) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = idx * 0.07;
        const duration = idx === 3 ? 0.35 : 0.12;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(getGain(0.12), ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      });
    } catch {
      // Ignorer
    }
  }, [enabled, volume, getAudioContext, getGain]);

  // Clic rapide pour le tirage au sort de jeu aléatoire ("Surprise Me")
  const playDice = useCallback(() => {
    if (!enabled || volume <= 0) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      [0, 0.05, 0.1].forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600 + idx * 150, ctx.currentTime + delay);
        gain.gain.setValueAtTime(getGain(0.1), ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.03);
      });
    } catch {
      // Ignorer
    }
  }, [enabled, volume, getAudioContext, getGain]);

  return {
    playMove,
    playSelect,
    playBack,
    playLaunch,
    playCoin,
    playFavorite,
    playError,
    playUnlock,
    playDice,
    startBgm,
    stopBgm,
    toggleBgm,
    isBgmActive,
  };
}
