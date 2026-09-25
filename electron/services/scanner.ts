import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Game } from '../types';
import { SYSTEMS } from '../data/systems';

// Pure JS CRC32 implementation for fast hashing without external native deps
function calculateCrc32(buffer: Buffer): string {
  let crc = 0 ^ -1;
  for (let i = 0; i < buffer.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buffer[i]) & 0xFF];
  }
  return ((crc ^ -1) >>> 0).toString(16).padStart(8, '0').toUpperCase();
}

const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
  }
  CRC_TABLE[i] = c;
}

export class ScannerService {
  private identifySystemFolder(folderName: string): string | null {
    const normalizedFolder = folderName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const system = SYSTEMS.find((candidate) => {
      const subfolder = candidate.subfolder.toLowerCase().replace(/[^a-z0-9]/g, '');
      const id = candidate.id.toLowerCase();
      const shortName = candidate.shortName.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normalizedFolder === subfolder || normalizedFolder === id || normalizedFolder === shortName;
    });

    return system?.id ?? null;
  }

  /**
   * Nettoie le nom de fichier pour obtenir le titre propre du jeu
   * Exemple : "Super Mario World (USA) [!].sfc" -> "Super Mario World"
   */
  cleanTitle(filename: string): { cleanTitle: string; region?: string } {
    const ext = path.extname(filename);
    const baseName = path.basename(filename, ext);

    // Détection de la région
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

    // Retrait des parenthèses et crochets
    let clean = baseName
      .replace(/\s*\(.*?\)/g, '')
      .replace(/\s*\[.*?\]/g, '')
      .trim();

    // Remplacement des tirets ou underscores superflus
    clean = clean.replace(/_+/g, ' ').replace(/\s+/g, ' ').trim();

    return { cleanTitle: clean || baseName, region };
  }

  /**
   * Calcule le hash MD5 et CRC32 du fichier
   * Pour les très gros fichiers (> 50 MB), on hache les premiers mégaoctets pour garder la fluidité
   */
  async getFileHashes(filePath: string): Promise<{ md5: string; crc32: string }> {
    try {
      const stats = await fs.promises.stat(filePath);
      const fd = await fs.promises.open(filePath, 'r');
      
      const sampleSize = stats.size > 50 * 1024 * 1024 ? 8 * 1024 * 1024 : stats.size;
      const buffer = Buffer.alloc(sampleSize);
      await fd.read(buffer, 0, sampleSize, 0);
      await fd.close();

      const crc32 = calculateCrc32(buffer);
      const md5 = crypto.createHash('md5').update(buffer).digest('hex');

      return { md5, crc32 };
    } catch {
      return { md5: '', crc32: '' };
    }
  }

  /**
   * Associe un fichier à un système (console)
   */
  identifySystem(filePath: string, parentDirName: string): string | null {
    const ext = path.extname(filePath).toLowerCase();

    // 1. Chercher par nom de sous-dossier (ex: /roms/snes/ -> snes)
    const matchedByDir = SYSTEMS.find((system) => system.id === this.identifySystemFolder(parentDirName));

    if (matchedByDir && matchedByDir.extensions.includes(ext)) {
      return matchedByDir.id;
    }

    // 2. Chercher par extension unique si pas trouvé par dossier
    const matchingSystems = SYSTEMS.filter(s => s.extensions.includes(ext));
    if (matchingSystems.length === 1) {
      return matchingSystems[0].id;
    }

    // 2bis. Extension partagée par plusieurs systèmes (ex: .pce pour pcengine et
    // pcenginecd) : prioriser la console « cartouche » (celle dont l'extension est
    // native), sauf si le nom du fichier est un jeu CD (presence de .cue/.iso frère
    // impossible à connaître ici). Le choix de la première déclarée (ordre SYSTEMS)
    // est la console de base, ce qui couvre le cas PC Engine correctement.
    if (matchingSystems.length > 1) {
      return matchingSystems[0].id;
    }

    // Si plusieurs systèmes ont la même extension (ex: .zip), priorité au système correspondant au nom de dossier
    if (matchedByDir) {
      return matchedByDir.id;
    }

    return null;
  }

  /**
   * Scan récursif d'un répertoire de ROMs
   */
  async scanDirectory(
    dirPath: string, 
    onProgress?: (scanned: number, currentFile: string) => void
  ): Promise<Game[]> {
    const games: Game[] = [];
    if (!fs.existsSync(dirPath)) return games;

    const allExtensions = Array.from(new Set(SYSTEMS.flatMap(s => s.extensions)));
    let scannedCount = 0;

    const walk = async (currentDir: string, inheritedSystemId: string | null) => {
      let entries: fs.Dirent[] = [];
      try {
        entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
      } catch {
        return;
      }

      const systemIdForDirectory = this.identifySystemFolder(path.basename(currentDir)) || inheritedSystemId;

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          if (!entry.name.startsWith('.')) {
            await walk(fullPath, systemIdForDirectory);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (allExtensions.includes(ext)) {
            scannedCount++;
            if (onProgress) {
              onProgress(scannedCount, entry.name);
            }

            const inferredSystem = systemIdForDirectory
              ? SYSTEMS.find((system) => system.id === systemIdForDirectory)
              : undefined;
            const systemId = inferredSystem?.extensions.includes(ext)
              ? inferredSystem.id
              : this.identifySystem(fullPath, path.basename(currentDir));
            if (systemId) {
              const { cleanTitle, region } = this.cleanTitle(entry.name);
              let stats: fs.Stats;
              try {
                stats = await fs.promises.stat(fullPath);
              } catch (error) {
                console.warn(`[Scanner] ROM ignorée, lecture impossible : ${fullPath}`, error);
                continue;
              }
              const { md5, crc32 } = await this.getFileHashes(fullPath);

              const game: Game = {
                id: `${systemId}_${crypto.createHash('sha256').update(path.resolve(fullPath)).digest('hex').slice(0, 24)}`,
                systemId,
                title: path.basename(entry.name, ext),
                cleanTitle,
                path: fullPath,
                filename: entry.name,
                extension: ext,
                size: stats.size,
                crc32,
                md5,
                region,
                favorite: false,
                playCount: 0,
                metadata: {},
                media: {}
              };

              games.push(game);
            }
          }
        }
      }
    };

    await walk(dirPath, null);
    return games;
  }
}

export const scanner = new ScannerService();
