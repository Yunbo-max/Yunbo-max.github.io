import { sphere, rotate, project, clipFront, greatCircle, pickNode, validateAtlas } from './globe-geometry.mjs?v=20261004';

const $ = selector => document.querySelector(selector);
const shell = $('#research-atlas');

if (shell) start().catch(error => {
  shell.dataset.ready = 'false';
  $('#atlas-error').hidden = false;
  $('#atlas-status').textContent = 'The globe could not load. The full module directory remains available below.';
  console.error('Research atlas:', error.message);
});

async function start() {
  const response = await fetch('/assets/lab/research-atlas.json?v=20261004', { cache: 'no-cache' });
  if (!response.ok) throw new Error('Atlas data unavailable');
  const data = await response.json();
  validateAtlas(data);
  const canvas = $('#research-globe'), ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  const modules = new Map(data.modules.map(m => [m.id, m]));
  const nodes = new Map(data.nodes.map(n => [n.id, n]));
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const pause = $('#globe-pause'), select = $('#module-select'), edgeToggle = $('#globe-connections');
  let yaw = 0, pitch = 0, selectedModule = 'L', selectedNode = 'L01';
  let width = 0, height = 0, radius = 0, cx = 0, cy = 0, visibleNodes = [];
  let running = !motionPreference.matches, inView = true, frameId = 0, previousTime = 0, pointer = null;
  const coords = new Map();
  const continents = data.modules.map((m, index) => {
    const lat = m.lat, lon = m.lon, center = sphere(lat, lon);
    const east = [Math.cos(lon), 0, -Math.sin(lon)];
    const north = [-Math.sin(lat) * Math.sin(lon), Math.cos(lat), -Math.sin(lat) * Math.cos(lon)];
    const local = (angle, bearing) => center.map((value, k) => value * Math.cos(angle) + (east[k] * Math.cos(bearing) + north[k] * Math.sin(bearing)) * Math.sin(angle));
    const coast = Array.from({ length: 72 }, (_, i) => {
      const t = i / 72 * Math.PI * 2;
      const size = 0.345 * (1 + 0.13 * Math.sin(t * 3 + index * 1.7) + 0.09 * Math.cos(t * 5 - index));
      return local(size, t);
    });
    const tasks = data.nodes.filter(n => n.module === m.id);
    tasks.forEach((n, i) => coords.set(n.id, i === 0 ? center : local(0.175 + (i % 2) * 0.035, (i - 1) / (tasks.length - 1) * Math.PI * 2 + index * 0.4)));
    return { ...m, center, coast };
  });
  const graticule = [];
  for (let lat = -60; lat <= 60; lat += 30) graticule.push(Array.from({ length: 121 }, (_, i) => sphere(lat * Math.PI / 180, i / 120 * Math.PI * 2)));
  for (let lon = 0; lon < 360; lon += 30) graticule.push(Array.from({ length: 81 }, (_, i) => sphere(-Math.PI / 2 + i / 80 * Math.PI, lon * Math.PI / 180)));

  function camera(p) { return rotate(p, yaw, pitch); }
  function screen(p) { return project(camera(p), cx, cy, radius); }
  function paintLine(points, color, lineWidth = 1, dashed = false) {
    ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.setLineDash(dashed ? [3, 4] : []); ctx.beginPath();
    let drawing = false;
    for (const vector of points) {
      const p = screen(vector);
      if (!p.visible) { drawing = false; continue; }
      if (drawing) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
      drawing = true;
    }
    ctx.stroke(); ctx.setLineDash([]);
  }

  function draw() {
    if (!width || !height) return;
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < 46; i++) {
      const x = ((i * 137.3 + 31) % 997) / 997 * width, y = ((i * 83.7 + 7) % 661) / 661 * height;
      ctx.fillStyle = i % 3 ? '#b9d1c225' : '#b9d1c245'; ctx.fillRect(x, y, 1.2, 1.2);
    }
    const halo = ctx.createRadialGradient(cx, cy, radius * 0.84, cx, cy, radius * 1.18);
    halo.addColorStop(0, '#6dbaa100'); halo.addColorStop(0.63, '#6dbaa127'); halo.addColorStop(1, '#6dbaa100');
    ctx.fillStyle = halo; ctx.fillRect(cx - radius * 1.2, cy - radius * 1.2, radius * 2.4, radius * 2.4);
    const sea = ctx.createRadialGradient(cx - radius * 0.4, cy - radius * 0.4, 0, cx, cy, radius * 1.1);
    sea.addColorStop(0, '#2c545b'); sea.addColorStop(0.58, '#1a3c46'); sea.addColorStop(1, '#0b242f');
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fillStyle = sea; ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.clip();
    for (const c of continents) {
      const center = camera(c.center), coast = c.coast.map(camera);
      ctx.fillStyle = c.color; ctx.strokeStyle = c.color; ctx.lineWidth = 0.45;
      ctx.globalAlpha = c.id === selectedModule ? 0.94 : 0.72;
      for (let i = 0; i < coast.length; i++) {
        const poly = clipFront([center, coast[i], coast[(i + 1) % coast.length]]);
        if (poly.length < 3) continue;
        ctx.beginPath();
        poly.forEach((p, index) => { const s = project(p, cx, cy, radius); if (index) ctx.lineTo(s.x, s.y); else ctx.moveTo(s.x, s.y); });
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      paintLine([...c.coast, c.coast[0]], c.id === selectedModule ? '#e6efcbb5' : '#dbecd05a', 0.8);
    }
    graticule.forEach(line => paintLine(line, '#c5e6d916', 0.6));
    const shade = ctx.createRadialGradient(cx - radius * 0.42, cy - radius * 0.46, radius * 0.15, cx + radius * 0.5, cy + radius * 0.3, radius * 1.55);
    shade.addColorStop(0, '#08182400'); shade.addColorStop(0.6, '#08182415'); shade.addColorStop(1, '#081824bc');
    ctx.fillStyle = shade; ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    if (edgeToggle.checked) for (const e of data.edges) {
      if (e.from !== selectedNode && e.to !== selectedNode) continue;
      paintLine(greatCircle(coords.get(e.from), coords.get(e.to), 36), e.from === selectedNode ? '#efdb9a9c' : '#d8e8d16c', 1.15, e.from !== selectedNode);
    }
    visibleNodes = [];
    for (const node of data.nodes) {
      const p = screen(coords.get(node.id));
      visibleNodes.push({ ...p, id: node.id });
      if (!p.visible) continue;
      const active = node.id === selectedNode, inModule = node.module === selectedModule;
      ctx.globalAlpha = Math.min(1, p.depth * 1.9);
      if (active) { ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI * 2); ctx.strokeStyle = '#fff3b7'; ctx.lineWidth = 1; ctx.stroke(); }
      ctx.beginPath(); ctx.arc(p.x, p.y, active ? 4.4 : inModule ? 3.4 : 2.4, 0, Math.PI * 2);
      ctx.fillStyle = active ? '#fff4b5' : '#e3efdb'; ctx.fill();
      if (inModule && p.depth > 0.4) { ctx.fillStyle = '#f3f5d9'; ctx.font = '9px Arial'; ctx.textAlign = 'center'; ctx.fillText(node.id, p.x, p.y + 16); }
    }
    ctx.globalAlpha = 1;
    for (const c of continents) {
      const p = screen(c.center);
      if (p.depth < 0.4) continue;
      ctx.fillStyle = c.id === selectedModule ? '#fff4b5' : '#e3efdb';
      ctx.font = '600 9px Arial'; ctx.textAlign = 'center'; ctx.fillText(`${c.id} / ${c.short.toUpperCase()}`, p.x, p.y - 23);
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.strokeStyle = '#a5d7c758'; ctx.lineWidth = 1; ctx.stroke();
    canvas.dataset.orientation = `${yaw.toFixed(4)},${pitch.toFixed(4)}`;
    canvas.dataset.visibleNodes = String(visibleNodes.filter(n => n.visible).length);
  }

  function frame(now) {
    const elapsed = previousTime ? Math.min((now - previousTime) / 1000, 0.08) : 0;
    previousTime = now; yaw += elapsed * 0.085; draw(); frameId = requestAnimationFrame(frame);
  }
  function syncAnimation() {
    cancelAnimationFrame(frameId); frameId = 0; previousTime = 0;
    pause.textContent = running ? 'Pause rotation' : 'Resume rotation';
    canvas.dataset.rotating = String(running && inView && !document.hidden);
    if (running && inView && !document.hidden) frameId = requestAnimationFrame(frame);
  }
  function stop() { running = false; syncAnimation(); }
  function centerModule(id) { const m = modules.get(id); yaw = -m.lon; pitch = m.lat; }
  function chooseNode(id, recenter = true, updateHash = true) {
    const node = nodes.get(id); if (!node) return;
    selectedNode = id; selectedModule = node.module;
    if (recenter) centerModule(selectedModule);
    const m = modules.get(selectedModule);
    select.value = m.id;
    $('#module-code').textContent = `${m.id} / ${data.nodes.filter(n => n.module === m.id).length} TASKS`;
    $('#module-swatch').style.background = m.color;
    $('#module-name').textContent = m.label;
    $('#module-description').textContent = m.description;
    const tasks = $('#task-picker'); tasks.replaceChildren();
    for (const n of data.nodes.filter(n => n.module === m.id)) {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.node = n.id; button.setAttribute('aria-pressed', String(n.id === id));
      const code = document.createElement('code'); code.textContent = n.id;
      const label = document.createElement('span'); label.textContent = n.label; button.append(code, label); tasks.append(button);
    }
    const edges = data.edges.filter(e => e.from === id || e.to === id), links = $('#connection-list'); links.replaceChildren();
    $('#connection-title').textContent = `${id} · ${edges.length} connections`;
    for (const edge of edges) {
      const target = edge.from === id ? edge.to : edge.from, other = nodes.get(target);
      const li = document.createElement('li'), button = document.createElement('button');
      button.type = 'button'; button.dataset.node = target; button.textContent = `${edge.from} → ${edge.to}`;
      button.title = `${edge.type}: ${other.label}`; button.setAttribute('aria-label', `${edge.from} to ${edge.to}, ${edge.type}; view ${other.label}`);
      li.append(button); links.append(li);
    }
    $('#atlas-status').textContent = `${m.label}: ${node.label} (${id}), ${edges.length} connections.`;
    canvas.setAttribute('aria-label', `Research globe: ${m.label} selected. 16 module continents and 84 research tasks. Use arrow keys to rotate.`);
    if (updateHash) history.replaceState(null, '', `#node-${id}`);
    draw();
  }
  function chooseModule(id) { const node = data.nodes.find(n => n.module === id); if (node) chooseNode(node.id); }
  function resize() {
    const rect = canvas.getBoundingClientRect(), ratio = Math.min(devicePixelRatio || 1, 2);
    width = rect.width; height = rect.height;
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio); ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    radius = Math.min(width * 0.42, height * 0.425); cx = width / 2; cy = height * 0.52; draw();
  }

  select.disabled = false; shell.dataset.ready = 'true';
  shell.querySelectorAll('button:disabled').forEach(button => { button.disabled = false; });
  select.addEventListener('change', () => { stop(); chooseModule(select.value); });
  pause.addEventListener('click', () => { running = !running; syncAnimation(); });
  $('#globe-left').addEventListener('click', () => { stop(); yaw -= 0.35; draw(); });
  $('#globe-right').addEventListener('click', () => { stop(); yaw += 0.35; draw(); });
  edgeToggle.addEventListener('change', draw);
  document.addEventListener('click', event => {
    const task = event.target.closest('[data-node]'), module = event.target.closest('[data-module]');
    if (task) {
      event.preventDefault(); stop(); chooseNode(task.dataset.node);
      if (task.closest('.module-directory')) $('#map').scrollIntoView({ block: 'start' });
    } else if (module) {
      stop(); chooseModule(module.dataset.module); $('#map').scrollIntoView({ block: 'start' });
    }
  });
  canvas.addEventListener('pointerdown', event => {
    stop(); pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, moved: false };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    if (Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY) > 5) pointer.moved = true;
    yaw += dx * 0.006;
    if (event.pointerType !== 'touch') pitch = Math.max(-1.4, Math.min(1.4, pitch - dy * 0.006));
    pointer.x = event.clientX; pointer.y = event.clientY; draw();
  });
  canvas.addEventListener('pointerup', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const moved = pointer.moved; pointer = null;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    if (moved) return;
    const rect = canvas.getBoundingClientRect(), x = event.clientX - rect.left, y = event.clientY - rect.top;
    const task = pickNode(visibleNodes, x, y, 14);
    if (task) { chooseNode(task.id, false); return; }
    let chosen = null, best = 0.92;
    const sx = (x - cx) / radius, sy = (cy - y) / radius;
    if (sx * sx + sy * sy > 1) return;
    const surface = [sx, sy, Math.sqrt(1 - sx * sx - sy * sy)];
    for (const c of continents) {
      const p = camera(c.center), dot = p.reduce((sum, value, k) => sum + value * surface[k], 0);
      if (dot > best) { best = dot; chosen = c; }
    }
    if (chosen) chooseModule(chosen.id);
  });
  canvas.addEventListener('pointercancel', () => { pointer = null; });
  canvas.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)) return;
    event.preventDefault();
    if (event.key === ' ') { running = !running; syncAnimation(); return; }
    stop();
    if (event.key === 'ArrowLeft') yaw -= 0.13;
    if (event.key === 'ArrowRight') yaw += 0.13;
    if (event.key === 'ArrowUp') pitch = Math.min(1.4, pitch + 0.13);
    if (event.key === 'ArrowDown') pitch = Math.max(-1.4, pitch - 0.13);
    draw();
  });
  motionPreference.addEventListener('change', () => { if (motionPreference.matches) stop(); });
  document.addEventListener('visibilitychange', syncAnimation);
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; syncAnimation(); }, { threshold: 0.1 }).observe(canvas);
  const hashNode = location.hash.startsWith('#node-') ? location.hash.slice(6) : null;
  if (hashNode && nodes.has(hashNode)) { selectedNode = hashNode; running = false; }
  centerModule(nodes.get(selectedNode).module); chooseNode(selectedNode, true, false); resize(); syncAnimation();
}
