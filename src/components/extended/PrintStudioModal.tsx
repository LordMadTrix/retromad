import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  Sliders,
} from 'lucide-react';
import { Game } from '../../types';
import { PRINT_TEMPLATES } from '../../data/extendedFeaturesData';

interface PrintStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  initialGameId?: string;
  onPlaySound?: (type: 'coin' | 'powerup' | 'fanfare') => void;
}

export const PrintStudioModal: React.FC<PrintStudioModalProps> = ({
  isOpen,
  onClose,
  games,
  initialGameId,
  onPlaySound,
}) => {
  const [selectedGameId, setSelectedGameId] = useState<string>(initialGameId || games[0]?.id || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(PRINT_TEMPLATES[0].id);
  const [customTitle, setCustomTitle] = useState('');
  const [includeBleedMarks, setIncludeBleedMarks] = useState(true);
  const [customBackText, setCustomBackText] = useState(
    'Plongez dans l\'aventure avec des graphismes 16-bit révolutionnaires, des musiques inoubliables et un gameplay qui a marqué l\'histoire !'
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedGame = games.find((g) => g.id === selectedGameId) || games[0];
  const template = PRINT_TEMPLATES.find((t) => t.id === selectedTemplateId) || PRINT_TEMPLATES[0];

  // Rendu du gabarit sur Canvas
  useEffect(() => {
    if (!isOpen || !selectedGame) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Définition de la résolution d'impression (300 DPI approximé sur 1200px)
    const isCartridge = template.type === 'cartridge_label';
    const width = isCartridge ? 700 : 1200;
    const height = isCartridge ? 450 : 800;

    canvas.width = width;
    canvas.height = height;

    // Fond blanc d'impression
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Traits de coupe / Repères de pliage si activés
    if (includeBleedMarks) {
      ctx.strokeStyle = '#94a3b8';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.strokeRect(20, 20, width - 40, height - 40);
      ctx.setLineDash([]);
    }

    if (isCartridge) {
      // DESSIN DU STICKER DE CARTOUCHE
      const grad = ctx.createLinearGradient(30, 30, width - 60, height - 60);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(30, 30, width - 60, height - 60);

      // Bordure intérieure
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.strokeRect(40, 40, width - 80, height - 80);

      // Titre du jeu
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(customTitle || selectedGame.title, width / 2, height / 2 - 20);

      // Système et code cartouche
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(template.systemLabel.toUpperCase(), width / 2, height / 2 + 30);

      ctx.font = '12px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`SN-MODEL-FR-${selectedGame.id.toUpperCase().slice(0, 6)} • PAL VERSION`, width / 2, height - 70);

      // Sceau Nintendo / Sega
      ctx.strokeStyle = '#f59e0b';
      ctx.strokeRect(width - 160, 60, 90, 45);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('ORIGINAL SEAL', width - 115, 85);
    } else {
      // DESSIN DU BOÎTIER COMPLET (FACE AVANT + TRANCHE + ARRIÈRE)
      const spineWidth = 140;
      const frontWidth = (width - 60 - spineWidth) / 2;
      const backWidth = frontWidth;
      const startY = 30;
      const boxHeight = height - 60;

      // 1. Dos de la boîte (Gauche)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(30, startY, backWidth, boxHeight);

      // Titre dos
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(customTitle || selectedGame.title, 30 + backWidth / 2, startY + 60);

      // Texte résumé dos
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.textAlign = 'left';
      const words = (customBackText || selectedGame.metadata?.synopsis || 'Jeu vidéo culte rétro.').split(' ');
      let line = '';
      let yOffset = startY + 110;
      words.forEach((w: string) => {
        if ((line + w).length > 32) {
          ctx.fillText(line, 55, yOffset);
          line = w + ' ';
          yOffset += 20;
        } else {
          line += w + ' ';
        }
      });
      ctx.fillText(line, 55, yOffset);

      // Faux code barre
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(55, startY + boxHeight - 80, 140, 50);
      ctx.fillStyle = '#000000';
      for (let x = 65; x < 185; x += 4) {
        ctx.fillRect(x, startY + boxHeight - 75, Math.random() > 0.4 ? 2 : 1, 40);
      }

      // 2. Tranche / Spine (Milieu)
      const spineX = 30 + backWidth;
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(spineX, startY, spineWidth, boxHeight);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(spineX, startY, spineWidth, boxHeight);

      // Titre vertical sur la tranche
      ctx.save();
      ctx.translate(spineX + spineWidth / 2, startY + boxHeight / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(customTitle || selectedGame.title, 0, 7);
      ctx.restore();

      // 3. Face avant (Droite)
      const frontX = spineX + spineWidth;
      const gradFront = ctx.createLinearGradient(frontX, startY, frontX + frontWidth, startY + boxHeight);
      gradFront.addColorStop(0, '#0369a1');
      gradFront.addColorStop(1, '#0f172a');
      ctx.fillStyle = gradFront;
      ctx.fillRect(frontX, startY, frontWidth, boxHeight);

      // Titre face avant
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 32px sans-serif';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 10;
      ctx.fillText(customTitle || selectedGame.title, frontX + frontWidth / 2, startY + 120);
      ctx.shadowBlur = 0;

      // Bandeau console en haut
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(frontX, startY, frontWidth, 38);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(template.systemLabel.toUpperCase(), frontX + frontWidth / 2, startY + 24);

      // Tagline
      ctx.font = 'italic 14px sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText('Le Chef-d\'Œuvre Rétro Original', frontX + frontWidth / 2, startY + 160);
    }
  }, [isOpen, selectedGame, template, customTitle, customBackText, includeBleedMarks]);

  if (!isOpen) return null;

  // Lancer l'impression du navigateur
  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Impression Jaquette - ${selectedGame?.title}</title>
            <style>
              body { margin: 0; display: flex; align-items: center; justify-content: center; background: #fff; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            <img src="${dataUrl}" />
          </body>
        </html>
      `);
      win.document.close();
    }
    if (onPlaySound) onPlaySound('fanfare');
  };

  // Télécharger en PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `jaquette_${selectedGame?.id || 'retro'}_${template.type}.png`;
    a.click();
    if (onPlaySound) onPlaySound('coin');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-950 border border-emerald-500/40 rounded-3xl shadow-2xl shadow-emerald-500/10 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black tracking-wider text-white uppercase">
                  Print Studio : Jaquettes & Stickers Imprimables
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
                  Échelle Réelle 1:1
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Générez des boîtiers complets et des étiquettes de cartouches prêts à imprimer et découper.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center space-x-2 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer (1:1)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corps principal : Contrôles (4 cols) + Canvas 1:1 (8 cols) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Panneau de configuration */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Options de Gabarit</span>
              </h4>

              {/* Sélection du jeu */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Jeu Sélectionné</label>
                <select
                  value={selectedGameId}
                  onChange={(e) => setSelectedGameId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                >
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sélection du template */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Format de Boîte / Sticker</label>
                <div className="space-y-1.5">
                  {PRINT_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between ${
                        selectedTemplateId === tpl.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="truncate">{tpl.title}</span>
                      <span className="text-[10px] text-slate-500 shrink-0 font-mono ml-2">
                        {tpl.dimensionsMm.width}x{tpl.dimensionsMm.height}mm
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Titre et Résumé personnalisés */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Titre Personnalisé</label>
                <input
                  type="text"
                  placeholder={selectedGame.title}
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Texte Résumé au Dos</label>
                <textarea
                  rows={2}
                  value={customBackText}
                  onChange={(e) => setCustomBackText(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium resize-none"
                />
              </div>

              {/* Traits de coupe */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-300">Repères de coupe & pliage</span>
                <input
                  type="checkbox"
                  checked={includeBleedMarks}
                  onChange={(e) => setIncludeBleedMarks(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700 focus:ring-emerald-500"
                />
              </div>

              {/* Téléchargement PNG */}
              <button
                type="button"
                onClick={handleDownload}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger Image PNG</span>
              </button>
            </div>
          </div>

          {/* Aperçu en direct du Canvas */}
          <div className="lg:col-span-8 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center space-y-4">
            <div className="w-full flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-white">Aperçu Haute Résolution ({template.title})</span>
              <span className="text-[11px] font-mono">Format Papier Recommandé : A4 Brillant</span>
            </div>

            <div className="p-3 bg-white rounded-xl shadow-2xl max-h-[500px] w-full flex items-center justify-center overflow-hidden">
              <canvas
                ref={canvasRef}
                className="max-h-[460px] max-w-full object-contain"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>Imprimez à l'échelle 100% (sans redimensionnement) pour correspondre exactement aux boîtiers originaux.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Fermer le Studio
          </button>
        </div>

      </div>
    </div>
  );
};
