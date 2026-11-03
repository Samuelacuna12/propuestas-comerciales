import {Conversation} from './conversation.mjs';
const $=id=>document.getElementById(id);
const safe=value=>{try{const u=new URL(value,location.href);return ['http:','https:'].includes(u.protocol)?u.href:null;}catch{return null;}};
function richText(parent,text){
 const expression=/https?:\/\/[^\s]+/g;let at=0;
 for(const match of String(text).matchAll(expression)){parent.append(document.createTextNode(text.slice(at,match.index)));const href=safe(match[0]);if(href){const a=document.createElement('a');a.href=href;a.target='_blank';a.rel='noopener';a.textContent=new URL(href).hostname.replace(/^www\./,'')+' ↗';parent.append(a);}at=match.index+match[0].length;}
 parent.append(document.createTextNode(text.slice(at)));
}
try{
 const response=await fetch('./bot-config.json');if(!response.ok)throw Error('No se pudo abrir la información del asistente.');
 const config=await response.json(),c=new Conversation(config),en=config.language==='en';
 const t=(es,eng)=>en?eng:es;
 document.documentElement.lang=en?'en':'es';document.title=config.company+' · '+t('Demo de asistente','Assistant demo');
 const theme=config.theme||{};
 for(const [key,value]of Object.entries({accent:theme.accent,paper:theme.background,ink:theme.foreground})){if(/^#[0-9a-f]{3,8}$/i.test(value||''))document.documentElement.style.setProperty('--'+key,value);}
 if(theme.font&&/^[a-zA-Z ,'-]+$/.test(theme.font))document.documentElement.style.setProperty('--font',theme.font);
 $('brand').textContent=config.company;$('heading').textContent=t('Una conversación para avanzar.','A conversation that moves things forward.');$('description').textContent=config.description;
 $('eyebrow').textContent=t('DEMO CONVERSACIONAL','CONVERSATIONAL DEMO');$('notice').textContent=t('Propuesta independiente de Samuel Acuña','Independent proposal by Samuel Acuña');$('proposal-link').textContent=t('Propuesta completa ↗','Full proposal ↗');
 $('nav-web').textContent=t('Web','Website');$('nav-auto').textContent=t('Automatización','Automation');$('nav-bot').textContent=t('Bot','Bot');$('chat-title').textContent=config.company;$('chat-type').textContent=t('Demo con reglas y conocimiento verificado','Demo with rules and verified knowledge');
 $('input-label').textContent=t('Escribe como lo haría un cliente','Type as a customer would');$('message-input').placeholder=t('Pregunta por un producto o escribe «iniciar»…','Ask about a product or type “start”…');$('send').textContent=t('Enviar','Send');$('reset').textContent=t('Reiniciar','Reset');$('privacy').textContent=t('La conversación se queda en esta página. Usa datos de ejemplo; no incluyas información personal.','The conversation stays on this page. Use sample information; do not enter personal details.');
 $('boundaries-label').textContent=t('Qué puede hacer esta demo','What this demo can do');$('catalog-title').textContent=t('Productos que reconoce','Products it knows');$('sources-label').textContent=t('Fuentes verificadas','Verified sources');$('footer').textContent=t('Prototipo independiente para evaluar la experiencia. Las conexiones a IA, catálogo vivo, pedidos y canales se implementan después de acordar el alcance.','Independent prototype for evaluating the experience. AI, live catalog, order and channel connections are implemented after agreeing on the scope.');
 for(const boundary of config.boundaries||[]){const li=document.createElement('li');li.textContent=boundary;$('boundaries').append(li);}
 for(const source of config.sources||[]){const href=safe(source.url);if(!href)continue;const li=document.createElement('li'),a=document.createElement('a');a.href=href;a.target='_blank';a.rel='noopener';a.textContent=source.claim||source.url;li.append(a);$('sources').append(li);}
 for(const p of config.products||[]){const item=document.createElement('article');item.className='product';const href=safe(p.asset||p.image);if(href){const img=document.createElement('img');img.src=href;img.alt=p.name;img.loading='lazy';img.addEventListener('error',()=>img.remove());item.append(img);}const copy=document.createElement('div'),a=document.createElement('a');a.href=safe(p.url)||config.website;a.target='_blank';a.rel='noopener';a.textContent=p.name;const body=document.createElement('p');body.textContent=p.description;copy.append(a,body);item.append(copy);$('catalog').append(item);}
 if(config.heroImage){$('hero').src=safe(config.heroImage)||'';$('hero').alt=config.company+' · '+t('selección de producto','product selection');$('hero').addEventListener('error',()=>$('hero').hidden=true);}else $('hero').hidden=true;
 function add(text,role){const div=document.createElement('div');div.className='bubble '+role;const label=document.createElement('small');label.textContent=role==='user'?t('Tú','You'):config.company+' · DEMO';div.append(label);richText(div,text);$('messages').append(div);$('messages').scrollTop=$('messages').scrollHeight;}
 function submit(value){const input=String(value).trim();if(!input)return;add(input,'user');const response=c.answer(input);add(response.text,'assistant');$('download').hidden=!c.complete;}
 add(c.welcome(),'assistant');
 const suggestions=[t('Catálogo','Catalog'),t('Iniciar','Start'),...(config.faqs||[]).slice(0,2).map(x=>x.question)];
 for(const label of suggestions){const b=document.createElement('button');b.type='button';b.textContent=label;b.title=label;b.onclick=()=>submit(label);$('quick').append(b);}
 $('form').onsubmit=event=>{event.preventDefault();submit($('message-input').value);$('message-input').value='';$('message-input').focus();};
 $('reset').onclick=()=>{c.reset();$('messages').replaceChildren();$('download').hidden=true;add(c.welcome(),'assistant');$('message-input').value='';};
 $('download').textContent=t('Descargar resumen de ejemplo ↓','Download sample summary ↓');
 $('download').onclick=()=>{const blob=new Blob([JSON.stringify(c.summary(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='demo-'+config.company.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
}catch(error){const div=document.createElement('div');div.className='error';div.textContent='No se pudo cargar la demo. / The demo could not be loaded. ';const a=document.createElement('a');a.href='index.html';a.textContent='Volver a la propuesta / Back to proposal';div.append(a);document.body.replaceChildren(div);}
