# App Store ekran görüntüleri (taslak)

Boyutlar Apple "Screenshot specifications" sayfasından 28.10.2026'da doğrulandı:
https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications

Zorunlu olanlar (o sayfaya göre):

| Cihaz sınıfı | Zorunluluk | Kabul edilen boyut (dikey) |
|---|---|---|
| iPhone, Dynamic Island (orta ekran: iPhone 17/18 Pro, 17) | iPhone için **zorunlu** | 1206 × 2622 veya 1179 × 2556 |
| iPhone, Dynamic Island (büyük: 18 Pro Max, Air) | isteğe bağlı (yoksa ölçeklenir) | 1320 × 2868, 1290 × 2796, 1260 × 2736 |
| iPhone Face ID büyük (6.5") | yalnız büyük DI görüntüsü verilmezse | 1284 × 2778, 1242 × 2688 |
| iPad 13" | **zorunlu** (TARGETED_DEVICE_FAMILY = 1,2 → uygulama iPad'de çalışıyor) | 2064 × 2752 veya 2048 × 2732 |
| Mac | **zorunlu** | 16:10 — 1280 × 800, 1440 × 900, 2560 × 1600, 2880 × 1800 |

Not: Görsellerde alfa kanalı/şeffaflık olamaz. `simctl` PNG'leri alfa kanallı
çıkıyor; bu yüzden JPEG'e (kalite 95) çevrildi (`hasAlpha: no`).

## Dosyalar

| Dosya | Boyut | Cihaz sınıfı | Kaynak |
|---|---|---|---|
| `ios/iphone-6.3-hostapp-acilis.jpg` | 1206 × 2622, JPEG, alfa yok | iPhone DI orta (zorunlu sınıf) | iPhone 18 Pro simülatörü (iOS 27), Release-iphonesimulator build, `xcrun simctl io <udid> screenshot`, durum çubuğu `simctl status_bar override` ile 9:41 |
| `ios/ipad-13-hostapp-acilis.jpg` | 2064 × 2752, JPEG, alfa yok | iPad 13" (zorunlu sınıf) | iPad Pro 13-inch (M5) simülatörü, aynı yöntem |

İkisi de yalnız **host uygulamanın açılış ekranı** (ikon + Türkçe "nasıl açılır"
metni). Uzantının bir sayfada çalıştığını GÖSTERMİYOR.

## Eksik olanlar ve nedeni

- **Uzantı çalışırken iPhone/iPad görüntüsü YOK.** Simülatörde uzantıyı açmak için
  Ayarlar > Uygulamalar > Safari > Uzantılar'da dokunma ve Safari'de site izni
  gerekir (GUI). 28.10.2026 boyunca Mac'in ekranı kilitliydi
  (`CGSSessionScreenIsLocked = true`); Simulator penceresine tıklanamadı.
  `simctl` ile uzantı etkinleştirme komutu yok. Sahte/kompozit görüntü üretilmedi.
- **Mac görüntüsü YOK** (zorunlu). Aynı neden: Safari'de uzantı etkinleştirme ve
  `screencapture` ekran kilidi açıkken yapılabilir.
- `verify/` klasörü (Safari'de GUI doğrulama kanıtı) bu turda oluşturulamadı.

## Ekran açılınca yapılacak (sırasıyla)

1. Mac: `safari/IncomeVsDesires/build/dd-macos/Build/Products/Debug/IncomeVsDesires.app`
   aç → Safari > Ayarlar > Uzantılar → IncomeVsDesires Extension işaretle →
   https://www.lcw.com veya https://www.trendyol.com/sr?q=ayakkabi → site izni
   "Her zaman izin ver" → popup'ta maaş gir → `screencapture -o -l <pencere-id>`
   ile pencere; 2880 × 1800'e (16:10) `sips` ile getir.
2. iPhone 18 Pro + iPad Pro 13 (M5) simülatörlerinde (ikisi kurulu, uygulama yüklü):
   Ayarlar > Uygulamalar > Safari > Uzantılar > IncomeVsDesires aç → Safari'de aynı
   sayfa → `xcrun simctl io <udid> screenshot` → JPEG'e çevir.
3. Önerilen sıra (Chrome ile aynı): gerçek ürün sayfasında süreler, ayar paneli,
   Giderler halka grafiği.
