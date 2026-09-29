import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Dialogue de confirmation générique pour les actions admin critiques.
 * S'affiche par-dessus tout en z-[200].
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: {
      icon: 'bg-rose-500/15 border-rose-500/40 text-rose-400',
      btn: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30',
    },
    warning: {
      icon: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
      btn: 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/30',
    },
    info: {
      icon: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400',
      btn: 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/30',
    },
  }[variant];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Fond semi-transparent */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Carte de confirmation */}
      <div className="relative z-10 w-full max-w-md bg-[#0d1220]/98 border border-slate-700/70 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-150">
        {/* Bouton fermer */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icône + titre */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-xl border ${colors.icon} shrink-0`}>
            {variant === 'danger' ? (
              <Trash2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-black text-white">{title}</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex items-center gap-2 justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg ${colors.btn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook utilitaire pour gérer l'état du dialogue de confirmation
export function useConfirmDialog() {
  const [state, setState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const confirm = (opts: {
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }) => {
    setState({ ...opts, isOpen: true });
  };

  const close = () => setState((s) => ({ ...s, isOpen: false }));

  return { confirmState: state, confirm, closeConfirm: close };
}
