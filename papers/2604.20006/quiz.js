// Built by scripts/quiz/build.py from scripts/quiz/q_memora.py; edit that file, not this one.
window.STUDY_QUIZ = {
 "paper": "2604.20006",
 "title": "有效記憶守護者",
 "sections": {
  "s-problem": {
   "qs": [
    {
     "id": "me-p1",
     "facet": "method",
     "q": "Memora 對既有回想題的核心批評是？",
     "opts": [
      "太少測跨輪整合與更新",
      "完全不測資訊檢索",
      "只測影像而不測文字",
      "全靠真人逐題回答"
     ],
     "a": 0,
     "why": "§1–2、Table 1：重點是 consolidation 與 mutation 的壓力不足。",
     "src": [
      "s-problem"
     ]
    },
    {
     "id": "me-p2",
     "facet": "critique",
     "q": "Table 1 的 LoCoMo 1.3 代表什麼？",
     "opts": [
      "每題平均整合 1.3 個 session",
      "系統平均準確率為 1.3%",
      "平均 1.3 次記憶刪除",
      "每個 persona 有 1.3 個問題"
     ],
     "a": 0,
     "why": "Table 1 的 consolidation 欄，不是結果分數。",
     "src": [
      "s-problem"
     ]
    }
   ]
  },
  "s-data": {
   "qs": [
    {
     "id": "me-d1",
     "facet": "method",
     "q": "Memora 為何先模擬狀態軌跡再生成對話？",
     "opts": [
      "先確定每輪有效記憶的 gold",
      "先把模型的答案寫進對話",
      "先讓真人選擇最佳推薦",
      "先把裁判分數固定為滿分"
     ],
     "a": 0,
     "why": "§3：狀態前後快照提供有效／失效的真值。",
     "src": [
      "s-data"
     ]
    },
    {
     "id": "me-d2",
     "facet": "critique",
     "q": "合成狀態軌跡最直接的外推限制是？",
     "opts": [
      "真實更新可能更含糊且矛盾",
      "資料完全沒有更新操作",
      "所有題都只有一個 session",
      "不能形成任何 gold 答案"
     ],
     "a": 0,
     "why": "Limitations：真實互動有未明說的更新和矛盾訊號。",
     "src": [
      "s-data"
     ]
    }
   ]
  },
  "s-scale": {
   "qs": [
    {
     "id": "me-s1",
     "facet": "reason",
     "q": "季度的 94 與 1171.4 為何不能直接相比？",
     "opts": [
      "單題最多更新與每人全部操作不同",
      "一個是準確率另一個是 F1",
      "前者是週資料後者是月資料",
      "兩者都代表同一題的總更新"
     ],
     "a": 0,
     "why": "Table 1 的 94 是單題最大 mutation；Table 2 的 1171.4 是 persona 全軌跡平均操作。",
     "src": [
      "s-scale"
     ]
    },
    {
     "id": "me-s2",
     "facet": "critique",
     "q": "週到季成績下降能單獨歸因於歷史變長嗎？",
     "opts": [
      "不能，操作量等因素也一起變",
      "能，因為模型權重保持不變",
      "能，因為題數相同",
      "不能，因為季度完全沒有更新"
     ],
     "a": 0,
     "why": "Table 2：session 與 operations 同時增加；缺少隔離因素的對照。",
     "src": [
      "s-scale"
     ]
    }
   ]
  },
  "s-tasks": {
   "qs": [
    {
     "id": "me-t1",
     "facet": "method",
     "q": "三種下游任務是？",
     "opts": [
      "回想、推理、推薦",
      "檢索、壓縮、刪除",
      "分類、翻譯、摘要",
      "讀取、寫入、回滾"
     ],
     "a": 0,
     "why": "§3.4：Remembering、Reasoning、Recommending。",
     "src": [
      "s-tasks"
     ]
    },
    {
     "id": "me-t2",
     "facet": "critique",
     "q": "88.3% 人機裁判一致率不保證什麼？",
     "opts": [
      "每類題與錯誤都同樣可靠",
      "抽查過的 criterion 有一致性",
      "論文做過人類評估",
      "裁判是三模型多數決"
     ],
     "a": 0,
     "why": "§4.2、附錄 C：平均一致率不能替代逐類型誤差分析。",
     "src": [
      "s-tasks"
     ]
    }
   ]
  },
  "s-fama": {
   "tier": "elite",
   "ask": 3,
   "qs": [
    {
     "id": "me-f1",
     "facet": "method",
     "q": "FAMA 額外懲罰哪一種行為？",
     "opts": [
      "在答案中使用已失效記憶",
      "沒有使用任何外部檢索",
      "答案沒有列參考文獻",
      "只回答一個有效事實"
     ],
     "a": 0,
     "why": "§4.2：FAA 低時，λ(1−FAA) 會從 MPA 扣除。",
     "src": [
      "s-fama"
     ]
    },
    {
     "id": "me-f2",
     "facet": "reason",
     "q": "4 個有效項通過 3 個、2 個舊項排除 1 個，FAMA 約為？",
     "opts": [
      "0.583",
      "0.750",
      "0.500",
      "0.333"
     ],
     "a": 0,
     "why": "MPA=3/4，FAA=1/2，λ=2/6；FAMA=3/4−(2/6)(1/2)=7/12≈0.583。",
     "src": [
      "s-fama"
     ]
    },
    {
     "id": "me-f3",
     "facet": "reason",
     "q": "若 FAA=1，FAMA 仍可能低於 1 的原因是？",
     "opts": [
      "MPA 可能低於 1",
      "λ 一定會超過 1",
      "max 會把值變零",
      "absence 項必定扣滿分"
     ],
     "a": 0,
     "why": "FAA=1 時扣分為零，但有效記憶可能沒完全出現。",
     "src": [
      "s-fama"
     ]
    }
   ]
  },
  "s-penalty": {
   "qs": [
    {
     "id": "me-pe1",
     "facet": "reason",
     "q": "月度 Nemori 的 presence 105.4 減 15.4，約得多少？",
     "opts": [
      "90.0",
      "120.8",
      "82.5",
      "15.4"
     ],
     "a": 0,
     "why": "Table 5：105.4−15.4=90.0，為三任務合計分。",
     "src": [
      "s-penalty"
     ]
    },
    {
     "id": "me-pe2",
     "facet": "critique",
     "q": "Table 5 的扣分趨勢能單獨證明什麼？",
     "opts": [
      "不能單獨證明原因",
      "只證明檢索器變慢",
      "只證明裁判偏好代理",
      "證明真實用戶同樣受損"
     ],
     "a": 0,
     "why": "作者有機制解釋，但長度與資訊可得性等因素同時變。",
     "src": [
      "s-penalty"
     ]
    }
   ]
  },
  "s-results": {
   "tier": "elite",
   "ask": 3,
   "qs": [
    {
     "id": "me-r1",
     "facet": "method",
     "q": "Table 4 的 173.02 是哪種量？",
     "opts": [
      "三個跨度的任務分數相加",
      "單一題的百分比準確率",
      "推理題的 token 數",
      "一個 persona 的 session 數"
     ],
     "a": 0,
     "why": "Table 4 對每一任務加總週、月、季三個 0–100 分數，上限 300。",
     "src": [
      "s-results"
     ]
    },
    {
     "id": "me-r2",
     "facet": "critique",
     "q": "為何不能把代理與直接 LLM 差距全歸功於記憶？",
     "opts": [
      "回答骨幹也不相同",
      "所有代理都不使用 LLM",
      "兩組回答的是不同資料集",
      "評分完全不含記憶"
     ],
     "a": 0,
     "why": "§4.1：代理統一 GPT-4o-mini，直接 LLM 是另外四個模型。",
     "src": [
      "s-results"
     ]
    },
    {
     "id": "me-r3",
     "facet": "reason",
     "q": "MemoBase Remembering 週 43.60、季 15.18，差約多少分？",
     "opts": [
      "28.42 分",
      "15.18 分",
      "43.60 分",
      "58.78 分"
     ],
     "a": 0,
     "why": "Table 3：43.60−15.18=28.42 個 0–100 分數點。",
     "src": [
      "s-results"
     ]
    }
   ]
  },
  "s-errors": {
   "qs": [
    {
     "id": "me-e1",
     "facet": "critique",
     "q": "§6 的 25/25 推理錯誤涉及部分取回，分母是？",
     "opts": [
      "抽中的推理錯誤",
      "所有推理問題",
      "全部六個代理",
      "季度所有問題"
     ],
     "a": 0,
     "why": "§6：每任務抽 25 個錯誤案例，不是全部題目。",
     "src": [
      "s-errors"
     ]
    },
    {
     "id": "me-e2",
     "facet": "method",
     "q": "推薦與回想的錯誤模式有何差異？",
     "opts": [
      "推薦常含舊偏好；回想常漏項",
      "推薦只因算術；回想只因過期",
      "兩者都全是資料格式錯",
      "兩者都沒有檢索問題"
     ],
     "a": 0,
     "why": "§6：推薦 16/25 未忘舊記憶；回想 18/25 部分檢索。",
     "src": [
      "s-errors"
     ]
    }
   ]
  },
  "s-critique": {
   "qs": [
    {
     "id": "me-c1",
     "facet": "critique",
     "q": "哪個設計最能隔離 mutation 密度的影響？",
     "opts": [
      "固定長度只改更新／刪除次數",
      "同時增加長度與更新次數",
      "只換裁判不改資料",
      "只報季度最高分"
     ],
     "a": 0,
     "why": "本站研究建議：做因子控制才能把長度與 mutation 分開。",
     "src": [
      "s-critique"
     ]
    },
    {
     "id": "me-c2",
     "facet": "method",
     "q": "論文評測未直接涵蓋哪類情境？",
     "opts": [
      "多使用者社會關係記憶",
      "單人偏好的逐輪更新",
      "個人活動的反覆出現",
      "個人目標的進度變化"
     ],
     "a": 0,
     "why": "Limitations：資料中心是偏好、活動、目標，社會關係與多人協調未納入。",
     "src": [
      "s-critique"
     ]
    }
   ]
  }
 },
 "boss": {
  "qs": [
   {
    "id": "me-b1",
    "facet": "reason",
    "q": "若有效項全通過但舊項全未排除，FAMA 會怎樣？",
    "opts": [
     "從 1 扣掉該題 λ",
     "保持 1 不受影響",
     "直接變成 FAA 的值",
     "必然被 max 歸零"
    ],
    "a": 0,
    "why": "§4.2：MPA=1、FAA=0，所以 FAMA=max(0,1−λ)。",
    "src": [
     "s-fama",
     "s-tasks"
    ]
   },
   {
    "id": "me-b2",
    "facet": "critique",
    "q": "哪個結論超出 Table 2–3 的支持範圍？",
    "opts": [
     "下降完全由更新次數造成",
     "長歷史下成績常下降",
     "代理回想有任務差異",
     "推理普遍是難題"
    ],
    "a": 0,
    "why": "Table 2 的多個因素同時變，Table 3 不能單獨識別原因。",
    "src": [
     "s-scale",
     "s-results"
    ]
   },
   {
    "id": "me-b3",
    "facet": "method",
    "q": "Memora 如何知道舊偏好已失效？",
    "opts": [
     "模擬器保留逐輪狀態軌跡",
     "裁判只看最後一句話",
     "檢索器自行刪除全部歷史",
     "依模型信心自動推測"
    ],
    "a": 0,
    "why": "§3 的狀態前後快照先於對話生成。",
    "src": [
     "s-data",
     "s-fama"
    ]
   },
   {
    "id": "me-b4",
    "facet": "critique",
    "q": "三裁判加人類驗證後，仍須保留哪項限制？",
    "opts": [
     "合成對話與裁判偏差仍存在",
     "已證明真人部署錯誤率相同",
     "所有推薦題都完全無歧義",
     "可不分 criterion 類型報告"
    ],
    "a": 0,
    "why": "Limitations 與 §4.2：驗證減少疑慮，沒有消除外推與裁判偏差。",
    "src": [
     "s-tasks",
     "s-critique"
    ]
   },
   {
    "id": "me-b5",
    "facet": "reason",
    "q": "週 71.82、季 40.78，下降約幾個分數點？",
    "opts": [
     "31.04",
     "40.78",
     "71.82",
     "112.60"
    ],
    "a": 0,
    "why": "Table 3 的 A-Mem Remembering：71.82−40.78=31.04。",
    "src": [
     "s-results",
     "s-scale"
    ]
   },
   {
    "id": "me-b6",
    "facet": "method",
    "q": "何種順序最符合論文資料管線？",
    "opts": [
     "狀態模擬→對話生成→題目與準則",
     "裁判投票→狀態模擬→對話生成",
     "模型答題→人工改寫→生成真值",
     "隨機取句→計算 FAMA→造人物"
    ],
    "a": 0,
    "why": "§3：先有可追蹤狀態，再生成自然語言和評估準則。",
    "src": [
     "s-data",
     "s-tasks"
    ]
   }
  ]
 }
};
