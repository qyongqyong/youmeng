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


def hgradient(left, right, w=W, h=H):
    t = np.linspace(0, 1, w)[None, :, None]
    a = np.array(left, dtype=np.float32)
    b = np.array(right, dtype=np.float32)
    arr = a * (1 - t) + b * t
    arr = np.repeat(arr, h, axis=0)
    return Image.fromarray(arr.astype(np.uint8), "RGB")


def draw_stars(d, n=120, seed=7, w=W, h=H):
    rng = np.random.default_rng(seed)
    for _ in range(n):
        x, y = rng.integers(0, w), rng.integers(0, int(h * 0.6))
        r = int(rng.integers(1, 3))
        c = int(rng.integers(180, 255))
        d.ellipse([x - r, y - r, x + r, y + r], fill=(c, c, min(255, c + 40)))


# 1) 沙滩日落 —— “我梦见自己站在了沙滩上”
img = vgradient((60, 40, 120), (255, 140, 80), W, int(H * 0.62))
img = img.resize((W, H))  # keep top portion; will overlay sea/sand below
d = ImageDraw.Draw(img)
d.ellipse([W * 0.66, H * 0.12, W * 0.90, H * 0.36], fill=(255, 224, 150))
# sea
sea = vgradient((40, 40, 90), (200, 90, 120), W, int(H * 0.18))
img.paste(sea, (0, int(H * 0.60)))
# sand
sand = vgradient((120, 80, 60), (220, 170, 130), W, int(H * 0.22))
img.paste(sand, (0, int(H * 0.78)))
d = ImageDraw.Draw(img)
d.line([(0, int(H * 0.60)), (W, int(H * 0.60))], fill=(255, 180, 130), width=3)
# glowing reflection on sea
for i in range(40):
    d.line([(W * 0.78 - i * 4, int(H * 0.60)), (W * 0.78 - i * 5, int(H * 0.72))],
           fill=(255, 200, 120), width=2)
img.save(os.path.join(OUT, "beach.png"))

# 2) 云上球场 —— “我梦见和7号球星一起踢球了”
img = vgradient((30, 80, 140), (120, 190, 240), W, H)
d = ImageDraw.Draw(img)
# clouds
for cx, cy, r in [(150, 180, 70), (850, 150, 90), (500, 90, 60)]:
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(235, 245, 255))
# field (grass)
field_top = int(H * 0.45)
grass = vgradient((40, 140, 70), (20, 90, 50), W, H - field_top)
img.paste(grass, (0, field_top))
d = ImageDraw.Draw(img)
d.rectangle([0, field_top, W, H], outline=(255, 255, 255), width=6)
d.line([(W // 2, field_top), (W // 2, H)], fill=(255, 255, 255), width=6)
d.ellipse([W // 2 - 90, H // 2 - 90, W // 2 + 90, H // 2 + 90],
          outline=(255, 255, 255), width=6)
# soccer ball (cartoon)
bx, by, br = 760, 200, 60
d.ellipse([bx - br, by - br, bx + br, by + br], fill=(255, 255, 255),
          outline=(20, 20, 20), width=4)
d.polygon([(bx, by - br // 2), (bx - br // 2, by + br // 4),
           (bx + br // 2, by + br // 4)], fill=(20, 20, 20))
# #7 cartoon jersey (no real person)
jx, jy = 230, 430
d.rounded_rectangle([jx, jy, jx + 160, jy + 220], radius=28, fill=(220, 40, 40))
d.rounded_rectangle([jx - 30, jy + 10, jx, jy + 90], radius=20, fill=(220, 40, 40))
d.rounded_rectangle([jx + 160, jy + 10, jx + 190, jy + 90], radius=20, fill=(220, 40, 40))
# number 7
d.line([(jx + 42, jy + 70), (jx + 118, jy + 70)], fill=(255, 255, 255), width=22)
d.line([(jx + 118, jy + 70), (jx + 62, jy + 180)], fill=(255, 255, 255), width=22)
img.save(os.path.join(OUT, "football.png"))

# 3) 星空飞行 —— “我梦见在星空下飞翔”
img = vgradient((10, 10, 40), (60, 30, 110), W, H)
d = ImageDraw.Draw(img)
draw_stars(d)
d.ellipse([W * 0.72, H * 0.10, W * 0.94, H * 0.32], fill=(245, 240, 210))
# flying silhouette
d.ellipse([W * 0.30, H * 0.55, W * 0.42, H * 0.67], fill=(8, 8, 20))  # body
d.ellipse([W * 0.28, H * 0.50, W * 0.46, H * 0.60], fill=(8, 8, 20))  # head
for off in (-1, 1):
    d.polygon([(W * 0.36, H * 0.60), (W * 0.36 + off * 90, H * 0.52),
               (W * 0.36, H * 0.62)], fill=(8, 8, 20))  # wings
img.save(os.path.join(OUT, "starry.png"))

# 4) 迷雾森林 —— “我梦见一片迷雾森林”
img = vgradient((70, 110, 120), (180, 200, 200), W, H)
d = ImageDraw.Draw(img)
rng = np.random.default_rng(11)
for i in range(14):
    x = int(i * W / 13 + rng.integers(-10, 10))
    hgt = int(H * rng.uniform(0.35, 0.75))
    wdt = int(rng.uniform(60, 120))
    shade = int(rng.integers(20, 60))
    d.polygon([(x - wdt // 2, H), (x + wdt // 2, H), (x, H - hgt)],
              fill=(shade, shade + 40, shade + 45))
# fog bands
for i in range(5):
    y = int(H * (0.3 + 0.14 * i))
    d.rectangle([0, y, W, y + 26], fill=(220, 230, 230, 90))
img.save(os.path.join(OUT, "forest.png"))

# 5) 深海巨鲸 —— “我梦见在深海里看见鲸鱼”
img = vgradient((5, 30, 70), (10, 90, 120), W, H)
d = ImageDraw.Draw(img)
rng = np.random.default_rng(3)
for _ in range(60):
    x, y = rng.integers(0, W), rng.integers(0, H)
    r = int(rng.integers(2, 8))
    d.ellipse([x - r, y - r, x + r, y + r], outline=(150, 210, 230), width=2)
# whale silhouette
d.ellipse([W * 0.25, H * 0.40, W * 0.75, H * 0.66], fill=(15, 25, 45))
d.polygon([(W * 0.72, H * 0.48), (W * 0.88, H * 0.34), (W * 0.82, H * 0.56)],
          fill=(15, 25, 45))
d.ellipse([W * 0.34, H * 0.46, W * 0.38, H * 0.50], fill=(240, 250, 255))
img.save(os.path.join(OUT, "whale.png"))

print("generated:", sorted(os.listdir(OUT)))
