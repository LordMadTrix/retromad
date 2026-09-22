export interface CompanyMilestone {
  year: number;
  title: string;
  description: string;
}

export interface CompanyFigure {
  name: string;
  role: string;
  contribution: string;
}

export interface CompanyMuseumExhibition {
  tagline: string;
  curatorIntro: string;
  eras: {
    era: string;
    period: string;
    title: string;
    description: string;
  }[];
  milestones: CompanyMilestone[];
  keyFigures: CompanyFigure[];
  philosophy: string;
  culturalImpact: string;
  franchiseHistories?: {
    name: string;
    year: number;
    description: string;
  }[];
  anecdotes: string[];
  totalConsolesSoldEstimate?: string;
  bestSellingConsole?: string;
  bestSellingGame?: string;
  youtubeId?: string;
}

export interface Company {
  id: string;
  name: string;
  country: string;
  founded: number;
  logoText: string;
  accentColor: string;
  description: string;
  famousFranchises: string[];
  consoles: string[];
  videoUrl?: string;
  youtubeId?: string;
  museum?: CompanyMuseumExhibition;
}

export interface SystemSpecs {
  cpu: string;
  gpuOrAudio: string;
  resolution: string;
  media: string;
  unitsSold?: string;
}

export interface BiosRequirement {
  filename: string;
  description: string;
  md5?: string;
  size?: number;
  optional?: boolean;
}

export interface HardwareHighlights {
  cpuArchitecture?: string;
  ram?: string;
  soundChip?: string;
  videoChip?: string;
  colors?: string;
  controllers?: string;
}

export interface MuseumExhibition {
  tagline: string;                  // Phrase d'accroche muséale
  history: string;                  // Récit historique complet de la console (origines, lancement, impact)
  innovations: string[];            // Innovations majeures introduites dans le jeu vidéo
  anecdotes: string[];              // Secrets de fabrication et faits historiques marquants
  iconicGames: string[];            // Chefs-d'œuvre incontournables ayant fait la gloire de la machine
  hardwareHighlights: HardwareHighlights; // Détails techniques d'ingénierie
  rivalry?: string;                 // Rivalité historique majeure
  curatorNote?: string;             // Note du conservateur de l'exposition
  youtubeId?: string;              // ID de la vidéo YouTube (pub de lancement, documentaire historique)
}


export interface System {
  id: string;
  name: string;
  shortName: string;
  companyId: string;
  manufacturer: string;
  releaseYear: number;
  generation: string;
  specs: SystemSpecs;
  extensions: string[];
  libretroSystemName: string;
  defaultCoreLinux: string;
  defaultCoreWindows: string;
  subfolder: string;
  icon: string;
  themeColor: string;
  logoUrl?: string;
  biosList: BiosRequirement[];
  museum?: MuseumExhibition;
}

export interface GameMetadata {
  releaseDate?: string;
  developer?: string;
  publisher?: string;
  genres?: string[];
  players?: string;
  rating?: number; // 0 to 100
  synopsis?: string;
}

export interface GameMedia {
  boxart2d?: string;
  boxart3d?: string;
  snap?: string;
  titleScreen?: string;
  wheel?: string;
}

export interface Game {
  id: string;
  systemId: string;
  title: string;
  cleanTitle: string;
  path: string;
  filename: string;
  extension: string;
  size: number;
  crc32?: string;
  md5?: string;
  region?: string;
  favorite: boolean;
  playCount: number;
  lastPlayed?: string;
  playTimeMinutes?: number; // Temps de jeu total accumulé en minutes
  metadata: GameMetadata;
  media: GameMedia;
}

export interface BiosStatus {
  systemId: string;
  systemName: string;
  filename: string;
  description: string;
  expectedMd5?: string;
  found: boolean;
  actualMd5?: string;
  md5Match?: boolean;
  path?: string;
  optional: boolean;
}

export interface AppSettings {
  romsDir: string;
  biosDir: string;
  retroarchPath: string;
  retroarchCoresDir: string;
  scraperSource: 'libretro' | 'screenscraper' | 'both';
  screenScraperUser?: string;
  screenScraperPassword?: string;
  language: 'fr' | 'en';
  soundEnabled: boolean;
  soundVolume?: number; // 0 to 1
  bgmEnabled?: boolean; // Musique chiptune d'ambiance
  bgmVolume?: number; // 0 to 1
  crtEffect?: boolean;
  attractMode?: boolean; // Mode démonstration écran de veille Kiosk
  attractDelaySeconds?: number; // Délai d'inactivité avant Attract Mode (défaut: 60s)
  uiTheme: 'neon-dark' | 'arcade' | 'cyberpunk';
  kioskMode: boolean;
  kioskPin: string;
  kioskFullscreen: boolean;
  kioskOnlyFavorites: boolean;
  systemLaunchers?: Record<string, string>; // systemId -> emulatorId
}

export interface EmulatorProfile {
  id: string;
  name: string;
  category: 'retroarch' | 'flatpak' | 'standalone';
  executableLinux: string;
  executableWindows: string;
  argsTemplateLinux: string;
  argsTemplateWindows: string;
  supportedSystems: string[];
  isDetected?: boolean;
  detectedPath?: string;
}

export interface ScrapeProgress {
  total: number;
  current: number;
  currentGameTitle: string;
  systemName: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  log: string[];
}

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
