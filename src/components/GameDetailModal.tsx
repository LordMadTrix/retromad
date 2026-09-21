import React, { useState } from 'react';
import { Game, System, EmulatorProfile } from '../types';
import { X, Play, Heart, RefreshCw, Calendar, Users, Star, Award, HardDrive, Hash, Terminal } from 'lucide-react';
import { ConsoleLogo } from './ConsoleLogo';

interface GameDetailModalProps {
  game: Game | null;
  system?: System;
  emulators?: EmulatorProfile[];
  onClose: () => void;
  onLaunch: (game: Game, emulatorId?: string) => void;
  onToggleFavorite: (gameId: string) => void;
  onScrapeGame: (game: Game) => void;
  isScraping?: boolean;
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({
  game,
  system,
  emulators = [],
  onClose,
  onLaunch,
  onToggleFavorite,
  onScrapeGame,
  isScraping,
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'boxart' | 'snap'>('boxart');
  const [selectedEmulatorId, setSelectedEmulatorId] = useState<string>('retroarch');

  if (!game) return null;

  const boxartUrl = game.media?.boxart2d ? `retromad-media://${game.media.boxart2d}` : null;
  const snapUrl = game.media?.snap ? `retromad-media://${game.media.snap}` : null;

  // Taille formatée
  const sizeMb = (game.size / (1024 * 1024)).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-retro-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* En-tête avec bouton fermer */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-retro-800/60">
          <div className="flex items-center space-x-3.5">
            {system && (
              <div
                style={{
                  backgroundColor: `${system.themeColor}15`,
                  borderColor: `${system.themeColor}55`,
                }}
                className="px-3 py-1 rounded-xl border flex items-center justify-center max-w-[130px]"
              >
                <ConsoleLogo system={system} size="sm" />
              </div>
            )}
            <h2 className="text-lg font-bold text-white truncate max-w-lg">
              {game.cleanTitle}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-700/60 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps de la modale */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Colonne gauche : Médias (Jaquette / Capture) */}
          <div className="md:col-span-5 flex flex-col space-y-3">
            <div className="relative aspect-[3/4] w-full rounded-2xl bg-black/40 border border-slate-800 flex items-center justify-center overflow-hidden shadow-lg p-2">
              {activeMediaTab === 'boxart' ? (
                boxartUrl ? (
                  <img
                    src={boxartUrl}
                    alt={game.title}
                    className="w-full h-full object-contain drop-shadow-2xl animate-in zoom-in-95 duration-200"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-500">
                    <p className="text-xs">Jaquette non disponible</p>
                    <button
                      onClick={() => onScrapeGame(game)}
                      disabled={isScraping}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-retro-accent/20 text-retro-accent border border-retro-accent/40 text-xs font-bold hover:bg-retro-accent/30 transition flex items-center space-x-1.5 mx-auto"
                    >
                      <RefreshCw className={`w-3 h-3 ${isScraping ? 'animate-spin' : ''}`} />
                      <span>Rechercher jaquette</span>
                    </button>
                  </div>
                )
              ) : snapUrl ? (
                <img
                  src={snapUrl}
                  alt="Capture de jeu"
                  className="w-full h-full object-contain animate-in zoom-in-95 duration-200"
                />
              ) : (
                <div className="text-center p-6 text-slate-500 text-xs">
                  Aucune capture d'écran disponible
                </div>
              )}
            </div>

            {/* Switch Médias (Jaquette / Capture) */}
            <div className="flex items-center justify-center space-x-2 bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
              <button
                onClick={() => setActiveMediaTab('boxart')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  activeMediaTab === 'boxart'
                    ? 'bg-slate-700 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Jaquette
              </button>
              <button
                onClick={() => setActiveMediaTab('snap')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  activeMediaTab === 'snap'
                    ? 'bg-slate-700 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Capture d'écran
              </button>
            </div>
          </div>

          {/* Colonne droite : Métadonnées et Synopsis */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Infos clés (Studio, Date, Joueurs, Note) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center space-x-3">
                  <Award className="w-5 h-5 text-retro-accent shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Développeur</span>
                    <span className="text-xs font-bold text-slate-200 truncate block">
                      {game.metadata?.developer || 'Non renseigné'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-retro-pink shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Sortie</span>
                    <span className="text-xs font-bold text-slate-200">
                      {game.metadata?.releaseDate || 'Inconnue'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center space-x-3">
                  <Users className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Joueurs</span>
                    <span className="text-xs font-bold text-slate-200">
                      {game.metadata?.players ? `${game.metadata.players} joueur(s)` : '1 joueur'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center space-x-3">
                  <Star className="w-5 h-5 text-amber-400 shrink-0 fill-amber-400" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Note</span>
                    <span className="text-xs font-bold text-amber-400">
                      {game.metadata?.rating ? `${game.metadata.rating} / 100` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Genres */}
              {game.metadata?.genres && game.metadata.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {game.metadata.genres.map((genre, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-[11px] font-medium text-slate-300"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Synopsis */}
              <div>
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                  Histoire & Synopsis
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed max-h-36 overflow-y-auto pr-2 bg-slate-800/30 p-3 rounded-xl border border-slate-800">
                  {game.metadata?.synopsis ||
                    "Aucun résumé disponible pour ce titre. Cliquez sur 'Rescraper' pour interroger les bases de données retrogaming."}
                </p>
              </div>

              {/* Fichier & Technique */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
                <div className="flex items-center space-x-2 truncate">
                  <HardDrive className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{game.filename} ({sizeMb} MB)</span>
                </div>
                {game.crc32 && (
                  <div className="flex items-center space-x-2">
                    <Hash className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>CRC32: {game.crc32}</span>
                    {game.md5 && <span className="ml-3">MD5: {game.md5.substring(0, 8)}...</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Sélecteur d'émulateur si plusieurs choix possibles */}
            {emulators.length > 0 && (
              <div className="flex items-center space-x-2 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                <Terminal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-400 text-[11px]">Lanceur :</span>
                <select
                  value={selectedEmulatorId}
                  onChange={(e) => setSelectedEmulatorId(e.target.value)}
                  className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer flex-1"
                >
                  {emulators
                    .filter((e) => e.supportedSystems.includes('all') || e.supportedSystems.includes(game.systemId))
                    .map((emu) => (
                      <option key={emu.id} value={emu.id} className="bg-retro-900 text-white">
                        {emu.name} {emu.isDetected ? '(Détecté)' : ''}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Barre d'action inférieure */}
            <div className="pt-2 border-t border-slate-800 flex items-center space-x-3">
              <button
                onClick={() => onLaunch(game, selectedEmulatorId)}
                className="flex-1 flex items-center justify-center space-x-2.5 py-3 rounded-xl bg-gradient-to-r from-retro-accent to-emerald-400 text-retro-900 font-extrabold text-sm shadow-neon hover:scale-[1.02] active:scale-95 transition"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>LANCER LE JEU</span>
              </button>

              <button
                onClick={() => onToggleFavorite(game.id)}
                className={`p-3 rounded-xl border transition ${
                  game.favorite
                    ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
                }`}
                title="Ajouter aux favoris"
              >
                <Heart className={`w-5 h-5 ${game.favorite ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={() => onScrapeGame(game)}
                disabled={isScraping}
                className="p-3 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 transition disabled:opacity-50"
                title="Rescraper les métadonnées et jaquettes"
              >
                <RefreshCw className={`w-5 h-5 ${isScraping ? 'animate-spin text-retro-accent' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
