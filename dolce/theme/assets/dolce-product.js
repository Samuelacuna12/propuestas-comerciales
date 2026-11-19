(()=>{
  const colorMedia={"body-monaco":{"NEGRO":"DSC4195.jpg","BLANCO":"DSC4270.jpg","PALO DE ROSA":"DSC4124.jpg"},"set-sharlot":{"BLANCO":"manga_59d34920-ad67-4ec3-ad37-8b64af7ff3ef.png","ROJO":"3_e22096b0-8fc8-470c-9e6e-2c3ec5dd2b4d.png","MELON":"6_74e1e1c9-e7c1-4398-a882-4ee8c305743f.png"},"baby-doll-lexi":{"ROJO":"DSC3916_1.jpg","NEGRO":"DSC3959_1.jpg"},"set-deportivo":{"BLANCO":"manga.png","NEGRO":"4_fae2b3d0-d619-494b-887f-983a54c1c139.png"},"set-gabriela":{"NEGRO":"2_07647dc0-07bb-4ce0-ab54-62e9e5a3c283.png","BLANCO":"5_e8184338-25bb-420b-8f31-f12b2de6456d.png","MELON":"8_4b0d1126-66fd-468b-b78b-f3f95f8c652b.png"},"set-alma":{"MARFIL":"WhatsAppImage2026-02-18at6.24.51PM.jpg"},"set-aria":{"VERDE BOTELLA":"IMG_9246.jpg","ROSA":"IMG_9250.jpg","NEGRO":"IMG_9247.jpg","ROJO":"IMG_9249.jpg"},"corset-isadora":{"DORADO":"WhatsAppImage2026-02-26at2.43.43PM_3.jpg","BLANCO":"WhatsAppImage2026-02-26at2.43.43PM_1.jpg","ROJO CEREZA":"WhatsAppImage2026-02-26at2.43.43PM.jpg"},"body-isadora":{"BLANCO":"WhatsAppImage2026-04-08at4.50.36PM.jpg","NEGRO":"WhatsAppImage2026-04-08at4.50.35PM.jpg","COCOA":"Gemini_Generated_Image_uoc5u1uoc5u1uoc5.png","MARFIL":"WhatsAppImage2026-04-08at4.50.36PM_1.jpg"},"set-victoria":{"MARFIL":"IMG_7243_JPG.jpg","VINO":"IMG_7238_JPG.jpg","NEGRO":"IMG_7230_JPG.jpg"},"pack-boxer-dama":{"BLANCO":"Frontal_cc1d5724-930a-45b8-8138-94fff7fcf6ed.png","GRIS":"magnific_task-imagegeneration-mode_jUOomlfLD0.jpg","AZUL OSCURO":"Frontal.png","NEGRO":"Frontal_3cca986f-43b9-4e34-acfc-e3a90041d569.png","ROSA":"Frontal_08cd1c10-7cd7-401a-95cf-6f093e5dc83a.png","MARFIL":"Lateral_6f673cbb-e145-4652-8908-38dc3c03bcc2.jpg"},"pack-brasilera":{"VINO":"magnific_task-mirrorselfie-catalog_P3DpPlr42C.png","AZUL CIELO":"magnific_task-mirrorselfie-catalog_YMfE0eUWeC.png","MARFIL":"magnific_task-mirrorselfie-catalog_xSZA0eQjfW.png","BLANCO":"magnific_task-mirrorselfie-catalog_Bh1rDjpoQR.png","AMARILLO PASTEL":"magnific_task-mirrorselfie-catalog_TdQF7WtVNR.png","NEGRO":"magnific_task-fullbody-studio-cata_LwAzmICswO.png","COCOA":"magnific_task-mirrorselfie-catalog_WDCuFLLcXe.png"}};

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
        if(moveMedia){
          const colorIndex=product.options.findIndex(option=>String(typeof option==='string'?option:option.name).toLowerCase()==='color');
          const color=String(variant.options[colorIndex]||'').toLocaleUpperCase('es');
          const filename=colorMedia[product.handle]?.[color];
          let index=filename?slides.findIndex(slide=>decodeURIComponent(slide.dataset.mediaSrc||'').split('/').pop()===decodeURIComponent(filename)):-1;
          if(index<0&&variant.featured_media)index=slides.findIndex(slide=>slide.dataset.mediaId===String(variant.featured_media.id));
          if(index>=0)goToMedia(index);
        }
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
    renderVariant(selected,false,true);
  };
  const initializeAll=(scope=document)=>scope.querySelectorAll('[data-dolce-product]').forEach(initialize);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>initializeAll(),{once:true});else initializeAll();
  document.addEventListener('shopify:section:load',event=>initializeAll(event.target));
})();
