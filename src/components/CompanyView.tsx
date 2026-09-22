import React, { useState } from 'react';
import { Company, System } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { ConsoleLogo } from './ConsoleLogo';
import { Landmark, Calendar, MapPin, ChevronRight, Cpu, Tv, HardDrive } from 'lucide-react';

interface CompanyViewProps {
  companies: Company[];
  systems: System[];
  onSelectSystemFilter: (systemId: string) => void;
  onOpenExhibition?: (system: System) => void;
}

export const CompanyView: React.FC<CompanyViewProps> = ({
  companies,
  systems,
  onSelectSystemFilter,
  onOpenExhibition,
}) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companies[0]?.id || 'nintendo');

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0];

  const companySystems = systems.filter((s) => s.companyId === selectedCompanyId);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-retro-900/40">
      {/* Sélecteur horizontal des Firmes avec VRAIS LOGOS */}
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
              className={`company-selector-button flex items-center justify-center px-5 py-3 min-w-[150px] rounded-2xl shrink-0 transition-all ${
                isSelected
                ? 'company-selector-active bg-slate-800/95 border-2 shadow-neon scale-[1.02]'
                : 'bg-retro-800/70 hover:bg-slate-700 border border-slate-600 hover:scale-102 opacity-80 hover:opacity-100'
              }`}
            >
              <CompanyLogo companyId={company.id} size="sm" />
            </button>
          );
        })}
      </div>

      {/* Contenu principal de la firme sélectionnée */}
      <div className="flex-1 overflow-y-auto">
        <div key={selectedCompanyId} className="company-content-enter p-8 space-y-8">
        {/* Bannière Présentation de la Firme */}
        <div
          style={{
            borderColor: `${selectedCompany.accentColor}55`,
            background: `linear-gradient(135deg, ${selectedCompany.accentColor}15 0%, #121622 100%)`,
          }}
          className="relative rounded-3xl p-8 border shadow-xl overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span
                  style={{ backgroundColor: selectedCompany.accentColor }}
                  className="px-3 py-0.5 rounded-md text-[11px] font-black text-white uppercase tracking-widest shadow"
                >
                  FIRME HISTORIQUE
                </span>
                <span className="text-slate-400 text-xs flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedCompany.country}</span>
                </span>
                <span className="text-slate-400 text-xs flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Fondée en {selectedCompany.founded}</span>
                </span>
              </div>

              <div className="company-logo-reveal my-3">
                <CompanyLogo companyId={selectedCompany.id} size="xl" />
              </div>

              <p className="text-sm text-slate-300 max-w-3xl mt-3 leading-relaxed">
                {selectedCompany.description}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
                Franchises Légendaires
              </span>
              <div className="flex flex-wrap md:justify-end gap-1.5 max-w-xs">
                {selectedCompany.famousFranchises.map((franchise, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-black/40 border border-slate-700/60 text-xs font-semibold text-slate-200"
                  >
                    {franchise}
                  </span>
                ))}
              </div>
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
      </div>
    </div>
  );
};
