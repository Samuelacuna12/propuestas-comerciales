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
  if(!app.dataset.dolceAdapted){app.dataset.dolceAdapted='true';app.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();app.click()}});app.addEventListener('click',e=>{if(original?.disabled){e.preventDefault();e.stopImmediatePropagation()}else{queueMicrotask(()=>prepareOffer(root))}},true);}
  const sticky=root.querySelector('[data-sticky-text]');if(sticky&&!original?.disabled&&sticky.textContent!==root.dataset.buyLabel)sticky.textContent=root.dataset.buyLabel;
 }
 document.querySelectorAll('._rsi-buy-now-button-product-floating').forEach(e=>e.style.setProperty('display','none','important'));
};
const prepareOffer=(root)=>{
 const offer=root.querySelector('[data-offer-choice]:checked');if(!offer)return;
 const apply=()=>{const target=document.querySelector('._rsi-quantity-offers-offer-container[data-offer-pos="'+offer.dataset.position+'"]');if(target){const trigger=target.querySelector('._rsi-quantity-offers-offer')||target;trigger.click();return true}return false};
 if(!apply()){const observer=new MutationObserver(()=>{if(apply())observer.disconnect()});observer.observe(document.body,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),8000);}
};
const openOffer=(root)=>{const app=root.querySelector('._rsi-buy-now-button-product');if(!app)return false;app.click();return true;};
const initialize=root=>{
 if(root.dataset.commerceReady)return;root.dataset.commerceReady='true';
 root.querySelectorAll('[data-offer-choice]').forEach(input=>input.addEventListener('change',()=>root.dispatchEvent(new Event('dolce:offer-changed'))));
 root.querySelector('[data-sticky-add]')?.addEventListener('click',e=>{if(!isPreview&&root.querySelector('._rsi-buy-now-button-product')){e.preventDefault();e.stopImmediatePropagation();openOffer(root)}},true);
 root.querySelector('form.d-pdp__form')?.addEventListener('submit',e=>{
  const offer=root.querySelector('[data-offer-choice]:checked');
  if(!isPreview&&offer){e.preventDefault();e.stopImmediatePropagation();if(!openOffer(root)){const status=root.querySelector('[data-product-error]');status.textContent=root.dataset.offerFallback;status.hidden=false;}}
 },true);
 if(!isPreview){const observer=new MutationObserver(()=>normalize(root));observer.observe(root,{childList:true,subtree:true});normalize(root);root.addEventListener('change',()=>normalize(root));}
};
document.querySelectorAll('[data-dolce-product]').forEach(initialize);
document.addEventListener('shopify:section:load',e=>e.target.querySelectorAll('[data-dolce-product]').forEach(initialize));
})();
