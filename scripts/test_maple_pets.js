const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');

const sprites = JSON.parse(fs.readFileSync('assets/maple/sprites.js', 'utf8')
  .split('window.MAPLE_SPRITES = ')[1].trim().replace(/;$/, ''));
const manifest = JSON.parse(fs.readFileSync('assets/maple/collection/pets/manifest.json', 'utf8'));
assert.equal(manifest.assets.length, 6);
const expected = new Map([
  ['5000001', 'pet-puppy'], ['5000002', 'pet-pink-bunny'],
  ['5000004', 'pet-black-kitty'], ['5000008', 'pet-panda'],
  ['5000020', 'pet-yeti'], ['5000023', 'pet-penguin']
]);
for (const asset of manifest.assets) {
  const key = expected.get(asset.id);
  assert.ok(key, `selected pet ${asset.id} is recognized`);
  assert.equal(sprites[key].asset_id, asset.id);
  assert.equal(sprites[key].label, asset.name_zh_tw);
  assert.equal(sprites[key].kind, 'pet');
  for (const action of asset.actions) {
    assert.ok(['stand', 'move'].includes(action.name));
    assert.ok(action.frames.length >= 2, `${key}/${action.name} animates`);
    const [width, height, count] = sprites[key].acts[action.name];
    assert.equal(count, action.frames.length);
    const strip = fs.readFileSync(`assets/maple/spr-${key}-${action.name}.png`);
    assert.equal(strip.readUInt32BE(16), width * count);
    assert.equal(strip.readUInt32BE(20), height);
    for (const [index, frame] of action.frames.entries()) {
      assert.equal(frame.index, index);
      const png = fs.readFileSync(frame.github_path);
      assert.equal(crypto.createHash('sha256').update(png).digest('hex'), frame.sha256);
      assert.equal(png.readUInt32BE(16), frame.width);
      assert.equal(png.readUInt32BE(20), frame.height);
    }
  }
}
assert.equal(Object.values(sprites).filter(s => s.kind === 'pet').length, 8);
assert.equal(sprites['hero-7'].asset_id, '9400804');
assert.equal(sprites['hero-7'].label, '凱內西斯');
assert.equal(sprites['hero-7'].kind, 'hero');
assert.ok(fs.existsSync('assets/maple/spr-hero-7-stand.png'));
console.log('Maple pets: 6 collected kinds, 8 selectable pets, frame integrity and Kinesis source passed.');
