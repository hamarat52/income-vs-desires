// IncomeVsDesires ikon seti: SVG üretici (bağımlılık yok, `node icons.mjs <çıktı-klasörü>`).
//
// Ana çizim: hamaratlabs-web/src/AppIcon.jsx, 'Income vs Desires' girdisi
// (yeşil #43e08c → #0c9a6c, cam terazi glyph'i, aynı filtre zinciri, aynı Apple
// "continuous corner" squircle). Bu dosya o bileşenin statik SVG karşılığıdır;
// yalnız yerleşim (tam taşma / macOS gövdesi / Chrome payı) ve küçük boyut
// sadeleştirmesi eklendi.
//
// Varyantlar (hepsi viewBox 0 0 100 100):
//   ios-light   iOS/App Store 1024: tam taşma kare zemin (maske sistemden), alfasız işlenir
//   ios-dark    iOS koyu görünüm: koyu zemin, yeşil cam terazi
//   ios-tinted  iOS tonlu görünüm: siyah zemin, gri tonlu terazi (sistem renklendirir)
//   mac         macOS: 824/1024 squircle gövde + gölge, saydam köşe (Apple macOS ızgarası)
//   mac-small   macOS 16/32 px: aynı gövde, sadeleştirilmiş düz terazi
//   chrome      Chrome araç çubuğu 48/128: tuvali dolduran squircle (mevcut icon-128 ile aynı yerleşim)
//   chrome-small Chrome 16/32: aynı yerleşim, sadeleştirilmiş terazi
//   chrome-store CWS mağaza ikonu: 96/128 gövde + 16 px saydam pay
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CORNER_EXTENT = 1.52866483;
const CORNER = [
  ['C', [1.08849323, 0], [0.86840689, 0], [0.66993427, 0.065496]],
  ['L', [0.63149399, 0.074911]],
  ['C', [0.37282392, 0.16905899], [0.16906013, 0.37282401], [0.07491176, 0.63149399]],
  ['C', [0, 0.86840701], [0, 1.08849299], [0, CORNER_EXTENT]]
];
function squirclePath(w, h, r) {
  const k = Math.min(r, Math.min(w, h) / 2 / CORNER_EXTENT);
  const n = v => +v.toFixed(3);
  const corners = [
    (u, v) => [w - u * k, v * k],
    (u, v) => [w - v * k, h - u * k],
    (u, v) => [u * k, h - v * k],
    (u, v) => [v * k, u * k]
  ];
  let d = `M${n(CORNER_EXTENT * k)} 0`;
  for (const at of corners) {
    d += `L${at(CORNER_EXTENT, 0).map(n).join(' ')}`;
    for (const [cmd, ...pts] of CORNER) d += cmd + pts.map(p => at(...p).map(n).join(' ')).join(' ');
  }
  return `${d}Z`;
}
const SQUIRCLE = squirclePath(100, 100, 26.1);
const INK = '#101317';
const IVORY = '#fffdf8';
const mix = (a, b, t) => {
  const pa = a.match(/\w\w/g).map(h => parseInt(h, 16));
  const pb = b.match(/\w\w/g).map(h => parseInt(h, 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
};

const C1 = '#43e08c';
const C2 = '#0c9a6c';
const DEEP = mix(C2, INK, 0.3);

// AppIcon.jsx'teki glyph birebir (48×48 alan).
const GLYPH = `
  <circle cx="24" cy="8.5" r="3.6"/>
  <rect x="22" y="9" width="4" height="31" rx="2"/>
  <path d="M12 45C12 39.5 16.5 37 24 37S36 39.5 36 45Z"/>
  <rect x="5" y="13.5" width="38" height="4.2" rx="2.1"/>
  <path d="M8.5 16 3.5 29M8.5 16 13.5 29M39.5 16 34.5 29M39.5 16 44.5 29" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M2 28.5H15A6.5 6.5 0 0 1 2 28.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M33 28.5H46A6.5 6.5 0 0 1 33 28.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>`;

// 16/32 px için sadeleştirilmiş terazi: zincirler 1 pikselin altına düştüğü için
// kaldırıldı; kiriş, direk ve kefeler kalınlaştırıldı, kefeler kirişe yaklaştı.
const GLYPH_SMALL = `
  <circle cx="24" cy="7" r="4.6"/>
  <rect x="20.5" y="8" width="7" height="32" rx="2"/>
  <path d="M10 46C10 40 15.5 36.5 24 36.5S38 40 38 46Z"/>
  <rect x="2" y="12" width="44" height="7" rx="3.5"/>
  <path d="M4.5 18.5 7 23h3.5L13 18.5ZM35 18.5 37.5 23H41l2.5-4.5Z"/>
  <path d="M0 23H18A9 9 0 0 1 0 23Z"/>
  <path d="M30 23H48A9 9 0 0 1 30 23Z"/>`;

function defs({ id, c1, c2, deep, bg, body, glyphColor }) {
  return `
  <clipPath id="sq-${id}"><path d="${SQUIRCLE}"/></clipPath>
  <linearGradient id="bg-${id}" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0" stop-color="${bg[0]}"/><stop offset="0.66" stop-color="${bg[1]}"/><stop offset="1" stop-color="${bg[2]}"/>
  </linearGradient>
  <radialGradient id="halo-${id}" cx="0.5" cy="0.48" r="0.42">
    <stop offset="0" stop-color="${IVORY}" stop-opacity="${bg[3] ?? 0.34}"/><stop offset="1" stop-color="${IVORY}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="sheen-${id}" cx="0.4" cy="0" r="0.75">
    <stop offset="0" stop-color="#fff" stop-opacity="${bg[4] ?? 0.42}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="rim-${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="0.7"/><stop offset="0.45" stop-color="#fff" stop-opacity="0.06"/><stop offset="1" stop-color="#fff" stop-opacity="0.3"/>
  </linearGradient>
  <linearGradient id="body-${id}" gradientUnits="userSpaceOnUse" x1="0" y1="4" x2="0" y2="46">
    <stop offset="0" stop-color="${body[0]}" stop-opacity="0.98"/><stop offset="1" stop-color="${body[1]}" stop-opacity="0.9"/>
  </linearGradient>
  <filter id="grain-${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.2 0 0 0 -0.08"/>
  </filter>
  <filter id="glass-${id}" filterUnits="userSpaceOnUse" x="-10" y="-10" width="68" height="72" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="1.7" result="b"/>
    <feGaussianBlur in="SourceAlpha" stdDeviation="2.6" result="sb"/>
    <feOffset in="sb" dy="3" result="so"/>
    <feFlood flood-color="${deep}" flood-opacity="0.55"/>
    <feComposite in2="so" operator="in" result="shadow"/>
    <feSpecularLighting in="b" surfaceScale="3.6" specularConstant="1.3" specularExponent="18" lighting-color="#fff" result="sp">
      <feDistantLight azimuth="240" elevation="38"/>
    </feSpecularLighting>
    <feComposite in="sp" in2="SourceAlpha" operator="in" result="spec"/>
    <feOffset in="b" dy="-1.9" result="bu"/>
    <feComposite in="SourceAlpha" in2="bu" operator="out" result="bottomEdge"/>
    <feFlood flood-color="${c2}" flood-opacity="0.6"/>
    <feComposite in2="bottomEdge" operator="in" result="bottomShade"/>
    <feOffset in="b" dy="1.3" result="bd"/>
    <feComposite in="SourceAlpha" in2="bd" operator="out" result="topEdge"/>
    <feFlood flood-color="#fff" flood-opacity="0.95"/>
    <feComposite in2="topEdge" operator="in" result="topLight"/>
    <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/><feMergeNode in="bottomShade"/><feMergeNode in="topLight"/><feMergeNode in="spec"/></feMerge>
  </filter>
  <filter id="drop-${id}" x="-20%" y="-20%" width="140%" height="150%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="${glyphColor === 'mac' ? 1.0 : 0}"/>
    <feOffset dy="0.9"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.32"/></feComponentTransfer>
    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;
}

const PALETTES = {
  light: { c1: C1, c2: C2, deep: DEEP, bg: [mix(C1, IVORY, 0.1), C2, DEEP], body: [IVORY, mix(IVORY, C1, 0.42)] },
  // Koyu: zemin markanın en koyu yeşilinden siyaha; cam terazi yeşili taşır.
  dark: {
    c1: C1, c2: C2, deep: '#03100b',
    bg: [mix(DEEP, INK, 0.35), mix(DEEP, '#000000', 0.62), '#020604', 0.16, 0.12],
    body: [mix(C1, IVORY, 0.35), C2]
  },
  // Tonlu: Apple gri tonlu ister; sistem kullanıcının rengini uygular.
  tinted: {
    c1: '#d8d8d8', c2: '#6a6a6a', deep: '#000000',
    bg: ['#262626', '#0d0d0d', '#000000', 0.1, 0.08],
    body: ['#ffffff', '#b4b4b4']
  }
};

// layout: { body: [x, y, size] squircle gövdesi (100 birimlik tuvalde), clip: squircle mi tam kare mi }
function icon({ id, palette, small = false, fullBleed = false, body = [0, 0, 100], shadow = false, flatGlyph = false }) {
  const p = PALETTES[palette];
  const [bx, by, bs] = body;
  const s = bs / 100;
  const glyph = small ? GLYPH_SMALL : GLYPH;
  // Küçük boyutta sembol alanı 60 → 74 birim (okunurluk).
  const gT = small ? 'translate(13 11.5) scale(1.54)' : 'translate(20 18) scale(1.25)';
  const clip = fullBleed ? '' : `clip-path="url(#sq-${id})"`;
  const glyphGroup = flatGlyph
    ? `<g fill="url(#body-${id})" color="${IVORY}" stroke="none" filter="url(#drop-${id})">${glyph}</g>`
    : `<g filter="url(#glass-${id})" fill="url(#body-${id})" color="${p.body[0]}" stroke="none">${glyph}</g>`;
  const plate = fullBleed
    ? `<rect width="100" height="100" fill="url(#bg-${id})"/>
       <rect width="100" height="100" fill="url(#halo-${id})"/>
       ${small ? '' : `<rect width="100" height="100" filter="url(#grain-${id})"/>`}
       <ellipse cx="44" cy="-4" rx="80" ry="44" fill="url(#sheen-${id})"/>`
    : `<g ${clip}>
         <rect width="100" height="100" fill="url(#bg-${id})"/>
         <rect width="100" height="100" fill="url(#halo-${id})"/>
         ${small ? '' : `<rect width="100" height="100" filter="url(#grain-${id})"/>`}
         <ellipse cx="44" cy="-4" rx="80" ry="44" fill="url(#sheen-${id})"/>
         <path d="${SQUIRCLE}" fill="none" stroke="url(#rim-${id})" stroke-width="${small ? 3.2 : 2.2}"/>
       </g>`;
  // macOS ızgarası: gövdenin altında yumuşak gölge (Apple şablonu: aşağı düşen koyu gölge).
  const shadowEl = shadow
    ? `<g transform="translate(${bx} ${by}) scale(${s})"><path d="${SQUIRCLE}" fill="#000" opacity="0.30" filter="url(#mshadow)" transform="translate(0 1.4)"/></g>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="1024" height="1024">
<defs>${defs({ id, ...p, glyphColor: flatGlyph ? 'mac' : '' })}
  <filter id="mshadow" x="-20%" y="-20%" width="140%" height="150%"><feGaussianBlur stdDeviation="1.6"/></filter>
</defs>
${shadowEl}
<g transform="translate(${bx} ${by}) scale(${s})">
  ${plate}
  <g transform="${gT}">${glyphGroup}</g>
</g>
</svg>
`;
}

// macOS: 1024 tuvalde 824 gövde, 100 px pay (Apple macOS uygulama ikonu şablonu).
const MAC_BODY = [100 / 10.24, 100 / 10.24 - 0.4, 824 / 10.24];
const VARIANTS = {
  'ios-light': { palette: 'light', fullBleed: true },
  'ios-dark': { palette: 'dark', fullBleed: true },
  'ios-tinted': { palette: 'tinted', fullBleed: true },
  mac: { palette: 'light', body: MAC_BODY, shadow: true },
  'mac-small': { palette: 'light', body: MAC_BODY, shadow: true, small: true, flatGlyph: true },
  chrome: { palette: 'light' },
  'chrome-small': { palette: 'light', small: true, flatGlyph: true },
  'chrome-store': { palette: 'light', body: [12.5, 12.5, 75] }
};

const out = process.argv[2] || 'out';
mkdirSync(out, { recursive: true });
for (const [name, opt] of Object.entries(VARIANTS)) {
  writeFileSync(join(out, `${name}.svg`), icon({ id: name.replace(/-/g, ''), ...opt }));
  console.log(join(out, `${name}.svg`));
}
