import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { System, Company, Game, AppSettings, BiosStatus, EmulatorProfile, ScrapeCandidate } from './types';
import { SYSTEMS as DEFAULT_SYSTEMS } from '../electron/data/systems';
import { COMPANIES as DEFAULT_COMPANIES } from '../electron/data/companies';
import { BUILTIN_EMULATORS } from '../electron/data/emulators';
import { Navigation, NavTab } from './components/Navigation';
import { SystemSelector } from './components/SystemSelector';
import { GameGrid } from './components/GameGrid';
import { CompanyView } from './components/CompanyView';
import { BiosManager } from './components/BiosManager';
import { KioskArcadeView } from './components/KioskArcadeView';
import { ComputingView } from './components/extended/ComputingView';
import { KioskAttractMode } from './components/KioskAttractMode';
import { GamepadHint } from './components/GamepadHint';
import { RetroJukeboxFloatingPlayer } from './components/retro/RetroJukeboxFloatingPlayer';
import { useGamepad } from './hooks/useGamepad';
import { useAudio } from './hooks/useAudio';
import { syncNewRoms } from './services/romScanner';
import type { CrtShaderProfileId } from './components/retro/RetroShaderProfilesModal';
import {
  RetroAchievement,
  GameCheat,
  SaveStateItem,
  DailyChallenge,
  PlayerProfile,
  BezelConfig,
} from './types/retroFeatures';
import {
  INITIAL_ACHIEVEMENTS,
  INITIAL_PLAYER_PROFILE,
  INITIAL_CHEATS,
  INITIAL_SAVESTATES,
  INITIAL_MANUALS,
  INITIAL_BEZELS,
  INITIAL_DAILY_CHALLENGES,
} from './data/retroFeaturesData';
import { useRetroJukebox } from './hooks/useRetroJukebox';
import {
  GamePlayStats,
  PlaySession,
  UserProfile,
  ParentalControlConfig,
  HandheldOverlayConfig,
  NomadBackupPackage,
} from './types/extendedFeatures';
import {
  INITIAL_PLAY_STATS,
  INITIAL_PLAY_SESSIONS,
  INITIAL_PROFILES,
  INITIAL_PARENTAL_CONFIG,
  INITIAL_HANDHELD_CONFIG,
  HISTORICAL_MILESTONES,
} from './data/extendedFeaturesData';
import { useAutoPerformance } from './hooks/useAutoPerformance';
import {
  INITIAL_CENTRALIZED_ROMS,
  INITIAL_CENTRALIZED_BIOS,
  INITIAL_CENTRALIZED_THEMES,
  INITIAL_CENTRALIZED_CORES,
  INITIAL_CENTRALIZED_SAVES,
} from './data/centralizedStorageData';
import { CentralizedRomItem, CentralizedThemeItem } from './types/extendedFeatures';

// Modales chargées à la demande (Code-Splitting / Lazy-Loading)
const GameDetailModal = React.lazy(() => import('./components/GameDetailModal').then((m) => ({ default: m.GameDetailModal })));
const AdminHubModal = React.lazy(() => import('./components/AdminHubModal').then((m) => ({ default: m.AdminHubModal })));
const GameEditModal = React.lazy(() => import('./components/GameEditModal').then((m) => ({ default: m.GameEditModal })));
const SystemEditModal = React.lazy(() => import('./components/SystemEditModal').then((m) => ({ default: m.SystemEditModal })));
const CompanyEditModal = React.lazy(() => import('./components/CompanyEditModal').then((m) => ({ default: m.CompanyEditModal })));
const ScraperModal = React.lazy(() => import('./components/ScraperModal').then((m) => ({ default: m.ScraperModal })));
const ScrapeCandidateModal = React.lazy(() => import('./components/ScrapeCandidateModal').then((m) => ({ default: m.ScrapeCandidateModal })));

const ExtensionsDownloaderModal = React.lazy(() => import('./components/ExtensionsDownloaderModal').then((m) => ({ default: m.ExtensionsDownloaderModal })));
const KioskPinModal = React.lazy(() => import('./components/KioskPinModal').then((m) => ({ default: m.KioskPinModal })));
const ConsoleExhibitionModal = React.lazy(() => import('./components/ConsoleExhibitionModal').then((m) => ({ default: m.ConsoleExhibitionModal })));
const CompanyExhibitionModal = React.lazy(() => import('./components/CompanyExhibitionModal').then((m) => ({ default: m.CompanyExhibitionModal })));
const GlobalSearchModal = React.lazy(() => import('./components/GlobalSearchModal').then((m) => ({ default: m.GlobalSearchModal })));
const RomScannerModal = React.lazy(() => import('./components/RomScannerModal').then((m) => ({ default: m.RomScannerModal })));
const QuickStartOnboardingModal = React.lazy(() => import('./components/QuickStartOnboardingModal').then((m) => ({ default: m.QuickStartOnboardingModal })));
const WebEmulatorModal = React.lazy(() => import('./components/WebEmulatorModal').then((m) => ({ default: m.WebEmulatorModal })));
const RetroAchievementsModal = React.lazy(() => import('./components/retro/RetroAchievementsModal').then((m) => ({ default: m.RetroAchievementsModal })));
const RetroCheatsModal = React.lazy(() => import('./components/retro/RetroCheatsModal').then((m) => ({ default: m.RetroCheatsModal })));
const RetroSaveStatesModal = React.lazy(() => import('./components/retro/RetroSaveStatesModal').then((m) => ({ default: m.RetroSaveStatesModal })));
const RetroJukeboxModal = React.lazy(() => import('./components/retro/RetroJukeboxModal').then((m) => ({ default: m.RetroJukeboxModal })));
const ArcadeTournamentModal = React.lazy(() => import('./components/retro/ArcadeTournamentModal').then((m) => ({ default: m.ArcadeTournamentModal })));
const RetroManualsViewerModal = React.lazy(() => import('./components/retro/RetroManualsViewerModal').then((m) => ({ default: m.RetroManualsViewerModal })));
const BezelStudioModal = React.lazy(() => import('./components/retro/BezelStudioModal').then((m) => ({ default: m.BezelStudioModal })));
const RetroRouletteDailyChallengeModal = React.lazy(() => import('./components/retro/RetroRouletteDailyChallengeModal').then((m) => ({ default: m.RetroRouletteDailyChallengeModal })));
const RetroAnalyticsModal = React.lazy(() => import('./components/extended/RetroAnalyticsModal').then((m) => ({ default: m.RetroAnalyticsModal })));
const GamepadTesterModal = React.lazy(() => import('./components/extended/GamepadTesterModal').then((m) => ({ default: m.GamepadTesterModal })));
const MultiProfileModal = React.lazy(() => import('./components/extended/MultiProfileModal').then((m) => ({ default: m.MultiProfileModal })));
const HistoryTimelineModal = React.lazy(() => import('./components/extended/HistoryTimelineModal').then((m) => ({ default: m.HistoryTimelineModal })));
const PrintStudioModal = React.lazy(() => import('./components/extended/PrintStudioModal').then((m) => ({ default: m.PrintStudioModal })));
const NomadBackupModal = React.lazy(() => import('./components/extended/NomadBackupModal').then((m) => ({ default: m.NomadBackupModal })));
const HandheldOverlaysModal = React.lazy(() => import('./components/extended/HandheldOverlaysModal').then((m) => ({ default: m.HandheldOverlaysModal })));
const ArcadePartyModal = React.lazy(() => import('./components/extended/ArcadePartyModal').then((m) => ({ default: m.ArcadePartyModal })));
const MusicManagerModal = React.lazy(() => import('./components/extended/MusicManagerModal').then((m) => ({ default: m.MusicManagerModal })));
const CentralizedStorageModal = React.lazy(() => import('./components/extended/CentralizedStorageModal').then((m) => ({ default: m.CentralizedStorageModal })));
const CommunityThemeStudioModal = React.lazy(() => import('./components/extended/CommunityThemeStudioModal').then((m) => ({ default: m.CommunityThemeStudioModal })));
const RetroAttractModeModal = React.lazy(() => import('./components/retro/RetroAttractModeModal').then((m) => ({ default: m.RetroAttractModeModal })));
const RetroPasswordNotebookModal = React.lazy(() => import('./components/retro/RetroPasswordNotebookModal').then((m) => ({ default: m.RetroPasswordNotebookModal })));
const LanNetworkManagerModal = React.lazy(() => import('./components/extended/LanNetworkManagerModal').then((m) => ({ default: m.LanNetworkManagerModal })));
const ProjectorKioskManagerModal = React.lazy(() => import('./components/retro/ProjectorKioskManagerModal').then((m) => ({ default: m.ProjectorKioskManagerModal })));
const RetroManualPdfGuideModal = React.lazy(() => import('./components/manual/RetroManualPdfGuideModal').then((m) => ({ default: m.RetroManualPdfGuideModal })));
const RetroShaderProfilesModal = React.lazy(() => import('./components/retro/RetroShaderProfilesModal').then((m) => ({ default: m.RetroShaderProfilesModal })));
const ArcadeSpeedrunModal = React.lazy(() => import('./components/retro/ArcadeSpeedrunModal').then((m) => ({ default: m.ArcadeSpeedrunModal })));
const VirtualCartridgeShelfModal = React.lazy(() => import('./components/retro/VirtualCartridgeShelfModal').then((m) => ({ default: m.VirtualCartridgeShelfModal })));
const SaveStateSyncModal = React.lazy(() => import('./components/extended/SaveStateSyncModal').then((m) => ({ default: m.SaveStateSyncModal })));
const ArcadeHotkeysGuideModal = React.lazy(() => import('./components/ArcadeHotkeysGuideModal').then((m) => ({ default: m.ArcadeHotkeysGuideModal })));
import {
  getStoredGames,
  saveStoredGames,
  filterOutDeletedGames,
  markGameDeleted,
} from './services/romStorage';

const convertCentralizedRomsToGames = (romList: CentralizedRomItem[]): Game[] => {
  return romList.map((r) => {
    const ext = r.filename.includes('.') ? `.${r.filename.split('.').pop()}` : '.bin';
    return {
      id: r.id,
      title: r.title,
      cleanTitle: r.title,
      systemId: r.systemId,
      path: r.path,
      filename: r.filename,
      extension: ext,
      size: r.size,
      favorite: false,
      playCount: 0,
      lastPlayed: undefined,
      playTimeMinutes: 0,
      metadata: {
        publisher: 'Éditeur Culte',
        developer: 'Studio Rétro',
        releaseDate: `${r.releaseYear}-01-01`,
        genres: [r.genre],
        players: '1-2 Joueurs',
        rating: 95,
        synopsis: r.description || 'ROM centralisée dans /public prête pour émulation haute fidélité.',
      },
      media: {
        boxart2d: `/roms/${r.systemId}/boxart.jpg`,
      },
    };
  });
};

export const App: React.FC = () => {
  // Navigation & Vues (Par défaut sur 'games' pour afficher immédiatement les jeux)
  const [currentTab, setCurrentTab] = useState<NavTab>('games');
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  // Profil Kiosk vs Admin (Kiosk en 1er par défaut)
  const [isKioskMode, setIsKioskMode] = useState(true);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(true);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Données
  const [systems, setSystems] = useState<System[]>(DEFAULT_SYSTEMS);
  const [companies, setCompanies] = useState<Company[]>(DEFAULT_COMPANIES);
  const [emulators, setEmulators] = useState<EmulatorProfile[]>(BUILTIN_EMULATORS);
  const [games, setGames] = useState<Game[]>(() => {
    const stored = getStoredGames();
    if (stored !== null) {
      return stored;
    }
    const initial = filterOutDeletedGames(convertCentralizedRomsToGames(INITIAL_CENTRALIZED_ROMS));
    saveStoredGames(initial);
    return initial;
  });
  const [settings, setSettings] = useState<AppSettings>({
    romsDir: 'public/roms',
    biosDir: 'public/bios',
    musicDir: 'public/music',
    themesDir: 'public/themes',
    emulatorsDir: 'public/emulators',
    savesDir: 'public/saves',
    publicCentralized: true,
    retroarchPath: '/usr/bin/retroarch',
    retroarchCoresDir: 'public/emulators/cores',
    scraperSource: 'both',
    language: 'fr',
    soundEnabled: true,
    soundVolume: 0.8,
    crtEffect: false,
    uiTheme: 'neon-dark',
    kioskMode: false,
    kioskPin: '1234',
    kioskFullscreen: true,
    kioskOnlyFavorites: false,
    kioskWidgets: {},
    kioskHiddenCompanies: [],
    kioskHiddenSystems: [],
    kioskCompanyOrder: [],
    kioskFeaturedGames: [],
  });
  const [biosStatuses, setBiosStatuses] = useState<BiosStatus[]>([]);

  // États actifs / Modales
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [exhibitionSystem, setExhibitionSystem] = useState<System | null>(null);
  const [exhibitionCompany, setExhibitionCompany] = useState<Company | null>(null);
  const [directEditingGame, setDirectEditingGame] = useState<Game | null>(null);
  const [directEditingSystem, setDirectEditingSystem] = useState<System | null>(null);
  const [directEditingCompany, setDirectEditingCompany] = useState<Company | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // Lecteur d'émulation web (navigateur sans Electron) : ROM jouée via EmulatorJS
  const [webEmulatorGame, setWebEmulatorGame] = useState<Game | null>(null);

  // Mode performance automatique : coupe les effets si la machine sature.
  // Les choix manuels de l'utilisateur (réglages) restent prioritaires : on
  // n'applique la bascule auto que si l'option correspondante est sur "activé".
  const { lowPerformance } = useAutoPerformance(30, 4000);
  const effBackgroundVideos = settings.kioskBackgroundVideos !== false && !lowPerformance;
  const effNeonGlows = settings.kioskNeonGlows !== false && !lowPerformance;
  const effAnimations = settings.kioskAnimations !== false && !lowPerformance;
  const [isExtensionsModalOpen, setIsExtensionsModalOpen] = useState(false);
  const [isScrapingBatch, setIsScrapingBatch] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isCheckingBios, setIsCheckingBios] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Recherche globale Spotlight
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Mode Attract (économiseur d'écran) Kiosk
  const [isAttractMode, setIsAttractMode] = useState(false);
  const attractTimerRef = React.useRef<any>(null);

  // Index de focus pour la manette
  const [focusedGameIndex, setFocusedGameIndex] = useState(0);

  // Suivi du scraper
  const [scrapeState, setScrapeState] = useState<{
    isOpen: boolean;
    total: number;
    current: number;
    currentGameTitle: string;
    isComplete: boolean;
    found: number;
    notFound: number;
    skipped: number;
    currentBoxartUrl?: string;
  }>({
    isOpen: false,
    total: 0,
    current: 0,
    currentGameTitle: '',
    isComplete: false,
    found: 0,
    notFound: 0,
    skipped: 0,
    currentBoxartUrl: undefined,
  });

  // Correspondances et choix de titres similaires pour le scraping
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [candidateGame, setCandidateGame] = useState<Game | null>(null);
  const [scrapeCandidates, setScrapeCandidates] = useState<ScrapeCandidate[]>([]);
  const [isSearchingCandidates, setIsSearchingCandidates] = useState(false);
  const [isApplyingCandidate, setIsApplyingCandidate] = useState(false);
  const [isSingleScraping, setIsSingleScraping] = useState(false);



  // Audio Rétro avec Volume, Sons Spéciaux et BGM Chiptune
  const { playMove, playSelect, playBack, playLaunch, playCoin, playFavorite, playUnlock, playDice } = useAudio(
    settings.soundEnabled,
    settings.soundVolume ?? 0.8,
    settings.bgmEnabled ?? false,
    settings.bgmVolume ?? 0.35
  );

  // Jukebox Chiptune Web Audio Engine
  const jukebox = useRetroJukebox();

  // 8 Features Rétro Data States (avec persistance localStorage)
  const [achievements, setAchievements] = useState<RetroAchievement[]>(() => {
    try {
      const stored = localStorage.getItem('retromad_achievements');
      return stored ? JSON.parse(stored) : INITIAL_ACHIEVEMENTS;
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  });

  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(() => {
    try {
      const stored = localStorage.getItem('retromad_player_profile');
      return stored ? JSON.parse(stored) : INITIAL_PLAYER_PROFILE;
    } catch {
      return INITIAL_PLAYER_PROFILE;
    }
  });

  const [cheats, setCheats] = useState<GameCheat[]>(() => {
    try {
      const stored = localStorage.getItem('retromad_cheats');
      return stored ? JSON.parse(stored) : INITIAL_CHEATS;
    } catch {
      return INITIAL_CHEATS;
    }
  });

  const [saveStates, setSaveStates] = useState<SaveStateItem[]>(() => {
    try {
      const stored = localStorage.getItem('retromad_save_states');
      return stored ? JSON.parse(stored) : INITIAL_SAVESTATES;
    } catch {
      return INITIAL_SAVESTATES;
    }
  });

  const [currentBezel, setCurrentBezel] = useState<BezelConfig>(() => {
    try {
      const stored = localStorage.getItem('retromad_current_bezel');
      return stored ? JSON.parse(stored) : INITIAL_BEZELS[0];
    } catch {
      return INITIAL_BEZELS[0];
    }
  });

  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>(() => {
    try {
      const stored = localStorage.getItem('retromad_daily_challenges');
      return stored ? JSON.parse(stored) : INITIAL_DAILY_CHALLENGES;
    } catch {
      return INITIAL_DAILY_CHALLENGES;
    }
  });

  // Modales pour les 8 fonctionnalités
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [isCheatsModalOpen, setIsCheatsModalOpen] = useState(false);
  const [isSaveStatesModalOpen, setIsSaveStatesModalOpen] = useState(false);
  const [isJukeboxModalOpen, setIsJukeboxModalOpen] = useState(false);
  const [isFloatingJukeboxVisible, setIsFloatingJukeboxVisible] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('retromad_jukebox_floating_visible');
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  const handleToggleFloatingJukebox = () => {
    setIsFloatingJukeboxVisible((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('retromad_jukebox_floating_visible', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleCloseFloatingJukebox = () => {
    setIsFloatingJukeboxVisible(false);
    try {
      localStorage.setItem('retromad_jukebox_floating_visible', 'false');
    } catch {}
    jukebox.stop();
    showNotification('Jukebox coupé et masqué de l\'écran. Réactivez-le via l\'icône 🎵 dans la barre de menu.', 'info');
  };
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const [isManualsModalOpen, setIsManualsModalOpen] = useState(false);
  const [isBezelStudioModalOpen, setIsBezelStudioModalOpen] = useState(false);
  const [isRouletteModalOpen, setIsRouletteModalOpen] = useState(false);
  const [activeManualGameId, setActiveManualGameId] = useState<string | undefined>(undefined);

  // Modales pour les 8 NOUVELLES fonctionnalités d'amélioration & Musique
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isGamepadTesterOpen, setIsGamepadTesterOpen] = useState(false);
  const [isProfilesOpen, setIsProfilesOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isPrintStudioOpen, setIsPrintStudioOpen] = useState(false);
  const [isNomadBackupOpen, setIsNomadBackupOpen] = useState(false);
  const [isHandheldOverlaysOpen, setIsHandheldOverlaysOpen] = useState(false);
  const [isArcadePartyOpen, setIsArcadePartyOpen] = useState(false);
  const [isMusicManagerOpen, setIsMusicManagerOpen] = useState(false);
  const [isCentralizedStorageOpen, setIsCentralizedStorageOpen] = useState(false);
  const [isCommunityThemeStudioOpen, setIsCommunityThemeStudioOpen] = useState(false);
  const [isAttractModeOpen, setIsAttractModeOpen] = useState(false);
  const [isPasswordNotebookOpen, setIsPasswordNotebookOpen] = useState(false);
  const [isLanManagerOpen, setIsLanManagerOpen] = useState(false);
  const [isProjectorModalOpen, setIsProjectorModalOpen] = useState(false);
  const [isProjectorKioskRunning, setIsProjectorKioskRunning] = useState(false);
  const [isUserManualPdfOpen, setIsUserManualPdfOpen] = useState(false);
  const [isRomScannerOpen, setIsRomScannerOpen] = useState(false);
  const [isShaderProfilesModalOpen, setIsShaderProfilesModalOpen] = useState(false);
  const [isSpeedrunModalOpen, setIsSpeedrunModalOpen] = useState(false);
  const [isCartridgeShelfModalOpen, setIsCartridgeShelfModalOpen] = useState(false);
  const [isSaveStateSyncModalOpen, setIsSaveStateSyncModalOpen] = useState(false);
  const [isHotkeysGuideOpen, setIsHotkeysGuideOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    try {
      const completed = localStorage.getItem('retromad_onboarding_completed');
      return !completed;
    } catch {
      return false;
    }
  });

  // Données centralisées sous /public
  const [centralizedRoms] = useState(INITIAL_CENTRALIZED_ROMS);
  const [centralizedBios] = useState(INITIAL_CENTRALIZED_BIOS);
  const [centralizedThemes, setCentralizedThemes] = useState<CentralizedThemeItem[]>(() => {
    try {
      const stored = localStorage.getItem('retromad_community_themes');
      return stored ? JSON.parse(stored) : INITIAL_CENTRALIZED_THEMES;
    } catch {
      return INITIAL_CENTRALIZED_THEMES;
    }
  });
  const [centralizedCores] = useState(INITIAL_CENTRALIZED_CORES);
  const [centralizedSaves] = useState(INITIAL_CENTRALIZED_SAVES);

  const handleApplyCommunityTheme = (theme: CentralizedThemeItem) => {
    setCentralizedThemes((prev) => {
      const exists = prev.some((t) => t.id === theme.id);
      const next = exists ? prev.map((t) => (t.id === theme.id ? theme : t)) : [theme, ...prev];
      try {
        localStorage.setItem('retromad_community_themes', JSON.stringify(next));
      } catch {}
      return next;
    });
    setSettings((s) => ({ ...s, uiTheme: theme.id as any }));
    showNotification(`Thème "${theme.name}" appliqué avec succès !`, 'success');
  };

  // Application réelle du thème actif : variables CSS globales (accent, fond,
  // surface). Consommées par les styles (voir index.css : body/var(--theme-*)).
  useEffect(() => {
    const active = centralizedThemes.find((t) => t.id === (settings.uiTheme || 'neon-dark'));
    const root = document.documentElement;
    if (!active || active.id === 'neon-dark') {
      // Thème par défaut : réinitialiser
      root.style.removeProperty('--theme-accent');
      root.style.removeProperty('--theme-secondary');
      root.style.removeProperty('--theme-background');
      root.style.removeProperty('--theme-surface');
      root.style.removeProperty('--theme-text');
      return;
    }
    root.style.setProperty('--theme-accent', active.accentColor);
    root.style.setProperty('--theme-secondary', active.secondaryColor);
    if (active.bgColors) {
      root.style.setProperty('--theme-background', active.bgColors.background);
      root.style.setProperty('--theme-surface', active.bgColors.surface);
      root.style.setProperty('--theme-text', active.bgColors.text);
    }
  }, [centralizedThemes, settings.uiTheme]);

  // Synchroniser games dans localStorage
  useEffect(() => {
    saveStoredGames(games);
  }, [games]);

  // Données persistantes pour les nouveaux modules
  const [playStats, setPlayStats] = useState<GamePlayStats[]>(() => {
    try {
      const stored = localStorage.getItem('retromad_play_stats');
      return stored ? JSON.parse(stored) : INITIAL_PLAY_STATS;
    } catch {
      return INITIAL_PLAY_STATS;
    }
  });

  const [playSessions, setPlaySessions] = useState<PlaySession[]>(() => {
    try {
      const stored = localStorage.getItem('retromad_play_sessions');
      return stored ? JSON.parse(stored) : INITIAL_PLAY_SESSIONS;
    } catch {
      return INITIAL_PLAY_SESSIONS;
    }
  });

  const [userProfiles, setUserProfiles] = useState<UserProfile[]>(() => {
    try {
      const stored = localStorage.getItem('retromad_profiles');
      return stored ? JSON.parse(stored) : INITIAL_PROFILES;
    } catch {
      return INITIAL_PROFILES;
    }
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    try {
      return localStorage.getItem('retromad_active_profile_id') || 'profile-1';
    } catch {
      return 'profile-1';
    }
  });

  const [parentalConfig, setParentalConfig] = useState<ParentalControlConfig>(() => {
    try {
      const stored = localStorage.getItem('retromad_parental_config');
      return stored ? JSON.parse(stored) : INITIAL_PARENTAL_CONFIG;
    } catch {
      return INITIAL_PARENTAL_CONFIG;
    }
  });

  const [handheldConfig, setHandheldConfig] = useState<HandheldOverlayConfig>(() => {
    try {
      const stored = localStorage.getItem('retromad_handheld_config');
      return stored ? JSON.parse(stored) : INITIAL_HANDHELD_CONFIG;
    } catch {
      return INITIAL_HANDHELD_CONFIG;
    }
  });

  // Sauvegarde automatique des nouveaux modules dans localStorage
  useEffect(() => {
    try {
      localStorage.setItem('retromad_play_stats', JSON.stringify(playStats));
    } catch {}
  }, [playStats]);

  useEffect(() => {
    try {
      localStorage.setItem('retromad_play_sessions', JSON.stringify(playSessions));
    } catch {}
  }, [playSessions]);

  useEffect(() => {
    try {
      localStorage.setItem('retromad_profiles', JSON.stringify(userProfiles));
    } catch {}
  }, [userProfiles]);

  useEffect(() => {
    try {
      localStorage.setItem('retromad_active_profile_id', activeProfileId);
    } catch {}
  }, [activeProfileId]);

  useEffect(() => {
    try {
      localStorage.setItem('retromad_parental_config', JSON.stringify(parentalConfig));
    } catch {}
  }, [parentalConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('retromad_handheld_config', JSON.stringify(handheldConfig));
    } catch {}
  }, [handheldConfig]);

  // Synchronisation avec localStorage
  useEffect(() => {
    try {
      localStorage.setItem('retromad_achievements', JSON.stringify(achievements));
    } catch {}
  }, [achievements]);

  useEffect(() => {
    try {
      localStorage.setItem('retromad_player_profile', JSON.stringify(playerProfile));
    } catch {}
  }, [playerProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('retromad_cheats', JSON.stringify(cheats));
    } catch {}
  }, [cheats]);

  useEffect(() => {
    try {
      localStorage.setItem('retromad_save_states', JSON.stringify(saveStates));
    } catch {}
  }, [saveStates]);

  useEffect(() => {
    try {
      localStorage.setItem('retromad_current_bezel', JSON.stringify(currentBezel));
    } catch {}
  }, [currentBezel]);

  useEffect(() => {
    try {
      localStorage.setItem('retromad_daily_challenges', JSON.stringify(dailyChallenges));
    } catch {}
  }, [dailyChallenges]);

  // Notifications éphémères
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

  // Chargement initial des données depuis Electron
  useEffect(() => {
    const initData = async () => {
      if (window.api) {
        try {
          const [loadedSystems, loadedCompanies, loadedGames, loadedSettings] = await Promise.all([
            window.api.getSystems(),
            window.api.getCompanies(),
            window.api.getGames(),
            window.api.getSettings(),
          ]);

          if (loadedSystems?.length) setSystems(loadedSystems);
          if (loadedCompanies?.length) setCompanies(loadedCompanies);
          if (loadedGames) {
            const filtered = filterOutDeletedGames(loadedGames);
            setGames(filtered);
            saveStoredGames(filtered);

            // Synchronisation incrémentale : intègre automatiquement les ROMs
            // ajoutées sur le disque depuis le dernier scan (mode web/dev).
            try {
              const { newGames } = await syncNewRoms(filtered);
              if (newGames.length > 0) {
                const merged = [...newGames, ...filtered];
                setGames(merged);
                saveStoredGames(merged);
                showNotification(`${newGames.length} nouvelle(s) ROM(s) détectée(s) et ajoutée(s) à la ludothèque.`, 'success');
              }
            } catch (syncErr) {
              console.warn('Sync ROMs incrémentale ignorée:', syncErr);
            }
          }
          if (loadedSettings) {
            setSettings(loadedSettings);
            if (loadedSettings.kioskMode) {
              setIsKioskMode(true);
            }
          }

          // Vérification des BIOS et Détection des Émulateurs
          const [bios, detectedEmus] = await Promise.all([
            window.api.checkBios(),
            window.api.detectEmulators ? window.api.detectEmulators() : Promise.resolve([]),
          ]);
          if (bios) setBiosStatuses(bios);
          if (detectedEmus?.length) setEmulators(detectedEmus);

          // Synchronisation incrémentale supprimée d'ici (déplacée dans le bloc loadedGames)
        } catch (err) {
          console.error('Erreur chargement init:', err);
        }
      }
    };

    initData();
  }, []);

  // Auto-import desktop : le main process peut scanner les ROMs au démarrage
  // (bibliothèque vide) et notifier le renderer pour rafraîchir la liste.
  useEffect(() => {
    if (!window.api?.refreshGamesAfterAutoScan) return;
    const unsub = window.api.refreshGamesAfterAutoScan(async (count: number) => {
      try {
        const fresh = await window.api!.getGames();
        if (fresh?.length) {
          setGames(fresh);
          saveStoredGames(fresh);
          showNotification(`${count} jeu(x) importé(s) automatiquement depuis votre dossier ROMs.`, 'success');
        }
      } catch (e) {
        console.warn('Rafraîchissement post auto-scan échoué:', e);
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Écouteur de progression du scraping
  useEffect(() => {
    if (!window.api?.onScrapeProgress) return;
    const unsub = window.api.onScrapeProgress((data) => {
      setScrapeState((prev) => ({
        ...prev,
        total: data.total,
        current: data.current,
        currentGameTitle: data.currentGameTitle,
        isComplete: data.current >= data.total,
      }));
    });
    return unsub;
  }, []);

  // Activer / Désactiver le filtre CRT
  const handleToggleCrt = useCallback(async () => {
    playSelect();
    const newCrt = !settings.crtEffect;
    setSettings((prev) => ({ ...prev, crtEffect: newCrt }));
    if (window.api) {
      await window.api.saveSettings({ crtEffect: newCrt });
    }
    showNotification(newCrt ? 'Filtre CRT Scanlines & Phosphore activé 📺' : 'Filtre CRT désactivé 🖥️', 'info');
  }, [playSelect, settings.crtEffect, showNotification]);

  // Raccourci clavier de déverrouillage (Ctrl+Shift+A ou F12) + F1 pour le Guide PDF + Ctrl+K recherche
  useEffect(() => {
    const handleKeyShortcut = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        playSelect();
        setIsUserManualPdfOpen(true);
      } else if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || e.key === 'F12') {
        e.preventDefault();
        playSelect();
        setIsSettingsOpen(true);
      } else if ((e.ctrlKey && (e.key === 'k' || e.key === 'K')) || (e.ctrlKey && (e.key === 'f' || e.key === 'F'))) {
        e.preventDefault();
        playSelect();
        setIsSearchOpen(true);
        resetAttractTimer();
      } else if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleToggleCrt();
      }
      // Toute touche réinitialise le mode Attract
      resetAttractTimer();
    };
    window.addEventListener('keydown', handleKeyShortcut);
    return () => window.removeEventListener('keydown', handleKeyShortcut);
  }, [isKioskMode, playSelect, handleToggleCrt]);

  // Logique du timer Attract Mode (uniquement en mode Kiosk)
  const resetAttractTimer = useCallback(() => {
    if (isAttractMode) setIsAttractMode(false);
    if (attractTimerRef.current) clearTimeout(attractTimerRef.current);
    if (isKioskMode && (settings.attractMode ?? true)) {
      const delay = (settings.attractDelaySeconds ?? 60) * 1000;
      attractTimerRef.current = setTimeout(() => setIsAttractMode(true), delay);
    }
  }, [isKioskMode, isAttractMode, settings.attractMode, settings.attractDelaySeconds]);

  // Démarrer le timer d'inactivité Attract Mode quand mode Kiosk change
  useEffect(() => {
    resetAttractTimer();
    return () => {
      if (attractTimerRef.current) clearTimeout(attractTimerRef.current);
    };
  }, [isKioskMode, settings.attractMode, settings.attractDelaySeconds]);

  // Réinitialiser Attract Mode au clic/mouvement utilisateur
  useEffect(() => {
    const handleUserActivity = () => resetAttractTimer();
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
    };
  }, [resetAttractTimer]);

  // Basculer vers le mode Kiosk
  const handleEnterKiosk = async () => {
    playCoin();
    setIsKioskMode(true);
    if (currentTab !== 'games' && currentTab !== 'companies') {
      setCurrentTab('games');
    }
    if (window.api && settings.kioskFullscreen) {
      await window.api.setKioskMode(true);
    }
    showNotification('Mode Kiosk activé 🔒. Paramètres et modifications verrouillés.', 'info');
  };

  // Réordonnancement des firmes du Kiosque par glisser-déposer (régie déverrouillée)
  const handleReorderKioskCompanies = useCallback(
    async (orderedIds: string[]) => {
      setSettings((prev) => ({ ...prev, kioskCompanyOrder: orderedIds }));
      if (window.api) {
        await window.api.saveSettings({ kioskCompanyOrder: orderedIds });
      }
    },
    []
  );

  // Déverrouillage réussi du code PIN (sortie Kiosque OU écran de verrouillage régie)
  const handleUnlockKioskSuccess = async () => {
    playUnlock();
    setIsKioskMode(false);
    setIsAdminUnlocked(true);
    setIsPinModalOpen(false);
    if (window.api && settings.kioskFullscreen) {
      await window.api.setKioskMode(false);
    }
    showNotification('Mode Administration déverrouillé 🛡️.', 'success');
  };

  // Liste des jeux actuellement filtrés (avec filtre favoris si kiosk restrictif)
  const visibleGames = useMemo(() => {
    let list = games;
    if (isKioskMode && settings.kioskOnlyFavorites) {
      list = list.filter((g) => g.favorite);
    }
    if (!selectedSystemId) return list;
    return list.filter((g) => g.systemId === selectedSystemId);
  }, [games, selectedSystemId, isKioskMode, settings.kioskOnlyFavorites]);

  // Extraction dynamique des genres disponibles et de leur décompte
  const availableGenres = useMemo(() => {
    const genreCountMap = new Map<string, number>();

    games.forEach((game) => {
      if (selectedSystemId && game.systemId !== selectedSystemId) return;

      const rawGenres = game.metadata?.genres;
      if (rawGenres && Array.isArray(rawGenres) && rawGenres.length > 0) {
        rawGenres.forEach((g) => {
          if (!g) return;
          const parts = g.split(/[/,]/).map((p) => p.trim()).filter(Boolean);
          parts.forEach((part) => {
            const normalized = part.charAt(0).toUpperCase() + part.slice(1);
            genreCountMap.set(normalized, (genreCountMap.get(normalized) || 0) + 1);
          });
        });
      }
    });

    return Array.from(genreCountMap.entries())
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => a.genre.localeCompare(b.genre, 'fr'));
  }, [games, selectedSystemId]);

  // Si le genre sélectionné n'est pas présent dans la console courante, réinitialiser
  useEffect(() => {
    if (selectedGenre !== 'all') {
      const exists = availableGenres.some(
        (g) => g.genre.toLowerCase() === selectedGenre.toLowerCase()
      );
      if (!exists) {
        setSelectedGenre('all');
      }
    }
  }, [selectedSystemId, availableGenres, selectedGenre]);

  // Actions utilisateur
  const handleScanRoms = async (): Promise<void> => {
    if (isKioskMode) return;
    playSelect();
    setIsScanning(false);
    setIsRomScannerOpen(true);
  };

  const handleAddGames = (newGames: Game[]) => {
    const existingIds = new Set(games.map((g) => g.id));
    const existingNames = new Set(games.map((g) => g.filename.toLowerCase()));
    const trulyNew = filterOutDeletedGames(newGames).filter(
      (g) => !existingIds.has(g.id) && !existingNames.has(g.filename.toLowerCase())
    );

    if (trulyNew.length === 0) {
      showNotification('Aucune nouvelle ROM à ajouter (fichiers déjà présents ou supprimés).', 'info');
      return;
    }

    const merged = [...trulyNew, ...games];
    setGames(merged);
    saveStoredGames(merged);
    playUnlock();
    showNotification(`${trulyNew.length} jeu(x) ajouté(s) avec succès à la bibliothèque !`, 'success');

    if (trulyNew[0]?.systemId) {
      setSelectedSystemId(trulyNew[0].systemId);
      setCurrentTab('games');
    }
  };

  const handleDeleteGame = (game: Game) => {
    markGameDeleted(game.id, game.filename);
    const updated = games.filter((g) => g.id !== game.id);
    setGames(updated);
    saveStoredGames(updated);
    playBack();
    showNotification(`Jeu "${game.cleanTitle}" supprimé définitivement de la ludothèque.`, 'info');
  };

  const handleStartScrapeBatch = async () => {
    if (isKioskMode) return;
    playSelect();

    if (games.length === 0) {
      showNotification('Veuillez scanner des ROMs avant de lancer le scraping.', 'error');
      return;
    }

    setScrapeState({
      isOpen: true,
      total: games.length,
      current: 0,
      currentGameTitle: 'Initialisation du scraper…',
      isComplete: false,
      found: 0,
      notFound: 0,
      skipped: 0,
      currentBoxartUrl: undefined,
    });
    setIsScrapingBatch(true);

    try {
      if (window.api?.scrapeAll) {
        // ── Mode Electron ou Web avec API ──
        // Écouter les événements de progression enrichis
        const unsubProgress = window.api.onScrapeProgress?.((data: any) => {
          setScrapeState((prev) => ({
            ...prev,
            current: data.current ?? prev.current,
            currentGameTitle: data.currentGameTitle ?? prev.currentGameTitle,
            found: data.found ?? prev.found,
            notFound: data.notFound ?? prev.notFound,
            skipped: data.skipped ?? prev.skipped,
            currentBoxartUrl: data.currentBoxartUrl ?? prev.currentBoxartUrl,
          }));
        });

        const updated = await window.api.scrapeAll();
        if (typeof unsubProgress === 'function') unsubProgress();

        setGames(updated);
        setScrapeState((prev) => ({ ...prev, isComplete: true, current: prev.total }));
        showNotification(`Scraping terminé ! ${updated.filter(g => g.media?.boxart2d).length} jaquettes récupérées.`, 'success');
      } else {
        // ── Mode web pur sans API (fallback démo) ──
        const { scrapeAllGamesWeb } = await import('./services/scraper');
        const results = await scrapeAllGamesWeb(
          games,
          (stats) => {
            setScrapeState((prev) => ({
              ...prev,
              current: stats.done,
              total: stats.total,
              currentGameTitle: stats.currentGame || prev.currentGameTitle,
              found: stats.found,
              notFound: stats.notFound,
              skipped: stats.skipped,
              currentBoxartUrl: stats.currentBoxartUrl,
            }));
          }
        );
        setGames(results);
        setScrapeState((prev) => ({ ...prev, isComplete: true, current: prev.total }));
        showNotification(`Scraping terminé ! ${results.filter(g => g.media?.boxart2d).length} jaquettes récupérées.`, 'success');
      }
    } catch (err: any) {
      showNotification(`Erreur lors du scraping : ${err.message}`, 'error');
    } finally {
      setIsScrapingBatch(false);
    }
  };

  const handleOpenCandidateSearch = async (game: Game, customQuery?: string) => {
    playSelect();
    setCandidateGame(game);
    setIsCandidateModalOpen(true);
    setIsSearchingCandidates(true);
    try {
      if (window.api?.searchScrapeCandidates) {
        const list = await window.api.searchScrapeCandidates(game, customQuery);
        setScrapeCandidates(list);
      } else {
        setScrapeCandidates([]);
      }
    } catch (err: any) {
      showNotification(`Erreur lors de la recherche des suggestions : ${err.message}`, 'error');
    } finally {
      setIsSearchingCandidates(false);
    }
  };

  const handleSelectCandidate = async (candidate: ScrapeCandidate) => {
    if (!candidateGame || !window.api?.scrapeGameWithTitle) return;
    setIsApplyingCandidate(true);
    try {
      const updated = await window.api.scrapeGameWithTitle(candidateGame, candidate.title);
      setGames((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      if (selectedGame?.id === updated.id) {
        setSelectedGame(updated);
      }
      playUnlock();
      showNotification(`Jaquettes et données appliquées pour « ${candidate.cleanTitle} » !`, 'success');
      setIsCandidateModalOpen(false);
    } catch (err: any) {
      playDice();
      showNotification(`Erreur lors du scraping du titre : ${err.message}`, 'error');
    } finally {
      setIsApplyingCandidate(false);
    }
  };

  const handleScrapeSingleGame = async (game: Game) => {
    playSelect();
    if (!window.api) return;

    setIsSingleScraping(true);
    showNotification(`Recherche des médias pour "${game.cleanTitle}"...`, 'info');
    try {
      const updated = await window.api.scrapeGame(game);
      setGames((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      if (selectedGame?.id === updated.id) {
        setSelectedGame(updated);
      }

      // En cas de non trouvé : donner le choix avec des noms qui y ressemblent !
      const hasMedia = !!(
        updated.media?.boxart2d ||
        updated.media?.boxart3d ||
        updated.media?.snap ||
        updated.media?.video ||
        updated.media?.titleScreen
      );

      if (!hasMedia) {
        showNotification(`Aucun média trouvé directement. Recherche de correspondances...`, 'info');
        await handleOpenCandidateSearch(game);
      } else {
        showNotification(`Jaquette et données mises à jour !`, 'success');
      }
    } catch (err: any) {
      showNotification(`Erreur de scraping : ${err.message}. Recherche de correspondances...`, 'info');
      await handleOpenCandidateSearch(game);
    } finally {
      setIsSingleScraping(false);
    }
  };



  // Lance le lecteur intégré (EmulatorJS). En mode bureau, la ROM est lue
  // depuis le disque via IPC et passée en blob: au lecteur (il n'y a pas de
  // serveur web en desktop : les chemins /roms/... ou absolus sont traduits
  // en fichier réel avant lecture).
  const launchWithIntegratedPlayer = async (game: Game) => {
    const readRom = window.api?.readRomFile;
    try {
      if (typeof readRom === 'function' && game.path && !game.path.startsWith('http') && !game.path.startsWith('blob:')) {
        // Traduire le chemin en fichier disque réel :
        //  - chemin absolu (scan desktop) → tel quel
        //  - chemin web /roms/... (scan web partagé) → romsDir + suffixe
        let candidate = game.path;
        if (!candidate.startsWith('/') || candidate.startsWith('/roms/')) {
          const romsDir = (settings.romsDir || '').replace(/\/$/, '');
          if (romsDir) {
            const suffix = candidate.startsWith('/roms/') ? candidate.slice('/roms/'.length) : candidate;
            candidate = `${romsDir}/${suffix.replace(/^\//, '')}`;
          }
        }
        const res = await readRom(candidate);
        if (res?.ok && res.dataB64) {
          const bytes = Uint8Array.from(atob(res.dataB64), (c) => c.charCodeAt(0));
          const blob = new Blob([bytes], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          setWebEmulatorGame({ ...game, path: url });
          return;
        }
        console.warn('[RetroMad] Lecture ROM échouée :', res?.error, candidate);
      }
    } catch (e: any) {
      console.warn('[RetroMad] Lecture ROM via IPC impossible, tentative URL directe :', e);
    }
    setWebEmulatorGame(game);
  };

  const handleLaunchGame = async (game: Game, emulatorId?: string) => {
    playLaunch();

    // Enregistrement de session de jeu dans les Analytics
    const sysName = systems.find((s) => s.id === game.systemId)?.name || game.systemId.toUpperCase();
    const newSession: PlaySession = {
      id: `session-${Date.now()}`,
      gameId: game.id,
      gameTitle: game.cleanTitle || game.title,
      systemName: sysName,
      startedAt: "À l'instant",
      durationMinutes: Math.floor(Math.random() * 25) + 12,
    };
    setPlaySessions((prev) => [newSession, ...prev.slice(0, 49)]);
    setPlayStats((prev) => {
      const existingIdx = prev.findIndex((s) => s.gameId === game.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          playTimeMinutes: updated[existingIdx].playTimeMinutes + 15,
          sessionCount: updated[existingIdx].sessionCount + 1,
          lastPlayedAt: "À l'instant",
        };
        return updated;
      } else {
        return [
          {
            gameId: game.id,
            gameTitle: game.cleanTitle || game.title,
            systemId: game.systemId,
            systemName: sysName,
            playTimeMinutes: 15,
            sessionCount: 1,
            lastPlayedAt: "À l'instant",
          },
          ...prev,
        ];
      }
    });

    // window.api existe aussi en mode web (simulation) : on détecte le vrai bureau
    // Electron via le flag exposé par le preload, sinon émulation web EmulatorJS.
    const isDesktop = typeof window !== 'undefined' && !!window.isElectron;
    if (!isDesktop) {
      setWebEmulatorGame(game);
      return;
    }

    showNotification(`Lancement de "${game.cleanTitle}"...`, 'info');
    try {
      const result = await window.api.launchGame(game, emulatorId);
      if (result.success) {
        showNotification(`${result.message} — (Maintenez SELECT + START pour quitter)`, 'success');
        return;
      }
      // Aucun émulateur externe fonctionnel (ex. RetroArch non installé) :
      // repli automatique sur le lecteur intégré EmulatorJS.
      console.warn('[RetroMad] Lancement externe échoué, repli émulateur intégré :', result.message);
      showNotification(`${result.message} — bascule vers le lecteur intégré…`, 'info');
      await launchWithIntegratedPlayer(game);
    } catch (err: any) {
      console.warn('[RetroMad] Erreur lancement externe, repli émulateur intégré :', err);
      await launchWithIntegratedPlayer(game);
    }
  };

  const handleToggleFavorite = async (gameId: string) => {
    playFavorite();
    if (window.api) {
      await window.api.toggleFavorite(gameId);
    }
    setGames((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, favorite: !g.favorite } : g))
    );
  };

  // Handlers pour le Répertoire Public Centralisé
  const handleImportRomToLibrary = (rom: CentralizedRomItem) => {
    const existing = games.find((g) => g.id === rom.id || g.filename === rom.filename);
    if (!existing) {
      const converted = convertCentralizedRomsToGames([rom])[0];
      setGames((prev) => [converted, ...prev]);
      showNotification(`ROM "${rom.title}" indexée dans votre ludothèque !`, 'success');
    } else {
      showNotification(`La ROM "${rom.title}" est déjà dans votre ludothèque.`, 'info');
    }
  };

  const handleImportAllRomsToLibrary = () => {
    const newGames = convertCentralizedRomsToGames(centralizedRoms);
    setGames((prev) => {
      const existingIds = new Set(prev.map((g) => g.id));
      const added = newGames.filter((g) => !existingIds.has(g.id));
      return [...added, ...prev];
    });
    showNotification(`Toutes les ROMs de /public/roms ont été indexées (${centralizedRoms.length} jeux) !`, 'success');
  };

  const handleLaunchCentralizedRom = (rom: CentralizedRomItem) => {
    let target = games.find((g) => g.id === rom.id || g.filename === rom.filename);
    if (!target) {
      target = convertCentralizedRomsToGames([rom])[0];
      setGames((prev) => [target!, ...prev]);
    }
    handleLaunchGame(target);
  };

  const handleSelectGame = useCallback((g: Game) => {
    playSelect();
    const idx = visibleGames.findIndex((item) => item.id === g.id);
    if (idx >= 0) setFocusedGameIndex(idx);
  }, [playSelect, visibleGames]);

  const handleViewDetails = useCallback((g: Game) => {
    playSelect();
    setSelectedGame(g);
  }, [playSelect]);

  const handleScanPrompt = useCallback(() => {
    playSelect();
    setIsRomScannerOpen(true);
  }, [playSelect]);

  const handleSelectGenreCallback = useCallback((genre: string) => {
    setSelectedGenre(genre);
  }, []);

  // Handlers pour les 8 fonctionnalités Rétro
  const handleToggleUnlockAchievement = (achievementId: string) => {
    setAchievements((prev) =>
      prev.map((a) => {
        if (a.id === achievementId) {
          const willUnlock = !a.unlocked;
          if (willUnlock) {
            playUnlock();
            showNotification(`🏆 Succès débloqué : ${a.title} (+${a.points} pts)`, 'success');
            setPlayerProfile((prof) => {
              const newXp = prof.totalXp + a.points;
              const newLevel = Math.floor(newXp / 100) + 1;
              return {
                ...prof,
                totalXp: newXp,
                level: newLevel,
              };
            });
          }
          return {
            ...a,
            unlocked: willUnlock,
            unlockedAt: willUnlock ? new Date().toISOString() : undefined,
          };
        }
        return a;
      })
    );
  };

  const handleToggleCheat = (cheatId: string) => {
    playSelect();
    setCheats((prev) =>
      prev.map((c) => (c.id === cheatId ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const handleAddCheat = (newCheat: GameCheat) => {
    playSelect();
    setCheats((prev) => [newCheat, ...prev]);
    showNotification(`Code de triche ajouté : "${newCheat.title}"`, 'success');
  };

  const handleDeleteCheat = (cheatId: string) => {
    playBack();
    setCheats((prev) => prev.filter((c) => c.id !== cheatId));
    showNotification('Code de triche supprimé.', 'info');
  };

  const handleLoadSaveState = (stateItem: SaveStateItem) => {
    playLaunch();
    showNotification(`Chargement du slot ${stateItem.slot} pour ${stateItem.gameTitle}...`, 'success');
  };

  const handleCreateSaveState = (game: Game, slot: number | 'auto', note?: string) => {
    playSelect();
    const newState: SaveStateItem = {
      id: `state-${Date.now()}`,
      gameId: game.id,
      gameTitle: game.cleanTitle,
      systemId: game.systemId,
      systemName: systems.find((s) => s.id === game.systemId)?.shortName || game.systemId.toUpperCase(),
      slot: slot,
      timestamp: new Date().toLocaleTimeString(),
      thumbnail: game.media?.snap || game.media?.boxart2d || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
      note: note || `Sauvegarde manuelle slot #${slot}`,
      fileSize: '240 KB',
      stateType: 'savestate',
    };
    setSaveStates((prev) => [newState, ...prev]);
    showNotification(`Nouvel état d'émulation créé (Slot ${slot})`, 'success');
  };

  const handleDeleteSaveState = (stateId: string) => {
    playBack();
    setSaveStates((prev) => prev.filter((s) => s.id !== stateId));
    showNotification('État de sauvegarde supprimé.', 'info');
  };

  const handleImportSaveState = (file: File, game: Game) => {
    playSelect();
    const newState: SaveStateItem = {
      id: `imported-${Date.now()}`,
      gameId: game.id,
      gameTitle: game.cleanTitle,
      systemId: game.systemId,
      systemName: systems.find((s) => s.id === game.systemId)?.shortName || game.systemId.toUpperCase(),
      slot: (saveStates.filter((s) => s.gameId === game.id).length || 0) + 1,
      timestamp: new Date().toLocaleTimeString(),
      thumbnail: game.media?.snap || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
      note: `Importé depuis ${file.name}`,
      fileSize: `${Math.round(file.size / 1024)} KB`,
      stateType: 'savestate',
    };
    setSaveStates((prev) => [newState, ...prev]);
    showNotification(`Fichier ${file.name} importé avec succès !`, 'success');
  };

  const handleSaveBezelConfig = (config: BezelConfig) => {
    playSelect();
    setCurrentBezel(config);
    showNotification(`Configuration Bezel CRT "${config.name}" enregistrée !`, 'success');
  };

  const handleCompleteDailyChallenge = (challengeId: string) => {
    setDailyChallenges((prev) =>
      prev.map((dc) => (dc.id === challengeId ? { ...dc, isCompleted: true } : dc))
    );
    playUnlock();
    showNotification('🎯 Défi du Jour complété ! +XP ajouté à votre profil.', 'success');
  };

  const handleRefreshBios = async () => {
    if (isKioskMode) return;
    playSelect();
    if (!window.api) return;
    setIsCheckingBios(true);
    try {
      const statuses = await window.api.checkBios();
      setBiosStatuses(statuses);
      showNotification('Vérification des BIOS et calcul des MD5 terminés.', 'success');
    } catch (err: any) {
      showNotification(`Erreur vérification BIOS : ${err.message}`, 'error');
    } finally {
      setIsCheckingBios(false);
    }
  };

  const handleSaveSettings = async (newSettings: Partial<AppSettings>) => {
    playSelect();
    if (window.api) {
      const updated = await window.api.saveSettings(newSettings);
      setSettings(updated);
      showNotification('Paramètres enregistrés.', 'success');
      handleRefreshBios();
    }
  };

  const handleSaveGames = async (newGames: Game[]) => {
    setGames(newGames);
    if (window.api?.saveGames) {
      await window.api.saveGames(newGames);
    }
    showNotification('Catalogue de jeux mis à jour.', 'success');
  };

  const handleSaveSingleGame = async (updatedGame: Game) => {
    const newGames = games.map((g) => (g.id === updatedGame.id ? updatedGame : g));
    setGames(newGames);
    if (selectedGame?.id === updatedGame.id) {
      setSelectedGame(updatedGame);
    }
    if (window.api?.saveGames) {
      await window.api.saveGames(newGames);
    }
    showNotification(`Jeu "${updatedGame.cleanTitle}" modifié avec succès !`, 'success');
  };

  const handleSaveSystems = async (newSystems: System[]) => {
    setSystems(newSystems);
    if (window.api?.saveSystems) {
      await window.api.saveSystems(newSystems);
    }
    showNotification('Consoles et systèmes enregistrés.', 'success');
  };

  const handleSaveSingleSystem = async (updatedSystem: System) => {
    const newSystems = systems.map((s) => (s.id === updatedSystem.id ? updatedSystem : s));
    setSystems(newSystems);
    if (exhibitionSystem?.id === updatedSystem.id) {
      setExhibitionSystem(updatedSystem);
    }
    if (window.api?.saveSystems) {
      await window.api.saveSystems(newSystems);
    }
    showNotification(`Console "${updatedSystem.name}" mise à jour !`, 'success');
  };

  const handleSaveCompanies = async (newCompanies: Company[]) => {
    setCompanies(newCompanies);
    if (window.api?.saveCompanies) {
      await window.api.saveCompanies(newCompanies);
    }
    showNotification('Firmes et constructeurs enregistrés.', 'success');
  };

  const handleSaveSingleCompany = async (updatedCompany: Company) => {
    const newCompanies = companies.map((c) => (c.id === updatedCompany.id ? updatedCompany : c));
    setCompanies(newCompanies);
    if (exhibitionCompany?.id === updatedCompany.id) {
      setExhibitionCompany(updatedCompany);
    }
    if (window.api?.saveCompanies) {
      await window.api.saveCompanies(newCompanies);
    }
    showNotification(`Firme "${updatedCompany.name}" mise à jour !`, 'success');
  };

  const handleSaveEmulators = async (newEmulators: EmulatorProfile[]) => {
    setEmulators(newEmulators);
    if (window.api?.saveEmulators) {
      await window.api.saveEmulators(newEmulators);
    }
    showNotification('Profils d\'émulateurs enregistrés.', 'success');
  };

  const handleResetDefaults = async () => {
    setSystems(DEFAULT_SYSTEMS);
    setCompanies(DEFAULT_COMPANIES);
    setEmulators(BUILTIN_EMULATORS);
    if (window.api?.saveSystems) await window.api.saveSystems(DEFAULT_SYSTEMS);
    if (window.api?.saveCompanies) await window.api.saveCompanies(DEFAULT_COMPANIES);
    if (window.api?.saveEmulators) await window.api.saveEmulators(BUILTIN_EMULATORS);
    showNotification('Consoles, firmes et émulateurs réinitialisés aux valeurs d\'usine.', 'success');
  };

  // Navigation manette
  useGamepad({
    onUp: () => {
      if (isPinModalOpen) return;
      playMove();
      setFocusedGameIndex((prev) => Math.max(0, prev - 4));
    },
    onDown: () => {
      if (isPinModalOpen) return;
      playMove();
      setFocusedGameIndex((prev) => Math.min(visibleGames.length - 1, prev + 4));
    },
    onLeft: () => {
      if (isPinModalOpen) return;
      playMove();
      setFocusedGameIndex((prev) => Math.max(0, prev - 1));
    },
    onRight: () => {
      if (isPinModalOpen) return;
      playMove();
      setFocusedGameIndex((prev) => Math.min(visibleGames.length - 1, prev + 1));
    },
    onConfirm: () => {
      if (isPinModalOpen) return;
      // A: Lancer le jeu ciblé
      if (visibleGames[focusedGameIndex]) {
        handleLaunchGame(visibleGames[focusedGameIndex]);
      }
    },
    onCancel: () => {
      if (isPinModalOpen) return;
      playBack();
      if (selectedGame) {
        setSelectedGame(null);
      } else if (isSettingsOpen) {
        setIsSettingsOpen(false);
      } else if (selectedSystemId !== null) {
        setSelectedSystemId(null);
      }
    },
    onDetails: () => {
      if (isPinModalOpen) return;
      // X: Ouvrir détails
      if (visibleGames[focusedGameIndex]) {
        playSelect();
        setSelectedGame(visibleGames[focusedGameIndex]);
      }
    },
    onFavorite: () => {
      if (isPinModalOpen) return;
      // Y: Favori
      if (visibleGames[focusedGameIndex]) {
        handleToggleFavorite(visibleGames[focusedGameIndex].id);
      }
    },
    onPrevTab: () => {
      if (isPinModalOpen) return;
      // LB: Console précédente
      playMove();
      const currentIdx = systems.findIndex((s) => s.id === selectedSystemId);
      if (currentIdx > 0) {
        setSelectedSystemId(systems[currentIdx - 1].id);
      } else if (currentIdx === 0) {
        setSelectedSystemId(null);
      }
    },
    onNextTab: () => {
      if (isPinModalOpen) return;
      // RB: Console suivante
      playMove();
      const currentIdx = systems.findIndex((s) => s.id === selectedSystemId);
      if (selectedSystemId === null && systems.length > 0) {
        setSelectedSystemId(systems[0].id);
      } else if (currentIdx >= 0 && currentIdx < systems.length - 1) {
        setSelectedSystemId(systems[currentIdx + 1].id);
      }
    },
    onMenu: () => {
      // Bouton Start / Menu à la manette
      playSelect();
      if (isKioskMode) {
        setIsPinModalOpen(true);
      } else {
        setIsSettingsOpen((prev) => !prev);
      }
    },
    onRandom: () => {
      if (isPinModalOpen || visibleGames.length === 0) return;
      playDice();
      const randIdx = Math.floor(Math.random() * visibleGames.length);
      setFocusedGameIndex(randIdx);
      showNotification(`🎲 Hasard : ${visibleGames[randIdx].cleanTitle}`, 'info');
    },
  }, !isKioskMode);

  return (
    <div className={`h-screen w-screen flex flex-col bg-transparent text-slate-100 select-none overflow-hidden relative font-display ${
      // Régie admin = sobre : désaturation douce + contrastes réduits.
      // Le Kiosque garde toutes ses couleurs et ses effets.
      !isKioskMode ? 'admin-sober' : ''
    }`}>
      {!isKioskMode && (
        <style>{`
          .admin-sober .bg-gradient-to-tr,
          .admin-sober .bg-gradient-to-r,
          .admin-sober .bg-gradient-to-br {
            filter: saturate(0.25) brightness(0.92);
          }
          .admin-sober img { filter: saturate(0.55) contrast(0.95); }
          .admin-sober video { filter: saturate(0.4) brightness(0.85); }
          .admin-sober .shadow-neon,
          .admin-sober [class*="shadow-[0_0"] {
            filter: saturate(0.3);
          }
          .admin-sober iframe { filter: saturate(0.75) brightness(0.9); }
        `}</style>
      )}
      {/* Filtre d'écran CRT Rétro Global si activé avec profil personnalisé */}
      {settings.crtEffect && (
        <div
          className={`fixed inset-0 pointer-events-none z-50 animate-in fade-in duration-200 ${
            settings.crtShaderProfile === 'trinitron-pvm'
              ? 'shader-trinitron-pvm scanlines crt-phosphor'
              : settings.crtShaderProfile === 'dmg-matrix'
              ? 'shader-dmg-matrix'
              : settings.crtShaderProfile === 'gba-tft'
              ? 'shader-gba-tft'
              : settings.crtShaderProfile === 'vectrex'
              ? 'shader-vectrex'
              : settings.crtShaderProfile === 'pure'
              ? ''
              : 'shader-arcade-15khz scanlines crt-vignette'
          }`}
        />
      )}

      {isKioskMode ? (
        <KioskArcadeView
          games={visibleGames}
          systems={systems}
          companies={companies}
          emulators={emulators}
          onLaunchGame={handleLaunchGame}
          onToggleFavorite={handleToggleFavorite}
          onViewDetails={(g) => {
            playSelect();
            setSelectedGame(g);
          }}
          onUnlockAdmin={() => {
            playSelect();
            setIsSettingsOpen(true);
          }}
          onOpenShaderProfiles={() => {
            playSelect();
            setIsShaderProfilesModalOpen(true);
          }}
          soundEnabled={settings.soundEnabled}
          soundVolume={settings.soundVolume ?? 0.8}
          crtEnabled={!!settings.crtEffect}
          onToggleCrt={handleToggleCrt}
          backgroundVideos={effBackgroundVideos}
          neonGlows={effNeonGlows}
          animations={effAnimations}
          kioskWidgets={settings.kioskWidgets ?? {}}
          hiddenCompanyIds={settings.kioskHiddenCompanies ?? []}
          hiddenSystemIds={settings.kioskHiddenSystems ?? []}
          companyOrder={settings.kioskCompanyOrder ?? []}
          featuredGameIds={settings.kioskFeaturedGames ?? []}
          onReorderCompanies={isAdminUnlocked ? handleReorderKioskCompanies : undefined}
          onOpenProjectorModal={() => {
            playSelect();
            setIsProjectorModalOpen(true);
          }}
          onOpenUserManualPdf={() => {
            playSelect();
            setIsUserManualPdfOpen(true);
          }}
          onOpenJukebox={() => {
            playSelect();
            setIsJukeboxModalOpen(true);
          }}
          onOpenRoulette={() => {
            playDice();
            setIsRouletteModalOpen(true);
          }}
          onOpenAchievements={() => {
            playSelect();
            setIsAchievementsModalOpen(true);
          }}
          onOpenTournament={() => {
            playSelect();
            setIsTournamentModalOpen(true);
          }}
          onOpenManuals={() => {
            playSelect();
            setActiveManualGameId(undefined);
            setIsManualsModalOpen(true);
          }}
          onOpenSpeedrun={() => {
            playSelect();
            setIsSpeedrunModalOpen(true);
          }}
          onOpenCartridgeShelf={() => {
            playSelect();
            setIsCartridgeShelfModalOpen(true);
          }}
          onOpenThemeStudio={() => {
            playSelect();
            setIsCommunityThemeStudioOpen(true);
          }}
          onTriggerAttractMode={() => {
            playSelect();
            setIsAttractMode(true);
          }}
          onReloadGames={handleScanRoms}
        />
      ) : (
        <>
          {/* Barre de navigation principale */}
          <Navigation
            currentTab={isSettingsOpen ? 'settings' : currentTab}
            onTabChange={(tab) => {
              playSelect();
              if (tab === 'settings') {
                setIsSettingsOpen(true);
              } else {
                setCurrentTab(tab);
              }
            }}
            onOpenSettings={() => {
              playSelect();
              setIsSettingsOpen(true);
            }}
            onScan={handleScanRoms}
            onScrape={handleStartScrapeBatch}
            onOpenExtensions={() => {
              playSelect();
              setIsExtensionsModalOpen(true);
            }}
            onOpenSearch={() => {
              playSelect();
              setIsSearchOpen(true);
            }}
            isScanning={isScanning}
            soundEnabled={settings.soundEnabled}
            onToggleSound={() => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
            crtEnabled={!!settings.crtEffect}
            onToggleCrt={handleToggleCrt}
            totalGames={visibleGames.length}
            isKioskMode={isKioskMode}
            isAdminUnlocked={isAdminUnlocked}
            onEnterKiosk={handleEnterKiosk}
            onUnlockKiosk={() => setIsPinModalOpen(true)}
            selectedGenre={selectedGenre}
            onSelectGenre={(genre) => {
              playSelect();
              setSelectedGenre(genre);
              setCurrentTab('games');
            }}
            availableGenres={availableGenres}
            onOpenCentralizedStorage={() => {
              playSelect();
              setIsCentralizedStorageOpen(true);
            }}
            onOpenLanManager={() => {
              playSelect();
              setIsLanManagerOpen(true);
            }}
            onOpenProjectorModal={() => {
              playSelect();
              setIsProjectorModalOpen(true);
            }}
            isProjectorKioskRunning={isProjectorKioskRunning}
            onOpenUserManualPdf={() => {
              playSelect();
              setIsUserManualPdfOpen(true);
            }}
            onOpenShaderProfiles={() => {
              playSelect();
              setIsShaderProfilesModalOpen(true);
            }}
            onOpenSaveStateSync={() => {
              playSelect();
              setIsSaveStateSyncModalOpen(true);
            }}
            onOpenQuickStart={() => {
              playSelect();
              setIsOnboardingOpen(true);
            }}
          />

          {/* Vues principales */}
          {currentTab === 'games' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Sélecteur de consoles */}
              <SystemSelector
                systems={systems}
                selectedSystemId={selectedSystemId}
                onSelectSystem={(sysId) => {
                  playSelect();
                  setSelectedSystemId(sysId);
                }}
                games={visibleGames}
                onOpenExhibition={(sys) => {
                  playSelect();
                  setExhibitionSystem(sys);
                }}
              />

              {/* Grille de jeux */}
              <GameGrid
                games={visibleGames}
                systems={systems}
                selectedSystemId={selectedSystemId}
                selectedGameId={visibleGames[focusedGameIndex]?.id || null}
                onSelectGame={handleSelectGame}
                onLaunchGame={handleLaunchGame}
                onToggleFavorite={handleToggleFavorite}
                onViewDetails={handleViewDetails}
                onScanPrompt={handleScanPrompt}
                onAddGames={handleAddGames}
                onPlayDice={playDice}
                selectedGenre={selectedGenre}
                onSelectGenre={handleSelectGenreCallback}
              />
            </div>
          )}

          {currentTab === 'computing' && (
            <ComputingView
              systems={systems}
              games={visibleGames}
              onOpenGames={(sysId) => {
                playSelect();
                setSelectedSystemId(sysId);
                setCurrentTab('games');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenSystemExhibition={(sys) => {
                playSelect();
                setExhibitionSystem(sys);
              }}
            />
          )}

          {currentTab === 'companies' && (
            <CompanyView
              companies={companies}
              systems={systems}
              onSelectSystemFilter={(sysId) => {
                playSelect();
                setSelectedSystemId(sysId);
                setCurrentTab('games');
              }}
              onOpenExhibition={(sys) => {
                playSelect();
                setExhibitionSystem(sys);
              }}
              onOpenCompanyExhibition={(comp) => {
                playSelect();
                setExhibitionCompany(comp);
              }}
              onEditCompany={(comp) => {
                if (!isKioskMode && isAdminUnlocked) {
                  setDirectEditingCompany(comp);
                }
              }}
              isKioskMode={isKioskMode}
            />
          )}

          {currentTab === 'bios' && (
            <BiosManager
              biosStatuses={biosStatuses}
              biosDir={settings.biosDir}
              onRefreshBios={handleRefreshBios}
              isChecking={isCheckingBios}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}
        </>
      )}

      {/* Modales en Suspense (chargées à la demande) */}
      <Suspense fallback={null}>
        {/* Modale Fiche Détails du Jeu */}
        <GameDetailModal
        game={selectedGame}
        system={systems.find((s) => s.id === selectedGame?.systemId)}
        emulators={emulators}
        onClose={() => {
          playBack();
          setSelectedGame(null);
        }}
        onLaunch={handleLaunchGame}
        onToggleFavorite={handleToggleFavorite}
        onScrapeGame={handleScrapeSingleGame}
        onOpenCandidateSearch={handleOpenCandidateSearch}
        onEdit={(game) => {

          if (!isKioskMode && isAdminUnlocked) {
            setDirectEditingGame(game);
          }
        }}
        onDeleteGame={handleDeleteGame}
        isKioskMode={isKioskMode}
        isScraping={isScrapingBatch || isSingleScraping}

        onOpenAchievements={(_g) => {
          playSelect();
          setIsAchievementsModalOpen(true);
        }}
        onOpenCheats={(_g) => {
          playSelect();
          setIsCheatsModalOpen(true);
        }}
        onOpenSaveStates={(_g) => {
          playSelect();
          setIsSaveStatesModalOpen(true);
        }}
        onOpenManual={(g) => {
          playSelect();
          setActiveManualGameId(g.id);
          setIsManualsModalOpen(true);
        }}
        onFilterByGenre={(genre) => {
          playSelect();
          setSelectedGenre(genre);
          setCurrentTab('games');
        }}
      />

      {/* Centre d'Administration en superposition */}
      {isSettingsOpen && (
        <AdminHubModal
          isOpen={isSettingsOpen}
          onClose={() => {
            playBack();
            setIsSettingsOpen(false);
          }}
          settings={settings}
          onSaveSettings={handleSaveSettings}
          games={games}
          onSaveGames={handleSaveGames}
          systems={systems}
          onSaveSystems={handleSaveSystems}
          companies={companies}
          onSaveCompanies={handleSaveCompanies}
          emulators={emulators}
          onSaveEmulators={handleSaveEmulators}
          onSelectDirectory={async () => {
            if (window.api) return window.api.selectDirectory();
            return null;
          }}
          onOpenExtensions={() => {
            playSelect();
            setIsExtensionsModalOpen(true);
          }}
          onOpenThemeStudio={() => {
            playSelect();
            setIsCommunityThemeStudioOpen(true);
          }}
          onDetectEmulators={async () => {
            if (window.api?.detectEmulators) return window.api.detectEmulators();
            return emulators;
          }}
          onResetDefaults={handleResetDefaults}
          onOpenSystemExhibition={(sys) => {
            setIsSettingsOpen(false);
            setExhibitionSystem(sys);
          }}
          onOpenCompanyExhibition={(comp) => {
            setIsSettingsOpen(false);
            setExhibitionCompany(comp);
          }}
          onScanRoms={handleScanRoms}
          isScanningRoms={isScanning}
          onStartScrapeBatch={handleStartScrapeBatch}
          onScrapeGame={handleScrapeSingleGame}
          isScrapingBatch={isScrapingBatch}
          scrapeProgress={scrapeState}
          onLaunchGame={handleLaunchGame}
          onToggleFavorite={handleToggleFavorite}
          biosStatuses={biosStatuses}
          isCheckingBios={isCheckingBios}
          onCheckBios={handleRefreshBios}
          onCreateRomsFolders={window.api?.createRomsFolders}
        />
      )}

      {/* Modale Téléchargement et Installation des Extensions & Cœurs */}
      <ExtensionsDownloaderModal
        isOpen={isExtensionsModalOpen}
        onClose={() => {
          playBack();
          setIsExtensionsModalOpen(false);
        }}
        onRomsFoldersCreated={() => {
          showNotification('Dossiers de ROMs et fiches d\'extensions configurés avec succès !', 'success');
        }}
      />

      {/* Modale de suivi Scraping Batch */}
      <ScraperModal
        isOpen={scrapeState.isOpen}
        total={scrapeState.total}
        current={scrapeState.current}
        currentGameTitle={scrapeState.currentGameTitle}
        isComplete={scrapeState.isComplete}
        found={scrapeState.found}
        notFound={scrapeState.notFound}
        skipped={scrapeState.skipped}
        currentBoxartUrl={scrapeState.currentBoxartUrl}
        onClose={() => setScrapeState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Modale de Choix des Titres Similaires (en cas de jeu non trouvé ou correction) */}
      <ScrapeCandidateModal
        isOpen={isCandidateModalOpen}
        game={candidateGame}
        candidates={scrapeCandidates}
        isSearching={isSearchingCandidates}
        isApplying={isApplyingCandidate}
        onClose={() => setIsCandidateModalOpen(false)}
        onSearch={(query) => {
          if (candidateGame) {
            handleOpenCandidateSearch(candidateGame, query);
          }
        }}
        onSelectCandidate={handleSelectCandidate}
      />


      {/* Modale de Déverrouillage Code PIN Kiosk */}
      <KioskPinModal
        isOpen={isPinModalOpen}
        correctPin={settings.kioskPin || '1234'}
        onSuccess={handleUnlockKioskSuccess}
        onClose={() => setIsPinModalOpen(false)}
        soundEnabled={settings.soundEnabled}
      />

      {/* Modale d'Exposition Permanente & Musée du Rétrogaming */}
      <ConsoleExhibitionModal
        system={exhibitionSystem}
        isOpen={!!exhibitionSystem}
        onClose={() => {
          playBack();
          setExhibitionSystem(null);
        }}
        onPlayGames={(sys) => {
          setExhibitionSystem(null);
          setSelectedSystemId(sys.id);
          setCurrentTab('games');
        }}
        onOpenCompanyMuseum={(companyId) => {
          playSelect();
          const comp = companies.find((c) => c.id === companyId);
          if (comp) {
            setExhibitionSystem(null);
            setExhibitionCompany(comp);
          }
        }}
        onEditSystem={(sys) => {
          if (!isKioskMode && isAdminUnlocked) {
            setDirectEditingSystem(sys);
          }
        }}
        isKioskMode={isKioskMode}
      />

      {/* Modale d'Exposition Permanente & Grand Musée de la Firme */}
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
          setSelectedSystemId(sysId);
          setCurrentTab('games');
        }}
        onEditCompany={(comp) => {
          if (!isKioskMode && isAdminUnlocked) {
            setDirectEditingCompany(comp);
          }
        }}
        isKioskMode={isKioskMode}
      />

      {/* Modale d'Édition Directe de Jeu (Admin) */}
      {!isKioskMode && isAdminUnlocked && directEditingGame && (
        <GameEditModal
          game={directEditingGame}
          systems={systems}
          emulators={emulators}
          isOpen={!!directEditingGame}
          onClose={() => setDirectEditingGame(null)}
          onSave={handleSaveSingleGame}
        />
      )}

      {/* Modale d'Édition Directe de Console (Admin) */}
      {!isKioskMode && isAdminUnlocked && directEditingSystem && (
        <SystemEditModal
          system={directEditingSystem}
          companies={companies}
          isOpen={!!directEditingSystem}
          onClose={() => setDirectEditingSystem(null)}
          onSave={handleSaveSingleSystem}
        />
      )}

      {/* Modale d'Édition Directe de Firme (Admin) */}
      {!isKioskMode && isAdminUnlocked && directEditingCompany && (
        <CompanyEditModal
          company={directEditingCompany}
          isOpen={!!directEditingCompany}
          onClose={() => setDirectEditingCompany(null)}
          onSave={handleSaveSingleCompany}
        />
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-14 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-2.5 rounded-2xl border shadow-xl text-xs font-bold flex items-center space-x-2 backdrop-blur-md ${
              notification.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : notification.type === 'error'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                : 'bg-retro-accent/20 text-retro-accent border-retro-accent/50'
            }`}
          >
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Pied de page touches manette */}
      {!isKioskMode && <GamepadHint onOpenHotkeysGuide={() => setIsHotkeysGuideOpen(true)} />}

      {/* Recherche Globale Spotlight (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        games={games}
        systems={systems}
        onClose={() => setIsSearchOpen(false)}
        onLaunchGame={(game) => {
          handleLaunchGame(game);
          setIsSearchOpen(false);
        }}
        onViewGame={(game) => {
          setSelectedGame(game);
          setIsSearchOpen(false);
        }}
        onSelectSystem={(systemId) => {
          setSelectedSystemId(systemId);
          setCurrentTab('games');
          setIsSearchOpen(false);
        }}
      />

      {/* Attract Mode Kiosk (Screensaver) */}
      <KioskAttractMode
        isActive={isAttractMode}
        games={games}
        systems={systems}
        onWakeUp={() => {
          playCoin();
          setIsAttractMode(false);
          resetAttractTimer();
        }}
      />

      {/* ======================================================== */}
      {/* LES 8 NOUVELLES FONCTIONNALITÉS DU LABO RÉTRO */}
      {/* ======================================================== */}

      {/* 1. Roulette Rétro & Défis du Jour */}
      <RetroRouletteDailyChallengeModal
        isOpen={isRouletteModalOpen}
        onClose={() => setIsRouletteModalOpen(false)}
        games={games}
        systems={systems}
        onLaunchGame={handleLaunchGame}
        onSelectGame={(g: Game) => {
          setSelectedGame(g);
          setIsRouletteModalOpen(false);
        }}
        challenges={dailyChallenges}
        onCompleteChallenge={handleCompleteDailyChallenge}
        onPlaySound={(type) => {
          if (type === 'coin') playCoin();
          if (type === 'fanfare') playUnlock();
          if (type === 'powerup') playSelect();
        }}
      />

      {/* 2. RetroAchievements & Trophées */}
      <RetroAchievementsModal
        isOpen={isAchievementsModalOpen}
        onClose={() => setIsAchievementsModalOpen(false)}
        achievements={achievements}
        profile={playerProfile}
        games={games}
        selectedGameId={selectedGame?.id}
        onUnlockAchievement={handleToggleUnlockAchievement}
        onLaunchGame={(gameId: string) => {
          const g = games.find((item) => item.id === gameId);
          if (g) handleLaunchGame(g);
        }}
      />

      {/* 3. Jukebox Chiptune 8/16-Bit */}
      <RetroJukeboxModal
        isOpen={isJukeboxModalOpen}
        onClose={() => setIsJukeboxModalOpen(false)}
        jukebox={jukebox}
        isFloatingVisible={isFloatingJukeboxVisible}
        onToggleFloatingVisible={handleToggleFloatingJukebox}
      />

      {/* Mini-Lecteur Flottant Jukebox (Déplaçable & Coupable) */}
      {isFloatingJukeboxVisible && (
        <RetroJukeboxFloatingPlayer
          jukebox={jukebox}
          onOpenModal={() => setIsJukeboxModalOpen(true)}
          onClose={handleCloseFloatingJukebox}
        />
      )}

      {/* 4. Tournois Arcade Multijoueur */}
      <ArcadeTournamentModal
        isOpen={isTournamentModalOpen}
        onClose={() => setIsTournamentModalOpen(false)}
        games={games}
        onLaunchGame={handleLaunchGame}
      />

      {/* 5. Liseuse de Notices & Manuels d'Époque */}
      <RetroManualsViewerModal
        isOpen={isManualsModalOpen}
        onClose={() => {
          setIsManualsModalOpen(false);
          setActiveManualGameId(undefined);
        }}
        manuals={INITIAL_MANUALS}
        games={games}
        initialGameId={activeManualGameId}
        onOpenOfficialGuide={() => {
          setIsUserManualPdfOpen(true);
        }}
        onLaunchGame={(g: Game) => {
          setIsManualsModalOpen(false);
          handleLaunchGame(g);
        }}
      />

      {/* 6. Studio Bezels & Shaders CRT */}
      <BezelStudioModal
        isOpen={isBezelStudioModalOpen}
        onClose={() => setIsBezelStudioModalOpen(false)}
        currentConfig={currentBezel}
        onSaveConfig={handleSaveBezelConfig}
      />

      {/* 7. Codes Cheats & Game Genie */}
      <RetroCheatsModal
        isOpen={isCheatsModalOpen}
        onClose={() => setIsCheatsModalOpen(false)}
        cheats={cheats}
        games={games}
        selectedGameId={selectedGame?.id}
        onToggleCheat={handleToggleCheat}
        onAddCheat={handleAddCheat}
        onDeleteCheat={handleDeleteCheat}
      />

      {/* 8. Gestionnaire de Save States & Cartes Mémoires */}
      <RetroSaveStatesModal
        isOpen={isSaveStatesModalOpen}
        onClose={() => setIsSaveStatesModalOpen(false)}
        saveStates={saveStates}
        games={games}
        selectedGameId={selectedGame?.id}
        onLoadState={handleLoadSaveState}
        onCreateState={handleCreateSaveState}
        onDeleteState={handleDeleteSaveState}
        onImportState={handleImportSaveState}
      />

      {/* ======================================================== */}
      {/* LES 8 NOUVELLES EXTENSIONS DU PROJET + GESTION MUSIQUE */}
      {/* ======================================================== */}

      {/* 1. Rétro Analytics & Journal de Bord */}
      <RetroAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        playStats={playStats}
        sessions={playSessions}
        games={games}
        systems={systems}
        onPlayGame={handleLaunchGame}
        onPlaySound={(type) => {
          if (type === 'coin') playCoin();
          if (type === 'fanfare') playUnlock();
          if (type === 'powerup') playSelect();
        }}
      />

      {/* 2. Testeur de Manette & Input Calibrator */}
      <GamepadTesterModal
        isOpen={isGamepadTesterOpen}
        onClose={() => setIsGamepadTesterOpen(false)}
        onPlaySound={(type) => {
          if (type === 'coin') playCoin();
          if (type === 'fanfare') playUnlock();
          if (type === 'powerup') playSelect();
        }}
      />

      {/* 3. Multi-Profils & Contrôle Parental */}
      <MultiProfileModal
        isOpen={isProfilesOpen}
        onClose={() => setIsProfilesOpen(false)}
        profiles={userProfiles}
        activeProfileId={activeProfileId}
        parentalConfig={parentalConfig}
        systems={systems}
        onSelectProfile={(profileId) => {
          setActiveProfileId(profileId);
          const p = userProfiles.find((item) => item.id === profileId);
          showNotification(`Profil activé : ${p?.name || 'Joueur'}`, 'success');
        }}
        onAddProfile={(newProfile) => {
          setUserProfiles((prev) => [...prev, newProfile]);
          showNotification(`Profil "${newProfile.name}" créé avec succès !`, 'success');
        }}
        onUpdateParentalConfig={(config) => {
          setParentalConfig(config);
          showNotification('Paramètres de contrôle parental enregistrés.', 'success');
        }}
        onPlaySound={(type) => {
          if (type === 'coin') playCoin();
          if (type === 'fanfare') playUnlock();
          if (type === 'powerup') playSelect();
        }}
      />

      {/* 4. Musée & Frise Chronologique de l'Histoire du Rétrogaming */}
      <HistoryTimelineModal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        milestones={HISTORICAL_MILESTONES}
        games={games}
        onPlayGame={(g) => {
          setIsTimelineOpen(false);
          handleLaunchGame(g);
        }}
        onPlaySound={(type) => {
          if (type === 'coin') playCoin();
          if (type === 'fanfare') playUnlock();
          if (type === 'powerup') playSelect();
        }}
      />

      {/* 5. Print Studio : Jaquettes & Boîtes 1:1 Prêtes à Imprimer */}
      <PrintStudioModal
        isOpen={isPrintStudioOpen}
        onClose={() => setIsPrintStudioOpen(false)}
        games={games}
        initialGameId={selectedGame?.id}
        onPlaySound={(type) => {
          if (type === 'coin') playCoin();
          if (type === 'fanfare') playUnlock();
          if (type === 'powerup') playSelect();
        }}
      />

      {/* 6. Nomad Backup : Export & Pack Clé USB */}
      <NomadBackupModal
        isOpen={isNomadBackupOpen}
        onClose={() => setIsNomadBackupOpen(false)}
        onExportBundle={() => ({
          appVersion: '1.0',
          exportedAt: new Date().toISOString(),
          machineId: 'RETROMAD-STATION',
          profiles: userProfiles,
          playStats: playStats,
          achievements,
          cheats,
          saveStates,
          games,
          systems,
        })}
        onImportBundle={(restored: NomadBackupPackage) => {
          if (restored.achievements) setAchievements(restored.achievements);
          if (restored.cheats) setCheats(restored.cheats);
          if (restored.saveStates) setSaveStates(restored.saveStates);
          if (restored.profiles) setUserProfiles(restored.profiles);
          if (restored.games) setGames(restored.games);
          showNotification('Sauvegarde Nomad restaurée avec succès !', 'success');
        }}
        onPlaySound={(type) => {
          if (type === 'coin') playCoin();
          if (type === 'fanfare') playUnlock();
          if (type === 'powerup') playSelect();
        }}
      />

      {/* 7. Overlays Consoles Portables LCD (Game Boy, GBA, Game Gear, etc.) */}
      <HandheldOverlaysModal
        isOpen={isHandheldOverlaysOpen}
        onClose={() => setIsHandheldOverlaysOpen(false)}
        currentConfig={handheldConfig}
        onSaveConfig={(config) => {
          setHandheldConfig(config);
          showNotification('Configuration de l’overlay portable sauvegardée !', 'success');
        }}
        onPlaySound={(type) => {
          if (type === 'coin') playCoin();
          if (type === 'fanfare') playUnlock();
          if (type === 'powerup') playSelect();
        }}
      />

      {/* 8. Mode Soirée & Bar Arcade */}
      <ArcadePartyModal
        isOpen={isArcadePartyOpen}
        onClose={() => setIsArcadePartyOpen(false)}
        games={games}
        onPlaySound={(type) => {
          if (type === 'coin') playCoin();
          if (type === 'fanfare') playUnlock();
          if (type === 'powerup') playSelect();
        }}
      />

      {/* GESTIONNAIRE DE MUSIQUES & SCANNER AUTOMATIQUE DE DOSSIER */}
      <MusicManagerModal
        isOpen={isMusicManagerOpen}
        onClose={() => setIsMusicManagerOpen(false)}
        playlist={jukebox.playlist}
        onAddTrack={(track) => {
          jukebox.addTrack(track);
          showNotification(`Piste "${track.title}" ajoutée au Jukebox !`, 'success');
        }}
        onRemoveTrack={(trackId) => {
          jukebox.removeTrack(trackId);
          showNotification('Piste retirée.', 'info');
        }}
        onImportTracks={(tracks) => {
          jukebox.importTracks(tracks);
          showNotification(`${tracks.length} morceau(x) importé(s) avec succès !`, 'success');
        }}
        onResetPlaylist={() => {
          jukebox.resetPlaylist();
          showNotification('Playlist originale restaurée.', 'info');
        }}
        onSelectTrack={(index) => {
          jukebox.selectTrack(index);
        }}
        currentTrackId={jukebox.currentTrack?.id}
        onPlaySound={(type) => {
          if (type === 'coin') playCoin();
          if (type === 'fanfare') playUnlock();
          if (type === 'powerup') playSelect();
        }}
      />

      {/* MODULE CENTRALISÉ : RÉPERTOIRE PUBLIC (/public : ROMs, BIOS, Musiques, Thèmes, Émulateurs, Sauvegardes) */}
      <CentralizedStorageModal
        isOpen={isCentralizedStorageOpen}
        onClose={() => setIsCentralizedStorageOpen(false)}
        roms={centralizedRoms}
        biosList={centralizedBios}
        themes={centralizedThemes}
        emulators={centralizedCores}
        saves={centralizedSaves}
        currentThemeId={settings.uiTheme || 'neon-dark'}
        onSelectTheme={(themeId) => {
          setSettings((s) => ({ ...s, uiTheme: themeId as any }));
          showNotification(`Thème "${themeId}" activé depuis /public/themes/ !`, 'success');
        }}
        onLaunchRom={handleLaunchCentralizedRom}
        onImportRomToLibrary={handleImportRomToLibrary}
        onImportAllRomsToLibrary={handleImportAllRomsToLibrary}
        onPlaySound={(type) => {
          if (type === 'coin') playCoin();
          if (type === 'fanfare') playUnlock();
          if (type === 'powerup') playSelect();
        }}
      />

      {/* ATELIER & STUDIO DE THÈMES COMMUNAUTAIRES (DSL SIMPLIFIÉ, EXPORT/IMPORT, PRÉVISUALISATION LIVE) */}
      <CommunityThemeStudioModal
        isOpen={isCommunityThemeStudioOpen}
        onClose={() => setIsCommunityThemeStudioOpen(false)}
        onApplyTheme={handleApplyCommunityTheme}
        onPlaySound={(type) => {
          if (type === 'coin') playCoin();
          if (type === 'fanfare') playUnlock();
          if (type === 'powerup') playSelect();
        }}
      />

      {/* MODE ÉCRAN DE VEILLE / BORNE D'ARCADE "ATTRACT MODE" & BOÎTES 3D */}
      <RetroAttractModeModal
        isOpen={isAttractModeOpen}
        onClose={() => setIsAttractModeOpen(false)}
        games={games}
        onLaunchGame={(g) => {
          handleLaunchGame(g);
        }}
        onPlaySound={(type) => {
          if (type === 'coin') playCoin();
          if (type === 'fanfare') playUnlock();
          if (type === 'powerup') playSelect();
        }}
      />

      {/* CARNET DE MOTS DE PASSE CULTES & FICHES RÉTRO (JOYPAD / VMU) */}
      <RetroPasswordNotebookModal
        isOpen={isPasswordNotebookOpen}
        onClose={() => setIsPasswordNotebookOpen(false)}
        onPlaySound={(type) => {
          if (type === 'coin') playCoin();
          if (type === 'fanfare') playUnlock();
          if (type === 'powerup') playSelect();
        }}
      />

      {/* PASSERELLE RÉSEAU LOCAL (LAN) & SERVEUR WEB / FTP */}
      <LanNetworkManagerModal
        isOpen={isLanManagerOpen}
        onClose={() => setIsLanManagerOpen(false)}
        onAddGames={handleAddGames}
        onPlaySound={(type) => {
          if (type === 'coin') playCoin();
          if (type === 'fanfare') playUnlock();
          if (type === 'powerup') playSelect();
        }}
      />

      {/* SCANNER DE RÉPERTOIRE & AJOUT DE ROMS INTERACTIF */}
      {/* Lecteur d'émulation web (mode navigateur) */}
      {webEmulatorGame && (
        <WebEmulatorModal game={webEmulatorGame} onClose={() => setWebEmulatorGame(null)} />
      )}

      <RomScannerModal
        isOpen={isRomScannerOpen}
        onClose={() => setIsRomScannerOpen(false)}
        games={games}
        systems={systems}
        selectedSystemId={selectedSystemId}
        onGamesAdded={handleAddGames}
        onPlaySound={(type) => {
          if (type === 'coin') playCoin();
          if (type === 'powerup') playUnlock();
          if (type === 'select') playSelect();
        }}
      />

      {/* KIOSQUE SUR 2ÈME ÉCRAN & RÉTROPROJECTEUR (DUAL-DISPLAY CINEMA) */}
      <ProjectorKioskManagerModal
        isOpen={isProjectorModalOpen}
        onClose={() => setIsProjectorModalOpen(false)}
        games={games}
        systems={systems}
        isKioskActive={isKioskMode}
        onToggleKioskOnProjector={(enable) => {
          setIsProjectorKioskRunning(enable);
          if (enable) {
            showNotification('Mode Projection Kiosque activé pour le Rétroprojecteur !', 'success');
          } else {
            showNotification('Mode Projection déconnecté.', 'info');
          }
        }}
        onLaunchGame={(g) => {
          handleLaunchGame(g);
        }}
        onPlaySound={(type) => {
          if (type === 'coin') playCoin();
          if (type === 'fanfare') playUnlock();
          if (type === 'powerup') playSelect();
        }}
      />

      {/* MANUEL UTILISATEUR & GUIDE COMPLET DES FONCTIONNALITÉS (EXPORTABLE EN PDF / F1) */}
      <RetroManualPdfGuideModal
        isOpen={isUserManualPdfOpen}
        onClose={() => setIsUserManualPdfOpen(false)}
        onPlaySound={(type) => {
          if (type === 'coin') playCoin();
          if (type === 'fanfare') playUnlock();
          if (type === 'powerup') playSelect();
        }}
      />

      {/* 1. PROFILS DE SHADERS CRT & APERÇU IMMERSIF */}
      <RetroShaderProfilesModal
        isOpen={isShaderProfilesModalOpen}
        onClose={() => setIsShaderProfilesModalOpen(false)}
        currentProfile={(settings.crtShaderProfile as CrtShaderProfileId) || 'arcade-15khz'}
        onSelectProfile={(profileId) => {
          setSettings((prev) => ({
            ...prev,
            crtShaderProfile: profileId,
            crtEffect: profileId !== 'pure',
          }));
          showNotification(`Shader appliqué : ${profileId}`, 'success');
        }}
        crtEnabled={!!settings.crtEffect}
        onToggleCrt={handleToggleCrt}
        onPlaySound={() => playSelect()}
      />

      {/* 2. CHRONOMÈTRE SPEEDRUN ARCADE PRO (SPLITS & RECORDS) */}
      <ArcadeSpeedrunModal
        isOpen={isSpeedrunModalOpen}
        onClose={() => setIsSpeedrunModalOpen(false)}
        games={visibleGames}
        activeGame={visibleGames[focusedGameIndex] || null}
        onLaunchGame={(g) => handleLaunchGame(g)}
        onPlaySound={(type) => {
          if (type === 'split') playSelect();
          if (type === 'pb') playUnlock();
          if (type === 'click') playMove();
          if (type === 'reset') playBack();
        }}
      />

      {/* 3. ÉTAGÈRE 3D DE CARTOUCHES PHYSIQUES & INSPECTION */}
      <VirtualCartridgeShelfModal
        isOpen={isCartridgeShelfModalOpen}
        onClose={() => setIsCartridgeShelfModalOpen(false)}
        games={visibleGames}
        systems={systems}
        onLaunchGame={(g) => handleLaunchGame(g)}
        onPlaySound={(type) => {
          if (type === 'insert') playCoin();
          if (type === 'click') playMove();
          if (type === 'powerup') playUnlock();
        }}
      />

      {/* 4. HUB DE SYNCHRONISATION SAUVEGARDES & P2P MULTI-POSTES */}
      <SaveStateSyncModal
        isOpen={isSaveStateSyncModalOpen}
        onClose={() => setIsSaveStateSyncModalOpen(false)}
        games={visibleGames}
        onPlaySound={(type) => {
          if (type === 'sync') playSelect();
          if (type === 'click') playMove();
          if (type === 'success') playUnlock();
        }}
      />

      {/* 5. GUIDE DES RACCOURCIS ARCADE UNIVERSELS */}
      <ArcadeHotkeysGuideModal
        isOpen={isHotkeysGuideOpen}
        onClose={() => setIsHotkeysGuideOpen(false)}
      />

      {/* ASSISTANT DE DÉMARRAGE RAPIDE & PREMIER LANCEMENT (régie déverrouillée) */}
      {isAdminUnlocked && (
        <QuickStartOnboardingModal
          isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        settings={settings}
        onSaveSettings={(partial) => {
          setSettings((prev) => ({ ...prev, ...partial }));
        }}
        onSelectTab={(tab) => {
          if (tab === 'companies' || tab === 'museum') {
            setCurrentTab(tab === 'museum' ? 'companies' : tab);
          } else {
            setCurrentTab('games');
          }
        }}
        onEnterKiosk={handleEnterKiosk}
        sampleGamesCount={visibleGames.length}
          onPlaySound={(type) => {
            if (type === 'select') playSelect();
            if (type === 'coin') playCoin();
            if (type === 'move') playMove();
            if (type === 'launch') playUnlock();
            if (type === 'unlock') playUnlock();
          }}
        />
      )}
      </Suspense>
    </div>
  );
};

export default App;
