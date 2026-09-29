import React from 'react';
import { Company, Game, System } from '../../types';
import { CompanyLogo } from '../CompanyLogo';
import { ConsoleLogo } from '../ConsoleLogo';
import {
  ArrowLeft,
  Gamepad2,
  Landmark,
  Monitor,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { companyDisplayName, COMPANY_DISPLAY_BY_CATEGORY, KioskCategory } from './kioskShared';

/**
 * NIVEAU 2 du Kiosque : les machines (consoles + micro-ordinateurs) de la
 * firme sélectionnée. Extrait de KioskArcadeView pour être chargé à la
 * demande (l'écran d'accueil n'en a pas besoin au boot).
 */

interface KioskConsolesLevelProps {
  selectedCompany: Company;
  companySystems: System[];
  companyPcSystems: System[];
  companyConsoleSystems: System[];
  consoleIndex: number;
  gamesCountBySystem: Map<string, number>;
  category: KioskCategory;
  isCompactFit: boolean;
  animations: boolean;
  neonGlows: boolean;
  games: Game[];
  onConsoleIndexChange: (idx: number) => void;
  onSelectConsole: (sys: System) => void;
  onBack: () => void;
  onOpenSystemMuseum: (sys: System) => void;
  onOpenCompanyMuseum: (company: Company) => void;
}

export const KioskConsolesLevel: React.FC<KioskConsolesLevelProps> = ({
  selectedCompany,
  companySystems,
  companyPcSystems,
  companyConsoleSystems,
  consoleIndex,
  gamesCountBySystem,
  category,
  isCompactFit,
  animations,
  neonGlows,
  onConsoleIndexChange,
  onSelectConsole,
  onBack,
  onOpenSystemMuseum,
  onOpenCompanyMuseum,
}) => {
  return (
    <div
      className={`flex-1 min-h-0 flex flex-col items-center justify-start ${isCompactFit ? 'p-2 sm:p-3' : 'p-3 sm:p-5 md:p-6'} z-20 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200`}
    >
      {/* En-tête centré avec logo firme */}
      <div className={`text-center ${isCompactFit ? 'mb-2' : 'mb-3 sm:mb-5'}`}>
        <div className="flex items-center justify-center space-x-3 mb-1">
          <CompanyLogo
            companyId={selectedCompany.id}
            logoId={
              category === 'all'
                ? undefined
                : COMPANY_DISPLAY_BY_CATEGORY[category][selectedCompany.id]?.logoId
            }
            size="md"
          />
        </div>
        <h1
          className={`${isCompactFit ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl md:text-3xl'} font-black text-white tracking-wider uppercase drop-shadow-[0_0_15px_rgba(0,242,254,0.4)]`}
        >
          MACHINES {companyDisplayName(selectedCompany, category).toUpperCase()}
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
          {companySystems.length} machine{companySystems.length > 1 ? 's' : ''} disponible
          {companySystems.length > 1 ? 's' : ''} • Cliquez sur une machine pour explorer sa
          ludothèque
        </p>

        {/* Bouton d'accès direct au Grand Musée de la firme */}
        <div className="mt-2.5 flex items-center justify-center">
          <button
            onClick={() => {
              onOpenCompanyMuseum(selectedCompany);
            }}
            style={{
              backgroundColor: `${selectedCompany.accentColor}20`,
              borderColor: `${selectedCompany.accentColor}70`,
              boxShadow: `0 0 15px ${selectedCompany.accentColor}33`,
            }}
            className="px-3.5 py-1.5 rounded-full border text-xs font-bold text-slate-200 hover:text-white transition flex items-center space-x-2 hover:scale-105 active:scale-95 shadow"
            title={`Explorer le Musée historique complet de ${companyDisplayName(selectedCompany, category)}`}
          >
            <Landmark className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Musée Virtuel {companyDisplayName(selectedCompany, category)} (Épopée, Archives,
              Secrets)
            </span>
            <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
          </button>
        </div>
      </div>

      {/* Grille des Consoles en Grand au Centre */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${isCompactFit ? 'gap-2.5 sm:gap-3' : 'gap-3 sm:gap-5'} max-w-6xl w-full justify-center`}
      >
        {companySystems.map((sys, idx) => {
          const isFocused = idx === consoleIndex;
          const romCount = gamesCountBySystem.get(sys.id) || 0;
          // En-têtes de groupes : « PC & Micro-ordinateurs » puis « Consoles »
          const showPcHeader = idx === 0 && companyPcSystems.length > 0;
          const showConsolesHeader =
            idx === companyPcSystems.length && companyConsoleSystems.length > 0;

          return (
            <React.Fragment key={sys.id}>
              {(showPcHeader || showConsolesHeader) && (
                <div className="col-span-full flex items-center justify-center gap-2 mt-1 mb-0.5 sm:mb-1.5">
                  {showPcHeader && (
                    <>
                      <Monitor className="w-4 h-4 text-amber-300" />
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-amber-300/90">
                        PC &amp; Micro-ordinateurs
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-300">
                        {companyPcSystems.length}
                      </span>
                    </>
                  )}
                  {showConsolesHeader && (
                    <>
                      <Gamepad2 className="w-4 h-4 text-cyan-300" />
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-cyan-300/90">
                        Consoles
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-300">
                        {companyConsoleSystems.length}
                      </span>
                    </>
                  )}
                </div>
              )}
              <div
                onClick={() => {
                  onConsoleIndexChange(idx);
                  onSelectConsole(sys);
                }}
                onMouseEnter={() => {
                  onConsoleIndexChange(idx);
                }}
                style={{
                  borderColor: isFocused ? sys.themeColor : 'rgba(51, 65, 85, 0.6)',
                  boxShadow: isFocused ? `0 0 25px ${sys.themeColor}55` : undefined,
                }}
                className={`group relative rounded-2xl sm:rounded-3xl ${isCompactFit ? 'p-2.5 sm:p-3 min-h-[160px]' : 'p-3.5 sm:p-5 min-h-[240px] sm:min-h-[260px]'} flex flex-col items-center justify-between text-center ${animations ? 'transition-[transform,opacity,border-color] duration-200 ease-out' : ''} cursor-pointer overflow-hidden [transform:translateZ(0)] will-change-transform ${
                  isFocused
                    ? `bg-slate-900/95 border-2 z-10 ${animations ? 'scale-102 sm:scale-105' : ''}`
                    : `bg-slate-900/60 hover:bg-slate-900/80 border ${animations ? 'hover:scale-102' : ''} opacity-90 hover:opacity-100`
                }`}
              >
                {/* Halo lumineux d'arrière-plan de la console (dégradé radial, sans blur) */}
                {neonGlows && (
                  <div
                    className={`absolute inset-0 rounded-3xl opacity-15 ${animations ? 'transition-opacity group-hover:opacity-30' : ''} pointer-events-none`}
                    style={{
                      background: `radial-gradient(ellipse at 50% 30%, ${sys.themeColor}66 0%, transparent 70%)`,
                    }}
                  />
                )}

                {/* Vrai Logo Haute Définition de la Console EN GRAND */}
                <div
                  className={`w-full ${isCompactFit ? 'h-12 sm:h-14' : 'h-16 sm:h-20'} flex items-center justify-center my-1 p-1 sm:p-1.5 transition-transform duration-300 group-hover:scale-105 shrink-0`}
                >
                  <ConsoleLogo system={sys} size={isCompactFit ? 'lg' : 'xl'} className="max-h-full w-auto" />
                </div>

                {/* Titre & Année */}
                <div className="w-full px-1 min-h-[2.75rem] sm:min-h-[3.25rem] flex flex-col justify-center items-center">
                  <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider leading-tight line-clamp-2">
                    {sys.name}
                  </h3>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono mt-0.5 block">
                    {sys.releaseYear} • {sys.generation}
                  </span>
                </div>

                {/* Badge ROMs installées */}
                <div className="my-2 sm:my-3">
                  <span
                    style={{
                      backgroundColor: romCount > 0 ? `${sys.themeColor}25` : undefined,
                      borderColor: romCount > 0 ? `${sys.themeColor}50` : undefined,
                      color: romCount > 0 ? sys.themeColor : '#94a3b8',
                    }}
                    className="px-2.5 py-1 rounded-xl border text-[11px] sm:text-xs font-black flex items-center space-x-1.5"
                  >
                    <Gamepad2 className="w-3.5 h-3.5" />
                    <span>
                      {romCount} JEU{romCount > 1 ? 'X' : ''} DISPONIBLE{romCount > 1 ? 'S' : ''}
                    </span>
                  </span>
                </div>

                {/* Spécification clé */}
                <div className="text-[10px] text-slate-400 font-mono line-clamp-1 px-2">
                  {sys.specs?.cpu}
                </div>

                {/* Boutons d'action */}
                <div className="w-full mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5 sm:space-y-2">
                  <button
                    type="button"
                    style={{
                      backgroundColor: isFocused ? sys.themeColor : undefined,
                      color: isFocused ? '#000000' : '#ffffff',
                    }}
                    className={`w-full py-2 sm:py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow flex items-center justify-center space-x-2 ${
                      isFocused ? 'shadow-neon font-black' : 'bg-slate-800 group-hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <span>Voir les ROMs</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenSystemMuseum(sys);
                    }}
                    className="w-full py-1.5 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-cyan-950 text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400 text-xs font-bold transition flex items-center justify-center space-x-2 shadow"
                    title="Découvrir l'histoire complète, l'architecture hardware et les secrets de cette console"
                  >
                    <Landmark className="w-3.5 h-3.5 text-cyan-400" />
                    <span>🏛️ Exposition Musée</span>
                  </button>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Boutons de retour et accès direct musée en bas */}
      <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <button
          onClick={onBack}
          className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center space-x-2 border border-slate-700 shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retourner aux Firmes (B / Échap)</span>
        </button>

        {/* Accès direct Grand Musée de la Firme */}
        <button
          onClick={() => onOpenCompanyMuseum(selectedCompany)}
          style={{
            backgroundColor: `${selectedCompany.accentColor}25`,
            borderColor: `${selectedCompany.accentColor}70`,
          }}
          className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl border text-white text-xs font-bold transition flex items-center space-x-2 shadow hover:scale-105 active:scale-95 cursor-pointer"
          title={`Consulter le Grand Musée de la firme ${companyDisplayName(selectedCompany, category)}`}
        >
          <Landmark className="w-4 h-4 text-amber-400" />
          <span>Musée Firme : {companyDisplayName(selectedCompany, category)}</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        </button>

        {companySystems[consoleIndex] && (
          <button
            onClick={() => onOpenSystemMuseum(companySystems[consoleIndex])}
            className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 hover:text-white border border-cyan-500/50 text-xs font-bold transition flex items-center space-x-2 shadow-neon cursor-pointer"
            title="Consulter l'exposition complète de la console sélectionnée (Touche M ou Y)"
          >
            <Landmark className="w-4 h-4 text-cyan-400" />
            <span>Exposition Musée : {companySystems[consoleIndex].name}</span>
            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-[10px] font-mono border border-cyan-500/40">
              Y / M
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
