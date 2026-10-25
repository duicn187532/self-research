"""CASK questions checked against arXiv:2610.09008v1, §§1–7 and Appendix A–C."""
from build import Q

BANK = {
"paper": "2610.09008", "title": "範圍邊界守門人",
"sections": {
"s-problem": {"qs": [
 Q("ca-p1","method","同一命題在假設與現實中出現，寫入時缺了什麼？",["授權命題的 discourse owner","句子的 token 長度與位置","命題的語法樹層級與高度","檢索結果的 BM25 相關分數"],"§1、§3：內容之外還須知道哪個世界或說話者授權。"),
 Q("ca-p2","reason","『曾考慮巴黎』可保存，但哪段不能當世界事實？",["內嵌的『已搬去巴黎』","考慮過的過程事件","這次推理曾有分支","計畫最後被拒絕"],"§4.3：過程可是真實元事件，計畫內容仍 scoped。")
]},
"s-formal": {"qs": [
 Q("ca-fo1","method","a(c)=1 的正式條件是什麼？",["owner 是共享世界","候選記錄的字數足夠短","BM25 的相關分數足夠高","讀者最後的回答完全正確"],"§3 公式 (1)：只有 ω(c)=ω₀ 才是 actual。"),
 Q("ca-fo2","reason","計畫內容被標 scoped，代表什麼？",["不能無條件當現況前提","命題已被證明為假","事件紀錄也必須刪除","任何問題都不可檢索"],"§3：nonactual 是有範圍，不等於虛假或刪除。")
]},
"s-route": {"qs": [
 Q("ca-r1","method","Table 1 的 opposite-scope 介入操縱什麼？",["ownership 子空間狀態","命題的字面答案內容","BM25 的共同排序結果","訓練集的人物與對話數"],"§4.1、Table 1：交換 route，保持 payload。"),
 Q("ca-r2","critique","Δp=0.715 最恰當的解讀是？",["寫入機率朝 donor scope 改變","附件正確率提升了 71.5 個百分點","最終答題率增加了 71.5 個百分點","污染率相對下降了 71.5 個百分點"],"Table 1 明定 Δp 是往 donor scope 的機率變化。")
]},
"s-key": {"tier":"elite","ask":3,"qs": [
 Q("ca-k1","reason","兩塊 6×6 對稱 Gram 加四 logit 差共有幾維？",["46","72","42","16"],"§4.1：每塊上三角 21，合計 42，加 4 = 46。"),
 Q("ca-k2","method","為何保留 G∥ 與 G⊥ 兩塊而不只存總 Gram？",["保留關係屬於哪個子空間","讓 Gram 不再對稱","使 key 隨旋轉而變","避免取得模型 logit"],"§4.2：總和 HᵀH 會失去 ownership-responsive/complement 的型別分配。"),
 Q("ca-k3","critique","46 維比 full hidden 更準，能推出什麼？",["在所測附件任務較準","任何模型都可直接部署","所有回答 F1 都最高","不需訓練 projector"],"Table 2 僅在所測模型與任務顯示較高 attachment accuracy。")
]},
"s-proof": {"qs": [
 Q("ca-f1","method","定理 1 的不變性需要哪個條件？",["固定子空間內正交換基","任意更換模型權重","任意更換六個提示","改用非正交縮放"],"§4.4：正交旋轉保持內積與 Gram，其他變更不在定理內。"),
 Q("ca-f2","reason","兩組有序點的 Gram 相同，定理 2 說它們？",["在正交變換下等價","一定逐座標完全相同","必有相同語句內容","必有相同輸出 logits"],"定理 2：相同 Gram 當且僅當存在正交映射；限於所述有序配置。")
]},
"s-commit": {"qs": [
 Q("ca-c1","method","查詢時在共同 BM25 排名後，CASK 再做什麼？",["依 owner 邊遮罩不允許的記錄","把所有 scoped 記錄永久刪除","重新訓練 reader 的權重","只保留最長的五筆記錄"],"§4.3：共同相關性排序，附件邊控制可作前提的範圍。"),
 Q("ca-c2","critique","有精確執行日誌時，原文部署策略優先用？",["執行來源標籤","CASK 的推測直接覆蓋日誌","只看候選句的語意相關性","一律拒絕工具返回的所有觀察"],"§6.6：provenance-first hybrid，缺標籤時再用 CASK fallback。")
]},
"s-evidence": {"tier":"elite","ask":3,"qs": [
 Q("ca-e1","critique","83.33% 在 Table 2 是何種指標？",["3B 的附件分類準確率","3B 的回答 F1","1.5B 的衝突採納率","全部 trace 的平衡準確率"],"Table 2：3B source-isolated attachment accuracy。"),
 Q("ca-e2","reason","Table 3 中 CASK 相較 full Gram 的污染差為？",["下降 0.20 個百分點","下降 2.05 個百分點","上升 1.44 個百分點","下降 7.41 個百分點"],"7.61%−7.41%=0.20 個百分點；不要與 attachment 增益混淆。"),
 Q("ca-e3","critique","flat memory F1 高但有何代價？",["替代衝突答案採納率較高","附件準確率一定 100%","BM25 無法排序","所有實際事實被拒絕"],"Table 3：flat 的 F1 40.19%，替代答案採納 4.53%，高於 CASK 的 1.03%。")
]},
"s-factorial": {"qs": [
 Q("ca-fa1","method","scope-only 控制固定哪個因素？",["命題 payload 完全相同","每句的報告框架不同","每筆的 owner 不變","所有答案都從同一人來"],"§5：成對 payload byte-identical，只改 reporting frame。"),
 Q("ca-fa2","critique","CASK@R95 的門檻應在哪裡選？",["開發集","測試集","讀者答案後","每題事後調"],"§4.2、§5：以 development conversations 選擇，測試集保持未觸碰。")
]},
"s-critique": {"qs": [
 Q("ca-l1","critique","trace 的 100% runtime provenance 為何是上界？",["直接用完整執行標籤","由 CASK 零樣本推斷","只抽取最容易的記錄","只在一個 episode 評估"],"Table 5：完整 ledger 是 privileged oracle，非模型門控自身表現。"),
 Q("ca-l2","method","受控 head 直接轉 trace 的結果提示什麼？",["需要適應明顯領域偏移","可直接零樣本泛化","附錄沒有 trace 樣本","BM25 已被替換為向量檢索"],"附錄 B：31.66% balanced accuracy；trace 成績使用 trace-adapted head。")
]}
},
"boss":{"qs":[
 Q("ca-b1","method","相關性很高的巴黎計畫可否回答『實際搬去哪』？",["不可，計畫 scope 不授權現況","可以，BM25 分數高就有授權","可以，只要這段記錄曾經被生成","不可，所有計畫內容都應永久刪除"],"§3–4：相關性不是世界事實的許可。",["s-problem","s-commit"]),
 Q("ca-b2","reason","6 個診斷、兩個對稱 Gram、四個 logit 差得到？",["46 維且在指定換基下不變","72 維且任意模型皆不變","42 維且無需輸出 logits","16 維且不需投影器"],"§4.1–4.4：21+21+4=46；僅固定子空間的正交換基不變。",["s-key","s-proof"]),
 Q("ca-b3","critique","哪個主張超出 Table 2–3 支持範圍？",["所有模型更新後 key 必然相容","兩個 Qwen 規模附件改善","污染與 QA 指標須分看","scope-only 控制支持授權差異"],"§4.4 和 §7：定理與實驗都未涵蓋任意模型更新。",["s-proof","s-evidence"]),
 Q("ca-b4","method","provenance-first 混合策略的合理順序是？",["先用可得日誌，缺失才推 scope","先丟棄日誌，永遠只用 CASK","先用 BM25，直接寫入所有候選","先訓練 reader，再取消 scope"],"§6.6：執行日誌與命題層判斷互補。",["s-commit","s-critique"]),
 Q("ca-b5","reason","Table 3 的 7.61→7.41 是哪種改善？",["污染率少 0.20 個百分點","EM 多 0.20 個百分點","F1 多 0.20 個百分點","附件率多 7.41 個百分點"],"Table 3 污染率，數值越低越好；差 0.20 個百分點。",["s-evidence","s-commit"]),
 Q("ca-b6","critique","31.66% 的直接轉移結果最能提醒什麼？",["trace 表現依賴重新適配","已證明零樣本轉移成功","所有日誌都缺失","二元 owner 已涵蓋巢狀信念"],"附錄 B 與 §6.6：受控資料 head 直接轉 trace 低；表中 fallback 是 trace-adapted。",["s-route","s-critique"])
]}
}
