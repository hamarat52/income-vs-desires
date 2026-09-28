# Site SEO planı

## Durum

31.07.2026 taramasında Türkçe'de fiyatları çalışma saatine çeviren başka bir
eklenti bulunamadı. Bu iyi haber ama şu anlama da geliyor: **kimse bu şeyi
aramıyor.** Marka adı ve "fiyat saat çevirici" gibi ifadelerin hacmi sıfıra
yakın.

Bu yüzden strateji, ürünün adını aratmayı beklemek değil. **İnsanların zaten
arattığı sorulara cevap verip oradan eklentiye getirmek.**

## Üç kelime kümesi

### 1. Hesaplama niyeti (hacim yüksek, rekabet yüksek)

`saatlik ücret hesaplama`, `maaş saatlik hesaplama`, `net maaş kaç saat`

Bu aramaları avukat siteleri ve hesaplama araçları tutuyor. Doğrudan yarışmak
zor. Ama bu bizim ürünümüzün de yaptığı hesap, o yüzden:

- Ana sayfada **çalışan bir hesaplayıcı** var (`/#hesapla`). Sadece rakamı
  vermiyor, "bu para şu kadar kahve/kira/telefon eder" tablosunu da gösteriyor.
  Rakiplerin çoğunda bu yok.
- `FAQPage` schema ile "Saatlik ücretim nasıl hesaplanıyor?" sorusu işaretlendi.
  Zengin sonuç şansı var.
- Blog: **Saatlik ücret nasıl hesaplanır? 225 saat mi, 176 saat mi?**
  Bu gerçek bir kafa karışıklığı ve kimse net cevap vermiyor. Uzun kuyruk
  buradan gelir.

### 2. Bütçe niyeti (hacim iyi, rekabet orta)

`kira maaşın yüzde kaçı olmalı`, `kira gelirin ne kadarı olmalı`,
`abonelik ücretleri`

- Blog: **Kira maaşın yüzde kaçı olmalı? Yüzdeyi bırak, güne bak**
  Herkes "yüzde 30" diyor. Biz farklı bir birim öneriyoruz, bu da hem özgün
  içerik hem de doğrudan ürünün giderler sayfasına köprü.

### 3. Davranış niyeti (hacim orta, rekabet düşük, dönüşüm en yüksek)

`dürtüsel alışveriş`, `gereksiz harcamayı bırakma`, `para biriktirememe`

- Blog: **Dürtüsel alışverişi bırakmanın en sıkıcı ama en işe yarayan yolu**
  Bu kümedeki okuyucu zaten bir çözüm arıyor. En yüksek kurulum oranı buradan
  beklenir.

## Sayfa haritası

| Sayfa | Hedef ifade | Rol |
|---|---|---|
| `/` | fiyatları saate çeviren eklenti, saatlik ücret hesaplama | dönüşüm + hesaplayıcı |
| `/blog/saatlik-ucret-nasil-hesaplanir.html` | saatlik ücret nasıl hesaplanır | trafik kapısı |
| `/blog/kira-maasin-yuzde-kaci-olmali.html` | kira maaşın yüzde kaçı olmalı | trafik kapısı |
| `/blog/durtusel-alisveristen-kurtulmak.html` | dürtüsel alışveriş | dönüşüm odaklı |
| `/gizlilik.html` | (aranmaz) | mağaza zorunluluğu + güven |

Her yazı diğer ikisine ve ana sayfaya bağlanıyor; ana sayfa da üç yazıya
bağlanıyor. Tek başına duran sayfa yok.

## Teknik

Yerinde olanlar:

- Her sayfada tekil `title`, `meta description`, `canonical`
- `SoftwareApplication` + `FAQPage` schema (ana sayfa), `Article` schema (yazılar)
- `sitemap.xml` ve `robots.txt`, `node site/build.js` ile üretiliyor
- Open Graph etiketleri
- Sıfır JavaScript bağımlılığı, sıfır webfont, sıfır üçüncü taraf istek.
  Core Web Vitals bu yüzden zaten iyi.
- `lang="tr"`, semantik başlık hiyerarşisi, `skip` bağlantısı

### Alan adı

Henüz alınmadı. Sayfalardaki `canonical`, `og:url` ve `mainEntityOfPage`
adresleri `site/posts.json` içindeki **`siteUrl`** satırından türetiliyor:

```bash
node site/build.js
```

Bu betik tüm sayfalardaki mutlak adresleri `siteUrl`'e göre yeniden yazar.
Alan adı alınınca tek yapılacak, `posts.json` içindeki o satırı değiştirip
betiği çalıştırmak. Sahte bir alan adıyla test edildi: 6 sayfa güncellendi,
`schema.org` gibi dış adreslere dokunulmadı.

Yayına almadan önce yapılacaklar:

- [ ] Alan adını al, `site/posts.json > siteUrl` satırını değiştir, `build.js` çalıştır
- [ ] `og:image` için 1200x630 bir görsel üret (şu an yok, paylaşımlar boş kart
      olarak görünür)
- [ ] Google Search Console'a ekle, sitemap gönder
- [ ] Eklenti mağazaya girince mağaza bağlantısını `data-store-link` işaretli
      butona koy (`site/index.html` içinde)

## Sonraki yazı fikirleri

Hacme göre sıralı, hepsi ürüne doğal köprü kurabiliyor:

1. **Asgari ücretle X kaç saat eder?** Güncel asgari ücret rakamıyla bir dizi
   ürünün karşılığı. Her zam döneminde güncellenir, sürekli trafik getirir.
2. **Netflix, Spotify, iCloud: aboneliklerin yılda kaç günün?** Abonelik
   isimleri arama hacmi taşıyor.
3. **Zam aldın mı, yoksa enflasyon mu yedi?** Maaş artışını çalışma saati
   cinsinden ölçen bir bakış.
4. **Taksitli almak neden daha pahalı hissettirmiyor?** Taksit psikolojisi,
   dürtüsel alışveriş yazısının devamı.

## Ölçüm

Analitik betiği bilerek konulmadı; gizlilik vaadinin bir parçası. Bunun yerine:

- Search Console (tıklama, gösterim, sıralama)
- Chrome Web Mağazası istatistikleri (kurulum, kaynak)

Sunucu tarafı bir log tutulacaksa bile IP saklanmamalı, yoksa
`gizlilik.html` içindeki iddia yalan olur.
