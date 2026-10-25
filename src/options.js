/**
 * Tam sayfa panel: sabit giderleri çalışma süresine çevirir ve ayın mesaisini
 * halka grafikte parça-bütün olarak gösterir.
 */
(async function () {
  'use strict';

  /** Kategoriler sabit sırada — renk varlığa bağlı, sıralamaya değil. */
  const CATEGORIES = [
    { id: 'kira', label: 'Kira', color: 'var(--series-kira)' },
    { id: 'abonelik', label: 'Dijital abonelik', color: 'var(--series-abonelik)' },
    { id: 'taksit', label: 'Taksit', color: 'var(--series-taksit)' },
    { id: 'diger', label: 'Diğer', color: 'var(--series-diger)' },
  ];
  const LEFTOVER = { id: 'kalan', label: 'Sana kalan', color: 'var(--series-kalan)' };

  /** Geri bildirimlerin gideceği adres. Boşsa gönder butonu gizlenir. */
  const FEEDBACK_EMAIL = 'yusuf.hamarat@ozu.edu.tr';

  /**
   * 31.07.2026'da gerçek sayfalarda ölçüldü. `ok` = fiyatlar doğru çevrildi,
   * `bilinmiyor` = test tarayıcısında doğrulanamadı (site engelledi ya da
   * ürünler hiç yüklenmedi), eklentinin çalışmadığı anlamına gelmez.
   */
  const TESTED_SITES = [
    { host: 'lcw.com', name: 'LC Waikiki', status: 'ok', note: '191 fiyat · 41 ms' },
    { host: 'trendyol.com', name: 'Trendyol', status: 'ok', note: '58 fiyat · 33 ms' },
    { host: 'hepsiburada.com', name: 'Hepsiburada', status: 'ok', note: '103 fiyat · 17 ms' },
    { host: 'amazon.com.tr', name: 'Amazon', status: 'ok', note: '68 fiyat · 128 ms' },
    { host: 'google.com', name: 'Google Alışveriş', status: 'ok', note: '68 fiyat · 88 ms' },
    { host: 'ciceksepeti.com', name: 'Çiçeksepeti', status: 'ok', note: '54 fiyat · 5 ms' },
    { host: 'migros.com.tr', name: 'Migros', status: 'ok', note: '49 fiyat · 17 ms' },
    { host: 'teknosa.com', name: 'Teknosa', status: 'ok', note: '38 fiyat · 13 ms' },
    { host: 'n11.com', name: 'n11', status: 'ok', note: '28 fiyat · 70 ms' },
    {
      host: 'boyner.com.tr',
      name: 'Boyner',
      status: 'bilinmiyor',
      note: 'ürünler test tarayıcısında yüklenmedi',
    },
    {
      host: 'mediamarkt.com.tr',
      name: 'MediaMarkt',
      status: 'bilinmiyor',
      note: 'ürünler test tarayıcısında yüklenmedi',
    },
    {
      host: 'sahibinden.com',
      name: 'Sahibinden',
      status: 'bilinmiyor',
      note: 'bot koruması testi engelledi',
    },
  ];

  const STATUS = {
    ok: { icon: '✓', label: 'Test edildi', className: 'ok' },
    bilinmiyor: { icon: '?', label: 'Doğrulanamadı', className: 'unknown' },
  };

  const RADIUS = 76;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const GAP = 3; // parçalar arası zemin boşluğu (yol birimi)

  const el = (id) => document.getElementById(id);
  const ui = {
    salary: el('salary'),
    currency: el('currency'),
    hoursPerDay: el('hoursPerDay'),
    daysPerMonth: el('daysPerMonth'),
    rate: el('rate'),
    summary: el('summary'),
    tiles: el('tiles'),
    arcs: el('donutArcs'),
    donut: el('donut'),
    donutValue: el('donutValue'),
    donutLabel: el('donutLabel'),
    donutDesc: el('donutDesc'),
    tooltip: el('tooltip'),
    legend: el('legend'),
    addForm: el('addForm'),
    name: el('name'),
    amount: el('amount'),
    amountCurrency: el('amountCurrency'),
    period: el('period'),
    category: el('category'),
    itemsBody: el('itemsBody'),
    items: el('items'),
    empty: el('empty'),
    sites: el('sites'),
    feedbackForm: el('feedbackForm'),
    fbType: el('fbType'),
    fbSite: el('fbSite'),
    fbText: el('fbText'),
    fbSend: el('fbSend'),
    fbPreview: el('fbPreview'),
    theme: el('theme'),
  };

  for (const meta of Object.values(IVD.CURRENCIES)) {
    ui.currency.append(new Option(`${meta.symbol} ${meta.code}`, meta.code));
    ui.amountCurrency.append(new Option(`${meta.symbol} ${meta.code}`, meta.code));
  }
  for (const cat of CATEGORIES) {
    ui.category.append(new Option(cat.label, cat.id));
  }

  const stored = await chrome.storage.sync.get({ ...IVD.DEFAULT_SETTINGS, expenses: [] });
  let settings = { ...IVD.DEFAULT_SETTINGS, ...stored };
  let expenses = Array.isArray(stored.expenses) ? stored.expenses : [];

  // Kur tablosu: dövizli giderler (Netflix $, yıllık alan adı €) maaşın para
  // birimine bununla çevrilir. Son başarılı çekimin tablosu; hiç çekim
  // olmadıysa null ve dövizli giderler tabloda "kur yok" diye görünür.
  let rates = (await chrome.storage.local.get('rates')).rates?.rates || null;
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.rates?.newValue?.rates) {
      rates = changes.rates.newValue.rates;
      render();
      return;
    }
    // Panelden (popup) değişen ayarlar bu sayfa açıkken de yansısın; yoksa
    // ör. "1 gün = 24 saat" açılınca sayfa yeniden yüklenene kadar eski kalıyor.
    // Bu sayfanın kendi alanları (maaş, saat, gün) yazılırken ezilmesin diye
    // yalnızca panelin sahip olduğu anahtarlar alınıyor.
    if (area !== 'sync') return;
    const fromPopup = ['basis', 'display', 'dayUnit', 'enabled', 'disabledHosts'];
    const patch = {};
    for (const key of fromPopup) if (key in changes) patch[key] = changes[key].newValue;
    if (!Object.keys(patch).length) return;
    settings = { ...settings, ...patch };
    renderSettings();
  });

  // Para birimi eklenmeden önce kaydedilmiş giderler maaşın para birimindeydi.
  // Bunu bir kez yazıya geçiriyoruz; yoksa maaşın para birimi değişince eski
  // giderler sessizce yeni birimde okunurdu (500 TL kira → 500 €).
  if (expenses.some((item) => !item.currency)) {
    expenses = expenses.map((item) => ({ currency: settings.currency, ...item }));
    chrome.storage.sync.set({ expenses });
  }

  ui.salary.value = settings.salary ?? '';
  ui.currency.value = settings.currency;
  ui.amountCurrency.value = settings.currency;
  ui.hoursPerDay.value = settings.hoursPerDay ?? '';
  ui.daysPerMonth.value = settings.daysPerMonth ?? '';

  IVD.attachThousandSeparator(ui.salary, (value) => saveSettingsLater({ salary: value }));
  ui.currency.addEventListener('change', () => {
    // Yeni giderin varsayılan birimi maaşınkini izler.
    ui.amountCurrency.value = ui.currency.value;
    saveSettings({ currency: ui.currency.value });
  });
  ui.hoursPerDay.addEventListener('input', () =>
    saveSettingsLater({ hoursPerDay: num(ui.hoursPerDay.value) })
  );
  ui.daysPerMonth.addEventListener('input', () =>
    saveSettingsLater({ daysPerMonth: num(ui.daysPerMonth.value) })
  );
  ui.addForm.addEventListener('submit', onAdd);
  ui.itemsBody.addEventListener('click', onRemove);

  ui.theme.addEventListener('click', onThemeClick);
  applyTheme(settings.theme);

  ui.feedbackForm.addEventListener('submit', onSendFeedback);
  ui.feedbackForm.addEventListener('input', renderReportPreview);

  ui.fbSend.hidden = !FEEDBACK_EMAIL;

  render();
  renderSites();
  renderReportPreview();

  // --- Görünüm ---------------------------------------------------------------

  function onThemeClick(event) {
    const button = event.target.closest('[data-theme-value]');
    if (!button) return;
    saveSettings({ theme: button.dataset.themeValue });
    applyTheme(button.dataset.themeValue);
  }

  /**
   * Temayı hem bu sayfaya hem de localStorage'a yazar. localStorage kopyası,
   * theme.js'in boyamadan önce senkron okuyabilmesi için; kalıcı kayıt
   * chrome.storage.sync'te ve panelle paylaşılıyor.
   */
  function applyTheme(theme) {
    const dark = theme === 'dark';

    if (dark) document.documentElement.dataset.theme = 'dark';
    else delete document.documentElement.dataset.theme;

    try {
      localStorage.setItem('ivd-theme', dark ? 'dark' : 'light');
    } catch {
      // localStorage kapalıysa tercih yine chrome.storage'da duruyor.
    }

    ui.theme.querySelectorAll('[data-theme-value]').forEach((button) => {
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.themeValue === (dark ? 'dark' : 'light'))
      );
    });
  }

  // --- Test edilmiş siteler --------------------------------------------------

  function renderSites() {
    const off = new Set(settings.disabledHosts || []);

    ui.sites.replaceChildren(
      ...TESTED_SITES.map((site) => {
        const state = STATUS[site.status];
        const kapali = [...off].some((h) => h.endsWith(site.host));

        const li = document.createElement('li');
        li.className = 'site';
        li.innerHTML = `
          <span class="status ${state.className}" aria-hidden="true">${state.icon}</span>
          <span class="site-name">${escape(site.name)}</span>
          <span class="site-host">${escape(site.host)}</span>
          <span class="site-note">${escape(state.label)} · ${escape(site.note)}</span>
          ${kapali ? '<span class="tag">bu sitede kapalı</span>' : ''}
        `;
        return li;
      })
    );
  }

  // --- Geri bildirim ---------------------------------------------------------

  /** Raporu kurar. Maaş ve gider listesi bilerek dışarıda bırakılır. */
  function buildReport() {
    const version = chrome.runtime?.getManifest?.().version ?? '?';
    const tur = ui.fbType.value === 'hata' ? 'Hata bildirimi' : 'Özellik isteği';

    return [
      `Tür: ${tur}`,
      ui.fbSite.value.trim() ? `Site: ${ui.fbSite.value.trim()}` : null,
      '',
      ui.fbText.value.trim() || '(açıklama yazılmadı)',
      '',
      '--- teknik bilgi ---',
      `Eklenti: IncomeVsDesires ${version}`,
      `Tarayıcı: ${navigator.userAgent}`,
      `Para birimi: ${settings.currency}`,
      `Çalışma düzeni: ${settings.hoursPerDay ?? '?'} saat/gün × ${settings.daysPerMonth ?? '?'} gün/ay`,
    ]
      .filter((line) => line !== null)
      .join('\n');
  }

  function renderReportPreview() {
    ui.fbPreview.textContent = buildReport();
  }

  function onSendFeedback(event) {
    event.preventDefault();
    if (!FEEDBACK_EMAIL) return;

    const konu =
      ui.fbType.value === 'hata'
        ? `IncomeVsDesires · hata${ui.fbSite.value.trim() ? `: ${ui.fbSite.value.trim()}` : ''}`
        : 'IncomeVsDesires · özellik isteği';

    const url =
      `mailto:${FEEDBACK_EMAIL}` +
      `?subject=${encodeURIComponent(konu)}` +
      `&body=${encodeURIComponent(buildReport())}`;

    window.open(url, '_blank');
  }

  // --- Veri ------------------------------------------------------------------

  async function saveSettings(patch) {
    settings = { ...settings, ...patch };
    flushSettings();
    await chrome.storage.sync.set(patch);
    renderSettings();
  }

  function renderSettings() {
    render();
    renderSites();
    renderReportPreview();
  }

  /**
   * Yazarken her tuşta storage'a yazmıyoruz: her yazma açık bütün sekmelerde
   * sayfayı baştan taratıyor ve `storage.sync` dakikada 120 yazmayla sınırlı.
   * Ekran anında güncellenir, kayıt durunca (ya da sayfa kapanınca) yapılır.
   */
  let pendingSettings = null;
  let settingsTimer = null;

  function saveSettingsLater(patch) {
    settings = { ...settings, ...patch };
    pendingSettings = { ...pendingSettings, ...patch };
    renderSettings();
    clearTimeout(settingsTimer);
    settingsTimer = setTimeout(flushSettings, 500);
  }

  function flushSettings() {
    clearTimeout(settingsTimer);
    if (!pendingSettings) return;
    chrome.storage.sync.set(pendingSettings);
    pendingSettings = null;
  }

  addEventListener('pagehide', flushSettings);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushSettings();
  });

  async function saveExpenses() {
    await chrome.storage.sync.set({ expenses });
    render();
  }

  function onAdd(event) {
    event.preventDefault();
    const amount = num(ui.amount.value);
    const name = ui.name.value.trim();
    if (!name || !amount) return;

    expenses.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      amount,
      currency: ui.amountCurrency.value,
      period: ui.period.value,
      category: ui.category.value,
    });
    ui.addForm.reset();
    ui.amountCurrency.value = settings.currency; // reset() ilk seçeneğe döndürüyor
    ui.name.focus();
    saveExpenses();
  }

  function onRemove(event) {
    const button = event.target.closest('.remove');
    if (!button) return;
    expenses = expenses.filter((item) => item.id !== button.dataset.id);
    saveExpenses();
  }

  /** Gideri her zaman maaşın para biriminde aylık tutara indirger. (render()
   *  bundan önce çağrıldığı için bildirim olarak yazıldı — ok fonksiyonu
   *  TDZ'ye takılıyor.) */
  function monthlyAmount(item) {
    return IVD.expenseMonthly(item, settings.currency, rates) ?? 0;
  }

  // --- Çizim -----------------------------------------------------------------

  function render() {
    const perHour = IVD.hourlyRate(settings);
    const shift = IVD.shiftLengths(settings);

    if (!perHour) {
      ui.rate.textContent = 'Hesaplamak için maaşını ve çalışma düzenini gir.';
      ui.summary.hidden = true;
      renderTable(null, null);
      return;
    }

    ui.rate.innerHTML =
      `Bir saatin <strong>${IVD.formatMoney(perHour, settings.currency)}</strong>` +
      ` · bir mesain <strong>${IVD.formatMoney(perHour * shift.hoursPerDay, settings.currency)}</strong>` +
      ` · ayda <strong>${fmt(shift.hoursPerMonth)} saat</strong> çalışıyorsun`;

    renderTable(perHour, shift);

    if (!expenses.length) {
      ui.summary.hidden = true;
      return;
    }
    ui.summary.hidden = false;

    // Kategori bazında aylık tutar → çalışma saati
    const byCategory = CATEGORIES.map((cat) => {
      const total = expenses
        .filter((item) => item.category === cat.id)
        .reduce((sum, item) => sum + monthlyAmount(item), 0);
      return { ...cat, amount: total, hours: total / perHour };
    }).filter((row) => row.amount > 0);

    const spentHours = byCategory.reduce((sum, row) => sum + row.hours, 0);
    const leftHours = Math.max(shift.hoursPerMonth - spentHours, 0);
    const overspent = spentHours > shift.hoursPerMonth;

    const segments = [
      ...byCategory,
      { ...LEFTOVER, amount: Math.max(settings.salary - spentHours * perHour, 0), hours: leftHours },
    ];

    renderTiles(byCategory, leftHours, shift, overspent);
    renderDonut(segments, shift, overspent ? spentHours : null);
    renderLegend(segments, shift);
  }

  function renderTiles(byCategory, leftHours, shift, overspent) {
    const rows = [
      ...byCategory,
      { ...LEFTOVER, hours: leftHours },
    ];

    ui.tiles.replaceChildren(
      ...rows.map((row) => {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.innerHTML = `
          <div class="tile-label"><span class="swatch" style="background:${row.color}"></span>${escape(row.label)}</div>
          <div class="tile-value">${IVD.formatDuration(row.hours, settings)}</div>
          <div class="tile-note">${percent(row.hours, shift.hoursPerMonth)} · ayda ${fmt(row.hours)} saat</div>
        `;
        return tile;
      })
    );

    const existing = ui.tiles.parentElement.querySelector('.warn');
    existing?.remove();
    if (overspent) {
      const warn = document.createElement('p');
      warn.className = 'warn';
      warn.textContent =
        'Giderlerin maaşını aşıyor, grafikte "sana kalan" sıfır görünüyor.';
      ui.tiles.after(warn);
    }
  }

  /** `neededHours` doluysa giderler maaşı aşmış demektir; merkez onu anlatır. */
  function renderDonut(segments, shift, neededHours) {
    const total = segments.reduce((sum, s) => sum + s.hours, 0) || 1;
    const drawn = segments.filter((s) => s.hours > 0);
    let travelled = 0;

    ui.arcs.replaceChildren(
      ...drawn.map((segment) => {
        const length = (segment.hours / total) * CIRCUMFERENCE;
        // Parçalar arasında zemin boşluğu bırak; tek parça kalırsa boşluk yok.
        const visible = drawn.length > 1 ? Math.max(length - GAP, 1) : length;

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '100');
        circle.setAttribute('cy', '100');
        circle.setAttribute('r', String(RADIUS));
        circle.setAttribute('stroke', segment.color);
        circle.setAttribute('stroke-dasharray', `${visible} ${CIRCUMFERENCE - visible}`);
        circle.setAttribute('stroke-dashoffset', String(-travelled));
        circle.setAttribute('tabindex', '0');
        circle.setAttribute('role', 'listitem');
        circle.setAttribute(
          'aria-label',
          `${segment.label}: ${IVD.formatDuration(segment.hours, settings)}, ` +
            `mesainin ${percent(segment.hours, shift.hoursPerMonth)}`
        );

        const show = () => highlight(circle, segment, shift);
        circle.addEventListener('mouseenter', show);
        circle.addEventListener('focus', show);
        circle.addEventListener('mouseleave', clearHighlight);
        circle.addEventListener('blur', clearHighlight);

        travelled += length;
        return circle;
      })
    );

    // Merkez de kutucuklarla aynı gün birimini kullanmalı. Eskiden hep mesai
    // günü yazıyordu: "1 gün = 24 saat" seçiliyken merkez "22 gün", kalan
    // kutucuğu ise 160 saati "6,7 gün" (takvim) diye yazıyor, ikisi çelişiyordu.
    const dayHours = IVD.unitLengths(settings).hoursPerDay;
    if (neededHours) {
      ui.donutValue.textContent = `${fmt(neededHours / dayHours)} gün`;
      ui.donutLabel.textContent = 'gerekiyor, ayın yetmiyor';
    } else {
      ui.donutValue.textContent = `${fmt(shift.hoursPerMonth / dayHours)} gün`;
      ui.donutLabel.textContent = 'aylık mesain';
    }
    ui.donutDesc.textContent = segments
      .map((s) => `${s.label}: ${IVD.formatDuration(s.hours, settings)}`)
      .join('; ');
  }

  function highlight(circle, segment, shift) {
    ui.donut.classList.add('dimmed');
    circle.classList.add('active');
    ui.tooltip.hidden = false;
    ui.tooltip.textContent =
      `${segment.label}: ${IVD.formatDuration(segment.hours, settings)} ` +
      `(${percent(segment.hours, shift.hoursPerMonth)})`;
  }

  function clearHighlight() {
    ui.donut.classList.remove('dimmed');
    ui.arcs.querySelectorAll('.active').forEach((c) => c.classList.remove('active'));
    ui.tooltip.hidden = true;
  }

  function renderLegend(segments, shift) {
    ui.legend.replaceChildren(
      ...segments.map((segment) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <span class="swatch" style="background:${segment.color}"></span>
          <span class="name">${escape(segment.label)}</span>
          <span class="value">${IVD.formatDuration(segment.hours, settings)}</span>
          <span class="pct">${percent(segment.hours, shift.hoursPerMonth)}</span>
        `;
        return li;
      })
    );
  }

  function renderTable(perHour, shift) {
    ui.empty.hidden = expenses.length > 0;
    ui.items.hidden = expenses.length === 0;

    const order = CATEGORIES.map((c) => c.id);
    const sorted = [...expenses].sort(
      (a, b) =>
        order.indexOf(a.category) - order.indexOf(b.category) ||
        monthlyAmount(b) - monthlyAmount(a)
    );

    ui.itemsBody.replaceChildren(
      ...sorted.map((item) => {
        // Tanınmayan tür "Diğer"e düşer. İndeksle değil id ile arıyoruz:
        // kategori sırası değiştiğinde sessizce yanlış türe düşmesin.
        const cat =
          CATEGORIES.find((c) => c.id === item.category) ||
          CATEGORIES.find((c) => c.id === 'diger');
        // Kur yoksa (dövizli gider, hiç çekim olmamış) tutar bilinmiyor; 0
        // yazmak yanıltır, satır "kur yok" der ve toplamlara katılmaz.
        const converted = IVD.expenseMonthly(item, settings.currency, rates);
        const monthly = converted ?? 0;
        const hours = perHour && converted !== null ? monthly / perHour : null;
        // Döviz giderinde girilen tutar altta kalır; üstteki çevrilmiş tutar
        // kurla oynar, kullanıcı neyi girdiğini görebilsin.
        const foreign = item.currency && item.currency !== settings.currency
          ? `<div class="tile-note">${IVD.formatMoney(item.amount, item.currency)}` +
            `/${item.period === 'yearly' ? 'yıl' : 'ay'}</div>`
          : '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${escape(item.name)}${item.period === 'yearly' ? ' <span class="tile-note">(yıllık)</span>' : ''}</td>
          <td><span class="cat"><span class="swatch" style="background:${cat.color}"></span>${escape(cat.label)}</span></td>
          <td class="num">${converted === null
            ? `kur yok${foreign}`
            : `${foreign ? '≈ ' : ''}${IVD.formatMoney(monthly, settings.currency)}${foreign}`}</td>
          <td class="num cost">${hours === null ? '·' : IVD.formatDuration(hours, settings)}</td>
          <td class="num">${hours === null ? '·' : percent(hours, shift.hoursPerMonth)}</td>
          <td class="num"><button type="button" class="remove" data-id="${item.id}" aria-label="${escape(item.name)} giderini sil">Sil</button></td>
        `;
        return tr;
      })
    );
  }

  // --- Yardımcılar -----------------------------------------------------------

  function num(value) {
    const parsed = Number(value);
    return value !== '' && Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  function fmt(value) {
    return Number(value).toLocaleString('tr-TR', { maximumFractionDigits: 1 });
  }

  function percent(part, whole) {
    if (!whole) return '·';
    return `%${(part / whole * 100).toLocaleString('tr-TR', { maximumFractionDigits: 1 })}`;
  }

  function escape(text) {
    return String(text).replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
  }
})();
