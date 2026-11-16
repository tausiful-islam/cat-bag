#!/usr/bin/env python3
"""Generate elegant placeholder product images for local demo data.

Minimalist studio-style frames on warm neutral backdrops with a simple
bag glyph. These are development placeholders — real product
photography replaces them via the admin panel.
"""
from PIL import Image, ImageDraw, ImageFont
import os

OUT = "/tmp/catbag-imgs"
os.makedirs(OUT, exist_ok=True)

W, H = 1200, 1500  # 4:5

BACKDROPS = ["#ece5d8", "#e6ddcc", "#efe9de", "#e8e1d2"]
GLYPHS = {
    "crossbody": "#5b4a38",
    "shoulder": "#6d5c48",
    "tote": "#4a3f33",
    "accessory": "#7a6a55",
}

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def hex2rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def draw_bag(draw, cx, cy, w, h, color, style, flap_t=0.0):
    c = hex2rgb(color)
    left, right = cx - w / 2, cx + w / 2
    top, bottom = cy - h / 2, cy + h / 2
    r = 28

    # body
    draw.rounded_rectangle([left, top, right, bottom], radius=r, fill=c)

    # flap / clasp detail
    if style in ("crossbody", "shoulder"):
        flap_h = h * (0.34 + flap_t * 0.1)
        draw.rounded_rectangle([left, top, right, top + flap_h], radius=r, fill=lerp(c, (0, 0, 0), 0.12))
        clasp_r = 16
        draw.ellipse([cx - clasp_r, top + flap_h - clasp_r, cx + clasp_r, top + flap_h + clasp_r], fill="#c9b891")
    if style == "tote":
        # open top band
        draw.rectangle([left, top, right, top + h * 0.08], fill=lerp(c, (255, 255, 255), 0.15))

    # handle
    hw = w * 0.42
    handle_top = top - h * 0.16
    thickness = 16
    draw.arc([cx - hw, handle_top, cx + hw, top + h * 0.28], start=180, end=360, fill=c, width=thickness)

def make(name, style, backdrop, idx, out_name):
    img = Image.new("RGB", (W, H), hex2rgb(backdrop))
    d = ImageDraw.Draw(img)

    # subtle floor shadow
    d.ellipse([W*0.28, H*0.78, W*0.72, H*0.82], fill=lerp(hex2rgb(backdrop), (0, 0, 0), 0.05))

    # glyph geometry per style
    if style == "crossbody":
        draw_bag(d, W/2, H*0.47, W*0.34, H*0.30, GLYPHS["crossbody"], "crossbody", flap_t=idx)
    elif style == "shoulder":
        draw_bag(d, W/2, H*0.48, W*0.40, H*0.27, GLYPHS["shoulder"], "shoulder", flap_t=idx)
    elif style == "tote":
        draw_bag(d, W/2, H*0.47, W*0.46, H*0.30, GLYPHS["tote"], "tote")
    else:
        draw_bag(d, W/2, H*0.48, W*0.24, H*0.16, GLYPHS["accessory"], "accessory")

    # caption
    f1 = ImageFont.truetype(FONT_BOLD, 44)
    f2 = ImageFont.truetype(FONT_REG, 30)
    t1 = name.upper()
    t2 = "SAMPLE PHOTOGRAPH — REPLACE IN ADMIN"
    w1 = d.textlength(t1, font=f1)
    w2 = d.textlength(t2, font=f2)
    d.text(((W - w1) / 2, H * 0.87), t1, font=f1, fill="#3d352a")
    d.text(((W - w2) / 2, H * 0.915), t2, font=f2, fill="#8a8072")

    img.save(f"{OUT}/{out_name}.jpg", quality=88)
    return f"{OUT}/{out_name}.jpg"

if __name__ == "__main__":
    made = []
    products = [
        ("Aria Crossbody", "crossbody", 0),
        ("Nova Crossbody", "crossbody", 1),
        ("Lyra Shoulder Bag", "shoulder", 0),
        ("Vela Shoulder Bag", "shoulder", 1),
        ("Odessa Tote", "tote", 0),
        ("Marlow Tote", "tote", 1),
        ("Isla Card Holder", "accessory", 0),
        ("Rue Pouch", "accessory", 1),
    ]
    for i, (name, style, v) in enumerate(products):
        for k in range(2):
            backdrop = BACKDROPS[(i + k) % 4]
            made.append(make(name, style, backdrop, k, f"{style}-{i}-{k}"))
    for m in made:
        print(m)
