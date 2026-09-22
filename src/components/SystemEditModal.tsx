import React, { useState } from 'react';
import { System, Company } from '../types';
import {
  X,
  Save,
  Trash2,
  Tv,
  Cpu,
  Landmark,
  Sparkles,
  Layers,
  Palette,
  Film,
  BookOpen,
  Gamepad2,
} from 'lucide-react';
import { ConsoleLogo } from './ConsoleLogo';

interface SystemEditModalProps {
  system: System | null;
  companies: Company[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSystem: System) => void;
  onDelete?: (systemId: string) => void;
}

type TabType = 'general' | 'specs' | 'museum' | 'emulation';

export const SystemEditModal: React.FC<SystemEditModalProps> = ({
  system,
  companies,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen || !system) return null;

  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [formData, setFormData] = useState<System>({
    ...system,
    specs: { ...system.specs },
    extensions: system.extensions ? [...system.extensions] : [],
    museum: system.museum
      ? {
          ...system.museum,
          innovations: system.museum.innovations ? [...system.museum.innovations] : [],
          anecdotes: system.museum.anecdotes ? [...system.museum.anecdotes] : [],
          iconicGames: system.museum.iconicGames ? [...system.museum.iconicGames] : [],
          hardwareHighlights: { ...(system.museum.hardwareHighlights || {}) },
        }
      : {
          tagline: '',
          history: '',
          innovations: [],
          anecdotes: [],
          iconicGames: [],
          hardwareHighlights: {},
        },
  });

  const [newInnovation, setNewInnovation] = useState('');
  const [newAnecdote, setNewAnecdote] = useState('');
  const [newIconicGame, setNewIconicGame] = useState('');
  const [newExtension, setNewExtension] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-retro-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-retro-800/80 shrink-0">
          <div className="flex items-center space-x-3">
            <div
              style={{
                backgroundColor: `${formData.themeColor}20`,
                borderColor: `${formData.themeColor}50`,
                color: formData.themeColor,
              }}
              className="w-10 h-10 rounded-2xl border flex items-center justify-center shadow-lg p-1.5"
            >
              <ConsoleLogo system={formData} className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Éditeur de Console & Exposition</span>
                <span
                  style={{
                    backgroundColor: `${formData.themeColor}25`,
                    borderColor: `${formData.themeColor}60`,
                    color: formData.themeColor,
                  }}
                  className="text-xs px-2 py-0.5 rounded-full border font-bold"
                >
                  {formData.shortName}
                </span>
              </h2>
              <span className="text-xs text-slate-400 block -mt-0.5">
                {formData.name} • {formData.manufacturer} ({formData.releaseYear})
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
                  title="Supprimer cette console"
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

        {/* Barre d'onglets */}
        <div className="flex items-center space-x-1 px-6 pt-3 pb-2 border-b border-slate-800 bg-slate-950/40 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'general'
                ? 'bg-slate-800 text-white shadow border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Général & Design</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'specs'
                ? 'bg-slate-800 text-white shadow border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Spécifications Techniques</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('museum')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'museum'
                ? 'bg-slate-800 text-amber-400 shadow border border-amber-500/40'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/50'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Musée, Histoire & Vidéo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('emulation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'emulation'
                ? 'bg-slate-800 text-cyan-400 shadow border border-cyan-500/40'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Émulation & Fichiers</span>
          </button>
        </div>

        {/* Formulaire de saisie */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Nom Complet de la Console <span className="text-rose-400">*</span>
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
                    Nom Court (Sigle) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-cyan-400 transition uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Firme / Constructeur <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => {
                      const comp = companies.find((c) => c.id === e.target.value);
                      setFormData({
                        ...formData,
                        companyId: e.target.value,
                        manufacturer: comp ? comp.name : formData.manufacturer,
                      });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 transition cursor-pointer"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.country})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Année de Lancement
                  </label>
                  <input
                    type="number"
                    value={formData.releaseYear}
                    onChange={(e) => setFormData({ ...formData, releaseYear: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Génération
                  </label>
                  <input
                    type="text"
                    value={formData.generation}
                    onChange={(e) => setFormData({ ...formData, generation: e.target.value })}
                    placeholder="ex: 4ème Génération (16-bit)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              {/* Couleur d'accentuation & Logo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                    <Palette className="w-4 h-4 text-cyan-400" />
                    <span>Couleur Néon / Thème</span>
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.themeColor}
                      onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.themeColor}
                      onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                    />
                    <div
                      style={{ backgroundColor: formData.themeColor }}
                      className="w-8 h-8 rounded-xl shadow-lg border border-white/20"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    URL du Logo Vectoriel / Image
                  </label>
                  <input
                    type="text"
                    value={formData.logoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://... ou chemin relatif"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: SPECS */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Microprocesseur (CPU)
                  </label>
                  <input
                    type="text"
                    value={formData.specs.cpu}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specs: { ...formData.specs, cpu: e.target.value },
                      })
                    }
                    placeholder="ex: Ricoh 5A22 @ 3.58 MHz"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Processeur Graphique / Audio
                  </label>
                  <input
                    type="text"
                    value={formData.specs.gpuOrAudio}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specs: { ...formData.specs, gpuOrAudio: e.target.value },
                      })
                    }
                    placeholder="ex: PPU 16-bit 32,768 couleurs, Sony SPC700"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Résolution d'Affichage
                  </label>
                  <input
                    type="text"
                    value={formData.specs.resolution}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specs: { ...formData.specs, resolution: e.target.value },
                      })
                    }
                    placeholder="ex: 256x224 à 512x448"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Support de Jeu (Média)
                  </label>
                  <input
                    type="text"
                    value={formData.specs.media}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specs: { ...formData.specs, media: e.target.value },
                      })
                    }
                    placeholder="ex: Cartouche ROM Mask 32 Mbit"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Ventes Mondiales
                  </label>
                  <input
                    type="text"
                    value={formData.specs.unitsSold || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specs: { ...formData.specs, unitsSold: e.target.value },
                      })
                    }
                    placeholder="ex: 49.10 Millions"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              {/* Détails hardware supplémentaires du musée */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Architecture & Puces Détaillées (Musée)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <input
                    type="text"
                    value={formData.museum?.hardwareHighlights?.ram || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        museum: {
                          ...formData.museum!,
                          hardwareHighlights: {
                            ...formData.museum?.hardwareHighlights,
                            ram: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="RAM (ex: 128 Ko Work RAM + 64 Ko VRAM)"
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                  <input
                    type="text"
                    value={formData.museum?.hardwareHighlights?.soundChip || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        museum: {
                          ...formData.museum!,
                          hardwareHighlights: {
                            ...formData.museum?.hardwareHighlights,
                            soundChip: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Puce Sonore (ex: Sony SPC700 8 canaux ADPCM)"
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: MUSEUM */}
          {activeTab === 'museum' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Phrase d'Accroche Muséale (Tagline)
                </label>
                <input
                  type="text"
                  value={formData.museum?.tagline || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      museum: { ...formData.museum!, tagline: e.target.value },
                    })
                  }
                  placeholder="ex: L'Âge d'or des 16-bit et la naissance de chefs-d'œuvre éternels"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Récit Historique de la Console
                </label>
                <textarea
                  rows={4}
                  value={formData.museum?.history || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      museum: { ...formData.museum!, history: e.target.value },
                    })
                  }
                  placeholder="L'histoire de la conception, le contexte concurrentiel et la sortie mondiale..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition leading-relaxed resize-y"
                />
              </div>

              {/* Vidéo YouTube & Rivalité */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Film className="w-3.5 h-3.5 text-rose-400" />
                    <span>ID ou URL Vidéo YouTube (Documentaire/Pub)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.museum?.youtubeId || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        museum: { ...formData.museum!, youtubeId: e.target.value },
                      })
                    }
                    placeholder="ex: dUjO7d4n2oM ou https://youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 transition font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Rivalité Historique Majeure
                  </label>
                  <input
                    type="text"
                    value={formData.museum?.rivalry || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        museum: { ...formData.museum!, rivalry: e.target.value },
                      })
                    }
                    placeholder="ex: La guerre mythique des 16-bit contre la Sega Mega Drive"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              {/* Innovations Majeures (Liste) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Innovations Majeures Introduites</span>
                </label>
                <div className="space-y-1.5">
                  {(formData.museum?.innovations || []).map((inn, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-300 flex-1">{inn}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(formData.museum?.innovations || [])];
                          updated.splice(idx, 1);
                          setFormData({ ...formData, museum: { ...formData.museum!, innovations: updated } });
                        }}
                        className="text-slate-500 hover:text-rose-400 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="text"
                      value={newInnovation}
                      onChange={(e) => setNewInnovation(e.target.value)}
                      placeholder="Ajouter une innovation (ex: Mode 7, bouton tranche L/R...)"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newInnovation.trim()) return;
                        setFormData({
                          ...formData,
                          museum: {
                            ...formData.museum!,
                            innovations: [...(formData.museum?.innovations || []), newInnovation.trim()],
                          },
                        });
                        setNewInnovation('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>

              {/* Secrets & Anecdotes (Liste) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Secrets de Fabrication & Anecdotes</span>
                </label>
                <div className="space-y-1.5">
                  {(formData.museum?.anecdotes || []).map((anec, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-300 flex-1">{anec}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(formData.museum?.anecdotes || [])];
                          updated.splice(idx, 1);
                          setFormData({ ...formData, museum: { ...formData.museum!, anecdotes: updated } });
                        }}
                        className="text-slate-500 hover:text-rose-400 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="text"
                      value={newAnecdote}
                      onChange={(e) => setNewAnecdote(e.target.value)}
                      placeholder="Ajouter une anecdote historique..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newAnecdote.trim()) return;
                        setFormData({
                          ...formData,
                          museum: {
                            ...formData.museum!,
                            anecdotes: [...(formData.museum?.anecdotes || []), newAnecdote.trim()],
                          },
                        });
                        setNewAnecdote('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 transition"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>

              {/* Jeux Emblématiques (Liste) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Jeux Emblématiques & Chefs-d'œuvre</span>
                </label>
                <div className="space-y-1.5">
                  {(formData.museum?.iconicGames || []).map((gameName, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-300 flex-1">{gameName}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(formData.museum?.iconicGames || [])];
                          updated.splice(idx, 1);
                          setFormData({ ...formData, museum: { ...formData.museum!, iconicGames: updated } });
                        }}
                        className="text-slate-500 hover:text-rose-400 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="text"
                      value={newIconicGame}
                      onChange={(e) => setNewIconicGame(e.target.value)}
                      placeholder="Ajouter un jeu culte (ex: Super Mario World, Chrono Trigger...)"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newIconicGame.trim()) return;
                        setFormData({
                          ...formData,
                          museum: {
                            ...formData.museum!,
                            iconicGames: [...(formData.museum?.iconicGames || []), newIconicGame.trim()],
                          },
                        });
                        setNewIconicGame('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 transition"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>

              {/* Note du Conservateur */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Note du Conservateur de l'Exposition
                </label>
                <textarea
                  rows={2}
                  value={formData.museum?.curatorNote || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      museum: { ...formData.museum!, curatorNote: e.target.value },
                    })
                  }
                  placeholder="L'avis éclairé et l'impact émotionnel de la machine..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition resize-y"
                />
              </div>
            </div>
          )}

          {/* TAB: EMULATION */}
          {activeTab === 'emulation' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Cœur Libretro Linux (RetroArch)
                  </label>
                  <input
                    type="text"
                    value={formData.defaultCoreLinux}
                    onChange={(e) => setFormData({ ...formData, defaultCoreLinux: e.target.value })}
                    placeholder="ex: snes9x_libretro.so"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Cœur Libretro Windows (RetroArch)
                  </label>
                  <input
                    type="text"
                    value={formData.defaultCoreWindows}
                    onChange={(e) => setFormData({ ...formData, defaultCoreWindows: e.target.value })}
                    placeholder="ex: snes9x_libretro.dll"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Sous-dossier ROMs
                  </label>
                  <input
                    type="text"
                    value={formData.subfolder}
                    onChange={(e) => setFormData({ ...formData, subfolder: e.target.value })}
                    placeholder="ex: snes"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Nom Libretro du Système
                  </label>
                  <input
                    type="text"
                    value={formData.libretroSystemName}
                    onChange={(e) => setFormData({ ...formData, libretroSystemName: e.target.value })}
                    placeholder="ex: Nintendo - Super Nintendo Entertainment System"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              {/* Extensions supportées */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Extensions de ROMs acceptées
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {formData.extensions.map((ext) => (
                    <span
                      key={ext}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center space-x-1.5"
                    >
                      <span>{ext}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            extensions: formData.extensions.filter((x) => x !== ext),
                          })
                        }
                        className="text-slate-400 hover:text-rose-400 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      value={newExtension}
                      onChange={(e) => setNewExtension(e.target.value)}
                      placeholder=".sfc, .zip..."
                      className="px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 w-28 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = newExtension.trim();
                        if (!trimmed) return;
                        const ext = trimmed.startsWith('.') ? trimmed : `.${trimmed}`;
                        if (!formData.extensions.includes(ext)) {
                          setFormData({ ...formData, extensions: [...formData.extensions, ext] });
                        }
                        setNewExtension('');
                      }}
                      className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pied de page du formulaire avec bouton Enregistrer */}
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
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/25 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer la Console</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
