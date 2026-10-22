"""Render a paper's 研究者進階分析 section from a plain data dict, and insert it into the page."""
import re

TAG = {"orig": "原文", "derived": "推導", "assume": "本站假設", "unknown": "原文未提供"}
ST = {"yes": "已提供", "part": "部分提供", "no": "未提供", "na": "不適用", "check": "待核對"}
STR = {"strong": "充分支持", "part": "部分支持", "weak": "證據不足", "undet": "尚無法判斷"}

LEGEND = (
    '<div class="legend-r">'
    '<span><span class="tag tag-orig">原文</span> 原論文明確定義</span>'
    '<span><span class="tag tag-derived">推導</span> 可由原文合理推導</span>'
    '<span><span class="tag tag-assume">本站假設</span> 本站為了能實作而補的假設</span>'
    '<span><span class="tag tag-unknown">原文未提供</span> 原文沒有交代，無法確定</span>'
    "</div>"
)
ST_LEGEND = (
    '<div class="legend-r">'
    '<span class="st st-yes">已提供</span><span class="st st-part">部分提供</span>'
    '<span class="st st-no">未提供</span><span class="st st-na">不適用</span>'
    '<span><span class="st st-check">待核對</span> 本站尚未在原文中確認，不代表原文沒有</span>'
    "</div>"
)


def tag(kind, loc=""):
    text = TAG[kind] + (" " + loc if loc else "")
    return f'<span class="tag tag-{kind}">{text}</span>'


def st(kind):
    return f'<span class="st st-{kind}">{ST[kind]}</span>'


def strength(kind):
    return f'<span class="str str-{kind}">{STR[kind]}</span>'


def pseudo(lines):
    out = ['<ol class="pseudo">']
    for ind, code, kind, loc in lines:
        cls = f' class="ind{ind}"' if ind else ""
        out.append(f"<li{cls}>{code}{tag(kind, loc)}</li>")
    out.append("</ol>")
    return "\n".join(out)


def method_block(m):
    parts = []
    if m.get("lead"):
        parts.append(f"<p>{m['lead']}</p>")
    parts.append(LEGEND)
    if m.get("io"):
        parts.append('<div class="rcard"><dl>' + "".join(f"<dt>{k}</dt><dd>{v}</dd>" for k, v in m["io"]) + "</dl></div>")
    for title, lines in m["pseudo"]:
        parts.append(f"<h4>{title}</h4>")
        parts.append(pseudo(lines))
    for title, html in m.get("after", []):
        parts.append(f"<h4>{title}</h4>")
        parts.append(html)
    return "\n".join(parts)


def repro_block(r):
    rows = "".join(f"<tr><td>{d}</td><td>{st(k)}</td><td>{e}</td></tr>" for d, k, e in r["rows"])
    parts = []
    if r.get("lead"):
        parts.append(f"<p>{r['lead']}</p>")
    parts.append(ST_LEGEND)
    parts.append('<div class="table-wrap"><table class="repro"><thead><tr><th>維度</th><th>狀態</th><th>依據與位置</th></tr></thead>'
                 f"<tbody>{rows}</tbody></table></div>")
    for title, html in r["after"]:
        parts.append(f"<h4>{title}</h4>")
        parts.append(html)
    return "\n".join(parts)


def claims_block(c):
    parts = []
    if c.get("lead"):
        parts.append(f"<p>{c['lead']}</p>")
    parts.append('<div class="rcards">')
    for x in c["items"]:
        parts.append(
            '<div class="rcard">'
            f"<b>{x['claim']}</b>"
            "<dl>"
            f"<dt>支持證據</dt><dd>{x['evidence']}</dd>"
            f"<dt>其他解釋</dt><dd>{x['alt']}</dd>"
            f"<dt>直接測到嗎</dt><dd>{x['direct']}</dd>"
            f"<dt>未測的邊界</dt><dd>{x['boundary']}</dd>"
            f"<dt>評語</dt><dd>{strength(x['strength'])} {x['reason']}</dd>"
            "</dl></div>"
        )
    parts.append("</div>")
    return "\n".join(parts)


def hypo_block(h):
    parts = []
    if h.get("lead"):
        parts.append(f"<p>{h['lead']}</p>")
    parts.append('<div class="rcards">')
    for x in h["items"]:
        parts.append(
            '<div class="rcard">'
            f"<b>{x['title']}</b>"
            "<dl>"
            f"<dt>研究問題</dt><dd>{x['rq']}</dd>"
            f"<dt>可否證的假說</dt><dd>{x['h']}</dd>"
            f"<dt>實驗情境</dt><dd>{x['design']}</dd>"
            f"<dt>比較基線</dt><dd>{x['baseline']}</dd>"
            f"<dt>控制變因</dt><dd>{x['control']}</dd>"
            f"<dt>評估指標</dt><dd>{x['metric']}</dd>"
            f"<dt>能分辨什麼</dt><dd>{x['discriminate']}</dd>"
            f"<dt>可能失敗的條件</dt><dd>{x['fail']}</dd>"
            "</dl></div>"
        )
    parts.append("</div>")
    return "\n".join(parts)


def render(d):
    blocks = [
        ("A", "方法重建", d["method"].get("sub", "輸入輸出、狀態、步驟順序與每一步的出處"), method_block(d["method"])),
        ("B", "可重現性審查", "九個維度逐項標示，並區分「重算表格」與「重跑實驗」", repro_block(d["repro"])),
        ("C", "主張與證據", "作者主張了什麼、證據測到了多少", claims_block(d["claims"])),
        ("D", "研究延伸：可否證的假說", "研究構想，不是已驗證的貢獻", hypo_block(d["hypo"])),
    ]
    det = "\n".join(
        f'<details class="rblock" id="r-{d["id"]}-{k.lower()}"><summary><span class="rk">{k}</span>{t}<small>{sub}</small></summary>'
        f'<div class="rbody">\n{body}\n</div></details>'
        for k, t, sub, body in blocks
    )
    return f'''    <!-- ===================== researcher analysis ===================== -->
    <section class="sec sec-research" id="s-research" data-short="研究者進階分析">
      <div class="sec-head"><span class="sec-num">R</span><h2>研究者進階分析</h2></div>
      <p class="research-lede">{d["lede"]} 這篇和其他六篇的對照，見<a href="../../compare/index.html">研究工作台</a>。</p>
{det}
      <div class="desk-foot">
        <div class="note"><label for="note-research">筆記</label><textarea id="note-research" data-note="s-research" placeholder="你要重建的部分、想追的缺口、實驗構想"></textarea><span class="saved"></span></div>
      </div>
    </section>

'''


def insert(page_path, html):
    s = open(page_path, encoding="utf-8").read()
    # replace an earlier version, otherwise put it before the glossary
    old = re.search(r"    <!-- =+ researcher analysis =+ -->\n.*?</section>\n\n", s, flags=re.S)
    if old:
        s = s[: old.start()] + html + s[old.end():]
    else:
        m = re.search(r"    <!-- =+ glossary =+ -->\n", s) or re.search(r'    <section class="sec" id="s-glossary"', s)
        assert m, page_path
        s = s[: m.start()] + html + s[m.start():]
    open(page_path, "w", encoding="utf-8").write(s)
