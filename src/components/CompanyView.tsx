import React, { useState } from 'react';
import { Company, System } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { ConsoleLogo } from './ConsoleLogo';
import { CompanyBackgroundVideo, CompanyTvWidget } from './CompanyBackgroundVideo';
import { Landmark, Calendar, MapPin, ChevronRight, Cpu, Tv, HardDrive, Sparkles, Pencil } from 'lucide-react';

const CompanyExhibitionModal = React.lazy(() => import('./CompanyExhibitionModal').then((m) => ({ default: m.CompanyExhibitionModal })));

interface CompanyViewProps {
  companies: Company[];
  systems: System[];
  onSelectSystemFilter: (systemId: string) => void;
  onOpenExhibition?: (system: System) => void;
  onOpenCompanyExhibition?: (company: Company) => void;
  onEditCompany?: (company: Company) => void;
  isKioskMode?: boolean;
}

export const CompanyView: React.FC<CompanyViewProps> = ({
  companies,
  systems,
  onSelectSystemFilter,
  onOpenExhibition,
  onOpenCompanyExhibition,
  onEditCompany,
  isKioskMode = false,
}) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companies[0]?.id || 'nintendo');
  const [isFirmMuseumOpen, setIsFirmMuseumOpen] = useState(false);

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0];

  const companySystems = systems.filter((s) => s.companyId === selectedCompanyId);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-retro-900/40">
      {/* Sélecteur horizontal des Firmes avec VRAIS LOGOS et VIDÉOS en fond */}
      <div className="h-28 border-b border-cyan-300/20 px-6 py-4 flex items-center space-x-4 bg-retro-900/70 overflow-x-auto no-scrollbar shrink-0">
        {companies.map((company) => {
          const isSelected = company.id === selectedCompanyId;
          return (
            <button
              key={company.id}
              onClick={() => setSelectedCompanyId(company.id)}
              style={{
                borderColor: isSelected ? company.accentColor : undefined,
              }}
              className={`group relative company-selector-button flex items-center justify-center px-5 py-3 min-w-[150px] rounded-2xl shrink-0 transition-all overflow-hidden ${
                isSelected
                ? 'company-selector-active bg-slate-800/95 border-2 shadow-neon scale-[1.02]'
                : 'bg-retro-800/70 hover:bg-slate-700 border border-slate-600 hover:scale-102 opacity-80 hover:opacity-100'
              }`}
            >
              {/* Vidéo de fond miniature dans l'encadré */}
              <CompanyBackgroundVideo company={company} mode="mini" />
              <div className="relative z-10 flex items-center justify-center">
                <CompanyLogo companyId={company.id} size="sm" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Contenu principal de la firme sélectionnée */}
      <div className="flex-1 overflow-y-auto">
        <div key={selectedCompanyId} className="company-content-enter p-8 space-y-8">
        {/* Bannière Présentation de la Firme avec Vidéo en Fond et Widget TV */}
        <div
          style={{
            borderColor: `${selectedCompany.accentColor}55`,
          }}
          className="relative rounded-3xl p-6 sm:p-8 border shadow-2xl overflow-hidden min-h-[280px]"
        >
          {/* Vidéo en fond de l'encadré de la firme avec contrôles interactifs */}
          <CompanyBackgroundVideo company={selectedCompany} mode="banner" />

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span
                  style={{ backgroundColor: selectedCompany.accentColor }}
                  className="px-3 py-0.5 rounded-md text-[11px] font-black text-white uppercase tracking-widest shadow"
                >
                  FIRME HISTORIQUE
                </span>
                <span className="text-slate-300 text-xs flex items-center space-x-1 drop-shadow">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedCompany.country}</span>
                </span>
                <span className="text-slate-300 text-xs flex items-center space-x-1 drop-shadow">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Fondée en {selectedCompany.founded}</span>
                </span>
              </div>

              <div className="company-logo-reveal my-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                <CompanyLogo companyId={selectedCompany.id} size="xl" />
              </div>

              <p className="text-sm text-slate-200 max-w-2xl mt-3 leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-medium">
                {selectedCompany.description}
              </p>

              <div className="mt-4">
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-2 drop-shadow">
                  Franchises Légendaires
                </span>
                <div className="flex flex-wrap gap-1.5 max-w-lg">
                  {selectedCompany.famousFranchises.map((franchise, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-black/75 border border-slate-700/80 text-xs font-semibold text-white shadow"
                    >
                      {franchise}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bouton d'accès au Grand Musée de la Firme */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    if (onOpenCompanyExhibition) {
                      onOpenCompanyExhibition(selectedCompany);
                    } else {
                      setIsFirmMuseumOpen(true);
                    }
                  }}
                  style={{
                    backgroundColor: selectedCompany.accentColor,
                    boxShadow: `0 0 25px ${selectedCompany.accentColor}77`,
                  }}
                  className="px-5 py-2.5 rounded-2xl text-white font-black text-xs tracking-wider uppercase flex items-center space-x-2.5 hover:scale-105 active:scale-95 transition shadow-2xl border border-white/30 bg-white/5 group"
                >
                  <Landmark className="w-4 h-4 text-white group-hover:rotate-6 transition-transform" />
                  <span>Musée Virtuel de {selectedCompany.name}</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                </button>

                {!isKioskMode && onEditCompany && (
                  <button
                    onClick={() => onEditCompany(selectedCompany)}
                    className="px-4 py-2.5 rounded-2xl bg-black/60 hover:bg-black/75 text-slate-200 hover:text-white border border-slate-700/80 hover:border-slate-500 text-xs font-bold transition flex items-center space-x-2 shadow"
                    title={`Éditer les données, le musée et les vidéos de ${selectedCompany.name}`}
                  >
                    <Pencil className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Modifier la Firme</span>
                  </button>
                )}

                <span className="text-[11px] text-slate-300 font-medium drop-shadow hidden sm:inline-block">
                  Épopée historique • Chronologie • Pères fondateurs • Archives vidéo
                </span>
              </div>
            </div>

            {/* Écran Rétro TV Dédié YouTube intégré directement dans l'encadré */}
            <div className="shrink-0 w-full xl:w-88 max-w-md self-center xl:self-auto">
              <CompanyTvWidget company={selectedCompany} />
            </div>
          </div>
        </div>

        {/* Chronologie des Consoles de la firme */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Landmark className="w-5 h-5 text-retro-accent" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Consoles & Systèmes de {selectedCompany.name}
            </h2>
            <span className="text-xs text-slate-400">({companySystems.length} machines répertoriées)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companySystems.map((sys, index) => (
              <div
                key={sys.id}
                style={{ animationDelay: `${index * 65}ms` }}
                className="company-console-card rounded-2xl bg-retro-800/80 border border-slate-800/90 hover:border-slate-600 hover:-translate-y-1 transition-all p-5 flex flex-col justify-between shadow-md group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      style={{
                        backgroundColor: `${sys.themeColor}22`,
                        color: sys.themeColor,
                        borderColor: `${sys.themeColor}55`,
                      }}
                      className="px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider border"
                    >
                      {sys.releaseYear} • {sys.generation}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {sys.specs.unitsSold ? `${sys.specs.unitsSold}` : ''}
                    </span>
                  </div>

                  <div className="console-identity flex items-center space-x-3 mb-2">
                    <ConsoleLogo system={sys} size="sm" />
                    <h3 className="text-base font-black text-white group-hover:text-retro-accent transition">
                      {sys.name}
                    </h3>
                  </div>

                  {/* Spécifications techniques */}
                  <div className="mt-4 space-y-2 text-xs text-slate-300">
                    <div className="flex items-start space-x-2 bg-slate-900/50 p-2 rounded-xl">
                      <Cpu className="w-4 h-4 text-retro-accent shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">CPU</span>
                        <span className="text-[11px] text-slate-300">{sys.specs.cpu}</span>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2 bg-slate-900/50 p-2 rounded-xl">
                      <Tv className="w-4 h-4 text-retro-pink shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Graphismes & Résolution</span>
                        <span className="text-[11px] text-slate-300">{sys.specs.resolution}</span>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2 bg-slate-900/50 p-2 rounded-xl">
                      <HardDrive className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Support & Média</span>
                        <span className="text-[11px] text-slate-300">{sys.specs.media}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action console */}
                <div className="mt-5 space-y-2">
                  <button
                    onClick={() => onSelectSystemFilter(sys.id)}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-700/60 hover:bg-retro-accent hover:text-retro-900 text-slate-200 text-xs font-bold transition shadow"
                  >
                    <span>Explorer les jeux {sys.shortName}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {onOpenExhibition && (
                    <button
                      onClick={() => onOpenExhibition(sys)}
                      className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/70 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-bold transition shadow"
                    >
                      <Landmark className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Fiche Musée & Exposition</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modale Dédiée Musée Virtuel de la Firme */}
      {isFirmMuseumOpen && (
        <React.Suspense fallback={null}>
          <CompanyExhibitionModal
            company={selectedCompany}
            systems={companySystems}
            isOpen={isFirmMuseumOpen}
            onClose={() => setIsFirmMuseumOpen(false)}
            onOpenSystemExhibition={(sys) => {
              setIsFirmMuseumOpen(false);
              if (onOpenExhibition) {
                onOpenExhibition(sys);
              }
            }}
            onExploreGames={(sysId) => {
              setIsFirmMuseumOpen(false);
              onSelectSystemFilter(sysId);
            }}
          />
        </React.Suspense>
      )}
      </div>
    </div>
  );
};
