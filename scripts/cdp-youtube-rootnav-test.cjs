/* Test origine parente via navigation de la fenêtre principale :
 * 1. Navigate retromad:// → https://www.youtube-nocookie.com/embed/…
 * 2. Sonde le player en page racine
 * 3. Restaure retromad://app/index.html */
const WebSocket = require('ws');

const VIDEO_ID = 'in4X7qOUxEg';
const APP_URL = 'retromad://app/index.html';

function probePlayer(ws, id = 1) {
  return Promise.race([
    new Promise((resolve) => {
      const onMsg = (data) => {
        const m = JSON.parse(data.toString());
        if (m.id === id) { ws.off('message', onMsg); resolve(m.result?.result?.value); }
      };
      ws.on('message', onMsg);
      ws.send(JSON.stringify({
        id,
        method: 'Runtime.evaluate',
        params: {
          returnByValue: true,
          expression: `(function(){try{
            const err=document.querySelector('.ytp-error-content-wrap-reason')?.innerText||'';
            const vid=document.querySelector('video');
            return JSON.stringify({error:err,hasVideo:!!vid,duration:vid?vid.duration:-1,url:location.href.slice(0,60)});
          }catch(e){return 'ERR:'+e.message;}})()`,
        },
      }));
      setTimeout(() => resolve(undefined), 5000);
    }),
    new Promise((resolve) => setTimeout(() => resolve(undefined), 6000)),
  ]);
}

async function main() {
  let list = await fetch('http://127.0.0.1:9333/json/list').then((r) => r.json());
  const page = list.find((t) => t.type === 'page' && t.url.includes('retromad'));
  const ws = new WebSocket(page.webSocketDebuggerUrl, { maxPayload: 64 * 1024 * 1024 });
  await new Promise((r) => ws.on('open', r));
  let msgId = 0;
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const id = ++msgId;
      const onMsg = (data) => {
        const m = JSON.parse(data.toString());
        if (m.id === id) { ws.off('message', onMsg); resolve(m); }
      };
      ws.on('message', onMsg);
      ws.send(JSON.stringify({ id, method, params }));
    });

  await send('Page.enable');

  // 1. Naviguer vers l'embed en page racine
  await send('Page.navigate', {
    url: `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&playsinline=1`,
  });
  await new Promise((r) => setTimeout(r, 15000));

  // 2. Sonder la page (nouvelle cible : même id CDP, URL devenue youtube)
  list = await fetch('http://127.0.0.1:9333/json/list').then((r) => r.json());
  const ytPage = list.find((t) => t.type === 'page' && /youtube/.test(t.url));
  if (ytPage) {
    try {
      const ws2 = await new Promise((resolve, reject) => {
        const w = new WebSocket(ytPage.webSocketDebuggerUrl, { maxPayload: 64 * 1024 * 1024 });
        const to = setTimeout(() => { w.close(); reject(new Error('attach timeout')); }, 4000);
        w.on('open', () => { clearTimeout(to); resolve(w); });
        w.on('error', (e) => { clearTimeout(to); reject(e); });
      });
      console.log(`[RACINE youtube-nocookie, sans parent retromad] → ${await probePlayer(ws2)}`);
      ws2.close();
    } catch (e) {
      console.log(`attach KO: ${e.message}`);
    }
  } else {
    console.log('page youtube introuvable (navigation refusée ?)');
  }

  // 3. Restaurer l'app
  await send('Page.navigate', { url: APP_URL });
  await new Promise((r) => setTimeout(r, 3000));
  list = await fetch('http://127.0.0.1:9333/json/list').then((r) => r.json());
  console.log(`restauration : ${list.find((t) => t.type === 'page')?.url === APP_URL ? 'OK ✓' : 'à vérifier'}`);
  ws.close();
  process.exit(0);
}

main().catch((e) => { console.error('KO:', e.message); process.exit(1); });
