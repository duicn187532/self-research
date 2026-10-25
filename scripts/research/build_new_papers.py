"""Build the two source-checked October 2026 reading lessons.

Content is kept here as structured lesson data so the three explanation levels,
source anchors, checks and progress controls cannot silently drift apart.
"""
from html import escape
from pathlib import Path
from new_paper_sources import CHAPTERS, OPENING

ROOT = Path(__file__).resolve().parents[2]

PAPERS = {
    "2604.20006": {
        "short": "Memora", "title": "從回想走向遺忘：Memora 如何評測個人化長期記憶",
        "english": "From Recall to Forgetting: Benchmarking Long-Term Memory for Personalized Agents",
        "authors": "Md Nayem Uddin、Kumar Shubham、Eduardo Blanco、Chitta Baral、Gengyu Wang",
        "meta": "Findings of ACL 2026 · 26814–26841 · DOI 10.18653/v1/2026.findings-acl.1337",
        "source": "https://aclanthology.org/2026.findings-acl.1337/",
        "pdf": "https://aclanthology.org/2026.findings-acl.1337.pdf",
        "scene": "leafre", "intro": "一套記憶系統能背出舊事，不代表它知道哪件事已經被使用者改掉。Memora 把跨 session 整合、更新／刪除與三種下游任務放在同一個壓力測試裡。",
        "route": "先看問題與資料生成，再親手算 FAMA；接著讀實驗表，最後判斷合成資料和 LLM 裁判能支持多大的結論。",
        "sections": [
            ("s-problem", "問題：回想不等於維護現況", "§1–2、Table 1",
             "朋友記得你曾說喜歡某餐廳，卻忘了你上週說已經對它過敏。答對舊回憶仍可能給出錯建議。這個比喻只說明版本衝突，沒有模擬實驗資料的生成程序。",
             "作者指出常用評測多考孤立回想。Table 1 中 LoCoMo 平均只需整合 1.3 個 session，更新／刪除平均 0；LongMemEval 的對應值為 1.9 與 2.0。Memora 刻意增加兩種壓力：跨 session 的 memory consolidation 和 memory mutation。這些是資料集題目層級的統計，不能讀成系統準確率。",
             "問題可寫成：在時刻 t 的歷史 Hₜ 中，回答 q 時需取用多個仍有效的事實，並排除已被 update/delete 的版本。這和只做 retrieval 不同；若檢索器把舊值也找回來，後續仍須裁決有效性。論文沒有提出新的記憶演算法，而是提出 benchmark 與評分。",
             "LoCoMo 的 1.3 是準確率嗎？", "不是；它是每題平均需要整合的歷史 session 數。"),
            ("s-data", "資料怎麼造：狀態軌跡先於對話", "§3.1–3.3、Figure 2",
             "先在帳本寫清楚『喜好改了、目標完成了』，再把帳本變成對話。這樣出題時知道目前哪一版才有效。帳本是合成資料的真值，不是真人記憶。",
             "流程是種子人物與記憶實體 → session 模擬器決定新增、更新、刪除或中性互動 → 記錄每個 session 前後的記憶狀態 → 多代理提示生成對話。記憶分為偏好、活動、目標；共有 10 個專業人物設定。先有可追蹤狀態再生成文字，才有辦法明確知道失效的內容。",
             "這種生成順序降低標註歧義，也造成重要的外推限制：使用者真實話語可能暗示、反諷、跨人稱或互相矛盾，模擬器的操作類型卻事先已知。評測的是在受控狀態演化下的記憶能力，不是現實部署的全部難題。",
             "為什麼不能只由最終對話倒推答案？", "因為更新與刪除的有效時點可能模糊；明確狀態軌跡提供可檢查的 gold。"),
            ("s-scale", "規模與難度：三種時間跨度", "Table 1–2",
             "一週、數月、季度的故事越長，舊事越多；但『資料變長』和『更新變多』一起變，不能只怪其中一項。",
             "Table 2 每個跨度都有 10 個 persona；每人平均 session 數為 155／615／1991，平均記憶操作數為 103.2／374.3／1171.4。memory-grounded 問題數是 150／150／300，故不同跨度分數應各自正規化。Table 1 的季度題目平均需整合 28.4 個 session、最多 309；更新／刪除平均 14.8、最多 94。",
             "注意 Table 1 的『mutation 14.8』是每道問題需要處理的更新／刪除數；Table 2 的『operations 1171.4』是每個 persona 軌跡中的所有新增／更新／刪除平均數，兩者分母與涵蓋操作不同。由於時間跨度、session 數、操作數一起變，這個設計能顯示長歷史下的壓力，不能單獨識別某一因素的因果效應。",
             "季度的 94 和 1171.4 為何不同？", "94 是單題最多相關更新／刪除；1171.4 是每人完整軌跡的平均全部記憶操作。"),
            ("s-tasks", "三種任務與資料品質", "§3.4–3.6、§4.2、附錄 C",
             "同一段長期相處，可能問『我以前說過什麼』、『依我現在情況推論什麼』，或『現在推薦什麼』；三題需要的記憶不一樣。",
             "Remembering 回想已知資訊；Reasoning 跨記憶推理；Recommending 根據有效偏好建議。每題配有應出現的 presence criteria 與應排除的 absence criteria。作者用自動 grounding 檢查、人類評估及三個 LLM 裁判多數決；裁判與人類標註的平均一致率為 88.3%，人類間 Cohen κ 為 0.86–0.90。",
             "88.3% 表示所抽查 criterion 的標註一致，不保證所有題目在三種跨度或所有錯誤類別都同樣可靠。criterion 的顆粒度和題目生成方式會影響 FAMA；評閱開放式回答時，『合理改寫』是否等於滿足 criterion 也取決於裁判。",
             "推薦題只要提到一個有效偏好就算完全正確嗎？", "不一定；分數由該題所有 presence 與 absence criteria 共同決定。"),
            ("s-fama", "FAMA：把『不該用的舊資訊』扣回來", "§4.2、未編號 FAMA 公式",
             "回答一題，不能只算寫對幾項，也要看有沒有把過期資訊寫進去。下方計算器用簡化的二元 criterion 實例重現原文公式。",
             "對每題，MPA 是應包含有效記憶的 criterion 通過比例；FAA 是應排除舊記憶的 criterion 通過比例。λ 是 absence criteria 在兩類 criterion 中所占比例。FAMA = max(0, MPA − λ(1 − FAA))，所以漏掉有效內容會少得分，錯用舊內容會再扣分。三個任務分開把逐題 FAMA 平均並換成 0–100。",
             r"設 presence 通過 3/4、absence 通過 1/2，則 \(\lambda=2/(4+2)=1/3\)，\(\mathrm{FAMA}=\max(0,3/4-(1/3)(1-1/2))=7/12\approx0.583\)。\(\lambda\) 隨每題 criterion 數量而變，不是論文固定調好的超參數。當題目完全沒有其中一類 criterion 時，須先檢查資料規則；本文給出的公式未單獨討論零分母處理，本站互動示範要求兩類各至少一項。",
             "只要 FAA=1，FAMA 就一定是 1 嗎？", "不一定；此時扣分為零，但分數仍等於 MPA，可能小於 1。"),
            ("s-penalty", "Table 5：只算記得會高估多少", "§5、Table 5",
             "如果只檢查回答有沒有提到該提的資訊，看起來可能不錯；但若把早就作廢的偏好也講出來，就得扣分。",
             "Table 5 把三任務的 memory-presence 分數相加，括號裡是套用 FAMA 後的減分。月度 MemoryOS 為 112.8（減 28.4），A-Mem 112.0（減 29.5），Nemori 105.4（減 15.4）；扣完分別約 84.4、82.5、90.0，因此只看『有沒有提到應有資訊』會改變系統排序。注意此表分數是三任務加總，最大 300。",
             "作者報告直接 LLM 的平均扣分從週 32.6 降到季 17.8，解釋為長歷史超過 context 時，相關資訊整體被省略，連錯用舊資訊的機會也變少；記憶代理的平均扣分則從週 18.2 增至季 29.5，提示舊內容可被持續取回。這是作者對觀察模式的機制解釋，Table 5 本身不做單因子因果識別。月度 Nemori 的 105.4−15.4=90.0，與 Table 3 的 44.08+45.90+0.00=89.98 的四捨五入一致。",
             "月度 A-Mem 的 112.0 與 Nemori 的 105.4，套 FAMA 後誰較高？", "Nemori 約 90.0；A-Mem 約 82.5。只看 presence 的排序會翻轉。"),
            ("s-results", "讀 Table 3：分任務、分跨度，不混總分", "§5、Table 3–4",
             "把三項成績分開看，才知道代理是記得比較好、推得比較好，還是推薦比較好。",
             "Table 3：A-Mem 的 Remembering 從週 71.82 降至季 40.78；MemoBase 從 43.60 降至 15.18。Reasoning 對大多數系統很難；LangMem 是週 30.00、月 14.00、季 11.00。推薦題不一定單調下降，例如 Gemini 3 Pro Preview 無推理版本是 45.12／45.94／52.56。Table 4 把同一任務的三個跨度分數相加，最大可到 300，不是單一準確率。",
             "模型與記憶代理的回答骨幹不相同：直接模型使用 GPT-5.2 等四款模型；六個代理統一用 GPT-4o-mini 產生回答。因此 Table 3 的『代理 vs 直接模型』不是只改記憶模組的乾淨消融。可比較各組在共同評測上的觀察表現，不能把所有差距歸因於記憶方法。論文稱代理在 Remembering 有明顯優勢，但對其它任務的改善有限。",
             "Table 4 的 173.02 可以當 173.02% 準確率嗎？", "不行；它是三個 0–100 跨度分數相加，上限 300。"),
            ("s-errors", "錯誤分析：三任務失敗的機制不同", "§6、75 個人工抽查錯誤",
             "推薦錯不一定是『不會推薦』，有時是沿用舊喜好；推理錯也未必是算術差，可能少了關鍵資料。",
             "作者從各跨度的錯誤中抽 75 例，每任務 25 例，分析該任務表現最好的長期記憶代理。推薦 25 錯中，16 例（64%）和未忘舊記憶有關、7 例（28%）是偏好只取回一部分；回想 18/25（72%）是部分取回；推理的 25 個錯誤全部涉及相關記憶取回不全。這些是條件於『已出錯』的人工分類比例，不是整個評測集的錯誤率，也不是每個代理都相同。",
             "推薦容許近似偏好，所以在 Table 3 相對較穩；需要合併多筆的推理只要缺一項便可能失敗。作者把錯誤樣本的共同現象指向 partial retrieval 與 outdated memory。本站補充：若要比較兩個根因的因果貢獻，可對同一問題分別提供 oracle 有效記憶、oracle 更新決策，做 2×2 消融；論文的錯誤分析尚未做這個干預。",
             "『25/25 推理錯誤有部分取回』可推論所有推理題都失敗嗎？", "不能；分母是被抽中的錯誤案例，不是全部推理題。"),
            ("s-critique", "證據邊界與再實驗設計", "§6、Limitations、本站分析",
             "考題先由規則寫好，系統卻仍答錯，這是有力的壓力測試；但不能說真實使用者一定會出現同樣比例的錯。",
             "作者明列限制：合成對話、10 個 persona 與三類記憶，未涵蓋多使用者關係；評分主要靠 LLM 裁判；沒有完整報告延遲或成本。本站補充：跨度變長時多個因素同時變，缺少固定 session 數只增加 mutation 的對照；若要驗證真正的『遺忘』能力，還應把刪除與更新拆開報錯，對裁判意見不一致案例做人工錯誤分析。後兩項是研究建議，不是作者已做實驗。",
             "可重現性分兩層：作者公開資料與 Table 3 評估程式可幫助重算已發布的分數；要重跑完整生成流程還須核對各階段 prompt、模型版本與服務時點。別把『有 repo』直接等同『所有實驗可重現』。對照 STALE、StateMemBench 時也不能把各自分數放在一條排行榜，題目與評分單位不同。",
             "哪項實驗最能分開『歷史太長』與『更新太多』？", "固定歷史長度，只控制更新／刪除次數，反向再固定 mutation、改變長度。"),
        ],
        "glossary": [("memory consolidation", "回答一題須跨多少歷史 session 整合有效資訊。"), ("memory mutation", "記憶更新與刪除；不要與所有 add/update/delete 操作總數混淆。"), ("MPA／FAA", "有效資訊出現率／失效資訊未出現率，均為 criterion 層級比例。"), ("FAMA", "對每題扣除舊記憶使用的分數，再依任務與跨度平均。")],
    },
    "2610.09008": {
        "short": "CASK", "title": "這段記憶屬於誰？CASK 的作用範圍寫入規則",
        "english": "Whose Memory Is It? Scope-Aware Commit Rules for Long-Term LLM Memory",
        "authors": "Hongyu Gu、Xinchang Li",
        "meta": "arXiv:2610.09008v1 · 2026-10-06 · NeurIPS 2026 Workshop LP4FM Poster",
        "source": "https://arxiv.org/abs/2610.09008",
        "pdf": "https://arxiv.org/pdf/2610.09008v1",
        "scene": "nautilus", "intro": "代理曾討論『也許搬去巴黎』，最後決定去雪梨。若長期記憶只留下句子，數月後便可能把未採納方案當作現實。CASK 研究的是：一句話由哪個世界、分支或說話者授權。",
        "route": "先分清 proposition 與 discourse owner，再追六個診斷提示、雙 Gram key 與門檻；最後按資料單位拆讀實驗，避免把附件分類準確率當成回答正確率。",
        "sections": [
            ("s-problem", "問題：內容相同，授權來源不同", "§1、§3、Figure 1",
             "『週五開會』『米娜以為週五開會』『假設週五開會』都談同一日期，卻不是同一種事實。例子只幫助區分作用範圍，不代表神經表徵已被證明。",
             "論文稱 discourse ownership 為命題所屬的 shared world、說話者信念、計畫、虛構或反事實分支。持久記憶的 commit 問題是決定哪個候選記錄能升格為共享世界前提。相關性只能回答『有用嗎』，不能回答『有權當真嗎』。",
             "定義候選 c 的真正附件 a(c) 與預測附件 â(c)。若 â(c)≠a(c)，就有 attachment error；若 scoped proposition 被當作 shared-world 前提，則造成 contamination。論文先研究二元 actual/scoped 邊界，沒有實作任意巢狀的多層 owner。",
             "『助手考慮過巴黎』與『使用者決定去巴黎』可進同一種共享事實欄嗎？", "前者可以作為真實的過程事件記錄，但『搬去巴黎』這個內嵌命題不能升格為已決定的世界事實。"),
            ("s-formal", "形式化：附件邊不是刪除開關", "§3、公式 (1)",
             "某個想法『尚未成真』不等於它是假的，也不等於要把它從記憶抹掉。它只是在另一個範圍才可作前提。",
             "原文把候選記錄寫成 c=(x,m,s)：x 是先前對話，m 是待存命題，s 是斷言、信念、計畫、虛構或反事實等報告框架。ω(c) 指授權 m 的 discourse owner；ω₀ 是共享現實。二元目標 a(c)=1 當且僅當 ω(c)=ω₀。學到的門 gθ(c)∈[0,1] 以閾值 τ 產生預測附件；查詢 q 只允許 A(q) 中的 owner，相關性 ρ(q,m) 僅在獲授權記錄間排序。",
             r"符號表：\(c=(x,m,s)\) 是候選記錄；\(\omega(c)\) 是其 owner；\(\omega_0\) 是共享世界；\(a(c)=\mathbf1[\omega(c)=\omega_0]\) 是 gold actual 指標；\(g_\theta(c)\) 是參數 \(\theta\) 的門控分數；\(\hat a(c)=\mathbf1[g_\theta(c)\ge\tau]\) 是預測；\(A(q)\) 是問題 \(q\) 允許的 owner 集，\(\rho(q,m)\) 是相關性分數。\(\mathbf1[\cdot]\) 為條件成立時取 1 的指示函數。若計畫內容 scoped，事件『代理曾考慮該計畫』仍可能是 actual 的元事實，兩個命題要分開編碼。",
             "非 actual 的命題是否一定為假、一定要刪？", "都不是；它只不能無條件作共享世界前提，仍可在所屬範圍被查詢。"),
            ("s-route", "因果錨點：模型內部是否真的追蹤 owner", "§4.1、§6.1、Table 1",
             "把一句話放進『已決定』或『只是想像』的外框，模型的判斷會變。作者不只觀察相關性，還交換內部的一小段表徵，看看寫入判斷是否跟著變。",
             "在凍結的 Qwen2.5-3B-Instruct 中，作者先用訓練資料找 rank-16 ownership subspace；在保持命題 payload 的成對例子上，用 opposite-scope donor 替換目標的子空間狀態。Table 1：寫入機率朝 donor scope 改變 Δp=0.715，75.8% 的案例翻轉；匹配的隨機 rank-16 對照 Δp=0.004、翻轉 0.6%。",
             "這是對指定模型、層與構造資料的因果介入證據：它支持『該路徑能控制凍結寫入門』，不保證模型所有記憶判斷都由這 16 維決定。干預另有同 scope 與 complement 控制。95% CI 以 conversation 聚類估計，需注意長對話中的相關樣本不能當獨立題目。",
             "Table 1 的 0.715 是附件準確率嗎？", "不是；它是介入後，寫入門機率朝 donor scope 移動的幅度。"),
            ("s-key", "六個診斷、兩塊 Gram 與 46 維 key", "§4.1–4.2、公式 (2)–(4)、附錄 B",
             "拍照記下座標，換一個同樣有效的座標軸就變了；記下六個點彼此的距離與夾角關係，就不依賴軸怎麼轉。這是 Gram key 的直覺，並非說任意模型更新都保持不變。",
             "每個候選記錄經六個固定 Yes/No 診斷提示，取得指定 transformer block 的六個 hidden state；前四個另取 Yes/No logit 差。固定 rank-16 投影把 hidden states 分成 ownership 子空間與 complement，分別形成 6×6 Gram 矩陣。每個對稱矩陣取上三角 21 項，再加 4 個 logit 差，得到 21+21+4=46 維特徵；標準化後用 logistic regression 判 actual。",
             r"令 \(H\in\mathbb{R}^{d\times6}\) 為按固定提示順序排列的隱狀態，\(U\in\mathbb{R}^{d\times16}\) 是正交 ownership basis，\(U_\perp\) 為互補 basis。\(G_\parallel=(U^\top H)^\top(U^\top H)\)，\(G_\perp=(U_\perp^\top H)^\top(U_\perp^\top H)\)；\(\phi=\operatorname{vech}(G_\parallel)\Vert\operatorname{vech}(G_\perp)\Vert\ell\)。\(d\) 是隱層寬度；\(\ell\in\mathbb{R}^{4}\) 是四個 Yes−No logit 差；vech 是取含對角線的上三角；\(\Vert\) 在此表示串接。完整 Gram 為 \(H^\top H=G_\parallel+G_\perp\)，但相加會失去哪段關係來自因果錨定子空間的型別資訊。",
             "為什麼六個 prompt、兩塊 6×6 Gram 最後不是 72 維？", "對稱矩陣各只有 6×7/2=21 個獨立上三角項；兩塊 42，加四個 logit 差，合計 46。"),
            ("s-proof", "定理讀法：不變、完整與穩定的條件", "§4.4、Appendix A",
             "座標軸在同一個空間裡旋轉，兩個點的內積不變；但若連整個空間或模型都改了，這個證明不能直接套用。",
             "定理 1：在 ownership 與 complement 兩個固定子空間內各做正交換基，key 不變。定理 2：對有序點組，Gram 相等當且僅當兩組只差正交變換，即在此對稱性下沒有再丟掉可保留的資訊。定理 3：輸入有小擾動時 Gram 差可由原狀態大小與擾動大小上界；若分類 logit 與門檻的距離大於特徵誤差乘權重範數，判決不變。",
             r"精確邊界：令 \(V,E\in\mathbb{R}^{p\times6}\)、\(\widetilde V=V+E\)，則 \(\|\widetilde V^\top\widetilde V-V^\top V\|_F\le 2\|V\|_2\|E\|_F+\|E\|_F^2\)。\(\|\cdot\|_F\) 是 Frobenius norm，\(\|\cdot\|_2\) 是 spectral norm，\(p\) 是子空間維度；這是 algebraic stability，不是跨任意模型權重、不同診斷集或不同 ownership projector 的普遍可移植保證。命題順序必須固定，兩個 Gram block 也必須保留型別。",
             "若換了全部 prompt 與 projector，定理 1 還直接保證 key 相同嗎？", "不保證；定理只涵蓋固定子空間內的正交換基。"),
            ("s-commit", "寫入、檢索與 provenance 的分工", "§4.3、§6.5–6.6",
             "助理可以保留『曾想過巴黎』這段歷程，但只有被授權的世界事實可直接拿去回答現在住哪裡。",
             "CASK 對候選記錄預測 actual/scoped 附件；actual 才進共享檢索，scoped 保留在原範圍。查詢時先用同一份 BM25 相關性排序，再用可接受 owner 集合遮罩，然後才給 reader 回答。預設門檻 τ=0.5；CASK@R95 在 development set 選門檻，以至少 95% actual admission 為約束，換取較高回想。runtime provenance 若有精確執行狀態，部署策略先用它，缺失時才由 CASK 補。",
             "一個可驗證的工程不變量是：只有 attachment=edge(actual) 的命題可作 shared-world premise；『曾考慮某計畫』可作 actual process fact，但計畫內容本身仍 scoped。這是本站對原文政策的操作化，不表示原文已驗證任意事件日誌系統。門檻的安全與回想取捨應在相同資料與同樣 reader 下比較。",
             "找得到且相關，就可直接寫入長期世界記憶嗎？", "不行；相關性排名後仍須檢查該命題的 owner 是否授權目前查詢。"),
            ("s-evidence", "實驗讀表：分類、污染與答案分開看", "§5–6、Table 2–3、Figure 2",
             "一個門衛可能擋住不該進的句子，也可能擋掉應該保留的句子；兩種影響須分開量。",
             "Table 2 source-isolated attachment：CASK 在 Qwen2.5-3B／1.5B 為 83.33%／79.82%，相較 full hidden probe 的 72.12%／77.47%。Table 3 的衝突記憶實驗中，相對 full Gram+logits，CASK 的 recall@5 43.42→44.86%、污染 7.61→7.41%、reader EM 24.69→26.75%、F1 35.43→37.31%；兩者的注入替代答案採納率同為 1.03%。無過濾 flat memory 的 F1 40.19% 較高，卻採納衝突答案 4.53%。",
             "附件準確率是每筆記錄分類；recall@5 是每題檢索；EM/F1 是回答。不能把 83.33% 當最終答題率。972 筆候選對應 486 個 exact-span 問題，源自 10 段 LoCoMo 對話；Table 3 的 0.20 個百分點污染差很小，不應單獨宣稱有一般化的大幅安全改善。Figure 2 的 scope-only 控制保持 payload 完全相同，CASK 為 78.70%，是較直接指向 ownership 的證據。",
             "Table 3 中 flat memory 的 F1 較高，是否證明門控沒有用？", "不能；它的衝突答案採納率也較高。效用與前提授權是兩個目標，要並列報告。"),
            ("s-factorial", "實驗隔離與門檻取捨", "§5、§6.2–6.5、Figure 2、Appendix B",
             "若想知道模型在看『這句話是不是假設』，就固定句子本身，只改它外面的報告框架；反過來固定框架，只改內容。",
             "scope-only 組讓 actual 與非 actual 的 evidence payload 逐位元相同，只改 reporting frame；payload-only 組固定 actual frame，只改第一個答案 span。各有 4860 筆記錄、2430 對。Figure 2a：CASK 在 scope-only 為 78.70%，優勢集中在 owner 變化；scope 固定時優勢消失。這比只比較自然分布的準確率，更能排除『其實只看句子內容』的替代解釋。",
             "在檢索端，CASK τ=0.5 是平衡附件政策；CASK@R95 在 development conversations 選 τ，要求 actual admission 至少 95%，再最大化非 actual rejection。作者報告 R95 保留 flat-memory 的 recall/MRR，同時降低污染 11.19 個百分點與衝突答案採納 1.17 個百分點，並稱聚類區間排除零。門檻來自開發集，不能在測試集上重新挑；不同門檻的 F1／污染取捨也不能用單一『最佳』概括。",
             "scope-only 中若 CASK 仍能分 actual/scoped，最直接排除哪種捷徑？", "只靠命題 payload 或答案字面內容分類的捷徑，因為成對 payload 完全相同。"),
            ("s-critique", "外推、成本與研究缺口", "§7、Appendix B–C、本站分析",
             "這是一條有前景的寫入邊界；它經過兩個同家族小模型與受控情境驗證，還沒證明任何代理都能直接使用。",
             "生成 tool-agent trace 共 75 個 episode、511 筆記錄，其中 92 actual、419 scoped。trace-adapted CASK fallback 的 balanced accuracy 91.10%，50% provenance 混合政策 95.02%；完整 runtime ledger 的 100% 是標籤可得時的 oracle 上界。附錄 B 的單次診斷中位延遲 24.83 ms，六個批次 32.10 ms（A100，1.29 倍）；這不是完整代理端到端延遲。",
             "作者指出模型家族、二元 owner 邊界、巢狀 scope、joint distribution shift 與 BM25 檢索限制。受控資料訓練的 head 直接轉到 trace 只有 31.66% balanced accuracy，所以 trace 成績用了重新適配的 head，不能宣稱原 head 零樣本轉移成功。本站後續研究建議：跨模型家族與跨時間重訓測 key 的穩定性；在多層引用與多說話者資料上評估 owner；給出 EM、污染與拒絕率的完整 Pareto 曲線。建議不是本文已證實的貢獻。",
             "為何 100% runtime provenance 不是 CASK 自己的成績？", "因為它使用完整執行標籤作 oracle；CASK 主要在標籤缺失時補上命題層的 scope。"),
        ],
        "glossary": [("discourse owner", "授權命題成立的共享世界、信念、計畫或假設分支。"), ("attachment", "候選命題與 owner 的邊；本文主要評 actual/scoped。"), ("Gram matrix", "點組彼此內積的矩陣；在指定正交換基下不變。"), ("provenance", "工具是否執行、觀察是否真的返回等運行紀錄。"), ("balanced accuracy", "actual admission 與 scoped rejection 兩率的平均。")],
    },
}

STYLE = """<style>
.lesson-mini{border:1px solid var(--rule);border-radius:8px;padding:1rem;margin:1rem 0;background:var(--surface)}
.lesson-mini label{display:inline-flex;gap:.35rem;align-items:center;margin:.3rem .8rem .3rem 0}
.lesson-mini input,.lesson-mini select{font:inherit;max-width:7rem;background:var(--paper);color:var(--ink);border:1px solid var(--rule);border-radius:4px;padding:.25rem}
.lesson-mini output{display:block;margin-top:.6rem;font-weight:700;color:var(--ink)}
.lesson-mini .state{display:grid;gap:.4rem;margin-top:.8rem}.lesson-mini .state span{padding:.4rem;border-left:3px solid var(--accent);background:var(--paper)}
.lesson-mini button{font:inherit;padding:.4rem .8rem;border:1px solid var(--accent);background:var(--accent-soft);color:var(--ink);border-radius:5px;cursor:pointer}
.paper-source{margin:1.15rem 0 1.35rem;padding:1rem 1.2rem;border:1px solid var(--rule);border-left:4px solid var(--accent);border-radius:6px;background:var(--surface)}
.paper-source h2,.paper-source h3{margin:.15rem 0 .75rem;line-height:1.35}
.paper-source h2{font-size:1.2rem}.paper-source h3{font-size:1.05rem}
.paper-source p{margin:.65rem 0;line-height:1.75}
.paper-source .source-head{display:flex;flex-wrap:wrap;gap:.4rem .8rem;align-items:center;justify-content:space-between;margin-bottom:.6rem}
.paper-source .source-head a{font-size:.88rem}
.paper-source .math-block{overflow-x:auto;margin:.8rem 0;padding:.55rem .35rem;background:var(--paper);border:1px solid var(--rule)}
.paper-source .table-wrap{margin:.85rem 0}
.guide-heading{margin:1.25rem 0 .4rem;font-size:1rem;color:var(--muted)}
</style>"""

def section_html(pid, index, row):
    sid, title, source, kid, uni, grad, q, answer = row
    short = title.split("：")[-1]
    source_notes = CHAPTERS[pid][sid]
    source_box = f'''<div class="paper-source"><div class="source-head"><span class="src src-abs">原文 {escape(source)}</span><a href="{PAPERS[pid]['pdf']}" target="_blank" rel="noopener">核對原文 PDF ↗</a></div><h3>原文方法與證據</h3>{source_notes}</div>'''
    extra = ""
    if sid == "s-fama":
        extra = """<div class="lesson-mini" id="fama-lab"><h3>FAMA 手算工作台 <span class="src src-mine">本站依原文公式實作</span></h3>
<p>設定每題兩類 criterion 的通過數；下方即時計算 MPA、FAA、λ 與 FAMA。兩類至少各 1 項。</p>
<label>有效項總數 <input type="number" id="fp" min="1" max="20" value="4"></label><label>有效項通過 <input type="number" id="fph" min="0" max="20" value="3"></label>
<label>舊項總數 <input type="number" id="fa" min="1" max="20" value="2"></label><label>舊項成功排除 <input type="number" id="fah" min="0" max="20" value="1"></label>
<output id="fama-out" aria-live="polite"></output></div>"""
    if sid == "s-penalty":
        extra = """<div class="table-wrap"><table class="results"><caption>月度：Table 5 的三任務合計 presence 與 FAMA 減分（分）</caption><thead><tr><th>記憶代理</th><th class="num">Presence</th><th class="num">FAMA 減分</th><th class="num">扣後約值</th></tr></thead><tbody><tr><td>MemoryOS</td><td class="num">112.8</td><td class="num">28.4</td><td class="num">84.4</td></tr><tr><td>A-Mem</td><td class="num">112.0</td><td class="num">29.5</td><td class="num">82.5</td></tr><tr><td>Nemori</td><td class="num">105.4</td><td class="num">15.4</td><td class="num">90.0</td></tr></tbody></table></div>"""
    if sid == "s-results":
        extra = """<div class="table-wrap"><table class="results"><caption>Table 3 摘錄：各任務、各跨度 FAMA（0–100；不能跨任務當同一指標）</caption><thead><tr><th>系統</th><th>任務</th><th class="num">週</th><th class="num">月</th><th class="num">季</th></tr></thead><tbody><tr><td>A-Mem</td><td>回想</td><td class="num">71.82</td><td class="num">41.90</td><td class="num">40.78</td></tr><tr><td>MemoBase</td><td>回想</td><td class="num">43.60</td><td class="num">20.08</td><td class="num">15.18</td></tr><tr><td>LangMem</td><td>推理</td><td class="num">30.00</td><td class="num">14.00</td><td class="num">11.00</td></tr><tr><td>Gemini 3 Pro Preview（無推理）</td><td>推薦</td><td class="num">45.12</td><td class="num">45.94</td><td class="num">52.56</td></tr></tbody></table></div>"""
    if sid == "s-evidence":
        extra = """<div class="table-wrap"><table class="results"><caption>Table 3 摘錄：3B 衝突記憶，百分比；污染與替代答案採納越低越好</caption><thead><tr><th>方法</th><th class="num">附件</th><th class="num">Recall@5</th><th class="num">污染</th><th class="num">EM</th><th class="num">F1</th><th class="num">替代答案</th></tr></thead><tbody><tr><td>Full Gram+logits</td><td class="num">81.28</td><td class="num">43.42</td><td class="num">7.61</td><td class="num">24.69</td><td class="num">35.43</td><td class="num">1.03</td></tr><tr><td>CASK τ=0.5</td><td class="num">83.33</td><td class="num">44.86</td><td class="num">7.41</td><td class="num">26.75</td><td class="num">37.31</td><td class="num">1.03</td></tr><tr><td>Flat memory</td><td class="num">—</td><td class="num">—</td><td class="num">—</td><td class="num">29.63</td><td class="num">40.19</td><td class="num">4.53</td></tr></tbody></table></div>"""
    if sid == "s-commit":
        extra = """<div class="lesson-mini" id="scope-lab"><h3>記憶提交模擬器 <span class="src src-mine">教學示意，非 CASK 模型輸出</span></h3>
<p>選一筆命題的來源與查詢範圍，觀察它能否作為回答前提。實際 CASK 會從表徵預測 attachment；此處直接給定 owner 來驗證規則。</p>
<label>命題來源 <select id="scope-owner"><option value="actual">使用者已決定去雪梨</option><option value="plan">助手考慮搬去巴黎</option><option value="belief">米娜認為會議在週五</option></select></label>
<label>查詢範圍 <select id="scope-query"><option value="actual">共享世界現況</option><option value="plan">曾考慮的計畫</option><option value="belief">米娜的信念</option></select></label>
<div class="state"><span id="scope-record"></span><span id="scope-result" role="status" aria-live="polite"></span></div></div>"""
    return f'''<section class="sec" id="{sid}" data-short="{escape(short)}">
<div class="sec-head"><span class="sec-num">{index:02d}</span><h2>{escape(title)}</h2></div>
{source_box}
{extra}
<h3 class="guide-heading">分層導讀</h3>
<div class="explain"><div class="lv lv-kid"><p>{kid}</p></div><div class="lv lv-uni"><p>{uni}</p></div><div class="lv lv-grad"><p>{grad}</p></div></div>
<div class="check"><span class="check-title">自我檢測</span><details><summary>{escape(q)}</summary><div><p>{answer}</p></div></details></div>
<div class="desk-foot"><div class="note"><label for="note-{sid}">筆記</label><textarea id="note-{sid}" data-note="{sid}" placeholder="記下推導、疑問與反例"></textarea><span class="saved"></span></div><label class="done"><input type="checkbox" data-done="{sid}"> 讀完這節</label></div>
</section>'''

def build(pid, p):
    title = escape(p["title"])
    count = len(p["sections"]) + 4  # reading route, substantive sections, boss, research, glossary
    assert {row[0] for row in p["sections"]} == set(CHAPTERS[pid]), pid + " source analysis mismatch"
    sections = "\n".join(section_html(pid, i, row) for i, row in enumerate(p["sections"], 1))
    terms = "\n".join(f"<dt>{escape(k)}</dt><dd>{escape(v)}</dd>" for k, v in p["glossary"])
    html = f'''<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><title>{title} · 論文精讀室</title><meta name="description" content="{title}：原文核對、分層解釋、互動推演與研究批判。"><link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="../../assets/site.css"><link rel="stylesheet" href="../../assets/reading-lab.css">{STYLE}
<script>try{{var r=document.documentElement;r.setAttribute("data-host-theme",r.getAttribute("data-theme")||"");if(JSON.parse(localStorage.getItem("study:skin"))!=="study")r.setAttribute("data-skin","maple");var m=JSON.parse(localStorage.getItem("study:mode"));if(m==="light"||m==="dark")r.setAttribute("data-theme",m)}}catch(e){{}}</script>
<script>window.MathJax={{tex:{{inlineMath:[["\\\\(","\\\\)"]],displayMath:[["\\\\[","\\\\]"]]}},svg:{{fontCache:"global"}}}}</script><script defer src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-svg.min.js"></script></head>
<body data-map-scene="{p['scene']}"><div data-paper="{pid}" data-scene="{p['scene']}"><header class="toolbar gutter"><div class="toolbar-inner"><a class="home" href="../../index.html">論文精讀室</a><span class="crumb">{p['short']} · {pid}</span><div class="levels" role="group" aria-label="解釋深度"><span class="levels-label">解釋深度</span><div class="seg"><button type="button" data-level-btn="kid" aria-pressed="false">五歲</button><button type="button" data-level-btn="uni" aria-pressed="true">大學生</button><button type="button" data-level-btn="grad" aria-pressed="false">研究生</button><button type="button" data-level-btn="all" aria-pressed="false">對照</button></div></div></div></header>
<div class="desk gutter"><nav class="rail" aria-label="章節"><details open><summary>章節 <span class="progress-text" id="progress-text">0 / {count}</span></summary><div class="progress"><span id="progress-bar"></span></div><ol id="outline"></ol></details></nav><main class="column">
<div class="paper-head">
<div class="eyebrow"><span class="mono">{escape(p['meta'])}</span></div>
<h1>{title}</h1>
<p class="reading-paper-start"><a href="#s-problem">開始閱讀</a>　<a href="#s-overview">先看閱讀路線</a></p>
<p lang="en"><em>{escape(p['english'])}</em></p><p class="authors">{escape(p['authors'])}</p>
<div class="links"><a href="{p['source']}" target="_blank" rel="noopener">正式來源</a><a href="{p['pdf']}" target="_blank" rel="noopener">原文 PDF</a></div>
<div class="paper-source opening-source">{OPENING[pid]}</div>
<div class="claim" role="note"><span class="claim-label">核對狀態</span><p>本新增教材依上列原文 PDF 的正文、實驗表及限制節編寫；來源版本與發表狀態見頁首。數字依表格逐項摘錄，本站示例與研究建議均另行標示。現有其他七篇的核對狀態不由本次更新繼承。</p><div class="legend"><span><span class="src src-abs">原文 §</span> 原論文或正式版表格</span><span><span class="src src-mine">本站分析</span> 教學示例、推論與研究建議</span></div></div>
</div>
<section class="sec" id="s-overview" data-short="閱讀路線"><div class="sec-head"><span class="sec-num">00</span><h2>這篇怎麼讀</h2></div><div class="prose"><p>{p['intro']}</p><p>{p['route']}</p><p>學習目標：能說明研究問題、重建關鍵方法或評分、核對至少一項表格結果，並指出一個不能由證據推出的結論。可先選五歲版建立直覺，再切大學生版讀機制，最後用研究生版檢查形式與限制。</p></div><div class="desk-foot"><div class="note"><label for="note-overview">閱讀目的</label><textarea id="note-overview" data-note="s-overview"></textarea><span class="saved"></span></div><label class="done"><input type="checkbox" data-done="s-overview"> 讀完這節</label></div></section>
{sections}
<section class="sec sec-boss" id="s-boss" data-short="BOSS：綜合挑戰"><div class="sec-head"><span class="sec-num">B</span><h2>BOSS：跨章節綜合挑戰</h2></div><p>結合問題、方法、公式與證據作答。打完會顯示逐題理由和對應章節，可重試。</p><div class="boss-board" id="boss-board" aria-live="polite"></div><div class="desk-foot"><label class="done"><input type="checkbox" data-done="s-boss"> 擊敗 BOSS</label></div></section>
<section class="sec sec-research" id="s-research" data-short="研究者進階分析"><div class="sec-head"><span class="sec-num">R</span><h2>研究者進階分析</h2></div><p class="research-lede">將論文主張拆成可重建的流程、可核對的證據與尚未驗證的假說。跨論文關係見<a href="../../compare/index.html">研究工作台</a>。</p>
<details class="rblock" id="r-{p['short'].lower()}-a"><summary>A　方法重建</summary><div class="rbody"><p><span class="tag tag-orig">原文</span> {('先模擬狀態軌跡、生成 session 對話、依軌跡出三類題、以 criterion 和三裁判評分。§3–4。' if pid=='2604.20006' else '從候選記錄取得六個診斷 hidden states 與四個 logit 差；形成 typed Gram key；標準化後用 logistic gate 決定 actual/scoped，檢索時套 owner mask。§4。')}</p><p><span class="tag tag-unknown">原文未提供</span> {('完整重跑全部合成對話所需服務時點與端到端成本，須另查釋出物與版本。' if pid=='2604.20006' else '跨任意模型更新與多層巢狀 owner 的穩定性保證；本文只驗證兩個同家族骨幹。')}</p></div></details>
<details class="rblock" id="r-{p['short'].lower()}-b"><summary>B　可重現性審查</summary><div class="rbody"><p>{('ACL 正式版與作者公開的 Memora 資料／Table 3 評估程式可供重算；模擬器、模型服務版本、裁判成本與完整生成流程仍應單獨核對。' if pid=='2604.20006' else '附錄 B 列診斷提示、層與 rank、source-isolated folds、門檻選擇與 A100 測量；仍須完整程式、模型與 LoCoMo 資料授權才能獨立重跑。')}</p></div></details>
<details class="rblock" id="r-{p['short'].lower()}-c"><summary>C　主張與證據</summary><div class="rbody"><p>{('受控長期軌跡和 Table 3 支持「現有系統常用到失效記憶」；由於合成資料、不同回答骨幹與 LLM 裁判，不能量化真實部署的錯誤率或單獨歸因於特定記憶架構。' if pid=='2604.20006' else '介入與 scope-only 控制支持內部 ownership route 對門控有因果作用；Table 2–3 支持在指定模型、資料與檢索器下的附件提升；未證明跨模型或開放世界的普遍安全。')}</p></div></details>
<details class="rblock" id="r-{p['short'].lower()}-d"><summary>D　可否證的後續研究假說</summary><div class="rbody"><p><span class="tag tag-assume">本站提出，非作者結論</span> {('若固定 session 數與總 token，只提高更新／刪除密度，FAMA 的下降仍存在；若不成立，現有下降可能主要來自長度。' if pid=='2604.20006' else '若用相同 projector 與六個診斷重訓不同模型家族，typed Gram 的 scope-only 優勢仍大於 full Gram；若不成立，現有優勢可能依賴 Qwen 家族特性。')}</p></div></details>
<div class="desk-foot"><div class="note"><label for="note-research">研究筆記</label><textarea id="note-research" data-note="s-research"></textarea><span class="saved"></span></div><label class="done"><input type="checkbox" data-done="s-research"> 讀完這節</label></div></section>
<section class="sec" id="s-glossary" data-short="術語表"><div class="sec-head"><span class="sec-num">附</span><h2>術語與符號</h2></div><dl class="glossary">{terms}</dl><div class="desk-foot"><label class="done"><input type="checkbox" data-done="s-glossary"> 讀完這節</label></div></section>
<section class="sec" id="s-export" data-short="匯出筆記"><div class="sec-head"><span class="sec-num">附</span><h2>匯出我的筆記</h2></div><p>筆記保存在本機瀏覽器。可複製 Markdown 留存。</p><div class="btn-row"><button type="button" class="btn" id="export-notes">複製全部筆記</button><span class="toast" id="export-toast" role="status"></span></div><div class="note"><label for="export-box" class="sr-only">匯出內容</label><textarea id="export-box" rows="8" hidden readonly></textarea></div><p class="readout">來源：<a href="{p['source']}" target="_blank" rel="noopener">{escape(p['english'])}</a>。</p></section>
</main></div></div><script src="quiz.js"></script><script src="../../assets/battle.js"></script><script src="../../assets/site.js"></script><script src="../../assets/anim.js"></script><script src="../../assets/reading-lab.js"></script><script src="../../assets/world-quests.js"></script><script src="lesson.js"></script></body></html>'''
    path = ROOT / "papers" / pid
    path.mkdir(exist_ok=True)
    (path / "index.html").write_text(html, encoding="utf-8")
    print(pid, "sections", count, "bytes", len(html.encode("utf-8")))

if __name__ == "__main__":
    for paper_id, paper in PAPERS.items():
        build(paper_id, paper)
