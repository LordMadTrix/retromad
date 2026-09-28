import React, { useMemo, useState } from 'react';
import { Eye, EyeOff, Star, ArrowUp, ArrowDown, Search, X, Check, GripVertical } from 'lucide-react';
import { AppSettings, Company, System, Game } from '../../types';

interface KioskCustomizeViewProps {
  settings: AppSettings;
  onSaveSettings: (partial: Partial<AppSettings>) => void;
  companies: Company[];
  systems: System[];
  games: Game[];
}

const WIDGETS: { id: string; label: string; desc: string }[] = [
  { id: 'featured', label: '⭐ Mes Vedettes', desc: 'Carrousel des jeux épinglés sur l’accueil de la borne' },
  { id: 'credits', label: '🪙 Crédits Arcade', desc: 'Compteur « CRÉDITS : 99 » (monnayeur sonore)' },
  { id: 'random', label: '🎲 Jeu au Hasard', desc: 'Bouton de tirage aléatoire (touche R)' },
  { id: 'music', label: '🎵 Jukebox Chiptune', desc: 'Musique 8/16-bit dans la borne' },
  { id: 'roulette', label: '🎯 Roulette Rétro', desc: 'Défi du jour & roulette de jeux' },
  { id: 'achievements', label: '🏆 Succès', desc: 'RetroAchievements & trophées' },
  { id: 'tournament', label: '⚔️ Tournois', desc: 'Tournois arcade multijoueurs' },
  { id: 'manuals', label: '📖 Manuels', desc: 'Notices d’époque des jeux' },
  { id: 'shaders', label: '📺 Shaders', desc: 'Changement de profil CRT à chaud' },
  { id: 'shelf', label: '🕹️ Étagère 3D', desc: 'Cartouches physiques en 3D' },
  { id: 'speedrun', label: '⏱️ Speedrun', desc: 'Chronomètre arcade' },
];

export const KioskCustomizeView: React.FC<KioskCustomizeViewProps> = ({
  settings,
  onSaveSettings,
  companies,
  systems,
  games,
}) => {
  const widgets = settings.kioskWidgets ?? {};
  const hiddenCompanies = useMemo(() => new Set(settings.kioskHiddenCompanies ?? []), [settings.kioskHiddenCompanies]);
  const hiddenSystems = useMemo(() => new Set(settings.kioskHiddenSystems ?? []), [settings.kioskHiddenSystems]);
  const companyOrder = settings.kioskCompanyOrder ?? [];
  const featured = settings.kioskFeaturedGames ?? [];

  const [machineCompanyFilter, setMachineCompanyFilter] = useState<string>('all');
  const [gameSearch, setGameSearch] = useState('');
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  const flash = (msg: string) => {
    setSavedFlash(msg);
    setTimeout(() => setSavedFlash(null), 1400);
  };

  const toggleWidget = (id: string) => {
    const next = { ...widgets, [id]: widgets[id] === false };
    onSaveSettings({ kioskWidgets: next });
    flash(next[id] === false ? 'Widget masqué' : 'Widget affiché');
  };

  // Ordre des firmes : ordre personnalisé puis nouvelles firmes à la fin
  const orderedCompanies = useMemo(() => {
    const byId = new Map(companies.map((c) => [c.id, c]));
    const list: Company[] = [];
    companyOrder.forEach((id) => {
      const c = byId.get(id);
      if (c) {
        list.push(c);
        byId.delete(id);
      }
    });
    list.push(...byId.values());
    return list;
  }, [companies, companyOrder]);

  const moveCompany = (id: string, dir: -1 | 1) => {
    const ids = orderedCompanies.map((c) => c.id);
    const i = ids.indexOf(id);
    const j = i + dir;
    if (i === -1 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    onSaveSettings({ kioskCompanyOrder: ids });
    flash('Ordre des firmes enregistré');
  };

  const toggleCompanyHidden = (id: string) => {
    const next = new Set(hiddenCompanies);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSaveSettings({ kioskHiddenCompanies: [...next] });
    flash(next.has(id) ? 'Firme masquée de la borne' : 'Firme affichée dans la borne');
  };

  const toggleSystemHidden = (id: string) => {
    const next = new Set(hiddenSystems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSaveSettings({ kioskHiddenSystems: [...next] });
    flash(next.has(id) ? 'Machine masquée' : 'Machine affichée');
  };

  const toggleFeatured = (gameId: string) => {
    const next = featured.includes(gameId)
      ? featured.filter((g) => g !== gameId)
      : [...featured, gameId];
    onSaveSettings({ kioskFeaturedGames: next });
    flash(featured.includes(gameId) ? 'Retiré des vedettes' : 'Épinglé en vedette ⭐');
  };

  const moveFeatured = (gameId: string, dir: -1 | 1) => {
    const i = featured.indexOf(gameId);
    const j = i + dir;
    if (i === -1 || j < 0 || j >= featured.length) return;
    const next = [...featured];
    [next[i], next[j]] = [next[j], next[i]];
    onSaveSettings({ kioskFeaturedGames: next });
  };

  const featuredGames = useMemo(() => {
    const byId = new Map(games.map((g) => [g.id, g]));
    return featured.map((id) => byId.get(id)).filter((g): g is Game => !!g);
  }, [featured, games]);

  const searchResults = useMemo(() => {
    const q = gameSearch.trim().toLowerCase();
    if (!q) return [];
    return games
      .filter((g) => (g.cleanTitle || g.title).toLowerCase().includes(q))
      .slice(0, 8);
  }, [games, gameSearch]);

  const machinesForFilter = useMemo(() => {
    const list = machineCompanyFilter === 'all' ? systems : systems.filter((s) => s.companyId === machineCompanyFilter);
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [systems, machineCompanyFilter]);

  return (
    <div className="space-y-5 max-w-4xl">
      {savedFlash && (
        <div className="fixed top-20 right-8 z-50 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg">
          <Check className="w-4 h-4" /> {savedFlash}
        </div>
      )}

      {/* ── 1. WIDGETS ── */}
      <section className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">Widgets de la borne</h3>
        <p className="text-[11px] text-slate-400 mb-3">
          Choisis ce qui apparaît dans le Kiosque. Tout est actif par défaut — décoche pour masquer.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {WIDGETS.map((w) => {
            const on = widgets[w.id] !== false;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => toggleWidget(w.id)}
                className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border text-left transition ${
                  on
                    ? 'bg-cyan-500/10 border-cyan-500/40 hover:bg-cyan-500/20'
                    : 'bg-slate-900/60 border-slate-800 opacity-70 hover:opacity-100'
                }`}
              >
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-slate-100">{w.label}</span>
                  <span className="block text-[10px] text-slate-400 truncate">{w.desc}</span>
                </span>
                <span
                  className={`shrink-0 w-9 h-5 rounded-full relative transition ${
                    on ? 'bg-cyan-400' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                      on ? 'left-[18px]' : 'left-0.5'
                    }`}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 2. FIRMES : ordre + visibilité ── */}
      <section className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">Firmes : ordre & visibilité</h3>
        <p className="text-[11px] text-slate-400 mb-3">
          Flèches pour réordonner l’accueil de la borne (tu peux aussi glisser-déposer les cartes directement dans le
          Kiosque quand la régie est déverrouillée). Œil pour masquer une firme.
        </p>
        <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1 pr-1">
          {orderedCompanies.map((c) => (
            <div
              key={c.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition ${
                hiddenCompanies.has(c.id)
                  ? 'bg-slate-900/40 border-slate-800 opacity-50'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-600'
              }`}
            >
              <GripVertical className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: c.accentColor }}
              />
              <span className="flex-1 text-xs font-bold text-slate-200 truncate">{c.name}</span>
              <button
                type="button"
                onClick={() => moveCompany(c.id, -1)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Monter"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveCompany(c.id, 1)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Descendre"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => toggleCompanyHidden(c.id)}
                className={`p-1.5 rounded-md transition ${
                  hiddenCompanies.has(c.id)
                    ? 'text-rose-400 hover:bg-rose-500/20'
                    : 'text-emerald-400 hover:bg-emerald-500/20'
                }`}
                title={hiddenCompanies.has(c.id) ? 'Afficher dans la borne' : 'Masquer de la borne'}
              >
                {hiddenCompanies.has(c.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. MACHINES ── */}
      <section className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">Machines affichées</h3>
        <p className="text-[11px] text-slate-400 mb-3">
          Masque les machines que tu ne veux pas voir dans la borne (PC & consoles).
        </p>
        <div className="flex items-center gap-2 mb-2">
          <select
            value={machineCompanyFilter}
            onChange={(e) => setMachineCompanyFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">Toutes les firmes ({systems.length} machines)</option>
            {orderedCompanies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {machineCompanyFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setMachineCompanyFilter('all')}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
              title="Voir toutes les machines"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto custom-scrollbar grid grid-cols-1 sm:grid-cols-2 gap-1 pr-1">
          {machinesForFilter.map((s) => {
            const hidden = hiddenSystems.has(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSystemHidden(s.id)}
                className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border text-left transition ${
                  hidden
                    ? 'bg-slate-900/40 border-slate-800 opacity-50 hover:opacity-80'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-600'
                }`}
              >
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-slate-200 truncate">{s.name}</span>
                  <span className="block text-[9px] text-slate-500 font-mono">{s.id} · {s.generation || '—'}</span>
                </span>
                {hidden ? (
                  <EyeOff className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 4. VEDETTES ── */}
      <section className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">⭐ Mes vedettes (accueil)</h3>
        <p className="text-[11px] text-slate-400 mb-3">
          Épingle des jeux : ils apparaissent en carrousel au démarrage de la borne. Flèches pour les ordonner.
        </p>

        {/* Recherche */}
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={gameSearch}
            onChange={(e) => setGameSearch(e.target.value)}
            placeholder="Chercher un jeu à épingler..."
            className="w-full bg-slate-900/90 border border-slate-700/60 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 transition"
          />
          {gameSearch && (
            <div className="absolute z-20 left-0 right-0 mt-1 rounded-xl bg-[#0b1024] border border-slate-700 shadow-2xl overflow-hidden">
              {searchResults.length === 0 && (
                <div className="px-3 py-2 text-xs text-slate-500">Aucun résultat</div>
              )}
              {searchResults.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    if (!featured.includes(g.id)) toggleFeatured(g.id);
                    setGameSearch('');
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-cyan-500/15 flex items-center justify-between gap-2"
                >
                  <span className="truncate font-bold">{g.cleanTitle || g.title}</span>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">{g.systemId}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Liste des vedettes */}
        {featuredGames.length === 0 ? (
          <p className="text-xs text-slate-500 italic px-1">Aucune vedette épinglée pour l’instant.</p>
        ) : (
          <div className="space-y-1">
            {featuredGames.map((g, idx) => (
              <div
                key={g.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-amber-500/20"
              >
                <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
                <span className="flex-1 text-xs font-bold text-slate-200 truncate">
                  {g.cleanTitle || g.title}
                  <span className="ml-2 text-[10px] font-mono text-slate-500">{g.systemId}</span>
                </span>
                <button
                  type="button"
                  onClick={() => moveFeatured(g.id, -1)}
                  disabled={idx === 0}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-30"
                  title="Monter"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveFeatured(g.id, 1)}
                  disabled={idx === featuredGames.length - 1}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-30"
                  title="Descendre"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleFeatured(g.id)}
                  className="p-1.5 rounded-md text-rose-400 hover:bg-rose-500/20 transition"
                  title="Retirer des vedettes"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
