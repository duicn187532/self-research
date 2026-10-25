"""Source-first analysis blocks for the Memora and CASK lessons.

Each block paraphrases a named part of the paper before the three teaching levels.
Equations and reported values are transcribed from the cited primary source; worked
examples and implications are labeled as this site's analysis.
"""

OPENING = {
    "2604.20006": r'''
<h2>先讀原文的研究核心</h2>
<p><span class="src src-abs">原文 §3–4、Figure 2、§4.2 未編號 FAMA 公式</span> Memora 先模擬每次對話前後的記憶狀態，再生成對話與回想、推理、推薦題。答案同時要含有仍有效的資訊，並排除已更新或刪除的資訊。這是一個評測資料集與評分方法，並非新記憶代理。</p>
<div class="math-block">\[\begin{aligned}
\lambda_q&=\frac{N_{\mathrm{forget},q}}{N_{\mathrm{presence},q}+N_{\mathrm{forget},q}},\\
\mathrm{FAMA}(q)&=\max\{0,\mathrm{MPA}(q)-\lambda_q[1-\mathrm{FAA}(q)]\}.
\end{aligned}\]</div>
<p><span class="src src-mine">本站讀法</span> MPA 量「該說的是否說到」，FAA 量「不該沿用的舊資訊是否避開」；兩者同屬單題 criterion 比例。第 5 節逐符號推導，並用實際數字手算。</p>''',
    "2610.09008": r'''
<h2>先讀原文的研究核心</h2>
<p><span class="src src-abs">原文 §3–4、公式 (1)–(4)</span> CASK 把待存命題連到其 discourse owner。計畫、信念或反事實可留在長期記憶，但只有獲共享世界授權的內嵌命題，才可無條件當作現況前提。作者接著用因果介入找出 ownership 表徵，再把六個診斷反應壓成可儲存的 key。</p>
<div class="math-block">\[a(c)=\mathbf 1[\omega(c)=\omega_0],\qquad
\phi_{\mathrm{CASK}}=\operatorname{vech}(G_{\parallel})\Vert
\operatorname{vech}(G_{\perp})\Vert\ell\in\mathbb R^{46}.\]</div>
<p><span class="src src-mine">本站讀法</span> 第一式問「能否當共享事實」，第二式給判定所用的 46 維證據。非共享世界不等於假，也不等於刪除；第 2、5 節會分開推導。</p>''',
}

CHAPTERS = {
    "2604.20006": {
        "s-problem": r'''
<p><span class="src src-abs">Table 1</span> 作者把題目所需跨越的歷史 session 數稱為 consolidation，把解題前經過的更新／刪除數稱為 mutation。LoCoMo 平均為 1.3／0.0，Memora 季度則為 28.4／14.8；後者最高到 309／94。這些是題目需求的統計，沒有測出任何模型的準確率。</p>
<p><span class="src src-mine">問題拆解</span> 只檢索出舊值是資訊取得；辨認它已被改寫、不得再作現況前提，才是有效記憶維護。Memora 把兩者放入同一道題，讓「想起」與「忘掉失效版本」可以分開扣分。</p>''',
        "s-data": r'''
<p><span class="src src-abs">§3.1–3.3、Figure 2</span> 生成順序是 persona 與記憶實體 → session 模擬器記錄 add／update／delete 與狀態前後值 → 多代理生成對話 → grounding、coherence 與人工檢查 → 依軌跡出題。真值在對話生成之前就存在，因此不必由語句猜測哪個版本生效。</p>
<p><span class="src src-abs">§3.3、Appendix B</span> 自動 grounding 檢查由三個模型各自判斷；論文寫的是三者一致才接受，否則回饋再生成。每個 persona 抽 5% 對話做人工作業；若發現軌跡與語句不符，整批退回。這與後續答題 criterion 的三裁判多數決是兩個不同程序。</p>''',
        "s-scale": r'''
<p><span class="src src-abs">Table 2</span> 三種跨度各有 10 個 persona。下表的 session 與操作以 persona 為單位，問題與 criterion 則以整個跨度為單位；分母不同，不可直接相減或當成同一種難度。</p>
<div class="table-wrap"><table class="results"><caption>Memora Table 2 摘錄：資料規模與記憶狀態變動</caption><thead><tr><th>跨度</th><th class="num">每人平均 session</th><th class="num">每人平均操作</th><th class="num">題數</th><th class="num">評分 criterion</th></tr></thead><tbody><tr><td>週</td><td class="num">155</td><td class="num">103.2</td><td class="num">150</td><td class="num">749</td></tr><tr><td>月</td><td class="num">615</td><td class="num">374.3</td><td class="num">150</td><td class="num">1421</td></tr><tr><td>季</td><td class="num">1991</td><td class="num">1171.4</td><td class="num">300</td><td class="num">4884</td></tr></tbody></table></div>
<p><span class="src src-mine">辨識設計</span> Table 1 的季度 mutation 14.8 是單題平均相關更新／刪除；Table 2 的 1171.4 是完整 persona 軌跡中的所有記憶操作。跨度變長時，多項壓力一起變，因此不能由此表估計「單增加一次 mutation」的因果效應。</p>''',
        "s-tasks": r'''
<p><span class="src src-abs">Figure 1、§3.5、§4.2</span> 原文的回想題詢問待辦；推理題把兩筆雜貨支出與預算合算；推薦題須在偏好由某類電影轉移後給新建議。每題有 presence criteria（有效內容應出現）與 absence criteria（失效內容不應出現）。</p>
<p><span class="src src-abs">§4.2、Appendix C</span> GPT-4.1、Claude Haiku 4.5 與 Gemini 2.5 Flash 對每個 criterion 給二元判定，採多數決。抽查的人類與裁判平均一致率 88.3%，人類標註者間 Cohen κ 為 0.86–0.90。這校驗判準可靠性，並非回答系統的任務成績。</p>''',
        "s-fama": r'''
<p><span class="src src-abs">§4.2、未編號 FAMA 公式</span> 對單題 \(q\)，令 \(P_q\) 為有效資訊 criteria 數，\(F_q\) 為排除失效資訊 criteria 數；通過數各為 \(p_q,f_q\)。原文的兩項準確率與權重可寫為：</p>
<div class="math-block">\[\mathrm{MPA}_q=\frac{p_q}{P_q},\qquad \mathrm{FAA}_q=\frac{f_q}{F_q}.\]</div>
<div class="math-block">\[\lambda_q=\frac{F_q}{P_q+F_q},\qquad
\mathrm{FAMA}_q=\max\{0,\mathrm{MPA}_q-\lambda_q(1-\mathrm{FAA}_q)\}.\]</div>
<p><span class="src src-mine">本站手算</span> 若 \(P_q=4,p_q=3,F_q=2,f_q=1\)，MPA=0.75、FAA=0.5、\(\lambda_q=1/3\)，所以 FAMA=\(3/4-(1/3)(1/2)=7/12\approx0.583\)。任務成績是同一任務、同一跨度內逐題平均後換為 0–100；不應先把三任務混成一個百分率。</p>''',
        "s-penalty": r'''
<p><span class="src src-abs">§5、Table 5</span> Table 5 先把三任務的 presence 分數相加，再在括號報告因失效記憶而扣去的分數。它是「三個 0–100 任務相加」，上限 300，不是單題 FAMA，也不是百分比準確率。</p>
<p><span class="src src-mine">逐列核算</span> 月度 A-Mem 約為 \(112.0-29.5=82.5\)；Nemori 約為 \(105.4-15.4=90.0\)。只看 presence 會讓 A-Mem 排在前面，計入舊資訊後排序反轉。表中數字經四捨五入；不可把 90.0 與另一表的 89.98 當成互相矛盾。</p>''',
        "s-results": r'''
<p><span class="src src-abs">§4.1、Table 3–4</span> Table 3 對「任務 × 跨度」各報一個 0–100 FAMA；例如 A-Mem 的回想由週 71.82 下降到季 40.78，LangMem 的推理為 30.00／14.00／11.00。Table 4 才把同一任務的三個跨度相加，上限 300。</p>
<p><span class="src src-mine">比較界線</span> 六個記憶代理共用 GPT-4o-mini 產生回答；直接讀對話的 LLM 使用其他模型。若兩組分數不同，骨幹與外部記憶同時不同，不能聲稱差額就是記憶架構造成。季度比週期低也同時伴隨歷史長度與 mutation 增加。</p>''',
        "s-errors": r'''
<p><span class="src src-abs">§6</span> 作者從三種任務各抽 25 個錯誤案例，共 75 個，針對每項任務表現最佳的記憶代理分類。推薦錯誤中 16/25 涉及未忘掉舊記憶、7/25 只取回部分偏好；回想 18/25 為部分取回；推理 25/25 都涉及相關記憶取回不全。</p>
<p><span class="src src-mine">統計讀法</span> 這些比例的條件是「已出錯且被抽中」，所以 16/25 不等於全部推薦題的 64% 都錯用舊記憶。分類可提示機制，卻未把檢索失敗與狀態更新失敗做互斥的因果分離。</p>''',
        "s-critique": r'''
<p><span class="src src-abs">Limitations、§3–6</span> 作者承認資料為合成對話，persona 與記憶類型受限，且評閱主要依賴 LLM 裁判。結論直接支持「在這套受控長歷史評測中，現有方法常漏掉有效資訊或沿用失效資訊」；它沒有直接測真實用戶部署的故障率。</p>
<p><span class="src src-mine">可否證延伸</span> 固定 session 數與總 token，獨立調整更新／刪除密度；再固定 mutation、改變歷史長度。分開報告 FAMA、presence 漏失、absence 違反及人工裁判分歧，才能判斷下降主要來自哪一種負擔。這是本站設計的後續實驗，非論文已完成的消融。</p>''',
    },
    "2610.09008": {
        "s-problem": r'''
<p><span class="src src-abs">§1、§3、Figure 1</span> 論文把待儲存記錄拆成外層報告框架與內嵌命題。若「助理曾考慮搬到巴黎」是實際發生的思考事件，這個事件可是真實記錄；內嵌的「已搬到巴黎」仍屬計畫分支，不能因為文字曾出現就寫成現況。</p>
<p><span class="src src-mine">失敗路徑</span> 把整段話壓成一個無 owner 的摘要，會丟失「誰承諾了哪個命題」的邊。之後查詢若只按字面相似度取回巴黎，就可能把未採納方案當作已採納答案；這就是作者要測的 premise contamination。</p>''',
        "s-formal": r'''
<p><span class="src src-abs">§3、公式 (1)</span> 候選記錄 \(c=(x,m,s)\) 包含前文 \(x\)、待存命題 \(m\)、報告框架 \(s\)。\(\omega(c)\) 是授權此命題的 discourse owner，\(\omega_0\) 是共享世界；二元標籤只問它能否作無條件共享前提：</p>
<div class="math-block">\[a(c)=\mathbf 1[\omega(c)=\omega_0],\qquad
\hat a(c)=\mathbf 1[g_\theta(c)\ge\tau],\qquad
R(q)=\operatorname{rank}_{\rho(q,m)}\{c:\omega(c)\in A(q)\}.\]</div>
<p><span class="src src-mine">區分層次</span> \(a(c)=0\) 是 scoped，不等於命題為假或記錄應被刪。檢索先依問題允許的 owner 集 \(A(q)\) 篩選，再用同一相關性 \(\rho\) 排序；相關性與授權在形式上是兩個獨立條件。</p>''',
        "s-route": r'''
<p><span class="src src-abs">§4.1、§6.1、Table 1</span> 作者在凍結的 Qwen2.5-3B-Instruct 找到 rank-16 ownership 子空間，對保持命題內容的配對例子交換目標與相反 scope donor 的子空間狀態。若只換這段表徵而門控跟著轉向 donor，便比純相關性更接近因果介入。</p>
<div class="table-wrap"><table class="results"><caption>CASK Table 1 摘錄：凍結寫入門的介入效果</caption><thead><tr><th>交換狀態</th><th class="num">朝 donor 的 Δp</th><th class="num">門控翻轉</th></tr></thead><tbody><tr><td>ownership 子空間，反向 scope</td><td class="num">0.715［0.656, 0.775］</td><td class="num">75.8%</td></tr><tr><td>互補子空間，反向 scope</td><td class="num">0.048［0.030, 0.069］</td><td class="num">6.6%</td></tr><tr><td>隨機 rank-16，範數匹配</td><td class="num">0.004［0.003, 0.005］</td><td class="num">0.6%</td></tr></tbody></table></div>
<p><span class="src src-mine">識別邊界</span> Δp 是朝 donor scope 的機率移動，不是附件準確率；區間按 conversation 聚類。結果證明這條路徑能控制指定模型的凍結寫入門，沒有證明所有模型都用同一 16 維表示。</p>''',
        "s-key": r'''
<p><span class="src src-abs">§4.1–4.2、公式 (2)–(4)</span> 六個固定 Yes/No 診斷產生有序隱狀態 \(H\in\mathbb R^{d\times6}\)。正交 ownership basis \(U\in\mathbb R^{d\times16}\) 與互補 basis \(U_\perp\) 將它分成兩塊；前四個診斷另取 Yes−No logit 差 \(\ell\in\mathbb R^4\)。</p>
<div class="math-block">\[G_\parallel=(U^\top H)^\top(U^\top H),\quad
G_\perp=(U_\perp^\top H)^\top(U_\perp^\top H),\quad
\phi=\operatorname{vech}(G_\parallel)\Vert\operatorname{vech}(G_\perp)\Vert\ell.\]</div>
<p><span class="src src-mine">維度推導</span> 每個 6×6 對稱 Gram 的含對角上三角有 \(6\cdot7/2=21\) 項，故 \(21+21+4=46\) 維。標準化後的 logistic regression 含 bias 共 47 個可學參數。若只存 \(H^\top H=G_\parallel+G_\perp\)，就看不出哪部分關係屬因果錨定的 ownership route。</p>''',
        "s-proof": r'''
<p><span class="src src-abs">§4.4、Theorem 1–3、Proposition 1</span> 在固定的 ownership 與 complement 子空間內各做正交換基 \(Q\)，有 \((QV)^\top(QV)=V^\top V\)，所以 key 不變。對有序點組，Gram 相等也意味兩組差一個正交映射；這是指定對稱下的完整性，不是跨任意模型重訓都可比較。</p>
<div class="math-block">\[\|(V+E)^\top(V+E)-V^\top V\|_F
\le 2\|V\|_2\|E\|_F+\|E\|_F^2.\]</div>
<p><span class="src src-mine">兩個邊界</span> 上界只控制固定特徵抽取下的小擾動；門控 margin 仍須大於特徵誤差乘分類權重範數，決策才保持。另取一維示例：\((G_\parallel,G_\perp)=(1,0)\) 與 \((0,1)\) 的 full Gram 都是 1，但授權類型不同，故相加不可逆。</p>''',
        "s-commit": r'''
<p><span class="src src-abs">§4.3、§5</span> 寫入時，候選命題先取得診斷 key 與 actual/scoped 附件；scoped 命題仍可存於其 owner 下。查詢時兩組使用同一 BM25 相關性，先按查詢可接受的 owner 篩除，再把可用記憶交給 reader。這使附件政策的效果不和檢索器變更混在一起。</p>
<div class="math-block">\[\text{候選命題}\;\longrightarrow\;\text{owner 附件}\;\longrightarrow\;
\text{query owner mask}\;\longrightarrow\;\text{同一 BM25 排序}\;\longrightarrow\;\text{reader}.\]</div>
<p><span class="src src-abs">§4.2、§6.5</span> 預設 \(\tau=0.5\)；CASK@R95 在 development conversations 選正則化與門檻，約束 actual admission 至少 95%，再最大化 scoped rejection。測試資料不參與選閾值，且兩個 operating point 服務不同安全／回想取捨。</p>''',
        "s-evidence": r'''
<p><span class="src src-abs">§5–6、Table 2–3</span> source-isolated folds 以對話為切分單位；Table 2 先評每筆記錄的 attachment，CASK 在 3B／1.5B 分別為 83.33%／79.82%，full hidden probe 為 72.12%／77.47%。Table 3 才把附件接到問題檢索與最終回答：CASK 的 recall@5 44.86%、污染 7.41%、EM 26.75%、F1 37.31%。</p>
<div class="table-wrap"><table class="results"><caption>CASK Table 2 摘錄：source-isolated attachment accuracy（%）</caption><thead><tr><th>表徵</th><th class="num">Qwen2.5-3B</th><th class="num">Qwen2.5-1.5B</th></tr></thead><tbody><tr><td>TF–IDF</td><td class="num">50.21</td><td class="num">50.21</td></tr><tr><td>Full hidden state</td><td class="num">72.12</td><td class="num">77.47</td></tr><tr><td>Random typed split + logits</td><td class="num">78.81</td><td class="num">73.35</td></tr><tr><td>CASK，τ=0.5</td><td class="num">83.33</td><td class="num">79.82</td></tr></tbody></table></div>
<p><span class="src src-mine">辨別分母</span> 附件準確率分母是候選記錄；recall@5 與 MRR 分母是查詢；EM/F1 分母是 reader 回答。平面記憶的 F1 為 40.19% 高於 CASK，但替代答案採納率 4.53% 也高於 CASK 的 1.03%。「較會答」與「較少用未授權前提」是不同目標，必須並列。</p>''',
        "s-factorial": r'''
<p><span class="src src-abs">§5、§6.2–6.5、Figure 2</span> scope-only 控制把配對的 evidence payload 保持逐位元相同，只改 reporting frame；payload-only 控制則固定 actual frame、改答案內容。各組 4860 筆記錄、2430 對。scope-only 中 CASK 附件準確率 78.70%，優勢集中在 owner 變化；固定 scope 後優勢消失。</p>
<p><span class="src src-mine">推論層級</span> 這比一般測試準確率更能排除「其實只讀內容字面」的捷徑，但仍侷限於作者構造的 frame 與兩款 Qwen 骨幹。CASK@R95 的污染相對 flat memory 降 11.19 個百分點、替代答案採納降 1.17 個百分點，是經 development 門檻校準的另一操作點，不能與 τ=0.5 混報成同一列。</p>''',
        "s-critique": r'''
<p><span class="src src-abs">§6.6–7、Appendix B–C</span> 75 個生成 tool-agent episode 產生 511 筆記錄：92 actual、419 scoped。受控對話訓練的 head 直接轉到 trace 時 balanced accuracy 只有 31.66%；報告的 91.10% 是 trace-adapted fallback，50% provenance 混合政策為 95.02%。完整 runtime ledger 的 100% 是標籤可得時的特權上界。</p>
<p><span class="src src-mine">外推與成本</span> 附錄的 A100 單診斷中位數 24.83 ms、六個批次 32.10 ms 只量診斷，不是完整代理延遲。本文主要驗證二元 owner 與同家族小模型；巢狀引用、不同家族模型、跨時間重訓與真實工具日誌仍需實驗。</p>''',
    },
}
