# Chrome Web Mağazası listeleme metni

Mağaza içi arama üç alana bakar: **ad**, **kısa açıklama**, **detaylı açıklama**.
Ağırlık bu sırayla azalır. "IncomeVsDesires" tek başına hiç aranmayan bir kelime,
o yüzden ad marka + arananan ifade şeklinde kurulmalı.

Türkçe'de bu işi yapan başka eklenti bulunamadı (31.07.2026 taraması), yani
niş boş. Rekabet düşükken doğru kelimeleri kapmak kolay.

---

## Ad (75 karakter sınırı)

```
IncomeVsDesires: Fiyatları Maaşına Göre Saate Çevirir
```

53 karakter. İçinde üç arama kelimesi var: **fiyat**, **maaş**, **saat**.

Alternatifler:

| Seçenek | Karakter | Not |
|---|---|---|
| `IncomeVsDesires: Fiyatları Maaşına Göre Saate Çevirir` | 53 | önerilen |
| `IncomeVsDesires: Fiyat Saat Çevirici, Saatlik Ücret Hesaplama` | 61 | daha çok kelime ama robotik okunuyor |
| `IncomeVsDesires` | 15 | sadece marka; şu an sıfır arama hacmi, kullanma |

## Kısa açıklama (132 karakter sınırı)

Arama sonuçlarında görünen tek metin bu. En yüksek dönüşüm etkisi burada.

```
Maaşını gir, fiyatlar kaç saat çalıştığına dönüşsün. 500 TL yerine 1,8 saat. Veri toplamaz, kayıt istemez, ücretsiz.
```

115 karakter. Ne yaptığını ilk cümlede söylüyor, ikinci cümlede örnek veriyor,
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


GERÇEK SAYFALARDA TEST EDİLDİ

Sayfadaki fiyatların kaçını yakaladığı ve taramanın kaç milisaniye sürdüğü
ölçüldü:

  LC Waikiki         191 / 191 fiyat     41 ms
  Migros              49 / 49 fiyat      17 ms
  Hepsiburada            162 fiyat
  Amazon.com.tr           68 fiyat      128 ms
  Google Alışveriş        68 fiyat       88 ms
  Trendyol                67 fiyat
  n11                     41 fiyat

Eklenti site listesi tutmaz, sayfadaki fiyat yazımını tanır. Bu yüzden listede
olmayan sitelerde de çalışır.


GİZLİLİK

Sunucumuz yok. Hesap yok. Analitik yok. Maaşın ve giderlerin yalnızca senin
tarayıcında durur. Gezdiğin siteler, gördüğün fiyatlar hiçbir yere gitmez.
Dışarıya çıkan tek istek, döviz kuru tablosunu çeken günlük çağrıdır (ana
kaynağa ulaşılamazsa aynı tablo iki yedek kaynaktan istenir).

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
| Gizlilik politikası URL | `https://incomevsdesires.com/gizlilik.html` |
| Destek sitesi | `https://incomevsdesires.com` |

### Tek amaç beyanı (single purpose)

Google inceleme sırasında bunu ister:

> Eklentinin tek amacı, kullanıcının girdiği maaş bilgisine göre web
> sayfalarındaki para tutarlarını çalışma süresine çevirerek göstermektir.

### İzin gerekçeleri

| İzin | Gerekçe |
|---|---|
| `storage` | Kullanıcının maaşını, çalışma düzenini ve gider listesini cihazda saklamak için. |
| `activeTab` | Panelden "sayfayı yeniden tara" denince yalnızca aktif sekmeye mesaj göndermek için. |
| `alarms` | Döviz kurlarını günde bir kez tazelemek için. |
| `host_permissions: api.frankfurter.dev` | Döviz kuru tablosunu çekmek için (ana kaynak, ECB verisi). |
| `host_permissions: open.er-api.com`, `cdn.jsdelivr.net` | Ana kaynağa ulaşılamazsa sırayla denenen iki yedek kur kaynağı. İstekler yalnızca kur tablosunu ister; kullanıcıya ait hiçbir veri içermez. Eklentinin yaptığı dış istekler yalnızca bunlardır. |
| `content_scripts: <all_urls>` | Fiyat hangi sitede olursa olsun çevrilebilsin diye. Eklenti site listesi tutmaz. |

---

## Görseller

- **İkon**: hazır. `src/icons/icon-{16,32,48,128}.png`, hamaratlabs-web'deki
  resmi AppIcon.jsx tasarımından (yeşil terazi glyph'i, #43e08c/#0c9a6c,
  liquid-glass efekti) üretildi; `manifest.json`'daki `icons` ve
  `action.default_icon` alanlarına bağlandı.
- **Ekran görüntüsü**: Hâlâ eksik, mağazaya yüklemeden önce hazırlanmalı.
  1280x800, en fazla 5 tane. Önerilen sıra:
  1. Gerçek bir ürün sayfası, fiyatların yerinde süreler (en güçlü kare, ilk sırada olmalı)
  2. Ayar paneli (üç alan, ne kadar basit olduğu görünsün)
  3. Giderler sayfası, halka grafik
  4. Aynı fiyatın para ve saat hali yan yana (öncesi/sonrası)
  5. Test edilmiş siteler listesi
- **Küçük tanıtım karesi**: 440x280.

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
