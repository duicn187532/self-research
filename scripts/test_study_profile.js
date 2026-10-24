// Dependency-free behavioural regression tests for the real profile/sync implementations.
// Run: node scripts/test_study_profile.js
const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");

const source = fs.readFileSync("assets/site.js", "utf8");
function between(value, a, b) {
  const start = value.indexOf(a), end = value.indexOf(b, start);
  assert.ok(start >= 0 && end > start, "expected source markers");
  return value.slice(start, end);
}
const profileSource = between(source, '  var PROFILE_KEY = "study:profile";', '  // every paper\'s EXP but one:');
const saved = new Map();
const dispatched = [];
const listeners = {};
const window = {
  addEventListener(type, callback) { listeners[type] = callback; },
  dispatchEvent(evt) { dispatched.push(evt); if (listeners[evt.type]) listeners[evt.type](evt); }
};
const store = {
  get(k, fallback) { return saved.has(k) ? JSON.parse(JSON.stringify(saved.get(k))) : fallback; },
  set(k, value) { saved.set(k, JSON.parse(JSON.stringify(value))); return true; }
};
const CustomEvent = class { constructor(type, options) { this.type = type; this.detail = options.detail; } };
vm.runInNewContext(profileSource, { store, window, CustomEvent, Set }, { timeout: 2000 });
const api = window.StudyProfile;
const plain = value => JSON.parse(JSON.stringify(value));
assert.equal(api.get().activeJob, "初心者", "no completions start as beginner");
assert.equal(api.get().displayId, "");
assert.deepEqual(plain(api.get().unlockedJobs), []);
assert.equal(api.setDisplayId("八萬"), true);
assert.equal(api.get().displayId, "八萬");
assert.equal(api.setDisplayId("a"), false, "reject too-short name");
assert.equal(api.get().displayId, "八萬", "invalid edit preserves original");
assert.equal(api.setActiveJob("未知職業"), false, "locked job cannot be equipped");

function mark(id, total, completed) {
  const toc = Array.from({ length: total }, (_, i) => ["s-" + i, "Quest " + i]);
  store.set("study:" + id + ":toc", toc);
  store.set("study:" + id + ":done", toc.slice(0, completed).map(x => x[0]));
}
mark("2501.13956", 15, 14);
assert.equal(api.get().activeJob, "初心者", "partial paper doesn't unlock");
mark("2501.13956", 15, 15);
assert.equal(api.get().activeJob, "時序行者", "first complete paper auto equips its job");
assert.deepEqual(plain(api.get().unlockedJobs), ["時序行者"]);
mark("2601.18642", 15, 15);
assert.equal(api.get().unlockedJobs.length, 2, "second paper adds another job");
assert.equal(api.setActiveJob("忘卻之羽"), true);
assert.equal(api.get().activeJob, "忘卻之羽", "select unlocked job");
assert.equal(api.setActiveJob("初心者"), true, "beginner remains optional");
mark("2501.13956", 15, 0);
assert.equal(api.get().unlockedJobs.length, 2, "previously earned job not revoked by unchecking");
assert.equal(api.get().activeJob, "初心者", "user's manual beginner choice persists");
saved.delete("study:profile");
mark("2501.13956", 15, 14);
store.set("study:2501.13956:done", Array(15).fill("s-1"));
assert.equal(api.get().activeJob, "忘卻之羽", "duplicate IDs cannot fake paper completion");
assert.ok(dispatched.length >= 2, "profile updates notify HUD");
// Previously unlocked long names must be migrated rather than silently revoked.
saved.delete("study:2601.18642:done");
saved.delete("study:2501.13956:done");
saved.set("study:profile", {
  displayId: "八萬", activeJob: "時序織網師",
  unlockedJobs: ["時序織網師", "遺忘調律師", "時序行者"]
});
const upgraded = api.get();
assert.equal(upgraded.activeJob, "時序行者", "historical equipped title migrates");
assert.deepEqual(plain(upgraded.unlockedJobs), ["時序行者", "忘卻之羽"], "historical unlocks migrate and deduplicate");
assert.equal(saved.get("study:profile").activeJob, "時序行者", "migration saved locally");
assert.equal(api.setActiveJob("忘卻之羽"), true, "renamed achievements stay equipable");


const sync = fs.readFileSync("assets/study-sync.js", "utf8");
const mergeSrc = between(sync, "  var LEGACY_PROFILE_JOBS = {", "  function mergeValues(");
const ctx = {
  parse: JSON.parse,
  fail() { throw new Error("CONFLICT"); }
};
vm.runInNewContext(mergeSrc, ctx, { timeout: 2000 });
const cloud = { displayId:"八萬", activeJob:"時序行者", unlockedJobs:["時序行者"] };
const local = { displayId:"", activeJob:"初心者", unlockedJobs:["忘卻之羽"] };
const merged = JSON.parse(ctx.mergeStudyProfile(JSON.stringify(cloud), JSON.stringify(local)));
assert.equal(merged.displayId, "八萬", "new device's empty default must not erase account name");
assert.equal(merged.activeJob, "時序行者", "non-beginner equipped job survives new device");
assert.deepEqual(merged.unlockedJobs, ["時序行者", "忘卻之羽"]);
const oldCloud = { displayId:"八萬", activeJob:"時序織網師", unlockedJobs:["時序織網師", "遺忘調律師"] };
const upgradedCloud = JSON.parse(ctx.mergeStudyProfile(JSON.stringify(oldCloud), JSON.stringify(local)));
assert.equal(upgradedCloud.activeJob, "時序行者", "old cloud job canonicalizes");
assert.deepEqual(upgradedCloud.unlockedJobs, ["時序行者", "忘卻之羽"], "old cloud unlocks canonicalize");
const mixedCloud = JSON.parse(ctx.mergeStudyProfile(
  JSON.stringify(oldCloud), JSON.stringify({ displayId:"八萬", activeJob:"時序行者", unlockedJobs:["時序行者"] })));
assert.equal(mixedCloud.activeJob, "時序行者", "old/new spelling same equipped job is not a conflict");
assert.deepEqual(mixedCloud.unlockedJobs, ["時序行者", "忘卻之羽"], "mixed spellings do not duplicate jobs");

assert.throws(() => ctx.mergeStudyProfile(JSON.stringify(cloud), JSON.stringify({ ...local, displayId:"另一人" })), /CONFLICT/, "different names are not overwritten silently");
assert.throws(() => ctx.mergeStudyProfile(JSON.stringify(cloud), JSON.stringify({ ...local, activeJob:"忘卻之羽" })), /CONFLICT/, "competing manually equipped jobs require resolution");
console.log("Study profile: all functional regression assertions passed.");
