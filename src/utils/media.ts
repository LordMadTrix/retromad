/**
 * Résolution des URLs des jaquettes et captures d'écran.
 * Gère les protocoles Web (http, https, data, blob) ainsi que le protocole local Electron.
 */
export function resolveMediaUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:') ||
    path.startsWith('/')
  ) {
    return path;
  }
  // En environnement Electron natif
  if (typeof window !== 'undefined' && window.isElectron) {
    return `retromad-media://${path}`;
  }
  // En environnement Web standard
  return path;
}
