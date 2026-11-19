(() => {
  if (!window.customElements || customElements.get('dolce-atelier-reader')) return;

  class AtelierReader extends HTMLElement {
    connectedCallback() {
      this.controller = new AbortController();
      const { signal } = this.controller;
      this.motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
      this.opening = this.querySelector('.d-atelier-opening');
      this.study = this.querySelector('.d-atelier-study');
      this.header = document.querySelector('.d-header-shell');
      this.chapterLinks = [...this.querySelectorAll('[data-atelier-jump]')];
      this.detailLinks = [...this.querySelectorAll('[data-atelier-detail]')];
      this.dialogs = new Map([...this.querySelectorAll('[data-atelier-dialog]')]
        .map(dialog => [dialog.dataset.atelierDialog, dialog]));

      this.detailLinks.forEach(link => {
        const dialog = this.dialogs.get(link.dataset.atelierDetail);
        if (typeof dialog?.showModal !== 'function') return;
        link.setAttribute('aria-haspopup', 'dialog');
        link.addEventListener('click', event => {
          if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          this.openDetail(dialog);
        }, { signal });
      });
      this.dialogs.forEach(dialog => {
        dialog.addEventListener('click', event => {
          if (event.target !== dialog) return;
          const rect = dialog.getBoundingClientRect();
          if (event.clientX < rect.left || event.clientX > rect.right ||
              event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
        }, { signal });
      });

      this.onScreen = true;
      this.schedule = () => {
        if (!this.onScreen || this.frame) return;
        this.frame = requestAnimationFrame(() => {
          this.frame = 0;
          if (this.isConnected) this.measure();
        });
      };
      this.updateMotion = () => {
        this.classList.toggle('d-atelier--moving', !this.motionPreference.matches);
        this.schedule();
      };
      this.motionPreference.addEventListener('change', this.updateMotion, { signal });
      window.addEventListener('scroll', this.schedule, { passive: true, signal });
      window.addEventListener('resize', this.schedule, { passive: true, signal });
      if ('ResizeObserver' in window) {
        this.resizeObserver = new ResizeObserver(this.schedule);
        this.resizeObserver.observe(this);
        if (this.header) this.resizeObserver.observe(this.header);
      }
      if ('IntersectionObserver' in window) {
        this.visibility = new IntersectionObserver(([entry]) => {
          this.onScreen = entry.isIntersecting;
          if (this.onScreen) this.schedule();
        }, { rootMargin: '250px 0px' });
        this.visibility.observe(this);
        this.plates = new IntersectionObserver(entries => {
          entries.forEach(({ target, isIntersecting, boundingClientRect }) => {
            if (isIntersecting) {
              target.style.setProperty('--plate-inset', '0%');
              this.plates.unobserve(target);
            } else if (boundingClientRect.top > window.innerHeight) {
              target.style.setProperty('--plate-inset', '14%');
            }
          });
        }, { threshold: 0.16 });
        this.querySelectorAll('.d-atelier-detail').forEach(plate => this.plates.observe(plate));
      }
      this.updateMotion();
    }

    openDetail(dialog) {
      if (dialog.open) return;
      const slot = dialog.querySelector('[data-atelier-magnified]');
      if (!slot.firstElementChild) {
        const image = new Image();
        image.alt = slot.dataset.description;
        image.decoding = 'async';
        image.src = slot.dataset.source;
        slot.append(image);
      }
      dialog.showModal();
    }

    measure() {
      if (!this.opening || !this.study) return;
      const viewport = window.innerHeight;
      const bounds = this.getBoundingClientRect();
      const opening = this.opening.getBoundingClientRect();
      const detailsTop = this.study.getBoundingClientRect().top;
      const head = this.header?.getBoundingClientRect();
      const headerHeight = head ? Math.round(Math.max(0, Math.min(head.height, head.bottom))) : 0;
      const clamp = value => Math.max(0, Math.min(1, value));
      const readingDistance = Math.max(1, bounds.height - viewport + headerHeight);
      const progress = clamp((headerHeight - bounds.top) / readingDistance);
      this.style.setProperty('--atelier-header', headerHeight + 'px');
      this.style.setProperty('--reading', progress.toFixed(4));
      const active = detailsTop <= headerHeight + viewport * 0.42 ? 'details' : 'silhouette';
      if (this.chapter !== active) {
        this.chapter = active;
        this.chapterLinks.forEach(link => {
          if (link.dataset.atelierJump === active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
      if (this.motionPreference.matches) return;
      const position = clamp((viewport - opening.top) / (viewport + opening.height));
      this.style.setProperty('--front-shift', (-24 * position).toFixed(1) + 'px');
      this.style.setProperty('--reverse-shift', (15 - 49 * position).toFixed(1) + 'px');
      this.style.setProperty('--word-shift', (34 * position).toFixed(1) + 'px');
    }

    disconnectedCallback() {
      this.controller?.abort();
      this.resizeObserver?.disconnect();
      this.visibility?.disconnect();
      this.plates?.disconnect();
      if (this.frame) cancelAnimationFrame(this.frame);
      this.frame = 0;
    }
  }

  customElements.define('dolce-atelier-reader', AtelierReader);
})();
