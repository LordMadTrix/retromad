# 🕹️ RetroMad — Frontend Retrogaming & Borne d'Arcade

<p align="center">
  <img src="public/media/companies/nintendo.svg" width="90" alt="Nintendo" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="public/media/companies/sega.svg" width="90" alt="Sega" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="public/media/companies/sony.svg" width="90" alt="Sony" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="public/media/companies/snk.svg" width="90" alt="SNK" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="public/media/companies/atari.svg" width="70" alt="Atari" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="public/media/companies/nec.svg" width="70" alt="NEC" />
</p>

<p align="center">
  <strong>Frontend retrogaming moderne, fluide et 100 % arcade pour PC, TV et bornes d'arcade dédiées.</strong><br>
  Compatible nativement avec <strong>Linux</strong> et <strong>Windows</strong> • Navigation à la manette et au joystick • Émulation fluide via RetroArch & Standalone.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Linux%20%7C%20Windows-blue?style=for-the-badge&logo=linux" alt="Linux & Windows" />
  <img src="https://img.shields.io/badge/Stack-React%2018%20%7C%20TypeScript%20%7C%20Vite%20%7C%20Electron-61dafb?style=for-the-badge&logo=react" alt="Tech Stack" />
  <img src="https://img.shields.io/badge/Tests-58%20Pass%C3%A9s-emerald?style=for-the-badge&logo=checkmarx" alt="58 Tests Passed" />
  <img src="https://img.shields.io/badge/License-MIT-purple?style=for-the-badge" alt="License MIT" />
</p>

---

## 🌟 Philosophie : Kiosque en 1er & Administration Unique

RetroMad a été spécialement conçu pour éliminer toute la friction des interfaces complexes :

1. **Démarrage direct sur le Kiosque Arcade** : Allumez votre PC ou votre borne et plongez directement dans votre ludothèque plein écran, avec la roue des firmes, les musiques de fond, les aperçus vidéo et vos jaquettes HD.
2. **Une seule et unique page d'Administration** : Un bouton direct **`[⚙️ Administration]`** (ou touche **F12**) regroupe l'intégralité de vos réglages (scrapers, cœurs, BIOS, manettes, dossiers, backups) dans un centre de contrôle unique et puissant. Fermez l'administration et vous êtes de retour à vos jeux instantanément.

---

## ✨ Les 6 Innovations Majeures de RetroMad

### 1. 🕹️ Mode Démo « Attract Mode » avec « INSERT COIN »
- **Écran de veille arcade automatique** : Après 60 secondes d'inactivité (ou en cliquant sur `[✨ Démo]`), la borne s'anime toute seule.
- Défilement de jeux en vedette, jaquettes et extraits vidéo avec scanlines CRT et citations cultes de l'histoire du jeu vidéo.
- Enseigne néon clignotante **« INSERT COIN / APPUYEZ SUR UN BOUTON »**.
- **Effet sonore de monnayeur réaliste** : Toucher la manette ou le clavier déclenche un son authentique de pièce de monnaie insérée (*« Clink ! »*) et réveille la sélection de jeux.

### 2. 🎮 Raccourci Universel « Quitter le jeu » (Select + Start)
- Plus besoin de chercher son clavier en pleine partie : maintenir **Select + Start** sur n'importe quelle manette quitte instantanément l'émulateur et vous ramène au Kiosque.
- Prise en charge native de la touche **Échap** sur clavier d'arcade.

### 3. 💾 Détection Plug & Play Clé USB (Import en 1 clic)
- Branchez une clé USB ou un disque externe contenant des ROMs : RetroMad la détecte automatiquement sous Linux (`/media`, `/run/media`) ou Windows.
- Une bannière néon apparaît en haut du Kiosque indiquant le nom de la clé et le nombre de ROMs trouvées.
- Le bouton **`[📥 Importer tout]`** copie automatiquement les jeux dans les dossiers des consoles appropriées et lance le scraping en arrière-plan sans quitter la borne.

### 4. 🎲 « Roulette Rétro » / Défi Soirée entre amis
- Accessible via le bouton **`[🎲 Roulette Défi]`** ou la touche **R** (ou bouton dédié sur manette).
- Fini les hésitations devant des centaines de jeux : anime une roulette visuelle et sonore qui sélectionne un jeu au hasard dans la ludothèque.
- Filtres rapides : *Tous les jeux*, *Jeux 2 Joueurs (Combat, Coop)* ou *Par Genre*.

### 5. 📦 Inspection 3D Boîte & Cartouche Physique
- Accessible sur la fiche de chaque jeu (bouton `[📦 Boîte 3D]` ou touches **B** / **S**).
- Rendu 3D interactif pivotant à 180° : admirez le recto, la tranche et le dos de boîte d'époque avec résumé et captures d'écran.
- Vue cartouche physique réaliste adaptée à chaque machine (cartouche grise SNES, noire Genesis/Megadrive, Game Boy, boîtier CD PS1...) avec précautions d'époque et sceau officiel.
- Bouton **« Insérer la cartouche & Jouer »** pour lancer la partie directement.

### 6. 📻 Ambiance Sonore « Salle d'Arcade Années 90 »
- Activez l'ambiance via le bouton **`[📻 Ambiance Arcade]`** dans la barre du Kiosque.
- Synthèse acoustique en temps réel (Web Audio API) reproduisant le brouhaha authentique des salles d'arcade : cloches de flipper lointaines, bleeps 8-bit Pac-Man/Galaga et tintements de pièces.
- S'estompe automatiquement au lancement d'un jeu et reprend à votre retour au Kiosque.

---

## 🏛️ Encyclopédie des 119 Consoles & Firmes Mythiques

RetroMad intègre une encyclopédie patrimoniale complète couvrant l'histoire du jeu vidéo depuis 1972 jusqu'aux générations modernes :

| Constructeur | Consoles & Micro-ordinateurs documentés |
| :--- | :--- |
| **Nintendo 🇯🇵** | NES, Famicom Disk System, Game Boy, Super Nintendo, Virtual Boy, N64, Game Boy Color, Game Boy Advance, GameCube, Nintendo DS, Wii, Pokémon Mini, Nintendo 3DS, Wii U, Nintendo Switch |
| **SEGA 🇯🇵** | SG-1000, Master System, Mega Drive / Genesis, Game Gear, Mega-CD, 32X, Saturn, Nomad, Dreamcast |
| **Sony 🇯🇵** | PlayStation 1, PlayStation 2, PSP, PlayStation 3, PS Vita, PlayStation 4 |
| **SNK 🇯🇵** | Neo-Geo MVS, Neo-Geo AES, Neo-Geo CD, Neo-Geo Pocket, Neo-Geo Pocket Color |
| **NEC 🇯🇵** | PC Engine, SuperGrafx, PC Engine CD-ROM², PC-FX |
| **Microsoft 🇺🇸** | Xbox, Xbox 360, Écosystème PC MS-DOS & Windows (de Windows 1.0 à Windows 11) |
| **Micro-informatique Rétro 💻** | Amiga (500, 1200), Commodore 64, Amstrad CPC, Atari ST, MSX, MSX2, Apple II, ZX Spectrum, Sharp X68000, FM Towns, Thomson TO8 |
| **Pionniers & Arcade 🕹️** | Atari (2600, 5200, 7800, Lynx, Jaguar), ColecoVision, Intellivision, Magnavox Odyssey², Vectrex |

---

## 🎨 Shaders CRT & Immersion Rétro

Basculez à tout moment entre plusieurs filtres graphiques haute fidélité (touche **C** ou raccourci **Alt+C**) :
- **Trinitron PVM** : Phosphore authentique, scanlines horizontales nettes et grille d'ouverture.
- **Arcade 15 kHz** : Balayage cathodique chaud et légère vignette d'écran bombé.
- **DMG Matrix** : Teinte verte matricielle rétro Game Boy avec rémanence d'écran.
- **GBA TFT** : Restitution des couleurs vives de la Game Boy Advance.
- **Vectrex** : Affichage vectoriel lumineux à phosphore bleu/vert.

---

## ⚡ Scraping Flou & Choix des Titres Similaires

- **CDN Libretro officiel (sans clé & gratuit)** : Téléchargement instantané des jaquettes 2D, 3D et captures d'écran.
- **ScreenScraper.fr** : Résumés officiels en français, éditeurs, développeurs, dates de sortie et notes.
- **Détection des titres approchants** : En cas de ROM au nom atypique ou non trouvée, RetroMad propose une modale de sélection avec les correspondances les plus proches (score de ressemblance Levenshtein).

---

## 🚀 Démarrage Rapide

### Prérequis
- **Node.js 18+** (Node 20 ou 22 recommandé)
- **Linux** (Ubuntu, Debian, Arch, Fedora...) ou **Windows 10/11**
- **RetroArch** (ou vos émulateurs favoris) installé sur votre système

### Lancement en 1 clic

#### Sur Linux :
```bash
./launch.sh
```

#### Sur Windows :
```cmd
launch.bat
```

### Installation manuelle & Développement :
```bash
# 1. Cloner le dépôt
git clone https://github.com/LordMadTrix/retromad.git
cd retromad

# 2. Installer les dépendances
npm install

# 3. Lancer en mode développement
npm run dev

# 4. Exécuter la suite de tests automatisés (58 tests)
npm test

# 5. Compiler l'exécutable de production
npm run build
npm run dist
```

---

## 🎮 Raccourcis Clavier & Manette

| Action | Raccourci Manette | Raccourci Clavier |
| :--- | :--- | :--- |
| **Naviguer** | D-Pad / Stick Gauche | Flèches Directionnelles |
| **Choisir / Lancer le jeu** | Bouton A (Sud) / Cross | Entrée |
| **Retour / Niveau supérieur** | Bouton B (Est) / Circle | Échap / Retour Arrière |
| **Quitter le jeu (Émulateur)** | **Select + Start (1s)** | **Échap** |
| **Ouvrir l'Administration** | Bouton Menu / Guide | **F12** / **Ctrl+Shift+A** |
| **Roulette Défi Rétro** | Bouton Random | **R** |
| **Inspecter la Boîte 3D** | Bouton Y (Nord) | **B** ou **S** |
| **Consulter le Musée de la console** | Bouton X (Ouest) | **M** |
| **Ajouter / Retirer des Favoris** | Bouton R3 (Stick Droit) | **F** |
| **Activer le filtre CRT Scanlines** | Bouton L3 (Stick Gauche) | **C** / **Alt+C** |
| **Manuel Utilisateur PDF & Aide** | — | **F1** |
| **Recherche Spotlight Rapide** | — | **Ctrl+K** / **⌘K** |

---

## 📁 Structure des Dossiers de ROMs

RetroMad utilise par défaut le dossier `public/roms/` (ou un dossier personnalisé défini dans le Centre d'Administration) :

```text
roms/
├── snes/          # Super Nintendo (.sfc, .smc)
├── nes/           # Nintendo NES (.nes)
├── megadrive/     # Sega Mega Drive (.md, .gen, .bin)
├── n64/           # Nintendo 64 (.z64, .n64)
├── psx/           # PlayStation 1 (.chd, .cue, .iso)
├── ps2/           # PlayStation 2 (.chd, .iso)
├── gba/           # Game Boy Advance (.gba)
├── dreamcast/     # Sega Dreamcast (.chd, .cdi)
└── ...            # 119 consoles prises en charge
```

---

## 📄 Licence

Ce projet est sous licence **MIT**. Libre d'utilisation, de modification et de distribution pour tout projet personnel ou associatif.
