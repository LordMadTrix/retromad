import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Flag,
  Trophy,
  Flame,
  Gamepad2,
} from 'lucide-react';
import { Game } from '../../types';

interface Split {
  id: string;
  name: string;
  targetSeconds?: number;
  completedSeconds?: number;
  bestSeconds?: number;
}

interface SpeedrunRecord {
  gameId: string;
  gameTitle: string;
  category: string;
  totalTimeFormatted: string;
  date: string;
  splits: { name: string; timeFormatted: string }[];
}

interface ArcadeSpeedrunModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  activeGame?: Game | null;
  onLaunchGame?: (game: Game) => void;
  onPlaySound?: (type: 'split' | 'pb' | 'click' | 'reset') => void;
}

const DEFAULT_TEMPLATES: Record<string, string[]> = {
  default: ['Segment 1 / Intro', 'Boss 1 / Monde 1', 'Mi-parcours', 'Niveau Final', 'Boss Final (GG)'],
  platformer: ['Monde 1-1', 'Monde 1-4 (Château)', 'Warp Zone / Monde 4', 'Monde 8-1', 'Bowser Final'],
  adventure: ['Épée & Bouclier', 'Donjon 1', 'Donjon 2', 'Temple du Temps', 'Ganon Final'],
  action: ['Stage 1', 'Stage 2', 'Boss Mi-Jeu', 'Stage 4', 'Fin du Run'],
};

export const ArcadeSpeedrunModal: React.FC<ArcadeSpeedrunModalProps> = ({
  isOpen,
  onClose,
  games,
  activeGame,
  onLaunchGame,
  onPlaySound,
}) => {
  const [selectedGameId, setSelectedGameId] = useState<string>(activeGame?.id || (games[0]?.id ?? ''));
  const [category, setCategory] = useState<string>('Any% (Finir le jeu au plus vite)');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [currentSplitIndex, setCurrentSplitIndex] = useState<number>(0);
  const [splits, setSplits] = useState<Split[]>([]);
  const [personalBests, setPersonalBests] = useState<Record<string, SpeedrunRecord>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Charger les records personnels depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('retromad_speedrun_records');
      if (saved) {
        setPersonalBests(JSON.parse(saved));
      }
    } catch {
      // Ignorer
    }
  }, []);

  // Initialiser les splits quand le jeu change
  useEffect(() => {
    const game = games.find((g) => g.id === selectedGameId);
    let template = DEFAULT_TEMPLATES.default;
    if (game?.metadata?.genres?.some((gen) => /plateforme|platform/i.test(gen))) {
      template = DEFAULT_TEMPLATES.platformer;
    } else if (game?.metadata?.genres?.some((gen) => /aventure|rpg|zelda/i.test(gen))) {
      template = DEFAULT_TEMPLATES.adventure;
    }

    setSplits(
      template.map((name, idx) => ({
        id: `split-${idx}`,
        name,
      }))
    );
    setIsRunning(false);
    setElapsedMs(0);
    setCurrentSplitIndex(0);
    setIsFinished(false);
  }, [selectedGameId, games]);

  // Boucle de chronométrage haute précision
  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = performance.now();
      timerRef.current = window.setInterval(() => {
        const now = performance.now();
        const delta = now - lastTimeRef.current;
        lastTimeRef.current = now;
        setElapsedMs((prev) => prev + delta);
      }, 10);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Raccourcis clavier (Espace = Split / Start, R = Reset)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTriggerSplit();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isRunning, currentSplitIndex, splits, elapsedMs]);

  if (!isOpen) return null;

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSecs / 60);
    const seconds = totalSecs % 60;
    const hundredths = Math.floor((ms % 1000) / 10);

    const mStr = minutes.toString().padStart(2, '0');
    const sStr = seconds.toString().padStart(2, '0');
    const hStr = hundredths.toString().padStart(2, '0');

    return `${mStr}:${sStr}.${hStr}`;
  };

  const handleStartPause = () => {
    if (onPlaySound) onPlaySound('click');
    setIsRunning((prev) => !prev);
  };

  const handleTriggerSplit = () => {
    if (!isRunning && currentSplitIndex === 0 && !isFinished) {
      // Démarre le chronomètre au 1er appui
      setIsRunning(true);
      if (onPlaySound) onPlaySound('click');
      return;
    }

    if (!isRunning || isFinished) return;

    if (onPlaySound) onPlaySound('split');

    const updatedSplits = [...splits];
    updatedSplits[currentSplitIndex] = {
      ...updatedSplits[currentSplitIndex],
      completedSeconds: elapsedMs / 1000,
    };
    setSplits(updatedSplits);

    if (currentSplitIndex < splits.length - 1) {
      setCurrentSplitIndex((prev) => prev + 1);
    } else {
      // Run terminé !
      setIsRunning(false);
      setIsFinished(true);
      if (onPlaySound) onPlaySound('pb');

      // Sauvegarder le PB si meilleur
      const currentGame = games.find((g) => g.id === selectedGameId);
      const gameTitle = currentGame?.cleanTitle || 'Jeu Rétro';
      const record: SpeedrunRecord = {
        gameId: selectedGameId,
        gameTitle,
        category,
        totalTimeFormatted: formatTime(elapsedMs),
        date: new Date().toLocaleDateString('fr-FR'),
        splits: updatedSplits.map((s) => ({
          name: s.name,
          timeFormatted: formatTime((s.completedSeconds || 0) * 1000),
        })),
      };

      const newPBs = { ...personalBests, [selectedGameId]: record };
      setPersonalBests(newPBs);
      try {
        localStorage.setItem('retromad_speedrun_records', JSON.stringify(newPBs));
      } catch {
        // Ignorer
      }
    }
  };

  const handleReset = () => {
    if (onPlaySound) onPlaySound('reset');
    setIsRunning(false);
    setElapsedMs(0);
    setCurrentSplitIndex(0);
    setIsFinished(false);
    setSplits((prev) =>
      prev.map((s) => ({
        ...s,
        completedSeconds: undefined,
      }))
    );
  };

  const currentPB = personalBests[selectedGameId];
  const currentGame = games.find((g) => g.id === selectedGameId);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-neon">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide uppercase flex items-center space-x-2">
                <span>Chronomètre Speedrun Arcade Pro</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                  Temps Réel
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Suivi des temps au tour (splits), comparaison avec votre Personal Best et records rétro.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps principal : Splits à gauche, Grand Chrono à droite */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Colonne Gauche : Sélection du jeu & Liste des Splits */}
          <div className="lg:col-span-6 p-4 sm:p-6 overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between">
            <div>
              {/* Sélecteur de Jeu */}
              <div className="mb-4">
                <label className="text-[11px] font-mono uppercase text-slate-400 font-bold block mb-1">
                  Jeu à chronométrer :
                </label>
                <select
                  value={selectedGameId}
                  onChange={(e) => setSelectedGameId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                >
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.cleanTitle}
                    </option>
                  ))}
                </select>
              </div>

              {/* Catégorie */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">Catégorie du Run :</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-slate-800 text-amber-300 border border-slate-700 rounded-xl px-2.5 py-1 text-[11px] font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="Any% (Finir le jeu au plus vite)">Any% (Au plus vite)</option>
                  <option value="100% (Tout collecter)">100% (Complétion)</option>
                  <option value="Glitchless (Sans bugs)">Glitchless (Puriste)</option>
                </select>
              </div>

              {/* Tableau des Segments / Splits */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase px-3 py-1">
                  <span>Segment / Étape</span>
                  <span>Temps Réalisé</span>
                </div>

                {splits.map((split, idx) => {
                  const isCurrent = idx === currentSplitIndex && isRunning;
                  const isPast = split.completedSeconds !== undefined;

                  return (
                    <div
                      key={split.id}
                      className={`px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono transition ${
                        isCurrent
                          ? 'bg-amber-500/20 border border-amber-500/50 text-white font-bold animate-pulse'
                          : isPast
                          ? 'bg-slate-800/80 border border-slate-700/60 text-slate-200'
                          : 'bg-slate-800/30 border border-slate-800/40 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="w-5 text-slate-500 text-[10px] font-bold">#{idx + 1}</span>
                        <span className="truncate">{split.name}</span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {isPast ? (
                          <span className="text-emerald-400 font-bold">
                            {formatTime((split.completedSeconds || 0) * 1000)}
                          </span>
                        ) : isCurrent ? (
                          <span className="text-amber-400 font-bold">{formatTime(elapsedMs)}</span>
                        ) : (
                          <span className="text-slate-600">-:--.--</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Raccourcis manette / clavier */}
            <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <span>⌨️ <strong>Espace</strong> : Split / Start</span>
              <span>⌨️ <strong>R</strong> : Reset</span>
            </div>
          </div>

          {/* Colonne Droite : Grand Chronomètre & Commandes */}
          <div className="lg:col-span-6 p-4 sm:p-6 bg-slate-950 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              {/* Grand Affichage Digital */}
              <div className="text-center py-6 px-4 rounded-3xl bg-slate-900/90 border-2 border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1">
                  TEMPS ÉCOULÉ
                </div>
                <div
                  className={`text-5xl sm:text-6xl font-black font-mono tracking-tight drop-shadow-md ${
                    isFinished
                      ? 'text-emerald-400 animate-bounce'
                      : isRunning
                      ? 'text-amber-300'
                      : 'text-white'
                  }`}
                >
                  {formatTime(elapsedMs)}
                </div>

                {/* Badge d'état */}
                <div className="mt-3 flex items-center justify-center space-x-2">
                  {isFinished ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center space-x-1.5 shadow">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>RUN TERMINÉ ! FÉLICITATIONS</span>
                    </span>
                  ) : isRunning ? (
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center space-x-1.5 animate-pulse">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      <span>RUN EN COURS • {splits[currentSplitIndex]?.name}</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-mono">
                      EN ATTENTE DE DÉPART
                    </span>
                  )}
                </div>
              </div>

              {/* Boutons d'Action Arcade */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleStartPause}
                  className={`py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition shadow-lg flex items-center justify-center space-x-2 active:scale-95 ${
                    isRunning
                      ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-neon'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-5 h-5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      <span>{elapsedMs > 0 ? 'Reprendre' : 'Démarrer (Start)'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleTriggerSplit}
                  disabled={!isRunning || isFinished}
                  className={`py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition flex items-center justify-center space-x-2 ${
                    isRunning && !isFinished
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-neon active:scale-95'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/50'
                  }`}
                >
                  <Flag className="w-5 h-5" />
                  <span>Split (Tour)</span>
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs transition flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Remettre à Zéro (Reset)</span>
                </button>

                {currentGame && onLaunchGame && (
                  <button
                    onClick={() => {
                      onLaunchGame(currentGame);
                      onClose();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center justify-center space-x-2 shadow"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>Lancer le Jeu</span>
                  </button>
                )}
              </div>

              {/* Fiche Personal Best (PB) */}
              {currentPB && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-amber-300 flex items-center space-x-1.5">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>Record Personnel (PB)</span>
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">{currentPB.date}</span>
                  </div>
                  <div className="text-xl font-black text-white font-mono">{currentPB.totalTimeFormatted}</div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 text-center">
              <span className="text-[11px] text-slate-500 font-mono">
                RetroMAD Speedrun Engine &bull; Conforme aux règles d'émulation arcade
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
