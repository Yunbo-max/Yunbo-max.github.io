import {makeWorld} from './journey-world.mjs?v=20261005-routes';
import {CASES,SOURCES} from './4d-expedition-cases.mjs?v=20261005-studies';
import {TOTAL_SECONDS,STEP_SECONDS,expeditionAt,fleetAt,makeTerrainSampler,candidateState,destinationTotals,transportText,HAZARDS} from './research-expeditions.mjs?v=20261005-studies';
import {createGlobe,prepareWorld} from './expedition-globe.mjs?v=20261005-studies';

const $=s=>document.querySelector(s),shell=$('#research-atlas');
if(shell)start().catch(error=>{shell.dataset.ready='false';$('#atlas-error').hidden=false;$('#atlas-status').textContent='The animation could not load. All 84 tasks remain in the module directory.';console.error('Research fleets:',error.message);});

async function start(){
 const response=await fetch('/assets/lab/research-atlas.json');if(!response.ok)throw new Error('Task directory unavailable');const atlas=await response.json();
 const world=makeWorld(),prepared=prepareWorld(world),sample=makeTerrainSampler(world),preference=matchMedia('(prefers-reduced-motion: reduce)');
 const pause=$('#globe-pause'),select=$('#journey-select');
 let time=0,running=!preference.matches,inView=true,frameId=0,previous=0,lastPaint=0,lastStep=-1,mode='both';
 const views=new Map(),panels=new Map(),selectedBranches=new Map();
 const el=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;};
 const links=(container,keys)=>{container.replaceChildren();for(const key of keys){const item=SOURCES[key];if(!item)throw new Error(`Unknown source ${key}`);const a=el('a',item.label);a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';container.append(a);}};
 for(const c of CASES){
  const panel=shell.querySelector(`[data-case-panel="${c.id}"]`),canvas=panel.querySelector('canvas');panels.set(c.id,panel);
  views.set(c.id,createGlobe(canvas,c.id,world,prepared,sample,{getTime:()=>time,reducedMotion:()=>preference.matches,onToggle:toggle,onPick:id=>pickBranch(c.id,id)}));
  const trail=panel.querySelector('.expedition-trail');c.steps.forEach((s,index)=>{const button=el('button',String(index+1).padStart(2,'0'));button.type='button';button.title=s.title;button.setAttribute('aria-label',`Case ${c.letter}, step ${index+1}: ${s.title}`);button.dataset.step=String(index);button.dataset.human=String(s.kind==='batch-review');button.addEventListener('click',()=>choose(index));trail.append(button);});
  for(const b of c.candidates){const button=el('button',undefined,'fleet-branch');button.type='button';button.dataset.branch=String(b.id);button.append(el('span',String(b.id).padStart(2,'0'),'branch-number'),el('span',b.label,'branch-name'),el('span','Queued','branch-state'));button.addEventListener('click',()=>pickBranch(c.id,b.id));panel.querySelector('.fleet-roster').append(button);}
  for(const button of panel.querySelectorAll('[data-zoom]'))button.addEventListener('click',()=>{views.get(c.id).changeZoom(Number(button.dataset.zoom));});
  panel.querySelector('[data-follow]').addEventListener('click',e=>{e.currentTarget.setAttribute('aria-pressed',String(views.get(c.id).follow()));});
 }
 for(let i=0;i<30;i++){const option=el('option',`${String(i+1).padStart(2,'0')} · ${CASES[0].steps[i].title}`);option.value=String(i);select.append(option);}
 for(const [key,item] of Object.entries(HAZARDS)){const entry=el('span',undefined,'hazard-legend-item');entry.title=item.meaning;entry.append(el('b',item.symbol),el('span',item.label));entry.style.setProperty('--hazard-color',item.color);$('#hazard-legend').append(entry);}

 function updatePanel(c,index){
  const panel=panels.get(c.id),s=c.steps[index],fleet=fleetAt(c.id,time),totals=destinationTotals(c.id),prefix=c.letter+' · ';
  panel.querySelector('.journey-number').textContent=`${String(index+1).padStart(2,'0')} / 30`;
  panel.querySelector('.journey-place').textContent=s.title;
  panel.querySelector('.fleet-wave').textContent=fleet.label;
  panel.querySelector('.fleet-unit-label').textContent=fleet.wave===2?'VALIDATION RUN UNITS':'CANDIDATE ROUTES';
  panel.querySelector('.expedition-module').textContent=`${s.module} · ${atlas.modules.find(m=>m.id===s.module).label}`;
  panel.querySelector('.expedition-step-title').textContent=prefix+s.title;
  panel.querySelector('.expedition-body').textContent=s.body;
  panel.querySelector('.expedition-output').textContent=s.output;
  panel.querySelector('.expedition-next-label').textContent=s.kind==='batch-review'?'HUMAN DECISION AT BATCH END':'NEXT DECISION';
  panel.querySelector('.expedition-next').textContent=s.next;
  const methods=panel.querySelector('.expedition-methods');methods.replaceChildren(...s.methods.map(m=>el('li',m)));
  const benchmarks=panel.querySelector('.expedition-benchmarks');benchmarks.replaceChildren(...s.benchmarks.map(m=>el('li',m)));
  links(panel.querySelector('.expedition-sources'),s.sourceKeys);
  const taskLinks=panel.querySelector('.expedition-nodes');taskLinks.replaceChildren();for(const id of s.nodes){const node=atlas.nodes.find(n=>n.id===id);if(!node)throw new Error(`Unknown task ${id}`);const a=el('a',id);a.href='#node-'+id;a.title=node.label;taskLinks.append(a);}
  for(const button of panel.querySelectorAll('.expedition-trail button')){const n=Number(button.dataset.step);button.setAttribute('aria-current',n===index?'step':'false');button.dataset.passed=String(n<index);}
  for(const button of panel.querySelectorAll('.fleet-branch')){
   const id=Number(button.dataset.branch),b=c.candidates[id-1],state=candidateState(b,index);
   const follow=fleet.wave===2?fleet.members.find(m=>m.id===id):null;
   button.dataset.state=follow?follow.status:state.status;button.dataset.hazard=(follow?follow.hazard:state.hazard)??'';
   button.querySelector('.branch-name').textContent=follow?.label??b.label;
   const status=follow?follow.status:state.status,hazard=follow?follow.hazard:state.hazard;
   const word={queued:'Queued',running:'Running',pending:'Check needed',waiting:'Waiting',repaired:'Repaired → continue',stopped:'Stopped',carryover:'Next window',arrived:time>=TOTAL_SECONDS?'Arrived':index>=29?'Approaching port':'Retained',verified:'Verified unit'}[status];
   button.querySelector('.branch-state').textContent=(hazard?HAZARDS[hazard].symbol+' ':'')+word;
   button.title=`${follow?.label??b.label}: ${word}${hazard?'. '+HAZARDS[hazard].meaning:''}`;
   button.setAttribute('aria-pressed',String(selectedBranches.get(c.id)===id));
  }
  panel.querySelector('.fleet-summary').textContent=index<17?'10 candidates · outcomes pending':`${totals.arrived} ${time>=TOTAL_SECONDS?'arrive':index>=29?'approach port':'retained'} · ${totals.stopped} stopped · ${totals.carryover} carry over`;
  const destinations=panel.querySelector('.destination-ledger');destinations.hidden=index<24;destinations.replaceChildren();
  if(index>=24){const heading=el('p',index>=29?'DISTINCT DESTINATIONS':'DESTINATIONS CHOSEN BY THE HUMAN','destination-heading');destinations.append(heading);for(const b of c.candidates.filter(b=>b.status==='arrived'))destinations.append(el('span',`Route ${b.id} → ${b.destination}`));destinations.append(el('p',`${totals.carryover} unfinished candidate${totals.carryover>1?'s remain':' remains'} in the next approved window.`,'destination-carry'));}
  panel.dataset.step=String(index);panel.dataset.wave=String(fleet.wave);panel.querySelector('[data-follow]').setAttribute('aria-pressed',String(views.get(c.id).following));
  if(selectedBranches.has(c.id))showBranch(c.id,selectedBranches.get(c.id));
 }
 function showBranch(id,branch){
  const c=CASES.find(c=>c.id===id),b=c.candidates[branch-1],panel=panels.get(id),box=panel.querySelector('.branch-detail'),fleet=fleetAt(id,time),follow=fleet.wave===2?fleet.members.find(m=>m.id===branch):null;
  box.hidden=false;box.querySelector('h4').textContent=`${c.letter}${String(branch).padStart(2,'0')} · ${follow?.label??b.label}`;
  box.querySelector('.branch-prediction').textContent=follow?`Validation run unit: ${follow.label}. Parent candidate${follow.design.parents.length>1?'s':''}: ${follow.design.parents.map(n=>`${n} · ${c.candidates[n-1].label}`).join('; ')}. This is not a new idea.`:b.prediction;
  box.querySelector('.branch-comparison').textContent=follow?follow.design.comparison:b.comparison;
  const state=candidateState(b,expeditionAt(id,time).index);box.querySelector('.branch-diagnosis').textContent=follow?(follow.hazard?HAZARDS[follow.hazard].meaning:'This validation unit keeps its own status and rejoins the retained claim at batch review.'):(state.hazard?HAZARDS[state.hazard].meaning:state.repaired?'The scripted fault was repaired under the frozen protocol; the branch can continue.':'Interpret only verified native comparisons at the human’s batch review.');
 }
 function pickBranch(id,branch){selectedBranches.set(id,branch);running=false;sync();updatePanel(CASES.find(c=>c.id===id),expeditionAt(id,time).index);showBranch(id,branch);draw(true);}
 function draw(instant=false){
  const index=expeditionAt('mesh',time).index;
  for(const c of CASES){const panel=panels.get(c.id);if(!panel.hidden)views.get(c.id).draw(time,instant);const canvas=panel.querySelector('canvas');panel.querySelector('.journey-transport').textContent=transportText(canvas.dataset.vehicle??'car');}
  $('#journey-progress').style.width=`${time/TOTAL_SECONDS*100}%`;
  $('#expedition-clock').textContent=`${Math.floor(time).toString().padStart(2,'0')} / 60 s`;
  shell.dataset.travelTime=time.toFixed(3);shell.dataset.step=String(index);shell.dataset.stepSeconds=String(STEP_SECONDS);
  if(index!==lastStep){lastStep=index;select.value=String(index);CASES.forEach(c=>updatePanel(c,index));$('#atlas-status').textContent=`Illustrative cases. Step ${index+1} of 30. A: ${CASES[0].steps[index].title}. B: ${CASES[1].steps[index].title}.`;}
  pause.textContent=running?'Pause to read':time>=TOTAL_SECONDS?'Replay both routes':'Play routes';pause.setAttribute('aria-pressed',String(!running));
 }
 function frame(now){const elapsed=previous?Math.max(0,(now-previous)/1000):0;previous=now;time=Math.min(TOTAL_SECONDS,time+elapsed);if(now-lastPaint>=33){draw();lastPaint=now;}if(time>=TOTAL_SECONDS){running=false;lastStep=-1;sync();draw();return;}frameId=requestAnimationFrame(frame);}
 function sync(){cancelAnimationFrame(frameId);frameId=0;previous=0;lastPaint=0;shell.dataset.running=String(running&&inView&&!document.hidden);if(running&&inView&&!document.hidden)frameId=requestAnimationFrame(frame);pause.textContent=running?'Pause to read':time>=TOTAL_SECONDS?'Replay both routes':'Play routes';pause.setAttribute('aria-pressed',String(!running));}
 function toggle(){if(time>=TOTAL_SECONDS){time=0;lastStep=-1;selectedBranches.clear();panels.forEach(p=>p.querySelector('.branch-detail').hidden=true);}running=!running;sync();draw(true);}
 function choose(index){time=Math.max(0,Math.min(29,index))*STEP_SECONDS+.7;running=false;lastStep=-1;selectedBranches.clear();panels.forEach(p=>p.querySelector('.branch-detail').hidden=true);sync();draw(true);}
 select.addEventListener('change',()=>choose(Number(select.value)));pause.addEventListener('click',toggle);
 $('#globe-left').addEventListener('click',()=>choose(expeditionAt('mesh',time).index-1));$('#globe-right').addEventListener('click',()=>choose(expeditionAt('mesh',time).index+1));
 $('#globe-replay').addEventListener('click',()=>{time=0;lastStep=-1;running=!preference.matches;selectedBranches.clear();panels.forEach(p=>p.querySelector('.branch-detail').hidden=true);sync();draw(true);});
 for(const button of $('#research-route-choices').querySelectorAll('[data-view]'))button.addEventListener('click',()=>{mode=button.dataset.view;shell.dataset.view=mode;for(const c of CASES)panels.get(c.id).hidden=mode!=='both'&&mode!==c.id;for(const b of $('#research-route-choices').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.view===mode));for(const c of CASES)if(!panels.get(c.id).hidden)views.get(c.id).resize();draw(true);});
 document.addEventListener('click',e=>{const button=e.target.closest('[data-module]');if(!button)return;const module=button.dataset.module;const c=CASES.find(c=>c.steps.some(s=>s.nodes.some(n=>n.startsWith(module))));const index=c?.steps.findIndex(s=>s.nodes.some(n=>n.startsWith(module)));if(index>=0){if(mode!=='both'&&mode!==c.id)$('#research-route-choices').querySelector('[data-view="both"]').click();choose(index);$('#map').scrollIntoView({block:'start',behavior:preference.matches?'auto':'smooth'});}});
 function revealHash(){if(/^#(?:node|module)-/.test(location.hash)){const target=document.getElementById(location.hash.slice(1));if(target){const details=target.closest('details');if(details)details.open=true;if(location.hash.startsWith('#node-'))target.scrollIntoView({block:'start',behavior:preference.matches?'auto':'smooth'});}}}
 revealHash();window.addEventListener('hashchange',revealHash);
 preference.addEventListener('change',()=>{if(preference.matches){running=false;sync();draw();}});document.addEventListener('visibilitychange',sync);
 new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();},{threshold:.025}).observe($('#expedition-canvas-pair'));
 $('#map').querySelectorAll('button:disabled').forEach(n=>n.disabled=false);select.disabled=false;shell.dataset.ready='true';draw(true);sync();
}
