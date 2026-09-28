#!/usr/bin/env node
/**
 * Génère les logos PNG des versions de MS-DOS (1.0 → 6.22), de Windows
 * (1.01 → 11), des autres modèles Commodore (PET → CD32) et de la gamme
 * Amstrad CPC (464 → CPC+) dans public/logos/consoles/.
 * Moteur de rendu : @resvg/resvg-js (local, pas de réseau).
 *
 *   node scripts/generate-ms-logos.js
 */
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const OUT = path.join(__dirname, '..', 'public', 'logos', 'consoles');
fs.mkdirSync(OUT, { recursive: true });

/* ── Chaperon typographique : les fonts système ne sont pas dispo pour resvg,
      on trace donc les libellés en vectoriel simple (chemins approximatifs).
      Pour rester lisible sans police, on utilise <text> avec la police
      embarquée resvg par défaut (sans-serif → DejaVu sur la plupart des
      systèmes Linux). Un fallback : si le texte manque, le logo reste
      reconnaissable par ses formes. ── */

/** Fond noir + wordmark « MS-DOS » avec chevron, comme les écrans de boot. */
function dosSvg(version, year) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <rect width="800" height="500" fill="#000000"/>
  <rect x="14" y="14" width="772" height="472" fill="none" stroke="#${versionColor(version)}" stroke-width="6"/>
  <rect x="40" y="60" width="720" height="120" fill="#${versionColor(version)}"/>
  <text x="70" y="152" font-family="Courier New, monospace" font-weight="bold" font-size="86" fill="#000000">C:\\&gt; MS-DOS ${version}</text>
  <text x="70" y="250" font-family="Courier New, monospace" font-size="38" fill="#e8e8e8">Microsoft Disk Operating System</text>
  <text x="70" y="310" font-family="Courier New, monospace" font-size="40" fill="#9adf9a">Version ${version} · ${year}</text>
  <text x="70" y="410" font-family="Courier New, monospace" font-size="36" fill="#c0c0c0">(C) Microsoft Corp</text>
  <rect x="640" y="440" width="120" height="14" fill="#9adf9a"/>
</svg>`;
}

function versionColor(v) {
  const map = {
    '1.0': '3aa0d8', '2.0': '2f8fc9', '3.3': '257eb8',
    '4.01': '1c6da6', '5.0': '135d94', '6.22': '0a4d82',
  };
  return map[v] || '0078d7';
}

/** Wordmark « Microsoft Windows » + drapeau à n panes (2x2 ou 2x2 incliné). */
function winSvg(label, year, color, flagStyle) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" width="900" height="500">
  <rect width="900" height="500" fill="#f0f0f0"/>
  <rect x="8" y="8" width="884" height="484" fill="none" stroke="#${color}" stroke-width="10"/>
  ${flag(flagStyle, color)}
  <text x="450" y="360" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="58" fill="#0a0a0a">Microsoft</text>
  <text x="450" y="425" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="64" fill="#${color}">Windows ${label}</text>
  <text x="450" y="470" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#666666">${year}</text>
</svg>`;
}

/** Drapeaux Windows : 2x2 simple, vague XP, Aero 3D, plat 2021. */
function flag(style, color) {
  const pane = (x, y, fill, skew = '') =>
    `<rect x="${x}" y="${y}" width="86" height="86" fill="${fill}" ${skew}/>`;
  const classic = ['#f34f21', '#7fba00', '#01a4ef', '#ffb900'];
  const flat = ['#f25022', '#7fba00', '#00a4ef', '#ffb900'];
  switch (style) {
    case 'wavy': // Windows 95-98 : drapeau à 4 vagues inclinées
      return `<g transform="translate(330,60)">
        <path d="M120 20 Q60 5 20 22 L20 98 Q60 82 120 96 Z" fill="#f34f21"/>
        <path d="M135 18 Q195 4 235 20 L235 94 Q195 79 135 94 Z" fill="#7fba00"/>
        <path d="M120 112 Q60 98 20 114 L20 190 Q60 174 120 188 Z" fill="#01a4ef"/>
        <path d="M135 110 Q195 96 235 112 L235 186 Q195 171 135 186 Z" fill="#ffb900"/>
        <text x="128" y="240" text-anchor="middle" font-family="Arial" font-size="0"> </text>
      </g>`;
    case 'xp': // drapeau XP : 4 pans en perspective
      return `<g transform="translate(320,55)">
        <path d="M115 25 L30 60 L30 130 L115 105 Z" fill="#f65314"/>
        <path d="M130 22 L230 45 L230 122 L130 102 Z" fill="#7cbb00"/>
        <path d="M115 122 L30 148 L30 218 L115 200 Z" fill="#00a1f1"/>
        <path d="M130 118 L230 138 L230 212 L130 197 Z" fill="#ffbb00"/>
      </g>`;
    case 'aero': // Vista/7 : boule de drapeau
      return `<g transform="translate(318,50)">
        <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ff8a00"/><stop offset="1" stop-color="#e05a00"/>
        </linearGradient></defs>
        <ellipse cx="140" cy="125" rx="128" ry="122" fill="url(#g1)" opacity="0.95"/>
        <path d="M140 25 L75 90 L140 125 Z" fill="#ffffff" opacity="0.85"/>
        <path d="M140 25 L205 90 L140 125 Z" fill="#e8e8e8" opacity="0.75"/>
        <path d="M140 125 L75 90 L75 160 L140 200 Z" fill="#ffffff" opacity="0.6"/>
        <path d="M140 125 L205 90 L205 160 L140 200 Z" fill="#d8d8d8" opacity="0.55"/>
      </g>`;
    case 'win8': // 8/8.1 : perspectives inclinées
      return `<g transform="translate(318,60)">
        ${pane(20, 20, '#f25022', 'transform="skewY(-8)"')}
        ${pane(120, 20, '#7fba00', 'transform="skewY(-8)"')}
        ${pane(20, 120, '#00a4ef', 'transform="skewY(-8)"')}
        ${pane(120, 120, '#ffb900', 'transform="skewY(-8)"')}
      </g>`;
    default: // 1.0-3.1 et 10/11 : damier plat
      return `<g transform="translate(364,70)">
        ${pane(0, 0, '#f25022')}${pane(96, 0, '#7fba00')}
        ${pane(0, 96, '#00a4ef')}${pane(96, 96, '#ffb900')}
      </g>`;
  }
}

/** Les 19 logos à générer. */
const LOGOS = [
  // MS-DOS
  { id: 'dos1', svg: dosSvg('1.0', 1981) },
  { id: 'dos2', svg: dosSvg('2.0', 1983) },
  { id: 'dos3', svg: dosSvg('3.3', 1987) },
  { id: 'dos4', svg: dosSvg('4.01', 1989) },
  { id: 'dos5', svg: dosSvg('5.0', 1991) },
  { id: 'dos6', svg: dosSvg('6.22', 1994) },
  // Windows
  { id: 'win1', svg: winSvg('1.01', 1985, '555555', 'classic') },
  { id: 'win2', svg: winSvg('2.0', 1987, '2f6fab', 'classic') },
  { id: 'win30', svg: winSvg('3.0', 1990, '2f6fab', 'classic') },
  { id: 'win31', svg: winSvg('3.1', 1992, '2f6fab', 'classic') },
  { id: 'win95', svg: winSvg('95', 1995, '008080', 'wavy') },
  { id: 'win98', svg: winSvg('98', 1998, '3a6ea5', 'wavy') },
  { id: 'winme', svg: winSvg('Me', 2000, '5c7fbf', 'wavy') },
  { id: 'win2000', svg: winSvg('2000', 2000, '525288', 'classic') },
  { id: 'winxp', svg: winSvg('XP', 2001, '245edb', 'xp') },
  { id: 'winvista', svg: winSvg('Vista', 2007, '4a7de0', 'aero') },
  { id: 'win7', svg: winSvg('7', 2009, '0e8ec9', 'aero') },
  { id: 'win10', svg: winSvg('10', 2015, '0078d4', 'flat') },
  { id: 'win11', svg: winSvg('11', 2021, '0078d4', 'flat') },
  // Commodore — autres modèles
  { id: 'pet', svg: commodoreSvg('PET 2001', 1977, '#d8d3c0') },
  { id: 'c16', svg: commodoreSvg('C16', 1984, '#7a7a7a') },
  { id: 'sx64', svg: commodoreSvg('SX-64', 1984, '#c8b890') },
  { id: 'cdtv', svg: commodoreCdSvg('CDTV', 1991, '#6a5a9a') },
  { id: 'c64gs', svg: commodoreConsoleSvg('GAMES SYSTEM', 1990, '#a89868') },
  { id: 'amiga600', svg: commodoreSvg('AMIGA 600', 1992, '#9a8ab8') },
  { id: 'cd32', svg: commodoreCdSvg('CD32', 1993, '#8a7ac8') },
  // Amstrad — gamme CPC
  { id: 'cpc464', svg: amstradSvg('CPC 464', 1984, '#3a6ec0') },
  { id: 'cpc664', svg: amstradSvg('CPC 664', 1985, '#2f5ea8') },
  { id: 'cpc6128', svg: amstradSvg('CPC 6128', 1985, '#27528e') },
  { id: 'cpcplus', svg: amstradSvg('CPC+', 1990, '#1e467a') },
  // Complément — machines manquantes des grandes familles
  { id: 'fds', svg: fdsSvg() },
  { id: 'nomad', svg: brandSvg('SEGA', 'GENESIS NOMAD', 1995, '#2c5aa0', '#0f1420') },
  { id: 'supergrafx', svg: brandSvg('NEC', 'SUPERGRAFX', 1989, '#e8e8ee', '#0f1420') },
  { id: 'pcfx', svg: brandSvg('NEC', 'PC-FX', 1994, '#b8a2d8', '#0f1420') },
  { id: 'msx2p', svg: brandSvg('MSX', 'MSX2+', 1988, '#7a9ac8', '#101820') },
  { id: 'msxturbor', svg: brandSvg('MSX', 'turbo R', 1990, '#5a7ab0', '#101820') },
  { id: 'macintosh', svg: macSvg() },
  { id: 'xegs', svg: brandSvg('ATARI', 'XE GAME SYSTEM', 1987, '#d8d8d8', '#1a1a1a') },
];

/** Logo Famicom Disk System : disquette rouge Famicom. */
function fdsSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" width="900" height="500">
  <rect width="900" height="500" fill="#f4f2ec"/>
  <g transform="translate(450,180)">
    <rect x="-140" y="-90" width="280" height="180" rx="14" fill="#c62828"/>
    <rect x="-140" y="-90" width="280" height="66" rx="14" fill="#e53935"/>
    <rect x="70" y="-70" width="46" height="40" rx="4" fill="#f4f2ec"/>
    <circle cx="-60" cy="30" r="34" fill="#8e1c1c"/>
    <circle cx="-60" cy="30" r="14" fill="#f4f2ec"/>
  </g>
  <text x="450" y="365" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="54" fill="#c62828">Famicom Disk System</text>
  <text x="450" y="420" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#7a7468">1986 · Disk Writer · Koji Kondo jingle</text>
</svg>`;
}

/** Logo générique de marque : wordmark + nom du modèle. */
function brandSvg(brand, model, year, color, bg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" width="900" height="500">
  <rect width="900" height="500" fill="${bg}"/>
  <rect x="8" y="8" width="884" height="484" fill="none" stroke="${color}" stroke-opacity="0.35" stroke-width="6"/>
  <text x="450" y="175" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="92" fill="#ffffff" letter-spacing="14">${brand}</text>
  <text x="450" y="300" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="64" fill="${color}">${model}</text>
  <text x="450" y="380" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#9a9aa8">${year}</text>
</svg>`;
}

/** Logo Macintosh : le boîtier beige compact avec le visage smiley. */
function macSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" width="900" height="500">
  <rect width="900" height="500" fill="#dfe1e4"/>
  <g transform="translate(450,225)">
    <rect x="-125" y="-155" width="250" height="310" rx="18" fill="#e8e0cc" stroke="#a89a80" stroke-width="6"/>
    <rect x="-95" y="-125" width="190" height="150" rx="6" fill="#f2efe4" stroke="#a89a80" stroke-width="4"/>
    <circle cx="-48" cy="-60" r="7" fill="#3a3a3a"/>
    <circle cx="48" cy="-60" r="7" fill="#3a3a3a"/>
    <path d="M-40 -18 Q0 14 40 -18" stroke="#3a3a3a" stroke-width="7" fill="none" stroke-linecap="round"/>
    <rect x="-70" y="60" width="140" height="26" rx="6" fill="#d8cfb8" stroke="#a89a80" stroke-width="3"/>
  </g>
  <text x="450" y="445" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="46" fill="#5a5248">Macintosh · System 1-7</text>
</svg>`;
}

/** Logo Commodore : wordmark « Commodore » + nom du modèle sur plaque. */
function commodoreSvg(model, year, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" width="900" height="500">
  <rect width="900" height="500" fill="#0f1420"/>
  <rect x="8" y="8" width="884" height="484" fill="none" stroke="#5a5a72" stroke-width="6"/>
  <g transform="translate(450,175)" >
    <circle r="95" fill="none" stroke="#${color.slice(1)}" stroke-width="14"/>
    <path d="M-62 30 Q0 -66 62 30" fill="none" stroke="#${color.slice(1)}" stroke-width="14" stroke-linecap="round"/>
  </g>
  <text x="450" y="330" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="56" fill="#ffffff">Commodore</text>
  <text x="450" y="405" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="58" fill="${color}">${model}</text>
  <text x="450" y="455" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#8a8a9a">${year}</text>
</svg>`;
}

/** Logo Commodore CD (CDTV / CD32) : disque compact + arc Commodore. */
function commodoreCdSvg(model, year, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" width="900" height="500">
  <rect width="900" height="500" fill="#0f1420"/>
  <rect x="8" y="8" width="884" height="484" fill="none" stroke="#5a5a72" stroke-width="6"/>
  <g transform="translate(450,165)">
    <circle r="92" fill="#d8dce4"/>
    <circle r="92" fill="none" stroke="#${color.slice(1)}" stroke-width="10"/>
    <circle r="60" fill="none" stroke="#9aa2b2" stroke-width="8"/>
    <circle r="20" fill="#0f1420"/>
    <path d="M-80 -40 A90 90 0 0 1 60 -70" stroke="#7ac0e8" stroke-width="10" fill="none" stroke-linecap="round"/>
  </g>
  <text x="450" y="330" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="52" fill="#ffffff">Commodore</text>
  <text x="450" y="405" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="62" fill="${color}">${model}</text>
  <text x="450" y="455" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#8a8a9a">${year}</text>
</svg>`;
}

/** Logo console Commodore (C64GS) : pad stylisé + plaque du modèle. */
function commodoreConsoleSvg(model, year, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" width="900" height="500">
  <rect width="900" height="500" fill="#0f1420"/>
  <rect x="8" y="8" width="884" height="484" fill="none" stroke="#5a5a72" stroke-width="6"/>
  <g transform="translate(450,160)">
    <rect x="-110" y="-38" width="220" height="86" rx="34" fill="#1c2334" stroke="#${color.slice(1)}" stroke-width="8"/>
    <circle cx="-58" cy="5" r="16" fill="#${color.slice(1)}"/>
    <rect x="-18" y="-16" width="86" height="18" rx="8" fill="#3a4358"/>
    <rect x="-18" y="10" width="56" height="18" rx="8" fill="#3a4358"/>
  </g>
  <text x="450" y="300" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="50" fill="#ffffff">Commodore</text>
  <text x="450" y="375" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="50" fill="${color}">C64 ${model}</text>
  <text x="450" y="440" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#8a8a9a">${year}</text>
</svg>`;
}

/** Logo Amstrad CPC : bandeau bleu + nom du modèle. */
function amstradSvg(model, year, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" width="900" height="500">
  <rect width="900" height="500" fill="#e9edf2"/>
  <rect x="0" y="0" width="900" height="130" fill="#0f1420"/>
  <text x="450" y="88" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="64" fill="#ffffff" letter-spacing="6">AMSTRAD</text>
  <g transform="translate(450,285)">
    <rect x="-150" y="-60" width="300" height="120" rx="14" fill="#f2f5f8" stroke="#0f1420" stroke-width="8"/>
    <rect x="-118" y="-30" width="236" height="60" rx="8" fill="#${color.slice(1)}"/>
    <text y="14" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="44" fill="#ffffff">${model}</text>
  </g>
  <text x="450" y="440" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#5a6474">${year} · Locomotive BASIC</text>
</svg>`;
}

for (const { id, svg } of LOGOS) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 640 } });
  const png = resvg.render().asPng();
  fs.writeFileSync(path.join(OUT, `${id}.png`), png);
  console.log(`✔ ${id}.png (${png.length} octets)`);
}
console.log(`\n${LOGOS.length} logos générés dans ${OUT}`);
