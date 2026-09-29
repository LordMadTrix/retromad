import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import { Game, System, Company, EmulatorProfile } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { CompanyBackgroundVideo } from './CompanyBackgroundVideo';

const ConsoleExhibitionModal = React.lazy(() => import('./ConsoleExhibitionModal').then((m) => ({ default: m.ConsoleExhibitionModal })));
const CompanyExhibitionModal = React.lazy(() => import('./CompanyExhibitionModal').then((m) => ({ default: m.CompanyExhibitionModal })));
import {
  Play,
  Heart,
  Settings,
  Sparkles,
  ChevronRight,
  Flame,
  Calendar,
  Gamepad2,
  ArrowLeft,
  Tv,
  Landmark,
  Dices,
  Projector,
  BookOpen,
  Timer,
  Layers,
  Sliders,
  Maximize2,
  Monitor,
  X,
  Star,
  GripVertical,
  Disc3,
  Trophy,
  Swords,
  LayoutGrid,
  List,
  HardDrive,
  Palette,
  Radio,
  Download,
} from 'lucide-react';
import { useAudio } from '../hooks/useAudio';
import { useGamepad } from '../hooks/useGamepad';
import { resolveMediaUrl } from '../utils/media';
import {
  companyDisplayName,
  companyMatchesCategory,
  KIOSK_COMPUTING_IDS,
  COMPANY_DISPLAY_BY_CATEGORY,
  type KioskCategory,
} from './kiosk/kioskShared';

// Niveaux Consoles & Jeux chargés à la demande (code splitting du boot Kiosque)
const KioskConsolesLevel = React.lazy(() => import('./kiosk/KioskConsolesLevel').then((m) => ({ default: m.KioskConsolesLevel })));
const KioskGamesLevel = React.lazy(() => import('./kiosk/KioskGamesLevel').then((m) => ({ default: m.KioskGamesLevel })));

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
  /** Personnalisation Kiosque (Centre Admin → Kiosque) */
  kioskWidgets?: Record<string, boolean | string>;
  hiddenCompanyIds?: string[];
  hiddenSystemIds?: string[];
  companyOrder?: string[];
  featuredGameIds?: string[];
  /** Réordonner les firmes (actif seulement si la régie admin est déverrouillée) */
  onReorderCompanies?: (orderedIds: string[]) => void;
  /** Widgets ludiques supplémentaires de la borne (on/off via kioskWidgets) */
  onOpenJukebox?: () => void;
  onOpenRoulette?: () => void;
  onOpenAchievements?: () => void;
  onOpenTournament?: () => void;
  onOpenManuals?: () => void;
  onOpenThemeStudio?: () => void;
  onTriggerAttractMode?: () => void;
  onReloadGames?: () => void;
}

type KioskStep = 'companies' | 'consoles' | 'games';
export type KioskGameViewMode = 'showcase' | 'grid' | 'wheel' | 'list';

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
  kioskWidgets = {},
  hiddenCompanyIds = [],
  hiddenSystemIds = [],
  companyOrder = [],
  featuredGameIds = [],
  onReorderCompanies,
  onOpenJukebox,
  onOpenRoulette,
  onOpenAchievements,
  onOpenTournament,
  onOpenManuals,
  onOpenThemeStudio,
  onTriggerAttractMode,
  onReloadGames,
}) => {
  // Navigation hiérarchique Kiosk à 3 niveaux : Firmes -> Consoles -> ROMs
  const [step, setStep] = useState<KioskStep>('companies');

  // Préchargage silencieux des niveaux Consoles/Jeux (lazy) une fois l'écran
  // d'accueil rendu — un clic sur une firme n'attend plus le réseau/disque.
  useEffect(() => {
    const t1 = window.setTimeout(() => {
      import('./kiosk/KioskConsolesLevel');
    }, 1500);
    const t2 = window.setTimeout(() => {
      import('./kiosk/KioskGamesLevel');
    }, 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
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

  // ── Détection Clés USB Plug & Play ──
  const [detectedUsbDrives, setDetectedUsbDrives] = useState<{ path: string; label: string; romsCount: number }[]>([]);
  const [isImportingUsb, setIsImportingUsb] = useState(false);
  const [usbImportResult, setUsbImportResult] = useState<string | null>(null);

  // Mode d'affichage des jeux au niveau 3 (Vitrine, Grille, Roue 3D, Liste)
  const [gameViewMode, setGameViewMode] = useState<KioskGameViewMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('retromad_kiosk_game_view') as KioskGameViewMode;
      if (saved && ['showcase', 'grid', 'wheel', 'list'].includes(saved)) return saved;
    }
    return 'showcase';
  });

  const activeItemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [gameIndex, gameViewMode]);

  // Cadre actif au niveau 1 : PC (micro-ordinateurs) ou Consoles
  const [category, setCategory] = useState<KioskCategory>('all');

  const {
    playMove,
    playSelect,
    playLaunch,
    playBack,
    playCoin,
    playFavorite,
    playDice,
    toggleArcadeAmbience,
    isArcadeAmbienceActive,
  } = useAudio(soundEnabled, soundVolume);

  // Détection continue des clés USB branchées (toutes les 4 secondes)
  useEffect(() => {
    let mounted = true;
    const checkUsb = async () => {
      if (window.api?.detectUsbDrives) {
        try {
          const drives = await window.api.detectUsbDrives();
          if (mounted && drives) {
            setDetectedUsbDrives(drives);
          }
        } catch {}
      }
    };
    checkUsb();
    const interval = setInterval(checkUsb, 4000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleImportUsb = async (usbPath: string) => {
    if (!window.api?.importFromUsb) return;
    setIsImportingUsb(true);
    try {
      playCoin();
      const res = await window.api.importFromUsb(usbPath);
      if (res.success) {
        setUsbImportResult(`✅ ${res.imported} nouvelle(s) ROM(s) ajoutée(s) avec succès !`);
        if (onReloadGames) onReloadGames();
      } else {
        setUsbImportResult(`❌ Erreur d'import : ${res.message || 'Échec'}`);
      }
    } catch {
      setUsbImportResult(`❌ Erreur lors de l'import USB`);
    } finally {
      setIsImportingUsb(false);
      setTimeout(() => setUsbImportResult(null), 5000);
    }
  };

  /** Marque une jaquette en échec (image introuvable) pour afficher le repli. */
  const handleImageError = useCallback((gameId: string) => {
    setFailedImageIds((prev) => {
      const next = new Set(prev);
      next.add(gameId);
      return next;
    });
  }, []);

  const handleSetGameViewMode = (mode: KioskGameViewMode) => {
    playSelect();
    setGameViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('retromad_kiosk_game_view', mode);
    }
  };

  const handleCycleGameViewMode = useCallback(() => {
    playSelect();
    setGameViewMode((prev) => {
      const modes: KioskGameViewMode[] = ['showcase', 'grid', 'wheel', 'list'];
      const nextIdx = (modes.indexOf(prev) + 1) % modes.length;
      const next = modes[nextIdx];
      if (typeof window !== 'undefined') {
        localStorage.setItem('retromad_kiosk_game_view', next);
      }
      return next;
    });
  }, [playSelect]);

  // Widget actif ? Défaut : tout visible (les réglages n'écrasent que ce qui est défini)
  const isWidgetOn = useCallback(
    (id: string) => kioskWidgets[id] !== false,
    [kioskWidgets]
  );
  // (le thème saisonnier '__theme' est stocké dans kioskWidgets comme string)

  // ── Glisser-déposer des firmes (réordonnancement mémorisé dans les réglages) ──
  // Le composant reçoit onReorderCompanies (optionnel) : présent uniquement
  // quand la régie admin est déverrouillée — les joueurs ne déplacent rien.
  const [dragCompanyId, setDragCompanyId] = useState<string | null>(null);
  const [dragOverCompanyId, setDragOverCompanyId] = useState<string | null>(null);

  // ── APERÇU EN DIRECT : démo silencieuse après 2 s de survol d'une jaquette ──
  const [previewGame, setPreviewGame] = useState<Game | null>(null);
  const previewTimerRef = useRef<any>(null);
  const isWidgetPreviewOn = kioskWidgets['preview'] !== false;

  const startPreviewTimer = useCallback(
    (game: Game) => {
      if (!isWidgetPreviewOn) return;
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = setTimeout(() => setPreviewGame(game), 2000);
    },
    [isWidgetPreviewOn]
  );
  const cancelPreviewTimer = useCallback(() => {
    clearTimeout(previewTimerRef.current);
    setPreviewGame(null);
  }, []);
  useEffect(() => () => clearTimeout(previewTimerRef.current), []);

  // Firmes filtrées : masquage personnalisé + cadre (PC / Consoles) + ordre glisser-déposer
  const visibleCompanies = useMemo(() => {
    const hidden = new Set(hiddenCompanyIds);
    const filtered = companies.filter((c) => !hidden.has(c.id));
    const ordered = companyOrder.length
      ? [...filtered].sort((a, b) => {
          const ia = companyOrder.indexOf(a.id);
          const ib = companyOrder.indexOf(b.id);
          return (ia === -1 ? Infinity : ia) - (ib === -1 ? Infinity : ib);
        })
      : filtered;
    if (category === 'all') return ordered;
    return ordered.filter((c) => companyMatchesCategory(c.id, systems, category));
  }, [companies, systems, category, hiddenCompanyIds, companyOrder]);

  // Garantir un index valide quand le filtre change
  useEffect(() => {
    setCompanyIndex((prev) => (prev >= visibleCompanies.length ? 0 : prev));
  }, [visibleCompanies.length]);

  // Dépôt d'une firme glissée : recalcule l'ordre et le persiste via les réglages
  const handleDropCompany = useCallback(
    (targetId: string) => {
      setDragOverCompanyId(null);
      if (!dragCompanyId || dragCompanyId === targetId || !onReorderCompanies) return;
      const ids = visibleCompanies.map((c) => c.id);
      const from = ids.indexOf(dragCompanyId);
      const to = ids.indexOf(targetId);
      if (from === -1 || to === -1) return;
      ids.splice(to, 0, ids.splice(from, 1)[0]);
      onReorderCompanies(ids);
      setDragCompanyId(null);
      playSelect();
    },
    [dragCompanyId, onReorderCompanies, visibleCompanies, playSelect]
  );

  const switchCategory = useCallback((next: KioskCategory) => {
    setCategory((prev) => {
      if (prev === next) return prev;
      playSelect();
      return next;
    });
    setCompanyIndex(0);
  }, [playSelect]);

  // Effet d'ambiance monnayeur arcade au démarrage
  useEffect(() => {
    const timer = setTimeout(() => {
      playCoin();
    }, 400);
    return () => clearTimeout(timer);
  }, [playCoin]);

  // Machines de la firme sélectionnée : d'abord les PC/micros, puis les consoles
  // (affichage groupé « PC & Micro-ordinateurs » / « Consoles » au niveau 2)
  // + masquage personnalisé des machines (Centre Admin → Kiosque)
  const companySystems = useMemo(() => {
    if (!selectedCompany) return [];
    const hidden = new Set(hiddenSystemIds);
    const all = systems.filter((s) => s.companyId === selectedCompany.id && !hidden.has(s.id));
    const pcs = all.filter((s) => KIOSK_COMPUTING_IDS.has(s.id));
    const consoles = all.filter((s) => !KIOSK_COMPUTING_IDS.has(s.id));
    if (category === 'computing') return pcs;
    if (category === 'consoles') return consoles;
    return [...pcs, ...consoles];
  }, [systems, selectedCompany, category, hiddenSystemIds]);

  // Sous-listes pour l'affichage groupé du niveau 2
  const companyPcSystems = useMemo(
    () => companySystems.filter((s) => KIOSK_COMPUTING_IDS.has(s.id)),
    [companySystems]
  );
  const companyConsoleSystems = useMemo(
    () => companySystems.filter((s) => !KIOSK_COMPUTING_IDS.has(s.id)),
    [companySystems]
  );

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

  const lastWheelTimeRef = useRef<number>(0);

  const handleWheelCoverflow = useCallback((e: React.WheelEvent) => {
    // Empêche tout défilement brusque : avance de manière soyeuse 1 jeu par 1 jeu
    if (Math.abs(e.deltaY) > 8 || Math.abs(e.deltaX) > 8) {
      const now = performance.now();
      if (now - lastWheelTimeRef.current > 140) {
        lastWheelTimeRef.current = now;
        playMove();
        if (e.deltaY > 0 || e.deltaX > 0) {
          setGameIndex((prev) => (prev < consoleGames.length - 1 ? prev + 1 : 0));
        } else {
          setGameIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, consoleGames.length - 1)));
        }
      }
    }
  }, [consoleGames.length, playMove]);

  // Jeux épinglés en vedette (Centre Admin → Kiosque) : carrousel de l'accueil
  const featuredGames = useMemo(() => {
    if (featuredGameIds.length === 0) return [];
    const byId = new Map(games.map((g) => [g.id, g]));
    return featuredGameIds.map((id) => byId.get(id)).filter((g): g is Game => !!g);
  }, [featuredGameIds, games]);

  // ── JEU DU JOUR : un jeu différent chaque jour, tiré de façon déterministe ──
  // (même jeu toute la journée pour tous les postes ; change à minuit)
  const dailyGame = useMemo(() => {
    if (!isWidgetOn('daily')) return null;
    const pool = games.filter((g) => g.favorite).length > 0 ? games.filter((g) => g.favorite) : games;
    if (pool.length === 0) return null;
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    return pool[seed % pool.length];
  }, [games, isWidgetOn]);

  // ── THÈME SAISONNIER : teinte d'ambiance de la borne (réglable) ──
  const seasonTheme = String(kioskWidgets['__theme'] ?? 'auto');
  const activeTheme = useMemo(() => {
    if (seasonTheme !== 'auto') return seasonTheme;
    const d = new Date();
    const md = (d.getMonth() + 1) * 100 + d.getDate();
    if (md >= 1225 || md <= 106) return 'noel';
    if (md >= 1020 && md <= 1103) return 'halloween';
    return 'neon';
  }, [seasonTheme]);
  const THEME_ACCENT: Record<string, { ring: string; glow: string; label: string }> = {
    neon: { ring: 'border-cyan-400', glow: 'rgba(0,242,254,0.4)', label: '' },
    halloween: { ring: 'border-orange-500', glow: 'rgba(249,115,22,0.45)', label: '🎃' },
    noel: { ring: 'border-red-500', glow: 'rgba(239,68,68,0.45)', label: '🎄' },
    off: { ring: 'border-slate-400', glow: 'rgba(148,163,184,0.3)', label: '' },
  };
  const themeAccent = THEME_ACCENT[activeTheme] || THEME_ACCENT.neon;

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
      onUp: () => {
        if (exhibitionSystem || exhibitionCompany) return;
        playMove();
        if (step === 'games') {
          if (gameViewMode === 'grid') {
            setGameIndex((prev) => Math.max(0, prev - 5));
          } else if (gameViewMode === 'list' || gameViewMode === 'wheel') {
            setGameIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, consoleGames.length - 1)));
          }
        } else if (step === 'consoles') {
          setConsoleIndex((prev) => Math.max(0, prev - 4));
        } else if (step === 'companies') {
          setCompanyIndex((prev) => Math.max(0, prev - 4));
        }
      },
      onDown: () => {
        if (exhibitionSystem || exhibitionCompany) return;
        playMove();
        if (step === 'games') {
          if (gameViewMode === 'grid') {
            setGameIndex((prev) => Math.min(consoleGames.length - 1, prev + 5));
          } else if (gameViewMode === 'list' || gameViewMode === 'wheel') {
            setGameIndex((prev) => (prev < consoleGames.length - 1 ? prev + 1 : 0));
          }
        } else if (step === 'consoles') {
          setConsoleIndex((prev) => Math.min(companySystems.length - 1, prev + 4));
        } else if (step === 'companies') {
          setCompanyIndex((prev) => Math.min(visibleCompanies.length - 1, prev + 4));
        }
      },
      onLeft: () => {
        playMove();
        if (step === 'companies') {
          setCompanyIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, visibleCompanies.length - 1)));
        } else if (step === 'consoles') {
          setConsoleIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, companySystems.length - 1)));
        } else if (step === 'games') {
          setGameIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, consoleGames.length - 1)));
        }
      },
      onRight: () => {
        playMove();
        if (step === 'companies') {
          setCompanyIndex((prev) => (prev < visibleCompanies.length - 1 ? prev + 1 : 0));
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
          const comp = visibleCompanies[companyIndex];
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
          const comp = visibleCompanies[companyIndex];
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
          const comp = visibleCompanies[companyIndex];
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
      if (e.key === 'ArrowUp') {
        if (exhibitionSystem || exhibitionCompany) return;
        playMove();
        if (step === 'games') {
          if (gameViewMode === 'grid') {
            setGameIndex((prev) => Math.max(0, prev - 5));
          } else if (gameViewMode === 'list' || gameViewMode === 'wheel') {
            setGameIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, consoleGames.length - 1)));
          }
        } else if (step === 'consoles') {
          setConsoleIndex((prev) => Math.max(0, prev - 4));
        } else if (step === 'companies') {
          setCompanyIndex((prev) => Math.max(0, prev - 4));
        }
      } else if (e.key === 'ArrowDown') {
        if (exhibitionSystem || exhibitionCompany) return;
        playMove();
        if (step === 'games') {
          if (gameViewMode === 'grid') {
            setGameIndex((prev) => Math.min(consoleGames.length - 1, prev + 5));
          } else if (gameViewMode === 'list' || gameViewMode === 'wheel') {
            setGameIndex((prev) => (prev < consoleGames.length - 1 ? prev + 1 : 0));
          }
        } else if (step === 'consoles') {
          setConsoleIndex((prev) => Math.min(companySystems.length - 1, prev + 4));
        } else if (step === 'companies') {
          setCompanyIndex((prev) => Math.min(visibleCompanies.length - 1, prev + 4));
        }
      } else if (e.key === 'ArrowLeft') {
        if (exhibitionSystem || exhibitionCompany) return;
        playMove();
        if (step === 'companies') {
          setCompanyIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, visibleCompanies.length - 1)));
        } else if (step === 'consoles') {
          setConsoleIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, companySystems.length - 1)));
        } else if (step === 'games') {
          setGameIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, consoleGames.length - 1)));
        }
      } else if (e.key === 'ArrowRight') {
        if (exhibitionSystem || exhibitionCompany) return;
        playMove();
        if (step === 'companies') {
          setCompanyIndex((prev) => (prev < visibleCompanies.length - 1 ? prev + 1 : 0));
        } else if (step === 'consoles') {
          setConsoleIndex((prev) => (prev < companySystems.length - 1 ? prev + 1 : 0));
        } else if (step === 'games') {
          setGameIndex((prev) => (prev < consoleGames.length - 1 ? prev + 1 : 0));
        }
      } else if (e.key.toLowerCase() === 'v') {
        if (step === 'games' && !exhibitionSystem && !exhibitionCompany) {
          handleCycleGameViewMode();
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
          const comp = visibleCompanies[companyIndex];
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
      } else if (e.key === 'Tab') {
        // Basculer entre les cadres PC et Consoles au niveau firmes
        if (step === 'companies' && !exhibitionSystem && !exhibitionCompany) {
          e.preventDefault();
          switchCategory(category === 'computing' ? 'consoles' : 'computing');
        }
      } else if (e.key.toLowerCase() === 'm' || e.key.toLowerCase() === 'e') {
        if (step === 'companies') {
          const comp = visibleCompanies[companyIndex];
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
        if (onOpenRoulette) {
          playDice();
          onOpenRoulette();
        } else {
          handleRandomPickInKiosk();
        }
      } else if (e.key.toLowerCase() === 'b' || e.key.toLowerCase() === 's') {
        if (step === 'games' && onOpenCartridgeShelf) {
          playSelect();
          onOpenCartridgeShelf();
        }
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
    gameViewMode,
    handleCycleGameViewMode,
  ]);

  return (
    <div className="flex-1 min-h-0 w-full h-full flex flex-col bg-[#06080d] text-slate-100 select-none overflow-hidden relative">
      <div className="kiosk-animated-background absolute inset-0 z-0 pointer-events-none" />
      {/* Texture CRT & Scanlines Arcade (activées uniquement si l'option CRT est active) */}
      {crtEnabled && (
        <>
          <div className="absolute inset-0 scanlines opacity-35 z-20 pointer-events-none" />
          <div className="absolute inset-0 crt-vignette z-20 pointer-events-none" />
        </>
      )}

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
                  <span className="truncate">{companyDisplayName(selectedCompany, category).toUpperCase()}</span>
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
          {/* Monnayeur Arcade Interactif (widget désactivable) */}
          {isWidgetOn('credits') && (
          <button
            onClick={() => playCoin()}
            className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold transition shadow-sm"
            title="Insérer une pièce / Insert Coin"
          >
            <span>🪙</span>
            <span>CRÉDITS: 99</span>
          </button>
          )}

          {/* Bouton Jeu au Hasard (widget désactivable) */}
          {isWidgetOn('random') && (
          <button
            onClick={handleRandomPickInKiosk}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-bold transition shadow-sm hover:text-white"
            title="Choisir un jeu au hasard (Touche R ou Select manette)"
          >
            <Dices className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xl:inline">Hasard</span>
          </button>
          )}

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

          {/* SÉLECTEUR DE VUE DES JEUX (Vitrine, Grille, Roue 3D, Liste) */}
          {step === 'games' && (
            <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-0.5 space-x-0.5 shadow-inner">
              <button
                onClick={() => handleSetGameViewMode('showcase')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                  gameViewMode === 'showcase'
                    ? 'bg-retro-accent text-retro-900 shadow-neon font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
                title="Vue Vitrine / Héros 3D (Touche V)"
              >
                <Tv className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Vitrine</span>
              </button>
              <button
                onClick={() => handleSetGameViewMode('grid')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                  gameViewMode === 'grid'
                    ? 'bg-retro-accent text-retro-900 shadow-neon font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
                title="Vue Grille / Mur de Jaquettes (Touche V)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Grille</span>
              </button>
              <button
                onClick={() => handleSetGameViewMode('wheel')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                  gameViewMode === 'wheel'
                    ? 'bg-retro-accent text-retro-900 shadow-neon font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
                title="Vue Roue 3D Arcade / Coverflow (Touche V)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Coverflow</span>
              </button>
              <button
                onClick={() => handleSetGameViewMode('list')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                  gameViewMode === 'list'
                    ? 'bg-retro-accent text-retro-900 shadow-neon font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
                title="Vue Liste Détaillée / Split View (Touche V)"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Liste</span>
              </button>
            </div>
          )}

          {/* Jukebox Chiptune (widget désactivable) */}
          {onOpenJukebox && isWidgetOn('music') && (
            <button
              onClick={onOpenJukebox}
              className="p-1.5 rounded-xl border border-pink-500/40 bg-pink-950/40 text-pink-300 hover:bg-pink-900/60 transition shadow-sm"
              title="Jukebox Chiptune 8/16-Bit"
            >
              <Disc3 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Roulette Rétro (widget désactivable) */}
          {onOpenRoulette && isWidgetOn('roulette') && (
            <button
              onClick={onOpenRoulette}
              className="p-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 transition shadow-sm"
              title="Roulette Rétro & Défi du Jour"
            >
              <Dices className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Succès Rétro (widget désactivable) */}
          {onOpenAchievements && isWidgetOn('achievements') && (
            <button
              onClick={onOpenAchievements}
              className="p-1.5 rounded-xl border border-amber-500/40 bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 transition shadow-sm"
              title="RetroAchievements & Succès"
            >
              <Trophy className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Tournois Arcade (widget désactivable) */}
          {onOpenTournament && isWidgetOn('tournament') && (
            <button
              onClick={onOpenTournament}
              className="p-1.5 rounded-xl border border-orange-500/40 bg-orange-950/40 text-orange-300 hover:bg-orange-900/60 transition shadow-sm"
              title="Tournois Arcade Multijoueur"
            >
              <Swords className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Manuels & Notices (widget désactivable) */}
          {onOpenManuals && isWidgetOn('manuals') && (
            <button
              onClick={onOpenManuals}
              className="p-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 transition shadow-sm"
              title="Manuels & Notices d'Époque"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Profils Shaders Rétro (widget désactivable) */}
          {onOpenShaderProfiles && isWidgetOn('shaders') && (
            <button
              onClick={onOpenShaderProfiles}
              className="p-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 transition shadow-sm"
              title="Changer de profil Shader (Trinitron, DMG, 15kHz...)"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Étagère 3D Cartouches (widget désactivable) */}
          {onOpenCartridgeShelf && isWidgetOn('shelf') && (
            <button
              onClick={onOpenCartridgeShelf}
              className="p-1.5 rounded-xl border border-purple-500/40 bg-purple-950/40 text-purple-300 hover:bg-purple-900/60 transition shadow-sm"
              title="Ouvrir l'étagère de cartouches physiques 3D"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Chronomètre Speedrun (widget désactivable) */}
          {onOpenSpeedrun && isWidgetOn('speedrun') && (
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

          {/* Studio de Thèmes Personnalisés */}
          {onOpenThemeStudio && (
            <button
              onClick={onOpenThemeStudio}
              className="p-1.5 rounded-xl border border-purple-500/40 bg-purple-950/40 text-purple-300 hover:bg-purple-900/60 transition shadow-sm cursor-pointer"
              title="Studio & Éditeur de Thème Personnalisé (Couleurs, Bezels, Shaders, JSON)"
            >
              <Palette className="w-3.5 h-3.5" />
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

          {/* Roulette Défi / Soirée entre amis */}
          {onOpenRoulette && (
            <button
              onClick={() => {
                playDice();
                onOpenRoulette();
              }}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 to-pink-600/30 hover:from-purple-600/50 hover:to-pink-600/50 text-pink-300 hover:text-white border border-pink-500/50 text-xs font-bold transition shadow-[0_0_10px_rgba(236,72,153,0.2)] active:scale-95 cursor-pointer"
              title="Lancer la Roulette Rétro & Défi Soirée (Touche R)"
            >
              <Dices className="w-3.5 h-3.5 text-pink-400 animate-bounce" />
              <span className="hidden sm:inline">Roulette Défi</span>
              <span className="hidden sm:inline px-1 py-0.2 rounded bg-pink-500/20 text-pink-300 text-[10px] font-mono">R</span>
            </button>
          )}

          {/* Son d'ambiance Salle d'Arcade Années 90 */}
          <button
            onClick={() => {
              playSelect();
              toggleArcadeAmbience();
            }}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm cursor-pointer ${
              isArcadeAmbienceActive
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-slate-700'
            }`}
            title="Activer/Désactiver l'ambiance sonore 'Salle d'Arcade Années 90'"
          >
            <Radio className={`w-3.5 h-3.5 ${isArcadeAmbienceActive ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="hidden xl:inline">Ambiance Arcade</span>
          </button>

          {/* Mode Démo Arcade (Insert Coin) */}
          {onTriggerAttractMode && (
            <button
              onClick={() => {
                playSelect();
                onTriggerAttractMode();
              }}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-xs font-bold transition shadow-sm cursor-pointer"
              title="Lancer le Mode Démo Écran de Veille Arcade (Insert Coin)"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden xl:inline">Démo</span>
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
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 text-xs font-bold border border-slate-700 hover:border-cyan-500/50 transition shadow-lg shrink-0 cursor-pointer active:scale-95"
            title="Ouvrir le Centre d'Administration complet"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Administration</span>
          </button>
        </div>
      </header>

      {/* BANNIÈRE PLUG & PLAY CLÉ USB DÉTECTÉE */}
      {detectedUsbDrives.length > 0 && (
        <div className="mx-4 sm:mx-6 mt-2 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-cyan-950/95 via-slate-900/95 to-blue-950/95 border-2 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3 z-30 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 animate-pulse shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                <span>Clé USB détectée :</span>
                <span className="text-cyan-300 font-mono">« {detectedUsbDrives[0].label} »</span>
              </div>
              <div className="text-[11px] text-cyan-200/80 font-mono">
                {detectedUsbDrives[0].romsCount} ROM(s) prête(s) à être intégrée(s) dans votre ludothèque
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              disabled={isImportingUsb}
              onClick={() => handleImportUsb(detectedUsbDrives[0].path)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-neon active:scale-95 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isImportingUsb ? 'Importation...' : '📥 Importer tout'}</span>
            </button>
            <button
              onClick={() => setDetectedUsbDrives([])}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              title="Ignorer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {usbImportResult && (
        <div className="mx-4 sm:mx-6 mt-2 p-2 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs font-bold text-center animate-in fade-in z-30 shrink-0">
          {usbImportResult}
        </div>
      )}

      {/* ========================================================================= */}
      {/* NIVEAU 1 : LES FIRMES EN GRAND AU CENTRE                                   */}
      {/* ========================================================================= */}
      {step === 'companies' && (
        <div className={`flex-1 min-h-0 flex flex-col items-center justify-start ${isCompactFit ? 'p-2 sm:p-3' : 'p-3 sm:p-5 md:p-6'} z-20 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200`}>
          {/* Titre & Guide central */}
          <div className={`text-center ${isCompactFit ? 'mb-2' : 'mb-3 sm:mb-5'}`}>
            <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Étape 1 sur 3 • Choisissez votre univers</span>
            </div>
            <h1 className={`${isCompactFit ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl md:text-4xl'} font-black text-white tracking-wider uppercase drop-shadow-[0_0_15px_rgba(0,242,254,0.4)]`}>
              LES GRANDES FIRMES DU JEU VIDÉO
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 max-w-xl mx-auto mt-0.5 sm:mt-1">
              Cliquez ou appuyez sur A pour découvrir toutes les consoles et machines de la marque.
            </p>
          </div>

          {/* ── JEU DU JOUR : élu chaque matin parmi les favoris (ou tout le catalogue) ── */}
          {dailyGame && (() => {
            const dsys = systems.find((s) => s.id === dailyGame.systemId);
            return (
              <button
                type="button"
                onClick={() => onLaunchGame(dailyGame)}
                onMouseEnter={() => playMove()}
                className={`group relative max-w-6xl w-full mx-auto mb-4 rounded-2xl border-2 ${themeAccent.ring} bg-slate-900/85 p-3 sm:p-4 flex items-center gap-4 text-left overflow-hidden transition-all duration-300 hover:scale-[1.01]`}
                style={{ boxShadow: `0 0 30px ${themeAccent.glow}` }}
                title={`Lancer le jeu du jour : ${dailyGame.cleanTitle}`}
              >
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-slate-950/80 border border-slate-700/60 shrink-0 flex items-center justify-center">
                  {dailyGame.media?.boxart2d ? (
                    <img
                      src={resolveMediaUrl(dailyGame.media.boxart2d)}
                      alt={dailyGame.cleanTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <Gamepad2 className="w-8 h-8 text-slate-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-200">
                      Le défi du jour {themeAccent.label}
                    </span>
                  </div>
                  <div className="text-base sm:text-xl font-black text-white truncate">{dailyGame.cleanTitle}</div>
                  <div className="text-[10px] sm:text-xs text-slate-400 truncate font-bold uppercase tracking-wider">
                    {dsys?.name || dailyGame.systemId}
                  </div>
                </div>
                <span className="hidden sm:flex p-2.5 rounded-xl bg-amber-500 text-slate-950 group-hover:brightness-110 transition shrink-0">
                  <Play className="w-5 h-5 fill-current" />
                </span>
              </button>
            );
          })()}

          {/* ── CARROUSEL « MES VEDETTES » : jeux épinglés depuis le Centre Admin ── */}
          {featuredGames.length > 0 && isWidgetOn('featured') && (
            <div className="max-w-6xl w-full mx-auto mb-4">
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-200">Mes vedettes</span>
              </div>
              <div className="flex items-stretch justify-center gap-2.5 sm:gap-3 overflow-x-auto custom-scrollbar pb-1.5">
                {featuredGames.map((g) => {
                  const sys = systems.find((s) => s.id === g.systemId);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => onLaunchGame(g)}
                      onMouseEnter={() => playMove()}
                      className="group relative shrink-0 w-36 sm:w-44 rounded-2xl border-2 border-amber-500/50 bg-slate-900/85 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(251,191,36,0.35)] transition-all duration-300 overflow-hidden text-left"
                      title={`Lancer ${g.cleanTitle}${sys ? ` (${sys.name})` : ''}`}
                    >
                      <div className="h-20 sm:h-24 w-full overflow-hidden bg-slate-950/80 flex items-center justify-center">
                        {g.media?.boxart2d ? (
                          <img
                            src={resolveMediaUrl(g.media.boxart2d)}
                            alt={g.cleanTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <Gamepad2 className="w-9 h-9 text-amber-500/60" />
                        )}
                      </div>
                      <div className="p-2">
                        <div className="text-[11px] font-black text-white truncate">{g.cleanTitle}</div>
                        <div className="text-[9px] text-amber-300/90 font-bold uppercase tracking-wider truncate">
                          {sys?.name || g.systemId}
                        </div>
                      </div>
                      <span className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-amber-400 text-slate-900 shadow">
                        <Play className="w-3 h-3 fill-current" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── LES DEUX CADRES : PC & CONSOLES ── */}
          <div className="flex items-stretch justify-center gap-3 sm:gap-5 max-w-4xl w-full mx-auto mb-4">
            {/* Cadre PC — Informatique */}
            <button
              type="button"
              onClick={() => switchCategory('computing')}
              onMouseEnter={() => { if (category !== 'computing') playMove(); }}
              className={`relative flex-1 max-w-[340px] rounded-2xl border-2 p-4 text-left transition-all duration-300 overflow-hidden ${
                category === 'computing'
                  ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_30px_rgba(251,191,36,0.35)] scale-[1.03]'
                  : 'border-slate-700/70 bg-slate-900/60 hover:border-amber-500/50 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Monitor className={`w-9 h-9 shrink-0 ${category === 'computing' ? 'text-amber-300' : 'text-slate-500'}`} />
                <div className="min-w-0">
                  <div className="text-base sm:text-lg font-black text-white uppercase tracking-wider leading-tight">PC</div>
                  <div className="text-[10px] sm:text-[11px] text-amber-200/90 font-bold uppercase tracking-widest">Informatique · Micros</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {systems.filter((s) => KIOSK_COMPUTING_IDS.has(s.id)).length} machines · ZX Spectrum, CPC, MS-DOS...
                  </div>
                </div>
              </div>
              {category === 'computing' && (
                <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-900 text-[9px] font-black uppercase">Actif</span>
              )}
            </button>

            {/* Cadre Consoles */}
            <button
              type="button"
              onClick={() => switchCategory('consoles')}
              onMouseEnter={() => { if (category !== 'consoles') playMove(); }}
              className={`relative flex-1 max-w-[340px] rounded-2xl border-2 p-4 text-left transition-all duration-300 overflow-hidden ${
                category === 'consoles'
                  ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_30px_rgba(34,211,238,0.35)] scale-[1.03]'
                  : 'border-slate-700/70 bg-slate-900/60 hover:border-cyan-500/50 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Gamepad2 className={`w-9 h-9 shrink-0 ${category === 'consoles' ? 'text-cyan-300' : 'text-slate-500'}`} />
                <div className="min-w-0">
                  <div className="text-base sm:text-lg font-black text-white uppercase tracking-wider leading-tight">Consoles</div>
                  <div className="text-[10px] sm:text-[11px] text-cyan-200/90 font-bold uppercase tracking-widest">Salon & Portables</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {systems.filter((s) => !KIOSK_COMPUTING_IDS.has(s.id)).length} machines · NES, Mega Drive, PlayStation...
                  </div>
                </div>
              </div>
              {category === 'consoles' && (
                <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-cyan-400 text-slate-900 text-[9px] font-black uppercase">Actif</span>
              )}
            </button>
          </div>

          {/* Bouton réinitialiser le filtre quand un cadre est actif */}
          {category !== 'all' && (
            <button
              type="button"
              onClick={() => switchCategory('all')}
              className="mx-auto mb-3 flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-600/70 bg-slate-900/70 text-[10px] font-bold text-slate-300 hover:text-white hover:border-slate-400 transition"
            >
              <X className="w-3 h-3" />
              Afficher toutes les firmes (Tab pour changer de cadre)
            </button>
          )}

          {/* Grille des Firmes en Grand au Centre (filtrée par cadre) */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${isCompactFit ? 'gap-2.5 sm:gap-3' : 'gap-3 sm:gap-5'} max-w-6xl w-full justify-center`}>
            {visibleCompanies.map((company, idx) => {
              const isFocused = idx === companyIndex;
              // Compteur adapté au cadre actif : PC (micros) ou consoles de salon
              const consoleCount =
                category === 'computing'
                  ? systems.filter((s) => s.companyId === company.id && KIOSK_COMPUTING_IDS.has(s.id)).length
                  : category === 'consoles'
                    ? systems.filter((s) => s.companyId === company.id && !KIOSK_COMPUTING_IDS.has(s.id)).length
                    : systems.filter((s) => s.companyId === company.id).length;
              const romCount = gamesCountByCompany.get(company.id) || 0;
              const heroes = HEROES_BY_COMPANY[company.id] || [];

              return (
                <div
                  key={company.id}
                  draggable={!!onReorderCompanies}
                  onDragStart={(e) => {
                    setDragCompanyId(company.id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    if (!dragCompanyId) return;
                    e.preventDefault();
                    setDragOverCompanyId(company.id);
                  }}
                  onDragLeave={() => setDragOverCompanyId((prev) => (prev === company.id ? null : prev))}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDropCompany(company.id);
                  }}
                  onDragEnd={() => {
                    setDragCompanyId(null);
                    setDragOverCompanyId(null);
                  }}
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
                  className={`group relative rounded-2xl sm:rounded-3xl ${isCompactFit ? 'p-2.5 sm:p-3 min-h-[160px] sm:min-h-[180px]' : 'p-3.5 sm:p-5 min-h-[200px] sm:min-h-[250px]'} flex flex-col items-center justify-between text-center ${animations ? 'transition-[transform,opacity,border-color] duration-200 ease-out' : ''} cursor-pointer overflow-hidden [transform:translateZ(0)] will-change-transform ${
                    isFocused
                      ? `bg-slate-900/95 border-2 z-10 ${animations ? 'scale-102 sm:scale-105' : ''}`
                      : `bg-slate-900/60 hover:bg-slate-900/80 border ${animations ? 'hover:scale-102' : ''} opacity-90 hover:opacity-100`
                  }`}
                >
                  {/* Vidéo de fond : uniquement sur la carte focalisée, et seulement si l'effet est activé */}
                  <CompanyBackgroundVideo company={company} mode="card" active={isFocused && backgroundVideos} />

                  {/* Indicateur de dépôt (réorganisation par glisser-déposer, régie uniquement) */}
                  {dragOverCompanyId === company.id && dragCompanyId && dragCompanyId !== company.id && (
                    <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-dashed border-cyan-300 bg-cyan-400/10 pointer-events-none z-20" />
                  )}

                  {/* Poignée de déplacement (réorganisation par glisser-déposer, régie uniquement) */}
                  {onReorderCompanies && (
                    <span
                      role="button"
                      tabIndex={-1}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      title="Glisser pour déplacer cette firme"
                      className="absolute top-1.5 left-1.5 z-20 p-1 rounded-lg bg-slate-950/80 border border-slate-600 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical className="w-3.5 h-3.5" />
                    </span>
                  )}

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
                    {/* Vrai Logo Vectoriel Officiel de la Firme EN GRAND (variante PC/Consoles si définie) */}
                    <div className="w-full h-16 sm:h-20 flex items-center justify-center my-1 sm:my-2 transition-transform duration-300 group-hover:scale-110">
                      <CompanyLogo
                        companyId={company.id}
                        logoId={
                          category === 'all'
                            ? undefined
                            : COMPANY_DISPLAY_BY_CATEGORY[category][company.id]?.logoId
                        }
                        size="xl"
                      />
                    </div>

                    {/* Nom de la firme (variante PC/Consoles si définie) */}
                    <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider mb-1">
                      {companyDisplayName(company, category)}
                    </h3>

                    {/* Badges de statistiques */}
                    <div className="flex items-center space-x-2 my-1 sm:my-2">
                      <span className="px-2.5 py-0.5 sm:py-1 rounded-xl bg-slate-900/80 border border-slate-700 text-[10px] sm:text-[11px] font-bold text-slate-200 shadow">
                        {consoleCount} Machine{consoleCount > 1 ? 's' : ''}
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
                      <span>Machines {companyDisplayName(company, category)}</span>
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
                <span>Visiter le Grand Musée Virtuel de {companyDisplayName(companies[companyIndex], category)}</span>
                <span className="px-1.5 py-0.5 rounded bg-black/50 text-[10px] font-mono border border-white/20 text-amber-300">Y / M</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* NIVEAU 2 : LES CONSOLES DE LA FIRME (chargé à la demande) */}
      {step === 'consoles' && selectedCompany && (
        <Suspense fallback={null}>
          <KioskConsolesLevel
            selectedCompany={selectedCompany}
            companySystems={companySystems}
            companyPcSystems={companyPcSystems}
            companyConsoleSystems={companyConsoleSystems}
            consoleIndex={consoleIndex}
            gamesCountBySystem={gamesCountBySystem}
            category={category}
            isCompactFit={isCompactFit}
            animations={animations}
            neonGlows={neonGlows}
            games={games}
            onConsoleIndexChange={setConsoleIndex}
            onSelectConsole={handleSelectConsole}
            onBack={handleBackToCompanies}
            onOpenSystemMuseum={setExhibitionSystem}
            onOpenCompanyMuseum={setExhibitionCompany}
          />
        </Suspense>
      )}


      {/* NIVEAU 3 : LES ROMS / JEUX DE LA CONSOLE (chargé à la demande) */}
      {step === 'games' && selectedSystem && (
        <Suspense fallback={null}>
          <KioskGamesLevel
            selectedSystem={selectedSystem}
            selectedCompanyId={selectedCompany?.id}
            consoleGames={consoleGames}
            currentGame={currentGame}
            gameIndex={gameIndex}
            gameViewMode={gameViewMode}
            availableLetters={availableLetters}
            isCompactFit={isCompactFit}
            neonGlows={neonGlows}
            failedImageIds={failedImageIds}
            previewGame={previewGame}
            activeItemRef={activeItemRef}
            onStartPreview={startPreviewTimer}
            onCancelPreview={cancelPreviewTimer}
            onSelectGameIndex={setGameIndex}
            onViewDetails={onViewDetails}
            onLaunchGame={onLaunchGame}
            onToggleFavorite={onToggleFavorite}
            onBack={handleBackToConsoles}
            onOpenSystemMuseum={setExhibitionSystem}
            onRandomPick={handleRandomPickInKiosk}
            onOpenCartridgeShelf={onOpenCartridgeShelf}
            onOpenUserManualPdf={onOpenUserManualPdf}
            onOpenAchievements={onOpenAchievements}
            onImageError={handleImageError}
            playMove={playMove}
            playSelect={playSelect}
            playLaunch={playLaunch}
            playFavorite={playFavorite}
            onWheelCoverflow={handleWheelCoverflow}
          />
        </Suspense>
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
              <button
                onClick={handleCycleGameViewMode}
                className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40 hover:bg-purple-500/30 transition cursor-pointer"
                title="Changer de mode d'affichage (Touche V)"
              >
                <span className="font-mono">V</span>
                <span>Vue: {gameViewMode === 'showcase' ? 'Vitrine' : gameViewMode === 'grid' ? 'Grille' : gameViewMode === 'wheel' ? 'Coverflow' : 'Liste'}</span>
              </button>
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
      <React.Suspense fallback={null}>
        {exhibitionSystem && (
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
        )}

        {/* MODALE DU GRAND MUSÉE VIRTUEL DE LA FIRME DANS LE MODE KIOSK */}
        {exhibitionCompany && (
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
        )}
      </React.Suspense>
    </div>
  );
};
