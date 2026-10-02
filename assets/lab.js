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
    import('/assets/lab/navigation-model.mjs'),
    import('/assets/lab/city-network.mjs'),
    import('/assets/lab/city-scene.mjs')
  ]).then(([data, { createNavigation }, network, scene]) => navigation(data, createNavigation, network, scene)).catch(() => {
    qs('#map-status').textContent = 'The navigation demo could not load. Please reload to try again.';
  });

  function navigation(data, createNavigation, {createCityNetwork,roadPose,streetPath}, {cityScene,cityTasks,demoRoadClosures,vehicleSvg}) {
    const player = createNavigation(data), shell = qs('.navigation-demo'), svg = qs('#research-map');
    const example = qs('#route-example'), play = qs('#route-play'), previous = qs('#route-previous'), next = qs('#route-next'), reset = qs('#route-reset');
    const city = createCityNetwork(data), positions = city.positions, taskElements = new Map(), edgeElements = new Map(), streetRoutes = new Map();
    shell.classList.add('city-mode'); svg.classList.add('city-map');
    const tasks = new Map(data.nodes.map(node => [node.id, node]));
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const ns = 'http://www.w3.org/2000/svg';
    const element = (tag, attributes = {}, text) => {
      const node = document.createElementNS(ns, tag);
      for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
      if (text !== undefined) node.textContent = text;
      return node;
    };
    const parser = new DOMParser();
    const appendMarkup = markup => {
      const parsed = parser.parseFromString(`<svg xmlns="${ns}">${markup}</svg>`,'image/svg+xml');
      svg.append(...Array.from(parsed.documentElement.childNodes));
    };
    appendMarkup(cityScene(data,city));
    const edges=element('g',{'data-layer':'connections'});svg.append(edges);
    data.edges.forEach(edge=>{
      const id=`${edge.from}>${edge.to}`,route=city.route(edge.from,edge.to);
      const line=element('path',{d:streetPath(route.points),class:'navigation-edge','data-connection':id});
      line.append(element('title',{},`${tasks.get(edge.from).label} → ${tasks.get(edge.to).label}`));
      edges.append(line);edgeElements.set(id,line);streetRoutes.set(id,route);
    });
    appendMarkup(cityTasks(data,city));
    data.nodes.forEach(task => {
      const group=svg.querySelector(`[data-task="${task.id}"]`);
      const choose = () => {
        const state = player.snapshot();
        const stops = state.scenario.steps.map((step,index) => step.node === task.id ? index : -1).filter(index => index >= 0);
        if (!stops.length) return;
        const destination = stops.find(index => index >= state.index) ?? stops[0];
        player.seek(destination); render();
      };
      group.addEventListener('click',choose);
      group.addEventListener('keydown',event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(); } });
      taskElements.set(task.id,group);
    });
    const closureLayer=element('g',{'data-layer':'closures'});svg.append(closureLayer);
    appendMarkup(vehicleSvg({x:0,y:0,heading:0}));
    const location=svg.querySelector('.navigation-location');
    for (const scenario of data.scenarios) {
      const option = document.createElement('option'); option.value = scenario.id; option.textContent = scenario.title; example.append(option);
    }
    example.options[0].remove(); example.disabled = false;
    let previousState = null, animation = 0, timer = 0, motion=null;
    function place(pose) { location.setAttribute('transform',`translate(${pose.x} ${pose.y}) rotate(${pose.heading+90})`); }
    function animateMotion(){
      if(!motion)return;
      const started=performance.now(),offset=motion.distance;
      const frame=now=>{
        motion.distance=Math.min(motion.route.length,offset+(now-started)/motion.duration*motion.route.length);
        place(roadPose(motion.route.points,motion.distance));
        if(motion.distance<motion.route.length)animation=requestAnimationFrame(frame);else motion=null;
      };
      animation=requestAnimationFrame(frame);
    }
    function move(state) {
      cancelAnimationFrame(animation);
      const changed=!previousState||previousState.scenario.id!==state.scenario.id||state.index!==previousState.index;
      if(!changed){if(state.playing&&motion)animateMotion();return;}
      motion=null;
      const target=positions.get(state.current.node);
      const future=state.next?streetRoutes.get(`${state.current.node}>${state.next.node}`):null;
      if(reducedMotion.matches||!state.playing||!previousState||previousState.scenario.id!==state.scenario.id||state.index!==previousState.index+1){place(future?roadPose(future.points,0):{...target,heading:0});return;}
      const route=city.route(previousState.current.node,state.current.node,demoRoadClosures(previousState,city));
      motion={route,distance:0,duration:2500};animateMotion();
    }
    function roadsFor(state){
      const closed=demoRoadClosures(state,city);closureLayer.replaceChildren();
      for(const id of closed){
        const road=city.roads.find(road=>road.id===id),x=(road.a.x+road.b.x)/2,y=(road.a.y+road.b.y)/2;
        const barrier=element('g',{'data-closed-road':id});
        barrier.append(element('circle',{cx:x,cy:y,r:13,fill:'#fff',stroke:'#ee8f7a','stroke-width':1.4}),element('path',{d:`M${x-5} ${y-5}L${x+5} ${y+5}M${x+5} ${y-5}L${x-5} ${y+5}`,stroke:'#d36b50','stroke-width':3,'stroke-linecap':'round'}),element('title',{},'Example road closure: evaluator mismatch'));
        closureLayer.append(barrier);
      }
      data.edges.forEach(edge=>{
        const id=`${edge.from}>${edge.to}`,route=city.route(edge.from,edge.to,closed);
        streetRoutes.set(id,route);edgeElements.get(id).setAttribute('d',streetPath(route.points));
      });
      const upcoming=state.next?streetRoutes.get(`${state.current.node}>${state.next.node}`):null;
      const street=upcoming?.roads.length?city.roads.find(road=>road.id===upcoming.roads[0]).name:'Destination reached';
      qs('#city-instruction').textContent=closed.length?`Detour via ${street}`:state.next?`Continue on ${street}`:'Your example journey is complete';
      qs('#city-road-status').textContent=closed.length?'Evaluator check · road closed':'Research city · example navigation';
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
      if (state.playing) timer = setInterval(() => { player.tick(); render(); },4200);
      if (!previousState || previousState.scenario.id !== state.scenario.id) buildStops(state);
      roadsFor(state);
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
      if (state.next) edges.append(edgeElements.get(`${state.current.node}>${state.next.node}`));
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
      qs('#map-status').textContent = 'Illustrative research city · streets, intersections and example projects · '+ (state.playing ? 'Playing' : 'Paused') + ' · Choose a stop to explore.';
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
