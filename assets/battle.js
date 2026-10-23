// Chapter battles: a round of questions fought as a monster, shared by every paper page and the shelf.
// A paper's questions live in papers/<id>/quiz.js (window.STUDY_QUIZ); site.js mounts a battle in each
// chapter that has some and ties a win to the chapter's 讀完這節 box, so progress, EXP and the monster's
// fall work as before. This file knows nothing about sprites: it asks, scores, and keeps the records.
//
// Rules. A wrong answer costs a heart and names the chapter to reread, but does not give the answer away;
// the question comes back later in the round with its options reshuffled. The monster falls when every
// question has been answered right; the player falls when the hearts run out. Either way the round ends
// with every question, its answer, why, and where the page explains it. Rounds can be fought again at
// any time, and nothing here stops anyone reading or turning pages.
//
// Records, all under "study:" so the shelf's backup carries them:
//   study:<paper>:qstat    { qid: [attempts, correct, lastRight, firstRight] }, first answer in each round only
//   study:<paper>:battle   { chapter: { w: wins, l: losses, best: right at first try, n: questions, at } }
//   study:<paper>:quizsum  what the shelf shows: questions, mastered, per facet, title
//   study:expedition       the latest rounds, newest first
//   study:titles           titles earned: one per paper's BOSS, more for BOSSes beaten across papers
(function () {
  "use strict";

  var S = {
    get: function (k, fallback) {
      try { var v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set: function (k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); return true; }
      catch (e) { return false; }
    }
  };
  function obj(v) { return v && typeof v === "object" && !Array.isArray(v) ? v : {}; }
  function list(v) { return Array.isArray(v) ? v : []; }
  function shuffle(a) { return a.map(function (x) { return [Math.random(), x]; }).sort(function (p, q) { return p[0] - q[0]; }).map(function (p) { return p[1]; }); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function html(tag, cls, markup) { var e = el(tag, cls); e.innerHTML = markup; return e; }
  function tex(node) {
    if (window.MathJax && window.MathJax.typesetPromise) window.MathJax.typesetPromise([node]).catch(function () {});
  }
  function ymd(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }

  var FACETS = { method: "方法理解", reason: "公式與情境推理", critique: "實驗批判" };
  // a normal monster asks one or two questions, an elite three, the BOSS five or six across chapters
  var TIERS = {
    normal: { label: "普通", hearts: 2 },
    elite: { label: "精英", hearts: 2 },
    boss: { label: "BOSS", hearts: 3 }
  };
  // titles for BOSSes beaten across all papers, on top of each paper's own
  var RANKS = [[1, "見習遠征者"], [3, "資深遠征者"], [5, "遠征隊長"], [7, "精讀室賢者"]];

  function qstat(paper) { return obj(S.get("study:" + paper + ":qstat", {})); }
  function mastered(s) { return !!s && s[2] === 1 && (s[3] === 1 || s[1] >= 2); }
  function allQuestions(bank) {
    var out = [];
    Object.keys(obj(bank.sections)).forEach(function (k) { list(bank.sections[k].qs).forEach(function (q) { out.push(q); }); });
    if (bank.boss) list(bank.boss.qs).forEach(function (q) { out.push(q); });
    return out;
  }
  // mastery: the last answer right, and right the first time or right twice
  function summary(paper, bank) {
    var st = qstat(paper), qs = allQuestions(bank), f = {};
    Object.keys(FACETS).forEach(function (k) { f[k] = [0, 0]; });
    var m = 0;
    qs.forEach(function (q) {
      var ok = mastered(st[q.id]);
      if (ok) m++;
      if (f[q.facet]) { f[q.facet][1]++; if (ok) f[q.facet][0]++; }
    });
    var rec = obj(S.get("study:" + paper + ":battle", {})), cleared = 0, chapters = Object.keys(obj(bank.sections)).length;
    Object.keys(obj(bank.sections)).forEach(function (k) { if (rec[k] && rec[k].w) cleared++; });
    var sum = { total: qs.length, mastered: m, facets: f, chapters: chapters, cleared: cleared,
      boss: !!(rec["s-boss"] && rec["s-boss"].w), title: bank.title || "" };
    S.set("study:" + paper + ":quizsum", sum);
    return sum;
  }
  function titles() { return list(S.get("study:titles", [])); }
  function grant(paper, title) {
    var t = titles(), fresh = [];
    function add(name, p) {
      if (!name || t.some(function (x) { return x.t === name; })) return;
      t.push({ t: name, p: p, at: ymd(new Date()) });
      fresh.push(name);
    }
    add(title, paper);
    var beaten = t.filter(function (x) { return x.p !== "*"; }).length;
    RANKS.forEach(function (r) { if (beaten >= r[0]) add(r[1], "*"); });
    S.set("study:titles", t);
    return fresh;
  }
  function log(entry) {
    var e = list(S.get("study:expedition", []));
    e.unshift(entry);
    S.set("study:expedition", e.slice(0, 120));
  }

  // ---------- one battle, mounted in a chapter's foot ----------
  // cfg: paper, key (chapter id, "s-boss" for the BOSS), tier, foe, set ({ qs, ask }), name (chapter label),
  //      names ({ chapter id: label }), cleared (already marked read), onHit, onWin(result), onLose(result)
  function mount(host, cfg) {
    var tier = TIERS[cfg.tier] || TIERS.normal, qs = list(cfg.set.qs);
    if (!qs.length) return null;
    var ask = Math.min(cfg.set.ask || qs.length, qs.length);
    var box = el("div", "battle");
    box.setAttribute("data-tier", cfg.tier);
    var head = el("div", "bt-head");
    head.appendChild(el("span", "bt-tier", tier.label));
    var hero = el("span", "bt-hero");
    hero.setAttribute("aria-hidden", "true");
    head.appendChild(hero);
    var art = el("span", "bt-art");
    art.setAttribute("aria-hidden", "true");
    head.appendChild(art);
    var foe = el("b", "bt-foe", cfg.foe || (cfg.tier === "boss" ? "BOSS" : "章節怪物"));
    head.appendChild(foe);
    head.appendChild(el("span", "bt-rule", ask + " 題・" + "♥".repeat(tier.hearts)));
    box.appendChild(head);
    var status = el("p", "bt-status");
    box.appendChild(status);
    var row = el("div", "btn-row bt-row");
    var go = el("button", "btn bt-go");
    go.type = "button";
    row.appendChild(go);
    box.appendChild(row);
    var arena = el("div", "bt-arena");
    arena.hidden = true;
    arena.innerHTML = '<div class="bt-bars"><span class="bt-hp" role="img"><i></i></span><span class="bt-hearts" role="img"></span></div>' +
      '<p class="bt-facet"></p><div class="bt-q" tabindex="-1"></div><div class="bt-opts" role="group"></div>' +
      '<p class="bt-say" aria-live="polite"></p><div class="btn-row"><button type="button" class="btn bt-next" hidden>下一題</button>' +
      '<button type="button" class="btn bt-quit">撤退</button></div>';
    box.appendChild(arena);
    var result = el("div", "bt-result");
    result.hidden = true;
    box.appendChild(result);
    host.appendChild(box);

    var hpBar = arena.querySelector(".bt-hp"), hpFill = hpBar.querySelector("i"), hearts = arena.querySelector(".bt-hearts");
    var facet = arena.querySelector(".bt-facet"), qEl = arena.querySelector(".bt-q"), opts = arena.querySelector(".bt-opts");
    var say = arena.querySelector(".bt-say"), next = arena.querySelector(".bt-next"), quit = arena.querySelector(".bt-quit");
    var round = null;

    function record() { return obj(obj(S.get("study:" + cfg.paper + ":battle", {}))[cfg.key]); }
    function paintStatus() {
      var r = record();
      if (r.w) status.textContent = "已討伐 × " + r.w + "　最佳：一次答對 " + r.best + " / " + r.n + (r.l ? "　敗北 " + r.l + " 次" : "");
      else if (r.l) status.textContent = "挑戰 " + r.l + " 次，還沒打倒。答錯的題目在戰後都有解答，複習後再來。";
      else if (cfg.cleared && cfg.cleared()) status.textContent = "這一節已標記讀完（舊紀錄）。挑戰一次，熟練度才會算進去。";
      else status.textContent = cfg.tier === "boss" ? "跨章節的綜合題，涵蓋方法、推理與實驗批判。" : "讀完這一節再來挑戰；答錯不會鎖住任何內容。";
      go.textContent = r.w ? "再戰一次" : r.l ? "再挑戰" : "開始討伐";
    }
    function linkTo(ids) {
      return list(ids).map(function (id) {
        var a = el("a", null, cfg.names[id] || id);
        a.href = "#" + id;
        return a;
      });
    }
    function paintBars() {
      hpFill.style.width = (100 * round.hp / round.n) + "%";
      hpBar.setAttribute("aria-label", "怪物剩餘 " + round.hp + " / " + round.n);
      hearts.textContent = "♥".repeat(round.hearts) + "♡".repeat(tier.hearts - round.hearts);
      hearts.setAttribute("aria-label", "剩下 " + round.hearts + " 顆心");
    }
    function start() {
      var picked = shuffle(qs).slice(0, ask);
      round = { queue: picked, n: picked.length, hp: picked.length, hearts: tier.hearts, seen: {}, firstRight: 0, log: [] };
      result.hidden = true;
      arena.hidden = false;
      go.hidden = true;
      if (cfg.onStart) cfg.onStart();
      paintBars();
      show();
    }
    function show() {
      var q = round.queue[0];
      facet.textContent = (FACETS[q.facet] || "") + (cfg.tier === "boss" && q.src ? "　跨 " + list(q.src).length + " 節" : "");
      qEl.innerHTML = q.q;
      opts.textContent = "";
      shuffle(q.opts.map(function (o, i) { return i; })).forEach(function (i) {
        var b = html("button", "bt-opt", q.opts[i]);
        b.type = "button";
        b.setAttribute("data-i", i);
        b.addEventListener("click", function () { choose(q, i, b); });
        opts.appendChild(b);
      });
      say.textContent = "";
      next.hidden = true;
      tex(arena);
    }
    function choose(q, i, btn) {
      Array.prototype.forEach.call(opts.children, function (b) { b.disabled = true; });
      var right = i === q.a;
      if (!round.seen[q.id]) {
        round.seen[q.id] = true;
        var st = qstat(cfg.paper), s = st[q.id] || [0, 0, 0, right ? 1 : 0];
        s[0]++; if (right) s[1]++; s[2] = right ? 1 : 0;
        st[q.id] = s;
        S.set("study:" + cfg.paper + ":qstat", st);
        if (right) round.firstRight++;
        round.log.push({ q: q, first: right });
      }
      say.textContent = "";
      if (right) {
        btn.classList.add("is-right");
        round.hp--;
        round.queue.shift();
        say.appendChild(el("b", null, "命中！"));
        if (cfg.onHit) cfg.onHit();
      } else {
        btn.classList.add("is-wrong");
        round.hearts--;
        round.queue.push(round.queue.shift());
        say.appendChild(el("b", null, "被反擊了！"));
        say.appendChild(document.createTextNode(round.hearts ? "這題稍後再來一次。回去看看：" : "回去看看："));
        linkTo(q.src || [cfg.key]).forEach(function (a, k) { if (k) say.appendChild(document.createTextNode("、")); say.appendChild(a); });
      }
      paintBars();
      if (!round.hp || !round.hearts) { next.textContent = round.hp ? "看戰況" : "收下戰利品"; }
      else next.textContent = "下一題";
      next.hidden = false;
      next.focus();
    }
    function finish() {
      var win = !round.hp;
      var all = obj(S.get("study:" + cfg.paper + ":battle", {})), r = obj(all[cfg.key]);
      if (win) { r.w = (r.w || 0) + 1; if (r.best === undefined || round.firstRight > r.best) r.best = round.firstRight; r.n = round.n; }
      else r.l = (r.l || 0) + 1;
      if (r.n === undefined) r.n = round.n;
      if (r.best === undefined) r.best = 0;
      r.at = ymd(new Date());
      all[cfg.key] = r;
      S.set("study:" + cfg.paper + ":battle", all);
      log({ at: new Date().toISOString(), p: cfg.paper, k: cfg.key, n: cfg.name || cfg.key, tier: cfg.tier, win: win, sc: round.firstRight + "/" + round.n });
      arena.hidden = true;
      result.hidden = false;
      result.textContent = "";
      result.appendChild(el("p", "bt-verdict", win ? "討伐成功！一次答對 " + round.firstRight + " / " + round.n : "被打倒了……一次答對 " + round.firstRight + " / " + round.n + "。複習下面的解答後再挑戰。"));
      var ol = el("ol", "bt-review");
      round.log.forEach(function (it) {
        var li = el("li", it.first ? "is-right" : "is-wrong");
        li.appendChild(html("p", "bt-rq", '<span class="bt-mark">' + (it.first ? "一次答對" : "答錯過") + "</span> " + it.q.q));
        li.appendChild(html("p", "bt-ra", "答案：" + it.q.opts[it.q.a]));
        if (it.q.why) li.appendChild(html("p", "bt-why", it.q.why));
        var src = el("p", "bt-src", "出處：");
        linkTo(it.q.src || [cfg.key]).forEach(function (a, k) { if (k) src.appendChild(document.createTextNode("、")); src.appendChild(a); });
        li.appendChild(src);
        ol.appendChild(li);
      });
      // questions never reached before the hearts ran out stay unseen: they come up next round
      result.appendChild(ol);
      go.hidden = false;
      paintStatus();
      tex(result);
      var res = { win: win, firstRight: round.firstRight, n: round.n };
      round = null;
      if (win && cfg.onWin) cfg.onWin(res);
      if (!win && cfg.onLose) cfg.onLose(res);
    }
    go.addEventListener("click", start);
    next.addEventListener("click", function () { if (!round.hp || !round.hearts) finish(); else show(); });
    quit.addEventListener("click", function () { round = null; arena.hidden = true; go.hidden = false; paintStatus(); });
    paintStatus();
    // site.js hands over the monster's name and picture once the game art has loaded
    function setFoe(name, node) {
      if (name) foe.textContent = name;
      art.textContent = "";
      if (node) art.appendChild(node);
    }
    function setHero(node) { hero.textContent = ""; if (node) hero.appendChild(node); }
    return { refresh: paintStatus, setFoe: setFoe, setHero: setHero };
  }

  // ---------- the BOSS chapter's board: title, mastery by facet, this paper's record, questions to revisit ----------
  function bar(label, m, t) {
    var row = el("div", "bt-meter");
    row.appendChild(el("span", "bt-meter-label", label));
    var track = el("span", "bt-meter-track");
    var fill = el("i");
    fill.style.width = t ? (100 * m / t) + "%" : "0";
    track.appendChild(fill);
    row.appendChild(track);
    row.appendChild(el("span", "bt-meter-num", m + " / " + t));
    return row;
  }
  function board(host, paper, bank, names) {
    host.textContent = "";
    var sum = summary(paper, bank), got = titles().some(function (x) { return x.p === paper; });
    host.appendChild(html("p", "bt-title-line", got ? "稱號：<b>" + bank.title + "</b>（已取得）" : "打倒 BOSS 可得稱號：<b>" + bank.title + "</b>"));
    host.appendChild(el("h3", null, "研究熟練度"));
    host.appendChild(bar("全部題目", sum.mastered, sum.total));
    Object.keys(FACETS).forEach(function (k) { host.appendChild(bar(FACETS[k], sum.facets[k][0], sum.facets[k][1])); });
    host.appendChild(el("p", "bt-note", "一題算熟練：最近一次答對，而且第一次就答對或累計答對兩次。章節討伐 " + sum.cleared + " / " + sum.chapters + "。"));
    var mine = list(S.get("study:expedition", [])).filter(function (e) { return e.p === paper; }).slice(0, 8);
    host.appendChild(el("h3", null, "遠征紀錄"));
    if (!mine.length) host.appendChild(el("p", "bt-note", "還沒有戰鬥紀錄。"));
    else {
      var ul = el("ul", "bt-log");
      mine.forEach(function (e) {
        var li = el("li", e.win ? "is-win" : "is-lose");
        li.appendChild(el("span", "bt-log-at", e.at.slice(5, 10).replace("-", "/")));
        var nm = names[e.k] || e.n, tag = TIERS[e.tier] && nm.indexOf(TIERS[e.tier].label) !== 0 ? "〔" + TIERS[e.tier].label + "〕" : "";
        var a = el("a", null, tag + nm);
        a.href = "#" + e.k;
        li.appendChild(a);
        li.appendChild(el("span", "bt-log-r", (e.win ? "勝" : "敗") + "　" + e.sc));
        ul.appendChild(li);
      });
      host.appendChild(ul);
    }
    // questions answered wrong last time, with their answers: the review list
    var st = qstat(paper), redo = allQuestions(bank).filter(function (q) { return st[q.id] && st[q.id][2] === 0; });
    host.appendChild(el("h3", null, "需要再練的題目"));
    if (!redo.length) host.appendChild(el("p", "bt-note", "目前沒有。最近一次答錯的題目會列在這裡，附解答與出處。"));
    redo.forEach(function (q) {
      var d = el("details", "bt-redo");
      d.appendChild(html("summary", null, q.q));
      d.appendChild(html("p", "bt-ra", "答案：" + q.opts[q.a]));
      if (q.why) d.appendChild(html("p", "bt-why", q.why));
      var src = el("p", "bt-src", "出處：");
      list(q.src).forEach(function (id, k) {
        if (k) src.appendChild(document.createTextNode("、"));
        var a = el("a", null, names[id] || id);
        a.href = "#" + id;
        src.appendChild(a);
      });
      d.appendChild(src);
      host.appendChild(d);
    });
    tex(host);
  }

  // ---------- the shelf's panel: titles, each paper's mastery, the latest rounds ----------
  // papers: [{ id, short, href }]
  function shelf(host, papers) {
    host.textContent = "";
    var t = titles();
    var chips = el("p", "bt-chips");
    if (!t.length) chips.textContent = "還沒有稱號：打倒任一篇的 BOSS 就能拿到。";
    t.forEach(function (x) { chips.appendChild(el("span", "bt-chip", x.t)); });
    host.appendChild(chips);
    var any = false;
    papers.forEach(function (p) {
      var sum = S.get("study:" + p.id + ":quizsum", null);
      if (!sum || !sum.total) return;
      any = true;
      var row = bar(p.short, sum.mastered, sum.total);
      row.querySelector(".bt-meter-label").textContent = "";
      var a = el("a", null, p.short);
      a.href = p.href + "#s-boss";
      row.querySelector(".bt-meter-label").appendChild(a);
      if (sum.boss) row.appendChild(el("span", "bt-crown", "BOSS ✓"));
      host.appendChild(row);
    });
    if (!any) host.appendChild(el("p", "bt-note", "打開一篇論文、挑戰章節怪物後，這裡會列出每篇的研究熟練度。"));
    var e = list(S.get("study:expedition", [])).slice(0, 6);
    if (e.length) {
      var byId = {};
      papers.forEach(function (p) { byId[p.id] = p; });
      var ul = el("ul", "bt-log");
      e.forEach(function (x) {
        var p = byId[x.p], li = el("li", x.win ? "is-win" : "is-lose");
        li.appendChild(el("span", "bt-log-at", x.at.slice(5, 10).replace("-", "/")));
        var a = el("a", null, (p ? p.short + "・" : "") + x.n);
        a.href = (p ? p.href : "") + "#" + x.k;
        li.appendChild(a);
        li.appendChild(el("span", "bt-log-r", (x.win ? "勝" : "敗") + "　" + x.sc));
        ul.appendChild(li);
      });
      host.appendChild(ul);
    }
  }

  window.StudyBattle = { FACETS: FACETS, TIERS: TIERS, mount: mount, board: board, shelf: shelf, summary: summary, grant: grant, titles: titles };
})();
