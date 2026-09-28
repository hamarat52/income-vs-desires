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
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 saat
const ALARM_NAME = 'ivd-refresh-rates';
const API_URL = 'https://api.frankfurter.app/latest?from=EUR&to=USD,GBP,TRY';

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 60 * 6 });
  refreshRates();
});

chrome.runtime.onStartup.addListener(refreshRates);

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) refreshRates();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message && message.type === 'ivd:refreshRates') {
    refreshRates().then(sendResponse);
    return true; // async yanıt
  }
  return false;
});

/** Kurları çeker; taze önbellek varsa dokunmaz. Her durumda bir tablo döner. */
async function refreshRates(force = false) {
  const cached = (await chrome.storage.local.get(RATES_KEY))[RATES_KEY];
  if (!force && cached && Date.now() - cached.fetchedAt < MAX_AGE_MS) {
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
