// The map must point at real papers/scenes; the new challenge must judge order, not clicks alone.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');

const worldSource = fs.readFileSync('assets/world.js', 'utf8');
const worldWindow = {};
vm.runInNewContext(worldSource, {
  window: worldWindow,
  document: { readyState: 'loading', addEventListener() {} },
  localStorage: { getItem() { throw new Error('map must be safe without storage'); } }
});
const places = Array.from(worldWindow.StudyWorld.places);
assert.equal(places.length, 9);
assert.equal(new Set(places.map(place => place.id)).size, 9);
assert.equal(places.filter(place => place.npc).length, 0);
const shelf = fs.readFileSync('index.html', 'utf8');
assert.match(shelf, /class="world-quest-host"/);
assert.match(shelf, /id="research-codex"/);
assert.match(shelf, /id="paper-catalog"/);
assert.match(shelf, /src="assets\/world-quests\.js/);
assert.match(shelf, /src="assets\/reading-lab\.js/);
const dimensions = {};
vm.runInNewContext(fs.readFileSync('assets/reading-lab.js','utf8'),
  {window:dimensions,document:{querySelector:()=>null}});
assert.equal(Object.keys(dimensions.StudyResearchDimensions).length, 9);
for (const rows of Object.values(dimensions.StudyResearchDimensions)) assert.equal(rows.length, 5);
for (const place of places) {
  assert.ok(fs.existsSync(path.join('assets/maple', `scene-${place.scene}-sm.jpg`)), `scene ${place.scene}`);
  assert.ok(fs.existsSync(path.join('papers', place.id, 'index.html')), `paper ${place.id}`);
  assert.ok(shelf.includes(`data-progress-for="${place.id}"`), `shelf card ${place.id}`);
}

const ctx = {
  object: value => value && typeof value === 'object' && !Array.isArray(value) ? value : {},
  validSection: id => typeof id === 'string' && /^s-[a-z0-9-]+$/.test(id),
  dateNow: () => '2026-10-24', Object, Number
};
const from = worldSource.indexOf('  function battles('), to = worldSource.indexOf('  function mount()', from);
assert.ok(from > 0 && to > from);
vm.runInNewContext(worldSource.slice(from, to), ctx);
const record = { toc:[['s-decay', '衰減函數']], grasp:{
  's-decay':{due:'2026-10-23'}, 's-future':{due:'2026-10-25'},
  '../../bad':{due:'2026-10-01'}, 's-unknown':{due:'2026-10-01'} },
  battle:{'s-decay':{w:1}, 's-boss':{l:1}, '../../bad':{w:99}} };
assert.deepEqual(Array.from(ctx.battles(record)), ['s-decay', 's-boss']);
assert.deepEqual(Array.from(ctx.dueChapters(places[0], record), row => row.id), ['s-decay']);
assert.equal(ctx.nextUnread({toc:[['s-problem','問題'],['s-decay','衰減']],
  done:['s-problem'], last:{id:'s-problem',at:123}}), 's-decay',
  'a completed last chapter cannot be the next reading suggestion');

const battleSource = fs.readFileSync('assets/battle.js', 'utf8');
const a = battleSource.indexOf('  function sequenceCorrect('), b = battleSource.indexOf('  var FACETS', a);
assert.ok(a > 0 && b > a);
const battleCtx = {};
vm.runInNewContext(battleSource.slice(a, b), battleCtx);
assert.equal(battleCtx.sequenceCorrect([0, 1, 2, 3], 4), true);
assert.equal(battleCtx.sequenceCorrect([1, 0, 2, 3], 4), false);
assert.equal(battleCtx.sequenceCorrect([0, 1, 2], 4), false);
assert.equal(battleCtx.sequenceCorrect([0, 0, 2, 3], 4), false);
const quizWindow = {};
vm.runInNewContext(fs.readFileSync('papers/2601.18642/quiz.js', 'utf8'), { window:quizWindow });
const chapter = quizWindow.STUDY_QUIZ.sections['s-decay'];
assert.equal(chapter.ask, chapter.qs.length, 'quest chapter always includes the application challenge');
assert.ok(chapter.qs.some(q => q.kind === 'sequence' && q.steps.length === 4));
const sequence = chapter.qs.find(q => q.kind === 'sequence');
const boardFrom = battleSource.indexOf('  function board(host, paper, bank, names) {');
const boardTo = battleSource.indexOf('  // ---------- the shelf', boardFrom);
assert.ok(boardFrom > 0 && boardTo > boardFrom);
const makeNode = (tag, cls, value) => ({tag, className:cls || '', textContent:value || '', children:[],
  appendChild(child) { this.children.push(child); }});
const boardCtx = {
  el:makeNode, html:makeNode, bar:()=>makeNode('div','bt-meter'),
  summary:()=>({mastered:0,total:1,facets:{method:[0,1],reason:[0,0],critique:[0,0]},cleared:0,chapters:1}),
  titles:()=>[], S:{get:()=>[]}, list:value=>Array.isArray(value)?value:[],
  qstat:()=>({[sequence.id]:[1,0,0,0]}), allQuestions:()=>[sequence],
  FACETS:{method:'方法理解',reason:'公式與情境推理',critique:'實驗批判'},
  document:{createTextNode:text=>makeNode('#text','',text)}, tex() {}
};
vm.runInNewContext(battleSource.slice(boardFrom, boardTo), boardCtx);
const board = makeNode('div');
boardCtx.board(board,'2601.18642',{title:'遺忘曲線馴服者'}, {'s-decay':'衰減函數','s-importance':'重要性分數'});
const answer = board.children.find(node=>node.className==='bt-redo').children.find(node=>node.className==='bt-ra');
assert.equal(answer.children[0].children.length, 4, 'wrong sequence remains reviewable at the Boss board');
const siteSource = fs.readFileSync('assets/site.js','utf8');
const awardFrom = siteSource.indexOf('  function award() {'), awardTo = siteSource.indexOf('\n  allDone.last = allDone();', awardFrom);
assert.ok(awardFrom > 0 && awardTo > awardFrom);
const writes = [];
const progressCtx = {
  now:{exp:0,lv:1}, mine:0, others:0, EXP_KEY:'study:fade:exp', COMPLETED_AT_KEY:'study:fade:completedAt',
  paperExp:()=>10, levelOf:()=>({exp:10,lv:1}),
  allDone:()=>true, store:{get:()=>null,set:(key,value)=>{writes.push([key,value]);return true;}},
  refreshProfile() {}, renderProgress() {}, jobOf:()=> '初心者', Date
};
progressCtx.allDone.last = false;
vm.runInNewContext(siteSource.slice(awardFrom,awardTo),progressCtx);
assert.equal(progressCtx.award().finished,true);
assert.equal(writes.filter(([key])=>key===progressCtx.COMPLETED_AT_KEY).length,1);
progressCtx.award();
assert.equal(writes.filter(([key])=>key===progressCtx.COMPLETED_AT_KEY).length,1,
  'completion date is not overwritten by later rewards');
console.log('World learning: nine valid scenes, derived records and mandatory sequence challenge passed.');
