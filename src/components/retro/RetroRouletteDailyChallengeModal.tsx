import React, { useState, useEffect, useRef } from 'react';
import {
  Dices,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Flame,
  X,
  Target,
  Shuffle,
  Star,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Game } from '../../types';
import { DailyChallenge } from '../../types/retroFeatures';
import { INITIAL_DAILY_CHALLENGES } from '../../data/retroFeaturesData';

interface RetroRouletteDailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  systems?: any[];
  onLaunchGame: (game: Game) => void;
  onViewGame?: (game: Game) => void;
  onSelectGame?: (game: Game) => void;
  onPlaySound?: (type: 'coin' | 'fanfare' | 'powerup') => void;
  challenges?: DailyChallenge[];
  onCompleteChallenge?: (challengeId: string) => void;
}

export const RetroRouletteDailyChallengeModal: React.FC<RetroRouletteDailyChallengeModalProps> = ({
  isOpen,
  onClose,
  games,
  systems: _systems,
  onLaunchGame,
  onViewGame,
  onSelectGame,
  onPlaySound,
  challenges = INITIAL_DAILY_CHALLENGES,
  onCompleteChallenge,
}) => {
  const handleView = onViewGame || onSelectGame || (() => {});
  const [activeTab, setActiveTab] = useState<'roulette' | 'daily'>('roulette');

  // Roulette States
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [displayedTitle, setDisplayedTitle] = useState('Prêt à lancer la roulette...');
  const spinIntervalRef = useRef<any>(null);

  // Daily Challenge States
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 min default
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isChallengeDone, setIsChallengeDone] = useState(false);

  const activeChallenge = challenges[currentChallengeIndex] || challenges[0];

  // Minuteur du défi
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  if (!isOpen) return null;

  const eligibleGames = onlyFavorites ? games.filter((g) => g.favorite) : games;
  const pool = eligibleGames.length > 0 ? eligibleGames : games;

  // Lancement de la roulette avec effet de ralentissement
  const handleSpinRoulette = () => {
    if (isSpinning || pool.length === 0) return;
    setIsSpinning(true);
    setSelectedGame(null);
    if (onPlaySound) onPlaySound('coin');

    let counter = 0;
    const totalTicks = 25;
    let delay = 60;

    const tick = () => {
      counter++;
      const randomIdx = Math.floor(Math.random() * pool.length);
      const game = pool[randomIdx];
      setDisplayedTitle(game.cleanTitle);

      if (counter < totalTicks) {
        delay += counter > 15 ? 30 : 5; // Ralentissement progressif
        spinIntervalRef.current = setTimeout(tick, delay);
      } else {
        // Arrêt / Jackpot
        setIsSpinning(false);
        setSelectedGame(game);
        if (onPlaySound) onPlaySound('fanfare');
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#00f2fe', '#ffd700', '#ff007f'],
          });
        } catch {
          // ignore
        }
      }
    };

    tick();
  };

  const handleValidateChallenge = () => {
    setIsChallengeDone(true);
    setIsTimerRunning(false);
    if (onCompleteChallenge && activeChallenge) {
      onCompleteChallenge(activeChallenge.id);
    }
    if (onPlaySound) onPlaySound('fanfare');
    try {
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { y: 0.5 },
        colors: ['#10b981', '#ffd700', '#00f2fe'],
      });
    } catch {
      // ignore
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b1329] border border-cyan-500/30 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(0,242,254,0.15)] overflow-hidden">
        {/* Header avec Tabs */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0d1838] flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <Dices className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white tracking-wide">
                  Arcade Lab : Roulette & Défis
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Tirage au sort aléatoire de jeu ou mission quotidienne minutée
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 py-2.5 bg-[#080e22] border-b border-slate-800/80 flex items-center space-x-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('roulette')}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition ${
              activeTab === 'roulette'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Roulette Rétro (Jeu Mystère)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition ${
              activeTab === 'daily'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Défi du Jour</span>
          </button>
        </div>

        {/* Tab 1: Roulette Rétro */}
        {activeTab === 'roulette' && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-between text-center space-y-6">
            {/* Slot Machine Display */}
            <div className="w-full max-w-xl bg-slate-950/90 p-6 rounded-3xl border-2 border-cyan-500/40 shadow-[0_0_30px_rgba(0,242,254,0.15)] flex flex-col items-center">
              <div className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase font-bold mb-2">
                ★ MACHINE À SOUS RÉTROMAD ★
              </div>

              {/* Slot Window */}
              <div className="w-full bg-[#0a1026] border-2 border-slate-700/80 rounded-2xl py-8 px-4 flex flex-col items-center justify-center min-h-[140px] shadow-inner relative overflow-hidden">
                <div
                  className={`text-xl sm:text-2xl font-black transition-all ${
                    isSpinning
                      ? 'text-cyan-300 scale-105 blur-[0.4px]'
                      : selectedGame
                      ? 'text-amber-300 scale-110'
                      : 'text-white'
                  }`}
                >
                  {displayedTitle}
                </div>

                {selectedGame && !isSpinning && (
                  <div className="text-xs text-slate-400 mt-2 font-mono">
                    Console : {selectedGame.systemId.toUpperCase()} · Note :{' '}
                    {selectedGame.metadata.rating || 85}%
                  </div>
                )}
              </div>

              {/* Only Favorites toggle */}
              <div className="mt-4 flex items-center space-x-2 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setOnlyFavorites((f) => !f)}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition ${
                    onlyFavorites
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>Tirer uniquement parmi mes Favoris</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 w-full max-w-md">
              <button
                type="button"
                onClick={handleSpinRoulette}
                disabled={isSpinning}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/30 flex items-center justify-center space-x-2 disabled:opacity-50 transition"
              >
                <Dices className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{isSpinning ? 'TIRAGE EN COURS...' : 'ACTIONNER LA ROULETTE !'}</span>
              </button>

              {selectedGame && !isSpinning && (
                <div className="flex items-center space-x-3 animate-in fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      onLaunchGame(selectedGame);
                      onClose();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase flex items-center justify-center space-x-1.5 shadow-md transition"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Lancer Immédiatement</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleView(selectedGame);
                      onClose();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
                  >
                    Voir la Fiche
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Défi du Jour */}
        {activeTab === 'daily' && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-between text-center space-y-6">
            <div className="w-full max-w-xl bg-slate-950/90 p-6 rounded-3xl border-2 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col items-center">
              <div className="flex items-center space-x-2 mb-2">
                <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase font-bold">
                  MISSION DU JOUR : {activeChallenge?.difficulty}
                </span>
              </div>

              <h3 className="text-xl font-black text-white">{activeChallenge?.challengeTitle}</h3>
              <div className="text-xs text-amber-400 font-bold mt-0.5">
                {activeChallenge?.gameTitle} ({activeChallenge?.systemName})
              </div>

              <p className="text-xs text-slate-300 mt-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 max-w-md leading-relaxed">
                {activeChallenge?.objective}
              </p>

              {/* Timer & Chrono */}
              <div className="mt-5 flex items-center space-x-4">
                <div className="bg-slate-900 px-5 py-2 rounded-2xl border border-slate-800 text-2xl font-black font-mono text-amber-400 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span>{formatTimer(timerSeconds)}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => setIsTimerRunning((r) => !r)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                      isTimerRunning
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    {isTimerRunning ? 'Pause' : 'Démarrer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds((activeChallenge?.timeLimitMinutes || 5) * 60);
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                    title="Réinitialiser le chrono"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* XP Reward */}
              <div className="mt-4 text-xs font-mono text-slate-400">
                Récompense :{' '}
                <strong className="text-amber-400 font-bold">+{activeChallenge?.xpReward} XP</strong>{' '}
                au profil joueur
              </div>
            </div>

            {/* Validation & Shuffle Buttons */}
            <div className="space-y-2 w-full max-w-md">
              <button
                type="button"
                onClick={handleValidateChallenge}
                disabled={isChallengeDone}
                className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-lg ${
                  isChallengeDone
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/25'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{isChallengeDone ? 'DÉFI VALIDÉ AVEC SUCCÈS !' : 'VALIDER LE DÉFI RÉUSSI'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentChallengeIndex((prev) => (prev + 1) % challenges.length);
                  setIsChallengeDone(false);
                  setIsTimerRunning(false);
                  setTimerSeconds(300);
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center justify-center space-x-1 mx-auto py-1"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Piocher un autre défi</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
