import { project, clipFront, pickNode } from './globe-geometry.mjs?v=20261005';
import { TOUR, makeWorld, journeyAt, pointOnPath, stageStart, normalize, cross, dot } from './journey-world.mjs?v=20261005';
import { makeVehicle } from './journey-vehicles.mjs?v=20261005';

const $ = selector => document.querySelector(selector);
const shell = $('#research-atlas');
if (shell) start().catch(error => {
  shell.dataset.ready = 'false';
  $('#atlas-error').hidden = false;
  $('#atlas-status').textContent = 'The globe could not load. The complete research directory is available below.';
  console.error('Research journey:', error.message);
});

async function start() {
  const canvas=$('#research-globe'),ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('Canvas unavailable');
  const world=makeWorld(),preference=matchMedia('(prefers-reduced-motion: reduce)');
  const pause=$('#globe-pause'),select=$('#journey-select'),followButton=$('#globe-follow');
  let width=0,height=0,radius=0,cx=0,cy=0,zoom=1,yaw=-.18,pitch=.48;
  let travelTime=3,running=!preference.matches,following=true,inView=true,frameId=0,previousTime=0,lastPaint=0,pointer=null;
  let yawCos=1,yawSin=0,pitchCos=1,pitchSin=0,lastStage=-1,visibleStops=[];
  const rgbCache=new Map(),light=normalize([-.65,.85,1]);
  const terrain=world.faces.filter(f=>f.layer==='surface').map(prepare);
  const relief=world.faces.filter(f=>f.layer!=='surface').map(prepare);
  const midpoints=TOUR.map((leg,i)=>({id:String(i),point:pointOnPath(leg.path,.42)}));
  const orbitClouds=Array.from({length:17},(_,i)=>({lat:-.6+(i%6)*.24,lon:i*2.399,scale:.018+(i%3)*.006}));

  function rgb(color){if(!rgbCache.has(color))rgbCache.set(color,[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)));return rgbCache.get(color);}
  function prepare(face) {
    const center=face.points[0].map((_,k)=>face.points.reduce((s,p)=>s+p[k],0)/face.points.length);
    const a=face.points[1].map((v,k)=>v-face.points[0][k]),b=face.points[2].map((v,k)=>v-face.points[0][k]);
    let normal=normalize(cross(a,b));if(dot(normal,center)<0)normal=normal.map(v=>-v);
    return {...face,center,normal,rgb:rgb(face.color)};
  }
  function camera([x,y,z]){const xx=x*yawCos+z*yawSin,zz=z*yawCos-x*yawSin;return [xx,y*pitchCos-zz*pitchSin,y*pitchSin+zz*pitchCos];}
  function screen(p){return project(camera(p),cx,cy,radius);}
  function paintFace(face) {
    const poly=clipFront(face.points.map(camera));if(poly.length<3)return;
    const normal=camera(face.normal),diffuse=Math.max(0,dot(normal,light));
    const brightness=.52+diffuse*.54;
    ctx.fillStyle=`rgb(${face.rgb.map(v=>Math.min(255,Math.round(v*brightness))).join(',')})`;
    ctx.beginPath();poly.forEach((p,i)=>{const q=project(p,cx,cy,radius);if(i)ctx.lineTo(q.x,q.y);else ctx.moveTo(q.x,q.y);});ctx.closePath();
    ctx.fill();ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.35;ctx.stroke();
  }
  function paintLine(points,color,lineWidth=1,dashed=false) {
    ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.lineCap='round';ctx.setLineDash(dashed?[2,5]:[]);ctx.beginPath();
    let drawing=false;
    for(const vector of points){const p=screen(vector);if(!p.visible){drawing=false;continue;}if(drawing)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);drawing=true;}
    ctx.stroke();ctx.setLineDash([]);
  }
  function drawRoad(road) {
    if(road.kind==='road'){paintLine(road.points,'#47604e',Math.max(1.8,radius*.010));paintLine(road.points,'#dfd7ae',Math.max(.8,radius*.0045));return;}
    const sides=road.points.map((p,i)=>{
      const a=road.points[Math.max(0,i-1)],b=road.points[Math.min(road.points.length-1,i+1)];
      return normalize(cross(p,b.map((v,k)=>v-a[k]))).map(v=>v*.0030);
    });
    for(const sign of [-1,1])paintLine(road.points.map((p,i)=>p.map((v,k)=>v+sides[i][k]*sign)),'#d4d2b6',Math.max(.7,radius*.003));
    for(let i=1;i<road.points.length;i+=2)paintLine([road.points[i].map((v,k)=>v-sides[i][k]*1.6),road.points[i].map((v,k)=>v+sides[i][k]*1.6)],'#727a65',Math.max(.65,radius*.0025));
  }
  function draw() {
    if(!width||!height)return;
    yawCos=Math.cos(yaw);yawSin=Math.sin(yaw);pitchCos=Math.cos(pitch);pitchSin=Math.sin(pitch);
    ctx.clearRect(0,0,width,height);
    for(let i=0;i<36;i++){ctx.fillStyle=i%3?'#c1dcc71b':'#d4e0c33d';ctx.fillRect(((i*173+71)%977)/977*width,((i*119+32)%613)/613*height,1,1);}
    const halo=ctx.createRadialGradient(cx,cy,radius*.9,cx,cy,radius*1.20);
    halo.addColorStop(0,'#7fc4ab00');halo.addColorStop(.48,'#7fc4ab23');halo.addColorStop(.62,'#84cbbc38');halo.addColorStop(1,'#69bdac00');
    ctx.fillStyle=halo;ctx.fillRect(cx-radius*1.22,cy-radius*1.22,radius*2.44,radius*2.44);
    const shadow=ctx.createRadialGradient(cx,cy+radius*1.05,0,cx,cy+radius*1.05,radius*.8);
    shadow.addColorStop(0,'#05171e49');shadow.addColorStop(1,'#05171e00');ctx.fillStyle=shadow;ctx.fillRect(cx-radius,cy+radius*.85,radius*2,radius*.4);
    const sea=ctx.createRadialGradient(cx-radius*.37,cy-radius*.45,radius*.01,cx+radius*.15,cy+radius*.22,radius*1.17);
    sea.addColorStop(0,'#4498a3');sea.addColorStop(.40,'#2b7c8a');sea.addColorStop(.78,'#185267');sea.addColorStop(1,'#082c40');
    ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.fillStyle=sea;ctx.fill();
    const surface=terrain.filter(f=>camera(f.center)[2]>-.15).sort((a,b)=>camera(a.center)[2]-camera(b.center)[2]);
    surface.forEach(paintFace);
    world.roads.forEach(drawRoad);
    for(const river of world.rivers){paintLine(river.points,'#2d6e79',Math.max(1.3,radius*.007*river.width));paintLine(river.points,'#7fc2c0',Math.max(.6,radius*.003*river.width));}
    const current=journeyAt(travelTime),vehicles=[makeVehicle(current,travelTime,.025)];
    // Smaller independent travelers make the landscape alive during free exploration.
    for(const index of [1,2,5,6,13])if(index!==current.index){
      const seconds=stageStart(index)+((travelTime*.37+TOUR[index].duration*.31)%TOUR[index].duration);
      vehicles.push(makeVehicle(journeyAt(seconds),travelTime,index===5?.015:.018));
    }
    for(const vehicle of vehicles)for(const line of vehicle.lines)paintLine(line.points,line.color,line.width*radius/270);
    const objects=[...relief,...vehicles.flatMap(v=>v.faces.map(prepare))].filter(f=>camera(f.center)[2]>.008).sort((a,b)=>camera(a.center)[2]-camera(b.center)[2]);
    objects.forEach(paintFace);
    for(const vehicle of vehicles)for(const puff of vehicle.smoke){
      const p=screen(puff.point);if(!p.visible)continue;ctx.globalAlpha=puff.alpha*p.depth;ctx.fillStyle='#eff1dd';ctx.beginPath();ctx.arc(p.x,p.y,puff.radius*radius,0,Math.PI*2);ctx.fill();
    }
    for(const cloud of orbitClouds){
      const p=screen([Math.cos(cloud.lat)*Math.sin(cloud.lon+travelTime*.0015)*1.065,Math.sin(cloud.lat)*1.065,Math.cos(cloud.lat)*Math.cos(cloud.lon+travelTime*.0015)*1.065]);
      if(p.depth<.28)continue;
      ctx.globalAlpha=.22*p.depth;ctx.fillStyle='#edf3df';
      for(let k=0;k<4;k++){ctx.beginPath();ctx.ellipse(p.x+(k-1.5)*radius*cloud.scale*.8,p.y+Math.sin(k*2.4)*radius*cloud.scale*.23,radius*cloud.scale*(.8+(k%2)*.2),radius*cloud.scale*.47,0,0,Math.PI*2);ctx.fill();}
    }
    ctx.globalAlpha=1;
    ctx.beginPath();ctx.arc(cx,cy,radius*1.008,0,Math.PI*2);ctx.strokeStyle='#a3ccc132';ctx.lineWidth=.8;ctx.stroke();
    // The scene uses actual radial geometry; surface objects are depth-sorted before projection.
    visibleStops=midpoints.map(m=>({...screen(m.point),id:m.id}));
    canvas.dataset.orientation=`${yaw.toFixed(4)},${pitch.toFixed(4)}`;
    canvas.dataset.vehicle=current.leg.vehicle;canvas.dataset.journeyIndex=String(current.index);canvas.dataset.travelTime=travelTime.toFixed(3);canvas.dataset.zoom=zoom.toFixed(2);
    $('#journey-progress').style.width=`${current.progress*100}%`;
    if(lastStage!==current.index){
      lastStage=current.index;select.value=String(current.index);$('#journey-place').textContent=current.leg.name;
      $('#journey-number').textContent=`${String(current.index+1).padStart(2,'0')} / 16`;
      $('#journey-transport').textContent=current.leg.vehicle==='boat'?(current.leg.terrain==='river'?'BY RIVER BOAT':'UNDER SAIL'):`BY ${current.leg.vehicle.toUpperCase()}`;
      canvas.setAttribute('aria-label',`Travel globe: ${current.leg.name}, by ${current.leg.vehicle}. Snow mountains, forests, deserts and rivers. Drag or use arrow keys to rotate.`);
      $('#atlas-status').textContent=`${current.leg.name}. Traveling by ${current.leg.vehicle}.`;
    }
  }
  function aim(state,instant=false){
    const targetYaw=-state.lon,targetPitch=Math.max(-1.02,Math.min(1.02,state.lat*.84));
    const delta=Math.atan2(Math.sin(targetYaw-yaw),Math.cos(targetYaw-yaw));
    yaw+=delta*(instant?1:.035);pitch+=(targetPitch-pitch)*(instant?1:.035);
  }
  function frame(now){
    const elapsed=previousTime?Math.min((now-previousTime)/1000,.08):0;previousTime=now;travelTime+=elapsed;
    if(following)aim(journeyAt(travelTime));
    if(now-lastPaint>32){draw();lastPaint=now;}
    frameId=requestAnimationFrame(frame);
  }
  function syncAnimation(){
    cancelAnimationFrame(frameId);frameId=0;previousTime=0;lastPaint=0;
    pause.textContent=running?'Pause journey':'Play journey';pause.setAttribute('aria-pressed',String(!running));
    followButton.setAttribute('aria-pressed',String(following));canvas.dataset.rotating=String(running&&inView&&!document.hidden);
    if(running&&inView&&!document.hidden)frameId=requestAnimationFrame(frame);
  }
  function resize(){
    const rect=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);
    width=rect.width;height=rect.height;canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
    radius=Math.min(width*.43,height*.385)*zoom;cx=width/2;cy=height*.46;draw();
  }
  function chooseStage(index){
    index=((index%TOUR.length)+TOUR.length)%TOUR.length;travelTime=stageStart(index)+TOUR[index].duration*.30;following=true;
    aim(journeyAt(travelTime),true);syncAnimation();draw();
  }
  function changeZoom(amount){zoom=Math.max(.80,Math.min(1.32,zoom+amount));resize();}
  function freeView(){following=false;followButton.setAttribute('aria-pressed','false');}
  TOUR.forEach((leg,index)=>{const option=document.createElement('option');option.value=String(index);option.textContent=leg.name;select.append(option);});
  shell.querySelectorAll('button:disabled,select:disabled').forEach(el=>{el.disabled=false;});shell.dataset.ready='true';
  select.addEventListener('change',()=>chooseStage(Number(select.value)));
  pause.addEventListener('click',()=>{running=!running;syncAnimation();draw();});
  $('#globe-left').addEventListener('click',()=>chooseStage(journeyAt(travelTime).index-1));
  $('#globe-right').addEventListener('click',()=>chooseStage(journeyAt(travelTime).index+1));
  $('#globe-zoom-in').addEventListener('click',()=>changeZoom(.1));$('#globe-zoom-out').addEventListener('click',()=>changeZoom(-.1));
  followButton.addEventListener('click',()=>{following=!following;if(following)aim(journeyAt(travelTime),true);syncAnimation();draw();});
  canvas.addEventListener('pointerdown',event=>{pointer={id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,moved:false};canvas.setPointerCapture(event.pointerId);});
  canvas.addEventListener('pointermove',event=>{
    if(!pointer||pointer.id!==event.pointerId)return;
    const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
    if(Math.hypot(event.clientX-pointer.startX,event.clientY-pointer.startY)>5){pointer.moved=true;freeView();}
    if(pointer.moved){yaw+=dx*.005;if(event.pointerType!=='touch')pitch=Math.max(-1.15,Math.min(1.15,pitch-dy*.005));}
    pointer.x=event.clientX;pointer.y=event.clientY;draw();
  });
  canvas.addEventListener('pointerup',event=>{
    if(!pointer||pointer.id!==event.pointerId)return;
    const moved=pointer.moved;pointer=null;if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);if(moved)return;
    const rect=canvas.getBoundingClientRect(),hit=pickNode(visibleStops,event.clientX-rect.left,event.clientY-rect.top,38);if(hit)chooseStage(Number(hit.id));
  });
  canvas.addEventListener('pointercancel',()=>{pointer=null;});
  canvas.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','+','=','-','Home'].includes(event.key))return;event.preventDefault();
    if(event.key===' '){running=!running;syncAnimation();}
    else if(event.key==='+'||event.key==='=')changeZoom(.1);
    else if(event.key==='-')changeZoom(-.1);
    else if(event.key==='Home')chooseStage(0);
    else{freeView();if(event.key==='ArrowLeft')yaw-=.15;if(event.key==='ArrowRight')yaw+=.15;if(event.key==='ArrowUp')pitch=Math.min(1.15,pitch+.15);if(event.key==='ArrowDown')pitch=Math.max(-1.15,pitch-.15);}
    draw();
  });
  document.addEventListener('click',event=>{const button=event.target.closest('[data-module]');if(!button)return;const index=TOUR.findIndex(leg=>leg.module===button.dataset.module);if(index>=0){chooseStage(index);$('#map').scrollIntoView({block:'start',behavior:preference.matches?'auto':'smooth'});}});
  function revealHash(){if(location.hash.startsWith('#node-')){const target=document.getElementById(location.hash.slice(1));if(target){const detail=target.closest('details');if(detail)detail.open=true;}}}
  revealHash();window.addEventListener('hashchange',revealHash);
  preference.addEventListener('change',()=>{if(preference.matches){running=false;syncAnimation();draw();}});
  document.addEventListener('visibilitychange',syncAnimation);
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;syncAnimation();},{threshold:.05}).observe(canvas);
  resize();syncAnimation();
}
