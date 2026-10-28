#!/usr/bin/env bash
# İkon seti: SVG (icons.mjs) → headless Chrome 1024 PNG → Pillow ile boyutlar.
#   bash store/_src/icon/render-icons.sh
# Yazdığı yerler: safari/.../AppIcon.appiconset/, src/icons/, store/chrome-web-store/shared/
# store-icon-128-padded.png, store/app-store/shared/AppIcon.icns, store/shared/ikon-onizleme.png
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../../.." && pwd)"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
WORK="$(mktemp -d "${TMPDIR:-/tmp}/ivd-icon.XXXXXX")"
node "$HERE/icons.mjs" "$WORK/svg" >/dev/null
mkdir -p "$WORK/png"
for svg in "$WORK"/svg/*.svg; do
  name="$(basename "$svg" .svg)"
  # SVG'yi 1024×1024 HTML sayfasına göm; saydam zemin.
  printf '<!doctype html><html><head><style>html,body{margin:0;background:transparent}img{display:block;width:1024px;height:1024px}</style></head><body><img src="%s"></body></html>' \
    "file://$svg" > "$WORK/$name.html"
  "$CHROME" --headless=new --user-data-dir="$WORK/profile" --no-first-run --hide-scrollbars \
    --force-device-scale-factor=1 --allow-file-access-from-files --window-size=1024,1024 \
    --default-background-color=00000000 --virtual-time-budget=2000 \
    --screenshot="$WORK/png/$name.png" "file://$WORK/$name.html" >/dev/null 2>&1
done
python3 "$HERE/icons_post.py" "$WORK/png" "$ROOT"
echo "ara dosyalar: $WORK"
