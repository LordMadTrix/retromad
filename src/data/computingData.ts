/**
 * Section INFORMATIQUE — L'histoire des ordinateurs personnels et de leurs
 * systèmes d'exploitation, du premier micro-ordinateur jusqu'à aujourd'hui.
 * Complète la vue Consoles : même principe, côté "bureautique / micro".
 */

export interface OsEra {
  year: number;
  name: string;
  maker: string;
  family: 'unix' | 'dos' | 'mac' | 'windows' | 'linux' | 'amiga' | 'autre';
  color: string;
  icon: string; // nom d'icône lucide-react
  description: string;
  funFact?: string;
}

/** Frise chronologique des OS — du pionnier UNIX aux systèmes modernes. */
export const OS_TIMELINE: OsEra[] = [
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
    systemIds: ['appleii', 'odyssey2', 'c64', 'zx81'],
  },
  {
    id: 'golden8bit',
    label: "L'Âge d'or 8-bit",
    years: '1982 — 1987',
    systemIds: ['zxspectrum', 'bbcmicro', 'amstradcpc', 'msx', 'msx2', 'pc8801', 'atarist'],
  },
  {
    id: 'sixteenbit',
    label: 'La Révolution 16/32-bit & CD',
    years: '1985 — 1995',
    systemIds: ['amiga', 'amiga1200', 'msdos', 'pc9801', 'fmtowns', 'cdi'],
  },
];

export const COMPUTING_SYSTEM_IDS = new Set<string>([
  'appleii', 'c64', 'amstradcpc', 'msx', 'msx2', 'atarist', 'amiga', 'msdos',
  'zxspectrum', 'zx81', 'pc8801', 'pc9801', 'amiga1200', 'cdi', 'fmtowns',
  'bbcmicro', 'odyssey2',
]);
