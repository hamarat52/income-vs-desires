# QA Raporu — Tanıtım sitesi Tailscale test URL'i

Tarih: 2026-10-20 · Hazırlayan: PM (Income vs Desires)

## Sonuç

Test URL (yalnız tailnet): https://hamarat-imac-2.tail619dc2.ts.net:8090/

GitHub Pages canlı deploy'a dokunulmadı. Repo çalışma ağacı değişmedi (git status öncesi/sonrası aynı: yalnız eski 4 untracked + bu rapor).

## Kurulum

| Parça | Değer |
|---|---|
| Yerel sunucu | `python3 -m http.server 8090 --bind 127.0.0.1` (yalnız loopback) |
| Kalıcılık | launchd LaunchAgent `com.hamarat.ivd-site-test` (RunAtLoad + KeepAlive) |
| plist | `~/Library/LaunchAgents/com.hamarat.ivd-site-test.plist` |
| Servis edilen klasör | `~/.hermes/profiles/pm-ind/services/ivd-site-test/www` |
| Log | `~/.hermes/profiles/pm-ind/services/ivd-site-test/server.log` |
| Tazeleme betiği | `~/.hermes/profiles/pm-ind/services/ivd-site-test/yenile.sh` |
| Tailscale | `tailscale serve --bg --https=8090 http://127.0.0.1:8090` (tailnet only, funnel YOK) |

Neden repo yerine kopya servis ediliyor: `site/build.js` ayrı bir çıktı klasörü üretmiyor, `site/` içine YERİNDE yazıyor (blog/index.html, sitemap.xml, robots.txt). Repo'da çalıştırınca `sitemap.xml` içindeki `lastmod` tarihleri bugüne dönüyor ve git diff oluşuyor (kanıt: kopyada çalıştırıp `diff -r` ile görüldü, 3 satır lastmod farkı). Bu yüzden `yenile.sh`, `site/`'ı `www/`'ya rsync'leyip build.js'i kopyada çalıştırıyor. Ayrıca launchd ajanının ~/Desktop'a (TCC korumalı) erişmesi gerekmiyor.

Port seçimi: `tailscale serve status`'ta 443(→7860), 8077, 8443(→8777), 9119 doluydu; `lsof` ile 8090'ın yerelde de boş olduğu görüldü.

## Doğrulama (gerçek çıktı)

- `curl -I https://hamarat-imac-2.tail619dc2.ts.net:8090` → `HTTP/2 200`, `content-type: text/html`
- Sayfa kaynakları (tailnet URL üzerinden):
  `/` 200 · `/style.css` 200 · `/calc.js` 200 · `/theme.js` 200 · `/blog/` 200 · `/gizlilik.html` 200 · `/sitemap.xml` 200
- `<title>`: "IncomeVsDesires · Fiyatları çalışma saatine çeviren Chrome eklentisi"
- Kalıcılık: `launchctl print` → `state = running`; süreç `kill` edildi (pid 34777) → launchd yeniden başlattı (pid 34871) → URL yine 200.
- Genel ağ kapalı: LAN IP `192.168.1.111:8090` → bağlantı yok (sunucu yalnız 127.0.0.1'e bağlı). `tailscale funnel status` → funnel kaydı yok.
- `tailscale serve --bg` yapılandırması tailscaled tarafından saklanır; oturum/ terminal kapanınca düşmez.

## Kullanım

Sitedeki son değişiklikleri test URL'ine yansıtmak (sunucuyu yeniden başlatmak gerekmez):

    bash ~/.hermes/profiles/pm-ind/services/ivd-site-test/yenile.sh

Yerel sunucuyu durdur / başlat / yeniden başlat:

    launchctl bootout   gui/$(id -u)/com.hamarat.ivd-site-test
    launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.hamarat.ivd-site-test.plist
    launchctl kickstart -k gui/$(id -u)/com.hamarat.ivd-site-test

Tailscale yayınını kapat / yeniden aç:

    /usr/local/bin/tailscale serve --https=8090 off
    /usr/local/bin/tailscale serve --bg --https=8090 http://127.0.0.1:8090

Tamamen kaldırmak: önce `serve --https=8090 off`, sonra `launchctl bootout ...`, sonra plist ve `services/ivd-site-test/` klasörü (silme kullanıcı onayıyla).

## Notlar / sınırlar

- Test kopyası otomatik güncellenmez; `yenile.sh` elle çalıştırılır.
- Sayfalardaki canonical/og:url adresleri GitHub Pages'i gösterir (posts.json > siteUrl). Test için sorun değil; iç bağlantılar sayfa-göreli olduğu için 8090 kökünde çalışıyor.
- `http.server` geliştirme sunucusudur; tailnet içi test için yeterli, üretim için değil.
- Telefondan erişim için telefonun aynı tailnet'te Tailscale'e bağlı olması gerekir (bu makineden test edildi, telefondan test edilmedi).
