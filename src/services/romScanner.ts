import { Game } from '../types';
import { isGameDeleted } from './romStorage';

export interface SystemMapping {
  id: string;
  name: string;
  companyId: string;
  extensions: string[];
  subfolders: string[];
  libretroName: string;
  defaultGenre: string;
}

export const SYSTEM_MAPPINGS: SystemMapping[] = [
  {
    id: 'snes',
    name: 'Super Nintendo',
    companyId: 'nintendo',
    extensions: ['.sfc', '.smc', '.fig'],
    subfolders: ['snes', 'supernintendo', 'sfc', 'superfamicom'],
    libretroName: 'Nintendo_-_Super_Nintendo_Entertainment_System',
    defaultGenre: 'Aventure / Plateforme',
  },
  {
    id: 'nes',
    name: 'NES',
    companyId: 'nintendo',
    extensions: ['.nes', '.fds', '.unf'],
    subfolders: ['nes', 'famicom', 'nintendo'],
    libretroName: 'Nintendo_-_Nintendo_Entertainment_System',
    defaultGenre: 'Action / Plateforme',
  },
  {
    id: 'n64',
    name: 'Nintendo 64',
    companyId: 'nintendo',
    extensions: ['.z64', '.n64', '.v64'],
    subfolders: ['n64', 'nintendo64'],
    libretroName: 'Nintendo_-_Nintendo_64',
    defaultGenre: 'Action 3D',
  },
  {
    id: 'gba',
    name: 'Game Boy Advance',
    companyId: 'nintendo',
    extensions: ['.gba'],
    subfolders: ['gba', 'gameboyadvance'],
    libretroName: 'Nintendo_-_Game_Boy_Advance',
    defaultGenre: 'Aventure / RPG',
  },
  {
    id: 'gbc',
    name: 'Game Boy Color',
    companyId: 'nintendo',
    extensions: ['.gbc'],
    subfolders: ['gbc', 'gameboycolor'],
    libretroName: 'Nintendo_-_Game_Boy_Color',
    defaultGenre: 'Aventure 8-bit',
  },
  {
    id: 'gb',
    name: 'Game Boy',
    companyId: 'nintendo',
    extensions: ['.gb'],
    subfolders: ['gb', 'gameboy'],
    libretroName: 'Nintendo_-_Game_Boy',
    defaultGenre: 'Plates-formes Monochrome',
  },
  {
    id: 'megadrive',
    name: 'Mega Drive',
    companyId: 'sega',
    extensions: ['.md', '.gen', '.smd'],
    subfolders: ['megadrive', 'genesis', 'md', 'sega_md'],
    libretroName: 'Sega_-_Mega_Drive_-_Genesis',
    defaultGenre: 'Action / Arcade 16-bit',
  },
  {
    id: 'mastersystem',
    name: 'Master System',
    companyId: 'sega',
    extensions: ['.sms'],
    subfolders: ['mastersystem', 'sms'],
    libretroName: 'Sega_-_Master_System_-_Mark_III',
    defaultGenre: 'Plates-formes 8-bit',
  },
  {
    id: 'gamegear',
    name: 'Game Gear',
    companyId: 'sega',
    extensions: ['.gg'],
    subfolders: ['gamegear', 'gg'],
    libretroName: 'Sega_-_Game_Gear',
    defaultGenre: 'Action Portable',
  },
  {
    id: 'psx',
    name: 'PlayStation',
    companyId: 'sony',
    extensions: ['.chd', '.cue', '.iso', '.pbp'],
    subfolders: ['psx', 'ps1', 'playstation', 'psone'],
    libretroName: 'Sony_-_PlayStation',
    defaultGenre: 'Aventure / 3D',
  },
  {
    id: 'ps2',
    name: 'PlayStation 2',
    companyId: 'sony',
    extensions: ['.cso'],
    subfolders: ['ps2', 'playstation2'],
    libretroName: 'Sony_-_PlayStation_2',
    defaultGenre: 'Action / Aventure 128-bit',
  },
  {
    id: 'psp',
    name: 'PlayStation Portable',
    companyId: 'sony',
    extensions: ['.cso'],
    subfolders: ['psp'],
    libretroName: 'Sony_-_PlayStation_Portable',
    defaultGenre: 'Portable 3D',
  },
  {
    id: 'saturn',
    name: 'Sega Saturn',
    companyId: 'sega',
    extensions: [],
    subfolders: ['saturn', 'segasaturn'],
    libretroName: 'Sega_-_Saturn',
    defaultGenre: 'Arcade 32-bit',
  },
  {
    id: 'dreamcast',
    name: 'Dreamcast',
    companyId: 'sega',
    extensions: ['.cdi', '.gdi'],
    subfolders: ['dreamcast', 'dc'],
    libretroName: 'Sega_-_Dreamcast',
    defaultGenre: 'Arcade 128-bit',
  },
  {
    id: 'pcengine',
    name: 'PC Engine',
    companyId: 'nec',
    extensions: ['.pce'],
    subfolders: ['pcengine', 'pce', 'turbografx'],
    libretroName: 'NEC_-_PC_Engine_-_TurboGrafx_16',
    defaultGenre: 'Shoot-em-up / Action',
  },
  {
    id: 'neogeo',
    name: 'Neo Geo',
    companyId: 'snk',
    extensions: ['.neo'],
    subfolders: ['neogeo', 'ng'],
    libretroName: 'SNK_-_Neo_Geo',
    defaultGenre: 'Combat / Arcade 24-bit',
  },
  {
    id: 'mame',
    name: 'Arcade (MAME)',
    companyId: 'arcade',
    extensions: [],
    subfolders: ['mame', 'arcade', 'fba', 'fbneo'],
    libretroName: 'MAME',
    defaultGenre: 'Arcade / Borne',
  },
  {
    id: 'atari2600',
    name: 'Atari 2600',
    companyId: 'atari',
    extensions: ['.a26'],
    subfolders: ['atari2600', 'a2600', 'atari'],
    libretroName: 'Atari_-_2600',
    defaultGenre: 'Classique 70s',
  },
  {
    id: 'atari7800',
    name: 'Atari 7800',
    companyId: 'atari',
    extensions: ['.a78'],
    subfolders: ['atari7800', 'a7800'],
    libretroName: 'Atari_-_7800',
    defaultGenre: 'Action 80s',
  },
  {
    id: 'c64',
    name: 'Commodore 64',
    companyId: 'commodore',
    extensions: ['.d64', '.t64', '.prg'],
    subfolders: ['c64', 'commodore64', 'commodore'],
    libretroName: 'Commodore_-_Commodore_64',
    defaultGenre: 'Micro-informatique',
  },
  {
    id: 'amiga',
    name: 'Amiga',
    companyId: 'commodore',
    extensions: ['.adf', '.ipf'],
    subfolders: ['amiga', 'amiga500', 'amiga1200'],
    libretroName: 'Commodore_-_Amiga',
    defaultGenre: 'Micro-informatique 16-bit',
  },
  {
    id: 'wonderswan',
    name: 'WonderSwan',
    companyId: 'bandai',
    extensions: ['.ws', '.wsc'],
    subfolders: ['wonderswan', 'ws'],
    libretroName: 'Bandai_-_WonderSwan',
    defaultGenre: 'Portable Japonaise',
  },
  {
    id: 'zxspectrum',
    name: 'ZX Spectrum',
    companyId: 'sinclair',
    extensions: ['.tzx', '.tap', '.z80', '.sna'],
    subfolders: ['zxspectrum', 'zx', 'sinclair'],
    libretroName: 'Sinclair_-_ZX_Spectrum',
    defaultGenre: 'Micro-informatique 8-bit',
  },
  {
    id: 'zx81',
    name: 'ZX81',
    companyId: 'sinclair',
    extensions: ['.p', '.81', '.tzx'],
    subfolders: ['zx81', 'sinclair'],
    libretroName: 'Sinclair_-_ZX_81',
    defaultGenre: 'Micro-informatique pionnière',
  },
  {
    id: 'gameandwatch',
    name: 'Game & Watch',
    companyId: 'nintendo',
    extensions: ['.mgw'],
    subfolders: ['gameandwatch', 'gnw'],
    libretroName: 'Nintendo_-_Game_and_Watch',
    defaultGenre: 'LCD vintage',
  },
  {
    id: 'pokemonmini',
    name: 'Pokémon Mini',
    companyId: 'nintendo',
    extensions: ['.min', '.pmx'],
    subfolders: ['pokemonmini', 'pokemini'],
    libretroName: 'Nintendo_-_Pokemon_Mini',
    defaultGenre: 'Pocket japonais',
  },
  {
    id: 'odyssey2',
    name: 'Odyssey² / Videopac',
    companyId: 'magnavox',
    extensions: ['.bin', '.o2'],
    subfolders: ['odyssey2', 'videopac', 'o2'],
    libretroName: 'Magnavox_-_Odyssey_2',
    defaultGenre: 'Classique 70s-80s',
  },
  {
    id: 'pc8801',
    name: 'PC-8801',
    companyId: 'nec',
    extensions: ['.d88', '.88d', '.cmt'],
    subfolders: ['pc8801', 'pc88'],
    libretroName: 'NEC_-_PC-8801',
    defaultGenre: 'Micro japonais 8-bit',
  },
  {
    id: 'pc9801',
    name: 'PC-9801',
    companyId: 'nec',
    extensions: ['.hdi', '.thd', '.nhd', '.fdd', '.d98'],
    subfolders: ['pc9801', 'pc98'],
    libretroName: 'NEC_-_PC-9801',
    defaultGenre: 'Micro japonais 16-bit',
  },
  {
    id: 'amiga1200',
    name: 'Amiga 1200',
    companyId: 'commodore',
    extensions: ['.adf', '.hdf', '.lha'],
    subfolders: ['amiga1200', 'aga'],
    libretroName: 'Commodore_-_Amiga',
    defaultGenre: 'Micro-informatique 32-bit',
  },
  {
    id: 'cdi',
    name: 'Philips CD-i',
    companyId: 'magnavox',
    extensions: ['.chd', '.cue', '.bin'],
    subfolders: ['cdi', 'cd-i'],
    libretroName: 'Philips_-_CD-i',
    defaultGenre: 'Multimédia 90s',
  },
  {
    id: 'fmtowns',
    name: 'FM Towns',
    companyId: 'multiple',
    extensions: ['.cue', '.bin', '.chd', '.iso'],
    subfolders: ['fmtowns', 'fmt'],
    libretroName: 'Fujitsu_-_FM_Towns',
    defaultGenre: 'Micro japonais CD',
  },
  {
    id: 'bbcmicro',
    name: 'BBC Micro',
    companyId: 'multiple',
    extensions: ['.ssd', '.dsd', '.uef'],
    subfolders: ['bbcmicro', 'bbc', 'acorn'],
    libretroName: 'Acorn_-_BBC_Micro',
    defaultGenre: 'Micro éducatif UK',
  },
  {
    id: 'cps1',
    name: 'CPS-1 (Arcade Capcom)',
    companyId: 'capcom',
    extensions: ['.zip'],
    subfolders: ['cps1', 'cps'],
    libretroName: 'Capcom_-_CPS-1',
    defaultGenre: 'Arcade 90s',
  },
  {
    id: 'cps2',
    name: 'CPS-2 (Arcade Capcom)',
    companyId: 'capcom',
    extensions: ['.zip'],
    subfolders: ['cps2'],
    libretroName: 'Capcom_-_CPS-2',
    defaultGenre: 'Arcade combat',
  },
  {
    id: 'cps3',
    name: 'CPS-3 (Arcade Capcom)',
    companyId: 'capcom',
    extensions: ['.zip', '.chd'],
    subfolders: ['cps3'],
    libretroName: 'Capcom_-_CPS-3',
    defaultGenre: 'Arcade combat 2D',
  },
  {
    id: 'atarist',
    name: 'Atari ST',
    companyId: 'atari',
    extensions: ['.st', '.msa', '.dim', '.prg'],
    subfolders: ['atarist', 'atari-st', 'st'],
    libretroName: 'Atari_-_ST',
    defaultGenre: 'Micro-informatique 16-bit',
  },
  {
    id: 'amstradcpc',
    name: 'Amstrad CPC',
    companyId: 'amstrad',
    extensions: ['.dsk', '.cdt', '.sna'],
    subfolders: ['amstradcpc', 'cpc', 'amstrad'],
    libretroName: 'Amstrad_-_CPC',
    defaultGenre: 'Micro-informatique 8-bit',
  },
  {
    id: 'appleii',
    name: 'Apple II',
    companyId: 'apple',
    extensions: ['.dsk', '.do', '.po', '.woz'],
    subfolders: ['appleii', 'apple2'],
    libretroName: 'Apple_-_Apple_II',
    defaultGenre: 'Micro pionnier US',
  },
  {
    id: 'msdos',
    name: 'MS-DOS',
    companyId: 'microsoft',
    extensions: ['.exe', '.zip', '.img', '.vhd', '.m3u'],
    subfolders: ['msdos', 'dos'],
    libretroName: 'DOS',
    defaultGenre: 'Jeu PC classique',
  },
  {
    id: 'x68000',
    name: 'Sharp X68000',
    companyId: 'multiple',
    extensions: ['.dim', '.img', '.d88', '.hdf'],
    subfolders: ['x68000', 'x68k'],
    libretroName: 'Sharp_-_X68000',
    defaultGenre: 'Micro japonais 16-bit',
  },
  {
    id: 'x1',
    name: 'Sharp X1',
    companyId: 'multiple',
    extensions: ['.d88', '.t88'],
    subfolders: ['x1', 'sharpx1'],
    libretroName: 'Sharp_-_X1',
    defaultGenre: 'Micro japonais 8-bit',
  },
  {
    id: 'atari8bit',
    name: 'Atari 8-bit Family',
    companyId: 'atari',
    extensions: ['.atr', '.xfd', '.dsk'],
    subfolders: ['atari8bit', 'atari800', 'atarixl'],
    libretroName: 'Atari_-_8-bit_Family',
    defaultGenre: 'Micro pionnier US',
  },
  {
    id: 'vic20',
    name: 'Commodore VIC-20',
    companyId: 'commodore',
    extensions: ['.d64', '.t64', '.prg', '.tap'],
    subfolders: ['vic20', 'vic'],
    libretroName: 'Commodore_-_VIC-20',
    defaultGenre: 'Micro pionnier',
  },
  {
    id: 'c128',
    name: 'Commodore 128',
    companyId: 'commodore',
    extensions: ['.d64', '.d71', '.prg'],
    subfolders: ['c128'],
    libretroName: 'Commodore_-_128',
    defaultGenre: 'Micro 8-bit double CPU',
  },
  {
    id: 'plus4',
    name: 'Commodore Plus/4',
    companyId: 'commodore',
    extensions: ['.d64', '.t64', '.prg'],
    subfolders: ['plus4', 'c16'],
    libretroName: 'Commodore_-_Plus4',
    defaultGenre: 'Micro bureautique',
  },
  {
    id: 'thomson',
    name: 'Thomson MO/TO',
    companyId: 'multiple',
    extensions: ['.fd', '.sap', '.k7', '.m5', '.m7'],
    subfolders: ['thomson', 'mo5', 'to7'],
    libretroName: 'Thomson_-_MO5',
    defaultGenre: 'Micro français',
  },
  {
    id: 'neogeocd',
    name: 'Neo Geo CD',
    companyId: 'snk',
    extensions: ['.chd', '.cue', '.iso'],
    subfolders: ['neogeocd', 'ngcd'],
    libretroName: 'SNK_-_Neo_Geo_CD',
    defaultGenre: 'Arcade CD',
  },
  {
    id: 'pc8000',
    name: 'PC-8001',
    companyId: 'nec',
    extensions: ['.d88', '.t88', '.cmt'],
    subfolders: ['pc8000', 'pc8001'],
    libretroName: 'NEC_-_PC-8000_Series',
    defaultGenre: 'Micro japonais pionnier',
  },
  {
    id: 'gx4000',
    name: 'Amstrad GX4000',
    companyId: 'amstrad',
    extensions: ['.cpt', '.dsk'],
    subfolders: ['gx4000'],
    libretroName: 'Amstrad_-_GX4000',
    defaultGenre: 'Console 8-bit EU',
  },
];

/**
 * Nettoie le nom de fichier pour obtenir un titre propre
 */
export function cleanGameTitle(filename: string): { cleanTitle: string; region?: string } {
  const dotIndex = filename.lastIndexOf('.');
  const baseName = dotIndex > 0 ? filename.substring(0, dotIndex) : filename;

  let region: string | undefined = undefined;
  if (/\b(France|French|FRA|FR)\b/i.test(baseName)) {
    region = 'France';
  } else if (/\b(Europe|EUR|PAL)\b/i.test(baseName)) {
    region = 'Europe';
  } else if (/\b(USA|US|NTSC-U)\b/i.test(baseName)) {
    region = 'USA';
  } else if (/\b(Japan|JPN|JAP|NTSC-J)\b/i.test(baseName)) {
    region = 'Japan';
  } else if (/\b(World)\b/i.test(baseName)) {
    region = 'World';
  }

  let clean = baseName
    .replace(/\s*\(.*?\)/g, '')
    .replace(/\s*\[.*?\]/g, '')
    .trim();

  clean = clean.replace(/_+/g, ' ').replace(/\s+/g, ' ').trim();

  return { cleanTitle: clean || baseName, region };
}

/**
 * Détecte le système à partir du chemin complet et de l'extension
 */
export function detectSystem(
  filePathOrName: string,
  fallbackSystemId?: string
): SystemMapping | null {
  const normalized = filePathOrName.toLowerCase().replace(/\\/g, '/');
  const dotIndex = normalized.lastIndexOf('.');
  const ext = dotIndex > 0 ? normalized.substring(dotIndex) : '';

  // 1. Chercher par nom de sous-dossier dans le chemin (ex: .../roms/snes/...)
  const segments = normalized.split('/');
  for (const mapping of SYSTEM_MAPPINGS) {
    for (const sub of mapping.subfolders) {
      if (segments.includes(sub)) {
        // Si c'est un zip/7z ou extension du système
        if (['.zip', '.7z'].includes(ext) || mapping.extensions.includes(ext) || !ext) {
          return mapping;
        }
      }
    }
  }

  // 2. Chercher par extension unique
  if (ext && ext !== '.zip' && ext !== '.7z' && ext !== '.bin') {
    const matched = SYSTEM_MAPPINGS.find((m) => m.extensions.includes(ext));
    if (matched) return matched;
  }

  // 3. Si .zip ou .7z ou .bin avec fallbackSystemId
  if (fallbackSystemId) {
    const fallback = SYSTEM_MAPPINGS.find((m) => m.id === fallbackSystemId);
    if (fallback) return fallback;
  }

  // 4. Par défaut pour .zip / .7z sans dossier : Arcade / MAME
  if (ext === '.zip' || ext === '.7z') {
    return SYSTEM_MAPPINGS.find((m) => m.id === 'mame') || SYSTEM_MAPPINGS[0];
  }

  return null;
}

/**
 * Crée un objet Game complet à partir d'un fichier réel
 */
export function createGameFromFile(
  file: File,
  relativePath?: string,
  fallbackSystemId?: string
): Game | null {
  const fullPath = relativePath || file.name;
  const filename = file.name;

  // Vérifier si cette ROM a été précédemment supprimée par l'utilisateur
  if (isGameDeleted(undefined, filename)) {
    return null;
  }

  const system = detectSystem(fullPath, fallbackSystemId);
  if (!system) {
    return null;
  }

  const dotIndex = filename.lastIndexOf('.');
  const ext = dotIndex > 0 ? filename.substring(dotIndex).toLowerCase() : '';
  const { cleanTitle, region } = cleanGameTitle(filename);
  const safeSlug = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 32);
  const id = `game_${system.id}_${safeSlug}_${file.size}`;

  // Vérifier si l'ID est dans le registre supprimé
  if (isGameDeleted(id)) {
    return null;
  }

  const encodedClean = encodeURIComponent(cleanTitle);
  const boxartUrl = `https://raw.githubusercontent.com/libretro-thumbnails/${system.libretroName}/master/Named_Boxarts/${encodedClean}.png`;

  return {
    id,
    systemId: system.id,
    title: filename.substring(0, dotIndex > 0 ? dotIndex : undefined),
    cleanTitle,
    path: relativePath || `/roms/${system.id}/${filename}`,
    filename,
    extension: ext,
    size: file.size,
    region,
    favorite: false,
    playCount: 0,
    lastPlayed: undefined,
    playTimeMinutes: 0,
    metadata: {
      developer: system.name,
      publisher: 'Catalogue RetroMAD',
      releaseDate: '1995-01-01',
      genres: [system.defaultGenre],
      players: '1-2',
      rating: 88,
      synopsis: `ROM ${system.name} importée et prête pour émulation haute fidélité.`,
    },
    media: {
      boxart2d: boxartUrl,
    },
  };
}

/**
 * Lit récursivement un FileSystemDirectoryHandle (API moderne des navigateurs Chromium/Edge/Chrome)
 */
export async function getFilesFromDirectoryHandle(
  dirHandle: any,
  parentPath = '',
  onProgress?: (scanned: number, currentName: string) => void
): Promise<{ file: File; fullPath: string }[]> {
  const results: { file: File; fullPath: string }[] = [];
  let count = 0;

  async function walk(handle: any, currentPath: string) {
    for await (const entry of handle.values()) {
      if (entry.kind === 'file') {
        try {
          const file = await entry.getFile();
          count++;
          if (onProgress) onProgress(count, entry.name);
          results.push({ file, fullPath: `${currentPath}/${entry.name}` });
        } catch (e) {
          console.warn('[DirectoryPicker] Fichier illisible:', entry.name, e);
        }
      } else if (entry.kind === 'directory' && !entry.name.startsWith('.')) {
        await walk(entry, `${currentPath}/${entry.name}`);
      }
    }
  }

  await walk(dirHandle, parentPath || dirHandle.name || 'Roms');
  return results;
}

/**
 * Scan une liste de fichiers File[] (provenant d'un input ou drag&drop)
 */
export async function scanFilesList(
  fileItems: { file: File; fullPath?: string }[],
  fallbackSystemId?: string,
  onProgress?: (scanned: number, total: number, currentName: string) => void
): Promise<{ added: Game[]; skippedDeleted: number; totalScanned: number }> {
  const added: Game[] = [];
  let skippedDeleted = 0;
  const total = fileItems.length;

  for (let i = 0; i < total; i++) {
    const item = fileItems[i];
    if (onProgress) {
      onProgress(i + 1, total, item.file.name);
    }

    if (isGameDeleted(undefined, item.file.name)) {
      skippedDeleted++;
      continue;
    }

    const game = createGameFromFile(item.file, item.fullPath, fallbackSystemId);
    if (game) {
      added.push(game);
    }
  }

  return { added, skippedDeleted, totalScanned: total };
}

/**
 * Scanne le manifest JSON de /public/roms
 */
/**
 * Construit un Game à partir d'une entrée de l'index disque (_index.json).
 * Renvoie null si le système ne peut pas être détecté.
 */
function buildGameFromIndexFile(f: { path: string; filename: string; size: number }): Game | null {
  const system = detectSystem(f.path);
  if (!system) return null;

  // Chemin web complet servi par Vite : public/roms/* -> /roms/*
  const webPath = `/roms${f.path}`;

  const dotIndex = f.filename.lastIndexOf('.');
  const ext = dotIndex > 0 ? f.filename.substring(dotIndex).toLowerCase() : '.bin';
  const { cleanTitle, region } = cleanGameTitle(f.filename);
  // ID unique : inclut le chemin encodé (2 fichiers peuvent avoir le même
  // nom nettoyé et la même taille, ex: Zelda 2 PRG 0 / PRG 2)
  const pathSlug = f.path.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(-48);

  return {
    id: `rom_${system.id}_${pathSlug}`,
    systemId: system.id,
    title: dotIndex > 0 ? f.filename.substring(0, dotIndex) : f.filename,
    cleanTitle,
    path: webPath,
    filename: f.filename,
    extension: ext,
    size: f.size,
    region,
    favorite: false,
    playCount: 0,
    playTimeMinutes: 0,
    metadata: {
      developer: system.name,
      publisher: system.name,
      releaseDate: '1990-01-01',
      genres: [system.defaultGenre || 'Action'],
      players: '1-2',
      rating: 90,
      synopsis: `ROM servie par le serveur web (${system.name}).`,
    },
    media: {},
  };
}

/**
 * Synchronisation incrémentale : détecte les ROMs présentes sur le disque
 * (index _index.json) qui ne sont pas encore dans la ludothèque et les
 * renvoie. Utilisée au démarrage pour intégrer automatiquement les
 * ROMs ajoutées après le dernier scan.
 */
export async function syncNewRoms(existingGames: Game[]): Promise<{
  newGames: Game[];
  totalOnDisk: number;
}> {
  try {
    const res = await fetch('/roms/_index.json');
    if (!res.ok) return { newGames: [], totalOnDisk: 0 };
    const data = await res.json();
    const files: Array<{ path: string; filename: string; size: number }> = data.files || [];

    const knownPaths = new Set(existingGames.map((g) => g.path));
    const knownFilenames = new Set(existingGames.map((g) => g.filename));
    const newGames: Game[] = [];

    for (const f of files) {
      if (knownPaths.has(`/roms${f.path}`)) continue;
      // Tolérance : même nom de fichier à un autre emplacement -> déjà connu
      if (knownFilenames.has(f.filename)) continue;
      if (isGameDeleted(undefined, f.filename)) continue;

      const game = buildGameFromIndexFile(f);
      if (game) newGames.push(game);
    }

    return { newGames, totalOnDisk: files.length };
  } catch {
    return { newGames: [], totalOnDisk: 0 };
  }
}

export async function scanPublicRomsManifest(): Promise<{
  added: Game[];
  skippedDeleted: number;
  totalScanned: number;
}> {
  const added: Game[] = [];
  let skippedDeleted = 0;

  // 1) Index des vraies ROMs présentes sur le disque (généré par Vite : _index.json)
  try {
    const res = await fetch('/roms/_index.json');
    if (res.ok) {
      const data = await res.json();
      const files: Array<{ path: string; filename: string; size: number }> = data.files || [];

      for (const f of files) {
        if (isGameDeleted(undefined, f.filename)) {
          skippedDeleted++;
          continue;
        }
        const game = buildGameFromIndexFile(f);
        if (!game) continue;
        added.push(game);
      }

      if (added.length > 0) {
        return { added, skippedDeleted, totalScanned: files.length };
      }
    }
  } catch {
    // Repli sur le manifest statique ci-dessous
  }

  // 2) Repli : manifest statique (ROMs de démonstration)
  try {
    const res = await fetch('/roms/roms_manifest.json');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    const roms: any[] = data.roms || [];

    for (const r of roms) {
      if (isGameDeleted(r.id, r.filename)) {
        skippedDeleted++;
        continue;
      }

      const dotIndex = r.filename.lastIndexOf('.');
      const ext = dotIndex > 0 ? r.filename.substring(dotIndex).toLowerCase() : '.bin';
      const { cleanTitle, region } = cleanGameTitle(r.filename);

      const game: Game = {
        id: r.id,
        systemId: r.systemId,
        title: r.title || cleanTitle,
        cleanTitle: r.title || cleanTitle,
        path: r.path || `/roms/${r.systemId}/${r.filename}`,
        filename: r.filename,
        extension: ext,
        size: r.size || 1048576,
        region,
        favorite: false,
        playCount: 0,
        lastPlayed: undefined,
        playTimeMinutes: 0,
        metadata: {
          developer: r.companyName || 'Catalogue Rétro',
          publisher: r.companyName || 'Catalogue Rétro',
          releaseDate: `${r.releaseYear || 1990}-01-01`,
          genres: [r.genre || 'Action'],
          players: '1-2',
          rating: 92,
          synopsis: r.description || `ROM officielle prête pour émulation.`,
        },
        media: {
          boxart2d: `/roms/${r.systemId}/boxart.jpg`,
        },
      };

      added.push(game);
    }

    return { added, skippedDeleted, totalScanned: roms.length };
  } catch (e) {
    console.warn('[scanPublicRomsManifest] Impossible de charger /roms/roms_manifest.json:', e);
    return { added: [], skippedDeleted: 0, totalScanned: 0 };
  }
}
