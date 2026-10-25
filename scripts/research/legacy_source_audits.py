"""Primary-source audit cards for the seven established lessons.

The older guides already contain detailed derivations and research blocks.  These
cards expose the original claim, its unit of evidence, and the inference limit
before the reader enters the guide.  They do not claim independent replication.
"""

AUDITS = {
    "2501.13956": {
        "version": "arXiv 2501.13956v1", "pages": 12,
        "pdf": "https://arxiv.org/pdf/2501.13956v1",
        "scope": "本次重查 §2–4 與 PDF 第 7 頁 Tables 2–3，並核對五維導讀的核心定位；沒有獨立重跑 Zep 服務。",
        "core": "<span class='src src-abs'>原文 §2–3</span> Graphiti 把 episode、實體、事實與時間有效區間連在持續更新的圖上；查詢時由圖搜尋、重排與組裝提供代理可用的內容。這篇主要提出系統架構，圖的形式化記號多屬本站教學重建，不能誤當原文定理。",
        "rows": [
            ("DMR", "§4.2：Zep 94.8%，MemGPT 93.4%", "同一 DMR 指標的觀察比較；不足以推出所有記憶任務都較佳。"),
            ("LongMemEvalₛ", "Table 2：gpt-4o-mini 55.4→63.8%；gpt-4o 60.2→71.2%", "基線為 full context；§4.3.1 未能成功納入 MemGPT，不可稱已擊敗它。"),
            ("原文 Delta", "Table 3：81.8→75.0% 的原文欄寫下降 9.06%，以 81.8 為基線重算約下降 8.31%", "本站保留原文欄並另列重算欄；不能將有疑義的百分比當精確增益。"),
        ],
        "boundary": "<span class='src src-mine'>審核結論</span> Table 2 的分數和 Table 3 的表內數字已對照頁面影像。Zep 是商業服務，文中的提示詞、延遲與評分設定不足以單靠 PDF 重現端到端部署表現；教材應持續區分作者系統主張與已測對照。",
    },
    "2601.18642": {
        "version": "arXiv 2601.18642v2", "pages": 5,
        "pdf": "https://arxiv.org/pdf/2601.18642v2",
        "scope": "本次重查 §2 的 Eq. 1–14、§3 的 Tables 1–3 與 Fig. 2 原始頁面；未獨立重跑三個資料集。",
        "core": "<span class='src src-abs'>原文 §2、Eq. 4–6</span> FadeMem 以兩層記憶、依重要性調整的衰減率、LLM 衝突裁決與融合管理記憶。核心衰減為 <span class='source-audit-formula'>v<sub>i</sub>(t) = v<sub>i</sub>(0) exp[−λ<sub>i</sub>(t−τ<sub>i</sub>)<sup>β<sub>i</sub></sup>]，λ<sub>i</sub> = λ<sub>base</sub>e<sup>−μ I<sub>i</sub>(t)</sup></span>。原文給 LML／SML 的形狀參數 0.8／1.2；『仿生』是設計動機，並非神經科學模型驗證。",
        "rows": [
            ("保留與容量", "Table 1：關鍵事實保留 82.1%；storage used 55.0%", "45% 是相對於 100% 儲存的減量，不是答題準確率增益。"),
            ("跨資料集", "Table 3：LoCoMo multi-hop F1 29.43、SRR 0.45", "與固定窗、LangChain、Mem0、MemGPT 的設定比較，不能直接外推真實代理。"),
            ("組件消融", "Fig. 2：完整模型 multi-hop 29.43；w/o Fusion 13.63", "圖中數值由頁面影像核對，移除組件是整體配置比較。"),
        ],
        "boundary": "<span class='src src-mine'>審核結論</span> Eq. 3 的雙門檻中間區間沒有公式分支；教材把『維持原層』明確標為由 hysteresis 文字推得。部分 decay／融合超參數與服務版本未完整固定，不能把可手算公式等同完整實驗可重現。",
    },
    "2604.14362": {
        "version": "arXiv 2604.14362v1", "pages": 20,
        "pdf": "https://arxiv.org/pdf/2604.14362v1",
        "scope": "本次重查 §3–6、PDF 第 6–7 頁 Tables 1–3 與附錄 Table 6；修正頁首的 PDF 頁數。",
        "core": "<span class='src src-abs'>原文 Abstract、§3–4</span> APEX-MEM 將對話寫入只增不刪的半結構化屬性圖，讓回答代理在檢索時使用 SchemaViewer、EntityLookUp、GraphSQL 與 Search 解決時間及衝突。『只增不刪』描述儲存策略；查詢時仍須裁決哪一版本適用。",
        "rows": [
            ("LoCoMo", "Table 1：GPT5 搭配 APEX-MEM Overall 88.88%", "對比方法的回答模型與建圖方法未必一致，不能把差額全歸因記憶。"),
            ("LongMemEval", "§6.3、Table 4：Claude 4.5 Sonnet 86.2%", "屬作者報告的任務分數，不是所有模型和資料集的通用準確率。"),
            ("工具消融", "Table 3：原文 Overall 77.19／79.45／87.00；依分類題數重算 78.07／80.83／84.92", "原文欄與重算欄不一致；教材保留兩欄並揭露權重。"),
        ],
        "boundary": "<span class='src src-mine'>審核結論</span> Table 1–3 的行列已對照原始頁面。原文也有其他表內敘述不一致，教材的異常值清單仍應保留，不以本站重算悄悄覆蓋作者數值；20 頁是所連 v1 PDF 的實際頁數。",
    },
    "2605.06527": {
        "version": "arXiv 2605.06527v1", "pages": 37,
        "pdf": "https://arxiv.org/pdf/2605.06527v1",
        "scope": "本次重查 §3–5、Figure 1、PDF 第 7 頁 Table 2 與附錄題目定義；未獨立重跑受測模型。",
        "core": "<span class='src src-abs'>原文 §3、Figure 1</span> STALE 測的是後來觀察未明說否定舊記憶，卻使其不再有效的 implicit conflict。400 個專家確認情境各有 State Resolution、Premise Resistance、Implicit Policy Adaptation 三種探針，形成 1,200 個查詢；Type I 是同屬性共指更新，Type II 是跨相依屬性的傳播更新。",
        "rows": [
            ("三種探針", "§3.2–3.3：SR、PR、IPA 各問不同失敗機制", "找回新證據不等於能抗拒帶有舊前提的問法。"),
            ("受測模型", "Table 2：Gemini-3.1-pro Overall 55.2%", "是該表 closed-source LLM 最佳列，不包含作者的 CUPMem 原型。"),
            ("作者原型", "Table 2：CUPMem Overall 68.0%", "和基礎模型不可混稱『最佳 LLM』；比較需保留方法類別。"),
        ],
        "boundary": "<span class='src src-mine'>審核結論</span> Table 2 的 Overall 是六種 Type × probe 設定的平均；單列高 SR 不代表 PR 或 IPA 也高。資料由專家確認但情境仍是受控建構，不能用 55.2% 估計真實用戶個人化系統的故障率。",
    },
    "2606.30306": {
        "version": "arXiv 2606.30306v1", "pages": 136,
        "pdf": "https://arxiv.org/pdf/2606.30306v1",
        "scope": "本次重查 §2–4、Figure 4、§9 的 AOEP-v0 描述；136 頁綜述未逐條重新驗算所有參考文獻。",
        "core": "<span class='src src-abs'>原文 §2–4</span> Always-On Agents 是持久狀態系統的綜述：分析單位不只可檢索記憶，還包括權限、承諾、執行結果、來源與稽核紀錄。六個診斷軸為 authority、scope、mutability、provenance、recoverability、actionability；生命週期區分前向的寫入／取回與返回的更新／遺忘／稽核／回滾。",
        "rows": [
            ("語料範圍", "§3：435 篇經編碼工作", "作者把它當有範圍的文獻地圖，不是完整領域普查。"),
            ("覆蓋不對稱", "Figure 4：retrieve 欄合計 269；rollback 欄合計 27", "欄位是跨分區多標籤 incidence，不能讀成互斥論文數或成功率。"),
            ("評測合約", "§9、AOEP-v0：評估狀態突變、恢復與治理義務", "是提出的 pilot protocol，不等於 435 篇都經此協議實測。"),
        ],
        "boundary": "<span class='src src-mine'>審核結論</span> Figure 4 的熱圖與欄位總數已對照頁面影像。全文規模大，本站保留『未逐條覆核引文』界線；分類頻數支持研究議題分布，不能證明某機制在部署中比較安全。",
    },
    "2608.19652": {
        "version": "arXiv 2608.19652v1", "pages": 23,
        "pdf": "https://arxiv.org/pdf/2608.19652v1",
        "scope": "本次重查 §3–6、PDF 第 19 頁 Table 10 與附錄的分母說明；原先無法取得的 arXiv 主來源現已核對。",
        "core": "<span class='src src-abs'>原文 §3–5</span> StateMemBench 把『追蹤目前有效狀態』與單純回想分開：234 個多 session 情境產生 322 個可評分 probe，closed-pool 評分辨認目前版本、過期版本與其他錯誤。StateMem 追蹤 supersession 與依賴關係，查詢時重算受影響的衍生狀態；StateMemWrapper 是另一種只調回答提示的處理。",
        "rows": [
            ("DeepSeek-V4-Flash", "Table 10：同骨幹最佳基線 0.205→StateMem 0.363", "約 1.8 倍是該設定的 current-state accuracy，不是所有任務的普遍倍數。"),
            ("Qwen-3.5-9B", "Table 10：記憶系統基線 0.149→StateMem 0.233", "約 1.6 倍；與前列不同骨幹與比較集合，不能合併分母。"),
            ("評分單位", "Table 10：n=322 probes；status 116、sequence 72、salience 51、anti-trap 39、compound 44", "234 是情境數，322 才是此表的評分 probe 數。"),
        ],
        "boundary": "<span class='src src-mine'>審核結論</span> Table 10 的原始列與分母已對照頁面影像。作者在 Limitations 說 StateMemBench 為合成資料，且設定長度約 3k／7–15k tokens，尚未達真實長期部署的所有情境；本站不可把封閉候選池的結果讀成開放世界正確率。",
    },
    "dekleer-1986-atms": {
        "version": "Artificial Intelligence 28(2), 127–162 (1986)", "pages": 36,
        "pdf": "https://www.dekleer.org/Publications/An%20Assumption-Based%20TMS.pdf",
        "scope": "本次對照作者公開的 36 頁掃描版，檢查 §4.4 標籤／節點定義及頁面影像；第 1 頁倒置，未比對舊教材所用掃描檔雜湊。",
        "core": "<span class='src src-abs'>原文 §4.1–4.4</span> ATMS 不把每個假設組合都當一份完整資料庫。問題解決器提供 datum 與 justification；ATMS 為節點維護 label，列出使命題成立的最小一致 assumption environments，並用 nogood 排除矛盾環境。原文的節點資料結構包含 datum、label、justifications，label 由 ATMS 計算，問題解決器不應直接改寫。",
        "rows": [
            ("前提與假設", "§4.4：premise 的 label 含空環境；assumption 含自身的 singleton 環境", "兩種節點的支持條件不同，不可把 premise 當成普通假設。"),
            ("最小環境", "§4.5–4.7：只保留足以支持命題的最小一致環境", "不是列出所有 2ⁿ 種完整世界；最壞情況仍可能很大。"),
            ("矛盾處理", "§4.3、§4.7：nogood 的超集不再可用", "這是假設環境的排除，不是刪掉歷史節點。"),
        ],
        "boundary": "<span class='src src-mine'>審核結論</span> 原版第 127 頁在作者 PDF 中倒置；文字擷取順序會誤導讀者，關鍵定義須看頁面影像。ATMS 是符號式真值維護，與 LLM 代理的神經記憶方法是結構上的對照，不能說後者直接實作了原算法。",
    },
}
