'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const published = fs.existsSync(path.join(root, 'index.html'));
const source = fs.readFileSync(path.join(root, published ? 'index.html' : 'planner.js'), 'utf8');
const data = published ? JSON.parse(source.match(/^const DATA = (.*);\s*$/m)[1]) : JSON.parse(fs.readFileSync(path.join(root, 'calculator-data.json'), 'utf8'));
function fn(name) {
  const hit = source.match(new RegExp('function ' + name + '\\([^]*?\\n\\}'));
  assert.ok(hit, 'production function ' + name + ' exists');
  return hit[0];
}
function environment(cls = 'Mage', phase = 'p1') {
  const box = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'planner-data.js'), 'utf8'), box);
  const PL = box.window.PLANNER;
  const p = data.paths.find(p => p.cls === cls && p.faction === 'Alliance');
  const spec = Object.keys(PL.specs).find(k => PL.specs[k].cls === cls);
  Object.assign(box, { PL, DATA: data, state: {}, plHas: (o,k) => Object.hasOwn(o,k), plSpecKey: () => spec,
    plLegalTalents: () => [], plParseTalents: () => [], plPreset: () => [], plEnchCandidates: () => [],
    plFightChoice: () => 'legacy', plProfList: () => [], plAutofill: () => {} });
  const declarations = ['PL_SLOTS', 'PL_CLASS_ID', 'PL_ARMOR_SLOTS'].map(k => source.match(new RegExp('const ' + k + '=[^\\n]+'))[0]).join('\n');
  vm.runInNewContext(declarations + '\n' + (source.match(/let plItemIdx=[^\n]+/)||[''])[0] + '\n' + source.match(/const plItem=id=>[^\n]+/)[0] + '\n' +
    'const plPhase=()=>PL.phases[state.pl.phase];const plLevel=()=>plPhase().level;\n' + ['plAllowed','plCandidates','plOneWeaponSet','plRestore'].map(fn).join('\n'), box);
  const slots = vm.runInNewContext('PL_SLOTS.map(x=>x[0])', box);
  const item = (extra = {}) => { const it = { id: 900000 + PL.items.length, n: 'Synthetic test gear', t: 1, a: 1, il: 1, ph: 1, s: {}, ...extra }; PL.items.push(it); return it; };
  const restore = gear => {
    box.state.pl = { path: p.name, spec, phase, ver: PL.treeVer, gearStr: slots.map(n=>gear[n]||'').join(','), enchStr:'', raid:false, pvp:false };
    box.plRestore();
    return box.state.pl;
  };
  return { box, PL, item, restore };
}
test('legal linked gear and deliberate empty slots stay intact', () => {
  const e=environment(), head=e.item(), ring=e.item({t:11});
  const state=e.restore({Head:head.id,'Ring 1':ring.id,'Ring 2':ring.id});
  assert.equal(state.gear.Head,head.id);assert.equal(state.gear['Ring 2'],ring.id);
  assert.equal(state.lock.Neck,0);assert.equal(state.lock.Head,head.id);
});
test('wrong slot and class cannot add item stats', () => {
  const e=environment(), wrongSlot=e.item({t:13,h:4,w:9}), wrongClass=e.item({c:[9]});
  assert.deepEqual(Object.keys(e.restore({Head:wrongSlot.id,Neck:wrongClass.id}).gear),[]);
  assert.equal(e.restore({Head:wrongClass.id}).gear.Head,undefined);
});
test('wrong faction, armor and phase gear are discarded', () => {
  for(const extra of [{f:2},{a:4},{ph:2},{il:1000}]){
    const e=environment(), it=e.item(extra);assert.equal(e.restore({Head:it.id}).gear.Head,undefined);
  }
});
test('known raid and PvP gear stay when suggestion switches are off', () => {
  const e=environment(), it=e.item({raid:1,pvp:1});
  assert.equal(e.restore({Head:it.id}).gear.Head,it.id);
});
test('raid gear cannot appear before the selected phase opens raids', () => {
  const e=environment('Mage','l60'), it=e.item({raid:1});assert.equal(e.restore({Head:it.id}).gear.Head,undefined);
});
test('unique duplicates are removed while ordinary duplicate rings are legal', () => {
  const e=environment(), it=e.item({t:11,u:1}), state=e.restore({'Ring 1':it.id,'Ring 2':it.id});
  assert.equal(state.gear['Ring 1'],it.id);assert.equal(state.gear['Ring 2'],undefined);
});
test('two-handed main weapon clears a linked offhand', () => {
  const e=environment('Warrior'), mh=e.item({t:13,h:4,w:9}), oh=e.item({t:13,h:3,w:9});
  const state=e.restore({'Main hand':mh.id,'Off hand':oh.id});
  assert.equal(state.gear['Main hand'],mh.id);assert.equal(state.gear['Off hand'],undefined);
});
test('empty and unknown item links do not crash', () => {
  const e=environment();assert.deepEqual(Object.keys(e.restore({Head:123456789}).gear),[]);assert.deepEqual(Object.keys(e.restore({}).gear),[]);
});
