import { useEffect, useRef } from 'react';

/**
 * Manette Smartphone — pont d'injection clavier.
 *
 * Reçoit les entrées du téléphone (main process → IPC 'phone-gamepad-input')
 * et les injecte dans la page sous forme d'événements clavier standards que
 * EmulatorJS écoute déjà (mapping par défaut : A=z, B=x, X=a, Y=s, L=q, R=e,
 * Select=v, Start=Entrée, flèches).
 *
 * Garde-fou anti-touches bloquées : à la déconnexion du téléphone, le serveur
 * renvoie explicitement le relâchement de toutes ses touches maintenues.
 * Un filet de sécurité (30 s) couvre tout autre cas improbable.
 */
export function usePhoneGamepad(): void {
  // Dernière pression par touche → pour le relâchement de sécurité
  const lastPress = useRef<Map<string, number>>(new Map());
  const injectedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!window.api?.onPhoneGamepadInput) return;

    // Filet de sécurité très large : aucune touche ne reste bloquée indéfiniment
    const STALE_RELEASE_MS = 30000;

    const release = (key: string): void => {
      if (!injectedRef.current.has(key)) return;
      injectedRef.current.delete(key);
      try {
        window.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true }));
      } catch {
        /* ignore */
      }
    };

    const unsub = window.api.onPhoneGamepadInput(({ key, pressed }) => {
      if (pressed) {
        lastPress.current.set(key, Date.now());
        if (!injectedRef.current.has(key)) {
          injectedRef.current.add(key);
          try {
            window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
          } catch {
            /* ignore */
          }
        }
      } else {
        lastPress.current.delete(key);
        release(key);
      }
    });

    // Boucle de sécurité : relâche les touches dont le maintien a cessé d'arriver
    const staleTimer = window.setInterval(() => {
      const now = Date.now();
      for (const key of Array.from(injectedRef.current)) {
        const last = lastPress.current.get(key);
        if (!last || now - last > STALE_RELEASE_MS) {
          release(key);
          lastPress.current.delete(key);
        }
      }
    }, 500);

    // À la fermeture de l'app : tout relâcher
    const cleanupAll = () => {
      for (const key of Array.from(injectedRef.current)) release(key);
    };
    window.addEventListener('beforeunload', cleanupAll);

    return () => {
      window.clearInterval(staleTimer);
      window.removeEventListener('beforeunload', cleanupAll);
      cleanupAll();
      unsub();
    };
  }, []);
}
