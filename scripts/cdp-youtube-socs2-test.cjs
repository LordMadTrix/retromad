/* Test SOCS corrigé : SameSite=None; Secure (requis en contexte cross-site),
 * posé au niveau navigateur via Storage.setCookies (couvre les OOPIF). */
const WebSocket = require('ws');

const VIDEO_ID = 'in4X7qOUxEg';

async function attachToFrame(frame) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(frame.webSocketDebuggerUrl, { maxPayload: 64 * 1024 * 1024 });
    const to = setTimeout(() => { ws.close(); reject(new Error('attach timeout')); }, 4000);
    ws.on('open', () => { clearTimeout(to); resolve(ws); });
    ws.on('error', (e) => { clearTimeout(to); reject(e); });
  });
}

function probePlayer(ws) {
  return Promise.race([
    new Promise((resolve) => {
      const onMsg = (data) => {
        const m = JSON.parse(data.toString());
        if (m.id === 1) { ws.off('message', onMsg); resolve(m.result?.result?.value); }
      };
      ws.on('message', onMsg);
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          returnByValue: true,
          expression: `(function(){try{
            const err=document.querySelector('.ytp-error-content-wrap-reason')?.innerText||'';
            const vid=document.querySelector('video');
            return JSON.stringify({error:err,hasVideo:!!vid,duration:vid?vid.duration:-1});
          }catch(e){return 'ERR:'+e.message;}})()`,
        },
      }));
      setTimeout(() => resolve(undefined), 4000);
    }),
    new Promise((resolve) => setTimeout(() => resolve(undefined), 5000)),
  ]);
}

async function main() {
  // 1. Poser les cookies au niveau NAVIGATEUR (s'applique à toutes les cibles)
  const version = await fetch('http://127.0.0.1:9333/json/version').then((r) => r.json());
  const bws = new WebSocket(version.webSocketDebuggerUrl, { maxPayload: 64 * 1024 * 1024 });
  await new Promise((r) => bws.on('open', r));
  const bsend = (method, params = {}) =>
    new Promise((resolve) => {
      const onMsg = (data) => {
        const m = JSON.parse(data.toString());
        if (m.id === 1) { bws.off('message', onMsg); resolve(m); }
      };
      bws.on('message', onMsg);
      bws.send(JSON.stringify({ id: 1, method, params }));
    });

  // SOCS=CAI : consentement minimal (refus tracking) — joueur fonctionnel
  const res = await bsend('Storage.setCookies', {
    cookies: [
      { name: 'SOCS', value: 'CAI', domain: '.youtube.com', path: '/', secure: true, httpOnly: false, sameSite: 'None' },
      { name: 'SOCS', value: 'CAI', domain: '.youtube-nocookie.com', path: '/', secure: true, httpOnly: false, sameSite: 'None' },
      { name: 'PREF', value: 'hl=fr&gl=FR', domain: '.youtube.com', path: '/', secure: true, httpOnly: false, sameSite: 'None' },
    ],
  });
  console.log(`cookies posés (Storage.setCookies) : ${res.error ? JSON.stringify(res.error) : 'ok'}`);
  bws.close();

  // 2. Injecter un NOUVEL embed et sonder
  const list = await fetch('http://127.0.0.1:9333/json/list').then((r) => r.json());
  const page = list.find((t) => t.type === 'page' && t.url.includes('retromad'));
  const ws = new WebSocket(page.webSocketDebuggerUrl, { maxPayload: 64 * 1024 * 1024 });
  await new Promise((r) => ws.on('open', r));
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const onMsg = (data) => {
        const m = JSON.parse(data.toString());
        if (m.id === 2) { ws.off('message', onMsg); resolve(m); }
      };
      ws.on('message', onMsg);
      ws.send(JSON.stringify({ id: 2, method, params }));
    });

  await send('Runtime.evaluate', {
    expression: `document.getElementById('socs2')?.remove();
      const f=document.createElement('iframe');
      f.id='socs2';
      f.allow='autoplay; encrypted-media; picture-in-picture';
      f.src='https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&playsinline=1&ts='+Date.now();
      f.style.cssText='position:fixed;top:0;left:0;width:480px;height:270px;z-index:999999;background:#000;';
      document.body.appendChild(f); 'ok'`,
  });

  await new Promise((r) => setTimeout(r, 14000));

  const list2 = await fetch('http://127.0.0.1:9333/json/list').then((r) => r.json());
  let verdict = 'iframe non détectée';
  for (const fr of list2.filter((t) => t.type === 'iframe' && /youtube/.test(t.url))) {
    try {
      const ws2 = await attachToFrame(fr);
      const raw = await probePlayer(ws2);
      console.log(`[SOCS=None] → ${raw}`);
      try {
        const p = JSON.parse(raw);
        if (p.error) verdict = `ÉCHEC ENCORE : ${p.error}`;
        else if (p.hasVideo && p.duration > 0) verdict = 'LECTURE OK ✓ — cause = consentement (SameSite) confirmée';
      } catch { /* verdict brut */ }
      ws2.close();
    } catch (e) {
      console.log(`attach KO: ${e.message}`);
    }
  }
  console.log(`>>> VERDICT : ${verdict}`);

  await send('Runtime.evaluate', { expression: "document.getElementById('socs2')?.remove(); 'ok'" });
  ws.close();
  process.exit(0);
}

main().catch((e) => { console.error('KO:', e.message); process.exit(1); });
