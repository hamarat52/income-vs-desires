# Chrome Web Store görselleri

> **Yerleşim (28.10.2026, `store/` düzeni):** `screenshot-*.png` dosyaları
> `../tr/screenshots/` altında (Türkçe set); ikonlar, promo ve marquee bu klasörde
> (`shared/`, dile bağlı değil); kaynak HTML ve `render.sh` `shared/src/`.


Hepsi 28.10.2026'da üretildi. Ekran görüntüleri alfasız 24-bit PNG (sips:
`hasAlpha: no`, `samplesPerPixel: 3`); yalnız mağaza ikonu saydam köşeli.
Maaş örneği her yerde mağaza metniyle aynı: **50.000 TL · günde 8 saat ·
ayda 22 gün** (saatlik ₺284,09).

| Dosya | Boyut | Mağaza alanı | Kaynak |
|---|---|---|---|
| `screenshot-1-urun-sayfasi.png` | 1280×800 | Ekran görüntüsü 1 | Gerçek sayfa: `https://www.trendyol.com/sr?q=spor%20ayakkab%C4%B1`, 28.10.2026 15:40 (+03). Ajan tarayıcısı (CDP 9333), `Emulation.setDeviceMetricsOverride` 1280×800, deviceScaleFactor 1. Eklenti PM'in ayarlarıyla çalışıyordu (ayara dokunulmadı); fiyatlar content.js'in çevirdiği hâliyle, düzenleme yok. |
| `screenshot-2-panel.png` | 1280×800 | Ekran görüntüsü 2 | `src/screenshot-2-panel.html` render'ı. İçindeki `src/img/panel-x15.png` eklentinin gerçek `popup.html`'i: Chrome for Testing 153 (headless, ayrı/geçici profil), bu worktree'deki eklenti `--load-extension` ile yüklü, 1,5x ölçek. |
| `screenshot-3-giderler.png` | 1280×800 | Ekran görüntüsü 3 | Eklentinin gerçek `options.html`'i, aynı Chrome for Testing profili. Viewport 1600×1000 CSS px, deviceScaleFactor 0,8 (= %80 yakınlaştırma) → 1280×800 px. Giderler ajan tarayıcısındaki PM ayarından salt okunarak kopyalandı: Kira 18.000, Netflix 280, Spotify 100, Telefon taksiti 2.500 TL (aylık). |
| `screenshot-4-once-sonra.png` | 1280×800 | Ekran görüntüsü 4 | `src/screenshot-4-once-sonra.html` render'ı. İki kırpım da 1. karedeki AYNI sayfa yüklemesinden: `src/img/trendyol-kart-sure.png` (çevrilmiş hâl) ve `src/img/trendyol-kart-fiyat.png` (aynı iki karttaki çiplere tıklandıktan sonra; content.js fiyatı geri koyar). Kırpım kutusu ve tıklanan çipler: `src/img/trendyol-yakalama.json`. |
| `screenshot-5-test-edilen-siteler.png` | 1280×800 | Ekran görüntüsü 5 | Eklentinin gerçek `options.html`'i, "Test edilmiş siteler" bölümü açık (Chrome for Testing, yukarıdaki profil, %80). Rakamlar `src/options.js > TESTED_SITES` = `docs/qa/saha-testi-2026-10-28.json`. |
| `promo-small-440x280.png` | 440×280 | Küçük tanıtım karesi (zorunlu) | `src/promo-small-440x280.html` render'ı. Marka yeşili #43e08c→#0c9a6c, ikon `src/icons/icon-128.png`. "500 TL → 1,8 saat" = 500 / 284,09 (eklentinin `IVD.formatDuration`'ı ile doğrulandı). |
| `marquee-1400x560.png` | 1400×560 | Marquee tanıtım görseli (isteğe bağlı) | `src/marquee-1400x560.html` render'ı. Örnekler `IVD.formatDuration` ile doğrulandı: 500 TL → 1,8 saat, 2.499 TL → 1,1 gün, 50.000 TL → 1 ay. |
| `store-icon-128.png` | 128×128 (alfa var) | — (kullanılmayacak) | `src/icons/icon-128.png`'nin birebir kopyası (`cmp` aynı). |
| `store-icon-128-padded.png` | 128×128 (alfa var) | **Mağaza ikonu — kullanılacak** (PM kararı, 28.10.2026) | Aynı ikon 96×96'ya küçültülüp 16 px saydam pay ile ortalandı (Google'ın "96×96 görsel + 16 px pay" önerisi). |

## Notlar

- **İkon:** `icon-128.png` geçerli bir 128×128 PNG ama görsel karenin tamamını
  dolduruyor (alfa yalnız yuvarlak köşelerde; opak kutu 0,0–128,128). Google
  mağaza ikonunda 96×96 görsel + her kenarda 16 px saydam pay öneriyor; aksi
  hâlde mağazada diğer ikonlardan büyük görünür. Bu yüzden mağazaya
  **`store-icon-128-padded.png` yüklenecek** (PM kararı, 28.10.2026).
  `store-icon-128.png` yalnız karşılaştırma için duruyor; paketin içindeki
  `src/icons/icon-128.png` değişmedi (araç çubuğu/uzantılar sayfası ikonu).
- **Chrome for Testing profilinde ağ yoktu** (Frankfurter isteği askıda kaldı).
  Panelde "Kurlar güncel" yazsın diye kur önbelleği (`storage.local.rates`)
  bugünkü gerçek Frankfurter yanıtıyla dolduruldu: ECB 2026-10-27, EUR 1 ·
  USD 1,115 · GBP 0,83658 · TRY 55,513. Görsellerdeki tüm tutarlar TL olduğu
  için kur hiçbir rakamı etkilemiyor.
- **Marka adları:** 1. ve 4. karede Trendyol'un kendi sayfası görünüyor
  (eklentinin gerçek sayfada çalıştığının kanıtı). Tanıtım kareleri hiçbir
  site logosu içermez. ../tr/listing.md "Dikkat" bölümüne bakın.
- Eski üç kare (`store/arsiv/chrome-eski-35000tl/screenshot-{1-trendyol,2-giderler,3-popup}.png`)
  1280×800 ve alfasız, ama **35.000 TL** maaşla çekilmiş; mağaza metniyle
  çelişiyor. **Mağazaya yüklenmeyecek**; yerlerine bu klasördekiler
  kullanılır. Silinmedi; 28.10.2026 düzenlemesinde `store/arsiv/`e taşındı (PM kararı).

## Yeniden üretme

```bash
store/chrome-web-store/shared/src/render.sh   # 2, 4 → ../tr/screenshots/, promo ve marquee → shared/
```

1, 3, 5 ve `src/img/*` doğrudan tarayıcıdan alınmış ekran görüntüleridir;
render ile değil, sayfayı yeniden açıp çekerek yenilenir.
