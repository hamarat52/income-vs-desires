# Kategori ve fiyat önerisi / Category and price

## Kategori / Category

Apple (App information referansı, 28.10.2026): "Category (Primary and
Secondary) … For macOS apps, you also set the app category in Xcode. The
primary category you set in App Store Connect should match the category you
set in Xcode." Kategori **App Information** düzeyinde → aynı uygulama kaydında
iOS ve Mac için **ortak**; platform başına ayrı seçilmez.

Xcode'daki geçerli `LSApplicationCategoryType` değerleri (Apple belgesi,
`developer.apple.com/documentation/bundleresources/information-property-list/lsapplicationcategorytype`):
listede `shopping` ve `safari-extensions` karşılığı **yok**; `finance`,
`lifestyle`, `productivity`, `utilities` var. Projede Mac host app'te
`public.app-category.finance` ayarlı.

"Choosing a category" sayfasında (`developer.apple.com/app-store/categories/`)
App Store kategorileri arasında **Shopping** ve **Safari Extensions** de var.
Bu sayfa Mac'te hangilerinin seçilebildiğini ayrıca listelemiyor (yalnız
"Kids (iOS and iPadOS only)" işaretli).

| | Öneri | Gerekçe |
|---|---|---|
| Birincil / Primary | **Finans / Finance** | Xcode değeriyle eşleşmesi gereken tek geçerli ve uygun değer; ortak kategori olduğundan iOS'ta da Finans görünür. |
| İkincil / Secondary | **Alışveriş / Shopping** | iOS'ta mevcut; Chrome'daki kategoriyle uyumlu. App Store Connect'te Mac için ikincilde seçilebildiği **doğrulanmadı**. Olmazsa **Yaşam Tarzı / Lifestyle**. |
| Seçenek | **Safari Extensions** | Apple'ın kategori listesinde var; Xcode karşılığı olmadığı için birincilde kullanılamayabilir. İkincil için değerlendirilebilir (**açık soru**). |

## Fiyat / Price

- **Ücretsiz / Free.** Uygulama içi satın alma yok / no in-app purchases.
- Telif / Copyright: `2026 Muhammed Yusuf Hamarat`
- Sürüm / Version: `0.1.0` (build `1`): `MARKETING_VERSION` /
  `CURRENT_PROJECT_VERSION` (pbxproj), manifest `version` `0.1.0`.
- Platformlar / Platforms: macOS 12+, iOS/iPadOS 17+ (host app 17.0 hedefli).
