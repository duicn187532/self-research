# self-research · 論文精讀室

一個幫助精讀論文的靜態網站。每篇論文一頁，同一段內容提供三種解釋深度（五歲 / 大學生 / 研究生，依 [ELI5 skill](.claude/skills/eli5/SKILL.md)），公式逐符號拆解，每節附自我檢測、筆記欄與閱讀進度。

## 目前的論文

| arXiv | 論文 | 狀態 |
|---|---|---|
| [2601.18642](papers/2601.18642/index.html) | FadeMem: Biologically-Inspired Forgetting for Efficient Agent Memory | 已對照 v2 PDF 核對 |
| [2501.13956](papers/2501.13956/index.html) | Zep: A Temporal Knowledge Graph Architecture for Agent Memory | 已對照 v1 PDF 核對 |
| [2605.06527](papers/2605.06527/index.html) | STALE: Can LLM Agents Know When Their Memories Are No Longer Valid? | 已對照 v1 PDF 核對 |
| [2606.30306](papers/2606.30306/index.html) | Always-On Agents: A Survey of Persistent Memory, State, and Governance in LLM Agents | 已對照 v1 PDF 核對 |
| [2608.19652](papers/2608.19652/index.html) | Can Agent Memory Systems Track Evolving State? | 已對照 v1 PDF 核對 |
| [2604.14362](papers/2604.14362/index.html) | APEX-MEM: Agentic Semi-Structured Memory with Temporal Reasoning for Long-Term Conversational AI | 已對照 v1 PDF 核對 |
| [de Kleer 1986](papers/dekleer-1986-atms/index.html) | An Assumption-based TMS (Artificial Intelligence 28, 1986) | 已對照掃描 PDF 頁面影像核對 |

## 怎麼看

```bash
python3 -m http.server 8000
# 開 http://localhost:8000
```

也可以在 GitHub 設定開啟 Pages（Settings → Pages → Deploy from branch → `main` / root），直接用網址瀏覽。

筆記與進度存在瀏覽器的 localStorage。每頁最下方「複製全部筆記」會輸出 Markdown，可以存成 `papers/<id>/notes.md` 或貼給 Claude 更新頁面。

右上角「外觀」可以切換淺色、深色或跟隨系統。

### 楓葉冒險外觀

「外觀」裡的「楓葉冒險」用楓之谷的遊戲美術（Nexon 所有）：視窗、NPC 對話框、狀態列、弓箭手村場景。網站用到的圖片在 `assets/maple/`，是從完整素材包挑出、切好的約 50 張；完整素材包不放進 repo。換了素材或 NPC 之後重新產生：

```bash
python3 -I scripts/setup_maple.py 路徑/maple-assets.zip
```

做法和素材對照寫在 [`.claude/skills/maple-skin/SKILL.md`](.claude/skills/maple-skin/SKILL.md)。用 `build_artifact.py` 內嵌成單一檔案的版本不帶圖片，所以只有淺色、深色可選。

## 新增一篇論文

在 Claude Code 裡貼上 arXiv 連結，請它「加入精讀室」。流程寫在 [`.claude/skills/paper-study/SKILL.md`](.claude/skills/paper-study/SKILL.md)：

1. `python3 scripts/fetch_arxiv.py <id>` 抓全文成純文字（存到 `_sources/`，不進 git）
2. 複製 `papers/_template/` 成 `papers/<id>/`，逐節填入三層解釋、公式、自我檢測
3. 在 `index.html` 的書架加一張卡片

`python3 scripts/build_artifact.py papers/<id>/index.html dist/<id>.html` 會把共用 CSS/JS 內嵌成單一檔案，方便分享。

## 結構

```
index.html                 書架
assets/site.css, site.js   共用樣式與互動（解釋深度切換、筆記、進度）
assets/anim.js             逐步教學動畫播放器（上一步／下一步／自動播放）
papers/<arxiv-id>/         每篇論文一頁
papers/_template/          新論文模板
scripts/                   抓論文、打包單檔
.claude/skills/            eli5（解釋深度）與 paper-study（新增流程）
```
