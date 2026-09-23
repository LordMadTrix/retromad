import React from 'react';
import {
  Search,
  Tv,
  Projector,
  Sparkles,
  HardDrive,
  Palette,
  Trophy,
  Command,
  Gamepad2,
  Lock,
  Volume2,
  RefreshCw,
  QrCode,
  Upload,
  Flame,
  CheckCircle2,
  Play,
  Sliders,
} from 'lucide-react';
import { ManualSection } from '../../data/userManualData';

interface ManualScreenshotPreviewProps {
  section: ManualSection;
  activeCalloutId?: number | null;
  onSelectCallout?: (id: number) => void;
}

export const ManualScreenshotPreview: React.FC<ManualScreenshotPreviewProps> = ({
  section,
  activeCalloutId,
  onSelectCallout,
}) => {
  const isSelected = (id: number) => activeCalloutId === id;

  const CalloutBadge: React.FC<{ id: number; className?: string }> = ({ id, className = '' }) => (
    <button
      type="button"
      onClick={() => onSelectCallout && onSelectCallout(id)}
      className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shadow-lg transition-transform duration-200 z-30 cursor-pointer ${
        isSelected(id)
          ? 'bg-amber-400 text-slate-950 scale-125 ring-4 ring-amber-400/40 animate-pulse'
          : 'bg-retro-accent text-slate-950 hover:scale-110 hover:bg-white'
      } ${className}`}
      title={`Point d'intérêt #${id}`}
    >
      {id}
    </button>
  );

  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700/80 bg-slate-950 shadow-2xl print:border-slate-400 print:shadow-none print:break-inside-avoid">
      {/* Barre de fenêtre d'application simulée */}
      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono select-none print:bg-slate-200 print:text-slate-800">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="font-bold text-slate-300 ml-2 print:text-slate-900">
            RetroMAD v1.0.0 — {section.title}
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="hidden sm:inline px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 print:hidden">
            Aperçu Haute Définition
          </span>
          <span className="font-bold text-retro-accent print:text-slate-700 font-sans">
            Page {section.number}/10
          </span>
        </div>
      </div>

      {/* Rendu dynamique de la capture d'écran selon la section */}
      <div className="p-4 sm:p-6 bg-gradient-to-b from-slate-900/90 to-[#0b101e] min-h-[300px] flex flex-col justify-between relative overflow-hidden print:bg-white print:text-slate-900">
        
        {/* SCANLINES OVERLAY (subtile pour style arcade) */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40 print:hidden" />

        {/* ── 01: BIBLIOTHÈQUE PRINCIPALE ── */}
        {section.screenshotType === 'main_hub' && (
          <div className="space-y-4">
            {/* Header simulé */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 relative">
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3" />
                <div className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 text-xs text-slate-300 border border-slate-800 font-mono">
                  Super Mario World | 24 Jeux trouvés
                </div>
                <CalloutBadge id={1} className="absolute -top-3 left-1/3" />
              </div>
              <div className="flex items-center gap-1.5 relative">
                <div className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1">
                  <Tv className="w-3.5 h-3.5 text-cyan-400" />
                  <span>CRT ON</span>
                </div>
                <CalloutBadge id={3} className="absolute -top-3 right-20" />
                <div className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-bold flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan</span>
                </div>
                <CalloutBadge id={4} className="absolute -top-3 -right-2" />
              </div>
            </div>

            {/* Sélecteur de consoles */}
            <div className="relative p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="px-3 py-1 rounded-lg bg-retro-accent text-slate-950 font-bold">Tous (148)</span>
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold border border-slate-700">Super Nintendo (32)</span>
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold border border-slate-700">Megadrive (28)</span>
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold border border-slate-700">Arcade MAME (45)</span>
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold border border-slate-700">PlayStation (18)</span>
              <CalloutBadge id={2} className="absolute -top-3 left-1/2" />
            </div>

            {/* Grille de jeux */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                { title: 'Super Mario World', sys: 'SNES', col: 'from-amber-500 to-red-600', year: '1990' },
                { title: 'Sonic The Hedgehog 2', sys: 'MEGADRIVE', col: 'from-blue-500 to-indigo-600', year: '1992' },
                { title: 'Street Fighter II Turbo', sys: 'ARCADE', col: 'from-red-600 to-orange-500', year: '1993' },
                { title: 'Castlevania: Symphony', sys: 'PS1', col: 'from-purple-600 to-pink-600', year: '1997' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2.5 flex flex-col justify-between hover:border-retro-accent transition"
                >
                  <div className={`aspect-[4/3] rounded-lg bg-gradient-to-br ${item.col} p-3 flex flex-col justify-between text-white shadow-inner`}>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/60 w-fit font-bold">
                      {item.sys}
                    </span>
                    <span className="text-xs font-black drop-shadow">{item.title}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{item.year}</span>
                    <span className="text-green-400 font-bold">Prêt</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 02: MODE KIOSQUE & BORNE D'ARCADE ── */}
        {section.screenshotType === 'kiosk_arcade' && (
          <div className="space-y-4">
            {/* Header Kiosque */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-yellow-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-yellow-400 animate-pulse" />
                <span className="font-black text-sm tracking-wider text-yellow-300 font-mono">
                  RETROMAD ARCADE CABINET • MODE KIOSQUE
                </span>
                <CalloutBadge id={1} className="relative -top-2" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>PIN ACTIF</span>
                </span>
                <CalloutBadge id={4} className="relative -top-2" />
              </div>
            </div>

            {/* Carrousel Kiosque 10-foot */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-950 to-blue-950/40 border border-slate-800 flex items-center justify-center gap-4 relative py-8">
              <div className="w-24 h-32 rounded-lg bg-slate-800/60 opacity-40 border border-slate-700 hidden sm:flex items-center justify-center text-[10px] font-bold">
                Jeu Précédent
              </div>

              {/* Jeu Actif en grand */}
              <div className="w-48 sm:w-56 h-40 sm:h-44 rounded-2xl bg-gradient-to-br from-yellow-500 via-red-600 to-pink-600 p-4 border-2 border-yellow-400 shadow-[0_0_40px_rgba(234,179,8,0.4)] flex flex-col justify-between text-white relative scale-105">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-black/70 font-bold">ARCADE</span>
                  <span className="px-2 py-0.5 rounded bg-yellow-400 text-slate-950 font-black">SÉLECTIONNÉ</span>
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black leading-tight drop-shadow-md">
                    METAL SLUG X
                  </h4>
                  <p className="text-[10px] text-yellow-200 mt-0.5">SNK Neo-Geo • 2 Joueurs</p>
                </div>
                <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[11px] font-bold">
                  <span>Appuyez sur A pour Jouer</span>
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
                <CalloutBadge id={2} className="absolute -top-3 left-1/2 -translate-x-1/2" />
              </div>

              <div className="w-24 h-32 rounded-lg bg-slate-800/60 opacity-40 border border-slate-700 hidden sm:flex items-center justify-center text-[10px] font-bold">
                Jeu Suivant
              </div>
            </div>

            {/* Fiche synthétique */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs relative">
              <div className="flex items-center space-x-4 text-slate-300 font-mono text-[11px]">
                <span>1-2 Joueurs</span>
                <span>•</span>
                <span>Action / Run & Gun</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">★ 4.9/5</span>
              </div>
              <span className="text-[10px] text-slate-400">Contrôle : Manette & Joystick</span>
              <CalloutBadge id={3} className="absolute -top-3 right-1/4" />
            </div>
          </div>
        )}

        {/* ── 03: DOUBLE ÉCRAN & RÉTROPROJECTEUR ── */}
        {section.screenshotType === 'projector_dual' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Écran 1 : PC Régie */}
              <div className="p-4 rounded-xl bg-slate-900 border border-purple-500/40 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Tv className="w-4 h-4 text-purple-400" />
                    Écran 1 (Votre PC - Console Régie)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                    MAÎTRE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Vous cherchez des ROMs, réglez les manettes et surveillez les scores sans perturber le public.
                </p>
                <div className="p-2 bg-black/60 rounded border border-slate-800 text-[10px] font-mono text-slate-300 space-y-1">
                  <div>Statut Régie : Opérationnelle</div>
                  <div>Contrôle : Souris & Raccourcis</div>
                </div>
                <CalloutBadge id={1} className="absolute -top-3 left-4" />
              </div>

              {/* Écran 2 : Rétroprojecteur */}
              <div className="p-4 rounded-xl bg-slate-900 border-2 border-cyan-500/60 relative shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Projector className="w-4 h-4 text-cyan-400 animate-pulse" />
                    Écran 2 (Rétroprojecteur Salle)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                    SPECTATEURS
                  </span>
                </div>
                {/* Toile simulée avec keystone */}
                <div className="aspect-[16/9] bg-black rounded-lg border border-cyan-500/40 p-2 flex flex-col justify-between text-center transform perspective-500">
                  <div className="text-[9px] font-mono text-cyan-400 font-bold">RETROMAD GRAND ÉCRAN</div>
                  <div className="text-xs font-black text-white my-auto">STREET FIGHTER II TURBO</div>
                  <div className="text-[8px] font-mono bg-cyan-950 text-cyan-300 py-0.5 truncate">
                    ★ SALLE D'ARCADE RETROMAD • TOURNOI EN COURS ★
                  </div>
                </div>
                <CalloutBadge id={2} className="absolute -top-3 right-4" />
              </div>
            </div>

            {/* Barre de réglages Keystone */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs relative">
              <div className="flex items-center space-x-3 text-slate-300">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Format : <strong>16:9 Cinéma</strong></span>
                <span>•</span>
                <span>Keystone Trapèze : <strong>0°</strong></span>
                <span>•</span>
                <span>Contraste : <strong>115%</strong></span>
              </div>
              <CalloutBadge id={3} className="absolute -top-3 left-1/3" />
              <div className="text-[11px] font-mono text-cyan-300 bg-cyan-950 px-2 py-1 rounded border border-cyan-800">
                Bandeau Défilant Actif
              </div>
              <CalloutBadge id={4} className="absolute -top-3 right-4" />
            </div>
          </div>
        )}

        {/* ── 04: ATTRACT MODE 3D ── */}
        {section.screenshotType === 'attract_mode' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-950 border border-pink-500/40 flex flex-col items-center justify-center py-8 relative">
              {/* Boîte de jeu 3D stylisée */}
              <div className="w-44 h-56 rounded-xl bg-gradient-to-tr from-pink-600 via-purple-600 to-cyan-500 p-4 border-2 border-white/40 shadow-[0_15px_40px_rgba(236,72,153,0.4)] transform rotate-6 hover:rotate-0 transition-transform duration-300 flex flex-col justify-between text-white relative">
                <div className="flex justify-between text-[10px] font-mono font-bold">
                  <span>SNES 16-BIT</span>
                  <span>USA/EUR</span>
                </div>
                <div className="my-auto text-center">
                  <div className="text-sm font-black drop-shadow">CHRONO TRIGGER</div>
                  <div className="text-[9px] text-pink-200 mt-1">Square Soft • 1995</div>
                </div>
                <div className="text-[9px] font-mono text-center bg-black/60 py-1 rounded">
                  Fiche & Boîte 3D Rétro
                </div>
                <CalloutBadge id={1} className="absolute -top-3 -right-3" />
              </div>

              {/* Insérer pièce */}
              <div className="mt-5 flex items-center space-x-3 relative">
                <div className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg animate-bounce">
                  <span>INSERT COIN (C)</span>
                  <span className="px-1.5 py-0.5 rounded bg-black text-amber-400 font-mono text-[10px]">
                    2 Crédits
                  </span>
                </div>
                <CalloutBadge id={2} className="absolute -top-3 -left-4" />
              </div>
            </div>

            {/* Trivia banner */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs relative">
              <div className="flex items-center space-x-2 text-slate-300">
                <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
                <span className="text-[11px] line-clamp-1">
                  <strong>Le Saviez-vous ?</strong> Akira Toriyama (Dragon Ball) a personnellement dessiné tous les personnages de Chrono Trigger !
                </span>
              </div>
              <CalloutBadge id={3} className="absolute -top-3 left-1/4" />
              <button className="px-3 py-1 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shrink-0 ml-2">
                Jouer Direct (Espace)
              </button>
              <CalloutBadge id={4} className="absolute -top-3 right-4" />
            </div>
          </div>
        )}

        {/* ── 05: PASSERELLE RÉSEAU LAN & FTP ── */}
        {section.screenshotType === 'lan_server' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Adresse Web & QR Code */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/40 flex flex-col items-center text-center relative">
                <div className="w-20 h-20 bg-white rounded-lg p-1 flex items-center justify-center shadow">
                  <QrCode className="w-16 h-16 text-slate-950" />
                </div>
                <div className="text-xs font-mono font-bold text-cyan-300 mt-2">
                  http://192.168.1.45:8080
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">Scannez avec un mobile</span>
                <CalloutBadge id={1} className="absolute -top-3 left-4" />
              </div>

              {/* Zone de Glisser-Déposer */}
              <div className="p-4 rounded-xl bg-slate-900/90 border-2 border-dashed border-cyan-500/50 flex flex-col items-center justify-center text-center relative">
                <Upload className="w-8 h-8 text-cyan-400 animate-bounce mb-1" />
                <div className="text-xs font-bold text-white">Glissez vos ROMs ici</div>
                <span className="text-[10px] text-slate-400 mt-0.5">.zip, .sfc, .md, .bin, .iso</span>
                <CalloutBadge id={2} className="absolute -top-3 left-1/2 -translate-x-1/2" />
              </div>

              {/* Serveur FTP & WebDAV */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between text-xs font-mono relative">
                <div>
                  <div className="font-bold text-white mb-1">Serveur FTP & WebDAV</div>
                  <div className="text-[11px] text-purple-300">Port FTP : 2121</div>
                  <div className="text-[11px] text-purple-300">Port WebDAV : 8081</div>
                </div>
                <div className="p-1.5 bg-black/60 rounded border border-slate-800 text-[10px] text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>En ligne & Sécurisé</span>
                </div>
                <CalloutBadge id={3} className="absolute -top-3 right-4" />
              </div>
            </div>

            {/* Journal des transferts */}
            <div className="p-3 rounded-xl bg-black/70 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1 relative">
              <div className="text-cyan-400 font-bold border-b border-slate-800 pb-1 flex justify-between">
                <span>Journal des Transferts Réseau (Temps Réel)</span>
                <span className="text-slate-500">2.4 Mo/s</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>[18:42] Mario_Kart_64.z64 téléversé avec succès</span>
                <span className="text-green-400">12.8 Mo</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>[18:41] Zelda_Link_To_Past.sfc classé dans /snes</span>
                <span className="text-green-400">2.0 Mo</span>
              </div>
              <CalloutBadge id={4} className="absolute -top-3 right-8" />
            </div>
          </div>
        )}

        {/* ── 06: CARNET DE MOTS DE PASSE & TESTS ── */}
        {section.screenshotType === 'password_notebook' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Feuille de carnet de notes */}
              <div className="p-4 rounded-xl bg-amber-50 text-slate-900 border-2 border-amber-300 font-mono shadow-md relative">
                <div className="flex justify-between items-center border-b border-amber-300 pb-1 mb-2">
                  <span className="font-bold text-xs">CARNET DE MOTS DE PASSE #1</span>
                  <span className="text-[10px] text-amber-800">Joypad '92</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="font-black text-red-700">METROID (NES) :</div>
                    <code className="bg-amber-100 px-2 py-0.5 rounded font-black tracking-widest text-[11px] block border border-amber-300">
                      JUSTIN BAILEY ------ ------
                    </code>
                    <span className="text-[10px] text-slate-600">Samus sans armure & tous les missiles</span>
                  </div>
                  <div>
                    <div className="font-black text-blue-800">KONAMI CODE (UNIVERSEL) :</div>
                    <code className="bg-amber-100 px-2 py-0.5 rounded font-black tracking-widest text-[11px] block border border-amber-300">
                      ↑ ↑ ↓ ↓ ← → ← → B A
                    </code>
                    <span className="text-[10px] text-slate-600">30 vies sur Contra & Gradius</span>
                  </div>
                </div>
                <CalloutBadge id={1} className="absolute -top-3 left-4" />
                <CalloutBadge id={2} className="absolute -top-3 right-4" />
              </div>

              {/* Fiche Magazine d'époque */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between relative">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-white">Avis Rétro Magazine</span>
                    <span className="px-2 py-0.5 rounded bg-yellow-400 text-slate-950 font-black text-[10px]">
                      MEGA HIT ★ 96%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 italic mb-2">
                    « Une claque visuelle absolue sur Mega Drive. Les musiques de Yuzo Koshiro restent gravées à jamais. »
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono">
                    <div className="p-1 rounded bg-slate-800 text-slate-300">Graph: 19/20</div>
                    <div className="p-1 rounded bg-slate-800 text-slate-300">Son: 20/20</div>
                    <div className="p-1 rounded bg-slate-800 text-slate-300">Anim: 18/20</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400 mt-2">
                  <span>Mémoire VMU : Slot 1 Actif</span>
                  <button className="px-2 py-0.5 rounded bg-slate-800 text-white font-bold">Copier Code</button>
                </div>
                <CalloutBadge id={3} className="absolute -top-3 left-1/3" />
                <CalloutBadge id={4} className="absolute -top-3 right-4" />
              </div>
            </div>
          </div>
        )}

        {/* ── 07: DOSSIER CENTRALISÉ /public & BIOS ── */}
        {section.screenshotType === 'centralized_storage' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Arborescence /public */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/40 font-mono text-xs text-slate-300 relative">
                <div className="font-bold text-cyan-300 border-b border-slate-800 pb-1 mb-2 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  <span>Dossier /public (Arborescence)</span>
                </div>
                <ul className="space-y-1 text-[11px]">
                  <li>📁 /public/roms/ (snes, megadrive, ps1...)</li>
                  <li>📁 /public/bios/ (scph1001, neogeo.zip...)</li>
                  <li>📁 /public/music/ (chiptune bgm .mp3)</li>
                  <li>📁 /public/themes/ (styles & bezels)</li>
                  <li>📁 /public/saves/ (sauvegardes d'états)</li>
                </ul>
                <CalloutBadge id={1} className="absolute -top-3 left-4" />
              </div>

              {/* État des BIOS */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between text-xs relative">
                <div>
                  <div className="font-bold text-white mb-2 flex justify-between">
                    <span>Vérification des BIOS</span>
                    <span className="text-green-400 font-mono">100% OK</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center p-1 rounded bg-black/40">
                      <span>scph1001.bin (PlayStation)</span>
                      <span className="text-green-400">✓ MD5 Valide</span>
                    </div>
                    <div className="flex justify-between items-center p-1 rounded bg-black/40">
                      <span>neogeo.zip (Arcade MVS)</span>
                      <span className="text-green-400">✓ Présent</span>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                  <span>Espace Libre : 412 Go</span>
                  <button className="px-2 py-1 rounded bg-cyan-600 text-white font-bold">Sauvegarder Tout</button>
                </div>
                <CalloutBadge id={2} className="absolute -top-3 right-4" />
                <CalloutBadge id={3} className="absolute -bottom-3 left-1/3" />
                <CalloutBadge id={4} className="absolute -bottom-3 right-4" />
              </div>
            </div>
          </div>
        )}

        {/* ── 08: THEMES & JUKEBOX ── */}
        {section.screenshotType === 'theme_jukebox' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mini-Lecteur Jukebox */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/70 to-slate-900 border border-purple-500/40 relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-purple-400" />
                    Jukebox Rétro Flottant
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                    128 kbps Chiptune
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800 flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs font-bold text-white">Castlevania - Vampire Killer</div>
                    <div className="text-[10px] text-slate-400">Konami Sound Team • 02:45</div>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-1 h-4 bg-purple-400 animate-pulse" />
                    <div className="w-1 h-6 bg-purple-400 animate-pulse delay-75" />
                    <div className="w-1 h-3 bg-purple-400 animate-pulse delay-150" />
                  </div>
                </div>
                <CalloutBadge id={1} className="absolute -top-3 left-4" />
              </div>

              {/* Studio de Thèmes */}
              <div className="p-4 rounded-xl bg-slate-900 border border-pink-500/40 flex flex-col justify-between relative">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-pink-400" />
                      Studio Thèmes
                    </span>
                    <span className="text-[10px] text-pink-300 font-mono">Temps Réel</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                    <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-400 text-cyan-300">
                      Cyberpunk
                    </div>
                    <div className="p-2 rounded-lg bg-yellow-950 border border-yellow-400 text-yellow-300">
                      Arcade '84
                    </div>
                    <div className="p-2 rounded-lg bg-green-950 border border-green-400 text-green-300">
                      Game Boy
                    </div>
                  </div>
                </div>
                <CalloutBadge id={2} className="absolute -top-3 right-4" />
                <CalloutBadge id={3} className="absolute -bottom-3 left-1/3" />
                <CalloutBadge id={4} className="absolute -bottom-3 right-4" />
              </div>
            </div>
          </div>
        )}

        {/* ── 09: TRICHE & TOURNOIS ── */}
        {section.screenshotType === 'cheats_tournaments' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Arbre de Tournoi */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/40 relative">
                <div className="text-xs font-bold text-amber-300 mb-2 flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Arbre de Tournoi Arcade (8 Joueurs)
                </div>
                <div className="space-y-1.5 text-[10px] font-mono">
                  <div className="p-1 rounded bg-black/60 border border-slate-800 flex justify-between">
                    <span className="text-white font-bold">Quart #1 : Sébastien vs Marc</span>
                    <span className="text-amber-400">Gagnant : Sébastien</span>
                  </div>
                  <div className="p-1 rounded bg-black/60 border border-slate-800 flex justify-between">
                    <span className="text-white font-bold">Quart #2 : Alex vs Julien</span>
                    <span className="text-amber-400">Gagnant : Alex</span>
                  </div>
                  <div className="p-1 rounded bg-amber-500/20 border border-amber-500/50 flex justify-between text-amber-200 font-bold">
                    <span>Demi-Finale : Sébastien vs Alex</span>
                    <span>En attente...</span>
                  </div>
                </div>
                <CalloutBadge id={1} className="absolute -top-3 left-4" />
              </div>

              {/* Triche & Sauvegardes */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between text-xs relative">
                <div>
                  <div className="font-bold text-white mb-2">Triche & Save States (F2 / F4)</div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between items-center p-1 rounded bg-black/50">
                      <span>Vies Infinies (Action Replay)</span>
                      <span className="text-green-400 font-bold font-mono">ACTIF</span>
                    </div>
                    <div className="flex justify-between items-center p-1 rounded bg-black/50">
                      <span>Toutes les armes débloquées</span>
                      <span className="text-green-400 font-bold font-mono">ACTIF</span>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                  <span>Slot #1 : Boss Final</span>
                  <button className="px-2 py-0.5 rounded bg-purple-600 text-white font-bold">Lancer Roulette</button>
                </div>
                <CalloutBadge id={2} className="absolute -top-3 right-4" />
                <CalloutBadge id={3} className="absolute -bottom-3 left-1/3" />
                <CalloutBadge id={4} className="absolute -bottom-3 right-4" />
              </div>
            </div>
          </div>
        )}

        {/* ── 10: RACCOURCIS CLAVIER & MANETTES ── */}
        {section.screenshotType === 'shortcuts_cheatsheet' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Clavier */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs relative">
                <div className="font-bold text-retro-accent mb-2 flex items-center gap-1.5">
                  <Command className="w-4 h-4" />
                  <span>Raccourcis Clavier Principaux</span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between border-b border-slate-800 py-0.5">
                    <span className="text-white font-bold">F1</span>
                    <span className="text-slate-400">Ouvrir ce Guide Manuel PDF</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 py-0.5">
                    <span className="text-white font-bold">F11</span>
                    <span className="text-slate-400">Plein Écran / Kiosque</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 py-0.5">
                    <span className="text-white font-bold">Entrée / Espace</span>
                    <span className="text-slate-400">Lancer la partie</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-white font-bold">Échap</span>
                    <span className="text-slate-400">Retour / Menu Admin</span>
                  </div>
                </div>
                <CalloutBadge id={1} className="absolute -top-3 left-4" />
              </div>

              {/* Manette */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs relative">
                <div className="font-bold text-yellow-400 mb-2 flex items-center gap-1.5">
                  <Gamepad2 className="w-4 h-4" />
                  <span>Combinaisons Manettes Hotkey</span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between border-b border-slate-800 py-0.5">
                    <span className="text-yellow-300 font-bold">Select + Start</span>
                    <span className="text-slate-400">Quitter le jeu immédiatement</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 py-0.5">
                    <span className="text-yellow-300 font-bold">Select + X</span>
                    <span className="text-slate-400">Menu RetroArch / Configuration</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 py-0.5">
                    <span className="text-yellow-300 font-bold">Select + R1</span>
                    <span className="text-slate-400">Sauvegarde rapide (Save State)</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-yellow-300 font-bold">Select + L1</span>
                    <span className="text-slate-400">Chargement rapide (Load State)</span>
                  </div>
                </div>
                <CalloutBadge id={2} className="absolute -top-3 right-4" />
                <CalloutBadge id={3} className="absolute -bottom-3 right-1/4" />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
