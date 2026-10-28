/* Sahne verisi. Kırpım kutuları [x, y, w, h] ham görüntünün CSS pikseli cinsinden
   (ham piksel / dsf). Ham kareler: store/raw/<dil>/<cihaz>/ — README'de URL ve saat.
   Başlık/alt yazıdaki her rakam ilgili ham karede görünür (meta.json "chips" ve
   "note" alanlarından okundu); uydurma rakam yok. */
window.DEVICES = {
  // set: tuval (CSS px), ölçek, çerçeve türü
  cws:    { W: 1280, H: 800,  u: 1,    pad: 64, padT: 40, h1: 42, sub: 18, gap: 22, r: 12, rc: 12, bezel: 0,  tag: 13, step: 22, stepW: 520, ruleGap: 32, frame: 'card' },
  mac:    { W: 1440, H: 900,  u: 1.12, pad: 80, padT: 48, h1: 48, sub: 20, gap: 26, r: 14, rc: 14, bezel: 0,  tag: 14, step: 24, stepW: 560, ruleGap: 36, frame: 'card' },
  iphone: { W: 402,  H: 874,  u: 0.62, pad: 22, padT: 40, h1: 29, sub: 12.5, gap: 18, r: 30, rc: 14, bezel: 7, tag: 10, step: 15, stepW: 300, ruleGap: 22, frame: 'device' },
  ipad:   { W: 1032, H: 1376, u: 1.35, pad: 64, padT: 64, h1: 60, sub: 23, gap: 34, r: 26, rc: 18, bezel: 14, tag: 17, step: 30, stepW: 420, ruleGap: 40, frame: 'device' }
};

// Ham karenin CSS boyutu (cihaz sınıfına göre)
window.RAWSIZE = { desktop: [1280, 800], iphone: [402, 874], ipad: [1032, 1376], panel: [300, 564] };

const T = {
  tr: {
    lang: 'tr',
    off: 'Eklenti kapalı', on: 'Eklenti açık', before: 'Önce', after: 'Süreye tıklayınca',
    s1: 'Fiyatı değil, kaç saat çalışacağını gör',
    s1sub: 'Örnek maaş: 50.000 TL · günde 8 saat · ayda 22 gün<br><s>1.675,09 TL</s> → <b>5,9 saat</b>',
    s2: 'Aynı sayfa: eklenti kapalı, eklenti açık',
    s2subWide: '<s>933,40 TL</s> → <b>3,3 saat</b> · <s>830,70 TL</s> → <b>2,9 saat</b>',
    s2subNarrow: '<s>3.103,07 TL</s> → <b>1,4 gün</b> · <s>1.675,09 TL</s> → <b>5,9 saat</b>',
    s3: 'Süreye tıkla, fiyat geri gelsin',
    s3sub: '<b>7 saat</b> → 1.999,99 TL · bir daha tıkla, yine süre',
    s4: 'Üç alan yeter: maaş, saat, gün',
    s4sub: 'Bir saatin ≈ ₺284,09 · bir mesai ≈ ₺2.272,73',
    steps: [
      ['Aylık net maaşın', '50.000 · ₺ TRY'],
      ['Günde kaç saat', '8 saat / gün'],
      ['Ayda kaç gün', '22 gün / ay']
    ],
    result: ['Bir saatin ≈ ₺284,09', 'bir mesai ≈ ₺2.272,73'],
    s5: 'Giderlerin ayının kaç gününü alıyor?',
    s5sub: 'Kira <b>7,9 gün</b> · sana kalan <b>13 gün</b> (22 günlük mesai)'
  },
  en: {
    lang: 'en',
    off: 'Extension off', on: 'Extension on', before: 'Before', after: 'After a click',
    s1: 'See the hours, not the price',
    s1sub: 'Sample pay: $5,000/mo · 8 h/day · 22 days<br><s>$39.99</s> → <b>1.4 hours</b>',
    s1subIpad: 'Sample pay: $5,000/mo · 8 h/day · 22 days<br><s>$59.99</s> → <b>2.1 hours</b>',
    s2: 'Same page, extension off and on',
    s2subWide: '<s>$59.99</s> → <b>2.1 hours</b> · <s>$24.99</s> → <b>53 min</b>',
    s2subIphone: '<s>$19.99</s> → <b>42 min</b>',
    s2subIpad: '<s>$29.99</s> → <b>1.1 hours</b> · <s>$19.99</s> → <b>42 min</b>',
    s3: 'Click a time to see the price',
    s3sub: '<b>1.4 hours</b> → $39.99 · click again for the time',
    s3subIpad: '<b>2.1 hours</b> → $59.99 · tap again for the time',
    s4: 'Three fields: pay, hours, days',
    s4sub: 'One hour of your work ≈ $28.41 · one workday ≈ $227.27',
    steps: [
      ['Monthly take-home pay', '5,000 · $ USD'],
      ['Hours a day', '8 hrs / day'],
      ['Days a month', '22 days / mo']
    ],
    result: ['One hour ≈ $28.41', 'one workday ≈ $227.27'],
    s5: 'See how many days your bills take',
    s5sub: 'Rent <b>6.6 days</b> · left for you <b>15 days</b> (22-day work month)'
  }
};

// Dokunmatik cihazlarda "tıkla" yerine "dokun" (Apple seti)
const TOUCH = {
  tr: { s3: 'Süreye dokun, fiyat geri gelsin', s3sub: '<b>7 saat</b> → 1.999,99 TL · bir daha dokun, yine süre', after: 'Süreye dokununca' },
  en: { s3: 'Tap a time to see the price', s3sub: '<b>1.4 hours</b> → $39.99 · tap again for the time', after: 'After a tap' }
};

const raw = (lang, dev, n) => `../../raw/${lang}/${dev}/${n}.png`;
const F = { on: '01-eklenti-acik', off: '02-eklenti-kapali', click: '03-cipe-tiklandi', panel: '04-ayar-paneli', exp: '05-giderler-halka' };

window.buildScenes = function (set, lang) {
  let t = { ...T[lang] };
  if (set === 'iphone' || set === 'ipad') t = { ...t, ...TOUCH[lang] };
  const d = set === 'cws' || set === 'mac' ? 'desktop' : set;
  const R = n => raw(lang, d, F[n]);
  const S = [];
  const big = set === 'mac';

  // Kırpımlar (cihaza ve dile göre)
  const C = {
    cws: {
      tr: {
        s1: [255, 125, 990, 632], s1W: 880,
        s2: [755, 280, 485, 470], s2W: 540,
        s3: [665, 130, 580, 125], s3W: 1100, s3mark: [87, 75, 68, 22],
        s5: [200, 24, 880, 466], s5W: 1100
      },
      en: {
        s1: [340, 300, 900, 480], s1W: 1050,
        s2: [780, 345, 460, 440], s2W: 540,
        s3: [345, 50, 680, 105], s3W: 1100, s3mark: [230, 64, 58, 26],
        s5: [200, 24, 880, 466], s5W: 1100
      }
    },
    mac: {
      // Apple 2.3.9: site ve satıcı logoları kırpım dışında (TR üst afiş/satıcı logosu yok)
      tr: {
        s1: [250, 280, 1000, 480], s1W: 1240,
        s2: [755, 280, 485, 470], s2W: 600,
        s3: [665, 130, 580, 125], s3W: 1240, s3mark: [87, 75, 68, 22],
        s5: [200, 24, 880, 466], s5W: 1240
      },
      en: {
        s1: [340, 300, 900, 480], s1W: 1240,
        s2: [780, 345, 460, 440], s2W: 600,
        s3: [345, 50, 680, 105], s3W: 1240, s3mark: [230, 64, 58, 26],
        s5: [200, 24, 880, 466], s5W: 1240
      }
    },
    iphone: {
      tr: {
        s1: [0, 305, 402, 530], s1W: 352,
        s2: [0, 600, 402, 235], s2W: 352,
        s3: [0, 313, 280, 120], s3W: 352, s3mark: [98, 64, 60, 22],
        s5: [0, 0, 402, 874], s5W: 300
      },
      en: {
        s1: [0, 90, 402, 784], s1W: 352,
        s2a: [150, 95, 252, 95], s2b: [150, 455, 252, 95], s2W: 352,
        s3: [150, 455, 252, 95], s3W: 352, s3mark: [68, 59, 52, 23],
        s5: [0, 0, 402, 874], s5W: 300
      }
    },
    ipad: {
      tr: {
        s1: [0, 860, 700, 480], s1W: 900,
        s2: [0, 1225, 700, 110], s2W: 900,
        s3: [10, 355, 680, 120], s3W: 900, s3mark: [88, 50, 66, 24],
        s5: [0, 0, 1032, 760], s5W: 900
      },
      en: {
        s1: [336, 90, 650, 780], s1W: 900,
        s2: [336, 610, 430, 250], s2W: 700,
        s3: [336, 108, 650, 95], s3W: 900, s3mark: [222, 46, 72, 26],
        s5: [0, 0, 1032, 760], s5W: 900
      }
    }
  }[set][lang];

  // EN masaüstü ve iPad kırpımında FORSÅ yok: RANARP ($59.99 → 2.1 hours) ve SKURUP/FADO kullanılır
  const enRow2 = lang === 'en' && set !== 'iphone';
  const sub1 = enRow2 ? t.s1subIpad : t.s1sub;
  S.push({ title: t.s1, sub: sub1, layout: 'single', shots: [{ src: R('on'), dev: d, crop: C.s1, w: C.s1W }] });

  let sub2 = t.s2subWide;
  if (lang === 'tr' && (set === 'iphone' || set === 'ipad')) sub2 = t.s2subNarrow;
  if (lang === 'en' && set === 'iphone') sub2 = t.s2subIphone;
  if (enRow2) sub2 = t.s2subIpad;
  if (set === 'cws' || set === 'mac') {
    S.push({ title: t.s2, sub: sub2, layout: 'pair', shots: [
      { src: R('off'), dev: d, crop: C.s2, w: C.s2W, tag: ['off', t.off] },
      { src: R('on'), dev: d, crop: C.s2, w: C.s2W, tag: ['on', t.on] }
    ] });
  } else if (C.s2a) {
    // EN iPhone: iki ürün (TERTIAL, FORSÅ), her biri kapalı/açık — 4 kırpım yerine 2×2 değil, iki satır
    S.push({ title: t.s2, sub: sub2, layout: 'stack', shots: [
      { src: R('off'), dev: d, crop: C.s2a, w: C.s2W, tag: ['off', t.off] },
      { src: R('on'), dev: d, crop: C.s2a, w: C.s2W, tag: ['on', t.on] }
    ] });
  } else {
    S.push({ title: t.s2, sub: sub2, layout: 'stack', shots: [
      { src: R('off'), dev: d, crop: C.s2, w: C.s2W, tag: ['off', t.off] },
      { src: R('on'), dev: d, crop: C.s2, w: C.s2W, tag: ['on', t.on] }
    ] });
  }

  const sub3 = lang === 'en' && set === 'ipad' ? t.s3subIpad : t.s3sub;
  S.push({ title: t.s3, sub: sub3, layout: 'stack', shots: [
    { src: R('on'), dev: d, crop: C.s3, w: C.s3W, tag: ['on', t.before] },
    { src: R('click'), dev: d, crop: C.s3, w: C.s3W, tag: ['off', t.after], mark: C.s3mark }
  ] });

  // Panel: masaüstü (CWS) için masaüstü çekimi; Apple setinde @3x iPhone çekimi (aynı popup.html, daha keskin)
  const panelSrc = set === 'cws' ? raw(lang, 'desktop', F.panel) : raw(lang, 'iphone', F.panel);
  const panelW = { cws: 300, mac: 360, iphone: 290, ipad: 450 }[set];
  S.push({ title: t.s4, sub: t.s4sub, layout: 'panel', steps: set === 'iphone' ? null : t.steps, result: t.result,
    shots: [{ src: panelSrc, dev: 'panel', crop: [0, 0, 300, 564], w: panelW }] });

  S.push({ title: t.s5, sub: t.s5sub, layout: 'single', shots: [{ src: R('exp'), dev: d, crop: C.s5, w: C.s5W }] });
  return S;
};
