// Step-by-step teaching animations shared by every paper page.
//
//   StudyAnim(rootElement, {
//     width, height,              // SVG viewBox size
//     init: () => state,          // fresh state before step 0
//     steps: [{ title, text, run(state) }],   // run mutates state for that step
//     draw(scene, state, i)       // paint state; scene.put() upserts keyed SVG nodes
//   })
//
// Going backwards replays steps 0..i from init(), so step functions stay simple.
// Nodes keep their identity across steps (keyed), so CSS transitions animate
// position (style.transform), opacity and colour between steps.
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function StudyAnim(root, cfg) {
    var i = 0, timer = null;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var stage = el("div", "anim-stage");
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + cfg.width + " " + cfg.height);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", root.getAttribute("data-label") || "教學動畫");
    stage.appendChild(svg);

    var cap = el("div", "anim-caption");
    cap.setAttribute("aria-live", "polite");
    var capTitle = el("div", "anim-step-title");
    var capText = el("div", "anim-step-text");
    cap.appendChild(capTitle);
    cap.appendChild(capText);

    var bar = el("div", "anim-controls");
    var bPrev = el("button", "btn", "上一步");
    var bPlay = el("button", "btn", "自動播放");
    var bNext = el("button", "btn", "下一步");
    var bReset = el("button", "btn", "從頭開始");
    var count = el("span", "anim-count");
    [bReset, bPrev, bPlay, bNext].forEach(function (b) { b.type = "button"; bar.appendChild(b); });
    bar.appendChild(count);

    root.appendChild(bar);
    root.appendChild(el("div", "anim-hint", "畫面比螢幕寬時，可以左右滑動看完整動畫"));
    root.appendChild(stage);
    root.appendChild(cap);

    // ---- keyed scene ----
    var nodes = {}, touched = {};
    var scene = {
      put: function (key, tag, attrs, text, parentKey) {
        var n = nodes[key];
        var parent = parentKey ? nodes[parentKey] : svg;
        if (!n || n.tagName !== tag) {
          if (n && n.parentNode) n.parentNode.removeChild(n);
          n = document.createElementNS(NS, tag);
          n.setAttribute("data-key", key);
          nodes[key] = n;
          if (attrs && attrs.enter) n.style.opacity = "0";
          parent.appendChild(n);
          if (attrs && attrs.enter) requestAnimationFrame(function () { n.style.opacity = ""; });
        } else if (n.parentNode !== parent) {
          parent.appendChild(n);
        }
        n.classList.remove("anim-leaving");
        touched[key] = true;
        Object.keys(attrs || {}).forEach(function (a) {
          var v = attrs[a];
          if (a === "enter") return;
          if (a === "pos") { n.style.transform = "translate(" + v[0] + "px," + v[1] + "px)"; return; }
          if (a === "cls") { n.setAttribute("class", v); return; }
          if (v === null || v === undefined) n.removeAttribute(a);
          else n.setAttribute(a, v);
        });
        if (text != null) n.textContent = text;
        return n;
      },
      svg: svg
    };

    function render() {
      var state = cfg.init();
      for (var k = 0; k <= i; k++) cfg.steps[k].run(state);
      touched = {};
      cfg.draw(scene, state, i);
      Object.keys(nodes).forEach(function (key) {
        if (touched[key]) return;
        var n = nodes[key];
        delete nodes[key];
        if (reduce) { if (n.parentNode) n.parentNode.removeChild(n); return; }
        n.classList.add("anim-leaving");
        setTimeout(function () { if (n.parentNode && !nodes[key]) n.parentNode.removeChild(n); }, 450);
      });
      var s = cfg.steps[i];
      capTitle.textContent = s.title;
      capText.innerHTML = typeof s.text === "function" ? s.text(state) : s.text;
      count.textContent = (i + 1) + " / " + cfg.steps.length;
      bPrev.disabled = i === 0;
      bNext.disabled = i === cfg.steps.length - 1;
      if (window.StudyMathTypeset) window.StudyMathTypeset(cap);
      else if (window.MathJax && window.MathJax.typesetPromise) window.MathJax.typesetPromise([cap]).catch(function () {});
    }

    function stop() { if (timer) { clearInterval(timer); timer = null; } bPlay.textContent = "自動播放"; }
    function go(n) { i = Math.max(0, Math.min(cfg.steps.length - 1, n)); render(); }

    bPrev.addEventListener("click", function () { stop(); go(i - 1); });
    bNext.addEventListener("click", function () { stop(); go(i + 1); });
    bReset.addEventListener("click", function () { stop(); go(0); });
    bPlay.addEventListener("click", function () {
      if (timer) { stop(); return; }
      if (i === cfg.steps.length - 1) go(0);
      bPlay.textContent = "暫停";
      timer = setInterval(function () {
        if (i >= cfg.steps.length - 1) { stop(); return; }
        go(i + 1);
      }, cfg.interval || 3200);
    });
    render();
  }

  window.StudyAnim = StudyAnim;
})();
