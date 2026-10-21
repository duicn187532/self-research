#!/usr/bin/env python3
"""Stamp the shared CSS/JS links in every page with a content hash, so browsers drop old copies.

    python3 scripts/stamp_assets.py

GitHub Pages lets browsers keep site.css and site.js for a while; a page that pairs new HTML with
an old script breaks. Each page links assets/site.css?v=..., assets/site.js?v=... and
assets/anim.js?v=...; run this after changing any of them or anything in assets/maple/, then commit.
site.css's stamp also covers assets/maple/: site.js puts it on the sprite table and strips it loads.
"""
import hashlib
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"


def digest(*paths: pathlib.Path) -> str:
    h = hashlib.sha256()
    for p in paths:
        h.update(p.name.encode())
        h.update(p.read_bytes())
    return h.hexdigest()[:10]


def main() -> int:
    maple = sorted(p for p in (ASSETS / "maple").glob("*") if p.is_file())
    stamps = {
        "site.css": digest(ASSETS / "site.css", *maple),
        "site.js": digest(ASSETS / "site.js"),
        "anim.js": digest(ASSETS / "anim.js"),
    }
    pages = [ROOT / "index.html", *sorted(ROOT.glob("papers/*/index.html"))]
    changed = 0
    for page in pages:
        s = page.read_text(encoding="utf-8")
        new = s
        for name, v in stamps.items():
            new = re.sub(r'((?:href|src)="[./]*assets/' + re.escape(name) + r')(?:\?v=\w+)?"', r'\1?v=' + v + '"', new)
        if new != s:
            page.write_text(new, encoding="utf-8")
            changed += 1
    print(f"stamped {changed} of {len(pages)} pages: " + ", ".join(f"{k}?v={v}" for k, v in stamps.items()))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
