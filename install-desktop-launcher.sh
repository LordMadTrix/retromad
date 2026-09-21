#!/usr/bin/env bash

# Installer le lanceur de bureau RetroMad dans le menu des applications utilisateur
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
TARGET_DIR="$HOME/.local/share/applications"

mkdir -p "$TARGET_DIR"

# Générer le fichier .desktop avec le chemin absolu actuel
cat <<EOF > "$TARGET_DIR/retromad.desktop"
[Desktop Entry]
Version=1.0
Name=RetroMad
Comment=Frontend Retrogaming Moderne (Windows & Linux)
GenericName=Frontend Retrogaming
Exec=$DIR/launch.sh
Icon=$DIR/public/retromad.svg
Terminal=false
Type=Application
Categories=Game;Emulator;ArcadeGame;
StartupNotify=true
StartupWMClass=retromad
Keywords=retro;gaming;arcade;emulator;roms;nes;snes;sega;playstation;
EOF

chmod +x "$TARGET_DIR/retromad.desktop"
update-desktop-database "$TARGET_DIR" 2>/dev/null || true

# Copier également sur le bureau si le dossier existe
DESKTOP_DIR="$(xdg-user-dir DESKTOP 2>/dev/null || echo "$HOME/Desktop")"
if [ -d "$DESKTOP_DIR" ]; then
    cp "$TARGET_DIR/retromad.desktop" "$DESKTOP_DIR/RetroMad.desktop"
    chmod +x "$DESKTOP_DIR/RetroMad.desktop"
    echo "[✓] Raccourci créé sur le Bureau : $DESKTOP_DIR/RetroMad.desktop"
fi

echo "[✓] RetroMad a été ajouté à votre menu d'applications Linux avec succès !"
