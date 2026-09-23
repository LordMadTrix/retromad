import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Disc3,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  GripVertical,
  X,
  Compass,
  RotateCcw,
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
  isMuted?: boolean;
  eqLevels?: number[];
  onTogglePlay?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onSetVolume?: (vol: number) => void;
  onToggleMute?: () => void;
  onStop?: () => void;
  onClose?: () => void;
}

interface Position {
  x: number;
  y: number;
}

const STORAGE_POS_KEY = 'retromad_jukebox_floating_pos';

export const RetroJukeboxFloatingPlayer: React.FC<RetroJukeboxFloatingPlayerProps> = ({
  jukebox,
  onOpenModal,
  onOpenFullModal,
  currentTrack: propCurrentTrack,
  isPlaying: propIsPlaying,
  volume: propVolume,
  isMuted: propIsMuted,
  eqLevels: propEqLevels,
  onTogglePlay: propOnTogglePlay,
  onNext: propOnNext,
  onPrev: propOnPrev,
  onSetVolume: propOnSetVolume,
  onToggleMute: propOnToggleMute,
  onStop: propOnStop,
  onClose,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showPositionsMenu, setShowPositionsMenu] = useState(false);
  const [showVolumePopup, setShowVolumePopup] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Position state (null means default initial corner calculated after mount)
  const [position, setPosition] = useState<Position | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_POS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  const playerRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  const currentTrack = jukebox?.currentTrack || propCurrentTrack;
  const isPlaying = jukebox?.isPlaying ?? propIsPlaying ?? false;
  const isMuted = jukebox?.isMuted ?? propIsMuted ?? false;
  const volume = jukebox?.volume ?? propVolume ?? 0.5;
  const eqLevels = jukebox?.eqLevels || propEqLevels || [20, 40, 60, 30, 50];
  const onTogglePlay = jukebox?.togglePlay || propOnTogglePlay || (() => {});
  const onNext = jukebox?.nextTrack || propOnNext || (() => {});
  const onPrev = jukebox?.prevTrack || propOnPrev || (() => {});
  const onSetVolume = jukebox?.setVolume || propOnSetVolume || (() => {});
  const onToggleMute = jukebox?.toggleMute || propOnToggleMute || (() => {});
  const onStop = jukebox?.stop || propOnStop || (() => {});
  const handleOpenModal = onOpenModal || onOpenFullModal || (() => {});

  // Clamper la position dans les limites visibles de l'écran
  const clampPosition = useCallback((x: number, y: number, elemWidth = 380, elemHeight = 65): Position => {
    const margin = 12;
    const maxX = Math.max(margin, window.innerWidth - elemWidth - margin);
    const maxY = Math.max(margin, window.innerHeight - elemHeight - margin);
    return {
      x: Math.min(Math.max(margin, x), maxX),
      y: Math.min(Math.max(margin, y), maxY),
    };
  }, []);

  // Position initiale si aucune n'est enregistrée
  useEffect(() => {
    if (position === null) {
      const defaultX = Math.max(12, window.innerWidth - 420);
      const defaultY = Math.max(12, window.innerHeight - 80);
      setPosition({ x: defaultX, y: defaultY });
    }
  }, [position]);

  // Recaler si la fenêtre est redimensionnée
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return prev;
        const rect = playerRef.current?.getBoundingClientRect();
        const w = rect?.width || 380;
        const h = rect?.height || 65;
        return clampPosition(prev.x, prev.y, w, h);
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampPosition]);

  // Sauvegarder la position
  useEffect(() => {
    if (position) {
      try {
        localStorage.setItem(STORAGE_POS_KEY, JSON.stringify(position));
      } catch {}
    }
  }, [position]);

  // Gestion du glisser-déposer (Drag and Drop) avec souris et touch
  const handleStartDrag = (clientX: number, clientY: number) => {
    const currentX = position?.x ?? (window.innerWidth - 420);
    const currentY = position?.y ?? (window.innerHeight - 80);
    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      startX: currentX,
      startY: currentY,
    };
    setIsDragging(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Si on clique sur un bouton interactif ou input, ne pas déclencher le drag
    if ((e.target as HTMLElement).closest('button, input, a, .no-drag')) {
      return;
    }
    e.preventDefault();
    handleStartDrag(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button, input, a, .no-drag')) {
      return;
    }
    const touch = e.touches[0];
    if (touch) {
      handleStartDrag(touch.clientX, touch.clientY);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      const newX = dragStartRef.current.startX + dx;
      const newY = dragStartRef.current.startY + dy;
      const rect = playerRef.current?.getBoundingClientRect();
      const w = rect?.width || 380;
      const h = rect?.height || 65;
      setPosition(clampPosition(newX, newY, w, h));
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const dx = touch.clientX - dragStartRef.current.mouseX;
      const dy = touch.clientY - dragStartRef.current.mouseY;
      const newX = dragStartRef.current.startX + dx;
      const newY = dragStartRef.current.startY + dy;
      const rect = playerRef.current?.getBoundingClientRect();
      const w = rect?.width || 380;
      const h = rect?.height || 65;
      setPosition(clampPosition(newX, newY, w, h));
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, clampPosition]);

  // Préréglages d'ancrage rapide aux coins
  const snapToCorner = (corner: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom-center') => {
    const rect = playerRef.current?.getBoundingClientRect();
    const w = rect?.width || 380;
    const h = rect?.height || 65;
    const margin = 16;
    let newPos: Position = { x: margin, y: margin };

    switch (corner) {
      case 'bottom-right':
        newPos = { x: window.innerWidth - w - margin, y: window.innerHeight - h - margin };
        break;
      case 'bottom-left':
        newPos = { x: margin, y: window.innerHeight - h - margin };
        break;
      case 'top-right':
        newPos = { x: window.innerWidth - w - margin, y: 70 }; // Sous la barre de nav
        break;
      case 'top-left':
        newPos = { x: margin, y: 70 };
        break;
      case 'bottom-center':
        newPos = { x: Math.max(margin, (window.innerWidth - w) / 2), y: window.innerHeight - h - margin };
        break;
    }

    setPosition(clampPosition(newPos.x, newPos.y, w, h));
    setShowPositionsMenu(false);
  };

  if (!currentTrack) return null;

  const currentStyle: React.CSSProperties = position
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: 'fixed',
      }
    : {
        bottom: '12px',
        right: '20px',
        position: 'fixed',
      };

  // VUE RÉDUITE (MINI PILL)
  if (isMinimized) {
    return (
      <div
        ref={playerRef}
        style={currentStyle}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`z-40 transition-shadow select-none ${isDragging ? 'cursor-grabbing opacity-90 scale-105' : 'cursor-grab'}`}
      >
        <div
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border shadow-2xl backdrop-blur-md transition ${
            isPlaying
              ? 'bg-pink-950/90 border-pink-500/60 text-pink-300 shadow-pink-500/20'
              : 'bg-slate-900/90 border-slate-700 text-slate-400'
          }`}
        >
          {/* Poignée drag */}
          <div className="text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing" title="Déplacer le Jukebox">
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="flex items-center space-x-1.5 hover:text-white transition"
            title="Agrandir le Jukebox"
          >
            <Disc3 className={`w-4 h-4 ${isPlaying && !isMuted ? 'animate-spin' : ''}`} />
            <span className="text-xs font-bold font-mono">Jukebox</span>
          </button>

          {/* Bouton Play/Pause rapide */}
          <button
            type="button"
            onClick={onTogglePlay}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title={isPlaying ? 'Mettre en pause' : 'Reprendre la lecture'}
          >
            {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
          </button>

          {/* Bouton Mute rapide */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`p-1 rounded-full hover:bg-slate-800 transition ${isMuted ? 'text-red-400' : 'text-slate-400 hover:text-white'}`}
            title={isMuted ? 'Rétablir le son' : 'Couper le son (Mute)'}
          >
            {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          </button>

          {/* Déplier */}
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Agrandir le lecteur"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          {/* Couper et fermer complètement */}
          {onClose && (
            <button
              type="button"
              onClick={() => {
                onStop();
                onClose();
              }}
              className="p-1 rounded-full hover:bg-red-500/20 text-slate-500 hover:text-red-300 transition"
              title="Couper le son et masquer le Jukebox"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // VUE FLOTTANTE STANDARD COMPLÈTE
  return (
    <div
      ref={playerRef}
      style={currentStyle}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`z-40 select-none animate-in fade-in zoom-in-95 duration-150 ${
        isDragging ? 'cursor-grabbing scale-102 shadow-[0_12px_36px_rgba(236,72,153,0.4)] ring-2 ring-pink-400/80' : ''
      }`}
    >
      <div className="bg-[#0b132b]/95 border border-pink-500/50 rounded-2xl px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl flex items-center space-x-2.5 text-xs max-w-lg relative group">
        
        {/* Poignée de déplacement (Drag Handle) */}
        <div
          className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-pink-400/70 hover:text-pink-300 transition shrink-0 rounded hover:bg-pink-500/10"
          title="Glisser pour déplacer le Jukebox à l'écran"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Pochette vinyle animée & lien modal */}
        <button
          type="button"
          onClick={handleOpenModal}
          className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center shrink-0 hover:scale-105 hover:bg-pink-500/30 transition shadow-inner"
          title="Ouvrir le Jukebox complet (Playlist & Synthétiseur)"
        >
          <Disc3 className={`w-4 h-4 text-pink-400 ${isPlaying && !isMuted ? 'animate-spin' : ''}`} />
        </button>

        {/* Titre du morceau & égaliseur */}
        <div
          className="min-w-0 max-w-[150px] sm:max-w-[170px] cursor-pointer"
          onClick={handleOpenModal}
          title="Ouvrir la playlist complète"
        >
          <div className="font-bold text-white text-xs truncate leading-tight flex items-center gap-1.5">
            <span className="truncate">{currentTrack.title}</span>
            {isMuted && (
              <span className="px-1 py-0.2 rounded bg-red-500/20 text-red-300 text-[9px] font-mono shrink-0">
                MUET
              </span>
            )}
          </div>
          <div className="text-[10px] text-pink-400 truncate mt-0.5">
            {currentTrack.gameTitle}
          </div>
        </div>

        {/* Mini Equalizer Bar dynamique */}
        <div className="hidden sm:flex items-end gap-0.5 h-4 w-10 px-0.5 shrink-0">
          {eqLevels.slice(0, 4).map((v, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-pink-500 to-cyan-400 rounded-t transition-all duration-75"
              style={{ height: `${isPlaying && !isMuted ? Math.max(15, v) : 15}%` }}
            />
          ))}
        </div>

        {/* Commandes audio principales */}
        <div className="flex items-center space-x-1 shrink-0">
          {/* Piste précédente */}
          <button
            type="button"
            onClick={onPrev}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Piste précédente"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          {/* Lecture / Pause */}
          <button
            type="button"
            onClick={onTogglePlay}
            className="p-1.5 rounded-lg bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold transition shadow-md shadow-pink-500/30 active:scale-95"
            title={isPlaying ? 'Pause' : 'Lecture'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          {/* Piste suivante */}
          <button
            type="button"
            onClick={onNext}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Piste suivante"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* COUPER LE SON (MUTE / RÉTABLIR) & SLIDER RAPIDE */}
          <div className="relative">
            <button
              type="button"
              onClick={onToggleMute}
              onMouseEnter={() => setShowVolumePopup(true)}
              className={`p-1.5 rounded-lg transition ${
                isMuted
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title={isMuted ? 'Rétablir le son du Jukebox' : 'Couper le son du Jukebox (Mute)'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Popup volume rapide sur survol */}
            {showVolumePopup && (
              <div
                onMouseLeave={() => setShowVolumePopup(false)}
                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 rounded-xl p-2.5 shadow-2xl flex flex-col items-center gap-1.5 z-50 animate-in fade-in duration-100 w-28"
              >
                <div className="flex items-center justify-between w-full text-[10px] text-slate-400 font-mono">
                  <span>Vol</span>
                  <span className="text-pink-400 font-bold">{isMuted ? '0%' : `${Math.round(volume * 100)}%`}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onSetVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
                <button
                  type="button"
                  onClick={onToggleMute}
                  className="w-full py-0.5 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition text-center"
                >
                  {isMuted ? 'Rétablir' : 'Couper'}
                </button>
              </div>
            )}
          </div>

          {/* ARRÊTER / COUPER COMPLÈTEMENT LA LECTURE */}
          <button
            type="button"
            onClick={onStop}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition"
            title="Couper / Arrêter la musique"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          {/* MENU POSITIONNEMENT RAPIDE (DÉPLACER D'UN CLIC) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPositionsMenu(!showPositionsMenu)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition"
              title="Ancrer / Repositionner dans un coin d'écran"
            >
              <Compass className="w-3.5 h-3.5" />
            </button>

            {showPositionsMenu && (
              <div
                className="absolute bottom-full mb-2 right-0 bg-[#0d1633] border border-cyan-500/40 rounded-xl p-2 shadow-2xl flex flex-col gap-1 z-50 min-w-[170px] animate-in fade-in duration-100 text-slate-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2 py-1 text-[10px] font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                  <span>Positionner</span>
                  <Compass className="w-3 h-3 text-cyan-400" />
                </div>
                <button
                  type="button"
                  onClick={() => snapToCorner('bottom-right')}
                  className="w-full text-left px-2 py-1 rounded hover:bg-cyan-500/20 text-xs transition"
                >
                  ↘ Bas à Droite (Défaut)
                </button>
                <button
                  type="button"
                  onClick={() => snapToCorner('bottom-left')}
                  className="w-full text-left px-2 py-1 rounded hover:bg-cyan-500/20 text-xs transition"
                >
                  ↙ Bas à Gauche
                </button>
                <button
                  type="button"
                  onClick={() => snapToCorner('bottom-center')}
                  className="w-full text-left px-2 py-1 rounded hover:bg-cyan-500/20 text-xs transition"
                >
                  ⬇ Bas Centré
                </button>
                <button
                  type="button"
                  onClick={() => snapToCorner('top-right')}
                  className="w-full text-left px-2 py-1 rounded hover:bg-cyan-500/20 text-xs transition"
                >
                  ↗ Haut à Droite
                </button>
                <button
                  type="button"
                  onClick={() => snapToCorner('top-left')}
                  className="w-full text-left px-2 py-1 rounded hover:bg-cyan-500/20 text-xs transition"
                >
                  ↖ Haut à Gauche
                </button>
                <div className="pt-1 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        localStorage.removeItem(STORAGE_POS_KEY);
                      } catch {}
                      snapToCorner('bottom-right');
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-slate-800 text-[11px] text-slate-400 flex items-center space-x-1.5 transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Réinitialiser la position</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Agrandir / Plein écran */}
          <button
            type="button"
            onClick={handleOpenModal}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-pink-300 transition"
            title="Ouvrir la vue complète du Jukebox"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Minimiser en pilule */}
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Réduire en mini-bouton"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* FERMER / COUPER COMPLÈTEMENT LE JUKEBOX */}
          {onClose && (
            <button
              type="button"
              onClick={() => {
                onStop();
                onClose();
              }}
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition ml-0.5"
              title="Couper la musique et fermer le Jukebox"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
