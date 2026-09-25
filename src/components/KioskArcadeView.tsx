import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Game, System, Company, EmulatorProfile } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { ConsoleLogo } from './ConsoleLogo';
import { ConsoleExhibitionModal } from './ConsoleExhibitionModal';
import { CompanyExhibitionModal } from './CompanyExhibitionModal';
import { CompanyBackgroundVideo } from './CompanyBackgroundVideo';
import {
  Play,
  Heart,
  Eye,
  Lock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  Award,
  Calendar,
  Gamepad2,
  ArrowLeft,
  Tv,
  Landmark,
  FolderOpen,
  Dices,
  Projector,
  BookOpen,
  Timer,
  Layers,
  Sliders,
  Maximize2,
} from 'lucide-react';
import { useAudio } from '../hooks/useAudio';
import { useGamepad } from '../hooks/useGamepad';
import { resolveMediaUrl } from '../utils/media';

interface KioskArcadeViewProps {
  games: Game[];
  systems: System[];
  companies: Company[];
  emulators: EmulatorProfile[];
  onLaunchGame: (game: Game) => void;
  onToggleFavorite: (gameId: string) => void;
  onViewDetails: (game: Game) => void;
  onUnlockAdmin: () => void;
  onOpenProjectorModal?: () => void;
  onOpenUserManualPdf?: () => void;
  onOpenShaderProfiles?: () => void;
  onOpenSpeedrun?: () => void;
  onOpenCartridgeShelf?: () => void;
  soundEnabled?: boolean;
  soundVolume?: number;
  crtEnabled?: boolean;
  onToggleCrt?: () => void;
  /** Effets visuels désactivables (voir Réglages > Apparence) */
  backgroundVideos?: boolean;
  neonGlows?: boolean;
  animations?: boolean;
}

type KioskStep = 'companies' | 'consoles' | 'games';

// Héros mythiques par firme pour enrichir l'habillage arcade
interface HeroShowcase {
  name: string;
  title: string;
  game: string;
  companyId: string;
  accentColor: string;
  quote: string;
  badge: string;
}

const HEROES_BY_COMPANY: Record<string, HeroShowcase[]> = {
  nintendo: [
    {
      name: 'Mario',
      title: 'Le Plombier Légendaire',
      game: 'Super Mario World',
      companyId: 'nintendo',
      accentColor: '#e60012',
      quote: "It's-a me, Mario! Let's-a go!",
      badge: '🍄 ICÔNE MONDIALE',
    },
    {
      name: 'Link',
      title: 'Héros du Temps & d\'Hyrule',
      game: 'The Legend of Zelda: A Link to the Past',
      companyId: 'nintendo',
      accentColor: '#00a859',
      quote: 'Le courage n\'a pas besoin de mots.',
      badge: '🗡️ TRIFORCE',
    },
  ],
  sega: [
    {
      name: 'Sonic The Hedgehog',
      title: 'L\'Éclair Bleu de SEGA',
      game: 'Sonic The Hedgehog 2',
      companyId: 'sega',
      accentColor: '#006699',
      quote: "Gotta go fast! Sega c'est plus fort que toi !",
      badge: '🦔 SUPER VITESSE',
    },
    {
      name: 'Axel Stone',
      title: 'Justicier des Rues',
      game: 'Streets of Rage 2',
      companyId: 'sega',
      accentColor: '#ffcc00',
      quote: 'Grand Upper ! La justice reprend la ville.',
      badge: '🥊 BRAWLER RETRO',
    },
  ],
  sony: [
    {
      name: 'Crash Bandicoot',
      title: 'Le Marsupial Déjanté',
      game: 'Crash Bandicoot 3: Warped',
      companyId: 'sony',
      accentColor: '#f37023',
      quote: 'Oodibigah ! En route pour le voyage temporel.',
      badge: '🍎 MARSUPIAL RETRO',
    },
    {
      name: 'Spyro The Dragon',
      title: 'Le Petit Dragon Violet',
      game: 'Spyro the Dragon',
      companyId: 'sony',
      accentColor: '#682c91',
      quote: 'Prends ça Gnasty Gnorc ! Tout cracheur de feu.',
      badge: '🐉 DRAGON MAGIC',
    },
  ],
  microsoft: [
    {
      name: 'Master Chief (John-117)',
      title: 'Le Spartan Légendaire',
      game: 'Halo: Combat Evolved / Halo 3',
      companyId: 'microsoft',
      accentColor: '#107c10',
      quote: 'I need a weapon. Finish the fight.',
      badge: '🛡️ SPARTAN-117',
    },
    {
      name: 'Marcus Fenix',
      title: 'Sergent de l\'Escouade Delta',
      game: 'Gears of War',
      companyId: 'microsoft',
      accentColor: '#52b043',
      quote: 'Enclenchez le Lanzor ! Pour la Coalition.',
      badge: '⚙️ COG GEARS',
    },
    {
      name: 'Banjo & Kazooie',
      title: 'Le Duo Inséparable',
      game: 'Banjo-Kazooie (Rareware)',
      companyId: 'microsoft',
      accentColor: '#ffd700',
      quote: 'Guh-huh ! Les pièces de puzzle sont à nous.',
      badge: '🐻🐦 RARE MASTER',
    },
  ],
  snk: [
    {
      name: 'Terry Bogard',
      title: 'Le Loup Solitaire de Southtown',
      game: 'Fatal Fury Special / KOF',
      companyId: 'snk',
      accentColor: '#e31b23',
      quote: 'Are you okay? Buster Wolf ! The 100 Mega Shock.',
      badge: '🔥 BURNING FIGHT',
    },
    {
      name: 'Marco Rossi',
      title: 'Commandant Peregrine Falcon',
      game: 'Metal Slug X',
      companyId: 'snk',
      accentColor: '#ffd700',
      quote: 'Heavy Machine Gun ! Mission Complete !',
      badge: '🎖️ ARCADE GOLD',
    },
  ],
  atari: [
    {
      name: 'Pac-Man',
      title: 'Le Dévoreur de Fantômes',
      game: 'Pac-Man Arcade',
      companyId: 'atari',
      accentColor: '#ffd700',
      quote: 'Waka Waka ! L\'aube des bornes d\'arcade.',
      badge: '🟡 PIONNIER ARCADE',
    },
  ],
  nec: [
    {
      name: 'Bonk (PC Kid)',
      title: 'Le Cavernicole au Crâne d\'Acier',
      game: 'Bonk\'s Adventure (PC-Engine)',
      companyId: 'nec',
      accentColor: '#ea5404',
      quote: 'Coup de boule préhistorique sur HuCard !',
      badge: '🦕 PC-ENGINE STAR',
    },
  ],
};

export const KioskArcadeView: React.FC<KioskArcadeViewProps> = ({
  games,
  systems,
  companies,
  onLaunchGame,
  onToggleFavorite,
  onViewDetails,
  onUnlockAdmin,
  onOpenProjectorModal,
  onOpenUserManualPdf,
  onOpenShaderProfiles,
  onOpenSpeedrun,
  onOpenCartridgeShelf,
  soundEnabled = true,
  soundVolume = 0.8,
  crtEnabled = false,
  onToggleCrt,
  backgroundVideos = true,
  neonGlows = true,
  animations = true,
}) => {
  // Navigation hiérarchique Kiosk à 3 niveaux : Firmes -> Consoles -> ROMs
  const [step, setStep] = useState<KioskStep>('companies');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<System | null>(null);

  // Exposition virtuelle & musée du rétrogaming
  const [exhibitionSystem, setExhibitionSystem] = useState<System | null>(null);
  const [exhibitionCompany, setExhibitionCompany] = useState<Company | null>(null);

  // Index de navigation au sein de chaque niveau
  const [companyIndex, setCompanyIndex] = useState<number>(0);
  const [consoleIndex, setConsoleIndex] = useState<number>(0);
  const [gameIndex, setGameIndex] = useState<number>(0);
  const [kioskFavoritesOnly, setKioskFavoritesOnly] = useState<boolean>(false);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(new Set());
  const [isCompactFit, setIsCompactFit] = useState<boolean>(false);

  const { playMove, playSelect, playLaunch, playBack, playCoin, playFavorite, playDice } = useAudio(soundEnabled, soundVolume);

  // Effet d'ambiance monnayeur arcade au démarrage
  useEffect(() => {
    const timer = setTimeout(() => {
      playCoin();
    }, 400);
    return () => clearTimeout(timer);
  }, [playCoin]);

  // Consoles de la firme sélectionnée
  const companySystems = useMemo(() => {
    if (!selectedCompany) return [];
    return systems.filter((s) => s.companyId === selectedCompany.id);
  }, [systems, selectedCompany]);

  // Jeux de la console sélectionnée (avec filtre favoris optionnel)
  // Tri : derniers joués d'abord (reprise rapide), puis favoris, puis alphabétique
  const consoleGames = useMemo(() => {
    if (!selectedSystem) return [];
    let list = games.filter((g) => g.systemId === selectedSystem.id);
    if (kioskFavoritesOnly) {
      list = list.filter((g) => g.favorite);
    }
    return [...list].sort((a, b) => {
      const ra = a.lastPlayed || '';
      const rb = b.lastPlayed || '';
      if (ra && rb && ra !== rb) return rb.localeCompare(ra); // récents d'abord
      if (ra && !rb) return -1;
      if (!ra && rb) return 1;
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
      return (a.cleanTitle || '').localeCompare(b.cleanTitle || '');
    });
  }, [games, selectedSystem, kioskFavoritesOnly]);

  const currentGame = consoleGames[gameIndex] || consoleGames[0] || null;

  // Lettres disponibles pour saut alphabétique rapide
  const availableLetters = useMemo(() => {
    const set = new Set<string>();
    consoleGames.forEach((g) => {
      const char = (g.cleanTitle || '').trim().charAt(0).toUpperCase();
      if (char >= 'A' && char <= 'Z') set.add(char);
      else if (char >= '0' && char <= '9') set.add('#');
    });
    return Array.from(set).sort();
  }, [consoleGames]);

  // Sélection d'un jeu au hasard
  const handleRandomPickInKiosk = useCallback(() => {
    if (step === 'games') {
      if (consoleGames.length === 0) return;
      playDice();
      const randIdx = Math.floor(Math.random() * consoleGames.length);
      setGameIndex(randIdx);
    } else {
      if (games.length === 0) return;
      playDice();
      const randGame = games[Math.floor(Math.random() * games.length)];
      const targetSystem = systems.find((s) => s.id === randGame.systemId);
      const targetCompany = targetSystem ? companies.find((c) => c.id === targetSystem.companyId) : null;
      if (targetSystem && targetCompany) {
        setSelectedCompany(targetCompany);
        setSelectedSystem(targetSystem);
        const sysGames = games.filter((g) => g.systemId === targetSystem.id);
        const gIdx = sysGames.findIndex((g) => g.id === randGame.id);
        setGameIndex(gIdx >= 0 ? gIdx : 0);
        setStep('games');
      }
    }
  }, [step, consoleGames, games, systems, companies, playDice]);

  // Calcul du nombre de jeux par firme
  const gamesCountByCompany = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of companies) {
      const sysIds = systems.filter((s) => s.companyId === c.id).map((s) => s.id);
      const count = games.filter((g) => sysIds.includes(g.systemId)).length;
      map.set(c.id, count);
    }
    return map;
  }, [companies, systems, games]);

  // Calcul du nombre de jeux par console
  const gamesCountBySystem = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of systems) {
      const count = games.filter((g) => g.systemId === s.id).length;
      map.set(s.id, count);
    }
    return map;
  }, [systems, games]);

  // Actions de navigation
  const handleSelectCompany = useCallback((company: Company) => {
    playSelect();
    setSelectedCompany(company);
    setConsoleIndex(0);
    setStep('consoles');
  }, [playSelect]);

  const handleSelectConsole = useCallback((system: System) => {
    playSelect();
    setSelectedSystem(system);
    setGameIndex(0);
    setStep('games');
  }, [playSelect]);

  const handleBackToCompanies = useCallback(() => {
    playBack();
    setStep('companies');
    setSelectedSystem(null);
  }, [playBack]);

  const handleBackToConsoles = useCallback(() => {
    playBack();
    setStep('consoles');
  }, [playBack]);

  // Navigation manette & stick arcade
  useGamepad(
    {
      onLeft: () => {
        playMove();
        if (step === 'companies') {
          setCompanyIndex((prev) => (prev > 0 ? prev - 1 : companies.length - 1));
        } else if (step === 'consoles') {
          setConsoleIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, companySystems.length - 1)));
        } else if (step === 'games') {
          setGameIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, consoleGames.length - 1)));
        }
      },
      onRight: () => {
        playMove();
        if (step === 'companies') {
          setCompanyIndex((prev) => (prev < companies.length - 1 ? prev + 1 : 0));
        } else if (step === 'consoles') {
          setConsoleIndex((prev) => (prev < companySystems.length - 1 ? prev + 1 : 0));
        } else if (step === 'games') {
          setGameIndex((prev) => (prev < consoleGames.length - 1 ? prev + 1 : 0));
        }
      },
      onConfirm: () => {
        if (exhibitionCompany) return;
        if (exhibitionSystem) {
          const sys = exhibitionSystem;
          setExhibitionSystem(null);
          handleSelectConsole(sys);
          return;
        }
        if (step === 'companies') {
          const comp = companies[companyIndex];
          if (comp) handleSelectCompany(comp);
        } else if (step === 'consoles') {
          const sys = companySystems[consoleIndex];
          if (sys) handleSelectConsole(sys);
        } else if (step === 'games') {
          if (currentGame) {
            playLaunch();
            onLaunchGame(currentGame);
          }
        }
      },
      onCancel: () => {
        if (exhibitionCompany) {
          playBack();
          setExhibitionCompany(null);
          return;
        }
        if (exhibitionSystem) {
          playBack();
          setExhibitionSystem(null);
          return;
        }
        if (step === 'games') {
          handleBackToConsoles();
        } else if (step === 'consoles') {
          handleBackToCompanies();
        } else {
          onUnlockAdmin();
        }
      },
      onFavorite: () => {
        if (exhibitionSystem || exhibitionCompany) return;
        if (step === 'companies') {
          const comp = companies[companyIndex];
          if (comp) {
            playSelect();
            setExhibitionCompany(comp);
          }
        } else if (step === 'consoles') {
          const sys = companySystems[consoleIndex];
          if (sys) {
            playSelect();
            setExhibitionSystem(sys);
          }
        } else if (step === 'games' && currentGame) {
          playFavorite();
          onToggleFavorite(currentGame.id);
        }
      },
      onDetails: () => {
        if (exhibitionSystem || exhibitionCompany) return;
        if (step === 'companies') {
          const comp = companies[companyIndex];
          if (comp) {
            playSelect();
            setExhibitionCompany(comp);
          }
        } else if (step === 'consoles') {
          const sys = companySystems[consoleIndex];
          if (sys) {
            playSelect();
            setExhibitionSystem(sys);
          }
        } else if (step === 'games' && currentGame) {
          playSelect();
          onViewDetails(currentGame);
        }
      },
      onMenu: () => {
        playSelect();
        onUnlockAdmin();
      },
      onRandom: () => {
        handleRandomPickInKiosk();
      },
    },
    true
  );

  // Raccourcis clavier (Flèches, Entrée, Échap, Espace, M pour Musée, R pour Hasard, C pour CRT)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (exhibitionSystem || exhibitionCompany) return;
        playMove();
        if (step === 'companies') {
          setCompanyIndex((prev) => (prev > 0 ? prev - 1 : companies.length - 1));
        } else if (step === 'consoles') {
          setConsoleIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, companySystems.length - 1)));
        } else if (step === 'games') {
          setGameIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, consoleGames.length - 1)));
        }
      } else if (e.key === 'ArrowRight') {
        if (exhibitionSystem || exhibitionCompany) return;
        playMove();
        if (step === 'companies') {
          setCompanyIndex((prev) => (prev < companies.length - 1 ? prev + 1 : 0));
        } else if (step === 'consoles') {
          setConsoleIndex((prev) => (prev < companySystems.length - 1 ? prev + 1 : 0));
        } else if (step === 'games') {
          setGameIndex((prev) => (prev < consoleGames.length - 1 ? prev + 1 : 0));
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (exhibitionCompany) return;
        if (exhibitionSystem) {
          const sys = exhibitionSystem;
          setExhibitionSystem(null);
          handleSelectConsole(sys);
          return;
        }
        if (step === 'companies') {
          const comp = companies[companyIndex];
          if (comp) handleSelectCompany(comp);
        } else if (step === 'consoles') {
          const sys = companySystems[consoleIndex];
          if (sys) handleSelectConsole(sys);
        } else if (step === 'games') {
          if (currentGame) {
            playLaunch();
            onLaunchGame(currentGame);
          }
        }
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        if (exhibitionCompany) {
          playBack();
          setExhibitionCompany(null);
          return;
        }
        if (exhibitionSystem) {
          playBack();
          setExhibitionSystem(null);
          return;
        }
        if (step === 'games') {
          handleBackToConsoles();
        } else if (step === 'consoles') {
          handleBackToCompanies();
        } else {
          onUnlockAdmin();
        }
      } else if (e.key.toLowerCase() === 'm' || e.key.toLowerCase() === 'e') {
        if (step === 'companies') {
          const comp = companies[companyIndex];
          if (comp) {
            playSelect();
            setExhibitionCompany(comp);
          }
        } else if (step === 'consoles') {
          const sys = companySystems[consoleIndex];
          if (sys) {
            playSelect();
            setExhibitionSystem(sys);
          }
        } else if (step === 'games' && selectedSystem) {
          playSelect();
          setExhibitionSystem(selectedSystem);
        }
      } else if (e.key.toLowerCase() === 'r') {
        handleRandomPickInKiosk();
      } else if (e.key.toLowerCase() === 'c') {
        onToggleCrt?.();
      } else if (e.key.toLowerCase() === 'f') {
        if (step === 'games' && currentGame && !exhibitionSystem && !exhibitionCompany) {
          playFavorite();
          onToggleFavorite(currentGame.id);
        }
      } else if (e.key.toLowerCase() === 'x' || e.key.toLowerCase() === 'd') {
        if (step === 'games' && currentGame && !exhibitionSystem && !exhibitionCompany) {
          playSelect();
          onViewDetails(currentGame);
        }
      } else if (e.key === 'F1') {
        e.preventDefault();
        onOpenUserManualPdf?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    step,
    exhibitionSystem,
    exhibitionCompany,
    companyIndex,
    consoleIndex,
    gameIndex,
    companies,
    companySystems,
    consoleGames,
    currentGame,
    onOpenUserManualPdf,
    selectedSystem,
    handleSelectCompany,
    handleSelectConsole,
    handleBackToCompanies,
    handleBackToConsoles,
    handleRandomPickInKiosk,
    onToggleCrt,
    onLaunchGame,
    onToggleFavorite,
    onViewDetails,
    onUnlockAdmin,
    playMove,
    playLaunch,
    playSelect,
    playBack,
    playFavorite,
  ]);

  return (
    <div className="flex-1 min-h-0 w-full h-full flex flex-col bg-[#06080d] text-slate-100 select-none overflow-hidden relative">
      <div className="kiosk-animated-background absolute inset-0 z-0 pointer-events-none" />
      {/* Texture CRT & Scanlines Arcade */}
      <div className="absolute inset-0 scanlines opacity-35 z-20 pointer-events-none" />
      <div className="absolute inset-0 crt-vignette z-20 pointer-events-none" />

      {/* MARQUEE HEADER ARCADE AVEC FIL D'ARIANE (BREADCRUMB) */}
      <header className="h-14 sm:h-16 bg-gradient-to-b from-retro-900 via-retro-900/90 to-transparent px-3 sm:px-6 py-2 flex items-center justify-between border-b border-slate-800/80 z-30 shrink-0 gap-2 overflow-x-auto no-scrollbar">
        {/* Logo & Fil d'Ariane cliquable */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-retro-pink via-retro-purple to-retro-accent flex items-center justify-center shadow-neon animate-pulse shrink-0">
            <Flame className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm font-black truncate max-w-[130px] xs:max-w-[200px] sm:max-w-none">
            <span
              onClick={handleBackToCompanies}
              className={`flex items-center space-x-1 transition ${
                step === 'companies'
                  ? 'text-retro-accent drop-shadow-[0_0_8px_#00f2fe]'
                  : 'text-slate-400 hover:text-white cursor-pointer'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 shrink-0" />
              <span>FIRMES</span>
            </span>

            {selectedCompany && (
              <>
                <span className="text-slate-600 font-bold">❯</span>
                <span
                  onClick={step === 'games' ? handleBackToConsoles : undefined}
                  className={`flex items-center space-x-1 transition truncate ${
                    step === 'consoles'
                      ? 'text-retro-accent drop-shadow-[0_0_8px_#00f2fe]'
                      : 'text-slate-400 hover:text-white cursor-pointer'
                  }`}
                >
                  <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{selectedCompany.name.toUpperCase()}</span>
                </span>
              </>
            )}

            {selectedSystem && (
              <>
                <span className="text-slate-600 font-bold">❯</span>
                <span className="text-retro-pink font-black drop-shadow-[0_0_8px_#ff007f] flex items-center space-x-1 truncate">
                  <Tv className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{selectedSystem.name.toUpperCase()}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Boutons d'Action & Déverrouillage Admin */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Monnayeur Arcade Interactif */}
          <button
            onClick={() => playCoin()}
            className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold transition shadow-sm"
            title="Insérer une pièce / Insert Coin"
          >
            <span>🪙</span>
            <span>CRÉDITS: 99</span>
          </button>

          {/* Bouton Jeu au Hasard */}
          <button
            onClick={handleRandomPickInKiosk}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-bold transition shadow-sm hover:text-white"
            title="Choisir un jeu au hasard (Touche R ou Select manette)"
          >
            <Dices className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xl:inline">Hasard</span>
          </button>

          {/* Filtre Favoris uniquement en mode jeux */}
          {step === 'games' && (
            <button
              onClick={() => {
                playSelect();
                setKioskFavoritesOnly((prev) => !prev);
              }}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition ${
                kioskFavoritesOnly
                  ? 'bg-rose-500 text-white border-rose-400 shadow-neon-pink'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="Afficher uniquement les favoris (Touche F)"
            >
              <Heart className={`w-3.5 h-3.5 ${kioskFavoritesOnly ? 'fill-current' : ''}`} />
              <span className="hidden xl:inline">Favoris</span>
            </button>
          )}

          {/* Profils Shaders Rétro */}
          {onOpenShaderProfiles && (
            <button
              onClick={onOpenShaderProfiles}
              className="p-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 transition shadow-sm"
              title="Changer de profil Shader (Trinitron, DMG, 15kHz...)"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Étagère 3D Cartouches */}
          {onOpenCartridgeShelf && (
            <button
              onClick={onOpenCartridgeShelf}
              className="p-1.5 rounded-xl border border-purple-500/40 bg-purple-950/40 text-purple-300 hover:bg-purple-900/60 transition shadow-sm"
              title="Ouvrir l'étagère de cartouches physiques 3D"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Chronomètre Speedrun */}
          {onOpenSpeedrun && (
            <button
              onClick={onOpenSpeedrun}
              className="p-1.5 rounded-xl border border-amber-500/40 bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 transition shadow-sm"
              title="Chronomètre Speedrun Arcade"
            >
              <Timer className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Toggle CRT */}
          {onToggleCrt && (
            <button
              onClick={onToggleCrt}
              className={`p-1.5 rounded-xl border transition ${
                crtEnabled
                  ? 'bg-retro-accent/20 border-retro-accent/60 text-retro-accent shadow-[0_0_10px_rgba(0,242,254,0.3)]'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Activer / Désactiver le filtre d'écran CRT Rétro (Touche C)"
            >
              <Tv className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Bouton Adapter / Plein Écran Kiosk */}
          <button
            onClick={() => {
              playSelect();
              setIsCompactFit((prev) => !prev);
            }}
            className={`p-1.5 rounded-xl border transition ${
              isCompactFit
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title={isCompactFit ? "Mode d'affichage standard défilable" : "Mode ajusté à l'écran (anti-coupure sans défilement)"}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {step === 'consoles' && (
            <button
              onClick={handleBackToCompanies}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition"
              title="Retourner à la liste des firmes (Touche B / Échap)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Firmes</span>
            </button>
          )}

          {step === 'games' && (
            <button
              onClick={handleBackToConsoles}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition"
              title="Retourner aux consoles de cette firme (Touche B / Échap)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Consoles</span>
            </button>
          )}

          {onOpenProjectorModal && (
            <button
              onClick={onOpenProjectorModal}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 text-xs font-bold border border-cyan-500/40 transition shadow-sm"
              title="Projeter le Kiosque sur un 2ème écran / Rétroprojecteur"
            >
              <Projector className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="hidden xl:inline">Projecteur</span>
            </button>
          )}

          {onOpenUserManualPdf && (
            <button
              onClick={onOpenUserManualPdf}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition shadow-sm"
              title="Manuel Utilisateur Illustré & Guide Complet (Exportable en PDF / Touche F1)"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">Aide PDF</span>
              <span className="hidden sm:inline px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">F1</span>
            </button>
          )}

          <button
            onClick={onUnlockAdmin}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-retro-accent hover:text-retro-900 text-slate-300 text-xs font-bold border border-slate-700 hover:border-retro-accent transition shadow-lg shrink-0 cursor-pointer active:scale-95"
            title="Saisir le code PIN pour passer en mode administration"
          >
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Admin (PIN)</span>
            <span className="sm:hidden">PIN</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* NIVEAU 1 : LES FIRMES EN GRAND AU CENTRE                                   */}
      {/* ========================================================================= */}
      {step === 'companies' && (
        <div className={`flex-1 min-h-0 flex flex-col items-center justify-start ${isCompactFit ? 'p-2 sm:p-3' : 'p-3 sm:p-5 md:p-6'} z-20 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200`}>
          {/* Titre & Guide central */}
          <div className={`text-center ${isCompactFit ? 'mb-2' : 'mb-3 sm:mb-5'}`}>
            <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Étape 1 sur 3 • Choisissez votre constructeur</span>
            </div>
            <h1 className={`${isCompactFit ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl md:text-4xl'} font-black text-white tracking-wider uppercase drop-shadow-[0_0_15px_rgba(0,242,254,0.4)]`}>
              LES GRANDES FIRMES DU JEU VIDÉO
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 max-w-xl mx-auto mt-0.5 sm:mt-1">
              Cliquez ou appuyez sur A pour découvrir toutes les consoles et machines de la marque.
            </p>
          </div>

          {/* Grille des Firmes en Grand au Centre */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${isCompactFit ? 'gap-2.5 sm:gap-3' : 'gap-3 sm:gap-5'} max-w-6xl w-full justify-center`}>
            {companies.map((company, idx) => {
              const isFocused = idx === companyIndex;
              const consoleCount = systems.filter((s) => s.companyId === company.id).length;
              const romCount = gamesCountByCompany.get(company.id) || 0;
              const heroes = HEROES_BY_COMPANY[company.id] || [];

              return (
                <div
                  key={company.id}
                  onClick={() => {
                    setCompanyIndex(idx);
                    handleSelectCompany(company);
                  }}
                  onMouseEnter={() => {
                    setCompanyIndex(idx);
                    playMove();
                  }}
                  style={{
                    borderColor: isFocused ? company.accentColor : 'rgba(51, 65, 85, 0.6)',
                    boxShadow: isFocused ? `0 0 25px ${company.accentColor}55` : undefined,
                  }}
                  className={`group relative rounded-2xl sm:rounded-3xl ${isCompactFit ? 'p-2.5 sm:p-3 min-h-[160px] sm:min-h-[180px]' : 'p-3.5 sm:p-5 min-h-[200px] sm:min-h-[250px]'} flex flex-col items-center justify-between text-center ${animations ? 'transition-[transform,background-color,border-color,opacity,box-shadow] duration-300' : ''} cursor-pointer overflow-hidden ${
                    isFocused
                      ? `bg-slate-900/95 border-2 z-10 ${animations ? 'scale-102 sm:scale-105' : ''}`
                      : `bg-slate-900/60 hover:bg-slate-900/80 border ${animations ? 'hover:scale-102' : ''} opacity-90 hover:opacity-100`
                  }`}
                >
                  {/* Vidéo de fond : uniquement sur la carte focalisée, et seulement si l'effet est activé */}
                  <CompanyBackgroundVideo company={company} mode="card" active={isFocused && backgroundVideos} />

                  {/* Halo lumineux d'arrière-plan avec la couleur de la firme
                      (dégradé radial au lieu de blur: rendu GPU en une seule passe) */}
                  {neonGlows && (
                    <div
                      className={`absolute inset-0 rounded-3xl opacity-15 ${animations ? 'transition-opacity group-hover:opacity-30' : ''} pointer-events-none`}
                      style={{
                        background: `radial-gradient(ellipse at 50% 30%, ${company.accentColor}66 0%, transparent 70%)`,
                      }}
                    />
                  )}

                  {/* Contenu de la carte positionné au-dessus de la vidéo */}
                  <div className="relative z-10 w-full flex flex-col items-center justify-between flex-1">
                    {/* Vrai Logo Vectoriel Officiel de la Firme EN GRAND */}
                    <div className="w-full h-16 sm:h-20 flex items-center justify-center my-1 sm:my-2 transition-transform duration-300 group-hover:scale-110">
                      <CompanyLogo companyId={company.id} size="xl" />
                    </div>

                    {/* Nom de la firme */}
                    <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider mb-1">
                      {company.name}
                    </h3>

                    {/* Badges de statistiques */}
                    <div className="flex items-center space-x-2 my-1 sm:my-2">
                      <span className="px-2.5 py-0.5 sm:py-1 rounded-xl bg-slate-900/80 border border-slate-700 text-[10px] sm:text-[11px] font-bold text-slate-200 shadow">
                        {consoleCount} Console{consoleCount > 1 ? 's' : ''}
                      </span>
                      <span
                        style={{
                          backgroundColor: romCount > 0 ? `${company.accentColor}30` : undefined,
                          borderColor: romCount > 0 ? `${company.accentColor}70` : undefined,
                          color: romCount > 0 ? company.accentColor : '#94a3b8',
                        }}
                        className="px-2.5 py-0.5 sm:py-1 rounded-xl border text-[10px] sm:text-[11px] font-black shadow"
                      >
                        {romCount} ROM{romCount > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Citation / Mascotte */}
                    {heroes.length > 0 && (
                      <div className="mt-1 text-[10px] text-slate-300 italic line-clamp-1">
                        "{heroes[0].quote}"
                      </div>
                    )}
                  </div>

                  {/* Boutons d'action */}
                  <div className="relative z-10 w-full mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5 sm:space-y-2">
                    <button
                      type="button"
                      style={{
                        backgroundColor: isFocused ? company.accentColor : undefined,
                        color: isFocused ? '#000000' : '#ffffff',
                      }}
                      className={`w-full py-2 sm:py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow flex items-center justify-center space-x-2 ${
                        isFocused
                          ? 'shadow-neon font-black'
                          : 'bg-slate-900/80 group-hover:bg-slate-800 text-slate-200 border border-slate-700'
                      }`}
                    >
                      <span>Consoles {company.name}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playSelect();
                        setExhibitionCompany(company);
                      }}
                      style={{
                        borderColor: isFocused ? `${company.accentColor}80` : 'rgba(100, 116, 139, 0.4)',
                        backgroundColor: isFocused ? `${company.accentColor}25` : 'rgba(15, 23, 42, 0.7)',
                        color: isFocused ? '#ffffff' : '#cbd5e1',
                      }}
                      className="w-full py-1.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 border shadow hover:scale-102 hover:text-white group/mus"
                      title={`Découvrir l'histoire complète, les fondateurs et archives de ${company.name} (Touche Y ou M)`}
                    >
                      <Landmark className="w-3.5 h-3.5 text-amber-400 group-hover/mus:rotate-6 transition-transform" />
                      <span>🏛️ Musée Virtuel</span>
                      <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Raccourci vers le Grand Musée Virtuel de la firme sélectionnée */}
          {companies[companyIndex] && (
            <div className="mt-4 sm:mt-6 flex items-center justify-center">
              <button
                onClick={() => {
                  playSelect();
                  setExhibitionCompany(companies[companyIndex]);
                }}
                style={{
                  backgroundColor: `${companies[companyIndex].accentColor}25`,
                  borderColor: `${companies[companyIndex].accentColor}80`,
                  color: '#ffffff',
                  boxShadow: `0 0 25px ${companies[companyIndex].accentColor}44`,
                }}
                className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl border text-xs font-black uppercase tracking-wider transition flex items-center space-x-2.5 shadow-2xl hover:scale-105 active:scale-95 cursor-pointer group"
              >
                <Landmark className="w-4 h-4 text-amber-400 group-hover:rotate-6 transition-transform" />
                <span>Visiter le Grand Musée Virtuel de {companies[companyIndex].name}</span>
                <span className="px-1.5 py-0.5 rounded bg-black/50 text-[10px] font-mono border border-white/20 text-amber-300">Y / M</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* NIVEAU 2 : LES CONSOLES DE LA FIRME EN GRAND AU CENTRE                     */}
      {/* ========================================================================= */}
      {step === 'consoles' && selectedCompany && (
        <div className={`flex-1 min-h-0 flex flex-col items-center justify-start ${isCompactFit ? 'p-2 sm:p-3' : 'p-3 sm:p-5 md:p-6'} z-20 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200`}>
          {/* En-tête centré avec logo firme */}
          <div className={`text-center ${isCompactFit ? 'mb-2' : 'mb-3 sm:mb-5'}`}>
            <div className="flex items-center justify-center space-x-3 mb-1">
              <CompanyLogo companyId={selectedCompany.id} size="md" />
            </div>
            <h1 className={`${isCompactFit ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl md:text-3xl'} font-black text-white tracking-wider uppercase drop-shadow-[0_0_15px_rgba(0,242,254,0.4)]`}>
              CONSOLES {selectedCompany.name.toUpperCase()}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              {companySystems.length} consoles disponibles • Cliquez sur une console pour explorer sa ludothèque
            </p>

            {/* Bouton d'accès direct au Grand Musée de la firme */}
            <div className="mt-2.5 flex items-center justify-center">
              <button
                onClick={() => {
                  playSelect();
                  setExhibitionCompany(selectedCompany);
                }}
                style={{
                  backgroundColor: `${selectedCompany.accentColor}20`,
                  borderColor: `${selectedCompany.accentColor}70`,
                  boxShadow: `0 0 15px ${selectedCompany.accentColor}33`,
                }}
                className="px-3.5 py-1.5 rounded-full border text-xs font-bold text-slate-200 hover:text-white transition flex items-center space-x-2 hover:scale-105 active:scale-95 shadow"
                title={`Explorer le Musée historique complet de ${selectedCompany.name}`}
              >
                <Landmark className="w-3.5 h-3.5 text-amber-400" />
                <span>Musée Virtuel {selectedCompany.name} (Épopée, Archives, Secrets)</span>
                <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              </button>
            </div>
          </div>

          {/* Grille des Consoles en Grand au Centre */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${isCompactFit ? 'gap-2.5 sm:gap-3' : 'gap-3 sm:gap-5'} max-w-6xl w-full justify-center`}>
            {companySystems.map((sys, idx) => {
              const isFocused = idx === consoleIndex;
              const romCount = gamesCountBySystem.get(sys.id) || 0;

              return (
                <div
                  key={sys.id}
                  onClick={() => {
                    setConsoleIndex(idx);
                    handleSelectConsole(sys);
                  }}
                  onMouseEnter={() => {
                    setConsoleIndex(idx);
                    playMove();
                  }}
                  style={{
                    borderColor: isFocused ? sys.themeColor : 'rgba(51, 65, 85, 0.6)',
                    boxShadow: isFocused ? `0 0 25px ${sys.themeColor}55` : undefined,
                  }}
                  className={`group relative rounded-2xl sm:rounded-3xl ${isCompactFit ? 'p-2.5 sm:p-3 min-h-[160px]' : 'p-3.5 sm:p-5 min-h-[220px]'} flex flex-col items-center justify-between text-center ${animations ? 'transition-[transform,background-color,border-color,opacity,box-shadow] duration-300' : ''} cursor-pointer overflow-hidden ${
                    isFocused
                      ? `bg-slate-900/95 border-2 z-10 ${animations ? 'scale-102 sm:scale-105' : ''}`
                      : `bg-slate-900/60 hover:bg-slate-900/80 border ${animations ? 'hover:scale-102' : ''} opacity-90 hover:opacity-100`
                  }`}
                >
                  {/* Halo lumineux d'arrière-plan de la console (dégradé radial, sans blur) */}
                  {neonGlows && (
                    <div
                      className={`absolute inset-0 rounded-3xl opacity-15 ${animations ? 'transition-opacity group-hover:opacity-30' : ''} pointer-events-none`}
                      style={{
                        background: `radial-gradient(ellipse at 50% 30%, ${sys.themeColor}66 0%, transparent 70%)`,
                      }}
                    />
                  )}

                  {/* Vrai Logo Haute Définition de la Console EN GRAND */}
                  <div className={`w-full ${isCompactFit ? 'h-12 sm:h-14' : 'h-14 sm:h-18'} flex items-center justify-center my-1 p-1 transition-transform duration-300 group-hover:scale-110`}>
                    <ConsoleLogo system={sys} size={isCompactFit ? 'lg' : 'xl'} />
                  </div>

                  {/* Titre & Année */}
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                      {sys.name}
                    </h3>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono mt-0.5 block">
                      {sys.releaseYear} • {sys.generation}
                    </span>
                  </div>

                  {/* Badge ROMs installées */}
                  <div className="my-2 sm:my-3">
                    <span
                      style={{
                        backgroundColor: romCount > 0 ? `${sys.themeColor}25` : undefined,
                        borderColor: romCount > 0 ? `${sys.themeColor}50` : undefined,
                        color: romCount > 0 ? sys.themeColor : '#94a3b8',
                      }}
                      className="px-2.5 py-1 rounded-xl border text-[11px] sm:text-xs font-black flex items-center space-x-1.5"
                    >
                      <Gamepad2 className="w-3.5 h-3.5" />
                      <span>{romCount} JEU{romCount > 1 ? 'X' : ''} DISPONIBLE{romCount > 1 ? 'S' : ''}</span>
                    </span>
                  </div>

                  {/* Spécification clé */}
                  <div className="text-[10px] text-slate-400 font-mono line-clamp-1 px-2">
                    {sys.specs?.cpu}
                  </div>

                  {/* Boutons d'action */}
                  <div className="w-full mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5 sm:space-y-2">
                    <button
                      type="button"
                      style={{
                        backgroundColor: isFocused ? sys.themeColor : undefined,
                        color: isFocused ? '#000000' : '#ffffff',
                      }}
                      className={`w-full py-2 sm:py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow flex items-center justify-center space-x-2 ${
                        isFocused
                          ? 'shadow-neon font-black'
                          : 'bg-slate-800 group-hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <span>Voir les ROMs</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playSelect();
                        setExhibitionSystem(sys);
                      }}
                      className="w-full py-1.5 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-cyan-950 text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400 text-xs font-bold transition flex items-center justify-center space-x-2 shadow"
                      title="Découvrir l'histoire complète, l'architecture hardware et les secrets de cette console"
                    >
                      <Landmark className="w-3.5 h-3.5 text-cyan-400" />
                      <span>🏛️ Exposition Musée</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Boutons de retour et accès direct musée en bas */}
          <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={handleBackToCompanies}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center space-x-2 border border-slate-700 shadow"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retourner aux Firmes (B / Échap)</span>
            </button>

            {/* Accès direct Grand Musée de la Firme */}
            <button
              onClick={() => {
                playSelect();
                setExhibitionCompany(selectedCompany);
              }}
              style={{
                backgroundColor: `${selectedCompany.accentColor}25`,
                borderColor: `${selectedCompany.accentColor}70`,
              }}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl border text-white text-xs font-bold transition flex items-center space-x-2 shadow hover:scale-105 active:scale-95 cursor-pointer"
              title={`Consulter le Grand Musée de la firme ${selectedCompany.name}`}
            >
              <Landmark className="w-4 h-4 text-amber-400" />
              <span>Musée Firme : {selectedCompany.name}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </button>

            {companySystems[consoleIndex] && (
              <button
                onClick={() => {
                  playSelect();
                  setExhibitionSystem(companySystems[consoleIndex]);
                }}
                className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 hover:text-white border border-cyan-500/50 text-xs font-bold transition flex items-center space-x-2 shadow-neon cursor-pointer"
                title="Consulter l'exposition complète de la console sélectionnée (Touche M ou Y)"
              >
                <Landmark className="w-4 h-4 text-cyan-400" />
                <span>Exposition Musée : {companySystems[consoleIndex].name}</span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-[10px] font-mono border border-cyan-500/40">Y / M</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NIVEAU 3 : LES ROMS / JEUX DE LA CONSOLE EN GRAND AU CENTRE                */}
      {/* ========================================================================= */}
      {step === 'games' && selectedSystem && (
        <div className={`flex-1 min-h-0 flex flex-col justify-between ${isCompactFit ? 'p-2 sm:p-3' : 'p-2 sm:p-4 md:p-5'} z-20 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200`}>
          {/* Espace Central Showcase du Jeu Sélectionné (Centré à l'écran) */}
          <div className="flex-1 min-h-0 flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-6 md:gap-8 max-w-5xl mx-auto w-full my-auto">
            {currentGame ? (
              <>
                {/* Colonne Gauche : Grande Jaquette 3D & Reflet au sol */}
                <div className="flex flex-col items-center justify-center w-full md:w-1/2 max-w-sm relative group shrink-0">
                  {/* Effet halo lumineux néon aux couleurs de la console (dégradé radial, sans blur) */}
                  {neonGlows && (
                    <div
                      className="absolute inset-0 rounded-3xl opacity-40 pointer-events-none"
                      style={{
                        background: `radial-gradient(ellipse at 50% 40%, ${selectedSystem.themeColor}80 0%, transparent 70%)`,
                      }}
                    />
                  )}

                  <div className={`relative aspect-[3/4] ${isCompactFit ? 'w-32 sm:w-44 max-h-[20vh] sm:max-h-[24vh] p-1.5' : 'w-36 sm:w-48 md:w-56 lg:w-64 max-h-[24vh] sm:max-h-[30vh] md:max-h-[36vh] p-2 sm:p-3'} rounded-2xl sm:rounded-3xl bg-slate-900/90 border-2 border-slate-700/80 shadow-2xl flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105`}>
                    {currentGame.media?.boxart2d && !failedImageIds.has(currentGame.id) ? (
                      <img
                        src={resolveMediaUrl(currentGame.media.boxart2d)}
                        alt={currentGame.title}
                        className="w-full h-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]"
                        onError={() => setFailedImageIds((prev) => new Set(prev).add(currentGame.id))}
                      />
                    ) : (
                      /* Cartouche géante stylized */
                      <div className="w-full h-full rounded-2xl bg-slate-800/80 border-2 border-slate-700 flex flex-col items-center justify-center p-3 text-center shadow-inner">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-retro-accent/20 border border-retro-accent text-retro-accent flex items-center justify-center mb-2">
                          <Gamepad2 className="w-5 sm:w-6 h-5 sm:h-6" />
                        </div>
                        <span className="text-xs sm:text-sm font-black text-white line-clamp-2">{currentGame.cleanTitle}</span>
                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono mt-1 uppercase">
                          {selectedSystem.name}
                        </span>
                      </div>
                    )}

                    {/* Badge officiel de la console */}
                    <div className="absolute top-2 left-2 z-10">
                      <div
                        style={{
                          backgroundColor: 'rgba(11, 13, 20, 0.85)',
                          borderColor: `${selectedSystem.themeColor}77`,
                        }}
                        className="px-2 py-0.5 sm:py-1 rounded-xl border shadow-2xl flex items-center justify-center max-w-[130px]"
                      >
                        <ConsoleLogo system={selectedSystem} size="md" />
                      </div>
                    </div>
                  </div>

                  {/* Vrai Reflet Miroir Arcade & Ombre de Contact */}
                  <div className="w-full flex flex-col items-center pointer-events-none select-none -mt-1 overflow-hidden">
                    {/* Ombre de contact au sol */}
                    <div className="w-3/4 max-w-[240px] h-1.5 bg-black/90 blur-[2px] rounded-full" />

                    {/* Reflet miroir inversé dégressif */}
                    <div
                      className={`relative aspect-[3/4] ${
                        isCompactFit
                          ? 'w-32 sm:w-44 max-h-[8vh] sm:max-h-[10vh]'
                          : 'w-36 sm:w-48 md:w-56 lg:w-64 max-h-[9vh] sm:max-h-[12vh]'
                      } rounded-2xl sm:rounded-3xl bg-slate-900/30 border border-slate-800/30 flex items-center justify-center overflow-hidden scale-y-[-1] opacity-35 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.75)_0%,transparent_75%)] [-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.75)_0%,transparent_75%)] filter blur-[0.3px]`}
                    >
                      {currentGame.media?.boxart2d && !failedImageIds.has(currentGame.id) ? (
                        <img
                          src={resolveMediaUrl(currentGame.media.boxart2d)}
                          alt=""
                          aria-hidden="true"
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <div className="w-full h-full rounded-2xl bg-slate-800/60 flex flex-col items-center justify-center p-2 text-center">
                          <Gamepad2 className="w-6 h-6 text-retro-accent/40" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Colonne Droite : Fiche Graphique Rétro & Bouton JOUER */}
                <div className="flex-1 flex flex-col justify-center space-y-3 sm:space-y-4 max-w-lg min-w-0">
                  <div>
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-1.5 flex-wrap gap-y-1">
                      <CompanyLogo companyId={selectedCompany?.id ?? selectedSystem.companyId} size="sm" />
                      <span className="text-slate-600 font-bold">•</span>
                      <ConsoleLogo system={selectedSystem} size="md" />
                      <span className="text-slate-600 font-bold">•</span>
                      <span className="text-[11px] sm:text-xs font-mono text-slate-400">
                        {gameIndex + 1} / {consoleGames.length}
                      </span>
                      <button
                        onClick={() => {
                          playSelect();
                          setExhibitionSystem(selectedSystem);
                        }}
                        className="ml-auto px-2 py-0.5 sm:py-1 rounded-xl bg-slate-800/80 hover:bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] sm:text-[11px] font-bold flex items-center space-x-1.5 transition shadow"
                        title="Consulter l'exposition Musée & Histoire de cette console (Touche M)"
                      >
                        <Landmark className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
                        <span>Musée {selectedSystem.shortName}</span>
                      </button>
                    </div>

                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-wide uppercase drop-shadow-md truncate">
                      {currentGame.cleanTitle}
                    </h1>

                    {currentGame.metadata?.developer && (
                      <p className="text-xs sm:text-sm font-semibold text-retro-accent mt-0.5">
                        Par {currentGame.metadata.developer}
                      </p>
                    )}
                  </div>

                  {/* Badges Caractéristiques */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                    {currentGame.metadata?.releaseDate && (
                      <span className="px-2.5 py-0.5 sm:py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 font-mono flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-retro-pink" />
                        <span>{currentGame.metadata.releaseDate.substring(0, 4)}</span>
                      </span>
                    )}
                    {currentGame.region && (
                      <span className="px-2.5 py-0.5 sm:py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 font-bold">
                        {currentGame.region}
                      </span>
                    )}
                    {currentGame.metadata?.rating && (
                      <span className="px-2.5 py-0.5 sm:py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black flex items-center space-x-1">
                        <Award className="w-3 h-3" />
                        <span>{currentGame.metadata.rating}%</span>
                      </span>
                    )}
                    {currentGame.playCount && currentGame.playCount > 0 ? (
                      <span className="px-2.5 py-0.5 sm:py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold flex items-center space-x-1">
                        <Flame className="w-3 h-3 text-emerald-400" />
                        <span>{currentGame.playCount}x</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Résumé synopsis */}
                  <p className={`text-xs ${isCompactFit ? 'line-clamp-2 p-2' : 'sm:text-sm line-clamp-2 sm:line-clamp-3 p-2.5 sm:p-3'} text-slate-300 leading-relaxed bg-slate-900/60 rounded-xl border border-slate-800`}>
                    {currentGame.metadata?.synopsis ||
                      "Préparez-vous à une aventure rétro inoubliable ! Installez-vous aux commandes et lancez la partie."}
                  </p>

                  {/* GRAND BOUTON ARCADE JOUER */}
                  <div className="flex items-center space-x-2 sm:space-x-3 pt-1">
                    <button
                      onClick={() => {
                        playLaunch();
                        onLaunchGame(currentGame);
                      }}
                      className={`flex-1 flex items-center justify-center space-x-2 ${isCompactFit ? 'py-2 sm:py-2.5 text-xs sm:text-sm' : 'py-2.5 sm:py-3 text-sm sm:text-base'} rounded-xl sm:rounded-2xl bg-gradient-to-r from-retro-accent via-emerald-400 to-retro-green text-retro-900 font-black tracking-wider shadow-neon hover:scale-105 active:scale-95 transition-all cursor-pointer`}
                    >
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                      <span>▶ APPUYEZ SUR A POUR JOUER</span>
                    </button>

                    <button
                      onClick={handleRandomPickInKiosk}
                      className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25 hover:text-white transition shadow-sm"
                      title="Choisir un jeu au hasard sur cette console (Touche R / Select manette)"
                    >
                      <Dices className="w-5 h-5 text-amber-400" />
                    </button>

                    <button
                      onClick={() => {
                        playFavorite();
                        onToggleFavorite(currentGame.id);
                      }}
                      className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition ${
                        currentGame.favorite
                          ? 'bg-rose-500 text-white border-rose-400 shadow-neon-pink'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                      title="Ajouter aux favoris (Touche Y / F)"
                    >
                      <Heart className={`w-5 h-5 ${currentGame.favorite ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => {
                        playSelect();
                        onViewDetails(currentGame);
                      }}
                      className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-800/80 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 transition"
                      title="Fiche détaillée (Touche X / D)"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* État quand la console n'a pas encore de ROM */
              <div className="text-center py-16 px-6 max-w-md mx-auto bg-slate-900/80 border border-slate-800 rounded-3xl p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                  <FolderOpen className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Aucune ROM détectée pour {selectedSystem.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Déposez vos jeux dans le dossier <code className="text-retro-accent font-mono">roms/{selectedSystem.subfolder}</code> pour qu'ils apparaissent ici.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleBackToConsoles}
                    className="px-5 py-2.5 rounded-xl bg-retro-accent text-retro-900 font-bold text-xs shadow-neon transition"
                  >
                    ⬅️ Choisir une autre console
                  </button>
                  <button
                    onClick={() => {
                      playSelect();
                      setExhibitionSystem(selectedSystem);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition flex items-center space-x-1.5 shadow"
                  >
                    <Landmark className="w-4 h-4 text-cyan-400" />
                    <span>🏛️ Visiter le Musée de la {selectedSystem.name}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Barre de saut alphabétique si plus de 8 jeux */}
          {consoleGames.length > 8 && availableLetters.length > 1 && (
            <div className="flex items-center justify-center space-x-1.5 py-1 z-30 max-w-2xl mx-auto overflow-x-auto no-scrollbar shrink-0">
              {availableLetters.map((char) => {
                const isMatching = currentGame?.cleanTitle.toUpperCase().startsWith(char);
                return (
                  <button
                    key={char}
                    onClick={() => {
                      playMove();
                      const targetIdx = consoleGames.findIndex((g) => g.cleanTitle.toUpperCase().startsWith(char));
                      if (targetIdx >= 0) setGameIndex(targetIdx);
                    }}
                    className={`w-6 h-6 rounded-lg text-[10px] font-bold font-mono transition ${
                      isMatching
                        ? 'bg-retro-accent text-retro-900 shadow-neon scale-110 font-black'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {char}
                  </button>
                );
              })}
            </div>
          )}

          {/* Carrousel Inférieur de Défilement des Jeux de la Console */}
          {consoleGames.length > 1 && (
            <div className={`${isCompactFit ? 'h-13 sm:h-16 mt-1' : 'h-16 sm:h-20 mt-1.5 sm:mt-3'} bg-retro-900/90 border border-slate-800/80 rounded-xl sm:rounded-2xl px-2.5 sm:px-5 flex items-center justify-between z-30 shrink-0 max-w-4xl mx-auto w-full`}>
              <button
                onClick={() => {
                  playMove();
                  setGameIndex((prev) => (prev > 0 ? prev - 1 : consoleGames.length - 1));
                }}
                className="p-1 sm:p-1.5 rounded-xl bg-slate-800 hover:bg-retro-accent hover:text-retro-900 text-slate-300 transition shadow shrink-0"
                title="Jeu précédent (Flèche Gauche / LB)"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Miniatures des jeux avec zoom sur le jeu sélectionné */}
              <div className="flex-1 flex items-center justify-center space-x-2 sm:space-x-3 overflow-hidden px-2 sm:px-4">
                {consoleGames.slice(Math.max(0, gameIndex - 3), gameIndex + 4).map((game) => {
                  const isCurrent = game.id === currentGame?.id;
                  return (
                    <div
                      key={game.id}
                      onClick={() => {
                        playMove();
                        const idx = consoleGames.findIndex((g) => g.id === game.id);
                        if (idx >= 0) setGameIndex(idx);
                      }}
                      className={`relative aspect-[3/4] ${isCompactFit ? 'h-10 sm:h-12' : 'h-12 sm:h-14 md:h-15'} rounded-lg sm:rounded-xl bg-slate-800 border-2 overflow-hidden cursor-pointer transition-all duration-200 shrink-0 ${
                        isCurrent
                          ? 'border-retro-accent shadow-neon scale-105 sm:scale-110 z-10'
                          : 'border-slate-700 opacity-60 hover:opacity-100 hover:scale-102'
                      }`}
                    >
                      {game.media?.boxart2d && !failedImageIds.has(game.id) ? (
                        <img
                          src={resolveMediaUrl(game.media.boxart2d)}
                          alt={game.title}
                          className="w-full h-full object-contain p-0.5"
                          onError={() => setFailedImageIds((prev) => new Set(prev).add(game.id))}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-1 text-[8px] font-bold text-center text-slate-300">
                          {game.cleanTitle}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  playMove();
                  setGameIndex((prev) => (prev < consoleGames.length - 1 ? prev + 1 : 0));
                }}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-retro-accent hover:text-retro-900 text-slate-300 transition shadow shrink-0"
                title="Jeu suivant (Flèche Droite / RB)"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* PIED DE PAGE : INDICATEURS MANETTE & COMMANDES SELON LE NIVEAU ACTIF */}
      <footer className="h-9 sm:h-10 bg-slate-950/90 border-t border-slate-800/80 px-3 sm:px-6 flex items-center justify-between z-30 shrink-0 text-[10px] sm:text-[11px] text-slate-400 font-mono overflow-x-auto no-scrollbar gap-2">
        <div className="flex items-center space-x-2.5 sm:space-x-4 shrink-0">
          <span className="flex items-center space-x-1 sm:space-x-1.5">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-bold border border-slate-700">
              ◀ ▶ / Stick
            </span>
            <span>Naviguer</span>
          </span>

          <span className="flex items-center space-x-1 sm:space-x-1.5">
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">
              A / Entrée
            </span>
            <span>{step === 'games' ? 'Lancer le Jeu' : 'Sélectionner'}</span>
          </span>

          {step === 'companies' && (
            <span className="flex items-center space-x-1 sm:space-x-1.5">
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                Y / M
              </span>
              <span>Musée Firme</span>
            </span>
          )}

          {step !== 'companies' && (
            <span className="flex items-center space-x-1 sm:space-x-1.5">
              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/40">
                B / Échap
              </span>
              <span>Retour</span>
            </span>
          )}

          {step === 'consoles' && (
            <span className="flex items-center space-x-1 sm:space-x-1.5">
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40">
                Y / M
              </span>
              <span>Exposition Musée</span>
            </span>
          )}

          {step === 'games' && (
            <>
              <span className="hidden sm:flex items-center space-x-1.5">
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40">
                  X / F
                </span>
                <span>Favori</span>
              </span>
              <span className="hidden sm:flex items-center space-x-1.5">
                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/40">
                  Y / D
                </span>
                <span>Détails</span>
              </span>
              <span className="hidden sm:flex items-center space-x-1.5">
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40">
                  M
                </span>
                <span>Musée Console</span>
              </span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
            START / Échap
          </span>
          <span className="hidden sm:inline">Déverrouiller Admin</span>
          <span className="sm:hidden">Admin</span>
        </div>
      </footer>

      {/* MODALE D'EXPOSITION PERMANENTE & MUSÉE DU RETROGAMING */}
      <ConsoleExhibitionModal
        system={exhibitionSystem}
        isOpen={!!exhibitionSystem}
        onClose={() => setExhibitionSystem(null)}
        onPlayGames={(sys) => {
          setExhibitionSystem(null);
          handleSelectConsole(sys);
        }}
        onOpenCompanyMuseum={(companyId) => {
          playSelect();
          const comp = companies.find((c) => c.id === companyId);
          if (comp) {
            setExhibitionSystem(null);
            setExhibitionCompany(comp);
          }
        }}
      />

      {/* MODALE DU GRAND MUSÉE VIRTUEL DE LA FIRME DANS LE MODE KIOSK */}
      <CompanyExhibitionModal
        company={exhibitionCompany}
        systems={systems.filter((s) => s.companyId === exhibitionCompany?.id)}
        isOpen={!!exhibitionCompany}
        onClose={() => {
          playBack();
          setExhibitionCompany(null);
        }}
        onOpenSystemExhibition={(sys) => {
          setExhibitionCompany(null);
          setExhibitionSystem(sys);
        }}
        onExploreGames={(sysId) => {
          setExhibitionCompany(null);
          const targetSystem = systems.find((s) => s.id === sysId);
          if (targetSystem) {
            handleSelectConsole(targetSystem);
          }
        }}
      />
    </div>
  );
};
