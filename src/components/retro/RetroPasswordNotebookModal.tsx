import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Key,
  HardDrive,
  Copy,
  Check,
  Plus,
  Trash2,
  Award,
  Search,
} from 'lucide-react';
import {
  CULT_PASSWORDS,
  RetroPasswordEntry,
  CULT_MAGAZINE_REVIEWS,
  MOCK_MEMORY_CARD_SLOTS,
} from '../../data/attractAndLanData';

interface RetroPasswordNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaySound?: (type: 'coin' | 'powerup' | 'fanfare') => void;
}

type TabType = 'passwords' | 'magazines' | 'memorycard';

export const RetroPasswordNotebookModal: React.FC<RetroPasswordNotebookModalProps> = ({
  isOpen,
  onClose,
  onPlaySound,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('passwords');
  const [passwords, setPasswords] = useState<RetroPasswordEntry[]>(() => {
    try {
      const saved = localStorage.getItem('retromad_custom_passwords');
      if (saved) {
        return [...CULT_PASSWORDS, ...JSON.parse(saved)];
      }
    } catch {}
    return CULT_PASSWORDS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Formulaire d'ajout de mot de passe personnel
  const [isAddingPassword, setIsAddingPassword] = useState(false);
  const [newGameTitle, setNewGameTitle] = useState('');
  const [newSystem, setNewSystem] = useState('NES');
  const [newPassword, setNewPassword] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newEffect, setNewEffect] = useState('');

  // Grille interactive Mega Man (A1 - E5)
  const [activeMegaManDots, setActiveMegaManDots] = useState<string[]>([
    'A1', 'B2', 'B4', 'C1', 'C3', 'C5', 'D4', 'D5', 'E2',
  ]);

  // Revue magazine sélectionnée
  const [selectedReviewId, setSelectedReviewId] = useState<string>(CULT_MAGAZINE_REVIEWS[0].id);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (onPlaySound) onPlaySound('coin');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleMegaManDot = (dot: string) => {
    setActiveMegaManDots((prev) =>
      prev.includes(dot) ? prev.filter((d) => d !== dot) : [...prev, dot]
    );
    if (onPlaySound) onPlaySound('coin');
  };

  const handleSaveCustomPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameTitle.trim() || !newPassword.trim()) return;

    const newEntry: RetroPasswordEntry = {
      id: `custom-${Date.now()}`,
      gameTitle: newGameTitle.trim(),
      system: newSystem,
      password: newPassword.trim(),
      description: newDescription.trim() || 'Code personnalisé',
      effect: newEffect.trim() || 'Effet de sauvegarde manuelle',
      type: 'text',
    };

    const updated = [newEntry, ...passwords];
    setPasswords(updated);

    try {
      const customs = updated.filter((p) => p.id.startsWith('custom-'));
      localStorage.setItem('retromad_custom_passwords', JSON.stringify(customs));
    } catch {}

    setNewGameTitle('');
    setNewPassword('');
    setNewDescription('');
    setNewEffect('');
    setIsAddingPassword(false);
    if (onPlaySound) onPlaySound('powerup');
  };

  const handleDeleteCustomPassword = (id: string) => {
    const updated = passwords.filter((p) => p.id !== id);
    setPasswords(updated);
    try {
      const customs = updated.filter((p) => p.id.startsWith('custom-'));
      localStorage.setItem('retromad_custom_passwords', JSON.stringify(customs));
    } catch {}
  };

  const filteredPasswords = passwords.filter(
    (p) =>
      p.gameTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.system.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedReview =
    CULT_MAGAZINE_REVIEWS.find((r) => r.id === selectedReviewId) || CULT_MAGAZINE_REVIEWS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0e1626] border border-amber-500/40 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[0_10px_40px_rgba(245,158,11,0.25)] overflow-hidden text-slate-200">
        
        {/* En-tête Carnet Vintage */}
        <div className="p-4 sm:p-5 border-b border-amber-500/20 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-white font-sans tracking-wide">
                  Carnet de Passwords & Fiches Rétro
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                  Édition Spéciale 1985-1999
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Codes secrets d'époque, décodeurs de grilles, fiches magazines cultes et cartes mémoires
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation des Onglets */}
        <div className="flex items-center border-b border-slate-800 px-4 sm:px-6 bg-slate-950/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('passwords')}
            className={`py-3 px-4 border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'passwords'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Mots de Passe & Décodeurs ({passwords.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('magazines')}
            className={`py-3 px-4 border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'magazines'
                ? 'border-pink-400 text-pink-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Fiches Magazines (Joypad / Consoles +)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('memorycard')}
            className={`py-3 px-4 border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'memorycard'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Cartes Mémoires PS1 & VMU</span>
          </button>
        </div>

        {/* CORPS DE L'ONGLET */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          
          {/* ONGLET 1 : MOTS DE PASSE & DÉCODEUR */}
          {activeTab === 'passwords' && (
            <div className="space-y-6">
              {/* Barre de recherche et bouton d'ajout */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un mot de passe (jeu, code, console)..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingPassword(!isAddingPassword)}
                  className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center space-x-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddingPassword ? 'Fermer le formulaire' : 'Ajouter un Mot de Passe'}</span>
                </button>
              </div>

              {/* Formulaire d'ajout rapide */}
              {isAddingPassword && (
                <form
                  onSubmit={handleSaveCustomPassword}
                  className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 space-y-3 animate-in fade-in"
                >
                  <div className="text-xs font-bold text-amber-300">
                    Noter un nouveau mot de passe dans votre carnet :
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Nom du jeu (ex: Castlevania)"
                      value={newGameTitle}
                      onChange={(e) => setNewGameTitle(e.target.value)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      required
                    />
                    <select
                      value={newSystem}
                      onChange={(e) => setNewSystem(e.target.value)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="NES">Nintendo NES</option>
                      <option value="SNES">Super Nintendo</option>
                      <option value="Genesis">Sega Mega Drive</option>
                      <option value="Game Boy">Nintendo Game Boy</option>
                      <option value="Master System">Sega Master System</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Mot de passe exact"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono font-bold text-amber-300"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Description (ex: Niveau 5 avec 9 vies)"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Effet en jeu (ex: Simon devant le boss)"
                      value={newEffect}
                      onChange={(e) => setNewEffect(e.target.value)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingPassword(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
                    >
                      Enregistrer dans le carnet
                    </button>
                  </div>
                </form>
              )}

              {/* Module Décodeur Spécial Mega Man 2 (Grille 5x5) */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-500/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="p-1 rounded bg-blue-500/20 text-blue-300 font-mono text-xs font-bold">
                      DÉCODEUR INTERACTIF
                    </span>
                    <h3 className="font-bold text-sm text-white">Mega Man 2 — Grille de Passwords</h3>
                  </div>
                  <span className="text-[11px] text-blue-300 font-mono">
                    {activeMegaManDots.length} boules placées
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Grille 5x5 cliquable */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-blue-500/30">
                    <div className="grid grid-cols-5 gap-1.5">
                      {['A', 'B', 'C', 'D', 'E'].map((col) =>
                        [1, 2, 3, 4, 5].map((row) => {
                          const dotKey = `${col}${row}`;
                          const isPlaced = activeMegaManDots.includes(dotKey);
                          return (
                            <button
                              key={dotKey}
                              type="button"
                              onClick={() => handleToggleMegaManDot(dotKey)}
                              className={`w-7 h-7 rounded flex items-center justify-center font-mono text-[10px] font-bold transition ${
                                isPlaced
                                  ? 'bg-red-500 text-white shadow-md shadow-red-500/50 scale-105'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                              }`}
                              title={`Case ${dotKey}`}
                            >
                              {dotKey}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Résultat décodeur */}
                  <div className="flex-1 text-xs text-slate-300 space-y-2">
                    <p className="leading-relaxed">
                      Cliquez sur les cases pour placer les boules rouges comme sur votre écran de télévision cathodique.
                    </p>
                    <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-[11px] text-cyan-300 border border-slate-800 flex items-center justify-between">
                      <span>Code généré : {activeMegaManDots.sort().join(', ')}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(activeMegaManDots.sort().join(', '), 'mm2')}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-sans flex items-center space-x-1"
                      >
                        {copiedId === 'mm2' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copier</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des mots de passe */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredPasswords.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-xs">{item.gameTitle}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                          {item.system}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 leading-tight mb-2">
                        {item.description}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <code className="text-xs font-mono font-bold text-amber-400 bg-black/50 px-2 py-1 rounded border border-slate-800 truncate max-w-[240px]">
                        {item.password}
                      </code>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleCopy(item.password, item.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Copier le code"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {item.id.startsWith('custom-') && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomPassword(item.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition"
                            title="Supprimer du carnet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ONGLET 2 : FICHES MAGAZINES RÉTRO */}
          {activeTab === 'magazines' && (
            <div className="space-y-6">
              {/* Sélecteur de revue */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {CULT_MAGAZINE_REVIEWS.map((rev) => (
                  <button
                    key={rev.id}
                    type="button"
                    onClick={() => setSelectedReviewId(rev.id)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold whitespace-nowrap transition flex items-center space-x-2 ${
                      selectedReviewId === rev.id
                        ? 'bg-pink-500/20 border-pink-500 text-pink-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{rev.gameTitle}</span>
                    <span className="text-[10px] opacity-75 font-mono">({rev.magazineName})</span>
                  </button>
                ))}
              </div>

              {/* Fiche Magazine Vintage Double Page */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1226] via-[#101424] to-[#0d121c] border-2 border-pink-500/40 shadow-2xl relative overflow-hidden">
                {/* En-tête magazine */}
                <div className="flex items-center justify-between border-b-2 border-pink-500/40 pb-3 mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl font-black text-pink-400 font-mono tracking-wider">
                      {selectedReview.magazineName.toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-mono text-xs">
                      {selectedReview.issueNumber} • {selectedReview.date}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Testé par : <strong className="text-white">{selectedReview.testerName}</strong>
                  </span>
                </div>

                {/* Titre & Verdict */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-2xl font-black text-white font-sans">
                      {selectedReview.gameTitle} ({selectedReview.system})
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic bg-black/40 p-4 rounded-xl border border-slate-800">
                      « {selectedReview.verdict} »
                    </p>

                    {/* Points forts et faibles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-green-950/30 border border-green-500/30 text-xs">
                        <div className="font-bold text-green-400 mb-1">ON AIME :</div>
                        <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                          {selectedReview.positivePoints.map((pt, i) => (
                            <li key={i}>{pt}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs">
                        <div className="font-bold text-red-400 mb-1">ON REGRETTE :</div>
                        <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                          {selectedReview.negativePoints.map((pt, i) => (
                            <li key={i}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Tableau des notes */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-pink-500/30 flex flex-col justify-between">
                    <div className="space-y-3 text-xs">
                      <div className="font-bold text-pink-300 border-b border-slate-800 pb-1">
                        NOTATION D'ÉPOQUE
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Graphismes</span>
                        <strong className="text-white font-mono">{selectedReview.graphicsScore}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Animation / Son</span>
                        <strong className="text-white font-mono">{selectedReview.soundScore}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Jouabilité</span>
                        <strong className="text-white font-mono">{selectedReview.gameplayScore}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Durée de vie</span>
                        <strong className="text-white font-mono">{selectedReview.longevityScore}%</strong>
                      </div>
                    </div>

                    {/* Note finale mégahit */}
                    <div className="mt-4 pt-3 border-t border-slate-800 text-center">
                      <div className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-widest">
                        MEGAHIT D'OR
                      </div>
                      <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-300 to-yellow-400 font-mono mt-1">
                        {selectedReview.finalScore}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 3 : CARTES MÉMOIRES PS1 & VMU */}
          {activeTab === 'memorycard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Gestionnaire de Carte Mémoire Virtuelle</h3>
                  <p className="text-xs text-slate-400">
                    Inspection visuelle des 15 blocs de sauvegarde PlayStation 1 et VMU Dreamcast.
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
                  8 / 15 BLOCS OCCUPÉS
                </div>
              </div>

              {/* Grille des 15 Blocs Mémoire */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {MOCK_MEMORY_CARD_SLOTS.map((slot) => (
                  <div
                    key={slot.slotNumber}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{slot.iconPixelArt}</span>
                          <span className="font-bold text-xs text-white">{slot.gameTitle}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                          {slot.blocksUsed} bloc(s)
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 font-medium">{slot.saveName}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        Temps de jeu: {slot.playTime} • Complétion: {slot.progressPct}%
                      </div>
                      <div className="text-[10px] text-cyan-400/90 italic mt-2 bg-black/40 p-1.5 rounded border border-slate-800/80">
                        {slot.unlockNote}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-mono">{slot.fileSize}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (onPlaySound) onPlaySound('powerup');
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition font-mono"
                      >
                        Exporter .srm / .sav
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
