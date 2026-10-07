import { CATEGORY_LABELS } from './db.js';
import { readingMinutes } from './smart.js';

const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate = (v) => {
  if (!v) return '';
  try { return new Intl.DateTimeFormat('fa-IR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v)); }
  catch { return String(v); }
};
const imageStyle = (a) => {
  const url = a?.hero_image || (a?.slug ? '/cover/' + encodeURIComponent(a.slug) + '.svg' : '');
  return url ? `style="background-image:url('${esc(url)}')"` : '';
};

const css = `
:root{
  --bg:#f3f0e9;
  --paper:#fbfaf7;
  --ink:#121716;
  --ink2:#2d3a38;
  --muted:#76807d;
  --line:rgba(18,23,22,.11);
  --cyan:#20b9c0;
  --cyan2:#73d6d8;
  --red:#e84c61;
  --shadow:0 22px 60px rgba(30,40,38,.10);
}
*{box-sizing:border-box}
html{scroll-behavior:smooth;background:var(--bg)}
body{
  margin:0;
  min-height:100vh;
  direction:rtl;
  color:var(--ink);
  font-family:"Vazirmatn",Tahoma,Arial,sans-serif;
  background:
    radial-gradient(circle at 10% -8%,rgba(68,188,195,.14),transparent 26%),
    radial-gradient(circle at 94% 7%,rgba(99,148,199,.10),transparent 24%),
    linear-gradient(180deg,#f8f6f1 0%,#f1eee7 100%);
  text-rendering:optimizeLegibility;
}
a{color:inherit;text-decoration:none}
button,input{font:inherit}
.wrap{width:min(1280px,calc(100% - 40px));margin-inline:auto}

/* Header */
.site-header{
  position:sticky;top:0;z-index:50;
  background:rgba(249,247,242,.88);
  border-bottom:1px solid var(--line);
  backdrop-filter:blur(20px) saturate(120%);
  -webkit-backdrop-filter:blur(20px) saturate(120%);
}
.header-main{height:68px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center}
.brand{justify-self:end;display:flex;align-items:center;gap:11px}
.brand-mark{width:39px;height:39px;border-radius:50%;display:grid;place-items:center;background:#111918;color:#fff;font-size:20px;font-weight:900}
.brand-copy{display:grid;line-height:1}
.brand-copy b{font-size:21px;font-weight:900;letter-spacing:-1px}
.brand-copy small{margin-top:5px;font:800 7px/1 Arial,sans-serif;letter-spacing:.17em;color:#8d9693}
.header-live{justify-self:center;display:flex;align-items:center;gap:8px;font-size:10px;color:#707c79}
.header-live i{width:7px;height:7px;border-radius:50%;background:#28b29e;box-shadow:0 0 0 6px rgba(40,178,158,.08)}
.editor-link{justify-self:start;padding:9px 14px;border-radius:999px;background:#111918;color:white;font-size:10px;font-weight:850}
.nav-wrap{border-top:1px solid rgba(18,23,22,.055)}
.nav{display:flex;justify-content:center;gap:2px;overflow:auto;scrollbar-width:none;padding:7px 0}.nav::-webkit-scrollbar{display:none}
.nav a{flex:0 0 auto;padding:7px 11px;border-radius:999px;color:#50605d;font-size:10px;font-weight:800}
.nav a:hover{background:white;color:#111716}

/* breaking */
.breaking{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;min-height:42px;margin:14px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.breaking-label{display:flex;align-items:center;gap:7px;padding-left:16px;color:#b63146;font-size:9px;font-weight:900}
.breaking-label i{width:7px;height:7px;border-radius:50%;background:var(--red)}
.breaking-track{display:flex;gap:28px;overflow:auto;scrollbar-width:none;padding:0 16px;color:#455653;font-size:10px}.breaking-track::-webkit-scrollbar{display:none}.breaking-track a{white-space:nowrap;font-weight:700}
.breaking-code{font:800 7px/1 Arial,sans-serif;letter-spacing:.15em;color:#9aa29f}

/* Hero */
.hero{
  position:relative;
  display:grid;
  grid-template-columns:minmax(0,1.16fr) minmax(380px,.84fr);
  gap:28px;
  align-items:center;
  min-height:520px;
  padding:46px 48px;
  overflow:hidden;
  border-radius:32px;
  background:rgba(255,255,255,.68);
  border:1px solid rgba(255,255,255,.92);
  box-shadow:var(--shadow),inset 0 1px 0 rgba(255,255,255,.95);
}
.hero:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 83% 18%,rgba(32,185,192,.12),transparent 24%),radial-gradient(circle at 94% 88%,rgba(92,145,196,.10),transparent 26%);pointer-events:none}
.hero-copy{position:relative;z-index:4}
.hero-kicker{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.hero-kicker span{padding:7px 9px;border-radius:999px;background:#111918;color:white;font:800 8px/1 Arial,sans-serif;letter-spacing:.13em}
.hero-kicker b{padding:7px 9px;border-radius:999px;background:#e9f6f4;color:#0b7d82;font-size:9px}
.hero h1{max-width:740px;margin:18px 0 14px;font-size:clamp(46px,5vw,76px);line-height:1.02;letter-spacing:-3.7px;font-weight:900;text-wrap:balance}
.hero h1 em{font-style:normal;color:#0b8389}
.hero p{max-width:630px;margin:0;color:#556562;font-size:clamp(14px,1.35vw,17px);line-height:1.95}
.hero-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:22px}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 17px;border-radius:999px;font-size:10px;font-weight:850}
.btn-dark{background:#111918;color:white}.btn-light{background:rgba(255,255,255,.72);border:1px solid var(--line);color:#273835}
.hero-meta{display:flex;gap:13px;align-items:center;flex-wrap:wrap;max-width:620px;margin-top:22px;padding-top:15px;border-top:1px solid var(--line)}
.hero-meta span{display:grid;gap:3px}.hero-meta b{font:800 12px/1 Arial,sans-serif;color:#203936}.hero-meta small{font-size:8px;color:#87918e}.hero-meta i{width:1px;height:24px;background:var(--line)}

/* restrained 3D visual */
.hero-visual{position:relative;min-height:420px;display:grid;place-items:center;perspective:1300px}
.depth-number{position:absolute;left:2%;bottom:-5%;font:900 180px/.8 Arial,sans-serif;color:rgba(17,25,24,.05);letter-spacing:-12px}
.depth-glow{position:absolute;width:74%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgba(43,191,196,.18),transparent 70%);right:8%;top:2%}
.depth-sheet{position:absolute;width:68%;height:72%;border-radius:25px;background:linear-gradient(145deg,rgba(255,255,255,.55),rgba(218,232,230,.18));border:1px solid rgba(255,255,255,.9);box-shadow:0 22px 54px rgba(26,48,44,.08)}
.depth-back{transform:translate3d(-18px,15px,-100px) rotate(-6deg)}
.depth-mid{transform:translate3d(16px,-6px,-45px) rotate(4deg);opacity:.78}
.cover-frame{
  position:relative;z-index:5;
  width:76%;height:72%;min-height:325px;
  border-radius:26px;overflow:hidden;
  transform:rotateY(-7deg) rotateX(2deg) translateZ(44px);
  border:1px solid rgba(255,255,255,.82);
  box-shadow:0 30px 66px rgba(24,46,42,.17),0 8px 20px rgba(24,46,42,.08);
  transition:.35s ease;
}
.hero:hover .cover-frame{transform:rotateY(-4deg) rotateX(1deg) translateZ(58px) translateY(-3px)}
.cover-image{position:absolute;inset:0;background-size:cover;background-position:center}
.cover-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,16,17,.02),rgba(7,16,17,.20))}
.cover-top,.cover-bottom{position:absolute;left:16px;right:16px;z-index:3;color:white}
.cover-top{top:15px;display:flex;justify-content:space-between;font:800 7px/1 Arial,sans-serif;letter-spacing:.13em}
.cover-bottom{bottom:15px}.cover-bottom small{display:block;font:800 7px/1 Arial,sans-serif;letter-spacing:.14em;opacity:.75}.cover-bottom b{display:block;margin-top:6px;font-size:16px;line-height:1.5;text-shadow:0 3px 16px rgba(0,0,0,.16)}
.float-chip{position:absolute;z-index:8;padding:9px 11px;border-radius:13px;background:rgba(255,255,255,.80);border:1px solid rgba(255,255,255,.94);box-shadow:0 12px 30px rgba(26,49,45,.10);backdrop-filter:blur(14px)}
.float-chip small{display:block;font:800 6px/1 Arial,sans-serif;letter-spacing:.12em;color:#87928f}.float-chip b{display:block;margin-top:4px;font-size:9px;color:#1b3430}
.chip-one{right:0;top:27%}.chip-two{left:0;bottom:23%}
.brand-cover{position:absolute;inset:0;background:radial-gradient(circle at 80% 16%,rgba(67,201,208,.30),transparent 24%),radial-gradient(circle at 18% 84%,rgba(83,142,204,.18),transparent 28%),linear-gradient(145deg,#0b1b20,#153039 55%,#0b2027)}
.brand-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:40px 40px}
.brand-word{position:absolute;right:28px;bottom:80px;font-size:clamp(65px,7vw,100px);font-weight:900;line-height:.78;letter-spacing:-6px;color:white}
.brand-sub{position:absolute;right:30px;bottom:42px;font:800 18px/1 Arial,sans-serif;letter-spacing:.30em;color:#6dd1d4}

/* Sections */
.section{margin-top:68px}
.section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;padding-bottom:14px;border-bottom:1px solid var(--line);margin-bottom:20px}
.section-head small{display:block;font:800 7px/1 Arial,sans-serif;letter-spacing:.15em;color:#8d9794}
.section-head h2{margin:7px 0 3px;font-size:clamp(29px,2.8vw,40px);line-height:1.08;letter-spacing:-1.6px}
.section-head p{margin:0;font-size:9px;color:#7c8986}.section-head>a{font-size:9px;font-weight:800;color:#2d4440}
.search{display:flex;gap:7px}.search input{width:220px;padding:9px 13px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.68);outline:none}.search button{border:0;border-radius:999px;background:#111918;color:white;padding:0 14px;font-size:9px;font-weight:800}
.latest-grid,.category-grid{display:grid;grid-template-columns:minmax(0,1.42fr) minmax(330px,.58fr);gap:24px}
.lead-media{height:390px;border-radius:24px;background-size:cover;background-position:center}
.lead-copy{padding-top:16px}.story-meta{display:flex;gap:11px;font-size:8px;color:#8a9692}.story-meta b{color:#0b7e83}.lead-copy h3{margin:8px 0 6px;font-size:clamp(24px,2.2vw,32px);line-height:1.45;letter-spacing:-1px}.lead-copy p{margin:0;color:#6f7e7b;font-size:11px;line-height:1.85}
.stack{border-top:1px solid var(--line)}
.stack-item{display:grid;grid-template-columns:auto 1fr auto;gap:11px;align-items:center;padding:15px 0;border-bottom:1px solid var(--line)}
.stack-no{font:800 14px/1 Arial,sans-serif;color:#aab3b0}.stack-item small{font-size:7px;color:#0b7e83;font-weight:850}.stack-item h4{margin:4px 0;font-size:13px;line-height:1.5}.stack-item time{font-size:7px;color:#919b98}.stack-arrow{color:#0b858a}
.category-main{display:block}.category-main .lead-media{height:310px}
.category-list{border-top:1px solid var(--line)}.category-list a{display:block;padding:14px 0;border-bottom:1px solid var(--line)}.category-list small{font-size:7px;color:#0b7e83;font-weight:850}.category-list h4{margin:4px 0;font-size:13px;line-height:1.5}.category-list time{font-size:7px;color:#909a97}

/* cards/listing */
.listing-title{margin-top:48px}.listing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:22px}
.story-card{display:block}.story-card-media{height:220px;border-radius:22px;background-size:cover;background-position:center}.story-card-copy{padding-top:13px}.story-card-copy small{font-size:8px;color:#0b7e83;font-weight:850}.story-card-copy h3{margin:6px 0;font-size:18px;line-height:1.5}.story-card-copy p{margin:0;color:#71807d;font-size:10px;line-height:1.75}

/* Article */
.article-shell{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:24px;margin-top:26px}
.article-main{padding:clamp(28px,5vw,64px);border-radius:28px;background:rgba(255,255,255,.76);border:1px solid rgba(255,255,255,.95);box-shadow:0 22px 60px rgba(25,48,45,.08)}
.article-main h1{margin:12px 0 14px;font-size:clamp(40px,5vw,68px);line-height:1.12;letter-spacing:-2.5px}.article-excerpt{font-size:17px;line-height:1.9;color:#586966}.article-meta{display:flex;gap:12px;flex-wrap:wrap;font-size:9px;color:#86918e}.article-cover{height:min(52vw,560px);min-height:300px;border-radius:23px;margin:22px 0;background-size:cover;background-position:center}.article-body{font-size:18px;line-height:2.2;color:#2b403c}.article-body p{margin:0 0 1.35em}.article-aside{position:sticky;top:112px;align-self:start;padding:20px;border-radius:22px;background:rgba(255,255,255,.72);border:1px solid rgba(255,255,255,.94);box-shadow:0 16px 44px rgba(25,48,45,.07)}.article-aside h3{margin:7px 0 9px}.article-aside p{font-size:11px;line-height:1.85;color:#6d7c79}

/* Footer */
.footer{margin-top:82px;padding:30px 0 42px;border-top:1px solid var(--line);color:#74817e}.footer-row{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;font-size:10px}.footer b{color:#111716!important}

/* Responsive */
@media(max-width:1040px){
  .hero{grid-template-columns:minmax(0,1fr) minmax(340px,.80fr);padding:34px}.hero-visual{min-height:390px}.cover-frame{min-height:300px}
  .latest-grid,.category-grid{grid-template-columns:1fr}.stack{display:grid;grid-template-columns:1fr 1fr;gap:12px;border:0}.stack-item{border:1px solid var(--line);border-radius:16px;padding:10px}
  .listing-grid{grid-template-columns:1fr 1fr}
}
@media(max-width:760px){
  .wrap{width:calc(100% - 16px)}
  .header-main{height:56px;grid-template-columns:1fr auto}.header-live{display:none}.brand-copy b{font-size:18px}.brand-copy small{display:none}.brand-mark{width:35px;height:35px}.editor-link{font-size:9px;padding:8px 10px}.nav{justify-content:flex-start;padding:5px 0}.nav a{font-size:9px;padding:6px 9px}
  .breaking{grid-template-columns:auto minmax(0,1fr);min-height:37px;margin:8px 0 10px}.breaking-code{display:none}.breaking-label{font-size:8px;padding-left:8px}.breaking-track{font-size:9px;padding:0 8px;gap:18px}
  .hero{display:flex;flex-direction:column;min-height:auto;padding:18px 16px;border-radius:24px;gap:8px}
  .hero-copy{order:1}.hero-visual{order:2;min-height:250px;width:100%}
  .hero h1{font-size:clamp(34px,10vw,45px);line-height:1.05;letter-spacing:-2px;margin:12px 0 9px}.hero p{font-size:12.5px;line-height:1.8}.hero-actions{margin-top:14px}.btn{min-height:38px;font-size:9px;padding:0 13px}.hero-meta{margin-top:13px;padding-top:10px;gap:9px}.hero-meta span:last-child{display:none}
  .cover-frame{width:79%;height:200px;min-height:200px;border-radius:20px;transform:rotateY(-4deg) rotateX(1deg) translateZ(20px)}.hero:hover .cover-frame{transform:rotateY(-3deg) translateZ(24px)}.depth-sheet{width:66%;height:68%;border-radius:19px}.depth-back{transform:translate3d(-10px,8px,-60px) rotate(-5deg)}.depth-mid{transform:translate3d(9px,-3px,-30px) rotate(4deg)}.chip-one{right:0;top:24%}.chip-two{left:0;bottom:18%}.float-chip{padding:7px 8px}.depth-number{display:none}.brand-word{font-size:58px;right:20px;bottom:65px}.brand-sub{right:22px;bottom:34px;font-size:14px}
  .section{margin-top:46px}.section-head{padding-bottom:11px;margin-bottom:15px}.section-head h2{font-size:26px}.search{display:none}
  .latest-grid,.category-grid{display:block}.lead-media,.category-main .lead-media{height:56vw;min-height:220px;border-radius:20px}.lead-copy h3{font-size:21px}.lead-copy p{font-size:10.5px}
  .stack,.category-list{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:9px;margin-top:15px;border:0;scrollbar-width:none}.stack::-webkit-scrollbar,.category-list::-webkit-scrollbar{display:none}.stack-item,.category-list a{flex:0 0 84%;scroll-snap-align:start;border:1px solid var(--line);border-radius:16px;padding:11px;background:rgba(255,255,255,.44)}
  .listing-grid{grid-template-columns:1fr;gap:18px}.story-card-media{height:56vw;min-height:210px}
  .article-shell{display:block;margin-top:12px}.article-main{padding:21px 15px;border-radius:22px}.article-main h1{font-size:clamp(33px,9vw,46px);letter-spacing:-1.4px}.article-excerpt{font-size:15px}.article-cover{height:62vw;min-height:220px;border-radius:19px}.article-body{font-size:16.5px;line-height:2.1}.article-aside{position:static;margin-top:12px}
}
@media(max-height:700px) and (min-width:761px){
  .header-main{height:55px}.breaking{min-height:34px;margin:7px 0 8px}
  .hero{min-height:350px;padding:22px 28px}.hero h1{font-size:clamp(34px,4vw,52px);margin:9px 0 7px;letter-spacing:-2.2px}.hero p{font-size:12px;line-height:1.7}.hero-actions{margin-top:11px}.hero-meta{margin-top:10px;padding-top:8px}.hero-visual{min-height:320px}.cover-frame{min-height:245px;width:70%}.depth-sheet{width:63%;height:64%}
}
`;

function shell(title,body){
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f3f0e9"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"><title>${esc(title)} | نگاه جوان</title><meta name="description" content="نگاه جوان؛ رسانه خبری برای روایت روشن و دقیق تحولات ایران و جهان"><style>${css}</style></head><body>${body}</body></html>`;
}

function header(){
  const nav=Object.entries(CATEGORY_LABELS).filter(([k])=>k!=='general').map(([k,v])=>`<a href="/category/${k}">${esc(v)}</a>`).join('');
  return `<header class="site-header"><div class="wrap header-main"><a class="brand" href="/"><span class="brand-mark">ن</span><span class="brand-copy"><b>نگاه جوان</b><small>NEGAAH JAVAN</small></span></a><div class="header-live"><i></i><span>به‌روز و زنده</span></div><a class="editor-link" href="/editorial">ورود به تحریریه</a></div><div class="nav-wrap"><nav class="wrap nav">${nav}</nav></div></header>`;
}

function footer(){
  return `<footer class="footer"><div class="wrap footer-row"><div><b>نگاه جوان</b><div style="margin-top:6px">خبر برای نسلی که دقیق‌تر می‌بیند.</div></div><div>NEWSROOM / 2026 · سیاست · حوادث · اقتصاد · جامعه · فناوری · فرهنگ · ورزش</div></div></footer>`;
}

function visual(a,cls='lead-media'){
  return `<div class="${cls}" ${imageStyle(a)}></div>`;
}

function storyCard(a){
  return `<a class="story-card" href="/news/${encodeURIComponent(a.slug)}">${visual(a,'story-card-media')}<div class="story-card-copy"><small>${esc(CATEGORY_LABELS[a.category]||'خبر')}</small><h3>${esc(a.title)}</h3>${a.excerpt?`<p>${esc(a.excerpt)}</p>`:''}<div class="article-meta"><span>${esc(fmtDate(a.published_at))}</span><span>${Number(a.views||0).toLocaleString('fa-IR')} بازدید</span></div></div></a>`;
}

function stackItem(a,i){
  return `<a class="stack-item" href="/news/${encodeURIComponent(a.slug)}"><span class="stack-no">0${i+1}</span><div><small>${esc(CATEGORY_LABELS[a.category]||'خبر')}</small><h4>${esc(a.title)}</h4><time>${esc(fmtDate(a.published_at))}</time></div><span class="stack-arrow">↗</span></a>`;
}

function categorySection(title,slug,subtitle,items,index){
  if(!items?.length) return '';
  const lead=items[0],rest=items.slice(1,4);
  return `<section class="section"><div class="section-head"><div><small>0${index+1} / SECTION</small><h2>${esc(title)}</h2><p>${esc(subtitle)}</p></div><a href="/category/${slug}">همه خبرها ↗</a></div><div class="category-grid"><a class="category-main" href="/news/${encodeURIComponent(lead.slug)}">${visual(lead)}<div class="lead-copy"><div class="story-meta"><b>${esc(CATEGORY_LABELS[lead.category]||'خبر')}</b><span>${esc(fmtDate(lead.published_at))}</span></div><h3>${esc(lead.title)}</h3><p>${esc(lead.excerpt||'')}</p></div></a><div class="category-list">${rest.map(a=>`<a href="/news/${encodeURIComponent(a.slug)}"><small>${esc(CATEGORY_LABELS[a.category]||'خبر')}</small><h4>${esc(a.title)}</h4><time>${esc(fmtDate(a.published_at))}</time></a>`).join('')}</div></div></section>`;
}

export function homePage(data){
  const hero=data.hero;
  const latest=data.latest||[];
  const breaking=data.breaking||[];

  const heroVisual = hero ? `
    <div class="hero-visual">
      <div class="depth-glow"></div><div class="depth-sheet depth-back"></div><div class="depth-sheet depth-mid"></div><div class="depth-number">01</div>
      <a class="cover-frame" href="/news/${encodeURIComponent(hero.slug)}">
        <div class="cover-image" ${imageStyle(hero)}></div><div class="cover-shade"></div>
        <div class="cover-top"><span>NJ / TOP STORY</span><span>${esc(CATEGORY_LABELS[hero.category]||'خبر')}</span></div>
        <div class="cover-bottom"><small>NEGAAH JAVAN</small><b>${esc(hero.title)}</b></div>
      </a>
      <div class="float-chip chip-one"><small>READ</small><b>${readingMinutes(hero.body||'')} MIN</b></div>
      <div class="float-chip chip-two"><small>STATUS</small><b>${hero.status==='breaking'?'BREAKING':'FEATURED'}</b></div>
    </div>`
  : `
    <div class="hero-visual">
      <div class="depth-glow"></div><div class="depth-sheet depth-back"></div><div class="depth-sheet depth-mid"></div><div class="depth-number">01</div>
      <div class="cover-frame"><div class="brand-cover"></div><div class="brand-grid"></div><div class="brand-word">نگاه</div><div class="brand-sub">JAVAN</div></div>
      <div class="float-chip chip-one"><small>LIVE</small><b>24 / 7</b></div>
      <div class="float-chip chip-two"><small>MODE</small><b>EDITORIAL</b></div>
    </div>`;

  const heroCopy = hero ? `
    <div class="hero-copy"><div class="hero-kicker"><span>${hero.status==='breaking'?'BREAKING':'TOP STORY'}</span><b>${esc(CATEGORY_LABELS[hero.category]||'خبر')}</b></div><h1>${esc(hero.title)}</h1><p>${esc(hero.excerpt||'جزئیات کامل این خبر را در نگاه جوان بخوانید.')}</p><div class="hero-actions"><a class="btn btn-dark" href="/news/${encodeURIComponent(hero.slug)}">مطالعه کامل</a><a class="btn btn-light" href="#latest">آخرین خبرها</a></div><div class="hero-meta"><span><b>${Number(hero.views||0).toLocaleString('fa-IR')}</b><small>بازدید</small></span><i></i><span><b>${readingMinutes(hero.body||'')}</b><small>دقیقه مطالعه</small></span><i></i><span><b>${esc(CATEGORY_LABELS[hero.category]||'خبر')}</b><small>${esc(fmtDate(hero.published_at))}</small></span></div></div>`
  : `
    <div class="hero-copy"><div class="hero-kicker"><span>NEW ERA</span><b>رسانه نسل امروز</b></div><h1>خبر را فقط نبین؛<br><em>زاویه‌اش را ببین.</em></h1><p>نگاه جوان یک تجربه خبری مدرن است؛ سریع، روشن و ساخته‌شده برای موبایل، بدون شلوغی و بدون قالب‌های تکراری.</p><div class="hero-actions"><a class="btn btn-dark" href="/editorial">ورود به تحریریه</a><a class="btn btn-light" href="#latest">مشاهده خبرها</a></div><div class="hero-meta"><span><b>24/7</b><small>اتاق خبر</small></span><i></i><span><b>8</b><small>دسته اصلی</small></span><i></i><span><b>AI</b><small>تحریریه هوشمند</small></span></div></div>`;

  const ticker=breaking.length?breaking.slice(0,6).map(a=>`<a href="/news/${encodeURIComponent(a.slug)}">${esc(a.title)}</a>`).join(''):`<span>برای نمایش نوار فوری، یک خبر را با وضعیت «فوری» منتشر کنید.</span>`;

  const lead=latest.find(a=>!hero||a.id!==hero.id)||latest[0];
  const stream=latest.filter(a=>!lead||a.id!==lead.id).slice(0,5);
  const latestBlock=latest.length?`<div class="latest-grid">${lead?`<a href="/news/${encodeURIComponent(lead.slug)}">${visual(lead)}<div class="lead-copy"><div class="story-meta"><b>${esc(CATEGORY_LABELS[lead.category]||'خبر')}</b><span>${esc(fmtDate(lead.published_at))}</span></div><h3>${esc(lead.title)}</h3><p>${esc(lead.excerpt||'')}</p></div></a>`:''}<div class="stack">${stream.map(stackItem).join('')}</div></div>`:`<div class="empty">هنوز خبری منتشر نشده است.</div>`;

  const sections=[
    ['سیاست','politics','قدرت، تصمیم و سیاست عمومی'],
    ['حوادث','incidents','روایت دقیق رویدادهای مهم'],
    ['بین‌الملل','world','جهان، منطقه و دیپلماسی'],
    ['اقتصاد','economy','بازار، پول و اقتصاد'],
    ['جامعه','society','زندگی اجتماعی و مسائل روز'],
    ['فناوری','technology','هوش مصنوعی، دیجیتال و آینده'],
    ['فرهنگ','culture','رسانه، هنر و فرهنگ'],
    ['ورزش','sports','مسابقه، تیم و چهره']
  ];

  return shell('صفحه اصلی',`${header()}<main class="wrap"><div class="breaking"><div class="breaking-label"><i></i>فوری</div><div class="breaking-track">${ticker}</div><div class="breaking-code">NJ / LIVE</div></div><section class="hero">${heroCopy}${heroVisual}</section><section id="latest" class="section"><div class="section-head"><div><small>LATEST / NOW</small><h2>آخرین خبرها</h2><p>تازه‌ترین خروجی تحریریه نگاه جوان</p></div><form class="search" action="/search"><input name="q" placeholder="جست‌وجوی خبر"><button>جست‌وجو</button></form></div>${latestBlock}</section>${sections.map((x,i)=>categorySection(x[0],x[1],x[2],data.sections?.[x[1]]||[],i)).join('')}</main>${footer()}`);
}

export function articlePage(a){
  if(!a) return notFoundPage();
  const source=a.source_name||a.source_url?`<div class="source"><b>منبع:</b> ${a.source_url?`<a href="${esc(a.source_url)}" rel="noopener noreferrer">${esc(a.source_name||a.source_url)}</a>`:esc(a.source_name)}</div>`:'';
  const paras=String(a.body||'').split(/\n{2,}/).map(p=>p.trim()).filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join('');
  return shell(a.title,`${header()}<main class="wrap"><div class="article-shell"><article class="article-main"><div class="hero-kicker"><span>ARTICLE</span><b>${esc(CATEGORY_LABELS[a.category]||'خبر')}</b></div><h1>${esc(a.title)}</h1><div class="article-meta"><span>${esc(fmtDate(a.published_at))}</span><span>${Number(a.views||0).toLocaleString('fa-IR')} بازدید</span><span>${readingMinutes(a.body||'')} دقیقه مطالعه</span></div>${a.excerpt?`<p class="article-excerpt">${esc(a.excerpt)}</p>`:''}<div class="article-cover" ${imageStyle(a)}></div><div class="article-body">${paras}</div>${source}</article><aside class="article-aside"><small>NEGAAH JAVAN</small><h3>خلاصه خبر</h3><p>${esc(a.excerpt||'خلاصه‌ای برای این خبر ثبت نشده است.')}</p><div class="hero-actions"><a class="btn btn-light" href="/">صفحه اصلی</a><a class="btn btn-light" href="/category/${esc(a.category)}">اخبار مرتبط</a></div></aside></div></main>${footer()}`);
}

export function listingPage(title,items,query=''){
  return shell(title,`${header()}<main class="wrap"><section class="listing-title section"><div class="section-head"><div><small>ARCHIVE</small><h2>${esc(title)}</h2>${query?`<p>نتایج برای «${esc(query)}»</p>`:''}</div></div>${items.length?`<div class="listing-grid">${items.map(storyCard).join('')}</div>`:`<div class="empty">نتیجه‌ای پیدا نشد.</div>`}</section></main>${footer()}`);
}

export function notFoundPage(){
  return shell('یافت نشد',`${header()}<main class="wrap"><div style="padding:100px 0;text-align:center"><div style="font:900 90px/1 Arial;color:#b8bfbc">404</div><h1 style="font-size:32px">صفحه پیدا نشد</h1><a class="btn btn-dark" href="/">بازگشت به صفحه اصلی</a></div></main>${footer()}`);
}
