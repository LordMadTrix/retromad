import React, { useState } from 'react';
import {
  Trophy,
  Swords,
  RotateCcw,
  X,
  Crown,
  Shuffle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TournamentMatch } from '../../types/retroFeatures';
import { Game } from '../../types';

interface ArcadeTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  onLaunchGame?: (game: Game) => void;
  onPlaySound?: (type: 'coin' | 'fanfare' | 'powerup') => void;
}

const DEFAULT_PLAYERS_POOL = [
  'Ryu_Master',
  'Ken_Flame',
  'ChunLi_Kick',
  'Guile_Sonic',
  'Retro_King',
  'Pixel_Queen',
  'Turbo_Gamer',
  'Arcade_Pro',
];

export const ArcadeTournamentModal: React.FC<ArcadeTournamentModalProps> = ({
  isOpen,
  onClose,
  games,
  onPlaySound,
}) => {
  const [tournamentSize, setTournamentSize] = useState<4 | 8>(8);
  const [selectedGameTitle, setSelectedGameTitle] = useState(
    games.find((g) => g.cleanTitle.toLowerCase().includes('street') || g.cleanTitle.toLowerCase().includes('kart'))?.cleanTitle ||
      games[0]?.cleanTitle ||
      'Street Fighter II Turbo'
  );

  const [players, setPlayers] = useState<string[]>(DEFAULT_PLAYERS_POOL.slice(0, 8));
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [champion, setChampion] = useState<string | null>(null);

  if (!isOpen) return null;

  // Initialisation de l'arbre du tournoi
  const handleStartTournament = () => {
    const initialMatches: TournamentMatch[] = [];

    // Round 1
    const matchCountR1 = tournamentSize / 2;
    for (let i = 0; i < matchCountR1; i++) {
      initialMatches.push({
        id: `r1_m${i}`,
        round: 1,
        matchIndex: i,
        player1: players[i * 2] || `Joueur ${i * 2 + 1}`,
        player2: players[i * 2 + 1] || `Joueur ${i * 2 + 2}`,
        score1: 0,
        score2: 0,
        isComplete: false,
      });
    }

    // Round 2 (Demis pour 8 joueurs ou Finale pour 4 joueurs)
    const matchCountR2 = matchCountR1 / 2;
    for (let i = 0; i < matchCountR2; i++) {
      initialMatches.push({
        id: `r2_m${i}`,
        round: 2,
        matchIndex: i,
        player1: 'En attente',
        player2: 'En attente',
        score1: 0,
        score2: 0,
        isComplete: false,
      });
    }

    // Round 3 (Finale si 8 joueurs)
    if (tournamentSize === 8) {
      initialMatches.push({
        id: 'r3_m0',
        round: 3,
        matchIndex: 0,
        player1: 'En attente',
        player2: 'En attente',
        score1: 0,
        score2: 0,
        isComplete: false,
      });
    }

    setMatches(initialMatches);
    setChampion(null);
    setIsConfiguring(false);
    if (onPlaySound) onPlaySound('powerup');
  };

  const handleUpdateScore = (matchId: string, score1: number, score2: number) => {
    const updated = matches.map((m) => {
      if (m.id !== matchId) return m;
      const winner = score1 > score2 ? m.player1 : score2 > score1 ? m.player2 : undefined;
      return {
        ...m,
        score1,
        score2,
        winner,
        isComplete: !!winner,
      };
    });

    // Propager les gagnants vers les rounds suivants
    const match = updated.find((m) => m.id === matchId);
    if (match && match.winner) {
      const nextRound = match.round + 1;
      const nextMatchIndex = Math.floor(match.matchIndex / 2);
      const isPlayer1Slot = match.matchIndex % 2 === 0;

      const nextMatch = updated.find(
        (m) => m.round === nextRound && m.matchIndex === nextMatchIndex
      );

      if (nextMatch) {
        if (isPlayer1Slot) {
          nextMatch.player1 = match.winner;
        } else {
          nextMatch.player2 = match.winner;
        }
      } else {
        // C'était la finale ! Victoire sacrée
        setChampion(match.winner);
        if (onPlaySound) onPlaySound('fanfare');
        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#ffd700', '#ff007f', '#00f2fe', '#ffffff'],
          });
        } catch {
          // ignore
        }
      }
    }

    setMatches(updated);
  };

  const handleShufflePlayers = () => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    setPlayers(shuffled);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b1329] border border-cyan-500/30 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(0,242,254,0.15)] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0d1838] flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Swords className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white tracking-wide">
                  Tournoi Arcade & Multijoueur
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono font-bold">
                  {selectedGameTitle}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Générateur d'arbres de tournoi (Bracket) pour vos soirées rétrogaming
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isConfiguring && (
              <button
                onClick={() => setIsConfiguring(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Nouveau Tournoi</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Screen */}
        {isConfiguring ? (
          <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full space-y-6">
            {/* Choix du jeu */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Jeu du Tournoi
              </label>
              <select
                value={selectedGameTitle}
                onChange={(e) => setSelectedGameTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
              >
                {games.map((g) => (
                  <option key={g.id} value={g.cleanTitle}>
                    {g.cleanTitle} ({g.systemId.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Nombre de participants */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Format de l'arbre
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTournamentSize(4);
                    setPlayers((p) => p.slice(0, 4));
                  }}
                  className={`p-3.5 rounded-xl border text-center font-bold transition ${
                    tournamentSize === 4
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-lg">4 Joueurs</div>
                  <div className="text-[11px] font-normal text-slate-400">Demi-finales + Finale</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTournamentSize(8);
                    if (players.length < 8) setPlayers(DEFAULT_PLAYERS_POOL.slice(0, 8));
                  }}
                  className={`p-3.5 rounded-xl border text-center font-bold transition ${
                    tournamentSize === 8
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-lg">8 Joueurs</div>
                  <div className="text-[11px] font-normal text-slate-400">Quarts + Demies + Finale</div>
                </button>
              </div>
            </div>

            {/* Roster des Joueurs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Participants ({tournamentSize})
                </label>
                <button
                  type="button"
                  onClick={handleShufflePlayers}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Mélanger l'ordre</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Array.from({ length: tournamentSize }).map((_, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="w-6 text-center font-mono text-xs text-slate-500 font-bold">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={players[idx] || ''}
                      onChange={(e) => {
                        const next = [...players];
                        next[idx] = e.target.value;
                        setPlayers(next);
                      }}
                      placeholder={`Joueur ${idx + 1}`}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartTournament}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/25 transition"
            >
              <Trophy className="w-5 h-5" />
              <span>Générer le Bracket du Tournoi</span>
            </button>
          </div>
        ) : (
          /* Bracket Tree View */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col justify-between">
            {/* Bannière Champion si terminé */}
            {champion && (
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 border-2 border-amber-400/80 text-center animate-in zoom-in-95 duration-300 shadow-[0_0_40px_rgba(251,191,36,0.3)]">
                <Crown className="w-8 h-8 text-amber-300 mx-auto mb-1 animate-bounce" />
                <h3 className="text-xl font-black text-white">CHAMPION DU TOURNOI : {champion}</h3>
                <p className="text-xs text-amber-300 mt-0.5">
                  Vainqueur suprême sur {selectedGameTitle} !
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Colonne 1: Round 1 */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center border-b border-slate-800 pb-2">
                  {tournamentSize === 8 ? 'Quarts de Finale' : 'Demi-Finales'}
                </div>
                {matches
                  .filter((m) => m.round === 1)
                  .map((m) => (
                    <MatchCard key={m.id} match={m} onUpdateScore={handleUpdateScore} />
                  ))}
              </div>

              {/* Colonne 2: Round 2 (Demis si 8, ou Finale si 4) */}
              <div className="space-y-6">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center border-b border-slate-800 pb-2">
                  {tournamentSize === 8 ? 'Demi-Finales' : 'Grande Finale'}
                </div>
                {matches
                  .filter((m) => m.round === 2)
                  .map((m) => (
                    <MatchCard key={m.id} match={m} onUpdateScore={handleUpdateScore} />
                  ))}
              </div>

              {/* Colonne 3: Grande Finale si 8 joueurs */}
              {tournamentSize === 8 && (
                <div className="space-y-4">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider text-center border-b border-amber-500/30 pb-2 flex items-center justify-center space-x-1">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Grande Finale</span>
                  </div>
                  {matches
                    .filter((m) => m.round === 3)
                    .map((m) => (
                      <MatchCard
                        key={m.id}
                        match={m}
                        onUpdateScore={handleUpdateScore}
                        isFinal
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MatchCard: React.FC<{
  match: TournamentMatch;
  onUpdateScore: (matchId: string, score1: number, score2: number) => void;
  isFinal?: boolean;
}> = ({ match, onUpdateScore, isFinal }) => {
  const isP1Winner = match.winner === match.player1;
  const isP2Winner = match.winner === match.player2;

  return (
    <div
      className={`p-3 rounded-xl border transition-all ${
        isFinal
          ? 'bg-amber-950/30 border-amber-500/50 shadow-md'
          : match.isComplete
          ? 'bg-slate-900/90 border-slate-800'
          : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
      }`}
    >
      {/* Player 1 */}
      <div
        className={`flex items-center justify-between p-1.5 rounded-lg transition ${
          isP1Winner ? 'bg-amber-500/20 text-white font-bold' : 'text-slate-300'
        }`}
      >
        <span className="text-xs truncate max-w-[130px] flex items-center space-x-1.5">
          {isP1Winner && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
          <span>{match.player1}</span>
        </span>
        <button
          type="button"
          onClick={() => onUpdateScore(match.id, match.score1 + 1, match.score2)}
          className="w-7 h-6 rounded bg-slate-800 hover:bg-slate-700 font-mono text-xs font-bold text-center border border-slate-700 text-white"
          title="Incrémenter score Joueur 1"
        >
          {match.score1}
        </button>
      </div>

      <div className="h-px bg-slate-800 my-1" />

      {/* Player 2 */}
      <div
        className={`flex items-center justify-between p-1.5 rounded-lg transition ${
          isP2Winner ? 'bg-amber-500/20 text-white font-bold' : 'text-slate-300'
        }`}
      >
        <span className="text-xs truncate max-w-[130px] flex items-center space-x-1.5">
          {isP2Winner && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
          <span>{match.player2}</span>
        </span>
        <button
          type="button"
          onClick={() => onUpdateScore(match.id, match.score1, match.score2 + 1)}
          className="w-7 h-6 rounded bg-slate-800 hover:bg-slate-700 font-mono text-xs font-bold text-center border border-slate-700 text-white"
          title="Incrémenter score Joueur 2"
        >
          {match.score2}
        </button>
      </div>

      {/* Quick Pick Winner Buttons */}
      {!match.isComplete && match.player1 !== 'En attente' && match.player2 !== 'En attente' && (
        <div className="mt-2 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
          <span>Gagnant :</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onUpdateScore(match.id, 2, 0)}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              J1
            </button>
            <button
              onClick={() => onUpdateScore(match.id, 0, 2)}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              J2
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
