import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawnSync } from 'child_process';
import { storage } from './storage';
import { SYSTEMS } from '../data/systems';

export interface ExtensionInfo {
  id: string;
  name: string;
  coreName: string;
  systemName: string;
  isInstalled: boolean;
  filePath?: string;
  fileSize?: number;
  extensions: string[];
}

export interface ExtensionProgress {
  total: number;
  current: number;
  currentItem: string;
  percent: number;
  status: 'downloading' | 'extracting' | 'configuring' | 'complete' | 'error';
  message: string;
}

export class ExtensionInstallerService {
  /**
   * Obtient le répertoire résolu des cœurs RetroArch
   */
  getCoresDir(): string {
    const settings = storage.getSettings();
    let coresDir = settings.retroarchCoresDir;

    if (coresDir.startsWith('~')) {
      coresDir = path.join(os.homedir(), coresDir.slice(1));
    }

    if (!fs.existsSync(coresDir)) {
      fs.mkdirSync(coresDir, { recursive: true });
    }

    return coresDir;
  }

  /**
   * Obtient le répertoire résolu des ROMs
   */
  getRomsDir(): string {
    const settings = storage.getSettings();
    let romsDir = settings.romsDir;

    if (romsDir.startsWith('~')) {
      romsDir = path.join(os.homedir(), romsDir.slice(1));
    }

    if (!fs.existsSync(romsDir)) {
      fs.mkdirSync(romsDir, { recursive: true });
    }

    return romsDir;
  }

  /**
   * Vérifie si un exécutable autonome existe dans le PATH
   */
  private isStandaloneInstalled(cmd: string): boolean {
    if (!cmd || !/^[a-zA-Z0-9._-]+$/.test(cmd)) return false;
    const isWindows = process.platform === 'win32';
    const checkBinary = isWindows ? 'where' : 'which';
    try {
      const res = spawnSync(checkBinary, [cmd], { stdio: 'ignore' });
      return res.status === 0;
    } catch {
      return false;
    }
  }

  /**
   * Calcule l'URL officielle du buildbot Libretro pour un cœur donné
   */
  getCoreDownloadUrl(coreName: string): string {
    const isWindows = process.platform === 'win32';
    const ext = isWindows ? '.dll' : '.so';
    const zipName = `${coreName}${ext}.zip`;
    const platformPart = isWindows ? 'windows/x86_64/latest' : 'linux/x86_64/latest';
    return `https://buildbot.libretro.com/nightly/${platformPart}/${zipName}`;
  }

  /**
   * Liste toutes les extensions (cœurs Libretro & émulateurs) disponibles pour RetroMad
   */
  listExtensions(): ExtensionInfo[] {
    const isWindows = process.platform === 'win32';
    const coresDir = this.getCoresDir();
    const results: ExtensionInfo[] = [];

    for (const sys of SYSTEMS) {
      const coreFile = isWindows ? sys.defaultCoreWindows : sys.defaultCoreLinux;
      const isLibretro = Boolean(coreFile && coreFile.includes('_libretro'));

      if (isLibretro && coreFile) {
        const baseCoreName = coreFile.replace(/\.(so|dll)$/, '');
        const targetPath = path.join(coresDir, coreFile);
        const isInstalled = fs.existsSync(targetPath);
        let fileSize = 0;

        if (isInstalled) {
          try {
            fileSize = fs.statSync(targetPath).size;
          } catch {
            // Ignore
          }
        }

        results.push({
          id: sys.id,
          name: `${sys.name} (${baseCoreName})`,
          coreName: baseCoreName,
          systemName: sys.name,
          isInstalled,
          filePath: isInstalled ? targetPath : undefined,
          fileSize,
          extensions: sys.extensions,
        });
      } else {
        const standaloneCmd = coreFile || sys.id;
        const isInstalled = this.isStandaloneInstalled(standaloneCmd);

        results.push({
          id: sys.id,
          name: `${sys.name} (${standaloneCmd})`,
          coreName: standaloneCmd,
          systemName: sys.name,
          isInstalled,
          extensions: sys.extensions,
        });
      }
    }

    return results;
  }

  /**
   * Télécharge un fichier binaire avec gestion des redirections 301/302
   */
  private downloadUrl(url: string, destPath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const proto = url.startsWith('https') ? https : http;
      proto
        .get(url, (res) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            const redirectUrl = res.headers.location;
            if (redirectUrl) {
              return this.downloadUrl(redirectUrl, destPath).then(resolve).catch(reject);
            }
          }

          if (res.statusCode !== 200) {
            return reject(new Error(`HTTP ${res.statusCode} en téléchargeant ${url}`));
          }

          const fileStream = fs.createWriteStream(destPath);
          res.pipe(fileStream);

          fileStream.on('finish', () => {
            fileStream.close();
            resolve(true);
          });

          fileStream.on('error', (err) => {
            fs.unlink(destPath, () => {});
            reject(err);
          });
        })
        .on('error', reject);
    });
  }

  /**
   * Extrait une archive ZIP dans le dossier des cœurs de façon sécurisée (sans injection shell)
   */
  private extractZip(zipPath: string, targetDir: string): boolean {
    const isWindows = process.platform === 'win32';

    if (isWindows) {
      try {
        const res = spawnSync('powershell', [
          '-NoProfile',
          '-NonInteractive',
          '-Command',
          'Expand-Archive',
          '-LiteralPath',
          zipPath,
          '-DestinationPath',
          targetDir,
          '-Force',
        ], { stdio: 'ignore' });
        return res.status === 0;
      } catch (err) {
        console.error('Erreur extraction PowerShell:', err);
        return false;
      }
    } else {
      try {
        const res = spawnSync('unzip', ['-o', '-q', zipPath, '-d', targetDir], { stdio: 'ignore' });
        if (res.status === 0) return true;
      } catch {}
      try {
        const res7z = spawnSync('7z', ['x', '-y', `-o${targetDir}`, zipPath], { stdio: 'ignore' });
        return res7z.status === 0;
      } catch (err2) {
        console.error('Erreur extraction unzip/7z:', err2);
        return false;
      }
    }
  }

  /**
   * Installe une extension (cœur Libretro) spécifique avec validation stricte du nom
   */
  async installExtension(coreName: string): Promise<boolean> {
    if (!coreName || !/^[a-zA-Z0-9_-]+$/.test(coreName)) {
      console.error(`[ExtensionInstaller] Nom de cœur invalide ou suspect rejeté : "${coreName}"`);
      return false;
    }
    const isWindows = process.platform === 'win32';
    const coresDir = this.getCoresDir();
    const ext = isWindows ? '.dll' : '.so';
    const url = this.getCoreDownloadUrl(coreName);
    const tempZip = path.join(os.tmpdir(), `retromad_${coreName}_${Date.now()}.zip`);

    try {
      await this.downloadUrl(url, tempZip);
      const extracted = this.extractZip(tempZip, coresDir);

      // Assurer les droits d'exécution sur Linux
      if (!isWindows) {
        const targetCore = path.join(coresDir, `${coreName}${ext}`);
        if (fs.existsSync(targetCore)) {
          try {
            fs.chmodSync(targetCore, 0o755);
          } catch {
            // Ignore
          }
        }
      }

      // Nettoyer le zip temporaire
      try {
        if (fs.existsSync(tempZip)) fs.unlinkSync(tempZip);
      } catch {
        // Ignore
      }

      return extracted;
    } catch (err) {
      console.error(`Échec téléchargement cœur ${coreName}:`, err);
      try {
        if (fs.existsSync(tempZip)) fs.unlinkSync(tempZip);
      } catch {
        // Ignore
      }
      return false;
    }
  }

  /**
   * Crée l'ensemble de l'arborescence des 28 dossiers de ROMs avec leurs fiches d'extensions
   */
  createRomsFolderStructure(): { created: number; total: number } {
    const romsDir = this.getRomsDir();
    let created = 0;

    for (const sys of SYSTEMS) {
      const companyFolder = sys.companyId || 'autres';
      // Structure hiérarchique : Roms -> Firmes (constructeurs) -> Consoles
      const folderPath = path.join(romsDir, companyFolder, sys.subfolder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        created++;
      }

      // Écrire un fichier guide d'extensions
      const readmePath = path.join(folderPath, '_INFOS_EXTENSIONS.txt');
      if (!fs.existsSync(readmePath)) {
        const content = [
          `============================================================`,
          `  DOSSIER DE ROMS : ${sys.name.toUpperCase()} (${sys.shortName})`,
          `  Hiérarchie      : Roms / ${companyFolder.toUpperCase()} / ${sys.subfolder}`,
          `  Constructeur    : ${sys.manufacturer} (${sys.releaseYear})`,
          `============================================================`,
          ``,
          `FORMATS DE FICHIERS ET EXTENSIONS ACCEPTÉES :`,
          `  ${sys.extensions.join('  ')}`,
          ``,
          `INSTRUCTIONS :`,
          `  Déposez simplement vos fichiers de jeux (.zip, .7z, ou ROM brute)`,
          `  dans ce dossier. RetroMad les identifiera automatiquement lors du scan.`,
          ``,
          sys.biosList && sys.biosList.length > 0
            ? `BIOS REQUIS OU CONSEILLÉS :\n  ${sys.biosList
                .map((b) => `- ${b.filename} : ${b.description}`)
                .join('\n  ')}`
            : `BIOS : Aucun fichier BIOS supplémentaire requis pour cette console.`,
          ``,
          `RetroMad Frontend Retrogaming`,
          `============================================================`,
        ].join('\n');

        try {
          fs.writeFileSync(readmePath, content, 'utf-8');
        } catch {
          // Ignore
        }
      }
    }

    return { created, total: SYSTEMS.length };
  }

  /**
   * Télécharge et installe TOUTES les extensions de RetroMad avec suivi de progression
   */
  async installAllExtensions(
    onProgress?: (progress: ExtensionProgress) => void
  ): Promise<{ success: number; failed: number; total: number }> {
    const allExtensions = this.listExtensions();
    const libretroExtensions = allExtensions.filter((e) => e.coreName.includes('_libretro'));
    const uniqueCores = Array.from(new Set(libretroExtensions.map((e) => e.coreName)));
    const total = uniqueCores.length + 1; // +1 pour la structure des dossiers
    let current = 0;
    let success = 0;
    let failed = 0;

    // Étape 1 : Création de la structure des dossiers de ROMs et fiches d'extensions
    current++;
    onProgress?.({
      total,
      current,
      currentItem: 'Arborescence des dossiers de ROMs',
      percent: Math.round((current / total) * 100),
      status: 'configuring',
      message: 'Génération des 28 dossiers de ROMs et fiches d\'extensions...',
    });

    try {
      this.createRomsFolderStructure();
    } catch (err) {
      console.error('Erreur création dossiers de ROMs:', err);
    }

    // Étape 2 : Téléchargement et installation des cœurs Libretro
    for (const coreName of uniqueCores) {
      current++;
      const related = libretroExtensions.find((e) => e.coreName === coreName);
      const label = related ? `${related.systemName} (${coreName})` : coreName;

      onProgress?.({
        total,
        current,
        currentItem: label,
        percent: Math.round((current / total) * 100),
        status: 'downloading',
        message: `Téléchargement du cœur d'émulation pour ${related?.systemName || coreName}...`,
      });

      const ok = await this.installExtension(coreName);
      if (ok) {
        success++;
      } else {
        failed++;
      }
    }

    onProgress?.({
      total,
      current: total,
      currentItem: 'Installation terminée',
      percent: 100,
      status: 'complete',
      message: `Installation terminée ! (${success} cœurs Libretro installés, ${failed} échecs)`,
    });

    return { success, failed, total: uniqueCores.length };
  }
}

export const extensionInstaller = new ExtensionInstallerService();
