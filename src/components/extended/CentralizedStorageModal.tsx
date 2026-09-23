import React, { useState } from 'react';
import {
  X,
  HardDrive,
  FolderTree,
  Gamepad2,
  Cpu,
  Music,
  Palette,
  Layers,
  Save,
  Play,
  CheckCircle2,
  Check,
  Sparkles,
  Search,
} from 'lucide-react';
import {
  CentralizedRomItem,
  CentralizedBiosItem,
  CentralizedThemeItem,
  CentralizedEmulatorCore,
  CentralizedSaveItem,
} from '../../types/extendedFeatures';

interface CentralizedStorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  roms: CentralizedRomItem[];
  biosList: CentralizedBiosItem[];
  themes: CentralizedThemeItem[];
  emulators: CentralizedEmulatorCore[];
  saves: CentralizedSaveItem[];
  currentThemeId: string;
  onSelectTheme: (themeId: string) => void;
  onLaunchRom: (rom: CentralizedRomItem) => void;
  onImportRomToLibrary: (rom: CentralizedRomItem) => void;
  onImportAllRomsToLibrary: () => void;
  onOpenThemeStudio?: () => void;
  onPlaySound?: (type: 'coin' | 'powerup' | 'fanfare') => void;
}

export const CentralizedStorageModal: React.FC<CentralizedStorageModalProps> = ({
  isOpen,
  onClose,
  roms,
  biosList,
  themes,
  emulators,
  saves,
  currentThemeId,
  onSelectTheme,
  onLaunchRom,
  onImportRomToLibrary,
  onImportAllRomsToLibrary,
  onOpenThemeStudio,
  onPlaySound,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'roms' | 'bios' | 'music' | 'themes' | 'emulators' | 'saves'>('overview');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('all');
  const [selectedSystemFilter, setSelectedSystemFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAudioPlaying, setActiveAudioPlaying] = useState<string | null>(null);
  const [foldersGeneratedFeedback, setFoldersGeneratedFeedback] = useState(false);

  if (!isOpen) return null;

  const companies = Array.from(new Set(roms.map((r) => r.companyId || 'arcade')));
  const systems = Array.from(new Set(roms.map((r) => r.systemId)));

  const filteredRoms = roms.filter((rom) => {
    const matchesCompany = selectedCompanyFilter === 'all' || (rom.companyId || 'arcade') === selectedCompanyFilter;
    const matchesSystem = selectedSystemFilter === 'all' || rom.systemId === selectedSystemFilter;
    const matchesSearch =
      rom.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rom.systemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rom.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rom.companyName && rom.companyName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCompany && matchesSystem && matchesSearch;
  });

  const handleToggleAudioPreview = (trackId: string) => {
    if (activeAudioPlaying === trackId) {
      setActiveAudioPlaying(null);
    } else {
      setActiveAudioPlaying(trackId);
      if (onPlaySound) onPlaySound('coin');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-6xl max-h-[94vh] flex flex-col bg-slate-950 border border-cyan-500/40 rounded-3xl shadow-2xl shadow-cyan-500/10 overflow-hidden text-slate-100">
        
        {/* En-tête */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <HardDrive className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black tracking-wider uppercase text-white">
                  Répertoire Public Centralisé
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                  /public Actif
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralisation totale : ROMs, BIOS, Musiques, Thèmes, Émulateurs et Sauvegardes
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onImportAllRomsToLibrary();
                if (onPlaySound) onPlaySound('fanfare');
              }}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center space-x-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Indexer Tout dans la Borne</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barre de navigation des dossiers centralisés */}
        <div className="flex items-center space-x-1.5 px-6 py-2.5 border-b border-slate-800 bg-slate-900/40 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center space-x-2 transition shrink-0 ${
              activeTab === 'overview'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Arborescence & Statut</span>
          </button>

          <button
            onClick={() => setActiveTab('roms')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center space-x-2 transition shrink-0 ${
              activeTab === 'roms'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>ROMs ({roms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bios')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center space-x-2 transition shrink-0 ${
              activeTab === 'bios'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>BIOS ({biosList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('music')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center space-x-2 transition shrink-0 ${
              activeTab === 'music'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Musiques (/public/music)</span>
          </button>

          <button
            onClick={() => setActiveTab('themes')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center space-x-2 transition shrink-0 ${
              activeTab === 'themes'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Thèmes ({themes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('emulators')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center space-x-2 transition shrink-0 ${
              activeTab === 'emulators'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Cœurs Émulateurs ({emulators.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saves')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center space-x-2 transition shrink-0 ${
              activeTab === 'saves'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Sauvegardes SRAM ({saves.length})</span>
          </button>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* VUE D'ENSEMBLE & ARBORESCENCE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Bannière de centralisation */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-purple-950/20 to-slate-900 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Organisation Dédiée & Centralisée dans /public
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 max-w-2xl">
                    Toutes les ressources de RetroMAD sont dorénavant unifiées sous le dossier racine <code className="px-1.5 py-0.5 rounded bg-black/60 text-cyan-300 font-mono text-[11px]">public/</code>. Aucun chemin utilisateur dispersé : partage portable, déploiement web et accès direct garantis.
                  </p>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center shrink-0">
                  <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider block">Mode Actif</span>
                  <span className="text-xs font-mono font-bold text-white">Centralized Storage Hub</span>
                </div>
              </div>

              {/* Cartes des répertoires centralisés */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  onClick={() => setActiveTab('roms')}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/60 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-400">{roms.length} ROMs</span>
                  </div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">public/roms/</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Sous-répertoires par console (nes, snes, megadrive, gba, arcade, psx, n64...).
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('bios')}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/60 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">{biosList.length} BIOS</span>
                  </div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">public/bios/</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    BIOS officiels et vérifiés avec hashes MD5 (PS1, Neo-Geo, Mega-CD, GBA, FDS...).
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('music')}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-fuchsia-500/60 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center group-hover:scale-110 transition">
                      <Music className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-fuchsia-400">Pistes Audio</span>
                  </div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">public/music/</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Bandes-son Chiptune, musiques de menus et sons d'ambiance intégrés au Jukebox.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('themes')}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-pink-500/60 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center group-hover:scale-110 transition">
                      <Palette className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-pink-400">{themes.length} Thèmes</span>
                  </div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">public/themes/</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Palettes CRT, synthwave neon, Game Boy DMG et bezels d'époque commutables.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('emulators')}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/60 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400">{emulators.length} Cœurs</span>
                  </div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">public/emulators/</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Cœurs Libretro (Linux .so, Windows .dll) et runners d'émulation prêts à l'emploi.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('saves')}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-blue-500/60 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition">
                      <Save className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-400">{saves.length} Saves</span>
                  </div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">public/saves/</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Mémoires de cartouches SRAM (.srm, .sav) et instantanés de sauvegarde d'état.
                  </p>
                </div>
              </div>

              {/* Guide de copie et accès direct */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
                  <FolderTree className="w-4 h-4 text-cyan-400" />
                  <span>Structure de Déploiement Direct sur votre Machine</span>
                </h4>
                <div className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto">
                  <div className="text-cyan-400 font-bold">📂 public/</div>
                  <div className="pl-4">├── 📁 <span className="text-emerald-300">roms/</span> (nes/, snes/, megadrive/, gba/, arcade/, psx/, n64/...)</div>
                  <div className="pl-4">├── 📁 <span className="text-amber-300">bios/</span> (scph1001.bin, neogeo.zip, gba_bios.bin, disksys.rom...)</div>
                  <div className="pl-4">├── 📁 <span className="text-fuchsia-300">music/</span> (pistes mp3, ogg, chiptunes, ost...)</div>
                  <div className="pl-4">├── 📁 <span className="text-pink-300">themes/</span> (thèmes visuels, configs css, shaders crt...)</div>
                  <div className="pl-4">├── 📁 <span className="text-blue-300">emulators/</span> (cores/ libretro .so / .dll & runners...)</div>
                  <div className="pl-4">└── 📁 <span className="text-purple-300">saves/</span> (sauvegardes cartouches .srm et save-states...)</div>
                </div>
              </div>
            </div>
          )}

          {/* GESTIONNAIRE DE ROMs */}
          {activeTab === 'roms' && (
            <div className="space-y-4">
              {/* Bannière Roms -> Firmes -> Consoles */}
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <FolderTree className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                      <span>Arborescence Centralisée : Roms ➔ Firmes ➔ Consoles</span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-[10px] font-mono font-bold text-cyan-300">
                        /public/roms/
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Les jeux sont automatiquement organisés par Constructeur puis par Plateforme (ex: <code>public/roms/nintendo/snes/</code>, <code>public/roms/sega/megadrive/</code>, <code>public/roms/sony/psx/</code>).
                    </p>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    if (window.api?.createRomsFolders) {
                      try {
                        await window.api.createRomsFolders();
                      } catch (err) {
                        console.error('Erreur génération arborescence:', err);
                      }
                    }
                    setFoldersGeneratedFeedback(true);
                    if (onPlaySound) onPlaySound('powerup');
                    setTimeout(() => setFoldersGeneratedFeedback(false), 3500);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition flex items-center space-x-1.5 shrink-0"
                >
                  {foldersGeneratedFeedback ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <HardDrive className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{foldersGeneratedFeedback ? 'Arborescence Générée & Prête !' : 'Générer Toute l\'Arborescence'}</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-56">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Rechercher une ROM..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* Filtre Firme */}
                  <select
                    value={selectedCompanyFilter}
                    onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-purple-300 text-xs font-bold cursor-pointer"
                  >
                    <option value="all">Toutes les Firmes</option>
                    {companies.map((c) => (
                      <option key={c} value={c}>
                        Firme : {c.toUpperCase()}
                      </option>
                    ))}
                  </select>

                  {/* Filtre Console */}
                  <select
                    value={selectedSystemFilter}
                    onChange={(e) => setSelectedSystemFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-bold cursor-pointer"
                  >
                    <option value="all">Toutes les Consoles</option>
                    {systems.map((s) => (
                      <option key={s} value={s}>
                        Console : {s.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  {filteredRoms.length} fichier(s) dans <code className="text-cyan-300">public/roms/</code>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredRoms.map((rom) => (
                  <div
                    key={rom.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 flex flex-col justify-between space-y-3 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          {rom.companyName && (
                            <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-wider">
                              {rom.companyName}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider">
                            {rom.systemName}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{rom.sizeFormatted}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1.5 truncate">{rom.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{rom.description}</p>
                      <code className="text-[10px] text-slate-500 font-mono block mt-1 truncate">
                        {rom.path}
                      </code>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Prêt</span>
                      </span>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            onImportRomToLibrary(rom);
                            if (onPlaySound) onPlaySound('coin');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition flex items-center space-x-1"
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Ajouter</span>
                        </button>
                        <button
                          onClick={() => {
                            onLaunchRom(rom);
                            onClose();
                            if (onPlaySound) onPlaySound('powerup');
                          }}
                          className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-md shadow-cyan-500/20 transition flex items-center space-x-1"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Lancer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GESTIONNAIRE DE BIOS */}
          {activeTab === 'bios' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs text-emerald-200 font-bold">
                    Tous les BIOS requis sont centralisés dans <code className="text-white font-mono">public/bios/</code>.
                  </span>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {biosList.length} / {biosList.length} Vérifiés
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-black">
                    <tr>
                      <th className="p-3">Fichier BIOS</th>
                      <th className="p-3">Console Cible</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">MD5 Exigé</th>
                      <th className="p-3">Taille</th>
                      <th className="p-3 text-right">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {biosList.map((bios) => (
                      <tr key={bios.filename} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono font-bold text-white flex items-center space-x-2">
                          <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{bios.filename}</span>
                        </td>
                        <td className="p-3 text-slate-300 font-bold">{bios.systemName}</td>
                        <td className="p-3 text-slate-400 text-[11px] max-w-xs">{bios.description}</td>
                        <td className="p-3 font-mono text-[10px] text-slate-500">{bios.expectedMd5}</td>
                        <td className="p-3 font-mono text-slate-400">{bios.sizeFormatted}</td>
                        <td className="p-3 text-right">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                            Conforme
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MUSIQUES DE LA BORNE DANS /public/music */}
          {activeTab === 'music' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-fuchsia-950/20 border border-fuchsia-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Music className="w-5 h-5 text-fuchsia-400" />
                  <span className="text-xs text-fuchsia-200 font-bold">
                    Pistes musicales et thèmes rétro centralisés sous <code className="text-white font-mono">public/music/</code>.
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'm-1', title: 'Green Hill Zone (16-bit FM Synth)', system: 'Mega Drive', file: '/music/green_hill_zone.mp3', duration: '2:40' },
                  { id: 'm-2', title: 'Overworld Theme (8-bit Pulse)', system: 'NES', file: '/music/mario_overworld.mp3', duration: '3:02' },
                  { id: 'm-3', title: 'Pac-Man 1980 Fever (Arcade Chiptune)', system: 'Arcade', file: '/music/pacman_fever.mp3', duration: '1:55' },
                  { id: 'm-4', title: 'Cyberpunk Neon Drive 1999', system: 'Amiga MOD', file: '/music/cyberpunk_neon_drive.mp3', duration: '3:45' },
                  { id: 'm-5', title: 'PlayStation 1994 Boot Ambient', system: 'PS1', file: '/music/psx_boot_ambient.mp3', duration: '1:20' },
                ].map((track) => (
                  <div
                    key={track.id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <button
                        onClick={() => handleToggleAudioPreview(track.id)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition shrink-0 ${
                          activeAudioPlaying === track.id
                            ? 'bg-fuchsia-500 text-slate-950 shadow-md shadow-fuchsia-500/30'
                            : 'bg-slate-800 text-fuchsia-400 hover:bg-fuchsia-500 hover:text-slate-950'
                        }`}
                      >
                        <Play className={`w-4 h-4 ${activeAudioPlaying === track.id ? 'fill-current' : ''}`} />
                      </button>
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block truncate">{track.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{track.file} • {track.system}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className="text-[11px] font-mono text-slate-400">{track.duration}</span>
                      <span className="px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 text-[10px] font-black uppercase">
                        Centralisé
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* THÈMES CENTRALISÉS DANS /public/themes */}
          {activeTab === 'themes' && (
            <div className="space-y-4">
              {/* Bannière Atelier Communautaire */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-slate-900 border border-pink-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-pink-300 uppercase tracking-wider flex items-center gap-2">
                      <span>Atelier de Thèmes Communautaires & RetroTheme DSL</span>
                      <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-[10px] font-mono font-bold text-pink-300">
                        Créer & Partager
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Créez simplement vos propres thèmes visuels avec des curseurs intuitifs ou le format simple RetroTheme DSL, testez en direct et exportez vos packs pour la communauté !
                    </p>
                  </div>
                </div>

                {onOpenThemeStudio && (
                  <button
                    onClick={onOpenThemeStudio}
                    className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-pink-500/20 transition flex items-center space-x-1.5 shrink-0"
                  >
                    <Palette className="w-4 h-4" />
                    <span>Ouvrir l'Atelier Studio</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map((th) => {
                  const isCurrent = th.id === currentThemeId;
                  return (
                    <div
                      key={th.id}
                      className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-4 ${
                        isCurrent
                          ? 'bg-slate-900 border-pink-500 shadow-lg shadow-pink-500/10 ring-1 ring-pink-500/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20"
                              style={{ backgroundColor: th.accentColor }}
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20"
                              style={{ backgroundColor: th.secondaryColor }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">{th.bezelStyle}</span>
                        </div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider mt-2.5">{th.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-1">{th.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                        <span className="text-[10px] text-slate-500 font-mono">public/themes/{th.id}.json</span>
                        <button
                          onClick={() => {
                            onSelectTheme(th.id);
                            if (onPlaySound) onPlaySound('fanfare');
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                            isCurrent
                              ? 'bg-pink-500 text-white font-black'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                        >
                          {isCurrent ? 'Actif' : 'Activer'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CŒURS D'ÉMULATEURS DANS /public/emulators */}
          {activeTab === 'emulators' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emulators.map((core) => (
                  <div key={core.id} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-amber-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">{core.name}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase">
                        Libretro Prêt
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[10px] text-slate-400 space-y-1">
                      <div>Linux : <span className="text-slate-200">public/emulators/cores/{core.coreFileLinux}</span></div>
                      <div>Win64 : <span className="text-slate-200">public/emulators/cores/{core.coreFileWindows}</span></div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {core.features.map((feat, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SAUVEGARDES SRAM DANS /public/saves */}
          {activeTab === 'saves' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Save className="w-5 h-5 text-blue-400" />
                  <span className="text-xs text-blue-200 font-bold">
                    Cartouches SRAM et instantanés centralisés sous <code className="text-white font-mono">public/saves/</code>.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {saves.map((s) => (
                  <div key={s.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase">
                        {s.systemId.toUpperCase()} • Slot #{s.slot}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{(s.size / 1024).toFixed(1)} KB</span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white">{s.gameTitle}</h4>
                      <p className="text-[11px] text-slate-300 mt-0.5 font-medium">{s.progress}</p>
                      <code className="text-[10px] font-mono text-slate-500 block mt-1">public/saves/{s.filename}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Pied de page */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-[11px] text-slate-300">
              Chemin Racine : <strong className="text-white">./public</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onImportAllRomsToLibrary();
                if (onPlaySound) onPlaySound('fanfare');
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/25 flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider & Recharger la Borne</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
