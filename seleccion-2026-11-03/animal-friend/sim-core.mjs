export function number(v,name,{min=0,max=10000000,integer=false}={}){if(v===null||v===undefined||String(v).trim()==='')throw Error(`Completa ${name}.`);const n=Number(v);if(!Number.isFinite(n)||n<min||n>max||(integer&&!Number.isInteger(n)))throw Error(`${name}: introduce ${integer?'un entero':'un número'} entre ${min} y ${max}.`);return n;}
export function compute(mode,x){
 const n=(key,min=0,max=10000000,integer=false)=>number(x[key],key,{min,max,integer});
 if(mode==='kit'||mode==='dogkit'||mode==='assortment'||mode==='roast'){
  const sets=(mode==='kit'||mode==='dogkit')?n('sets',1,10000,true):1;
  const rows=x.rows.map((r,i)=>{const qty=number(r.qty,'cantidad '+(i+1),{integer:true,max:10000});const weight=mode==='roast'?number(r.weight,'gramos por bolsa',{min:1,max:10000}):0;return {...r,qty:qty*(mode==='dogkit'&&i===0?1:sets),grams:qty*weight};});
  const total=rows.reduce((a,r)=>a+r.qty,0);if(!total)throw Error('Selecciona al menos una unidad.');
  const grams=rows.reduce((a,r)=>a+r.grams,0);return {rows,total,grams,sets,title:mode==='roast'?`${(grams/1000).toLocaleString('es',{maximumFractionDigits:3})} kg por preparar`:`${total} ${mode==='assortment'?'unidades':'piezas'} en la lista`,detail:mode==='dogkit'?`${sets} perros · capas y pecheras por perro; protectores de asiento por vehículo.`:mode==='roast'?`${total} bolsas agrupadas por referencia y molienda. No es orden de tueste.`:`${rows.filter(r=>r.qty>0).length} referencias con cantidades definidas.`,metric:total};
 }
 if(mode==='pack'||mode==='labels'){
  const demand=n('demand',1,10000000,true),per=mode==='labels'?n('per',1,1000,true):1,spare=n('spare',0,100),stock=n('stock',0,10000000,true),pack=n('pack',1,1000000,true);
  const base=demand*per,required=Math.ceil(base*(1+spare/100)),need=Math.max(0,required-stock),packs=Math.ceil(need/pack),units=packs*pack,left=stock+units-required;
  return {base,required,need,packs,units,left,title:`${packs} ${mode==='labels'?(packs===1?'rollo':'rollos'):(packs===1?'lote':'lotes')} por revisar`,detail:`${required.toLocaleString('es')} unidades previstas · ${stock.toLocaleString('es')} existentes · ${left.toLocaleString('es')} sobrantes después de cubrir el plan.`,metric:packs};
 }
 if(mode==='space'){
  const length=n('length',1,100000),width=n('width',1,100000),pieceL=n('pieceL',1,10000),pieceW=n('pieceW',1,10000),count=n('count',1,1000,true),gap=n('gap',0,500);
  const capacity=Math.max(Math.floor(length/(pieceL+gap))*Math.floor(width/(pieceW+gap)),Math.floor(length/(pieceW+gap))*Math.floor(width/(pieceL+gap)));
  const area=length*width/10000,occupied=pieceL*pieceW*count/10000,ratio=occupied/area*100;
  return {capacity,area,occupied,ratio,count,title:`${occupied.toFixed(2)} m² de huella`,detail:`Ambiente: ${area.toFixed(2)} m². Retícula simplificada: hasta ${capacity} piezas con el margen introducido. ${count<=capacity?'Coincide con esa retícula.':'Requiere revisar la distribución.'} No contempla puertas, instalaciones ni diseño de circulación.`,metric:Math.min(100,ratio)};
 }
 if(mode==='reorder'){
  const stock=n('stock'),daily=n('daily',0.001,100000),lead=n('lead',0,365,true),buffer=n('buffer',0,365,true),target=n('target',1,365,true),pack=n('pack',0.001,100000);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(x.date)||isNaN(Date.parse(x.date+'T12:00:00Z'))||new Date(x.date+'T12:00:00Z').toISOString().slice(0,10)!==x.date)throw Error('Selecciona una fecha válida.');
  const coverage=stock/daily,days=Math.max(0,Math.floor(coverage-lead-buffer)),need=Math.max(0,(target+lead+buffer)*daily-stock),packs=Math.ceil(need/pack);let d=new Date(x.date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);
  return {coverage,days,packs,date:d.toISOString().slice(0,10),title:`${coverage.toFixed(1)} días de cobertura`,detail:`Revisión sugerida: ${d.toISOString().slice(0,10)}. Para cubrir ${target} días más plazo y reserva: ${packs} presentaciones según tus supuestos. No programa mensajes.`,metric:coverage};
 }
 if(mode==='engrave'){
  const text=String(x.text||'').trim();if(!text)throw Error('Escribe el texto que deseas revisar.');if([...text].length>200)throw Error('La muestra admite hasta 200 caracteres para revisar; el límite real depende de la pieza.');
  const qty=n('qty',1,10000,true),chars=[...text].length;return {text,qty,chars,title:`${chars} caracteres por revisar`,detail:`${qty} piezas · ${String(x.lines||'Una línea')}. La tipografía y el área útil deben aprobarse con Rose; esta vista no es un arte de producción.`,metric:chars};
 }
 if(mode==='service'){
  const model=String(x.model||'').trim(),symptom=String(x.symptom||'').trim();const missing=[!model&&'modelo exacto',symptom.length<10&&'síntoma con al menos 10 caracteres',!x.plate&&'confirmar si hay foto de la placa'].filter(Boolean);
  return {model,symptom,missing,title:missing.length?'Solicitud incompleta':'Lista para revisión técnica',detail:missing.length?'Falta: '+missing.join(', ')+'.':`Uso declarado: ${x.urgency}. Recibir y revisar; no hay diagnóstico, cita ni presupuesto confirmado.`,metric:3-missing.length};
 }
 throw Error('Modo no soportado');
}
export function advance(stage,checked,changed=false){if(changed)return 0;if(!checked)throw Error('Completa las comprobaciones antes de avanzar.');return Math.min(2,stage+1);}
