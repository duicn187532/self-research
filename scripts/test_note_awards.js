// Verify old notes keep their experience when the milestone becomes permanent.
const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const source = fs.readFileSync("assets/site.js", "utf8");
function excerpt(start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a);
  assert.ok(a >= 0 && b > a);
  return source.slice(a, b);
}
const notes = [
  { getAttribute: () => "s-route" },
  { getAttribute: () => "s-problem" }
];
const saved = new Map([
  ["study:example:note:s-route", "legacy note"],
  ["study:example:note:s-problem", ""]
]);
const store = {
  get(key, fallback) { return saved.has(key) ? saved.get(key) : fallback; },
  set(key, value) { saved.set(key, value); return true; }
};
const context = {
  paper: "example", store,
  document: { querySelectorAll: () => notes },
  Array, String,
  EXP: { visit: 50, section: 100, paper: 500, ask: 20, note: 30 },
  quests: [], asked: [], allDone: () => false
};
vm.createContext(context);
vm.runInContext(excerpt('  var NOTE_AWARDS_KEY =', '  var firstVisit ='), context);
vm.runInContext(excerpt('  function paperExp() {', '  var mine = paperExp()'), context);
assert.deepEqual(Array.from(context.noteAwards), ["s-route"]);
assert.equal(context.paperExp(), 80, "legacy nonempty note keeps its 30 EXP");
saved.set("study:example:note:s-route", "");
assert.equal(context.paperExp(), 80, "clearing a note does not revoke its milestone");
context.noteAwards.push("s-problem");
assert.equal(context.paperExp(), 110, "a second first note adds EXP once");
context.noteAwards.push("s-problem");
saved.set("study:example:note-awards", context.noteAwards);
vm.runInContext(excerpt('  var NOTE_AWARDS_KEY =', '  var firstVisit ='), context);
assert.deepEqual(Array.from(context.noteAwards), ["s-route", "s-problem"], "reopening deduplicates awards");
console.log("Note award migration and permanent milestone passed.");
