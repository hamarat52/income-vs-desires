/**
 * IncomeVsDesires — ortak para/süre kütüphanesi.
 *
 * Klasik script olarak yüklenir (content script, popup ve service worker
 * aynı dosyayı paylaşabilsin diye). Her şeyi `globalThis.IVD` altına koyar.
 */
(function (root) {
  'use strict';

  /** Desteklenen para birimleri. `patterns` regex parçası olarak kullanılır. */
  const CURRENCIES = {
    TRY: { code: 'TRY', label: 'Türk Lirası', symbol: '₺', locale: 'tr-TR' },
    USD: { code: 'USD', label: 'Amerikan Doları', symbol: '$', locale: 'en-US' },
    EUR: { code: 'EUR', label: 'Euro', symbol: '€', locale: 'de-DE' },
    GBP: { code: 'GBP', label: 'İngiliz Sterlini', symbol: '£', locale: 'en-GB' },
  };

  /** Sayfada gördüğümüz işareti para birimi koduna çeviren tablo. */
  const TOKEN_TO_CODE = {
    '₺': 'TRY', TL: 'TRY', TRY: 'TRY', 'TL.': 'TRY',
    $: 'USD', USD: 'USD', US$: 'USD',
    '€': 'EUR', EUR: 'EUR',
    '£': 'GBP', GBP: 'GBP',
  };

  // Harf tabanlı kodlarda sınır şart, yoksa "OUTLET" içindeki "TL"yi fiyat
  // sanarız. Ama sınırı `\b` ile değil, **harf** ile tanımlıyoruz:
  //
  //   "811,41TL"              rakam ile T arasında \b yok, kaçırırdık
  //   "11.999,96 TL29.999,90" TL'den sonra rakam var, \b yine yok
  //
  // İkincisi gerçek sitelerde sık: indirimli fiyatla üstü çizili fiyat satır
  // içi yan yana duruyor. `\b` kullanınca ilk fiyat kaçıyor ve eşleşme ikinciye
  // kayıyordu; ekranda çıplak bir sayı kalıyordu. Rakam komşuluğu serbest,
  // harf komşuluğu yasak.
  const LETTER = 'A-Za-zÇĞİÖŞÜçğıöşüÂâÎîÛû';
  const CODE = '(?:TL|TRY|USD|EUR|GBP)';
  const SYMBOL_BEFORE = `(?:₺|€|£|US\\$|\\$|(?<![${LETTER}])${CODE})`;
  const SYMBOL_AFTER = `(?:₺|€|£|US\\$|\\$|${CODE}(?![${LETTER}]))`;

  // 1.299,90 · 1,299.90 · 1 299,90 (kırılmaz boşlukla) · 500 · 19.99
  //
  // Binlik ayracı olarak **normal boşluk kabul edilmiyor**: "Beden 42 500 TL"
  // gibi metinlerde "42 500" tek sayı sanılıp fiyat 84 katına çıkıyordu. Bilerek
  // konan tipografik ayraçlar (kırılmaz / dar boşluk) kalıyor.
  const NUMBER_SRC =
    '(?:\\d{1,3}(?:[.,\\u00A0\\u202F]\\d{3})+(?:[.,]\\d{1,2})?|\\d+(?:[.,]\\d{1,2})?)';

  /** Yeni bir eşleştirme regex'i üretir (lastIndex paylaşılmasın diye her seferinde yeni). */
  function createPriceRegex() {
    return new RegExp(
      `(?:(${SYMBOL_BEFORE})\\s{0,2}(${NUMBER_SRC}))|(?:(${NUMBER_SRC})\\s{0,2}(${SYMBOL_AFTER}))`,
      'gi'
    );
  }

  /** Regex eşleşmesinden { amount, currency, text } çıkarır; anlamsızsa null. */
  function readMatch(match) {
    const symbolToken = match[1] || match[4];
    const numberToken = match[2] || match[3];
    if (!symbolToken || !numberToken) return null;

    const currency = TOKEN_TO_CODE[symbolToken.toUpperCase().replace(/\.$/, '')];
    if (!currency) return null;

    const amount = parseAmount(numberToken);
    if (amount === null || amount <= 0 || amount > 1e9) return null;

    return { amount, currency, text: match[0] };
  }

  /**
   * "1.299,90" / "1,299.90" / "1 299" gibi yazımları sayıya çevirir.
   * Kural: iki ayraç da varsa sondaki ondalıktır. Tek ayraç varsa ve
   * ardından tam 3 hane geliyorsa binlik ayracıdır.
   */
  function parseAmount(raw) {
    const cleaned = raw.replace(/[   ]/g, '');
    const lastDot = cleaned.lastIndexOf('.');
    const lastComma = cleaned.lastIndexOf(',');

    let normalized;
    if (lastDot === -1 && lastComma === -1) {
      normalized = cleaned;
    } else if (lastDot !== -1 && lastComma !== -1) {
      const decimalSep = lastDot > lastComma ? '.' : ',';
      normalized = stripGrouping(cleaned, decimalSep);
    } else {
      const sep = lastDot !== -1 ? '.' : ',';
      const tail = cleaned.slice(cleaned.lastIndexOf(sep) + 1);
      const occurrences = cleaned.split(sep).length - 1;
      // "1.500" veya "1.234.567" → binlik. "19,99" → ondalık.
      normalized =
        tail.length === 3 && (occurrences > 1 || cleaned.split(sep)[0].length <= 3)
          ? cleaned.split(sep).join('')
          : stripGrouping(cleaned, sep);
    }

    const value = Number(normalized);
    return Number.isFinite(value) ? value : null;
  }

  function stripGrouping(text, decimalSep) {
    const idx = text.lastIndexOf(decimalSep);
    const intPart = text.slice(0, idx).replace(/[.,]/g, '');
    const fracPart = text.slice(idx + 1);
    return `${intPart}.${fracPart}`;
  }

  // --- Kur çevrimi -----------------------------------------------------------

  /**
   * API ulaşılamazsa kullanılan kaba kurlar (EUR bazlı). Yaklaşıktır ve
   * bayatlar; panelde "yaklaşık değerler kullanılıyor" uyarısı bu yüzden var.
   *
   * 31.07.2026'da ECB verisiyle güncellendi. Önceki değerler (TRY 45) enflasyon
   * yüzünden %20 sapmıştı, yani API'ye ulaşılamadığında dövizli fiyatlar
   * olduğundan ucuz görünüyordu. Sürüm çıkarken bir kez daha tazelenmeli.
   */
  const FALLBACK_RATES = { EUR: 1, USD: 1.15, GBP: 0.86, TRY: 54.6 };

  /** `amount` birimini `from`dan `to`ya çevirir. rates EUR bazlı olmalı. */
  function convert(amount, from, to, rates) {
    if (from === to) return amount;
    const table = rates && rates.EUR ? rates : FALLBACK_RATES;
    const fromRate = table[from];
    const toRate = table[to];
    if (!fromRate || !toRate) return null;
    return (amount / fromRate) * toRate;
  }

  // --- Süre ------------------------------------------------------------------

  /**
   * "1 gün" = bir günlük mesai, "1 ay" = bir aylık mesai.
   * Yani sınırlar kullanıcının kendi çalışma düzeninden gelir.
   */
  function shiftLengths(settings) {
    const perDay = Number(settings && settings.hoursPerDay);
    const daysPerMonth = Number(settings && settings.daysPerMonth);
    if (!perDay || !daysPerMonth || perDay <= 0 || daysPerMonth <= 0) return null;
    const hoursPerMonth = perDay * daysPerMonth;
    // Yıl = 12 aylık mesai. Herkesin 12 ay çalıştığı varsayılıyor; izin ve
    // tatil ayrı ayrı sorulmuyor, o kadar hassasiyet bu iş için gereksiz.
    return { hoursPerDay: perDay, hoursPerMonth, hoursPerYear: hoursPerMonth * 12 };
  }

  /**
   * Çalışma saatini en anlamlı birimde metne çevirir.
   * dk → saat → gün (bir mesai) → ay (bir aylık mesai) → yıl (12 aylık mesai)
   *
   * Yıl olmadan pahalı şeyler okunmaz oluyordu: bir araba "133 ay" diye
   * yazınca kimse kafasında bölmüyor, "11,1 yıl" ise anında oturuyor.
   */
  function formatDuration(hours, settings) {
    if (!Number.isFinite(hours) || hours < 0) return null;
    const shift = shiftLengths(settings);
    if (!shift) return null;

    if (hours === 0) return 'yok';
    if (hours * 60 < 1) return '<1 dk';
    if (hours < 1) return `${Math.round(hours * 60)} dk`;
    if (hours < shift.hoursPerDay) return `${round(hours)} saat`;
    if (hours < shift.hoursPerMonth) return `${round(hours / shift.hoursPerDay)} gün`;
    if (hours < shift.hoursPerYear) return `${round(hours / shift.hoursPerMonth)} ay`;
    return `${round(hours / shift.hoursPerYear)} yıl`;
  }

  /** 10'un altında bir ondalık, üstünde tam sayı. Türkçe virgül. */
  function round(value) {
    const rounded = value < 10 ? Math.round(value * 10) / 10 : Math.round(value);
    return rounded.toLocaleString('tr-TR', { maximumFractionDigits: 1 });
  }

  /**
   * Maaş alanını yazarken okunur tutar: "1000" → "1.000".
   *
   * `type="number"` ile yapılamıyor (tarayıcı ayraçlı değeri geçersiz sayar),
   * o yüzden alanlar `type="text" inputmode="numeric"`. İmleç, solundaki
   * rakam sayısı korunarak geri konuyor; yoksa her tuşta sona sıçrıyor.
   */
  function attachThousandSeparator(input, onChange) {
    const digitsBefore = (text, caret) => (text.slice(0, caret).match(/\d/g) || []).length;

    const format = (raw) => {
      const digits = String(raw).replace(/\D/g, '').replace(/^0+(?=\d)/, '');
      if (!digits) return '';
      return Number(digits).toLocaleString('tr-TR');
    };

    const apply = () => {
      const caret = input.selectionStart ?? input.value.length;
      const target = digitsBefore(input.value, caret);

      input.value = format(input.value);

      // Aynı sayıda rakamın sağına dön.
      let seen = 0;
      let position = input.value.length;
      for (let i = 0; i < input.value.length; i++) {
        if (/\d/.test(input.value[i])) seen++;
        if (seen === target) {
          position = i + 1;
          break;
        }
      }
      if (target === 0) position = 0;
      input.setSelectionRange(position, position);
    };

    input.addEventListener('input', () => {
      apply();
      onChange(parseAmount(input.value));
    });

    // Dışarıdan gelen ilk değeri de biçimle.
    input.value = format(input.value);
  }

  /** Saatlik kazanç: aylık maaş / (günlük saat × aylık gün). */
  function hourlyRate(settings) {
    const salary = Number(settings && settings.salary);
    const shift = shiftLengths(settings);
    if (!salary || salary <= 0 || !shift) return null;
    return salary / shift.hoursPerMonth;
  }

  function formatMoney(amount, currency) {
    const meta = CURRENCIES[currency];
    if (!meta) return String(amount);
    return amount.toLocaleString('tr-TR', {
      style: 'currency',
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    });
  }

  const DEFAULT_SETTINGS = {
    enabled: true,
    salary: null,
    currency: 'TRY',
    hoursPerDay: 8,
    daysPerMonth: 22,
    disabledHosts: [],
    // Sistem karanlık olsa bile aydınlık açılır; karanlık bilinçli bir tercih.
    theme: 'light',
  };

  root.IVD = {
    CURRENCIES,
    DEFAULT_SETTINGS,
    FALLBACK_RATES,
    shiftLengths,
    attachThousandSeparator,
    createPriceRegex,
    readMatch,
    parseAmount,
    convert,
    formatDuration,
    formatMoney,
    hourlyRate,
  };
})(typeof globalThis !== 'undefined' ? globalThis : self);
