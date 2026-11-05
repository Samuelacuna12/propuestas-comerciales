'use strict';

const stages = {
  captar: {label:'ABRIR CONVERSACIONES', index:'01 / 03', title:'Que lleguen. Y también salir a buscarlos.', items:[
    ['Contenido y campañas con IA','Videos, propuestas visuales y transformaciones reales. Probamos qué trae clientes, visitas y ventas.'],
    ['Prospección activa y personalizada','Identificamos oportunidades y preparamos acercamientos para propietarios, inversionistas y empresas.'],
    ['Una red que recomienda','Aliados inmobiliarios, arquitectos y administradores, con seguimiento al origen de cada proyecto.']
  ]},
  convertir: {label:'DE LA CONVERSACIÓN AL PROYECTO', index:'02 / 03', title:'Mostrar el potencial. Facilitar la decisión.', items:[
    ['Una foto, tres propuestas visuales','Desarrollaremos una web que permita explorar alternativas con IA, comparadores y recorridos.'],
    ['Agentes que conversan y dan seguimiento','Chat y llamadas autorizadas para responder consultas, calificar necesidades y coordinar visitas.'],
    ['Cotizaciones que se entienden','Propuestas interactivas con alternativas, alcance, acabados y próximos pasos. Precios tras la visita técnica.']
  ]},
  crecer: {label:'RELACIONES QUE SIGUEN CRECIENDO', index:'03 / 03', title:'Cada cliente puede abrir el siguiente espacio.', items:[
    ['Seguimiento sin oportunidades olvidadas','CRM, responsables y próximas acciones. Recuperamos cotizaciones pendientes según el motivo y el momento.'],
    ['Del primer trabajo al siguiente proyecto','Nuevos espacios de la vivienda, mantenimiento y referidos. Construimos una relación después de entregar.'],
    ['Decidir con ventas y margen','Medimos origen del cliente, visitas, cierres e ingresos cobrados. Cuidamos costos, descuentos y adicionales.']
  ]}
};

const offers = {
  mobiliario: {image:'assets/mueble-tv.jpg',alt:'Espacio de televisión y mobiliario a medida como inspiración',caption:'INSPIRACIÓN · MOBILIARIO A MEDIDA',kicker:'LA PRIMERA TRANSFORMACIÓN',title:'Un mueble puede ser\nel principio.',description:'Muebles para televisor, bibliotecas, closets y piezas a medida. Ofertas claras para necesidades concretas y nuevas oportunidades dentro de la misma vivienda.',features:['Presentación visual de cada solución','Opciones por material, tamaño y acabado','Seguimiento hacia el siguiente espacio']},
  cocinas: {image:'assets/cocina.jpg',alt:'Cocina moderna como inspiración para remodelación',caption:'INSPIRACIÓN · COCINAS Y BAÑOS',kicker:'ESPACIOS QUE SE VIVEN CADA DÍA',title:'La cocina que imaginas.\nEl proyecto que entiendes.',description:'Cocinas y baños completos, con una propuesta que haga visibles la distribución, los materiales y el alcance antes de tomar una decisión.',features:['Antes y después visuales','Cotizaciones con alternativas de alcance','Atención y seguimiento hasta el cierre']},
  residencias: {image:'assets/sala.jpg',alt:'Inspiración para una remodelación residencial completa',caption:'INSPIRACIÓN · RESIDENCIAS COMPLETAS',kicker:'TRANSFORMACIÓN INTEGRAL',title:'La próxima versión\nde toda una casa.',description:'Remodelaciones completas de apartamentos, casas y mansiones. Una experiencia privada para propietarios locales o en el exterior.',features:['Recorridos y decisiones visuales','Propuestas por alcance y acabados','Reportes para acompañar a distancia']}
};

const stageButtons = [...document.querySelectorAll('[data-stage]')];
const offerButtons = [...document.querySelectorAll('[data-offer]')];

function activate(buttons, key, attr) {
  buttons.forEach(button => {
    const selected = button.dataset[attr] === key;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
}

function showStage(key) {
  const stage = stages[key];
  if (!stage) return;
  activate(stageButtons,key,'stage');
  document.getElementById('stage-panel').setAttribute('aria-labelledby', 'stage-'+key);
  document.getElementById('stage-label').textContent = stage.label;
  document.getElementById('stage-index').textContent = stage.index;
  document.getElementById('stage-title').textContent = stage.title;
  document.getElementById('stage-items').replaceChildren(...stage.items.map(([title,description]) => {
    const article=document.createElement('article');
    const arrow=document.createElement('span');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
    const copy=document.createElement('div');
    const heading=document.createElement('h4');heading.textContent=title;
    const paragraph=document.createElement('p');paragraph.textContent=description;
    copy.append(heading,paragraph);article.append(arrow,copy);return article;
  }));
}

function showOffer(key) {
  const offer=offers[key];
  if (!offer) return;
  activate(offerButtons,key,'offer');
  document.getElementById('offer-panel').setAttribute('aria-labelledby','offer-'+key);
  for (const id of ['hero-image','offer-image']) {
    const image=document.getElementById(id);image.src=offer.image;image.alt=offer.alt;
  }
  document.getElementById('hero-caption').textContent=offer.caption;
  document.getElementById('offer-kicker').textContent=offer.kicker;
  const heading=document.getElementById('offer-title');heading.replaceChildren();
  offer.title.split('\n').forEach((line,index)=>{if(index)heading.append(document.createElement('br'));heading.append(document.createTextNode(line));});
  document.getElementById('offer-description').textContent=offer.description;
  document.getElementById('offer-features').replaceChildren(...offer.features.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
}

function wireTabs(buttons, attr, callback) {
  buttons.forEach((button,index) => {
    button.addEventListener('click',()=>callback(button.dataset[attr]));
    button.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%buttons.length;
      if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(index-1+buttons.length)%buttons.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=buttons.length-1;
      if(next===undefined)return;
      event.preventDefault();buttons[next].focus();callback(buttons[next].dataset[attr]);
    });
  });
}

wireTabs(stageButtons,'stage',showStage);
wireTabs(offerButtons,'offer',showOffer);
document.getElementById('print-proposal').addEventListener('click',()=>window.print());
