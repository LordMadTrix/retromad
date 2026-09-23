export interface RetroTrivia {
  id: string;
  gameTitle: string;
  system: string;
  year: number;
  fact: string;
  category: 'histoire' | 'anecdote' | 'secret' | 'technique';
}

export const RETRO_TRIVIAS: RetroTrivia[] = [
  {
    id: 'trivia-1',
    gameTitle: 'Street Fighter II',
    system: 'Arcade / SNES',
    year: 1991,
    fact: 'Le système de combo a été inventé par pur hasard ! Akira Nishitani a découvert un bug permettant d\'enchaîner deux attaques pendant l\'animation d\'impact. Il a décidé de laisser ce "glitch" car il pensait que personne n\'aurait le timing assez précis pour l\'exploiter.',
    category: 'anecdote',
  },
  {
    id: 'trivia-2',
    gameTitle: 'Super Mario Bros.',
    system: 'NES / Famicom',
    year: 1985,
    fact: 'Les nuages et les buissons partagent exactement le même sprite graphique en mémoire ! Seule la palette de couleur change (blanc pour le ciel, vert pour le sol) afin d\'économiser les précieux 40 Ko de la cartouche.',
    category: 'technique',
  },
  {
    id: 'trivia-3',
    gameTitle: 'Gradius / Konami Code',
    system: 'NES / Famicom',
    year: 1986,
    fact: 'Le célèbre code Haut Haut Bas Bas Gauche Droite Gauche Droite B A a été créé par Kazuhisa Hashimoto. En adaptant le jeu d\'arcade Gradius sur Famicom, il trouvait le titre trop difficile à tester et a programmé ce raccourci pour avoir tous les power-ups.',
    category: 'secret',
  },
  {
    id: 'trivia-4',
    gameTitle: 'Pac-Man',
    system: 'Arcade',
    year: 1980,
    fact: 'Toru Iwatani a conçu Pac-Man pour rendre les salles d\'arcade plus accueillantes et attirer les femmes et les couples, dans des lieux jusqu\'alors dominés par les shoot\'em up sombres comme Space Invaders.',
    category: 'histoire',
  },
  {
    id: 'trivia-5',
    gameTitle: 'PlayStation',
    system: 'Sony PlayStation',
    year: 1994,
    fact: 'À l\'origine, la PlayStation devait être une extension CD-ROM pour la Super Nintendo, nommée "SNES-CD / Play Station". Lorsque Nintendo a publiquement rompu l\'accord au CES 1991 pour s\'allier avec Philips, Ken Kutaragi a convaincu Sony de créer sa propre console autonome par revanche.',
    category: 'histoire',
  },
  {
    id: 'trivia-6',
    gameTitle: 'Metroid',
    system: 'NES',
    year: 1986,
    fact: 'L\'identité de Samus Aran en tant que femme n\'a été décidée qu\'en plein milieu du développement. Un développeur a demandé à l\'équipe : "Ne serait-ce pas incroyable si la personne sous cette armure cybernétique était en fait une femme ?" Tout le monde a applaudi.',
    category: 'histoire',
  },
  {
    id: 'trivia-7',
    gameTitle: 'Donkey Kong Country',
    system: 'Super Nintendo',
    year: 1994,
    fact: 'Les graphismes pré-calculés sur des stations de travail Silicon Graphics étaient tellement révolutionnaires pour la SNES que Nintendo a d\'abord cru à une blague de Rareware, pensant que les démos tournaient sur du matériel de nouvelle génération.',
    category: 'technique',
  },
  {
    id: 'trivia-8',
    gameTitle: 'Sonic the Hedgehog',
    system: 'Sega Mega Drive',
    year: 1991,
    fact: 'La couleur bleue de Sonic a été spécialement choisie pour s\'accorder avec le logo emblématique de Sega, et ses baskets rouges et blanches ont été inspirées par les bottes du Père Noël et la jaquette de l\'album Bad de Michael Jackson.',
    category: 'anecdote',
  },
];

export interface RetroPasswordEntry {
  id: string;
  gameTitle: string;
  system: string;
  password: string;
  description: string;
  effect: string;
  type: 'text' | 'grid' | 'code';
  gridData?: {
    rows: number;
    cols: number;
    selectedDots: string[]; // e.g. ["A1", "B3", "C5"]
  };
}

export const CULT_PASSWORDS: RetroPasswordEntry[] = [
  {
    id: 'pass-megaman2-all',
    gameTitle: 'Mega Man 2',
    system: 'NES',
    password: 'A1, B2, B4, C1, C3, C5, D4, D5, E2',
    description: 'Dr. Wily Castle Débloqué - Toutes armes & 4 Energy Tanks',
    effect: 'Accès direct à la forteresse finale du Dr. Wily avec tout l\'arsenal au maximum.',
    type: 'grid',
    gridData: {
      rows: 5,
      cols: 5,
      selectedDots: ['A1', 'B2', 'B4', 'C1', 'C3', 'C5', 'D4', 'D5', 'E2'],
    },
  },
  {
    id: 'pass-metroid-justin',
    gameTitle: 'Metroid',
    system: 'NES',
    password: 'JUSTIN BAILEY ------ ------',
    description: 'Samus sans armure (Justaucorps rose) & Arsenal maximal',
    effect: 'Démarre avec tous les missiles, morph ball, bombes, screw attack, et Samus en maillot de bain rose.',
    type: 'text',
  },
  {
    id: 'pass-metroid-narpas',
    gameTitle: 'Metroid',
    system: 'NES',
    password: 'NARPAS SWORD0 000000 000000',
    description: 'Invincibilité Totale & Missiles Infinis',
    effect: 'Énergie infinie et tirs à cadence continue pour traverser tout le labyrinthe de Zebes.',
    type: 'text',
  },
  {
    id: 'pass-castlevania2',
    gameTitle: 'Castlevania II: Simon\'s Quest',
    system: 'NES',
    password: 'URT4 EXVO ZLNE T51S',
    description: 'Simon Belmont niveau max devant le château de Dracula',
    effect: 'Tous les objets légendaires de Dracula rassemblés (cœur, œil, côte, ongle, bague) et fouet de flammes.',
    type: 'text',
  },
  {
    id: 'pass-kidicarus',
    gameTitle: 'Kid Icarus',
    system: 'NES',
    password: 'ICARUS FIGHTS MEDUSA ANGELS',
    description: 'Niveau Final contre Méduse',
    effect: 'Pit dispose des 3 Trésors Sacrés (Arc de Lumière, Ailes de Pégase, Armure Miroir) avec énergie max.',
    type: 'text',
  },
  {
    id: 'pass-prince-persia',
    gameTitle: 'Prince of Persia',
    system: 'Super Nintendo',
    password: 'HEPTAD',
    description: 'Niveau 19 - Dernier Niveau contre le Grand Vizir Jaffar',
    effect: 'Commence directement au palier de l\'affrontement final pour sauver la Princesse.',
    type: 'text',
  },
  {
    id: 'pass-zelda1',
    gameTitle: 'The Legend of Zelda',
    system: 'NES',
    password: 'ZELDA',
    description: 'Nom du fichier : Débloque la Second Quest immédiatement',
    effect: 'Donjons réarrangés, ennemis renforcés et disposition entièrement nouvelle du monde d\'Hyrule.',
    type: 'text',
  },
  {
    id: 'pass-mk-blood',
    gameTitle: 'Mortal Kombat',
    system: 'Sega Mega Drive',
    password: 'A, B, A, C, A, B, B',
    description: 'Blood Code légendaire (Écran d\'avertissement)',
    effect: 'Active le sang rouge original et les véritables Fatalities censurées sur Super Nintendo.',
    type: 'code',
  },
  {
    id: 'pass-sonic-debug',
    gameTitle: 'Sonic the Hedgehog',
    system: 'Sega Mega Drive',
    password: 'Haut, C, Bas, C, Gauche, C, Droite, C',
    description: 'Menu de Sélection des Niveaux & Mode Debug',
    effect: 'Maintenir A + Start à l\'écran-titre après la mélodie du Ring pour choisir son niveau.',
    type: 'code',
  },
];

export interface RetroMagazineReview {
  id: string;
  gameTitle: string;
  system: string;
  magazineName: 'Consoles +' | 'Joypad' | 'Player One' | 'Mega Force';
  issueNumber: string;
  date: string;
  testerName: string;
  graphicsScore: number;
  soundScore: number;
  gameplayScore: number;
  longevityScore: number;
  finalScore: number;
  verdict: string;
  positivePoints: string[];
  negativePoints: string[];
}

export const CULT_MAGAZINE_REVIEWS: RetroMagazineReview[] = [
  {
    id: 'rev-snes-mario-world',
    gameTitle: 'Super Mario World',
    system: 'Super Nintendo',
    magazineName: 'Consoles +',
    issueNumber: 'N° 2',
    date: 'Octobre 1991',
    testerName: 'Wonderfra & AHL',
    graphicsScore: 94,
    soundScore: 91,
    gameplayScore: 98,
    longevityScore: 97,
    finalScore: 96,
    verdict: 'Un chef-d\'œuvre absolu qui justifie à lui seul l\'achat de la Super Famicom ! Les 96 sorties, le dinosaure Yoshi et la maniabilité parfaite définissent le standard du jeu de plates-formes pour les dix prochaines années.',
    positivePoints: ['Yoshi et les ailes magiques', '96 sorties secrètes et Star World', 'Maniabilité intemporelle'],
    negativePoints: ['Quelques ralentissements très rares'],
  },
  {
    id: 'rev-md-sonic',
    gameTitle: 'Sonic The Hedgehog',
    system: 'Sega Mega Drive',
    magazineName: 'Joypad',
    issueNumber: 'N° 1',
    date: 'Novembre 1991',
    testerName: 'J\'m Destroy & Trazom',
    graphicsScore: 95,
    soundScore: 94,
    gameplayScore: 93,
    longevityScore: 90,
    finalScore: 94,
    verdict: 'Une claque technique monumentale ! Les loopings défilent à une vitesse hallucinante sans un seul ralentissement. La Mega Drive crache ses tripes et Sega trouve enfin son héros emblématique.',
    positivePoints: ['Vitesse vertigineuse et scrolling sans faille', 'Musiques chiptune inoubliables de Dreams Come True', 'Direction artistique colorée'],
    negativePoints: ['Un peu court quand on connaît les zones par cœur'],
  },
  {
    id: 'rev-snes-zelda',
    gameTitle: 'The Legend of Zelda: A Link to the Past',
    system: 'Super Nintendo',
    magazineName: 'Player One',
    issueNumber: 'N° 24',
    date: 'Octobre 1992',
    testerName: 'Matt Murdock',
    graphicsScore: 96,
    soundScore: 97,
    gameplayScore: 99,
    longevityScore: 98,
    finalScore: 98,
    verdict: 'LE jeu d\'action-aventure par excellence. L\'ambiance sous la pluie au début, la bascule entre le Monde de la Lumière et le Monde des Ténèbres, et les musiques de Koji Kondo vous marqueront à vie.',
    positivePoints: ['Deux mondes gigantesques interconnectés', 'Des énigmes intelligentes et des boss marquants', 'Bande-son orchestrale somptueuse'],
    negativePoints: ['On aimerait que l\'aventure ne se termine jamais !'],
  },
  {
    id: 'rev-psx-mgs',
    gameTitle: 'Metal Gear Solid',
    system: 'Sony PlayStation',
    magazineName: 'Joypad',
    issueNumber: 'N° 83',
    date: 'Février 1999',
    testerName: 'Gollum & Greg',
    graphicsScore: 95,
    soundScore: 98,
    gameplayScore: 97,
    longevityScore: 92,
    finalScore: 97,
    verdict: 'Une révolution cinématographique dans le jeu vidéo. Le combat contre Psycho Mantis qui lit votre carte mémoire et fait vibrer la DualShock est du pur génie signé Hideo Kojima.',
    positivePoints: ['Mise en scène digne d\'un blockbuster hollywoodien', 'Combats de boss légendaires', 'Doublage et ambiance sonore immersive'],
    negativePoints: ['Durée de vie un peu courte (environ 10-12h)'],
  },
];

export interface MemoryCardSlot {
  slotNumber: number;
  gameTitle: string;
  system: 'PS1' | 'Dreamcast';
  iconPixelArt: string; // emoji or ascii art identifier
  saveName: string;
  playTime: string;
  progressPct: number;
  blocksUsed: number;
  fileSize: string;
  unlockNote: string;
}

export const MOCK_MEMORY_CARD_SLOTS: MemoryCardSlot[] = [
  {
    slotNumber: 1,
    gameTitle: 'Final Fantasy VII',
    system: 'PS1',
    iconPixelArt: '🗡️',
    saveName: 'Cratère Nord - Avant Sephiroth',
    playTime: '64h 22m',
    progressPct: 100,
    blocksUsed: 1,
    fileSize: '8 Ko',
    unlockNote: 'Chevaliers de la Table Ronde acquis, Chocobo Doré & Armes Territoire vaincues',
  },
  {
    slotNumber: 2,
    gameTitle: 'Crash Bandicoot 3: Warped',
    system: 'PS1',
    iconPixelArt: '🦊',
    saveName: 'N. Sanity Complete',
    playTime: '18h 45m',
    progressPct: 105,
    blocksUsed: 1,
    fileSize: '8 Ko',
    unlockNote: '105% de complétion - Toutes les Reliques de Platine',
  },
  {
    slotNumber: 3,
    gameTitle: 'Gran Turismo 2',
    system: 'PS1',
    iconPixelArt: '🏎️',
    saveName: 'Permis S & Garage Ultime',
    playTime: '82h 10m',
    progressPct: 98,
    blocksUsed: 4,
    fileSize: '32 Ko',
    unlockNote: 'Escudo Pikes Peak débloquée, 20 millions de crédits, tous permis Or',
  },
  {
    slotNumber: 4,
    gameTitle: 'Tekken 3',
    system: 'PS1',
    iconPixelArt: '🥊',
    saveName: 'Roster 100% Débloqué',
    playTime: '35h 12m',
    progressPct: 100,
    blocksUsed: 1,
    fileSize: '8 Ko',
    unlockNote: 'Tous les personnages cachés (Gon, Dr. Bosconovitch, Jin alternatif)',
  },
  {
    slotNumber: 5,
    gameTitle: 'Resident Evil 2',
    system: 'PS1',
    iconPixelArt: '🧟',
    saveName: 'Scénario B Léon - Rang S',
    playTime: '2h 15m',
    progressPct: 100,
    blocksUsed: 1,
    fileSize: '8 Ko',
    unlockNote: 'Lance-roquettes munitions infinies & Mode The 4th Survivor débloqué',
  },
];

export interface LanTransferLog {
  id: string;
  timestamp: string;
  sourceIp: string;
  clientDevice: string;
  protocol: 'HTTP' | 'FTP' | 'WebDAV';
  fileName: string;
  targetFolder: string;
  fileSize: string;
  status: 'completed' | 'uploading' | 'failed';
}

export const INITIAL_LAN_LOGS: LanTransferLog[] = [
  {
    id: 'lan-1',
    timestamp: 'Il y a 3 min',
    sourceIp: '192.168.1.34',
    clientDevice: 'iPhone de Seb (Safari)',
    protocol: 'HTTP',
    fileName: 'Chrono_Trigger_FR.sfc',
    targetFolder: 'public/roms/nintendo/snes/',
    fileSize: '4.0 Mo',
    status: 'completed',
  },
  {
    id: 'lan-2',
    timestamp: 'Il y a 14 min',
    sourceIp: '192.168.1.18',
    clientDevice: 'MacBook-Pro-Salon (FileZilla)',
    protocol: 'FTP',
    fileName: 'Castlevania_SOTN_FR.chd',
    targetFolder: 'public/roms/sony/psx/',
    fileSize: '445 Mo',
    status: 'completed',
  },
  {
    id: 'lan-3',
    timestamp: 'Il y a 45 min',
    sourceIp: '192.168.1.52',
    clientDevice: 'PC-Gamer-Windows (Lecteur WebDAV)',
    protocol: 'WebDAV',
    fileName: 'scph1001.bin',
    targetFolder: 'public/bios/',
    fileSize: '512 Ko',
    status: 'completed',
  },
];
