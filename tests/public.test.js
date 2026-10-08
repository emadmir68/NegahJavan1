import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import worker from '../src/worker.js';
import { homePage, articlePage, listingPage } from '../src/ui-public.js';
import { coverSvg } from '../src/cover.js';

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
  assert.match(page, /\/cover\/news\.svg/);
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
