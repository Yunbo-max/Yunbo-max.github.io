import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const {createCityNetwork,roadPose} = await import('../assets/lab/city-network.mjs').catch(error => {
  if(error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
  return {};
});
const fixture = {
  regions:[{id:'G',col:0,row:1},{id:'E',col:0,row:2}],
  nodes:[{id:'pilot',region:'G'},{id:'debug',region:'E'}]
};
function city(){assert.equal(typeof createCityNetwork,'function','City street routing is not implemented');return createCityNetwork(fixture);}

test('a vehicle route follows connected orthogonal roads instead of crossing city blocks',()=>{
  const map=city(), route=map.route('pilot','debug');
  assert.deepEqual(route.points[0],map.positions.get('pilot'));
  assert.deepEqual(route.points.at(-1),map.positions.get('debug'));
  let distance=0;
  for(let i=1;i<route.points.length;i++){
    const a=route.points[i-1],b=route.points[i];
    assert.ok(a.x===b.x || a.y===b.y,'A route cuts diagonally across a block');
    assert.ok(map.roads.some(road => (road.a.x===a.x&&road.a.y===a.y&&road.b.x===b.x&&road.b.y===b.y)||(road.a.x===b.x&&road.a.y===b.y&&road.b.x===a.x&&road.b.y===a.y)),'A route leaves the street network');
    distance+=Math.hypot(b.x-a.x,b.y-a.y);
  }
  assert.equal(route.length,distance);
  assert.equal(route.length,Math.abs(route.points.at(-1).y-route.points[0].y));
});

test('closing a road makes the planner choose a connected detour and forbids teleporting',()=>{
  const map=city(), original=map.route('pilot','debug'), closed=original.roads[0];
  const detour=map.route('pilot','debug',[closed]);
  assert.ok(!detour.roads.includes(closed));
  assert.ok(detour.length>original.length);
  assert.deepEqual(detour.points[0],original.points[0]);
  assert.deepEqual(detour.points.at(-1),original.points.at(-1));
  assert.throws(()=>map.route('pilot','debug',map.roads.map(r=>r.id)),/route/i);
});

test('the navigation marker moves along each street and changes heading at the corner',()=>{
  city();
  const path=[{x:0,y:0},{x:80,y:0},{x:80,y:40},{x:120,y:40}];
  assert.deepEqual(roadPose(path,40),{x:40,y:0,heading:0});
  assert.deepEqual(roadPose(path,100),{x:80,y:20,heading:90});
  assert.deepEqual(roadPose(path,1000),{x:120,y:40,heading:0});
  assert.deepEqual(roadPose(path,-20),{x:0,y:0,heading:0});
});

test('all public example handoffs have usable city road routes',async()=>{
  city();
  const data=JSON.parse(await readFile(new URL('../assets/lab/navigation-demo.json',import.meta.url),'utf8'));
  const map=createCityNetwork(data);
  assert.equal(new Set([...map.positions.values()].map(p=>`${p.x},${p.y}`)).size,data.nodes.length);
  for(const edge of data.edges){
    const path=map.route(edge.from,edge.to);
    assert.ok(path.roads.length>0);
    assert.ok(path.points.every(p=>map.junctions.some(j=>j.x===p.x&&j.y===p.y)));
  }
});
