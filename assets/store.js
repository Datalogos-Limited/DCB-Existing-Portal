/* ═══════════════════════════════════════════════════════════
   DREAM CAR BROKERS — shared data layer (localStorage)
   ═══════════════════════════════════════════════════════════ */

(function () {
  const STORE_KEY = 'dcb_vehicles_v3';
  const DOCS_KEY = 'dcb_docs_v1';

  // Annual costs in GBP: agreed-value insurance, climate-controlled
  // storage, enclosed transport, scheduled maintenance.
  const SEED = [
    {
      id: 'DCB-0001', make: 'Bugatti', model: 'Type 57 Ventoux', year: 1934,
      category: 'Classic & Vintage', client: 'Harrington Family Trust',
      vin: '57231', purchase: 1100000, current: 1450000,
      title: 'clear', provenance: 'Matching numbers. Full history file from new; three owners. Concours restoration 2019, Mullin Collection provenance.',
      costs: { insurance: 14500, storage: 9600, transport: 6200, maintenance: 18500 },
      acquired: '2021-03-12',
      details: { fuel: 'Petrol', engine: '3.3 L straight-eight', transmission: '4-speed manual', mileage: '38,400 km', colour: 'Bleu de France over grey' },
      diagnostics: { date: '2026-05-14', mechanical: 'good', electrical: 'advisory', electronic: 'na', nextDue: '2026-11-14', notes: 'Dynamo output marginally low; re-test at next service. Magneto and fuel system in excellent order.' }
    },
    {
      id: 'DCB-0002', make: 'Mercedes-Benz', model: '300 SL Roadster', year: 1957,
      category: 'Classic & Vintage', client: 'A. Blackwood',
      vin: '198.042-7500186', purchase: 1050000, current: 1350000,
      title: 'clear', provenance: 'Factory data card. DB-progressive restoration, Rudge wheels, hardtop retained.',
      costs: { insurance: 11800, storage: 8400, transport: 5400, maintenance: 14200 },
      acquired: '2020-09-28',
      details: { fuel: 'Petrol', engine: '3.0 L M198 straight-six, mechanical injection', transmission: '4-speed manual', mileage: '61,200 km', colour: 'Silver over red leather' },
      diagnostics: { date: '2026-03-02', mechanical: 'good', electrical: 'good', electronic: 'na', nextDue: '2026-09-02', notes: 'Injection pump calibrated. No advisories.' }
    },
    {
      id: 'DCB-0003', make: 'Ferrari', model: '275 GTB/4', year: 1967,
      category: 'Classic & Vintage', client: 'Okafor Family Office',
      vin: '10347', purchase: 2150000, current: 2680000,
      title: 'clear', provenance: 'Ferrari Classiche certified, red book. Long-nose, torque-tube example.',
      costs: { insurance: 22400, storage: 9600, transport: 7800, maintenance: 21000 },
      acquired: '2022-01-18',
      details: { fuel: 'Petrol', engine: '3.3 L Colombo V12, six carburettors', transmission: '5-speed manual transaxle', mileage: '44,800 km', colour: 'Rosso Corsa over tan' },
      diagnostics: { date: '2026-06-20', mechanical: 'good', electrical: 'good', electronic: 'na', nextDue: '2026-12-20', notes: 'Compression even across all twelve cylinders. Carburettors balanced.' }
    },
    {
      id: 'DCB-0004', make: 'Lamborghini', model: 'Countach LP400 Periscopio', year: 1976,
      category: 'Classic & Vintage', client: 'R. Harrington',
      vin: '1120148', purchase: 750000, current: 1100000,
      title: 'financed', provenance: 'One of 158 Periscopio cars. Restoration by factory Polo Storico, 2023.',
      costs: { insurance: 9800, storage: 8400, transport: 5200, maintenance: 16400 },
      acquired: '2023-05-02',
      details: { fuel: 'Petrol', engine: '4.0 L V12, six Weber carburettors', transmission: '5-speed manual', mileage: '29,300 km', colour: 'Giallo Fly over nero' },
      diagnostics: { date: '2026-01-15', mechanical: 'advisory', electrical: 'good', electronic: 'na', nextDue: '2026-07-15', notes: 'Clutch wear noted at 60%; replacement advised within 1,000 km. Otherwise excellent.' }
    },
    {
      id: 'DCB-0005', make: 'Ferrari', model: 'F40', year: 1989,
      category: 'Classic & Vintage', client: 'A. Blackwood',
      vin: 'ZFFGJ34B000083620', purchase: 1400000, current: 2050000,
      title: 'clear', provenance: 'Non-cat, non-adjust European specification. 11,200 km. Classiche certified.',
      costs: { insurance: 16800, storage: 8400, transport: 5600, maintenance: 12800 },
      acquired: '2021-11-05',
      details: { fuel: 'Petrol', engine: '2.9 L twin-turbo V8', transmission: '5-speed manual', mileage: '11,200 km', colour: 'Rosso Corsa over Stoffa Vigogna' },
      diagnostics: { date: '2026-04-08', mechanical: 'good', electrical: 'good', electronic: 'good', nextDue: '2026-10-08', notes: 'Turbochargers within specification. Fuel bladders replaced 2024, next due 2029.' }
    },
    {
      id: 'DCB-0006', make: 'McLaren', model: 'F1', year: 1994,
      category: 'Supercar', client: 'Okafor Family Office',
      vin: 'SA9AB5AC5R1048044', purchase: 12500000, current: 15800000,
      title: 'clear', provenance: 'Chassis 044. MSO service history throughout. Original books, tool roll, luggage.',
      costs: { insurance: 96000, storage: 14400, transport: 18500, maintenance: 62000 },
      acquired: '2019-06-14',
      details: { fuel: 'Petrol', engine: '6.1 L BMW S70/2 V12', transmission: '6-speed manual', mileage: '17,900 km', colour: 'Magnesium Silver over black and grey' },
      diagnostics: { date: '2026-06-30', mechanical: 'good', electrical: 'good', electronic: 'advisory', nextDue: '2026-12-30', notes: 'ECU battery backup approaching end of life; MSO replacement scheduled. All other systems nominal.' }
    },
    {
      id: 'DCB-0007', make: 'Porsche', model: '911 Carrera RS 3.8 (964)', year: 1993,
      category: 'Supercar', client: 'J. Chen',
      vin: 'WP0ZZZ96ZPS497104', purchase: 1150000, current: 1420000,
      title: 'clear', provenance: 'One of 55 examples. Original paint-to-sample Maritime Blue.',
      costs: { insurance: 9200, storage: 7200, transport: 4400, maintenance: 9800 },
      acquired: '2022-08-22',
      details: { fuel: 'Petrol', engine: '3.8 L air-cooled flat-six', transmission: '5-speed manual', mileage: '52,600 km', colour: 'Maritime Blue over black' },
      diagnostics: { date: '2026-02-11', mechanical: 'good', electrical: 'good', electronic: 'good', nextDue: '2026-08-11', notes: 'No advisories. Valve clearances set at last service.' }
    },
    {
      id: 'DCB-0008', make: 'Ferrari', model: 'Enzo', year: 2003,
      category: 'Hypercar', client: 'A. Blackwood',
      vin: 'ZFFCZ56B000132864', purchase: 1800000, current: 2400000,
      title: 'clear', provenance: 'Rosso Corsa over Nero. 4,100 miles, two owners. Classiche red book.',
      costs: { insurance: 18200, storage: 8400, transport: 6800, maintenance: 15600 },
      acquired: '2020-02-10',
      details: { fuel: 'Petrol', engine: '6.0 L F140B V12', transmission: '6-speed automated manual (F1)', mileage: '6,600 km', colour: 'Rosso Corsa over nero' },
      diagnostics: { date: '2026-05-27', mechanical: 'good', electrical: 'good', electronic: 'good', nextDue: '2026-11-27', notes: 'OBD scan clear, no stored codes. Gearbox actuator pressures nominal.' }
    },
    {
      id: 'DCB-0009', make: 'Bugatti', model: 'Veyron 16.4', year: 2006,
      category: 'Hypercar', client: 'R. Harrington',
      vin: 'VF9SA15B06M795031', purchase: 2100000, current: 2700000,
      title: 'clear', provenance: 'Full Bugatti Molsheim service record. New tyres and wheel service 2025.',
      costs: { insurance: 24500, storage: 9600, transport: 8200, maintenance: 48000 },
      acquired: '2021-07-30',
      details: { fuel: 'Petrol', engine: '8.0 L quad-turbo W16', transmission: '7-speed dual-clutch', mileage: '14,100 km', colour: 'Two-tone black over Italian red' },
      diagnostics: { date: '2026-06-05', mechanical: 'good', electrical: 'good', electronic: 'attention', nextDue: '2026-08-05', notes: 'Telemetry module fault code stored — hydraulic spoiler position sensor. Booked with Molsheim service partner; vehicle otherwise cleared for use below 200 km/h.' }
    },
    {
      id: 'DCB-0010', make: 'Pagani', model: 'Zonda R', year: 2009,
      category: 'Hypercar', client: 'J. Chen',
      vin: 'ZA9C820R00SF76015', purchase: 3400000, current: 3600000,
      title: 'financed', provenance: 'Track-only specification. Engine-out service completed at the factory, 2024.',
      costs: { insurance: 31000, storage: 11800, transport: 12500, maintenance: 54000 },
      acquired: '2024-01-25',
      details: { fuel: 'Petrol (race specification)', engine: '6.0 L AMG M120 V12', transmission: '6-speed sequential', mileage: '4,300 km (track)', colour: 'Exposed carbon with white livery' },
      diagnostics: { date: '2026-07-01', mechanical: 'good', electrical: 'good', electronic: 'good', nextDue: '2026-10-01', notes: 'Data-logger download reviewed by the factory. Engine hours within rebuild interval.' }
    },
  ];

  const DOC_SEED = [
    { id: 'DOC-0001', assetId: 'DCB-0001', name: 'V5C Registration Certificate.pdf', category: 'Title & Registration', added: '2021-03-15', seeded: true },
    { id: 'DOC-0002', assetId: 'DCB-0001', name: 'Agreed-Value Insurance Certificate 2026.pdf', category: 'Insurance', added: '2026-01-04', seeded: true },
    { id: 'DOC-0003', assetId: 'DCB-0003', name: 'Ferrari Classiche Certification (Red Book).pdf', category: 'Certification', added: '2022-02-01', seeded: true },
    { id: 'DOC-0004', assetId: 'DCB-0006', name: 'Formal Valuation — 2026 Q2.pdf', category: 'Valuation Certificate', added: '2026-04-22', seeded: true },
    { id: 'DOC-0005', assetId: 'DCB-0006', name: 'MSO Service History Summary.pdf', category: 'Service Record', added: '2025-11-18', seeded: true },
    { id: 'DOC-0006', assetId: 'DCB-0009', name: 'Diagnostic Assessment Report — June 2026.pdf', category: 'Inspection Report', added: '2026-06-05', seeded: true },
    { id: 'DOC-0007', assetId: 'DCB-0004', name: 'Encumbrance Schedule — Finance Agreement.pdf', category: 'Title & Registration', added: '2023-05-02', seeded: true },
  ];

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) {}
    return SEED.map(v => JSON.parse(JSON.stringify(v)));
  }

  function persist(vehicles) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(vehicles)); } catch (e) {}
  }

  function loadDocs() {
    try {
      const raw = localStorage.getItem(DOCS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return DOC_SEED.map(d => ({ ...d }));
  }

  function persistDocs(docs) {
    try { localStorage.setItem(DOCS_KEY, JSON.stringify(docs)); } catch (e) {}
  }

  // Era classification for the classic & vintage market
  function era(year) {
    if (year <= 1939) return 'Pre-War & Vintage Veterans';
    if (year <= 1969) return 'Post-War Blue-Chip Legends';
    if (year <= 1989) return 'Analogue Supercars & Poster Icons';
    return 'Modern Collectibles';
  }
  function eraShort(year) {
    if (year <= 1939) return 'Pre-War';
    if (year <= 1969) return 'Post-War';
    if (year <= 1989) return 'Analogue Era';
    return 'Modern';
  }

  function tco(v) {
    const c = v.costs || {};
    return (c.insurance || 0) + (c.storage || 0) + (c.transport || 0) + (c.maintenance || 0);
  }

  function roi(v) {
    return v.purchase > 0 ? ((v.current - v.purchase) / v.purchase) * 100 : 0;
  }

  function diagTag(status) {
    if (status === 'good') return '<span class="tag tag-clear">Good</span>';
    if (status === 'advisory') return '<span class="tag tag-review">Advisory</span>';
    if (status === 'attention') return '<span class="tag tag-encumbered">Attention</span>';
    return '<span class="tag tag-neutral">N/A</span>';
  }

  function fmtGBP(v) {
    if (v == null || isNaN(v)) return '—';
    if (Math.abs(v) >= 1000000) {
      const m = v / 1000000;
      return '£' + (Number.isInteger(m) ? m.toFixed(0) : m.toFixed(2)) + 'm';
    }
    return '£' + Math.round(v).toLocaleString('en-GB');
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  }

  function todayLong() {
    return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  window.DCB = { load, persist, loadDocs, persistDocs, era, eraShort, tco, roi, diagTag, fmtGBP, esc, todayLong, STORE_KEY, DOCS_KEY };
})();
