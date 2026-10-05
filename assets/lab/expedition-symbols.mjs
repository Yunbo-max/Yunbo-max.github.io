import {HAZARDS} from './research-expeditions.mjs?v=20261005-fleet3';

// Vector symbols stay crisp at large sizes, including on platforms without emoji fonts.
export function drawHazard(ctx,type,x,y,size=30,time=0){
 const item=HAZARDS[type];if(!item)return;
 ctx.save();ctx.translate(x,y);ctx.scale(size/40,size/40);ctx.lineCap='round';ctx.lineJoin='round';
 ctx.fillStyle='#102737f0';ctx.strokeStyle=item.color;ctx.lineWidth=1.5;
 ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.lineWidth=2.3;
 const line=p=>{ctx.beginPath();p.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.stroke();};
 const cloud=()=>{ctx.fillStyle='#b8c9d4';ctx.beginPath();ctx.moveTo(-14,2);ctx.bezierCurveTo(-21,-10,-7,-16,-2,-10);ctx.bezierCurveTo(3,-23,18,-14,13,-5);ctx.bezierCurveTo(26,-4,20,7,12,6);ctx.lineTo(-10,6);ctx.closePath();ctx.fill();};
 if(type==='lightning'){
   cloud();ctx.fillStyle='#ffd36b';ctx.strokeStyle='#ffe8a3';ctx.beginPath();ctx.moveTo(1,-1);ctx.lineTo(-8,12);ctx.lineTo(0,10);ctx.lineTo(-3,22);ctx.lineTo(11,5);ctx.lineTo(3,6);ctx.closePath();ctx.fill();ctx.stroke();
 }else if(type==='storm'){
   cloud();ctx.strokeStyle='#c5cdf7';for(let i=0;i<3;i++){const yy=9+(time*6+i*3)%9;line([[-10+i*9,yy],[-13+i*9,yy+5]]);}
   ctx.strokeStyle='#8299ce';line([[-17,-4],[-10,-8],[-5,-5]]);
 }else if(type==='snow'){
   ctx.rotate(Math.sin(time*.4)*.07);ctx.strokeStyle='#d6f4ff';
   for(let i=0;i<6;i++){ctx.save();ctx.rotate(i*Math.PI/3);line([[0,0],[0,-16]]);line([[-5,-10],[0,-5],[5,-10]]);ctx.restore();}
 }else if(type==='quake'){
   ctx.fillStyle='#be925b';ctx.beginPath();ctx.moveTo(-18,1);ctx.lineTo(-9,-5);ctx.lineTo(2,-1);ctx.lineTo(15,-5);ctx.lineTo(18,15);ctx.lineTo(-18,15);ctx.closePath();ctx.fill();
   ctx.strokeStyle='#ffe4b7';line([[0,-5],[-4,2],[4,5],[-2,12],[3,18]]);ctx.strokeStyle='#e3b077';line([[-16,-12],[-9,-15],[-3,-11],[5,-15],[14,-10]]);
 }else{
   ctx.fillStyle='#57becb';ctx.strokeStyle='#b4f0ef';ctx.beginPath();ctx.moveTo(-19,14);ctx.bezierCurveTo(-8,15,-10,-14,7,-15);ctx.bezierCurveTo(22,-16,21,0,7,0);ctx.bezierCurveTo(16,-9,5,-8,3,2);ctx.bezierCurveTo(0,15,12,14,19,14);ctx.lineTo(19,19);ctx.lineTo(-19,19);ctx.closePath();ctx.fill();ctx.stroke();
 }
 ctx.restore();
}

export function drawHarbor(ctx,x,y,color,label){
 ctx.save();ctx.translate(x,y);ctx.strokeStyle='#eaf1df';ctx.lineWidth=2;ctx.lineCap='round';
 ctx.beginPath();ctx.moveTo(0,7);ctx.lineTo(0,-37);ctx.stroke();ctx.fillStyle=color;
 ctx.beginPath();ctx.moveTo(1,-36);ctx.lineTo(33,-31);ctx.lineTo(22,-18);ctx.lineTo(1,-22);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle='#123341';ctx.beginPath();ctx.ellipse(0,10,9,4,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.font='600 10px system-ui,sans-serif';const width=ctx.measureText(label).width+16;
 ctx.fillStyle='#0c2539e8';ctx.fillRect(-width/2,22,width,20);ctx.fillStyle='#f3edce';ctx.textAlign='center';ctx.fillText(label,0,36);ctx.restore();
}
