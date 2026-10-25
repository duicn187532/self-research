#!/usr/bin/env python3
"""Fast, dependency-free regression gate for the graduate reading lab.
Run: python3 scripts/check_reading_lab.py
Does not claim to replace browser testing or PDF source verification.
"""
from html.parser import HTMLParser
from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
PAPERS = [
    "2501.13956", "2601.18642", "2604.14362",
    "2604.20006", "2610.09008",
    "2605.06527", "2606.30306", "2608.19652",
    "dekleer-1986-atms",
]
class Inspect(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.hrefs, self.scripts, self.styles = set(), [], [], []
        self.sections, self.done, self.dupe = [], [], []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            if a["id"] in self.ids:
                self.dupe.append(a["id"])
            self.ids.add(a["id"])
        if tag == "section" and a.get("id", "").startswith("s-"):
            self.sections.append(a["id"])
        if tag == "input" and "data-done" in a:
            self.done.append(a["data-done"])
        if tag == "a" and "href" in a:
            self.hrefs.append(a["href"])
        if tag == "script" and "src" in a:
            self.scripts.append(a["src"].split("?")[0])
        if tag == "link" and a.get("rel") == "stylesheet":
            self.styles.append(a["href"].split("?")[0])

def verify() -> list[str]:
    failures = []
    for id in PAPERS:
        path = ROOT / "papers" / id / "index.html"
        html = path.read_text(encoding="utf-8")
        p = Inspect()
        p.feed(html)
        prefix = "papers/" + id
        if p.dupe:
            failures.append(prefix + ": duplicate ids " + str(p.dupe))
        if "../../assets/reading-lab.js" not in p.scripts:
            failures.append(prefix + ": missing JS")
        if "../../assets/reading-lab.css" not in p.styles:
            failures.append(prefix + ": missing CSS")
        for section in ("s-research","s-critique"):
            if section not in p.sections:
                failures.append(prefix + ": missing " + section)
        if not ({"s-route", "s-overview"} & set(p.sections)):
            failures.append(prefix + ": missing reading route")
        if not any(x == "s-boss" for x in p.sections):
            failures.append(prefix + ": existing battle missing")
        if len(p.done) != len(set(p.done)):
            failures.append(prefix + ": duplicated progress keys")
        if len(p.done) < 8:
            failures.append(prefix + ": suspiciously few progress keys")
        for href in p.hrefs:
            if href.startswith("#") and href[1:] and href[1:] not in p.ids:
                failures.append(prefix + ": dangling anchor " + href)
        if not re.search(r'data-paper="' + re.escape(id) + r'"', html):
            failures.append(prefix + ": changed paper storage namespace")
    js = (ROOT / "assets/reading-lab.js").read_text(encoding="utf-8")
    css = (ROOT / "assets/reading-lab.css").read_text(encoding="utf-8")
    for id in PAPERS:
        if '"' + id + '": {' not in js:
            failures.append("Missing five-dimension configuration for " + id)
    manifest = json.loads((ROOT / 'scripts/research/source_manifest.json').read_text(encoding='utf-8'))
    if set(manifest.get('papers', {})) != set(PAPERS):
        failures.append('Source manifest must cover exactly the configured papers')
    for id in PAPERS:
        start = js.find('"' + id + '": {')
        if start < 0:
            continue
        end = js.find('\n    },', start)
        if end < 0:
            end = js.find('\n    }\n  };', start)
        block = js[start:end] if end >= 0 else js[start:]
        page_html = (ROOT / 'papers' / id / 'index.html').read_text(encoding='utf-8')
        for anchor in set(re.findall(r'"(s-[a-zA-Z0-9-]+)"', block)):
            if ('id="' + anchor + '"') not in page_html:
                failures.append(id + ': reading-lab broken anchor #' + anchor)
        record = manifest.get('papers', {}).get(id, {})
        if not record.get('metadata_evidence') or not record.get('version') or not record.get('missing'):
            failures.append(id + ': missing pinned source evidence/status record')
        if record.get('fulltext_status') in ('verified', 'fulltext_verified'):
            failures.append(id + ': unsupported fulltext verified claim in this change')
    for term in ('"Problem"', '"Method"', '"Benchmark"', '"Contribution"', '"Gap"'):
        if js.count(term) != len(PAPERS):
            failures.append("Each paper must have exactly one " + term)
    for term in ("data-done", "localStorage.setItem", "StudyStore.set", "innerHTML"):
        if term in js:
            failures.append("New lab must not modify progress or insert raw HTML: " + term)
    for term in ('"reading-lab"', "reading-metric-result", "reading-evidence-quiz",
                 "reading-provenance", "reading-source"):
        if term not in js:
            failures.append("Missing educational widget: " + term)
    if "max-width:620px" not in css:
        failures.append("Missing mobile styles")
    if "prefers-reduced-motion:reduce" not in css:
        failures.append("Missing reduced-motion styles")
    return failures

if __name__ == "__main__":
    failures = verify()
    for line in failures:
        print("FAIL", line)
    print(f"reading-lab: {len(PAPERS)} papers, {len(failures)} static regression failures")
    sys.exit(bool(failures))
