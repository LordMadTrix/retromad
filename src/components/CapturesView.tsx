import React, { useState, useEffect, useCallback } from 'react';
import {
  Video, Square, XCircle, Play, Trash2, FolderOpen, RefreshCw,
  Share2, AlertCircle, Timer, Clock, Download,
} from 'lucide-react';
import { Recording, ShareNetwork } from '../../electron/types';
import { useScreenRecorder } from '../hooks/useScreenRecorder';
import {
  formatFileSize, formatDuration, formatDate,
  SHARE_NETWORK_LABELS, SHARE_NETWORK_COLORS, openShare,
} from '../utils/shareHelpers';

const SHARE_NETWORKS: ShareNetwork[] = ['youtube', 'twitter', 'tiktok', 'discord'];

export const CapturesView: React.FC = () => {
  const recorder = useScreenRecorder();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [playing, setPlaying] = useState<{ url: string; name: string } | null>(null);
  const [saveAsStatus, setSaveAsStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const { phase, elapsed, previewUrl, recordedName, error } = recorder.state;

  const loadRecordings = useCallback(async () => {
    if (!window.api?.listRecordings) {
      setRecordings([]);
      return;
    }
    setIsLoadingList(true);
    try {
      const list = await window.api.listRecordings();
      setRecordings(list || []);
    } catch (e) {
      console.warn('[RetroMad] list-recordings error:', e);
      setRecordings([]);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  // Charger la liste au montage
  useEffect(() => {
    loadRecordings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rafraîchir la liste quand un enregistrement vient d'être sauvegardé
  useEffect(() => {
    if (phase === 'preview' && recordedName) {
      loadRecordings();
    }
  }, [phase, recordedName, loadRecordings]);

  // --- Gestionnaires d'actions sur les enregistrements ---

  const handleDelete = useCallback(async (filename: string) => {
    if (!window.api?.deleteRecording) return;
    const confirmed = confirm(`Supprimer l'enregistrement « ${filename} » ?`);
    if (!confirmed) return;
    const ok = await window.api.deleteRecording(filename);
    if (ok) loadRecordings();
  }, [loadRecordings]);

  const handleSaveAs = useCallback(async (rec: Recording) => {
    setSaveAsStatus(null);
    try {
      const result = await window.api?.saveRecordingAs(rec.name);
      if (result?.ok) {
        setSaveAsStatus({ ok: true, message: `Sauvegardé sous : ${result.name}` });
      } else {
        setSaveAsStatus({ ok: false, message: result?.error || 'Export annulé.' });
      }
    } catch (e: any) {
      setSaveAsStatus({ ok: false, message: e?.message || 'Erreur export.' });
    }
  }, []);

  const handleSelectSource = useCallback(async (sourceId: string | null) => {
    try {
      await recorder.selectSource(sourceId);
    } catch (e) {
      console.warn('[RetroMad] selectSource error:', e);
    }
  }, [recorder.selectSource]);

  const handleOpenFolder = useCallback(async () => {
    await window.api?.openRecordingsFolder();
  }, []);

  const handlePlay = useCallback((rec: Recording) => {
    setPlaying({ url: rec.url, name: rec.name });
  }, []);

  const closePlayer = useCallback(() => {
    setPlaying(null);
  }, []);

  // --- Rendu du bouton principal d'enregistrement ---

  const renderRecordButton = () => {
    const isBusy = phase === 'recording' || phase === 'preparing';

    if (isBusy) {
      // Arrêt
      return (
        <button
          type="button"
          onClick={recorder.stop}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-xl shadow-rose-500/40 transition transform active:scale-90"
          title="Arrêter l'enregistrement"
        >
          <Square className="w-6 h-6" />
        </button>
      );
    }

    // Démarrage
    return (
      <button
        type="button"
        onClick={recorder.start}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-xl shadow-cyan-500/40 transition transform active:scale-90"
        title="Commencer l'enregistrement de la Vue Kiosque"
      >
        <Video className="w-7 h-7" />
      </button>
    );
  };

  // --- Rendu de la liste des enregistrements ---

  const renderRecordingsList = () => {
    if (isLoadingList) {
      return (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-500">
          <RefreshCw className="w-7 h-7 animate-spin text-cyan-400" />
          <span className="text-sm">Chargement des enregistrements…</span>
        </div>
      );
    }

    if (recordings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
          <Video className="w-12 h-12 opacity-20" />
          <p className="text-sm">Aucun enregistrement pour le moment.</p>
          <p className="text-xs text-slate-600">Cliquez sur l'icône 🎥 pour commencer.</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {recordings.map((rec) => (
          <div
            key={rec.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition"
          >
            {/* Miniature générée localement (.thumb.jpg) ou icône de repli */}
            <div className="w-20 h-14 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
              {rec.thumbnailUrl ? (
                <img src={rec.thumbnailUrl} alt="Miniature" className="w-full h-full object-cover" loading="lazy" />
              ) : rec.mime.startsWith('video') ? (
                <Video className="w-6 h-6 text-slate-500" />
              ) : (
                <Play className="w-6 h-6 text-slate-500" />
              ) }
            </div>

            {/* Infos du fichier */}
            <div className="flex-1 min-w-0">
              <div
                className="font-medium text-slate-200 truncate cursor-pointer hover:text-cyan-300"
                onClick={() => handlePlay(rec)}
                title="Lire"
              >
                {rec.name}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                {rec.durationMs && <span>{formatDuration(rec.durationMs)}</span>}
                {rec.durationMs && <span>•</span>}
                <span>{formatFileSize(rec.size)}</span>
                <span>•</span>
                <Clock className="w-3 h-3" />
                <span>{formatDate(rec.createdAt)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => handlePlay(rec)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                title="Lire"
              >
                <Play className="w-4 h-4" />
              </button>

              {SHARE_NETWORKS.map((network) => (
                <button
                  key={network}
                  type="button"
                  onClick={() => openShare(network, rec)}
                  className={`p-1.5 rounded-lg text-xs font-bold transition ${SHARE_NETWORK_COLORS[network]}`}
                  title={`Partager sur ${SHARE_NETWORK_LABELS[network]}`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              ))}

              <button
                type="button"
                onClick={() => handleSaveAs(rec)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition"
                title="Sauvegarder sous…"
              >
                <Download className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-slate-700/50 mx-0.5" />

              <button
                type="button"
                onClick={() => handleDelete(rec.name)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // --- Rendu principal ---

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* ─── En-tête ─── */}
      <div className="h-14 bg-slate-950 border-b border-slate-800 shadow-[0_4px_25px_rgba(0,0,0,0.5)] px-4 flex items-center justify-between gap-2 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <Video className="w-5 h-5 text-cyan-400" />
          <h1 className="text-lg font-black tracking-wider text-slate-100">Captures Audio/Vidéo</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenFolder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition text-xs font-bold"
            title="Ouvrir le dossier des enregistrements"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Dossier</span>
          </button>
          <button
            type="button"
            onClick={loadRecordings}
            disabled={isLoadingList}
            className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingList ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── Contenu ─── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Section d'enregistrement */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Enregistrement de la Vue Kiosque / Gameplay
          </h2>

          {/* Sélecteur de source (écran ou fenêtre) */}
          {recorder.sources.length > 0 && (
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-500">Source :</label>
              <select
                value={recorder.selectedSourceId ?? ''}
                onChange={(e) => handleSelectSource(e.target.value || null)}
                disabled={phase === 'recording' || phase === 'preparing'}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 disabled:opacity-50"
              >
                <option value="">Écran principal (défaut)</option>
                {recorder.sources.map((src) => (
                  <option key={src.id} value={src.id}>
                    {src.name}
                    {src.type === 'window' && ' (fenêtre)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Bouton d'enregistrement + timer */}
          <div className="flex items-center gap-5">
            {renderRecordButton()}

            {/* Indicateur d'état / timer */}
            <div className="flex items-center gap-2">
              {(phase === 'recording' || phase === 'preparing') && (
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    phase === 'recording' ? 'bg-rose-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
              )}
              <span className="text-sm text-slate-400 min-w-[140px]">
                {phase === 'idle' && recordedName
                  ? `Dernier : ${recordedName}`
                  : phase === 'preparing' && 'Connexion à la source…'}
                {phase === 'recording' && 'Enregistrement en cours'}
                {phase === 'preview' && 'Enregistrement terminé'}
                {phase === 'idle' && !recordedName && 'Prêt à enregistrer'}
              </span>

              {(phase === 'recording' || phase === 'preview') && elapsed > 0 && (
                <div className="flex items-center gap-1 text-slate-300">
                  <Timer className="w-4 h-4 text-rose-400" />
                  <span className="font-mono text-base text-rose-300">
                    {formatDuration(elapsed * 1000)}
                  </span>
                </div>
              )}

              {/* Bouton Annuler (visible pendant l'enregistrement ou la preparation) */}
              {(phase === 'recording' || phase === 'preparing') && (
                <button
                  type="button"
                  onClick={recorder.cancel}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-rose-400 hover:text-rose-200 hover:bg-rose-500/10 transition"
                  title="Annuler sans sauvegarder"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Annuler</span>
                </button>
              )}
            </div>
          </div>

          {/* Preview du dernier enregistrement (blob du hook) */}
          {phase === 'preview' && previewUrl && (
            <div className="pt-2">
              <div className="aspect-video rounded-xl overflow-hidden bg-black">
                <video
                  src={previewUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* Notification Save-As */}
        {saveAsStatus && (
          <div
            className={`p-3 rounded-xl flex items-center gap-2.5 text-sm ${
              saveAsStatus.ok
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveAsStatus.message}</span>
            <button
              type="button"
              onClick={() => setSaveAsStatus(null)}
              className="ml-auto text-xs underline"
            >
              ✕
            </button>
          </div>
        )}

        {/* Section de lecture d'un enregistrement existant */}
        {playing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative max-w-4xl max-h-[80vh] w-full mx-4">
              <button
                type="button"
                onClick={closePlayer}
                className="absolute -top-10 right-0 text-slate-400 hover:text-white"
                title="Fermer"
              >
                <XCircle className="w-6 h-6" />
              </button>
              <div className="aspect-video rounded-2xl overflow-hidden bg-black">
                <video
                  src={playing.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="mt-2 text-sm text-center text-slate-400 truncate">
                {playing.name}
              </p>
            </div>
          </div>
        )}

        {/* Liste des enregistrements */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Enregistrements ({recordings.length})
          </h2>
          {renderRecordingsList()}
        </div>
      </div>
    </div>
  );
};
