import React, { useState, useMemo } from 'react';
import {
  AppSettings,
  Game,
  System,
  Company,
  EmulatorProfile,
  BiosStatus,
} from '../types';
import { markGameDeleted, markMultipleGamesDeleted } from '../services/romStorage';
import {
  X,
  Settings,
  Gamepad2,
  Cpu,
  Landmark,
  Terminal,
  Folder,
  Globe,
  Lock,
  Palette,
  Plus,
  Pencil,
  Trash2,
  Search,
  Save,
  HardDrive,
  Check,
  RefreshCw,
  DownloadCloud,
  RotateCcw,
  Star,
  Play,
  Copy,
  Sparkles,
  FileJson,
  LayoutDashboard,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { GameEditModal } from './GameEditModal';

// Version du bundle : injectée par Vite (define) au moment du build — hash court
// du commit git + date. Un bundle construit hors dépôt git affiche « build ? ».
const APP_BUILD_HASH = (import.meta.env.VITE_APP_BUILD_HASH as string | undefined) ?? '';
import { SystemEditModal } from './SystemEditModal';
import { CompanyEditModal } from './CompanyEditModal';
import { EmulatorEditModal } from './EmulatorEditModal';
import { ConsoleLogo } from './ConsoleLogo';
import { CompanyLogo } from './CompanyLogo';
import { resolveMediaUrl } from '../utils/media';
import { useAudio } from '../hooks/useAudio';
import { GamepadDiagnostics } from './admin/GamepadDiagnostics';
import { JsonRawEditor } from './admin/JsonRawEditor';
import { BiosAdminView } from './admin/BiosAdminView';
import { CoresAdminView } from './admin/CoresAdminView';
import { BatchGamesToolbar } from './admin/BatchGamesToolbar';
import { CollectionHealthReport } from './admin/CollectionHealthReport';
import { BackupsAdminView } from './admin/BackupsAdminView';
import { KioskCustomizeView } from './admin/KioskCustomizeView';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminLogsView } from './admin/AdminLogsView';
import { ConfirmDialog, useConfirmDialog } from './admin/ConfirmDialog';
import { useAdminLogs } from '../hooks/useAdminLogs';

export type AdminTab =
  | 'dashboard'
  | 'games'
  | 'systems'
  | 'companies'
  | 'emulators'
  | 'bios'
  | 'extensions'
  | 'scraper'
  | 'storage'
  | 'gamepad'
  | 'kiosk'
  | 'appearance'
  | 'backups'
  | 'json'
  | 'logs';

interface AdminHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: Partial<AppSettings>) => void;
  games: Game[];
  onSaveGames: (games: Game[]) => void;
  systems: System[];
  onSaveSystems: (systems: System[]) => void;
  companies: Company[];
  onSaveCompanies: (companies: Company[]) => void;
  emulators: EmulatorProfile[];
  onSaveEmulators: (emulators: EmulatorProfile[]) => void;
  onSelectDirectory: () => Promise<string | null>;
  onOpenExtensions?: () => void;
  onOpenThemeStudio?: () => void;
  onDetectEmulators?: () => Promise<EmulatorProfile[]>;
  onResetDefaults?: () => void;
  onOpenSystemExhibition?: (system: System) => void;
  onOpenCompanyExhibition?: (company: Company) => void;
  // Nouvelles actions d'administration universelle
  onScanRoms?: () => Promise<void>;
  isScanningRoms?: boolean;
  onStartScrapeBatch?: () => Promise<void>;
  onScrapeGame?: (game: Game) => Promise<void>;
  isScrapingBatch?: boolean;
  scrapeProgress?: {
    isOpen: boolean;
    total: number;
    current: number;
    currentGameTitle: string;
    isComplete: boolean;
  };
  onLaunchGame?: (game: Game, emulatorId?: string) => Promise<void>;
  onToggleFavorite?: (gameId: string) => Promise<void>;
  biosStatuses?: BiosStatus[];
  isCheckingBios?: boolean;
  onCheckBios?: () => Promise<void>;
  onCreateRomsFolders?: () => Promise<{ created: number; total: number }>;
  // Callbacks Labo Rétro
  // 8 Nouveaux modules d'amélioration & Musique
}

export const AdminHubModal: React.FC<AdminHubModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  games,
  onSaveGames,
  systems,
  onSaveSystems,
  companies,
  onSaveCompanies,
  emulators,
  onSaveEmulators,
  onSelectDirectory,
  onOpenExtensions,
  onOpenThemeStudio,
  onDetectEmulators,
  onResetDefaults,
  onOpenSystemExhibition,
  onOpenCompanyExhibition,
  onScanRoms,
  isScanningRoms = false,
  onStartScrapeBatch,
  onScrapeGame,
  isScrapingBatch = false,
  scrapeProgress,
  onLaunchGame,
  onToggleFavorite,
  biosStatuses = [],
  isCheckingBios = false,
  onCheckBios,
  onCreateRomsFolders,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [formSettings, setFormSettings] = useState<AppSettings>({ ...settings });
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState(false);

  // Filtres et recherche pour l'onglet Jeux
  const [gameSearch, setGameSearch] = useState('');
  const [gameSystemFilter, setGameSystemFilter] = useState<string>('all');
  const [gameFavoriteFilter, setGameFavoriteFilter] = useState<boolean | 'all'>('all');
  const [selectedGameIds, setSelectedGameIds] = useState<Set<string>>(new Set());

  // Filtre pour l'onglet Consoles
  const [systemSearch, setSystemSearch] = useState('');
  const [systemCompanyFilter, setSystemCompanyFilter] = useState<string>('all');

  // Filtre pour l'onglet Firmes
  const [companySearch, setCompanySearch] = useState('');

  // Sous-modales d'édition
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isGameEditOpen, setIsGameEditOpen] = useState(false);

  const [editingSystem, setEditingSystem] = useState<System | null>(null);
  const [isSystemEditOpen, setIsSystemEditOpen] = useState(false);

  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isCompanyEditOpen, setIsCompanyEditOpen] = useState(false);

  const [editingEmulator, setEditingEmulator] = useState<EmulatorProfile | null>(null);
  const [isEmulatorEditOpen, setIsEmulatorEditOpen] = useState(false);

  const [isDetectingEmulators, setIsDetectingEmulators] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Mode de présentation : Vue Simplifiée par Univers (par défaut) vs Vue Complète classique
  const [isSimplifiedView, setIsSimplifiedView] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('retromad_admin_simplified_view');
      return stored !== 'false';
    } catch {
      return true;
    }
  });
  const [adminSearch, setAdminSearch] = useState('');

  // ── Logs & Confirmation ──
  const { logs, logSuccess, logWarning, clearLogs } = useAdminLogs();
  const { confirmState, confirm, closeConfirm } = useConfirmDialog();

  const { playMove, playSelect, playCoin, playFavorite, playUnlock } =
    useAudio(formSettings.soundEnabled, formSettings.soundVolume ?? 0.8);

  const notify = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 3500);
  };

  // ==========================================
  // FILTRAGE DES JEUX
  // ==========================================
  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      const matchSearch =
        !gameSearch ||
        g.cleanTitle.toLowerCase().includes(gameSearch.toLowerCase()) ||
        g.title.toLowerCase().includes(gameSearch.toLowerCase()) ||
        (g.metadata?.developer && g.metadata.developer.toLowerCase().includes(gameSearch.toLowerCase()));
      const matchSystem = gameSystemFilter === 'all' || g.systemId === gameSystemFilter;
      const matchFav = gameFavoriteFilter === 'all' || (gameFavoriteFilter ? g.favorite : !g.favorite);
      return matchSearch && matchSystem && matchFav;
    });
  }, [games, gameSearch, gameSystemFilter, gameFavoriteFilter]);

  // ==========================================
  // FILTRAGE DES CONSOLES
  // ==========================================
  const filteredSystems = useMemo(() => {
    return systems.filter((s) => {
      const matchSearch =
        !systemSearch ||
        s.name.toLowerCase().includes(systemSearch.toLowerCase()) ||
        s.shortName.toLowerCase().includes(systemSearch.toLowerCase()) ||
        s.manufacturer.toLowerCase().includes(systemSearch.toLowerCase());
      const matchCompany = systemCompanyFilter === 'all' || s.companyId === systemCompanyFilter;
      return matchSearch && matchCompany;
    });
  }, [systems, systemSearch, systemCompanyFilter]);

  // ==========================================
  // FILTRAGE DES FIRMES
  // ==========================================
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      if (!companySearch) return true;
      const q = companySearch.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q);
    });
  }, [companies, companySearch]);

  // ==========================================
  // ACTIONS SUR LES JEUX
  // ==========================================
  const handleSaveGame = (updatedGame: Game) => {
    const exists = games.some((g) => g.id === updatedGame.id);
    let newGames: Game[];
    if (exists) {
      newGames = games.map((g) => (g.id === updatedGame.id ? updatedGame : g));
      logSuccess('Jeux', `Jeu modifié : ${updatedGame.cleanTitle}`);
    } else {
      newGames = [updatedGame, ...games];
      logSuccess('Jeux', `Nouveau jeu créé : ${updatedGame.cleanTitle}`);
    }
    onSaveGames(newGames);
    notify(`Jeu "${updatedGame.cleanTitle}" enregistré avec succès !`);
  };

  const _doDeleteGame = (gameId: string) => {
    const target = games.find((g) => g.id === gameId);
    markGameDeleted(gameId, target?.filename);
    const newGames = games.filter((g) => g.id !== gameId);
    onSaveGames(newGames);
    setSelectedGameIds((prev) => {
      const next = new Set(prev);
      next.delete(gameId);
      return next;
    });
    logWarning('Jeux', `Jeu supprimé : ${target?.cleanTitle || target?.title || gameId}`);
    notify('Jeu supprimé définitivement de la bibliothèque.');
  };

  const handleDeleteGame = (gameId: string) => {
    const target = games.find((g) => g.id === gameId);
    confirm({
      title: 'Supprimer ce jeu ?',
      message: `« ${target?.cleanTitle || target?.title || gameId} » sera retiré définitivement de la bibliothèque et protégé contre la réapparition au prochain scan.`,
      confirmLabel: 'Supprimer',
      variant: 'danger',
      onConfirm: () => { _doDeleteGame(gameId); closeConfirm(); },
    });
  };

  const handleDuplicateGame = (game: Game) => {
    const newGame: Game = {
      ...game,
      id: `${game.id}-copy-${Date.now()}`,
      title: `${game.title} (Copie)`,
      cleanTitle: `${game.cleanTitle} (Copie)`,
      favorite: false,
      playCount: 0,
    };
    onSaveGames([newGame, ...games]);
    notify(`Jeu dupliqué : "${newGame.cleanTitle}"`);
  };

  const handleCreateNewGame = () => {
    const defaultSys = systems[0]?.id || 'snes';
    const newId = `custom-game-${Date.now()}`;
    const newGame: Game = {
      id: newId,
      systemId: defaultSys,
      title: 'Nouveau Jeu Retro',
      cleanTitle: 'Nouveau Jeu Retro',
      path: `~/RetroMad/Roms/${defaultSys}/nouveau_jeu.rom`,
      filename: 'nouveau_jeu.rom',
      extension: '.rom',
      size: 1048576,
      favorite: false,
      playCount: 0,
      metadata: {
        developer: 'Studio Indépendant',
        publisher: 'Éditeur Culte',
        releaseDate: '1995',
        rating: 85,
        players: '1-2 Joueurs',
        genres: ['Action', 'Aventure'],
        synopsis: 'Description et histoire épique du jeu...',
      },
      media: {
        boxart2d: '',
        boxart3d: '',
        snap: '',
        titleScreen: '',
        wheel: '',
      },
    };
    setEditingGame(newGame);
    setIsGameEditOpen(true);
  };

  // Actions groupées (Batch)
  const handleToggleSelectGame = (id: string) => {
    setSelectedGameIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllGames = () => {
    const ids = new Set(filteredGames.map((g) => g.id));
    setSelectedGameIds(ids);
  };

  const handleDeselectAllGames = () => {
    setSelectedGameIds(new Set());
  };

  const handleBatchDelete = (ids: string[]) => {
    confirm({
      title: `Supprimer ${ids.length} jeu(x) ?`,
      message: `Cette action est irréversible. Les jeux sélectionnés seront retirés de la bibliothèque et protégés contre la réapparition.`,
      confirmLabel: `Supprimer ${ids.length} jeu(x)`,
      variant: 'danger',
      onConfirm: () => {
        const idSet = new Set(ids);
        const targets = games
          .filter((g) => idSet.has(g.id))
          .map((g) => ({ id: g.id, filename: g.filename }));
        markMultipleGamesDeleted(targets);
        const updated = games.filter((g) => !idSet.has(g.id));
        onSaveGames(updated);
        setSelectedGameIds(new Set());
        logWarning('Jeux', `${ids.length} jeu(x) supprimé(s) en lot`);
        notify(`${ids.length} jeu(x) supprimé(s) définitivement.`);
        closeConfirm();
      },
    });
  };

  const handleBatchToggleFavorite = (ids: string[], fav: boolean) => {
    const idSet = new Set(ids);
    const updated = games.map((g) => (idSet.has(g.id) ? { ...g, favorite: fav } : g));
    onSaveGames(updated);
    logSuccess('Jeux', `${ids.length} jeu(x) ${fav ? 'ajoutés aux' : 'retirés des'} favoris`);
    notify(`${ids.length} jeu(x) mis à jour en favoris.`);
  };

  const handleBatchChangeSystem = (ids: string[], targetSystemId: string) => {
    const idSet = new Set(ids);
    const updated = games.map((g) => (idSet.has(g.id) ? { ...g, systemId: targetSystemId } : g));
    onSaveGames(updated);
    logSuccess('Jeux', `${ids.length} jeu(x) réassignés vers ${targetSystemId}`);
    notify(`${ids.length} jeu(x) réassigné(s) à la console.`);
  };

  const handleBatchScrape = async (selected: Game[]) => {
    if (!onScrapeGame) return;
    notify(`Lancement du scraping pour ${selected.length} jeu(x)...`);
    logSuccess('Scraper', `Scraping lancé pour ${selected.length} jeu(x)`);
    for (const g of selected) {
      await onScrapeGame(g);
    }
    notify(`Scraping de la sélection terminé !`);
  };

  // Rapport santé : scraping unitaire avec indicateur sur la ligne concernée
  const [healthScrapingId, setHealthScrapingId] = useState<string | null>(null);
  const handleHealthScrape = async (game: Game) => {
    if (!onScrapeGame) return;
    setHealthScrapingId(game.id);
    try {
      await onScrapeGame(game);
      notify(`Jaquette de « ${game.cleanTitle || game.title} » récupérée !`);
    } catch {
      notify(`Échec du scraping pour « ${game.cleanTitle || game.title} ».`);
    } finally {
      setHealthScrapingId(null);
    }
  };

  const handleBatchClearMedia = (ids: string[]) => {
    const idSet = new Set(ids);
    const updated = games.map((g) => {
      if (!idSet.has(g.id)) return g;
      return {
        ...g,
        media: { boxart2d: '', boxart3d: '', snap: '', titleScreen: '', wheel: '' },
      };
    });
    onSaveGames(updated);
    notify(`Médias effacés pour ${ids.length} jeu(x).`);
  };

  const handleBatchExportJson = (selected: Game[]) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(selected, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `retromad-selection-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    notify(`${selected.length} jeu(x) exporté(s) en JSON.`);
  };

  // ==========================================
  // ACTIONS SUR LES CONSOLES
  // ==========================================
  const handleSaveSystem = (updatedSystem: System) => {
    const exists = systems.some((s) => s.id === updatedSystem.id);
    let newSystems: System[];
    if (exists) {
      newSystems = systems.map((s) => (s.id === updatedSystem.id ? updatedSystem : s));
      logSuccess('Consoles', `Console modifiée : ${updatedSystem.name}`);
    } else {
      newSystems = [...systems, updatedSystem];
      logSuccess('Consoles', `Nouvelle console créée : ${updatedSystem.name}`);
    }
    onSaveSystems(newSystems);
    notify(`Console "${updatedSystem.name}" enregistrée !`);
  };

  const handleDeleteSystem = (systemId: string) => {
    const target = systems.find((s) => s.id === systemId);
    confirm({
      title: 'Supprimer cette console ?',
      message: `« ${target?.name || systemId} » sera retirée de la liste. Les jeux associés resteront dans la bibliothèque.`,
      confirmLabel: 'Supprimer',
      variant: 'danger',
      onConfirm: () => {
        const newSystems = systems.filter((s) => s.id !== systemId);
        onSaveSystems(newSystems);
        logWarning('Consoles', `Console supprimée : ${target?.name || systemId}`);
        notify('Console retirée.');
        closeConfirm();
      },
    });
  };

  const handleDuplicateSystem = (sys: System) => {
    const newId = `${sys.id}-copy-${Date.now().toString().slice(-4)}`;
    const newSys: System = {
      ...sys,
      id: newId,
      name: `${sys.name} (Copie)`,
      shortName: `${sys.shortName}²`,
      subfolder: newId,
    };
    onSaveSystems([...systems, newSys]);
    notify(`Console dupliquée : "${newSys.name}"`);
  };

  const handleCreateNewSystem = () => {
    const newId = `custom-system-${Date.now()}`;
    const newSystem: System = {
      id: newId,
      name: 'Nouvelle Console',
      shortName: 'NEW-SYS',
      companyId: companies[0]?.id || 'nintendo',
      manufacturer: companies[0]?.name || 'Nintendo',
      releaseYear: 1990,
      generation: '4ème Génération (16-bit)',
      themeColor: '#06b6d4',
      subfolder: newId,
      icon: 'gamepad',
      libretroSystemName: 'custom_system',
      defaultCoreLinux: 'custom_libretro.so',
      defaultCoreWindows: 'custom_libretro.dll',
      extensions: ['.rom', '.bin', '.zip'],
      specs: {
        cpu: 'CPU Personnalisé 16-bit',
        gpuOrAudio: 'Puce Audio 8 Canaux Stéréo',
        resolution: '256x224 Pixels',
        media: 'Cartouche ROM',
        unitsSold: '50 Millions d\'exemplaires',
      },
      biosList: [],
      museum: {
        tagline: 'Une machine légendaire ayant marqué son époque',
        history: 'Histoire fascinante de la conception et du succès de cette console de salon...',
        innovations: ['Graphismes immersifs', 'Manette ergonomique'],
        anecdotes: ['Conçue dans le plus grand secret.'],
        iconicGames: ['Jeu Phare Vol. 1'],
        hardwareHighlights: {
          cpuArchitecture: 'RISC 16-bit',
          ram: '2 Mo',
        },
      },
    };
    setEditingSystem(newSystem);
    setIsSystemEditOpen(true);
  };

  // ==========================================
  // ACTIONS SUR LES FIRMES
  // ==========================================
  const handleSaveCompany = (updatedCompany: Company) => {
    const exists = companies.some((c) => c.id === updatedCompany.id);
    let newCompanies: Company[];
    if (exists) {
      newCompanies = companies.map((c) => (c.id === updatedCompany.id ? updatedCompany : c));
      logSuccess('Firmes', `Firme modifiée : ${updatedCompany.name}`);
    } else {
      newCompanies = [...companies, updatedCompany];
      logSuccess('Firmes', `Nouvelle firme créée : ${updatedCompany.name}`);
    }
    onSaveCompanies(newCompanies);
    notify(`Firme "${updatedCompany.name}" enregistrée !`);
  };

  const handleDeleteCompany = (companyId: string) => {
    const target = companies.find((c) => c.id === companyId);
    confirm({
      title: 'Supprimer ce constructeur ?',
      message: `« ${target?.name || companyId} » sera retiré de l'encyclopédie. Les consoles associées resteront en place.`,
      confirmLabel: 'Supprimer',
      variant: 'danger',
      onConfirm: () => {
        const newCompanies = companies.filter((c) => c.id !== companyId);
        onSaveCompanies(newCompanies);
        logWarning('Firmes', `Firme supprimée : ${target?.name || companyId}`);
        notify('Firme retirée.');
        closeConfirm();
      },
    });
  };

  const handleDuplicateCompany = (comp: Company) => {
    const newId = `${comp.id}-copy-${Date.now().toString().slice(-4)}`;
    const newComp: Company = {
      ...comp,
      id: newId,
      name: `${comp.name} (Copie)`,
      logoText: `${comp.logoText}²`,
    };
    onSaveCompanies([...companies, newComp]);
    notify(`Firme dupliquée : "${newComp.name}"`);
  };

  const handleCreateNewCompany = () => {
    const newId = `custom-company-${Date.now()}`;
    const newCompany: Company = {
      id: newId,
      name: 'Nouvelle Firme',
      country: 'Japon 🇯🇵',
      founded: 1980,
      accentColor: '#10b981',
      logoText: 'NOUVELLE FIRME',
      description: 'Pionnier du jeu vidéo et de la création interactive.',
      famousFranchises: ['Franchise Mythique'],
      consoles: [],
      youtubeId: '',
      museum: {
        tagline: "L'artisan de l'émerveillement vidéoludique",
        curatorIntro: "Découvrez l'histoire fascinante de cette maison d'édition...",
        philosophy: "Créer des souvenirs inoubliables pour les joueurs.",
        culturalImpact: 'Une empreinte forte sur la culture populaire.',
        eras: [
          {
            era: 'Les Débuts',
            period: '1980 - 1990',
            title: "L'émergence des premiers classiques",
            description: "Les premiers succès dans les salles d'arcade et micro-ordinateurs.",
          },
        ],
        milestones: [{ year: 1980, title: 'Fondation de la compagnie', description: 'Création du premier studio.' }],
        keyFigures: [{ name: 'Fondateur', role: 'Président Directeur', contribution: 'Visionnaire de la marque.' }],
        anecdotes: ['Une entreprise née de la passion pure du jeu.'],
        totalConsolesSoldEstimate: '+50 Millions',
        bestSellingConsole: 'Console Emblématique',
        bestSellingGame: 'Titre Culte',
      },
    };
    setEditingCompany(newCompany);
    setIsCompanyEditOpen(true);
  };

  // ==========================================
  // ACTIONS SUR LES ÉMULATEURS
  // ==========================================
  const handleSaveEmulator = (updatedEmulator: EmulatorProfile) => {
    const exists = emulators.some((e) => e.id === updatedEmulator.id);
    let newEmus: EmulatorProfile[];
    if (exists) {
      newEmus = emulators.map((e) => (e.id === updatedEmulator.id ? updatedEmulator : e));
      logSuccess('Émulateurs', `Émulateur modifié : ${updatedEmulator.name}`);
    } else {
      newEmus = [...emulators, updatedEmulator];
      logSuccess('Émulateurs', `Nouvel émulateur créé : ${updatedEmulator.name}`);
    }
    onSaveEmulators(newEmus);
    notify(`Profil émulateur "${updatedEmulator.name}" enregistré !`);
  };

  const handleDeleteEmulator = (emulatorId: string) => {
    const target = emulators.find((e) => e.id === emulatorId);
    confirm({
      title: 'Supprimer ce profil émulateur ?',
      message: `« ${target?.name || emulatorId} » sera retiré. Si des jeux l'utilisent, ils retomberont sur le profil par défaut.`,
      confirmLabel: 'Supprimer',
      variant: 'danger',
      onConfirm: () => {
        const newEmus = emulators.filter((e) => e.id !== emulatorId);
        onSaveEmulators(newEmus);
        logWarning('Émulateurs', `Émulateur supprimé : ${target?.name || emulatorId}`);
        notify('Émulateur supprimé.');
        closeConfirm();
      },
    });
  };

  const handleDuplicateEmulator = (emu: EmulatorProfile) => {
    const newId = `${emu.id}-copy-${Date.now().toString().slice(-4)}`;
    const newEmu: EmulatorProfile = {
      ...emu,
      id: newId,
      name: `${emu.name} (Copie)`,
    };
    onSaveEmulators([...emulators, newEmu]);
    notify(`Émulateur dupliqué : "${newEmu.name}"`);
  };

  const handleCreateNewEmulator = () => {
    const newId = `custom-emu-${Date.now()}`;
    const newEmu: EmulatorProfile = {
      id: newId,
      name: 'Nouvel Émulateur Standalone',
      category: 'standalone',
      executableLinux: 'emulator',
      executableWindows: 'emulator.exe',
      argsTemplateLinux: '-f "{rom}"',
      argsTemplateWindows: '-f "{rom}"',
      supportedSystems: ['all'],
    };
    setEditingEmulator(newEmu);
    setIsEmulatorEditOpen(true);
  };

  const handleAutoDetectEmulators = async () => {
    if (!onDetectEmulators) return;
    setIsDetectingEmulators(true);
    try {
      const detected = await onDetectEmulators();
      if (detected && detected.length > 0) {
        onSaveEmulators(detected);
        notify(`${detected.length} émulateur(s) détecté(s) automatiquement !`);
      }
    } finally {
      setIsDetectingEmulators(false);
    }
  };

  // Sauvegarde des paramètres
  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formSettings);
    setSavedSettingsSuccess(true);
    setTimeout(() => setSavedSettingsSuccess(false), 1200);
    logSuccess('Paramètres', 'Paramètres enregistrés');
    notify('Paramètres enregistrés avec succès.');
  };

  const handlePickRomsDir = async () => {
    const dir = await onSelectDirectory();
    if (dir) {
      setFormSettings((prev) => ({ ...prev, romsDir: dir }));
      logSuccess('Dossiers', `Dossier ROMs défini : ${dir}`);
    }
  };

  const handlePickBiosDir = async () => {
    const dir = await onSelectDirectory();
    if (dir) {
      setFormSettings((prev) => ({ ...prev, biosDir: dir }));
      logSuccess('Dossiers', `Dossier BIOS défini : ${dir}`);
    }
  };

  // ── Types et configuration de navigation par Univers (Vue Simplifiée) ──
  type MasterCategory = 'dashboard' | 'library' | 'emulation' | 'kiosk' | 'system';

  const tabToCategoryMap: Record<AdminTab, MasterCategory> = {
    dashboard: 'dashboard',
    games: 'library',
    systems: 'library',
    companies: 'library',
    scraper: 'library',
    emulators: 'emulation',
    extensions: 'emulation',
    bios: 'emulation',
    gamepad: 'emulation',
    kiosk: 'kiosk',
    appearance: 'kiosk',
    storage: 'system',
    backups: 'system',
    logs: 'system',
    json: 'system',
  };

  const activeCategory: MasterCategory = tabToCategoryMap[activeTab] || 'dashboard';

  const masterPillars: {
    id: MasterCategory;
    title: string;
    subtitle: string;
    badge?: number;
    icon: React.FC<{ className?: string }>;
    accentColor: string;
    borderActive: string;
    bgActive: string;
    subTabs: { id: AdminTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[];
  }[] = [
    {
      id: 'dashboard',
      title: 'Accueil',
      subtitle: 'Vue globale & Santé',
      icon: LayoutDashboard,
      accentColor: 'text-cyan-400',
      borderActive: 'border-cyan-500',
      bgActive: 'bg-cyan-500/15 text-cyan-200 border-cyan-500/50 shadow-cyan-500/10',
      subTabs: [],
    },
    {
      id: 'library',
      title: 'Ludothèque',
      subtitle: 'Jeux, Consoles & Jaquettes',
      badge: games.length,
      icon: Gamepad2,
      accentColor: 'text-emerald-400',
      borderActive: 'border-emerald-500',
      bgActive: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/50 shadow-emerald-500/10',
      subTabs: [
        { id: 'games', label: 'Catalogue Jeux', icon: Gamepad2, badge: games.length },
        { id: 'systems', label: 'Consoles', icon: Cpu, badge: systems.length },
        { id: 'companies', label: 'Constructeurs', icon: Landmark, badge: companies.length },
        { id: 'scraper', label: 'Scraping & Jaquettes', icon: Globe },
      ],
    },
    {
      id: 'emulation',
      title: 'Émulateurs & Matériel',
      subtitle: 'Cœurs, BIOS & Manettes',
      icon: Terminal,
      accentColor: 'text-amber-400',
      borderActive: 'border-amber-500',
      bgActive: 'bg-amber-500/15 text-amber-200 border-amber-500/50 shadow-amber-500/10',
      subTabs: [
        { id: 'emulators', label: 'Profils Émulateurs', icon: Terminal, badge: emulators.length },
        { id: 'extensions', label: 'Cœurs Libretro', icon: DownloadCloud },
        { id: 'bios', label: 'Santé des BIOS', icon: Cpu, badge: biosStatuses.filter((b) => !b.found && !b.optional).length || undefined },
        { id: 'gamepad', label: 'Testeur Manettes', icon: Gamepad2 },
      ],
    },
    {
      id: 'kiosk',
      title: 'Borne & Ambiance',
      subtitle: 'Kiosk, Shaders CRT & Thème',
      icon: Lock,
      accentColor: 'text-pink-400',
      borderActive: 'border-pink-500',
      bgActive: 'bg-pink-500/15 text-pink-200 border-pink-500/50 shadow-pink-500/10',
      subTabs: [
        { id: 'kiosk', label: 'Mode Kiosk & Code PIN', icon: Lock },
        { id: 'appearance', label: 'Apparence & Shaders CRT', icon: Palette },
      ],
    },
    {
      id: 'system',
      title: 'Système & Données',
      subtitle: 'Dossiers, Backups & Logs',
      icon: HardDrive,
      accentColor: 'text-indigo-400',
      borderActive: 'border-indigo-500',
      bgActive: 'bg-indigo-500/15 text-indigo-200 border-indigo-500/50 shadow-indigo-500/10',
      subTabs: [
        { id: 'storage', label: 'Dossiers Stockage', icon: Folder },
        { id: 'backups', label: 'Sauvegardes', icon: RotateCcw },
        { id: 'logs', label: 'Journal d\'actions', icon: Activity, badge: logs.filter((l) => l.level === 'error' || l.level === 'warning').length || undefined },
        { id: 'json', label: 'Éditeur JSON Brut', icon: FileJson },
      ],
    },
  ];

  const searchIndex = [
    { label: 'Scanner & Ajouter des ROMs', tab: 'storage' as AdminTab, keywords: 'scan roms rom dossier importer jeux' },
    { label: 'Catalogue des Jeux & Favoris', tab: 'games' as AdminTab, keywords: 'jeux catalogue roms titres jaquettes favoris supprimer modifier' },
    { label: 'Consoles & Systèmes (119 machines)', tab: 'systems' as AdminTab, keywords: 'consoles snes nes psx megadrive machines plateformes' },
    { label: 'Constructeurs (Nintendo, Sega, Sony...)', tab: 'companies' as AdminTab, keywords: 'firmes constructeurs fabricants nintendo sega sony' },
    { label: 'Scraping des Jaquettes & Vidéos', tab: 'scraper' as AdminTab, keywords: 'scrap scraper jaquettes boxart fanart screenscraper libretro images vidéos' },
    { label: 'Profils d\'Émulateurs (RetroArch & Standalone)', tab: 'emulators' as AdminTab, keywords: 'émulateurs retroarch commande arguments lanceur standalone' },
    { label: 'Cœurs Libretro & Extensions', tab: 'extensions' as AdminTab, keywords: 'cœurs cores libretro extensions snes9x genesis mupen' },
    { label: 'Diagnostic Santé des BIOS', tab: 'bios' as AdminTab, keywords: 'bios firmwares scph5501 disksys fichiers requis santé' },
    { label: 'Testeur & Calibration Manettes', tab: 'gamepad' as AdminTab, keywords: 'manettes gamepad stick boutons dpad calibration' },
    { label: 'Mode Kiosk Borne Arcade & Code PIN', tab: 'kiosk' as AdminTab, keywords: 'kiosk borne arcade code pin verrouillage public restreint' },
    { label: 'Apparence, Effets CRT, Sons & Thèmes', tab: 'appearance' as AdminTab, keywords: 'thèmes apparence crt scanlines shaders couleurs audio volume sons musique bgm' },
    { label: 'Emplacement des Dossiers ROMs & BIOS', tab: 'storage' as AdminTab, keywords: 'dossiers répertoires stockage romsdir biosdir chemins' },
    { label: 'Sauvegardes & Restauration Système', tab: 'backups' as AdminTab, keywords: 'sauvegardes backup export import réinitialisation usine' },
    { label: 'Journal des Actions Administrateur', tab: 'logs' as AdminTab, keywords: 'logs journal historique audit modifications' },
    { label: 'Éditeur JSON Brut (Avancé)', tab: 'json' as AdminTab, keywords: 'json brut raw configuration expert base de données' },
  ];

  const filteredSearchIndex = useMemo(() => {
    if (!adminSearch.trim()) return [];
    const q = adminSearch.toLowerCase().trim();
    return searchIndex.filter(
      (item) => item.label.toLowerCase().includes(q) || item.keywords.includes(q)
    );
  }, [adminSearch]);

  const handleSelectPillar = (pillarId: MasterCategory) => {
    playSelect();
    if (pillarId === 'dashboard') setActiveTab('dashboard');
    else if (pillarId === 'library') setActiveTab('games');
    else if (pillarId === 'emulation') setActiveTab('emulators');
    else if (pillarId === 'kiosk') setActiveTab('kiosk');
    else if (pillarId === 'system') setActiveTab('storage');
  };

  // ── Navigation sidebar items (pour la Vue Complète classique) ──
  type SidebarGroup = {
    label: string;
    items: { id: AdminTab; label: string; icon: React.FC<{ className?: string }>; badge?: string | number; color?: string }[];
  };

  const sidebarGroups: SidebarGroup[] = [
    {
      label: 'Vue d\'ensemble',
      items: [
        { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, color: 'text-cyan-400' },
        { id: 'logs', label: 'Journal d\'actions', icon: Activity, badge: logs.length > 0 ? logs.filter(l => l.level === 'error' || l.level === 'warning').length || undefined : undefined, color: 'text-amber-400' },
      ],
    },
    {
      label: 'Bibliothèque',
      items: [
        { id: 'games', label: 'Catalogue Jeux', icon: Gamepad2, badge: games.length, color: 'text-cyan-400' },
        { id: 'systems', label: 'Consoles', icon: Cpu, badge: systems.length, color: 'text-amber-400' },
        { id: 'companies', label: 'Constructeurs', icon: Landmark, badge: companies.length, color: 'text-violet-400' },
        { id: 'emulators', label: 'Émulateurs', icon: Terminal, color: 'text-emerald-400' },
      ],
    },
    {
      label: 'Outils',
      items: [
        { id: 'bios', label: 'BIOS & Firmwares', icon: Cpu, color: 'text-blue-400' },
        { id: 'extensions', label: 'Cœurs Libretro', icon: DownloadCloud, color: 'text-teal-400' },
        { id: 'scraper', label: 'Scraper', icon: Globe, color: 'text-violet-400' },
        { id: 'gamepad', label: 'Manettes', icon: Gamepad2, color: 'text-cyan-400' },
      ],
    },
    {
      label: 'Système',
      items: [
        { id: 'storage', label: 'Dossiers', icon: Folder, color: 'text-slate-400' },
        { id: 'kiosk', label: 'Mode Kiosk', icon: Lock, color: 'text-rose-400' },
        { id: 'appearance', label: 'Apparence', icon: Palette, color: 'text-pink-400' },
        { id: 'backups', label: 'Sauvegardes', icon: RotateCcw, color: 'text-indigo-400' },
        { id: 'json', label: 'JSON Brut', icon: FileJson, color: 'text-slate-400' },
      ],
    },
  ];

  const currentPillar = masterPillars.find((p) => p.id === activeCategory) || masterPillars[0];

  return (
    <>
      <div className="retromad-modal-overlay">
        <div className="retromad-modal-card max-w-[1440px] h-[96vh] flex flex-col overflow-hidden">
          {/* EN-TÊTE PRINCIPAL ULTRA-ERGONOMIQUE */}
          <div className="retromad-modal-header shrink-0 flex items-center justify-between gap-3 px-6 py-3.5 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
            <div className="flex items-center space-x-3 shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/25 to-blue-600/25 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/10 shrink-0">
                <Settings className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-base font-black text-white tracking-wide flex items-center gap-2">
                  <span>Administration</span>
                  <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    RetroMad
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border hidden md:inline ${
                      APP_BUILD_HASH
                        ? 'bg-slate-800/80 text-slate-400 border-slate-700'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                    }`}
                  >
                    {APP_BUILD_HASH ? `build ${APP_BUILD_HASH}` : 'build dev'}
                  </span>
                </h2>
                <span className="text-[11px] text-slate-400 hidden sm:block">
                  {games.length} jeux · {systems.length} consoles · {emulators.length} émulateurs
                </span>
              </div>
            </div>

            {/* BARRE DE RECHERCHE RAPIDE DANS L'ADMIN */}
            <div className="relative flex-1 max-w-sm hidden lg:block">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Recherche rapide (ex: volume, rom, kiosk, bios, thème...)"
                  className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition"
                />
                {adminSearch && (
                  <button
                    onClick={() => setAdminSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* RÉSULTATS FLOTTANTS DE RECHERCHE INSTANTANÉE */}
              {filteredSearchIndex.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 p-2 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl z-50 space-y-1 max-h-64 overflow-y-auto backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[10px] font-bold text-slate-400 px-2 py-0.5 uppercase tracking-wider">
                    Accès direct ({filteredSearchIndex.length}) :
                  </div>
                  {filteredSearchIndex.map((res) => (
                    <button
                      key={res.tab}
                      onClick={() => {
                        setActiveTab(res.tab);
                        setAdminSearch('');
                        playSelect();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-cyan-500/20 text-xs text-slate-200 hover:text-cyan-200 flex items-center justify-between transition group"
                    >
                      <span>{res.label}</span>
                      <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ACTIONS HEADER : BASCULE DE VUE & NOTIFICATIONS */}
            <div className="flex items-center space-x-2 shrink-0">
              {/* Notification flottante */}
              {statusNotification && (
                <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{statusNotification}</span>
                </div>
              )}

              {/* BOUTON BASCULE VUE SIMPLIFIÉE / VUE COMPLÈTE */}
              <button
                type="button"
                onClick={() => {
                  playMove();
                  const next = !isSimplifiedView;
                  setIsSimplifiedView(next);
                  try {
                    localStorage.setItem('retromad_admin_simplified_view', String(next));
                  } catch {}
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                  isSimplifiedView
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/25'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="Bascule entre l'organisation par Univers (simplifiée) et la liste complète à 15 onglets"
              >
                <span>{isSimplifiedView ? '✨ Vue Simplifiée' : '📋 Vue Complète'}</span>
              </button>

              <button
                onClick={onClose}
                className="retromad-modal-close-btn ml-1"
                title="Fermer le Centre Admin (Échap)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* VUE SIMPLIFIÉE : BARRE DES 4 GRANDS UNIVERS + ACTIONS RAPIDES */}
          {isSimplifiedView && (
            <div className="shrink-0 bg-slate-950 border-b border-slate-800/80">
              {/* LES 5 PILIERS MAJEURS */}
              <div className="px-6 pt-3 pb-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
                {masterPillars.map((pillar) => {
                  const Icon = pillar.icon;
                  const isPillarActive = activeCategory === pillar.id;
                  return (
                    <button
                      key={pillar.id}
                      onClick={() => handleSelectPillar(pillar.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                        isPillarActive
                          ? `${pillar.bgActive} border-current shadow-lg`
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isPillarActive ? pillar.accentColor : 'text-slate-500'}`} />
                      <span>{pillar.title}</span>
                      {pillar.badge !== undefined && (
                        <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-[18px] text-center ${
                          isPillarActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {pillar.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* SOUS-ONGLETS HORIZONTAUX DU PILIER ACTIF */}
              {currentPillar.subTabs.length > 0 && (
                <div className="px-6 py-2 bg-slate-900/40 border-t border-slate-800/60 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {currentPillar.subTabs.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = activeTab === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            playMove();
                            setActiveTab(sub.id);
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                            isSubActive
                              ? 'bg-slate-800 text-white border-cyan-500/60 shadow-md'
                              : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-800'
                          }`}
                        >
                          <SubIcon className={`w-3.5 h-3.5 ${isSubActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                          <span>{sub.label}</span>
                          {sub.badge !== undefined && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                              {sub.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* MINI BOUTONS D'ACTION RAPIDE SUR LA LIGNE SOUS-ONGLETS */}
                  <div className="flex items-center gap-1.5 text-xs">
                    {onScanRoms && (
                      <button
                        onClick={onScanRoms}
                        disabled={isScanningRoms}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 text-[11px]"
                        title="Vérifier et importer immédiatement les nouvelles ROMs"
                      >
                        <RefreshCw className={`w-3 h-3 ${isScanningRoms ? 'animate-spin' : ''}`} />
                        <span>{isScanningRoms ? 'Scan…' : 'Scan ROMs'}</span>
                      </button>
                    )}
                    {onStartScrapeBatch && (
                      <button
                        onClick={onStartScrapeBatch}
                        disabled={isScrapingBatch}
                        className="px-2.5 py-1 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 text-[11px]"
                        title="Récupérer les jaquettes et vidéos manquantes"
                      >
                        <Globe className={`w-3 h-3 ${isScrapingBatch ? 'animate-spin' : ''}`} />
                        <span>{isScrapingBatch ? 'Scraping…' : 'Scraper'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CORPS : SIDEBAR (SI VUE COMPLÈTE) + CONTENU */}
          <div className="flex flex-1 min-h-0">
            {/* ── SIDEBAR VERTICALE CLASSIQUE (affichée uniquement en vue complète) ── */}
            {!isSimplifiedView && (
              <aside className="w-52 shrink-0 bg-slate-950/80 border-r border-slate-800 flex flex-col overflow-y-auto py-3">
                {sidebarGroups.map((group) => (
                  <div key={group.label} className="mb-4">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-4 mb-1.5 block">
                      {group.label}
                    </span>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold transition-all group ${
                            isActive
                              ? 'bg-cyan-500/10 text-white border-r-2 border-cyan-400'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? (item.color || 'text-cyan-400') : 'text-slate-500 group-hover:text-slate-300'}`} />
                          <span className="flex-1 text-left truncate">{item.label}</span>
                          {item.badge !== undefined && item.badge !== 0 && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                              isActive ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                          {isActive && <ChevronRight className="w-3 h-3 text-cyan-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                ))}

                {/* Infos version en bas de sidebar */}
                <div className="mt-auto px-4 pb-3 pt-2 border-t border-slate-800">
                  <span className="text-[9px] text-slate-600 block">RetroMad Admin</span>
                  <span className="text-[9px] text-slate-700 font-mono">{games.length} jeux · {systems.length} sys</span>
                </div>
              </aside>
            )}

            {/* ── CONTENU PRINCIPAL ── */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* ======================================================== */}
              {/* TABLEAU DE BORD */}
              {/* ======================================================== */}
              {activeTab === 'dashboard' && (
                <AdminDashboard
                  games={games}
                  systems={systems}
                  companies={companies}
                  emulators={emulators}
                  biosStatuses={biosStatuses}
                  logs={logs}
                  onNavigate={(tab) => setActiveTab(tab as AdminTab)}
                />
              )}

              {/* ======================================================== */}
              {/* JOURNAL DES ACTIONS */}
              {/* ======================================================== */}
              {activeTab === 'logs' && (
                <AdminLogsView logs={logs} onClear={clearLogs} />
              )}

            {/* ======================================================== */}
            {/* ONGLET: JEUX (CATALOGUE, BATCH ACTIONS & ÉDITION) */}
            {/* ======================================================== */}
            {activeTab === 'games' && (
              <div className="space-y-4">
                {/* Rapport santé de la collection (jaquettes, BIOS, doublons, disque) */}
                <CollectionHealthReport
                  games={games}
                  biosStatuses={biosStatuses}
                  isCheckingBios={isCheckingBios}
                  onCheckBios={onCheckBios}
                  onScrapeGame={handleHealthScrape}
                  onScrapeGameRaw={onScrapeGame}
                  onDeleteGame={(g) => handleDeleteGame(g.id)}
                  scrapingGameId={healthScrapingId}
                />

                {/* Barre d'outils Batch au-dessus de la recherche */}
                <BatchGamesToolbar
                  games={games}
                  selectedIds={selectedGameIds}
                  systems={systems}
                  onSelectAll={handleSelectAllGames}
                  onDeselectAll={handleDeselectAllGames}
                  onBatchDelete={handleBatchDelete}
                  onBatchToggleFavorite={handleBatchToggleFavorite}
                  onBatchChangeSystem={handleBatchChangeSystem}
                  onBatchScrape={handleBatchScrape}
                  onBatchClearMedia={handleBatchClearMedia}
                  onBatchExportJson={handleBatchExportJson}
                />

                {/* Barre de recherche, filtres et scan */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                  <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={gameSearch}
                        onChange={(e) => setGameSearch(e.target.value)}
                        placeholder="Rechercher un jeu par titre, développeur..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <select
                      value={gameSystemFilter}
                      onChange={(e) => setGameSystemFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      <option value="all">Toutes les consoles ({systems.length})</option>
                      {systems.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({games.filter((g) => g.systemId === s.id).length})
                        </option>
                      ))}
                    </select>

                    <select
                      value={String(gameFavoriteFilter)}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGameFavoriteFilter(val === 'all' ? 'all' : val === 'true');
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      <option value="all">Tous les jeux</option>
                      <option value="true">⭐ Favoris uniquement</option>
                      <option value="false">Non favoris</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    {onScanRoms && (
                      <button
                        type="button"
                        onClick={onScanRoms}
                        disabled={isScanningRoms}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 font-bold transition flex items-center space-x-1.5 disabled:opacity-50"
                        title="Scanner les dossiers de ROMs configurés"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isScanningRoms ? 'animate-spin' : ''}`} />
                        <span>{isScanningRoms ? 'Scan...' : 'Scanner ROMs'}</span>
                      </button>
                    )}

                    <button
                      onClick={handleCreateNewGame}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/25 flex items-center space-x-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nouveau Jeu</span>
                    </button>
                  </div>
                </div>

                {/* Tableau complet des jeux */}
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
                  <div className="max-h-[54vh] overflow-y-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/90 text-[11px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-800">
                        <tr>
                          <th className="p-3 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={
                                filteredGames.length > 0 &&
                                filteredGames.every((g) => selectedGameIds.has(g.id))
                              }
                              onChange={(e) => {
                                if (e.target.checked) handleSelectAllGames();
                                else handleDeselectAllGames();
                              }}
                              className="accent-cyan-400 rounded cursor-pointer"
                            />
                          </th>
                          <th className="p-3 w-12 text-center">Média</th>
                          <th className="p-3">Titre du Jeu</th>
                          <th className="p-3 hidden sm:table-cell">Console</th>
                          <th className="p-3 hidden md:table-cell">Développeur</th>
                          <th className="p-3 hidden lg:table-cell">Sortie</th>
                          <th className="p-3 hidden lg:table-cell">Note</th>
                          <th className="p-3 text-right">Actions Universelles</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredGames.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-slate-500">
                              Aucun jeu ne correspond à la recherche.
                            </td>
                          </tr>
                        ) : (
                          filteredGames.map((g) => {
                            const sys = systems.find((s) => s.id === g.systemId);
                            const boxart = resolveMediaUrl(g.media?.boxart2d);
                            const isSelected = selectedGameIds.has(g.id);
                            return (
                              <tr
                                key={g.id}
                                className={`transition group ${
                                  isSelected ? 'bg-cyan-950/30' : 'hover:bg-slate-800/40'
                                }`}
                              >
                                <td className="p-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleSelectGame(g.id)}
                                    className="accent-cyan-400 rounded cursor-pointer"
                                  />
                                </td>
                                <td className="p-2.5 text-center">
                                  <div className="w-9 h-11 rounded-lg bg-black/60 border border-slate-800 overflow-hidden mx-auto flex items-center justify-center">
                                    {boxart ? (
                                      <img src={boxart} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <Gamepad2 className="w-4 h-4 text-slate-600" />
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 font-semibold text-white">
                                  <div className="flex items-center space-x-2">
                                    <span className="truncate max-w-xs">{g.cleanTitle}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (onToggleFavorite) onToggleFavorite(g.id);
                                        else {
                                          const updated = games.map((game) =>
                                            game.id === g.id ? { ...game, favorite: !game.favorite } : game
                                          );
                                          onSaveGames(updated);
                                        }
                                      }}
                                      className="p-0.5 rounded hover:bg-slate-800 transition"
                                      title={g.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                    >
                                      <Star
                                        className={`w-3.5 h-3.5 ${
                                          g.favorite
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-slate-600 hover:text-amber-400'
                                        }`}
                                      />
                                    </button>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono block truncate max-w-xs">
                                    {g.filename}
                                  </span>
                                </td>
                                <td className="p-3 hidden sm:table-cell">
                                  {sys ? (
                                    <span
                                      style={{
                                        borderColor: `${sys.themeColor}50`,
                                        color: sys.themeColor,
                                      }}
                                      className="px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider"
                                    >
                                      {sys.shortName}
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">{g.systemId}</span>
                                  )}
                                </td>
                                <td className="p-3 hidden md:table-cell text-slate-400 truncate max-w-[140px]">
                                  {g.metadata?.developer || '—'}
                                </td>
                                <td className="p-3 hidden lg:table-cell text-slate-400 font-mono">
                                  {g.metadata?.releaseDate || '—'}
                                </td>
                                <td className="p-3 hidden lg:table-cell">
                                  {g.metadata?.rating ? (
                                    <span className="font-bold text-amber-400 font-mono">
                                      {g.metadata.rating}%
                                    </span>
                                  ) : (
                                    <span className="text-slate-600">—</span>
                                  )}
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end space-x-1">
                                    {/* Lancer le jeu */}
                                    {onLaunchGame && (
                                      <button
                                        type="button"
                                        onClick={() => onLaunchGame(g)}
                                        className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition"
                                        title="Lancer / Tester le jeu"
                                      >
                                        <Play className="w-3.5 h-3.5 fill-current" />
                                      </button>
                                    )}

                                    {/* Dupliquer */}
                                    <button
                                      type="button"
                                      onClick={() => handleDuplicateGame(g)}
                                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition"
                                      title="Dupliquer ce jeu"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Scraper */}
                                    {onScrapeGame && (
                                      <button
                                        type="button"
                                        onClick={() => onScrapeGame(g)}
                                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-purple-300 transition"
                                        title="Scraper les métadonnées et jaquettes"
                                      >
                                        <Globe className="w-3.5 h-3.5" />
                                      </button>
                                    )}

                                    {/* Éditer */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingGame(g);
                                        setIsGameEditOpen(true);
                                      }}
                                      className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition flex items-center space-x-1"
                                      title="Modifier ce jeu"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                      <span className="hidden xl:inline">Éditer</span>
                                    </button>

                                    {/* Supprimer */}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteGame(g.id)}
                                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                                      title="Supprimer ce jeu"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* ONGLET: CONSOLES & SYSTÈMES */}
            {/* ======================================================== */}
            {activeTab === 'systems' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                  <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={systemSearch}
                        onChange={(e) => setSystemSearch(e.target.value)}
                        placeholder="Rechercher une console par nom, sigle ou constructeur..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <select
                      value={systemCompanyFilter}
                      onChange={(e) => setSystemCompanyFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="all">Toutes les firmes ({companies.length})</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    {onCreateRomsFolders && (
                      <button
                        type="button"
                        onClick={onCreateRomsFolders}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 font-bold flex items-center space-x-1.5 transition"
                        title="Créer automatiquement l'arborescence des dossiers ROMs"
                      >
                        <Folder className="w-3.5 h-3.5 text-amber-400" />
                        <span>Créer Dossiers ROMs</span>
                      </button>
                    )}

                    <button
                      onClick={handleCreateNewSystem}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/25 flex items-center space-x-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nouvelle Console</span>
                    </button>
                  </div>
                </div>

                {/* Grille des consoles */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSystems.map((s) => {
                    const gameCount = games.filter((g) => g.systemId === s.id).length;
                    return (
                      <div
                        key={s.id}
                        style={{ borderColor: `${s.themeColor}30` }}
                        className="p-4 rounded-2xl bg-slate-950/60 border hover:border-slate-600 transition flex flex-col justify-between group space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              style={{
                                backgroundColor: `${s.themeColor}15`,
                                borderColor: `${s.themeColor}40`,
                              }}
                              className="w-12 h-12 rounded-2xl border flex items-center justify-center p-2 shrink-0"
                            >
                              <ConsoleLogo system={s} className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition flex items-center gap-1.5">
                                <span>{s.name}</span>
                              </h3>
                              <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                                <span className="font-semibold text-slate-300">{s.manufacturer}</span>
                                <span>•</span>
                                <span className="font-mono">{s.releaseYear}</span>
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                            {gameCount} jeu{gameCount > 1 ? 'x' : ''}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400 space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Sous-dossier :</span>
                            <span className="font-mono text-slate-300">/{s.subfolder}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Cœur par défaut :</span>
                            <span className="font-mono text-cyan-400 truncate max-w-[150px]">
                              {s.defaultCoreLinux}
                            </span>
                          </div>
                        </div>

                        {/* Actions pour la console */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                          {onOpenSystemExhibition && (
                            <button
                              type="button"
                              onClick={() => onOpenSystemExhibition(s)}
                              className="text-[11px] text-amber-400 hover:underline font-semibold flex items-center space-x-1"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Voir Musée</span>
                            </button>
                          )}

                          <div className="flex items-center space-x-1.5 ml-auto">
                            <button
                              type="button"
                              onClick={() => handleDuplicateSystem(s)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition"
                              title="Dupliquer la console"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingSystem(s);
                                setIsSystemEditOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center space-x-1"
                              title="Modifier la fiche console"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Modifier</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteSystem(s.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                              title="Supprimer cette console"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* ONGLET: FIRMES & CONSTRUCTEURS */}
            {/* ======================================================== */}
            {activeTab === 'companies' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                      placeholder="Rechercher une firme par nom ou pays..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <button
                    onClick={handleCreateNewCompany}
                    className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-purple-500/25 flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nouveau Constructeur</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCompanies.map((c) => {
                    const sysCount = systems.filter((s) => s.companyId === c.id).length;
                    return (
                      <div
                        key={c.id}
                        style={{ borderColor: `${c.accentColor}35` }}
                        className="p-4 rounded-2xl bg-slate-950/60 border hover:border-slate-600 transition flex flex-col justify-between group space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              style={{
                                backgroundColor: `${c.accentColor}15`,
                                borderColor: `${c.accentColor}40`,
                              }}
                              className="w-12 h-12 rounded-2xl border flex items-center justify-center p-2 shrink-0"
                            >
                              <CompanyLogo companyId={c.id} className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition">
                                {c.name}
                              </h3>
                              <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                                <span>{c.country}</span>
                                <span>•</span>
                                <span className="font-mono">{c.founded}</span>
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                            {sysCount} console{sysCount > 1 ? 's' : ''}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {c.description}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                          {onOpenCompanyExhibition && (
                            <button
                              type="button"
                              onClick={() => onOpenCompanyExhibition(c)}
                              className="text-[11px] text-purple-400 hover:underline font-semibold flex items-center space-x-1"
                            >
                              <Landmark className="w-3 h-3" />
                              <span>Grand Musée</span>
                            </button>
                          )}

                          <div className="flex items-center space-x-1.5 ml-auto">
                            <button
                              type="button"
                              onClick={() => handleDuplicateCompany(c)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-purple-300 transition"
                              title="Dupliquer la firme"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingCompany(c);
                                setIsCompanyEditOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition flex items-center space-x-1"
                              title="Modifier la fiche constructeur"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Modifier</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteCompany(c.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                              title="Supprimer cette firme"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* ONGLET: ÉMULATEURS & PROFILS */}
            {/* ======================================================== */}
            {activeTab === 'emulators' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white">Profils de Lancement & Émulateurs</h3>
                    <p className="text-xs text-slate-400">
                      RetroArch, Flatpaks et exécutables autonomes pour lancer vos ROMs.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {onDetectEmulators && (
                      <button
                        type="button"
                        onClick={handleAutoDetectEmulators}
                        disabled={isDetectingEmulators}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 font-bold transition flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isDetectingEmulators ? 'animate-spin' : ''}`} />
                        <span>{isDetectingEmulators ? 'Détection...' : 'Auto-Détecter'}</span>
                      </button>
                    )}

                    <button
                      onClick={handleCreateNewEmulator}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/25 flex items-center space-x-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter un Profil</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {emulators.map((emu) => (
                    <div
                      key={emu.id}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {emu.category}
                            </span>
                            <h4 className="text-sm font-bold text-white">{emu.name}</h4>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono block mt-1">
                            ID: {emu.id}
                          </span>
                        </div>

                        {emu.isDetected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            Détecté ✓
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] font-mono text-slate-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                        <div>
                          <span className="text-slate-500">Linux : </span>
                          <span className="text-slate-300">{emu.executableLinux}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Windows : </span>
                          <span className="text-slate-300">{emu.executableWindows}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        <span className="text-[11px] text-slate-500">
                          {emu.supportedSystems.includes('all')
                            ? 'Universel (toutes consoles)'
                            : `${emu.supportedSystems.length} console(s) supportée(s)`}
                        </span>

                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleDuplicateEmulator(emu)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-300 transition"
                            title="Dupliquer le profil émulateur"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingEmulator(emu);
                              setIsEmulatorEditOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center space-x-1"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Modifier</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteEmulator(emu.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                            title="Supprimer ce profil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* NOUVEL ONGLET: GESTIONNAIRE DE BIOS INTÉGRÉ */}
            {/* ======================================================== */}
            {activeTab === 'bios' && (
              <BiosAdminView
                biosStatuses={biosStatuses}
                systems={systems}
                biosDir={formSettings.biosDir}
                isChecking={isCheckingBios}
                onRefreshBios={onCheckBios}
                onPickBiosDir={handlePickBiosDir}
              />
            )}

            {/* ======================================================== */}
            {/* NOUVEL ONGLET: CŒURS LIBRETRO & EXTENSIONS */}
            {/* ======================================================== */}
            {activeTab === 'extensions' && (
              <CoresAdminView
                onOpenExtensionsModal={onOpenExtensions}
                onCreateRomsFolders={onCreateRomsFolders}
              />
            )}

            {/* ======================================================== */}
            {/* ONGLET: SCRAPER & MÉTADONNÉES */}
            {/* ======================================================== */}
            {activeTab === 'scraper' && (
              <div className="space-y-5 max-w-3xl">
                {/* Actions Scraper directes */}
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Lancement du Scraper Global</span>
                        {isScrapingBatch && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse">
                            En cours...
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Téléchargez automatiquement jaquettes 2D, boîtes 3D, captures de jeu et résumés.
                      </p>
                    </div>

                    {onStartScrapeBatch && (
                      <button
                        type="button"
                        onClick={onStartScrapeBatch}
                        disabled={isScrapingBatch}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 flex items-center space-x-1.5 transition disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isScrapingBatch ? 'animate-spin' : ''}`} />
                        <span>{isScrapingBatch ? 'Scraping...' : 'Scraper Tout le Catalogue'}</span>
                      </button>
                    )}
                  </div>

                  {/* Barre de progression si scraping en cours */}
                  {scrapeProgress && scrapeProgress.isOpen && (
                    <div className="p-3 bg-black/60 rounded-xl border border-purple-500/40 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-white truncate max-w-sm">{scrapeProgress.currentGameTitle}</span>
                        <span className="font-mono text-purple-400">
                          {scrapeProgress.current} / {scrapeProgress.total}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                        <div
                          className="h-full bg-purple-500 transition-all duration-150"
                          style={{
                            width: `${
                              scrapeProgress.total > 0
                                ? (scrapeProgress.current / scrapeProgress.total) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Configuration ScreenScraper */}
                <form onSubmit={handleSaveSettingsSubmit} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Source Principale de Scrape
                      </label>
                      <select
                        value={formSettings.scraperSource}
                        onChange={(e) => setFormSettings({ ...formSettings, scraperSource: e.target.value as any })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        <option value="both">Hybride (ScreenScraper + Libretro Thumbnails)</option>
                        <option value="screenscraper">ScreenScraper uniquement</option>
                        <option value="libretro">Libretro Thumbnails GitHub (Ultra-rapide)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Compte ScreenScraper
                        </label>
                        <input
                          type="text"
                          value={formSettings.screenScraperUser || ''}
                          onChange={(e) => setFormSettings({ ...formSettings, screenScraperUser: e.target.value })}
                          placeholder="Identifiant..."
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Mot de passe ScreenScraper
                        </label>
                        <input
                          type="password"
                          value={formSettings.screenScraperPassword || ''}
                          onChange={(e) => setFormSettings({ ...formSettings, screenScraperPassword: e.target.value })}
                          placeholder="••••••••"
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider transition shadow flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Enregistrer les Identifiants Scraper</span>
                  </button>
                </form>
              </div>
            )}

            {/* ======================================================== */}
            {/* NOUVEL ONGLET: DIAGNOSTIC CONTRÔLEURS & MANETTES */}
            {/* ======================================================== */}
            {activeTab === 'gamepad' && <GamepadDiagnostics />}

            {/* ======================================================== */}
            {/* ONGLET: DOSSIERS & RÉPERTOIRES */}
            {/* ======================================================== */}
            {activeTab === 'storage' && (
              <form onSubmit={handleSaveSettingsSubmit} className="max-w-2xl space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      <span>Répertoire Racine des ROMs</span>
                      <span className="text-[10px] text-slate-500">Contient les sous-dossiers par console</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formSettings.romsDir}
                        onChange={(e) => setFormSettings({ ...formSettings, romsDir: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={handlePickRomsDir}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700"
                      >
                        <Folder className="w-3.5 h-3.5" />
                        <span>Parcourir</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      <span>Répertoire des BIOS Requis</span>
                      <span className="text-[10px] text-slate-500">Fichiers système (scph1001.bin...)</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formSettings.biosDir}
                        onChange={(e) => setFormSettings({ ...formSettings, biosDir: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={handlePickBiosDir}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700"
                      >
                        <Folder className="w-3.5 h-3.5" />
                        <span>Parcourir</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Standard RetroMAD centralisé :</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormSettings((prev) => ({
                          ...prev,
                          romsDir: 'public/roms',
                          biosDir: 'public/bios',
                          musicDir: 'public/music',
                          themesDir: 'public/themes',
                          emulatorsDir: 'public/emulators',
                          savesDir: 'public/saves',
                          publicCentralized: true,
                        }));
                        notify('Chemins centralisés sur le répertoire ./public');
                      }}
                      className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold transition flex items-center space-x-1"
                    >
                      <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Basculer vers /public (Centralisé)</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/25 flex items-center space-x-2"
                >
                  {savedSettingsSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  <span>{savedSettingsSuccess ? 'Enregistré avec succès !' : 'Enregistrer les Répertoires'}</span>
                </button>
              </form>
            )}

            {/* ======================================================== */}
            {/* ONGLET: MODE KIOSK & SÉCURITÉ */}
            {/* ======================================================== */}
            {activeTab === 'kiosk' && (
              <>
              <div className="mb-5">
                <h2 className="text-base font-black text-white uppercase tracking-wider mb-1">Personnalisation de la borne</h2>
                <p className="text-[11px] text-slate-400 mb-3">
                  Widgets, firmes, machines et vedettes : ce que les joueurs voient dans le Kiosque. Sauvegarde immédiate.
                </p>
                <KioskCustomizeView
                  settings={formSettings}
                  onSaveSettings={onSaveSettings}
                  companies={companies}
                  systems={systems}
                  games={games}
                />
              </div>
              <form onSubmit={handleSaveSettingsSubmit} className="max-w-2xl space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Mode Kiosk (Borne d'Arcade)</span>
                      <span className="text-[11px] text-slate-400 block">
                        Verrouille l'interface pour empêcher l'accès aux paramètres et à l'édition sans code PIN.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formSettings.kioskMode}
                      onChange={(e) => setFormSettings({ ...formSettings, kioskMode: e.target.checked })}
                      className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Code PIN de Déverrouillage (4 chiffres)
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={formSettings.kioskPin}
                        onChange={(e) => setFormSettings({ ...formSettings, kioskPin: e.target.value })}
                        className="w-32 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-mono tracking-widest text-white text-center focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Délai Attract Mode (Secondes)
                      </label>
                      <input
                        type="number"
                        min={15}
                        max={300}
                        value={formSettings.attractDelaySeconds}
                        onChange={(e) => setFormSettings({ ...formSettings, attractDelaySeconds: Number(e.target.value) })}
                        className="w-32 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-xs font-semibold text-slate-300 block">Filtrer uniquement les Favoris en Kiosk</span>
                      <span className="text-[10px] text-slate-500">Ne propose aux joueurs que vos jeux sélectionnés.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!formSettings.kioskOnlyFavorites}
                      onChange={(e) => setFormSettings({ ...formSettings, kioskOnlyFavorites: e.target.checked })}
                      className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider transition shadow flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les Règles Kiosk</span>
                </button>
              </form>
              </>
            )}

            {/* ======================================================== */}
            {/* ONGLET: APPARENCE & AUDIO */}
            {/* ======================================================== */}
            {activeTab === 'appearance' && (
              <form onSubmit={handleSaveSettingsSubmit} className="max-w-2xl space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                  {/* Bruitages Web Audio */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Effets Sonores Rétro 8-bit</span>
                      <span className="text-[11px] text-slate-400 block">
                        Sons arcade au curseur, validation, retour et monnayeur.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formSettings.soundEnabled}
                      onChange={(e) => setFormSettings({ ...formSettings, soundEnabled: e.target.checked })}
                      className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                    />
                  </div>

                  {formSettings.soundEnabled && (
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>Volume des bruitages :</span>
                        <span className="font-mono text-cyan-400 font-bold">
                          {Math.round((formSettings.soundVolume ?? 0.8) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={formSettings.soundVolume ?? 0.8}
                        onChange={(e) => setFormSettings({ ...formSettings, soundVolume: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        <button
                          type="button"
                          onClick={playMove}
                          className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[10px] text-slate-300"
                        >
                          Curseur
                        </button>
                        <button
                          type="button"
                          onClick={playSelect}
                          className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[10px] text-slate-300"
                        >
                          Validation
                        </button>
                        <button
                          type="button"
                          onClick={playCoin}
                          className="px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-[10px] text-amber-300 font-bold"
                        >
                          Insert Coin
                        </button>
                        <button
                          type="button"
                          onClick={playFavorite}
                          className="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-[10px] text-emerald-300 font-bold"
                        >
                          Étoile
                        </button>
                        <button
                          type="button"
                          onClick={playUnlock}
                          className="px-2 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-[10px] text-cyan-300 font-bold"
                        >
                          Fanfare
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Filtre CRT */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-white block">Filtre CRT Scanlines & Phosphore</span>
                      <span className="text-[11px] text-slate-400 block">
                        Imite le balayage cathodique rétro des téléviseurs Trinitron des années 90.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!formSettings.crtEffect}
                      onChange={(e) => setFormSettings({ ...formSettings, crtEffect: e.target.checked })}
                      className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                    />
                  </div>

                  {/* Effets visuels d'ambiance (performance) */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <div>
                      <span className="text-xs font-bold text-white block">Effets Visuels d'Ambiance (Kiosque)</span>
                      <span className="text-[11px] text-slate-400 block">
                        Ajoutez ou retirez les effets d'ambiance. Désactivez-les pour plus de fluidité sur une machine modeste.
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div>
                        <span className="text-[11px] font-bold text-slate-200 block">🎬 Vidéos de fond des firmes</span>
                        <span className="text-[10px] text-slate-400 block">Archives YouTube/MP4 derrière les cartes (1 seule active à la fois).</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formSettings.kioskBackgroundVideos !== false}
                        onChange={(e) => setFormSettings({ ...formSettings, kioskBackgroundVideos: e.target.checked })}
                        className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div>
                        <span className="text-[11px] font-bold text-slate-200 block">✨ Halos lumineux néon</span>
                        <span className="text-[10px] text-slate-400 block">Lueurs colorées aux couleurs des firmes et consoles.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formSettings.kioskNeonGlows !== false}
                        onChange={(e) => setFormSettings({ ...formSettings, kioskNeonGlows: e.target.checked })}
                        className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div>
                        <span className="text-[11px] font-bold text-slate-200 block">🌀 Animations & transitions</span>
                        <span className="text-[10px] text-slate-400 block">Zooms, apparitions en fondu et transitions de focus.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formSettings.kioskAnimations !== false}
                        onChange={(e) => setFormSettings({ ...formSettings, kioskAnimations: e.target.checked })}
                        className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <div>
                        <span className="text-[11px] font-bold text-amber-200 block">⚡ Performance automatique</span>
                        <span className="text-[10px] text-slate-400 block">Coupe les effets ci-dessus si les FPS restent sous 30 pendant 8 secondes.</span>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        onChange={(e) => {
                          try {
                            localStorage.setItem('retromad_auto_performance', e.target.checked ? 'true' : 'false');
                          } catch {
                            /* noop */
                          }
                        }}
                        className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Atelier & Thèmes Communautaires */}
                  <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-pink-300 block flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                        <span>Moteur de Thèmes & Atelier Communautaire</span>
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Créez vos thèmes avec le langage déclaratif RetroTheme DSL et exportez vos packs pour la communauté.
                      </span>
                    </div>
                    {onOpenThemeStudio && (
                      <button
                        type="button"
                        onClick={onOpenThemeStudio}
                        className="px-3.5 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-300 text-xs font-bold transition flex items-center space-x-1.5 shrink-0"
                      >
                        <Palette className="w-3.5 h-3.5 text-pink-400" />
                        <span>Ouvrir l'Atelier Studio</span>
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider transition shadow flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer Apparence & Audio</span>
                </button>
              </form>
            )}

            {/* ======================================================== */}
            {/* NOUVEL ONGLET: SAUVEGARDES, RESTAURATION & USINE */}
            {/* ======================================================== */}
            {activeTab === 'backups' && (
              <BackupsAdminView
                games={games}
                systems={systems}
                companies={companies}
                emulators={emulators}
                settings={formSettings}
                onSaveGames={onSaveGames}
                onSaveSystems={onSaveSystems}
                onSaveCompanies={onSaveCompanies}
                onSaveEmulators={onSaveEmulators}
                onSaveSettings={onSaveSettings}
                onResetDefaults={onResetDefaults}
              />
            )}



            {/* ======================================================== */}
            {/* NOUVEL ONGLET: ÉDITEUR BRUT DE DONNÉES JSON */}
            {/* ======================================================== */}
            {activeTab === 'json' && (
              <JsonRawEditor
                games={games}
                systems={systems}
                companies={companies}
                emulators={emulators}
                settings={formSettings}
                onSaveGames={onSaveGames}
                onSaveSystems={onSaveSystems}
                onSaveCompanies={onSaveCompanies}
                onSaveEmulators={onSaveEmulators}
                onSaveSettings={onSaveSettings}
              />
            )}
            </div>
          {/* ── Fin du corps sidebar + contenu ── */}
          </div>
        </div>
      </div>

      {/* DIALOGUE DE CONFIRMATION GLOBAL */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        variant={confirmState.variant}
        onConfirm={confirmState.onConfirm}
        onCancel={closeConfirm}
      />

      {/* MODALES D'ÉDITION CONTEXTUELLES */}
      <GameEditModal
        game={editingGame}
        systems={systems}
        emulators={emulators}
        isOpen={isGameEditOpen}
        onClose={() => {
          setIsGameEditOpen(false);
          setEditingGame(null);
        }}
        onSave={handleSaveGame}
        onDelete={handleDeleteGame}
      />

      <SystemEditModal
        system={editingSystem}
        companies={companies}
        isOpen={isSystemEditOpen}
        onClose={() => {
          setIsSystemEditOpen(false);
          setEditingSystem(null);
        }}
        onSave={handleSaveSystem}
        onDelete={handleDeleteSystem}
      />

      <CompanyEditModal
        company={editingCompany}
        isOpen={isCompanyEditOpen}
        onClose={() => {
          setIsCompanyEditOpen(false);
          setEditingCompany(null);
        }}
        onSave={handleSaveCompany}
        onDelete={handleDeleteCompany}
      />

      <EmulatorEditModal
        emulator={editingEmulator}
        systems={systems}
        isOpen={isEmulatorEditOpen}
        onClose={() => {
          setIsEmulatorEditOpen(false);
          setEditingEmulator(null);
        }}
        onSave={handleSaveEmulator}
        onDelete={handleDeleteEmulator}
      />
    </>
  );
};
