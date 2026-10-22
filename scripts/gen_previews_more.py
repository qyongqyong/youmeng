import os
import numpy as np
from PIL import Image, ImageDraw

OUT = "apps/web/public/previews"
os.makedirs(OUT, exist_ok=True)
W, H = 1024, 768


def vgradient(top, bottom, w=W, h=H):
    t = np.linspace(0, 1, h)[:, None, None]
    a = np.array(top, dtype=np.float32)
    b = np.array(bottom, dtype=np.float32)
    arr = a * (1 - t) + b * t
    arr = np.repeat(arr, w, axis=1)
    return Image.fromarray(arr.astype(np.uint8), "RGB")


# 6) 极光
img = vgradient((6, 10, 40), (30, 60, 90), W, H)
d = ImageDraw.Draw(img)
for i, (col, y0, amp) in enumerate(
    [((60, 220, 160), 120, 60), ((120, 90, 240), 180, 90), ((80, 200, 240), 240, 70)]
):
    for x in range(0, W, 4):
        y = y0 + int(amp * np.sin(x / 90 + i))
        d.line([(x, y), (x, y + 120)], fill=col, width=4)
for mx, mw, mh in [(150, 380, 280), (520, 420, 340), (860, 320, 260)]:
    d.polygon([(mx - mw // 2, H), (mx + mw // 2, H), (mx, H - mh)], fill=(6, 12, 24))
img.save(os.path.join(OUT, "aurora.png"))

# 7) 霓虹城市
img = vgradient((10, 6, 30), (40, 10, 60), W, H)
d = ImageDraw.Draw(img)
rng = np.random.default_rng(21)
for i in range(18):
    bw = int(rng.integers(50, 110))
    bh = int(rng.integers(200, 520))
    x = int(i * W / 17)
    y = H - bh
    shade = int(rng.integers(14, 34))
    d.rectangle([x, y, x + bw, H], fill=(shade, shade // 2, shade + 20))
    for wy in range(y + 20, H - 20, 26):
        for wx in range(x + 10, x + bw - 10, 20):
            if rng.random() > 0.45:
                c = [(255, 210, 120), (120, 220, 255), (240, 120, 220)][
                    int(rng.integers(0, 3))
                ]
                d.rectangle([wx, wy, wx + 7, wy + 10], fill=c)
d.ellipse([W * 0.42, H * 0.08, W * 0.58, H * 0.22], fill=(250, 240, 200))
img.save(os.path.join(OUT, "city.png"))

# 8) 花海
img = vgradient((120, 170, 220), (240, 200, 230), W, H)
d = ImageDraw.Draw(img)
d.ellipse([W * 0.72, H * 0.10, W * 0.88, H * 0.26], fill=(255, 250, 220))
rng = np.random.default_rng(5)
for _ in range(900):
    x = int(rng.integers(0, W))
    y = int(rng.integers(int(H * 0.45), H))
    r = int(rng.integers(2, 7))
    c = [
        (255, 120, 170),
        (255, 200, 90),
        (200, 130, 255),
        (255, 255, 255),
        (120, 200, 160),
    ][int(rng.integers(0, 5))]
    d.ellipse([x - r, y - r, x + r, y + r], fill=c)
img.save(os.path.join(OUT, "flower.png"))

print("generated more:", sorted(os.listdir(OUT)))
