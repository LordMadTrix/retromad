import React, { useState, useMemo } from 'react';
import {
  X,
  Palette,
  Sparkles,
  Download,
  Upload,
  Copy,
  Check,
  Play,
  Code,
  Sliders,
  Tv,
  Eye,
  Share2,
  BookOpen,
  Zap,
  Layers,
  FileText,
} from 'lucide-react';
import { CentralizedThemeItem } from '../../types/extendedFeatures';

export interface CommunityThemeDSL {
  id: string;
  name: string;
  author: string;
  version?: string;
  description: string;
  colors: {
    accent: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
  };
  crt: {
    enabled: boolean;
    shader: 'subtle-scanlines' | 'heavy-scanlines-curvature' | 'rgb-mask-high-tech' | 'lcd-grid-green' | 'trinitron-aperture' | 'amber-phosphor';
    curvature: boolean;
    scanlineIntensity: number; // 0.1 to 1.0
    glowIntensity: number; // 0 to 1
  };
  style: {
    bezelStyle: 'modern-neon' | 'wooden-cabinet' | 'metal-cyber' | 'gameboy-dmg-gray' | 'famicom-red-gold' | 'playstation-gray-box' | 'neo-geo-mvs';
    boxartStyle: '3d-angled' | 'flat-clean' | 'crystal-case' | 'cartridge-label';
    fontPreset: 'retro' | 'arcade' | 'pixel' | 'modern';
    borderRadius: 'rounded' | 'square' | 'arcade-curved';
  };
  audioTrack?: string;
}

// Modèles prédéfinis prêts à l'emploi pour inspirer la communauté
export const COMMUNITY_THEME_TEMPLATES: CommunityThemeDSL[] = [
  {
    id: 'synthwave-sunset',
    name: 'Synthwave Sunset 1984',
    author: '@RetroArtist',
    version: '1.2',
    description: 'Néons roses et violets éclatants avec ambiance crépusculaire d\'arcade californienne.',
    colors: {
      accent: '#ec4899',
      secondary: '#a855f7',
      background: '#090514',
      surface: '#150d2a',
      text: '#fdf4ff',
    },
    crt: {
      enabled: true,
      shader: 'subtle-scanlines',
      curvature: false,
      scanlineIntensity: 0.35,
      glowIntensity: 0.8,
    },
    style: {
      bezelStyle: 'modern-neon',
      boxartStyle: '3d-angled',
      fontPreset: 'retro',
      borderRadius: 'rounded',
    },
    audioTrack: 'synthwave-sunset.mp3',
  },
  {
    id: 'cyber-tokyo-matrix',
    name: 'Neo Tokyo Cyber Matrix',
    author: '@GhostInTheBox',
    version: '2.0',
    description: 'Interface hacker haute technologie vert phosphore et cyan inspirée des terminaux UNIX d\'époque.',
    colors: {
      accent: '#10b981',
      secondary: '#06b6d4',
      background: '#02120b',
      surface: '#052316',
      text: '#d1fae5',
    },
    crt: {
      enabled: true,
      shader: 'rgb-mask-high-tech',
      curvature: false,
      scanlineIntensity: 0.5,
      glowIntensity: 0.9,
    },
    style: {
      bezelStyle: 'metal-cyber',
      boxartStyle: 'crystal-case',
      fontPreset: 'arcade',
      borderRadius: 'square',
    },
    audioTrack: 'matrix-terminal.mp3',
  },
  {
    id: 'arcade-candy-cab',
    name: 'Candy Cab 90s Akihabara',
    author: '@AeroCityFan',
    version: '1.0',
    description: 'Couleurs vives de bornes japonaises Sega Astro City / Egret II avec écran CRT bombé.',
    colors: {
      accent: '#06b6d4',
      secondary: '#f59e0b',
      background: '#0c0f1d',
      surface: '#181e36',
      text: '#f8fafc',
    },
    crt: {
      enabled: true,
      shader: 'heavy-scanlines-curvature',
      curvature: true,
      scanlineIntensity: 0.6,
      glowIntensity: 0.65,
    },
    style: {
      bezelStyle: 'wooden-cabinet',
      boxartStyle: '3d-angled',
      fontPreset: 'pixel',
      borderRadius: 'arcade-curved',
    },
  },
  {
    id: 'gameboy-dotmatrix',
    name: 'Game Boy Monochrome DMG-01',
    author: '@YokoiLegacy',
    version: '1.1',
    description: 'Palette authentique 4 teintes de vert olive avec simulation de matrice LCD rétroéclairée.',
    colors: {
      accent: '#84cc16',
      secondary: '#65a30d',
      background: '#141c09',
      surface: '#202e0e',
      text: '#ecfccb',
    },
    crt: {
      enabled: true,
      shader: 'lcd-grid-green',
      curvature: false,
      scanlineIntensity: 0.4,
      glowIntensity: 0.4,
    },
    style: {
      bezelStyle: 'gameboy-dmg-gray',
      boxartStyle: 'cartridge-label',
      fontPreset: 'pixel',
      borderRadius: 'square',
    },
  },
  {
    id: 'amber-crt-terminal',
    name: 'CRT Ambre Phosphore 1978',
    author: '@VintageHacker',
    version: '1.0',
    description: 'La chaleur hypnotique des écrans monochromes ambre orangé des premiers micro-ordinateurs.',
    colors: {
      accent: '#f59e0b',
      secondary: '#d97706',
      background: '#100b02',
      surface: '#211604',
      text: '#fef3c7',
    },
    crt: {
      enabled: true,
      shader: 'amber-phosphor',
      curvature: true,
      scanlineIntensity: 0.7,
      glowIntensity: 0.95,
    },
    style: {
      bezelStyle: 'wooden-cabinet',
      boxartStyle: 'flat-clean',
      fontPreset: 'retro',
      borderRadius: 'rounded',
    },
  },
  {
    id: 'neogeo-mvs-red',
    name: 'Neo-Geo MVS Rouge Arcade',
    author: '@SNKForever',
    version: '1.0',
    description: 'Le rouge éclatant et la typographie blanche des bornes d\'arcade 100 Mega Shock MVS.',
    colors: {
      accent: '#ef4444',
      secondary: '#eab308',
      background: '#130404',
      surface: '#290c0c',
      text: '#fff1f2',
    },
    crt: {
      enabled: true,
      shader: 'trinitron-aperture',
      curvature: false,
      scanlineIntensity: 0.45,
      glowIntensity: 0.7,
    },
    style: {
      bezelStyle: 'neo-geo-mvs',
      boxartStyle: '3d-angled',
      fontPreset: 'arcade',
      borderRadius: 'arcade-curved',
    },
  },
];

interface CommunityThemeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTheme: (theme: CentralizedThemeItem) => void;
  onPlaySound?: (type: 'coin' | 'fanfare' | 'powerup') => void;
}

export const CommunityThemeStudioModal: React.FC<CommunityThemeStudioModalProps> = ({
  isOpen,
  onClose,
  onApplyTheme,
  onPlaySound,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'visual' | 'code' | 'templates' | 'guide'>('visual');
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Thème actuellement en cours d'édition
  const [currentTheme, setCurrentTheme] = useState<CommunityThemeDSL>(COMMUNITY_THEME_TEMPLATES[0]);
  const [jsonCode, setJsonCode] = useState<string>(() => JSON.stringify(COMMUNITY_THEME_TEMPLATES[0], null, 2));
  const [jsonParseError, setJsonParseError] = useState<string | null>(null);

  // Synchronisation du code JSON quand on modifie visuellement
  const updateVisualTheme = (updates: Partial<CommunityThemeDSL>) => {
    const updated = { ...currentTheme, ...updates };
    setCurrentTheme(updated);
    setJsonCode(JSON.stringify(updated, null, 2));
    setJsonParseError(null);
  };

  const updateColors = (colorUpdates: Partial<CommunityThemeDSL['colors']>) => {
    const updated: CommunityThemeDSL = {
      ...currentTheme,
      colors: { ...currentTheme.colors, ...colorUpdates },
    };
    setCurrentTheme(updated);
    setJsonCode(JSON.stringify(updated, null, 2));
    setJsonParseError(null);
  };

  const updateCrt = (crtUpdates: Partial<CommunityThemeDSL['crt']>) => {
    const updated: CommunityThemeDSL = {
      ...currentTheme,
      crt: { ...currentTheme.crt, ...crtUpdates },
    };
    setCurrentTheme(updated);
    setJsonCode(JSON.stringify(updated, null, 2));
    setJsonParseError(null);
  };

  const updateStyle = (styleUpdates: Partial<CommunityThemeDSL['style']>) => {
    const updated: CommunityThemeDSL = {
      ...currentTheme,
      style: { ...currentTheme.style, ...styleUpdates },
    };
    setCurrentTheme(updated);
    setJsonCode(JSON.stringify(updated, null, 2));
    setJsonParseError(null);
  };

  // Traitement de l'édition directe du JSON
  const handleJsonCodeChange = (newCode: string) => {
    setJsonCode(newCode);
    try {
      const parsed = JSON.parse(newCode) as CommunityThemeDSL;
      if (!parsed.id || !parsed.name || !parsed.colors?.accent) {
        setJsonParseError('Propriétés requises manquantes : id, name, colors.accent');
        return;
      }
      setCurrentTheme(parsed);
      setJsonParseError(null);
    } catch (err: any) {
      setJsonParseError(err.message);
    }
  };

  // Convertir le DSL en CentralizedThemeItem pour l'application dans RetroMAD
  const convertedThemeItem: CentralizedThemeItem = useMemo(() => {
    return {
      id: currentTheme.id,
      name: currentTheme.name,
      author: currentTheme.author,
      accentColor: currentTheme.colors.accent,
      secondaryColor: currentTheme.colors.secondary,
      // NB : pas de classes Tailwind construites dynamiquement (Tailwind ne
      // peut pas les compiler, ce qui produit du CSS invalide au build). On
      // passe les couleurs réelles, appliquées en style inline.
      bgColors: {
        background: currentTheme.colors.background,
        surface: currentTheme.colors.surface,
        text: currentTheme.colors.text,
      },
      crtShader: currentTheme.crt.shader,
      bezelStyle: currentTheme.style.bezelStyle,
      description: currentTheme.description,
    };
  }, [currentTheme]);

  // Actions d'export / import
  const handleExportFile = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonCode);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentTheme.id}.retromadtm.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    if (onPlaySound) onPlaySound('powerup');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        setCurrentTheme(parsed);
        setJsonCode(JSON.stringify(parsed, null, 2));
        setJsonParseError(null);
        if (onPlaySound) onPlaySound('fanfare');
      } catch (err: any) {
        alert('Fichier de thème invalide : ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(jsonCode);
    setCopiedSuccess(true);
    if (onPlaySound) onPlaySound('coin');
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handleApplyCurrentTheme = () => {
    onApplyTheme(convertedThemeItem);
    setAppliedSuccess(true);
    if (onPlaySound) onPlaySound('fanfare');
    setTimeout(() => setAppliedSuccess(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[94vh] bg-[#0b0f19] border border-slate-700/80 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col my-auto overflow-hidden">
        {/* En-tête Studio */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d1424] shrink-0">
          <div className="flex items-center space-x-3">
            <div
              style={{
                backgroundColor: `${currentTheme.colors.accent}25`,
                borderColor: `${currentTheme.colors.accent}60`,
                color: currentTheme.colors.accent,
              }}
              className="w-10 h-10 rounded-2xl border flex items-center justify-center shadow-lg transition-colors"
            >
              <Palette className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-wide">
                  Atelier de Thèmes Communautaires
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold">
                  RetroTheme DSL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Créez, personnalisez simplement avec un format accessible et partagez en 1 clic vos thèmes avec la communauté !
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleApplyCurrentTheme}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5"
            >
              {appliedSuccess ? <Check className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{appliedSuccess ? 'Thème Appliqué !' : 'Tester en Direct'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barre d'onglets du Studio */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-slate-800 bg-slate-950/60 shrink-0 overflow-x-auto">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setActiveSubTab('visual')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeSubTab === 'visual'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Studio Visuel</span>
            </button>

            <button
              onClick={() => setActiveSubTab('code')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeSubTab === 'code'
                  ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Langage RetroTheme DSL</span>
              {jsonParseError && <span className="w-2 h-2 rounded-full bg-rose-500" />}
            </button>

            <button
              onClick={() => setActiveSubTab('templates')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeSubTab === 'templates'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Modèles Communautaires ({COMMUNITY_THEME_TEMPLATES.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('guide')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeSubTab === 'guide'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Guide du Créateur</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyClipboard}
              title="Copier le code de thème pour le partager sur Discord, Reddit, forums"
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition flex items-center space-x-1 border border-slate-700"
            >
              {copiedSuccess ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
              <span>{copiedSuccess ? 'Copié !' : 'Copier'}</span>
            </button>

            <button
              onClick={handleExportFile}
              title="Télécharger le pack thème .retromadtm.json prêt pour /public/themes/"
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition flex items-center space-x-1 border border-slate-700"
            >
              <Download className="w-3 h-3 text-amber-400" />
              <span>Exporter Pack</span>
            </button>

            <label
              title="Importer un fichier de thème communautaire"
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition flex items-center space-x-1 border border-slate-700 cursor-pointer"
            >
              <Upload className="w-3 h-3 text-fuchsia-400" />
              <span>Importer</span>
              <input type="file" accept=".json,.retromadtm" onChange={handleImportFile} className="hidden" />
            </label>
          </div>
        </div>

        {/* Corps du Studio */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* PRÉVISUALISATION EN DIRECT (LIVE SANDBOX) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Rendu Virtuel en Direct de la Borne RetroMAD</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Thème : <strong className="text-white">{currentTheme.name}</strong> par <span className="text-amber-400">{currentTheme.author}</span>
              </span>
            </div>

            {/* Cadre de simulation interactive */}
            <div
              style={{
                backgroundColor: currentTheme.colors.background,
                borderColor: `${currentTheme.colors.accent}40`,
                boxShadow: `0 0 40px ${currentTheme.colors.accent}15`,
              }}
              className="relative p-5 rounded-3xl border overflow-hidden transition-all duration-300"
            >
              {/* Effet CRT scanlines simulé */}
              {currentTheme.crt.enabled && (
                <div
                  style={{
                    opacity: currentTheme.crt.scanlineIntensity,
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)',
                  }}
                  className="absolute inset-0 pointer-events-none z-10"
                />
              )}

              {/* Fausse barre de navigation RetroMAD aux couleurs du thème */}
              <div
                style={{
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: `${currentTheme.colors.accent}30`,
                }}
                className="flex items-center justify-between p-3 rounded-2xl border mb-4 shadow-sm"
              >
                <div className="flex items-center space-x-2">
                  <div
                    style={{ backgroundColor: currentTheme.colors.accent }}
                    className="w-3 h-3 rounded-full animate-ping opacity-75"
                  />
                  <span
                    style={{ color: currentTheme.colors.accent }}
                    className="font-black text-xs uppercase tracking-widest"
                  >
                    RetroMAD OS
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    style={{
                      backgroundColor: `${currentTheme.colors.secondary}25`,
                      color: currentTheme.colors.secondary,
                      borderColor: `${currentTheme.colors.secondary}40`,
                    }}
                    className="px-2 py-0.5 rounded-lg border text-[10px] font-bold"
                  >
                    16-BIT CLASSIC
                  </span>
                  <span
                    style={{
                      backgroundColor: `${currentTheme.colors.accent}20`,
                      color: currentTheme.colors.accent,
                      borderColor: `${currentTheme.colors.accent}40`,
                    }}
                    className="px-2.5 py-0.5 rounded-lg border text-[10px] font-bold"
                  >
                    SCANLINES {currentTheme.crt.shader}
                  </span>
                </div>
              </div>

              {/* Simulation de jeux et carte de présentation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  style={{
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: `${currentTheme.colors.accent}35`,
                  }}
                  className="p-3.5 rounded-2xl border flex flex-col justify-between space-y-2 group hover:scale-[1.02] transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        style={{ color: currentTheme.colors.accent }}
                        className="text-[10px] font-mono font-bold"
                      >
                        SNES • 1990
                      </span>
                      <span style={{ color: currentTheme.colors.secondary }} className="text-xs">
                        ★★★★★
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-white mt-1">Super Mario World</h5>
                    <p className="text-[10px] text-slate-400 line-clamp-1">L'aventure mythique de Dinosaur Land.</p>
                  </div>
                  <button
                    style={{
                      backgroundColor: currentTheme.colors.accent,
                      color: '#000000',
                    }}
                    className="w-full py-1 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono shadow"
                  >
                    Lancer le Jeu
                  </button>
                </div>

                <div
                  style={{
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: `${currentTheme.colors.secondary}35`,
                  }}
                  className="p-3.5 rounded-2xl border flex flex-col justify-between space-y-2 group hover:scale-[1.02] transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        style={{ color: currentTheme.colors.secondary }}
                        className="text-[10px] font-mono font-bold"
                      >
                        MEGADRIVE • 1991
                      </span>
                      <span style={{ color: currentTheme.colors.accent }} className="text-xs">
                        ★★★★★
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-white mt-1">Sonic The Hedgehog</h5>
                    <p className="text-[10px] text-slate-400 line-clamp-1">Vitesse pure et Green Hill Zone.</p>
                  </div>
                  <button
                    style={{
                      backgroundColor: currentTheme.colors.secondary,
                      color: '#ffffff',
                    }}
                    className="w-full py-1 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono shadow"
                  >
                    Lancer le Jeu
                  </button>
                </div>

                <div
                  style={{
                    backgroundColor: `${currentTheme.colors.surface}90`,
                    borderColor: `${currentTheme.colors.accent}20`,
                  }}
                  className="p-3.5 rounded-2xl border flex flex-col justify-center items-center text-center space-y-2"
                >
                  <div
                    style={{ color: currentTheme.colors.accent }}
                    className="w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center font-mono font-bold text-xs"
                  >
                    CRT
                  </div>
                  <span className="text-[11px] font-bold text-white">Bezel : {currentTheme.style.bezelStyle}</span>
                  <span className="text-[9px] text-slate-400 font-mono">Boîte : {currentTheme.style.boxartStyle}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ONGLET 1 : STUDIO VISUEL */}
          {activeSubTab === 'visual' && (
            <div className="space-y-6">
              {/* Informations Générales */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Identité & Métadonnées du Thème</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Nom du Thème</label>
                    <input
                      type="text"
                      value={currentTheme.name}
                      onChange={(e) => updateVisualTheme({ name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Identifiant Unique (Slug)</label>
                    <input
                      type="text"
                      value={currentTheme.id}
                      onChange={(e) => updateVisualTheme({ id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Créateur / Auteur</label>
                    <input
                      type="text"
                      value={currentTheme.author}
                      onChange={(e) => updateVisualTheme({ author: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-amber-300 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Description du Thème</label>
                  <input
                    type="text"
                    value={currentTheme.description}
                    onChange={(e) => updateVisualTheme({ description: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Palette de Couleurs */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
                  <Palette className="w-4 h-4 text-fuchsia-400" />
                  <span>Palette de Couleurs Rétro</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                      <span>Accent Principal</span>
                      <span className="font-mono text-[10px] text-slate-500">{currentTheme.colors.accent}</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={currentTheme.colors.accent}
                        onChange={(e) => updateColors({ accent: e.target.value })}
                        className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={currentTheme.colors.accent}
                        onChange={(e) => updateColors({ accent: e.target.value })}
                        className="w-full px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-[11px] font-mono text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                      <span>Accent Secondaire</span>
                      <span className="font-mono text-[10px] text-slate-500">{currentTheme.colors.secondary}</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={currentTheme.colors.secondary}
                        onChange={(e) => updateColors({ secondary: e.target.value })}
                        className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={currentTheme.colors.secondary}
                        onChange={(e) => updateColors({ secondary: e.target.value })}
                        className="w-full px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-[11px] font-mono text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                      <span>Fond Principal</span>
                      <span className="font-mono text-[10px] text-slate-500">{currentTheme.colors.background}</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={currentTheme.colors.background}
                        onChange={(e) => updateColors({ background: e.target.value })}
                        className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={currentTheme.colors.background}
                        onChange={(e) => updateColors({ background: e.target.value })}
                        className="w-full px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-[11px] font-mono text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                      <span>Cartes & Surfaces</span>
                      <span className="font-mono text-[10px] text-slate-500">{currentTheme.colors.surface}</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={currentTheme.colors.surface}
                        onChange={(e) => updateColors({ surface: e.target.value })}
                        className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={currentTheme.colors.surface}
                        onChange={(e) => updateColors({ surface: e.target.value })}
                        className="w-full px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-[11px] font-mono text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                      <span>Texte Principal</span>
                      <span className="font-mono text-[10px] text-slate-500">{currentTheme.colors.text}</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={currentTheme.colors.text}
                        onChange={(e) => updateColors({ text: e.target.value })}
                        className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={currentTheme.colors.text}
                        onChange={(e) => updateColors({ text: e.target.value })}
                        className="w-full px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-[11px] font-mono text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Effets CRT & Rendu Visuel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
                    <Tv className="w-4 h-4 text-cyan-400" />
                    <span>Effet Moniteur CRT & Scanlines</span>
                  </h4>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400">Shader d'Écran CRT</label>
                    <select
                      value={currentTheme.crt.shader}
                      onChange={(e) => updateCrt({ shader: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    >
                      <option value="subtle-scanlines">Lignes Scanlines Légères (Moderne)</option>
                      <option value="heavy-scanlines-curvature">Scanlines Lourdes & Écran Bombé (Arcade 80s)</option>
                      <option value="rgb-mask-high-tech">Grille RGB Tri-Phosphore (Sony Trinitron BVM)</option>
                      <option value="lcd-grid-green">Matrice LCD Vert Olive (Game Boy DMG)</option>
                      <option value="amber-phosphor">Monochrome Ambre Phosphore (Micro 1978)</option>
                      <option value="trinitron-aperture">Ouverture de Grille Trinitron Haute Fidélité</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-400">Intensité des Scanlines</span>
                      <span className="font-mono text-cyan-400">{Math.round(currentTheme.crt.scanlineIntensity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={currentTheme.crt.scanlineIntensity}
                      onChange={(e) => updateCrt({ scanlineIntensity: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-slate-400">Courbure d'Écran Bombé</span>
                    <button
                      type="button"
                      onClick={() => updateCrt({ curvature: !currentTheme.crt.curvature })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        currentTheme.crt.curvature
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {currentTheme.crt.curvature ? 'Actif (Bombé)' : 'Désactivé (Plat)'}
                    </button>
                  </div>
                </div>

                {/* Bezel, Boîtes & Typographie */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>Habillage Bezel & Style Boîtes</span>
                  </h4>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400">Style de Cadre Bezel d'Écran</label>
                    <select
                      value={currentTheme.style.bezelStyle}
                      onChange={(e) => updateStyle({ bezelStyle: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    >
                      <option value="modern-neon">Néon Moderne Transparent</option>
                      <option value="wooden-cabinet">Meuble Bois Vintage Arcade 1980</option>
                      <option value="metal-cyber">Châssis Métal Industriel Cyber</option>
                      <option value="gameboy-dmg-gray">Boîtier Gris Plastique Game Boy 1989</option>
                      <option value="famicom-red-gold">Écrin Famicom Rouge Bordeaux & Or</option>
                      <option value="playstation-gray-box">Gris Industriel PlayStation 1994</option>
                      <option value="neo-geo-mvs">Borne Rouge & Noire Neo-Geo MVS</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400">Rendu des Jaquettes de Jeux</label>
                    <select
                      value={currentTheme.style.boxartStyle}
                      onChange={(e) => updateStyle({ boxartStyle: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    >
                      <option value="3d-angled">Boîtes 3D Inclinées avec Reflet Miroir</option>
                      <option value="flat-clean">Jaquettes 2D Minimalistes Haute Définition</option>
                      <option value="crystal-case">Boîtiers Cristal CD-ROM Transparents</option>
                      <option value="cartridge-label">Étiquettes de Cartouches Rétro</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 2 : CODE DU LANGAGE RETROTHEME DSL */}
          {activeSubTab === 'code' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-start space-x-3">
                <Zap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-slate-300">
                  <strong className="text-cyan-300">Le Langage RetroTheme DSL :</strong> Déclaratif, simple et standardisé en JSON. 
                  Vous pouvez copier-coller ce code directement pour l'envoyer à vos amis, le partager sur Discord, ou créer un fichier <code>nom_theme.retromadtm.json</code> et le déposer dans <code>/public/themes/</code>.
                </div>
              </div>

              {jsonParseError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center space-x-2">
                  <X className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Erreur de syntaxe dans votre code : {jsonParseError}</span>
                </div>
              )}

              <div className="relative">
                <textarea
                  rows={16}
                  value={jsonCode}
                  onChange={(e) => handleJsonCodeChange(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-400 leading-relaxed transition resize-y selection:bg-cyan-500/30"
                  spellCheck={false}
                />
                <div className="absolute right-3 top-3 flex space-x-2">
                  <button
                    onClick={handleCopyClipboard}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 transition flex items-center space-x-1"
                  >
                    {copiedSuccess ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
                    <span>{copiedSuccess ? 'Copié !' : 'Copier Tout'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 3 : MODÈLES COMMUNAUTAIRES (INSPIRATION) */}
          {activeSubTab === 'templates' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Sélectionnez un modèle de départ créé par la communauté pour l'éditer, le personnaliser ou l'utiliser instantanément :
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {COMMUNITY_THEME_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-600 flex flex-col justify-between space-y-3 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            style={{ backgroundColor: tmpl.colors.accent }}
                            className="w-3 h-3 rounded-full"
                          />
                          <div
                            style={{ backgroundColor: tmpl.colors.secondary }}
                            className="w-3 h-3 rounded-full"
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{tmpl.version}</span>
                      </div>

                      <h4 className="text-xs font-bold text-white mt-2">{tmpl.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{tmpl.description}</p>
                      <span className="text-[10px] text-amber-400 font-mono block mt-1">Par {tmpl.author}</span>
                    </div>

                    <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => {
                          setCurrentTheme(tmpl);
                          setJsonCode(JSON.stringify(tmpl, null, 2));
                          setActiveSubTab('visual');
                          if (onPlaySound) onPlaySound('powerup');
                        }}
                        className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center space-x-1"
                      >
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Personnaliser</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentTheme(tmpl);
                          onApplyTheme({
                            id: tmpl.id,
                            name: tmpl.name,
                            author: tmpl.author,
                            accentColor: tmpl.colors.accent,
                            secondaryColor: tmpl.colors.secondary,
                            bgColors: {
                              background: tmpl.colors.background,
                              surface: tmpl.colors.surface,
                              text: tmpl.colors.text,
                            },
                            crtShader: tmpl.crt.shader,
                            bezelStyle: tmpl.style.bezelStyle,
                            description: tmpl.description,
                          });
                          if (onPlaySound) onPlaySound('fanfare');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black uppercase tracking-wider transition"
                      >
                        Appliquer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ONGLET 4 : GUIDE DU CRÉATEUR DE THÈMES */}
          {activeSubTab === 'guide' && (
            <div className="space-y-5 text-xs text-slate-300 leading-relaxed">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-cyan-950/40 to-slate-900 border border-slate-800 space-y-2">
                <h3 className="text-sm font-black text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Guide Facile : Créer et Distribuer un Thème pour RetroMAD</span>
                </h3>
                <p className="text-slate-400">
                  Notre objectif est de rendre la création de thèmes aussi facile et amusante qu'un jeu d'arcade. Vous n'avez besoin d'aucun outil complexe : tout se fait directement depuis ce studio ou avec n'importe quel éditeur de texte.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-white">Créez Visuellement</h4>
                  <p className="text-slate-400 text-[11px]">
                    Utilisez les curseurs de l'onglet <strong>Studio Visuel</strong> pour choisir vos couleurs néon, l'intensité des scanlines CRT et le style de cadre de borne d'arcade.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-white">Testez en 1 Clic</h4>
                  <p className="text-slate-400 text-[11px]">
                    Cliquez sur <strong>Tester en Direct</strong> pour voir immédiatement le thème transformer toute l'interface de RetroMAD sur votre écran.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-white">Partagez avec le Monde</h4>
                  <p className="text-slate-400 text-[11px]">
                    Cliquez sur <strong>Copier</strong> pour coller le snippet sur Discord/Reddit, ou <strong>Exporter Pack</strong> pour déposer le fichier dans <code>public/themes/</code>.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
                  <Share2 className="w-4 h-4 text-fuchsia-400" />
                  <span>Comment déposer votre thème dans le dépôt officiel RetroMAD ?</span>
                </h4>
                <p className="text-slate-300">
                  Tous les thèmes RetroMAD sont centralisés dans le répertoire <code>/public/themes/</code> et référencés dans <code>themes_manifest.json</code>. 
                  Pour proposer votre thème à tous les utilisateurs :
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <li>Téléchargez votre fichier <code>mon_theme.retromadtm.json</code> via le bouton Exporter.</li>
                  <li>Déposez-le dans le sous-dossier <code>public/themes/mon_theme.json</code>.</li>
                  <li>Partagez votre création sur le Discord de la communauté avec le tag <code>#retromad-themes</code> !</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
