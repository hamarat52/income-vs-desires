# Değişiklik günlüğü

Biçim [Keep a Changelog](https://keepachangelog.com/tr-TR/1.1.0/) esaslı;
sürümler [SemVer](https://semver.org/lang/tr/) izler.

## [0.1.0] - 2026-10-28

İlk yayın. Hedef: Chrome Web Mağazası (Manifest V3). Safari (macOS ve iOS)
hedefleri aynı `manifest.json` + `src/` ile hazırlanıyor; henüz yayında değil.

### Eklenenler

- Web sayfalarındaki fiyatları, kullanıcının maaşına göre çalışma süresine
  çevirir: saatlik kazanç = aylık net maaş ÷ (günlük saat × aylık gün).
  50.000 TL · 8 saat · 22 gün için 500 TL → "1,8 saat".
- Birim kendiliğinden seçilir (dk → saat → gün → ay → yıl). Varsayılanda
  "1 gün" bir mesai günü, "1 ay" bir aylık mesai; istenirse 1 gün = 24 saat.
- Süreye tıklayınca orijinal fiyat geri gelir; tekrar tıklayınca süreye döner.
- TRY, USD, EUR ve GBP fiyatlar. Dövizli fiyatlar günde bir kez çekilen
  kurla çevrilir: Frankfurter (ECB), ulaşılamazsa open.er-api.com ve
  currency-api (jsDelivr). Koda gömülü kur tablosu yok; son başarılı çekim
  kullanılır.
- Ayar paneli: maaş, para birimi, günlük saat, aylık gün; eklentiyi aç/kapat;
  bulunulan sitede kapat; sayfayı yeniden tara; "giderlerden sonra kalana göre
  hesapla", "fiyatı da göster" ve "1 gün = 24 saat" seçenekleri.
- Giderler sayfası: kira, abonelik, taksit ve diğer sabit giderler (her biri
  kendi para biriminde, yıllıklar aylığa bölünür), ayın mesaisini gösteren
  halka grafik, test edilmiş siteler listesi, maaş ve gider içermeyen hata
  bildirimi.
- Aydınlık (varsayılan) ve karanlık görünüm.
- Dinamik sayfalar: geç yüklenen ve yerinde güncellenen fiyatlar
  (MutationObserver) ve adres değiştiren tek sayfa uygulamaları izlenir.
- Gmail, Google Docs/Drive/Calendar, Slack, Notion, Figma, GitHub ve 4
  bankanın sitelerinde eklenti hiç çalışmaz.
- Saha testi (28.10.2026): 10 Türk alışveriş sitesi ve Google Alışveriş'te
  gerçek sayfada doğrulandı; ayrıntı `docs/qa/saha-testi-2026-10-28.json`.

### Gizlilik

- Sunucu, hesap ve analitik yok. Ayarlar ve giderler `chrome.storage.sync`'te
  durur (Chrome senkronizasyonu açıksa Chrome bunları kullanıcının Google
  hesabıyla eşitler). Dışarıya giden tek istek kur tablosudur.

### Düzeltildi

- Safari: iki yer tutuculu metinlerde `$` içeren değer bozuluyordu (EN panel
  "One hour of your work ≈ $227.278.41", doğrusu $28.41). Değerler artık
  `i18n.getMessage`'a verilmiyor, metne eklentinin kendisi yerleştiriyor
  (`src/lib/i18n.js` `t()`); Chrome ve Safari aynı sonucu verir.
- Dokunmatik: çipe dokunmak bazı ürün kartlarında (iOS Safari, Trendyol mobil
  listesi, mağaza vitrini) çipi döndürmeden ürün sayfasını açıyordu. Çip artık
  parmak kalkınca döner ve dokunuşun ardından tıklama üretilmez; kaydırma ve
  fare tıklaması değişmedi. iOS Safari'de yeniden doğrulanması bekliyor.
- Panel: maaş/saat/gün yazılıp yarım saniye dolmadan "Giderlerin ve grafik →"
  düğmesine basılınca Giderler sayfası eski değerle açılabiliyordu. Bekleyen
  kayıt artık sayfa açılmadan önce yazılıyor (yazma takılırsa en çok 1 sn
  beklenir, hata sayfanın açılmasını engellemez). Test: `test/test-popup.js`.

### Bilinen sınırlar

- Yalnız TRY / USD / EUR / GBP; para kodları büyük harfle tanınır.
- Fiyat kutusu 200 karakterle sınırlı; uzun paragraf içindeki tutarlar
  çevrilmez.
