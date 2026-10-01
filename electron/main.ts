import { app, BrowserWindow, ipcMain, dialog, protocol, net, shell, desktopCapturer, session } from 'electron';
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
import { Game, Recording, ScreenSource, SaveRecordingResult, SaveRecordingAsResult } from './types';
import {
  startPhoneGamepadServer,
  stopPhoneGamepadServer,
  getPhoneGamepadStatus,
} from './services/phoneGamepadServer';

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

// ════════════════════════════════════════════════════════════════════════
// Verrou d'instance unique — on ne peut ouvrir une nouvelle session que si
// la précédente est fermée. Un second lancement ne démarre pas une nouvelle
// session : il réveille la fenêtre existante (focus + restauration), puis
// quitte immédiatement. Protège aussi la base de données (settings.json,
// games.json…) contre deux processus qui s'écraseraient mutuellement.
// ════════════════════════════════════════════════════════════════════════
const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  // Une session RetroMad est déjà ouverte : on quitte silencieusement.
  // Le premier processus reçoit 'second-instance' et ramène sa fenêtre au premier plan.
  console.log('[RetroMad] Une session est déjà ouverte — réactivation de la fenêtre existante.');
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });
}

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

  // ─── Capture d’écran (Vue Kiosque / gameplay) pour l’enregistrement AV ───
  // Autorise la demande du renderer (getDisplayMedia) en sélectionnant l’écran
  // principal — en mode Kiosque plein écran, il correspond à la vue gameplay.
  // Sur Windows on ajoute l’audio du système (loopback) ; sur les autres OS,
  // desktopCapturer ne supporte pas l’audio système → vidéo uniquement. Aucun
  // secret/OAuth stocké : la capture est locale, le partage s’ouvre dans le navigateur.
  session.defaultSession.setDisplayMediaRequestHandler((_request, callback) => {
    desktopCapturer
      .getSources({ types: ['screen', 'window'], thumbnailSize: { width: 0, height: 0 } })
      .then((sources) => {
        if (sources.length === 0) {
          callback({ video: { id: '', name: '' } });
          return;
        }
        // Si une source préférée a été définie via set-screen-source,
        // on la sélectionne ; sinon on retombe sur l'écran principal.
        const selected = preferredCaptureSourceId
          ? sources.find((s) => s.id === preferredCaptureSourceId) || sources[0]
          : sources[0];
        const streams: Electron.Streams = { video: selected };
        if (process.platform === 'win32') {
          streams.audio = 'loopback';
        }
        callback(streams);
      })
      .catch(() => callback({ video: { id: '', name: '' } }));
  });

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

// Ouvre un lien externe (ex. page YouTube watch) dans le navigateur système —
// insensible aux restrictions que YouTube applique au player embarqué d'Electron.
ipcMain.handle('open-external', async (_event, url: string) => {
  try {
    if (typeof url !== 'string') return false;
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      console.warn('[RetroMad] open-external: protocole refusé :', parsed.protocol);
      return false;
    }
    await shell.openExternal(parsed.toString());
    return true;
  } catch (e) {
    console.error('[RetroMad] open-external impossible :', e);
    return false;
  }
});

// ─── Vidéos MP4 locales par firme (stockées hors ligne, lues nativement) ───
const COMPANY_VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.ogv', '.mov', '.m4v']);

function companyVideoDir(): string {
  const dir = path.join(storage.mediaDir, 'company-videos');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function sanitizeCompanyVideoFileId(id: string): string | null {
  if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) return null;
  return id;
}

ipcMain.handle('select-video-file', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow!, {
      title: 'Choisir une vidéo locale pour la firme',
      properties: ['openFile'],
      filters: [
        { name: 'Vidéos (MP4, WebM, OGV, MOV)', extensions: ['mp4', 'webm', 'ogv', 'mov', 'm4v'] },
      ],
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  } catch (e) {
    console.error('[RetroMad] select-video-file impossible :', e);
    return null;
  }
});

// Sélection multiple : photos d'époque et/ou vidéos pour la médiathèque.
ipcMain.handle('select-media-files', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow!, {
      title: 'Choisir des photos et/ou vidéos pour la médiathèque',
      properties: ['openFile', 'multiSelections'],
      filters: [
        {
          name: 'Photos & vidéos',
          extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif', 'mp4', 'webm', 'ogv', 'mov', 'm4v'],
        },
      ],
    });
    if (result.canceled || result.filePaths.length === 0) return [];
    return result.filePaths;
  } catch (e) {
    console.error('[RetroMad] select-media-files impossible :', e);
    return [];
  }
});

// Copie la vidéo choisie dans media/company-videos/<companyId>.<ext> (hors ligne,
// survive aux déplacements du fichier d'origine) et renvoie l'URL retromad-media://.
ipcMain.handle('import-company-video', async (_event, companyId: string, sourcePath: string) => {
  try {
    const safeCompanyId = sanitizeCompanyVideoFileId(companyId);
    if (!safeCompanyId) {
      console.warn('[RetroMad] import-company-video : identifiant firme invalide :', companyId);
      return { ok: false, error: 'Identifiant de firme invalide.' };
    }
    if (!sourcePath || typeof sourcePath !== 'string') {
      return { ok: false, error: 'Chemin de vidéo manquant.' };
    }
    const ext = path.extname(sourcePath).toLowerCase();
    if (!COMPANY_VIDEO_EXTENSIONS.has(ext)) {
      return { ok: false, error: `Format non supporté (${ext || 'inconnu'}). Utilisez MP4, WebM, OGV, MOV ou M4V.` };
    }
    if (!fs.existsSync(sourcePath)) {
      return { ok: false, error: 'Fichier introuvable.' };
    }
    const dir = companyVideoDir();
    // Supprimer les anciennes versions (autre extension) pour éviter les doublons.
    for (const old of fs.readdirSync(dir)) {
      if (old.startsWith(`${safeCompanyId}.`)) {
        try { fs.unlinkSync(path.join(dir, old)); } catch { /* ignore */ }
      }
    }
    const dest = path.join(dir, `${safeCompanyId}${ext}`);
    await fs.promises.copyFile(sourcePath, dest);
    const url = `retromad-media://media/company-videos/${safeCompanyId}${ext}`;
    console.log(`[RetroMad] Vidéo locale importée pour la firme ${safeCompanyId} : ${dest}`);
    return { ok: true, url, path: dest };
  } catch (e) {
    console.error('[RetroMad] import-company-video impossible :', e);
    return { ok: false, error: 'Import impossible (voir logs).' };
  }
});

// Renvoie l'URL retromad-media:// de la vidéo locale d'une firme, si elle existe.
ipcMain.handle('get-company-video', async (_event, companyId: string) => {
  try {
    const safeCompanyId = sanitizeCompanyVideoFileId(companyId);
    if (!safeCompanyId) return null;
    const dir = companyVideoDir();
    for (const file of fs.readdirSync(dir)) {
      if (file.startsWith(`${safeCompanyId}.`) && COMPANY_VIDEO_EXTENSIONS.has(path.extname(file).toLowerCase())) {
        return `retromad-media://media/company-videos/${file}`;
      }
    }
    return null;
  } catch (e) {
    console.error('[RetroMad] get-company-video impossible :', e);
    return null;
  }
});

// Supprime la vidéo locale d'une firme (le fichier d'origine n'est pas touché).
ipcMain.handle('remove-company-video', async (_event, companyId: string) => {
  try {
    const safeCompanyId = sanitizeCompanyVideoFileId(companyId);
    if (!safeCompanyId) return false;
    const dir = companyVideoDir();
    let removed = false;
    for (const file of fs.readdirSync(dir)) {
      if (file.startsWith(`${safeCompanyId}.`)) {
        try { fs.unlinkSync(path.join(dir, file)); removed = true; } catch { /* ignore */ }
      }
    }
    return removed;
  } catch (e) {
    console.error('[RetroMad] remove-company-video impossible :', e);
    return false;
  }
});

// ─── Médiathèque d'archives par firme : photos d'époque + vidéos multiples ───
const GALLERY_IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif']);

function companyGalleryDir(companyId: string): string {
  const dir = path.join(storage.mediaDir, 'company-gallery', companyId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function isSafeGalleryFileName(name: string): boolean {
  return !!name && /^[a-zA-Z0-9._-]+$/.test(name) && !name.includes('..');
}

function galleryMediaType(fileNameOrExt: string): 'photo' | 'video' | null {
  const ext = fileNameOrExt.startsWith('.')
    ? fileNameOrExt.toLowerCase()
    : path.extname(fileNameOrExt).toLowerCase();
  if (GALLERY_IMAGE_EXTENSIONS.has(ext)) return 'photo';
  if (COMPANY_VIDEO_EXTENSIONS.has(ext)) return 'video';
  return null;
}

// Import multiple : copie chaque fichier hors ligne (photos et/ou vidéos)
// dans media/company-gallery/<companyId>/ sous un nom unique — l'ordre
// alphabétique reflète l'ordre d'ajout.
ipcMain.handle('import-company-media', async (_event, companyId: string, sourcePaths: string[]) => {
  try {
    const safeCompanyId = sanitizeCompanyVideoFileId(companyId);
    if (!safeCompanyId) {
      return { ok: false, added: 0, error: 'Identifiant de firme invalide.' };
    }
    if (!Array.isArray(sourcePaths) || sourcePaths.length === 0) {
      return { ok: false, added: 0, error: 'Aucun fichier sélectionné.' };
    }
    const dir = companyGalleryDir(safeCompanyId);
    let added = 0;
    let skipped = 0;
    for (const src of sourcePaths) {
      try {
        const ext = path.extname(src).toLowerCase();
        if (!galleryMediaType(ext)) {
          skipped++;
          continue;
        }
        if (!fs.existsSync(src)) {
          skipped++;
          continue;
        }
        const prefix = GALLERY_IMAGE_EXTENSIONS.has(ext) ? 'p' : 'v';
        const destName = `${prefix}_${Date.now()}_${added}${ext}`;
        await fs.promises.copyFile(src, path.join(dir, destName));
        added++;
      } catch {
        skipped++;
      }
    }
    if (added > 0) {
      console.log(`[RetroMad] Médiathèque ${safeCompanyId} : ${added} fichier(s) importé(s).`);
    }
    return { ok: added > 0, added, skipped, error: added === 0 ? 'Aucun fichier valide (formats photo ou vidéo attendus).' : undefined };
  } catch (e) {
    console.error('[RetroMad] import-company-media impossible :', e);
    return { ok: false, added: 0, error: 'Import impossible (voir logs).' };
  }
});

// Liste la médiathèque d'une firme : photos et vidéos, URLs retromad-media://.
ipcMain.handle('list-company-media', async (_event, companyId: string) => {
  try {
    const safeCompanyId = sanitizeCompanyVideoFileId(companyId);
    if (!safeCompanyId) return { photos: [], videos: [] };
    const dir = companyGalleryDir(safeCompanyId);
    const photos: { url: string; name: string }[] = [];
    const videos: { url: string; name: string }[] = [];
    for (const file of fs.readdirSync(dir).sort()) {
      const type = galleryMediaType(file);
      if (type === 'photo') {
        photos.push({ url: `retromad-media://media/company-gallery/${safeCompanyId}/${file}`, name: file });
      } else if (type === 'video') {
        videos.push({ url: `retromad-media://media/company-gallery/${safeCompanyId}/${file}`, name: file });
      }
    }
    return { photos, videos };
  } catch (e) {
    console.error('[RetroMad] list-company-media impossible :', e);
    return { photos: [], videos: [] };
  }
});

// Retire un élément précis de la médiathèque (le fichier d'origine n'est pas touché).
ipcMain.handle('remove-company-media', async (_event, companyId: string, fileName: string) => {
  try {
    const safeCompanyId = sanitizeCompanyVideoFileId(companyId);
    if (!safeCompanyId || !isSafeGalleryFileName(fileName)) return false;
    const target = path.join(companyGalleryDir(safeCompanyId), fileName);
    if (!target.startsWith(companyGalleryDir(safeCompanyId))) return false;
    if (!fs.existsSync(target)) return false;
    fs.unlinkSync(target);
    return true;
  } catch (e) {
    console.error('[RetroMad] remove-company-media impossible :', e);
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

// ─── Manette Smartphone (GSM/Wi-Fi local) ───
ipcMain.handle('phone-gamepad-start', async () => startPhoneGamepadServer());
ipcMain.handle('phone-gamepad-stop', async () => stopPhoneGamepadServer());
ipcMain.handle('phone-gamepad-status', async () => getPhoneGamepadStatus());

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

/**
 * ─── Suivi des issues GitHub ───
 * Récupère les issues publiques du dépôt GitHub (sans token, via l'API publique
 * qui autorise 60 requêtes/heure — largement suffisant pour un client desktop).
 * L'URL est construite côté main process pour ne pas exposer le nom du dépôt
 * dans le bundle web et centraliser la logique de parsing HTTP → types.
 */
ipcMain.handle('fetch-github-issues', async (_event, repo: string, state: 'open' | 'closed' | 'all' = 'all') => {
  try {
    if (!repo || typeof repo !== 'string') {
      return { ok: false, error: 'Repo invalide' };
    }
    const request = net.request({
      method: 'GET',
      url: `https://api.github.com/repos/${repo}/issues?state=${state}&per_page=50`,
    });

    request.setHeader('Accept', 'application/vnd.github+json');
    request.setHeader('User-Agent', 'RetroMad-Desktop');

    const response = await new Promise<{ status: number; body: string }>((resolve, reject) => {
      let body = '';
      request.on('response', (res: Electron.IncomingMessage) => {
        res.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
      request.on('error', (err: Error) => reject(err));
      request.end();
    });

    if (response.status !== 200) {
      return { ok: false, error: `GitHub API erreur ${response.status}`, status: response.status };
    }

    const raw = JSON.parse(response.body);
    const issues = raw.map((item: any) => ({
      id: item.id,
      number: item.number,
      title: item.title,
      state: item.state,
      htmlUrl: item.html_url,
      body: item.body,
      user: {
        login: item.user?.login,
        avatarUrl: item.user?.avatar_url,
      },
      labels: (item.labels || []).map((l: any) => ({ name: l.name, color: l.color })),
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      isPullRequest: !!item.pull_request,
    }));

    return { ok: true, issues };
  } catch (e: any) {
    console.error('[RetroMad] fetch-github-issues:', e);
    return { ok: false, error: e.message };
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

// ─── Enregistrement audio/vidéo (Vue Kiosque / gameplay) ────────────────
// desktopCapturer est orchestré depuis le renderer via
// navigator.mediaDevices.getDisplayMedia (autorisé ci-dessus). Le renderer
// produit un Blob qu'il envoie ici pour être persisté sur le disque.

/** Dossier des enregistrements AV (media/recordings/). */
let preferredCaptureSourceId: string | null = null;

/** Dossier des enregistrements AV (media/recordings/). */
function recordingsDir(): string {
  const dir = path.join(storage.mediaDir, 'recordings');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/** Liste des sources (écrans + fenêtres) exposées au renderer pour la sélection. */
ipcMain.handle('get-screen-sources', async (): Promise<ScreenSource[]> => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: { width: 0, height: 0 },
    });
    return sources.map((s) => ({
      id: s.id,
      name: s.name,
      displayId: s.display_id,
      // « screen » pour un écran complet, « window » pour une fenêtre.
      type: s.id.startsWith('screen:') ? 'screen' : 'window' as const,
    }));
  } catch (e) {
    console.error('[RetroMad] get-screen-sources:', e);
    return [];
  }
});

/** Définit la source d'écran/fenêtre à capturer (au lieu de l'écran par défaut). */
ipcMain.handle('set-screen-source', async (_event, sourceId: string | null): Promise<boolean> => {
  try {
    if (sourceId === null || (typeof sourceId === 'string' && sourceId.trim() !== '')) {
      preferredCaptureSourceId = sourceId;
      console.log(`[RetroMad] Source de capture définie : ${sourceId || 'écran principal (défaut)'}`);
      return true;
    }
    return false;
  } catch (e) {
    console.error('[RetroMad] set-screen-source:', e);
    return false;
  }
});

/** Durée estimée d’un enregistrement (pour la persistance en side-car). */
const RECORDING_META_RE = /^\w[\w .-]{0,126}\.(webm|mp4|ogg|mp3|wav|m4a)$/i;

/** Persiste un Blob (ArrayBuffer) enregistré par le renderer sur le disque. */
ipcMain.handle('save-recording', async (
  _event,
  filename: string,
  data: ArrayBuffer,
  durationMs?: number
): Promise<SaveRecordingResult> => {
  try {
    if (!filename || typeof filename !== 'string' || !RECORDING_META_RE.test(filename)) {
      return { ok: false, error: 'Nom de fichier invalide.' };
    }
    const dir = recordingsDir();
    const safeName = path.basename(filename);
    let dest = path.join(dir, safeName);
    // On ne chevauche pas un enregistrement existant : on suffixe d'un horodatage.
    if (fs.existsSync(dest)) {
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const parsed = path.parse(safeName);
      dest = path.join(dir, `${parsed.name}_${ts}${parsed.ext}`);
    }
    const buffer = Buffer.from(data);
    await fs.promises.writeFile(dest, buffer);
    console.log(`[RetroMad] Enregistrement sauvegardé : ${dest} (${buffer.length} octets)`);
    const stat = await fs.promises.stat(dest);
    return {
      ok: true,
      path: dest,
      name: path.basename(dest),
      size: stat.size,
      error: undefined,
    };
  } catch (e: any) {
    console.error('[RetroMad] save-recording:', e);
    return { ok: false, error: e.message };
  }
});

/** Liste les enregistrements (du plus recent au plus ancien). */
ipcMain.handle('list-recordings', async (): Promise<Recording[]> => {
  try {
    const dir = recordingsDir();
    const files = await fs.promises.readdir(dir);
    const out: Recording[] = [];
    for (const f of files) {
      const full = path.join(dir, f);
      let stat: fs.Stats;
      try {
        stat = await fs.promises.stat(full);
      } catch {
        continue;
      }
      if (!stat.isFile()) continue;
      // On ignore les miniatures (.thumb.jpg) — ce sont des side-cars, pas des
      // enregistrements utilisables directement par le lecteur.
      if (f.endsWith('.thumb.jpg')) continue;
      const ext = path.extname(f).toLowerCase();
      let mime = 'application/octet-stream';
      let type: 'video' | 'audio' | 'screen' = 'video';
      if (ext === '.webm') { mime = 'video/webm'; type = 'video'; }
      else if (ext === '.mp4') { mime = 'video/mp4'; type = 'video'; }
      else if (ext === '.m4a') { mime = 'audio/mp4'; type = 'audio'; }
      else if (ext === '.ogg') { mime = 'audio/ogg'; type = 'audio'; }
      else if (ext === '.mp3') { mime = 'audio/mpeg'; type = 'audio'; }
      else if (ext === '.wav') { mime = 'audio/wav'; type = 'audio'; }
      else continue; // extension non reconnue
      // URL de la miniature si un side-car .thumb.jpg existe
      const thumbPath = path.join(dir, `${path.parse(f).name}.thumb.jpg`);
      const thumbnailUrl = fs.existsSync(thumbPath)
        ? `retromad-media://media/recordings/${encodeURIComponent(path.basename(thumbPath))}`
        : undefined;
      out.push({
        id: f,
        name: f,
        path: full,
        url: `retromad-media://media/recordings/${encodeURIComponent(f)}`,
        size: stat.size,
        mime,
        createdAt: new Date(stat.birthtime).toISOString(),
        type,
        thumbnailUrl,
      });
    }
    out.sort((a, b) => (b.createdAt < a.createdAt ? -1 : b.createdAt > a.createdAt ? 1 : 0));
    return out;
  } catch (e) {
    console.error('[RetroMad] list-recordings:', e);
    return [];
  }
});

/** Supprime un enregistrement par nom de fichier. */
ipcMain.handle('delete-recording', async (_event, filename: string): Promise<boolean> => {
  try {
    if (!filename || typeof filename !== 'string' || filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
      return false;
    }
    const dir = recordingsDir();
    const target = path.join(dir, path.basename(filename));
    if (!target.startsWith(dir + path.sep)) return false;
    if (!fs.existsSync(target)) return false;
    fs.unlinkSync(target);
    return true;
  } catch (e) {
    console.error('[RetroMad] delete-recording:', e);
    return false;
  }
});

/** Ouvre le dossier des enregistrements dans l'explorateur du systeme. */
ipcMain.handle('open-recordings-folder', async (): Promise<boolean> => {
  try {
    await shell.openPath(recordingsDir());
    return true;
  } catch (e) {
    console.error('[RetroMad] open-recordings-folder:', e);
    return false;
  }
});

/** Enregistre un thumbnail (data URL) à côté d’un enregistrement pour la vignette. */
ipcMain.handle('save-thumbnail', async (_event, filename: string, dataUrl: string): Promise<boolean> => {
  try {
    if (!filename || typeof filename !== 'string' || !RECORDING_META_RE.test(filename)) {
      return false;
    }
    const dir = recordingsDir();
    const parsed = path.parse(path.basename(filename));
    const thumbName = `${parsed.name}.thumb.jpg`;
    const dest = path.join(dir, thumbName);

    // Extraction du buffer base64 depuis « data:image/jpeg;base64,/9j/… »
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length === 0) return false;

    await fs.promises.writeFile(dest, buffer);
    return true;
  } catch (e) {
    console.error('[RetroMad] save-thumbnail:', e);
    return false;
  }
});

/** Exporte un enregistrement vers un emplacement choisi par l'utilisateur (« Sauvegarder sous… »). */
ipcMain.handle('save-recording-as', async (_event, filename: string): Promise<SaveRecordingAsResult> => {
  try {
    if (!filename || typeof filename !== 'string' || !RECORDING_META_RE.test(filename)) {
      return { ok: false, error: 'Nom de fichier invalide.' };
    }
    if (!mainWindow) return { ok: false, error: 'Fenêtre principale indisponible.' };

    const sourcePath = path.join(recordingsDir(), path.basename(filename));
    if (!fs.existsSync(sourcePath)) {
      return { ok: false, error: 'Fichier source introuvable.' };
    }

    const ext = path.extname(sourcePath).toLowerCase();
    const defaultName = path.basename(sourcePath);
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Sauvegarder l\'enregistrement sous…',
      defaultPath: defaultName,
      filters: [
        { name: 'Fichiers vidéo', extensions: ['webm', 'mp4'] },
        { name: 'Tous les fichiers', extensions: ['*'] },
      ],
    });

    if (result.canceled || !result.filePath) {
      return { ok: false, error: 'Annulé par l’utilisateur.' };
    }

    const dest = result.filePath;
    // Sécuriser : s’assurer que le destination reste un fichier, pas un dossier
    const destResolved = path.resolve(dest);
    await fs.promises.copyFile(sourcePath, destResolved);
    const stat = await fs.promises.stat(destResolved);

    return {
      ok: true,
      path: destResolved,
      name: path.basename(destResolved),
      size: stat.size,
    };
  } catch (e: any) {
    console.error('[RetroMad] save-recording-as:', e);
    return { ok: false, error: e.message };
  }
});

