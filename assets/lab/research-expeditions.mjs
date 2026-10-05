import {CASES,getCase,STEP_SECONDS} from './4d-expedition-cases.mjs?v=20261005-fleet2';
import {earthPoint,pointOnPath,normalize,cross,dot} from './journey-world.mjs?v=20261005-routes';

export {CASES,getCase,STEP_SECONDS};
export const TOTAL_SECONDS=30*STEP_SECONDS;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const waypoints={
 mesh:[[47,8],[46,10],[45,12],[43,12],[41,11],[37,10],[33,8],[29,5],[25,0],[22,-7],[20,-16],[18,-23],[13,-30],[7,-38],[1,-45],[-1,-49],[-3,-55],[-4,-60],[-6,-68],[-11,-75],[-17,-71],[-24,-68],[-31,-71],[-34,-78],[-31,-87],[-27,-94],[-22,-104],[-16,-115],[-12,-126],[-6,-135],[-6,-141]],
 gaussian:[[40,-109],[38,-106],[35,-101],[32,-98],[28,-94],[24,-88],[20,-84],[16,-79],[12,-72],[8,-67],[4,-62],[-2,-57],[-4,-51],[-1,-45],[3,-36],[9,-28],[15,-23],[20,-18],[25,-10],[30,-3],[34,5],[37,10],[39,17],[36,24],[32,28],[29,35],[23,43],[19,50],[15,55],[10,58],[8,61]]
};
export const DESTINATIONS={mesh:[[-3,-157],[-20,-139],[16,-135]],gaussian:[[4,50],[22,64]]};
export const HAZARDS={
 lightning:{symbol:'ϟ',label:'Execution fault',meaning:'A code/runtime fault needs bounded repair. It is not a verdict on the idea.',color:'#ffd075'},
 storm:{symbol:'☁',label:'Mixed or refuted evidence',meaning:'Competing explanations still need verified native comparisons and human batch review.',color:'#bac4ee'},
 snow:{symbol:'❄',label:'Resource hold / carryover',meaning:'The job waits for qualified capacity or another approved window.',color:'#bde5f2'},
 quake:{symbol:'≋',label:'Assumption / sensitivity',meaning:'A mechanism or parameter assumption needs a discriminating native comparison.',color:'#e3b077'},
 tsunami:{symbol:'≈',label:'Scoring mismatch',meaning:'Inputs, alignment, split or metric identity need reconciliation before interpretation.',color:'#77cedc'}
};

// Classify the same spherical triangles and rivers that the renderer actually draws.
// A boat is never assigned to land; trains have explicit drawn rail segments.
export function makeTerrainSampler(world){
 const triangles=world.faces.filter(f=>f.layer==='surface').map(f=>{
   const p=f.points.map(normalize),center=normalize(p[0].map((v,k)=>v+p[1][k]+p[2][k]));
   return p.map((a,i)=>{const n=normalize(cross(a,p[(i+1)%3]));return dot(n,center)<0?n.map(v=>-v):n;});
 });
 const rivers=world.rivers.flatMap(r=>r.points.map(normalize));
 return p=>{
   if(rivers.some(q=>dot(p,q)>.999985))return 'river';
   for(const edges of triangles)if(edges.every(n=>dot(n,p)>=-1e-8))return 'land';
   return 'sea';
 };
}
export const onRail=index=>index<3||(index>=20&&index<=22);
export function transportFor(position,index,sample){const terrain=sample(position);return {terrain,vehicle:terrain==='land'?(onRail(index)?'train':'car'):'boat'};}
export const stepPath=(id,index)=>[waypoints[id][index],waypoints[id][index+1]];
export function expeditionAt(id,seconds){
 if(!Number.isFinite(seconds))throw new Error('Expedition time must be finite');
 const c=getCase(id),time=clamp(seconds,0,TOTAL_SECONDS),index=Math.min(29,Math.floor(time/STEP_SECONDS)),progress=clamp((time-index*STEP_SECONDS)/STEP_SECONDS);
 const path=stepPath(id,index),position=pointOnPath(path,progress),before=pointOnPath(path,clamp(progress-.001)),after=pointOnPath(path,clamp(progress+.001));
 const delta=after.map((v,k)=>v-before[k]),tangent=normalize(delta.map((v,k)=>v-dot(delta,position)*position[k]));
 return {case:c,step:c.steps[index],index,progress,position,tangent,path,time,ended:seconds>=TOTAL_SECONDS,lat:Math.asin(position[1]),lon:Math.atan2(position[0],position[2])};
}
function baseAt(id,stage){return expeditionAt(id,clamp(stage,0,30)*STEP_SECONDS).position;}
function offset(p,u,branch,wave){
 const east=normalize(cross([0,1,0],p)),north=normalize(cross(p,east));
 const horizontal=((branch%5)-2)*.28,vertical=(branch<5?-.24:.24);
 const spread=Math.pow(Math.max(0,Math.sin(Math.PI*u)),.35)*.96;
 return normalize(p.map((v,k)=>v+spread*(horizontal*east[k]+vertical*north[k])*(wave===1?1:1.08)));
}
export function fleetPath(id,branch,wave=1){
 const start=wave===1?8:20,end=wave===1?18:25;
 return Array.from({length:49},(_,i)=>offset(baseAt(id,start+(end-start)*i/48),i/48,branch,wave));
}
const fleetCache=new Map();
function cachedPath(id,branch,wave){const key=`${id}/${branch}/${wave}`;if(!fleetCache.has(key))fleetCache.set(key,fleetPath(id,branch,wave));return fleetCache.get(key);}
function pointFromVectors(points,u){const t=clamp(u)*(points.length-1),i=Math.min(points.length-2,Math.floor(t)),p=t-i;return normalize(points[i].map((v,k)=>v*(1-p)+points[i+1][k]*p));}
export function candidateState(candidate,index){
 if(index>=17)return {status:candidate.status,hazard:candidate.status==='arrived'?null:candidate.hazard,repaired:!!candidate.repairAt};
 if(candidate.hazardAt!==null&&index>=candidate.hazardAt){
   if(candidate.repairAt!==null&&index>=candidate.repairAt)return {status:'repaired',hazard:null,repaired:true};
   return {status:candidate.status==='carryover'?'waiting':'pending',hazard:candidate.hazard,repaired:false};
 }
 return {status:index<8?'queued':'running',hazard:null,repaired:false};
}
export function fleetAt(id,seconds){
 const state=expeditionAt(id,seconds),index=state.index,c=state.case;
 if(index>=29){
   const survivors=c.candidates.filter(b=>b.status==='arrived');
   return {wave:3,label:'Separate destinations',members:survivors.map((b,i)=>{
     const path=[waypoints[id][29],DESTINATIONS[id][i]],position=pointOnPath(path,state.progress);
     return {id:b.id,label:b.label,status:state.ended?'arrived':'arriving',hazard:null,destination:b.destination,position,path:path.map(p=>earthPoint(...p)),progress:state.progress,meta:b};
   })};
 }
 const wave=index>=20&&index<=24?2:index>=8&&index<=17?1:0;
 if(!wave)return {wave:0,label:index<8?'Shared preparation':'Converged research route',members:[]};
 const start=wave===1?8:20,end=wave===1?18:25,u=clamp((seconds/STEP_SECONDS-start)/(end-start));
 return {wave,label:wave===1?'10 candidate explanations':'10 validation run units',members:c.candidates.map((b,i)=>{
   let status,hazard,progress=u;
   if(wave===1){
     ({status,hazard}=candidateState(b,index));
     if(hazard!==null&&b.hazardAt!==null)progress=Math.min(progress,(b.hazardAt+.35-start)/(end-start));
     if(index>=17&&b.status!=='arrived')progress=Math.min(progress,(16.7-start)/(end-start));
   }else{
     status=index>=24?'verified':'running';hazard=null;
     // A repaired evaluator check illustrates a validation obligation, not a new idea.
     if(i===9&&index===22){status='pending';hazard='tsunami';progress=Math.min(progress,.47);}
   }
   const path=cachedPath(id,i,wave);
   return {id:i+1,label:wave===1?b.label:c.followups[i],status,hazard,position:pointFromVectors(path,progress),path,progress,meta:b};
 })};
}
export function destinationTotals(id){const c=getCase(id);return {arrived:c.candidates.filter(b=>b.status==='arrived').length,carryover:c.candidates.filter(b=>b.status==='carryover').length,stopped:c.candidates.filter(b=>b.status==='stopped').length};}
export const iconWidth=(width,primary=false)=>primary?Math.max(65,Math.min(82,width*.15)):Math.max(39,Math.min(48,width*.075));
export const transportText=type=>({boat:'SAILBOAT · WATER',car:'CAR · LAND',train:'TRAIN · DRAWN RAIL'}[type]);
