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
      corsEnabled: true,
      bypassCSP: true,
    },
  },
  {
    scheme: 'retromad',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
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
  // Protocole pour charger les images et médias mis en cache localement
  protocol.handle('retromad-media', async (request) => {
    try {
      const parsed = new URL(request.url);
      // Gère les formes : retromad-media://media/boxarts/xxx.png ou retromad-media:///media/boxarts/xxx.png
      let relativePath = parsed.host
        ? path.join(parsed.host, parsed.pathname.replace(/^\//, ''))
        : parsed.pathname.replace(/^\//, '');

      relativePath = decodeURIComponent(relativePath);

      // Résolution du fichier : tester dataDir, mediaDir, et public
      let fullPath = path.join(storage.getDataDir(), relativePath);
      if (!fs.existsSync(fullPath)) {
        // Si relativePath commence par "media/", tester sous mediaDir sans le préfixe
        const strippedMedia = relativePath.replace(/^media[\\/]/, '');
        const altPath = path.join(storage.mediaDir, strippedMedia);
        if (fs.existsSync(altPath)) {
          fullPath = altPath;
        } else {
          // Essayer dans public/
          const publicPath = path.join(process.cwd(), 'public', relativePath);
          if (fs.existsSync(publicPath)) {
            fullPath = publicPath;
          }
        }
      }

      if (!fs.existsSync(fullPath)) {
        return new Response('Not found', { status: 404 });
      }

      const ext = path.extname(fullPath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.pdf': 'application/pdf',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      const fileBuffer = await fs.promises.readFile(fullPath);

      return new Response(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    } catch (err) {
      console.error('[retromad-media] Erreur:', err);
      return new Response('Internal Server Error', { status: 500 });
    }
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
  const updated = storage.saveSettings(newSettings);
  if (newSettings && newSettings.romsDir) {
    setupRomsWatcher();
  }
  return updated;
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
    if (!systemId || typeof systemId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(systemId)) {
      console.warn('[RetroMad] open-bios-folder: identifiant système invalide :', systemId);
      return false;
    }
    const settings = storage.getSettings();
    const biosRoot = settings.biosDir?.trim()
      ? settings.biosDir.trim()
      : path.join(app.getAppPath(), 'public', 'bios');
    // Chemin relatif → ancré au projet ; absolu → utilisé tel quel.
    const root = path.isAbsolute(biosRoot)
      ? biosRoot
      : path.join(app.getAppPath(), biosRoot);
    // Le checker organise par système : public/bios/<systemId>/…
    const safeSystemId = path.basename(systemId);
    const target = path.resolve(root, safeSystemId);
    if (!target.startsWith(path.resolve(root))) {
      console.warn('[RetroMad] open-bios-folder: tentative de traversée de chemin :', systemId);
      return false;
    }
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
  // Synchronisation incrémentale automatique : si de nouvelles ROMs sont présentes
  // sur le disque (ex: ajout de ROM dans public/roms sans scan manuel préalable), on les fusionne.
  try {
    const settings = storage.getSettings();
    if (settings.romsDir && fs.existsSync(settings.romsDir)) {
      const existingGames = storage.getGames();
      const existingPaths = new Set(existingGames.map((g) => g.path));
      const scannedGames = await scanner.scanDirectory(settings.romsDir);
      const newFiles = scannedGames.filter((g) => !existingPaths.has(g.path));
      if (newFiles.length > 0 || existingGames.length === 0) {
        console.log(`[RetroMad] Détection automatique : ${newFiles.length} nouvelle(s) ROM(s) trouvée(s).`);
        return await scanAndMergeRoms();
      }
    }
  } catch (err) {
    console.warn('[RetroMad] Auto-sync get-games ignoré :', err);
  }
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

function updateRomsIndexJson(scannedGames: Game[]) {
  try {
    const projectRoot = process.cwd();
    const publicRomsDir = path.join(projectRoot, 'public', 'roms');
    const distRomsDir = path.join(projectRoot, 'dist', 'roms');
    const indexData = {
      generated: new Date().toISOString(),
      count: scannedGames.length,
      files: scannedGames.map((g) => {
        let rel = g.path;
        if (g.path.startsWith(publicRomsDir)) {
          rel = path.relative(publicRomsDir, g.path);
        } else {
          const settings = storage.getSettings();
          if (settings.romsDir && g.path.startsWith(settings.romsDir)) {
            rel = path.relative(settings.romsDir, g.path);
          }
        }
        return {
          path: '/' + rel.replace(/\\/g, '/').replace(/^\//, ''),
          filename: g.filename,
          size: g.size,
        };
      }),
    };
    const content = JSON.stringify(indexData, null, 2);
    if (fs.existsSync(publicRomsDir)) {
      fs.writeFileSync(path.join(publicRomsDir, '_index.json'), content, 'utf-8');
    }
    if (fs.existsSync(distRomsDir)) {
      fs.writeFileSync(path.join(distRomsDir, '_index.json'), content, 'utf-8');
    }
  } catch (e) {
    console.warn('[RetroMad] Échec mise à jour _index.json:', e);
  }
}

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
  updateRomsIndexJson(mergedGames);
  return mergedGames;
}

ipcMain.handle('scan-roms', async () => {
  return scanAndMergeRoms();
});

let romsWatcher: fs.FSWatcher | null = null;
let romsWatchTimeout: NodeJS.Timeout | null = null;

function setupRomsWatcher() {
  try {
    if (romsWatcher) {
      romsWatcher.close();
      romsWatcher = null;
    }
    const settings = storage.getSettings();
    if (!settings.romsDir || !fs.existsSync(settings.romsDir)) return;

    romsWatcher = fs.watch(settings.romsDir, { recursive: true }, (eventType, filename) => {
      if (!filename || filename.startsWith('.') || filename.endsWith('_index.json') || filename.endsWith('.tmp')) return;
      if (romsWatchTimeout) clearTimeout(romsWatchTimeout);
      romsWatchTimeout = setTimeout(async () => {
        try {
          console.log(`[RetroMad Watcher] Modification détectée dans le dossier ROMs (${filename})...`);
          const existingGames = storage.getGames();
          const existingPaths = new Set(existingGames.map((g) => g.path));
          const scanned = await scanner.scanDirectory(settings.romsDir);
          const newGames = scanned.filter((g) => !existingPaths.has(g.path));
          if (newGames.length > 0) {
            console.log(`[RetroMad Watcher] ${newGames.length} nouvelle(s) ROM(s) intégrée(s) automatiquement.`);
            const merged = await scanAndMergeRoms();
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('games-auto-imported', newGames.length);
            }
          }
        } catch (err) {
          console.warn('[RetroMad Watcher] Erreur traitement watcher:', err);
        }
      }, 1500);
    });
  } catch (err) {
    console.warn('[RetroMad Watcher] Surveillance dossier ROMs non supportée ou échouée:', err);
  }
}

// Auto-scan et surveillance continue au démarrage
app.whenReady().then(async () => {
  try {
    setupRomsWatcher();
    const settings = storage.getSettings();
    if (settings.romsDir && fs.existsSync(settings.romsDir)) {
      const existingGames = storage.getGames();
      const existingPaths = new Set(existingGames.map((g) => g.path));
      const scanned = await scanner.scanDirectory(settings.romsDir);
      const newGames = scanned.filter((g) => !existingPaths.has(g.path));
      if (newGames.length > 0 || existingGames.length === 0) {
        const merged = await scanAndMergeRoms();
        console.log(`[RetroMad] Auto-scan initial : ${merged.length} jeu(x) au total (${newGames.length} nouveau(x)) importé(s)`);
        if (mainWindow && !mainWindow.isDestroyed() && newGames.length > 0) {
          mainWindow.webContents.send('games-auto-imported', newGames.length);
        }
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

ipcMain.handle('search-scrape-candidates', async (_, game: Game, query?: string) => {
  return scraper.searchCandidates(game, query);
});

ipcMain.handle('scrape-game-with-title', async (_, game: Game, chosenTitle: string) => {
  const updated = await scraper.scrapeGameWithTitle(game, chosenTitle);
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
  let found = 0;
  let notFound = 0;
  let skipped = 0;

  for (let i = 0; i < total; i++) {
    const game = games[i];
    let currentBoxartUrl: string | undefined = undefined;

    // Notifier le démarrage du jeu en cours
    if (mainWindow) {
      mainWindow.webContents.send('scrape-progress', {
        total,
        current: i + 1,
        currentGameTitle: game.cleanTitle,
        systemId: game.systemId,
        found,
        notFound,
        skipped,
        currentBoxartUrl: undefined,
      });
    }

    try {
      const localBoxart = path.join(storage.mediaDir, 'boxarts', `${game.id}.png`);
      const hadLocalBefore = fs.existsSync(localBoxart);

      const updated = await scraper.scrapeGame(game);
      updatedGames.push(updated);

      const hasLocalNow = fs.existsSync(localBoxart);
      if (hasLocalNow && !hadLocalBefore) {
        found++;
        currentBoxartUrl = updated.media?.boxart2d || `media/boxarts/${game.id}.png`;
      } else if (hasLocalNow && hadLocalBefore) {
        skipped++;
        currentBoxartUrl = updated.media?.boxart2d || game.media?.boxart2d || `media/boxarts/${game.id}.png`;
      } else if (updated.media?.boxart2d && updated.media.boxart2d !== game.media?.boxart2d) {
        found++;
        currentBoxartUrl = updated.media.boxart2d;
      } else if (game.media?.boxart2d) {
        skipped++;
        currentBoxartUrl = game.media.boxart2d;
      } else {
        notFound++;
        currentBoxartUrl = undefined;
      }
    } catch (e) {
      console.error(`Erreur scrape pour ${game.title}:`, e);
      updatedGames.push(game);
      notFound++;
    }

    // Notifier le résultat du jeu après scraping
    if (mainWindow) {
      mainWindow.webContents.send('scrape-progress', {
        total,
        current: i + 1,
        currentGameTitle: game.cleanTitle,
        systemId: game.systemId,
        found,
        notFound,
        skipped,
        currentBoxartUrl,
      });
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
  if (!coreName || typeof coreName !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(coreName)) {
    console.warn('[RetroMad] install-extension: nom de cœur invalide :', coreName);
    return false;
  }
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

ipcMain.handle('detect-usb-drives', async () => {
  const detectedDrives: { path: string; label: string; romsCount: number }[] = [];
  try {
    const candidateDirs: string[] = [];
    const user = process.env.USER || process.env.USERNAME || 'madtrix';
    const mediaPaths = [
      path.join('/media', user),
      '/media',
      path.join('/run/media', user),
    ];

    for (const mPath of mediaPaths) {
      if (fs.existsSync(mPath)) {
        const entries = fs.readdirSync(mPath, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            candidateDirs.push(path.join(mPath, entry.name));
          }
        }
      }
    }

    for (const drivePath of candidateDirs) {
      try {
        const scanned = await scanner.scanDirectory(drivePath);
        if (scanned.length > 0) {
          detectedDrives.push({
            path: drivePath,
            label: path.basename(drivePath),
            romsCount: scanned.length,
          });
        }
      } catch {}
    }
  } catch (err) {
    console.warn('[RetroMad USB] Erreur détection clés USB:', err);
  }
  return detectedDrives;
});

ipcMain.handle('import-from-usb', async (_, usbPath: string) => {
  if (!usbPath || !fs.existsSync(usbPath)) {
    return { success: false, imported: 0, message: 'Chemin USB invalide' };
  }

  const settings = storage.getSettings();
  const romsDir = settings.romsDir || path.join(process.cwd(), 'public', 'roms');
  let importedCount = 0;

  try {
    const scanned = await scanner.scanDirectory(usbPath);
    for (const game of scanned) {
      const targetDir = path.join(romsDir, game.systemId);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const targetPath = path.join(targetDir, path.basename(game.path));
      if (!fs.existsSync(targetPath)) {
        fs.copyFileSync(game.path, targetPath);
        importedCount++;
      }
    }

    const updatedGames = await scanAndMergeRoms();
    return { success: true, imported: importedCount, total: scanned.length, games: updatedGames };
  } catch (err) {
    console.error('[RetroMad USB] Erreur import USB:', err);
    return { success: false, imported: importedCount, message: String(err) };
  }
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

