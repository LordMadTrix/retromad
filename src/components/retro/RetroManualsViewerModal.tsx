import React, { useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  X,
  Lightbulb,
  Gamepad,
  Printer,
} from 'lucide-react';
import { RetroManual } from '../../types/retroFeatures';
import { INITIAL_MANUALS } from '../../data/retroFeaturesData';
import { Game } from '../../types';

interface RetroManualsViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  manuals?: RetroManual[];
  games?: Game[];
  selectedGameId?: string;
  initialGameId?: string;
  onLaunchGame?: (game: Game) => void;
  onPlaySound?: (type: 'coin' | 'powerup') => void;
  onOpenOfficialGuide?: () => void;
}

export const RetroManualsViewerModal: React.FC<RetroManualsViewerModalProps> = ({
  isOpen,
  onClose,
  manuals = INITIAL_MANUALS,
  selectedGameId,
  initialGameId,
  games: _games,
  onLaunchGame: _onLaunchGame,
  onPlaySound,
  onOpenOfficialGuide,
}) => {
  const targetGameId = selectedGameId || initialGameId;
  const [activeManualIndex, setActiveManualIndex] = useState(() => {
    if (targetGameId) {
      const idx = manuals.findIndex((m) => m.gameId === targetGameId);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState<'normal' | 'large'>('normal');

  if (!isOpen) return null;

  const currentManual = manuals[activeManualIndex] || manuals[0];
  const pageData = currentManual.pages.find((p) => p.pageNumber === currentPage) || currentManual.pages[0];

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
      if (onPlaySound) onPlaySound('coin');
    }
  };

  const handleNextPage = () => {
    if (currentPage < currentManual.totalPages) {
      setCurrentPage((p) => p + 1);
      if (onPlaySound) onPlaySound('coin');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b1329] border border-cyan-500/30 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-[0_0_50px_rgba(0,242,254,0.15)] overflow-hidden">
        {/* Top bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0d1838] flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <BookOpen className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white tracking-wide">
                  Livret & Manuel d'Époque
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono font-bold">
                  {currentManual.systemName} · {currentManual.releaseYear}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Notice officielle numérisée, plans et secrets de jeu
              </p>
            </div>
          </div>

          {/* Sélecteur de manuel & contrôles */}
          <div className="flex items-center space-x-2">
            <select
              value={activeManualIndex}
              onChange={(e) => {
                setActiveManualIndex(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              {manuals.map((m, idx) => (
                <option key={m.id} value={idx}>
                  {m.gameTitle}
                </option>
              ))}
            </select>

            <button
              onClick={() => setZoomLevel((z) => (z === 'normal' ? 'large' : 'normal'))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title={zoomLevel === 'normal' ? 'Agrandir le texte' : 'Taille standard'}
            >
              {zoomLevel === 'normal' ? <ZoomIn className="w-4 h-4" /> : <ZoomOut className="w-4 h-4" />}
            </button>

            {onOpenOfficialGuide && (
              <button
                onClick={() => {
                  onClose();
                  onOpenOfficialGuide();
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition shadow-sm"
                title="Consulter le Guide Illustré Officiel de RetroMAD (10 Chapitres avec Captures & Export PDF)"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Guide RétroMAD (PDF)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Booklet Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center bg-gradient-to-b from-stone-950 via-[#0a1024] to-stone-950">
          <div
            className={`w-full max-w-3xl bg-[#fdfbf7] text-stone-900 rounded-2xl shadow-2xl border-4 border-amber-900/30 overflow-hidden flex flex-col justify-between transition-all ${
              zoomLevel === 'large' ? 'text-base p-8' : 'text-sm p-6 sm:p-8'
            }`}
            style={{
              backgroundImage: 'radial-gradient(#e5e0d8 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          >
            {/* Page Header */}
            <div className="border-b-2 border-stone-300 pb-3 mb-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 font-mono">
                  {currentManual.gameTitle} · MANUEL OFFICIEL
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mt-0.5">
                  {pageData?.title}
                </h3>
                {pageData?.subtitle && (
                  <p className="text-xs font-semibold text-stone-600 mt-0.5">
                    {pageData.subtitle}
                  </p>
                )}
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-mono text-xs font-black border border-amber-300">
                  PAGE {pageData?.pageNumber} / {currentManual.totalPages}
                </span>
              </div>
            </div>

            {/* Page Content Sections */}
            <div className="space-y-6 flex-1">
              {pageData?.sections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-2">
                  <h4 className="text-sm font-black text-amber-900 uppercase tracking-wider flex items-center space-x-1.5 border-l-4 border-amber-600 pl-2">
                    <span>{section.heading}</span>
                  </h4>
                  <p className="text-stone-700 leading-relaxed font-serif text-justify">
                    {section.text}
                  </p>

                  {/* Contrôles manette si présents */}
                  {section.controls && (
                    <div className="my-3 p-3 bg-stone-100 rounded-xl border border-stone-300 space-y-1.5">
                      <div className="text-xs font-bold text-stone-800 flex items-center space-x-1 mb-2">
                        <Gamepad className="w-3.5 h-3.5 text-amber-700" />
                        <span>Commandes de la manette :</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {section.controls.map((ctrl, cIdx) => (
                          <div
                            key={cIdx}
                            className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-stone-200"
                          >
                            <span className="font-mono font-bold text-amber-900">
                              {ctrl.button}
                            </span>
                            <span className="text-stone-600 text-right text-[11px]">
                              {ctrl.action}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Astuce secrète / Tip */}
                  {section.tip && (
                    <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl flex items-start space-x-2 text-xs text-amber-950 font-medium">
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-bold">Astuce du Conservateur : </strong>
                        {section.tip}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Page Footer Navigation */}
            <div className="mt-8 pt-4 border-t-2 border-stone-300 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs flex items-center space-x-1 disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Page Précédente</span>
              </button>

              {/* Pager Dots */}
              <div className="flex items-center space-x-1.5">
                {currentManual.pages.map((p) => (
                  <button
                    key={p.pageNumber}
                    onClick={() => setCurrentPage(p.pageNumber)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      p.pageNumber === currentPage
                        ? 'bg-amber-600 scale-125'
                        : 'bg-stone-300 hover:bg-stone-400'
                    }`}
                    title={`Aller à la page ${p.pageNumber}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage >= currentManual.totalPages}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center space-x-1 disabled:opacity-30 disabled:pointer-events-none transition shadow-sm"
              >
                <span>Page Suivante</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
