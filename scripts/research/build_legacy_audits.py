"""Insert source-first audit cards into the seven established lessons.

Run after research/run.py and before stamp_assets.py.  The markers make reruns
idempotent while leaving the existing chapter content, quizzes and notes intact.
"""
from html import escape
from pathlib import Path
import re
import sys
from legacy_source_audits import AUDITS

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
from source_status import STATUS, render
BEGIN = "<!-- legacy-source-audit:start -->"
END = "<!-- legacy-source-audit:end -->"


def card(a):
    rows = "".join(
        f"<tr><th scope='row'>{escape(name)}</th><td>{escape(evidence)}</td><td>{escape(boundary)}</td></tr>"
        for name, evidence, boundary in a["rows"]
    )
    return f'''{BEGIN}
      <aside class="source-audit" aria-label="原文核對摘要">
        <div class="source-audit-head"><h2>先讀原文：方法、結果與證據邊界</h2><a href="{a['pdf']}" target="_blank" rel="noopener">核對 {escape(a['version'])} PDF ↗</a></div>
        <p class="source-audit-scope">原文 {a['pages']} 頁。{escape(a['scope'])}</p>
        <p>{a['core']}</p>
        <div class="table-wrap"><table class="results"><caption>本次原文核對：主張、原文單位與不能推出的結論</caption><thead><tr><th>主張</th><th>原文定位與結果</th><th>推論邊界</th></tr></thead><tbody>{rows}</tbody></table></div>
        <p>{a['boundary']}</p>
      </aside>
      {END}'''


for pid, audit in AUDITS.items():
    path = ROOT / "papers" / pid / "index.html"
    html = path.read_text(encoding="utf-8")
    html = re.sub(r"\s*<!-- legacy-source-audit:start -->.*?<!-- legacy-source-audit:end -->", "", html, count=1, flags=re.S)
    old_note = re.search(r'<p class="reading-verification-note">.*?</p>', html, flags=re.S)
    assert old_note, pid + " verification note missing"
    replacement = f'<p class="reading-verification-note">{escape(render(STATUS[pid]))}</p>'
    html = html[:old_note.start()] + replacement + html[old_note.end():]
    # The prior full-text statements are preserved as historical records, not
    # silently promoted to an independently repeated 2026 review of every page.
    claim = html.index('<div class="claim" role="note">')
    previous = re.search(r'<p>(.*?)</p>', html[claim:], flags=re.S)
    assert previous, pid + " historical claim paragraph missing"
    start = claim + previous.start(1)
    if not html[start:].startswith("既有教材先前核對紀錄："):
        html = html[:start] + "既有教材先前核對紀錄：" + html[start:]
    claim = html.index('<div class="claim" role="note">')
    html = html[:claim] + card(audit) + "\n      " + html[claim:]
    if pid == "2604.14362":
        html = html.replace("16 頁：正文約 8 頁、附錄 A–I", "20 頁：正文、參考文獻與附錄 A–I")
    if pid == "dekleer-1986-atms" and 'class="links"' not in html[:claim]:
        anchor = '<p class="authors">Johan de Kleer<br>Xerox Palo Alto Research Center（PARC）Intelligent Systems Laboratory</p>'
        assert anchor in html
        html = html.replace(anchor, anchor + '\n      <div class="links"><a href="https://doi.org/10.1016/0004-3702(86)90080-9" target="_blank" rel="noopener">期刊 DOI</a><a href="https://www.dekleer.org/Publications/An%20Assumption-Based%20TMS.pdf" target="_blank" rel="noopener">作者公開掃描 PDF</a></div>', 1)
    path.write_text(html, encoding="utf-8")
    print(pid, "source audit card updated")
