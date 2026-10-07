export const SMART_KEYWORDS = {
  politics: ['مجلس','دولت','وزیر','رئیس جمهور','انتخابات','سیاست','سیاسی','پارلمان','قانون','دیپلماسی','تحریم'],
  incidents: ['حادثه','حوادث','آتش سوزی','آتش‌سوزی','زلزله','سیل','تصادف','قتل','سرقت','پلیس','امداد','نجات'],
  world: ['جهان','بین الملل','بین‌الملل','آمریکا','اروپا','روسیه','چین','اسرائیل','غزه','اوکراین','سازمان ملل'],
  economy: ['اقتصاد','اقتصادی','دلار','طلا','بورس','بازار','تورم','بانک','نفت','ارز','بودجه','قیمت'],
  society: ['جامعه','اجتماعی','آموزش','دانشگاه','مدرسه','سلامت','شهرداری','خانواده','جوانان','اشتغال'],
  technology: ['فناوری','تکنولوژی','هوش مصنوعی','اینترنت','موبایل','استارتاپ','دیجیتال','سایبری','نرم افزار','نرم‌افزار'],
  culture: ['فرهنگ','فرهنگی','سینما','موسیقی','کتاب','هنر','رسانه','تلویزیون','تئاتر'],
  sports: ['ورزش','ورزشی','فوتبال','والیبال','بسکتبال','تیم ملی','لیگ','مسابقه','قهرمانی']
};

export function normalizePersianText(input='') {
  return String(input)
    .replace(/\r\n/g, '\n')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\u0640/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *([،؛:؟!]) */g, '$1 ')
    .replace(/\s*\.\.\.+\s*/g, '… ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ {2,}/g, ' ')
    .trim();
}

export function smartTitle(input='') {
  const t = normalizePersianText(input)
    .replace(/[.!؟!،؛:…]+$/g, '')
    .trim();
  return t.slice(0, 160);
}

export function smartBody(input='') {
  const normalized = normalizePersianText(input);
  return normalized
    .split('\n\n')
    .map(p => p.replace(/\n+/g, ' ').trim())
    .filter(Boolean)
    .join('\n\n');
}

export function autoExcerpt(body='', title='', max=190) {
  const clean = smartBody(body).replace(/\s+/g, ' ').trim();
  if (!clean) return smartTitle(title);
  const sentences = clean.match(/[^.!؟!…]+[.!؟!…]?/g) || [clean];
  let out = '';
  for (const sentence of sentences) {
    const candidate = (out ? out + ' ' : '') + sentence.trim();
    if (candidate.length > max) break;
    out = candidate;
    if (out.length >= 90) break;
  }
  if (!out) out = clean.slice(0, max);
  if (out.length < clean.length && !/[.!؟!…]$/.test(out)) out = out.replace(/\s+\S*$/, '') + '…';
  return out.trim();
}

export function inferCategory(title='', body='') {
  const haystack = normalizePersianText(title + ' ' + body).toLowerCase();
  let best = 'general';
  let bestScore = 0;
  for (const [category, words] of Object.entries(SMART_KEYWORDS)) {
    let score = 0;
    for (const word of words) if (haystack.includes(word.toLowerCase())) score += word.includes(' ') ? 3 : 1;
    if (score > bestScore) { best = category; bestScore = score; }
  }
  return best;
}

export function readingMinutes(body='') {
  const count = smartBody(body).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(count / 190));
}

export function headlineScore(title='') {
  const t = smartTitle(title);
  let score = 35;
  if (t.length >= 35 && t.length <= 95) score += 30;
  else if (t.length >= 20 && t.length <= 120) score += 15;
  if (/\d/.test(t)) score += 8;
  if (/[؟?]/.test(title)) score += 4;
  if (!/[!]{2,}/.test(title)) score += 8;
  if (!/(شوک|باور نکردنی|فوری فوری|عجیب عجیب)/.test(t)) score += 15;
  return Math.max(0, Math.min(100, score));
}
