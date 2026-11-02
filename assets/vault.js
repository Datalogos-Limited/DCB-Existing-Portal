renderChrome('vault.html');
renderFooter();

const { load, loadDocs, persistDocs, esc } = window.DCB;

const vehicles = load();
let docs = loadDocs();

function vehicleLabel(id) {
  const v = vehicles.find(x => x.id === id);
  return v ? v.year + ' ' + v.make + ' ' + v.model : id;
}

/* Populate filters */
(function () {
  const opts = '<option value="all">All vehicles</option>' +
    vehicles.map(v => '<option value="' + esc(v.id) + '">' + v.year + ' ' + esc(v.make) + ' ' + esc(v.model) + '</option>').join('');
  document.getElementById('fAsset').innerHTML = opts;
  document.getElementById('dAsset').innerHTML =
    vehicles.map(v => '<option value="' + esc(v.id) + '">' + v.year + ' ' + esc(v.make) + ' ' + esc(v.model) + ' — ' + esc(v.client) + '</option>').join('');
  const pre = new URLSearchParams(location.search).get('asset');
  if (pre) document.getElementById('fAsset').value = pre;
})();

function getFiltered() {
  const q = document.getElementById('fSearch').value.trim().toLowerCase();
  const asset = document.getElementById('fAsset').value;
  const cat = document.getElementById('fCat').value.replace(/&amp;/g, '&');
  return docs.filter(d => {
    if (asset !== 'all' && d.assetId !== asset) return false;
    if (cat !== 'all' && d.category !== cat) return false;
    if (q && !d.name.toLowerCase().includes(q)) return false;
    return true;
  });
}

function renderStats() {
  const assetsWithDocs = new Set(docs.map(d => d.assetId)).size;
  const missing = vehicles.length - assetsWithDocs;
  document.getElementById('statStrip').innerHTML =
    '<div class="stat-cell"><div class="stat-lbl">Documents on File</div><div class="stat-val">' + docs.length + '</div>' +
      '<div class="stat-foot">Across ' + assetsWithDocs + ' vehicles</div></div>' +
    '<div class="stat-cell"><div class="stat-lbl">Title Documents</div><div class="stat-val">' + docs.filter(d => d.category === 'Title & Registration').length + '</div>' +
      '<div class="stat-foot">Registration &amp; encumbrance records</div></div>' +
    '<div class="stat-cell"><div class="stat-lbl">Certificates</div><div class="stat-val">' + docs.filter(d => /Certificat|Certification/.test(d.category)).length + '</div>' +
      '<div class="stat-foot">Insurance, valuation &amp; marque certification</div></div>' +
    '<div class="stat-cell"><div class="stat-lbl">Vehicles Without Papers</div><div class="stat-val">' + missing + '</div>' +
      '<div class="stat-foot">' + (missing ? '<span class="neg">Documentation outstanding</span>' : 'Every vehicle has documents lodged') + '</div></div>';
}

function renderDocs() {
  const list = getFiltered();
  document.getElementById('docNote').textContent = list.length + ' of ' + docs.length + ' documents shown';
  document.getElementById('docBody').innerHTML = list.length ? list.map(d =>
    '<tr>' +
      '<td><div class="doc-cell"><div class="doc-icon"></div>' +
        '<div><div class="doc-name">' + esc(d.name) + '</div>' +
        '<div class="asset-sub">' + esc(d.id) + '</div></div></div></td>' +
      '<td>' + esc(vehicleLabel(d.assetId)) + '</td>' +
      '<td>' + esc(d.category) + '</td>' +
      '<td>' + new Date(d.added).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + '</td>' +
      '<td>' + (d.data
          ? '<span class="tag tag-clear">Digital Copy Held</span>'
          : '<span class="tag tag-neutral">Physical Custody</span>') + '</td>' +
      '<td class="num">' +
        (d.data ? '<a class="f-clear" style="text-decoration:none" href="' + d.data + '" download="' + esc(d.name) + '">Download</a> ' : '') +
        (d.seeded ? '' : '<button class="f-clear" onclick="removeDoc(\'' + esc(d.id) + '\')">Remove</button>') +
      '</td>' +
    '</tr>'
  ).join('') : '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--muted)">No documents match the current criteria.</td></tr>';
  renderStats();
}

function clearDocFilters() {
  document.getElementById('fSearch').value = '';
  document.getElementById('fAsset').value = 'all';
  document.getElementById('fCat').value = 'all';
  renderDocs();
}

/* ── Upload ── */
function openUpload() { document.getElementById('modalOverlay').classList.add('open'); }
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('docForm').reset();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function saveDoc(e) {
  e.preventDefault();
  const file = document.getElementById('dFile').files[0];
  if (!file) return;

  const finish = (dataUrl) => {
    docs.unshift({
      id: 'DOC-' + String(Date.now()).slice(-6),
      assetId: document.getElementById('dAsset').value,
      name: file.name,
      category: document.getElementById('dCat').value,
      added: new Date().toISOString().slice(0, 10),
      data: dataUrl || null,
    });
    persistDocs(docs);
    closeModal();
    renderDocs();
    const t = document.getElementById('toast');
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2400);
  };

  if (file.size <= 1024 * 1024) {
    const reader = new FileReader();
    reader.onload = () => finish(reader.result);
    reader.onerror = () => finish(null);
    reader.readAsDataURL(file);
  } else {
    finish(null);
  }
}

function removeDoc(id) {
  if (!confirm('Remove this document from the vault?')) return;
  docs = docs.filter(d => d.id !== id);
  persistDocs(docs);
  renderDocs();
}

renderDocs();
