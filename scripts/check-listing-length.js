// Mağaza metinlerinin uzunluk ve tutarlılık kontrolü (TR + EN, CWS + App Store).
//   node scripts/check-listing-length.js        → satır satır sonuç, hata varsa çıkış kodu 1
//   node scripts/check-listing-length.js --md   → store/README.md için Markdown tablo
// Karakter = Unicode kod noktası ([...s].length); bayt = UTF-8 (Buffer.byteLength).
// Metinler listing.md'lerdeki "## <başlık>" altındaki ilk ``` bloğundan okunur.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

function block(file, heading) {
  const md = read(file);
  const i = md.search(new RegExp(`^## ${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm'));
  if (i < 0) throw new Error(`${file}: "## ${heading}" başlığı yok`);
  const s = md.indexOf('```\n', i) + 4;
  return md.slice(s, md.indexOf('\n```', s));
}

const manifest = JSON.parse(read('manifest.json'));
const messages = (lang) => JSON.parse(read(`_locales/${lang}/messages.json`));
// __MSG_x__ → _locales/<dil>/messages.json > x.message
const fromManifest = (lang, value) => value.replace(/^__MSG_(\w+)__$/, (_, k) => messages(lang)[k].message);

const rows = []; // [mağaza, dil, alan, metin, sınır, birim]
const errors = [];

for (const lang of ['tr', 'en']) {
  const f = `store/chrome-web-store/${lang}/listing.md`;
  const name = fromManifest(lang, manifest.name);
  const desc = fromManifest(lang, manifest.description);
  rows.push(['CWS', lang, 'ad (manifest)', name, 75, 'kr']);
  // Özet CWS (132) ve Safari uzantısı (ITMS-90862: 112) için aynı metin: dar sınır geçerli.
  rows.push(['CWS', lang, 'özet (manifest)', desc, 112, 'kr']);
  rows.push(['CWS', lang, 'detaylı açıklama', block(f, lang === 'tr' ? 'Detaylı açıklama' : 'Detailed description'), 16000, 'kr']);
  // Mağaza adı/özeti paketten okunur: listing'deki blok _locales ile birebir olmalı.
  if (block(f, lang === 'tr' ? 'Ad' : 'Name') !== name) errors.push(`CWS ${lang}: listing adı ≠ _locales extName`);
  if (block(f, lang === 'tr' ? 'Kısa açıklama' : 'Summary') !== desc) errors.push(`CWS ${lang}: listing özeti ≠ _locales extDescription`);
  // Chrome 156 manifest yerelleştirmesi "$$" kaçışını çözmüyor (chrome://extensions "$$50" gösterdi).
  if (/\$/.test(name + desc)) errors.push(`CWS ${lang}: manifest ad/özetinde "$" var`);
}

const APPLE = {
  tr: { name: 'Ad', sub: 'Alt başlık', promo: 'Tanıtım metni', kw: 'Anahtar kelimeler', desc: 'Açıklama' },
  en: { name: 'Name', sub: 'Subtitle', promo: 'Promotional text', kw: 'Keywords', desc: 'Description' },
};
for (const lang of ['tr', 'en']) {
  const f = `store/app-store/${lang}/listing.md`;
  const h = APPLE[lang];
  const t = Object.fromEntries(Object.entries(h).map(([k, title]) => [k, block(f, title)]));
  rows.push(['App Store', lang, 'ad', t.name, 30, 'kr']);
  rows.push(['App Store', lang, 'alt başlık', t.sub, 30, 'kr']);
  rows.push(['App Store', lang, 'tanıtım metni', t.promo, 170, 'kr']);
  rows.push(['App Store', lang, 'anahtar kelimeler', t.kw, 100, 'bayt']);
  rows.push(['App Store', lang, 'açıklama', t.desc, 4000, 'kr']);
  // Rehber 2.3.10: başka platform adı yok. 2.3.7: tanıtım metninde fiyat ifadesi yok.
  for (const [k, v] of Object.entries(t)) {
    if (/chrome/i.test(v)) errors.push(`App Store ${lang} ${k}: "Chrome" geçiyor (2.3.10)`);
  }
  if (/ücretsiz|bedava|\bfree\b/i.test(t.promo)) errors.push(`App Store ${lang} tanıtım: fiyat ifadesi (2.3.7)`);
  // Anahtar kelime: her biri > 2 karakter, ad/alt başlıktaki kelimeler tekrar edilmez.
  const used = new Set((t.name + ' ' + t.sub).toLocaleLowerCase(lang).split(/[^\p{L}\p{N}]+/u).filter(Boolean));
  for (const kw of t.kw.split(',')) {
    if ([...kw.trim()].length <= 2) errors.push(`App Store ${lang}: anahtar kelime "${kw}" ≤ 2 karakter`);
    for (const w of kw.toLocaleLowerCase(lang).split(/\s+/)) if (used.has(w)) errors.push(`App Store ${lang}: "${w}" ad/alt başlıkta zaten var`);
  }
  if (t.kw !== t.kw.trim() || /,\s/.test(t.kw)) errors.push(`App Store ${lang}: anahtar kelimelerde virgül sonrası boşluk bayt harcıyor`);
}
// Review notu: ≤ 4000 bayt (Apple "Platform version information").
rows.push(['App Store', 'en', 'review notu', block('store/app-store/shared/review-notes.md', 'EN'), 4000, 'bayt']);
rows.push(['App Store', 'tr', 'review notu', block('store/app-store/shared/review-notes.md', 'TR'), 4000, 'bayt']);

const measure = (v, unit) => (unit === 'bayt' ? Buffer.byteLength(v, 'utf8') : [...v].length);
for (const [store, lang, field, v, max, unit] of rows) {
  if (measure(v, unit) > max) errors.push(`${store} ${lang} ${field}: ${measure(v, unit)}/${max} ${unit} AŞIYOR`);
}

if (process.argv.includes('--md')) {
  console.log('| Mağaza | Dil | Alan | Sınır | Karakter | UTF-8 bayt | Durum |');
  console.log('|---|---|---|---|---|---|---|');
  for (const [store, lang, field, v, max, unit] of rows) {
    const ok = measure(v, unit) <= max ? 'OK' : 'AŞIYOR';
    console.log(`| ${store} | ${lang} | ${field} | ${max} ${unit} | ${[...v].length} | ${Buffer.byteLength(v, 'utf8')} | ${ok} |`);
  }
} else {
  for (const [store, lang, field, v, max, unit] of rows) {
    const n = measure(v, unit);
    const shown = v.length > 70 ? v.slice(0, 67).replace(/\n/g, ' ') + '…' : v;
    console.log(`${store} ${lang} ${field}: ${n}/${max} ${unit} ${n <= max ? 'OK' : 'AŞIYOR'} | ${shown}`);
  }
}
if (errors.length) {
  console.log('\nHATALAR:\n' + errors.map((e) => '  - ' + e).join('\n'));
  process.exitCode = 1;
} else if (!process.argv.includes('--md')) {
  console.log('\nTutarlılık: CWS ad/özet = _locales (tr, en); "$" yok; Apple metinlerinde "Chrome" yok; anahtar kelimeler kurala uygun.');
}
