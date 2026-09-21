import React, { useState } from 'react';
import { AppSettings, EmulatorProfile } from '../types';
import {
  X,
  Folder,
  Save,
  Check,
  Terminal,
  Sparkles,
  Lock,
  CheckCircle2,
  Settings,
  DownloadCloud,
  Tv,
  Volume2,
} from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

interface SettingsModalProps {
  settings: AppSettings;
  emulators?: EmulatorProfile[];
  onClose: () => void;
  onSave: (newSettings: Partial<AppSettings>) => void;
  onSelectDirectory: () => Promise<string | null>;
  onOpenExtensions?: () => void;
}

type SettingsTab = 'storage' | 'emulators' | 'scraper' | 'kiosk' | 'appearance';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  emulators = [],
  onClose,
  onSave,
  onSelectDirectory,
  onOpenExtensions,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<SettingsTab>('storage');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const {
    playMove,
    playSelect,
    playLaunch,
    playCoin,
    playFavorite,
    playUnlock,
    playDice,
  } = useAudio(formData.soundEnabled, formData.soundVolume ?? 0.8);

  const handlePickRomsDir = async () => {
    const dir = await onSelectDirectory();
    if (dir) {
      setFormData((prev) => ({ ...prev, romsDir: dir }));
    }
  };

  const handlePickBiosDir = async () => {
    const dir = await onSelectDirectory();
    if (dir) {
      setFormData((prev) => ({ ...prev, biosDir: dir }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[88vh] h-[640px] bg-retro-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* En-tête épinglé */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-retro-800/80 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-retro-accent/20 border border-retro-accent/40 flex items-center justify-center text-retro-accent shadow-neon">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Paramètres de Configuration
              </h2>
              <span className="text-[10px] text-slate-400 block -mt-0.5">
                RetroMad • Gestionnaire Système & Émulateurs
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-700/60 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barre des onglets de configuration */}
        <div className="px-6 py-2.5 bg-retro-900/90 border-b border-slate-800 flex items-center space-x-2 shrink-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'storage'
                ? 'bg-retro-accent/20 text-retro-accent border border-retro-accent/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>1. Stockage & ROMs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('emulators')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'emulators'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>2. Émulateurs & Lanceurs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scraper')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'scraper'
                ? 'bg-retro-pink/20 text-retro-pink border border-retro-pink/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>3. Scraper & Jaquettes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kiosk')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'kiosk'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>4. Mode Kiosk & Sécurité</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'appearance'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>5. Apparence & Audio</span>
          </button>
        </div>

        {/* Corps du Formulaire avec Défilement Assuré */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ONGLET 1: STOCKAGE */}
          {activeTab === 'storage' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center space-x-2 text-retro-accent mb-2">
                <Folder className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-wider">
                  Emplacements de vos jeux et firmwares
                </h3>
              </div>

              {/* Dossier ROMs */}
              <div className="p-4 rounded-2xl bg-retro-800/50 border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-200 block">
                  Dossier racine des ROMs :
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={formData.romsDir}
                    onChange={(e) => setFormData({ ...formData, romsDir: e.target.value })}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-retro-accent"
                    placeholder="/chemin/vers/vos/roms"
                  />
                  <button
                    type="button"
                    onClick={handlePickRomsDir}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition"
                  >
                    Parcourir...
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Organisez vos ROMs par sous-dossiers de consoles (ex: <code className="text-retro-accent">snes/</code>, <code className="text-retro-accent">megadrive/</code>, <code className="text-retro-accent">psx/</code>, <code className="text-retro-accent">n64/</code>).
                </p>
              </div>

              {/* Dossier BIOS */}
              <div className="p-4 rounded-2xl bg-retro-800/50 border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-200 block">
                  Dossier des BIOS & Firmwares :
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={formData.biosDir}
                    onChange={(e) => setFormData({ ...formData, biosDir: e.target.value })}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-retro-accent"
                    placeholder="/chemin/vers/vos/bios"
                  />
                  <button
                    type="button"
                    onClick={handlePickBiosDir}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition"
                  >
                    Parcourir...
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Contient vos dumps de bios originaux (<code className="text-retro-accent">scph5501.bin</code>, <code className="text-retro-accent">neogeo.zip</code>, <code className="text-retro-accent">dc_boot.bin</code>).
                </p>
              </div>
            </div>
          )}

          {/* ONGLET 2: ÉMULATEURS */}
          {activeTab === 'emulators' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                <Terminal className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-wider">
                  Configuration RetroArch & Détection des Émulateurs
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-retro-800/50 border border-slate-800 space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Exécutable RetroArch :
                  </label>
                  <input
                    type="text"
                    value={formData.retroarchPath}
                    onChange={(e) => setFormData({ ...formData, retroarchPath: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                    placeholder="/usr/bin/retroarch ou C:\RetroArch-Win64\retroarch.exe"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Dossier des cœurs Libretro (.so / .dll) :
                  </label>
                  <input
                    type="text"
                    value={formData.retroarchCoresDir}
                    onChange={(e) => setFormData({ ...formData, retroarchCoresDir: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                    placeholder="~/.config/retroarch/cores"
                  />
                </div>

                {onOpenExtensions && (
                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Extensions & Cœurs Libretro</span>
                      <span className="text-[11px] text-slate-400 block">Télécharger automatiquement tous les moteurs d'émulation officiels</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenExtensions();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold transition flex items-center space-x-2"
                    >
                      <DownloadCloud className="w-3.5 h-3.5" />
                      <span>Gérer les Extensions</span>
                    </button>
                  </div>
                )}
              </div>

              {/* État des émulateurs détectés */}
              {emulators.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">
                    Émulateurs reconnus sur votre machine :
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {emulators.map((emu) => (
                      <div
                        key={emu.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                          emu.isDetected
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-slate-800/40 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <span className="font-bold text-slate-200 block truncate">{emu.name}</span>
                          <span className="text-[10px] text-slate-500 truncate block font-mono">
                            {emu.detectedPath || (emu.isDetected ? 'Détecté dans PATH' : 'Non installé')}
                          </span>
                        </div>
                        {emu.isDetected ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center space-x-1 shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Prêt</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-500 text-[10px] font-bold shrink-0">
                            Absent
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ONGLET 3: SCRAPER */}
          {activeTab === 'scraper' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center space-x-2 text-retro-pink mb-2">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-wider">
                  Moteur de récupération des médias & jaquettes
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-retro-800/50 border border-slate-800 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Source de scraping :
                  </label>
                  <select
                    value={formData.scraperSource}
                    onChange={(e) => setFormData({ ...formData, scraperSource: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="both">Combiné (Libretro CDN + ScreenScraper)</option>
                    <option value="libretro">Libretro CDN seul (Instantané & Gratuit)</option>
                    <option value="screenscraper">ScreenScraper.fr seul</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-retro-800/50 border border-slate-800 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Langue des résumés :
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="fr">Français (Prioritaire)</option>
                    <option value="en">Anglais</option>
                  </select>
                </div>
              </div>

              {/* Compte ScreenScraper */}
              <div className="p-4 rounded-2xl bg-retro-800/50 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-200 block">
                  Identifiants ScreenScraper.fr (Optionnel - Pour résumés et boîtes 3D)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={formData.screenScraperUser || ''}
                    onChange={(e) => setFormData({ ...formData, screenScraperUser: e.target.value })}
                    placeholder="Nom d'utilisateur ScreenScraper"
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                  <input
                    type="password"
                    value={formData.screenScraperPassword || ''}
                    onChange={(e) => setFormData({ ...formData, screenScraperPassword: e.target.value })}
                    placeholder="Mot de passe ScreenScraper"
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 4: KIOSK & SÉCURITÉ */}
          {activeTab === 'kiosk' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center space-x-2 text-amber-400 mb-2">
                <Lock className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-wider">
                  Verrouillage Borne d'Arcade & Code PIN
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Démarrer en Mode Kiosk</span>
                    <span className="text-[11px] text-slate-400 block">
                      Verrouille automatiquement l'interface au lancement de l'application.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.kioskMode}
                    onChange={(e) => setFormData({ ...formData, kioskMode: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Forcer le plein écran en Kiosk</span>
                    <span className="text-[11px] text-slate-400 block">
                      Supprime les bordures de fenêtre pour une immersion borne totale.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.kioskFullscreen}
                    onChange={(e) => setFormData({ ...formData, kioskFullscreen: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Kiosk : Favoris uniquement</span>
                    <span className="text-[11px] text-slate-400 block">
                      Masque les jeux non favoris pour restreindre la sélection aux titres approuvés.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.kioskOnlyFavorites}
                    onChange={(e) => setFormData({ ...formData, kioskOnlyFavorites: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                <div className="pt-2 border-t border-amber-500/20">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Code PIN d'administration (4 à 6 chiffres) :
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="password"
                      maxLength={6}
                      value={formData.kioskPin}
                      onChange={(e) => setFormData({ ...formData, kioskPin: e.target.value.replace(/\D/g, '') })}
                      className="w-40 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono tracking-widest focus:outline-none focus:border-amber-400"
                      placeholder="1234"
                    />
                    <span className="text-[11px] text-slate-400">Par défaut : 1234</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 5: APPARENCE & AUDIO */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center space-x-2 text-purple-400 mb-2">
                <Tv className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Immersion Rétro CRT & Effets Audio
                </h3>
              </div>

              {/* Section Filtre CRT Cathodique */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      Filtre Écran CRT (Scanlines & Phosphore)
                    </span>
                    <span className="text-[11px] text-slate-400 block max-w-lg mt-0.5">
                      Simule les lignes de balayage cathodiques (15kHz), la lueur phosphore et la vignette des écrans arcade et moniteurs Trinitron.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!formData.crtEffect}
                    onChange={(e) => setFormData({ ...formData, crtEffect: e.target.checked })}
                    className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Section Audio & Volume */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      Effets Sonores Rétro 8-Bit (Synthétiseur Web Audio)
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Bruitages de curseur, validation, retour, monnayeur arcade et lancement.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.soundEnabled}
                    onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
                    className="w-4 h-4 accent-retro-accent rounded cursor-pointer"
                  />
                </div>

                {formData.soundEnabled && (
                  <div className="pt-3 border-t border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-retro-accent" />
                        <span>Volume des bruitages :</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-retro-accent">
                        {Math.round((formData.soundVolume ?? 0.8) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={formData.soundVolume ?? 0.8}
                      onChange={(e) => setFormData({ ...formData, soundVolume: parseFloat(e.target.value) })}
                      className="w-full accent-retro-accent cursor-pointer"
                    />

                    {/* Banc de test audio */}
                    <div className="pt-3">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2">
                        Tester les bruitages en direct :
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={playMove}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 font-semibold"
                        >
                          ▶ Curseur
                        </button>
                        <button
                          type="button"
                          onClick={playSelect}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 font-semibold"
                        >
                          ▶ Validation
                        </button>
                        <button
                          type="button"
                          onClick={playCoin}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-[11px] text-amber-300 font-bold"
                        >
                          🪙 Insert Coin
                        </button>
                        <button
                          type="button"
                          onClick={playFavorite}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-[11px] text-emerald-300 font-bold"
                        >
                          ⭐ Étoile
                        </button>
                        <button
                          type="button"
                          onClick={playUnlock}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-[11px] text-cyan-300 font-bold"
                        >
                          🎺 Fanfare
                        </button>
                        <button
                          type="button"
                          onClick={playDice}
                          className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-[11px] text-purple-300 font-bold"
                        >
                          🎲 Tirage
                        </button>
                        <button
                          type="button"
                          onClick={playLaunch}
                          className="px-2.5 py-1 rounded-lg bg-retro-accent/20 hover:bg-retro-accent/30 border border-retro-accent/40 text-[11px] text-retro-accent font-bold"
                        >
                          🚀 Lancement
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Thème Graphique */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <span className="text-xs font-bold text-slate-200 block">
                  Thème Graphique de l'Interface
                </span>
                <div className="grid grid-cols-3 gap-3 pt-1">
                  {[
                    { id: 'neon-dark', name: 'Cyan Néon', desc: 'Noir bleuté et cyan électrique' },
                    { id: 'arcade', name: 'Arcade Classic', desc: 'Ambiance borne 90s vintage' },
                    { id: 'cyberpunk', name: 'Cyberpunk', desc: 'Rose fuchsia et violet néon' },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, uiTheme: theme.id as any })}
                      className={`p-3 rounded-xl border text-left transition ${
                        formData.uiTheme === theme.id
                          ? 'bg-retro-accent/20 border-retro-accent text-white shadow'
                          : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-xs font-bold block">{theme.name}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5 leading-tight">{theme.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Pied de formulaire épinglé */}
        <div className="px-6 py-4 border-t border-slate-800 bg-retro-800/80 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            {activeTab === 'storage' && 'Onglet 1/5 • Répertoires'}
            {activeTab === 'emulators' && 'Onglet 2/5 • Émulateurs'}
            {activeTab === 'scraper' && 'Onglet 3/5 • Scraper'}
            {activeTab === 'kiosk' && 'Onglet 4/5 • Sécurité Kiosk'}
            {activeTab === 'appearance' && 'Onglet 5/5 • Apparence & Audio'}
          </span>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-md ${
                savedSuccess
                  ? 'bg-emerald-500 text-white'
                  : 'bg-retro-accent text-retro-900 hover:scale-105 active:scale-95 shadow-neon'
              }`}
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Enregistré !' : 'Enregistrer'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
