# App Store Connect listeleme taslağı (Safari uzantısı — macOS + iOS/iPadOS)

Dil: Türkçe (birincil). İngilizce listeleme bu turda YOK (ürün kararı).
Kaynak metin: `MAGAZA-LISTELEME.md` (Chrome). Ton ve iddialar onunla aynı; Chrome'a
özgü kısımlar (Chrome senkronu, Chrome Web Mağazası alanları) çıkarıldı.
Karakter sayıları `wc -m` ile ölçüldü (tablo en altta).

Tek uygulama kaydı: bundle ID `com.hamarat52.IncomeVsDesires` macOS ve iOS'ta aynı
(Universal Purchase). Ad ve alt başlık "App Information" düzeyinde ortak; açıklama,
anahtar kelimeler, tanıtım metni ve ekran görüntüleri platform sürümü başına girilir
(App Store Connect'te kayıt sırasında doğrulanmalı). Aşağıdaki metin iki platformda da
kullanılabilecek şekilde yazıldı.

---

## Ad (≤ 30)

```
IncomeVsDesires: Maaşa Göre
```

Alternatifler:

| Seçenek | Not |
|---|---|
| `IncomeVsDesires: Maaşa Göre` | önerilen; "maaş" en güçlü arama kelimesi |
| `IncomeVsDesires` | yalnız marka; arama değeri düşük |
| `Fiyat Saati: IncomeVsDesires` | "fiyat" başta; marka ikinci planda |

Not: App Store'da ad benzersiz olmalı; "IncomeVsDesires" adının boşta olduğu ancak
App Store Connect'te kayıt sırasında görülür (doğrulanmadı).

## Alt başlık (≤ 30)

```
Fiyatı çalışma saatine çevir
```

## Tanıtım metni (Promotional Text, ≤ 170)

İnceleme gerektirmeden değiştirilebilir alan.

```
Maaşını bir kez gir; Safari'de gördüğün fiyatlar kaç saat, kaç gün çalışman gerektiğini göstersin. Veri toplamaz, hesap istemez, ücretsiz.
```

## Anahtar kelimeler (≤ 100, virgüllü; UTF-8 bayt olarak da ≤ 100 tutuldu)

Ad ve alt başlıktaki kelimeler (incomevsdesires, maaşa, göre, fiyatı, çalışma,
saatine, çevir) tekrar edilmedi; Apple bunları zaten indeksler. Marka/mağaza adı
(Trendyol vb.) anahtar kelimeye konmaz (5.2.5 / meta veri reddi riski).

```
bütçe,tasarruf,harcama,alışveriş,mesai,saatlik ücret,gelir,gider,kur,döviz,safari,uzantı
```

## Açıklama (≤ 4000)

```
Fiyat etiketleri parayla konuşur, sen ise hayatını saatle yaşıyorsun.

IncomeVsDesires, Safari'de gördüğün fiyatları senin mesaine çevirir. 2.499 TL'lik bir ayakkabı, günde 8 saat çalışan biri için "1,1 gün" diye yazar. Rakama dokunursan fiyat geri gelir.


NASIL ÇALIŞIR

1. Aylık net maaşını, günde kaç saat ve ayda kaç gün çalıştığını gir.
2. Alışverişe çık. Fiyatlar artık saat, gün ve ay olarak yazıyor.
3. Fikrin değişir.

Saatlik ücretin şöyle hesaplanır: net maaş / (günlük saat x aylık gün). 50.000 TL maaşla günde 8 saat, ayda 22 gün çalışan biri için saati 284,09 TL.


BİRİMLER SENİN DÜZENİNDEN GELİR

"1 gün" senin bir günlük mesain, "1 ay" ise tam bir maaşın. Takvim günü değil, çalışarak geçirdiğin süre. Böylece rakam soyut kalmıyor.


SABİT GİDERLERİN

Kira, aidat ve dijital abonelikleri girersin; ayın kaç gününü hangisine çalıştığını halka grafikte gösterir. Yıllık ödemeler otomatik aylığa bölünür. Kiranın maaşının yüzde kaçı olduğunu bilmek yerine, ayın kaç gününü ona çalıştığını görürsün.


DÖVİZLİ FİYATLAR

Dolar, euro ve sterlin fiyatlar önce senin para birimine çevrilir. Kurlar Avrupa Merkez Bankası verisinden günlük alınır.


SİTE LİSTESİ YOK

Uzantı belli mağazalara bağlı değildir; sayfadaki fiyat yazımını tanır. Bu yüzden alışveriş yaptığın hemen her sitede çalışır.


NASIL AÇILIR

Mac: Uygulamayı bir kez aç, ardından Safari > Ayarlar > Uzantılar bölümünden IncomeVsDesires'ı etkinleştir ve web sitelerine izin ver.
iPhone ve iPad: Ayarlar > Uygulamalar > Safari > Uzantılar bölümünden IncomeVsDesires'ı aç ve web sitelerine izin ver.


GİZLİLİK

Sunucumuz yok. Hesap yok. Analitik yok. Maaşın ve giderlerin yalnızca cihazında, Safari'nin uzantı deposunda durur. Gezdiğin siteler, gördüğün fiyatlar hiçbir yere gitmez. Dışarıya çıkan tek istek, döviz kuru tablosunu çeken günlük çağrıdır (ana kaynağa ulaşılamazsa aynı tablo iki yedek kaynaktan istenir); bu istekte seni tanımlayan hiçbir bilgi yoktur.

E-posta, doküman ve bankacılık sitelerinde uzantı hiç çalışmaz. İstediğin siteyi de panelden tek dokunuşla kapatabilirsin.


ÜCRETSİZ

Reklam yok, abonelik yok, uygulama içi satın alma yok.
```

Not: Chrome metnindeki saha ölçüm tablosu (site başına yakalanan fiyat sayısı) bilinçli
olarak konmadı: rakamlar Chrome'da ölçüldü, Safari'de aynı ölçüm yapılmadı (bkz.
rapor, adım 4). Safari'de ölçülürse "SİTE LİSTESİ YOK" bölümüne eklenebilir.
28.10 Chrome ölçümü (PM): LC Waikiki 145, Trendyol 143, n11 93, Hepsiburada 90,
Amazon.com.tr 79 fiyat.

## URL'ler

| Alan | Değer |
|---|---|
| Destek URL (zorunlu) | `https://hamarat52.github.io/income-vs-desires/` (28.10: HTTP 200) |
| Pazarlama URL (isteğe bağlı) | `https://hamarat52.github.io/income-vs-desires/` |
| Gizlilik politikası URL (zorunlu) | `https://hamarat52.github.io/income-vs-desires/gizlilik.html` (28.10: HTTP 200) |

Gizlilik sayfası şu an "Bu veriler Chrome'un kendi `storage.sync` deposunda tutulur"
diyor. Safari için bir cümle eklenmeli ("Safari'de veriler cihazdaki uzantı deposunda
durur"); `site/` WebDev alanında, bu dalda dokunulmadı.

## Kategori

| | Öneri | Gerekçe |
|---|---|---|
| Birincil | **Finans** (Finance) | macOS'ta Xcode'daki `LSApplicationCategoryType` ile eşleşmeli (App Store Connect yardımı: "primary category ... should match the category you set in Xcode"). Apple'ın `LSApplicationCategoryType` listesinde `shopping` YOK; en yakın geçerli değer `public.app-category.finance` — projede bu ayarlı. |
| İkincil | **Alışveriş** (Shopping), olmazsa **Yaşam Tarzı** (Lifestyle) | Chrome'daki kategori Alışveriş. Mac App Store kategori listesinde Alışveriş'in seçilebildiği doğrulanmadı. |

## Fiyat ve dağıtım

- Fiyat: Ücretsiz. Uygulama içi satın alma: yok.
- Telif (Copyright): `2026 Muhammed Yusuf Hamarat`
- Platformlar: macOS 12+, iOS/iPadOS 17+ (uzantı hedefi iOS 15'i destekliyor ama host
  app 17.0 hedefli; mağazada en düşük sürüm host app'ten gelir).

## Yaş derecesi anketi (önerilen cevaplar)

Uygulamada kullanıcı içeriği, sohbet, reklam, satın alma, web tarayıcısı, konum veya
sağlık içeriği yok. Tüm içerik soruları için "Yok/Hayır":

| Soru grubu | Cevap |
|---|---|
| Şiddet (çizgi film/gerçekçi/uzun süreli), korku | Yok |
| Cinsellik / çıplaklık | Yok |
| Küfür, kaba mizah | Yok |
| Alkol, tütün, uyuşturucu; kumar (simüle/gerçek); yarışma | Yok |
| Tıbbi/tedavi bilgisi; sağlık/sağlıklı yaşam konuları | Yok |
| Kullanıcı tarafından üretilen içerik, mesajlaşma, sosyal medya özellikleri | Hayır |
| Reklam | Hayır |
| Sınırsız web erişimi (uygulama içi tarayıcı) | Hayır — uygulama web sitesi açmaz; uzantı kullanıcının kendi Safari'sinde çalışır |
| Ebeveyn denetimi / yaş doğrulama | Hayır |

Beklenen sonuç: en düşük yaş derecesi (4+). Apple'ın güncel anketindeki soru metinleri
App Store Connect'te görülecek; tablo içerik kategorileri bazında hazırlandı.

## App Privacy (Uygulama Gizliliği) — "Data Not Collected"

Öneri: **Veri Toplanmıyor (Data Not Collected)**.

Gerekçe (Apple tanımı: "toplama" = verinin cihazdan çıkıp geliştiricinin/ortaklarının
isteği gerçek zamanlı karşılamanın ötesinde erişebileceği şekilde iletilmesi):

- Maaş, çalışma düzeni, giderler, kapatılan siteler: `chrome.storage.sync/local`
  (Safari uzantı deposu). Geliştiriciye gitmez; sunucu yok.
- Safari'de `storage.sync` cihazlar arası senkron yapmaz (MDN uyumluluk verisi;
  ARCHITECTURE.md risk 4). Yapsa bile kullanıcının kendi Apple altyapısıdır,
  geliştirici erişmez.
- Dış istekler yalnız kur tablosu: `api.frankfurter.dev`, yedekler `open.er-api.com`,
  `cdn.jsdelivr.net` (`src/background.js:44-54`). İstekte kullanıcı verisi yok; IP
  yalnız isteği karşılamak için kullanılır.
- Analitik, reklam, çökme raporu SDK'sı yok; `PrivacyInfo.xcprivacy`: izleme yok,
  toplanan veri türü yok, required-reason API yok.
- Giderler sayfasındaki "hata bildir" bir `mailto:` bağlantısıdır (`src/options.js:269`):
  kullanıcı kendi e-posta uygulamasında metni görüp kendisi gönderir. Apple'ın
  "isteğe bağlı geri bildirim" istisnası kapsamında değerlendirildi — açık soru olarak
  raporda.
- Takip (tracking): Hayır.

## App Review notu (Review Notes)

```
IncomeVsDesires bir Safari Web Uzantısıdır; uygulamanın kendisi yalnızca uzantıyı nasıl açacağınızı anlatır. Giriş/hesap gerekmez.

Mac:
1. Uygulamayı bir kez açın.
2. Safari > Ayarlar > Uzantılar > "IncomeVsDesires Extension" kutusunu işaretleyin.
3. Bir alışveriş sitesi açın (ör. https://www.lcw.com veya https://www.trendyol.com/sr?q=ayakkabi). Adres çubuğundaki uzantı simgesine tıklayıp "Her zaman izin ver" seçin.

iPhone/iPad:
1. Ayarlar > Uygulamalar > Safari > Uzantılar > IncomeVsDesires'ı açın, "Tüm web siteleri" için izin verin.
2. Safari'de aynı örnek siteyi açın.

Kullanım: Araç çubuğundaki IncomeVsDesires simgesine dokunun, aylık net maaşı (ör. 50000 TL), günlük saat (8) ve aylık gün (22) girin. Sayfadaki fiyatlar "saat/gün/ay" olarak görünür; bir süreye dokunmak fiyatı geri getirir. Paneldeki "Giderlerin ve grafik" düğmesi, sabit giderleri halka grafikte gösteren sayfayı açar.

Veri toplanmaz; tek ağ isteği günlük döviz kuru tablosudur (api.frankfurter.dev, yedek: open.er-api.com, cdn.jsdelivr.net).
```

(Review notu alanı 4000 karakter sınırlı; bu metin altında.)

## Ekran görüntüleri

Ayrıntı ve boyutlar: `store-assets/apple/README.md`.

---

## Karakter ölçümü (28.10, `wc -m` / `wc -c`, sondaki satır sonu hariç)

| Alan | Sınır | Karakter | UTF-8 bayt |
|---|---|---|---|
| Ad | 30 | 27 | 29 |
| Alt başlık | 30 | 28 | 33 |
| Tanıtım metni | 170 | 138 | 154 |
| Anahtar kelimeler | 100 | 88 | 96 |
| Açıklama | 4000 | 2131 | 2359 |
| App Review notu | 4000 | 1026 | 1096 |

Komut: kod blokları `awk` ile ayrı dosyalara çıkarılıp her biri için
`printf "%s" "$(cat blokNN.txt)" | wc -m` (ve `wc -c`).
