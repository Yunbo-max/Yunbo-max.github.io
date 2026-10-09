import { EDITIONS, STAGES, MAX_FILE_BYTES, parseSnapshotJSON, createDemo, dateInTimezone, dayBounds, taskObservation, taskDurations, taskActiveOnDate, summarize, stateSince } from './progress-model.mjs';

const $ = id => document.getElementById(id);
const copy = {
  skip: ['Skip to progress', '跳转至进度'], research: ['Research', '研究'], home: ['Homepage', '主页'],
  eyebrow: ['RESEARCH AUTOPILOT · LOCAL OBSERVATORY', 'RESEARCH AUTOPILOT · 本地观测台'], title: ['Research, at a glance.', '研究进展，一目了然。'], intro: ['Review the day’s work, see what is running, and know what needs attention.', '查看每日工作、正在运行的任务，以及需要关注的问题。'],
  localOnly: ['Browser-local · private by default', '浏览器本地 · 默认私密'], import: ['Import local snapshot', '导入本地快照'], clear: ['Clear', '清除'], watch: ['Watch local file', '监测本地文件'],
  startLocal: ['START WITH A LOCAL SNAPSHOT', '从本地快照开始'], emptyTitle: ['Your research stays on your device.', '研究数据始终留在你的设备上。'], emptyDescription: ['Drop a Research Autopilot JSON snapshot here, or choose a file. Nothing is uploaded. Data stays in this tab’s memory and disappears when you clear it or close the page.', '将 Research Autopilot JSON 快照拖到此处，或选择文件。不会上传数据。数据仅保存在当前标签页的内存中，清除或关闭页面后即消失。'], chooseFile: ['Choose JSON file', '选择 JSON 文件'], fileNote: ['Schema v1 · Up to 5 MiB · Manual re-import for updates', 'Schema v1 · 最大 5 MiB · 重新导入以更新'],
  demoHeading: ['Explore the layout first', '先看看页面布局'], demoDescription: ['A clearly labeled synthetic example covers all four editions.', '明确标注的合成示例，涵盖全部四个版本。'], demo: ['Load synthetic demo', '加载合成示例'], synthetic: ['SYNTHETIC DEMO', '合成示例'], syntheticDescription: ['Illustrative tasks only. No real project data.', '仅含示例任务，不包含真实项目数据。'], clearDemo: ['Clear demo', '清除示例'],
  captured: ['Captured', '快照时间'], reviewDate: ['Review date', '查看日期'], today: ['Today', '今天'], edition: ['Edition', '版本'], project: ['Project', '项目'], threshold: ['Observation threshold', '观测时效阈值'], minutes: ['min', '分钟'], allEditions: ['All editions', '全部版本'], allProjects: ['All projects', '全部项目'],
  freshnessNote: ['Freshness is an observation rule, not proof of success or failure. Live status is evaluated now; task-hours below refer to the selected date.', '时效阈值是观测规则，不代表成功或失败。实时状态按当前时间评估；下方任务小时按所选日期计算。'], runningNow: ['Running now', '当前运行'], freshObserved: ['Fresh state · lease valid when provided', '新鲜状态 · 租约有效（若提供）'], uncertain: ['Uncertain / stale', '不确定 / 陈旧'], needsObservation: ['Needs a fresh observation', '需要新鲜观测'], waitingBlocked: ['Waiting / blocked', '等待 / 阻塞'], recordedNonterminal: ['Fresh recorded states', '新鲜的记录状态'], completeFailed: ['Completed / failed', '已完成 / 已失败'], recordedOutcomes: ['Recorded outcomes', '记录中的结果'],
  dayEyebrow: ['THE SELECTED DAY', '所选日期'], recordedTaskTime: ['Recorded task time', '已记录任务时间'], activeTaskHours: ['active task-hours', '活动任务小时'], waitingTaskHours: ['waiting task-hours', '等待任务小时'], blockedTaskHours: ['blocked task-hours', '阻塞任务小时'], otherTaskHours: ['other recorded task-hours', '其他记录任务小时'], timeNote: ['Parallel tasks add together as task-hours, not elapsed calendar time. Only explicit timing intervals contribute; open intervals stop at capture, observation coverage, or an earlier lease expiry.', '并行任务累加为任务小时，而非日历经过时间。仅计算明确的时间区间；未结束区间截止于快照时间、观测覆盖范围或更早的租约到期时间。'],
  workflowEyebrow: ['WORKFLOW OBSERVATIONS', '工作流观测'], stagesTitle: ['Across the eight stages', '八个阶段概览'], stageNote: ['Stages can be revisited. Counts are not a completion percentage.', '阶段可重复进入，数量不代表完成百分比。'], stage: ['Stage', '阶段'], stageTasks: ['tasks recorded here', '个任务记录在此阶段'], taskHours: ['task-h', '任务小时'], activeShort: ['active', '活动'], waitingShort: ['wait', '等待'], blockedShort: ['blocked', '阻塞'],
  tasksEyebrow: ['PROJECT WORK', '项目工作'], tasks: ['Tasks', '任务'], searchTasks: ['Search tasks', '搜索任务'], searchPlaceholder: ['Search tasks, descriptions, owners…', '搜索任务、描述、负责人…'], dayOnly: ['Activity on this date only', '仅显示此日期有活动的任务'], noTasks: ['No tasks match these filters.', '没有符合筛选条件的任务。'], allStates: ['All states', '全部状态'], attentionEyebrow: ['NEXT ACTIONS', '下一步行动'], attentionTitle: ['Needs attention', '需要关注'], attentionNote: ['Recorded blockers and reconciliation requests, including stale observations.', '记录中的阻塞与状态核对请求，包含陈旧观测。'], noAttention: ['No recorded blockers in the selected projects.', '所选项目中没有记录的阻塞。'],
  dailyActivity: ['tasks with recorded activity', '个任务有记录活动'], dailyCompleted: ['tasks completed this date', '个任务在此日期完成'], dailyBlockers: ['tasks newly blocked this date', '个任务在此日期新增阻塞'],
  showing: ['Showing', '显示'], of: ['of', '/'], loadMore: ['Show 100 more', '再显示 100 个'], runId: ['Run ID', '运行 ID'],
  guideTitle: ['How to read this view', '如何阅读此页面'], guideStatus: ['A running task counts as live only when the snapshot and task update are fresh, and any recorded lease is still valid. Stale nonterminal states appear as uncertain, with their last recorded status preserved. Completed, failed, and cancelled states are recorded outcomes.', '只有快照与任务更新时间足够新，且已提供的运行租约仍有效时，运行任务才计为实时。陈旧的非终态显示为不确定，同时保留最后记录状态。已完成、失败、取消是记录中的结果。'], guideDuration: ['Durations come from explicit timing records. Overlapping records within a task use the latest-started record once; distinct parallel tasks add together. Missing timing means unknown duration. Long duration alone does not establish failure.', '时长来自明确的时间记录。同一任务中重叠的记录按开始时间较新的区间计算一次；不同的并行任务累加。没有时间记录即表示时长未知，持续时间长并不能证明失败。'], guidePrivacy: ['Import is local to your browser. This page has no uploads, telemetry, background data requests, or persistent data storage. Re-import a snapshot manually to refresh it, or choose Watch local file in a supported browser. Watching reads only your selected file every 30 seconds while this page is open; permission is required and no background service is promised. Exported evidence paths appear as text and are never opened automatically.', '文件仅在浏览器本地读取。本页面没有上传、遥测、自动网络请求或持久化存储。可重新导入快照，或在支持的浏览器中点击“监测本地文件”。监测需获得权限，只会在页面保持打开时每 30 秒读取所选文件，不保证后台服务。证据路径仅显示为文本，不会自动打开。'], guideClock: ['Daily boundaries use Europe/London, including daylight saving changes. A date may contain 23, 24, or 25 calendar hours. Snapshot source timezone is shown in import metadata; this view always uses London dates.', '日期边界采用 Europe/London，包含夏令时变化。一天可能包含 23、24 或 25 个日历小时。导入信息中显示快照源时区；此页面始终采用伦敦日期。'], footer: ['Observe · verify · decide', '观测 · 核验 · 决策'], footerPrivacy: ['Local files. No upload. No persistence.', '本地文件，无上传，无持久存储。'],
  running: ['Running', '运行中'], waiting: ['Waiting', '等待中'], blocked: ['Blocked', '已阻塞'], paused: ['Paused', '已暂停'], complete: ['Completed', '已完成'], failed: ['Failed', '已失败'], cancelled: ['Cancelled', '已取消'], pending: ['Pending', '待处理'], reconcile_required: ['Reconciliation needed', '需要核对'], unknown: ['Unknown', '未知'],
  freshSnapshot: ['Fresh snapshot', '新鲜快照'], staleSnapshot: ['Stale / uncertain snapshot', '陈旧 / 不确定快照'], snapshotWarning: ['This snapshot is outside the observation threshold or has a future clock. Running records are shown as uncertain until a fresh local snapshot is imported. A long delay alone is not proof of failure.', '此快照已超出观测时效阈值，或时间位于未来。导入新鲜的本地快照前，运行记录将显示为不确定。长时间未更新并不能证明失败。'], capturedTimezone: ['Snapshot source timezone', '快照源时区'], watching: ['Watching every 30s · keep page open', '每 30 秒监测 · 请保持页面打开'], manualImport: ['Manual import', '手动导入'], recorded: ['Recorded', '记录'], lastObservation: ['Last observation', '最后观测'], outcomeStale: ['Recorded outcome · stale observation', '记录结果 · 观测陈旧'], updated: ['Updated', '更新于'], noTimestamp: ['Unknown update time', '更新时间未知'], timingUnknown: ['Timing not recorded', '未记录时长'], viewDetails: ['View task details', '查看任务详情'],
  owner: ['Owner', '负责人'], taskId: ['Task ID', '任务 ID'], source: ['Source', '来源'], started: ['Started', '开始时间'], lease: ['Lease until', '租约到期'], noLease: ['No lease provided', '未提供租约'], lastActivity: ['Last runtime activity', '最后运行时活动'], notRecorded: ['Not recorded', '未记录'], cause: ['Recorded cause', '记录原因'], nextAction: ['Next action', '下一步行动'], causeMissing: ['No cause was recorded. Inspect the latest local worker observation.', '未记录原因，请检查最新的本地工作进程观测。'], nextMissing: ['No next action was recorded. Reconcile the local task state before choosing an action.', '未记录下一步行动，请先核对本地任务状态再选择行动。'], stateReported: ['State recorded', '状态记录于'], observationAge: ['Observation recorded', '观测记录于'], uncertainty: ['Observation uncertainty', '观测不确定性'], dependencies: ['Dependencies', '依赖'], evidence: ['Evidence paths (text only)', '证据路径（仅文本）'], events: ['Recorded event timeline', '已记录事件时间线'], durationByStage: ['Recorded time by stage · selected date', '各阶段记录时长 · 所选日期'], other: ['Other', '其他'], warnings: ['Project warnings', '项目警告'], importSuccess: ['Local snapshot loaded. No data was uploaded.', '已加载本地快照，没有上传数据。'], clearSuccess: ['Snapshot cleared from this tab’s memory.', '已从此标签页内存中清除快照。'], importFailed: ['Import rejected', '导入被拒绝'], retained: ['The previous snapshot is still displayed.', '仍显示上一份快照。'], oneFile: ['Choose one JSON file at a time.', '请每次选择一个 JSON 文件。'], tooLarge: ['The file exceeds the 5 MiB limit.', '文件超过 5 MiB 限制。'], watchUnavailable: ['Local file watching is not supported here. Import a file manually.', '此浏览器不支持本地文件监测，请手动导入文件。'], watchStopped: ['File watching stopped. The last snapshot remains available; choose Watch local file to resume.', '文件监测已停止，仍保留最后的快照。点击“监测本地文件”可恢复。'], calendarHours: ['calendar hours', '日历小时'], thresholdInvalid: ['Enter an observation threshold between 1 second and 7 days.', '请输入 1 秒至 7 天之间的观测时效阈值。'], previousDay: ['Previous date', '前一天'], nextDay: ['Next date', '后一天'], now: ['just now', '刚刚'], ago: ['ago', '前'], dayUnit: ['d', '天'], hourUnit: ['h', '小时'], minuteUnit: ['m', '分钟'], secondUnit: ['s', '秒'], freshReason: ['Fresh observation; any provided lease is valid.', '观测新鲜，已提供的租约有效。'],
};
const reasonCopy = {
  'Snapshot clock is in the future': ['Snapshot clock is in the future', '快照时间位于未来'],
  'Snapshot is older than the observation threshold': ['Snapshot is older than the observation threshold', '快照超出观测时效阈值'],
  'Task has no update timestamp': ['Task has no update timestamp', '任务没有更新时间'],
  'Task update clock is inconsistent': ['Task update clock is inconsistent', '任务更新时间不一致'],
  'Task update is older than the observation threshold': ['Task update is older than the observation threshold', '任务更新超出观测时效阈值'],
  'Recorded run lease has expired': ['Recorded run lease has expired', '记录的运行租约已到期'],
  'Source reports an unknown state': ['Source reports an unknown state', '数据源报告未知状态'],
  'Source requires reconciliation': ['Source requires reconciliation', '数据源要求核对状态'],
};
let language = 'en', snapshot = null, filename = '', isDemo = false, importToken = 0, visibleLimit = 100;
let watchedHandle = null, watchTimer = null, watchReading = false;
let observationThreshold = 300;
const t = key => copy[key]?.[language === 'zh' ? 1 : 0] ?? key;
const reasonText = reason => reasonCopy[reason]?.[language === 'zh' ? 1 : 0] ?? reason;
const el = (tag, className = '', content = null) => { const node = document.createElement(tag); if (className) node.className = className; if (content !== null) node.textContent = content; return node; };
const put = (id, content) => { $(id).textContent = content; };
function formatTime(value, seconds = false) {
  if (value === null || value === undefined) return t('notRecorded');
  return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-GB', { timeZone: 'Europe/London', month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', ...(seconds ? { second: '2-digit' } : {}), timeZoneName: 'short' }).format(new Date(value));
}
function ago(value, now = Date.now()) {
  if (value === null || value === undefined) return t('noTimestamp');
  const seconds = Math.max(0, Math.floor((now - Date.parse(value)) / 1000));
  if (seconds < 5) return t('now');
  const amount = seconds >= 86400 ? Math.floor(seconds / 86400) : seconds >= 3600 ? Math.floor(seconds / 3600) : seconds >= 60 ? Math.floor(seconds / 60) : seconds;
  const unit = seconds >= 86400 ? 'dayUnit' : seconds >= 3600 ? 'hourUnit' : seconds >= 60 ? 'minuteUnit' : 'secondUnit';
  return `${amount}${t(unit)} ${t('ago')}`;
}
const hours = ms => (ms / 3600000).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const stageLabel = number => STAGES[number - 1][language === 'zh' ? 1 : 0];
function notify(message, error = false) { const node = $('message'); node.textContent = message; node.className = `message${error ? ' error' : ''}`; node.hidden = false; }
function stopWatching() { if (watchTimer !== null) clearInterval(watchTimer); watchTimer = null; watchedHandle = null; watchReading = false; }
function clearSnapshot() {
  importToken++; stopWatching(); snapshot = null; filename = ''; isDemo = false;
  $('snapshot-file').value = ''; $('task-search').value = ''; $('edition-filter').value = 'all'; $('status-filter').value = 'all'; $('project-filter').replaceChildren(el('option', '', t('allProjects'))); $('project-filter').options[0].value = 'all'; $('day-only').checked = false;
  render(); notify(t('clearSuccess'));
}
async function readFile(file) {
  if (file.size > MAX_FILE_BYTES) throw new Error(t('tooLarge'));
  return parseSnapshotJSON(await file.text());
}
function commitSnapshot(data, name, demo = false, preserveFilters = false) {
  snapshot = data; filename = name; isDemo = demo;
  if (!preserveFilters) {
    visibleLimit = 100;
    observationThreshold = data.freshness_seconds; $('freshness-minutes').value = String(data.freshness_seconds / 60);
    $('edition-filter').value = 'all'; $('project-filter').value = 'all'; $('status-filter').value = 'all'; $('task-search').value = ''; $('day-only').checked = false;
  }
  updateProjects(); render();
}
async function importFile(file) {
  const token = ++importToken; stopWatching();
  try {
    const data = await readFile(file);
    if (token !== importToken) return;
    commitSnapshot(data, file.name); notify(t('importSuccess'));
  } catch (error) {
    if (token !== importToken) return;
    notify(`${t('importFailed')}: ${error.message}${snapshot ? ` ${t('retained')}` : ''}`, true); render();
  }
}
async function watchFile() {
  if (typeof window.showOpenFilePicker !== 'function') { notify(t('watchUnavailable'), true); return; }
  const token = ++importToken; stopWatching(); render();
  try {
    const [handle] = await window.showOpenFilePicker({ multiple: false, types: [{ description: 'Research Autopilot JSON snapshot', accept: { 'application/json': ['.json'] } }], excludeAcceptAllOption: true });
    if (token !== importToken) return;
    const file = await handle.getFile(), data = await readFile(file);
    if (token !== importToken) return;
    stopWatching(); watchedHandle = handle; commitSnapshot(data, file.name); notify(t('importSuccess'));
    watchTimer = setInterval(async () => {
      if (!watchedHandle || watchReading) return;
      const activeHandle = watchedHandle, activeToken = importToken; watchReading = true;
      try {
        if (typeof activeHandle.queryPermission === 'function' && await activeHandle.queryPermission({ mode: 'read' }) !== 'granted') throw new Error('Read permission unavailable');
        const changedFile = await activeHandle.getFile(), changedData = await readFile(changedFile);
        if (activeToken !== importToken || watchedHandle !== activeHandle) return;
        commitSnapshot(changedData, changedFile.name, false, true);
      } catch {
        if (activeToken === importToken && watchedHandle === activeHandle) { stopWatching(); notify(t('watchStopped'), true); render(); }
      } finally { if (activeToken === importToken && watchedHandle === activeHandle) watchReading = false; }
    }, 30000);
    render();
  } catch (error) {
    if (token !== importToken || error.name === 'AbortError') return;
    notify(`${t('importFailed')}: ${error.message}${snapshot ? ` ${t('retained')}` : ''}`, true);
  }
}
function updateProjects() {
  const select = $('project-filter'), old = select.value, edition = $('edition-filter').value;
  const all = el('option', '', t('allProjects')); all.value = 'all';
  select.replaceChildren(all);
  if (snapshot) for (const project of snapshot.projects.filter(project => edition === 'all' || project.edition === edition)) { const option = el('option', '', project.title); option.value = project.project_id; select.append(option); }
  select.value = [...select.options].some(option => option.value === old) ? old : 'all';
}
function translateStatic() {
  document.documentElement.lang = language;
  document.title = language === 'zh' ? '研究进度 · Yunbo' : 'Research Progress · Yunbo';
  for (const node of document.querySelectorAll('[data-i18n]')) node.textContent = t(node.dataset.i18n);
  $('language-button').textContent = language === 'zh' ? 'English' : '中文'; $('language-button').lang = language === 'zh' ? 'en' : 'zh'; $('language-button').setAttribute('aria-label', language === 'zh' ? 'Switch to English' : '切换至中文');
  $('snapshot-file').setAttribute('aria-label', t('import')); $('previous-day').setAttribute('aria-label', t('previousDay')); $('next-day').setAttribute('aria-label', t('nextDay')); $('selected-date').setAttribute('aria-label', t('reviewDate'));
  $('task-search').placeholder = t('searchPlaceholder'); $('status-filter').setAttribute('aria-label', t('allStates'));
  $('edition-filter').options[0].textContent = t('allEditions'); $('edition-filter').options[5].textContent = t('unknown');
  for (const option of $('status-filter').options) option.textContent = option.value === 'all' ? t('allStates') : option.value === 'running' ? t('runningNow') : t(option.value);
  updateProjects();
}
function renderStages(stages) {
  const container = $('stage-grid'); container.replaceChildren();
  stages.forEach(stage => {
    const card = el('article', `stage-card${stage.active > 0 ? ' has-active' : ''}`);
    card.append(el('div', 'stage-number', `${t('stage')} ${stage.stage.toString().padStart(2, '0')}`), el('h3', '', stageLabel(stage.stage)), el('p', 'stage-duration', `${hours(stage.active)} ${t('taskHours')}`), el('div', 'stage-count', `${stage.tasks} ${t('stageTasks')}`));
    card.append(el('div', 'stage-time-breakdown', `${t('waitingShort')} ${hours(stage.waiting)} · ${t('blockedShort')} ${hours(stage.blocked)}`));
    const bar = el('div', 'stage-bar'); bar.setAttribute('aria-hidden', 'true');
    for (const category of ['active', 'waiting', 'blocked', 'other']) { const part = el('span', category); part.style.width = `${stage.total > 0 ? stage[category] / stage.total * 100 : 0}%`; bar.append(part); }
    card.append(bar); container.append(card);
  });
}
function detailPair(grid, label, value) { const wrapper = el('div'); wrapper.append(el('dt', '', label), el('dd', '', value)); grid.append(wrapper); }
function textSection(parent, heading, value) { const section = el('section', 'detail-section'); section.append(el('h4', '', heading), el('p', '', value)); parent.append(section); }
function listSection(parent, heading, items) { if (!items.length) return; const section = el('section', 'detail-section'), list = el('ul'); section.append(el('h4', '', heading)); items.forEach(value => list.append(el('li', '', value))); section.append(list); parent.append(section); }
function statusBadge(observation) { return el('span', `status-badge ${observation.effectiveStatus}`, observation.effectiveStatus === 'unknown' ? t('uncertain') : t(observation.effectiveStatus)); }
function renderTask({ task, project }, bounds, now) {
  const observation = taskObservation(task, snapshot, now, observationThreshold), timing = taskDurations(task, snapshot, bounds, now);
  const card = el('details', 'task-card'); card.dataset.taskKey = `${project.project_id}\u0000${task.task_id}`;
  const summary = el('summary'), main = el('div'), titleLine = el('div', 'task-title-line'); titleLine.append(el('span', 'task-caret', '›'), el('span', 'task-title', task.title)); main.append(titleLine, el('p', 'task-description', task.description));
  const meta = el('div', 'task-meta'); meta.append(el('span', 'edition-tag', project.edition), el('span', 'project-tag', project.title), el('span', '', `· ${t('stage')} ${task.stage}`)); if (task.owner) meta.append(el('span', '', `· ${task.owner}`)); main.append(meta);
  const statusCol = el('div', 'task-status-col'); statusCol.append(statusBadge(observation));
  if (observation.effectiveStatus !== observation.recordedStatus) statusCol.append(el('span', 'recorded-status', `${t('recorded')}: ${t(task.status)}`));
  else if (!observation.fresh) statusCol.append(el('span', 'recorded-status', t('outcomeStale')));
  statusCol.append(el('span', 'task-time', timing.hasTiming ? `${hours(timing.active)} ${t('taskHours')} ${t('activeShort')}` : t('timingUnknown')), el('span', 'task-updated', `${t('updated')} ${ago(task.updated_at, now)}`));
  summary.append(main, statusCol); card.append(summary);
  const detail = el('div', 'task-detail'); detail.append(el('p', 'detail-description', task.description));
  if (observation.reasons.length) detail.append(el('p', 'task-observation', observation.reasons.map(reasonText).join(' · ')));
  const grid = el('dl', 'detail-grid'); detailPair(grid, t('taskId'), task.task_id); detailPair(grid, t('owner'), task.owner || t('notRecorded')); detailPair(grid, t('source'), task.source); detailPair(grid, t('started'), formatTime(task.started_at)); detailPair(grid, t('lastObservation'), formatTime(task.updated_at, true)); detailPair(grid, t('lease'), task.lease_until === null ? t('noLease') : formatTime(task.lease_until, true)); detailPair(grid, t('lastActivity'), formatTime(task.last_activity_at));
  if (task.run_id) detailPair(grid, t('runId'), task.run_id);
  const since = stateSince(task, snapshot); if (since) detailPair(grid, t(since.kind === 'observation' ? 'observationAge' : 'stateReported'), `${formatTime(since.timestamp)} · ${ago(since.timestamp, now)}`);
  detail.append(grid);
  if (task.blocker) textSection(detail, t('cause'), task.blocker); if (task.next_action) textSection(detail, t('nextAction'), task.next_action); listSection(detail, t('dependencies'), task.dependencies); listSection(detail, t('evidence'), task.evidence);
  if (timing.hasTiming) {
    const section = el('section', 'detail-section'); section.append(el('h4', '', t('durationByStage')));
    const table = el('table', 'timing-table'), head = el('thead'), headerRow = el('tr'), body = el('tbody');
    for (const label of ['stage', 'activeShort', 'waiting', 'blocked', 'other']) { const th = el('th', '', t(label)); th.scope = 'col'; headerRow.append(th); } head.append(headerRow); table.append(head, body);
    timing.stages.forEach((stage, index) => { if (stage.total <= 0) return; const row = el('tr'); row.append(el('td', '', `${index + 1}. ${stageLabel(index + 1)}`)); for (const key of ['active', 'waiting', 'blocked', 'other']) row.append(el('td', '', `${hours(stage[key])} h`)); body.append(row); });
    section.append(table); detail.append(section);
  }
  if (task.events.length) {
    const section = el('section', 'detail-section'), list = el('ol', 'event-list'); section.append(el('h4', '', t('events')));
    [...task.events].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).slice(0, 50).forEach(event => { const item = el('li'); item.append(el('span', 'event-time', `${formatTime(event.timestamp)} · ${t('stage')} ${event.stage} · ${t(event.status)}${event.run_id ? ` · ${t('runId')}: ${event.run_id}` : ''}`), el('span', '', event.summary)); list.append(item); });
    section.append(list); detail.append(section);
  }
  card.append(detail); return card;
}
function renderAttention(rows, projects, now) {
  const list = $('attention-list'); list.replaceChildren();
  const attention = rows.filter(({ task }) => task.blocker || task.status === 'blocked' || task.status === 'failed' || task.status === 'reconcile_required' || taskObservation(task, snapshot, now, observationThreshold).uncertain);
  put('attention-count', attention.length); $('no-attention').hidden = attention.length > 0;
  for (const { task, project } of attention) {
    const observation = taskObservation(task, snapshot, now, observationThreshold);
    const card = el('article', `attention-card${observation.uncertain ? ' uncertain-card' : ''}`), top = el('div', 'attention-top'); top.append(el('h3', '', task.title), statusBadge(observation)); card.append(top, el('div', 'attention-project', `${project.title} · ${project.edition}`));
    if (observation.reasons.length) card.append(el('p', '', observation.reasons.map(reasonText).join(' · ')));
    const since = stateSince(task, snapshot); if (since) card.append(el('p', '', `${t(since.kind === 'observation' ? 'observationAge' : 'stateReported')}: ${ago(since.timestamp, now)}`));
    card.append(el('div', 'field-label', t('cause')), el('p', '', task.blocker || (observation.uncertain ? observation.reasons.map(reasonText).join(' · ') : t('causeMissing'))), el('div', 'field-label', t('nextAction')), el('p', 'next-action', task.next_action || t('nextMissing'))); list.append(card);
  }
  const warnings = $('project-warnings'); warnings.replaceChildren();
  for (const project of projects) if (project.warnings.length) { const block = el('div', 'warning-block'), items = el('ul'); block.append(el('strong', '', `${t('warnings')} · ${project.title}`)); project.warnings.forEach(warning => items.append(el('li', '', warning))); block.append(items); warnings.append(block); }
}
function render() {
  $('empty-state').hidden = snapshot !== null; $('dashboard').hidden = snapshot === null; $('clear-button').disabled = snapshot === null; $('demo-banner').hidden = !isDemo;
  if (!snapshot) {
    for (const id of ['task-list', 'stage-grid', 'attention-list', 'project-warnings']) $(id).replaceChildren();
    for (const id of ['filename', 'snapshot-time', 'snapshot-state', 'snapshot-warning', 'watch-state', 'day-label', 'day-length']) put(id, '');
    for (const key of ['running', 'uncertain', 'waiting', 'blocked', 'complete', 'failed']) put(`count-${key}`, '0');
    for (const key of ['active', 'waiting', 'blocked', 'other']) put(`time-${key}`, '0.00');
    for (const id of ['task-count', 'attention-count', 'daily-activity', 'daily-completed', 'daily-new-blockers']) put(id, '0');
    put('task-pagination-label', ''); $('task-pagination').hidden = true;
    $('filename').removeAttribute('title'); return;
  }
  const now = Date.now(), date = $('selected-date').value || dateInTimezone(now), bounds = dayBounds(date);
  const edition = $('edition-filter').value, projectId = $('project-filter').value;
  const projects = snapshot.projects.filter(project => (edition === 'all' || project.edition === edition) && (projectId === 'all' || project.project_id === projectId));
  const rows = projects.flatMap(project => project.tasks.map(task => ({ task, project })));
  const summary = summarize(rows, snapshot, bounds, now, observationThreshold);
  const generated = Date.parse(snapshot.generated_at), freshSnapshot = now - generated <= observationThreshold * 1000 && generated <= now + 60000;
  put('snapshot-state', t(freshSnapshot ? 'freshSnapshot' : 'staleSnapshot')); $('snapshot-dot').classList.toggle('stale', !freshSnapshot);
  put('filename', filename); $('filename').title = `${filename} · ${t('capturedTimezone')}: ${snapshot.timezone}`; put('snapshot-time', formatTime(snapshot.generated_at, true)); put('watch-state', t(watchedHandle ? 'watching' : 'manualImport')); $('snapshot-warning').hidden = freshSnapshot; put('snapshot-warning', t('snapshotWarning'));
  for (const key of ['running', 'uncertain', 'waiting', 'blocked', 'complete', 'failed']) put(`count-${key}`, summary.counts[key]);
  for (const key of ['active', 'waiting', 'blocked', 'other']) put(`time-${key}`, hours(summary.durations[key]));
  put('daily-activity', summary.daily.activity); put('daily-completed', summary.daily.completed); put('daily-new-blockers', summary.daily.newBlockers);
  put('day-label', new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-GB', { timeZone: 'Europe/London', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(bounds.start + 12 * 3600000))); put('day-length', `${bounds.hours} ${t('calendarHours')}`);
  renderStages(summary.stages); renderAttention(rows, projects, now);
  const search = $('task-search').value.trim().toLocaleLowerCase(), state = $('status-filter').value;
  const visible = rows.filter(({ task, project }) => {
    const observation = taskObservation(task, snapshot, now, observationThreshold);
    if (state === 'running' ? !observation.liveRunning : state === 'uncertain' ? !observation.uncertain : state !== 'all' && observation.effectiveStatus !== state) return false;
    if ($('day-only').checked && !taskActiveOnDate(task, snapshot, bounds, now)) return false;
    return !search || [task.title, task.description, task.owner, task.task_id, project.title, task.blocker, task.next_action].some(value => value.toLocaleLowerCase().includes(search));
  });
  const rank = task => { const ob = taskObservation(task, snapshot, now, observationThreshold); return ob.liveRunning ? 0 : task.status === 'blocked' ? 1 : task.status === 'failed' ? 2 : ob.uncertain ? 3 : task.status === 'waiting' ? 4 : task.status === 'pending' ? 5 : 6; };
  visible.sort((a, b) => rank(a.task) - rank(b.task) || (Date.parse(b.task.updated_at || '1970-01-01') - Date.parse(a.task.updated_at || '1970-01-01')) || a.task.title.localeCompare(b.task.title));
  const list = $('task-list'), openKeys = new Set([...list.querySelectorAll('details[open]')].map(node => node.dataset.taskKey));
  const focusedKey = list.contains(document.activeElement) ? document.activeElement.closest('details')?.dataset.taskKey : null;
  list.replaceChildren();
  for (const row of visible.slice(0, visibleLimit)) { const card = renderTask(row, bounds, now); card.open = openKeys.has(card.dataset.taskKey); list.append(card); if (focusedKey === card.dataset.taskKey) card.querySelector('summary').focus({ preventScroll: true }); }
  put('task-count', `${visible.length} / ${rows.length}`); $('no-tasks').hidden = visible.length > 0; list.hidden = visible.length === 0;
  $('task-pagination').hidden = visible.length <= visibleLimit; put('task-pagination-label', `${t('showing')} ${Math.min(visible.length, visibleLimit)} ${t('of')} ${visible.length}`);
}

$('snapshot-file').addEventListener('change', event => { const file = event.target.files?.[0]; if (file) importFile(file); event.target.value = ''; });
$('clear-button').addEventListener('click', clearSnapshot); $('dismiss-demo').addEventListener('click', clearSnapshot);
$('watch-button').hidden = typeof window.showOpenFilePicker !== 'function'; $('watch-button').addEventListener('click', watchFile);
$('demo-button').addEventListener('click', () => { importToken++; stopWatching(); commitSnapshot(createDemo(), language === 'zh' ? '合成示例 · 20 个示例任务' : 'Synthetic demo · 20 illustrative tasks', true); $('message').hidden = true; });
$('language-button').addEventListener('click', () => { language = language === 'en' ? 'zh' : 'en'; translateStatic(); render(); });
$('edition-filter').addEventListener('change', () => { updateProjects(); render(); });
for (const id of ['project-filter', 'status-filter', 'day-only', 'selected-date']) $(id).addEventListener('change', render);
$('task-search').addEventListener('input', render);
$('load-more').addEventListener('click', () => { visibleLimit += 100; render(); });
$('freshness-minutes').addEventListener('change', () => {
  const seconds = Number($('freshness-minutes').value) * 60;
  if (!Number.isFinite(seconds) || seconds < 1 || seconds > 604800) { $('freshness-minutes').value = String(observationThreshold / 60); notify(t('thresholdInvalid'), true); return; }
  observationThreshold = seconds; render();
});
function changeDate(delta) { const date = $('selected-date').value || dateInTimezone(); const value = new Date(`${date}T12:00:00Z`); value.setUTCDate(value.getUTCDate() + delta); $('selected-date').value = value.toISOString().slice(0, 10); render(); }
$('previous-day').addEventListener('click', () => changeDate(-1)); $('next-day').addEventListener('click', () => changeDate(1)); $('today-button').addEventListener('click', () => { $('selected-date').value = dateInTimezone(); render(); });
document.addEventListener('dragover', event => { if (event.dataTransfer?.types.includes('Files')) { event.preventDefault(); $('drop-zone').classList.add('drag-over'); document.body.classList.add('body-drag'); } });
document.addEventListener('dragleave', event => { if (!event.relatedTarget) { $('drop-zone').classList.remove('drag-over'); document.body.classList.remove('body-drag'); } });
document.addEventListener('drop', event => { event.preventDefault(); $('drop-zone').classList.remove('drag-over'); document.body.classList.remove('body-drag'); const files = event.dataTransfer?.files; if (files?.length !== 1) { notify(t('oneFile'), true); return; } importFile(files[0]); });
window.addEventListener('pagehide', clearSnapshot);
$('selected-date').value = dateInTimezone(); translateStatic(); render();
// Age is observational. A fixed snapshot never accrues invented work after capture.
setInterval(() => { if (snapshot) render(); }, 30000);
