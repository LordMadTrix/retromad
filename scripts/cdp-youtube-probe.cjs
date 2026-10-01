/* Probe CDP : injecte l'embed YouTube de la fiche Nintendo dans le desktop
 * RetroMad (avec les fixs headers actifs) et observe le player. */
const WebSocket = require('ws');

const VIDEO_ID = 'in4X7qOUxEg'; // fiche Nintendo (companyMuseumData)
const WAIT_MS = 18000;

async function main() {
  const list = await fetch('http://127.0.0.1:9333/json/list').then((r) => r.json());
  const page = list.find((t) => t.type === 'page' && t.url.includes('retromad'));
  if (!page) throw new Error('Page retromad introuvable');

  const ws = new WebSocket(page.webSocketDebuggerUrl, { maxPayload: 256 * 1024 * 1024 });
  let msgId = 0;
  const pending = new Map();
  const events = [];
  const network = [];

  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const id = ++msgId;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });

  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
      return;
    }
    if (msg.method === 'Network.responseReceived') {
      const r = msg.params.response;
      if (/youtube|googlevideo|ytimg/.test(r.url)) {
        network.push({ status: r.status, url: r.url.replace(/\?.*/, '').slice(0, 110) });
      }
    } else if (msg.method === 'Runtime.consoleAPICalled') {
      const text = (msg.params.args || []).map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 220);
      if (text) events.push(`[console.${msg.params.type}] ${text}`);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      events.push(`[exception] ${(d.exception?.description || d.text || '').slice(0, 220)}`);
    }
  });

  await new Promise((r) => ws.on('open', r));
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Page.enable');

  await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(function(){
      document.getElementById('cdp-test-embed')?.remove();
      const f = document.createElement('iframe');
      f.id = 'cdp-test-embed';
      f.allow = 'autoplay; encrypted-media; picture-in-picture';
      f.src = 'https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&rel=0&modestbranding=1';
      f.style.cssText = 'position:fixed;top:0;left:0;width:640px;height:360px;z-index:999999;background:#000;';
      document.body.appendChild(f);
      return 'iframe injectée';
    })()`,
  });

  // Phase 1 : injection + collecte passive (la liste CDP initiale est capturée)
  await new Promise((r) => setTimeout(r, WAIT_MS));

  // Phase 2 : reconnexion — les iframes OOPif réapparaissent dans /json/list
  const list2 = await Promise.race([
    fetch('http://127.0.0.1:9333/json/list').then((r) => r.json()),
    new Promise((_, rej) => setTimeout(() => rej(new Error('json/list timeout')), 5000)),
  ]);
  const frames = list2.filter((t) => t.type === 'iframe' && /youtube|googlevideo/.test(t.url));
  console.log(`=== cibles iframe détectées : ${frames.length} ===`);
  let verdict = 'INDÉTERMINÉ : player enfant muet';
  for (const fr of frames) {
    try {
      const ws2 = new WebSocket(fr.webSocketDebuggerUrl, { maxPayload: 64 * 1024 * 1024 });
      const attach = await Promise.race([
        new Promise((r) => ws2.on('open', r)),
        new Promise((_, rej) => setTimeout(() => rej(new Error('attach timeout')), 4000)),
      ]);
      const result = await Promise.race([
        new Promise((resolve) => {
          const id = ++msgId;
          const onMsg = (data) => {
            const m = JSON.parse(data.toString());
            if (m.id === id) {
              ws2.off('message', onMsg);
              pending.delete(id);
              resolve(m.result?.result?.value);
            }
          };
          ws2.on('message', onMsg);
          ws2.send(
            JSON.stringify({
              id,
              method: 'Runtime.evaluate',
              params: {
                returnByValue: true,
                expression: `(function(){try{
                  const err=document.querySelector('.ytp-error-content-wrap-reason')?.innerText||'';
                  const vid=document.querySelector('video');
                  return JSON.stringify({error:err,hasVideo:!!vid,duration:vid?vid.duration:-1});
                }catch(e){return 'ERR:'+e.message;}})()`,
              },
            })
          );
          setTimeout(() => resolve(undefined), 4000);
        }),
        new Promise((resolve) => setTimeout(() => resolve(undefined), 5000)),
      ]);
      console.log(` iframe ${fr.url.replace(/\?.*/, '').slice(0, 60)} → ${result}`);
      try {
        const p = JSON.parse(result);
        if (p.error) verdict = `ERREUR PLAYER : ${p.error.replace(/\n/g, ' ').slice(0, 140)}`;
        else if (p.hasVideo && p.duration > 0) verdict = 'LECTURE OK ✓ (flux vidéo actif dans le player)';
      } catch {
        /* verdict inchangé */
      }
      ws2.close();
    } catch (e) {
      console.log(` iframe ${fr.url.slice(0, 60)} → attachement impossible: ${e.message}`);
    }
  }

  const vp = network.filter((n) => n.url.includes('videoplayback'));
  console.log(`=== flux videoplayback (parent) : ${vp.length} requête(s)`);
  const errs = events.filter((e) => /error|152|153|unavailable|exception/i.test(e));
  console.log(`=== erreurs console parent (${errs.length}) ===`);
  errs.slice(0, 12).forEach((e) => console.log(' ', e));
  console.log(`\n>>> VERDICT : ${verdict}`);

  await send('Runtime.evaluate', {
    returnByValue: true,
    expression: "document.getElementById('cdp-test-embed')?.remove(); 'nettoyé'",
  });
  ws.close();
  process.exit(0);
}

main().catch((e) => {
  console.error('Probe échoué:', e.message);
  process.exit(1);
});
