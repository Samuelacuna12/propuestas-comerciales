export const products = [
  { id:'49501-07010', name:'Hyundai i10 / Kia Morning', detail:'Homocinética exterior · 1.1 · ABS', photo:'kia.jpg', ext:24, int:20, seal:52.5, absTeeth:48, catalog:'Ficha publicada: i10 1.1 G4HG (2008–2011) y Morning/Picanto 1.1 G4HG (2004–2011). Requiere contrastar el vehículo y la pieza.', url:'https://www.repuestosahora.cl/homocinetica-hyundai-i10-kia-morning-11-abs-24x20' },
  { id:'44101-62J90', name:'Suzuki Swift', detail:'Homocinética exterior · 1.3 / 1.5 · ABS', photo:'suzuki.jpg', ext:25, int:29, seal:49, absTeeth:43, catalog:'Ficha publicada: Swift 1.3 / 1.5, años referenciales 2004–2011, según versión y configuración. Requiere contrastar el vehículo y la pieza.', url:'https://www.repuestosahora.cl/homocinetica-suzuki-swift-13-15-abs-25x29' }
];
export const fieldLabels={make:'Marca',model:'Modelo',year:'Año',engine:'Motor',version:'Versión / caja',side:'Lado solicitado',abs:'ABS del vehículo',qty:'Cantidad'};
const n=v=>Number(String(v).replace(',','.'));
export function inspect(data, product){
 const missing=Object.entries(fieldLabels).filter(([k])=>!String(data[k]??'').trim()).map(([,v])=>v);
 if(data.year && (!Number.isInteger(n(data.year)) || n(data.year)<1960 || n(data.year)>2030))missing.push('Año válido (1960–2030)');
 if(data.qty && (!Number.isInteger(n(data.qty)) || n(data.qty)<1 || n(data.qty)>20))missing.push('Cantidad entera de 1 a 20');
 if(!data.support)missing.push('Confirmar evidencia para la revisión');
 const comparisons=[['ext','Estrías exteriores',product.ext],['int','Estrías interiores',product.int],['seal','Retén (mm)',product.seal],['absTeeth','Dientes del anillo ABS',product.absTeeth]].map(([key,label,expected])=>({key,label,expected,provided:data[key]??'',state:!String(data[key]??'').trim()?'pending':!Number.isFinite(n(data[key]))||n(data[key])<=0?'invalid':Math.abs(n(data[key])-expected)>0.001?'different':'same'}));
 const warnings=comparisons.filter(c=>['different','invalid'].includes(c.state)).map(c=>c.state==='invalid'?`${c.label}: registra una medida positiva o deja pendiente.`:`${c.label}: informaste ${c.provided}; la ficha indica ${c.expected}. Revisar antes de cotizar.`);
 if(data.abs==='No')warnings.push('La referencia seleccionada está descrita con ABS. El asesor debe revisar la diferencia con lo informado.');
 const status=warnings.length?'Revisar diferencias':missing.length?'Faltan datos':'Pendiente de revisión humana';
 return {missing,warnings,comparisons,status,ready:missing.length===0&&warnings.length===0};
}
export function makeDossier(data,product,id,createdAt){
 const review=inspect(data,product);
 return {id,createdAt,demo:Boolean(data.demo),reference:product.id,product:product.name,source:product.url,vehicle:{...data},review,compatibility:'No validada',quote:'No emitida'};
}
export function dossierText(d){
 const v=d.vehicle;
 return [`SOLICITUD TÉCNICA · ${d.id}`,d.demo?'EJEMPLO FICTICIO PARA PROBAR EL SISTEMA':'Borrador local; no enviado',`Referencia candidata: ${d.reference} · ${d.product}`,`Vehículo: ${v.make||'Por confirmar'} ${v.model||''}`,`Año: ${v.year||'Por confirmar'} · Motor: ${v.engine||'Por confirmar'} · Versión/caja: ${v.version||'Por confirmar'}`,`Lado: ${v.side||'Por confirmar'} · ABS: ${v.abs||'Por confirmar'} · Cantidad: ${v.qty||'Por confirmar'}`,...d.review.comparisons.map(c=>`${c.label}: pieza informada ${c.provided||'por medir'} / ficha ${c.expected}`),`Evidencia para aportar al asesor: ${v.support?'Indicada por quien prepara la consulta':'Pendiente'}`,`Observación: ${v.note||'Sin observaciones'}`,`Estado: ${d.review.status}`,`Datos pendientes: ${d.review.missing.join('; ')||'Ninguno en la lista básica; el asesor puede pedir más.'}`,`Diferencias: ${d.review.warnings.join(' ')||'Ninguna detectada en los campos comparados.'}`,'Compatibilidad: NO VALIDADA. Coincidir en medidas no confirma aplicación.','Cotización, precio y stock: NO CONFIRMADOS.',`Ficha pública: ${d.source}`].join('\n');
}
