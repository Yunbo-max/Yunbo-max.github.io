import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CASES,SOURCES,STEP_SECONDS} from '../assets/lab/4d-expedition-cases.mjs';
import {TOTAL_SECONDS,expeditionAt,fleetAt,makeTerrainSampler,transportFor,candidateState,destinationTotals,DESTINATIONS,iconWidth} from '../assets/lab/research-expeditions.mjs';
import {makeWorld,earthPoint} from '../assets/lab/journey-world.mjs';
const atlas=JSON.parse(readFileSync(new URL('../assets/lab/research-atlas.json',import.meta.url),'utf8'));
const sample=makeTerrainSampler(makeWorld());
const dist=(a,b)=>Math.hypot(...a.map((v,k)=>v-b[k]));

test('both cases have exactly 30 detailed, source-bound two-second steps',()=>{
 assert.equal(CASES.length,2);assert.equal(STEP_SECONDS,2);assert.equal(TOTAL_SECONDS,60);
 const covered=new Set();
 for(const c of CASES){assert.equal(c.steps.length,30);for(const s of c.steps){
  assert.equal(s.duration,2);assert.ok(s.body.length>130);assert.ok(s.methods.length>0&&s.benchmarks.length>0);
  assert.ok(s.output.length>30&&s.next.length>40);assert.ok(s.sourceKeys.length>0&&s.sourceKeys.every(k=>SOURCES[k]));
  for(const id of s.nodes){assert.ok(atlas.nodes.some(n=>n.id===id));covered.add(id);}
 }}
 assert.deepEqual(covered,new Set(atlas.nodes.map(n=>n.id)));
});
test('the two-second clock changes both cases at every boundary and stops at sixty',()=>{
 for(const c of CASES){for(let i=1;i<30;i++){
  assert.equal(expeditionAt(c.id,i*2-1e-6).index,i-1);assert.equal(expeditionAt(c.id,i*2).index,i);
  assert.ok(dist(expeditionAt(c.id,i*2-1e-6).position,expeditionAt(c.id,i*2+1e-6).position)<1e-5);
 }const end=expeditionAt(c.id,60),late=expeditionAt(c.id,600);assert.equal(end.ended,true);assert.equal(end.index,29);assert.deepEqual(late.position,end.position);
 assert.throws(()=>expeditionAt(c.id,NaN),/finite/);}
});
test('two ten-way waves distinguish candidates from validation run units',()=>{
 for(const c of CASES){assert.equal(c.candidates.length,10);assert.equal(c.followups.length,10);
  assert.equal(fleetAt(c.id,20).wave,1);assert.equal(fleetAt(c.id,20).members.length,10);
  assert.equal(fleetAt(c.id,42).wave,2);assert.equal(fleetAt(c.id,42).members.length,10);
  assert.match(fleetAt(c.id,42).label,/run units/);assert.notDeepEqual(fleetAt(c.id,20).members.map(b=>b.label),fleetAt(c.id,42).members.map(b=>b.label));
  const mid=fleetAt(c.id,26).members;assert.equal(new Set(mid.map(b=>b.position.map(v=>v.toFixed(5)).join(','))).size,10);
 }
});
test('a repaired branch resumes; faults alone do not become scientific rejection',()=>{
 const b=CASES[0].candidates[3];assert.equal(candidateState(b,12).status,'pending');assert.equal(candidateState(b,12).hazard,'lightning');
 assert.equal(candidateState(b,16).status,'repaired');assert.equal(candidateState(b,16).hazard,null);assert.equal(candidateState(b,17).status,'arrived');
 const carried=CASES[0].candidates[5];assert.equal(candidateState(carried,12).status,'waiting');assert.equal(candidateState(carried,17).status,'carryover');
 assert.ok(!CASES[0].candidates.some(b=>candidateState(b,16).status==='stopped'));
});
test('human reviews precede convergence and independent confirmation in both cases',()=>{
 for(const c of CASES){assert.equal(c.steps[17].kind,'batch-review');assert.equal(c.steps[24].kind,'batch-review');assert.equal(c.steps[22].kind,'validation');
 assert.equal(c.steps[20].kind,'fanout');assert.match(c.steps[20].body,/not ten new/i);
 assert.match(c.steps[13].next,/next|carry/i);assert.match(c.steps[29].body,/unfinished|window/i);}
});
test('vehicles match the actual drawn land and water throughout both branch waves',()=>{
 const found=new Set();
 for(const c of CASES)for(let t=0;t<=60;t+=.2){const state=expeditionAt(c.id,t),members=fleetAt(c.id,t).members;
  for(const p of [state.position,...members.map(m=>m.position)]){
   assert.ok(p.every(Number.isFinite));assert.ok(Math.abs(Math.hypot(...p)-1)<1e-8);
   const mode=transportFor(p,state.index,sample);found.add(mode.vehicle);
   if(mode.vehicle==='boat')assert.notEqual(sample(p),'land');else assert.equal(sample(p),'land');
   if(mode.vehicle==='train')assert.ok(state.index<3||(state.index>=20&&state.index<=22));
  }
 }assert.deepEqual(found,new Set(['train','car','boat']));
});
test('arrivals reach distinct water destinations and retain every stopped or unfinished idea',()=>{
 for(const c of CASES){const totals=destinationTotals(c.id);assert.equal(totals.arrived+totals.stopped+totals.carryover,10);
  const final=fleetAt(c.id,60);assert.equal(final.members.length,totals.arrived);assert.ok(final.members.every(b=>b.status==='arrived'));
  assert.ok(fleetAt(c.id,58.7).members.every(b=>b.status==='arriving'));
  for(const [i,b] of final.members.entries()){assert.ok(dist(b.position,earthPoint(...DESTINATIONS[c.id][i]))<1e-8);assert.equal(sample(b.position),'sea');}
  assert.equal(new Set(final.members.map(b=>b.destination)).size,totals.arrived);
 }assert.equal(destinationTotals('mesh').arrived,3);assert.equal(destinationTotals('gaussian').arrived,2);
});
test('large transport symbols remain legible in a narrow view',()=>{
 for(const width of [280,335,600,1200]){assert.ok(iconWidth(width,true)>=65);assert.ok(iconWidth(width)>=39);}
});
