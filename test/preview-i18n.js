/**
 * Önizleme derleyicileri için: sahte `chrome.i18n`'i ve iki dilin
 * messages.json'unu sayfaya gömer. Dil `?lang=en` ile seçilir (varsayılan tr).
 */
const fs = require('fs');
const path = require('path');
const stub = require('./i18n-stub.js');

function i18nShim() {
  const messages = JSON.stringify({ tr: stub.load('tr'), en: stub.load('en') }).replace(/<\//g, '<\\/');
  return [
    'window.__ivdNoAutoI18n = true;',
    // i18n-stub.js yorumunda `<script …></script>` geçiyor; satır içi
    // <script> bloğunu erken kapatıp önizlemede bütün metinleri anahtar
    // adına düşürüyordu. `</` → `<\/` JS için aynı, HTML için zararsız.
    fs.readFileSync(path.join(__dirname, 'i18n-stub.js'), 'utf8').replace(/<\//g, '<\\/'),
    "const __ivdLang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'tr';",
    `IVDi18nStub.installFromMessages(${messages}[__ivdLang], __ivdLang);`,
  ].join('\n');
}

module.exports = { i18nShim };
