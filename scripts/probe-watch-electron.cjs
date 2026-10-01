const WebSocket = require('ws');
async function getConn(urlFilter) {
  for (let i = 0; i < 8; i++) {
    const list = await fetch('http://127.0.0.1:9333/json/list').then(r => r.json());
    const t = list.find(x => x.type === 'page' && (!urlFilter || urlFilter.test(x.url)));
    if (t) {
      try {
        const ws = new WebSocket(t.webSocketDebuggerUrl, { maxPayload: 64*1024*1024 });
        await new Promise((res, rej) => { const to = setTimeout(()=>{ws.close();rej(new Error('timeout'))},4000); ws.on('open',()=>{clearTimeout(to);res()}); ws.on('error',rej); });
        return { ws, url: t.url };
      } catch {}
    }
    await new Promise(r => setTimeout(r, 1500));
  }
  throw new Error('page introuvable: ' + urlFilter);
}
function rpc(ws, method, params, id = 1) {
  return new Promise((resolve) => {
    const on = (d) => { const m = JSON.parse(d.toString()); if (m.id === id) { ws.off('message', on); resolve(m); } };
    ws.on('message', on);
    ws.send(JSON.stringify({ id, method, params }));
    setTimeout(() => resolve({}), 15000);
  });
}
async function main() {
  let conn = await getConn(/127\.0\.0\.1:8123/);
  await rpc(conn.ws, 'Page.enable', {}, 10);
  await rpc(conn.ws, 'Page.navigate', { url: 'https://www.youtube.com/watch?v=in4X7qOUxEg' }, 11);
  conn.ws.close();
  await new Promise(r => setTimeout(r, 16000));

  conn = await getConn(/youtube\.com\/watch/);
  const res = await rpc(conn.ws, 'Runtime.evaluate', { returnByValue: true, expression:
    `(function(){try{ const err=document.querySelector('.ytp-error-content-wrap-reason')?.innerText||''; const vid=document.querySelector('video'); return JSON.stringify({error:err,hasVideo:!!vid,duration:vid&&isFinite(vid.duration)?vid.duration:-1,readyState:vid?vid.readyState:-1,paused:vid?vid.paused:null}); }catch(e){return 'ERR:'+e.message;} })()` }, 20);
  console.log('[Electron page watch] →', res.result?.result?.value);

  await rpc(conn.ws, 'Page.navigate', { url: 'retromad://app/index.html' }, 21);
  conn.ws.close();
  console.log('app restaurée');
  process.exit(0);
}
main().catch(e => { console.error('KO:', e.message); process.exit(1); });
