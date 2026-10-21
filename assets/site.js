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
  var cssLink = document.querySelector('link[href$="assets/site.css"]');
  var mapleBase = cssLink ? cssLink.getAttribute("href").replace(/site\.css$/, "maple/") : null;
  var mapleReady = false, mapleHooks = [];
  function whenMaple(fn) { if (mapleReady) fn(); else mapleHooks.push(fn); }
  var hostTheme = root.hasAttribute("data-host-theme") ? root.getAttribute("data-host-theme") : root.getAttribute("data-theme");
  function applySkin(v) { if (v === "maple" && mapleReady) root.setAttribute("data-skin", "maple"); else root.removeAttribute("data-skin"); }
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
    if (ok) mapleHooks.splice(0).forEach(function (fn) { fn(); });
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
  // Decorative: the same numbers are in the rail or tally, so it is hidden from assistive tech, and its
  // MENU button (a shortcut to the appearance panel) is left out of the tab order.
  function makeHud(job, name, notice) {
    var hud = document.createElement("div");
    hud.className = "hud";
    hud.setAttribute("aria-hidden", "true");
    hud.innerHTML = '<div class="hud-chat"><b>[公告]</b> <span></span></div><div class="hud-row">' +
      '<div class="hud-left"><span class="hud-lv"></span><span class="hud-name"><span></span><b></b></span></div>' +
      '<div class="hud-gp"><div class="hud-exp"><span class="hud-gray"></span><span class="hud-num"></span></div></div>' +
      '<button type="button" class="hud-menu" tabindex="-1"></button></div>';
    hud.querySelector(".hud-chat span").textContent = notice;
    hud.querySelector(".hud-name span").textContent = job;
    hud.querySelector(".hud-name b").textContent = name;
    hud.querySelector(".hud-menu").addEventListener("click", function (e) { e.stopPropagation(); if (openAppear) openAppear(true); });
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
        img.src = mapleBase + "lv" + d + ".png";
        img.alt = "";
        lv.appendChild(img);
      });
    }
    whenMaple(draw);
    return function (n, total) { last = [n, total]; draw(); };
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
  if (tallyDone) makeHud("書架", "論文精讀室", "歡迎來到論文精讀室。")(sumDone, sumTotal);

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
  // NPCs take turns in the self-check dialogs; added only once the art has loaded
  whenMaple(function () {
    document.querySelectorAll(".check details").forEach(function (d, i) {
      var npc = document.createElement("span");
      npc.className = "npc-portrait";
      npc.setAttribute("aria-hidden", "true");
      npc.innerHTML = '<img alt=""><span>精讀導師</span>';
      npc.firstChild.addEventListener("error", function () { npc.firstChild.remove(); });
      npc.firstChild.src = mapleBase + "npc-" + ((i % 3) + 1) + ".png";
      d.appendChild(npc);
    });
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
})();
