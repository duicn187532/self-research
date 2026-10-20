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

  // ---------- shelf: show progress for each paper ----------
  document.querySelectorAll("[data-progress-for]").forEach(function (el) {
    var id = el.getAttribute("data-progress-for");
    var total = Number(el.getAttribute("data-total")) || 0;
    var done = store.get("study:" + id + ":done", []).length;
    el.textContent = total ? "已讀 " + Math.min(done, total) + " / " + total + " 節" : "";
  });

  if (!paper) return;

  // ---------- outline rail ----------
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
  function renderProgress() {
    Object.keys(links).forEach(function (id) {
      links[id].tick.textContent = done.indexOf(id) >= 0 ? "✓" : "";
    });
    var n = done.filter(function (id) { return document.querySelector('input[data-done="' + id + '"]'); }).length;
    var bar = document.getElementById("progress-bar");
    var txt = document.getElementById("progress-text");
    if (bar) bar.style.width = (countable ? (100 * n) / countable : 0) + "%";
    if (txt) txt.textContent = n + " / " + countable;
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
