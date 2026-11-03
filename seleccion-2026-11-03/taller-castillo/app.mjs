import{compute,advance}from'./sim-core.mjs';
const c=JSON.parse(document.getElementById('page-data').textContent),key='proposal-selection:'+c.slug;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function getPicks(){try{let p=JSON.parse(sessionStorage.getItem(key)||'[]');return Array.isArray(p)?p.filter(i=>Number.isInteger(i)&&i>=0&&i<c.products.length):[]}catch{return[]}}
if(document.body.dataset.page==='web'){
 const picks=new Set(getPicks());function render(){for(const b of $$('[data-pick]')){let on=picks.has(Number(b.dataset.pick));b.setAttribute('aria-pressed',on);b.textContent=on?'En mi selección ✓':'Añadir a mi selección';}$('#selected-count').textContent=picks.size?`${picks.size} referencias en tu selección local`:'Selecciona referencias para preparar tu consulta';}
 for(const b of $$('[data-pick]'))b.addEventListener('click',()=>{const i=Number(b.dataset.pick);picks.has(i)?picks.delete(i):picks.add(i);try{sessionStorage.setItem(key,JSON.stringify([...picks]))}catch{}render()});render();
}
if(document.body.dataset.page==='automation'){
 const form=$('#sim-form');let result=null,stage=0;const stages=['Borrador local','Revisado en esta muestra','Listo para conversar · no enviado'];
 const esc=s=>String(s).replace(/[&<>"']/g,t=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[t]));
 const picks=getPicks();if(picks.length)$$('[data-qty]').forEach((e,i)=>e.value=picks.includes(i)?1:0);
 function read(){let x=Object.fromEntries(new FormData(form));x.plate=$('#plate')?.checked||false;x.rows=c.products.map((p,i)=>({name:p.name,qty:$(`[name=qty${i}]`)?.value??0,weight:$(`[name=weight${i}]`)?.value??0,grind:$(`[name=grind${i}]`)?.value??'',size:$(`[name=size${i}]`)?.value??''}));return x;}
 function draw(){
  try{result=compute(c.mode,read());$('#error').textContent='';$('#result-title').textContent=result.title;$('#result-detail').textContent=result.detail;
   const data=result.rows?result.rows.filter(r=>r.qty>0).map(r=>[r.name+(r.grind?' · '+r.grind:'')+(r.size?' · '+r.size:''),r.qty+' '+c.unit+(c.mode==='roast'?' · '+r.grams+' g':'')]):c.mode==='pack'||c.mode==='labels'?[['Necesidad sin reserva',result.base],['Necesidad con reserva',result.required],['Unidades del lote previsto',result.units],['Sobrante después del plan',result.left]]:c.mode==='reorder'?[['Días hasta revisar',result.days],['Presentaciones propuestas',result.packs],['Fecha de revisión',result.date]]:c.mode==='space'?[['Área del ambiente',result.area.toFixed(2)+' m²'],['Huella del mobiliario',result.occupied.toFixed(2)+' m²'],['Ocupación de superficie',result.ratio.toFixed(1)+' %']]:c.mode==='engrave'?[['Caracteres',result.chars],['Piezas',result.qty]]:[['Modelo',result.model||'Por completar'],['Campos pendientes',result.missing.length]];
   $('#result-table').innerHTML=data.map(([a,b])=>`<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('');
   if(c.mode==='engrave')$('#live-preview').textContent=result.text;
   if(c.mode==='labels')$('#live-preview').textContent=$('#labelText').value||'Ejemplo de etiqueta';
   if(c.mode==='space'){
    const x=read(),W=+x.width,L=+x.length,pl=+x.pieceL,pw=+x.pieceW;const scale=Math.min(400/W,180/L);const r=$('#room-rect'),p=$('#piece-rect');r.setAttribute('width',W*scale);r.setAttribute('height',L*scale);p.setAttribute('width',Math.min(pw*scale,440));p.setAttribute('height',Math.min(pl*scale,200));
   }
   $('#export').disabled=false;
  }catch(e){result=null;$('#error').textContent=e.message;$('#result-title').textContent='Revisa los datos';$('#result-detail').textContent='No se genera un plan con campos vacíos o cantidades inválidas.';$('#result-table').replaceChildren();$('#export').disabled=true;}
  $('#stage').textContent=stages[stage];$('#advance').disabled=!result||stage===2||(c.mode==='service'&&result.missing.length>0)||!$$('[data-check]').every(x=>x.checked);
 }
 function revise(){stage=0;$$('[data-check]').forEach(e=>e.checked=false);draw()}form.addEventListener('input',revise);form.addEventListener('change',revise);$$('[data-check]').forEach(e=>e.addEventListener('change',()=>{stage=0;draw()}));
 $('#advance').addEventListener('click',()=>{try{stage=advance(stage,$$('[data-check]').every(x=>x.checked));draw();$('#stage').focus()}catch(e){$('#error').textContent=e.message}});
 $('#reset').addEventListener('click',()=>{form.reset();$$('[data-check]').forEach(x=>x.checked=false);stage=0;draw()});
 $('#export').addEventListener('click',()=>{if(!result)return;const payload={company:c.company,kind:'Simulación local · no enviada',createdAt:new Date().toISOString(),stage:stages[stage],inputs:read(),result,boundaries:c.limits};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=c.slug+'-plan-local.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)});draw();
}
