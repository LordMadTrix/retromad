import React, { useState, useEffect } from 'react';
import { Company, System } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { ConsoleLogo } from './ConsoleLogo';
import { COMPANY_MUSEUM_DATA } from '../data/companyMuseumData';
import {
  X,
  Landmark,
  BookOpen,
  Tv,
  Gamepad2,
  Sparkles,
  Award,
  Calendar,
  MapPin,
  Flame,
  ChevronRight,
  ExternalLink,
  Users,
  Compass,
  Play,
  Volume2,
  VolumeX,
  CheckCircle2,
  Trophy,
  Pencil,
} from 'lucide-react';

interface CompanyExhibitionModalProps {
  company: Company | null;
  systems: System[];
  isOpen: boolean;
  onClose: () => void;
  onOpenSystemExhibition?: (system: System) => void;
  onExploreGames?: (systemId: string) => void;
  onEditCompany?: (company: Company) => void;
  isKioskMode?: boolean;
}

type CompanyMuseumTab = 'epic' | 'consoles' | 'franchises' | 'secrets' | 'video';

export const CompanyExhibitionModal: React.FC<CompanyExhibitionModalProps> = ({
  company,
  systems,
  isOpen,
  onClose,
  onOpenSystemExhibition,
  onExploreGames,
  onEditCompany,
  isKioskMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<CompanyMuseumTab>('epic');
  const [videoMuted, setVideoMuted] = useState(true);

  // Gestion des raccourcis clavier
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '1') {
        setActiveTab('epic');
      } else if (e.key === '2') {
        setActiveTab('consoles');
      } else if (e.key === '3') {
        setActiveTab('franchises');
      } else if (e.key === '4') {
        setActiveTab('secrets');
      } else if (e.key === '5') {
        setActiveTab('video');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !company) return null;

  // Données muséales spécifiques ou synthèse par défaut
  const museumData = COMPANY_MUSEUM_DATA[company.id] || {
    tagline: `Le patrimoine historique et l'héritage légendaire de ${company.name}.`,
    curatorIntro: company.description,
    eras: [
      {
        era: `${company.founded} - Présent`,
        period: "Épopée Industrielle & Divertissement",
        title: `L'histoire de ${company.name}`,
        description: company.description,
      },
    ],
    milestones: [
      { year: company.founded, title: `Fondation de ${company.name}`, description: `Établissement officiel de la société à ${company.country}.` },
    ],
    keyFigures: [
      { name: "Les Pionniers", role: "Concepteurs et Ingénieurs", contribution: `Ont façonné les architectures et logiciels emblématiques de ${company.name}.` },
    ],
    philosophy: "L'innovation au service du divertissement et de la passion vidéoludique.",
    culturalImpact: `Une empreinte indélébile sur plusieurs générations de joueurs à travers le monde avec ${company.famousFranchises.join(', ')}.`,
    anecdotes: [
      `La firme a été fondée en ${company.founded} et a marqué son époque avec ses franchises mythiques.`,
      `Ses consoles et systèmes d'arcade continuent d'être célébrés par la communauté du rétrogaming.`,
    ],
    totalConsolesSoldEstimate: "Plusieurs dizaines de millions d'exemplaires dans le monde",
    bestSellingConsole: systems[0]?.name || "Système emblématique",
    bestSellingGame: company.famousFranchises[0] || "Titre culte",
    youtubeId: company.youtubeId,
  };

  const accentColor = company.accentColor || '#00f2fe';
  const youtubeVideoId = museumData.youtubeId || company.youtubeId || 'in4X7qOUxEg';

  return (
    <div
      onClick={onClose}
      className="retromad-modal-overlay"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="retromad-modal-card max-w-5xl max-h-[92vh]"
      >
        {/* BANNIÈRE SUPÉRIEURE DU MUSÉE DE LA FIRME */}
        <div
          style={{
            background: `linear-gradient(135deg, ${accentColor}25 0%, rgba(15, 23, 42, 0.95) 100%)`,
            borderColor: `${accentColor}44`,
          }}
          className="p-5 sm:p-6 border-b flex flex-wrap items-center justify-between gap-4 shrink-0"
        >
          {/* Identité Muséale */}
          <div className="flex items-center space-x-4 min-w-0">
            <div
              style={{
                backgroundColor: `${accentColor}20`,
                borderColor: `${accentColor}60`,
              }}
              className="w-14 h-14 rounded-2xl border flex items-center justify-center text-white shadow-neon shrink-0 p-2"
            >
              <Landmark className="w-8 h-8" style={{ color: accentColor }} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span
                  style={{ backgroundColor: `${accentColor}25`, color: accentColor, borderColor: `${accentColor}50` }}
                  className="px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest"
                >
                  MUSÉE DES GRANDES FIRMES HISTORIQUES
                </span>
                <span className="text-slate-500 font-bold">•</span>
                <span className="text-xs text-slate-300 flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{company.country}</span>
                </span>
                <span className="text-slate-500 font-bold">•</span>
                <span className="text-xs text-slate-300 flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Fondée en {company.founded}</span>
                </span>
              </div>

              <div className="flex items-center space-x-3 mt-1.5">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase truncate">
                  {company.name}
                </h2>
                <div className="h-8 max-w-[140px] shrink-0 hidden sm:flex items-center">
                  <CompanyLogo companyId={company.id} size="sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Actions Droite (Fermer) */}
          <div className="flex items-center space-x-2">
            {!isKioskMode && onEditCompany && (
              <button
                type="button"
                onClick={() => onEditCompany(company)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-bold text-purple-300 transition shadow"
                title="Éditer la firme, son musée, ses grandes époques et ses fondateurs"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Modifier la Firme</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="retromad-modal-close-btn"
              title="Fermer le musée (Échap)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BARRE D'ONGLETS DU MUSÉE DE LA FIRME */}
        <div className="px-6 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('epic')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              activeTab === 'epic'
                ? 'bg-retro-accent text-slate-950 shadow-neon'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Épopée & Histoire</span>
          </button>

          <button
            onClick={() => setActiveTab('consoles')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              activeTab === 'consoles'
                ? 'bg-retro-accent text-slate-950 shadow-neon'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>2. Pavillon des Machines ({systems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('franchises')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              activeTab === 'franchises'
                ? 'bg-retro-accent text-slate-950 shadow-neon'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>3. Franchises & Mascottes</span>
          </button>

          <button
            onClick={() => setActiveTab('secrets')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              activeTab === 'secrets'
                ? 'bg-retro-accent text-slate-950 shadow-neon'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>4. Secrets & Chiffres</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              activeTab === 'video'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Play className="w-4 h-4 text-red-400 fill-red-400" />
            <span>5. Archives Vidéo</span>
          </button>
        </div>

        {/* CONTENU PRINCIPAL DE L'EXPOSITION */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Phrase d'accroche muséale */}
          <div
            style={{
              borderColor: `${accentColor}40`,
              background: `linear-gradient(to right, ${accentColor}15, transparent)`,
            }}
            className="p-4 rounded-2xl border flex items-start space-x-3"
          >
            <Compass className="w-5 h-5 shrink-0 mt-0.5" style={{ color: accentColor }} />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-0.5">
                Devise & Vision Muséale
              </span>
              <p className="text-sm font-semibold text-slate-200 italic">
                « {museumData.tagline} »
              </p>
            </div>
          </div>

          {/* ONGLET 1 : ÉPOPÉE & HISTOIRE */}
          {activeTab === 'epic' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Introduction du Conservateur */}
              <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-2xl shadow">
                <div className="flex items-center space-x-2 mb-3">
                  <Landmark className="w-4 h-4" style={{ color: accentColor }} />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Note du Conservateur du Patrimoine
                  </h3>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {museumData.curatorIntro}
                </p>
              </div>

              {/* Les Grandes Époques Chronologiques */}
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-retro-accent" />
                  <span>Les Grandes Époques de la Firme</span>
                </h3>

                <div className="space-y-4">
                  {museumData.eras.map((era, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span
                          style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
                          className="px-3 py-1 rounded-lg text-xs font-black font-mono tracking-wider"
                        >
                          {era.era}
                        </span>
                        <span className="text-xs text-slate-400 font-medium italic">
                          {era.period}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1.5">{era.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{era.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Frise des Grandes Dates Clés */}
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Chronologie & Tournants Historiques</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {museumData.milestones.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start space-x-3"
                    >
                      <span className="px-2 py-1 rounded-md bg-retro-800 text-retro-accent font-mono font-bold text-xs shrink-0">
                        {m.year}
                      </span>
                      <div>
                        <h5 className="text-xs font-bold text-white mb-0.5">{m.title}</h5>
                        <p className="text-[11px] text-slate-400 leading-snug">{m.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pères Fondateurs & Figures Mythiques */}
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Figures Clés & Esprits Visionnaires</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {museumData.keyFigures.map((fig, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-black text-white">{fig.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-800">
                          {fig.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mt-2">{fig.contribution}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 2 : PAVILLON DES MACHINES DE LA FIRME */}
          {activeTab === 'consoles' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center space-x-2">
                    <Tv className="w-4 h-4" style={{ color: accentColor }} />
                    <span>Toutes les Machines Conçues par {company.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Sélectionnez une console pour ouvrir son exposition muséale individuelle ou explorer ses jeux.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  {systems.length} machines dans l'émulateur
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {systems.map((sys) => (
                  <div
                    key={sys.id}
                    className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-600 transition flex flex-col justify-between group shadow"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          style={{
                            backgroundColor: `${sys.themeColor}22`,
                            color: sys.themeColor,
                            borderColor: `${sys.themeColor}44`,
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border font-mono"
                        >
                          {sys.releaseYear} • {sys.generation}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {sys.specs.unitsSold || ''}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 my-3">
                        <ConsoleLogo system={sys} size="sm" />
                        <div>
                          <h4 className="text-sm font-black text-white group-hover:text-retro-accent transition">
                            {sys.name}
                          </h4>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {sys.specs.cpu}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {onOpenSystemExhibition && (
                        <button
                          onClick={() => onOpenSystemExhibition(sys)}
                          className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition shadow"
                        >
                          <Landmark className="w-3.5 h-3.5" />
                          <span>Exposition de la Machine</span>
                        </button>
                      )}

                      {onExploreGames && (
                        <button
                          onClick={() => onExploreGames(sys.id)}
                          className="w-full flex items-center justify-center space-x-1 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                        >
                          <span>Voir les jeux</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ONGLET 3 : FRANCHISES & MASCOTTES CULTES */}
          {activeTab === 'franchises' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center space-x-2 mb-2">
                  <Gamepad2 className="w-4 h-4 text-retro-pink" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                    L'Empreinte Culturelle Mondiale
                  </h3>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {museumData.culturalImpact}
                </p>
              </div>

              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Franchises Mythiques Nées chez {company.name}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(museumData.franchiseHistories || company.famousFranchises.map((f, i) => ({
                    name: f,
                    year: company.founded + 5 + i * 3,
                    description: `Franchise culte et emblématique ayant défini le catalogue de ${company.name} à travers plusieurs générations.`,
                  }))).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black text-white flex items-center space-x-2">
                          <Flame className="w-4 h-4 text-retro-accent" />
                          <span>{item.name}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400">
                          Depuis {item.year}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Philosophie de conception */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-1">
                  Philosophie Créative de la Firme
                </span>
                <p className="text-sm font-medium text-slate-200 italic">
                  {museumData.philosophy}
                </p>
              </div>
            </div>
          )}

          {/* ONGLET 4 : SECRETS & CHIFFRES CLÉS */}
          {activeTab === 'secrets' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Chiffres Clés */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    Parc de Consoles Écoulées
                  </span>
                  <span className="text-lg font-black text-retro-accent block">
                    {museumData.totalConsolesSoldEstimate || "Des millions d'unités"}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    Machine la Plus Vendue
                  </span>
                  <span className="text-base font-black text-white block">
                    {museumData.bestSellingConsole || "Machine phare"}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    Jeu / Franchise Phare
                  </span>
                  <span className="text-base font-black text-emerald-400 block">
                    {museumData.bestSellingGame || company.famousFranchises[0]}
                  </span>
                </div>
              </div>

              {/* Anecdotes & Secrets Inédits */}
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-retro-accent" />
                  <span>Secrets de Fabrication & Anecdotes Historiques</span>
                </h3>

                <div className="space-y-3">
                  {museumData.anecdotes.map((anecdote, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-retro-pink shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-200 leading-relaxed">{anecdote}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 5 : ARCHIVES VIDÉO & DOCUMENTAIRE */}
          {activeTab === 'video' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center space-x-2">
                    <Play className="w-4 h-4 text-red-500 fill-red-500" />
                    <span>Salle de Projection & Archives Historiques</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Documentaire, spots publicitaires de lancement et archives d'époque de {company.name}.
                  </p>
                </div>

                <a
                  href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-950/50 hover:bg-red-900 border border-red-500/40 text-red-300 hover:text-white text-xs font-bold transition shadow"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ouvrir sur YouTube</span>
                </a>
              </div>

              {/* Écran Rétro Cinéma 16:9 YouTube */}
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border-2 border-slate-700 shadow-2xl">
                <iframe
                  title={`Archive Vidéo ${company.name}`}
                  src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&mute=${videoMuted ? 1 : 0}&loop=1&playlist=${youtubeVideoId}&rel=0&modestbranding=1`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />

                {/* Contrôleur Son Flottant */}
                <button
                  onClick={() => setVideoMuted(!videoMuted)}
                  className="absolute bottom-4 right-4 z-20 p-2.5 rounded-full bg-black/80 hover:bg-black text-white backdrop-blur-md border border-white/20 transition shadow-lg flex items-center space-x-2 text-xs font-bold"
                >
                  {videoMuted ? (
                    <>
                      <VolumeX className="w-4 h-4 text-amber-400" />
                      <span>Activer le Son</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      <span>Son Activé</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PIED DE PAGE MUSÉAL */}
        <div className="p-4 px-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
                1-5
              </kbd>
              <span>Changer d'onglet</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
                Échap
              </kbd>
              <span>Fermer</span>
            </span>
          </div>

          <span className="text-[11px] text-slate-500 font-medium">
            RetroMad • Conservatoire Numérique des Grandes Firmes du Rétrogaming
          </span>
        </div>
      </div>
    </div>
  );
};
