import http from 'http';
import os from 'os';
import { WebSocketServer, WebSocket } from 'ws';
import QRCode from 'qrcode';
import { BrowserWindow } from 'electron';

/**
 * Manette Smartphone (via GSM / Wi-Fi local)
 *
 * Le main process sert une page web tactile sur le réseau local (D-pad +
 * boutons style SNES). Le téléphone s'y connecte (URL + code PIN, ou simple
 * scan du QR code), et chaque appui est relayé :
 *   Téléphone → WebSocket → main → IPC 'phone-gamepad-input' → renderer
 * Le renderer injecte l'équivalent clavier que EmulatorJS écoute déjà
 * (A=z, B=x, X=a, Y=s, L=q, R=e, Select=v, Start=Entrée, flèches).
 *
 * Aucune installation côté téléphone : un navigateur suffit.
 */

export interface PhoneGamepadStatus {
  running: boolean;
  port: number;
  url: string;
  pin: string;
  connectedClients: number;
  qrDataUrl: string;
}

const DEFAULT_PORT = 8090;
const MAX_PORT = 8099;

// Touches EJS autorisées (mapping clavier par défaut d'EmulatorJS)
export const ALLOWED_KEYS = new Set([
  'x', 'z', 'a', 's', 'q', 'e', 'v', 'Enter',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
]);

let server: http.Server | null = null;
let wss: WebSocketServer | null = null;
let clients = new Map<WebSocket, Set<string>>(); // socket → touches maintenues
let status: PhoneGamepadStatus = {
  running: false,
  port: DEFAULT_PORT,
  url: '',
  pin: '',
  connectedClients: 0,
  qrDataUrl: '',
};

function sendToRenderer(channel: string, payload: unknown): void {
  try {
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) {
        win.webContents.send(channel, payload);
      }
    }
  } catch {
    /* aucune fenêtre disponible (contexte test, app en fermeture…) */
  }
}

function broadcastClientCount(): void {
  status.connectedClients = clients.size;
  sendToRenderer('phone-gamepad-clients', clients.size);
}

/** Libère toutes les touches maintenues d'un client (déconnexion, page cachée…). */
function releaseAllKeys(ws: WebSocket): void {
  const keys = clients.get(ws);
  if (!keys || keys.size === 0) return;
  for (const key of Array.from(keys)) {
    sendToRenderer('phone-gamepad-input', { key, pressed: false });
  }
  keys.clear();
}

/** Code PIN de 4 caractères sans caractères ambigus (0/O, 1/I/L). */
function generatePin(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let pin = '';
  for (let i = 0; i < 4; i++) {
    pin += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return pin;
}

/** Première IPv4 locale non interne (pour construire l'URL du téléphone). */
function getLocalIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

function send(ws: WebSocket, data: Record<string, unknown>): void {
  try {
    ws.send(JSON.stringify(data));
  } catch {
    /* socket déjà fermée */
  }
}

function buildPage(pin: string): string {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="mobile-web-app-capable" content="yes">
<title>RetroMAD Manette</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; user-select:none; -webkit-user-select:none; touch-action:none; }
  html,body { height:100%; overflow:hidden; background:#090d1a; color:#e2e8f0; font-family:'Segoe UI',system-ui,sans-serif; }
  #app { display:flex; flex-direction:column; height:100%; padding:env(safe-area-inset-top) 8px env(safe-area-inset-bottom); }
  header { display:flex; align-items:center; justify-content:space-between; padding:6px 10px; font-size:12px; color:#64748b; }
  .dot { display:inline-block; width:8px; height:8px; border-radius:50%; background:#64748b; margin-right:6px; }
  .dot.on { background:#00ff88; box-shadow:0 0 8px #00ff88; }
  main { flex:1; display:flex; align-items:center; justify-content:space-between; gap:8px; min-height:0; }
  .btn { display:flex; align-items:center; justify-content:center; border-radius:50%; font-weight:800;
         background:#1b2a56; color:#cbd5e1; border:2px solid #2a3c70; box-shadow:0 3px 0 #101a38;
         touch-action:none; cursor:pointer; }
  .btn.pressed { background:#00f2fe; color:#04121a; transform:translateY(2px); box-shadow:0 1px 0 #101a38; border-color:#00f2fe; }
  /* D-Pad */
  #dpad { display:grid; grid-template-columns:repeat(3,1fr); grid-template-rows:repeat(3,1fr); width:44vmin; height:44vmin; gap:4px; }
  #dpad .btn { border-radius:14px; font-size:18px; }
  #dpad .up{grid-area:1/2} #dpad .left{grid-area:2/1} #dpad .right{grid-area:2/3} #dpad .down{grid-area:3/2}
  #dpad .center{grid-area:2/2; background:#101a38; border-color:#1b2a56; box-shadow:none; cursor:default;}
  /* Face */
  #face { position:relative; width:46vmin; height:46vmin; }
  #face .btn { position:absolute; width:32%; height:32%; font-size:16px; }
  #face .y{ left:9%; top:0; } #face .x{ right:0; top:18%; } #face .b{ left:0; bottom:18%; } #face .a{ right:9%; bottom:0; }
  /* Centre */
  #mid { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; }
  #mid .row { display:flex; gap:10px; }
  #mid .btn { width:15vmin; height:9vmin; border-radius:999px; font-size:11px; letter-spacing:1px; }
  #shoulders { display:flex; justify-content:space-between; padding:0 4px; gap:8px; }
  #shoulders .btn { width:38%; height:8vmin; border-radius:12px 12px 6px 6px; font-size:13px; }
  footer { text-align:center; font-size:10px; color:#475569; padding:4px 0 6px; }
  /* Écran de connexion */
  #gate { position:fixed; inset:0; background:#090d1a; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; text-align:center; padding:24px; z-index:10; }
  #gate h1 { font-size:20px; color:#00f2fe; letter-spacing:2px; }
  #gate p { color:#94a3b8; font-size:13px; line-height:1.6; }
  #gate.hidden { display:none; }
  #state { font-size:13px; color:#00ff88; min-height:18px; }
</style>
</head>
<body>
<div id="gate">
  <h1>🎮 RETROMAD</h1>
  <p>Manette tactile pour votre borne.<br>Connexion au PC…</p>
  <div id="state">…</div>
</div>
<div id="app" style="visibility:hidden">
  <header><span><span class="dot" id="dot"></span><span id="conn">Déconnecté</span></span><span>Manette RetroMAD</span></header>
  <div id="shoulders">
    <div class="btn" data-key="q">L</div>
    <div class="btn" data-key="e">R</div>
  </div>
  <main>
    <div id="dpad">
      <div class="btn up" data-key="ArrowUp">▲</div>
      <div class="btn left" data-key="ArrowLeft">◀</div>
      <div class="btn center"></div>
      <div class="btn right" data-key="ArrowRight">▶</div>
      <div class="btn down" data-key="ArrowDown">▼</div>
    </div>
    <div id="mid">
      <div class="row">
        <div class="btn" data-key="v">SELECT</div>
        <div class="btn" data-key="Enter">START</div>
      </div>
    </div>
    <div id="face">
      <div class="btn y" data-key="s">Y</div>
      <div class="btn x" data-key="a">X</div>
      <div class="btn b" data-key="x">B</div>
      <div class="btn a" data-key="z">A</div>
    </div>
  </main>
  <footer>A = z · B = x · X = a · Y = s · L = q · R = e · Select = v · Start = Entrée</footer>
</div>
<script>
(function(){
  var pin = new URLSearchParams(location.search).get('pin') || '';
  var ws = null, connected = false;
  var gate = document.getElementById('gate'), state = document.getElementById('state');
  var dot = document.getElementById('dot'), conn = document.getElementById('conn');
  var app = document.getElementById('app');

  function setState(t, ok){ state.textContent = t; state.style.color = ok ? '#00ff88' : '#f43f5e'; }

  function connect(){
    var proto = location.protocol === 'https:' ? 'wss://' : 'ws://';
    setState('Connexion…', true);
    try { ws = new WebSocket(proto + location.host + '/ws?pin=' + encodeURIComponent(pin)); }
    catch(e){ setState('Impossible de se connecter', false); return; }
    ws.onopen = function(){ /* attend la validation serveur */ };
    ws.onmessage = function(ev){
      var msg = {}; try { msg = JSON.parse(ev.data); } catch(e){ return; }
      if (msg.type === 'auth') {
        if (msg.ok) {
          connected = true;
          gate.classList.add('hidden');
          app.style.visibility = 'visible';
          dot.classList.add('on'); conn.textContent = 'Connecté';
        } else {
          setState('Code PIN invalide — rouvrez le lien depuis l\\'Admin', false);
        }
      } else if (msg.type === 'closed') {
        connected = false; dot.classList.remove('on'); conn.textContent = 'PC fermé';
      }
    };
    ws.onclose = function(){ connected = false; dot.classList.remove('on'); conn.textContent = 'Déconnecté';
      if (!gate.classList.contains('hidden')) setState('Serveur injoignable', false);
      setTimeout(connect, 2000); };
  }

  function press(el, down){
    var key = el.getAttribute('data-key'); if (!key) return;
    el.classList.toggle('pressed', down);
    if (down && navigator.vibrate) { try { navigator.vibrate(12); } catch(e){} }
    if (ws && ws.readyState === 1) ws.send(JSON.stringify({ type:'input', key:key, pressed:down }));
  }

  document.querySelectorAll('.btn[data-key]').forEach(function(el){
    el.addEventListener('pointerdown', function(e){ e.preventDefault(); el.setPointerCapture(e.pointerId); press(el, true); });
    el.addEventListener('pointerup', function(e){ e.preventDefault(); press(el, false); });
    el.addEventListener('pointercancel', function(){ press(el, false); });
    el.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  });

  // Empêche le scroll/zoom intempestif
  document.addEventListener('touchmove', function(e){ e.preventDefault(); }, { passive:false });
  document.addEventListener('gesturestart', function(e){ e.preventDefault(); });

  // Libère tout si la page passe en arrière-plan ou se ferme (anti-touches bloquées)
  function releaseAll(){
    document.querySelectorAll('.btn.pressed').forEach(function(el){ el.classList.remove('pressed'); });
    if (ws && ws.readyState === 1) { try { ws.send(JSON.stringify({ type:'release-all' })); } catch(e){} }
  }
  document.addEventListener('visibilitychange', function(){ if (document.hidden) releaseAll(); });
  window.addEventListener('pagehide', releaseAll);

  connect();
})();
</script>
</body>
</html>`;
}

export function getPhoneGamepadStatus(): PhoneGamepadStatus {
  return { ...status };
}

export async function startPhoneGamepadServer(): Promise<PhoneGamepadStatus> {
  if (status.running && server) return getPhoneGamepadStatus();

  const pin = generatePin();
  const ip = getLocalIp();

  server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    if (url.pathname === '/' || url.pathname === '/index.html') {
      const pagePin = url.searchParams.get('pin') || '';
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      res.end(buildPage(pin));
      // Le PIN n'est validé qu'à l'ouverture du WebSocket : une page ouverte
      // sans le bon code ne pourra jamais s'authentifier.
      void pagePin;
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });

  wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '/ws', `http://${req.headers.host || 'localhost'}`);
    const givenPin = url.searchParams.get('pin') || '';

    if (givenPin.toUpperCase() !== pin) {
      send(ws, { type: 'auth', ok: false });
      setTimeout(() => ws.close(), 300);
      return;
    }

    send(ws, { type: 'auth', ok: true });
    clients.set(ws, new Set<string>());
    broadcastClientCount();

    ws.on('message', (raw) => {
      let msg: { type?: string; key?: string; pressed?: boolean };
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }
      if (msg.type === 'input' && typeof msg.key === 'string' && typeof msg.pressed === 'boolean') {
        if (ALLOWED_KEYS.has(msg.key)) {
          const keys = clients.get(ws);
          if (msg.pressed) keys?.add(msg.key);
          else keys?.delete(msg.key);
          sendToRenderer('phone-gamepad-input', { key: msg.key, pressed: msg.pressed });
        }
      } else if (msg.type === 'release-all') {
        releaseAllKeys(ws);
      }
    });

    ws.on('close', () => {
      releaseAllKeys(ws);
      clients.delete(ws);
      broadcastClientCount();
    });

    ws.on('error', () => {
      releaseAllKeys(ws);
      clients.delete(ws);
      broadcastClientCount();
    });
  });

  // Ouverture du port avec repli automatique (8090 → 8099)
  const listen = (port: number): Promise<number> =>
    new Promise((resolve, reject) => {
      const onError = () => {
        server?.removeListener('error', onError);
        reject(new Error('port busy'));
      };
      server!.once('error', onError);
      server!.listen(port, '0.0.0.0', () => {
        server!.removeListener('error', onError);
        resolve(port);
      });
    });

  let boundPort = -1;
  for (let port = DEFAULT_PORT; port <= MAX_PORT; port++) {
    try {
      boundPort = await listen(port);
      break;
    } catch {
      /* essaie le port suivant */
    }
  }

  if (boundPort === -1) {
    server = null;
    wss = null;
    throw new Error(`Aucun port libre (${DEFAULT_PORT}-${MAX_PORT})`);
  }

  const url = `http://${ip}:${boundPort}/?pin=${pin}`;
  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(url, {
      width: 220,
      margin: 1,
      color: { dark: '#090d1a', light: '#ffffff' },
    });
  } catch {
    qrDataUrl = '';
  }

  status = { running: true, port: boundPort, url, pin, connectedClients: 0, qrDataUrl };
  console.log(`[RetroMad Phone Gamepad] Actif : ${url}`);
  return getPhoneGamepadStatus();
}

export async function stopPhoneGamepadServer(): Promise<PhoneGamepadStatus> {
  for (const ws of Array.from(clients.keys())) {
    try {
      releaseAllKeys(ws);
      send(ws, { type: 'closed' });
      ws.close();
    } catch {
      /* ignore */
    }
  }
  clients = new Map();
  if (wss) {
    try {
      wss.close();
    } catch {
      /* ignore */
    }
  }
  if (server) {
    await new Promise<void>((resolve) => server!.close(() => resolve()));
  }
  server = null;
  wss = null;
  status = { running: false, port: DEFAULT_PORT, url: '', pin: '', connectedClients: 0, qrDataUrl: '' };
  console.log('[RetroMad Phone Gamepad] Arrêté');
  return getPhoneGamepadStatus();
}
