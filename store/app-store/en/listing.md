# App Store Connect — English listing (Safari extension: macOS + iOS/iPadOS)

Same features as the Turkish listing ([`../tr/listing.md`](../tr/listing.md)).
Shared forms: [`../shared/`](../shared/) (app privacy, age rating, encryption,
review notes, category and price). Limits are counted by
`node scripts/check-listing-length.js`.

Rules (PM check 28.10, developer.apple.com/help/app-store-connect/reference):
name ≤ 30, subtitle ≤ 30, promotional text ≤ 170, description ≤ 4000,
keywords ≤ 100 **bytes** (each > 2 characters, don't repeat the app or company
name). Guideline 2.3.10: no other platform names (**no "Chrome"**); 2.3.7: no
price talk in metadata — no "free" in the promotional text.

App Store localization: Name, subtitle, description, keywords, promotional
text, screenshots, support and marketing URLs can be localized; add
"English (U.S.)" as a localization next to Turkish (primary language: Yusuf's
call, see `store/README.md`).

---

## Name (≤ 30)

```
IncomeVsDesires: Work Hours
```

**Yusuf decides** (the TR name is `IncomeVsDesires: Maaşa Göre`). Options:
`IncomeVsDesires` (brand only) · `IncomeVsDesires: Pay in Hours` (29).

## Subtitle (≤ 30)

```
Turn prices into time you work
```

## Promotional text (≤ 170)

Can be changed without review.

```
Enter your pay once, and the prices you see in Safari show how many hours and days of work they cost. No data collection, no account.
```

## Keywords (≤ 100 bytes)

Words already in the name and subtitle (incomevsdesires, work, hours, turn,
prices, into, time, you) are not repeated; no store or brand names (5.2.5).

```
salary,budget,savings,spending,shopping,wage,hourly,money,expenses,cost,currency,safari,extension
```

## Description (≤ 4000)

```
Price tags speak in money. You live your life in hours.

IncomeVsDesires turns the prices you see in Safari into your working time. For someone who takes home $5,000 a month working 8 hours a day, a $79.99 pair of sneakers reads "2.8 hours". Tap it and the price comes back.


HOW IT WORKS

1. Enter your monthly take-home pay, how many hours a day and how many days a month you work.
2. Go shopping. Prices now read in hours, days and months.
3. Watch your mind change.

Your hourly rate is: take-home pay / (hours per day x days per month). With $5,000 a month, 8 hours a day and 22 days a month, one hour of your work is worth $28.41.


UNITS COME FROM YOUR SCHEDULE

"1 day" is one of your workdays and "1 month" is one full paycheck. Not calendar time, but time spent working, so the number stays concrete. Prefer calendar time? Turn on "1 day = 24 hours".


YOUR FIXED EXPENSES

Add rent, phone plan and subscriptions; a donut chart shows how many days of your month go to each. Yearly payments are split into months automatically. Instead of knowing that rent is 30% of your pay, you see that you work 6.6 days a month for it.


FOREIGN-CURRENCY PRICES

Turkish lira, US dollar, euro and British pound are supported. A price written in one of them is first converted to your currency. Rates come daily from European Central Bank data.


NO SITE LIST

The extension isn't tied to particular stores; it recognises how prices are written on the page, so it works without depending on a list of shops.


LANGUAGES

English and Turkish; it follows your device language.


HOW TO TURN IT ON

Mac: Open the app once, then enable IncomeVsDesires in Safari > Settings > Extensions and allow it on websites.
iPhone and iPad: Turn on IncomeVsDesires in Settings > Apps > Safari > Extensions and allow it on websites.


PRIVACY

No server. No account. No analytics. Your pay and expenses stay in Safari's extension storage and never reach us. The sites you visit and the prices you see go nowhere. The only outgoing request is a daily call that fetches the exchange-rate table (if the main source is unreachable, the same table is requested from two backup sources); it contains nothing that identifies you.

The extension never runs on email, document or banking sites. You can also turn it off for any site with one tap from the panel.


NO ADS

No ads, no subscription, no in-app purchases.
```

Notes:
- No field-test table, same as TR: the measurements were made in another
  browser (2.3.10 forbids naming it) and not in Safari.
- Example numbers ($79.99 → 2.8 hours, rent $1,500 → 6.6 days, 30%, $28.41)
  come from `IVD.formatDuration` with 5,000 USD · 8 h · 22 days.

## What's New

Not available for the first version. Template for version 2:
[`whats-new.md`](whats-new.md).

## URLs

| Field | Value | Status |
|---|---|---|
| Support URL (required) | `https://hamarat52.github.io/income-vs-desires/en/support.html` | **live after push** (28.10: 404). Real contact: GitHub Issues + email (publishing the email is **Yusuf's approval**) |
| Marketing URL (optional) | `https://hamarat52.github.io/income-vs-desires/` | live, Turkish only |
| Privacy policy URL (required, app level) | `https://hamarat52.github.io/income-vs-desires/en/privacy.html` | **live after push**; TR page live now |

## Copyright

```
2026 Muhammed Yusuf Hamarat
```

## Screenshots

`en/{iphone,ipad,mac}/` — empty, ImageArtist fills them. Raw EN frames
(English UI, IKEA US, Chrome viewport — to be replaced with Safari captures):
`store/raw/en/{iphone,ipad,desktop}/`.
