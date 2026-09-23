import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  BookOpen,
  Search,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Layers,
  Lightbulb,
  Tv,
  Projector,
  Wifi,
  HardDrive,
  Palette,
  Trophy,
  Command,
  LayoutGrid,
} from 'lucide-react';
import { RETROMAD_MANUAL_SECTIONS } from '../../data/userManualData';
import { ManualScreenshotPreview } from './ManualScreenshotPreview';

interface RetroManualPdfGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaySound?: (type: 'coin' | 'powerup' | 'fanfare') => void;
}

export const RetroManualPdfGuideModal: React.FC<RetroManualPdfGuideModalProps> = ({
  isOpen,
  onClose,
  onPlaySound,
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeCalloutId, setActiveCalloutId] = useState<number | null>(null);

  if (!isOpen) return null;

  // Filtrage des sections
  const filteredSections = RETROMAD_MANUAL_SECTIONS.filter((sec) => {
    const matchesCategory =
      selectedCategory === 'all' || sec.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      sec.title.toLowerCase().includes(q) ||
      sec.subtitle.toLowerCase().includes(q) ||
      sec.summary.toLowerCase().includes(q) ||
      sec.proTip.toLowerCase().includes(q) ||
      sec.annotatedCallouts.some(
        (c) => c.label.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
      ) ||
      sec.keyFeatures.some((k) => k.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  // Export PDF via impression native du navigateur
  const handlePrintPdf = () => {
    if (onPlaySound) onPlaySound('fanfare');
    // On force l'affichage de tous les chapitres pour l'impression
    setSelectedSectionId('all');
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Téléchargement du guide autonome au format HTML complet
  const handleDownloadHtml = () => {
    if (onPlaySound) onPlaySound('coin');

    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>RetroMAD — Manuel Utilisateur & Guide Complet des Fonctionnalités</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 900px; margin: 0 auto; padding: 40px 20px; background: #f8fafc; }
    h1 { color: #0f172a; border-bottom: 3px solid #00f2fe; padding-bottom: 12px; margin-bottom: 4px; }
    h2 { color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-top: 40px; }
    h3 { color: #334155; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; background: #e0f2fe; color: #0369a1; font-size: 12px; font-weight: bold; margin-bottom: 12px; }
    .box { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .step { display: flex; align-items: flex-start; margin-bottom: 12px; }
    .step-num { background: #00f2fe; color: #09101f; font-weight: 900; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0; }
    .protip { background: #fefce8; border-left: 4px solid #eab308; padding: 12px 16px; border-radius: 6px; margin: 16px 0; font-size: 14px; }
    .callout-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    .callout-table th, .callout-table td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    .callout-table th { background: #f1f5f9; }
    @media print { body { background: white; padding: 0; } .box { break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>RetroMAD — Manuel Utilisateur Officiel</h1>
  <p><strong>Version :</strong> 1.0.0 (Édition Complète) &bull; <strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')} &bull; <strong>Système :</strong> Windows / Linux</p>
  <p>Ce guide détaille l'intégralité des fonctionnalités de RetroMAD avec les étapes d'utilisation, les raccourcis clavier et manette ainsi que les astuces d'optimisation.</p>
  <hr/>
  ${RETROMAD_MANUAL_SECTIONS.map(
    (sec) => `
    <div class="box">
      <span class="badge">CHAPITRE ${sec.number} &bull; ${sec.category.toUpperCase()}</span>
      <h2>${sec.title}</h2>
      <p><em>${sec.subtitle}</em></p>
      <p>${sec.summary}</p>

      <h3>Fonctionnalités clés :</h3>
      <ul>
        ${sec.keyFeatures.map((k) => `<li>${k}</li>`).join('')}
      </ul>

      <h3>Comment l'utiliser :</h3>
      ${sec.stepByStep
        .map(
          (s) => `
        <div class="step">
          <div class="step-num">${s.step}</div>
          <div><strong>${s.title} :</strong> ${s.instruction}</div>
        </div>
      `
        )
        .join('')}

      <div class="protip"><strong>★ Astuce RetroMAD :</strong> ${sec.proTip}</div>

      <h3>Points d'intérêt de la capture d'écran :</h3>
      <table class="callout-table">
        <thead>
          <tr><th>#</th><th>Élément</th><th>Description</th></tr>
        </thead>
        <tbody>
          ${sec.annotatedCallouts
            .map(
              (c) => `<tr><td><strong>[${c.id}]</strong></td><td><strong>${c.label}</strong></td><td>${c.description}</td></tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `
  ).join('')}
  <footer style="margin-top: 50px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 20px;">
    Document généré par RetroMAD &bull; Frontend Retrogaming Moderne &bull; Tous droits réservés.
  </footer>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'RetroMAD_Guide_Manuel_Utilisateur.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getSectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Tv':
        return <Tv className="w-4 h-4 text-amber-400" />;
      case 'Projector':
        return <Projector className="w-4 h-4 text-cyan-400" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-pink-400" />;
      case 'Wifi':
        return <Wifi className="w-4 h-4 text-cyan-400" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4 text-yellow-400" />;
      case 'HardDrive':
        return <HardDrive className="w-4 h-4 text-emerald-400" />;
      case 'Palette':
        return <Palette className="w-4 h-4 text-purple-400" />;
      case 'Trophy':
        return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'Command':
        return <Command className="w-4 h-4 text-retro-accent" />;
      default:
        return <LayoutGrid className="w-4 h-4 text-retro-accent" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in retromad-printable-guide-container">
      <div className="bg-[#09101f] border border-cyan-500/40 rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-[0_10px_60px_rgba(0,242,254,0.25)] overflow-hidden text-slate-200 print:max-w-none print:max-h-none print:h-auto print:border-none print:shadow-none print:rounded-none print:bg-white print:text-slate-900">
        
        {/* ── EN-TÊTE DU GUIDE (Masqué à l'impression si souhaité, stylisé pour écran) ── */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 no-print">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 shadow-inner">
              <BookOpen className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-white font-sans tracking-wide">
                  Manuel Utilisateur & Guide Illustré RetroMAD
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
                  Exportable PDF ★
                </span>
              </div>
              <p className="text-xs text-slate-400">
                10 Chapitres illustrés avec captures d'écran, points d'intérêt ②, étapes détaillées et raccourcis
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            {/* Bouton Télécharger HTML autonome */}
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center space-x-1.5 border border-slate-700 transition"
              title="Télécharger le manuel au format HTML complet autonome"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Télécharger .HTML</span>
            </button>

            {/* Bouton Impression / Export PDF */}
            <button
              type="button"
              onClick={handlePrintPdf}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-lg shadow-cyan-500/30 transition active:scale-95"
              title="Ouvrir la boîte de dialogue d'impression / Enregistrer au format PDF"
            >
              <Printer className="w-4 h-4 fill-current" />
              <span>EXPORTER EN PDF</span>
            </button>

            {/* Bouton Fermer */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── BARRE D'OUTILS ET FILTRES (No Print) ── */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs no-print">
          {/* Recherche textuelle dans le manuel */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une fonction (ex: Kiosque, Projecteur, Wi-Fi, Sauvegarde)..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-[10px]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtres par catégorie */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'all', label: 'Tout le Manuel' },
              { id: 'core', label: 'Essentiels' },
              { id: 'arcade', label: 'Arcade & Écrans' },
              { id: 'network', label: 'Réseau LAN' },
              { id: 'retro', label: 'Rétro & Codes' },
              { id: 'advanced', label: 'Avancé' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (onPlaySound) onPlaySound('powerup');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sélecteur de vue : Livre complet ou Chapitre unique */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedSectionId('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedSectionId === 'all'
                  ? 'bg-retro-accent text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Vue Intégrale (10 Chapitres)
            </button>
          </div>
        </div>

        {/* ── CORPS DU MANUEL (Défilant à l'écran, paginé pour l'impression) ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-10 print:p-0 print:space-y-8 print:overflow-visible">
          
          {/* BANNIÈRE DE COUVERTURE DU MANUEL (Spécial Print / PDF) */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-cyan-950/60 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 print:bg-white print:border-b-2 print:border-slate-800 print:text-slate-900 print:p-4">
            <div>
              <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase mb-1">
                <span>DOCUMENTATION OFFICIELLE RETROMAD</span>
                <span>•</span>
                <span>ÉDITION 2026</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white print:text-slate-950 tracking-tight">
                Manuel Utilisateur & Guide des Fonctionnalités
              </h1>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Le frontend universel retrogaming pour PC, salons et bornes d'arcade. 
                Retrouvez ci-dessous toutes les explications, les schémas d'interface annotés ② et les raccourcis utiles.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/50 border border-slate-800 text-center font-mono text-xs shrink-0 print:border-slate-300 print:bg-slate-100">
              <div className="text-[10px] text-slate-400 print:text-slate-600 uppercase">Version Système</div>
              <div className="text-base font-black text-cyan-300 print:text-slate-900">RetroMAD v1.0</div>
              <div className="text-[10px] text-green-400 print:text-slate-700 mt-1">10 Modules Documentés</div>
            </div>
          </div>

          {/* NAVIGATION RAPIDE PAR SOMMAIRE (No Print) */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 no-print">
            <div className="text-xs font-bold text-slate-300 mb-2.5 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Sommaire Interactif des 10 Chapitres :</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {RETROMAD_MANUAL_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => {
                    setSelectedSectionId(sec.id);
                    if (onPlaySound) onPlaySound('powerup');
                  }}
                  className={`p-2 rounded-xl text-left border text-xs transition flex flex-col justify-between ${
                    selectedSectionId === sec.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-cyan-400 font-bold">{sec.number}</span>
                    {getSectionIcon(sec.iconName)}
                  </div>
                  <span className="font-bold text-[11px] truncate leading-tight">{sec.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* LISTE DES CHAPITRES DU MANUEL */}
          <div className="space-y-12 print:space-y-10">
            {filteredSections
              .filter((sec) => selectedSectionId === 'all' || sec.id === selectedSectionId)
              .map((sec) => (
                <div
                  key={sec.id}
                  id={`section-${sec.id}`}
                  className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 print:border-slate-300 print:bg-white print:text-slate-900 print:break-before-page print:p-2"
                >
                  {/* En-tête de section */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 print:border-slate-300">
                    <div className="flex items-center space-x-3">
                      <span className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-black text-sm flex items-center justify-center shrink-0 print:bg-slate-200 print:text-slate-900">
                        {sec.number}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base sm:text-lg font-black text-white print:text-slate-950">
                            {sec.title}
                          </h3>
                        </div>
                        <p className="text-xs text-cyan-300/90 print:text-slate-600 font-medium">
                          {sec.subtitle}
                        </p>
                      </div>
                    </div>

                    <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono font-bold uppercase print:bg-slate-100 print:text-slate-700">
                      {sec.category}
                    </span>
                  </div>

                  {/* Résumé */}
                  <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed">
                    {sec.summary}
                  </p>

                  {/* CAPTURE D'ÉCRAN HAUTE DÉFINITION ANNOTÉE */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span className="flex items-center space-x-1.5 text-cyan-400 font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Capture d'Écran Illustrée avec Points d'Intérêt :</span>
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Cliquez sur les pastilles ① ② ③ ④ pour inspecter
                      </span>
                    </div>

                    <ManualScreenshotPreview
                      section={sec}
                      activeCalloutId={activeCalloutId}
                      onSelectCallout={(id) => {
                        setActiveCalloutId(id);
                        if (onPlaySound) onPlaySound('powerup');
                      }}
                    />
                  </div>

                  {/* TABLEAU DES POINTS D'INTÉRÊT (CALLOUTS) */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 print:bg-slate-50 print:border-slate-300">
                    <div className="text-xs font-bold text-white print:text-slate-900 mb-2 flex items-center space-x-2">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Légende de la Capture d'Écran :</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {sec.annotatedCallouts.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => setActiveCalloutId(c.id)}
                          className={`p-2 rounded-lg border transition cursor-pointer flex items-start space-x-2.5 ${
                            activeCalloutId === c.id
                              ? 'bg-amber-400/10 border-amber-400/60 text-amber-200'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 print:bg-white print:border-slate-200'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-retro-accent text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {c.id}
                          </span>
                          <div>
                            <strong className="text-white print:text-slate-900 block text-[11px]">
                              {c.label}
                            </strong>
                            <span className="text-slate-400 print:text-slate-600 text-[11px] leading-tight">
                              {c.description}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* GUIDE ÉTAPE PAR ÉTAPE (COMMENT L'UTILISER) */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 print:bg-slate-50 print:border-slate-300">
                    <div className="text-xs font-bold text-cyan-300 print:text-slate-900 mb-3 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <span>Procédure Rapide & Guide Pas-à-Pas :</span>
                    </div>
                    <div className="space-y-2.5 text-xs">
                      {sec.stepByStep.map((s) => (
                        <div key={s.step} className="flex items-start space-x-3">
                          <span className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5 print:bg-slate-200 print:text-slate-800">
                            {s.step}
                          </span>
                          <div>
                            <strong className="text-white print:text-slate-900 text-[11px]">
                              {s.title} :
                            </strong>{' '}
                            <span className="text-slate-300 print:text-slate-700 text-[11px] leading-relaxed">
                              {s.instruction}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FONCTIONNALITÉS CLÉS & RACCOURCIS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Liste des fonctions */}
                    <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 print:bg-white print:border-slate-200">
                      <div className="font-bold text-white print:text-slate-900 mb-2 flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span>Fonctionnalités Incluses :</span>
                      </div>
                      <ul className="space-y-1.5 text-slate-300 print:text-slate-700 text-[11px]">
                        {sec.keyFeatures.map((kf, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                            <span>{kf}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Raccourcis associés */}
                    {sec.shortcuts && sec.shortcuts.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 print:bg-white print:border-slate-200">
                        <div className="font-bold text-white print:text-slate-900 mb-2 flex items-center space-x-2">
                          <Command className="w-3.5 h-3.5 text-amber-400" />
                          <span>Raccourcis Dédiés :</span>
                        </div>
                        <div className="space-y-1.5 text-[11px]">
                          {sec.shortcuts.map((sc, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-1.5 rounded bg-black/40 border border-slate-800 font-mono print:bg-slate-100 print:border-slate-200"
                            >
                              <span className="font-bold text-cyan-300 print:text-slate-900">
                                {sc.key}
                              </span>
                              <span className="text-slate-400 print:text-slate-600 text-[10px] font-sans">
                                {sc.action}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ASTUCE RETROMAD */}
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 print:bg-amber-50 print:border-amber-400 print:text-amber-900 flex items-start space-x-2.5 text-xs">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Astuce Pro RetroMAD :</strong> {sec.proTip}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* ── PIED DE PAGE AVEC BOUTONS D'EXPORT (No Print) ── */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
            <span>10 chapitres au format A4</span>
            <span>•</span>
            <span>Raccourci clavier : <strong>F1</strong></span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={handlePrintPdf}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase tracking-wider flex items-center space-x-1.5 transition shadow-md shadow-cyan-500/30"
            >
              <Printer className="w-4 h-4 fill-current" />
              <span>Exporter en PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
