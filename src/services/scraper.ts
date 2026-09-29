/**
 * Service de scraping unifié RetroMad — Version 2.0
 *
 * Sources supportées :
 *  1. Libretro Thumbnails CDN (jaquettes 2D + snaps + title screens) — sans clé API
 *  2. OpenVGDB (métadonnées JSON — année, studio, synopsis, joueurs, note) — sans clé API
 *  3. ScreenScraper (optionnel, nécessite un compte gratuit)
 *
 * Fonctionnalités :
 *  - Détection automatique de la région depuis le nom du fichier
 *  - Cache des URLs résolues dans localStorage (évite les re-requêtes réseau)
 *  - File de priorité : jeux sans jaquette d'abord, puis par score de priorité
 *  - Statistiques de session : trouvé / échoué / ignoré
 */

import { Game } from '../types';
import { SYSTEM_MAPPINGS } from './romScanner';

// ── Clé de cache localStorage ──────────────────────────────────────────────
const CACHE_KEY = 'retromad_scraper_url_cache_v2';
const MAX_CACHE_ENTRIES = 5000;

type UrlCacheEntry = { url: string; ts: number };
type UrlCache = Record<string, UrlCacheEntry>; // clé = "gameId:type"

function loadUrlCache(): UrlCache {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw) as UrlCache;
  } catch {}
  return {};
}

function saveUrlCache(cache: UrlCache): void {
  try {
    // Éviction LRU si trop grand
    const entries = Object.entries(cache);
    if (entries.length > MAX_CACHE_ENTRIES) {
      entries.sort((a, b) => a[1].ts - b[1].ts);
      const trimmed = Object.fromEntries(entries.slice(-MAX_CACHE_ENTRIES));
      localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
    } else {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
  } catch {}
}

// ── Détection de région depuis le nom de fichier ───────────────────────────
export interface RegionInfo {
  tag: string; // "(USA)" | "(Europe)" | "(Japan)" | …
  priority: 'usa' | 'europe' | 'japan' | 'world' | 'unknown';
}

const REGION_PATTERNS: Array<{ pattern: RegExp; tag: string; priority: RegionInfo['priority'] }> = [
  { pattern: /\(USA(?:,\s*Europe)?\)/i, tag: '(USA)', priority: 'usa' },
  { pattern: /\(USA(?:,\s*Japan)?\)/i, tag: '(USA, Japan)', priority: 'usa' },
  { pattern: /\(Europe(?:,\s*USA)?\)/i, tag: '(Europe)', priority: 'europe' },
  { pattern: /\(Europe(?:,\s*Japan)?\)/i, tag: '(Europe, Japan)', priority: 'europe' },
  { pattern: /\(Japan(?:,\s*USA)?\)/i, tag: '(Japan)', priority: 'japan' },
  { pattern: /\(Japan(?:,\s*Europe)?\)/i, tag: '(Japan, Europe)', priority: 'japan' },
  { pattern: /\(World\)/i, tag: '(World)', priority: 'world' },
  { pattern: /\(France\)/i, tag: '(France)', priority: 'europe' },
  { pattern: /\(Germany\)/i, tag: '(Germany)', priority: 'europe' },
  { pattern: /\(Spain\)/i, tag: '(Spain)', priority: 'europe' },
];

export function detectRegion(filename: string): RegionInfo {
  for (const { pattern, tag, priority } of REGION_PATTERNS) {
    if (pattern.test(filename)) {
      return { tag, priority };
    }
  }
  return { tag: '', priority: 'unknown' };
}

// ── Nettoyage du titre pour la recherche ─────────────────────────────────
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildCandidateNames(cleanTitle: string, rawTitle: string): string[] {
  // Conversion chiffres arabes → romains (pour No-Intro qui mélange les deux)
  const toRoman = (n: number): string => {
    const map: Array<[number, string]> = [
      [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
    ];
    let out = '';
    for (const [v, s] of map) {
      while (n >= v) { out += s; n -= v; }
    }
    return out;
  };

  const romanized = cleanTitle.replace(/\b(\d{1,2})\b/g, (m) => {
    const n = parseInt(m, 10);
    return n >= 1 && n <= 50 ? toRoman(n) : m;
  });
  const dotted = cleanTitle.replace(/\bBros\b/g, 'Bros.').replace(/\bDr\b/g, 'Dr.');
  const romanDotted = romanized.replace(/\bBros\b/g, 'Bros.').replace(/\bDr\b/g, 'Dr.');

  const bases = [...new Set([cleanTitle, romanized, dotted, romanDotted])];

  // Ajouter le titre brut s'il est différent (peut contenir des suffixes No-Intro utiles)
  if (rawTitle && !bases.includes(rawTitle)) {
    bases.unshift(rawTitle);
  }

  return bases;
}

// ── Probe HEAD avec timeout ─────────────────────────────────────────────
async function probeUrl(url: string, timeoutMs = 6000): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(timeoutMs),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── OpenVGDB — Métadonnées (gratuit, sans clé) ────────────────────────────
// API : https://github.com/OpenVGDB/OpenVGDB (JSON officiel sur GitHub Releases)
// On utilise le proxy public openvgdb.github.io qui expose une API REST simple.

interface OpenVGDBResult {
  releaseYear?: string;
  developer?: string;
  publisher?: string;
  genres?: string[];
  synopsis?: string;
  players?: string;
  rating?: number;
  boxartUrl?: string;
}

// Correspondances systemId → identifiant OpenVGDB
const OPENVGDB_SYSTEM_MAP: Record<string, string> = {
  snes: 'sfc',
  nes: 'nes',
  n64: 'n64',
  gba: 'gba',
  gbc: 'gbc',
  gb: 'gb',
  megadrive: 'genesis',
  mastersystem: 'sms',
  gamegear: 'gg',
  psx: 'ps',
  ps2: 'ps2',
  psp: 'psp',
  saturn: 'saturn',
  arcade: 'arcade',
  mame: 'arcade',
  neogeo: 'ngp',
  gameboy: 'gb',
  atari2600: 'atari2600',
  atari7800: 'atari7800',
  '3do': '3do',
  jaguar: 'jaguar',
  dreamcast: 'dc',
};

export async function fetchOpenVGDB(
  cleanTitle: string,
  systemId: string
): Promise<OpenVGDBResult> {
  const sysCode = OPENVGDB_SYSTEM_MAP[systemId];
  if (!sysCode) return {};

  try {
    const encoded = encodeURIComponent(cleanTitle);
    // API REST OpenVGDB via proxy officiel GitHub Pages
    const url = `https://openvgdb.github.io/api/v1/game?system=${sysCode}&name=${encoded}&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'RetroMad/2.0' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return {};
    const data = await res.json() as any;
    const result = Array.isArray(data) ? data[0] : data;
    if (!result) return {};

    return {
      releaseYear: result.releaseYear?.toString() || result.releaseDate?.slice(0, 4),
      developer: result.developer || result.developers?.[0],
      publisher: result.publisher || result.publishers?.[0],
      genres: result.genres?.map((g: any) => (typeof g === 'string' ? g : g.name)).filter(Boolean),
      synopsis: result.description || result.overview,
      players: result.maxPlayers ? `1-${result.maxPlayers}` : undefined,
      rating: result.communityRating ? Math.round(parseFloat(result.communityRating)) : undefined,
    };
  } catch {
    return {};
  }
}

// ── Statistiques de session de scraping ──────────────────────────────────
export interface ScraperStats {
  total: number;
  done: number;
  found: number;        // Jaquette trouvée
  notFound: number;     // Introuvable
  skipped: number;      // Déjà scrapé (ignoré)
  errors: number;
  startTime: number;
  currentGame?: string;
  currentBoxartUrl?: string; // URL de la jaquette fraîchement trouvée pour le live preview
}

// ── Calcul de la file de priorité ──────────────────────────────────────────
export function buildScrapeQueue(games: Game[]): Game[] {
  return [...games].sort((a, b) => {
    const scoreA = getPriority(a);
    const scoreB = getPriority(b);
    return scoreB - scoreA; // Priorité décroissante
  });
}

function getPriority(game: Game): number {
  let score = 0;
  // Sans jaquette : priorité maximale
  if (!game.media?.boxart2d && !game.media?.boxart3d) score += 100;
  // Favoris
  if (game.favorite) score += 50;
  // Récemment joué
  if (game.lastPlayed) {
    const daysSince = (Date.now() - new Date(game.lastPlayed).getTime()) / 86400000;
    score += Math.max(0, 30 - daysSince);
  }
  // Peu d'infos metadata
  if (!game.metadata?.synopsis) score += 20;
  if (!game.metadata?.rating) score += 10;
  return score;
}

// ── Scraper principal (côté web — localStorage cache) ────────────────────
export async function scrapeGameWeb(
  game: Game,
  opts: {
    onProgress?: (stats: ScraperStats & { done: number; total: number }) => void;
    forceRe?: boolean;
  } = {}
): Promise<Game> {
  const cache = loadUrlCache();
  const { forceRe = false } = opts;

  const mapping = SYSTEM_MAPPINGS.find((m) => m.id === game.systemId);
  const media = { ...game.media };
  let metadata = { ...game.metadata };

  // ── 1. Détection région depuis le nom du fichier ──
  const region = detectRegion(game.filename || game.title);
  const nameBases = buildCandidateNames(game.cleanTitle || game.title, game.title);

  // ── 2. Libretro Thumbnails — Jaquette 2D ──
  let boxartUrl: string | undefined = undefined;
  const cacheKeyBoxart = `${game.id}:boxart2d`;

  if (!forceRe && cache[cacheKeyBoxart]) {
    boxartUrl = cache[cacheKeyBoxart].url;
    media.boxart2d = boxartUrl;
  } else if (mapping?.libretroName) {
    const baseUrl = `https://raw.githubusercontent.com/libretro-thumbnails/${mapping.libretroName}/master`;

    // Régions ordonnées par priorité détectée
    const allRegions = buildRegionList(region.priority);

    outer: for (const nameBase of nameBases) {
      for (const regionTag of allRegions) {
        const candidate = `${baseUrl}/Named_Boxarts/${encodeURIComponent(nameBase + regionTag)}.png`;
        if (await probeUrl(candidate)) {
          boxartUrl = candidate;
          media.boxart2d = candidate;
          media.snap = candidate.replace('/Named_Boxarts/', '/Named_Snaps/');
          cache[cacheKeyBoxart] = { url: candidate, ts: Date.now() };
          cache[`${game.id}:snap`] = { url: media.snap, ts: Date.now() };
          break outer;
        }
      }
    }
  }

  // ── 3. Libretro Thumbnails — Title Screen ──
  const cacheKeyTitle = `${game.id}:titlescreen`;
  if (!forceRe && cache[cacheKeyTitle]) {
    media.titleScreen = cache[cacheKeyTitle].url;
  } else if (mapping?.libretroName && nameBases.length > 0) {
    const baseUrl = `https://raw.githubusercontent.com/libretro-thumbnails/${mapping.libretroName}/master`;
    const allRegions = buildRegionList(region.priority);
    for (const nameBase of nameBases) {
      for (const regionTag of allRegions) {
        const candidate = `${baseUrl}/Named_Titles/${encodeURIComponent(nameBase + regionTag)}.png`;
        if (await probeUrl(candidate)) {
          media.titleScreen = candidate;
          cache[cacheKeyTitle] = { url: candidate, ts: Date.now() };
          break;
        }
      }
      if (media.titleScreen) break;
    }
  }

  // ── 4. OpenVGDB — Métadonnées ──
  if (!metadata?.synopsis || !metadata?.developer || forceRe) {
    const vgdbResult = await fetchOpenVGDB(game.cleanTitle || game.title, game.systemId);
    if (Object.keys(vgdbResult).length > 0) {
      metadata = {
        ...metadata,
        developer: metadata?.developer || vgdbResult.developer,
        publisher: metadata?.publisher || vgdbResult.publisher,
        releaseDate: metadata?.releaseDate || (vgdbResult.releaseYear ? `${vgdbResult.releaseYear}-01-01` : undefined),
        genres: (metadata?.genres?.length ? metadata.genres : vgdbResult.genres) ?? metadata?.genres,
        synopsis: metadata?.synopsis || vgdbResult.synopsis || `Classique du catalogue ${game.systemId.toUpperCase()}.`,
        players: metadata?.players || vgdbResult.players,
        rating: metadata?.rating || vgdbResult.rating,
      };
    }
  }

  saveUrlCache(cache);

  return {
    ...game,
    media,
    metadata: metadata as Game['metadata'],
    scrapedAt: new Date().toISOString(),
  };
}

// ── Régions ordonnées selon la priorité détectée ─────────────────────────
function buildRegionList(priority: RegionInfo['priority']): string[] {
  const ordered: Record<RegionInfo['priority'], string[]> = {
    usa:     [' (USA)', ' (USA, Europe)', ' (World)', ' (Europe)', ' (Japan)', ''],
    europe:  [' (Europe)', ' (USA, Europe)', ' (World)', ' (USA)', ' (Japan)', ''],
    japan:   [' (Japan)', ' (Japan, USA)', ' (World)', ' (USA)', ' (Europe)', ''],
    world:   [' (World)', ' (USA)', ' (Europe)', ' (Japan)', ''],
    unknown: [' (USA)', ' (Europe)', ' (Japan)', ' (World)', ''],
  };
  return ordered[priority] ?? ordered.unknown;
}

// ── Scraper en lot (toute la collection) ──────────────────────────────────
export async function scrapeAllGamesWeb(
  games: Game[],
  onProgress: (stats: ScraperStats) => void,
  signal?: AbortSignal
): Promise<Game[]> {
  const queue = buildScrapeQueue(games);
  const cache = loadUrlCache();
  const results = new Map<string, Game>(games.map((g) => [g.id, g]));

  const stats: ScraperStats = {
    total: queue.length,
    done: 0,
    found: 0,
    notFound: 0,
    skipped: 0,
    errors: 0,
    startTime: Date.now(),
  };

  for (const game of queue) {
    if (signal?.aborted) break;

    stats.currentGame = game.cleanTitle || game.title;
    stats.currentBoxartUrl = undefined;
    onProgress({ ...stats });

    try {
      // Vérifier si le jeu est déjà bien scrapé (a jaquette + metadata complètes)
      const alreadyDone =
        !!(game.media?.boxart2d && game.metadata?.synopsis && game.metadata?.developer);

      if (alreadyDone && !cache[`${game.id}:force`]) {
        stats.skipped++;
        stats.done++;
        onProgress({ ...stats });
        await new Promise((r) => setTimeout(r, 30)); // Petite pause pour ne pas bloquer l'UI
        continue;
      }

      const updated = await scrapeGameWeb(game, { forceRe: false });
      results.set(game.id, updated);

      if (updated.media?.boxart2d) {
        stats.found++;
        stats.currentBoxartUrl = updated.media.boxart2d;
      } else {
        stats.notFound++;
      }
    } catch {
      stats.errors++;
    }

    stats.done++;
    onProgress({ ...stats });

    // Délai anti-spam réseau (300ms entre chaque jeu)
    if (!signal?.aborted) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  return [...results.values()];
}
