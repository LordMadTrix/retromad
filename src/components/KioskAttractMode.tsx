import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Game, System } from '../types';

interface KioskAttractModeProps {
  isActive: boolean;
  games: Game[];
  systems: System[];
  onWakeUp: () => void;
  onLaunchGame?: (game: Game) => void;
}

// Phrases d'accroche arcade classiques
const ARCADE_MARQUEES = [
  'INSÉREZ UNE PIÈCE',
  'INSERT COIN TO PLAY',
  'APPUYEZ SUR START',
  'PRESS START BUTTON',
  'JOIN US!',
  'JOUEUR 1 PRÊT ?',
  'PLAYER 1 READY?',
  'HIGH SCORE !',
  'CONTINUE?',
  '1 UP',
];

const HERO_QUOTES = [
  'Le jeu vidéo est la plus jeune des formes d\'expression artistique.',
  'Certains voient des pixels, les vrais voient des souvenirs.',
  'La nostalgie est le meilleur jeu vidéo qui soit.',
  'Chaque ROM est un voyage dans le temps.',
  '"It\'s dangerous to go alone! Take this."',
  '"The princess is in another castle!"',
  '"Do a barrel roll!"',
  '"FINISH HIM!"',
  '"Game Over. Continue? 9... 8... 7..."',
  '"Exceed the 1UP!"',
];

export const KioskAttractMode: React.FC<KioskAttractModeProps> = ({
  isActive,
  games,
  systems,
  onWakeUp,
}) => {
  const [marqueeIdx, setMarqueeIdx] = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [gameIdx, setGameIdx] = useState(0);
  const [isFlashing, setIsFlashing] = useState(true);
  const systemsMap = useRef(new Map(systems.map((s) => [s.id, s])));

  // Actualiser la map quand systems change
  useEffect(() => {
    systemsMap.current = new Map(systems.map((s) => [s.id, s]));
  }, [systems]);

  const featuredGames = games.filter((g) => g.favorite || g.playCount > 0).slice(0, 20);
  const displayGames = featuredGames.length >= 3 ? featuredGames : games.slice(0, 20);
  const currentGame = displayGames[gameIdx];
  const currentSystem = currentGame ? systemsMap.current.get(currentGame.systemId) : undefined;

  // Animation de clignotement du marquee "INSERT COIN"
  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => setIsFlashing((p) => !p), 600);
    return () => clearInterval(timer);
  }, [isActive]);

  // Rotation du marquee
  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      setMarqueeIdx((p) => (p + 1) % ARCADE_MARQUEES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isActive]);

  // Rotation des jeux (toutes les 5 secondes)
  useEffect(() => {
    if (!isActive || displayGames.length === 0) return;
    const timer = setInterval(() => {
      setGameIdx((p) => (p + 1) % displayGames.length);
      setQuoteIdx((p) => (p + 1) % HERO_QUOTES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isActive, displayGames.length]);

  // Écouter tout input utilisateur pour réveiller
  const handleWakeUp = useCallback(() => {
    if (isActive) onWakeUp();
  }, [isActive, onWakeUp]);

  useEffect(() => {
    if (!isActive) return;
    window.addEventListener('click', handleWakeUp);
    window.addEventListener('keydown', handleWakeUp);
    window.addEventListener('mousemove', handleWakeUp);
    window.addEventListener('touchstart', handleWakeUp);
    return () => {
      window.removeEventListener('click', handleWakeUp);
      window.removeEventListener('keydown', handleWakeUp);
      window.removeEventListener('mousemove', handleWakeUp);
      window.removeEventListener('touchstart', handleWakeUp);
    };
  }, [isActive, handleWakeUp]);

  if (!isActive) return null;

  // Couleur thème console actuelle
  const themeColor = currentSystem?.themeColor || '#00f2fe';

  return (
    <div
      className="fixed inset-0 z-[300] select-none overflow-hidden cursor-none"
      style={{ background: `radial-gradient(ellipse at 50% 40%, ${themeColor}15 0%, #000918 65%, #000000 100%)` }}
    >
      {/* Fond étoilé animé */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: Math.random() > 0.85 ? '2px' : '1px',
              height: Math.random() > 0.85 ? '2px' : '1px',
              left: `${(i * 7919) % 100}%`,
              top: `${(i * 4127) % 100}%`,
              opacity: 0.1 + (i % 5) * 0.12,
              animationDuration: `${2 + (i % 4)}s`,
              animationDelay: `${(i % 7) * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Grille scanlines CRT */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.28) 3px, rgba(0,0,0,0.28) 4px)`,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Contenu principal centré */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">

        {/* Logo RETROMAD stylisé arcade */}
        <div className="mb-6">
          <div
            className="text-5xl md:text-7xl font-black tracking-[0.15em] uppercase"
            style={{
              color: themeColor,
              textShadow: `0 0 20px ${themeColor}, 0 0 40px ${themeColor}80, 0 0 80px ${themeColor}40`,
              fontFamily: 'monospace',
            }}
          >
            RETROMAD
          </div>
          <div className="text-base md:text-lg text-slate-400 tracking-[0.5em] font-mono uppercase mt-1">
            MUSEUM OF GAMING
          </div>
        </div>

        {/* Jeu en vedette */}
        {currentGame && currentSystem && (
          <div
            className="mb-6 p-5 rounded-2xl border max-w-sm w-full transition-all duration-1000"
            style={{
              borderColor: `${themeColor}55`,
              backgroundColor: `${themeColor}10`,
              boxShadow: `0 0 30px ${themeColor}20, inset 0 0 20px ${themeColor}05`,
            }}
          >
            <div
              className="text-xs font-bold uppercase tracking-widest mb-2 font-mono"
              style={{ color: themeColor }}
            >
              ── EN VEDETTE ──
            </div>
            <div className="text-xl font-black text-white mb-1">{currentGame.cleanTitle}</div>
            <div
              className="inline-block px-3 py-1 rounded-full text-xs font-bold font-mono"
              style={{ backgroundColor: `${themeColor}30`, color: themeColor, border: `1px solid ${themeColor}50` }}
            >
              {currentSystem.shortName} · {currentSystem.releaseYear}
            </div>
            {currentGame.metadata?.genres?.length && (
              <div className="mt-2 text-xs text-slate-400">{currentGame.metadata.genres.join(' · ')}</div>
            )}
          </div>
        )}

        {/* Citation rétro gaming */}
        <div className="max-w-lg mb-8 italic text-slate-300 text-base opacity-80 transition-all duration-1000">
          "{HERO_QUOTES[quoteIdx]}"
        </div>

        {/* Marquee "INSERT COIN" clignotant */}
        <div
          className="text-xl md:text-2xl font-black tracking-[0.25em] uppercase font-mono transition-opacity duration-100"
          style={{
            color: isFlashing ? themeColor : 'transparent',
            textShadow: isFlashing ? `0 0 20px ${themeColor}, 0 0 40px ${themeColor}80` : 'none',
          }}
        >
          {ARCADE_MARQUEES[marqueeIdx]}
        </div>

        {/* Indicateur de sélection de jeu */}
        {displayGames.length > 1 && (
          <div className="flex items-center space-x-1 mt-8">
            {displayGames.slice(0, Math.min(10, displayGames.length)).map((_, i) => (
              <div
                key={i}
                className="transition-all duration-500 rounded-full"
                style={{
                  width: i === gameIdx % Math.min(10, displayGames.length) ? '20px' : '6px',
                  height: '6px',
                  backgroundColor: i === gameIdx % Math.min(10, displayGames.length) ? themeColor : '#ffffff30',
                  boxShadow: i === gameIdx % Math.min(10, displayGames.length) ? `0 0 8px ${themeColor}` : 'none',
                }}
              />
            ))}
          </div>
        )}

        {/* Info bas de page */}
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center text-xs text-slate-600 font-mono">
          <span className="opacity-60">Touchez l'écran ou appuyez sur n'importe quelle touche pour démarrer</span>
        </div>
      </div>
    </div>
  );
};
