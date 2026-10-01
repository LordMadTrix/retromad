const WebSocket = require('ws');
async function main() {
  const list = await fetch('http://127.0.0.1:9333/json/list').then(r => r.json());
  const frames = list.filter(t => /youtube/.test(t.url));
  for (const fr of frames) {
    const ws = new WebSocket(fr.webSocketDebuggerUrl, { maxPayload: 64*1024*1024 });
    await new Promise((res, rej) => { const to = setTimeout(()=>{ws.close();rej(new Error('timeout'))},5000); ws.on('open',()=>{clearTimeout(to);res()}); ws.on('error',rej); });
    const val = await new Promise((resolve) => {
      const on = (d) => { const m = JSON.parse(d.toString()); if (m.id === 1) { ws.off('message', on); resolve(m.result?.result?.value); } };
      ws.on('message', on);
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { returnByValue: true, expression: `(function(){try{ const err=document.querySelector('.ytp-error-content-wrap-reason')?.innerText||''; const vid=document.querySelector('video'); return JSON.stringify({error:err,hasVideo:!!vid,duration:vid?vid.duration:-1,readyState:vid?vid.readyState:-1,paused:vid?vid.paused:null}); }catch(e){return 'ERR:'+e.message;} })()` } }));
      setTimeout(()=>resolve('timeout'), 12000);
    });
    console.log(`[${fr.type}] →`, val);
    ws.close();
  }
  process.exit(0);
}
main().catch(e => { console.error('KO:', e.message); process.exit(1); });
