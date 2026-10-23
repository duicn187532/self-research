/* Critical reading layer: no localStorage writes; no change to legacy progress/quiz keys.
   Each paper claim links to its chapter and official abstract; research gaps are SITE QUESTIONS.
   No paper-specific numbers are manufactured here. */
(function () {
  "use strict";
  var script = document.currentScript;
  var base = script ? script.src : "";
  var PA = {
    "2501.13956": {
      short: "Zep", version: "v1",
      dims: [
        ["靜態檢索難以回應對話與業務資料持續變動的知識。", "s-problem", "作者問題陳述"],
        ["以 Graphiti 建立時間感知的實體、事實關係與事件記錄，於查詢時檢索。", "s-graph", "作者方法描述"],
        ["DMR 與 LongMemEval：應先看資料分布、基線實作與延遲測量方式。", "s-setup", "本站判讀重點"],
        ["提出持續更新的時序圖記憶服務；優於特定基線屬作者報告的實驗發現。", "s-dmr", "作者主張與結果"],
        ["候選問題：發現隱性跨屬性失效時，時間邊的修訂足夠嗎？尚非已證實缺口。", "s-critique", "本站研究提問"]
      ]
    },
    "2601.18642": {
      short: "FadeMem", version: "v2",
      dims: [
        ["Agent 記憶要避免一律保留的負荷，也不能在上下文截斷時全忘。", "s-problem", "作者問題陳述"],
        ["雙層記憶、差異化時間衰減、衝突處理與語意融合共同決定保留內容。", "s-anim", "作者方法描述"],
        ["Multi-Session Chat、LoCoMo 與 LTI-Bench；需區分任務效果、儲存量與消融。", "s-setup", "本站判讀重點"],
        ["提出選擇性遺忘架構；準確率與記憶壓縮效益是作者在測試設定下報告。", "s-results", "作者主張與結果"],
        ["候選問題：世界狀態切換時，時間衰減和來源權威如何共同決策？未驗證新穎性。", "s-critique", "本站研究提問"]
      ]
    },
    "2604.14362": {
      short: "APEX-MEM", version: "v1",
      dims: [
        ["長期對話記憶的雜訊、時間演變與矛盾資訊讓直接檢索不穩定。", "s-problem", "作者問題陳述"],
        ["事件錨定的屬性圖、只追加的歷史、代理於查詢時使用工具解決衝突。", "s-graph", "作者方法描述"],
        ["LoCoMo、LongMemEval 等；需比較工具使用成本及是否採相同答案模型。", "s-setup", "本站判讀重點"],
        ["結合事件中心結構與查詢期裁決；結果依論文的評估協議解讀。", "s-tools", "作者主張與結果"],
        ["候選問題：保留全部版本時如何阻止錯誤前提被採用？僅為延伸假說。", "s-critique", "本站研究提問"]
      ]
    },
    "2605.06527": {
      short: "STALE", version: "v1",
      dims: [
        ["新事件可能不直接否定舊記憶，卻使它不再有效：隱性衝突。", "s-problem", "作者問題陳述"],
        ["設計 STALE 探測三個能力面向，並以 CUPMem 示範結構化狀態裁決。", "s-probe", "作者方法描述"],
        ["STALE 的情境與探測任務；檢視評分、記憶框架設定、Type I／II 分層。", "s-build", "本站判讀重點"],
        ["提供失效記憶診斷基準與原型；診斷失敗率不等於已證實失效原因。", "s-results", "本站判讀重點"],
        ["候選問題：依賴關係與權威衝突能否以可檢驗的傳播規則處理？非原文結論。", "s-critique", "本站研究提問"]
      ]
    },
    "2606.30306": {
      short: "Always-On", version: "v1",
      dims: [
        ["長期運作的 Agent 不只需要記憶檢索，還需管理承諾、權限及外部動作。", "s-thesis", "作者問題陳述"],
        ["綜述以六個狀態軸與生命週期分類既有工作，並提出 AOEP 試行評估協議。", "s-axes", "作者框架描述"],
        ["文獻編碼與 AOEP pilot；文獻地圖不是受控方法比較，應另檢查採樣偏差。", "s-corpus", "本站判讀重點"],
        ["貢獻是系統化分類與治理評估合約，不宜當作完成部署的記憶演算法。", "s-aoep", "本站判讀重點"],
        ["候選問題：記憶撤回怎樣連動外部已提交動作的審計與回滾？需查更多文獻。", "s-front", "本站研究提問"]
      ]
    },
    "2608.19652": {
      short: "StateMem", version: "v1",
      dims: [
        ["記憶即使找回舊資訊，仍可能錯誤地回答目前已更新的世界狀態。", "s-problem", "作者問題陳述"],
        ["StateMem 維護狀態單元、取代關係與依賴；StateMemBench 測量狀態追蹤。", "s-method", "作者方法描述"],
        ["StateMemBench 以封閉選項池判斷當前狀態；需看相同骨幹與長度成本控制。", "s-bench", "本站判讀重點"],
        ["提出狀態優先的記憶方法和專門基準，報告在指定模型與設定下的改善。", "s-results", "作者主張與結果"],
        ["候選問題：當新資訊只有間接影響時，系統何時應撤回下游假設？尚待實驗。", "s-critique", "本站研究提問"]
      ]
    },
    "dekleer-1986-atms": {
      short: "ATMS", version: "1986 journal",
      dims: [
        ["在多個互斥假設情境下維護推論，而不是只保存單一目前真值。", "s-tms", "本站既有全文整理"],
        ["以環境、理由、最小標籤與 nogood 增量更新命題的成立條件。", "s-algo", "本站既有全文整理"],
        ["偏向演算法例證與實作分析；不可直接拿現代 LLM QA 準確率跨時代比較。", "s-impl", "本站判讀重點"],
        ["提供在多假設下追蹤一致性與相依推論的架構，並非 LLM 記憶評測。", "s-labels", "本站既有全文整理"],
        ["候選問題：將假設相依追蹤用於 Agent 記憶會有何組合爆炸成本？非原文實驗。", "s-retract", "本站研究提問"]
      ]
    }
  };
  var IDS = ["Problem", "Method", "Benchmark", "Contribution", "Gap"];
  var NAMES = ["問題", "方法", "評測", "貢獻", "候選缺口"];
  var source = {
    "2501.13956": "https://arxiv.org/abs/2501.13956v1",
    "2601.18642": "https://arxiv.org/abs/2601.18642v2",
    "2604.14362": "https://arxiv.org/abs/2604.14362v1",
    "2605.06527": "https://arxiv.org/abs/2605.06527v1",
    "2606.30306": "https://arxiv.org/abs/2606.30306v1",
    "2608.19652": "https://arxiv.org/abs/2608.19652v1"
  };
  // These statuses describe THIS audit, not the historical claims in existing page headers.
  var evals = [
    {
      q: "示意：A 方法在測試資料上比 B 高 8 個百分點，但二者使用不同的回答模型。可以得出什麼？",
      choices: ["A 方法一定導致提升", "只看到整套配置的表現差異", "A 在所有資料集均優"],
      correct: 1,
      why: "觀測到的是配置間的差異；回答模型不同是混雜因素，不能直接歸因於記憶方法。"
    },
    {
      q: "示意：移除時間校驗模組，其他設定固定，準確率下降。最合理的解讀？",
      choices: ["支援這個模組在本次設定下有貢獻", "證明所有資料集都需要它", "證明不存在其他失敗原因"],
      correct: 0,
      why: "消融控制有助於判定組件作用，但仍有樣本不確定性、交互作用與外部效度限制。"
    },
    {
      q: "論文沒有報告某項實驗，能否把它直接列為作者方法未解決的缺口？",
      choices: ["可以，未報告就是做不到", "不可以，必須先界定未測邊界並檢索相關工作", "可以，因為論文未測即反證其方法"],
      correct: 1,
      why: "未報告只表示目前無證據。研究缺口需經文獻與實驗界定；不可將沉默轉為否定。"
    }
  ];
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function link(url, caption) {
    var a = el("a", "", caption);
    a.href = url;
    if (/^https:/.test(url)) { a.target = "_blank"; a.rel = "noopener"; }
    return a;
  }
  function txt(parent, tag, cls, content) {
    var n = el(tag, cls, content); parent.appendChild(n); return n;
  }
  function makePractice() {
    var details = el("details", "cr-practice");
    details.appendChild(el("summary", "", "Benchmark 推理練習（3 題，選擇作答）"));
    var wrap = el("div", "cr-practice-body");
    txt(wrap, "p", "cr-caption", "以下皆為本站示意情境，並非任何論文的實際數據。選擇後立即顯示理由，作答不記錄、不影響 EXP。");
    evals.forEach(function (q, i) {
      var item = el("fieldset", "cr-question");
      item.appendChild(el("legend", "", (i + 1) + "．" + q.q));
      var buttons = el("div", "cr-options");
      var feedback = el("p", "cr-feedback"); feedback.setAttribute("role", "status");
      q.choices.forEach(function (c, j) {
        var b = el("button", "btn", c);
        b.type = "button";
        b.addEventListener("click", function () {
          Array.prototype.forEach.call(buttons.children, function (other) {
            other.setAttribute("aria-pressed", String(other === b));
          });
          feedback.textContent = (j === q.correct ? "✓ 判讀正確。" : "尚未正確。") + q.why;
          feedback.dataset.correct = String(j === q.correct);
        });
        buttons.appendChild(b);
      });
      item.appendChild(buttons); item.appendChild(feedback); wrap.appendChild(item);
    });
    var fair = el("fieldset", "cr-question");
    fair.appendChild(el("legend", "", "公平性檢核：以下哪些條件已在論文中查核一致？"));
    txt(fair, "p", "cr-caption", "逐項勾選「確認一致」，不是認定一定公平；未查核就不要勾。");
    var counter = el("p", "cr-feedback"); counter.setAttribute("role", "status");
    var labels = ["Dataset 與測試切分", "回答模型及版本", "Metric 與評分規則", "檢索、token／計算預算", "統計變異與重複試驗"];
    var boxes = [];
    labels.forEach(function (name) {
      var lab = el("label", "cr-checkbox");
      var input = el("input"); input.type = "checkbox"; boxes.push(input);
      input.addEventListener("change", update);
      lab.appendChild(input); lab.appendChild(document.createTextNode(" " + name));
      fair.appendChild(lab);
    });
    function update() {
      var n = boxes.filter(function (b) { return b.checked; }).length;
      counter.textContent = n + "/5 項已確認。" + (n === 5 ?
        " 條件較可比較；因果推斷仍需要控制、消融與不確定性評估。" :
        " 未確認的條件不能假定相同，暫不可把結果差異歸因於單一方法。");
    }
    update(); fair.appendChild(counter);
    wrap.appendChild(fair); details.appendChild(wrap);
    return details;
  }
  function renderPaper(id) {
    var data = PA[id], head = document.querySelector(".column > .paper-head");
    if (!data || !head || document.getElementById("critical-five")) return;
    var card = el("section", "cr-card"); card.id = "critical-five";
    card.setAttribute("aria-label", "五維精讀導航");
    txt(card, "h2", "cr-heading", "五維精讀總結 · " + data.short);
    txt(card, "p", "cr-caption", "先用這五個問題建立理解，再點進原本的三層解釋、方法動畫、數據及研究者分析。摘要是導讀，不代替閱讀原文。");
    var notice = el("div", "cr-audit");
    txt(notice, "strong", "", "來源範圍");
    notice.appendChild(document.createTextNode(source[id] ?
      " 本次核對官方 arXiv 摘要頁之書目與版本；未重新逐頁核對全文 PDF、公式、表格或圖。頁面原有「已核對」為先前教材的核對聲明，不等於本次重審完成。" :
      " 原頁記載曾依使用者提供的掃描 PDF 核對；本次無法重新取得該原始檔，公式、頁面影像與數字仍待複核。"));
    var origin = source[id] ? link(source[id], "開啟指定版本摘要") : link("https://doi.org/10.1016/0004-3702(86)90080-9", "期刊 DOI（版本待核）");
    notice.appendChild(document.createTextNode("　")); notice.appendChild(origin);
    card.appendChild(notice);
    var grid = el("div", "cr-grid");
    data.dims.forEach(function (entry, i) {
      var tile = el("article", "cr-dim");
      txt(tile, "h3", "", IDS[i] + " ／ " + NAMES[i]);
      txt(tile, "p", "", entry[0]);
      var foot = el("p", "cr-ref");
      foot.appendChild(el("span", "cr-kind", entry[2] + " · "));
      foot.appendChild(link("#" + entry[1], "前往章節 ↗"));
      if (source[id] && i !== 4) {
        foot.appendChild(document.createTextNode(" · "));
        foot.appendChild(link(source[id], "原始摘要"));
      }
      tile.appendChild(foot);
      grid.appendChild(tile);
    });
    card.appendChild(grid);
    var guide = el("details", "cr-method");
    guide.appendChild(el("summary", "", "研究生讀法：如何判定已經讀懂？"));
    var g = el("ol");
    ["Problem：能指出現有方法失效的情境，而非只背研究動機。",
     "Method：能沿章節動畫說清輸入、更新次序、狀態與輸出；公式能解釋符號及假設。",
     "Benchmark：能說明資料集、基線、指標、消融與公平性，區分觀測與因果。",
     "Contribution：說明作者提出的方法或基準，與實驗結果、作者主張分開。",
     "Gap：指出原文有證據的限制與未測邊界；候選研究問題要另做文獻檢索。"
    ].forEach(function (x) { g.appendChild(el("li", "", x)); });
    guide.appendChild(g); card.appendChild(guide);
    card.appendChild(makePractice());
    // Append INSIDE paper-head, no .sec and no data-done to preserve original counts and save keys.
    head.appendChild(card);
  }
  var PAIRS = [
    ["FadeMem × StateMem", "一者以保留／遺忘負荷為重點；一者測當前狀態的取代與相依。", "當世界狀態改變，時間衰減能否與顯式取代協同？", "不同任務與回答模型不得直接比分數。", ["2601.18642","s-fusion"],["2608.19652","s-method"]],
    ["Zep × APEX-MEM", "都運用圖結構和時間資訊；一者重視寫入更新，一者重視保留歷史與查詢期裁決。", "對含矛盾版本的問題，寫入期更新與查詢期裁決是否互補？", "延遲、儲存與工具使用成本需對齊衡量。", ["2501.13956","s-fact"],["2604.14362","s-tools"]],
    ["STALE × Always-On", "一者聚焦隱性過期記憶診斷；一者將持久狀態、權威與治理納入全生命週期。", "若已失效記憶驅動外部動作，如何評估修復與回滾？", "基準的查詢正確率不等於真實環境治理安全性。", ["2605.06527","s-probe"],["2606.30306","s-life"]]
  ];
  function renderCompare() {
    var head = document.querySelector(".bench > .paper-head");
    if (!head) return;
    var card = el("section", "cr-card"); card.id = "cr-compare";
    txt(card,"h2","cr-heading","互動比較推理：先選研究問題，再看限制");
    txt(card,"p","cr-caption","以下是本站跨論文閱讀後提出的比較框架與研究構想，不代表已找到文獻空白，也不表示方法在相同評測下較優。");
    var row = el("div","cr-selectrow");
    var lab = el("label","","比較的兩篇："); lab.htmlFor="cr-pair"; row.appendChild(lab);
    var sel = el("select"); sel.id="cr-pair";
    PAIRS.forEach(function (x,i) { var o=el("option","",x[0]);o.value=String(i);sel.appendChild(o); });
    row.appendChild(sel);card.appendChild(row);
    var out = el("dl","cr-pairout"); card.appendChild(out);
    function render() {
      out.textContent="";
      var x=PAIRS[+sel.value], fields=[["方法與適用條件",x[1]],["互補性／候選研究問題",x[2]],["共同比較限制",x[3]]];
      fields.forEach(function (f) { out.appendChild(el("dt","",f[0]));out.appendChild(el("dd","",f[1])); });
      out.appendChild(el("dt","","回到原文對照"));
      var dd=el("dd");
      [x[4],x[5]].forEach(function (p,i) { if (i) dd.appendChild(document.createTextNode(" ／ "));dd.appendChild(link("../papers/"+p[0]+"/index.html#"+p[1],PA[p[0]].short+" 章節")); });
      out.appendChild(dd);
    }
    sel.addEventListener("change",render);render();
    // Insert after the header, above the existing matrix; existing IDs and links remain intact.
    head.parentNode.insertBefore(card,head.nextSibling);
  }
  // Pure data accessible to offline static verification; never use it to award progress.
  window.CriticalReadingIndex = {papers:PA, pairs:PAIRS, exercises:evals, source:source};
  var paperEl=document.querySelector("[data-paper]");
  if (paperEl) renderPaper(paperEl.getAttribute("data-paper"));
  else renderCompare();
})();