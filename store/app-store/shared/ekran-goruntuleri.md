# App Store ekran görüntüleri (TR birincil, EN yerelleştirme)

Durum 28.10.2026 (ImageArtist). Boyutlar Apple "Screenshot specifications"
(https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications)
ve PM'in 28.10 doğrulaması:

| Cihaz sınıfı | Zorunluluk | Bu set |
|---|---|---|
| iPhone, Dynamic Island orta ekran | zorunlu | **1206 × 2622**, 5 kare/dil |
| iPhone büyük ekran (1320 × 2868) | isteğe bağlı (yoksa ölçeklenir) | yok |
| iPad 13" | zorunlu (uygulama iPad'de çalışıyor) | **2064 × 2752**, 5 kare/dil |
| Mac (16:10) | zorunlu | **2880 × 1800**, 5 kare/dil |

Hepsi PNG, alfa yok (`sips -g hasAlpha` → `no`, Pillow modu `RGB`).

## Kaynak ve dürüstlük — ÖNEMLİ

**Kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek.**
Tüm kareler `store/raw/<dil>/<cihaz>/` altındaki gerçek ham çekimlerin
kırpımıdır (Google Chrome 156 headless, gerçek eklenti, gerçek site; iPhone/iPad
için iOS Safari UA + dokunma emülasyonu — sitenin mobil düzeni Chrome'da çizildi).
Ayrıntı: [`../../raw/README.md`](../../raw/README.md).

- Tarayıcı çerçevesi yok; ham karelerde zaten yoktu. Çerçeve **tarafsız cihaz
  kenarı** (koyu yuvarlak köşe) ya da ince kart; "Safari" çerçevesi çizilmedi.
- Rehber 2.3.10: hiçbir karede "Chrome" yazısı, Chrome arayüzü, Google logosu yok.
- Rehber 2.3.7: fiyat/"ücretsiz" ifadesi yok. Görünen fiyatlar sitenin ürün
  fiyatları (eklentinin çevirdiği/geri koyduğu değerler), uygulamanın fiyatı değil.
- Rehber 2.3.9: site logoları kırpım dışında (Trendyol üst bandı, Marjin satıcı
  logosu, IKEA başlığı görünmüyor). Ürün adlarında marka metni kalıyor (adidas,
  Riccon, "IKEA Family price" etiketi) — küçük, ürün kartının parçası.
- Rehber 2.3.3: her kare eklentiyi kullanımda gösteriyor (açılış ekranı yok).
- Örnek maaş gerçek kişi verisi değil: TR 50.000 TL · 8 saat · 22 gün; EN
  $5,000 · 8 h · 22 days. Başlıklardaki her rakam ham karenin `meta.json`
  çiplerinden okundu.
- Ayar paneli (04): `raw/<dil>/iphone/04-ayar-paneli.png` — gerçek `popup.html`,
  gerçek popup genişliği (300 CSS px) @3x; Mac ve iPad'de de bu kare (daha keskin).
- Yakınlaştırma: iPad TR 01'de aynı ham karenin çip bölgeleri yeşil kenarlı kartla
  büyütüldü; 02/03'te yalnız çip bölgeleri kırpıldı (PM notu: iPad'de çipler küçük).
  Kırmızı çerçeve (03) tıklanan çipi işaretler; arayüze ait değildir.
- Dokunmatik cihazlarda başlık "dokun / tap", Mac'te "tıkla / click".

Yeniden üretme: `bash store/_src/render.sh mac|iphone|ipad` (şablon
`store/_src/screens/`, kırpımlar `scenes.js`).

Eski host app açılış kareleri (yalnız açılış ekranı, Rehber 2.3.3'ü
karşılamıyordu) `store/arsiv/apple-hostapp-acilis/` altına taşındı.

## Dosyalar

#### TR · iphone

| Dosya | Piksel · alfa | Ham kaynak | Not |
|---|---|---|---|
| `tr/iphone/01-sayfada-sureler.png` | 1206×2622 · alfa yok | `raw/tr/iphone/01-eklenti-acik.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `tr/iphone/02-oncesi-sonrasi.png` | 1206×2622 · alfa yok | `raw/tr/iphone/02-eklenti-kapali.png` + `raw/tr/iphone/01-eklenti-acik.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `tr/iphone/03-dokun-fiyat-geri.png` | 1206×2622 · alfa yok | `raw/tr/iphone/01-eklenti-acik.png` + `raw/tr/iphone/03-cipe-tiklandi.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `tr/iphone/04-ayar-paneli.png` | 1206×2622 · alfa yok | `raw/tr/iphone/04-ayar-paneli.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `tr/iphone/05-giderler-halka.png` | 1206×2622 · alfa yok | `raw/tr/iphone/05-giderler-halka.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |

#### TR · ipad

| Dosya | Piksel · alfa | Ham kaynak | Not |
|---|---|---|---|
| `tr/ipad/01-sayfada-sureler.png` | 2064×2752 · alfa yok | `raw/tr/ipad/01-eklenti-acik.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `tr/ipad/02-oncesi-sonrasi.png` | 2064×2752 · alfa yok | `raw/tr/ipad/02-eklenti-kapali.png` + `raw/tr/ipad/01-eklenti-acik.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `tr/ipad/03-dokun-fiyat-geri.png` | 2064×2752 · alfa yok | `raw/tr/ipad/01-eklenti-acik.png` + `raw/tr/ipad/03-cipe-tiklandi.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `tr/ipad/04-ayar-paneli.png` | 2064×2752 · alfa yok | `raw/tr/iphone/04-ayar-paneli.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `tr/ipad/05-giderler-halka.png` | 2064×2752 · alfa yok | `raw/tr/ipad/05-giderler-halka.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |

#### TR · mac

| Dosya | Piksel · alfa | Ham kaynak | Not |
|---|---|---|---|
| `tr/mac/01-sayfada-sureler.png` | 2880×1800 · alfa yok | `raw/tr/desktop/01-eklenti-acik.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `tr/mac/02-oncesi-sonrasi.png` | 2880×1800 · alfa yok | `raw/tr/desktop/02-eklenti-kapali.png` + `raw/tr/desktop/01-eklenti-acik.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `tr/mac/03-tikla-fiyat-geri.png` | 2880×1800 · alfa yok | `raw/tr/desktop/01-eklenti-acik.png` + `raw/tr/desktop/03-cipe-tiklandi.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `tr/mac/04-ayar-paneli.png` | 2880×1800 · alfa yok | `raw/tr/iphone/04-ayar-paneli.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `tr/mac/05-giderler-halka.png` | 2880×1800 · alfa yok | `raw/tr/desktop/05-giderler-halka.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |

#### EN · iphone

| Dosya | Piksel · alfa | Ham kaynak | Not |
|---|---|---|---|
| `en/iphone/01-hours-on-page.png` | 1206×2622 · alfa yok | `raw/en/iphone/01-eklenti-acik.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `en/iphone/02-before-after.png` | 1206×2622 · alfa yok | `raw/en/iphone/02-eklenti-kapali.png` + `raw/en/iphone/01-eklenti-acik.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `en/iphone/03-tap-for-price.png` | 1206×2622 · alfa yok | `raw/en/iphone/01-eklenti-acik.png` + `raw/en/iphone/03-cipe-tiklandi.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `en/iphone/04-settings-panel.png` | 1206×2622 · alfa yok | `raw/en/iphone/04-ayar-paneli.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `en/iphone/05-expenses-donut.png` | 1206×2622 · alfa yok | `raw/en/iphone/05-giderler-halka.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |

#### EN · ipad

| Dosya | Piksel · alfa | Ham kaynak | Not |
|---|---|---|---|
| `en/ipad/01-hours-on-page.png` | 2064×2752 · alfa yok | `raw/en/ipad/01-eklenti-acik.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `en/ipad/02-before-after.png` | 2064×2752 · alfa yok | `raw/en/ipad/02-eklenti-kapali.png` + `raw/en/ipad/01-eklenti-acik.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `en/ipad/03-tap-for-price.png` | 2064×2752 · alfa yok | `raw/en/ipad/01-eklenti-acik.png` + `raw/en/ipad/03-cipe-tiklandi.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `en/ipad/04-settings-panel.png` | 2064×2752 · alfa yok | `raw/en/iphone/04-ayar-paneli.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `en/ipad/05-expenses-donut.png` | 2064×2752 · alfa yok | `raw/en/ipad/05-giderler-halka.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |

#### EN · mac

| Dosya | Piksel · alfa | Ham kaynak | Not |
|---|---|---|---|
| `en/mac/01-hours-on-page.png` | 2880×1800 · alfa yok | `raw/en/desktop/01-eklenti-acik.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `en/mac/02-before-after.png` | 2880×1800 · alfa yok | `raw/en/desktop/02-eklenti-kapali.png` + `raw/en/desktop/01-eklenti-acik.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `en/mac/03-click-for-price.png` | 2880×1800 · alfa yok | `raw/en/desktop/01-eklenti-acik.png` + `raw/en/desktop/03-cipe-tiklandi.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `en/mac/04-settings-panel.png` | 2880×1800 · alfa yok | `raw/en/iphone/04-ayar-paneli.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
| `en/mac/05-expenses-donut.png` | 2880×1800 · alfa yok | `raw/en/desktop/05-giderler-halka.png` | kaynak: Chrome görüntü alanı, Safari'de gerçek çekim gelince değiştirilecek |
