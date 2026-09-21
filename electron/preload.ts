import { contextBridge, ipcRenderer } from 'electron';
import { AppSettings, Game, EmulatorProfile, ExtensionInfo, ExtensionProgress } from './types';

export const API = {
  // Paramètres
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: Partial<AppSettings>): Promise<AppSettings> => ipcRenderer.invoke('save-settings', settings),
  selectDirectory: (): Promise<string | null> => ipcRenderer.invoke('select-directory'),

  // Données de base
  getSystems: () => ipcRenderer.invoke('get-systems'),
  getCompanies: () => ipcRenderer.invoke('get-companies'),

  // Gestion des ROMs
  getGames: (): Promise<Game[]> => ipcRenderer.invoke('get-games'),
  saveGames: (games: Game[]): Promise<boolean> => ipcRenderer.invoke('save-games', games),
  toggleFavorite: (gameId: string): Promise<boolean> => ipcRenderer.invoke('toggle-favorite', gameId),
  scanRoms: (): Promise<Game[]> => ipcRenderer.invoke('scan-roms'),
  onScanProgress: (callback: (data: { count: number; file: string }) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on('scan-progress', handler);
    return () => {
      ipcRenderer.removeListener('scan-progress', handler);
    };
  },

  // Scraping
  scrapeGame: (game: Game): Promise<Game> => ipcRenderer.invoke('scrape-game', game),
  scrapeAll: (): Promise<Game[]> => ipcRenderer.invoke('scrape-all'),
  onScrapeProgress: (callback: (data: any) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on('scrape-progress', handler);
    return () => {
      ipcRenderer.removeListener('scrape-progress', handler);
    };
  },

  // BIOS & Lancement
  checkBios: () => ipcRenderer.invoke('check-bios'),
  launchGame: (game: Game, emulatorId?: string): Promise<{ success: boolean; message: string }> =>
    ipcRenderer.invoke('launch-game', game, emulatorId),
  getEmulators: (): Promise<EmulatorProfile[]> => ipcRenderer.invoke('get-emulators'),
  detectEmulators: (): Promise<EmulatorProfile[]> => ipcRenderer.invoke('detect-emulators'),

  // Gestion des Extensions & Cœurs
  listExtensions: (): Promise<ExtensionInfo[]> => ipcRenderer.invoke('list-extensions'),
  installAllExtensions: (): Promise<{ success: number; failed: number; total: number }> =>
    ipcRenderer.invoke('install-all-extensions'),
  installExtension: (coreName: string): Promise<boolean> =>
    ipcRenderer.invoke('install-extension', coreName),
  createRomsFolders: (): Promise<{ created: number; total: number }> =>
    ipcRenderer.invoke('create-roms-folders'),
  onExtensionProgress: (callback: (data: ExtensionProgress) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on('extension-progress', handler);
    return () => {
      ipcRenderer.removeListener('extension-progress', handler);
    };
  },

  // Mode Kiosk & Gestion de fenêtre
  setKioskMode: (enabled: boolean): Promise<boolean> => ipcRenderer.invoke('set-kiosk-mode', enabled),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
};

contextBridge.exposeInMainWorld('api', API);
