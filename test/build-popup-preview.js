/**
 * Ayar panelini eklenti yüklemeden tarayıcıda açabilmek için, gerçek
 * popup.html/css/js dosyalarını sahte bir `chrome.*` ile tek dosyaya gömer.
 *
 *   node test/build-popup-preview.js   →   test/popup-preview.html
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');
const read = (p) => fs.readFileSync(path.join(SRC, p), 'utf8');

const shim = `
const saved = {};
window.chrome = {
  storage: { sync: {
    get: (defaults) => Promise.resolve({ ...defaults, ...saved }),
    set: (patch) => { Object.assign(saved, patch); return Promise.resolve(); },
  } },
  tabs: {
    query: () => Promise.resolve([{ id: 1, url: 'https://trendyol.com/x' }]),
    sendMessage: (_id, _msg, cb) => cb({ count: 156, active: true }),
  },
  runtime: {
    lastError: null,
    sendMessage: (_msg, cb) => cb({ fetchedAt: Date.now(), source: 'frankfurter' }),
  },
};
`;

// Değiştirilen metni fonksiyonla veriyoruz: kaynak kodda geçen `$'` gibi
// diziler String.replace'in özel değişkenleri olarak yorumlanmasın.
const inject = (html, marker, replacement) => html.replace(marker, () => replacement);

let html = read('popup.html');
html = inject(html, '<script src="theme.js"></script>', `<script>${read('theme.js')}</script>`);
html = inject(html, '<link rel="stylesheet" href="tokens.css" />', `<style>${read('tokens.css')}</style>`);
html = inject(html, '<link rel="stylesheet" href="popup.css" />', `<style>${read('popup.css')}</style>`);
html = inject(html, '<script src="lib/money.js"></script>', `<script>${shim}</script>\n<script>${read('lib/money.js')}</script>`);
html = inject(html, '<script src="popup.js"></script>', `<script>${read('popup.js')}</script>`);

fs.writeFileSync(path.join(__dirname, 'popup-preview.html'), html, 'utf8');

/*
 * Panel gerçekte 300px genişliğinde. Tam ekran tarayıcıda tek başına açılınca
 * ortada minik bir leke gibi duruyor ve hiçbir şey okunmuyor. Bu vitrin sayfası
 * paneli bir iframe içinde gösterip büyütüyor; panelin kendisi birebir kalıyor,
 * ölçek dışarıdan uygulanıyor.
 */
const stage = `<!DOCTYPE html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <title>Panel önizleme</title>
    <style>
      :root { color-scheme: light; }
      body {
        margin: 0;
        min-height: 100vh;
        background: #4a4a46;
        font: 13px ui-monospace, Menlo, Consolas, monospace;
        color: #f0ece1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 22px;
        padding: 26px 20px 60px;
      }
      .bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: center; }
      .bar span { opacity: 0.65; letter-spacing: 0.06em; }
      button {
        font: inherit;
        padding: 7px 14px;
        border: 1px solid #8b857a;
        background: transparent;
        color: inherit;
        cursor: pointer;
      }
      button[aria-pressed="true"] { background: #f0ece1; color: #17150f; border-color: #f0ece1; }
      /* Ölçek sarmalayıcının kendi kutusunu büyütmez; yer ayırmak için
         yükseklik JS ile veriliyor. */
      .stage { transform-origin: top center; }
      iframe {
        width: 300px;
        height: 545px;
        border: 0;
        display: block;
        box-shadow: 0 10px 40px rgb(0 0 0 / 0.45);
      }
    </style>
  </head>
  <body>
    <div class="bar">
      <span>gerçek genişlik 300px</span>
      <button type="button" data-zoom="1">1x</button>
      <button type="button" data-zoom="2" aria-pressed="true">2x</button>
      <button type="button" data-zoom="3">3x</button>
    </div>

    <div id="holder">
      <div class="stage" id="stage">
        <iframe src="popup-preview.html" title="IncomeVsDesires paneli"></iframe>
      </div>
    </div>

    <script>
      const stage = document.getElementById('stage');
      const holder = document.getElementById('holder');
      const buttons = [...document.querySelectorAll('[data-zoom]')];

      function setZoom(z) {
        stage.style.transform = 'scale(' + z + ')';
        // scale düzen akışını değiştirmediği için yeri elle ayırıyoruz.
        holder.style.height = 545 * z + 'px';
        holder.style.width = 300 * z + 'px';
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.zoom === z)));
      }

      buttons.forEach((b) => b.addEventListener('click', () => setZoom(+b.dataset.zoom)));
      setZoom(2);
    </script>
  </body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'popup-stage.html'), stage, 'utf8');

console.log('test/popup-preview.html (birebir panel) yazıldı');
console.log('test/popup-stage.html  (büyütülmüş vitrin) yazıldı  <- tarayıcıda bunu aç');
