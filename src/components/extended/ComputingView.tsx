import React, { useMemo, useState } from 'react';
import {
  Monitor, Cpu, Terminal, Disc3, Mouse, Rainbow, AppWindow,
  Grid2x2, Bird, LayoutGrid, MonitorSmartphone, MonitorCog,
  ChevronRight, Lightbulb, HardDrive, X, History, Package
} from 'lucide-react';
import { System, Game } from '../../../electron/types';
import { OS_TIMELINE, COMPUTING_ERAS, COMPUTING_SYSTEM_IDS, OsEra } from '../../data/computingData';

/** Icônes lucide référencées par nom dans les données. */
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Terminal, FloppyDisk: Disc3, Monitor, SquareTerminal: Cpu, Mouse, Rainbow,
  AppWindow, Grid2x2, Bird, LayoutGrid, MonitorSmartphone, MonitorCog,
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
            cultes et frise des systèmes d'exploitation, d'UNIX (1969) à nos jours.
          </p>
        </header>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {machines.map((sys) => {
                const count = gameCount[sys.id] || 0;
                const era = COMPUTING_ERAS.find((e) => e.systemIds.includes(sys.id));
                return (
                  <article
                    key={sys.id}
                    className="group relative rounded-2xl border border-slate-800 bg-slate-900/70 hover:bg-slate-800/70 transition-colors overflow-hidden"
                  >
                    {/* Bande de couleur de la machine */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: sys.themeColor }}
                    />
                    <div className="p-4 pt-5 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-white text-sm leading-tight">
                            {sys.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {sys.manufacturer} · {sys.releaseYear}
                          </p>
                        </div>
                        <Cpu className="w-5 h-5 shrink-0" style={{ color: sys.themeColor }} />
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 min-h-[2.2em]">
                        {sys.specs.cpu}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                            count > 0
                              ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
                              : 'border-slate-700 text-slate-500'
                          }`}
                        >
                          <Package className="w-3 h-3" />
                          {count > 0 ? `${count} jeu${count > 1 ? 'x' : ''}` : 'Aucun jeu'}
                        </span>

                        <div className="flex items-center gap-1">
                          {onOpenSystemExhibition && (
                            <button
                              type="button"
                              onClick={() => onOpenSystemExhibition(sys)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800"
                              title="Découvrir l'histoire de cette machine"
                            >
                              <Lightbulb className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onOpenGames(sys.id)}
                            disabled={count === 0}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                              count > 0
                                ? 'text-white hover:opacity-90'
                                : 'text-slate-600 cursor-not-allowed'
                            }`}
                            style={count > 0 ? { backgroundColor: sys.themeColor } : undefined}
                          >
                            Voir
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {era && (
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                          {era.label} · {era.years}
                        </p>
                      )}
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
