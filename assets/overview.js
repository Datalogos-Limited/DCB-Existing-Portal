renderChrome('index.html');
renderFooter();

const { load, tco, roi, fmtGBP, esc } = window.DCB;
const IS_DARK = document.documentElement.dataset.theme === 'dark';
const LINE = IS_DARK ? '#C4A254' : '#1C2B4A';
const FILL = IS_DARK ? 'rgba(196,162,84,0.07)' : 'rgba(28,43,74,0.05)';
const AXIS = IS_DARK ? '#64666D' : '#989A9F';
const GRID = IS_DARK ? 'rgba(233,231,225,0.06)' : 'rgba(26,28,32,0.05)';
const EDGE = IS_DARK ? '#26282E' : '#DDDAD1';
const DONUT_BORDER = IS_DARK ? '#16171B' : '#FFFFFF';
const vehicles = load();

document.getElementById('pageDate').textContent =
  new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) +
  ' · Position summary for all client mandates';

/* ── STATS ── */
const total = vehicles.reduce((s, v) => s + v.current, 0);
const basis = vehicles.reduce((s, v) => s + v.purchase, 0);
const running = vehicles.reduce((s, v) => s + tco(v), 0);
const clients = new Set(vehicles.map(v => v.client)).size;
const encumbered = vehicles.filter(v => v.title !== 'clear').length;
const gain = basis > 0 ? ((total - basis) / basis) * 100 : 0;

document.getElementById('statStrip').innerHTML =
  '<div class="stat-cell"><div class="stat-lbl">Assets Under Management</div>' +
    '<div class="stat-val">' + fmtGBP(total) + '</div>' +
    '<div class="stat-foot"><span class="pos">+' + gain.toFixed(1) + '%</span> vs acquisition basis</div></div>' +
  '<div class="stat-cell"><div class="stat-lbl">Vehicles</div>' +
    '<div class="stat-val">' + vehicles.length + '</div>' +
    '<div class="stat-foot">Across ' + clients + ' client entities</div></div>' +
  '<div class="stat-cell"><div class="stat-lbl">Annual Cost of Ownership</div>' +
    '<div class="stat-val">' + fmtGBP(running) + '</div>' +
    '<div class="stat-foot">' + (total > 0 ? ((running/total)*100).toFixed(2) : '0.00') + '% of AUM per annum</div></div>' +
  '<div class="stat-cell"><div class="stat-lbl">Title Position</div>' +
    '<div class="stat-val">' + (vehicles.length - encumbered) + ' / ' + vehicles.length + '</div>' +
    '<div class="stat-foot">' + (encumbered ? '<span class="neg">' + encumbered + ' encumbered</span>' : 'All titles clear') + '</div></div>';

/* ── HOLDINGS (top 6 by valuation) ── */
const topHoldings = [...vehicles].sort((a, b) => b.current - a.current).slice(0, 6);
document.getElementById('holdingsBody').innerHTML = topHoldings.map(v => {
  const r = roi(v);
  return '<tr onclick="location.href=\'portfolio.html\'" style="cursor:pointer">' +
    '<td><div class="asset-cell"><div class="asset-mono">' + esc((v.make[0]||'') + (v.model[0]||'')) + '</div>' +
      '<div><div class="asset-name">' + esc(v.make) + ' ' + esc(v.model) + '</div>' +
      '<div class="asset-sub">' + v.year + '</div></div></div></td>' +
    '<td>' + esc(v.client) + '</td>' +
    '<td class="num figure">' + fmtGBP(v.current) + '</td>' +
    '<td class="num ' + (r >= 10 ? 'delta-pos' : 'delta-flat') + '">+' + r.toFixed(1) + '%</td>' +
    '<td class="num figure">' + fmtGBP(tco(v)) + '</td>' +
    '<td>' + (v.title === 'clear' ? '<span class="tag tag-clear">Clear</span>' : '<span class="tag tag-encumbered">Encumbered</span>') + '</td>' +
  '</tr>';
}).join('');

/* ── ALLOCATION ── */
const PALETTE = ['#1C2B4A', '#9C7E33', '#5B6B85', '#6E7B6A', '#8A8574', '#B0A98F'];
const byMake = {};
vehicles.forEach(v => { byMake[v.make] = (byMake[v.make] || 0) + v.current; });
const entries = Object.entries(byMake).sort((a, b) => b[1] - a[1]);
const topAlloc = entries.slice(0, 5);
const otherSum = entries.slice(5).reduce((s, e) => s + e[1], 0);
if (otherSum > 0) topAlloc.push(['Other', otherSum]);

document.getElementById('donutBrands').textContent = entries.length;
document.getElementById('allocRows').innerHTML = topAlloc.map((e, i) =>
  '<div class="alloc-row"><div class="alloc-name"><span class="alloc-swatch" style="background:' + PALETTE[i % PALETTE.length] + '"></span>' + esc(e[0]) + '</div>' +
  '<div class="alloc-pct">' + (total > 0 ? ((e[1] / total) * 100).toFixed(1) : 0) + '%</div></div>'
).join('');

new Chart(document.getElementById('donutChart').getContext('2d'), {
  type: 'doughnut',
  data: {
    labels: topAlloc.map(e => e[0]),
    datasets: [{
      data: topAlloc.map(e => e[1]),
      backgroundColor: topAlloc.map((_, i) => PALETTE[i % PALETTE.length]),
      borderColor: DONUT_BORDER,
      borderWidth: 2,
    }]
  },
  options: {
    cutout: '71%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1C2B4A', borderWidth: 0, cornerRadius: 2,
        titleColor: '#fff', bodyColor: '#D8CBA4', padding: 10,
        callbacks: { label: ctx => '  ' + fmtGBP(ctx.parsed) }
      }
    },
    animation: { duration: 500 }
  }
});

/* ── HISTORY CHART ── */
const historyData = {
  '10Y': { labels: ['2016','2017','2018','2019','2020','2021','2022','2023','2024','2025','2026'], data: [820, 870, 940, 1050, 980, 1280, 1550, 1750, 1980, 2180, 2400] },
  '5Y':  { labels: ['Jan 21','Jul 21','Jan 22','Jul 22','Jan 23','Jul 23','Jan 24','Jul 24','Jan 25','Jul 25','Jan 26'], data: [1280, 1380, 1550, 1640, 1750, 1840, 1980, 2060, 2180, 2290, 2400] },
  '3Y':  { labels: ['Jan 23','Apr 23','Jul 23','Oct 23','Jan 24','Apr 24','Jul 24','Oct 24','Jan 25','Apr 25','Jan 26'], data: [1750, 1790, 1840, 1890, 1980, 2020, 2060, 2110, 2180, 2240, 2400] },
  '1Y':  { labels: ['Jun 25','Jul 25','Aug 25','Sep 25','Oct 25','Nov 25','Dec 25','Jan 26','Feb 26','Mar 26','Jun 26'], data: [2180, 2200, 2220, 2250, 2270, 2300, 2320, 2360, 2370, 2390, 2400] }
};

let historyChart;
function buildHistory(range) {
  const d = historyData[range];
  const ctx = document.getElementById('historyChart').getContext('2d');
  if (historyChart) historyChart.destroy();
  historyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: d.labels,
      datasets: [{
        data: d.data,
        borderColor: LINE,
        borderWidth: 1.8,
        backgroundColor: FILL,
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: '#9C7E33',
        pointBorderColor: '#fff',
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1C2B4A', borderWidth: 0, cornerRadius: 2,
          titleColor: '#B8BFCB', bodyColor: '#D8CBA4', padding: 10,
          callbacks: { label: ctx => '  £' + ctx.parsed.y + 'k' }
        }
      },
      scales: {
        x: { grid: { display: false }, border: { color: EDGE }, ticks: { color: AXIS, font: { size: 10 }, maxRotation: 0 } },
        y: { position: 'right', grid: { color: GRID, drawTicks: false }, border: { display: false }, ticks: { color: AXIS, font: { size: 10 }, callback: v => '£' + v + 'k' } }
      },
      animation: { duration: 300 }
    }
  });
}

function setRange(range, btn) {
  document.querySelectorAll('.time-link').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  buildHistory(range);
}

buildHistory('10Y');
