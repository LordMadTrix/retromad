/* Test origine parente : embed YouTube en page de premier niveau (pas d'iframe)
 * dans le même desktop Electron. Si la vidéo joue ici, la cause est
 * l'origine parente custom (retromad://) qui fait échouer l'intégration. */
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
            return JSON.stringify({error:err,hasVideo:!!vid,duration:vid?vid.duration:-1,ready:document.readyState});
          }catch(e){return 'ERR:'+e.message;}})()`,
        },
      }));
      setTimeout(() => resolve(undefined), 4000);
    }),
    new Promise((resolve) => setTimeout(() => resolve(undefined), 5000)),
  ]);
}

async function main() {
  // Connexion au niveau NAVIGATEUR (requis pour Target.createTarget)
  const version = await fetch('http://127.0.0.1:9333/json/version').then((r) => r.json());
  const ws = new WebSocket(version.webSocketDebuggerUrl, { maxPayload: 64 * 1024 * 1024 });
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

  // Ouvre un vrai onglet Electron avec l'embed en page racine (origine youtube.com)
  const created = await send('Target.createTarget', {
    url: `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&playsinline=1`,
  });
  const targetId = created.result?.targetId;
  console.log(`onglet embed racine créé : ${targetId ? 'ok' : JSON.stringify(created)}`);

  await new Promise((r) => setTimeout(r, 14000));

  const list2 = await fetch('http://127.0.0.1:9333/json/list').then((r) => r.json());
  const tab = list2.find((t) => t.id === targetId);
  if (tab) {
    try {
      const ws2 = await attachToFrame(tab);
      console.log(`[embed racine youtube-nocookie] → ${await probePlayer(ws2)}`);
      ws2.close();
    } catch (e) {
      console.log(`attach KO: ${e.message}`);
    }
  } else {
    console.log('onglet introuvable dans la liste');
  }

  if (targetId) await send('Target.closeTarget', { targetId });
  ws.close();
  process.exit(0);
}

main().catch((e) => { console.error('KO:', e.message); process.exit(1); });
