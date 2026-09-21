# RetroMad 🕹️

Frontend retrogaming moderne, fluide et élégant, compatible nativement avec **Windows** et **Linux**. Conçu pour une utilisation sur bureau (clavier/souris) comme sur TV/Canapé (manettes Xbox, PlayStation, 8BitDo, Switch Pro).

![RetroMad Banner](https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Super_Nintendo_Entertainment_System/master/Named_Boxarts/Super%20Mario%20World%20(USA).png)

---

## ✨ Fonctionnalités Principales

### 1. 📂 Gestionnaire de ROMs
- **Arborescence multi-consoles** : Détecte vos ROMs rangées par sous-dossiers (`snes/`, `megadrive/`, `psx/`, `n64/`, `gba/`, etc.) ou dans un dossier personnalisé.
- **Nettoyage automatique des noms** : Supprime les tags No-Intro / GoodTools (`(USA)`, `[!].sfc`, etc.) pour obtenir un titre propre, tout en identifiant la région (🇺🇸 USA, 🇪🇺 Europe/France, 🇯🇵 Japon).
- **Calcul d'empreintes** : Calcul des sommes CRC32 et MD5 pour identification précise.

### 2. 🎨 Scraping Automatique des Jaquettes & Métadonnées
- **Source Libretro CDN (Sans clé & Gratuit)** : Téléchargement instantané des jaquettes 2D haute définition (`Named_Boxarts`) et captures d'écran de jeu (`Named_Snaps`).
- **Source ScreenScraper.fr** : Récupération des résumés en français, dates de sortie, studios/éditeurs, notes et genres (avec support de compte utilisateur).
- **Cache local hors-ligne** : Tous les médias téléchargés sont stockés sur le disque local pour une consultation 100% hors-ligne ultra rapide.
- **Scraping unitaire ou par lot** : Bouton pour rescraper un jeu spécifique ou l'intégralité de la collection avec barre de progression en direct.

### 3. 🏛️ Encyclopédie des Firmes & Histoire
- Fiches documentées des constructeurs mythiques du jeu vidéo : **Nintendo**, **SEGA**, **Sony**, **SNK**, **Atari**, **NEC**.
- Histoire de la marque, pays et année de création, franchises légendaires.
- Spécifications complètes de chaque console (processeur, audio, résolution, type de média, unités vendues).
- Bouton interactif pour basculer directement sur les jeux de la console sélectionnée.

### 4. 💾 Gestionnaire de BIOS & Firmwares
- Indispensable pour l'émulation (PS1, PS2, Saturn, Dreamcast, Neo-Geo, GBA, PC Engine CD...).
- Analyse votre dossier `bios/` et affiche un tableau de conformité :
  - 🟢 **Valide** : Fichier présent et somme MD5 officielle certifiée.
  - 🟡 **Présent** : Fichier détecté avec MD5 différent (dump alternatif).
  - 🔴 **Manquant** : Fichier absent (avec indication du rôle et nom attendu).

### 5. 🎮 Contrôle à la Manette & Rétro Audio
- Prise en charge native des manettes (D-Pad, Stick analogique, A/B/X/Y, LB/RB).
- Répétition fluide et navigation conçue pour grand écran ("10-foot UI").
- Bruitages rétro générés en temps réel par Web Audio API (désactivables).

### 6. 🚀 Lanceur d'Émulateurs Cross-Platform
- Compatible **RetroArch** sous Linux (`/usr/bin/retroarch`) et Windows (`C:\RetroArch-Win64\retroarch.exe`).
- Détection des cœurs appropriés (`snes9x`, `genesis_plus_gx`, `flycast`, `beetle_psx`, etc.).
- Suivi du nombre de parties jouées et date de dernière session.

---

## 🛠️ Installation & Démarrage

### Prérequis
- Node.js 18+ (Node 22 recommandé)
- npm

### Installation des dépendances
```bash
npm install
```

### Lancement en mode développement
```bash
npm run dev
```

### Exécution des tests automatisés
```bash
npm test
```

### Compilation pour distribution (Linux & Windows)
```bash
# Compiler l'application de production
npm run build

# Générer les paquets installables (AppImage/deb sous Linux, exe sous Windows)
npm run dist
```

---

## 📁 Organisation Recommandée des ROMs

Dans votre dossier configuré (`~/RetroMad/Roms` par défaut) :

```text
RetroMad/
├── Roms/
│   ├── snes/          # Super Nintendo (.sfc, .smc, .zip)
│   ├── nes/           # Nintendo NES (.nes, .zip)
│   ├── megadrive/     # Sega Mega Drive (.md, .gen, .bin)
│   ├── mastersystem/  # Sega Master System (.sms)
│   ├── n64/           # Nintendo 64 (.z64, .n64)
│   ├── gb/            # Game Boy (.gb)
│   ├── gbc/           # Game Boy Color (.gbc)
│   ├── gba/           # Game Boy Advance (.gba)
│   ├── psx/           # PlayStation 1 (.cue, .chd, .iso)
│   ├── ps2/           # PlayStation 2 (.iso, .chd)
│   ├── saturn/        # Sega Saturn (.chd, .cue)
│   ├── dreamcast/     # Sega Dreamcast (.chd, .cdi)
│   ├── neogeo/        # Neo-Geo MVS (.zip)
│   └── pcengine/      # PC Engine (.pce, .cue)
└── Bios/              # scph5501.bin, neogeo.zip, dc_boot.bin, etc.
```

---

## 🔒 Mode Kiosk & Mode Administration

RetroMad intègre un système de double profil conçu pour les bornes d'arcade, les événements publics et les enfants :

### 1. Mode Kiosk (Verrouillé)
- **Sécurisé pour le public** : Masque les onglets sensibles (*Paramètres*, *BIOS & Firmwares*) et désactive les boutons de modification (*Scanner*, *Scraper*).
- **Plein écran exclusif** : Mode sans bordure pour éviter la sortie accidentelle de l'application.
- **Option "Favoris uniquement"** : Permet de restreindre la borne aux seuls jeux approuvés par l'administrateur.

### 2. Déverrouillage vers le Mode Administration
- **Code PIN par défaut** : `1234` (modifiable dans les paramètres).
- **Moyens de déverrouillage** :
  - **À la souris** : Clic sur le bouton **"Déverrouiller Admin"** dans l'en-tête.
  - **À la manette** : Appui sur la touche **Start** pour ouvrir le pavé numérique virtuel (saisie D-Pad + validation).
  - **Au clavier** : Raccourci `Ctrl + Shift + A` ou touche `F12`.

---

## 🎮 Raccourcis Manette

| Touche Manette | Action |
|---|---|
| **D-Pad / Stick Gauche** | Naviguer dans la grille des jeux |
| **Bouton A** (Xbox) / **Croix** (PS) | Lancer le jeu / Valider |
| **Bouton B** (Xbox) / **Rond** (PS) | Retour / Fermer la fenêtre |
| **Bouton X** (Xbox) / **Carré** (PS) | Ouvrir la fiche détaillée du jeu |
| **Bouton Y** (Xbox) / **Triangle** (PS) | Ajouter / Retirer des favoris |
| **Gâchettes LB / RB** | Changer rapidement de console |
| **Touche Start** | Ouvrir paramètres (Admin) / Déverrouiller (Kiosk) |

---

## 📄 Licence
Projet open-source sous licence MIT.
