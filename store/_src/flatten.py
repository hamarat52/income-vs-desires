"""PNG'leri alfasız (RGB) yap; boyutu doğrula. python3 flatten.py <beklenen WxH> <png>..."""
import sys

from PIL import Image

want = tuple(int(v) for v in sys.argv[1].split("x"))
for path in sys.argv[2:]:
    im = Image.open(path)
    if im.size != want:
        sys.exit(f"BOYUT HATASI {path}: {im.size} != {want}")
    if im.mode != "RGB":
        rgba = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (242, 239, 230))
        bg.paste(rgba, mask=rgba.split()[3])
        im = bg
    im.save(path, optimize=True)
    print(path, im.size, im.mode)
