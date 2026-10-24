// The shelf must follow durable question and battle records after backup or sync.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('assets/battle.js','utf8');
function segment(from,to) {
  const a=source.indexOf(from), b=source.indexOf(to,a);
  assert.ok(a>=0 && b>a);
  return source.slice(a,b);
}
const records=new Map();
const S={get:(k,f)=>records.has(k)?records.get(k):f,set:(k,v)=>{records.set(k,v);return true;}};
const obj=v=>v && typeof v==='object' && !Array.isArray(v)?v:{};
const list=v=>Array.isArray(v)?v:[];
const ctx={S,obj,list,Set,Number,Object,FACETS:{method:'方法理解'},
  qstat:paper=>obj(S.get('study:'+paper+':qstat',{})),
  mastered:s=>!!s && s[2]===1 && (s[3]===1 || s[1]>=2),
  allQuestions:bank=>bank.sections.one.qs};
vm.createContext(ctx);
vm.runInContext(segment('  function summary(paper, bank) {','  function titles() {')+
  segment('  function shelfProgress(paper, cache) {','  function shelf(host, papers) {'),ctx);
const paper='2601.18642';
const bank={sections:{one:{qs:[{id:'q1',facet:'method'},{id:'q2',facet:'method'}]}}};
records.set('study:'+paper+':qstat',{q1:[1,1,1,1],q2:[1,1,1,1]});
let cache=ctx.summary(paper,bank);
assert.deepEqual(Array.from(cache.questionIds),['q1','q2']);
records.set('study:'+paper+':qstat',{q1:[1,1,0,1],q2:[1,1,1,1],obsolete:[1,1,1,1]});
records.set('study:'+paper+':battle',{'s-boss':{w:1}});
let current=ctx.shelfProgress(paper,cache);
assert.equal(current.mastered,1,'current answers override an outdated full-mastery cache');
assert.equal(current.boss,true,'Boss crown follows the saved battle rather than its cache');
assert.equal(current.exact,true,'retired question IDs do not count');
cache={total:2,mastered:2,boss:false};
records.set('study:'+paper+':qstat',{q1:[1,1,0,1],q2:[1,1,1,1]});
current=ctx.shelfProgress(paper,cache);
assert.equal(current.mastered,1,'legacy cache cannot overclaim after a wrong last answer');
assert.equal(current.exact,false,'old cache is visibly an estimate');
current=ctx.shelfProgress(paper,null);
assert.equal(current.hasWork,true,'missing cache keeps a route to saved work');
assert.equal(current.boss,true);
console.log('Shelf progress: mastery, Boss win and missing-cache recovery follow durable records.');
