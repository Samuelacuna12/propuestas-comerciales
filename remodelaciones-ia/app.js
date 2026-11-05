'use strict';

const offers = {
  mobiliario: {image:'assets/mueble-tv.jpg',alt:'Espacio de televisión y mobiliario a medida como inspiración',caption:'INSPIRACIÓN · MOBILIARIO A MEDIDA',kicker:'LA PRIMERA TRANSFORMACIÓN',title:'Un mueble puede ser\nel principio.',description:'Muebles para televisor, bibliotecas, closets y piezas a medida. Ofertas claras para necesidades concretas y nuevas oportunidades dentro de la misma vivienda.',features:['Presentación visual de cada solución','Opciones por material, tamaño y acabado','Seguimiento hacia el siguiente espacio']},
  cocinas: {image:'assets/cocina.jpg',alt:'Cocina moderna como inspiración para remodelación',caption:'INSPIRACIÓN · COCINAS Y BAÑOS',kicker:'ESPACIOS QUE SE VIVEN CADA DÍA',title:'La cocina que imaginas.\nEl proyecto que entiendes.',description:'Cocinas y baños completos, con una propuesta que haga visibles la distribución, los materiales y el alcance antes de tomar una decisión.',features:['Antes y después visuales','Cotizaciones con alternativas de alcance','Atención y seguimiento hasta el cierre']},
  residencias: {image:'assets/sala.jpg',alt:'Inspiración para una remodelación residencial completa',caption:'INSPIRACIÓN · RESIDENCIAS COMPLETAS',kicker:'TRANSFORMACIÓN INTEGRAL',title:'La próxima versión\nde toda una casa.',description:'Remodelaciones completas de apartamentos, casas y mansiones. Una experiencia privada para propietarios locales o en el exterior.',features:['Recorridos y decisiones visuales','Propuestas por alcance y acabados','Reportes para acompañar a distancia']}
};

const offerButtons = [...document.querySelectorAll('[data-offer]')];

function activate(buttons, key, attr) {
  buttons.forEach(button => {
    const selected = button.dataset[attr] === key;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
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

wireTabs(offerButtons,'offer',showOffer);
document.getElementById('print-proposal').addEventListener('click',()=>window.print());

const demoOptions = {
  esencial: {index:'01',image:'assets/demo-esencial.jpg',title:'Renovación esencial',description:'Actualizamos pintura y mobiliario e incorporamos un mueble de TV a medida, conservando la distribución y los elementos principales de la sala.',scope:['Pintura y actualización del ambiente','Mobiliario y textiles renovados','Mueble de TV a medida']},
  integral: {index:'02',image:'assets/demo-integral.jpg',title:'Diseño integral',description:'Renovamos acabados, carpintería y luz para transformar el ambiente completo, conservando la geometría del espacio.',scope:['Carpintería en madera y almacenamiento','Nuevos acabados y mobiliario','Iluminación integrada']},
  autor: {index:'03',image:'assets/demo-autor.jpg',title:'Residencia de autor',description:'Una propuesta de alta gama que combina materiales, piezas y detalles de autor para dar una identidad propia al mismo espacio.',scope:['Piedra, madera y carpintería especial','Mobiliario y arte seleccionados','Iluminación arquitectónica']}
};

const demoButtons=[...document.querySelectorAll('[data-demo]')];
const comparisonRange=document.getElementById('compare-range');
const comparisonStage=document.getElementById('compare-stage');

function updateComparison(value) {
  const before=Math.min(100,Math.max(0,Number(value)));
  comparisonStage.style.setProperty('--reveal',before+'%');
  comparisonRange.value=String(before);
  comparisonRange.setAttribute('aria-valuetext',before+' por ciento antes y '+(100-before)+' por ciento después');
  document.querySelector('.compare-label-before').hidden=before<6;
  document.querySelector('.compare-label-after').hidden=before>94;
}

function showDemo(key) {
  const option=demoOptions[key];
  if(!option)return;
  activate(demoButtons,key,'demo');
  document.getElementById('demo-result').setAttribute('aria-labelledby','demo-'+key);
  const image=document.getElementById('demo-after-image');
  image.src=option.image;
  image.alt='La misma sala con la propuesta '+option.title.toLowerCase()+', simulación con IA';
  document.getElementById('compare-after-label').textContent='DESPUÉS · OPCIÓN '+option.index;
  document.getElementById('demo-option-title').textContent=option.title;
  document.getElementById('demo-option-description').textContent=option.description;
  document.getElementById('demo-option-scope').replaceChildren(...option.scope.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
  updateComparison(50);
}

wireTabs(demoButtons,'demo',showDemo);
comparisonRange.addEventListener('input',event=>updateComparison(event.target.value));
document.querySelectorAll('[data-compare]').forEach(button=>button.addEventListener('click',()=>updateComparison(button.dataset.compare)));
Object.values(demoOptions).forEach(option=>{const preview=new Image();preview.src=option.image;});
