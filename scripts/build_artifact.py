#!/usr/bin/env python3
"""Inline the shared CSS/JS into one paper page so it can be published as a single
self-contained file (e.g. a claude.ai Artifact) or opened without the rest of the repo.

    python3 scripts/build_artifact.py papers/2601.18642/index.html dist/2601.18642.html
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent


def build(src: pathlib.Path) -> str:
    s = src.read_text(encoding="utf-8")
    css = (ROOT / "assets/site.css").read_text(encoding="utf-8")
    s = re.sub(r'<link rel="stylesheet" href="[./]*assets/site\.css(?:\?v=\w+)?">', lambda _: "<style>\n" + css + "</style>", s)
    s = re.sub(
        r'<script src="[./]*assets/([\w-]+\.js)(?:\?v=\w+)?"></script>',
        lambda m: "<script>\n" + (ROOT / "assets" / m.group(1)).read_text(encoding="utf-8") + "</script>",
        s,
    )
    # The artifact host supplies its own document skeleton and charset/viewport metas.
    s = re.sub(r"<!doctype html>\s*", "", s, flags=re.I)
    s = re.sub(r"</?(html|head|body)[^>]*>\s*", "", s)
    s = re.sub(r'<meta (charset|name="viewport")[^>]*>\s*', "", s)
    # The game skin needs assets/maple/, which a single file lacks: keep the head from switching to it.
    s = s.replace('if(JSON.parse(localStorage.getItem("study:skin"))!=="study")r.setAttribute("data-skin","maple");', "")
    # Links back to the shelf don't exist outside the repo.
    s = s.replace('href="../../index.html"', 'href="#"')
    return s


def main() -> int:
    if len(sys.argv) != 3:
        print(__doc__)
        return 1
    out = pathlib.Path(sys.argv[2])
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(build(pathlib.Path(sys.argv[1])), encoding="utf-8")
    print(f"wrote {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
