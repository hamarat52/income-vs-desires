# Chrome Web Store — Gizlilik uygulamaları sekmesi / Privacy practices tab

İki dil için ortak (sekme tek; metin alanları İngilizce de yazılabilir).
Kaynak: eski `MAGAZA-LISTELEME.md` bölümleri, 28.10.2026'da `manifest.json` ve
`src/` ile yeniden doğrulandı. / Source: former `MAGAZA-LISTELEME.md`,
re-checked against `manifest.json` and `src/` on 2026-10-28.

## Tek amaç / Single purpose

TR:

> Eklentinin tek amacı, kullanıcının girdiği maaş bilgisine göre web
> sayfalarındaki para tutarlarını çalışma süresine çevirerek göstermektir.

EN:

> The extension's single purpose is to show the prices on web pages as the
> working time they cost, based on the pay the user enters.

## İzin gerekçeleri / Permission justifications

`manifest.json` ile birebir (28.10.2026): `permissions` = `storage`, `alarms`,
`activeTab`; `host_permissions` = 3 kur kaynağı; tek `content_scripts` girdisi
`<all_urls>` (+ `exclude_matches`). Başka izin yok. / Matches `manifest.json`
exactly; no other permissions.

| İzin / Permission | TR | EN |
|---|---|---|
| `storage` | Kullanıcının maaşını, çalışma düzenini, görünüm tercihlerini ve gider listesini (`storage.sync`) ve son çekilen kur tablosunu (`storage.local`) saklamak için. | To store the user's pay, work schedule, display preferences and expense list (`storage.sync`) and the last fetched exchange-rate table (`storage.local`). |
| `activeTab` | Kullanıcı araç çubuğundaki panele tıkladığında yalnızca o anki sekmede: alan adını okuyup "… için kapat" düğmesini göstermek ve "sayfayı yeniden tara" mesajını göndermek için. | Only for the current tab when the user clicks the toolbar panel: to read the domain for the "Turn off for …" button and to send the "Rescan this page" message. |
| `alarms` | Döviz kurlarını günde bir kez tazelemek için. | To refresh exchange rates once a day. |
| `host_permissions: api.frankfurter.dev` | Döviz kuru tablosunu çekmek için (ana kaynak, ECB verisi). | To fetch the exchange-rate table (primary source, ECB data). |
| `host_permissions: open.er-api.com`, `cdn.jsdelivr.net` | Ana kaynağa ulaşılamazsa sırayla denenen iki yedek kur kaynağı. İstekler yalnızca kur tablosunu ister; kullanıcıya ait hiçbir veri içermez. Eklentinin yaptığı dış istekler yalnızca bunlardır. | Two backup rate sources tried in turn if the primary is unreachable. Requests ask only for the rate table and contain no user data. These are the extension's only outgoing requests. |
| `content_scripts: <all_urls>` | Fiyat hangi sitede olursa olsun çevrilebilsin diye; eklenti site listesi tutmaz. Sayfa metni yalnızca cihazda okunur ve yerinde değiştirilir; hiçbir yere gönderilmez. E-posta, doküman ve 4 banka `exclude_matches` ile dışarıda. | So prices can be converted on any site; the extension keeps no site list. Page text is read only on the device and changed in place; it is never sent anywhere. Email, document and 4 banking sites are excluded via `exclude_matches`. |

## Uzak kod / Remote code

**Uzak kod kullanıyor musunuz? / Are you using remote code?** → **Hayır / No.**

Kanıt (28.10.2026, `src/` üzerinde grep): `eval(`, `new Function`,
`importScripts`, dizgeli `setTimeout/setInterval`, dinamik `import(`,
`chrome.scripting`/`executeScript` ve dış adresli `<script src>` **yok** (tek
eşleşme `background.js:5`'teki "importScripts kaldırıldı" yorumu). Tüm
`<script>` etiketleri paket içi dosyalar (`theme.js`, `lib/i18n.js`,
`lib/money.js`, `popup.js`, `options.js`). Tek `fetch` çağrısı
`background.js:121`; yalnızca JSON kur tablosu alır, çalıştırılabilir kod değil.
Arayüz metinleri paketteki `_locales/{en,tr}/messages.json`'dan okunur.

Evidence (2026-10-28, grep over `src/`): no `eval(`, `new Function`,
`importScripts`, string `setTimeout/setInterval`, dynamic `import(`,
`chrome.scripting`/`executeScript` or external `<script src>`. All scripts are
packaged files. The only `fetch` (`background.js:121`) receives a JSON rate
table, not code. UI strings come from the packaged `_locales`.

## Veri kullanımı / Data usage

Hiçbir kutu işaretlenmez. / No box is checked.

| Kategori / Category | Durum / Status |
|---|---|
| Kişisel kimlik bilgileri / Personally identifiable information | Toplanmıyor / Not collected |
| Sağlık / Health information | Toplanmıyor / Not collected |
| Finansal ve ödeme / Financial and payment information | Toplanmıyor (nota bakın) / Not collected (see note) |
| Kimlik doğrulama / Authentication information | Toplanmıyor / Not collected |
| Kişisel iletişimler / Personal communications | Toplanmıyor / Not collected |
| Konum / Location | Toplanmıyor / Not collected |
| Web geçmişi / Web history | Toplanmıyor (adres yalnızca sekme içinde, tek sayfa uygulamalarında yeniden tarama için okunur; saklanmaz, gönderilmez) / Not collected (the URL is read inside the tab only to rescan single-page apps; never stored or sent) |
| Kullanıcı etkinliği / User activity | Toplanmıyor / Not collected |
| Web sitesi içeriği / Website content | Toplanmıyor (fiyat metni cihazda okunup yerinde değiştirilir) / Not collected (price text is read and replaced on the device) |

Dürüst değerlendirme — `storage.sync`: Maaş, çalışma düzeni ve gider listesi
`chrome.storage.sync`'te. Kullanıcının Chrome senkronizasyonu açıksa veriler
**Chrome tarafından** Google hesabına senkronlanır. Geliştiricinin sunucusu
yok; veri bize ya da üçüncü tarafa gelmez. "Toplanmıyor" savunulabilir;
gizlilik politikası (`site/gizlilik.html`, `site/en/privacy.html`) bunu açıkça
yazıyor. İnceleme maaşı "finansal bilgi" sayıp sorarsa: (a) bu açıklamayla
itiraz, (b) maaşı `storage.local`'a taşımak (cihazlar arası eşitleme kaybolur).
Karar PM'de.

Honest note — `storage.sync`: pay, schedule and expenses live in
`chrome.storage.sync`; with Chrome sync on, **Chrome** syncs them through the
user's Google account. There is no developer server; nothing reaches us or a
third party.

Kur istekleri / rate requests: kullanıcı verisi yok; her HTTP isteğinde olduğu
gibi kaynak sunucu IP adresini görür. / No user data; as with any HTTP request,
the source server sees the IP address.

## Sertifikalar / Certifications (üçü de işaretlenir / all three checked)

- [x] Kullanıcı verilerini, onaylanmış kullanım durumları dışında üçüncü taraflara satmıyorum veya aktarmıyorum. / I do not sell or transfer user data to third parties, outside of the approved use cases.
- [x] Kullanıcı verilerini, öğemin tek amacıyla ilgisi olmayan amaçlarla kullanmıyorum veya aktarmıyorum. / I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- [x] Kullanıcı verilerini kredi itibarını belirlemek veya borç verme amacıyla kullanmıyorum veya aktarmıyorum. / I do not use or transfer user data to determine creditworthiness or for lending purposes.

## Gizlilik politikası URL / Privacy policy URL

- TR: `https://hamarat52.github.io/income-vs-desires/gizlilik.html` (yayında)
- EN: `https://hamarat52.github.io/income-vs-desires/en/privacy.html` (push sonrası)
