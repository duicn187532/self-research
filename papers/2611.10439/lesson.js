/* MixUA four-scope visual lab: synthetic, deterministic, not benchmark data. */
(function () {
  "use strict";
  var box = document.getElementById("mx-lab");
  if (!box) return;
  var $ = function (id) { return document.getElementById(id); };
  var ids = ["mx-u", "mx-a", "mx-s", "mx-p", "mx-qu", "mx-qa"];
  var phase = 0;
  var steps = [
    "1／4　資料源：判定 lesson 來自哪位 User、哪一個 Agent，以及它是否含私人資料。",
    "2／4　Writer：先分 Reusable／Protected；Protected 只能存 Pair 或 User。",
    "3／4　Audience：依 Scope 建立可讀配對；不在可讀集合就不能檢索。",
    "4／4　Retrieval：授權通過後才做語意檢索；高相似不表示當前情境仍有效。"
  ];
  function authorized(u, a, s, qu, qa) {
    return s === "Global" || (s === "User" && u === qu) ||
           (s === "Agent" && a === qa) || (s === "Pair" && u === qu && a === qa);
  }
  function render() {
    var u = $("mx-u").value, a = $("mx-a").value, s = $("mx-s").value,
        p = $("mx-p").value, qu = $("mx-qu").value, qa = $("mx-qa").value;
    var writable = p !== "protected" || s === "Pair" || s === "User";
    var grid = $("mx-grid"); grid.replaceChildren();
    ["A","B"].forEach(function (user) {
      ["X","Y"].forEach(function (agent) {
        var el = document.createElement("div");
        var ok = writable && authorized(u, a, s, user, agent);
        el.className = "lab-cell" + (ok ? " allow" : "") + (user === qu && agent === qa ? " focus" : "");
        var name = document.createElement("strong"); name.textContent = user + " × " + agent;
        var result = document.createElement("span"); result.textContent = ok ? " 可讀取" : " 不可讀";
        el.append(name,result); grid.appendChild(el);
      });
    });
    var ok = writable && authorized(u, a, s, qu, qa);
    $("mx-out").textContent = writable ?
      "來源 " + u + "–" + a + "，Scope=" + s + "。查詢 " + qu + "–" + qa + (ok ? " 有權讀取。" : " 無權讀取。") :
      "拒絕寫入：Protected 記憶禁止進入 Agent／Global。";
    $("mx-step").textContent = steps[phase];
    $("mx-next").disabled = phase === steps.length - 1;
  }
  ids.forEach(function (id) { $(id).addEventListener("change", function () { phase = 0; render(); }); });
  $("mx-next").addEventListener("click", function () { phase = Math.min(phase + 1, steps.length - 1); render(); });
  $("mx-reset").addEventListener("click", function () { phase = 0; render(); });
  render();
}());
