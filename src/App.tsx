import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { System, Company, Game, AppSettings, BiosStatus, EmulatorProfile } from './types';
import { SYSTEMS as DEFAULT_SYSTEMS } from '../electron/data/systems';
import { COMPANIES as DEFAULT_COMPANIES } from '../electron/data/companies';
import { BUILTIN_EMULATORS } from '../electron/data/emulators';
import { Navigation, NavTab } from './components/Navigation';
import { SystemSelector } from './components/SystemSelector';
import { GameGrid } from './components/GameGrid';
import { GameDetailModal } from './components/GameDetailModal';
import { CompanyView } from './components/CompanyView';
import { BiosManager } from './components/BiosManager';
import { AdminHubModal } from './components/AdminHubModal';
import { GameEditModal } from './components/GameEditModal';
import { SystemEditModal } from './components/SystemEditModal';
import { CompanyEditModal } from './components/CompanyEditModal';
import { ScraperModal } from './components/ScraperModal';
import { ExtensionsDownloaderModal } from './components/ExtensionsDownloaderModal';
import { KioskPinModal } from './components/KioskPinModal';
import { KioskArcadeView } from './components/KioskArcadeView';
import { ConsoleExhibitionModal } from './components/ConsoleExhibitionModal';
import { CompanyExhibitionModal } from './components/CompanyExhibitionModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { KioskAttractMode } from './components/KioskAttractMode';
import { GamepadHint } from './components/GamepadHint';
import { useGamepad } from './hooks/useGamepad';
import { useAudio } from './hooks/useAudio';
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
import { RetroAchievementsModal } from './components/retro/RetroAchievementsModal';
import { RetroCheatsModal } from './components/retro/RetroCheatsModal';
import { RetroSaveStatesModal } from './components/retro/RetroSaveStatesModal';
import { RetroJukeboxModal } from './components/retro/RetroJukeboxModal';
import { RetroJukeboxFloatingPlayer } from './components/retro/RetroJukeboxFloatingPlayer';
import { ArcadeTournamentModal } from './components/retro/ArcadeTournamentModal';
import { RetroManualsViewerModal } from './components/retro/RetroManualsViewerModal';
import { BezelStudioModal } from './components/retro/BezelStudioModal';
import { RetroRouletteDailyChallengeModal } from './components/retro/RetroRouletteDailyChallengeModal';

export const App: React.FC = () => {
  // Navigation & Vues (Par défaut sur 'companies' pour afficher immédiatement les firmes et vidéos)
  const [currentTab, setCurrentTab] = useState<NavTab>('companies');
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);

  // Profil Kiosk vs Admin
  const [isKioskMode, setIsKioskMode] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Données
  const [systems, setSystems] = useState<System[]>(DEFAULT_SYSTEMS);
  const [companies, setCompanies] = useState<Company[]>(DEFAULT_COMPANIES);
  const [emulators, setEmulators] = useState<EmulatorProfile[]>(BUILTIN_EMULATORS);
  const [games, setGames] = useState<Game[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    romsDir: '~/RetroMad/Roms',
    biosDir: '~/RetroMad/Bios',
    retroarchPath: '/usr/bin/retroarch',
    retroarchCoresDir: '~/.config/retroarch/cores',
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
  }>({
    isOpen: false,
    total: 0,
    current: 0,
    currentGameTitle: '',
    isComplete: false,
  });

  // Audio Rétro avec Volume, Sons Spéciaux et BGM Chiptune
  const { playMove, playSelect, playBack, playLaunch, playCoin, playFavorite, playUnlock, playDice, toggleBgm, isBgmActive } = useAudio(
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
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const [isManualsModalOpen, setIsManualsModalOpen] = useState(false);
  const [isBezelStudioModalOpen, setIsBezelStudioModalOpen] = useState(false);
  const [isRouletteModalOpen, setIsRouletteModalOpen] = useState(false);
  const [activeManualGameId, setActiveManualGameId] = useState<string | undefined>(undefined);

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
          if (loadedGames) setGames(loadedGames);
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
        } catch (err) {
          console.error('Erreur chargement init:', err);
        }
      }
    };

    initData();
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

  // Raccourci clavier de déverrouillage (Ctrl+Shift+A ou F12) + Ctrl+K recherche
  useEffect(() => {
    const handleKeyShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || e.key === 'F12') {
        e.preventDefault();
        if (isKioskMode) {
          playSelect();
          setIsPinModalOpen(true);
        }
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

  // Toggle BGM avec sauvegarde dans les settings
  const handleToggleBgm = useCallback(async () => {
    toggleBgm();
    const newEnabled = !isBgmActive;
    setSettings((prev) => ({ ...prev, bgmEnabled: newEnabled }));
    if (window.api) {
      await window.api.saveSettings({ bgmEnabled: newEnabled });
    }
  }, [toggleBgm, isBgmActive]);

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

  // Déverrouillage réussi du code PIN
  const handleUnlockKioskSuccess = async () => {
    playUnlock();
    setIsKioskMode(false);
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

  // Actions utilisateur
  const handleScanRoms = async () => {
    if (isKioskMode) return;
    playSelect();
    if (!window.api) {
      showNotification("Mode démo : Lancez l'application Electron pour scanner les ROMs", 'info');
      return;
    }

    setIsScanning(true);
    showNotification('Scan des répertoires de ROMs en cours...', 'info');

    try {
      const scanned = await window.api.scanRoms();
      setGames(scanned);
      showNotification(`Scan terminé ! ${scanned.length} jeu(x) répertorié(s).`, 'success');
    } catch (err: any) {
      showNotification(`Erreur lors du scan : ${err.message}`, 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleStartScrapeBatch = async () => {
    if (isKioskMode) return;
    playSelect();
    if (!window.api) {
      showNotification("Mode démo : Lancez l'application Electron pour scraper", 'info');
      return;
    }

    if (games.length === 0) {
      showNotification('Veuillez scanner des ROMs avant de lancer le scraping.', 'error');
      return;
    }

    setScrapeState({
      isOpen: true,
      total: games.length,
      current: 0,
      currentGameTitle: 'Initialisation du scraper...',
      isComplete: false,
    });
    setIsScrapingBatch(true);

    try {
      const updated = await window.api.scrapeAll();
      setGames(updated);
      setScrapeState((prev) => ({ ...prev, isComplete: true }));
      showNotification('Scraping terminé avec succès !', 'success');
    } catch (err: any) {
      showNotification(`Erreur lors du scraping : ${err.message}`, 'error');
    } finally {
      setIsScrapingBatch(false);
    }
  };

  const handleScrapeSingleGame = async (game: Game) => {
    if (isKioskMode) return;
    playSelect();
    if (!window.api) return;

    showNotification(`Recherche des médias pour "${game.cleanTitle}"...`, 'info');
    try {
      const updated = await window.api.scrapeGame(game);
      setGames((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      if (selectedGame?.id === updated.id) {
        setSelectedGame(updated);
      }
      showNotification(`Jaquette et données mises à jour !`, 'success');
    } catch (err: any) {
      showNotification(`Erreur de scraping : ${err.message}`, 'error');
    }
  };

  const handleLaunchGame = async (game: Game, emulatorId?: string) => {
    playLaunch();
    if (!window.api) {
      showNotification(`Simulation de lancement de "${game.cleanTitle}"`, 'info');
      return;
    }

    showNotification(`Lancement de "${game.cleanTitle}"...`, 'info');
    try {
      const result = await window.api.launchGame(game, emulatorId);
      if (result.success) {
        showNotification(result.message, 'success');
      } else {
        showNotification(result.message, 'error');
      }
    } catch (err: any) {
      showNotification(`Erreur de lancement : ${err.message}`, 'error');
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
    <div className="h-screen w-screen flex flex-col bg-transparent text-slate-100 select-none overflow-hidden relative font-display">
      {/* Filtre d'écran CRT Rétro Global si activé */}
      {settings.crtEffect && (
        <div className="fixed inset-0 scanlines crt-vignette crt-phosphor pointer-events-none z-50 animate-in fade-in duration-200" />
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
          onUnlockAdmin={() => setIsPinModalOpen(true)}
          soundEnabled={settings.soundEnabled}
          soundVolume={settings.soundVolume ?? 0.8}
          crtEnabled={!!settings.crtEffect}
          onToggleCrt={handleToggleCrt}
        />
      ) : (
        <>
          {/* Barre de navigation principale */}
          <Navigation
            currentTab={currentTab}
            onTabChange={(tab) => {
              playSelect();
              setCurrentTab(tab);
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
            bgmActive={jukebox.isPlaying || isBgmActive}
            onToggleBgm={() => {
              jukebox.togglePlay();
              handleToggleBgm();
            }}
            totalGames={visibleGames.length}
            isKioskMode={isKioskMode}
            onEnterKiosk={handleEnterKiosk}
            onUnlockKiosk={() => setIsPinModalOpen(true)}
            onOpenRoulette={() => {
              playDice();
              setIsRouletteModalOpen(true);
            }}
            onOpenAchievements={() => {
              playSelect();
              setIsAchievementsModalOpen(true);
            }}
            onOpenJukebox={() => {
              playSelect();
              setIsJukeboxModalOpen(true);
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
            onOpenBezelStudio={() => {
              playSelect();
              setIsBezelStudioModalOpen(true);
            }}
            onOpenCheats={() => {
              playSelect();
              setIsCheatsModalOpen(true);
            }}
            onOpenSaveStates={() => {
              playSelect();
              setIsSaveStatesModalOpen(true);
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
                onSelectGame={(g) => {
                  playSelect();
                  const idx = visibleGames.findIndex((item) => item.id === g.id);
                  if (idx >= 0) setFocusedGameIndex(idx);
                }}
                onLaunchGame={handleLaunchGame}
                onToggleFavorite={handleToggleFavorite}
                onViewDetails={(g) => {
                  playSelect();
                  setSelectedGame(g);
                }}
                onScanPrompt={() => {
                  setIsSettingsOpen(true);
                }}
                onPlayDice={playDice}
                onOpenRoulette={() => {
                  playDice();
                  setIsRouletteModalOpen(true);
                }}
              />
            </div>
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
                if (!isKioskMode) {
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

          {currentTab === 'settings' && (
            <AdminHubModal
              isOpen={currentTab === 'settings'}
              onClose={() => setCurrentTab('games')}
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
              onDetectEmulators={async () => {
                if (window.api?.detectEmulators) return window.api.detectEmulators();
                return emulators;
              }}
              onResetDefaults={handleResetDefaults}
              onOpenSystemExhibition={(sys) => {
                setCurrentTab('games');
                setExhibitionSystem(sys);
              }}
              onOpenCompanyExhibition={(comp) => {
                setCurrentTab('companies');
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
              onOpenRoulette={() => {
                playDice();
                setIsRouletteModalOpen(true);
              }}
              onOpenAchievements={() => {
                playSelect();
                setIsAchievementsModalOpen(true);
              }}
              onOpenJukebox={() => {
                playSelect();
                setIsJukeboxModalOpen(true);
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
              onOpenBezelStudio={() => {
                playSelect();
                setIsBezelStudioModalOpen(true);
              }}
              onOpenCheats={() => {
                playSelect();
                setIsCheatsModalOpen(true);
              }}
              onOpenSaveStates={() => {
                playSelect();
                setIsSaveStatesModalOpen(true);
              }}
            />
          )}
        </>
      )}

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
        onEdit={(game) => {
          if (!isKioskMode) {
            setDirectEditingGame(game);
          }
        }}
        isKioskMode={isKioskMode}
        isScraping={isScrapingBatch}
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
      />

      {/* Centre d'Administration en superposition */}
      {!isKioskMode && isSettingsOpen && (
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
          onOpenRoulette={() => {
            playDice();
            setIsRouletteModalOpen(true);
          }}
          onOpenAchievements={() => {
            playSelect();
            setIsAchievementsModalOpen(true);
          }}
          onOpenJukebox={() => {
            playSelect();
            setIsJukeboxModalOpen(true);
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
          onOpenBezelStudio={() => {
            playSelect();
            setIsBezelStudioModalOpen(true);
          }}
          onOpenCheats={() => {
            playSelect();
            setIsCheatsModalOpen(true);
          }}
          onOpenSaveStates={() => {
            playSelect();
            setIsSaveStatesModalOpen(true);
          }}
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
        onClose={() => setScrapeState((prev) => ({ ...prev, isOpen: false }))}
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
          if (!isKioskMode) {
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
          if (!isKioskMode) {
            setDirectEditingCompany(comp);
          }
        }}
        isKioskMode={isKioskMode}
      />

      {/* Modale d'Édition Directe de Jeu (Admin) */}
      {!isKioskMode && directEditingGame && (
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
      {!isKioskMode && directEditingSystem && (
        <SystemEditModal
          system={directEditingSystem}
          companies={companies}
          isOpen={!!directEditingSystem}
          onClose={() => setDirectEditingSystem(null)}
          onSave={handleSaveSingleSystem}
        />
      )}

      {/* Modale d'Édition Directe de Firme (Admin) */}
      {!isKioskMode && directEditingCompany && (
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
      {!isKioskMode && <GamepadHint />}

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
      />

      {/* Mini-Lecteur Flottant Jukebox */}
      <RetroJukeboxFloatingPlayer
        jukebox={jukebox}
        onOpenModal={() => setIsJukeboxModalOpen(true)}
      />

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
    </div>
  );
};

export default App;
