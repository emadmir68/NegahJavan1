export function icon(name = 'arrow', className = '') {
  const paths = {
    arrow: '<path d="M19 12H5m6-6-6 6 6 6"/>',
    northeast: '<path d="M7 17 17 7M7 7h10v10"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4 4"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    time: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    bookmark: '<path d="M6 4h12v17l-6-4-6 4V4Z"/>',
    share: '<path d="M12 16V3m-4 4 4-4 4 4M6 11H4v10h16V11h-2"/>',
    politics: '<path d="m3 9 9-6 9 6H3Zm2 0v9m5-9v9m4-9v9m5-9v9M3 21h18M4 18h16"/>',
    incidents: '<path d="m12 3 10 18H2L12 3Zm0 6v5m0 3v.5"/>',
    world: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 7h14M5 17h14"/>',
    economy: '<path d="M4 20V10m5 10V6m6 14v-8m5 8V3M2 20h20"/>',
    society: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m3 11v-3a6 6 0 0 0-3-5"/>',
    technology: '<rect x="6" y="6" width="12" height="12" rx="3"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
    culture: '<path d="M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3V4Zm9 2v16M6 8h3m-3 4h3m6-4h3m-3 4h3"/>',
    sports: '<path d="M8 3h8v6a4 4 0 0 1-8 0V3Zm0 2H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 1v5m-4 3h8m-10 0h12"/>',
    newspaper: '<path d="M5 3h15v16a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V8h3v10m3-11h9m-9 4h9m-9 4h4"/>',
    up: '<path d="M12 20V4m-6 6 6-6 6 6"/>',
  };
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
}

export function brandMark(id = 'brand') {
  return `<svg class="brand-symbol" viewBox="0 0 48 48" fill="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="7" y1="4" x2="42" y2="45" gradientUnits="userSpaceOnUse"><stop stop-color="#5ad4c4"/><stop offset=".5" stop-color="#089c97"/><stop offset="1" stop-color="#087d81"/></linearGradient></defs><rect x="1" y="1" width="46" height="46" rx="16" fill="url(#${id})"/><path d="M9 24s6-9 15-9 15 9 15 9-6 9-15 9S9 24 9 24Z" stroke="white" stroke-width="2"/><circle cx="24" cy="24" r="5" fill="white"/><circle cx="25" cy="22.5" r="1.5" fill="#159e9c"/></svg>`;
}

export function observatoryArt() {
  return `<div class="observatory" aria-hidden="true"><div class="observatory-halo"></div><svg class="observatory-sculpture" viewBox="0 0 600 580" fill="none">
  <defs>
    <radialGradient id="iris" cx=".31" cy=".24" r=".84"><stop stop-color="#d0fff1"/><stop offset=".28" stop-color="#6bdbcb"/><stop offset=".56" stop-color="#14a5a7"/><stop offset=".82" stop-color="#087f94"/><stop offset="1" stop-color="#074758"/></radialGradient>
    <radialGradient id="glass-shine" cx=".24" cy=".17" r=".82"><stop stop-color="white" stop-opacity=".85"/><stop offset=".25" stop-color="#e4ffff" stop-opacity=".2"/><stop offset=".75" stop-color="white" stop-opacity="0"/><stop offset="1" stop-color="#062c48" stop-opacity=".45"/></radialGradient>
    <linearGradient id="chrome" x1="110" y1="80" x2="480" y2="475" gradientUnits="userSpaceOnUse"><stop stop-color="#bad8dc"/><stop offset=".18" stop-color="#ffffff"/><stop offset=".35" stop-color="#d5e6e9"/><stop offset=".5" stop-color="#8facb5"/><stop offset=".56" stop-color="#f5ffff"/><stop offset=".78" stop-color="#bbd2d7"/><stop offset="1" stop-color="#849fa9"/></linearGradient>
    <linearGradient id="chrome-edge" x1="91" y1="109" x2="500" y2="440" gradientUnits="userSpaceOnUse"><stop stop-color="white"/><stop offset=".45" stop-color="#e8f6f5"/><stop offset="1" stop-color="#6e8d98"/></linearGradient>
    <linearGradient id="rim" x1="159" y1="107" x2="430" y2="456" gradientUnits="userSpaceOnUse"><stop stop-color="#ecffff"/><stop offset=".4" stop-color="#b1d9d9"/><stop offset=".65" stop-color="#3b7d84"/><stop offset="1" stop-color="#e4fcfa"/></linearGradient>
    <filter id="ground-blur"><feGaussianBlur stdDeviation="17"/></filter>
    <filter id="soft-shadow" x="-30%" y="-30%" width="170%" height="170%"><feDropShadow dx="8" dy="28" stdDeviation="15" flood-color="#38606b" flood-opacity=".2"/></filter>
    <clipPath id="iris-clip"><circle cx="300" cy="270" r="156"/></clipPath>
  </defs>
  <ellipse cx="304" cy="507" rx="164" ry="24" fill="#537d88" opacity=".19" filter="url(#ground-blur)"/>
  <g class="sculpture-core" filter="url(#soft-shadow)">
    <ellipse cx="300" cy="274" rx="242" ry="132" transform="rotate(-36 300 274)" stroke="#91b0b8" stroke-width="24"/>
    <ellipse cx="299" cy="267" rx="242" ry="132" transform="rotate(-36 299 267)" stroke="url(#chrome)" stroke-width="25"/>
    <ellipse cx="299" cy="264" rx="242" ry="132" transform="rotate(-36 299 264)" stroke="url(#chrome-edge)" stroke-width="1.5"/>
    <circle cx="300" cy="280" r="173" fill="#799da7"/>
    <circle cx="300" cy="270" r="173" fill="url(#rim)"/>
    <circle cx="300" cy="268" r="165" fill="#216472"/>
    <circle cx="300" cy="270" r="157" fill="url(#iris)"/>
    <g clip-path="url(#iris-clip)" stroke="#e5fff7" stroke-opacity=".3" stroke-width="1">
      <ellipse cx="300" cy="270" rx="52" ry="156" transform="rotate(-22 300 270)"/>
      <ellipse cx="300" cy="270" rx="110" ry="156" transform="rotate(-22 300 270)"/>
      <ellipse cx="300" cy="270" rx="156" ry="42" transform="rotate(-22 300 270)"/>
      <ellipse cx="300" cy="270" rx="156" ry="101" transform="rotate(-22 300 270)"/>
      <path d="m239 124 122 292m-207-86 292-118"/>
    </g>
    <circle cx="300" cy="270" r="156" fill="url(#glass-shine)"/>
    <path d="M185 199c21-40 62-64 104-67" stroke="white" stroke-opacity=".65" stroke-width="5" stroke-linecap="round"/>
    <path d="M190 211c22-45 67-72 111-74" stroke="white" stroke-opacity=".25" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M100 329c-29 38-28 70-6 86 57 43 189-6 295-83 76-55 127-116 128-158" stroke="url(#chrome)" stroke-width="25" stroke-linecap="round"/>
    <path d="M97 323c-27 34-26 62-5 78 55 40 187-9 292-86 76-55 126-115 127-156" stroke="url(#chrome-edge)" stroke-width="2" stroke-linecap="round"/>
    <circle cx="367" cy="177" r="5" fill="white" fill-opacity=".9"/>
  </g>
  <circle cx="507" cy="104" r="5" fill="#27a49d"/><circle cx="92" cy="242" r="3" fill="#6fc6c0"/><path d="M484 404h16m-8-8v16" stroke="#56968f" stroke-width="1.5"/>
  </svg><div class="art-note art-note-top"><span class="note-dot"></span>هر خبر، یک زاویه تازه</div><div class="art-note art-note-bottom">${brandMark('art-brand')}<span><b>نگاه جوان</b><small>جهان را دقیق‌تر ببین.</small></span>${icon('northeast')}</div></div>`;
}
