import { normalize, cross } from './journey-world.mjs?v=20261005';

export function makeVehicle(state, time, size = .024) {
  const up=state.position, forward=state.tangent, side=normalize(cross(forward,up));
  const bob=state.leg.vehicle==='boat'?Math.sin(time*2.7)*.002:0;
  const height=state.leg.terrain==='sea'?1.009:1.024;
  const anchor=up.map(v=>v*(height+bob));
  const p=(x,y,z)=>anchor.map((v,k)=>v+size*(forward[k]*x+up[k]*y+side[k]*z));
  const faces=[],lines=[],smoke=[];
  const face=(points,color)=>faces.push({points,color,kind:'vehicle',layer:'vehicle'});
  const line=(points,color,width=1)=>lines.push({points,color,width});
  function box(x0,x1,y0,y1,z0,z1,color,top=color) {
    const a=p(x0,y0,z0),b=p(x1,y0,z0),c=p(x1,y1,z0),d=p(x0,y1,z0),e=p(x0,y0,z1),f=p(x1,y0,z1),g=p(x1,y1,z1),h=p(x0,y1,z1);
    face([a,b,c,d],color);face([e,h,g,f],color);face([a,d,h,e],color);face([b,f,g,c],color);face([d,c,g,h],top);
  }
  function wheel(x,z,r=.22) {
    const centerY=.16;
    face(Array.from({length:10},(_,i)=>p(x+Math.cos(i*Math.PI/5)*r,centerY+Math.sin(i*Math.PI/5)*r,z)),'#27373b');
    face(Array.from({length:8},(_,i)=>p(x+Math.cos(i*Math.PI/4)*r*.44,centerY+Math.sin(i*Math.PI/4)*r*.44,z*1.003)),'#c9cbbb');
    const angle=time*8;
    line([p(x-Math.cos(angle)*r*.62,centerY-Math.sin(angle)*r*.62,z*1.01),p(x+Math.cos(angle)*r*.62,centerY+Math.sin(angle)*r*.62,z*1.01)],'#eee7c9',.65);
  }
  if(state.leg.vehicle==='car') {
    box(-.94,.96,.15,.52,-.39,.39,'#c96742','#eaa56b');
    box(-.35,.40,.52,.91,-.32,.32,'#f0d7a0','#f5e7c8');
    face([p(-.29,.57,-.325),p(.32,.57,-.325),p(.32,.84,-.325),p(-.29,.84,-.325)],'#7ea8a8');
    face([p(-.29,.57,.325),p(-.29,.84,.325),p(.32,.84,.325),p(.32,.57,.325)],'#557f86');
    box(.95,1.02,.25,.36,-.34,.34,'#e7dfc7');
    for(const x of [-.62,.66])for(const z of [-.43,.43])wheel(x,z);
  } else if(state.leg.vehicle==='train') {
    for(let car=0;car<3;car++) {
      const x=-car*1.95;
      box(x-.8,x+.8,.18,car?.85:.66,-.40,.40,car?'#b95c43':'#cb963f',car?'#e7d9aa':'#ecc470');
      if(car) {
        box(x-.9,x+.9,.86,.95,-.45,.45,'#e9dabb');
        for(const xx of [-.50,0,.50]) for(const zz of [-.407,.407])face([p(x+xx-.13,.43,zz),p(x+xx+.13,.43,zz),p(x+xx+.13,.72,zz),p(x+xx-.13,.72,zz)],'#60888c');
      } else {
        box(x-.67,x-.08,.63,1.13,-.39,.39,'#b87d32','#edce83');
        box(x+.28,x+.46,.64,1.22,-.13,.13,'#354a49');
        face([p(x-.59,.76,.395),p(x-.17,.76,.395),p(x-.17,1.02,.395),p(x-.59,1.02,.395)],'#84a5a2');
      }
      for(const xx of [-.53,.53])for(const zz of [-.44,.44])wheel(x+xx,zz,.21);
      if(car<2)box(x-1.09,x-.8,.27,.34,-.08,.08,'#4e5b53');
    }
    for(let i=0;i<4;i++) {
      const age=(time*.55+i*.23)%1;
      smoke.push({point:p(.38-age*2.6,1.25+age*1.6,Math.sin(age*8)*.14),radius:size*(.12+age*.30),alpha:(1-age)*.28});
    }
  } else {
    const top=[p(-1.05,.29,-.47),p(.95,.29,-.43),p(1.55,.29,0),p(.95,.29,.43),p(-1.05,.29,.47)];
    const keel=[p(-.75,-.02,-.22),p(.70,-.02,-.22),p(1.15,.02,0),p(.70,-.02,.22),p(-.75,-.02,.22)];
    face(top,'#eadbc0');
    for(let i=0;i<top.length;i++)face([top[i],top[(i+1)%5],keel[(i+1)%5],keel[i]],i%2?'#b55c40':'#d88459');
    box(-.62,-.15,.30,.64,-.31,.31,'#f2e5c4','#fcf5de');
    box(.05,.13,.30,2.03,-.035,.035,'#a68c5b');
    const flap=Math.sin(time*3.2)*.11;
    face([p(.06,1.96,0),p(.06,.71,0),p(.96,.72,flap)],'#fcf4db');
    face([p(0,1.80,0),p(-.82,.80,-flap),p(0,.71,0)],'#d5e4df');
    face([p(.09,2.02,0),p(.09,2.26,0),p(-.39,2.11,flap)],'#d7714a');
    for(const sign of [-1,1])line([p(-1.15,.02,sign*.32),p(-1.9,.02,sign*.48),p(-2.7,.02,sign*.72)],'#bddfd0',1);
  }
  return {faces,lines,smoke};
}
