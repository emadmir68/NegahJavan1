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
    .slice(0, 80);
  return base || `news-${Date.now()}`;
}

function publishedWhere() {
  return `(status = 'published' OR status = 'breaking') AND published_at IS NOT NULL`;
}

export async function getHomeData(env) {
  if (!(await ensureSchema(env))) return { configured: false, breaking: [], hero: null, latest: [], sections: {} };
  const [breaking, hero, latest, politics, incidents, world, economy] = await Promise.all([
    env.DB.prepare(`SELECT * FROM articles WHERE status='breaking' AND published_at IS NOT NULL ORDER BY published_at DESC LIMIT 8`).all(),
    env.DB.prepare(`SELECT * FROM articles WHERE ${publishedWhere()} ORDER BY CASE WHEN status='breaking' THEN 0 ELSE 1 END, published_at DESC LIMIT 1`).first(),
    env.DB.prepare(`SELECT * FROM articles WHERE ${publishedWhere()} ORDER BY published_at DESC LIMIT 12`).all(),
    env.DB.prepare(`SELECT * FROM articles WHERE ${publishedWhere()} AND category='politics' ORDER BY published_at DESC LIMIT 5`).all(),
    env.DB.prepare(`SELECT * FROM articles WHERE ${publishedWhere()} AND category='incidents' ORDER BY published_at DESC LIMIT 5`).all(),
    env.DB.prepare(`SELECT * FROM articles WHERE ${publishedWhere()} AND category='world' ORDER BY published_at DESC LIMIT 5`).all(),
    env.DB.prepare(`SELECT * FROM articles WHERE ${publishedWhere()} AND category='economy' ORDER BY published_at DESC LIMIT 5`).all()
  ]);
  return {
    configured: true,
    breaking: breaking.results || [],
    hero,
    latest: latest.results || [],
    sections: {
      politics: politics.results || [],
      incidents: incidents.results || [],
      world: world.results || [],
      economy: economy.results || []
    }
  };
}

export async function getArticle(env, slug, increment = true) {
  if (!(await ensureSchema(env))) return null;
  const article = await env.DB.prepare(`SELECT * FROM articles WHERE slug=? AND ${publishedWhere()} LIMIT 1`).bind(slug).first();
  if (article && increment) env.DB.prepare(`UPDATE articles SET views=views+1 WHERE id=?`).bind(article.id).run().catch(() => {});
  return article;
}

export async function listByCategory(env, category, limit = 30) {
  if (!(await ensureSchema(env))) return [];
  const r = await env.DB.prepare(`SELECT * FROM articles WHERE ${publishedWhere()} AND category=? ORDER BY published_at DESC LIMIT ?`).bind(category, limit).all();
  return r.results || [];
}

export async function searchArticles(env, q, limit = 30) {
  if (!(await ensureSchema(env))) return [];
  const term = `%${String(q || "").trim()}%`;
  const r = await env.DB.prepare(`SELECT * FROM articles WHERE ${publishedWhere()} AND (title LIKE ? OR excerpt LIKE ? OR body LIKE ?) ORDER BY published_at DESC LIMIT ?`).bind(term, term, term, limit).all();
  return r.results || [];
}

export async function adminStats(env) {
  if (!(await ensureSchema(env))) return { configured: false, total: 0, published: 0, drafts: 0, breaking: 0, views: 0 };
  const row = await env.DB.prepare(`SELECT
    COUNT(*) total,
    SUM(CASE WHEN status='published' THEN 1 ELSE 0 END) published,
    SUM(CASE WHEN status='draft' THEN 1 ELSE 0 END) drafts,
    SUM(CASE WHEN status='breaking' THEN 1 ELSE 0 END) breaking,
    COALESCE(SUM(views),0) views
    FROM articles`).first();
  return { configured: true, ...row };
}

export async function adminArticles(env, limit = 100) {
  if (!(await ensureSchema(env))) return [];
  const r = await env.DB.prepare(`SELECT * FROM articles ORDER BY created_at DESC LIMIT ?`).bind(limit).all();
  return r.results || [];
}

export async function createArticle(env, input) {
  await ensureSchema(env);
  const title = String(input.title || "").trim();
  if (!title) throw new Error("عنوان خبر الزامی است");
  const slug = makeSlug(input.slug || title);
  const status = ["draft", "published", "breaking"].includes(input.status) ? input.status : "draft";
  const publishedAt = status === "draft" ? null : (input.published_at || new Date().toISOString());
  const result = await env.DB.prepare(`INSERT INTO articles
    (slug,title,excerpt,body,category,status,hero_image,source_name,source_url,published_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)`)
    .bind(
      slug,
      title,
      String(input.excerpt || "").trim(),
      String(input.body || "").trim(),
      CATEGORY_LABELS[input.category] ? input.category : "general",
      status,
      String(input.hero_image || "").trim(),
      String(input.source_name || "").trim(),
      String(input.source_url || "").trim(),
      publishedAt
    ).run();
  return { id: result.meta.last_row_id, slug };
}

export async function updateArticle(env, id, input) {
  await ensureSchema(env);
  const current = await env.DB.prepare(`SELECT * FROM articles WHERE id=?`).bind(id).first();
  if (!current) throw new Error("خبر پیدا نشد");
  const title = String(input.title ?? current.title).trim();
  const status = ["draft", "published", "breaking"].includes(input.status) ? input.status : current.status;
  const publishedAt = status === "draft" ? null : (input.published_at || current.published_at || new Date().toISOString());
  const slug = makeSlug(input.slug || current.slug || title);
  await env.DB.prepare(`UPDATE articles SET
    slug=?, title=?, excerpt=?, body=?, category=?, status=?, hero_image=?, source_name=?, source_url=?, published_at=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?`)
    .bind(
      slug,
      title,
      String(input.excerpt ?? current.excerpt),
      String(input.body ?? current.body),
      CATEGORY_LABELS[input.category] ? input.category : current.category,
      status,
      String(input.hero_image ?? current.hero_image),
      String(input.source_name ?? current.source_name),
      String(input.source_url ?? current.source_url),
      publishedAt,
      id
    ).run();
  return { id, slug };
}

export async function deleteArticle(env, id) {
  await ensureSchema(env);
  await env.DB.prepare(`DELETE FROM articles WHERE id=?`).bind(id).run();
  return { id };
}
