/** Ayar paneli. Her değişiklik anında chrome.storage.sync'e yazılır. */
(async function () {
  'use strict';

  const el = {
    enabled: document.getElementById('enabled'),
    salary: document.getElementById('salary'),
    currency: document.getElementById('currency'),
    hoursPerDay: document.getElementById('hoursPerDay'),
    daysPerMonth: document.getElementById('daysPerMonth'),
    rate: document.getElementById('rate'),
    basisNote: document.getElementById('basisNote'),
    basisLeftover: document.getElementById('basisLeftover'),
    showBoth: document.getElementById('showBoth'),
    calendarDays: document.getElementById('calendarDays'),
    rateInfo: document.getElementById('rateInfo'),
    enabledLabel: document.getElementById('enabledLabel'),
    toggleHost: document.getElementById('toggleHost'),
    rescan: document.getElementById('rescan'),
    openOptions: document.getElementById('openOptions'),
  };

  for (const meta of Object.values(IVD.CURRENCIES)) {
    const option = document.createElement('option');
    option.value = meta.code;
    option.textContent = `${meta.symbol} ${meta.code}`;
    el.currency.appendChild(option);
  }

  let settings = {
    ...IVD.DEFAULT_SETTINGS,
    ...(await chrome.storage.sync.get({ ...IVD.DEFAULT_SETTINGS, expenses: [] })),
  };
  // Döviz giderleri "kalan" hesabına katmak için; son başarılı çekimin tablosu.
  let rates = (await chrome.storage.local.get('rates')).rates?.rates || null;
  const host = await currentHost();

  el.enabled.checked = settings.enabled;
  el.basisLeftover.checked = settings.basis === 'leftover';
  el.showBoth.checked = settings.display === 'both';
  el.calendarDays.checked = settings.dayUnit === 'calendar';
  el.salary.value = settings.salary ?? '';
  el.currency.value = settings.currency;
  el.hoursPerDay.value = settings.hoursPerDay ?? '';
  el.daysPerMonth.value = settings.daysPerMonth ?? '';

  // Tema tercihi Giderler sayfasından seçiliyor; panel ona uyar.
  //
  // theme.js boyamadan önce localStorage'a bakar, ama tek doğru kaynak
  // chrome.storage.sync. İkisi ayrışabilir (başka cihazda değiştirilmişse),
  // o yüzden burada iki yönlü uygulanıyor: karanlıksa ekle, aydınlıksa **sil**.
  const dark = settings.theme === 'dark';
  if (dark) document.documentElement.dataset.theme = 'dark';
  else delete document.documentElement.dataset.theme;

  try {
    localStorage.setItem('ivd-theme', dark ? 'dark' : 'light');
  } catch {
    // localStorage kapalıysa tercih chrome.storage'da duruyor.
  }

  render();
  if (!settings.salary) el.salary.focus();

  el.enabled.addEventListener('change', () => save({ enabled: el.enabled.checked }));
  el.currency.addEventListener('change', () => save({ currency: el.currency.value }));
  el.basisLeftover.addEventListener('change', () =>
    save({ basis: el.basisLeftover.checked ? 'leftover' : 'salary' })
  );
  el.showBoth.addEventListener('change', () =>
    save({ display: el.showBoth.checked ? 'both' : 'time' })
  );
  el.calendarDays.addEventListener('change', () =>
    save({ dayUnit: el.calendarDays.checked ? 'calendar' : 'shift' })
  );
  IVD.attachThousandSeparator(el.salary, (value) => saveLater({ salary: value }));
  el.hoursPerDay.addEventListener('input', () =>
    saveLater({ hoursPerDay: numberOrNull(el.hoursPerDay.value) })
  );
  el.daysPerMonth.addEventListener('input', () =>
    saveLater({ daysPerMonth: numberOrNull(el.daysPerMonth.value) })
  );
  for (const input of [el.salary, el.hoursPerDay, el.daysPerMonth]) {
    input.addEventListener('blur', flushSave);
  }
  // Panel kapanırken bekleyen yazma kaybolmasın. storage çağrısı senkron
  // gönderiliyor, sayfa kapansa da tarayıcıya ulaşıyor.
  addEventListener('pagehide', flushSave);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushSave();
  });
  el.toggleHost.addEventListener('click', toggleHost);
  el.rescan.addEventListener('click', rescan);
  el.openOptions.addEventListener('click', () => chrome.runtime.openOptionsPage());

  async function save(patch) {
    settings = { ...settings, ...patch };
    flushSave();
    await chrome.storage.sync.set(patch);
    render();
  }

  /**
   * Yazarken her tuşta storage'a yazmıyoruz: her yazma açık **bütün**
   * sekmelerde sayfayı baştan taratıyor ve `storage.sync` dakikada 120
   * yazmayla sınırlı. Ekran anında güncellenir, kayıt durunca yapılır.
   */
  let pendingPatch = null;
  let saveTimer = null;

  function saveLater(patch) {
    settings = { ...settings, ...patch };
    pendingPatch = { ...pendingPatch, ...patch };
    render();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushSave, 500);
  }

  function flushSave() {
    clearTimeout(saveTimer);
    if (!pendingPatch) return;
    chrome.storage.sync.set(pendingPatch);
    pendingPatch = null;
  }

  function render() {
    // Anahtarın yanındaki yazı durumu söyler, sabit "Açık" kalmaz.
    el.enabledLabel.textContent = settings.enabled ? 'Açık' : 'Kapalı';

    const rate = IVD.effectiveRate(settings, settings.expenses, rates);
    const shift = IVD.shiftLengths(settings);
    el.rate.textContent = rate
      ? `${rate.basis === 'leftover' ? 'Giderlerden sonra bir saatin' : 'Bir saatin'}` +
        ` ≈ ${IVD.formatMoney(rate.perHour, settings.currency)}` +
        ` · bir mesai ≈ ${IVD.formatMoney(rate.perHour * shift.hoursPerDay, settings.currency)}`
      : 'Başlamak için maaşını yaz. (Gri yazı sadece örnek.)';
    el.rate.classList.toggle('muted', !rate);
    renderBasisNote(rate);
    // Eksik olan alanı işaretle — boş bir input'taki placeholder dolu sanılıyor.
    el.salary.classList.toggle('missing', !settings.salary);

    if (!host) {
      el.toggleHost.hidden = true;
      return;
    }
    const off = (settings.disabledHosts || []).includes(host);
    el.toggleHost.hidden = false;
    el.toggleHost.textContent = off ? `${host} için aç` : `${host} için kapat`;
  }

  /** "Kalana göre" seçili ama uygulanamıyorsa nedenini söyler. */
  function renderBasisNote(rate) {
    const notes = [];
    if (rate && rate.fallback === 'no-expenses') {
      notes.push('Henüz gider girmedin, maaşın tamamına göre hesaplanıyor.');
    } else if (rate && rate.fallback === 'overspent') {
      notes.push('Giderlerin maaşını aşıyor, maaşın tamamına göre hesaplanıyor.');
    }
    if (rate && rate.skipped) {
      notes.push(`${rate.skipped} dövizli gider, kur çekilemediği için düşülmedi.`);
    }
    el.basisNote.textContent = notes.join(' ');
    el.basisNote.hidden = notes.length === 0;
  }

  async function toggleHost() {
    const list = new Set(settings.disabledHosts || []);
    list.has(host) ? list.delete(host) : list.add(host);
    await save({ disabledHosts: [...list] });
  }

  /** Açık sekmeye "baştan tara" dedirtir — geç yüklenen fiyatlar için. */
  async function rescan() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return flash('Sekme bulunamadı');

    chrome.tabs.sendMessage(tab.id, { type: 'ivd:rescan' }, (reply) => {
      if (chrome.runtime.lastError || !reply) {
        flash('Bu sayfada çalışmıyor');
      } else if (!reply.active) {
        flash('Kapalı, önce maaşını gir');
      } else {
        flash(`${reply.count} fiyat çevrildi`);
      }
    });
  }

  /** Butonun yazısını geçici olarak sonuçla değiştirir. */
  function flash(text) {
    el.rescan.textContent = text;
    el.rescan.disabled = true;
    setTimeout(() => {
      el.rescan.textContent = 'Sayfayı yeniden tara';
      el.rescan.disabled = false;
    }, 1800);
  }

  async function currentHost() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return tab?.url ? new URL(tab.url).hostname : null;
    } catch {
      return null;
    }
  }

  function numberOrNull(value) {
    const n = Number(value);
    return value !== '' && Number.isFinite(n) && n > 0 ? n : null;
  }

  // Kur bilgisi — bayatsa arka planda tazele.
  chrome.runtime.sendMessage({ type: 'ivd:refreshRates' }, (payload) => {
    if (chrome.runtime.lastError || !payload) return;
    const when = new Date(payload.fetchedAt).toLocaleDateString('tr-TR');
    if (payload.rates && payload.rates !== rates) {
      rates = payload.rates;
      render();
    }
    if (payload.source === 'none') {
      el.rateInfo.textContent = 'Kurlar henüz çekilemedi, dövizli fiyatlar çevrilmiyor.';
    } else if (payload.stale) {
      // Hiçbir kaynağa ulaşılamadı; elde kalan son tablo kullanılıyor.
      el.rateInfo.textContent = `Kurlar güncellenemedi, ${when} tarihli değerler kullanılıyor.`;
    } else {
      el.rateInfo.textContent = `Kurlar güncel (${when}).`;
    }
  });
})();
