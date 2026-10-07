export const premiumTheme = `
/* NegahJavan Premium Editorial System — rebuilt 2026 */
:root{
  --nj-bg:#f2f1ed;
  --nj-paper:#faf9f6;
  --nj-glass:rgba(255,255,255,.72);
  --nj-glass-strong:rgba(255,255,255,.9);
  --nj-ink:#101718;
  --nj-ink-2:#26383b;
  --nj-muted:#738084;
  --nj-line:rgba(16,23,24,.10);
  --nj-cyan:#2bbfc4;
  --nj-cyan-deep:#0b7e84;
  --nj-blue:#6ea5d4;
  --nj-red:#e64c61;
  --nj-shadow:0 24px 70px rgba(28,40,43,.10);
  --nj-shadow-soft:0 12px 36px rgba(28,40,43,.07);
}
html{background:var(--nj-bg)}
body{
  margin:0;
  color:var(--nj-ink);
  background:
    radial-gradient(circle at 10% -4%,rgba(86,204,209,.16),transparent 24%),
    radial-gradient(circle at 88% 8%,rgba(110,165,212,.13),transparent 22%),
    linear-gradient(180deg,#f7f7f3 0%,#efefeb 46%,#f6f5f1 100%);
  font-family:"Vazirmatn",Tahoma,Arial,sans-serif;
  letter-spacing:-.014em;
}
body:before{
  content:"";
  position:fixed;
  inset:0;
  pointer-events:none;
  opacity:.18;
  background-image:
    linear-gradient(rgba(16,23,24,.045) 1px,transparent 1px),
    linear-gradient(90deg,rgba(16,23,24,.035) 1px,transparent 1px);
  background-size:64px 64px;
  mask-image:linear-gradient(to bottom,#000,transparent 70%);
}
.wrap{width:min(1320px,calc(100% - 44px));margin-inline:auto}
.glass{
  background:linear-gradient(145deg,rgba(255,255,255,.86),rgba(255,255,255,.56));
  border:1px solid rgba(255,255,255,.96);
  box-shadow:var(--nj-shadow),inset 0 1px 0 rgba(255,255,255,.98);
  backdrop-filter:blur(26px) saturate(125%);
  -webkit-backdrop-filter:blur(26px) saturate(125%);
}

/* Masthead */
.top{
  position:sticky;
  top:0;
  z-index:80;
  background:rgba(248,248,245,.86);
  border-bottom:1px solid var(--nj-line);
  box-shadow:none;
  backdrop-filter:blur(22px) saturate(120%);
  -webkit-backdrop-filter:blur(22px) saturate(120%);
}
.top-inner{height:auto!important;padding:9px 0 7px;display:block!important}
.top-main{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px;min-height:54px}
.brand{justify-self:end;display:flex;align-items:center;gap:11px;color:var(--nj-ink)}
.mark{
  width:40px;height:40px;border-radius:50%;
  display:grid;place-items:center;
  background:#111b1e;color:#fff;
  border:0;box-shadow:0 10px 26px rgba(15,27,31,.12);
  font-size:21px;font-weight:900;
}
.brand-copy{display:grid;line-height:1}
.brand-copy b{font-size:21px;font-weight:900;letter-spacing:-1px}
.brand-copy small{margin-top:5px;font:800 8px/1.2 "Manrope",Arial,sans-serif;letter-spacing:.14em;color:#8a9699}
.top-status{justify-self:center;display:flex;align-items:center;gap:8px;color:#6f8084;font-size:10px}
.top-status .pulse{width:7px;height:7px;background:#22b49e;box-shadow:0 0 0 6px rgba(34,180,158,.08)}
.editor-link{
  justify-self:start;
  padding:10px 15px;border-radius:999px;
  background:#111b1e;color:#fff;border:0;
  font-size:11px;font-weight:850;
  box-shadow:none;
}
.nav{
  display:flex!important;
  justify-content:center;
  align-items:center;
  gap:2px;
  overflow:auto;
  scrollbar-width:none;
  padding:7px 0 1px;
  border-top:1px solid rgba(16,23,24,.055);
  color:#536568;
}
.nav::-webkit-scrollbar{display:none}
.nav a{flex:0 0 auto;padding:7px 11px;border-radius:999px;font-size:11px;font-weight:800}
.nav a:hover{background:#fff;color:#111b1e;box-shadow:0 8px 20px rgba(28,40,43,.07)}

/* Breaking bar */
.mast{display:none}
.breaking-bar{
  display:grid;
  grid-template-columns:auto minmax(0,1fr) auto;
  align-items:center;
  min-height:44px;
  margin:16px 0 16px;
  border-top:1px solid var(--nj-line);
  border-bottom:1px solid var(--nj-line);
  color:#43565a;
}
.breaking-label{display:flex;align-items:center;gap:8px;padding-inline-start:2px;padding-inline-end:15px;font-size:10px;font-weight:900;color:#b92c41}
.breaking-label span{width:7px;height:7px;border-radius:50%;background:var(--nj-red)}
.breaking-track{display:flex;gap:30px;overflow:auto;scrollbar-width:none;padding:0 18px;font-size:11px}
.breaking-track::-webkit-scrollbar{display:none}
.breaking-track a{white-space:nowrap;font-weight:700}
.breaking-code{font:800 8px/1 "Manrope",Arial,sans-serif;letter-spacing:.14em;color:#9aa4a7}

/* Hero: editorial + 3D, but never oversized */
.feature-hero,
.feature-hero-3d{
  position:relative;
  isolation:isolate;
  overflow:hidden;
  display:grid!important;
  grid-template-columns:minmax(0,1.08fr) minmax(380px,.92fr)!important;
  min-height:500px!important;
  border-radius:34px!important;
  padding:26px!important;
  background:
    radial-gradient(circle at 77% 14%,rgba(67,195,201,.16),transparent 24%),
    radial-gradient(circle at 95% 82%,rgba(92,151,209,.12),transparent 26%),
    linear-gradient(145deg,rgba(255,255,255,.92),rgba(241,246,244,.76))!important;
}
.hero-ambient,.feature-rule,.feature-issue{display:none!important}
.feature-copy{
  direction:rtl;
  align-self:center;
  max-width:none!important;
  min-height:auto!important;
  padding:clamp(30px,4.5vw,62px)!important;
  margin:0!important;
  position:relative;
  z-index:6;
}
.feature-overline{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.feature-overline span{
  padding:7px 10px;border-radius:999px;
  background:#111b1e!important;color:#fff!important;
  font:800 8px/1 "Manrope",Arial,sans-serif!important;
  letter-spacing:.13em;
}
.feature-overline b{
  padding:7px 10px;border-radius:999px;
  background:#eaf6f5!important;
  border:1px solid rgba(43,191,196,.12);
  color:#0b7e84!important;
  font-size:10px;
}
.feature-copy h1{
  max-width:720px;
  margin:18px 0 14px!important;
  color:#0f1719!important;
  font-size:clamp(46px,5vw,76px)!important;
  line-height:1.02!important;
  letter-spacing:-3.7px!important;
  font-weight:900!important;
  text-wrap:balance;
  text-shadow:none!important;
}
.feature-copy h1 em{
  font-style:normal;
  background:linear-gradient(90deg,#0b7e84,#2eb9bf 58%,#4e94bc);
  -webkit-background-clip:text;background-clip:text;color:transparent!important;
}
.feature-copy p{
  max-width:610px!important;
  margin:0!important;
  color:#53666a!important;
  font-size:clamp(14px,1.4vw,17px)!important;
  line-height:1.95!important;
}
.feature-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:22px!important}
.btn{border-radius:999px!important;font-weight:850}
.btn-primary{
  background:#111b1e!important;
  color:#fff!important;
  box-shadow:none!important;
  min-height:43px;padding:0 17px!important;
}
.btn-ghost,.btn-soft{
  background:rgba(255,255,255,.72)!important;
  color:#263a3f!important;
  border:1px solid var(--nj-line)!important;
  min-height:43px;padding:0 17px!important;
}
.feature-meta{
  display:flex!important;gap:16px!important;flex-wrap:wrap;
  margin-top:22px!important;padding-top:15px!important;
  border-top:1px solid var(--nj-line)!important;
  max-width:610px;
  color:#829095!important;font-size:9px!important;
}
.feature-meta b{font:800 13px/1 "Manrope",Arial,sans-serif!important;color:#18383d!important}

/* Visual stage */
.premium-stage{
  min-height:448px!important;
  position:relative;
  display:grid!important;
  place-items:center;
  overflow:visible!important;
  perspective:1200px;
  transform-style:preserve-3d;
}
.stage-glow{
  position:absolute;
  width:74%;aspect-ratio:1;border-radius:50%;
  right:8%;top:4%;
  background:radial-gradient(circle,rgba(59,192,199,.22),rgba(59,192,199,0) 70%)!important;
  filter:blur(2px);
}
.stage-sheet{
  position:absolute!important;
  width:68%!important;height:69%!important;
  border-radius:26px!important;
  border:1px solid rgba(255,255,255,.92)!important;
  background:linear-gradient(145deg,rgba(255,255,255,.58),rgba(218,232,233,.18))!important;
  box-shadow:0 24px 56px rgba(33,55,60,.08)!important;
  backdrop-filter:blur(15px);
}
.stage-back{transform:translate3d(-22px,14px,-100px) rotate(-6deg)!important}
.stage-mid{transform:translate3d(18px,-7px,-42px) rotate(4deg)!important;opacity:.76}
.stage-card{
  width:75%!important;height:70%!important;min-height:330px!important;
  position:relative!important;z-index:5!important;
  transform:rotateY(-7deg) rotateX(2deg) translateZ(42px)!important;
  transition:transform .42s ease;
}
.feature-hero-3d:hover .stage-card{transform:rotateY(-4deg) rotateX(1deg) translateZ(58px) translateY(-3px)!important}
.stage-card .feature-media,
.brand-card{
  width:100%!important;height:100%!important;min-height:330px!important;
  border-radius:27px!important;
  overflow:hidden;
  background-size:cover!important;background-position:center!important;
  border:1px solid rgba(255,255,255,.82)!important;
  box-shadow:0 30px 66px rgba(27,52,59,.18),0 8px 20px rgba(27,52,59,.08)!important;
}
.stage-vignette{position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,17,21,.01),rgba(7,17,21,.20))}
.stage-brand{
  position:absolute;left:16px;top:16px;
  display:flex;align-items:center;gap:8px;
  padding:7px 9px;border-radius:999px;
  background:rgba(255,255,255,.80)!important;
  border:1px solid rgba(255,255,255,.92);
  backdrop-filter:blur(12px);
}
.stage-brand span{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:#111b1e;color:#fff;font-weight:900}
.stage-brand small{font:800 7px/1 "Manrope",Arial;letter-spacing:.12em;color:#304448}
.stage-label{position:absolute;right:16px;bottom:16px;padding:7px 10px;border-radius:999px;background:rgba(8,20,23,.68);color:#fff;font-size:9px;font-weight:800}
.stage-chip{
  position:absolute!important;z-index:9!important;
  padding:10px 12px!important;border-radius:14px!important;
  background:linear-gradient(145deg,rgba(255,255,255,.88),rgba(255,255,255,.62))!important;
  border:1px solid rgba(255,255,255,.96)!important;
  box-shadow:0 14px 32px rgba(29,54,61,.11)!important;
  backdrop-filter:blur(16px)!important;
}
.stage-chip small{font:800 7px/1.2 "Manrope",Arial;letter-spacing:.12em;color:#819095}
.stage-chip b{font-size:10px;color:#173238}
.stage-chip strong{font:800 18px/1 "Manrope",Arial;color:#0c7c82}
.stage-chip span{font-size:8px;color:#73848a}
.chip-a{right:3%!important;top:24%!important}
.chip-b{left:3%!important;bottom:22%!important}
.brand-card{
  background:
    radial-gradient(circle at 82% 18%,rgba(65,200,207,.30),transparent 24%),
    radial-gradient(circle at 18% 84%,rgba(89,144,205,.20),transparent 28%),
    linear-gradient(145deg,#0a1b22,#12313a 55%,#0b2028)!important;
  padding:28px!important;
  display:flex!important;
  flex-direction:column!important;
  justify-content:flex-end!important;
}
.brand-card:before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:40px 40px}
.brand-3d-word{position:relative;z-index:2;font-size:clamp(68px,7vw,105px)!important;line-height:.78!important;letter-spacing:-6px!important;font-weight:900!important;color:#fff!important}
.brand-3d-sub{position:relative;z-index:2;margin-top:15px!important;font:800 20px/1 "Manrope",Arial!important;letter-spacing:.32em!important;color:#70d3d6!important}
.brand-3d-line{position:relative;z-index:2;width:76px!important;height:3px!important;border-radius:999px;background:linear-gradient(90deg,#70d9d9,#79aee1)!important;margin-top:18px!important}
.brand-3d-caption{position:relative;z-index:2;margin-top:12px!important;font:700 7px/1.4 "Manrope",Arial!important;letter-spacing:.15em!important;color:rgba(255,255,255,.52)!important}

/* Quick strip + editorial hierarchy */
.quick-strip{
  display:grid!important;
  grid-template-columns:repeat(4,1fr)!important;
  margin-top:18px!important;
  border-top:1px solid var(--nj-line)!important;
  border-bottom:1px solid var(--nj-line)!important;
}
.quick-story{
  min-height:104px!important;
  display:grid!important;
  grid-template-columns:auto 1fr auto!important;
  gap:11px!important;
  align-items:center!important;
  padding:16px 14px!important;
  border-left:1px solid var(--nj-line)!important;
  background:transparent!important;
}
.quick-story:last-child{border-left:0!important}
.quick-no{font:800 16px/1 "Manrope",Arial!important;color:#aab4b7!important}
.quick-story small{font-size:8px!important;color:#0c7e84!important}
.quick-story h4{font-size:13px!important;line-height:1.55!important;margin:4px 0 0!important;color:#1b3035!important}
.quick-arrow{color:#0c858b!important}

/* Sections */
.section{margin-top:66px!important}
.section-head{
  display:flex!important;align-items:flex-end!important;justify-content:space-between!important;gap:16px!important;
  margin-bottom:20px!important;padding-bottom:14px!important;
  border-bottom:1px solid var(--nj-line)!important;
}
.section-head:after{display:none!important}
.section-index{font:800 8px/1 "Manrope",Arial!important;letter-spacing:.14em!important;color:#89969a!important;margin-bottom:7px!important}
.section-title{font-size:clamp(29px,2.8vw,40px)!important;line-height:1.08!important;font-weight:900!important;letter-spacing:-1.6px!important;color:#101718!important}
.section-sub{font-size:10px!important;color:#78888c!important;margin-top:4px!important}
.section-more{font-size:9px!important;font-weight:800!important;color:#2b4247!important;display:flex!important;align-items:center!important;gap:7px!important}
.searchbar{display:flex;gap:7px}.searchbar input{min-width:210px;padding:9px 13px;border-radius:999px!important;background:rgba(255,255,255,.72)!important;color:#22363b!important;border:1px solid var(--nj-line)!important;box-shadow:none!important}
.latest-layout,.category-layout{display:grid!important;grid-template-columns:minmax(0,1.42fr) minmax(330px,.58fr)!important;gap:24px!important}
.latest-lead .card,.category-lead .card{display:block!important;background:transparent!important;border:0!important;box-shadow:none!important;backdrop-filter:none!important}
.latest-lead .thumb,.category-lead .thumb{height:390px!important;border-radius:25px!important}
.latest-lead .card-body,.category-lead .card-body{padding:17px 2px 0!important;background:transparent!important}
.latest-lead .card h3,.category-lead .card h3{font-size:clamp(24px,2.2vw,33px)!important;line-height:1.45!important;letter-spacing:-1px!important;color:#142428!important}
.latest-lead .excerpt,.category-lead .excerpt{display:block!important;font-size:12px!important;line-height:1.85!important;color:#6f7f83!important}
.latest-stack,.category-stack{display:grid!important;align-content:start!important;gap:0!important;border-top:1px solid var(--nj-line)!important}
.latest-stack .mini,.category-stack .mini{
  background:transparent!important;border:0!important;border-bottom:1px solid var(--nj-line)!important;
  box-shadow:none!important;border-radius:0!important;padding:15px 0!important;
  grid-template-columns:112px 1fr!important;
}
.latest-stack .mini-thumb,.category-stack .mini-thumb{height:88px!important;border-radius:15px!important}
.latest-stack .mini h4,.category-stack .mini h4{font-size:14px!important;line-height:1.55!important;color:#192d32!important}
.latest-stack .tag,.category-stack .tag{display:none!important}

/* Generic cards */
.card{background:transparent!important;border:0!important;box-shadow:none!important;backdrop-filter:none!important}
.card:hover{transform:translateY(-2px)!important}
.thumb{border-radius:22px!important;height:210px!important}
.card-body{padding:14px 2px 0!important;background:transparent!important}
.card h3{font-size:18px!important;line-height:1.55!important;color:#192d32!important}
.tag{background:transparent!important;border:0!important;padding:0!important;color:#0c7f85!important;font-size:9px!important;font-weight:900!important}
.meta{font-size:9px!important;color:#8d989b!important}
.excerpt{color:#6f7e82!important}

/* Article */
.article-wrap{grid-template-columns:minmax(0,1fr) 285px!important;gap:24px!important}
.article{
  margin-top:24px!important;
  padding:clamp(28px,5vw,66px)!important;
  border-radius:30px!important;
  background:rgba(255,255,255,.80)!important;
  border:1px solid rgba(255,255,255,.96)!important;
  box-shadow:0 22px 60px rgba(25,48,54,.08)!important;
}
.article h1{font-size:clamp(42px,5vw,70px)!important;line-height:1.12!important;letter-spacing:-2.6px!important;color:#11191b!important}
.article-cover{border-radius:23px!important}
.article-body{max-width:820px;font-size:18px!important;line-height:2.22!important;color:#2a4045!important}
.article-aside{border-radius:22px!important;background:rgba(255,255,255,.74)!important;border:1px solid rgba(255,255,255,.95)!important;box-shadow:var(--nj-shadow-soft)!important}

/* Editorial */
.editor-shell{width:min(1440px,calc(100% - 28px))!important;margin-top:18px!important}
.dash-top,.panel,.stat,.login{
  background:rgba(255,255,255,.80)!important;
  border:1px solid rgba(255,255,255,.96)!important;
  box-shadow:0 18px 52px rgba(25,48,54,.08)!important;
}
.dash-top{border-radius:26px!important;padding:22px 24px!important}
.panel{border-radius:24px!important;padding:20px!important}
.dash-grid{grid-template-columns:minmax(390px,.72fr) minmax(0,1.28fr)!important;gap:18px!important}
.composer{top:112px!important}
.field input,.field textarea,.field select,.editor-list-tools input{
  background:#fbfcfa!important;color:#1b3035!important;border:1px solid rgba(16,23,24,.10)!important;
  box-shadow:none!important;border-radius:13px!important;
}
.field label{color:#53676c!important;font-weight:750!important}
.smart-action{background:#f1f6f4!important;color:#1d363c!important;border:1px solid rgba(16,23,24,.08)!important;border-radius:12px!important}
.insight{background:#f7faf8!important;border:1px solid rgba(16,23,24,.07)!important;border-radius:13px!important}
.tiny{background:#f7faf8!important;color:#243b40!important;border-color:rgba(16,23,24,.09)!important}
.preview-card{background:#fbfcfa!important;border-color:rgba(16,23,24,.08)!important}

/* Footer */
.footer{margin-top:82px!important;padding:30px 0 42px!important;border-top:1px solid var(--nj-line)!important;color:#758589!important}
.footer b{color:#101718!important}

/* Tablet */
@media(max-width:1080px){
  .feature-hero,.feature-hero-3d{grid-template-columns:minmax(0,1fr) minmax(340px,.80fr)!important;min-height:470px!important;padding:22px!important}
  .premium-stage{min-height:420px!important}.stage-card{min-height:310px!important}.stage-card .feature-media,.brand-card{min-height:310px!important}
  .latest-layout,.category-layout{grid-template-columns:1fr!important}
  .latest-stack,.category-stack{grid-template-columns:repeat(2,1fr)!important;gap:12px!important;border-top:0!important}
  .latest-stack .mini,.category-stack .mini{border:1px solid var(--nj-line)!important;border-radius:17px!important;padding:9px!important}
  .dash-grid{grid-template-columns:1fr!important}.composer{position:static!important}
}

/* Mobile-first rebuild */
@media(max-width:760px){
  .wrap{width:calc(100% - 16px)!important}
  .top-inner{padding:6px 0 5px!important}.top-main{min-height:46px!important;grid-template-columns:1fr auto!important}.top-status{display:none!important}
  .brand-copy b{font-size:18px!important}.brand-copy small{display:none!important}.mark{width:35px!important;height:35px!important;font-size:18px!important}.editor-link{font-size:9px!important;padding:8px 10px!important}
  .nav{justify-content:flex-start!important;padding:5px 0 0!important}.nav a{font-size:9px!important;padding:6px 9px!important}
  .breaking-bar{grid-template-columns:auto minmax(0,1fr)!important;min-height:38px!important;margin:8px 0 10px!important}.breaking-code{display:none!important}.breaking-label{font-size:8px!important;padding-inline-end:8px!important}.breaking-track{padding:0 8px!important;font-size:9px!important;gap:18px!important}
  .feature-hero,.feature-hero-3d{
    display:flex!important;
    flex-direction:column!important;
    min-height:auto!important;
    padding:12px!important;
    border-radius:24px!important;
  }
  .premium-stage{order:1!important;min-height:292px!important;width:100%!important}
  .feature-copy{order:2!important;padding:16px 12px 12px!important}
  .stage-card{width:80%!important;height:220px!important;min-height:220px!important;transform:rotateY(-4deg) rotateX(1deg) translateZ(22px)!important}
  .stage-card .feature-media,.brand-card{min-height:220px!important;border-radius:21px!important}
  .stage-sheet{width:68%!important;height:67%!important;border-radius:20px!important}
  .stage-back{transform:translate3d(-12px,9px,-65px) rotate(-5deg)!important}.stage-mid{transform:translate3d(10px,-3px,-32px) rotate(4deg)!important}
  .chip-a{right:0!important;top:22%!important}.chip-b{left:0!important;bottom:18%!important}.stage-chip{padding:8px 9px!important}
  .brand-card{padding:20px!important}.brand-3d-word{font-size:62px!important}.brand-3d-sub{font-size:16px!important}.brand-3d-caption{font-size:6px!important}
  .feature-copy h1{font-size:clamp(34px,10.2vw,47px)!important;line-height:1.05!important;letter-spacing:-2.2px!important;margin:12px 0 9px!important}
  .feature-copy p{font-size:12.8px!important;line-height:1.82!important}
  .feature-actions{margin-top:14px!important}.btn{min-height:39px!important;font-size:10px!important;padding:0 13px!important}
  .feature-meta{margin-top:14px!important;padding-top:10px!important;gap:10px!important;font-size:8px!important}.feature-meta span:last-child{display:none!important}
  .quick-strip{display:flex!important;overflow-x:auto!important;scroll-snap-type:x mandatory!important;gap:0!important;scrollbar-width:none!important}.quick-strip::-webkit-scrollbar{display:none!important}.quick-story{flex:0 0 82%!important;scroll-snap-align:start!important;border-bottom:0!important}
  .section{margin-top:46px!important}.section-head{padding-bottom:11px!important;margin-bottom:15px!important}.section-title{font-size:27px!important}.section-index{font-size:7px!important}.section-sub{font-size:9px!important}.searchbar{display:none!important}
  .latest-layout,.category-layout{display:block!important}.latest-lead .thumb,.category-lead .thumb{height:57vw!important;min-height:220px!important;border-radius:21px!important}.latest-lead .card h3,.category-lead .card h3{font-size:21px!important}.latest-lead .excerpt,.category-lead .excerpt{font-size:11px!important}
  .latest-stack,.category-stack{display:flex!important;overflow-x:auto!important;scroll-snap-type:x mandatory!important;gap:9px!important;margin-top:16px!important;scrollbar-width:none!important}.latest-stack::-webkit-scrollbar,.category-stack::-webkit-scrollbar{display:none!important}
  .latest-stack .mini,.category-stack .mini{flex:0 0 84%!important;scroll-snap-align:start!important;grid-template-columns:100px 1fr!important;padding:8px!important;background:rgba(255,255,255,.46)!important}.latest-stack .mini-thumb,.category-stack .mini-thumb{height:82px!important}.latest-stack .mini h4,.category-stack .mini h4{font-size:12.5px!important}
  .article-wrap{display:block!important}.article{margin-top:12px!important;padding:21px 15px!important;border-radius:22px!important}.article h1{font-size:clamp(33px,9vw,47px)!important;letter-spacing:-1.5px!important}.article-body{font-size:16.5px!important;line-height:2.12!important}.article-aside{position:static!important;margin-top:12px!important}
  .editor-shell{width:calc(100% - 10px)!important;margin-top:5px!important}.dash-top{padding:15px!important;border-radius:20px!important}.panel{padding:13px!important;border-radius:20px!important}.stats{display:flex!important;overflow-x:auto!important;gap:8px!important;scrollbar-width:none!important}.stat{flex:0 0 43%!important;min-width:124px!important}.smartbar{grid-template-columns:1fr!important}.insights{grid-template-columns:1fr 1fr!important}.field input,.field textarea,.field select{font-size:16px!important}
}
@media(max-width:430px){
  .wrap{width:calc(100% - 12px)!important}
  .premium-stage{min-height:270px!important}.stage-card{width:82%!important;height:204px!important;min-height:204px!important}.stage-card .feature-media,.brand-card{min-height:204px!important}
  .feature-copy{padding:14px 8px 10px!important}.feature-copy h1{font-size:clamp(32px,10vw,44px)!important}.feature-copy p{font-size:12.3px!important}
  .quick-story{flex-basis:87%!important}.latest-stack .mini,.category-stack .mini{flex-basis:88%!important}
}
/* Landscape phones/tablets: keep hero text above the fold */
@media(max-height:700px) and (min-width:761px){
  .top-inner{padding:5px 0 4px!important}.top-main{min-height:45px!important}
  .breaking-bar{min-height:34px!important;margin:7px 0 8px!important}
  .feature-hero,.feature-hero-3d{min-height:360px!important;padding:16px 20px!important}
  .feature-copy{padding:18px 26px!important}.feature-copy h1{font-size:clamp(34px,4vw,54px)!important;letter-spacing:-2.4px!important;margin:9px 0 7px!important}.feature-copy p{font-size:12px!important;line-height:1.72!important}.feature-actions{margin-top:12px!important}.feature-meta{margin-top:10px!important;padding-top:8px!important}
  .premium-stage{min-height:330px!important}.stage-card{width:70%!important;height:74%!important;min-height:250px!important}.stage-card .feature-media,.brand-card{min-height:250px!important}.stage-sheet{height:64%!important;width:64%!important}
  .chip-a{right:0!important}.chip-b{left:0!important}
}
`;
