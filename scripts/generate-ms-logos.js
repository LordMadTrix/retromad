#!/usr/bin/env node
/**
 * Génère les logos PNG des versions de MS-DOS (1.0 → 6.22) et de Windows
 * (1.01 → 11) dans public/logos/consoles/, à partir de SVG construits ici.
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
];

for (const { id, svg } of LOGOS) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 640 } });
  const png = resvg.render().asPng();
  fs.writeFileSync(path.join(OUT, `${id}.png`), png);
  console.log(`✔ ${id}.png (${png.length} octets)`);
}
console.log(`\n${LOGOS.length} logos générés dans ${OUT}`);
