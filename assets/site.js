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
      try {
        localStorage.setItem(k, JSON.stringify(v));
        if (k.indexOf("study:") === 0) window.dispatchEvent(new CustomEvent("study-local-write", { detail: { key: k } }));
        return true;
      }
      catch (e) {
        if (k.indexOf("study:") === 0) {
          window.dispatchEvent(new CustomEvent("study-save-error", { detail: { key: k } }));
        }
        return false;
      }
    }
  };
  window.StudyStore = store;
  window.addEventListener("study-save-error", function () {
    var warning = document.getElementById("study-save-warning");
    if (!warning) {
      warning = document.createElement("div");
      warning.id = "study-save-warning";
      warning.setAttribute("role", "alert");
      document.body.appendChild(warning);
    }
    warning.textContent = "進度無法寫入此瀏覽器。請先匯出備份並檢查儲存空間；此頁新操作可能無法保留。";
  });
  // dates for the review schedule, as local YYYY-MM-DD strings, which sort as they read
  function ymd(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function today() { return ymd(new Date()); }
  function addDays(day, n) { var p = day.split("-"); return ymd(new Date(+p[0], p[1] - 1, +p[2] + n)); }

  var root = document.documentElement;
  var paperEl = document.querySelector("[data-paper]");
  var paper = paperEl ? paperEl.getAttribute("data-paper") : null;
  var mathQueue = Promise.resolve();
  window.StudyMathTypeset = function (node) {
    if (!node || !window.MathJax || !window.MathJax.typesetPromise) return mathQueue;
    mathQueue = mathQueue.catch(function () {}).then(function () { return window.MathJax.typesetPromise([node]); });
    return mathQueue.catch(function () {});
  };

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

  // Collapse the four explanation-depth buttons into one compact toolbar control.
  // Move the existing buttons so their data-level-btn handlers and storage behaviour survive.
  (function mountLevelPicker() {
    var levels = document.querySelector(".toolbar .levels");
    if (!levels || levels.querySelector(".level-picker")) return;
    var seg = levels.querySelector(".seg");
    if (!seg || seg.querySelectorAll("[data-level-btn]").length !== 4) return;
    var label = levels.querySelector(".levels-label");
    if (label) label.hidden = true;
    var wrap = document.createElement("div");
    wrap.className = "level-picker";
    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "level-trigger";
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-haspopup", "true");
    trigger.setAttribute("aria-controls", "level-picker-panel");
    trigger.innerHTML = '<span aria-hidden="true" class="level-glyph">▤</span>' +
      '<span class="level-current"></span><span aria-hidden="true" class="level-chevron">▾</span>';
    var panel = document.createElement("div");
    panel.className = "level-panel";
    panel.id = "level-picker-panel";
    panel.hidden = true;
    var title = document.createElement("strong");
    title.className = "level-panel-title";
    title.textContent = "選擇解釋深度";
    panel.appendChild(title);
    panel.appendChild(seg);
    wrap.appendChild(trigger);
    wrap.appendChild(panel);
    levels.appendChild(wrap);
    var names = {kid:"五歲", uni:"大學生", grad:"研究生", all:"對照"};
    function update() {
      var v = document.documentElement.getAttribute("data-level") || "uni";
      trigger.querySelector(".level-current").textContent = names[v] || "模式";
      trigger.setAttribute("aria-label", "解釋深度：" + (names[v] || v) + "，點擊切換");
    }
    function open(v) {
      panel.hidden = !v;
      trigger.setAttribute("aria-expanded", String(v));
      if (v) {
        var active = panel.querySelector('[aria-pressed="true"]');
        (active || panel.querySelector("[data-level-btn]")).focus();
      }
    }
    trigger.addEventListener("click", function () { open(panel.hidden); });
    trigger.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "Enter" && panel.hidden) {
        e.preventDefault(); open(true);
      }
    });
    seg.querySelectorAll("[data-level-btn]").forEach(function (button) {
      button.addEventListener("click", function () { update(); open(false); trigger.focus(); });
    });
    panel.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { open(false); trigger.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (!panel.hidden && !wrap.contains(e.target)) open(false);
    });
    window.addEventListener("storage", function (e) {
      if (e.key === LEVEL_KEY) update();
    });
    update();
  })();

  // ---------- appearance: style (study / maple) and colour mode (system / light / dark) ----------
  // The 楓葉冒險 skin is drawn with game art in assets/maple/ (scripts/setup_maple.py builds it).
  // It is the default, and it is offered only when that art loads, so the inlined single-file
  // builds, which have no images, show the original style and just the colour modes.
  var SKIN_KEY = "study:skin", MODE_KEY = "study:mode";
  // The pages link site.css?v=<stamp> (scripts/stamp_assets.py), and the files this script builds
  // URLs for carry the same stamp, so a browser holding an older copy fetches the new one.
  var cssLink = document.querySelector('link[href*="assets/site.css"]');
  var cssHref = cssLink ? cssLink.getAttribute("href") : "";
  var mapleBase = cssLink ? cssHref.replace(/site\.css(\?.*)?$/, "maple/") : null;
  var stamp = (cssHref.match(/[?&]v=(\w+)/) || [])[1];
  function mapleUrl(file) { return mapleBase + file + (stamp ? "?v=" + stamp : ""); }
  var mapleReady = false, mapleHooks = [];
  function whenMaple(fn) { if (skin === "maple" && mapleReady && tableDone) fn(); else mapleHooks.push(fn); }
  var hostTheme = root.hasAttribute("data-host-theme") ? root.getAttribute("data-host-theme") : root.getAttribute("data-theme");
  var skinHooks = [];
  var catalog = document.getElementById("paper-catalog");
  var catalogViews = { study: true, maple: false }, catalogView = null;
  var codex = document.getElementById("research-codex");
  var codexViews = { study: true, maple: false }, codexView = null;
  function applySkin(v) {
    if (v === "maple" && mapleReady) root.setAttribute("data-skin", "maple"); else root.removeAttribute("data-skin");
    var view = root.hasAttribute("data-skin") ? "maple" : "study";
    if (catalog && view !== catalogView) {
      if (catalogView) catalogViews[catalogView] = catalog.open;
      catalog.open = catalogViews[view];
      catalogView = view;
    }
    if (codex && view !== codexView) {
      if (codexView) codexViews[codexView] = codex.open;
      codex.open = codexViews[view];
      codexView = view;
    }
    skinHooks.forEach(function (fn) { fn(); });
  }
  function applyMode(v) {
    if (v === "light" || v === "dark") root.setAttribute("data-theme", v);
    else if (hostTheme) root.setAttribute("data-theme", hostTheme);
    else root.removeAttribute("data-theme");
  }
  var skin = store.get(SKIN_KEY, "maple"), mode = store.get(MODE_KEY, "system");
  var focusReading = store.get("study:focus-reading", false) === true;
  root.classList.toggle("focus-reading", focusReading && !!paper);
  applyMode(mode);
  var openAppear = null, skinRow = null;
  var bar = document.querySelector(".toolbar-inner");
  if (bar) {
    var wrap = document.createElement("div");
    wrap.className = "appear";
    wrap.innerHTML =
      '<button type="button" class="appear-btn" aria-label="外觀設定" aria-expanded="false" aria-controls="appear-panel">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/></svg><span class="t">外觀</span></button>' +
      '<div class="appear-panel" id="appear-panel" role="group" aria-label="外觀設定" hidden>' +
      '<div class="row row-skin" hidden><span>風格</span><div class="seg">' +
      '<button type="button" data-skin-btn="study">精讀室</button><button type="button" data-skin-btn="maple">楓葉冒險</button></div>' +
      '<p>「楓葉冒險」用楓之谷的遊戲美術，內容與原本相同。</p></div>' +
      '<div class="row"><span>色彩</span><div class="seg">' +
      '<button type="button" data-mode-btn="system">跟隨系統</button><button type="button" data-mode-btn="light">淺色</button><button type="button" data-mode-btn="dark">深色</button></div></div>' +
      '<div class="row row-focus"' + (paper ? '' : ' hidden') + '><span>閱讀</span><div class="seg"><button type="button" class="focus-reading-btn" aria-pressed="false">專注閱讀</button></div></div>' +
      '<div class="row row-hero" hidden><label for="hero-choice">角色造型</label><select id="hero-choice" class="hero-choice"></select></div>' +
      '<div class="row row-pet" hidden><label for="pet-choice">同行寵物</label><select id="pet-choice" class="pet-choice"></select></div>' +
      '<p>設定只存在這個瀏覽器。</p></div>';
    bar.appendChild(wrap);
    var btn = wrap.querySelector(".appear-btn"), panel = wrap.querySelector(".appear-panel");
    skinRow = wrap.querySelector(".row-skin");
    var sync = function () {
      wrap.querySelectorAll("[data-skin-btn]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-skin-btn") === skin)); });
      wrap.querySelectorAll("[data-mode-btn]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-mode-btn") === mode)); });
      var focusBtn = wrap.querySelector(".focus-reading-btn");
      if (focusBtn) focusBtn.setAttribute("aria-pressed", String(focusReading));
    };
    openAppear = function (v) { panel.hidden = !v; btn.setAttribute("aria-expanded", String(v)); };
    btn.addEventListener("click", function () { openAppear(panel.hidden); });
    wrap.querySelectorAll("[data-skin-btn]").forEach(function (b) {
      b.addEventListener("click", function () { skin = b.getAttribute("data-skin-btn"); if (skin === "maple") loadTable(); applySkin(skin); runMaple(); store.set(SKIN_KEY, skin); sync(); });
    });
    wrap.querySelectorAll("[data-mode-btn]").forEach(function (b) {
      b.addEventListener("click", function () { mode = b.getAttribute("data-mode-btn"); applyMode(mode); store.set(MODE_KEY, mode); sync(); });
    });
    var focusBtn = wrap.querySelector(".focus-reading-btn");
    focusBtn.addEventListener("click", function () {
      focusReading = !focusReading;
      root.classList.toggle("focus-reading", focusReading);
      store.set("study:focus-reading", focusReading);
      sync();
    });
    document.addEventListener("click", function (e) { if (!panel.hidden && !wrap.contains(e.target)) openAppear(false); });
    panel.addEventListener("keydown", function (e) { if (e.key === "Escape") { openAppear(false); btn.focus(); } });
    btn.addEventListener("keydown", function (e) { if (e.key === "Escape") openAppear(false); });
    sync();
  }
  // The head snippet may already have switched to maple from storage; that stands only if the art is here.
  // The sprite table comes with the art (the skin still works if it is missing). When the page opens
  // in maple it is fetched at once, alongside the probe, so the cast is not a round trip late.
  var table = null, tableDone = false;
  function loadTable() {
    if (table || !mapleBase) return;
    table = document.createElement("script");
    table.onload = table.onerror = function () { tableDone = true; runMaple(); };
    table.src = mapleUrl("sprites.js");
    document.head.appendChild(table);
  }
  function runMaple() { if (skin === "maple" && mapleReady && tableDone) mapleHooks.splice(0).forEach(function (fn) { fn(); }); }
  if (skin === "maple") loadTable();
  function setMapleReady(ok) {
    mapleReady = ok;
    applySkin(skin);
    if (skinRow) skinRow.hidden = !ok;
    if (!ok) return;
    if (skin === "maple") {
      loadTable();
      runMaple();
      // fetch the hover, pressed and opened states now, so a button never blinks empty on first use
      ["btnext-mouseOver", "btprev-normal", "btprev-mouseOver", "btclose-normal", "list3"]
        .forEach(function (f) { new Image().src = mapleBase + f + ".png"; });
    }
  }
  if (mapleBase) {
    var probe = new Image();
    probe.onload = function () { setMapleReady(true); };
    probe.onerror = function () { setMapleReady(false); };
    probe.src = mapleBase + "win9.png";
  } else {
    setMapleReady(false);
  }

  // ---------- experience: one reader across every paper ----------
  // EXP is worked out from what is stored (sections finished, answers opened, notes written, papers
  // opened), never added up click by click, so ticking a box on and off earns nothing and every
  // paper added later counts with no setup. Each paper page caches its own sum in study:<id>:exp;
  // the total is the sum of those. Levels start at 1 and never cap: the first section is LV.2,
  // a whole paper about LV.7, ten papers about LV.18, fifty about LV.34.
  var EXP = { visit: 50, section: 100, elite: 100, boss: 200, paper: 500, ask: 20, note: 30 };
  function needFor(lv) { return Math.round((45 * Math.pow(lv, 1.5) + 55) / 10) * 10; }
  function levelOf(exp) {
    var lv = 1, into = Math.max(0, exp);
    while (into >= needFor(lv)) { into -= needFor(lv); lv += 1; }
    return { lv: lv, into: into, need: needFor(lv), exp: exp };
  }
  // titles change at the levels the game's job advancements would
  var JOBS = [[1, "新手讀者"], [10, "見習研究員"], [20, "研究員"], [30, "資深研究員"], [50, "精讀大師"]];
  function jobOf(lv) { var t = JOBS[0][1]; JOBS.forEach(function (j) { if (lv >= j[0]) t = j[1]; }); return t; }
  // Research-job achievements are awarded for completing ALL readable quests in one paper.
  // Battle/BOSS titles (study:titles) remain a separate achievement system.
  var PROFILE_KEY = "study:profile";
  var PAPER_JOBS = [
    { id:"2501.13956", total:15, job:"時序行者" },
    { id:"2601.18642", total:15, job:"忘卻之羽" },
    { id:"2604.14362", total:16, job:"永恆之錨" },
    { id:"2605.06527", total:16, job:"破妄者" },
    { id:"2608.19652", total:17, job:"變界旅人" },
    { id:"2606.30306", total:16, job:"不眠守望" },
    { id:"dekleer-1986-atms", total:16, job:"真理之眼" }
  ];
  // Upgrade previously earned titles from pre-October 2026 profiles without losing achievements.
  var LEGACY_JOBS = {
    "時序織網師":"時序行者",
    "遺忘調律師":"忘卻之羽",
    "記憶錨定師":"永恆之錨",
    "過期記憶偵查員":"破妄者",
    "狀態追蹤師":"變界旅人",
    "常駐智能體守護者":"不眠守望",
    "真值維護師":"真理之眼"
  };
  function canonicalJob(value) {
    return typeof value === "string" ? (LEGACY_JOBS[value] || value) : "";
  }
  var NOVICE_JOB = "初心者";
  function validDisplayId(s) {
    return typeof s === "string" && /^[\p{L}\p{N}_-]{2,20}$/u.test(s);
  }
  function profileBase() {
    var x = store.get(PROFILE_KEY, {});
    x = x && typeof x === "object" && !Array.isArray(x) ? x : {};
    var names = PAPER_JOBS.map(function (p) { return p.job; });
    var unlocked = [];
    if (Array.isArray(x.unlockedJobs)) x.unlockedJobs.forEach(function (name) {
      var title = canonicalJob(name);
      if (names.indexOf(title) >= 0 && unlocked.indexOf(title) < 0) unlocked.push(title);
    });
    return {
      displayId: validDisplayId(x.displayId) ? x.displayId : "",
      activeJob: canonicalJob(x.activeJob) || NOVICE_JOB,
      unlockedJobs: unlocked
    };
  }
  function completedJob(p) {
    var done = store.get("study:" + p.id + ":done", []);
    if (!Array.isArray(done)) return false;
    var unique = new Set(done.filter(function (id) { return typeof id === "string" && id.length > 0; }));
    var toc = store.get("study:" + p.id + ":toc", null);
    // Use the recorded real section IDs whenever available; unrelated/duplicated IDs do not count.
    if (Array.isArray(toc) && toc.length === p.total &&
        toc.every(function (row) { return Array.isArray(row) && typeof row[0] === "string"; }))
      return toc.every(function (row) { return unique.has(row[0]); });
    return unique.size >= p.total; // Older progress may predate the saved table of contents.
  }
  function emitProfile(profile) {
    window.dispatchEvent(new CustomEvent("study-profile-change", { detail: profile }));
  }
  function refreshProfile() {
    var current = profileBase(), past = current.unlockedJobs.length;
    PAPER_JOBS.forEach(function (p) {
      if (completedJob(p) && current.unlockedJobs.indexOf(p.job) < 0) current.unlockedJobs.push(p.job);
    });
    if (current.unlockedJobs.indexOf(current.activeJob) < 0 && current.activeJob !== NOVICE_JOB)
      current.activeJob = current.unlockedJobs[0] || NOVICE_JOB;
    if (!past && current.unlockedJobs.length && current.activeJob === NOVICE_JOB)
      current.activeJob = current.unlockedJobs[0]; // first graduation equips its job automatically
    var saved = store.get(PROFILE_KEY, null);
    if (JSON.stringify(saved) !== JSON.stringify(current)) {
      if (store.set(PROFILE_KEY, current)) emitProfile(current);
    }
    return current;
  }
  function setProfileDisplayId(id) {
    if (id !== "" && !validDisplayId(id)) return false;
    var p = refreshProfile();
    if (p.displayId !== id) {
      p.displayId = id;
      store.set(PROFILE_KEY, p);
      emitProfile(p);
    }
    return true;
  }
  function equipResearchJob(job) {
    var p = refreshProfile();
    if (job !== NOVICE_JOB && p.unlockedJobs.indexOf(job) < 0) return false;
    if (p.activeJob !== job) {
      p.activeJob = job;
      store.set(PROFILE_KEY, p);
      emitProfile(p);
    }
    return true;
  }
  window.StudyProfile = {
    get: refreshProfile,
    setDisplayId: setProfileDisplayId,
    setActiveJob: equipResearchJob,
    jobs: PAPER_JOBS.slice()
  };
  window.addEventListener("storage", function (event) {
    if (event.key === PROFILE_KEY || event.key && /^study:[^:]+:done$/.test(event.key)) {
      refreshProfile();
      emitProfile(profileBase());
    }
  });
  // every paper's EXP but one: its cached sum, or for a paper read before EXP existed, its finished sections
  function storedExp(except) {
    var per = {};
    try {
      for (var k = 0; k < localStorage.length; k++) {
        var m = (localStorage.key(k) || "").match(/^study:([^:]+):(exp|done)$/);
        if (!m || m[1] === except) continue;
        per[m[1]] = per[m[1]] || {};
        per[m[1]][m[2]] = store.get(m[0], null);
      }
    } catch (e) { return 0; }
    return Object.keys(per).reduce(function (sum, id) {
      var p = per[id];
      return sum + (typeof p.exp === "number" ? p.exp : Array.isArray(p.done) ? p.done.length * EXP.section : 0);
    }, 0);
  }

  // ---------- status bar for the game skin: LV, the job title, EXP towards the next level ----------
  // Decorative: the same progress is in the rail or tally, so it is hidden from assistive tech.
  function makeHud(job, name, notice) {
    var hud = document.createElement("div");
    hud.className = "hud";
    // Character identity is meaningful; announce it while preserving the visual HUD.
    hud.innerHTML = '<div class="hud-chat"><b>[公告]</b> <span></span></div><div class="hud-row">' +
      '<div class="hud-left"><span class="hud-lv"></span><span class="hud-name"><b class="hud-player-name"></b><span class="hud-job"></span></span></div>' +
      '<div class="hud-gp"><div class="hud-exp"><span class="hud-gray"></span><span class="hud-num"></span></div></div></div>';
    var chatTag = hud.querySelector(".hud-chat b"), chatText = hud.querySelector(".hud-chat span");
    chatText.textContent = notice;
    function drawIdentity() {
      var p = refreshProfile();
      hud.querySelector(".hud-player-name").textContent = p.displayId || "未命名冒險者";
      hud.querySelector(".hud-job").textContent = p.activeJob || NOVICE_JOB;
      hud.setAttribute("aria-label", "冒險者 " + (p.displayId || "未命名冒險者") + "，職業 " + p.activeJob);
    }
    drawIdentity();
    window.addEventListener("study-profile-change", drawIdentity);
    document.body.appendChild(hud);
    var last = levelOf(0);
    function draw() {
      var lvNow = last.lv, pct = last.into / last.need;
      drawIdentity();
      hud.querySelector(".hud-num").textContent = last.into + " / " + last.need + " [" + (pct * 100).toFixed(2) + "%]";
      // the bar's coloured interior starts 25px left of the box, under the "EXP." label
      hud.querySelector(".hud-gray").style.left = "calc(" + (pct * 100) + "% + " + (25 * pct - 25) + "px)";
      if (!mapleReady) return;
      var lv = hud.querySelector(".hud-lv");
      lv.textContent = "";
      String(lvNow).split("").forEach(function (d) {
        var img = document.createElement("img");
        img.src = mapleUrl("lv" + d + ".png");
        img.alt = "";
        lv.appendChild(img);
      });
    }
    whenMaple(draw);
    var update = function (state) { last = state; draw(); };
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
  // assets/maple/sprites.js lists the strips. Each quest has a local guide, while
  // reading levels and self-check dialogs bring in a small, authored visiting cast.
  // All of it is decoration, hidden from assistive tech and from clicks.
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  function sprites(kind) {
    var t = window.MAPLE_SPRITES || {};
    return Object.keys(t).filter(function (k) { return t[k].kind === kind; });
  }
  var PAPER_CAST = {
    "2601.18642": { guide:"npc-hines", readers:{ kid:["hero-6","npc-bowman","npc-knight-oz","hero-4"], uni:["hero-1","npc-knight-irena","hero-7"], grad:["npc-hines","npc-strategist","npc-lucid","npc-dark-lord","npc-kyrin"] }, checks:["hero-2","npc-knight-mihile","hero-3","npc-knight-eckhart"], mobs:["mob-green-slime", "mob-spiked-mushroom"], boss:"boss-stumpy" },
    "2501.13956": { guide:"npc-marcel", readers:{ kid:["hero-2","hero-6","npc-knight-oz","npc-bowman"], uni:["hero-7","npc-strategist","hero-1"], grad:["npc-hines","npc-lucid","npc-dances-with-balrog","npc-knight-mihile","hero-3"] }, checks:["npc-knight-eckhart","hero-4","npc-knight-hawkeye","hero-5"], mobs:["mob-clockwork-panda", "mob-toy-duck", "mob-clockwork-fighter"], boss:"boss-papulatus" },
    "2604.14362": { guide:"npc-dances-with-balrog", readers:{ kid:["hero-3","npc-knight-mihile","hero-6","npc-bowman"], uni:["hero-5","npc-knight-eckhart","hero-7"], grad:["npc-dances-with-balrog","npc-strategist","npc-hines","hero-4","npc-kyrin"] }, checks:["hero-1","npc-knight-irena","hero-2","npc-knight-hawkeye"], mobs:["mob-fire-boar", "mob-dark-wooden-mask", "mob-stone-golem"], boss:"boss-stumpy" },
    "2605.06527": { guide:"npc-dark-lord", readers:{ kid:["hero-2","hero-5","npc-knight-eckhart","hero-6"], uni:["hero-7","npc-strategist","npc-kyrin"], grad:["npc-dark-lord","npc-hines","npc-lucid","npc-knight-irena","hero-4"] }, checks:["hero-1","npc-knight-hawkeye","hero-3","npc-knight-oz"], mobs:["mob-octopus", "mob-crocodile", "mob-little-ghost"], boss:"boss-king-slime" },
    "2608.19652": { guide:"npc-gas-mask", readers:{ kid:["hero-4","npc-knight-oz","hero-6","npc-bowman"], uni:["hero-1","hero-7","npc-knight-mihile"], grad:["npc-lucid","npc-strategist","npc-dark-lord","npc-kyrin","npc-knight-hawkeye"] }, checks:["hero-2","npc-knight-irena","hero-3","npc-knight-eckhart"], mobs:["mob-dream-cleaner", "mob-paper-bag-resident", "mob-calina", "mob-angry-ballgoer"], boss:"boss-lucid" },
    "2606.30306": { guide:"npc-kriel", readers:{ kid:["hero-6","npc-knight-irena","hero-4","npc-bowman"], uni:["hero-2","npc-knight-hawkeye","hero-7"], grad:["npc-strategist","npc-hines","npc-kyrin","npc-knight-mihile","hero-5"] }, checks:["hero-1","npc-knight-oz","hero-3","npc-knight-eckhart"], mobs:["mob-jr-cellion", "mob-jr-cellion-blue", "mob-young-yellow-cellion"], boss:"boss-eliza" },
    "dekleer-1986-atms": { guide:"npc-elder-stan", readers:{ kid:["npc-bowman","hero-4","hero-6","npc-knight-oz"], uni:["hero-1","npc-knight-irena","hero-7"], grad:["npc-elder-stan","npc-hines","npc-strategist","npc-kyrin","npc-dark-lord"] }, checks:["hero-2","npc-knight-mihile","hero-3","npc-knight-eckhart"], mobs:["mob-baby-snail", "mob-blue-mushroom", "mob-ribbon-pig"], boss:"boss-mushmom" }
  };
  function guideFor(role, index) {
    var all = window.MAPLE_SPRITES || {};
    var cast = PAPER_CAST[paper];
    var pool = cast && (role === "check" ? cast.checks : cast.readers[role]);
    var chosen = pool && pool.length ? pool[(index + seedOf(paper + ":" + role)) % pool.length] : null;
    if (chosen && all[chosen]) return chosen;
    return cast && all[cast.guide] ? cast.guide : null;
  }
  function addGuide(host, role, index) {
    if (!host || host.querySelector(":scope > .npc-portrait")) return;
    var name = guideFor(role, index);
    if (!name) return;
    var npc = document.createElement("span"); npc.className = "npc-portrait"; npc.setAttribute("aria-hidden", "true");
    var fig = document.createElement("span"); fig.className = "npc-fig"; fig.appendChild(spriteEl(name, "say"));
    var plate = document.createElement("span"); plate.className = "npc-name"; plate.textContent = window.MAPLE_SPRITES[name].label || window.MAPLE_SPRITES[name].role || "NPC";
    npc.appendChild(fig); npc.appendChild(plate); host.prepend(npc); warm(name, "stand"); warm(name, "say");
  }
  function seedOf(str) { var h = 7; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; }
  function rotate(list, k) { k = list.length ? k % list.length : 0; return list.slice(k).concat(list.slice(0, k)); }
  function shuffle(list) { return list.map(function (x) { return [Math.random(), x]; }).sort(function (a, b) { return a[0] - b[0]; }).map(function (p) { return p[1]; }); }
  // Frames are stepped by one shared timer rather than a CSS animation per sprite: a CSS loop makes
  // the browser recompute styles every display frame, this writes only when a frame changes (about
  // six times a second per sprite) and skips sprites out of view or in a hidden tab.
  var live = [], clock = null, TICK = 60;
  function tick() {
    if (document.hidden) return;
    live = live.filter(function (sp) {
      var el = sp.el;
      if (!el.isConnected) return false;
      if (el.closest(".is-off")) return true;
      sp.acc += TICK;
      if (sp.acc < sp.ms) return true;
      sp.acc = 0;
      sp.i += 1;
      if (sp.i >= sp.n) {
        if (sp.once) return false;
        sp.i = 0;
      }
      el.style.backgroundPosition = (-sp.w * sp.i) + "px 0";
      return true;
    });
    if (!live.length) { clearInterval(clock); clock = null; }
  }
  // show one action; "once" plays it through and holds the last frame, ms is the time per frame
  function setAct(el, name, act, once, ms) {
    var acts = window.MAPLE_SPRITES[name].acts;
    if (!acts[act]) act = "stand";
    var c = acts[act];
    el.style.backgroundImage = 'url("' + mapleUrl("spr-" + name + "-" + act + ".png") + '")';
    el.style.backgroundPosition = "0 0";
    el.style.setProperty("--w", c[0]);
    el.style.setProperty("--h", c[1]);
    live = live.filter(function (sp) { return sp.el !== el; });
    if (c[2] < 2 || reduceMotion) return;
    live.push({ el: el, w: c[0], n: c[2], i: 0, acc: 0, ms: ms || 170, once: !!once });
    if (!clock) clock = setInterval(tick, TICK);
  }
  // Strips are fetched and decoded before they are needed, and a sprite changes act only once the
  // new strip is decoded: the old frames stay up until then, so a switch never shows a blank.
  var strips = {};
  function fetchStrip(name, act) {
    var url = mapleUrl("spr-" + name + "-" + act + ".png");
    if (!strips[url]) {
      var img = new Image();
      img.src = url;
      strips[url] = { img: img, ready: (img.decode ? img.decode() : new Promise(function (ok) { img.onload = img.onerror = ok; })).catch(function () {}) };
    }
    return strips[url].ready;
  }
  function warm(name, act) {
    if (window.MAPLE_SPRITES && window.MAPLE_SPRITES[name] && window.MAPLE_SPRITES[name].acts[act]) fetchStrip(name, act);
  }
  // the last request wins, so a quick open-and-close never ends on the wrong act
  function swapAct(el, name, act, once, ms) {
    if (!window.MAPLE_SPRITES[name].acts[act]) act = "stand";
    var want = el.want = name + "/" + act;
    fetchStrip(name, act).then(function () { if (el.want === want) setAct(el, name, act, once, ms); });
  }
  function spriteEl(name, act) {
    var el = document.createElement("span");
    el.className = "spr";
    setAct(el, name, act);
    return el;
  }
  // a sprite standing on top of a window; "walk" sends it back and forth along a short stretch
  // Sprites out of view stop: their looping animations pause until they scroll back in.
  var offscreen = window.IntersectionObserver ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      e.target.classList.toggle("is-off", !e.isIntersecting);
      e.target.querySelectorAll(".walker").forEach(function (w) {
        if (w.patrol && w.patrol.playState !== "finished" && !w.classList.contains("is-hit")) {
          if (e.isIntersecting) w.patrol.play(); else w.patrol.pause();
        }
      });
    });
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
      // the patrol runs on the compositor: plain pixel values, no custom properties in the frames
      if (walk && walker.animate) {
        var routeWidth = window.innerWidth < 600 ? 110 : 170;
        var spriteWidth = Number(spr.style.getPropertyValue("--w"));
        // Wide monster frames otherwise protrude past the right edge on phones.
        if (spriteWidth > routeWidth) walker.style.left = (routeWidth - spriteWidth) + "px";
        var d = Math.max(0, routeWidth - spriteWidth) + "px";
        walker.patrol = walker.animate([
          { transform: "translateX(0) scaleX(-1)", offset: 0 }, { transform: "translateX(" + d + ") scaleX(-1)", offset: 0.46 },
          { transform: "translateX(" + d + ") scaleX(1)", offset: 0.5 }, { transform: "translateX(0) scaleX(1)", offset: 0.96 },
          { transform: "translateX(0) scaleX(-1)", offset: 1 }
        ], { duration: 18000, iterations: Infinity });
      }
      return { name: name, spr: spr, walker: walker };
    });
    host.appendChild(wrap);
    if (offscreen) offscreen.observe(wrap);
    return { wrap: wrap, cast: cast };
  }
  // finishing a section knocks its monster down: hit, the fall, then an EXP note where it stood
  function defeat(p, gain) {
    var m = p.cast[0];
    if (reduceMotion) { p.wrap.hidden = true; return; }
    m.walker.classList.add("is-hit");
    if (m.walker.patrol) m.walker.patrol.pause();
    swapAct(m.spr, m.name, "hit");
    // a critical hit's number over the monster, in the game's own digits
    if (window.MAPLE_SPRITES["fx-digits"]) {
      var dmg = document.createElement("span"), cell = window.MAPLE_SPRITES["fx-digits"].acts.stand;
      dmg.className = "fx-damage";
      String(1000 + Math.floor(Math.random() * 9000)).split("").forEach(function (d) {
        var g = document.createElement("span");
        g.className = "spr";
        g.style.backgroundImage = 'url("' + mapleUrl("spr-fx-digits-stand.png") + '")';
        g.style.setProperty("--w", cell[0]);
        g.style.setProperty("--h", cell[1]);
        g.style.backgroundPosition = (-cell[0] * Number(d)) + "px 0";
        dmg.appendChild(g);
      });
      // placed in the perch rather than on the walker, whose mirroring would flip the digits
      var wr = p.wrap.getBoundingClientRect(), mr = m.spr.getBoundingClientRect();
      dmg.style.left = (mr.left + mr.width / 2 - wr.left) + "px";
      p.wrap.appendChild(dmg);
    }
    setTimeout(function () {
      swapAct(m.spr, m.name, "die", true, 140);
      p.wrap.classList.add("is-down");
      var pop = document.createElement("span");
      pop.className = "exp-pop";
      pop.textContent = gain > 0 ? "EXP +" + gain : "EXP";
      p.wrap.appendChild(pop);
      p.timer = setTimeout(function () { p.wrap.hidden = true; pop.remove(); }, 1400);
    }, 260);
  }
  function respawn(p) {
    var m = p.cast[0];
    clearTimeout(p.timer);
    p.wrap.querySelectorAll(".fx-damage, .exp-pop").forEach(function (e) { e.remove(); });
    p.wrap.hidden = false;
    p.wrap.classList.remove("is-down");
    m.walker.classList.remove("is-hit");
    if (m.walker.patrol) m.walker.patrol.play();
    swapAct(m.spr, m.name, m.walker.className === "walker" ? "move" : "stand");
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
    var me = levelOf(storedExp(null));
    shelfHud(me);
    // the chat line recommends the papers in turn
    var tips = [];
    document.querySelectorAll(".card").forEach(function (c) {
      var t = c.querySelector("h3"), d = c.querySelector("p");
      if (t) tips.push(["推薦", t.textContent.trim() + (d ? "：" + firstSentence(d) : "")]);
    });
    shelfHud.chat([["公告", "歡迎來到論文精讀室。點一篇論文開始任務。"],
      ["角色", "LV." + me.lv + " " + jobOf(me.lv) + "　累積經驗值 " + me.exp + "，再 " + (me.need - me.into) + " 升級"]].concat(shuffle(tips)));
  }
  if (tallyDone) whenMaple(function () {
    if (!window.MAPLE_SPRITES) return;
    // a party on the shelf's title window, and a different monster on each group's banner
    var head = document.querySelector(".shelf-head");
    // 殺人鯨 and 露希妲 (in an outfit picked at random) head it, and one other hero joins
    var heroes = sprites("hero");
    function one(family) { return shuffle(heroes.filter(function (k) { return window.MAPLE_SPRITES[k].family === family; }))[0]; }
    var others = shuffle(heroes.filter(function (k) { return !window.MAPLE_SPRITES[k].family; }));
    var party = [one("orca"), one("lucid"), others[0]].filter(Boolean).concat(shuffle(sprites("pet")).slice(0, 1));
    if (head && party.length) perch(head, party, "party");
    var mobs = shuffle(sprites("mob"));
    document.querySelectorAll(".shelf-group > h2").forEach(function (h, i) {
      if (mobs.length) perch(h, [mobs[i % mobs.length]], "walk");
    });
  });

  // ---------- shelf: sections due for review, on each card and in one list ----------
  var GRASP_NAMES = { got: "理解", part: "部分理解", review: "需要複習" };
  function asObj(v) { return v && typeof v === "object" && !Array.isArray(v) ? v : {}; }
  var shelf = Array.prototype.slice.call(document.querySelectorAll("[data-progress-for]")).map(function (el) {
    var card = el.closest(".card"), h = card && card.querySelector("h3");
    var title = h ? h.textContent.trim() : el.getAttribute("data-progress-for");
    return { id: el.getAttribute("data-progress-for"), el: el, total: Number(el.getAttribute("data-total")) || 0,
      href: card ? card.getAttribute("href") : "", title: title, short: title.split("：")[0] };
  });
  var reviewList = document.getElementById("review-list"), due = [];
  shelf.forEach(function (c) {
    var g = asObj(store.get("study:" + c.id + ":grasp", {}));
    var mine = Object.keys(g).filter(function (sec) { return g[sec] && g[sec].due <= today(); });
    mine.forEach(function (sec) { due.push({ c: c, sec: sec, rec: g[sec] }); });
    if (!mine.length) return;
    var tag = document.createElement("span");
    tag.className = "due-tag";
    tag.textContent = mine.length + " 節該複習";
    c.el.appendChild(tag);
  });
  if (reviewList && due.length) {
    due.sort(function (a, b) { return a.rec.due < b.rec.due ? -1 : a.rec.due > b.rec.due ? 1 : 0; });
    due.forEach(function (d) {
      var li = document.createElement("li"), a = document.createElement("a"), info = document.createElement("span");
      a.href = d.c.href + "#" + d.sec;
      a.textContent = d.c.short + "：" + (d.rec.t || d.sec);
      info.textContent = "上次標「" + (GRASP_NAMES[d.rec.g] || d.rec.g) + "」，" + d.rec.due + " 到期";
      li.appendChild(a);
      li.appendChild(info);
      reviewList.appendChild(li);
    });
    document.getElementById("review-box").hidden = false;
  }

  // ---------- shelf: titles, each paper's research mastery, the latest battles (assets/battle.js) ----------
  var expedition = document.getElementById("expedition-body");
  if (expedition && window.StudyBattle) window.StudyBattle.shelf(expedition, shelf.map(function (c) { return { id: c.id, short: c.short, href: c.href }; }));

  // ---------- shelf: backup, export and restore ----------
  // Everything the site keeps is under "study:" in localStorage. The backup is those entries as
  // stored (JSON text), so a restore writes back exactly what was saved. Restoring never deletes an
  // entry the backup does not have; it snapshots what is here first, so one restore can be undone;
  // and replacing a note that differs needs its own confirmation.
  var BACKUP_FORMAT = "paper-study-backup", BACKUP_VERSION = 1, UNDO_KEY = "study-undo:before-restore";
  var bkMsg = document.getElementById("bk-msg"), bkPanel = document.getElementById("bk-panel"), bkUndo = document.getElementById("bk-undo");
  function siteEntries() {
    var out = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf("study:") === 0) out[k] = localStorage.getItem(k);
      }
    } catch (e) { return null; }
    return out;
  }
  function parsed(raw, fallback) { try { return raw === null || raw === undefined ? fallback : JSON.parse(raw); } catch (e) { return fallback; } }
  function download(name, text, type) {
    var url = URL.createObjectURL(new Blob([text], { type: type }));
    var a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function say(t) { if (bkMsg) bkMsg.textContent = t; }
  function backupText() {
    var data = siteEntries();
    if (!data) return null;
    return JSON.stringify({ format: BACKUP_FORMAT, version: BACKUP_VERSION, site: "論文精讀室", exported: new Date().toISOString(), data: data }, null, 1);
  }
  function backupNow(prefix) {
    var t = backupText();
    if (!t) { say("這個瀏覽器不允許讀取儲存空間，無法備份。"); return false; }
    download((prefix || "論文精讀室-備份-") + today() + ".json", t, "application/json");
    return true;
  }
  function isNoteKey(k) { return /:note(:|$)/.test(k); }
  function summarise(data) {
    var notes = 0, read = 0, marks = 0, answers = 0;
    Object.keys(data).forEach(function (k) {
      var v = parsed(data[k], null);
      if (isNoteKey(k) && String(v || "").trim()) notes++;
      else if (/:done$/.test(k) && Array.isArray(v)) read += v.length;
      else if (/:grasp$/.test(k)) marks += Object.keys(asObj(v)).length;
      else if (/:try$/.test(k)) answers += Object.keys(asObj(v)).length;
    });
    return "筆記 " + notes + " 則、已讀 " + read + " 節、理解標記 " + marks + " 個、作答 " + answers + " 題";
  }
  function markdownExport() {
    var data = siteEntries();
    if (!data) return null;
    function get(k, f) { return parsed(data[k], f); }
    var out = ["# 論文精讀室：筆記與進度", "", "匯出日期：" + today(), ""];
    shelf.forEach(function (c) {
      var done = get("study:" + c.id + ":done", []), g = asObj(get("study:" + c.id + ":grasp", {})), tr = asObj(get("study:" + c.id + ":try", {}));
      var toc = get("study:" + c.id + ":toc", null) || [];
      var noteIds = Object.keys(data).filter(function (k) { return k.indexOf("study:" + c.id + ":note:") === 0 && String(get(k, "")).trim(); })
        .map(function (k) { return k.slice(("study:" + c.id + ":note:").length); });
      if (!done.length && !Object.keys(g).length && !Object.keys(tr).length && !noteIds.length) return;
      var counts = { got: 0, part: 0, review: 0 }, dueN = 0;
      Object.keys(g).forEach(function (s) { if (counts[g[s].g] !== undefined) counts[g[s].g]++; if (g[s].due <= today()) dueN++; });
      out.push("## " + c.title, "", "- 已讀 " + Math.min(done.length, c.total) + " / " + c.total + " 節",
        "- 理解 " + counts.got + "、部分理解 " + counts.part + "、需要複習 " + counts.review + "（已到期 " + dueN + "）", "");
      var names = {}, order = [];
      toc.forEach(function (p) { names[p[0]] = p[1]; order.push(p[0]); });
      noteIds.concat(Object.keys(g)).forEach(function (s) { if (order.indexOf(s) < 0) order.push(s); });
      order.forEach(function (s) {
        var note = noteIds.indexOf(s) >= 0 ? String(get("study:" + c.id + ":note:" + s, "")).trim() : "";
        if (!note && !g[s]) return;
        out.push("### " + (names[s] || (g[s] && g[s].t) || s), "");
        if (g[s]) out.push("理解程度：" + (GRASP_NAMES[g[s].g] || g[s].g) + "（" + g[s].at + " 標記，" + g[s].due + " 複習）", "");
        if (note) out.push(note, "");
      });
      var keys = Object.keys(tr).sort(function (a, b) { return a - b; });
      if (keys.length) {
        out.push("### 自我檢測：我的作答", "");
        keys.forEach(function (k) { out.push("- **" + (tr[k].q || "第 " + (+k + 1) + " 題") + "**", "  " + String(tr[k].a || "").trim().replace(/\n/g, "\n  ")); });
        out.push("");
      }
    });
    var bench = String(get("study:bench:note", "")).trim();
    if (bench) out.push("## 研究工作台筆記", "", bench, "");
    return out.length > 4 ? out.join("\n") : "";
  }
  // a backup file must say what it is, a version this page knows, and hold only the site's own entries
  function validate(text) {
    var obj;
    try { obj = JSON.parse(text); } catch (e) { return { error: "這不是 JSON 檔，或檔案已損壞。" }; }
    if (!obj || obj.format !== BACKUP_FORMAT) return { error: "這不是論文精讀室的備份檔。" };
    if (typeof obj.version !== "number" || obj.version < 1 || Math.floor(obj.version) !== obj.version) return { error: "備份檔的版本欄位不正確。" };
    if (obj.version > BACKUP_VERSION) return { error: "這份備份來自較新版的網站（格式第 " + obj.version + " 版），這一頁只看得懂第 " + BACKUP_VERSION + " 版。請先重新整理頁面再試。" };
    var data = obj.data;
    if (!data || typeof data !== "object" || Array.isArray(data)) return { error: "備份檔裡沒有資料。" };
    var keys = Object.keys(data);
    if (!keys.length) return { error: "這份備份是空的。" };
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i], v = data[k];
      if (k.indexOf("study:") !== 0) return { error: "備份裡有不屬於本站的項目（" + k.slice(0, 40) + "），為安全起見不匯入。" };
      if (typeof v !== "string") return { error: "項目 " + k + " 的格式不正確。" };
      try { JSON.parse(v); } catch (e) { return { error: "項目 " + k + " 的內容損壞。" }; }
    }
    return { data: data, exported: obj.exported };
  }
  // Merge keeps what is here and adds what is missing: read sections and opened answers are
  // unioned, EXP takes the larger, a section's understanding mark the newer, notes and answers
  // stay as they are here unless empty. Replace takes the backup's version of each entry it has.
  function merged(k, mine, theirs) {
    if (mine === null) return theirs;
    var a = parsed(mine, null), b = parsed(theirs, null);
    if (/:last$/.test(k) && a && b && Number.isFinite(a.at) && Number.isFinite(b.at))
      return a.at >= b.at ? mine : theirs;
    if (k === "study:titles" && Array.isArray(a) && Array.isArray(b)) {
      var titles = a.slice();
      b.forEach(function (item) { if (item && !titles.some(function (x) { return x && x.t === item.t && x.p === item.p; })) titles.push(item); });
      return JSON.stringify(titles);
    }
    if (k === "study:expedition" && Array.isArray(a) && Array.isArray(b)) {
      var logs = a.slice();
      b.forEach(function (item) { if (!logs.some(function (x) { return JSON.stringify(x) === JSON.stringify(item); })) logs.push(item); });
      return JSON.stringify(logs.sort(function (x, y) { return String(y.at || "").localeCompare(String(x.at || "")); }).slice(0, 120));
    }
    if (/:note-awards$/.test(k) && Array.isArray(a) && Array.isArray(b))
      return JSON.stringify(a.concat(b.filter(function (x) { return a.indexOf(x) < 0; })));
    if (/:qstat$/.test(k) && a && b && typeof a === "object" && typeof b === "object") {
      var stats = Object.assign({}, a);
      Object.keys(b).forEach(function (id) {
        if (!Array.isArray(stats[id])) { stats[id] = b[id]; return; }
        if (!Array.isArray(b[id]) || b[id].length !== stats[id].length) return;
        stats[id] = stats[id].map(function (n, i) {
          return i === 2 && n !== b[id][i] ? 0 : Math.max(Number(n) || 0, Number(b[id][i]) || 0);
        });
      });
      return JSON.stringify(stats);
    }
    if (/:battle$/.test(k) && a && b && typeof a === "object" && typeof b === "object") {
      var battles = Object.assign({}, a);
      Object.keys(b).forEach(function (id) {
        if (!battles[id]) { battles[id] = b[id]; return; }
        var x = battles[id], y = b[id];
        battles[id] = { w:Math.max(x.w || 0, y.w || 0), l:Math.max(x.l || 0, y.l || 0),
          best:Math.max(x.best || 0, y.best || 0), n:Math.max(x.n || 0, y.n || 0),
          at:String(x.at || "") > String(y.at || "") ? x.at : y.at };
      });
      return JSON.stringify(battles);
    }
    if (k === "study:profile" && a && b && typeof a === "object" && typeof b === "object") {
      var jobs = Array.isArray(a.unlockedJobs) ? a.unlockedJobs.slice() : [];
      (Array.isArray(b.unlockedJobs) ? b.unlockedJobs : []).forEach(function (job) { if (jobs.indexOf(job) < 0) jobs.push(job); });
      return JSON.stringify({ displayId:a.displayId || b.displayId || "", activeJob:a.activeJob || b.activeJob || "初心者", unlockedJobs:jobs });
    }
    if (/^study:quest:(?:fademem-v[12]|[a-z0-9.-]+:v1)$/.test(k) && a && b &&
        a.version === b.version && a.version === (k === 'study:quest:fademem-v2' ? 2 : 1)) {
      var ids = Array.isArray(a.required) ? a.required.slice() : [];
      (Array.isArray(b.required) ? b.required : []).forEach(function (id) { if (ids.indexOf(id) < 0) ids.push(id); });
      var quest = { version:a.version, accepted:!!(a.accepted || b.accepted),
        reported:!!(a.reported || b.reported),
        acceptedAt:[a.acceptedAt,b.acceptedAt].filter(Boolean).sort()[0] || "",
        reportedAt:[a.reportedAt,b.reportedAt].filter(Boolean).sort().pop() || "" };
      if (k === 'study:quest:fademem-v1') { quest.required = ids; quest.total = ids.length; }
      return JSON.stringify(quest);
    }
    if (/:(done|asked)$/.test(k) && Array.isArray(a) && Array.isArray(b))
      return JSON.stringify(a.concat(b.filter(function (x) { return a.indexOf(x) < 0; })));
    if (/:exp$/.test(k) && typeof a === "number" && typeof b === "number") return JSON.stringify(Math.max(a, b));
    if (/:completedAt$/.test(k) && typeof a === "string" && typeof b === "string" &&
        !isNaN(Date.parse(a)) && !isNaN(Date.parse(b))) return JSON.stringify(a < b ? a : b);
    if (/:grasp$/.test(k)) {
      var g = asObj(a), h = asObj(b);
      Object.keys(h).forEach(function (s) { if (!g[s] || (h[s] && h[s].at > g[s].at)) g[s] = h[s]; });
      return JSON.stringify(g);
    }
    if (/:try$/.test(k)) {
      var t = asObj(a), u = asObj(b);
      Object.keys(u).forEach(function (q) { if (!t[q] || !String(t[q].a || "").trim()) t[q] = u[q]; });
      return JSON.stringify(t);
    }
    if (isNoteKey(k)) return String(a || "").trim() ? mine : theirs;
    return mine;
  }
  // notes and answers that are here, not empty, and different in the backup: what a replace would lose
  function conflicts(data) {
    var here = siteEntries() || {}, n = 0;
    Object.keys(data).forEach(function (k) {
      if (!(k in here)) return;
      var a = parsed(here[k], null), b = parsed(data[k], null);
      if (isNoteKey(k)) { if (String(a || "").trim() && String(a) !== String(b)) n++; }
      else if (/:try$/.test(k)) {
        var t = asObj(a), u = asObj(b);
        Object.keys(t).forEach(function (q) { if (String(t[q] && t[q].a || "").trim() && (!u[q] || u[q].a !== t[q].a)) n++; });
      }
    });
    return n;
  }
  function showUndo() { if (bkUndo) bkUndo.hidden = store.get(UNDO_KEY, null) === null; }
  function restore(data, replace) {
    var before = siteEntries();
    if (!before) { say("這個瀏覽器不允許讀取儲存空間，無法還原。"); return; }
    // the snapshot goes in first; without it there is no restore
    if (!store.set(UNDO_KEY, { at: new Date().toISOString(), data: before })) {
      say("儲存空間不足，無法先保存目前的資料，所以沒有還原。請先下載目前的備份，清出空間後再試。");
      return;
    }
    var n = 0;
    try {
      Object.keys(data).forEach(function (k) {
        var v = replace ? data[k] : merged(k, k in before ? before[k] : null, data[k]);
        if (v !== before[k]) { localStorage.setItem(k, v); n++; }
      });
    } catch (e) {
      Object.keys(data).forEach(function (k) { if (!(k in before)) try { localStorage.removeItem(k); } catch (x) {} });
      Object.keys(before).forEach(function (k) { try { localStorage.setItem(k, before[k]); } catch (x) {} });
      say("寫入時儲存空間不足，已嘗試放回原本的資料。若儲存空間仍不可用，請用還原前快照或下載的備份核對。");
      return;
    }
    say("已還原，更新了 " + n + " 個項目。重新整理頁面後就會看到。若結果不對，可以按「復原到上次還原之前」。");
    if (bkPanel) { bkPanel.hidden = true; bkPanel.textContent = ""; }
    showUndo();
  }
  function askRestore(file) {
    if (file.size > 5 * 1024 * 1024) { say("檔案太大（超過 5 MB），不像是本站的備份。"); return; }
    var reader = new FileReader();
    reader.onload = function () {
      var v = validate(String(reader.result));
      if (v.error) { say(v.error); return; }
      var clash = conflicts(v.data);
      bkPanel.textContent = "";
      var head = document.createElement("p");
      head.textContent = "備份時間：" + (v.exported ? String(v.exported).slice(0, 16).replace("T", " ") : "未記錄") + "。內容：" + summarise(v.data) + "。";
      var here = document.createElement("p");
      here.textContent = "這個瀏覽器目前有：" + summarise(siteEntries() || {}) + "。" +
        (clash ? "其中 " + clash + " 則筆記或作答和備份裡的版本不同。" : "沒有和備份衝突的筆記或作答。");
      var form = document.createElement("div");
      form.className = "bk-choices";
      form.innerHTML =
        '<label><input type="radio" name="bk-mode" value="merge" checked> <b>合併（建議）</b>：本機已有的筆記與作答不動，只補上本機沒有的；已讀節數取聯集，理解標記取較新的。</label>' +
        '<label><input type="radio" name="bk-mode" value="replace"> <b>以備份為準</b>：備份裡有的項目一律換成備份的版本；備份裡沒有的本機項目保留。</label>' +
        '<label class="bk-confirm" hidden><input type="checkbox"> 我了解這會用備份覆蓋本機 ' + clash + ' 則不同的筆記或作答。</label>';
      var row = document.createElement("div");
      row.className = "btn-row";
      var safe = document.createElement("button");
      safe.type = "button"; safe.className = "btn"; safe.textContent = "先下載目前的備份";
      var go = document.createElement("button");
      go.type = "button"; go.className = "btn"; go.textContent = "還原";
      var cancel = document.createElement("button");
      cancel.type = "button"; cancel.className = "btn"; cancel.textContent = "取消";
      row.appendChild(safe); row.appendChild(go); row.appendChild(cancel);
      var confirmBox = form.querySelector(".bk-confirm"), tick = confirmBox.querySelector("input");
      function mode() { return form.querySelector("input[name=bk-mode]:checked").value; }
      function gate() {
        confirmBox.hidden = !(mode() === "replace" && clash > 0);
        go.disabled = mode() === "replace" && clash > 0 && !tick.checked;
      }
      form.addEventListener("change", gate);
      safe.addEventListener("click", function () { if (backupNow("論文精讀室-還原前-")) say("已下載目前的備份。"); });
      go.addEventListener("click", function () { gate(); if (!go.disabled) restore(v.data, mode() === "replace"); });
      cancel.addEventListener("click", function () { bkPanel.hidden = true; bkPanel.textContent = ""; say("已取消，沒有改動任何資料。"); });
      bkPanel.appendChild(head); bkPanel.appendChild(here); bkPanel.appendChild(form); bkPanel.appendChild(row);
      gate();
      bkPanel.hidden = false;
      say("");
    };
    reader.onerror = function () { say("讀不到這個檔案。"); };
    reader.readAsText(file);
  }
  if (document.getElementById("backup")) {
    document.getElementById("bk-json").addEventListener("click", function () { if (backupNow()) say("已下載完整備份。"); });
    document.getElementById("bk-md").addEventListener("click", function () {
      var md = markdownExport();
      if (md === null) say("這個瀏覽器不允許讀取儲存空間。");
      else if (!md) say("還沒有筆記、進度或理解標記可以匯出。");
      else { download("論文精讀室-筆記與進度-" + today() + ".md", md, "text/markdown"); say("已匯出 Markdown。"); }
    });
    var picker = document.getElementById("bk-file");
    picker.addEventListener("change", function () { if (picker.files[0]) askRestore(picker.files[0]); picker.value = ""; });
    bkUndo.addEventListener("click", function () {
      var snap = store.get(UNDO_KEY, null);
      if (!snap || !snap.data) return;
      if (!window.confirm("把資料放回 " + String(snap.at).slice(0, 16).replace("T", " ") + " 還原之前的樣子？這之後的改動會被取代。")) return;
      try {
        var now = siteEntries() || {};
        // entries the restore added are removed, the rest put back
        Object.keys(now).forEach(function (k) { if (!(k in snap.data)) localStorage.removeItem(k); });
        Object.keys(snap.data).forEach(function (k) { localStorage.setItem(k, snap.data[k]); });
        localStorage.removeItem(UNDO_KEY);
        say("已放回還原之前的資料。重新整理頁面後就會看到。");
      } catch (e) { say("復原失敗：儲存空間無法寫入。"); }
      showUndo();
    });
    showUndo();
  }

  // ---------- a link to something inside a folded block (#r-…-d, #d-…) opens the folds around it ----------
  function unfold() {
    var id = decodeURIComponent(location.hash.slice(1));
    var el = id && document.getElementById(id);
    for (var d = el; d; d = d.parentElement) if (d.tagName === "DETAILS") d.open = true;
  }
  unfold();
  window.addEventListener("hashchange", unfold);

  // ---------- the workbench's note: saved like a paper's, but it belongs to no paper and earns no EXP ----------
  document.querySelectorAll("textarea[data-bench-note]").forEach(function (ta) {
    var key = "study:bench:note", status = ta.parentNode.querySelector(".saved"), timer;
    ta.value = store.get(key, "");
    function save() {
      if (!timer) return;
      clearTimeout(timer); timer = null;
      var ok = store.set(key, ta.value);
      if (status) status.textContent = ok ? "已存在這個瀏覽器" : "這個瀏覽器不允許儲存，請記得匯出";
    }
    ta.addEventListener("input", function () {
      clearTimeout(timer);
      if (status) status.textContent = "儲存中…";
      timer = setTimeout(save, 400);
    });
    ta.addEventListener("blur", save);
    window.addEventListener("pagehide", save);
  });

  if (!paper) return;

  // ---------- outline rail (collapsed on narrow screens so the text comes first) ----------
  var railDetails = document.querySelector(".rail details");
  if (railDetails && window.matchMedia && window.matchMedia("(max-width: 960px)").matches) railDetails.open = false;
  var sections = Array.prototype.slice.call(document.querySelectorAll("section.sec[id]"));
  sections.forEach(function (s, i) { s.setAttribute("data-chapter", (i + 1) + " / " + sections.length); });
  if (paper === "2601.18642") window.addEventListener("load", function () {
    if (!window.MathJax || !window.MathJax.typesetPromise) return;
    var ready = window.MathJax.startup && window.MathJax.startup.promise || Promise.resolve();
    ready.then(function () {
      if ("IntersectionObserver" in window) {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting || entry.target.hasAttribute("hidden")) return;
            window.StudyMathTypeset(entry.target);
            observer.unobserve(entry.target);
          });
        }, { rootMargin: "600px 0px" });
        sections.forEach(function (s) { observer.observe(s); });
      } else sections.forEach(window.StudyMathTypeset);
      var visible = sections.find(function (s) { return !s.hasAttribute("hidden"); });
      if (visible) window.StudyMathTypeset(visible);
    }).catch(function () {});
  });
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
  var bossSection = document.querySelector(".sec-boss");
  if (bossSection) {
    var bossHeading = bossSection.querySelector(".sec-head h2");
    var bossIntro = bossSection.querySelector(":scope > p");
    var bossLabel = bossSection.querySelector(".desk-foot .done");
    var bossLabelText = bossLabel && Array.prototype.find.call(bossLabel.childNodes, function (node) { return node.nodeType === 3; });
    var bossOriginal = { heading: bossHeading.textContent, intro: bossIntro.textContent,
      label: bossLabelText && bossLabelText.textContent };
    function renderBossSkin() {
      var game = root.getAttribute("data-skin") === "maple";
      bossHeading.textContent = game ? bossOriginal.heading : "跨章節綜合測驗";
      bossIntro.textContent = game ? bossOriginal.intro :
        "這份測驗把方法、公式和實驗放在一起檢查。答錯的題目會指出該回看哪幾節；作答後每題都附解析與出處，可以重做。";
      if (bossLabelText) bossLabelText.textContent = game ? bossOriginal.label : " 完成綜合測驗";
      if (links[bossSection.id]) links[bossSection.id].a.lastChild.textContent = game ? "BOSS：綜合挑戰" : "綜合測驗";
    }
    skinHooks.push(renderBossSkin);
    renderBossSkin();
  }

  // ---------- finished sections ----------
  var DONE_KEY = "study:" + paper + ":done";
  var COMPLETED_AT_KEY = "study:" + paper + ":completedAt";
  var done = store.get(DONE_KEY, []);
  var countable = document.querySelectorAll("input[data-done]").length;
  var crumb = document.querySelector(".toolbar .crumb");
  var shortName = crumb ? crumb.textContent.split("·")[0].trim() : paper;
  var hud = makeHud("精讀中", shortName, "讀完一節、打開解答、寫筆記，都能獲得經驗值。");

  // ---------- experience on this paper ----------
  var quests = sections.filter(function (s) { return s.querySelector("input[data-done]"); });
  var EXP_KEY = "study:" + paper + ":exp", ASK_KEY = "study:" + paper + ":asked";
  var NOTE_AWARDS_KEY = "study:" + paper + ":note-awards";
  var noteAreas = Array.prototype.slice.call(document.querySelectorAll("textarea[data-note]"));
  var noteIds = noteAreas.map(function (ta) { return ta.getAttribute("data-note"); });
  var noteAwards = store.get(NOTE_AWARDS_KEY, null);
  if (!Array.isArray(noteAwards)) {
    noteAwards = noteAreas.filter(function (ta) {
      return String(store.get("study:" + paper + ":note:" + ta.getAttribute("data-note"), "")).trim();
    }).map(function (ta) { return ta.getAttribute("data-note"); });
    store.set(NOTE_AWARDS_KEY, noteAwards);
  } else noteAwards = noteAwards.filter(function (id, i) { return noteIds.indexOf(id) >= 0 && noteAwards.indexOf(id) === i; });
  var firstVisit = store.get(EXP_KEY, null) === null;
  var asked = store.get(ASK_KEY, []);
  var others = storedExp(paper);
  // ---------- chapter battles: papers/<id>/quiz.js holds the questions, assets/battle.js runs them ----------
  // With a question bank, a chapter's tier comes from the bank: no entry, no monster (閱讀路線 keeps its box);
  // "elite" for the method and experiment chapters; "boss" for the cross-chapter BOSS chapter (s-boss).
  var bank = window.STUDY_QUIZ && window.STUDY_QUIZ.paper === paper && window.StudyBattle ? window.STUDY_QUIZ : null;
  if (bank && bank.boss) {
    var priorBattle = store.get("study:" + paper + ":battle", {});
    var priorBoss = priorBattle && typeof priorBattle === "object" ? priorBattle["s-boss"] : null;
    if (priorBoss && priorBoss.w > 0 &&
        !window.StudyBattle.titles().some(function (entry) { return entry.p === paper; }))
      window.StudyBattle.grant(paper, bank.title);
  }
  function tierOf(s) {
    if (!bank) return null;
    if (s.id === "s-boss") return bank.boss ? "boss" : null;
    var c = bank.sections && bank.sections[s.id];
    return c ? (c.tier || "normal") : null;
  }
  // elites and the boss are worth more; without a bank, the elite waits midway and the boss on the last section
  function bonusOf(s) {
    if (bank) { var t = tierOf(s); return t === "boss" ? EXP.boss : t === "elite" ? EXP.elite : 0; }
    var i = quests.indexOf(s);
    if (i === quests.length - 1 && quests.length > 1) return EXP.boss;
    if (i === Math.floor(quests.length / 2) && quests.length > 3) return EXP.elite;
    return 0;
  }
  function isDone(s) { return done.indexOf(s.querySelector("input[data-done]").getAttribute("data-done")) >= 0; }
  function allDone() { return quests.length > 0 && quests.every(isDone); }
  function paperExp() {
    var e = EXP.visit;
    quests.forEach(function (s) { if (isDone(s)) e += EXP.section + bonusOf(s); });
    if (allDone()) e += EXP.paper;
    e += asked.length * EXP.ask;
    e += noteAwards.length * EXP.note;
    return e;
  }
  var mine = paperExp(), now = levelOf(others + mine), lastGain = null;
  store.set(EXP_KEY, mine);
  // sum again after a change: what was gained, and whether the level, the title or the paper changed
  function award() {
    var before = now, wasAll = allDone.last;
    mine = paperExp();
    store.set(EXP_KEY, mine);
    now = levelOf(others + mine);
    allDone.last = allDone();
    if (allDone.last && !wasAll && !store.get(COMPLETED_AT_KEY, null))
      store.set(COMPLETED_AT_KEY, new Date().toISOString());
    refreshProfile();
    renderProgress();
    return { gain: now.exp - before.exp, up: now.lv > before.lv, job: jobOf(now.lv) !== jobOf(before.lv), finished: allDone.last && !wasAll };
  }
  allDone.last = allDone();
  function gainLines(g, first) {
    var lines = [["系統", first + "，獲得經驗值 +" + g.gain]];
    if (g.finished) {
      lines.push(["系統", "任務完成！整篇讀完，額外獲得 +" + EXP.paper]);
      var earned = PAPER_JOBS.find(function (p) { return p.id === paper; });
      if (earned) lines.push(["轉職", "解鎖研究職業「" + earned.job + "」！"]);
    }
    if (g.up) lines.unshift(["系統", "等級提升！LV." + now.lv + (g.job ? "　研究階級提升至「" + jobOf(now.lv) + "」" : "")]);
    return lines;
  }
  function here() { return pageLines(current >= 0 ? current : 0); }
  // the minimap's name band: site name over the paper's short name
  var railSummary = document.querySelector(".rail summary"), names = null;
  if (railSummary) {
    names = document.createElement("span");
    names.className = "mini-names";
    names.setAttribute("aria-hidden", "true");
    names.innerHTML = "<b>論文精讀室</b><span></span>";
    names.lastChild.textContent = shortName;
    railSummary.insertBefore(names, railSummary.firstChild);
  }
  // In the game skin on a narrow screen the minimap is a top-bar button showing the progress, and
  // the chapter list slides in from the left; picking a chapter, the shade or Esc puts it away.
  var narrow = window.matchMedia ? window.matchMedia("(max-width: 960px)") : null;
  var mapBtn = null, homeLink = document.querySelector(".toolbar .home");
  var mapInert = [];
  function drawerMode() { return root.getAttribute("data-skin") === "maple" && !!narrow && narrow.matches; }
  function openMap(v) {
    if (v && !drawerMode()) v = false;
    if (v === root.classList.contains("map-open")) return;
    mapInert.forEach(function (entry) { entry[0].inert = entry[1]; });
    mapInert = [];
    root.classList.toggle("map-open", v);
    if (mapBtn) mapBtn.setAttribute("aria-expanded", String(v));
    if (railDetails) {
      var rail = railDetails.closest(".rail");
      if (v) {
        rail.setAttribute("role", "dialog");
        rail.setAttribute("aria-modal", "true");
        for (var child = rail; child && child !== document.body; child = child.parentElement) {
          Array.prototype.forEach.call(child.parentElement.children, function (sibling) {
            if (sibling === child || sibling.classList.contains("map-scrim")) return;
            mapInert.push([sibling, sibling.inert]); sibling.inert = true;
          });
        }
        var first = rail.querySelector("a[href], summary, button:not([disabled])");
        if (first) first.focus();
      } else {
        rail.removeAttribute("role"); rail.removeAttribute("aria-modal");
        if (mapBtn && document.activeElement && rail.contains(document.activeElement)) mapBtn.focus();
      }
    }
  }
  if (railDetails && railSummary && homeLink) {
    mapBtn = document.createElement("button");
    mapBtn.type = "button";
    mapBtn.className = "map-btn";
    mapBtn.setAttribute("aria-expanded", "false");
    mapBtn.setAttribute("aria-label", "章節地圖");
    mapBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></svg><span class="map-num"></span>';
    homeLink.parentNode.insertBefore(mapBtn, homeLink.nextSibling);
    var scrim = document.createElement("button");
    scrim.type = "button";
    scrim.className = "map-scrim";
    scrim.tabIndex = -1;
    scrim.setAttribute("aria-label", "關閉章節地圖");
    // in the drawer's own stacking layer (.desk), just under it
    railDetails.closest(".rail").parentNode.appendChild(scrim);
    mapBtn.addEventListener("click", function () { railDetails.open = true; openMap(!root.classList.contains("map-open")); });
    scrim.addEventListener("click", function () { openMap(false); });
    railSummary.addEventListener("click", function (e) { if (drawerMode()) { e.preventDefault(); openMap(false); } });
    if (outline) outline.addEventListener("click", function (e) { if (drawerMode() && e.target.closest("a")) openMap(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && root.classList.contains("map-open")) { openMap(false); mapBtn.focus(); } });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || !root.classList.contains("map-open")) return;
      var rail = railDetails.closest(".rail");
      var items = Array.prototype.filter.call(rail.querySelectorAll('a[href], summary, button:not([disabled]), [tabindex]:not([tabindex="-1"])'), function (el) { return el.getClientRects().length; });
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    var fitRail = function () {
      openMap(false);
      railDetails.open = drawerMode() || !(narrow && narrow.matches);
    };
    skinHooks.push(fitRail);
    if (narrow && narrow.addEventListener) narrow.addEventListener("change", fitRail);
    fitRail();
  }
  // The cast for this paper, built a page at a time as you reach it, so a phone only fetches the
  // sprites it shows: chapter enemies and a boss from that paper's region, its local guide,
  // and the protagonist with a pet who goes with you from page to page.
  var seed = seedOf(paper), castDone = {}, party = null;
  var PAPER_SCENES = {
    "2501.13956": ["ludibrium", "clocktower"], "2601.18642": ["ellinia-town"],
    "2604.14362": ["perion"], "2605.06527": ["kerning"],
    "2606.30306": ["orbis"], "2608.19652": ["lachelein"],
    "dekleer-1986-atms": ["henesys"]
  };
  var later = window.requestIdleCallback ? function (fn) { window.requestIdleCallback(fn, { timeout: 2000 }); } : function (fn) { setTimeout(fn, 600); };
  var allDialogs = Array.prototype.slice.call(document.querySelectorAll(".check details"));
  function mobFor(s) {
    var i = quests.indexOf(s);
    if (i < 0) return null;
    var region = PAPER_CAST[paper];
    if (!region) return null;
    var mobs = region.mobs.filter(function (name) { return !!window.MAPLE_SPRITES[name]; });
    var boss = window.MAPLE_SPRITES[region.boss] && region.boss;
    var regular = mobs.length ? mobs[i % mobs.length] : null;
    if (bank) {
      var t = tierOf(s);
      if (!t) return null;
      if (t === "boss" && boss) return { name: boss, big: true };
      return regular ? { name: regular, big: t === "elite" } : null;
    }
    if (i === quests.length - 1 && boss && quests.length > 1) return { name: boss, big: true };
    return regular ? { name: regular, big: i === Math.floor(quests.length / 2) && quests.length > 3 } : null;
  }
  var mobOf = {};
  function addMob(s) {
    var m = mobFor(s);
    if (!m) return;
    s.classList.toggle("has-big", m.big);
    var p = mobOf[s.id] = perch(s, [m.name], "walk");
    var box = s.querySelector("input[data-done]");
    // Reserve space for the actions shown in this chapter. A very tall boss fits the
    // reading window instead of forcing hundreds of pixels of empty scroll.
    var acts = window.MAPLE_SPRITES[m.name].acts;
    var tall = Math.max.apply(null, ["stand", "move", "hit", "die"].filter(function (a) { return acts[a]; }).map(function (a) { return acts[a][1]; }));
    var scale = Math.min(1, 280 / tall), displayHeight = Math.ceil(tall * scale);
    s.style.setProperty("--mob-scale", scale);
    s.style.setProperty("--mob-h", box.checked ? 0 : displayHeight);
    if (box.checked) p.wrap.hidden = true;
    box.addEventListener("change", function () {
      if (!box.checked) { s.style.setProperty("--mob-h", displayHeight); respawn(p); return; }
      // the gain was summed by the box's first listener; the monster tells it
      var g = lastGain || { gain: 0 };
      g.told = true;
      defeat(p, g.gain);
      cheer(g.up);
      var foe = window.MAPLE_SPRITES[m.name].label || "怪物";
      hud.chat(gainLines(g, "打倒了" + foe).concat([["提示", "按「下一節」繼續任務。"]], pageLines(sections.indexOf(s))));
    });
  }
  function addNpc(d, index) {
    var name = guideFor("check", index);
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
    plate.textContent = window.MAPLE_SPRITES[name].label || window.MAPLE_SPRITES[name].role || "NPC";
    npc.appendChild(fig);
    npc.appendChild(plate);
    // inside the summary, the one part of a closed <details> that is drawn; the summary is
    // position: static here, so the portrait still places itself against the dialog
    d.querySelector("summary").appendChild(npc);
    // a quest mark over the NPC: a lightbulb before you ask, a book while the answer is open,
    // the finished book once the section is read; the NPC talks while its answer is open
    var mark = null, box = d.closest("section.sec") && d.closest("section.sec").querySelector("input[data-done]");
    function markName() { return box && box.checked ? "quest-done" : d.open ? "quest-open" : "quest-new"; }
    if (window.MAPLE_SPRITES["quest-new"]) {
      mark = spriteEl(markName(), "stand");
      mark.classList.add("npc-quest");
      npc.appendChild(mark);
      if (box) box.addEventListener("change", function () { swapAct(mark, markName(), "stand"); });
      ["quest-new", "quest-open", "quest-done"].forEach(function (q) { warm(q, "stand"); });
    }
    warm(name, "stand");
    warm(name, "say");
    d.addEventListener("toggle", function () {
      swapAct(spr, name, d.open ? "say" : "stand");
      if (mark) swapAct(mark, markName(), "stand");
    });
  }
  function castFor(i) {
    if (!window.MAPLE_SPRITES || castDone[i] || !sections[i]) return;
    castDone[i] = true;
    addMob(sections[i]);
    var explanation = sections[i].querySelector(".explain");
    var levels = explanation && explanation.querySelectorAll(":scope > .lv");
    if (levels && levels.length) {
      levels.forEach(function (host) {
        var role = host.classList.contains("lv-kid") ? "kid" : host.classList.contains("lv-grad") ? "grad" : "uni";
        addGuide(host, role, i);
      });
    } else {
      var guideHost = explanation || sections[i].querySelector(".claim, .summary, .worked, .detail");
      if (guideHost) addGuide(guideHost, "grad", i);
    }
    sections[i].querySelectorAll(".check details").forEach(function (dialog, j) { addNpc(dialog, i + j); });
  }
  // while a page is read, the pages either side get their cast and fetch its strips
  function ahead(i) {
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection && (connection.saveData || /(?:slow-)?2g/.test(connection.effectiveType || ""))) return;
    later(function () {
      [i + 1, i - 1].forEach(function (k) {
        if (!sections[k] || castDone[k] || !window.MAPLE_SPRITES) return;
        castFor(k);
        sections[k].querySelectorAll(".spr").forEach(function (el) {
          var u = el.style.backgroundImage.match(/url\("?(.*?)"?\)/);
          if (u) new Image().src = u[1];
        });
      });
    });
  }
  // The protagonist waits at the foot of every page, on 上一節, next to where you mark the section
  // read and beside the portal that opens then, so the level-up plays where you are looking.
  function placeParty() {
    if (party && party.wrap.parentNode !== pager) pager.appendChild(party.wrap);
  }
  // the pager leaves room above it for the protagonist's current outfit
  function heroRoom() {
    if (!party) return;
    var acts = window.MAPLE_SPRITES[party.cast[0].name].acts;
    pager.style.setProperty("--hero-h", Math.max(acts.stand[1], acts.cheer ? acts.cheer[1] : 0));
  }
  function dress() { heroRoom(); }
  // a gain: the protagonist cheers, and the level-up light plays when the level went up
  function cheer(up) {
    if (!party || reduceMotion) return;
    var hero = party.cast[0], acts = window.MAPLE_SPRITES[hero.name].acts;
    if (acts.cheer) {
      swapAct(hero.spr, hero.name, "cheer");
      setTimeout(function () { swapAct(hero.spr, hero.name, "stand"); }, 1800);
    }
    if (!up || !window.MAPLE_SPRITES["fx-levelup"]) return;
    var fx = document.createElement("span");
    fx.className = "fx-levelup";
    var pillar = spriteEl("fx-levelup", "stand");
    setAct(pillar, "fx-levelup", "stand", true, 110);
    fx.appendChild(pillar);
    hero.walker.appendChild(fx);
    // the words rise once the pillar has flashed
    setTimeout(function () {
      var words = spriteEl("fx-levelup", "text");
      words.classList.add("fx-words");
      setAct(words, "fx-levelup", "text", true, 150);
      fx.appendChild(words);
    }, 900);
    setTimeout(function () { fx.remove(); }, 2400);
  }
  whenMaple(function () {
    if (!window.MAPLE_SPRITES) return;
    var heroes = sprites("hero"), pets = sprites("pet");
    var savedHero = store.get("study:hero", "");
    var hero = heroes.indexOf(savedHero) >= 0 ? savedHero : heroes[seed % heroes.length];
    var savedPet = store.get("study:pet", "");
    var pet = pets.indexOf(savedPet) >= 0 ? savedPet : (pets.length ? pets[seed % pets.length] : null);
    if (hero) {
      party = perch(document.createElement("span"), pet ? [hero, pet] : [hero], "party");
      party.wrap.remove();
    }
    // a portal by 下一節 once the section is finished
    if (window.MAPLE_SPRITES.portal) {
      var portal = spriteEl("portal", "stand");
      portal.classList.add("pg-portal");
      portal.setAttribute("aria-hidden", "true");
      pager.appendChild(portal);
    }
    placeParty();
    heroRoom();
    if (current >= 0) { castFor(current); dress(current); ahead(current); }
    var heroChoice = document.querySelector(".hero-choice");
    if (heroChoice && party) {
      var heroRow = heroChoice.closest(".row");
      heroRow.hidden = false;
      heroes.forEach(function (name) {
        var option = document.createElement("option");
        option.value = name;
        option.textContent = (window.MAPLE_SPRITES[name].label || name) + (/[23]$/.test(name) ? " · 造型 " + name.slice(-1) : "");
        heroChoice.appendChild(option);
      });
      heroChoice.value = hero;
      heroChoice.addEventListener("change", function () {
        var name = heroChoice.value;
        store.set("study:hero", name);
        party.cast[0].name = name;
        swapAct(party.cast[0].spr, name, "stand");
        heroRoom();
      });
    }
    var petChoice = document.querySelector(".pet-choice");
    if (petChoice && pet && party.cast[1]) {
      petChoice.closest(".row").hidden = false;
      pets.forEach(function (name) {
        var option = document.createElement("option");
        option.value = name;
        option.textContent = window.MAPLE_SPRITES[name].label || name;
        petChoice.appendChild(option);
      });
      petChoice.value = pet;
      petChoice.addEventListener("change", function () {
        var name = petChoice.value;
        store.set("study:pet", name);
        party.cast[1].name = name;
        swapAct(party.cast[1].spr, name, "stand");
        warm(name, "move");
      });
    }
    // fetch the level-up and damage strips while idle, so the first finished section plays at once
    later(function () {
      warm("fx-levelup", "stand");
      warm("fx-levelup", "text");
      warm("fx-digits", "stand");
    });
  });
  function completedCount() { return done.filter(function (id) { return document.querySelector('input[data-done="' + id + '"]'); }).length; }
  function renderProgress() {
    Object.keys(links).forEach(function (id) {
      links[id].tick.textContent = done.indexOf(id) >= 0 ? "✓" : "";
      links[id].a.classList.toggle("is-done", done.indexOf(id) >= 0);
    });
    var n = completedCount();
    var bar = document.getElementById("progress-bar");
    var txt = document.getElementById("progress-text");
    if (bar) bar.style.width = (countable ? (100 * n) / countable : 0) + "%";
    if (txt) txt.textContent = root.getAttribute("data-skin") === "maple" ?
      "已完成 " + n + " / " + countable + " 任務" : "已讀 " + n + " / " + countable + " 節";
    if (mapBtn) mapBtn.querySelector(".map-num").textContent = n + "/" + countable;
    if (mapBtn) mapBtn.setAttribute("aria-label", "章節地圖，已完成 " + n + " / " + countable + " 任務" + (current >= 0 ? "，目前第 " + (current + 1) + " / " + sections.length + " 節" : ""));
    hud(now);
    // the minimap's name band carries the reader's level and title (a phone's status bar has no room for it)
    if (names) names.firstChild.textContent = "LV." + now.lv + " " + jobOf(now.lv);
  }
  document.querySelectorAll("input[data-done]").forEach(function (box) {
    var id = box.getAttribute("data-done");
    box.checked = done.indexOf(id) >= 0;
    box.addEventListener("change", function () {
      var previous = done.slice();
      var nextDone = done.filter(function (x) { return x !== id; });
      if (box.checked) nextDone.push(id);
      if (!store.set(DONE_KEY, nextDone)) { box.checked = previous.indexOf(id) >= 0; return; }
      done = nextDone;
      renderProgress();
      var g = lastGain = award();
      window.dispatchEvent(new CustomEvent("study-progress-change", { detail: { paper: paper } }));
      // without a monster on this section (no sprites, or the original style) say it here
      if (g.gain > 0) setTimeout(function () {
        if (g.told) return;
        g.told = true;
        cheer(g.up);
        hud.chat(gainLines(g, "讀完這節").concat(here()));
      }, 0);
    });
  });
  renderProgress();
  skinHooks.push(renderProgress);
  // opening a self-check answer for the first time
  allDialogs.forEach(function (d, k) {
    d.addEventListener("toggle", function () {
      if (!d.open || asked.indexOf(k) >= 0) return;
      asked.push(k);
      store.set(ASK_KEY, asked);
      var g = award();
      if (g.gain > 0) { cheer(g.up); hud.chat(gainLines(g, "查看了解答").concat(here())); }
    });
  });

  // ---------- notes ----------
  function noteKey(id) { return "study:" + paper + ":note:" + id; }
  document.querySelectorAll("textarea[data-note]").forEach(function (ta) {
    var id = ta.getAttribute("data-note");
    var status = ta.parentNode.querySelector(".saved");
    ta.value = store.get(noteKey(id), "");
    var timer;
    function save() {
      if (!timer) return;
      clearTimeout(timer); timer = null;
      var ok = store.set(noteKey(id), ta.value);
      if (status) status.textContent = ok ? "已存在這個瀏覽器" : "這個瀏覽器不允許儲存，請記得匯出";
      if (ok && ta.value.trim() && noteAwards.indexOf(id) < 0) {
        noteAwards.push(id);
        if (!store.set(NOTE_AWARDS_KEY, noteAwards)) noteAwards.pop();
      }
      var g = award();
      if (g.gain > 0) { cheer(g.up); hud.chat(gainLines(g, "寫了筆記").concat(here())); }
    }
    ta.addEventListener("input", function () {
      clearTimeout(timer);
      if (status) status.textContent = "儲存中…";
      timer = setTimeout(save, 400);
    });
    ta.addEventListener("blur", save);
    window.addEventListener("pagehide", save);
  });

  // ---------- understanding, kept apart from "read": 理解 / 部分理解 / 需要複習, with a review date ----------
  // Each mark is { g, at, due, streak, t }: the level, the day marked, the day it comes up for
  // review, how many reviews in a row ended in 理解, and the section's name for the shelf's list.
  // 需要複習 comes back the next day, 部分理解 in 3 days, 理解 in 7, then 21, then 60 days.
  // Marks earn no EXP and leave the monsters alone.
  var GRASP_KEY = "study:" + paper + ":grasp";
  var grasp = store.get(GRASP_KEY, {});
  if (!grasp || typeof grasp !== "object" || Array.isArray(grasp)) grasp = {};
  var GRASP = { got: "理解", part: "部分理解", review: "需要複習" };
  function shortOf(s) {
    if (s.classList.contains("sec-boss") && root.getAttribute("data-skin") !== "maple") return "綜合測驗";
    return s.getAttribute("data-short") || (s.querySelector("h2") || {}).textContent || s.id;
  }
  function graspDays(g, streak) { return g === "review" ? 1 : g === "part" ? 3 : [7, 21, 60][Math.min(streak, 2)]; }
  function isDue(rec) { return !!rec && rec.due <= today(); }
  // the shelf lists the sections and their names, so this page leaves its table of contents behind
  var toc = quests.map(function (s) { return [s.id, shortOf(s)]; });
  if (JSON.stringify(store.get("study:" + paper + ":toc", null)) !== JSON.stringify(toc)) store.set("study:" + paper + ":toc", toc);
  var paperTitle = ((document.querySelector(".paper-head h1") || {}).textContent || shortName).trim();
  if (store.get("study:" + paper + ":title", null) !== paperTitle) store.set("study:" + paper + ":title", paperTitle);
  function showDue(id) {
    var l = links[id], rec = grasp[id];
    if (l) {
      l.a.classList.toggle("is-due", isDue(rec));
      l.a.title = rec ? GRASP[rec.g] + (isDue(rec) ? "，該複習了" : "，下次複習 " + rec.due) : "";
    }
  }
  quests.forEach(function (s) {
    var id = s.id, foot = s.querySelector(".desk-foot");
    // the BOSS chapter has no text of its own to understand: its mastery is on its board
    if (!foot || id === "s-boss") return;
    var box = document.createElement("div");
    box.className = "grasp";
    var lab = document.createElement("span");
    lab.className = "grasp-label";
    lab.id = "grasp-" + id;
    lab.textContent = "理解程度";
    var seg = document.createElement("div");
    seg.className = "seg";
    seg.setAttribute("role", "group");
    seg.setAttribute("aria-labelledby", lab.id);
    var info = document.createElement("span");
    info.className = "grasp-due";
    info.setAttribute("aria-live", "polite");
    var btns = Object.keys(GRASP).map(function (g) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("data-grasp", g);
      b.textContent = GRASP[g];
      b.addEventListener("click", function () { mark(g); });
      seg.appendChild(b);
      return b;
    });
    function paint() {
      var rec = grasp[id];
      btns.forEach(function (b) { b.setAttribute("aria-pressed", String(!!rec && rec.g === b.getAttribute("data-grasp"))); });
      info.classList.toggle("is-due", isDue(rec));
      info.textContent = !rec ? "還沒標記；和「讀完這節」分開記" : isDue(rec) ? "該複習了：重讀一次，再選一次理解程度" : "下次複習 " + rec.due.slice(5).replace("-", "/");
      showDue(id);
    }
    // Picking the marked level again clears it, unless the section is due: then it records the review.
    function mark(g) {
      var rec = grasp[id];
      if (rec && rec.g === g && !isDue(rec)) delete grasp[id];
      else {
        var streak = g === "got" && rec && rec.g === "got" && isDue(rec) ? (rec.streak || 0) + 1 : 0;
        grasp[id] = { g: g, at: today(), due: addDays(today(), graspDays(g, streak)), streak: streak, t: shortOf(s) };
      }
      store.set(GRASP_KEY, grasp);
      paint();
    }
    box.appendChild(lab);
    box.appendChild(seg);
    box.appendChild(info);
    foot.appendChild(box);
    paint();
  });
  var dueNow = quests.filter(function (s) { return isDue(grasp[s.id]); });
  if (dueNow.length) hud.chat([["複習", "有 " + dueNow.length + " 節到了複習時間：" + dueNow.map(shortOf).join("、")]]);

  // ---------- answer first: a box under each self-check question; writing in it is optional ----------
  var TRY_KEY = "study:" + paper + ":try";
  var tries = store.get(TRY_KEY, {});
  if (!tries || typeof tries !== "object" || Array.isArray(tries)) tries = {};
  allDialogs.forEach(function (d, k) {
    // the question as written, TeX and all: this runs before MathJax and before the NPC joins the summary
    var sum = d.querySelector("summary").cloneNode(true);
    Array.prototype.forEach.call(sum.querySelectorAll(".npc-portrait"), function (n) { n.remove(); });
    var q = sum.textContent.trim();
    var wrap = document.createElement("div");
    wrap.className = "note try";
    var id = "try-" + paper.replace(/\W/g, "") + "-" + k;
    var lab = document.createElement("label");
    lab.setAttribute("for", id);
    lab.textContent = "先寫下你的答案（可略過）";
    var ta = document.createElement("textarea");
    ta.id = id;
    ta.rows = 1;
    ta.placeholder = "寫完再打開題目看參考答案，對照哪裡不同";
    ta.value = tries[k] && tries[k].a || "";
    var status = document.createElement("span");
    status.className = "saved";
    var timer;
    function save() {
      if (!timer) return;
      clearTimeout(timer); timer = null;
      if (ta.value.trim()) tries[k] = { q: q, a: ta.value }; else delete tries[k];
      status.textContent = store.set(TRY_KEY, tries) ? "已存在這個瀏覽器" : "這個瀏覽器不允許儲存";
    }
    ta.addEventListener("input", function () {
      clearTimeout(timer);
      status.textContent = "儲存中…";
      timer = setTimeout(save, 400);
    });
    ta.addEventListener("blur", save);
    window.addEventListener("pagehide", save);
    wrap.appendChild(lab);
    wrap.appendChild(ta);
    wrap.appendChild(status);
    d.parentNode.insertBefore(wrap, d.nextSibling);
    d.addEventListener("toggle", function () { lab.textContent = d.open ? "你的答案（和上面的參考答案對照）" : "先寫下你的答案（可略過）"; });
  });
  // ---------- battles in the chapters' feet ----------
  // A win ticks the chapter's (now hidden) 讀完這節 box, so EXP, progress and the monster's fall run as
  // before; a chapter already ticked stays done, and a battle there still counts toward mastery. The
  // monster also stands in the battle box, and flinches at each hit.
  var secNames = {}, battles = {};
  sections.forEach(function (s) {
    var num = s.querySelector(".sec-num"), short = shortOf(s), n = num ? num.textContent.trim() : "";
    secNames[s.id] = n && short.indexOf(n) !== 0 ? n + " " + short : short;
  });
  var boardEl = document.getElementById("boss-board");
  function drawBoard() { if (bank && boardEl) window.StudyBattle.board(boardEl, paper, bank, secNames); }
  if (bank) quests.forEach(function (s) {
    var t = tierOf(s), foot = s.querySelector(".desk-foot"), box = s.querySelector("input[data-done]");
    if (!t || !foot || !box) return;
    var label = box.closest(".done");
    if (label) label.hidden = true;
    var art = null;
    var heroArt = null, heroTimer = null;
    function strikeHero() {
      if (!heroArt) return;
      heroArt.classList.add("is-casting");
      swapAct(heroArt.querySelector(".spr"), heroArt.dataset.hero, "move");
      var target = b && b.artHost;
      if (target) {
        target.querySelectorAll(".fx-skill").forEach(function (old) { old.remove(); });
        var fx = document.createElement("span"); fx.className = "fx-skill"; fx.setAttribute("aria-hidden", "true");
        target.appendChild(fx);
        setTimeout(function () { fx.remove(); }, 1100);
      }
      if (b && b.feedbackHost && art) {
        var scene = document.createElement("span"); scene.className = "bt-hit-scene"; scene.setAttribute("aria-hidden", "true");
        var caster = document.createElement("span"); caster.className = "bt-hit-sprite bt-hit-hero"; caster.appendChild(spriteEl(heroArt.dataset.hero, "move"));
        var burst = document.createElement("span"); burst.className = "bt-hit-burst";
        var victim = document.createElement("span"); victim.className = "bt-hit-sprite bt-hit-foe"; victim.appendChild(spriteEl(art.name, "hit"));
        scene.appendChild(caster); scene.appendChild(burst); scene.appendChild(victim);
        b.feedbackHost.appendChild(scene);
      }
      if (!reduceMotion && heroArt.animate) heroArt.animate([{ transform: "translateX(0)" }, { transform: "translateX(22px)" }, { transform: "translateX(0)" }], { duration: 650, easing: "ease-out" });
      clearTimeout(heroTimer);
      heroTimer = setTimeout(function () { heroArt.classList.remove("is-casting"); swapAct(heroArt.querySelector(".spr"), heroArt.dataset.hero, "stand"); }, 900);
    }
    function act(a, once) { if (art) swapAct(art.spr, art.name, a, once, once ? 140 : undefined); }
    var b = battles[s.id] = window.StudyBattle.mount(foot, {
      paper: paper, key: s.id, tier: t, set: t === "boss" ? bank.boss : bank.sections[s.id],
      name: secNames[s.id], names: secNames, foe: t === "boss" ? bank.boss.name : null,
      cleared: function () { return box.checked; },
      onStart: function () {
        act("stand");
        if (art) warm(art.name, "hit");
        var heroName = party && party.cast[0].name;
        if (heroName) { heroArt = document.createElement("span"); heroArt.className = "bt-hero-actor"; heroArt.dataset.hero = heroName; heroArt.setAttribute("aria-hidden", "true"); heroArt.appendChild(spriteEl(heroName, "stand")); b.setHero(heroArt); }
      },
      onHit: function () {
        strikeHero();
        act("hit");
        clearTimeout(b.hitT);
        b.hitT = setTimeout(function () { act("stand"); }, 450);
      },
      onWin: function () {
        clearTimeout(b.hitT);
        if (art) warm(art.name, "die");
        act("die", true);
        var fresh = t === "boss" ? window.StudyBattle.grant(paper, bank.title) : [];
        if (!box.checked) { box.checked = true; box.dispatchEvent(new Event("change")); }
        else hud.chat([["討伐", "又打倒了一次「" + (b.foe || secNames[s.id]) + "」，熟練度已更新。"]].concat(here()));
        if (fresh.length) setTimeout(function () {
          hud.chat(fresh.map(function (x) { return ["稱號", "獲得稱號「" + x + "」"]; }).concat(here()));
        }, 2200);
        drawBoard();
        window.dispatchEvent(new CustomEvent("study-progress-change", { detail: { paper: paper } }));
        if (root.getAttribute("data-skin") === "maple" && paper === "2601.18642" && window.StudyIntroQuest &&
            window.StudyIntroQuest.stages.some(function (stage) { return stage.id === s.id; })) {
          var nextQuest = window.StudyIntroQuest.nextStage();
          var questLink = document.createElement("a");
          questLink.className = "btn bt-next-step";
          questLink.href = nextQuest ? "#" + nextQuest.id : "../../index.html#intro-quest";
          questLink.textContent = nextQuest ? "繼續任務：" + nextQuest.short : "回魔法森林回報任務";
          b.resultHost.appendChild(questLink);
        }
      },
      onLose: function () {
        if (heroArt) { heroArt.classList.add("is-struck"); setTimeout(function () { if (heroArt) heroArt.classList.remove("is-struck"); }, 350); }
        act("stand");
        hud.chat([["戰鬥", "被打倒了。看完下面的解答、回到該節複習，隨時可以再挑戰。"]].concat(here()));
        drawBoard();
      }
    });
    // the monster's picture and name, once the sprite table has loaded
    whenMaple(function () {
      var m = window.MAPLE_SPRITES && mobFor(s);
      if (!m || !b) return;
      art = { name: m.name, spr: spriteEl(m.name, "stand") };
      b.foe = t === "boss" && bank.boss.name ? bank.boss.name : (window.MAPLE_SPRITES[m.name].label || null);
      b.setFoe(b.foe, art.spr);
    });
  });
  drawBoard();
  skinHooks.push(function () { Object.keys(battles).forEach(function (id) { if (battles[id]) battles[id].refresh(); }); });

  // A reader who keeps no notes sees a folded 筆記（選用）; one with a note sees it open.
  document.querySelectorAll(".desk-foot > .note").forEach(function (n) {
    var ta = n.querySelector("textarea[data-note]");
    if (!ta) return;
    var d = document.createElement("details");
    d.className = "note-fold";
    var sum = document.createElement("summary");
    sum.textContent = "筆記（選用）";
    n.parentNode.insertBefore(d, n);
    d.appendChild(sum);
    d.appendChild(n);
    d.open = !!ta.value.trim();
  });

  // the export section points at the shelf's site-wide backup
  var exportSec = document.getElementById("s-export");
  if (exportSec && homeLink) {
    var tip = document.createElement("p");
    tip.className = "mx-src";
    tip.innerHTML = "這裡只複製這一篇的筆記。換裝置或清除瀏覽資料前，到<a>書架的「備份與匯出」</a>下載全站備份（含進度、理解程度與作答）。";
    tip.querySelector("a").href = homeLink.getAttribute("href") + "#backup";
    exportSec.appendChild(tip);
  }

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
  var lastSeenKey = "study:" + paper + ":last";
  var lastSeen = store.get(lastSeenKey, null);
  function rememberSection(s) {
    if (!s || lastSeen && lastSeen.id === s.id && Date.now() - lastSeen.at < 1500) return;
    lastSeen = { id: s.id, title: shortOf(s), at: Date.now() };
    store.set(lastSeenKey, lastSeen);
  }
  if ("IntersectionObserver" in window && outline) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || !links[e.target.id]) return;
        Object.keys(links).forEach(function (id) { links[id].a.classList.toggle("active", id === e.target.id); });
        if (!paged) rememberSection(e.target);
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
  var current = -1, paged = false, entered = false;
  function titleOf(i) { var s = sections[i]; return s ? s.getAttribute("data-short") || s.querySelector("h2").textContent : ""; }
  // what the chat line says on a page: where you are, a key point (the 五歲 explanation's first
  // sentence), the self-check question, and a nudge
  function pageLines(i) {
    var s = sections[i];
    if (!s) return [];
    var lines = [["章節", "第 " + (i + 1) + " / " + sections.length + " 節　" + s.querySelector("h2").textContent.trim()]];
    var kid = s.querySelector(".lv-kid p"), claim = s.querySelector(".claim p");
    if (kid) lines.push(["重點", firstSentence(kid)]);
    else if (claim) lines.push(["重點", firstSentence(claim)]);
    var q = s.querySelector(".check summary");
    // the question only: the NPC's name plate also sits inside the summary
    if (q) lines.push(["提問", Array.prototype.filter.call(q.childNodes, function (n) { return !(n.classList && n.classList.contains("npc-portrait")); })
      .map(function (n) { return n.textContent; }).join("").trim()]);
    lines.push(["提示", tierOf(s) ? "準備好後按「開始討伐」，完成挑戰再前往下一節。" : s.querySelector("input[data-done]") ? "讀完後按「讀完這節」，再按「下一節」。" : "按「下一節」繼續。"]);
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
    pager.querySelector(".pg-at").textContent = "章節 " + (i + 1) + " / " + sections.length;
    if (mapBtn) mapBtn.setAttribute("aria-label", "章節地圖，已完成 " + completedCount() + " / " + countable + " 任務，目前第 " + (i + 1) + " / " + sections.length + " 節");
    var box = sections[i] && sections[i].querySelector("input[data-done]");
    nextBtn.classList.toggle("is-ready", !box || box.checked);
  }
  function turnTo(i, scroll) {
    if (!paged || i < 0 || i >= sections.length) return;
    var changed = i !== current;
    current = i;
    rememberSection(sections[i]);
    var zones = PAPER_SCENES[paper] || ["henesys"];
    var phase = Math.min(zones.length - 1, Math.floor(i * zones.length / sections.length));
    document.body.setAttribute("data-map-scene", zones[phase]);
    sections.forEach(function (s, k) { if (k === i) s.removeAttribute("hidden"); else s.setAttribute("hidden", "until-found"); });
    if (paper === "2601.18642") window.StudyMathTypeset(sections[i]);
    if (head) { if (i === 0) head.removeAttribute("hidden"); else head.setAttribute("hidden", "until-found"); }
    drawPager();
    castFor(i);
    dress(i);
    ahead(i);
    if (changed) {
      hud.chat(pageLines(i));
      // the new page rises in (not on the first one shown)
      if (entered) [head, sections[i]].forEach(function (el) {
        if (!el || el.hidden) return;
        el.classList.remove("is-entering");
        void el.offsetWidth;
        el.classList.add("is-entering");
      });
      entered = true;
    }
    // a new page starts at its top, with its monster in view
    if (scroll) window.scrollTo(0, 0);
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
    if (target === sections[i]) window.scrollTo(0, 0); else target.scrollIntoView();
    return true;
  }
  window.addEventListener("hashchange", function () { if (paged) fromHash(); });
  // the browser scrolls to the address's anchor once the page has loaded; a section's page starts at its top
  window.addEventListener("load", function () {
    var t = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    if (paged && t && t === sections[current]) setTimeout(function () { window.scrollTo(0, 0); }, 0);
  });
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
    if (start > 0) hud.chat([["系統", "從上次讀到的地方繼續：第 " + (start + 1) + " 節　" + titleOf(start)]].concat(pageLines(start)));
  }
  skinHooks.push(setPaged);
  setPaged();
  if (firstVisit) hud.chat([["系統", "接受新任務，獲得經驗值 +" + EXP.visit]].concat(here()));
})();

/* Optional study sync overlay: loaded after the existing page app. */
(function(){var s=document.createElement('script');s.src=new URL('study-sync.js?v=4635f44d7c',document.currentScript.src).href;document.head.appendChild(s);})();
