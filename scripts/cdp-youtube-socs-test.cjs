/* Test consentement EEE : pose le cookie SOCS (consentement minimal) pour
 * youtube.com dans la session du desktop, puis reteste l'embed Nintendo. */
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
  const list = await fetch('http://127.0.0.1:9333/json/list').then((r) => r.json());
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

  await send('Network.enable');
  await send('Page.enable');

  // Cookies de consentement pour les deux domaines d'embed.
  // SOCS=CAI  → « Refuser les cookies non essentiels » (le player fonctionne,
  //             pas de tracking publicitaire).
  const socsCookie = { name: 'SOCS', value: 'CAI', domain: '.youtube.com', path: '/', secure: true, httpOnly: false, sameSite: 'Lax' };
  await send('Network.setCookie', socsCookie);
  await send('Network.setCookie', { ...socsCookie, domain: '.youtube-nocookie.com' });
  const vis = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: "document.cookie ? 'cookies visibles' : 'cookie posé (domaine youtube, invisible depuis retromad:// — normal)'",
  });
  console.log(`cookie SOCS=CAI posé pour .youtube.com et .youtube-nocookie.com (${vis.result?.result?.value})`);

  // Injecter l'embed et sonder
  await send('Runtime.evaluate', {
    expression: `document.getElementById('socs-test')?.remove();
      const f=document.createElement('iframe');
      f.id='socs-test';
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
      const res = await probePlayer(ws2);
      console.log(`[SOCS posé] → ${res}`);
      try {
        const p = JSON.parse(res);
        if (p.error) verdict = `ÉCHEC ENCORE : ${p.error}`;
        else if (p.hasVideo && p.duration > 0) verdict = 'LECTURE OK ✓ — cause = consentement EEE (SOCS) confirmée';
      } catch { /* garde le verdict brut */ }
      ws2.close();
    } catch (e) {
      console.log(`attach KO: ${e.message}`);
    }
  }
  console.log(`>>> VERDICT : ${verdict}`);

  await send('Runtime.evaluate', { expression: "document.getElementById('socs-test')?.remove(); 'ok'" });
  ws.close();
  process.exit(0);
}

main().catch((e) => { console.error('KO:', e.message); process.exit(1); });
