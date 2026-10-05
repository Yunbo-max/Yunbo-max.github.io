import {project,clipFront} from './globe-geometry.mjs?v=20261005';
import {normalize,cross,dot,pointOnPath} from './journey-world.mjs?v=20261005-routes';
import {drawVehicleIcon} from './journey-vehicles.mjs?v=20261005-routes';
import {drawHazard,drawHarbor} from './expedition-symbols.mjs?v=20261005-studies';
import {expeditionAt,fleetAt,transportFor,onRail,iconWidth,HAZARDS} from './research-expeditions.mjs?v=20261005-studies';

export function prepareWorld(world){
 const prepare=face=>{
  const center=face.points[0].map((_,k)=>face.points.reduce((s,p)=>s+p[k],0)/face.points.length),a=face.points[1].map((v,k)=>v-face.points[0][k]),b=face.points[2].map((v,k)=>v-face.points[0][k]);
  let normal=normalize(cross(a,b));if(dot(normal,center)<0)normal=normal.map(v=>-v);
  return {...face,center,normal,rgb:[1,3,5].map(i=>parseInt(face.color.slice(i,i+2),16))};
 };
 return {terrain:world.faces.filter(f=>f.layer==='surface').map(prepare),relief:world.faces.filter(f=>f.layer!=='surface').map(prepare)};
}

export function createGlobe(canvas,caseId,world,prepared,sample,{onToggle,onPick,getTime,reducedMotion}){
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
 let width=0,height=0,radius=0,cx=0,cy=0,zoom=1,yaw=0,pitch=0,following=true,pointer=null;
 let yawCos=1,yawSin=0,pitchCos=1,pitchSin=0,hitTargets=[];
 const light=normalize([-.65,.85,1]);
 const surfaceCache=new Map();
 const classify=(p,index)=>{
  const key=p.join(',')+'/'+onRail(index);
  if(!surfaceCache.has(key)){if(surfaceCache.size>10000)surfaceCache.clear();surfaceCache.set(key,transportFor(p,index,sample));}
  return surfaceCache.get(key);
 };
 const camera=([x,y,z])=>{const xx=x*yawCos+z*yawSin,zz=z*yawCos-x*yawSin;return [xx,y*pitchCos-zz*pitchSin,y*pitchSin+zz*pitchCos];};
 const screen=p=>project(camera(p),cx,cy,radius);
 function aim(position,instant=false){
  const lon=Math.atan2(position[0],position[2]),lat=Math.asin(position[1]),targetYaw=-lon,targetPitch=Math.max(-1.12,Math.min(1.12,lat));
  const delta=Math.atan2(Math.sin(targetYaw-yaw),Math.cos(targetYaw-yaw));yaw+=delta*(instant?1:.11);pitch+=(targetPitch-pitch)*(instant?1:.11);
 }
 function face(f){
  const poly=clipFront(f.points.map(camera));if(poly.length<3)return;
  const brightness=.53+Math.max(0,dot(camera(f.normal),light))*.54;
  ctx.fillStyle=`rgb(${f.rgb.map(v=>Math.min(255,Math.round(v*brightness))).join(',')})`;ctx.beginPath();
  poly.forEach((p,i)=>{const q=project(p,cx,cy,radius);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});ctx.closePath();ctx.fill();ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.35;ctx.stroke();
 }
 function line(points,color,size=1,dash=[]){
  ctx.strokeStyle=color;ctx.lineWidth=size;ctx.lineCap='round';ctx.setLineDash(dash);ctx.beginPath();let drawing=false;
  for(const v of points){const p=screen(v.map(k=>k*1.02));if(!p.visible){drawing=false;continue;}drawing?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);drawing=true;}
  ctx.stroke();ctx.setLineDash([]);
 }
 function track(points,index,color){
  for(let i=1;i<points.length;i++){
   const middle=normalize(points[i].map((v,k)=>v+points[i-1][k])),mode=classify(middle,index);
   if(mode.vehicle==='boat'){line([points[i-1],points[i]],color,1.25,[2,4]);continue;}
   line([points[i-1],points[i]],mode.vehicle==='train'?'#2d4342':'#425a49',mode.vehicle==='train'?4:3.5);
   line([points[i-1],points[i]],color,1.25);
   if(mode.vehicle==='train'&&i%2===0){const direction=normalize(points[i].map((v,k)=>v-points[i-1][k])),side=normalize(cross(middle,direction));line([middle.map((v,k)=>v-side[k]*.013),middle.map((v,k)=>v+side[k]*.013)],'#e1deba',1.2);}
  }
 }
 function draw(seconds,instant=false){
  if(!width||!height)return;
  const current=expeditionAt(caseId,seconds),fleet=fleetAt(caseId,seconds),color=current.case.color;
  if(following)aim(current.position,instant||reducedMotion());
  yawCos=Math.cos(yaw);yawSin=Math.sin(yaw);pitchCos=Math.cos(pitch);pitchSin=Math.sin(pitch);
  ctx.clearRect(0,0,width,height);
  for(let i=0;i<28;i++){ctx.fillStyle=i%3?'#c1dcc71b':'#d4e0c33d';ctx.fillRect(((i*173+71)%977)/977*width,((i*119+32)%613)/613*height,1,1);}
  const halo=ctx.createRadialGradient(cx,cy,radius*.9,cx,cy,radius*1.19);halo.addColorStop(0,'#7fc4ab00');halo.addColorStop(.58,'#84cbbc32');halo.addColorStop(1,'#69bdac00');ctx.fillStyle=halo;ctx.fillRect(cx-radius*1.2,cy-radius*1.2,radius*2.4,radius*2.4);
  const sea=ctx.createRadialGradient(cx-radius*.37,cy-radius*.45,0,cx+radius*.15,cy+radius*.22,radius*1.17);sea.addColorStop(0,'#4498a3');sea.addColorStop(.43,'#2b7c8a');sea.addColorStop(.8,'#185267');sea.addColorStop(1,'#082c40');ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.fillStyle=sea;ctx.fill();
  prepared.terrain.filter(f=>camera(f.center)[2]>-.15).sort((a,b)=>camera(a.center)[2]-camera(b.center)[2]).forEach(face);
  for(const road of world.roads)line(road.points,road.kind==='rail'?'#c4c8a05c':'#a9b78a42',1);
  for(const river of world.rivers){line(river.points,'#277180',Math.max(1.5,radius*.006*river.width));line(river.points,'#8bd6d2',Math.max(.7,radius*.0028*river.width));}
  const parentPath=Array.from({length:28},(_,i)=>pointOnPath(current.path,i/27));
  track(parentPath,current.index,color);
  if(fleet.wave===1||fleet.wave===2)for(const b of fleet.members)track(b.path,current.index,b.hazard?HAZARDS[b.hazard].color:color+'8c');
  if(fleet.wave===3)for(const b of fleet.members)line(b.path,color,1.5,[3,5]);
  prepared.relief.filter(f=>camera(f.center)[2]>.01).sort((a,b)=>camera(a.center)[2]-camera(b.center)[2]).forEach(face);
  ctx.beginPath();ctx.arc(cx,cy,radius*1.008,0,Math.PI*2);ctx.strokeStyle='#a3ccc13b';ctx.lineWidth=.8;ctx.stroke();
  hitTargets=[];const shown=[];
  if(!fleet.members.length){const p=screen(current.position.map(v=>v*1.034)),mode=classify(current.position,current.index);if(p.visible)drawVehicleIcon(ctx,{type:mode.vehicle,x:p.x,y:p.y-12,width:iconWidth(width,true),time:seconds,primary:true});shown.push({id:0,vehicle:mode.vehicle,terrain:mode.terrain});}
  else{
   const sorted=fleet.members.map(b=>({b,p:screen(b.position.map(v=>v*1.04))})).sort((a,b)=>a.p.y-b.p.y);
   for(const {b,p} of sorted){
    const mode=classify(b.position,current.index);shown.push({id:b.id,vehicle:mode.vehicle,terrain:mode.terrain,status:b.status});if(!p.visible)continue;
    const final=fleet.wave===3,w=iconWidth(width,final),halted=['stopped','carryover','waiting','pending'].includes(b.status);
    ctx.save();ctx.globalAlpha=b.status==='stopped'?.58:1;
    drawVehicleIcon(ctx,{type:mode.vehicle,x:p.x,y:p.y-11,width:w,time:halted?b.progress*20:seconds,primary:final,heading:b.id%2?1:-1});ctx.restore();
    const badgeX=p.x-w*.37,badgeY=p.y+11;ctx.fillStyle='#0b2639';ctx.beginPath();ctx.arc(badgeX,badgeY,10,0,Math.PI*2);ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=1.1;ctx.stroke();ctx.fillStyle='#f1efdc';ctx.font='600 10px system-ui,sans-serif';ctx.textAlign='center';ctx.fillText(String(b.id),badgeX,badgeY+3.5);
    if(b.hazard)drawHazard(ctx,b.hazard,p.x+w*.4,p.y-32,27,seconds);
    if(final){const target=screen(b.path.at(-1).map(v=>v*1.04));const name={'Validated method':'Method','Scoped motion finding':'Motion finding','Reproducible evaluation note':'Evaluation note','Validated reconstruction':'Reconstruction','Scoped resource guide':'Resource guide'}[b.destination];if(target.visible)drawHarbor(ctx,target.x,target.y+12,color,`${b.id} · ${name}`);}
    hitTargets.push({id:b.id,x:p.x,y:p.y,visible:true});
   }
  }
  const mode=classify(current.position,current.index);
  Object.assign(canvas.dataset,{case:caseId,step:String(current.index),travelTime:seconds.toFixed(3),wave:String(fleet.wave),fleetSize:String(fleet.members.length),vehicle:mode.vehicle,terrain:mode.terrain,vehicles:JSON.stringify(shown),zoom:zoom.toFixed(2),following:String(following),orientation:`${yaw.toFixed(4)},${pitch.toFixed(4)}`});
  canvas.setAttribute('aria-label',`${current.case.title}. Step ${current.index+1} of 30: ${current.step.title}. ${fleet.label}. ${mode.vehicle} on ${mode.terrain}. Drag or use arrow keys to rotate.`);
 }
 function resize(){const rect=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);width=rect.width;height=rect.height;canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);radius=Math.min(width*.425,height*.365)*zoom;cx=width/2;cy=height*.47;draw(getTime(),true);}
 function changeZoom(delta){zoom=Math.max(.78,Math.min(1.30,zoom+delta));resize();}
 function follow(){following=!following;draw(getTime(),true);return following;}
 canvas.addEventListener('pointerdown',e=>{pointer={id:e.pointerId,x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(Math.hypot(e.clientX-pointer.sx,e.clientY-pointer.sy)>5){pointer.moved=true;following=false;}if(pointer.moved){yaw+=dx*.007;if(e.pointerType!=='touch')pitch=Math.max(-1.2,Math.min(1.2,pitch-dy*.007));}pointer.x=e.clientX;pointer.y=e.clientY;draw(getTime());});
 canvas.addEventListener('pointerup',e=>{if(!pointer||pointer.id!==e.pointerId)return;const moved=pointer.moved;pointer=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);if(moved)return;const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;const hit=hitTargets.find(p=>Math.hypot(p.x-x,p.y-y)<30);if(hit)onPick(hit.id);});
 canvas.addEventListener('pointercancel',()=>{pointer=null;});
 canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','+','=','-','Home'].includes(e.key))return;e.preventDefault();if(e.key===' ')onToggle();else if(e.key==='+'||e.key==='=')changeZoom(.1);else if(e.key==='-')changeZoom(-.1);else if(e.key==='Home'){following=true;draw(getTime(),true);}else{following=false;if(e.key==='ArrowLeft')yaw-=.15;if(e.key==='ArrowRight')yaw+=.15;if(e.key==='ArrowUp')pitch=Math.min(1.2,pitch+.15);if(e.key==='ArrowDown')pitch=Math.max(-1.2,pitch-.15);draw(getTime());}});
 const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
 return {draw,resize,changeZoom,follow,get following(){return following;}};
}
