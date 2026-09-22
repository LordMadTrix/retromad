import React, { useState } from 'react';
import { Game, System, EmulatorProfile } from '../types';
import {
  X,
  Save,
  Trash2,
  Image,
  Tag,
  Star,
  Award,
  Gamepad2,
  Plus,
} from 'lucide-react';
import { ConsoleLogo } from './ConsoleLogo';
import { resolveMediaUrl } from '../utils/media';

interface GameEditModalProps {
  game: Game | null;
  systems: System[];
  emulators?: EmulatorProfile[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedGame: Game) => void;
  onDelete?: (gameId: string) => void;
}

export const GameEditModal: React.FC<GameEditModalProps> = ({
  game,
  systems,
  emulators: _emulators = [],
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen || !game) return null;

  const [formData, setFormData] = useState<Game>({
    ...game,
    metadata: {
      ...game.metadata,
      genres: game.metadata?.genres ? [...game.metadata.genres] : [],
    },
    media: {
      ...game.media,
    },
  });

  const [newGenreInput, setNewGenreInput] = useState('');
  const [activeMediaTab, setActiveMediaTab] = useState<'boxart2d' | 'snap' | 'boxart3d' | 'titleScreen'>('boxart2d');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const selectedSystem = systems.find((s) => s.id === formData.systemId);

  const handleAddGenre = () => {
    const trimmed = newGenreInput.trim();
    if (!trimmed) return;
    const current = formData.metadata.genres || [];
    if (!current.includes(trimmed)) {
      setFormData({
        ...formData,
        metadata: {
          ...formData.metadata,
          genres: [...current, trimmed],
        },
      });
    }
    setNewGenreInput('');
  };

  const handleRemoveGenre = (genreToRemove: string) => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        genres: (formData.metadata.genres || []).filter((g) => g !== genreToRemove),
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const currentPreviewUrl = resolveMediaUrl(formData.media[activeMediaTab]) || formData.media[activeMediaTab];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-retro-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-retro-800/80 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-neon">
              {selectedSystem ? (
                <ConsoleLogo system={selectedSystem} className="w-6 h-6 object-contain" />
              ) : (
                <Gamepad2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Éditeur de Jeu</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {selectedSystem?.name || 'Mode Administrateur'}
                </span>
              </h2>
              <span className="text-xs text-slate-400 block -mt-0.5 truncate max-w-md">
                {formData.cleanTitle || formData.title}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onDelete && (
              confirmDelete ? (
                <div className="flex items-center space-x-1.5 bg-rose-950/80 border border-rose-500/50 p-1 rounded-xl">
                  <span className="text-[11px] text-rose-300 font-semibold px-2">Confirmer ?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(formData.id);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow"
                  >
                    Oui, Supprimer
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
                  className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition text-xs font-medium flex items-center space-x-1"
                  title="Supprimer ce jeu"
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

        {/* Formulaire de modification */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Grille principale */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Colonne Gauche : Aperçu & URLs Médias */}
            <div className="md:col-span-4 flex flex-col space-y-4">
              <div className="relative aspect-[3/4] w-full rounded-2xl bg-black/60 border border-slate-800 flex items-center justify-center overflow-hidden shadow-inner p-2 group">
                {currentPreviewUrl ? (
                  <img
                    src={currentPreviewUrl}
                    alt={formData.cleanTitle}
                    className="w-full h-full object-contain drop-shadow-xl"
                  />
                ) : (
                  <div className="text-center p-4 text-slate-500">
                    <Image className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
                    <p className="text-xs">Aucun média renseigné</p>
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] text-slate-300 font-mono uppercase">
                  {activeMediaTab}
                </div>
              </div>

              {/* Onglets médias pour aperçu */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('boxart2d')}
                  className={`py-1.5 px-2 rounded-lg font-bold transition text-center ${
                    activeMediaTab === 'boxart2d' ? 'bg-cyan-500 text-black shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Jaquette 2D
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('snap')}
                  className={`py-1.5 px-2 rounded-lg font-bold transition text-center ${
                    activeMediaTab === 'snap' ? 'bg-cyan-500 text-black shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Capture (Snap)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('boxart3d')}
                  className={`py-1.5 px-2 rounded-lg font-bold transition text-center ${
                    activeMediaTab === 'boxart3d' ? 'bg-cyan-500 text-black shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Boîte 3D
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('titleScreen')}
                  className={`py-1.5 px-2 rounded-lg font-bold transition text-center ${
                    activeMediaTab === 'titleScreen' ? 'bg-cyan-500 text-black shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Titre Écran
                </button>
              </div>

              {/* URL du média sélectionné */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  URL Média ({activeMediaTab})
                </label>
                <input
                  type="text"
                  value={formData.media[activeMediaTab] || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      media: {
                        ...formData.media,
                        [activeMediaTab]: e.target.value,
                      },
                    })
                  }
                  placeholder="https://... ou chemin local"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition font-mono"
                />
              </div>

              {/* Statut favori */}
              <div className="pt-2">
                <label className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={formData.favorite}
                    onChange={(e) => setFormData({ ...formData, favorite: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 focus:ring-offset-0 bg-slate-900 border-slate-700"
                  />
                  <div className="flex items-center space-x-1.5">
                    <Star className={`w-4 h-4 ${formData.favorite ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold text-slate-200">Ajouter aux Favoris</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Colonne Droite : Données & Métadonnées */}
            <div className="md:col-span-8 space-y-4">
              {/* Titre & Système */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Titre Principal (Propre) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cleanTitle}
                    onChange={(e) => setFormData({ ...formData, cleanTitle: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Console / Système <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.systemId}
                    onChange={(e) => setFormData({ ...formData, systemId: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 transition cursor-pointer"
                  >
                    {systems.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.manufacturer})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Titre brut & Nom de fichier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Titre Original (avec région)
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Fichier ROM
                  </label>
                  <input
                    type="text"
                    value={formData.filename}
                    onChange={(e) => setFormData({ ...formData, filename: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 font-mono focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              {/* Synopsis / Résumé */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Synopsis / Récit de l'aventure</span>
                  <span className="text-[10px] text-slate-500 font-normal">Visible sur la fiche du jeu</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.metadata.synopsis || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, synopsis: e.target.value },
                    })
                  }
                  placeholder="Racontez l'histoire, les mécaniques de jeu et l'ambiance du titre..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition leading-relaxed resize-y"
                />
              </div>

              {/* Détails : Développeur, Éditeur, Année, Joueurs, Note */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Développeur
                  </label>
                  <input
                    type="text"
                    value={formData.metadata.developer || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metadata: { ...formData.metadata, developer: e.target.value },
                      })
                    }
                    placeholder="ex: Nintendo EAD"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Éditeur
                  </label>
                  <input
                    type="text"
                    value={formData.metadata.publisher || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metadata: { ...formData.metadata, publisher: e.target.value },
                      })
                    }
                    placeholder="ex: Capcom"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Date / Année
                  </label>
                  <input
                    type="text"
                    value={formData.metadata.releaseDate || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metadata: { ...formData.metadata, releaseDate: e.target.value },
                      })
                    }
                    placeholder="ex: 1991"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Joueurs
                  </label>
                  <input
                    type="text"
                    value={formData.metadata.players || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metadata: { ...formData.metadata, players: e.target.value },
                      })
                    }
                    placeholder="ex: 1-2 Joueurs"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              {/* Note (0-100) avec jauge */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Note Critique</span>
                    <span className="text-[10px] text-slate-500">Score de 0 à 100</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 flex-1 max-w-xs">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.metadata.rating ?? 85}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metadata: { ...formData.metadata, rating: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <span className="text-sm font-black font-mono text-cyan-300 w-9 text-right">
                    {formData.metadata.rating ?? 85}%
                  </span>
                </div>
              </div>

              {/* Genres & Tags */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Genres & Catégories</span>
                </label>

                <div className="flex flex-wrap gap-2 items-center">
                  {(formData.metadata.genres || []).map((genre) => (
                    <span
                      key={genre}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 flex items-center space-x-1.5 shadow-sm"
                    >
                      <span>{genre}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveGenre(genre)}
                        className="text-slate-400 hover:text-rose-400 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      value={newGenreInput}
                      onChange={(e) => setNewGenreInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddGenre();
                        }
                      }}
                      placeholder="Ajouter genre..."
                      className="px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition w-32"
                    />
                    <button
                      type="button"
                      onClick={handleAddGenre}
                      className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pied de page du formulaire avec bouton Enregistrer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              ID: {formData.id}
            </span>

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
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/25 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer les Modifications</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
