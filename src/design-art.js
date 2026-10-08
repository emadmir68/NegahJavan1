import { wordmarkPaths, wordmarkViewBox, monogramPaths, monogramViewBox } from './brand-identity.js';

export function icon(name = 'arrow', className = '') {
  const paths = {
    arrow: '<path d="M19 12H5m6-6-6 6 6 6"/>',
    northeast: '<path d="M7 17 17 7M7 7h10v10"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4 4"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    play: '<path d="m9 5 11 7-11 7V5Z"/>',
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

export function brandMark() {
  return `<svg class="brand-symbol" viewBox="${monogramViewBox}" fill="none" aria-hidden="true" focusable="false">${monogramPaths}</svg>`;
}

export function brandWordmark() {
  return `<svg class="brand-wordmark" viewBox="${wordmarkViewBox}" aria-hidden="true" focusable="false">${wordmarkPaths}</svg>`;
}

// The sculptural mark uses the original logo geometry, rather than a generic globe.
export function signatureArt() {
  const glyph = (fill) => monogramPaths.replace(/fill="#14212c"/g, `fill="${fill}"`);
  const mark = (fill, x = 0, y = 0) => `<svg x="${55+x}" y="${60+y}" width="225" height="203" viewBox="${monogramViewBox}" overflow="visible">${glyph(fill)}</svg>`;
  return `<div class="signature-art" aria-hidden="true"><svg class="signature-sculpture" viewBox="0 0 600 520" fill="none" focusable="false">
  <defs>
    <linearGradient id="signature-glass" x1="80" y1="10" x2="275" y2="295" gradientUnits="userSpaceOnUse"><stop stop-color="#f9fffe" stop-opacity=".92"/><stop offset=".35" stop-color="#d9f8f0" stop-opacity=".63"/><stop offset=".7" stop-color="#78c9c3" stop-opacity=".38"/><stop offset="1" stop-color="#dae8e8" stop-opacity=".72"/></linearGradient>
    <linearGradient id="signature-metal" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#e3fff4"/><stop offset=".18" stop-color="#80ddd0"/><stop offset=".4" stop-color="#27978f"/><stop offset=".72" stop-color="#135e68"/><stop offset="1" stop-color="#092e3e"/></linearGradient>
    <linearGradient id="signature-edge" x1="0" y1="0" x2="340" y2="330" gradientUnits="userSpaceOnUse"><stop stop-color="#a4d4d2"/><stop offset=".42" stop-color="#f6ffff"/><stop offset=".67" stop-color="#65999e"/><stop offset="1" stop-color="#bedfdd"/></linearGradient>
    <linearGradient id="signature-red" x1="252" y1="-30" x2="340" y2="36" gradientUnits="userSpaceOnUse"><stop stop-color="#ff5265"/><stop offset=".35" stop-color="#e51537"/><stop offset="1" stop-color="#a90d28"/></linearGradient>
    <linearGradient id="signature-reflection" x1="22" y1="30" x2="228" y2="275" gradientUnits="userSpaceOnUse"><stop stop-color="white" stop-opacity=".85"/><stop offset=".34" stop-color="white" stop-opacity=".1"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient>
    <filter id="signature-shadow" x="-40%" y="-30%" width="190%" height="200%"><feDropShadow dx="12" dy="26" stdDeviation="17" flood-color="#264c58" flood-opacity=".18"/></filter>
    <filter id="signature-ground"><feGaussianBlur stdDeviation="15"/></filter>
  </defs>
  <path d="M70 343 413 218M90 391 433 267" stroke="#84b7b2" stroke-opacity=".14"/>
  <ellipse cx="315" cy="427" rx="169" ry="19" fill="#345862" fill-opacity=".16" filter="url(#signature-ground)"/>
  <g transform="matrix(1 -.22 .12 1 111 121)" filter="url(#signature-shadow)">
    <path d="M22 27H271L345 100V300Q345 320 324 320H34Q14 320 14 300V47Q14 27 22 27Z" fill="url(#signature-edge)"/>
    <path d="M330 78 345 100V300Q345 320 324 320L312 300Q330 300 330 280Z" fill="#759fa4" fill-opacity=".72"/>
    <path d="M18 0H253L330 77V282Q330 300 312 300H18Q0 300 0 282V18Q0 0 18 0Z" fill="url(#signature-glass)" stroke="#faffff" stroke-width="2"/>
    <path d="M253 0V59Q253 77 272 77H330" stroke="white" stroke-opacity=".75" stroke-width="1.4"/>
    <path d="M19 299H311M329 86V280" stroke="#4d8e94" stroke-opacity=".36" stroke-width="1.4"/>
    ${mark('#0d4f5e',7,13)}
    ${mark('#205f6b',4,8)}
    ${mark('url(#signature-metal)')}
    <path d="M21 28H153L26 214Z" fill="url(#signature-reflection)"/>
    <path d="M16 45V18Q16 14 20 14H231" stroke="white" stroke-width="2" stroke-linecap="round" stroke-opacity=".85"/>
    <path d="M263 20 330-34H389L321 20Z" fill="url(#signature-red)"/>
    <path d="M321 20 389-34V-24L321 30Z" fill="#a60e2b"/>
    <path d="M263 20H321V30H263Z" fill="#c21838"/>
    <path d="M264 20 330-34H389" stroke="#ffb6be" stroke-opacity=".65" stroke-width="1.5"/>
    <path d="M26 270H84M26 278H58" stroke="#43777d" stroke-opacity=".36" stroke-width="1.2"/>
  </g>
  <path d="m473 332 33-25m-6 1h8v8" stroke="#477d82" stroke-opacity=".55" stroke-width="1.5"/>
  <circle cx="93" cy="234" r="4" fill="#91b7b5"/><circle cx="508" cy="163" r="2.5" fill="#e51537" fill-opacity=".7"/>
  </svg></div>`;
}
