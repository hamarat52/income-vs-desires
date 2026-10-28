// MAGAZA-LISTELEME.md ve manifest'teki metinlerin karakter sayısı (Unicode kod noktası).
const fs = require('fs');
const root = '/Users/hamaratbey/Desktop/Projeler/income-vs-desires-wt-chrome';
const md = fs.readFileSync(`${root}/MAGAZA-LISTELEME.md`, 'utf8');
const block = (title) => {
  const i = md.indexOf(title);
  const s = md.indexOf('```\n', i) + 4;
  return md.slice(s, md.indexOf('\n```', s));
};
const m = JSON.parse(fs.readFileSync(`${root}/manifest.json`, 'utf8'));
const rows = [
  ['MAGAZA ad', block('## Ad (75'), 75],
  ['MAGAZA kısa açıklama', block('## Kısa açıklama (132'), 132],
  ['manifest name', m.name, 75],
  ['manifest description', m.description, 132],
];
for (const [k, v, max] of rows) console.log(`${k}: ${[...v].length}/${max} ${[...v].length <= max ? 'OK' : 'AŞIYOR'} | ${v}`);
// Mağaza özeti manifest'ten okunur: kısa açıklama ile manifest description birebir aynı olmalı.
const same = m.description === block('## Kısa açıklama (132');
console.log(`manifest description = MAGAZA kısa açıklama: ${same ? 'AYNI' : 'FARKLI'}`);
if (!same || rows.some(([, v, max]) => [...v].length > max)) process.exitCode = 1;
