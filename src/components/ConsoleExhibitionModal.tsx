import React, { useState } from 'react';
import { System } from '../types';
import { ConsoleLogo } from './ConsoleLogo';
import { CompanyLogo } from './CompanyLogo';
import {
  X,
  Landmark,
  Cpu,
  Sparkles,
  BookOpen,
  Award,
  Gamepad2,
  Tv,
  Disc,
  Play,
  Volume2,
  HelpCircle,
  Flame,
  ShieldCheck,
  Pencil,
} from 'lucide-react';

interface ConsoleExhibitionModalProps {
  system: System | null;
  isOpen: boolean;
  onClose: () => void;
  onPlayGames?: (system: System) => void;
  onOpenCompanyMuseum?: (companyId: string) => void;
  onEditSystem?: (system: System) => void;
  isKioskMode?: boolean;
}

type ExhibitionTab = 'history' | 'hardware' | 'innovations' | 'legacy';

export const ConsoleExhibitionModal: React.FC<ConsoleExhibitionModalProps> = ({
  system,
  isOpen,
  onClose,
  onPlayGames,
  onOpenCompanyMuseum,
  onEditSystem,
  isKioskMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<ExhibitionTab>('history');

  // Gestion des raccourcis clavier dans la modale
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '1') {
        setActiveTab('history');
      } else if (e.key === '2') {
        setActiveTab('hardware');
      } else if (e.key === '3') {
        setActiveTab('innovations');
      } else if (e.key === '4') {
        setActiveTab('legacy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !system) return null;

  const museum = system.museum;
  const themeColor = system.themeColor || '#00f2fe';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl max-h-[92vh] bg-retro-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* BANNIÈRE SUPÉRIEURE DU MUSÉE */}
        <div
          style={{
            background: `linear-gradient(135deg, ${themeColor}22 0%, rgba(15, 23, 42, 0.95) 100%)`,
            borderColor: `${themeColor}44`,
          }}
          className="p-6 border-b flex flex-wrap items-center justify-between gap-4 shrink-0"
        >
          {/* Logo et Identité Muséale */}
          <div className="flex items-center space-x-4 min-w-0">
            <div
              style={{
                backgroundColor: `${themeColor}20`,
                borderColor: `${themeColor}60`,
              }}
              className="w-14 h-14 rounded-2xl border flex items-center justify-center text-white shadow-neon shrink-0 p-2"
            >
              <Landmark className="w-8 h-8" style={{ color: themeColor }} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span
                  style={{ backgroundColor: `${themeColor}25`, color: themeColor, borderColor: `${themeColor}50` }}
                  className="px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest"
                >
                  EXPOSITION DU PATRIMOINE
                </span>
                <span className="text-slate-500 font-bold">•</span>
                <span className="text-xs text-slate-400 font-mono">
                  {system.generation}
                </span>
              </div>

              <div className="flex items-center space-x-3 mt-1">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase truncate">
                  {system.name}
                </h2>
                <div className="h-8 max-w-[140px] shrink-0 hidden sm:flex items-center">
                  <ConsoleLogo system={system} size="sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Actions Droite : Musée de la Firme & Fermeture */}
          <div className="flex items-center space-x-2">
            {onOpenCompanyMuseum && (
              <button
                onClick={() => onOpenCompanyMuseum(system.companyId)}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-slate-200 hover:text-white transition shadow"
                title={`Visiter le Musée de la firme ${system.manufacturer}`}
              >
                <Landmark className="w-3.5 h-3.5 text-amber-400" />
                <span>Musée {system.manufacturer}</span>
              </button>
            )}

            {!isKioskMode && onEditSystem && (
              <button
                onClick={() => onEditSystem(system)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-bold text-cyan-300 transition shadow"
                title="Éditer les informations, spécifications et récit de cette console"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Modifier la Console</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Fermer l'exposition (Échap)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* BARRE D'ONGLETS DU MUSÉE */}
        <div className="px-6 py-3 bg-slate-950/70 border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              activeTab === 'history'
                ? 'bg-retro-accent text-slate-950 shadow-neon'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Histoire & Récit</span>
          </button>

          <button
            onClick={() => setActiveTab('hardware')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              activeTab === 'hardware'
                ? 'bg-retro-accent text-slate-950 shadow-neon'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>2. Architecture Hardware</span>
          </button>

          <button
            onClick={() => setActiveTab('innovations')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              activeTab === 'innovations'
                ? 'bg-retro-accent text-slate-950 shadow-neon'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>3. Innovations Mondiales</span>
          </button>

          <button
            onClick={() => setActiveTab('legacy')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              activeTab === 'legacy'
                ? 'bg-retro-accent text-slate-950 shadow-neon'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>4. Chefs-d'œuvre & Anecdotes</span>
          </button>
        </div>

        {/* CONTENU PRINCIPAL DE L'EXPOSITION (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Tagline / Devise muséale en exergue */}
          {museum?.tagline && (
            <div
              style={{
                borderColor: `${themeColor}40`,
                backgroundColor: `${themeColor}10`,
              }}
              className="p-4 rounded-2xl border text-sm font-semibold italic text-slate-200 flex items-center space-x-3"
            >
              <Sparkles className="w-5 h-5 shrink-0" style={{ color: themeColor }} />
              <span>« {museum.tagline} »</span>
            </div>
          )}

          {/* ONGLET 1 : HISTOIRE & ORIGINES */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Carte d'identité historique */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Constructeur
                  </span>
                  <div className="h-6 flex items-center justify-center">
                    <CompanyLogo companyId={system.companyId} size="sm" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Lancement
                  </span>
                  <span className="text-base font-black text-white font-mono">
                    Année {system.releaseYear}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Génération
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    {system.generation}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Ventes Mondiales
                  </span>
                  <span className="text-sm font-black text-emerald-400 font-mono">
                    {system.specs?.unitsSold || 'Non communiqué'}
                  </span>
                </div>
              </div>

              {/* Grand Récit Historique */}
              <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex items-center space-x-2 text-cyan-400">
                  <BookOpen className="w-5 h-5" />
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    Genèse & Récit Historique
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
                  {museum?.history ||
                    `${system.name} a marqué son époque par ses caractéristiques uniques et son catalogue remarquable.`}
                </p>
              </div>

              {/* Rivalité Historique */}
              {museum?.rivalry && (
                <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-200">
                  <Flame className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-rose-300 block mb-1">
                      Contexte Concurrentiel & Guerre des Consoles
                    </span>
                    <p className="text-xs sm:text-sm leading-relaxed text-rose-100">
                      {museum.rivalry}
                    </p>
                  </div>
                </div>
              )}

              {/* Note du Conservateur */}
              {museum?.curatorNote && (
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3 text-amber-200">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300 block mb-1">
                      Note du Conservateur du Musée
                    </span>
                    <p className="text-xs sm:text-sm leading-relaxed italic text-amber-100 font-serif">
                      « {museum.curatorNote} »
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ONGLET 2 : ARCHITECTURE & HARDWARE */}
          {activeTab === 'hardware' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Processeur Central */}
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start space-x-3">
                  <Cpu className="w-6 h-6 text-retro-accent shrink-0 mt-1" />
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                      Processeur Central (CPU)
                    </span>
                    <span className="text-sm font-bold text-white font-mono block mt-1">
                      {museum?.hardwareHighlights?.cpuArchitecture || system.specs?.cpu}
                    </span>
                  </div>
                </div>

                {/* Mémoire Vive (RAM) */}
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start space-x-3">
                  <Tv className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                      Mémoire Vive & VRAM
                    </span>
                    <span className="text-sm font-bold text-white font-mono block mt-1">
                      {museum?.hardwareHighlights?.ram || 'Architecture intégrée'}
                    </span>
                  </div>
                </div>

                {/* Processeur Graphique */}
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start space-x-3">
                  <Tv className="w-6 h-6 text-purple-400 shrink-0 mt-1" />
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                      Puce Graphique & Affichage
                    </span>
                    <span className="text-sm font-bold text-white font-mono block mt-1">
                      {museum?.hardwareHighlights?.videoChip || system.specs?.gpuOrAudio}
                    </span>
                    <span className="text-xs text-slate-400 block mt-1 font-mono">
                      Résolution : {system.specs?.resolution}
                    </span>
                  </div>
                </div>

                {/* Puce Sonore */}
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start space-x-3">
                  <Volume2 className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                      Processeur Audio & Synthèse
                    </span>
                    <span className="text-sm font-bold text-white font-mono block mt-1">
                      {museum?.hardwareHighlights?.soundChip || system.specs?.gpuOrAudio}
                    </span>
                  </div>
                </div>

                {/* Palette de Couleurs */}
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start space-x-3">
                  <Sparkles className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                      Palette & Couleurs Affichables
                    </span>
                    <span className="text-sm font-bold text-white font-mono block mt-1">
                      {museum?.hardwareHighlights?.colors || 'Standard couleur'}
                    </span>
                  </div>
                </div>

                {/* Format Médias & Contrôleurs */}
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start space-x-3">
                  <Disc className="w-6 h-6 text-pink-400 shrink-0 mt-1" />
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                      Format des Jeux & Contrôleurs
                    </span>
                    <span className="text-sm font-bold text-white font-mono block mt-1">
                      {system.specs?.media}
                    </span>
                    {museum?.hardwareHighlights?.controllers && (
                      <span className="text-xs text-slate-400 block mt-1">
                        Manette : {museum.hardwareHighlights.controllers}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 3 : INNOVATIONS & PREMIÈRES MONDIALES */}
          {activeTab === 'innovations' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center space-x-2 text-cyan-400 mb-2">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  Percées & Innovations Technologiques Majeures
                </h3>
              </div>

              {museum?.innovations && museum.innovations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {museum.innovations.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start space-x-3.5 hover:border-cyan-400 transition"
                    >
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-black text-sm shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-slate-200 font-semibold leading-relaxed">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic">
                  Cette console a consolidé les standards de sa génération.
                </p>
              )}
            </div>
          )}

          {/* ONGLET 4 : CHEFS-D'ŒUVRE & ANECDOTES */}
          {activeTab === 'legacy' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Jeux Incontournables */}
              {museum?.iconicGames && museum.iconicGames.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-amber-400">
                    <Award className="w-5 h-5" />
                    <h3 className="text-sm font-black uppercase tracking-wider">
                      Titres Légendaires & Chefs-d'œuvre Fondateurs
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {museum.iconicGames.map((gameTitle, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center flex flex-col items-center justify-center hover:border-amber-400 transition"
                      >
                        <Gamepad2 className="w-5 h-5 text-amber-400 mb-1.5" />
                        <span className="text-xs font-black text-white line-clamp-2">
                          {gameTitle}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Anecdotes & Secrets de Fabrication */}
              {museum?.anecdotes && museum.anecdotes.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <div className="flex items-center space-x-2 text-pink-400">
                    <HelpCircle className="w-5 h-5" />
                    <h3 className="text-sm font-black uppercase tracking-wider">
                      Secrets de Fabrication & Anecdotes Historiques
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {museum.anecdotes.map((anecdote, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-start space-x-3"
                      >
                        <span className="text-lg">💡</span>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                          {anecdote}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PIED DE PAGE AVEC BOUTON DIRECT VERS LES JEUX */}
        <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Landmark className="w-4 h-4 text-retro-accent" />
            <span>Exposition permanente RetroMad • Tous droits et marques réservés à leurs créateurs.</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
            >
              Fermer l'Exposition
            </button>

            {onPlayGames && (
              <button
                onClick={() => {
                  onClose();
                  onPlayGames(system);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-retro-accent to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-neon hover:scale-105 active:scale-95 flex items-center space-x-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Jouer aux ROMs de cette console</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
