#!/usr/bin/env bash

# ==============================================================================
# RetroMad - Lanceur Officiel Linux
# ==============================================================================

# Se placer dans le répertoire du script
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR" || exit 1

# PATH renforcé : les lanceurs GUI n'héritent pas toujours du PATH du terminal
# (cas typique : Node installé dans ~/.local/bin, via nvm, volta, etc.)
export PATH="$HOME/.local/bin:$HOME/bin:$PATH"

# Couleurs pour le terminal
CYAN='\033[0;36m'
PINK='\033[0;35m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================${NC}"
echo -e "${PINK}   🕹️   RETROMAD - FRONTEND RETROGAMING LINUX   🕹️   ${NC}"
echo -e "${CYAN}====================================================${NC}"
echo -e "Dossier : ${CYAN}$DIR${NC}"

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

# Installe/met à jour le raccourci du menu d'applications si absent
if [ ! -f "$HOME/.local/share/applications/retromad.desktop" ] \
   || ! grep -q "^Exec=$DIR/launch.sh$" "$HOME/.local/share/applications/retromad.desktop" 2>/dev/null; then
    echo -e "${CYAN}[*] Enregistrement du raccourci RetroMad pour ce dossier...${NC}"
    bash "$DIR/install-desktop-launcher.sh" >/dev/null 2>&1 || true
fi

# Mode développement : serveur Vite (HMR) + fenêtre Electron
if [ "$1" == "--dev" ]; then
    echo -e "${GREEN}[*] Démarrage de RetroMad en mode Développement (Vite + Electron)...${NC}"

    # Port 5173 = celui attendu par electron/main.ts en mode dev
    if curl -s -o /dev/null --max-time 1 http://127.0.0.1:5173/; then
        echo -e "${YELLOW}[*] Un serveur Vite tourne déjà sur 5173, on le réutilise.${NC}"
        VITE_PID=""
    else
        npx vite --host 127.0.0.1 --port 5173 --strictPort &
        VITE_PID=$!
        # Attendre que le serveur réponde (max 15 s)
        for _ in $(seq 1 30); do
            curl -s -o /dev/null --max-time 1 http://127.0.0.1:5173/ && break
            sleep 0.5
        done
    fi

    npx electron .
    RC=$?

    # Arrêter le serveur Vite qu'on a démarré
    if [ -n "$VITE_PID" ]; then
        kill "$VITE_PID" 2>/dev/null
    fi
    exit $RC
fi

# Lancement standard (Production / Bureau) : build si nécessaire
if [ "$1" == "--build" ] || [ "$1" == "--prod" ] \
   || [ ! -f "dist/index.html" ] || [ ! -f "dist-electron/main.js" ] \
   || [ "dist/index.html" -ot "package.json" ]; then
    echo -e "${CYAN}[*] Compilation du bundle RetroMad...${NC}"
    npm run build || { echo -e "${YELLOW}[!] Échec du build. Abandon.${NC}"; exit 1; }
fi

echo -e "${GREEN}[*] Lancement de RetroMad...${NC}"

# Contournement NVIDIA : sur certaines configurations (driver nvidia-drm),
# le processus GPU d'Electron plante (SIGSEGV) -> écran noir/fermeture.
# Le rendu logiciel est activé si un premier essai GPU échoue.
ELECTRON_FORCE_PROD=1 npx electron . "$@"
RC=$?
if [ "$RC" -ne 0 ] && [ -n "${DISPLAY:-}" ]; then
    echo -e "${YELLOW}[!] Plantage GPU détecté, nouvelle tentative en rendu logiciel...${NC}"
    ELECTRON_FORCE_PROD=1 LIBGL_ALWAYS_SOFTWARE=1 npx electron . --disable-gpu "$@"
    RC=$?
fi
exit $RC
