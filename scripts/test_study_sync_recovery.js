// Regression tests for logout, cloud conflict safety, and browser-stored history restoration.
// Run: node scripts/test_study_sync_recovery.js
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('assets/study-sync.js', 'utf8');
function between(start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a);
  assert.ok(a >= 0 && b > a, 'source markers: ' + start + ' / ' + end);
  return source.slice(a, b);
}
function storage() {
  const cache = new Map();
  return {
    cache,
    get length() { return cache.size; },
    key(i) { return Array.from(cache.keys())[i] || null; },
    getItem(k) { return cache.has(k) ? cache.get(k) : null; },
    setItem(k, v) { cache.set(k, String(v)); },
    removeItem(k) { cache.delete(k); }
  };
}
const localStorage = storage();
const downloads = [];
const ctx = {
  localStorage, scope:'self-research', userId:'test-user', session:{},
  syncing:false, needsReload:false, lastSync:0, status:'', initial:true,
  schema:'study_sync_entries', ownerKey:'__study_sync_owner_v1:self-research',
  meta:{}, conflicts:{}, ui:{}, Map, Set, Date, JSON, Object, Array,
  URL:{createObjectURL() { return 'blob:backup'; }, revokeObjectURL() {}},
  Blob:class {constructor(payload) { this.payload = payload; }},
  document:{createElement() {return {click() { downloads.push('downloaded'); }};}},
  window:{confirm() { return true; }},
  setTimeout() {},
  render() {},
  storeMeta() {},
  location:{reload() {}}
};
vm.createContext(ctx);
vm.runInContext(
  between('  function read(key, fallback) {', '  function styleUi() {') +
  between('  function recoverySnapshots() {', '  function backup() {') +
  between('  async function logout() {', '  function switchUser(') +
  between('  function switchUser(next, user) {', '  function storeMeta() {') +
  between('  async function cas(key, value, revision) {', '  async function setup() {'),
  ctx, {timeout:2000}
);
const key = 'study:fade:done';
const packed = list => JSON.stringify(list);
const mockCloud = rows => {
  const writes = [];
  let signedOut = false;
  ctx.client = {
    from() { return {select() { return {async eq() {return {data:rows}; }}; }}; },
    async rpc(_, args) {
      writes.push(args);
      assert.notEqual(args.p_value, null, 'RPC must never receive a NULL deletion');
      return {data:[{applied:true,revision:args.p_expected_revision+1,value:args.p_value}]};
    },
    auth:{async signOut(){ signedOut = true; return {error:null}; }}
  };
  return {writes, didSignOut:()=>signedOut};
};
function reset() {
  localStorage.cache.clear();
  ctx.userId='test-user';
  ctx.meta={}; ctx.conflicts={}; ctx.syncing=false; ctx.needsReload=false;
  ctx.lastSync=0; ctx.status='';
  ctx.ui={};
  downloads.length=0;
}
(async () => {
  // 1. Missing local record with live cloud progress: always restore, never erase it.
  reset();
  let cloud = mockCloud([{storage_key:key,value:packed(['s1','s2']),revision:3}]);
  assert.equal(await ctx.sync(true), false, 'download requires reload');
  assert.equal(localStorage.getItem(key), packed(['s1','s2']));
  assert.equal(cloud.writes.length, 0);

  // 2. Historic NULL cloud value and existing local progress: safely republish live work.
  reset();
  localStorage.setItem(key, packed(['s1','s2']));
  cloud = mockCloud([{storage_key:key,value:null,revision:5}]);
  assert.equal(await ctx.sync(true), true);
  assert.equal(cloud.writes.length, 1);
  assert.equal(cloud.writes[0].p_value, packed(['s1','s2']));
  assert.equal(cloud.writes[0].p_expected_revision, 5);

  // 3. Blank local and historic NULL cloud value never send NULL CAS.
  reset();
  cloud = mockCloud([{storage_key:key,value:null,revision:5}]);
  assert.equal(await ctx.sync(true), true);
  assert.equal(cloud.writes.length, 0);

  // 4. An empty *non-NULL* remote is a conflict, never a destructive download.
  reset();
  localStorage.setItem(key,packed(['s1','s2']));
  ctx.meta[key]={revision:3,base:packed(['s1','s2'])};
  cloud = mockCloud([{storage_key:key,value:'[]',revision:4}]);
  assert.equal(await ctx.sync(true), false);
  assert.equal(localStorage.getItem(key),packed(['s1','s2']));
  assert.ok(ctx.conflicts[key], 'remote empty value must ask the user to resolve');

  // 4b. An explicit decision to retain local work must allow the next CAS upload,
  // rather than rediscovering the same blank remote conflict forever.
  ctx.meta[key] = {revision:4, base:'[]'};
  ctx.conflicts = {};
  cloud = mockCloud([{storage_key:key,value:'[]',revision:4}]);
  assert.equal(await ctx.sync(true), true);
  assert.equal(cloud.writes.length, 1);
  assert.equal(cloud.writes[0].p_value, packed(['s1','s2']));

  // 5. Previously saved logout backup is discoverable for the SAME signed-in user.
  reset();
  const snapshotKey='__study_sync_logout_backup:self-research:test-user:1000';
  localStorage.setItem(snapshotKey,JSON.stringify({
    exported:'2026-10-24T01:00:00Z',entries:{[key]:packed(['s1','s2'])}
  }));
  localStorage.setItem('__study_sync_logout_backup:self-research:other-account:1001',
    JSON.stringify({entries:{[key]:packed(['different'])}}));
  const snaps=ctx.recoverySnapshots();
  assert.equal(snaps.length,1);
  assert.equal(snaps[0].progress,2);

  // 6. Restore merges valid progress and writes rollback point before changing data.
  localStorage.setItem(key,packed(['s1']));
  ctx.ui.recoverySelect={value:snapshotKey};
  ctx.restoreSnapshot();
  assert.deepEqual(JSON.parse(localStorage.getItem(key)),['s1','s2']);
  assert.equal(ctx.needsReload,true);
  assert.ok(Array.from(localStorage.cache.keys()).some(k =>
    k.startsWith('__study_sync_before_restore:self-research:test-user:')));
  assert.ok(downloads.length, 'recovery exports a safety copy');

  // 7. Logout is rejected while reload pending, and never clears learning work.
  cloud=mockCloud([]);
  await ctx.logout();
  assert.equal(cloud.didSignOut(),false);
  assert.equal(localStorage.getItem(key),packed(['s1','s2']));

  // 8. Successful synced logout first persists a recoverable history record.
  reset();
  localStorage.setItem(key,packed(['s1','s2']));
  cloud=mockCloud([{storage_key:key,value:packed(['s1','s2']),revision:4}]);
  await ctx.logout();
  assert.equal(cloud.didSignOut(),true);
  assert.equal(localStorage.getItem(key),null);
  assert.ok(Array.from(localStorage.cache.keys()).some(k =>
    k.startsWith('__study_sync_logout_backup:self-research:test-user:')));
  // 9. Quest completion on either device must survive a conflicting sync.
  const questKey='study:quest:fademem-v1';
  const remoteQuest=JSON.stringify({version:1,accepted:true,reported:true,required:['s-route'],acceptedAt:'2026-10-20T00:00:00Z'});
  const localQuest=JSON.stringify({version:1,accepted:true,reported:false,required:['s-route','s-boss'],acceptedAt:'2026-10-21T00:00:00Z'});
  const merged=JSON.parse(ctx.mergeValues(questKey,remoteQuest,localQuest));
  assert.equal(merged.reported,true);
  assert.deepEqual(merged.required,['s-route','s-boss']);
  assert.equal(merged.acceptedAt,'2026-10-20T00:00:00Z');
  const v2=JSON.parse(ctx.mergeValues('study:quest:fademem-v2',
    JSON.stringify({version:2,accepted:true,reported:true}),
    JSON.stringify({version:2,accepted:true,reported:false})));
  assert.equal(v2.reported,true);
  const townQuest=JSON.parse(ctx.mergeValues('study:quest:2501.13956:v1',
    JSON.stringify({version:1,accepted:true,reported:true,acceptedAt:'2026-10-20'}),
    JSON.stringify({version:1,accepted:true,reported:false,acceptedAt:'2026-10-21'})));
  assert.equal(townQuest.reported,true);
  assert.equal(townQuest.acceptedAt,'2026-10-20');
  assert.equal(Object.hasOwn(townQuest,'required'),false);
  const uncertain=JSON.parse(ctx.mergeValues('study:fade:qstat',
    JSON.stringify({q1:[2,1,1,1]}),JSON.stringify({q1:[3,1,0,1]})));
  assert.equal(uncertain.q1[2],0,'conflicting last-answer flags cannot claim mastery');
  const last=JSON.parse(ctx.mergeValues('study:fade:last',
    JSON.stringify({id:'s-boss',at:20}),JSON.stringify({id:'s-problem',at:10})));
  assert.equal(last.id,'s-boss','resume from the most recently visited section');
  assert.equal(JSON.parse(ctx.mergeValues('study:fade:completedAt',
    JSON.stringify('2026-10-24T09:00:00.000Z'), JSON.stringify('2026-10-23T09:00:00.000Z'))),
    '2026-10-23T09:00:00.000Z','cloud merge keeps the earliest completion date');
  // 10. The same account recovers its lesson records after the logout clear.
  reset();
  ctx.userId=null; ctx.initialized=false; ctx.migrateLegacyId=()=>{};
  localStorage.setItem(ctx.ownerKey,'guest');
  cloud=mockCloud([
    {storage_key:key,value:packed(['s1','s2']),revision:4},
    {storage_key:'study:fade:exp',value:'350',revision:2},
    {storage_key:questKey,value:remoteQuest,revision:3}
  ]);
  ctx.switchUser('test-user',{id:'test-user'});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(localStorage.getItem(key),packed(['s1','s2']));
  assert.equal(localStorage.getItem('study:fade:exp'),'350');
  assert.equal(JSON.parse(localStorage.getItem(questKey)).reported,true);
  assert.equal(ctx.needsReload,true);
  assert.equal(cloud.writes.length,0);
  console.log('Study sync recovery: 10 data-preservation scenarios passed.');
})().catch(err=>{console.error(err);process.exitCode=1;});
