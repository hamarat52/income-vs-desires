/**
 * Testler için `chrome.i18n.getMessage` sahtesi.
 *
 * Gerçek `_locales/<dil>/messages.json` dosyalarını okur ve Chrome'un
 * kuralını uygular: adlandırılmış yer tutucu ($ARG1$ → placeholders.arg1.content
 * → "$1" → 1. değer), "$$" → "$". Yer tutucuya giden değer yeniden işlenmez.
 *
 *   Node:      require('./i18n-stub').install('en')
 *   Tarayıcı:  <script src="i18n-stub.js"></script>  → ?lang=en|tr (varsayılan tr)
 *              Dosyaları eşzamanlı XHR ile ../_locales'tan okur; sayfa http
 *              üzerinden açılmalı (python3 -m http.server).
 *   Gömülü:    IVDi18nStub.installFromMessages(messages) (önizleme derleyicileri)
 */
(function (root) {
  'use strict';

  function makeGetMessage(messages) {
    return function getMessage(key, substitutions) {
      const entry = messages[key];
      if (!entry) return '';
      const list =
        substitutions === undefined || substitutions === null
          ? []
          : [].concat(substitutions).map(String);
      const placeholders = {};
      for (const [name, value] of Object.entries(entry.placeholders || {})) {
        placeholders[name.toLowerCase()] = value.content;
      }
      const numbered = (text) => text.replace(/\$(\d)/g, (_m, d) => list[d - 1] ?? '');
      return entry.message.replace(/\$\$|\$([A-Za-z0-9_@]+)\$|\$(\d)/g, (match, name, digit) => {
        if (match === '$$') return '$';
        if (name) {
          const content = placeholders[name.toLowerCase()];
          return content === undefined ? match : numbered(content);
        }
        return list[digit - 1] ?? '';
      });
    };
  }

  function installFromMessages(messages, lang) {
    const getMessage = makeGetMessage(messages);
    root.chrome = root.chrome || {};
    root.chrome.i18n = {
      getMessage,
      getUILanguage: () => lang || getMessage('locale') || 'en',
    };
    return getMessage;
  }

  const api = { makeGetMessage, installFromMessages };

  if (typeof module !== 'undefined' && module.exports) {
    const fs = require('fs');
    const path = require('path');
    api.load = (lang) =>
      JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', '_locales', lang, 'messages.json'), 'utf8')
      );
    api.install = (lang) => installFromMessages(api.load(lang), lang);
    module.exports = api;
  } else {
    root.IVDi18nStub = api;
    // Sayfa ?lang= ile açıldıysa (demo.html) dosyayı hemen yükle.
    if (root.location && !root.__ivdNoAutoI18n) {
      const lang = new URLSearchParams(root.location.search).get('lang') === 'en' ? 'en' : 'tr';
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', new URL(`../_locales/${lang}/messages.json`, root.location.href), false);
        xhr.send();
        installFromMessages(JSON.parse(xhr.responseText), lang);
      } catch (error) {
        console.error('[i18n-stub] messages.json okunamadı — sayfayı http üzerinden aç', error);
      }
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : self);
