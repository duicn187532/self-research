/* Graduate reading lab. Independent of localStorage, battles and page navigation.
 * Teaching examples are synthetic and never presented as published results.
 */
(function () {
  "use strict";
  var host = document.querySelector("[data-paper]");
  if (!host) return;
  var id = host.getAttribute("data-paper");
  var PAPERS = {
    "2501.13956": {
      short: "Zep", version: "2501.13956v1",
      dims: [
        ["Problem", "動態對話、商業資料與知識更新，不符合靜態 RAG 的語料假設。", ["s-problem"]],
        ["Method", "Graphiti 以 episode、語意實體／事實邊、社群組成時序圖；擷取、解析、標記有效時間後檢索。", ["s-graph","s-episode","s-fact","s-anim"]],
        ["Benchmark", "DMR 與 LongMemEval；注意 DMR 引用既有 MemGPT 數字，以及 LongMemEval 的 full-context 對照和延遲口徑。", ["s-setup","s-dmr","s-lme"]],
        ["Contribution", "作者提出可服務化的時序圖記憶層，並報告兩組評測的準確度、延遲表現。此為作者主張／報告，非本站證實因果。", ["s-problem","s-lme"]],
        ["Gap", "本站研究疑問：建圖成本、擷取誤差與元件消融對結果的個別影響仍需專門實驗；不能把未比較視為無效。", ["s-critique","s-research"]]
      ],
      flow: [["收進 episode", "保留對話片段與時間來源"], ["抽取實體／關係", "解析實體，形成有時間欄位的事實邊"], ["更新有效性", "對可能矛盾的事實評估時間有效區間"], ["檢索後回答", "以相關度與圖結構找證據；回答仍取決於召回與模型"]],
      method: "s-anim"
    },
    "2601.18642": {
      short: "FadeMem", version: "2601.18642v2",
      dims: [
        ["Problem", "長期 Agent 記憶面臨無差別保留、上下文過載與重要資訊遺失的取捨。", ["s-problem"]],
        ["Method", "雙層 SML／LML、重要性評分與強度衰減；寫入時再處理衝突與融合。精確公式見相應章節。", ["s-arch","s-decay","s-conflict","s-fusion","s-anim"]],
        ["Benchmark", "MSC、LoCoMo、LTI-Bench；比較 Mem0 等基線，呈現保留、一致性與消融，須分辨指標尺度。", ["s-setup","s-results","s-ablation"]],
        ["Contribution", "作者宣稱差異化遺忘、衝突處理與融合的整合架構，並報告指標改善；『首創』需另做文獻新穎性核查。", ["s-problem","s-results","s-context"]],
        ["Gap", "本站研究疑問：現有消融未能單獨隔離『遺忘』的效果，跨情境的實際效益與代價值得獨立檢驗。", ["s-ablation","s-critique"]]
      ],
      flow: [["輸入新記憶", "建立內容、頻率與時間等狀態"], ["算重要性／衰減", "依記憶層與時間改變強度；參數由原文章節定義"], ["處理矛盾與融合", "判斷與既有記憶的關係，選擇相應更新"], ["保留／遷移／移除", "依門檻改變所在層或留存狀態"]],
      method: "s-anim"
    },
    "2604.14362": {
      short: "APEX-MEM", version: "2604.14362v1",
      dims: [
        ["Problem", "長期對話需要可保留歷史、處理時間與複雜關聯的記憶，直接覆蓋舊事實可能抹除脈絡。", ["s-problem"]],
        ["Method", "事件錨定的半結構化屬性圖與時間資訊；寫入時保留版本，查詢時由代理使用工具判讀。", ["s-graph","s-extract","s-tools","s-anim"]],
        ["Benchmark", "LoCoMo、LongMemEval、SealQA 與工具消融；注意題型、模型／token 成本是否可比。", ["s-setup","s-locomo","s-ablation","s-lme","s-cost"]],
        ["Contribution", "作者提出半結構化長期記憶與工具化時間推理流程；效果屬論文實驗報告。", ["s-graph","s-tools","s-locomo"]],
        ["Gap", "本站研究疑問：只增不刪的長期儲存開銷、查詢時衝突裁決可靠度及端到端成本。", ["s-cost","s-critique"]]
      ],
      flow: [["對話轉事件", "抽取事件、實體及屬性"], ["追加圖中", "保留歷史事實，連結事件與有效區間"], ["發起查詢", "代理規劃工具操作以選取所需歷史"], ["判斷當前答案", "依時間與關聯進行查詢時解析，而非寫入時先刪舊值"]],
      method: "s-anim"
    },
    "2605.06527": {
      short: "STALE", version: "2605.06527v1",
      dims: [
        ["Problem", "即使沒有明示『舊資訊作廢』，新事件也可能造成跨屬性的隱性記憶失效。", ["s-problem","s-taxonomy"]],
        ["Method", "以 Type I／II 衝突分類、STALE 評測與 CUPMem 更新裁決器探討狀態新舊衝突。", ["s-formal","s-cupmem","s-anim"]],
        ["Benchmark", "STALE 資料集、受測記憶系統、三個探測維度與主結果；注意合成情境與裁決者偏誤。", ["s-build","s-probe","s-setup","s-results"]],
        ["Contribution", "作者提出隱性過期記憶的評測設定及 CUPMem 原型；須區分 benchmark 發現與方法效能。", ["s-formal","s-results","s-cupmem"]],
        ["Gap", "本站研究疑問：固定槽位之外的狀態表達、隱性依賴推理、跨領域與真實長期情境的有效性。", ["s-gap","s-critique","s-research"]]
      ],
      flow: [["收到新觀測", "比較新資訊及已有槽位／記憶"], ["找隱性影響", "區分同屬性更新與跨屬性失效候選"], ["裁決記憶狀態", "在候選範圍內維護 ACTIVE／STALE 等狀態"], ["回答與稽核", "不能將『沒有明講』當成『所有舊記憶仍有效』"]],
      method: "s-anim"
    },
    "2606.30306": {
      short: "Always-On 綜述", version: "2606.30306v1",
      dims: [
        ["Problem", "持久代理不只要記憶內容，還需要狀態管理、可恢復性、有效性與治理邊界。", ["s-thesis","s-bound"]],
        ["Method", "綜述的分析架構：六個狀態軸、生命週期、儲存基底及治理評測；不是單一可重跑模型。", ["s-axes","s-life","s-sub","s-aoep"]],
        ["Benchmark", "主要是文獻分類與評測家族盤點；不應把綜述比較表當成共同資料集的模型競賽。", ["s-corpus","s-eval"]],
        ["Contribution", "作者整理持續型 Agent 的持久狀態問題、設計軸與評估／治理需求。", ["s-thesis","s-front"]],
        ["Gap", "本站研究疑問：如何把有效性、可撤回性及狀態轉移要求落成可實驗、可否證的機制。", ["s-front","s-critique"]]
      ],
      flow: [["辨識持久狀態", "區分暫時上下文與跨回合持續的狀態"], ["提出生命週期", "審視寫入、驗證、使用、更新與失效"], ["檢驗不變量", "關注出處、授權、可回復性與跨 session 一致性"], ["規劃評估", "以壓力情境檢驗治理要求；綜述本身非新演算法"]],
      method: "s-life"
    },
    "2608.19652": {
      short: "StateMem", version: "2608.19652v1",
      dims: [
        ["Problem", "長對話中已被明示替代的狀態仍可能殘留，並污染依賴它的後續答案。", ["s-problem","s-label"]],
        ["Method", "TurnEncoder 形成狀態單元；StateStore 管理取代與依賴；Rechecker 標記需重新計算的狀態。", ["s-method","s-anim"]],
        ["Benchmark", "StateMemBench 與外部回想型資料集；觀察 long-context、包裝器和消融比較的條件差異。", ["s-bench","s-results","s-ablation","s-wrapper","s-recall"]],
        ["Contribution", "作者提出狀態追蹤基準及以單元、取代標記、依賴檢查組成的記憶方案。", ["s-bench","s-method","s-results"]],
        ["Gap", "本站研究疑問：明示依賴之外的隱性變化、過度傳播及合成題對方法的偏向。", ["s-ablation","s-critique","s-context"]]
      ],
      flow: [["TurnEncoder 擷取", "將新對話寫入狀態單元及出處"], ["標記取代", "將可能失效的舊單元與新資訊關聯"], ["傳遞重檢需求", "沿已有依賴邊標記受影響的下游單元"], ["查詢時重算", "依有效單元與重算提示回答；傳播可能過多"]],
      method: "s-anim"
    },
    "dekleer-1986-atms": {
      short: "ATMS", version: "Artificial Intelligence 28 (1986), 127–162",
      dims: [
        ["Problem", "傳統 TMS 聚焦單一信念情境，切換假設或遇到矛盾時易反覆維護。", ["s-tms","s-limits"]],
        ["Method", "以 justification、assumption environment、最小 label 及 nogood 追蹤各命題在哪些情境下可推出。", ["s-defs","s-labels","s-algo"]],
        ["Benchmark", "主要以形式性質、推論例子與實作討論建立論證；不是現代 Dataset／Baseline／Metric 的量化實驗。", ["s-search","s-algo","s-critique"]],
        ["Contribution", "作者提出以假設環境為中心的真值維護演算法及其性質；不要把形式證明當統計優勢。", ["s-defs","s-labels","s-algo"]],
        ["Gap", "本站研究疑問：自然語言如何可靠抽出假設與理由，以及複雜情境下的規模與驗證成本。", ["s-context","s-critique"]]
      ],
      flow: [["給出假設與理由", "問題解決器提供命題依賴，ATMS 不自行理解自然語言"], ["聯集候選環境", "由前件 label 組合推導結論的候選環境"], ["移除冗餘與矛盾", "清除 nogood 的超集合與非最小環境"], ["增量傳播", "更新依賴的後件 label，保留不同假設情境"]],
      method: "s-algo"
    }
  };
  var data = PAPERS[id];
  var route = document.getElementById("s-route");
  if (!data || !route) return;
  var origin = route.querySelector(".sec-head");
  if (!origin) return;

  function node(tag, cls, value) {
    var element = document.createElement(tag);
    if (cls) element.className = cls;
    if (value !== undefined) element.textContent = value;
    return element;
  }
  function link(ref, text) {
    var a = node("a", "", text);
    a.href = "#" + ref;
    return a;
  }
  function mount(parent, tag, cls, text) {
    var el = node(tag, cls, text);
    parent.appendChild(el);
    return el;
  }
  var main = node("div", "reading-lab");
  main.id = "reading-lab";
  origin.insertAdjacentElement("afterend", main);
  mount(main, "h3", "reading-lab-title", "五維精讀導航");
  mount(main, "p", "reading-lab-intro", "先掌握 Problem／Method／Benchmark／Contribution／Gap，再進入章節與既有動畫。以下為本站對既有教材的濃縮導讀，不是新的論文原文查驗。");

  var source = mount(main, "details", "reading-source");
  var sourceSummary = mount(source, "summary", "", "原文與核對狀態（點開）");
  var sourcePanel = mount(source, "div", "reading-source-body");
  mount(sourcePanel, "p", "", "本站既有教材頁首有過往全文核對聲明；這次改版沒有重新取得並逐頁比對原始 PDF，因此新加入的五維摘要一律保留「本站整理／本次待覆核」標記。不可據此宣稱本次完成論文數字、公式或作者資訊複核。");
  mount(sourcePanel, "p", "", "原文版本：" + data.version + "。核對時必須對照標題、作者、版本日期，並逐項核查公式、圖表與結果。來源若失效，保留原版本紀錄，將新版標為待核對。");
  if (id !== "dekleer-1986-atms") {
    var l = document.createElement("a");
    l.href = "https://arxiv.org/pdf/" + data.version;
    l.target = "_blank"; l.rel = "noopener noreferrer";
    l.textContent = "開啟指定版本 PDF（外部連結，未保證目前可用）";
    sourcePanel.appendChild(l);
  } else {
    mount(sourcePanel, "p", "", "原始掃描 PDF 為既有教材記錄中的使用者提供版本；本站未附公用 PDF 直鏈，無法取得時請提供相同版本掃描檔。");
  }
  var dims = mount(main, "div", "reading-dim-grid");
  var types = ["問題定義", "方法步驟", "評測證據", "作者主張", "本站研究疑問"];
  data.dims.forEach(function (entry, i) {
    var card = mount(dims, "article", "reading-dim");
    var head = mount(card, "h4", "", entry[0] + " · " + types[i]);
    head.setAttribute("lang", "en");
    mount(card, "p", "", entry[1]);
    var refs = mount(card, "p", "reading-refs");
    entry[2].forEach(function (ref, j) {
      if (j) refs.appendChild(document.createTextNode(" · "));
      refs.appendChild(link(ref, document.getElementById(ref)?.getAttribute("data-short") || ref));
    });
    var status = i === 4 ? "本站推導／非作者結論" : i === 3 ? "作者主張／本次待覆核" : "本站摘述／本次待覆核";
    mount(card, "span", "reading-provenance", status);
  });

  var method = mount(main, "div", "reading-method");
  mount(method, "h4", "", "方法狀態推演 · 先預測下一步");
  mount(method, "p", "reading-fine", "以下為本站為理解流程設計的教學抽象，非原文偽程式碼或實際執行紀錄；細部公式與分支以原文所指章節為準。");
  var path = mount(method, "ol", "reading-flow");
  var reveal = mount(method, "p", "reading-flow-state");
  reveal.setAttribute("aria-live", "polite");
  var controls = mount(method, "div", "reading-flow-controls");
  var previous = mount(controls, "button", "btn", "上一步");
  var next = mount(controls, "button", "btn", "預測後揭示下一步");
  previous.type = next.type = "button";
  var deep = link(data.method, "前往原有方法動畫／推導");
  controls.appendChild(deep);
  var step = 0;
  function drawFlow() {
    path.replaceChildren();
    data.flow.forEach(function (entry, i) {
      var li = mount(path, "li", i === step ? "active" : i < step ? "done" : "future", entry[0]);
      li.setAttribute("aria-current", i === step ? "step" : "false");
    });
    reveal.textContent = "目前步驟 " + (step + 1) + "／" + data.flow.length + "：" + data.flow[step][1];
    previous.disabled = step === 0;
    next.disabled = step === data.flow.length - 1;
  }
  previous.addEventListener("click", function () { step = Math.max(0, step - 1); drawFlow(); });
  next.addEventListener("click", function () { step = Math.min(data.flow.length - 1, step + 1); drawFlow(); });
  drawFlow();

  var bench = mount(main, "div", "reading-benchmark");
  mount(bench, "h4", "", "Benchmark 判讀實驗室（非論文數據）");
  mount(bench, "p", "reading-fine", "下列均為明確標示的虛構教學情境，用來練習解讀，不能拿去引用為任何一篇論文的實驗結果。");
  var sim = mount(bench, "div", "reading-metric-demo");
  mount(sim, "p", "", "情境：同一評測準確率（示意）；調整兩組分數，觀察差值如何改變。");
  var baseLabel = mount(sim, "label", "", "Baseline 準確率：");
  var baseValue = mount(baseLabel, "output", "", "65%");
  var baseRange = mount(baseLabel, "input", "");
  baseRange.type = "range"; baseRange.min = "0"; baseRange.max = "100"; baseRange.value = "65"; baseRange.step = "1";
  var newLabel = mount(sim, "label", "", "新方法準確率：");
  var newValue = mount(newLabel, "output", "", "70%");
  var newRange = mount(newLabel, "input", "");
  newRange.type = "range"; newRange.min = "0"; newRange.max = "100"; newRange.value = "70"; newRange.step = "1";
  var metricOut = mount(sim, "p", "reading-metric-result");
  metricOut.setAttribute("aria-live", "polite");
  function drawMetric() {
    var a = Number(baseRange.value), b = Number(newRange.value);
    baseValue.textContent = a + "%"; newValue.textContent = b + "%";
    var pp = b - a;
    var relative = a === 0 ? "基線為 0，無法計算" : (pp / a * 100).toFixed(1) + "%";
    metricOut.textContent = "觀測差距：" + (pp > 0 ? "+" : "") + pp + " 個百分點；相對基線變化：" + relative + "。單靠分數差距不能證明機制造成改善。";
  }
  baseRange.addEventListener("input", drawMetric);
  newRange.addEventListener("input", drawMetric);
  drawMetric();
  var fair = mount(bench, "fieldset", "reading-fair");
  mount(fair, "legend", "", "公平性檢查：已知哪些控制條件？（依研究報告自行勾選）");
  var checks = [
    ["相同資料集、切分及評分規則", "否則可能是在比較不同題目。"],
    ["相同骨幹模型與提示詞條件", "否則模型能力可能是混淆因子。"],
    ["相同 token／檢索預算與額外工具權限", "否則算力與外部資訊不對等。"],
    ["重複執行、變異與顯著性資訊", "否則無法判斷觀測差距的穩定性。"],
    ["消融時只改指定元件且成本可比", "否則不能將消融降幅單獨歸因。"]
  ];
  var count = mount(fair, "p", "reading-fair-result");
  count.setAttribute("aria-live", "polite");
  var checked = [];
  checks.forEach(function (row) {
    var label = mount(fair, "label", "reading-check");
    var input = mount(label, "input");
    input.type = "checkbox";
    label.appendChild(document.createTextNode(" " + row[0]));
    mount(label, "small", "", row[1]);
    checked.push(input);
    input.addEventListener("change", drawFair);
  });
  function drawFair() {
    var n = checked.filter(function (x) { return x.checked; }).length;
    count.textContent = "已檢視 " + n + "／" + checks.length + " 項。勾選僅代表讀者認為已找到文件證據，不代表本站已驗證；即使全勾，因果解釋仍需實驗設計支持。";
  }
  drawFair();

  var quiz = mount(bench, "div", "reading-evidence-quiz");
  mount(quiz, "h4", "", "分清：觀測、因果解釋、未證主張");
  var scenarios = [
    ["示意結果表：方法 A 在同一測試集是 70%，B 是 65%。", 0, "這只是表面上的觀測數值。必須確認相同評分定義與試驗條件，才能進一步比較。"],
    ["如果控制條件相同，A 的圖結構可能幫助保留了跨輪關係。", 1, "這是待實驗支持的機制解釋；需用針對圖結構的消融或控制組檢驗。"],
    ["A 在一組合成測試領先，證明它對所有真實長期對話都最好。", 2, "從單一合成評測外推所有情境屬過度泛化，缺乏外部效度證據。"],
    ["示意消融表：移除重排器後分數由 70% 降到 61%。", 0, "表格降幅是觀測，不等於排除模型設定、統計波動及其他差異後的因果結論。"],
    ["只修改重排器、固定所有條件並重複試驗，可檢查其效果是否穩定。", 1, "這是因果辨識的實驗設計推論，還不是已完成的結果。"]
  ];
  var labels = ["觀測結果", "因果解釋／待檢驗假說", "未經證實的主張"];
  var quizPrompt = mount(quiz, "p", "reading-quiz-prompt");
  var opts = mount(quiz, "div", "reading-quiz-buttons");
  var feedback = mount(quiz, "p", "reading-quiz-feedback");
  feedback.setAttribute("role", "status"); feedback.setAttribute("aria-live", "polite");
  var quizNav = mount(quiz, "div", "reading-quiz-nav");
  var nextQuiz = mount(quizNav, "button", "btn", "下一個情境");
  nextQuiz.type = "button";
  var quizIndex = 0;
  function drawQuiz() {
    var q = scenarios[quizIndex];
    quizPrompt.textContent = "情境 " + (quizIndex + 1) + "／" + scenarios.length + "：" + q[0];
    opts.replaceChildren(); feedback.textContent = "請先選分類，再看理由。";
    labels.forEach(function (label, j) {
      var b = mount(opts, "button", "btn", label);
      b.type = "button";
      b.addEventListener("click", function () {
        feedback.textContent = (j === q[1] ? "判讀正確。" : "需要修正：這應歸類為「" + labels[q[1]] + "」。") + " " + q[2];
        opts.querySelectorAll("button").forEach(function (item, k) {
          item.disabled = true;
          item.setAttribute("aria-pressed", String(k === j));
        });
      });
    });
    nextQuiz.textContent = quizIndex === scenarios.length - 1 ? "從第一題重練" : "下一個情境";
  }
  nextQuiz.addEventListener("click", function () { quizIndex = (quizIndex + 1) % scenarios.length; drawQuiz(); });
  drawQuiz();
  mount(main, "p", "reading-lab-end", "讀完後應能口頭說明：問題的可驗證定義 → 更新／查詢的資料流 → 基準與控制條件 → 作者主張有何支持 → 哪個缺口可轉成可否證問題。無須填寫筆記，既有閱讀進度與討伐紀錄完全不受本單元操作影響。");
})();