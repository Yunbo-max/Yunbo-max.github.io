const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]));
const rect=(x,y,width,height,fill,extra='')=>`<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" ${extra}/>`;

export function cityScene(data,city){
  const parts=[`<defs><filter id="city-vehicle-shadow" x="-100%" y="-100%" width="300%" height="300%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#215f9e" flood-opacity=".25"/></filter></defs>
  <style>
  .city-map{background:#f0f2ee;font-family:Arial,sans-serif}
  .city-map .navigation-edge{fill:none;stroke:#67acee;stroke-width:5;opacity:0;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}
  .city-map .navigation-edge.on-route{opacity:.38}
  .city-map .navigation-edge.traveled{stroke:#0876e5;opacity:.9}
  .city-map .navigation-edge.current-handoff{stroke:#0876e5;stroke-width:5;stroke-dasharray:8 5;opacity:1}
  .city-map .navigation-task-point{fill:#fff;stroke:#708b9d;stroke-width:1.8}
  .city-map .navigation-task-label{font-size:13px;fill:#425a6d;paint-order:stroke;stroke:#ffffffed;stroke-width:4px;stroke-linejoin:round;font-weight:550}
  .city-map .navigation-task.current .navigation-task-label{fill:#0876e5;font-weight:700}
  .city-map .navigation-task.visited .navigation-task-point{fill:#0876e5;stroke:#fff}
  .city-map .navigation-task.outside-route{opacity:.65}
  .city-map .navigation-location-ring{fill:#0876e520;stroke:#fff;stroke-width:1.5}
  .city-map .navigation-location-core{fill:#0876e5;stroke:#fff;stroke-width:2.5;stroke-linejoin:round;filter:url(#city-vehicle-shadow)}
  .city-map .city-district-label{font-size:12.5px;letter-spacing:.6px;font-weight:600;fill:#617774;paint-order:stroke;stroke:#ffffffd9;stroke-width:3px;stroke-linejoin:round}
  .city-map .city-street-label{font-size:9.5px;letter-spacing:.35px;fill:#8794a0;paint-order:stroke;stroke:#fff;stroke-width:2px;stroke-linejoin:round}
  </style><g data-layer="city-land">${rect(0,0,1120,710,'#f0f2ee')}`];
  for(const region of data.regions){
    const x=city.xs[region.col*2],y=city.ys[region.row*2];
    parts.push(rect(x+8,y+8,244,138,esc(region.color),'opacity=".38"'));
  }
  parts.push('<path d="M1091 -20 C1060 95 1134 195 1089 289 S1063 464 1098 538 S1078 669 1091 740 L1160 740 L1160 -20 Z" fill="#c1deec"/><path d="M1100 -20 C1071 94 1143 195 1098 289 S1072 464 1107 538 S1087 669 1100 740" fill="none" stroke="#e1eff5" stroke-width="3"/>');
  for(let row=0;row<8;row++)for(let col=0;col<8;col++){
    const x=city.xs[col]+16,y=city.ys[row]+15;
    const region=data.regions.find(r=>r.col===Math.floor(col/2)&&r.row===Math.floor(row/2));
    if(col===7)continue;
    const park=(col<2&&row>5)||(col===4&&row===1)||(col===2&&row===4);
    if(park){
      parts.push(rect(x,y,98,46,'#d4e7ca','rx="9"'),`<path d="M${x+8} ${y+37} Q${x+50} ${y+8} ${x+91} ${y+36}" stroke="#f9f6e9" stroke-width="4" fill="none"/>`);
      if(col===1&&row===6)parts.push(`<ellipse cx="${x+44}" cy="${y+25}" rx="24" ry="12" fill="#b7dce9"/>`);
      for(let i=0;i<6;i++){
        const tx=x+11+(i%3)*31,ty=y+10+Math.floor(i/3)*27;
        parts.push(`<circle cx="${tx+1}" cy="${ty+2}" r="6" fill="#adc4a0"/><circle cx="${tx}" cy="${ty}" r="5.3" fill="${i%2?'#92b889':'#a1c393'}"/>`);
      }
    }else{
      const color=region?.id==='H'?'#e0cfd5':region?.id==='M'?'#d0dce2':region?.id==='W'?'#dfd3d7':'#d7dbd5';
      const buildings=[[0,4,39,22],[47,4,25,30],[79,5,20,42],[0,33,39,15],[47,40,25,9]];
      for(const [dx,dy,w,h] of buildings){
        parts.push(rect(x+dx+1.5,y+dy+2,w,h,'#b7c2bc','rx="2" opacity=".25"'),rect(x+dx,y+dy,w,h,color,'rx="2" stroke="#b8c3bd" stroke-width=".55"'));
      }
    }
  }
  parts.push('</g><g data-layer="city-streets">');
  for(const road of city.roads){
    const d=`M${road.a.x} ${road.a.y} L${road.b.x} ${road.b.y}`;
    parts.push(`<path d="${d}" fill="none" stroke="#d2d9d3" stroke-width="${road.major?22:14}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff" stroke-width="${road.major?19:11}" stroke-linecap="round"/>`);
  }
  for(let row=0;row<9;row+=2)for(let col=0;col<9;col+=2){
    const x=city.xs[col],y=city.ys[row];
    for(let i=-1;i<=1;i++){
      parts.push(rect(x+16,y+i*4-1,6,2,'#d9dfdc'),rect(x-22,y+i*4-1,6,2,'#d9dfdc'),rect(x+i*4-1,y+16,2,6,'#d9dfdc'),rect(x+i*4-1,y-22,2,6,'#d9dfdc'));
    }
  }
  parts.push('</g><g data-layer="city-place-labels">');
  for(const region of data.regions){
    const x=city.xs[region.col*2]+18,y=city.ys[region.row*2]+34;
    parts.push(`<g data-region="${esc(region.id)}"><text x="${x}" y="${y}" class="city-district-label">${esc(region.id)} · ${esc(region.name.toUpperCase())}</text></g>`);
  }
  const hNames=['DISCOVERY AVE.','METHOD STREET','EVIDENCE AVE.','REVIEW STREET','COMMUNITY WAY'];
  for(let i=0;i<5;i++)parts.push(`<text x="564" y="${city.ys[i*2]+3}" text-anchor="middle" class="city-street-label">${hNames[i]}</text>`);
  const vNames=['RECOVERY RD.','RESOURCE AVE.','RESEARCH BLVD.','PUBLICATION WAY'];
  for(let i=0;i<4;i++)parts.push(`<text transform="translate(${city.xs[i*2]+3} 210) rotate(-90)" text-anchor="middle" class="city-street-label">${vNames[i]}</text>`);
  parts.push(`<text x="168" y="646" font-size="10" fill="#73926c" letter-spacing="1">EXPLORATION PARK</text><g transform="translate(1089 27)"><circle r="17" fill="#fff" stroke="#d8e4eb"/><path d="M0 -11 L5 8 L0 4 L-5 8Z" fill="#546f85"/><text y="-22" text-anchor="middle" font-size="9" fill="#6f8193">N</text></g><text x="26" y="699" font-size="10" fill="#7e918d" letter-spacing="1">RESEARCH CITY · ILLUSTRATIVE MAP</text><path d="M950 693 H1020 M950 689 V697 M1020 689 V697" stroke="#7b9296" stroke-width="1.5" fill="none"/><text x="985" y="683" text-anchor="middle" font-size="9" fill="#7b9296">1 city block</text></g>`);
  return parts.join('');
}

export function cityTasks(data,city){
  return data.nodes.map(task=>{
    const p=city.positions.get(task.id),left=p.x<80;
    return `<g class="navigation-task" data-task="${esc(task.id)}" role="button" tabindex="0" aria-label="Explore ${esc(task.label)}"><rect x="${p.x-36}" y="${p.y-18}" width="${left?99:98}" height="54" rx="8" fill="transparent"/><circle cx="${p.x}" cy="${p.y}" r="5.5" class="navigation-task-point"/><text x="${left?p.x+6:p.x}" y="${p.y+27}" text-anchor="${left?'start':'middle'}" class="navigation-task-label">${esc(task.label)}</text></g>`;
  }).join('');
}

export function demoRoadClosures(state,city){
  if(state.scenario.id!=='pilot-repair'||state.index<3||state.index>=6)return [];
  const original=city.route('interpret','debug');
  return [original.roads[1]||original.roads[0]];
}

export function vehicleSvg(pose){
  return `<g class="navigation-location" aria-hidden="true" transform="translate(${pose.x} ${pose.y}) rotate(${pose.heading+90})"><circle r="18" class="navigation-location-ring"/><path d="M0 -15 L11 12 L0 7 L-11 12Z" class="navigation-location-core"/></g>`;
}
