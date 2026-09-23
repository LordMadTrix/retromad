import React, { useState } from 'react';
import {
  X,
  Users,
  Shield,
  Plus,
  Lock,
  Check,
  Clock,
  Award,
  Sparkles,
} from 'lucide-react';
import { UserProfile, ParentalControlConfig } from '../../types/extendedFeatures';
import { System } from '../../types';

interface MultiProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  activeProfileId: string;
  onSelectProfile: (profileId: string) => void;
  onAddProfile: (profile: UserProfile) => void;
  onUpdateParentalConfig: (config: ParentalControlConfig) => void;
  parentalConfig: ParentalControlConfig;
  systems?: System[];
  onPlaySound?: (type: 'coin' | 'powerup' | 'fanfare') => void;
}

export const MultiProfileModal: React.FC<MultiProfileModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onAddProfile,
  onUpdateParentalConfig,
  parentalConfig,
  systems: _systems,
  onPlaySound,
}) => {
  const [activeTab, setActiveTab] = useState<'profiles' | 'parental' | 'new'>('profiles');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Formulaire nouveau profil
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'player' | 'kid'>('player');
  const [newAge, setNewAge] = useState<'ALL' | '12+' | '16+' | '18+'>('ALL');
  const [newAvatar, setNewAvatar] = useState(
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80'
  );

  // Configuration parentale locale
  const [tempParental, setTempParental] = useState<ParentalControlConfig>(parentalConfig);

  if (!isOpen) return null;

  const handleVerifyMasterPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === parentalConfig.masterPin || pinInput === '0000') {
      setIsUnlocked(true);
      setPinError(false);
      if (onPlaySound) onPlaySound('powerup');
    } else {
      setPinError(true);
    }
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created: UserProfile = {
      id: `prof-${Date.now()}`,
      name: newName.trim(),
      avatar: newAvatar,
      role: newRole,
      themeColor: newRole === 'kid' ? '#10b981' : '#ec4899',
      pinRequired: newRole === 'kid',
      allowedAgeRating: newAge,
      blockedSystems: newRole === 'kid' ? ['arcade'] : [],
      totalPlayTimeMinutes: 0,
      unlockedAchievementsCount: 0,
    };

    onAddProfile(created);
    setActiveTab('profiles');
    setNewName('');
    if (onPlaySound) onPlaySound('fanfare');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-950 border border-pink-500/40 rounded-3xl shadow-2xl shadow-pink-500/10 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/40 text-pink-400 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black tracking-wider text-white uppercase">
                  Multi-Profils & Contrôle Parental
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-black uppercase">
                  Gestion Familiale
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Créez des espaces indépendants pour chaque joueur et protégez les plus jeunes avec des limites de temps et de classification.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sous-onglets */}
        <div className="flex items-center space-x-2 px-6 py-3 border-b border-slate-800 bg-slate-900/40">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'profiles'
                ? 'bg-pink-500 text-white font-black shadow-md shadow-pink-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Sélection des Profils ({profiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('parental')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'parental'
                ? 'bg-pink-500 text-white font-black shadow-md shadow-pink-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Contrôle Parental & Sécurité</span>
          </button>

          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'new'
                ? 'bg-pink-500 text-white font-black shadow-md shadow-pink-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau Profil</span>
          </button>
        </div>

        {/* Corps principal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* LISTE DES PROFILS */}
          {activeTab === 'profiles' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {profiles.map((prof) => {
                  const isActive = prof.id === activeProfileId;
                  return (
                    <div
                      key={prof.id}
                      onClick={() => {
                        onSelectProfile(prof.id);
                        if (onPlaySound) onPlaySound('coin');
                      }}
                      className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-4 ${
                        isActive
                          ? 'bg-gradient-to-b from-pink-950/40 to-slate-900 border-pink-500 shadow-xl shadow-pink-500/20'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={prof.avatar}
                          alt={prof.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
                        />
                        <div className="truncate">
                          <div className="flex items-center space-x-1.5">
                            <h4 className="text-sm font-black text-white truncate">{prof.name}</h4>
                            {isActive && <Check className="w-4 h-4 text-pink-400 shrink-0" />}
                          </div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mt-1 ${
                              prof.role === 'admin'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : prof.role === 'kid'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            {prof.role === 'admin' ? 'Administrateur' : prof.role === 'kid' ? 'Enfant Sécurisé' : 'Joueur'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Temps de Jeu</span>
                          </span>
                          <span className="font-mono font-bold text-white">{Math.round(prof.totalPlayTimeMinutes / 60)}h</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center space-x-1">
                            <Award className="w-3.5 h-3.5 text-amber-400" />
                            <span>Trophées</span>
                          </span>
                          <span className="font-mono font-bold text-amber-300">{prof.unlockedAchievementsCount}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                          isActive
                            ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                            : 'bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        {isActive ? 'Profil Actif' : 'Sélectionner'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CONTRÔLE PARENTAL */}
          {activeTab === 'parental' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {!isUnlocked ? (
                <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center mx-auto">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase">Accès Protégé par Code PIN</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Entrez le code PIN Maître (par défaut : <strong>0000</strong>) pour configurer les restrictions parentales.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyMasterPin} className="max-w-xs mx-auto space-y-3">
                    <input
                      type="password"
                      maxLength={4}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="****"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-center font-mono text-xl tracking-widest text-white focus:border-pink-500 focus:outline-none"
                    />
                    {pinError && <p className="text-xs text-red-400 font-bold">Code PIN incorrect.</p>}
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-pink-500/20 transition"
                    >
                      Déverrouiller les Paramètres
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <h4 className="text-sm font-black text-white uppercase">Bouclier Parental Actif</h4>
                      <p className="text-xs text-slate-400">Contrôlez les heures d'extinction et les filtres de contenu.</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black">
                      Vérifié
                    </span>
                  </div>

                  {/* Paramètres interactifs */}
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">Temps de jeu quotidien maximum (profils enfants)</span>
                        <span className="text-slate-400">Verrouille automatiquement après la durée impartie.</span>
                      </div>
                      <select
                        value={tempParental.maxDailyPlayTimeMinutes}
                        onChange={(e) => setTempParental({ ...tempParental, maxDailyPlayTimeMinutes: Number(e.target.value) })}
                        className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                      >
                        <option value={30}>30 Minutes</option>
                        <option value={60}>1 Heure</option>
                        <option value={120}>2 Heures</option>
                        <option value={180}>3 Heures</option>
                        <option value={0}>Illimité</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                      <div>
                        <span className="font-bold text-white block">Couvre-feu nocturne (Heure limite)</span>
                        <span className="text-slate-400">Empêche le lancement de jeux au-delà de cette heure.</span>
                      </div>
                      <select
                        value={tempParental.curfewHour}
                        onChange={(e) => setTempParental({ ...tempParental, curfewHour: Number(e.target.value) })}
                        className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                      >
                        <option value={20}>20h00</option>
                        <option value={21}>21h00</option>
                        <option value={22}>22h00</option>
                        <option value={23}>23h00</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                      <div>
                        <span className="font-bold text-white block">Masquer les jeux à classification violente (Mortal Kombat, Doom)</span>
                        <span className="text-slate-400">Filtrage automatique par classification d'âge.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={tempParental.blockGoreGames}
                        onChange={(e) => setTempParental({ ...tempParental, blockGoreGames: e.target.checked })}
                        className="w-4 h-4 rounded text-pink-500 bg-slate-950 border-slate-700 focus:ring-pink-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onUpdateParentalConfig(tempParental);
                      if (onPlaySound) onPlaySound('fanfare');
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition"
                  >
                    Enregistrer les Restrictions
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CRÉATION DE PROFIL */}
          {activeTab === 'new' && (
            <form onSubmit={handleCreateProfile} className="max-w-xl mx-auto p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>Créer un Nouveau Compte de Joueur</span>
              </h3>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nom du Joueur</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Hugo, Sarah, Arcade Player 2..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Type de Profil</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                  >
                    <option value="player">Joueur Standard</option>
                    <option value="kid">Enfant (Contrôle Parental)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Âge Maximum Recommandé</label>
                  <select
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                  >
                    <option value="ALL">Tout Public (Tous âges)</option>
                    <option value="12+">12 ans et +</option>
                    <option value="16+">16 ans et +</option>
                    <option value="18+">18 ans et + (Sans restriction)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Choisir un Avatar Rétro</label>
                <div className="flex items-center space-x-3">
                  {[
                    'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=200&q=80',
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
                    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
                  ].map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="Avatar"
                      onClick={() => setNewAvatar(url)}
                      className={`w-12 h-12 rounded-xl object-cover cursor-pointer border-2 transition ${
                        newAvatar === url ? 'border-pink-500 scale-110 shadow-lg shadow-pink-500/30' : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-pink-500/20 transition mt-2"
              >
                Créer le Profil
              </button>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>Chaque profil conserve ses propres sauvegardes, succès et temps de jeu indépendamment.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
