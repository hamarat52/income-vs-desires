# IncomeVsDesires — mimari haritasi

Chrome uzantisi: internetteki fiyatlari, kullanicinin maasina gore "kac saat calismak
gerek"e cevirir. Cati yok, derleme adimi yok, TypeScript yok — duz JavaScript.

## Yapi

- `manifest.json` — **repo kokunde**, `src/` icinde degil. Manifest V3.
  - `permissions`: `storage`, `alarms`, `activeTab`
  - `host_permissions`: tek dis istek — `https://api.frankfurter.dev/*`
    (eski `api.frankfurter.app` 2026-10'da 301 ile `.dev/v1`'e tasindi)
  - `content_scripts`: `<all_urls>`, `document_idle`; mail/docs/drive/calendar,
    Slack, Notion, Figma, GitHub ve 4 banka `exclude_matches` ile disarida.
- `src/background.js` — service worker; `chrome.alarms` + `fetch`, `storage.local` onbellegi.
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
   DOGRULANMADI. Hata olursa yedek kurlar + panel uyarisi.
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

### Kaldigin yer (ekran acilinca)

1. Gerekirse yeniden derle (DerivedData `/var/folders/.../T` altinda, macOS
   temizleyebilir): `cd safari/IncomeVsDesires && xcodebuild -scheme IncomeVsDesires
   -configuration Debug -derivedDataPath "$TMPDIR/ivd-dd" CODE_SIGN_IDENTITY=-
   CODE_SIGN_STYLE=Manual DEVELOPMENT_TEAM= build`
2. `open "$TMPDIR/ivd-dd/Build/Products/Debug/IncomeVsDesires.app"` (bir kez).
3. Safari > Ayarlar > Gelismis > "Web gelistiricileri icin ozellikleri goster";
   Gelistir > "Imzasiz Uzantilara Izin Ver" (Safari her yeniden acilista sifirlar).
4. Ayarlar > Uzantilar > IncomeVsDesires'i etkinlestir; "Her web sitesinde izin ver"
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

- Tek dis bagimlilik Frankfurter (ECB verisi); baska servis eklemeden once sor.
- `exclude_matches` listesi bilincli bir gizlilik karari — daraltma veya genisletme
  talebini kullaniciya dogrula.
- Magaza metinleri `MAGAZA-LISTELEME.md`, arama notlari `SEO.md`.

## Proje bilgisi kasada

`~/Desktop/OBS/Everything/Projeler/Income vs Desires/`
- `Income vs Desires.md` — ozet ve kararlar
- `Tech.md` — en ayrintili teknik not (manifest, dosya dosya mimari)
- `Roadmap.md`

Kasaya kod yazilmaz. Repo ile kasa celisirse once kullaniciya sor.
Commit, push, PR, merge ve silme kullanici onayi ister.
Genel kurallar: `~/Desktop/Projeler/AGENTS.md`.
