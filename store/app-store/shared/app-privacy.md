# App Privacy / Uygulama Gizliliği (App Store Connect)

Kaynak: eski `APP-STORE-LISTELEME.md` › "App Privacy". Tüm platformlarda ortak.
Source: former `APP-STORE-LISTELEME.md`. Shared across platforms.

## Öneri / Recommendation

**Veri Toplanmıyor / Data Not Collected.** Takip (tracking): **Hayır / No.**

## Gerekçe (TR)

Apple tanımı: "toplama" = verinin cihazdan çıkıp geliştiricinin/ortaklarının
isteği gerçek zamanlı karşılamanın ötesinde erişebileceği şekilde iletilmesi.

- Maaş, çalışma düzeni, giderler, kapatılan siteler: `storage.sync/local`
  (Safari uzantı deposu). Geliştiriciye gitmez; sunucu yok.
- Safari'de `storage.sync`'in cihazlar arası eşitleme yapıp yapmadığı bu turda
  doğrulanmadı (ARCHITECTURE.md risk 4). Yapsa bile kullanıcının kendi Apple
  altyapısıdır; geliştirici erişmez.
- Dış istekler yalnız kur tablosu: `api.frankfurter.dev`, yedekler
  `open.er-api.com`, `cdn.jsdelivr.net` (`src/background.js`). İstekte kullanıcı
  verisi yok; IP yalnız isteği karşılamak için kullanılır.
- Analitik, reklam, çökme raporu SDK'sı yok. `safari/IncomeVsDesires/Shared (App)/PrivacyInfo.xcprivacy`:
  izleme yok, toplanan veri türü yok, required-reason API yok.
- Arayüz metinleri paketteki `_locales/{en,tr}`'den okunur; ağ isteği yok.
- Giderler sayfasındaki "hata bildir" bir `mailto:` bağlantısı
  (`src/options.js`, `FEEDBACK_EMAIL`): kullanıcı metni kendi e-posta
  uygulamasında görüp kendisi gönderir; maaş ve gider içermez. Apple'ın
  "isteğe bağlı geri bildirim" istisnası kapsamında değerlendirildi —
  **açık soru** (`store/README.md`).

## Rationale (EN)

- Pay, schedule, expenses and turned-off sites live in Safari's extension
  storage (`storage.sync/local`); they never reach the developer — there is no
  server.
- Only outgoing requests: the exchange-rate table (`api.frankfurter.dev`,
  backups `open.er-api.com`, `cdn.jsdelivr.net`). No user data in the request.
- No analytics, ads or crash-reporting SDK; `PrivacyInfo.xcprivacy` declares no
  tracking, no collected data types and no required-reason APIs.
- "Report a bug" is a `mailto:` link; the user sees and sends the email from
  their own mail app. It contains neither pay nor expenses. Treated as optional
  user-initiated feedback — **open question**.

## Gizlilik politikası URL / Privacy policy URL (zorunlu / required)

- TR: `https://hamaratlabs.com/income-vs-desires/gizlilik` (yayında / live, 2026-11-08 `curl` 200)
- EN: `https://hamaratlabs.com/income-vs-desires/en/privacy` (yayında / live, 2026-11-08 `curl` 200)

Not: Gizlilik URL'si "App Information" düzeyinde, yerelleştirilebilir değil gibi
görünüyor (Apple referansında "can be localized" ifadesi yok); birincil dil
hangisiyse onun sayfası girilir. / Appears to be one URL per app (the Apple
reference doesn't say it can be localized).
