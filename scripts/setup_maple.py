#!/usr/bin/env python3
"""Build the images for the 楓葉冒險 skin into assets/maple/ from your exported asset pack.

The game art stays on your machine: assets/maple/ is git-ignored, and the skin only shows
up in the appearance menu when these files are present. The public site never has them.

    python3 -I scripts/setup_maple.py PATH/TO/maple-assets.zip   (or the unzipped folder)

The pack is the one laid out as ui/UI.wz/..., map/Map.wz/..., npc/Npc.wz/... (see its README).
"""
import pathlib
import shutil
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
SKILL = ROOT / ".claude/skills/maple-skin/scripts"
OUT = ROOT / "assets/maple"

# NPCs that take turns in the self-check dialogs, in order
NPCS = [
    ("npc-1.png", "npc/Npc.wz/0010201.img/stand/0.png"),
    ("npc-2.png", "npc/截圖/弓箭手導師.png"),
    ("npc-3.png", "npc/Npc.wz/1052103.img/stand/0.png"),
]


def find_pack(path: pathlib.Path) -> pathlib.Path:
    for candidate in [path, *path.glob("*"), *path.glob("*/*")]:
        if (candidate / "ui/UI.wz").is_dir() and (candidate / "map/Map.wz").is_dir():
            return candidate
    sys.exit(f"no ui/UI.wz and map/Map.wz under {path}")


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 1
    src = pathlib.Path(sys.argv[1]).resolve()
    with tempfile.TemporaryDirectory() as tmp:
        if src.suffix == ".zip":
            subprocess.run([sys.executable, "-I", str(SKILL / "unpack.py"), tmp, str(src)], check=True)
            src = pathlib.Path(tmp)
        pack = find_pack(src)
        OUT.mkdir(parents=True, exist_ok=True)
        subprocess.run([sys.executable, "-I", str(SKILL / "build_slices.py"), str(pack), str(OUT)], check=True, stdout=subprocess.DEVNULL)
        subprocess.run([sys.executable, "-I", str(SKILL / "compose_scene.py"), str(pack), str(OUT / "scene-day.jpg")], check=True)
        for name, rel in NPCS:
            if (pack / rel).is_file():
                shutil.copy(pack / rel, OUT / name)
            else:
                print(f"skipped {name}: {rel} is not in the pack")
    print(f"wrote {OUT}; reload a page and pick 外觀 → 楓葉冒險")
    return 0


if __name__ == "__main__":
    sys.exit(main())
