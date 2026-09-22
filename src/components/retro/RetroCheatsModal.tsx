import React, { useState } from 'react';
import {
  Copy,
  Check,
  Plus,
  Trash2,
  X,
  Download,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Code2,
} from 'lucide-react';
import { GameCheat } from '../../types/retroFeatures';
import { Game } from '../../types';

interface RetroCheatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cheats: GameCheat[];
  onToggleCheat: (id: string) => void;
  onAddCheat: (cheat: GameCheat) => void;
  onDeleteCheat: (id: string) => void;
  games: Game[];
  filterGameId?: string;
  selectedGameId?: string;
}

export const RetroCheatsModal: React.FC<RetroCheatsModalProps> = ({
  isOpen,
  onClose,
  cheats,
  onToggleCheat,
  onAddCheat,
  onDeleteCheat,
  games,
  filterGameId,
  selectedGameId,
}) => {
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>(selectedGameId || filterGameId || 'all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New cheat form
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newGameId, setNewGameId] = useState(games[0]?.id || 'smw');
  const [newType, setNewType] = useState<'gamegenie' | 'actionreplay' | 'gameshark'>('gamegenie');
  const [newDesc, setNewDesc] = useState('');

  if (!isOpen) return null;

  const filteredCheats = cheats.filter((c) => {
    if (selectedGameFilter !== 'all' && c.gameId !== selectedGameFilter) return false;
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    return true;
  });

  const activeCount = cheats.filter((c) => c.enabled).length;

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleExportCht = () => {
    // Format standard RetroArch .cht
    let content = `cheats = ${filteredCheats.length}\n\n`;
    filteredCheats.forEach((c, idx) => {
      content += `cheat${idx}_desc = "${c.title}"\n`;
      content += `cheat${idx}_code = "${c.code}"\n`;
      content += `cheat${idx}_enable = ${c.enabled ? 'true' : 'false'}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retromad_cheats_${Date.now()}.cht`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateCheat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) return;
    const game = games.find((g) => g.id === newGameId);
    const item: GameCheat = {
      id: `cheat_${Date.now()}`,
      gameId: newGameId,
      gameTitle: game ? game.cleanTitle : 'Jeu Rétro',
      title: newTitle.trim(),
      code: newCode.trim().toUpperCase(),
      type: newType,
      enabled: true,
      description: newDesc.trim() || 'Code de triche actif.',
      systemName: game ? game.systemId.toUpperCase() : 'Console',
    };
    onAddCheat(item);
    setIsAddOpen(false);
    setNewTitle('');
    setNewCode('');
    setNewDesc('');
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'gamegenie':
        return { label: 'Game Genie', color: 'text-amber-300 border-amber-500/40 bg-amber-950/30' };
      case 'actionreplay':
        return { label: 'Action Replay', color: 'text-rose-300 border-rose-500/40 bg-rose-950/30' };
      case 'gameshark':
        return { label: 'GameShark', color: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/30' };
      default:
        return { label: type, color: 'text-slate-300 border-slate-700 bg-slate-800' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b1329] border border-cyan-500/30 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,242,254,0.15)] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0d1838] flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white tracking-wide">
                  Codes de Triche & Cheats
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono font-bold">
                  {activeCount} actif{activeCount > 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Game Genie, Action Replay et GameShark injectés en temps réel
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCht}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition"
              title="Exporter au format .cht pour RetroArch"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Export .cht</span>
            </button>
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau Code</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div className="px-4 py-2 bg-indigo-950/30 border-b border-indigo-900/40 text-[11px] text-indigo-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-indigo-400" />
          <span>
            Les codes activés sont synchronisés avec les arguments de lancement Libretro ou enregistrés dans votre profil.
          </span>
        </div>

        {/* Filters */}
        <div className="p-3 bg-[#080e22] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedGameFilter}
              onChange={(e) => setSelectedGameFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-400"
            >
              <option value="all">Tous les jeux ({cheats.length})</option>
              {Array.from(new Set(cheats.map((c) => c.gameId))).map((gid) => {
                const game = cheats.find((c) => c.gameId === gid);
                const count = cheats.filter((c) => c.gameId === gid).length;
                return (
                  <option key={gid} value={gid}>
                    {game?.gameTitle} ({count})
                  </option>
                );
              })}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-400"
            >
              <option value="all">Tous les moteurs</option>
              <option value="gamegenie">Game Genie</option>
              <option value="actionreplay">Action Replay</option>
              <option value="gameshark">GameShark</option>
            </select>
          </div>
        </div>

        {/* Form add cheat */}
        {isAddOpen && (
          <form
            onSubmit={handleCreateCheat}
            className="p-4 bg-slate-900/95 border-b border-purple-500/30 flex flex-wrap items-end gap-3 text-xs animate-in slide-in-from-top-3"
          >
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[11px] text-slate-400 font-bold mb-1">Effet du Code</label>
              <input
                type="text"
                placeholder="Ex: Vies Infinies"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                required
              />
            </div>
            <div className="min-w-[140px]">
              <label className="block text-[11px] text-slate-400 font-bold mb-1">Code Hexadécimal</label>
              <input
                type="text"
                placeholder="Ex: C225-CE6D"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 font-bold mb-1">Jeu</label>
              <select
                value={newGameId}
                onChange={(e) => setNewGameId(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
              >
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.cleanTitle}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 font-bold mb-1">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
              >
                <option value="gamegenie">Game Genie</option>
                <option value="actionreplay">Action Replay</option>
                <option value="gameshark">GameShark</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11px] text-slate-400 font-bold mb-1">Description</label>
              <input
                type="text"
                placeholder="Ex: Ne perd jamais de vie en tombant"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
              >
                Ajouter
              </button>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* Cheat List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredCheats.length === 0 ? (
            <div className="text-center py-14 text-slate-500">
              <Code2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Aucun code pour cette sélection.</p>
            </div>
          ) : (
            filteredCheats.map((c) => {
              const badge = getTypeBadge(c.type);
              return (
                <div
                  key={c.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    c.enabled
                      ? 'bg-[#14122e]/70 border-purple-500/40 shadow-sm'
                      : 'bg-slate-900/40 border-slate-800/80 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm truncate">{c.title}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      {c.systemName && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {c.systemName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{c.description}</p>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-1">
                      <span className="text-purple-400 font-medium">{c.gameTitle}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-amber-300 font-bold tracking-wider">
                        {c.code}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(c.id, c.code)}
                      className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-400 hover:text-white transition"
                      title="Copier le code"
                    >
                      {copiedId === c.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleCheat(c.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center space-x-1.5 transition ${
                        c.enabled
                          ? 'bg-purple-600/20 text-purple-300 border-purple-500/50 hover:bg-purple-600/30'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {c.enabled ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-purple-400" />
                          <span>Actif</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-slate-500" />
                          <span>Inactif</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteCheat(c.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
