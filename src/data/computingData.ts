/**
 * Section INFORMATIQUE — L'histoire des ordinateurs personnels et de leurs
 * systèmes d'exploitation, du premier micro-ordinateur jusqu'à aujourd'hui.
 * Complète la vue Consoles : même principe, côté "bureautique / micro".
 */

export interface OsEra {
  year: number;
  name: string;
  maker: string;
  family: 'pionnier' | 'unix' | 'dos' | 'mac' | 'windows' | 'linux' | 'amiga' | 'autre';
  color: string;
  icon: string; // nom d'icône lucide-react
  description: string;
  funFact?: string;
}

/** Génération d'ordinateurs — classification historique classique (Wikipédia). */
export interface GenEra {
  id: string;
  gen: string;      // « 1re », « 2e »…
  title: string;    // technologie caractéristique
  period: string;   // affichage lisible
  color: string;
  icon: string;     // nom d'icône lucide-react
  description: string;
  machines: string; // machines emblématiques
  funFact?: string;
}

/** Les quatre générations classiques d'ordinateurs — d'après
 *  « Histoire des ordinateurs » (Wikipédia). Affichée au-dessus de la frise OS. */
export const GENERATIONS_TIMELINE: GenEra[] = [
  {
    id: 'gen1',
    gen: '1re',
    title: 'Tubes à vide',
    period: '1936 — 1956',
    color: '#f97316',
    icon: 'Lightbulb',
    description:
      "Les tout premiers ordinateurs électroniques : relais électromécaniques puis tubes à vide — des machines géantes, brûlantes, gourmandes en électricité et perpétuellement en panne. Programmer revient à re-câbler physiquement les panneaux ou à charger des cartes perforées. Née dans les laboratoires et les guerres (balistique, décryptage), l'informatique reste réservée aux armées, aux universités et aux très grandes entreprises.",
    machines:
      'Zuse Z1/Z3 • Atanasoff-Berry Computer • Harvard Mark I • Colossus • ENIAC • SSEM • Ferranti Mark I • UNIVAC I • IBM 701/650/704 • Bull Gamma 3',
    funFact:
      "L'ENIAC aligne 17 468 tubes à vide, 30 tonnes et 160 kW. Et le premier « bug » de l'histoire est littéral : en 1947, l'équipe de Grace Hopper colle dans le journal de bord un vrai papillon de nuit coincé dans un relais du Harvard Mark II.",
  },
  {
    id: 'gen2',
    gen: '2e',
    title: 'Transistors',
    period: '1957 — 1965',
    color: '#22c55e',
    icon: 'Zap',
    description:
      "Le transistor (Bell Labs, 1947) chasse le tube à vide : plus petit, froid, fiable et bien moins cher. Les ordinateurs deviennent industriels et séduisent enfin les entreprises. Cette génération invente la microprogrammation (Wilkes, 1955), les langages évolués (FORTRAN 1957, LISP 1958, COBOL 1959), le premier disque dur (IBM RAMAC 305, 1956) et le premier multiprocesseur multitâche (Bull Gamma 60, 1958).",
    machines:
      'IBM RAMAC 305 (1er disque dur) • Bull Gamma 60 (1er multiprocesseur) • IBM 1401 (10 000+ vendus) • IBM 1620 • DEC PDP-1 (1er interactif, 1960)',
    funFact:
      "Sur le PDP-1 du MIT, des étudiants programment Spacewar! en 1962 : le premier jeu vidéo diffusé à grande échelle. L'ordinateur n'était pas fait pour ça — il n'a jamais vraiment arrêté depuis.",
  },
  {
    id: 'gen3',
    gen: '3e',
    title: 'Circuits intégrés',
    period: '1965 — 1971',
    color: '#0ea5e9',
    icon: 'CircuitBoard',
    description:
      "Grâce à Jack Kilby (Texas Instruments, 1958) puis Robert Noyce (Fairchild, 1959), plusieurs transistors tiennent désormais sur une seule pastille de silicium. Les machines rapetissent, accélèrent et deviennent abordables. Avec l'IBM System/360 (1964), un même programme tourne sur toute une gamme de modèles : la compatibilité logicielle — et la notion de « famille » d'ordinateurs — est née.",
    machines:
      'IBM System/360 • DEC PDP-8 • CDC 6600 (1er supercalculateur, 1964)',
    funFact:
      'Le pari System/360 coûte à IBM 5 milliards de dollars — plus que le projet Manhattan. Quant à Kilby, il recevra le prix Nobel de physique en 2000, 42 ans après avoir bricolé son premier circuit intégré, seul au labo pendant que ses collègues étaient en vacances.',
  },
  {
    id: 'gen4',
    gen: '4e',
    title: 'Microprocesseurs',
    period: "1971 → aujourd'hui",
    color: '#c084fc',
    icon: 'Microchip',
    description:
      "En 1971, Intel grave un processeur complet sur une seule puce : le 4004. En divisant prix et taille par dix, le microprocesseur fait sortir l'ordinateur des salles climatisées : Altair 8800 (1975), Apple II (1977), ZX Spectrum, Commodore 64, Amstrad CPC, IBM PC (1981), Macintosh (1984), Amiga et Atari ST (1985). L'informatique devient personnelle — ce sont précisément ces machines que célèbre cette section.",
    machines:
      'Intel 4004 • Altair 8800 • Apple II • ZX Spectrum • Commodore 64 • Amstrad CPC • IBM PC • Macintosh • Amiga / Atari ST',
    funFact:
      "L'Altair 8800 se vendait en kit, sans clavier ni écran : on le programmait via ses interrupteurs frontaux. Bill Gates et Paul Allen y adaptent un BASIC — le tout premier produit de Microsoft.",
  },
];

/** Frise chronologique des ordinateurs et OS — de la Pascaline (1642) à nos jours.
 *  Jalons historiques d'après « Histoire des ordinateurs » (Wikipédia). */
export const OS_TIMELINE: OsEra[] = [
  {
    year: 1642,
    name: 'La Pascaline',
    maker: 'Blaise Pascal',
    family: 'pionnier',
    color: '#b08968',
    icon: 'Calculator',
    description:
      "La première machine à calculer de l'histoire, réalisée à 19 ans pour soulager son père, percepteur de Rouen. Elle effectue les quatre opérations par engrenages — multiplications et divisions par répétitions. Blaise Pascal est crédité de l'invention de la machine à calculer.",
    funFact: "Une Pascaline signée Pascal (1652) est visible au musée des Arts et Métiers à Paris, avec une reproduction géante qui montre ses mécanismes internes.",
  },
  {
    year: 1834,
    name: 'Machine analytique',
    maker: 'Charles Babbage & Ada Lovelace',
    family: 'pionnier',
    color: '#8d6cab',
    icon: 'Cog',
    description:
      "Le premier ordinateur programmable conçu : calculateur mécanique à vapeur utilisant des cartes perforées (inspirées du métier de Jacquard) pour données ET instructions. Ada Lovelace, fille de Lord Byron, y conçoit le premier programme de l'histoire — la première programmeuse du monde.",
    funFact: "La machine ne fut jamais construite : Babbage lassa son constructeur comme ses financeurs par son arrogance et ses changements de plans successifs. Les programmes d'Ada, eux, étaient justes.",
  },
  {
    year: 1890,
    name: 'Cartes perforées',
    maker: 'Herman Hollerith',
    family: 'pionnier',
    color: '#5a7d9a',
    icon: 'CreditCard',
    description:
      "Pour le recensement américain de 1890, la machine d'Hollerith analyse les cartes perforées deux fois plus vite que ses concurrentes (le précédent recensement avait pris 7 ans !). Sa Tabulating Machine Company fusionnera en 1911 — donnant naissance à IBM.",
    funFact: "Hollerith réutilisait le principe des cartes perforées du métier à tisser de Jacquard, popularisé un siècle plus tôt.",
  },
  {
    year: 1941,
    name: 'Zuse Z3',
    maker: 'Konrad Zuse',
    family: 'pionnier',
    color: '#9a7d5a',
    icon: 'Binary',
    description:
      "Le premier calculateur programmable fonctionnel de l'histoire : 2 600 relais de téléphone, programmes sur bande magnétique, arithmétique binaire et nombres à virgule flottante. A posteriori, il sera déterminé Turing-complet.",
    funFact: "Konrad Zuse, ingénieur allemand, avait peu entendu parler d'Alan Turing : il a tout inventé dans le salon de ses parents. Le Z4 fut ensuite loué à l'ETH Zurich jusqu'en 1955.",
  },
  {
    year: 1945,
    name: 'ENIAC',
    maker: 'Eckert & Mauchly',
    family: 'pionnier',
    color: '#7d5a9a',
    icon: 'Cpu',
    description:
      "Le premier ordinateur entièrement électronique : 17 468 tubes à vide, 30 tonnes, 167 m2, 160 kW pour 100 000 additions par seconde. Commandé par l'armée américaine pour les calculs de balistique — et étonnamment fiable pour l'époque.",
    funFact: "Sa programmatrice Jean Bartik et ses collègues femmes mathématiciennes ont inventé le métier de programmeur — elles n'ont été reconnues que 50 ans plus tard.",
  },
  {
    year: 1947,
    name: 'Le transistor',
    maker: 'Bell Labs',
    family: 'pionnier',
    color: '#c9a227',
    icon: 'Zap',
    description:
      "L'invention du transistor chez Bell Labs remplace le fragile et encombrant tube électronique par un composant plus petit et fiable : c'est la base de la deuxième génération d'ordinateurs (1957-1965) et de toute l'électronique moderne.",
    funFact: "Sans le transistor, pas de micro-ordinateur abordable : chaque tube à vide coûtait cher, chauffait, et mourait. Le transistor miniaturise tout.",
  },
  {
    year: 1948,
    name: 'Architecture von Neumann',
    maker: 'Université de Manchester',
    family: 'pionnier',
    color: '#5a9a6d',
    icon: 'Database',
    description:
      "Le Small-Scale Experimental Machine (SSEM) est la première machine à stocker programmes ET données dans la même mémoire : l'architecture de von Neumann. Tous les ordinateurs actuels en dérivent (Manchester Mark I, EDSAC, EDVAC).",
    funFact: "Avant cette date, reprogrammer l'ENIAC demandait des jours de re-câblage manuel. Après : changer de programme = charger de nouvelles données.",
  },
  {
    year: 1958,
    name: 'Circuit intégré',
    maker: 'Jack Kilby (Texas Instruments)',
    family: 'pionnier',
    color: '#5a9a9a',
    icon: 'CircuitBoard',
    description:
      "Le circuit intégré de Jack Kilby rassemble plusieurs transistors sur un seul semi-conducteur : c'est la troisième génération d'ordinateurs, et à partir de cette date que l'utilisation de l'informatique a explosé.",
    funFact: "Kilby a conçu son premier circuit intégré en septembre 1958, seul au labo pendant que tous ses collègues étaient en vacances — il n'avait pas encore droit aux congés.",
  },
  {
    year: 1969,
    name: 'UNIX',
    maker: 'Bell Labs (Ken Thompson & Dennis Ritchie)',
    family: 'unix',
    color: '#f5a623',
    icon: 'Terminal',
    description:
      "L'ancêtre de presque tout. Conçu sur un PDP-7 dérisoire, UNIX invente l'arborescence de fichiers, le shell et la portabilité (réécrit en C en 1973). Linux, macOS, Android et iOS en descendent directement.",
    funFact: "Le premier UNIX tournait sur une machine de 4 Ko de mémoire. Le nom est un jeu de mots sur « Multics », son projet parent jugé trop gonflé.",
  },
  {
    year: 1971,
    name: 'Intel 4004',
    maker: 'Intel (Federico Faggin)',
    family: 'pionnier',
    color: '#2d7dd2',
    icon: 'Microchip',
    description:
      "Le premier microprocesseur commercial : un CPU complet sur une seule puce de 92 000 transistors... non, 2 300 transistors ! Cette miniaturisation rend possible le micro-ordinateur personnel : l'ère des machines de salon peut commencer.",
    funFact: "Le 4004 avait été commandé par une société japonaise de calculatrices (Busicom). Intel a racheté les droits pour 60 000 $ — la meilleure affaire de son histoire.",
  },
  {
    year: 1974,
    name: 'CP/M',
    maker: 'Digital Research (Gary Kildall)',
    family: 'dos',
    color: '#4a90d9',
    icon: 'FloppyDisk',
    description:
      "Le premier système d'exploitation standard du micro-ordinateur. CP/M tourne sur des centaines de machines 8-bit (Z80/8080) : c'est lui qui invente le format A:, B: des lecteurs de disquettes.",
    funFact: "IBM serait venu d'abord proposer à Kildall d'équiper son PC... la légende dit qu'il était en avion. IBM s'est tourné vers Microsoft, qui a acheté un clone nommé QDOS.",
  },
  {
    year: 1977,
    name: 'Apple DOS',
    maker: 'Apple (Apple II)',
    family: 'mac',
    color: '#9aa0a6',
    icon: 'Monitor',
    description:
      "L'OS de l'Apple II, première machine grand public vendue à des millions d'exemplaires. Les programmes se chargeaient depuis disquette 5,25\" après avoir tapé « RUN APPLE vision »… ou simplement allumé la machine.",
    funFact: "Steve Wozniak a conçu seul la logique de la disquette Apple II, un disque d'une simplicité si géniale que les ingénieurs d'IBM ne comprenaient pas comment il marchait avec aussi peu de puces.",
  },
  {
    year: 1981,
    name: 'MS-DOS 1.0',
    maker: 'Microsoft / IBM PC',
    family: 'dos',
    color: '#0078d4',
    icon: 'SquareTerminal',
    description:
      "Acheté 50 000 $ sous le nom 86-DOS (QDOS de Tim Paterson), MS-DOS devient le système de l'IBM PC. Pendant 15 ans, la ligne noire C:\\> sera la porte d'entrée de l'informatique personnelle mondiale.",
    funFact: "Bill Gates n'a jamais conçu l'OS qui a fait sa fortune : Microsoft l'a acheté à Seattle Computer Products et adapté en urgence pour IBM, avec un contrat qui laissait la licence revendable à d'autres constructeurs — l'accord du siècle.",
  },
  {
    year: 1982,
    name: 'Commodore KERNAL',
    maker: 'Commodore (C64)',
    family: 'autre',
    color: '#8b6fc2',
    icon: 'Cpu',
    description:
      "La ROM du C64 : KERNAL gère écran, clavier, cassettes et disquettes, avec le BASIC 2.0 intégré. Allumer un C64 affichait directement un invite de programmation — des millions d'enfants ont appris à coder là.",
    funFact: "Le nom « KERNAL » est une faute de frappe historique de la documentation (kernel → kernal) que Commodore a gardée et déposée.",
  },
  {
    year: 1984,
    name: 'Macintosh System 1',
    maker: 'Apple',
    family: 'mac',
    color: '#5a5a5a',
    icon: 'Mouse',
    description:
      "La première interface graphique grand public : fenêtres, icônes, corbeille, souris. Inspirée du Xerox PARC (et de Lisa), elle rend l'ordinateur utilisable sans taper une seule commande.",
    funFact: "La police de System 1 était dessinée par Susan Kare, qui créa aussi la corbeille, la montre d'attente et le bonheur de Cmd+Q. Le Macintosh vendu 2 495 $ sortait avec 128 Ko de RAM — moins qu'une photo de profil aujourd'hui.",
  },
  {
    year: 1985,
    name: 'AmigaOS (Kickstart 1.0)',
    maker: 'Commodore-Amiga',
    family: 'amiga',
    color: '#ff6600',
    icon: 'Rainbow',
    description:
      "Le système le plus en avance de sa décennie : véritable multitâche préemptif en 256 Ko, graphisme Workbench, boîtiers Intuition. La presse parlait d'un « ordinateur de 1995 vendu en 1985 ».",
    funFact: "Le premier démoscopage vidéo temps réel numérique (Boing Ball, 1984) faisait tourner une balle damier en 3D sur un prototype — l'effet a bluffé le CES et reste l'icône Amiga.",
  },
  {
    year: 1985,
    name: 'Windows 1.0',
    maker: 'Microsoft',
    family: 'windows',
    color: '#00a4ef',
    icon: 'AppWindow',
    description:
      "Premier Windows : une surcouche graphique au-dessus de MS-DOS, avec fenêtres en mosaïque (pas de chevauchement !), Paint, Notepad et la calculatrice qui existent toujours 40 ans plus tard.",
    funFact: "Apple avait signé un accord autorisant Microsoft à utiliser « certaines » idées du Mac pour Windows 1.0 — le début d'une guerre juridique de 10 ans.",
  },
  {
    year: 1987,
    name: 'Atari TOS / GEM',
    maker: 'Atari (Atari ST)',
    family: 'autre',
    color: '#e05a00',
    icon: 'Cpu',
    description:
      "L'OS de l'Atari ST : GEM offre une interface graphique fluide et le multimédia (MIDI intégré !) pour un prix imbattable. L'ordinateur préféré des musiciens et des studios d'origine.",
    funFact: "Le ST était branché en standard sur les MIDI des synthétiseurs : une énorme partie des hits techno et house des années 90 a été composée sur Atari ST.",
  },
  {
    year: 1990,
    name: 'Windows 3.0',
    maker: 'Microsoft',
    family: 'windows',
    color: '#0078d4',
    icon: 'Grid2x2',
    description:
      "Windows devient enfin bon : vrai gestionnaire de programmes, 256 couleurs, le solitaire (Sudoku viendra plus tard, le Solitaire avait une mission : apprendre le glisser-déposer à la planète entière).",
    funFact: "Windows 3.x s'est vendu à 10 millions d'exemplaires : c'est la version qui a rendu Microsoft incontournable sur PC.",
  },
  {
    year: 1991,
    name: 'Linux 0.01',
    maker: 'Linus Torvalds',
    family: 'linux',
    color: '#f9c440',
    icon: 'Bird',
    description:
      "« Je fais un OS libre (juste un hobby, il ne sera pas gros) » écrit Linus sur Usenet. Le hobby tourne aujourd'hui sur la majorité des serveurs, des supercalculateurs, d'Android et de la Station Spatiale Internationale.",
    funFact: "La première annonce de Linux contenait la phrase « je n'arriverai pas à intégrer tout ce que je voudrais » — 30 ans plus tard, le noyau dépasse 30 millions de lignes de code.",
  },
  {
    year: 1995,
    name: 'Windows 95',
    maker: 'Microsoft',
    family: 'windows',
    color: '#00a4ef',
    icon: 'LayoutGrid',
    description:
      "Le lancement le plus médiatisé de l'informatique (Start Me Up des Rolling Stones !) : menu Démarrer, barre des tâches, 32-bit, Plug & Play. Windows devient LA norme mondiale du bureau.",
    funFact: "Des gens faisaient la queue à minuit devant les magasins pour acheter... une mise à jour de système d'exploitation. 7 millions de licences en 5 semaines.",
  },
  {
    year: 2001,
    name: 'Windows XP',
    maker: 'Microsoft',
    family: 'windows',
    color: '#245edb',
    icon: 'MonitorSmartphone',
    description:
      "Le premier Windows grand public basé sur le noyau NT (fiable, multitâche réel). Collines vertes et ciel bleu : le fond d'écran « Bliss » est la photo la plus vue de l'Histoire. XP a vécu 12 ans de support.",
    funFact: "L'illustre colline de Bliss est une vraie photo de Sonoma County, Californie, prise en 1996 — jamais retouchée.",
  },
  {
    year: 2001,
    name: 'Mac OS X 10.0',
    maker: 'Apple',
    family: 'mac',
    color: '#7d7d82',
    icon: 'Layers',
    description:
      "Apple reconstruit son OS sur les bases NeXT (l'entreprise fondée par Steve Jobs pendant son éviction) et BSD UNIX. Aqua, le Dock et les transitions fluides : le système des 20 années suivantes.",
    funFact: "Retour triomphal : en rachetant NeXT en 1997 pour 429 M$, Apple a récupéré au passage son fondateur — Jobs reprendra la direction quelques mois plus tard.",
  },
  {
    year: 2007,
    name: 'iPhone OS / Android',
    maker: 'Apple & Google',
    family: 'unix',
    color: '#34c759',
    icon: 'Smartphone',
    description:
      "L'informatique passe dans la poche : les deux géants mobiles sont bâtis sur UNIX (Darwin pour iOS, noyau Linux pour Android). L'héritage de 1969 équipe aujourd'hui plusieurs milliards de personnes.",
    funFact: "Android a commencé comme un OS pour appareils photo ! Google a racheté la startup en 2005 et l'a réorientée vers le mobile quand l'iPhone a changé la donne.",
  },
  {
    year: 2015,
    name: 'Windows 10 & Windows 11',
    maker: 'Microsoft',
    family: 'windows',
    color: '#0078d4',
    icon: 'MonitorCog',
    description:
      "Windows en tant que service (mises à jour continues, « dernier Windows » avait promis Microsoft... avant Windows 11 en 2021). Désign modernisé, WSL pour faire tourner Linux DANS Windows : la boucle UNIX est bouclée.",
    funFact: "Windows 10 tourne sur plus d'un milliard de machines actives, et son terminal inute garde l'emoji 🦖 du mode hors-ligne — héritier spirituel du T-Rex de Chrome.",
  },
];

/** Groupes d'époques pour la vue Informatique (machines issues de SYSTEMS). */
export const COMPUTING_ERAS: { id: string; label: string; years: string; systemIds: string[] }[] = [
  {
    id: 'pioneer',
    label: "Les Pionniers",
    years: '1977 — 1982',
    systemIds: ['appleii', 'odyssey2', 'atari8bit', 'vic20', 'pc8000', 'zx81', 'c64'],
  },
  {
    id: 'golden8bit',
    label: "L'Âge d'or 8-bit",
    years: '1982 — 1987',
    systemIds: ['zxspectrum', 'bbcmicro', 'amstradcpc', 'gx4000', 'thomson', 'msx', 'msx2', 'pc8801', 'x1', 'atarist', 'plus4', 'c128'],
  },
  {
    id: 'sixteenbit',
    label: 'La Révolution 16/32-bit & CD',
    years: '1985 — 1995',
    systemIds: ['amiga', 'amiga1200', 'msdos', 'pc9801', 'x68000', 'fmtowns', 'cdi'],
  },
  {
    id: 'msdosversions',
    label: 'Les versions de MS-DOS',
    years: '1981 — 1994',
    systemIds: ['dos1', 'dos2', 'dos3', 'dos4', 'dos5', 'dos6'],
  },
  {
    id: 'windowsversions',
    label: 'Les versions de Windows',
    years: '1985 — 2021',
    systemIds: [
      'win1', 'win2', 'win30', 'win31', 'win95', 'win98', 'winme',
      'win2000', 'winxp', 'winvista', 'win7', 'win10', 'win11',
    ],
  },
  {
    id: 'commodorefamille',
    label: 'La famille Commodore',
    years: '1977 — 1993',
    systemIds: ['pet', 'vic20', 'c64', 'sx64', 'c16', 'plus4', 'c128', 'c64gs', 'amiga', 'amiga600', 'amiga1200', 'cdtv', 'cd32'],
  },
  {
    id: 'amstradcpcfamille',
    label: 'La gamme Amstrad CPC',
    years: '1984 — 1990',
    systemIds: ['cpc464', 'cpc664', 'amstradcpc', 'cpc6128', 'cpcplus', 'gx4000'],
  },
  {
    id: 'msxfamille',
    label: 'La famille MSX',
    years: '1983 — 1990',
    systemIds: ['msx', 'msx2', 'msx2p', 'msxturbor'],
  },
  {
    id: 'atari8bitfamille',
    label: 'La famille Atari 8-bit',
    years: '1979 — 1987',
    systemIds: ['atari8bit', 'xegs'],
  },
];

export const COMPUTING_SYSTEM_IDS = new Set<string>([
  'appleii', 'c64', 'amstradcpc', 'msx', 'msx2', 'atarist', 'amiga', 'msdos',
  'zxspectrum', 'zx81', 'pc8801', 'pc9801', 'amiga1200', 'cdi', 'fmtowns',
  'bbcmicro', 'odyssey2', 'x68000', 'x1', 'atari8bit', 'vic20', 'c128',
  'plus4', 'thomson', 'pc8000', 'gx4000',
  // Versions de MS-DOS et de Windows (famille Microsoft PC)
  'dos1', 'dos2', 'dos3', 'dos4', 'dos5', 'dos6',
  'win1', 'win2', 'win30', 'win31', 'win95', 'win98', 'winme', 'win2000',
  'winxp', 'winvista', 'win7', 'win10', 'win11',
  // Autres modèles Commodore et gamme CPC
  'pet', 'c16', 'sx64', 'cdtv', 'c64gs', 'amiga600', 'cd32',
  'cpc464', 'cpc664', 'cpc6128', 'cpcplus',
  // Complément : MSX2+/turbo R, Macintosh, Atari XE GS
  'msx2p', 'msxturbor', 'macintosh', 'xegs',
]);
