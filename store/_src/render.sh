#!/usr/bin/env bash
# Mağaza görsellerini tek komutla yeniden üretir (headless Chrome + Pillow).
#   bash store/_src/render.sh            # hepsi
#   bash store/_src/render.sh cws        # yalnız bir set: cws | mac | iphone | ipad | promo
# Kaynak: store/raw/ (gerçek ham kareler), şablon store/_src/screens/page.html + scenes.js.
# İkonlar ayrı: bash store/_src/icon/render-icons.sh
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
STORE="$(cd "$HERE/.." && pwd)"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
WORK="$(mktemp -d "${TMPDIR:-/tmp}/ivd-store.XXXXXX")"
ONLY="${1:-all}"

shot() { # url css-w css-h dsf çıktı
  local url="$1" w="$2" h="$3" dsf="$4" out="$5"
  mkdir -p "$(dirname "$out")"
  # headless Chrome ara sıra boş/eksik kare bırakıyor: 3 denemeye kadar tekrarla
  for attempt in 1 2 3; do
    "$CHROME" --headless=new --user-data-dir="$WORK/profile" --no-first-run --hide-scrollbars \
      --force-device-scale-factor="$dsf" --allow-file-access-from-files --window-size="$w,$h" \
      --virtual-time-budget=4000 --screenshot="$out" "$url" >/dev/null 2>&1 || true
    if python3 "$HERE/flatten.py" "$((w * dsf))x$((h * dsf))" "$out"; then return 0; fi
    echo "tekrar ($attempt): $out" >&2
  done
  return 1
}

SLUG_tr=(01-sayfada-sureler 02-oncesi-sonrasi 03-tikla-fiyat-geri 04-ayar-paneli 05-giderler-halka)
SLUG_en=(01-hours-on-page 02-before-after 03-click-for-price 04-settings-panel 05-expenses-donut)
SLUGT_tr=(01-sayfada-sureler 02-oncesi-sonrasi 03-dokun-fiyat-geri 04-ayar-paneli 05-giderler-halka)
SLUGT_en=(01-hours-on-page 02-before-after 03-tap-for-price 04-settings-panel 05-expenses-donut)

page() { echo "file://$HERE/screens/page.html?set=$1&lang=$2&i=$3"; }

run_set() { # set w h dsf hedef-kök
  local set="$1" w="$2" h="$3" dsf="$4"
  for lang in tr en; do
    for i in 1 2 3 4 5; do
      local slug
      if [[ "$set" == iphone || "$set" == ipad ]]; then
        eval "slug=\${SLUGT_$lang[$((i - 1))]}"
      else
        eval "slug=\${SLUG_$lang[$((i - 1))]}"
      fi
      case "$set" in
        cws) out="$STORE/chrome-web-store/$lang/screenshots/$slug.png" ;;
        *)   out="$STORE/app-store/$lang/$set/$slug.png" ;;
      esac
      shot "$(page "$set" "$lang" "$i")" "$w" "$h" "$dsf" "$out"
    done
  done
}

[[ "$ONLY" == all || "$ONLY" == cws ]]    && run_set cws 1280 800 1
[[ "$ONLY" == all || "$ONLY" == mac ]]    && run_set mac 1440 900 2
[[ "$ONLY" == all || "$ONLY" == iphone ]] && run_set iphone 402 874 3
[[ "$ONLY" == all || "$ONLY" == ipad ]]   && run_set ipad 1032 1376 2
if [[ "$ONLY" == all || "$ONLY" == promo ]]; then
  shot "file://$HERE/promo/promo-440x280.html" 440 280 1 "$STORE/chrome-web-store/shared/promo-small-440x280-dilsiz.png"
  shot "file://$HERE/promo/marquee-1400x560.html" 1400 560 1 "$STORE/chrome-web-store/shared/marquee-1400x560-dilsiz.png"
fi
echo "bitti ($WORK)"
