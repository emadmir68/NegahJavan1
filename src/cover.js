const PALETTES = {
  politics: ['#071b31','#173f64','#69c7ff'],
  incidents: ['#250f18','#6d1f33','#ff6b7a'],
  world: ['#081d2d','#174158','#6bd6e7'],
  economy: ['#191b14','#5a4a16','#f1c75b'],
  society: ['#0b1c24','#234557','#7dd3fc'],
  technology: ['#071b20','#15524d','#56ddd0'],
  culture: ['#171226','#4c2d6c','#c09cff'],
  sports: ['#071d1a','#1b584d','#65dfc2'],
  general: ['#071522','#18364b','#7dd3fc']
};

const LABELS = {
  politics:'سیاسی', incidents:'حوادث', world:'بین‌الملل', economy:'اقتصاد',
  society:'جامعه', technology:'فناوری', culture:'فرهنگ', sports:'ورزش', general:'خبر'
};

function xml(v='') {
  return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
}

function lines(text='', max=24, count=3) {
  const words=String(text).trim().split(/\s+/).filter(Boolean);
  const out=[]; let line='';
  for (const word of words) {
    const next=(line?line+' ':'')+word;
    if (next.length>max && line) { out.push(line); line=word; if(out.length===count-1) break; }
    else line=next;
  }
  if (line && out.length<count) out.push(line);
  return out.slice(0,count);
}

export function coverSvg(category='general', title='') {
  const key=PALETTES[category]?category:'general';
  const [a,b,c]=PALETTES[key];
  const label=LABELS[key]||'خبر';
  const titleLines=lines(title || label, 27, 3);
  const tspans=titleLines.map((line,i)=>`<tspan x="1020" dy="${i===0?0:72}">${xml(line)}</tspan>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
    <radialGradient id="glow"><stop stop-color="${c}" stop-opacity=".62"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="10"/></filter>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <circle cx="130" cy="92" r="250" fill="url(#glow)" filter="url(#blur)"/>
  <circle cx="1110" cy="660" r="300" fill="url(#glow)" opacity=".55" filter="url(#blur)"/>
  <path d="M0 570 C230 470 350 690 610 560 S960 420 1200 505 V675 H0Z" fill="#ffffff" fill-opacity=".035"/>
  <g stroke="#ffffff" stroke-opacity=".06"><path d="M0 120H1200"/><path d="M0 240H1200"/><path d="M0 360H1200"/><path d="M0 480H1200"/><path d="M200 0V675"/><path d="M400 0V675"/><path d="M600 0V675"/><path d="M800 0V675"/><path d="M1000 0V675"/></g>
  <rect x="900" y="72" width="210" height="54" rx="27" fill="#ffffff" fill-opacity=".09" stroke="#ffffff" stroke-opacity=".16"/>
  <text x="1005" y="107" text-anchor="middle" fill="#ffffff" font-size="25" font-family="Tahoma,Arial,sans-serif" direction="rtl">${xml(label)}</text>
  <text x="1020" y="255" text-anchor="end" fill="#ffffff" font-size="54" font-weight="700" font-family="Tahoma,Arial,sans-serif" direction="rtl" unicode-bidi="plaintext">${tspans}</text>
  <g transform="translate(80 530)"><rect width="255" height="72" rx="22" fill="#ffffff" fill-opacity=".09" stroke="#ffffff" stroke-opacity=".14"/><circle cx="45" cy="36" r="23" fill="${c}" fill-opacity=".88"/><text x="45" y="45" text-anchor="middle" fill="#06121b" font-size="25" font-weight="900" font-family="Tahoma,Arial">ن</text><text x="85" y="44" fill="#ffffff" font-size="26" font-weight="700" font-family="Tahoma,Arial,sans-serif" direction="rtl">نگاه جوان</text></g>
  <text x="1110" y="620" text-anchor="end" fill="#ffffff" fill-opacity=".48" font-size="20" font-family="Tahoma,Arial,sans-serif" direction="rtl">کاور خودکار تحریریه</text>
</svg>`;
}
