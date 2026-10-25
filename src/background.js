/**
 * Service worker: kur tablosunu çeker ve önbellekte tutar.
 * Content script kuru doğrudan storage'dan okur; burada sadece tazeleriz.
 *
 * Bilerek **hiçbir şey import etmiyor**. Önceden `importScripts('lib/money.js')`
 * vardı ve Chrome bunu yükleyemeyip worker'ı hiç başlatmıyordu; dosya yerinde
 * ve yol doğru olmasına rağmen NetworkError veriyordu.
 *
 * Koda gömülü yedek kur tablosu yok. Yedek, **son başarılı çekimin** kendisi:
 * storage'daki tablo yalnızca yeni bir başarılı çekimle değişir, başarısız
 * denemeler ona dokunmaz. Hiç çekim olmadıysa döviz fiyatlar çevrilmez.
 */

const RATES_KEY = 'rates';
// Tazeleme sıklığının TEK kaynağı. Alarm periyodu ve önbellek ömrü buradan
// türer; README, MAGAZA-LISTELEME.md ve gizlilik sayfası da bu değeri
// ("günde bir") yazar. Kurlar zaten günde bir yayımlanıyor (ECB iş günü
// sonunda), daha sık çekmek yeni bilgi getirmiyor.
// Önceden alarm 6 saat, ömür 12 saatti; fetchedAt çekim bittikten sonra
// yazıldığı için alarm "henüz taze" deyip atlıyor ve tazeleme bir tur kayıyordu.
const REFRESH_HOURS = 24;
const MAX_AGE_MS = REFRESH_HOURS * 60 * 60 * 1000;
// Alarm, önbellek tam 24 saatlik olmadan birkaç ms/dk önce çalışabilir; bu pay
// sayesinde o turu atlamaz. Açılışta kaçırılmış alarm + onStartup aynı anda
// gelirse ikincisi taze önbelleği görür, çift istek olmaz.
const ALARM_SLACK_MS = 30 * 60 * 1000;
const ALARM_NAME = 'ivd-refresh-rates';
// Bir kaynak yanıt vermezse sıradakine geçmeden önce beklenen süre.
const FETCH_TIMEOUT_MS = 8000;

/**
 * Sırayla denenen kur kaynakları. İlki başarılı olursa diğerlerine hiç
 * gidilmez; yedekler yalnızca öncekiler başarısız olunca çağrılır.
 * Hepsi anahtarsız, ücretsiz ve `Access-Control-Allow-Origin: *` döner.
 * Her adres manifest'teki `host_permissions`'ta olmalı.
 *
 * `parse` EUR bazlı { USD, GBP, TRY } döner; biçim tanınmazsa null.
 */
const SOURCES = [
  {
    // api.frankfurter.app artık 301 ile buraya yönlendiriyor; yönlendirme
    // yanıtında CORS başlığı yok, bu yüzden doğrudan yeni adrese gidiyoruz.
    name: 'frankfurter',
    url: 'https://api.frankfurter.dev/v1/latest?from=EUR&to=USD,GBP,TRY',
    parse: (data) => data && data.rates,
  },
  {
    name: 'er-api',
    url: 'https://open.er-api.com/v6/latest/EUR',
    parse: (data) => (data && data.result === 'success' ? data.rates : null),
  },
  {
    name: 'currency-api',
    url: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.min.json',
    parse: (data) =>
      data && data.eur ? { USD: data.eur.usd, GBP: data.eur.gbp, TRY: data.eur.try } : null,
  },
];

chrome.runtime.onInstalled.addListener(() => {
  // Aynı adla create eskisinin yerine geçer; güncellemede 12 saatlik eski
  // alarm da böylece günlüğe döner.
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: REFRESH_HOURS * 60 });
  refreshRates();
});

// Tarayıcı açılışında yalnızca önbellek bayatsa çeker.
chrome.runtime.onStartup.addListener(() => refreshRates());

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) refreshRates(false, MAX_AGE_MS - ALARM_SLACK_MS);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message && message.type === 'ivd:refreshRates') {
    refreshRates().then(sendResponse);
    return true; // async yanıt
  }
  return false;
});

/** Kurları çeker; taze önbellek varsa dokunmaz. Her durumda bir tablo döner. */
let inFlight = null;
function refreshRates(force = false, maxAge = MAX_AGE_MS) {
  // Aynı anda gelen çağrılar (açılış + kaçırılmış alarm + panel) tek isteğe iner.
  if (!inFlight) inFlight = doRefresh(force, maxAge).finally(() => { inFlight = null; });
  return inFlight;
}

async function doRefresh(force, maxAge) {
  const cached = (await chrome.storage.local.get(RATES_KEY))[RATES_KEY];
  if (!force && cached && Date.now() - cached.fetchedAt < maxAge) {
    return cached;
  }

  for (const source of SOURCES) {
    try {
      const rates = await fetchFrom(source);
      const payload = { rates, fetchedAt: Date.now(), source: source.name };
      await chrome.storage.local.set({ [RATES_KEY]: payload });
      return payload;
    } catch (error) {
      console.warn(`[IncomeVsDesires] kur çekilemedi (${source.name}):`, error.message);
    }
  }

  // Bayat ama yok'tan iyidir. `stale` işareti panelde "güncellenemedi" uyarısı
  // için; storage'a yazılmaz, bir sonraki başarılı çekimde kendiliğinden düşer.
  if (cached) return { ...cached, stale: true };

  // Hiç başarılı çekim olmadı (kurulum anında çevrimdışı). Storage'a bir şey
  // yazmıyoruz; panel bu işareti görüp "dövizli fiyatlar çevrilmiyor" der.
  return { rates: null, fetchedAt: Date.now(), source: 'none' };
}

/** Tek bir kaynaktan EUR bazlı tablo çeker; eksik ya da bozuksa fırlatır. */
async function fetchFrom(source) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(source.url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const parsed = source.parse(await response.json());

    const rates = { EUR: 1 };
    for (const code of ['USD', 'GBP', 'TRY']) {
      const value = Number(parsed && parsed[code]);
      if (!Number.isFinite(value) || value <= 0) throw new Error(`eksik kur verisi: ${code}`);
      rates[code] = value;
    }
    return rates;
  } finally {
    clearTimeout(timer);
  }
}
