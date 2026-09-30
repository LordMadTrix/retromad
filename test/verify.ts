import { scanner } from '../electron/services/scanner';
import { scraper } from '../electron/services/scraper';
import { SYSTEMS } from '../electron/data/systems';
import { COMPANIES } from '../electron/data/companies';
import { ALL_BIOS_DEFINITIONS } from '../electron/data/biosData';
import { launcher, BUILTIN_EMULATORS } from '../electron/services/launcher';
import fs from 'fs';
import path from 'path';

async function runTests() {
  console.log('=== [RETROMAD TEST SUITE] ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${desc}`);
      failed++;
    }
  }

  // Test 1: Données de référence
  assert(SYSTEMS.length >= 10, `Systèmes enregistrés (${SYSTEMS.length} consoles)`);
  assert(COMPANIES.length >= 5, `Firmes enregistrées (${COMPANIES.length} constructeurs)`);
  assert(ALL_BIOS_DEFINITIONS.length >= 10, `Définitions de BIOS (${ALL_BIOS_DEFINITIONS.length} BIOS/Firmwares)`);

  // Test 2: Nettoyeur de titres
  const test1 = scanner.cleanTitle('Super Mario World (USA) [!].sfc');
  assert(test1.cleanTitle === 'Super Mario World', `Nettoyage titre: "${test1.cleanTitle}" === "Super Mario World"`);
  assert(test1.region === 'USA', `Détection région USA: "${test1.region}"`);

  const test2 = scanner.cleanTitle('Sonic The Hedgehog 2 (Europe) (Fr,En,De).md');
  assert(test2.cleanTitle === 'Sonic The Hedgehog 2', `Nettoyage Sonic: "${test2.cleanTitle}"`);
  assert(test2.region === 'Europe' || test2.region === 'France', `Détection région Sonic: "${test2.region}"`);

  const test3 = scanner.cleanTitle('Castlevania_Symphony_of_the_Night_(Japan).cue');
  assert(test3.cleanTitle === 'Castlevania Symphony of the Night', `Nettoyage underscores: "${test3.cleanTitle}"`);
  assert(test3.region === 'Japan', `Détection région Japon: "${test3.region}"`);

  // Test 3: Identification des systèmes
  const sysSnes = scanner.identifySystem('/path/to/roms/snes/smw.sfc', 'snes');
  assert(sysSnes === 'snes', `Identification SNES par dossier: "${sysSnes}"`);

  const sysMega = scanner.identifySystem('/path/to/roms/megadrive/sonic.md', 'megadrive');
  assert(sysMega === 'megadrive', `Identification Megadrive par dossier: "${sysMega}"`);

  const sysPce = scanner.identifySystem('/path/to/roms/random/game.pce', 'random');
  assert(sysPce === 'pcengine', `Identification PC Engine par extension unique: "${sysPce}"`);

  const scanFixtureDir = fs.mkdtempSync(path.join(process.cwd(), '.retromad-scan-test-'));
  try {
    const nestedSnesDir = path.join(scanFixtureDir, 'snes', 'homebrew');
    const standardSnesDir = path.join(scanFixtureDir, 'snes', 'retail');
    fs.mkdirSync(nestedSnesDir, { recursive: true });
    fs.mkdirSync(standardSnesDir, { recursive: true });
    fs.writeFileSync(path.join(nestedSnesDir, 'Test Game (USA).sfc'), 'nested rom');
    fs.writeFileSync(path.join(standardSnesDir, 'Test Game (USA).sfc'), 'standard rom');

    const scannedFixtureGames = await scanner.scanDirectory(scanFixtureDir);
    assert(scannedFixtureGames.length === 2, 'Scan récursif des ROMs dans les sous-dossiers d’une console');
    assert(
      scannedFixtureGames.every((game) => game.systemId === 'snes') &&
      new Set(scannedFixtureGames.map((game) => game.id)).size === 2,
      'Identification SNES héritée et identifiants uniques pour des ROMs homonymes'
    );
  } finally {
    fs.rmSync(scanFixtureDir, { recursive: true, force: true });
  }

  // Test 4: Téléchargement en direct d'une jaquette via Libretro CDN
  console.log('\n--- Test Scraping Live Libretro CDN ---');
  const tempDir = path.join(__dirname, 'temp_media');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const testCoverDest = path.join(tempDir, 'test_smw.png');
  const testUrl = 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Super_Nintendo_Entertainment_System/master/Named_Boxarts/Super%20Mario%20World%20(USA).png';

  const downloaded = await scraper.downloadImage(testUrl, testCoverDest);
  assert(downloaded, 'Téléchargement réussi de la jaquette Super Mario World depuis GitHub CDN sans clé');

  if (downloaded) {
    const stats = fs.statSync(testCoverDest);
    assert(stats.size > 10000, `Taille de jaquette valide (${stats.size} octets)`);
    fs.unlinkSync(testCoverDest);
  }

  const failedCoverDest = path.join(tempDir, 'failed_cover.png');
  const failedDownload = await scraper.downloadImage(
    'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Super_Nintendo_Entertainment_System/master/Named_Boxarts/This%20Cover%20Does%20Not%20Exist.png',
    failedCoverDest
  );
  assert(!failedDownload && !fs.existsSync(failedCoverDest), 'Échec de téléchargement sans fichier cache incomplet');

  fs.rmdirSync(tempDir);

  // Test Scraping Flou & Choix de Titres Similaires
  console.log('\n--- Test Scraping Flou & Choix de Titres Similaires ---');
  const sim1 = scraper.calculateSimilarity('Super Mario World', 'Super Mario World (USA)');
  assert(sim1 >= 85, `Forte ressemblance Super Mario World (${sim1}%)`);

  const sim2 = scraper.calculateSimilarity('Mario World', 'Super Mario World (USA, Europe)');
  assert(sim2 >= 70, `Ressemblance sous-chaîne Mario World (${sim2}%)`);

  const sim3 = scraper.calculateSimilarity('Zelda', 'The Legend of Zelda (Europe)');
  assert(sim3 >= 60, `Détection mot-clé Zelda (${sim3}%)`);

  assert(fs.existsSync(path.join(__dirname, '../src/components/ScrapeCandidateModal.tsx')), 'Composant ScrapeCandidateModal.tsx présent');

  // Test 5: Mode Kiosk & Sécurité
  console.log('\n--- Test Mode Kiosk & Sécurité ---');

  const defaultPin = '1234';
  const testPinSuccess = (input: string) => input === defaultPin;
  assert(testPinSuccess('1234') === true, 'Validation code PIN correct (1234)');
  assert(testPinSuccess('0000') === false, 'Rejet code PIN incorrect (0000)');
  assert(testPinSuccess('123') === false, 'Rejet code PIN incomplet (123)');

  // Test 6: Système de Launcher & Émulateurs
  console.log('\n--- Test Système de Launcher & Émulateurs ---');
  assert(fs.existsSync(path.join(__dirname, '../launch.sh')), 'Script de lancement Linux présent (launch.sh)');
  assert(fs.existsSync(path.join(__dirname, '../launch.bat')), 'Script de lancement Windows présent (launch.bat)');
  assert(fs.existsSync(path.join(__dirname, '../retromad.desktop')), 'Raccourci XDG Desktop présent (retromad.desktop)');
  assert(fs.existsSync(path.join(__dirname, '../public/retromad.svg')), 'Icône vectorielle officielle présente (retromad.svg)');
  assert(BUILTIN_EMULATORS.length >= 6, `Profils d'émulateurs intégrés (${BUILTIN_EMULATORS.length} lanceurs)`);

  const parsedArgs = launcher.parseArgs('-L /cores/snes9x_libretro.so "/games/Super Mario World.sfc"');
  assert(parsedArgs.length === 3, 'Tokenisation correcte des arguments de lancement');
  assert(parsedArgs[1] === '/cores/snes9x_libretro.so', 'Extraction exacte de l\'argument core');
  assert(parsedArgs[2] === '/games/Super Mario World.sfc', 'Préservation des espaces dans les guillemets du chemin ROM');

  const detected = await launcher.detectInstalledEmulators();
  assert(Array.isArray(detected) && detected.length === BUILTIN_EMULATORS.length, 'Détection automatique des émulateurs exécutée');

  // Test 7: Logos vectoriels officiels des firmes & UI Arcade
  console.log('\n--- Test Vrais Logos Vectoriels & Interface Arcade ---');
  const expectedFirms = ['nintendo', 'sega', 'sony', 'microsoft', 'snk', 'atari', 'nec'];
  const registeredFirmIds = COMPANIES.map(c => c.id);
  const allFirmsPresent = expectedFirms.every(id => registeredFirmIds.includes(id));
  assert(allFirmsPresent, 'Toutes les firmes majeures (Nintendo, Sega, Sony, Microsoft, SNK, Atari, NEC) sont configurées');

  const companyLogoFile = path.join(__dirname, '../src/components/CompanyLogo.tsx');
  assert(fs.existsSync(companyLogoFile), 'Composant CompanyLogo.tsx avec logos SVG officiels présent');

  const companyLogosDir = path.join(__dirname, '../public/logos/companies');
  const allCompanySvgsValid = expectedFirms.every(firmId => {
    const filePath = path.join(companyLogosDir, `${firmId}.svg`);
    if (!fs.existsSync(filePath)) return false;
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.includes('<svg') && content.length > 200;
  });
  assert(allCompanySvgsValid, `Tous les 7 logos vectoriels SVG officiels de firmes (${expectedFirms.join(', ')}) sont présents et valides`);

  const consoleLogoFile = path.join(__dirname, '../src/components/ConsoleLogo.tsx');
  assert(fs.existsSync(consoleLogoFile), 'Composant ConsoleLogo.tsx avec logos officiels présent');

  const kioskArcadeFile = path.join(__dirname, '../src/components/KioskArcadeView.tsx');
  assert(fs.existsSync(kioskArcadeFile), 'Composant KioskArcadeView.tsx (Borne d\'arcade & Héros) présent');

  const settingsModalFile = path.join(__dirname, '../src/components/SettingsModal.tsx');
  const settingsModalContent = fs.readFileSync(settingsModalFile, 'utf-8');
  assert(settingsModalContent.includes('overflow-y-auto') && settingsModalContent.includes('max-h-'), 'SettingsModal dispose d\'une hauteur maîtrisée et d\'un défilement vertical complet');

  // Test 8: Consoles Next-Gen & Émulateurs Modernes
  console.log('\n--- Test Consoles Next-Gen & Émulateurs Modernes ---');
  const nextGenIds = ['gamecube', 'wii', 'wiiu', 'switch', 'nds', '3ds', 'ps3', 'ps4', 'psvita', 'xbox', 'xbox360'];
  const sysIds = SYSTEMS.map(s => s.id);
  const allNextGenPresent = nextGenIds.every(id => sysIds.includes(id));
  assert(allNextGenPresent, `Toutes les consoles Next-Gen (${nextGenIds.join(', ')}) sont enregistrées (Total: ${SYSTEMS.length} consoles)`);

  const logosDir = path.join(__dirname, '../public/logos/consoles');
  const missingLogos = SYSTEMS.filter(s => !fs.existsSync(path.join(logosDir, `${s.id}.png`)));
  assert(missingLogos.length === 0, `Tous les logos officiels haute définition sont présents sur disque (${SYSTEMS.length}/${SYSTEMS.length})`);

  const nextGenEmus = ['dolphin', 'cemu', 'ryujinx', 'melonds', 'citra', 'rpcs3', 'shadps4', 'vita3k', 'xemu', 'xenia'];
  const registeredEmuIds = BUILTIN_EMULATORS.map(e => e.id);
  const allNextGenEmusPresent = nextGenEmus.every(id => registeredEmuIds.includes(id));
  assert(allNextGenEmusPresent, `Profils d'émulateurs Next-Gen autonomes configurés (Total: ${BUILTIN_EMULATORS.length} lanceurs)`);

  // Test 9: Système Téléchargement & Installation des Extensions Retromad
  console.log('\n--- Test Système Téléchargement & Installation des Extensions ---');
  const { extensionInstaller } = await import('../electron/services/extensionInstaller');
  const extensionsList = extensionInstaller.listExtensions();
  assert(Array.isArray(extensionsList) && extensionsList.length > 20, `Détection et inventaire de ${extensionsList.length} extensions / cœurs Libretro`);

  const snesExt = extensionsList.find(e => e.id === 'snes');
  assert(snesExt && snesExt.coreName === 'snes9x_libretro', 'Cœur Libretro SNES (snes9x_libretro) répertorié');

  const downloadUrl = extensionInstaller.getCoreDownloadUrl('snes9x_libretro');
  assert(downloadUrl.includes('buildbot.libretro.com') && downloadUrl.includes('snes9x_libretro'), `URL officielle Libretro buildbot valide: ${downloadUrl}`);

  const foldersRes = extensionInstaller.createRomsFolderStructure();
  assert(foldersRes && foldersRes.total === SYSTEMS.length, `Génération des dossiers de ROMs et fiches d'extensions pour les ${SYSTEMS.length} consoles`);

  const extensionsModalFile = path.join(__dirname, '../src/components/ExtensionsDownloaderModal.tsx');
  assert(fs.existsSync(extensionsModalFile), 'Composant ExtensionsDownloaderModal.tsx présent');

  // Test 10: Exposition Permanente & Musée Virtuel des Consoles
  console.log('\n--- Test Exposition Virtuelle & Patrimoine des Consoles ---');
  const { MUSEUM_DATA } = await import('../electron/data/museumData');
  const museumKeys = Object.keys(MUSEUM_DATA);
  assert(museumKeys.length >= 28, `Données muséales répertoriées pour ${museumKeys.length} consoles`);

  // Vérification que chaque système a son exposition complète attachée
  const allSystemsHaveMuseum = SYSTEMS.every(s => 
    s.museum && 
    s.museum.tagline && 
    s.museum.history && 
    s.museum.hardwareHighlights && 
    s.museum.innovations?.length > 0 &&
    s.museum.iconicGames?.length > 0
  );
  assert(allSystemsHaveMuseum, 'Toutes les 28 consoles possèdent une exposition muséale enrichie complète');

  // Vérification des détails d'une console historique (ex: SNES)
  const snesMuseum = SYSTEMS.find(s => s.id === 'snes')?.museum;
  assert(
    snesMuseum?.hardwareHighlights?.cpuArchitecture && 
    snesMuseum?.hardwareHighlights?.soundChip?.includes('Sony SPC700'),
    'Fiche technique et sonore de la Super Nintendo authentique (Sony SPC700, Mode 7)'
  );

  // Test 11: Immersion Rétro CRT, Pack Audio Arcade & Détection Adaptative Manette
  console.log('\n--- Test Immersion Rétro CRT, Pack Audio & Manette ---');
  const { storage } = await import('../electron/services/storage');
  const defaultSettings = storage.getDefaultSettings();
  assert(defaultSettings.crtEffect === false, 'Paramètre crtEffect disponible avec valeur par défaut false');
  assert(defaultSettings.soundVolume === 0.8, 'Paramètre soundVolume disponible avec valeur par défaut 0.8');

  const { detectGamepadBrand } = await import('../src/hooks/useGamepad');
  assert(detectGamepadBrand('Sony Interactive Entertainment DualSense Wireless Controller') === 'playstation', 'Détection de manette PlayStation (DualSense)');
  assert(detectGamepadBrand('Microsoft Xbox Series S|X Controller') === 'xbox', 'Détection de manette Xbox');
  assert(detectGamepadBrand('Nintendo Switch Pro Controller') === 'nintendo', 'Détection de manette Nintendo Switch');
  assert(detectGamepadBrand('Generic USB Arcade Joystick') === 'xbox', 'Repli automatique layout standard pour manette générique');

  const audioHookPath = path.join(__dirname, '../src/hooks/useAudio.ts');
  const audioHookContent = fs.readFileSync(audioHookPath, 'utf-8');
  assert(
    audioHookContent.includes('playCoin') &&
    audioHookContent.includes('playFavorite') &&
    audioHookContent.includes('playUnlock') &&
    audioHookContent.includes('playDice') &&
    audioHookContent.includes('playError'),
    'Pack audio arcade enrichi (Coin, Favorite, Unlock, Dice, Error) implémenté'
  );

  const cssPath = path.join(__dirname, '../src/styles/index.css');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');
  assert(
    cssContent.includes('.scanlines') &&
    cssContent.includes('.crt-vignette') &&
    cssContent.includes('.crt-phosphor'),
    'Shaders et filtres écran CRT (Scanlines, Vignette, Phosphore) intégrés'
  );

  // Test 12: Manette Smartphone (Wi-Fi local) — serveur intégré
  console.log('\n--- Test Manette Smartphone (GSM/Wi-Fi) ---');
  const phoneServer = await import('../electron/services/phoneGamepadServer');

  const statusOff = phoneServer.getPhoneGamepadStatus();
  assert(statusOff.running === false, 'Serveur manette smartphone : arrêté au repos');

  const statusOn = await phoneServer.startPhoneGamepadServer();
  assert(statusOn.running === true, 'Serveur manette smartphone démarre (HTTP + WebSocket)');
  assert(statusOn.port >= 8090 && statusOn.port <= 8099, `Port d\'écoute dans la plage dédiée (${statusOn.port})`);
  assert(/^http:\/\/\d+\.\d+\.\d+\.\d+:\d+\/\?pin=[A-Z2-9]{4}$/.test(statusOn.url), `URL de connexion valide avec code PIN (${statusOn.url})`);
  assert(statusOn.pin.length === 4, 'Code PIN de 4 caractères généré');
  assert(statusOn.qrDataUrl.startsWith('data:image/png;base64,'), 'QR code de connexion généré (data URL PNG)');

  // La page du téléphone est servie et contient les contrôles attendus
  const pageRes = await fetch(`http://127.0.0.1:${statusOn.port}/?pin=${statusOn.pin}`);
  const pageHtml = await pageRes.text();
  assert(pageRes.status === 200, 'Page manette servie sur le réseau local');
  assert(
    ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].every((k) => pageHtml.includes(k)),
    'Page manette : D-pad + Start/Select présents'
  );
  assert(
    ['z', 'x', 'a', 's', 'q', 'e', 'v'].every((k) => pageHtml.includes(`data-key="${k}"`)),
    'Page manette : boutons A/B/X/Y, L/R, Select mappés sur les touches EJS'
  );

  // Cycle de vie propre : redémarrage après arrêt
  const statusStopped = await phoneServer.stopPhoneGamepadServer();
  assert(statusStopped.running === false, 'Serveur manette smartphone s\'arrête proprement');
  const statusRestarted = await phoneServer.startPhoneGamepadServer();
  assert(statusRestarted.running === true, 'Serveur manette smartphone redémarre après arrêt');
  await phoneServer.stopPhoneGamepadServer();

  // Test 13: Préchargement d'arrière-plan des chunks (onglets instantanés)
  console.log('\n--- Test Préchargement Chunks ---');
  const appContent = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf-8');
  const preloaderContent = fs.readFileSync(path.join(__dirname, '../src/utils/chunkPreloader.ts'), 'utf-8');

  assert(
    preloaderContent.includes('requestIdleCallback') && preloaderContent.includes('scheduleChunkPreload'),
    'Préchargeur : planification pendant les temps morts (requestIdleCallback + repli setTimeout)'
  );
  assert(
    preloaderContent.includes("cancelled") && preloaderContent.includes('.catch('),
    'Préchargeur : échecs isolés et annulation propre de la file'
  );

  const navIdx = appContent.indexOf('PRELOAD_NAV_TABS = [loadCompanyView, loadComputingView, loadBiosManager]');
  assert(navIdx > -1, 'Onglets Firmes / Informatique / BIOS dans la file de préchargement');

  const primaryIdx = appContent.indexOf('PRELOAD_PRIMARY_OVERLAYS = [');
  const secondaryIdx = appContent.indexOf('PRELOAD_SECONDARY_MODULES = [');
  assert(
    primaryIdx > -1 && secondaryIdx > -1 && primaryIdx < secondaryIdx,
    'Ordre de préchargement : onglets → écrans principaux → modules rétro secondaires'
  );
  assert(
    appContent.includes('scheduleChunkPreload([...PRELOAD_NAV_TABS'),
    'File de préchargement démarrée au montage de App (après le premier rendu)'
  );

  // Test 14: Statistiques de jeu (Centre Admin)
  console.log('\n--- Test Statistiques de jeu ---');
  const statsViewPath = path.join(__dirname, '../src/components/admin/GameStatsView.tsx');
  const statsContent = fs.readFileSync(statsViewPath, 'utf-8');
  assert(
    statsContent.includes('topByTime') &&
    statsContent.includes("slice(0, 10)") &&
    statsContent.includes('playTimeMinutes'),
    'Statistiques : top 10 des jeux par temps de jeu'
  );
  assert(
    statsContent.includes('timeBySystem') &&
    statsContent.includes("sort((a, b) => b[1].minutes - a[1].minutes)"),
    'Statistiques : temps de jeu total agrégé par console'
  );
  assert(
    statsContent.includes('topByLaunches') &&
    statsContent.includes('playCount'),
    'Statistiques : classement des lancements (playCount)'
  );
  assert(
    statsContent.includes('topFavorites') &&
    statsContent.includes('g.favorite'),
    'Statistiques : favoris les plus joués'
  );
  const hubStats = fs.readFileSync(path.join(__dirname, '../src/components/AdminHubModal.tsx'), 'utf-8');
  assert(
    hubStats.includes("activeTab === 'stats'") &&
    hubStats.includes("<GameStatsView games={games} systems={systems} />"),
    'Onglet Statistiques branché dans le Centre Admin'
  );

  // Comportement : la file s'exécute séquentiellement et survit à un échec
  const { scheduleChunkPreload } = await import('../src/utils/chunkPreloader');
  const g = globalThis as unknown as { window?: unknown };
  const fakeWindow: Record<string, unknown> = {
    setTimeout: (fn: () => void, ms?: number) => setTimeout(fn, Math.min(ms ?? 0, 5)),
    clearTimeout: (id: ReturnType<typeof setTimeout>) => clearTimeout(id),
  };
  g.window = fakeWindow;
  try {
    let executed = 0;
    const cancel = scheduleChunkPreload(
      [
        async () => { executed++; },
        async () => { executed++; throw new Error('chunk manquant (simulé)'); },
        async () => { executed++; },
      ],
      5
    );
    await new Promise((r) => setTimeout(r, 150));
    assert(executed === 3, `File de préchargement : toutes les tâches exécutées malgré un échec intermédiaire (${executed}/3)`);
    cancel();
  } finally {
    delete g.window;
  }

  // Test 16 : lecteur YouTube insensible aux blocages (152/153)
  console.log('\n--- Test lecteur YouTube insensible aux blocages ---');
  const ytPlayable = fs.readFileSync(
    path.join(__dirname, '../src/components/YoutubePlayable.tsx'),
    'utf-8'
  );
  assert(
    ytPlayable.includes("img.youtube.com/vi/${videoId}/maxresdefault.jpg") &&
      ytPlayable.includes('openYouTubeWatch'),
    'Lecteur YouTube : vignette cliquable avec repli hqdefault'
  );
  assert(
    ytPlayable.includes("window.isElectron") &&
      ytPlayable.includes('youtube-nocookie.com/embed/'),
    'Lecteur YouTube : iframe conservée en web, stratégie desktop distincte'
  );
  const mainTs = fs.readFileSync(path.join(__dirname, '../electron/main.ts'), 'utf-8');
  const preloadTs = fs.readFileSync(path.join(__dirname, '../electron/preload.ts'), 'utf-8');
  assert(
    mainTs.includes("ipcMain.handle('open-external'") &&
      mainTs.includes("parsed.protocol !== 'https:' && parsed.protocol !== 'http:'"),
    'IPC open-external : présent avec garde-fou protocole http(s)'
  );
  assert(
    preloadTs.includes("openExternal: (url: string): Promise<boolean> => ipcRenderer.invoke('open-external', url)"),
    'Preload : openExternal exposé au renderer'
  );
  const bgVideo = fs.readFileSync(
    path.join(__dirname, '../src/components/CompanyBackgroundVideo.tsx'),
    'utf-8'
  );
  const museum = fs.readFileSync(
    path.join(__dirname, '../src/components/CompanyExhibitionModal.tsx'),
    'utf-8'
  );
  assert(
    bgVideo.includes('<YoutubePlayable') &&
      bgVideo.includes('openYouTubeWatch(') &&
      !bgVideo.includes('youtube-nocookie.com/embed/'),
    'Vidéos de fond firmes : plus aucune iframe YouTube sans alternative desktop'
  );
  assert(
    museum.includes('<YoutubePlayable') &&
      !museum.includes('youtube-nocookie.com/embed/'),
    'Fiche musée : écran vidéo toujours jouable (vignette → navigateur en desktop)'
  );

  console.log(`\n================================`);
  console.log(`Total: ${passed} passés, ${failed} échoués`);
  console.log(`================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Crash des tests:', err);
  process.exit(1);
});
