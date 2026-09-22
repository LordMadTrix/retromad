import React, { useState, useEffect } from 'react';
import { Game, System, Company, EmulatorProfile, AppSettings } from '../../types';
import { FileJson, Check, AlertCircle, Save, RotateCcw, Copy } from 'lucide-react';

interface JsonRawEditorProps {
  games: Game[];
  systems: System[];
  companies: Company[];
  emulators: EmulatorProfile[];
  settings: AppSettings;
  onSaveGames: (games: Game[]) => void;
  onSaveSystems: (systems: System[]) => void;
  onSaveCompanies: (companies: Company[]) => void;
  onSaveEmulators: (emulators: EmulatorProfile[]) => void;
  onSaveSettings: (settings: Partial<AppSettings>) => void;
}

type JsonTarget = 'games' | 'systems' | 'companies' | 'emulators' | 'settings' | 'all';

export const JsonRawEditor: React.FC<JsonRawEditorProps> = ({
  games,
  systems,
  companies,
  emulators,
  settings,
  onSaveGames,
  onSaveSystems,
  onSaveCompanies,
  onSaveEmulators,
  onSaveSettings,
}) => {
  const [target, setTarget] = useState<JsonTarget>('games');
  const [jsonText, setJsonText] = useState<string>('');
  const [syntaxError, setSyntaxError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Charger le JSON selon la cible sélectionnée
  const loadTargetJson = (currentTarget: JsonTarget) => {
    let obj: any;
    switch (currentTarget) {
      case 'games':
        obj = games;
        break;
      case 'systems':
        obj = systems;
        break;
      case 'companies':
        obj = companies;
        break;
      case 'emulators':
        obj = emulators;
        break;
      case 'settings':
        obj = settings;
        break;
      case 'all':
        obj = { games, systems, companies, emulators, settings };
        break;
    }
    setJsonText(JSON.stringify(obj, null, 2));
    setSyntaxError(null);
  };

  useEffect(() => {
    loadTargetJson(target);
  }, [target]);

  // Validation à la saisie
  const handleTextChange = (text: string) => {
    setJsonText(text);
    try {
      JSON.parse(text);
      setSyntaxError(null);
    } catch (err: any) {
      setSyntaxError(err.message);
    }
  };

  // Sauvegarde des modifications
  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonText);
      switch (target) {
        case 'games':
          if (!Array.isArray(parsed)) throw new Error('Les jeux doivent être un tableau d\'objets JSON');
          onSaveGames(parsed);
          break;
        case 'systems':
          if (!Array.isArray(parsed)) throw new Error('Les consoles doivent être un tableau d\'objets JSON');
          onSaveSystems(parsed);
          break;
        case 'companies':
          if (!Array.isArray(parsed)) throw new Error('Les firmes doivent être un tableau d\'objets JSON');
          onSaveCompanies(parsed);
          break;
        case 'emulators':
          if (!Array.isArray(parsed)) throw new Error('Les profils doivent être un tableau d\'objets JSON');
          onSaveEmulators(parsed);
          break;
        case 'settings':
          if (typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Les réglages doivent être un objet');
          onSaveSettings(parsed);
          break;
        case 'all':
          if (parsed.games && Array.isArray(parsed.games)) onSaveGames(parsed.games);
          if (parsed.systems && Array.isArray(parsed.systems)) onSaveSystems(parsed.systems);
          if (parsed.companies && Array.isArray(parsed.companies)) onSaveCompanies(parsed.companies);
          if (parsed.emulators && Array.isArray(parsed.emulators)) onSaveEmulators(parsed.emulators);
          if (parsed.settings && typeof parsed.settings === 'object') onSaveSettings(parsed.settings);
          break;
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1500);
    } catch (err: any) {
      setSyntaxError(err.message);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Ignorer
    }
  };

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <FileJson className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Éditeur Brut de Données JSON</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Mode Expert
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Modifiez directement le modèle de données sans passer par les formulaires.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value as JsonTarget)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-400 cursor-pointer"
          >
            <option value="games">Catalogue des Jeux ({games.length})</option>
            <option value="systems">Consoles & Systèmes ({systems.length})</option>
            <option value="companies">Firmes & Constructeurs ({companies.length})</option>
            <option value="emulators">Profils d'Émulateurs ({emulators.length})</option>
            <option value="settings">Configuration & Préférences</option>
            <option value="all">Base Complète (Tout en un)</option>
          </select>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center space-x-1"
            title="Copier le JSON dans le presse-papier"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copié !' : 'Copier'}</span>
          </button>

          <button
            type="button"
            onClick={() => loadTargetJson(target)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center space-x-1"
            title="Recharger depuis la mémoire"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>
        </div>
      </div>

      {/* Éditeur de texte */}
      <div className="relative border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-900/60 text-[11px] font-mono text-slate-400">
          <span>Target: {target}.json</span>
          <span>{jsonText.length.toLocaleString()} caractères</span>
        </div>

        <textarea
          value={jsonText}
          onChange={(e) => handleTextChange(e.target.value)}
          rows={22}
          spellCheck={false}
          className="w-full p-4 bg-slate-950 text-emerald-400 font-mono text-xs leading-relaxed focus:outline-none resize-y selection:bg-purple-500/30 selection:text-white"
        />

        {/* Message d'erreur de syntaxe en direct */}
        {syntaxError && (
          <div className="p-3 bg-rose-950/80 border-t border-rose-500/40 text-xs text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="font-mono">{syntaxError}</span>
          </div>
        )}
      </div>

      {/* Bouton d'application */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-500">
          Les modifications prennent effet immédiatement dans l'interface et sont sauvegardées sur le disque.
        </span>

        <button
          type="button"
          onClick={handleApply}
          disabled={!!syntaxError}
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-purple-600/25 flex items-center space-x-2 cursor-pointer"
        >
          {saveSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{saveSuccess ? 'Enregistré avec succès !' : 'Appliquer & Enregistrer'}</span>
        </button>
      </div>
    </div>
  );
};
