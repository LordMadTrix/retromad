import { app, BrowserWindow, ipcMain, dialog, protocol, net, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { storage } from './services/storage';
import { scanner } from './services/scanner';
import { scraper } from './services/scraper';
import { biosChecker } from './services/biosChecker';
import { launcher, BUILTIN_EMULATORS } from './services/launcher';
import { SYSTEMS } from './data/systems';
import { COMPANIES } from './data/companies';
import { extensionInstaller } from './services/extensionInstaller';
import { Game } from './types';

// Enregistrer les schémas personnalisés :
//  - retromad-media : médias locaux mis en cache (boxarts…)
//  - retromad : application de production servie comme un site https
//    (évite l'origine nulle de file:// qui bloque les iframes YouTube
//    avec « Erreur 153 », les workers, etc.)
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
  {
    scheme: 'retromad',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      bypassCSP: true,
      stream: true,
    },
  },
]);

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  // Masquer le token « Electron/x.y » du User-Agent : YouTube refuse
  // l'initialisation de son player intégré depuis un navigateur embarqué
  // identifiable (erreur 152-4 « Cette vidéo n'est pas disponible »).
  // Un User-Agent Chrome standard passe sans problème.
  const ua = app.userAgentFallback.replace(/ Electron\/[0-9.]+/g, '');
  app.userAgentFallback = ua;
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

  // YouTube rejette les lecteurs intégrés depuis une origine nulle (file://)
  // avec « Erreur 153 ». On présente une origine https personnalisée via le
  // header Referer pour que l'embed soit accepté.
  // NB : les flux vidéo réels viennent de sous-domaines variable
  // (rr1---sn-xxxx.googlevideo.com…) — sans le joker *.googlevideo.com,
  // les streams partaient sans Origine usurpée et le player affichait
  // « Vidéo pas disponible » malgré un embed d'iframe accepté.
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    {
      urls: [
        'https://www.youtube.com/*',
        'https://youtube.com/*',
        'https://www.youtube-nocookie.com/*',
        'https://youtube-nocookie.com/*',
        'https://googlevideo.com/*',
        'https://*.googlevideo.com/*',
        'https://*.ytimg.com/*',
      ],
    },
    (details, callback) => {
      const headers = { ...details.requestHeaders };
      headers['Origin'] = 'https://www.youtube.com';
      headers['Referer'] = 'https://www.youtube.com/';
      callback({ requestHeaders: headers });
    }
  );

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
  } else if (process.env.RETROMAD_USE_FILE) {
    mainWindow.loadFile(distIndexPath);
  } else {
    // Protocole https-like : même origine sûre que le web, sans les
    // restrictions d'origine nulle de file:// (iframes YouTube, workers).
    mainWindow.loadURL('retromad://app/index.html').catch(() => {
      console.log('[RetroMad] retromad:// indisponible, repli sur file://...');
      mainWindow?.loadFile(distIndexPath);
    });
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

  // Protocole de l'application de production : sert dist/ comme un site.
  // NB : on lit les fichiers avec fs (pas net.fetch file://) — net.fetch
  // depuis un handler de protocole provoquait un SIGSEGV sur certaines
  // configurations GPU (nvidia).
  // Les dossiers statiques du projet (roms, bios, logos, music, themes…)
  // restent servis depuis public/ — Vite ne les copie pas tous dans dist.
  const MIME_TYPES: Record<string, string> = {
    '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon',
    '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
    '.nes': 'application/octet-stream', '.sfc': 'application/octet-stream',
    '.smc': 'application/octet-stream', '.gb': 'application/octet-stream',
    '.gbc': 'application/octet-stream', '.gba': 'application/octet-stream',
    '.md': 'application/octet-stream', '.zip': 'application/zip',
    '.z64': 'application/octet-stream', '.n64': 'application/octet-stream',
    '.cue': 'application/octet-stream', '.iso': 'application/octet-stream',
  };
  const serveFile = async (resolved: string): Promise<Response> => {
    const data = await fs.promises.readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    // no-store partout : sans cet en-tête, Chromium met index.html en cache
    // disque et recharge un ANCIEN bundle après un rebuild (symptôme :
    // « toujours l'ancienne version »). Les fichiers sont servis depuis le
    // disque local — lire à chaque requête coûte moins qu'un stale cache.
    return new Response(data, {
      headers: {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  };

  protocol.handle('retromad', async (request) => {
    try {
      const parsed = new URL(request.url);
      // retromad://app/index.html → dist/index.html
      let relativePath = decodeURIComponent(parsed.pathname).replace(/^\//, '') || 'index.html';
      if (relativePath.endsWith('/')) relativePath += 'index.html';
      const distDir = path.join(__dirname, '../dist');
      const publicDir = path.join(__dirname, '../public');
      const projectRoot = path.resolve(distDir, '..');

      const tryPaths: string[] = [];
      if (/^(roms|bios|logos|music|themes|emulators|saves)\//.test(relativePath)) {
        tryPaths.push(path.join(publicDir, relativePath));
      } else {
        tryPaths.push(path.join(distDir, relativePath));
        tryPaths.push(path.join(publicDir, relativePath));
      }

      for (const candidate of tryPaths) {
        const resolved = path.resolve(candidate);
        // Garde-fou : interdire la sortie du projet
        if (!resolved.startsWith(projectRoot)) continue;
        try {
          if (fs.statSync(resolved).isFile()) {
            return await serveFile(resolved);
          }
        } catch {
          /* fichier suivant */
        }
      }
      // SPA fallback : routes applicatives → index.html
      if (!relativePath.includes('.')) {
        return await serveFile(path.join(distDir, 'index.html'));
      }
      return new Response('Not Found', { status: 404 });
    } catch (e) {
      console.error('[RetroMad] Erreur protocole retromad://:', e);
      return new Response('Internal Error', { status: 500 });
    }
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

// Ouvre (ou crée puis ouvre) le dossier BIOS d'un système dans le
// gestionnaire de fichiers de l'OS — depuis le rapport santé.
ipcMain.handle('open-bios-folder', async (_event, systemId: string) => {
  try {
    const settings = storage.getSettings();
    const biosRoot = settings.biosDir?.trim()
      ? settings.biosDir.trim()
      : path.join(app.getAppPath(), 'public', 'bios');
    // Chemin relatif → ancré au projet ; absolu → utilisé tel quel.
    const root = path.isAbsolute(biosRoot)
      ? biosRoot
      : path.join(app.getAppPath(), biosRoot);
    // Le checker organise par système : public/bios/<systemId>/…
    const target = path.join(root, systemId);
    await fs.promises.mkdir(target, { recursive: true });
    await shell.openPath(target);
    return true;
  } catch (e) {
    console.error('[RetroMad] Ouverture du dossier BIOS impossible :', e);
    return false;
  }
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

async function scanAndMergeRoms(): Promise<Game[]> {
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
}

ipcMain.handle('scan-roms', async () => {
  return scanAndMergeRoms();
});

// Auto-scan au démarrage : si la bibliothèque desktop est vide alors que le
// dossier ROMs contient des fichiers, on la peuple automatiquement (sinon
// l'utilisateur voit une collection vide et "aucun jeu ne se lance").
app.whenReady().then(async () => {
  try {
    const games = storage.getGames();
    const settings = storage.getSettings();
    if (games.length === 0 && settings.romsDir && fs.existsSync(settings.romsDir)) {
      const scanned = await scanAndMergeRoms();
      console.log(`[RetroMad] Auto-scan initial : ${scanned.length} jeu(x) importé(s) depuis ${settings.romsDir}`);
      if (mainWindow && scanned.length > 0) {
        mainWindow.webContents.send('games-auto-imported', scanned.length);
      }
    }
  } catch (e) {
    console.error('[RetroMad] Échec auto-scan initial :', e);
  }
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

// Lecture d'une ROM en base64 : permet au lecteur intégré (EmulatorJS) de
// fonctionner aussi en mode bureau, en repli quand aucun émulateur externe.
ipcMain.handle('read-rom-file', async (_, romPath: string) => {
  try {
    if (typeof romPath !== 'string' || romPath.includes('..')) {
      return { ok: false, error: 'Chemin invalide' };
    }
    const allowedRoots = [
      path.join(__dirname, '../public/roms'),
      storage.getSettings().romsDir || '',
    ].filter(Boolean).map((r) => path.resolve(r));

    const isAllowed = (resolved: string) =>
      allowedRoots.some((root) => resolved === root || resolved.startsWith(root + path.sep));

    // 1) Chemin tel quel (absolu ou traduit côté renderer)
    const resolved = path.resolve(romPath);
    if (isAllowed(resolved) && fs.existsSync(resolved)) {
      const data = await fs.promises.readFile(resolved);
      return { ok: true, dataB64: data.toString('base64') };
    }

    // 2) Chemin relatif hérité d'anciens scans (ex: "nes/Action 52 (E).nes") :
    //    retrouver le fichier par son nom, récursivement, dans les racines autorisées.
    const basename = path.basename(romPath);
    for (const root of allowedRoots) {
      if (!fs.existsSync(root)) continue;
      const queue: string[] = [root];
      while (queue.length) {
        const dir = queue.shift()!;
        let entries: fs.Dirent[] = [];
        try {
          entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch { continue; }
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            if (!entry.name.startsWith('.')) queue.push(full);
          } else if (entry.name === basename) {
            const data = await fs.promises.readFile(full);
            return { ok: true, dataB64: data.toString('base64') };
          }
        }
      }
    }

    return { ok: false, error: `ROM introuvable : ${basename}` };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
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
