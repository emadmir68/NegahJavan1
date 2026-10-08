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

function illustration(key, accent, soft) {
  const windows = (x,y,count=4) => Array.from({length:count},(_,i)=>`<path d="M${x} ${y+i*23}h22m12 0h22" stroke="white" stroke-width="5" stroke-opacity=".65"/>`).join('');
  const pins = Array.from({length:5},(_,i)=>`<path d="M${214+i*31} 64V37m0 239v27M170 ${103+i*30}h-32m249 0h32" stroke="${accent}" stroke-width="9" stroke-linecap="round" opacity=".5"/>`).join('');
  const scenes = {
    technology:`<g transform="matrix(1 -.13 .1 1 -20 45)"><rect x="181" y="72" width="216" height="216" rx="30" fill="${accent}" opacity=".5"/>${pins}<rect x="170" y="60" width="216" height="216" rx="29" fill="url(#facet)" stroke="white" stroke-width="2"/><rect x="215" y="105" width="126" height="126" rx="19" fill="${accent}" opacity=".72"/><rect x="229" y="119" width="98" height="98" rx="12" fill="url(#glass)" stroke="#f7fffc" stroke-width="2"/><path d="M252 151h49m-49 17h32m-32 17h44" stroke="white" stroke-width="4" stroke-linecap="round" opacity=".75"/></g><rect x="433" y="58" width="58" height="58" rx="15" fill="url(#glass)" stroke="white" transform="rotate(12 462 87)"/><path d="m401 196 45-52h55" stroke="${accent}" stroke-opacity=".35" stroke-width="2"/><circle cx="502" cy="144" r="5" fill="${accent}"/>`,
    society:`<path d="M83 313h453" stroke="${accent}" stroke-opacity=".3" stroke-width="2"/><path d="M116 310V117l83-27v220" fill="url(#glass)" stroke="white" stroke-width="2"/>${windows(132,146,6)}<path d="M209 311V82l88-26v255" fill="url(#facet)"/>${windows(225,106,7)}<path d="M306 311V149l98-35v197" fill="url(#glass)" stroke="white" stroke-width="2"/>${windows(326,173,4)}<path d="M427 310V79l54 38v193" fill="${accent}" opacity=".18"/><path d="M154 334v-26a25 25 0 0 1 50 0v26m208 0v-24a25 25 0 0 1 50 0v24" stroke="${accent}" stroke-width="4"/><circle cx="179" cy="266" r="11" fill="${accent}"/><circle cx="437" cy="270" r="11" fill="${accent}"/><path d="M206 331h203" stroke="${accent}" stroke-opacity=".3" stroke-width="2"/>`,
    economy:`<path d="m109 295 120 46 134-67-115-45Z" fill="${accent}" opacity=".15"/><g transform="matrix(1 -.12 .1 1 -15 35)"><path d="M151 172h88v133h-88z" fill="url(#facet)"/><path d="m239 172 30-18v131l-30 20Z" fill="${accent}" opacity=".55"/><path d="m151 172 31-19h87l-30 19Z" fill="url(#glass)"/><path d="M280 98h86v207h-86z" fill="url(#facet)"/><path d="m366 98 30-18v207l-30 18Z" fill="${accent}" opacity=".7"/><path d="m280 98 30-18h86l-30 18Z" fill="url(#glass)"/></g><g fill="url(#facet)" stroke="#fff" stroke-width="1.5"><path d="M396 224h107v69c0 20-107 20-107 0Z"/><ellipse cx="449.5" cy="224" rx="53.5" ry="17"/><ellipse cx="449.5" cy="242" rx="53.5" ry="17" fill="none"/><ellipse cx="449.5" cy="260" rx="53.5" ry="17" fill="none"/></g><ellipse cx="111" cy="121" rx="43" ry="43" fill="url(#facet)"/><ellipse cx="111" cy="121" rx="31" ry="31" stroke="white" stroke-width="2"/><path d="M109 102v38m-9-31h15c10 0 10 16 0 16h-15" stroke="white" stroke-width="4" stroke-linecap="round"/>`,
    world:`<path d="M72 242 159 74l264 206 77-176" stroke="${accent}" stroke-opacity=".3" stroke-width="2"/><g fill="${accent}" opacity=".65"><circle cx="72" cy="242" r="5"/><circle cx="159" cy="74" r="5"/><circle cx="423" cy="280" r="5"/><circle cx="500" cy="104" r="5"/></g><circle cx="284" cy="184" r="124" fill="url(#facet)" stroke="white" stroke-width="3"/><g stroke="white" stroke-opacity=".5" fill="none" stroke-width="1.5"><ellipse cx="284" cy="184" rx="50" ry="123" transform="rotate(-18 284 184)"/><ellipse cx="284" cy="184" rx="123" ry="40" transform="rotate(-18 284 184)"/><ellipse cx="284" cy="184" rx="124" ry="83" transform="rotate(-18 284 184)"/><path d="m246 66 76 236"/></g><path d="m201 144 30-26 34 3 13 23-18 23-20-1-4 39-19 13-14-25Z" fill="white" opacity=".37"/><path d="m305 202 42-14 25 13-3 31-24 6-12 32-22-12Z" fill="white" opacity=".29"/><path d="M202 114a104 104 0 0 1 72-32" stroke="white" stroke-width="5" stroke-linecap="round" opacity=".65"/><path d="M144 251c-31 26-32 46-7 54 68 22 268-38 314-105 10-15 9-26 0-35" stroke="url(#edge)" stroke-width="13" stroke-linecap="round"/>`,
    culture:`<g transform="matrix(1 -.1 .13 1 -5 36)"><path d="M110 115 264 157l169-65v199l-171 56-152-51Z" fill="${accent}" opacity=".28"/><path d="M110 98 264 141l169-65v203l-171 52-152-48Z" fill="url(#glass)" stroke="white" stroke-width="2"/><path d="m264 141 158-71v203l-160 58Z" fill="url(#facet)"/><path d="M124 92 264 132v180l-140-41Z" fill="#ffffffe6"/><path d="m142 124 91 26m-91-3 91 27m-91-4 91 26m-91-3 91 26m-91-3 63 19" stroke="${accent}" stroke-opacity=".26" stroke-width="3"/><path d="m285 149 102-43m-102 66 102-43m-102 66 102-43m-102 66 68-29" stroke="white" stroke-opacity=".6" stroke-width="3"/><path d="M262 132v199" stroke="white" stroke-width="3"/></g><path d="m457 148 25-34 15 43-29 33Z" fill="${accent}" opacity=".4"/><circle cx="91" cy="49" r="8" fill="${soft}"/>`,
    sports:`<path d="M86 274c38-53 252-101 397-52 130 43-46 114-206 106-170-8-203-32-165-67" stroke="${accent}" stroke-width="6" fill="none" opacity=".3"/><path d="M114 280c46-38 232-68 343-37 95 26-58 76-176 71" stroke="white" stroke-width="3" fill="none"/><circle cx="309" cy="150" r="104" fill="url(#facet)" stroke="white" stroke-width="2"/><path d="m308 104 42 30-16 51h-54l-17-50Z" fill="${accent}" opacity=".7"/><g stroke="white" stroke-opacity=".7" stroke-width="2"><path d="m308 104-8-55m50 85 60-9m-76 60 29 49m-83-49-26 45m9-95-47-30"/><path d="m300 49 49 12 38 29 23 35m-47 109-58 20-51-24-38-40-9-85" fill="none"/></g><path d="M225 107a91 91 0 0 1 56-42" stroke="white" stroke-width="4" stroke-linecap="round" opacity=".7"/>`,
    politics:`<g transform="matrix(1 -.09 .1 1 -15 34)"><path d="M116 304h374v23H116Z" fill="${accent}" opacity=".3"/><path d="M138 283h330v22H138Z" fill="url(#facet)"/><path d="M154 117 303 45l149 72Z" fill="url(#glass)" stroke="white" stroke-width="2"/><path d="M158 127h290v22H158Z" fill="${accent}" opacity=".55"/>${[177,244,311,378].map(x=>`<path d="M${x} 149h36v134h-36Z" fill="url(#facet)"/><path d="M${x+5} 154v119" stroke="white" stroke-opacity=".6" stroke-width="3"/>`).join('')}<path d="M147 279h312" stroke="white" stroke-width="4"/><circle cx="303" cy="94" r="13" fill="${accent}" opacity=".42"/></g>`,
    incidents:`<g transform="matrix(1 -.14 .12 1 -15 53)"><path d="M132 126 307 35l163 137-171 125Z" fill="${accent}" opacity=".14"/><path d="M141 92 316 18l143 136-176 109Z" fill="url(#glass)" stroke="white" stroke-width="2"/><path d="M204 196 297 58l94 139Z" fill="url(#facet)" stroke="white" stroke-width="3"/><path d="M297 103v40m0 20v6" stroke="white" stroke-width="9" stroke-linecap="round"/><path d="m130 227 154 70 164-104" stroke="${accent}" stroke-opacity=".45" stroke-width="4"/></g><path d="M122 87V67h23m314 218v23h-23" stroke="${accent}" stroke-width="2" opacity=".4"/>`,
    general:`<g transform="matrix(1 -.12 .1 1 -20 35)"><rect x="165" y="79" width="251" height="224" rx="14" fill="${accent}" opacity=".25"/><path d="M145 64h194l63 61v161H145Z" fill="url(#glass)" stroke="white" stroke-width="2"/><path d="M339 64v61h63" fill="url(#facet)"/><path d="M175 105h119v66H175Z" fill="url(#facet)"/><path d="M175 195h166m-166 22h166m-166 22h108" stroke="${accent}" stroke-opacity=".4" stroke-width="5"/></g>`,
  };
  return scenes[key] || scenes.general;
}

export function coverVariant(title) {
  let hash = 2166136261;
  for (const character of String(title).normalize('NFC')) hash = Math.imul(hash ^ character.codePointAt(0),16777619) >>> 0;
  return hash % 3;
}

export function coverSvg(category = 'general', title = '') {
  const key = palettes[category] ? category : 'general';
  const [paper,soft,accent] = palettes[key];
  const variant = coverVariant(title);
  const sceneX = [210,165,240][variant];
  const angle = [-3,2,5][variant];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" fill="none"><title>${xml(title || labels[key])}</title><defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${paper}"/><stop offset="1" stop-color="#fbfcfa"/></linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#ffffffec"/><stop offset=".55" stop-color="${soft}" stop-opacity=".63"/><stop offset="1" stop-color="#ffffffc9"/></linearGradient>
    <linearGradient id="facet" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffffffe8"/><stop offset=".38" stop-color="${soft}"/><stop offset="1" stop-color="${accent}"/></linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffffff"/><stop offset=".5" stop-color="${soft}"/><stop offset="1" stop-color="${accent}"/></linearGradient>
    <filter id="shadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="7" dy="16" stdDeviation="10" flood-color="${accent}" flood-opacity=".12"/></filter>
  </defs><rect width="1200" height="675" fill="url(#background)"/>
  <path d="M${810-variant*70} 0h390v510H${390-variant*70}Z" fill="${soft}" opacity=".16"/><path d="M70 358 830 25M90 420l760-333" stroke="white" stroke-width="2" opacity=".6"/>
  <circle cx="135" cy="489" r="195" fill="${soft}" opacity=".12"/><path d="m1077 67 36-29h48l-35 29Z" fill="#e51537"/>
  <g transform="translate(${sceneX} 81) scale(1.38) rotate(${angle} 300 180)" filter="url(#shadow)">${illustration(key,accent,soft)}</g>
  <path d="M80 568h1040" stroke="${accent}" stroke-opacity=".19"/><text x="1120" y="622" text-anchor="start" font-size="27" font-family="Tahoma,Arial,sans-serif" fill="${accent}" direction="rtl">${labels[key]} · تصویر گرافیکی تحریریه</text><path d="M80 611h58m-58 11h31" stroke="${accent}" stroke-width="2" opacity=".35"/></svg>`;
}
