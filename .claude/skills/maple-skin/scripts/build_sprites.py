"""Turn exported frame folders into sprite strips plus a table the page reads.

    python3 -I build_sprites.py ASSETS OUT_DIR SPEC.json

SPEC.json lists the sprites:
    {"mob-slime": {"kind": "mob", "dir": "mob/Mob.wz/0210100.img",
                   "acts": {"stand": "stand", "move": "move", "hit": "hit1", "die": "die1"}}, ...}
"kind" and any other keys besides "dir" and "acts" are copied to the table as they are.
An action's frames are either ACTION/0.png, 1.png ... (WZ export), ACTION/frame_000.png ...
(pet export) or ACTION_0.png, ACTION_1.png ... (flat export; ACTION may hold a subfolder,
as in "move-jump/move"); "dir" may also name a single
PNG, which becomes a one-frame "stand".

Each action becomes OUT_DIR/spr-NAME-ACT.png: its frames side by side in equal cells, each
frame bottom-centred, because the exports drop the game's origin points and feet on one line
is what keeps a sprite from hopping. OUT_DIR/sprites.js sets window.MAPLE_SPRITES to
{NAME: {...extra keys, acts: {ACT: [cell width, cell height, frame count]}}}.
"""
import json
import os
import re
import sys
from PIL import Image

A, O, SPEC = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(O, exist_ok=True)


def frames(base, act):
    folder = os.path.join(base, act)
    if os.path.isdir(folder):
        names = [f for f in os.listdir(folder) if f.endswith(".png")]
    else:
        folder, prefix = os.path.split(folder)
        names = [f for f in os.listdir(folder) if re.fullmatch(re.escape(prefix) + r"_\d+\.png", f)]
    names.sort(key=lambda f: int(re.findall(r"\d+", f)[-1]))
    return [Image.open(os.path.join(folder, f)).convert("RGBA") for f in names]


def strip(imgs, out):
    imgs = [im for im in imgs if im.width > 1 or im.height > 1]
    if not imgs:
        return None
    w, h = max(im.width for im in imgs), max(im.height for im in imgs)
    sheet = Image.new("RGBA", (w * len(imgs), h))
    for i, im in enumerate(imgs):
        sheet.alpha_composite(im, (i * w + (w - im.width) // 2, h - im.height))
    sheet.save(out, optimize=True)
    return [w, h, len(imgs)]


table = {}
for name, spec in json.load(open(SPEC, encoding="utf-8")).items():
    base = os.path.join(A, spec["dir"])
    entry = {k: v for k, v in spec.items() if k not in ("dir", "acts")}
    entry["acts"] = {}
    if os.path.isfile(base):
        acts = {"stand": [Image.open(base).convert("RGBA")]}
    else:
        acts = {act: frames(base, src) for act, src in spec["acts"].items()}
    for act, imgs in acts.items():
        cell = strip(imgs, os.path.join(O, f"spr-{name}-{act}.png"))
        if cell:
            entry["acts"][act] = cell
        else:
            print(f"{name}: no frames for {act}", file=sys.stderr)
    if "stand" in entry["acts"]:
        table[name] = entry
    else:
        print(f"{name}: skipped, no stand frames", file=sys.stderr)

with open(os.path.join(O, "sprites.js"), "w", encoding="utf-8") as f:
    f.write("// Built by build_sprites.py; see its docstring.\n")
    f.write("window.MAPLE_SPRITES = " + json.dumps(table, ensure_ascii=False, separators=(",", ":")) + ";\n")
print(f"{len(table)} sprites")
