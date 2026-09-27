#!/usr/bin/env node
/**
 * Télécharge les VRAIS logos officiels depuis les thèmes XMB de RetroArch
 * (dépôt libretro/retroarch-assets) pour les systèmes qui en manquent.
 * Essaie plusieurs thèmes par ordre de préférence, puis plusieurs formats de nom.
 * Usage : node scripts/fetch-real-logos.js
 */
const fs = require('fs');
const path = require('path');

const THEMES = ['dot-art', 'flatux', 'monochrome', 'automatic', 'pixel', 'systematic', 'flatui', 'retrosystem', 'daite'];

// id RetroMad -> noms libretro possibles (par ordre d'essai)
const TARGETS = {
  zx81: ['Sinclair - ZX81', 'Sinclair - ZX 81'],
  x68000: ['Sharp - X68000'],
  x1: ['Sharp - X1'],
  atari8bit: ['Atari - 8-bit', 'Atari 800', 'Atari - 800'],
  vic20: ['Commodore - VIC-20'],
  c128: ['Commodore - C128', 'Commodore - 128'],
  pet: ['Commodore - PET'],
  plus4: ['Commodore - Plus4', 'Commodore - Plus/4'],
  neogeocd: ['SNK - Neo Geo CD', 'SNK - NeoGeo CD'],
  thomson: ['Thomson - MO5', 'Thomson - MO/TO'],
  mo5: ['Thomson - MO5'],
  pc8000: ['NEC - PC-8000', 'NEC - PC8801'],
  gx4000: ['Amstrad - GX4000'],
  ngage: ['Nokia - N-Gage'],
  playdate: ['Panic - Playdate'],
};

const outDir = path.join(__dirname, '..', 'public', 'logos', 'consoles');

async function exists(url) {
  try {
    const r = await fetch(url, { method: 'HEAD' });
    return r.status === 200;
  } catch {
    return false;
  }
}

async function download(url, dest) {
  const r = await fetch(url);
  if (!r.ok) return false;
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 500) return false; // trop petit = probablement une erreur
  fs.writeFileSync(dest, buf);
  return true;
}

(async () => {
  const results = { ok: [], fail: [] };
  for (const [id, names] of Object.entries(TARGETS)) {
    const dest = path.join(outDir, `${id}.png`);
    if (fs.existsSync(dest)) {
      results.ok.push(`${id} (existe déjà)`);
      continue;
    }
    let done = false;
    for (const theme of THEMES) {
      for (const name of names) {
        const url = `https://raw.githubusercontent.com/libretro/retroarch-assets/master/xmb/${theme}/png/${encodeURIComponent(name)}.png`;
        if (await exists(url)) {
          if (await download(url, dest)) {
            results.ok.push(`${id} ← ${theme}/${name}`);
            done = true;
            break;
          }
        }
      }
      if (done) break;
    }
    if (!done) results.fail.push(id);
  }
  console.log('=== TÉLÉCHARGÉS ===');
  results.ok.forEach((r) => console.log(' ✓', r));
  if (results.fail.length) {
    console.log('=== ÉCHECS ===');
    results.fail.forEach((r) => console.log(' ✗', r));
  }
})();
