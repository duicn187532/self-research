"""Catch scenes that load but silently flatten the WZ background to a sky color."""
from pathlib import Path
from PIL import Image, ImageStat

ROOT = Path(__file__).resolve().parents[1]
SCENES = {
    # Crops are uncovered background in the final 1600 x 760 compositions.
    "leafre": (780, 310, 910, 380),       # Minar mountain ridge
    "nautilus": (810, 95, 1120, 190),     # NautilusPort cloud bank
}

for name, box in SCENES.items():
    full = ROOT / "assets" / "maple" / f"scene-{name}.jpg"
    with Image.open(full) as image:
        assert image.size == (1600, 760), (name, image.size)
        variation = max(ImageStat.Stat(image.crop(box)).stddev)
        assert variation > 12, f"{name} backdrop appears flat: stddev={variation:.1f}"
    with Image.open(full.with_name(f"scene-{name}-sm.jpg")) as small:
        assert small.size == (768, 365), (name, small.size)
        scaled = tuple(round(value * 768 / 1600) if i % 2 == 0 else round(value * 365 / 760)
                       for i, value in enumerate(box))
        assert max(ImageStat.Stat(small.crop(scaled)).stddev) > 9, name + " mobile backdrop appears flat"
    print(name, "backdrop visible in both responsive scene sizes")
