// Verify answer EXP needs an answer written first, and answers opened under the old rule keep their EXP.
const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const source = fs.readFileSync("assets/site.js", "utf8");
function excerpt(start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a);
  assert.ok(a >= 0 && b > a);
  return source.slice(a, b);
}
const awards = excerpt('  var asked = store.get(ASK_KEY, []);', '  var others =');
const exp = excerpt('  function paperExp() {', '  var mine = paperExp()');
function page(saved, failKey) {
  const store = {
    get(key, fallback) { return saved.has(key) ? saved.get(key) : fallback; },
    set(key, value) { if (key === failKey) return false; saved.set(key, value); return true; }
  };
  const context = {
    paper: "example", store, ASK_KEY: "study:example:asked", Array,
    EXP: { visit: 50, section: 100, paper: 500, ask: 20, note: 30 },
    quests: [], noteAwards: [], allDone: () => false
  };
  vm.createContext(context);
  vm.runInContext(awards, context);
  vm.runInContext(exp, context);
  return context;
}

// an old save: three answers opened under the old rule earned 3 × 20 EXP
const saved = new Map([["study:example:asked", [0, 1, 2]]]);
let p = page(saved);
assert.deepEqual(Array.from(p.askAwards), [0, 1, 2], "legacy opened answers are copied into the award list");
assert.equal(p.paperExp(), 50 + 3 * 20, "legacy answer EXP is not deducted");
assert.deepEqual(Array.from(saved.get("study:example:ask-awards")), [0, 1, 2]);

// opened without an answer of your own: no EXP, and writing one afterwards does not earn it either
assert.equal(p.openAnswer(3, false), false);
assert.equal(p.paperExp(), 110, "peeking earns nothing");
assert.equal(p.openAnswer(3, true), null, "answering after the answer was seen earns nothing");
assert.equal(p.paperExp(), 110);

// answered first, then opened: +20 once
assert.equal(p.openAnswer(4, true), true);
assert.equal(p.paperExp(), 130, "an answer written first earns EXP");
assert.equal(p.openAnswer(4, true), null, "reopening does not pay again");
assert.equal(p.paperExp(), 130);

// reloading keeps the list: the peeked answer stays unpaid even though it is in :asked
p = page(saved);
assert.deepEqual(Array.from(p.askAwards), [0, 1, 2, 4], "the migration runs only once");
assert.equal(p.paperExp(), 130);

// a fresh reader has nothing to migrate
p = page(new Map());
assert.equal(p.paperExp(), 50);
assert.equal(p.openAnswer(0, false), false);
assert.equal(p.paperExp(), 50);

// the award cannot be saved: no EXP shown that a reload would take back
const full = new Map();
p = page(full, "study:example:ask-awards");
assert.equal(p.openAnswer(0, true), null);
assert.equal(p.paperExp(), 50, "an unsaved award is rolled back");

// duplicated award ids from a merge are counted once
p = page(new Map([["study:example:asked", [0, 1]], ["study:example:ask-awards", [0, 1, 1, 0]]]));
assert.equal(p.paperExp(), 90, "duplicate award ids count once");

console.log("Answer awards: legacy EXP kept, peeking unpaid, answer-first paid once, failed save rolled back.");
