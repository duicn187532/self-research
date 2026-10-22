// Built by scripts/quiz/build.py from scripts/quiz/q_apex.py; edit that file, not this one.
window.STUDY_QUIZ = {
 "paper": "2604.14362",
 "title": "只增不刪的記錄官",
 "sections": {
  "s-problem": {
   "qs": [
    {
     "id": "ax-p1",
     "facet": "method",
     "q": "APEX-MEM 處理舊值的方式，和 Zep 差在哪？",
     "opts": [
      "Zep 寫入時標失效；APEX-MEM 全部保留，查詢時才判斷",
      "Zep 全部保留；APEX-MEM 寫入時就把舊值標失效",
      "兩者都在寫入時偵測矛盾，並刪除舊值",
      "APEX-MEM 讓舊值的強度隨時間衰減淡出"
     ],
     "a": 0,
     "why": "本頁 01 的對照；APEX-MEM 的貢獻之一就是只增不刪、查詢時依時間有效性解析。",
     "src": [
      "s-problem"
     ]
    },
    {
     "id": "ax-p2",
     "facet": "reason",
     "q": "「寫入時解析」和「查詢時解析」各有什麼代價？",
     "opts": [
      "前者判錯就丟資訊；後者每次回答都要付代理成本",
      "前者每次查詢都最貴；後者會遺失歷史",
      "前者需要更大的模型；後者需要更多儲存",
      "兩者代價相同，只是做決定的時間點不同"
     ],
     "a": 0,
     "why": "本頁 01 的自我檢測：寫入時解析讓查詢便宜；查詢時解析保留全部，品質取決於回答模型。",
     "src": [
      "s-problem"
     ]
    }
   ]
  },
  "s-graph": {
   "qs": [
    {
     "id": "ax-g1",
     "facet": "method",
     "q": "事實為什麼錨定在「事件」上，而不是直接掛在實體上？",
     "opts": [
      "保留何時、哪段對話、誰說的，讓矛盾能並存",
      "減少節點數量，讓 SQL 查詢跑得更快",
      "因為 35 類實體裡沒有地方放屬性",
      "讓同一個事實只能被寫入一次，避免重複"
     ],
     "a": 0,
     "why": "§3.1：事件帶時間戳、參與者與證據，矛盾與修正並存，留給查詢時解析。",
     "src": [
      "s-graph"
     ]
    },
    {
     "id": "ax-g2",
     "facet": "method",
     "q": "APEX-MEM 的屬性圖實際上存在哪裡？",
     "opts": [
      "SQLite 資料庫的幾張關聯表",
      "Neo4j 圖資料庫的節點與邊",
      "向量資料庫的嵌入索引",
      "一份依時間排序的純文字筆記"
     ],
     "a": 0,
     "why": "§4：表格包括 entities、properties、facts、events、evidence、turns，代理對它寫 SQL。",
     "src": [
      "s-graph"
     ]
    }
   ]
  },
  "s-extract": {
   "qs": [
    {
     "id": "ax-e1",
     "facet": "critique",
     "q": "Table 2 的「抽取精確度」97.3%（Sonnet 4.5）沒有量到什麼？",
     "opts": [
      "漏抽：只量抽出來的對不對",
      "實體解析是否連到正確的 id",
      "屬性是否在合理的 schema 內",
      "時間是否正規化成 ISO 8601"
     ],
     "a": 0,
     "why": "本頁 03：附錄 E 巴黎餐廳的失敗正是漏掉隱含關係，這類錯誤不會反映在精確度上。實體解析與 schema 涵蓋另有兩欄。",
     "src": [
      "s-extract"
     ]
    },
    {
     "id": "ax-e2",
     "facet": "reason",
     "q": "抽取時為什麼要依 \\(t_{\\text{anchor}}\\) 把時間正規化？",
     "opts": [
      "相對時間要換成絕對日期，才能跨 session 計算",
      "為了替 session 依發生先後排序",
      "為了決定要用哪個 LLM 來抽取",
      "為了計算每筆事實的信心分數"
     ],
     "a": 0,
     "why": "§3.3：時間表達式依錨定時間正規化為 ISO 8601；Table 13 的 yesterday 被轉成 2023-05-07。",
     "src": [
      "s-extract"
     ]
    }
   ]
  },
  "s-anim": {
   "qs": [
    {
     "id": "ax-n1",
     "facet": "reason",
     "q": "問「Alice 最喜歡的餐廳什麼時候換的？」，哪種記憶做法才答得出來？",
     "opts": [
      "只增不刪：舊值與起始日都還在",
      "覆寫式：只要留著最新值就夠",
      "兩種做法都一樣答得出來",
      "兩種做法都答不出來"
     ],
     "a": 0,
     "why": "附錄 E 案例 1；覆寫後沒有舊值與起始日，算不出改變的時間。",
     "src": [
      "s-anim"
     ]
    },
    {
     "id": "ax-n2",
     "facet": "critique",
     "q": "附錄 F 用各系統 LoCoMo 時間題的分數，支持「只增不刪有助時間推理」。這個證據為什麼弱？",
     "opts": [
      "跨系統比較，抽取、模型、判定都不同",
      "APEX-MEM 的時間題分數其實最低",
      "只拿了一個系統的分數當證據",
      "時間題總共只有 10 題，樣本太小"
     ],
     "a": 0,
     "why": "本頁 04：其他三個系統的數字還是轉引；需要的是同系統的覆寫式消融。",
     "src": [
      "s-anim"
     ]
    }
   ]
  },
  "s-tools": {
   "tier": "elite",
   "ask": 3,
   "qs": [
    {
     "id": "ax-t1",
     "facet": "method",
     "q": "四個工具中，哪一個負責把對話裡的表面說法對到圖中的標準實體 id？",
     "opts": [
      "EntityLookup",
      "GraphSQL",
      "SchemaViewer",
      "Search"
     ],
     "a": 0,
     "why": "§4.2：先用混合索引找候選 id，再查圖組出實體文件。",
     "src": [
      "s-tools"
     ]
    },
    {
     "id": "ax-t2",
     "facet": "method",
     "q": "GraphSQL 為什麼限制成唯讀、單一陳述？",
     "opts": [
      "代理不能改記憶，也避免多段陳述的風險",
      "唯讀查詢在 SQLite 上執行得比較快",
      "SQLite 本身不支援寫入與更新",
      "單一陳述可以節省工具框架的 token"
     ],
     "a": 0,
     "why": "§4.3：保持只增不刪，只能查白名單資料表，禁止更新與 DDL。",
     "src": [
      "s-tools"
     ]
    },
    {
     "id": "ax-t3",
     "facet": "reason",
     "q": "Table 8 的時間查詢用 months_approx = CAST(天數 / 30.44 AS INTEGER)。兩個日期相差 60 天，「約幾個月」算出來是？",
     "opts": [
      "1",
      "2",
      "1.97",
      "0"
     ],
     "a": 0,
     "why": "60 / 30.44 ≈ 1.97，SQLite 的 CAST 成 INTEGER 向零截斷，得 1。",
     "src": [
      "s-tools"
     ]
    },
    {
     "id": "ax-t4",
     "facet": "critique",
     "q": "「哪一版事實現在有效」的判斷，實際上寫在哪裡？",
     "opts": [
      "代理產生的 SQL 裡",
      "寫入時的實體解析器裡",
      "問答判定模型的評分規則裡",
      "35 類本體的型別定義裡"
     ],
     "a": 0,
     "why": "本頁 05 對 Table 8 的觀察：例如依建立時間取最新一筆；排序寫錯或用錯時間欄位就會選錯版本。",
     "src": [
      "s-tools"
     ]
    }
   ]
  },
  "s-agent": {
   "qs": [
    {
     "id": "ax-a1",
     "facet": "method",
     "q": "代理呼叫工具之前，會怎麼處理每一輪裡的相對時間（「上週」「昨天」）？",
     "opts": [
      "先解析成日期或日期範圍",
      "直接忽略，只看絕對日期",
      "交給 SchemaViewer 處理",
      "換成對應的 session 編號"
     ],
     "a": 0,
     "why": "§4：The agent resolves temporal references in each turn into dates and date-ranges。工具呼叫上限 40 次。",
     "src": [
      "s-agent",
      "s-tools"
     ]
    }
   ]
  },
  "s-online": {
   "qs": [
    {
     "id": "ax-o1",
     "facet": "critique",
     "q": "LongMemEval 用線上建構時，APEX-MEM 比其他記憶系統多拿到什麼資訊？",
     "opts": [
      "問題本身",
      "標準答案",
      "更多的 session",
      "更強的判定模型"
     ],
     "a": 0,
     "why": "§5、§6.2：建圖前就用問題篩選相關文件，其他記憶系統是在不知道問題的情況下建記憶。本頁 07：原文沒討論這對公平性的影響。",
     "src": [
      "s-online"
     ]
    },
    {
     "id": "ax-o2",
     "facet": "method",
     "q": "線上建構只對哪些文件建圖？",
     "opts": [
      "與問題的相關度高於 \\(\\Theta_{\\text{rel}} = 0.2\\) 的",
      "全部文件，只是建圖順序依相關度排",
      "最近 5 個 session，較舊的直接略過",
      "依發布時間排序後的前 30 份文件"
     ],
     "a": 0,
     "why": "§5、§6.2。相關度 \\(\\mathrm{Relevance}(d_i \\mid Q)\\) 怎麼算，原文沒有給公式。",
     "src": [
      "s-online"
     ]
    }
   ]
  },
  "s-setup": {
   "qs": [
    {
     "id": "ax-s1",
     "facet": "critique",
     "q": "Table 1 裡，哪些列和 APEX-MEM 是在相同條件下評測的？",
     "opts": [
      "作者重跑的 SimpleSearch 與 Full Context",
      "MemInsight 的四列",
      "Memory 組（Zep、Mem0、MIRIX 等）",
      "全部都是"
     ],
     "a": 0,
     "why": "§6.2：其他列引用自別的論文，判定模型、提示詞與回答模型都不同。",
     "src": [
      "s-setup"
     ]
    },
    {
     "id": "ax-s2",
     "facet": "critique",
     "q": "原文說「每個 LLM 判定取 3 次平均，標準差 < ±1」。這代表什麼？",
     "opts": [
      "評審重複了，系統沒有重跑",
      "每個系統都完整跑了 3 次",
      "結果通過了顯著性檢定",
      "用了 3 個不同的判定模型"
     ],
     "a": 0,
     "why": "§6.2；本站的可重現性審查（研究者進階分析 B）：沒有顯著性檢定。",
     "src": [
      "s-setup"
     ]
    }
   ]
  },
  "s-locomo": {
   "tier": "elite",
   "ask": 3,
   "qs": [
    {
     "id": "ax-l1",
     "facet": "critique",
     "q": "原文說 APEX-MEM 的 88.88% 比 MIRIX 的 85.38% 高 3.50 個百分點。這個比較有什麼問題？",
     "opts": [
      "口徑不一：一個含對抗題，一個不含",
      "MIRIX 用的是不同的資料集",
      "88.88% 其實是 GPT4o 的分數",
      "沒有問題，兩者條件相同"
     ],
     "a": 0,
     "why": "本頁 09 的驗算：Memory 組的對抗欄都是 N/A；同口徑是 89.49% 對 85.38%，差 4.11。",
     "src": [
      "s-locomo"
     ]
    },
    {
     "id": "ax-l2",
     "facet": "reason",
     "q": "同樣用 GPT4o 回答、都不含對抗題時，全文脈絡和 APEX-MEM 誰的分數高？",
     "opts": [
      "全文脈絡：87.52% 對 86.75%",
      "APEX-MEM：89.49% 對 87.52%",
      "兩者相同：都是 87.52%",
      "APEX-MEM：86.35% 對 77.70%"
     ],
     "a": 0,
     "why": "Table 1。86.35% 是 APEX-MEM（GPT4o）含對抗題的 Overall。",
     "src": [
      "s-locomo"
     ]
    },
    {
     "id": "ax-l3",
     "facet": "reason",
     "q": "APEX-MEM（GPT5）的 Overall 88.88% 是怎麼算出來的？",
     "opts": [
      "五類依題數加權平均",
      "五類分數的簡單平均",
      "排除對抗題後依題數加權",
      "三次判定中取最高分"
     ],
     "a": 0,
     "why": "本頁 09 的驗算：題數 840、282、321、96、446；五類簡單平均是 89.05%。",
     "src": [
      "s-locomo"
     ]
    },
    {
     "id": "ax-l4",
     "facet": "critique",
     "q": "RQ4 說「各類別差距小於 5 個百分點」。這個說法成立嗎？",
     "opts": [
      "只對部分列成立",
      "所有列都成立",
      "只有 MIRIX 那列不成立",
      "原文沒有這個說法"
     ],
     "a": 0,
     "why": "本頁 09 的驗算：GPT5 列差 5.39，Haiku 列差 10.01。",
     "src": [
      "s-locomo"
     ]
    }
   ]
  },
  "s-ablation": {
   "tier": "elite",
   "qs": [
    {
     "id": "ax-b1",
     "facet": "reason",
     "q": "Table 3 最後一列（加上 Search）的 Overall 原文寫 87.00%。依題數加權重算是多少？",
     "opts": [
      "84.92%",
      "87.00%",
      "89.49%",
      "79.45%"
     ],
     "a": 0,
     "why": "最後一列五類分數與 Table 1 Haiku 列完全相同，那一列的 Overall 是 84.92%。",
     "src": [
      "s-ablation"
     ]
    },
    {
     "id": "ax-b2",
     "facet": "critique",
     "q": "「GraphSQL-only 要 3.3 倍工具呼叫」這個說法有什麼問題？",
     "opts": [
      "只算了 GraphSQL 一種工具",
      "其實是 10 倍以上",
      "沒有把 GraphSQL 算進去",
      "數字正確，沒有問題"
     ],
     "a": 0,
     "why": "Table 6 的合計列（本頁加總）：總呼叫數 41,466 對 29,624，只多 1.40 倍。",
     "src": [
      "s-ablation"
     ]
    },
    {
     "id": "ax-b3",
     "facet": "reason",
     "q": "依重算，加入 Search 工具的貢獻約多少個百分點？",
     "opts": [
      "約 +4.1",
      "+7.55",
      "+2.26",
      "約 +9.8"
     ],
     "a": 0,
     "why": "重算三列為 78.07%、80.83%、84.92%：GraphSQL 約 +2.76，Search 約 +4.09。7.55 與 2.26 是原文的數字。",
     "src": [
      "s-ablation"
     ]
    }
   ]
  },
  "s-lme": {
   "qs": [
    {
     "id": "ax-m1",
     "facet": "critique",
     "q": "SealQA-Hard 上，APEX-MEM（GPT5）40.1% 宣稱比最強基線高 5.55。問題在哪？",
     "opts": [
      "最強基線其實是附搜尋的 GPT5",
      "O3 確實是最強的基線，沒有問題",
      "實際差距超過 10 個百分點",
      "SealQA 不是記憶評測，不該比較"
     ],
     "a": 0,
     "why": "Table 5：附搜尋工具的 GPT5 是 38.6%，同模型只高約 1.5；原文的 5.55 是和 O3（34.6%）比。",
     "src": [
      "s-lme"
     ]
    },
    {
     "id": "ax-m2",
     "facet": "critique",
     "q": "Table 4 中 APEX-MEM 和 Zep、Mem0、Nemori 的比較，為什麼不乾淨？",
     "opts": [
      "轉引數字，APEX-MEM 又看過問題",
      "Zep 用了更強的回答模型去答題",
      "它們只測了其中一半的題目",
      "其實很乾淨，條件完全相同"
     ],
     "a": 0,
     "why": "本頁 11 與 07：回答與判定方式不同，APEX-MEM 又用了線上建構。",
     "src": [
      "s-lme",
      "s-online"
     ]
    }
   ]
  },
  "s-cost": {
   "qs": [
    {
     "id": "ax-c1",
     "facet": "critique",
     "q": "Table 9 和 Table 10 對每題 token 的說法有什麼矛盾？",
     "opts": [
      "約 30,000 對 81,604",
      "兩表一致，都是 81,604",
      "Table 10 比 Table 9 小",
      "兩表都是約 25,000"
     ],
     "a": 0,
     "why": "本頁 12 的驗算：而且 Table 9 自己三欄相加是 37,557。",
     "src": [
      "s-cost"
     ]
    },
    {
     "id": "ax-c2",
     "facet": "reason",
     "q": "依 Table 10，APEX-MEM 每題的 token 大部分花在哪裡？",
     "opts": [
      "代理相關的部分（約 74%）",
      "建圖（約 74%）",
      "系統提示詞（約 74%）",
      "最後的回答生成（約 74%）"
     ],
     "a": 0,
     "why": "記憶檢索 26.6% + 工具框架 27.3% + 迴圈負擔 19.8% ≈ 74%；建圖只佔 16.6%。",
     "src": [
      "s-cost"
     ]
    }
   ]
  },
  "s-context": {
   "qs": [
    {
     "id": "ax-x1",
     "facet": "method",
     "q": "APEX-MEM 和 ATMS（1986）有什麼共同點與差別？",
     "opts": [
      "都不在寫入時做不可逆決定；只有 ATMS 有保證",
      "都會刪除舊資料；只有 APEX-MEM 有保證",
      "都用 LLM 判斷有效性；ATMS 比較快",
      "都依靠衰減淡出舊值；ATMS 比較彈性"
     ],
     "a": 0,
     "why": "本頁 13：ATMS 把有效性編成標籤、查詢是子集合檢驗；APEX-MEM 由 LLM 寫 SQL 解讀，沒有保證但表示力較彈性。",
     "src": [
      "s-context"
     ]
    },
    {
     "id": "ax-x2",
     "facet": "reason",
     "q": "STALE 的例子「腿打石膏 → 不能騎車通勤」，在 APEX-MEM 會怎麼處理？",
     "opts": [
      "兩筆分開存、都不標衝突，要代理自己想到",
      "寫入時自動把騎車那筆標成失效",
      "抽取時就把兩筆合併成一筆健康事實",
      "騎車那筆事實會在下一次寫入時被刪除"
     ],
     "a": 0,
     "why": "本頁 13 的自我檢測：APEX-MEM 的時間解析只處理明講的變化；問通勤時代理要自己去查健康狀況，否則會沿用騎車。",
     "src": [
      "s-context"
     ]
    }
   ]
  },
  "s-critique": {
   "qs": [
    {
     "id": "ax-k1",
     "facet": "critique",
     "q": "若只能補一個實驗來支撐「只增不刪」這個核心主張，最該補哪個？",
     "opts": [
      "同系統的覆寫式消融",
      "換更大的回答模型重跑",
      "多加一個評測資料集",
      "把 SQLite 換成圖資料庫"
     ],
     "a": 0,
     "why": "本頁 14：其他不變，只把寫入改成覆寫舊事實，比較時間題與整體準確率。",
     "src": [
      "s-critique",
      "s-anim"
     ]
    },
    {
     "id": "ax-k2",
     "facet": "critique",
     "q": "本頁說「同模型全文脈絡在 LoCoMo 上更好也更便宜」，依據是？",
     "opts": [
      "同用 GPT4o，全文較準也較省",
      "全文脈絡在所有回答模型下都更好",
      "原文的結論就是這樣寫的",
      "全文脈絡不需要建圖，所以零成本"
     ],
     "a": 0,
     "why": "第 09 與 12 節：87.52% 對 86.75%；每題約 25,000 tokens 對 APEX-MEM 約 30,000（Table 10 則是 81,604）。原文沒報強模型的全文基線。",
     "src": [
      "s-critique",
      "s-locomo",
      "s-cost"
     ]
    }
   ]
  }
 },
 "boss": {
  "qs": [
   {
    "id": "ax-z1",
    "facet": "reason",
    "q": "問「Alice 最喜歡的餐廳什麼時候換的？」，APEX-MEM 怎麼答得出來？",
    "opts": [
     "兩筆事實都保留起始日，代理用 SQL 算出差距",
     "舊值已被覆寫，只能回答現在的餐廳",
     "SchemaViewer 直接回傳寫好的答案",
     "Search 找出最相似的一句話當答案"
    ],
    "a": 0,
    "why": "結合只增不刪的屬性圖（02）、GraphSQL 的時間計算（05）與附錄 E 案例 1（04）。",
    "src": [
     "s-graph",
     "s-tools",
     "s-anim"
    ]
   },
   {
    "id": "ax-z2",
    "facet": "critique",
    "q": "LongMemEval 上 APEX-MEM 86.2%、Zep 71.2%。為什麼不能直接說 APEX-MEM 好 15 個百分點？",
    "opts": [
     "建圖看過問題，Zep 又是轉引",
     "Zep 用了比較大的回答模型",
     "兩者用的題目集完全不同",
     "可以，兩者條件完全相同"
    ],
    "a": 0,
    "why": "07 的線上建構、11 的轉引數字、08 的判定模型未寫明。",
    "src": [
     "s-online",
     "s-lme",
     "s-setup"
    ]
   },
   {
    "id": "ax-z3",
    "facet": "method",
    "q": "APEX-MEM 把「哪一版有效」的判斷放在哪裡？代價是什麼？",
    "opts": [
     "查詢時由代理寫 SQL；結果沒有保證",
     "寫入時由解析器判斷；舊值會遺失",
     "本體的型別定義裡；無法表示例外",
     "判定模型的規則裡；評分會偏頗"
    ],
    "a": 0,
    "why": "01 的取捨、05 的 SQL 判斷、14 中作者承認 GPT4o 查詢錯誤率高：品質取決於代理寫 SQL 與用工具的能力。",
    "src": [
     "s-problem",
     "s-tools",
     "s-critique"
    ]
   },
   {
    "id": "ax-z4",
    "facet": "critique",
    "q": "根據本頁的驗算，下列哪個說法最有根據？",
    "opts": [
     "工具都有用，但 Search 的貢獻約只有原文的一半",
     "Search 的貢獻是 +7.55，結論完全成立",
     "GraphSQL 才是三者中貢獻最大的工具",
     "同模型下 APEX-MEM 全面勝過全文脈絡"
    ],
    "a": 0,
    "why": "10 的重算（約 +4.1 而非 +7.55）與 09 的同模型比較（全文脈絡較高）。",
    "src": [
     "s-ablation",
     "s-locomo",
     "s-critique"
    ]
   },
   {
    "id": "ax-z5",
    "facet": "reason",
    "q": "若以 Table 10 的 81,604 tokens 計，APEX-MEM 每題成本大約是 LoCoMo 全文脈絡（約 25,000）的幾倍？",
    "opts": [
     "約 3.3 倍",
     "約 1.2 倍",
     "約 1.0 倍",
     "約 0.3 倍"
    ],
    "a": 0,
    "why": "81,604 / 25,000 ≈ 3.26。若用 Table 9 的 30,000 則約 1.2 倍，兩表本身就矛盾。",
    "src": [
     "s-cost",
     "s-locomo"
    ]
   },
   {
    "id": "ax-z6",
    "facet": "method",
    "q": "STALE 的隱性衝突（腿斷了 → 不能騎車）為什麼不會在 APEX-MEM 寫入時被處理？",
    "opts": [
     "兩筆是不同屬性、沒明講取代，又只增不刪",
     "抽取精確度太低，健康事實沒被抽出",
     "本體沒有任何健康相關的實體類別",
     "SQLite 無法儲存帶日期的事實"
    ],
    "a": 0,
    "why": "03 的抽取、02 的只增不刪，以及 13 的對照：依賴要靠代理在查詢時自己想到。本體其實有 Food、Medication、Disease 等健康概念。",
    "src": [
     "s-extract",
     "s-graph",
     "s-context"
    ]
   }
  ]
 }
};
