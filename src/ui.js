import { editionPanel, editionEditorStyles, editionEditorScript } from './edition-editor.js';
import { CATEGORY_LABELS } from './db.js';
import { readingMinutes } from './smart.js';
import { premiumTheme } from './theme-premium.js';
import { brandWordmark } from './design-art.js';

const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate = (v) => {
  if (!v) return '';
  try { return new Intl.DateTimeFormat('fa-IR', { dateStyle:'medium', timeStyle:'short' }).format(new Date(v)); }
  catch { return String(v); }
};
const imgStyle = (url) => url ? `style="background-image:linear-gradient(180deg,rgba(4,10,20,.08),rgba(4,10,20,.78)),url('${esc(url)}')"` : '';
const smartImgStyle = (a) => imgStyle(a?.hero_image || (a?.slug ? '/cover/' + encodeURIComponent(a.slug) + '.svg' : ''));
const readMins = (body='') => Math.max(1, Math.ceil(String(body).trim().split(/\s+/).filter(Boolean).length / 220));

const css = `
:root{--bg:#07101a;--bg2:#0c1623;--card:rgba(255,255,255,.07);--card2:rgba(255,255,255,.11);--line:rgba(255,255,255,.12);--text:#f5f8fc;--muted:#aeb9c7;--accent:#4fd1c5;--accent2:#7dd3fc;--red:#ff5a67;--amber:#f6c85f;--shadow:0 24px 80px rgba(0,0,0,.32)}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:radial-gradient(circle at 85% -10%,rgba(79,209,197,.14),transparent 34%),radial-gradient(circle at -10% 30%,rgba(125,211,252,.10),transparent 32%),var(--bg);color:var(--text);font-family:Vazirmatn,Tahoma,Arial,sans-serif;direction:rtl;min-height:100vh}a{color:inherit;text-decoration:none}button,input,textarea,select{font:inherit}.wrap{width:min(1180px,calc(100% - 32px));margin:auto}.glass{background:linear-gradient(145deg,rgba(255,255,255,.10),rgba(255,255,255,.045));border:1px solid var(--line);box-shadow:var(--shadow);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.top{position:sticky;top:0;z-index:30;background:rgba(7,16,26,.78);backdrop-filter:blur(18px);border-bottom:1px solid rgba(255,255,255,.08)}.top-inner{height:76px;display:flex;align-items:center;gap:22px}.brand{display:flex;align-items:center;gap:11px;font-weight:900;font-size:24px}.mark{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#041117;font-weight:1000;box-shadow:0 10px 30px rgba(79,209,197,.25)}.nav{display:flex;gap:16px;overflow:auto;white-space:nowrap;color:#d6dee8;font-size:14px}.nav a:hover{color:#fff}.grow{flex:1}.editor-link{padding:10px 14px;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,.05)}
.ticker{margin-top:18px;border-radius:16px;display:flex;align-items:center;overflow:hidden;min-height:48px}.ticker-label{background:var(--red);padding:14px 18px;font-weight:900;white-space:nowrap}.ticker-track{display:flex;gap:32px;overflow:auto;padding:0 18px;color:#f3f6fa}.ticker-track a{white-space:nowrap}.hero{margin-top:22px;min-height:520px;border-radius:30px;position:relative;overflow:hidden;background:linear-gradient(135deg,#11263b,#0b1826 60%,#0d3238);background-size:cover;background-position:center}.hero:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,12,20,.10),rgba(5,12,20,.86) 74%)}.hero-content{position:relative;z-index:2;min-height:520px;display:flex;flex-direction:column;justify-content:flex-end;padding:clamp(26px,5vw,58px);max-width:820px;margin-right:auto}.eyebrow{display:inline-flex;align-items:center;gap:9px;width:max-content;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.13);font-size:13px}.dot{width:8px;height:8px;border-radius:50%;background:var(--red);box-shadow:0 0 0 6px rgba(255,90,103,.12)}h1{font-size:clamp(36px,6vw,70px);line-height:1.08;margin:18px 0 16px;letter-spacing:-1.2px}.hero p{font-size:clamp(16px,2vw,20px);line-height:1.9;color:#d7e0e9;max-width:720px}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}.btn{border:0;border-radius:13px;padding:12px 18px;cursor:pointer}.btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#031018;font-weight:900}.btn-soft{background:rgba(255,255,255,.08);color:#fff;border:1px solid var(--line)}
.section{margin-top:42px}.section-head{display:flex;align-items:end;justify-content:space-between;gap:14px;margin-bottom:16px}.section-title{font-size:27px;font-weight:950}.section-sub{color:var(--muted);font-size:13px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.card{border-radius:20px;overflow:hidden;transition:.2s transform,.2s border-color}.card:hover{transform:translateY(-3px);border-color:rgba(125,211,252,.26)}.thumb{height:190px;background:linear-gradient(135deg,#163149,#0f2733);background-size:cover;background-position:center;position:relative}.thumb:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(4,10,18,.65))}.card-body{padding:18px}.tag{display:inline-flex;padding:6px 10px;border-radius:999px;font-size:12px;color:#c9f9f5;background:rgba(79,209,197,.10);border:1px solid rgba(79,209,197,.18)}.card h3{font-size:19px;line-height:1.65;margin:12px 0 8px}.meta{font-size:12px;color:var(--muted);display:flex;gap:12px;flex-wrap:wrap}.excerpt{color:#bcc7d4;line-height:1.9;font-size:14px}.split{display:grid;grid-template-columns:1.15fr .85fr;gap:18px}.feature-list{display:grid;gap:12px}.mini{padding:16px;border-radius:17px;display:grid;grid-template-columns:100px 1fr;gap:14px;align-items:center}.mini-thumb{height:78px;border-radius:12px;background:linear-gradient(135deg,#163149,#0e202e);background-size:cover;background-position:center}.mini h4{margin:0 0 8px;font-size:15px;line-height:1.6}.empty{padding:34px;border-radius:22px;text-align:center;color:var(--muted)}
.footer{margin-top:58px;padding:36px 0 44px;border-top:1px solid rgba(255,255,255,.08);color:var(--muted)}.footer-row{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}.notice{margin-top:18px;padding:14px 16px;border-radius:14px;background:rgba(246,200,95,.08);border:1px solid rgba(246,200,95,.20);color:#f8dfa4;font-size:13px}
.article{margin-top:28px;padding:clamp(24px,5vw,54px);border-radius:28px}.article h1{font-size:clamp(34px,5vw,58px)}.article-cover{height:min(56vw,600px);border-radius:24px;margin:24px 0;background:linear-gradient(135deg,#17324a,#0d2332);background-size:cover;background-position:center}.article-body{font-size:18px;line-height:2.2;color:#e4e9ee;white-space:pre-wrap}.source{margin-top:28px;padding:14px 16px;border-radius:14px;background:rgba(255,255,255,.05)}
.searchbar{display:flex;gap:10px}.searchbar input{min-width:0;flex:1;padding:12px 14px;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,.06);color:#fff;outline:none}.searchbar input:focus{border-color:rgba(125,211,252,.45)}
.editor-shell{width:min(1180px,calc(100% - 28px));margin:28px auto}.login{max-width:440px;margin:10vh auto;padding:28px;border-radius:24px}.login h1{font-size:34px;margin-top:0}.field{display:grid;gap:7px;margin:12px 0}.field label{font-size:13px;color:var(--muted)}.field input,.field textarea,.field select{width:100%;border:1px solid var(--line);background:rgba(255,255,255,.06);color:#fff;border-radius:12px;padding:12px 13px;outline:none}.field textarea{min-height:140px;resize:vertical}.field select option{background:#0c1623;color:#fff}.error{color:#ff9da6;font-size:13px;min-height:20px}.dash-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px}.dash-head h1{font-size:34px;margin:0}.stats{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin:16px 0}.stat{padding:18px;border-radius:18px}.stat b{display:block;font-size:28px}.stat span{color:var(--muted);font-size:12px}.dash-grid{display:grid;grid-template-columns:380px 1fr;gap:18px}.panel{padding:20px;border-radius:22px}.panel h2{margin-top:0}.article-row{display:grid;grid-template-columns:1fr auto;gap:12px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.08)}.article-row:last-child{border-bottom:0}.row-actions{display:flex;gap:8px;align-items:center}.tiny{padding:7px 9px;border-radius:9px;border:1px solid var(--line);background:rgba(255,255,255,.05);color:#fff;cursor:pointer}.danger{color:#ffb0b6;border-color:rgba(255,90,103,.22)}.status{font-size:11px;padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.08);color:#cbd5df}.status.breaking{background:rgba(255,90,103,.13);color:#ffadb4}.status.published{background:rgba(79,209,197,.12);color:#b9f2ed}
@media(max-width:900px){.grid{grid-template-columns:1fr 1fr}.split,.dash-grid{grid-template-columns:1fr}.stats{grid-template-columns:repeat(2,1fr)}.hero,.hero-content{min-height:460px}.nav{display:none}}
@media(max-width:620px){.wrap{width:min(100% - 20px,1180px)}.top-inner{height:66px}.brand{font-size:20px}.mark{width:36px;height:36px}.editor-link{font-size:12px;padding:8px 10px}.grid{grid-template-columns:1fr}.hero{border-radius:22px}.hero-content{padding:24px}.ticker{border-radius:13px}.ticker-label{padding:13px}.mini{grid-template-columns:82px 1fr}.mini-thumb{height:68px}.article{border-radius:20px}.stats{grid-template-columns:1fr 1fr}.dash-head{align-items:flex-start}.dash-head h1{font-size:28px}}

/* professional newsroom + smart editorial */
body{font-family:system-ui,-apple-system,"Segoe UI",Tahoma,Arial,sans-serif;text-rendering:optimizeLegibility}
.top{box-shadow:0 12px 34px rgba(0,0,0,.12)}.mark{border:1px solid rgba(255,255,255,.2)}.hero{box-shadow:0 30px 90px rgba(0,0,0,.34)}
.card h3,.mini h4,.article h1,.article-body{overflow-wrap:anywhere}.thumb,.mini-thumb,.article-cover{background-color:#102334}
.section-title{letter-spacing:-.45px}.section-head:after{content:'';height:1px;flex:1;background:linear-gradient(90deg,transparent,rgba(255,255,255,.09));margin-bottom:8px}
.smartbar{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}.smart{border:1px solid rgba(79,209,197,.22);background:rgba(79,209,197,.09);color:#c8fff9;padding:8px 10px;border-radius:10px;cursor:pointer;font-size:12px}
.editor-note{color:#8293a5;font-size:11px;line-height:1.8;margin:8px 0 12px}.cover-preview{height:175px;border-radius:16px;margin:10px 0;background:linear-gradient(135deg,#0b2b39,#0d4d4b);background-size:cover;background-position:center;display:flex;align-items:flex-end;padding:16px;position:relative;overflow:hidden}.cover-preview:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent,rgba(3,9,16,.74))}.cover-preview b{position:relative;z-index:2;line-height:1.7}
.quality{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin:10px 0}.q{padding:9px 10px;border-radius:10px;background:rgba(255,255,255,.045);font-size:11px;color:#aeb9c7}.q.ok{color:#baf7dc;border:1px solid rgba(95,225,167,.15)}.q.warn{color:#ffe2a0;border:1px solid rgba(246,200,95,.15)}
.article-tools{display:flex;gap:8px;flex-wrap:wrap;margin-top:15px}
@media(max-width:620px){.quality{grid-template-columns:1fr}.section-head:after{display:none}.article-body{font-size:17px;line-height:2.15}}

/* newsroom v2 */
body{overflow-x:hidden}
body:before{content:'';position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.016) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.014) 1px,transparent 1px);background-size:44px 44px;mask-image:linear-gradient(to bottom,rgba(0,0,0,.55),transparent 78%)}
.kicker{font-size:12px;letter-spacing:.08em;color:#8de7df;font-weight:900}.mast{padding:10px 0;border-bottom:1px solid rgba(255,255,255,.07);font-size:12px;color:var(--muted)}.mast .wrap{display:flex;gap:12px;align-items:center;justify-content:space-between}.mast-live{display:flex;align-items:center;gap:8px}.pulse{width:8px;height:8px;border-radius:50%;background:var(--red);box-shadow:0 0 0 0 rgba(255,90,103,.45);animation:pulse 1.8s infinite}@keyframes pulse{70%{box-shadow:0 0 0 9px rgba(255,90,103,0)}100%{box-shadow:0 0 0 0 rgba(255,90,103,0)}}
.hero-shell{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(290px,.55fr);gap:16px;margin-top:22px}.hero{margin-top:0}.hero-side{display:grid;gap:12px}.hero-side .mini{min-height:112px}.hero-side-title{font-size:13px;color:var(--muted);margin:4px 2px 2px}
.smart-cover{position:relative;overflow:hidden;background:linear-gradient(145deg,#10283c,#0c1e2e);isolation:isolate}.smart-cover:before,.smart-cover:after{content:'';position:absolute;border-radius:999px;filter:blur(2px);opacity:.78;z-index:-1}.smart-cover:before{width:180px;height:180px;left:-54px;top:-66px;background:radial-gradient(circle,rgba(125,211,252,.45),transparent 67%)}.smart-cover:after{width:220px;height:220px;right:-90px;bottom:-100px;background:radial-gradient(circle,rgba(79,209,197,.38),transparent 68%)}.cover-incidents:after{background:radial-gradient(circle,rgba(255,90,103,.42),transparent 68%)}.cover-politics:before{background:radial-gradient(circle,rgba(125,211,252,.42),transparent 67%)}.cover-economy:after{background:radial-gradient(circle,rgba(246,200,95,.38),transparent 68%)}.cover-sports:before{background:radial-gradient(circle,rgba(79,209,197,.42),transparent 68%)}.cover-culture:after{background:radial-gradient(circle,rgba(190,140,255,.38),transparent 68%)}.cover-mark{position:absolute;inset:auto 18px 16px auto;display:flex;align-items:center;gap:8px;font-size:12px;color:#dce7f1}.cover-symbol{display:grid;place-items:center;width:38px;height:38px;border-radius:13px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.16);font-size:18px}.cover-category{position:absolute;left:18px;top:16px;font-size:26px;font-weight:950;color:rgba(255,255,255,.92)}.hero.smart-cover .cover-category{font-size:clamp(34px,5vw,64px);left:clamp(26px,5vw,56px);top:clamp(28px,5vw,58px);opacity:.16}.hero.smart-cover .cover-mark{left:clamp(26px,5vw,56px);right:auto;bottom:28px;opacity:.8}.thumb.smart-cover,.mini-thumb.smart-cover{display:block}
.news-rail{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:16px}.rail-item{padding:16px;border-radius:17px;min-height:128px}.rail-item h4{margin:9px 0 0;line-height:1.65;font-size:15px}.rail-number{font-size:11px;color:var(--accent2);font-weight:900}
.section-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:16px}.section-lead .card{height:100%}.section-stack{display:grid;gap:12px}
.article-wrap{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:18px;align-items:start}.article-aside{position:sticky;top:96px;padding:18px;border-radius:20px}.article-aside h3{margin:0 0 12px}.article-body{white-space:normal;unicode-bidi:plaintext;text-align:right;overflow-wrap:anywhere}.article-body p{margin:0 0 1.35em}.article-body p:first-child::first-letter{font-size:1.7em;font-weight:900;color:var(--accent2)}.reading{display:flex;align-items:center;gap:8px}.reading:before{content:'◷';color:var(--accent)}
.editor-shell{max-width:1360px}.dash-top{padding:20px 22px;border-radius:24px;margin-bottom:14px}.dash-top-row{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}.dash-note{font-size:13px;color:var(--muted);line-height:1.8}.stats{grid-template-columns:repeat(5,minmax(0,1fr))}.stat{position:relative;overflow:hidden}.stat:after{content:'';position:absolute;width:70px;height:70px;border-radius:50%;left:-22px;top:-24px;background:rgba(125,211,252,.07)}.stat b{font-family:Arial,Tahoma,sans-serif;font-variant-numeric:tabular-nums}.dash-grid{grid-template-columns:minmax(390px,.72fr) minmax(0,1.28fr)}.composer{position:sticky;top:18px;align-self:start}.field input,.field textarea,.field select{unicode-bidi:plaintext;text-align:right}.field textarea{line-height:1.9}.smartbar{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}.smart-action{padding:10px;border-radius:11px;border:1px solid rgba(125,211,252,.18);background:rgba(125,211,252,.07);color:#dff7ff;cursor:pointer;font-size:12px}.smart-action:hover{background:rgba(125,211,252,.12)}.insights{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0 16px}.insight{padding:10px;border-radius:12px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.07);text-align:center}.insight b{display:block;font-family:Arial,Tahoma,sans-serif;font-size:16px}.insight span{font-size:10px;color:var(--muted)}.preview-card{border-radius:18px;overflow:hidden;margin:12px 0;border:1px solid var(--line)}.preview-media{height:145px}.preview-copy{padding:13px}.preview-copy h4{margin:0 0 7px;line-height:1.6}.preview-copy p{margin:0;color:var(--muted);font-size:12px;line-height:1.7}.editor-list-tools{display:flex;gap:8px;margin-bottom:12px}.editor-list-tools input{flex:1;padding:10px 12px;border-radius:11px;border:1px solid var(--line);background:rgba(255,255,255,.05);color:#fff}.article-row{align-items:center}.article-row-title{font-weight:850;line-height:1.65}.article-row .meta{margin-top:6px}.auto-badge{display:inline-flex;align-items:center;gap:5px;font-size:10px;color:#c6fff8;padding:5px 8px;border-radius:999px;background:rgba(79,209,197,.08);border:1px solid rgba(79,209,197,.14)}.helper{font-size:11px;color:var(--muted);line-height:1.7}.form-divider{height:1px;background:rgba(255,255,255,.08);margin:14px 0}
@media(max-width:1000px){.hero-shell,.article-wrap{grid-template-columns:1fr}.hero-side{grid-template-columns:1fr 1fr}.article-aside{position:static}.news-rail{grid-template-columns:1fr 1fr}.dash-grid{grid-template-columns:1fr}.composer{position:static}}
@media(max-width:700px){.hero-side{grid-template-columns:1fr}.news-rail{grid-template-columns:1fr 1fr}.stats{grid-template-columns:1fr 1fr}.smartbar{grid-template-columns:1fr 1fr}.insights{grid-template-columns:1fr 1fr}.section-grid{grid-template-columns:1fr}.mast{display:none}}

/* luminous glass / typography v3 */
:root{
  --bg:#edf5f7;--bg2:#e4eef2;--card:rgba(255,255,255,.58);--card2:rgba(255,255,255,.76);
  --line:rgba(255,255,255,.86);--text:#0b1724;--muted:#526473;--accent:#0bb8c4;--accent2:#55c9f0;
  --red:#ff5264;--amber:#d89c25;--shadow:0 24px 70px rgba(38,67,82,.13)
}
body{
  background:
    radial-gradient(circle at 85% 0%,rgba(111,221,229,.38),transparent 28%),
    radial-gradient(circle at 8% 18%,rgba(125,211,252,.34),transparent 27%),
    radial-gradient(circle at 50% 100%,rgba(206,226,237,.8),transparent 36%),
    linear-gradient(145deg,#f7fbfc 0%,#edf5f7 48%,#e5eff3 100%);
  color:var(--text)
}
body:before{
  background-image:linear-gradient(rgba(36,73,92,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(36,73,92,.035) 1px,transparent 1px);
  opacity:.6
}
.glass{
  background:linear-gradient(145deg,rgba(255,255,255,.76),rgba(255,255,255,.42));
  border:1px solid rgba(255,255,255,.92);
  box-shadow:0 24px 70px rgba(41,71,87,.13),inset 0 1px 0 rgba(255,255,255,.94);
  backdrop-filter:blur(26px) saturate(135%);-webkit-backdrop-filter:blur(26px) saturate(135%)
}
.top{
  background:rgba(247,252,253,.72);border-bottom:1px solid rgba(255,255,255,.86);
  box-shadow:0 12px 34px rgba(48,82,98,.08)
}
.brand{color:#0b1724;letter-spacing:-.7px}.mark{background:linear-gradient(135deg,#70e1df,#78c9f7);color:#08131d;box-shadow:0 12px 28px rgba(19,169,183,.22)}
.nav{color:#3f5667;font-weight:700}.nav a:hover{color:#071522}
.editor-link,.btn-soft{background:rgba(255,255,255,.56);color:#172b39;border:1px solid rgba(255,255,255,.94);box-shadow:0 8px 24px rgba(53,81,95,.08)}
.mast{border-bottom-color:rgba(39,74,91,.08);color:#5c6f7d}.kicker{color:#008c9a}
.ticker{background:rgba(255,255,255,.66);border:1px solid rgba(255,255,255,.92);box-shadow:0 18px 46px rgba(52,79,94,.09)}
.ticker-track{color:#213746}.ticker-label{box-shadow:0 8px 20px rgba(255,82,100,.23)}
.hero-shell{grid-template-columns:minmax(0,1.55fr) minmax(280px,.45fr);gap:20px;margin-top:24px}
.hero{
  min-height:620px;border-radius:38px;border:1px solid rgba(255,255,255,.95);
  box-shadow:0 36px 90px rgba(34,63,78,.18),inset 0 1px 0 rgba(255,255,255,.9);
  background-color:#dbe8ed;background-size:cover;background-position:center;isolation:isolate
}
.hero:after{
  z-index:0;background:linear-gradient(90deg,rgba(238,247,249,.08) 0%,rgba(243,249,250,.48) 34%,rgba(247,251,252,.90) 66%,rgba(249,252,253,.985) 100%)
}
.hero-type{
  position:absolute;left:clamp(20px,4vw,58px);top:50%;transform:translateY(-52%);z-index:1;
  font-size:clamp(78px,11vw,170px);line-height:.72;font-weight:1000;letter-spacing:-8px;text-align:left;
  color:rgba(255,255,255,.22);-webkit-text-stroke:1.5px rgba(11,23,36,.20);
  text-shadow:0 18px 44px rgba(22,48,62,.12);user-select:none;pointer-events:none
}
.hero-number{
  position:absolute;left:clamp(22px,4vw,60px);bottom:34px;z-index:2;font:800 11px/1 Arial,sans-serif;
  letter-spacing:.18em;color:rgba(16,48,65,.62);background:rgba(255,255,255,.58);border:1px solid rgba(255,255,255,.84);
  padding:10px 13px;border-radius:999px;backdrop-filter:blur(12px)
}
.hero-content{
  min-height:620px;max-width:720px;margin-right:0;margin-left:auto;padding:clamp(34px,5vw,72px);
  justify-content:center;text-align:right
}
.hero h1{
  color:#071522;font-size:clamp(48px,6.7vw,92px);line-height:.94;letter-spacing:-3.6px;font-weight:1000;
  margin:20px 0 18px;max-width:690px;text-wrap:balance
}
.hero h1 strong{color:#009eaa;font-weight:1000}
.hero p{color:#405564;font-size:clamp(16px,1.75vw,20px);line-height:2;max-width:620px;font-weight:540}
.eyebrow{background:rgba(255,255,255,.66);border:1px solid rgba(255,255,255,.9);color:#243b4a;box-shadow:0 8px 26px rgba(44,75,91,.08)}
.btn-primary{background:linear-gradient(135deg,#0bbbc5,#63cdf1);color:#06131b;box-shadow:0 14px 30px rgba(10,173,187,.22);font-weight:950}
.hero-side{gap:14px}.hero-side-title{color:#526473;font-weight:850}
.hero-side .mini{background:linear-gradient(145deg,rgba(255,255,255,.82),rgba(255,255,255,.52));border:1px solid rgba(255,255,255,.96);box-shadow:0 18px 44px rgba(42,71,85,.10)}
.mini h4,.card h3,.section-title,.article-row-title{color:#102332}
.meta,.section-sub,.excerpt,.helper,.dash-note{color:#5c6d79}
.tag{color:#007d87;background:rgba(13,184,196,.10);border-color:rgba(13,184,196,.20);font-weight:850}
.card,.rail-item,.panel,.dash-top,.stat,.article,.article-aside,.login{background:linear-gradient(145deg,rgba(255,255,255,.76),rgba(255,255,255,.45))}
.card-body{background:linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.36))}
.section-head:after{background:linear-gradient(90deg,transparent,rgba(43,74,90,.12))}
.thumb:after{background:linear-gradient(180deg,transparent 55%,rgba(13,32,43,.46))}
.news-rail .rail-item{border:1px solid rgba(255,255,255,.94)}
.rail-number{color:#008a96}
.footer{border-top-color:rgba(40,73,89,.10);color:#5a6c79}.footer b{color:#0b1724!important}
.article h1{color:#0a1825}.article-body{color:#243b49}.article-aside{color:#1a2f3d}.source{background:rgba(255,255,255,.52)}
.field label{color:#506371;font-weight:760}
.field input,.field textarea,.field select,.editor-list-tools input,.searchbar input{
  background:rgba(255,255,255,.62);color:#102332;border:1px solid rgba(255,255,255,.96);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.95),0 8px 20px rgba(42,71,85,.06)
}
.field input:focus,.field textarea:focus,.field select:focus,.editor-list-tools input:focus,.searchbar input:focus{border-color:rgba(0,167,181,.36);outline:2px solid rgba(0,167,181,.09)}
.field select option{background:#f7fbfc;color:#102332}
.tiny,.smart-action{background:rgba(255,255,255,.62);color:#1a3444;border-color:rgba(255,255,255,.94)}
.insight,.q{background:rgba(255,255,255,.52);border-color:rgba(255,255,255,.88);color:#46606f}
.status{background:rgba(53,84,101,.08);color:#48606f}.status.published{background:rgba(13,184,196,.11);color:#04747c}.status.breaking{background:rgba(255,82,100,.10);color:#bd3042}
.auto-badge{color:#047a83;background:rgba(13,184,196,.08);border-color:rgba(13,184,196,.16)}
.preview-card{background:rgba(255,255,255,.58);border-color:rgba(255,255,255,.96)}
.error{color:#c33345}
@media(max-width:1000px){
  .hero{min-height:560px}.hero-content{min-height:560px;max-width:760px}.hero-type{opacity:.56}
}
@media(max-width:700px){
  .hero{min-height:570px;border-radius:28px;background-position:42% center}
  .hero:after{background:linear-gradient(180deg,rgba(247,251,252,.38) 0%,rgba(247,251,252,.83) 47%,rgba(249,252,253,.99) 100%)}
  .hero-content{min-height:570px;padding:28px 24px;justify-content:flex-end}
  .hero h1{font-size:clamp(42px,13vw,62px);letter-spacing:-2.4px;line-height:.98}
  .hero-type{left:18px;top:112px;transform:none;font-size:74px;line-height:.74;letter-spacing:-5px;opacity:.52}
  .hero-number{left:20px;bottom:auto;top:22px}
  .hero-shell{gap:14px}.hero-side{grid-template-columns:1fr}
  .glass{backdrop-filter:blur(20px) saturate(125%);-webkit-backdrop-filter:blur(20px) saturate(125%)}
}


/* editorial glass v4 — high-end desktop + mobile-first */
:root{
  --ink:#08131d;--ink2:#16303e;--paper:#f6fbfc;--ice:#e8f3f6;--cyan:#0aa9b6;--cyan2:#65d8e0;
  --blue:#55b8e9;--rose:#ff5f73;--hair:rgba(20,49,64,.10);--glass-hi:rgba(255,255,255,.86);
}
html{background:#edf5f7}
body{font-family:"Segoe UI",Tahoma,"Noto Sans Arabic",Arial,sans-serif;letter-spacing:-.01em}
.wrap{width:min(1280px,calc(100% - 40px))}
.top{position:sticky;top:0;z-index:70;background:rgba(246,251,252,.76);backdrop-filter:blur(28px) saturate(145%);-webkit-backdrop-filter:blur(28px) saturate(145%)}
.top-inner{height:auto;display:block;padding:12px 0 9px}
.top-main{display:flex;align-items:center;gap:16px;min-height:54px}
.brand{gap:12px;min-width:max-content}.brand-copy{display:grid;line-height:1}.brand-copy b{font-size:21px;font-weight:1000;letter-spacing:-1px}.brand-copy small{font:800 8px/1.3 Arial,sans-serif;letter-spacing:.13em;color:#6d7f8a;margin-top:5px}
.mark{width:44px;height:44px;border-radius:15px;font-size:22px}
.top-status{display:flex;align-items:center;gap:8px;font-size:11px;color:#617783;font-weight:750}
.nav{display:flex!important;align-items:center;gap:7px;overflow-x:auto;scrollbar-width:none;padding:9px 0 1px;border-top:1px solid rgba(20,49,64,.055)}
.nav::-webkit-scrollbar{display:none}.nav a{flex:0 0 auto;padding:8px 12px;border-radius:999px;font-size:12px;font-weight:850;background:rgba(255,255,255,.40);border:1px solid rgba(255,255,255,.76);transition:.18s}.nav a:hover{background:#fff;transform:translateY(-1px);box-shadow:0 10px 24px rgba(35,64,79,.09)}
.editor-link{font-size:12px;font-weight:900;padding:10px 15px}
.mast{padding:8px 0}.mast .wrap{font-size:11px}
.ticker{margin-top:20px;min-height:52px;border-radius:18px;box-shadow:0 16px 42px rgba(36,66,81,.08)}.ticker-label{align-self:stretch;display:flex;align-items:center;padding:0 20px}.ticker-track{gap:42px;font-size:13px;font-weight:700;scrollbar-width:none}
.hero-shell{grid-template-columns:minmax(0,1.7fr) minmax(280px,.46fr);gap:22px;margin-top:22px;align-items:stretch}
.hero{min-height:680px;border-radius:44px;overflow:hidden;position:relative}
.hero:before{content:'';position:absolute;inset:0;z-index:0;background:linear-gradient(135deg,rgba(255,255,255,.16),transparent 42%);pointer-events:none}
.hero:after{background:linear-gradient(90deg,rgba(235,245,248,.00) 0%,rgba(242,249,250,.34) 27%,rgba(248,252,253,.88) 62%,rgba(250,253,254,.985) 100%)}
.hero-empty{background:
  radial-gradient(circle at 18% 24%,rgba(96,216,225,.62),transparent 20%),
  radial-gradient(circle at 70% 78%,rgba(96,184,232,.25),transparent 27%),
  linear-gradient(135deg,#e1f1f5 0%,#f9fcfd 48%,#eef7f8 100%)!important}
.hero-content{min-height:680px;max-width:760px;padding:clamp(46px,5.3vw,78px);justify-content:center;z-index:5}
.hero-meta-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.hero-category{font-size:11px;font-weight:900;color:#0b7f89;padding:8px 11px;border-radius:999px;background:rgba(255,255,255,.61);border:1px solid rgba(255,255,255,.88)}
.hero h1{font-size:clamp(58px,6.2vw,96px);line-height:.95;letter-spacing:-5px;font-weight:1000;max-width:760px;margin:22px 0 20px;color:#07131c;text-wrap:balance}
.hero h1 strong{color:#0099a5}
.hero p{font-size:clamp(16px,1.6vw,20px);line-height:2.05;max-width:630px;color:#405762;font-weight:560}
.hero-bottom{display:flex;align-items:end;justify-content:space-between;gap:22px;margin-top:18px}
.hero-reading{display:grid;justify-items:end;line-height:1}.hero-reading b{font:950 28px/1 Arial,sans-serif;color:#0b7f89}.hero-reading span{font-size:10px;color:#71838d;margin-top:6px}
.hero-ghost{position:absolute;left:-12px;top:50%;transform:translateY(-53%);z-index:1;font-size:clamp(160px,18vw,285px);font-weight:1000;letter-spacing:-16px;line-height:.78;color:rgba(255,255,255,.13);-webkit-text-stroke:1px rgba(7,32,44,.16);text-shadow:0 28px 70px rgba(19,58,75,.08);user-select:none;pointer-events:none}
.hero-edition{position:absolute;left:42px;top:34px;z-index:4;font:900 10px/1 Arial,sans-serif;letter-spacing:.18em;color:rgba(17,58,75,.56);padding:10px 13px;border-radius:999px;background:rgba(255,255,255,.50);border:1px solid rgba(255,255,255,.78);backdrop-filter:blur(14px)}
.hero-corner{position:absolute;left:38px;bottom:38px;z-index:4;display:grid;gap:5px;text-align:left}.hero-corner span{font:800 9px/1 Arial,sans-serif;letter-spacing:.15em;color:rgba(23,56,71,.50)}
.hero-side{display:grid;grid-template-rows:auto repeat(3,1fr);gap:12px;min-width:0}
.hero-side-title{display:grid;grid-template-columns:auto 1fr;column-gap:10px;align-items:center;padding:4px 3px 8px;color:#233b49}.hero-side-title span{grid-row:1/3;font:950 28px/1 Arial,sans-serif;color:#0b9aa5}.hero-side-title b{font-size:14px;font-weight:950}.hero-side-title small{font-size:9px;color:#7a8b94;margin-top:3px}
.hero-side .mini{min-height:0;height:100%;padding:12px;border-radius:22px;grid-template-columns:112px 1fr;box-shadow:0 18px 42px rgba(42,71,85,.08)}
.hero-side .mini-thumb{height:100%;min-height:92px;border-radius:16px}
.hero-side .mini h4{font-size:14px;line-height:1.55;margin:8px 0 5px}
.news-rail{gap:14px;margin-top:18px}.rail-item{min-height:140px;border-radius:22px;padding:18px;transition:.18s}.rail-item:hover{transform:translateY(-3px);box-shadow:0 20px 42px rgba(42,71,85,.11)}
.section{margin-top:58px}.section-head{margin-bottom:19px;align-items:center}.section-title{font-size:clamp(28px,2.5vw,38px);letter-spacing:-1.6px;font-weight:1000}.section-sub{font-size:12px}
.grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
.card{border-radius:28px;transition:transform .22s ease,box-shadow .22s ease}.card:hover{transform:translateY(-5px);box-shadow:0 28px 62px rgba(42,70,84,.14)}.thumb{height:230px}.card-body{padding:20px 21px 22px}.card h3{font-size:20px;line-height:1.6;letter-spacing:-.65px}
.article{padding:clamp(28px,5vw,68px);border-radius:34px}.article h1{font-size:clamp(44px,5.4vw,76px);line-height:1.1;letter-spacing:-2.5px}.article-body{font-size:19px;line-height:2.25;max-width:800px}.article-aside{border-radius:26px}
.editor-shell{width:min(1400px,calc(100% - 34px));margin:22px auto 42px}.dash-top{border-radius:28px;padding:24px 26px}.dash-grid{grid-template-columns:minmax(410px,.70fr) minmax(0,1.30fr);gap:20px}.panel{border-radius:28px;padding:22px}.composer{top:118px}.field input,.field textarea,.field select{border-radius:14px;padding:13px 14px;font-size:14px}.field textarea{min-height:158px}.smart-action{border-radius:13px;font-weight:850}.insight{border-radius:14px;padding:12px}.preview-card{border-radius:22px}
@media(max-width:1100px){
  .hero-shell{grid-template-columns:1fr}.hero{min-height:620px}.hero-content{min-height:620px;max-width:780px}
  .hero-side{grid-template-columns:repeat(3,1fr);grid-template-rows:auto auto}.hero-side-title{grid-column:1/-1}.hero-side .mini{height:150px}
  .hero-side .mini-thumb{height:100%}.dash-grid{grid-template-columns:1fr}.composer{position:static}
}
@media(max-width:780px){
  .wrap{width:min(100% - 20px,1280px)}
  .top-inner{padding:8px 0 7px}.top-main{min-height:48px;gap:10px}.top-status{display:none}.brand-copy small{display:none}.brand-copy b{font-size:19px}.mark{width:38px;height:38px;border-radius:13px}.editor-link{padding:8px 11px;font-size:11px}
  .nav{margin-left:-2px;margin-right:-2px;padding-top:7px}.nav a{padding:7px 11px;font-size:11px}
  .mast{display:none}.ticker{margin-top:12px;border-radius:15px;min-height:45px}.ticker-label{padding:0 14px;font-size:12px}.ticker-track{padding:0 12px;gap:26px;font-size:12px}
  .hero-shell{display:block;margin-top:12px}.hero{min-height:600px;border-radius:30px;display:flex;align-items:flex-end;background-position:38% center!important}
  .hero:after{background:linear-gradient(180deg,rgba(246,251,252,.04) 0%,rgba(247,252,253,.20) 23%,rgba(248,252,253,.80) 52%,rgba(250,253,254,.995) 78%,rgba(250,253,254,1) 100%)}
  .hero-content{min-height:600px;width:100%;max-width:none;padding:30px 22px 28px;justify-content:flex-end}
  .hero-meta-row{gap:7px}.eyebrow,.hero-category{font-size:10px;padding:7px 9px}
  .hero h1{font-size:clamp(42px,12.2vw,62px);line-height:.99;letter-spacing:-3px;margin:14px 0 12px;max-width:100%}.hero p{font-size:14px;line-height:1.9;margin:0;max-width:96%}
  .hero-bottom{align-items:center;margin-top:14px;gap:10px}.hero-reading{display:none}.actions{gap:8px}.btn{padding:11px 14px;font-size:12px}
  .hero-ghost{font-size:clamp(94px,28vw,150px);letter-spacing:-9px;left:10px;top:94px;transform:none;opacity:.72}
  .hero-edition{top:16px;left:16px;font-size:8px;padding:8px 10px}.hero-corner{display:none}
  .hero-side{margin-top:14px;display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:10px;padding-bottom:4px;scrollbar-width:none}.hero-side::-webkit-scrollbar{display:none}.hero-side-title{display:none}.hero-side .mini{flex:0 0 84%;height:130px;scroll-snap-align:start;grid-template-columns:108px 1fr;padding:10px}
  .news-rail{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:10px;scrollbar-width:none}.news-rail::-webkit-scrollbar{display:none}.rail-item{flex:0 0 76%;min-height:118px;scroll-snap-align:start;padding:15px}
  .section{margin-top:42px}.section-head{display:flex;align-items:flex-end}.section-title{font-size:28px}.section-head .searchbar{display:none}
  .grid{grid-template-columns:1fr;gap:14px}.card{border-radius:23px;display:grid;grid-template-columns:132px minmax(0,1fr);min-height:150px}.card a{display:contents}.thumb{height:100%;min-height:150px;border-radius:0}.card-body{padding:15px 14px}.card h3{font-size:16px;line-height:1.55;margin:9px 0 6px}.card .excerpt{display:none}.card .meta{font-size:10px}.tag{font-size:10px;padding:5px 8px}
  .article-wrap{display:block}.article{margin-top:14px;padding:24px 18px;border-radius:26px}.article h1{font-size:clamp(36px,10vw,52px);line-height:1.12;letter-spacing:-1.8px}.article-cover{height:64vw;min-height:230px;border-radius:20px}.article-body{font-size:17px;line-height:2.15}.article-aside{position:static;margin-top:12px}
  .editor-shell{width:calc(100% - 16px);margin:8px auto 30px}.dash-top{padding:18px;border-radius:22px}.dash-top h1{font-size:27px!important}.dash-note{font-size:11px}.stats{display:flex;overflow-x:auto;gap:8px;scrollbar-width:none}.stats::-webkit-scrollbar{display:none}.stat{flex:0 0 42%;min-width:130px;padding:15px;border-radius:18px}.stat b{font-size:25px}
  .dash-grid{display:block}.panel{padding:16px;border-radius:22px;margin-top:12px}.smartbar{grid-template-columns:1fr 1fr}.insights{grid-template-columns:1fr 1fr}.field input,.field textarea,.field select{font-size:16px;padding:13px}.field textarea{min-height:150px}.preview-media{height:190px}.article-row{grid-template-columns:1fr;gap:10px;padding:14px 0}.row-actions{justify-content:flex-start}.tiny{padding:9px 12px}.login{margin:7vh auto;padding:22px;border-radius:22px}
}
@media(max-width:430px){
  .wrap{width:calc(100% - 14px)}.top-inner{padding-left:1px;padding-right:1px}.editor-link{font-size:10px}.hero{min-height:570px;border-radius:26px}.hero-content{min-height:570px;padding:26px 18px 22px}.hero h1{font-size:clamp(39px,11.8vw,54px);letter-spacing:-2.5px}.hero p{font-size:13.5px}.hero-side .mini{flex-basis:90%}.news-rail .rail-item{flex-basis:84%}.card{grid-template-columns:118px minmax(0,1fr)}.card-body{padding:13px 12px}.card h3{font-size:15px}.section-title{font-size:25px}.smartbar{grid-template-columns:1fr}.actions .btn{flex:1;text-align:center}.dash-top-row{align-items:flex-start}.dash-top-row .actions{width:100%}.dash-top-row .actions>*{flex:1;text-align:center}
}


/* NJ V5 — premium editorial / luminous glass */
:root{
  --page:#f4f8f7;--surface:rgba(255,255,255,.72);--surface-strong:rgba(255,255,255,.9);
  --ink:#0a1519;--ink-soft:#30464e;--muted:#708087;--line:rgba(10,21,25,.10);
  --cyan:#00a8b5;--cyan-dark:#08727a;--red:#e9475d;--shadow:0 24px 70px rgba(27,53,60,.10)
}
*{box-sizing:border-box}
html{background:var(--page)}
body{
  background:
    radial-gradient(circle at 12% 3%,rgba(130,220,225,.25),transparent 23%),
    radial-gradient(circle at 88% 14%,rgba(151,205,232,.22),transparent 20%),
    linear-gradient(#f7fbfa,#eef5f4 55%,#f5f8f7);
  color:var(--ink);
  font-family:"Vazirmatn",Tahoma,Arial,sans-serif;
  letter-spacing:-.015em
}
body:before{opacity:.28;background-size:56px 56px}
.wrap{width:min(1320px,calc(100% - 44px))}
.glass{
  background:linear-gradient(145deg,rgba(255,255,255,.82),rgba(255,255,255,.52));
  border:1px solid rgba(255,255,255,.96);
  box-shadow:0 24px 70px rgba(31,56,63,.10),inset 0 1px 0 rgba(255,255,255,.95);
  backdrop-filter:blur(28px) saturate(130%);-webkit-backdrop-filter:blur(28px) saturate(130%)
}
.top{background:rgba(247,251,250,.82);border-bottom:1px solid rgba(10,21,25,.06);box-shadow:none}
.top-inner{padding:10px 0 8px}.top-main{min-height:52px}.brand-copy b{font-size:22px;letter-spacing:-1.1px}.brand-copy small{color:#839198}
.mark{background:#0b161a;color:white;border-radius:50%;box-shadow:none;width:40px;height:40px;font-size:20px}
.nav{border-top:1px solid rgba(10,21,25,.055);gap:4px}.nav a{background:transparent;border:0;color:#4d626a;padding:7px 11px}.nav a:hover{background:white;color:#0a1519;box-shadow:0 8px 20px rgba(28,54,61,.08)}
.editor-link{background:#0b161a;color:white;border:0;box-shadow:none}
.top-status{color:#6e7f85}.pulse{background:#1fb39d;box-shadow:none}
.home{padding-top:18px}
.breaking-bar{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;min-height:48px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-bottom:22px}
.breaking-label{display:flex;align-items:center;gap:8px;padding:0 18px 0 0;font-size:12px;font-weight:900;color:#aa2438}.breaking-label span{width:7px;height:7px;border-radius:50%;background:var(--red)}
.breaking-track{display:flex;gap:34px;overflow:auto;scrollbar-width:none;padding:0 18px;font-size:12px;color:#33494f}.breaking-track::-webkit-scrollbar{display:none}.breaking-track a{white-space:nowrap;font-weight:700}
.breaking-code{font:800 9px/1 Manrope,Arial,sans-serif;letter-spacing:.12em;color:#92a0a5;padding-left:2px}
.feature-hero{
  position:relative;display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);gap:0;
  min-height:650px;border-radius:36px;overflow:hidden;padding:0;background:rgba(255,255,255,.76)
}
.feature-copy{padding:clamp(42px,5vw,74px);display:flex;flex-direction:column;justify-content:center;position:relative;z-index:3}
.feature-overline{display:flex;align-items:center;gap:9px;flex-wrap:wrap}.feature-overline span{font:800 10px/1 Manrope,Arial,sans-serif;letter-spacing:.13em;color:#0b7c83}.feature-overline b{font-size:11px;color:#6b7c82;padding:7px 10px;border-radius:999px;background:#f3f7f6;border:1px solid rgba(10,21,25,.06)}
.feature-copy h1{font-size:clamp(52px,5.5vw,86px);line-height:1.04;letter-spacing:-4px;font-weight:900;margin:24px 0 20px;color:#091419;text-wrap:balance}
.feature-copy h1 em{font-style:normal;color:var(--cyan-dark)}
.feature-copy p{font-size:clamp(16px,1.5vw,19px);line-height:2;color:#4e636a;max-width:650px;margin:0}
.feature-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:28px}.btn{border-radius:999px;font-weight:800}.btn-primary{background:#0a1519;color:white;box-shadow:none}.btn-primary:hover{background:#10252b}.btn-ghost{background:rgba(255,255,255,.64);color:#22363d;border:1px solid rgba(10,21,25,.09)}
.feature-meta{display:flex;gap:18px;flex-wrap:wrap;margin-top:30px;padding-top:18px;border-top:1px solid var(--line);font-size:10px;color:#819096}.feature-meta b{font:800 14px/1 Manrope,Arial,sans-serif;color:#0b7a82;margin-left:3px}
.feature-media{position:relative;min-height:650px;background-size:cover;background-position:center;overflow:hidden}
.feature-media-empty{background:radial-gradient(circle at 25% 20%,rgba(41,184,194,.35),transparent 26%),linear-gradient(145deg,#d9eeee,#eef6f5)}
.media-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,19,24,.03),rgba(7,19,24,.22))}
.media-word{position:absolute;left:-12px;bottom:45px;font-size:clamp(110px,12vw,190px);line-height:.7;font-weight:900;letter-spacing:-10px;color:rgba(255,255,255,.68);text-shadow:0 10px 40px rgba(0,0,0,.08);mix-blend-mode:screen}
.media-stamp{position:absolute;left:28px;top:28px;display:flex;align-items:center;gap:9px;padding:9px 11px;border-radius:999px;background:rgba(255,255,255,.68);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.88)}.media-stamp span{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#0a1519;color:white;font:800 10px/1 Manrope,Arial}.media-stamp small{font:800 8px/1 Manrope,Arial;letter-spacing:.12em;color:#294049}
.media-caption{position:absolute;right:26px;bottom:24px;padding:9px 12px;border-radius:999px;background:rgba(10,21,25,.54);color:white;font-size:10px;backdrop-filter:blur(12px)}
.feature-rule{position:absolute;right:50%;top:0;bottom:0;width:1px;background:rgba(10,21,25,.07);z-index:4}
.feature-issue{position:absolute;right:24px;top:24px;z-index:5;font:800 9px/1.3 Manrope,Arial;letter-spacing:.12em;color:#91a0a5;text-align:left}.feature-issue span{font-size:7px}
.quick-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:22px;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.quick-story{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;padding:18px 16px;border-left:1px solid var(--line);min-height:112px}.quick-story:last-child{border-left:0}.quick-no{font:800 18px/1 Manrope,Arial;color:#aeb9bd}.quick-story small{font-size:9px;color:#8a989d}.quick-story h4{font-size:14px;line-height:1.55;margin:5px 0 0;color:#1b2d33}.quick-arrow{color:#0c7c83}
.section{margin-top:72px}.section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;padding-bottom:16px;border-bottom:1px solid var(--line);margin-bottom:22px}.section-head:after{display:none}.section-index{font:800 9px/1 Manrope,Arial;letter-spacing:.14em;color:#8a999e;margin-bottom:8px}.section-title{font-size:clamp(30px,3vw,42px);font-weight:900;letter-spacing:-1.8px;color:#0a1519}.section-sub{font-size:11px;color:#75868b;margin-top:4px}.section-more{font-size:11px;font-weight:800;color:#29434a;display:flex;align-items:center;gap:8px}.section-more span{font-size:16px;color:#0a8e97}
.latest-layout,.category-layout{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(330px,.55fr);gap:22px}
.latest-lead .card,.category-lead .card{height:100%;display:block;border-radius:28px;background:transparent;border:0;box-shadow:none;backdrop-filter:none}.latest-lead .card:hover,.category-lead .card:hover{transform:none;box-shadow:none}.latest-lead .thumb,.category-lead .thumb{height:420px;border-radius:28px}.latest-lead .card-body,.category-lead .card-body{padding:20px 4px 0;background:transparent}.latest-lead .card h3,.category-lead .card h3{font-size:clamp(24px,2.2vw,34px);line-height:1.45;letter-spacing:-1px}.latest-lead .excerpt,.category-lead .excerpt{display:block;font-size:13px;line-height:1.9;color:#6d7e84}
.latest-stack,.category-stack{display:grid;align-content:start;gap:0;border-top:1px solid var(--line)}
.latest-stack .mini,.category-stack .mini{background:transparent;border:0;border-bottom:1px solid var(--line);box-shadow:none;border-radius:0;padding:16px 0;grid-template-columns:118px 1fr}.latest-stack .mini-thumb,.category-stack .mini-thumb{height:92px;border-radius:16px}.latest-stack .mini h4,.category-stack .mini h4{font-size:15px;line-height:1.55;color:#14262d}.latest-stack .tag,.category-stack .tag{display:none}
.card{background:transparent;border:0;box-shadow:none;backdrop-filter:none}.card:hover{transform:translateY(-2px)}.thumb{border-radius:22px;height:220px}.card-body{padding:15px 2px 0;background:transparent}.card h3{font-size:18px;line-height:1.55;color:#17282e}.tag{background:transparent;border:0;padding:0;color:#0b7f86;font-size:10px;font-weight:900}.meta{font-size:10px;color:#8a989d}
.footer{border-top:1px solid var(--line);color:#7d8b90;margin-top:84px}
.article,.article-aside,.panel,.dash-top,.stat,.login{background:rgba(255,255,255,.72);border:1px solid rgba(255,255,255,.94);box-shadow:0 20px 60px rgba(29,55,62,.08)}
.editor-shell{width:min(1440px,calc(100% - 36px))}.dash-top,.panel{border-radius:26px}.composer{top:112px}.smart-action{background:#f4f8f7;color:#173038;border:1px solid var(--line)}.field input,.field textarea,.field select,.editor-list-tools input{background:#fbfdfc;border:1px solid rgba(10,21,25,.10);box-shadow:none}.insight{background:#f8fbfa;border:1px solid rgba(10,21,25,.07)}.preview-card{background:#fbfdfc}
@media(max-width:1050px){
  .feature-hero{grid-template-columns:1fr;min-height:auto}.feature-copy{order:2}.feature-media{order:1;min-height:470px}.feature-rule{display:none}.feature-issue{right:auto;left:24px}.latest-layout,.category-layout{grid-template-columns:1fr}.latest-stack,.category-stack{grid-template-columns:repeat(2,1fr);gap:14px;border:0}.latest-stack .mini,.category-stack .mini{border:1px solid var(--line);border-radius:18px;padding:10px}.quick-strip{grid-template-columns:1fr 1fr}.quick-story:nth-child(2){border-left:0}.quick-story:nth-child(-n+2){border-bottom:1px solid var(--line)}
}
@media(max-width:720px){
  .wrap{width:calc(100% - 20px)}.home{padding-top:10px}.top-inner{padding:7px 0}.top-main{min-height:44px}.brand-copy b{font-size:18px}.mark{width:36px;height:36px}.editor-link{font-size:10px;padding:8px 10px}.top-status{display:none}.nav{padding-top:6px}.nav a{font-size:10px;padding:6px 9px}
  .breaking-bar{grid-template-columns:auto minmax(0,1fr);margin-bottom:12px;min-height:42px}.breaking-code{display:none}.breaking-label{padding-right:4px;font-size:10px}.breaking-track{font-size:10px;padding:0 10px;gap:20px}
  .feature-hero{border-radius:26px}.feature-media{min-height:330px}.feature-copy{padding:24px 19px 22px}.feature-overline span{font-size:8px}.feature-overline b{font-size:9px;padding:5px 8px}.feature-copy h1{font-size:clamp(38px,10.7vw,54px);line-height:1.06;letter-spacing:-2.4px;margin:14px 0 12px}.feature-copy p{font-size:13.5px;line-height:1.9}.feature-actions{margin-top:18px}.btn{font-size:11px;padding:10px 13px}.feature-meta{gap:11px;margin-top:20px;padding-top:14px;font-size:8.5px}.feature-meta span:last-child{display:none}.feature-issue{top:14px;left:14px}.media-word{font-size:92px;left:8px;bottom:32px;letter-spacing:-6px}.media-stamp{left:14px;top:14px}.media-caption{right:14px;bottom:13px;font-size:8px}
  .quick-strip{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:0;border-bottom:1px solid var(--line);scrollbar-width:none}.quick-strip::-webkit-scrollbar{display:none}.quick-story{flex:0 0 82%;scroll-snap-align:start;border-left:1px solid var(--line)!important;border-bottom:0!important;min-height:96px;padding:14px 12px}.quick-no{font-size:15px}.quick-story h4{font-size:13px}
  .section{margin-top:48px}.section-head{padding-bottom:12px;margin-bottom:16px}.section-title{font-size:28px}.section-index{font-size:7px}.section-sub{font-size:10px}.section-more{font-size:9px}
  .latest-layout,.category-layout{display:block}.latest-lead .thumb,.category-lead .thumb{height:58vw;min-height:230px;border-radius:22px}.latest-lead .card h3,.category-lead .card h3{font-size:22px}.latest-lead .excerpt,.category-lead .excerpt{font-size:12px}
  .latest-stack,.category-stack{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:10px;margin-top:18px;scrollbar-width:none}.latest-stack::-webkit-scrollbar,.category-stack::-webkit-scrollbar{display:none}.latest-stack .mini,.category-stack .mini{flex:0 0 82%;scroll-snap-align:start;grid-template-columns:105px 1fr;border:1px solid var(--line);border-radius:18px;padding:9px;background:rgba(255,255,255,.42)}.latest-stack .mini-thumb,.category-stack .mini-thumb{height:86px}.latest-stack .mini h4,.category-stack .mini h4{font-size:13px}
  .searchbar{display:none}
  .article{padding:22px 16px;border-radius:24px}.article h1{font-size:clamp(34px,9vw,48px);letter-spacing:-1.5px}.article-body{font-size:16.5px}
  .editor-shell{width:calc(100% - 14px);margin-top:7px}.dash-top{padding:16px}.dash-top h1{font-size:25px!important}.panel{padding:14px}.stats{display:flex;overflow-x:auto;gap:8px}.stat{flex:0 0 43%;min-width:125px}.smartbar{grid-template-columns:1fr}.insights{grid-template-columns:1fr 1fr}.field input,.field textarea,.field select{font-size:16px}.row-actions{flex-wrap:wrap}
}
@media(max-width:430px){
  .wrap{width:calc(100% - 14px)}.feature-media{min-height:300px}.feature-copy{padding:21px 16px 19px}.feature-copy h1{font-size:clamp(36px,10.8vw,49px)}.feature-copy p{font-size:13px}.feature-meta{font-size:8px}.feature-meta span:nth-child(2){display:none}.quick-story{flex-basis:88%}.latest-stack .mini,.category-stack .mini{flex-basis:88%}.section-title{font-size:25px}.latest-lead .card h3,.category-lead .card h3{font-size:20px}
}


/* NJ V7 — restrained premium 3D hero */
.feature-hero-3d{
  direction:ltr;
  display:grid;
  grid-template-columns:minmax(0,1.08fr) minmax(420px,.92fr);
  min-height:560px;
  padding:28px;
  border-radius:36px;
  position:relative;
  overflow:hidden;
  isolation:isolate;
  perspective:1400px;
  background:
    radial-gradient(circle at 78% 18%,rgba(88,208,217,.20),transparent 23%),
    radial-gradient(circle at 92% 86%,rgba(79,149,206,.14),transparent 25%),
    linear-gradient(145deg,rgba(255,255,255,.94),rgba(239,247,247,.78));
}
.feature-copy{
  direction:rtl;
  padding:clamp(34px,4.5vw,64px);
  align-self:center;
  position:relative;
  z-index:6;
}
.feature-copy h1{
  font-size:clamp(50px,5.1vw,80px);
  line-height:1.03;
  letter-spacing:-3.8px;
  max-width:720px;
  margin:20px 0 18px;
}
.feature-copy p{max-width:610px}
.feature-meta{max-width:610px}
.feature-rule,.feature-issue{display:none}
.premium-stage{
  direction:rtl;
  min-height:500px;
  position:relative;
  display:grid;
  place-items:center;
  transform-style:preserve-3d;
  perspective:1200px;
  z-index:4;
}
.stage-glow{
  position:absolute;
  width:78%;
  aspect-ratio:1;
  border-radius:50%;
  background:radial-gradient(circle,rgba(68,191,201,.22),rgba(68,191,201,0) 68%);
  filter:blur(2px);
  right:4%;
  top:5%;
}
.stage-sheet{
  position:absolute;
  width:72%;
  height:72%;
  border-radius:30px;
  border:1px solid rgba(255,255,255,.88);
  background:linear-gradient(145deg,rgba(255,255,255,.60),rgba(220,235,238,.22));
  box-shadow:0 30px 70px rgba(34,66,76,.10);
  backdrop-filter:blur(16px);
}
.stage-back{transform:translate3d(-24px,18px,-130px) rotate(-7deg)}
.stage-mid{transform:translate3d(18px,-4px,-60px) rotate(4deg);opacity:.76}
.stage-card{
  width:78%;
  height:72%;
  min-height:390px;
  position:relative;
  z-index:4;
  transform:rotateY(-8deg) rotateX(2deg) translateZ(50px);
  transform-origin:center;
  transition:transform .45s ease;
}
.feature-hero-3d:hover .stage-card{transform:rotateY(-5deg) rotateX(1deg) translateZ(68px) translateY(-3px)}
.stage-card .feature-media{
  width:100%;
  height:100%;
  min-height:390px;
  border-radius:30px;
  overflow:hidden;
  position:relative;
  background-size:cover;
  background-position:center;
  border:1px solid rgba(255,255,255,.88);
  box-shadow:0 34px 70px rgba(30,61,72,.17),0 8px 24px rgba(31,62,73,.10);
}
.stage-vignette{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,17,23,.02),rgba(5,17,23,.18))}
.stage-brand{
  position:absolute;left:18px;top:18px;
  display:flex;align-items:center;gap:8px;
  padding:7px 10px;border-radius:999px;
  background:rgba(255,255,255,.76);
  border:1px solid rgba(255,255,255,.90);
  box-shadow:0 10px 28px rgba(22,55,67,.11);
  backdrop-filter:blur(14px)
}
.stage-brand span{display:grid;place-items:center;width:27px;height:27px;border-radius:50%;background:#0a171c;color:#fff;font-weight:900}
.stage-brand small{font:800 8px/1 Manrope,Arial,sans-serif;letter-spacing:.12em;color:#30474e}
.stage-label{
  position:absolute;right:18px;bottom:18px;
  padding:8px 11px;border-radius:999px;
  background:rgba(8,20,25,.68);color:#fff;
  font-size:10px;font-weight:800;backdrop-filter:blur(12px)
}
.stage-chip{
  position:absolute;
  z-index:8;
  display:grid;
  gap:4px;
  padding:12px 14px;
  border-radius:16px;
  background:linear-gradient(145deg,rgba(255,255,255,.86),rgba(255,255,255,.58));
  border:1px solid rgba(255,255,255,.96);
  box-shadow:0 16px 38px rgba(27,57,68,.13);
  backdrop-filter:blur(18px)
}
.stage-chip small{font:800 7px/1.2 Manrope,Arial,sans-serif;letter-spacing:.12em;color:#7f9096}
.stage-chip b{font-size:11px;color:#163038}
.stage-chip strong{font:800 20px/1 Manrope,Arial,sans-serif;color:#0b7e86}
.stage-chip span{font-size:9px;color:#71858c}
.chip-a{right:3%;top:24%;transform:translateZ(115px)}
.chip-b{left:4%;bottom:22%;transform:translateZ(100px)}
.brand-card{
  overflow:hidden;
  border-radius:30px;
  background:
    radial-gradient(circle at 82% 18%,rgba(57,202,211,.34),transparent 24%),
    radial-gradient(circle at 20% 80%,rgba(83,151,210,.22),transparent 28%),
    linear-gradient(145deg,#091a22,#12303b 52%,#0b1d25);
  border:1px solid rgba(255,255,255,.12);
  box-shadow:0 36px 72px rgba(22,52,63,.22);
  display:flex;
  flex-direction:column;
  justify-content:flex-end;
  padding:34px;
}
.brand-card:before{
  content:'';
  position:absolute;inset:0;
  background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);
  background-size:42px 42px
}
.brand-3d-word{
  position:relative;
  z-index:2;
  font-size:clamp(74px,8vw,120px);
  line-height:.78;
  letter-spacing:-7px;
  font-weight:900;
  color:white;
  text-shadow:0 14px 34px rgba(0,0,0,.24)
}
.brand-3d-sub{
  position:relative;z-index:2;
  font:800 24px/1 Manrope,Arial,sans-serif;
  letter-spacing:.34em;
  color:#72d7dd;
  margin-top:18px
}
.brand-3d-line{position:relative;z-index:2;width:82px;height:3px;border-radius:999px;background:linear-gradient(90deg,#6fe1df,#7ab8e9);margin-top:22px}
.brand-3d-caption{position:relative;z-index:2;margin-top:14px;font:700 8px/1.5 Manrope,Arial,sans-serif;letter-spacing:.16em;color:rgba(255,255,255,.52)}
@media(max-width:1120px){
  .feature-hero-3d{grid-template-columns:minmax(0,1fr) minmax(360px,.82fr);min-height:520px;padding:22px}
  .premium-stage{min-height:450px}.stage-card{min-height:350px}.stage-card .feature-media{min-height:350px}
}
@media(max-height:760px) and (min-width:721px){
  .home{padding-top:10px}
  .breaking-bar{margin-bottom:12px}
  .feature-hero-3d{min-height:430px;padding:18px 22px;grid-template-columns:minmax(0,1.08fr) minmax(320px,.80fr)}
  .feature-copy{padding:22px 28px}
  .feature-copy h1{font-size:clamp(38px,4.3vw,58px);margin:12px 0 10px;letter-spacing:-2.6px}
  .feature-copy p{font-size:13px;line-height:1.8}
  .feature-actions{margin-top:16px}.feature-meta{margin-top:16px;padding-top:12px}
  .premium-stage{min-height:390px}
  .stage-card{height:72%;min-height:300px;width:74%}
  .stage-card .feature-media{min-height:300px}
  .stage-sheet{height:68%;width:68%}
  .chip-a{top:20%;right:0}.chip-b{bottom:18%;left:0}
}
@media(max-width:720px){
  .feature-hero-3d{
    display:flex;
    flex-direction:column;
    min-height:auto;
    padding:14px;
    border-radius:26px;
  }
  .premium-stage{order:1;min-height:320px;width:100%}
  .feature-copy{order:2;padding:18px 8px 12px}
  .stage-card{width:80%;height:250px;min-height:250px;transform:rotateY(-4deg) rotateX(1deg) translateZ(24px)}
  .stage-card .feature-media{min-height:250px;border-radius:22px}
  .stage-sheet{width:70%;height:70%;border-radius:22px}.stage-back{transform:translate3d(-12px,10px,-70px) rotate(-6deg)}.stage-mid{transform:translate3d(10px,-2px,-36px) rotate(4deg)}
  .chip-a{right:1%;top:24%;padding:9px 11px}.chip-b{left:1%;bottom:20%;padding:9px 11px}
  .stage-chip strong{font-size:16px}
  .feature-copy h1{font-size:clamp(36px,10.5vw,50px);line-height:1.05;letter-spacing:-2.3px;margin:13px 0 10px}
  .feature-copy p{font-size:13px;line-height:1.85}
  .feature-actions{margin-top:16px}.feature-meta{margin-top:16px;padding-top:12px}
  .brand-card{padding:24px}.brand-3d-word{font-size:74px}.brand-3d-sub{font-size:18px}
}
@media(max-width:430px){
  .premium-stage{min-height:292px}
  .stage-card{width:82%;height:228px;min-height:228px}
  .stage-card .feature-media{min-height:228px}
  .feature-copy{padding-left:4px;padding-right:4px}
  .feature-copy h1{font-size:clamp(34px,10.2vw,46px)}
  .chip-a{right:-2px}.chip-b{left:-2px}
}

`;

function shell(title, body, extraHead='') {
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f4f8f7"><meta name="negahjavan-brand" content="wordmark-red-v2"><link rel="icon" href="/assets/negahjavan-mark-v1.svg" type="image/svg+xml"><link rel="preload" href="/assets/vazirmatn-v33.woff2" as="font" type="font/woff2" crossorigin><title>${esc(title)} | نگاه جوان</title><meta name="description" content="نگاه جوان؛ رسانه خبری برای روایت روشن و دقیق تحولات ایران و جهان"><style>@font-face{font-family:Vazirmatn;src:url(/assets/vazirmatn-v33.woff2) format('woff2');font-weight:100 900;font-display:swap}${css}${premiumTheme}${editionEditorStyles}</style>${extraHead}</head><body>${body}</body></html>`;
}

function header() {
  const nav = Object.entries(CATEGORY_LABELS).filter(([k])=>k!=='general').map(([k,v])=>`<a href="/category/${k}">${esc(v)}</a>`).join('');
  return `<header class="top"><div class="wrap top-inner"><div class="top-main"><a class="brand" href="/"><span class="mark">ن</span><span class="brand-copy"><b>نگاه جوان</b><small>NEGAAH JAVAN / NEWSROOM</small></span></a><div class="top-status"><span class="pulse"></span><span>به‌روز و زنده</span></div><span class="grow"></span><a class="editor-link" href="/editorial">ورود به تحریریه</a></div><nav class="nav" aria-label="دسته‌های خبر">${nav}</nav></div></header>`;
}

function footer() {
  return `<footer class="footer"><div class="wrap footer-row"><div><b style="color:#fff">نگاه جوان</b><div style="margin-top:7px">روایت روشنِ خبر برای نسل امروز</div></div><div>خبر، تحلیل و دیدگاه باید از یکدیگر تفکیک شوند.</div></div></footer>`;
}

function mediaBlock(a, cls='thumb') {
  const category = a?.category || 'general';
  if (a?.hero_image) return `<div class="${cls}" ${imgStyle(a.hero_image)}></div>`;
  const label = CATEGORY_LABELS[category] || 'خبر';
  const symbol = ({politics:'◆',incidents:'!',world:'◎',economy:'↗',society:'●',technology:'⌘',culture:'✦',sports:'★',general:'ن'})[category] || 'ن';
  const cover = `/cover/${encodeURIComponent(a?.slug || '')}.svg`;
  return `<div class="${cls} smart-cover cover-${esc(category)}" style="background-image:url('${cover}');background-size:cover;background-position:center"><span class="cover-mark"><span class="cover-symbol">${symbol}</span><span>کاور هوشمند نگاه جوان</span></span></div>`;
}

function renderBody(body='') {
  return String(body).split(/\n{2,}/).map(p=>p.trim()).filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join('');
}

function card(a) {
  return `<article class="card glass"><a href="/news/${encodeURIComponent(a.slug)}">${mediaBlock(a,'thumb')}<div class="card-body"><span class="tag">${esc(CATEGORY_LABELS[a.category] || 'خبر')}</span><h3>${esc(a.title)}</h3><div class="meta"><span>${esc(fmtDate(a.published_at))}</span><span>${Number(a.views||0).toLocaleString('en-US')} بازدید</span></div>${a.excerpt?`<p class="excerpt">${esc(a.excerpt)}</p>`:''}</div></a></article>`;
}

function mini(a) {
  return `<a class="mini glass" href="/news/${encodeURIComponent(a.slug)}">${mediaBlock(a,'mini-thumb')}<div><span class="tag">${esc(CATEGORY_LABELS[a.category] || 'خبر')}</span><h4>${esc(a.title)}</h4><div class="meta">${esc(fmtDate(a.published_at))}</div></div></a>`;
}

function section(title, slug, items, subtitle='') {
  const lead = items[0];
  const rest = items.slice(1,4);
  const content = items.length
    ? `<div class="category-layout">${lead?`<div class="category-lead">${card(lead)}</div>`:''}<div class="category-stack">${rest.map(mini).join('')}</div></div>`
    : `<div class="empty glass">هنوز خبری در این بخش منتشر نشده است.</div>`;
  return `<section class="section category-section"><div class="section-head"><div><div class="section-index">SECTION / ${String(Object.keys(CATEGORY_LABELS).indexOf(slug)+1).padStart(2,'0')}</div><div class="section-title">${esc(title)}</div>${subtitle?`<div class="section-sub">${esc(subtitle)}</div>`:''}</div><a class="section-more" href="/category/${slug}">همه خبرها <span>↗</span></a></div>${content}</section>`;
}

export function homePage(data) {
  const hero = data.hero;
  const latest = data.latest || [];
  const heroVisual = hero
    ? `<div class="premium-stage">
        <div class="stage-glow"></div>
        <div class="stage-sheet stage-back"></div>
        <div class="stage-sheet stage-mid"></div>
        <div class="stage-card">
          <div class="feature-media" ${hero.hero_image ? imgStyle(hero.hero_image) : `style="background-image:url('/cover/${encodeURIComponent(hero.slug)}.svg')"`}>
            <div class="stage-vignette"></div>
            <div class="stage-brand"><span>ن</span><small>NEGAAH JAVAN</small></div>
            <div class="stage-label">${esc(CATEGORY_LABELS[hero.category] || 'خبر')}</div>
          </div>
        </div>
        <div class="stage-chip chip-a"><small>TOP STORY</small><b>${esc(CATEGORY_LABELS[hero.category] || 'خبر')}</b></div>
        <div class="stage-chip chip-b"><strong>${readingMinutes(hero.body || '')}</strong><span>دقیقه مطالعه</span></div>
      </div>`
    : `<div class="premium-stage">
        <div class="stage-glow"></div>
        <div class="stage-sheet stage-back"></div>
        <div class="stage-sheet stage-mid"></div>
        <div class="stage-card brand-card">
          <div class="brand-3d-word">نگاه</div>
          <div class="brand-3d-sub">JAVAN</div>
          <div class="brand-3d-line"></div>
          <div class="brand-3d-caption">NEWS · EDITORIAL · CULTURE · FUTURE</div>
        </div>
        <div class="stage-chip chip-a"><small>PREMIUM NEWSROOM</small><b>نگاه جوان</b></div>
        <div class="stage-chip chip-b"><strong>24/7</strong><span>اتاق خبر</span></div>
      </div>`;

  const heroCopy = hero
    ? `<div class="feature-copy"><div class="feature-overline"><span>${hero.status==='breaking'?'BREAKING':'TOP STORY'}</span><b>${esc(CATEGORY_LABELS[hero.category] || 'خبر')}</b></div><h1>${esc(hero.title)}</h1><p>${esc(hero.excerpt || 'جزئیات کامل این خبر را در صفحه خبر بخوانید.')}</p><div class="feature-actions"><a class="btn btn-primary" href="/news/${encodeURIComponent(hero.slug)}">مطالعه کامل خبر</a><a class="btn btn-ghost" href="#latest">آخرین خبرها</a></div><div class="feature-meta"><span><b>${readingMinutes(hero.body || '')}</b> دقیقه مطالعه</span><span>${Number(hero.views||0).toLocaleString('fa-IR')} بازدید</span><span>نگاه جوان / تحریریه</span></div></div>`
    : `<div class="feature-copy"><div class="feature-overline"><span>FRONT PAGE</span><b>رسانه نسل امروز</b></div><h1>خبر را فقط نبین؛<br><em>زاویه‌اش را ببین.</em></h1><p>نگاه جوان برای خبرهای سیاسی، حوادث، اقتصاد، جامعه، فناوری، فرهنگ و ورزش؛ با روایت روشن و تجربه‌ای ساخته‌شده برای موبایل.</p><div class="feature-actions"><a class="btn btn-primary" href="/editorial">ورود به تحریریه</a><a class="btn btn-ghost" href="#latest">مشاهده خبرها</a></div><div class="feature-meta"><span><b>24/7</b> اتاق خبر</span><span>طراحی Editorial</span><span>Mobile First</span></div></div>`;

  const tickerItems = data.breaking.length
    ? data.breaking.map(a=>`<a href="/news/${encodeURIComponent(a.slug)}">${esc(a.title)}</a>`).join('')
    : `<span>برای نمایش نوار فوری، یک خبر را با وضعیت «فوری» منتشر کنید.</span>`;

  const latestPrimary = latest[0];
  const latestSecondary = latest.slice(1,5);
  const latestMarkup = latest.length
    ? `<div class="latest-layout">${latestPrimary?`<div class="latest-lead">${card(latestPrimary)}</div>`:''}<div class="latest-stack">${latestSecondary.map(mini).join('')}</div></div>`
    : `<div class="empty glass">هنوز خبری منتشر نشده است.</div>`;

  const quick = latest.slice(5,9);
  const quickMarkup = quick.length
    ? `<div class="quick-strip">${quick.map((a,i)=>`<a class="quick-story" href="/news/${encodeURIComponent(a.slug)}"><span class="quick-no">0${i+1}</span><div><small>${esc(CATEGORY_LABELS[a.category]||'خبر')}</small><h4>${esc(a.title)}</h4></div><span class="quick-arrow">↗</span></a>`).join('')}</div>`
    : '';

  const setup = !data.configured ? `<div class="notice">D1 هنوز متصل نشده است. Binding دیتابیس باید با نام <b>DB</b> تنظیم شود.</div>` : '';
  const sectionDefs=[
    ['سیاست','politics','قدرت، دولت و تصمیم‌های اثرگذار'],
    ['حوادث','incidents','روایت دقیق حوادث و رویدادهای مهم'],
    ['بین‌الملل','world','تحولات جهان و منطقه'],
    ['اقتصاد','economy','بازار، انرژی و اقتصاد'],
    ['جامعه','society','زندگی اجتماعی و مسائل روز'],
    ['فناوری','technology','دیجیتال، نوآوری و آینده'],
    ['فرهنگ','culture','هنر، رسانه و فرهنگ'],
    ['ورزش','sports','مسابقات و چهره‌های ورزشی']
  ];

  return shell('صفحه اصلی', `${header()}<main class="wrap home"><div class="breaking-bar"><div class="breaking-label"><span></span>فوری</div><div class="breaking-track">${tickerItems}</div><div class="breaking-code">NJ / LIVE</div></div>${setup}<section class="feature-hero feature-hero-3d glass"><div class="hero-ambient hero-ambient-a"></div><div class="hero-ambient hero-ambient-b"></div>${heroCopy}${heroVisual}<div class="feature-rule"></div><div class="feature-issue">ISSUE 01<br><span>NEGAAH JAVAN</span></div></section>${quickMarkup}<section id="latest" class="section latest-section"><div class="section-head"><div><div class="section-index">LATEST / NOW</div><div class="section-title">آخرین خبرها</div><div class="section-sub">منتخب تازه‌ترین خروجی تحریریه</div></div><form class="searchbar" action="/search"><input name="q" placeholder="جست‌وجو در نگاه جوان"><button class="btn btn-ghost">جست‌وجو</button></form></div>${latestMarkup}</section>${sectionDefs.map(([t,k,sub])=>section(t,k,data.sections?.[k]||[],sub)).join('')}</main>${footer()}`);
}

export function articlePage(a) {
  if (!a) return notFoundPage();
  const source = a.source_name || a.source_url ? `<div class="source"><b>منبع:</b> ${a.source_url?`<a href="${esc(a.source_url)}" rel="noopener noreferrer">${esc(a.source_name || a.source_url)}</a>`:esc(a.source_name)}</div>` : '';
  const mins = readingMinutes(a.body);
  return shell(a.title, `${header()}<main class="wrap"><div class="article-wrap"><article class="article glass"><div class="kicker">${esc(CATEGORY_LABELS[a.category] || 'خبر')}</div><h1>${esc(a.title)}</h1><div class="meta"><span>${esc(fmtDate(a.published_at))}</span><span>${Number(a.views||0).toLocaleString('en-US')} بازدید</span><span class="reading">${mins} دقیقه مطالعه</span></div>${a.excerpt?`<p class="excerpt" style="font-size:18px">${esc(a.excerpt)}</p>`:''}${mediaBlock(a,'article-cover')}<div class="article-body">${renderBody(a.body)}</div>${source}</article><aside class="article-aside glass"><div class="kicker">NEGAAH JAVAN</div><h3>خلاصه خبر</h3><p class="excerpt">${esc(a.excerpt || 'خلاصه این خبر توسط تحریریه تنظیم نشده است.')}</p><div class="form-divider"></div><div class="meta"><span>دسته: ${esc(CATEGORY_LABELS[a.category]||'خبر')}</span></div><div class="actions"><a class="btn btn-soft" href="/">صفحه اصلی</a><a class="btn btn-soft" href="/category/${esc(a.category)}">اخبار مرتبط</a></div></aside></div></main>${footer()}`);
}

export function listingPage(title, items, query='') {
  return shell(title, `${header()}<main class="wrap"><section class="section"><div class="section-head"><div><div class="section-title">${esc(title)}</div>${query?`<div class="section-sub">نتایج برای «${esc(query)}»</div>`:''}</div></div>${items.length?`<div class="grid">${items.map(card).join('')}</div>`:`<div class="empty glass">نتیجه‌ای پیدا نشد.</div>`}</section></main>${footer()}`);
}

export function notFoundPage() {
  return shell('یافت نشد', `${header()}<main class="wrap"><div class="empty glass" style="margin-top:40px"><h1 style="font-size:42px">۴۰۴</h1><p>صفحه موردنظر پیدا نشد.</p><a class="btn btn-primary" href="/">بازگشت به صفحه اصلی</a></div></main>${footer()}`);
}

export function editorialPage() {
  const editorJs = `
const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let editing=null;let allRows=[];
const labels={politics:'سیاسی',incidents:'حوادث',world:'بین‌الملل',economy:'اقتصاد',society:'جامعه',technology:'فناوری',culture:'فرهنگ',sports:'ورزش',general:'عمومی'};
const keywords={politics:['مجلس','دولت','وزیر','انتخابات','سیاست','تحریم'],incidents:['حادثه','آتش','زلزله','سیل','تصادف','قتل','پلیس'],world:['جهان','آمریکا','اروپا','روسیه','چین','غزه','اوکراین'],economy:['اقتصاد','دلار','طلا','بورس','تورم','بانک','نفت','ارز'],society:['جامعه','آموزش','دانشگاه','سلامت','جوانان','اشتغال'],technology:['فناوری','هوش مصنوعی','اینترنت','موبایل','دیجیتال','سایبری'],culture:['فرهنگ','سینما','موسیقی','کتاب','هنر','رسانه'],sports:['ورزش','فوتبال','والیبال','بسکتبال','لیگ','قهرمانی']};
async function api(url,opt={}){const r=await fetch(url,{headers:{'Content-Type':'application/json',...(opt.headers||{})},...opt});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'خطای سرور');return j}
function norm(v=''){const NL=String.fromCharCode(10);let x=String(v).replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/ـ/g,'').replace(/[ ]+/g,' ').replace(/ *([،؛:؟!]) */g,'$1 ').trim();return x.split(NL).map(z=>z.trim()).join(NL)}
function bodyFix(v=''){const NL=String.fromCharCode(10);return norm(v).split(NL+NL).map(p=>p.split(NL).join(' ').trim()).filter(Boolean).join(NL+NL)}
function titleFix(v=''){return norm(v).replace(/[.!؟!،؛:…]+$/g,'').slice(0,160)}
function excerptOf(v='',max=190){const c=bodyFix(v).split(String.fromCharCode(10)).join(' ').replace(/[ ]+/g,' ').trim();if(!c)return '';let out='';for(const x of (c.match(/[^.!؟!…]+[.!؟!…]?/g)||[c])){const n=(out?out+' ':'')+x.trim();if(n.length>max)break;out=n;if(out.length>=90)break}if(!out)out=c.slice(0,max);if(out.length<c.length&&!/[.!؟!…]$/.test(out)){const cut=out.lastIndexOf(' ');out=(cut>40?out.slice(0,cut):out)+'…'}return out}
function infer(t,b){const h=norm(t+' '+b).toLowerCase();let best='general',score=0;for(const [k,ws] of Object.entries(keywords)){let s=0;for(const w of ws)if(h.includes(w.toLowerCase()))s++;if(s>score){best=k;score=s}}return best}
function hscore(t){t=titleFix(t);let n=35;if(t.length>=35&&t.length<=95)n+=30;else if(t.length>=20&&t.length<=120)n+=15;if(/[0-9۰-۹]/.test(t))n+=8;if(!/[!]{2,}/.test(t))n+=12;if(!/(شوک|باور نکردنی|فوری فوری)/.test(t))n+=15;return Math.max(0,Math.min(100,n))}
async function smartFix(){try{const data=await api('/api/admin/smart-preview',{method:'POST',body:JSON.stringify({title:$('#title').value,body:$('#body').value,excerpt:$('#excerpt').value,category:$('#category').value,hero_image:$('#hero_image').value,source_name:$('#source_name').value,source_url:$('#source_url').value})});const p=data.prepared||data;$('#title').value=p.title||titleFix($('#title').value);$('#body').value=p.body||bodyFix($('#body').value);$('#excerpt').value=p.excerpt||excerptOf($('#body').value);if(p.category)$('#category').value=p.category;$('#smartMsg').textContent='متن، خلاصه و دسته‌بندی با موتور هوشمند تحریریه بررسی شد.'}catch(e){const t=titleFix($('#title').value),b=bodyFix($('#body').value);$('#title').value=t;$('#body').value=b;if(!$('#excerpt').value.trim())$('#excerpt').value=excerptOf(b);if($('#category').value==='general')$('#category').value=infer(t,b);$('#smartMsg').textContent='اصلاح محلی انجام شد.'}updateInsights();updatePreview()}
function generateExcerpt(){$('#excerpt').value=excerptOf($('#body').value);updatePreview()}
function suggestCategory(){const c=infer($('#title').value,$('#body').value);$('#category').value=c;$('#smartMsg').textContent='دسته پیشنهادی: '+(labels[c]||'عمومی');updatePreview()}
function updateInsights(){const body=$('#body').value.trim();const words=body?body.split(String.fromCharCode(10)).join(' ').split(' ').filter(Boolean).length:0;$('#wordCount').textContent=words;$('#readTime').textContent=Math.max(1,Math.ceil(words/190));$('#titleScore').textContent=hscore($('#title').value);$('#titleLength').textContent=$('#title').value.length;$('#smartMsg').textContent=words<60&&words>0?'متن کوتاه است؛ برای خبر کامل جزئیات بیشتری اضافه کنید.':words>0?'ساختار متن آماده انتشار است.':'متن خبر را وارد کنید.'}
function coverPreview(){const url=$('#hero_image').value.trim(),cat=$('#category').value||'general',label=labels[cat]||'خبر';return url?'<div class="preview-media" style="background-size:cover;background-position:center;background-image:linear-gradient(180deg,transparent,rgba(0,0,0,.58)),url('+encodeURI(url)+')"></div>':'<div class="preview-media smart-cover cover-'+esc(cat)+'"><span class="cover-category">'+esc(label)+'</span><span class="cover-mark"><span class="cover-symbol">ن</span><span>تصویر هوشمند خودکار</span></span></div>'}
function updatePreview(){const title=$('#title').value||'عنوان خبر شما',ex=$('#excerpt').value||excerptOf($('#body').value)||'خلاصه خبر به‌صورت خودکار اینجا نمایش داده می‌شود.';$('#preview').innerHTML=coverPreview()+'<div class="preview-copy"><span class="tag">'+esc(labels[$('#category').value]||'خبر')+'</span><h4>'+esc(title)+'</h4><p>'+esc(ex)+'</p></div>'}
async function boot(){try{const d=await api('/api/admin/bootstrap');if(!d.authenticated){$('#login').style.display='block';$('#dash').style.display='none';if(!d.authConfigured)$('#loginError').textContent='ابتدا Secrets تحریریه را در Cloudflare تنظیم کنید.';return}$('#login').style.display='none';$('#dash').style.display='block';render(d);updateInsights();updatePreview()}catch(e){$('#loginError').textContent=e.message}}
function render(d){const s=d.stats||{};$('#stats').innerHTML=[['کل خبرها',s.total??0],['منتشرشده',s.published??0],['پیش‌نویس',s.drafts??0],['فوری',s.breaking??0],['بازدید',s.views??0]].map(x=>'<div class="stat glass"><b>'+String(x[1])+'</b><span>'+x[0]+'</span></div>').join('');allRows=d.articles||[];renderList(allRows);renderEdition(d.edition||{})}
function renderList(rows){$('#list').innerHTML=rows.length?rows.map(a=>'<div class="article-row"><div><div class="article-row-title">'+esc(a.title)+'</div><div class="meta"><span class="status '+esc(a.status)+'">'+({draft:'پیش‌نویس',published:'منتشرشده',breaking:'فوری'}[a.status]||a.status)+'</span><span>'+esc(labels[a.category]||a.category)+'</span><span>'+esc(a.published_at||a.created_at)+'</span>'+(a.hero_image?'':'<span class="auto-badge">◈ تصویر خودکار</span>')+'</div></div><div class="row-actions"><button class="tiny" data-edit="'+a.id+'">ویرایش</button><button class="tiny danger" data-del="'+a.id+'">حذف</button></div></div>').join(''):'<div class="empty">هنوز خبری ثبت نشده است.</div>';$$('[data-edit]').forEach(b=>b.onclick=()=>edit(Number(b.dataset.edit)));$$('[data-del]').forEach(b=>b.onclick=()=>removeArticle(Number(b.dataset.del)))}
function edit(id){const a=allRows.find(x=>Number(x.id)===id);if(!a)return;editing=id;for(const k of ['title','slug','excerpt','body','category','status','hero_image','author_name','format','source_name','source_url'])if($('#'+k))$('#'+k).value=a[k]||'';$('#format').value=a.format||'news';$('#formTitle').textContent='ویرایش خبر';$('#save').textContent='ذخیره تغییرات';updateInsights();updatePreview();scrollTo({top:0,behavior:'smooth'})}
function resetForm(){editing=null;$('#articleForm').reset();$('#category').value='general';$('#formTitle').textContent='خبر جدید';$('#save').textContent='ثبت خبر';$('#formError').textContent='';updateInsights();updatePreview()}
async function removeArticle(id){if(!confirm('این خبر حذف شود؟'))return;try{await api('/api/admin/articles/'+id,{method:'DELETE'});await boot()}catch(e){alert(e.message)}}
$('#loginForm').onsubmit=async e=>{e.preventDefault();$('#loginError').textContent='';try{await api('/api/auth/login',{method:'POST',body:JSON.stringify({password:$('#password').value})});$('#password').value='';await boot()}catch(e){$('#loginError').textContent=e.message}};
$('#logout').onclick=async()=>{await api('/api/auth/logout',{method:'POST',body:'{}'}).catch(()=>{});location.reload()};
$('#articleForm').onsubmit=async e=>{e.preventDefault();await smartFix();const f=new FormData(e.target);const body=Object.fromEntries(f.entries());try{$('#save').disabled=true;$('#save').textContent='در حال ذخیره…';await api(editing?'/api/admin/articles/'+editing:'/api/admin/articles',{method:editing?'PUT':'POST',body:JSON.stringify(body)});resetForm();await boot()}catch(e){$('#formError').textContent=e.message}finally{$('#save').disabled=false;$('#save').textContent=editing?'ذخیره تغییرات':'ثبت خبر'}};
$('#cancelEdit').onclick=resetForm;$('#smartFix').onclick=smartFix;$('#makeExcerpt').onclick=generateExcerpt;$('#suggestCategory').onclick=suggestCategory;$('#adminSearch').oninput=e=>{const q=norm(e.target.value).toLowerCase();renderList(!q?allRows:allRows.filter(a=>(a.title+' '+a.excerpt+' '+a.category).toLowerCase().includes(q)))};
for(const id of ['title','excerpt','body','category','hero_image'])$('#'+id).addEventListener('input',()=>{updateInsights();updatePreview()});
${editionEditorScript}
boot();`;
  const options = Object.entries(CATEGORY_LABELS).map(([k,v])=>`<option value="${k}">${esc(v)}</option>`).join('');
  return shell('تحریریه', `<main class="editor-shell"><section id="login" class="login glass" style="display:none"><a class="brand editor-brand" style="margin-bottom:18px" href="/" aria-label="نگاه جوان، صفحه اصلی">${brandWordmark()}<span>تحریریه</span></a><h1>ورود امن</h1><p class="excerpt">مدیریت حرفه‌ای خبر، خلاصه هوشمند و تصویر خودکار.</p><form id="loginForm"><div class="field"><label>رمز عبور تحریریه</label><input id="password" type="password" autocomplete="current-password" required></div><div id="loginError" class="error"></div><button class="btn btn-primary" style="width:100%">ورود</button></form><div style="margin-top:18px"><a class="section-sub" href="/">← بازگشت به سایت</a></div></section><section id="dash" style="display:none"><div class="dash-top glass"><div class="dash-top-row"><div><a class="brand editor-brand" href="/" aria-label="نگاه جوان، صفحه اصلی">${brandWordmark()}<span>تحریریه</span></a><h1 style="font-size:34px;margin:10px 0 4px">اتاق خبر هوشمند</h1><div class="dash-note">متن فارسی را پاکسازی می‌کند، خلاصه می‌سازد، دسته را پیشنهاد می‌دهد و اگر عکس نداشته باشید یک کاور حرفه‌ای خودکار نمایش می‌دهد.</div></div><div class="actions"><a class="btn btn-soft" href="/">مشاهده سایت</a><button id="logout" class="btn btn-soft">خروج</button></div></div></div><div id="stats" class="stats"></div>${editionPanel()}<div class="dash-grid"><section class="panel glass composer"><div class="section-head"><div><div class="kicker">SMART COMPOSER</div><h2 id="formTitle" style="margin:4px 0">خبر جدید</h2></div><span class="auto-badge">◈ هوشمند</span></div><div class="smartbar"><button id="smartFix" class="smart-action" type="button">اصلاح هوشمند متن</button><button id="makeExcerpt" class="smart-action" type="button">ساخت خلاصه</button><button id="suggestCategory" class="smart-action" type="button">تشخیص هوشمند</button></div><div class="insights"><div class="insight"><b id="wordCount">0</b><span>کلمه</span></div><div class="insight"><b id="readTime">1</b><span>دقیقه مطالعه</span></div><div class="insight"><b id="titleScore">0</b><span>امتیاز تیتر</span></div><div class="insight"><b id="titleLength">0</b><span>طول تیتر</span></div></div><div id="smartMsg" class="helper">متن خبر را وارد کنید.</div><form id="articleForm"><div class="field"><label>عنوان</label><input id="title" name="title" required placeholder="تیتر دقیق و خبری"></div><div class="field"><label>اسلاگ (اختیاری)</label><input id="slug" name="slug" placeholder="در صورت خالی بودن خودکار ساخته می‌شود"></div><div class="field"><label>خلاصه</label><textarea id="excerpt" name="excerpt" style="min-height:92px" placeholder="اگر خالی بگذارید، به‌طور خودکار از متن ساخته می‌شود"></textarea></div><div class="field"><label>متن خبر</label><textarea id="body" name="body" required placeholder="متن را وارد کنید؛ فاصله‌ها، نشانه‌گذاری و پاراگراف‌ها هنگام ذخیره اصلاح می‌شوند"></textarea></div><div class="field"><label>دسته</label><select id="category" name="category"><option value="general">تشخیص خودکار</option>${options.replace('<option value="general">عمومی</option>','')}</select></div><div class="field"><label>وضعیت انتشار</label><select id="status" name="status"><option value="draft">پیش‌نویس</option><option value="published">منتشرشده</option><option value="breaking">فوری</option></select></div><div class="form-divider"></div><div class="field"><label>تصویر شاخص (اختیاری)</label><input id="hero_image" name="hero_image" type="url" placeholder="https://..."><div class="helper">خالی بگذارید تا نگاه جوان بر اساس دسته، کاور گرافیکی هوشمند بسازد. بعداً می‌توانیم کتابخانه Arvan را مستقیم وصل کنیم.</div></div><div id="preview" class="preview-card"></div><div class="field"><label for="format">نوع روایت</label><select id="format" name="format"><option value="news">خبر</option><option value="analysis">تحلیل</option><option value="report">گزارش</option></select></div><div class="field"><label for="author_name">نام نویسنده (اختیاری)</label><input id="author_name" name="author_name" maxlength="120" placeholder="نام نویسنده یا خبرنگار"></div><div class="field"><label>نام منبع</label><input id="source_name" name="source_name"></div><div class="field"><label>لینک منبع</label><input id="source_url" name="source_url" type="url" placeholder="https://..."></div><div id="formError" class="error"></div><div class="actions"><button id="save" class="btn btn-primary">ثبت خبر</button><button id="cancelEdit" class="btn btn-soft" type="button">فرم جدید</button></div></form></section><section class="panel glass"><div class="section-head"><div><div class="kicker">EDITORIAL DESK</div><h2 style="margin:4px 0">خبرهای تحریریه</h2><div class="section-sub">پیش‌نویس، انتشار و خبر فوری</div></div></div><div class="editor-list-tools"><input id="adminSearch" placeholder="جست‌وجو در خبرهای تحریریه…"></div><div id="list"></div></section></div></section></main><script>${editorJs}</script>`);
}
