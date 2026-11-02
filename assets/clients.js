renderChrome('clients.html');
renderFooter();

const { load, tco, fmtGBP, esc } = window.DCB;
const vehicles = load();

// Mandate profile is relationship data held by the firm; defaults cover new entities.
const PROFILES = {
  'Harrington Family Trust': { type: 'Family Trust', domicile: 'Jersey' },
  'A. Blackwood':            { type: 'Private Client', domicile: 'United Kingdom' },
  'Okafor Family Office':    { type: 'Single Family Office', domicile: 'Switzerland' },
  'R. Harrington':           { type: 'Private Client', domicile: 'United Kingdom' },
  'J. Chen':                 { type: 'Private Client', domicile: 'Singapore' },
};

const byClient = {};
vehicles.forEach(v => {
  if (!byClient[v.client]) byClient[v.client] = [];
  byClient[v.client].push(v);
});

const rows = Object.entries(byClient).map(([name, list]) => {
  const value = list.reduce((s, v) => s + v.current, 0);
  const cost = list.reduce((s, v) => s + v.purchase, 0);
  const carry = list.reduce((s, v) => s + tco(v), 0);
  const encumbered = list.filter(v => v.title !== 'clear').length;
  const p = PROFILES[name] || { type: 'Private Client', domicile: '—' };
  return { name, ...p, count: list.length, value, ret: cost > 0 ? ((value - cost) / cost) * 100 : 0, carry, encumbered };
}).sort((a, b) => b.value - a.value);

const totalV = rows.reduce((s, r) => s + r.value, 0);
document.getElementById('statStrip').innerHTML =
  '<div class="stat-cell"><div class="stat-lbl">Client Entities</div><div class="stat-val">' + rows.length + '</div>' +
    '<div class="stat-foot">' + rows.filter(r => /Office|Trust/.test(r.type)).length + ' institutional structures</div></div>' +
  '<div class="stat-cell"><div class="stat-lbl">Aggregate Valuation</div><div class="stat-val">' + fmtGBP(totalV) + '</div>' +
    '<div class="stat-foot">Across ' + vehicles.length + ' vehicles</div></div>' +
  '<div class="stat-cell"><div class="stat-lbl">Largest Mandate</div><div class="stat-val">' + (rows[0] ? fmtGBP(rows[0].value) : '—') + '</div>' +
    '<div class="stat-foot">' + (rows[0] ? esc(rows[0].name) : '') + '</div></div>' +
  '<div class="stat-cell"><div class="stat-lbl">Compliance Reviews Due</div><div class="stat-val">' + rows.filter(r => r.encumbered).length + '</div>' +
    '<div class="stat-foot">Entities holding encumbered assets</div></div>';

document.getElementById('mandateNote').textContent = rows.length + ' active mandates';

document.getElementById('clientBody').innerHTML = rows.map(r =>
  '<tr>' +
    '<td><div class="asset-cell"><div class="asset-mono">' + esc(r.name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()) + '</div>' +
      '<div class="asset-name">' + esc(r.name) + '</div></div></td>' +
    '<td>' + esc(r.type) + '</td>' +
    '<td>' + esc(r.domicile) + '</td>' +
    '<td class="num">' + r.count + '</td>' +
    '<td class="num figure">' + fmtGBP(r.value) + '</td>' +
    '<td class="num ' + (r.ret >= 10 ? 'delta-pos' : 'delta-flat') + '">+' + r.ret.toFixed(1) + '%</td>' +
    '<td class="num figure">' + fmtGBP(r.carry) + '</td>' +
    '<td>' + (r.encumbered
        ? '<span class="tag tag-review">Review — ' + r.encumbered + ' encumbered</span>'
        : '<span class="tag tag-clear">In Good Standing</span>') + '</td>' +
  '</tr>'
).join('');
