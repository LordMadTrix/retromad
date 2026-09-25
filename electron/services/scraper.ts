import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { Game } from '../types';
import { SYSTEMS } from '../data/systems';
import { storage } from './storage';

export class ScraperService {
  /**
   * Télécharge une image depuis une URL et la sauvegarde localement
   */
  async downloadImage(url: string, destPath: string, redirectCount = 0): Promise<boolean> {
    if (redirectCount > 5) {
      console.warn(`[Scraper] Trop de redirections pour ${url}`);
      return false;
    }

    return new Promise((resolve) => {
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url);
      } catch {
        console.warn(`[Scraper] URL d'image invalide : ${url}`);
        resolve(false);
        return;
      }

      const client = parsedUrl.protocol === 'https:' ? https : http;

      const request = client.get(url, { headers: { 'User-Agent': 'RetroMad-Scraper/1.0' } }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          const redirectUrl = new URL(res.headers.location, parsedUrl).toString();
          this.downloadImage(redirectUrl, destPath, redirectCount + 1).then(resolve);
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
            fs.unlinkSync(temporaryPath);
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
              fs.renameSync(temporaryPath, destPath);
              completed = true;
              resolve(true);
            } catch (renameError) {
              console.warn(`[Scraper] Impossible de mettre l'image en cache : ${destPath}`, renameError);
              finish(false);
            }
          });
        });

        fileStream.on('error', () => {
          finish(false);
        });

        res.on('error', () => finish(false));
      });

      request.on('error', () => {
        resolve(false);
      });

      request.setTimeout(10000, () => {
        request.destroy();
        resolve(false);
      });
    });
  }

  /**
   * Scrape les médias depuis Libretro Thumbnails CDN (Gratuit, rapide, sans clé)
   */
  // Cache des listings libretro (1 requête paginée par système/dossier)
  private libretroIndexCache = new Map<string, string[]>();

  async getLibretroIndex(libretroSystem: string, folder: string): Promise<string[]> {
    const cacheKey = `${libretroSystem}/${folder}`;
    const cached = this.libretroIndexCache.get(cacheKey);
    if (cached) return cached;

    const names: string[] = [];
    try {
      // Récupère jusqu'à 6 pages de 1000 (60 000 fichiers, largement assez)
      for (let page = 1; page <= 6; page++) {
        const url = `https://api.github.com/repos/libretro-thumbnails/${libretroSystem}/contents/${folder}?per_page=1000&page=${page}`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'RetroMad-Scraper/1.0', Accept: 'application/vnd.github+json' },
          signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) break;
        const list = (await res.json()) as Array<{ name: string }>;
        if (!Array.isArray(list) || list.length === 0) break;
        names.push(...list.map((f) => f.name));
        if (list.length < 1000) break;
      }
    } catch {
      // réseau indisponible : on renvoie ce qu'on a
    }
    this.libretroIndexCache.set(cacheKey, names);
    return names;
  }

  async scrapeLibretro(game: Game): Promise<Partial<Game>> {
    const system = SYSTEMS.find(s => s.id === game.systemId);
    if (!system) return {};

    const libretroSystem = system.libretroSystemName;
    const baseUrl = `https://raw.githubusercontent.com/libretro-thumbnails/${libretroSystem}/master`;

    // Essayer différentes variantes de noms pour trouver la jaquette.
    // Les noms No-Intro varient : régions, chiffres romains (2 -> II),
    // points d'abréviation (Bros -> Bros.), suffixes (Rev A) (Unl)...
    const toRoman = (n: number): string => {
      const map: Array<[number, string]> = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
      let out = '';
      for (const [v, s] of map) { while (n >= v) { out += s; n -= v; } }
      return out;
    };
    const base = game.cleanTitle || game.title;
    const romanized = base.replace(/\b(\d{1,2})\b/g, (m) => {
      const n = parseInt(m, 10);
      return n >= 1 && n <= 20 ? toRoman(n) : m;
    });
    const dotted = base.replace(/\bBros\b/g, 'Bros.');
    const romanDotted = romanized.replace(/\bBros\b/g, 'Bros.');
    const nameBases = [...new Set([base, romanized, dotted, romanDotted])];
    const regionTags = [' (USA)', ' (Europe)', ' (Japan)', ' (USA, Europe)', ' (World)', ''];

    const candidates: string[] = [];
    for (const nb of nameBases) {
      for (const tag of regionTags) {
        candidates.push(nb + tag);
      }
    }
    // Le titre brut peut contenir des suffixes (Rev A) (Unl) utiles
    if (game.title && !nameBases.includes(game.title)) {
      candidates.unshift(game.title);
    }

    const boxartDest = path.join(storage.mediaDir, 'boxarts', `${game.id}.png`);
    const snapDest = path.join(storage.mediaDir, 'snaps', `${game.id}.png`);

    let foundBoxart = false;
    let foundSnap = false;

    // 0. Index des noms réels du dépôt libretro (listing GitHub paginé, cache).
    //    Les noms No-Intro ont des suffixes imprévisibles ((Rev A) (Unl)...) :
    //    matcher par préfixe normalisé est plus fiable que deviner.
    const normalize = (s: string) =>
      s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const boxartNames = await this.getLibretroIndex(libretroSystem, 'Named_Boxarts');

    // 1. Recherche Jaquette 2D : variantes d'abord, puis index par préfixe
    for (const name of candidates) {
      const safeName = name.replace(/[:\/\\*?"<>|]/g, '_');
      const boxartUrl = `${baseUrl}/Named_Boxarts/${encodeURIComponent(safeName)}.png`;
      if (await this.downloadImage(boxartUrl, boxartDest)) {
        foundBoxart = true;
        break;
      }
    }
    if (!foundBoxart && boxartNames.length > 0) {
      const wanted = normalize(base);
      if (wanted) {
        const match = boxartNames.find((n) => {
          const stem = n.replace(/\.png$/i, '');
          return normalize(stem).startsWith(wanted);
        });
        if (match) {
          const boxartUrl = `${baseUrl}/Named_Boxarts/${encodeURIComponent(match.replace(/\.png$/i, ''))}.png`;
          if (await this.downloadImage(boxartUrl, boxartDest)) {
            foundBoxart = true;
          }
        }
      }
    }

    // 2. Recherche Capture de jeu (Snap) : mêmes variantes
    for (const name of candidates) {
      const safeName = name.replace(/[:\/\\*?"<>|]/g, '_');
      const snapUrl = `${baseUrl}/Named_Snaps/${encodeURIComponent(safeName)}.png`;
      if (await this.downloadImage(snapUrl, snapDest)) {
        foundSnap = true;
        break;
      }
    }

    const updatedMedia = { ...game.media };
    if (foundBoxart) {
      updatedMedia.boxart2d = `media/boxarts/${game.id}.png`;
    }
    if (foundSnap) {
      updatedMedia.snap = `media/snaps/${game.id}.png`;
    }

    return { media: updatedMedia };
  }

  /**
   * Recherche les métadonnées ScreenScraper (si utilisateur ou en mode public)
   */
  async scrapeScreenScraper(game: Game, user?: string, pass?: string): Promise<Partial<Game>> {
    if (!user || !pass) return {};

    try {
      const url = `https://api.screenscraper.fr/api2/jeuInfos.php?devid=anonymous&devpassword=anonymous&softname=RetroMad&output=json&ssid=${encodeURIComponent(user)}&sspassword=${encodeURIComponent(pass)}&romnom=${encodeURIComponent(game.filename)}&crc=${game.crc32 || ''}&md5=${game.md5 || ''}`;
      
      const res = await fetch(url, { headers: { 'User-Agent': 'RetroMad/1.0' } });
      if (!res.ok) return {};

      const data = await res.json() as any;
      if (!data?.response?.jeu) return {};

      const jeu = data.response.jeu;
      const metadata = { ...game.metadata };

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
        metadata.genres = jeu.genres.map((g: any) => g.noms?.find((n: any) => n.langue === 'fr')?.text || g.noms?.[0]?.text).filter(Boolean);
      }
      if (jeu.joueurs?.text) {
        metadata.players = jeu.joueurs.text;
      }
      if (jeu.note?.text) {
        metadata.rating = Math.round(parseFloat(jeu.note.text) * 5); // /20 -> /100
      }

      // Synopsis en français prioritaire
      const synopsisFr = jeu.synopsis?.find((s: any) => s.langue === 'fr')?.text;
      const synopsisEn = jeu.synopsis?.find((s: any) => s.langue === 'en')?.text;
      metadata.synopsis = synopsisFr || synopsisEn || metadata.synopsis;

      return { metadata };
    } catch (e) {
      console.warn('ScreenScraper error:', e);
      return {};
    }
  }

  /**
   * Scrape complet d'un jeu
   */
  async scrapeGame(game: Game, settings = storage.getSettings()): Promise<Game> {
    let updatedGame = { ...game };

    // 1. Scraping Libretro (Boxarts + Snaps)
    if (settings.scraperSource === 'libretro' || settings.scraperSource === 'both') {
      const libretroResult = await this.scrapeLibretro(updatedGame);
      updatedGame = {
        ...updatedGame,
        ...libretroResult,
        media: { ...updatedGame.media, ...libretroResult.media }
      };
    }

    // 2. Scraping ScreenScraper (Métadonnées & 3D box si configuré)
    if ((settings.scraperSource === 'screenscraper' || settings.scraperSource === 'both') && settings.screenScraperUser) {
      const ssResult = await this.scrapeScreenScraper(updatedGame, settings.screenScraperUser, settings.screenScraperPassword);
      updatedGame = {
        ...updatedGame,
        ...ssResult,
        metadata: { ...updatedGame.metadata, ...ssResult.metadata }
      };
    }

    return updatedGame;
  }
}

export const scraper = new ScraperService();
