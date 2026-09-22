import React, { useState } from 'react';
import {
  Trophy,
  Award,
  CheckCircle2,
  Plus,
  X,
  Search,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RetroAchievement, PlayerProfile } from '../../types/retroFeatures';
import { Game } from '../../types';

interface RetroAchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: RetroAchievement[];
  onToggleUnlock?: (id: string) => void;
  onUnlockAchievement?: (id: string) => void;
  onAddAchievement?: (achievement: RetroAchievement) => void;
  profile: PlayerProfile;
  games: Game[];
  filterGameId?: string;
  selectedGameId?: string;
  onLaunchGame?: (gameId: string) => void;
  onPlaySound?: (type: 'coin' | 'fanfare' | 'powerup') => void;
}

export const RetroAchievementsModal: React.FC<RetroAchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
  onToggleUnlock,
  onUnlockAchievement,
  onAddAchievement,
  profile,
  games,
  filterGameId,
  selectedGameId,
  onLaunchGame: _onLaunchGame,
  onPlaySound,
}) => {
  const toggleHandler = onToggleUnlock || onUnlockAchievement || (() => {});
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>(selectedGameId || filterGameId || 'all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Achievement Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newGameId, setNewGameId] = useState(games[0]?.id || 'smw');
  const [newBadge, setNewBadge] = useState('🏆');
  const [newType, setNewType] = useState<'bronze' | 'silver' | 'gold' | 'platinum'>('bronze');
  const [newPoints, setNewPoints] = useState(25);

  if (!isOpen) return null;

  const filteredAchievements = achievements.filter((a) => {
    if (selectedGameFilter !== 'all' && a.gameId !== selectedGameFilter) return false;
    if (statusFilter === 'unlocked' && !a.unlocked) return false;
    if (statusFilter === 'locked' && a.unlocked) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.gameTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPoints = achievements.filter((a) => a.unlocked).reduce((acc, a) => acc + a.points, 0);
  const totalUnlocked = achievements.filter((a) => a.unlocked).length;
  const completionPct = achievements.length ? Math.round((totalUnlocked / achievements.length) * 100) : 0;

  const handleUnlockWithCelebration = (id: string, currentlyUnlocked: boolean) => {
    toggleHandler(id);
    if (!currentlyUnlocked) {
      if (onPlaySound) onPlaySound('fanfare');
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f2fe', '#4facfe', '#ffd700', '#ff007f'],
        });
      } catch {
        // Fallback si canvas non dispo
      }
    }
  };

  const handleCreateAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const game = games.find((g) => g.id === newGameId);
    const item: RetroAchievement = {
      id: `custom_${Date.now()}`,
      gameId: newGameId,
      gameTitle: game ? game.cleanTitle : 'Jeu Rétro',
      title: newTitle.trim(),
      description: newDesc.trim() || 'Accomplissement remarquable dans le jeu.',
      badgeIcon: newBadge || '🏆',
      type: newType,
      points: Number(newPoints) || 20,
      unlocked: false,
      rarityPct: 25,
      category: 'Défi Personnalisé',
    };
    if (onAddAchievement) onAddAchievement(item);
    setIsAddOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'platinum':
        return {
          label: 'Platine',
          color: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/30',
          dot: 'bg-cyan-400',
        };
      case 'gold':
        return {
          label: 'Or',
          color: 'text-amber-300 border-amber-500/40 bg-amber-950/30',
          dot: 'bg-amber-400',
        };
      case 'silver':
        return {
          label: 'Argent',
          color: 'text-slate-200 border-slate-400/40 bg-slate-800/40',
          dot: 'bg-slate-300',
        };
      default:
        return {
          label: 'Bronze',
          color: 'text-amber-600 border-amber-700/40 bg-amber-950/20',
          dot: 'bg-amber-600',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b1329] border border-cyan-500/30 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(0,242,254,0.15)] overflow-hidden">
        {/* Header avec profil joueur */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0d1838] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Trophy className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white tracking-wide">
                  RetroAchievements & Trophées
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono font-bold">
                  Niveau {profile.level}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{profile.title}</span>
                <span aria-hidden="true">·</span>
                <span>{profile.rank}</span>
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-4 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-xs">
            <div className="text-center">
              <div className="text-amber-400 font-black font-mono text-sm">{totalPoints}</div>
              <div className="text-[10px] text-slate-500 uppercase">Points XP</div>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div className="text-center">
              <div className="text-white font-black font-mono text-sm">
                {totalUnlocked} / {achievements.length}
              </div>
              <div className="text-[10px] text-slate-500 uppercase">Trophées</div>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div className="text-center">
              <div className="text-cyan-400 font-black font-mono text-sm">{completionPct}%</div>
              <div className="text-[10px] text-slate-500 uppercase">Complétion</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Créer Défi</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barre de filtres & recherche */}
        <div className="p-3 bg-[#080e22] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Filtre Jeu */}
            <select
              value={selectedGameFilter}
              onChange={(e) => setSelectedGameFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">Tous les jeux ({achievements.length})</option>
              {Array.from(new Set(achievements.map((a) => a.gameId))).map((gid) => {
                const game = achievements.find((a) => a.gameId === gid);
                const count = achievements.filter((a) => a.gameId === gid).length;
                return (
                  <option key={gid} value={gid}>
                    {game?.gameTitle} ({count})
                  </option>
                );
              })}
            </select>

            {/* Segmented Filtre Statut */}
            <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md transition font-medium ${
                  statusFilter === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tous
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('unlocked')}
                className={`px-2.5 py-1 rounded-md transition font-medium ${
                  statusFilter === 'unlocked'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Débloqués ({totalUnlocked})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('locked')}
                className={`px-2.5 py-1 rounded-md transition font-medium ${
                  statusFilter === 'locked'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                À Débloquer ({achievements.length - totalUnlocked})
              </button>
            </div>
          </div>

          {/* Recherche */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher un exploit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-52"
            />
          </div>
        </div>

        {/* Modal création de défi (si ouvert) */}
        {isAddOpen && (
          <form
            onSubmit={handleCreateAchievement}
            className="p-4 bg-slate-900/90 border-b border-cyan-500/30 flex flex-wrap items-end gap-3 text-xs animate-in slide-in-from-top-3"
          >
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11px] text-slate-400 font-bold mb-1">Titre de l'Exploit</label>
              <input
                type="text"
                placeholder="Ex: Maître du Hadouken"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                required
              />
            </div>
            <div className="flex-1 min-w-[220px]">
              <label className="block text-[11px] text-slate-400 font-bold mb-1">Description / Objectif</label>
              <input
                type="text"
                placeholder="Ex: Gagner un match sans perdre un round"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 font-bold mb-1">Jeu Associé</label>
              <select
                value={newGameId}
                onChange={(e) => setNewGameId(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
              >
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.cleanTitle}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 font-bold mb-1">Badge</label>
              <input
                type="text"
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value)}
                className="w-14 text-center bg-slate-950 border border-slate-700 rounded-lg py-1.5 text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 font-bold mb-1">Rang</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
              >
                <option value="bronze">Bronze</option>
                <option value="silver">Argent</option>
                <option value="gold">Or</option>
                <option value="platinum">Platine</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 font-bold mb-1">Points</label>
              <input
                type="number"
                min="5"
                max="200"
                value={newPoints}
                onChange={(e) => setNewPoints(Number(e.target.value))}
                className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-center font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
              >
                Enregistrer
              </button>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* Liste des exploits */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-14 text-slate-500">
              <Award className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Aucun exploit correspondant à vos filtres.</p>
            </div>
          ) : (
            filteredAchievements.map((ach) => {
              const typeMeta = getTypeStyle(ach.type);
              return (
                <div
                  key={ach.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    ach.unlocked
                      ? 'bg-[#0f1b3b]/60 border-cyan-500/30 hover:border-cyan-400/60 shadow-sm'
                      : 'bg-slate-900/40 border-slate-800/80 opacity-75 hover:opacity-100 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    {/* Badge Icon */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                        ach.unlocked
                          ? 'bg-slate-800/90 border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,254,0.2)]'
                          : 'bg-slate-900/90 border-slate-800 grayscale'
                      }`}
                    >
                      {ach.badgeIcon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm truncate">
                          {ach.title}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${typeMeta.color}`}
                        >
                          {typeMeta.label}
                        </span>
                        {ach.rarityPct && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {ach.rarityPct}% des joueurs
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                        {ach.description}
                      </p>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-1">
                        <span className="text-cyan-400 font-medium">{ach.gameTitle}</span>
                        {ach.unlockedAt && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>Débloqué le {new Date(ach.unlockedAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Points */}
                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right">
                      <div className="text-amber-400 font-black font-mono text-sm">
                        +{ach.points} XP
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {ach.unlocked ? 'Obtenu' : 'Verrouillé'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUnlockWithCelebration(ach.id, ach.unlocked)}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition ${
                        ach.unlocked
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white hover:border-slate-500'
                      }`}
                      title={ach.unlocked ? 'Marquer comme verrouillé' : 'Marquer comme débloqué !'}
                    >
                      {ach.unlocked ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="hidden sm:inline">Validé</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-amber-400" />
                          <span className="hidden sm:inline">Débloquer</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
