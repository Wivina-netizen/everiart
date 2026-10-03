import { mkdirSync, writeFileSync } from 'node:fs';
import { arrowIcon } from './navigation.mjs';
const directionIcon = path => `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${path}"/></svg>`;
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

// Existing clips are the short cuts; retain the published reel as a fallback.
export function studioReels(projects) {
  return projects.filter(p => p.published).flatMap(p => {
    const sources = p.clips?.length ? p.clips : p.reel ? [p.reel] : [];
    return sources.map((src, i) => ({ src, slug:p.slug, poster:p.thumb, name:p.name, discipline:p.discipline, label:sources.length > 1 ? `Cut ${i + 1}` : 'Reel' }));
  });
}

export function generateStudioPortfolios({ studios, published, head, nav, foot, tail, cards }) {
  for (const studio of studios) {
    const projects = published.filter(p => p.studio === studio.id);
    const reels = studioReels(projects);
    for (const view of ['work', 'reels']) {
      const tabs = `<nav class="portfolio-views" aria-label="Portfolio view"><a href="/experience/${studio.id}/work/"${view === 'work' ? ' aria-current="page"' : ''}>Portfolio</a><a href="/experience/${studio.id}/reels/"${view === 'reels' ? ' aria-current="page"' : ''}>Reels</a></nav>`;
      const reelContent = reels.length ? `<div class="reels-browser">
        <div class="reels-feed" tabindex="0" role="region" aria-label="${esc(studio.name)} reels. Scroll for the next film.">
          ${reels.map((reel, i) => `<article class="reel-card" aria-label="${esc(reel.name)} — ${esc(reel.label)}" data-reel-index="${i}">
            <div class="reel-top"><span>${esc(studio.name)}</span><span>${String(i + 1).padStart(2,'0')} / ${String(reels.length).padStart(2,'0')}</span></div>
            <video controls playsinline preload="none" poster="/${esc(reel.poster)}" aria-label="Play ${esc(reel.name)} ${esc(reel.label)}"><source src="${esc(reel.src)}" type="video/mp4">Your browser cannot play this film.</video>
            <div class="reel-caption"><div><p>${esc(reel.discipline)} · ${esc(reel.label)}</p><h2>${esc(reel.name)}</h2></div><a href="/work/${esc(reel.slug)}/" aria-label="View ${esc(reel.name)} project">View project ${arrowIcon}</a></div>
            <p class="reel-error" role="status" hidden>This film couldn’t load. You can still explore the project.</p>
          </article>`).join('')}
        </div>
        <div class="reels-controls" hidden><button type="button" data-reel-prev aria-label="Previous reel">${directionIcon("M12 20V4m-6 6 6-6 6 6")}</button><p data-reel-position role="status">1 / ${reels.length}</p><button type="button" data-reel-next aria-label="Next reel">${directionIcon("M12 4v16m-6-6 6 6 6-6")}</button></div>
        <p class="reels-hint">Scroll to explore. Press play to watch.</p>
      </div>` : `<div class="reels-empty"><p class="eyebrow">${esc(studio.name.toUpperCase())}</p><h2>Still a lot<br><i>to discover.</i></h2><p>No reels here yet. Explore the portfolio in the meantime.</p><a class="solid-link" href="/experience/${studio.id}/work/">Explore the portfolio ${arrowIcon}</a></div>`;
      const html = head(`${studio.name} — ${view === 'work' ? 'Portfolio' : 'Reels'}`, `${studio.line} Explore the ${view === 'work' ? 'portfolio' : 'reels'}.`) + `<body class="studio-page ${studio.id === 'byeveriart' ? 'night' : 'paper'}">${nav('experience')}<main id="main"><header class="portfolio-intro page-width"><a class="back-link" href="/experience/${studio.id}/">${directionIcon("M20 12H4m6-6-6 6 6 6")} ${studio.name}</a><p class="eyebrow">${studio.type.toUpperCase()}</p><h1>${view === 'work' ? 'A closer look.' : 'In motion.'}</h1>${tabs}</header><section class="portfolio-content page-width" aria-label="${view === 'work' ? 'Projects' : 'Reels'}">${view === 'work' ? `<div class="project-grid">${cards(projects)}</div>` : reelContent}</section></main>${foot}<script type="module" src="/js/reels.js"></script>` + tail;
      const path = `experience/${studio.id}/${view}`;
      mkdirSync(path, {recursive:true}); writeFileSync(`${path}/index.html`, html);
    }
  }
}
