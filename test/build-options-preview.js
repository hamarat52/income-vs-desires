/**
 * Tam sayfa paneli eklenti yüklemeden açabilmek için gerçek
 * options.html/css/js dosyalarını sahte `chrome.*` ile tek dosyaya gömer.
 *
 *   node test/build-options-preview.js   →   test/options-preview.html
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');
const read = (p) => fs.readFileSync(path.join(SRC, p), 'utf8');

const shim = `
// options.js bir async IIFE — içindeki hata sessiz bir promise reddi oluyor.
window.__ivdErrors = [];
addEventListener('error', (e) => window.__ivdErrors.push(e.message + ' @' + e.lineno));
addEventListener('unhandledrejection', (e) =>
  window.__ivdErrors.push('reject: ' + (e.reason && e.reason.stack || e.reason)));

const store = {
  salary: 50000, currency: 'TRY', hoursPerDay: 8, daysPerMonth: 22,
  expenses: [
    { id: 'a', name: 'Kira', amount: 18000, period: 'monthly', category: 'kira' },
    { id: 'b', name: 'Aidat', amount: 2500, period: 'monthly', category: 'kira' },
    // Para birimi olmayanlar eski kayıtları temsil ediyor (maaşın biriminde sayılır).
    { id: 'c', name: 'Netflix', amount: 230, period: 'monthly', category: 'abonelik' },
    { id: 'd', name: 'Spotify', amount: 190, period: 'monthly', category: 'abonelik', currency: 'TRY' },
    { id: 'e', name: 'ChatGPT', amount: 20, period: 'monthly', category: 'abonelik', currency: 'USD' },
    { id: 'f', name: 'Alan adı', amount: 12, period: 'yearly', category: 'abonelik', currency: 'EUR' },
    { id: 'g', name: 'Ulaşım', amount: 3000, period: 'monthly', category: 'diger' },
    { id: 'h', name: 'Telefon taksiti', amount: 4200, period: 'monthly', category: 'taksit' },
  ],
};
window.chrome = {
  runtime: { getManifest: () => ({ version: '0.1.0' }) },
  storage: {
    sync: {
      get: (defaults) => Promise.resolve({ ...defaults, ...store }),
      set: (patch) => { Object.assign(store, patch); return Promise.resolve(); },
    },
    local: {
      get: () => Promise.resolve({ rates: { rates: { EUR: 1, USD: 1.12, GBP: 0.84, TRY: 55.7 } } }),
    },
    // Testler panelden gelen değişikliği window.__onChanged(changes, 'sync') ile taklit eder.
    onChanged: { addListener: (fn) => { window.__onChanged = fn; } },
  },
};
// Testler sayfa yüklenmeden önce window.__preset ile ayar verebilir.
Object.assign(store, window.__preset);
window.__store = store;
`;

// Kaynak kodda geçen `$'` gibi diziler String.replace'in özel değişkenleri
// olarak yorumlanmasın diye değiştirmeyi fonksiyonla veriyoruz.
const inject = (html, marker, replacement) => html.replace(marker, () => replacement);

let html = read('options.html');
html = inject(html, '<script src="theme.js"></script>', `<script>${read('theme.js')}</script>`);
html = inject(html, '<link rel="stylesheet" href="tokens.css" />', `<style>${read('tokens.css')}</style>`);
html = inject(html, '<link rel="stylesheet" href="options.css" />', `<style>${read('options.css')}</style>`);
html = inject(html, '<script src="lib/money.js"></script>', `<script>${shim}</script>\n<script>${read('lib/money.js')}</script>`);
html = inject(html, '<script src="options.js"></script>', `<script>${read('options.js')}</script>`);

fs.writeFileSync(path.join(__dirname, 'options-preview.html'), html, 'utf8');
console.log('test/options-preview.html yazıldı');
