// Built by scripts/quiz/build.py from scripts/quiz/q_statemem.py; edit that file, not this one.
window.STUDY_QUIZ = {
 "paper": "2608.19652",
 "title": "狀態漂移獵人",
 "sections": {
  "s-problem": {
   "qs": [
    {
     "id": "sm-p1",
     "facet": "method",
     "q": "這篇的「狀態漂移」是什麼？",
     "opts": [
      "新版本就在 context 裡，agent 仍照舊版行動",
      "正確的新版本根本沒有被檢索進 context",
      "模型看到了新版本，但拒絕回答問題",
      "答案內容正確，但輸出格式不符要求"
     ],
     "a": 0,
     "why": "§3：正確的新版本確實在組好的 context 裡，agent 卻依據過期或不完整的版本行動。這把「沒維護好狀態」和「沒取得資訊」分開。",
     "src": [
      "s-problem"
     ]
    },
    {
     "id": "sm-p2",
     "facet": "reason",
     "q": "為什麼更好的檢索修不好狀態漂移？",
     "opts": [
      "新值本來就在 context 裡，錯在判斷哪版有效",
      "檢索永遠會漏掉一部分相關的對話",
      "檢索太慢，來不及在回答前完成",
      "context 太長，新值被截斷在外面"
     ],
     "a": 0,
     "why": "本頁 01 的自我檢測：依定義，漂移發生時新值已經在 context 裡。",
     "src": [
      "s-problem"
     ]
    }
   ]
  },
  "s-label": {
   "ask": 2,
   "qs": [
    {
     "id": "sm-l1",
     "facet": "critique",
     "q": "Table 1 的漂移比例為什麼被稱為「上限」？",
     "opts": [
      "人類標註員判出的漂移明顯較少",
      "樣本只有幾十題，信賴區間很寬",
      "比例經過加權，放大了漂移類別",
      "判定者本身就是兩位人類標註員"
     ],
     "a": 0,
     "why": "附錄 A.4：表上是 LLM 判定者的標記；兩位人類標註員在同一批案例上判出 8.3% 與 25.0%，LLM 是 50.0%。",
     "src": [
      "s-label"
     ]
    },
    {
     "id": "sm-l2",
     "facet": "reason",
     "q": "MA-shopping 的 κ 只有 0.17，但一致率是 91.6%。哪個比較能代表判定的可靠度？",
     "opts": [
      "一致率：類別極度不平衡時 κ 被壓低",
      "κ：它已校正機會一致，較可信",
      "兩者都不能用，要重新標註",
      "取兩者平均作為可靠度"
     ],
     "a": 0,
     "why": "附錄 A.3：機會校正在類別極度不平衡時會把 κ 壓低；PABAK \\(= 2 \\times 0.916 - 1 \\approx 0.83\\)，AC1 為 0.91。",
     "src": [
      "s-label"
     ]
    },
    {
     "id": "sm-l3",
     "facet": "method",
     "q": "判定者對「是哪一種漂移機制」的一致性（κmode）接近 0。這對研究設計有什麼影響？",
     "opts": [
      "改在生成情境時就指定機制",
      "改請人類專家逐案判定機制",
      "放棄區分機制，只報漂移總數",
      "讓判定者多跑幾次取多數決"
     ],
     "a": 0,
     "why": "本頁 02 的自我檢測：事後讀輸出分不出機制，所以改成在情境生成時就指定，也就是 StateMemBench。",
     "src": [
      "s-label",
      "s-bench"
     ]
    }
   ]
  },
  "s-evidence": {
   "qs": [
    {
     "id": "sm-e1",
     "facet": "method",
     "q": "為什麼用 LongMemEval 的 oracle 版本做這個實驗？",
     "opts": [
      "證據保證都在 prompt 裡，排除檢索失敗",
      "oracle 版題目較少，實驗成本較低",
      "oracle 版內建推理開關，方便比較",
      "oracle 版對話最長，最容易漂移"
     ],
     "a": 0,
     "why": "§3.2：oracle 版的召回 = 1.0，剩下的錯不可能是檢索失敗偽裝的。",
     "src": [
      "s-evidence"
     ]
    },
    {
     "id": "sm-e2",
     "facet": "critique",
     "q": "打開推理後，正確率從 84.0% 掉到 76.0%（n = 50，p = 0.34）。能下什麼結論？",
     "opts": [
      "沒有證據顯示推理有幫助",
      "推理會顯著降低正確率",
      "推理在統計上有顯著幫助",
      "推理對任何題都沒有作用"
     ],
     "a": 0,
     "why": "本頁 03 的提醒：不能說推理有害。作者要看的是失敗集合幾乎不動這個不對稱。",
     "src": [
      "s-evidence"
     ]
    }
   ]
  },
  "s-bench": {
   "ask": 2,
   "qs": [
    {
     "id": "sm-b1",
     "facet": "method",
     "q": "StateMemBench 裡「陷阱」的正式條件是什麼？",
     "opts": [
      "有偷懶策略的答案和完整重播不同",
      "題目長度超過一定的 token 數",
      "對話中出現至少一次值的反轉",
      "至少一個受測 LLM 答錯該題"
     ],
     "a": 0,
     "why": "§4.1：至少一個偷懶讀者策略的答案，和完整重播事件程式的答案不同。失敗模式是機械地定義，不是人工列分類表。",
     "src": [
      "s-bench"
     ]
    },
    {
     "id": "sm-b2",
     "facet": "reason",
     "q": "為什麼需要反陷阱題？",
     "opts": [
      "防止「永遠信最新提及」的捷徑拿高分",
      "增加題數，讓統計檢定更有力",
      "測試模型輸出格式是否穩定",
      "測試檢索器能否找回最早的提及"
     ],
     "a": 0,
     "why": "反陷阱題給一個較新但沒有權威的提及，正確做法是保留舊值；否則「永遠相信最新提到的值」在其他四種模式上都能拿高分。",
     "src": [
      "s-bench"
     ]
    },
    {
     "id": "sm-b3",
     "facet": "method",
     "q": "封閉選項池評分比一般的對錯評分多提供了什麼？",
     "opts": [
      "分開計算答成舊值與其他錯誤",
      "作答時把選項列給模型挑選",
      "讓題目變簡單，模型較易答對",
      "依答題時間自動為題目分級"
     ],
     "a": 0,
     "why": "§4.3：能把「答成被取代的舊值」（漂移）、「其他錯誤值」和「沒答出選項」分開；作答時不顯示選項。第 10 節的分析就靠這個。",
     "src": [
      "s-bench",
      "s-drift"
     ]
    }
   ]
  },
  "s-trap": {
   "qs": [
    {
     "id": "sm-t1",
     "facet": "reason",
     "q": "依附錄 D.4 的規則，一筆 $5000 的季獎金會被送到哪裡？",
     "opts": [
      "還車貸（4000 到 6200）",
      "留在支票帳戶（低於 1900）",
      "補旅遊預備金（1900 到 4000）",
      "存滿 Roth（超過 6200）"
     ],
     "a": 0,
     "why": "附錄 D.4 第 3.1 輪的分級規則。",
     "src": [
      "s-trap"
     ]
    },
    {
     "id": "sm-t2",
     "facet": "critique",
     "q": "同一套規則下，一筆剛好 $4000 的獎金該歸哪一級？",
     "opts": [
      "原文沒有規定",
      "還車貸那一級",
      "旅遊預備金那一級",
      "留在支票帳戶"
     ],
     "a": 0,
     "why": "本頁 05：剛好等於 1900、4000、6200 時原文沒有規定，邊界值未定義。",
     "src": [
      "s-trap"
     ]
    }
   ]
  },
  "s-method": {
   "tier": "elite",
   "ask": 3,
   "qs": [
    {
     "id": "sm-m1",
     "facet": "method",
     "q": "依賴邊 derived_from 和 coupled_with 差在哪？",
     "opts": [
      "前者要重算值，後者要重評有效性",
      "前者看有效性，後者要重算值",
      "兩者同義，只是命名習慣不同",
      "derived_from 只用在政策單元"
     ],
     "a": 0,
     "why": "§5.1：derived_from 是值從別的單元算出，輸入變了就要重算；coupled_with 是有效性取決於別的單元的狀態，對方關閉或被取代就要重新評估。例：「Netflix 扣款綁在卡 3」coupled_with「卡 3 是否停用」。",
     "src": [
      "s-method"
     ]
    },
    {
     "id": "sm-m2",
     "facet": "method",
     "q": "superseded 和 needs_recheck 的單元，哪個會送進回答階段？",
     "opts": [
      "只送 needs_recheck，並帶旗標",
      "兩者都送，superseded 排在後面",
      "只送 superseded，供回答時比對",
      "兩者都不送，只留給稽核使用"
     ],
     "a": 0,
     "why": "§5.2–5.3：superseded 的單元留著供稽核，但被排除在回答之外。",
     "src": [
      "s-method"
     ]
    },
    {
     "id": "sm-m3",
     "facet": "reason",
     "q": "更新階段為什麼不需要呼叫 LLM？",
     "opts": [
      "依賴邊寫入時已記下，只需沿邊走訪",
      "LLM 太貴，所以直接省略更新步驟",
      "更新階段改用向量相似度來判斷",
      "更新階段改用 BM25 比對關鍵字"
     ],
     "a": 0,
     "why": "§5.2 的確定性 Rechecker：沿邊走訪、改狀態欄位，是 \\(O(|E|)\\) 的圖演算法。",
     "src": [
      "s-method"
     ]
    },
    {
     "id": "sm-m4",
     "facet": "critique",
     "q": "Rechecker 只走一跳。多跳的連鎖由誰處理？",
     "opts": [
      "回答時的 LLM，依重算指引",
      "Rechecker 會遞迴走完整條鏈",
      "寫入時的 TurnEncoder 一次處理",
      "沒有任何機制處理多跳"
     ],
     "a": 0,
     "why": "附錄 E.3 的重算指引讓回答時的 LLM 沿著鏈依序重算；本頁 06 的對讀。",
     "src": [
      "s-method"
     ]
    }
   ]
  },
  "s-anim": {
   "qs": [
    {
     "id": "sm-a1",
     "facet": "reason",
     "q": "依 Figure 2 的三句規則（實領 $6000、每月存 30%、其餘自由支配），加薪到 $7500 後，可支配預算應該是？",
     "opts": [
      "$5250",
      "$4950",
      "$2250",
      "$4200"
     ],
     "a": 0,
     "why": "\\(7500 \\times 30\\% = 2250\\)，\\(7500 - 2250 = 5250\\)。圖上印的 $4950 推不出來；$4200 是加薪前的值（本頁 07、15 的驗算）。",
     "src": [
      "s-anim"
     ]
    }
   ]
  },
  "s-results": {
   "tier": "elite",
   "ask": 3,
   "qs": [
    {
     "id": "sm-r1",
     "facet": "reason",
     "q": "DeepSeek 面板上 StateMem 的 Overall 0.363 是怎麼來的？",
     "opts": [
      "依長度加權：\\((0.411 \\times 190 + 0.295 \\times 132) / 322\\)",
      "Short 與 Long 的簡單平均：\\((0.411 + 0.295) / 2\\)",
      "只算 Short（Set A）",
      "取最高的那個類別"
     ],
     "a": 0,
     "why": "本頁 08 的驗算；依類別加權也得 0.364。",
     "src": [
      "s-results"
     ]
    },
    {
     "id": "sm-r2",
     "facet": "critique",
     "q": "摘要的「1.8×」（DeepSeek）和「1.6×」（Qwen）比較對象一致嗎？",
     "opts": [
      "不一致：一個比基線，一個比記憶系統",
      "一致：兩者都比最強同骨幹基線",
      "一致：兩者都比 long-context",
      "一致：兩者都比 Mem0"
     ],
     "a": 0,
     "why": "本頁 08：1.8× 比最強同骨幹基線（Dense 0.205），1.6× 比最強記憶系統（Mem0 0.149）；Qwen 若也比最強基線 GraphRAG，只有約 1.04 倍且不顯著。",
     "src": [
      "s-results"
     ]
    },
    {
     "id": "sm-r3",
     "facet": "reason",
     "q": "在 StateMemBench 的 DeepSeek 面板上，同骨幹 long-context 的 Overall 是多少？",
     "opts": [
      "0.149",
      "0.363",
      "0.277",
      "0.205"
     ],
     "a": 0,
     "why": "Table 3：低於 StateMem 與多個記憶系統，和 BM25（0.143）差不多；長上下文在回想題很強，在陷阱題上不是。0.363 是 StateMem，0.277 是 GPT-5.4-Nano，0.205 是 Dense。",
     "src": [
      "s-results"
     ]
    },
    {
     "id": "sm-r4",
     "facet": "critique",
     "q": "不少基線在長版本（Set B）反而比較好，StateMem 卻從 0.411 掉到 0.295。原文怎麼解釋？",
     "opts": [
      "原文沒有解釋",
      "歸因於 token 預算不同",
      "歸因於實作上的錯誤",
      "以消融證明了原因"
     ],
     "a": 0,
     "why": "本頁 08 的觀察：原文沒有解釋這個方向差異。",
     "src": [
      "s-results"
     ]
    }
   ]
  },
  "s-ablation": {
   "qs": [
    {
     "id": "sm-x1",
     "facet": "reason",
     "q": "消融中，哪個元件的貢獻最大？",
     "opts": [
      "取代標記",
      "依賴傳播",
      "重算指引",
      "只做抽取"
     ],
     "a": 0,
     "why": "Table 3：DeepSeek 上從只做抽取的 0.174 到加上取代標記的 0.298；拿掉依賴傳播反而稍好（0.373 對 0.363）。",
     "src": [
      "s-ablation"
     ]
    },
    {
     "id": "sm-x2",
     "facet": "critique",
     "q": "作者為什麼把自家評測上的差距稱為「上限」？",
     "opts": [
      "陷阱和方法出自同一套偷懶策略",
      "樣本太少，信賴區間太寬",
      "LLM 判定者偏袒自家方法",
      "情境用 Claude 渲染，可能偏袒"
     ],
     "a": 0,
     "why": "§6.2 與附錄 H：造陷阱的偷懶策略正是 StateMem 設計要對抗的；方法和題目同源，外部評測才是泛化檢驗。",
     "src": [
      "s-ablation"
     ]
    }
   ]
  },
  "s-drift": {
   "qs": [
    {
     "id": "sm-d1",
     "facet": "critique",
     "q": "LightMem 在 DeepSeek 上的 drift-rate 只有 14.9%。為什麼不算好？",
     "opts": [
      "它幾乎不作答，多數落在池外",
      "評審對它的輸出有系統性偏差",
      "它的輸出被截斷，分數失真",
      "它用了和別人不同的骨幹"
     ],
     "a": 0,
     "why": "本頁 10 的自我檢測：322 題裡有 270 題落在池外，只答對 4 題。",
     "src": [
      "s-drift"
     ]
    },
    {
     "id": "sm-d2",
     "facet": "reason",
     "q": "弱骨幹（Qwen）與強骨幹（DeepSeek）的結果差異說明了什麼？",
     "opts": [
      "回答模型要夠強，狀態才轉得成答案",
      "骨幹強弱和結果沒有關係",
      "弱骨幹上 StateMem 的優勢更大",
      "StateMem 只在 Qwen 上有效"
     ],
     "a": 0,
     "why": "§6.3：Qwen 上各方法 drift-rate 都差不多，DeepSeek 上只有 StateMem 明顯下降。",
     "src": [
      "s-drift"
     ]
    }
   ]
  },
  "s-wrapper": {
   "tier": "elite",
   "ask": 3,
   "qs": [
    {
     "id": "sm-w1",
     "facet": "method",
     "q": "為什麼需要等長對照組 wrapper-ctrl？",
     "opts": [
      "分開「看完整對話」與「結構化推理」",
      "讓兩組的 API 花費保持相同",
      "量測包裝器額外帶來的延遲",
      "換一個骨幹模型做交叉對照"
     ],
     "a": 0,
     "why": "附錄 F.2：包裝器同時改了兩件事；對照組保留完整對話、拿掉結構化推理，兩者之差才是結構本身的效果。",
     "src": [
      "s-wrapper"
     ]
    },
    {
     "id": "sm-w2",
     "facet": "reason",
     "q": "StateMemBench 上 +SMW 比各後端單獨使用高 +31.7 到 +66.6 個百分點。其中歸給「結構」的是多少？",
     "opts": [
      "+15.0 到 +31.7",
      "全部 +31.7 到 +66.6",
      "0",
      "+66.6"
     ],
     "a": 0,
     "why": "扣掉等長對照組後的差。",
     "src": [
      "s-wrapper"
     ]
    },
    {
     "id": "sm-w3",
     "facet": "critique",
     "q": "包裝器在同一批題目上勝過 StateMem 本身（Qwen：0.283 對 ≥ 0.567）。這削弱了什麼主張？",
     "opts": [
      "持久儲存庫的必要性",
      "狀態結構對答題有幫助",
      "包裝器能套在任何後端",
      "陷阱題能區分方法優劣"
     ],
     "a": 0,
     "why": "§6.4 與本頁 15：作者說對話放不下時儲存庫才有用，但評測裡沒有放不下的情境。",
     "src": [
      "s-wrapper",
      "s-critique"
     ]
    },
    {
     "id": "sm-w4",
     "facet": "reason",
     "q": "Table 13：Mem0／Qwen 的 +SMW 在 LongMemEval 修好 18 題、弄壞 12 題（n = 60）。對應 Table 6 的哪個變化？",
     "opts": [
      "淨 +6 題，+10 個百分點",
      "+18 題，+30 個百分點",
      "淨 +6 題，+6 個百分點",
      "−12 題，−20 個百分點"
     ],
     "a": 0,
     "why": "6 / 60 = 10%，即 38.3 → 48.3。",
     "src": [
      "s-wrapper"
     ]
    }
   ]
  },
  "s-wanim": {
   "qs": [
    {
     "id": "sm-n1",
     "facet": "method",
     "q": "使用者曾大聲宣布「這次獎金要存滿 Roth」，後來的獎金卻落在最低級距。包裝器的哪條規則擋下這種 status 陷阱？",
     "opts": [
      "常設規則高於過去的單次個例",
      "較晚的資訊取代較早的",
      "衍生值從目前輸入重算",
      "事實只在被取代或到期時退場"
     ],
     "a": 0,
     "why": "附錄 F.1 的四條規則；本頁 11 把規則 2 對應到 status（錨定在響亮的承諾）：把規則套用到目前的輸入。",
     "src": [
      "s-wanim",
      "s-wrapper"
     ]
    }
   ]
  },
  "s-recall": {
   "qs": [
    {
     "id": "sm-c1",
     "facet": "reason",
     "q": "StateMem 在回想型評測上的優勢集中在哪些題型？",
     "opts": [
      "需要追蹤更新的題型：LongMemEval 的時間推理與知識更新",
      "single-session-assistant",
      "LoCoMo 的所有題型",
      "偏好題"
     ],
     "a": 0,
     "why": "§6.1、Table 11。",
     "src": [
      "s-recall"
     ]
    },
    {
     "id": "sm-c2",
     "facet": "critique",
     "q": "哪個題型最能反駁「追蹤狀態不犧牲回想」？",
     "opts": [
      "單 session 助理回想（SS-assistant）",
      "時間推理（temporal reasoning）",
      "知識更新（knowledge update）",
      "單 session 使用者回想（SS-user）"
     ],
     "a": 0,
     "why": "本頁 13 對 Table 11 的對照：LongMemEval 的 SS-assistant 上，StateMem 比 long-context 低約 40 個百分點。",
     "src": [
      "s-recall"
     ]
    }
   ]
  },
  "s-context": {
   "qs": [
    {
     "id": "sm-y1",
     "facet": "method",
     "q": "STALE 和 StateMemBench 怎麼分工？",
     "opts": [
      "STALE 測察覺隱性衝突，StateMemBench 測維護",
      "兩者測同一件事，只是領域不同",
      "StateMemBench 測隱性衝突，STALE 測維護",
      "STALE 只測檢索，StateMemBench 測生成"
     ],
     "a": 0,
     "why": "§2 與本頁 14：STALE 測沒說出口的衝突能不能被察覺（需要常識推論）；StateMemBench 把依賴明講，只測有沒有維護好。",
     "src": [
      "s-context",
      "s-bench"
     ]
    }
   ]
  },
  "s-critique": {
   "qs": [
    {
     "id": "sm-k1",
     "facet": "critique",
     "q": "要讓「持久儲存庫有必要」這個主張成立，該設計什麼實驗？",
     "opts": [
      "讓對話長過 context 再比較",
      "換更強的骨幹模型重跑一遍",
      "把題數增加到上千題再比",
      "換另一個 LLM 當判定者重評"
     ],
     "a": 0,
     "why": "本頁 15 的自我檢測：讓對話超過回答模型的 context（或刻意截斷），比較 StateMem 和包裝器。",
     "src": [
      "s-critique"
     ]
    },
    {
     "id": "sm-k2",
     "facet": "critique",
     "q": "本頁說「難度是對 Claude 讀者定義的」，指的是什麼？",
     "opts": [
      "驗證關卡用 Claude，受測卻沒有 Claude",
      "所有受測模型都屬於 Claude 系列",
      "評審模型只用 Claude 一家",
      "整個流程完全沒有用到 Claude 模型"
     ],
     "a": 0,
     "why": "附錄 D.6 與本頁 15：驗證關卡用 sonnet-4.6 確認可答、用 haiku-4.5 確認會中陷阱，情境也由 sonnet-4.6 渲染；這個偏差沒被檢查。",
     "src": [
      "s-critique",
      "s-bench"
     ]
    }
   ]
  }
 },
 "boss": {
  "qs": [
   {
    "id": "sm-z1",
    "facet": "reason",
    "q": "實領從 $6000 加薪到 $7500。StateMem 的三個階段怎麼處理「可支配預算」這個單元？",
    "opts": [
     "舊值標被取代、預算標待重算、回答時算出 $5250",
     "直接把預算覆寫成 $4950，並刪除舊的實領",
     "Rechecker 呼叫 LLM 當場重新計算出預算",
     "刪除預算單元，等使用者重新告知新預算"
    ],
    "a": 0,
    "why": "06 的三階段、07 的動畫與驗算：TurnEncoder 把舊的實領標為被取代並新增 $7500；Rechecker 把 derived_from 它的存款與預算單元標成 needs_recheck；回答時依重算指引算出 $5250。",
    "src": [
     "s-method",
     "s-anim"
    ]
   },
   {
    "id": "sm-z2",
    "facet": "critique",
    "q": "「StateMem 能抗漂移」最有力的證據，以及最需要保留的地方，各是什麼？",
    "opts": [
     "有力：DeepSeek 上漂移降、答對增；保留：陷阱與方法同源",
     "有力：Qwen 上全面領先；保留：沒有任何消融",
     "有力：LightMem 漂移最低；保留：沒有外部評測",
     "有力：推理開關有效；保留：只測一個領域"
    ],
    "a": 0,
    "why": "10 的漂移分析（DeepSeek 上 drift-rate 降 15 個百分點、答對 +42、池外最少）、08 的統計（Qwen 上和 GraphRAG 統計打平）、09 的「上限」；另外只跑一次。",
    "src": [
     "s-drift",
     "s-results",
     "s-ablation"
    ]
   },
   {
    "id": "sm-z3",
    "facet": "method",
    "q": "StateMemWrapper 和 StateMem 共用什麼、差在哪？",
    "opts": [
     "共用規則；StateMem 多了持久儲存與依賴圖",
     "共用儲存庫；包裝器多了 Rechecker",
     "共用依賴圖；StateMem 不做重算",
     "共用 Rechecker；包裝器只讀摘要"
    ],
    "a": 0,
    "why": "06 與 11：兩者共用取代優先、規則高於個例、衍生值重算等原則；包裝器只改回答時那一次呼叫、讀完整對話。",
    "src": [
     "s-wrapper",
     "s-method"
    ]
   },
   {
    "id": "sm-z4",
    "facet": "critique",
    "q": "「漂移是現有評測中的主要失敗類別」，這個主張有多強？",
    "opts": [
     "方向可信，但比例只是上限",
     "是精確、可直接引用的盛行率",
     "幾乎沒有任何實證支持",
     "人類判出的漂移比 LLM 更多"
    ],
    "a": 0,
    "why": "02 的判定程序：LLM 判定經對抗過濾後仍比人類判得多；03 的 oracle 實驗只在 36 個失敗上確認 44.4%；15 的限制。",
    "src": [
     "s-label",
     "s-evidence",
     "s-critique"
    ]
   },
   {
    "id": "sm-z5",
    "facet": "reason",
    "q": "某系統 drift-rate 只有 15%，但 322 題中 270 題落在選項池外。為什麼不能說它抗漂移？",
    "opts": [
     "分母是全部題數，不作答自然就低",
     "15% 已經低到足以證明抗漂移",
     "池外的答案都會被算作答對",
     "題目太難，所有系統都一樣差"
    ],
    "a": 0,
    "why": "04 的封閉選項池、10 的分析：drift-rate 以全部 n 為分母，要看池內漂移比例與答對數。",
    "src": [
     "s-drift",
     "s-bench"
    ]
   },
   {
    "id": "sm-z6",
    "facet": "method",
    "q": "為什麼說 STALE 和 StateMem 合起來，才是完整的狀態追蹤？",
    "opts": [
     "先察覺隱性依賴，再維護明講的依賴",
     "兩者測同一件事，可互相取代",
     "StateMem 已經涵蓋隱性衝突",
     "STALE 已經涵蓋依賴的維護"
    ],
    "a": 0,
    "why": "14 的對照與 04 的設計（依賴關係明講）：STALE 測能不能察覺沒說出口的依賴，StateMemBench 測依賴明講後能不能維護好。",
    "src": [
     "s-context",
     "s-bench"
    ]
   }
  ]
 }
};
