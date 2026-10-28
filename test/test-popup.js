/**
 * popup.js için test: "Giderlerin ve grafik →" düğmesi bekleyen kaydı
 * Giderler sayfası açılmadan önce yazıyor mu?
 *
 * Maaş/saat/gün alanları 500 ms gecikmeyle kaydediliyor (saveLater). Kullanıcı
 * yazıp hemen düğmeye basarsa Giderler sayfası storage'dan eski değeri
 * okuyordu. Sahte DOM + sahte chrome.* ile gerçek popup.js ve money.js
 * yüklenir; i18n yalnız anahtar döndüren bir saplamadır.
 *
 *   node test/test-popup.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = path.join(__dirname, '..', 'src');
const read = (p) => fs.readFileSync(path.join(SRC, p), 'utf8');

let fail = 0;
const check = (label, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) fail++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label} → ${JSON.stringify(actual)}${ok ? '' : `  (beklenen: ${JSON.stringify(expected)})`}`);
};

const tick = () => new Promise((resolve) => setImmediate(resolve));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class FakeElement {
  constructor(id) {
    this.id = id;
    this.value = '';
    this.checked = false;
    this.hidden = false;
    this.disabled = false;
    this.textContent = '';
    this.dataset = {};
    this.children = [];
    this.selectionStart = null;
    this.listeners = {};
    this.classList = { toggle() {}, add() {}, remove() {} };
  }
  addEventListener(type, fn) {
    (this.listeners[type] ||= []).push(fn);
  }
  dispatch(type) {
    for (const fn of this.listeners[type] || []) fn({ type, target: this });
  }
  appendChild(child) {
    this.children.push(child);
  }
  setAttribute() {}
  setSelectionRange() {}
  focus() {}
}

/**
 * `set` her çağrıda kayda geçer ve ne zaman biteceğini test belirler:
 * 'resolve' (hemen), 'defer' (test elle bitirir), 'reject', 'hang' (hiç bitmez).
 */
async function kur({ mode = 'resolve', saved = {} } = {}) {
  const log = [];
  const pending = [];
  const elements = new Map();
  const windowListeners = {};
  const docListeners = {};

  const document = {
    documentElement: { dataset: {}, lang: '' },
    visibilityState: 'visible',
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, new FakeElement(id));
      return elements.get(id);
    },
    createElement: (tag) => new FakeElement(tag),
    querySelectorAll: () => [],
    addEventListener(type, fn) {
      (docListeners[type] ||= []).push(fn);
    },
  };

  const chrome = {
    storage: {
      sync: {
        get: async (defaults) => ({ ...defaults, ...saved }),
        set(patch) {
          log.push(['set', patch]);
          if (mode === 'resolve') return Promise.resolve();
          if (mode === 'reject') return Promise.reject(new Error('QUOTA_BYTES_PER_ITEM'));
          return new Promise((resolve) => {
            if (mode === 'defer') pending.push(resolve);
          });
        },
      },
      local: { get: async () => ({}) },
    },
    tabs: {
      query: async () => [{ id: 1, url: 'https://www.zappos.com/sneakers' }],
      sendMessage() {},
    },
    runtime: {
      lastError: null,
      sendMessage() {},
      openOptionsPage() {
        log.push(['openOptionsPage']);
      },
    },
  };

  const IVDi18n = {
    t: (key) => key,
    lang: () => 'en',
    numberLocale: () => 'en-US',
    localizePage() {},
  };

  const sandbox = {
    chrome, document, IVDi18n, console,
    localStorage: { setItem() {}, getItem: () => null },
    setTimeout, clearTimeout, Promise, Number, Object, Set, URL, Date, Math,
    addEventListener(type, fn) {
      (windowListeners[type] ||= []).push(fn);
    },
  };
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;

  const context = vm.createContext(sandbox);
  vm.runInContext(read('lib/money.js'), context, { filename: 'money.js' });
  vm.runInContext(read('popup.js'), context, { filename: 'popup.js' });

  const el = (id) => document.getElementById(id);
  // popup.js async IIFE; dinleyiciler storage okumalarından sonra bağlanıyor.
  for (let i = 0; i < 50 && !el('openOptions').listeners.click; i++) await tick();
  if (!el('openOptions').listeners.click) throw new Error('openOptions dinleyicisi bağlanmadı');

  return {
    log,
    pending,
    el,
    typeSalary(text) {
      el('salary').value = text;
      el('salary').selectionStart = text.length;
      el('salary').dispatch('input');
    },
    clickOptions: () => el('openOptions').dispatch('click'),
    pagehide: () => (windowListeners.pagehide || []).forEach((fn) => fn({ type: 'pagehide' })),
  };
}

const sets = (log) => log.filter(([kind]) => kind === 'set').map(([, patch]) => patch);
const opens = (log) => log.filter(([kind]) => kind === 'openOptionsPage').length;

(async () => {
  console.log('--- maaşı yaz, 500 ms dolmadan Giderler ---');
  {
    const p = await kur({ mode: 'defer' });
    p.typeSalary('5,000');
    check('yazınca hemen kayıt yok (500 ms gecikme)', sets(p.log), []);
    p.clickOptions();
    await tick();
    check('tıklayınca bekleyen kayıt yazıldı', sets(p.log), [{ salary: 5000 }]);
    check('yazma bitmeden sayfa açılmadı', opens(p.log), 0);
    p.pending.forEach((resolve) => resolve());
    await tick();
    await tick();
    check('yazma bitince sayfa açıldı', opens(p.log), 1);
    check('sıra: önce set, sonra openOptionsPage', p.log.map(([kind]) => kind), ['set', 'openOptionsPage']);
    await sleep(600);
    p.pagehide();
    check('zamanlayıcı/pagehide ikinci kez yazmadı', sets(p.log).length, 1);
  }

  console.log('\n--- bekleyen kayıt yok ---');
  {
    const p = await kur({ mode: 'resolve', saved: { salary: 5000 } });
    p.clickOptions();
    await tick();
    check('set çağrılmadı', sets(p.log), []);
    check('sayfa açıldı', opens(p.log), 1);
  }

  console.log('\n--- birden çok alan birlikte ---');
  {
    const p = await kur({ mode: 'resolve' });
    p.typeSalary('5,000');
    p.el('hoursPerDay').value = '8';
    p.el('hoursPerDay').dispatch('input');
    p.el('daysPerMonth').value = '22';
    p.el('daysPerMonth').dispatch('input');
    p.clickOptions();
    await tick();
    await tick();
    check('tek yazmada üç alan', sets(p.log), [{ salary: 5000, hoursPerDay: 8, daysPerMonth: 22 }]);
    check('sayfa açıldı', opens(p.log), 1);
  }

  console.log('\n--- yazma başarısız ---');
  {
    const p = await kur({ mode: 'reject' });
    p.typeSalary('5,000');
    p.clickOptions();
    await tick();
    await tick();
    check('hata olsa da sayfa açıldı', opens(p.log), 1);
  }

  console.log('\n--- yazma hiç dönmüyor (Safari bulgu G benzeri) ---');
  {
    const p = await kur({ mode: 'hang' });
    p.typeSalary('5,000');
    p.clickOptions();
    await sleep(100);
    check('100 ms: henüz açılmadı (bekliyor)', opens(p.log), 0);
    await sleep(1100);
    check('süre sınırı sonrası açıldı, düğme ölü kalmadı', opens(p.log), 1);
  }

  console.log('\n--- eski davranış korunuyor ---');
  {
    const p = await kur({ mode: 'resolve' });
    p.typeSalary('5,000');
    await sleep(600);
    check('500 ms sonra kendiliğinden yazıldı', sets(p.log), [{ salary: 5000 }]);
    p.typeSalary('6,000');
    p.pagehide();
    check('pagehide bekleyeni yazdı', sets(p.log), [{ salary: 5000 }, { salary: 6000 }]);
    p.typeSalary('7,000');
    p.el('salary').dispatch('blur');
    check('blur bekleyeni yazdı', sets(p.log).at(-1), { salary: 7000 });
  }

  console.log(fail ? `\n${fail} test başarısız` : '\nhepsi geçti');
  process.exit(fail ? 1 : 0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
