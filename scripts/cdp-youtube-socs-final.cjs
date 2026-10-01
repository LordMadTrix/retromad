/* Test SOCS final : cookies au niveau navigateur (SameSite=None), rechargement
 * de la page pour purger les globals, injection IIFE d'un embed neuf, sonde. */
const WebSocket = require('ws');

const VIDEO_ID = 'in4X7qOUxEg';
const APP_URL = 'retromad://app/index.html';

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

function probePlayer(conn) {
  return Promise.race([
    rpc(conn.ws, conn.pending, 'Runtime.evaluate', {
      returnByValue: true,
      expression: `(function(){try{
        const err=document.querySelector('.ytp-error-content-wrap-reason')?.innerText||'';
        const vid=document.querySelector('video');
        const bodyTxt=(document.body?.innerText||'').replace(/\\s+/g,' ').slice(0,150);
        const consent=!!document.querySelector('ytd-consent-ack-renderer, .consent-screen, #dialog');
        return JSON.stringify({error:err,hasVideo:!!vid,duration:vid?vid.duration:-1,readyState:vid?vid.readyState:-1,paused:vid?vid.paused:null,consent,bodyTxt});
      }catch(e){return 'ERR:'+e.message;}})()`,
    }).then((m) => m.result?.result?.value),
    new Promise((resolve) => setTimeout(() => resolve('timeout probe'), 6000)),
  ]);
}

async function main() {
  // 1. Cookies de consentement au niveau NAVIGATEUR (couvre les OOPIF)
  const version = await fetch('http://127.0.0.1:9333/json/version').then((r) => r.json());
  const browser = makeConn(version.webSocketDebuggerUrl);
  await browser.open;
  const setRes = await rpc(browser.ws, browser.pending, 'Storage.setCookies', {
    cookies: [
      { name: 'SOCS', value: 'CAI', domain: '.youtube.com', path: '/', secure: true, sameSite: 'None' },
      { name: 'SOCS', value: 'CAI', domain: '.youtube-nocookie.com', path: '/', secure: true, sameSite: 'None' },
      { name: 'PREF', value: 'hl=fr&gl=FR', domain: '.youtube.com', path: '/', secure: true, sameSite: 'None' },
    ],
  });
  console.log(`cookies SOCS/PREF (SameSite=None) : ${setRes.error ? JSON.stringify(setRes.error) : 'posés ok'}`);
  browser.ws.close();

  // 2. Connexion à la page app (pas de reload : les IIFE évitent les collisions
  //    de déclarations des injections précédentes)
  let list = await fetch('http://127.0.0.1:9333/json/list').then((r) => r.json());
  const pageInfo = list.find((t) => t.type === 'page' && t.url.includes('retromad'));
  const page2 = makeConn(pageInfo.webSocketDebuggerUrl);
  await page2.open;

  // 3. Injecter un embed neuf (IIFE, horodaté)
  const inj = await rpc(page2.ws, page2.pending, 'Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      document.getElementById('yt-final')?.remove();
      const f = document.createElement('iframe');
      f.id = 'yt-final';
      f.allow = 'autoplay; encrypted-media; picture-in-picture';
      f.src = 'https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&playsinline=1&ts=' + Date.now();
      f.style.cssText = 'position:fixed;top:0;left:0;width:480px;height:270px;z-index:999999;background:#000;';
      document.body.appendChild(f);
      return 'embed injecté : ' + document.readyState;
    })()`,
  });
  console.log(`injection : ${inj.result?.result?.value ?? JSON.stringify(inj.result)}`);

  await new Promise((r) => setTimeout(r, 15000));

  // 4. Sonde des iframes YouTube + état depuis la page parente
  const state = await rpc(page2.ws, page2.pending, 'Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const f = document.getElementById('yt-final');
      if (!f) return 'iframe ABSENTE du DOM';
      return 'iframe présente, src=' + f.src.slice(0, 60);
    })()`,
  });
  console.log(`état parent : ${state.result?.result?.value}`);
  list = await fetch('http://127.0.0.1:9333/json/list').then((r) => r.json());
  const frames = list.filter((t) => /youtube/.test(t.url));
  console.log(`cibles youtube : ${frames.length}`);
  let verdict = 'aucune iframe détectée';
  for (const fr of frames) {
    let raw = '';
    for (let attempt = 1; attempt <= 3 && !raw; attempt++) {
      try {
        const conn = makeConn(fr.webSocketDebuggerUrl);
        await conn.open;
        raw = (await probePlayer(conn)) || '';
        conn.ws.close();
      } catch (e) {
        console.log(`  tentative ${attempt} : ${e.message}`);
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
    console.log(`[${fr.type}] → ${raw || 'sonde muette'}`);
    try {
      const p = JSON.parse(raw);
      if (p.error) verdict = `ÉCHEC ENCORE : ${p.error}`;
      else if (p.hasVideo && p.duration > 0) verdict = `LECTURE OK ✓ (durée ${p.duration}s, paused=${p.paused}) — cause consentement confirmée`;
      else if (p.bodyTxt) verdict = `SANS ERREUR, sans vidéo — texte iframe : ${p.bodyTxt.slice(0, 110)}`;
      else if (p.hasVideo === false && p.duration === -1) verdict = 'player vide : ni erreur ni vidéo — iframe en cours de chargement ou JS bloqué';
    } catch { /* verdict brut */ }
  }
  console.log(`>>> VERDICT : ${verdict}`);

  // Nettoyage : retirer l'iframe de test
  await rpc(page2.ws, page2.pending, 'Runtime.evaluate', {
    expression: "document.getElementById('yt-final')?.remove(); 'ok'",
  });
  page2.ws.close();
  process.exit(0);
}

main().catch((e) => { console.error('KO:', e.message); process.exit(1); });
