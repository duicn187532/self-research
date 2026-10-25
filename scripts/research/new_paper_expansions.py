"""Additional worked and experimental chapters for the two new reading guides.

Rows follow build_new_papers.section_html's eight-field lesson schema.  The source
blocks distinguish paper evidence from our constructed examples and deductions.
"""

EXPANSIONS = {
    "2604.20006": [
        ("s-timeline", "手推狀態軌跡：舊偏好何時失效", "§3.2、Figure 2；本站示例",
         "小樹原本喜歡海鮮，後來說『我現在不能吃蝦』。題目若問今天晚餐，舊喜好仍是歷史，卻不能直接當推薦理由。",
         "本站用三輪示例重建狀態：t₁ 新增喜好海鮮；t₂ 更新為避免蝦；t₃ 聊天但不改記憶。t₃ 查詢的有效集合保留更新後狀態，舊版本可作歷史證據，不能作現況推薦。Memora 的 session simulator 就是在生成對話前記錄每輪前後狀態，再以該軌跡產生題目與準則。",
         "把每筆記憶表示成 (實體, 值, 有效起點, 有效終點) 是本站的分析模型，不是論文宣稱的儲存格式。t₁ 的『喜歡蝦』在 t₂ 後終止有效；中性輪 t₃ 不應默認再次更新。若問『以前喜歡什麼』，仍需讀 t₁；若問『現在可推薦什麼』，需依 t₂。評分時 presence 檢查有效資訊、absence 檢查失效內容是否被錯用。",
         "t₃ 的中性聊天是否讓 t₂ 的更新自動失效？", "否；沒有新狀態操作，t₂ 的有效版本仍在。"),
        ("s-baselines", "實驗設定：直接長上下文與外部記憶", "§4.1、Table 3",
         "一組選手帶整本聊天紀錄進考場；另一組先做筆記，考試時再取回。兩組都回答同一評測，但工具和回答模型不完全一樣。",
         "原文比較四種直接讀對話歷史的 LLM 與六種先增量寫入、查詢時檢索的記憶代理。直接模型受各自 context window 限制；代理共用 GPT-4o-mini 作回答後端。直接模型還分標準與推理模式。這個設定能比較系統在共同題目上的表現，無法只由兩組差值估計外部記憶的單獨效果。",
         "可把觀察分數寫成 Y(骨幹、上下文截斷、記憶機制、提示、題目)。直接模型與代理同時改變數個自變數，所以 Y_agent−Y_direct 不是純記憶處理效應。較乾淨的後續消融應固定回答骨幹、token 預算與提示，只替換記憶寫入／檢索策略；本節將原文設計與本站建議明確分開。",
         "代理比直接模型高 10 分，可說記憶模組貢獻 10 分嗎？", "不能；回答骨幹、可見歷史與推理設定也不同。"),
        ("s-judges", "兩道品質關卡：對話真值與答案裁判", "§3.3、§4.2、Appendix B–C",
         "先查劇本有沒有把『更新』真的說出來，再查答題者有沒有沿用舊版本。這是兩個不同的檢查，不可把它們的投票規則混成一個。",
         "對話生成後，grounding 檢查要求三個模型一致，若不一致便回饋重生；每個 persona 再抽 5% 對話人工檢查。答題階段則對每個 presence／absence criterion 用 GPT-4.1、Claude Haiku 4.5、Gemini 2.5 Flash 各判 yes/no，以多數決定分。人類與裁判平均一致率 88.3%，人類間 κ=0.86–0.90。",
         "前一道關卡檢驗『合成對話是否忠於預設狀態』，後一道檢驗『開放式回答是否滿足二元準則』；兩種誤差來源不同。88.3% 是抽查標註的一致率，不是裁判在所有可能答案上的準確率，也不能推出每一任務、每一失效類型的分歧率相同。本站建議保存分歧與邊界案例做分層人工複核。",
         "對話 grounding 的三模型一致與答案 criterion 的三模型多數決相同嗎？", "不同；前者要求一致並可能重生，後者採多數決計分。"),
        ("s-aggregate", "從單題到 Table 4：分數的分母", "§4.2、Table 3–4；本站推導",
         "一題的分數先算出來，同一種任務再平均；表格最後把三個時間跨度加起來。每次加總後，滿分代表的東西都變了。",
         "FAMA(q) 在 0 到 1。對固定任務與跨度，Table 3 分數等於該組所有題目的 FAMA 平均乘 100。Table 4 則把該任務的週、月、季三個 Table 3 分數相加，上限 300。由於三組問題數是 150、150、300，Table 4 的等權跨度加總與把全部題目攤在一起求平均不等價。",
         "設週、月、季分數為 W,M,Q，Table 4 指標為 W+M+Q。若要以全部題目加權，應是 (150W+150M+300Q)/600，這是本站推導的另一指標，原文 Table 4 沒有報它。舉例 W=80,M=60,Q=40：原表合計 180/300，題數加權平均則為 55/100。比較時須先說明統計單位。",
         "Table 4 的 180 分是否等同全部 600 題平均 60%？", "不一定；Table 4 等權加總三種跨度，季度題數是其他跨度的兩倍。"),
        ("s-context", "放進研究脈絡：評測能辨別什麼", "§1–2、Table 1；本站分析",
         "有些考卷主要問能否找到舊話；Memora 多問舊話被改寫後還能否保持新狀態。題型不同，不能把分數放到同一排行榜。",
         "Table 1 以每題需要整合的 session 與相關 mutation 描述壓力：LoCoMo 為 1.3／0.0，LongMemEval 為 1.9／2.0；Memora 季度為 28.4／14.8。這說明資料集的設計重心，不是 LoCoMo 或 LongMemEval 的品質判決。Memora 的貢獻是把長軌跡、更新／刪除與失效記憶扣分放在同一個評測流程。",
         "三個 benchmark 的題目生成、有效性定義與評分單位不同，跨資料集的原始分數不能當受控因果對照。若要檢驗 Memora 是否測出既有基準看不見的錯誤，本站建議讓同一組系統在各基準作答，並按需要整合的 session 數與 mutation 數分層，報告錯誤類型而不只報總分。",
         "Table 1 的較大 mutation 數是否證明 Memora 上所有模型更差？", "否；它描述題目壓力，不是模型結果。"),
    ],
    "2610.09008": [
        ("s-owner-example", "手推 owner：事件與內嵌命題分開", "§3、Figure 1；本站示例",
         "『助理曾考慮巴黎』可以是真事，『使用者已搬到巴黎』卻不會因此成真。一句話裡可能有兩個要分開存的命題。",
         "本站例子：對話真實發生了『助理提出巴黎方案』這個過程事件；巴黎搬遷是計畫分支的內嵌內容；使用者最後同意雪梨才形成共享現況。問『曾考慮何處』可引用巴黎，問『最後決定何處』則需取雪梨。CASK 的二元門控針對候選命題是否獲共享世界授權，不等於把整段過程永久刪除。",
         "可將外層事件 e 與內層命題 m 分成兩筆候選：ω(e)=ω₀，ω(m)=ω_plan。若混成一個無型別摘要，日後只憑 relevance 取回巴黎時就容易造成 premise contamination。這是本站對 §3 授權邊界的教學形式化；論文主實驗尚未求解任意深度的巢狀 owner。",
         "『曾提出巴黎方案』為 actual，能推出『已搬到巴黎』為 actual 嗎？", "不能；外層事件與內嵌計畫有不同的 owner。"),
        ("s-protocol", "實驗單位與資料隔離：十段長對話", "§5、Table 2–3",
         "同一段長聊天會生出很多相似考題。若把這些題亂分到訓練和測試，模型可能認得原故事，分數會變好看。",
         "作者用 LoCoMo 的 486 道 exact-span 問題，來自 10 段對話；衝突研究為 972 筆候選記錄。source-isolated folds 以整段 conversation 切分，替代答案只取自訓練對話。開發資料挑正則化與 R95 門檻，測試對話留到最後。區間也按 conversation 重抽樣，而不是把同對話的每筆記錄當獨立樣本。",
         "附件分類以記錄為單位，recall@5 與 MRR 以問題為單位，EM／F1 以 reader 回答為單位；源對話才是聚類重抽樣單位。十個獨立來源的聚類區間比以 972 筆記錄當獨立樣本保守，但外推到其他對話分布仍受限。原文沒有測任意長度與任意領域的使用者對話。",
         "為何信賴區間按對話而非 972 筆記錄重抽樣？", "同一對話衍生的記錄與題目相關，不能當獨立樣本。"),
        ("s-routing", "兩段因果證據：空間路由與寫入門", "§6.1、Table 1",
         "先讓模型的推理轉向另一個可能世界，再看記憶寫入決定會不會跟著轉。兩步都固定原本的命題內容。",
         "3B 的 rank-16 介入使 134/146 個 held-out 案例走向目標 mental space（91.78%），隨機子空間為 3.22%；1.5B 的對應路由率為 86.30% 與 20.86%。之後作者在六個診斷過程中替換 ownership 子空間狀態；3B 寫入機率朝 donor scope 移動 0.715，75.8% 的門控決策翻轉。前者是推理路由，後者是下游提交判定，不是同一個結果指標。",
         "命題 payload 保持不變，有助排除只靠答案字面改變的解釋；匹配隨機子空間與互補子空間是干預控制。介入支持在指定凍結模型與資料中，此 route 對寫入門具因果影響；它不等於證明實際部署中每一次 scope 判斷都受同一子空間完全支配。",
         "91.78% 與 75.8% 是同一個準確率嗎？", "不是；前者是 mental-space 路由成功率，後者是寫入門翻轉率。"),
        ("s-ablation", "Table 2 消融：46 維特徵各自做了什麼", "§6.2、Table 2",
         "把兩種關係圖分開保存，再附上四個明確判斷訊號，效果比只留其中一塊好；但分數只證明這個實驗設定。",
         "3B 的 typed split Gram 不含 logits 為 72.94%；output logits 單獨為 78.19%；隨機 typed split 加 logits 為 78.81%；CASK 的指定兩塊 Gram 加 logits 為 83.33%。1.5B 對應為 75.82%、62.65%、73.35%、79.82%。完整設計在兩種骨幹上最高，顯示型別分解與顯式診斷訊號有互補性，但不能把各列差值當成獨立可加的貢獻。",
         "表中每列都是同一 source-isolated 設定下的附件分類。3B 上 CASK 比 random typed split + logits 高 4.52 個百分點；這與『只要任意切 16 維就夠』不符。沒有 logits 的 typed split 仍保留部分訊息。消融變更的是輸入表徵與學到的 head，非在固定同一 head 下抽掉單一座標，因此因果解讀要限於整條配置。",
         "3B 的 83.33−78.81=4.52 個百分點能說成最終 QA 的增益嗎？", "不能；它是每筆記錄的附件分類差，非 reader F1。"),
        ("s-transfer", "跨提示、跨框架與自然工具軌跡", "§6.1、§6.6、Appendix B–C",
         "換個說法問同一件事、改用沒見過的引述框架，再把門衛放進工具使用紀錄；每種轉移都要單獨看。",
         "未見過的診斷同義改寫達 90.94%，未見過的報告框架達 93.44%；兩種銀行同時保留作測試時降至 70.16%（二元機率基準 50%）。在 75 個生成工具 episode、511 筆記錄的 trace 中，受控資料 head 直接轉移只有 31.66% balanced accuracy；重新適配的 CASK fallback 為 91.10%，半數記錄可用精確 provenance 時混合策略為 95.02%。",
         "單獨 prompt 或 frame 擾動的結果，不能推導 joint shift 仍一樣穩。trace 的 91.10% 需要重新適配 head；若宣稱零樣本部署，應報 31.66% 而非挑較高數字。完整 runtime ledger 的 100% 是 privileged upper bound。後續需以真實而非生成的工具事件、多模型家族與嵌套 scope 檢驗。",
         "trace 的 91.10% 是否代表受控資料 head 零樣本泛化？", "否；它是 trace-adapted fallback，直接轉移為 31.66%。"),
    ],
}

SOURCE_EXPANSIONS = {
    "2604.20006": {
        "s-timeline": r'''<p><span class="src src-abs">§3.2、Figure 2</span> Session simulator 在每輪保存記憶狀態的前後快照，明確追蹤 add、update、delete；memory-neutral session 不改狀態。下表為本站建構的說明例，並非 Memora 原資料列。</p>
<figure class="table-wrap"><table class="results"><caption>本站示例：同一偏好的版本與查詢範圍</caption><thead><tr><th>輪次</th><th>操作</th><th>目前有效版本</th><th>查詢後果</th></tr></thead><tbody><tr><td>t₁</td><td>新增</td><td>喜歡海鮮</td><td>可回答當時喜好</td></tr><tr><td>t₂</td><td>更新</td><td>避免蝦</td><td>現況不可沿用舊推薦</td></tr><tr><td>t₃</td><td>中性對話</td><td>避免蝦</td><td>不產生新版本</td></tr></tbody></table><figcaption>狀態轉移是教學重建；實際試題仍須依論文公開資料判定。</figcaption></figure>''',
        "s-baselines": r'''<p><span class="src src-abs">§4.1</span> 四種直接模型為 GPT-5.2、Claude Sonnet 4.5、Gemini 3 Pro Preview、Qwen3-32B，分標準與推理設定；六種代理為 A-Mem、LangMem、Mem-0、MemoBase、MemoryOS、Nemori，回答後端統一 GPT-4o-mini。直接模型只接收 context window 容許的歷史。</p><p><span class="src src-mine">識別條件</span> 兩組改變的不只記憶方式。若要估計記憶模組的單獨效果，須固定骨幹與可見 token 預算；原文比較不能完成此因果分離。</p>''',
        "s-judges": r'''<p><span class="src src-abs">§3.3、Appendix B</span> 合成對話的 grounding 檢查要求三模型對應的操作與實體一致；不合格者重生。每個 persona 抽 5% 對話做人工品質檢查。</p><p><span class="src src-abs">§4.2、Appendix C</span> 答題準則由 GPT-4.1、Claude Haiku 4.5、Gemini 2.5 Flash 各給二元判定，再多數決。人機平均一致率 88.3%；人與人 Cohen κ=0.86–0.90。此統計不等於全部回答的正確率。</p>''',
        "s-aggregate": r'''<p><span class="src src-abs">§4.2、Table 3–4</span> 原文先將固定任務／跨度中的逐題 FAMA 加總並正規化到 0–100，再把同一任務的三個跨度分數相加，得到 Table 4 的 0–300。</p><div class="math-block">\[S_{k,d}=100\frac{1}{n_{k,d}}\sum_{q\in(k,d)}\mathrm{FAMA}(q),\qquad A_k=S_{k,\mathrm{week}}+S_{k,\mathrm{month}}+S_{k,\mathrm{quarter}}.\]</div><p><span class="src src-mine">本站推導</span> \(k\) 為任務、\(d\) 為跨度、\(n_{k,d}\) 為該組題數。Table 4 的 \(A_k\) 等權相加三個跨度；不要誤讀為全部題目的單一準確率。</p>''',
        "s-context": r'''<p><span class="src src-abs">§2、Table 1</span> 表中 LoCoMo／LongMemEval／Memora 的 consolidation、mutation 是每道題的歷史需求。Memora 季度為平均 28.4／14.8，LoCoMo 為 1.3／0.0，LongMemEval 為 1.9／2.0。</p><p><span class="src src-mine">比較設計</span> 這些數據顯示壓力配置，無法單獨確定「哪個 benchmark 更真實」。跨基準比較模型時，應同時報任務、歷史需求與評分規則，避免把原始分數混成一個排行榜。</p>''',
    },
    "2610.09008": {
        "s-owner-example": r'''<p><span class="src src-abs">§3、Figure 1</span> 原文區分實際發生的報告事件與被報告的 scoped proposition。內嵌命題未獲 shared world 授權，仍可在自己的範圍保存。</p><figure class="table-wrap"><table class="results"><caption>本站示例：相同話語拆成不同授權邊</caption><thead><tr><th>候選命題</th><th>owner</th><th>可作現況前提？</th></tr></thead><tbody><tr><td>助理提出過巴黎方案</td><td>shared world</td><td>可，作過程事實</td></tr><tr><td>使用者已搬到巴黎</td><td>計畫分支</td><td>不可</td></tr><tr><td>使用者最後決定雪梨</td><td>shared world</td><td>可</td></tr></tbody></table><figcaption>例子重建的是授權規則，不是 CASK 在該語句上的實際預測。</figcaption></figure>''',
        "s-protocol": r'''<p><span class="src src-abs">§5</span> 486 道 exact-span 問題取自十段 LoCoMo 對話；答案衝突測試有 972 筆候選。fold 以對話隔離，替代答案只從訓練對話取，development 選超參數與 R95 門檻，test 保留供最後評估。95% 區間按 conversation 重抽樣。</p><p><span class="src src-mine">單位審查</span> 記錄、查詢、reader 答案是三個不同分母；十段來源對話造成同源相關性。不能用 972 筆當互相獨立樣本計算精確度。</p>''',
        "s-routing": r'''<p><span class="src src-abs">§6.1、Table 1</span> 在 3B 模型，ownership route 介入使 134/146 個 held-out 案例指向目標 mental space（91.78%），匹配隨機 route 為 3.22%；1.5B 複驗為 86.30%／20.86%。對 3B 六個診斷路徑替換 opposite-scope 狀態，commit 機率朝 donor 移動 0.715，門控翻轉 75.8%。</p><p><span class="src src-mine">因果鏈</span> 前項是推理空間的路由，後項是寫入門決定；兩者一起支持同一 route 對指定凍結模型的 downstream commit 有作用，但量綱不可混用。</p>''',
        "s-ablation": r'''<p><span class="src src-abs">§6.2、Table 2</span> 下列數字均為 source-isolated 的每筆記錄附件分類準確率，不是最終回答。</p><div class="table-wrap"><table class="results"><caption>Table 2：拆掉或替換 key 組件後的附件準確率（%）</caption><thead><tr><th>表示</th><th class="num">3B</th><th class="num">1.5B</th></tr></thead><tbody><tr><td>Output logits</td><td class="num">78.19</td><td class="num">62.65</td></tr><tr><td>Typed Gram，無 logits</td><td class="num">72.94</td><td class="num">75.82</td></tr><tr><td>Random typed split + logits</td><td class="num">78.81</td><td class="num">73.35</td></tr><tr><td>CASK 完整 key</td><td class="num">83.33</td><td class="num">79.82</td></tr></tbody></table></div><p><span class="src src-mine">限制</span> 每列都重新訓練分類 head；差值是整體配置比較，不是每一特徵的獨立因果係數。</p>''',
        "s-transfer": r'''<p><span class="src src-abs">§6.1、§6.6、Appendix B</span> 未見診斷改寫／未見報告框架分別為 90.94%／93.44%，兩者同時留出為 70.16%。生成工具 trace 有 75 個 episode、511 筆記錄。受控 head 直接轉 trace 為 31.66% balanced accuracy；trace-adapted fallback 為 91.10%，半數具精確 provenance 的 hybrid 為 95.02%。</p><p><span class="src src-mine">部署讀法</span> 單一擾動表現不保證聯合位移；重新適配結果也不等於零樣本泛化。完整 ledger 的 100% 為特權資訊上界。</p>''',
    },
}
