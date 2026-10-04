export function sphere(lat, lon) {
  return [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
}

export function rotate([x, y, z], yaw, pitch) {
  const xx = x * Math.cos(yaw) + z * Math.sin(yaw);
  const zz = z * Math.cos(yaw) - x * Math.sin(yaw);
  return [xx, y * Math.cos(pitch) - zz * Math.sin(pitch), y * Math.sin(pitch) + zz * Math.cos(pitch)];
}

export function project([x, y, z], cx, cy, radius) {
  return { x: cx + x * radius, y: cy - y * radius, depth: z, visible: z > 0.015 };
}

export function clipFront(polygon) {
  const result = [];
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i], b = polygon[(i + 1) % polygon.length];
    if (a[2] >= 0) result.push(a);
    if ((a[2] >= 0) !== (b[2] >= 0)) {
      const t = a[2] / (a[2] - b[2]);
      result.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]), 0]);
    }
  }
  return result;
}

export function greatCircle(a, b, steps = 24) {
  const dot = Math.max(-1, Math.min(1, a.reduce((sum, value, i) => sum + value * b[i], 0)));
  const angle = Math.acos(dot), sine = Math.sin(angle);
  if (angle < 1e-7) return Array.from({ length: steps + 1 }, () => [...a]);
  // The atlas contains no antipodal task pair; choose a stable orthogonal arc if one is added.
  if (Math.abs(sine) < 1e-7) {
    const basis = Math.abs(a[0]) < 0.8 ? [1, 0, 0] : [0, 1, 0];
    const d = a.reduce((sum, value, i) => sum + value * basis[i], 0);
    const tangent = basis.map((value, i) => value - d * a[i]);
    const norm = Math.hypot(...tangent);
    return Array.from({ length: steps + 1 }, (_, i) => i === 0 ? a : i === steps ? b : a.map((value, k) => value * Math.cos(Math.PI * i / steps) + tangent[k] / norm * Math.sin(Math.PI * i / steps)));
  }
  return Array.from({ length: steps + 1 }, (_, i) => {
    if (i === 0) return a;
    if (i === steps) return b;
    const t = i / steps, aa = Math.sin((1 - t) * angle) / sine, bb = Math.sin(t * angle) / sine;
    return a.map((value, k) => value * aa + b[k] * bb);
  });
}

export function pickNode(points, x, y, radius = 12) {
  let chosen = null, distance = radius * radius;
  for (const p of points) {
    if (!p.visible) continue;
    const d = (p.x - x) ** 2 + (p.y - y) ** 2;
    if (d < distance) { distance = d; chosen = p; }
  }
  return chosen;
}

export function validateAtlas(data) {
  if (data.modules.length !== data.total_modules || data.nodes.length !== data.total_nodes || data.edges.length !== data.total_connections) throw new Error('Atlas counts disagree');
  const modules = new Set(data.modules.map(m => m.id)), nodes = new Set(data.nodes.map(n => n.id));
  if (modules.size !== data.modules.length || nodes.size !== data.nodes.length) throw new Error('Duplicate atlas identifier');
  for (const node of data.nodes) if (!modules.has(node.module)) throw new Error(`Unknown module ${node.module}`);
  for (const edge of data.edges) if (!nodes.has(edge.from) || !nodes.has(edge.to)) throw new Error(`Unknown node in ${edge.id}`);
}
