import React, { useState, useRef, useEffect } from 'react';
import {
  Megaphone,
  Download,
  Copy,
  Check,
  Sparkles,
  Video,
  Share2,
  Tv,
  Eye,
  FileText,
  Flame,
  RefreshCw,
  Palette,
} from 'lucide-react';
import { Game, System } from '../../types';

interface PromoCampaignAdminViewProps {
  games: Game[];
  systems: System[];
  onPlaySound?: (type: 'coin' | 'powerup' | 'fanfare') => void;
}

type PosterFormat = '16:9' | '1:1' | '9:16';
type ColorTheme = 'cyber-neon' | 'arcade-classic' | 'synthwave-sunset' | 'gameboy-matrix';

export const PromoCampaignAdminView: React.FC<PromoCampaignAdminViewProps> = ({
  games,
  systems,
  onPlaySound,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'poster' | 'socials' | 'trailer' | 'press'>('poster');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Configuration de l'affiche
  const [posterFormat, setPosterFormat] = useState<PosterFormat>('16:9');
  const [theme, setTheme] = useState<ColorTheme>('cyber-neon');
  const [mainHeadline, setMainHeadline] = useState("L'EXPÉRIENCE ARCADE ULTIME");
  const [subHeadline, setSubHeadline] = useState('Le frontend rétro nouvelle génération avec 8 innovations exclusives');
  const [callToAction, setCallToAction] = useState('DISPONIBLE DÈS MAINTENANT');
  const [showScanlines, setShowScanlines] = useState(true);
  const [selectedHighlight, setSelectedHighlight] = useState('8 Modules Rétro Intégrés');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const headlinePresets = [
    "L'EXPÉRIENCE ARCADE ULTIME",
    "REVIVEZ L'ÂGE D'OR DU JEU VIDÉO",
    "LE SANCTUAIRE DU RÉTROGAMING",
    "VOTRE SALLE D'ARCADE À DOMICILE",
    "8 INNOVATIONS. 100% PASSION.",
  ];

  const highlightOptions = [
    '8 Modules Rétro Exclusifs',
    'Tournois Arcade & Jukebox Chiptune',
    'Mode Kiosk & Scraper Automatique',
    'Zéro Configuration, 100% Plaisir',
    'Succès RetroAchievements & Notices',
  ];

  // Copier du texte avec feedback
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (onPlaySound) onPlaySound('coin');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Rendu du Canvas pour l'affiche
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 1280;
    let height = 720;
    if (posterFormat === '1:1') {
      width = 800;
      height = 800;
    } else if (posterFormat === '9:16') {
      width = 720;
      height = 1280;
    }

    canvas.width = width;
    canvas.height = height;

    // Arrière-plan dégradé selon le thème
    let bgGrad = ctx.createLinearGradient(0, 0, width, height);
    let accent1 = '#06b6d4';
    let accent2 = '#a855f7';
    let accent3 = '#ec4899';

    if (theme === 'cyber-neon') {
      bgGrad.addColorStop(0, '#030712');
      bgGrad.addColorStop(0.5, '#090d1f');
      bgGrad.addColorStop(1, '#020617');
      accent1 = '#06b6d4'; // Cyan
      accent2 = '#8b5cf6'; // Violet
      accent3 = '#f43f5e'; // Rose
    } else if (theme === 'arcade-classic') {
      bgGrad.addColorStop(0, '#180202');
      bgGrad.addColorStop(0.5, '#1e0505');
      bgGrad.addColorStop(1, '#0b0101');
      accent1 = '#f59e0b'; // Jaune / Or
      accent2 = '#ef4444'; // Rouge
      accent3 = '#3b82f6'; // Bleu
    } else if (theme === 'synthwave-sunset') {
      bgGrad.addColorStop(0, '#19082d');
      bgGrad.addColorStop(0.6, '#380c3b');
      bgGrad.addColorStop(1, '#0d021f');
      accent1 = '#f43f5e'; // Magenta
      accent2 = '#fbbf24'; // Orange soleil
      accent3 = '#818cf8'; // Indigo
    } else {
      bgGrad.addColorStop(0, '#051408');
      bgGrad.addColorStop(0.5, '#07200c');
      bgGrad.addColorStop(1, '#020d04');
      accent1 = '#22c55e'; // Vert Game Boy
      accent2 = '#86efac';
      accent3 = '#15803d';
    }

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Grille Rétro Synthwave au sol
    ctx.save();
    ctx.strokeStyle = `${accent2}33`;
    ctx.lineWidth = 1.5;
    const horizonY = height * 0.65;

    // Lignes de fuite vers le centre
    const centerX = width / 2;
    for (let x = -width; x <= width * 2; x += 60) {
      ctx.beginPath();
      ctx.moveTo(centerX, horizonY);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Lignes horizontales perspective
    for (let y = horizonY; y < height; y += (y - horizonY) * 0.35 + 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    // Soleil néon / Halo lumineux central
    const sunGrad = ctx.createRadialGradient(centerX, horizonY * 0.85, 20, centerX, horizonY * 0.85, width * 0.35);
    sunGrad.addColorStop(0, `${accent1}66`);
    sunGrad.addColorStop(0.5, `${accent3}22`);
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(centerX, horizonY * 0.85, width * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Bordure néon avec lueur
    ctx.save();
    ctx.strokeStyle = accent1;
    ctx.lineWidth = 4;
    ctx.shadowColor = accent1;
    ctx.shadowBlur = 20;
    ctx.strokeRect(20, 20, width - 40, height - 40);
    ctx.restore();

    // Logo et Titre Principal "RETROMAD"
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Badge haut
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = accent1;
    ctx.fillText('★ RETROMAD EMBEDDED ENTERTAINMENT SYSTEM ★', centerX, 60);

    // Titre RETROMAD géant
    const titleY = posterFormat === '9:16' ? 190 : 130;
    ctx.font = '900 68px "Impact", "Arial Black", sans-serif';
    ctx.shadowColor = accent3;
    ctx.shadowBlur = 25;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('RETROMAD', centerX, titleY);

    // Sous-titre "CENTRE D'ÉMULATION & ARCADE"
    ctx.font = 'bold 15px sans-serif';
    ctx.shadowBlur = 0;
    ctx.fillStyle = accent2;
    ctx.fillText('FRONTEND ARCADE ULTIME & EXPÉRIENCE DE JEU AUTHENTIQUE', centerX, titleY + 45);

    // Slogan Principal de la Campagne
    const headlineY = posterFormat === '9:16' ? 320 : 250;
    ctx.font = '900 32px sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.shadowColor = accent1;
    ctx.shadowBlur = 15;
    ctx.fillText(mainHeadline, centerX, headlineY);

    // Description secondaire
    ctx.font = '16px sans-serif';
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(subHeadline, centerX, headlineY + 38);

    // 4 Badges Caractéristiques Clés
    const badgeY = posterFormat === '9:16' ? 440 : 360;
    const badges = [
      `🎮 ${games.length} Jeux & ${systems.length} Consoles`,
      `🏆 Trophées RetroAchievements`,
      `🎵 Jukebox Chiptune 8/16-Bit`,
      `📺 Shaders CRT Authentiques`,
    ];

    badges.forEach((badge, index) => {
      let bx = centerX;
      let by = badgeY + index * 42;
      if (posterFormat === '16:9') {
        bx = centerX - 360 + index * 240;
        by = badgeY;
      }
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(bx - 105, by - 16, 210, 32);
      ctx.strokeStyle = `${accent1}88`;
      ctx.lineWidth = 1;
      ctx.strokeRect(bx - 105, by - 16, 210, 32);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(badge, bx, by);
    });

    // Encadré Mise en avant (Highlight)
    const highlightY = posterFormat === '9:16' ? 680 : 450;
    ctx.fillStyle = `${accent2}20`;
    ctx.fillRect(centerX - 240, highlightY - 25, 480, 50);
    ctx.strokeStyle = accent2;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(centerX - 240, highlightY - 25, 480, 50);

    ctx.font = 'bold 17px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = accent2;
    ctx.shadowBlur = 10;
    ctx.fillText(`⚡ POINT FORT : ${selectedHighlight} ⚡`, centerX, highlightY);

    // Bouton Call-to-Action
    const ctaY = height - (posterFormat === '9:16' ? 120 : 80);
    ctx.shadowBlur = 20;
    ctx.shadowColor = accent1;
    ctx.fillStyle = accent1;
    ctx.fillRect(centerX - 190, ctaY - 22, 380, 48);

    ctx.fillStyle = '#020617';
    ctx.font = '900 18px sans-serif';
    ctx.shadowBlur = 0;
    ctx.fillText(callToAction, centerX, ctaY + 4);

    // Scanlines si activé
    if (showScanlines) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1.5);
      }
    }

    ctx.restore();
  }, [posterFormat, theme, mainHeadline, subHeadline, callToAction, showScanlines, selectedHighlight, systems]);

  // Télécharger l'image PNG générée
  const handleDownloadPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `retromad_publicite_${posterFormat.replace(':', 'x')}_${theme}.png`;
    a.click();
    if (onPlaySound) onPlaySound('fanfare');
  };

  // Textes prêts pour les réseaux sociaux
  const socialPosts = [
    {
      id: 'tweet-main',
      platform: 'Twitter / X',
      title: 'Annonce Principale (Lancement & Présentation)',
      icon: Share2,
      content: `🕹️ Découvrez RetroMAD : Le frontend rétrogaming ultime qui transforme votre PC en véritable borne d'arcade !\n\nAu programme :\n✨ 8 innovations exclusives (Tournois Arcade, Jukebox Chiptune, Liseuse de Notices d'époque, Trophées RetroAchievements...)\n📺 Shaders CRT authentiques (Scanlines, Trinitron, Effet Bombe)\n🎲 Roulette Rétro & Défis du Jour\n⚡ Zéro prise de tête : détection automatique des manettes & scraper média !\n\nRevivez l'âge d'or du jeu vidéo en grand écran.\n#RetroGaming #Arcade #IndieDev #Emulation #PixelArt #GamingCommunity`,
    },
    {
      id: 'reddit-post',
      platform: 'Reddit (r/retrogaming, r/emulation)',
      title: 'Présentation Détaillée de Communauté',
      icon: FileText,
      content: `[Projet] RetroMAD : J'ai créé un lanceur d'émulation tout-en-un avec 8 modules rétro jamais vus ailleurs (Jukebox chiptune, tournois intégrés, liseuse de livrets...)\n\nSalut la communauté !\n\nPassionné de rétrogaming depuis toujours, j'étais fatigué des frontends complexes à configurer ou austères. J'ai donc développé RetroMAD avec une philosophie claire : rendre l'expérience instantanément magique et conviviale.\n\nCe qui rend RetroMAD unique :\n1. ⚔️ Mode Tournois Arcade : organisez des brackets de 4 à 8 joueurs sur Street Fighter ou Mario Kart directement depuis le salon.\n2. 🎵 Jukebox 8/16-Bit : un synthétiseur chiptune Web Audio intégré qui joue des classiques pendant que vous explorez.\n3. 📖 Liseuse de Notices Rétro : feuilletez les manuels officiels scannés d'époque avec astuces et plans des manettes.\n4. 🏆 RetroAchievements : débloquez des succès et faites grimper votre niveau de joueur rétro.\n5. 📺 Studio CRT & Bezels : scanlines ajustables, courbure d'écran, blooming phosphore.\n6. 🎲 Roulette Rétro : vous ne savez pas à quoi jouer ? Laissez la borne décider pour vous avec un défi quotidien.\n7. 👾 Codes Cheats & 💾 Gestionnaire de Save States visuel.\n\nLe tout avec support complet des manettes, scraper automatique et mode Kiosk sécurisé par code PIN !\n\nVos retours sont les bienvenus ! Qu'aimeriez-vous voir dans la prochaine mise à jour ?`,
    },
    {
      id: 'discord-announcement',
      platform: 'Discord',
      title: 'Message d\'Annonce Serveur & Communauté',
      icon: Flame,
      content: `@everyone 🎉 **ANNONCE OFFICIELLE : RetroMAD est disponible !** 🕹️\n\nPréparez les manettes et les pièces de monnaie virtuelles : **RetroMAD** arrive pour redéfinir votre façon de jouer aux jeux rétro !\n\n🌟 **Pourquoi vous allez l'adorer :**\n• 🎮 **${systems.length}+ consoles émulées** avec navigation ultra fluide\n• ⚔️ **Tournois Arcade multijoueur** intégrés pour défier vos potes\n• 🎵 **Jukebox Chiptune temps réel** avec visualiseur audio néon\n• 🏆 **Succès & Profil de Joueur** pour collectionner les trophées\n• 📺 **Filtres cathodiques CRT** pour retrouver le grain des télés d'époque\n• 📖 **Liseuse de manuels scannés** pour retrouver l'odeur du papier glacé\n\n👉 Lancez votre session dès maintenant et relevez le **Défi Rétro du Jour** !`,
    },
    {
      id: 'tiktok-script',
      platform: 'TikTok & YouTube Shorts',
      title: 'Script Vidéo Courte (30 secondes - Format Vertical)',
      icon: Video,
      content: `[0:00 - 0:03] (Plan serré sur la manette arcade qui claque, écran CRT qui s'allume avec un bip rétro)
Voix-off : "Arrêtez de lancer vos jeux rétro dans des dossiers Windows moches..."

[0:03 - 0:08] (Transition rapide sur l'interface RetroMAD avec carrousel de jaquettes 3D et jaillissement de néons)
Voix-off : "Regardez ce que donne RetroMAD. C'est votre borne d'arcade de rêve, directement sur votre écran."

[0:08 - 0:15] (Enchaînement ultra rythmé : tirage de la Roulette Rétro, musique chiptune qui groove, un succès RetroAchievements qui pop à l'écran)
Voix-off : "Il y a un mode tournoi pour doser entre potes, un jukebox 16-bit intégré, et même les vraies notices de jeux d'époque à feuilleter !"

[0:15 - 0:25] (Gros plan sur le shader cathodique avec les scanlines et le filtre Trinitron)
Voix-off : "Activez les filtres CRT et vous avez exactement l'image de votre téléviseur d'enfance."

[0:25 - 0:30] (Écran titre avec logo RetroMAD et bouton Lancer)
Voix-off : "Téléchargez RetroMAD et replongez dans l'âge d'or. Le lien est en bio !"`,
    },
  ];

  // Script Bande-Annonce Complète
  const trailerScript = [
    {
      time: '00:00 - 00:06',
      title: 'Introduction Nostalgique',
      scene: 'Écran noir traversé par des lignes de balayage CRT. Une cassette de jeu rétro est soufflée, puis insérée avec un "CLIC" métallique franc.',
      audio: 'Bruit blanc cathodique doux, puis fanfare chiptune 8-bit montante et entraînante.',
      voiceOver: '"Vous vous rappelez de l\'excitation d\'ouvrir une boîte de jeu... d\'insérer la cartouche et d\'entendre ce jingle inoubliable ?"',
    },
    {
      time: '00:06 - 00:15',
      title: 'Révélation de RetroMAD',
      scene: 'Explosion de néons cyan et magenta. La caméra survole la collection de jeux avec jaquettes 3D pivotantes et vidéos de gameplay.',
      audio: 'Basse percutante synthwave rétro, tempo dynamique.',
      voiceOver: '"Voici RetroMAD. Le sanctuaire qui redonne à vos jeux rétro la majesté qu\'ils méritent."',
    },
    {
      time: '00:15 - 00:28',
      title: 'Le Défilé des 8 Innovations',
      scene: 'Split-screen dynamique en 4 parties montrant : la Roulette Rétro qui tourne, la liseuse de notice de Zelda, le déblocage d\'un succès Platine, et l\'égaliseur du Jukebox.',
      audio: 'Accélération du rythme, bruitages d\'arcade "Coin !" et "Power-Up !".',
      voiceOver: '"Ne vous contentez plus d\'émuler. Défiez vos amis en tournoi local, écoutez vos musiques chiptune préférées, et feuilletez les notices originales des plus grands chefs-d\'œuvre."',
    },
    {
      time: '00:28 - 00:38',
      title: 'Immersion CRT & Kiosk',
      scene: 'Zoom sur l\'effet d\'écran bombé Trinitron avec scanlines phosphorescentes, puis bascule en plein écran en mode Kiosk de salon.',
      audio: 'Mélodie rétro triomphale.',
      voiceOver: '"Avec ses filtres cathodiques sur-mesure et son mode Kiosk immersif, votre salon se transforme en salle d\'arcade des années 90."',
    },
    {
      time: '00:38 - 00:45',
      title: 'Climax & Appel à l\'Action',
      scene: 'Apparition du logo RetroMAD en lettres chromées 3D avec étincelles et slogan lumineux.',
      audio: 'Accords finaux héroïques, son de pièce insérée "INSERT COIN".',
      voiceOver: '"RetroMAD. Insérez une pièce, et commencez l\'aventure."',
    },
  ];

  // Communiqué de Presse
  const pressReleaseText = `COMMUNIQUÉ DE PRESSE
POUR DIFFUSION IMMÉDIATE

RetroMAD : La nouvelle référence du frontend rétrogaming fusionne nostalgie, tournois d'arcade et innovations interactives

Paris, le ${new Date().toLocaleDateString('fr-FR')} – Les passionnés d'histoire vidéoludique et d'arcade ont désormais leur quartier général. Conçu pour transcender la simple émulation, le frontend RetroMAD repense intégralement l'expérience du jeu rétro en proposant un écosystème tout-en-un aussi esthétique que puissant.

Une réponse aux lanceurs austères et fastidieux
Là où les solutions traditionnelles se limitent souvent à des listes froides de fichiers ROM, RetroMAD propose une véritable plongée dans l'ambiance des salles d'arcade et des salons des années 80 et 90. Compatible manettes dès le premier branchement, doté d'un scraper multimédia intelligent et d'un mode Kiosk sécurisé, il s'adresse aussi bien aux joueurs solo qu'aux salles de jeux associatives ou aux bornes maison.

8 innovations inédites réunies au sein du "Labo Rétro" :
1. Tournois Arcade Multijoueur : un système de bracket compétitif intégré pour organiser des sessions multijoueurs locales instantanées.
2. Jukebox Chiptune 8/16-Bit : un synthétiseur audio Web temps réel jouant les thèmes cultes sans dépendre de fichiers externes.
3. Liseuse de Notices d'Époque : une collection de manuels scannés haute définition avec plans de touches et anecdotes.
4. Système de Succès & Trophées : des défis modernes appliqués aux classiques du rétro avec profil et gains de niveau.
5. Studio Bezels & Shaders CRT : simulation fidèle des téléviseurs cathodiques à tubes Trinitron, scanlines et lueur phosphore.
6. Roulette Rétro & Défis du Jour : un algorithme intelligent qui sélectionne au hasard un jeu et propose un objectif quotidien.
7. Gestionnaire Visuel de Save States : instantanés de mémoire avec vignettes et exportation de cartouches virtuelles.
8. Coffre-Fort de Codes Cheats : compatibilité Game Genie et Action Replay avec bascule en un clic.

Disponibilité :
RetroMAD est disponible dès aujourd'hui. L'application intègre une architecture modulaire, une sécurité Kiosk par code PIN, et fonctionne en totale autonomie locale sans nécessiter de connexion internet obligatoire pour jouer.

Contact presse & démonstrations :
Email : contact@retromad.app
Web : https://retromad.app`;

  return (
    <div className="space-y-6">
      {/* En-tête promotionnel */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-retro-900 border border-purple-500/30 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-pink-400">
                <Megaphone className="w-7 h-7 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-white tracking-wide">
                  Studio Publicitaire & Kit Média RetroMAD
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-black uppercase tracking-wider">
                  Promotion 360°
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Générez des affiches haute définition personnalisées, téléchargez des bannières pour vos réseaux, copiez les textes promotionnels officiels et pilotez le script de bande-annonce de votre projet.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleDownloadPoster}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-pink-500/25 flex items-center space-x-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>Exporter l'Affiche PNG</span>
            </button>
          </div>
        </div>

        {/* Sous-onglets de navigation */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-purple-500/20 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab('poster')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
              activeSubTab === 'poster'
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Créateur d'Affiches & Bannières</span>
          </button>

          <button
            onClick={() => setActiveSubTab('socials')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
              activeSubTab === 'socials'
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Textes & Publications Réseaux</span>
          </button>

          <button
            onClick={() => setActiveSubTab('trailer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
              activeSubTab === 'trailer'
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Script Bande-Annonce (Trailer)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('press')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
              activeSubTab === 'press'
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Communiqué de Presse Officiel</span>
          </button>
        </div>
      </div>

      {/* CONTENU SELON LE SOUS-ONGLET */}

      {/* 1. CRÉATEUR D'AFFICHES */}
      {activeSubTab === 'poster' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Panneau de configuration (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-retro-800/90 border border-slate-700 space-y-4">
              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>Personnalisation de la Publicité</span>
              </h4>

              {/* Format de l'affiche */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  Format de Publication
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '16:9', label: '16:9 Bannière', desc: 'YouTube, Web' },
                    { id: '1:1', label: '1:1 Carré', desc: 'Instagram, X' },
                    { id: '9:16', label: '9:16 Vertical', desc: 'TikTok, Stories' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setPosterFormat(f.id as PosterFormat)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        posterFormat === f.id
                          ? 'bg-pink-500/20 border-pink-500 text-white font-bold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{f.label}</div>
                      <div className="text-[10px] text-slate-400">{f.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Thème Graphique */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  Ambiance Visuelle & Néons
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'cyber-neon', label: 'Cyber Néon', colors: 'from-cyan-500 to-purple-600' },
                    { id: 'arcade-classic', label: 'Arcade Classic', colors: 'from-amber-500 to-red-600' },
                    { id: 'synthwave-sunset', label: 'Synthwave Sunset', colors: 'from-pink-500 to-amber-400' },
                    { id: 'gameboy-matrix', label: 'Matrix GameBoy', colors: 'from-emerald-500 to-green-700' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id as ColorTheme)}
                      className={`p-2 rounded-xl border flex items-center space-x-2 transition ${
                        theme === t.id
                          ? 'bg-slate-800 border-pink-500 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${t.colors} shrink-0`} />
                      <span className="text-xs font-medium truncate">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slogan Principal */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">
                    Slogan d'Accroche
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const next = headlinePresets[(headlinePresets.indexOf(mainHeadline) + 1) % headlinePresets.length];
                      setMainHeadline(next);
                    }}
                    className="text-[10px] text-pink-400 hover:underline flex items-center space-x-1"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Suggestions</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={mainHeadline}
                  onChange={(e) => setMainHeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:border-pink-500 focus:outline-none"
                />
              </div>

              {/* Sous-titre */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Sous-titre explicatif
                </label>
                <input
                  type="text"
                  value={subHeadline}
                  onChange={(e) => setSubHeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-pink-500 focus:outline-none"
                />
              </div>

              {/* Point Fort Mis en Avant */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Argument Majeur mis en avant
                </label>
                <select
                  value={selectedHighlight}
                  onChange={(e) => setSelectedHighlight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-pink-500 focus:outline-none"
                >
                  {highlightOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Call to action */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Bouton d'Appel à l'Action (CTA)
                </label>
                <input
                  type="text"
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:border-pink-500 focus:outline-none"
                />
              </div>

              {/* Option Scanlines */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Tv className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Scanlines Rétro CRT sur l'image</span>
                </span>
                <input
                  type="checkbox"
                  checked={showScanlines}
                  onChange={(e) => setShowScanlines(e.target.checked)}
                  className="w-4 h-4 rounded text-pink-500 bg-slate-900 border-slate-700 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Aperçu en direct et téléchargement (7 cols) */}
          <div className="lg:col-span-7 space-y-4 flex flex-col">
            <div className="p-4 rounded-2xl bg-retro-800/90 border border-slate-700 flex-1 flex flex-col items-center justify-center">
              <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-400">
                <span className="flex items-center space-x-1.5 font-bold text-white">
                  <Eye className="w-4 h-4 text-pink-400" />
                  <span>Aperçu en Temps Réel ({posterFormat})</span>
                </span>
                <span className="text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Rendu HTML5 Canvas Ultra Haute Définition
                </span>
              </div>

              {/* Conteneur d'affichage de l'affiche */}
              <div className="relative max-h-[480px] w-full flex items-center justify-center p-2 bg-slate-950 rounded-xl border border-slate-800/80 shadow-2xl overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="max-h-[440px] max-w-full rounded shadow-neon object-contain"
                />
              </div>

              {/* Bouton de téléchargement sous l'aperçu */}
              <div className="w-full mt-4 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  Format prêt pour l'impression ou l'affichage web (PNG sans compression).
                </div>
                <button
                  type="button"
                  onClick={handleDownloadPoster}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger l'Image</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TEXTES & PUBLICATIONS RÉSEAUX */}
      {activeSubTab === 'socials' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialPosts.map((post) => {
              const Icon = post.icon;
              const isCopied = copiedId === post.id;
              return (
                <div
                  key={post.id}
                  className="p-5 rounded-2xl bg-retro-800/90 border border-slate-700 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-white block">{post.platform}</span>
                          <span className="text-[10px] text-slate-400">{post.title}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(post.id, post.content)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                          isCopied
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-pink-500'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copié !</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copier</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                      {post.content}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <span>Prêt à coller sur votre compte</span>
                    <span className="font-semibold text-pink-400/80">1 Clic</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SCRIPT BANDE-ANNONCE (TRAILER) */}
      {activeSubTab === 'trailer' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-retro-800/90 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2">
                  <Video className="w-4 h-4 text-purple-400" />
                  <span>Script & Découpage Scénique : Teaser Officiel 45s</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Structure minutée prête pour le tournage ou le montage vidéo de votre bande-annonce.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const fullScript = trailerScript
                    .map(
                      (s) =>
                        `[${s.time}] ${s.title}\n• Image : ${s.scene}\n• Audio : ${s.audio}\n• Voix-Off : ${s.voiceOver}\n`
                    )
                    .join('\n');
                  handleCopy('trailer-full', fullScript);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-500 text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition"
              >
                {copiedId === 'trailer-full' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Scénario Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier Tout le Scénario</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-3">
              {trailerScript.map((step, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 hover:border-purple-500/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-300 flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{step.title}</span>
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {step.time}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        🎬 Visuel / Scène
                      </span>
                      <p className="text-slate-300">{step.scene}</p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                        🎵 Musique & Sons
                      </span>
                      <p className="text-slate-300">{step.audio}</p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        🎙️ Voix-Off (Français)
                      </span>
                      <p className="text-amber-200/90 italic font-serif">{step.voiceOver}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. COMMUNIQUÉ DE PRESSE */}
      {activeSubTab === 'press' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-retro-800/90 border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Dossier de Presse & Communiqué Officiel</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Format standard rédigé pour envoi aux rédactions, blogs spécialisés et influenceurs gaming.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy('press-release', pressReleaseText)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 transition"
              >
                {copiedId === 'press-release' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Communiqué Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copier le Communiqué</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-line leading-relaxed max-h-[500px] overflow-y-auto">
              {pressReleaseText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
