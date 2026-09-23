import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  RotateCw,
  Box,
  Disc3,
  Award,
  ChevronRight,
  ChevronLeft,
  X,
  Gamepad2,
  Coins,
} from 'lucide-react';
import { Game } from '../../types';
import { RETRO_TRIVIAS, RetroTrivia } from '../../data/attractAndLanData';

interface RetroAttractModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  onLaunchGame?: (game: Game) => void;
  onPlaySound?: (type: 'coin' | 'powerup' | 'fanfare') => void;
}

type ViewMode = 'arcade' | 'box3d' | 'trivia';

export const RetroAttractModeModal: React.FC<RetroAttractModeModalProps> = ({
  isOpen,
  onClose,
  games,
  onLaunchGame,
  onPlaySound,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTriviaIndex, setCurrentTriviaIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('arcade');
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [insertCoinBlink, setInsertCoinBlink] = useState(true);
  const [credits, setCredits] = useState(2);
  const [rotationY, setRotationY] = useState(15);
  const [rotationX, setRotationX] = useState(5);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [cartridgeType, setCartridgeType] = useState<'snes' | 'nes' | 'megadrive' | 'gameboy'>('snes');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const rotateAnimRef = useRef<number | null>(null);

  const currentGame = games[currentIndex] || games[0];
  const currentCover =
    currentGame?.media?.boxart3d ||
    currentGame?.media?.boxart2d ||
    currentGame?.media?.snap;
  const currentYear = currentGame?.metadata?.releaseDate?.slice(0, 4);
  const currentDev = currentGame?.metadata?.developer || 'Éditeur Original';
  const currentRating = currentGame?.metadata?.rating
    ? `${(currentGame.metadata.rating / 20).toFixed(1)}/5`
    : '4.8/5';
  const currentSynopsis = currentGame?.metadata?.synopsis;
  const currentGenre = currentGame?.metadata?.genres?.join(', ') || 'Action / Aventure';
  const currentPlayers = currentGame?.metadata?.players
    ? `${currentGame.metadata.players} Joueur(s)`
    : '1 à 2 Joueurs Simultanés';
  const currentTrivia: RetroTrivia = RETRO_TRIVIAS[currentTriviaIndex % RETRO_TRIVIAS.length];

  // Synthétiseur d'ambiance d'arcade Web Audio (bruit de pièce "Coin", jingle)
  const playCoinSound = useCallback(() => {
    if (isSoundMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'sine';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(987.77, audioCtx.currentTime); // B5
      osc1.frequency.setValueAtTime(1318.51, audioCtx.currentTime + 0.08); // E6
      osc2.frequency.setValueAtTime(987.77, audioCtx.currentTime);
      osc2.frequency.setValueAtTime(1318.51, audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 0.35);
      osc2.stop(audioCtx.currentTime + 0.35);
    } catch {}
    if (onPlaySound) onPlaySound('coin');
  }, [isSoundMuted, onPlaySound]);

  // Défilement automatique toutes les 8 secondes en mode attract
  useEffect(() => {
    if (!isOpen || games.length === 0) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % games.length);
      setCurrentTriviaIndex((prev) => (prev + 1) % RETRO_TRIVIAS.length);
    }, 8000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, games.length]);

  // Clignotement du voyant INSERT COIN
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setInsertCoinBlink((b) => !b);
    }, 600);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Rotation 3D continue
  useEffect(() => {
    if (!isOpen || !isAutoRotating) return;
    let animId: number;
    const update = () => {
      setRotationY((prev) => (prev + 0.5) % 360);
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    rotateAnimRef.current = animId;

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isOpen, isAutoRotating]);

  // Gestion des touches clavier pour quitter ou interagir
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.key === 'c' || e.key === 'C') {
        setCredits((c) => c + 1);
        playCoinSound();
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % games.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + games.length) % games.length);
      } else if (e.key === 'Enter') {
        if (currentGame && onLaunchGame) {
          onLaunchGame(currentGame);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, games.length, currentGame, onLaunchGame, onClose, playCoinSound]);

  if (!isOpen || !currentGame) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 sm:p-8 select-none overflow-hidden backdrop-blur-md">
      {/* Scanlines cathodiques arcade immersives */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black/90"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 3px)',
        }}
      />

      {/* Barre supérieure Arcade Header */}
      <div className="w-full max-w-6xl z-20 flex items-center justify-between border-b border-pink-500/30 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-pink-500/20 border border-pink-500/50 text-pink-400 animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 font-mono uppercase">
              RetroMAD • ATTRACT MODE
            </div>
            <div className="text-[11px] text-slate-400 flex items-center space-x-2">
              <span>BORNE ARCADE ACTIVE</span>
              <span>•</span>
              <span className="text-cyan-400 font-mono">DÉMONSTRATION EN CONTINU</span>
            </div>
          </div>
        </div>

        {/* Boutons d'interaction & Crédits */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            type="button"
            onClick={() => {
              setCredits((c) => c + 1);
              playCoinSound();
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold flex items-center space-x-1.5 transition active:scale-95 shadow-md shadow-amber-500/20"
            title="Insérer une pièce (Touche C ou Espace)"
          >
            <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>INSERT COIN ({credits})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSoundMuted(!isSoundMuted)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title={isSoundMuted ? 'Activer le son' : 'Couper le son'}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-pink-400" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/50 transition"
            title="Quitter l'Attract Mode (Échap)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Contenu central dynamique */}
      <div className="w-full max-w-6xl flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 py-4 z-20 overflow-y-auto">
        
        {/* Colonne Gauche : Jaquette, Vue 3D ou Boîte */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
          {/* Sélecteur de mode de vue */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl mb-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('arcade')}
              className={`px-3 py-1 rounded-lg transition ${
                viewMode === 'arcade'
                  ? 'bg-pink-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Borne Arcade
            </button>
            <button
              type="button"
              onClick={() => setViewMode('box3d')}
              className={`px-3 py-1 rounded-lg transition flex items-center space-x-1 ${
                viewMode === 'box3d'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Cartouche & Boîte 3D</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('trivia')}
              className={`px-3 py-1 rounded-lg transition flex items-center space-x-1 ${
                viewMode === 'trivia'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Trivia Rétro</span>
            </button>
          </div>

          {/* VUE 1 : BORNE D'ARCADE CINÉMATIQUE */}
          {viewMode === 'arcade' && (
            <div className="relative group w-full max-w-sm rounded-2xl overflow-hidden border-2 border-pink-500/60 shadow-[0_0_50px_rgba(236,72,153,0.35)] bg-slate-950">
              <div className="aspect-[4/3] w-full relative overflow-hidden bg-slate-900 flex items-center justify-center">
                {currentCover ? (
                  <img
                    src={currentCover}
                    alt={currentGame.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-600 p-6 text-center">
                    <Disc3 className="w-16 h-16 animate-spin mb-2" />
                    <span className="font-bold text-sm">{currentGame.title}</span>
                  </div>
                )}

                {/* Badge console */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 border border-cyan-400/50 text-cyan-300 font-mono text-xs font-bold backdrop-blur-md">
                  {currentGame.systemId}
                </div>

                {/* Badge Année */}
                {currentYear && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/80 border border-pink-400/50 text-pink-300 font-mono text-xs font-bold backdrop-blur-md">
                    {currentYear}
                  </div>
                )}

                {/* Overlay néon attract */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />
              </div>

              {/* Panneau d'informations du jeu */}
              <div className="p-4 bg-gradient-to-b from-slate-900 to-black border-t border-slate-800">
                <h2 className="text-lg font-black text-white truncate font-sans">
                  {currentGame.title}
                </h2>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                  <span>Éditeur: <strong className="text-slate-200">{currentDev}</strong></span>
                  <span className="text-amber-400 font-bold">★ {currentRating}</span>
                </div>
              </div>
            </div>
          )}

          {/* VUE 2 : CARTOUCHE ET BOÎTE 3D INTERACTIVE */}
          {viewMode === 'box3d' && (
            <div className="w-full flex flex-col items-center">
              {/* Type de cartouche */}
              <div className="flex items-center gap-1.5 mb-3">
                {(['snes', 'nes', 'megadrive', 'gameboy'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCartridgeType(t)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition ${
                      cartridgeType === t
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Scène 3D CSS */}
              <div
                className="w-64 h-72 flex items-center justify-center cursor-grab active:cursor-grabbing"
                style={{ perspective: '800px' }}
                onMouseDown={() => setIsAutoRotating(false)}
                onMouseUp={() => setIsAutoRotating(true)}
                onMouseMove={(e) => {
                  if (e.buttons === 1) {
                    setRotationY((prev) => prev + e.movementX * 0.8);
                    setRotationX((prev) => Math.max(-30, Math.min(30, prev - e.movementY * 0.8)));
                  }
                }}
              >
                <div
                  className="w-48 h-60 relative transition-transform duration-75"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
                  }}
                >
                  {/* FACE AVANT DE LA BOÎTE */}
                  <div
                    className="absolute inset-0 rounded-xl bg-slate-900 border-2 border-slate-700 shadow-2xl overflow-hidden flex flex-col"
                    style={{
                      transform: 'translateZ(18px)',
                      backfaceVisibility: 'visible',
                    }}
                  >
                    {/* Header console */}
                    <div className="bg-red-600 text-white font-black text-[9px] px-2 py-0.5 tracking-wider uppercase font-mono flex items-center justify-between">
                      <span>{cartridgeType.toUpperCase()} CLASSIC</span>
                      <span className="text-[8px] bg-white text-red-600 px-1 rounded">PAL-FR</span>
                    </div>

                    {/* Image jaquette */}
                    <div className="flex-1 relative overflow-hidden bg-slate-950 flex items-center justify-center">
                      {currentCover ? (
                        <img
                          src={currentCover}
                          alt={currentGame.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Disc3 className="w-12 h-12 text-slate-600" />
                      )}

                      {/* Sticker Micromania Prix d'époque vintage */}
                      <div className="absolute bottom-2 right-2 rotate-[-12deg] bg-amber-300 text-slate-950 font-mono font-black text-[9px] px-1.5 py-0.5 rounded shadow-md border border-amber-500">
                        349 Francs
                      </div>

                      {/* Sceau d'or Nintendo Quality */}
                      <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-200 to-amber-600 border border-amber-300 flex items-center justify-center text-[7px] font-black text-amber-950 shadow-md">
                        SEAL
                      </div>
                    </div>

                    <div className="p-1.5 bg-black text-[10px] font-bold text-white truncate text-center">
                      {currentGame.title}
                    </div>
                  </div>

                  {/* TRANCHE GAUCHE */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[36px] bg-slate-800 border border-slate-700 flex items-center justify-center -translate-x-[18px] text-[8px] font-bold text-slate-300 font-mono tracking-widest uppercase overflow-hidden"
                    style={{
                      transform: 'rotateY(-90deg) translateZ(0px)',
                    }}
                  >
                    <span className="rotate-90 whitespace-nowrap">{currentGame.title.slice(0, 16)}</span>
                  </div>

                  {/* FACE ARRIÈRE */}
                  <div
                    className="absolute inset-0 rounded-xl bg-slate-950 border-2 border-slate-700 p-2.5 flex flex-col justify-between text-slate-300"
                    style={{
                      transform: 'translateZ(-18px) rotateY(180deg)',
                    }}
                  >
                    <div className="text-[10px] font-bold text-pink-400 border-b border-slate-800 pb-1">
                      {currentGame.title}
                    </div>
                    <div className="text-[8px] text-slate-400 leading-tight line-clamp-6">
                      {currentSynopsis ||
                        'Un monument du jeu vidéo ! Explorez des mondes riches en secrets, maîtrisez un gameplay exigeant et découvrez les musiques cultes de l\'ère 16-bit.'}
                    </div>
                    <div className="pt-1 border-t border-slate-800 text-[8px] font-mono text-cyan-400 flex items-center justify-between">
                      <span>1-2 JOUEURS</span>
                      <span>SAUVEGARDE PILE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contrôles de rotation */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1.5 border transition ${
                    isAutoRotating
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} />
                  <span>{isAutoRotating ? 'Rotation Auto' : 'Rotation Manuelle'}</span>
                </button>
              </div>
            </div>
          )}

          {/* VUE 3 : ANECDOTE & TRIVIA HISTORIQUE */}
          {viewMode === 'trivia' && (
            <div className="w-full max-w-sm p-5 rounded-2xl bg-gradient-to-br from-purple-950/60 to-slate-900 border border-purple-500/40 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-purple-500/30 pb-2 mb-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-mono font-bold text-purple-300 uppercase">
                    Saviez-vous que... ?
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                  {currentTrivia.category.toUpperCase()}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-1">
                {currentTrivia.gameTitle} ({currentTrivia.year})
              </h3>
              <p className="text-xs text-purple-200/90 leading-relaxed italic mb-4">
                « {currentTrivia.fact} »
              </p>

              <button
                type="button"
                onClick={() => setCurrentTriviaIndex((i) => i + 1)}
                className="w-full py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-bold transition flex items-center justify-center space-x-1"
              >
                <span>Anecdote Suivante</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Colonne Droite : Démo Arcade & Appel à l'action */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-lg">
          
          {/* Signal Néon Clignotant INSERT COIN */}
          <div className="mb-4">
            <div
              className={`text-2xl sm:text-3xl font-black font-mono tracking-widest transition-opacity duration-300 ${
                insertCoinBlink ? 'opacity-100 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]' : 'opacity-20 text-yellow-600'
              }`}
            >
              ★ INSERT COIN ★
            </div>
            <div className="text-xs font-mono text-cyan-400 tracking-wider mt-1">
              PRESS START TO PLAY • CRÉDITS: {credits}
            </div>
          </div>

          {/* Description et spécifications du jeu */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 w-full mb-6 text-xs text-slate-300 space-y-2 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Système Émulé</span>
              <span className="font-bold text-white">{currentGame.systemId}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Genre</span>
              <span className="font-bold text-pink-400">{currentGenre}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Joueurs Supportés</span>
              <span className="font-bold text-cyan-400">{currentPlayers}</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed pt-1 line-clamp-3">
              {currentSynopsis ||
                'Plongez dans les bornes d\'arcade et les salons des années 80 et 90. Utilisez les manettes ou le clavier pour démarrer la partie immédiatement.'}
            </p>
          </div>

          {/* Boutons d'action : Lancer le jeu / Passer au jeu suivant */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            {onLaunchGame && (
              <button
                type="button"
                onClick={() => {
                  onLaunchGame(currentGame);
                  onClose();
                }}
                className="w-full sm:flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:scale-105 active:scale-95 transition"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>JOUER MAINTENANT</span>
              </button>
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => (prev - 1 + games.length) % games.length)}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex-1 sm:flex-initial flex items-center justify-center"
                title="Jeu Précédent"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => (prev + 1) % games.length)}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex-1 sm:flex-initial flex items-center justify-center"
                title="Jeu Suivant"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barre inférieure : Commandes clavier & Mode Kiosque */}
      <div className="w-full max-w-6xl z-20 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center space-x-3 font-mono">
          <span className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">ESPACE</kbd>
            <span>Pièce</span>
          </span>
          <span className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">ENTRÉE</kbd>
            <span>Lancer</span>
          </span>
          <span className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">← / →</kbd>
            <span>Naviguer</span>
          </span>
          <span className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">ÉCHAP</kbd>
            <span>Quitter</span>
          </span>
        </div>

        <div className="text-cyan-400 font-mono flex items-center space-x-1.5">
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Jeu {currentIndex + 1} sur {games.length}</span>
        </div>
      </div>
    </div>
  );
};
