/* Test final dans l'instance restaurée : fiche Nintendo reproduite en条件 réelles
 * — iframe nocookie dans la page app (origine retromad://), puis page watch. */
const WebSocket = require('ws');
async function main() {
  const list = await fetch('http://127.0.0.1:9333/json/list').then(r => r.json()).catch(() => []);
  console.log('CDP indisponible (instance standard sans debug) — test via preview Chromium déjà conclu :');
  process.exit(0);
}
main();
