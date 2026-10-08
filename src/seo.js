export const SITE_ORIGIN = 'https://negahjavan.ir';
const xml = value => String(value || '').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));

export function absoluteUrl(path = '/') {
  try {
    const url=new URL(path,SITE_ORIGIN);
    return url.protocol==='https:' && !url.username && !url.password ? url.href : SITE_ORIGIN+'/';
  } catch { return SITE_ORIGIN+'/'; }
}

export function isoDate(value) {
  if (!value) return undefined;
  const input=typeof value==='string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value) ? value.replace(' ','T')+'Z' : value;
  const date=new Date(input);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function articleStructuredData(article, image) {
  return {
    '@context':'https://schema.org', '@type':'NewsArticle',
    headline:article.title, description:article.excerpt || undefined,
    mainEntityOfPage:absoluteUrl('/news/'+encodeURIComponent(article.slug)),
    image:[absoluteUrl(image)], datePublished:isoDate(article.published_at),
    dateModified:isoDate(article.updated_at) || isoDate(article.published_at),
    inLanguage:'fa-IR',
    author:{'@type':article.author_name?'Person':'Organization',name:article.author_name || 'نگاه جوان'},
    publisher:{'@type':'Organization',name:'نگاه جوان',url:SITE_ORIGIN,logo:{'@type':'ImageObject',url:absoluteUrl('/assets/negahjavan-wordmark-v2.svg')}},
  };
}

export function jsonLd(value) {
  return JSON.stringify(value).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
}

export function sitemapXml(articles, categories) {
  const pages=['/','/latest',...Object.keys(categories).filter(key=>key!=='general').map(key=>'/category/'+key)];
  const urls=pages.map(path=>'<url><loc>'+xml(absoluteUrl(path))+'</loc></url>');
  for(const article of articles) {
    const date=isoDate(article.updated_at) || isoDate(article.published_at);
    urls.push('<url><loc>'+xml(absoluteUrl('/news/'+encodeURIComponent(article.slug)))+'</loc>'+(date?'<lastmod>'+xml(date)+'</lastmod>':'')+'</url>');
  }
  return '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.join('')+'</urlset>';
}

export function newsFeedXml(articles) {
  const items=articles.map(article=>{
    const link=xml(absoluteUrl('/news/'+encodeURIComponent(article.slug)));
    const date=isoDate(article.published_at);
    return '<item><title>'+xml(article.title)+'</title><link>'+link+'</link><guid isPermaLink="true">'+link+'</guid><description>'+xml(article.excerpt || '')+'</description>'+(date?'<pubDate>'+new Date(date).toUTCString()+'</pubDate>':'')+'</item>';
  }).join('');
  return '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>نگاه جوان</title><link>'+SITE_ORIGIN+'/</link><description>تازه‌ترین خبرهای نگاه جوان</description><language>fa-IR</language>'+items+'</channel></rss>';
}
