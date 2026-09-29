import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { AppSettings, Game, EmulatorProfile, ExtensionInfo, ExtensionProgress, System, Company, ScrapeCandidate } from './types';


export interface ScrapeProgressData {
  total: number;
  current: number;
  currentGameTitle: string;
  systemId?: string;
}

// Marqueur d'environnement bureau (différencie Electron du mode navigateur/web)
contextBridge.exposeInMainWorld('isElectron', true);

export const API = {
  // Paramètres
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: Partial<AppSettings>): Promise<AppSettings> => ipcRenderer.invoke('save-settings', settings),
  selectDirectory: (): Promise<string | null> => ipcRenderer.invoke('select-directory'),
  // Rapport santé : ouvre (ou crée) le dossier BIOS d'un système dans l'explorateur
  openBiosFolder: (systemId: string): Promise<boolean> => ipcRenderer.invoke('open-bios-folder', systemId),

  // Données de base
  getSystems: (): Promise<System[]> => ipcRenderer.invoke('get-systems'),
  saveSystems: (systems: System[]): Promise<System[]> => ipcRenderer.invoke('save-systems', systems),
  getCompanies: (): Promise<Company[]> => ipcRenderer.invoke('get-companies'),
  saveCompanies: (companies: Company[]): Promise<Company[]> => ipcRenderer.invoke('save-companies', companies),

  // Gestion des ROMs
  getGames: (): Promise<Game[]> => ipcRenderer.invoke('get-games'),
  saveGames: (games: Game[]): Promise<boolean> => ipcRenderer.invoke('save-games', games),
  toggleFavorite: (gameId: string): Promise<boolean> => ipcRenderer.invoke('toggle-favorite', gameId),
  scanRoms: (): Promise<Game[]> => ipcRenderer.invoke('scan-roms'),
  // Notification de l'auto-scan initial (bibliothèque vide -> import auto)
  refreshGamesAfterAutoScan: (callback: (count: number) => void) => {
    const handler = (_: IpcRendererEvent, count: number) => callback(count);
    ipcRenderer.on('games-auto-imported', handler);
    return () => {
      ipcRenderer.removeListener('games-auto-imported', handler);
    };
  },
  onScanProgress: (callback: (data: { count: number; file: string }) => void) => {
    const handler = (_: IpcRendererEvent, data: { count: number; file: string }) => callback(data);
    ipcRenderer.on('scan-progress', handler);
    return () => {
      ipcRenderer.removeListener('scan-progress', handler);
    };
  },

  // Scraping
  scrapeGame: (game: Game): Promise<Game> => ipcRenderer.invoke('scrape-game', game),
  searchScrapeCandidates: (game: Game, query?: string): Promise<ScrapeCandidate[]> =>
    ipcRenderer.invoke('search-scrape-candidates', game, query),
  scrapeGameWithTitle: (game: Game, chosenTitle: string): Promise<Game> =>
    ipcRenderer.invoke('scrape-game-with-title', game, chosenTitle),
  scrapeAll: (): Promise<Game[]> => ipcRenderer.invoke('scrape-all'),
  onScrapeProgress: (callback: (data: ScrapeProgressData) => void) => {
    const handler = (_: IpcRendererEvent, data: ScrapeProgressData) => callback(data);
    ipcRenderer.on('scrape-progress', handler);
    return () => {
      ipcRenderer.removeListener('scrape-progress', handler);
    };
  },


  // BIOS & Lancement
  checkBios: () => ipcRenderer.invoke('check-bios'),
  launchGame: (game: Game, emulatorId?: string): Promise<{ success: boolean; message: string }> =>
    ipcRenderer.invoke('launch-game', game, emulatorId),
  // Lecture directe d'une ROM (base64) pour le lecteur intégré EmulatorJS
  readRomFile: (romPath: string): Promise<{ ok: boolean; dataB64?: string; error?: string }> =>
    ipcRenderer.invoke('read-rom-file', romPath),
  getEmulators: (): Promise<EmulatorProfile[]> => ipcRenderer.invoke('get-emulators'),
  saveEmulators: (emulators: EmulatorProfile[]): Promise<EmulatorProfile[]> => ipcRenderer.invoke('save-emulators', emulators),
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
    const handler = (_: IpcRendererEvent, data: ExtensionProgress) => callback(data);
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

  // Détection & Import automatique Clé USB
  detectUsbDrives: (): Promise<{ path: string; label: string; romsCount: number }[]> =>
    ipcRenderer.invoke('detect-usb-drives'),
  importFromUsb: (usbPath: string): Promise<{ success: boolean; imported: number; total?: number; games?: Game[]; message?: string }> =>
    ipcRenderer.invoke('import-from-usb', usbPath),
};

contextBridge.exposeInMainWorld('api', API);
