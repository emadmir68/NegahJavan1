import { CATEGORY_LABELS } from './db.js';
import { readingMinutes, autoExcerpt } from './smart.js';
import { publicStyles, publicScript } from './design-system.js';
import { icon, brandWordmark, signatureArt } from './design-art.js';
import { magazineStyles, readerScript } from './magazine-design.js';

const esc = (value = '') => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const number = value => Number(value || 0).toLocaleString('fa-IR');
const topics = [
  ['politics', 'سیاست و تصمیم‌های اثرگذار'],
  ['incidents', 'رویدادها و خبرهای حادثه'],
  ['world', 'ایران، منطقه و جهان'],
  ['economy', 'بازار، پول و زندگی'],
  ['society', 'آدم‌ها و زندگی اجتماعی'],
  ['technology', 'نوآوری و آینده دیجیتال'],
  ['culture', 'هنر، کتاب و اندیشه'],
  ['sports', 'رقابت، تیم و قهرمانی'],
];

function dateFa(value, includeTime = false) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('fa-IR', {
    day: 'numeric', month: 'long', year: 'numeric',
    ...(includeTime ? {hour: '2-digit', minute: '2-digit'} : {}),
    timeZone: 'Asia/Tehran',
  }).format(date);
}

function safeHttps(value) {
  try {
    const url = new URL(String(value || '').trim());
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}

const articleUrl = article => '/news/' + encodeURIComponent(article.slug);
const categoryKey = article => CATEGORY_LABELS[article?.category] ? article.category : 'general';
const categoryUrl = key => '/category/' + encodeURIComponent(key);
const coverUrl = article => '/cover/' + encodeURIComponent(article.slug) + '.svg?v=signature-1';

function media(article, {className = 'story-media', eager = false} = {}) {
  const fallback = coverUrl(article);
  const image = safeHttps(article.hero_image);
  return `<img class="${className}" src="${esc(image || fallback)}" data-graphic-cover="${!image}" ${image ? `data-fallback="${esc(fallback)}"` : ''} alt="" width="1200" height="675" ${eager ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} decoding="async">`;
}

function shell(title, body, options = {}) {
  const description = options.description || 'نگاه جوان؛ خبر، تحلیل و روایت روشن تحولات ایران و جهان برای نسل امروز.';
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f5f8f9"><meta name="negahjavan-design" content="signature-20261007"><meta name="negahjavan-brand" content="wordmark-red-v2"><link rel="icon" href="/assets/negahjavan-mark-v1.svg" type="image/svg+xml"><link rel="preload" href="/assets/vazirmatn-v33.woff2" as="font" type="font/woff2" crossorigin><title>${esc(title)} | نگاه جوان</title><meta name="description" content="${esc(description)}">${options.noindex ? '<meta name="robots" content="noindex,follow">' : ''}<meta property="og:locale" content="fa_IR"><meta property="og:site_name" content="نگاه جوان"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><style>${publicStyles}${magazineStyles}</style></head><body id="top" data-design="signature-20261007"><a class="skip-link" href="#content">رفتن به محتوای اصلی</a>${body}<script>${publicScript}${readerScript}</script></body></html>`;
}

function header(current = '') {
  const categoryLinks = topics.map(([key]) => `<a href="${categoryUrl(key)}" ${current === key ? 'aria-current="page"' : ''}>${esc(CATEGORY_LABELS[key])}</a>`).join('');
  const mainLinks = [['/', 'خانه', 'home'], ['/latest', 'تازه‌ترین‌ها', 'latest'], ['/#topics', 'موضوع‌ها', 'topics']].map(([url, label, key]) => `<a href="${url}" ${current === key ? 'aria-current="page"' : ''}>${label}</a>`).join('');
  return `<header class="site-header"><div class="wrap header-main"><a class="brand brand-lockup" href="/" aria-label="نگاه جوان، صفحه اصلی">${brandWordmark()}<span class="brand-tagline">خبر، از زاویه‌ای تازه</span></a><nav class="primary-nav" aria-label="منوی اصلی">${mainLinks}</nav><div class="header-actions"><a class="icon-button" href="/search" aria-label="جست‌وجو در خبرها">${icon('search')}</a><a class="editor-link" href="/editorial"><span>ورود تحریریه</span>${icon('northeast')}</a><button class="icon-button mobile-menu-button" type="button" aria-label="باز کردن منو" aria-expanded="false" aria-controls="mobile-navigation" data-menu-toggle>${icon('menu')}</button></div></div><div class="wrap header-secondary"><nav class="category-nav" aria-label="موضوع‌های خبری">${categoryLinks}</nav><time class="header-date">${dateFa(new Date())}</time></div></header><div id="mobile-navigation" class="mobile-navigation" hidden><nav class="mobile-main-links" aria-label="صفحات اصلی">${mainLinks}</nav><p>جهان را از زاویه مورد علاقه‌ات دنبال کن.</p><nav aria-label="موضوع‌ها در موبایل">${topics.map(([key]) => `<a href="${categoryUrl(key)}">${icon(key)}${esc(CATEGORY_LABELS[key])}</a>`).join('')}</nav><a class="mobile-editor-link" href="/editorial">ورود به تحریریه ${icon('arrow')}</a></div>`;
}

function footer() {
  const year = new Intl.DateTimeFormat('fa-IR', {year: 'numeric', timeZone: 'Asia/Tehran'}).format(new Date());
  return `<footer class="site-footer"><div class="wrap footer-main"><div class="footer-brand"><a class="brand brand-lockup" href="/" aria-label="نگاه جوان، صفحه اصلی">${brandWordmark()}<span class="brand-tagline">روایت روشن، نگاه تازه</span></a><p>خبر، فقط آنچه اتفاق افتاده نیست.<br>فرصتی است برای دقیق‌تر دیدن جهان.</p></div><nav class="footer-topics" aria-label="موضوع‌های خبری در پایین صفحه">${topics.map(([key]) => `<a href="${categoryUrl(key)}">${esc(CATEGORY_LABELS[key])}</a>`).join('')}</nav><div class="footer-end"><a href="/latest">تازه‌ترین خبرها ${icon('arrow')}</a><a href="/search">جست‌وجوی خبر ${icon('search')}</a><a href="/editorial">ورود تحریریه ${icon('northeast')}</a></div></div><div class="wrap footer-bottom"><span>© ${year} نگاه جوان · خبر، تحلیل و دیدگاه با هویت روشن.</span><a href="#top">بازگشت به بالا ${icon('up')}</a></div></footer>`;
}

const formatLabel = article => article.format === 'analysis' ? 'تحلیل' : article.format === 'report' ? 'گزارش' : '';
const formatBadge = article => formatLabel(article) ? `<span class="story-format story-format-${article.format}">${formatLabel(article)}</span>` : '';

function metadata(article) {
  return `<div class="story-meta"><a class="category-label" href="${categoryUrl(categoryKey(article))}">${esc(CATEGORY_LABELS[categoryKey(article)])}</a>${formatBadge(article)}${article.published_at ? `<time datetime="${esc(article.published_at)}">${dateFa(article.published_at)}</time>` : ''}<span>${number(readingMinutes(article.body || ''))} دقیقه مطالعه</span></div>`;
}

function storyCard(article) {
  const url = articleUrl(article);
  return `<article class="story-card"><a class="media-link" href="${url}" tabindex="-1" aria-hidden="true">${media(article)}</a>${metadata(article)}<h3><a href="${url}">${esc(article.title)}</a></h3>${article.excerpt ? `<p class="excerpt">${esc(article.excerpt)}</p>` : ''}</article>`;
}

function leadStory(article) {
  return `<article class="lead-story"><a class="media-link" href="${articleUrl(article)}" tabindex="-1" aria-hidden="true">${media(article)}</a>${metadata(article)}<h3><a href="${articleUrl(article)}">${esc(article.title)}</a></h3>${article.excerpt ? `<p class="excerpt">${esc(article.excerpt)}</p>` : ''}</article>`;
}

function streamStory(article) {
  return `<article class="stream-item"><a class="media-link" href="${articleUrl(article)}" tabindex="-1" aria-hidden="true">${media(article)}</a><div><div class="story-meta"><a class="category-label" href="${categoryUrl(categoryKey(article))}">${esc(CATEGORY_LABELS[categoryKey(article)])}</a></div><h3><a href="${articleUrl(article)}">${esc(article.title)}</a></h3><time datetime="${esc(article.published_at || '')}">${dateFa(article.published_at)}</time></div></article>`;
}

function emptyState(title = 'داستان بعدی، اینجا آغاز می‌شود.', description = 'تازه‌ترین خبرها پس از انتشار تحریریه، در این بخش قرار می‌گیرند.', link = '/#topics', linkLabel = 'موضوع‌های خبری را ببین') {
  return `<div class="empty-news"><div><h3>${esc(title)}</h3><p>${esc(description)}</p><a class="text-link" href="${link}">${linkLabel} ${icon('arrow')}</a></div><div class="empty-emblem" aria-hidden="true">${icon('newspaper')}</div></div>`;
}

function sectionHeading(title, eyebrow, description = '', href = '/latest', linkLabel = 'همه خبرها') {
  return `<div class="section-heading"><div><p class="heading-number">${esc(eyebrow)}</p><h2>${esc(title)}</h2>${description ? `<p>${esc(description)}</p>` : ''}</div>${href ? `<a class="text-link" href="${href}">${linkLabel} ${icon('arrow')}</a>` : ''}</div>`;
}

function topicExplorer() {
  const ordered = ['world','technology',...topics.map(([key]) => key).filter(key => !['world','technology'].includes(key))];
  return `<section id="topics" class="section topics-section" aria-labelledby="topics-title"><div class="section-heading"><div><p class="heading-number">هر موضوع، یک دریچه</p><h2 id="topics-title">جهان از چند زاویه</h2><p>از موضوعی شروع کن که برایت مهم است.</p></div></div><div class="topic-grid">${ordered.map(key => {
    const description = topics.find(topic => topic[0] === key)[1];
    const featured = ['world','technology'].includes(key);
    return `<a class="topic-card ${featured ? 'topic-card-featured' : ''}" data-topic="${key}" href="${categoryUrl(key)}"><span class="topic-icon">${icon(key)}</span><span class="topic-arrow">${icon('northeast')}</span>${featured ? `<span class="topic-watermark" aria-hidden="true">${icon(key)}</span>` : ''}<div class="topic-copy"><h3>${esc(CATEGORY_LABELS[key])}</h3><p>${esc(description)}</p></div></a>`;
  }).join('')}</div></section>`;
}

function manifesto() {
  return '<div class="editorial-manifesto"><div class="manifesto-symbol" aria-hidden="true">«</div><p>برای فهمیدن جهان،<br>گاهی یک نگاه تازه کافی‌ست.</p><span>خبر را روشن روایت می‌کنیم؛ با عنوان دقیق، متن خوانا و منبعی که بتوان آن را دنبال کرد.</span></div>';
}

function brandHero(compact = false) {
  return `<section class="edition-hero ${compact ? 'edition-hero-compact' : ''}" aria-labelledby="${compact ? 'edition-title' : 'hero-title'}"><div class="edition-hero-copy"><div class="eyebrow">رسانه نسل امروز</div>${compact ? '<h2 id="edition-title">جهان امروز، از نگاه جوان.</h2>' : '<h1 id="hero-title">جهان امروز.<br><em>نگاهی تازه.</em></h1>'}<p>خبر را روشن بخوان؛ جهان را دقیق‌تر ببین.</p></div>${signatureArt()}${compact ? '' : `<div class="edition-hero-bar"><div class="edition-hero-actions"><a class="button button-primary" href="/latest">تازه‌ترین خبرها ${icon('arrow')}</a><a class="text-link" href="#topics">موضوع‌های خبری ${icon('northeast')}</a></div><span class="edition-hero-caption">هر خبر، یک زاویه تازه</span></div>`}</section>`;
}

function featuredHero(article) {
  return `<article class="frontpage-lead"><a class="media-link frontpage-photo" href="${articleUrl(article)}" tabindex="-1" aria-hidden="true">${media(article, {eager:true})}<span class="focus-label">${article.status === 'breaking' ? 'خبر فوری' : 'در کانون خبر'}</span></a><div class="frontpage-lead-copy">${metadata(article)}<h1 id="hero-title"><a href="${articleUrl(article)}">${esc(article.title)}</a></h1>${article.excerpt ? `<p>${esc(article.excerpt)}</p>` : ''}<a class="text-link" href="${articleUrl(article)}">روایت کامل ${icon('arrow')}</a></div></article>`;
}

function complementStory(article) {
  return `<article class="complement-story"><a class="media-link" href="${articleUrl(article)}" tabindex="-1" aria-hidden="true">${media(article)}</a>${metadata(article)}<h2><a href="${articleUrl(article)}">${esc(article.title)}</a></h2></article>`;
}

function newsTimeline(articles) {
  if (!articles.length) return '';
  return `<aside class="news-timeline" aria-labelledby="timeline-title"><div class="timeline-heading"><span class="note-dot" aria-hidden="true"></span><h2 id="timeline-title">تازه‌ترین‌ها</h2>${icon('time')}</div><ol>${articles.map(article => `<li><time datetime="${esc(article.published_at || '')}">${dateFa(article.published_at, true)}</time><h3><a href="${articleUrl(article)}">${esc(article.title)}</a></h3><a class="category-label" href="${categoryUrl(categoryKey(article))}">${esc(CATEGORY_LABELS[categoryKey(article)])}</a></li>`).join('')}</ol><a class="text-link" href="/latest">همه خبرها ${icon('arrow')}</a></aside>`;
}

function dayKey(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-CA', {year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Asia/Tehran'}).format(date);
}

export function todaysBrief(articles, now = new Date()) {
  const current = new Date(now);
  return articles.filter(article => ['published','breaking'].includes(article.status) && article.published_at && new Date(article.published_at) <= current && dayKey(article.published_at) === dayKey(current)).slice(0,3).map(article => ({ ...article, brief: String(article.excerpt || autoExcerpt(article.body || '', article.title || '')).split(/\s+/).filter(Boolean).slice(0,34).join(' ') }));
}

function briefingSection(articles) {
  const brief = todaysBrief(articles);
  if (!brief.length) return '';
  return `<section class="section daily-brief" aria-labelledby="brief-title"><div class="brief-intro"><span class="brief-clock">${icon('time')}</span><p class="heading-number">مرور کوتاه خبرهای امروز</p><h2 id="brief-title">امروز،<br>در یک دقیقه.</h2><p>${dateFa(new Date())} · ${number(brief.length)} روایت کوتاه</p><a class="text-link" href="/latest">همه خبرهای تازه ${icon('arrow')}</a></div><ol class="brief-stories">${brief.map((article,index) => `<li><span class="brief-number">${number(index+1).padStart(2,'۰')}</span><div><a class="category-label" href="${categoryUrl(categoryKey(article))}">${esc(CATEGORY_LABELS[categoryKey(article)])}</a><h3><a href="${articleUrl(article)}">${esc(article.title)}</a></h3>${article.brief ? `<p>${esc(article.brief)}${String(article.excerpt || article.body).split(/\s+/).length > 34 ? '…' : ''}</p>` : ''}</div><a class="brief-arrow" href="${articleUrl(article)}" aria-label="متن کامل: ${esc(article.title)}">${icon('northeast')}</a></li>`).join('')}</ol></section>`;
}

function editorPicks(articles) {
  if (!articles.length) return '';
  return `<section class="section editors-picks" aria-labelledby="picks-title"><div class="section-heading"><div><p class="heading-number">برای دقیق‌تر دیدن</p><h2 id="picks-title">انتخاب سردبیر</h2></div><span class="edition-seal">${icon('bookmark')} منتخب تحریریه</span></div><div class="news-grid" data-count="${articles.length}">${articles.slice(0,3).map(storyCard).join('')}</div></section>`;
}

function dossierSection(dossier = {}) {
  const articles = dossier.articles || [];
  if (!dossier.title || !articles.length) return '';
  return `<section class="section dossier-panel" aria-labelledby="dossier-title"><div class="dossier-intro"><p class="heading-number">پرونده ویژه</p><h2 id="dossier-title">${esc(dossier.title)}</h2>${dossier.description ? `<p>${esc(dossier.description)}</p>` : ''}<a class="text-link" href="${articleUrl(articles[0])}">شروع مطالعه ${icon('arrow')}</a><span class="dossier-count">${number(articles.length)} روایت · یک پرونده</span></div><div class="dossier-stories">${articles.slice(0,4).map((article,index) => `<article><span>${number(index+1).padStart(2,'۰')}</span><a class="media-link" href="${articleUrl(article)}" tabindex="-1" aria-hidden="true">${media(article)}</a><div><a class="category-label" href="${categoryUrl(categoryKey(article))}">${esc(CATEGORY_LABELS[categoryKey(article)])}</a><h3><a href="${articleUrl(article)}">${esc(article.title)}</a></h3></div></article>`).join('')}</div></section>`;
}

export function homePage(data = {}) {
  const latest = data.latest || [];
  const hero = data.hero || latest[0] || null;
  const fresh = latest.filter(article => article.slug !== hero?.slug);
  const complements = fresh.slice(0,2);
  const timeline = fresh.slice(2,7);
  const breaking = (data.breaking || []).slice(0,5);
  const breakingBar = breaking.length ? `<div class="breaking"><span class="breaking-label">فوری</span><div class="breaking-track">${breaking.map(article => `<a href="${articleUrl(article)}">${esc(article.title)}</a>`).join('')}</div></div>` : '';
  const top = hero ? `${brandHero(true)}<section id="latest" class="frontpage-grid" data-complements="${Boolean(complements.length)}" data-timeline="${Boolean(timeline.length)}" aria-labelledby="hero-title">${featuredHero(hero)}${complements.length ? `<div class="frontpage-complements">${complements.map(complementStory).join('')}</div>` : ''}${newsTimeline(timeline)}</section>` : `${brandHero()}<div id="latest" class="edition-publishing-state"><span>${icon('newspaper')}خبرها پس از انتشار تحریریه، اینجا نمایش داده می‌شوند.</span><a class="text-link" href="/latest">آرشیو خبرها ${icon('arrow')}</a></div>`;
  const used = new Set([hero?.slug, ...fresh.slice(0,7).map(article => article.slug)]);
  const remaining = fresh.slice(7,13);
  remaining.forEach(article => used.add(article.slug));
  const latestBlock = remaining.length ? `<section class="section">${sectionHeading('در جریان خبر','روایت‌های بیشتر')}<div class="news-grid" data-count="${remaining.length}">${remaining.map(storyCard).join('')}</div></section>` : '';
  const categories = topics.map(([key,description]) => {
    const articles = (data.sections?.[key] || []).filter(article => !used.has(article.slug)).slice(0,3);
    if (articles.length < 3) return '';
    articles.forEach(article => used.add(article.slug));
    return `<section class="section category-section">${sectionHeading(CATEGORY_LABELS[key],'از تحریریه',description,categoryUrl(key))}<div class="news-grid">${articles.map(storyCard).join('')}</div></section>`;
  }).filter(Boolean).slice(0,4).join('');
  return shell('نگاه جوان', `${header('home')}<main id="content"><div class="homepage-intro edition-frontpage"><div class="wrap">${breakingBar}<div class="edition-line"><span>روایت روشنِ ایران و جهان</span><time>${dateFa(new Date())}</time></div>${top}</div></div><div class="wrap">${briefingSection(latest)}${editorPicks(data.editorPicks || [])}${dossierSection(data.dossier)}${latestBlock}${categories}${topicExplorer()}${manifesto()}</div></main>${footer()}`);
}

export function listingPage(title, items = [], query = '') {
  const isSearch = title === 'جست‌وجو';
  const category = topics.find(([key]) => CATEGORY_LABELS[key] === title)?.[0];
  const descriptions = category ? topics.find(([key]) => key === category)?.[1] : 'همه روایت‌های منتشرشده در نگاه جوان، به ترتیب زمان انتشار.';
  const form = isSearch ? `<form class="search-form" action="/search" method="get" role="search"><input name="q" type="search" value="${esc(query)}" aria-label="جست‌وجو در خبرها" placeholder="دنبال کدام خبر می‌گردی؟" maxlength="200"><button class="button button-primary" type="submit">${icon('search')} جست‌وجو</button></form>` : '';
  const content = items.length ? `<div class="archive-count">${number(items.length)} روایت${query ? ` درباره «${esc(query)}»` : ''}</div><div class="news-grid">${items.map(storyCard).join('')}</div>` : isSearch ? query ? emptyState('روایتی با این عبارت پیدا نشد.', 'عبارت کوتاه‌تر یا واژه دیگری را امتحان کن.', '/search', 'جست‌وجوی تازه') : emptyState('از یک پرسش شروع کن.', 'عنوان، موضوع یا یک واژه از خبر مورد نظرت را جست‌وجو کن.', '/#topics', 'دیدن موضوع‌ها') : emptyState('روایت‌های تازه در راه‌اند.', 'خبرهای این بخش پس از انتشار در اینجا نمایش داده می‌شوند.');
  return shell(title, `${header(category || (isSearch ? 'search' : 'latest'))}<main id="content" class="wrap"><section class="archive-hero"><div class="breadcrumbs"><a href="/">نگاه جوان</a><span>/</span><span>${esc(title)}</span></div><h1>${esc(title)}</h1><p>${isSearch ? 'در میان خبرها و روایت‌های نگاه جوان، دقیق‌تر جست‌وجو کن.' : esc(descriptions)}</p>${form}</section><section class="archive-body">${content}</section></main>${footer()}`, {noindex: isSearch});
}

export function articlePage(article) {
  if (!article) return notFoundPage();
  const key = categoryKey(article);
  const hasPhoto = Boolean(safeHttps(article.hero_image));
  const sourceUrl = safeHttps(article.source_url);
  const parts = String(article.body || '').split(/\n{2,}/).map(part => part.trim()).filter(Boolean);
  const headings = [];
  const paragraphs = parts.map((part,index) => {
    if (/^## +[^\n]{1,140}$/.test(part)) {
      const title = part.replace(/^## +/,'');
      headings.push({id:'section-'+index,title});
      return `<h2 id="section-${index}">${esc(title)}</h2>`;
    }
    return `<p>${esc(part)}</p>`;
  }).join('');
  const summary = article.excerpt || autoExcerpt(parts.filter(part => !/^## /.test(part)).join('\n\n'), article.title || '');
  const source = article.source_name || sourceUrl ? `<div class="source">منبع روایت: ${sourceUrl ? `<a href="${esc(sourceUrl)}" rel="noopener noreferrer" target="_blank">${esc(article.source_name || new URL(sourceUrl).hostname)}</a>` : esc(article.source_name)}</div>` : '';
  const updated = article.updated_at && new Date(article.updated_at) > new Date(article.published_at) ? `<span>به‌روزرسانی: <time datetime="${esc(article.updated_at)}">${dateFa(article.updated_at,true)}</time></span>` : '';
  const author = article.author_name ? `<div class="reader-author"><span class="author-initial" aria-hidden="true">${esc(article.author_name.slice(0,1))}</span><span><small>نویسنده</small><b>${esc(article.author_name)}</b></span></div>` : '<div class="reader-publisher">روایت نگاه جوان</div>';
  const tools = `<div class="article-tools"><div class="reader-font-controls" role="group" aria-label="اندازه متن خبر"><button type="button" data-reader-size="smaller" aria-label="کوچک‌تر کردن متن">A−</button><output data-reader-size-label aria-live="polite">۱۰۰٪</output><button type="button" data-reader-size="larger" aria-label="بزرگ‌تر کردن متن">A+</button></div><button class="icon-button" type="button" aria-label="ذخیره خبر در این مرورگر" aria-pressed="false" data-save-article>${icon('bookmark')}</button><button class="icon-button" type="button" aria-label="اشتراک‌گذاری یا کپی لینک خبر" data-share-article>${icon('share')}</button></div>`;
  const toc = headings.length > 1 ? `<nav class="reader-toc" aria-label="در این روایت"><h2>در این روایت</h2>${headings.map(heading => `<a href="#${heading.id}">${esc(heading.title)}</a>`).join('')}</nav>` : '';
  return shell(article.title, `${header(key)}<div class="reading-progress" role="progressbar" aria-label="پیشرفت مطالعه خبر" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-reading-progress><span></span></div><main id="content" class="wrap reader-page"><header class="article-heading"><nav class="breadcrumbs" aria-label="مسیر صفحه"><a href="/">نگاه جوان</a><span>/</span><a href="${categoryUrl(key)}">${esc(CATEGORY_LABELS[key])}</a><span>/</span><span>روایت خبر</span></nav><a class="article-category" href="${categoryUrl(key)}">${icon(key)}${esc(CATEGORY_LABELS[key])}</a>${formatBadge(article)}<h1>${esc(article.title)}</h1>${summary ? `<div class="reader-deck"><span class="reader-deck-label">در یک نگاه</span><p class="article-excerpt">${esc(summary)}</p></div>` : ''}<div class="reader-byline">${author}<div class="article-meta">${article.published_at ? `<time datetime="${esc(article.published_at)}">${dateFa(article.published_at,true)}</time>` : ''}<span>${icon('time')}${number(readingMinutes(article.body || ''))} دقیقه مطالعه</span>${updated}</div></div><div class="article-bar"><span class="reader-tools-label">برای مطالعه بهتر</span>${tools}</div><div class="action-notice" role="status" aria-live="polite" data-action-notice></div></header><figure class="article-cover ${hasPhoto ? '' : 'article-cover-graphic'}">${media(article,{className:'article-photo',eager:true})}${hasPhoto ? '' : '<figcaption>تصویر گرافیکی تحریریه نگاه جوان</figcaption>'}</figure><div class="article-content"><article class="article-body reader-prose" data-reader-body>${paragraphs}${source}<div class="article-end"><a class="text-link" href="${categoryUrl(key)}">روایت‌های بیشتر در ${esc(CATEGORY_LABELS[key])} ${icon('arrow')}</a><a class="text-link" href="/">بازگشت به نگاه جوان ${icon('northeast')}</a></div></article><aside class="article-aside">${toc}<div class="reader-context">${icon('newspaper')}<h2>از این زاویه بخوان</h2><p>${esc(CATEGORY_LABELS[key])} در نگاه جوان؛ خبرها و روایت‌های مرتبط را دنبال کن.</p><a class="text-link" href="${categoryUrl(key)}">خبرهای ${esc(CATEGORY_LABELS[key])} ${icon('arrow')}</a></div></aside></div></main>${footer()}`,{description:summary});
}

export function notFoundPage() {
  return shell('صفحه پیدا نشد', `${header()}<main id="content" class="wrap"><div class="error-page"><div class="error-symbol" aria-hidden="true">۴۰۴</div><h1>این روایت را پیدا نکردیم.</h1><p>ممکن است آدرس صفحه تغییر کرده باشد. از صفحه اصلی، دوباره شروع کن.</p><a class="button button-primary" href="/">بازگشت به نگاه جوان ${icon('arrow')}</a></div></main>${footer()}`, {noindex: true});
}
