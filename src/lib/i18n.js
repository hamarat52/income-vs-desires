/**
 * IncomeVsDesires: arayüz dili.
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
   * Yer tutucu nöbetçisi: Özel Kullanım Alanı karakterleri arasında sıra no.
   * `$` içermez, hiçbir messages.json metninde geçmez.
   */
  const SENTINEL_OPEN = '\uE000';
  const SENTINEL_CLOSE = '\uE001';
  const SENTINEL = /\uE000(\d+)\uE001/g;

  /**
   * Çeviri. Eksik anahtar ekranda anahtarın kendisi olarak görünür;
   * sessizce boş kalırsa fark edilmiyordu.
   *
   * Değerler getMessage'a doğrudan VERİLMEZ. Safari (iOS/macOS 27) yer
   * tutucuları sırayla değiştiriyor ve yerleştirdiği değeri de yeniden
   * tarıyor: "$28.41" yazıldıktan sonra içindeki "$2" ikinci değerle
   * değişiyor → "$227.278.41" (28.10.2026, iPhone EN popup). Chrome
   * değeri yeniden işlemiyor. Bu yüzden getMessage'a `$`'sız nöbetçiler
   * gidiyor, gerçek değerler dönüşte burada, tek geçişte yerleşiyor.
   */
  function t(key, substitutions) {
    if (substitutions === undefined || substitutions === null) return raw(key) || key;
    const values = [].concat(substitutions).map(String);
    const marks = values.map((_v, i) => SENTINEL_OPEN + i + SENTINEL_CLOSE);
    const text = raw(key, marks);
    if (!text) return key;
    // Fonksiyonla değiştir: dize verilirse String.replace değerdeki "$&", "$1"
    // gibi kalıpları yorumlar; kaçtığımız hatanın aynısı.
    return text.replace(SENTINEL, (match, i) => {
      const n = Number(i);
      return n < values.length ? values[n] : match;
    });
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
