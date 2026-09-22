import React, { useState, useEffect, useRef } from 'react';
import { Company } from '../types';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Edit3,
  Check,
  X,
  ExternalLink,
  Maximize2,
  RotateCcw,
  Film,
  Sun,
  Tv,
} from 'lucide-react';

interface CompanyBackgroundVideoProps {
  company: Company;
  mode?: 'banner' | 'card' | 'mini';
  className?: string;
  defaultMuted?: boolean;
}

const YouTubeBadgeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <span className={`inline-flex items-center justify-center rounded-md bg-red-600 shadow-sm ${className}`}>
    <Play className="w-2.5 h-2.5 text-white fill-white translate-x-[0.5px]" />
  </span>
);

// Vidéos cultes par défaut pour chaque firme (Archives / Publicités d'époque / Intros de boot / Gameplays cultes)
export const DEFAULT_COMPANY_VIDEOS: Record<
  string,
  {
    youtubeId: string;
    title: string;
    description?: string;
    suggestions?: Array<{ id: string; title: string }>;
  }
> = {
  nintendo: {
    youtubeId: 'in4X7qOUxEg',
    title: 'Nintendo 64 TV Commercials (1996-2001) & Super Nintendo',
    description: 'Archives officielles des spots TV Nintendo 64 et Super Nintendo.',
    suggestions: [
      { id: 'in4X7qOUxEg', title: 'Nintendo 64 TV Commercials Reel' },
      { id: 'AnU-2HRJNO4', title: 'Publicités cultes Nintendo 90s' },
      { id: 'fm5pcJe5UyY', title: 'Super Nintendo SNES Commercials' },
    ],
  },
  sega: {
    youtubeId: 'F-25xDO5Qc4',
    title: '14 Minutes of Sega Genesis Commercials from the 90s',
    description: 'Campagne mythique des années 90 "Sega c\'est plus fort que toi".',
    suggestions: [
      { id: 'F-25xDO5Qc4', title: 'Sega Genesis 90s TV Commercials' },
      { id: 'fdeVZHl9akU', title: 'SEGA Dreamcast Launch Commercials' },
      { id: '8-_1PZ5xfvg', title: 'Sega Saturn Japan Ads' },
    ],
  },
  sony: {
    youtubeId: 'oAhvQoLpvsM',
    title: 'PlayStation Intro 1080p [Remastered] & Démarrage Culte',
    description: 'Son de démarrage légendaire de la PS1 et logo Sony Computer Entertainment.',
    suggestions: [
      { id: 'oAhvQoLpvsM', title: 'PlayStation 1 Bios Startup 1080p' },
      { id: '6Y5vzwkBeE0', title: 'PlayStation 1 90s TV Commercials' },
      { id: '0JJU8vXEgt0', title: 'PlayStation 2 Boot Sound & Animation' },
    ],
  },
  microsoft: {
    youtubeId: 'oADANrDGhoQ',
    title: 'Original OG Xbox Boot intro Animation (4K UHD)',
    description: 'Démarrage vert radioactif mythique de la première Xbox de 2001.',
    suggestions: [
      { id: 'oADANrDGhoQ', title: 'Original Xbox Boot Animation 4K' },
      { id: 'UWNkgMAmtsw', title: 'Xbox 360 Startup Screen' },
    ],
  },
  snk: {
    youtubeId: 'RhrKkg6BYu4',
    title: 'Neo Geo AES/MVS Intro & GIGA POWER 100 Mega Shock',
    description: 'Le démarrage le plus imposant des salles d\'arcade Neo-Geo.',
    suggestions: [
      { id: 'RhrKkg6BYu4', title: 'Neo Geo AES/MVS Intro Sound' },
      { id: 'igJ9RLik5WY', title: 'Neo Geo CD Loading & Intro' },
    ],
  },
  atari: {
    youtubeId: '7qAadfsJrmM',
    title: 'Atari 2600 TV Commercial - "The fun is back"',
    description: 'L\'âge d\'or du jeu vidéo de salon dans les années 70 et 80.',
    suggestions: [
      { id: '7qAadfsJrmM', title: 'Atari 2600 "The fun is back"' },
      { id: 'VYQD8SwhnZU', title: 'Atari 7800 / Lynx Commercial' },
    ],
  },
  nec: {
    youtubeId: 'osIMDXgfo1g',
    title: 'Classic Commercial - PC Engine CD-ROM (Japan)',
    description: 'Révolution CD-ROM et catalogue culte de NEC & Hudson Soft.',
    suggestions: [
      { id: 'osIMDXgfo1g', title: 'PC Engine CD-ROM Commercial' },
    ],
  },
  commodore: {
    youtubeId: '-ga41edXw3A',
    title: 'Amiga 1000 Boing Ball Iconic 1985 Demo',
    description: 'Démo 3D historique de l\'Amiga créée par Dale Luck et RJ Mical.',
    suggestions: [
      { id: '-ga41edXw3A', title: 'Amiga Boing Ball 1985 Demo' },
    ],
  },
  panasonic: {
    youtubeId: 'aUFt8F4223w',
    title: 'R.E.A.L. 3DO System (Panasonic 3DO Commercial)',
    description: 'La première console CD-ROM 32-bit grand public de Trip Hawkins.',
    suggestions: [
      { id: 'aUFt8F4223w', title: 'Panasonic 3DO Launch Ad' },
    ],
  },
  gce: {
    youtubeId: 'p74M9FVTZfs',
    title: 'Vectrex 1982 Console Launch Commercial',
    description: 'Écran vectoriel phosphore monochrome avec calques colorés.',
    suggestions: [
      { id: 'p74M9FVTZfs', title: 'Vectrex 1982 TV Commercial' },
    ],
  },
  coleco: {
    youtubeId: 'yEaCgww5tI4',
    title: 'Donkey Kong Commercial (1982) ColecoVision',
    description: 'Le portage officiel Donkey Kong sur ColecoVision.',
    suggestions: [
      { id: 'yEaCgww5tI4', title: 'ColecoVision Donkey Kong Ad 1982' },
    ],
  },
  mattel: {
    youtubeId: 'tO3hne8O9FU',
    title: 'INTELLIVISION (1982) by Mattel Electronics - TV Ad',
    description: 'Publicités comparatives animées par George Plimpton.',
    suggestions: [
      { id: 'tO3hne8O9FU', title: 'Intellivision 1982 TV Commercial' },
    ],
  },
  bandai: {
    youtubeId: 'YEpnxE5zPos',
    title: 'WonderSwan Commercial - Gunpei Yokoi Portable',
    description: 'Console portable conçue par le créateur de la Game Boy.',
    suggestions: [
      { id: 'YEpnxE5zPos', title: 'WonderSwan Japanese TV Spot' },
    ],
  },
  apple: {
    youtubeId: 'ML9ZsqN-9QA',
    title: 'Apple II Commercial 1980 - Personal Computing Pioneer',
    description: 'L\'ordinateur qui a démocratisé les jeux sur disquette 5"1/4.',
    suggestions: [
      { id: 'ML9ZsqN-9QA', title: 'Apple II Vintage 1980 Ad' },
    ],
  },
  amstrad: {
    youtubeId: 'me94VyUSclw',
    title: 'Amstrad 6128 PLUS (1990 French Advertisement)',
    description: '"Le crocodile d\'Amstrad" et les micro-ordinateurs CPC.',
    suggestions: [
      { id: 'me94VyUSclw', title: 'Amstrad 6128 PLUS Publicité Française' },
    ],
  },
  multiple: {
    youtubeId: 'x6aNPsjNwFo',
    title: 'Arcade Ambience 1983 (Arcade sounds) - Andy Hofle',
    description: 'Ambiance sonore authentique de salle d\'arcade des années 80.',
    suggestions: [
      { id: 'x6aNPsjNwFo', title: 'Arcade Ambience 1983 Audio/Video' },
    ],
  },
};

const STORAGE_KEY_CUSTOM_VIDEOS = 'retromad_custom_company_videos_v3';

// IDs YouTube obsolètes ou restreints qui doivent être remplacés par les nouvelles versions vérifiées
const LEGACY_BROKEN_IDS = new Set([
  'q_S8E8d8W6A',
  'Z9R_yH7_X-M',
  'H4wUXnWJ2nU',
  '8eLqT8j6wD0',
  'n81n6C4zV3E',
  'd3s_9G1y1L4',
  'vF3l_kX1iZc',
  'W1e7p4Y5a8c',
  'q9Q7vX5r2_s',
  'Y1w8y5p2m0c',
  'Z0p9y3x6v1m',
  'M8q1z4b0y9c',
  'C64y2y5x7w0',
  'K9k3p7y5x2w',
  'R1x9y4w7z2c',
  'oAhvQOl4HPc',
]);

/**
 * Extrait l'identifiant YouTube (11 caractères) depuis n'importe quel format d'URL ou ID brut
 */
export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const clean = urlOrId.trim();

  // Si c'est déjà un ID brut (11 caractères alphanumériques avec - et _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }

  // Format standard youtube.com/watch?v=ID
  const watchMatch = clean.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // Format raccourci youtu.be/ID
  const shortMatch = clean.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // Format embed /v/ /e/ ou shorts
  const embedMatch = clean.match(/(?:embed|v|shorts|live)\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  // Format généraliste regex
  const generalMatch = clean.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  if (generalMatch) return generalMatch[1];

  return null;
}

export function getCompanyVideoConfig(companyId: string): {
  youtubeId?: string;
  videoUrl?: string;
  title?: string;
} {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_VIDEOS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed[companyId]) {
        // Vérifier si l'ancien ID sauvegardé est valide ou s'il fait partie des anciens liens restreints
        const savedId = parsed[companyId].youtubeId;
        if (savedId && !LEGACY_BROKEN_IDS.has(savedId)) {
          return parsed[companyId];
        }
      }
    }
  } catch {
    // Fallback
  }
  return (
    DEFAULT_COMPANY_VIDEOS[companyId] || {
      youtubeId: 'x6aNPsjNwFo',
      title: 'Retro Gaming Archive',
    }
  );
}

export function saveCompanyVideoConfig(
  companyId: string,
  config: { youtubeId?: string; videoUrl?: string; title?: string }
): void {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_VIDEOS);
    const parsed = saved ? JSON.parse(saved) : {};
    parsed[companyId] = config;
    localStorage.setItem(STORAGE_KEY_CUSTOM_VIDEOS, JSON.stringify(parsed));
  } catch {
    // Ignore
  }
}

export const CompanyBackgroundVideo: React.FC<CompanyBackgroundVideoProps> = ({
  company,
  mode = 'banner',
  className = '',
  defaultMuted = true,
}) => {
  const [isMuted, setIsMuted] = useState(defaultMuted);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [bgOpacityLevel, setBgOpacityLevel] = useState<'vivid' | 'cinema' | 'subtle'>('vivid');
  const [customInput, setCustomInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [videoConfig, setVideoConfig] = useState(() => getCompanyVideoConfig(company.id));

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setVideoConfig(getCompanyVideoConfig(company.id));
  }, [company.id]);

  // Animation Canvas Rétro procédurale en arrière-plan (Cathode / Raster / Synthwave lines)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let step = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) return;

      ctx.fillStyle = '#070a12';
      ctx.fillRect(0, 0, w, h);

      // Lignes de grille animées façon synthwave / raster 80s
      const color = company.accentColor || '#00f2fe';
      ctx.strokeStyle = `${color}25`;
      ctx.lineWidth = 1;

      step += 0.4;
      const offset = step % 24;

      // Lignes horizontales
      for (let y = offset; y < h; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Étoiles scintillantes rétro
      for (let i = 0; i < 25; i++) {
        const sx = (i * 137 + step * 5) % w;
        const sy = (i * 89) % h;
        const radius = i % 3 === 0 ? 1.5 : 0.8;
        ctx.fillStyle = `${color}${i % 2 === 0 ? '66' : '33'}`;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [company.accentColor]);

  // Extraire ID YouTube ou URL directe
  const rawVideoUrl = company.videoUrl || videoConfig.videoUrl;
  const currentYoutubeId =
    extractYouTubeId(videoConfig.youtubeId || '') ||
    extractYouTubeId(company.youtubeId || '') ||
    DEFAULT_COMPANY_VIDEOS[company.id]?.youtubeId ||
    'x6aNPsjNwFo';

  const liveDetectedId = extractYouTubeId(customInput);

  const handleApplyYouTubeLink = (targetInput: string) => {
    const val = targetInput.trim();
    if (!val) {
      setInputError('Veuillez entrer un lien ou un ID YouTube.');
      return;
    }

    const detectedId = extractYouTubeId(val);

    if (detectedId) {
      const newConf = {
        youtubeId: detectedId,
        title: `Lien YouTube (${detectedId})`,
      };
      saveCompanyVideoConfig(company.id, newConf);
      setVideoConfig(newConf);
      setInputError(null);
      setIsModalOpen(false);
    } else if (val.startsWith('http://') || val.startsWith('https://')) {
      // Lien direct MP4/WebM
      const newConf = {
        videoUrl: val,
        title: 'Vidéo directe',
      };
      saveCompanyVideoConfig(company.id, newConf);
      setVideoConfig(newConf);
      setInputError(null);
      setIsModalOpen(false);
    } else {
      setInputError("Format non reconnu. Collez un lien du type https://www.youtube.com/watch?v=... ou l'ID YouTube.");
    }
  };

  const handleResetToDefault = () => {
    const defaultVal = DEFAULT_COMPANY_VIDEOS[company.id] || {
      youtubeId: 'x6aNPsjNwFo',
      title: 'Vidéo d\'archive officielle',
    };
    saveCompanyVideoConfig(company.id, defaultVal);
    setVideoConfig(defaultVal);
    setCustomInput('');
    setInputError(null);
    setIsModalOpen(false);
  };

  // Rendu selon le mode
  if (mode === 'mini') {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none rounded-inherit ${className}`}>
        {/* Miniature YouTube haute définition instantanée */}
        {currentYoutubeId ? (
          <img
            src={`https://img.youtube.com/vi/${currentYoutubeId}/hqdefault.jpg`}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-85 group-hover:scale-105 transition-all duration-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <canvas ref={canvasRef} width={200} height={100} className="absolute inset-0 w-full h-full object-cover opacity-30" />
        )}
        <div className="absolute inset-0 bg-slate-950/45 group-hover:bg-slate-950/15 transition-colors pointer-events-none" />
        <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />
      </div>
    );
  }

  if (mode === 'card') {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none rounded-3xl ${className}`}>
        {/* Canvas raster réactif */}
        <canvas ref={canvasRef} width={320} height={400} className="absolute inset-0 w-full h-full object-cover opacity-30" />

        {/* Vidéo MP4 directe si configurée */}
        {rawVideoUrl ? (
          <video
            src={rawVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-55 transition-opacity duration-500 scale-105"
          />
        ) : currentYoutubeId ? (
          /* Vidéo YouTube d'archive en boucle */
          <iframe
            src={`https://www.youtube.com/embed/${currentYoutubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${currentYoutubeId}&playsinline=1&rel=0`}
            title={`Vidéo de fond ${company.name}`}
            className="absolute inset-0 w-[160%] h-[160%] -top-[30%] -left-[30%] object-cover opacity-50 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none border-0"
            allow="autoplay; encrypted-media"
          />
        ) : null}

        {/* Dégradé d'assombrissement pour garantir la lisibilité parfaite du logo et du texte */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 35%, transparent 15%, #080c14ee 85%)`,
          }}
        />
        {/* Balayage scanlines CRT */}
        <div className="absolute inset-0 scanlines opacity-25 pointer-events-none" />
      </div>
    );
  }

  // Mode BANNER (Grand encadré principal de présentation de la firme)
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none rounded-3xl ${className}`}>
      {/* Canvas d'ambiance rétro */}
      <canvas ref={canvasRef} width={1000} height={400} className="absolute inset-0 w-full h-full object-cover opacity-35" />

      {/* Vidéo directe ou YouTube */}
      {rawVideoUrl ? (
        <video
          src={rawVideoUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            bgOpacityLevel === 'cinema' ? 'opacity-95' : bgOpacityLevel === 'vivid' ? 'opacity-75' : 'opacity-40'
          }`}
        />
      ) : currentYoutubeId && isPlaying ? (
        <iframe
          src={`https://www.youtube.com/embed/${currentYoutubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${currentYoutubeId}&playsinline=1&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1`}
          title={`Archive vidéo YouTube de la firme ${company.name}`}
          className={`absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] object-cover transition-opacity duration-700 pointer-events-none border-0 ${
            bgOpacityLevel === 'cinema' ? 'opacity-95' : bgOpacityLevel === 'vivid' ? 'opacity-75' : 'opacity-40'
          }`}
          allow="autoplay; encrypted-media"
        />
      ) : null}

      {/* Dégradés cinématiques transparents laissant voir nettement la vidéo */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-500"
        style={{
          background:
            bgOpacityLevel === 'cinema'
              ? `linear-gradient(135deg, ${company.accentColor}15 0%, #06091260 50%, #04060db0 100%)`
              : bgOpacityLevel === 'vivid'
              ? `linear-gradient(135deg, ${company.accentColor}25 0%, #070c1880 50%, #050812d0 100%)`
              : `linear-gradient(135deg, ${company.accentColor}35 0%, #080e1cd0 50%, #050814f5 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-retro-900/80 via-transparent to-retro-900/30 pointer-events-none" />

      {/* Scanlines CRT discrètes */}
      <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />

      {/* ========================================================================= */}
      {/* BARRE D'ACTIONS VIDÉO YOUTUBE SUR L'ENCADRÉ DE LA FIRME                  */}
      {/* ========================================================================= */}
      <div className="absolute top-4 right-4 z-30 pointer-events-auto flex items-center space-x-2">
        {/* BOUTON PRINCIPAL YOUTUBE POUR DÉFINIR / CHANGER LE LIEN */}
        <button
          type="button"
          onClick={() => {
            setCustomInput(currentYoutubeId ? `https://www.youtube.com/watch?v=${currentYoutubeId}` : '');
            setInputError(null);
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs shadow-lg transition hover:scale-105 active:scale-95 cursor-pointer"
          title="Définir ou changer la vidéo de fond via un lien YouTube"
        >
          <YouTubeBadgeIcon className="w-4 h-4 bg-white/20" />
          <span className="hidden sm:inline">Lien YouTube</span>
          <Edit3 className="w-3 h-3 text-red-200" />
        </button>

        {/* Bouton Réglage Visibilité du Fond */}
        <button
          type="button"
          onClick={() => {
            setBgOpacityLevel((prev) =>
              prev === 'vivid' ? 'cinema' : prev === 'cinema' ? 'subtle' : 'vivid'
            );
          }}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border backdrop-blur-md transition shadow text-xs font-semibold cursor-pointer ${
            bgOpacityLevel === 'cinema'
              ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              : bgOpacityLevel === 'vivid'
              ? 'bg-black/60 text-slate-200 border-slate-700/80 hover:border-slate-500'
              : 'bg-black/40 text-slate-400 border-slate-800'
          }`}
          title="Ajuster la visibilité de la vidéo en fond (Équilibré 75% • Éclatant 95% • Subtil 40%)"
        >
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">
            {bgOpacityLevel === 'cinema' ? 'Fond 95%' : bgOpacityLevel === 'vivid' ? 'Fond 75%' : 'Fond 40%'}
          </span>
        </button>

        {/* Bouton Plein Écran / Mode Cinéma */}
        {currentYoutubeId && (
          <button
            type="button"
            onClick={() => setIsCinemaMode(true)}
            className="p-2 rounded-xl bg-black/60 text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-500 backdrop-blur-md transition shadow cursor-pointer"
            title="Agrandir la vidéo YouTube (Plein écran avec son)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Bouton Mute / Unmute */}
        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          className={`p-2 rounded-xl backdrop-blur-md border transition shadow cursor-pointer ${
            !isMuted
              ? 'bg-retro-accent/30 text-retro-accent border-retro-accent shadow-[0_0_12px_rgba(0,242,254,0.3)]'
              : 'bg-black/60 text-slate-400 border-slate-700/80 hover:text-white'
          }`}
          title={isMuted ? 'Activer le son de la vidéo YouTube' : 'Couper le son'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Bouton Play / Pause */}
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className={`p-2 rounded-xl backdrop-blur-md border transition shadow cursor-pointer ${
            isPlaying
              ? 'bg-black/60 text-slate-300 border-slate-700/80 hover:text-white'
              : 'bg-amber-500/30 text-amber-300 border-amber-500/60'
          }`}
          title={isPlaying ? 'Mettre la vidéo en pause' : 'Lire la vidéo'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODALE DIALOGUE POUR DÉFINIR LE LIEN YOUTUBE DE LA FIRME                 */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 pointer-events-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header de la modale */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow">
                  <Play className="w-5 h-5 text-white fill-white translate-x-[1px]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Vidéo YouTube de {company.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Définissez la vidéo qui sera lue en fond de l'encadré
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulaire de saisie du lien YouTube */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block">
                Collez l'URL de votre vidéo YouTube ou son ID :
              </label>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <YouTubeBadgeIcon className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => {
                      setCustomInput(e.target.value);
                      if (inputError) setInputError(null);
                    }}
                    placeholder="https://www.youtube.com/watch?v=... ou ID"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleApplyYouTubeLink(customInput);
                      if (e.key === 'Escape') setIsModalOpen(false);
                    }}
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyYouTubeLink(customInput)}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition shadow flex items-center space-x-1.5 cursor-pointer shrink-0"
                >
                  <Check className="w-4 h-4" />
                  <span>Appliquer</span>
                </button>
              </div>

              {inputError && (
                <p className="text-xs text-red-400 font-semibold">{inputError}</p>
              )}

              {/* Aperçu direct en temps réel si un ID est détecté */}
              {liveDetectedId && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center space-x-1.5">
                    <Play className="w-3 h-3 text-red-500 fill-red-500" />
                    <span>Aperçu de la vidéo détectée ({liveDetectedId}) :</span>
                  </span>
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-700 bg-black shadow-xl">
                    <iframe
                      src={`https://www.youtube.com/embed/${liveDetectedId}?autoplay=1&mute=1&controls=1&rel=0`}
                      title="Aperçu YouTube en direct"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-400 leading-normal">
                Formats acceptés : <code className="text-slate-300 font-mono">youtube.com/watch?v=...</code>, <code className="text-slate-300 font-mono">youtu.be/...</code>, <code className="text-slate-300 font-mono">shorts/...</code> ou l'identifiant à 11 caractères.
              </p>
            </div>

            {/* Suggestions de vidéos cultes pour cette firme */}
            {DEFAULT_COMPANY_VIDEOS[company.id]?.suggestions && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Suggestions cultes pour {company.name} :
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {DEFAULT_COMPANY_VIDEOS[company.id]?.suggestions?.map((sug) => (
                    <button
                      key={sug.id}
                      type="button"
                      onClick={() => handleApplyYouTubeLink(sug.id)}
                      className="w-full p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-red-500 text-left flex items-center justify-between text-xs text-slate-200 transition group"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <Film className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="truncate">{sug.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2 group-hover:text-red-400">
                        Choisir ❯
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Boutons d'actions secondaires */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rétablir la vidéo d'archive officielle</span>
              </button>

              {currentYoutubeId && (
                <a
                  href={`https://www.youtube.com/watch?v=${currentYoutubeId}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center space-x-1 text-xs text-red-400 hover:text-red-300 font-semibold"
                >
                  <span>Ouvrir sur YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE CINÉMA (AGRANDI AVEC SON ET CONTRÔLES COMPLETS)                      */}
      {/* ========================================================================= */}
      {isCinemaMode && currentYoutubeId && (
        <div className="fixed inset-0 z-50 pointer-events-auto bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            {/* Header Cinema */}
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <YouTubeBadgeIcon className="w-6 h-6" />
                <div>
                  <h4 className="text-sm font-black text-white">
                    Vidéo d'époque {company.name}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Mode Cinéma RetroMad • {videoConfig.title || 'Vidéo YouTube'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCinemaMode(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lecteur Vidéo Plein Format */}
            <div className="relative w-full aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${currentYoutubeId}?autoplay=1&controls=1&rel=0`}
                title={`Vidéo ${company.name}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Footer Cinema */}
            <div className="px-6 py-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Appuyez sur Échap pour quitter le mode cinéma</span>
              <button
                type="button"
                onClick={() => setIsCinemaMode(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export interface CompanyTvWidgetProps {
  company: Company;
  className?: string;
}

/**
 * Widget Écran TV Rétro Dédié :
 * Affiche le lecteur YouTube directement dans un moniteur rétro CRT pour une visibilité immédiate et garantie.
 */
export const CompanyTvWidget: React.FC<CompanyTvWidgetProps> = ({
  company,
  className = '',
}) => {
  const [videoConfig, setVideoConfig] = useState(() => getCompanyVideoConfig(company.id));
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  useEffect(() => {
    setVideoConfig(getCompanyVideoConfig(company.id));
  }, [company.id]);

  const currentYoutubeId =
    extractYouTubeId(videoConfig.youtubeId || '') ||
    extractYouTubeId(company.youtubeId || '') ||
    DEFAULT_COMPANY_VIDEOS[company.id]?.youtubeId ||
    'x6aNPsjNwFo';

  const liveDetectedId = extractYouTubeId(customInput);

  const handleApplyYouTubeLink = (targetInput: string) => {
    const val = targetInput.trim();
    if (!val) {
      setInputError('Veuillez entrer un lien ou un ID YouTube.');
      return;
    }
    const detectedId = extractYouTubeId(val);
    if (detectedId) {
      const newConf = {
        youtubeId: detectedId,
        title: `Lien YouTube (${detectedId})`,
      };
      saveCompanyVideoConfig(company.id, newConf);
      setVideoConfig(newConf);
      setInputError(null);
      setIsModalOpen(false);
    } else {
      setInputError('Format non reconnu. Collez un lien YouTube valide.');
    }
  };

  const handleResetToDefault = () => {
    const defaultVal = DEFAULT_COMPANY_VIDEOS[company.id] || {
      youtubeId: 'x6aNPsjNwFo',
      title: 'Vidéo d\'archive officielle',
    };
    saveCompanyVideoConfig(company.id, defaultVal);
    setVideoConfig(defaultVal);
    setCustomInput('');
    setInputError(null);
    setIsModalOpen(false);
  };

  return (
    <div
      className={`relative bg-slate-950/95 border-2 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md flex flex-col ${className}`}
      style={{ borderColor: `${company.accentColor}88` }}
    >
      {/* Header Rétro TV */}
      <div className="flex items-center justify-between pb-1.5 px-1 border-b border-slate-800 text-[11px] text-slate-300">
        <div className="flex items-center space-x-1.5 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
          <Tv className="w-3.5 h-3.5 text-red-500" />
          <span className="text-white uppercase tracking-wider font-mono text-[10px]">Archive TV d'époque</span>
        </div>
        <div className="flex items-center space-x-1 text-slate-400 text-[10px]">
          <YouTubeBadgeIcon className="w-3 h-3" />
          <span className="truncate max-w-[110px]">{company.name}</span>
        </div>
      </div>

      {/* Cadre Cathodique 16:9 avec Vidéo YouTube */}
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden my-1.5 border border-slate-800 shadow-inner group">
        {isPlaying ? (
          <iframe
            src={`https://www.youtube.com/embed/${currentYoutubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=1&loop=1&playlist=${currentYoutubeId}&playsinline=1&rel=0`}
            title={`Vidéo TV de ${company.name}`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400">
            <Pause className="w-6 h-6 mb-1 text-slate-500" />
            <span className="text-[10px] font-mono">EN PAUSE</span>
          </div>
        )}
        <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />
      </div>

      {/* Barre d'outils TV */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
              !isMuted
                ? 'bg-retro-accent/20 text-retro-accent border-retro-accent/50 shadow'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title={isMuted ? 'Activer le son' : 'Couper le son'}
          >
            {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 border border-slate-800 hover:text-white transition text-xs cursor-pointer"
            title={isPlaying ? 'Pause' : 'Lecture'}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
          <button
            type="button"
            onClick={() => setIsCinemaMode(true)}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 border border-slate-800 hover:text-white transition text-xs cursor-pointer"
            title="Plein Écran Cinéma"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setCustomInput(currentYoutubeId ? `https://www.youtube.com/watch?v=${currentYoutubeId}` : '');
            setInputError(null);
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-red-600/90 hover:bg-red-600 text-white font-bold text-[10px] shadow transition cursor-pointer"
          title="Remplacer par un autre lien YouTube"
        >
          <Edit3 className="w-2.5 h-2.5" />
          <span>Lien YouTube</span>
        </button>
      </div>

      {/* Modale d'édition YouTube pour le widget TV */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 pointer-events-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow">
                  <Play className="w-5 h-5 text-white fill-white translate-x-[1px]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Vidéo YouTube • {company.name}</h3>
                  <p className="text-xs text-slate-400">Renseignez l'URL YouTube de votre choix</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block">
                Collez l'URL de votre vidéo YouTube ou son ID :
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => {
                    setCustomInput(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  placeholder="https://www.youtube.com/watch?v=... ou ID"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-red-500 font-mono"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleApplyYouTubeLink(customInput);
                    if (e.key === 'Escape') setIsModalOpen(false);
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => handleApplyYouTubeLink(customInput)}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition shadow flex items-center space-x-1.5 cursor-pointer shrink-0"
                >
                  <Check className="w-4 h-4" />
                  <span>Appliquer</span>
                </button>
              </div>

              {inputError && <p className="text-xs text-red-400 font-semibold">{inputError}</p>}

              {liveDetectedId && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center space-x-1.5">
                    <Play className="w-3 h-3 text-red-500 fill-red-500" />
                    <span>Aperçu immédiat de la vidéo ({liveDetectedId}) :</span>
                  </span>
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-700 bg-black shadow-lg">
                    <iframe
                      src={`https://www.youtube.com/embed/${liveDetectedId}?autoplay=1&mute=1&controls=1&rel=0`}
                      title="Aperçu YouTube immédiat"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </div>
              )}
            </div>

            {DEFAULT_COMPANY_VIDEOS[company.id]?.suggestions && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Suggestions officielles vérifiées :
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {DEFAULT_COMPANY_VIDEOS[company.id]?.suggestions?.map((sug) => (
                    <button
                      key={sug.id}
                      type="button"
                      onClick={() => handleApplyYouTubeLink(sug.id)}
                      className="w-full p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-red-500 text-left flex items-center justify-between text-xs text-slate-200 transition group"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <Film className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="truncate">{sug.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2 group-hover:text-red-400">
                        Choisir ❯
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rétablir vidéo d'époque d'origine</span>
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode Plein Écran Cinéma pour le Widget TV */}
      {isCinemaMode && currentYoutubeId && (
        <div className="fixed inset-0 z-50 pointer-events-auto bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <YouTubeBadgeIcon className="w-6 h-6" />
                <div>
                  <h4 className="text-sm font-black text-white">{company.name} • Archive Vidéo</h4>
                  <p className="text-[11px] text-slate-400">Lecture Plein Écran Retro TV</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCinemaMode(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative w-full aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${currentYoutubeId}?autoplay=1&controls=1&rel=0`}
                title={`Vidéo ${company.name}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="px-6 py-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Appuyez sur Échap pour fermer</span>
              <button
                type="button"
                onClick={() => setIsCinemaMode(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
