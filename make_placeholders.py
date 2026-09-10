"""Generate on-brand placeholder imagery for the EveriArt build.

These are deliberately abstract, palette-locked tonal fields — not stock photos
and not 'PLACEHOLDER' text slabs. They read as intentional art direction while
the real work is being prepared, so the layout can be judged honestly.

Replace each file in assets/ with real work at the same filename; no code changes needed.

    ---------------------------------------------------------------------
    MOSTLY SUPERSEDED. Only work-identity-01.jpg and work-identity-02.jpg
    are still in the repo, held by hawthorn-real-estate and grosource,
    which are published:false precisely because that is all they have.

    hero.jpg, studio-film.jpg and studio-photo.jpg were real files on a
    live page. The two studio images are now cut from actual ByEveriArt
    and BeFrames work by make_media.mjs (see its SITE map); hero.jpg and
    the other eleven work-* fields were referenced by nothing and have
    been deleted.

    Running this script rewrites all seventeen. Don't, unless a new
    project genuinely needs a holding image — and if it does, take the
    one file you need and leave the rest deleted. Real media comes from
    make_media.mjs.
    ---------------------------------------------------------------------
"""
from PIL import Image, ImageDraw, ImageFilter
import random
import os

NAVY = (28, 37, 65)
CHARCOAL = (33, 33, 33)
GUNMETAL = (58, 80, 107)
STONE = (142, 142, 142)
PARCHMENT = (244, 241, 222)

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
os.makedirs(OUT, exist_ok=True)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def field(w, h, top, bottom, seed, bands=0, grain=True):
    """A soft vertical tonal field with optional structural banding."""
    rnd = random.Random(seed)
    img = Image.new("RGB", (w, h), top)
    d = ImageDraw.Draw(img)

    # Vertical gradient
    for y in range(h):
        t = y / max(h - 1, 1)
        # ease the ramp so it doesn't read as a linear CSS gradient
        t = t * t * (3 - 2 * t)
        d.line([(0, y), (w, y)], fill=lerp(top, bottom, t))

    # Structural bands — echoes the grid language in the identity
    if bands:
        for _ in range(bands):
            bw = rnd.randint(w // 40, w // 8)
            bx = rnd.randint(0, max(w - bw, 1))
            alpha = rnd.uniform(0.04, 0.12)
            overlay = Image.new("RGB", (bw, h), PARCHMENT)
            base = img.crop((bx, 0, bx + bw, h))
            img.paste(Image.blend(base, overlay, alpha), (bx, 0))

    # Soft diagonal light sweep
    sweep = Image.new("L", (w, h), 0)
    sd = ImageDraw.Draw(sweep)
    x0 = rnd.randint(-w // 3, w // 2)
    sd.polygon(
        [(x0, 0), (x0 + w // 3, 0), (x0 + w // 3 + w // 4, h), (x0 + w // 4, h)],
        fill=48,
    )
    sweep = sweep.filter(ImageFilter.GaussianBlur(w // 12))
    light = Image.new("RGB", (w, h), PARCHMENT)
    img = Image.composite(Image.blend(img, light, 0.16), img, sweep)

    if grain:
        noise = Image.effect_noise((w, h), 14).convert("L")
        img = Image.composite(img, Image.blend(img, Image.new("RGB", (w, h), STONE), 0.10), noise)

    return img


SPECS = [
    # (filename, width, height, top, bottom, bands, seed)
    ("hero.jpg",            2400, 1500, CHARCOAL, NAVY,     7, 11),
    ("studio-film.jpg",     1600, 1000, CHARCOAL, NAVY,     5, 21),
    ("studio-photo.jpg",    1600, 1200, NAVY,     CHARCOAL, 3, 22),
]

for i in range(1, 6):
    SPECS.append((f"work-film-{i:02d}.jpg",     1200, 1500, CHARCOAL, NAVY,     4, 100 + i))
    SPECS.append((f"work-identity-{i:02d}.jpg", 1200, 1500, NAVY,     GUNMETAL, 8, 200 + i))
    SPECS.append((f"work-photo-{i:02d}.jpg",    1200, 1500, GUNMETAL, CHARCOAL, 2, 300 + i))

for name, w, h, top, bottom, bands, seed in SPECS:
    img = field(w, h, top, bottom, seed, bands=bands)
    path = os.path.join(OUT, name)
    img.save(path, "JPEG", quality=82, optimize=True, progressive=True)
    print(f"  {name}  {w}x{h}")

print(f"\n{len(SPECS)} placeholder assets written to assets/")
