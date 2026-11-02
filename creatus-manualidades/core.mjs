import { products } from './catalog.mjs';

export const presets = {
  tarjetas: { title: 'Tarjetas de papel', items: ['vichy', 'negra', 'cinta', 'plegadera', 'cutter', 'base'] },
  recuerdos: { title: 'Páginas de recuerdos', items: ['nubes', 'negra', 'esquinas', 'cutter', 'base'] }
};
const byId = new Map(products.map(p => [p.id, p]));
export function quantity(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(99, Math.max(1, Math.trunc(n))) : 1;
}
export function normalize(raw) {
  if (!Array.isArray(raw)) return [];
  const unique = new Map();
  for (const row of raw) {
    if (!row || !byId.has(row.id)) continue;
    unique.set(row.id, { id: row.id, quantity: quantity(row.quantity), owned: row.owned === true });
  }
  return [...unique.values()];
}
export function addItems(rows, ids) {
  const result = normalize(rows);
  for (const id of ids) {
    if (byId.has(id) && !result.some(row => row.id === id)) result.push({ id, quantity: 1, owned: false });
  }
  return result;
}
export function summarize(raw) {
  const rows = normalize(raw).map(row => ({ ...byId.get(row.id), ...row }));
  const buy = rows.filter(row => !row.owned);
  const owned = rows.filter(row => row.owned);
  return { rows, buy, owned, units: buy.reduce((sum, row) => sum + row.quantity, 0) };
}
export function checklist(rows) {
  const data = summarize(rows);
  if (!data.rows.length) return ['Elige un punto de partida o añade materiales a tu mesa.'];
  const tips = [];
  if (data.rows.some(row => row.category === 'papeles') && !data.rows.some(row => row.category === 'adhesivos')) {
    tips.push('Si vas a montar varias piezas, revisa si necesitas adhesivo o esquinas para fotos.');
  }
  if (data.rows.some(row => row.id === 'cutter') && !data.rows.some(row => row.id === 'base')) {
    tips.push('Antes de cortar, comprueba que dispones de una superficie de corte adecuada.');
  }
  if (data.rows.some(row => row.id === 'base') && data.rows.some(row => ['vichy', 'nubes'].includes(row.id))) {
    tips.push('La plancha mide 30 × 22 cm y el papel 30 × 30 cm. Revisa la superficie de apoyo necesaria antes de cortar.');
  }
  if (data.rows.some(row => row.reusable && !row.owned)) {
    tips.push('¿Tienes ya alguna herramienta? Márcala para retirarla de la lista de compra.');
  }
  tips.push('Las cantidades son unidades de venta elegidas por ti; no calculan cuántos proyectos puedes hacer.');
  return tips;
}
export function exportText(raw, { purchaseOnly = false } = {}) {
  const { rows, buy, owned } = summarize(raw);
  if (!rows.length) return '';
  const lines = ['MI LISTA DE MATERIALES · CREA TUS MANUALIDADES', '', 'PARA CONSULTAR / COMPRAR'];
  const describe = row => `${row.quantity} × ${row.name} (${row.unit}; ref. ${row.reference})\n${row.url}`;
  lines.push(...(buy.length ? buy.map(describe) : ['No hay artículos pendientes de comprar.']));
  if (!purchaseOnly && owned.length) lines.push('', 'YA LO TENGO · NO COMPRAR', ...owned.map(describe));
  lines.push('', 'Lista orientativa, no pedido ni cotización. Confirma cantidad, formato, precio y disponibilidad con la tienda. Fuentes del catálogo revisadas el 02/11/2026. Prototipo independiente de Samuel Acuña.');
  return lines.join('\n');
}
export function whatsappLink(raw) {
  const { buy } = summarize(raw);
  if (!buy.length) return null;
  return 'https://wa.me/34699195174?text=' + encodeURIComponent('Hola, quisiera consultar estos materiales para un proyecto. ¿Podéis confirmar formatos, disponibilidad y precio?\n\n' + exportText(raw, { purchaseOnly: true }));
}
