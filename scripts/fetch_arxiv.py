#!/usr/bin/env python3
"""Download an arXiv paper's HTML version and flatten it to plain text for close reading.

Math is kept as its LaTeX alttext ($...$), headings become '## ', figures and
tables keep their captions. Output goes to _sources/<id>.txt (git-ignored).

    python3 scripts/fetch_arxiv.py 2601.18642v2
    python3 scripts/fetch_arxiv.py 2601.18642v2 --html saved_page.html   # use a local copy
"""
import argparse
import html
import pathlib
import re
import sys
import urllib.request


def flatten(page: str) -> str:
    s = re.sub(r"<(script|style|nav|footer)[^>]*>.*?</\1>", "", page, flags=re.S | re.I)
    s = re.sub(
        r'<math[^>]*alttext="([^"]*)"[^>]*>.*?</math>',
        lambda m: " $" + html.unescape(m.group(1)) + "$ ",
        s,
        flags=re.S,
    )
    s = re.sub(r"<h[1-6][^>]*>", "\n\n## ", s)
    s = re.sub(r"<(p|div|li|tr|figcaption|caption|br)[^>]*>", "\n", s)
    s = re.sub(r"<t[dh][^>]*>", " | ", s)
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s)
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n\s*\n+", "\n\n", s)
    return s.strip() + "\n"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("arxiv_id", help="e.g. 2601.18642v2")
    ap.add_argument("--html", help="read this local HTML file instead of downloading")
    ap.add_argument("--out", help="output path (default: _sources/<id>.txt)")
    args = ap.parse_args()

    if args.html:
        page = pathlib.Path(args.html).read_text(encoding="utf-8")
    else:
        url = f"https://arxiv.org/html/{args.arxiv_id}"
        req = urllib.request.Request(url, headers={"User-Agent": "paper-study/1.0"})
        with urllib.request.urlopen(req, timeout=60) as r:
            page = r.read().decode("utf-8", errors="replace")

    out = pathlib.Path(args.out or f"_sources/{args.arxiv_id}.txt")
    out.parent.mkdir(parents=True, exist_ok=True)
    text = flatten(page)
    out.write_text(text, encoding="utf-8")
    print(f"wrote {out} ({len(text):,} chars)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
