import React, { useEffect, useState, useCallback } from 'react';
import { Smartphone, Play, Square, Copy, RefreshCw, QrCode, Signal } from 'lucide-react';

/**
 * Panneau Admin « Manette Smartphone » (onglet Testeur Manettes).
 *
 * Transforme n'importe quel téléphone du réseau local en manette tactile :
 * activation du serveur intégré, QR code à scanner, code PIN de secours,
 * suivi des connexions en direct. Les entrées sont relayées vers l'émulateur
 * web comme du clavier (mapping EmulatorJS par défaut).
 */

interface PhoneGamepadStatus {
  running: boolean;
  port: number;
  url: string;
  pin: string;
  connectedClients: number;
  qrDataUrl: string;
}

const DEFAULT_STATUS: PhoneGamepadStatus = {
  running: false,
  port: 0,
  url: '',
  pin: '',
  connectedClients: 0,
  qrDataUrl: '',
};

export const PhoneGamepadAdmin: React.FC = () => {
  const [status, setStatus] = useState<PhoneGamepadStatus>(DEFAULT_STATUS);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    if (!window.api?.phoneGamepadStatus) return;
    try {
      const s = (await window.api.phoneGamepadStatus()) as PhoneGamepadStatus;
      setStatus(s ?? DEFAULT_STATUS);
    } catch {
      /* mode web : API indisponible */
    }
  }, []);

  useEffect(() => {
    refresh();
    if (!window.api?.onPhoneGamepadClients) return;
    const unsub = window.api.onPhoneGamepadClients((count) => {
      setStatus((prev) => ({ ...prev, connectedClients: count }));
    });
    return unsub;
  }, [refresh]);

  const toggle = async () => {
    setBusy(true);
    try {
      if (status.running) {
        await window.api.phoneGamepadStop();
      } else {
        await window.api.phoneGamepadStart();
      }
      await refresh();
    } catch (err) {
      console.error('Manette smartphone :', err);
    } finally {
      setBusy(false);
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(status.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
        <div className="flex items-center gap-2.5">
          <Smartphone className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-slate-100">Manette Smartphone (Wi-Fi local)</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Transformez n'importe quel téléphone connecté au même réseau Wi-Fi en manette tactile :
          D-pad, A/B/X/Y, L/R, Select et Start. Rien à installer — le téléphone scanne le QR code
          (ou ouvre l'URL + code PIN) dans son navigateur, et joue.
        </p>
      </div>

      {/* Activation */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${
              status.running ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-slate-600'
            }`}
          />
          <div>
            <div className="text-sm font-bold text-slate-100">
              {status.running ? 'Serveur actif' : 'Serveur arrêté'}
            </div>
            <div className="text-[11px] text-slate-400">
              {status.running
                ? `${status.connectedClients} téléphone(s) connecté(s) · port ${status.port}`
                : 'Inactive pour le moment'}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={busy}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition active:scale-95 disabled:opacity-50 ${
            status.running
              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25'
              : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
          }`}
        >
          {status.running ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {status.running ? 'Arrêter' : 'Activer'}
        </button>
      </div>

      {/* Infos de connexion */}
      {status.running && (
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
          {/* URL + PIN */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Adresse à ouvrir sur le téléphone</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 min-w-0 truncate px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs text-cyan-300 font-mono">
                {status.url}
              </code>
              <button
                type="button"
                onClick={copyUrl}
                title="Copier l'adresse"
                className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700/80 transition shrink-0"
              >
                {copied ? <RefreshCw className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400">
                Code de secours :{' '}
                <code className="px-2 py-0.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-amber-300 font-mono font-bold tracking-widest">
                  {status.pin}
                </code>
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">à saisir dans le lien si le QR ne passe pas</span>
            </div>
          </div>

          {/* QR code */}
          <div className="flex items-center gap-4">
            {status.qrDataUrl ? (
              <img
                src={status.qrDataUrl}
                alt="QR code de connexion"
                className="w-28 h-28 rounded-xl bg-white p-1.5 shadow-lg"
              />
            ) : (
              <div className="w-28 h-28 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-center">
                <QrCode className="w-8 h-8 text-slate-600" />
              </div>
            )}
            <div className="text-xs text-slate-400 leading-relaxed">
              <div className="flex items-center gap-1.5 text-slate-200 font-semibold mb-1">
                <Signal className="w-3.5 h-3.5 text-emerald-400" />
                Connexion en 3 gestes
              </div>
              1. Le téléphone rejoint le <strong>même Wi-Fi</strong> que le PC.
              <br />
              2. Scanner le QR code avec l'appareil photo.
              <br />
              3. Le D-pad s'affiche — c'est parti !
            </div>
          </div>

          {/* Mapping */}
          <div className="pt-3 border-t border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Mapping (émulateur web)</div>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {[
                ['A', 'z'], ['B', 'x'], ['X', 'a'], ['Y', 's'],
                ['L', 'q'], ['R', 'e'], ['Select', 'v'], ['Start', 'Entrée'],
                ['D-Pad', 'Flèches'],
              ].map(([btn, key]) => (
                <span key={btn} className="px-2 py-0.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-300">
                  {btn} <span className="text-cyan-400 font-mono">→ {key}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
