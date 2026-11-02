renderChrome('intel.html');
renderFooter();

const { fmtGBP, esc } = window.DCB;

/* ── Seed items: shown immediately, replaced by live RSS where available ── */
const SEED_ITEMS = [
  {
    id: 'i1', type: 'auction_result', source: 'bat', sourceName: 'Bring a Trailer',
    title: '1987 Ferrari F40 pre-production prototype sells for a record £3.8m',
    summary: 'One of only three confirmed pre-series cars, carrying factory test stamps and the original Fiorano set-up sheets. Bidding opened at £800,000 and advanced sharply in the final ninety seconds.',
    url: 'https://bringatrailer.com', time: '1 hour ago', soldPrice: 3800000,
  },
  {
    id: 'i2', type: 'market_report', source: 'hagerty', sourceName: 'Hagerty',
    title: 'Collector market rating reaches all-time high; values up 18% year to date',
    summary: 'The market rating reached 68 this week, its highest recorded level. Post-war Italian sports cars lead the advance, while pre-war Bentley and Bugatti attract renewed institutional interest.',
    url: 'https://www.hagerty.com/media', time: '2 hours ago',
  },
  {
    id: 'i3', type: 'auction_result', source: 'bat', sourceName: 'Bring a Trailer',
    title: '1994 McLaren F1, chassis 044, achieves £15.2m at no reserve',
    summary: 'One of sixty-four road-going examples, in LM specification with documented history. The no-reserve format attracted 847 registered bidders across twenty-three jurisdictions.',
    url: 'https://bringatrailer.com', time: '3 hours ago', soldPrice: 15200000,
  },
  {
    id: 'i4', type: 'news', source: 'evo', sourceName: 'Evo',
    title: 'Tourbillon programme delays lift pre-owned Chiron values twelve per cent',
    summary: 'With deliveries now expected in late 2027, collectors seeking current-generation Bugatti ownership are turning to low-mileage Chiron Super Sport examples. Dealers report waiting lists forming.',
    url: 'https://www.evo.co.uk', time: '5 hours ago',
  },
  {
    id: 'i5', type: 'auction_result', source: 'bat', sourceName: 'Bring a Trailer',
    title: '1971 Lamborghini Miura SV, matching numbers, reaches £2.7m',
    summary: 'One of 150 SV-specification cars, retaining the early production details prized by collectors. Consigned from a Swiss private collection with continuous ownership history.',
    url: 'https://bringatrailer.com', time: '12 hours ago', soldPrice: 2700000,
  },
  {
    id: 'i6', type: 'market_report', source: 'hagerty', sourceName: 'Hagerty',
    title: 'Ferrari 250 GTO exceeds £50m at Villa d\'Este — a European auction record',
    summary: 'Chassis 3757GT, a 1962 example with Scuderia entry history, exceeded all pre-sale estimates to become the most valuable motor car sold at public auction in Europe.',
    url: 'https://www.hagerty.com/media', time: '1 day ago',
  },
  {
    id: 'i7', type: 'news', source: 'evo', sourceName: 'Evo',
    title: 'Porsche 911 GT1 Strassenversion: the sub-£10m window may be closing',
    summary: 'With twenty-one road cars built and two recent private sales understood to be above £9.5m, analysts suggest the model is approaching a step-change in valuation.',
    url: 'https://www.evo.co.uk', time: '3 days ago',
  },
  {
    id: 'i8', type: 'market_report', source: 'hagerty', sourceName: 'Hagerty',
    title: 'The analogue-era premium: 1990–2005 production supercars outperform',
    summary: 'Production supercars from the late analogue era are showing fifteen to twenty-five per cent annualised returns over five years, outpacing broad equity indices on a risk-adjusted basis.',
    url: 'https://www.hagerty.com/media', time: '2 days ago',
  },
];

let ITEMS = [...SEED_ITEMS];

/* ── Live RSS via rss2json (no key required) ── */
const RSS2JSON = 'https://api.rss2json.com/v1/api.json?count=12&rss_url=';
const FEEDS = [
  { url: 'https://bringatrailer.com/feed/', source: 'bat', sourceName: 'Bring a Trailer', type: 'auction_result' },
  { url: 'https://www.hagerty.com/media/feed/', source: 'hagerty', sourceName: 'Hagerty', type: 'market_report' },
];

function stripHtml(h) { return String(h || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, '').trim(); }
function timeAgo(d) {
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 3600) return Math.max(1, Math.floor(s / 60)) + ' minutes ago';
  if (s < 86400) return Math.floor(s / 3600) + ' hours ago';
  return Math.floor(s / 86400) + ' days ago';
}
function parseSold(t, b) {
  const m = (t + ' ' + b).match(/sold\s+for\s+\$?([\d,]+)/i);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : null;
}

async function fetchLive() {
  const results = await Promise.allSettled(FEEDS.map(f =>
    fetch(RSS2JSON + encodeURIComponent(f.url)).then(r => r.json()).then(d => ({ f, d }))
  ));
  const live = [];
  results.forEach(res => {
    if (res.status !== 'fulfilled') return;
    const { f, d } = res.value;
    if (d.status !== 'ok' || !d.items) return;
    d.items.forEach((item, i) => {
      const sold = parseSold(item.title || '', item.description || '');
      live.push({
        id: 'live-' + f.source + '-' + i, live: true,
        type: sold ? 'auction_result' : f.type,
        source: f.source, sourceName: f.sourceName,
        title: stripHtml(item.title || ''),
        summary: stripHtml(item.description || '').slice(0, 300),
        url: item.link || 'intel.js',
        time: timeAgo(new Date(item.pubDate)),
        soldPrice: sold || undefined,
        currency: sold ? 'USD' : undefined,
      });
    });
  });
  if (live.length) { ITEMS = live; renderFeed(); }
}

/* ── Render ── */
function typeTag(t) {
  if (t === 'auction_result') return '<span class="tag tag-clear">Auction Result</span>';
  if (t === 'market_report') return '<span class="tag tag-navy">Market Report</span>';
  return '<span class="tag tag-neutral">News</span>';
}

function getFiltered() {
  const q = document.getElementById('fSearch').value.trim().toLowerCase();
  const type = document.getElementById('fType').value;
  const src = document.getElementById('fSource').value;
  return ITEMS.filter(it => {
    if (type !== 'all' && it.type !== type) return false;
    if (src !== 'all' && it.source !== src) return false;
    if (q && !(it.title + ' ' + (it.summary || '')).toLowerCase().includes(q)) return false;
    return true;
  });
}

function renderFeed() {
  const items = getFiltered();
  document.getElementById('feedNote').textContent = items.length + ' items' + (ITEMS[0] && ITEMS[0].live ? ' · live' : '');
  document.getElementById('feedList').innerHTML = items.length ? items.map(it =>
    '<div class="feed-item" onclick="openItem(\'' + it.id + '\')">' +
      '<div class="feed-meta">' + typeTag(it.type) +
        '<span class="src-name">' + esc(it.sourceName) + '</span>' +
        '<span class="src-time">' + esc(it.time) + '</span>' +
        (it.live ? '<span class="src-time" style="color:var(--pos);font-weight:700">LIVE</span>' : '') +
      '</div>' +
      '<div class="feed-title">' + esc(it.title) + '</div>' +
      '<div class="feed-summary">' + esc((it.summary || '').slice(0, 200)) + ((it.summary || '').length > 200 ? '…' : '') + '</div>' +
      (it.soldPrice ? '<div class="feed-hammer">Hammer: ' + fmtGBP(it.soldPrice) + (it.currency === 'USD' ? ' (USD)' : '') + '</div>' : '') +
    '</div>'
  ).join('') : '<div style="padding:44px;text-align:center;color:var(--muted)">No items match the current criteria.</div>';
}

function clearIntelFilters() {
  document.getElementById('fSearch').value = '';
  document.getElementById('fType').value = 'all';
  document.getElementById('fSource').value = 'all';
  renderFeed();
}

function refreshFeed(btn) {
  btn.disabled = true; btn.textContent = 'Refreshing…';
  fetchLive().finally(() => { btn.disabled = false; btn.textContent = 'Refresh'; });
}

/* ── Drawer ── */
function openItem(id) {
  const it = ITEMS.find(x => x.id === id);
  if (!it) return;
  document.getElementById('drawerRef').textContent = it.sourceName + ' · ' + it.time;
  document.getElementById('drawerBody').innerHTML =
    '<div style="margin-bottom:14px">' + typeTag(it.type) + '</div>' +
    '<div style="font-family:var(--serif);font-size:22px;line-height:1.4;margin-bottom:16px">' + esc(it.title) + '</div>' +
    (it.soldPrice
      ? '<div style="border:1px solid var(--pos);background:var(--pos-tint);padding:12px 16px;margin-bottom:18px;font-size:13px;font-weight:700;color:var(--pos)">Hammer price: ' + fmtGBP(it.soldPrice) + (it.currency === 'USD' ? ' (USD)' : '') + '</div>'
      : '') +
    '<div style="font-size:13px;line-height:1.8;color:var(--ink-2);margin-bottom:26px">' + esc(it.summary || '') + '</div>' +
    '<a class="btn-navy" style="display:block;text-align:center;text-decoration:none" href="' + esc(it.url) + '" target="_blank" rel="noopener">Read Full Article</a>';
  document.getElementById('drawerOverlay').classList.add('open');
  document.getElementById('drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  document.getElementById('drawerOverlay').classList.remove('open');
  document.getElementById('drawer').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

/* ── Init ── */
renderFeed();
fetchLive();
