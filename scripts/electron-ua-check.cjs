const WebSocket = require('ws');
async function main() {
  const list = await fetch('http://127.0.0.1:9333/json/list').then(r => r.json()).catch(() => null);
  if (!list) { console.log('CDP off — lancement avec debug…'); process.exit(2); }
  process.exit(2);
}
main();
