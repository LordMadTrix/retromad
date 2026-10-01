import React, { useState, useEffect, useCallback } from 'react';
import { Bug, ExternalLink, RefreshCw, Plus, User, Calendar, Tag, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { GitHubIssue } from '../../electron/types';

const GITHUB_REPO = 'LordMadTrix/retromad';

const FILTERS: { key: 'all' | 'open' | 'closed'; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'open', label: 'Ouvertes' },
  { key: 'closed', label: 'Fermées' },
];

export const BugTracker: React.FC = () => {
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'closed'>('open');

  const fetchIssues = useCallback(async (state: 'all' | 'open' | 'closed' = 'all') => {
    if (!window.api?.fetchGithubIssues) {
      setError('API GitHub non disponible (mode web limité).');
      setIssues([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.api.fetchGithubIssues(GITHUB_REPO, state);
      if (result.ok && result.issues) {
        // Filtrer les PRs : GitHub Issues API inclut les PRs, on les masque
        const filtered = result.issues.filter((i) => !i.isPullRequest);
        setIssues(filtered);
      } else {
        setError(result.error || 'Erreur inconnue lors du chargement des issues.');
      }
    } catch (e: any) {
      setError(e.message || 'Erreur de connexion au service GitHub.');
      setIssues([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Chargement initial et quand le filtre change
  useEffect(() => {
    fetchIssues(activeFilter);
  }, [activeFilter, fetchIssues]);

  const handleOpenIssue = (htmlUrl: string) => {
    if (window.api?.openExternal) {
      window.api.openExternal(htmlUrl);
    } else {
      window.open(htmlUrl, '_blank');
    }
  };

  const handleReportBug = () => {
    const title = encodeURIComponent('Signaler un bug — RetroMad');
    const bodyLines = [
      '## Description du bug',
      '',
      '[Décrivez le problème rencontré]',
      '',
      '## Environnement',
      '- Système d exploitation : [ex. Linux / Windows]',
      '- Version de RetroMad : [version]',
      '',
      '## Étapes pour reproduire',
      '1. [...]',
      '',
      '## Comportement attendu',
      '[...]',
      '',
    ];
    const body = encodeURIComponent(bodyLines.join('\n'));
    const url = `https://github.com/${GITHUB_REPO}/issues/new?title=${title}&body=${body}`;
    if (window.api?.openExternal) {
      window.api.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const getStateIcon = (state: 'open' | 'closed') => {
    if (state === 'open') {
      return <Circle className="w-4 h-4 text-emerald-400 fill-emerald-400" />;
    }
    return <CheckCircle className="w-4 h-4 text-slate-400 fill-slate-400" />;
  };

  const openCount = issues.filter((i) => i.state === 'open').length;
  const closedCount = issues.filter((i) => i.state === 'closed').length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* En-tête du Bug Tracker */}
      <div className="h-14 bg-slate-950 border-b border-slate-800 shadow-[0_4px_25px_rgba(0,0,0,0.5)] px-4 flex items-center justify-between gap-2 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <Bug className="w-5 h-5 text-rose-400" />
          <h1 className="text-lg font-black tracking-wider text-slate-100">Suivi des Bugs</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Bouton Signaler un bug */}
          <button
            onClick={handleReportBug}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500/20 via-pink-500/25 to-red-500/20 hover:from-rose-500/35 hover:to-red-500/35 border border-rose-500/50 hover:border-rose-400 text-rose-300 hover:text-white text-xs font-bold transition shadow-[0_0_12px_rgba(244,63,94,0.25)] active:scale-95 cursor-pointer"
            title="Signaler un bug sur GitHub"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Signaler un bug</span>
          </button>

          {/* Bouton Actualiser */}
          <button
            onClick={() => fetchIssues(activeFilter)}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-1 p-3 border-b border-slate-800 bg-slate-900/40 shrink-0">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeFilter === filter.key
                ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                : 'bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
            }`}
          >
            {filter.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Circle className="w-3 h-3 text-emerald-400 fill-emerald-400" />
            {openCount} ouverte(s)
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-slate-500 fill-slate-500" />
            {closedCount} fermée(s)
          </span>
          <span className="flex items-center gap-1">
            <Bug className="w-3 h-3 text-slate-500" />
            {issues.length} au total
          </span>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
            <span className="text-sm">Chargement des issues GitHub…</span>
          </div>
        )}

        {error && !isLoading && (
          <div className="m-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {!isLoading && !error && issues.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
            <Bug className="w-10 h-10 opacity-30" />
            <span className="text-sm">Aucune issue trouvée pour ce filtre.</span>
          </div>
        )}

        {!isLoading && !error && issues.length > 0 && (
          <div className="p-3 space-y-2">
            {issues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => handleOpenIssue(issue.htmlUrl)}
                className="group p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-600 hover:bg-slate-800/60 transition cursor-pointer flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStateIcon(issue.state)}
                      <span className="text-xs font-mono text-slate-500">
                        #{issue.number}
                      </span>
                      {issue.isPullRequest && (
                        <Tag className="w-3 h-3 text-purple-400" />
                      )}
                      <span className="text-xs text-slate-600">
                        • {formatDate(issue.createdAt)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-100 group-hover:text-cyan-300 transition">
                      {issue.title}
                    </h3>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition shrink-0" />
                </div>

                {/* Labels */}
                {issue.labels && issue.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {issue.labels.map((label) => (
                      <span
                        key={label.name}
                        className="px-2 py-0.5 rounded text-[10px] font-bold"
                        style={{
                          backgroundColor: label.color ? `#${label.color}` : '#64748a',
                        }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Author & Date */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User className="w-3 h-3" />
                  <span>{issue.user?.login || 'Inconnu'}</span>
                  <Calendar className="w-3 h-3" />
                  <span>Créée le {formatDate(issue.createdAt)}</span>
                  <span>Mis à jour le {formatDate(issue.updatedAt)}</span>
                </div>

                {/* Body preview */}
                {issue.body && (
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {issue.body.replace(/[#*`\[\]]/g, '').substring(0, 150)}
                    {issue.body.length > 150 && '...'}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
