import { normalizePersianText, smartTitle, smartBody, autoExcerpt, inferCategory } from './smart.js';

export const CATEGORY_LABELS = {
  politics: "سیاسی",
  incidents: "حوادث",
  world: "بین‌الملل",
  economy: "اقتصاد",
  society: "جامعه",
  technology: "فناوری",
  culture: "فرهنگ",
  sports: "ورزش",
  general: "عمومی"
};

const INIT_SQL = [
  `CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'general',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','breaking')),
    hero_image TEXT NOT NULL DEFAULT '',
    source_name TEXT NOT NULL DEFAULT '',
    source_url TEXT NOT NULL DEFAULT '',
    published_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    views INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS idx_articles_status_published_at ON articles(status, published_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_articles_category_published_at ON articles(category, published_at DESC)`,
  `CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`
];

const CATEGORY_SEED = Object.entries(CATEGORY_LABELS)
  .filter(([slug]) => slug !== "general")
  .map(([slug, name], i) => ({ slug, name, sort_order: (i + 1) * 10 }));

let initialized = false;

export function hasDatabase(env) {
  return Boolean(env?.DB);
}

export async function ensureSchema(env) {
  if (!hasDatabase(env)) return false;
  if (initialized) return true;
  for (const sql of INIT_SQL) await env.DB.prepare(sql).run();
  for (const c of CATEGORY_SEED) {
    await env.DB.prepare(
      `INSERT OR IGNORE INTO categories (slug, name, sort_order) VALUES (?, ?, ?)`
    ).bind(c.slug, c.name, c.sort_order).run();
  }
  initialized = true;
  return true;
}

export function makeSlug(title) {
  const base = String(title || "")
    .trim()
    .toLowerCase()
    .replace(/[\u200c\s]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 86);
  return base || `news-${Date.now()}`;
}

async function uniqueSlug(env, wanted, excludeId = null) {
  const base = makeSlug(wanted);
  let slug = base;
  for (let i = 0; i < 20; i++) {
    const row = excludeId
      ? await env.DB.prepare(`SELECT id FROM articles WHERE slug=? AND id<>? LIMIT 1`).bind(slug, excludeId).first()
      : await env.DB.prepare(`SELECT id FROM articles WHERE slug=? LIMIT 1`).bind(slug).first();
    if (!row) return slug;
    slug = `${base}-${i + 2}`;
  }
  return `${base}-${Date.now()}`;
}

function publishedWhere() {
  return `(status = 'published' OR status = 'breaking') AND published_at IS NOT NULL`;
}

const emptyEdition = () => ({ main_slug: '', editor_picks: [], dossier_title: '', dossier_description: '', dossier_slugs: [] });
class EditionInputError extends Error { status = 400; }

function articleMetadata(value = '{}') {
  try {
    const data = JSON.parse(value);
    return { author_name:typeof data.author_name === 'string' ? data.author_name.slice(0,120) : '', format:['analysis','report'].includes(data.format) ? data.format : 'news', video_url:typeof data.video_url==='string' ? data.video_url.slice(0,2048) : '',video_type:['video/mp4','video/webm'].includes(data.video_type)?data.video_type:'video/mp4',video_caption:typeof data.video_caption==='string'?data.video_caption.slice(0,240):'' };
  } catch { return {author_name:'',format:'news',video_url:'',video_type:'video/mp4',video_caption:''}; }
}

async function metadataMap(env) {
  const rows = await env.DB.prepare("SELECT key,value FROM site_settings WHERE key LIKE 'article_meta:%'").all();
  return new Map((rows.results || []).map(row => [row.key,articleMetadata(row.value)]));
}

export function normalizeHomeEdition(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new EditionInputError('ساختار تنظیمات صفحه اول نامعتبر است');
  const slugs = (value, limit) => Array.isArray(value)
    ? [...new Set(value.filter(item => typeof item === 'string').map(item => item.trim().slice(0, 160)).filter(Boolean))].slice(0, limit)
    : [];
  return {
    main_slug: typeof input.main_slug === 'string' ? input.main_slug.trim().slice(0, 160) : '',
    editor_picks: slugs(input.editor_picks, 3),
    dossier_title: normalizePersianText(input.dossier_title || '').slice(0, 140),
    dossier_description: normalizePersianText(input.dossier_description || '').slice(0, 300),
    dossier_slugs: slugs(input.dossier_slugs, 4),
  };
}

export async function getHomeEdition(env) {
  if (!(await ensureSchema(env))) return emptyEdition();
  const row = await env.DB.prepare('SELECT value FROM site_settings WHERE key=?').bind('homepage_edition').first();
  try { return normalizeHomeEdition(JSON.parse(row?.value || '{}')); } catch { return emptyEdition(); }
}

export async function saveHomeEdition(env, input) {
  await ensureSchema(env);
  const edition = normalizeHomeEdition(input);
  const selected = [...new Set([edition.main_slug, ...edition.editor_picks, ...edition.dossier_slugs].filter(Boolean))];
  if (selected.length) {
    const found = await env.DB.prepare(`SELECT slug FROM articles WHERE ${publishedWhere()} AND slug IN (${selected.map(() => '?').join(',')})`).bind(...selected).all();
    const published = new Set((found.results || []).map(article => article.slug));
    if (selected.some(slug => !published.has(slug))) throw new EditionInputError('برای صفحه اول فقط خبرهای منتشرشده را انتخاب کنید');
  }
  if (edition.dossier_slugs.length && !edition.dossier_title) throw new EditionInputError('عنوان پرونده ویژه را وارد کنید');
  await env.DB.prepare('INSERT INTO site_settings (key,value,updated_at) VALUES (?,?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP').bind('homepage_edition', JSON.stringify(edition)).run();
  return edition;
}

async function editionArticles(env, slugs) {
  if (!slugs.length) return [];
  const result = await env.DB.prepare(`SELECT * FROM articles WHERE ${publishedWhere()} AND slug IN (${slugs.map(() => '?').join(',')})`).bind(...slugs).all();
  const bySlug = new Map((result.results || []).map(article => [article.slug, article]));
  return slugs.map(slug => bySlug.get(slug)).filter(Boolean);
}

async function saveArticleMetadata(env, id, input) {
  if (!['author_name','format','video_url','video_type','video_caption'].some(key=>Object.hasOwn(input,key))) return;
  const row = await env.DB.prepare('SELECT value FROM site_settings WHERE key=?').bind('article_meta:' + id).first();
  const previous = articleMetadata(row?.value);
  const data = {
    author_name:Object.hasOwn(input,'author_name') ? normalizePersianText(input.author_name || '').slice(0,120) : previous.author_name,
    format:Object.hasOwn(input,'format') ? (['analysis','report'].includes(input.format) ? input.format : 'news') : previous.format,
    video_url:Object.hasOwn(input,'video_url') ? String(input.video_url || '').trim().slice(0,2048) : previous.video_url,
    video_type:Object.hasOwn(input,'video_type') ? (['video/mp4','video/webm'].includes(input.video_type) ? input.video_type : 'video/mp4') : previous.video_type,
    video_caption:Object.hasOwn(input,'video_caption') ? normalizePersianText(input.video_caption || '').slice(0,240) : previous.video_caption,
  };
  await env.DB.prepare('INSERT INTO site_settings (key,value,updated_at) VALUES (?,?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP').bind('article_meta:' + id, JSON.stringify(data)).run();
}

export async function getHomeData(env) {
  if (!(await ensureSchema(env))) return { configured: false, breaking: [], hero: null, latest: [], sections: {} };
  const [edition, metadata] = await Promise.all([getHomeEdition(env),metadataMap(env)]);
  const decorate = article => article ? {...article,...(metadata.get('article_meta:' + article.id) || {author_name:'',format:'news'})} : null;
  const sectionQueries = Object.keys(CATEGORY_LABELS)
    .filter(k => k !== 'general')
    .map(k => env.DB.prepare(`SELECT * FROM articles WHERE ${publishedWhere()} AND category=? ORDER BY published_at DESC LIMIT 6`).bind(k).all());
  const [breaking, automaticHero, latest, ...sectionsRaw] = await Promise.all([
    env.DB.prepare(`SELECT * FROM articles WHERE status='breaking' AND published_at IS NOT NULL ORDER BY published_at DESC LIMIT 10`).all(),
    env.DB.prepare(`SELECT * FROM articles WHERE ${publishedWhere()} ORDER BY CASE WHEN status='breaking' THEN 0 ELSE 1 END, published_at DESC LIMIT 1`).first(),
    env.DB.prepare(`SELECT * FROM articles WHERE ${publishedWhere()} ORDER BY published_at DESC LIMIT 16`).all(),
    ...sectionQueries
  ]);
  const keys = Object.keys(CATEGORY_LABELS).filter(k => k !== 'general');
  const sections = Object.fromEntries(keys.map((k,i)=>[k, (sectionsRaw[i]?.results || []).map(decorate)]));
  const selected = await editionArticles(env, [...new Set([edition.main_slug, ...edition.editor_picks, ...edition.dossier_slugs].filter(Boolean))]);
  const selectedBySlug = new Map(selected.map(article => [article.slug, article]));
  return {
    configured: true,
    breaking: breaking.results || [],
    hero: decorate(selectedBySlug.get(edition.main_slug) || automaticHero),
    latest: (latest.results || []).map(decorate),
    sections,
    editorPicks: edition.editor_picks.map(slug => decorate(selectedBySlug.get(slug))).filter(Boolean),
    dossier: { title: edition.dossier_title, description: edition.dossier_description, articles: edition.dossier_slugs.map(slug => decorate(selectedBySlug.get(slug))).filter(Boolean) },
  };
}

export async function getArticle(env, slug, increment = true) {
  if (!(await ensureSchema(env))) return null;
  const article = await env.DB.prepare(`SELECT * FROM articles WHERE slug=? AND ${publishedWhere()} LIMIT 1`).bind(slug).first();
  if (article) {
    const metadata = await env.DB.prepare('SELECT value FROM site_settings WHERE key=?').bind('article_meta:' + article.id).first();
    Object.assign(article,articleMetadata(metadata?.value));
  }
  if (article && increment) env.DB.prepare(`UPDATE articles SET views=views+1 WHERE id=?`).bind(article.id).run().catch(() => {});
  return article;
}

export async function listByCategory(env, category, limit = 30) {
  if (!(await ensureSchema(env))) return [];
  const r = await env.DB.prepare(`SELECT * FROM articles WHERE ${publishedWhere()} AND category=? ORDER BY published_at DESC LIMIT ?`).bind(category, limit).all();
  const metadata = await metadataMap(env);
  return (r.results || []).map(article => ({...article,...(metadata.get('article_meta:' + article.id) || {author_name:'',format:'news'})}));
}

export async function searchArticles(env, q, limit = 30) {
  if (!(await ensureSchema(env))) return [];
  const term = `%${normalizePersianText(String(q || "").trim())}%`;
  const r = await env.DB.prepare(`SELECT * FROM articles WHERE ${publishedWhere()} AND (title LIKE ? OR excerpt LIKE ? OR body LIKE ?) ORDER BY published_at DESC LIMIT ?`).bind(term, term, term, limit).all();
  const metadata = await metadataMap(env);
  return (r.results || []).map(article => ({...article,...(metadata.get('article_meta:' + article.id) || {author_name:'',format:'news'})}));
}

export async function adminStats(env) {
  if (!(await ensureSchema(env))) return { configured: false, total: 0, published: 0, drafts: 0, breaking: 0, views: 0 };
  const row = await env.DB.prepare(`SELECT
    COUNT(*) total,
    COALESCE(SUM(CASE WHEN status='published' THEN 1 ELSE 0 END),0) published,
    COALESCE(SUM(CASE WHEN status='draft' THEN 1 ELSE 0 END),0) drafts,
    COALESCE(SUM(CASE WHEN status='breaking' THEN 1 ELSE 0 END),0) breaking,
    COALESCE(SUM(views),0) views
    FROM articles`).first();
  return { configured: true, ...row };
}

export async function adminArticles(env, limit = 120) {
  if (!(await ensureSchema(env))) return [];
  const r = await env.DB.prepare(`SELECT * FROM articles ORDER BY created_at DESC LIMIT ?`).bind(limit).all();
  const [metadata, edition] = await Promise.all([metadataMap(env),getHomeEdition(env)]);
  const recent = r.results || [];
  const available = new Set(recent.map(article => article.slug));
  const missing = [...new Set([edition.main_slug,...edition.editor_picks,...edition.dossier_slugs].filter(slug => slug && !available.has(slug)))];
  const selected = await editionArticles(env,missing);
  return [...recent,...selected].map(article => ({ ...article, ...(metadata.get('article_meta:' + article.id) || {author_name:'',format:'news'}) }));
}

function cleanArticleInput(input, current = null) {
  const title = smartTitle(input.title ?? current?.title ?? '');
  const body = smartBody(input.body ?? current?.body ?? '');
  const chosenCategory = input.category && CATEGORY_LABELS[input.category] ? input.category : (current?.category || 'general');
  const category = chosenCategory === 'general' ? inferCategory(title, body) : chosenCategory;
  const excerptInput = normalizePersianText(input.excerpt ?? current?.excerpt ?? '');
  const excerpt = excerptInput || autoExcerpt(body, title);
  const status = ["draft", "published", "breaking"].includes(input.status) ? input.status : (current?.status || "draft");
  return {
    title,
    body,
    excerpt,
    category: CATEGORY_LABELS[category] ? category : 'general',
    status,
    hero_image: String(input.hero_image ?? current?.hero_image ?? '').trim(),
    source_name: normalizePersianText(input.source_name ?? current?.source_name ?? ''),
    source_url: String(input.source_url ?? current?.source_url ?? '').trim()
  };
}

export async function createArticle(env, input) {
  await ensureSchema(env);
  const clean = cleanArticleInput(input);
  if (!clean.title) throw new Error("عنوان خبر الزامی است");
  if (!clean.body) throw new Error("متن خبر الزامی است");
  const slug = await uniqueSlug(env, input.slug || clean.title);
  const publishedAt = clean.status === "draft" ? null : (input.published_at || new Date().toISOString());
  const result = await env.DB.prepare(`INSERT INTO articles
    (slug,title,excerpt,body,category,status,hero_image,source_name,source_url,published_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)`)
    .bind(
      slug,
      clean.title,
      clean.excerpt,
      clean.body,
      clean.category,
      clean.status,
      clean.hero_image,
      clean.source_name,
      clean.source_url,
      publishedAt
    ).run();
  await saveArticleMetadata(env, result.meta.last_row_id, input);
  return { id: result.meta.last_row_id, slug, category: clean.category, excerpt: clean.excerpt };
}

export async function updateArticle(env, id, input) {
  await ensureSchema(env);
  const current = await env.DB.prepare(`SELECT * FROM articles WHERE id=?`).bind(id).first();
  if (!current) throw new Error("خبر پیدا نشد");
  const clean = cleanArticleInput(input, current);
  if (!clean.title) throw new Error("عنوان خبر الزامی است");
  if (!clean.body) throw new Error("متن خبر الزامی است");
  const publishedAt = clean.status === "draft" ? null : (input.published_at || current.published_at || new Date().toISOString());
  const slug = await uniqueSlug(env, input.slug || current.slug || clean.title, id);
  await env.DB.prepare(`UPDATE articles SET
    slug=?, title=?, excerpt=?, body=?, category=?, status=?, hero_image=?, source_name=?, source_url=?, published_at=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?`)
    .bind(
      slug,
      clean.title,
      clean.excerpt,
      clean.body,
      clean.category,
      clean.status,
      clean.hero_image,
      clean.source_name,
      clean.source_url,
      publishedAt,
      id
    ).run();
  await saveArticleMetadata(env, id, input);
  return { id, slug, category: clean.category, excerpt: clean.excerpt };
}

export async function deleteArticle(env, id) {
  await ensureSchema(env);
  await env.DB.prepare(`DELETE FROM articles WHERE id=?`).bind(id).run();
  await env.DB.prepare('DELETE FROM site_settings WHERE key=?').bind('article_meta:' + id).run();
  return { id };
}
