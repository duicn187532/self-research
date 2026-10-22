# Builds compare/index.html, the cross-paper research workbench, from the data below.
# Every cell links to the section of a paper page that supports it; section labels are read
# from the pages, so a renamed section shows up here on the next build.
# Statuses: y 明確設計, p 部分／間接, x 明確不做, n 未提及 (not mentioned is not "unsupported").
# A new paper needs a column in P, a cell in every DIMS row, and a look at QUESTIONS and GAPS.
import re, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]

# column order: oldest first; the survey last because it states requirements, not a method
P = [
  ("atms", "ATMS", "dekleer-1986-atms", None, "1986"),
  ("zep", "Zep", "2501.13956", "2501.13956", "2025.01"),
  ("fade", "FadeMem", "2601.18642", "2601.18642", "2026.01"),
  ("apex", "APEX-MEM", "2604.14362", "2604.14362", "2026.04"),
  ("stale", "STALE／CUPMem", "2605.06527", "2605.06527", "2026.05"),
  ("sm", "StateMem", "2608.19652", "2608.19652", "2026.08"),
  ("ao", "Always-On 綜述", "2606.30306", "2606.30306", "2026.06"),
]
PK = {k: (name, d) for k, name, d, _, _ in P}

SECS = {}
for _k, _n, _d, *_ in P:
  _t = (ROOT / "papers" / _d / "index.html").read_text(encoding="utf8")
  for m in re.finditer(r'<section class="sec[^"]*" id="([^"]+)" data-short="([^"]*)">\s*<div class="sec-head"><span class="sec-num">([^<]*)</span>', _t):
    SECS[(_d, m.group(1))] = f"{m.group(3)} {m.group(2)}"

def secname(k, sec):
  return SECS[(PK[k][1], sec)]

def L(k, sec, label=None):
  name, d = PK[k]
  return f'<a href="../papers/{d}/index.html#{sec}">{label or name}</a>'

SYM = {"y": ("●", "st-yes", "明確設計"), "p": ("◐", "st-part", "部分／間接"),
       "x": ("✕", "st-no", "明確不做"), "n": ("·", "st-na", "未提及")}

# (key, title, note, {paper: (status, text, [section ids])})
DIMS = [
("rep", "記憶表示方式", "記憶的基本單位與它帶哪些欄位。", {
 "atms": ("y", "節點、理由（命題 Horn 子句）、標籤；標籤是讓節點成立的最小假設集合（環境）。", ["s-defs", "s-labels"]),
 "zep": ("y", "三層時序知識圖譜：episode、語意實體與事實邊、社群；事實邊帶雙時間軸。", ["s-graph", "s-episode"]),
 "fade": ("y", "每筆記憶 \\(m_i=(c_i,s_i,v_i(t),\\tau_i,f_i)\\)，分 SML／LML 兩層，只差衰減形狀 \\(\\beta_i\\)。", ["s-arch"]),
 "apex": ("y", "屬性圖 \\(G=(V,E,\\Pi,\\Lambda)\\)、35 類實體本體，事實帶有效區間與證據並錨定在事件上；實作是 SQLite。", ["s-graph"]),
 "stale": ("y", "CUPMem：預先定義的 10 領域、33 槽位 schema，記憶是 \\((id,b,\\ell,v,s,\\tau,E)\\)，\\(s\\in\\){ACTIVE, STALE}。", ["s-cupmem"]),
 "sm": ("y", "狀態單元 \\(u=(id,content,priority,source,deps)\\) 加上依賴圖 \\(G=(U,E)\\)。", ["s-method"]),
 "ao": ("y", "不規定表示；用六個軸檢查任一狀態項目，Table 11 比較七種儲存基底能原生表示哪些軸。", ["s-axes", "s-sub"]),
}),
("write", "新資訊寫入方式", "新的一輪對話或觀測進來時做什麼。", {
 "atms": ("y", "問題解決器加入理由或宣告假設；ATMS 增量更新受影響節點的標籤。", ["s-algo"]),
 "zep": ("y", "LLM 從 episode 擷取實體與事實，做實體解析；事實去重只在同一對實體之間的邊裡找。", ["s-entity", "s-fact"]),
 "fade": ("y", "Eq.14：先衰減，加入新記憶，做衝突解決，再融合。", ["s-fusion"]),
 "apex": ("y", "每輪由 LLM 在 schema 約束下抽出事件，實體與屬性解析選既有或提議新的；圖只做合併，不改舊值。", ["s-extract", "s-graph"]),
 "stale": ("y", "CUPMem 抽出狀態片段、產生更新候選（ADD／REFINE／REPLACE／NO_OP），再交裁決器處理舊狀態。", ["s-cupmem"]),
 "sm": ("y", "TurnEncoder 每輪一次 LLM 呼叫，產生零到多個單元，並可標記既有單元「可能被取代」。", ["s-method"]),
 "ao": ("y", "write 先進隔離層，validate 檢查權威與出處後才升到 live（治理良好系統的要求）。", ["s-life"]),
}),
("conflict", "衝突偵測", "誰發現新舊資訊互相矛盾、在哪些候選裡找。", {
 "atms": ("p", "不自己偵測：矛盾由問題解決器以「理由 ⇒ ⊥」給出，ATMS 只維護最小 nogood。", ["s-incons", "s-algo"]),
 "zep": ("y", "LLM 比對新邊與語意相關的既有邊，找時間上重疊的矛盾；失效判斷的準確率沒有評估。", ["s-fact"]),
 "fade": ("y", "餘弦相似度高於 \\(\\theta_{\\text{sim}}\\) 的舊記憶交給 LLM 分四類（相容、矛盾、包含、被包含）。", ["s-conflict"]),
 "apex": ("x", "寫入時刻意不判定；矛盾版本並存，到查詢時由代理解析。", ["s-problem"]),
 "stale": ("y", "CUPMem 的 LLM 裁決器輸出 KEEP／STALE／REPLACE／UNKNOWN；候選含常識推測的「受影響」領域。", ["s-cupmem"]),
 "sm": ("p", "只處理明講的取代：TurnEncoder 標記可能被取代的單元；不以隱性衝突為目標。", ["s-method", "s-context"]),
 "ao": ("p", "列為 validate／update 階段的失效與評測壓力源 R2（過時狀態裁決），沒有給方法。", ["s-eval", "s-life"]),
}),
("implicit", "顯性與隱性狀態變更", "新資訊沒有明講舊值失效時（例如腿斷了 → 不能騎車）怎麼辦。", {
 "atms": ("p", "只看問題解決器給出的理由；隱性依賴必須先被寫成理由才會傳播。", ["s-context"]),
 "zep": ("p", "設計針對時間重疊的矛盾；在 STALE 上 Overall 6.0%（STALE Table 2），原因原文沒有分析。", ["s-fact"]),
 "fade": ("p", "處理語意相似的矛盾；跨屬性失效原文未提及，本站推論它不在相似度候選範圍內（見 STALE 頁 12）。", ["s-conflict"]),
 "apex": ("p", "明講的變化由代理在查詢時排序取最新；隱性衝突不在設計範圍（本站對照）。", ["s-context"]),
 "stale": ("y", "以兩條公理定義隱性衝突，分 Type I（同屬性）與 Type II（傳播）；CUPMem 以受影響領域搜尋處理 Type II。", ["s-formal", "s-taxonomy", "s-cupmem"]),
 "sm": ("p", "StateMemBench 的依賴是明講的，只測「有沒有維護好」，不測「能不能察覺」。", ["s-context"]),
 "ao": ("p", "引用 STALE 作為 validate／update 失效的診斷；沒有自己的處理方式。", ["s-context"]),
}),
("time", "時間有效性", "記錄「什麼時候成立」與「系統什麼時候知道」。", {
 "atms": ("n", "原文沒有時間概念；成立與否以假設環境表示。", ["s-defs"]),
 "zep": ("y", "雙時間軸：事件軸 \\(T\\) 的 \\(t_{\\text{valid}}, t_{\\text{invalid}}\\)，交易軸 \\(T'\\) 的建立與失效時間；\\(T'\\) 在實驗中沒有被評估。", ["s-episode", "s-fact"]),
 "fade": ("p", "時間戳 \\(\\tau_i\\) 影響衰減與矛盾壓制（Eq.10 依年齡差）；沒有有效區間。", ["s-decay", "s-conflict"]),
 "apex": ("y", "事實帶 \\([t_{\\text{from}}, t_{\\text{to}}]\\)，相對時間依 \\(t_{\\text{anchor}}\\) 正規化，時間計算由代理寫 SQL。", ["s-graph", "s-tools"]),
 "stale": ("p", "CUPMem 有時間出處 \\(\\tau_i\\)；現況以 ACTIVE／STALE 表示，不是區間。", ["s-cupmem"]),
 "sm": ("p", "有日期的資料蓋上輪次日期；附錄 E.1 的觸發條件含 date_passed。", ["s-method"]),
 "ao": ("y", "時間問責是定義的一部分；mutability 軸；舉 Engram 的雙時間圖譜為例。", ["s-thesis", "s-sub"]),
}),
("prop", "依賴關係傳播", "一個事實改變後，從它推出或依賴它的狀態怎麼跟著改。", {
 "atms": ("y", "標籤沿 consequent 遞迴傳播；原文論證為一致、可靠、完備、最小（無形式證明）。", ["s-algo", "s-labels"]),
 "zep": ("n", "原文未提及。StateMem 作者把 Zep 定位為只追蹤單一事實的有效性。", ["s-fact"]),
 "fade": ("n", "原文未提及；融合會合併相關記憶，但不是依賴傳播。", ["s-fusion"]),
 "apex": ("p", "沒有專門機制；能否處理衍生值取決於代理寫的 SQL（本站對照）。", ["s-context"]),
 "stale": ("p", "CUPMem 的拓樸觸發傳播：候選 = 直接 ∪ 受影響 ∪ 全域備援，由 LLM 推測。", ["s-cupmem"]),
 "sm": ("y", "derived_from／coupled_with 依賴邊；確定性 Rechecker 走一跳標 needs_recheck，多跳由回答時的重算指引處理。", ["s-method"]),
 "ao": ("y", "刪除傳播不變量：tombstone 要抵達摘要、嵌入、快取與所有衍生記錄。", ["s-life"]),
}),
("forget", "遺忘、歸檔、失效與刪除", "舊資訊最後的去處。", {
 "atms": ("p", "不遺忘；撤回是讓額外假設成為 nogood，只回收已確定恆真或恆假的假設。", ["s-retract", "s-impl"]),
 "zep": ("y", "失效不刪除：設定 \\(t_{\\text{invalid}}\\)，現況與歷史都保留。", ["s-fact"]),
 "fade": ("y", "強度衰減；低於 \\(\\epsilon_{\\text{prune}}\\) 或閒置超過 \\(T_{\\max}\\) 就刪除（兩個數值未提供）。", ["s-decay", "s-migrate"]),
 "apex": ("x", "只增不刪，所有版本並存。", ["s-graph"]),
 "stale": ("y", "CUPMem 把過期項目歸檔為 STALE，不刪除；舊值不安全但新值未知時標 UNKNOWN_CURRENT。", ["s-cupmem"]),
 "sm": ("y", "被取代的單元標 superseded，留著供稽核，不送進回答階段。", ["s-method"]),
 "ao": ("y", "forget 是 tombstone 加刪除傳播；衰減式遺忘不滿足刪除傳播（§4.3.2）。", ["s-life"]),
}),
("ctx", "情境或假設切換", "同時保留多個互斥的世界版本，並在它們之間切換。", {
 "atms": ("y", "核心能力：每個節點同時帶所有成立的環境，換情境只要做子集合檢驗，不必重算。", ["s-lattice", "s-labels"]),
 "zep": ("p", "可依 \\(T'\\) 問「系統當時以為什麼」、依 \\(T\\) 問「那天什麼成立」；這是時間情境，不是假設情境。", ["s-fact"]),
 "fade": ("n", "原文未提及。", ["s-arch"]),
 "apex": ("p", "所有版本並存，代理可以查任一時間的版本；沒有假設情境。", ["s-problem"]),
 "stale": ("n", "原文未提及；multi 基數的槽位允許多個有效值並存，但那不是情境。", ["s-cupmem"]),
 "sm": ("n", "原文未提及；附錄 E.1 的單元有 scope 欄位，但沒有描述切換。", ["s-method"]),
 "ao": ("p", "scope 軸與「範圍不擴張」不變量處理狀態可用在哪個使用者、任務、時間窗；不是假設切換。", ["s-axes"]),
}),
("auth", "權威與來源追溯", "誰允許這筆狀態影響行動、它從哪裡來。", {
 "atms": ("p", "每個結論可追溯到它依賴的假設與理由（informant）；沒有權威概念。", ["s-defs", "s-impl"]),
 "zep": ("p", "episode 與事實邊之間有雙向索引，可從事實追回出處（原文說沒有在實驗中檢驗）；衝突時一律採信較新的資訊。", ["s-graph", "s-fact"]),
 "fade": ("n", "保存原始文字 \\(s_i\\)，但沒有來源或權威欄位。", ["s-arch"]),
 "apex": ("p", "事實帶證據集合、信心 \\(c\\) 與說話角色。", ["s-graph"]),
 "stale": ("p", "CUPMem 的記憶帶支持證據 \\(E_i\\)；新證據有直接把舊狀態標成過期的寫入權威。", ["s-cupmem"]),
 "sm": ("p", "source 欄位記輪次與說話者；priority 分 hard／soft，硬限制優先。", ["s-method"]),
 "ao": ("y", "authority 與 provenance 是六軸中的兩軸；權威單調性、出處保存是不變量。", ["s-axes", "s-life"]),
}),
("rollback", "可逆性與回滾", "做錯的更新能不能找出來並撤回，連同它衍生的東西。", {
 "atms": ("y", "撤回以「讓可推翻性假設成為 nogood」實現，原理由仍在，可再恢復。", ["s-retract"]),
 "zep": ("p", "舊邊保留，可回看；原文沒有描述回滾操作。", ["s-fact"]),
 "fade": ("x", "刪除是設計的一部分，原文沒有歸檔或恢復機制。", ["s-migrate"]),
 "apex": ("p", "歷史全部保留；原文沒有回滾操作。", ["s-graph"]),
 "stale": ("p", "STALE 項目歸檔保留；回滾原文未提及。", ["s-cupmem"]),
 "sm": ("p", "superseded 單元保留供稽核；回滾原文未提及。", ["s-method"]),
 "ao": ("y", "recoverability 軸、rollback 階段與「回滾可追溯」不變量；435 篇語料只有 27 篇涉及回滾。", ["s-life", "s-fail"]),
}),
("answer", "檢索與回答階段的決策", "回答時怎麼決定用哪一版。", {
 "atms": ("y", "查詢是子集合檢驗：某環境是否為標籤中某環境的超集合；結果有保證。", ["s-labels"]),
 "zep": ("y", "搜尋（餘弦、BM25、BFS）→ 重排 → 組成帶有效區間的 context；哪一版有效由回答 LLM 讀區間判斷。實驗用了哪些組合原文沒寫明。", ["s-retrieval"]),
 "fade": ("p", "檢索用 top-K 與強度、重要性相關；原文沒說檢索時是否區分兩層。", ["s-arch"]),
 "apex": ("y", "ReAct 代理用四個工具查圖，查詢時解析哪一版有效（例如 SQL 取最新一筆）。", ["s-tools"]),
 "stale": ("y", "CUPMem 受限讀出：解析查詢的預設前提，驗證為 SUPPORTED／OUTDATED／UNRESOLVED，只用通過裁決的記憶。", ["s-cupmem"]),
 "sm": ("y", "確定性地組出 active 單元、旗標與重算指引，一次 LLM 回答；包裝器版只改回答提示詞。", ["s-method", "s-wrapper"]),
 "ao": ("p", "act 階段要以執行時的 permission epoch 檢查權威（AOEP）。", ["s-aoep"]),
}),
("cost", "成本與計算負荷", "原文報了什麼成本，沒報什麼。", {
 "atms": ("p", "只有論證（§4.8）與「約 30% 的假設可回收」的經驗說法，沒有量測。", ["s-retract", "s-impl"]),
 "zep": ("y", "LongMemEval 上延遲約 2.6–3.2 秒、context 約 1.6k tokens（Table 2）；建圖成本沒有報。", ["s-lme"]),
 "fade": ("p", "只報儲存（SRR 0.45、LTI-Bench 用量 55%）；每次衝突與融合都要呼叫 LLM，token 成本未報。", ["s-results"]),
 "apex": ("y", "Table 9／10 有每題 token 分解，但兩表互相矛盾（約 30,000 對 81,604）。", ["s-cost"]),
 "stale": ("p", "每筆評測成本：CUPMem 約 0.37 美元、LightMem 約 0.02 美元（附錄 C）。", ["s-setup", "s-cupmem"]),
 "sm": ("y", "每輪一次編碼呼叫，每個情境約 165–600 次；包裝器每題約多 350 tokens。", ["s-method", "s-wrapper"]),
 "ao": ("p", "轉述 TCO 研究：單純檢索以低 8.4 倍的總成本達到頂尖準確度。", ["s-sub"]),
}),
("scope", "已驗證的適用範圍", "實際做過實驗的設定；沒測過的不代表做不到。", {
 "atms": ("p", "四個手算的標籤範例；沒有實驗。", ["s-research"]),
 "zep": ("y", "DMR 與 LongMemEval_s；每個設定單次執行，沒有變異數。", ["s-dmr", "s-lme"]),
 "fade": ("y", "MSC、LoCoMo（只報 multi-hop F1）、作者自建的 LTI-Bench。", ["s-setup"]),
 "apex": ("y", "LoCoMo、LongMemEval（線上建構）、SealQA-Hard。", ["s-locomo", "s-lme"]),
 "stale": ("p", "CUPMem 只在 STALE 上評估，沒有留出集，也沒有在一般記憶評測上檢查。", ["s-cupmem"]),
 "sm": ("y", "StateMemBench、LongMemEval、LoCoMo；兩個骨幹，單次執行。", ["s-results", "s-recall"]),
 "ao": ("p", "AOEP-v0 是試點：九種故障模式、固定讀取模型，作者明說不是 benchmark。", ["s-aoep"]),
}),
]

def badge(st):
  sym, cls, lab = SYM[st]
  return f'<span class="st {cls}" title="{lab}">{sym} {lab}</span>'

def overview():
  head = "".join(f'<th scope="col">{name}</th>' for _, name, *_ in P)
  rows = []
  for key, title, note, cells in DIMS:
    tds = "".join(
      f'<td class="mx-{cells[k][0]}" title="{SYM[cells[k][0]][2]}"><a href="#d-{key}">{SYM[cells[k][0]][0]}</a></td>'
      for k, *_ in P)
    rows.append(f'<tr><th scope="row"><a href="#d-{key}">{title}</a></th>{tds}</tr>')
  return ('<div class="table-wrap"><table class="matrix"><thead><tr><th scope="col">維度</th>' + head +
          '</tr></thead><tbody>' + "".join(rows) + '</tbody></table></div>')

def dim_blocks():
  out = []
  for i, (key, title, note, cells) in enumerate(DIMS, 1):
    items = []
    for k, name, d, *_ in P:
      st, text, secs = cells[k]
      src = "、".join(L(k, s, secname(k, s)) for s in secs)
      items.append(f'<li><div class="mx-who"><b>{L(k, secs[0], name)}</b>{badge(st)}</div><p>{text}</p><p class="mx-src">見 {src}</p></li>')
    out.append(f'<details class="rblock" id="d-{key}"><summary><span class="rk">{i:02d}</span>{title}<small>{note}</small></summary>'
               f'<div class="rbody"><ul class="mx-list">{"".join(items)}</ul></div></details>')
  return "\n".join(out)

BENCH = [
 ("LoCoMo", [
  ("FadeMem", "multi-hop F1 29.43", "只報多跳題；F1", L("fade", "s-results", "FadeMem Table 3")),
  ("APEX-MEM", "88.88%（GPT5 回答）", "LLM 判定準確率，含對抗題", L("apex", "s-locomo", "APEX Table 1")),
  ("Zep", "75.14%", "不含對抗題；APEX 轉引，不是 Zep 原文", L("apex", "s-cost", "APEX Table 9")),
  ("StateMem", "0.592（DeepSeek）／0.566（Qwen）", "gold 比例，n = 1,985", L("sm", "s-recall", "StateMem Table 4")),
 ]),
 ("LongMemEval", [
  ("Zep", "71.2%（gpt-4o）", "LongMemEval_s，Zep 原文", L("zep", "s-lme", "Zep Table 2")),
  ("APEX-MEM", "86.2%（Sonnet 4.5）", "線上建構：先看問題再建圖", L("apex", "s-lme", "APEX Table 4")),
  ("StateMem", "0.580（Qwen）／0.656（DeepSeek）", "n = 500，k = 20", L("sm", "s-recall", "StateMem Table 4")),
 ]),
 ("STALE", [
  ("Zep", "6.0%", "六欄平均；骨幹統一 GPT-4o-mini", L("stale", "s-results", "STALE Table 2")),
  ("CUPMem", "68.0%", "同上；在同一評測上設計與評估", L("stale", "s-results", "STALE Table 2")),
  ("LightMem", "17.8%", "同上", L("stale", "s-results", "STALE Table 2")),
 ]),
 ("StateMemBench", [
  ("StateMem", "0.363（DeepSeek）／0.233（Qwen）", "gold 比例，n = 322", L("sm", "s-results", "StateMem Table 3")),
  ("LightMem", "0.012（DeepSeek）", "約 60% 是非答案", L("sm", "s-context", "StateMem 14")),
 ]),
]

def bench_table():
  rows = []
  for bench, items in BENCH:
    for j, (sysname, score, cond, src) in enumerate(items):
      first = f'<th scope="rowgroup" rowspan="{len(items)}">{bench}</th>' if j == 0 else ""
      rows.append(f'<tr>{first}<td>{sysname}</td><td class="num">{score}</td><td>{cond}</td><td>{src}</td></tr>')
  return ('<div class="table-wrap"><table class="bench-tbl"><thead><tr><th scope="col">評測</th><th scope="col">系統</th>'
          '<th scope="col">報告的數字</th><th scope="col">條件</th><th scope="col">出處</th></tr></thead><tbody>' +
          "".join(rows) + '</tbody></table></div>')

QST = {"solved": ("st-yes", "已有解法"), "part": ("st-part", "部分"), "gap": ("st-no", "證據缺口")}
QUESTIONS = [
("q-when", "舊記憶什麼時候算失效？誰來判斷？", "part",
 "七篇在不同時間點判斷：寫入時由 LLM 判斷（" + L("zep", "s-fact") + "、" + L("stale", "s-cupmem", "CUPMem") + "）、持續衰減（" + L("fade", "s-decay") + "）、查詢時由代理判斷（" + L("apex", "s-problem") + "）、寫入時確定性標記並在回答時重算（" + L("sm", "s-method") + "），以及 ATMS 的「隨時、以標籤表示」（" + L("atms", "s-labels") + "）。",
 "各自有解法，但沒有一個評測在同一條件下比較這幾種時間點。Zep 只在 STALE 受測，APEX-MEM 和 FadeMem 都沒有在 STALE 或 StateMemBench 上受測。"),
("q-delete", "失效的記憶該刪除還是保留？", "gap",
 L("fade", "s-migrate") + " 刪除以控制容量；" + L("zep", "s-fact") + "、" + L("apex", "s-graph") + "、" + L("stale", "s-cupmem", "CUPMem") + "、" + L("sm", "s-method") + " 都保留。" + L("ao", "s-life") + " 要求刪除必須傳播到衍生記錄，並指出衰減不等於刪除。",
 "沒有論文在同一評測下比較刪除與保留對準確性、儲存與稽核的影響。FadeMem 在 LTI-Bench 有 17.9% 的關鍵事實沒有保留，原文沒有錯誤分析。"),
("q-dissimilar", "與新資訊語意不相似的舊記憶，要怎麼被找到？", "part",
 L("stale", "s-taxonomy") + " 的 Type II 正是這種情況（腿斷了 → 騎車通勤）。" + L("zep", "s-fact") + " 與 " + L("fade", "s-conflict") + " 都從語意相似的候選裡找衝突；" + L("stale", "s-cupmem", "CUPMem") + " 加上常識推測的受影響領域；" + L("sm", "s-method") + " 與 " + L("atms", "s-algo") + " 依靠明確記錄的依賴。",
 "CUPMem 在 STALE 上有提升，但 schema 與評測同源、沒有留出集；依賴從哪裡來（抽取品質）在七篇中都沒有單獨評估。"),
("q-contexts", "多個互斥的情境能不能並存？", "gap",
 L("atms", "s-lattice") + " 的核心就是同時維護多個一致的假設環境。" + L("zep", "s-fact") + " 的兩條時間軸與 " + L("apex", "s-problem") + " 的版本並存只涵蓋時間情境。",
 "本站的六篇 LLM 記憶論文都沒有評測假設情境（例如「如果我搬去台中，通勤怎麼辦」）；ATMS 有機制但沒有量測。"),
("q-reuse", "切換回先前的情境時，之前的推論能不能直接重用？", "gap",
 L("atms", "s-limits") + " 把「切換情境就要重算」列為傳統 TMS 的限制之一，標籤讓推論在任何環境下都可以重用。" + L("sm", "s-method") + " 與 " + L("apex", "s-tools") + " 都在每次回答時重新推算。",
 "沒有任何一篇量測重用帶來的節省或正確性差異；ATMS 的效率主張本身也沒有量測（見 " + L("atms", "s-research", "ATMS 研究者分析 C") + "）。"),
("q-tradeoff", "準確性、容量、成本、可恢復性之間怎麼取捨？", "part",
 L("fade", "s-results") + " 用 55% 儲存換到較高的保留率；" + L("apex", "s-cost") + " 的 token 大多花在代理迴圈；" + L("stale", "s-cupmem", "CUPMem") + " 每筆成本約 LightMem 的 18 倍；" + L("sm", "s-wrapper") + " 發現對話放得進 context 時，只改回答提示詞的包裝器勝過完整的 StateMem；" + L("ao", "s-mech") + " 提出可證偽的「受控複利」準則。",
 "每篇各報一兩個維度，沒有共同的成本帳。可恢復性在七篇中只有 Always-On 的 AOEP 試點量過。"),
]

GAPS = [
("g-exp", "已有方法、缺實驗", "方法已經寫出來，但支撐它的關鍵實驗不在原文中。", [
 ("Zep 的三種搜尋與五種重排，實驗用了哪些組合、各貢獻多少，原文沒有寫明也沒有消融。", L("zep", "s-retrieval", "Zep 07")),
 ("FadeMem 刪除造成的關鍵事實流失沒有錯誤分析；衝突解決 Acc. 的「正確策略」如何定義也沒有說明。", L("fade", "s-results", "FadeMem 09")),
 ("APEX-MEM 的「只增不刪＋查詢時解析」沒有和寫入時失效在同一設定下比較，也沒有在隱性衝突上測。", L("apex", "s-context", "APEX-MEM 13")),
 ("CUPMem 沒有留出集，也沒有在一般記憶評測上檢查是否傷害回想。", L("stale", "s-cupmem", "STALE 10")),
 ("StateMem 作者說持久化儲存在對話放不下 context 時才有用，這個條件沒有被直接測試。", L("sm", "s-wrapper", "StateMem 11")),
 ("ATMS「對許多任務更有效率」與「上千個假設仍實用」都沒有量測。", L("atms", "s-research", "ATMS 研究者分析")),
 ("AOEP 沒有跑「抽取事實的儲存加上最小治理外殼」消融，無法分辨是架構極限還是缺少儀器。", L("ao", "s-aoep", "Always-On 11")),
]),
("g-method", "已有評測、缺方法", "評測已經揭露了問題，但本站七篇中還沒有方法把它解決。", [
 ("STALE 的 IPA（不給前提、要主動用上新狀態）：CUPMem 只有 32.0／43.0，低於 Gemini-3.1-pro 的 71.0／55.0。", L("stale", "s-results", "STALE 07")),
 ("StateMemBench 的 salience 類（安靜的事實被響亮的蓋過）：Qwen 上每一組都不超過 0.18。", L("sm", "s-results", "StateMem 08")),
 ("Always-On 的 R6（壞記憶之後的恢復）幾乎沒有評測，AOEP 試點中三個原始儲存系統的義務分數都只有 7/15。", L("ao", "s-eval", "Always-On 09")),
]),
("g-comp", "互補方法", "各自只解決一半的問題，合起來可能更完整。是否真的互補要靠實驗。", [
 ("STALE／CUPMem 處理「察覺」隱性衝突，StateMem 處理明講依賴的「維護」。StateMem 頁的對照稱兩者合起來才是完整的狀態追蹤。", L("sm", "s-context", "StateMem 14") + "、" + L("stale", "s-gap", "STALE 09")),
 ("ATMS 的標籤管理加上 LLM 抽取理由與 nogood：讓「哪一版有效」變成可驗證的子集合檢驗。", L("atms", "s-context", "ATMS 13")),
 ("Zep 的雙時間軸加上 StateMem 的依賴邊：前者知道單一事實何時有效，後者知道誰依賴誰。", L("sm", "s-problem", "StateMem 01")),
 ("Always-On 的五個不變量可以當成任何記憶系統的檢查器，AOEP 已示範如何寫成確定性檢查。", L("ao", "s-aoep", "Always-On 11")),
]),
("g-trade", "未解決的取捨", "兩邊都有道理，原文的證據還不足以決定。", [
 ("寫入時裁決（Zep、CUPMem）對查詢時解析（APEX-MEM、StateMemWrapper）：前者查詢便宜但判錯就丟資訊，後者保留全部但每次回答都要付成本。", L("apex", "s-problem", "APEX-MEM 01")),
 ("刪除省空間對保留可稽核：FadeMem 刪除，Always-On 要求刪除傳播與回滾可追溯。", L("fade", "s-migrate", "FadeMem 05") + "、" + L("ao", "s-life", "Always-On 05")),
 ("LLM 判斷對確定性傳播：CUPMem 用 LLM 裁決，StateMem 的 Rechecker 與 ATMS 的標籤是確定性的；前者表示力強、後者有保證。", L("sm", "s-method", "StateMem 06") + "、" + L("atms", "s-context", "ATMS 13")),
 ("全文 context 對記憶系統：LoCoMo 上同用 GPT4o，全文 87.52% 高於 APEX-MEM 86.75%；StateMem 的包裝器勝過 StateMem 本身；Always-On 也整理了「基線勝過記憶」的結果。", L("apex", "s-locomo", "APEX-MEM 09") + "、" + L("sm", "s-wrapper", "StateMem 11") + "、" + L("ao", "s-mech", "Always-On 08")),
]),
("g-hypo", "待驗證的假說", "各篇「研究者進階分析」D 區塊提出的構想，都還沒有被驗證，是研究構想而不是貢獻。", [
 ("只增不刪本身值多少？查詢時解析的錯誤是不是集中在排序欄位？", L("apex", "r-apex-d", "APEX-MEM D")),
 ("多跳增益來自融合還是遺忘？話題切換會讓長期約束被忘掉嗎？", L("fade", "r-fademem-d", "FadeMem D")),
 ("CUPMem 的 PR 提升來自寫入端還是讀取端？增益是否依賴 schema 對評測類別的覆蓋？", L("stale", "r-stale-d", "STALE D")),
 ("持久儲存庫什麼時候才必要？助理回想的掉分來自 TurnEncoder 的偏重嗎？", L("sm", "r-statemem-d", "StateMem D")),
 ("LongMemEval 的提升來自壓縮還是圖結構？「新資訊優先」會不會把回憶往事誤判為更新？", L("zep", "r-zep-d", "Zep D")),
 ("抽取式記憶缺的是欄位，還是架構本身就做不到？外部副作用的回滾有多少研究？", L("ao", "r-alwayson-d", "Always-On D")),
 ("ATMS 當一致性層能不能減少多跳狀態漂移？對話記憶的依賴結構是否落在 ATMS 的實用區？", L("atms", "r-atms-d", "ATMS D")),
]),
]

def gap_blocks():
  out = []
  for gid, title, note, items in GAPS:
    lis = "".join(f'<li><p>{t}</p><p class="mx-src">見 {src}</p></li>' for t, src in items)
    out.append(f'<details class="rblock" id="{gid}" open><summary>{title}<small>{note}</small></summary>'
               f'<div class="rbody"><ul class="mx-list gap-list">{lis}</ul></div></details>')
  return "\n".join(out)

def q_blocks():
  out = []
  for qid, q, st, have, gap in QUESTIONS:
    cls, lab = QST[st]
    out.append(f'<div class="rcard" id="{qid}"><h3>{q}</h3><p><span class="st {cls}">{lab}</span></p>'
               f'<dl><dt>七篇怎麼處理</dt><dd>{have}</dd><dt>還缺什麼</dt><dd>{gap}</dd></dl></div>')
  return '<div class="rcards">' + "\n".join(out) + '</div>'

def sources():
  rows = []
  titles = {
   "atms": ("An assumption-based TMS", "de Kleer, <i>Artificial Intelligence</i> 28 (1986) 127–162；期刊論文，沒有 arXiv 版"),
   "zep": ("Zep: A Temporal Knowledge Graph Architecture for Agent Memory", None),
   "fade": ("FadeMem", None), "apex": ("APEX-MEM", None), "stale": ("STALE", None),
   "sm": ("Can Agent Memory Systems Track Evolving State?", None), "ao": ("Always-On Agents 綜述", None),
  }
  for k, name, d, ax, date in P:
    page = f'<a href="../papers/{d}/index.html">精讀頁</a>　<a href="../papers/{d}/index.html#s-research">研究者分析</a>'
    orig = (f'<a href="https://arxiv.org/abs/{ax}" target="_blank" rel="noopener">arXiv {ax}</a>' if ax
            else titles["atms"][1])
    rows.append(f'<tr><th scope="row">{name}</th><td>{date}</td><td>{orig}</td><td>{page}</td></tr>')
  return ('<div class="table-wrap"><table class="bench-tbl"><thead><tr><th scope="col">論文</th><th scope="col">時間</th>'
          '<th scope="col">原文</th><th scope="col">本站</th></tr></thead><tbody>' + "".join(rows) + '</tbody></table></div>')

home = (ROOT / "index.html").read_text(encoding="utf8")
headblock = home[: home.index("</head>")]
MJ = """<script>
  window.MathJax = {
    tex: { inlineMath: [["\\\\(", "\\\\)"]], displayMath: [["\\\\[", "\\\\]"]] },
    svg: { fontCache: "global" }
  };
</script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-svg.min.js"></script>
"""
headblock = headblock.replace('href="assets/', 'href="../assets/').replace("<title>論文精讀室</title>", "<title>研究工作台 · 論文精讀室</title>")
js = re.search(r'<script src="assets/site\.js\?v=\w+"></script>', home).group(0).replace('src="assets/', 'src="../assets/')

legend = "".join(f'<span>{badge(s)}</span>' for s in "ypxn")

html = f"""{headblock}{MJ}</head>
<body>

<header class="toolbar gutter">
  <div class="toolbar-inner">
    <a class="home" href="../index.html">論文精讀室</a>
    <span class="crumb">研究工作台</span>
  </div>
</header>

<main class="gutter">
<div class="bench">

  <div class="paper-head">
    <div class="eyebrow"><span>跨論文比較</span><span>7 篇</span><span>每一格都連回原頁的章節</span></div>
    <h1>研究工作台</h1>
    <p>把書架上七篇論文放在同一張表上：它們怎麼表示記憶、怎麼處理過期的資訊、各自驗證到哪裡，以及合起來還留下哪些問題。用來找研究題目與設計實驗，不用來排名。</p>
    <div class="claim" role="note">
      <span class="claim-label">怎麼讀這一頁</span>
      <p>這一頁的每個判斷都出自各篇精讀頁（已對照全文的內容），點格子裡的連結可以回到出處。<b>「未提及」不等於「不支援」</b>：原文沒寫，只表示我們無法從原文確認。不同評測、不同回答模型、不同評分方式的分數<b>不能互相排名</b>。下面的缺口只在本站這七篇的範圍內成立，<b>不代表整個領域沒有人做過，也不是新穎性的主張</b>。</p>
    </div>
    <nav class="bench-toc" aria-label="本頁目錄">
      <a href="#c-matrix">方法矩陣</a><a href="#c-bench">評測數字</a><a href="#c-questions">跨論文問題</a><a href="#c-gaps">研究缺口地圖</a><a href="#c-sources">原文連結</a>
    </nav>
  </div>

  <section class="sec" id="c-matrix">
    <div class="sec-head"><span class="sec-num">01</span><h2>方法矩陣：13 個維度</h2></div>
    <p>先看總覽，再點維度名稱展開每篇的說明與出處。Always-On 是綜述，它那一欄表示該維度是否被列為明確的分析軸或要求，不表示有實作。STALE 那一欄說的是它的原型 CUPMem。</p>
    <div class="legend-r">{legend}</div>
    {overview()}
    <p class="mx-hint">表格可以左右滑動；點符號或維度名稱跳到下面的說明。</p>
    <div class="mx-dims">
{dim_blocks()}
    </div>
  </section>

  <section class="sec" id="c-bench">
    <div class="sec-head"><span class="sec-num">02</span><h2>同一個評測名稱，不同的數字</h2></div>
    <p>同一個評測在不同論文裡用的子集、指標、回答模型、評分方式都不一樣。下表把數字並排，是為了讓這些差異看得見，<b>不是為了比較高低</b>。只有同一篇論文、同一張表、同一個條件下的數字可以互比。</p>
    {bench_table()}
    <p class="mx-src">例如 LoCoMo：FadeMem 報的是多跳題的 F1，APEX-MEM 報的是 LLM 判定的準確率且含對抗題，StateMem 報的是 gold 比例；Zep 的 75.14% 是 APEX-MEM 轉引的不含對抗題數字，回答模型與評分方式都和 Zep 原文不同。</p>
  </section>

  <section class="sec" id="c-questions">
    <div class="sec-head"><span class="sec-num">03</span><h2>跨論文的研究問題</h2></div>
    <p>六個問題，每個都列出七篇怎麼處理、還缺什麼。標記的意思：<span class="st st-yes">已有解法</span> 有方法且有對應實驗；<span class="st st-part">部分</span> 有方法，但證據只涵蓋部分條件；<span class="st st-no">證據缺口</span> 本站七篇中沒有可以回答它的實驗。</p>
    {q_blocks()}
  </section>

  <section class="sec" id="c-gaps">
    <div class="sec-head"><span class="sec-num">04</span><h2>研究缺口地圖</h2></div>
    <p>分成五類。每一條都附出處；這些是讀七篇原文後整理出的觀察，<b>不保證本站以外的文獻沒有做過</b>。拿來當研究題目之前，請先做文獻搜尋。</p>
{gap_blocks()}
  </section>

  <section class="sec" id="c-sources">
    <div class="sec-head"><span class="sec-num">05</span><h2>原文與精讀頁</h2></div>
    {sources()}
    <div class="desk-foot">
      <div class="note"><label for="note-bench">研究筆記</label><textarea id="note-bench" data-bench-note placeholder="比較時想到的研究題目、要查的文獻……"></textarea><span class="saved"></span></div>
    </div>
  </section>

</div>
</main>

{js}
</body>
</html>
"""
(ROOT / "compare").mkdir(exist_ok=True)
(ROOT / "compare" / "index.html").write_text(html, encoding="utf8")
print("ok", len(html))
