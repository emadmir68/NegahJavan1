import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import worker from '../src/worker.js';
import { homePage, articlePage, listingPage } from '../src/ui-public.js';
import { coverSvg } from '../src/cover.js';
import { videoPreviewScript } from '../src/media-layout.js';

test('empty home retains navigation without publishing placeholder news', () => {
  const page = homePage({latest:[],sections:{},breaking:[]});
  assert.equal((page.match(/<h1\b/g) || []).length, 1);
  assert.match(page, /جهان امروز/);
  assert.match(page, /mobile-navigation/);
  assert.doesNotMatch(page, /class="breaking"|برای نمایش نوار فوری|24\/7/);
  for (const script of page.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(script[1]);
});

test('article and search inputs cannot break out of HTML attributes or introduce unsafe URLs', () => {
  const unsafe = '<img src=x onerror=alert(1)>';
  const page = articlePage({title:unsafe,slug:'news',category:'technology',body:unsafe,hero_image:'javascript:alert(1)',source_url:'javascript:alert(1)'});
  assert.doesNotMatch(page, /<img src=x|href="javascript:|src="javascript:/);
  assert.match(page, /&lt;img src=x/);
  assert.match(page, /\/assets\/cover-technology-[0-2]-v2\.png/);
  const search = listingPage('جست‌وجو',[], '\" autofocus onfocus=alert(1) ');
  assert.match(search, /value="&quot; autofocus/);
  assert.doesNotMatch(search, /value="" autofocus/);
});

test('published video stories play on home and archive cards without navigating to the article', () => {
  const first={title:'فیلم نخست',slug:'first-video',category:'technology',status:'published',body:'خبر دارای فیلم.',video_url:'/media/123e4567-e89b-12d3-a456-426614174000.mp4',video_type:'video/mp4'};
  const second={...first,title:'فیلم دوم',slug:'second-video',hero_image:'https://images.example/poster.png',video_url:'https://videos.example/clip.webm',video_type:'video/webm'};
  const page=homePage({latest:[first,second],editorPicks:[first]});
  const lead=page.match(/<article class="frontpage-lead">([\s\S]*?)<div class="frontpage-lead-copy">/)[1];
  assert.match(lead, /^<div class="media-link frontpage-photo story-video" data-news-frame>/);
  assert.match(lead, /<video[^>]+controls playsinline preload="metadata"[^>]+data-card-video data-video-preview/);
  assert.doesNotMatch(lead, /poster="\/cover\//);
  assert.match(lead, /data-video-backdrop aria-hidden="true" hidden/);
  assert.match(lead, /<source src="\/media\/[^"]+\.mp4" type="video\/mp4">/);
  assert.match(lead, /aria-label="پخش ویدئوی خبر: فیلم نخست"/);
  assert.doesNotMatch(lead, /autoplay|aria-hidden="true"[^>]*><video|<a[^>]+class="media-link/);
  const archive=listingPage('تازه‌ترین خبرها',[first,second]);
  assert.equal((archive.match(/data-card-video data-video-preview>/g)||[]).length,2);
  assert.match(archive, /poster="https:\/\/images\.example\/poster\.png"/);
  assert.match(archive, /<source src="https:\/\/videos\.example\/clip\.webm" type="video\/webm">/);
  assert.match(archive, /<h3><a href="\/news\/first-video">فیلم نخست<\/a><\/h3>/);
  for(const script of page.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);
});

test('card videos preserve photo-only stories and reject unsafe video URLs and attributes', () => {
  const base={title:'خبر',slug:'story',category:'technology',body:'متن خبر.',hero_image:'https://images.example/photo.png'};
  const photo=listingPage('تازه‌ترین خبرها',[base]);
  assert.match(photo, /<a class="media-link" data-news-frame href="\/news\/story"[^>]*><img/);
  assert.doesNotMatch(photo, /<video\b|data-card-play hidden/);
  const unsafe=listingPage('تازه‌ترین خبرها',[{...base,video_url:'javascript:alert(1)'}]);
  assert.doesNotMatch(unsafe, /<video\b|src="javascript:/);
  const escaped=listingPage('تازه‌ترین خبرها',[{...base,title:'" onfocus="alert(1)',video_url:'https://videos.example/clip.mp4',hero_image:'javascript:alert(1)'}]);
  assert.match(escaped, /aria-label="ویدئوی خبر: &quot; onfocus=&quot;alert\(1\)"/);
  assert.doesNotMatch(escaped, /aria-label="" onfocus|poster="javascript:/);
});

test('video readers show one playable media frame instead of a duplicate graphic or photo cover', () => {
  const video={title:'فیلم خبر',slug:'video-reader',category:'society',body:'متن روایت.',video_url:'https://videos.example/story.mp4',video_type:'video/mp4'};
  for (const article of [video,{...video,hero_image:'https://images.example/poster.jpg'}]) {
    const page=articlePage(article);
    const main=page.match(/<main[\s\S]*?<\/main>/)[0];
    assert.equal((main.match(/<video\b/g)||[]).length,1);
    assert.doesNotMatch(main, /class="article-cover|تصویر گرافیکی تحریریه/);
    assert.ok(main.indexOf('<video') < main.indexOf('data-reader-body'));
    assert.match(main,/data-news-frame/);
    assert.match(main,/aria-label="ویدئوی خبر: فیلم خبر"/);
  }
  const photo=articlePage({...video,video_url:'',hero_image:'https://images.example/photo.jpg'});
  assert.match(photo,/class="media-link article-cover-frame" data-news-frame><img/);
  assert.doesNotMatch(photo,/<video\b/);
});

test('public font and latest news routes work without editorial authentication', async () => {
  const font = await worker.fetch(new Request('https://example.com/assets/vazirmatn-v33.woff2'),{});
  assert.equal(font.status,200);
  assert.equal(font.headers.get('content-type'),'font/woff2');
  assert.equal(Buffer.from(await font.arrayBuffer()).subarray(0,4).toString(),'wOF2');
  const latest = await worker.fetch(new Request('https://example.com/latest'),{});
  assert.equal(latest.status,200);
  assert.match(await latest.text(),/تازه‌ترین خبرها/);
});

test('graphic covers escape editorial text and do not clip long headlines into images', () => {
  const cover = coverSvg('technology','<script>alert(1)</script>');
  assert.doesNotMatch(cover, /<script>/);
  assert.match(cover, /&lt;script&gt;/);
  assert.match(cover, /تصویر گرافیکی تحریریه/);
});

test('smart covers are public PNG images even with no database or editorial login', async () => {
  const categories=['politics','incidents','world','economy','society','technology','culture','sports','general'];
  for(const category of categories)for(let variant=0;variant<3;variant++){
    const url='https://example.com/assets/cover-'+category+'-'+variant+'-v2.png';
    const response=await worker.fetch(new Request(url),{});
    assert.equal(response.status,200);
    assert.equal(response.headers.get('content-type'),'image/png');
    const png=Buffer.from(await response.arrayBuffer());
    assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16),960);
    assert.equal(png.readUInt32BE(20),540);
    const head=await worker.fetch(new Request(url,{method:'HEAD'}),{});
    assert.equal(head.status,200);
    assert.equal((await head.arrayBuffer()).byteLength,0);
  }
  assert.equal((await worker.fetch(new Request('https://example.com/assets/cover-missing-0-v2.png'),{})).status,404);
});

test('uploaded MP4 stories expose a WebM fallback on cards and in the reader', () => {
  const story={title:'فیلم',slug:'film',category:'society',body:'خبر فیلم.',video_url:'/media/123e4567-e89b-12d3-a456-426614174000.mp4',video_type:'video/mp4'};
  for(const page of [homePage({latest:[story]}),listingPage('خبرها',[story]),articlePage(story)]){
    assert.match(page,/<source src="\/media\/[a-f0-9-]+\.mp4\?format=webm" type="video\/webm" data-video-fallback>/);
    assert.match(page,/poster="\/assets\/cover-society-[0-2]-v2\.png" data-auto-poster="true"/);
    for(const script of page.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);
  }
  assert.doesNotMatch(articlePage({...story,video_url:'https://video.example/film.mp4'}),/<source[^>]+data-video-fallback/);
});

test('a browser decoding failure retries WebM once and resumes requested playback', async () => {
  const events=new Map(),notice={hidden:true},button={hidden:true};
  let loads=0,plays=0;
  const fallback={src:'https://example.com/media/film.mp4?format=webm'};
  const frame={querySelector:selector=>selector==='[data-card-video-error]'?notice:selector==='[data-card-play]'?button:null,classList:{remove(){}}};
  const video={dataset:{playRequested:'true'},paused:true,readyState:0,networkState:0,currentSrc:'https://example.com/media/film.mp4',closest:()=>frame,querySelector:()=>fallback,canPlayType:()=> 'probably',load(){loads++},play(){plays++;return Promise.resolve()},addEventListener(name,fn,options){const list=events.get(name)||[];list.push({fn,once:options?.once});events.set(name,list)}};
  const emit=name=>{const listeners=events.get(name)||[];events.set(name,listeners.filter(item=>!item.once));listeners.forEach(item=>item.fn());};
  new vm.Script(videoPreviewScript).runInNewContext({document:{querySelectorAll:()=>[video]},window:{}});
  emit('error');
  assert.equal(video.src,fallback.src);
  assert.equal(video.dataset.compatibilityAttempted,'true');
  assert.equal(notice.hidden,true);
  assert.equal(button.hidden,false);
  emit('loadeddata');
  await Promise.resolve();
  assert.equal(plays,1);
  const priorLoads=loads;
  emit('error');
  assert.equal(loads,priorLoads);
  assert.equal(notice.hidden,false);
});
