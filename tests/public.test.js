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
