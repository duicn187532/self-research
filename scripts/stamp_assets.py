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
    # site.js injects the sync module dynamically, so stamp that URL before
    # calculating site.js's own hash for page script tags.
    site_path = ASSETS / "site.js"
    site_source = site_path.read_text(encoding="utf-8")
    sync_stamp = digest(ASSETS / "study-sync.js")
    updated_site = re.sub(r"study-sync\.js\?v=\w+", "study-sync.js?v=" + sync_stamp, site_source)
    if updated_site != site_source:
        site_path.write_text(updated_site, encoding="utf-8")
    maple = sorted(p for p in (ASSETS / "maple").glob("*") if p.is_file())
    stamps = {
        "site.css": digest(ASSETS / "site.css", *maple),
        "site.js": digest(ASSETS / "site.js"),
        "anim.js": digest(ASSETS / "anim.js"),
        "battle.js": digest(ASSETS / "battle.js"),
        "quest.js": digest(ASSETS / "quest.js"),
        "reading-lab.js": digest(ASSETS / "reading-lab.js"),
        "reading-lab.css": digest(ASSETS / "reading-lab.css"),
    }
    pages = [ROOT / "index.html", ROOT / "compare" / "index.html", *sorted(ROOT.glob("papers/*/index.html"))]
    changed = 0
    for page in pages:
        s = page.read_text(encoding="utf-8")
        new = s
        for name, v in stamps.items():
            new = re.sub(r'((?:href|src)="[./]*assets/' + re.escape(name) + r')(?:\?v=\w+)?"', r'\1?v=' + v + '"', new)
        # a paper's own question bank, next to its page
        quiz = page.parent / "quiz.js"
        if quiz.exists():
            new = re.sub(r'src="quiz\.js(?:\?v=\w+)?"', 'src="quiz.js?v=' + digest(quiz) + '"', new)
        if new != s:
            page.write_text(new, encoding="utf-8")
            changed += 1
    print(f"stamped {changed} of {len(pages)} pages: " + ", ".join(f"{k}?v={v}" for k, v in stamps.items()))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
