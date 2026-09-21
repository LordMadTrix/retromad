import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { BiosStatus } from '../types';
import { ALL_BIOS_DEFINITIONS } from '../data/biosData';

export class BiosCheckerService {
  /**
   * Calcule le MD5 complet d'un fichier BIOS
   */
  async calculateMd5(filePath: string): Promise<string> {
    return new Promise((resolve) => {
      try {
        const hash = crypto.createHash('md5');
        const stream = fs.createReadStream(filePath);
        stream.on('data', (chunk) => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex').toLowerCase()));
        stream.on('error', () => resolve(''));
      } catch {
        resolve('');
      }
    });
  }

  /**
   * Analyse le répertoire BIOS et retourne le statut de chaque BIOS requis
   */
  async checkBiosDirectory(biosDir: string): Promise<BiosStatus[]> {
    const results: BiosStatus[] = [];

    // Récupérer la liste des fichiers existants (insensible à la casse)
    const existingFiles = new Map<string, string>();
    if (fs.existsSync(biosDir)) {
      try {
        const entries = await fs.promises.readdir(biosDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isFile()) {
            existingFiles.set(entry.name.toLowerCase(), path.join(biosDir, entry.name));
          }
        }
      } catch (e) {
        console.error('Erreur lecture biosDir:', e);
      }
    }

    for (const def of ALL_BIOS_DEFINITIONS) {
      const lowerFilename = def.filename.toLowerCase();
      const filePath = existingFiles.get(lowerFilename);

      if (filePath) {
        let actualMd5 = '';
        let md5Match: boolean | undefined = undefined;

        if (def.md5) {
          actualMd5 = await this.calculateMd5(filePath);
          md5Match = actualMd5 === def.md5.toLowerCase();
        }

        results.push({
          systemId: def.systemId,
          systemName: def.systemName,
          filename: def.filename,
          description: def.description,
          expectedMd5: def.md5,
          found: true,
          actualMd5,
          md5Match,
          path: filePath,
          optional: def.optional || false
        });
      } else {
        results.push({
          systemId: def.systemId,
          systemName: def.systemName,
          filename: def.filename,
          description: def.description,
          expectedMd5: def.md5,
          found: false,
          optional: def.optional || false
        });
      }
    }

    return results;
  }
}

export const biosChecker = new BiosCheckerService();
