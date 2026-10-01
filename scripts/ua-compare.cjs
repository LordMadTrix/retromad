const WebSocket = require('ws');
async function main() {
  const list = await fetch('http://127.0.0.1:9333/json/list').then(r => r.json());
  const page = list.find(t => t.type === 'page' && t.url.includes('retromad'));
  const ws = new WebSocket(page.webSocketDebuggerUrl, { maxPayload: 64*1024*1024 });
  await new Promise((res, rej) => { const to = setTimeout(()=>{ws.close();rej(new Error('timeout'))},4000); ws.on('open',()=>{clearTimeout(to);res()}); ws.on('error',rej); });
  const val = await new Promise((resolve) => {
    const on = (d) => { const m = JSON.parse(d.toString()); if (m.id === 1) { ws.off('message', on); resolve(m.result?.result?.value); } };
    ws.on('message', on);
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { returnByValue: true, expression: `JSON.stringify({ua: navigator.userAgent.slice(0,100), brands: navigator.userAgentData ? navigator.userAgentData.brands.map(b=>b.brand+' '+b.version).join(', ') : 'n/a'})` } }));
    setTimeout(()=>resolve('TIMEOUT après 10s'), 10000);
  });
  console.log('Electron UA:', val);
  console.log('brands manquantes = Chromium <90 ou contexte restreint → YouTube exige Sec-CH-UA modernes');
  ws.close();
  process.exit(0);
}
main().catch(e => { console.error('KO:', e.message); process.exit(1); });
