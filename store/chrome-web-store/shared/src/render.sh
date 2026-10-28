#!/usr/bin/env bash
# store/chrome-web-store/shared/src/*.html -> PNG (headless Chrome, bağımlılık yok).
#   store/chrome-web-store/shared/src/render.sh
# Ekran görüntüleri tr/screenshots/'a, tanıtım kareleri shared/'a yazılır.
# Çıktılar alfasız (24-bit) PNG'ye çevrilir: JPEG ara adımı alfa kanalını atar.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SHARED="$(cd "$HERE/.." && pwd)"
TR_SHOTS="$(cd "$HERE/../../tr/screenshots" && pwd)"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
PROFILE="$(mktemp -d "${TMPDIR:-/tmp}/ivd-render.XXXXXX")"

render() { # kaynak.html genişlik yükseklik çıktı.png (tam yol)
  local src="$1" w="$2" h="$3" out="$4" tmp="$PROFILE/shot.png"
  "$CHROME" --headless=new --user-data-dir="$PROFILE" --no-first-run --hide-scrollbars \
    --force-device-scale-factor=1 --allow-file-access-from-files --window-size="$w,$h" \
    --virtual-time-budget=3000 --screenshot="$tmp" "file://$HERE/$src" >/dev/null 2>&1
  # Alfa kanalını at: PNG -> JPEG (alfa yok) -> PNG (24-bit). Kalite 100.
  sips -s format jpeg -s formatOptions 100 "$tmp" --out "$PROFILE/flat.jpg" >/dev/null
  sips -s format png "$PROFILE/flat.jpg" --out "$out" >/dev/null
  echo "$out"
}

render screenshot-2-panel.html 1280 800 "$TR_SHOTS/screenshot-2-panel.png"
render screenshot-4-once-sonra.html 1280 800 "$TR_SHOTS/screenshot-4-once-sonra.png"
render promo-small-440x280.html 440 280 "$SHARED/promo-small-440x280.png"
render marquee-1400x560.html 1400 560 "$SHARED/marquee-1400x560.png"
