# IncomeVsDesires — mimari haritasi

Chrome uzantisi: internetteki fiyatlari, kullanicinin maasina gore "kac saat calismak
gerek"e cevirir. Cati yok, derleme adimi yok, TypeScript yok — duz JavaScript.

## Yapi

- `manifest.json` — **repo kokunde**, `src/` icinde degil. Manifest V3.
  - `permissions`: `storage`, `alarms`, `activeTab`
  - `host_permissions`: yalniz kur kaynaklari — `https://api.frankfurter.dev/*`
    (ana; eski `api.frankfurter.app` 2026-10'da 301 ile `.dev/v1`'e tasindi),
    yedekler `https://open.er-api.com/*` ve `https://cdn.jsdelivr.net/*`
    (fawazahmed0 currency-api). Hepsi anahtarsiz, `ACAO: *` (curl, 2026-10-24).
  - `content_scripts`: `<all_urls>`, `document_idle`; mail/docs/drive/calendar,
    Slack, Notion, Figma, GitHub ve 4 banka `exclude_matches` ile disarida.
- `src/background.js` — service worker; `chrome.alarms` (24 saat) + `fetch`, `storage.local`
  onbellegi. `SOURCES` sirayla denenir (frankfurter -> er-api -> currency-api, her biri
  8 sn zaman asimi); hepsi duserse bayat onbellek `stale: true` ile, o da yoksa
  `source: "none"` doner. Koda gomulu yedek kur tablosu YOK (2026-10-24'te
  `FALLBACK_RATES` kaldirildi): yedek = son basarili cekim; hic cekim yoksa doviz
  cevrilmez (`IVD.convert` null), ayni birim calisir.
- Ayarlar (`IVD.DEFAULT_SETTINGS`): `basis` ('salary'|'leftover', `IVD.effectiveRate`),
  `display` ('time'|'both'), `dayUnit` ('shift'|'calendar', yalniz sure yazimi,
  `unitLengths`). Saatlik kazanc her zaman mesaiden (`shiftLengths`).
- `src/content.js` — MutationObserver + adres izleyici, dinamik sayfa takibi.
- `src/popup.*`, `src/options.*` — arayuz; `options_ui` tam sayfa acilir.
- `src/lib/money.js` — para/kur donusumleri. Kurlar EUR bazli tutulur.
- `site/` — tanitim sitesi ve blog (`build.js`, `posts.json`, `sitemap.xml`).
- `test/` — onizleme/derleme yardimcilari ve demo sayfalari.

## Calistirma

Chrome → `chrome://extensions` → Developer mode → "Load unpacked" → repo koku.
Site icin: `node site/build.js`.

## Safari (yerel gelistirici modu — ilk dogrulama, 2026-10-23)

- `safari/IncomeVsDesires/` — `safari-web-extension-converter` ciktisi (Xcode 27.0,
  Safari 27.0, macOS 27.0). `--copy-resources` YOK: proje kokteki `manifest.json` ve
  `src/`'ye **referans** verir; Chrome ve Safari ayni kaynagi kullanir, kopya yok.
  Donusturucunun ekledigi docs/site/test/*.md referanslari pbxproj'dan cikarildi;
  uzanti paketi yalniz `manifest.json` + `src/` icerir.
- Derleme (imzasiz/ad-hoc, DerivedData repo disinda):
  `cd safari/IncomeVsDesires && xcodebuild -scheme IncomeVsDesires -configuration Debug
  -derivedDataPath $TMPDIR/ivd-dd CODE_SIGN_IDENTITY=- CODE_SIGN_STYLE=Manual
  DEVELOPMENT_TEAM= build` → .app bir kez acilir → Safari > Gelistir > "Imzasiz
  Uzantilara Izin Ver" → Ayarlar > Uzantilar > IncomeVsDesires'i ac.
- Donusturucu uyarilari: ikon yok (manifest'te `icons` tanimsiz -> arac cubugunda
  varsayilan ikon); `open_in_tab`: Safari options sayfasini HER ZAMAN ayri sekmede
  acar (MDN BCD), yani `true` ile ayni davranis — zararsiz uyari.
- Polyfill eklenmedi; gercek Safari hatasi gorulmeden eklenmeyecek.

### Headless dogrulama (2026-10-23, ekran kilitliyken — GUI gerektirmeyen)

- `xcodebuild -scheme IncomeVsDesires` iki sekilde: varsayilan ("Sign to Run
  Locally") ve ad-hoc `clean build` -> ikisi de `** BUILD SUCCEEDED **`, hata yok
  (yalniz AppIntents "metadata extraction skipped" uyarisi).
- `codesign --verify --deep --strict` OK (Signature=adhoc). Paketteki `src/` ve
  `manifest.json` repodakiyle birebir (`diff -rq`, `cmp`).
- `pluginkit`: `com.hamarat52.IncomeVsDesires.Extension` Safari web-extension olarak
  kayitli (Path = DerivedData'daki .appex).
- `node test/test-money.js` (52 ok) ve `node test/test-background.js` (25 ok) ->
  "Hepsi gecti". Google Chrome 155.0.8059.86 headless; eklenti CDP
  `Extensions.loadUnpacked` ile yuklendi (`--remote-debugging-pipe
  --enable-unsafe-extension-debugging`; branded Chrome `--load-extension`'i yok
  sayiyor). `test/demo.html`'de 18 `.ivd-chip` olustu; duzeltme oncesi (HEAD) ve
  sonrasi ayni -> Chrome regresyonu yok. (Ilk raporda "13" yaziyordu: `grep -c`
  satir sayiyordu, 13 satirda 18 cip vardi.)

### Kur API adresi (duzeltildi, 2026-10-23)

- `api.frankfurter.app/latest` -> `HTTP 301` -> `api.frankfurter.dev/v1/latest`;
  301 yanitinda `Access-Control-Allow-Origin` yok, `.dev` yanitinda `*` var (curl,
  `Origin: chrome-extension://x` ve `safari-web-extension://x`).
- `src/background.js` `API_URL` ve `manifest.json` `host_permissions` dogrudan
  `https://api.frankfurter.dev/v1/...` / `https://api.frankfurter.dev/*` yapildi;
  test, istenen URL'in host'unun manifest izninde oldugunu denetliyor.
- Chrome 155'te service worker'a CDP ile baglanip `refreshRates(true)` cagrildi:
  - Duzeltme ONCESI (HEAD): `.app` -> 301 -> `.dev` 200, `source: "frankfurter"`.
    Yani Chrome'da eski surum yonlendirmeyi takip edip gercek kuru CEKEBILIYORDU;
    canli eklentide kirilma yeniden URETILEMEDI. Risk: Frankfurter yonlendirmeyi
    kaldirirsa ya da tarayici cross-origin redirect'i reddederse yedege duser.
  - Duzeltme SONRASI: dogrudan `.dev/v1` 200, yonlendirme yok,
    `source: "frankfurter"`, `rates: {EUR:1, GBP:0.8377, TRY:55.6079, USD:1.1205}`
    (ECB 2026-10-22; curl ile ayni degerler, yedek tablo degil).

### Safari API uyumlulugu (arastirma — CALISTIRILARAK DOGRULANMADI)

Kaynaklar: Apple "Assessing your Safari web extension's browser compatibility" [A],
Apple "Optimizing your web extension for Safari" [O], MDN browser-compat-data [M],
WebKit kaynak kodu (IDL) [W], Safari surum notlari [R].

| API / anahtar | Safari'den beri | Not |
|---|---|---|
| MV3 + `background.service_worker` | 15.4 [A][M] | MV3'te tum arka planlar kalici degil; service worker desteklenir, kalici sayfa GEREKMEZ [O]. Dinleyiciler ust duzeyde olmali, zamanlayici yerine alarms [O] — background.js buna uyuyor. SW `fetch` CORS hatasi 16.4'te duzeldi [R16.4]. |
| `chrome.*` namespace + Promise | 15.4 (MV3) | Apple: `chrome.*` ve `browser.*` ikisi de, callback ve Promise ikisi de desteklenir [A]. WebKit'te `chrome` = `browser` ayni nesne, IDL'ler `ReturnsPromiseWhenCallbackIsOmitted` [W]. |
| `storage.local/sync/onChanged` | 14 [M] | `storage.sync` calisir ama cihazlar arasi SENKRON YOK, `local` gibi davranir [A][M]. Yerel limit 5 MB [A]. |
| `alarms.create/onAlarm` | 14 [M] | Yalniz ana dunya (background) [W] — kod yalniz background.js'te kullaniyor. |
| `tabs.query`, `tabs.sendMessage` | 14 [M] | `tab.url` icin site (host) izni gerekir [A]. |
| `runtime.sendMessage/onMessage` | 14 [M] | `lastError` yalniz callback ile set edilir [M]; `lastError`/`openOptionsPage` yalniz ana dunya [W] (popup ana dunya — sorun degil). |
| `runtime.onInstalled/onStartup` | 14 [M] | Safari 26.2 oncesi `onInstalled` her acilista tetikleniyordu [R26.2]; Safari 27'de duzeltilmis. |
| `action`, `host_permissions` | 15.4 [M] | — |
| `content_scripts` (+exclude_matches, css) | 14 [M] | Kullanici arac cubugundan site izni vermeden sekmeye ENJEKTE EDILMEZ [M]. |

### Statik risk listesi (yalniz dokumana gore tahmin)

1. `src/popup.js:127-134` `currentHost()` -> `tab.url`: Safari'de site izni yoksa
   `url` bos gelir -> "bu sitede kapat" dugmesi gizlenir (`popup.js:86`). [A]
2. `src/popup.js:106` `tabs.sendMessage`: site izni verilmemisse content script yok
   -> "Bu sayfada calismiyor". Hata degil, Safari izin modeli. [M]
3. Kur fetch'i (`src/background.js`, `API_URL`): duzeltmeden sonra yonlendirme yok,
   hedef `.dev` `ACAO: *` donuyor. Safari `host_permissions`'i kullaniciya
   sorar; izin verilmese bile `ACAO: *` sayesinde istek gecmeli — Safari'de
   DOGRULANMADI. Hata olursa son basarili kurlar + panel uyarisi.
4. `storage.sync` senkron olmuyor: `popup.js:37-39` yorumundaki "baska cihazda
   degistirilmisse" senaryosu Safari'de olusmaz. Fonksiyonel sorun degil.
5. Ikon yok: Safari arac cubugu/ayarlarda genel ikon; app `AppIcon` bos. Kozmetik.
6. Desteklenmeyen API cagrisi BULUNMADI: kodda `identity`, `webRequest`,
   `setUninstallURL`, `tabs.move` vb. [A]'nin kisitli listesinden hicbiri yok.

### GERCEKTEN DOGRULANMADI (GUI gerekiyor, ekran kilidi nedeniyle YAPILMADI)

1. Gercek sayfada fiyat donusumu (content script) + ekran goruntusu
2. Popup: maas/saat ayarinin kaydi (`storage.sync`) ve sayfaya yansimasi
3. Options sayfasi ve grafik
4. Alarm + kur yenileme (service worker uyanmasi, frankfurter fetch)
5. "Sayfayi yeniden tara" ve "bu sitede kapat" dugmeleri

Yukaridaki uyumluluk tablosu bu bes testin yerini TUTMAZ.

### Safari GUI dogrulamasi (2026-10-28)

**Gunduz (10:00-16:00):** ekran kilitliydi, GUI dogrulamasi yapilamadi. **Aksam
(21:00-23:25, MobileDev):** ekran acikti (`IOConsoleLocked = false`); asagidaki "Gercek
Safari gozlemleri" bolumune bakin. Ham kareler ve kanitlar: `store/raw-safari/README.md`.

#### Gercek Safari gozlemleri (2026-10-28 aksam)

Ortam: macOS 27.0 + Safari 27.0; iOS 27.0 simulator (iPhone 18 Pro). macOS'ta masaustu
girdisi (tiklama/tus) bu oturumda onaysiz calisamadi -> macOS'ta yalniz pasif gozlem.
iOS'ta girdi simulatorun ICINDE XCUITest ile verildi (repoda degil, scratch'te).

| Konu | Sonuc | Kanit (`store/raw-safari/...`) |
|---|---|---|
| macOS: Development imzali Debug build Safari'de gorunuyor mu | **Evet**: host app "IncomeVsDesires is currently on"; Safari kapaliyken yeniden baslatildi, arac cubugunda uzanti dugmesi var | `_kanit/mac-tr-arac-cubugu-simgesi-uyari.png` |
| macOS: "Imzasiz uzantilara izin ver" gerekli mi | **Gerekmedi** (Apple Development imzasi; Safari bu ayari her acilista sifirlar, yeni acilan Safari'de uzanti yuklu). Gelistir menusune dokunulmadi | ayni |
| macOS: site izni olmadan content script | **Enjekte edilmiyor**: Trendyol'da fiyatlar TL, simgede turuncu uyari rozeti (izin bekliyor). Izin verme tiklama ister -> yapilamadi | `_kanit/mac-tr-trendyol-site-izni-yok.png` |
| iOS: uzantiyi acma + "Diger Web Siteleri: Izin Ver" | **Calisti** (Ayarlar > Uygulamalar > Safari > Genisletmeler) | `_kanit/iphone-tr-ayarlar-*.png` |
| iOS: gercek sayfada cip (TR Trendyol, EN Zappos) | **Calisti** | `iphone/{tr,en}/01-*.png` |
| iOS: popup anahtari Kapali -> fiyatlar geri, Acik -> cipler | **Calisti** (ayni sayfa yuklemesi) | `iphone/{tr,en}/02-*.png` |
| iOS: cipe dokununca fiyat (gezinmeden) | Zappos listesi ve Trendyol urun sayfasinda **calisti**; **Trendyol listesinde dokunus urun sayfasina gitti** (asagida bulgu B) | `iphone/{tr,en}/03*.png`, `_kanit/iphone-tr-cip-dokunma-*.png` |
| iOS: popup maas girisi, saatlik oran, dil | TR **dogru**; EN **yanlis metin** (bulgu A) | `iphone/{tr,en}/04-popup.png` |
| iOS: Giderler sayfasi + halka | TR **calisti** (Kira 18.000 -> 7,9 gun %36); EN bir kez kayitli ayarlari gostermedi (bulgu D) | `iphone/tr/05-*.png`, `_kanit/iphone-en-giderler-sayfasi-ayarlar-bos.png` |
| Dil (TR/EN) | Popup, Ayarlar'daki uzanti aciklamasi, Giderler: simulator diline gore TR/EN **dogru** | yukaridakiler |

Statik risk listesi 1-3, gozleme gore:
1. `tab.url` -> **site izni verilmisken sorun yok**: iOS'ta "www.trendyol.com icin kapat" /
   "Turn off for www.ikea.com" gorundu. Izinsiz durumda popup acilamadi (macOS girdi yok) -> o yari GOZLENMEDI.
2. `tabs.sendMessage` -> **izinle calisiyor**: IKEA US'de "Rescan this page" -> "40 prices converted".
   Izinsiz durumda content script'in hic enjekte edilmedigi macOS'ta goruldu (risk onculu dogru);
   "Bu sayfada calismiyor" yazisi gozlenmedi.
3. Kur fetch'i -> popup "Kurlar guncel (28.10.2026)." / "Exchange rates up to date (10/28/2026)."
   yani bir kaynaktan basarili cekim var. **Hangi kaynak (`source`) okunamadi** (Web Inspector yok).
   "Diger Web Siteleri: Izin Ver" secimi kur alan adlarini da "Izin Ver" yapti; "Sor" durumunda
   fetch denenmedi -> "izinsiz de gecer" kismi GOZLENMEDI.

Bulgular (MobileDev raporu; A ve B sonradan duzeltildi, asagidaki alt maddeler):
- **A (yuksek, EN):** Safari `i18n.getMessage` yer tutucu degisimi ardisik: `rateSalary`
  ("... ≈ $ARG1$ · ... ≈ $ARG2$") EN'de "$227.278.41" uretti (dogrusu $28.41). Aciklama
  (gozleme uyan hipotez): `$1` -> "$28.41" yazildiktan sonra icindeki "$2" ikinci degerle
  ("$227.27") yeniden degistiriliyor. Iki+ yer tutuculu ve degeri "$<rakam>" iceren her mesaj
  etkilenir (USD/CAD/AUD...). Chrome'da yok. TR (₺) etkilenmiyor.
  - *Duzeltme (WebDev, f29044d):* `src/lib/i18n.js` `t()` degerleri getMessage'a `$`'siz
    nobetciyle (U+E000 i U+E001) verip donen metinde kendisi yerlestiriyor. `test/test-i18n.js`
    Safari davranisli sahte getMessage ile tum yer tutuculu mesajlari (EN+TR, USD/TRY) sinar;
    eski kodla 5 FAIL, yeniyle gecer. iOS Safari'de yeniden dogrulanmali (EN 04 karesi).
- **D (incelendi, WebDev):** `options.js`'te yaris kosulu bulunamadi. Karede oran satiri bos ve
  8/22 yer tutucu -> betik `await chrome.storage.sync.get` / `local.get` (options.js:119-126)
  adiminda bekliyordu ya da reddedildi; Safari tarafi, dogrulanmadi. Kod degismedi.
- **B (orta, dokunmatik):** Trendyol mobil listesinde cipe dokunus urun sayfasina gidiyor
  (Chrome'da fare tiklamasi gitmiyordu). Ayni cip urun sayfasinda dogru donuyor; Zappos'ta da dogru.
  - *Duzeltme (WebDev, 9f9b9e8):* dokunulan kart magaza vitrini (`a.seller-store-product-card` >
    `div.css-slider.ios-device`, React `onTouchEnd` -> `stopPropagation`). Chrome mobil oykunmesinde
    (iPhone UA, dokunmatik) hata URETILEMEDI: tiklama cipe geliyor, gezinme yok. Safari'de tiklamanin
    bize hic ulasmadigi ya da cipin disini hedefledigi dusunuluyor (dogrulanmadi). `src/content.js`
    artik cipi `touchend`'de dondurup `touchend`'i iptal ediyor -> tarayici fare olaylari + tiklama
    (link gezinmesi) uretmiyor. Tek parmak, <=10 px, <=700 ms; kaydirma/fare degismedi.
    **iOS Safari'de yeniden dogrulanmali.**
- **C (bilgi):** IKEA US mobil duzende gorunen bolunmus fiyat ("$" + "39" + ".99") cevrilmiyor;
  popup 40 donusum diyor (Chrome mobil emulasyonunda da gorunur 3/40 idi).
- **D (dogrulanmadi):** EN Giderler sayfasi bir kez maas/saat alanlarini bos acti (kayitli
  5,000 USD gelmedi). O dakikada simulator disaridan kesildi; tekrar denenemedi.
- **E (kozmetik):** iPhone'da popup 300 px sabit genislikte; sayfa sag ~100 pt bos.
- **F (kucuk):** Trendyol "814 TL Kupon" etiketi "2,9 saat Kupon"a cevriliyor (indirim tutari).

Gozlenenler (headless, gunduz):
- Uzanti paketi: `--rebuild-project` (1e11b7d) Resources fazina ARCHITECTURE.md,
  LICENSE, README/SEO/MAGAZA md, docs/, site/, test/ ve `safari/` (build/ dahil)
  klasorunu geri eklemisti — Debug .appex Resources 1,7 MB / 11 oge. Duzeltildi
  (8b42e4d): .appex Resources artik yalniz `PrivacyInfo.xcprivacy`, `manifest.json`,
  `src/`; macOS arsivi ve iOS Simulator build'inde `diff -r src` / `cmp manifest.json`
  repo ile birebir.
- Development imzali Debug build (0.1.0) `pluginkit` ile Safari web-extension olarak
  kayitli (Path = `safari/IncomeVsDesires/build/dd-macos/...`).
- Sema adlari artik `IncomeVsDesires (macOS)` / `IncomeVsDesires (iOS)`; yukaridaki
  "Kaldigin yer" komutlarindaki `-scheme IncomeVsDesires` eski adla yazili.
- iOS Simulator (iPhone 18 Pro, iPad Pro 13 M5; iOS 27.0): host app kuruldu ve acildi,
  Turkce acilis metni goruntulendi. Uzanti etkinlestirme GUI gerektirdigi icin
  simulatorde de denenemedi (`simctl`'de uzanti acma komutu yok).

### Kaldigin yer (2026-10-28 23:25 itibariyla acik kalanlar)

Yapilmadi: macOS Safari kareleri/kaydi (masaustu girdisi onay ister), iPad TR/EN,
iPhone EN 05 + EN kayit, `source` dogrulamasi (Web Inspector), "Sor" izniyle kur fetch'i,
bulgu A/B/D'nin kok nedeni.

1. Derleme (28.10'da calisti): `cd safari/IncomeVsDesires && xcodebuild -scheme
   "IncomeVsDesires (macOS)" -configuration Debug -derivedDataPath build/dd-macos
   -allowProvisioningUpdates build` (Apple Development imzasi).
2. `open build/dd-macos/Build/Products/Debug/IncomeVsDesires.app` (bir kez).
3. "Imzasiz Uzantilara Izin Ver" GEREKMEDI (Development imzali). Web Inspector icin
   yine de Gelistir menusu gerekir (ayar degisikligi -> Yusuf onayi).
4. Ayarlar > Uzantilar > IncomeVsDesires zaten acik; arac cubugu simgesinden site izni
   (risk 1-3'u eler; izinsiz durumu da ayrica dene).
5. `python3 -m http.server 8765 --bind 127.0.0.1` -> `http://127.0.0.1:8765/test/demo.html`
   -> 18 cip bekleniyor (Chrome sonucu) + gercek bir magaza sayfasi; ekran goruntusu.
6. Popup ayari, options grafigi, yeniden tara / bu sitede kapat.
7. Gelistir > Web Extension Background Content > konsol: `api.frankfurter.dev`
   fetch'i (risk 3; `chrome.storage.local.get('rates')` -> `source:"frankfurter"`
   olmali) ve `chrome.*` hatalari satir numarasiyla. Hata yoksa polyfill YOK.

Kaynak linkleri:
[A] https://developer.apple.com/documentation/safariservices/assessing-your-safari-web-extension-s-browser-compatibility
[O] https://developer.apple.com/documentation/safariservices/optimizing-your-web-extension-for-safari
[M] https://github.com/mdn/browser-compat-data/tree/main/webextensions
[W] https://github.com/WebKit/WebKit/tree/main/Source/WebKit/WebProcess/Extensions (Interfaces/*.idl, Cocoa/WebExtensionControllerProxyCocoa.mm)
[R16.4] https://developer.apple.com/documentation/safari-release-notes/safari-16_4-release-notes
[R26.2] https://developer.apple.com/documentation/safari-release-notes/safari-26_2-release-notes

## Dikkat

- Dis bagimliliklar yalniz kur kaynaklari: Frankfurter (ECB verisi, ana) + iki yedek
  (open.er-api.com, jsDelivr currency-api; 2026-10-24'te kullanici istegiyle eklendi).
  Baska servis eklemeden once sor; gizlilik sayfalari (TR + EN) ve
  `store/chrome-web-store/shared/gizlilik-sekmesi.md` izin tablosu da guncellenmeli.
- `exclude_matches` listesi bilincli bir gizlilik karari — daraltma veya genisletme
  talebini kullaniciya dogrula.
- Magaza metinleri `store/` altinda (kontrol listesi `store/README.md`), arama notlari `SEO.md`.

## Proje bilgisi kasada

`~/Desktop/OBS/Everything/Projeler/Income vs Desires/`
- `Income vs Desires.md` — ozet ve kararlar
- `Tech.md` — en ayrintili teknik not (manifest, dosya dosya mimari)
- `Roadmap.md`

Kasaya kod yazilmaz. Repo ile kasa celisirse once kullaniciya sor.
Commit, push, PR, merge ve silme kullanici onayi ister.
Genel kurallar: `~/Desktop/Projeler/AGENTS.md`.
