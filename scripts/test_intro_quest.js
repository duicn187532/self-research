// State transitions for the introductory quest use the existing chapter and Boss records.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const window = {};
vm.runInNewContext(fs.readFileSync('assets/quest.js', 'utf8'), { window }, { timeout: 2000 });
const state = window.StudyIntroQuest.state;
const pageChapters = Array.from(fs.readFileSync('papers/2601.18642/index.html', 'utf8').matchAll(/data-done="([^"]+)"/g), m => m[1]);
assert.deepEqual(Array.from(window.StudyIntroQuest.chapters), pageChapters, 'quest definition follows canonical paper sections');
const required = ['s-route', 's-problem', 's-method', 's-boss'];
const accepted = { version:1, accepted:true, required };
assert.equal(state({}, [], false), '未接取');
assert.equal(state(accepted, required.slice(0, 3), false), '進行中');
assert.equal(state(accepted, required, false), '進行中', 'reading alone cannot claim the challenge');
assert.equal(state(accepted, required.slice(0, 3), true), '進行中', 'Boss alone cannot skip reading');
assert.equal(state(accepted, required, true), '可回報');
assert.equal(state({ ...accepted, reported:true }, required, true), '已完成');
assert.equal(state({ ...accepted, reported:true }, [], false), '已完成', 'earned completion survives a partial remote snapshot');
console.log('Intro quest: 7 state transitions passed.');
