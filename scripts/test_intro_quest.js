// The quest must follow real FadeMem challenge wins and preserve earlier quest progress.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const window = {};
const saved = new Map();
const localStorage = { getItem:k=>saved.has(k)?saved.get(k):null };
vm.runInNewContext(fs.readFileSync('assets/quest.js','utf8'), {window,localStorage}, {timeout:2000});
const quest = window.StudyIntroQuest;
const ids = Array.from(quest.stages, stage=>stage.id);
const html = fs.readFileSync('papers/2601.18642/index.html','utf8');
const pageIds = Array.from(html.matchAll(/data-done="([^"]+)"/g), match=>match[1]);
ids.forEach(id=>assert.ok(pageIds.includes(id),'quest section exists: '+id));
const quizWindow = {};
vm.runInNewContext(fs.readFileSync('papers/2601.18642/quiz.js','utf8'),{window:quizWindow},{timeout:2000});
ids.forEach(id=>assert.ok(id==='s-boss'?quizWindow.STUDY_QUIZ.boss:quizWindow.STUDY_QUIZ.sections[id],
  'every quest stage has a verified challenge: '+id));
const wins = Object.fromEntries(ids.map(id=>[id,{w:1}]));
assert.equal(quest.state({},{}),'未接取');
assert.equal(quest.state({accepted:true},{}),'進行中');
ids.forEach(id=>{
  const partial = {...wins}; delete partial[id];
  assert.equal(quest.state({accepted:true},partial),'進行中','missing '+id+' blocks report');
});
assert.equal(quest.state({},wins),'可回報','direct paper learning can be reported without a second acceptance step');
assert.equal(quest.state({accepted:true},wins),'可回報');
assert.equal(quest.state({reported:true},{}),'已完成','earned report does not disappear with a partial snapshot');
saved.set('study:2601.18642:battle',JSON.stringify({'s-problem':{w:1}}));
assert.equal(quest.nextStage().id,'s-decay','a win points at the next knowledge challenge');
saved.set('study:2601.18642:battle',JSON.stringify(wins));
assert.equal(quest.nextStage(),null,'all six wins lead back to the NPC for report');
saved.set('study:quest:fademem-v1',JSON.stringify({version:1,accepted:true,reported:true}));
saved.set('study:quest:fademem-v2',JSON.stringify({version:2,accepted:true,reported:false}));
assert.equal(quest.readProgress().reported,true,'old completion survives the new quest format');
console.log('Intro quest: six real challenge links, state transitions and v1 recovery passed.');
