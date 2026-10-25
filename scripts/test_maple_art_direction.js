const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('assets/site.js', 'utf8');
function literal(name) {
  const match = source.match(new RegExp(`var ${name} = (\\{[\\s\\S]*?\\n  \\});`));
  assert.ok(match, `${name} remains available for scene review`);
  return vm.runInNewContext('(' + match[1] + ')');
}
const cast = literal('PAPER_CAST');
const scenes = literal('PAPER_SCENES');
const sprites = JSON.parse(fs.readFileSync('assets/maple/sprites.js', 'utf8')
  .split('window.MAPLE_SPRITES = ')[1].trim().replace(/;$/, ''));
const manifest = JSON.parse(fs.readFileSync('assets/maple/collection/manifest.json', 'utf8'));
const window = { addEventListener() {} };
const document = { readyState:'loading', addEventListener() {} };
vm.runInNewContext(fs.readFileSync('assets/world.js', 'utf8'), { window, document });
vm.runInNewContext(fs.readFileSync('assets/world-quests.js', 'utf8'), { window, document });

const places = window.StudyWorld.places;
const quests = window.StudyWorldQuests.definitions;
const familiarGuests = new Set([
  ...Array.from({length:7}, (_, i) => `hero-${i + 1}`),
  'npc-bowman','npc-hines','npc-strategist','npc-lucid','npc-dark-lord',
  'npc-kyrin','npc-dances-with-balrog','npc-elder-stan',
  'npc-knight-mihile','npc-knight-oz','npc-knight-irena',
  'npc-knight-eckhart','npc-knight-hawkeye',
  'npc-tatamo','npc-knight','npc-wind','npc-flame','npc-night','npc-thunder'
]);
assert.equal(places.length, 9);
assert.equal(Object.keys(cast).length, places.length);
const originalIds = places.map(p => p.id).filter(id => !['2604.20006','2610.09008'].includes(id));
const originalScenes = new Set(originalIds.map(id => scenes[id][0]));
const originalGuides = new Set(originalIds.map(id => cast[id].guide));
const originalBosses = new Set(originalIds.map(id => cast[id].boss));
const originalMobs = new Set(originalIds.flatMap(id => cast[id].mobs));
for (const id of ['2604.20006','2610.09008']) {
  assert.ok(!originalScenes.has(scenes[id][0]), `${id} adds a new town`);
  assert.ok(!originalGuides.has(cast[id].guide), `${id} adds a new lead NPC`);
  assert.ok(!originalBosses.has(cast[id].boss), `${id} adds a new boss`);
  assert.ok(cast[id].mobs.every(m => !originalMobs.has(m)), `${id} uses fresh chapter mobs`);
}
for (const place of places) {
  const region = cast[place.id];
  assert.ok(region, `${place.id} has an authored regional cast`);
  assert.equal(scenes[place.id][0], place.scene, `${place.name} opens in its own scene`);
  assert.equal(sprites[region.guide].kind, 'npc', `${place.name} guide exists`);
  assert.equal(sprites[region.boss].kind, 'boss', `${place.name} boss exists`);
  if (!['2501.13956','2608.19652','2606.30306'].includes(place.id))
    assert.ok(region.readers.grad.includes(region.guide), `${place.name} established guide joins graduate reading`);
  assert.ok(region.readers.kid.length >= 4, `${place.name} rotates child-level speakers`);
  assert.ok(region.readers.uni.length >= 3, `${place.name} rotates university-level speakers`);
  assert.ok(region.readers.grad.length >= 5, `${place.name} rotates graduate-level speakers`);
  assert.ok(region.checks.length >= 4, `${place.name} rotates self-check speakers`);
  const voices = [...region.readers.kid, ...region.readers.uni, ...region.readers.grad, ...region.checks];
  assert.ok(new Set(voices).size >= 10, `${place.name} has a varied reading cast`);
  for (const key of voices) {
    assert.ok(familiarGuests.has(key), `${place.name} reader ${key} is in the recognizable cast`);
    assert.ok(['npc', 'hero'].includes(sprites[key]?.kind), `${place.name} reader ${key} exists`);
    assert.ok(fs.existsSync(`assets/maple/spr-${key}-stand.png`), `${key} has portrait art`);
  }
  assert.ok(region.mobs.length >= 2, `${place.name} has multiple local enemies`);
  for (const key of [...region.mobs, region.boss]) {
    assert.ok(sprites[key], `${place.name} sprite ${key} exists`);
    assert.ok(fs.existsSync(`assets/maple/spr-${key}-stand.png`), `${key} has display art`);
  }
  const quest = quests.find(q => q.paper === place.id);
  if (!quest) continue; // The original Ellinia quest is mounted separately.
  assert.equal(quest.town, place.name, `${place.id} uses one town name`);
  assert.equal(`npc-${quest.art}`, region.guide, `${place.name} quest and lesson use one guide`);
  assert.equal(quest.npc, sprites[region.guide].label, `${place.name} guide has one displayed name`);
  assert.deepEqual(Array.from(quest.frame), sprites[region.guide].acts.stand.slice(0, 2),
    `${place.name} portrait frame matches the collected sprite`);
}
assert.equal(sprites['npc-cleaner'], undefined, 'the cleaner is no longer a speaking NPC');
function seedOf(str) { let h = 7; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; }
for (const [paper, region] of Object.entries(cast)) {
  const chapter = i => ['kid','uni','grad'].map(role => {
    const pool = region.readers[role];
    return pool[(i + seedOf(paper + ':' + role)) % pool.length];
  });
  const seen = new Set();
  for (let i = 0; i < 15; i++) {
    assert.equal(new Set(chapter(i)).size, 3, `${paper} chapter ${i} has distinct speakers`);
    assert.notDeepEqual(chapter(i), chapter(i + 1), `${paper} adjacent chapters rotate speakers`);
    const trio = chapter(i).join('|');
    assert.ok(!seen.has(trio), `${paper} does not repeat an entire trio within 15 chapters`);
    seen.add(trio);
  }
}
assert.ok(Object.values(cast).some(region => region.checks.some(key => key.startsWith('npc-knight-'))),
  'Cygnus knights appear in self-checks');
assert.ok(Object.values(cast).some(region => region.readers.uni.some(key => key.startsWith('hero-'))),
  'heroes appear in university reading');
for (const [paper, npcId, mapId] of [
  ['2501.13956', '2041004', 220000000],
  ['2608.19652', '3003202', 450003000]
]) {
  const guide = sprites[cast[paper].guide];
  assert.equal(guide.asset_id, npcId);
  const asset = manifest.assets.find(a => a.type === 'npc' && a.id === npcId);
  assert.ok(asset.source_locations.some(loc => loc.id === mapId),
    `${guide.label} is recorded in the selected town`);
}
assert.equal(cast['2608.19652'].boss, 'boss-lucid', 'Lucid appears as the Lachelein boss');
console.log('Maple art direction: 9 town scenes, four reading roles, guest portraits and source locations match.');
