renderChrome('concierge.html');
renderFooter();

const { load, esc } = window.DCB;
const REQ_KEY = 'dcb_requests_v1';

const vehicles = load();
let currentService = '';

function loadRequests() {
  try {
    const raw = localStorage.getItem(REQ_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}
function persistRequests(list) {
  try { localStorage.setItem(REQ_KEY, JSON.stringify(list)); } catch (e) {}
}

let requests = loadRequests();

function openRequest(service) {
  currentService = service;
  document.getElementById('reqTitle').textContent = service;
  const sel = document.getElementById('rVehicle');
  sel.innerHTML = '<option value="">General — not vehicle specific</option>' +
    vehicles.map(v => '<option value="' + esc(v.id) + '">' + v.year + ' ' + esc(v.make) + ' ' + esc(v.model) + ' — ' + esc(v.client) + '</option>').join('');
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('reqForm').reset();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function submitRequest(e) {
  e.preventDefault();
  const vid = document.getElementById('rVehicle').value;
  const v = vehicles.find(x => x.id === vid);
  requests.unshift({
    ref: 'INS-' + String(Date.now()).slice(-6),
    service: currentService,
    vehicle: v ? (v.year + ' ' + v.make + ' ' + v.model) : 'General',
    notes: document.getElementById('rNotes').value.trim(),
    date: new Date().toISOString(),
    status: 'Received',
  });
  persistRequests(requests);
  closeModal();
  renderLog();
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}

function withdrawRequest(ref) {
  if (!confirm('Withdraw this instruction?')) return;
  requests = requests.filter(r => r.ref !== ref);
  persistRequests(requests);
  renderLog();
}

function renderLog() {
  document.getElementById('logNote').textContent = requests.length
    ? requests.length + ' instruction' + (requests.length > 1 ? 's' : '') + ' on file'
    : 'No instructions on file';
  document.getElementById('logBody').innerHTML = requests.length ? requests.map(r =>
    '<tr>' +
      '<td style="font-weight:600">' + esc(r.ref) + '</td>' +
      '<td>' + esc(r.service) + '</td>' +
      '<td>' + esc(r.vehicle) + '</td>' +
      '<td>' + new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + '</td>' +
      '<td><span class="tag tag-navy">' + esc(r.status) + '</span></td>' +
      '<td class="num"><button class="f-clear" onclick="withdrawRequest(\'' + esc(r.ref) + '\')">Withdraw</button></td>' +
    '</tr>'
  ).join('') : '<tr><td colspan="6" style="text-align:center;padding:36px;color:var(--muted)">Submitted instructions will appear here.</td></tr>';
}

renderLog();
