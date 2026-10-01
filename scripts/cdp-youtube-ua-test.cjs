/* Test UA : verdict du player avec l'UA actuel, puis avec un UA Chrome pur. */
const WebSocket = require('ws');

const VIDEO_ID = 'in4X7qOUxEg';
const CHROME_UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36';

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

  await send('Runtime.enable');
  await send('Page.enable');

  // État actuel
  const uaNow = await send('Runtime.evaluate', { returnByValue: true, expression: 'navigator.userAgent' });
  console.log(`UA actuel : ${uaNow.result?.result?.value}`);

  const inject = (id) => `document.getElementById('ua-test')?.remove();
    const f=document.createElement('iframe');
    f.id='ua-test';
    f.allow='autoplay; encrypted-media; picture-in-picture';
    f.src='https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&playsinline=1&ts='+Date.now();
    f.style.cssText='position:fixed;top:0;left:0;width:480px;height:270px;z-index:999999;background:#000;';
    document.body.appendChild(f); 'ok'`;

  // Phase 1 : UA courant (userAgentFallback nettoyé d'Electron, headers usurpés NEUTRALISÉS)
  await send('Runtime.evaluate', { expression: inject('phase1') });
  await new Promise((r) => setTimeout(r, 13000));
  const list1 = await fetch('http://127.0.0.1:9333/json/list').then((r) => r.json());
  for (const fr of list1.filter((t) => t.type === 'iframe' && /youtube/.test(t.url))) {
    try {
      const ws2 = await attachToFrame(fr);
      console.log(`[UA actuel]  → ${await probePlayer(ws2)}`);
      ws2.close();
    } catch (e) { console.log(`[UA actuel]  → attach KO: ${e.message}`); }
  }

  // Phase 2 : émulation d'un UA Chrome pur (Network.setUserAgentOverride)
  await send('Network.enable');
  await send('Network.setUserAgentOverride', { userAgent: CHROME_UA });
  const uaNew = await send('Runtime.evaluate', { returnByValue: true, expression: 'navigator.userAgent' });
  console.log(`UA émulé  : ${uaNew.result?.result?.value}`);

  await send('Runtime.evaluate', { expression: inject('phase2') });
  await new Promise((r) => setTimeout(r, 13000));
  const list2 = await fetch('http://127.0.0.1:9333/json/list').then((r) => r.json());
  for (const fr of list2.filter((t) => t.type === 'iframe' && /youtube/.test(t.url))) {
    try {
      const ws2 = await attachToFrame(fr);
      console.log(`[UA Chrome]  → ${await probePlayer(ws2)}`);
      ws2.close();
    } catch (e) { console.log(`[UA Chrome]  → attach KO: ${e.message}`); }
  }

  await send('Runtime.evaluate', { expression: "document.getElementById('ua-test')?.remove(); 'ok'" });
  ws.close();
  process.exit(0);
}

main().catch((e) => { console.error('KO:', e.message); process.exit(1); });
