import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import { AppSettings, Game } from '../types';

export class StorageService {
  private dataDir: string;
  private settingsFile: string;
  private gamesFile: string;
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
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    
    return {
      romsDir: path.join(homeDir, 'RetroMad', 'Roms'),
      biosDir: path.join(homeDir, 'RetroMad', 'Bios'),
      retroarchPath: isWindows ? 'C:\\RetroArch-Win64\\retroarch.exe' : '/usr/bin/retroarch',
      retroarchCoresDir: isWindows 
        ? 'C:\\RetroArch-Win64\\cores' 
        : path.join(homeDir, '.config/retroarch/cores'),
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

  getDataDir(): string {
    return this.dataDir;
  }
}

export const storage = new StorageService();
