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

      if (path === '/api/admin/articles' && request.method === 'POST') {
        if (!secureWriteRequest(request)) return json({ error:'Origin نامعتبر است' }, 403);
        if (!(await requireEditor(request, env))) return json({ error:'نیاز به ورود دارید' }, 401);
        if (!hasDatabase(env)) return json({ error:'D1 با Binding نام DB متصل نشده است' }, 503);
        const data = await bodyJson(request);
        return json({ ok:true, article:await createArticle(env, data) }, 201);
      }

      const articleApi = path.match(/^\/api\/admin\/articles\/(\d+)$/);
      if (articleApi && (request.method === 'PUT' || request.method === 'DELETE')) {
        if (!secureWriteRequest(request)) return json({ error:'Origin نامعتبر است' }, 403);
        if (!(await requireEditor(request, env))) return json({ error:'نیاز به ورود دارید' }, 401);
        if (!hasDatabase(env)) return json({ error:'D1 با Binding نام DB متصل نشده است' }, 503);
        const id = Number(articleApi[1]);
        if (request.method === 'DELETE') return json({ ok:true, article:await deleteArticle(env, id) });
        return json({ ok:true, article:await updateArticle(env, id, await bodyJson(request)) });
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
