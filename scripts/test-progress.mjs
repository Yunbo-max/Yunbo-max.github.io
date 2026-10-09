import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { EDITIONS, STAGES, MAX_FILE_BYTES, validateSnapshot, parseSnapshotJSON, parseTimestamp, taskObservation, dateInTimezone, dayBounds, taskDurations, taskActiveOnDate, dailyCounts, stateSince, summarize, createDemo } from '../research-progress/progress-model.mjs';

const NOW = Date.parse('2026-10-09T12:00:00Z');
function task(overrides = {}) {
  return { task_id: 'task-1', title: 'Validate results', description: 'Check explicit result evidence.', stage: 6, status: 'running', owner: 'local-worker', started_at: '2026-10-09T10:00:00Z', updated_at: '2026-10-09T11:59:00Z', lease_until: '2026-10-09T12:04:00Z', blocker: null, next_action: null, dependencies: [], evidence: [], events: [], timing: [], source: 'local_observation', ...overrides };
}
function snapshot(tasks = [task()], overrides = {}) {
  return { schema_version: 1, generated_at: '2026-10-09T12:00:00Z', timezone: 'Europe/London', freshness_seconds: 300, projects: [{ project_id: 'project-1', title: 'Evidence-led research', edition: 'main', updated_at: '2026-10-09T12:00:00Z', source: 'local_observation', warnings: [], tasks }], ...overrides };
}
const bounds = dayBounds('2026-10-09');
const interval = (start, end, status = 'running', stage = 5) => ({ start_at: start, end_at: end, status, stage });

test('empty v1 snapshots are valid and do not imply work', () => {
  const data = validateSnapshot(snapshot([], { projects: [] }));
  const result = summarize([], data, bounds, NOW);
  assert.equal(result.taskCount, 0); assert.equal(result.counts.running, 0); assert.equal(result.durations.total, 0);
});
test('demo is explicit synthetic data covering all editions and stages', () => {
  const demo = createDemo(NOW);
  assert.deepEqual(demo.projects.map(p => p.edition), EDITIONS);
  assert.equal(demo.projects.flatMap(p => p.tasks).length, 20);
  assert.equal(STAGES.length, 8);
  assert.ok(demo.projects.every(p => p.source === 'synthetic_demo'));
  const result = summarize(demo.projects.flatMap(project => project.tasks.map(task => ({ project, task }))), demo, bounds, NOW);
  assert.ok(result.counts.running > 0); assert.ok(result.counts.uncertain > 0); assert.ok(result.counts.blocked > 0);
});
test('schema rejects invalid finite values, missing fields, status and edition', () => {
  for (const freshness_seconds of [0, -1, NaN, Infinity, 1.5, 604801]) assert.throws(() => validateSnapshot(snapshot([], { freshness_seconds })));
  for (const stage of [0, 9, NaN, Infinity, 1.1, '5']) assert.throws(() => validateSnapshot(snapshot([task({ stage })])));
  assert.throws(() => validateSnapshot(snapshot([task({ status: 'success' })])));
  const data = snapshot(); data.projects[0].edition = 'other'; assert.throws(() => validateSnapshot(data));
  const missing = task(); delete missing.updated_at; assert.throws(() => validateSnapshot(snapshot([missing])));
});
test('schema accepts null clocks, unknown edition, runtime activity and attempt IDs', () => {
  const data = snapshot([task({ started_at: null, updated_at: null, lease_until: null, last_activity_at: null, run_id: 'attempt-2', events: [{ timestamp: '2026-10-09T10:00:00.123456Z', status: 'running', stage: 6, summary: 'Claimed', run_id: 'attempt-1' }] })]);
  data.projects[0].edition = 'unknown'; data.projects[0].updated_at = null;
  const normalized = validateSnapshot(data);
  assert.equal(normalized.projects[0].tasks[0].run_id, 'attempt-2'); assert.equal(normalized.projects[0].tasks[0].events[0].run_id, 'attempt-1');
});
test('timestamps accept producer microseconds and reject implicit timezone / invalid dates', () => {
  assert.equal(parseTimestamp('2026-10-09T12:00:00.123456Z'), NOW + 123);
  for (const value of ['2026-02-30T12:00:00Z', '2026-10-09T24:00:00Z', '2026-10-09T12:00:00', '2026-10-09T12:00:00+01:00', 'now', 0]) assert.throws(() => parseTimestamp(value));
});
test('schema rejects duplicate identities within the same project and duplicate projects', () => {
  assert.throws(() => validateSnapshot(snapshot([task(), task()])), /duplicate task/);
  const data = snapshot(); data.projects.push(structuredClone(data.projects[0])); assert.throws(() => validateSnapshot(data), /duplicate project/);
  data.projects[1].project_id = 'project-2'; assert.doesNotThrow(() => validateSnapshot(data));
});
test('reader bounds file size, nesting, arrays and text while supporting Unicode', () => {
  assert.throws(() => parseSnapshotJSON(' '.repeat(MAX_FILE_BYTES + 1)), /5 MiB/);
  assert.throws(() => parseSnapshotJSON('['.repeat(18) + '0' + ']'.repeat(18)), /nesting/);
  assert.throws(() => validateSnapshot(snapshot([task({ evidence: Array(1001).fill('a') })])));
  assert.throws(() => validateSnapshot(snapshot([task({ title: 'a'.repeat(16001) })])));
  assert.doesNotThrow(() => validateSnapshot(snapshot([task({ title: '🧪'.repeat(16000), owner: 'x'.repeat(1001), dependencies: Array(101).fill('dependency') })])));
});
test('malicious object keys are rejected; imported markup remains plain text', () => {
  for (const key of ['__proto__', 'constructor', 'prototype']) assert.throws(() => parseSnapshotJSON(`{"${key}":{}}`), /unsafe key/);
  const data = snapshot([task({ title: '<img src=x onerror=alert(1)>', evidence: ['javascript:alert(1)', 'https://example.invalid/private'] })]);
  assert.equal(parseSnapshotJSON(JSON.stringify(data)).projects[0].tasks[0].title, data.projects[0].tasks[0].title);
  assert.throws(() => parseSnapshotJSON('{invalid'), /invalid JSON/);
});
test('fresh running observations count with valid lease, or when lease is not provided', () => {
  assert.equal(taskObservation(task(), snapshot(), NOW).liveRunning, true);
  assert.equal(taskObservation(task({ lease_until: null }), snapshot(), NOW).liveRunning, true);
});
test('expired lease and stale task observations cannot be counted live', () => {
  const expired = taskObservation(task({ lease_until: '2026-10-09T12:00:00Z' }), snapshot(), NOW);
  assert.equal(expired.liveRunning, false); assert.equal(expired.effectiveStatus, 'unknown'); assert.equal(expired.recordedStatus, 'running');
  const stale = taskObservation(task({ updated_at: '2026-10-09T11:54:59Z' }), snapshot(), NOW);
  assert.equal(stale.uncertain, true); assert.equal(stale.liveRunning, false);
});
test('fresh task inside a stale snapshot remains uncertain', () => {
  const data = snapshot([], { generated_at: '2026-10-09T11:50:00Z' });
  const result = taskObservation(task(), data, NOW);
  assert.equal(result.liveRunning, false); assert.equal(result.effectiveStatus, 'unknown');
});
test('future clocks and missing clocks are uncertain', () => {
  assert.equal(taskObservation(task(), snapshot([], { generated_at: '2026-10-09T12:02:00Z' }), NOW).liveRunning, false);
  assert.equal(taskObservation(task({ updated_at: '2026-10-09T12:02:00Z' }), snapshot(), NOW).liveRunning, false);
  assert.equal(taskObservation(task({ updated_at: null }), snapshot(), NOW).uncertain, true);
});
test('stale idle states become unknown rather than quietly appearing live', () => {
  for (const status of ['waiting', 'blocked', 'pending', 'paused']) {
    const result = taskObservation(task({ status, updated_at: '2026-10-08T12:00:00Z' }), snapshot(), NOW);
    assert.equal(result.effectiveStatus, 'unknown'); assert.equal(result.recordedStatus, status);
  }
});
test('old terminal outcomes remain recorded and are not stale attention items', () => {
  for (const status of ['complete', 'failed', 'cancelled']) {
    const result = taskObservation(task({ status, updated_at: '2026-10-08T12:00:00Z' }), snapshot(), NOW);
    assert.equal(result.effectiveStatus, status); assert.equal(result.uncertain, false); assert.equal(result.fresh, false);
  }
});
test('freshness threshold changes observation classification, not historical evidence', () => {
  const old = task({ updated_at: '2026-10-09T11:50:00Z', lease_until: null });
  assert.equal(taskObservation(old, snapshot(), NOW, 300).liveRunning, false);
  assert.equal(taskObservation(old, snapshot(), NOW, 900).liveRunning, true);
});
test('London civil-day boundaries cover spring and autumn DST changes', () => {
  const spring = dayBounds('2026-03-29'), autumn = dayBounds('2026-10-25');
  assert.equal(spring.hours, 23); assert.equal(new Date(spring.start).toISOString(), '2026-03-29T00:00:00.000Z'); assert.equal(new Date(spring.end).toISOString(), '2026-03-29T23:00:00.000Z');
  assert.equal(autumn.hours, 25); assert.equal(new Date(autumn.start).toISOString(), '2026-10-24T23:00:00.000Z'); assert.equal(new Date(autumn.end).toISOString(), '2026-10-26T00:00:00.000Z');
  assert.equal(dayBounds('2026-10-09').hours, 24);
  assert.equal(dateInTimezone(Date.parse('2026-10-08T23:15:00Z')), '2026-10-09');
});
test('invalid review dates are rejected and early calendar years work', () => {
  for (const date of ['2026-02-30', '2026-3-29', 'garbage']) assert.throws(() => dayBounds(date));
  assert.equal(dayBounds('0099-03-29', 'UTC').hours, 24);
});
test('timing is clipped to London midnight, not UTC midnight', () => {
  const current = task({ timing: [interval('2026-10-08T22:30:00Z', '2026-10-09T00:30:00Z')] });
  assert.equal(taskDurations(current, snapshot(), bounds, NOW).active, 90 * 60000);
});
test('full DST-day timing yields 23 or 25 task-hours', () => {
  for (const [date, expected] of [['2026-03-29', 23], ['2026-10-25', 25]]) {
    const b = dayBounds(date), now = b.end + 3600000, data = snapshot([], { generated_at: new Date(now).toISOString() });
    const current = task({ timing: [interval(new Date(b.start - 3600000).toISOString(), new Date(b.end + 3600000).toISOString())] });
    assert.equal(taskDurations(current, data, b, now).active, expected * 3600000);
  }
});
test('open intervals never accrue work after the frozen snapshot', () => {
  const current = task({ timing: [interval('2026-10-09T11:00:00Z', null)] });
  assert.equal(taskDurations(current, snapshot(), bounds, NOW + 3600000).active, 3600000);
});
test('stale open manual intervals stop at observation coverage, including waiting/blocked', () => {
  for (const status of ['running', 'waiting', 'blocked']) {
    const current = task({ status, updated_at: '2026-10-09T11:00:00Z', lease_until: null, timing: [interval('2026-10-09T11:00:00Z', null, status)] });
    assert.equal(taskDurations(current, snapshot(), bounds, NOW).total, 5 * 60000);
  }
});
test('open intervals stop at an earlier expired run lease', () => {
  const current = task({ lease_until: '2026-10-09T11:03:00Z', updated_at: '2026-10-09T11:00:00Z', timing: [interval('2026-10-09T11:00:00Z', null)] });
  assert.equal(taskDurations(current, snapshot(), bounds, NOW).active, 3 * 60000);
});
test('missing observation cannot manufacture duration for an open interval', () => {
  const current = task({ updated_at: null, lease_until: null, timing: [interval('2026-10-09T11:00:00Z', null)] });
  assert.equal(taskDurations(current, snapshot(), bounds, NOW).total, 0);
});
test('closed intervals are capture-clipped and negative intervals are rejected', () => {
  const current = task({ timing: [interval('2026-10-09T11:00:00Z', '2026-10-09T15:00:00Z')] });
  assert.equal(taskDurations(current, snapshot(), bounds, NOW).active, 3600000);
  assert.throws(() => validateSnapshot(snapshot([task({ timing: [interval('2026-10-09T12:00:00Z', '2026-10-09T11:00:00Z')] })])), /end precedes start/);
});
test('overlapping same-task intervals count once, latest-started state wins', () => {
  const current = task({ timing: [interval('2026-10-09T10:00:00Z', '2026-10-09T11:30:00Z', 'running', 5), interval('2026-10-09T11:00:00Z', '2026-10-09T11:30:00Z', 'waiting', 6)] });
  const result = taskDurations(current, snapshot(), bounds, NOW);
  assert.equal(result.active, 3600000); assert.equal(result.waiting, 30 * 60000); assert.equal(result.total, 90 * 60000); assert.equal(result.stages[5].waiting, 30 * 60000);
});
test('repeated stage visits accumulate without assuming sequential completion', () => {
  const current = task({ stage: 3, timing: [interval('2026-10-09T09:00:00Z', '2026-10-09T10:00:00Z', 'running', 3), interval('2026-10-09T10:00:00Z', '2026-10-09T11:00:00Z', 'running', 5), interval('2026-10-09T11:00:00Z', '2026-10-09T12:00:00Z', 'running', 3)] });
  const result = taskDurations(current, snapshot(), bounds, NOW);
  assert.equal(result.stages[2].active, 2 * 3600000); assert.equal(result.stages[4].active, 3600000);
});
test('parallel tasks add task-hours rather than elapsed wall time', () => {
  const timing = [interval('2026-10-09T11:00:00Z', '2026-10-09T12:00:00Z')];
  const tasks = [task({ timing }), task({ task_id: 'task-2', timing })];
  const result = summarize(tasks.map(task => ({ task })), snapshot(tasks), bounds, NOW);
  assert.equal(result.durations.active, 2 * 3600000); assert.equal(result.counts.running, 2);
});
test('missing timing remains unknown; events do not infer stage clocks', () => {
  const current = task({ events: [{ timestamp: '2026-10-09T10:00:00Z', status: 'running', stage: 5, summary: 'Running event only' }] });
  const result = taskDurations(current, snapshot(), bounds, NOW);
  assert.equal(result.hasTiming, false); assert.equal(result.total, 0);
});
test('controller observation timestamps do not invent today activity for old outcomes', () => {
  const current = task({ status: 'complete', started_at: '2026-10-08T10:00:00Z', updated_at: '2026-10-09T12:00:00Z', last_activity_at: '2026-10-08T11:00:00Z', timing: [interval('2026-10-08T10:00:00Z', '2026-10-08T11:00:00Z')] });
  assert.equal(taskActiveOnDate(current, snapshot(), bounds, NOW), false);
});
test('future post-capture events do not qualify for activity', () => {
  const current = task({ started_at: null, updated_at: null, events: [{ timestamp: '2026-10-09T13:00:00Z', status: 'complete', stage: 6, summary: 'Impossible later event' }] });
  assert.equal(taskActiveOnDate(current, snapshot(), bounds, NOW + 7200000), false);
  assert.equal(dailyCounts([{ task: current }], snapshot(), bounds, NOW + 7200000).completed, 0);
});
test('daily completions and new blockers are distinct tasks, clipped to local date', () => {
  const completed = task({ status: 'complete', events: [{ timestamp: '2026-10-08T23:10:00Z', status: 'complete', stage: 6, summary: 'Completed' }, { timestamp: '2026-10-09T10:00:00Z', status: 'complete', stage: 6, summary: 'Duplicate completion observation' }] });
  const blocked = task({ task_id: 'task-2', status: 'blocked', events: [{ timestamp: '2026-10-08T22:00:00Z', status: 'waiting', stage: 6, summary: 'Waiting' }, { timestamp: '2026-10-08T23:00:00Z', status: 'blocked', stage: 6, summary: 'New blocker' }, { timestamp: '2026-10-09T11:00:00Z', status: 'blocked', stage: 6, summary: 'Repeated blocked observation' }] });
  const oldBlocked = task({ task_id: 'task-3', status: 'blocked', events: [{ timestamp: '2026-10-08T21:00:00Z', status: 'blocked', stage: 6, summary: 'Old blocker' }, { timestamp: '2026-10-09T11:00:00Z', status: 'blocked', stage: 6, summary: 'Still blocked' }] });
  const result = dailyCounts([completed, blocked, oldBlocked].map(task => ({ task })), snapshot(), bounds, NOW);
  assert.equal(result.completed, 1); assert.equal(result.newBlockers, 1); assert.equal(result.activity, 3);
});
test('repeated completed observations on a later day are not new completions', () => {
  const current = task({ status: 'complete', started_at: '2026-10-08T10:00:00Z', last_activity_at: '2026-10-08T12:00:00Z', events: [{ timestamp: '2026-10-08T12:00:00Z', status: 'complete', stage: 6, summary: 'Completed yesterday' }, { timestamp: '2026-10-09T11:00:00Z', status: 'complete', stage: 6, summary: 'Repeated terminal observation' }] });
  assert.equal(dailyCounts([{ task: current }], snapshot(), bounds, NOW).completed, 0);
  current.events.push({ timestamp: '2026-10-09T11:10:00Z', status: 'running', stage: 5, summary: 'New attempt' }, { timestamp: '2026-10-09T11:30:00Z', status: 'complete', stage: 6, summary: 'New attempt completed' });
  assert.equal(dailyCounts([{ task: current }], snapshot(), bounds, NOW).completed, 1);
});
test('state age uses transition evidence and labels observation fallback separately', () => {
  const current = task({ status: 'blocked', events: [{ timestamp: '2026-10-09T09:00:00Z', status: 'waiting', stage: 6, summary: '' }, { timestamp: '2026-10-09T10:00:00Z', status: 'blocked', stage: 6, summary: '' }, { timestamp: '2026-10-09T11:00:00Z', status: 'blocked', stage: 6, summary: '' }] });
  assert.deepEqual(stateSince(current, snapshot()), { timestamp: '2026-10-09T10:00:00Z', kind: 'event' });
  assert.equal(stateSince(task({ status: 'waiting' }), snapshot()).kind, 'observation');
});
test('site does not contain research network/storage APIs or imported HTML sinks', async () => {
  const script = await readFile(new URL('../research-progress/progress.mjs', import.meta.url), 'utf8');
  const html = await readFile(new URL('../research-progress/index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(script, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|localStorage|sessionStorage|indexedDB|eval)\s*[.(]/);
  assert.doesNotMatch(script, /innerHTML|outerHTML|insertAdjacentHTML|document\.write|createWritable/);
  assert.match(script, /textContent/); assert.match(script, /replaceChildren/);
  assert.match(html, /connect-src 'none'/); assert.match(html, /script-src 'self'/);
  assert.doesNotMatch(html, /(?:src|href)="https?:/);
  assert.match(script, /showOpenFilePicker/); assert.match(script, /queryPermission\(\{ mode: 'read' \}\)/);
});
