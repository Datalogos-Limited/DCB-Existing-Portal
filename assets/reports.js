renderChrome('reports.html');
renderFooter();

const { load, era, tco, roi, fmtGBP, esc } = window.DCB;
const vehicles = load();

const now = new Date();
document.getElementById('stmtDate').textContent = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
document.getElementById('refNo').textContent = 'DCB-PS-' + now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

const total = vehicles.reduce((s, v) => s + v.current, 0);
const basis = vehicles.reduce((s, v) => s + v.purchase, 0);
const carry = vehicles.reduce((s, v) => s + tco(v), 0);
const encumbered = vehicles.filter(v => v.title !== 'clear');

document.getElementById('statStrip').innerHTML =
  '<div class="stat-cell"><div class="stat-lbl">Aggregate Valuation</div><div class="stat-val">' + fmtGBP(total) + '</div></div>' +
  '<div class="stat-cell"><div class="stat-lbl">Acquisition Basis</div><div class="stat-val">' + fmtGBP(basis) + '</div></div>' +
  '<div class="stat-cell"><div class="stat-lbl">Unrealised Gain</div><div class="stat-val" style="color:var(--pos)">' + fmtGBP(total - basis) + '</div></div>' +
  '<div class="stat-cell"><div class="stat-lbl">Annual Cost of Ownership</div><div class="stat-val">' + fmtGBP(carry) + '</div></div>';

/* By category */
const cats = {};
vehicles.forEach(v => {
  if (!cats[v.category]) cats[v.category] = { n: 0, cost: 0, val: 0, carry: 0 };
  const c = cats[v.category];
  c.n++; c.cost += v.purchase; c.val += v.current; c.carry += tco(v);
});
document.getElementById('catBody').innerHTML = Object.entries(cats).sort((a, b) => b[1].val - a[1].val).map(([name, c]) =>
  '<tr><td style="font-weight:600">' + esc(name) + '</td>' +
  '<td class="num">' + c.n + '</td>' +
  '<td class="num figure">' + fmtGBP(c.cost) + '</td>' +
  '<td class="num figure">' + fmtGBP(c.val) + '</td>' +
  '<td class="num delta-pos">+' + (c.cost > 0 ? (((c.val - c.cost) / c.cost) * 100).toFixed(1) : '0.0') + '%</td>' +
  '<td class="num figure">' + fmtGBP(c.carry) + '</td>' +
  '<td class="num">' + (total > 0 ? ((c.val / total) * 100).toFixed(1) : 0) + '%</td></tr>'
).join('');

/* Classic & Vintage by era */
const classics = vehicles.filter(v => v.category === 'Classic & Vintage');
const eras = {};
classics.forEach(v => {
  const e = era(v.year);
  if (!eras[e]) eras[e] = { n: 0, cost: 0, val: 0 };
  eras[e].n++; eras[e].cost += v.purchase; eras[e].val += v.current;
});
const ERA_ORDER = ['Pre-War & Vintage Veterans', 'Post-War Blue-Chip Legends', 'Analogue Supercars & Poster Icons', 'Modern Collectibles'];
document.getElementById('eraBody').innerHTML = ERA_ORDER.filter(e => eras[e]).map(e => {
  const d = eras[e];
  return '<tr><td style="font-weight:600">' + esc(e) + '</td>' +
    '<td class="num">' + d.n + '</td>' +
    '<td class="num figure">' + fmtGBP(d.val) + '</td>' +
    '<td class="num delta-pos">+' + (d.cost > 0 ? (((d.val - d.cost) / d.cost) * 100).toFixed(1) : '0.0') + '%</td></tr>';
}).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:28px">No classic or vintage holdings.</td></tr>';

/* TCO summary */
const lines = { insurance: 'Agreed-value insurance premiums', storage: 'Climate-controlled storage', transport: 'Enclosed transport & logistics', maintenance: 'Scheduled & major maintenance' };
const sums = { insurance: 0, storage: 0, transport: 0, maintenance: 0 };
vehicles.forEach(v => { Object.keys(sums).forEach(k => { sums[k] += (v.costs && v.costs[k]) || 0; }); });
document.getElementById('tcoBody').innerHTML = Object.entries(lines).map(([k, label]) =>
  '<tr><td>' + label + '</td>' +
  '<td class="num figure">' + fmtGBP(sums[k]) + '</td>' +
  '<td class="num">' + (carry > 0 ? ((sums[k] / carry) * 100).toFixed(1) : 0) + '%</td></tr>'
).join('') +
'<tr><td style="font-weight:700">Total annual carry</td><td class="num figure" style="font-weight:700">' + fmtGBP(carry) + '</td>' +
'<td class="num" style="font-weight:700">' + (total > 0 ? ((carry / total) * 100).toFixed(2) : 0) + '% of AUM</td></tr>';

/* Title schedule */
document.getElementById('titleBody').innerHTML = vehicles.map(v =>
  '<tr><td style="font-weight:600">' + v.year + ' ' + esc(v.make) + ' ' + esc(v.model) + '</td>' +
  '<td>' + esc(v.client) + '</td>' +
  '<td class="num figure">' + fmtGBP(v.current) + '</td>' +
  '<td>' + (v.title === 'clear' ? '<span class="tag tag-clear">Clear Title</span>' : '<span class="tag tag-encumbered">Encumbered</span>') + '</td>' +
  '<td style="color:var(--muted)">' + (v.title === 'clear' ? 'None — documentation on file' : 'Settlement confirmation before transfer') + '</td></tr>'
).join('');
