const WebSocket = require('ws');
async function main() {
  const list = await fetch('http://127.0.0.1:9333/json/list').then(r => r.json());
  const page = list.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
  ws.on('error', (e) => console.log('ws error:', e.message));
  await new Promise((res, rej) => { const to = setTimeout(()=>{ws.close();rej(new Error('open timeout'))},5000); ws.on('open',()=>{clearTimeout(to);res()}); ws.on('error',rej); });
  console.log('ws ouvert');
  const val = await new Promise((resolve) => {
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: 'navigator.userAgent.slice(0,100)' } }));
    const on = (d) => { const m = JSON.parse(d.toString()); if (m.id === 1) { ws.off('message', on); resolve(m.result?.result?.value); } };
    ws.on('message', on);
    setTimeout(()=>resolve('TIMEOUT'), 8000);
  });
  console.log('UA:', val);
  process.exit(0);
}
main().catch(e => { console.error('KO:', e.message); process.exit(1); });
