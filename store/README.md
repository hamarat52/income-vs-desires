# store/ — Mağaza hazırlık paketi (IncomeVsDesires)

Kontrol listesi: `OBS/Everything/Agent Rehberi/Mağaza Hazırlık Paketi.md`
(0–8). Her kalem: **hazır** / **eksik** / **Yusuf'ta**. Durum 28.10.2026,
dal `release/safari-chrome`. Push yapılmadı: "push sonrası" yazan URL'ler
henüz yayında değil.

## Yerleşim

```
store/
  README.md                         ← bu dosya
  chrome-web-store/
    tr/listing.md   en/listing.md   ← ad + özet (manifest/_locales'ten), detaylı açıklama, kategori, dil, URL'ler
    tr/screenshots/                 ← mevcut TR set (1280×800); en/screenshots/ ImageArtist'te
    shared/                         ← ikon 128, promo 440×280, marquee 1400×560 (yerelleştirilemez),
                                       gizlilik-sekmesi.md (TR+EN), gorseller.md, src/ (kaynak HTML + render.sh)
  app-store/
    tr/listing.md   en/listing.md   ← ad, alt başlık, tanıtım, açıklama, anahtar kelime, URL'ler
    tr/whats-new.md en/whats-new.md ← ilk sürümde alan yok; 2. sürüm şablonu
    tr/{iphone,ipad}/               ← eski host app açılış kareleri; mac/ ve en/* ImageArtist'te
    shared/                         ← app-privacy.md, yas-derecelendirme.md, sifreleme.md,
                                       review-notes.md (TR+EN), kategori-fiyat.md, ekran-goruntuleri.md
  raw/{tr,en}/{desktop,iphone,ipad}/ ← gerçek Chrome + gerçek eklentiyle ham kareler; README.md
  arsiv/chrome-eski-35000tl/        ← yüklenmeyecek eski kareler
```

Eski kök dosyalar `git mv` ile taşındı: `MAGAZA-LISTELEME.md` →
`chrome-web-store/tr/listing.md` (+ `shared/gizlilik-sekmesi.md`),
`APP-STORE-LISTELEME.md` → `app-store/tr/listing.md` (+ `shared/*`),
`store-assets/chrome/*` → `chrome-web-store/…`, `store-assets/apple/*` → `app-store/…`.

## 0. Önce doğrula — hazır

Resmi kurallar PM tarafından 28.10.2026'da doğrulandı; bu turda ayrıca okunanlar:

| Kaynak | Okunan (28.10.2026) |
|---|---|
| developer.chrome.com/docs/webstore/images, /cws-dashboard-listing, /best-listing | PM: ad + özet manifest'ten, `_locales` ile; açıklama/görsel/video dil başına yalnız `_locales/<kod>` varsa; 440×280 ve 1400×560 yerelleştirilemez; ikon 128 (96 + 16 saydam) |
| developer.apple.com/help/app-store-connect/reference/app-information/app-information | Ad ≤ 30, alt başlık ≤ 30; **kategori ve yaş derecesi uygulama düzeyinde, tüm platformlarda ortak**; Mac'te birincil kategori Xcode'dakiyle eşleşmeli |
| developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information | Tanıtım ≤ 170, açıklama ≤ 4000, anahtar kelime ≤ 100 bayt (> 2 kr., ad/şirket tekrarı yok), destek URL'si gerçek iletişim bilgisine götürmeli, "What's New" ilk sürümde yok, review notu ≤ 4000 bayt |
| developer.apple.com/app-store/categories/ | Kategori listesinde Shopping ve **Safari Extensions** var |
| developer.apple.com/documentation/bundleresources/information-property-list/lsapplicationcategorytype | Xcode değerlerinde `shopping` ve safari-extensions karşılığı yok; `finance` var |
| App Review Guidelines 2.3.10 / 2.3.7 (PM) | Apple metinlerinde "Chrome" yok; görsel/metinde fiyat ifadesi yok — betik denetliyor |

## 1. Kimlik — hazır (ad kararı Yusuf'ta)

| Alan | Değer | Durum |
|---|---|---|
| Ad (CWS, manifest) | `IncomeVsDesires` (TR = EN) | hazır; uzun ad önerisi **Yusuf'ta** |
| Ad (App Store) | TR `IncomeVsDesires: Maaşa Göre` · EN `IncomeVsDesires: Work Hours` | **Yusuf'ta** |
| Alt başlık (App Store) | TR `Fiyatı çalışma saatine çevir` · EN `Turn prices into time you work` | hazır |
| Bundle ID | `com.hamarat52.IncomeVsDesires` (uzantı `.Extension`), macOS + iOS aynı kayıt | hazır |
| Sürüm / yapı | `0.1.0` (build `1`) — manifest `version`, pbxproj `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION` | hazır |
| Kategori CWS | Alışveriş / Shopping | hazır |
| Kategori App Store | Birincil **Finans** (Xcode `public.app-category.finance`; ortak → iOS'ta da Finans), ikincil **Alışveriş** — [`app-store/shared/kategori-fiyat.md`](app-store/shared/kategori-fiyat.md) | hazır (ikincil seçimi kayıtta doğrulanacak) |
| Yaş | 4+ — [`yas-derecelendirme.md`](app-store/shared/yas-derecelendirme.md) | hazır |
| Fiyat | Ücretsiz, uygulama içi satın alma yok | hazır (öneri) |
| Platform | macOS 12.0+, iOS host app 17.0+ (uzantı 15.0) | hazır |
| Yenilikler | CWS'de alan yok; App Store ilk sürümde yok → [`tr/whats-new.md`](app-store/tr/whats-new.md), [`en/whats-new.md`](app-store/en/whats-new.md) (kaynak `CHANGELOG.md`) | hazır |

## 2. İkon — kısmen hazır

| Öğe | Durum |
|---|---|
| Chrome 16/32/48/128 | hazır — `src/icons/` |
| CWS mağaza ikonu 128 (96 + 16 saydam) | hazır — `chrome-web-store/shared/store-icon-128-padded.png` |
| App Store 1024 (iOS `universal-icon-1024@1x.png`) | **risk**: tüm pikseller opak (alfa 255) ama dosya RGBA kaydedilmiş. Apple 1024 ikonda alfa kanalı istemiyor; RGB'ye düzleştirilmesi önerilir (ImageArtist; bu turda dokunulmadı) |
| macOS boyutları 16–1024 | hazır — `AppIcon.appiconset` (Mac ikonunda saydamlık normal) |
| Küçük boyut okunurluk / açık-koyu önizleme | **eksik** (ImageArtist) |
| Play / Android / Windows | kapsam dışı (bu ürün için mağaza yok) |

## 3. Mağaza görselleri — ham kareler hazır, çerçeveli set eksik

| Öğe | Durum |
|---|---|
| Ham kareler TR + EN, 6 sahne × 3 cihaz (36 PNG) | **hazır** — [`raw/README.md`](raw/README.md): URL, saat, dil, emülasyon, "Chrome görüntü alanı" notu |
| CWS TR ekran görüntüleri 1280×800 | mevcut set `chrome-web-store/tr/screenshots/` (Türkçe-only sürümle çekildi); yeni ham karelerden yenilenmesi ImageArtist'te |
| CWS EN ekran görüntüleri | **eksik** (ImageArtist; kaynak `raw/en/desktop/`) |
| CWS 440×280, 1400×560 | hazır (TR metinli; yerelleştirilemez — açık soru) |
| App Store iPhone / iPad / Mac, TR + EN | **eksik**: ham kareler Chrome'da; Apple seti Safari'de çekilmeli (Rehber 2.3.10: başka tarayıcı arayüzü görünmemeli). Mevcut `app-store/tr/{iphone,ipad}/` yalnız host app açılışı |

## 4. Tanıtım videosu — eksik

Bu turun kapsamında değil (VideoGen). App preview ve YouTube videosu yok.

## 5. Listeleme metinleri — hazır

| Dosya | İçerik |
|---|---|
| [`chrome-web-store/tr/listing.md`](chrome-web-store/tr/listing.md) · [`en/listing.md`](chrome-web-store/en/listing.md) | ad, özet, detaylı açıklama, kategori, dil, URL'ler |
| [`app-store/tr/listing.md`](app-store/tr/listing.md) · [`en/listing.md`](app-store/en/listing.md) | ad, alt başlık, tanıtım, anahtar kelime, açıklama, URL'ler, telif |

Dürüstlük: saha ölçümü 10 Türk alışveriş sitesi + Google Alışveriş'te
(`docs/qa/saha-testi-2026-10-28.json`); ABD için yalnız 28.10'da IKEA US (40)
ve Zappos (283) çip sayısı ölçüldü (`raw/probe-en-2026-10-28.jsonl`) — metinler
bundan fazlasını iddia etmiyor. Apple metinlerinde ölçüm tablosu yok (başka
tarayıcıda ölçüldü). Örnek rakamlar eklentinin `IVD.formatDuration`'ıyla
hesaplandı (EN: 5.000 USD · 8 sa · 22 gün → $28.41/saat; $50 → 1.8 hours).

### Karakter sınırları (komutla: `node scripts/check-listing-length.js --md`, 28.10.2026)

Karakter = Unicode kod noktası; bayt = UTF-8. Betik ayrıca denetliyor: CWS
ad/özet = `_locales` (tr, en) birebir; manifest metinlerinde `$` yok; Apple
metinlerinde "Chrome" yok; tanıtımda "ücretsiz/free" yok; anahtar kelimeler
> 2 karakter ve ad/alt başlık kelimelerini tekrar etmiyor.

| Mağaza | Dil | Alan | Sınır | Karakter | UTF-8 bayt | Durum |
|---|---|---|---|---|---|---|
| CWS | tr | ad (manifest) | 75 kr | 15 | 15 | OK |
| CWS | tr | özet (manifest) | 132 kr | 116 | 132 | OK |
| CWS | tr | detaylı açıklama | 16000 kr | 2774 | 3026 | OK |
| CWS | en | ad (manifest) | 75 kr | 15 | 15 | OK |
| CWS | en | özet (manifest) | 132 kr | 120 | 120 | OK |
| CWS | en | detaylı açıklama | 16000 kr | 2605 | 2605 | OK |
| App Store | tr | ad | 30 kr | 27 | 29 | OK |
| App Store | tr | alt başlık | 30 kr | 28 | 33 | OK |
| App Store | tr | tanıtım metni | 170 kr | 128 | 143 | OK |
| App Store | tr | anahtar kelimeler | 100 bayt | 88 | 96 | OK |
| App Store | tr | açıklama | 4000 kr | 2302 | 2543 | OK |
| App Store | en | ad | 30 kr | 27 | 27 | OK |
| App Store | en | alt başlık | 30 kr | 30 | 30 | OK |
| App Store | en | tanıtım metni | 170 kr | 133 | 133 | OK |
| App Store | en | anahtar kelimeler | 100 bayt | 97 | 97 | OK |
| App Store | en | açıklama | 4000 kr | 2388 | 2388 | OK |
| App Store | en | review notu | 4000 bayt | 1071 | 1071 | OK |
| App Store | tr | review notu | 4000 bayt | 1099 | 1178 | OK |

CWS detaylı açıklama için 16.000 sınırı bu turda resmi belgeden okunmadı
(betikteki üst sınır; metinler çok altında).

## 6. Yasal ve form cevapları — hazır, URL'lerin ikisi push sonrası

| Öğe | Durum |
|---|---|
| Gizlilik TR `…/gizlilik.html` | **yayında** (28.10 `curl` 200); 28.10 güncellemesi (Safari cümlesi, EN bağlantısı) push sonrası |
| Gizlilik EN `…/en/privacy.html` | hazır (`site/en/privacy.html`), **push sonrası yayında olacak** (şu an 404) |
| Destek TR `…/destek.html` · EN `…/en/support.html` | hazır, **push sonrası yayında olacak** (şu an 404). İçerik: GitHub Issues (200) + e-posta `yusuf.hamarat@ozu.edu.tr` — **e-postanın herkese açık yayımlanması Yusuf onayı** |
| Pazarlama `https://hamarat52.github.io/income-vs-desires/` | yayında (200), yalnız Türkçe |
| CWS gizlilik sekmesi (tek amaç, izinler, uzak kod, veri, sertifikalar) | hazır — [`chrome-web-store/shared/gizlilik-sekmesi.md`](chrome-web-store/shared/gizlilik-sekmesi.md) (TR+EN) |
| App Privacy | hazır — Data Not Collected, [`app-privacy.md`](app-store/shared/app-privacy.md) |
| Yaş anketi | hazır — [`yas-derecelendirme.md`](app-store/shared/yas-derecelendirme.md) |
| Şifreleme | hazır — `ITSAppUsesNonExemptEncryption = NO` iki host app'te, [`sifreleme.md`](app-store/shared/sifreleme.md) |
| Review notu (TR+EN), demo hesap | hazır — [`review-notes.md`](app-store/shared/review-notes.md); hesap gerekmez |
| Üçüncü taraf lisans / atıf | eksik değil: pakette üçüncü taraf kod yok; kur verisi Frankfurter/ECB, gizlilik sayfasında anılıyor |

## 7. Uygulama içi dil — hazır

Eklenti `chrome.i18n` ile TR + EN (`_locales/{tr,en}`, `default_locale: en`).
Gerçek Chrome 156'da iki dilde doğrulandı; Safari'de `_locales` dört appex'e
paketleniyor; host app açılış metni `navigator.language` ile TR/EN.

## 8. Yerleşim ve teslim

| Öğe | Durum |
|---|---|
| `store/<mağaza>/<dil>/…` + bu kontrol listesi | hazır |
| `vd` proje kaydı `marketplaces` | **eksik** — bu turda güncellenmedi (PM) |

## Yusuf'un yapacakları

- Ad kararı (CWS uzun ad; App Store TR/EN ad) — `chrome-web-store/tr/listing.md`, `app-store/{tr,en}/listing.md`.
- Destek sayfalarında e-posta adresinin yayımlanmasına onay — `site/destek.html`, `site/en/support.html`.
- Push (site yayını: destek + EN gizlilik) — ardından URL'lerin 200 döndüğünü kontrol.
- CWS: `bash scripts/build-cws-zip.sh` çıktısını yükleme, TR + EN listeleme metinlerini girme, Gönder.
- App Store Connect: uygulama kaydı (bundle `com.hamarat52.IncomeVsDesires`), imza/sertifika, Xcode Archive + yükleme, metinler, Gönder.

## Açık sorular

1. CWS'de gizlilik politikası URL'si tek alan mı (dil başına değil)? Panelde doğrulanmadı; TR mi EN mi girilecek?
2. 440×280 / 1400×560 yerelleştirilemiyor ve şu an Türkçe metin taşıyor; varsayılan dil EN olunca görselin dili ne olmalı?
3. App Store birincil dil TR mi EN mi? (Gizlilik URL'si uygulama düzeyinde tek görünüyor.)
4. App Store ikincil kategori: Alışveriş Mac için seçilebiliyor mu; "Safari Extensions" kategorisi kullanılmalı mı?
5. iOS 1024 ikonun alfa kanalı (opak ama RGBA) yüklemede sorun çıkarır mı — RGB'ye düzleştirilsin mi?
6. "Hata bildir" `mailto:` bağlantısı App Privacy'de "toplama" sayılır mı (öneri: sayılmaz)?
7. Safari'de `storage.sync` cihazlar arası eşitliyor mu? (Metinler bunu iddia etmiyor.)
