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

// --- Safari: yerleştirilen değer yeniden işleniyor (bulgu A, 28.10.2026) ---
// iOS Safari EN popup'ı "One hour of your work ≈ $227.278.41 · one workday ≈
// $227.27" gösterdi. Gözleme uyan model: adlandırılmış yer tutucu içeriğine
// ("$1") çevrilir, sonra $1, $2, … SIRAYLA ve önceki değerin içi de dahil
// değiştirilir; "$$" en sonda "$" olur. IVDi18n.t() değerleri getMessage'a
// `$`'sız nöbetçiyle verip kendisi yerleştirdiği için iki davranışta da
// aynı (Chrome'daki) sonucu vermeli.
console.log('\n--- Safari yer tutucu davranışı (t()) ---');
function makeSafariGetMessage(msgs) {
  return function getMessage(key, substitutions) {
    const entry = msgs[key];
    if (!entry) return '';
    const list = substitutions == null ? [] : [].concat(substitutions).map(String);
    let text = entry.message.replace(/\$([A-Za-z0-9_@]+)\$/g, (match, name) => {
      const ph = Object.entries(entry.placeholders || {}).find(([n]) => n.toLowerCase() === name.toLowerCase());
      return ph ? ph[1].content : match;
    });
    list.forEach((value, i) => { text = text.split(`$${i + 1}`).join(value); });
    return text.split('$$').join('$');
  };
}
const setGetMessage = (getMessage) => { globalThis.chrome = { i18n: { getMessage } }; };
require('../src/lib/i18n.js');
const { t } = globalThis.IVDi18n;

// Sahte Safari gözlenen hatayı üretiyor mu (doğrudan değerle, eski yol)?
check('sahte Safari hatayı üretiyor (eski yol)',
  makeSafariGetMessage(messages.en)('rateSalary', ['$28.41', '$227.27']),
  'One hour of your work ≈ $227.278.41 · one workday ≈ $227.27');

const VALUE_SETS = [
  ['$28.41', '$227.27', '$350.00'],          // $2 ve $3 içeriyor
  ['$1,299.90', '$10,399.20', '$3'],          // $1, $3
  ['₺284,09', '₺2.272,73', '176 saat'],       // TRY
  ['$&', "$'", '$$'],                          // String.replace kalıpları
];
const multi = [];
for (const lang of LANGS) {
  const chromeGet = stub.makeGetMessage(messages[lang]);
  const safariGet = makeSafariGetMessage(messages[lang]);
  let checked = 0;
  const bad = [];
  for (const [key, entry] of Object.entries(messages[lang])) {
    const n = Object.keys(entry.placeholders || {}).length;
    if (!n) continue;
    if (n >= 2 && lang === 'en') multi.push(key);
    for (const set of VALUE_SETS) {
      const values = set.slice(0, n);
      const expected = chromeGet(key, values); // Chrome: değer yeniden işlenmez
      for (const [name, get] of [['chrome', chromeGet], ['safari', safariGet]]) {
        setGetMessage(get);
        const got = t(key, values);
        checked++;
        if (got !== expected) bad.push(`${name} ${key} ${JSON.stringify(values)} → ${got}`);
      }
    }
  }
  check(`${lang}: yer tutuculu tüm mesajlar, Chrome + Safari (${checked} durum)`, bad, []);
}
console.log(`     iki+ yer tutuculu: ${multi.join(', ')}`);

setGetMessage(makeSafariGetMessage(messages.en));
check('Safari EN rateSalary', t('rateSalary', ['$28.41', '$227.27']),
  'One hour of your work ≈ $28.41 · one workday ≈ $227.27');
check('Safari EN rateLeftover', t('rateLeftover', ['$1,299.90', '$10,399.20']),
  'After expenses, one hour of your work ≈ $1,299.90 · one workday ≈ $10,399.20');
check('Safari EN rateLine', t('rateLine', ['<strong>$28.41</strong>', '<strong>$350.00</strong>', '<strong>176 hours</strong>']),
  'One hour of your work: <strong>$28.41</strong> · one workday: <strong>$350.00</strong> · you work <strong>176 hours</strong> a month');
check('Safari EN tek değer $1,299.90', t('chipTitleToPrice', '$1,299.90'), '$1,299.90 · click to show the price');
check('Safari EN $$ → $ (değersiz)', t('showBothLabel'), 'Show the price too: 1.8 hours ($50)');
check('Safari EN eksik anahtar', t('yokBoyleAnahtar', ['$1']), 'yokBoyleAnahtar');
setGetMessage(makeSafariGetMessage(messages.tr));
check('Safari TR rateSalary', t('rateSalary', ['₺284,09', '₺2.272,73']), 'Bir saatin ≈ ₺284,09 · bir mesai ≈ ₺2.272,73');
check('Safari TR rateSalary USD', t('rateSalary', ['$28.41', '$227.27']), 'Bir saatin ≈ $28.41 · bir mesai ≈ $227.27');

console.log(fail === 0 ? '\nHepsi geçti.' : `\n${fail} test başarısız.`);
process.exit(fail ? 1 : 0);
