export interface ManualSection {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  category: 'core' | 'arcade' | 'network' | 'retro' | 'advanced';
  iconName: string;
  summary: string;
  screenshotType:
    | 'main_hub'
    | 'kiosk_arcade'
    | 'projector_dual'
    | 'attract_mode'
    | 'lan_server'
    | 'password_notebook'
    | 'centralized_storage'
    | 'theme_jukebox'
    | 'cheats_tournaments'
    | 'shortcuts_cheatsheet';
  keyFeatures: string[];
  stepByStep: { step: number; title: string; instruction: string }[];
  annotatedCallouts: { id: number; label: string; description: string }[];
  proTip: string;
  shortcuts?: { key: string; action: string }[];
}

export const RETROMAD_MANUAL_SECTIONS: ManualSection[] = [
  {
    id: 'main-library',
    number: '01',
    title: 'Interface Principale & Gestion de Bibliothèque',
    subtitle: 'Recherche instantanée, filtres dynamiques, shaders CRT & navigation par consoles',
    category: 'core',
    iconName: 'LayoutGrid',
    summary:
      'L\'interface principale de RetroMAD réunit toutes vos consoles rétro et bornes d\'arcade dans un hub moderne, fluide et ultra réactif.',
    screenshotType: 'main_hub',
    keyFeatures: [
      'Recherche instantanée par nom, développeur ou année',
      'Filtrage par constructeur (Nintendo, SEGA, Sony, Arcade...)',
      'Affichage personnalisable : Grille jaquettes HD, Liste compacte, ou Boîtes 3D rotatives',
      'Filtre CRT Phosphore & Scanlines immersif activable en 1 clic',
      'Scan ultra-rapide des dossiers de ROMs avec reconnaissance automatique des métadonnées'
    ],
    stepByStep: [
      {
        step: 1,
        title: 'Sélectionner un système',
        instruction: 'Cliquez sur l\'icône de votre console (SNES, Megadrive, PS1, Arcade...) dans le bandeau supérieur pour filtrer instantanément vos jeux.'
      },
      {
        step: 2,
        title: 'Rechercher ou filtrer',
        instruction: 'Tapez quelques lettres dans la barre de recherche ou utilisez le filtre par genre (Action, RPG, Plateforme, Combat) et nombre de joueurs.'
      },
      {
        step: 3,
        title: 'Lancer un jeu ou afficher les détails',
        instruction: 'Cliquez directement sur la jaquette pour démarrer la partie avec l\'émulateur associé, ou cliquez sur l\'icône info pour voir le manuel et les astuces.'
      }
    ],
    annotatedCallouts: [
      { id: 1, label: 'Barre de Recherche & Filtres', description: 'Recherche multicritère instantanée avec décompte des titres trouvés.' },
      { id: 2, label: 'Sélecteur de Systèmes', description: 'Accès en 1 clic aux consoles Nintendo, Sega, Sony, Arcade et ordinateurs rétro.' },
      { id: 3, label: 'Bouton Shader CRT', description: 'Active les scanlines et la courbure cathodique des téléviseurs Trinitron.' },
      { id: 4, label: 'Bouton Scanner ROMs', description: 'Actualise la ludothèque et analyse les nouveaux fichiers déposés.' }
    ],
    proTip: 'Appuyez sur la touche "Filtre CRT" pour activer le rendu cathodique réaliste avec balayage 60Hz.',
    shortcuts: [
      { key: 'Ctrl + F', action: 'Placer le curseur dans la recherche de jeux' },
      { key: 'F5', action: 'Actualiser la liste des jeux' },
      { key: 'C', action: 'Activer / Désactiver le filtre d\'écran CRT' }
    ]
  },
  {
    id: 'kiosk-arcade',
    number: '02',
    title: 'Mode Kiosque & Borne d\'Arcade (Cabinet 10-Foot)',
    subtitle: 'Interface grand écran pilotable 100% à la manette ou joystick arcade',
    category: 'arcade',
    iconName: 'Tv',
    summary:
      'Conçu pour transformer n\'importe quel PC ou meuble bartop en authentique borne d\'arcade. Pas besoin de souris : tout se contrôle au D-Pad et aux boutons d\'arcade.',
    screenshotType: 'kiosk_arcade',
    keyFeatures: [
      'Interface 10-foot épurée avec carrousel horizontal des jaquettes et bannières rétro',
      'Navigation 100% Manette / Stick Arcade / Clavier sans curseur parasite',
      'Sons d\'ambiance d\'arcade (Insertion de crédits, select, jingles 8-bit)',
      'Verrouillage sécurisé par code PIN (empêche les invités d\'accéder aux paramètres Windows)',
      'Départ immédiat du jeu sans boîte de dialogue encombrante'
    ],
    stepByStep: [
      {
        step: 1,
        title: 'Activer le Mode Kiosque',
        instruction: 'Cliquez sur le bouton "Mode Kiosque" dans la barre supérieure ou utilisez le raccourci F11.'
      },
      {
        step: 2,
        title: 'Naviguer avec la manette',
        instruction: 'Utilisez la croix directionnelle (D-Pad) ou le joystick pour faire défiler la sélection de jeux. Les boutons A et B servent à valider et reculer.'
      },
      {
        step: 3,
        title: 'Sortir ou déverrouiller l\'admin',
        instruction: 'Cliquez sur le cadenas ou appuyez sur Échap puis saisissez votre code PIN administrateur pour revenir à l\'administration.'
      }
    ],
    annotatedCallouts: [
      { id: 1, label: 'Bannière Marquee & Logo', description: 'Logo lumineux rétro et indicateur de l\'état de la borne.' },
      { id: 2, label: 'Carrousel de Jaquettes 3D', description: 'Défilement fluide avec mise en valeur du jeu sélectionné.' },
      { id: 3, label: 'Fiche Synthétique du Jeu', description: 'Année, genre, éditeur, nombre de joueurs et synopsis en grand format.' },
      { id: 4, label: 'Bouton Code PIN Admin', description: 'Permet de déverrouiller la régie sans exposer le système d\'exploitation.' }
    ],
    proTip: 'Parfait pour les soirées jeux : activez le mode Kiosque avec un code PIN pour que vos amis ne puissent pas modifier la configuration.',
    shortcuts: [
      { key: 'Flèches ← / →', action: 'Défiler entre les jeux du carrousel' },
      { key: 'Entrée / Espace', action: 'Lancer le jeu sélectionné' },
      { key: 'Échap', action: 'Ouvrir le menu de déverrouillage Admin' }
    ]
  },
  {
    id: 'projector-kiosk',
    number: '03',
    title: 'Mode Kiosque sur 2ème Écran & Rétroprojecteur',
    subtitle: 'Architecture Double-Écran : Régie PC Maître + Salle de Projection Cinéma',
    category: 'arcade',
    iconName: 'Projector',
    summary:
      'Diffusez l\'interface Kiosque et le jeu en plein écran sur un rétroprojecteur ou un téléviseur de salon, tout en gardant le contrôle total sur votre écran de PC principal.',
    screenshotType: 'projector_dual',
    keyFeatures: [
      'Gestion native multi-écrans (Détection HDMI / DisplayPort / Miracast)',
      'Écran 1 (PC) : Régie Maître pour rechercher, modifier et lancer les jeux',
      'Écran 2 (Projecteur) : Affichage Kiosque spectateur géant sans menus perturbateurs',
      'Correction trapézoïdale numérique (Keystone vertical de -15° à +15°)',
      'Optimisation pour salle obscure (renforcement des noirs profonds)',
      'Bandeau défilant (Marquee) personnalisable au bas de la toile de projection'
    ],
    stepByStep: [
      {
        step: 1,
        title: 'Brancher votre 2ème écran ou projecteur',
        instruction: 'Reliez votre vidéoprojecteur en HDMI ou configurez l\'affichage étendu sous Windows (Touche Windows + P -> Étendre).'
      },
      {
        step: 2,
        title: 'Ouvrir la calibration Rétroprojecteur',
        instruction: 'Cliquez sur l\'icône "Projecteur" dans la barre supérieure ou dans l\'en-tête du Mode Kiosque.'
      },
      {
        step: 3,
        title: 'Ajuster le format et activer la projection',
        instruction: 'Sélectionnez le ratio (16:9, 4:3 arcade), ajustez le trapèze et le message défilant, puis cliquez sur "ACTIVER SUR LE PROJECTEUR".'
      }
    ],
    annotatedCallouts: [
      { id: 1, label: 'Détecteur d\'Écrans', description: 'Affiche la résolution et l\'assignation de l\'écran PC et du vidéoprojecteur.' },
      { id: 2, label: 'Simulateur de Toile en Direct', description: 'Visualise l\'angle de projection, le keystone et la colorimétrie.' },
      { id: 3, label: 'Curseurs Trapèze & Contraste', description: 'Compense l\'angle physique du projecteur au plafond.' },
      { id: 4, label: 'Bandeau Marquee Personnalisé', description: 'Texte d\'accueil défilant en bas de l\'écran projeté.' }
    ],
    proTip: 'Pour une soirée rétro mémorable, activez le ratio 4:3 sur le vidéoprojecteur : cela préserve les proportions authentiques des tubes cathodiques.',
    shortcuts: [
      { key: 'Win + P', action: 'Basculer Windows en affichage étendu' },
      { key: 'P', action: 'Ouvrir le panneau Rétroprojecteur' }
    ]
  },
  {
    id: 'attract-mode',
    number: '04',
    title: 'Borne d\'Arcade & Attract Mode 3D',
    subtitle: 'Écran de veille interactif avec rotation 3D des boîtes et démos en direct',
    category: 'arcade',
    iconName: 'Sparkles',
    summary:
      'Comme sur les bornes d\'arcade des années 80 et 90, l\'Attract Mode capte le regard avec la rotation spatiale des boîtes de jeux, des anecdotes cultes et le fameux INSERT COIN.',
    screenshotType: 'attract_mode',
    keyFeatures: [
      'Visualisation 3D en temps réel des boîtes de jeux (face, dos, tranche)',
      'Défilement automatique temporisé entre tous les titres de la collection',
      'Générateur de pièces virtuelles (bruit d\'arcade 8-bit avec synthèse audio)',
      'Fiches d\'anecdotes historiques sur les secrets de développement des jeux cultes',
      'Lancement direct du jeu affiché en appuyant simplement sur Espace ou manette'
    ],
    stepByStep: [
      {
        step: 1,
        title: 'Lancer l\'Attract Mode',
        instruction: 'Cliquez sur l\'icône d\'étoile étincelante dans la barre supérieure ou sélectionnez-le dans le Labo Rétro.'
      },
      {
        step: 2,
        title: 'Faire pivoter la boîte de jeu en 3D',
        instruction: 'Utilisez la souris pour faire tourner la boîte de jeu à 360°, ou laissez l\'animation automatique s\'exécuter.'
      },
      {
        step: 3,
        title: 'Insérer un crédit et jouer',
        instruction: 'Appuyez sur la touche "C" ou cliquez sur "Insérer Pièce", puis pressez "Start" pour lancer immédiatement le jeu.'
      }
    ],
    annotatedCallouts: [
      { id: 1, label: 'Boîte de Jeu 3D Interactive', description: 'Rendu 3D avec reflets lumineux et rotation contrôlable.' },
      { id: 2, label: 'Compteur de Crédits Virtuels', description: 'Simulateur de monnayeur avec signal sonore authentique.' },
      { id: 3, label: 'Bannière Anecdote Rétro', description: 'Faits historiques et anecdotes méconnues sur le jeu en cours.' },
      { id: 4, label: 'Bouton Lancer le Jeu', description: 'Démarre immédiatement la partie sans retourner à l\'accueil.' }
    ],
    proTip: 'Laissez tourner l\'Attract Mode sur votre télévision ou borne lors d\'un salon : il attirera immédiatement la curiosité de vos invités.',
    shortcuts: [
      { key: 'C', action: 'Insérer un crédit arcade (son de pièce)' },
      { key: 'Espace', action: 'Lancer le jeu affiché' },
      { key: 'Flèche Droite', action: 'Passer immédiatement au jeu suivant' }
    ]
  },
  {
    id: 'lan-manager',
    number: '05',
    title: 'Passerelle Réseau Local (LAN), Web & FTP',
    subtitle: 'Transférez vos ROMs sans fil depuis un smartphone ou un autre ordinateur',
    category: 'network',
    iconName: 'Wifi',
    summary:
      'Fini les clés USB à brancher et débrancher ! Déposez directement vos ROMs dans RetroMAD depuis votre téléphone ou un ordinateur portable connecté au même Wi-Fi.',
    screenshotType: 'lan_server',
    keyFeatures: [
      'Serveur Web intégré avec page de téléversement (Upload) par glisser-déposer',
      'Génération automatique de QR Code pour ouvrir la page sur smartphone instantanément',
      'Serveur FTP intégré sur le port 2121 pour les gros transferts via FileZilla ou WinSCP',
      'Partage de fichiers WebDAV / Réseau local pour monter le dossier ROMs comme un disque dur',
      'Journal des transferts en temps réel avec calcul d\'espace disque restant'
    ],
    stepByStep: [
      {
        step: 1,
        title: 'Ouvrir la Passerelle Réseau',
        instruction: 'Cliquez sur l\'icône Wi-Fi dans la barre supérieure de RetroMAD.'
      },
      {
        step: 2,
        title: 'Scanner le QR Code ou ouvrir l\'adresse IP',
        instruction: 'Depuis votre smartphone ou autre PC, scannez le QR Code ou tapez l\'adresse indiquée (ex: http://192.168.1.45:8080).'
      },
      {
        step: 3,
        title: 'Glisser vos ROMs',
        instruction: 'Choisissez la console cible (SNES, Megadrive, GBA...) et glissez vos fichiers .zip ou .sfc. Ils sont immédiatement rangés et prêts à jouer !'
      }
    ],
    annotatedCallouts: [
      { id: 1, label: 'Adresse Web & QR Code', description: 'Permet de connecter un smartphone en 2 secondes sans configuration.' },
      { id: 2, label: 'Zone de Glisser-Déposer Web', description: 'Interface de dépôt rapide compatible tous navigateurs.' },
      { id: 3, label: 'Identifiants Serveur FTP', description: 'Hôte, port et accès pour les transferts massifs de jeux CD (PS1, Saturn).' },
      { id: 4, label: 'Journal des Transferts', description: 'Affiche en direct les fichiers reçus avec horodatage et taille.' }
    ],
    proTip: 'Sur votre PC de bureau, ajoutez l\'adresse WebDAV comme lecteur réseau Windows pour gérer vos ROMs comme un disque dur local.',
    shortcuts: [
      { key: 'F8', action: 'Afficher les adresses réseau et le statut du serveur' }
    ]
  },
  {
    id: 'password-notebook',
    number: '06',
    title: 'Carnet Secret de Mots de Passe & Fiches Joypad / VMU',
    subtitle: 'Codes cultes des magazines des années 90 et gestionnaire de cartes mémoires',
    category: 'retro',
    iconName: 'BookOpen',
    summary:
      'Retrouvez le plaisir des vieux carnets à spirales où l\'on notait les mots de passe de Mega Man, Castlevania et Zelda, enrichis des fiches de tests de magazines de l\'époque.',
    screenshotType: 'password_notebook',
    keyFeatures: [
      'Bibliothèque de mots de passe cultes vérifiés (Konami Code, Justin Bailey, etc.)',
      'Filtre par console et recherche instantanée par titre de jeu',
      'Bouton de copie rapide du code dans le presse-papiers pour saisie facile',
      'Fiches de tests et magazines rétro fidèles à l\'ambiance Joypad, Console+ et Player One',
      'Gestionnaire de cartes mémoires virtuelles (sauvegarde d\'états, backup de slots)'
    ],
    stepByStep: [
      {
        step: 1,
        title: 'Ouvrir le Carnet de Mots de Passe',
        instruction: 'Rendez-vous dans le menu "Labo Rétro" puis sélectionnez "Carnet de Mots de Passe & Joypad".'
      },
      {
        step: 2,
        title: 'Chercher votre jeu',
        instruction: 'Entrez le titre (ex: "Metroid" ou "Mega Man") pour afficher les codes de niveau, vies infinies ou déblocages secrets.'
      },
      {
        step: 3,
        title: 'Copier ou consulter la fiche de test',
        instruction: 'Cliquez sur "Copier le Code" ou consultez les avis d\'époque des magazines vintage pour redécouvrir le contexte du jeu.'
      }
    ],
    annotatedCallouts: [
      { id: 1, label: 'Onglets Mots de Passe & Tests', description: 'Bascule entre les codes de triche et les critiques des magazines.' },
      { id: 2, label: 'Bloc de Code Vintage', description: 'Affichage grand format avec police pixel rétro facile à lire en jeu.' },
      { id: 3, label: 'Bouton Copier en 1 Clic', description: 'Place le mot de passe dans le presse-papiers Windows/Linux.' },
      { id: 4, label: 'Fiche Magazine 90s', description: 'Graphismes, jouabilité, son et note globale rédigés dans le style d\'époque.' }
    ],
    proTip: 'Tous les codes sont accessibles sans interrompre votre session de jeu grâce à la fenêtre volante de RetroMAD.',
    shortcuts: [
      { key: 'K', action: 'Ouvrir directement le carnet de codes et astuces' }
    ]
  },
  {
    id: 'centralized-storage',
    number: '07',
    title: 'Dossier Centralisé /public & Gestionnaire de BIOS',
    subtitle: 'Organisation propre des ROMs, BIOS système, jaquettes et sauvegardes',
    category: 'advanced',
    iconName: 'HardDrive',
    summary:
      'RetroMAD structure intelligemment tous vos fichiers sous un répertoire unique `/public` accessible directement sans fouiller dans les dossiers système cachés.',
    screenshotType: 'centralized_storage',
    keyFeatures: [
      'Arborescence unifiée : `/public/roms`, `/public/bios`, `/public/music`, `/public/themes`',
      'Vérification d\'intégrité des BIOS (sommes de contrôle MD5 et SHA1 officielles)',
      'Détection automatique des BIOS manquants pour PlayStation, Neo-Geo, Mega-CD, Saturn',
      'Import direct de packs de ROMs ou de thèmes communautaires',
      'Sauvegarde globale en 1 clic de toutes vos configurations et états de jeux'
    ],
    stepByStep: [
      {
        step: 1,
        title: 'Accéder au gestionnaire de stockage',
        instruction: 'Cliquez sur le bouton "/public Hub" présent dans la barre supérieure de navigation.'
      },
      {
        step: 2,
        title: 'Vérifier la présence des BIOS',
        instruction: 'Consultez la liste des BIOS : les voyants verts indiquent que les fichiers requis (ex: scph1001.bin) sont opérationnels.'
      },
      {
        step: 3,
        title: 'Ouvrir le dossier dans l\'explorateur',
        instruction: 'Cliquez sur "Ouvrir l\'emplacement" pour déposer manuellement vos fichiers dans Windows Explorer ou Linux Nautilus.'
      }
    ],
    annotatedCallouts: [
      { id: 1, label: 'Explorateur d\'Arborescence', description: 'Vue claire des dossiers organisés par système de jeu.' },
      { id: 2, label: 'Statut des Fichiers BIOS', description: 'Indique si les BIOS nécessaires au lancement des jeux CD sont présents.' },
      { id: 3, label: 'Calculateur d\'Espace Disque', description: 'Surveille la place disponible sur votre disque de stockage.' },
      { id: 4, label: 'Bouton Sauvegarde Système', description: 'Archive vos sauvegardes et réglages dans un fichier zip de backup.' }
    ],
    proTip: 'Pour jouer aux jeux PS1 ou Mega-CD, placez impérativement vos fichiers BIOS dans le sous-dossier `/public/bios`.',
    shortcuts: [
      { key: 'B', action: 'Accéder au gestionnaire des BIOS' }
    ]
  },
  {
    id: 'theme-jukebox',
    number: '08',
    title: 'Jukebox Chiptune & Studio de Thèmes Communautaires',
    subtitle: 'Musiques d\'ambiance rétro et personnalisation graphique en direct',
    category: 'core',
    iconName: 'Palette',
    summary:
      'Créez une atmosphère 100% rétro grâce au Jukebox intégré et personnalisez les couleurs de RetroMAD selon vos préférences (Cyberpunk, Arcade 80s, Game Boy monochrome, etc.).',
    screenshotType: 'theme_jukebox',
    keyFeatures: [
      'Lecteur musical flottant chiptune avec pistes cultes (Castlevania, Streets of Rage, Mario)',
      'Studio de thèmes visuels avec prévisualisation en temps réel sans redémarrage',
      'Thèmes prédéfinis : Cyberpunk Néon, Arcade 1984, Game Boy Vert Phosphore, Pure Dark',
      'Personnalisation fine des accents de couleurs, polices de caractères et animations',
      'Partage et exportation de thèmes au format JSON'
    ],
    stepByStep: [
      {
        step: 1,
        title: 'Lancer le Jukebox',
        instruction: 'Cliquez sur l\'icône de note de musique dans la barre supérieure pour ouvrir le mini-lecteur flottant.'
      },
      {
        step: 2,
        title: 'Ouvrir le Studio de Thèmes',
        instruction: 'Cliquez sur le bouton "Thèmes Studio" pour tester les différentes ambiances visuelles.'
      },
      {
        step: 3,
        title: 'Appliquer ou créer un thème',
        instruction: 'Sélectionnez un thème dans la galerie ou personnalisez vos couleurs préférées en 1 clic.'
      }
    ],
    annotatedCallouts: [
      { id: 1, label: 'Mini-Lecteur Jukebox Flottant', description: 'Contrôles lecture/pause, volume sonore et sélection des pistes.' },
      { id: 2, label: 'Sélecteur de Thèmes Prédéfinis', description: 'Aperçu instantané des ambiances Néon, Arcade, CRT et Minimaliste.' },
      { id: 3, label: 'Nuancier de Couleurs d\'Accent', description: 'Permet de changer la couleur des boutons, bordures et lueurs.' },
      { id: 4, label: 'Bouton Sauvegarder Thème', description: 'Conserve vos réglages visuels pour tous vos prochains lancements.' }
    ],
    proTip: 'Le Jukebox peut continuer de jouer en arrière-plan pendant que vous naviguez dans votre ludothèque.',
    shortcuts: [
      { key: 'M', action: 'Activer / Couper la musique du Jukebox' },
      { key: 'N', action: 'Piste musicale suivante' }
    ]
  },
  {
    id: 'cheats-tournaments',
    number: '09',
    title: 'Gestionnaire de Sauvegardes, Triche & Tournois',
    subtitle: 'Save States visuels, codes Action Replay et générateur de tournois arcade',
    category: 'advanced',
    iconName: 'Trophy',
    summary:
      'Des outils avancés pour pousser votre expérience retrogaming plus loin : gestion visuelle des sauvegardes instantanées, codes de triche et organisation de tournois entre amis.',
    screenshotType: 'cheats_tournaments',
    keyFeatures: [
      'Gestionnaire de Save States avec aperçu miniature du point de sauvegarde',
      'Recherche et activation de codes de triche (Vies infinies, invincibilité, déblocage de niveaux)',
      'Générateur d\'arbres de tournois pour soirées (Street Fighter, Mario Kart, Windjammers)',
      'Tirage au sort "Roulette Rétro" pour choisir un jeu au hasard quand on hésite',
      'Tableau des succès et trophées débloqués pour récompenser vos exploits'
    ],
    stepByStep: [
      {
        step: 1,
        title: 'Gérer vos sauvegardes',
        instruction: 'Ouvrez le menu "Sauvegardes" pour visualiser vos états de jeux avec date et capture d\'écran.'
      },
      {
        step: 2,
        title: 'Organiser un tournoi arcade',
        instruction: 'Cliquez sur "Mode Tournoi", entrez les noms des participants : RetroMAD génère automatiquement l\'arbre des matchs.'
      },
      {
        step: 3,
        title: 'Lancer un jeu au hasard',
        instruction: 'Utilisez la "Roulette Rétro" pour défier vos amis sur un jeu tiré au sort parmi votre collection.'
      }
    ],
    annotatedCallouts: [
      { id: 1, label: 'Arbre des Matchs de Tournoi', description: 'Génération automatique des quarts, demis et grande finale.' },
      { id: 2, label: 'Aperçu Miniature des Sauvegardes', description: 'Permet d\'identifier visuellement l\'endroit exact de la partie.' },
      { id: 3, label: 'Interrupteurs de Triche', description: 'Activez ou désactivez les codes Action Replay en direct.' },
      { id: 4, label: 'Bouton Lancer Roulette', description: 'Anime la roue rétro pour sélectionner un titre aléatoire.' }
    ],
    proTip: 'Utilisez la touche F2 pendant une partie pour sauvegarder votre état instantanément, et F4 pour le recharger en une fraction de seconde.',
    shortcuts: [
      { key: 'F2', action: 'Sauvegarde instantanée (Save State)' },
      { key: 'F4', action: 'Rechargement de la sauvegarde (Load State)' },
      { key: 'R', action: 'Tirage d\'un jeu aléatoire (Roulette)' }
    ]
  },
  {
    id: 'shortcuts-guide',
    number: '10',
    title: 'Guide des Raccourcis Clavier & Combinaisons Manettes',
    subtitle: 'Le pense-bête complet pour maîtriser RetroMAD du bout des doigts',
    category: 'core',
    iconName: 'Command',
    summary:
      'Consultez d\'un coup d\'œil toutes les touches et combinaisons d\'arcade indispensables pour naviguer, lancer, sauvegarder et calibrer votre système.',
    screenshotType: 'shortcuts_cheatsheet',
    keyFeatures: [
      'Tableau complet des raccourcis clavier pour PC et borne d\'arcade',
      'Combinaisons manettes (Hotkey + Start pour quitter, Hotkey + X pour le menu)',
      'Navigation sans souris dans tous les menus',
      'Touches de réglage rapide du volume, shaders et mode plein écran',
      'Pense-bête imprimable directement sur une page A4 dédiée'
    ],
    stepByStep: [
      {
        step: 1,
        title: 'Mémoriser les touches essentielles',
        instruction: 'F11 = Plein écran, F1 = Manuel d\'aide, Échap = Retour en arrière, Entrée = Lancer la partie.'
      },
      {
        step: 2,
        title: 'Utiliser la touche Hotkey sur manette',
        instruction: 'Sur manette USB ou Bluetooth, maintenez le bouton "Select" (Hotkey) et appuyez sur Start pour quitter un jeu proprement.'
      },
      {
        step: 3,
        title: 'Exporter ce guide en PDF',
        instruction: 'Cliquez sur le bouton "Exporter en PDF / Imprimer" en haut à droite pour conserver cette fiche au format papier ou fichier.'
      }
    ],
    annotatedCallouts: [
      { id: 1, label: 'Tableau Clavier', description: 'Toutes les commandes clavier organisées par catégorie.' },
      { id: 2, label: 'Schéma Manette Arcade', description: 'Disposition des boutons A/B/X/Y et touches Hotkey universelles.' },
      { id: 3, label: 'Bouton d\'Export PDF', description: 'Génère un document propre prêt pour impression ou partage.' }
    ],
    proTip: 'Imprimez cette page de raccourcis et collez-la à côté de votre borne d\'arcade ou dans la boîte de votre manette !',
    shortcuts: [
      { key: 'F1', action: 'Ouvrir le Guide & Manuel PDF' },
      { key: 'F11', action: 'Basculer en Plein Écran' },
      { key: 'Select + Start', action: 'Quitter le jeu en cours sur manette' },
      { key: 'Select + X', action: 'Ouvrir le menu de configuration de l\'émulateur' }
    ]
  }
];
