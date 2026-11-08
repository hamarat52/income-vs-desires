# App Store Connect — Türkçe listeleme (Safari uzantısı: macOS + iOS/iPadOS)

Kaynak: eski `APP-STORE-LISTELEME.md` (`git mv` ile buraya taşındı, 28.10.2026).
Ortak formlar `../shared/` altında: [`app-privacy.md`](../shared/app-privacy.md),
[`yas-derecelendirme.md`](../shared/yas-derecelendirme.md),
[`sifreleme.md`](../shared/sifreleme.md), [`review-notes.md`](../shared/review-notes.md),
[`kategori-fiyat.md`](../shared/kategori-fiyat.md),
[`ekran-goruntuleri.md`](../shared/ekran-goruntuleri.md).
İngilizce: [`../en/listing.md`](../en/listing.md).
Sınırlar komutla sayılır: `node scripts/check-listing-length.js`.

Kurallar (PM 28.10 doğrulaması, developer.apple.com/help/app-store-connect/reference):
ad ≤ 30, alt başlık ≤ 30, tanıtım ≤ 170, açıklama ≤ 4000, anahtar kelime
≤ 100 **bayt** (her biri > 2 karakter, ad/şirket adı tekrarlanmaz);
"Yenilikler" ilk sürümde yok. Rehber 2.3.10: metinde başka platform adı yok
(**"Chrome" geçmez**); 2.3.7: fiyat bilgisiyle meta veri şişirilmez — bu yüzden
tanıtım metninden "ücretsiz" çıkarıldı, açıklamada fiyat bölümü yok.

Tek uygulama kaydı: bundle ID `com.hamarat52.IncomeVsDesires`, macOS ve iOS'ta
aynı (Universal Purchase). Ad, alt başlık, kategori ve yaş derecesi
"App Information" düzeyinde, tüm platformlarda ortak (Apple "App information"
referansı: "properties that are shared across the platforms added to an app").
Açıklama, anahtar kelime, tanıtım metni ve ekran görüntüleri platform sürümü
başına girilir; aşağıdaki metin iki platformda da kullanılabilir.

---

## Ad (≤ 30)

```
IncomeVsDesires: Maaşa Göre
```

**Yusuf kararı.** Alternatifler: `IncomeVsDesires` (yalnız marka) ·
`Fiyat Saati: IncomeVsDesires`. Adın App Store'da boşta olduğu ancak kayıt
sırasında görülür (doğrulanmadı).

## Alt başlık (≤ 30)

```
Fiyatı çalışma saatine çevir
```

## Tanıtım metni (≤ 170)

İnceleme gerektirmeden değiştirilebilir alan.

```
Maaşını bir kez gir; Safari'de gördüğün fiyatlar kaç saat, kaç gün çalışman gerektiğini göstersin. Veri toplamaz, hesap istemez.
```

## Anahtar kelimeler (≤ 100 bayt)

Ad ve alt başlıktaki kelimeler (incomevsdesires, maaşa, göre, fiyatı, çalışma,
saatine, çevir) tekrar edilmedi. Mağaza/marka adı yok (5.2.5).

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

"1 gün" senin bir günlük mesain, "1 ay" ise tam bir maaşın. Takvim günü değil, çalışarak geçirdiğin süre. Böylece rakam soyut kalmıyor. Takvim süresini tercih edersen "1 gün = 24 saat" seçeneğini aç.


SABİT GİDERLERİN

Kira, aidat ve dijital abonelikleri girersin; ayın kaç gününü hangisine çalıştığını halka grafikte gösterir. Yıllık ödemeler otomatik aylığa bölünür. Kiranın maaşının yüzde kaçı olduğunu bilmek yerine, ayın kaç gününü ona çalıştığını görürsün.


DÖVİZLİ FİYATLAR

Türk lirası, dolar, euro ve sterlin desteklenir. Bunlardan biriyle yazılmış bir fiyat önce senin para birimine çevrilir. Kurlar Avrupa Merkez Bankası verisinden günlük alınır.


SİTE LİSTESİ YOK

Uzantı belli mağazalara bağlı değildir; sayfadaki fiyat yazımını tanır. Bu yüzden bir mağaza listesine bağlı kalmadan çalışır.


DİL

Türkçe ve İngilizce; cihazının diline göre açılır.


NASIL AÇILIR

Mac: Uygulamayı bir kez aç, ardından Safari > Ayarlar > Uzantılar bölümünden IncomeVsDesires'ı etkinleştir ve web sitelerine izin ver.
iPhone ve iPad: Ayarlar > Uygulamalar > Safari > Uzantılar bölümünden IncomeVsDesires'ı aç ve web sitelerine izin ver.


GİZLİLİK

Sunucumuz yok. Hesap yok. Analitik yok. Maaşın ve giderlerin Safari'nin uzantı deposunda durur, bize gelmez. Gezdiğin siteler, gördüğün fiyatlar hiçbir yere gitmez. Dışarıya çıkan tek istek, döviz kuru tablosunu çeken günlük çağrıdır (ana kaynağa ulaşılamazsa aynı tablo iki yedek kaynaktan istenir); bu istekte seni tanımlayan hiçbir bilgi yoktur.

E-posta, doküman ve bankacılık sitelerinde uzantı hiç çalışmaz. İstediğin siteyi de panelden tek dokunuşla kapatabilirsin.


REKLAM YOK

Reklam yok, abonelik yok, uygulama içi satın alma yok.
```

Notlar:
- Saha ölçüm tablosu bilinçli olarak yok: rakamlar başka bir tarayıcıda
  ölçüldü (2.3.10 nedeniyle adı yazılamaz), Safari'de ölçülmedi. Safari'de
  ölçülürse "SİTE LİSTESİ YOK" bölümüne eklenebilir.
- "Maaşın ve giderlerin yalnızca cihazında" ifadesi "Safari'nin uzantı
  deposunda durur, bize gelmez" olarak yumuşatıldı: Safari'de `storage.sync`'in
  cihazlar arası eşitleme yapıp yapmadığı doğrulanmadı.

## Yenilikler (What's New)

İlk sürümde bu alan **yok** (App Store Connect yalnız güncellemelerde ister).
İkinci sürüm için şablon: [`whats-new.md`](whats-new.md).

## URL'ler

| Alan | Değer | Durum |
|---|---|---|
| Destek URL (zorunlu) | `https://hamaratlabs.com/income-vs-desires/destek` | **yayında** (2026-11-08 `curl` 200). İletişim: GitHub Issues + e-posta `hermes.agent.hamarat@gmail.com` (Yusuf kararı 2026-11-08) |
| Pazarlama URL (isteğe bağlı) | `https://hamaratlabs.com/income-vs-desires/` | **yayında** (2026-11-08 `curl` 200) |
| Gizlilik politikası URL (zorunlu) | `https://hamaratlabs.com/income-vs-desires/gizlilik` | **yayında** (2026-11-08 `curl` 200; Safari cümlesi dahil) |

## Telif / Copyright

```
2026 Muhammed Yusuf Hamarat
```

## Ekran görüntüleri

`tr/iphone/`, `tr/ipad/` — host uygulamanın açılış ekranı (eski set, uzantıyı
çalışırken göstermiyor). `tr/mac/` boş. Ham uzantı kareleri (Chrome görüntü
alanı, Safari çekimiyle değiştirilecek): `store/raw/tr/{iphone,ipad,desktop}/`.
Ayrıntı: [`../shared/ekran-goruntuleri.md`](../shared/ekran-goruntuleri.md).
