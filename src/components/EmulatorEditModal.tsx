import React, { useState } from 'react';
import { EmulatorProfile, System } from '../types';
import { X, Save, Trash2, Terminal } from 'lucide-react';

interface EmulatorEditModalProps {
  emulator: EmulatorProfile | null;
  systems: System[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEmulator: EmulatorProfile) => void;
  onDelete?: (emulatorId: string) => void;
}

export const EmulatorEditModal: React.FC<EmulatorEditModalProps> = ({
  emulator,
  systems,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen || !emulator) return null;

  const [formData, setFormData] = useState<EmulatorProfile>({
    ...emulator,
    supportedSystems: emulator.supportedSystems ? [...emulator.supportedSystems] : ['all'],
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-retro-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-retro-800/80 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-neon">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Éditeur de Profil d'Émulateur
              </h2>
              <span className="text-xs text-slate-400 block -mt-0.5">
                {formData.name} • {formData.category}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onDelete && (
              confirmDelete ? (
                <div className="flex items-center space-x-1.5 bg-rose-950/80 border border-rose-500/50 p-1 rounded-xl">
                  <span className="text-[11px] text-rose-300 font-semibold px-2">Supprimer ?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(formData.id);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow"
                  >
                    Confirmer
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition text-xs"
                  title="Supprimer cet émulateur"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-700/60 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Nom du Profil <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Catégorie <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as 'retroarch' | 'flatpak' | 'standalone',
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 transition cursor-pointer"
              >
                <option value="retroarch">RetroArch (Natif)</option>
                <option value="flatpak">Flatpak (Sandbox)</option>
                <option value="standalone">Autonome (Standalone)</option>
              </select>
            </div>
          </div>

          {/* Exécutables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Exécutable Linux
              </label>
              <input
                type="text"
                value={formData.executableLinux}
                onChange={(e) => setFormData({ ...formData, executableLinux: e.target.value })}
                placeholder="/usr/bin/retroarch ou duckstation-qt"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Exécutable Windows
              </label>
              <input
                type="text"
                value={formData.executableWindows}
                onChange={(e) => setFormData({ ...formData, executableWindows: e.target.value })}
                placeholder="C:\RetroArch\retroarch.exe"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          {/* Arguments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Arguments Linux
              </label>
              <input
                type="text"
                value={formData.argsTemplateLinux}
                onChange={(e) => setFormData({ ...formData, argsTemplateLinux: e.target.value })}
                placeholder='-L {corePath} "{rom}"'
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Arguments Windows
              </label>
              <input
                type="text"
                value={formData.argsTemplateWindows}
                onChange={(e) => setFormData({ ...formData, argsTemplateWindows: e.target.value })}
                placeholder='-L {corePath} "{rom}"'
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          {/* Systèmes supportés */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Consoles & Systèmes Supportés
              </label>
              <button
                type="button"
                onClick={() => {
                  const isAll = formData.supportedSystems.includes('all');
                  setFormData({
                    ...formData,
                    supportedSystems: isAll ? systems.map((s) => s.id) : ['all'],
                  });
                }}
                className="text-[10px] text-cyan-400 hover:underline font-semibold"
              >
                {formData.supportedSystems.includes('all') ? 'Spécifier par console' : 'Prendre en charge toutes les consoles'}
              </button>
            </div>

            {formData.supportedSystems.includes('all') ? (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                Cet émulateur est disponible comme lanceur universel pour <strong className="text-white">toutes les consoles</strong>.
              </div>
            ) : (
              <div className="max-h-36 overflow-y-auto p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {systems.map((s) => {
                  const checked = formData.supportedSystems.includes(s.id);
                  return (
                    <label key={s.id} className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const current = formData.supportedSystems.filter((id) => id !== 'all');
                          if (e.target.checked) {
                            setFormData({ ...formData, supportedSystems: [...current, s.id] });
                          } else {
                            setFormData({ ...formData, supportedSystems: current.filter((id) => id !== s.id) });
                          }
                        }}
                        className="rounded accent-cyan-400"
                      />
                      <span className="truncate">{s.shortName}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-500">
            Variables de substitution disponibles : <code className="text-cyan-400 font-mono">{"{rom}"}</code> (chemin de la ROM), <code className="text-cyan-400 font-mono">{"{corePath}"}</code> (chemin absolu du cœur), <code className="text-cyan-400 font-mono">{"{coreName}"}</code> (nom du cœur).
          </p>

          {/* Pied de page */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">ID: {formData.id}</span>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/25 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer le Profil</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
