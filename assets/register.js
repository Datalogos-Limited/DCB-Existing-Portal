renderChrome('portfolio.html');
renderFooter();

const { load, persist, loadDocs, era, eraShort, tco, roi, diagTag, fmtGBP, esc } = window.DCB;
const allDocs = loadDocs();

let vehicles = load();
let filtered = [...vehicles];

const ERA_BUCKETS = {
  prewar:   y => y <= 1939,
  postwar:  y => y >= 1940 && y <= 1969,
  analogue: y => y >= 1970 && y <= 1989,
  modern:   y => y >= 1990,
};

function applyFilters() {
  const q = document.getElementById('fSearch').value.trim().toLowerCase();
  const cat = document.getElementById('fCategory').value;
  const eraKey = document.getElementById('fEra').value;
  const min = parseFloat(document.getElementById('fMin').value) || 0;
  const max = parseFloat(document.getElementById('fMax').value) || 0;
  const title = document.getElementById('fTitle').value;

  filtered = vehicles.filter(v => {
    if (cat !== 'all' && v.category !== cat) return false;
    if (eraKey !== 'all' && !ERA_BUCKETS[eraKey](v.year)) return false;
    if (min && v.current < min) return false;
    if (max && v.current > max) return false;
    if (title !== 'all' && v.title !== title) return false;
    if (q) {
      const hay = [v.make, v.model, v.client, v.vin, v.year, v.category, era(v.year)].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  renderTable();
  renderSummary();
}

function clearFilters() {
  document.getElementById('fSearch').value = '';
  ['fCategory','fEra','fTitle'].forEach(id => document.getElementById(id).value = 'all');
  document.getElementById('fMin').value = '0';
  document.getElementById('fMax').value = '0';
  applyFilters();
}

function monogram(v) {
  return (v.make[0] || '') + (v.model[0] || '');
}

function renderTable() {
  const body = document.getElementById('registerBody');
  document.getElementById('resultNote').textContent =
    filtered.length + ' of ' + vehicles.length + ' vehicles shown';

  if (!filtered.length) {
    body.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:40px;color:var(--muted)">No vehicles match the current criteria.</td></tr>';
    return;
  }

  body.innerHTML = filtered.map(v => {
    const r = roi(v);
    const rCls = r >= 10 ? 'delta-pos' : (r >= 0 ? 'delta-flat' : 'delta-neg');
    const titleTag = v.title === 'clear'
      ? '<span class="tag tag-clear">Clear Title</span>'
      : '<span class="tag tag-encumbered">Encumbered</span>';
    return '<tr onclick="openDrawer(\'' + v.id + '\')" style="cursor:pointer">' +
      '<td><div class="asset-cell"><div class="asset-mono">' + esc(monogram(v)) + '</div>' +
        '<div><div class="asset-name">' + esc(v.make) + ' ' + esc(v.model) + '</div>' +
        '<div class="asset-sub">' + v.year + ' · ' + esc(v.id) + '</div></div></div></td>' +
      '<td>' + eraShort(v.year) + '</td>' +
      '<td>' + esc(v.category) + '</td>' +
      '<td>' + esc(v.client) + '</td>' +
      '<td class="num figure">' + fmtGBP(v.purchase) + '</td>' +
      '<td class="num figure">' + fmtGBP(v.current) + '</td>' +
      '<td class="num ' + rCls + '">' + (r >= 0 ? '+' : '') + r.toFixed(1) + '%</td>' +
      '<td class="num figure">' + fmtGBP(tco(v)) + '</td>' +
      '<td>' + titleTag + '</td>' +
      '<td class="num"><button class="f-clear" onclick="event.stopPropagation();removeAsset(\'' + v.id + '\')" title="Remove from register">Remove</button></td>' +
    '</tr>';
  }).join('');
}

function renderSummary() {
  const total = filtered.reduce((s, v) => s + v.current, 0);
  const cost = filtered.reduce((s, v) => s + v.purchase, 0);
  const running = filtered.reduce((s, v) => s + tco(v), 0);
  const encumbered = filtered.filter(v => v.title !== 'clear').length;
  const gain = cost > 0 ? ((total - cost) / cost) * 100 : 0;
  const tcoRatio = total > 0 ? (running / total) * 100 : 0;

  document.getElementById('summaryStrip').innerHTML =
    '<div class="stat-cell"><div class="stat-lbl">Aggregate Valuation</div>' +
      '<div class="stat-val">' + fmtGBP(total) + '</div>' +
      '<div class="stat-foot"><span class="' + (gain >= 0 ? 'pos' : 'neg') + '">' + (gain >= 0 ? '+' : '') + gain.toFixed(1) + '%</span> vs acquisition basis</div></div>' +
    '<div class="stat-cell"><div class="stat-lbl">Vehicles</div>' +
      '<div class="stat-val">' + filtered.length + '</div>' +
      '<div class="stat-foot">' + new Set(filtered.map(v => v.client)).size + ' client entities</div></div>' +
    '<div class="stat-cell"><div class="stat-lbl">Annual Cost of Ownership</div>' +
      '<div class="stat-val">' + fmtGBP(running) + '</div>' +
      '<div class="stat-foot">' + tcoRatio.toFixed(2) + '% of aggregate valuation</div></div>' +
    '<div class="stat-cell"><div class="stat-lbl">Title Position</div>' +
      '<div class="stat-val">' + (filtered.length - encumbered) + ' / ' + filtered.length + '</div>' +
      '<div class="stat-foot">' + (encumbered ? '<span class="neg">' + encumbered + ' encumbered — review required</span>' : 'All titles clear, no outstanding finance') + '</div></div>';
}

/* ── DRAWER ── */
function openDrawer(id) {
  const v = vehicles.find(x => x.id === id);
  if (!v) return;
  const r = roi(v);
  const annual = tco(v);
  const c = v.costs || {};
  const holdYears = Math.max(1, Math.round((Date.now() - new Date(v.acquired || Date.now()).getTime()) / 31557600000));
  const netPosition = (v.current - v.purchase) - annual * holdYears;

  document.getElementById('drawerRef').textContent = 'Asset File · ' + v.id;
  document.getElementById('drawerBody').innerHTML =
    '<div class="overline">' + esc(v.category) + ' · ' + era(v.year) + '</div>' +
    '<div style="font-family:var(--serif);font-size:24px;line-height:1.25;margin-bottom:6px">' + v.year + ' ' + esc(v.make) + ' ' + esc(v.model) + '</div>' +
    '<div style="font-size:12px;color:var(--muted);margin-bottom:20px">Held for ' + esc(v.client) + (v.vin ? ' · Chassis ' + esc(v.vin) : '') + '</div>' +

    '<div class="spec-grid">' +
      '<div class="spec-cell"><div class="spec-lbl">Acquisition Cost</div><div class="spec-val figure">' + fmtGBP(v.purchase) + '</div></div>' +
      '<div class="spec-cell"><div class="spec-lbl">Current Valuation</div><div class="spec-val figure">' + fmtGBP(v.current) + '</div></div>' +
      '<div class="spec-cell"><div class="spec-lbl">Unrealised Return</div><div class="spec-val ' + (r >= 0 ? 'delta-pos' : 'delta-neg') + '">' + (r >= 0 ? '+' : '') + r.toFixed(1) + '%</div></div>' +
      '<div class="spec-cell"><div class="spec-lbl">Acquired</div><div class="spec-val">' + (v.acquired ? new Date(v.acquired).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—') + '</div></div>' +
    '</div>' +

    (v.details ?
      '<div class="section-rule"><div class="overline">Vehicle Specification</div></div>' +
      '<div class="spec-grid">' +
        '<div class="spec-cell"><div class="spec-lbl">Engine</div><div class="spec-val">' + esc(v.details.engine || '—') + '</div></div>' +
        '<div class="spec-cell"><div class="spec-lbl">Fuel Type</div><div class="spec-val">' + esc(v.details.fuel || '—') + '</div></div>' +
        '<div class="spec-cell"><div class="spec-lbl">Transmission</div><div class="spec-val">' + esc(v.details.transmission || '—') + '</div></div>' +
        '<div class="spec-cell"><div class="spec-lbl">Recorded Mileage</div><div class="spec-val">' + esc(v.details.mileage || '—') + '</div></div>' +
        '<div class="spec-cell" style="grid-column:1/-1"><div class="spec-lbl">Colour Specification</div><div class="spec-val">' + esc(v.details.colour || '—') + '</div></div>' +
      '</div>'
      : '') +

    (v.diagnostics ?
      '<div class="section-rule"><div class="overline">Diagnostic Assessment</div></div>' +
      '<table class="ledger">' +
        '<tr><td>Mechanical systems</td><td>' + diagTag(v.diagnostics.mechanical) + '</td></tr>' +
        '<tr><td>Electrical systems</td><td>' + diagTag(v.diagnostics.electrical) + '</td></tr>' +
        '<tr><td>Electronic systems</td><td>' + diagTag(v.diagnostics.electronic) + '</td></tr>' +
      '</table>' +
      '<div style="font-size:11px;color:var(--muted);margin-top:10px;line-height:1.7">' +
        'Assessed ' + new Date(v.diagnostics.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) +
        ' · next assessment due ' + new Date(v.diagnostics.nextDue).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + '.' +
        (v.diagnostics.notes ? '<br>' + esc(v.diagnostics.notes) : '') +
      '</div>' +
      '<div style="margin-top:12px"><a class="f-clear" style="text-decoration:none;border-bottom:1px solid var(--gold);padding-bottom:2px" href="concierge.html">Book a diagnostic assessment →</a></div>'
      :
      '<div class="section-rule"><div class="overline">Diagnostic Assessment</div></div>' +
      '<div style="font-size:12px;color:var(--muted);line-height:1.7">No assessment on file for this vehicle. ' +
      '<a class="f-clear" style="text-decoration:none;border-bottom:1px solid var(--gold);padding-bottom:2px" href="concierge.html">Book one via the Concierge Desk →</a></div>') +

    (function () {
      const vDocs = allDocs.filter(d => d.assetId === v.id);
      return '<div class="section-rule"><div class="overline">Document Vault</div></div>' +
        (vDocs.length
          ? '<table class="ledger">' + vDocs.map(d =>
              '<tr><td>' + esc(d.name) + '<br><span style="font-size:10px;color:var(--muted-2)">' + esc(d.category) + '</span></td>' +
              '<td style="font-family:var(--sans);font-size:10px;color:var(--muted)">' + new Date(d.added).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + '</td></tr>'
            ).join('') + '</table>'
          : '<div style="font-size:12px;color:var(--muted)">No documents lodged for this vehicle.</div>') +
        '<div style="margin-top:12px"><a class="f-clear" style="text-decoration:none;border-bottom:1px solid var(--gold);padding-bottom:2px" href="vault.html?asset=' + encodeURIComponent(v.id) + '">Open in Document Vault →</a></div>';
    })() +

    '<div class="section-rule"><div class="overline">Title &amp; Compliance</div></div>' +
    (v.title === 'clear'
      ? '<div style="border:1px solid var(--pos);background:var(--pos-tint);padding:14px 16px;font-size:12px;line-height:1.6">' +
        '<span class="tag tag-clear" style="margin-bottom:8px">Clear Title</span><br>' +
        'Title verified. No outstanding finance, charge, or lien registered against this vehicle. ' +
        'Documentation on file and available for family-office compliance review.</div>'
      : '<div style="border:1px solid var(--neg);background:var(--neg-tint);padding:14px 16px;font-size:12px;line-height:1.6">' +
        '<span class="tag tag-encumbered" style="margin-bottom:8px">Encumbered</span><br>' +
        'A finance agreement or lien is registered against this vehicle. Settlement confirmation is required ' +
        'before transfer of title. Contact your relationship manager for the encumbrance schedule.</div>') +

    '<div class="section-rule"><div class="overline">True Cost of Ownership — Annual</div></div>' +
    '<table class="ledger">' +
      '<tr><td>Agreed-value insurance premium</td><td>' + fmtGBP(c.insurance || 0) + '</td></tr>' +
      '<tr><td>Climate-controlled storage</td><td>' + fmtGBP(c.storage || 0) + '</td></tr>' +
      '<tr><td>Enclosed transport &amp; logistics</td><td>' + fmtGBP(c.transport || 0) + '</td></tr>' +
      '<tr><td>Scheduled &amp; major maintenance</td><td>' + fmtGBP(c.maintenance || 0) + '</td></tr>' +
      '<tr class="total"><td>Total annual carry</td><td>' + fmtGBP(annual) + '</td></tr>' +
    '</table>' +
    '<div style="font-size:11px;color:var(--muted);margin-top:10px">' +
      'Equivalent to ' + (v.current > 0 ? ((annual / v.current) * 100).toFixed(2) : '0.00') + '% of current valuation per annum. ' +
      'Estimated net position after ' + holdYears + ' yr' + (holdYears > 1 ? 's' : '') + ' of carry: ' +
      '<strong style="color:' + (netPosition >= 0 ? 'var(--pos)' : 'var(--neg)') + '">' + (netPosition >= 0 ? '+' : '−') + fmtGBP(Math.abs(netPosition)).replace('£','£') + '</strong>.' +
    '</div>' +

    (v.provenance
      ? '<div class="section-rule"><div class="overline">Provenance</div></div>' +
        '<div style="font-size:12px;line-height:1.7;color:var(--ink-2)">' + esc(v.provenance) + '</div>'
      : '');

  document.getElementById('drawerOverlay').classList.add('open');
  document.getElementById('drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  document.getElementById('drawerOverlay').classList.remove('open');
  document.getElementById('drawer').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── ADD / REMOVE ── */
function openModal() {
  document.getElementById('modalOverlay').classList.add('open');
  setTimeout(() => document.getElementById('aMake').focus(), 180);
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('assetForm').reset();
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeDrawer(); }
});

function nextId() {
  const nums = vehicles.map(v => parseInt(String(v.id).replace(/\D/g, ''), 10) || 0);
  const n = Math.max(0, ...nums) + 1;
  return 'DCB-' + String(n).padStart(4, '0');
}

function saveAsset(e) {
  e.preventDefault();
  const num = id => parseFloat(document.getElementById(id).value) || 0;
  const val = id => document.getElementById(id).value.trim();

  vehicles.unshift({
    id: nextId(),
    make: val('aMake'), model: val('aModel'),
    year: parseInt(val('aYear'), 10),
    category: document.getElementById('aCategory').value,
    client: val('aClient'), vin: val('aVin'),
    purchase: num('aPurchase'), current: num('aCurrent'),
    title: document.getElementById('aTitle').value,
    provenance: val('aProv'),
    details: {
      fuel: document.getElementById('aFuel').value,
      engine: val('aEngine'),
      transmission: val('aTrans'),
      mileage: val('aMileage'),
      colour: val('aColour'),
    },
    diagnostics: null,
    costs: { insurance: num('cIns'), storage: num('cStore'), transport: num('cTrans'), maintenance: num('cMaint') },
    acquired: new Date().toISOString().slice(0, 10),
  });
  persist(vehicles);
  closeModal();
  applyFilters();
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}

function removeAsset(id) {
  if (!confirm('Remove this vehicle from the register? This cannot be undone.')) return;
  vehicles = vehicles.filter(v => v.id !== id);
  persist(vehicles);
  applyFilters();
}

/* ── CSV EXPORT ── */
function exportCSV() {
  const rows = [['Reference','Marque','Model','Year','Era','Category','Client','Chassis','Acquisition (GBP)','Valuation (GBP)','Return %','Annual TCO (GBP)','Title']];
  filtered.forEach(v => rows.push([
    v.id, v.make, v.model, v.year, era(v.year), v.category, v.client, v.vin || '',
    v.purchase, v.current, roi(v).toFixed(1), tco(v), v.title === 'clear' ? 'Clear' : 'Encumbered'
  ]));
  const csv = rows.map(r => r.map(x => '"' + String(x).replace(/"/g, '""') + '"').join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = 'dcb-asset-register.csv';
  a.click();
}

/* ── INIT ── */
applyFilters();
if (new URLSearchParams(location.search).get('add') === '1') openModal();
