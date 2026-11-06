'use strict';

const Proposal = (() => {
  const capital = 200000000;
  const monthlyInterest = capital * 0.04;
  const months = 6;
  const reserve = capital / months;
  const volumes = [1500, 2500, 3500, 5000];
  const peso = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });
  const decimal = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const money = value => `${value < 0 ? '− ' : ''}$${peso.format(Math.abs(value))}`;
  const millions = value => `${value < 0 ? '− ' : ''}$${decimal.format(Math.abs(value) / 1000000)} M`;
  const tableMillions = value => `${value < 0 ? '− ' : ''}${decimal.format(Math.abs(value) / 1000000)}`;

  function calculate({ volume = 2500, cpa = 30000, returns = 10, overheads = 0, returnShipping = 0, period = 'monthly' } = {}) {
    const orders = period === 'monthly' ? volume : volume / months;
    const rate = returns / 100;
    const unit = 149900 * (1 - rate) - 60000 - 23000 - cpa - rate * returnShipping;
    const revenue = orders * (1 - rate) * 149900;
    const contribution = orders * unit;
    const afterInterest = (contribution - overheads - monthlyInterest) * months;
    const surplus = afterInterest - capital;
    const minimum = unit > 0 ? Math.ceil((monthlyInterest + reserve + overheads) / unit) : null;
    return { orders, unit, revenue, contribution, afterInterest, surplus, minimum, netMonthly: contribution - overheads - monthlyInterest - reserve, coverage: afterInterest / capital };
  }

  function renderScenario(cpa) {
    const rows = volumes.map(volume => {
      const r = calculate({volume, cpa});
      return `<tr${volume === 2500 ? ' class="reference"' : ''}><th scope="row">${peso.format(volume)}${volume === 2500 ? '<small class="sr-only">, escenario de referencia</small>' : ''}</th><td>${peso.format(volume * 0.9)}</td><td>${tableMillions(r.revenue)}</td><td>${tableMillions(r.contribution)}</td><td>${tableMillions(r.afterInterest)}</td><td class="${r.surplus < 0 ? 'negative' : ''}">${tableMillions(r.surplus)}<small>${r.surplus < 0 ? 'FALTANTE' : 'ANTES DE OTROS EGRESOS'}</small></td></tr>`;
    }).join('');
    document.getElementById('scenario-rows').innerHTML = rows;
    document.querySelector('#scenario-table caption').textContent = `Escenarios con CPA de ${money(cpa)}, diez por ciento de devoluciones y otros egresos sin cuantificar. Cifras en millones de COP.`;
    const reference = calculate({volume: 2500, cpa});
    document.getElementById('threshold').textContent = peso.format(reference.minimum);
    document.getElementById('threshold-note').textContent = `Con CPA ${money(cpa)} y 10% de devoluciones; antes de otros egresos.`;
    document.getElementById('scenario-summary').textContent = `A CPA ${money(cpa)} genera ${millions(reference.afterInterest)} después de intereses en seis meses. Tras devolver el capital, deja ${millions(reference.surplus)} para otros egresos y contingencias.`;
    document.querySelectorAll('[data-cpa]').forEach(button => {
      const active = Number(button.dataset.cpa) === cpa;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function readForm() {
    const ids = ['volume', 'cpa', 'returns', 'overheads', 'return-shipping'];
    if (ids.some(id => !document.getElementById(id).checkValidity() || document.getElementById(id).value === '')) return null;
    return {
      volume: Number(document.getElementById('volume').value),
      cpa: Number(document.getElementById('cpa').value),
      returns: Number(document.getElementById('returns').value),
      overheads: Number(document.getElementById('overheads').value),
      returnShipping: Number(document.getElementById('return-shipping').value),
      period: document.getElementById('period').value
    };
  }

  function renderModel() {
    const input = readForm();
    if (!input) {
      const status = document.getElementById('result-status');
      status.textContent = 'Completa los campos con valores válidos. Los resultados conservan el último escenario válido.';
      status.classList.add('shortfall');
      return;
    }
    const r = calculate(input);
    const set = (id, text) => { document.getElementById(id).textContent = text; };
    set('model-context', `${peso.format(input.volume)} PEDIDOS ${input.period === 'monthly' ? 'CADA MES' : 'EN LOS 6 MESES'} · CPA ${money(input.cpa)}`);
    set('result-surplus', millions(r.surplus));
    set('result-unit', money(r.unit));
    set('result-revenue', millions(r.revenue));
    set('result-contribution', millions(r.contribution));
    set('result-monthly', millions(r.netMonthly));
    set('result-coverage', `${decimal.format(r.coverage)}×`);
    set('result-minimum', r.minimum === null ? 'Sin margen para repago' : peso.format(r.minimum));
    set('result-status', r.surplus >= 0 ? 'Cubre el esquema bajo los supuestos cargados.' : `Faltan ${millions(-r.surplus)} para completar el repago.`);
    document.getElementById('result-status').classList.toggle('shortfall', r.surplus < 0);
    set('result-note', `Resultado proyectado con ${decimal.format(input.returns)}% de devoluciones, ${money(input.overheads)} de otros egresos mensuales y ${money(input.returnShipping)} de flete extra por devolución. No constituye utilidad neta ni solvencia histórica comprobada.`);
    set('need-ads', millions(r.orders * input.cpa));
    set('need-product', millions(r.orders * 60000));
    set('need-shipping', millions(r.orders * 23000));
    set('need-rotation', `${decimal.format(r.orders * (60000 + 23000 + input.cpa) / capital)}×`);
  }

  function init() {
    document.querySelectorAll('[data-cpa]').forEach(button => button.addEventListener('click', () => renderScenario(Number(button.dataset.cpa))));
    const form = document.getElementById('model-form');
    form.addEventListener('input', renderModel);
    form.addEventListener('change', renderModel);
    form.addEventListener('submit', event => event.preventDefault());
    form.addEventListener('reset', () => setTimeout(renderModel, 0));
    document.getElementById('print').addEventListener('click', () => window.print());
    let printDetails = [];
    window.addEventListener('beforeprint', () => {
      printDetails = Array.from(document.querySelectorAll('details')).map(element => ({element, open: element.open}));
      printDetails.forEach(({element}) => { element.open = true; });
    });
    window.addEventListener('afterprint', () => printDetails.forEach(({element, open}) => { element.open = open; }));
    renderScenario(30000);
    renderModel();
  }
  if (typeof document !== 'undefined') init();
  return { calculate };
})();
