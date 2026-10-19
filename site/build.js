/**
 * Site derleyici, bağımlılık yok.
 *
 *   node site/build.js
 *
 * Üretir:
 *   site/blog/index.html   (posts.json'dan, elle güncellemeyi unutmayasın diye)
 *   site/sitemap.xml
 *   site/robots.txt
 *
 * Yazıların kendisi elle yazılıyor; burada sadece listeyi ve SEO dosyalarını
 * tek kaynaktan üretiyoruz ki birbirinden kaymasınlar.
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'posts.json'), 'utf8'));
const { pages, posts } = data;
const siteUrl = data.siteUrl.replace(/\/+$/, '');

const escape = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]
  );

const trDate = (iso) =>
  new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

// --- alan adını her sayfaya yay ---------------------------------------------
//
// Alan adı henüz alınmadı. Tek doğru kaynak posts.json'daki `siteUrl`; burada
// tüm sayfalardaki mutlak adresler ona göre yeniden yazılıyor. Domain alınınca
// posts.json'da tek satır değiştirip bu betiği çalıştırmak yeterli.
//
// Sadece adres taşıyan satırlara dokunuluyor (canonical / og:url /
// mainEntityOfPage), gövde metnindeki bağlantılar zaten göreli.
//
// siteUrl alt yol içerebilir (ör. https://hamarat52.github.io/income-vs-desires,
// GitHub Pages proje yolu). Bu yüzden eski adresin sadece origin'ini değiştirmek
// yetmez (ikinci çalıştırmada yol iki kez eklenirdi); her sayfanın adresi dosya
// konumundan baştan kuruluyor: siteUrl + sayfanın yolu. Tekrar çalıştırmak güvenli.
//
// Sayfa içi bağlantılar (style.css, calc.js, /blog/ …) SAYFA-GÖRELİ yazılır
// (./style.css, ../style.css): böylece site hem alan adının kökünde hem bir alt
// yolda hiçbir değişiklik olmadan çalışır. Kök-göreli (/style.css) yol alt yolda
// kırılacağı için aşağıda engelleniyor.

const ADDRESS_LINES = /(canonical|og:url|mainEntityOfPage)/;
const ADDRESS = /https?:\/\/[^\s"'<>]+/gi;
const ROOT_RELATIVE = /(?:href|src)="\/(?!\/)[^"]*"/g;

const pagePathOf = (file) =>
  '/' + path.relative(ROOT, file).split(path.sep).join('/').replace(/(^|\/)index\.html$/, '$1');

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });
}

let rewritten = 0;

for (const file of htmlFiles(ROOT)) {
  const before = fs.readFileSync(file, 'utf8');
  const after = before
    .split('\n')
    .map((line) =>
      ADDRESS_LINES.test(line) ? line.replace(ADDRESS, siteUrl + pagePathOf(file)) : line
    )
    .join('\n');

  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    rewritten++;
  }
}

// --- blog/index.html --------------------------------------------------------

const items = posts
  .map(
    (post) => `        <li>
          <a href="../blog/${post.slug}.html">
            <time datetime="${post.date}">${trDate(post.date)} · ${escape(post.readingTime)}</time>
            <div>
              <h3>${escape(post.title)}</h3>
              <p>${escape(post.summary)}</p>
            </div>
          </a>
        </li>`
  )
  .join('\n');

const blogIndex = `<!DOCTYPE html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <title>Yazılar: para, zaman ve alışveriş üzerine | IncomeVsDesires</title>
    <meta
      name="description"
      content="Saatlik ücret hesaplama, kiranın maaşa oranı, dürtüsel alışveriş. Parayı zamana çevirerek bakan kısa ve işe yarar yazılar."
    />
    <link rel="canonical" href="${siteUrl}/blog/" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="tr_TR" />
    <meta property="og:title" content="Yazılar: para, zaman ve alışveriş üzerine" />

    <link rel="stylesheet" href="../style.css" />
    <link
      rel="icon"
      href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⏳</text></svg>"
    />
    <script src="../theme.js"></script>
  </head>

  <body>
    <a class="skip" href="#main">İçeriğe geç</a>

    <header class="wrap topbar">
      <a class="brand" href="../">income<span>vs</span>desires</a>
      <nav class="topnav">
        <a href="../#hesapla">Hesapla</a>
        <a href="../#kanit">Testler</a>
        <a href="../#kur" style="color: var(--stamp)">Kur →</a>
        <button type="button" class="theme-toggle" aria-label="Karanlık görünüme geç" aria-pressed="false">☾</button>
      </nav>
    </header>

    <main id="main" class="wrap" style="padding-block: clamp(36px, 6vw, 72px)">
      <p class="eyebrow"><span>Yazılar</span></p>
      <h1 style="font-size: clamp(30px, 5vw, 48px); max-width: 18ch">
        Parayı zamana çevirerek bakmak
      </h1>
      <p class="lede" style="margin-bottom: 40px">
        Hesap makinesi çıkarmadan okunabilecek, işe yarar yazılar.
      </p>

      <ul class="post-list">
${items}
      </ul>

      <p style="margin-top: 48px">
        <a class="btn" href="../#kur">Chrome'a ücretsiz ekle</a>
      </p>
    </main>

    <footer class="section foot">
      <div class="wrap foot-grid">
        <div>
          <strong>IncomeVsDesires</strong>
          Fiyatları mesaine çevirir.
        </div>
        <div>
          <strong>Site</strong>
          <a href="../">Ana sayfa</a>
          <a href="../#hesapla">Saatlik ücret hesaplama</a>
          <a href="../gizlilik.html">Gizlilik</a>
        </div>
      </div>
    </footer>
  </body>
</html>
`;

fs.writeFileSync(path.join(ROOT, 'blog', 'index.html'), blogIndex, 'utf8');

// --- sitemap.xml ------------------------------------------------------------

const today = new Date().toISOString().slice(0, 10);

const urls = [
  ...pages.map((page) => ({ loc: siteUrl + page.path, lastmod: today, ...page })),
  ...posts.map((post) => ({
    loc: `${siteUrl}/blog/${post.slug}.html`,
    lastmod: post.date,
    changefreq: 'yearly',
    priority: '0.8',
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');

// --- robots.txt -------------------------------------------------------------

fs.writeFileSync(
  path.join(ROOT, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
  'utf8'
);

// --- eksik yazı kontrolü ----------------------------------------------------

const missing = posts.filter(
  (post) => !fs.existsSync(path.join(ROOT, 'blog', `${post.slug}.html`))
);

console.log(`blog/index.html · sitemap.xml (${urls.length} url) · robots.txt yazıldı`);
console.log(`alan adı: ${siteUrl}${rewritten ? ` (${rewritten} sayfada güncellendi)` : ''}`);

if (!process.env.IVD_DOMAIN_HAZIR) {
  console.log(
    'NOT: alan adı henüz alınmadı. Alınca posts.json > siteUrl satırını\n' +
      '     değiştirip bu betiği tekrar çalıştır, canonical adresler kendi kendine düzelir.'
  );
}

// --- kök-göreli yol kontrolü ------------------------------------------------

const rootRelative = htmlFiles(ROOT).flatMap((file) =>
  (fs.readFileSync(file, 'utf8').match(ROOT_RELATIVE) || []).map(
    (hit) => `${path.relative(ROOT, file)}: ${hit}`
  )
);

if (rootRelative.length) {
  console.warn('UYARI: kök-göreli yol var, alt yolda (GitHub Pages) kırılır. Sayfa-göreli yaz:');
  rootRelative.forEach((hit) => console.warn(`  - ${hit}`));
  process.exitCode = 1;
}

if (missing.length) {
  console.warn('UYARI: posts.json\'da olup dosyası olmayan yazılar:');
  missing.forEach((post) => console.warn(`  - blog/${post.slug}.html`));
  process.exitCode = 1;
}
