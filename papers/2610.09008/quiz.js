// Built by scripts/quiz/build.py from scripts/quiz/q_cask.py; edit that file, not this one.
window.STUDY_QUIZ = {
 "paper": "2610.09008",
 "title": "範圍邊界守門人",
 "sections": {
  "s-problem": {
   "qs": [
    {
     "id": "ca-p1",
     "facet": "method",
     "q": "同一命題在假設與現實中出現，寫入時缺了什麼？",
     "opts": [
      "授權命題的 discourse owner",
      "句子的 token 長度與位置",
      "命題的語法樹層級與高度",
      "檢索結果的 BM25 相關分數"
     ],
     "a": 0,
     "why": "§1、§3：內容之外還須知道哪個世界或說話者授權。",
     "src": [
      "s-problem"
     ]
    },
    {
     "id": "ca-p2",
     "facet": "reason",
     "q": "『曾考慮巴黎』可保存，但哪段不能當世界事實？",
     "opts": [
      "內嵌的『已搬去巴黎』",
      "考慮過的過程事件",
      "這次推理曾有分支",
      "計畫最後被拒絕"
     ],
     "a": 0,
     "why": "§4.3：過程可是真實元事件，計畫內容仍 scoped。",
     "src": [
      "s-problem"
     ]
    }
   ]
  },
  "s-formal": {
   "qs": [
    {
     "id": "ca-fo1",
     "facet": "method",
     "q": "a(c)=1 的正式條件是什麼？",
     "opts": [
      "owner 是共享世界",
      "候選記錄的字數足夠短",
      "BM25 的相關分數足夠高",
      "讀者最後的回答完全正確"
     ],
     "a": 0,
     "why": "§3 公式 (1)：只有 ω(c)=ω₀ 才是 actual。",
     "src": [
      "s-formal"
     ]
    },
    {
     "id": "ca-fo2",
     "facet": "reason",
     "q": "計畫內容被標 scoped，代表什麼？",
     "opts": [
      "不能無條件當現況前提",
      "命題已被證明為假",
      "事件紀錄也必須刪除",
      "任何問題都不可檢索"
     ],
     "a": 0,
     "why": "§3：nonactual 是有範圍，不等於虛假或刪除。",
     "src": [
      "s-formal"
     ]
    }
   ]
  },
  "s-route": {
   "qs": [
    {
     "id": "ca-r1",
     "facet": "method",
     "q": "Table 1 的 opposite-scope 介入操縱什麼？",
     "opts": [
      "ownership 子空間狀態",
      "命題的字面答案內容",
      "BM25 的共同排序結果",
      "訓練集的人物與對話數"
     ],
     "a": 0,
     "why": "§4.1、Table 1：交換 route，保持 payload。",
     "src": [
      "s-route"
     ]
    },
    {
     "id": "ca-r2",
     "facet": "critique",
     "q": "Δp=0.715 最恰當的解讀是？",
     "opts": [
      "寫入機率朝 donor scope 改變",
      "附件正確率提升了 71.5 個百分點",
      "最終答題率增加了 71.5 個百分點",
      "污染率相對下降了 71.5 個百分點"
     ],
     "a": 0,
     "why": "Table 1 明定 Δp 是往 donor scope 的機率變化。",
     "src": [
      "s-route"
     ]
    }
   ]
  },
  "s-key": {
   "tier": "elite",
   "ask": 3,
   "qs": [
    {
     "id": "ca-k1",
     "facet": "reason",
     "q": "兩塊 6×6 對稱 Gram 加四 logit 差共有幾維？",
     "opts": [
      "46",
      "72",
      "42",
      "16"
     ],
     "a": 0,
     "why": "§4.1：每塊上三角 21，合計 42，加 4 = 46。",
     "src": [
      "s-key"
     ]
    },
    {
     "id": "ca-k2",
     "facet": "method",
     "q": "為何保留 G∥ 與 G⊥ 兩塊而不只存總 Gram？",
     "opts": [
      "保留關係屬於哪個子空間",
      "讓 Gram 不再對稱",
      "使 key 隨旋轉而變",
      "避免取得模型 logit"
     ],
     "a": 0,
     "why": "§4.2：總和 HᵀH 會失去 ownership-responsive/complement 的型別分配。",
     "src": [
      "s-key"
     ]
    },
    {
     "id": "ca-k3",
     "facet": "critique",
     "q": "46 維比 full hidden 更準，能推出什麼？",
     "opts": [
      "在所測附件任務較準",
      "任何模型都可直接部署",
      "所有回答 F1 都最高",
      "不需訓練 projector"
     ],
     "a": 0,
     "why": "Table 2 僅在所測模型與任務顯示較高 attachment accuracy。",
     "src": [
      "s-key"
     ]
    }
   ]
  },
  "s-proof": {
   "qs": [
    {
     "id": "ca-f1",
     "facet": "method",
     "q": "定理 1 的不變性需要哪個條件？",
     "opts": [
      "固定子空間內正交換基",
      "任意更換模型權重",
      "任意更換六個提示",
      "改用非正交縮放"
     ],
     "a": 0,
     "why": "§4.4：正交旋轉保持內積與 Gram，其他變更不在定理內。",
     "src": [
      "s-proof"
     ]
    },
    {
     "id": "ca-f2",
     "facet": "reason",
     "q": "兩組有序點的 Gram 相同，定理 2 說它們？",
     "opts": [
      "在正交變換下等價",
      "一定逐座標完全相同",
      "必有相同語句內容",
      "必有相同輸出 logits"
     ],
     "a": 0,
     "why": "定理 2：相同 Gram 當且僅當存在正交映射；限於所述有序配置。",
     "src": [
      "s-proof"
     ]
    }
   ]
  },
  "s-commit": {
   "qs": [
    {
     "id": "ca-c1",
     "facet": "method",
     "q": "查詢時在共同 BM25 排名後，CASK 再做什麼？",
     "opts": [
      "依 owner 邊遮罩不允許的記錄",
      "把所有 scoped 記錄永久刪除",
      "重新訓練 reader 的權重",
      "只保留最長的五筆記錄"
     ],
     "a": 0,
     "why": "§4.3：共同相關性排序，附件邊控制可作前提的範圍。",
     "src": [
      "s-commit"
     ]
    },
    {
     "id": "ca-c2",
     "facet": "critique",
     "q": "有精確執行日誌時，原文部署策略優先用？",
     "opts": [
      "執行來源標籤",
      "CASK 的推測直接覆蓋日誌",
      "只看候選句的語意相關性",
      "一律拒絕工具返回的所有觀察"
     ],
     "a": 0,
     "why": "§6.6：provenance-first hybrid，缺標籤時再用 CASK fallback。",
     "src": [
      "s-commit"
     ]
    }
   ]
  },
  "s-evidence": {
   "tier": "elite",
   "ask": 3,
   "qs": [
    {
     "id": "ca-e1",
     "facet": "critique",
     "q": "83.33% 在 Table 2 是何種指標？",
     "opts": [
      "3B 的附件分類準確率",
      "3B 的回答 F1",
      "1.5B 的衝突採納率",
      "全部 trace 的平衡準確率"
     ],
     "a": 0,
     "why": "Table 2：3B source-isolated attachment accuracy。",
     "src": [
      "s-evidence"
     ]
    },
    {
     "id": "ca-e2",
     "facet": "reason",
     "q": "Table 3 中 CASK 相較 full Gram 的污染差為？",
     "opts": [
      "下降 0.20 個百分點",
      "下降 2.05 個百分點",
      "上升 1.44 個百分點",
      "下降 7.41 個百分點"
     ],
     "a": 0,
     "why": "7.61%−7.41%=0.20 個百分點；不要與 attachment 增益混淆。",
     "src": [
      "s-evidence"
     ]
    },
    {
     "id": "ca-e3",
     "facet": "critique",
     "q": "flat memory F1 高但有何代價？",
     "opts": [
      "替代衝突答案採納率較高",
      "附件準確率一定 100%",
      "BM25 無法排序",
      "所有實際事實被拒絕"
     ],
     "a": 0,
     "why": "Table 3：flat 的 F1 40.19%，替代答案採納 4.53%，高於 CASK 的 1.03%。",
     "src": [
      "s-evidence"
     ]
    }
   ]
  },
  "s-factorial": {
   "qs": [
    {
     "id": "ca-fa1",
     "facet": "method",
     "q": "scope-only 控制固定哪個因素？",
     "opts": [
      "命題 payload 完全相同",
      "每句的報告框架不同",
      "每筆的 owner 不變",
      "所有答案都從同一人來"
     ],
     "a": 0,
     "why": "§5：成對 payload byte-identical，只改 reporting frame。",
     "src": [
      "s-factorial"
     ]
    },
    {
     "id": "ca-fa2",
     "facet": "critique",
     "q": "CASK@R95 的門檻應在哪裡選？",
     "opts": [
      "開發集",
      "測試集",
      "讀者答案後",
      "每題事後調"
     ],
     "a": 0,
     "why": "§4.2、§5：以 development conversations 選擇，測試集保持未觸碰。",
     "src": [
      "s-factorial"
     ]
    }
   ]
  },
  "s-critique": {
   "qs": [
    {
     "id": "ca-l1",
     "facet": "critique",
     "q": "trace 的 100% runtime provenance 為何是上界？",
     "opts": [
      "直接用完整執行標籤",
      "由 CASK 零樣本推斷",
      "只抽取最容易的記錄",
      "只在一個 episode 評估"
     ],
     "a": 0,
     "why": "Table 5：完整 ledger 是 privileged oracle，非模型門控自身表現。",
     "src": [
      "s-critique"
     ]
    },
    {
     "id": "ca-l2",
     "facet": "method",
     "q": "受控 head 直接轉 trace 的結果提示什麼？",
     "opts": [
      "需要適應明顯領域偏移",
      "可直接零樣本泛化",
      "附錄沒有 trace 樣本",
      "BM25 已被替換為向量檢索"
     ],
     "a": 0,
     "why": "附錄 B：31.66% balanced accuracy；trace 成績使用 trace-adapted head。",
     "src": [
      "s-critique"
     ]
    }
   ]
  },
  "s-owner-example": {
   "qs": [
    {
     "id": "ca-ow1",
     "facet": "reason",
     "q": "真實發生『提出巴黎方案』，能推出什麼？",
     "opts": [
      "只證明曾提出方案",
      "已搬到巴黎",
      "方案已獲採納",
      "巴黎是現況地址"
     ],
     "a": 0,
     "why": "§3：外層事件與內嵌計畫命題有不同 owner。",
     "src": [
      "s-owner-example"
     ]
    },
    {
     "id": "ca-ow2",
     "facet": "method",
     "q": "CASK 的二元 actual 指標針對什麼？",
     "opts": [
      "候選命題的授權",
      "整段對話的真偽",
      "BM25 排名高低",
      "所有事件的發生時間"
     ],
     "a": 0,
     "why": "§3 公式 (1)：檢查候選命題是否獲共享世界授權。",
     "src": [
      "s-owner-example"
     ]
    }
   ]
  },
  "s-protocol": {
   "qs": [
    {
     "id": "ca-pr1",
     "facet": "method",
     "q": "source-isolated folds 依何者切分？",
     "opts": [
      "完整對話",
      "單一 token",
      "單一候選記錄",
      "回答字數"
     ],
     "a": 0,
     "why": "§5：十段 LoCoMo 對話是來源隔離單位。",
     "src": [
      "s-protocol"
     ]
    },
    {
     "id": "ca-pr2",
     "facet": "critique",
     "q": "信賴區間為何按對話重抽樣？",
     "opts": [
      "同源題目相互相關",
      "每筆記錄完全獨立",
      "只有一筆測試記錄",
      "因為未量回答品質"
     ],
     "a": 0,
     "why": "§5：同一對話產生多筆相關記錄與題目。",
     "src": [
      "s-protocol"
     ]
    }
   ]
  },
  "s-routing": {
   "qs": [
    {
     "id": "ca-rt1",
     "facet": "reason",
     "q": "3B 的 91.78% 與 75.8% 各表示什麼？",
     "opts": [
      "空間路由與門控翻轉",
      "兩種回答 F1",
      "兩種污染率",
      "兩個模型的延遲"
     ],
     "a": 0,
     "why": "§6.1：兩段介入測量不同的下游步驟。",
     "src": [
      "s-routing"
     ]
    },
    {
     "id": "ca-rt2",
     "facet": "critique",
     "q": "介入證據的外推邊界是？",
     "opts": [
      "指定凍結模型與構造資料",
      "所有模型家族皆適用",
      "所有巢狀 owner 皆解決",
      "不需維持命題內容"
     ],
     "a": 0,
     "why": "§6.1：因果效果在已測模型與資料成立。",
     "src": [
      "s-routing"
     ]
    }
   ]
  },
  "s-ablation": {
   "qs": [
    {
     "id": "ca-ab1",
     "facet": "reason",
     "q": "3B 完整 CASK 比隨機 typed split 高多少？",
     "opts": [
      "4.52 個百分點",
      "83.33 個百分點",
      "78.81 個百分點",
      "0.20 個百分點"
     ],
     "a": 0,
     "why": "Table 2：83.33−78.81=4.52，指附件分類。",
     "src": [
      "s-ablation"
     ]
    },
    {
     "id": "ca-ab2",
     "facet": "critique",
     "q": "Table 2 的差值不能直接當成什麼？",
     "opts": [
      "最終回答 F1 增益",
      "附件分類差異",
      "同 fold 的配置比較",
      "兩骨幹的觀察成績"
     ],
     "a": 0,
     "why": "Table 2 的分母是候選記錄；reader 結果見 Table 3。",
     "src": [
      "s-ablation"
     ]
    }
   ]
  },
  "s-transfer": {
   "qs": [
    {
     "id": "ca-tr1",
     "facet": "critique",
     "q": "trace-adapted 的 91.10% 可稱零樣本轉移嗎？",
     "opts": [
      "不可，head 已重新適配",
      "可，沒有用 trace 資料",
      "可，等同完整日誌",
      "不可，因為它是 F1"
     ],
     "a": 0,
     "why": "§6.6：直接轉移為 31.66% balanced accuracy。",
     "src": [
      "s-transfer"
     ]
    },
    {
     "id": "ca-tr2",
     "facet": "method",
     "q": "同時留出提示與框架的成績約為？",
     "opts": [
      "70.16%",
      "90.94%",
      "93.44%",
      "31.66%"
     ],
     "a": 0,
     "why": "§6.1：joint shift 比單獨留出更難。",
     "src": [
      "s-transfer"
     ]
    }
   ]
  }
 },
 "boss": {
  "qs": [
   {
    "id": "ca-b1",
    "facet": "method",
    "q": "相關性很高的巴黎計畫可否回答『實際搬去哪』？",
    "opts": [
     "不可，計畫 scope 不授權現況",
     "可以，BM25 分數高就有授權",
     "可以，只要這段記錄曾經被生成",
     "不可，所有計畫內容都應永久刪除"
    ],
    "a": 0,
    "why": "§3–4：相關性不是世界事實的許可。",
    "src": [
     "s-problem",
     "s-commit"
    ]
   },
   {
    "id": "ca-b2",
    "facet": "reason",
    "q": "6 個診斷、兩個對稱 Gram、四個 logit 差得到？",
    "opts": [
     "46 維且在指定換基下不變",
     "72 維且任意模型皆不變",
     "42 維且無需輸出 logits",
     "16 維且不需投影器"
    ],
    "a": 0,
    "why": "§4.1–4.4：21+21+4=46；僅固定子空間的正交換基不變。",
    "src": [
     "s-key",
     "s-proof"
    ]
   },
   {
    "id": "ca-b3",
    "facet": "critique",
    "q": "哪個主張超出 Table 2–3 支持範圍？",
    "opts": [
     "所有模型更新後 key 必然相容",
     "兩個 Qwen 規模附件改善",
     "污染與 QA 指標須分看",
     "scope-only 控制支持授權差異"
    ],
    "a": 0,
    "why": "§4.4 和 §7：定理與實驗都未涵蓋任意模型更新。",
    "src": [
     "s-proof",
     "s-evidence"
    ]
   },
   {
    "id": "ca-b4",
    "facet": "method",
    "q": "provenance-first 混合策略的合理順序是？",
    "opts": [
     "先用可得日誌，缺失才推 scope",
     "先丟棄日誌，永遠只用 CASK",
     "先用 BM25，直接寫入所有候選",
     "先訓練 reader，再取消 scope"
    ],
    "a": 0,
    "why": "§6.6：執行日誌與命題層判斷互補。",
    "src": [
     "s-commit",
     "s-critique"
    ]
   },
   {
    "id": "ca-b5",
    "facet": "reason",
    "q": "Table 3 的 7.61→7.41 是哪種改善？",
    "opts": [
     "污染率少 0.20 個百分點",
     "EM 多 0.20 個百分點",
     "F1 多 0.20 個百分點",
     "附件率多 7.41 個百分點"
    ],
    "a": 0,
    "why": "Table 3 污染率，數值越低越好；差 0.20 個百分點。",
    "src": [
     "s-evidence",
     "s-commit"
    ]
   },
   {
    "id": "ca-b6",
    "facet": "critique",
    "q": "31.66% 的直接轉移結果最能提醒什麼？",
    "opts": [
     "trace 表現依賴重新適配",
     "已證明零樣本轉移成功",
     "所有日誌都缺失",
     "二元 owner 已涵蓋巢狀信念"
    ],
    "a": 0,
    "why": "附錄 B 與 §6.6：受控資料 head 直接轉 trace 低；表中 fallback 是 trace-adapted。",
    "src": [
     "s-route",
     "s-critique"
    ]
   }
  ]
 }
};
