/* Test SOCS complet : cookies au niveau navigateur (Storage.setCookies,
 * SameSite=None) + journalisation des cibles iframe + sonde player. */
const WebSocket = require('ws');

const VIDEO_ID = 'in4X7qOUxEg';

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
  // 1. Cookies au niveau navigateur
  const version = await fetch('http://127.0.0.1:9333/json/version').then((r) => r.json());
  const bws = new WebSocket(version.webSocketDebuggerUrl, { maxPayload: 64 * 1024 * 1024 });
  await new Promise((r) => bws.on('open', r));
  let bid = 0;
  const bsend = (method, params = {}) =>
    new Promise((resolve) => {
      const id = ++bid;
      const onMsg = (data) => {
        const m = JSON.parse(data.toString());
        if (m.id === id) { bws.off('message', onMsg); resolve(m); }
      };
      bws.on('message', onMsg);
      bws.send(JSON.stringify({ id, method, params }));
    });

  const res = await bsend('Storage.setCookies', {
    cookies: [
      { name: 'SOCS', value: 'CAI', domain: '.youtube.com', path: '/', secure: true, sameSite: 'None' },
      { name: 'SOCS', value: 'CAI', domain: '.youtube-nocookie.com', path: '/', secure: true, sameSite: 'None' },
      { name: 'PREF', value: 'hl=fr&gl=FR', domain: '.youtube.com', path: '/', secure: true, sameSite: 'None' },
    ],
  });
  console.log(`cookies : ${res.error ? JSON.stringify(res.error) : 'posés ok'}`);
  bws.close();

  // 2. Page principale : injecter l'embed, écouter les cibles
  const list = await fetch('http://127.0.0.1:9333/json/list').then((r) => r.json());
  const page = list.find((t) => t.type === 'page' && t.url.includes('retromad'));
  const ws = new WebSocket(page.webSocketDebuggerUrl, { maxPayload: 64 * 1024 * 1024 });
  await new Promise((r) => ws.on('open', r));
  let msgId = 10;
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

  const injectRes = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `document.getElementById('socs3')?.remove();
      const f=document.createElement('iframe');
      f.id='socs3';
      f.allow='autoplay; encrypted-media; picture-in-picture';
      f.src='https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&playsinline=1&ts='+Date.now();
      f.style.cssText='position:fixed;top:0;left:0;width:480px;height:270px;z-index:999999;background:#000;';
      document.body.appendChild(f);
      'injectée'`,
  });
  console.log(`injection : ${injectRes.result?.result?.value ?? JSON.stringify(injectRes)}`);

  await new Promise((r) => setTimeout(r, 15000));

  // 3. Sonde de toutes les cibles iframe présentes
  const list2 = await fetch('http://127.0.0.1:9333/json/list').then((r) => r.json());
  const iframes = list2.filter((t) => /youtube/.test(t.url));
  console.log(`cibles youtube : ${iframes.length} → ${iframes.map((t) => t.type).join(',') || 'aucune'}`);
  let verdict = 'aucune iframe youtube détectée';
  for (const fr of iframes) {
    try {
      const ws2 = await attachToFrame2(fr.webSocketDebuggerUrl);
      const raw = await probePlayer(ws2);
      console.log(`[${fr.type}] → ${raw}`);
      try {
        const p = JSON.parse(raw);
        if (p.error) verdict = `ÉCHEC ENCORE : ${p.error}`;
        else if (p.hasVideo && p.duration > 0) verdict = 'LECTURE OK ✓ — cause consentement/SameSite confirmée';
      } catch { /* brut */ }
      ws2.close();
    } catch (e) {
      console.log(`[${fr.type}] attach KO: ${e.message}`);
    }
  }
  console.log(`>>> VERDICT : ${verdict}`);

  await send('Runtime.evaluate', { expression: "document.getElementById('socs3')?.remove(); 'ok'" });
  ws.close();
  process.exit(0);
}

function attachToFrame2(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url, { maxPayload: 64 * 1024 * 1024 });
    const to = setTimeout(() => { ws.close(); reject(new Error('attach timeout')); }, 4000);
    ws.on('open', () => { clearTimeout(to); resolve(ws); });
    ws.on('error', (e) => { clearTimeout(to); reject(e); });
  });
}

main().catch((e) => { console.error('KO:', e.message); process.exit(1); });
