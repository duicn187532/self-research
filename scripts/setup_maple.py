#!/usr/bin/env python3
"""Rebuild the images for the 楓葉冒險 skin in assets/maple/ from the exported asset pack.

Only the pieces the site uses are written: frames, buttons, the login screen's scroll, parchment
and sign, the three scenes and the sprite strips listed in scripts/maple_sprites.json. The full
pack stays out of the repo. Run it again after changing the pack or that list, then run
scripts/stamp_assets.py and commit assets/maple/.

    python3 -I scripts/setup_maple.py PATH/TO/maple-assets.zip   (or the unzipped folder)

The pack is the one laid out as ui/UI.wz/..., map/Map.wz/..., npc/Npc.wz/... (see its README).
"""
import pathlib
import subprocess
import sys
import tempfile

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SKILL = ROOT / ".claude/skills/maple-skin/scripts"
OUT = ROOT / "assets/maple"

# the monsters, NPCs, heroes and pets; build_sprites.py explains the format
SPRITES = ROOT / "scripts/maple_sprites.json"


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
        subprocess.run([sys.executable, "-I", str(SKILL / "compose_login.py"), str(pack), str(OUT / "scene-login.jpg")], check=True)
        subprocess.run([sys.executable, "-I", str(SKILL / "compose_ellinia.py"), str(pack), str(OUT / "scene-ellinia.jpg")], check=True)
        subprocess.run([sys.executable, "-I", str(SKILL / "build_login.py"), str(pack), str(OUT)], check=True)
        # phones get each scene at 1280x720: a background behind the windows, a third of the bytes
        for scene in ("scene-day", "scene-login", "scene-ellinia"):
            with Image.open(OUT / f"{scene}.jpg") as im:
                im.resize((1280, 720), Image.LANCZOS).save(OUT / f"{scene}-sm.jpg", quality=80, optimize=True, progressive=True)
        for old in OUT.glob("spr-*.png"):
            old.unlink()
        subprocess.run([sys.executable, "-I", str(SKILL / "build_sprites.py"), str(pack), str(OUT), str(SPRITES)], check=True)
    print(f"wrote {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
