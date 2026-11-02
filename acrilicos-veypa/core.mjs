export function planCut({sheetW,sheetH,gap=0,rotate=true,parts}){
 const values=[sheetW,sheetH,gap];if(values.some(v=>!Number.isFinite(v))||sheetW<=0||sheetH<=0||gap<0)throw Error('Revisa las dimensiones de la lámina y la separación.');
 if(sheetW>10000||sheetH>10000||gap>100)throw Error('Usa una lámina de hasta 10.000 mm por lado y separación de hasta 100 mm.');
 if(!Array.isArray(parts)||!parts.length)throw Error('Añade al menos una pieza.');
 let expanded=[];for(let i=0;i<parts.length;i++){const p=parts[i];if(!Number.isFinite(p.w)||!Number.isFinite(p.h)||p.w<=0||p.h<=0||!Number.isInteger(p.qty)||p.qty<1)throw Error(`Revisa ancho, alto y cantidad de la pieza ${i+1}.`);if(p.qty>80)throw Error('Esta herramienta admite hasta 80 piezas por proyecto.');for(let j=0;j<p.qty;j++)expanded.push({...p,id:i+1,item:j+1});}
 if(expanded.length>80)throw Error('Esta herramienta admite hasta 80 piezas por proyecto.');
 if(expanded.some(p=>!((p.w<=sheetW&&p.h<=sheetH)||(rotate&&p.h<=sheetW&&p.w<=sheetH))))throw Error('Una pieza no cabe en el formato elegido. Revisa las medidas o permite girar.');
 function arrange(order,mode){
  const sheets=[];
  for(const p of order){let best=null;
   const seek=(s,si)=>s.free.forEach((f,fi)=>{const variants=rotate&&p.w!==p.h?[[p.w,p.h,false],[p.h,p.w,true]]:[[p.w,p.h,false]];for(const [w,h,turned]of variants){const W=w+gap,H=h+gap;if(W<=f.w+1e-7&&H<=f.h+1e-7){const dw=f.w-W,dh=f.h-H;const score=mode==='area'?f.w*f.h-W*H:Math.min(dw,dh)*100000+Math.max(dw,dh);if(!best||score<best.score)best={si,fi,w,h,W,H,turned,score};}}});
   sheets.forEach(seek);if(!best){sheets.push({free:[{x:0,y:0,w:sheetW+gap,h:sheetH+gap}],placed:[]});seek(sheets.at(-1),sheets.length-1);}
   const s=sheets[best.si],f=s.free[best.fi],used={x:f.x,y:f.y,w:best.W,h:best.H};s.placed.push({...p,x:f.x,y:f.y,w:best.w,h:best.h,turned:best.turned});
   const next=[];for(const r of s.free){if(used.x>=r.x+r.w||used.x+used.w<=r.x||used.y>=r.y+r.h||used.y+used.h<=r.y){next.push(r);continue;}
    if(used.x>r.x)next.push({x:r.x,y:r.y,w:used.x-r.x,h:r.h});
    if(used.x+used.w<r.x+r.w)next.push({x:used.x+used.w,y:r.y,w:r.x+r.w-used.x-used.w,h:r.h});
    if(used.y>r.y)next.push({x:r.x,y:r.y,w:r.w,h:used.y-r.y});
    if(used.y+used.h<r.y+r.h)next.push({x:r.x,y:used.y+used.h,w:r.w,h:r.y+r.h-used.y-used.h});
   }
   s.free=next.filter((r,i)=>!next.some((v,j)=>i!==j&&v.x<=r.x&&v.y<=r.y&&v.x+v.w>=r.x+r.w-1e-7&&v.y+v.h>=r.y+r.h-1e-7&&(v.w*v.h>r.w*r.h+1e-7||j<i)));
  }
  return sheets;
 }
 const orders=[(a,b)=>b.w*b.h-a.w*a.h,(a,b)=>Math.max(b.w,b.h)-Math.max(a.w,a.h),(a,b)=>Math.min(b.w,b.h)-Math.min(a.w,a.h)];let sheets=null;
 for(const sort of orders)for(const mode of ['short','area']){const option=arrange([...expanded].sort(sort),mode);if(!sheets||option.length<sheets.length)sheets=option;}
 const area=expanded.reduce((a,p)=>a+p.w*p.h,0),stockArea=sheets.length*sheetW*sheetH;return {sheets,area,stockArea,utilization:area/stockArea*100,pieces:expanded.length,sheetW,sheetH,gap};
}
