import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SCENARIOS,routeDuration,researchStateAt,researchStepStart,vehicleIconWidth} from '../assets/lab/research-routes.mjs';

const atlas=JSON.parse(readFileSync(new URL('../assets/lab/research-atlas.json',import.meta.url),'utf8'));
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));

test('the example routes use existing map tasks and together expose all 84 tasks',()=>{
  assert.equal(SCENARIOS.length,5);
  const ids=new Set(atlas.nodes.map(n=>n.id)),modules=new Set(atlas.modules.map(m=>m.id));
  for(const route of SCENARIOS)for(const step of route.steps){
    assert.ok(modules.has(step.module));
    assert.ok(step.nodes.length&&step.nodes.every(id=>ids.has(id)));
    assert.ok(step.body.length>70&&step.next.length>40);
    assert.ok(['car','boat','train'].includes(step.vehicle));
  }
  assert.deepEqual(new Set(SCENARIOS[0].steps.flatMap(s=>s.nodes)),ids);
  assert.deepEqual(new Set(SCENARIOS[0].steps.map(s=>s.module)),modules);
});

test('changing research stages and vehicles preserves the actual globe position',()=>{
  for(const scenario of SCENARIOS){
    for(let i=1;i<scenario.steps.length;i++){
      const t=researchStepStart(scenario.id,i),before=researchStateAt(scenario.id,t-1e-6),after=researchStateAt(scenario.id,t+1e-6);
      assert.equal(after.index,i);
      assert.ok(distance(before.position,after.position)<1e-5,`${scenario.id} ${i} teleports`);
    }
    for(let t=0;t<=routeDuration(scenario.id);t+=.75){
      const state=researchStateAt(scenario.id,t);
      assert.ok(state.position.every(Number.isFinite)&&state.tangent.every(Number.isFinite));
      assert.ok(Math.abs(Math.hypot(...state.position)-1)<1e-8);
      assert.ok(Math.hypot(...state.tangent)>.9);
    }
  }
});

test('a finished example stays finished instead of silently starting a new direction',()=>{
  for(const scenario of SCENARIOS){
    const end=researchStateAt(scenario.id,routeDuration(scenario.id)),late=researchStateAt(scenario.id,routeDuration(scenario.id)+1000);
    assert.equal(end.ended,true);assert.equal(late.ended,true);
    assert.equal(end.index,scenario.steps.length-1);
    assert.equal(end.progress,1);
    assert.deepEqual(late.position,end.position);
  }
});

test('the examples preserve batch-end human review before scientific branch changes',()=>{
  for(const id of ['paper','repair','review']){
    const steps=SCENARIOS.find(s=>s.id===id).steps;
    const boundary=steps.findIndex(s=>s.kind==='batch-review'),validation=steps.findIndex(s=>s.kind==='validation');
    assert.ok(boundary>=0&&validation>boundary,id+' skips human batch review');
  }
  const rethink=SCENARIOS.find(s=>s.id==='rethink').steps;
  assert.ok(rethink.findIndex(s=>s.kind==='batch-review')<rethink.findIndex(s=>s.module==='L'));
  const replan=SCENARIOS.find(s=>s.id==='replan').steps;
  assert.equal(replan[0].kind,'human');
  assert.equal(replan.at(-1).kind,'batch-review');
  assert.match(replan.at(-1).body,/unchanged approved work/);
});

test('transport symbols stay large on a narrow canvas and desktop',()=>{
  for(const width of [280,335,720,1232]){
    assert.ok(vehicleIconWidth(width)>=62);
    assert.ok(vehicleIconWidth(width,false)>=38);
    assert.ok(vehicleIconWidth(width)<=94);
  }
});
