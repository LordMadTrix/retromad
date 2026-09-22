import { useState, useRef, useEffect, useCallback } from 'react';
import { ChiptuneTrack } from '../types/retroFeatures';
import { INITIAL_CHIPTUNE_TRACKS } from '../data/retroFeaturesData';

export function useRetroJukebox(externalVolume = 0.5) {
  const [playlist, setPlaylist] = useState<ChiptuneTrack[]>(() => {
    try {
      const saved = localStorage.getItem('retromad_jukebox_playlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_CHIPTUNE_TRACKS;
    } catch {
      return INITIAL_CHIPTUNE_TRACKS;
    }
  });

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(externalVolume);
  const [loopMode, setLoopMode] = useState<'all' | 'one' | 'none'>('all');
  const [eqLevels, setEqLevels] = useState<number[]>([10, 25, 45, 60, 40, 70, 30, 15]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const stepIndexRef = useRef(0);
  const timerRef = useRef<any>(null);

  // Sauvegarder la playlist en local
  useEffect(() => {
    try {
      localStorage.setItem('retromad_jukebox_playlist', JSON.stringify(playlist));
    } catch {
      // Ignorer si quota plein
    }
  }, [playlist]);

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

  const currentTrack = playlist[currentTrackIndex] || playlist[0];

  // Jouer une note synthétisée (Mode Chiptune)
  const playPatternStep = useCallback(() => {
    if (!currentTrack || currentTrack.audioUrl || !currentTrack.pattern?.length) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const note = currentTrack.pattern[stepIndexRef.current % currentTrack.pattern.length];
    stepIndexRef.current = (stepIndexRef.current + 1) % currentTrack.pattern.length;

    const now = ctx.currentTime;
    const dur = note.len || 0.25;
    const masterGain = Math.max(0.01, Math.min(1, volume * 0.18));

    // Master filter pour adoucir le rendu chiptune
    const masterFilter = ctx.createBiquadFilter();
    masterFilter.type = 'lowpass';
    masterFilter.frequency.setValueAtTime(2400, now);
    masterFilter.connect(ctx.destination);

    // Canal 1: Mélodie principale (Square wave / Sawtooth)
    if (note.freq > 20) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = note.type || 'square';
      osc.frequency.setValueAtTime(note.freq, now);

      gain.gain.setValueAtTime(masterGain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc.connect(gain);
      gain.connect(masterFilter);

      osc.start(now);
      osc.stop(now + dur + 0.05);
    }

    // Canal 2: Ligne de Basse (Triangle wave / Sub)
    if (note.bass && note.bass > 20) {
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(note.bass, now);

      bassGain.gain.setValueAtTime(masterGain * 1.2, now);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + dur * 1.1);

      bassOsc.connect(bassGain);
      bassGain.connect(masterFilter);

      bassOsc.start(now);
      bassOsc.stop(now + dur * 1.1 + 0.05);
    }

    // Animation de l'égaliseur dynamique
    setEqLevels([
      Math.floor(20 + Math.random() * 75),
      Math.floor(30 + Math.random() * 65),
      Math.floor(15 + Math.random() * 80),
      Math.floor(40 + Math.random() * 55),
      Math.floor(25 + Math.random() * 70),
      Math.floor(35 + Math.random() * 60),
      Math.floor(10 + Math.random() * 85),
      Math.floor(20 + Math.random() * 60),
    ]);
  }, [currentTrack, getAudioContext, volume]);

  // Gestion de la lecture de fichiers audio personnalisés (MP3, OGG, WAV, etc.)
  useEffect(() => {
    if (!currentTrack?.audioUrl) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      return;
    }

    const audio = new Audio(currentTrack.audioUrl);
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.loop = loopMode === 'one';
    audioElementRef.current = audio;

    const handleEnded = () => {
      if (loopMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else if (loopMode === 'all') {
        setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('ended', handleEnded);

    if (isPlaying) {
      audio.play().catch(() => {});
    }

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [currentTrack?.audioUrl, loopMode, playlist.length]);

  // Synchronisation du volume pour les pistes de fichiers audio
  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, [volume]);

  // Boucle de lecture de la piste synthétisée
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioElementRef.current) audioElementRef.current.pause();
      setEqLevels([5, 8, 12, 10, 8, 12, 6, 4]);
      return;
    }

    if (currentTrack?.audioUrl) {
      if (audioElementRef.current && audioElementRef.current.paused) {
        audioElementRef.current.play().catch(() => {});
      }
      // Animation visuelle d'égaliseur pour la piste audio
      const eqInterval = setInterval(() => {
        setEqLevels([
          Math.floor(25 + Math.random() * 65),
          Math.floor(40 + Math.random() * 55),
          Math.floor(20 + Math.random() * 75),
          Math.floor(50 + Math.random() * 45),
          Math.floor(35 + Math.random() * 60),
          Math.floor(45 + Math.random() * 50),
          Math.floor(15 + Math.random() * 70),
          Math.floor(30 + Math.random() * 55),
        ]);
      }, 100);

      return () => clearInterval(eqInterval);
    }

    const intervalMs = Math.round((60 / (currentTrack?.bpm || 130)) * 1000 * 0.5);
    timerRef.current = setInterval(playPatternStep, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentTrack, playPatternStep]);

  const play = useCallback(() => {
    getAudioContext();
    if (audioElementRef.current) {
      audioElementRef.current.play().catch(() => {});
    }
    setIsPlaying(true);
  }, [getAudioContext]);

  const pause = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const nextTrack = useCallback(() => {
    stepIndexRef.current = 0;
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
  }, [playlist.length]);

  const prevTrack = useCallback(() => {
    stepIndexRef.current = 0;
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  }, [playlist.length]);

  const selectTrack = useCallback((index: number) => {
    stepIndexRef.current = 0;
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  }, []);

  // Ajouter un morceau personnalisé (manuel ou importé)
  const addTrack = useCallback((track: ChiptuneTrack) => {
    setPlaylist((prev) => [...prev, track]);
  }, []);

  // Supprimer un morceau
  const removeTrack = useCallback((trackId: string) => {
    setPlaylist((prev) => {
      const filtered = prev.filter((t) => t.id !== trackId);
      return filtered.length > 0 ? filtered : INITIAL_CHIPTUNE_TRACKS;
    });
  }, []);

  // Importer plusieurs morceaux d'un coup (résultat de scan de dossier)
  const importTracks = useCallback((newTracks: ChiptuneTrack[]) => {
    setPlaylist((prev) => {
      const existingIds = new Set(prev.map((t) => t.id));
      const filteredNew = newTracks.filter((t) => !existingIds.has(t.id));
      return [...prev, ...filteredNew];
    });
  }, []);

  // Réinitialiser la playlist par défaut
  const resetPlaylist = useCallback(() => {
    setPlaylist(INITIAL_CHIPTUNE_TRACKS);
    setCurrentTrackIndex(0);
  }, []);

  // Déclencher un effet sonore arcade classique
  const playSoundEffect = useCallback((type: 'coin' | 'jump' | 'powerup' | 'fanfare' | 'gameover') => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.25, now);
    masterGain.connect(ctx.destination);

    if (type === 'coin') {
      const osc1 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'square';
      osc1.frequency.setValueAtTime(987.77, now); // B5
      osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      gain.connect(masterGain);
      osc1.start(now);
      osc1.stop(now + 0.35);
    } else if (type === 'fanfare') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0.8, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.35);
      });
    } else if (type === 'powerup') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  }, [getAudioContext, volume]);

  return {
    playlist,
    currentTrack,
    currentTrackIndex,
    isPlaying,
    volume,
    loopMode,
    eqLevels,
    setVolume,
    setLoopMode,
    play,
    pause,
    togglePlay,
    nextTrack,
    prevTrack,
    selectTrack,
    addTrack,
    removeTrack,
    importTracks,
    resetPlaylist,
    playSoundEffect,
  };
}
