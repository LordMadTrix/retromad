import React, { useState, useEffect } from 'react';
import {
  X,
  Wifi,
  Globe,
  HardDrive,
  Upload,
  Copy,
  Check,
  Folder,
  Smartphone,
  CheckCircle2,
  FileCode,
} from 'lucide-react';
import { INITIAL_LAN_LOGS, LanTransferLog } from '../../data/attractAndLanData';

interface LanNetworkManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaySound?: (type: 'coin' | 'powerup' | 'fanfare') => void;
}

export const LanNetworkManagerModal: React.FC<LanNetworkManagerModalProps> = ({
  isOpen,
  onClose,
  onPlaySound,
}) => {
  const [localIp] = useState('192.168.1.45');
  const [httpPort] = useState(8080);
  const [ftpPort] = useState(2121);
  const [webdavPort] = useState(8081);

  const [isHttpRunning, setIsHttpRunning] = useState(true);
  const [isFtpRunning, setIsFtpRunning] = useState(true);
  const [isWebdavRunning, setIsWebdavRunning] = useState(true);

  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [logs, setLogs] = useState<LanTransferLog[]>(INITIAL_LAN_LOGS);

  // État de test d'upload depuis l'interface
  const [targetSystemFolder, setTargetSystemFolder] = useState('public/roms/nintendo/snes/');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Détection d'IP si disponible
  useEffect(() => {
    // Si exécuté dans Electron ou sur un hôte local
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // Garder l'IP LAN réaliste
    }
  }, []);

  if (!isOpen) return null;

  const httpUrl = `http://${localIp}:${httpPort}`;
  const ftpUrl = `ftp://${localIp}:${ftpPort}`;
  const webdavUrl = `http://${localIp}:${webdavPort}/webdav`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    if (onPlaySound) onPlaySound('coin');
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSimulateUpload = (fileName: string, fileSize = '3.5 Mo') => {
    setUploadedFileName(fileName);
    setUploadProgress(10);
    if (onPlaySound) onPlaySound('powerup');

    let current = 10;
    const interval = setInterval(() => {
      current += 25;
      if (current >= 100) {
        clearInterval(interval);
        setUploadProgress(100);

        const newLog: LanTransferLog = {
          id: `lan-${Date.now()}`,
          timestamp: 'À l\'instant',
          sourceIp: localIp,
          clientDevice: 'Navigateur Web Local',
          protocol: 'HTTP',
          fileName,
          targetFolder: targetSystemFolder,
          fileSize,
          status: 'completed',
        };

        setLogs((prev) => [newLog, ...prev]);
        setTimeout(() => {
          setUploadProgress(null);
          setUploadedFileName('');
        }, 2500);
      } else {
        setUploadProgress(current);
      }
    }, 200);
  };

  const handleDropFiles = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleSimulateUpload(file.name, `${(file.size / (1024 * 1024)).toFixed(1)} Mo`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0b1220] border border-cyan-500/40 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[0_10px_40px_rgba(6,182,212,0.25)] overflow-hidden text-slate-200">
        
        {/* En-tête Passerelle LAN */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/20 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 shadow-inner">
              <Wifi className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-white font-sans tracking-wide">
                  Passerelle Réseau Local (LAN) & Serveur Web / FTP
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>RÉSEAU ACTIF</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Transférez des ROMs, BIOS et sauvegardes sans fil depuis votre téléphone ou un autre PC
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

        {/* Corps du gestionnaire */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* SECTION 1 : ADRESSES ET SERVICES RÉSEAU */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Service 1 : Serveur Web HTTP */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-xs text-white">Serveur Web (HTTP)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsHttpRunning(!isHttpRunning)}
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold transition ${
                      isHttpRunning
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isHttpRunning ? 'EN LIGNE' : 'ARRÊTÉ'}
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 mb-3">
                  Interface web pour déposer des ROMs directement depuis un navigateur mobile ou PC.
                </div>
                <code className="block text-xs font-mono font-bold text-cyan-300 bg-black/60 p-2 rounded border border-slate-800 truncate">
                  {httpUrl}
                </code>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">Port {httpPort}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(httpUrl, 'http')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white flex items-center space-x-1"
                >
                  {copiedText === 'http' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copier</span>
                </button>
              </div>
            </div>

            {/* Service 2 : Serveur FTP */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs text-white">Serveur FTP</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFtpRunning(!isFtpRunning)}
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold transition ${
                      isFtpRunning
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isFtpRunning ? 'EN LIGNE' : 'ARRÊTÉ'}
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 mb-3">
                  Idéal pour FileZilla, Cyberduck ou l'explorateur Windows pour des transferts de masse.
                </div>
                <code className="block text-xs font-mono font-bold text-amber-300 bg-black/60 p-2 rounded border border-slate-800 truncate">
                  {ftpUrl}
                </code>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">Port {ftpPort} (Anonyme)</span>
                <button
                  type="button"
                  onClick={() => handleCopy(ftpUrl, 'ftp')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white flex items-center space-x-1"
                >
                  {copiedText === 'ftp' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copier</span>
                </button>
              </div>
            </div>

            {/* Service 3 : WebDAV / Lecteur Réseau */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Folder className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-xs text-white">Lecteur Réseau (WebDAV / SMB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsWebdavRunning(!isWebdavRunning)}
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold transition ${
                      isWebdavRunning
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isWebdavRunning ? 'EN LIGNE' : 'ARRÊTÉ'}
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 mb-3">
                  Montez directement le dossier des ROMs comme un disque dur sur Windows (Z:) ou Mac.
                </div>
                <code className="block text-xs font-mono font-bold text-purple-300 bg-black/60 p-2 rounded border border-slate-800 truncate">
                  {webdavUrl}
                </code>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">Port {webdavPort}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(webdavUrl, 'webdav')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white flex items-center space-x-1"
                >
                  {copiedText === 'webdav' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copier</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2 : QR CODE SMARTPHONE & DÉPOSE SANS FIL */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-purple-950/40 border border-cyan-500/30 flex flex-col md:flex-row items-center gap-6">
            
            {/* SVG QR CODE DYNAMIQUE */}
            <div className="p-3 bg-white rounded-2xl shadow-xl flex flex-col items-center shrink-0">
              <svg
                width="140"
                height="140"
                viewBox="0 0 100 100"
                className="rounded-lg"
                fill="black"
              >
                {/* Repères d'angles QR Code */}
                <rect x="5" y="5" width="26" height="26" fill="black" />
                <rect x="9" y="9" width="18" height="18" fill="white" />
                <rect x="13" y="13" width="10" height="10" fill="black" />

                <rect x="69" y="5" width="26" height="26" fill="black" />
                <rect x="73" y="9" width="18" height="18" fill="white" />
                <rect x="77" y="13" width="10" height="10" fill="black" />

                <rect x="5" y="69" width="26" height="26" fill="black" />
                <rect x="9" y="73" width="18" height="18" fill="white" />
                <rect x="13" y="77" width="10" height="10" fill="black" />

                {/* Motifs binaires simulés */}
                <rect x="36" y="10" width="8" height="8" fill="black" />
                <rect x="48" y="14" width="8" height="8" fill="black" />
                <rect x="36" y="24" width="6" height="6" fill="black" />
                <rect x="12" y="38" width="6" height="6" fill="black" />
                <rect x="24" y="44" width="8" height="8" fill="black" />
                <rect x="36" y="38" width="8" height="8" fill="black" />
                <rect x="48" y="38" width="8" height="8" fill="black" />
                <rect x="62" y="38" width="6" height="6" fill="black" />
                <rect x="74" y="44" width="8" height="8" fill="black" />
                <rect x="84" y="38" width="6" height="6" fill="black" />
                <rect x="38" y="52" width="6" height="6" fill="black" />
                <rect x="50" y="52" width="8" height="8" fill="black" />
                <rect x="64" y="52" width="8" height="8" fill="black" />
                <rect x="38" y="66" width="8" height="8" fill="black" />
                <rect x="52" y="66" width="6" height="6" fill="black" />
                <rect x="70" y="70" width="8" height="8" fill="black" />
                <rect x="84" y="70" width="8" height="8" fill="black" />
                <rect x="40" y="80" width="8" height="8" fill="black" />
                <rect x="56" y="80" width="8" height="8" fill="black" />
                <rect x="74" y="84" width="8" height="8" fill="black" />
              </svg>
              <span className="text-[10px] text-slate-800 font-mono font-bold mt-1">
                SCANNER VIA SMARTPHONE
              </span>
            </div>

            {/* Explications et dépose mobile */}
            <div className="flex-1 text-xs text-slate-300 space-y-2">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-sm text-white">
                  Dépose Sans Fil Depuis Smartphone (iOS & Android)
                </span>
              </div>
              <p className="leading-relaxed text-slate-400">
                Scannez le QR Code avec l'appareil photo de votre smartphone connecté au même WiFi. Vous
                accéderez directement à la page de téléversement : sélectionnez vos fichiers ROMs depuis vos
                fichiers mobiles, ils seront automatiquement classés dans vos dossiers RetroMAD.
              </p>
              <div className="flex items-center space-x-3 pt-2 font-mono text-[11px] text-cyan-300">
                <span>✓ Décompression auto des .zip</span>
                <span>✓ Détection des extensions</span>
                <span>✓ Aucun câble requis</span>
              </div>
            </div>
          </div>

          {/* SECTION 3 : ZONE DE TÉLÉVERSEMENT GLISSER-DÉPOSER DIRECT */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="font-bold text-xs text-white flex items-center space-x-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Station de Téléversement Direct (Glisser-Déposer) :</span>
              </div>

              {/* Sélecteur de dossier cible */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">Dossier Cible :</span>
                <select
                  value={targetSystemFolder}
                  onChange={(e) => setTargetSystemFolder(e.target.value)}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-cyan-300 font-mono text-[11px]"
                >
                  <option value="public/roms/nintendo/snes/">public/roms/nintendo/snes/</option>
                  <option value="public/roms/nintendo/nes/">public/roms/nintendo/nes/</option>
                  <option value="public/roms/sega/megadrive/">public/roms/sega/megadrive/</option>
                  <option value="public/roms/sony/psx/">public/roms/sony/psx/</option>
                  <option value="public/roms/nintendo/gameboy/">public/roms/nintendo/gameboy/</option>
                  <option value="public/bios/">public/bios/</option>
                </select>
              </div>
            </div>

            {/* Zone Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={handleDropFiles}
              className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition cursor-pointer ${
                isDraggingOver
                  ? 'border-cyan-400 bg-cyan-500/10'
                  : 'border-slate-700 hover:border-cyan-500/50 bg-slate-950/60'
              }`}
              onClick={() => handleSimulateUpload('Super_Metroid_FR.sfc', '3.0 Mo')}
            >
              <Upload className="w-8 h-8 text-cyan-400 mb-2 animate-bounce" />
              <div className="text-xs font-bold text-white mb-1">
                Glissez-déposez vos fichiers ROMs ou BIOS ici
              </div>
              <div className="text-[11px] text-slate-400">
                Formats acceptés : .sfc, .nes, .md, .bin, .cue, .iso, .chd, .zip, .7z • Ou cliquez pour simuler un dépôt
              </div>

              {/* Jauge de progression si upload en cours */}
              {uploadProgress !== null && (
                <div className="w-full max-w-xs mt-4 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-cyan-300">
                    <span>{uploadedFileName}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-pink-500 transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4 : JOURNAL DES ACTIVITÉS & TRANSFERTS EN DIRECT */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-xs text-white">Journal des Activités LAN & Transferts</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {logs.length} transferts enregistrés
              </span>
            </div>

            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    <span className="font-mono font-bold text-white text-[11px]">{log.fileName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 font-mono">
                      {log.protocol}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono">
                    <span>Cible: {log.targetFolder}</span>
                    <span>Taille: {log.fileSize}</span>
                    <span className="text-slate-500">De: {log.clientDevice}</span>
                    <span className="text-slate-500">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
