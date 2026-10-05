import { sphere, greatCircle } from './globe-geometry.mjs?v=20261005';

const RAD = Math.PI / 180;
export const earthPoint = (lat, lon, radius = 1) => sphere(lat * RAD, lon * RAD).map(v => v * radius);
export const normalize = p => p.map(v => v / (Math.hypot(...p) || 1));
export const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
export const dot = (a, b) => a.reduce((sum, v, i) => sum + v * b[i], 0);
const add = (a, b) => a.map((v, i) => v + b[i]);
const scale = (a, k) => a.map(v => v * k);
const angle = (a, b) => Math.acos(Math.max(-1, Math.min(1, dot(a, b))));

// An illustrated, continuous scenic journey; not a required order of research tasks.
export const TOUR = [
  {module:'P',name:'The Alpine railway',vehicle:'train',terrain:'rail',duration:14,path:[[47,8],[45,10],[43,12]]},
  {module:'I',name:'Across the Mediterranean',vehicle:'boat',terrain:'sea',duration:12,path:[[43,12],[41,11],[38.5,11],[37,10]]},
  {module:'L',name:'The Sahara road',vehicle:'car',terrain:'road',duration:15,path:[[37,10],[33,8],[29,5]]},
  {module:'B',name:'Through the golden dunes',vehicle:'car',terrain:'road',duration:16,path:[[29,5],[24,-4],[20,-16]]},
  {module:'H',name:'The Atlantic crossing',vehicle:'boat',terrain:'sea',duration:23,path:[[20,-16],[16,-23],[8,-32],[0,-42],[-1,-49]]},
  {module:'M',name:'Along the Amazon',vehicle:'boat',terrain:'river',duration:22,path:[[-1,-49],[-2,-54],[-3,-60],[-4,-66],[-5,-72]]},
  {module:'S',name:'The Andean railway',vehicle:'train',terrain:'rail',duration:18,path:[[-5,-72],[-11,-76],[-16,-72],[-21,-68]]},
  {module:'G',name:'A road through the Andes',vehicle:'car',terrain:'road',duration:16,path:[[-21,-68],[-26,-68],[-31,-71],[-34,-72]]},
  {module:'E',name:'Into the open Pacific',vehicle:'boat',terrain:'sea',duration:24,path:[[-34,-72],[-34,-100],[-26,-130]]},
  {module:'V',name:'The blue horizon',vehicle:'boat',terrain:'sea',duration:25,path:[[-26,-130],[-16,-161],[-5,174],[4,145]]},
  {module:'W',name:'The tropical islands',vehicle:'boat',terrain:'sea',duration:18,path:[[4,145],[8,129],[16,123]]},
  {module:'F',name:'Across the South China Sea',vehicle:'boat',terrain:'sea',duration:16,path:[[16,123],[20,118],[22,114]]},
  {module:'R',name:'The forest road',vehicle:'car',terrain:'road',duration:17,path:[[22,114],[26,109],[29,101]]},
  {module:'A',name:'Beneath the Himalayas',vehicle:'car',terrain:'road',duration:20,path:[[29,101],[30,94],[29,85],[30,80]]},
  {module:'C',name:'The great steppe railway',vehicle:'train',terrain:'rail',duration:24,path:[[30,80],[34,72],[40,63],[45,50],[49,40]]},
  {module:'X',name:'Home through the highlands',vehicle:'train',terrain:'rail',duration:23,path:[[49,40],[49,29],[47,19],[47,12],[47,8]]}
];

const prepared = TOUR.map(leg => {
  const points = leg.path.map(p => earthPoint(...p));
  const lengths = points.slice(1).map((p, i) => angle(points[i], p));
  return { points, lengths, total: lengths.reduce((a, b) => a + b, 0) };
});
export const tripDuration = TOUR.reduce((sum, leg) => sum + leg.duration, 0);
export const stageStart = index => TOUR.slice(0, index).reduce((sum, leg) => sum + leg.duration, 0);

export function pointOnPath(path, progress) {
  const known = TOUR.findIndex(leg => leg.path === path);
  const points = known < 0 ? path.map(p => earthPoint(...p)) : prepared[known].points;
  if (progress <= 0) return [...points[0]];
  if (progress >= 1) return [...points.at(-1)];
  const lengths = known < 0 ? points.slice(1).map((p, i) => angle(points[i], p)) : prepared[known].lengths;
  let remaining = progress * lengths.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i] || i === lengths.length - 1) {
      const t = lengths[i] ? remaining / lengths[i] : 0;
      const theta = lengths[i], sine = Math.sin(theta);
      if (Math.abs(sine) < 1e-8) return normalize(points[i].map((v,k) => v*(1-t)+points[i+1][k]*t));
      return normalize(points[i].map((v,k) => v*Math.sin((1-t)*theta)/sine+points[i+1][k]*Math.sin(t*theta)/sine));
    }
    remaining -= lengths[i];
  }
  return [...points.at(-1)];
}

export function journeyAt(seconds) {
  let time = ((seconds % tripDuration) + tripDuration) % tripDuration, index = 0;
  while (index < TOUR.length - 1 && time >= TOUR[index].duration) time -= TOUR[index++].duration;
  const leg = TOUR[index], progress = time / leg.duration;
  const position = pointOnPath(leg.path, progress);
  const before = pointOnPath(leg.path, Math.max(0, progress - 0.001));
  const after = pointOnPath(leg.path, Math.min(1, progress + 0.001));
  const delta = after.map((v,i) => v - before[i]);
  const tangent = normalize(delta.map((v,i) => v - dot(delta, position)*position[i]));
  return {leg,index,progress,position,tangent,lat:Math.asin(position[1]),lon:Math.atan2(position[0],position[2])};
}

// Hand-shaped continental silhouettes and exaggerated relief for a miniature globe.
const LAND = [
  {center:[4,19],coast:[[37,-17],[37,10],[32,32],[15,43],[12,50],[1,43],[-12,40],[-35,20],[-34,17],[-23,12],[-10,10],[4,9],[5,-10],[15,-17],[25,-15]]},
  {center:[46,78],coast:[[36,-10],[44,-9],[58,-5],[71,20],[69,60],[72,120],[63,170],[51,160],[40,142],[35,128],[21,119],[8,107],[1,104],[6,96],[21,90],[8,77],[23,67],[28,52],[39,44],[35,35],[41,28],[39,22],[44,13],[36,12]]},
  {center:[47,-108],coast:[[72,-168],[72,-128],[82,-80],[60,-53],[48,-66],[30,-80],[24,-81],[17,-88],[8,-80],[8,-85],[20,-104],[30,-117],[50,-128],[60,-151]]},
  {center:[-19,-59],coast:[[12,-73],[10,-60],[5,-52],[-3,-35],[-19,-39],[-34,-53],[-53,-68],[-54,-73],[-40,-74],[-20,-72],[-4,-80],[6,-77]]},
  {center:[72,-42],coast:[[60,-44],[64,-52],[75,-66],[83,-42],[80,-19],[69,-22]],ice:true},
  {center:[-25,134],coast:[[-11,130],[-12,141],[-20,149],[-35,153],[-39,144],[-33,115],[-22,113],[-14,124]]},
  {center:[-4,120],coast:[[2,110],[5,116],[0,120],[-4,116],[-5,112]]},
  {center:[-5,145],coast:[[-2,132],[-3,147],[-9,151],[-9,141]]},
  {center:[-41,173],coast:[[-35,173],[-41,177],[-47,168],[-44,167]]},
  {center:[-21,47],coast:[[-12,49],[-19,50],[-26,45],[-22,43]]}
];

function palette(p, ice = false) {
  const lat = Math.asin(p[1])/RAD, lon = Math.atan2(p[0],p[2])/RAD;
  if (ice || Math.abs(lat) > 70) return {color:'#e7eee5',kind:'snow'};
  if ((lat>13 && lat<34 && lon>-19 && lon<39) || (lat>-31 && lat<-16 && lon>115 && lon<141) || (lat>31 && lat<47 && lon>50 && lon<104)) return {color:'#d1ad68',kind:'desert'};
  if (lat>-12 && lat<6 && lon>-77 && lon<-47) return {color:'#44775c',kind:'forest'};
  if (lat>-8 && lat<14 && lon>8 && lon<36) return {color:'#56856b',kind:'forest'};
  if (lat>7 && lat<30 && lon>95 && lon<124) return {color:'#638d62',kind:'forest'};
  return {color:lat>50?'#9ba77c':'#83a978',kind:'ground'};
}

export function makeWorld() {
  const faces = [], rivers = [], roads = [], features = [];
  const face = (points,color,kind,layer='terrain') => faces.push({points,color,kind,layer});
  const relief = p => 1.004 + 0.0035*(1+Math.sin(p[0]*19+p[1]*13)*Math.cos(p[2]*23-p[1]*5));
  function patch(a,b,c,depth,ice) {
    if (depth) {
      const ab=normalize(add(a,b)),bc=normalize(add(b,c)),ca=normalize(add(c,a));
      patch(a,ab,ca,depth-1,ice);patch(ab,b,bc,depth-1,ice);patch(ca,bc,c,depth-1,ice);patch(ab,bc,ca,depth-1,ice);
    } else {
      const center=normalize(add(add(a,b),c)), paint=palette(center,ice);
      face([a,b,c].map(p=>scale(p,relief(p))),paint.color,paint.kind,'surface');
    }
  }
  for (const land of LAND) {
    const center=earthPoint(...land.center), coast=land.coast.map(p=>earthPoint(...p));
    for (let i=0;i<coast.length;i++) patch(center,coast[i],coast[(i+1)%coast.length],2,land.ice);
  }
  const ice=Array.from({length:40},(_,i)=>earthPoint(-77-2*Math.sin(i*1.6),i*9));
  for(let i=0;i<ice.length;i++)patch(earthPoint(-90,0),ice[i],ice[(i+1)%ice.length],1,true);

  function frame(lat,lon) {
    const normal=earthPoint(lat,lon),east=[Math.cos(lon*RAD),0,-Math.sin(lon*RAD)],north=normalize(cross(normal,east));
    return (x,y,z)=>normal.map((v,k)=>v*(1.012+y)+east[k]*x+north[k]*z);
  }
  function mountain(lat,lon,height,size,snow=true) {
    const p=frame(lat,lon),top=p(0,height,0),ring=Array.from({length:6},(_,i)=>p(Math.cos(i*Math.PI/3)*size,0,Math.sin(i*Math.PI/3)*size));
    for(let i=0;i<6;i++) {
      const a=ring[i],b=ring[(i+1)%6];
      face([a,b,top],i%2?'#8b9688':'#a9ad98',snow?'rock':'desert');
      if(snow)face([a.map((v,k)=>v*.43+top[k]*.57),b.map((v,k)=>v*.43+top[k]*.57),top],'#f4f3e9','snow');
    }
  }
  const ridges=[
    {name:'Himalayas',start:[29,74],end:[30,101],count:29},
    {name:'Alps',start:[46,5],end:[47,16],count:14},
    {name:'Andes',start:[3,-77],end:[-43,-73],count:34},
    {name:'Rockies',start:[61,-130],end:[28,-105],count:25},
    {name:'East African highlands',start:[9,38],end:[-10,34],count:12}
  ];
  for(const ridge of ridges) {
    for(let i=0;i<ridge.count;i++) {
      const t=i/(ridge.count-1),lat=ridge.start[0]*(1-t)+ridge.end[0]*t+Math.sin(i*2.9)*1.1,lon=ridge.start[1]*(1-t)+ridge.end[1]*t+Math.cos(i*1.8)*1.15;
      mountain(lat,lon,.045+.044*(.5+.5*Math.sin(i*2.1)),.014+.008*(.5+.5*Math.cos(i*3.1)),ridge.name!=='East African highlands');
    }
    features.push({name:ridge.name,point:earthPoint((ridge.start[0]+ridge.end[0])/2,(ridge.start[1]+ridge.end[1])/2)});
  }
  for(let i=0;i<44;i++) {
    const lat=17+(i%6)*2.5+Math.sin(i*2.7),lon=-9+Math.floor(i/6)*4;
    const p=frame(lat,lon),s=.016,h=.008+(i%3)*.003;
    face([p(-s,0,-s*.4),p(s,0,-s*.4),p(s*.5,h,s*.15)],'#e4c585','desert');
    face([p(-s,0,-s*.4),p(s*.5,h,s*.15),p(-s*.7,0,s*.8)],'#bca066','desert');
  }
  function tree(lat,lon,seed) {
    const p=frame(lat,lon),s=.0065+(seed%3)*.0015,h=.021+(seed%4)*.004;
    const colors=['#244e40','#31654a','#417756','#638c59'];
    for(let i=0;i<4;i++) {
      const a=i*Math.PI/2,b=(i+1)*Math.PI/2;
      face([p(Math.cos(a)*s,.004,Math.sin(a)*s),p(Math.cos(b)*s,.004,Math.sin(b)*s),p(0,h,0)],colors[(seed+i)%colors.length],'forest');
    }
  }
  const forests=[[-4,-62,12,23,105],[2,24,13,17,65],[20,108,13,18,70],[53,-115,9,22,45],[58,90,9,28,55]];
  for(const [lat,lon,dy,dx,count] of forests) for(let i=0;i<count;i++) {
    const a=(Math.sin(i*127.1+lat)*43758.5453)%1,b=(Math.sin(i*311.7+lon)*19341.773)%1;
    tree(lat+(Math.abs(a)-.5)*dy,lon+(Math.abs(b)-.5)*dx,i);
  }
  const river=(name,path,width=1)=>rivers.push({name,points:path.flatMap((p,i)=>i?greatCircle(earthPoint(...path[i-1]),earthPoint(...p),12).slice(1):[earthPoint(...p)]).map(p=>scale(p,1.016)),width});
  river('Amazon',TOUR[5].path,2.4);
  river('Rio Negro',[[-3,-60],[0,-64],[1,-69]],1.1);
  river('Madeira',[[-2,-54],[-7,-62],[-12,-64]],1.4);
  river('Tapajos',[[-2,-54],[-6,-56],[-11,-58]],1);
  river('Nile',[[30,31],[24,33],[15,33],[9,31],[2,31]],1.2);
  river('Congo',[[-5,13],[-3,18],[0,21],[1,25],[-4,28]],1.25);
  river('Yangtze',[[31,121],[30,115],[29,109],[28,102]],1);
  for(const leg of TOUR) if(leg.terrain==='road'||leg.terrain==='rail') {
    const count=Math.max(24,Math.round(prepared[TOUR.indexOf(leg)].total*85));
    const points=Array.from({length:count},(_,i)=>pointOnPath(leg.path,i/(count-1)));
    roads.push({kind:leg.terrain,points:points.map(p=>scale(p,1.018))});
  }
  features.push({name:'Sahara',point:earthPoint(24,12)},{name:'Amazon rainforest',point:earthPoint(-4,-61)});
  return {faces,rivers,roads,features};
}
