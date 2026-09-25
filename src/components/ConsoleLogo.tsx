import React, { useState } from 'react';
import { System } from '../types';

interface ConsoleLogoProps {
  systemId?: string;
  system?: System;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
  showFallbackText?: boolean;
}

export const ConsoleLogo: React.FC<ConsoleLogoProps> = ({
  systemId,
  system,
  size = 'md',
  className = '',
  alt,
  showFallbackText = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const [retrySrc, setRetrySrc] = useState<string | null>(null);
  const id = system?.id || systemId;

  const sizeClasses = {
    xs: 'h-5 max-w-[100px]',
    sm: 'h-8 max-w-[150px]',
    md: 'h-11 max-w-[200px]',
    lg: 'h-16 max-w-[280px]',
    xl: 'h-24 max-w-[360px]',
  }[size];

  if (!id) return null;

  // Calcul du chemin relatif robuste pour Electron (file://) et Vite dev
  const rawUrl = system?.logoUrl || `./logos/consoles/${id}.png`;
  const primarySrc = rawUrl.startsWith('/') ? `.${rawUrl}` : rawUrl;
  const logoSrc = retrySrc || primarySrc;

  const displayName = system?.shortName || system?.name || id.toUpperCase();
  const themeColor = system?.themeColor || '#00f2fe';

  const handleError = () => {
    // Si la première source échoue, tenter le chemin canonique direct ./logos/consoles/{id}.png
    const fallbackCanonical = `./logos/consoles/${id}.png`;
    if (logoSrc !== fallbackCanonical) {
      setRetrySrc(fallbackCanonical);
    } else {
      setHasError(true);
    }
  };

  if (hasError && !showFallbackText) return null;

  if (hasError) {
    return (
      <span
        style={{
          borderColor: `${themeColor}66`,
          backgroundColor: `${themeColor}22`,
          color: themeColor,
        }}
        className={`px-3 py-1 rounded-xl border text-xs font-black uppercase tracking-wider inline-flex items-center justify-center shrink-0 ${className}`}
      >
        {displayName}
      </span>
    );
  }

  return (
    <img
      src={logoSrc}
      alt={alt || displayName}
      loading="eager"
      onError={handleError}
      className={`${sizeClasses} ${className} max-w-full shrink-0 object-contain object-center inline-block transition-[filter] duration-200 group-hover:brightness-110`}
    />
  );
};
