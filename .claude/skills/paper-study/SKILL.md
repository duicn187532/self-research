---
name: paper-study
description: "Add a new paper to the 論文精讀室 study site in this repo, or update an existing paper page after the user has checked it against the full text. Use when the user gives an arXiv link or paper and asks to add it, make a study/close-reading (精讀) page, or explain a paper; also when they paste exported notes from a paper page."
---

# 論文精讀室：新增或更新一篇論文

The site is static HTML (no build step). Every paper is one page at `papers/<arxiv-id>/index.html`
that reuses `assets/site.css` and `assets/site.js`. The reader is a graduate-level researcher who
reads in Traditional Chinese (台灣用語); keep original English technical terms beside the Chinese.

## 1. Get the full text first

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

## 3. Register and check

- Add a card to `index.html` with `data-progress-for="<id>"` and `data-total` = number of `data-done` boxes.
- Add the paper to the research workbench: a column in `P` and a cell in every row of `DIMS` in
  `scripts/research/build_compare.py` (status `y`/`p`/`x`/`n`, one sentence, the page sections that
  support it), then revisit `QUESTIONS`, `GAPS` and `BENCH`. Run it and check every link resolves.
- Nothing to set up for EXP and levels: site.js derives a paper's EXP from its `data-done` boxes,
  `.check details` and `data-note` boxes (README, 經驗值與等級), and the total sums every paper.
- Run `python3 scripts/stamp_assets.py` so the new page links the current `site.css`/`site.js`/`anim.js`
  stamps (`?v=...`). Run it again whenever `assets/` changes; otherwise browsers on GitHub Pages can
  pair a new page with an old cached script.
- `python3 scripts/check_links.py` must report 0 broken links.
- Preview: `python3 -m http.server` and open the page, or build a single file with
  `python3 scripts/build_artifact.py papers/<id>/index.html dist/<id>.html` to publish as an Artifact.

## Updating after the user reads the full text

When the user pastes exported notes, apply their corrections, upgrade `src-2nd` tags to `src-abs`
for anything they confirmed, fill `?` cells, and remove the `.notice` box once nothing unverified remains.
