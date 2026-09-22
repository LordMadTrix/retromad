export interface RetroAchievement {
  id: string;
  gameId: string;
  gameTitle: string;
  title: string;
  description: string;
  badgeIcon: string;
  type: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
  rarityPct?: number;
  category?: string;
}

export interface PlayerProfile {
  username: string;
  avatarUrl: string;
  level: number;
  totalXp: number;
  title: string;
  rank: string;
  registeredDate: string;
}

export interface GameCheat {
  id: string;
  gameId: string;
  gameTitle: string;
  title: string;
  code: string;
  type: 'gamegenie' | 'actionreplay' | 'gameshark';
  enabled: boolean;
  description: string;
  systemName?: string;
}

export interface SaveStateItem {
  id: string;
  gameId: string;
  gameTitle: string;
  systemId: string;
  systemName: string;
  slot: number | 'auto';
  timestamp: string;
  note: string;
  thumbnail?: string;
  fileSize: string;
  stateType: 'savestate' | 'sram_cartridge';
}

export interface ChiptuneNote {
  freq: number;
  bass?: number;
  len?: number;
  type?: 'square' | 'sawtooth' | 'triangle';
  noise?: boolean;
}

export interface ChiptuneTrack {
  id: string;
  title: string;
  gameTitle: string;
  system: string;
  composer: string;
  duration: string;
  bpm: number;
  pattern: ChiptuneNote[];
  year?: number;
}

export interface TournamentMatch {
  id: string;
  round: number; // 1: Quarts/Huitièmes, 2: Demies, 3: Finale
  matchIndex: number;
  player1: string;
  player2: string;
  score1: number;
  score2: number;
  winner?: string;
  isComplete: boolean;
}

export interface TournamentData {
  id: string;
  title: string;
  gameTitle: string;
  size: 4 | 8 | 16;
  players: string[];
  matches: TournamentMatch[];
  winner?: string;
  date: string;
}

export interface ManualSection {
  heading: string;
  text?: string;
  tip?: string;
  controls?: { button: string; action: string }[];
}

export interface ManualPage {
  pageNumber: number;
  title: string;
  subtitle?: string;
  image?: string;
  sections: ManualSection[];
}

export interface RetroManual {
  id: string;
  gameId: string;
  gameTitle: string;
  systemName: string;
  coverImage?: string;
  releaseYear?: number;
  totalPages: number;
  pages: ManualPage[];
}

export interface BezelConfig {
  id: string;
  name: string;
  description: string;
  category: 'arcade' | 'crt' | 'handheld';
  borderGradient: string;
  borderWidth: number;
  crtCurvature: number; // 0 to 10
  scanlineIntensity: number; // 0 to 100
  bloomGlow: number; // 0 to 100
  vignette: number; // 0 to 100
  tint: 'normal' | 'gameboy-green' | 'amber' | 'trinitron' | 'pvm-cool';
  aspectRatio: '4:3' | '8:7' | '10:9' | '16:9' | 'pixel-perfect';
  showBezelMarquee?: boolean;
  cabinetName?: string;
}

export interface DailyChallenge {
  id: string;
  gameId: string;
  gameTitle: string;
  systemName: string;
  challengeTitle: string;
  objective: string;
  xpReward: number;
  difficulty: 'Facile' | 'Moyen' | 'Difficile' | 'Expert';
  timeLimitMinutes?: number;
  isCompleted: boolean;
  completedAt?: string;
}
