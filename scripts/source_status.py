#!/usr/bin/env python3
"""Render the source verification scope into each static paper header."""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATUS = json.loads((ROOT / "papers/source-status.json").read_text(encoding="utf-8"))


def render(item):
    return item["note"]


def main(check):
    failures = []
    for paper, item in STATUS.items():
        path = ROOT / "papers" / paper / "index.html"
        html = path.read_text(encoding="utf-8")
        expected = '<p class="reading-verification-note">' + render(item) + '</p>'
        updated, count = re.subn(r'<p class="reading-verification-note">[^<]*</p>',
                                 lambda _: expected, html)
        if count != 1:
            failures.append(paper + ": expected one verification note")
        elif updated != html:
            if check:
                failures.append(paper + ": verification note differs from manifest")
            else:
                path.write_text(updated, encoding="utf-8")
    if failures:
        print("\n".join(failures), file=sys.stderr)
        return 1
    print("source status: " + str(len(STATUS)) + " paper headers verified")
    return 0


if __name__ == "__main__":
    raise SystemExit(main("--check" in sys.argv))
