@echo off
title RetroMad - Frontend Retrogaming Windows
cd /d "%~dp0"

echo ====================================================
echo    RETROMAD - FRONTEND RETROGAMING WINDOWS
echo ====================================================

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'a pas ete trouve. Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo [*] Installation des dependances npm...
    call npm install
)

if "%1"=="--prod" (
    echo [*] Lancement en mode Production...
    call npm run build
    npx electron .
) else (
    echo [*] Lancement de RetroMad en mode Developpement...
    call npm run dev
)
