import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import vm from 'node:vm';
import worker from '../src/worker.js';
import { ensureSchema, createArticle, updateArticle, getArticle, getHomeData, adminArticles } from '../src/db.js';
import { createSession, sessionCookie } from '../src/auth.js';
import { homePage, articlePage, todaysBrief } from '../src/ui-public.js';

test('homepage curation persists through the editor API and only exposes published selections', async () => {
  const sqlite = new DatabaseSync(':memory:');
  const env = { ADMIN_PASSWORD:randomUUID(), AUTH_SECRET:randomUUID(), DB:{
    prepare(sql) {
      let values = [];
      return {
        bind(...args) { values=args; return this; },
        async run() { const result=sqlite.prepare(sql).run(...values); return { meta:{last_row_id:Number(result.lastInsertRowid)} }; },
        async first() { return sqlite.prepare(sql).get(...values) || null; },
        async all() { return { results:sqlite.prepare(sql).all(...values) }; },
      };
    },
  }};
  try {
    await ensureSchema(env);
    const first = await createArticle(env,{title:'گزارش نخست',body:'متن کامل گزارش نخست برای بررسی انتشار.',status:'published',author_name:'علی رضایی',format:'analysis'});
    const second = await createArticle(env,{title:'گزارش دوم',body:'متن گزارش دوم برای بررسی چیدمان.',status:'published'});
    const draft = await createArticle(env,{title:'پیش‌نویس محرمانه',body:'این پیش‌نویس نباید در صفحه اول ظاهر شود.',status:'draft'});
    const token=await createSession(env);
    const request=(body,headers={})=>new Request('https://example.com/api/admin/homepage',{method:'PUT',headers:{'Content-Type':'application/json',Origin:'https://example.com',Cookie:sessionCookie(token).split(';')[0],...headers},body:JSON.stringify(body)});
    const input={main_slug:second.slug,editor_picks:[first.slug],dossier_title:'پرونده آزمایشی',dossier_description:'دو روایت مرتبط',dossier_slugs:[second.slug,first.slug]};
    const publicBootstrap=await worker.fetch(new Request('https://example.com/api/admin/bootstrap'),env);
    assert.equal((await publicBootstrap.json()).edition,undefined);
    assert.equal((await worker.fetch(request(input,{Cookie:''}),env)).status,401);
    assert.equal((await worker.fetch(request(input,{Origin:'https://other.example'}),env)).status,403);
    assert.equal((await worker.fetch(request({...input,editor_picks:[draft.slug]}),env)).status,400);
    assert.equal((await worker.fetch(request({...input,dossier_title:''}),env)).status,400);
    assert.equal((await worker.fetch(request(input),env)).status,200);
    const home=await getHomeData(env);
    assert.equal(home.hero.slug,second.slug);
    assert.equal(home.editorPicks[0].format,'analysis');
    assert.deepEqual(home.editorPicks.map(article=>article.slug),[first.slug]);
    assert.deepEqual(home.dossier.articles.map(article=>article.slug),[second.slug,first.slug]);
    const page=homePage(home);
    assert.match(page,/انتخاب سردبیر/);
    assert.match(page,/پرونده آزمایشی/);
    assert.doesNotMatch(page,/پیش‌نویس محرمانه/);
    for (let index=0;index<18;index++)await createArticle(env,{title:'روایت تازه '+index,body:'متن آزمایشی تازه برای بررسی حفظ انتخاب‌های قدیمی.',status:'published'});
    const recentAdmin=await adminArticles(env,2);
    assert.ok(recentAdmin.some(article=>article.slug===first.slug));
    assert.ok(recentAdmin.some(article=>article.slug===second.slug));
    assert.equal((await getHomeData(env)).hero.slug,second.slug);
    await updateArticle(env,first.id,{title:'گزارش نخست ویرایش‌شده'});
    assert.equal((await getArticle(env,first.slug,false)).author_name,'علی رضایی');
    await updateArticle(env,first.id,{author_name:'نویسنده تازه'});
    assert.equal((await adminArticles(env)).find(article=>article.id===first.id).author_name,'نویسنده تازه');
    await updateArticle(env,second.id,{status:'draft'});
    const revised=await getHomeData(env);
    assert.notEqual(revised.hero?.slug,second.slug);
    assert.deepEqual(revised.dossier.articles.map(article=>article.slug),[first.slug]);
  } finally { sqlite.close(); }
});

test('daily briefing follows Tehran midnight and excludes future and draft articles', () => {
  const rows=[
    {slug:'today',status:'published',published_at:'2026-10-07T20:35:00Z',excerpt:'خلاصه خبر امروز'},
    {slug:'yesterday',status:'published',published_at:'2026-10-07T20:25:00Z'},
    {slug:'future',status:'published',published_at:'2026-10-07T21:00:00Z'},
    {slug:'draft',status:'draft',published_at:'2026-10-07T20:35:00Z'},
  ];
  assert.deepEqual(todaysBrief(rows,'2026-10-07T20:45:00Z').map(article=>article.slug),['today']);
});

test('reader preserves unsafe text as text while adding accessible reading controls and headings', () => {
  const page=articlePage({title:'روایت خواندنی',slug:'reader',category:'technology',author_name:'<script>alert(1)</script>',body:'## بخش اول\n\nمتن نخست\n\n## بخش دوم\n\n<img src=x onerror=alert(1)>',published_at:'2026-10-07T10:00:00Z'});
  assert.doesNotMatch(page,/<img src=x|<script>alert\(1\)<\/script>/);
  assert.match(page,/aria-label="اندازه متن خبر"/);
  assert.match(page,/role="progressbar"/);
  assert.match(page,/href="#section-2"/);
  for(const script of page.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);
});
