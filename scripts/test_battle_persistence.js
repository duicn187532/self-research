// A failed durable write must not grant a battle win or a title.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('assets/battle.js', 'utf8');
function segment(from, to) {
  const a = source.indexOf(from), b = source.indexOf(to, a);
  assert.ok(a >= 0 && b > a, 'source segment exists');
  return source.slice(a, b);
}
const saved = new Map(), blocked = new Set();
const copy = value => JSON.parse(JSON.stringify(value));
const S = {
  get(key, fallback) { return saved.has(key) ? copy(saved.get(key)) : fallback; },
  set(key, value) { if (blocked.has(key)) return false; saved.set(key, copy(value)); return true; }
};
const ctx = {
  S, Date, RANKS:[[1,'見習遠征者']],
  obj:value=>value && typeof value === 'object' && !Array.isArray(value) ? value : {},
  list:value=>Array.isArray(value) ? value : [],
  ymd:date=>date.toISOString().slice(0,10),
  titles:()=>S.get('study:titles',[])
};
vm.createContext(ctx);
vm.runInContext(segment('  function grant(paper, title) {','  // ---------- one battle, mounted'),ctx);
const cfg={paper:'2601.18642',key:'s-boss',tier:'boss',name:'綜合挑戰'};
const round={n:2,firstRight:2,stats:{q1:[1,1,1,1]},statsDirty:true};

blocked.add('study:2601.18642:qstat');
assert.equal(ctx.recordOutcome(cfg,round,true),false,'unsaved answers cannot grant a win');
assert.equal(saved.has('study:2601.18642:battle'),false);
blocked.delete('study:2601.18642:qstat');
blocked.add('study:2601.18642:battle');
assert.equal(ctx.recordOutcome(cfg,round,true),false,'failed battle write cannot grant a win');
assert.equal(saved.has('study:expedition'),false,'no false expedition victory');
blocked.delete('study:2601.18642:battle');
assert.equal(ctx.recordOutcome(cfg,round,true),true,'a later valid write can save the outcome');
assert.equal(saved.get('study:2601.18642:battle')['s-boss'].w,1);
assert.equal(saved.get('study:expedition')[0].win,true);

const finishCode = segment('    function finish() {','    go.addEventListener("click", start);');
const verdictCode = segment('    function verdictText(value) {','    function paintAnswer() {');
function finishWith(writeSucceeded, game = true) {
  let advanced = 0;
  const element = (tag,cls,text) => ({tag,cls,textContent:text || '',children:[],
    appendChild(child) { this.children.push(child); },focus() {}});
  const result = element('div');
  const view = {round:{hp:0,n:1,firstRight:1,log:[]},recordOutcome:()=>writeSucceeded,
    cfg:{onWin() { advanced++; }},arena:{hidden:false},result,go:{hidden:true},
    el:element,paintStatus() {},tex() {},mapleMode:()=>game,outcome:null};
  vm.runInNewContext(verdictCode + finishCode + '\nfinish();',view);
  return {advanced,verdict:result.children[0].textContent};
}
assert.equal(finishWith(false).advanced,0,'unsaved victory must not advance the quest callback');
assert.match(finishWith(false).verdict,/未能保存/);
assert.equal(finishWith(true).advanced,1,'a durable win advances once');
assert.match(finishWith(true,false).verdict,/測驗完成/,'reading skin uses study language');

blocked.add('study:titles');
assert.deepEqual(Array.from(ctx.grant(cfg.paper,'遺忘曲線馴服者')),[],
  'title is not announced if its write failed');
blocked.delete('study:titles');
assert.ok(Array.from(ctx.grant(cfg.paper,'遺忘曲線馴服者')).includes('遺忘曲線馴服者'),
  'a saved Boss win can restore its missing title');
const site = fs.readFileSync('assets/site.js','utf8');
const from = site.indexOf('  var bank = window.STUDY_QUIZ');
const to = site.indexOf('  function tierOf(s) {',from);
assert.ok(from >= 0 && to > from);
let repaired = 0;
vm.runInNewContext(site.slice(from,to),{
  paper:cfg.paper,
  store:{get:()=>({'s-boss':{w:1}})},
  window:{STUDY_QUIZ:{paper:cfg.paper,boss:{},title:'遺忘曲線馴服者'},
    StudyBattle:{titles:()=>[],grant:()=>{ repaired++; return []; }}}
});
assert.equal(repaired,1,'page load retries a title missing from a saved Boss win');
console.log('Battle persistence: failed answer, outcome and title writes handled; retry preserved the win.');
