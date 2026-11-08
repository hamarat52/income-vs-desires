/** Ayar paneli. Her değişiklik anında chrome.storage.sync'e yazılır. */
(async function () {
  'use strict';

  const { t } = IVDi18n;
  IVDi18n.localizePage(document);

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
  el.openOptions.addEventListener('click', openOptions);

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

  /** Bekleyen kaydı hemen yazar; yazmanın sözünü döndürür (yoksa çözülmüş). */
  function flushSave() {
    clearTimeout(saveTimer);
    if (!pendingPatch) return Promise.resolve();
    const write = chrome.storage.sync.set(pendingPatch);
    pendingPatch = null;
    return write;
  }

  /**
   * Giderler sayfası ayarları açılırken storage'dan okur. Maaşı yazıp 500 ms
   * dolmadan düğmeye basılırsa kayıt henüz yazılmamış olur ve sayfa eski
   * değerle açılırdı; önce yazıp sonra açıyoruz. Yazma takılırsa (Safari'de
   * geri çağrısı hiç dönmeyen storage/mesaj gözlendi, bulgu G) düğme ölü
   * kalmasın diye en çok FLUSH_WAIT_MS beklenir; hata da açmayı engellemez.
   */
  const FLUSH_WAIT_MS = 1000;

  async function openOptions() {
    try {
      await Promise.race([
        flushSave(),
        new Promise((resolve) => setTimeout(resolve, FLUSH_WAIT_MS)),
      ]);
    } catch {
      // Yazılamadıysa Giderler son kayıtlı değerle açılır.
    }
    chrome.runtime.openOptionsPage();
  }

  function render() {
    // Anahtarın yanındaki yazı durumu söyler, sabit "Açık" kalmaz.
    el.enabledLabel.textContent = settings.enabled ? t('switchOn') : t('switchOff');

    const rate = IVD.effectiveRate(settings, settings.expenses, rates);
    const shift = IVD.shiftLengths(settings);
    el.rate.textContent = rate
      ? t(rate.basis === 'leftover' ? 'rateLeftover' : 'rateSalary', [
          IVD.formatMoney(rate.perHour, settings.currency),
          IVD.formatMoney(rate.perHour * shift.hoursPerDay, settings.currency),
        ])
      : t('rateEmpty');
    el.rate.classList.toggle('muted', !rate);
    renderBasisNote(rate);
    // Eksik olan alanı işaretle: boş bir input'taki placeholder dolu sanılıyor.
    el.salary.classList.toggle('missing', !settings.salary);

    if (!host) {
      el.toggleHost.hidden = true;
      return;
    }
    const off = (settings.disabledHosts || []).includes(host);
    el.toggleHost.hidden = false;
    el.toggleHost.textContent = t(off ? 'hostTurnOn' : 'hostTurnOff', host);
  }

  /** "Kalana göre" seçili ama uygulanamıyorsa nedenini söyler. */
  function renderBasisNote(rate) {
    const notes = [];
    if (rate && rate.fallback === 'no-expenses') {
      notes.push(t('noteNoExpenses'));
    } else if (rate && rate.fallback === 'overspent') {
      notes.push(t('noteOverspent'));
    }
    if (rate && rate.skipped) {
      notes.push(t('noteSkipped', rate.skipped));
    }
    el.basisNote.textContent = notes.join(' ');
    el.basisNote.hidden = notes.length === 0;
  }

  async function toggleHost() {
    const list = new Set(settings.disabledHosts || []);
    list.has(host) ? list.delete(host) : list.add(host);
    await save({ disabledHosts: [...list] });
  }

  /** Açık sekmeye "baştan tara" dedirtir, geç yüklenen fiyatlar için. */
  async function rescan() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return flash(t('flashNoTab'));

    chrome.tabs.sendMessage(tab.id, { type: 'ivd:rescan' }, (reply) => {
      if (chrome.runtime.lastError || !reply) {
        flash(t('flashNotHere'));
      } else if (!reply.active) {
        flash(t('flashInactive'));
      } else {
        flash(t('flashCount', reply.count));
      }
    });
  }

  /** Butonun yazısını geçici olarak sonuçla değiştirir. */
  function flash(text) {
    el.rescan.textContent = text;
    el.rescan.disabled = true;
    setTimeout(() => {
      el.rescan.textContent = t('rescan');
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

  // Kur bilgisi: bayatsa arka planda tazele.
  chrome.runtime.sendMessage({ type: 'ivd:refreshRates' }, (payload) => {
    if (chrome.runtime.lastError || !payload) return;
    const when = new Date(payload.fetchedAt).toLocaleDateString(IVDi18n.numberLocale());
    if (payload.rates && payload.rates !== rates) {
      rates = payload.rates;
      render();
    }
    if (payload.source === 'none') {
      el.rateInfo.textContent = t('ratesNone');
    } else if (payload.stale) {
      // Hiçbir kaynağa ulaşılamadı; elde kalan son tablo kullanılıyor.
      el.rateInfo.textContent = t('ratesStale', when);
    } else {
      el.rateInfo.textContent = t('ratesFresh', when);
    }
  });
})();
