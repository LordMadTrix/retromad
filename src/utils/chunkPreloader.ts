/**
 * File de préchargement d'arrière-plan.
 *
 * Exécute les imports dynamiques (chunks lazy) les uns après les autres,
 * en profitant des temps morts du thread principal (requestIdleCallback,
 * avec repli setTimeout). Objectif : des changements d'onglet et des
 * ouvertures de modales instantanés sans pénaliser le démarrage.
 *
 * Chaque tâche est isolée : un échec (chunk absent, réseau…) n'interrompt
 * jamais la file et reste silencieux.
 */

type PreloadTask = () => Promise<unknown>;

/** Exécute `fn` au prochain temps mort du thread (idle callback ou repli). */
function scheduleIdle(fn: () => void, timeoutMs = 2000): void {
  const w = window as unknown as {
    requestIdleCallback?: (cb: (deadline: { timeRemaining: () => number }) => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (handle: number) => void;
  };
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(() => fn(), { timeout: timeoutMs });
  } else {
    window.setTimeout(fn, 120);
  }
}

/**
 * Enfile des tâches de préchargement. Démarrage différé (le boot doit
 * s'afficher d'abord), puis exécution séquentielle pendant les temps morts.
 * Retourne une fonction d'annulation (aucun chargement restant, même en cours).
 */
export function scheduleChunkPreload(
  tasks: PreloadTask[],
  initialDelayMs = 3000
): () => void {
  const pending = [...tasks];
  let index = 0;
  let cancelled = false;

  const runNext = (): void => {
    if (cancelled || index >= pending.length) return;
    const task = pending[index++];
    scheduleIdle(() => {
      if (cancelled) return;
      try {
        Promise.resolve()
          .then(task)
          .catch(() => {
            /* chunk indisponible : on continue la file */
          })
          .finally(() => {
            if (!cancelled) scheduleIdle(runNext, 1000);
          });
      } catch {
        if (!cancelled) scheduleIdle(runNext, 1000);
      }
    }, 1500);
  };

  const timer = window.setTimeout(runNext, initialDelayMs);

  return () => {
    cancelled = true;
    window.clearTimeout(timer);
  };
}
