"""Check that every internal link on the site points at a file that exists and, when it has a
#fragment, at an id on that page. No browser needed; run it before committing.

    python3 scripts/check_links.py
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent


def main() -> int:
    pages = [ROOT / "index.html", ROOT / "compare" / "index.html",
             *sorted(p for p in ROOT.glob("papers/*/index.html") if p.parent.name != "_template")]
    ids = {}

    def ids_of(path):
        if path not in ids:
            ids[path] = set(re.findall(r'\sid="([^"]+)"', path.read_text(encoding="utf-8")))
        return ids[path]

    bad = 0
    checked = 0
    for page in pages:
        html = page.read_text(encoding="utf-8")
        for href in re.findall(r'<a\b[^>]*\shref="([^"]+)"', html):
            if re.match(r"[a-z]+:", href):  # https:, mailto:
                continue
            path, _, frag = href.partition("#")
            target = (page.parent / path).resolve() if path else page
            if target.is_dir():
                target = target / "index.html"
            checked += 1
            if not target.exists():
                print(f"{page.relative_to(ROOT)}: missing file {href}")
                bad += 1
            elif frag and frag not in ids_of(target):
                print(f"{page.relative_to(ROOT)}: missing id {href}")
                bad += 1
    print(f"checked {checked} links on {len(pages)} pages, {bad} broken")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
