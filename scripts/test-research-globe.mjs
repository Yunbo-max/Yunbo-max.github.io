import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sphere, rotate, project, clipFront, greatCircle, pickNode, validateAtlas } from '../assets/lab/globe-geometry.mjs';

const close = (a, b, tolerance = 1e-8) => assert.ok(Math.abs(a - b) < tolerance, `${a} differs from ${b}`);

test('a module can be brought to the centre without changing its sphere radius', () => {
  for (const [lat, lon] of [[0, 0], [1.2, -2.4], [-0.9, 2.9]]) {
    const p = rotate(sphere(lat, lon), -lon, lat);
    close(p[0], 0); close(p[1], 0); close(p[2], 1);
    close(Math.hypot(...p), 1);
  }
});

test('projection distinguishes the near side from the far side', () => {
  assert.equal(project([0, 0, 1], 100, 150, 80).visible, true);
  assert.equal(project([0, 0, -1], 100, 150, 80).visible, false);
  const east = project([1, 0, 0.001], 100, 150, 80);
  close(east.x, 180); close(east.y, 150);
});

test('coastline triangles crossing the horizon are clipped rather than reflected', () => {
  const clipped = clipFront([[0, 1, 1], [1, 0, -1], [-1, 0, -1]]);
  assert.equal(clipped.length, 3);
  assert.ok(clipped.every(p => p[2] >= 0 && p.every(Number.isFinite)));
  assert.deepEqual(clipFront([[0, 0, -1], [1, 0, -1], [0, 1, -1]]), []);
});

test('connection arcs preserve their endpoints and lie on the sphere', () => {
  const a = sphere(0.8, 0.2), b = sphere(-0.2, 1.9);
  const arc = greatCircle(a, b, 24);
  assert.deepEqual(arc[0], a); assert.deepEqual(arc.at(-1), b);
  assert.ok(arc.every(p => Math.abs(Math.hypot(...p) - 1) < 1e-8));
  assert.ok(greatCircle(a, a, 10).every(p => p.every(Number.isFinite)));
});

test('picking ignores an occluded node even if it occupies the same screen position', () => {
  const points = [{ id: 'far', x: 40, y: 50, visible: false }, { id: 'near', x: 41, y: 51, visible: true }];
  assert.equal(pickNode(points, 40, 50, 12)?.id, 'near');
  assert.equal(pickNode(points, 200, 200, 12), null);
});

test('the published atlas contains the real 16 modules, 84 tasks and 221 connections', () => {
  const data = JSON.parse(readFileSync(new URL('../assets/lab/research-atlas.json', import.meta.url), 'utf8'));
  validateAtlas(data);
  assert.equal(data.modules.length, 16);
  assert.equal(data.nodes.length, 84);
  assert.equal(data.edges.length, 221);
  const counts = Object.fromEntries(data.modules.map(m => [m.id, data.nodes.filter(n => n.module === m.id).length]));
  assert.equal(counts.W, 9); assert.equal(counts.V, 6); assert.equal(counts.X, 6);
  assert.throws(() => validateAtlas({ ...data, edges: [{ id: 'bad', from: 'absent', to: 'L01', type: 'input' }, ...data.edges.slice(1)] }), /Unknown node/);
});
