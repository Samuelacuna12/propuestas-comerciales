const stop = new Set('el la los las un una unos unas de del en y o que qué es son como cómo para por con me mi tu su se al a lo le les quiero saber sobre cual cuál cuales cuáles the a an and or of in on to is are what how can could would i you your my about please'.split(' '));
export const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const tokens = value => normalize(value).split(' ').filter(x => x.length > 2 && !stop.has(x));
const isQuestion = value => /[?¿]/.test(value) || /^(what|how|where|when|can|do you|are|is|que|como|donde|cuando|cuanto|tienen|venden|puedo|cual)\b/.test(normalize(value));
export function rankAnswers(config, input) {
 const query=normalize(input), queryTokens=tokens(input);
 return (config.faqs || []).map(faq=>{
  const full=normalize(faq.question), words=new Set(tokens(faq.question+' '+(faq.keywords||[]).join(' ')));
  const hits=queryTokens.filter(x=>words.has(x)||[...words].some(w=>w.length>4&&x.length>4&&(w.startsWith(x)||x.startsWith(w)))).length;
  const phrase=(faq.keywords||[]).some(k=>normalize(k).length>3&&query.includes(normalize(k)));
  return {faq,score:full===query?100:hits*3+hits/Math.max(1,queryTokens.length)*3+(phrase?4:0)};
 }).sort((a,b)=>b.score-a.score);
}
export class Conversation {
 constructor(config){this.config=config;this.en=config.language==='en';this.reset();}
 t(es,en){return this.en?en:es;}
 reset(){this.step=-1;this.answers={};this.complete=false;}
 welcome(){return this.t(`Hola. Esta es una demostración del asistente para ${this.config.company}. Puedo ayudarte a explorar el catálogo y preparar una solicitud de ejemplo. ¿Qué buscas?`,`Hello. This is an assistant demonstration for ${this.config.company}. I can help you explore the catalog and prepare a sample enquiry. What are you looking for?`);}
 current(){return this.config.workflow?.steps?.[this.step];}
 start(){this.reset();this.step=0;return {text:this.t('Preparemos tu solicitud. No se enviará ni confirmará un pedido.\n\n','Let’s prepare your enquiry. Nothing will be sent and no order will be confirmed.\n\n')+(this.current()?.question||this.welcome()),kind:'workflow'};}
 catalog(){const products=this.config.products||[];return {text:this.t('Estas son algunas referencias verificadas de su catálogo:','Here are verified items from their catalog:')+'\n\n'+products.map(p=>p.name+' — '+p.description+'\n'+p.url).join('\n\n'),kind:'catalog'};}
 summary(){return {company:this.config.company,status:this.t('Borrador local; no enviado ni confirmado','Local draft; not sent or confirmed'),workflow:this.config.workflow?.title,answers:{...this.answers}};}
 answer(raw){
  const input=String(raw||'').trim().slice(0,1000), q=normalize(input);
  if(!input)return {text:this.t('Escribe una pregunta o una respuesta.','Type a question or an answer.'),kind:'empty'};
  if(/^(reiniciar|reset|start over|empezar de nuevo|cancelar|cancel)$/.test(q)){this.reset();return {text:this.welcome(),kind:'reset'};}
  if(/^(atras|volver|back|anterior)$/.test(q)&&this.step>0){this.step--;this.complete=false;const s=this.current();delete this.answers[s.key];return {text:s.question,kind:'workflow'};}
  if(/^(catalogo|catalog|productos|products|ver productos|show products|see products)$/.test(q))return this.catalog();
  if(/^(hola|hello|hi|buenos dias|buenas|hey)$/.test(q))return {text:this.welcome(),kind:'greeting'};
  if(/^(asesor|humano|persona|human|agent|advisor)$/.test(q))return {text:this.t('Esta demo no transfiere conversaciones. Para atención real, utiliza el canal oficial de la empresa: ','This demo cannot transfer conversations. For real assistance, use the business’s official contact route: ')+this.config.website,kind:'handoff'};
  if(/\b(eres una ia|inteligencia artificial|are you ai|are you an ai|artificial intelligence)\b/.test(q))return {text:this.t('Esta demostración usa reglas y respuestas verificadas, no un modelo de IA conectado. La propuesta incluye definir y conectar la versión de IA con sus controles y fuentes.','This demonstration uses rules and verified answers, not a connected AI model. The proposal covers defining and connecting the AI version with its knowledge sources and controls.'),kind:'boundary'};
  if(/^(iniciar|empezar|solicitud|cotizar|quiero cotizar|preparar solicitud|start|begin|quote|enquiry|start enquiry|prepare enquiry)$/.test(q))return this.start();
  const ranked=rankAnswers(this.config,input), best=ranked[0];
  if(best?.score>=6&&(this.step<0||isQuestion(input))){return {text:best.faq.answer+(this.current()?this.t('\n\nPara continuar la solicitud: ','\n\nTo continue your enquiry: ')+this.current().question:''),kind:'faq'};}
  if(this.step>=0&&!this.complete){
   const s=this.current();
   if(!s){this.complete=true;return this.finish();}
   const skip=/^(no se|por confirmar|no lo se|pendiente|skip|not sure|unknown|no aplica|n a)$/.test(q);
   if(skip&&s.required)return {text:this.t('Ese dato hace falta para completar la solicitud. Puedes escribir una aproximación o «cancelar» para volver a las preguntas.\n\n','That detail is needed to complete the enquiry. Enter an estimate or type “cancel” to return to questions.\n\n')+s.question,kind:'validation'};
   if(/^(quantity|cantidad|unidades|qty)$/.test(normalize(s.key))&&!skip){
    const n=input.match(/-?\d+(?:[.,]\d+)?/); if(n&&Number(n[0].replace(',','.'))<=0)return {text:this.t('La cantidad debe ser mayor que cero. ','Quantity must be greater than zero. ')+s.question,kind:'validation'};
   }
   this.answers[s.key]={label:s.label,value:skip?this.t('Por confirmar','To confirm'):input};
   this.step++;
   if(this.step<(this.config.workflow?.steps?.length||0))return {text:this.current().question,kind:'workflow'};
   this.complete=true;return this.finish();
  }
  const products=(this.config.products||[]).filter(p=>tokens(p.name).some(w=>tokens(input).includes(w)));
  if(products.length)return {text:products.map(p=>p.name+'\n'+p.description+'\n'+p.url).join('\n\n')+'\n\n'+this.t('Escribe «iniciar» para preparar una solicitud.','Type “start” to prepare an enquiry.'),kind:'product'};
  if(/\b(precio|price|cost|cuesta|envio|delivery|shipping|descuento|discount|inventario|stock|garantia|warranty|devolucion|refund)\b/.test(q))return {text:this.t('No tengo ese dato confirmado para tu caso. Compruébalo en la ficha o con el equipo de la empresa; no puedo confirmar precio, existencia, despacho ni políticas que no estén verificadas.\n','I do not have that detail confirmed for your case. Check the official product page or ask the business; I cannot confirm an unverified price, stock level, delivery promise or policy.\n')+this.config.website,kind:'boundary'};
  return {text:this.t('No encontré una respuesta verificada para eso. Puedo mostrarte el «catálogo», responder preguntas sobre las referencias visibles o preparar una solicitud si escribes «iniciar».','I could not find a verified answer to that. I can show the “catalog”, answer questions about the listed items, or prepare an enquiry if you type “start”.'),kind:'unknown'};
 }
 finish(){return {text:(this.config.workflow?.summaryLabel||this.t('Solicitud para revisión','Enquiry for review'))+'\n\n'+Object.values(this.answers).map(a=>a.label+': '+a.value).join('\n')+'\n\n'+this.t('Es un borrador local. No se ha enviado, cobrado, reservado ni confirmado nada. Puedes descargar el resumen o escribir «reiniciar».','This is a local draft. Nothing has been sent, charged, reserved or confirmed. Download the summary or type “reset”.'),kind:'summary',summary:this.summary()};}
}
