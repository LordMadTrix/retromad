import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  Disc3,
  Maximize2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ChiptuneTrack } from '../../types/retroFeatures';
import { useRetroJukebox } from '../../hooks/useRetroJukebox';

interface RetroJukeboxFloatingPlayerProps {
  jukebox?: ReturnType<typeof useRetroJukebox>;
  onOpenModal?: () => void;
  onOpenFullModal?: () => void;
  currentTrack?: ChiptuneTrack;
  isPlaying?: boolean;
  volume?: number;
  eqLevels?: number[];
  onTogglePlay?: () => void;
  onNext?: () => void;
  onSetVolume?: (vol: number) => void;
}

export const RetroJukeboxFloatingPlayer: React.FC<RetroJukeboxFloatingPlayerProps> = ({
  jukebox,
  onOpenModal,
  onOpenFullModal,
  currentTrack: propCurrentTrack,
  isPlaying: propIsPlaying,
  volume: _volume,
  eqLevels: propEqLevels,
  onTogglePlay: propOnTogglePlay,
  onNext: propOnNext,
  onSetVolume: _onSetVolume,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const currentTrack = jukebox?.currentTrack || propCurrentTrack;
  const isPlaying = jukebox?.isPlaying ?? propIsPlaying ?? false;
  const eqLevels = jukebox?.eqLevels || propEqLevels || [20, 40, 60, 30, 50];
  const onTogglePlay = jukebox?.togglePlay || propOnTogglePlay || (() => {});
  const onNext = jukebox?.nextTrack || propOnNext || (() => {});
  const handleOpenModal = onOpenModal || onOpenFullModal || (() => {});

  if (!currentTrack) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-3 right-20 z-40">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border shadow-xl backdrop-blur-md transition ${
            isPlaying
              ? 'bg-pink-950/80 border-pink-500/50 text-pink-300'
              : 'bg-slate-900/80 border-slate-700 text-slate-400'
          }`}
          title="Afficher le mini-lecteur Chiptune"
        >
          <Disc3 className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} />
          <span className="text-xs font-bold font-mono">BGM 8-Bit</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-3 right-20 z-40 animate-in slide-in-from-bottom-3 duration-200">
      <div className="bg-[#0d1633]/90 border border-pink-500/40 rounded-2xl px-3.5 py-2 shadow-[0_4px_24px_rgba(236,72,153,0.25)] backdrop-blur-xl flex items-center space-x-3 text-xs max-w-md">
        {/* Disc Icon */}
        <button
          type="button"
          onClick={onOpenFullModal}
          className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center shrink-0 hover:scale-105 transition"
          title="Ouvrir le Jukebox complet"
        >
          <Disc3 className={`w-4 h-4 text-pink-400 ${isPlaying ? 'animate-spin' : ''}`} />
        </button>

        {/* Track Title and visualizer */}
        <div
          className="min-w-0 max-w-[170px] cursor-pointer"
          onClick={onOpenFullModal}
          title="Ouvrir le Jukebox complet"
        >
          <div className="font-bold text-white text-xs truncate leading-tight">
            {currentTrack.title}
          </div>
          <div className="text-[10px] text-pink-400 truncate mt-0.5">
            {currentTrack.gameTitle}
          </div>
        </div>

        {/* Mini Equalizer Bar */}
        <div className="hidden sm:flex items-end gap-0.5 h-4 w-12 px-1">
          {eqLevels.slice(0, 4).map((v, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-pink-500 to-cyan-400 rounded-t transition-all duration-75"
              style={{ height: `${isPlaying ? Math.max(15, v) : 20}%` }}
            />
          ))}
        </div>

        {/* Transport controls */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            type="button"
            onClick={onTogglePlay}
            className="p-1.5 rounded-lg bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold transition shadow-sm"
            title={isPlaying ? 'Pause' : 'Lecture'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={onNext}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Piste suivante"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleOpenModal}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-pink-300 transition"
            title="Plein écran / Playlist"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition ml-1"
            title="Réduire le mini-lecteur"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
