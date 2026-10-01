const WebSocket = require('ws');
async function main() {
  const list = await fetch('http://127.0.0.1:9333/json/list').then(r => r.json());
  const t = list.find(x => x.type === 'page');
  console.log('page actuelle:', t.url.slice(0, 80));
  const ws = new WebSocket(t.webSocketDebuggerUrl, { maxPayload: 64*1024*1024 });
  await new Promise((res, rej) => { const to = setTimeout(()=>{ws.close();rej(new Error('timeout'))},4000); ws.on('open',()=>{clearTimeout(to);res()}); ws.on('error',rej); });
  const val = await new Promise((resolve) => {
    const on = (d) => { const m = JSON.parse(d.toString()); if (m.id === 1) { ws.off('message', on); resolve(m.result?.result?.value); } };
    ws.on('message', on);
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { returnByValue: true, expression:
      `(function(){try{ const err=document.querySelector('.ytp-error-content-wrap-reason')?.innerText||''; const vid=document.querySelector('video'); const txt=(document.body?.innerText||'').replace(/\\s+/g,' ').slice(0,120); return JSON.stringify({error:err,hasVideo:!!vid,rs:vid?vid.readyState:-1,dur:vid&&isFinite(vid.duration)?vid.duration:-1,paused:vid?vid.paused:null,txt}); }catch(e){return 'ERR:'+e.message;} })()` } }));
    setTimeout(()=>resolve('timeout'), 12000);
  });
  console.log('→', val);
  // restaure l'app
  ws.send(JSON.stringify({ id: 2, method: 'Page.navigate', params: { url: 'retromad://app/index.html' } }));
  await new Promise(r => setTimeout(r, 3000));
  console.log('app restaurée');
  process.exit(0);
}
main().catch(e => { console.error('KO:', e.message); process.exit(1); });
