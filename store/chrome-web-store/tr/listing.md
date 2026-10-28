# Chrome Web Mağazası — Türkçe listeleme

Kaynak: eski `MAGAZA-LISTELEME.md` (`git mv` ile buraya taşındı, 28.10.2026).
Tek amaç, izin gerekçeleri, uzak kod, veri kullanımı ve sertifikalar ayrı
dosyada (iki dil ortak): [`../shared/gizlilik-sekmesi.md`](../shared/gizlilik-sekmesi.md).
Uzunluk ve eşitlik kontrolü: `node scripts/check-listing-length.js`.

Mağaza içi arama üç alana bakar: **ad**, **kısa açıklama**, **detaylı
açıklama**; ağırlık bu sırayla azalır. Türkçe'de bu işi yapan başka eklenti
bulunamadı (31.07.2026 taraması).

> **Ad ve kısa açıklama paketten okunur.** Chrome Web Store'da görünen ad
> manifest `name`, özet `description` alanıdır; panelde düzenlenemez.
> Manifest artık `__MSG_extName__` / `__MSG_extDescription__` kullanıyor;
> Türkçe değerler `_locales/tr/messages.json`'da. Detaylı açıklama, ekran
> görüntüleri ve YouTube videosu dil başına girilir — yalnız eklentide o dilin
> `_locales/<kod>` klasörü varsa (developer.chrome.com/docs/webstore/cws-dashboard-listing;
> PM 28.10 doğrulaması). `_locales/tr` var → Türkçe sayfa açılabilir.
> Varsayılan dil `en` (`default_locale`); Türkçe dışındaki her dil İngilizceye düşer.

## Ad (manifest'ten, ≤ 75)

```
IncomeVsDesires
```

`_locales/tr/messages.json > extName` (betik eşitliği denetler). Uzun ad
önerisi **Yusuf onayı bekliyor** (değiştirilmedi):

| Seçenek | Karakter | Not |
|---|---|---|
| `IncomeVsDesires: Fiyatları Maaşına Göre Saate Çevirir` | 53 | önerilen; üç arama kelimesi (fiyat, maaş, saat) |
| `IncomeVsDesires: Fiyat Saat Çevirici, Saatlik Ücret Hesaplama` | 61 | robotik okunuyor |
| `IncomeVsDesires` | 15 | şu an manifest'te; aranmayan tek kelime |

## Kısa açıklama (manifest'ten, ≤ 132)

```
Maaşını gir, fiyatlar kaç saat çalıştığına dönüşsün. 500 TL yerine 1,8 saat. Veri toplamaz, kayıt istemez, ücretsiz.
```

`_locales/tr/messages.json > extDescription` ile birebir (betik denetler).
Örnek: 50.000 TL · 8 saat · 22 gün → saatlik ₺284,09; 500 TL →
`IVD.formatDuration` = "1,8 saat" (`test/test-money.js`).

## Detaylı açıklama

```
Fiyat etiketleri parayla konuşur, sen ise hayatını saatle yaşıyorsun.

IncomeVsDesires internetteki fiyatları senin mesaine çevirir. 2.499 TL'lik bir
ayakkabı, günde 8 saat çalışan biri için "1,1 gün" diye yazar. Rakama
tıklarsan fiyat geri gelir.


NASIL ÇALIŞIR

1. Aylık net maaşını, günde kaç saat ve ayda kaç gün çalıştığını gir.
2. Alışverişe çık. Fiyatlar artık saat, gün ve ay olarak yazıyor.
3. Fikrin değişir.

Saatlik ücretin şöyle hesaplanır: net maaş / (günlük saat x aylık gün).
50.000 TL maaşla günde 8 saat, ayda 22 gün çalışan biri için saati 284,09 TL.


BİRİMLER SENİN DÜZENİNDEN GELİR

"1 gün" senin bir günlük mesain, "1 ay" ise tam bir maaşın. Takvim günü değil,
çalışarak geçirdiğin süre. Böylece rakam soyut kalmıyor. Takvim süresini
tercih edersen "1 gün = 24 saat" seçeneğini aç.


SABİT GİDERLERİN

Kira, aidat ve dijital abonelikleri girersin; ayın kaç gününü hangisine
çalıştığını halka grafikte gösterir. Yıllık ödemeler otomatik aylığa bölünür.
Kiranın maaşının yüzde kaçı olduğunu bilmek yerine, ayın kaç gününü ona
çalıştığını görürsün.


DÖVİZLİ FİYATLAR

Türk lirası, dolar, euro ve sterlin desteklenir. Bunlardan biriyle yazılmış
bir fiyat önce senin para birimine çevrilir. Kurlar Avrupa Merkez Bankası
verisinden günlük alınır.


GERÇEK SAYFALARDA TEST EDİLDİ (28 Ekim 2026)

Sayfadaki fiyatların kaçını çevirdiği ve taramanın kaç milisaniye sürdüğü
ölçüldü:

  LC Waikiki         145 fiyat      34 ms
  Trendyol           143 fiyat      33 ms
  n11                 93 fiyat      25 ms
  Hepsiburada         90 fiyat      50 ms
  Amazon.com.tr       79 fiyat     124 ms
  Google Alışveriş    62 fiyat      41 ms
  Migros              51 fiyat      31 ms
  Teknosa             49 fiyat      35 ms
  Çiçeksepeti         45 fiyat      12 ms
  Sahibinden          20 fiyat      38 ms
  MediaMarkt           8 fiyat      29 ms   (ilk ekran; ürünler kaydırınca yüklenir)

Aynı gün ABD'deki iki mağazada dolar fiyatlarla da denendi: IKEA US
(40 fiyat) ve Zappos (283 fiyat).

Eklenti site listesi tutmaz, sayfadaki fiyat yazımını tanır. Bu yüzden listede
olmayan sitelerde de çalışır.


DİL

Türkçe ve İngilizce; tarayıcının diline göre açılır.


GİZLİLİK

Sunucumuz yok. Hesap yok. Analitik yok. Maaşın ve giderlerin Chrome'un kendi
ayar deposunda durur; Chrome senkronizasyonun açıksa Chrome bunları kendi
Google hesabındaki diğer cihazlarına taşır, bize hiçbir şey gelmez. Gezdiğin
siteler, gördüğün fiyatlar hiçbir yere gitmez. Dışarıya çıkan tek istek,
döviz kuru tablosunu çeken günlük çağrıdır (ana kaynağa ulaşılamazsa aynı
tablo iki yedek kaynaktan istenir).

E-posta, doküman ve bankacılık sitelerinde eklenti hiç çalışmaz. İstediğin
siteyi de panelden tek tıkla kapatabilirsin.


ÜCRETSİZ

Reklam yok, abonelik yok, "pro" sürüm yok.
```

Kaynaklar: TR tablosu `docs/qa/saha-testi-2026-10-28.json`; ABD ölçümü
`store/raw/README.md` › "Saha notu" (headless Chrome, sayfadaki çip sayısı;
milisaniye ölçülmedi, o yüzden tabloya değil cümleye yazıldı).

---

## Diğer mağaza alanları

| Alan | Değer |
|---|---|
| Kategori | Alışveriş (Shopping) |
| Dil | Türkçe (bu sayfa). Varsayılan dil İngilizce (`default_locale: en`) |
| Gizlilik politikası URL | `https://hamarat52.github.io/income-vs-desires/gizlilik.html` — yayında (28.10 HTTP 200); 28.10'da eklenen Safari cümlesi push sonrası yayına girer |
| Destek sitesi | `https://hamarat52.github.io/income-vs-desires/destek.html` — **push sonrası yayında olacak** (28.10: 404) |
| Ana sayfa | `https://hamarat52.github.io/income-vs-desires/` |

`incomevsdesires.com` alınmadı; alan adı kararı Yusuf'ta. Alınırsa
`site/posts.json > siteUrl` + `node site/build.js`, ardından bu tablo.

## Görseller

Boyut, kaynak ve alan eşlemesi: [`../shared/gorseller.md`](../shared/gorseller.md).

- **Mağaza ikonu (128×128)**: `shared/store-icon-128-padded.png` (96 + 16 px
  saydam pay; PM kararı 28.10.2026). `shared/store-icon-128.png` yüklenmeyecek.
- **Ekran görüntüleri (1280×800, alfasız PNG)**: mevcut set `tr/screenshots/`
  (28.10, eklentinin Türkçe-only sürümüyle çekildi). Yeni ham kareler TR arayüzle
  `store/raw/tr/desktop/` (2560×1600); ImageArtist çerçeveleyip buraya koyacak.
- **Küçük tanıtım karesi 440×280** ve **marquee 1400×560**: `shared/` —
  yerelleştirilemez, tek kare iki dile de gösterilir. Şu anki kareler Türkçe
  metin taşıyor (bkz. `store/README.md` açık soru).
- `store/arsiv/chrome-eski-35000tl/`: 35.000 TL ile çekilmiş eski kareler,
  yüklenmeyecek.

## Dikkat

- **Anahtar kelime doldurma yasak.** Kelimeler cümle içinde geçiyor, liste
  hâlinde değil. Böyle kalsın.
- **Marka isimleri** yalnızca "burada çalışır" bilgisi; logo yok, iş birliği
  izlenimi yok.
- **TR ve EN aynı özellikleri anlatır** (CWS diller arası tutarlılığı
  denetliyor). EN: [`../en/listing.md`](../en/listing.md).
