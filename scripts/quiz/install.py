"""Give a paper page its battles: the question bank, the battle script and the BOSS chapter.

    python3 scripts/quiz/install.py <paper-id>      # once papers/<id>/quiz.js exists
    python3 scripts/stamp_assets.py

Adds, if missing: <script src="quiz.js"> and <script src="../../assets/battle.js"> before site.js; the
「BOSS：綜合挑戰」 section before the researcher analysis (or the glossary); and one more section to the
shelf card's data-total, since the BOSS chapter has a 讀完這節 box of its own. Running it twice changes
nothing.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]

BOSS = '''    <!-- ===================== boss ===================== -->
    <section class="sec sec-boss" id="s-boss" data-short="BOSS：綜合挑戰">
      <div class="sec-head"><span class="sec-num">B</span><h2>BOSS：綜合挑戰</h2></div>
      <p>這一關的題目跨好幾節：要把方法、公式和實驗放在一起想，才答得出來。題目涵蓋三個面向：方法理解、公式與情境推理、實驗批判。答錯會扣一顆心並指出該回去看哪幾節；打完不論輸贏，每題都附解答與出處，可以無限次重來。打倒 BOSS 取得這一篇的稱號。</p>
      <div class="boss-board" id="boss-board" aria-live="polite"></div>
      <div class="desk-foot">
        <label class="done"><input type="checkbox" data-done="s-boss"> 擊敗 BOSS</label>
      </div>
    </section>

'''


def main(pid: str) -> int:
    page = ROOT / "papers" / pid / "index.html"
    if not (page.parent / "quiz.js").exists():
        print(f"papers/{pid}/quiz.js is missing")
        return 1
    s = page.read_text(encoding="utf-8")
    if 'src="quiz.js' not in s:
        m = re.search(r'<script src="\.\./\.\./assets/site\.js[^"]*"></script>', s)
        s = s.replace(m.group(0), '<script src="quiz.js"></script>\n<script src="../../assets/battle.js"></script>\n' + m.group(0))
    added = 'id="s-boss"' not in s
    if added:
        m = re.search(r"    <!-- =+ researcher analysis =+ -->\n", s) or re.search(r"    <!-- =+ glossary =+ -->\n", s)
        s = s[: m.start()] + BOSS + s[m.start():]
    page.write_text(s, encoding="utf-8")
    if added:
        shelf = ROOT / "index.html"
        t = shelf.read_text(encoding="utf-8")
        pat = r'(data-progress-for="' + re.escape(pid) + r'" data-total=")(\d+)(")'
        t, n = re.subn(pat, lambda m: m.group(1) + str(int(m.group(2)) + 1) + m.group(3), t)
        assert n == 1, "shelf card not found"
        tally = re.search(r'<b id="tally-done">0 / (\d+)</b>', t)
        if tally:
            t = t.replace(tally.group(0), '<b id="tally-done">0 / ' + str(int(tally.group(1)) + 1) + "</b>")
        shelf.write_text(t, encoding="utf-8")
    print(f"papers/{pid}: battles installed" + (", BOSS chapter added" if added else ""))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1]))
