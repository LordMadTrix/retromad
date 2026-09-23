import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import { AppSettings, Game, System, Company, EmulatorProfile } from '../types';
import { SYSTEMS } from '../data/systems';
import { COMPANIES } from '../data/companies';
import { BUILTIN_EMULATORS } from '../data/emulators';

export class StorageService {
  private dataDir: string;
  private settingsFile: string;
  private gamesFile: string;
  private systemsFile: string;
  private companiesFile: string;
  private emulatorsFile: string;
  public mediaDir: string;

  constructor() {
    this.dataDir = app ? app.getPath('userData') : path.join(process.cwd(), '.retromad_data');
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    this.mediaDir = path.join(this.dataDir, 'media');
    fs.mkdirSync(this.mediaDir, { recursive: true });
    fs.mkdirSync(path.join(this.mediaDir, 'boxarts'), { recursive: true });
    fs.mkdirSync(path.join(this.mediaDir, 'snaps'), { recursive: true });

    this.settingsFile = path.join(this.dataDir, 'settings.json');
    this.gamesFile = path.join(this.dataDir, 'games.json');
    this.systemsFile = path.join(this.dataDir, 'systems.json');
    this.companiesFile = path.join(this.dataDir, 'companies.json');
    this.emulatorsFile = path.join(this.dataDir, 'emulators.json');
  }

  private writeJsonAtomically(filePath: string, value: unknown): void {
    const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    try {
      fs.writeFileSync(temporaryPath, JSON.stringify(value, null, 2), 'utf-8');
      fs.renameSync(temporaryPath, filePath);
    } catch (error) {
      if (fs.existsSync(temporaryPath)) {
        fs.unlinkSync(temporaryPath);
      }
      throw error;
    }
  }

  getDefaultSettings(): AppSettings {
    const isWindows = process.platform === 'win32';
    const appRoot = process.cwd();
    const publicDir = path.join(appRoot, 'public');
    
    // Assurer l'existence des répertoires publics centralisés
    ['roms', 'bios', 'music', 'themes', 'emulators', 'saves'].forEach((sub) => {
      const dir = path.join(publicDir, sub);
      if (!fs.existsSync(dir)) {
        try { fs.mkdirSync(dir, { recursive: true }); } catch {}
      }
    });

    return {
      publicCentralized: true,
      romsDir: path.join(publicDir, 'roms'),
      biosDir: path.join(publicDir, 'bios'),
      musicDir: path.join(publicDir, 'music'),
      themesDir: path.join(publicDir, 'themes'),
      emulatorsDir: path.join(publicDir, 'emulators'),
      savesDir: path.join(publicDir, 'saves'),
      retroarchPath: isWindows ? 'C:\\RetroArch-Win64\\retroarch.exe' : '/usr/bin/retroarch',
      retroarchCoresDir: isWindows 
        ? 'C:\\RetroArch-Win64\\cores' 
        : path.join(publicDir, 'emulators', 'cores'),
      scraperSource: 'both',
      language: 'fr',
      soundEnabled: true,
      soundVolume: 0.8,
      bgmEnabled: false,
      bgmVolume: 0.35,
      crtEffect: false,
      attractMode: true,
      attractDelaySeconds: 60,
      uiTheme: 'neon-dark',
      kioskMode: false,
      kioskPin: '1234',
      kioskFullscreen: true,
      kioskOnlyFavorites: false,
    };
  }

  getSettings(): AppSettings {
    try {
      if (fs.existsSync(this.settingsFile)) {
        const data = fs.readFileSync(this.settingsFile, 'utf-8');
        return { ...this.getDefaultSettings(), ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Erreur lecture settings:', e);
    }
    return this.getDefaultSettings();
  }

  saveSettings(settings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    this.writeJsonAtomically(this.settingsFile, updated);
    return updated;
  }

  getGames(): Game[] {
    try {
      if (fs.existsSync(this.gamesFile)) {
        const data = fs.readFileSync(this.gamesFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Erreur lecture games.json:', e);
    }
    return [];
  }

  saveGames(games: Game[]): void {
    this.writeJsonAtomically(this.gamesFile, games);
  }

  getSystems(): System[] {
    try {
      if (fs.existsSync(this.systemsFile)) {
        const data = fs.readFileSync(this.systemsFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Erreur lecture systems.json:', e);
    }
    return SYSTEMS;
  }

  saveSystems(systems: System[]): System[] {
    this.writeJsonAtomically(this.systemsFile, systems);
    return systems;
  }

  getCompanies(): Company[] {
    try {
      if (fs.existsSync(this.companiesFile)) {
        const data = fs.readFileSync(this.companiesFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Erreur lecture companies.json:', e);
    }
    return COMPANIES;
  }

  saveCompanies(companies: Company[]): Company[] {
    this.writeJsonAtomically(this.companiesFile, companies);
    return companies;
  }

  getEmulators(): EmulatorProfile[] {
    try {
      if (fs.existsSync(this.emulatorsFile)) {
        const data = fs.readFileSync(this.emulatorsFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Erreur lecture emulators.json:', e);
    }
    return BUILTIN_EMULATORS;
  }

  saveEmulators(emulators: EmulatorProfile[]): EmulatorProfile[] {
    this.writeJsonAtomically(this.emulatorsFile, emulators);
    return emulators;
  }

  getDataDir(): string {
    return this.dataDir;
  }
}

export const storage = new StorageService();
