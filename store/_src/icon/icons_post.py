"""İkon seti son işlem: 1024 PNG'lerden tüm boyutlar, alfasız App Store ikonu,
macOS .icns, Chrome ikonları ve açık/koyu zemin önizlemesi.

    python3 icons_post.py <1024-png-klasörü> <repo-kökü>

Pillow gerekir. Küçültme: premultiplied alfa (RGBa) + LANCZOS.
"""
import json
import os
import subprocess
import sys
import tempfile
from io import BytesIO

from PIL import Image, ImageDraw, ImageFont

SRC, ROOT = sys.argv[1], sys.argv[2]
APPICON = os.path.join(ROOT, "safari/IncomeVsDesires/Shared (App)/Assets.xcassets/AppIcon.appiconset")
CHROME_ICONS = os.path.join(ROOT, "src/icons")
CWS_SHARED = os.path.join(ROOT, "store/chrome-web-store/shared")
AS_SHARED = os.path.join(ROOT, "store/app-store/shared")
STORE_SHARED = os.path.join(ROOT, "store/shared")
os.makedirs(STORE_SHARED, exist_ok=True)


def master(name):
    return Image.open(os.path.join(SRC, f"{name}.png")).convert("RGBA")


def down(im, px):
    if im.size == (px, px):
        return im.copy()
    return im.convert("RGBa").resize((px, px), Image.LANCZOS).convert("RGBA")


def save_rgba(im, path):
    im.save(path, optimize=True)
    print(path)


def save_rgb(im, path):
    # App Store: alfa kanalı YOK. Zemin zaten opak; yine de siyah üstüne bindir.
    bg = Image.new("RGB", im.size, (0, 0, 0))
    bg.paste(im, mask=im.split()[3])
    bg.save(path, optimize=True)
    print(path)


old = {}
for p in ["src/icons/icon-16.png", "src/icons/icon-32.png", "src/icons/icon-48.png"]:
    try:
        raw = subprocess.run(["git", "-C", ROOT, "show", f"HEAD:{p}"], capture_output=True, check=True).stdout
        old[os.path.basename(p)] = Image.open(BytesIO(raw)).convert("RGBA")
    except subprocess.CalledProcessError:
        pass

m = {n: master(n) for n in ["ios-light", "ios-dark", "ios-tinted", "mac", "mac-small",
                            "chrome", "chrome-small", "chrome-store"]}

# --- iOS / App Store 1024 (alfasız) + koyu/tonlu görünüm ---------------------
save_rgb(m["ios-light"], os.path.join(APPICON, "universal-icon-1024@1x.png"))
save_rgb(m["ios-dark"], os.path.join(APPICON, "universal-icon-1024-dark@1x.png"))
save_rgb(m["ios-tinted"], os.path.join(APPICON, "universal-icon-1024-tinted@1x.png"))

# --- macOS appiconset (saydam köşe; ≤32 px sadeleştirilmiş glyph) -------------
mac_files = {}
for pt in [16, 32, 128, 256, 512]:
    for sc in [1, 2]:
        px = pt * sc
        src = m["mac-small"] if px <= 32 else m["mac"]
        fn = f"mac-icon-{pt}@{sc}x.png"
        save_rgba(down(src, px), os.path.join(APPICON, fn))
        mac_files[(pt, sc)] = fn

contents_path = os.path.join(APPICON, "Contents.json")
contents = json.load(open(contents_path))
for img in contents["images"]:
    app = img.get("appearances")
    if img.get("platform") == "ios" and app:
        val = app[0]["value"]
        img["filename"] = f"universal-icon-1024-{val}@1x.png"
with open(contents_path, "w") as f:
    json.dump(contents, f, indent=2, ensure_ascii=False)
    f.write("\n")
print(contents_path)

# --- macOS .icns (iconutil) ----------------------------------------------------
with tempfile.TemporaryDirectory() as td:
    iconset = os.path.join(td, "AppIcon.iconset")
    os.makedirs(iconset)
    for (pt, sc), fn in mac_files.items():
        suffix = "" if sc == 1 else "@2x"
        Image.open(os.path.join(APPICON, fn)).save(os.path.join(iconset, f"icon_{pt}x{pt}{suffix}.png"))
    icns = os.path.join(AS_SHARED, "AppIcon.icns")
    subprocess.run(["iconutil", "-c", "icns", iconset, "-o", icns], check=True)
    print(icns)

# --- Chrome -------------------------------------------------------------------
for px in [16, 32, 48, 128]:
    src = m["chrome-small"] if px <= 32 else m["chrome"]
    save_rgba(down(src, px), os.path.join(CHROME_ICONS, f"icon-{px}.png"))
save_rgba(down(m["chrome-store"], 128), os.path.join(CWS_SHARED, "store-icon-128-padded.png"))
save_rgba(down(m["chrome"], 128), os.path.join(CWS_SHARED, "store-icon-128.png"))

# --- Önizleme: açık (#ffffff, #f2efe6) ve koyu (#202124, #000000) zemin ------
FONT = "/System/Library/Fonts/Menlo.ttc"
font = ImageFont.truetype(FONT, 22)
small = ImageFont.truetype(FONT, 17)
bgs = [("#ffffff", (255, 255, 255)), ("#f2efe6", (242, 239, 230)),
       ("#202124", (32, 33, 36)), ("#000000", (0, 0, 0))]

cols = []  # (başlık, görsel, gösterim ölçeği)
for key in ["icon-16.png", "icon-32.png"]:
    if key in old:
        cols.append((f"eski {key[5:7]} ×4", old[key], 4))
cols += [
    ("Chrome 16 ×4", down(m["chrome-small"], 16), 4),
    ("Chrome 32 ×2", down(m["chrome-small"], 32), 2),
    ("Chrome 16", down(m["chrome-small"], 16), 1),
    ("32", down(m["chrome-small"], 32), 1),
    ("48", down(m["chrome"], 48), 1),
    ("CWS 128 (96+16)", down(m["chrome-store"], 128), 1),
    ("macOS 32", down(m["mac-small"], 32), 1),
    ("macOS 128", down(m["mac"], 128), 1),
    ("iOS 1024 açık", down(m["ios-light"], 128), 1),
    ("iOS koyu", down(m["ios-dark"], 128), 1),
    ("iOS tonlu", down(m["ios-tinted"], 128), 1),
]
CW, RH, PAD, LH = 170, 170, 18, 70
W = 170 + CW * len(cols)
H = LH + RH * len(bgs) + 40
sheet = Image.new("RGB", (W, H), (242, 239, 230))
d = ImageDraw.Draw(sheet)
for i, (title, im, sc) in enumerate(cols):
    x0 = 170 + i * CW
    for j, line in enumerate(title.split(" ", 1) if len(title) > 14 else [title]):
        d.text((x0 + 8, 14 + j * 22), line, font=small, fill=(23, 21, 15))
for r, (label, rgb) in enumerate(bgs):
    y0 = LH + r * RH
    d.rectangle([0, y0, W, y0 + RH], fill=rgb)
    d.text((14, y0 + RH // 2 - 12), label, font=font, fill=(23, 21, 15) if sum(rgb) > 300 else (240, 236, 225))
    for i, (title, im, sc) in enumerate(cols):
        disp = im.resize((im.width * sc, im.height * sc), Image.NEAREST) if sc > 1 else im
        x = 170 + i * CW + (CW - disp.width) // 2
        y = y0 + (RH - disp.height) // 2
        sheet.paste(disp, (x, y), disp)
d.text((14, H - 32), "IncomeVsDesires ikon seti — gerçek piksel boyutu (×N: en yakın komşu büyütme). "
       "Kaynak: store/_src/icon/icons.mjs (AppIcon.jsx)", font=small, fill=(87, 83, 74))
prev = os.path.join(STORE_SHARED, "ikon-onizleme.png")
sheet.save(prev, optimize=True)
print(prev)
