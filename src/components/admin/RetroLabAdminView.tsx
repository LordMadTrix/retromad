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
  BarChart3,
  Gamepad2,
  Users,
  History,
  Printer,
  PackageCheck,
  Smartphone,
  Beer,
  FolderSearch,
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
  // 8 Nouveaux modules & gestionnaire musical
  onOpenAnalytics?: () => void;
  onOpenGamepadTester?: () => void;
  onOpenProfiles?: () => void;
  onOpenTimeline?: () => void;
  onOpenPrintStudio?: () => void;
  onOpenNomadBackup?: () => void;
  onOpenHandheldOverlays?: () => void;
  onOpenArcadeParty?: () => void;
  onOpenMusicManager?: () => void;
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
  onOpenAnalytics,
  onOpenGamepadTester,
  onOpenProfiles,
  onOpenTimeline,
  onOpenPrintStudio,
  onOpenNomadBackup,
  onOpenHandheldOverlays,
  onOpenArcadeParty,
  onOpenMusicManager,
  totalGames,
}) => {
  // Modules originaux
  const labModules = [
    {
      id: 'roulette',
      title: 'Roulette Rétro & Défi du Jour',
      badge: 'Labo #1',
      desc: 'Machine à sous animée pour tirage au sort instantané d\'un jeu et minuterie de défis quotidiens.',
      icon: <Dices className="w-5 h-5 text-cyan-400" />,
      color: 'from-cyan-500/20 to-blue-600/10 border-cyan-500/40 text-cyan-300',
      btnColor: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950',
      action: onOpenRoulette,
      stats: `${totalGames} jeux éligibles`,
    },
    {
      id: 'achievements',
      title: 'RetroAchievements & Trophées',
      badge: 'Labo #2',
      desc: 'Système complet de succès à débloquer en temps réel, niveaux de joueur et points rétro.',
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
      color: 'from-amber-500/20 to-yellow-600/10 border-amber-500/40 text-amber-300',
      btnColor: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
      action: onOpenAchievements,
      stats: 'Trophées démo + personnalisés',
    },
    {
      id: 'jukebox',
      title: 'Jukebox Chiptune 8/16-Bit',
      badge: 'Labo #3',
      desc: 'Synthétiseur audio Web Audio API en temps réel, playlist culte et égaliseur néon.',
      icon: <Disc3 className="w-5 h-5 text-pink-400" />,
      color: 'from-pink-500/20 to-purple-600/10 border-pink-500/40 text-pink-300',
      btnColor: 'bg-pink-500 hover:bg-pink-400 text-slate-950',
      action: onOpenJukebox,
      stats: 'Synthétiseur temps réel',
    },
    {
      id: 'tournament',
      title: 'Tournois Arcade Multijoueur',
      badge: 'Labo #4',
      desc: 'Générateur d\'arbres de tournoi 4 ou 8 participants (Quarts, Demis, Finale) et gestion des scores.',
      icon: <Swords className="w-5 h-5 text-orange-400" />,
      color: 'from-orange-500/20 to-red-600/10 border-orange-500/40 text-orange-300',
      btnColor: 'bg-orange-500 hover:bg-orange-400 text-slate-950',
      action: onOpenTournament,
      stats: 'Brackets 4 & 8 joueurs',
    },
    {
      id: 'manuals',
      title: 'Manuels & Notices d\'Époque',
      badge: 'Labo #5',
      desc: 'Liseuse de documentations vintage, livrets d\'instructions scannés, contrôles manette et secrets.',
      icon: <BookOpen className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/40 text-emerald-300',
      btnColor: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
      action: onOpenManuals,
      stats: 'Notices de jeux d\'époque',
    },
    {
      id: 'bezel',
      title: 'Studio Bezels & Shaders CRT',
      badge: 'Labo #6',
      desc: 'Bordures d\'arcade authentiques (Astro City, Neo Geo), moniteurs PVM/Trinitron et scanlines.',
      icon: <Tv className="w-5 h-5 text-blue-400" />,
      color: 'from-blue-500/20 to-indigo-600/10 border-blue-500/40 text-blue-300',
      btnColor: 'bg-blue-500 hover:bg-blue-400 text-slate-950',
      action: onOpenBezelStudio,
      stats: '6 modèles de bornes & CRT',
    },
    {
      id: 'cheats',
      title: 'Codes Cheats & Game Genie',
      badge: 'Labo #7',
      desc: 'Base de données de codes Action Replay / Game Genie et export de fichiers .cht Libretro.',
      icon: <Code2 className="w-5 h-5 text-purple-400" />,
      color: 'from-purple-500/20 to-indigo-600/10 border-purple-500/40 text-purple-300',
      btnColor: 'bg-purple-500 hover:bg-purple-400 text-slate-950',
      action: onOpenCheats,
      stats: 'Vies infinies, invincibilité, etc.',
    },
    {
      id: 'savestates',
      title: 'Save States & Cartes Mémoires',
      badge: 'Labo #8',
      desc: 'Gestionnaire visuel d\'instantanés d\'émulation avec captures, dates et export/import de fichiers .state.',
      icon: <HardDrive className="w-5 h-5 text-teal-400" />,
      color: 'from-teal-500/20 to-emerald-600/10 border-teal-500/40 text-teal-300',
      btnColor: 'bg-teal-500 hover:bg-teal-400 text-slate-950',
      action: onOpenSaveStates,
      stats: 'Slots multi-sauvegardes',
    },
  ];

  // 8 NOUVELLES INNOVATIONS & MUSIQUE
  const newExtendedModules = [
    {
      id: 'analytics',
      title: 'Rétro Analytics & Journal de Bord',
      badge: 'Nouveau #1',
      desc: 'Compteur de temps de jeu réel par console et par jeu, heatmaps d\'activités et podium des jeux les plus joués.',
      icon: <BarChart3 className="w-5 h-5 text-cyan-400" />,
      color: 'from-cyan-950/40 to-slate-900 border-cyan-500/40 text-cyan-300',
      btnColor: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950',
      action: onOpenAnalytics,
      stats: 'Suivi de session automatique',
    },
    {
      id: 'gamepad-tester',
      title: 'Testeur de Manette & Sticks Arcade',
      badge: 'Nouveau #2',
      desc: 'Visualisation dynamique en temps réel des boutons pressés (SNES, Mega Drive, Arcade Sanwa 8 boutons, PS1) et test de vibration.',
      icon: <Gamepad2 className="w-5 h-5 text-purple-400" />,
      color: 'from-purple-950/40 to-slate-900 border-purple-500/40 text-purple-300',
      btnColor: 'bg-purple-500 hover:bg-purple-400 text-white',
      action: onOpenGamepadTester,
      stats: 'Gamepad API & Latence ms',
    },
    {
      id: 'profiles',
      title: 'Multi-Profils & Contrôle Parental',
      badge: 'Nouveau #3',
      desc: 'Profils indépendants (Admin, Joueur, Enfant), verrouillage par code PIN, couvre-feu et masquage des jeux violents.',
      icon: <Users className="w-5 h-5 text-pink-400" />,
      color: 'from-pink-950/40 to-slate-900 border-pink-500/40 text-pink-300',
      btnColor: 'bg-pink-500 hover:bg-pink-400 text-white',
      action: onOpenProfiles,
      stats: 'Gestion Familiale Sécurisée',
    },
    {
      id: 'timeline',
      title: 'Musée & Frise Chronologique (1980 ➔ 2005)',
      badge: 'Nouveau #4',
      desc: 'Parcourez l\'histoire du jeu vidéo année par année (krach de 1983, guerre 16-Bit, essor de la 3D) avec vos jeux prêts à jouer.',
      icon: <History className="w-5 h-5 text-amber-400" />,
      color: 'from-amber-950/40 to-slate-900 border-amber-500/40 text-amber-300',
      btnColor: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
      action: onOpenTimeline,
      stats: 'Repères culturels intégrés',
    },
    {
      id: 'print-studio',
      title: 'Print Studio : Jaquettes & Stickers 1:1',
      badge: 'Nouveau #5',
      desc: 'Générez et imprimez à l\'échelle exacte 1:1 des jaquettes complètes de boîtiers (SNES, Genesis, GB) et des stickers de cartouches.',
      icon: <Printer className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-950/40 to-slate-900 border-emerald-500/40 text-emerald-300',
      btnColor: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
      action: onOpenPrintStudio,
      stats: 'Export PNG / Impression A4',
    },
    {
      id: 'nomad-backup',
      title: 'Pack Nomade & Sauvegarde Globale',
      badge: 'Nouveau #6',
      desc: 'Exportez toute votre progression (sauvegardes, succès, configs, profils) dans un fichier unique .retromad pour clé USB.',
      icon: <PackageCheck className="w-5 h-5 text-blue-400" />,
      color: 'from-blue-950/40 to-slate-900 border-blue-500/40 text-blue-300',
      btnColor: 'bg-blue-500 hover:bg-blue-400 text-white',
      action: onOpenNomadBackup,
      stats: 'Zéro-Cloud & 100% Hors-Ligne',
    },
    {
      id: 'handheld-overlays',
      title: 'Overlays Consoles Portables LCD',
      badge: 'Nouveau #7',
      desc: 'Coques authentiques (Game Boy DMG grise/verte, Pocket, GBA Indigo, Game Gear) avec matrice de pixels et rétroéclairage.',
      icon: <Smartphone className="w-5 h-5 text-green-400" />,
      color: 'from-green-950/40 to-slate-900 border-green-500/40 text-green-300',
      btnColor: 'bg-green-500 hover:bg-green-400 text-slate-950',
      action: onOpenHandheldOverlays,
      stats: 'Dalles LCD & Loupe d\'écran',
    },
    {
      id: 'arcade-party',
      title: 'Mode Soirée & Bar Arcade (Party Mode)',
      badge: 'Nouveau #8',
      desc: 'Minuteur de rotation de manette, gages et défis rétro aléatoires, et podium des vainqueurs de la soirée.',
      icon: <Beer className="w-5 h-5 text-yellow-400" />,
      color: 'from-yellow-950/40 to-slate-900 border-yellow-500/40 text-yellow-300',
      btnColor: 'bg-yellow-500 hover:bg-yellow-400 text-slate-950',
      action: onOpenArcadeParty,
      stats: 'Chrono & Gages Rétro',
    },
    {
      id: 'music-manager',
      title: 'Musiques & Scanner de Dossier Musical',
      badge: 'Musique Audio',
      desc: 'Ajoutez des musiques personnalisées par formulaire ou scannez directement un dossier MP3/OGG avec détection automatique.',
      icon: <FolderSearch className="w-5 h-5 text-fuchsia-400" />,
      color: 'from-fuchsia-950/40 to-slate-900 border-fuchsia-500/40 text-fuchsia-300',
      btnColor: 'bg-fuchsia-500 hover:bg-fuchsia-400 text-white',
      action: onOpenMusicManager,
      stats: 'Scan Auto Dossier & Upload',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Banner Intro */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#111f4d] via-[#1d2a6a] to-[#2b104a] border border-cyan-500/30 flex items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-neon shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>Labo Rétro & Nouvelles Innovations</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                17 Outils Rétro Intégrés
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Accédez et pilotez l'intégralité des outils avancés, de l'analytics aux jaquettes imprimables et au scanner de musiques.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1 : LES 8 NOUVELLES INNOVATIONS & MUSIQUE */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-black text-white uppercase tracking-wider">
            8 Nouvelles Innovations Majeures & Gestion Musicale
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {newExtendedModules.map((m) => (
            <div
              key={m.id}
              className={`p-4 rounded-2xl border bg-gradient-to-b ${m.color} flex flex-col justify-between space-y-4 hover:border-slate-500 transition shadow-sm`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                    {m.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/50 border border-white/10 text-slate-300">
                    {m.badge}
                  </span>
                </div>

                <h4 className="text-xs font-black text-white mb-1">{m.title}</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-3">{m.desc}</p>
                <div className="text-[10px] font-mono text-slate-400 border-t border-white/5 pt-2">
                  {m.stats}
                </div>
              </div>

              <button
                type="button"
                onClick={m.action}
                className={`w-full py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition shadow-sm ${m.btnColor}`}
              >
                <span>Ouvrir l'Outil</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2 : MODULES ORIGINAUX DU LABO RÉTRO */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Tv className="w-4 h-4 text-purple-400" />
          <h4 className="text-sm font-black text-white uppercase tracking-wider">
            Modules Fondateurs du Labo Rétro
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {labModules.map((m) => (
            <div
              key={m.id}
              className={`p-4 rounded-2xl border bg-gradient-to-b ${m.color} flex flex-col justify-between space-y-4 hover:border-slate-500 transition shadow-sm`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    {m.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/40 border border-white/10 text-slate-300">
                    {m.badge}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white mb-1">{m.title}</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-3">{m.desc}</p>
                <div className="text-[10px] font-mono text-slate-400 border-t border-white/5 pt-2">
                  {m.stats}
                </div>
              </div>

              <button
                type="button"
                onClick={m.action}
                className={`w-full py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition shadow-sm ${m.btnColor}`}
              >
                <span>Lancer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
