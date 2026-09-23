import React, { useState, useEffect } from 'react';
import {
  X,
  Beer,
  Trophy,
  Users,
  Dices,
  Play,
  RotateCcw,
  Sparkles,
  Flame,
} from 'lucide-react';
import { Game } from '../../types';
import { PartyPlayer, PartyDare } from '../../types/extendedFeatures';
import { PARTY_DARES } from '../../data/extendedFeaturesData';

interface ArcadePartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  onPlaySound?: (type: 'coin' | 'powerup' | 'fanfare') => void;
}

export const ArcadePartyModal: React.FC<ArcadePartyModalProps> = ({
  isOpen,
  onClose,
  games,
  onPlaySound,
}) => {
  const [selectedGameId, setSelectedGameId] = useState<string>(games[0]?.id || '');
  const [roundDuration, setRoundDuration] = useState<number>(90); // 90 secondes par tour
  const [timeLeft, setTimeLeft] = useState<number>(90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const [players, setPlayers] = useState<PartyPlayer[]>([
    { id: 'p1', name: 'Joueur 1', score: 0, roundsWon: 0, avatar: '👾' },
    { id: 'p2', name: 'Joueur 2', score: 0, roundsWon: 0, avatar: '🕹️' },
    { id: 'p3', name: 'Joueur 3', score: 0, roundsWon: 0, avatar: '⚡' },
    { id: 'p4', name: 'Joueur 4', score: 0, roundsWon: 0, avatar: '🔥' },
  ]);

  const [activeDare, setActiveDare] = useState<PartyDare | null>(null);

  // Décompte du timer
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      if (onPlaySound) onPlaySound('fanfare');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, onPlaySound]);

  if (!isOpen) return null;

  const selectedGame = games.find((g) => g.id === selectedGameId) || games[0];
  const activePlayer = players[currentPlayerIndex];

  // Tirer un gage rétro aléatoire
  const handleRollDare = () => {
    const randomDare = PARTY_DARES[Math.floor(Math.random() * PARTY_DARES.length)];
    setActiveDare(randomDare);
    if (onPlaySound) onPlaySound('coin');
  };

  // Passer au joueur suivant
  const handleNextPlayer = () => {
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    setTimeLeft(roundDuration);
    setIsTimerRunning(false);
    setActiveDare(null);
    if (onPlaySound) onPlaySound('powerup');
  };

  // Attribuer une victoire de round
  const handleAwardWin = (playerId: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, roundsWon: p.roundsWon + 1, score: p.score + 100 } : p))
    );
    if (onPlaySound) onPlaySound('fanfare');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-950 border border-amber-500/40 rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Beer className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black tracking-wider text-white uppercase">
                  Mode Soirée & Bar Arcade (Party Mode)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase">
                  Animation Multi-Joueurs
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Chronomètre de rotation des manettes, défis gages rétro et tableau des scores pour vos soirées.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps principal (Grille 12 colonnes) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Zone Chrono & Joueur Actuel (7 cols) */}
          <div className="lg:col-span-7 space-y-5 flex flex-col justify-between">
            
            {/* Carte Joueur Actif */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Flame className="w-4 h-4" />
                  <span>Manette en Main</span>
                </span>
                <span className="text-xs bg-slate-950 px-3 py-1 rounded-full border border-slate-800 font-mono text-slate-300">
                  Jeu : {selectedGame?.title}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-3xl shadow-lg">
                  {activePlayer.avatar}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">{activePlayer.name}</h3>
                  <p className="text-xs text-slate-400">
                    {activePlayer.roundsWon} victoire(s) • {activePlayer.score} pts
                  </p>
                </div>
              </div>

              {/* Minuteur Géant */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Temps de Jeu Restant
                </span>
                <div className="text-6xl font-black font-mono text-amber-400">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                {timeLeft === 0 && (
                  <div className="text-sm font-black text-red-400 uppercase animate-pulse">
                    ⚡ TEMPS ÉCOULÉ ! PASSE LA MANETTE ! ⚡
                  </div>
                )}
              </div>

              {/* Contrôles du Minuteur */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition ${
                    isTimerRunning
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  <span>{isTimerRunning ? 'Pause' : 'Démarrer'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTimeLeft(roundDuration);
                    setIsTimerRunning(false);
                  }}
                  className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase flex items-center justify-center space-x-2 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextPlayer}
                  className="py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase flex items-center justify-center space-x-2 transition"
                >
                  <Users className="w-4 h-4" />
                  <span>Suivant</span>
                </button>
              </div>
            </div>

            {/* Générateur de Gages & Défis Rétro */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
                  <Dices className="w-4 h-4 text-purple-400" />
                  <span>Gage Rétro Aléatoire</span>
                </h4>
                <button
                  type="button"
                  onClick={handleRollDare}
                  className="px-3 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500 hover:text-white text-purple-300 text-xs font-bold transition flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tirer un Gage</span>
                </button>
              </div>

              {activeDare ? (
                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-1">
                  <p className="text-xs font-bold text-white">« {activeDare.text} »</p>
                  <p className="text-[11px] text-purple-300 font-semibold">{activeDare.penalty}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Cliquez sur "Tirer un Gage" pour pimenter la partie avec un handicap ou un défi délirant.
                </p>
              )}
            </div>

          </div>

          {/* Classement de la Soirée & Options (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Leaderboard des Joueurs */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Classement de la Soirée</span>
              </h4>

              <div className="space-y-2">
                {[...players]
                  .sort((a, b) => b.roundsWon - a.roundsWon)
                  .map((player, idx) => (
                    <div
                      key={player.id}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                          idx === 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>
                          #{idx + 1}
                        </span>
                        <span className="text-base">{player.avatar}</span>
                        <div>
                          <span className="text-xs font-bold text-white block">{player.name}</span>
                          <span className="text-[10px] text-slate-400">{player.score} points</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAwardWin(player.id)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 text-[10px] font-black uppercase tracking-wider transition"
                      >
                        +1 Win
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Réglage du jeu et de la durée */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Jeu de Tournoi</label>
                <select
                  value={selectedGameId}
                  onChange={(e) => setSelectedGameId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                >
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title} ({g.systemId.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Durée par joueur (sec)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[60, 90, 180].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setRoundDuration(s);
                        setTimeLeft(s);
                      }}
                      className={`p-2 rounded-xl border font-bold text-xs transition ${
                        roundDuration === s
                          ? 'bg-amber-500/20 border-amber-500 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {s}s ({s / 60} min)
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>Idéal pour animer les anniversaires, soirées arcade et tournois de salon.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Fermer le Mode Soirée
          </button>
        </div>

      </div>
    </div>
  );
};
