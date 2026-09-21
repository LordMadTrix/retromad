import { Company } from '../types';

export const COMPANIES: Company[] = [
  {
    id: 'nintendo',
    name: 'Nintendo',
    country: 'Japon (Kyoto)',
    founded: 1889,
    logoText: 'NINTENDO',
    accentColor: '#e60012',
    description: 'Fondée initialement en 1889 pour fabriquer des cartes à jouer Hanafuda par Fusajiro Yamauchi, Nintendo s\'est transformée dans les années 70-80 sous l\'impulsion de figures comme Gunpei Yokoi et Shigeru Miyamoto pour devenir le pionnier mondial absolu du jeu vidéo moderne.',
    famousFranchises: ['Super Mario', 'The Legend of Zelda', 'Pokémon', 'Metroid', 'Donkey Kong', 'Kirby', 'Star Fox'],
    consoles: ['nes', 'snes', 'n64', 'gamecube', 'wii', 'wiiu', 'switch', 'gb', 'gbc', 'gba', 'nds', '3ds']
  },
  {
    id: 'sega',
    name: 'SEGA',
    country: 'Japon (Tokyo)',
    founded: 1960,
    logoText: 'SEGA',
    accentColor: '#006699',
    description: 'Née de la fusion entre Service Games et Rosen Enterprises, SEGA a régné sur les salles d\'arcade du monde entier avant d\'engager la guerre mythique des consoles des années 90 ("Sega c\'est plus fort que toi") avec sa mascotte Sonic.',
    famousFranchises: ['Sonic The Hedgehog', 'Streets of Rage', 'Shenmue', 'Shinobi', 'Golden Axe', 'Phantasy Star', 'Virtua Fighter'],
    consoles: ['mastersystem', 'megadrive', 'gamegear', 'saturn', 'dreamcast']
  },
  {
    id: 'sony',
    name: 'Sony Interactive Entertainment',
    country: 'Japon (Tokyo)',
    founded: 1993,
    logoText: 'PlayStation',
    accentColor: '#003791',
    description: 'Après une collaboration avortée avec Nintendo sur un lecteur CD-ROM pour la Super Nintendo, Ken Kutaragi a convaincu Sony de lancer la PlayStation en 1994, révolutionnant l\'industrie avec la 3D démocratisée et le format CD-ROM.',
    famousFranchises: ['Gran Turismo', 'Crash Bandicoot', 'Final Fantasy (époque PS1/PS2)', 'Metal Gear Solid', 'God of War', 'Tekken', 'The Last of Us', 'Uncharted'],
    consoles: ['psx', 'ps2', 'ps3', 'ps4', 'psp', 'psvita']
  },
  {
    id: 'microsoft',
    name: 'Microsoft Gaming (Xbox)',
    country: 'États-Unis (Redmond)',
    founded: 2001,
    logoText: 'XBOX',
    accentColor: '#107c10',
    description: 'Entrée fracassante dans le jeu vidéo de salon en 2001 avec la Xbox originale, puis la reine du multijoueur en ligne Xbox 360 et le Xbox Live. Pionnier du jeu en réseau moderne, des disques durs intégrés et des franchises d\'action spectaculaires.',
    famousFranchises: ['Halo (Master Chief)', 'Gears of War', 'Forza Motorsport / Horizon', 'Fable', 'Banjo-Kazooie'],
    consoles: ['xbox', 'xbox360']
  },
  {
    id: 'snk',
    name: 'SNK (Shin Nihon Kikaku)',
    country: 'Japon (Osaka)',
    founded: 1978,
    logoText: 'NEO•GEO',
    accentColor: '#ffcc00',
    description: 'La Rolls-Royce du jeu vidéo d\'arcade et de salon avec le système Neo-Geo MVS/AES 24-bit. Des cartouches géantes ("100 Mega Shock!"), des sprites titanesques et l\'âge d\'or des jeux de combat 2D.',
    famousFranchises: ['The King of Fighters', 'Metal Slug', 'Fatal Fury', 'Samurai Shodown', 'Art of Fighting'],
    consoles: ['neogeo']
  },
  {
    id: 'atari',
    name: 'Atari',
    country: 'États-Unis (Sunnyvale)',
    founded: 1972,
    logoText: 'ATARI',
    accentColor: '#e31b23',
    description: 'Créée par Nolan Bushnell et Ted Dabney, Atari a littéralement inventé l\'industrie commerciale du jeu vidéo avec Pong et la mythique console de salon Atari 2600 (VCS), marquant l\'âge d\'or des années 70-80.',
    famousFranchises: ['Pong', 'Asteroids', 'Centipede', 'Breakout', 'Tempest', 'Adventure'],
    consoles: ['atari2600', 'atari7800', 'lynx']
  },
  {
    id: 'nec',
    name: 'NEC Home Electronics',
    country: 'Japon (Tokyo)',
    founded: 1899,
    logoText: 'PC-ENGINE',
    accentColor: '#ea5404',
    description: 'En partenariat avec Hudson Soft, le géant de l\'électronique NEC a conçu la PC-Engine (TurboGrafx-16), une merveille de compacité 8-bit boostée avec processeur graphique 16-bit et première console à adopter le format CD-ROM², très culte au Japon et en France.',
    famousFranchises: ['Bonk (PC Kid)', 'Castlevania: Rondo of Blood', 'Ys', 'Bomberman', 'Air Zonk'],
    consoles: ['pcengine']
  }
];
