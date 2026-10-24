// A focused phone view of the existing evidence matrix. The full table stays available.
(function () {
  "use strict";
  var section = document.getElementById("c-matrix");
  var table = section && section.querySelector("table.matrix");
  if (!table) return;
  var heads = Array.prototype.slice.call(table.querySelectorAll("thead th")).slice(1).map(function (th) { return th.textContent.trim(); });
  var rows = Array.prototype.slice.call(table.querySelectorAll("tbody tr"));
  var dimensions = rows.map(function (tr) { return tr.querySelector("th").textContent.trim(); });
  rows.forEach(function (tr, rowIndex) {
    Array.prototype.slice.call(tr.querySelectorAll("td")).forEach(function (cell, columnIndex) {
      var a = cell.querySelector("a");
      if (a) a.setAttribute("aria-label", heads[columnIndex] + "，" + dimensions[rowIndex] + "：" + (cell.title || a.textContent.trim()));
    });
  });

  var view = document.createElement("div");
  view.className = "compare-mobile";
  var label = document.createElement("label");
  label.textContent = "比較維度";
  var select = document.createElement("select");
  dimensions.forEach(function (name, index) {
    var option = document.createElement("option");
    option.value = String(index);
    option.textContent = name;
    select.appendChild(option);
  });
  label.appendChild(select);
  view.appendChild(label);
  var field = document.createElement("fieldset");
  var legend = document.createElement("legend");
  legend.textContent = "選擇 2–3 篇論文";
  field.appendChild(legend);
  var checks = [];
  heads.forEach(function (name, index) {
    var choice = document.createElement("label");
    var box = document.createElement("input");
    box.type = "checkbox";
    box.value = String(index);
    box.checked = index === 1 || index === 2;
    choice.appendChild(box);
    choice.appendChild(document.createTextNode(name));
    field.appendChild(choice);
    checks.push(box);
  });
  view.appendChild(field);
  var notice = document.createElement("p");
  notice.className = "compare-mobile-notice";
  notice.setAttribute("role", "status");
  view.appendChild(notice);
  var cards = document.createElement("div");
  cards.className = "compare-mobile-cards";
  view.appendChild(cards);
  function draw() {
    cards.replaceChildren();
    var row = rows[Number(select.value) || 0];
    var cells = row.querySelectorAll("td");
    checks.forEach(function (box, index) {
      if (!box.checked) return;
      var card = document.createElement("article");
      var title = document.createElement("h3");
      title.textContent = heads[index];
      card.appendChild(title);
      var status = document.createElement("p");
      status.textContent = dimensions[Number(select.value) || 0] + "：" + (cells[index].title || cells[index].textContent.trim());
      card.appendChild(status);
      var evidence = document.createElement("a");
      evidence.href = row.querySelector("th a").getAttribute("href");
      evidence.textContent = "查看各篇說明與出處";
      card.appendChild(evidence);
      cards.appendChild(card);
    });
  }
  select.addEventListener("change", draw);
  checks.forEach(function (box) {
    box.addEventListener("change", function () {
      var selected = checks.filter(function (item) { return item.checked; });
      if (selected.length < 2 || selected.length > 3) {
        box.checked = !box.checked;
        notice.textContent = "請選擇 2–3 篇論文。";
      } else notice.textContent = "";
      draw();
    });
  });
  var wrap = table.closest(".table-wrap");
  wrap.parentNode.insertBefore(view, wrap);
  var full = document.createElement("details");
  full.className = "compare-full-matrix";
  var summary = document.createElement("summary");
  summary.textContent = "查看完整七篇矩陣";
  full.appendChild(summary);
  wrap.parentNode.insertBefore(full, wrap);
  full.appendChild(wrap);
  var narrow = window.matchMedia("(max-width: 760px)");
  function fit() { full.open = !narrow.matches; }
  if (narrow.addEventListener) narrow.addEventListener("change", fit);
  fit();
  draw();
})();
