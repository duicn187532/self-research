---
name: paper-study
description: "Add a new paper to the 論文精讀室 study site in this repo, or update an existing paper page after the user has checked it against the full text. Use when the user gives an arXiv link or paper and asks to add it, make a study/close-reading (精讀) page, or explain a paper; also when they paste exported notes from a paper page."
---

# 論文精讀室：新增或更新一篇論文

The site is static HTML (no build step). Every paper is one page at `papers/<arxiv-id>/index.html`
that reuses `assets/site.css` and `assets/site.js`. The reader is a graduate-level researcher who
reads in Traditional Chinese (台灣用語); keep original English technical terms beside the Chinese.

## 1. Get the full text first

### 第一手來源與版本核對關卡

1. 先固定論文版本，依序查指定 arXiv PDF / HTML、出版社或 DOI、作者公開版本、合法開放資源。逐項核對標題、作者、日期、版本；記錄 URL 與取得日期。
2. PDF 與 HTML 相互檢查。公式、圖表、掃描或文字解析有歧義時，必須看 PDF **頁面影像**；標明頁碼／公式號／表號。文字萃取不等於完整核對。
3. 無法取得全文則標示「原文缺失／待核對」，列已嘗試來源與缺少資料，請使用者提供相同版本 PDF。可靠摘要只能做背景草稿，每項標「二手資料／待核對」，不得捏造公式、數據、消融、作者貢獻、缺口。
4. 嚴格區分**原文事實、作者主張、本站推導、示意假設、研究構想**。未提及不能當作未解決；需要獨立證據的 Gap 必須寫明推論界線。
5. 在 scripts/research/source_manifest.json 記錄原版本與核對狀態。舊版原文失效時保留舊版紀錄，新版本須逐項再查，不能自動繼承已核對狀態。
6. 新增或修改精讀頁時，在 assets/reading-lab.js 的 PAPERS 補齊五維摘要與各章節連結。方法互動要有狀態、逐步推演與預測，Benchmark 教學要分清觀測、因果解釋與未證主張。示例數值須明確標示虛構。
7. 取得全文後必須再查公式、表格、圖像、資料集、基線、評分、消融、題庫與詳解，通過才能移除待核對。筆記不是原始論文證據。
8. 不增加強制打字流程；保留原章節 ID 與 localStorage 的進度、戰鬥和備份相容性。更新後執行 check_reading_lab.py、check_links.py、題庫及瀏覽器驗收。

```bash
python3 scripts/fetch_arxiv.py <id>v<N>        # writes _sources/<id>v<N>.txt
```

If arxiv.org is blocked, try the `web-fetch` agent, then ask the user to upload the PDF or allow
arxiv.org in the environment's network settings. Search-result summaries are a last resort: mark
every claim from them `二手・待核對` and add the yellow `.notice` box saying the page is unverified.
Never fill in an equation, number or hyperparameter that no source gave; write `?` and a note instead.

## 2. Build the page

1. `cp -r papers/_template papers/<id>` and replace `ARXIV_ID`, `PAPER_SHORT` and the header fields.
2. One `<section class="sec" id="s-..." data-short="...">` per idea the reader must understand,
   in reading order: 閱讀路線, problem, each method component, results, ablation, related work,
   critique, glossary, export. The outline and progress bar are generated from these sections.
3. Each section carries, in this order where they apply:
   - equations in `.eq` (MathJax, `\[ ... \]` / `\( ... \)`; escape `<` `>` as `&lt;` `&gt;`;
     no CJK inside `\text{}`), followed by a symbol table;
   - `.explain` with three `.lv` blocks written with the **eli5** skill
     (`.claude/skills/eli5/SKILL.md`): `lv-kid` = Age 5, `lv-uni` = College Student,
     `lv-grad` = Graduate school. Each starts with the "what", uses an analogy, ends with "so what";
   - `.claim` paraphrasing what the paper itself says;
   - `.check` with 1–3 self-test questions in `<details>`;
   - `.desk-foot` with a notes textarea (`data-note`) and a done checkbox (`data-done`), same id as the section.
4. Tag every factual claim with its provenance: `src-abs` (abstract / original text),
   `src-2nd` (secondary, unverified), `src-mine` (your own derivation or background knowledge).
5. When a mechanism has a tunable curve or formula, add a small interactive figure
   (see the decay chart in `papers/2601.18642/index.html`): inline SVG, colors from CSS tokens.
6. Whenever the paper has an algorithm, pipeline or protocol, add a step-by-step teaching animation
   with `assets/anim.js` (load it after `site.js`): `StudyAnim(el, { width, height, init, steps, draw })`.
   Each step has a `title`, a `text` caption citing the equation/section, and a `run(state)`; `draw`
   upserts keyed SVG nodes with `scene.put(key, tag, attrs, text, parentKey)` (use `pos: [x, y]` to
   animate movement, and draw backgrounds in a `bg` group before an `fg` group). Compute every number
   shown from the paper's formulas; label parameters the paper does not give as 示意, and say in the
   caption when the animation shows an idealised path rather than measured behaviour. Put it in its
   own `.sec` (e.g. `id="s-anim"`) so it counts toward progress. Examples: FadeMem (full Eq.14 loop),
   Zep (graph build + retrieval), STALE (two systems side by side), 2606.30306 (lifecycle, AOEP).
7. Add retrieval practice: a `.predict` box in 閱讀路線 with 2–3 questions the reader guesses before
   reading (answered in later `.check` items), and 「先猜」 prompts in animation captions one step
   before the answer is shown. Example: `papers/2608.19652/index.html`.
8. Check numbers mechanically: extract every number from the page and confirm it appears in the
   PDF text or is a derived value whose working is shown on the page.
9. In the critique section, write real questions about fairness of baselines, hyperparameters,
   cost, and generalisation; not praise.
10. Add the 研究者進階分析 section (`id="s-research"`, before the glossary, notes box but no done box,
   so it does not change the section count). Write `scripts/research/rd_<paper>.py` modelled on the
   existing ones, add it to `scripts/research/run.py`, and run it; `rg_lib.py` renders four folded
   blocks. Add only what the page does not already cover:
   - A 方法重建: inputs/outputs, state, pseudocode, update order and triggers, complexity only where
     there is evidence; tag every step `orig` 原文 / `derived` 推導 / `assume` 本站假設 / `unknown` 原文未提供,
     with its section, equation or table;
   - B 可重現性: the nine dimensions (Data, Code, Model, Prompt, Parameters, Metrics, Baseline,
     Statistics, Cost) as `yes`/`part`/`no`/`na`/`check` (待核對 = not yet confirmed, not "absent"), then
     what can be redone, what only partly, and the key gaps; keep recomputing the paper's tables apart
     from rerunning its experiments;
   - C 主張與證據: per key claim the evidence, alternative explanations, whether the experiment tests it
     directly, untested boundaries, and a strength (`strong`/`part`/`weak`/`undet`) with the reason; a
     missing experiment does not make the method wrong;
   - D 研究假說: 1–3 falsifiable hypotheses with design, baselines, controls, metrics, what the result
     would tell apart, and failure conditions; label them ideas, not contributions.
   Never guess a number the paper does not give; keep the authors' claims apart from the site's comments.
11. Add the chapter battles (章節討伐). Write `scripts/quiz/q_<paper>.py` modelled on the existing banks
   and run `python3 scripts/quiz/install.py <id>` once (adds the `s-boss` section before `s-research`,
   the `quiz.js` and `battle.js` script tags, and bumps the shelf card's `data-total`; safe to rerun),
   then `python3 scripts/quiz/build.py <name>`. Rules:
   - `Q(id, facet, question, options, why, src)`: the right answer is always `options[0]` (the page
     shuffles); facet is `method` 方法理解, `reason` 公式或情境推理, or `critique` 實驗批判; `src` lists
     the sections to reread (defaults to the chapter itself).
   - Every substantive chapter gets at least one question; reading guide (`s-route`), pure glossary and
     export get none and keep their done box. Mark the method or experiment core chapters
     `"tier": "elite"` with `"ask": 3`. The BOSS asks 5–6 questions written for it, each spanning at
     least two chapters (not copies of chapter questions); the BOSS and the bank cover all three facets.
   - Only questions whose answer the page (checked against the full text) settles. Recompute any
     number before using it; put the working in `why`. Fewer good questions beat padded coverage.
   - Keep the answer to its core claim and move detail into `why`. Distractors are specific, plausible
     statements the page refutes, about as long as the answer, sharing its form (no odd-one-out prefix
     like 「因為」 on distractors only), and never invent a number attributed to the paper. `build.py`
     rejects an answer over 1.4× its longest distractor, or one that is the longest option in more than
     half the questions.
   - `why` says why the answer is right and where (section, table, page 0N), without new claims.

## 3. Register and check

- Add a card to `index.html` with `data-progress-for="<id>"` and `data-total` = number of `data-done` boxes.
- Add the paper to the research workbench: a column in `P` and a cell in every row of `DIMS` in
  `scripts/research/build_compare.py` (status `y`/`p`/`x`/`n`, one sentence, the page sections that
  support it), then revisit `QUESTIONS`, `GAPS` and `BENCH`. Run it and check every link resolves.
- Nothing to set up for understanding marks, review dates or answer boxes: site.js adds them to every
  section with a `data-done` box and under every `.check details`, and saves the page's section list
  (`study:<id>:toc`) for the shelf's review list and Markdown export. Keep section ids stable once
  published, since notes, marks and answers are stored by id (answers by question order).
- Battles mark a chapter done when won and use the same `data-done` box, so EXP, progress and the
  maple monsters need nothing extra; keep chapter ids in the bank in sync with the page (`build.py`
  checks them).
- Nothing to set up for EXP and levels: site.js derives a paper's EXP from its `data-done` boxes,
  `.check details` and `data-note` boxes (README, 經驗值與等級), and the total sums every paper.
- Run `python3 scripts/stamp_assets.py` so the new page links the current `site.css`/`site.js`/`anim.js`
  stamps (`?v=...`). Run it again whenever `assets/` changes; otherwise browsers on GitHub Pages can
  pair a new page with an old cached script.
- `python3 scripts/check_links.py` must report 0 broken links.
- Preview: `python3 -m http.server` and open the page, or build a single file with
  `python3 scripts/build_artifact.py papers/<id>/index.html dist/<id>.html` to publish as an Artifact.

## Updating after the user reads the full text

Treat user-exported notes as review suggestions, never as proof. Do not change src-2nd to src-abs until evidence is checked in the exact version of the original PDF/HTML, including page images where formulas or tables are ambiguous. Keep unknown values and notices until independently resolved. Preserve historical verification when a new version appears, but mark the new version pending.
