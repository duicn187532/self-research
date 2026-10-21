"""Cut the world-select pieces of the login screen (UI.wz/Login.img) into page frames.

    python3 -I build_login.py ASSETS OUT_DIR

  scroll9.png  WorldSelect/scroll/0/1, the open scroll: rod and knobs on top, a curl at the foot.
               Slices 150 52 34 50 (top right bottom left); the paper runs x 38-486.
  parch9.png   WorldSelect/chBackgrn, the channel list's parchment. Slices 60 30 20 30; the two
               ruled lines sit at y 26 and 218, so the top slice carries the first one.
  plank9.png   WorldSelect/BtWorld/e, the blank world sign, turned to lie flat (95x26).
               Slices 4 6 4 16; the left 16 holds the nail.
"""
import os
import sys
from PIL import Image

A, O = sys.argv[1], sys.argv[2]
os.makedirs(O, exist_ok=True)
WS = A + "/ui/UI.wz/Login.img/WorldSelect/"
Image.open(WS + "scroll/0/1.png").convert("RGBA").save(os.path.join(O, "scroll9.png"), optimize=True)
Image.open(WS + "chBackgrn.png").convert("RGBA").save(os.path.join(O, "parch9.png"), optimize=True)
Image.open(WS + "BtWorld/e/normal/0.png").convert("RGBA").rotate(90, expand=True).save(os.path.join(O, "plank9.png"), optimize=True)
