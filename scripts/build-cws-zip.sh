#!/usr/bin/env bash
# Chrome Web Store paketi: yalnız manifest.json + src/ (bağımlılık yok).
#
#   scripts/build-cws-zip.sh
#   -> dist/income-vs-desires-chrome-<manifest version>.zip
#
# test/, site/, safari/, docs/, store-assets/ pakete GİRMEZ. macOS çöpü
# (.DS_Store, ._*, __MACOSX) dışlanır. Zip deterministik sırayla kurulur.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

[ -f manifest.json ] || { echo "manifest.json yok" >&2; exit 1; }
[ -d src ] || { echo "src/ yok" >&2; exit 1; }

# Sürümü manifest'ten oku (jq/node bağımlılığı yok).
VERSION="$(sed -n 's/^[[:space:]]*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' manifest.json | head -1)"
[ -n "$VERSION" ] || { echo "manifest.json içinde version bulunamadı" >&2; exit 1; }

OUT_DIR="$ROOT/dist"
ZIP="$OUT_DIR/income-vs-desires-chrome-$VERSION.zip"
mkdir -p "$OUT_DIR"
rm -f "$ZIP"

# Dosya listesi: manifest + src altındaki düz dosyalar, çöp hariç, sıralı.
LIST="$(mktemp "${TMPDIR:-/tmp}/ivd-cws.XXXXXX")"
trap 'rm -f "$LIST"' EXIT
{
  echo manifest.json
  find src -type f \
    ! -name '.DS_Store' ! -name '._*' ! -name '*.swp' ! -name '*~' \
    ! -path '*/__MACOSX/*' | LC_ALL=C sort
} > "$LIST"

# -X: uid/gid/zaman damgası gibi ek alanları yazma; -D: dizin girdisi ekleme.
zip -q -X -D "$ZIP" -@ < "$LIST"

echo "$ZIP"
echo "$(wc -l < "$LIST" | tr -d ' ') dosya, $(wc -c < "$ZIP" | tr -d ' ') bayt"
