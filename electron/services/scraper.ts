import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { Game, ScrapeCandidate } from '../types';
import { SYSTEMS } from '../data/systems';
import { storage } from './storage';

export class ScraperService {
  /**
   * Télécharge n'importe quel fichier multimédia (images, vidéos MP4, documents PDF)
   * depuis une URL et le sauvegarde localement avec gestion des redirections et des erreurs.
   */
  async downloadFile(url: string, destPath: string, redirectCount = 0, timeoutMs = 25000): Promise<boolean> {
    if (redirectCount > 5) {
      console.warn(`[Scraper] Trop de redirections pour ${url}`);
      return false;
    }

    return new Promise((resolve) => {
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url);
      } catch {
        console.warn(`[Scraper] URL invalide : ${url}`);
        resolve(false);
        return;
      }

      const client = parsedUrl.protocol === 'https:' ? https : http;

      const request = client.get(
        url,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) RetroMad-UniversalScraper/2.0',
            Accept: '*/*',
          },
        },
        (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            res.resume();
            const redirectUrl = new URL(res.headers.location, parsedUrl).toString();
            this.downloadFile(redirectUrl, destPath, redirectCount + 1, timeoutMs).then(resolve);
            return;
          }

          if (res.statusCode !== 200) {
            res.resume();
            resolve(false);
            return;
          }

          fs.mkdirSync(path.dirname(destPath), { recursive: true });
          const temporaryPath = `${destPath}.${process.pid}.${Date.now()}.download`;
          const fileStream = fs.createWriteStream(temporaryPath);
          let completed = false;
          const cleanup = () => {
            if (fs.existsSync(temporaryPath)) {
              try { fs.unlinkSync(temporaryPath); } catch {}
            }
          };
          const finish = (success: boolean) => {
            if (completed) return;
            completed = true;
            cleanup();
            resolve(success);
          };

          res.pipe(fileStream);

          fileStream.on('finish', () => {
            fileStream.close((error) => {
              if (error) {
                finish(false);
                return;
              }

              try {
                // Validation minimale : taille non vide
                const stats = fs.statSync(temporaryPath);
                if (stats.size === 0) {
                  finish(false);
                  return;
                }
                fs.renameSync(temporaryPath, destPath);
                completed = true;
                resolve(true);
              } catch (renameError) {
                console.warn(`[Scraper] Impossible d'enregistrer le média : ${destPath}`, renameError);
                finish(false);
              }
            });
          });

          fileStream.on('error', () => finish(false));
          res.on('error', () => finish(false));
        }
      );

      request.on('error', () => resolve(false));
      request.setTimeout(timeoutMs, () => {
        request.destroy();
        resolve(false);
      });
    });
  }

  /**
   * Alias de rétrocompatibilité pour downloadFile
   */
  async downloadImage(url: string, destPath: string, redirectCount = 0): Promise<boolean> {
    return this.downloadFile(url, destPath, redirectCount);
  }

  /**
   * Détecte les médias locaux stockés à côté de la ROM (standard Batocera / RetroPie / EmulationStation)
   * ou dans le répertoire de médias centralisés.
   */
  detectLocalMedia(game: Game): Partial<Game> {
    const updatedMedia = { ...game.media };
    const romDir = path.dirname(game.path || '');
    const stem = path.basename(game.filename || game.title, path.extname(game.filename || ''));

    // 1. Vidéo de gameplay locale (ex: Super Mario.mp4, Super Mario-video.mp4, media/videos/...)
    const videoCandidates = [
      path.join(storage.mediaDir, 'videos', `${game.id}.mp4`),
      path.join(storage.mediaDir, 'videos', `${game.id}.webm`),
      path.join(romDir, `${stem}.mp4`),
      path.join(romDir, `${stem}-video.mp4`),
      path.join(romDir, 'videos', `${stem}.mp4`),
      path.join(romDir, 'snap', `${stem}.mp4`),
      path.join(process.cwd(), 'public', 'videos', `${game.id}.mp4`),
    ];
    for (const vPath of videoCandidates) {
      if (fs.existsSync(vPath)) {
        updatedMedia.video = vPath.startsWith(storage.mediaDir)
          ? `media/videos/${path.basename(vPath)}`
          : vPath;
        break;
      }
    }

    // 2. Notice / Manuel de jeu PDF local (ex: Zelda.pdf, Zelda-manual.pdf, manuals/Zelda.pdf)
    const manualCandidates = [
      path.join(storage.mediaDir, 'manuals', `${game.id}.pdf`),
      path.join(romDir, `${stem}.pdf`),
      path.join(romDir, `${stem}-manual.pdf`),
      path.join(romDir, 'manuals', `${stem}.pdf`),
      path.join(process.cwd(), 'public', 'manuals', `${stem}.pdf`),
      path.join(process.cwd(), 'public', 'manuals', `${game.id}.pdf`),
    ];
    for (const mPath of manualCandidates) {
      if (fs.existsSync(mPath)) {
        updatedMedia.manual = mPath.startsWith(storage.mediaDir)
          ? `media/manuals/${path.basename(mPath)}`
          : mPath;
        break;
      }
    }

    // 3. Boîte 3D locale
    const box3dCandidates = [
      path.join(storage.mediaDir, 'boxarts3d', `${game.id}.png`),
      path.join(romDir, 'box3d', `${stem}.png`),
      path.join(romDir, `${stem}-3d.png`),
    ];
    for (const bPath of box3dCandidates) {
      if (fs.existsSync(bPath)) {
        updatedMedia.boxart3d = bPath.startsWith(storage.mediaDir)
          ? `media/boxarts3d/${path.basename(bPath)}`
          : bPath;
        break;
      }
    }

    // 4. Écran titre local
    const titleCandidates = [
      path.join(storage.mediaDir, 'titles', `${game.id}.png`),
      path.join(romDir, 'titles', `${stem}.png`),
    ];
    for (const tPath of titleCandidates) {
      if (fs.existsSync(tPath)) {
        updatedMedia.titleScreen = tPath.startsWith(storage.mediaDir)
          ? `media/titles/${path.basename(tPath)}`
          : tPath;
        break;
      }
    }

    // 5. Wheel / Logo transparent local
    const wheelCandidates = [
      path.join(storage.mediaDir, 'wheels', `${game.id}.png`),
      path.join(romDir, 'wheels', `${stem}.png`),
    ];
    for (const wPath of wheelCandidates) {
      if (fs.existsSync(wPath)) {
        updatedMedia.wheel = wPath.startsWith(storage.mediaDir)
          ? `media/wheels/${path.basename(wPath)}`
          : wPath;
        break;
      }
    }

    return { media: updatedMedia };
  }

  /**
   * Scrape les médias depuis Libretro Thumbnails CDN (Gratuit, rapide, sans clé)
   * Récupère : Jaquette 2D (Named_Boxarts), Capture en jeu (Named_Snaps) et Écran Titre (Named_Titles)
   */
  private libretroIndexCache = new Map<string, string[]>();

  async getLibretroIndex(libretroSystem: string, folder: string): Promise<string[]> {
    const cacheKey = `${libretroSystem}/${folder}`;
    const cached = this.libretroIndexCache.get(cacheKey);
    if (cached && cached.length > 0) return cached;

    // 1. Cache sur disque local
    const diskCacheFile = path.join(storage.mediaDir, `.idx-${libretroSystem}-${folder}.json`);
    try {
      if (fs.existsSync(diskCacheFile)) {
        const stats = fs.statSync(diskCacheFile);
        // Valide 14 jours
        if (Date.now() - stats.mtimeMs < 14 * 24 * 3600 * 1000) {
          const content = JSON.parse(fs.readFileSync(diskCacheFile, 'utf8'));
          if (Array.isArray(content) && content.length > 0) {
            this.libretroIndexCache.set(cacheKey, content);
            return content;
          }
        }
      }
    } catch {}

    const names: string[] = [];

    // 2. Récupération ultra-rapide sans quota via le tree-list GitHub
    try {
      const res = await fetch(`https://github.com/libretro-thumbnails/${libretroSystem}/find/master`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) RetroMad/2.0' },
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok) {
        const html = await res.text();
        const match = html.match(/tree-list\/([a-f0-9]+)/);
        if (match) {
          const listRes = await fetch(`https://github.com/libretro-thumbnails/${libretroSystem}/tree-list/${match[1]}`, {
            headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(15000),
          });
          if (listRes.ok) {
            const data = (await listRes.json()) as any;
            const prefix = `${folder}/`;
            if (Array.isArray(data?.paths)) {
              for (const p of data.paths) {
                if (typeof p === 'string' && p.startsWith(prefix)) {
                  names.push(p.slice(prefix.length));
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn(`[Scraper] Échec récupération tree-list pour ${libretroSystem} :`, e);
    }

    // 3. Repli API GitHub paginée si nécessaire
    if (names.length === 0) {
      try {
        for (let page = 1; page <= 6; page++) {
          const url = `https://api.github.com/repos/libretro-thumbnails/${libretroSystem}/contents/${folder}?per_page=1000&page=${page}`;
          const res = await fetch(url, {
            headers: { 'User-Agent': 'RetroMad-Scraper/2.0', Accept: 'application/vnd.github+json' },
            signal: AbortSignal.timeout(10000),
          });
          if (!res.ok) break;
          const list = (await res.json()) as Array<{ name: string }>;
          if (!Array.isArray(list) || list.length === 0) break;
          names.push(...list.map((f) => f.name));
          if (list.length < 1000) break;
        }
      } catch {}
    }

    if (names.length > 0) {
      this.libretroIndexCache.set(cacheKey, names);
      try {
        fs.writeFileSync(diskCacheFile, JSON.stringify(names), 'utf8');
      } catch {}
    }

    return names;
  }


  async scrapeLibretro(game: Game): Promise<Partial<Game>> {
    const system = SYSTEMS.find((s) => s.id === game.systemId);
    if (!system) return {};

    const libretroSystem = system.libretroSystemName;
    const baseUrl = `https://raw.githubusercontent.com/libretro-thumbnails/${libretroSystem}/master`;

    // Détection de région
    const detectRegion = (filename: string) => {
      if (/\((?:USA|U)(?:,\s*Europe)?\)/i.test(filename) || /\b(USA|US|U)\b/i.test(filename)) return 'usa';
      if (/\((?:Europe|EUR|E|Fra|FR|F)(?:,\s*USA)?\)/i.test(filename) || /\b(Europe|EUR|E|France|French|FRA|FR)\b/i.test(filename)) return 'europe';
      if (/\((?:Japan|JPN|J)(?:,\s*USA)?\)/i.test(filename) || /\b(Japan|JPN|JAP|J)\b/i.test(filename)) return 'japan';
      if (/\((?:World|W)\)/i.test(filename) || /\b(World|W)\b/i.test(filename)) return 'world';
      return 'unknown';
    };
    const REGION_ORDERS: Record<string, string[]> = {
      usa:     [' (USA)', ' (USA, Europe)', ' (World)', ' (Europe)', ' (Japan)', ''],
      europe:  [' (Europe)', ' (Europe, USA)', ' (USA, Europe)', ' (World)', ' (USA)', ' (France)', ' (Germany)', ' (Japan)', ''],
      japan:   [' (Japan)', ' (Japan, USA)', ' (World)', ' (USA)', ' (Europe)', ''],
      world:   [' (World)', ' (USA)', ' (Europe)', ' (Japan)', ''],
      unknown: [' (Europe)', ' (USA)', ' (USA, Europe)', ' (World)', ' (Japan)', ''],
    };
    const regionPriority = detectRegion(game.filename || game.title);
    const regionTags = REGION_ORDERS[regionPriority] ?? REGION_ORDERS.unknown;

    const toRoman = (n: number): string => {
      const map: Array<[number, string]> = [[50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
      let out = '';
      for (const [v, s] of map) { while (n >= v) { out += s; n -= v; } }
      return out;
    };
    const base = game.cleanTitle || game.title;
    const nameBases = new Set<string>([base]);

    // Séparation CamelCase / PascalCase (ex: BadDudes -> Bad Dudes, DragonNinja -> Dragon Ninja)
    const splitCamel = base
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .trim();
    if (splitCamel !== base) {
      nameBases.add(splitCamel);
      nameBases.add(splitCamel.replace(/\bvs\b/i, 'vs.'));
      nameBases.add(splitCamel.replace(/\bvs\.?\b/i, 'vs'));
      nameBases.add(splitCamel.replace(/\s*vs\.?\s*/i, ' - '));
    }
    nameBases.add(base.replace(/\bvs\b/i, 'vs.'));
    nameBases.add(base.replace(/\bvs\.?\b/i, 'vs.'));

    if (base.includes(', The')) nameBases.add('The ' + base.replace(', The', '').trim());
    if (base.includes(', A')) nameBases.add('A ' + base.replace(', A', '').trim());
    if (base.startsWith('The ')) nameBases.add(base.replace(/^The\s+/i, '').trim());

    const romanized = base.replace(/\b(\d{1,2})\b/g, (m) => {
      const n = parseInt(m, 10);
      return n >= 1 && n <= 50 ? toRoman(n) : m;
    });
    nameBases.add(romanized);
    nameBases.add(base.replace(/\bBros\b/g, 'Bros.').replace(/\bDr\b/g, 'Dr.'));
    nameBases.add(romanized.replace(/\bBros\b/g, 'Bros.').replace(/\bDr\b/g, 'Dr.'));


    const candidates: string[] = [];
    for (const nb of nameBases) {
      for (const tag of regionTags) {
        candidates.push(nb + tag);
      }
    }
    if (game.filename) {
      const fileStem = path.basename(game.filename, path.extname(game.filename));
      if (!candidates.includes(fileStem)) candidates.push(fileStem);
    }
    if (game.title && !candidates.includes(game.title)) {
      candidates.unshift(game.title);
    }

    const boxartDest = path.join(storage.mediaDir, 'boxarts', `${game.id}.png`);
    const snapDest = path.join(storage.mediaDir, 'snaps', `${game.id}.png`);
    const titleDest = path.join(storage.mediaDir, 'titles', `${game.id}.png`);

    let foundBoxart = fs.existsSync(boxartDest);
    let foundSnap = fs.existsSync(snapDest);
    let foundTitle = fs.existsSync(titleDest);

    // 1. Recherche Jaquette 2D (Named_Boxarts)
    if (!foundBoxart) {
      for (const name of candidates) {
        const safeName = name.replace(/[:\/\\*?"<>|]/g, '_');
        const boxartUrl = `${baseUrl}/Named_Boxarts/${encodeURIComponent(safeName)}.png`;
        if (await this.downloadFile(boxartUrl, boxartDest)) {
          foundBoxart = true;
          break;
        }
      }

      // Recherche floue si non trouvé
      if (!foundBoxart) {
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        const boxartNames = await this.getLibretroIndex(libretroSystem, 'Named_Boxarts');
        const wanted = normalize(base);
        if (wanted && boxartNames.length > 0) {
          const match = boxartNames.find((n) => normalize(n.replace(/\.png$/i, '')).startsWith(wanted));
          if (match) {
            const boxartUrl = `${baseUrl}/Named_Boxarts/${encodeURIComponent(match.replace(/\.png$/i, ''))}.png`;
            if (await this.downloadFile(boxartUrl, boxartDest)) {
              foundBoxart = true;
            }
          }
        }
      }
    }

    // 2. Recherche Capture de jeu (Named_Snaps)
    if (!foundSnap) {
      for (const name of candidates) {
        const safeName = name.replace(/[:\/\\*?"<>|]/g, '_');
        const snapUrl = `${baseUrl}/Named_Snaps/${encodeURIComponent(safeName)}.png`;
        if (await this.downloadFile(snapUrl, snapDest)) {
          foundSnap = true;
          break;
        }
      }
    }

    // 3. Recherche Écran Titre (Named_Titles)
    if (!foundTitle) {
      for (const name of candidates) {
        const safeName = name.replace(/[:\/\\*?"<>|]/g, '_');
        const titleUrl = `${baseUrl}/Named_Titles/${encodeURIComponent(safeName)}.png`;
        if (await this.downloadFile(titleUrl, titleDest)) {
          foundTitle = true;
          break;
        }
      }
    }

    const updatedMedia = { ...game.media };
    if (foundBoxart) updatedMedia.boxart2d = `media/boxarts/${game.id}.png`;
    if (foundSnap) updatedMedia.snap = `media/snaps/${game.id}.png`;
    if (foundTitle) updatedMedia.titleScreen = `media/titles/${game.id}.png`;

    return { media: updatedMedia };
  }

  /**
   * Recherche complète ScreenScraper :
   * Métadonnées complètes, Jaquette 3D, Écran titre, Wheel (Logo transparent),
   * Vidéo MP4 de gameplay et Notice PDF d'époque.
   */
  async scrapeScreenScraper(game: Game, user?: string, pass?: string): Promise<Partial<Game>> {
    if (!user || !pass) return {};

    try {
      const url = `https://api.screenscraper.fr/api2/jeuInfos.php?devid=anonymous&devpassword=anonymous&softname=RetroMad&output=json&ssid=${encodeURIComponent(user)}&sspassword=${encodeURIComponent(pass)}&romnom=${encodeURIComponent(game.filename)}&crc=${game.crc32 || ''}&md5=${game.md5 || ''}`;

      const res = await fetch(url, { headers: { 'User-Agent': 'RetroMad/2.0' } });
      if (!res.ok) return {};

      const rawText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch {
        // Erreur de login/quota ScreenScraper retournée en texte brut
        return {};
      }
      if (!data?.response?.jeu) return {};


      const jeu = data.response.jeu;
      const metadata = { ...game.metadata };
      const media = { ...game.media };

      // ── Métadonnées texte ──
      if (jeu.dates && jeu.dates.length > 0) {
        metadata.releaseDate = jeu.dates[0].text;
      }
      if (jeu.developpeur?.text) {
        metadata.developer = jeu.developpeur.text;
      }
      if (jeu.editeur?.text) {
        metadata.publisher = jeu.editeur.text;
      }
      if (jeu.genres && jeu.genres.length > 0) {
        metadata.genres = jeu.genres
          .map((g: any) => g.noms?.find((n: any) => n.langue === 'fr')?.text || g.noms?.[0]?.text)
          .filter(Boolean);
      }
      if (jeu.joueurs?.text) {
        metadata.players = jeu.joueurs.text;
      }
      if (jeu.note?.text) {
        metadata.rating = Math.round(parseFloat(jeu.note.text) * 5); // /20 -> /100
      }
      if (jeu.classification?.pegi?.text) {
        metadata.esrbOrPegi = `PEGI ${jeu.classification.pegi.text}`;
      } else if (jeu.classification?.esrb?.text) {
        metadata.esrbOrPegi = `ESRB ${jeu.classification.esrb.text}`;
      }

      // Synopsis en français prioritaire
      const synopsisFr = jeu.synopsis?.find((s: any) => s.langue === 'fr')?.text;
      const synopsisEn = jeu.synopsis?.find((s: any) => s.langue === 'en')?.text;
      metadata.synopsis = synopsisFr || synopsisEn || metadata.synopsis;

      // ── Médias avancés ScreenScraper (Vidéos, Notices PDF, 3D, Wheel) ──
      const mediaList: Array<{ type: string; url: string; format?: string; region?: string }> = jeu.medias || [];

      // 1. Vidéo MP4 de gameplay (video-normalized ou video)
      if (!media.video) {
        const videoEntry = mediaList.find((m) => m.type === 'video-normalized' || m.type === 'video');
        if (videoEntry?.url) {
          const videoDest = path.join(storage.mediaDir, 'videos', `${game.id}.mp4`);
          if (await this.downloadFile(videoEntry.url, videoDest, 0, 45000)) {
            media.video = `media/videos/${game.id}.mp4`;
          }
        }
      }

      // 2. Manuel / Notice d'époque (format PDF)
      if (!media.manual) {
        const manualEntry = mediaList.find((m) => m.type === 'manuel' || m.type === 'manual');
        if (manualEntry?.url) {
          const manualDest = path.join(storage.mediaDir, 'manuals', `${game.id}.pdf`);
          if (await this.downloadFile(manualEntry.url, manualDest, 0, 35000)) {
            media.manual = `media/manuals/${game.id}.pdf`;
          }
        }
      }

      // 3. Boîte 3D (boite-3D / box-3d)
      if (!media.boxart3d) {
        const box3dEntry = mediaList.find((m) => m.type === 'boite-3D' || m.type === 'box-3d');
        if (box3dEntry?.url) {
          const box3dDest = path.join(storage.mediaDir, 'boxarts3d', `${game.id}.png`);
          if (await this.downloadFile(box3dEntry.url, box3dDest)) {
            media.boxart3d = `media/boxarts3d/${game.id}.png`;
          }
        }
      }

      // 4. Wheel / Logo transparent (wheel / clearlogo)
      if (!media.wheel) {
        const wheelEntry = mediaList.find((m) => m.type === 'wheel');
        if (wheelEntry?.url) {
          const wheelDest = path.join(storage.mediaDir, 'wheels', `${game.id}.png`);
          if (await this.downloadFile(wheelEntry.url, wheelDest)) {
            media.wheel = `media/wheels/${game.id}.png`;
          }
        }
      }

      // 5. Écran-titre
      if (!media.titleScreen) {
        const titleEntry = mediaList.find((m) => m.type === 'screen-title' || m.type === 'titre');
        if (titleEntry?.url) {
          const titleDest = path.join(storage.mediaDir, 'titles', `${game.id}.png`);
          if (await this.downloadFile(titleEntry.url, titleDest)) {
            media.titleScreen = `media/titles/${game.id}.png`;
          }
        }
      }

      // 6. Fanart / Arrière-plan HD
      if (!media.fanart) {
        const fanartEntry = mediaList.find((m) => m.type === 'fanart');
        if (fanartEntry?.url) {
          const fanartDest = path.join(storage.mediaDir, 'fanarts', `${game.id}.png`);
          if (await this.downloadFile(fanartEntry.url, fanartDest)) {
            media.fanart = `media/fanarts/${game.id}.png`;
          }
        }
      }

      return { metadata, media };
    } catch (e) {
      console.warn('[ScreenScraper] Erreur:', e);
      return {};
    }
  }

  /**
   * Scrapeur de notices et documentations ouvertes (Archive.org & Libretro Docs)
   * pour récupérer les manuels PDF officiels même sans compte ScreenScraper.
   */
  async scrapeOpenManuals(game: Game): Promise<Partial<Game>> {
    if (game.media?.manual) return {};

    const cleanTitle = (game.cleanTitle || game.title).replace(/[:\/\\*?"<>|]/g, '');
    const manualDest = path.join(storage.mediaDir, 'manuals', `${game.id}.pdf`);

    // Dépôt communautaire de manuels rétro
    const candidates = [
      `https://archive.org/download/retro-game-manuals/${encodeURIComponent(cleanTitle)}.pdf`,
      `https://raw.githubusercontent.com/libretro-thumbnails/RetroArch-Docs/master/manuals/${game.systemId}/${encodeURIComponent(cleanTitle)}.pdf`,
    ];

    for (const url of candidates) {
      try {
        if (await this.downloadFile(url, manualDest, 0, 15000)) {
          return { media: { ...game.media, manual: `media/manuals/${game.id}.pdf` } };
        }
      } catch {
        // Source suivante
      }
    }

    return {};
  }

  /**
   * Scrape complet d'un jeu : « LA TOTALE »
   * 1. Détection des médias locaux existants (vidéos, notices, jaquettes 3D)
   * 2. Scraping Libretro (Boxarts 2D, Screenshots de jeu, Écrans-titres)
   * 3. Scraping ScreenScraper (Métadonnées riches, Vidéo MP4, Notice PDF, Boîte 3D, Wheel)
   * 4. Scraping notices ouvertes (Archive.org)
   */
  async scrapeGame(game: Game, settings = storage.getSettings()): Promise<Game> {
    let updatedGame = { ...game };

    // 1. Détection locale immédiate
    const localResult = this.detectLocalMedia(updatedGame);
    updatedGame = {
      ...updatedGame,
      media: { ...updatedGame.media, ...localResult.media },
    };

    // 2. Scraping Libretro (Boxarts 2D, Snaps, Titles)
    if (settings.scraperSource === 'libretro' || settings.scraperSource === 'both') {
      const libretroResult = await this.scrapeLibretro(updatedGame);
      updatedGame = {
        ...updatedGame,
        media: { ...updatedGame.media, ...libretroResult.media },
      };
    }

    // 3. Scraping ScreenScraper (La totale : Métadonnées, Vidéos MP4, Notices PDF, Boîtes 3D, Wheels)
    if ((settings.scraperSource === 'screenscraper' || settings.scraperSource === 'both') && settings.screenScraperUser) {
      const ssResult = await this.scrapeScreenScraper(updatedGame, settings.screenScraperUser, settings.screenScraperPassword);
      updatedGame = {
        ...updatedGame,
        metadata: { ...updatedGame.metadata, ...ssResult.metadata },
        media: { ...updatedGame.media, ...ssResult.media },
      };
    }

    // 4. Recherche de notices PDF ouvertes si toujours manquante
    if (!updatedGame.media?.manual) {
      const manualResult = await this.scrapeOpenManuals(updatedGame);
      if (manualResult.media?.manual) {
        updatedGame = {
          ...updatedGame,
          media: { ...updatedGame.media, ...manualResult.media },
        };
      }
    }

    updatedGame.scrapedAt = new Date().toISOString();
    return updatedGame;
  }

  /**
   * Calcul de ressemblance textuelle floue entre deux chaînes (0 à 100)
   * Combine Dice Coefficient, Jaccard de mots-clés et bonus de sous-chaîne.
   */
  calculateSimilarity(str1: string, str2: string): number {
    const splitCamel1 = (str1 || '').replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase().trim();
    const splitCamel2 = (str2 || '').replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase().trim();
    if (splitCamel1 === splitCamel2) return 100;
    if (!splitCamel1 || !splitCamel2) return 0;

    const clean1 = splitCamel1.replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    const clean2 = splitCamel2.replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    if (clean1 === clean2) return 99;


    let score = 0;

    // 1. Sous-chaîne exacte
    if (clean2.includes(clean1) || clean1.includes(clean2)) {
      score = Math.max(score, 65);
    }

    // 2. Chevauchement de mots (Tokens)
    const words1 = clean1.split(' ').filter((w) => w.length > 1);
    const words2 = clean2.split(' ').filter((w) => w.length > 1);
    if (words1.length > 0 && words2.length > 0) {
      const set1 = new Set(words1);
      const set2 = new Set(words2);
      let common = 0;
      for (const w of set1) {
        if (set2.has(w)) common++;
      }
      const tokenRatio = common / Math.max(set1.size, set2.size);
      if (common === set1.size) {
        score = Math.max(score, 75 + Math.round(tokenRatio * 20));
      } else {
        score = Math.max(score, Math.round(tokenRatio * 80));
      }
    }

    // 3. Coefficient de Dice (bigrammes)
    const getBigrams = (str: string) => {
      const map = new Map<string, number>();
      for (let i = 0; i < str.length - 1; i++) {
        const bg = str.substring(i, i + 2);
        map.set(bg, (map.get(bg) || 0) + 1);
      }
      return map;
    };

    const b1 = getBigrams(clean1);
    const b2 = getBigrams(clean2);
    let intersection = 0;
    for (const [key, count] of b1) {
      if (b2.has(key)) {
        intersection += Math.min(count, b2.get(key)!);
      }
    }
    const totalBigrams = Math.max(1, (clean1.length - 1) + (clean2.length - 1));
    const diceScore = Math.round((2 * intersection / totalBigrams) * 100);
    score = Math.max(score, diceScore);

    return Math.min(100, score);
  }

  /**
   * Recherche les candidats de titres similaires lorsqu'un jeu n'a pas été trouvé
   * ou lorsque l'utilisateur veut corriger le titre.
   */
  async searchCandidates(
    game: Game,
    customQuery?: string,
    settings = storage.getSettings()
  ): Promise<ScrapeCandidate[]> {
    const query = (customQuery || game.cleanTitle || game.title || '').trim();
    if (!query) return [];

    const system = SYSTEMS.find((s) => s.id === game.systemId);
    const candidatesMap = new Map<string, ScrapeCandidate>();

    // ── 1. Recherche dans l'index Libretro pour ce système ──
    if (system?.libretroSystemName) {
      const libretroSystem = system.libretroSystemName;
      try {
        const boxartNames = await this.getLibretroIndex(libretroSystem, 'Named_Boxarts');
        for (const rawName of boxartNames) {
          const title = rawName.replace(/\.png$/i, '');
          const cleanTitle = title.replace(/\s*\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').trim();

          const score = this.calculateSimilarity(query, cleanTitle);
          if (score >= 20 || cleanTitle.toLowerCase().includes(query.toLowerCase())) {
            // Détection de région
            let region = 'Monde';
            if (/\b(?:france|fra|fr)\b/i.test(title)) region = 'France';
            else if (/\b(?:europe|eur)\b/i.test(title)) region = 'Europe';
            else if (/\b(?:usa|us)\b/i.test(title)) region = 'USA';
            else if (/\b(?:japan|jap|jpn)\b/i.test(title)) region = 'Japon';

            const boxartUrl = `https://raw.githubusercontent.com/libretro-thumbnails/${encodeURIComponent(libretroSystem)}/master/Named_Boxarts/${encodeURIComponent(title)}.png`;

            const existing = candidatesMap.get(cleanTitle.toLowerCase());
            if (!existing || existing.score < score) {
              candidatesMap.set(cleanTitle.toLowerCase(), {
                title,
                cleanTitle,
                systemId: game.systemId,
                score,
                boxartUrl,
                source: 'libretro',
                region,
              });
            }
          }
        }
      } catch (e) {
        console.warn('[Scraper] Erreur recherche Libretro candidates :', e);
      }
    }

    // ── 2. Recherche ScreenScraper si compte configuré ──
    if (settings.screenScraperUser && settings.screenScraperPassword) {
      try {
        const user = settings.screenScraperUser;
        const pass = settings.screenScraperPassword;
        const ssUrl = `https://api.screenscraper.fr/api2/jeuRecherche.php?devid=anonymous&devpassword=anonymous&softname=RetroMad&output=json&ssid=${encodeURIComponent(user)}&sspassword=${encodeURIComponent(pass)}&recherche=${encodeURIComponent(query)}`;
        const res = await fetch(ssUrl, {
          headers: { 'User-Agent': 'RetroMad/2.0' },
          signal: AbortSignal.timeout(10000),
        });
        if (res.ok) {
          const rawText = await res.text();
          let data: any = null;
          try {
            data = JSON.parse(rawText);
          } catch {
            data = null;
          }
          const ssGames: any[] = data?.response?.jeux || [];

          for (const ssJeu of ssGames) {
            const nomFr = ssJeu.noms?.find((n: any) => n.region === 'eu' || n.region === 'fr')?.text;
            const nomDefault = ssJeu.noms?.[0]?.text || ssJeu.nom;
            const title = nomFr || nomDefault;
            if (!title) continue;

            const cleanTitle = title.replace(/\s*\([^)]*\)/g, '').trim();
            const score = this.calculateSimilarity(query, cleanTitle);

            const boxartMedia = ssJeu.medias?.find((m: any) => m.type === 'boite-2D' || m.type === 'box-2D');
            const boxartUrl = boxartMedia?.url;

            const existing = candidatesMap.get(cleanTitle.toLowerCase());
            if (!existing || existing.score < score) {
              candidatesMap.set(cleanTitle.toLowerCase(), {
                title,
                cleanTitle,
                systemId: game.systemId,
                score,
                boxartUrl,
                source: 'screenscraper',
                region: nomFr ? 'France' : 'Monde',
                extra: {
                  year: ssJeu.dates?.[0]?.text,
                  developer: ssJeu.developpeur?.text,
                },
              });
            }
          }
        }
      } catch (e) {
        console.warn('[Scraper] Erreur ScreenScraper recherche candidates :', e);
      }
    }

    // ── 3. Recherche locale dans la bibliothèque actuelle ──
    try {
      const allGames = storage.getGames();
      for (const g of allGames) {
        if (g.id === game.id) continue;
        const score = this.calculateSimilarity(query, g.cleanTitle);
        if (score >= 35) {
          const existing = candidatesMap.get(g.cleanTitle.toLowerCase());
          if (!existing) {
            candidatesMap.set(g.cleanTitle.toLowerCase(), {
              title: g.title,
              cleanTitle: g.cleanTitle,
              systemId: g.systemId,
              score,
              boxartUrl: g.media?.boxart2d,
              source: 'local',
              region: g.region,
              extra: {
                year: g.metadata?.releaseDate,
                developer: g.metadata?.developer,
              },
            });
          }
        }
      }
    } catch {}

    // Tri par score décroissant
    const sorted = Array.from(candidatesMap.values()).sort((a, b) => b.score - a.score);
    return sorted.slice(0, 30);
  }

  /**
   * Scrape spécifiquement un jeu avec un titre choisi par l'utilisateur
   * (téléchargement direct de tous les médias correspondant à ce titre)
   */
  async scrapeGameWithTitle(
    game: Game,
    chosenTitle: string,
    settings = storage.getSettings()
  ): Promise<Game> {
    const cleanChosen = chosenTitle
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/\[[^\]]*\]/g, '')
      .trim();

    const targetGame: Game = {
      ...game,
      title: chosenTitle,
      cleanTitle: cleanChosen || chosenTitle,
    };

    const system = SYSTEMS.find((s) => s.id === game.systemId);
    let updatedMedia = { ...game.media };

    // 1. Libretro avec le nom exact sélectionné
    if (system?.libretroSystemName) {
      const libretroSystem = system.libretroSystemName;
      const baseUrl = `https://raw.githubusercontent.com/libretro-thumbnails/${libretroSystem}/master`;
      const safeName = chosenTitle.replace(/[:\/\\*?"<>|]/g, '_');

      const boxartDest = path.join(storage.mediaDir, 'boxarts', `${game.id}.png`);
      const snapDest = path.join(storage.mediaDir, 'snaps', `${game.id}.png`);
      const titleDest = path.join(storage.mediaDir, 'titles', `${game.id}.png`);

      const boxartUrl = `${baseUrl}/Named_Boxarts/${encodeURIComponent(safeName)}.png`;
      if (await this.downloadFile(boxartUrl, boxartDest)) {
        updatedMedia.boxart2d = `media/boxarts/${game.id}.png`;
      }

      const snapUrl = `${baseUrl}/Named_Snaps/${encodeURIComponent(safeName)}.png`;
      if (await this.downloadFile(snapUrl, snapDest)) {
        updatedMedia.snap = `media/snaps/${game.id}.png`;
      }

      const titleUrl = `${baseUrl}/Named_Titles/${encodeURIComponent(safeName)}.png`;
      if (await this.downloadFile(titleUrl, titleDest)) {
        updatedMedia.titleScreen = `media/titles/${game.id}.png`;
      }
    }

    targetGame.media = updatedMedia;

    // 2. Détection locale
    const localResult = this.detectLocalMedia(targetGame);
    targetGame.media = { ...targetGame.media, ...localResult.media };

    // 3. ScreenScraper avec le nom propre
    if (settings.screenScraperUser && settings.screenScraperPassword) {
      try {
        const ssResult = await this.scrapeScreenScraper(
          targetGame,
          settings.screenScraperUser,
          settings.screenScraperPassword
        );
        targetGame.metadata = { ...targetGame.metadata, ...ssResult.metadata };
        targetGame.media = { ...targetGame.media, ...ssResult.media };
      } catch {}
    }

    // 4. Manuels d'archives
    if (!targetGame.media?.manual) {
      const manualResult = await this.scrapeOpenManuals(targetGame);
      if (manualResult.media?.manual) {
        targetGame.media.manual = manualResult.media.manual;
      }
    }

    targetGame.scrapedAt = new Date().toISOString();
    return targetGame;
  }
}

export const scraper = new ScraperService();

