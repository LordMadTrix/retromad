import { useCallback, useEffect, useRef, useState } from 'react';
import { ScreenSource } from '../../electron/types';

/** Phase du cycle de vie de l’enregistreur. */
export type RecorderPhase = 'idle' | 'preparing' | 'recording' | 'preview';

export interface ScreenRecorderState {
  phase: RecorderPhase;
  /** Durée en secondes (en cours ou de la derniere prise). */
  elapsed: number;
  /** URL objet locale de la derniere prise pour la lecture/preview. */
  previewUrl: string | null;
  /** Nom de fichier de la derniere prise (une fois sauvegardee). */
  recordedName: string | null;
  /** Message d’erreur transitoire (affiche un court bandeau). */
  error: string | null;
}

export interface UseScreenRecorder {
  state: ScreenRecorderState;
  /** Liste des sources d'ecran/fenêtres exposées au renderer. */
  sources: ScreenSource[];
  /** Source actuellement sélectionnée (id de desktopCapturer). */
  selectedSourceId: string | null;
  /** Définit la source de capture (écran ou fenêtre) via le processus principal. */
  selectSource: (sourceId: string | null) => Promise<boolean>;
  /** Demarre la capture (affiche la demande d'autorisation systeme). */
  start: () => Promise<void>;
  /** Arrete la capture, assemble le Blob et le persiste sur le disque. */
  stop: () => Promise<void>;
  /** Annule sans sauvegarder (en cours de preparation ou d'enregistrement). */
  cancel: () => void;
  /** Recharge la liste des enregistrements depuis le disque. */
  refreshList: () => Promise<void>;
}

/**
 * Enregistre la Vue Kiosque / gameplay (ecran principal) et les system audio
 * quand la plateforme le permet. La capture elle-meme (getDisplayMedia +
 * MediaRecorder) tourne dans le renderer ; la persistence et les sources
 * d'ecran passent par le processus principal (desktopCapturer / save-recording).
 */
export function useScreenRecorder(): UseScreenRecorder {
  const [state, setState] = useState<ScreenRecorderState>({
    phase: 'idle',
    elapsed: 0,
    previewUrl: null,
    recordedName: null,
    error: null,
  });
  const [sources, setSources] = useState<ScreenSource[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startAtRef = useRef<number>(0);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const revokePreview = () => {
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }
  };

  const loadSources = useCallback(async () => {
    try {
      const list = await window.api?.getScreenSources();
      setSources(list || []);
      // Par défaut, pas de source sélectionnée → écran principal
      setSelectedSourceId(null);
    } catch (e) {
      console.warn('[RetroMad] Impossible de lister les sources d’écran :', e);
      setSources([]);
      setSelectedSourceId(null);
    }
  }, []);

  const selectSource = useCallback(async (sourceId: string | null): Promise<boolean> => {
    try {
      const ok = await window.api?.setScreenSource(sourceId);
      if (ok) {
        setSelectedSourceId(sourceId);
      }
      return ok ?? false;
    } catch (e) {
      console.warn('[RetroMad] Impossible de sélectionner la source :', e);
      return false;
    }
  }, []);

  const refreshList = useCallback(async () => {
    // La liste est gerée par le composant via listRecordings ; ce hook se limite
    // a la capture. On notifie simplement que la phase revient a idle.
    return undefined;
  }, []);

  useEffect(() => {
    loadSources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Génère une miniature via canvas depuis un blob vidéo, puis la persiste
   * côté principal via save-thumbnail.
   */
  const generateThumbnail = useCallback(async (blob: Blob, filename: string) => {
    let videoUrl = '';
    try {
      if (!window.api?.saveThumbnail) return;
      videoUrl = URL.createObjectURL(blob);
      const video = document.createElement('video');
      video.src = videoUrl;
      video.muted = true;
      video.playsInline = true;

      await new Promise<void>((resolve, reject) => {
        video.addEventListener('loadeddata', () => resolve(), { once: true });
        video.addEventListener('error', () => reject(new Error('Erreur chargement vidéo miniature')), { once: true });
        video.load();
        // Si la vidéo est courte, on force un seek au milieu
        video.currentTime = 0;
      });

      // Attendre le rendu du premier frame
      await new Promise<void>((resolve) => {
        const check = () => video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA ? resolve() : setTimeout(check, 50);
        check();
      });

      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 180;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(videoUrl);
        return;
      }
      // Dessiner le frame courant (au milieu de la vidéo)
      video.currentTime = (video.duration || 0) / 2;
      await new Promise<void>((resolve) => {
        video.addEventListener('seeked', () => resolve(), { once: true });
        setTimeout(() => resolve(), 1000); // timeout de secours
      });

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      URL.revokeObjectURL(videoUrl);
      videoUrl = '';

      await window.api.saveThumbnail(filename, dataUrl);
    } catch (e) {
      console.warn('[RetroMad] Génération miniature impossible :', e);
      try { if (videoUrl) URL.revokeObjectURL(videoUrl); } catch { /* ignore */ }
    }
  }, []);

  const start = useCallback(async () => {
    try {
      setState((s) => ({ ...s, phase: 'preparing', error: null }));
      revokePreview();

      // Demande de capture d'ecran : le main process autorise la source
      // sélectionnée (ou l'ecran principal par défaut) via
      // setDisplayMediaRequestHandler avec preferredCaptureSourceId.
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: true,
      });
      streamRef.current = stream;

      // MediaRecorder accepte les codecs video les plus rependus. On garde le
      // mimeType par defaut (webm) ; les chunks sont assemblés a l'arret.
      const options: MediaRecorderOptions = {};
      const mime = MediaRecorder.isTypeSupported('video/webm;codec=vp9')
        ? 'video/webm;codec=vp9'
        : (MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : undefined);
      if (mime) {
        options.mimeType = mime;
      }

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mime || 'video/webm' });
        const previewUrl = URL.createObjectURL(blob);
        const durationMs = Date.now() - startAtRef.current;

        setState((s) => ({
          ...s,
          phase: 'preview',
          elapsed: Math.round(durationMs / 1000),
          previewUrl,
          recordedName: null,
          error: null,
        }));

        // Persistance sur le disque via le processus principal.
        const ext = mime && mime.startsWith('video') ? '.webm' : '.webm';
        const filename = `capture_${new Date().toISOString().replace(/[:.]/g, '-')}${ext}`;
        try {
          const result = await window.api?.saveRecording(filename, await blob.arrayBuffer(), durationMs);
          if (result?.ok) {
            // Génération et sauvegarde de la miniature
            const recordedBlob = new Blob(chunksRef.current, { type: mime || 'video/webm' });
            await generateThumbnail(recordedBlob, filename);
            setState((s) => ({ ...s, recordedName: result.name || filename, error: null }));
          } else {
            setState((s) => ({ ...s, error: result?.error || 'Sauvegarde impossible.', recordedName: null }));
          }
        } catch (e: any) {
          setState((s) => ({ ...s, error: e?.message || 'Sauvegarde impossible.', recordedName: null }));
        }

        // Libere le flux capture.
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      recorder.start(200); // 200ms de chunks
      startAtRef.current = Date.now();
      setState((s) => ({ ...s, phase: 'recording', error: null }));

      const timer = setInterval(() => {
        setState((s) => ({ ...s, elapsed: Math.round((Date.now() - startAtRef.current) / 1000) }));
      }, 1000);
      timerRef.current = timer;
    } catch (e: any) {
      console.error('[RetroMad] start recording:', e);
      setState({
        phase: 'idle',
        elapsed: 0,
        previewUrl: null,
        recordedName: null,
        error: e?.message || "Impossible de demarrer l'enregistrement.",
      });
    }
  }, [generateThumbnail]);

  const stop = useCallback(async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error('[RetroMad] stop recording:', e);
      }
    }
    clearTimer();
    startAtRef.current = 0;
  }, []);

  const cancel = useCallback(() => {
    try {
      mediaRecorderRef.current?.stop();
    } catch {
      /* ignore */
    }
    clearTimer();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    chunksRef.current = [];
    setState({ phase: 'idle', elapsed: 0, previewUrl: null, recordedName: null, error: null });
  }, [state.previewUrl]);

  // Nettoyage a la fermeture du composant.
  useEffect(() => {
    return () => {
      clearTimer();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch { /* ignore */ }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return {
    state,
    sources,
    selectedSourceId,
    selectSource,
    start,
    stop,
    cancel,
    refreshList,
  };
}
