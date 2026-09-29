import React, { useMemo, useState } from 'react';
import {
  Monitor, Cpu, Terminal, Disc3, Mouse, Rainbow, AppWindow,
  Grid2x2, Bird, LayoutGrid, MonitorSmartphone, MonitorCog,
  ChevronRight, Lightbulb, HardDrive, X, History, Layers,
  Calculator, Cog, CreditCard, Binary, Zap, Database,
  CircuitBoard, Microchip, Smartphone,
  Gamepad2, Landmark
} from 'lucide-react';
import { System, Game } from '../../../electron/types';
import {
  OS_TIMELINE, GENERATIONS_TIMELINE,
  COMPUTING_SYSTEM_IDS, OsEra, GenEra,
} from '../../data/computingData';
import { ConsoleLogo } from '../ConsoleLogo';

/** Icônes lucide référencées par nom dans les données. */
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Terminal, FloppyDisk: Disc3, Monitor, SquareTerminal: Cpu, Mouse, Rainbow,
  AppWindow, Grid2x2, Bird, LayoutGrid, MonitorSmartphone, MonitorCog,
  Calculator, Cog, CreditCard, Binary, Zap, Database, CircuitBoard,
  Microchip, Layers, Smartphone, Lightbulb,
  Cpu,
};

interface ComputingViewProps {
  systems: System[];
  games: Game[];
  onOpenGames: (systemId: string) => void;
  onOpenSystemExhibition?: (sys: System) => void;
}

export const ComputingView: React.FC<ComputingViewProps> = ({
  systems,
  games,
  onOpenGames,
  onOpenSystemExhibition,
}) => {
  const [selectedEra, setSelectedEra] = useState<OsEra | null>(null);
  const [selectedGen, setSelectedGen] = useState<GenEra | null>(null);
  const [isHovered, setIsHovered] = useState<string | null>(null);

  /** Machines informatiques réellement présentes dans les données de l'app. */
  const machines = useMemo(
    () => systems.filter((s) => COMPUTING_SYSTEM_IDS.has(s.id)),
    [systems]
  );

  /** Nombre de jeux par système informatique. */
  const gameCount = useMemo(() => {
    const counts: Record<string, number> = {};
    games.forEach((g) => {
      if (COMPUTING_SYSTEM_IDS.has(g.systemId)) {
        counts[g.systemId] = (counts[g.systemId] || 0) + 1;
      }
    });
    return counts;
  }, [games]);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-5">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ── En-tête ── */}
        <header className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-emerald-400 flex items-center justify-center gap-3">
            <HardDrive className="w-7 h-7 text-amber-300" />
            Informatique — Des Pionniers à Aujourd'hui
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            La même passion que les consoles, côté micro-ordinateurs : machines
            cultes, frise des générations d'ordinateurs (des tubes à vide aux
            microprocesseurs) et frise des systèmes d'exploitation.
          </p>
        </header>

        {/* ── Frise des générations d'ordinateurs ── */}
        <section aria-label="Frise des générations d'ordinateurs">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-300/90 mb-3">
            <Layers className="w-4 h-4" />
            Frise des Générations d'Ordinateurs
          </h3>

          <div className="relative">
            {/* Ligne horizontale */}
            <div className="absolute top-[52px] left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500/60 via-emerald-400/40 to-fuchsia-400/60" />

            <div className="flex gap-2 overflow-x-auto pb-3 pt-1 snap-x">
              {GENERATIONS_TIMELINE.map((gen) => {
                const IconCmp = ICONS[gen.icon] || Cpu;
                return (
                  <button
                    key={gen.id}
                    type="button"
                    onClick={() => setSelectedGen(selectedGen === gen ? null : gen)}
                    className="group relative flex flex-col items-center shrink-0 w-[136px] snap-start focus:outline-none"
                    title={`${gen.gen} génération — ${gen.title}`}
                  >
                    {/* Période */}
                    <span
                      className="text-[11px] font-mono font-bold mb-1 whitespace-nowrap"
                      style={{ color: gen.color }}
                    >
                      {gen.period}
                    </span>

                    {/* Point sur la ligne */}
                    <span
                      className={`relative z-10 flex items-center justify-center w-11 h-11 rounded-full border-2 transition-transform group-hover:scale-110 ${
                        selectedGen === gen ? 'scale-110 ring-2 ring-white/40' : ''
                      }`}
                      style={{
                        borderColor: gen.color,
                        backgroundColor: '#0f172a',
                        boxShadow: `0 0 12px ${gen.color}55`,
                      }}
                    >
                      <IconCmp className="w-5 h-5" />
                      <span className="sr-only">{gen.title}</span>
                    </span>

                    {/* Rang + nom */}
                    <span className="mt-2 text-[9px] uppercase tracking-widest font-bold text-slate-500">
                      {gen.gen} génération
                    </span>
                    <span
                      className={`text-[11px] leading-tight text-center font-semibold ${
                        selectedGen === gen ? 'text-white' : 'text-slate-300 group-hover:text-white'
                      }`}
                    >
                      {gen.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Détail de la génération sélectionnée */}
          {selectedGen && (
            <div
              className="mt-3 rounded-2xl border bg-slate-900/80 p-5 relative"
              style={{ borderColor: `${selectedGen.color}66` }}
            >
              <button
                type="button"
                onClick={() => setSelectedGen(null)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                aria-label="Fermer le détail"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span
                  className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold"
                  style={{ backgroundColor: `${selectedGen.color}22`, color: selectedGen.color }}
                >
                  {selectedGen.gen}
                </span>
                <h4 className="text-lg font-bold text-white">{selectedGen.title}</h4>
                <span className="text-xs text-slate-400 font-mono">{selectedGen.period}</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{selectedGen.description}</p>
              <div className="mt-3 rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">
                  Machines emblématiques
                </span>
                <span className="text-xs font-mono text-slate-300 leading-relaxed">
                  {selectedGen.machines}
                </span>
              </div>
              {selectedGen.funFact && (
                <p className="mt-3 text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/25 rounded-lg px-3 py-2 flex gap-2">
                  <Lightbulb className="w-4 h-4 shrink-0 text-amber-300" />
                  {selectedGen.funFact}
                </p>
              )}
            </div>
          )}
        </section>

        {/* ── Frise chronologique des OS ── */}
        <section aria-label="Frise chronologique des systèmes d'exploitation">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-300/90 mb-3">
            <History className="w-4 h-4" />
            Frise des Systèmes d'Exploitation
          </h3>

          <div className="relative">
            {/* Ligne horizontale */}
            <div className="absolute top-[52px] left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/60 via-orange-400/40 to-emerald-400/60" />

            <div className="flex gap-2 overflow-x-auto pb-3 pt-1 snap-x">
              {OS_TIMELINE.map((era) => {
                const IconCmp = ICONS[era.icon] || Cpu;
                return (
                  <button
                    key={era.name + era.year}
                    type="button"
                    onClick={() => setSelectedEra(selectedEra === era ? null : era)}
                    className="group relative flex flex-col items-center shrink-0 w-[104px] snap-start focus:outline-none"
                    title={`${era.name} — ${era.maker}`}
                  >
                    {/* Année */}
                    <span
                      className="text-[11px] font-mono font-bold mb-1"
                      style={{ color: era.color }}
                    >
                      {era.year}
                    </span>

                    {/* Point sur la ligne */}
                    <span
                      className={`relative z-10 flex items-center justify-center w-11 h-11 rounded-full border-2 transition-transform group-hover:scale-110 ${
                        selectedEra === era ? 'scale-110 ring-2 ring-white/40' : ''
                      }`}
                      style={{
                        borderColor: era.color,
                        backgroundColor: '#0f172a',
                        boxShadow: `0 0 12px ${era.color}55`,
                      }}
                    >
                      <IconCmp className="w-5 h-5" />
                      <span className="sr-only">{era.name}</span>
                    </span>

                    {/* Nom */}
                    <span
                      className={`mt-2 text-[10px] leading-tight text-center font-semibold ${
                        selectedEra === era ? 'text-white' : 'text-slate-300 group-hover:text-white'
                      }`}
                    >
                      {era.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Détail de l'ère sélectionnée */}
          {selectedEra && (
            <div
              className="mt-3 rounded-2xl border bg-slate-900/80 p-5 relative"
              style={{ borderColor: `${selectedEra.color}66` }}
            >
              <button
                type="button"
                onClick={() => setSelectedEra(null)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                aria-label="Fermer le détail"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold"
                  style={{ backgroundColor: `${selectedEra.color}22`, color: selectedEra.color }}
                >
                  {selectedEra.year}
                </span>
                <h4 className="text-lg font-bold text-white">{selectedEra.name}</h4>
                <span className="text-xs text-slate-400">— {selectedEra.maker}</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{selectedEra.description}</p>
              {selectedEra.funFact && (
                <p className="mt-3 text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/25 rounded-lg px-3 py-2 flex gap-2">
                  <Lightbulb className="w-4 h-4 shrink-0 text-amber-300" />
                  {selectedEra.funFact}
                </p>
              )}
            </div>
          )}
        </section>

        {/* ── Machines de la ludothèque ── */}
        <section aria-label="Micro-ordinateurs disponibles">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-300/90 mb-3">
            <Monitor className="w-4 h-4" />
            Machines dans votre Ludothèque
          </h3>

          {machines.length === 0 ? (
            <p className="text-sm text-slate-400">
              Aucun système informatique détecté dans les données.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 max-w-6xl">
              {machines.map((sys) => {
                const count = gameCount[sys.id] || 0;
                return (
                  <article
                    key={sys.id}
                    onClick={() => count > 0 && onOpenGames(sys.id)}
                    onMouseEnter={() => setIsHovered(sys.id)}
                    onMouseLeave={() => setIsHovered(null)}
                    style={{
                      borderColor: isHovered === sys.id ? sys.themeColor : 'rgba(51, 65, 85, 0.6)',
                      boxShadow: isHovered === sys.id ? `0 0 25px ${sys.themeColor}55` : undefined,
                    }}
                    className={`group relative rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 min-h-[220px] flex flex-col items-center justify-between text-center transition-[transform,background-color,border-color,opacity,box-shadow] duration-300 overflow-hidden ${
                      isHovered === sys.id
                        ? 'bg-slate-900/95 border-2 z-10 scale-102 sm:scale-105'
                        : 'bg-slate-900/60 hover:bg-slate-900/80 border hover:scale-102 opacity-90 hover:opacity-100 cursor-pointer'
                    }`}
                  >
                    {/* Halo lumineux d'arrière-plan de la machine (dégradé radial, sans blur) */}
                    <div
                      className={`absolute inset-0 rounded-3xl opacity-15 group-hover:opacity-30 pointer-events-none`}
                      style={{
                        background: `radial-gradient(ellipse at 50% 30%, ${sys.themeColor}66 0%, transparent 70%)`,
                      }}
                    />

                    {/* Vrai Logo Haute Définition de la Machine EN GRAND */}
                    <div className="relative z-10 w-full h-16 sm:h-20 flex items-center justify-center my-1 p-1 sm:p-1.5 transition-transform duration-300 group-hover:scale-105 shrink-0">
                      <ConsoleLogo system={sys} size="xl" className="max-h-full w-auto" />
                    </div>

                    {/* Titre & Année */}
                    <div className="relative z-10 w-full px-1 min-h-[2.75rem] sm:min-h-[3.25rem] flex flex-col justify-center items-center">
                      <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider leading-tight line-clamp-2">
                        {sys.name}
                      </h3>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono mt-0.5 block">
                        {sys.releaseYear} • {sys.generation}
                      </span>
                    </div>

                    {/* Badge ROMs installées */}
                    <div className="relative z-10 my-2 sm:my-3">
                      <span
                        style={{
                          backgroundColor: count > 0 ? `${sys.themeColor}25` : undefined,
                          borderColor: count > 0 ? `${sys.themeColor}50` : undefined,
                          color: count > 0 ? sys.themeColor : '#94a3b8',
                        }}
                        className="px-2.5 py-1 rounded-xl border text-[11px] sm:text-xs font-black flex items-center space-x-1.5"
                      >
                        <Gamepad2 className="w-3.5 h-3.5" />
                        <span>{count} JEU{count > 1 ? 'X' : ''} DISPONIBLE{count > 1 ? 'S' : ''}</span>
                      </span>
                    </div>

                    {/* Spécification clé */}
                    <div className="relative z-10 text-[10px] text-slate-400 font-mono line-clamp-1 px-2">
                      {sys.specs?.cpu}
                    </div>

                    {/* Boutons d'action (identiques aux consoles) */}
                    <div className="relative z-10 w-full mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5 sm:space-y-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (count > 0) onOpenGames(sys.id);
                        }}
                        disabled={count === 0}
                        style={{
                          backgroundColor: isHovered === sys.id ? sys.themeColor : undefined,
                          color: isHovered === sys.id ? '#000000' : '#ffffff',
                        }}
                        className={`w-full py-2 sm:py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow flex items-center justify-center space-x-2 ${
                          isHovered === sys.id
                            ? 'shadow-neon font-black'
                            : 'bg-slate-800 group-hover:bg-slate-700 text-slate-300'
                        } ${count === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span>Voir les ROMs</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenSystemExhibition?.(sys);
                        }}
                        className="w-full py-1.5 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-cyan-950 text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400 text-xs font-bold transition flex items-center justify-center space-x-2 shadow"
                        title="Découvrir l'histoire complète, l'architecture hardware et les secrets de cette machine"
                      >
                        <Landmark className="w-3.5 h-3.5 text-cyan-400" />
                        <span>🏛️ Exposition Musée</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ComputingView;
