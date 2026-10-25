# self-research · 論文精讀室

## 魔法森林示範任務

書架上的漢斯會派出 FadeMem 示範任務：從 Problem、Method、Benchmark、Contribution、Gap 各完成一場對應的既有知識戰鬥，再通過跨章節 Boss 挑戰，回到書架或論文頁回報。卡片會指出下一關，戰勝後也可直接前往下一關；其餘章節仍可自由閱讀，不必先完成整篇才能回報。任務顯示未接取、進行中、可回報、已完成四種狀態；直接從論文進入並完成挑戰也會成為可回報。回報不重複發 EXP。短稱號仍依原規則在整篇 15 節完成後解鎖。

進度欄位、備份與同步合併規則見 [進度契約](docs/progress-contract.md)。新增的回歸測試可用 `node scripts/test_intro_quest.js`、`node scripts/test_storage_failure.js`、`node scripts/test_backup_merge.js`、`node scripts/test_study_sync_recovery.js`、`node scripts/test_battle_persistence.js` 與 `node scripts/test_shelf_progress.js` 執行。

一個幫助精讀論文的靜態網站。每篇論文一頁，同一段內容提供三種解釋深度（五歲 / 大學生 / 研究生，依 [ELI5 skill](.claude/skills/eli5/SKILL.md)），公式逐符號拆解，每節附自我檢測、筆記欄與閱讀進度。

## 研究生五維精讀與證據識讀（2026-10-24 新增）

每篇的「閱讀路線」頂端現在有 **Problem／Method／Benchmark／Contribution／Gap** 五維導航，均可連到既有的完整章節。下方提供四階段方法狀態推演、可調整的示意評分差距（百分點與相對變化）、五項公平性檢核，以及辨識「觀測／機制解釋／未經證實主張」的選擇練習。所有練習數字均為虛構示意，**不得引用為論文實驗數據**。閱讀筆記仍為選填，不建立任何新的 localStorage key，不動楓之谷討伐、經驗值、三層解釋或閱讀進度。

重要：原有頁首「已核對」文字記錄了**先前的教材編製聲明**，不能解讀為本次改版重新完成逐頁 PDF 覆核。本次已核實部分 arXiv 摘要頁元資料，但七篇的全文公式、圖表與數字 **並未全面重新審查**。逐篇精確版本、核對狀態、失敗／缺失項目記於 [source_manifest.json](scripts/research/source_manifest.json)。新增的五維摘要特別標「本次待覆核」，跨論文研究疑問為本站推導，不代表作者結論。原文取不到時不得根據搜尋摘要推測完整方法或數字。

維護與靜態驗收：

```bash
python3 scripts/check_reading_lab.py
python3 scripts/check_links.py
python3 scripts/quiz/build.py
```

互動式驗收仍需實際在瀏覽器確認：方法步進、滑桿零分母、答對／答錯提示、手機寬度、Safari、進度備份還原。靜態檢查不等於真機驗收；第一手來源審查也不等於程式碼檢查。

## 目前的論文

| arXiv | 論文 | 狀態 |
|---|---|---|
| [2601.18642](papers/2601.18642/index.html) | FadeMem: Biologically-Inspired Forgetting for Efficient Agent Memory | 已對照 v2 PDF 核對 |
| [2501.13956](papers/2501.13956/index.html) | Zep: A Temporal Knowledge Graph Architecture for Agent Memory | 已對照 v1 PDF 核對 |
| [2605.06527](papers/2605.06527/index.html) | STALE: Can LLM Agents Know When Their Memories Are No Longer Valid? | 已對照 v1 PDF 核對 |
| [2606.30306](papers/2606.30306/index.html) | Always-On Agents: A Survey of Persistent Memory, State, and Governance in LLM Agents | 已對照 v1 PDF 核對 |
| [2608.19652](papers/2608.19652/index.html) | Can Agent Memory Systems Track Evolving State? | 已對照 v1 PDF 核對 |
| [Findings of ACL 2026](papers/2604.20006/index.html) | From Recall to Forgetting: Benchmarking Long-Term Memory for Personalized Agents（Memora） | 新增教材已對照 ACL 正式版；未獨立重跑實驗 |
| [2610.09008](papers/2610.09008/index.html) | Whose Memory Is It? Scope-Aware Commit Rules for Long-Term LLM Memory（CASK） | 新增教材已對照 arXiv v1；workshop poster，未獨立重跑實驗 |
| [2604.14362](papers/2604.14362/index.html) | APEX-MEM: Agentic Semi-Structured Memory with Temporal Reasoning for Long-Term Conversational AI | 已對照 v1 PDF 核對 |
| [de Kleer 1986](papers/dekleer-1986-atms/index.html) | An Assumption-based TMS (Artificial Intelligence 28, 1986) | 已對照掃描 PDF 頁面影像核對 |

新增的 Memora 與 CASK 各有 13 個可記錄進度的章節、26 道章節／BOSS 題、三層解釋、關鍵原文數值表，以及 FAMA 計算器／作用範圍提交模擬器。頁首先展示原文研究核心與公式，各章也先列來源、方法或數據分析，再進入分層導讀。教材由 `python scripts/research/build_new_papers.py` 重建；逐章原文分析在 `scripts/research/new_paper_sources.py`，題庫原始碼在 `scripts/quiz/q_memora.py` 和 `scripts/quiz/q_cask.py`。來源與未完成驗證項目見 `scripts/research/source_manifest.json`。

楓之谷主場與導師刻意避開原七篇：Memora 用神木村、村長塔塔曼與戴米安；CASK 用海盜船諾特勒斯號、卡伊琳與威爾。這些場景與角色已在既有 `assets/maple/` 素材庫中，新增頁不依賴遠端圖片。怪物也選用尚未分配給原七篇的素材，並在 `assets/site.js` 中逐篇配置。

## 怎麼看

```bash
python3 -m http.server 8000
# 開 http://localhost:8000
```

也可以在 GitHub 設定開啟 Pages（Settings → Pages → Deploy from branch → `main` / root），直接用網址瀏覽。

筆記與進度存在瀏覽器的 localStorage。每頁最下方「複製全部筆記」會輸出 Markdown，可以存成 `papers/<id>/notes.md` 或貼給 Claude 更新頁面。

### 理解程度、複習與備份

- **理解程度**：每節「讀完這節」旁邊可以另外標「理解／部分理解／需要複習」，兩者分開記。標了之後會排下次複習日：需要複習隔天、部分理解 3 天、理解 7 天，到期後再標一次理解就往後排到 21、60 天。到期的章節在章節列表標「複習」、書架卡片標「N 節該複習」，書架側欄列出全部。標記不給經驗值，也不影響怪物。
- **先作答再看答案**：每題自我檢測下方有一個作答框，可寫可不寫，打開題目就能看參考答案。
- **備份與匯出**（書架側欄）：下載完整備份（JSON，本站在這個瀏覽器存的全部項目）、匯出筆記與進度（Markdown）、從備份還原。還原會先檢查格式與版本；可選「合併」（本機筆記與作答不動，只補本機沒有的）或「以備份為準」，後者若會覆蓋本機不同的筆記或作答，要另外勾選確認。還原前會先存一份快照，可以按「復原到上次還原之前」。不使用任何雲端服務。

### 章節討伐（每章一輪題目）

每篇論文的實質章節各有一隻怪，讀完那一節就可以按「挑戰」答一輪選擇題，答對全部就算討伐成功，那一節自動記為讀完。兩種外觀都有；楓葉冒險會顯示怪物。

- **難度**：普通章節至少一題、兩顆心；方法或實驗的核心章節是精英（3 題、兩顆心）；每篇最後一節是大 BOSS 綜合挑戰（6 題、三顆心）。BOSS 每題都跨兩節以上，是另外出的整合題，不是從各章題庫隨機抽。
- **三個面向**：方法理解、公式或情境推理、實驗批判。每篇的 BOSS 與整個題庫三種都有。
- **答錯**扣一顆心，並連回該重讀的那一節，但不揭曉答案；那題稍後會再出一次。心扣完就落敗。不論輸贏，回合結束都列出每題的答案、理由與出處。選項與題序每輪重新洗牌，可以無限次重來；原文與所有內容從不上鎖。
- **閱讀說明、純術語表、筆記匯出**這類非實質章節不出題，保留原本的「讀完這節」勾選；筆記收在每節下方的「筆記（選用）」裡。
- **通關獎勵**：打倒 BOSS 取得這一篇的稱號（例如 FadeMem 的「遺忘曲線馴服者」），累積打倒 1、3、5、7 篇的 BOSS 另得「見習遠征者」「資深遠征者」「遠征隊長」「精讀室賢者」。BOSS 那一節下方有研究熟練度（依面向）、這一篇的遠征紀錄，以及「需要再練的題目」（最近一次答錯的題目與答案）；書架側欄的「遠征紀錄」列出全部稱號、每篇的熟練題數與最近的戰鬥。
- **研究熟練度**：一題算熟練，要最近一次答對，而且第一次就答對或累計答對兩次。只計每輪第一次作答。

題庫寫在 `scripts/quiz/q_<paper>.py`，產生每篇的 `papers/<id>/quiz.js`：

```bash
python3 scripts/quiz/build.py            # 全部；或 build.py fademem 只做一篇
python3 scripts/quiz/install.py <paper-id>   # 新論文第一次：加上 BOSS 一節與 script 標籤（可重複執行）
python3 scripts/stamp_assets.py
```

`build.py` 會擋下：章節或出處 id 在頁面上找不到、選項重複或不是 3–4 個、精英少於 3 題、BOSS 不是 5–6 題或有題目只涵蓋一節、缺少任一面向，以及**正確答案比所有干擾選項長太多**（超過最長干擾選項的 1.4 倍），或正確答案是最長選項的題目超過一半（避免「挑最長的」就能答對）。

右上角「外觀」可以切換淺色、深色或跟隨系統。

在 iPhone Safari 用「加入主畫面」可以當成 App 開啟：頁面延伸到狀態列底下，狀態列那一條塗成深色、頁首接在下面，楓葉外觀的狀態窗貼齊螢幕底部（Home 指示條直接疊在狀態窗上，不另外墊高）。改過這部分的設定後，要把舊的主畫面圖示刪掉再重新加入才會生效。

### 楓葉冒險外觀

網站預設是「楓葉冒險」外觀，「外觀」選單可以切回原本的「精讀室」。楓葉冒險用楓之谷的遊戲美術（Nexon 所有）：視窗、NPC 對話框、狀態列、弓箭手村、魔法森林和登入畫面的場景，還有怪物、NPC、角色、寵物、任務圖示和傳送門。手機上章節列表收在頂列的地圖按鈕裡，點開從左邊滑出。論文頁在這個外觀下一次只顯示一節，用「上一節」「下一節」換頁；每節有一隻怪物，答完那一節的題目就會打倒牠（沒有題目的章節按「讀完這節」），主角（殺人鯨或露希妲）會歡呼，升級時放出升級特效。論文在弓箭手村還是魔法森林，由論文頁 `<div data-paper>` 上的 `data-scene="ellinia"` 決定。網站用到的圖片在 `assets/maple/`，是從完整素材包挑出、切好的；完整素材包不放進 repo。出場的角色列在 `scripts/maple_sprites.json`。換了素材或角色之後重新產生：

```bash
python3 -I scripts/setup_maple.py 路徑/maple-assets.zip
python3 scripts/stamp_assets.py
```

#### 經驗值與等級

所有論文共用一個角色，等級從 LV.1 開始、沒有上限，新增的論文自動計入，不用另外設定：

| 做了什麼 | 經驗值 |
|---|---|
| 第一次打開一篇論文 | +50 |
| 讀完一節（討伐成功，或按「讀完這節」） | +100；精英章節 +200、BOSS 綜合挑戰 +300 |
| 整篇每一節都讀完 | 再 +500 |
| 第一次打開一題自我檢測的答案 | +20 |
| 一節第一次寫筆記 | +30 |

經驗值是從存下來的進度算出來的，不是按一次加一次：取消勾選、清空筆記會扣回，所以來回點不會多拿。升下一級需要的經驗值是 `round((45 × LV^1.5 + 55) / 10) × 10`：讀完第一節就到 LV.2，讀完一整篇大約 LV.7，十篇大約 LV.18，五十篇大約 LV.34。稱號在 LV.10、20、30、50 轉職：新手讀者、見習研究員、研究員、資深研究員、精讀大師。等級和稱號顯示在狀態列和小地圖上方，書架的聊天列會列出累積經驗值和離下一級還差多少。所有數字只存在這個瀏覽器（`study:<id>:exp`、`study:<id>:asked`；戰鬥是 `study:<id>:qstat`、`study:<id>:battle`、`study:<id>:quizsum`、`study:expedition`、`study:titles`，都包含在備份裡）。

做法和素材對照寫在 [`.claude/skills/maple-skin/SKILL.md`](.claude/skills/maple-skin/SKILL.md)。用 `build_artifact.py` 內嵌成單一檔案的版本不帶圖片，所以只有淺色、深色可選。

## 研究者進階分析與研究工作台

給研究生的部分，和閱讀進度分開，不影響已讀節數：

- **每篇的「研究者進階分析」**（每頁術語表前的 R 節，四個可收合的區塊）：A 方法重建（輸入輸出、狀態、偽程式碼，每一步標「原文／推導／本站假設／原文未提供」）、B 可重現性審查（資料、程式碼、模型、提示詞、參數、指標、基線、統計、成本九項，標「已提供／部分提供／未提供／不適用／待核對」，並分開「重算論文表格」與「重跑原始實驗」）、C 主張與證據（證據、替代解釋、是否直接檢驗、未測邊界、支持強度與理由）、D 可否證的研究假說（研究構想，不是論文貢獻）。
- **研究工作台** [`compare/index.html`](compare/index.html)（書架標題下的按鈕）：原七篇的 13 維方法矩陣、同名評測數字、六個跨論文研究問題、分五類的研究缺口地圖；新增 Memora／CASK 專題對照另列於頁首。每個判斷連回精讀頁；原有缺口只在原七篇範圍內成立，不是九篇共同的缺口或新穎性主張。

內容的來源是 `scripts/research/` 裡的資料檔，改完重新產生：

```bash
python3 scripts/research/run.py            # 每篇的 R 節（rd_<paper>.py → 頁面）
python3 scripts/research/build_compare.py  # 研究工作台
python3 scripts/stamp_assets.py
```

## 新增一篇論文

在 Claude Code 裡貼上 arXiv 連結，請它「加入精讀室」。流程寫在 [`.claude/skills/paper-study/SKILL.md`](.claude/skills/paper-study/SKILL.md)：

1. `python3 scripts/fetch_arxiv.py <id>` 抓全文成純文字（存到 `_sources/`，不進 git）
2. 複製 `papers/_template/` 成 `papers/<id>/`，逐節填入三層解釋、公式、自我檢測
3. 在 `index.html` 的書架加一張卡片

每個頁面連到共用 CSS/JS 時都帶著版本號（`site.css?v=...`）。改過 `assets/` 裡任何檔案，或新增頁面後，跑一次 `python3 scripts/stamp_assets.py` 再 commit，GitHub Pages 上的瀏覽器才不會拿舊的快取配新頁面。

`python3 scripts/check_links.py` 檢查站內每個連結與 `#錨點` 都對得到（不需要瀏覽器）。

`python3 scripts/build_artifact.py papers/<id>/index.html dist/<id>.html` 會把共用 CSS/JS 內嵌成單一檔案，方便分享。

## 結構

```
index.html                 書架
compare/index.html         研究工作台（跨論文比較）
assets/site.css, site.js   共用樣式與互動（解釋深度切換、筆記、進度）
assets/anim.js             逐步教學動畫播放器（上一步／下一步／自動播放）
assets/battle.js           章節討伐的共用戰鬥元件、熟練度、稱號與遠征紀錄
papers/<id>/quiz.js        該篇題庫（由 scripts/quiz/ 產生）
papers/<arxiv-id>/         每篇論文一頁
papers/_template/          新論文模板
scripts/                   抓論文、打包單檔、蓋版本號
scripts/research/          研究者進階分析與研究工作台的資料與產生器
scripts/quiz/              題庫原稿、檢查與產生器（build.py）、安裝 BOSS 節（install.py）
.claude/skills/            eli5（解釋深度）與 paper-study（新增流程）
```
