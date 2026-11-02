import { products } from './catalog.mjs';
import { presets, normalize, addItems, summarize, checklist, exportText, whatsappLink, quantity } from './core.mjs';

const $ = id => document.getElementById(id);
const STORE = 'samuel-creatus-mesa-v1';
let rows = [], filter = 'todos', noticeTimer, saved = false;
try {
  const stored = JSON.parse(localStorage.getItem(STORE) || 'null');
  if (stored && stored.version === 1) { rows = normalize(stored.rows); saved = rows.length > 0; }
} catch { /* The planner remains usable when storage is unavailable or invalid. */ }

const mobileLink = document.createElement('a');
mobileLink.href = '#lista'; mobileLink.className = 'mobile-list';
document.body.append(mobileLink);

function notify(message) {
  $('notice').textContent = message; $('notice').classList.add('show');
  clearTimeout(noticeTimer); noticeTimer = setTimeout(() => $('notice').classList.remove('show'), 3800);
}
function updateSavedStatus() {
  $('save-status').textContent = saved ? 'Hay una copia guardada en este navegador. Los cambios nuevos requieren volver a guardar.' : 'Selección temporal. Guárdala si quieres retomarla en este dispositivo.';
}
function productCards() {
  $('products').innerHTML = products.filter(p => filter === 'todos' || p.category === filter).map(p => {
    const selected = rows.some(r => r.id === p.id);
    return `<article class="product-card ${selected ? 'is-selected' : ''}"><div class="product-image"><img src="${p.image}" alt="${p.name}" width="800" height="800" loading="lazy"><span class="product-chip">${selected ? '✓ EN TU MESA' : p.reusable ? 'REUTILIZABLE' : 'MATERIAL'}</span></div><p class="product-brand">${p.brand}</p><h3>${p.name}</h3><p class="product-detail">${p.detail}</p><div class="product-actions"><button class="add" data-add="${p.id}" aria-pressed="${selected}" aria-label="${selected ? 'Ver en la lista:' : 'Añadir a la lista:'} ${p.name}">${selected ? '✓ En mi lista' : '+ A mi lista'}</button><a href="${p.url}" target="_blank" rel="noopener noreferrer" aria-label="Ver ficha oficial de ${p.name}">Ver ficha ↗</a></div></article>`;
  }).join('');
}
function renderList() {
  const data = summarize(rows);
  $('list-summary').textContent = data.rows.length ? `${data.buy.length} referencias por comprar · ${data.owned.length} ya las tienes` : 'Tu mesa está por estrenar.';
  $('list-items').innerHTML = data.rows.length ? data.rows.map(p => `<article class="list-row ${p.owned ? 'is-owned' : ''}" data-row="${p.id}"><img src="${p.image}" alt="" width="800" height="800"><div><div class="row-top"><h3>${p.name}</h3><button class="remove" data-action="remove" data-id="${p.id}" aria-label="Quitar ${p.name}">×</button></div><p class="row-ref">Ref. ${p.reference} · ${p.unit}${p.owned ? ' · no comprar' : ''}</p><div class="row-controls"><div class="stepper"><button data-action="minus" data-id="${p.id}" aria-label="Restar una unidad de ${p.name}" ${p.quantity <= 1 ? 'disabled' : ''}>−</button><input type="number" min="1" max="99" step="1" value="${p.quantity}" data-quantity="${p.id}" inputmode="numeric" aria-label="Unidades de ${p.name}"><button data-action="plus" data-id="${p.id}" aria-label="Sumar una unidad de ${p.name}" ${p.quantity >= 99 ? 'disabled' : ''}>+</button></div><button class="owned-toggle" data-action="owned" data-id="${p.id}" aria-pressed="${p.owned}"><span aria-hidden="true">${p.owned ? '✓' : ''}</span>Ya lo tengo</button></div></div></article>`).join('') : '<div class="empty"><div class="empty-symbol" aria-hidden="true">＋</div><strong>Aquí empieza tu proyecto.</strong><p>Añade materiales o prueba una selección.<br>Después separa lo que ya tienes.</p></div>';
  $('tips').innerHTML = checklist(rows).map(tip => `<li>${tip}</li>`).join('');
  for (const id of ['copy', 'download', 'print', 'save', 'clear']) $(id).disabled = !data.rows.length;
  $('consult').disabled = !data.buy.length;
  mobileLink.innerHTML = `<span>Mi lista <b>(${data.rows.length})</b></span><span>${data.buy.length} por comprar ↓</span>`;
  updateSavedStatus();
}
function render() { productCards(); renderList(); }
function afterEdit(id, action) {
  render();
  if (id && action) document.querySelector(`[data-id="${id}"][data-action="${action}"]`)?.focus({ preventScroll: true });
}
function downloadList() {
  const text = exportText(rows);
  if (!text) return;
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'mi-mesa-de-scrap.txt';
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify('Lista preparada para descargar. No se ha enviado a la tienda.');
}

document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
  const previous = rows.length;
  rows = addItems(rows, presets[button.dataset.preset].items);
  button.classList.add('active');
  render();
  notify(rows.length === previous ? 'Esta selección ya está en tu mesa; no hemos duplicado nada.' : `${rows.length - previous} materiales añadidos. Revisa lo que ya tienes.`);
}));
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  productCards();
}));
$('products').addEventListener('click', event => {
  const button = event.target.closest('[data-add]');
  if (!button) return;
  if (rows.some(row => row.id === button.dataset.add)) {
    const row = document.querySelector(`[data-row="${button.dataset.add}"]`);
    row?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth', block: 'center' });
    row?.querySelector('input')?.focus({ preventScroll: true });
    return;
  }
  rows = addItems(rows, [button.dataset.add]); render();
  document.querySelector(`[data-add="${button.dataset.add}"]`)?.focus({ preventScroll: true });
  notify('Añadido a tu mesa. Ajusta la cantidad en la lista.');
});
$('list-items').addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const id = button.dataset.id, action = button.dataset.action;
  const row = rows.find(r => r.id === id); if (!row) return;
  if (action === 'remove') { rows = rows.filter(r => r.id !== id); afterEdit(); $('list-title').setAttribute('tabindex','-1'); $('list-title').focus({preventScroll:true}); }
  else { if (action === 'owned') row.owned = !row.owned;
    if (action === 'plus') row.quantity = quantity(row.quantity + 1);
    if (action === 'minus') row.quantity = quantity(row.quantity - 1);
    afterEdit(id, action);
  }
});
function updateQuantityControls(input, value) {
  const stepper = input.closest('.stepper');
  if (!stepper) return;
  stepper.querySelector('[data-action="minus"]').disabled = value <= 1;
  stepper.querySelector('[data-action="plus"]').disabled = value >= 99;
}
$('list-items').addEventListener('input', event => {
  const input = event.target, id = input.dataset.quantity; if (!id) return;
  const row = rows.find(r => r.id === id); if (!row) return;
  const value = Number(input.value);
  // Commit valid typing immediately. Keep the active input and selection intact.
  if (input.value.trim() && Number.isInteger(value) && value >= 1 && value <= 99) {
    row.quantity = value;
    updateQuantityControls(input, value);
  }
});
$('list-items').addEventListener('focusout', event => {
  const input = event.target, id = input.dataset.quantity; if (!id) return;
  const row = rows.find(r => r.id === id); if (!row) return;
  const original = input.value;
  row.quantity = quantity(original);
  input.value = String(row.quantity);
  updateQuantityControls(input, row.quantity);
  // Do not render or restore focus here: the next click must reach its target.
  if (input.value !== original) notify('Usa una cantidad entera entre 1 y 99. La hemos ajustado.');
});
$('copy').addEventListener('click', async () => {
  const text = exportText(rows); if (!text) return;
  try { await navigator.clipboard.writeText(text); notify('Lista copiada. Tú decides dónde compartirla.'); }
  catch { notify('El navegador no permitió copiar. Usa «Descargar .txt» para conservar la lista.'); }
});
$('download').addEventListener('click', downloadList);
$('print').addEventListener('click', () => { $('print-area').textContent = exportText(rows); window.print(); });
$('save').addEventListener('click', () => {
  try { localStorage.setItem(STORE, JSON.stringify({ version: 1, rows: normalize(rows) })); saved = true; updateSavedStatus(); notify('Selección guardada sólo en este navegador.'); }
  catch { notify('No se pudo guardar en este navegador. Descarga tu lista para conservarla.'); }
});
$('forget').addEventListener('click', () => {
  try { localStorage.removeItem(STORE); saved = false; updateSavedStatus(); notify('Copia guardada eliminada. La lista abierta sigue disponible.'); }
  catch { notify('El navegador no permite acceder al guardado local.'); }
});
$('clear').addEventListener('click', () => {
  if (!confirm('¿Vaciar la mesa y borrar la copia guardada en este navegador?')) return;
  rows = []; saved = false;
  try { localStorage.removeItem(STORE); } catch { notify('Mesa vacía. No pudimos acceder a la copia guardada; revisa el almacenamiento del navegador.'); }
  document.querySelectorAll('[data-preset]').forEach(button => button.classList.remove('active'));
  render();
});
$('consult').addEventListener('click', () => {
  const url = whatsappLink(rows); if (!url) return;
  $('whatsapp').href = url;
  $('consult-preview').textContent = new URL(url).searchParams.get('text');
  $('consult-dialog').showModal();
});
$('close-dialog').addEventListener('click', () => $('consult-dialog').close());
$('consult-dialog').addEventListener('click', event => { if(event.target === $('consult-dialog')) { const r=event.target.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) event.target.close(); } });
render();
