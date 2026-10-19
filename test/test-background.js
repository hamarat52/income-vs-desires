/**
 * background.js için test. Sahte chrome.* ve sahte fetch ile yükleyip
 * refreshRates'in üç yolunu da denetler.
 *
 * Bu dosyanın hiç testi yoktu; importScripts hatası da bu yüzden ancak
 * gerçek tarayıcıda ortaya çıkmıştı.
 */
const fs = require('fs');
const vm = require('vm');

const SRC = require('path').join(__dirname, '..', 'src', 'background.js');

let fail = 0;
const check = (label, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) fail++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label} → ${JSON.stringify(actual)}${ok ? '' : ` (beklenen: ${JSON.stringify(expected)})`}`);
};

function kur({ store = {}, fetchImpl }) {
  const kayitli = { alarms: [], mesajDinleyici: null };

  const chrome = {
    runtime: {
      onInstalled: { addListener: (fn) => (kayitli.onInstalled = fn) },
      onStartup: { addListener: (fn) => (kayitli.onStartup = fn) },
      onMessage: { addListener: (fn) => (kayitli.mesajDinleyici = fn) },
    },
    alarms: {
      create: (name, opts) => kayitli.alarms.push({ name, opts }),
      onAlarm: { addListener: (fn) => (kayitli.onAlarm = fn) },
    },
    storage: {
      local: {
        get: async (key) => (store[key] !== undefined ? { [key]: store[key] } : {}),
        set: async (patch) => Object.assign(store, patch),
      },
    },
  };

  const sandbox = { chrome, fetch: fetchImpl, console: { warn() {} }, Date, JSON };
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;

  const context = vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(SRC, 'utf8'), context, { filename: 'background.js' });

  return { sandbox, store, kayitli, context };
}

const yanit = (body) => ({ ok: true, status: 200, json: async () => body });
const API_BODY = { amount: 1, base: 'EUR', date: '2026-07-31', rates: { GBP: 0.85, TRY: 54.58, USD: 1.14 } };

(async () => {
  console.log('--- importScripts kalmadı mı ---');
  // Yorumları ayıkla: dosya, importScripts'in neden kaldırıldığını anlatan bir
  // açıklama içeriyor ve ham metinde aramak onu da yakalıyordu.
  const kod = fs
    .readFileSync(SRC, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  check('importScripts çağrısı yok', /importScripts\s*\(/.test(kod), false);
  check('self.IVD kullanımı yok', /self\.IVD/.test(kod), false);

  console.log('\n--- 1. başarılı çekim ---');
  {
    const { context, store } = kur({ fetchImpl: async () => yanit(API_BODY) });
    const p = await vm.runInContext('refreshRates()', context);
    check('kaynak', p.source, 'frankfurter');
    check('TRY kuru', p.rates.TRY, 54.58);
    check('EUR tabanı eklendi', p.rates.EUR, 1);
    check('storage yazıldı', store.rates.rates.TRY, 54.58);
  }

  console.log('\n--- 2. taze önbellek varsa API çağrılmaz ---');
  {
    let cagrildi = 0;
    const taze = { rates: { EUR: 1, TRY: 50 }, fetchedAt: Date.now(), source: 'frankfurter' };
    const { context } = kur({
      store: { rates: taze },
      fetchImpl: async () => { cagrildi++; return yanit(API_BODY); },
    });
    const p = await vm.runInContext('refreshRates()', context);
    check('fetch çağrılmadı', cagrildi, 0);
    check('önbellek döndü', p.rates.TRY, 50);
  }

  console.log('\n--- 3. API çökerse ---');
  {
    // 3a: önbellek varsa bayat olan döner
    const bayat = { rates: { EUR: 1, TRY: 40 }, fetchedAt: 0, source: 'frankfurter' };
    const a = kur({ store: { rates: bayat }, fetchImpl: async () => { throw new Error('ağ yok'); } });
    const pa = await vm.runInContext('refreshRates()', a.context);
    check('bayat önbellek döndü', pa.rates.TRY, 40);

    // 3b: önbellek yoksa fallback işareti döner, storage'a YAZILMAZ
    const b = kur({ fetchImpl: async () => { throw new Error('ağ yok'); } });
    const pb = await vm.runInContext('refreshRates()', b.context);
    check('kaynak fallback', pb.source, 'fallback');
    check('rates null', pb.rates, null);
    check('storage kirletilmedi', b.store.rates, undefined);
  }

  console.log('\n--- 4. HTTP hatası ve eksik veri ---');
  {
    const a = kur({ fetchImpl: async () => ({ ok: false, status: 503, json: async () => ({}) }) });
    check('503 -> fallback', (await vm.runInContext('refreshRates()', a.context)).source, 'fallback');

    const b = kur({ fetchImpl: async () => yanit({ rates: { GBP: 0.85 } }) });
    check('TRY eksik -> fallback', (await vm.runInContext('refreshRates()', b.context)).source, 'fallback');
  }

  console.log('\n--- 5. kurulum kancaları ---');
  {
    const { kayitli } = kur({ fetchImpl: async () => yanit(API_BODY) });
    kayitli.onInstalled();
    check('alarm kuruldu', kayitli.alarms[0].name, 'ivd-refresh-rates');
    check('alarm periyodu (dk)', kayitli.alarms[0].opts.periodInMinutes, 720);
    check('mesaj dinleyici var', typeof kayitli.mesajDinleyici, 'function');
    check('async yanıt için true', kayitli.mesajDinleyici({ type: 'ivd:refreshRates' }, null, () => {}), true);
    check('alakasız mesaja false', kayitli.mesajDinleyici({ type: 'baska' }, null, () => {}), false);
  }

  console.log('\n--- 6. tazeleme sıklığı: alarm ile önbellek ömrü aynı faza bağlı ---');
  {
    // Alarm tetiklendiğinde önbellek "12 saat eksi ağ gecikmesi" yaşında olur.
    // Eski kod bunu taze sayıp atlıyor ve tazeleme 18. saate kayıyordu.
    let cagrildi = 0;
    const neredeyse12 = { rates: { EUR: 1, TRY: 50 }, fetchedAt: Date.now() - (12 * 3600e3 - 250), source: 'frankfurter' };
    const { kayitli } = kur({
      store: { rates: neredeyse12 },
      fetchImpl: async () => { cagrildi++; return yanit(API_BODY); },
    });
    kayitli.onAlarm({ name: 'ivd-refresh-rates' });
    await new Promise((r) => setTimeout(r, 5));
    check('alarm yaş kontrolüne takılmadan çekti', cagrildi, 1);

    // Açılış yolu ise taze önbelleğe dokunmaz.
    let acilis = 0;
    const taze = { rates: { EUR: 1, TRY: 50 }, fetchedAt: Date.now() - 3600e3, source: 'frankfurter' };
    const b = kur({ store: { rates: taze }, fetchImpl: async () => { acilis++; return yanit(API_BODY); } });
    b.kayitli.onStartup();
    await new Promise((r) => setTimeout(r, 5));
    check('açılışta taze önbellek korunur', acilis, 0);

    // Alarm da 1 saatlik önbelleği tekrar çekmez (günde en fazla ~2 istek).
    b.kayitli.onAlarm({ name: 'ivd-refresh-rates' });
    await new Promise((r) => setTimeout(r, 5));
    check('alarm taze önbelleği yeniden çekmez', acilis, 0);

    // Açılışta kaçırılmış alarm + onStartup aynı anda: tek istek.
    let cift = 0;
    const bayat = { rates: { EUR: 1, TRY: 40 }, fetchedAt: 0, source: 'frankfurter' };
    const c = kur({ store: { rates: bayat }, fetchImpl: async () => { cift++; return yanit(API_BODY); } });
    c.kayitli.onStartup();
    c.kayitli.onAlarm({ name: 'ivd-refresh-rates' });
    await new Promise((r) => setTimeout(r, 5));
    check('eşzamanlı açılış+alarm tek istek', cift, 1);
  }

  console.log(fail === 0 ? '\nHepsi geçti.' : `\n${fail} test başarısız.`);
  process.exitCode = fail ? 1 : 0;
})();
