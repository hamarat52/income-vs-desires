"""Kontak föyü: bir dilin tüm mağaza görselleri yan yana, dosya adı + piksel boyutu ile.
    python3 store/_src/kontak.py      → store/shared/kontak-foyu-{tr,en}.jpg
"""
import glob
import os

from PIL import Image, ImageDraw, ImageFont

STORE = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FONT = "/System/Library/Fonts/Menlo.ttc"
f_h = ImageFont.truetype(FONT, 30)
f_s = ImageFont.truetype(FONT, 17)
PAPER = (242, 239, 230)
INK = (23, 21, 15)


def section(lang):
    rows = [
        ("Chrome Web Store · ekran görüntüsü 1280×800", sorted(glob.glob(f"{STORE}/chrome-web-store/{lang}/screenshots/0*.png")), 420),
        ("Chrome Web Store · dilden bağımsız (TR = EN) 440×280 · 1400×560 · ikon 128",
         [f"{STORE}/chrome-web-store/shared/promo-small-440x280-dilsiz.png",
          f"{STORE}/chrome-web-store/shared/marquee-1400x560-dilsiz.png",
          f"{STORE}/chrome-web-store/shared/store-icon-128-padded.png"], 300),
        ("App Store · iPhone 1206×2622", sorted(glob.glob(f"{STORE}/app-store/{lang}/iphone/0*.png")), 640),
        ("App Store · iPad 13\" 2064×2752", sorted(glob.glob(f"{STORE}/app-store/{lang}/ipad/0*.png")), 560),
        ("App Store · Mac 2880×1800", sorted(glob.glob(f"{STORE}/app-store/{lang}/mac/0*.png")), 340),
        ("İkon önizleme (açık / koyu zemin)", [f"{STORE}/shared/ikon-onizleme.png"], 300),
    ]
    W = 2700
    blocks = []
    for title, files, h in rows:
        ims = []
        for f in files:
            im = Image.open(f)
            info = f"{os.path.basename(f)}\n{im.width}×{im.height} {im.mode}"
            im = im.convert("RGBA")
            scale = h / im.height
            if im.width * scale > W - 80:
                scale = (W - 80) / im.width
            t = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS)
            ims.append((t, info))
        blocks.append((title, ims))
    # yerleşim: satır taşarsa alta kay
    y = 110
    placed = []
    for title, ims in blocks:
        placed.append(("T", title, 40, y))
        y += 50
        x, rowh = 40, 0
        for t, info in ims:
            if x + t.width > W - 40:
                x, y = 40, y + rowh + 70
                rowh = 0
            placed.append(("I", (t, info), x, y))
            x += max(t.width, 250) + 28
            rowh = max(rowh, t.height)
        y += rowh + 90
    sheet = Image.new("RGB", (W, y + 20), PAPER)
    d = ImageDraw.Draw(sheet)
    d.text((40, 36), f"IncomeVsDesires · mağaza görselleri · {lang.upper()} · kontak föyü (28.10.2026)", font=f_h, fill=INK)
    for kind, val, x, yy in placed:
        if kind == "T":
            d.text((x, yy), val, font=f_h, fill=(12, 154, 108))
        else:
            t, info = val
            bg = Image.new("RGBA", t.size, (255, 255, 255, 255))
            bg.alpha_composite(t)
            sheet.paste(bg.convert("RGB"), (x, yy))
            d.rectangle([x - 1, yy - 1, x + t.width, yy + t.height], outline=(200, 195, 182))
            d.text((x, yy + t.height + 8), info, font=f_s, fill=(87, 83, 74))
    out = f"{STORE}/shared/kontak-foyu-{lang}.jpg"
    sheet.save(out, quality=86, optimize=True)
    print(out, sheet.size)


for lang in ("tr", "en"):
    section(lang)
