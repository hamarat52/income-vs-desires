# Ham ekran görüntüleri (TR + EN)

**Chrome görüntü alanı — Safari'de çekilince Apple setinde değiştirilecek.**
Tarayıcı çerçevesi yok; ImageArtist çerçeveleyip başlık ekleyecek. Sahte arayüz,
kompozit ya da rötuş yok: her kare gerçek eklentinin gerçek sitede çalışan
hâlidir.

## Nasıl çekildi

- Tarayıcı: Google Chrome (branded) headless, **geçici profil** (ajan tarayıcısı
  9333'e dokunulmadı). Eklenti bu worktree'den CDP `Extensions.loadUnpacked`
  ile yüklendi (`--remote-debugging-pipe --enable-unsafe-extension-debugging`).
- Dil: macOS'ta `--lang` arayüz dilini değiştirmiyor; TR için Cocoa argümanı
  `-AppleLanguages (tr)` (yalnız o süreç), EN için `(en-US)`. Eklentide
  `chrome.i18n.getUILanguage()` TR'de `tr`, EN'de `en-US` döndü.
  `--accept-lang` TR `tr-TR,tr`, EN `en-US,en`.
- Kimlik: masaüstünde aynı sürümün normal Chrome UA'sı (`HeadlessChrome` UA'sı
  Trendyol ve LCW'de bot duvarına takıldı). iPhone/iPad'de iOS Safari UA + dokunma
  emülasyonu (`Emulation.setDeviceMetricsOverride mobile:true`) — sitenin mobil
  düzeni Chrome'da çizildi, Safari değil.
- **Örnek kullanıcı verisi** (gerçek kişi değil):
  - TR: 50.000 TRY · 8 saat · 22 gün (saatlik ₺284,09); giderler Kira 18.000,
    Netflix 280, Spotify 100, Telefon taksiti 2.500 (TRY, aylık).
  - EN: 5,000 USD · 8 h · 22 days (hourly $28.41); Rent 1,500, Netflix 15.49,
    Spotify 11.99, Phone plan 60 (USD, monthly).
  - Kurlar arka plan servisinin gerçek çekimi (Frankfurter/ECB 2026-10-27:
    EUR 1 · USD 1,115 · GBP 0,83658 · TRY 55,513); sayfa ve maaş aynı para
    biriminde olduğu için karelerde kur etkisi yok.
- Kare 2, kare 1 ile **aynı sayfa yüklemesi**: eklentinin kendi
  `storage.sync.enabled=false` ayarı yazıldı, içerik betiği fiyatları geri koydu.
- Kare 3: görünür ikinci çipe **gerçek tıklama** (CDP `Input.dispatchMouseEvent`).
- Kare 4: eklentinin gerçek `popup.html`'i, mağaza sekmesiyle **aynı pencerede**
  arka plan sekmesinde (panelin `tabs.query` ile gördüğü aktif sekme = mağaza
  sayfası), 300 px genişlik, içerik boyu. `chrome.action.openPopup()` headless'ta
  açıldı ama yüzeyi 300×300 çizilip kare tekrarladığı için kullanılmadı. Fark:
  `activeTab` izni yalnız kullanıcı simgeye tıklayınca verildiği için
  "Turn off for www.ikea.com / … için kapat" düğmesi görünmüyor.
- Sayfa konumu: ilk ekran boyu içinde en çok fiyatın göründüğü kaydırma
  seçildi; çerez/uygulama kartları sitenin kendi "Ok"/"Close" düğmesiyle kapatıldı.

## Dosyalar

### TR · Masaüstü 1280×800 @2x

Chrome: `Chrome/156.0.8078.73` · UA: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36` · Accept-Language: `tr-TR,tr`

| Dosya | Sahne | Piksel | URL | Saat (İstanbul) | Not |
|---|---|---|---|---|---|
| `01-eklenti-acik.png` | 1 · eklenti açık, fiyatlar süre | 2560×1600 | https://www.trendyol.com/sr?q=spor%20ayakkab%C4%B1 | 28.10.2026 18:00:15 | eklenti açık; görünür çip 12, sayfada 91 |
| `02-eklenti-kapali.png` | 2 · aynı kare, eklenti kapalı (öncesi) | 2560×1600 | https://www.trendyol.com/sr?q=spor%20ayakkab%C4%B1 | 28.10.2026 18:00:19 | aynı sayfa yüklemesi, enabled=false; sayfada çip 0 |
| `03-cipe-tiklandi.png` | 3 · çipe tıklandı, fiyata döndü | 2560×1600 | https://www.trendyol.com/sr?q=spor%20ayakkab%C4%B1 | 28.10.2026 18:00:24 | "7 saat" çipine gerçek tıklama (CDP Input) → fiyata döndü: ["1.999,99 TL"] |
| `04-ayar-paneli.png` | 4 · ayar paneli (gerçek popup.html) | 600×1128 | chrome-extension://kbkicnlinfcjeenkogafebeopbodkkdf/src/popup.html | 28.10.2026 18:00:30 | gerçek popup.html, 300×564 CSS px @2x, mağaza sekmesiyle aynı pencerede (aynı pencere: true); site düğmesi görünür: false; Bir saatin ≈ ₺284,09 · bir mesai ≈ ₺2.272,73; Kurlar güncel (28.10.2026). |
| `05-giderler-halka.png` | 5 · Giderler + halka grafik | 2560×1600 | chrome-extension://kbkicnlinfcjeenkogafebeopbodkkdf/src/options.html | 28.10.2026 18:00:34 | Giderler sayfası, "AYIN NEREYE GİDİYOR KİRA 7,9 gün %36 · ayda 63,4 saat DİJİTAL ABONELİK 1,3 saat %0,8 · ayda 1,3 saat TAKSİT 1,1 gün %5 · ayda 8,8 saat SANA KALAN 13 gün %58,2 ·" |
| `06-test-edilmis-siteler.png` | 6 · Giderler › test edilmiş siteler | 2560×1600 | chrome-extension://kbkicnlinfcjeenkogafebeopbodkkdf/src/options.html | 28.10.2026 18:00:35 | Giderler › test edilmiş siteler açık (12 satır) |

### TR · iPhone görünümü 402×874 @3x (mobil emülasyon)

Chrome: `Chrome/156.0.8078.73` · UA: `Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1` · Accept-Language: `tr-TR,tr`

| Dosya | Sahne | Piksel | URL | Saat (İstanbul) | Not |
|---|---|---|---|---|---|
| `01-eklenti-acik.png` | 1 · eklenti açık, fiyatlar süre | 1206×2622 | https://www.trendyol.com/sr?q=spor%20ayakkab%C4%B1 | 28.10.2026 18:01:34 | eklenti açık; görünür çip 6, sayfada 86 |
| `02-eklenti-kapali.png` | 2 · aynı kare, eklenti kapalı (öncesi) | 1206×2622 | https://www.trendyol.com/sr?q=spor%20ayakkab%C4%B1 | 28.10.2026 18:01:37 | aynı sayfa yüklemesi, enabled=false; sayfada çip 0 |
| `03-cipe-tiklandi.png` | 3 · çipe tıklandı, fiyata döndü | 1206×2622 | https://www.trendyol.com/sr?q=spor%20ayakkab%C4%B1 | 28.10.2026 18:01:42 | "7 saat" çipine gerçek tıklama (CDP Input) → fiyata döndü: ["1.999,99 TL"] |
| `04-ayar-paneli.png` | 4 · ayar paneli (gerçek popup.html) | 900×1692 | chrome-extension://kbkicnlinfcjeenkogafebeopbodkkdf/src/popup.html | 28.10.2026 18:01:47 | gerçek popup.html, 300×564 CSS px @3x, mağaza sekmesiyle aynı pencerede (aynı pencere: true); site düğmesi görünür: false; Bir saatin ≈ ₺284,09 · bir mesai ≈ ₺2.272,73; Kurlar güncel (28.10.2026). |
| `05-giderler-halka.png` | 5 · Giderler + halka grafik | 1206×2622 | chrome-extension://kbkicnlinfcjeenkogafebeopbodkkdf/src/options.html | 28.10.2026 18:01:51 | Giderler sayfası, "AYIN NEREYE GİDİYOR KİRA 7,9 gün %36 · ayda 63,4 saat DİJİTAL ABONELİK 1,3 saat %0,8 · ayda 1,3 saat TAKSİT 1,1 gün %5 · ayda 8,8 saat SANA KALAN 13 gün %58,2 ·" |
| `06-test-edilmis-siteler.png` | 6 · Giderler › test edilmiş siteler | 1206×2622 | chrome-extension://kbkicnlinfcjeenkogafebeopbodkkdf/src/options.html | 28.10.2026 18:01:52 | Giderler › test edilmiş siteler açık (12 satır) |

### TR · iPad görünümü 1032×1376 @2x (mobil emülasyon)

Chrome: `Chrome/156.0.8078.73` · UA: `Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1` · Accept-Language: `tr-TR,tr`

| Dosya | Sahne | Piksel | URL | Saat (İstanbul) | Not |
|---|---|---|---|---|---|
| `01-eklenti-acik.png` | 1 · eklenti açık, fiyatlar süre | 2064×2752 | https://www.trendyol.com/sr?q=spor%20ayakkab%C4%B1 | 28.10.2026 18:02:48 | eklenti açık; görünür çip 6, sayfada 86 |
| `02-eklenti-kapali.png` | 2 · aynı kare, eklenti kapalı (öncesi) | 2064×2752 | https://www.trendyol.com/sr?q=spor%20ayakkab%C4%B1 | 28.10.2026 18:02:50 | aynı sayfa yüklemesi, enabled=false; sayfada çip 0 |
| `03-cipe-tiklandi.png` | 3 · çipe tıklandı, fiyata döndü | 2064×2752 | https://www.trendyol.com/sr?q=spor%20ayakkab%C4%B1 | 28.10.2026 18:02:55 | "7 saat" çipine gerçek tıklama (CDP Input) → fiyata döndü: ["1.999,99 TL"] |
| `04-ayar-paneli.png` | 4 · ayar paneli (gerçek popup.html) | 600×1128 | chrome-extension://kbkicnlinfcjeenkogafebeopbodkkdf/src/popup.html | 28.10.2026 18:02:59 | gerçek popup.html, 300×564 CSS px @2x, mağaza sekmesiyle aynı pencerede (aynı pencere: true); site düğmesi görünür: false; Bir saatin ≈ ₺284,09 · bir mesai ≈ ₺2.272,73; Kurlar güncel (28.10.2026). |
| `05-giderler-halka.png` | 5 · Giderler + halka grafik | 2064×2752 | chrome-extension://kbkicnlinfcjeenkogafebeopbodkkdf/src/options.html | 28.10.2026 18:03:02 | Giderler sayfası, "AYIN NEREYE GİDİYOR KİRA 7,9 gün %36 · ayda 63,4 saat DİJİTAL ABONELİK 1,3 saat %0,8 · ayda 1,3 saat TAKSİT 1,1 gün %5 · ayda 8,8 saat SANA KALAN 13 gün %58,2 ·" |
| `06-test-edilmis-siteler.png` | 6 · Giderler › test edilmiş siteler | 2064×2752 | chrome-extension://kbkicnlinfcjeenkogafebeopbodkkdf/src/options.html | 28.10.2026 18:03:04 | Giderler › test edilmiş siteler açık (12 satır) |

### EN · Masaüstü 1280×800 @2x

Chrome: `Chrome/156.0.8078.73` · UA: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36` · Accept-Language: `en-US,en`

| Dosya | Sahne | Piksel | URL | Saat (İstanbul) | Not |
|---|---|---|---|---|---|
| `01-eklenti-acik.png` | 1 · eklenti açık, fiyatlar süre | 2560×1600 | https://www.ikea.com/us/en/search/?q=desk%20lamp | 28.10.2026 18:00:55 | eklenti açık; görünür çip 10, sayfada 40 |
| `02-eklenti-kapali.png` | 2 · aynı kare, eklenti kapalı (öncesi) | 2560×1600 | https://www.ikea.com/us/en/search/?q=desk%20lamp | 28.10.2026 18:00:59 | aynı sayfa yüklemesi, enabled=false; sayfada çip 0 |
| `03-cipe-tiklandi.png` | 3 · çipe tıklandı, fiyata döndü | 2560×1600 | https://www.ikea.com/us/en/search/?q=desk%20lamp | 28.10.2026 18:01:04 | "1.4 hours" çipine gerçek tıklama (CDP Input) → fiyata döndü: ["$39.99"] |
| `04-ayar-paneli.png` | 4 · ayar paneli (gerçek popup.html) | 600×1128 | chrome-extension://kbkicnlinfcjeenkogafebeopbodkkdf/src/popup.html | 28.10.2026 18:01:10 | gerçek popup.html, 300×564 CSS px @2x, mağaza sekmesiyle aynı pencerede (aynı pencere: true); site düğmesi görünür: false; One hour of your work ≈ $28.41 · one workday ≈ $227.27; Exchange rates up to date (10/28/2026). |
| `05-giderler-halka.png` | 5 · Giderler + halka grafik | 2560×1600 | chrome-extension://kbkicnlinfcjeenkogafebeopbodkkdf/src/options.html | 28.10.2026 18:01:14 | Giderler sayfası, "WHERE YOUR MONTH GOES RENT 6.6 days 30% · 52.8 hours a month DIGITAL SUBSCRIPTION 58 min 0.5% · 1 hour a month OTHER 2.1 hours 1.2% · 2.1 hours a month LEFT FOR" |
| `06-test-edilmis-siteler.png` | 6 · Giderler › test edilmiş siteler | 2560×1600 | chrome-extension://kbkicnlinfcjeenkogafebeopbodkkdf/src/options.html | 28.10.2026 18:01:14 | Giderler › test edilmiş siteler açık (12 satır) |

### EN · iPhone görünümü 402×874 @3x (mobil emülasyon)

Chrome: `Chrome/156.0.8078.73` · UA: `Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1` · Accept-Language: `en-US,en`

| Dosya | Sahne | Piksel | URL | Saat (İstanbul) | Not |
|---|---|---|---|---|---|
| `01-eklenti-acik.png` | 1 · eklenti açık, fiyatlar süre | 1206×2622 | https://www.ikea.com/us/en/search/?q=desk%20lamp | 28.10.2026 18:02:13 | eklenti açık; görünür çip 3, sayfada 40 |
| `02-eklenti-kapali.png` | 2 · aynı kare, eklenti kapalı (öncesi) | 1206×2622 | https://www.ikea.com/us/en/search/?q=desk%20lamp | 28.10.2026 18:02:15 | aynı sayfa yüklemesi, enabled=false; sayfada çip 0 |
| `03-cipe-tiklandi.png` | 3 · çipe tıklandı, fiyata döndü | 1206×2622 | https://www.ikea.com/us/en/search/?q=desk%20lamp | 28.10.2026 18:02:20 | "1.4 hours" çipine gerçek tıklama (CDP Input) → fiyata döndü: ["$39.99"] |
| `04-ayar-paneli.png` | 4 · ayar paneli (gerçek popup.html) | 900×1692 | chrome-extension://kbkicnlinfcjeenkogafebeopbodkkdf/src/popup.html | 28.10.2026 18:02:24 | gerçek popup.html, 300×564 CSS px @3x, mağaza sekmesiyle aynı pencerede (aynı pencere: true); site düğmesi görünür: false; One hour of your work ≈ $28.41 · one workday ≈ $227.27; Exchange rates up to date (10/28/2026). |
| `05-giderler-halka.png` | 5 · Giderler + halka grafik | 1206×2622 | chrome-extension://kbkicnlinfcjeenkogafebeopbodkkdf/src/options.html | 28.10.2026 18:02:27 | Giderler sayfası, "WHERE YOUR MONTH GOES RENT 6.6 days 30% · 52.8 hours a month DIGITAL SUBSCRIPTION 58 min 0.5% · 1 hour a month OTHER 2.1 hours 1.2% · 2.1 hours a month LEFT FOR" |
| `06-test-edilmis-siteler.png` | 6 · Giderler › test edilmiş siteler | 1206×2622 | chrome-extension://kbkicnlinfcjeenkogafebeopbodkkdf/src/options.html | 28.10.2026 18:02:28 | Giderler › test edilmiş siteler açık (12 satır) |

### EN · iPad görünümü 1032×1376 @2x (mobil emülasyon)

Chrome: `Chrome/156.0.8078.73` · UA: `Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1` · Accept-Language: `en-US,en`

| Dosya | Sahne | Piksel | URL | Saat (İstanbul) | Not |
|---|---|---|---|---|---|
| `01-eklenti-acik.png` | 1 · eklenti açık, fiyatlar süre | 2064×2752 | https://www.ikea.com/us/en/search/?q=desk%20lamp | 28.10.2026 18:03:20 | eklenti açık; görünür çip 12, sayfada 40 |
| `02-eklenti-kapali.png` | 2 · aynı kare, eklenti kapalı (öncesi) | 2064×2752 | https://www.ikea.com/us/en/search/?q=desk%20lamp | 28.10.2026 18:03:22 | aynı sayfa yüklemesi, enabled=false; sayfada çip 0 |
| `03-cipe-tiklandi.png` | 3 · çipe tıklandı, fiyata döndü | 2064×2752 | https://www.ikea.com/us/en/search/?q=desk%20lamp | 28.10.2026 18:03:26 | "2.1 hours" çipine gerçek tıklama (CDP Input) → fiyata döndü: ["$59.99"] |
| `04-ayar-paneli.png` | 4 · ayar paneli (gerçek popup.html) | 600×1128 | chrome-extension://kbkicnlinfcjeenkogafebeopbodkkdf/src/popup.html | 28.10.2026 18:03:30 | gerçek popup.html, 300×564 CSS px @2x, mağaza sekmesiyle aynı pencerede (aynı pencere: true); site düğmesi görünür: false; One hour of your work ≈ $28.41 · one workday ≈ $227.27; Exchange rates up to date (10/28/2026). |
| `05-giderler-halka.png` | 5 · Giderler + halka grafik | 2064×2752 | chrome-extension://kbkicnlinfcjeenkogafebeopbodkkdf/src/options.html | 28.10.2026 18:03:34 | Giderler sayfası, "WHERE YOUR MONTH GOES RENT 6.6 days 30% · 52.8 hours a month DIGITAL SUBSCRIPTION 58 min 0.5% · 1 hour a month OTHER 2.1 hours 1.2% · 2.1 hours a month LEFT FOR" |
| `06-test-edilmis-siteler.png` | 6 · Giderler › test edilmiş siteler | 2064×2752 | chrome-extension://kbkicnlinfcjeenkogafebeopbodkkdf/src/options.html | 28.10.2026 18:03:35 | Giderler › test edilmiş siteler açık (12 satır) |

## Saha notu (EN sayfa seçimi, 28.10.2026)

USD fiyatlı aday sayfalar aynı headless profille denendi
(ham çıktı: `store/raw/probe-en-2026-10-28.jsonl`, sayfa başına `chips` = çevrilen fiyat):

| Site | Sonuç |
|---|---|
| IKEA US (`/us/en/search/?q=desk lamp`) | açıldı, **40 fiyat** çevrildi → EN kareleri |
| Zappos (`/sneakers`) | açıldı, **283 fiyat** çevrildi (çerez kartı büyük; seçilmedi) |
| Target | açıldı, fiyatlar 8 sn'de yüklenmedi (sayfada `$`+rakam yok) — 0 çip; eklenti hatası değil |
| Newegg, Walmart, Wayfair, LEGO | bot doğrulaması / engel sayfası |
| Home Depot, Kohl's, Macy's | Access Denied (Akamai) |
| eBay | hata sayfası; REI: HTTP2 hatası; Best Buy: ülke seçim sayfası |

Gerçek ürün bulgusu: IKEA US'de ürün kartını kaplayan şeffaf link çipin üstünde
kaldığı için çipe tıklamak ürün sayfasına gidiyordu. Düzeltildi (commit
`3e520a8`, `content.js chipUnder`); kare 3 düzeltmeden sonra çekildi.
