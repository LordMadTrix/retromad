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
import { SettingsModal } from './components/SettingsModal';
import { ScraperModal } from './components/ScraperModal';
import { ExtensionsDownloaderModal } from './components/ExtensionsDownloaderModal';
import { KioskPinModal } from './components/KioskPinModal';
import { KioskArcadeView } from './components/KioskArcadeView';
import { ConsoleExhibitionModal } from './components/ConsoleExhibitionModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { KioskAttractMode } from './components/KioskAttractMode';
import { GamepadHint } from './components/GamepadHint';
import { useGamepad } from './hooks/useGamepad';
import { useAudio } from './hooks/useAudio';

export const App: React.FC = () => {
  // Navigation & Vues
  const [currentTab, setCurrentTab] = useState<NavTab>('games');
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
            bgmActive={isBgmActive}
            onToggleBgm={handleToggleBgm}
            totalGames={visibleGames.length}
            isKioskMode={isKioskMode}
            onEnterKiosk={handleEnterKiosk}
            onUnlockKiosk={() => setIsPinModalOpen(true)}
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
            <SettingsModal
              settings={settings}
              emulators={emulators}
              onClose={() => setCurrentTab('games')}
              onSave={handleSaveSettings}
              onSelectDirectory={async () => {
                if (window.api) return window.api.selectDirectory();
                return null;
              }}
              onOpenExtensions={() => {
                playSelect();
                setIsExtensionsModalOpen(true);
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
        isScraping={isScrapingBatch}
      />

      {/* Modale Paramètres (si déclenchée en superposition) */}
      {!isKioskMode && isSettingsOpen && (
        <SettingsModal
          settings={settings}
          emulators={emulators}
          onClose={() => {
            playBack();
            setIsSettingsOpen(false);
          }}
          onSave={handleSaveSettings}
          onSelectDirectory={async () => {
            if (window.api) return window.api.selectDirectory();
            return null;
          }}
          onOpenExtensions={() => {
            playSelect();
            setIsExtensionsModalOpen(true);
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
      />

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
    </div>
  );
};

export default App;
