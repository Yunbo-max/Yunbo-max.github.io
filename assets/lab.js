(()=>{
  'use strict';
  const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  qsa('.site-header nav a').forEach(a=>{if(a.pathname===location.pathname)a.setAttribute('aria-current','page');});
  const menu=qs('.menu-button'),nav=qs('#main-nav');
  menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
  const make=(tag,text,cl)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cl)e.className=cl;return e;};
  async function load(){const response=await fetch('/assets/lab/research-map.json');if(!response.ok)throw Error('Map unavailable');return response.json();}
  if(!qs('#research-map'))return;
  load().then(data=>{map(data);questions(data);ideas(data);intake(data);}).catch(()=>{
    qs('#map-status').textContent='The map could not load. Please reload or open the source map on GitHub.';
  });
  function map(data){
    const svg=qs('#research-map'),status=qs('#map-status'),select=qs('#map-select'),region=qs('#map-region'),search=qs('#map-search');
    const colors=['#e8edf8','#e9f2ed','#fff2dc','#eee9fa','#f7e8ed','#e4f0f5','#f4ecd9','#e7edfa','#f1e8df','#e5f2f0','#f4e6e9','#e8ecf9','#f5eddc','#e7eff7','#ece9f5','#e5f0e9'];
    const ns='http://www.w3.org/2000/svg',W=2320,H=1680,positions=new Map(),nodes=new Map(),edges=new Map();
    let view={x:0,y:0,w:W,h:H},chosen='all',drag=null;
    const el=(tag,attrs={},text)=>{const e=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(text!==undefined)e.textContent=text;return e;};
    const defs=el('defs'),marker=el('marker',{id:'map-arrow',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:5,markerHeight:5,orient:'auto-start-reverse'});marker.append(el('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:'#8e9cad'}));defs.append(marker);svg.append(defs);
    const groups=el('g',{'data-layer':'regions'}),links=el('g',{'data-layer':'relationships'}),points=el('g',{'data-layer':'nodes'});svg.append(groups,links,points);
    data.groups.forEach((g,i)=>{
      const col=i%4,row=Math.floor(i/4),x=20+col*575,y=20+row*415;
      const ge=el('g',{'data-region':g[0]});ge.append(el('rect',{x,y,width:555,height:395,rx:20,fill:colors[i],opacity:.85}),el('text',{x:x+22,y:y+35,class:'region-label'},g[0]+' · '+g[1]),el('text',{x:x+22,y:y+59,class:'region-sub'},g[3].length+' tasks'));groups.append(ge);
      const opt=make('option',g[0]+' · '+g[1]);opt.value=g[0];region.append(opt);
      data.nodes.filter(n=>n.id[0]===g[0]).forEach((n,j)=>{
        positions.set(n.id,{x:x+28+(j%2)*273,y:y+100+Math.floor(j/2)*59});
        const o=make('option',n.id+' · '+n.name);o.value=n.id;select.append(o);
      });
    });
    data.edges.forEach(e=>{const a=positions.get(e.from),b=positions.get(e.to),dx=b.x-a.x,dy=b.y-a.y;
      const curve=Math.max(18,Math.min(100,Math.abs(dx)*.15+Math.abs(dy)*.08));
      const path=el('path',{class:'map-edge','data-edge':e.id,'data-from':e.from,'data-to':e.to,'marker-end':'url(#map-arrow)',d:`M ${a.x} ${a.y} Q ${(a.x+b.x)/2+curve} ${(a.y+b.y)/2-curve} ${b.x} ${b.y}`});
      path.append(el('title',{},`${e.from} → ${e.to} · ${e.type} · ${e.when}`));links.append(path);edges.set(e.id,path);
    });
    data.nodes.forEach(n=>{const p=positions.get(n.id),g=el('g',{class:'map-node','data-node':n.id,role:'button',tabindex:0,'aria-label':n.id+' '+n.name});
      g.append(el('rect',{x:p.x-12,y:p.y-25,width:259,height:47,rx:6,fill:'transparent'}),el('circle',{cx:p.x,cy:p.y,r:6}),el('text',{x:p.x+16,y:p.y-3,class:'node-label'},n.id+' '+n.name),el('title',{},n.name));
      const choose=()=>{select.value=n.id;chosen=n.id;highlight();detail(n);};g.addEventListener('click',choose);g.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();choose();}});points.append(g);nodes.set(n.id,g);
    });
    const apply=()=>svg.setAttribute('viewBox',`${view.x} ${view.y} ${view.w} ${view.h}`);apply();
    function highlight(){
      const query=search.value.trim().toLowerCase(),group=region.value;
      const related=new Set(chosen==='all'?[]:data.edges.filter(e=>e.from===chosen||e.to===chosen).flatMap(e=>[e.from,e.to]));
      let matched=0;
      data.nodes.forEach(n=>{const relevant=(!query||[n.id,n.name,n.inputs,n.outputs,...(n.aliases||[])].join(' ').toLowerCase().includes(query))&&(group==='all'||n.id[0]===group);if(relevant)matched++;
        const g=nodes.get(n.id);g.classList.toggle('selected',n.id===chosen);g.classList.toggle('dimmed',!relevant||(chosen!=='all'&&!related.has(n.id)));
      });
      data.edges.forEach(e=>{const p=edges.get(e.id),isRelated=chosen!=='all'&&(e.from===chosen||e.to===chosen);p.classList.toggle('related',isRelated);p.classList.toggle('dimmed',chosen!=='all'&&!isRelated);});
      status.textContent=`84 nodes · 221 connections retained · ${matched} search/region matches`+(chosen!=='all'?` · ${chosen}: ${data.edges.filter(e=>e.from===chosen||e.to===chosen).length} connected relationships`:' · Select a node to inspect its connections.');
      qsa('[data-catalog-node]').forEach(b=>{const n=data.nodes.find(x=>x.id===b.dataset.catalogNode);b.hidden=!!query&&!([n.id,n.name,...(n.aliases||[])].join(' ').toLowerCase().includes(query));});
      if(query)qsa('#node-catalog details').forEach(d=>d.open=true);
    }
    function detail(n){const out=qs('#node-detail');out.replaceChildren();const a=make('div'),b=make('div');a.append(make('p',n.id+' · '+data.groups.find(g=>g[0]===n.id[0])[1],'eyebrow'),make('h3',n.name));
      [['Input / 输入',n.inputs],['Output / 输出',n.outputs],['Acceptance / 验收',n.acceptance]].forEach(([title,text])=>a.append(make('h4',title),make('p',text)));
      const sourceTitle=make('h4','Exact skill sources'),ul=make('ul');n.sources.forEach(s=>{const source=data.source_catalog[s.source],li=make('li'),a=make('a',source.skill+' · '+s.heading.replace(/^#+\s*/,''));a.href='https://github.com/Yunbo-max/Yunbo-max.github.io/blob/master/research-autopilot/skills/'+source.skill+'/'+source.path;li.append(a);ul.append(li);});a.append(sourceTitle,ul);
      const entry=make('a','Read the full node contract ↗');entry.href='https://github.com/Yunbo-max/Yunbo-max.github.io/blob/master/research-autopilot/skills/research-autopilot/'+n.entry;a.append(make('p'),entry);
      b.append(make('h4','Connected tasks / 点间交接'));const list=make('ul',undefined,'edge-list');data.edges.filter(e=>e.from===n.id||e.to===n.id).forEach(e=>{const li=make('li'),button=make('button',e.from+' → '+e.to+' · '+e.type);button.type='button';const other=e.from===n.id?e.to:e.from;button.addEventListener('click',()=>{select.value=other;chosen=other;highlight();detail(data.nodes.find(n=>n.id===other));});li.append(button,make('small','Condition: '+e.when),make('small','Handoff: '+e.payload));list.append(li);});b.append(list,make('p','Norm source-bound. Actual adapter, operation receipt and scientific support are checked per project.','fine'));out.append(a,b);
    }
    select.addEventListener('change',()=>{chosen=select.value;highlight();if(chosen!=='all')detail(data.nodes.find(n=>n.id===chosen));else qs('#node-detail').replaceChildren(make('div','Select a task to inspect its contract and source.'),make('div','This graph is a published workflow, not a live all-project scheduler.'));});
    search.addEventListener('input',highlight);region.addEventListener('change',()=>{chosen='all';select.value='all';highlight();if(region.value!=='all'){const i=data.groups.findIndex(g=>g[0]===region.value);view={x:(i%4)*575,y:Math.floor(i/4)*415,w:595,h:435};apply();}else{view={x:0,y:0,w:W,h:H};apply();}});
    const zoom=f=>{const nw=Math.max(280,Math.min(W*1.7,view.w*f)),nh=nw*H/W;view={x:view.x+(view.w-nw)/2,y:view.y+(view.h-nh)/2,w:nw,h:nh};apply();};
    qs('#map-in').addEventListener('click',()=>zoom(.75));qs('#map-out').addEventListener('click',()=>zoom(1.333));qs('#map-reset').addEventListener('click',()=>{view={x:0,y:0,w:W,h:H};region.value='all';apply();highlight();});
    svg.addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey){e.preventDefault();zoom(e.deltaY>0?1.1:.9);}},{passive:false});
    svg.addEventListener('pointerdown',e=>{if(e.target.closest('.map-node'))return;drag={x:e.clientX,y:e.clientY,vx:view.x,vy:view.y};svg.setPointerCapture(e.pointerId);});
    svg.addEventListener('pointermove',e=>{if(!drag)return;const r=svg.getBoundingClientRect();view.x=drag.vx-(e.clientX-drag.x)*view.w/r.width;view.y=drag.vy-(e.clientY-drag.y)*view.h/r.height;apply();});
    svg.addEventListener('pointerup',()=>drag=null);svg.addEventListener('pointercancel',()=>drag=null);
    qs('#map-export').addEventListener('click',()=>{const copy=svg.cloneNode(true);copy.setAttribute('viewBox',`0 0 ${W} ${H}`);copy.setAttribute('width',W);copy.setAttribute('height',H);const style=el('style',{},'.region-label{font:600 17px sans-serif;fill:#434950}.region-sub{font:12px sans-serif;fill:#6d7480}.map-edge{fill:none;stroke:#9faabb;stroke-width:1.5;opacity:.32}.map-edge.related{stroke:#0071dc;opacity:.8;stroke-width:2.5}.map-node circle{fill:#fff;stroke:#87909b;stroke-width:1.7}.node-label{font:13px sans-serif;fill:#323943}.selected circle{fill:#0066d6}.selected .node-label{fill:#005abc}.map-node.dimmed{opacity:.2}.map-edge.dimmed{opacity:.03}');copy.prepend(style);const blob=new Blob([new XMLSerializer().serializeToString(copy)],{type:'image/svg+xml'});const url=URL.createObjectURL(blob),a=make('a');a.href=url;a.download='research-autopilot-map.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
    const catalog=qs('#node-catalog');data.groups.forEach(group=>{const details=make('details'),summary=make('summary',group[0]+' · '+group[1]);details.append(summary);data.nodes.filter(n=>n.id[0]===group[0]).forEach(n=>{const btn=make('button',n.id+' '+n.name);btn.type='button';btn.dataset.catalogNode=n.id;btn.addEventListener('click',()=>{select.value=n.id;chosen=n.id;highlight();detail(n);qs('#node-detail').scrollIntoView({block:'start'});});details.append(btn);});catalog.append(details);});highlight();
  }
  function questions(data){const list=qs('#question-list'),filter=qs('#question-region');const stages=[...new Set(data.questions.map(q=>q.node[0]))];stages.forEach(stage=>{const g=data.groups.find(g=>g[0]===stage),o=make('option',stage+' · '+g[1]);o.value=stage;filter.append(o);});const draw=()=>{list.replaceChildren();const rows=data.questions.filter(q=>filter.value==='all'||q.node[0]===filter.value);rows.forEach(q=>{const li=make('li'),strong=make('strong',q.id+' · '+q.node),p=make('p',q.question),small=make('small','Trigger: '+q.trigger);p.style.marginBottom='6px';li.append(strong,p,small);list.append(li);});qs('#question-count').textContent=rows.length+' / 52 questions';};filter.addEventListener('change',draw);draw();}
  function ideas(data){const tree=qs('#method-tree');data.method_routes.forEach(r=>{const d=make('details'),s=make('summary',r.id+' · '+r.title);d.append(s,make('p',r.question));const ul=make('ul');r.branches.forEach(b=>ul.append(make('li',b)));d.append(ul,make('p','First check: '+r.check));tree.append(d);});}
  function intake(data){qs('#goal-form').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.currentTarget),entry=f.get('entry'),priority=f.get('priority'),result=qs('#goal-result');const routes={I:['I01','I02','B01','L01','B02','H01'],M:['I01','P02','L04','B01','G03','V01'],R:['I01','R02','R03','V01','W09']},route=routes[entry].slice();if(priority==='writing')route.push('W02','W03','A04');if(priority==='method')route.push('H03','M01','M02');if(priority==='learning')route.push('P05');result.replaceChildren(make('h3','Your route brief'),make('p',String(f.get('goal'))),make('p','Starting point: '+entry+' · Resources: '+(f.get('resources')||'Not yet specified')),make('p','Suggested task route: '+route.join(' → ')));const ul=make('ul');['Which existing asset or observation is authoritative?','What outcome would change your decision?','Which conditions or resource limits must the next step respect?'].forEach(t=>ul.append(make('li',t)));result.append(make('h4','The next useful conversation'),ul,make('p','This is a local navigation suggestion. Evidence gates, actual resources and human preferences determine the real route.','fine'));result.hidden=false;});}
})();
