/**
 * Service worker: kur tablosunu çeker ve önbellekte tutar.
 * Content script kuru doğrudan storage'dan okur; burada sadece tazeleriz.
 *
 * Bilerek **hiçbir şey import etmiyor**. Önceden `importScripts('lib/money.js')`
 * vardı ve Chrome bunu yükleyemeyip worker'ı hiç başlatmıyordu; dosya yerinde
 * ve yol doğru olmasına rağmen NetworkError veriyordu. Kütüphaneden tek
 * ihtiyaç yedek kur tablosuydu, ona da gerek yok: kur çekilemezse buradan
 * hiçbir şey yazmıyoruz, content script kendi FALLBACK_RATES'ine düşüyor.
 * Böylece yedek kurların tek sahibi money.js olarak kalıyor.
 */

const RATES_KEY = 'rates';
// Tazeleme sıklığının TEK kaynağı. Alarm periyodu ve önbellek ömrü buradan
// türer; README ve MAGAZA-LISTELEME.md de bu değeri ("12 saatte bir") yazar.
// Önceden alarm 6 saat, ömür 12 saatti; fetchedAt çekim bittikten sonra
// yazıldığı için 12. saatteki alarm "henüz taze" deyip atlıyor ve gerçek
// tazeleme 18. saate kayıyordu.
const REFRESH_HOURS = 12;
const MAX_AGE_MS = REFRESH_HOURS * 60 * 60 * 1000;
// Alarm, önbellek tam 12 saatlik olmadan birkaç ms/dk önce çalışabilir; bu pay
// sayesinde o turu atlamaz. Açılışta kaçırılmış alarm + onStartup aynı anda
// gelirse ikincisi taze önbelleği görür, çift istek olmaz.
const ALARM_SLACK_MS = 30 * 60 * 1000;
const ALARM_NAME = 'ivd-refresh-rates';
const API_URL = 'https://api.frankfurter.app/latest?from=EUR&to=USD,GBP,TRY';

chrome.runtime.onInstalled.addListener(() => {
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

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    const rates = { EUR: 1, ...data.rates };
    if (!rates.TRY || !rates.USD) throw new Error('eksik kur verisi');

    const payload = { rates, fetchedAt: Date.now(), source: 'frankfurter' };
    await chrome.storage.local.set({ [RATES_KEY]: payload });
    return payload;
  } catch (error) {
    console.warn('[IncomeVsDesires] kur çekilemedi:', error.message);
    if (cached) return cached; // bayat ama yok'tan iyidir

    // Storage'a yazmıyoruz: yazsak yedek kurların ikinci bir kopyası olurdu ve
    // biri güncellenip diğeri unutulurdu. Boş bırakınca content script kendi
    // tablosunu kullanıyor; panel de bu işareti görüp uyarıyı gösteriyor.
    return { rates: null, fetchedAt: Date.now(), source: 'fallback' };
  }
}
