(()=>{
const isPreview=document.body.hasAttribute('data-dolce-preview');
const normalize=root=>{
 const app=root.querySelector('._rsi-buy-now-button-product');
 const original=root.querySelector('[data-add-button]');
 if(app){
  const style={background:'var(--d-accent)',color:'#fff','border-radius':'0','border':'1px solid var(--d-accent)','box-shadow':'none','font-family':'var(--d-body)','font-size':'15px','font-weight':'500','min-height':'52px',padding:'14px 22px',margin:'0',width:'100%',animation:'none',transform:'none'};
  for(const[k,v]of Object.entries(style))if(app.style.getPropertyValue(k)!==v)app.style.setProperty(k,v,'important');
  app.setAttribute('role','button');app.setAttribute('tabindex','0');app.setAttribute('aria-disabled',String(Boolean(original?.disabled)));app.removeAttribute('data-animation-type');
  app.querySelectorAll('svg').forEach(e=>e.style.setProperty('fill','currentColor','important'));
  if(!app.dataset.dolceAdapted){app.dataset.dolceAdapted='true';app.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();app.click()}});app.addEventListener('click',e=>{if(original?.disabled){e.preventDefault();e.stopImmediatePropagation()}else{const position=root.querySelector('[data-offer-choice]:checked')?.dataset.position;queueMicrotask(()=>prepareOffer(root,position))}},true);}
  const sticky=root.querySelector('[data-sticky-text]');if(sticky&&!original?.disabled&&sticky.textContent!==root.dataset.buyLabel)sticky.textContent=root.dataset.buyLabel;
 }
 document.querySelectorAll('._rsi-buy-now-button-product-floating').forEach(e=>e.style.setProperty('display','none','important'));
};
const pendingOffers=new WeakMap();
const prepareOffer=(root,position=root.querySelector('[data-offer-choice]:checked')?.dataset.position)=>{
 if(position===undefined)return;
 pendingOffers.get(root)?.();
 let timer,stopped=false;const deadline=Date.now()+3000;
 const stop=()=>{stopped=true;clearTimeout(timer);document.removeEventListener('click',onChoice,true);};
 const onChoice=event=>{if(event.isTrusted&&event.target.closest?.('._rsi-quantity-offers-offer'))stop();};
 pendingOffers.set(root,stop);document.addEventListener('click',onChoice,true);
 const apply=()=>{
  if(stopped)return;
  const target=document.querySelector('._rsi-quantity-offers-offer-container[data-offer-pos="'+position+'"]');
  if(target&&!target.classList.contains('_rsi-quantity-offers-selected'))(target.querySelector('._rsi-quantity-offers-offer')||target).click();
  if(Date.now()<deadline)timer=setTimeout(apply,80);else stop();
 };
 apply();
};
const openOffer=(root)=>{const app=root.querySelector('._rsi-buy-now-button-product');if(!app)return false;const position=root.querySelector('[data-offer-choice]:checked')?.dataset.position;app.click();prepareOffer(root,position);return true;};
const initialize=root=>{
 if(root.dataset.commerceReady)return;root.dataset.commerceReady='true';
 root.querySelectorAll('[data-offer-choice]').forEach(input=>input.addEventListener('change',()=>root.dispatchEvent(new Event('dolce:offer-changed'))));

 root.querySelector('form.d-pdp__form')?.addEventListener('submit',e=>{
  const offer=root.querySelector('[data-offer-choice]:checked');
  if(!isPreview&&offer){e.preventDefault();e.stopImmediatePropagation();if(!openOffer(root)){const status=root.querySelector('[data-product-error]');status.textContent=root.dataset.offerFallback;status.hidden=false;}}
 },true);
 if(!isPreview){const observer=new MutationObserver(()=>normalize(root));observer.observe(root,{childList:true,subtree:true});normalize(root);root.addEventListener('change',()=>normalize(root));}
};
document.addEventListener('click',event=>{
 const button=event.target.closest?.('[data-sticky-add]');if(!button||button.disabled||isPreview)return;
 const root=button.closest('[data-dolce-product]');if(!root?.querySelector('._rsi-buy-now-button-product'))return;
 event.preventDefault();event.stopImmediatePropagation();openOffer(root);
},true);
document.querySelectorAll('[data-dolce-product]').forEach(initialize);
document.addEventListener('shopify:section:load',e=>e.target.querySelectorAll('[data-dolce-product]').forEach(initialize));
})();
