#!/usr/bin/env bash

# ==============================================================================
# RetroMad - Lanceur Officiel Linux
# ==============================================================================

# Se placer dans le répertoire du script
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR" || exit 1

# Couleurs pour le terminal
CYAN='\033[0;36m'
PINK='\033[0;35m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================${NC}"
echo -e "${PINK}   🕹️   RETROMAD - FRONTEND RETROGAMING LINUX   🕹️   ${NC}"
echo -e "${CYAN}====================================================${NC}"

# Vérifier si Node.js est installé
if ! command -v node >/dev/null 2>&1; then
    echo -e "${YELLOW}[!] Node.js n'est pas détecté. Veuillez installer Node.js (version 18 ou supérieure).${NC}"
    exit 1
fi

# Vérifier si les dépendances npm sont installées
if [ ! -d "node_modules" ]; then
    echo -e "${CYAN}[*] Installation initiale des dépendances (npm install)...${NC}"
    npm install || { echo -e "Échec de l'installation des dépendances."; exit 1; }
fi

# Mode de lancement
if [ "$1" == "--dev" ]; then
    echo -e "${GREEN}[*] Démarrage de RetroMad en mode Développement (Vite HMR)...${NC}"
    npm run dev
else
    # Lancement rapide standard (Production / Bureau)
    if [ ! -f "dist/index.html" ] || [ ! -f "dist-electron/main.js" ] || [ "$1" == "--build" ] || [ "$1" == "--prod" ]; then
        echo -e "${CYAN}[*] Compilation du bundle RetroMad...${NC}"
        npm run build
    fi
    echo -e "${GREEN}[*] Lancement de RetroMad...${NC}"
    ELECTRON_FORCE_PROD=1 npx electron .
fi
