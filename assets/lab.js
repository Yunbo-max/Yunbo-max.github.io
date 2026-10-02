(() => {
  'use strict';
  const qs = selector => document.querySelector(selector);
  document.querySelectorAll('.site-header nav a').forEach(link => {
    if (link.pathname === location.pathname) link.setAttribute('aria-current', 'page');
  });
  const menu = qs('.menu-button'), nav = qs('#main-nav');
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open);
  });
  if (!qs('.navigation-demo')) return;
  Promise.all([
    fetch('/assets/lab/navigation-demo.json').then(response => {
      if (!response.ok) throw new Error('Navigation unavailable');
      return response.json();
    }),
    import('/assets/lab/navigation-model.mjs')
  ]).then(([data, { createNavigation }]) => navigation(data, createNavigation)).catch(() => {
    qs('#map-status').textContent = 'The navigation demo could not load. Please reload to try again.';
  });

  function navigation(data, createNavigation) {
    const player = createNavigation(data), shell = qs('.navigation-demo'), svg = qs('#research-map');
    const example = qs('#route-example'), play = qs('#route-play'), previous = qs('#route-previous'), next = qs('#route-next'), reset = qs('#route-reset');
    const positions = new Map(), taskElements = new Map(), edgeElements = new Map();
    const tasks = new Map(data.nodes.map(node => [node.id, node]));
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const ns = 'http://www.w3.org/2000/svg';
    const element = (tag, attributes = {}, text) => {
      const node = document.createElementNS(ns, tag);
      for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
      if (text !== undefined) node.textContent = text;
      return node;
    };
    const regions = element('g', {'data-layer':'regions'}), edges = element('g', {'data-layer':'connections'}), points = element('g', {'data-layer':'tasks'});
    svg.append(regions, edges, points);
    data.regions.forEach(region => {
      const x = 14 + region.col * 278, y = 12 + region.row * 164;
      const group = element('g', {'data-region':region.id});
      group.append(
        element('rect',{x,y,width:258,height:148,rx:15,fill:region.color}),
        element('rect',{x:x+14,y:y+13,width:25,height:25,rx:8,class:'navigation-region-key'}),
        element('text',{x:x+26.5,y:y+31,'text-anchor':'middle',class:'navigation-region-letter'},region.id),
        element('text',{x:x+49,y:y+31,class:'navigation-region-name'},region.name)
      );
      regions.append(group);
      const regionTasks = data.nodes.filter(task => task.region === region.id);
      regionTasks.forEach((task, index) => positions.set(task.id,{x:x+(regionTasks.length === 1 ? 129 : 59+index*140),y:y+80}));
    });
    data.edges.forEach(edge => {
      const a = positions.get(edge.from), b = positions.get(edge.to);
      const dx = b.x - a.x, dy = b.y - a.y;
      let path;
      if (Math.abs(dy) < 1) {
        const bend = dx < 0 ? -22 : 0;
        path = `M ${a.x} ${a.y} Q ${(a.x+b.x)/2} ${a.y+bend} ${b.x} ${b.y}`;
      } else {
        const bend = Math.abs(dx) > 300 ? -60 : 0;
        path = `M ${a.x} ${a.y} C ${a.x+bend} ${(a.y+b.y)/2} ${b.x+bend} ${(a.y+b.y)/2} ${b.x} ${b.y}`;
      }
      const id = `${edge.from}>${edge.to}`;
      const line = element('path',{d:path,class:'navigation-edge','data-connection':id});
      line.append(element('title',{},`${tasks.get(edge.from).label} → ${tasks.get(edge.to).label}`));
      edges.append(line); edgeElements.set(id,line);
    });
    data.nodes.forEach(task => {
      const position = positions.get(task.id);
      const group = element('g',{class:'navigation-task','data-task':task.id,role:'button',tabindex:0,'aria-label':`Explore ${task.label}`});
      group.append(
        element('rect',{x:position.x-59,y:position.y-21,width:118,height:61,rx:9,fill:'transparent'}),
        element('circle',{cx:position.x,cy:position.y,r:7,class:'navigation-task-point'}),
        element('text',{x:position.x,y:position.y+29,'text-anchor':'middle',class:'navigation-task-label'},task.label)
      );
      const choose = () => {
        const state = player.snapshot();
        const stops = state.scenario.steps.map((step,index) => step.node === task.id ? index : -1).filter(index => index >= 0);
        if (!stops.length) return;
        const destination = stops.find(index => index >= state.index) ?? stops[0];
        player.seek(destination); render();
      };
      group.addEventListener('click',choose);
      group.addEventListener('keydown',event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(); } });
      points.append(group); taskElements.set(task.id,group);
    });
    const location = element('g',{class:'navigation-location','aria-hidden':'true'});
    location.append(element('circle',{r:17,class:'navigation-location-ring'}),element('circle',{r:7,class:'navigation-location-core'}));
    svg.append(location);
    for (const scenario of data.scenarios) {
      const option = document.createElement('option'); option.value = scenario.id; option.textContent = scenario.title; example.append(option);
    }
    example.options[0].remove(); example.disabled = false;
    let previousState = null, animation = 0, timer = 0;
    function place(point) { location.setAttribute('transform',`translate(${point.x} ${point.y})`); }
    function move(state) {
      cancelAnimationFrame(animation);
      const target = positions.get(state.current.node);
      if (reducedMotion.matches || !previousState || previousState.scenario.id !== state.scenario.id || state.index !== previousState.index + 1) { place(target); return; }
      const path = edgeElements.get(`${previousState.current.node}>${state.current.node}`), length = path.getTotalLength(), start = performance.now();
      const frame = now => {
        const progress = Math.min(1,(now-start)/900), eased = progress*progress*(3-2*progress);
        place(path.getPointAtLength(length*eased));
        if (progress < 1) animation = requestAnimationFrame(frame);
      };
      animation = requestAnimationFrame(frame);
    }
    function buildStops(state) {
      const list = qs('#route-stops'); list.replaceChildren();
      state.scenario.steps.forEach((step,index) => {
        const item = document.createElement('li'), button = document.createElement('button');
        button.type = 'button'; button.dataset.stop = index;
        button.textContent = `${String(index+1).padStart(2,'0')} ${tasks.get(step.node).label}`;
        button.setAttribute('aria-label',`Stop ${index+1}: ${tasks.get(step.node).label}`);
        button.addEventListener('click',() => { player.seek(index); render(); });
        item.append(button); list.append(item);
      });
    }
    function render() {
      const state = player.snapshot(), route = state.scenario.steps;
      clearInterval(timer);
      if (state.playing) timer = setInterval(() => { player.tick(); render(); },3800);
      if (!previousState || previousState.scenario.id !== state.scenario.id) buildStops(state);
      const routeTasks = new Set(route.map(step => step.node)), visited = new Set(state.visited);
      const routeEdges = new Set(), pastEdges = new Set();
      for (let index = 1; index < route.length; index++) {
        const id = `${route[index-1].node}>${route[index].node}`; routeEdges.add(id);
        if (index <= state.index) pastEdges.add(id);
      }
      taskElements.forEach((group,id) => {
        const included = routeTasks.has(id);
        group.classList.toggle('outside-route',!included);
        group.classList.toggle('visited',visited.has(id));
        group.classList.toggle('current',id === state.current.node);
        group.setAttribute('tabindex',included ? '0' : '-1');
        group.setAttribute('aria-disabled',String(!included));
      });
      edgeElements.forEach((line,id) => {
        line.classList.toggle('on-route',routeEdges.has(id));
        line.classList.toggle('traveled',pastEdges.has(id));
        line.classList.toggle('current-handoff',Boolean(state.next && id === `${state.current.node}>${state.next.node}`));
      });
      shell.classList.toggle('playing',state.playing);
      shell.classList.toggle('rerouting',state.current.kind === 'reroute');
      play.textContent = state.playing ? 'Ⅱ Pause' : state.complete ? '↻ Replay route' : '▶ Play route';
      play.disabled = false; reset.disabled = false;
      play.setAttribute('aria-pressed',String(state.playing));
      previous.disabled = state.index === 0; next.disabled = state.complete;
      qs('#route-kicker').textContent = 'EXAMPLE RESEARCH QUESTION';
      qs('#route-question').textContent = state.scenario.question;
      qs('#route-resources').textContent = state.scenario.resources;
      qs('#route-kind').textContent = ({human:'Human direction',check:'Evidence check',reroute:'Route updated',result:'Example observation'})[state.current.kind] || 'Research step';
      qs('#route-progress').textContent = `${String(state.index+1).padStart(2,'0')} / ${route.length}`;
      qs('#route-current').textContent = tasks.get(state.current.node).label;
      qs('#route-note').textContent = state.current.note;
      qs('#route-upcoming').textContent = state.next ? tasks.get(state.next.node).label : 'Example journey complete';
      qs('#map-status').textContent = 'Illustrative projects and observations · 16 research regions · '+ (state.playing ? 'Playing' : 'Paused') + ' · Choose a stop to explore.';
      document.querySelectorAll('#route-stops button').forEach(button => {
        const selected = Number(button.dataset.stop) === state.index;
        if (selected) button.setAttribute('aria-current','step'); else button.removeAttribute('aria-current');
        button.classList.toggle('passed',Number(button.dataset.stop) < state.index);
      });
      if (previousState && (previousState.index !== state.index || previousState.scenario.id !== state.scenario.id)) {
        const button = qs('#route-stops [aria-current="step"]'), list = qs('#route-stops');
        if (button.offsetLeft < list.scrollLeft || button.offsetLeft+button.offsetWidth > list.scrollLeft+list.clientWidth) list.scrollTo({left:Math.max(0,button.offsetLeft-25),behavior:reducedMotion.matches ? 'instant' : 'smooth'});
      }
      move(state); previousState = state;
    }
    example.addEventListener('change',() => { player.chooseScenario(example.value); render(); });
    play.addEventListener('click',() => { if (player.snapshot().playing) player.pause(); else player.play(); render(); });
    previous.addEventListener('click',() => { player.seek(player.snapshot().index-1); render(); });
    next.addEventListener('click',() => { player.pause(); player.next(); render(); });
    reset.addEventListener('click',() => { player.reset(); render(); });
    document.addEventListener('visibilitychange',() => { if (document.hidden) { player.pause(); render(); } });
    render();
  }
})();
