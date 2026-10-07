import { icon, brandWordmark } from './design-art.js';

const palettes = {
  politics: ['#e4eaf0', '#b8cad8', '#234d68'],
  incidents: ['#f0e7e9', '#dfbdc4', '#9b4c5c'],
  world: ['#e3eeef', '#b7d2d5', '#2d7e87'],
  economy: ['#eeeade', '#d5cbb0', '#8d7441'],
  society: ['#e8eaf0', '#c2c6db', '#6274a0'],
  technology: ['#def0eb', '#a4d1c8', '#1d827b'],
  culture: ['#efe5ed', '#d6b9d1', '#965c8e'],
  sports: ['#e4eee3', '#bbd2b7', '#537d49'],
  general: ['#e5eeee', '#bbd4d3', '#387d7e'],
};
const labels = {politics:'سیاسی',incidents:'حوادث',world:'بین‌الملل',economy:'اقتصاد',society:'جامعه',technology:'فناوری',culture:'فرهنگ',sports:'ورزش',general:'خبر'};
const xml = value => String(value || '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[character]));

export function coverSvg(category = 'general', title = '') {
  const key = palettes[category] ? category : 'general';
  const [paper, soft, accent] = palettes[key];
  const logo = brandWordmark().replace('class="brand-wordmark"', 'x="886" y="61" width="234" height="64"');
  const pictogram = icon(key === 'general' ? 'newspaper' : key).replace('class="icon "', 'x="440" y="192" width="320" height="320"').replace('stroke="currentColor"', `stroke="${accent}"`).replace('stroke-width="1.6"', 'stroke-width=".75"');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img"><title>${xml(title || labels[key])}</title><defs><linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${paper}"/><stop offset="1" stop-color="#f8faf9"/></linearGradient><radialGradient id="glass"><stop stop-color="#fff" stop-opacity=".72"/><stop offset="1" stop-color="${soft}" stop-opacity=".42"/></radialGradient><linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff"/><stop offset=".5" stop-color="${soft}"/><stop offset="1" stop-color="#fff"/></linearGradient></defs><rect width="1200" height="675" fill="url(#background)"/><circle cx="1060" cy="80" r="400" fill="${soft}" opacity=".22"/><circle cx="170" cy="640" r="340" fill="${soft}" opacity=".25"/><ellipse fill="none" cx="600" cy="388" rx="268" ry="172" transform="rotate(-29 600 388)" stroke="url(#ring)" stroke-width="24" opacity=".75"/><circle cx="600" cy="351" r="206" fill="url(#glass)" stroke="#fff" stroke-width="2"/>${pictogram}<path d="M80 568h1040" stroke="${accent}" opacity=".15"/>${logo}<text x="1120" y="622" text-anchor="end" font-size="29" font-family="Tahoma,Arial,sans-serif" fill="${accent}" direction="rtl">${labels[key]} · تصویر گرافیکی تحریریه</text><circle cx="92" cy="90" r="8" fill="${accent}" opacity=".6"/><path d="M93 603h75m-75 14h43" stroke="${accent}" stroke-width="2" opacity=".28"/></svg>`;
}
