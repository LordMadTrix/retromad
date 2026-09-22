import React from 'react';
import {
  Sparkles,
  Dices,
  Trophy,
  Disc3,
  Swords,
  BookOpen,
  Tv,
  Code2,
  HardDrive,
  ArrowRight,
} from 'lucide-react';

interface RetroLabAdminViewProps {
  onOpenRoulette?: () => void;
  onOpenAchievements?: () => void;
  onOpenJukebox?: () => void;
  onOpenTournament?: () => void;
  onOpenManuals?: () => void;
  onOpenBezelStudio?: () => void;
  onOpenCheats?: () => void;
  onOpenSaveStates?: () => void;
  totalGames: number;
}

export const RetroLabAdminView: React.FC<RetroLabAdminViewProps> = ({
  onOpenRoulette,
  onOpenAchievements,
  onOpenJukebox,
  onOpenTournament,
  onOpenManuals,
  onOpenBezelStudio,
  onOpenCheats,
  onOpenSaveStates,
  totalGames,
}) => {
  const modules = [
    {
      id: 'roulette',
      title: 'Roulette Rétro & Défi du Jour',
      badge: 'Feature #8',
      desc: 'Machine à sous animée pour tirage au sort instantané d\'un jeu et minuterie de défis quotidiens avec gain d\'XP.',
      icon: <Dices className="w-6 h-6 text-cyan-400" />,
      color: 'from-cyan-500/20 to-blue-600/10 border-cyan-500/40 text-cyan-300',
      btnColor: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950',
      action: onOpenRoulette,
      stats: `${totalGames} jeux éligibles`,
    },
    {
      id: 'achievements',
      title: 'RetroAchievements & Trophées',
      badge: 'Feature #1',
      desc: 'Système complet de succès à débloquer en temps réel, niveaux de joueur, points rétro et célébrations visuelles.',
      icon: <Trophy className="w-6 h-6 text-amber-400" />,
      color: 'from-amber-500/20 to-yellow-600/10 border-amber-500/40 text-amber-300',
      btnColor: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
      action: onOpenAchievements,
      stats: '6 trophées démo + personnalisés',
    },
    {
      id: 'jukebox',
      title: 'Jukebox Chiptune 8/16-Bit',
      badge: 'Feature #4',
      desc: 'Synthétiseur audio Web Audio API en temps réel (ondes carrées, bruits NES/GB), playlist culte et égaliseur.',
      icon: <Disc3 className="w-6 h-6 text-pink-400" />,
      color: 'from-pink-500/20 to-purple-600/10 border-pink-500/40 text-pink-300',
      btnColor: 'bg-pink-500 hover:bg-pink-400 text-slate-950',
      action: onOpenJukebox,
      stats: '6 compositions chiptune',
    },
    {
      id: 'tournament',
      title: 'Tournois Arcade Multijoueur',
      badge: 'Feature #5',
      desc: 'Générateur d\'arbres de tournoi 4 ou 8 participants (Quarts, Demis, Finale), gestion des manches et couronnement.',
      icon: <Swords className="w-6 h-6 text-orange-400" />,
      color: 'from-orange-500/20 to-red-600/10 border-orange-500/40 text-orange-300',
      btnColor: 'bg-orange-500 hover:bg-orange-400 text-slate-950',
      action: onOpenTournament,
      stats: 'Brackets 4 & 8 joueurs',
    },
    {
      id: 'manuals',
      title: 'Manuels & Notices d\'Époque',
      badge: 'Feature #6',
      desc: 'Liseuse de documentations vintage, livrets d\'instructions scannés, contrôles manette, secrets et astuces.',
      icon: <BookOpen className="w-6 h-6 text-emerald-400" />,
      color: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/40 text-emerald-300',
      btnColor: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
      action: onOpenManuals,
      stats: 'Fiches et notices détaillées',
    },
    {
      id: 'bezel',
      title: 'Studio Bezels & Shaders CRT',
      badge: 'Feature #7',
      desc: 'Bordures d\'arcade authentiques (Astro City, Neo Geo MVS), moniteurs PVM/Trinitron et shaders de courbure cathodique.',
      icon: <Tv className="w-6 h-6 text-blue-400" />,
      color: 'from-blue-500/20 to-indigo-600/10 border-blue-500/40 text-blue-300',
      btnColor: 'bg-blue-500 hover:bg-blue-400 text-slate-950',
      action: onOpenBezelStudio,
      stats: '6 modèles de bornes & CRT',
    },
    {
      id: 'cheats',
      title: 'Codes Cheats & Game Genie',
      badge: 'Feature #2',
      desc: 'Base de données de codes Action Replay / Game Genie, interrupteurs d\'activation et export de fichiers .cht Libretro.',
      icon: <Code2 className="w-6 h-6 text-purple-400" />,
      color: 'from-purple-500/20 to-indigo-600/10 border-purple-500/40 text-purple-300',
      btnColor: 'bg-purple-500 hover:bg-purple-400 text-slate-950',
      action: onOpenCheats,
      stats: 'Vies infinies, invincibilité, etc.',
    },
    {
      id: 'savestates',
      title: 'Save States & Cartes Mémoires',
      badge: 'Feature #3',
      desc: 'Gestionnaire visuel d\'instantanés d\'émulation avec captures d\'écran, dates, slots et export/import de fichiers .state.',
      icon: <HardDrive className="w-6 h-6 text-teal-400" />,
      color: 'from-teal-500/20 to-emerald-600/10 border-teal-500/40 text-teal-300',
      btnColor: 'bg-teal-500 hover:bg-teal-400 text-slate-950',
      action: onOpenSaveStates,
      stats: 'Slots multi-sauvegardes',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner Intro */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#111f4d] via-[#1d2a6a] to-[#2b104a] border border-cyan-500/30 flex items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-neon shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>Labo Rétro & Expériences Spéciales</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                8 Nouveaux Modules Actifs
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Accédez et pilotez l'intégralité des outils avancés rétro directement depuis le panneau d'administration.
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-400">
          <span className="font-mono text-cyan-300 font-bold">100% Fonctionnel</span>
          <span>·</span>
          <span>Zéro Mock</span>
        </div>
      </div>

      {/* Grid of 8 modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map((m) => (
          <div
            key={m.id}
            className={`p-4 rounded-2xl border bg-gradient-to-b ${m.color} flex flex-col justify-between space-y-4 hover:border-slate-500 transition shadow-sm`}
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  {m.icon}
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/40 border border-white/10 text-slate-300">
                  {m.badge}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mb-1">{m.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">{m.desc}</p>
              <div className="text-[11px] font-mono text-slate-400 border-t border-white/5 pt-2">
                {m.stats}
              </div>
            </div>

            <button
              type="button"
              onClick={m.action}
              className={`w-full py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition shadow-sm ${m.btnColor}`}
            >
              <span>Lancer le Module</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
