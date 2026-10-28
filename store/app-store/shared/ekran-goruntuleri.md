# App Store ekran görüntüleri (TR birincil, EN yerelleştirme)

Durum 29.10.2026 (ImageArtist). Boyutlar Apple "Screenshot specifications"
(https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications)
ve PM'in 28.10 doğrulaması:

| Cihaz sınıfı | Zorunluluk | Bu set |
|---|---|---|
| iPhone, Dynamic Island orta ekran | zorunlu | **1206 × 2622**, 5 kare/dil |
| iPhone büyük ekran (1320 × 2868) | isteğe bağlı (yoksa ölçeklenir) | yok |
| iPad 13" | zorunlu (uygulama iPad'de çalışıyor) | **2064 × 2752**, 5 kare/dil |
| Mac (16:10) | zorunlu | **2880 × 1800**, 5 kare/dil |

Hepsi PNG, alfa yok (`sips -g hasAlpha` → `no`, Pillow modu `RGB`). Safari ham kareleri
(simctl, RGBA) şablonda kırpılıp `store/_src/flatten.py` ile RGB'ye düzleştirildi.

## Kaynak ve dürüstlük — ÖNEMLİ

| Set | Kaynak |
|---|---|
| iPhone TR + EN | **gerçek Safari (iOS 27 simülatör, iPhone 18 Pro)**, gerçek uzantı, gerçek site — `store/raw-safari/iphone/<dil>/` |
| iPad TR + EN | **gerçek Safari (iOS 27 simülatör, iPad Pro 13" M5)**, gerçek uzantı, gerçek site — `store/raw-safari/ipad/<dil>/` |
| Mac TR + EN | **Chrome kaynaklı, macOS Safari çekimi bekliyor** — `store/raw/<dil>/desktop/` (Chrome görüntü alanı; Chrome öğesi yok) |

Derleme (ayrıntı [`../../raw-safari/README.md`](../../raw-safari/README.md)):
- `264072b` (28.10 21:04): iPhone TR 01–05, iPhone EN 01–03, iPad TR 01–05.
- `9f9b9e8` (29.10 00:18, bulgu A/B düzeltmeli): iPhone EN 04–05, iPad EN 01–05.
- TR karelerde hata A görünmez (₺). A düzeltmesinden önceki EN popup kareleri
  (`$227.278.41`, `raw-safari/_kanit/*-hata-A-*`) **kullanılmadı**; `_kanit/` altındaki
  hiçbir dosya mağaza karesi değildir.

Kurallar:
- Her kare = başlık bandı + aynı ham karenin kırpımı (yakınlaştırma ≤ 1,5×). Arayüz
  çizilmedi, rakam üretilmedi, rötuş yok. Kırpımlar `store/_src/screens/scenes.js`
  (`SAFC`, ham piksel).
- Apple kendi platformu olduğu için Safari öğeleri (iPhone alttaki adres çubuğu,
  iPad adres çubuğu + uzantı popover'ı) yer yer görünür; odak eklentidir.
- Rehber 2.3.10: hiçbir karede "Chrome" yazısı/arayüzü yok (Apple seti Safari'den).
- Rehber 2.3.7: fiyat/"ücretsiz" ifadesi yok. Görünen fiyatlar sitenin ürün fiyatları.
- Rehber 2.3.9: site logoları kırpım dışında — Trendyol ve Zappos üst bandı, Marjin
  satıcı afişi/logosu, iPad sekme çubuğu (site favicon'ları, "Zappos" sekme başlığı),
  iPad durum çubuğundaki "◀ Ayarlar" dönüş bağlantısı. Kalan: adres çubuğundaki alan
  adı (`trendyol.com`, `zappos.com`, düz metin), ürün adlarındaki marka metni
  (adidas, Nike, SKECHERS…) ve ürün fotoğrafındaki marka işaretleri — ürün kartının parçası.
- Rehber 2.3.3: her kare eklentiyi kullanımda gösteriyor (açılış ekranı yok).
- Örnek maaş gerçek kişi verisi değil: TR 50.000 TL · 8 saat · 22 gün (₺284,09/sa);
  EN $5,000 · 8 h · 22 days ($28.41/sa). Gider: Kira 18.000 TRY / Rent $1,500.
- Başlıklardaki her rakam ilgili ham karede görüldü; kanıt satırları aşağıda.
- "Bir daha dokun, yine süre" alt yazısı Apple setinden **çıkarıldı**: Zappos'ta fiyat
  modundaki çipe 2. dokunuş ürün sayfasına gidiyor (bulgu H, `9f9b9e8`).
- Kırmızı çerçeve (03) dokunulan çipi işaretler; arayüze ait değildir.
- Dokunmatik cihazlarda başlık "dokun / tap", Mac'te "tıkla / click".

Yeniden üretme: `bash store/_src/render.sh iphone|ipad|mac` (şablon `store/_src/screens/`).

Arşiv: Chrome kaynaklı eski iPhone/iPad kareleri
`store/arsiv/apple-chrome-kaynakli-2026-10-28/{tr,en}/{iphone,ipad}/` (`git mv`);
eski host app açılış kareleri `store/arsiv/apple-hostapp-acilis/`.

## Başlık rakamlarının kanıtı

| Set | Başlık rakamı | Görüldüğü ham kare |
|---|---|---|
| TR iPhone 01 | 50.000 TL · 8 saat · 22 gün | `raw-safari/iphone/tr/04-popup.png` |
| TR iPhone 01 | 8.149 TL → 3,6 gün | `02-eklenti-kapali.png` (adidas, 8.149 TL) → `01-eklenti-acik.png` (3,6 gün) |
| TR iPhone 02 | 711,56 TL → 2,5 saat · 690,21 TL → 2,4 saat | `02` (pasyone 711,56 TL; Plus ile 690,21 TL) → `01` (2,5 saat; Plus ile 2,4 saat) |
| TR iPhone 03 | 6,7 saat → 1.899,99 TL | `03a-cip-dokunmadan-once.png` (Sepette 6,7 saat) → `03-cipe-dokunuldu.png` (Sepette 1.899,99 TL) |
| TR iPhone 04 | ₺284,09 · ₺2.272,73 | `04-popup.png` |
| TR iPhone 05 | Kira 7,9 gün · sana kalan 14 gün · 22 gün | `05-giderler-halka.png` |
| TR iPad 01 | 50.000 TL · 8 · 22 | `raw-safari/ipad/tr/04-popup.png` |
| TR iPad 01 | 921,89 TL → 3,2 saat | `02` (Dark Seer 921,89 TL) → `01` (3,2 saat) |
| TR iPad 02 | 1.899,99 TL → 6,7 saat · 1.197,82 TL → 4,2 saat | `02` (Marjin ×3 1.899,99 TL; McDark 1.197,82 TL) → `01` (6,7 saat; 4,2 saat) |
| TR iPad 03 | 3,2 saat → 921,89 TL | `03a` → `03` (Dark Seer, listede) |
| TR iPad 04 | ₺284,09 · ₺2.272,73 | `04-popup.png` (popover) |
| TR iPad 05 | 7,9 gün · 14 gün · 22 gün | `05-giderler-halka.png` |
| EN iPhone 01 | $5,000 · 8 h · 22 days | `raw-safari/iphone/en/04-popup.png` |
| EN iPhone 01 | $159.99 → 5.6 hours | `02` (ECCO $159.99) → `01` (5.6 hours) |
| EN iPhone 02 | $105 → 3.7 hours · $65 → 2.3 hours | `02` (Nike $105, SKECHERS $65) → `01` (3.7 / 2.3 hours) |
| EN iPhone 03 | 2.3 hours → $65 | `03a` → `03` (SKECHERS Go Run Consistent 3, listede) |
| EN iPhone 04 | $28.41 · $227.27 | `04-popup.png` (`9f9b9e8`, hata A yok) |
| EN iPhone 05 | Rent 6.6 days · left for you 15 days · 22-day | `05-giderler-halka.png` (`9f9b9e8`) |
| EN iPad 01 | $5,000 · 8 · 22 | `raw-safari/ipad/en/04-popup.png` |
| EN iPad 01 | $159.99 → 5.6 hours | `02` (ECCO Soft 7 $159.99) → `01` (5.6 hours) |
| EN iPad 02 | $105 → 3.7 hours · $130 → 4.6 hours | `02` (Nike $105, L.L.Bean $130) → `01` (3.7 / 4.6 hours) |
| EN iPad 03 | 2.3 hours → $65 | `03a` → `03` (SKECHERS Core Track, 1. dokunuş) |
| EN iPad 04 | $28.41 · $227.27 | `04-popup.png` (popover, `9f9b9e8`) |
| EN iPad 05 | 6.6 days · 15 days · 22 days | `05-giderler-halka.png` (`9f9b9e8`) |

Sağlama (README): TR 8.149/284,09/8 = 3,59 gün; 711,56/284,09 = 2,50; 921,89/284,09 = 3,25;
1.197,82/284,09 = 4,22; 1.899,99/284,09 = 6,69. EN 105/28,41 = 3,70; 65/28,41 = 2,29;
159,99/28,41 = 5,63; 130/28,41 = 4,58.

## Dosyalar

#### TR · iphone

| Dosya | Piksel · alfa | Ham kaynak | Kaynak |
|---|---|---|---|
| `tr/iphone/01-sayfada-sureler.png` | 1206×2622 · alfa yok | `raw-safari/iphone/tr/01-eklenti-acik.png` | gerçek Safari (iOS 27 simülatör), derleme `264072b` |
| `tr/iphone/02-oncesi-sonrasi.png` | 1206×2622 · alfa yok | `raw-safari/iphone/tr/02-eklenti-kapali.png` + `…/01-eklenti-acik.png` | gerçek Safari (iOS 27 simülatör), derleme `264072b` |
| `tr/iphone/03-dokun-fiyat-geri.png` | 1206×2622 · alfa yok | `raw-safari/iphone/tr/03a-cip-dokunmadan-once.png` + `…/03-cipe-dokunuldu.png` | gerçek Safari (iOS 27 simülatör), derleme `264072b` (ürün sayfası) |
| `tr/iphone/04-ayar-paneli.png` | 1206×2622 · alfa yok | `raw-safari/iphone/tr/04-popup.png` | gerçek Safari (iOS 27 simülatör), derleme `264072b` |
| `tr/iphone/05-giderler-halka.png` | 1206×2622 · alfa yok | `raw-safari/iphone/tr/05-giderler-halka.png` | gerçek Safari (iOS 27 simülatör), derleme `264072b` |

#### TR · ipad

| Dosya | Piksel · alfa | Ham kaynak | Kaynak |
|---|---|---|---|
| `tr/ipad/01-sayfada-sureler.png` | 2064×2752 · alfa yok | `raw-safari/ipad/tr/01-eklenti-acik.png` | gerçek Safari (iOS 27 simülatör), derleme `264072b` |
| `tr/ipad/02-oncesi-sonrasi.png` | 2064×2752 · alfa yok | `raw-safari/ipad/tr/02-eklenti-kapali.png` + `…/01-eklenti-acik.png` | gerçek Safari (iOS 27 simülatör), derleme `264072b` |
| `tr/ipad/03-dokun-fiyat-geri.png` | 2064×2752 · alfa yok | `raw-safari/ipad/tr/03a-cip-dokunmadan-once.png` + `…/03-cipe-dokunuldu.png` | gerçek Safari (iOS 27 simülatör), derleme `264072b` |
| `tr/ipad/04-ayar-paneli.png` | 2064×2752 · alfa yok | `raw-safari/ipad/tr/04-popup.png` | gerçek Safari (iOS 27 simülatör), derleme `264072b` |
| `tr/ipad/05-giderler-halka.png` | 2064×2752 · alfa yok | `raw-safari/ipad/tr/05-giderler-halka.png` | gerçek Safari (iOS 27 simülatör), derleme `264072b` |

#### TR · mac

| Dosya | Piksel · alfa | Ham kaynak | Kaynak |
|---|---|---|---|
| `tr/mac/01-sayfada-sureler.png` | 2880×1800 · alfa yok | `raw/tr/desktop/01-eklenti-acik.png` | Chrome kaynaklı, macOS Safari çekimi bekliyor |
| `tr/mac/02-oncesi-sonrasi.png` | 2880×1800 · alfa yok | `raw/tr/desktop/02-eklenti-kapali.png` + `raw/tr/desktop/01-eklenti-acik.png` | Chrome kaynaklı, macOS Safari çekimi bekliyor |
| `tr/mac/03-tikla-fiyat-geri.png` | 2880×1800 · alfa yok | `raw/tr/desktop/01-eklenti-acik.png` + `raw/tr/desktop/03-cipe-tiklandi.png` | Chrome kaynaklı, macOS Safari çekimi bekliyor |
| `tr/mac/04-ayar-paneli.png` | 2880×1800 · alfa yok | `raw/tr/iphone/04-ayar-paneli.png` | Chrome kaynaklı, macOS Safari çekimi bekliyor |
| `tr/mac/05-giderler-halka.png` | 2880×1800 · alfa yok | `raw/tr/desktop/05-giderler-halka.png` | Chrome kaynaklı, macOS Safari çekimi bekliyor |

#### EN · iphone

| Dosya | Piksel · alfa | Ham kaynak | Kaynak |
|---|---|---|---|
| `en/iphone/01-hours-on-page.png` | 1206×2622 · alfa yok | `raw-safari/iphone/en/01-eklenti-acik.png` | gerçek Safari (iOS 27 simülatör), derleme `264072b` |
| `en/iphone/02-before-after.png` | 1206×2622 · alfa yok | `raw-safari/iphone/en/02-eklenti-kapali.png` + `…/01-eklenti-acik.png` | gerçek Safari (iOS 27 simülatör), derleme `264072b` |
| `en/iphone/03-tap-for-price.png` | 1206×2622 · alfa yok | `raw-safari/iphone/en/03a-cip-dokunmadan-once.png` + `…/03-cipe-dokunuldu.png` | gerçek Safari (iOS 27 simülatör), derleme `264072b` |
| `en/iphone/04-settings-panel.png` | 1206×2622 · alfa yok | `raw-safari/iphone/en/04-popup.png` | gerçek Safari (iOS 27 simülatör), derleme `9f9b9e8` |
| `en/iphone/05-expenses-donut.png` | 1206×2622 · alfa yok | `raw-safari/iphone/en/05-giderler-halka.png` | gerçek Safari (iOS 27 simülatör), derleme `9f9b9e8` |

#### EN · ipad

| Dosya | Piksel · alfa | Ham kaynak | Kaynak |
|---|---|---|---|
| `en/ipad/01-hours-on-page.png` | 2064×2752 · alfa yok | `raw-safari/ipad/en/01-eklenti-acik.png` | gerçek Safari (iOS 27 simülatör), derleme `9f9b9e8` |
| `en/ipad/02-before-after.png` | 2064×2752 · alfa yok | `raw-safari/ipad/en/02-eklenti-kapali.png` + `…/01-eklenti-acik.png` | gerçek Safari (iOS 27 simülatör), derleme `9f9b9e8` |
| `en/ipad/03-tap-for-price.png` | 2064×2752 · alfa yok | `raw-safari/ipad/en/03a-cip-dokunmadan-once.png` + `…/03-cipe-dokunuldu.png` | gerçek Safari (iOS 27 simülatör), derleme `9f9b9e8` |
| `en/ipad/04-settings-panel.png` | 2064×2752 · alfa yok | `raw-safari/ipad/en/04-popup.png` | gerçek Safari (iOS 27 simülatör), derleme `9f9b9e8` |
| `en/ipad/05-expenses-donut.png` | 2064×2752 · alfa yok | `raw-safari/ipad/en/05-giderler-halka.png` | gerçek Safari (iOS 27 simülatör), derleme `9f9b9e8` |

#### EN · mac

| Dosya | Piksel · alfa | Ham kaynak | Kaynak |
|---|---|---|---|
| `en/mac/01-hours-on-page.png` | 2880×1800 · alfa yok | `raw/en/desktop/01-eklenti-acik.png` | Chrome kaynaklı, macOS Safari çekimi bekliyor |
| `en/mac/02-before-after.png` | 2880×1800 · alfa yok | `raw/en/desktop/02-eklenti-kapali.png` + `raw/en/desktop/01-eklenti-acik.png` | Chrome kaynaklı, macOS Safari çekimi bekliyor |
| `en/mac/03-click-for-price.png` | 2880×1800 · alfa yok | `raw/en/desktop/01-eklenti-acik.png` + `raw/en/desktop/03-cipe-tiklandi.png` | Chrome kaynaklı, macOS Safari çekimi bekliyor |
| `en/mac/04-settings-panel.png` | 2880×1800 · alfa yok | `raw/en/iphone/04-ayar-paneli.png` | Chrome kaynaklı, macOS Safari çekimi bekliyor |
| `en/mac/05-expenses-donut.png` | 2880×1800 · alfa yok | `raw/en/desktop/05-giderler-halka.png` | Chrome kaynaklı, macOS Safari çekimi bekliyor |
