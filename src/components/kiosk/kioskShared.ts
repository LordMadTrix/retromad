import { Company, System } from '../../types';

/**
 * Identité d'affichage alternative d'une firme selon le cadre actif.
 * Ex. : côté informatique, Microsoft s'affiche « Microsoft » avec le logo
 * aux quatre carrés (MS-DOS) au lieu de « Microsoft Gaming (Xbox) ».
 *
 * Partagé entre le cœur du Kiosque (niveau firmes, éager) et les niveaux
 * Consoles / Jeux chargés à la demande.
 */

export type KioskCategory = 'all' | 'consoles' | 'computing';

/** Systèmes « informatique » (micro-ordinateurs) présentés dans le cadre PC. */
export const KIOSK_COMPUTING_IDS = new Set([
  'appleii', 'c64', 'amstradcpc', 'msx', 'msx2', 'atarist', 'amiga', 'msdos',
  'zxspectrum', 'zx81', 'pc8801', 'pc9801', 'amiga1200', 'cdi', 'fmtowns',
  'bbcmicro', 'odyssey2', 'x68000', 'x1', 'atari8bit', 'vic20', 'c128',
  'plus4', 'thomson', 'pc8000', 'gx4000',
  // Versions de MS-DOS et de Windows (famille Microsoft PC)
  'dos1', 'dos2', 'dos3', 'dos4', 'dos5', 'dos6',
  'win1', 'win2', 'win30', 'win31', 'win95', 'win98', 'winme', 'win2000',
  'winxp', 'winvista', 'win7', 'win10', 'win11',
  // Autres modèles Commodore et gamme CPC
  'pet', 'c16', 'sx64', 'cdtv', 'c64gs', 'amiga600', 'cd32',
  'cpc464', 'cpc664', 'cpc6128', 'cpcplus',
  // Complément : MSX2+/turbo R, Macintosh, Atari XE GS
  'msx2p', 'msxturbor', 'macintosh', 'xegs',
]);

export interface CompanyDisplayOverride {
  name?: string;
  logoId?: string;
}

export const COMPANY_DISPLAY_BY_CATEGORY: Record<
  'computing' | 'consoles',
  Record<string, CompanyDisplayOverride>
> = {
  computing: {
    microsoft: { name: 'Microsoft', logoId: 'microsoft_pc' },
  },
  consoles: {},
};

export function companyDisplayName(company: Company, category: KioskCategory): string {
  const override = category === 'all' ? undefined : COMPANY_DISPLAY_BY_CATEGORY[category][company.id];
  return override?.name || company.name;
}

/** Filtrer les firmes selon la catégorie choisie (PC / Consoles). */
export function companyMatchesCategory(
  companyId: string,
  systems: System[],
  category: KioskCategory
): boolean {
  if (category === 'all') return true;
  const compSystems = systems.filter((s) => s.companyId === companyId);
  if (compSystems.length === 0) return false;
  const hasComputing = compSystems.some((s) => KIOSK_COMPUTING_IDS.has(s.id));
  const hasConsoles = compSystems.some((s) => !KIOSK_COMPUTING_IDS.has(s.id));
  return category === 'computing' ? hasComputing : hasConsoles;
}

/** Formate une taille en octets pour l'affichage Kiosque. */
export function formatGameSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return 'Inconnu';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Formate un temps de jeu en minutes pour l'affichage Kiosque. */
export function formatPlayTime(minutes?: number): string {
  if (!minutes || minutes <= 0) return '0 min';
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (hours === 0) return `${remainingMins} min`;
  return `${hours}h ${remainingMins.toString().padStart(2, '0')}m`;
}
