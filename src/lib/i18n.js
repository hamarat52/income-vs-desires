/**
 * IncomeVsDesires — arayüz dili.
 *
 * Metinlerin tek kaynağı `_locales/<dil>/messages.json`; burada yalnızca
 * `chrome.i18n.getMessage` sarılıyor. Dil tarayıcının arayüz dilinden gelir:
 * Türkçe tarayıcıda `tr`, geri kalan her dilde `en` (manifest
 * `default_locale`).
 *
 * Fiyat AYRIŞTIRMA bu dile bağlı değildir: sayfadaki "1.299,90 TL" ile
 * "$1,299.90" her iki arayüz dilinde de aynı okunur (bkz. money.js
 * parseAmount). Burada değişen yalnızca bizim yazdığımız metin ve sayıların
 * ondalık ayracı.
 *
 * Klasik script: content script, popup ve options aynı dosyayı paylaşır.
 */
(function (root) {
  'use strict';

  function raw(key, substitutions) {
    try {
      const api = root.chrome && root.chrome.i18n;
      if (!api || typeof api.getMessage !== 'function') return '';
      return api.getMessage(key, substitutions) || '';
    } catch {
      return '';
    }
  }

  /**
   * Çeviri. Eksik anahtar ekranda anahtarın kendisi olarak görünür —
   * sessizce boş kalırsa fark edilmiyordu.
   */
  function t(key, substitutions) {
    const subs =
      substitutions === undefined || substitutions === null
        ? undefined
        : [].concat(substitutions).map(String);
    return raw(key, subs) || key;
  }

  /** Seçilen messages.json'un dili: 'tr' ya da 'en'. */
  function lang() {
    return raw('locale') || 'en';
  }

  /** Sayı ve para biçimi için BCP 47 etiketi: 'tr-TR' ya da 'en-US'. */
  function numberLocale() {
    return raw('numberLocale') || 'en-US';
  }

  /**
   * Sayfadaki `data-i18n*` işaretli öğeleri doldurur.
   *
   *   data-i18n="key"              textContent
   *   data-i18n-placeholder="key"  placeholder
   *   data-i18n-title="key"        title
   *   data-i18n-aria-label="key"   aria-label
   *
   * HTML'de metin bırakılmıyor; tek kaynak messages.json.
   */
  function localizePage(doc) {
    const d = doc || root.document;
    if (!d) return;
    d.documentElement.lang = lang();
    const attrs = [
      ['i18n', null],
      ['i18nPlaceholder', 'placeholder'],
      ['i18nTitle', 'title'],
      ['i18nAriaLabel', 'aria-label'],
    ];
    for (const [dataKey, attr] of attrs) {
      const selector = `[data-${dataKey.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}]`;
      d.querySelectorAll(selector).forEach((el) => {
        const text = t(el.dataset[dataKey]);
        if (attr) el.setAttribute(attr, text);
        else el.textContent = text;
      });
    }
  }

  root.IVDi18n = { t, lang, numberLocale, localizePage };
})(typeof globalThis !== 'undefined' ? globalThis : self);
