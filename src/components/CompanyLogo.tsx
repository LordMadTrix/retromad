import React, { useState } from 'react';

interface CompanyLogoProps {
  companyId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  companyId,
  className = '',
  size = 'md',
}) => {
  const [hasError, setHasError] = useState(false);
  const [retrySrc, setRetrySrc] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'h-7 w-[130px]',
    md: 'h-11 w-[200px]',
    lg: 'h-16 w-[280px]',
    xl: 'h-24 w-[360px]',
  }[size];

  if (!companyId) return null;

  const id = companyId.toLowerCase();
  const primarySrc = `./logos/companies/${id}.svg`;
  const logoSrc = retrySrc || primarySrc;

  const handleError = () => {
    // Si svg échoue, essayer png (par exemple si disponible)
    const fallbackPng = `./logos/companies/${id}.png`;
    if (logoSrc !== fallbackPng) {
      setRetrySrc(fallbackPng);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-black uppercase tracking-wider text-slate-300 ${className}`}>
        {companyId.toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={logoSrc}
      alt={companyId}
      onError={handleError}
      className={`${sizeClasses} ${className} max-w-full object-contain object-center transition-transform duration-200`}
      loading="eager"
      decoding="sync"
    />
  );
};
