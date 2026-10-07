import { CATEGORY_LABELS } from './db.js';
import { readingMinutes } from './smart.js';
import { publicStyles, publicScript } from './design-system.js';
import { icon, brandWordmark, observatoryArt } from './design-art.js';

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
const coverUrl = article => '/cover/' + encodeURIComponent(article.slug) + '.svg';

function media(article, {className = 'story-media', eager = false} = {}) {
  const fallback = coverUrl(article);
  const image = safeHttps(article.hero_image);
  return `<img class="${className}" src="${esc(image || fallback)}" ${image ? `data-fallback="${esc(fallback)}"` : ''} alt="" width="1200" height="675" ${eager ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} decoding="async">`;
}

function shell(title, body, options = {}) {
  const description = options.description || 'نگاه جوان؛ خبر، تحلیل و روایت روشن تحولات ایران و جهان برای نسل امروز.';
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f5f8f9"><meta name="negahjavan-design" content="horizon-20261007"><meta name="negahjavan-brand" content="wordmark-red-v2"><link rel="icon" href="/assets/negahjavan-mark-v1.svg" type="image/svg+xml"><link rel="preload" href="/assets/vazirmatn-v33.woff2" as="font" type="font/woff2" crossorigin><title>${esc(title)} | نگاه جوان</title><meta name="description" content="${esc(description)}">${options.noindex ? '<meta name="robots" content="noindex,follow">' : ''}<meta property="og:locale" content="fa_IR"><meta property="og:site_name" content="نگاه جوان"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><style>${publicStyles}</style></head><body id="top" data-design="horizon-20261007"><a class="skip-link" href="#content">رفتن به محتوای اصلی</a>${body}<script>${publicScript}</script></body></html>`;
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

function metadata(article) {
  return `<div class="story-meta"><a class="category-label" href="${categoryUrl(categoryKey(article))}">${esc(CATEGORY_LABELS[categoryKey(article)])}</a>${article.published_at ? `<time datetime="${esc(article.published_at)}">${dateFa(article.published_at)}</time>` : ''}<span>${number(readingMinutes(article.body || ''))} دقیقه مطالعه</span></div>`;
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
  return `<section id="topics" class="section topics-section" aria-labelledby="topics-title"><div class="section-heading"><div><p class="heading-number">هر موضوع، یک دریچه</p><h2 id="topics-title">جهان از چند زاویه</h2><p>از موضوعی شروع کن که برایت مهم است.</p></div></div><div class="topic-grid">${topics.map(([key, description]) => `<a class="topic-card" href="${categoryUrl(key)}">${icon(key)}<span class="topic-arrow">${icon('northeast')}</span><h3>${esc(CATEGORY_LABELS[key])}</h3><p>${esc(description)}</p></a>`).join('')}</div></section>`;
}

function manifesto() {
  return '<div class="editorial-manifesto"><div class="manifesto-symbol" aria-hidden="true">«</div><p>برای فهمیدن جهان،<br>گاهی یک نگاه تازه کافی‌ست.</p><span>خبر را روشن روایت می‌کنیم؛ با عنوان دقیق، متن خوانا و منبعی که بتوان آن را دنبال کرد.</span></div>';
}

function brandHero() {
  return `<section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><div class="eyebrow">رسانه نسل امروز</div><h1 id="hero-title">جهان امروز.<br><em>نگاهی تازه.</em></h1><p class="hero-description">از اتفاق تا معنای آن؛ روایت روشن خبر،<br>برای نسلی که پرسش‌های تازه دارد.</p><div class="hero-actions"><a class="button button-primary" href="#latest">تازه‌ترین خبرها ${icon('arrow')}</a><a class="text-link" href="#topics">کاوش در موضوع‌ها ${icon('northeast')}</a></div><div class="hero-footnote"><span class="tiny-mark">${icon('newspaper')}</span><span>خبر، تحلیل و روایت</span><span>ایران و جهان</span></div></div>${observatoryArt()}</section>`;
}

function featuredHero(article) {
  const category = categoryKey(article);
  return `<section class="hero is-featured" aria-labelledby="hero-title"><div class="hero-copy"><div class="eyebrow">${article.status === 'breaking' ? 'در کانون خبر · فوری' : 'در کانون خبر'} · ${esc(CATEGORY_LABELS[category])}</div><h1 id="hero-title">${esc(article.title)}</h1>${article.excerpt ? `<p class="hero-description">${esc(article.excerpt)}</p>` : ''}<div class="hero-actions"><a class="button button-primary" href="${articleUrl(article)}">روایت کامل ${icon('arrow')}</a><a class="text-link" href="#topics">خبرهای بیشتر ${icon('northeast')}</a></div><div class="hero-footnote"><span class="tiny-mark">${icon('time')}</span><span>${number(readingMinutes(article.body || ''))} دقیقه مطالعه</span><span>${dateFa(article.published_at)}</span></div></div><a class="featured-media" href="${articleUrl(article)}" tabindex="-1" aria-hidden="true">${media(article, {className: 'featured-photo', eager: true})}<span class="photo-marker">${esc(CATEGORY_LABELS[category])}</span><div class="featured-caption"><b>نگاه جوان</b><span>خبر، از زاویه‌ای تازه</span>${icon('northeast')}</div></a></section>`;
}

export function homePage(data = {}) {
  const latest = data.latest || [];
  const hero = data.hero || null;
  const fresh = hero ? latest.filter(article => article.slug !== hero.slug) : latest;
  const breaking = (data.breaking || []).slice(0, 5);
  const breakingBar = breaking.length ? `<div class="breaking"><span class="breaking-label">فوری</span><div class="breaking-track">${breaking.map(article => `<a href="${articleUrl(article)}">${esc(article.title)}</a>`).join('')}</div></div>` : '';
  const freshLayout = fresh.length >= 4 ? `<div class="content-columns">${leadStory(fresh[0])}<div class="stream">${fresh.slice(1, 5).map(streamStory).join('')}<a class="stream-all" href="/latest">آرشیو همه خبرها ${icon('arrow')}</a></div></div>` : `<div class="news-grid" data-count="${fresh.length}">${fresh.map(storyCard).join('')}</div>`;
  const latestBlock = fresh.length ? `<section id="latest" class="section">${sectionHeading('در جریان خبر', 'تازه‌ترین روایت‌ها', 'اتفاق‌های مهم را از اینجا دنبال کن.')}${freshLayout}</section>` : !hero ? `<section id="latest" class="section">${sectionHeading('در جریان خبر', 'تازه‌ترین روایت‌ها')}${emptyState()}</section>` : '';
  const additional = fresh.slice(5, 11);
  const additionalBlock = additional.length ? `<section class="section category-section">${sectionHeading('روایت‌های بیشتر', 'کمی عمیق‌تر بخوان')}<div class="news-grid">${additional.map(storyCard).join('')}</div></section>` : '';
  const displayed = new Set([hero?.slug, ...fresh.slice(0, 11).map(article => article.slug)]);
  const categoryBlocks = topics.map(([key, description]) => {
    const articles = (data.sections?.[key] || []).filter(article => !displayed.has(article.slug)).slice(0, 3);
    if (articles.length < 3) return '';
    articles.forEach(article => displayed.add(article.slug));
    return `<section class="section category-section">${sectionHeading(CATEGORY_LABELS[key], 'از تحریریه', description, categoryUrl(key))}<div class="news-grid">${articles.map(storyCard).join('')}</div></section>`;
  }).filter(Boolean).slice(0, 4).join('');
  const strip = `<div class="topic-strip"><span>از اینجا شروع کن</span><div class="topic-strip-links">${['world', 'economy', 'society', 'technology', 'culture'].map(key => `<a href="${categoryUrl(key)}">${icon(key)}${esc(CATEGORY_LABELS[key])}</a>`).join('')}</div></div>`;
  return shell('نگاه جوان', `${header('home')}<main id="content"><div class="homepage-intro"><div class="wrap">${breakingBar}<div class="edition-line"><span>روایت روشنِ ایران و جهان</span><small lang="en" dir="ltr">A FRESH PERSPECTIVE</small></div>${hero ? featuredHero(hero) : brandHero()}${strip}</div></div><div class="wrap">${latestBlock}${additionalBlock}${categoryBlocks}${topicExplorer()}${manifesto()}</div></main>${footer()}`);
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
  const sourceUrl = safeHttps(article.source_url);
  const paragraphs = String(article.body || '').split(/\n{2,}/).map(paragraph => paragraph.trim()).filter(Boolean).map(paragraph => `<p>${esc(paragraph)}</p>`).join('');
  const source = article.source_name || sourceUrl ? `<div class="source">منبع روایت: ${sourceUrl ? `<a href="${esc(sourceUrl)}" rel="noopener noreferrer" target="_blank">${esc(article.source_name || new URL(sourceUrl).hostname)}</a>` : esc(article.source_name)}</div>` : '';
  return shell(article.title, `${header(key)}<main id="content" class="wrap"><header class="article-heading"><nav class="breadcrumbs" aria-label="مسیر صفحه"><a href="/">نگاه جوان</a><span>/</span><a href="${categoryUrl(key)}">${esc(CATEGORY_LABELS[key])}</a><span>/</span><span>روایت خبر</span></nav><a class="article-category" href="${categoryUrl(key)}">${icon(key)}${esc(CATEGORY_LABELS[key])}</a><h1>${esc(article.title)}</h1>${article.excerpt ? `<p class="article-excerpt">${esc(article.excerpt)}</p>` : ''}<div class="article-bar"><div class="article-meta"><time datetime="${esc(article.published_at || '')}">${dateFa(article.published_at, true)}</time><span>${icon('time')}${number(readingMinutes(article.body || ''))} دقیقه مطالعه</span></div><div class="article-tools"><button class="icon-button" type="button" aria-label="ذخیره خبر در این مرورگر" aria-pressed="false" data-save-article>${icon('bookmark')}</button><button class="icon-button" type="button" aria-label="اشتراک‌گذاری یا کپی لینک خبر" data-share-article>${icon('share')}</button></div></div><div class="action-notice" role="status" aria-live="polite" data-action-notice></div></header><div class="article-cover">${media(article, {className: 'article-photo', eager: true})}</div>${!safeHttps(article.hero_image) ? '<p class="image-caption">تصویر گرافیکی تحریریه نگاه جوان</p>' : ''}<div class="article-content"><article class="article-body">${paragraphs}${source}<div class="article-end"><a class="text-link" href="${categoryUrl(key)}">روایت‌های بیشتر در ${esc(CATEGORY_LABELS[key])} ${icon('arrow')}</a><a class="text-link" href="/">بازگشت به نگاه جوان ${icon('northeast')}</a></div></article><aside class="article-aside">${icon('newspaper')}<h2>در یک نگاه</h2><p>${esc(article.excerpt || 'متن کامل این روایت را در همین صفحه بخوانید.')}</p><a class="text-link" href="${categoryUrl(key)}">خبرهای ${esc(CATEGORY_LABELS[key])} ${icon('arrow')}</a></aside></div></main>${footer()}`, {description: article.excerpt});
}

export function notFoundPage() {
  return shell('صفحه پیدا نشد', `${header()}<main id="content" class="wrap"><div class="error-page"><div class="error-symbol" aria-hidden="true">۴۰۴</div><h1>این روایت را پیدا نکردیم.</h1><p>ممکن است آدرس صفحه تغییر کرده باشد. از صفحه اصلی، دوباره شروع کن.</p><a class="button button-primary" href="/">بازگشت به نگاه جوان ${icon('arrow')}</a></div></main>${footer()}`, {noindex: true});
}
