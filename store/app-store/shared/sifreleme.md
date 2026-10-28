# Şifreleme / Export compliance (encryption)

Projede iki host app hedefinde (iOS App, macOS App; Debug + Release)
`INFOPLIST_KEY_ITSAppUsesNonExemptEncryption = NO`
(`safari/IncomeVsDesires/IncomeVsDesires.xcodeproj/project.pbxproj`, 28.10.2026 grep).
Bu anahtar Info.plist'e girdiği için App Store Connect her derlemede şifreleme
sorusunu sormaz.

TR gerekçe: Uygulama ve uzantı kendi şifreleme kodunu içermez. Tek ağ trafiği,
uzantının döviz kuru tablosunu HTTPS ile çekmesidir; bu, işletim sisteminin
(Safari / URLSession altyapısı) standart şifrelemesidir ve muafiyet
kapsamındadır.

EN rationale: Neither the app nor the extension contains its own encryption
code. The only network traffic is the extension fetching the exchange-rate
table over HTTPS, using the operating system's standard encryption (exempt).

Soru / Question: "Does your app use encryption?" → kayıtta sorulursa
"standart şifreleme, muaf" / if asked: "only exempt (standard OS) encryption".
Yasal yorum değildir; son karar Yusuf'ta. / Not legal advice; final call is Yusuf's.
