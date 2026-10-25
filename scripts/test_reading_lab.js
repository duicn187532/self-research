// Dependency-free DOM interaction smoke test for the nine reading labs.
// Run: node scripts/test_reading_lab.js
const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const source = fs.readFileSync("assets/reading-lab.js", "utf8");
const ids = [
  "2501.13956", "2601.18642", "2604.14362", "2605.06527",
  "2606.30306", "2608.19652", "2604.20006", "2610.09008", "dekleer-1986-atms"
];

function makeNode(tag) {
  return {
    tag, children: [], attributes: {}, listeners: {},
    className: "", textContent: "", disabled: false,
    appendChild(child) { this.children.push(child); return child; },
    replaceChildren(...children) { this.children = children; },
    setAttribute(name, value) { this.attributes[name] = value; },
    getAttribute(name) { return this.attributes[name] || ""; },
    addEventListener(name, callback) { this.listeners[name] = callback; },
    querySelectorAll(selector) {
      const found = [];
      const walk = (node) => {
        for (const child of node.children || []) {
          if (child.tag === selector) found.push(child);
          walk(child);
        }
      };
      walk(this);
      return found;
    },
    insertAdjacentElement(_, child) { this.inserted = child; }
  };
}
function find(root, cls) {
  const out = [];
  const walk = node => {
    if ((node.className || "").split(" ").includes(cls)) out.push(node);
    for (const item of node.children || []) walk(item);
  };
  walk(root);
  return out;
}
function click(el) {
  assert.ok(el.listeners.click, "expected working click handler");
  el.listeners.click();
}
function change(el) {
  assert.ok(el.listeners.input, "expected working input handler");
  el.listeners.input();
}

for (const id of ids) {
  const section = makeNode("section");
  const heading = makeNode("div");
  heading.className = "sec-head";
  section.appendChild(heading);
  section.querySelector = () => heading;
  const document = {
    querySelector: selector => selector === "[data-paper]" ? { getAttribute: () => id } : null,
    getElementById: name => name === "s-overview" ? ((id === "2604.20006" || id === "2610.09008") ? section : null) : name === "s-route" ? section : { getAttribute: () => name },
    createElement: makeNode,
    createTextNode: value => ({ tag: "#text", textContent: value, children: [] })
  };
  // No window/localStorage is given: this new teaching UI must be stateless.
  vm.runInNewContext(source, { document }, { timeout: 2000 });
  const quickStart = heading.inserted;
  assert.equal(quickStart.className, "reading-quick-start", id + ": direct reading entry");
  const app = quickStart.inserted;
  assert.ok(app, id + ": must mount after reading-route heading");
  assert.equal(app.tag, "details", id + ": advanced lab starts folded");
  assert.equal(find(app, "reading-dim").length, 5, id + ": five dimensions");
  assert.equal(find(app, "reading-check").length, 5, id + ": fairness factors");
  assert.equal(find(app, "reading-source").length, 1, id + ": source status");
  const ctl = find(app, "reading-flow-controls")[0];
  const state = find(app, "reading-flow-state")[0];
  click(ctl.children[1]);
  assert.match(state.textContent, /步驟 2/, id + ": next method state");
  click(ctl.children[0]);
  assert.match(state.textContent, /步驟 1/, id + ": previous method state");

  const metric = find(app, "reading-metric-result")[0];
  assert.match(metric.textContent, /\+5 個百分點/, id + ": positive delta");
  const widget = find(app, "reading-metric-demo")[0];
  const sliders = widget.children.filter(n => n.tag === "label")
    .map(n => n.children.find(x => x.tag === "input"));
  sliders[0].value = "0";
  change(sliders[0]);
  assert.match(metric.textContent, /無法計算/, id + ": zero baseline");
  sliders[0].value = "90";
  change(sliders[0]);
  assert.match(metric.textContent, /-20 個百分點/, id + ": negative delta");

  const answers = find(app, "reading-quiz-buttons")[0];
  const feedback = find(app, "reading-quiz-feedback")[0];
  click(answers.children[0]);
  assert.match(feedback.textContent, /判讀正確/, id + ": right category");
  assert.ok(answers.children.every(n => n.disabled), id + ": answer locks after selection");
  click(find(app, "reading-quiz-nav")[0].children[0]);
  click(answers.children[0]);
  assert.match(feedback.textContent, /需要修正/, id + ": incorrect category feedback");
  console.log("PASS", id, "dimensions/flow/metric/fairness/feedback");
}
console.log("PASS nine stateless interaction smoke tests");
