/**
 * Génère le logo ZX81 manquant (256x256, flat design : coque noire + clavier blanc).
 * Encodage PNG sans dépendance externe (zlib natif Node).
 * Usage : node scripts/gen-zx81-logo.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const W = 256, H = 256;

// Palette
const BLACK = [24, 24, 28, 255];
const DARK = [15, 15, 19, 255];
const WHITE = [235, 238, 242, 255];
const RED = [211, 31, 31, 255];

// Image RGBA
const img = Buffer.alloc(W * H * 4);
function setPx(x, y, [r, g, b, a]) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4;
  img[i] = r; img[i + 1] = g; img[i + 2] = b; img[i + 3] = a;
}
function fillRect(x0, y0, x1, y1, color) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) setPx(x, y, color);
}

// Fond transparent
for (let i = 0; i < W * H; i++) img[i * 4 + 3] = 0;

// Coque noire (machine posée en léger perspective)
fillRect(28, 96, 227, 208, BLACK);
// Facette supérieure (profondeur)
fillRect(28, 96, 227, 104, DARK);

// Clavier membrane blanc (8 rangées de touches stylisées)
for (let row = 0; row < 5; row++) {
  const y0 = 118 + row * 15;
  for (let col = 0; col < 8; col++) {
    const x0 = 44 + col * 23;
    fillRect(x0, y0, x0 + 17, y0 + 9, WHITE);
  }
}

// Bande rouge sinclair (le "rainbow stripe" du logo ZX)
fillRect(28, 200, 227, 208, RED);

// Encoder PNG (IHDR, IDAT zlib, IEND) — filtre 0 par ligne
function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;  // bit depth
ihdr[9] = 6;  // RGBA

// Données : chaque ligne précédée du byte de filtre 0
const raw = Buffer.alloc((W * 4 + 1) * H);
for (let y = 0; y < H; y++) {
  raw[y * (W * 4 + 1)] = 0;
  img.copy(raw, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4);
}

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

const out = path.join(__dirname, '..', 'public', 'logos', 'consoles', 'zx81.png');
fs.writeFileSync(out, png);
console.log('Logo ZX81 généré :', out, '(' + png.length + ' octets)');
