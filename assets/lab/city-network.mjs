export function createCityNetwork(data) {
  const xs=Array.from({length:9},(_,i)=>42+i*130),ys=Array.from({length:9},(_,i)=>50+i*77);
  const junctions=[],roads=[],adjacency=new Map(),positions=new Map(),taskJunctions=new Map();
  const horizontal=['Discovery Avenue','Question Lane','Method Street','Pilot Lane','Evidence Avenue','Validation Lane','Review Street','Community Lane','Community Way'];
  const vertical=['Recovery Road','West Lane','Resource Avenue','Campus Lane','Research Boulevard','Library Lane','Publication Way','East Lane','Release Road'];
  const key=(x,y)=>`${x}:${y}`;
  for(let y=0;y<9;y++)for(let x=0;x<9;x++){
    const id=key(x,y);junctions.push({id,x:xs[x],y:ys[y]});adjacency.set(id,[]);
  }
  const byId=new Map(junctions.map(j=>[j.id,j]));
  function add(aId,bId,axis,index){
    const a=byId.get(aId),b=byId.get(bId),major=index%2===0,length=Math.hypot(b.x-a.x,b.y-a.y);
    const road={id:`${aId}>${bId}`,a,b,axis,major,length,name:(axis==='h'?horizontal:vertical)[index]};
    roads.push(road);
    adjacency.get(aId).push({to:bId,road,cost:length*(major?.85:1)});
    adjacency.get(bId).push({to:aId,road,cost:length*(major?.85:1)});
  }
  for(let y=0;y<9;y++)for(let x=0;x<9;x++){
    if(x<8)add(key(x,y),key(x+1,y),'h',y);
    if(y<8)add(key(x,y),key(x,y+1),'v',x);
  }
  for(const region of data.regions){
    const nodes=data.nodes.filter(n=>n.region===region.id);
    nodes.forEach((node,i)=>{
      const x=2*region.col+(nodes.length===1?1:i),y=2*region.row+1;
      const junction=byId.get(key(x,y));
      if(!junction)throw new Error('Task lies outside the city');
      positions.set(node.id,{x:junction.x,y:junction.y});taskJunctions.set(node.id,junction.id);
    });
  }
  function route(from,to,closed=[]){
    const start=taskJunctions.get(from),end=taskJunctions.get(to),blocked=new Set(closed);
    if(!start||!end)throw new Error('Unknown city task');
    const distance=new Map([[start,0]]),previous=new Map(),pending=new Set(byId.keys());
    while(pending.size){
      let nearest=null,cost=Infinity;
      for(const id of pending)if((distance.get(id)??Infinity)<cost){nearest=id;cost=distance.get(id);}
      if(nearest===null)break;
      pending.delete(nearest);if(nearest===end)break;
      for(const edge of adjacency.get(nearest)){
        if(blocked.has(edge.road.id)||!pending.has(edge.to))continue;
        const proposed=cost+edge.cost;
        if(proposed<(distance.get(edge.to)??Infinity)){distance.set(edge.to,proposed);previous.set(edge.to,{from:nearest,road:edge.road});}
      }
    }
    if(!distance.has(end))throw new Error('No connected road route');
    const points=[positions.get(to)],used=[];let cursor=end;
    while(cursor!==start){
      const step=previous.get(cursor);if(!step)throw new Error('No connected road route');
      used.unshift(step.road.id);cursor=step.from;const j=byId.get(cursor);points.unshift({x:j.x,y:j.y});
    }
    return {points,roads:used,length:used.reduce((total,id)=>total+roads.find(r=>r.id===id).length,0)};
  }
  return {xs,ys,junctions,roads,positions,route};
}

export function roadPose(points,distance){
  if(!points.length)throw new Error('Empty road path');
  let remaining=Math.max(0,distance);
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],length=Math.hypot(b.x-a.x,b.y-a.y);
    if(!length)continue;
    if(remaining<length||i===points.length-1){
      const fraction=Math.min(1,remaining/length);
      return {x:a.x+(b.x-a.x)*fraction,y:a.y+(b.y-a.y)*fraction,heading:Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI};
    }
    remaining-=length;
  }
  return {...points.at(-1),heading:0};
}

export const streetPath=points=>points.map((p,i)=>`${i?'L':'M'} ${p.x} ${p.y}`).join(' ');
