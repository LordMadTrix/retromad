import React, { useState } from 'react';
import { Company, CompanyFigure } from '../types';
import {
  X,
  Save,
  Trash2,
  Landmark,
  Palette,
  Film,
  Users,
  Calendar,
  BookOpen,
  Plus,
  Layers,
} from 'lucide-react';

interface CompanyEditModalProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCompany: Company) => void;
  onDelete?: (companyId: string) => void;
}

type TabType = 'identity' | 'museum' | 'eras' | 'figures';

export const CompanyEditModal: React.FC<CompanyEditModalProps> = ({
  company,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen || !company) return null;

  const [activeTab, setActiveTab] = useState<TabType>('identity');
  const [formData, setFormData] = useState<Company>({
    ...company,
    famousFranchises: company.famousFranchises ? [...company.famousFranchises] : [],
    consoles: company.consoles ? [...company.consoles] : [],
    museum: company.museum
      ? {
          ...company.museum,
          eras: company.museum.eras ? [...company.museum.eras.map((e) => ({ ...e }))] : [],
          milestones: company.museum.milestones ? [...company.museum.milestones.map((m) => ({ ...m }))] : [],
          keyFigures: company.museum.keyFigures ? [...company.museum.keyFigures.map((f) => ({ ...f }))] : [],
          anecdotes: company.museum.anecdotes ? [...company.museum.anecdotes] : [],
        }
      : {
          tagline: '',
          curatorIntro: '',
          eras: [],
          milestones: [],
          keyFigures: [],
          philosophy: '',
          culturalImpact: '',
          anecdotes: [],
        },
  });

  const [newFranchise, setNewFranchise] = useState('');
  const [newAnecdote, setNewAnecdote] = useState('');
  const [newFigureName, setNewFigureName] = useState('');
  const [newFigureRole, setNewFigureRole] = useState('');
  const [newFigureContrib, setNewFigureContrib] = useState('');
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
                backgroundColor: `${formData.accentColor}25`,
                borderColor: `${formData.accentColor}50`,
                color: formData.accentColor,
              }}
              className="w-10 h-10 rounded-2xl border flex items-center justify-center shadow-lg"
            >
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Éditeur de Firme & Grand Musée</span>
                <span
                  style={{
                    backgroundColor: `${formData.accentColor}25`,
                    borderColor: `${formData.accentColor}60`,
                    color: formData.accentColor,
                  }}
                  className="text-xs px-2.5 py-0.5 rounded-full border font-bold"
                >
                  {formData.name}
                </span>
              </h2>
              <span className="text-xs text-slate-400 block -mt-0.5">
                {formData.country} • Fondée en {formData.founded}
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
                  title="Supprimer cette firme"
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
            onClick={() => setActiveTab('identity')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'identity'
                ? 'bg-slate-800 text-white shadow border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Identité & Vidéo TV</span>
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
            <span>Musée & Statistiques</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('eras')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'eras'
                ? 'bg-slate-800 text-cyan-400 shadow border border-cyan-500/40'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Grandes Époques & Jalons</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('figures')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'figures'
                ? 'bg-slate-800 text-purple-400 shadow border border-purple-500/40'
                : 'text-slate-400 hover:text-purple-300 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Fondateurs & Secrets</span>
          </button>
        </div>

        {/* Corps du Formulaire */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB: IDENTITY */}
          {activeTab === 'identity' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Nom de la Firme <span className="text-rose-400">*</span>
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
                    Pays d'Origine
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="ex: Japon 🇯🇵, États-Unis 🇺🇸"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Année de Fondation
                  </label>
                  <input
                    type="number"
                    value={formData.founded}
                    onChange={(e) => setFormData({ ...formData, founded: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Film className="w-3.5 h-3.5 text-rose-400" />
                    <span>ID ou URL Vidéo d'Ambiance Rétro TV (YouTube)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.youtubeId || formData.videoUrl || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        youtubeId: e.target.value,
                        videoUrl: e.target.value,
                      })
                    }
                    placeholder="ex: pFs05_3B7-Y ou lien YouTube"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 transition font-mono"
                  />
                </div>
              </div>

              {/* Couleur d'accentuation & Logo textuel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                    <Palette className="w-4 h-4 text-cyan-400" />
                    <span>Couleur Signature</span>
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                    />
                    <div
                      style={{ backgroundColor: formData.accentColor }}
                      className="w-8 h-8 rounded-xl shadow-lg border border-white/20"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Texte Typographique du Logo
                  </label>
                  <input
                    type="text"
                    value={formData.logoText}
                    onChange={(e) => setFormData({ ...formData, logoText: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Description globale */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Présentation Générale
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Présentation résumée de la marque et de son héritage..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition leading-relaxed resize-y"
                />
              </div>

              {/* Franchises Cultes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Franchises Légendaires
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {formData.famousFranchises.map((fr) => (
                    <span
                      key={fr}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center space-x-1.5"
                    >
                      <span>{fr}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            famousFranchises: formData.famousFranchises.filter((x) => x !== fr),
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
                      value={newFranchise}
                      onChange={(e) => setNewFranchise(e.target.value)}
                      placeholder="Ajouter franchise..."
                      className="px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 w-36"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = newFranchise.trim();
                        if (!trimmed) return;
                        if (!formData.famousFranchises.includes(trimmed)) {
                          setFormData({ ...formData, famousFranchises: [...formData.famousFranchises, trimmed] });
                        }
                        setNewFranchise('');
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

          {/* TAB: MUSEUM */}
          {activeTab === 'museum' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Devise / Slogan Muséal (Tagline)
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
                  placeholder="ex: L'Artisan séculaire devenu l'âme ludique du monde entier"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Introduction du Conservateur
                </label>
                <textarea
                  rows={3}
                  value={formData.museum?.curatorIntro || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      museum: { ...formData.museum!, curatorIntro: e.target.value },
                    })
                  }
                  placeholder="Récit d'ouverture sur l'épopée de la firme..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400 transition resize-y"
                />
              </div>

              {/* Chiffres Clés */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Total Consoles Vendues
                  </label>
                  <input
                    type="text"
                    value={formData.museum?.totalConsolesSoldEstimate || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        museum: { ...formData.museum!, totalConsolesSoldEstimate: e.target.value },
                      })
                    }
                    placeholder="ex: +850 Millions"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Console la Plus Vendue
                  </label>
                  <input
                    type="text"
                    value={formData.museum?.bestSellingConsole || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        museum: { ...formData.museum!, bestSellingConsole: e.target.value },
                      })
                    }
                    placeholder="ex: Nintendo DS (154M) ou PS2"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Jeu le Plus Vendu
                  </label>
                  <input
                    type="text"
                    value={formData.museum?.bestSellingGame || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        museum: { ...formData.museum!, bestSellingGame: e.target.value },
                      })
                    }
                    placeholder="ex: Wii Sports (82.9M)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              {/* Philosophie & Impact Culturel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Philosophie & Vision
                  </label>
                  <textarea
                    rows={3}
                    value={formData.museum?.philosophy || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        museum: { ...formData.museum!, philosophy: e.target.value },
                      })
                    }
                    placeholder="L'approche créative et visionnaire de la marque..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400 resize-y"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Impact Culturel Mondial
                  </label>
                  <textarea
                    rows={3}
                    value={formData.museum?.culturalImpact || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        museum: { ...formData.museum!, culturalImpact: e.target.value },
                      })
                    }
                    placeholder="Comment la marque a façonné la pop-culture et les générations..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400 resize-y"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: ERAS */}
          {activeTab === 'eras' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Calendar className="w-4 h-4" />
                <span>Grandes Époques Historiques de la Firme</span>
              </h3>

              <div className="space-y-3">
                {(formData.museum?.eras || []).map((eraItem, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 relative group">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...(formData.museum?.eras || [])];
                        updated.splice(idx, 1);
                        setFormData({ ...formData, museum: { ...formData.museum!, eras: updated } });
                      }}
                      className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 transition"
                      title="Supprimer cette époque"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={eraItem.era}
                        onChange={(e) => {
                          const updated = [...(formData.museum?.eras || [])];
                          updated[idx].era = e.target.value;
                          setFormData({ ...formData, museum: { ...formData.museum!, eras: updated } });
                        }}
                        placeholder="Identifiant ère (ex: 8-bit)"
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={eraItem.period}
                        onChange={(e) => {
                          const updated = [...(formData.museum?.eras || [])];
                          updated[idx].period = e.target.value;
                          setFormData({ ...formData, museum: { ...formData.museum!, eras: updated } });
                        }}
                        placeholder="Période (ex: 1983 - 1989)"
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={eraItem.title}
                        onChange={(e) => {
                          const updated = [...(formData.museum?.eras || [])];
                          updated[idx].title = e.target.value;
                          setFormData({ ...formData, museum: { ...formData.museum!, eras: updated } });
                        }}
                        placeholder="Titre de l'ère"
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-cyan-300"
                      />
                    </div>

                    <textarea
                      rows={2}
                      value={eraItem.description}
                      onChange={(e) => {
                        const updated = [...(formData.museum?.eras || [])];
                        updated[idx].description = e.target.value;
                        setFormData({ ...formData, museum: { ...formData.museum!, eras: updated } });
                      }}
                      placeholder="Récit de cette grande période..."
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 resize-y"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    const newEra = {
                      era: 'Nouvelle Ère',
                      period: 'Années',
                      title: 'Titre de la période',
                      description: 'Description historique...',
                    };
                    setFormData({
                      ...formData,
                      museum: {
                        ...formData.museum!,
                        eras: [...(formData.museum?.eras || []), newEra],
                      },
                    });
                  }}
                  className="w-full py-2.5 rounded-2xl bg-slate-950/80 border border-dashed border-cyan-500/40 text-cyan-300 text-xs font-bold hover:bg-cyan-500/10 transition flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une Grande Époque</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: FIGURES */}
          {activeTab === 'figures' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Users className="w-4 h-4" />
                <span>Pères Fondateurs, Créateurs & Figures Clés</span>
              </h3>

              <div className="space-y-3">
                {(formData.museum?.keyFigures || []).map((fig, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 relative">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...(formData.museum?.keyFigures || [])];
                        updated.splice(idx, 1);
                        setFormData({ ...formData, museum: { ...formData.museum!, keyFigures: updated } });
                      }}
                      className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 transition"
                      title="Supprimer cette figure"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={fig.name}
                        onChange={(e) => {
                          const updated = [...(formData.museum?.keyFigures || [])];
                          updated[idx].name = e.target.value;
                          setFormData({ ...formData, museum: { ...formData.museum!, keyFigures: updated } });
                        }}
                        placeholder="Nom complet"
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white"
                      />
                      <input
                        type="text"
                        value={fig.role}
                        onChange={(e) => {
                          const updated = [...(formData.museum?.keyFigures || [])];
                          updated[idx].role = e.target.value;
                          setFormData({ ...formData, museum: { ...formData.museum!, keyFigures: updated } });
                        }}
                        placeholder="Rôle / Fonction"
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-purple-300"
                      />
                    </div>

                    <input
                      type="text"
                      value={fig.contribution}
                      onChange={(e) => {
                        const updated = [...(formData.museum?.keyFigures || [])];
                        updated[idx].contribution = e.target.value;
                        setFormData({ ...formData, museum: { ...formData.museum!, keyFigures: updated } });
                      }}
                      placeholder="Contribution majeure à l'histoire du jeu vidéo..."
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300"
                    />
                  </div>
                ))}

                {/* Formulaire ajout figure */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-dashed border-purple-500/40 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newFigureName}
                      onChange={(e) => setNewFigureName(e.target.value)}
                      placeholder="Nom du créateur/fondateur..."
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={newFigureRole}
                      onChange={(e) => setNewFigureRole(e.target.value)}
                      placeholder="Rôle (ex: Concepteur du Game Boy)..."
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newFigureContrib}
                      onChange={(e) => setNewFigureContrib(e.target.value)}
                      placeholder="Contribution historique..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newFigureName.trim()) return;
                        const newFig: CompanyFigure = {
                          name: newFigureName.trim(),
                          role: newFigureRole.trim(),
                          contribution: newFigureContrib.trim(),
                        };
                        setFormData({
                          ...formData,
                          museum: {
                            ...formData.museum!,
                            keyFigures: [...(formData.museum?.keyFigures || []), newFig],
                          },
                        });
                        setNewFigureName('');
                        setNewFigureRole('');
                        setNewFigureContrib('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>

              {/* Secrets & Anecdotes */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Secrets & Anecdotes de la Firme</span>
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
                      placeholder="Ajouter un secret ou fait marquant..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-400"
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
                      className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold hover:bg-purple-500/30 transition"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-purple-500/25 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer la Firme</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
