/* Shared page chrome: utility strip, masthead, navigation, footer, auth, theme. */

(function () {
  function crestSVG(size) {
    const s = size || 30;
    return '<svg width="' + s + '" height="' + Math.round(s * 1.1) + '" viewBox="0 0 40 44" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M20 2 L36 8 V22 Q36 34 20 42 Q4 34 4 22 V8 Z" stroke="#9C7E33" stroke-width="1.6" fill="none" stroke-linejoin="round"/>' +
      '<path d="M20 6.5 L32.5 11 V22 Q32.5 31.5 20 38 Q7.5 31.5 7.5 22 V11 Z" stroke="#9C7E33" stroke-width="0.7" fill="none" opacity="0.55"/>' +
      '<text x="20" y="24.5" text-anchor="middle" font-family="Georgia, serif" font-size="10.5" letter-spacing="0.5" fill="#9C7E33">DCB</text>' +
      '<line x1="13" y1="29" x2="27" y2="29" stroke="#9C7E33" stroke-width="0.9"/>' +
      '<circle cx="20" cy="32.5" r="0.9" fill="#9C7E33"/>' +
      '</svg>';
  }
  window.dcbCrest = crestSVG;

  const TABS = [
    { href: 'index.html', label: 'Overview' },
    { href: 'portfolio.html', label: 'Asset Register' },
    { href: 'intel.html', label: 'Market Intelligence' },
    { href: 'clients.html', label: 'Clients' },
    { href: 'vault.html', label: 'Vault' },
    { href: 'concierge.html', label: 'Concierge' },
    { href: 'reports.html', label: 'Reports' },
  ];

  window.renderChrome = function (activeHref) {
    const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const dark = document.documentElement.dataset.theme === 'dark';
    const tabs = TABS.map(t =>
      '<a class="nav-tab' + (t.href === activeHref ? ' active' : '') + '" href="' + t.href + '">' + t.label + '</a>'
    ).join('');

    const html =
      '<div class="utility"><div class="wrap utility-inner">' +
        '<span>Dream Car Brokers &nbsp;·&nbsp; Private Vehicle Wealth Management</span>' +
        '<span>Valuations as at <strong>' + dateStr + '</strong> &nbsp;·&nbsp; GBP</span>' +
      '</div></div>' +
      '<header class="masthead"><div class="wrap masthead-inner">' +
        '<div class="mast-brand">' +
          '<div class="mast-mark">' + crestSVG(30) + '</div>' +
          '<div><div class="mast-name">Dream Car Brokers</div>' +
          '<div class="mast-tag">Private Asset Intelligence</div></div>' +
        '</div>' +
        '<div class="mast-right">' +
          '<div class="mast-client"><div class="mast-client-name">Kiran</div>' +
          '<div class="mast-client-role">Principal — Administrator</div></div>' +
          '<div class="mast-divider"></div>' +
          '<button class="btn-quiet" onclick="dcbToggleTheme()" title="Switch appearance">' + (dark ? 'Light Mode' : 'Dark Mode') + '</button>' +
          '<button class="btn-quiet" onclick="dcbSignOut()">Sign out</button>' +
        '</div>' +
      '</div></header>' +
      '<nav class="navbar"><div class="wrap nav-tabs">' + tabs + '</div></nav>';

    document.getElementById('chrome').innerHTML = html;
  };

  window.renderFooter = function () {
    const el = document.getElementById('foot');
    if (!el) return;
    el.innerHTML =
      '<div class="wrap site-foot">' +
        '<strong>Important information</strong><br>' +
        'This portal is provided for information purposes only to clients of Dream Car Brokers Ltd. Valuations are indicative, ' +
        'prepared with reference to comparable public auction results and private treaty sales, and do not constitute a formal appraisal. ' +
        'Collectible automobiles are illiquid assets; past appreciation is not a guide to future performance. ' +
        'Title and encumbrance indicators reflect the most recent documentation lodged with us and should be re-verified prior to any transaction.<br><br>' +
        'Dream Car Brokers Ltd &nbsp;·&nbsp; Registered in England &amp; Wales &nbsp;·&nbsp; Private &amp; Confidential' +
      '</div>';
  };

  window.dcbToggleTheme = function () {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('dcb_theme', next); } catch (e) {}
    document.documentElement.dataset.theme = next;
    location.reload();
  };

  window.dcbSignOut = function () {
    if (window.netlifyIdentity) {
      netlifyIdentity.logout();
      netlifyIdentity.on('logout', () => window.location.replace('login.html'));
    } else {
      window.location.replace('login.html');
    }
  };
})();
