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
  esrbOrPegi?: string; // Classification d'âge (ex: PEGI 3, ESRB E)
  coop?: boolean;
}

export interface GameMedia {
  boxart2d?: string;
  boxart3d?: string;
  snap?: string;
  titleScreen?: string;
  wheel?: string;
  video?: string;   // Clip vidéo MP4 de gameplay
  manual?: string;  // Notice / Manuel d'époque au format PDF
  fanart?: string;  // Artwork d'arrière-plan HD
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
  scrapedAt?: string;       // Date du dernier scraping (ISO 8601)
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
  musicDir?: string;
  themesDir?: string;
  emulatorsDir?: string;
  savesDir?: string;
  publicCentralized?: boolean;
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
  crtShaderProfile?: 'arcade-15khz' | 'trinitron-pvm' | 'dmg-matrix' | 'gba-tft' | 'vectrex' | 'pure';
  // Effets visuels d'ambiance (perf. : désactivables sur machines modestes)
  kioskBackgroundVideos?: boolean; // Vidéos YouTube/MP4 de fond des cartes (défaut: activé)
  kioskNeonGlows?: boolean; // Halos lumineux autour des cartes (défaut: activé)
  kioskAnimations?: boolean; // Transitions et zooms au survol (défaut: activé)
  attractMode?: boolean; // Mode démonstration écran de veille Kiosk
  attractDelaySeconds?: number; // Délai d'inactivité avant Attract Mode (défaut: 60s)
  uiTheme: 'neon-dark' | 'arcade' | 'cyberpunk';
  kioskMode: boolean;
  kioskPin: string;
  kioskFullscreen: boolean;
  kioskOnlyFavorites: boolean;
  // Personnalisation du Kiosque (réglée dans Centre Admin → Kiosque)
  kioskWidgets?: Record<string, boolean | string>; // widget id -> visible (music, videos, roulette…) ; '__theme' = thème saisonnier
  kioskHiddenCompanies?: string[]; // firmes masquées de la borne
  kioskHiddenSystems?: string[]; // machines masquées de la borne
  kioskCompanyOrder?: string[]; // ordre d'affichage des firmes (glisser-déposer)
  kioskFeaturedGames?: string[]; // jeux épinglés en vedette sur l'accueil
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

export interface ScrapeCandidate {
  title: string;
  cleanTitle: string;
  systemId: string;
  score: number; // 0 à 100 (% de ressemblance)
  boxartUrl?: string;
  source: 'libretro' | 'screenscraper' | 'local';
  region?: string;
  extra?: {
    year?: string;
    developer?: string;
    publisher?: string;
    genre?: string;
  };
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  htmlUrl: string;
  body?: string | null;
  user: {
    login: string;
    avatarUrl?: string;
  };
  labels: { name: string; color: string }[];
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
  isPullRequest?: boolean;
}

// ─── Capteurs / Enregistrements audio-vidéo ──────────────────────────────

export type ShareNetwork = 'youtube' | 'twitter' | 'tiktok' | 'discord';

export type RecordingType = 'video' | 'audio' | 'screen';

/**
 * Métadonnées d'un enregistrement (AV) persistant dans media/recordings/.
 * Le rendu du fichier se fait via le protocole retromad-media://.
 */
export interface Recording {
  id: string;            // nom de fichier (unique)
  name: string;          // nom de fichier tel quel sur le disque
  path: string;          // chemin absolu sur le disque
  url: string;            // retromad-media://media/recordings/<name>
  size: number;          // taille en octets
  mime: string;          // type MIME du fichier (video/webm, …)
  durationMs?: number;    // durée estimée en millisecondes
  createdAt: string;      // ISO 8601 – date/heure d’enregistrement
  type: RecordingType;    // nature du flux capturé
  /** URL de la miniature générée localement (retromad-media://...) si disponible. */
  thumbnailUrl?: string;
}

/** Source d’écran exposée au renderer (issue de desktopCapturer). */
export interface ScreenSource {
  id: string;          // chromeMediaSourceId correspondant
  name: string;        // libellé usuel (« Écran 1 », …)
  displayId: string;   // identifiant d’affichage (Screen API)
  /** Nature de la source : « screen » (écran complet) ou « window » (fenêtre). */
  type: 'screen' | 'window';
}

/** Réponse de l’enregistrement d’un blob sur le disque (processus principal). */
export interface SaveRecordingResult {
  ok: boolean;
  path?: string;
  name?: string;
  size?: number;
  error?: string;
}

/** Réponse de l’exportation vers un emplacement choisi par l’utilisateur. */
export interface SaveRecordingAsResult {
  ok: boolean;
  path?: string;
  name?: string;
  size?: number;
  error?: string;
}

