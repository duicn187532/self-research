const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const saved = new Map();
const window = { addEventListener() {}, dispatchEvent() {} };
const document = { readyState:'loading', addEventListener() {} };
const localStorage = { getItem:key=>saved.get(key) ?? null };
vm.runInNewContext(fs.readFileSync('assets/world-quests.js','utf8'),
  { window, document, localStorage, CustomEvent:function () {} });
const quests = window.StudyWorldQuests.definitions;
assert.equal(quests.length,8);
assert.equal(new Set(quests.map(q=>q.paper)).size,8);
for (const quest of quests) {
  assert.equal(quest.chapters.length,6,`${quest.paper} has all six stages`);
  assert.equal(new Set(quest.chapters).size,6);
  const page = fs.readFileSync(`papers/${quest.paper}/index.html`,'utf8');
  const bankWindow = {};
  vm.runInNewContext(fs.readFileSync(`papers/${quest.paper}/quiz.js`,'utf8'),{window:bankWindow});
  const bank = bankWindow.STUDY_QUIZ;
  assert.equal(quest.reward,bank.title,`${quest.paper} reward matches the existing Boss title`);
  assert.match(page,/assets\/world-quests\.js/);
  for (const id of quest.chapters) {
    assert.ok(page.includes(`id="${id}"`),`${quest.paper} chapter ${id}`);
    assert.ok(id === 's-boss' ? bank.boss : bank.sections[id],`${quest.paper} challenge ${id}`);
  }
  const sprite=`assets/maple/spr-npc-${quest.art}-stand.png`;
  assert.ok(fs.existsSync(sprite),`${quest.npc} has a local sprite`);
  assert.equal(window.StudyWorldQuests.state(quest,{},{}),'未接取');
  assert.equal(window.StudyWorldQuests.state(quest,{accepted:true},{}),'進行中');
  const wins=Object.fromEntries(quest.chapters.map(id=>[id,{w:1}]));
  assert.equal(window.StudyWorldQuests.state(quest,{accepted:true},wins),'可回報');
  assert.equal(window.StudyWorldQuests.state(quest,{accepted:true,reported:true},wins),'已完成');
  saved.set(`study:${quest.paper}:battle`,JSON.stringify(wins));
  assert.equal(window.StudyWorldQuests.nextStage(quest),null);
  saved.delete(`study:${quest.paper}:battle`);
}
console.log('World quests: eight NPCs have valid research stages, battle gates and recoverable state.');
