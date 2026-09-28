/**
 * Identité d'affichage des firmes selon le contexte.
 *
 * Certaines firmes portent une identité « gaming » (ex. « Microsoft Gaming
 * (Xbox) ») dans les données d'origine. Quand on présente une machine
 * informatique (MS-DOS, Windows, micros), il faut montrer l'identité
 * neutre/historique (ex. « Microsoft » au logo 4 carrés).
 */

export type DisplayContext = 'computing' | 'gaming';

interface CompanyDisplayOverride {
  name?: string;
  logoId?: string;
}

const OVERRIDES: Record<string, Record<DisplayContext, CompanyDisplayOverride>> = {
  microsoft: {
    computing: { name: 'Microsoft', logoId: 'microsoft_pc' },
    gaming: {}, // identité « Gaming (Xbox) » d'origine
  },
};

/** Contexte d'une machine : informatique ou jeu vidéo. */
export function isComputingSystem(systemId: string): boolean {
  const COMPUTING_IDS = new Set([
    'appleii', 'c64', 'amstradcpc', 'msx', 'msx2', 'atarist', 'amiga', 'msdos',
    'zxspectrum', 'zx81', 'pc8801', 'pc9801', 'amiga1200', 'cdi', 'fmtowns',
    'bbcmicro', 'odyssey2', 'x68000', 'x1', 'atari8bit', 'vic20', 'c128',
    'plus4', 'thomson', 'pc8000', 'gx4000',
    // MS-DOS / Windows
    'dos1', 'dos2', 'dos3', 'dos4', 'dos5', 'dos6',
    'win1', 'win2', 'win30', 'win31', 'win95', 'win98', 'winme', 'win2000',
    'winxp', 'winvista', 'win7', 'win10', 'win11',
    // Commodore / Amstrad
    'pet', 'c16', 'sx64', 'cdtv', 'c64gs', 'amiga600', 'cd32',
    'cpc464', 'cpc664', 'cpc6128', 'cpcplus',
    // MSX / Mac / Atari 8-bit
    'msx2p', 'msxturbor', 'macintosh', 'xegs',
  ]);
  return COMPUTING_IDS.has(systemId);
}

/** Nom d'affichage d'une firme dans un contexte donné. */
export function companyDisplayNameFor(
  companyId: string | undefined,
  originalName: string,
  context: DisplayContext
): string {
  if (!companyId) return originalName;
  const override = OVERRIDES[companyId.toLowerCase()]?.[context];
  return override?.name || originalName;
}

/** Identifiant de logo d'affichage d'une firme dans un contexte donné. */
export function companyLogoIdFor(
  companyId: string | undefined,
  context: DisplayContext
): string | undefined {
  if (!companyId) return undefined;
  return OVERRIDES[companyId.toLowerCase()]?.[context]?.logoId;
}
