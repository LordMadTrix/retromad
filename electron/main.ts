import { app, BrowserWindow, ipcMain, dialog, protocol, net } from 'electron';
import path from 'path';
import { storage } from './services/storage';
import { scanner } from './services/scanner';
import { scraper } from './services/scraper';
import { biosChecker } from './services/biosChecker';
import { launcher, BUILTIN_EMULATORS } from './services/launcher';
import { SYSTEMS } from './data/systems';
import { COMPANIES } from './data/companies';
import { extensionInstaller } from './services/extensionInstaller';
import { Game } from './types';

// Enregistrer le schéma personnalisé de protocole pour les médias locaux
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'retromad-media',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      bypassCSP: true,
    },
  },
]);

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: '#0b0d14',
    title: 'RetroMad - Frontend Retrogaming',
    frame: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const distIndexPath = path.join(__dirname, '../dist/index.html');
  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production' && !process.env.ELECTRON_FORCE_PROD;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      console.log('[RetroMad] Basculement automatique sur le bundle dist/index.html...');
      mainWindow?.loadFile(distIndexPath);
    });

    mainWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription, validatedURL) => {
      if (validatedURL.includes('localhost:5173')) {
        console.log('[RetroMad] Serveur Vite injoignable, chargement local du bundle...');
        mainWindow?.loadFile(distIndexPath);
      }
    });
  } else {
    mainWindow.loadFile(distIndexPath);
  }

  const initialSettings = storage.getSettings();
  if (initialSettings.kioskMode && initialSettings.kioskFullscreen) {
    mainWindow.setKiosk(true);
    mainWindow.setFullScreen(true);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Protocole pour charger les images mises en cache localement
  protocol.handle('retromad-media', (request) => {
    const parsed = new URL(request.url);
    // Ex: retromad-media://media/boxarts/xxx.png
    const relativePath = parsed.pathname.replace(/^\//, '');
    const fullPath = path.join(storage.getDataDir(), relativePath);
    return net.fetch(`file://${fullPath}`);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ==========================================
// IPC HANDLERS
// ==========================================

ipcMain.handle('get-settings', async () => {
  return storage.getSettings();
});

ipcMain.handle('save-settings', async (_, newSettings) => {
  return storage.saveSettings(newSettings);
});

ipcMain.handle('select-directory', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

ipcMain.handle('get-systems', async () => {
  return storage.getSystems();
});

ipcMain.handle('save-systems', async (_, systems) => {
  return storage.saveSystems(systems);
});

ipcMain.handle('get-companies', async () => {
  return storage.getCompanies();
});

ipcMain.handle('save-companies', async (_, companies) => {
  return storage.saveCompanies(companies);
});

ipcMain.handle('get-games', async () => {
  return storage.getGames();
});

ipcMain.handle('save-games', async (_, games: Game[]) => {
  storage.saveGames(games);
  return true;
});

ipcMain.handle('toggle-favorite', async (_, gameId: string) => {
  const games = storage.getGames();
  const game = games.find((g) => g.id === gameId);
  if (game) {
    game.favorite = !game.favorite;
    storage.saveGames(games);
    return game.favorite;
  }
  return false;
});

ipcMain.handle('scan-roms', async () => {
  const settings = storage.getSettings();
  const existingGames = storage.getGames();
  const existingMap = new Map(existingGames.map((g) => [g.path, g]));

  const scannedGames = await scanner.scanDirectory(settings.romsDir, (count, file) => {
    if (mainWindow) {
      mainWindow.webContents.send('scan-progress', { count, file });
    }
  });

  // Conserver les métadonnées et favoris déjà existants
  const mergedGames: Game[] = scannedGames.map((newGame) => {
    const existing = existingMap.get(newGame.path);
    if (existing) {
      return {
        ...newGame,
        favorite: existing.favorite,
        playCount: existing.playCount || 0,
        lastPlayed: existing.lastPlayed,
        metadata: { ...newGame.metadata, ...existing.metadata },
        media: { ...newGame.media, ...existing.media },
      };
    }
    return newGame;
  });

  storage.saveGames(mergedGames);
  return mergedGames;
});

ipcMain.handle('scrape-game', async (_, game: Game) => {
  const updated = await scraper.scrapeGame(game);
  const games = storage.getGames();
  const idx = games.findIndex((g) => g.id === updated.id);
  if (idx >= 0) {
    games[idx] = updated;
    storage.saveGames(games);
  }
  return updated;
});

ipcMain.handle('scrape-all', async () => {
  const games = storage.getGames();
  const total = games.length;
  const updatedGames: Game[] = [];

  for (let i = 0; i < total; i++) {
    const game = games[i];
    if (mainWindow) {
      mainWindow.webContents.send('scrape-progress', {
        total,
        current: i + 1,
        currentGameTitle: game.cleanTitle,
        systemId: game.systemId,
      });
    }

    try {
      const updated = await scraper.scrapeGame(game);
      updatedGames.push(updated);
    } catch (e) {
      console.error(`Erreur scrape pour ${game.title}:`, e);
      updatedGames.push(game);
    }
  }

  storage.saveGames(updatedGames);
  return updatedGames;
});

ipcMain.handle('check-bios', async () => {
  const settings = storage.getSettings();
  return biosChecker.checkBiosDirectory(settings.biosDir);
});

ipcMain.handle('launch-game', async (_, game: Game, emulatorId?: string) => {
  return launcher.launchGame(game, emulatorId);
});

ipcMain.handle('get-emulators', async () => {
  return storage.getEmulators();
});

ipcMain.handle('save-emulators', async (_, emulators) => {
  return storage.saveEmulators(emulators);
});

ipcMain.handle('detect-emulators', async () => {
  return launcher.detectInstalledEmulators();
});

ipcMain.handle('list-extensions', async () => {
  return extensionInstaller.listExtensions();
});

ipcMain.handle('install-all-extensions', async () => {
  return extensionInstaller.installAllExtensions((progress) => {
    if (mainWindow) {
      mainWindow.webContents.send('extension-progress', progress);
    }
  });
});

ipcMain.handle('install-extension', async (_, coreName: string) => {
  return extensionInstaller.installExtension(coreName);
});

ipcMain.handle('create-roms-folders', async () => {
  return extensionInstaller.createRomsFolderStructure();
});

ipcMain.handle('set-kiosk-mode', async (_, enabled: boolean) => {
  if (mainWindow) {
    mainWindow.setKiosk(enabled);
    mainWindow.setFullScreen(enabled);
  }
  return true;
});

ipcMain.on('window-minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('window-close', () => {
  mainWindow?.close();
});
