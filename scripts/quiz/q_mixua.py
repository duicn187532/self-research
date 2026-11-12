"""MixUA source quiz bank; compiled quiz in papers/2611.10439/quiz.js."""
import json
BANK = json.loads(r'''{
  "paper": "2611.10439",
  "title": "MixUA：記憶分區守門人",
  "sections": {
    "s-problem": {
      "qs": [
        {
          "id": "mix-problem-1",
          "facet": "method",
          "q": "核心問題是什麼？",
          "opts": [
            "誰受益、誰可讀取？",
            "怎麼增加模型層數？",
            "怎麼減少浮點位元？"
          ],
          "a": 0,
          "why": "§1–2：受益與揭露邊界。",
          "src": [
            "s-problem"
          ]
        }
      ]
    },
    "s-scopes": {
      "qs": [
        {
          "id": "mix-scopes-1",
          "facet": "reason",
          "q": "A–X 的 User Scope，誰能讀？",
          "opts": [
            "A–Y，但不是 B–X",
            "B–X，但不是 A–Y",
            "B–Y，不限制來源"
          ],
          "a": 0,
          "why": "§3.2：User 固定來源使用者。",
          "src": [
            "s-scopes"
          ]
        },
        {
          "id": "mix-scopes-2",
          "facet": "reason",
          "q": "只對某一題有用的修法放哪？",
          "opts": [
            "Global",
            "Pair",
            "Agent"
          ],
          "a": 0,
          "why": "Appendix H：依讀者放，不依通用程度。",
          "src": [
            "s-scopes"
          ]
        }
      ]
    },
    "s-formal": {
      "qs": [
        {
          "id": "mix-formal-1",
          "facet": "reason",
          "q": "Eq.(1) 的限制條件是？",
          "opts": [
            "適用且可安全揭露",
            "只需檢索分數較高",
            "只需資訊未遭刪除"
          ],
          "a": 0,
          "why": "§3.1：Audience 是 G∩D 的子集。",
          "src": [
            "s-formal"
          ]
        }
      ]
    },
    "s-write": {
      "qs": [
        {
          "id": "mix-write-1",
          "facet": "method",
          "q": "Protected stream 寫入哪裡？",
          "opts": [
            "Pair 或 User",
            "Agent 或 Global",
            "任一共享分區"
          ],
          "a": 0,
          "why": "§3.3：受限 Writer 避免跨人寫入。",
          "src": [
            "s-write"
          ]
        }
      ]
    },
    "s-review": {
      "qs": [
        {
          "id": "mix-review-1",
          "facet": "method",
          "q": "Store Review 的兩大操作？",
          "opts": [
            "重新分 Scope、合併",
            "增加隱層、微調模型",
            "建立圖譜、加權邊"
          ],
          "a": 0,
          "why": "§3.3：Rescope and merge。",
          "src": [
            "s-review"
          ]
        }
      ]
    },
    "s-retrieval": {
      "qs": [
        {
          "id": "mix-retrieval-1",
          "facet": "method",
          "q": "讀取記憶的合理順序？",
          "opts": [
            "先授權再相似檢索",
            "先生成再隱私過濾",
            "先刪除再跨人分享"
          ],
          "a": 0,
          "why": "§3.4：檢索可見 Scope。",
          "src": [
            "s-retrieval"
          ]
        }
      ]
    },
    "s-lab": {
      "qs": [
        {
          "id": "mix-lab-1",
          "facet": "reason",
          "q": "Protected + Global 會如何？",
          "opts": [
            "禁止寫入",
            "全域可讀",
            "只有 Agent 可讀"
          ],
          "a": 0,
          "why": "§3.3：受保護資訊不可寫 Global。",
          "src": [
            "s-lab"
          ]
        }
      ]
    },
    "s-bench": {
      "qs": [
        {
          "id": "mix-bench-1",
          "facet": "critique",
          "q": "CrossLearnBench 除 Pass 還測？",
          "opts": [
            "偏好與隱私",
            "權重與梯度",
            "圖密度與深度"
          ],
          "a": 0,
          "why": "§4：Preference and privacy。",
          "src": [
            "s-bench"
          ]
        }
      ]
    },
    "s-results": {
      "qs": [
        {
          "id": "mix-results-1",
          "facet": "reason",
          "q": "R3 89.8 減 72.0 是多少？",
          "opts": [
            "17.8 百分點",
            "16.3 百分點",
            "11.5 百分點"
          ],
          "a": 0,
          "why": "Table 2：R3 差≠Δ。",
          "src": [
            "s-results"
          ]
        },
        {
          "id": "mix-results-2",
          "facet": "critique",
          "q": "Table 2 的 Δ=+16.3 指？",
          "opts": [
            "R2–R3 的增益",
            "只看 R3 之差",
            "隱私探針比例"
          ],
          "a": 0,
          "why": "Table 2：比較輪次不同。",
          "src": [
            "s-results"
          ]
        },
        {
          "id": "mix-results-3",
          "facet": "critique",
          "q": "首次見任務改善支持什麼？",
          "opts": [
            "跨任務知識可轉移",
            "跨時間失效已解決",
            "所有隱私風險消失"
          ],
          "a": 0,
          "why": "Figure 6：不同任務的經驗轉移。",
          "src": [
            "s-results"
          ]
        },
        {
          "id": "mix-results-4",
          "facet": "critique",
          "q": "Δcross 只計算哪些題？",
          "opts": [
            "只有不同 User 且不同 Agent 做過",
            "只有同一個 User–Agent 配對做過",
            "只有同 User 或同 Agent 的配對做過"
          ],
          "a": 0,
          "why": "Table 2 註：Δcross 的定義。",
          "src": [
            "s-results"
          ]
        }
      ],
      "tier": "elite",
      "ask": 3
    },
    "s-ablation": {
      "qs": [
        {
          "id": "mix-ablation-1",
          "facet": "reason",
          "q": "移除哪一 Scope 影響 Δ 最多？",
          "opts": [
            "Global：15.3→9.0",
            "Agent：15.3→14.8",
            "Pair：15.3→15.2"
          ],
          "a": 0,
          "why": "Table 4：全域共享貢獻大。",
          "src": [
            "s-ablation"
          ]
        },
        {
          "id": "mix-ablation-2",
          "facet": "reason",
          "q": "移除 User，偏好率變化？",
          "opts": [
            "90% → 81%",
            "90% → 91%",
            "90% → 93%"
          ],
          "a": 0,
          "why": "Table 4：User 保留個人偏好。",
          "src": [
            "s-ablation"
          ]
        },
        {
          "id": "mix-ablation-3",
          "facet": "critique",
          "q": "合理的消融解釋是？",
          "opts": [
            "仍需控制 Context",
            "已完全隔離每個因素",
            "已證明所有人都受益"
          ],
          "a": 0,
          "why": "§5.3：仍可能有文字量與檢索差。",
          "src": [
            "s-ablation"
          ]
        }
      ],
      "tier": "elite",
      "ask": 3
    },
    "s-critique": {
      "qs": [
        {
          "id": "mix-critique-1",
          "facet": "critique",
          "q": "哪項尚未直接驗證？",
          "opts": [
            "情境回復的重新啟用",
            "既有任務的 Pass 變化",
            "偏好的後續保留率"
          ],
          "a": 0,
          "why": "Limitations／本站研究假說。",
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
        "id": "mix-b1",
        "facet": "method",
        "q": "私人偏好應先寫哪裡？",
        "opts": [
          "來源 User 分區",
          "來源 Agent 分區",
          "所有 Global 分區"
        ],
        "a": 0,
        "why": "§3.2–3.3",
        "src": [
          "s-scopes",
          "s-write"
        ]
      },
      {
        "id": "mix-b2",
        "facet": "reason",
        "q": "Protected 被放 Global 會怎樣？",
        "opts": [
          "受限 Writer 阻止",
          "自動成為公開知識",
          "交給 Review 就能公開"
        ],
        "a": 0,
        "why": "§3.3",
        "src": [
          "s-write",
          "s-review"
        ]
      },
      {
        "id": "mix-b3",
        "facet": "critique",
        "q": "何者是 Table 2 的誤讀？",
        "opts": [
          "R3 差等於 Δ",
          "Pass 與偏好分別算",
          "No memory 是 baseline"
        ],
        "a": 0,
        "why": "§5.2、Table 2",
        "src": [
          "s-results",
          "s-bench"
        ]
      },
      {
        "id": "mix-b4",
        "facet": "critique",
        "q": "隱私探針極低意味什麼？",
        "opts": [
          "只代表指定探針",
          "代表所有威脅為零",
          "代表所有用戶已同意"
        ],
        "a": 0,
        "why": "§5、Limitations",
        "src": [
          "s-bench",
          "s-critique"
        ]
      },
      {
        "id": "mix-b5",
        "facet": "reason",
        "q": "A→B→A 情境怎麼處理？",
        "opts": [
          "另加有效性判斷",
          "只更動 Audience",
          "只增加嵌入維度"
        ],
        "a": 0,
        "why": "本站研究假說",
        "src": [
          "s-formal",
          "s-critique"
        ]
      },
      {
        "id": "mix-b6",
        "facet": "method",
        "q": "Global 和 User 的主要區別？",
        "opts": [
          "跨使用者或只限本人",
          "不同版本的時間衰退",
          "不同圖邊的連通程度"
        ],
        "a": 0,
        "why": "§3.2、Table 4",
        "src": [
          "s-scopes",
          "s-ablation"
        ]
      }
    ]
  }
}''')
