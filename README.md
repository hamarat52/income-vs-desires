# IncomeVsDesires

İnternette gezerken gördüğün fiyatları, **senin maaşına göre ne kadar çalışman
gerektiğine** çeviren Chrome eklentisi.

> Spor ayakkabı — ~~500 TL~~ → **1,8 saat**

Süreye tıklarsan orijinal fiyat geri gelir.

## Kurulum (geliştirme)

1. Chrome'da `chrome://extensions` aç
2. Sağ üstten **Geliştirici modu**nu aç
3. **Paketlenmemiş öğe yükle** → bu klasörü (`incomevsdesires`) seç
4. Araç çubuğundaki ikona tıkla; **aylık net maaşını**, **günde kaç saat** ve
   **ayda kaç gün** çalıştığını gir

## Giderler sayfası (tam sayfa)

Panelden **Giderlerin ve grafik →** ile açılır (`chrome://extensions` → Ayrıntılar
→ Uzantı seçenekleri de aynı sayfayı açar).

Kira, dijital abonelik ve diğer sabit giderleri gir; her biri için ayda ne kadar
çalıştığını gösterir. Yıllık ödemeler (alan adı, yıllık abonelik) otomatik
aylığa bölünür.

Halka grafik ayın mesaisini parça-bütün gösterir: kira / abonelik / diğer /
sana kalan. Giderler maaşı aşarsa merkez, gideri karşılamak için kaç günlük
mesai gerektiğini yazar ve uyarı çıkar.

Grafik renkleri `dataviz` referans paletinin ilk üç kategorik yuvası; hem açık
hem koyu zeminde `validate_palette.js` ile doğrulandı (all-pairs CVD ΔE 9.2 /
9.4). Değerler ayrıca tabloda ve efsanede yazılı — renk tek başına bilgi
taşımıyor.

Sayfanın altında iki bölüm daha var:

- **Test edilmiş siteler** — aşağıdaki saha testinin sonucu. Liste
  `src/options.js` içindeki `TESTED_SITES` sabitinden gelir. Kullanıcının
  kapattığı siteler "bu sitede kapalı" etiketiyle işaretlenir.
- **Hata bildir / özellik iste** — rapora eklenti sürümü, tarayıcı, para birimi
  ve çalışma düzeni otomatik eklenir; **maaş ve gider listesi asla eklenmez**.
  Gönderilecek metin `<details>` içinde olduğu gibi gösterilir.

  Hedef adres `src/options.js` başındaki `FEEDBACK_EMAIL` sabitidir. Boşken
  "Gönder" butonu gizlenir, sadece "Panoya kopyala" kalır.

## Panel

- **Sayfayı yeniden tara** — geç yüklenen ya da kaçan fiyatlar için. Basınca kaç
  fiyatın çevrildiğini butonun üstünde yazar. (Eklentiyi kapatıp açmakla aynı
  işi yapar, sekmeyi yenilemeye gerek yok.)
- **`<site>` için kapat** — o alan adında eklentiyi devre dışı bırakır.

## Nasıl çalışıyor

- **Saatlik kazanç** = aylık maaş ÷ (günlük saat × aylık gün)
- Sayfadaki fiyat farklı bir para birimindeyse (`$`, `€`, `£`) önce senin para
  birimine çevrilir. Kurlar [Frankfurter](https://frankfurter.dev) (ECB verisi)
  üzerinden 12 saatte bir tazelenir; API'ye ulaşılamazsa yaklaşık sabit kurlar
  kullanılır ve panelde uyarı çıkar.
- Birim otomatik seçilir: **dk → saat → gün → ay → yıl**, ve sınırlar senin
  düzeninden gelir:
  - `1 gün` = **bir günlük mesai** (ör. 8 saat)
  - `1 ay` = **bir aylık mesai** (ör. 8 × 22 = 176 saat)
  - `1 yıl` = **12 aylık mesai**

  Yani "1 ay" gördüğün şey tam olarak bir maaşın demek. Yıl olmadan pahalı
  şeyler okunmuyordu: bir araba "133 ay" diye yazınca kimse kafasında bölmüyor,
  "3,1 yıl" ise anında oturuyor.

## Yeniden tarama

Sayfa değiştikçe eklenti kendini günceller, elle "yeniden tara" demek
gerekmez:

- **MutationObserver** eklenen düğümleri izler (sonsuz kaydırma, geç yüklenen
  kartlar). Tarama sırasında gözlemci **kapatılmaz**; eskiden kapatılıyordu ve
  kapalı kaldığı 30-130 ms'te gelen içerik kalıcı olarak kaçıyordu.
- **Adres izleyici** saniyede bir `location.href` okur. Tek sayfa
  uygulamalarında (Sahibinden'de kategori değiştirmek gibi) adres değişir ama
  belge aynı kalır; içerik bazen gözlemcinin göremeyeceği şekilde yerinde
  değişir.

  `history.pushState` yamamak işe yaramaz — içerik betiği ayrı bir JS
  dünyasında çalışır, sayfanın kendi çağrısını göremez. `webNavigation` izni
  ise gezinme geçmişine erişim ister ve gizlilik sözünü bozardı.

## Tasarım dili

Eklenti ve site aynı dili konuşuyor: **"mesai kartı"** — kağıt yüzey, cetvel
çizgileri, monospace rakamlar, tek mühür aksanı (`#b8371f`). Rakamlar ürünün
kendisi olduğu için tipografi onların etrafında kuruldu: sayı gördüğün her yer
monospace, açıklama metni sans.

- Eklenti tarafında ortak değişkenler [`src/tokens.css`](src/tokens.css),
  sitede [`site/style.css`](site/style.css). İkisi aynı paleti taşıyor.
- **Aydınlık varsayılan.** Sistem karanlık olsa bile aydınlık açılır; karanlık
  bilinçli bir tercih. Eklentide Giderler sayfasındaki "Görünüm" bölümünden,
  sitede üst bardaki ☾ düğmesinden seçilir.
- Tercih eklentide `chrome.storage.sync`'te (cihazlar arası), sitede
  `localStorage`'da. İkisinde de `theme.js` boyamadan **önce** senkron çalışıp
  temayı uygular, yoksa sayfa aydınlık çizilip karanlığa atlıyor.
- Grafik renkleri yeni zeminlere karşı `validate_palette.js` ile yeniden
  doğrulandı: all-pairs CVD ΔE 9.2 (aydınlık) / 9.4 (karanlık), geçti.

Sayfaya enjekte edilen fiyat etiketi (`content.css`) bilerek bu paleti
**kullanmıyor**; ziyaret edilen sitenin font ve rengini miras alıp sadece
noktalı alt çizgiyle ayrışıyor. Her siteye kendi kırmızımızı dayatmak yabancı
dururdu.

## Tanıtım sitesi

`site/` altında, bağımlılığı olmayan statik bir site. Tasarım dili "mesai
kartı": kağıt yüzey, cetvel çizgileri, monospace rakamlar, tek mühür aksanı.
Eklentideki noktalı alt çizgi motifi siteye de taşındı.

```bash
node incomevsdesires/site/build.js
```

`posts.json`'dan `blog/index.html`, `sitemap.xml` ve `robots.txt` üretir.
Yazıların kendisi elle yazılıyor; derleyici sadece listeyi ve SEO dosyalarını
tek kaynaktan tutuyor, birbirinden kaymasınlar diye.

Önizleme: kök `.claude/launch.json` içindeki **`incomevsdesires (site)`**
yapılandırması (`npx serve`, port 4321).

Ana sayfada çalışan bir saatlik ücret hesaplayıcısı var. Hem ürünü gösteriyor
hem de SEO'nun ana kancası; ayrıntı için [SEO.md](SEO.md).

Mağaza listeleme metni, izin gerekçeleri ve eksik görseller:
[MAGAZA-LISTELEME.md](MAGAZA-LISTELEME.md).

## Dosyalar

| Dosya | İş |
|---|---|
| `src/lib/money.js` | Fiyat regex'i, sayı ayrıştırma, kur çevrimi, süre biçimlendirme. Üç bağlamda da paylaşılır. |
| `src/content.js` | DOM taraması, fiyat → süre değişimi, tıklama, `MutationObserver` |
| `src/background.js` | Kur tablosunu çeker ve `storage.local`'da önbelleğe alır |
| `src/popup.*` | Ayar paneli |
| `src/options.*` | Giderler sayfası: gider listesi, stat tile'lar, halka grafik |
| `test/demo.html` | Eklenti yüklemeden test etmek için sahte `chrome.*` API'li sayfa — tarayıcıda direkt aç |
| `test/test-money.js` | Birim testleri: fiyat yakalama, sayı ayrıştırma, süre birimleri (`node test/test-money.js`) |
| `test/test-background.js` | Service worker testleri: kur çekme, önbellek, çöküş yolları (`node test/test-background.js`) |
| `test/build-popup-preview.js` | Ayar panelini tarayıcıda açılabilir tek dosyaya gömer; ayrıca `popup-stage.html` (büyütülmüş vitrin) üretir |
| `test/build-options-preview.js` | Giderler sayfası için aynısı; `window.__ivdErrors`'a yakalanan hataları da toplar |

## Saha testi (31.07.2026)

Gerçek sitelerde, gerçek algoritmayla ölçüldü.

| Site | Element | Bulunan fiyat | Süre |
|---|---|---|---|
| LC Waikiki | 7.447 | **191 / 191** | 41 ms |
| Migros | 3.418 | **49 / 49** | 17 ms |
| Hepsiburada | — | 162 | — |
| Amazon.com.tr | 8.869 | 68 | 128 ms |
| Google Alışveriş | 8.545 | 68 | 88 ms |
| Trendyol (arama) | — | 67 | — |
| n11 | — | 41 | — |

Sahibinden bot korumasına takıldı; MediaMarkt test tarayıcısında ürünleri hiç
render etmedi (sayfadaki tek fiyat bulundu).

Testte çıkıp düzeltilen hatalar:

1. **Hepsiburada** — kuruş ayrı elementte (`2.144<span>,35 TL</span>`). Eski kod
   `,35 TL`'yi ayrı fiyat sanıp "7 dk" yazıyordu. → alt ağaç düzleştirme.
2. **Amazon** — fiyat iki kez yazılı, ilki `.a-offscreen` ile gizli. Eşleşme iki
   kopyanın arasına denk gelip fiyatı ekrandan siliyordu. → gizli metin dışlanır.
3. **Google Alışveriş** — manifest'te tüm `google.com` hariç tutulmuştu; açıldı.
   Ardından `checkVisibility()` 1.568 elementin 1.077'sini görünmez sayıp ürün
   kartlarını yuttu (3 fiyat bulunuyordu) → o kontrol kaldırıldı, 68'e çıktı.
4. `"Beden 42 500 TL"` → 42.500 TL okunuyordu. Normal boşluk artık binlik ayracı
   değil.
5. `<div>Kargo 50</div><div>TL Bank</div>` → "50 TL" olarak birleşiyordu. Blok
   sınırlarına ayraç kondu.

## Bilinen sınırlar

- Şu an TRY / USD / EUR / GBP destekleniyor.
- Fiyatın **sayısı** bir element sınırıyla bölünmüşse (ör.
  `<span>1.299</span><sup>,90</sup>`) yakalanmaz. Aynı elementin ardışık metin
  düğümlerine bölünmesi (React'in `350<!-- --> <!-- -->TL` yapısı) sorun değil.
- Sayfa fiyat metnini düğümü değiştirmeden yerinde güncellerse (`characterData`)
  fark edilmez; yeni düğüm eklendiğinde sorun yok.
- Google alan adları hariç tutuldu (arama sonuçlarında gürültü yapıyordu).
- İkon dosyası yok; Chrome varsayılan ikonu gösterir.
