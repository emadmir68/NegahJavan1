import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import vm from 'node:vm';
import worker from '../src/worker.js';
import { ensureSchema, createArticle, getArticle, adminArticles, CATEGORY_LABELS } from '../src/db.js';
import { articlePage, homePage } from '../src/ui-public.js';
import { articleStructuredData, jsonLd } from '../src/seo.js';
import { imageTransformPlan } from '../src/image-tools.js';
import { editorEnhancementScript } from '../src/editor-enhancements.js';
import { testEnv, editorRequest } from './helpers.mjs';

test('schema setup is independent for each database and shared by concurrent requests',async()=>{
  const fixtures=[testEnv(),testEnv()];
  try{
    for(const {env,sqlite} of fixtures){
      await Promise.all([ensureSchema(env),ensureSchema(env),ensureSchema(env)]);
      assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM categories').get().count,Object.keys(CATEGORY_LABELS).filter(key=>key!=='general').length);
      await createArticle(env,{title:'خبر مستقل',body:'متن مستقل برای این دیتابیس.',status:'draft'});
      assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM articles').get().count,1);
    }
  }finally{fixtures.forEach(({sqlite})=>sqlite.close())}
});

test('latest and category archives reach older articles without showing drafts or duplicating pages',async()=>{
  const {env,sqlite}=testEnv();
  try{
    await ensureSchema(env);
    const rows=[];
    for(let index=0;index<35;index++)rows.push(await createArticle(env,{title:'خبر آرشیو '+index,slug:'archive-'+index,body:'متن آرشیو.',category:'technology',status:'published',published_at:'2026-10-01T10:00:00Z'}));
    await createArticle(env,{title:'عنوان محرمانه',body:'پیش‌نویس.',status:'draft'});
    const page=async path=>(await worker.fetch(new Request('https://www.negahjavan.ir'+path),env)).text();
    const first=await page('/latest'), second=await page('/latest?page=2'), third=await page('/latest?page=3');
    const links=html=>[...html.matchAll(/<h3><a href="\/news\/([^"]+)"/g)].map(match=>match[1]);
    assert.equal(links(first).length,16);assert.equal(links(second).length,16);assert.equal(links(third).length,3);
    assert.equal(new Set([...links(first),...links(second),...links(third)]).size,35);
    assert.match(first,/rel="next" href="\/latest\?page=2"/);
    assert.match(second,/rel="prev" href="\/latest"/);
    assert.match(second,/<link rel="canonical" href="https:\/\/negahjavan.ir\/latest\?page=2"/);
    assert.doesNotMatch(first+second+third,/عنوان محرمانه/);
    assert.equal(links(await page('/category/technology')).length,30);
    assert.equal(links(await page('/category/technology?page=2')).length,5);
    assert.deepEqual(links(await page('/latest?page=-1')),links(first));
    assert.deepEqual(links(await page('/latest?page=oops')),links(first));
    const sitemap=await page('/sitemap.xml'),feed=await page('/feed.xml');
    for(const article of rows){assert.ok(sitemap.includes('/news/'+article.slug));assert.ok(feed.includes('/news/'+article.slug))}
    assert.doesNotMatch(sitemap+feed,/عنوان محرمانه|www.negahjavan.ir/);
    assert.match(sitemap,/<lastmod>/);assert.match(feed,/<rss version="2.0">/);
    assert.match(await page('/robots.txt'),/Disallow: \/api\/\nSitemap: https:\/\/negahjavan.ir\/sitemap.xml/);
  }finally{sqlite.close()}
});

test('article metadata supports safe share previews, structured data and clear generated-image captions',()=>{
  const article={title:'خبر </script><script>bad()</script>',slug:'خبر-آزمایشی',body:'متن خبر.',excerpt:'خلاصه خبر.',category:'technology',hero_image:'https://images.example/cover.jpg',image_alt:'شرح <تصویر>',image_generated:true,image_caption:'منبع نمونه',author_name:'نویسنده',published_at:'2026-10-01 10:00:00',updated_at:'2026-10-02 10:00:00'};
  const page=articlePage(article),structured=page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
  const parsed=JSON.parse(structured);
  assert.equal(parsed['@type'],'NewsArticle');assert.equal(parsed.headline,article.title);
  assert.equal(parsed.datePublished,'2026-10-01T10:00:00.000Z');assert.equal(parsed.author.name,'نویسنده');
  assert.match(page,/<meta property="og:image" content="https:\/\/images.example\/cover.jpg"/);
  assert.match(page,/alt="شرح &lt;تصویر&gt;"/);
  assert.match(page,/<figcaption>تصویرسازی هوش مصنوعی نگاه جوان · منبع نمونه<\/figcaption>/);
  assert.doesNotMatch(structured,/<\/script>|<script>/);
  assert.equal(JSON.parse(jsonLd(articleStructuredData(article,'/assets/cover-general-0-v2.png'))).headline,article.title);
  assert.doesNotMatch(homePage({latest:[]}),/<title>نگاه جوان \| نگاه جوان<\/title>/);
  const full=homePage({latest:Array.from({length:12},(_,index)=>({...article,title:'خبر '+index,slug:'story-'+index,hero_image:'',image_generated:false}))});
  assert.equal((full.match(/fetchpriority="high"/g)||[]).length,1);
  assert.ok((full.match(/loading="lazy"/g)||[]).length>1);
});

test('AI endpoints require the editor, origin and binding before calling a provider',async()=>{
  const {env,sqlite}=testEnv();let calls=0;
  const input={title:'خبر نمونه',body:'متن نمونه.',request_id:randomUUID()};
  try{
    const request=await editorRequest(env);
    assert.equal((await worker.fetch(request('/api/admin/ai-rewrite',input,{Cookie:''}),env)).status,401);
    assert.equal((await worker.fetch(request('/api/admin/ai-rewrite',input,{Origin:'https://other.example'}),env)).status,403);
    assert.equal((await worker.fetch(request('/api/admin/ai-rewrite',input,{Origin:''}),env)).status,403);
    assert.equal((await worker.fetch(request('/api/admin/ai-rewrite',input),env)).status,503);
    env.AI={run:async()=>{calls++;throw new Error('should not call')}};
    assert.equal((await worker.fetch(request('/api/admin/ai-image',input),env)).status,503);
    assert.equal(calls,0);
    assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM site_settings WHERE key LIKE 'ai_job:%'").get().count,0);
    const bootstrap=await worker.fetch(new Request('https://negahjavan.ir/api/admin/bootstrap'),env);
    assert.equal((await bootstrap.json()).ai,undefined);
  }finally{sqlite.close()}
});

test('rewrite requests are idempotent, preserve the article and reject changed facts or reused IDs',async()=>{
  const {env,sqlite}=testEnv();let calls=0,changeNumber=false;
  const input={title:'افتتاح ۲ مدرسه',body:'در سال ۱۴۰۵، ۲ مدرسه افتتاح شد.',category:'society',request_id:randomUUID()};
  try{
    await ensureSchema(env);
    const article=await createArticle(env,{...input,status:'draft'}),request=await editorRequest(env);
    env.AI={run:async(model)=>{calls++;assert.match(model,/qwen/);return {choices:[{message:{content:JSON.stringify({title:input.title,body:changeNumber?'در سال ۱۴۰۵، ۳ مدرسه افتتاح شد.':input.body,excerpt:'دو مدرسه افتتاح شد.',category:'society'})}}]}}};
    const response=await worker.fetch(request('/api/admin/ai-rewrite',input),env);assert.equal(response.status,200);
    const first=await response.json();assert.equal(first.prepared.body,input.body);
    const repeated=await worker.fetch(request('/api/admin/ai-rewrite',input),env);assert.deepEqual(await repeated.json(),first);assert.equal(calls,1);
    const different=await worker.fetch(request('/api/admin/ai-rewrite',{...input,body:'متن جدید'}),env);assert.equal(different.status,409);assert.equal(calls,1);
    assert.equal((await adminArticles(env)).find(row=>row.id===article.id).status,'draft');
    assert.equal((await adminArticles(env)).find(row=>row.id===article.id).body,input.body);
    changeNumber=true;
    assert.equal((await worker.fetch(request('/api/admin/ai-rewrite',{...input,request_id:randomUUID()}),env)).status,502);
    assert.equal((await adminArticles(env)).find(row=>row.id===article.id).body,input.body);
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM articles').get().count,1);
  }finally{sqlite.close()}
});

test('concurrent AI requests respect the durable daily budget',async()=>{
  const {env,sqlite}=testEnv();let calls=0;
  try{
    const request=await editorRequest(env);
    env.AI={run:async()=>{calls++;return {response:{title:'خبر',body:'متن خبر.',excerpt:'خلاصه',category:'general'}}}};
    const responses=await Promise.all(Array.from({length:42},()=>worker.fetch(request('/api/admin/ai-rewrite',{title:'خبر',body:'متن خبر.',request_id:randomUUID()}),env)));
    assert.equal(responses.filter(response=>response.status===200).length,40);
    assert.equal(responses.filter(response=>response.status===429).length,2);assert.equal(calls,40);
    assert.equal(Number(sqlite.prepare("SELECT value FROM site_settings WHERE key LIKE 'ai_budget:%'").get().value),40);
  }finally{sqlite.close()}
});

test('generated images use Arvan, stay private before publication and keep their provenance on edit',async()=>{
  const {env,sqlite}=testEnv(),originalFetch=globalThis.fetch;
  const files=new Map(),models=[];
  try{
    const request=await editorRequest(env);
    globalThis.fetch=async(url,options)=>{
      assert.equal(new URL(url).host,'test.arvanstorage.ir');const path=new URL(url).pathname;
      if(options.method==='GET'&&path==='/negahjavan-media')return new Response('<ListBucketResult/>');
      if(options.method==='PUT'){files.set(path,new Uint8Array(await new Response(options.body).arrayBuffer()));return new Response(null)}
      const bytes=files.get(path);return new Response(bytes||null,{status:bytes?200:404});
    };
    const connected=await worker.fetch(request('/api/admin/media-settings',{endpoint:'https://test.arvanstorage.ir',bucket:'negahjavan-media',region:'test',access_key:'TESTACCESSKEY',secret_key:'test-only-key'}, {},'PUT'),env);assert.equal(connected.status,200);
    const jpeg=Uint8Array.from([255,216,255,224,...new Array(24).fill(0)]);
    env.AI={run:async model=>{models.push(model);return model.includes('qwen')?{response:{prompt:'Conceptual illustration of a school',alt:'تصویرسازی یک مدرسه'}}:{image:Buffer.from(jpeg).toString('base64')}}};
    const input={title:'افتتاح مدرسه',body:'متن خبر افتتاح مدرسه.',request_id:randomUUID()};
    const generated=await worker.fetch(request('/api/admin/ai-image',input),env);assert.equal(generated.status,200);
    const data=await generated.json();assert.equal(data.media.kind,'image');assert.equal(data.media.generated,true);assert.equal(models.length,2);assert.equal(files.size,1);
    assert.equal((await worker.fetch(new Request('https://negahjavan.ir'+data.media.url),env)).status,404);
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM articles').get().count,0);
    const created=await worker.fetch(request('/api/admin/articles',{...input,status:'published',hero_image:data.media.url,image_alt:data.alt,image_caption:data.caption,image_generated:false}),env);assert.equal(created.status,201);
    const saved=(await created.json()).article;
    const article=await getArticle(env,saved.slug,false);assert.equal(article.image_generated,true);assert.equal(article.image_alt,data.alt);
    assert.equal((await worker.fetch(new Request('https://negahjavan.ir'+data.media.url),env)).status,200);
    assert.equal((await worker.fetch(request('/api/admin/articles/'+saved.id,{...input,status:'published',hero_image:'https://images.example/real.jpg'}, {},'PUT'),env)).status,200);
    assert.equal((await getArticle(env,saved.slug,false)).image_generated,false);
    assert.doesNotMatch(JSON.stringify(data),/TESTACCESSKEY|test-only-key/);
  }finally{globalThis.fetch=originalFetch;sqlite.close()}
});

test('photo preparation preserves proportions, offers a central crop and never enlarges small photos',()=>{
  const landscape=imageTransformPlan(4000,3000);assert.equal(landscape.width,1920);assert.equal(landscape.height,1440);assert.equal(landscape.sx,0);
  const crop=imageTransformPlan(4000,3000,true);assert.equal(crop.width,1920);assert.equal(crop.height,1080);assert.equal(crop.sy,375);
  const portrait=imageTransformPlan(1000,2000,true);assert.equal(portrait.width,1000);assert.equal(portrait.height,563);assert.ok(portrait.sy>0);
  assert.equal(imageTransformPlan(640,480).changed,false);assert.throws(()=>imageTransformPlan(0,100));
});

function editorHarness(api) {
  const ids=['title','body','excerpt','category','hero_image','image_alt','image_caption','video_url','video_caption','status','author_name','source_name','source_url','format','slug','save','aiRewrite','aiImage','aiMessage','aiAvailability','aiProposal','aiProposedTitle','aiProposedBody','aiProposedExcerpt','aiProposedCategory','aiApply','aiDismiss','articleForm'];
  const elements=Object.fromEntries(ids.map(id=>[id,{value:'',disabled:false,hidden:false,textContent:'',listeners:{},classList:{toggle(){}},addEventListener(name,fn){this.listeners[name]=fn}}]));
  Object.assign(elements.title,{value:'خبر اصلی'});elements.body.value='متن اصلی خبر';elements.category.value='society';
  const context=vm.createContext({$:selector=>elements[selector.slice(1)],api,crypto:globalThis.crypto,editing:null,labels:{society:'جامعه'},pendingMedia:{image:{version:0,file:null,processing:false,xhr:null}},mediaConnection:{configured:true},releasePendingMedia(){context.pendingMedia.image.version++},refreshMediaPreview(){},updateInsights(){},updatePreview(){},clientMediaUrl:value=>value});
  vm.runInContext(editorEnhancementScript,context);vm.runInContext('renderEditorAi({configured:true})',context);
  return {context,elements};
}

test('editor requires review before applying a rewrite and discards responses after typing or switching news',async()=>{
  let resolve;
  const {context,elements}=editorHarness(()=>new Promise(done=>{resolve=done}));
  const result={prepared:{title:'خبر پیشنهادی',body:'متن پیشنهادی',excerpt:'خلاصه',category:'society'}};
  let pending=elements.aiRewrite.onclick();assert.equal(elements.aiRewrite.disabled,true);
  resolve(result);await pending;assert.equal(elements.body.value,'متن اصلی خبر');assert.equal(elements.aiProposal.hidden,false);
  elements.aiApply.onclick();assert.equal(elements.body.value,'متن پیشنهادی');assert.equal(elements.aiProposal.hidden,true);
  pending=elements.aiRewrite.onclick();elements.body.value='ویرایش دستی تازه';resolve(result);await pending;
  assert.equal(elements.body.value,'ویرایش دستی تازه');assert.equal(elements.aiProposal.hidden,true);
  pending=elements.aiRewrite.onclick();vm.runInContext('resetAiDraft();editing=42;',context);elements.body.value='خبر دیگری';resolve(result);await pending;
  assert.equal(elements.body.value,'خبر دیگری');assert.equal(elements.aiProposal.hidden,true);
});
