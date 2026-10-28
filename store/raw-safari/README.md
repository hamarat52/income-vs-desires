# Ham Safari kareleri (gerçek Safari + gerçek uzantı)

Durum 29.10.2026 00:20, dal `release/safari-chrome` (HEAD `264072b` üstüne), MobileDev.
Her kare gerçek Safari'de, bu worktree'den derlenmiş gerçek uzantıyla, gerçek sitede
çekildi. Kompozit, rötuş, sahte arayüz yok. Kırpma/çerçeve/başlık yok (ImageArtist işi).

## Kapsam — ne var, ne yok

| Hedef | Durum |
|---|---|
| iPhone 18 Pro simülatör (iOS 27.0) TR — 01…05 + kayıt | **hazır** (03 ürün sayfasında, aşağıya bakın) |
| iPhone 18 Pro simülatör EN — 01…04 | **hazır**; **04'te uzantı hatası görünüyor** (mağazada kullanılmamalı) |
| iPhone EN 05 (Giderler) + EN kayıt | **eksik** — Giderler sayfası kayıtlı ayarları göstermedi (bkz. `_kanit/iphone-en-giderler-sayfasi-ayarlar-bos.png`), simülatör o sırada dışarıdan kesildi |
| iPad Pro 13" (M5) simülatör TR — 01…05 + kayıt | **hazır** (03 listede gezinmesiz) |
| iPad Pro 13" (M5) EN | **eksik** — yeniden başlatma sonrası uzantı Zappos'ta fiyat çevirmedi, popup mesajları yanıtsız (bulgu G); EN popup'ta hata A iPad'de de var |
| macOS Safari TR/EN (`mac/`) | **eksik** — masaüstü girdisi (tıklama/tuş) bu oturumda onaysız çalışamadı; yalnız pasif kanıt `_kanit/mac-*` |

`mac/{tr,en}/` ve `ipad/en/` boş (git boş klasörü izlemez).

## Nasıl çekildi

- Derleme: `xcodebuild -scheme "IncomeVsDesires (iOS)" -configuration Release -sdk iphonesimulator
  -derivedDataPath safari/IncomeVsDesires/build/dd-iossim build` → **BUILD SUCCEEDED** (28.10 21:04,
  `src/` = `264072b`; bulgu A/B düzeltmeleri `f29044d`/`9f9b9e8` bu derlemede **yok**);
  `xcrun simctl install`.
- Uzantıyı açma: Ayarlar › Uygulamalar › Safari › Genişletmeler › IncomeVsDesires ›
  "Genişletmeye İzin Ver" açık; İzinler › "Diğer Web Siteleri" = **İzin Ver** (bu seçim
  api.frankfurter.dev, cdn.jsdelivr.net, open.er-api.com satırlarını da "İzin Ver" yaptı).
  Kanıt: `_kanit/iphone-tr-ayarlar-uzanti-acik.png`, `_kanit/iphone-tr-ayarlar-izinler-izin-ver.png`.
- Girdi: simülatörün **içinde** XCUITest (geçici sürücü projesi, repoda değil:
  `~/.hermes/profiles/mobiledev/cache/scratch/ivd-safari/simdriver/`). macOS masaüstüne
  girdi gönderilmedi. Kare: `xcrun simctl io <udid> screenshot`, kayıt:
  `xcrun simctl io <udid> recordVideo --codec h264` (ses yok).
- Dil: simülatörün kendi dili (`defaults write -g AppleLanguages (tr)` / `(en-US)` + yeniden
  başlatma). İş bitince özgün değer geri yazıldı: `("en-US","tr-US","ru-US")`, `AppleLocale en_US`.
- Durum çubuğu: `simctl status_bar override --time 9:41 …` (kayıt ve 01–05'te), sonda `clear`.
- Örnek veri (gerçek kişi değil): TR 50.000 TRY · 8 saat · 22 gün (saatlik ₺284,09);
  gider Kira 18.000 TRY. EN 5,000 USD · 8 h · 22 days (saatlik $28.41).
- Kur: popup "Kurlar güncel (28.10.2026)." / "Exchange rates up to date (10/28/2026)."
  — çekim başarılı; **hangi kaynaktan** (`source`) Web Inspector olmadan okunamadı.

## Dosyalar

Saat = İstanbul, simülatör ekran görüntüsünün alındığı an. Hepsi PNG, **`sips hasAlpha: yes`**
(simctl RGBA yazıyor; piksel olarak opak). App Store'a gitmeden önce alfa düzleştirilmeli.

### iPhone 18 Pro · TR · 1206×2622

| Dosya | Saat | URL | Ne gösteriyor |
|---|---|---|---|
| `iphone/tr/01-eklenti-acik.png` | 22:17:03 | https://www.trendyol.com/sr?q=spor%20ayakkab%C4%B1 | Liste; çipler "2,5 saat / 2,6 saat", "Trendyol Plus ile 2,4 saat", "3,6 gün" |
| `iphone/tr/02-eklenti-kapali.png` | 22:20:03 | aynı, aynı sayfa yüklemesi | Popup'tan anahtar Kapalı → 711,56 TL / 726,08 TL / 690,21 TL / 8.149 TL |
| `iphone/tr/03a-cip-dokunmadan-once.png` | 22:28:27 | trendyol.com ürün sayfası (Marjin Kadın Sneaker Merita Kahve Süet) | Alt çubukta "Sepette 6,7 saat" |
| `iphone/tr/03-cipe-dokunuldu.png` | 22:29:14 | aynı ürün sayfası | Çipe tek dokunuş → "1.899,99 TL", gezinme yok |
| `iphone/tr/04-popup.png` | 22:30:25 | ürün sayfası üstünde uzantı sayfası (tam yükseklik) | Açık · 50.000 ₺ TRY · 8/22 · "Bir saatin ≈ ₺284,09 · bir mesai ≈ ₺2.272,73" · "www.trendyol.com için kapat" · "Kurlar güncel (28.10.2026)." |
| `iphone/tr/05-giderler-halka.png` | 22:52:15 | uzantı Giderler sayfası (adres çubuğu boş görünür) | "AYIN NEREYE GİDİYOR · KİRA 7,9 gün %36 · ayda 63,4 saat · SANA KALAN 14 gün %64", halka "22 gün aylık mesain" |
| `iphone/tr/kayit.mov` | 22:53:24–22:54:23 | yukarıdakiler | H.264 1206×2622, 59,1 sn, ses yok, 26,8 MB. 0–9 sn liste+çipler · 10–17 kaydırma · 18–28 ürün sayfası (ilk karede ham "535,99 TL", sonra "1,9 saat" — dönüşüm anı) · 30 Sayfa menüsü · 32–38 popup küçük→tam · 40 yeni sekme · 42–58 Giderler + halka. Çipe dokunup fiyata dönme **bu kayıtta yok**. 20–30 sn'lik kesit VideoGen'de. |

Saatlik ₺284,09 ile sağlama: 711,56/284,09 = 2,50 sa; 8.149/284,09/8 = 3,59 gün; 1.899,99/284,09 = 6,69 sa.

### iPhone 18 Pro · EN · 1206×2622

| Dosya | Saat | URL | Ne gösteriyor |
|---|---|---|---|
| `iphone/en/01-eklenti-acik.png` | 23:13:01 | https://www.zappos.com/sneakers | "3.7 hours" (Nike), "2.3 hours" (Skechers), "5.6 hours" (ECCO) |
| `iphone/en/02-eklenti-kapali.png` | 23:14:29 | aynı, aynı sayfa yüklemesi | Off → $105 / $65 / $159.99 |
| `iphone/en/03a-cip-dokunmadan-once.png` | 23:15:59 | aynı | Yeniden On; "2.3 hours" |
| `iphone/en/03-cipe-dokunuldu.png` | 23:16:14 | aynı | "2.3 hours" çipine dokunuş → "$65", liste sayfasında kaldı |
| `iphone/en/04-popup.png` | 22:59:23 | https://www.ikea.com/us/en/search/?q=desk%20lamp üstünde | **HATA görünür:** "One hour of your work ≈ $227.278.41 · one workday ≈ $227.27" (doğrusu $28.41). Mağazada kullanılmamalı. |

Sağlama ($28.41/sa): 105/28,41 = 3,70; 65/28,41 = 2,29; 159,99/28,41 = 5,63.

### iPad Pro 13" (M5) · TR · 2064×2752 (iOS 27.0, ayrı simülatör; uzantı ve izinler aynı yolla açıldı)

iPad'de uzantı adres çubuğundaki düğmeden **popover** olarak açılıyor; "Giderlerin ve grafik →"
Giderler'i yeni sekmede açıyor (sekme çubuğu görünür). Saatler İstanbul; 05'ten itibaren tarih 29.10.

| Dosya | Saat | URL | Ne gösteriyor |
|---|---|---|---|
| `ipad/tr/01-eklenti-acik.png` | 23:51:50 (28.10) | https://www.trendyol.com/sr?q=spor%20ayakkab%C4%B1 | Marjin "6,7 saat / 7 saat" ×3, Dark Seer "3,2 saat", McDark "4,2 saat" (üstü çizili "5,6 saat") |
| `ipad/tr/02-eklenti-kapali.png` | 23:53:24 | aynı, aynı sayfa yüklemesi | Kapalı → 1.899,99 TL ×3, 921,89 TL, 1.197,82 TL (1.590 TL) |
| `ipad/tr/03a-cip-dokunmadan-once.png` | 23:54:33 | aynı | Yeniden Açık; Dark Seer "3,2 saat" |
| `ipad/tr/03-cipe-dokunuldu.png` | 23:54:52 | aynı | "3,2 saat" çipine dokunuş → "921,89 TL" (soluk = fiyat modu), **listede gezinme yok** |
| `ipad/tr/04-popup.png` | 23:50:57 | Trendyol üstünde popover | Açık · 50.000 TRY · 8/22 · ₺284,09 / ₺2.272,73 · "www.trendyol.com için kapat" · "Kurlar güncel (28.10.2026)." |
| `ipad/tr/05-giderler-halka.png` | 00:00:41 (29.10) | uzantı Giderler sekmesi | Kira 18.000 → KİRA 7,9 gün %36 · SANA KALAN 14 gün %64, halka "22 gün aylık mesain" |
| `ipad/tr/kayit.mov` | 00:01:47–00:02:25 | Trendyol → Giderler | H.264 2064×2752, 38,2 sn, ses yok, 18,8 MB. 0–9 sn liste+çipler · 12–16 sn "3,2 saat" → "921,89 TL" · 17 sn geri "3,2 saat" · ~20–29 sn popover · ~31–38 sn Giderler + halka |

Saat = ekran görüntüsünün alındığı an (`_kanit/zaman-damgalari.tsv`).
Sağlama: 921,89/284,09 = 3,25 sa; 1.197,82/284,09 = 4,22 sa; 1.590/284,09 = 5,60 sa.

### `_kanit/` (mağaza karesi değil, doğrulama kanıtı)

| Dosya | Saat | Ne |
|---|---|---|
| `mac-tr-trendyol-site-izni-yok.png` (1454×886, sayfa alanı) | 21:06:09 | macOS Safari 27.0, TR arayüz; Trendyol'da fiyatlar TL, çip yok |
| `mac-tr-arac-cubugu-simgesi-uyari.png` (144×144, 36 px büyütme) | 21:06:09 | Araç çubuğunda IncomeVsDesires simgesi + turuncu uyarı rozeti (site izni bekliyor) |
| `iphone-tr-ayarlar-uzanti-acik.png` | 21:47:39 | iOS Ayarlar › Safari › Genişletmeler › IncomeVsDesires açık |
| `iphone-tr-ayarlar-izinler-izin-ver.png` | 21:48:47 | İzinler: frankfurter / jsdelivr / er-api / Diğer Web Siteleri = İzin Ver |
| `iphone-tr-cip-dokunma-oncesi-liste.png` | 22:27:16 | Trendyol liste, Marjin kartında "6,7 saat" |
| `iphone-tr-cip-dokunma-sonrasi-urun-sayfasi.png` | 22:28:27 | O çipe dokununca **ürün sayfasına gitti** (çip dönmedi) |
| `iphone-en-ikea-gorunur-fiyat-cevrilmedi.png` | 23:00:17 | IKEA US mobil: görünen "$39.99", "$44.99" çevrilmemiş |
| `iphone-en-ikea-popup-40-fiyat-cevrildi.png` | 23:11:51 | Aynı sayfada popup "Rescan" → "40 prices converted" |
| `iphone-en-giderler-sayfasi-ayarlar-bos.png` | 23:21:52 | EN Giderler sayfası: maaş boş, TRY, 8/22 yer tutucu (kayıtlı 5,000 USD gelmedi) |
| `ipad-tr-ayarlar-uzanti-acik.png`, `ipad-tr-ayarlar-izinler-izin-ver.png` | 23:43:40 · 23:44:21 | iPad: uzantı açık, tüm siteler İzin Ver |
| `ipad-en-zappos-try-maas-usd-cevrilmedi-kur-satiri-yok.png` | 00:06:58 | iPad EN (yeniden başlatma sonrası): TRY maaş, Zappos $ fiyatları çevrilmemiş; popover'da kur satırı yok |
| `ipad-en-giderler-ayarlar-dolu-D-tekrarlanmadi.png` | 00:07:44 | iPad EN Giderler: maaş 50,000 TRY, Kira, halka dolu — bulgu D iPad'de tekrarlanmadı |
| `ipad-en-popup-hata-A-tekrar.png` | 00:12:07 | iPad EN: 5,000 USD → "One hour of your work ≈ $227.278.41" (hata A, ikinci cihazda) |
| `ipad-en-rescan-yanit-yok.png` | 00:13:02 | "Rescan this page" dokunuşu sonuç yazısı göstermedi (yanıt/hata geri çağrısı yok) |
| `ipad-en-zappos-usd-maas-safari-yeniden-acildi-cevrilmedi.png` | 00:13:38 | Safari sonlandırılıp açıldıktan sonra da Zappos $ fiyatları çevrilmemiş (USD maaş) |
| `zaman-damgalari.tsv` | — | Kopyalama anı günlüğü (çekim saatleri yukarıdaki tablolarda) |
