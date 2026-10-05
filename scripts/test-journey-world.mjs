import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TOUR, earthPoint, pointOnPath, journeyAt, makeWorld } from '../assets/lab/journey-world.mjs';

const distance = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]));

test('the trip is a continuous closed route with actual changes of transport', () => {
  assert.equal(TOUR.length, 16);
  assert.deepEqual(new Set(TOUR.map(leg => leg.vehicle)), new Set(['train', 'boat', 'car']));
  for (let i = 0; i < TOUR.length; i++) {
    const leg = TOUR[i], next = TOUR[(i + 1) % TOUR.length];
    assert.ok(leg.duration > 0);
    assert.ok(distance(earthPoint(...leg.path.at(-1)), earthPoint(...next.path[0])) < 1e-8);
    assert.ok(leg.vehicle !== 'boat' || ['sea', 'river'].includes(leg.terrain));
    assert.ok(leg.vehicle !== 'train' || leg.terrain === 'rail');
  }
});

test('ocean travel takes the short arc across the date line and stays on the globe', () => {
  const a = earthPoint(0, 170), b = earthPoint(0, -170);
  const middle = pointOnPath([[0, 170], [0, -170]], 0.5);
  assert.ok(distance(middle, earthPoint(0, 180)) < 1e-8);
  assert.ok(distance(pointOnPath([[0, 170], [0, -170]], 0), a) < 1e-8);
  assert.ok(distance(pointOnPath([[0, 170], [0, -170]], 1), b) < 1e-8);
  for (const leg of TOUR) for (let n = 0; n <= 30; n++) {
    const p = pointOnPath(leg.path, n / 30);
    assert.ok(p.every(Number.isFinite));
    assert.ok(Math.abs(Math.hypot(...p) - 1) < 1e-8);
  }
});

test('stage boundaries change the vehicle without moving its boarding point', () => {
  let time = 0;
  for (let i = 0; i < TOUR.length; i++) {
    const begin = journeyAt(time + 1e-5);
    assert.equal(begin.index, i);
    assert.equal(begin.leg.vehicle, TOUR[i].vehicle);
    time += TOUR[i].duration;
    const before = journeyAt(time - 1e-5), after = journeyAt(time + 1e-5);
    assert.ok(distance(before.position, after.position) < 1e-4);
    assert.ok(after.tangent.every(Number.isFinite));
  }
  assert.equal(journeyAt(time).index, 0);
  assert.ok(distance(journeyAt(time).position, journeyAt(0).position) < 1e-8);
});

test('landscape contains raised terrain, snow, forests, deserts and branching rivers', () => {
  const world = makeWorld();
  assert.ok(world.faces.length > 400);
  assert.ok(world.faces.some(f => f.kind === 'snow'));
  assert.ok(world.faces.some(f => f.kind === 'forest'));
  assert.ok(world.faces.some(f => f.kind === 'desert'));
  assert.ok(world.faces.some(f => f.points.some(p => Math.hypot(...p) > 1.07)));
  assert.ok(world.rivers.some(r => r.name === 'Amazon'));
  assert.ok(world.rivers.length > 3);
  for (const f of world.faces) for (const p of f.points) assert.ok(p.every(Number.isFinite));
});

test('the scenic layer covers every module without rewriting the task directory', () => {
  const atlas = JSON.parse(readFileSync(new URL('../assets/lab/research-atlas.json', import.meta.url), 'utf8'));
  assert.deepEqual(new Set(TOUR.map(leg => leg.module)), new Set(atlas.modules.map(m => m.id)));
  assert.equal(atlas.nodes.length, 84);
  assert.equal(atlas.edges.length, 221);
});
