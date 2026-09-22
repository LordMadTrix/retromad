// Types pour les 8 modules étendus et le gestionnaire de musique

export interface GamePlayStats {
  gameId: string;
  gameTitle: string;
  systemId: string;
  systemName: string;
  playTimeMinutes: number;
  sessionCount: number;
  lastPlayedAt: string;
  favoriteRating?: number;
}

export interface PlaySession {
  id: string;
  gameId: string;
  gameTitle: string;
  systemName: string;
  startedAt: string;
  durationMinutes: number;
  achievementsUnlockedCount?: number;
}

export interface PlayerAnalyticsSummary {
  totalPlayTimeMinutes: number;
  totalSessions: number;
  favoriteSystem: string;
  mostPlayedGame: { title: string; minutes: number } | null;
  longestSessionMinutes: number;
  activeStreakDays: number;
}

// Module 2 : Testeur de Manettes & Calibration
export type GamepadLayoutType = 'snes' | 'megadrive' | 'arcade8' | 'playstation';

export interface GamepadTestButton {
  id: string;
  label: string;
  x: number; // % position
  y: number;
  color: string;
  isPressed: boolean;
  pressCount: number;
  lastPressedAt?: number;
}

export interface GamepadCalibrationProfile {
  id: string;
  name: string;
  layout: GamepadLayoutType;
  deadzone: number;
  vibrationIntensity: number;
  rapidFireEnabled: boolean;
  macros: { name: string; combo: string; triggerButton: string }[];
}

// Module 3 : Multi-Profils & Contrôle Parental
export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'player' | 'kid' | 'guest';
  themeColor: string;
  pinRequired: boolean;
  pinCode?: string;
  allowedAgeRating: 'ALL' | '12+' | '16+' | '18+';
  blockedSystems: string[];
  totalPlayTimeMinutes: number;
  unlockedAchievementsCount: number;
}

export interface ParentalControlConfig {
  enabled: boolean;
  masterPin: string;
  maxDailyPlayTimeMinutes: number;
  curfewHour: number; // e.g. 21 for 21:00
  blockGoreGames: boolean;
}

// Module 4 : Frise Chronologique de l'Histoire du Jeu Vidéo
export interface HistoricalMilestone {
  id: string;
  year: number;
  dateStr?: string;
  title: string;
  tagline: string;
  category: 'hardware' | 'game' | 'culture' | 'tech';
  description: string;
  systemIds?: string[];
  highlightGameTitles?: string[];
  icon: string;
  imageUrl?: string;
}

// Module 5 : Print Studio (Jaquettes & Stickers)
export type PrintBoxType = 'snes_box' | 'genesis_box' | 'gameboy_box' | 'ps1_jewel' | 'cartridge_label';

export interface PrintTemplateConfig {
  id: string;
  type: PrintBoxType;
  title: string;
  dimensionsMm: { width: number; height: number; spineWidth?: number };
  systemLabel: string;
  showSpine: boolean;
  showBackSummary: boolean;
  showBarcode: boolean;
  paperFormat: 'A4' | 'Letter';
}

// Module 6 : Pack Nomade & Synchronisation
export interface NomadBackupPackage {
  appVersion: string;
  exportedAt: string;
  machineId: string;
  profiles: UserProfile[];
  playStats: GamePlayStats[];
  achievements: any[];
  cheats: any[];
  saveStates: any[];
  bezelConfig: any;
  customMusicCount: number;
}

// Module 7 : Overlays de Consoles Portables
export type HandheldConsoleModel = 'gameboy_dmg' | 'gameboy_color' | 'gba_indigo' | 'game_gear' | 'neogeo_pocket';

export interface HandheldOverlayConfig {
  model: HandheldConsoleModel;
  shellColor: string;
  backlightEnabled: boolean;
  backlightBrightness: number;
  magnifierLens: boolean;
  pixelGridStrength: number;
  motionBlur: boolean;
}

// Module 8 : Mode Soirée & Bar Arcade (Party Mode)
export interface PartyPlayer {
  id: string;
  name: string;
  score: number;
  roundsWon: number;
  avatar: string;
}

export interface PartyDare {
  id: string;
  text: string;
  penalty: string;
  difficulty: 'fun' | 'hardcore' | 'absurd';
}

export interface PartySessionState {
  isActive: boolean;
  sessionName: string;
  gameTitle: string;
  systemName: string;
  roundDurationSeconds: number;
  currentRound: number;
  timeRemainingSeconds: number;
  activePlayerIndex: number;
  players: PartyPlayer[];
  daresEnabled: boolean;
  selectedDare?: PartyDare;
}

// Gestionnaire de Musiques & Scanner
export interface CustomAudioTrack {
  id: string;
  title: string;
  gameTitle: string;
  system: string;
  composer: string;
  duration: string;
  bpm: number;
  audioUrl?: string; // Blob URL ou URL directe
  fileFormat: 'synth' | 'mp3' | 'ogg' | 'wav' | 'm4a';
  fileSizeMb?: number;
  dateAdded: string;
  isFavorite?: boolean;
}
