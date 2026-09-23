import React from 'react';
import {
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Repeat,
  Radio,
  Sparkles,
  X,
  Disc3,
  FolderSearch,
  Tv,
  Power,
} from 'lucide-react';
import { ChiptuneTrack } from '../../types/retroFeatures';
import { useRetroJukebox } from '../../hooks/useRetroJukebox';

interface RetroJukeboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMusicManager?: () => void;
  jukebox?: ReturnType<typeof useRetroJukebox>;
  playlist?: ChiptuneTrack[];
  currentTrack?: ChiptuneTrack;
  currentTrackIndex?: number;
  isPlaying?: boolean;
  isMuted?: boolean;
  volume?: number;
  loopMode?: 'all' | 'one' | 'none';
  eqLevels?: number[];
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onTogglePlay?: () => void;
  onToggleMute?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onSelectTrack?: (index: number) => void;
  onSetVolume?: (vol: number) => void;
  onSetLoopMode?: (mode: 'all' | 'one' | 'none') => void;
  onPlaySoundEffect?: (type: 'coin' | 'jump' | 'powerup' | 'fanfare' | 'gameover') => void;
  isFloatingVisible?: boolean;
  onToggleFloatingVisible?: () => void;
}

export const RetroJukeboxModal: React.FC<RetroJukeboxModalProps> = ({
  isOpen,
  onClose,
  onOpenMusicManager,
  jukebox,
  playlist: propPlaylist,
  currentTrack: propCurrentTrack,
  currentTrackIndex: propCurrentTrackIndex,
  isPlaying: propIsPlaying,
  isMuted: propIsMuted,
  volume: propVolume,
  loopMode: propLoopMode,
  eqLevels: propEqLevels,
  onPlay: _propOnPlay,
  onPause: _propOnPause,
  onStop: propOnStop,
  onTogglePlay: propOnTogglePlay,
  onToggleMute: propOnToggleMute,
  onNext: propOnNext,
  onPrev: propOnPrev,
  onSelectTrack: propOnSelectTrack,
  onSetVolume: propOnSetVolume,
  onSetLoopMode: propOnSetLoopMode,
  onPlaySoundEffect: propOnPlaySoundEffect,
  isFloatingVisible,
  onToggleFloatingVisible,
}) => {
  const playlist = jukebox?.playlist || propPlaylist || [];
  const currentTrack = jukebox?.currentTrack || propCurrentTrack || playlist[0];
  const currentTrackIndex = jukebox?.currentTrackIndex ?? propCurrentTrackIndex ?? 0;
  const isPlaying = jukebox?.isPlaying ?? propIsPlaying ?? false;
  const isMuted = jukebox?.isMuted ?? propIsMuted ?? false;
  const volume = jukebox?.volume ?? propVolume ?? 0.7;
  const loopMode = jukebox?.loopMode || propLoopMode || 'all';
  const eqLevels = jukebox?.eqLevels || propEqLevels || [30, 50, 70, 40, 60];
  const onTogglePlay = jukebox?.togglePlay || propOnTogglePlay || (() => {});
  const onToggleMute = jukebox?.toggleMute || propOnToggleMute || (() => {});
  const onStop = jukebox?.stop || propOnStop || (() => {});
  const onNext = jukebox?.nextTrack || propOnNext || (() => {});
  const onPrev = jukebox?.prevTrack || propOnPrev || (() => {});
  const onSelectTrack = jukebox?.selectTrack || propOnSelectTrack || (() => {});
  const onSetVolume = jukebox?.setVolume || propOnSetVolume || (() => {});
  const onSetLoopMode = jukebox?.setLoopMode || propOnSetLoopMode || (() => {});
  const onPlaySoundEffect = jukebox?.playSoundEffect || propOnPlaySoundEffect || (() => {});
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b1329] border border-cyan-500/30 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(0,242,254,0.15)] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0d1838] flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-pink-600 to-purple-500 flex items-center justify-center shadow-lg shadow-pink-500/20 shrink-0">
              <Disc3 className={`w-6 h-6 text-white ${isPlaying ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white tracking-wide">
                  Jukebox Chiptune Rétro
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-300 font-mono font-bold">
                  Synthétiseur Web Audio 8/16-Bit
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Mélodies cultes générées en temps réel par oscillateurs analogiques
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Toggle Lecteur Flottant */}
            {onToggleFloatingVisible && (
              <button
                type="button"
                onClick={onToggleFloatingVisible}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition ${
                  isFloatingVisible
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title="Afficher ou masquer le mini-lecteur flottant sur l'écran"
              >
                <Tv className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lecteur Flottant</span>
                <span className="text-[10px] px-1 rounded bg-black/40 font-mono">
                  {isFloatingVisible ? 'Actif' : 'Masqué'}
                </span>
              </button>
            )}

            {/* Bouton Couper le Jukebox */}
            <button
              type="button"
              onClick={() => {
                onStop();
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-bold flex items-center space-x-1.5 transition"
              title="Couper le son, arrêter la musique et fermer le Jukebox"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Couper le Jukebox</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Console / Écran Platine Vintage */}
        <div className="p-6 bg-gradient-to-b from-[#121c3b] to-[#080e22] border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Visualiseur Equalizer Néon */}
          <div className="w-full sm:w-1/2 bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between h-40 shadow-inner">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span className="text-pink-400 font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" />
                {isPlaying ? 'LECTURE EN COURS' : 'EN PAUSE'}
              </span>
              <span>{currentTrack?.bpm || 130} BPM</span>
            </div>

            {/* Barres d'égaliseur animées */}
            <div className="flex items-end justify-between gap-1.5 h-20 px-2 pt-2">
              {eqLevels.map((val, i) => (
                <div key={i} className="flex-1 h-full bg-slate-900 rounded-t flex items-end overflow-hidden">
                  <div
                    className="w-full bg-gradient-to-t from-cyan-500 via-pink-500 to-amber-300 transition-all duration-75 rounded-t"
                    style={{ height: `${isPlaying ? val : 6}%` }}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono pt-1 border-t border-slate-900">
              <span>60Hz</span>
              <span>250Hz</span>
              <span>1kHz</span>
              <span>4kHz</span>
              <span>12kHz</span>
            </div>
          </div>

          {/* Track en cours & Commandes de bord */}
          <div className="w-full sm:w-1/2 flex flex-col justify-between h-40">
            <div>
              <span className="text-[10px] uppercase font-bold text-pink-400 tracking-wider">
                {currentTrack?.system} · {currentTrack?.year || 1991}
              </span>
              <h3 className="text-lg font-black text-white truncate mt-0.5">
                {currentTrack?.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentTrack?.gameTitle} (Comp. {currentTrack?.composer})
              </p>
            </div>

            {/* Boutons de contrôle */}
            <div className="flex items-center justify-between gap-3 mt-4">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onPrev}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
                  title="Piste précédente"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onTogglePlay}
                  className="p-3 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold transition shadow-lg shadow-pink-500/25"
                  title={isPlaying ? 'Pause' : 'Lecture'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                {/* Bouton Couper / Arrêter la musique */}
                <button
                  type="button"
                  onClick={onStop}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition"
                  title="Couper / Arrêter la lecture"
                >
                  <Square className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onNext}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
                  title="Piste suivante"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onSetLoopMode(loopMode === 'all' ? 'one' : 'all')}
                  className={`p-2 rounded-lg border transition ${
                    loopMode === 'one'
                      ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400'
                  }`}
                  title={loopMode === 'one' ? 'Boucle piste unique' : 'Boucle toute la playlist'}
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>

              {/* Slider volume + Bouton Mute */}
              <div className="flex items-center space-x-2 flex-1 max-w-[150px]">
                <button
                  type="button"
                  onClick={onToggleMute}
                  className={`p-1 rounded transition ${
                    isMuted ? 'text-red-400 hover:text-red-300' : 'text-slate-400 hover:text-white'
                  }`}
                  title={isMuted ? 'Rétablir le son' : 'Couper le son (Mute)'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onSetVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  title={`Volume : ${isMuted ? 'Coupé (Muet)' : `${Math.round(volume * 100)}%`}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Banc d'effets sonores Arcade (Soundboard) */}
        <div className="px-6 py-3 bg-[#0a1128] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 font-bold flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Soundboard Arcade Rétro :</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onPlaySoundEffect('coin')}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold font-mono transition"
            >
              🪙 Insérer Pièce (Coin)
            </button>
            <button
              onClick={() => onPlaySoundEffect('powerup')}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold font-mono transition"
            >
              🍄 Champignon Power-Up
            </button>
            <button
              onClick={() => onPlaySoundEffect('fanfare')}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold font-mono transition"
            >
              🎺 Fanfare Victoire
            </button>
          </div>
        </div>

        {/* Playlist table header & scan button */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-900/60 border-b border-slate-800/80 text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wider">
            Playlist Active ({playlist.length} pistes)
          </span>
          {onOpenMusicManager && (
            <button
              onClick={onOpenMusicManager}
              className="px-3 py-1 rounded-xl bg-fuchsia-500/20 hover:bg-fuchsia-500 hover:text-slate-950 border border-fuchsia-500/40 text-fuchsia-300 font-bold flex items-center space-x-1.5 transition text-[11px]"
            >
              <FolderSearch className="w-3.5 h-3.5" />
              <span>Gérer / Scanner un Dossier</span>
            </button>
          )}
        </div>

        {/* Playlist table */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="divide-y divide-slate-800/60">
            {playlist.map((track, idx) => {
              const isSelected = idx === currentTrackIndex;
              return (
                <div
                  key={track.id}
                  onClick={() => onSelectTrack(idx)}
                  className={`p-3 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition ${
                    isSelected
                      ? 'bg-pink-500/15 border border-pink-500/30 text-white'
                      : 'hover:bg-slate-900/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <span className="w-6 text-center font-mono text-xs text-slate-500 font-bold">
                      {isSelected && isPlaying ? (
                        <Radio className="w-4 h-4 text-pink-400 animate-pulse mx-auto" />
                      ) : (
                        String(idx + 1).padStart(2, '0')
                      )}
                    </span>

                    <div className="min-w-0">
                      <div className="font-bold text-sm truncate flex items-center space-x-2">
                        <span>{track.title}</span>
                        {isSelected && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-500/30 text-pink-300 font-mono">
                            EN COURS
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                        <span className="text-pink-400">{track.gameTitle}</span>
                        <span aria-hidden="true">·</span>
                        <span>{track.system}</span>
                        <span aria-hidden="true">·</span>
                        <span>{track.composer}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs text-slate-500 shrink-0">
                    {track.duration}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
