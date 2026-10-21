// Shared behaviour for every paper page and the shelf.
// All per-reader state (level, notes, finished sections) lives in localStorage;
// every access is wrapped because storage can be missing or blocked.
(function () {
  "use strict";

  var store = {
    get: function (k, fallback) {
      try { var v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set: function (k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); return true; }
      catch (e) { return false; }
    }
  };
  window.StudyStore = store;

  var root = document.documentElement;
  var paperEl = document.querySelector("[data-paper]");
  var paper = paperEl ? paperEl.getAttribute("data-paper") : null;

  // ---------- explanation level (shared across papers) ----------
  var LEVEL_KEY = "study:level";
  function setLevel(level) {
    root.setAttribute("data-level", level);
    document.querySelectorAll("[data-level-btn]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-level-btn") === level));
    });
    store.set(LEVEL_KEY, level);
  }
  document.querySelectorAll("[data-level-btn]").forEach(function (b) {
    b.addEventListener("click", function () { setLevel(b.getAttribute("data-level-btn")); });
  });
  setLevel(store.get(LEVEL_KEY, "uni"));

  // ---------- appearance: style (study / maple) and colour mode (system / light / dark) ----------
  // The 楓葉冒險 skin is drawn with game art in assets/maple/ (scripts/setup_maple.py builds it).
  // It is offered only when that art loads, so the inlined single-file builds, which have no
  // images, show just the colour modes.
  var SKIN_KEY = "study:skin", MODE_KEY = "study:mode";
  // The pages link site.css?v=<stamp> (scripts/stamp_assets.py), and the files this script builds
  // URLs for carry the same stamp, so a browser holding an older copy fetches the new one.
  var cssLink = document.querySelector('link[href*="assets/site.css"]');
  var cssHref = cssLink ? cssLink.getAttribute("href") : "";
  var mapleBase = cssLink ? cssHref.replace(/site\.css(\?.*)?$/, "maple/") : null;
  var stamp = (cssHref.match(/[?&]v=(\w+)/) || [])[1];
  function mapleUrl(file) { return mapleBase + file + (stamp ? "?v=" + stamp : ""); }
  var mapleReady = false, mapleHooks = [];
  function whenMaple(fn) { if (mapleReady) fn(); else mapleHooks.push(fn); }
  var hostTheme = root.hasAttribute("data-host-theme") ? root.getAttribute("data-host-theme") : root.getAttribute("data-theme");
  var skinHooks = [];
  function applySkin(v) {
    if (v === "maple" && mapleReady) root.setAttribute("data-skin", "maple"); else root.removeAttribute("data-skin");
    skinHooks.forEach(function (fn) { fn(); });
  }
  function applyMode(v) {
    if (v === "light" || v === "dark") root.setAttribute("data-theme", v);
    else if (hostTheme) root.setAttribute("data-theme", hostTheme);
    else root.removeAttribute("data-theme");
  }
  var skin = store.get(SKIN_KEY, "study"), mode = store.get(MODE_KEY, "system");
  applyMode(mode);
  var openAppear = null, skinRow = null;
  var bar = document.querySelector(".toolbar-inner");
  if (bar) {
    var wrap = document.createElement("div");
    wrap.className = "appear";
    wrap.innerHTML =
      '<button type="button" class="appear-btn" aria-expanded="false" aria-controls="appear-panel">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/></svg><span class="t">外觀</span></button>' +
      '<div class="appear-panel" id="appear-panel" role="group" aria-label="外觀設定" hidden>' +
      '<div class="row row-skin" hidden><span>風格</span><div class="seg">' +
      '<button type="button" data-skin-btn="study">精讀室</button><button type="button" data-skin-btn="maple">楓葉冒險</button></div>' +
      '<p>「楓葉冒險」用楓之谷的遊戲美術，內容與原本相同。</p></div>' +
      '<div class="row"><span>色彩</span><div class="seg">' +
      '<button type="button" data-mode-btn="system">跟隨系統</button><button type="button" data-mode-btn="light">淺色</button><button type="button" data-mode-btn="dark">深色</button></div></div>' +
      '<p>設定只存在這個瀏覽器。</p></div>';
    bar.appendChild(wrap);
    var btn = wrap.querySelector(".appear-btn"), panel = wrap.querySelector(".appear-panel");
    skinRow = wrap.querySelector(".row-skin");
    var sync = function () {
      wrap.querySelectorAll("[data-skin-btn]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-skin-btn") === skin)); });
      wrap.querySelectorAll("[data-mode-btn]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-mode-btn") === mode)); });
    };
    openAppear = function (v) { panel.hidden = !v; btn.setAttribute("aria-expanded", String(v)); };
    btn.addEventListener("click", function () { openAppear(panel.hidden); });
    wrap.querySelectorAll("[data-skin-btn]").forEach(function (b) {
      b.addEventListener("click", function () { skin = b.getAttribute("data-skin-btn"); applySkin(skin); store.set(SKIN_KEY, skin); sync(); });
    });
    wrap.querySelectorAll("[data-mode-btn]").forEach(function (b) {
      b.addEventListener("click", function () { mode = b.getAttribute("data-mode-btn"); applyMode(mode); store.set(MODE_KEY, mode); sync(); });
    });
    document.addEventListener("click", function (e) { if (!panel.hidden && !wrap.contains(e.target)) openAppear(false); });
    panel.addEventListener("keydown", function (e) { if (e.key === "Escape") { openAppear(false); btn.focus(); } });
    btn.addEventListener("keydown", function (e) { if (e.key === "Escape") openAppear(false); });
    sync();
  }
  // The head snippet may already have switched to maple from storage; that stands only if the art is here.
  function setMapleReady(ok) {
    mapleReady = ok;
    applySkin(skin);
    if (skinRow) skinRow.hidden = !ok;
    if (!ok) return;
    // the sprite table comes with the art; the skin still works if it is missing
    var table = document.createElement("script");
    table.onload = table.onerror = function () { mapleHooks.splice(0).forEach(function (fn) { fn(); }); };
    table.src = mapleUrl("sprites.js");
    document.head.appendChild(table);
    // fetch the hover, pressed and opened states now, so a button never blinks empty on first use
    ["bt-menu-mouseOver", "bt-menu-pressed", "btnext-mouseOver", "btprev-normal", "btprev-mouseOver", "btclose-normal", "tab1", "list3"]
      .forEach(function (f) { new Image().src = mapleBase + f + ".png"; });
  }
  if (mapleBase) {
    var probe = new Image();
    probe.onload = function () { setMapleReady(true); };
    probe.onerror = function () { setMapleReady(false); };
    probe.src = mapleBase + "win9.png";
  } else {
    setMapleReady(false);
  }

  // ---------- status bar for the game skin: LV = sections finished, EXP = share of all sections ----------
  // Decorative: the same numbers are in the rail or tally, so it is hidden from assistive tech.
  function makeHud(job, name, notice) {
    var hud = document.createElement("div");
    hud.className = "hud";
    hud.setAttribute("aria-hidden", "true");
    hud.innerHTML = '<div class="hud-chat"><b>[公告]</b> <span></span></div><div class="hud-row">' +
      '<div class="hud-left"><span class="hud-lv"></span><span class="hud-name"><span></span><b></b></span></div>' +
      '<div class="hud-gp"><div class="hud-exp"><span class="hud-gray"></span><span class="hud-num"></span></div></div></div>';
    var chatTag = hud.querySelector(".hud-chat b"), chatText = hud.querySelector(".hud-chat span");
    chatText.textContent = notice;
    hud.querySelector(".hud-name span").textContent = job;
    hud.querySelector(".hud-name b").textContent = name;
    document.body.appendChild(hud);
    var last = [0, 0];
    function draw() {
      var n = last[0], total = last[1], pct = total ? n / total : 0;
      hud.querySelector(".hud-num").textContent = n + " / " + total + " [" + (pct * 100).toFixed(2) + "%]";
      // the bar's coloured interior starts 25px left of the box, under the "EXP." label
      hud.querySelector(".hud-gray").style.left = "calc(" + (pct * 100) + "% + " + (25 * pct - 25) + "px)";
      if (!mapleReady) return;
      var lv = hud.querySelector(".hud-lv");
      lv.textContent = "";
      String(n).split("").forEach(function (d) {
        var img = document.createElement("img");
        img.src = mapleUrl("lv" + d + ".png");
        img.alt = "";
        lv.appendChild(img);
      });
    }
    whenMaple(draw);
    var update = function (n, total) { last = [n, total]; draw(); };
    // the chat line takes turns through [tag, text] lines, a new one every few seconds
    var ticker = null;
    update.chat = function (lines) {
      clearInterval(ticker);
      var k = 0;
      function show() {
        var line = lines[k % lines.length];
        chatTag.textContent = "[" + line[0] + "]";
        chatText.textContent = line[1];
        k += 1;
      }
      if (!lines.length) return;
      show();
      if (lines.length > 1) ticker = setInterval(show, 7000);
    };
    return update;
  }
  // the first sentence of an element's text, for the chat line
  function firstSentence(el) {
    var t = el ? el.textContent.replace(/\s+/g, " ").trim() : "";
    var m = t.match(/^.*?[。！？]/);
    return m ? m[0] : t;
  }

  // ---------- game sprites: monsters on the quest windows, NPCs in the dialogs, a hero on the title ----------
  // assets/maple/sprites.js lists the strips (scripts/setup_maple.py builds them). A paper keeps its own
  // monsters and NPCs, picked from its id; the hero, the pet and the shelf's monsters change every visit.
  // All of it is decoration, hidden from assistive tech and from clicks.
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  function sprites(kind) {
    var t = window.MAPLE_SPRITES || {};
    return Object.keys(t).filter(function (k) { return t[k].kind === kind; });
  }
  function seedOf(str) { var h = 7; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; }
  function rotate(list, k) { k = list.length ? k % list.length : 0; return list.slice(k).concat(list.slice(0, k)); }
  function shuffle(list) { return list.map(function (x) { return [Math.random(), x]; }).sort(function (a, b) { return a[0] - b[0]; }).map(function (p) { return p[1]; }); }
  function setAct(el, name, act, once) {
    var acts = window.MAPLE_SPRITES[name].acts;
    if (!acts[act]) act = "stand";
    var c = acts[act];
    el.style.backgroundImage = 'url("' + mapleUrl("spr-" + name + "-" + act + ".png") + '")';
    el.style.setProperty("--w", c[0]);
    el.style.setProperty("--h", c[1]);
    el.style.setProperty("--n", c[2]);
    // restart the frame loop, so a one-off action (a monster going down) plays from its first frame
    el.classList.remove("spr-anim", "spr-once");
    void el.offsetWidth;
    if (c[2] > 1 && !reduceMotion) el.classList.add("spr-anim");
    if (once) el.classList.add("spr-once");
  }
  function spriteEl(name, act) {
    var el = document.createElement("span");
    el.className = "spr";
    setAct(el, name, act);
    return el;
  }
  // a sprite standing on top of a window; "walk" sends it back and forth along a short stretch
  var offscreen = window.IntersectionObserver ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { e.target.classList.toggle("is-off", !e.isIntersecting); });
  }, { rootMargin: "200px 0px" }) : null;
  function perch(host, names, where) {
    var wrap = document.createElement("span");
    wrap.className = "perch perch-" + where;
    wrap.setAttribute("aria-hidden", "true");
    var cast = names.map(function (name) {
      var walk = where === "walk" && !reduceMotion && window.MAPLE_SPRITES[name].acts.move;
      var walker = document.createElement("span");
      walker.className = walk ? "walker" : "stander";
      var spr = spriteEl(name, walk ? "move" : "stand");
      walker.appendChild(spr);
      wrap.appendChild(walker);
      if (walk) walker.style.setProperty("--d", Math.max(0, (where === "walk" && window.innerWidth < 600 ? 110 : 170) - spr.style.getPropertyValue("--w")) + "px");
      return { name: name, spr: spr, walker: walker };
    });
    host.appendChild(wrap);
    if (offscreen) offscreen.observe(wrap);
    return { wrap: wrap, cast: cast };
  }
  // finishing a section knocks its monster down: hit, the fall, then an EXP note where it stood
  function defeat(p) {
    var m = p.cast[0];
    if (reduceMotion) { p.wrap.hidden = true; return; }
    m.walker.classList.add("is-hit");
    setAct(m.spr, m.name, "hit");
    setTimeout(function () {
      setAct(m.spr, m.name, "die", true);
      p.wrap.classList.add("is-down");
      var pop = document.createElement("span");
      pop.className = "exp-pop";
      pop.textContent = "EXP +1";
      p.wrap.appendChild(pop);
      setTimeout(function () { p.wrap.hidden = true; pop.remove(); }, 1400);
    }, 260);
  }
  function respawn(p) {
    var m = p.cast[0];
    p.wrap.hidden = false;
    p.wrap.classList.remove("is-down");
    m.walker.classList.remove("is-hit");
    setAct(m.spr, m.name, m.walker.className === "walker" ? "move" : "stand");
  }

  // ---------- shelf: show progress for each paper, and the totals ----------
  var sumDone = 0, sumTotal = 0, started = 0;
  document.querySelectorAll("[data-progress-for]").forEach(function (el) {
    var id = el.getAttribute("data-progress-for");
    var total = Number(el.getAttribute("data-total")) || 0;
    var n = Math.min(store.get("study:" + id + ":done", []).length, total);
    sumDone += n; sumTotal += total; if (n) started += 1;
    if (!total) return;
    el.textContent = "";
    var meter = document.createElement("span");
    meter.className = "meter";
    meter.setAttribute("aria-hidden", "true");
    var fill = document.createElement("i");
    fill.style.width = (100 * n / total) + "%";
    meter.appendChild(fill);
    var txt = document.createElement("span");
    txt.className = "meter-text";
    txt.textContent = n === total ? "讀完 " + total + " 節" : "已讀 " + n + " / " + total + " 節";
    el.appendChild(meter);
    el.appendChild(txt);
  });
  var tallyDone = document.getElementById("tally-done");
  if (tallyDone) tallyDone.textContent = sumDone + " / " + sumTotal;
  var tallyStarted = document.getElementById("tally-started");
  if (tallyStarted) tallyStarted.textContent = String(started);
  if (tallyDone) {
    var shelfHud = makeHud("書架", "論文精讀室", "歡迎來到論文精讀室。");
    shelfHud(sumDone, sumTotal);
    // the chat line recommends the papers in turn
    var tips = [];
    document.querySelectorAll(".card").forEach(function (c) {
      var t = c.querySelector("h3"), d = c.querySelector("p");
      if (t) tips.push(["推薦", t.textContent.trim() + (d ? "：" + firstSentence(d) : "")]);
    });
    shelfHud.chat([["公告", "歡迎來到論文精讀室。點一篇論文開始任務。"]].concat(shuffle(tips)));
  }
  if (tallyDone) whenMaple(function () {
    if (!window.MAPLE_SPRITES) return;
    // a party on the shelf's title window, and a different monster on each group's banner
    var head = document.querySelector(".shelf-head");
    // the hero marked "lead" in the sprite list always heads it; two others join at random
    var heroes = sprites("hero"), lead = heroes.filter(function (k) { return window.MAPLE_SPRITES[k].lead; });
    var others = shuffle(heroes.filter(function (k) { return lead.indexOf(k) < 0; }));
    var party = lead.slice(0, 1).concat(others).slice(0, 3).concat(shuffle(sprites("pet")).slice(0, 1));
    if (head && party.length) perch(head, party, "party");
    var mobs = shuffle(sprites("mob"));
    document.querySelectorAll(".shelf-group > h2").forEach(function (h, i) {
      if (mobs.length) perch(h, [mobs[i % mobs.length]], "walk");
    });
  });

  if (!paper) return;

  // ---------- outline rail (collapsed on narrow screens so the text comes first) ----------
  var railDetails = document.querySelector(".rail details");
  if (railDetails && window.matchMedia && window.matchMedia("(max-width: 960px)").matches) railDetails.open = false;
  var sections = Array.prototype.slice.call(document.querySelectorAll("section.sec[id]"));
  var outline = document.getElementById("outline");
  var links = {};
  if (outline) {
    sections.forEach(function (s) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + s.id;
      var tick = document.createElement("span");
      tick.className = "tick";
      var label = document.createElement("span");
      label.textContent = s.getAttribute("data-short") || s.querySelector("h2").textContent;
      a.appendChild(tick);
      a.appendChild(label);
      li.appendChild(a);
      outline.appendChild(li);
      links[s.id] = { a: a, tick: tick };
    });
  }

  // ---------- finished sections ----------
  var DONE_KEY = "study:" + paper + ":done";
  var done = store.get(DONE_KEY, []);
  var countable = document.querySelectorAll("input[data-done]").length;
  var crumb = document.querySelector(".toolbar .crumb");
  var shortName = crumb ? crumb.textContent.split("·")[0].trim() : paper;
  var hud = makeHud("精讀中", shortName, "讀完一節就按「讀完這節」，EXP 會增加。");
  // the minimap's name band: site name over the paper's short name
  var railSummary = document.querySelector(".rail summary");
  if (railSummary) {
    var names = document.createElement("span");
    names.className = "mini-names";
    names.setAttribute("aria-hidden", "true");
    names.innerHTML = "<b>論文精讀室</b><span></span>";
    names.lastChild.textContent = shortName;
    railSummary.insertBefore(names, railSummary.firstChild);
  }
  // The cast for this paper, added once the art has loaded: a monster on each section that can be
  // finished (one elite midway, a boss on the last), NPCs taking turns in the self-check dialogs,
  // and the reader's hero and pet on the title window.
  var mobOf = {};
  whenMaple(function () {
    if (!window.MAPLE_SPRITES) return;
    var seed = seedOf(paper);
    var quests = sections.filter(function (s) { return s.querySelector("input[data-done]"); });
    var mobs = rotate(sprites("mob"), seed), elites = sprites("elite"), bosses = rotate(sprites("boss"), seed);
    quests.forEach(function (s, i) {
      var name = mobs[i % mobs.length], big = false;
      if (i === quests.length - 1 && bosses.length && quests.length > 1) { name = bosses[0]; big = true; }
      else if (i === Math.floor(quests.length / 2) && elites.length && quests.length > 3) { name = elites[seed % elites.length]; big = true; }
      if (!name) return;
      s.classList.toggle("has-big", big);
      var p = perch(s, [name], "walk");
      var box = s.querySelector("input[data-done]");
      mobOf[box.getAttribute("data-done")] = p;
      if (box.checked) p.wrap.hidden = true;
      box.addEventListener("change", function () {
        if (box.checked) {
          defeat(p);
          var foe = window.MAPLE_SPRITES[name].label || "怪物";
          hud.chat([["系統", "打倒了" + foe + "，EXP +1。按「下一節」繼續任務。"]].concat(pageLines(sections.indexOf(s))));
        }
        else respawn(p);
      });
    });
    var npcs = rotate(sprites("npc"), seed);
    document.querySelectorAll(".check details").forEach(function (d, i) {
      var name = npcs[i % npcs.length];
      if (!name) return;
      var npc = document.createElement("span");
      npc.className = "npc-portrait";
      npc.setAttribute("aria-hidden", "true");
      var fig = document.createElement("span");
      fig.className = "npc-fig";
      var spr = spriteEl(name, "stand");
      fig.appendChild(spr);
      var plate = document.createElement("span");
      plate.className = "npc-name";
      plate.textContent = window.MAPLE_SPRITES[name].role || "";
      npc.appendChild(fig);
      npc.appendChild(plate);
      // inside the summary, the one part of a closed <details> that is drawn; the summary is
      // position: static here, so the portrait still places itself against the dialog
      d.querySelector("summary").appendChild(npc);
      // the NPC talks while its answer is open
      // a quest mark over the NPC: a lightbulb before you ask, a book while the answer is open,
      // the finished book once the section is read
      var mark = null, box = d.closest("section.sec") && d.closest("section.sec").querySelector("input[data-done]");
      function markName() { return box && box.checked ? "quest-done" : d.open ? "quest-open" : "quest-new"; }
      if (window.MAPLE_SPRITES["quest-new"]) {
        mark = spriteEl(markName(), "stand");
        mark.classList.add("npc-quest");
        npc.appendChild(mark);
        if (box) box.addEventListener("change", function () { setAct(mark, markName(), "stand"); });
      }
      d.addEventListener("toggle", function () {
        setAct(spr, name, d.open ? "say" : "stand");
        if (mark) setAct(mark, markName(), "stand");
      });
    });
    var head = document.querySelector(".paper-head");
    var hero = shuffle(sprites("hero"))[0], pet = shuffle(sprites("pet"))[0];
    // every other paper is read in Ellinia instead of Henesys
    if (seed % 2) document.body.style.setProperty("--scene", 'url("' + mapleUrl("scene-ellinia.jpg") + '")');
    // a portal by 下一節 once the section is finished
    if (window.MAPLE_SPRITES.portal) {
      var portal = spriteEl("portal", "stand");
      portal.classList.add("pg-portal");
      portal.setAttribute("aria-hidden", "true");
      pager.appendChild(portal);
    }
    if (head && hero) perch(head, pet ? [hero, pet] : [hero], "party");
  });
  function renderProgress() {
    Object.keys(links).forEach(function (id) {
      links[id].tick.textContent = done.indexOf(id) >= 0 ? "✓" : "";
      links[id].a.classList.toggle("is-done", done.indexOf(id) >= 0);
    });
    var n = done.filter(function (id) { return document.querySelector('input[data-done="' + id + '"]'); }).length;
    var bar = document.getElementById("progress-bar");
    var txt = document.getElementById("progress-text");
    if (bar) bar.style.width = (countable ? (100 * n) / countable : 0) + "%";
    if (txt) txt.textContent = n + " / " + countable;
    hud(n, countable);
  }
  document.querySelectorAll("input[data-done]").forEach(function (box) {
    var id = box.getAttribute("data-done");
    box.checked = done.indexOf(id) >= 0;
    box.addEventListener("change", function () {
      done = done.filter(function (x) { return x !== id; });
      if (box.checked) done.push(id);
      store.set(DONE_KEY, done);
      renderProgress();
    });
  });
  renderProgress();

  // ---------- notes ----------
  function noteKey(id) { return "study:" + paper + ":note:" + id; }
  document.querySelectorAll("textarea[data-note]").forEach(function (ta) {
    var id = ta.getAttribute("data-note");
    var status = ta.parentNode.querySelector(".saved");
    ta.value = store.get(noteKey(id), "");
    var timer;
    ta.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var ok = store.set(noteKey(id), ta.value);
        if (status) status.textContent = ok ? "已存在這個瀏覽器" : "這個瀏覽器不允許儲存，請記得匯出";
      }, 400);
    });
  });

  // Export every note as Markdown so it can be pasted back into the repo or a chat.
  function collectNotes() {
    var title = (document.querySelector(".paper-head h1") || {}).textContent || paper;
    var out = ["# " + title.trim() + " 精讀筆記", ""];
    document.querySelectorAll("textarea[data-note]").forEach(function (ta) {
      if (!ta.value.trim()) return;
      var sec = ta.closest("section");
      var h = sec && sec.querySelector("h2") ? sec.querySelector("h2").textContent.trim() : ta.getAttribute("data-note");
      out.push("## " + h, "", ta.value.trim(), "");
    });
    return out.length > 2 ? out.join("\n") : "";
  }
  var exportBtn = document.getElementById("export-notes");
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      var md = collectNotes();
      var toast = document.getElementById("export-toast");
      var box = document.getElementById("export-box");
      if (!md) { toast.textContent = "還沒有任何筆記。"; return; }
      box.value = md;
      box.hidden = false;
      function fallback() { box.focus(); box.select(); toast.textContent = "已選取下方文字，請手動複製。"; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(md).then(function () { toast.textContent = "已複製 Markdown 筆記。"; }, fallback);
      } else { fallback(); }
    });
  }

  // ---------- highlight the section being read ----------
  if ("IntersectionObserver" in window && outline) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || !links[e.target.id]) return;
        Object.keys(links).forEach(function (id) { links[id].a.classList.toggle("active", id === e.target.id); });
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    sections.forEach(function (s) { io.observe(s); });
  }

  // ---------- one quest at a time (the game skin) ----------
  // In 楓葉冒險 a paper reads like a quest log: one section per page with BACK and NEXT at its foot,
  // and the minimap and in-page links turning to the page they point into. The other sections are
  // hidden="until-found", so find-in-page still reaches them and turns to their page. The original
  // style keeps the single long page.
  var head = document.querySelector(".paper-head");
  var column = document.querySelector(".column");
  var current = -1, paged = false;
  function pad(i) { return (i < 10 ? "0" : "") + i; }
  function titleOf(i) { var s = sections[i]; return s ? s.getAttribute("data-short") || s.querySelector("h2").textContent : ""; }
  // what the chat line says on a page: where you are, a key point (the 五歲 explanation's first
  // sentence), the self-check question, and a nudge
  function pageLines(i) {
    var s = sections[i];
    if (!s) return [];
    var lines = [["任務", "QUEST " + pad(i) + "　" + s.querySelector("h2").textContent.trim()]];
    var kid = s.querySelector(".lv-kid p"), claim = s.querySelector(".claim p");
    if (kid) lines.push(["重點", firstSentence(kid)]);
    else if (claim) lines.push(["重點", firstSentence(claim)]);
    var q = s.querySelector(".check summary");
    // the question only: the NPC's name plate also sits inside the summary
    if (q) lines.push(["提問", Array.prototype.filter.call(q.childNodes, function (n) { return !(n.classList && n.classList.contains("npc-portrait")); })
      .map(function (n) { return n.textContent; }).join("").trim()]);
    lines.push(["提示", s.querySelector("input[data-done]") ? "讀完按「讀完這節」打倒怪物，再按「下一節」。" : "按「下一節」繼續。"]);
    return lines;
  }
  var pager = document.createElement("nav");
  pager.className = "pager";
  pager.setAttribute("aria-label", "換節");
  pager.hidden = true;
  pager.innerHTML = '<button type="button" class="pg-prev"><b>上一節</b><small></small></button>' +
    '<span class="pg-at"></span><button type="button" class="pg-next"><b>下一節</b><small></small></button>';
  if (column) column.appendChild(pager);
  var prevBtn = pager.querySelector(".pg-prev"), nextBtn = pager.querySelector(".pg-next");
  function drawPager() {
    var i = current, last = sections.length - 1;
    prevBtn.disabled = i <= 0;
    nextBtn.disabled = i >= last;
    prevBtn.querySelector("small").textContent = i > 0 ? titleOf(i - 1) : "";
    nextBtn.querySelector("small").textContent = i < last ? titleOf(i + 1) : "已是最後一節";
    pager.querySelector(".pg-at").textContent = "QUEST " + pad(i) + " / " + pad(last);
    var box = sections[i] && sections[i].querySelector("input[data-done]");
    nextBtn.classList.toggle("is-ready", !box || box.checked);
  }
  function turnTo(i, scroll) {
    if (!paged || i < 0 || i >= sections.length) return;
    var changed = i !== current;
    current = i;
    sections.forEach(function (s, k) { if (k === i) s.removeAttribute("hidden"); else s.setAttribute("hidden", "until-found"); });
    if (head) { if (i === 0) head.removeAttribute("hidden"); else head.setAttribute("hidden", "until-found"); }
    drawPager();
    if (changed) hud.chat(pageLines(i));
    if (scroll) window.scrollTo(0, i === 0 ? 0 : Math.max(0, sections[i].getBoundingClientRect().top + window.pageYOffset - 170));
  }
  function go(i) {
    if (i < 0 || i >= sections.length) return;
    turnTo(i, true);
    if (history.pushState) history.pushState(null, "", "#" + sections[i].id);
  }
  prevBtn.addEventListener("click", function () { go(current - 1); });
  nextBtn.addEventListener("click", function () { go(current + 1); });
  document.querySelectorAll("input[data-done]").forEach(function (box) { box.addEventListener("change", drawPager); });
  // the page a link, the address bar or find-in-page points into
  function pageOf(el) { var s = el && el.closest ? el.closest("section.sec[id]") : null; return s ? sections.indexOf(s) : -1; }
  function fromHash() {
    var target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    var i = pageOf(target);
    if (i < 0) return false;
    if (i !== current) turnTo(i, false);
    target.scrollIntoView();
    return true;
  }
  window.addEventListener("hashchange", function () { if (paged) fromHash(); });
  window.addEventListener("popstate", function () { if (paged && !fromHash()) turnTo(0, true); });
  sections.forEach(function (s) {
    s.addEventListener("beforematch", function () { if (paged) turnTo(sections.indexOf(s), false); });
  });
  if (head) head.addEventListener("beforematch", function () { if (paged) turnTo(0, false); });
  function setPaged() {
    var on = root.getAttribute("data-skin") === "maple";
    if (on === paged) return;
    paged = on;
    if (column) column.classList.toggle("is-paged", on);
    pager.hidden = !on;
    if (!on) {
      sections.forEach(function (s) { s.removeAttribute("hidden"); });
      if (head) head.removeAttribute("hidden");
      current = -1;
      return;
    }
    // open where the address points, else pick up at the first unfinished section once reading has begun
    current = -1;
    if (fromHash()) return;
    var start = 0;
    if (done.length) {
      start = sections.findIndex(function (s) { var b = s.querySelector("input[data-done]"); return b && !b.checked; });
      if (start < 0) start = 0;
    }
    turnTo(start, false);
    if (start > 0) hud.chat([["系統", "從上次讀到的地方繼續：QUEST " + pad(start) + "　" + titleOf(start)]].concat(pageLines(start)));
  }
  skinHooks.push(setPaged);
  setPaged();
})();
