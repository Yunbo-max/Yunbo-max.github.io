/* Pure, browser/Node-compatible model. No I/O or persistent state. */
export const EDITIONS = Object.freeze(['main', 'autonomous-rsi', 'chat', 'autonomous-rsi-chat']);
export const STATUSES = Object.freeze(['running', 'waiting', 'blocked', 'paused', 'complete', 'failed', 'cancelled', 'pending', 'reconcile_required', 'unknown']);
export const STAGES = Object.freeze([
  ['Goals / resources / intake', '目标 / 资源 / 接入'],
  ['Papers / code / benchmarks', '文献 / 代码 / 基准'],
  ['Mathematical candidates / review', '数学候选 / 评审'],
  ['Code + experiment design', '代码与实验设计'],
  ['Local native execution', '本地原生执行'],
  ['Result verification', '结果核验'],
  ['Next-round decision', '下一轮决策'],
  ['Writing / release', '写作 / 发布'],
]);
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_PROJECTS = 100, MAX_TASKS = 5000, MAX_HISTORY = 50000;
const FUTURE_TOLERANCE_MS = 60000;
const TERMINAL = new Set(['complete', 'failed', 'cancelled']);
const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

function fail(path, message) { throw new Error(`${path}: ${message}`); }
function object(value, path) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) fail(path, 'expected an object');
  for (const key of Object.keys(value)) if (FORBIDDEN_KEYS.has(key)) fail(path, `unsafe key ${key}`);
  return value;
}
function text(value, path, max = 16000, nullable = false) {
  if (nullable && value === null) return '';
  if (typeof value !== 'string' || [...value].length > max) fail(path, `expected text of at most ${max} characters`);
  return value;
}
function identifier(value, path) {
  const result = text(value, path, 256);
  if (!result.trim()) fail(path, 'must not be empty');
  return result;
}
function array(value, path, max) {
  if (!Array.isArray(value) || value.length > max) fail(path, `expected an array with at most ${max} entries`);
  return value;
}
function integer(value, path, min, max) {
  if (!Number.isInteger(value) || value < min || value > max) fail(path, `expected an integer from ${min} to ${max}`);
  return value;
}
function status(value, path) {
  if (!STATUSES.includes(value)) fail(path, 'unrecognized status');
  return value;
}
export function parseTimestamp(value, path = 'timestamp', nullable = false) {
  if (nullable && value === null) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/.test(value)) fail(path, 'expected a UTC ISO timestamp ending in Z');
  const time = Date.parse(value);
  if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 19) !== value.slice(0, 19)) fail(path, 'invalid calendar timestamp');
  return time;
}
function timestamp(value, path, nullable = false) { parseTimestamp(value, path, nullable); return value; }
function source(value, path) { return text(value, path); }
function stringArray(value, path, max = 1000) { return array(value, path, max).map((v, i) => text(v, `${path}[${i}]`, 16000)); }

export function validateSnapshot(input) {
  const root = object(input, 'snapshot');
  if (root.schema_version !== 1) fail('schema_version', 'only version 1 is supported');
  const generated_at = timestamp(root.generated_at, 'generated_at');
  const timezone = text(root.timezone, 'timezone', 100);
  try { new Intl.DateTimeFormat('en', { timeZone: timezone }).format(0); } catch { fail('timezone', 'unrecognized IANA timezone'); }
  const freshness_seconds = integer(root.freshness_seconds, 'freshness_seconds', 1, 604800);
  let taskCount = 0, historyCount = 0;
  const projectIds = new Set();
  const projects = array(root.projects, 'projects', MAX_PROJECTS).map((raw, p) => {
    const path = `projects[${p}]`, project = object(raw, path);
    const project_id = identifier(project.project_id, `${path}.project_id`);
    if (projectIds.has(project_id)) fail(`${path}.project_id`, 'duplicate project ID');
    projectIds.add(project_id);
    if (![...EDITIONS, 'unknown'].includes(project.edition)) fail(`${path}.edition`, 'unrecognized edition');
    const taskIds = new Set();
    const tasks = array(project.tasks, `${path}.tasks`, MAX_TASKS).map((rawTask, t) => {
      if (++taskCount > MAX_TASKS) fail('projects', `more than ${MAX_TASKS} total tasks`);
      const tp = `${path}.tasks[${t}]`, task = object(rawTask, tp);
      const task_id = identifier(task.task_id, `${tp}.task_id`);
      if (taskIds.has(task_id)) fail(`${tp}.task_id`, 'duplicate task ID within project');
      taskIds.add(task_id);
      const events = array(task.events, `${tp}.events`, 1000).map((rawEvent, e) => {
        if (++historyCount > MAX_HISTORY) fail('projects', `more than ${MAX_HISTORY} total history entries`);
        const ep = `${tp}.events[${e}]`, event = object(rawEvent, ep);
        const result = { timestamp: timestamp(event.timestamp, `${ep}.timestamp`), status: status(event.status, `${ep}.status`), stage: integer(event.stage, `${ep}.stage`, 1, 8), summary: text(event.summary, `${ep}.summary`) };
        if (event.run_id !== undefined) result.run_id = event.run_id === null ? null : text(event.run_id, `${ep}.run_id`, 256);
        return result;
      });
      const timing = array(task.timing, `${tp}.timing`, 1000).map((rawInterval, i) => {
        if (++historyCount > MAX_HISTORY) fail('projects', `more than ${MAX_HISTORY} total history entries`);
        const ip = `${tp}.timing[${i}]`, interval = object(rawInterval, ip);
        const start_at = timestamp(interval.start_at, `${ip}.start_at`), end_at = timestamp(interval.end_at, `${ip}.end_at`, true);
        if (end_at !== null && Date.parse(end_at) < Date.parse(start_at)) fail(ip, 'end precedes start');
        return { start_at, end_at, status: status(interval.status, `${ip}.status`), stage: integer(interval.stage, `${ip}.stage`, 1, 8) };
      });
      const result = {
        task_id, title: text(task.title, `${tp}.title`), description: text(task.description, `${tp}.description`),
        stage: integer(task.stage, `${tp}.stage`, 1, 8), status: status(task.status, `${tp}.status`), owner: text(task.owner, `${tp}.owner`),
        started_at: timestamp(task.started_at, `${tp}.started_at`, true), updated_at: timestamp(task.updated_at, `${tp}.updated_at`, true),
        lease_until: timestamp(task.lease_until, `${tp}.lease_until`, true), blocker: text(task.blocker, `${tp}.blocker`, 16000, true), next_action: text(task.next_action, `${tp}.next_action`, 16000, true),
        dependencies: stringArray(task.dependencies, `${tp}.dependencies`), evidence: stringArray(task.evidence, `${tp}.evidence`), events, timing, source: source(task.source, `${tp}.source`),
      };
      if (task.run_id !== undefined) result.run_id = task.run_id === null ? null : text(task.run_id, `${tp}.run_id`, 256);
      if (task.last_activity_at !== undefined) result.last_activity_at = timestamp(task.last_activity_at, `${tp}.last_activity_at`, true);
      return result;
    });
    return { project_id, title: text(project.title, `${path}.title`), edition: project.edition, updated_at: timestamp(project.updated_at, `${path}.updated_at`, true), source: source(project.source, `${path}.source`), tasks, warnings: stringArray(project.warnings, `${path}.warnings`) };
  });
  return { schema_version: 1, generated_at, timezone, freshness_seconds, projects };
}

export function parseSnapshotJSON(raw) {
  if (typeof raw !== 'string') fail('file', 'expected text');
  if (new TextEncoder().encode(raw).length > MAX_FILE_BYTES) fail('file', 'exceeds the 5 MiB limit');
  let parsed;
  try { parsed = JSON.parse(raw); } catch { fail('file', 'invalid JSON'); }
  // Scan keys before normalization, including ignored metadata; limit depth to prevent abuse.
  const scan = (value, depth = 0) => {
    if (depth > 16) fail('file', 'maximum JSON nesting depth is 16');
    if (value && typeof value === 'object') {
      for (const key of Object.keys(value)) {
        if (FORBIDDEN_KEYS.has(key)) fail('file', `unsafe key ${key}`);
        scan(value[key], depth + 1);
      }
    }
  };
  scan(parsed);
  return validateSnapshot(parsed);
}

export function taskObservation(task, snapshot, now = Date.now(), thresholdSeconds = snapshot.freshness_seconds) {
  const threshold = Math.max(1, Math.min(604800, Number.isFinite(thresholdSeconds) ? thresholdSeconds : snapshot.freshness_seconds)) * 1000;
  const generated = Date.parse(snapshot.generated_at), updated = task.updated_at === null ? null : Date.parse(task.updated_at);
  const reasons = [];
  if (generated > now + FUTURE_TOLERANCE_MS) reasons.push('Snapshot clock is in the future');
  else if (now - generated > threshold) reasons.push('Snapshot is older than the observation threshold');
  if (updated === null) reasons.push('Task has no update timestamp');
  else if (updated > now + FUTURE_TOLERANCE_MS || updated > generated + FUTURE_TOLERANCE_MS) reasons.push('Task update clock is inconsistent');
  else if (now - updated > threshold) reasons.push('Task update is older than the observation threshold');
  if (task.status === 'running' && task.lease_until !== null && Date.parse(task.lease_until) <= now) reasons.push('Recorded run lease has expired');
  if (task.status === 'unknown') reasons.push('Source reports an unknown state');
  if (task.status === 'reconcile_required') reasons.push('Source requires reconciliation');
  const uncertain = reasons.length > 0 && !TERMINAL.has(task.status);
  return {
    recordedStatus: task.status,
    effectiveStatus: uncertain && !TERMINAL.has(task.status) ? 'unknown' : task.status,
    liveRunning: task.status === 'running' && !uncertain,
    uncertain,
    fresh: reasons.length === 0,
    reasons,
    ageSeconds: updated === null ? null : Math.max(0, (now - updated) / 1000),
  };
}

export function dateInTimezone(time = Date.now(), timezone = 'Europe/London') {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(time));
  const get = type => p.find(part => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
function zonedParts(time, timezone) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date(time));
  const n = type => Number(parts.find(p => p.type === type).value);
  const result = new Date(0);
  result.setUTCFullYear(n('year'), n('month') - 1, n('day'));
  result.setUTCHours(n('hour'), n('minute'), n('second'), 0);
  return result.getTime();
}
function localMidnightUTC(date, timezone) {
  const target = Date.parse(`${date}T00:00:00Z`);
  let candidate = target;
  for (let i = 0; i < 5; i++) {
    const adjustment = target - zonedParts(candidate, timezone);
    if (adjustment === 0) return candidate;
    candidate += adjustment;
  }
  fail('date', 'could not determine timezone boundary');
}
export function dayBounds(date, timezone = 'Europe/London') {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) fail('date', 'expected YYYY-MM-DD');
  parseTimestamp(`${date}T00:00:00Z`, 'date');
  new Intl.DateTimeFormat('en', { timeZone: timezone }).format(0);
  const next = new Date(Date.parse(`${date}T00:00:00Z`) + 86400000).toISOString().slice(0, 10);
  const start = localMidnightUTC(date, timezone), end = localMidnightUTC(next, timezone);
  return { start, end, hours: (end - start) / 3600000 };
}
const timeCategory = status => status === 'running' ? 'active' : status === 'waiting' ? 'waiting' : status === 'blocked' ? 'blocked' : 'other';
export function taskDurations(task, snapshot, bounds, now = Date.now()) {
  const cap = Math.min(now, Date.parse(snapshot.generated_at));
  const lease = task.lease_until === null ? Infinity : Date.parse(task.lease_until);
  const observationCap = task.updated_at === null ? null : Date.parse(task.updated_at) + snapshot.freshness_seconds * 1000;
  const intervals = task.timing.map((interval, index) => ({
    start: Math.max(bounds.start, Date.parse(interval.start_at)),
    end: Math.min(bounds.end, cap, interval.end_at === null ? Math.min(cap, observationCap ?? Date.parse(interval.start_at)) : Date.parse(interval.end_at), interval.end_at === null && interval.status === 'running' ? lease : Infinity),
    originalStart: Date.parse(interval.start_at), stage: interval.stage, category: timeCategory(interval.status), index,
  })).filter(i => i.end > i.start);
  const result = { active: 0, waiting: 0, blocked: 0, other: 0, total: 0, stages: Array.from({ length: 8 }, () => ({ active: 0, waiting: 0, blocked: 0, other: 0, total: 0 })), hasTiming: task.timing.length > 0 };
  // A task cannot occupy two stages at once. For overlapping entries, the latest
  // start wins (latest source entry breaks ties); this avoids double-counting.
  const boundaries = [...new Set(intervals.flatMap(i => [i.start, i.end]))].sort((a, b) => a - b);
  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i], end = boundaries[i + 1];
    const candidates = intervals.filter(interval => interval.start <= start && interval.end >= end);
    if (!candidates.length) continue;
    const chosen = candidates.reduce((a, b) => b.originalStart > a.originalStart || (b.originalStart === a.originalStart && b.index > a.index) ? b : a);
    const ms = end - start, stage = result.stages[chosen.stage - 1];
    result[chosen.category] += ms; result.total += ms;
    stage[chosen.category] += ms; stage.total += ms;
  }
  return result;
}
export function taskActiveOnDate(task, snapshot, bounds, now = Date.now()) {
  if (taskDurations(task, snapshot, bounds, now).total > 0) return true;
  const cap = Math.min(now, Date.parse(snapshot.generated_at));
  const activity = 'last_activity_at' in task ? task.last_activity_at : task.updated_at;
  return [task.started_at, activity, ...task.events.map(e => e.timestamp)].some(value => value !== null && Date.parse(value) >= bounds.start && Date.parse(value) < bounds.end && Date.parse(value) <= cap);
}
export function stateSince(task, snapshot) {
  const cap = Date.parse(snapshot.generated_at);
  const events = task.events.filter(e => Date.parse(e.timestamp) <= cap).sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
  let since = null;
  for (const event of events) {
    if (event.status !== task.status) since = null;
    else if (since === null) since = event.timestamp;
  }
  if (since !== null) return { timestamp: since, kind: 'event' };
  const intervals = task.timing.filter(i => i.status === task.status && Date.parse(i.start_at) <= cap).sort((a, b) => Date.parse(b.start_at) - Date.parse(a.start_at));
  if (intervals.length) return { timestamp: intervals[0].start_at, kind: 'timing' };
  return task.updated_at !== null ? { timestamp: task.updated_at, kind: 'observation' } : null;
}
export function dailyCounts(rows, snapshot, bounds, now = Date.now()) {
  const cap = Math.min(now, Date.parse(snapshot.generated_at));
  const within = timestamp => { const time = Date.parse(timestamp); return time >= bounds.start && time < bounds.end && time <= cap; };
  const result = { activity: 0, completed: 0, newBlockers: 0 };
  for (const { task } of rows) {
    if (taskActiveOnDate(task, snapshot, bounds, now)) result.activity++;
    const events = [...task.events].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
    if (events.some((event, index) => event.status === 'complete' && within(event.timestamp) && (index === 0 || events[index - 1].status !== 'complete'))) result.completed++;
    if (events.some((event, index) => event.status === 'blocked' && within(event.timestamp) && (index === 0 || events[index - 1].status !== 'blocked'))) result.newBlockers++;
  }
  return result;
}
export function summarize(rows, snapshot, bounds, now = Date.now(), thresholdSeconds = snapshot.freshness_seconds) {
  const counts = { running: 0, uncertain: 0, waiting: 0, blocked: 0, complete: 0, failed: 0, pending: 0, paused: 0, cancelled: 0 };
  const durations = { active: 0, waiting: 0, blocked: 0, other: 0, total: 0 };
  const stages = Array.from({ length: 8 }, (_, index) => ({ stage: index + 1, tasks: 0, active: 0, waiting: 0, blocked: 0, other: 0, total: 0 }));
  for (const { task } of rows) {
    const observation = taskObservation(task, snapshot, now, thresholdSeconds);
    if (observation.liveRunning) counts.running++;
    if (observation.uncertain) counts.uncertain++;
    if (observation.effectiveStatus in counts && observation.effectiveStatus !== 'running') counts[observation.effectiveStatus]++;
    stages[task.stage - 1].tasks++;
    const timing = taskDurations(task, snapshot, bounds, now);
    for (const category of Object.keys(durations)) durations[category] += timing[category];
    timing.stages.forEach((value, index) => { for (const category of Object.keys(durations)) stages[index][category] += value[category]; });
  }
  return { counts, durations, stages, daily: dailyCounts(rows, snapshot, bounds, now), taskCount: rows.length };
}

export function createDemo(now = Date.now()) {
  const iso = minutes => new Date(now + minutes * 60000).toISOString();
  const titles = [
    ['Formalize the research question', 'Review candidate proof gaps', 'Run native benchmark suite', 'Verify held-out results', 'Prepare release notes'],
    ['Review recursive improvement candidates', 'Design the next experiment', 'Run the selected candidate', 'Resolve evaluator mismatch', 'Choose the next round'],
    ['Collect paper and code evidence', 'Compare mathematical candidates', 'Check local execution logs', 'Reconcile worker state', 'Draft methods and limitations'],
    ['Validate objective and resource budget', 'Reproduce the baseline', 'Run controlled ablation', 'Inspect native outcome evidence', 'Decide the next experiment'],
  ];
  const statuses = [['complete', 'running', 'running', 'blocked', 'pending'], ['complete', 'waiting', 'running', 'failed', 'pending'], ['complete', 'paused', 'running', 'reconcile_required', 'waiting'], ['complete', 'running', 'blocked', 'complete', 'unknown']];
  const stageNumbers = [[1, 3, 5, 6, 8], [3, 4, 5, 6, 7], [2, 3, 5, 5, 8], [1, 5, 5, 6, 7]];
  return validateSnapshot({
    schema_version: 1, generated_at: iso(0), timezone: 'Europe/London', freshness_seconds: 300,
    projects: EDITIONS.map((edition, p) => ({
      project_id: `demo-${p + 1}`, title: ['Verified optimization', 'Adaptive research loop', 'Evidence-led assistant', 'Autonomous ablation study'][p], edition, updated_at: iso(-1), source: 'synthetic_demo', warnings: p === 2 ? ['Synthetic worker observation is intentionally stale for this demonstration.'] : [],
      tasks: titles[p].map((title, t) => {
        const state = statuses[p][t], stage = stageNumbers[p][t], stale = p === 2 && t === 2, started = -180 - t * 20;
        const updated = stale ? -45 : -1;
        return {
          task_id: `task-${p + 1}-${t + 1}`, title, description: 'Synthetic example only. Demonstrates recorded research tasks, observations, stage timing, and evidence without containing private project data.', stage, status: state, owner: `demo-worker-${(t % 3) + 1}`,
          started_at: iso(started), updated_at: iso(updated), lease_until: state === 'running' ? iso(stale ? -15 : 4) : null,
          blocker: state === 'blocked' ? (p === 0 ? 'Required held-out result artifact has not been produced.' : 'The baseline dependency has not completed.') : state === 'failed' ? 'Synthetic evaluator terminated with a nonzero exit code.' : null,
          next_action: state === 'blocked' ? 'Inspect the dependency, then rerun the verification step.' : state === 'failed' ? 'Review the recorded error before selecting a rerun.' : state === 'reconcile_required' ? 'Compare the worker lease with the latest local controller record.' : null,
          dependencies: state === 'blocked' ? [`task-${p + 1}-1`] : [], evidence: state === 'complete' ? ['synthetic/example-result.json'] : [], source: 'synthetic_demo',
          events: [{ timestamp: iso(started), status: 'pending', stage, summary: 'Synthetic task queued' }, { timestamp: iso(updated), status: state, stage, summary: 'Synthetic status observation' }],
          timing: [{ start_at: iso(started), end_at: iso(-80), status: 'running', stage: Math.max(1, stage - 1) }, { start_at: iso(-80), end_at: ['complete', 'failed'].includes(state) ? iso(-20) : null, status: state === 'complete' ? 'running' : state, stage }],
        };
      }),
    })),
  });
}
