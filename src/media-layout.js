export const mediaLayoutStyles = `
/* All news media share one frame, including archives and curated sections. */
:root { --news-media-ratio: 16 / 9; --news-card-gap: 24px; }
.media-link[data-news-frame] {
  display: block; position: relative; isolation: isolate; overflow: hidden;
  width: 100%; height: auto; aspect-ratio: var(--news-media-ratio);
  border-radius: 14px; background: #e8efed; padding: 0;
}
.media-link[data-news-frame] > :is(img, video) {
  position: absolute; inset: 0; display: block; width: 100%; height: 100%;
  min-height: 0; max-height: none; border-radius: 0; object-fit: cover;
}
.media-link[data-news-frame] > video {
  object-fit: contain; background: transparent; transform: none;
}
.story-video[data-news-frame] { background: #17333a; }
.video-backdrop {
  position: absolute; inset: -8%; width: 116%; height: 116%;
  filter: blur(22px) brightness(.65); pointer-events: none;
}
.video-backdrop[hidden] { display: none; }
.story-video-play { min-width: 64px; min-height: 64px; padding: 10px; }
.complement-story .story-video-play,
.editors-picks .news-grid[data-count="3"] > .story-card:not(:first-child) .story-video-play {
  min-width: 64px; min-height: 64px; padding: 10px;
}
.complement-story .story-video-play span,
.editors-picks .news-grid[data-count="3"] > .story-card:not(:first-child) .story-video-play span {
  display: block;
}

/* A shorter masthead brings the first row of news into view. */
.edition-frontpage { padding-bottom: 24px; }
.edition-hero-compact {
  min-height: 72px; padding: 8px 20px; margin-bottom: 18px;
  grid-template-columns: minmax(0, 1fr) 64px; column-gap: 15px;
}
.edition-hero-compact h2 { font-size: 22px; }
.edition-hero-compact .eyebrow, .edition-hero-compact .edition-hero-copy > p { display: none; }
.edition-hero-compact .signature-art { width: 64px; height: 56px; margin: 0; }
.edition-hero-compact:before { opacity: .35; }

.frontpage-grid, .frontpage-grid[data-timeline="false"], .news-grid,
.editors-picks .news-grid[data-count="3"] {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--news-card-gap); align-items: stretch;
}
.frontpage-grid[data-count="2"], .news-grid[data-count="2"] {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.frontpage-grid[data-count="1"], .news-grid[data-count="1"] {
  grid-template-columns: 1fr; max-width: 680px; margin-inline: auto;
}
.frontpage-complements { display: contents; }
.frontpage-lead, .complement-story, .story-card, .lead-story,
.editors-picks .news-grid[data-count="3"] > .story-card:first-child,
.editors-picks .news-grid[data-count="3"] > .story-card:not(:first-child) {
  display: flex; flex-direction: column; min-width: 0; grid-row: auto;
  padding: 14px 14px 18px; border: 1px solid #dce7e5; border-radius: 19px;
  background: linear-gradient(135deg, #ffffffee, #fbfdfbd9);
}
.frontpage-lead-copy { display: contents; }
.frontpage-lead h1, .complement-story h2, .story-card h3, .lead-story h3,
.editors-picks .news-grid[data-count="3"] > .story-card:first-child h3,
.editors-picks .news-grid[data-count="3"] > .story-card:not(:first-child) h3 {
  font-size: 23px; line-height: 1.75; font-weight: 850; letter-spacing: -.4px;
  margin: 9px 0; overflow-wrap: anywhere; display: -webkit-box;
  -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.frontpage-lead .story-meta, .complement-story .story-meta, .story-card .story-meta,
.editors-picks .news-grid[data-count="3"] > .story-card:not(:first-child) .story-meta {
  margin: 12px 0 0; font-size: 12px; gap: 6px 10px;
}
.complement-story .story-meta time, .complement-story .story-meta > span:not(.story-format) { display: inline; }
.frontpage-lead-copy > p, .complement-story .excerpt, .story-card .excerpt {
  font-size: 14px; line-height: 2; color: #526c77; margin: 0 0 12px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.frontpage-lead-copy > .text-link, .complement-story > .text-link { margin-top: auto; padding-top: 8px; }
.editors-picks .story-card .media-link[data-news-frame] { border: 0; box-shadow: none; }
.editors-picks .news-grid[data-count="3"] > .story-card:not(:first-child) .excerpt { display: -webkit-box; }
.news-timeline { grid-column: 1 / -1; }
.news-timeline ol { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0 24px; }

.daily-brief { padding: 22px 26px; gap: 25px; grid-template-columns: minmax(210px, .8fr) minmax(0, 2fr); }
.brief-clock { display: none; }
.brief-intro h2 { font-size: 25px; line-height: 1.7; }
.brief-intro > p:not(.heading-number) { margin-top: 7px; }
.brief-intro > .text-link { margin-top: 6px; }
.daily-brief[data-count="1"] .brief-stories { align-self: center; }

.dossier-panel { display: block; padding: 24px; }
.dossier-intro h2 { font-size: 29px; }
.dossier-count { margin-top: 12px; }
.dossier-stories { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; margin-top: 22px; }
.dossier-stories article { display: flex; flex-direction: column; align-items: stretch; gap: 10px; border: 0; padding: 0; min-width: 0; }
.dossier-stories h3 { font-size: 20px; line-height: 1.8; }
.topic-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.topic-grid .topic-card[data-topic] { grid-column: span 1; min-height: 112px; padding: 20px; display: flex; gap: 14px; border-radius: 15px; }
.topic-grid .topic-card .topic-icon { width: 38px; height: 38px; margin: 0; }
.topic-grid .topic-card h3 { font-size: 18px; }
.topic-grid .topic-card .topic-copy { max-width: 100%; }
.topic-watermark { display: none; }

.reader-video.reader-video-lead { padding: 0; background: transparent; border: 0; margin: 14px 0 26px; }
.reader-video.reader-video-lead .reader-video-label { margin-bottom: 9px; }
.reader-video.reader-video-lead figcaption { font-size: 14px; }
.reader-page .article-cover .article-cover-frame { border-radius: 14px; }
.reader-page .article-cover .article-cover-frame[data-news-frame] > img { max-height: none; border-radius: 0; }

@media (max-width: 900px) {
  .frontpage-grid, .frontpage-grid[data-timeline="false"], .news-grid,
  .editors-picks .news-grid[data-count="3"], .dossier-stories { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .topic-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .news-timeline ol { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 600px) {
  :root { --news-card-gap: 20px; }
  .edition-hero-compact { min-height: 58px; padding: 8px 13px; margin-bottom: 15px; grid-template-columns: minmax(0, 1fr) 44px; }
  .edition-hero-compact h2 { font-size: 18px; }
  .edition-hero-compact .signature-art { width: 44px; height: 40px; margin: 0; }
  .frontpage-grid, .frontpage-grid[data-timeline="false"], .frontpage-grid[data-count="2"],
  .news-grid, .news-grid[data-count="2"], .editors-picks .news-grid[data-count="3"], .dossier-stories { grid-template-columns: 1fr; }
  .frontpage-lead, .complement-story, .story-card, .lead-story,
  .editors-picks .news-grid[data-count="3"] > .story-card:not(:first-child) { padding: 10px 10px 16px; border-radius: 16px; }
  .frontpage-lead h1, .complement-story h2, .story-card h3,
  .editors-picks .news-grid[data-count="3"] > .story-card:first-child h3,
  .editors-picks .news-grid[data-count="3"] > .story-card:not(:first-child) h3 { font-size: 22px; }
  .news-timeline ol { grid-template-columns: 1fr; }
  .daily-brief { padding: 20px; gap: 16px; grid-template-columns: 1fr; }
  .brief-intro h2 { font-size: 24px; }
  .brief-intro > p:not(.heading-number) { display: none; }
  .brief-intro > .text-link { margin-top: 2px; }
  .dossier-panel { padding: 20px; }
  .topic-grid .topic-card[data-topic] { min-height: 122px; padding: 17px; display: block; }
  .topic-grid .topic-card .topic-icon { margin-bottom: 10px; }
  .topic-grid .topic-card h3 { font-size: 17px; }
  .topic-grid .topic-card p { font-size: 12px; }
}
`;

export const videoPreviewScript = `
(() => {
  const videos = [...document.querySelectorAll('[data-video-preview]')];
  if (!videos.length) return;
  const loadPreview = video => {
    if (video.dataset.previewLoaded) return;
    video.dataset.previewLoaded = 'true';
    video.preload = 'metadata';
    if (video.paused && video.readyState === 0 && video.networkState !== 2) video.load();
  };
  videos.forEach(video => {
    const frame = video.closest('[data-news-frame]');
    const canvas = frame?.querySelector('[data-video-backdrop]');
    if (!canvas) return;
    let captured = false;
    let previewSeek = false;
    const capture = () => {
      if (captured || video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;
      if (previewSeek && video.seeking) return;
      const context = canvas.getContext('2d');
      if (!context) return;
      canvas.width = 960; canvas.height = 540;
      const cover = Math.max(960 / video.videoWidth, 540 / video.videoHeight) * 1.12;
      const contain = Math.min(960 / video.videoWidth, 540 / video.videoHeight);
      context.fillStyle = '#17333a'; context.fillRect(0, 0, 960, 540);
      context.filter = 'blur(20px) brightness(.7)';
      context.drawImage(video, (960 - video.videoWidth * cover) / 2, (540 - video.videoHeight * cover) / 2, video.videoWidth * cover, video.videoHeight * cover);
      context.filter = 'none';
      context.drawImage(video, (960 - video.videoWidth * contain) / 2, (540 - video.videoHeight * contain) / 2, video.videoWidth * contain, video.videoHeight * contain);
      canvas.hidden = false;
      captured = true;
      if (!video.hasAttribute('poster')) {
        try { video.poster = canvas.toDataURL('image/jpeg', .82); } catch { /* External videos may not allow canvas export. */ }
      }
      if (previewSeek && video.paused) video.currentTime = 0;
      previewSeek = false;
    };
    video.addEventListener('loadedmetadata', () => {
      if (!video.hasAttribute('poster') && video.paused && video.currentTime === 0 && Number.isFinite(video.duration) && video.duration > 0) {
        previewSeek = true;
        video.currentTime = Math.min(.5, video.duration / 2);
      }
    });
    video.addEventListener('loadeddata', capture);
    video.addEventListener('seeked', capture);
    video.addEventListener('playing', capture);
    video.addEventListener('play', () => {
      if (previewSeek) { previewSeek = false; video.currentTime = 0; }
    });
    capture();
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        loadPreview(entry.target);
        observer.unobserve(entry.target);
      });
    }, {rootMargin: '160px'});
    videos.forEach(video => observer.observe(video));
  } else videos.forEach(loadPreview);
})();
`;
