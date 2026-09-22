import { SYSTEMS } from '../../electron/data/systems';
import { COMPANIES } from '../../electron/data/companies';
import { BUILTIN_EMULATORS } from '../../electron/data/emulators';
import { ALL_BIOS_DEFINITIONS } from '../../electron/data/biosData';
import { AppSettings, BiosStatus, EmulatorProfile, ExtensionInfo, ExtensionProgress, Game } from '../types';

const STORAGE_KEY_SETTINGS = 'retromad_web_settings';
const STORAGE_KEY_GAMES = 'retromad_web_games';

const DEFAULT_SETTINGS: AppSettings = {
  romsDir: '~/RetroMad/Roms',
  biosDir: '~/RetroMad/Bios',
  retroarchPath: '/usr/bin/retroarch',
  retroarchCoresDir: '~/.config/retroarch/cores',
  scraperSource: 'both',
  language: 'fr',
  soundEnabled: true,
  soundVolume: 0.8,
  bgmEnabled: false,
  bgmVolume: 0.35,
  crtEffect: false,
  attractMode: true,
  attractDelaySeconds: 60,
  uiTheme: 'neon-dark',
  kioskMode: false,
  kioskPin: '1234',
  kioskFullscreen: false,
  kioskOnlyFavorites: false,
};

const INITIAL_DEMO_GAMES: Game[] = [
  {
    id: 'snes_smw',
    systemId: 'snes',
    title: 'Super Mario World (USA)',
    cleanTitle: 'Super Mario World',
    path: '~/RetroMad/Roms/snes/Super Mario World (USA).sfc',
    filename: 'Super Mario World (USA).sfc',
    extension: '.sfc',
    size: 524288,
    region: 'USA',
    favorite: true,
    playCount: 14,
    lastPlayed: '2026-09-21T18:30:00Z',
    playTimeMinutes: 185,
    metadata: {
      releaseDate: '1990-11-21',
      developer: 'Nintendo EAD',
      publisher: 'Nintendo',
      genres: ['Plates-formes', 'Aventure'],
      players: '1-2',
      rating: 94,
      synopsis: "Mario et Luigi explorent Dinosaur Land pour sauver la Princesse Peach des griffes de Bowser et rencontrent pour la première fois Yoshi le dinosaure.",
    },
    media: {
      boxart2d: 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Super_Nintendo_Entertainment_System/master/Named_Boxarts/Super%20Mario%20World%20(USA).png',
      snap: 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Super_Nintendo_Entertainment_System/master/Named_Snaps/Super%20Mario%20World%20(USA).png',
    },
  },
  {
    id: 'snes_zelda_alttp',
    systemId: 'snes',
    title: 'The Legend of Zelda - A Link to the Past (USA)',
    cleanTitle: 'The Legend of Zelda: A Link to the Past',
    path: '~/RetroMad/Roms/snes/The Legend of Zelda - A Link to the Past (USA).sfc',
    filename: 'The Legend of Zelda - A Link to the Past (USA).sfc',
    extension: '.sfc',
    size: 1048576,
    region: 'USA',
    favorite: true,
    playCount: 9,
    lastPlayed: '2026-09-20T21:15:00Z',
    playTimeMinutes: 240,
    metadata: {
      releaseDate: '1991-11-21',
      developer: 'Nintendo EAD',
      publisher: 'Nintendo',
      genres: ['Action-Aventure', 'Action-RPG'],
      players: '1',
      rating: 95,
      synopsis: "Link s'aventure à travers le Monde de la Lumière et le Monde des Ténèbres pour sauver Hyrule et défaire le maléfique sorcier Agahnim et Ganon.",
    },
    media: {
      boxart2d: 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Super_Nintendo_Entertainment_System/master/Named_Boxarts/Legend%20of%20Zelda%2C%20The%20-%20A%20Link%20to%20the%20Past%20(USA).png',
      snap: 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Super_Nintendo_Entertainment_System/master/Named_Snaps/Legend%20of%20Zelda%2C%20The%20-%20A%20Link%20to%20the%20Past%20(USA).png',
    },
  },
  {
    id: 'snes_chrono_trigger',
    systemId: 'snes',
    title: 'Chrono Trigger (USA)',
    cleanTitle: 'Chrono Trigger',
    path: '~/RetroMad/Roms/snes/Chrono Trigger (USA).sfc',
    filename: 'Chrono Trigger (USA).sfc',
    extension: '.sfc',
    size: 4194304,
    region: 'USA',
    favorite: true,
    playCount: 19,
    lastPlayed: '2026-09-22T08:00:00Z',
    playTimeMinutes: 420,
    metadata: {
      releaseDate: '1995-03-11',
      developer: 'Square',
      publisher: 'Square',
      genres: ['J-RPG', 'Aventure temporelle'],
      players: '1',
      rating: 96,
      synopsis: "Un chef-d'œuvre du RPG où Crono et ses compagnons voyagent à travers les âges pour empêcher la destruction de la planète par Lavos.",
    },
    media: {
      boxart2d: 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Super_Nintendo_Entertainment_System/master/Named_Boxarts/Chrono%20Trigger%20(USA).png',
    },
  },
  {
    id: 'md_sonic2',
    systemId: 'megadrive',
    title: 'Sonic The Hedgehog 2 (Europe) (En)',
    cleanTitle: 'Sonic The Hedgehog 2',
    path: '~/RetroMad/Roms/megadrive/Sonic The Hedgehog 2 (Europe).md',
    filename: 'Sonic The Hedgehog 2 (Europe).md',
    extension: '.md',
    size: 1048576,
    region: 'Europe',
    favorite: true,
    playCount: 11,
    lastPlayed: '2026-09-19T17:40:00Z',
    playTimeMinutes: 95,
    metadata: {
      releaseDate: '1992-11-21',
      developer: 'Sonic Team',
      publisher: 'Sega',
      genres: ['Plates-formes', 'Vitesse'],
      players: '1-2',
      rating: 92,
      synopsis: "Sonic et son nouvel acolyte Tails s'élancent à vive allure pour contrecarrer les plans de Dr. Robotnik et de son Death Egg.",
    },
    media: {
      boxart2d: 'https://raw.githubusercontent.com/libretro-thumbnails/Sega_-_Mega_Drive_-_Genesis/master/Named_Boxarts/Sonic%20The%20Hedgehog%202%20(Europe).png',
    },
  },
  {
    id: 'md_sor2',
    systemId: 'megadrive',
    title: 'Streets of Rage 2 (Europe)',
    cleanTitle: 'Streets of Rage 2',
    path: '~/RetroMad/Roms/megadrive/Streets of Rage 2 (Europe).md',
    filename: 'Streets of Rage 2 (Europe).md',
    extension: '.md',
    size: 2097152,
    region: 'Europe',
    favorite: false,
    playCount: 6,
    lastPlayed: '2026-09-17T14:10:00Z',
    playTimeMinutes: 70,
    metadata: {
      releaseDate: '1992-12-20',
      developer: 'Ancient / Sega',
      publisher: 'Sega',
      genres: ['Beat them up', 'Action'],
      players: '1-2',
      rating: 93,
      synopsis: "Axel, Blaze, Skate et Max nettoient les rues dominées par le syndicat criminel de Mr. X, au rythme d'une bande-son légendaire de Yuzo Koshiro.",
    },
    media: {
      boxart2d: 'https://raw.githubusercontent.com/libretro-thumbnails/Sega_-_Mega_Drive_-_Genesis/master/Named_Boxarts/Streets%20of%20Rage%20II%20(Europe).png',
    },
  },
  {
    id: 'psx_sotn',
    systemId: 'psx',
    title: 'Castlevania - Symphony of the Night (USA)',
    cleanTitle: 'Castlevania: Symphony of the Night',
    path: '~/RetroMad/Roms/psx/Castlevania - Symphony of the Night (USA).chd',
    filename: 'Castlevania - Symphony of the Night (USA).chd',
    extension: '.chd',
    size: 367001600,
    region: 'USA',
    favorite: true,
    playCount: 22,
    lastPlayed: '2026-09-22T10:15:00Z',
    playTimeMinutes: 520,
    metadata: {
      releaseDate: '1997-10-02',
      developer: 'Konami',
      publisher: 'Konami',
      genres: ['Metroidvania', 'Action-RPG'],
      players: '1',
      rating: 94,
      synopsis: "Alucard, fils de Dracula, s'éveille pour explorer le château démoniaque inversé et lever le voile sur la disparition de Richter Belmont.",
    },
    media: {
      boxart2d: 'https://raw.githubusercontent.com/libretro-thumbnails/Sony_-_PlayStation/master/Named_Boxarts/Castlevania%20-%20Symphony%20of%20the%20Night%20(USA).png',
    },
  },
  {
    id: 'psx_mgs',
    systemId: 'psx',
    title: 'Metal Gear Solid (USA)',
    cleanTitle: 'Metal Gear Solid',
    path: '~/RetroMad/Roms/psx/Metal Gear Solid (USA).chd',
    filename: 'Metal Gear Solid (USA).chd',
    extension: '.chd',
    size: 471859200,
    region: 'USA',
    favorite: true,
    playCount: 15,
    lastPlayed: '2026-09-18T22:30:00Z',
    playTimeMinutes: 380,
    metadata: {
      releaseDate: '1998-10-21',
      developer: 'Konami Computer Entertainment Japan',
      publisher: 'Konami',
      genres: ['Infiltration', 'Cinématique'],
      players: '1',
      rating: 94,
      synopsis: "Solid Snake s'infiltre sur l'île de Shadow Moses en Alaska pour neutraliser les terroristes de FOXHOUND et empêcher une frappe nucléaire.",
    },
    media: {
      boxart2d: 'https://raw.githubusercontent.com/libretro-thumbnails/Sony_-_PlayStation/master/Named_Boxarts/Metal%20Gear%20Solid%20(USA).png',
    },
  },
  {
    id: 'n64_sm64',
    systemId: 'n64',
    title: 'Super Mario 64 (USA)',
    cleanTitle: 'Super Mario 64',
    path: '~/RetroMad/Roms/n64/Super Mario 64 (USA).z64',
    filename: 'Super Mario 64 (USA).z64',
    extension: '.z64',
    size: 8388608,
    region: 'USA',
    favorite: true,
    playCount: 8,
    lastPlayed: '2026-09-16T15:20:00Z',
    playTimeMinutes: 190,
    metadata: {
      releaseDate: '1996-09-29',
      developer: 'Nintendo EAD',
      publisher: 'Nintendo',
      genres: ['Plates-formes 3D'],
      players: '1',
      rating: 96,
      synopsis: "La révolution de la 3D dans le jeu vidéo : sautez à travers les tableaux du château de la Princesse Peach pour collecter les 120 Étoiles de Puissance.",
    },
    media: {
      boxart2d: 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_64/master/Named_Boxarts/Super%20Mario%2064%20(USA).png',
    },
  },
  {
    id: 'arcade_mslug',
    systemId: 'arcade',
    title: 'Metal Slug - Super Vehicle-001 (World)',
    cleanTitle: 'Metal Slug',
    path: '~/RetroMad/Roms/arcade/mslug.zip',
    filename: 'mslug.zip',
    extension: '.zip',
    size: 14680064,
    region: 'World',
    favorite: false,
    playCount: 12,
    lastPlayed: '2026-09-21T19:45:00Z',
    playTimeMinutes: 110,
    metadata: {
      releaseDate: '1996-04-19',
      developer: 'Nazca Corporation',
      publisher: 'SNK',
      genres: ['Run and Gun', 'Arcade'],
      players: '1-2',
      rating: 91,
      synopsis: "Un festival frénétique d'action 2D pixel art et d'humour militaire aux commandes du char SV-001 face à l'armée du Général Morden.",
    },
    media: {
      boxart2d: 'https://raw.githubusercontent.com/libretro-thumbnails/FBNeo_-_Arcade_Games/master/Named_Boxarts/mslug.png',
    },
  },
  {
    id: 'gba_poke_emerald',
    systemId: 'gba',
    title: 'Pokemon - Emerald Version (USA, Europe)',
    cleanTitle: 'Pokémon Émeraude',
    path: '~/RetroMad/Roms/gba/Pokemon - Emerald Version (USA, Europe).gba',
    filename: 'Pokemon - Emerald Version (USA, Europe).gba',
    extension: '.gba',
    size: 16777216,
    region: 'USA',
    favorite: true,
    playCount: 16,
    lastPlayed: '2026-09-20T12:00:00Z',
    playTimeMinutes: 630,
    metadata: {
      releaseDate: '2004-09-16',
      developer: 'Game Freak',
      publisher: 'Nintendo / The Pokémon Company',
      genres: ['RPG', 'Capture de créatures'],
      players: '1-4',
      rating: 89,
      synopsis: "Explorez la région d'Hoenn, apaisez le conflit titanesque entre Groudon et Kyogre grâce au légendaire Rayquaza, et dominez la Zone de Combat.",
    },
    media: {
      boxart2d: 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Game_Boy_Advance/master/Named_Boxarts/Pokemon%20-%20Emerald%20Version%20(USA%2C%20Europe).png',
    },
  },
];

export function createWebApi() {
  const scanListeners = new Set<(data: { count: number; file: string }) => void>();
  const scrapeListeners = new Set<(data: any) => void>();
  const extensionListeners = new Set<(data: ExtensionProgress) => void>();

  function loadSettings(): AppSettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return { ...DEFAULT_SETTINGS };
  }

  function saveSettings(settings: Partial<AppSettings>): AppSettings {
    const current = loadSettings();
    const updated = { ...current, ...settings };
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    } catch {
      // Fallback
    }
    return updated;
  }

  function loadGames(): Game[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GAMES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    // Seed initial demo games
    try {
      localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(INITIAL_DEMO_GAMES));
    } catch {
      // Fallback
    }
    return [...INITIAL_DEMO_GAMES];
  }

  function saveGames(games: Game[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(games));
      return true;
    } catch {
      return false;
    }
  }

  return {
    getSettings: async (): Promise<AppSettings> => {
      return loadSettings();
    },

    saveSettings: async (settings: Partial<AppSettings>): Promise<AppSettings> => {
      return saveSettings(settings);
    },

    selectDirectory: async (): Promise<string | null> => {
      return '~/RetroMad/Roms';
    },

    getSystems: async () => {
      return SYSTEMS;
    },

    getCompanies: async () => {
      return COMPANIES;
    },

    getGames: async (): Promise<Game[]> => {
      return loadGames();
    },

    saveGames: async (games: Game[]): Promise<boolean> => {
      return saveGames(games);
    },

    toggleFavorite: async (gameId: string): Promise<boolean> => {
      const current = loadGames();
      const updated = current.map((g) => (g.id === gameId ? { ...g, favorite: !g.favorite } : g));
      saveGames(updated);
      return true;
    },

    scanRoms: async (): Promise<Game[]> => {
      const existing = loadGames();
      const simulatedPaths = [
        '~/RetroMad/Roms/snes/Super Mario World (USA).sfc',
        '~/RetroMad/Roms/snes/The Legend of Zelda - A Link to the Past (USA).sfc',
        '~/RetroMad/Roms/megadrive/Sonic The Hedgehog 2 (Europe).md',
        '~/RetroMad/Roms/psx/Castlevania - Symphony of the Night (USA).chd',
        '~/RetroMad/Roms/n64/Super Mario 64 (USA).z64',
        '~/RetroMad/Roms/gba/Pokemon - Emerald Version (USA, Europe).gba',
      ];

      for (let i = 0; i < simulatedPaths.length; i++) {
        await new Promise((r) => setTimeout(r, 120));
        scanListeners.forEach((fn) => fn({ count: i + 1, file: simulatedPaths[i] }));
      }

      return existing.length > 0 ? existing : INITIAL_DEMO_GAMES;
    },

    onScanProgress: (callback: (data: { count: number; file: string }) => void) => {
      scanListeners.add(callback);
      return () => {
        scanListeners.delete(callback);
      };
    },

    scrapeGame: async (game: Game): Promise<Game> => {
      await new Promise((r) => setTimeout(r, 350));
      const current = loadGames();
      const updatedGame: Game = {
        ...game,
        metadata: {
          ...game.metadata,
          rating: game.metadata?.rating || 90,
          players: game.metadata?.players || '1-2',
          synopsis: game.metadata?.synopsis || `Classique incontournable du catalogue ${game.systemId.toUpperCase()}.`,
        },
      };
      const updatedList = current.map((g) => (g.id === game.id ? updatedGame : g));
      saveGames(updatedList);
      return updatedGame;
    },

    scrapeAll: async (): Promise<Game[]> => {
      const current = loadGames();
      const total = current.length;

      for (let i = 0; i < total; i++) {
        await new Promise((r) => setTimeout(r, 200));
        const item = current[i];
        scrapeListeners.forEach((fn) =>
          fn({
            total,
            current: i + 1,
            currentGameTitle: item.cleanTitle,
          })
        );
      }

      return current;
    },

    onScrapeProgress: (callback: (data: any) => void) => {
      scrapeListeners.add(callback);
      return () => {
        scrapeListeners.delete(callback);
      };
    },

    checkBios: async (): Promise<BiosStatus[]> => {
      // Construction des statuts pour chaque BIOS référencé
      const statuses: BiosStatus[] = ALL_BIOS_DEFINITIONS.map((def, idx) => {
        // Simuler certains BIOS présents (les plus courants) et quelques-uns manquants
        const isCommon = ['psx', 'gba', 'neogeo', 'snes', 'megadrive', 'genesis', 'arcade'].includes(def.systemId);
        const found = isCommon || idx % 2 === 0;
        return {
          systemId: def.systemId,
          systemName: def.systemName,
          filename: def.filename,
          description: def.description,
          expectedMd5: def.md5,
          found,
          actualMd5: found ? def.md5 : undefined,
          md5Match: found,
          path: found ? `~/RetroMad/Bios/${def.filename}` : undefined,
          optional: def.optional ?? false,
        };
      });
      return statuses;
    },

    launchGame: async (game: Game, emulatorId?: string): Promise<{ success: boolean; message: string }> => {
      // Mettre à jour le playCount et lastPlayed
      const games = loadGames();
      const updated = games.map((g) => {
        if (g.id === game.id) {
          return {
            ...g,
            playCount: (g.playCount || 0) + 1,
            lastPlayed: new Date().toISOString(),
            playTimeMinutes: (g.playTimeMinutes || 0) + 15,
          };
        }
        return g;
      });
      saveGames(updated);

      return {
        success: true,
        message: `Simulation de lancement réussie pour "${game.cleanTitle}" (Émulateur : ${emulatorId || 'RetroArch'}) 🎮`,
      };
    },

    getEmulators: async (): Promise<EmulatorProfile[]> => {
      return BUILTIN_EMULATORS;
    },

    detectEmulators: async (): Promise<EmulatorProfile[]> => {
      return BUILTIN_EMULATORS.map((e) => ({
        ...e,
        isDetected: true,
        detectedPath: e.executableLinux,
      }));
    },

    listExtensions: async (): Promise<ExtensionInfo[]> => {
      return SYSTEMS.map((s, idx) => ({
        id: s.id,
        name: `${s.name} (${s.defaultCoreLinux || 'Libretro'})`,
        coreName: s.defaultCoreLinux || `${s.id}_libretro`,
        systemName: s.name,
        isInstalled: idx < 12, // Premières consoles installées
        extensions: s.extensions,
      }));
    },

    installAllExtensions: async (): Promise<{ success: number; failed: number; total: number }> => {
      const total = SYSTEMS.length;
      for (let i = 0; i < total; i++) {
        const sys = SYSTEMS[i];
        await new Promise((r) => setTimeout(r, 60));
        extensionListeners.forEach((fn) =>
          fn({
            total,
            current: i + 1,
            currentItem: sys.name,
            percent: Math.round(((i + 1) / total) * 100),
            status: i + 1 === total ? 'complete' : 'downloading',
            message: `Téléchargement du cœur ${sys.defaultCoreLinux || sys.id}...`,
          })
        );
      }
      return { success: total, failed: 0, total };
    },

    installExtension: async (coreName: string): Promise<boolean> => {
      const steps: ExtensionProgress['status'][] = ['downloading', 'extracting', 'configuring', 'complete'];
      for (let i = 0; i < steps.length; i++) {
        await new Promise((r) => setTimeout(r, 150));
        extensionListeners.forEach((fn) =>
          fn({
            total: 1,
            current: 1,
            currentItem: coreName,
            percent: (i + 1) * 25,
            status: steps[i],
            message: `Installation de ${coreName} (${steps[i]})...`,
          })
        );
      }
      return true;
    },

    createRomsFolders: async (): Promise<{ created: number; total: number }> => {
      return { created: SYSTEMS.length, total: SYSTEMS.length };
    },

    onExtensionProgress: (callback: (data: ExtensionProgress) => void) => {
      extensionListeners.add(callback);
      return () => {
        extensionListeners.delete(callback);
      };
    },

    setKioskMode: async (enabled: boolean): Promise<boolean> => {
      saveSettings({ kioskMode: enabled });
      return true;
    },

    minimizeWindow: () => {},
    maximizeWindow: () => {},
    closeWindow: () => {},
  };
}

export function setupWebApi(): void {
  if (typeof window !== 'undefined') {
    if (!window.api) {
      window.api = createWebApi() as any;
    }
  }
}
