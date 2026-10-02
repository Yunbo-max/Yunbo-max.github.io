import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const { createNavigation } = await import('../assets/lab/navigation-model.mjs').catch(error => {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
  return {};
});

const fixture = () => ({
  nodes: [{id:'pilot'}, {id:'debug'}, {id:'confirm'}],
  edges: [{from:'pilot',to:'debug'}, {from:'debug',to:'pilot'}, {from:'pilot',to:'confirm'}, {from:'debug',to:'confirm'}],
  scenarios: [
    {id:'repair',steps:[{node:'pilot'},{node:'debug',kind:'reroute'},{node:'pilot'},{node:'confirm'}]},
    {id:'review',steps:[{node:'debug'},{node:'confirm'}]}
  ]
});

function navigator() {
  assert.equal(typeof createNavigation, 'function', 'The playable route controller is not implemented');
  return createNavigation(fixture(), 'repair');
}

test('paused playback stays still and a repair route revisits the pilot in order', () => {
  const nav = navigator();
  nav.tick();
  assert.equal(nav.snapshot().current.node, 'pilot');
  nav.play(); nav.tick();
  assert.equal(nav.snapshot().current.node, 'debug');
  assert.equal(nav.snapshot().current.kind, 'reroute');
  nav.pause(); nav.tick();
  assert.equal(nav.snapshot().index, 1);
  nav.play(); nav.tick();
  assert.equal(nav.snapshot().current.node, 'pilot');
  assert.equal(nav.snapshot().index, 2);
  assert.deepEqual(nav.snapshot().visited, ['pilot','debug','pilot']);
});

test('the last stop ends playback and replay starts a fresh route', () => {
  const nav = navigator();
  nav.play(); nav.tick(); nav.tick(); nav.tick(); nav.tick();
  assert.equal(nav.snapshot().current.node, 'confirm');
  assert.equal(nav.snapshot().playing, false);
  assert.equal(nav.snapshot().next, null);
  nav.next();
  assert.equal(nav.snapshot().index, 3);
  nav.play();
  assert.equal(nav.snapshot().index, 0);
  assert.deepEqual(nav.snapshot().visited, ['pilot']);
  assert.equal(nav.snapshot().playing, true);
});

test('switching examples and choosing a stop cancel the previous playback', () => {
  const nav = navigator();
  nav.play(); nav.tick();
  nav.chooseScenario('review'); nav.tick();
  assert.equal(nav.snapshot().scenario.id, 'review');
  assert.equal(nav.snapshot().current.node, 'debug');
  assert.equal(nav.snapshot().playing, false);
  nav.play(); nav.seek(1); nav.tick();
  assert.equal(nav.snapshot().current.node, 'confirm');
  assert.equal(nav.snapshot().playing, false);
  nav.reset();
  assert.equal(nav.snapshot().index, 0);
  assert.deepEqual(nav.snapshot().visited, ['debug']);
  assert.throws(() => nav.seek(-1), /stop/i);
  assert.throws(() => nav.seek(2), /stop/i);
});

test('a route cannot navigate through a missing task or a disconnected handoff', () => {
  navigator();
  const broken = fixture();
  broken.edges = broken.edges.filter(edge => edge.to !== 'debug');
  assert.throws(() => createNavigation(broken,'repair'), /connection/i);
  const unknown = fixture();
  unknown.scenarios[0].steps[0].node = 'missing';
  assert.throws(() => createNavigation(unknown,'repair'), /task/i);
});

test('published examples are connected, include repair, and contain only public demo fields', async () => {
  navigator();
  const data = JSON.parse(await readFile(new URL('../assets/lab/navigation-demo.json',import.meta.url),'utf8'));
  assert.equal(data.kind,'illustrative-navigation');
  assert.equal(data.regions.length,16);
  assert.equal(data.scenarios.length,3);
  for (const scenario of data.scenarios) createNavigation(data,scenario.id);
  const repair = data.scenarios.find(s => s.id === 'pilot-repair');
  assert.ok(repair.steps.some(s => s.kind === 'reroute'));
  assert.ok(new Set(repair.steps.map(s => s.node)).size < repair.steps.length);
  const allowed = {
    root:new Set(['kind','regions','nodes','edges','scenarios']),
    regions:new Set(['id','name','color','col','row']),
    nodes:new Set(['id','region','label']),
    edges:new Set(['from','to']),
    scenarios:new Set(['id','title','question','resources','steps']),
    steps:new Set(['node','note','kind'])
  };
  const check = (object,type) => Object.keys(object).forEach(key => assert.ok(allowed[type].has(key),`Non-public ${type} field: ${key}`));
  check(data,'root');
  for (const type of ['regions','nodes','edges','scenarios']) for (const object of data[type]) check(object,type);
  for (const scenario of data.scenarios) for (const step of scenario.steps) check(step,'steps');
});
