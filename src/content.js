/**
 * Sayfadaki fiyatları çalışma süresine çevirir.
 * Fiyat metni bir <span data-ivd> ile değiştirilir; tıklayınca orijinaline döner.
 *
 * Tarama birimi tek bir metin düğümü değil, **fiyatı bütün olarak içeren en
 * küçük element**. Gerçek sitelerde bir fiyat üç ayrı şekilde parçalanabiliyor:
 *
 *   Trendyol   <div>350<!-- --> <!-- -->TL</div>     (React yorum işaretçileri)
 *   Hepsiburada<div>2.144<span>,35 TL</span></div>   (kuruş ayrı elementte)
 *   diğerleri  <span>1.299</span><sup>,90</sup> TL   (satır içi süsleme)
 *
 * Bu yüzden elementin tüm alt ağacındaki metinler tek dizeye düzleştirilip
 * eşleştirilir, sonra eşleşme yaprak metin düğümlerine geri haritalanır.
 * Blok düzeyindeki sınırlara ayraç konur ki ayrı satırlar birbirine yapışmasın.
 */
(function () {
  'use strict';

  const SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION',
    'CODE', 'PRE', 'KBD', 'SAMP', 'SVG', 'CANVAS', 'IFRAME', 'TITLE', 'HEAD',
  ]);

  /** Satır içi elemanlar metni bölmez; bunun dışındaki her şey blok sayılır. */
  const INLINE_TAGS = new Set([
    'A', 'ABBR', 'B', 'BDI', 'BDO', 'CITE', 'DATA', 'DEL', 'DFN', 'EM', 'FONT',
    'I', 'INS', 'MARK', 'Q', 'S', 'SMALL', 'SPAN', 'STRONG', 'SUB', 'SUP',
    'TIME', 'U', 'VAR', 'WBR',
  ]);

  /** Blok sınırı işareti — hiçbir desene uymaz, eşleşmeler bunu aşamaz. */
  const BREAK = '\u0000';

  /** Bir elementin "fiyat kutusu" sayılması için üst sınır. */
  const MAX_TEXT_LENGTH = 200;

  /**
   * Ekran okuyucuya özel, görsel olarak gizli metin. Amazon fiyatı iki kez
   * yazıyor: `<span class="a-offscreen">499,99 TL</span>` (gizli) + görünür
   * parçalar. İkisini birleştirirsek eşleşme yanlış aralığa denk geliyor ve
   * fiyat ekrandan siliniyor. Yaygın sınıf adlarını doğrudan eliyoruz.
   */
  const SR_ONLY =
    '.a-offscreen, .sr-only, .srOnly, .visually-hidden, .visuallyhidden, ' +
    '.screen-reader-text, .screenReaderText, .assistive-text, .u-hiddenVisually';

  /** Eşleşme bulunduğunda, dokunmadan önce yapılan pahalı kontrol. */
  const UNSAFE_ANCESTORS =
    '[data-ivd], pre, code, textarea, [contenteditable=""], [contenteditable="true"]';

  /** Sayfaya eklediğimiz her chip — geri almak için tutuyoruz. */
  const chips = [];

  /** Görünürlük sonuçları, tek bir tarama geçişi boyunca geçerli. */
  let visibility = new WeakMap();

  let settings = null;
  let rates = null;
  let observer = null;
  let scanTimer = null;
  let urlTimer = null;

  /** Gözlemciden gelip henüz taranmamış kökler. */
  const pending = [];

  init();

  async function init() {
    const stored = await chrome.storage.sync.get(IVD.DEFAULT_SETTINGS);
    settings = { ...IVD.DEFAULT_SETTINGS, ...stored };

    const local = await chrome.storage.local.get('rates');
    rates = (local.rates && local.rates.rates) || IVD.FALLBACK_RATES;

    chrome.storage.onChanged.addListener(onStorageChanged);
    chrome.runtime.onMessage.addListener(onMessage);
    document.addEventListener('click', onChipClick, true);

    apply();
  }

  function onStorageChanged(changes, area) {
    if (area === 'local' && changes.rates) {
      rates = changes.rates.newValue?.rates || rates;
      restart();
      return;
    }
    if (area !== 'sync') return;
    for (const [key, change] of Object.entries(changes)) {
      settings[key] = change.newValue;
    }
    restart();
  }

  /** Panelden gelen "yeniden tara" isteği: geç yüklenen içerik kaçtıysa kurtarır. */
  function onMessage(message, _sender, sendResponse) {
    if (message?.type !== 'ivd:rescan') return false;
    restart();
    sendResponse({ count: chips.length, active: isActive() });
    return false;
  }

  function restart() {
    revertAll();
    stopObserving();
    apply();
  }

  function isActive() {
    if (!settings.enabled) return false;
    if (!IVD.hourlyRate(settings)) return false;
    if ((settings.disabledHosts || []).includes(location.hostname)) return false;
    return true;
  }

  function apply() {
    if (!isActive()) return;
    scan(document.body);
    startObserving();
  }

  // --- Tarama ----------------------------------------------------------------

  /**
   * Belge sırasında yukarıdan aşağı iner. Metni sınırın altına düşen ilk
   * element "fiyat kutusu" kabul edilir: orada eşleştirir ve tüm alt ağacını
   * işaretleyip atlar. Böylece `,35 TL` gibi bir parça, bağlamından koparılmış
   * olarak ikinci kez ele alınmaz.
   */
  function scan(root) {
    if (!root || !root.isConnected) return;
    visibility = new WeakMap(); // DOM'a yazdıkça düzen değişiyor, taze başla

    const elements = root.nodeType === Node.ELEMENT_NODE
      ? [root, ...root.querySelectorAll('*')]
      : [...(root.querySelectorAll?.('*') || [])];

    let claimed = null;

    for (const el of elements) {
      if (claimed) {
        if (claimed.contains(el)) continue;
        claimed = null;
      }
      if (SKIP_TAGS.has(el.tagName)) continue;
      if (el.dataset && el.dataset.ivd !== undefined) continue;

      const box = flatten(el);
      if (!box) continue; // sınırı aşıyor — çocuklarına in

      claimed = el;
      if (!/\d/.test(box.text)) continue;

      const matches = findPrices(box.text);
      if (!matches.length) continue;
      if (el.closest(UNSAFE_ANCESTORS)) continue;

      // Sondan başa: önceki eşleşmelerin uzaklıkları bozulmasın.
      for (let i = matches.length - 1; i >= 0; i--) applyMatch(box, matches[i]);
    }
  }

  /**
   * Elementin alt ağacındaki metni tek dizeye toplar ve her metin düğümünün
   * dizedeki aralığını kaydeder. Sınırı aşarsa null döner.
   */
  function flatten(el) {
    const parts = [];
    let text = '';
    let overflow = false;

    (function walk(node) {
      for (const child of node.childNodes) {
        if (overflow) return;

        if (child.nodeType === Node.TEXT_NODE) {
          const value = child.nodeValue;
          if (!value) continue;
          parts.push({ node: child, start: text.length, end: text.length + value.length });
          text += value;
          if (text.length > MAX_TEXT_LENGTH) overflow = true;
          continue;
        }

        if (child.nodeType !== Node.ELEMENT_NODE) continue; // yorumlar bölmez

        // Kendi eklediğimiz chip'ler, taranmayan etiketler ve görünmeyen
        // metinler birer duvar — içlerine hiç girmiyoruz.
        if (
          SKIP_TAGS.has(child.tagName) ||
          child.dataset?.ivd !== undefined ||
          isInvisible(child)
        ) {
          text += BREAK;
          continue;
        }

        const inline = INLINE_TAGS.has(child.tagName);
        if (!inline) text += BREAK;
        walk(child);
        if (!inline) text += BREAK;
      }
    })(el);

    return overflow ? null : { text, parts };
  }

  /**
   * Görünmeyen metin mi? Tarama başına önbelleklenir; düzen okuması ancak
   * gerçekten şüpheli düğümlerde yapılır.
   *
   * 1x1 boyutundaki **yapraklar** klasik "sr-only" imzasıdır. Yaprak şartı
   * bilinçli: `display: contents` gibi kutusu olmayan sarmalayıcılar görünür
   * çocuk barındırabiliyor, onları elemek istemeyiz.
   *
   * `Element.checkVisibility()` burada denendi ve **çıkarıldı**: Google
   * Alışveriş'te 1.568 elementin 1.077'si için false döndü, aralarında ekranda
   * duran ürün kartları da vardı. Kaybettiği içerik, kazandırdığından fazla.
   */
  function isInvisible(el) {
    const cached = visibility.get(el);
    if (cached !== undefined) return cached;

    let hidden = el.hidden === true || el.matches(SR_ONLY);
    if (!hidden && el.childElementCount === 0 && el.textContent) {
      hidden = el.offsetWidth <= 1 && el.offsetHeight <= 1;
    }

    visibility.set(el, hidden);
    return hidden;
  }

  /** Metindeki geçerli fiyatları { start, end, price, duration } olarak döner. */
  function findPrices(text) {
    const regex = IVD.createPriceRegex();
    const found = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      const price = IVD.readMatch(match);
      if (!price) continue;
      const duration = describe(price);
      if (!duration) continue;
      found.push({ start: match.index, end: match.index + match[0].length, price, duration });
    }

    return found;
  }

  /** Fiyatı kullanıcının para birimine çevirip süre metnini üretir. */
  function describe(price) {
    const perHour = IVD.hourlyRate(settings);
    const converted = IVD.convert(price.amount, price.currency, settings.currency, rates);
    if (converted === null) return null;
    return IVD.formatDuration(converted / perHour, settings);
  }

  /** Bir eşleşmeyi, yayıldığı metin düğümlerinin yerine chip koyarak uygular. */
  function applyMatch(box, match) {
    const first = box.parts.findIndex((p) => p.start <= match.start && match.start < p.end);
    const last = box.parts.findIndex((p) => p.start < match.end && match.end <= p.end);
    if (first === -1 || last === -1) return;

    const head = box.parts[first];
    const tail = box.parts[last];
    if (!head.node.isConnected || !tail.node.isConnected) return;

    const prefix = head.node.nodeValue.slice(0, match.start - head.start);
    const suffix = tail.node.nodeValue.slice(match.end - tail.start);
    const chip = createChip(match.price, match.duration);

    head.node.nodeValue = prefix;
    head.node.after(chip);

    if (first === last) {
      chip.after(document.createTextNode(suffix));
    } else {
      for (let i = first + 1; i < last; i++) box.parts[i].node.nodeValue = '';
      tail.node.nodeValue = suffix;
    }

    chips.push(chip);
  }

  function createChip(price, duration) {
    const chip = document.createElement('span');
    chip.className = 'ivd-chip';
    chip.dataset.ivd = 'time';
    chip.dataset.ivdOriginal = price.text;
    chip.dataset.ivdDuration = duration;
    chip.textContent = duration;
    chip.title = `${price.text} · tıkla, fiyata dön`;
    return chip;
  }

  // --- Etkileşim -------------------------------------------------------------

  function onChipClick(event) {
    const chip = event.target.closest?.('[data-ivd]');
    if (!chip) return;

    // Fiyat bir linkin içindeyse tıklama gezinmeye gitmesin.
    event.preventDefault();
    event.stopPropagation();

    const showingTime = chip.dataset.ivd === 'time';
    chip.dataset.ivd = showingTime ? 'money' : 'time';
    chip.textContent = showingTime ? chip.dataset.ivdOriginal : chip.dataset.ivdDuration;
    chip.title = showingTime
      ? `${chip.dataset.ivdDuration} · tıkla, süreye dön`
      : `${chip.dataset.ivdOriginal} · tıkla, fiyata dön`;
  }

  // --- Dinamik içerik --------------------------------------------------------

  function startObserving() {
    if (observer) return;

    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const added of mutation.addedNodes) {
          if (added.nodeType === Node.ELEMENT_NODE && !added.closest?.('[data-ivd]')) {
            pending.push(added);
          } else if (added.nodeType === Node.TEXT_NODE && added.parentElement) {
            pending.push(added.parentElement);
          }
        }
      }
      if (!pending.length) return;

      clearTimeout(scanTimer);
      scanTimer = setTimeout(flushPending, 250);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    watchUrl();
  }

  /**
   * Gözlemci tarama sırasında **kapatılmıyor**. Eskiden kapatılıyordu ve
   * kapalı olduğu 30-130 ms boyunca sayfaya eklenen içerik kalıcı olarak
   * kaçıyordu. Bunun yerine tarama bittikten sonra `takeRecords()` ile kendi
   * yazdıklarımızın kaydı atılıyor.
   */
  function flushPending() {
    const roots = pending.splice(0, pending.length);
    roots.forEach(scan);
    observer?.takeRecords();
  }

  /**
   * Tek sayfa uygulamalarında (Sahibinden'de kategori değiştirmek gibi) adres
   * değişiyor ama belge aynı kalıyor. İçerik bazen mutasyon gözlemcisinin
   * göremeyeceği şekilde yerinde değişiyor, o yüzden adresi de izliyoruz.
   *
   * `history.pushState`'i yamamak işe yaramaz: içerik betiği ayrı bir JS
   * dünyasında çalışır, sayfanın kendi çağrısını göremez. `webNavigation`
   * izni ise gezinme geçmişine erişim ister; "hiçbir şey toplamıyoruz"
   * sözünü bozardı. Kalan en dürüst yol, adresi saniyede bir okumak.
   */
  function watchUrl() {
    if (urlTimer) return;
    let last = location.href;

    const check = () => {
      if (location.href === last) return;
      last = location.href;
      // Yeni içerik genelde adresten hemen sonra geliyor; gözlemci zaten
      // yakalar, bu tarama da geç kalanlar için ikinci bir şans.
      revertAll();
      scan(document.body);
    };

    urlTimer = setInterval(check, 800);
    addEventListener('popstate', check);
    addEventListener('pageshow', check);
  }

  function stopObserving() {
    clearTimeout(scanTimer);
    clearInterval(urlTimer);
    urlTimer = null;
    pending.length = 0;
    observer?.disconnect();
    observer = null;
  }

  function revertAll() {
    for (const chip of chips) {
      if (!chip.isConnected) continue;
      const parent = chip.parentNode;
      parent.replaceChild(document.createTextNode(chip.dataset.ivdOriginal), chip);
      parent.normalize();
    }
    chips.length = 0;
  }
})();
