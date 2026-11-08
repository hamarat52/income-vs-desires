#!/bin/bash
# Income vs Desires Safari: Apple imza ve App Store Connect yükleme hattı (macOS + iOS).
#
#   bash safari/apple_yayin.sh kontrol            Derlemesiz ön kontrol: sürüm, yapı numarası,
#                                                 bundle ID, takım, Xcode hesabı, sertifikalar.
#   bash safari/apple_yayin.sh arsiv  [P]         Release arşivi (Apple Development imzalı) + doğrulama.
#   bash safari/apple_yayin.sh dogrula [P]        Var olan arşivi doğrular (imza, takım, sandbox, içerik).
#   bash safari/apple_yayin.sh kuru   [P]         Arşivden App Store paketini YEREL diske çıkarır ve
#                                                 doğrular (.ipa / .pkg). Hiçbir şey yüklemez.
#   bash safari/apple_yayin.sh dagitim            Hesap ve sertifikalar gelince TEK komut:
#                                                 kontrol + arsiv + kuru (iki platform). Yükleme YOK.
#   IVD_YUKLE_ONAY=evet bash safari/apple_yayin.sh yukle [P]
#                                                 App Store Connect'e yükler. Yalnız Yusuf onayıyla.
#
#   P: macos | ios | hepsi (varsayılan hepsi)
#
# Kurallar: herkese açık yayına kadar sürüm < 1.0; yüklenen yapı numarası yanar
# (safari/yuklenen-yapilar.txt, platform başına); bundle ID ilk yüklemeyle kalıcıdır.
# Sır, parola, sertifika dosyası bu betikte ve depoda yok: imza Xcode hesabı + anahtarlıktan gelir.
# Derleme çıktıları safari/IncomeVsDesires/build/ altında (.gitignore: safari/**/build/).
set -euo pipefail
cd "$(dirname "$0")"

# ---- Tek yer: kimlik ve yollar -------------------------------------------------------
TEAM=28TVDBBT3G
BUNDLE=com.hamarat52.IncomeVsDesires          # bundle ID değişirse yalnız bu satır (+ pbxproj)
BUNDLE_EXT=$BUNDLE.Extension
APP_ADI=IncomeVsDesires
EXT_ADI="IncomeVsDesires Extension"
PROJ_DIZIN=IncomeVsDesires
PROJ=$PROJ_DIZIN/IncomeVsDesires.xcodeproj
PBX=$PROJ/project.pbxproj
MANIFEST=../manifest.json
BUILD=$PROJ_DIZIN/build
KURU_PLIST=ExportOptions-appstore.plist            # destination export (yerel)
YUKLE_PLIST=ExportOptions-appstore-upload.plist    # destination upload (ASC)
KAYIT=yuklenen-yapilar.txt
KILIT=$HOME/.hermes/cache/agir-is.lock
YUK_SINIR=${IVD_YUK_SINIR:-25}
DAMGA=$(date +%Y%m%d-%H%M%S)

hata=0
ok()   { printf '  [tamam] %s\n' "$*"; }
uyar() { printf '  [uyari] %s\n' "$*"; }
kotu() { printf '  [ENGEL] %s\n' "$*"; hata=1; }
pb()   { /usr/libexec/PlistBuddy -c "Print :$1" "$2" 2>/dev/null || true; }

sema()  { case $1 in macos) echo "IncomeVsDesires (macOS)";; ios) echo "IncomeVsDesires (iOS)";; esac; }
hedef() { case $1 in macos) echo "generic/platform=macOS";; ios) echo "generic/platform=iOS";; esac; }
arsiv_yolu() { case $1 in macos) echo "$BUILD/IVD-macOS.xcarchive";; ios) echo "$BUILD/IVD-iOS.xcarchive";; esac; }
platformlar() {
  case "${1:-hepsi}" in
    macos|ios) echo "$1" ;;
    hepsi) echo "macos ios" ;;
    *) echo "Bilinmeyen platform: $1 (macos | ios | hepsi)" >&2; exit 2 ;;
  esac
}
gecici() { mkdir -p "$BUILD/tmp"; mktemp -d "$BUILD/tmp/$1.XXXXXX"; }

# ---- pbxproj okuma ----------------------------------------------------------------------
# Hedef build config satırları: ad|sdk|bundle|marketing|yapi|takim|sandbox
configler() {
  awk '
    function val(s) { sub(/^[^=]*= */, "", s); sub(/;[ \t]*$/, "", s); gsub(/"/, "", s); return s }
    /isa = XCBuildConfiguration;/ { inb=1; b=mv=cpv=tm=sb=sdk=""; next }
    inb && /PRODUCT_BUNDLE_IDENTIFIER = / { b=val($0) }
    inb && /MARKETING_VERSION = /         { mv=val($0) }
    inb && /CURRENT_PROJECT_VERSION = /   { cpv=val($0) }
    inb && /DEVELOPMENT_TEAM = /          { tm=val($0) }
    inb && /ENABLE_APP_SANDBOX = /        { sb=val($0) }
    inb && /SDKROOT = /                   { sdk=val($0) }
    inb && /^[ \t]*name = /               { if (b != "") print val($0) "|" sdk "|" b "|" mv "|" cpv "|" tm "|" sb; inb=0 }
  ' "$PBX"
}
surum_oku() {
  SURUM=$(configler | cut -d'|' -f4 | sort -u | head -1)
  YAPI=$(configler | cut -d'|' -f5 | sort -u | head -1)
}
son_yuklenen() {  # $1 platform -> yanmış en büyük yapı numarası (yoksa 0)
  [ -f "$KAYIT" ] || { echo 0; return; }
  local s; s=$(grep -Ev '^[[:space:]]*(#|$)' "$KAYIT" | awk -v p="$1" '$1==p {print $3}' | sort -n | tail -1)
  echo "${s:-0}"
}

# ---- kontrol -------------------------------------------------------------------------
kontrol() {
  hata=0
  echo "== Income vs Desires Apple ön kontrol ($(date '+%F %T'))"
  local satirlar n mvs cpvs
  satirlar=$(configler); n=$(echo "$satirlar" | grep -c . || true)
  mvs=$(echo "$satirlar" | cut -d'|' -f4 | sort -u | tr '\n' ' ' | sed 's/ $//')
  cpvs=$(echo "$satirlar" | cut -d'|' -f5 | sort -u | tr '\n' ' ' | sed 's/ $//')
  surum_oku
  local ana=${SURUM%%.*}
  if [ "$n" -ne 8 ]; then kotu "hedef build config sayısı $n (beklenen 8)"
  elif [ "$mvs" != "$SURUM" ] || [ "$cpvs" != "$YAPI" ]; then kotu "8 config'te sürüm/yapı farklı: MARKETING_VERSION '$mvs', CURRENT_PROJECT_VERSION '$cpvs'"
  elif ! [ "$ana" -lt 1 ] 2>/dev/null; then kotu "sürüm $SURUM: herkese açık yayın onayı olmadan 1.0 ve üstü yüklenmez"
  else ok "sürüm $SURUM ($YAPI), 8 build config'te aynı ve < 1.0"; fi

  local mf; mf=$(plutil -extract version raw -o - "$MANIFEST" 2>/dev/null || echo '?')
  [ "$mf" = "$SURUM" ] && ok "manifest.json version $mf = MARKETING_VERSION" || kotu "manifest.json version '$mf' != MARKETING_VERSION '$SURUM'"

  local p son yanik=""
  for p in macos ios; do
    son=$(son_yuklenen $p)
    if [ "$YAPI" -le "$son" ] 2>/dev/null; then yanik="$yanik $p(son $son)"; fi
  done
  if ! [[ "$YAPI" =~ ^[0-9]+$ ]]; then kotu "yapı numarası '$YAPI' tam sayı değil"
  elif [ -n "$yanik" ]; then kotu "yapı numarası $YAPI yanmış:$yanik ($KAYIT). Artır: CURRENT_PROJECT_VERSION"
  else ok "yapı numarası $YAPI, yanmış listede en büyük: macos $(son_yuklenen macos), ios $(son_yuklenen ios) ($KAYIT)"; fi

  local app ext digr
  app=$(echo "$satirlar" | awk -F'|' -v b="$BUNDLE" '$3==b' | grep -c . || true)
  ext=$(echo "$satirlar" | awk -F'|' -v b="$BUNDLE_EXT" '$3==b' | grep -c . || true)
  digr=$(echo "$satirlar" | awk -F'|' -v a="$BUNDLE" -v e="$BUNDLE_EXT" '$3!=a && $3!=e {print $3}' | sort -u | tr '\n' ' ')
  if [ "$app" -eq 4 ] && [ "$ext" -eq 4 ] && [ -z "$digr" ]; then ok "bundle ID: app $BUNDLE (4 config), uzantı $BUNDLE_EXT (4 config)"
  else kotu "bundle ID uyuşmuyor: app $app/4, uzantı $ext/4, başka: '${digr}' (beklenen $BUNDLE / $BUNDLE_EXT)"; fi

  local tmok; tmok=$(echo "$satirlar" | awk -F'|' -v t="$TEAM" '$6==t' | grep -c . || true)
  [ "$tmok" -eq 8 ] && ok "DEVELOPMENT_TEAM $TEAM (8/8 config)" || kotu "DEVELOPMENT_TEAM $TEAM yalnız $tmok/8 config'te"

  local mac sbok
  mac=$(echo "$satirlar" | awk -F'|' '$2=="macosx"' | grep -c . || true)
  sbok=$(echo "$satirlar" | awk -F'|' '$2=="macosx" && $7=="YES"' | grep -c . || true)
  [ "$mac" -eq 4 ] && [ "$sbok" -eq 4 ] && ok "macOS ENABLE_APP_SANDBOX YES (4/4 config)" || kotu "macOS sandbox: $sbok/$mac config"

  local hesap=0
  if defaults read com.apple.dt.Xcode DVTDeveloperAccountManagerAppleIDLists 2>/dev/null | grep -q identifier; then
    hesap=1; ok "Xcode'da Apple hesabı ekli"
  else
    kotu "Xcode'da Apple hesabı YOK (Xcode > Settings > Accounts boş). Dağıtım profili, export ve yükleme hesapla yapılır"
  fi

  local imza tum
  imza=$(security find-identity -v -p codesigning 2>/dev/null || true)
  tum=$(security find-identity -v 2>/dev/null || true)
  if echo "$imza" | grep -q '"Apple Development:'; then ok "Apple Development sertifikası anahtarlıkta"; else kotu "Apple Development sertifikası yok (arşiv imzası)"; fi
  local bulut=0; [ "$hesap" -eq 1 ] && [ "${IVD_BULUT_IMZA:-}" = evet ] && bulut=1
  if echo "$imza" | grep -Eq "\"Apple Distribution: .*\($TEAM\)\""; then ok "Apple Distribution ($TEAM) sertifikası anahtarlıkta"
  elif [ $bulut -eq 1 ]; then uyar "Apple Distribution anahtarlıkta yok; IVD_BULUT_IMZA=evet: Xcode bulut imzası denenecek (kuru doğrulaması yine Apple Distribution ister)"
  else kotu "Apple Distribution ($TEAM) sertifikası YOK (iOS + macOS App Store imzası)"; fi
  if echo "$tum" | grep -Eq "\"(3rd Party Mac Developer Installer|Mac Installer Distribution): .*\($TEAM\)\""; then ok "Mac Installer Distribution ($TEAM) sertifikası anahtarlıkta"
  elif [ $bulut -eq 1 ]; then uyar "Mac Installer Distribution anahtarlıkta yok; IVD_BULUT_IMZA=evet: Xcode bulut imzası denenecek"
  else kotu "Mac Installer Distribution ($TEAM) sertifikası YOK (macOS .pkg imzası)"; fi

  for p in macos ios; do
    local a; a=$(arsiv_yolu $p)
    if [ -d "$a" ]; then
      local av ay; av=$(pb ApplicationProperties:CFBundleShortVersionString "$a/Info.plist"); ay=$(pb ApplicationProperties:CFBundleVersion "$a/Info.plist")
      [ "$av ($ay)" = "$SURUM ($YAPI)" ] && ok "$p arşivi hazır: $av ($ay)" || uyar "$p arşivi eski: $av ($ay), proje $SURUM ($YAPI). Önce: arsiv $p"
    else uyar "$p arşivi yok. Önce: bash safari/apple_yayin.sh arsiv $p"; fi
  done
  [ $hata -eq 0 ] && echo "== ön kontrol: GEÇTİ" || echo "== ön kontrol: ENGEL VAR"
  return $hata
}

# ---- arşiv ---------------------------------------------------------------------------
yuk_bekle() {
  while :; do
    local y; y=$(sysctl -n vm.loadavg | awk '{print int($2)}')
    [ "$y" -lt "$YUK_SINIR" ] && { echo "  makine yükü $y (sınır $YUK_SINIR): başlıyor"; return 0; }
    echo "  makine yükü $y (sınır $YUK_SINIR): 60 sn bekleniyor ($(date +%T))"; sleep 60
  done
}

arsiv_al() {  # $1 platform
  local p=$1 a; a=$(arsiv_yolu "$p")
  surum_oku
  local son; son=$(son_yuklenen "$p")
  [ "$YAPI" -gt "$son" ] || { echo "== $p: yapı $YAPI yanmış (son $son); arşiv alınmaz"; return 2; }
  yuk_bekle
  mkdir -p "$(dirname "$KILIT")" "$BUILD"
  local log=$BUILD/arsiv-$p.log
  echo "== $p arşivi ($SURUM ($YAPI), $(sema "$p"), $(hedef "$p")) ağır iş kilidiyle: $(date '+%F %T')"
  set +e
  lockf "$KILIT" xcodebuild -project "$PROJ" -scheme "$(sema "$p")" -configuration Release \
    -destination "$(hedef "$p")" -archivePath "$a" -derivedDataPath "$BUILD/dd-arsiv-$p" \
    -allowProvisioningUpdates archive > "$log" 2>&1
  local rc=$?
  set -e
  grep -E '(error|warning): |\*\* ARCHIVE' "$log" | sort -u | tail -20 || true
  [ $rc -eq 0 ] || { echo "== $p arşivi BAŞARISIZ (rc=$rc, $log)"; return 1; }
  echo "== $p arşivi bitti: $(date '+%F %T') -> $a"
}

uygulama_yolu() { echo "$(arsiv_yolu "$1")/Products/Applications/$APP_ADI.app"; }
uzanti_yolu() { case $1 in macos) echo "$2/Contents/PlugIns/$EXT_ADI.appex";; ios) echo "$2/PlugIns/$EXT_ADI.appex";; esac; }
uzanti_kaynak() { case $1 in macos) echo "$2/Contents/Resources";; ios) echo "$2";; esac; }
info_plist() { case $1 in macos) echo "$2/Contents/Info.plist";; ios) echo "$2/Info.plist";; esac; }

imza_bilgi() {  # $1 paket -> "Authority|TeamIdentifier"
  local d; d=$(codesign -dv --verbose=4 "$1" 2>&1 || true)
  echo "$(echo "$d" | grep -E '^Authority=' | head -1 | cut -d= -f2-)|$(echo "$d" | grep -E '^TeamIdentifier=' | cut -d= -f2-)"
}
sandbox_bak() {  # $1 paket -> true/false/yok
  local t; t=$(gecici ent); codesign -d --entitlements - --xml "$1" > "$t/e.plist" 2>/dev/null || true
  local v; v=$(pb com.apple.security.app-sandbox "$t/e.plist"); echo "${v:-yok}"
}
icerik_bak() {  # $1 platform $2 appex -> uzantı kaynak denetimi
  local r; r=$(uzanti_kaynak "$1" "$2")
  local liste; liste=$(ls -1 "$r" | tr '\n' ' ')
  local yasak; yasak=$(ls -1 "$r" | grep -Ex 'test|site|store|safari|docs|node_modules|package(-lock)?\.json|.*\.md' | tr '\n' ' ' || true)
  [ -f "$r/manifest.json" ] && [ -d "$r/src" ] || { kotu "uzantıda manifest.json/src yok: $liste"; return; }
  [ -z "$yasak" ] && ok "uzantı kaynakları: $liste(test/site/store/safari yok)" || kotu "uzantıda yasak içerik: $yasak"
  if cmp -s "$r/manifest.json" "$MANIFEST" && diff -rq -x .DS_Store "$r/src" ../src >/dev/null; then ok "uzantıdaki manifest.json ve src/ repo ile birebir"
  else kotu "uzantıdaki manifest/src repodan farklı"; fi
}

dogrula_bir() {  # $1 platform: arşiv doğrulama (Apple Development)
  local p=$1 a app ext; a=$(arsiv_yolu "$p"); app=$(uygulama_yolu "$p"); ext=$(uzanti_yolu "$p" "$app")
  echo "== $p arşiv doğrulama: $a"
  [ -d "$app" ] || { kotu "arşivde $APP_ADI.app yok"; return; }
  codesign --verify --deep --strict "$app" 2>&1 && ok "codesign --verify --deep --strict geçti" || kotu "codesign --verify --deep --strict başarısız"
  local x i
  for x in "$app" "$ext"; do
    [ -d "$x" ] || { kotu "yok: $x"; continue; }
    i=$(imza_bilgi "$x")
    [ "${i#*|}" = "$TEAM" ] && ok "$(basename "$x"): TeamIdentifier $TEAM, imza ${i%%|*}" || kotu "$(basename "$x"): TeamIdentifier '${i#*|}' (beklenen $TEAM), imza ${i%%|*}"
  done
  [ -d "$ext" ] && ok "uzantı app içinde gömülü: ${ext#"$app"/}" || kotu "uzantı .appex app içinde yok"
  if [ "$p" = macos ]; then
    for x in "$app" "$ext"; do
      local s; s=$(sandbox_bak "$x")
      [ "$s" = true ] && ok "$(basename "$x"): com.apple.security.app-sandbox = true" || kotu "$(basename "$x"): app-sandbox = $s"
    done
  fi
  local av ay ab eb ev ey
  av=$(pb ApplicationProperties:CFBundleShortVersionString "$a/Info.plist"); ay=$(pb ApplicationProperties:CFBundleVersion "$a/Info.plist")
  ab=$(pb CFBundleIdentifier "$(info_plist "$p" "$app")"); eb=$(pb CFBundleIdentifier "$(info_plist "$p" "$ext")")
  ev=$(pb CFBundleShortVersionString "$(info_plist "$p" "$ext")"); ey=$(pb CFBundleVersion "$(info_plist "$p" "$ext")")
  surum_oku
  [ "$av ($ay)" = "$SURUM ($YAPI)" ] && [ "$ev ($ey)" = "$SURUM ($YAPI)" ] && ok "arşiv sürümü $av ($ay), uzantı $ev ($ey)" || kotu "arşiv sürümü $av ($ay) / uzantı $ev ($ey), proje $SURUM ($YAPI)"
  [ "$ab" = "$BUNDLE" ] && [ "$eb" = "$BUNDLE_EXT" ] && ok "bundle: $ab / $eb" || kotu "bundle: $ab / $eb"
  [ -d "$ext" ] && icerik_bak "$p" "$ext"
}

# ---- kuru export ve paket doğrulama ------------------------------------------------------
profil_bak() {  # $1 profil dosyası $2 etiket -> App Store tipi mi
  [ -f "$1" ] || { kotu "$2: gömülü profil yok ($1)"; return; }
  local t; t=$(gecici pp); security cms -D -i "$1" > "$t/pp.plist" 2>/dev/null
  local ad gta cihaz tum
  ad=$(pb Name "$t/pp.plist"); gta=$(pb Entitlements:get-task-allow "$t/pp.plist")
  cihaz=$(/usr/libexec/PlistBuddy -c 'Print :ProvisionedDevices' "$t/pp.plist" >/dev/null 2>&1 && echo var || echo yok)
  tum=$(pb ProvisionsAllDevices "$t/pp.plist")
  if [ "$gta" != true ] && [ "$cihaz" = yok ] && [ "$tum" != true ]; then ok "$2 profili App Store tipi: $ad (get-task-allow=${gta:-yok}, cihaz listesi yok)"
  else kotu "$2 profili App Store tipi değil: $ad (get-task-allow=$gta, cihaz=$cihaz)"; fi
}
dagitim_imza() {  # $1 paket $2 etiket
  local i; i=$(imza_bilgi "$1")
  case "${i%%|*}" in "Apple Distribution:"*) ok "$2 imza: ${i%%|*}";; *) kotu "$2 imza Apple Distribution değil: ${i%%|*}";; esac
  [ "${i#*|}" = "$TEAM" ] || kotu "$2 TeamIdentifier '${i#*|}'"
}
paket_dogrula() {  # $1 platform $2 export dizini
  local p=$1 d=$2 t app ext
  if [ "$p" = ios ]; then
    local ipa; ipa=$(ls "$d"/*.ipa 2>/dev/null | head -1)
    [ -n "$ipa" ] || { kotu "export dizininde .ipa yok"; return; }
    echo "== ios paket doğrulama: $ipa ($(du -h "$ipa" | cut -f1))"
    t=$(gecici ipa); unzip -q "$ipa" -d "$t"; app=$(ls -d "$t"/Payload/*.app | head -1)
    ext=$(uzanti_yolu ios "$app")
    codesign --verify --deep --strict "$app" && ok "codesign --verify --deep --strict geçti" || kotu "codesign doğrulaması başarısız"
    dagitim_imza "$app" app; dagitim_imza "$ext" uzantı
    profil_bak "$app/embedded.mobileprovision" app; profil_bak "$ext/embedded.mobileprovision" uzantı
  else
    local pkg; pkg=$(ls "$d"/*.pkg 2>/dev/null | head -1)
    [ -n "$pkg" ] || { kotu "export dizininde .pkg yok"; return; }
    echo "== macos paket doğrulama: $pkg ($(du -h "$pkg" | cut -f1))"
    local s; s=$(pkgutil --check-signature "$pkg" 2>&1 || true)
    echo "$s" | sed -n '1,6p' | sed 's/^/    /'
    if echo "$s" | grep -q 'signed by a developer certificate issued by Apple' || echo "$s" | grep -Eq '(3rd Party Mac Developer Installer|Mac Installer Distribution): .*\('"$TEAM"'\)'; then
      echo "$s" | grep -Eq '(3rd Party Mac Developer Installer|Mac Installer Distribution): .*\('"$TEAM"'\)' && ok ".pkg Mac Installer Distribution ($TEAM) ile imzalı" || kotu ".pkg imzası Mac Installer Distribution değil"
    else kotu ".pkg imzasız ya da geçersiz"; fi
    t=$(gecici pkg); pkgutil --expand-full "$pkg" "$t/x" >/dev/null
    app=$(find "$t/x" -maxdepth 5 -type d -name "$APP_ADI.app" | head -1)
    [ -n "$app" ] || { kotu ".pkg içinde $APP_ADI.app yok"; return; }
    ext=$(uzanti_yolu macos "$app")
    codesign --verify --deep --strict "$app" && ok "codesign --verify --deep --strict geçti" || kotu "codesign doğrulaması başarısız"
    dagitim_imza "$app" app; dagitim_imza "$ext" uzantı
    profil_bak "$app/Contents/embedded.provisionprofile" app
    # macOS'ta profil yalnız ana bundle için zorunlu (ITMS-90889). İç içe bundle profilsizse
    # imzasında application-identifier olmamalı (ITMS-90885). Kaynak: developer.apple.com/forums/thread/733942
    if [ -f "$ext/Contents/embedded.provisionprofile" ]; then profil_bak "$ext/Contents/embedded.provisionprofile" uzantı
    else
      local et; et=$(gecici ent); codesign -d --entitlements - --xml "$ext" > "$et/e.plist" 2>/dev/null || true
      local aid; aid=$(pb com.apple.application-identifier "$et/e.plist")
      [ -z "$aid" ] && uyar "uzantı profilsiz, imzada application-identifier yok: macOS'ta TestFlight için geçerli (profil yalnız ana bundle'da zorunlu)" \
        || kotu "uzantı profilsiz ama imzada application-identifier '$aid' var (ITMS-90885)"
    fi
    local x; for x in "$app" "$ext"; do [ "$(sandbox_bak "$x")" = true ] && ok "$(basename "$x"): app-sandbox = true" || kotu "$(basename "$x"): app-sandbox yok"; done
  fi
  local b v y; b=$(pb CFBundleIdentifier "$(info_plist "$p" "$app")"); v=$(pb CFBundleShortVersionString "$(info_plist "$p" "$app")"); y=$(pb CFBundleVersion "$(info_plist "$p" "$app")")
  surum_oku
  [ "$b" = "$BUNDLE" ] && [ "$v ($y)" = "$SURUM ($YAPI)" ] && ok "paket: $b $v ($y)" || kotu "paket: $b $v ($y), beklenen $BUNDLE $SURUM ($YAPI)"
}

export_al() {  # $1 platform $2 plist $3 dizin $4 etiket
  local p=$1 a log; a=$(arsiv_yolu "$p"); log=$BUILD/$4-$p-$DAMGA.log
  [ -d "$a" ] || { echo "== $p: arşiv yok, önce: bash safari/apple_yayin.sh arsiv $p"; return 2; }
  echo "== $p $4 export ($2 -> $3): $(date '+%F %T')"
  set +e
  lockf "$KILIT" xcodebuild -exportArchive -archivePath "$a" -exportOptionsPlist "$2" \
    -exportPath "$3" -allowProvisioningUpdates > "$log" 2>&1
  local rc=$?
  set -e
  grep -E 'error|Error|EXPORT|UPLOAD|warning: ' "$log" | tail -20 | sed 's/^/    /' || true
  [ $rc -eq 0 ] || { echo "== $p $4 export BAŞARISIZ (rc=$rc, $log)"; return 1; }
}

kuru_bir() {  # $1 platform
  local p=$1 d=$BUILD/export-$1-$DAMGA
  echo "== $p kuru çalıştırma (YÜKLEME YOK)"
  export_al "$p" "$KURU_PLIST" "$d" kuru || return 1
  hata=0; paket_dogrula "$p" "$d"
  [ $hata -eq 0 ] && echo "== $p kuru: GEÇTİ ($d, yüklenmedi)" || { echo "== $p kuru: ENGEL VAR"; return 1; }
}

# ---- yükleme -------------------------------------------------------------------------
yukle() {
  [ "${IVD_YUKLE_ONAY:-}" = evet ] || {
    echo "Yükleme Yusuf onayı ister; hiçbir şey yapılmadı."
    echo "  IVD_YUKLE_ONAY=evet bash safari/apple_yayin.sh yukle [macos|ios|hepsi]"
    exit 3; }
  kontrol || { echo "Ön kontrolde engel var; yükleme yapılmadı."; exit 1; }
  surum_oku
  local p rc=0
  for p in $(platformlar "${1:-hepsi}"); do
    local son; son=$(son_yuklenen "$p")
    [ "$YAPI" -gt "$son" ] || { echo "== $p: yapı $YAPI yanmış (son $son); atlandı"; rc=1; continue; }
    hata=0; dogrula_bir "$p"; [ $hata -eq 0 ] || { echo "== $p: arşiv doğrulaması geçmedi; yüklenmedi"; rc=1; continue; }
    kuru_bir "$p" || { echo "== $p: kuru paket doğrulaması geçmedi; yüklenmedi"; rc=1; continue; }
    if export_al "$p" "$YUKLE_PLIST" "$BUILD/yukleme-$p-$DAMGA" yukleme; then
      echo "$p $SURUM $YAPI $(date +%F) xcodebuild-upload" >> "$KAYIT"
      echo "== $p yüklendi: $SURUM ($YAPI) artık yanmış ($KAYIT güncellendi, commit edilmeli)"
    else rc=1; fi
  done
  exit $rc
}

# ---- giriş ---------------------------------------------------------------------------
komut=${1:-kontrol}; shift || true
case "$komut" in
  kontrol) kontrol ;;
  arsiv)
    kontrol || echo "Ön kontrolde engel var; arşiv Apple Development ile yine alınır, ama yüklenemez."
    rc=0; for p in $(platformlar "${1:-hepsi}"); do
      if arsiv_al "$p"; then hata=0; dogrula_bir "$p"; [ $hata -eq 0 ] && echo "== $p arşiv doğrulama: GEÇTİ" || { echo "== $p arşiv doğrulama: ENGEL VAR"; rc=1; }
      else rc=1; fi
    done; exit $rc ;;
  dogrula)
    rc=0; for p in $(platformlar "${1:-hepsi}"); do
      hata=0; dogrula_bir "$p"; [ $hata -eq 0 ] && echo "== $p arşiv doğrulama: GEÇTİ" || { echo "== $p arşiv doğrulama: ENGEL VAR"; rc=1; }
    done; exit $rc ;;
  kuru)
    rc=0; for p in $(platformlar "${1:-hepsi}"); do kuru_bir "$p" || rc=1; done; exit $rc ;;
  dagitim)
    kontrol || { echo "== dagitim durdu: ön kontrolde engel var (hesap/sertifika). Arşiv ve export yapılmadı."; exit 1; }
    rc=0; for p in macos ios; do
      if arsiv_al "$p"; then
        hata=0; dogrula_bir "$p"
        if [ $hata -eq 0 ]; then kuru_bir "$p" || rc=1; else echo "== $p arşiv doğrulama: ENGEL VAR"; rc=1; fi
      else rc=1; fi
    done
    [ $rc -eq 0 ] && echo "== dagitim: GEÇTİ. İki paket yüklemeye hazır (yüklenmedi). Yükleme: IVD_YUKLE_ONAY=evet bash safari/apple_yayin.sh yukle" || echo "== dagitim: ENGEL VAR"
    exit $rc ;;
  yukle) yukle "${1:-hepsi}" ;;
  *) sed -n '2,20p' "$0"; exit 2 ;;
esac
