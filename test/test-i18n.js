/**
 * _locales denetimi: iki dil aynı anahtarları ve yer tutucuları taşıyor mu,
 * koddaki her anahtar var mı, mağaza özeti 132 karakteri aşıyor mu.
 *
 *   node test/test-i18n.js
 */
const fs = require('fs');
const path = require('path');
const stub = require('./i18n-stub.js');

const ROOT = path.join(__dirname, '..');
const LANGS = ['tr', 'en'];
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

let fail = 0;
const check = (label, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) fail++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label} → ${JSON.stringify(actual)}${ok ? '' : `  (beklenen: ${JSON.stringify(expected)})`}`);
};

const messages = Object.fromEntries(LANGS.map((l) => [l, stub.load(l)]));
const manifest = JSON.parse(read('manifest.json'));

console.log('--- manifest ---');
check('default_locale', manifest.default_locale, 'en');
check('name', manifest.name, '__MSG_extName__');
check('description', manifest.description, '__MSG_extDescription__');
check('action.default_title', manifest.action.default_title, '__MSG_actionTitle__');
check('content script önce i18n.js', manifest.content_scripts[0].js[0], 'src/lib/i18n.js');

console.log('\n--- iki dil aynı anahtarlar ---');
const keys = Object.fromEntries(LANGS.map((l) => [l, Object.keys(messages[l]).sort()]));
check('tr = en anahtar listesi', keys.tr, keys.en);
const placeholders = (entry) => Object.keys(entry.placeholders || {}).sort();
const phDiff = keys.en.filter(
  (k) => messages.tr[k] && JSON.stringify(placeholders(messages.tr[k])) !== JSON.stringify(placeholders(messages.en[k]))
);
check('yer tutucular aynı', phDiff, []);
// Chrome kuralı: anahtar adları yalnız [a-zA-Z0-9_@]
check('anahtar adları geçerli', keys.en.filter((k) => !/^[A-Za-z0-9_@]+$/.test(k)), []);

console.log('\n--- koddaki her anahtar tanımlı ---');
const sources = [
  'src/popup.html', 'src/options.html', 'src/popup.js', 'src/options.js',
  'src/content.js', 'src/lib/money.js',
];
const used = new Set();
for (const file of sources) {
  const text = read(file);
  for (const m of text.matchAll(/data-i18n(?:-[a-z-]+)?="([A-Za-z0-9_@]+)"/g)) used.add(m[1]);
  for (const m of text.matchAll(/\bt\('([A-Za-z0-9_@]+)'/g)) used.add(m[1]);
  for (const m of text.matchAll(/IVDi18n\.t\('([A-Za-z0-9_@]+)'/g)) used.add(m[1]);
  for (const m of text.matchAll(/msg\('([A-Za-z0-9_@]+)'/g)) used.add(m[1]);
  // Koşullu seçim: t(x ? 'a' : 'b'), noteKey: 'x', dur${name}${One|Many}
  for (const m of text.matchAll(/'([a-z][A-Za-z0-9]+)'/g)) {
    if (messages.en[m[1]]) used.add(m[1]);
  }
}
for (const unit of ['Hours', 'Days', 'Months', 'Years']) {
  used.add(`dur${unit}One`);
  used.add(`dur${unit}Many`);
}
// options.js counted(key): tekil biçim `${key}One`
for (const key of [...used]) if (messages.en[`${key}One`]) used.add(`${key}One`);
for (const m of read('manifest.json').matchAll(/__MSG_([A-Za-z0-9_@]+)__/g)) used.add(m[1]);
const missing = [...used].filter((k) => !messages.en[k]);
check('tanımsız anahtar yok', missing, []);
const unused = keys.en.filter((k) => !used.has(k) && !['locale', 'numberLocale'].includes(k));
check('kullanılmayan anahtar yok', unused, []);

console.log('\n--- mağaza özeti (manifest description) ---');
for (const lang of LANGS) {
  const get = stub.makeGetMessage(messages[lang]);
  const desc = get('extDescription');
  check(`${lang} özet ≤132 (${[...desc].length})`, [...desc].length <= 132, true);
  check(`${lang} ad ≤75`, [...get('extName')].length <= 75, true);
  // Manifest __MSG_…__ yerelleştirmesi "$$" kaçışını çözmüyor (Chrome 156'da
  // chrome://extensions "$$50" gösterdi); manifest metinlerinde "$" olmamalı.
  for (const key of ['extName', 'extDescription', 'actionTitle']) {
    check(`${lang} ${key} içinde $ yok`, messages[lang][key].message.includes('$'), false);
  }
  console.log(`     ${lang}: ${desc}`);
}

console.log('\n--- getMessage kuralları ---');
const en = stub.makeGetMessage(messages.en);
check('$$ → $', en('showBothLabel'), 'Show the price too: 1.8 hours ($50)');
check('yer tutucu', en('chipTitleToPrice', '$1,299.90'), '$1,299.90 · click to show the price');
check('iki yer tutucu', en('reportSchedule', ['8', '22']), 'Work schedule: 8 h/day × 22 days/month');

console.log(fail === 0 ? '\nHepsi geçti.' : `\n${fail} test başarısız.`);
process.exit(fail ? 1 : 0);
