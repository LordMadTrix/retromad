import { Game } from '../types';

export const STORAGE_KEY_GAMES = 'retromad_games';
export const STORAGE_KEY_DELETED_IDS = 'retromad_deleted_game_ids';
export const STORAGE_KEY_DELETED_FILENAMES = 'retromad_deleted_filenames';

/**
 * Récupère le registre persistant des ROMs et jeux supprimés par l'utilisateur.
 * Empêche définitivement qu'une ROM supprimée ne réapparaisse lors d'un scan ou rechargement.
 */
export function getDeletedRegistry(): { ids: Set<string>; filenames: Set<string> } {
  const ids = new Set<string>();
  const filenames = new Set<string>();

  if (typeof window === 'undefined') {
    return { ids, filenames };
  }

  try {
    const rawIds = localStorage.getItem(STORAGE_KEY_DELETED_IDS);
    if (rawIds) {
      const parsed: string[] = JSON.parse(rawIds);
      if (Array.isArray(parsed)) {
        parsed.forEach((id) => ids.add(String(id)));
      }
    }
  } catch (e) {
    console.warn('[romStorage] Erreur lecture deleted IDs:', e);
  }

  try {
    const rawNames = localStorage.getItem(STORAGE_KEY_DELETED_FILENAMES);
    if (rawNames) {
      const parsed: string[] = JSON.parse(rawNames);
      if (Array.isArray(parsed)) {
        parsed.forEach((name) => filenames.add(String(name).trim().toLowerCase()));
      }
    }
  } catch (e) {
    console.warn('[romStorage] Erreur lecture deleted filenames:', e);
  }

  return { ids, filenames };
}

/**
 * Vérifie si un jeu ou nom de fichier a été marqué comme supprimé par l'utilisateur.
 */
export function isGameDeleted(gameId?: string, filename?: string): boolean {
  const { ids, filenames } = getDeletedRegistry();
  if (gameId && ids.has(gameId)) return true;
  if (filename && filenames.has(filename.trim().toLowerCase())) return true;
  return false;
}

/**
 * Enregistre définitivement un jeu dans la liste noire des éléments supprimés.
 */
export function markGameDeleted(gameId: string, filename?: string): void {
  if (typeof window === 'undefined') return;

  const { ids, filenames } = getDeletedRegistry();
  if (gameId) ids.add(gameId);
  if (filename) filenames.add(filename.trim().toLowerCase());

  try {
    localStorage.setItem(STORAGE_KEY_DELETED_IDS, JSON.stringify(Array.from(ids)));
    localStorage.setItem(STORAGE_KEY_DELETED_FILENAMES, JSON.stringify(Array.from(filenames)));
  } catch (e) {
    console.error('[romStorage] Impossible de persister la suppression:', e);
  }
}

/**
 * Marque un lot de jeux comme supprimés.
 */
export function markMultipleGamesDeleted(items: { id: string; filename?: string }[]): void {
  if (typeof window === 'undefined' || items.length === 0) return;

  const { ids, filenames } = getDeletedRegistry();
  items.forEach((item) => {
    if (item.id) ids.add(item.id);
    if (item.filename) filenames.add(item.filename.trim().toLowerCase());
  });

  try {
    localStorage.setItem(STORAGE_KEY_DELETED_IDS, JSON.stringify(Array.from(ids)));
    localStorage.setItem(STORAGE_KEY_DELETED_FILENAMES, JSON.stringify(Array.from(filenames)));
  } catch (e) {
    console.error('[romStorage] Impossible de persister le lot supprimé:', e);
  }
}

/**
 * Permet à l'utilisateur de réinitialiser la corbeille ou de restaurer des exclusions.
 */
export function clearDeletedRegistry(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_DELETED_IDS);
    localStorage.removeItem(STORAGE_KEY_DELETED_FILENAMES);
  } catch (e) {
    console.error('[romStorage] Erreur réinitialisation corbeille:', e);
  }
}

/**
 * Filtre une liste de jeux pour retirer impérativement tous ceux supprimés.
 */
export function filterOutDeletedGames(games: Game[]): Game[] {
  const { ids, filenames } = getDeletedRegistry();
  return games.filter((g) => {
    if (ids.has(g.id)) return false;
    if (g.filename && filenames.has(g.filename.trim().toLowerCase())) return false;
    return true;
  });
}

/**
 * Charge les jeux persistés depuis localStorage.
 * Renvoie null si aucune entrée n'a encore été écrite (premier lancement).
 * Renvoie [] si l'utilisateur a supprimé tous ses jeux (évite de réinjecter les démos).
 */
export function getStoredGames(): Game[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_GAMES);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return filterOutDeletedGames(parsed);
      }
    }
  } catch (e) {
    console.warn('[romStorage] Erreur lecture jeux:', e);
  }
  return null;
}

/**
 * Enregistre la ludothèque dans localStorage et synchronise l'API.
 */
export function saveStoredGames(games: Game[]): void {
  if (typeof window === 'undefined') return;

  try {
    const cleaned = filterOutDeletedGames(games);
    localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(cleaned));
  } catch (e) {
    console.error('[romStorage] Erreur sauvegarde jeux:', e);
  }
}
