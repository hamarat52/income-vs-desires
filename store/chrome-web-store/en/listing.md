# Chrome Web Store — English listing

Default listing language: the manifest has `"default_locale": "en"`, so every
locale other than Turkish falls back to this page. Same features as the
Turkish listing ([`../tr/listing.md`](../tr/listing.md)) — CWS checks that
localized listings are consistent. Privacy-tab answers (single purpose,
permission justifications, remote code, data usage, certifications):
[`../shared/gizlilik-sekmesi.md`](../shared/gizlilik-sekmesi.md).
Lengths and manifest equality: `node scripts/check-listing-length.js`.

> Name and summary come from the package: `_locales/en/messages.json`
> (`extName`, `extDescription`). The detailed description, screenshots and
> YouTube video are entered per language in the dashboard.
> Note: the manifest summary contains **no "$" sign** — Chrome 156 showed
> `$$50` for the escaped form in `chrome://extensions` (manifest localization
> doesn't unescape `$$`), so it says "50 dollars".

## Name (from manifest, ≤ 75)

```
IncomeVsDesires
```

Same name in both languages (name decision is Yusuf's; not changed). A
descriptive EN name for later, **awaiting Yusuf**: `IncomeVsDesires: Prices in Hours of Your Work` (46).

## Summary (from manifest, ≤ 112)

```
Enter your pay, see prices as hours of work. 50 dollars becomes 1.8 hours. No data collection, no sign-up, free.
```

Example verified with the extension's own `IVD.formatDuration`
(`test/test-money.js`): 5,000 USD · 8 h · 22 days → $28.41/hour; $50 → "1.8 hours".

## Detailed description

```
Price tags speak in money. You live your life in hours.

IncomeVsDesires turns prices on the web into your working time. For someone
who takes home $5,000 a month working 8 hours a day, a $79.99 pair of
sneakers reads "2.8 hours". Click it and the price comes back.


HOW IT WORKS

1. Enter your monthly take-home pay, how many hours a day and how many days a
   month you work.
2. Go shopping. Prices now read in hours, days and months.
3. Watch your mind change.

Your hourly rate is: take-home pay / (hours per day x days per month).
With $5,000 a month, 8 hours a day and 22 days a month, one hour of your work
is worth $28.41.


UNITS COME FROM YOUR SCHEDULE

"1 day" is one of your workdays and "1 month" is one full paycheck. Not
calendar time, but time spent working, so the number stays concrete. Prefer
calendar time? Turn on "1 day = 24 hours".


YOUR FIXED EXPENSES

Add rent, phone plan and subscriptions; a donut chart shows how many days of
your month go to each. Yearly payments are split into months automatically.
Instead of knowing that rent is 30% of your pay, you see that you work 6.6
days a month for it.


FOREIGN-CURRENCY PRICES

Turkish lira, US dollar, euro and British pound are supported. A price written
in one of them is first converted to your currency. Rates come daily from
European Central Bank data.


TESTED ON REAL PAGES (October 28, 2026)

We measured how many prices it converted and how long the scan took on
10 Turkish shopping sites and Google Shopping (Turkey), including LC Waikiki
(145 prices, 34 ms), Trendyol (143 prices, 33 ms), Hepsiburada (90 prices,
50 ms) and Amazon.com.tr (79 prices, 124 ms). The same day it was also tried
with US dollar prices on two US stores: IKEA US (40 prices) and Zappos
(283 prices).

The extension keeps no list of sites; it recognises how prices are written on
the page, so it also works on sites that aren't listed.


LANGUAGES

English and Turkish; it follows your browser's language.


PRIVACY

No server. No account. No analytics. Your pay and expenses stay in Chrome's
own settings storage; if Chrome sync is on, Chrome carries them to your other
devices through your own Google account, and nothing reaches us. The sites you
visit and the prices you see go nowhere. The only outgoing request is a daily
call that fetches the exchange-rate table (if the main source is unreachable,
the same table is requested from two backup sources).

The extension never runs on email, document or banking sites. You can also
turn it off for any site with one click from the panel.


FREE

No ads, no subscription, no "pro" version.
```

Sources: Turkish table `docs/qa/saha-testi-2026-10-28.json` (the full list of
11 is in the Turkish listing); US check `store/raw/README.md` › "Saha notu"
(headless Chrome, chip count on the page; scan time not measured there).
Example numbers: `$79.99 → 2.8 hours`, rent `$1,500 → 6.6 days`, `30%` —
all from `IVD.formatDuration` with 5,000 USD · 8 h · 22 days.

---

## Other fields

| Field | Value |
|---|---|
| Category | Shopping |
| Language | English (default, `default_locale: en`) |
| Privacy policy URL | `https://hamaratlabs.com/income-vs-desires/en/privacy`: **live** (2026-11-08 `curl` 200). TR page also live: `https://hamaratlabs.com/income-vs-desires/gizlilik` |
| Support URL | `https://hamaratlabs.com/income-vs-desires/en/support`: **live** (2026-11-08 `curl` 200) |
| Homepage | `https://hamaratlabs.com/income-vs-desires/`: **live** (2026-11-08 `curl` 200), Turkish only |

Note (not verified in the dashboard): the privacy-policy URL appears to be a
single field per item (Privacy tab), not per language; pick one (see
`store/README.md`, open questions).

## Images

- Store icon (128×128): `shared/store-icon-128-padded.png` (same for all languages).
- Screenshots (1280×800): `en/screenshots/` — empty; raw EN frames (English UI,
  IKEA US, 2560×1600) are in `store/raw/en/desktop/`. ImageArtist frames them.
- Small promo tile 440×280 and marquee 1400×560 are **not localizable**
  (one image for all languages): `shared/`.
