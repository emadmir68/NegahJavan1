import { authConfigured, passwordMatches, createSession, verifySession, sessionCookie, clearSessionCookie, sameOrigin } from './auth.js';
import { CATEGORY_LABELS, getHomeData, getArticle, listByCategory, searchArticles, adminStats, adminArticles, createArticle, updateArticle, deleteArticle, hasDatabase } from './db.js';
import { homePage, articlePage, listingPage, notFoundPage, editorialPage } from './ui.js';

const html = (body, status=200) => new Response(body, { status, headers: { 'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'strict-origin-when-cross-origin' } });
const json = (data, status=200, headers={}) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', ...headers } });

async function bodyJson(request) {
  const type = request.headers.get('content-type') || '';
  if (!type.includes('application/json')) throw new Error('درخواست نامعتبر است');
  return await request.json();
}

function secureWriteRequest(request) {
  return ['POST','PUT','PATCH','DELETE'].includes(request.method) ? sameOrigin(request) : true;
}

async function requireEditor(request, env) {
  return await verifySession(request, env);
}

function normalizePersianText(value, multiline = false) {
  let text = String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/ي/g, "ی").replace(/ى/g, "ی").replace(/ك/g, "ک")
    .replace(/ۀ/g, "هٔ").replace(/ة/g, "ه")
    .replace(/[\u200e\u200f\u202a-\u202e]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([،؛:.!?؟])/g, "$1")
    .replace(/([،؛:!?؟])(?=[\p{L}\p{N}])/gu, "$1 ")
    .replace(/\.\.\.+/g, "…")
    .trim();
  return multiline
    ? text.split("\n").map(x => x.trim()).join("\n").replace(/\n{3,}/g, "\n\n")
    : text.replace(/\s*\n\s*/g, " ").replace(/\s{2,}/g, " ");
}

function autoExcerpt(body, max = 220) {
  const plain = normalizePersianText(body).replace(/\s+/g, " ").trim();
  if (!plain || plain.length <= max) return plain;
  const cut = plain.slice(0, max + 24);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("؟ "), cut.lastIndexOf("! "), cut.lastIndexOf("؛ "));
  const value = stop > max * .55 ? cut.slice(0, stop + 1) : plain.slice(0, max).replace(/\s+\S*$/, "");
  return value.trim() + "…";
}

const SMART_WORDS = {
  politics:["دولت","مجلس","انتخابات","وزیر","وزارت","سیاست","دیپلماسی","مذاکره","رئیس جمهور","رییس جمهور"],
  incidents:["حادثه","حوادث","آتش","زلزله","قتل","تصادف","پلیس","انفجار","سیل","اورژانس","کشته","مصدوم","سرقت"],
  world:["آمریکا","امریکا","روسیه","چین","اسرائیل","غزه","فلسطین","اوکراین","اروپا","سازمان ملل","ناتو"],
  economy:["دلار","طلا","سکه","بورس","بانک","تورم","اقتصاد","بازار","نفت","بودجه","قیمت","ارز","مسکن","مالیات"],
  society:["آموزش","سلامت","دانشگاه","مدرسه","جامعه","جمعیت","خانواده","محیط زیست","شهرداری","بیمارستان"],
  technology:["فناوری","هوش مصنوعی","اینترنت","موبایل","گوشی","نرم افزار","نرم‌افزار","استارتاپ","دیجیتال","سایبری"],
  culture:["سینما","موسیقی","کتاب","فرهنگ","هنر","هنرمند","رسانه","جشنواره","تئاتر","سریال"],
  sports:["فوتبال","لیگ","ورزش","تیم ملی","استقلال","پرسپولیس","مسابقه","قهرمان","والیبال","کشتی"]
};

function suggestCategory(data) {
  const text = normalizePersianText(`${data.title||""} ${data.excerpt||""} ${data.body||""}`).toLowerCase();
  let best="general", score=0;
  for (const [cat, words] of Object.entries(SMART_WORDS)) {
    let s=0; for (const w of words) if (text.includes(w.toLowerCase())) s += w.includes(" ") ? 3 : 2;
    if (s>score) { best=cat; score=s; }
  }
  return best;
}

function safeHttpUrl(value) {
  const text=String(value||"").trim(); if(!text) return "";
  try { const u=new URL(text); return ["http:","https:"].includes(u.protocol) ? u.toString() : ""; } catch { return ""; }
}

function smartPrepare(data={}) {
  const title=normalizePersianText(data.title).replace(/[.،؛:]+$/g,"").slice(0,160).trim();
  const body=normalizePersianText(data.body,true);
  const excerpt=normalizePersianText(data.excerpt) || autoExcerpt(body);
  const category = data.category === "auto" || !CATEGORY_LABELS[data.category] ? suggestCategory({title,excerpt,body}) : data.category;
  const source_url=safeHttpUrl(data.source_url);
  let source_name=normalizePersianText(data.source_name);
  if (!source_name && source_url) { try { source_name=new URL(source_url).hostname.replace(/^www\./,""); } catch {} }
  return {...data,title,body,excerpt,category,hero_image:safeHttpUrl(data.hero_image),source_name,source_url};
}

function xmlEscape(value="") {
  return String(value).replace(/[<>&"']/g, c => ({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&apos;"}[c]));
}

function coverSvg(article) {
  const themes={politics:["#071a2f","#0e7490","#67e8f9"],incidents:["#2b0b13","#9f1239","#fb7185"],world:["#10112b","#4338ca","#a5b4fc"],economy:["#11231c","#047857","#6ee7b7"],society:["#1e1730","#7e22ce","#d8b4fe"],technology:["#071d24","#0f766e","#5eead4"],culture:["#24140b","#b45309","#fcd34d"],sports:["#12200d","#3f6212","#bef264"],general:["#111827","#334155","#93c5fd"]};
  const [a,b,k]=themes[article?.category]||themes.general;
  const words=String(article?.title||"نگاه جوان").split(/\s+/).filter(Boolean);
  const lines=[]; let line="";
  for(const w of words){const n=line?`${line} ${w}`:w;if(n.length>28&&line){lines.push(line);line=w}else line=n;if(lines.length===2)break}
  if(line&&lines.length<3)lines.push(line);
  const tspans=lines.slice(0,3).map((x,i)=>`<tspan x="1050" dy="${i?76:0}">${xmlEscape(x)}</tspan>`).join("");
  const label=xmlEscape(CATEGORY_LABELS[article?.category]||"خبر");
  return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${a}"/><stop offset=".56" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></linearGradient><radialGradient id="r"><stop stop-color="${k}" stop-opacity=".28"/><stop offset="1" stop-color="${k}" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="675" fill="url(#g)"/><circle cx="160" cy="120" r="330" fill="url(#r)"/><circle cx="980" cy="580" r="350" fill="url(#r)"/><g opacity=".14" stroke="#fff"><path d="M70 105H1130M70 570H1130"/><path d="M70 105V570M1130 105V570"/></g><rect x="820" y="72" width="310" height="58" rx="29" fill="#fff" fill-opacity=".12" stroke="#fff" stroke-opacity=".18"/><text x="1094" y="110" fill="#fff" text-anchor="end" font-family="Tahoma,Arial" font-size="25" font-weight="700">${label} · نگاه جوان</text><text x="1050" y="282" fill="#fff" text-anchor="end" font-family="Tahoma,Arial" font-size="58" font-weight="800" direction="rtl">${tspans}</text><text x="1050" y="560" fill="#d9f8ff" text-anchor="end" font-family="Tahoma,Arial" font-size="23" direction="rtl">روایت روشن خبر برای نسل امروز</text><rect x="70" y="72" width="64" height="64" rx="20" fill="${k}"/><text x="102" y="116" text-anchor="middle" fill="#06121a" font-family="Tahoma,Arial" font-size="34" font-weight="900">ن</text></svg>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/api/health') {
        return json({ ok:true, service:'NegahJavan', database:hasDatabase(env), auth:authConfigured(env), time:new Date().toISOString() });
      }

      if (path === '/api/auth/login' && request.method === 'POST') {
        if (!secureWriteRequest(request)) return json({ error:'Origin نامعتبر است' }, 403);
        if (!authConfigured(env)) return json({ error:'Secrets تحریریه هنوز تنظیم نشده‌اند' }, 503);
        const data = await bodyJson(request);
        if (!passwordMatches(env, data.password)) return json({ error:'رمز عبور نادرست است' }, 401);
        const token = await createSession(env);
        return json({ ok:true }, 200, { 'Set-Cookie':sessionCookie(token) });
      }

      if (path === '/api/auth/logout' && request.method === 'POST') {
        if (!secureWriteRequest(request)) return json({ error:'Origin نامعتبر است' }, 403);
        return json({ ok:true }, 200, { 'Set-Cookie':clearSessionCookie() });
      }

      if (path === '/api/admin/bootstrap' && request.method === 'GET') {
        const authenticated = await requireEditor(request, env);
        if (!authenticated) return json({ authenticated:false, authConfigured:authConfigured(env), databaseConfigured:hasDatabase(env) });
        const [stats, articles] = await Promise.all([adminStats(env), adminArticles(env)]);
        return json({ authenticated:true, authConfigured:true, databaseConfigured:hasDatabase(env), stats, articles });
      }

      if (path === '/api/admin/smart-preview' && request.method === 'POST') {
        if (!secureWriteRequest(request)) return json({ error:'Origin نامعتبر است' }, 403);
        if (!(await requireEditor(request, env))) return json({ error:'نیاز به ورود دارید' }, 401);
        const prepared = smartPrepare(await bodyJson(request));
        const words = prepared.body.split(/\s+/).filter(Boolean).length;
        return json({ ok:true, prepared, reading_minutes:Math.max(1, Math.ceil(words / 220)) });
      }

      if (path === '/api/admin/articles' && request.method === 'POST') {
        if (!secureWriteRequest(request)) return json({ error:'Origin نامعتبر است' }, 403);
        if (!(await requireEditor(request, env))) return json({ error:'نیاز به ورود دارید' }, 401);
        if (!hasDatabase(env)) return json({ error:'D1 با Binding نام DB متصل نشده است' }, 503);
        const data = smartPrepare(await bodyJson(request));
        return json({ ok:true, article:await createArticle(env, data) }, 201);
      }

      const articleApi = path.match(/^\/api\/admin\/articles\/(\d+)$/);
      if (articleApi && (request.method === 'PUT' || request.method === 'DELETE')) {
        if (!secureWriteRequest(request)) return json({ error:'Origin نامعتبر است' }, 403);
        if (!(await requireEditor(request, env))) return json({ error:'نیاز به ورود دارید' }, 401);
        if (!hasDatabase(env)) return json({ error:'D1 با Binding نام DB متصل نشده است' }, 503);
        const id = Number(articleApi[1]);
        if (request.method === 'DELETE') return json({ ok:true, article:await deleteArticle(env, id) });
        return json({ ok:true, article:await updateArticle(env, id, smartPrepare(await bodyJson(request))) });
      }

      const coverMatch = path.match(/^\/cover\/(.+)\.svg$/);
      if (coverMatch && request.method === 'GET') {
        const slug = decodeURIComponent(coverMatch[1]);
        const article = await getArticle(env, slug, false);
        if (!article) return new Response('Not found', { status:404 });
        return new Response(coverSvg(article), { headers:{ 'Content-Type':'image/svg+xml; charset=utf-8', 'Cache-Control':'public, max-age=3600, s-maxage=86400', 'X-Content-Type-Options':'nosniff' } });
      }

      if (path === '/editorial') return html(editorialPage());

      if (path === '/' && request.method === 'GET') return html(homePage(await getHomeData(env)));

      const news = path.match(/^\/news\/(.+)$/);
      if (news && request.method === 'GET') {
        const slug = decodeURIComponent(news[1]);
        const article = await getArticle(env, slug);
        return html(articlePage(article), article ? 200 : 404);
      }

      const category = path.match(/^\/category\/([a-z-]+)$/);
      if (category && request.method === 'GET') {
        const slug = category[1];
        const label = CATEGORY_LABELS[slug];
        if (!label) return html(notFoundPage(), 404);
        return html(listingPage(label, await listByCategory(env, slug)));
      }

      if (path === '/search' && request.method === 'GET') {
        const q = (url.searchParams.get('q') || '').trim();
        return html(listingPage('جست‌وجو', q ? await searchArticles(env, q) : [], q));
      }

      if (path === '/robots.txt') {
        return new Response(`User-agent: *\nAllow: /\nDisallow: /editorial\nSitemap: ${url.origin}/sitemap.xml\n`, { headers:{ 'Content-Type':'text/plain; charset=utf-8' } });
      }

      if (path === '/sitemap.xml') {
        const base = url.origin;
        const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${base}/</loc></url></urlset>`;
        return new Response(xml, { headers:{ 'Content-Type':'application/xml; charset=utf-8' } });
      }

      return html(notFoundPage(), 404);
    } catch (error) {
      console.error('NegahJavan error', error);
      if (path.startsWith('/api/')) return json({ error:error?.message || 'خطای داخلی سرور' }, 500);
      return html(`<!doctype html><meta charset="utf-8"><body dir="rtl" style="font-family:Tahoma;background:#07101a;color:white;padding:40px"><h1>خطای موقت</h1><p>سرویس با خطا روبه‌رو شد. لطفاً دوباره تلاش کنید.</p></body>`, 500);
    }
  }
};
