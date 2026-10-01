/* Test discriminant final : charger la page de test http:// (embed dans un
 * parent http://127.0.0.1:8123) DANS la fenêtre Electron.
 *  - lecture OK → la cause est l'origine parente retromad://
 *  - échec      → la cause est la session Electron elle-même (indépendante de l'origine)
 * Puis restauration de retromad://app/index.html. */
const WebSocket = require('ws');

function rpc(ws, pending, method, params) {
  const id = ++rpc.seq;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
}
rpc.seq = 0;

function makeConn(url) {
  const ws = new WebSocket(url, { maxPayload: 64 * 1024 * 1024 });
  const pending = new Map();
  ws.on('message', (data) => {
    const m = JSON.parse(data.toString());
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
  });
  const open = new Promise((resolve, reject) => {
    const to = setTimeout(() => { ws.close(); reject(new Error('open timeout')); }, 5000);
    ws.on('open', () => { clearTimeout(to); resolve(ws); });
    ws.on('error', (e) => { clearTimeout(to); reject(e); });
  });
  return { ws, pending, open };
}

async function main() {
  const list = await fetch('http://127.0.0.1:9333/json/list').then((r) => r.json());
  const pageInfo = list.find((t) => t.type === 'page' && t.url.includes('retromad'));
  const page = makeConn(pageInfo.webSocketDebuggerUrl);
  await page.open;

  // 1. Naviguer la fenêtre Electron vers la page de test http://
  await rpc(page.ws, page.pending, 'Page.enable', {});
  await rpc(page.ws, page.pending, 'Page.navigate', {
    url: 'http://127.0.0.1:8123/youtube-embed-parent.html',
  });
  page.ws.close();
  await new Promise((r) => setTimeout(r, 18000));

  // 2. Sonde des iframes YouTube de la fenêtre (reconnexion avec retries)
  let frames = [];
  for (let i = 0; i < 6 && frames.length === 0; i++) {
    const l = await fetch('http://127.0.0.1:9333/json/list').then((r) => r.json());
    frames = l.filter((t) => /youtube/.test(t.url));
    if (frames.length === 0) {
      console.log(`attente iframe… (cibles: ${l.map((t) => t.type).join(',') || 'aucune'})`);
      await new Promise((r) => setTimeout(r, 2500));
    }
  }
  console.log('cibles youtube :', frames.length ? frames.map((t) => t.type).join(',') : '0');
  let verdict = 'aucune iframe youtube';
  for (const fr of frames) {
    try {
      const conn = makeConn(fr.webSocketDebuggerUrl);
      await conn.open;
      const res = await Promise.race([
        rpc(conn.ws, conn.pending, 'Runtime.evaluate', {
          returnByValue: true,
          expression: `(function(){try{
            const err=document.querySelector('.ytp-error-content-wrap-reason')?.innerText||'';
            const vid=document.querySelector('video');
            return JSON.stringify({error:err,hasVideo:!!vid,duration:vid?vid.duration:-1,readyState:vid?vid.readyState:-1,paused:vid?vid.paused:null});
          }catch(e){return 'ERR:'+e.message;}})()`,
        }).then((m) => m.result?.result?.value),
        new Promise((resolve) => setTimeout(() => resolve('timeout'), 12000)),
      ]);
      console.log(`[Electron + parent http] → ${res}`);
      try {
        const p = JSON.parse(res);
        if (p.error) verdict = `ÉCHEC même avec parent http → cause = session Electron, PAS l'origine`;
        else if (p.hasVideo && p.duration > 0) verdict = `LECTURE OK ✓ dans Electron avec parent http → cause = origine retromad://`;
      } catch { /* brut */ }
      conn.ws.close();
    } catch (e) {
      console.log(`attach KO : ${e.message}`);
    }
  }
  console.log(`>>> VERDICT : ${verdict}`);

  // 3. Restaurer l'app
  for (let i = 0; i < 6; i++) {
    try {
      const l3 = await fetch('http://127.0.0.1:9333/json/list').then((r) => r.json());
      const page3info = l3.find((t) => t.type === 'page');
      if (!page3info) throw new Error('pas de page');
      const page3 = makeConn(page3info.webSocketDebuggerUrl);
      await page3.open;
      await rpc(page3.ws, page3.pending, 'Page.enable', {});
      await rpc(page3.ws, page3.pending, 'Page.navigate', { url: 'retromad://app/index.html' });
      page3.ws.close();
      console.log('app restaurée');
      break;
    } catch (e) {
      console.log(`restauration tentative ${i + 1} : ${e.message}`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  process.exit(0);
}

main().catch((e) => { console.error('KO:', e.message); process.exit(1); });
