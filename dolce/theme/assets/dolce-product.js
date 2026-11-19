(()=>{
  const initialize=(root)=>{
    if(root.dataset.initialized)return;
    root.dataset.initialized='true';
    const data=root.querySelector('[data-product-json]');
    if(!data)return;
    let product;
    try{product=JSON.parse(data.textContent);}catch{return;}
    const form=root.querySelector('form.d-pdp__form');
    const variantSelect=root.querySelector('[data-variant-select]');
    const options=root.querySelector('[data-variant-options]');
    const add=root.querySelector('[data-add-button]');
    const addText=root.querySelector('[data-add-text]');
    const sticky=root.querySelector('[data-sticky-buy]');
    const stickyAdd=root.querySelector('[data-sticky-add]');
    const stickyText=root.querySelector('[data-sticky-text]');
    const status=root.querySelector('[data-product-status]');
    const error=root.querySelector('[data-product-error]');
    const cartLink=root.querySelector('[data-cart-link]');
    const gallery=root.querySelector('[data-gallery]');
    const slides=[...root.querySelectorAll('[data-media-id]')];
    const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const formatMoney=(cents)=>new Intl.NumberFormat('es-CO',{style:'currency',currency:root.dataset.currency||'COP',currencyDisplay:'narrowSymbol',maximumFractionDigits:0}).format(cents/100);
    let selected=product.variants.find(v=>String(v.id)===variantSelect.value)||product.variants[0];
    let busy=false;
    let announcementFrame;
    const announce=(message)=>{cancelAnimationFrame(announcementFrame);status.textContent='';announcementFrame=requestAnimationFrame(()=>{status.textContent=message;});};
    if(options){options.hidden=false;root.querySelector('[data-native-variants]').hidden=true;}
    const thumbs=[...root.querySelectorAll('[data-gallery-thumb]')];
    const goToMedia=(index)=>{
      if(!gallery||!slides[index])return;
      gallery.scrollTo({left:slides[index].offsetLeft-slides[0].offsetLeft,behavior:reduced()?'instant':'smooth'});
    };
    const setAvailability=()=>{
      if(!options)return;
      const current=[...options.querySelectorAll('fieldset')].map(field=>field.querySelector('input:checked')?.value);
      options.querySelectorAll('fieldset').forEach((field,index)=>{
        field.querySelectorAll('input').forEach(input=>{
          const canBuy=product.variants.some(v=>v.available&&v.options.every((value,i)=>i===index?value===input.value:value===current[i]));
          const label=input.closest('[data-choice]');
          label.toggleAttribute('data-unavailable',!canBuy);
          label.querySelector('[data-choice-availability]').textContent=canBuy?'':` · ${root.dataset.soldLabel}`;
        });
      });
    };
    const renderVariant=(variant,updateUrl=true,moveMedia=true)=>{
      selected=variant;
      const available=Boolean(variant?.available);
      add.disabled=busy||!available;stickyAdd.disabled=busy||!available;
      const offer=root.querySelector('[data-offer-choice]:checked');
      const displayPrice=offer?Number(offer.dataset.total)*100:variant?.price;
      const label=variant?(available?root.dataset.addLabel:root.dataset.soldLabel):root.dataset.unavailableLabel;
      addText.textContent=label;stickyText.textContent=label;
      if(variant){
        variantSelect.value=String(variant.id);
        variantSelect.dispatchEvent(new Event('change',{bubbles:true}));
        root.querySelector('[data-product-price]').textContent=formatMoney(displayPrice);
        root.querySelector('[data-sticky-price]').textContent=formatMoney(displayPrice);
        root.querySelectorAll('[data-product-price-repeat]').forEach(price=>price.textContent=formatMoney(displayPrice));
        const compare=root.querySelector('[data-product-compare]');
        compare.hidden=!(variant.compare_at_price>variant.price);
        if(!compare.hidden)compare.textContent=formatMoney(variant.compare_at_price);
        if(updateUrl){const url=new URL(location.href);url.searchParams.set('variant',variant.id);history.replaceState({},'',url);}
        if(moveMedia&&variant.featured_media){const index=slides.findIndex(s=>s.dataset.mediaId===String(variant.featured_media.id));if(index>=0)goToMedia(index);}
      }
      setAvailability();
    };
    root.addEventListener('dolce:offer-changed',()=>renderVariant(selected,false,false));
    options?.addEventListener('change',()=>{
      const values=[...options.querySelectorAll('fieldset')].map(field=>{
        const value=field.querySelector('input:checked')?.value;
        field.querySelector('[data-option-label]').textContent=value||'';
        return value;
      });
      const variant=product.variants.find(v=>v.options.every((value,index)=>value===values[index]));
      renderVariant(variant);
      error.hidden=true;
      cartLink.hidden=true;
      announce(variant?`${variant.title} · ${formatMoney(variant.price)} · ${variant.available?root.dataset.addLabel:root.dataset.soldLabel}`:root.dataset.unavailableLabel);
    });
    form?.addEventListener('submit',async(event)=>{
      event.preventDefault();
      if(busy||!selected?.available)return;
      const quantity=form.querySelector('[name="quantity"]');
      if(!quantity.checkValidity()){quantity.reportValidity();return;}
      busy=true;form.setAttribute('aria-busy','true');add.disabled=true;stickyAdd.disabled=true;addText.textContent=root.dataset.addingLabel;stickyText.textContent=root.dataset.addingLabel;error.hidden=true;
      try{
        const response=await fetch(root.dataset.addUrl,{method:'POST',headers:{Accept:'application/json'},body:new FormData(form)});
        const result=await response.json();
        if(!response.ok)throw new Error(result.description||root.dataset.errorLabel);
        announce(root.dataset.addedLabel);cartLink.hidden=false;
        document.dispatchEvent(new CustomEvent('dolce:cart-updated',{detail:{item:result}}));
      }catch(cause){error.textContent=cause.message||root.dataset.errorLabel;error.hidden=false;announce('');}
      finally{busy=false;form.removeAttribute('aria-busy');renderVariant(selected,false,false);}
    });
    if('IntersectionObserver'in window){
      const observer=new IntersectionObserver(([entry])=>{sticky.hidden=entry.isIntersecting||entry.boundingClientRect.top>0;},{threshold:0});
      observer.observe(root.querySelector('[data-primary-buy]'));
    }
    const slideIndex=()=>gallery?Math.max(0,Math.min(slides.length-1,Math.round(gallery.scrollLeft/gallery.clientWidth))):0;
    const syncGallery=()=>{
      const active=slideIndex();
      const count=root.querySelector('[data-gallery-count]');
      if(count)count.textContent=`${active+1} / ${slides.length}`;
      thumbs.forEach((thumb,index)=>thumb.setAttribute('aria-pressed',String(index===active)));
      slides.forEach((slide,index)=>{
        slide.inert=index!==active;
        if(index!==active)slide.querySelector('video')?.pause();
      });
    };
    root.querySelector('[data-gallery-prev]')?.addEventListener('click',()=>goToMedia(Math.max(0,slideIndex()-1)));
    root.querySelector('[data-gallery-next]')?.addEventListener('click',()=>goToMedia(Math.min(slides.length-1,slideIndex()+1)));
    thumbs.forEach((thumb,index)=>{
      thumb.addEventListener('click',()=>goToMedia(index));
      thumb.addEventListener('keydown',event=>{
        let target=index;
        if(event.key==='ArrowRight')target=Math.min(thumbs.length-1,index+1);
        else if(event.key==='ArrowLeft')target=Math.max(0,index-1);
        else if(event.key==='Home')target=0;
        else if(event.key==='End')target=thumbs.length-1;
        else return;
        event.preventDefault();thumbs[target].focus();goToMedia(target);
      });
    });
    let galleryFrame;
    gallery?.addEventListener('scroll',()=>{cancelAnimationFrame(galleryFrame);galleryFrame=requestAnimationFrame(syncGallery);},{passive:true});
    syncGallery();
    const openDialog=(dialog,trigger)=>{
      if(!dialog?.showModal)return;
      dialog._dolceTrigger=trigger;
      dialog.showModal();
    };
    root.querySelectorAll('[data-size-open]').forEach(button=>button.addEventListener('click',()=>openDialog(root.querySelector('[data-size-dialog]'),button)));
    root.querySelectorAll('[data-zoom]').forEach(button=>button.addEventListener('click',()=>{
      const dialog=root.querySelector('[data-lightbox]');
      const image=dialog.querySelector('[data-lightbox-image]');
      image.src=button.dataset.zoom;image.alt=button.dataset.zoomAlt;
      openDialog(dialog,button);
    }));
    root.querySelectorAll('dialog').forEach(dialog=>{
      dialog.querySelectorAll('[data-dialog-close]').forEach(button=>button.addEventListener('click',()=>dialog.close()));
      dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
      dialog.addEventListener('close',()=>dialog._dolceTrigger?.focus());
    });
    renderVariant(selected,false,false);
  };
  const initializeAll=(scope=document)=>scope.querySelectorAll('[data-dolce-product]').forEach(initialize);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>initializeAll(),{once:true});else initializeAll();
  document.addEventListener('shopify:section:load',event=>initializeAll(event.target));
})();
