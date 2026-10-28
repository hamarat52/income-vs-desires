# Chrome Web Mağazası listeleme metni

Mağaza içi arama üç alana bakar: **ad**, **kısa açıklama**, **detaylı açıklama**.
Ağırlık bu sırayla azalır. "IncomeVsDesires" tek başına hiç aranmayan bir kelime,
o yüzden ad marka + arananan ifade şeklinde kurulmalı.

Türkçe'de bu işi yapan başka eklenti bulunamadı (31.07.2026 taraması), yani
niş boş. Rekabet düşükken doğru kelimeleri kapmak kolay.

---

> **Önemli — ad ve kısa açıklama paketten okunur.** Chrome Web Store'da
> görünen ad manifest'teki `name`, kısa açıklama (özet) `description`
> alanıdır; geliştirici panelinde düzenlenemez, değiştirmek için manifest'i
> düzenleyip yeniden paketlemek gerekir
> ([developer.chrome.com/docs/webstore/prepare](https://developer.chrome.com/docs/webstore/prepare)).
> Manifest `description` = aşağıdaki **Kısa açıklama**, birebir (PM kararı,
> 28.10.2026). Manifest `name` şimdilik `"IncomeVsDesires"` (15 karakter);
> aşağıdaki uzun ad Yusuf onayı bekliyor. Safari de aynı manifest'i
> kullanıyor. Kısa açıklama değişirse manifest de aynı anda değişmeli.
> Uzunluk + eşitlik kontrolü: `node scripts/check-listing-length.js`.

## Ad (75 karakter sınırı)

> **Not:** Mağaza adı manifest `name`'den gelir; uzun ad Yusuf onayı
> bekliyor, şu an mağazada `IncomeVsDesires` görünür.

```
IncomeVsDesires: Fiyatları Maaşına Göre Saate Çevirir
```

53 karakter. İçinde üç arama kelimesi var: **fiyat**, **maaş**, **saat**.

Alternatifler:

| Seçenek | Karakter | Not |
|---|---|---|
| `IncomeVsDesires: Fiyatları Maaşına Göre Saate Çevirir` | 53 | önerilen |
| `IncomeVsDesires: Fiyat Saat Çevirici, Saatlik Ücret Hesaplama` | 61 | daha çok kelime ama robotik okunuyor |
| `IncomeVsDesires` | 15 | sadece marka; sıfır arama hacmi — şu an manifest'te bu (ad Yusuf onayına kadar) |

## Kısa açıklama (132 karakter sınırı)

Arama sonuçlarında görünen tek metin bu. En yüksek dönüşüm etkisi burada.

```
Maaşını gir, fiyatlar kaç saat çalıştığına dönüşsün. 500 TL yerine 1,8 saat. Veri toplamaz, kayıt istemez, ücretsiz.
```

116 karakter (`node scripts/check-listing-length.js`). Ne yaptığını ilk cümlede söylüyor, ikinci cümlede örnek veriyor,
üçüncüde en yaygın itirazı (gizlilik) kapatıyor.

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
çalışarak geçirdiğin süre. Böylece rakam soyut kalmıyor.


SABİT GİDERLERİN

Kira, aidat ve dijital abonelikleri girersin; ayın kaç gününü hangisine
çalıştığını halka grafikte gösterir. Yıllık ödemeler otomatik aylığa bölünür.
Kiranın maaşının yüzde kaçı olduğunu bilmek yerine, ayın kaç gününü ona
çalıştığını görürsün.


DÖVİZLİ FİYATLAR

Dolar, euro ve sterlin fiyatlar önce senin para birimine çevrilir. Kurlar
Avrupa Merkez Bankası verisinden günlük alınır.


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

Eklenti site listesi tutmaz, sayfadaki fiyat yazımını tanır. Bu yüzden listede
olmayan sitelerde de çalışır.


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

---

## Diğer mağaza alanları

| Alan | Değer |
|---|---|
| Kategori | Alışveriş (Shopping) |
| Dil | Türkçe (birincil) |
| Gizlilik politikası URL | `https://hamarat52.github.io/income-vs-desires/gizlilik.html` |
| Destek sitesi | `https://hamarat52.github.io/income-vs-desires/` |

İki adres de yayında (28.10.2026, `curl` → HTTP 200). `incomevsdesires.com`
alınmadı (yanıt yok); alan adı kararı Yusuf'ta. Alan adı alınırsa
`site/posts.json > siteUrl` + `node site/build.js` ile birlikte bu iki satır da
güncellenmeli.

### Tek amaç beyanı (single purpose)

Google inceleme sırasında bunu ister:

> Eklentinin tek amacı, kullanıcının girdiği maaş bilgisine göre web
> sayfalarındaki para tutarlarını çalışma süresine çevirerek göstermektir.

### İzin gerekçeleri

`manifest.json` ile birebir (28.10.2026): `permissions` = `storage`, `alarms`,
`activeTab`; `host_permissions` = 3 kur kaynağı; tek `content_scripts`
girdisi `<all_urls>` (+ `exclude_matches`). Başka izin yok.

| İzin | Gerekçe |
|---|---|
| `storage` | Kullanıcının maaşını, çalışma düzenini, görünüm tercihlerini ve gider listesini (`storage.sync`) ve son çekilen kur tablosunu (`storage.local`) saklamak için. |
| `activeTab` | Kullanıcı araç çubuğundaki panele tıkladığında yalnızca o anki sekmede: alan adını okuyup "bu sitede kapat" düğmesini göstermek ve "sayfayı yeniden tara" mesajını göndermek için. |
| `alarms` | Döviz kurlarını günde bir kez tazelemek için. |
| `host_permissions: api.frankfurter.dev` | Döviz kuru tablosunu çekmek için (ana kaynak, ECB verisi). |
| `host_permissions: open.er-api.com`, `cdn.jsdelivr.net` | Ana kaynağa ulaşılamazsa sırayla denenen iki yedek kur kaynağı. İstekler yalnızca kur tablosunu ister; kullanıcıya ait hiçbir veri içermez. Eklentinin yaptığı dış istekler yalnızca bunlardır. |
| `content_scripts: <all_urls>` | Fiyat hangi sitede olursa olsun çevrilebilsin diye. Eklenti site listesi tutmaz. Sayfa metni yalnızca cihazda okunur ve yerinde değiştirilir; hiçbir yere gönderilmez. E-posta, doküman ve 4 banka `exclude_matches` ile dışarıda. |

### Gizlilik uygulamaları sekmesi — hazır cevaplar

**Uzak kod kullanıyor musunuz?** → **Hayır, uzak kod kullanmıyorum.**

Kanıt (28.10.2026, `src/` üzerinde grep): `eval(`, `new Function`,
`importScripts`, dizgeli `setTimeout/setInterval`, dinamik `import(`,
`chrome.scripting`/`executeScript` ve dış adresli `<script src>` **yok** (tek
eşleşme `background.js:5`'teki "importScripts kaldırıldı" yorumu). Tüm
`<script>` etiketleri paket içi dosyalar (`theme.js`, `lib/money.js`,
`popup.js`, `options.js`). Tek `fetch` çağrısı `background.js:121`; yalnızca
JSON kur tablosu alır, çalıştırılabilir kod değil.

**Veri kullanımı — hangi kullanıcı verilerini topluyorsunuz?** → Hiçbir kutu
işaretlenmez:

| Kategori | Durum |
|---|---|
| Kişisel kimlik bilgileri | Toplanmıyor |
| Sağlık bilgileri | Toplanmıyor |
| Finansal ve ödeme bilgileri | Toplanmıyor (aşağıdaki nota bakın) |
| Kimlik doğrulama bilgileri | Toplanmıyor |
| Kişisel iletişimler | Toplanmıyor |
| Konum | Toplanmıyor |
| Web geçmişi | Toplanmıyor (adres yalnızca sekme içinde, tek sayfa uygulamalarında yeniden tarama için okunur; saklanmaz, gönderilmez) |
| Kullanıcı etkinliği | Toplanmıyor |
| Web sitesi içeriği | Toplanmıyor (fiyat metni cihazda okunup yerinde değiştirilir) |

Dürüst değerlendirme — `storage.sync`: Maaş, çalışma düzeni ve gider listesi
`chrome.storage.sync`'te tutuluyor. Kullanıcının Chrome senkronizasyonu
açıksa bu veriler **Chrome tarafından** Google hesabına senkronlanır ve
kullanıcının diğer cihazlarına gider. Geliştiricinin sunucusu yok; veri bize
ya da üçüncü tarafa gelmez, Google'a giden aktarım Chrome'un kendi özelliği.
Bu yüzden "toplanmıyor" cevabı savunulabilir; gizlilik politikası
(`site/gizlilik.html`, "Bu veriler Chrome'un kendi storage.sync deposunda
tutulur…") bunu zaten açıkça yazıyor. İnceleme maaşı "finansal bilgi" sayıp
soru sorarsa iki seçenek var: (a) bu açıklamayla itiraz, (b) maaşı
`storage.local`'a taşımak (cihazlar arası eşitleme kaybolur). Karar PM'de.

Kur istekleri: üç kur kaynağına giden isteklerde kullanıcı verisi yok; her
HTTP isteğinde olduğu gibi kaynak sunucu IP adresini görür.

**Sertifikalar (üçü de işaretlenir):**

- [x] Kullanıcı verilerini, onaylanmış kullanım durumları dışında üçüncü taraflara satmıyorum veya aktarmıyorum.
- [x] Kullanıcı verilerini, öğemin tek amacıyla ilgisi olmayan amaçlarla kullanmıyorum veya aktarmıyorum.
- [x] Kullanıcı verilerini kredi itibarını belirlemek veya borç verme amacıyla kullanmıyorum veya aktarmıyorum.

---

## Görseller

Hepsi `store-assets/chrome/` altında; boyut, kaynak ve alan eşlemesi
[`store-assets/chrome/README.md`](store-assets/chrome/README.md).

- **Mağaza ikonu (128×128)**: **`store-icon-128-padded.png` kullanılacak**
  (Google'ın 96×96 görsel + 16 px saydam pay önerisi; PM kararı 28.10.2026).
  `store-icon-128.png` (= `src/icons/icon-128.png`, kareyi tam dolduruyor)
  yüklenmeyecek.
- **Ekran görüntüleri (1280×800, alfasız PNG, 5 adet)**, yükleme sırası:
  1. `screenshot-1-urun-sayfasi.png` — gerçek arama sayfası, fiyatların yerinde süreler
  2. `screenshot-2-panel.png` — ayar paneli (üç alan)
  3. `screenshot-3-giderler.png` — Giderler sayfası, halka grafik
  4. `screenshot-4-once-sonra.png` — aynı kartların TL ve mesai hâli yan yana
  5. `screenshot-5-test-edilen-siteler.png` — test edilmiş siteler (28.10.2026 rakamları)
- **Küçük tanıtım karesi (440×280)**: `promo-small-440x280.png`.
- **Marquee (1400×560, isteğe bağlı)**: `marquee-1400x560.png`.
- `store-assets/` kökündeki eski üç kare 35.000 TL maaşla çekilmişti;
  mağaza metniyle (50.000 TL) çeliştiği için kullanılmayacak.

---

## Dikkat

- **Anahtar kelime doldurma yasak.** Google'ın mağaza politikası, açıklamaya
  alakasız kelime yığmayı ihlal sayar ve yayından kaldırır. Yukarıdaki metin
  kelimeleri cümle içinde geçiriyor, liste halinde değil. Böyle kalsın.
- **Marka isimleri.** Trendyol, Hepsiburada, Amazon gibi isimler yalnızca
  "burada çalışır" bilgisi olarak geçiyor. Bu genelde kabul edilir, ama
  logolarını kullanma ve iş birliği izlenimi verme.
- **İngilizce listeleme sonra.** Mağaza dil bazlı yerelleştirme destekliyor.
  Türkçe'de sıralama tuttuktan sonra İngilizce sürüm ekle; "price to hours"
  aramasında rekabet çok daha yüksek.
