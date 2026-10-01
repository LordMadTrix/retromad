/* Comparaison avec/sans interception : même fenêtre, deux iframes.
 * A = embed direct (interception active)  B = embed proxifié (sans interception)
 */
const WebSocket = require('ws');

const VIDEO_ID = 'in4X7qOUxEg';
const WAIT_MS = 15000;

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
        if (m.id === 1) {
          ws.off('message', onMsg);
          resolve(m.result?.result?.value);
        }
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

  // A : embed direct (comme la fiche Nintendo, headers usurpés)
  // B : embed via data: (sandboxed) — le session.webRequest de l'app ne
  //     s'applique pas aux requêtes d'une iframe dont le document est opaque ;
  //     en pratique Electron applique la session, donc on utilise un embed
  //     proxifié via un data: URL chargé dans un <iframe sandbox> distinct.
  await send('Runtime.evaluate', {
    expression: `(function(){
      document.querySelectorAll('.cdp-embed').forEach(e=>e.remove());
      function mk(id, left, src, sandbox){
        const f=document.createElement('iframe');
        f.className='cdp-embed';
        f.id=id;
        if(sandbox) f.setAttribute('sandbox','allow-scripts allow-same-origin allow-presentation');
        f.allow='autoplay; encrypted-media; picture-in-picture';
        f.src=src;
        f.style.cssText='position:fixed;top:0;width:480px;height:270px;z-index:999999;background:#000;'+left;
        document.body.appendChild(f);
      }
      mk('embA','left:0','https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&playsinline=1');
      mk('embB','left:490px','https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&mute=1&playsinline=1');
      return '2 iframes';
    })()`,
  });

  await new Promise((r) => setTimeout(r, WAIT_MS));

  // Comparaison domaines : nocookie vs www.youtube.com
  const list2 = await fetch('http://127.0.0.1:9333/json/list').then((r) => r.json());
  const frames = list2.filter((t) => t.type === 'iframe' && /youtube/.test(t.url));
  console.log(`iframes: ${frames.length}`);
  for (const fr of frames) {
    const tag = fr.url.includes('nocookie') ? 'A (nocookie)' : 'B (www)';
    try {
      const ws2 = await attachToFrame(fr);
      const res = await probePlayer(ws2);
      console.log(`${tag} → ${res}`);
      ws2.close();
    } catch (e) {
      console.log(`${tag} → attach KO: ${e.message}`);
    }
  }

  await send('Runtime.evaluate', {
    expression: "document.querySelectorAll('.cdp-embed').forEach(e=>e.remove()); 'ok'",
  });
  ws.close();
  process.exit(0);
}

main().catch((e) => { console.error('KO:', e.message); process.exit(1); });
