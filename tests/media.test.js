import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID, createHash, createHmac } from 'node:crypto';
import worker from '../src/worker.js';
import { ensureSchema, createArticle, updateArticle, getArticle } from '../src/db.js';
import { createSession, sessionCookie } from '../src/auth.js';
import { articlePage } from '../src/ui-public.js';
import { signedStorageRequest } from '../src/media-storage.js';

test('short news does not repeat its full text or display a same-minute update',()=>{
  const body='💬فرماندار جیرفت از تلاش‌های شبانه‌روزی راهداران قدردانی کرد.';
  const article={title:'تجلیل از خادمان ایمنی راه‌ها',slug:'short',category:'society',excerpt:body,body,published_at:'2026-10-07T17:53:01.000Z',updated_at:'2026-10-07 17:53:42'};
  const page=articlePage(article);
  assert.doesNotMatch(page,/class="reader-deck"|به‌روزرسانی:/);
  assert.equal((page.match(/<p>💬فرماندار/g)||[]).length,1);
  assert.match(articlePage({...article,updated_at:'2026-10-07 17:55:00'}),/به‌روزرسانی:/);
  assert.match(articlePage({...article,excerpt:'قدردانی از راهداران'}),/class="reader-deck"/);
});

test('S3 requests sign the canonical path and headers with a reproducible signature',async()=>{
  const config={endpoint:'https://example.arvanstorage.ir',bucket:'negahjavan-media',region:'test-region',accessKey:'TESTACCESSKEY',secretKey:'test-only-signing-key'};
  const now=new Date('2026-10-07T10:00:00Z');
  const result=await signedStorageRequest(config,'PUT','negahjavan/image/عکس نمونه.jpg',{'Content-Type':'image/jpeg','Content-Length':'32'},now);
  assert.equal(new URL(result.url).pathname,'/negahjavan-media/negahjavan/image/%D8%B9%DA%A9%D8%B3%20%D9%86%D9%85%D9%88%D9%86%D9%87.jpg');
  const hash=value=>createHash('sha256').update(value).digest('hex');
  const hmac=(key,value)=>createHmac('sha256',key).update(value).digest();
  const names='content-type;host;x-amz-content-sha256;x-amz-date';
  const canonical='PUT\n'+new URL(result.url).pathname+'\n\ncontent-type:image/jpeg\nhost:example.arvanstorage.ir\nx-amz-content-sha256:UNSIGNED-PAYLOAD\nx-amz-date:20261007T100000Z\n\n'+names+'\nUNSIGNED-PAYLOAD';
  const scope='20261007/test-region/s3/aws4_request';
  const key=hmac(hmac(hmac(hmac('AWS4'+config.secretKey,'20261007'),'test-region'),'s3'),'aws4_request');
  const signature=hmac(key,'AWS4-HMAC-SHA256\n20261007T100000Z\n'+scope+'\n'+hash(canonical)).toString('hex');
  assert.equal(result.headers.get('Authorization'),'AWS4-HMAC-SHA256 Credential=TESTACCESSKEY/'+scope+', SignedHeaders='+names+', Signature='+signature);
});

test('authenticated Arvan uploads stream files, keep keys private and restrict draft media',async()=>{
  const sqlite=new DatabaseSync(':memory:');
  const env={ADMIN_PASSWORD:randomUUID(),AUTH_SECRET:randomUUID(),DB:{
    prepare(sql){
      let values=[];
      return {
        bind(...args){values=args;return this},
        async run(){const r=sqlite.prepare(sql).run(...values);return {meta:{last_row_id:Number(r.lastInsertRowid)}}},
        async first(){return sqlite.prepare(sql).get(...values)||null},
        async all(){return {results:sqlite.prepare(sql).all(...values)}},
      };
    },
  }};
  const originalFetch=globalThis.fetch,files=new Map(),calls=[];
  const settings={endpoint:'https://test.arvanstorage.ir',bucket:'negahjavan-media',region:'test-region',access_key:'TESTACCESSKEY',secret_key:'test-only-private-storage-key'};
  const png=Uint8Array.from([137,80,78,71,13,10,26,10,...new Array(24).fill(0)]);
  const mp4=Uint8Array.from([0,0,0,24,102,116,121,112,105,115,111,109,...new Array(20).fill(0)]);
  try{
    await ensureSchema(env);
    const cookie=sessionCookie(await createSession(env)).split(';')[0];
    const request=(path,method='GET',body,headers={})=>new Request('https://example.com'+path,{method,headers:{Origin:'https://example.com',Cookie:cookie,...headers},...(body!==undefined?{body}:{}),...(body instanceof ReadableStream?{duplex:'half'}:{})});
    const jsonRequest=(path,body,headers={})=>request(path,'PUT',JSON.stringify(body),{'Content-Type':'application/json',...headers});
    const upload=(bytes=png,mime='image/png',headers={})=>request('/api/admin/media','POST',bytes,{'Content-Type':mime,'Content-Length':String(bytes.length),'X-Upload-Size':String(bytes.length),'X-File-Name':encodeURIComponent('عکس خبر.png'),...headers});
    globalThis.fetch=async(url,options)=>{
      assert.equal(new URL(url).host,'test.arvanstorage.ir');
      assert.match(options.headers.get('authorization'),/^AWS4-HMAC-SHA256 Credential=TESTACCESSKEY\//);
      assert.equal(options.redirect,'error');
      const path=new URL(url).pathname;calls.push({path,method:options.method,range:options.headers.get('range')});
      if(options.method==='HEAD'&&path==='/negahjavan-media')return new Response(null,{status:200});
      if(options.method==='PUT'){assert.ok(options.body instanceof ReadableStream);files.set(path,new Uint8Array(await new Response(options.body).arrayBuffer()));return new Response(null,{status:200})}
      const bytes=files.get(path);
      if(!bytes)return new Response(null,{status:404});
      if(options.headers.get('range'))return new Response(options.method==='HEAD'?null:bytes.slice(0,8),{status:206,headers:{'Content-Length':'8','Content-Range':'bytes 0-7/'+bytes.length,'Accept-Ranges':'bytes'}});
      return new Response(options.method==='HEAD'?null:bytes,{headers:{'Content-Length':String(bytes.length),'Accept-Ranges':'bytes'}});
    };
    assert.equal((await worker.fetch(upload(),env)).status,503);
    assert.equal((await worker.fetch(upload(png,'image/png',{Cookie:''}),env)).status,401);
    assert.equal((await worker.fetch(jsonRequest('/api/admin/media-settings',settings,{Origin:'https://other.example'}),env)).status,403);
    assert.equal((await worker.fetch(jsonRequest('/api/admin/media-settings',{...settings,endpoint:'https://evil.example'}),env)).status,400);
    assert.equal((await worker.fetch(jsonRequest('/api/admin/media-settings',{...settings,bucket:'other-project'}),env)).status,400);
    assert.equal((await worker.fetch(jsonRequest('/api/admin/media-settings',settings),env)).status,200);
    const stored=sqlite.prepare('SELECT value FROM site_settings WHERE key=?').get('media_storage_v1').value;
    assert.doesNotMatch(stored,/TESTACCESSKEY|test-only-private-storage-key/);
    const bootstrap=await (await worker.fetch(request('/api/admin/bootstrap'),env)).json();
    assert.equal(bootstrap.media.configured,true);
    assert.equal(bootstrap.media.bucket,'negahjavan-media');
    assert.doesNotMatch(JSON.stringify(bootstrap),/TESTACCESSKEY|test-only-private-storage-key/);
    const publicBootstrap=await (await worker.fetch(request('/api/admin/bootstrap','GET',undefined,{Cookie:''}),env)).json();
    assert.equal(publicBootstrap.media,undefined);
    assert.equal((await worker.fetch(upload(png,'image/svg+xml'),env)).status,415);
    assert.equal((await worker.fetch(upload(new Uint8Array(32),'image/png'),env)).status,400);
    assert.equal((await worker.fetch(upload(png,'image/png',{'Content-Length':String(9*1024*1024),'X-Upload-Size':String(9*1024*1024)}),env)).status,413);
    const imageResponse=await worker.fetch(upload(),env);assert.equal(imageResponse.status,201);
    const image=(await imageResponse.json()).media;
    assert.match(image.url,/^\/media\/[a-f0-9-]{36}\.png$/);
    assert.deepEqual([...files.values()][0],png);
    assert.equal((await worker.fetch(request(image.url,'GET',undefined,{Cookie:''}),env)).status,404);
    assert.equal((await worker.fetch(request(image.url),env)).headers.get('Cache-Control'),'private, no-store');
    const video=(await (await worker.fetch(upload(mp4,'video/mp4'),env)).json()).media;
    const draft=await createArticle(env,{title:'خبر آزمایشی رسانه',body:'متن کوتاه خبر آزمایشی.',status:'draft',hero_image:image.url,video_url:video.url,video_type:video.mime,video_caption:'<img src=x onerror=alert(1)>',author_name:'نویسنده',format:'report'});
    assert.equal((await worker.fetch(request(video.url,'GET',undefined,{Cookie:''}),env)).status,404);
    await updateArticle(env,draft.id,{status:'published'});
    const published=await getArticle(env,draft.slug,false);
    assert.equal(published.video_url,video.url);assert.equal(published.author_name,'نویسنده');
    const page=articlePage(published);assert.match(page,/<video controls playsinline preload="metadata"/);assert.match(page,/type="video\/mp4"/);assert.doesNotMatch(page,/<img src=x|autoplay/);
    assert.equal((await worker.fetch(request(video.url,'HEAD',undefined,{Cookie:''}),env)).headers.get('content-type'),'video/mp4');
    const range=await worker.fetch(request(video.url,'GET',undefined,{Cookie:'',Range:'bytes=0-7'}),env);
    assert.equal(range.status,206);assert.equal(range.headers.get('content-range'),'bytes 0-7/32');assert.equal((await range.arrayBuffer()).byteLength,8);
    assert.equal((await worker.fetch(request(video.url,'GET',undefined,{Cookie:'',Range:'bytes=0-7,9-12'}),env)).status,416);
    assert.equal((await worker.fetch(jsonRequest('/api/admin/media-settings',{...settings,bucket:'negahjavan-other'}),env)).status,409);
    assert.equal((await worker.fetch(jsonRequest('/api/admin/articles/'+draft.id,{title:published.title,body:published.body,hero_image:video.url}),env)).status,400);
    await updateArticle(env,draft.id,{author_name:'نام تازه'});
    assert.equal((await getArticle(env,draft.slug,false)).video_url,video.url);
    assert.ok(calls.every(call=>call.path.startsWith('/negahjavan-media')));
  }finally{globalThis.fetch=originalFetch;sqlite.close()}
});
