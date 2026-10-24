// Dynamic formula requests must run one after another in MathJax 3.
const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const source = fs.readFileSync("assets/site.js", "utf8");
const start = source.indexOf("  var mathQueue = Promise.resolve();");
const end = source.indexOf("  // ---------- explanation level", start);
assert.ok(start >= 0 && end > start);
let active = 0, peak = 0;
const seen = [];
const window = {
  MathJax: {
    typesetPromise: async ([node]) => {
      active++;
      peak = Math.max(peak, active);
      seen.push(node);
      await new Promise(resolve => setTimeout(resolve, 2));
      active--;
    }
  }
};
vm.runInNewContext(source.slice(start, end), { window, Promise });
Promise.all([window.StudyMathTypeset("chapter"), window.StudyMathTypeset("question"), window.StudyMathTypeset("animation")])
  .then(() => {
    assert.equal(peak, 1);
    assert.deepEqual(seen, ["chapter", "question", "animation"]);
    const page = fs.readFileSync("papers/2601.18642/index.html", "utf8");
    assert.match(page, /startup:\s*\{\s*typeset:\s*false\s*\}/);
    console.log("MathJax chapter queue and FadeMem startup scope passed.");
  }).catch(error => { console.error(error); process.exitCode = 1; });
