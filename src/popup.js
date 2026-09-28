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

  let settings = { ...IVD.DEFAULT_SETTINGS, ...(await chrome.storage.sync.get(IVD.DEFAULT_SETTINGS)) };
  const host = await currentHost();

  el.enabled.checked = settings.enabled;
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
  IVD.attachThousandSeparator(el.salary, (value) => save({ salary: value }));
  el.hoursPerDay.addEventListener('input', () =>
    save({ hoursPerDay: numberOrNull(el.hoursPerDay.value) })
  );
  el.daysPerMonth.addEventListener('input', () =>
    save({ daysPerMonth: numberOrNull(el.daysPerMonth.value) })
  );
  el.toggleHost.addEventListener('click', toggleHost);
  el.rescan.addEventListener('click', rescan);
  el.openOptions.addEventListener('click', () => chrome.runtime.openOptionsPage());

  async function save(patch) {
    settings = { ...settings, ...patch };
    await chrome.storage.sync.set(patch);
    render();
  }

  function render() {
    // Anahtarın yanındaki yazı durumu söyler, sabit "Açık" kalmaz.
    el.enabledLabel.textContent = settings.enabled ? 'Açık' : 'Kapalı';

    const perHour = IVD.hourlyRate(settings);
    const shift = IVD.shiftLengths(settings);
    el.rate.textContent = perHour
      ? `Bir saatin ≈ ${IVD.formatMoney(perHour, settings.currency)}` +
        ` · bir mesai ≈ ${IVD.formatMoney(perHour * shift.hoursPerDay, settings.currency)}`
      : 'Başlamak için maaşını yaz. (Gri yazı sadece örnek.)';
    el.rate.classList.toggle('muted', !perHour);
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
    el.rateInfo.textContent =
      payload.source === 'fallback'
        ? 'Kurlar çekilemedi, yaklaşık değerler kullanılıyor.'
        : `Kurlar güncel (${when}).`;
  });
})();
